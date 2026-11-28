/* ============================================================================
   CLUBBAAS: de pagina van de voetbalmanager (clubbaas.html).
   Alles wat telt (munten, training, antwoorden, transfers, de wedstrijden) doet
   de server (server/clubbaas.js); deze pagina laat het zien en stuurt keuzes door.
   De regels, het shirt en het logo staan in clubbaas-data.js.

   Schermen (tabbladen): clubhuis, vragen, opstelling, wedstrijd, stand, transfers, club.
   Lokaal testen zonder Microsoft: clubbaas.html?test=naam (de server staat dat
   alleen op localhost toe).
   ============================================================================ */
(function(){
  'use strict';
  var C = window.CLUBBAAS, R = C.REGELS;
  var q = new URLSearchParams(location.search), TEST = /^[a-z0-9]{1,20}$/.test(q.get('test') || '') ? q.get('test') : '';
  var $ = function(id){ return document.getElementById(id); };
  function esc(t){ return String(t == null ? '' : t).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function api(pad, body){
    var u = '/api/clubbaas' + pad;
    if (TEST) u += (u.indexOf('?') >= 0 ? '&' : '?') + 'test=' + TEST;
    var o = body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), credentials: 'same-origin' } : { credentials: 'same-origin' };
    return fetch(u, o).then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ j = j || {}; j._status = r.status; return j; }); })
      .catch(function(){ return { _status: 0, fout: 'geen verbinding met de server' }; });
  }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e){ return null; } }
  function duur(ms){
    ms = Math.max(0, ms); var s = Math.ceil(ms / 1000), d = Math.floor(s / 86400), u = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    if (d) return d + ' d' + (u ? ' ' + u + ' u' : '');
    if (u) return u + ' u' + (m ? ' ' + m + ' min' : '');
    if (m >= 10 || (m && !r)) return m + ' min';
    return m ? m + ' min ' + r + ' s' : r + ' s';
  }
  function munt(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  var MAAND = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  function tijdTekst(t){ var d = new Date(t); return ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'][d.getDay()] + ' ' + d.getDate() + ' ' + MAAND[d.getMonth()] + ' om ' + d.getHours() + '.' + String(d.getMinutes()).padStart(2, '0'); }
  function melding(t){ var m = $('cbMelding'); m.textContent = t; m.hidden = !t; clearTimeout(melding.k); melding.k = setTimeout(function(){ m.hidden = true; }, 4000); }

  var club = null, liga = null, scherm = 'huis', klokVerschil = 0;
  function nu(){ return Date.now() + klokVerschil; }
  var VAKKEN = [['reken', 'Rekenen'], ['ned', 'Nederlands'], ['eng', 'Engels'], ['wis', 'Wiskunde'], ['ges', 'Geschiedenis'], ['aard', 'Aardrijkskunde'], ['bio', 'Biologie'], ['burg', 'Mens en maatschappij'], ['eco', 'Economie']];
  var NIVEAUS = [[1, 'vmbo-bb'], [2, 'vmbo-kgt'], [3, 'havo'], [4, 'vwo']];
  var POSVOLG = { KEE: 0, VER: 1, MID: 2, AAN: 3 }, POSKORT = { KEE: 'keeper', VER: 'verdediger', MID: 'middenvelder', AAN: 'aanvaller' };
  function watTekst(wat){ var m = /^tr\.(\w+)$/.exec(wat); if (m){ var t = C.TRAINING.filter(function(x){ return x.id === m[1]; })[0]; return 'Training ' + (t ? t.naam.toLowerCase() : m[1]); } return wat === 'complex' ? 'Trainingscomplex' : wat === 'stadion' ? 'Stadion' : wat; }
  function gezicht(naam, maat, pos){ return '<span class="cb-gz" style="--ring:' + (C.POSKLEUR[pos] || '#83A5F2') + '">' + (window.AVATAR ? AVATAR.svg(naam, maat) : '') + '</span>'; }
  function fitKleur(f){ return f >= 80 ? '#83A5F2' : f >= 60 ? '#EA9836' : '#F26749'; }
  function fitBalk(f){ return '<span class="cb-fit" title="fit ' + f + '%"><i style="width:' + f + '%;background:' + fitKleur(f) + '"></i></span>'; }
  function logo(c, maat, label){ return C.logoSvg(c.logo, c.k1, c.k2, maat, label ? esc(label) : ''); }
  function speler(id){ return club.spelers.filter(function(s){ return s.id === id; })[0] || null; }
  function selectieFit(){ var b = club.basis.map(speler).filter(Boolean); return b.length ? Math.round(b.reduce(function(a, s){ return a + s.fit; }, 0) / b.length) : 100; }

  /* ---------- tabbladen ---------- */
  var SCHERMEN = [['huis', 'Clubhuis'], ['vragen', 'Vragen'], ['opstelling', 'Opstelling'], ['wedstrijd', 'Wedstrijd'], ['stand', 'Stand'], ['transfers', 'Transfers'], ['club', 'Club en tenue']];
  function tabs(){ $('cbTabs').innerHTML = SCHERMEN.map(function(s){ return '<button type="button" role="tab" data-s="' + s[0] + '" aria-selected="' + (scherm === s[0]) + '">' + s[1] + '</button>'; }).join(''); }
  function naar(s, extra){
    scherm = s; ls('cb-scherm', s);
    if (s !== 'wedstrijd') stopWedstrijd();
    tabs();
    SCHERMEN.forEach(function(x){ $('cb-' + x[0]).hidden = x[0] !== s; });
    ({ huis: tekenHuis, vragen: tekenVragen, opstelling: tekenOpstelling, wedstrijd: tekenWedstrijd, stand: tekenStand, transfers: tekenTransfers, club: tekenClub })[s](extra);
    var kop = $('cb-' + s).querySelector('h2'); if (kop && extra !== 'stil'){ kop.setAttribute('tabindex', '-1'); kop.focus({ preventScroll: true }); }
  }
  $('cbTabs').addEventListener('click', function(e){ var b = e.target.closest('[data-s]'); if (b) naar(b.getAttribute('data-s')); });
  $('cbTabs').addEventListener('keydown', function(e){
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var i = SCHERMEN.findIndex(function(s){ return s[0] === scherm; }), j = (i + (e.key === 'ArrowRight' ? 1 : -1) + SCHERMEN.length) % SCHERMEN.length;
    naar(SCHERMEN[j][0]); $('cbTabs').querySelector('[data-s="' + SCHERMEN[j][0] + '"]').focus();
  });
  document.addEventListener('click', function(e){ var b = e.target.closest('[data-naar]'); if (b) naar(b.getAttribute('data-naar'), b.getAttribute('data-job') || undefined); });

  /* ---------- de balk bovenaan ---------- */
  function tekenBalk(){
    var f = selectieFit();
    $('cbBalk').innerHTML =
      '<div class="cb-club">' + logo(club, 40) + '<div><span class="cb-hand">jouw club</span><b>' + esc(club.naam) + '</b></div></div>' +
      '<div class="cb-tel cb-munt"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#EA9836"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#0B1029" stroke-width="2"/></svg><div><b>' + munt(club.munten) + '</b><span>munten</span></div></div>' +
      '<div class="cb-tel cb-fitbalk" title="Hoe fit je basiself gemiddeld is. Na een wedstrijd herstellen spelers elk uur een beetje."><div><span>Fitheid basiself</span><b>' + f + '%</b></div><div class="cb-meter"><i style="width:' + f + '%;background:' + fitKleur(f) + '"></i></div></div>' +
      '<button type="button" class="cb-knop cb-koraal" data-naar="vragen">Vragen beantwoorden</button>';
  }

  /* ---------- clubhuis ---------- */
  function pips(n, max){ var s = ''; for (var i = 1; i <= 10; i++) s += '<i class="' + (i <= n ? 'aan' : i <= max ? '' : 'dicht') + '"></i>'; return '<span class="cb-pips" aria-label="niveau ' + n + ' van 10">' + s + '</span>'; }
  function upgradeKnop(wat, huidig){
    var bezig = club.jobs.filter(function(j){ return j.wat === wat; })[0];
    if (bezig) return '<span class="cb-bezig">' + (/^tr\./.test(wat) ? 'wordt getraind' : 'wordt gebouwd') + ': <span data-eind="' + bezig.eind + '">' + duur(bezig.eind - nu()) + '</span></span>';
    var bouw = wat === 'complex' || wat === 'stadion', naar = huidig + 1, max = wat === 'complex' ? R.complexMax : wat === 'stadion' ? R.stadionMax : R.maxTraining(club.complex);
    if (naar > max) return '<span class="cb-klein">' + (bouw || max >= 10 ? 'hoogste niveau' : 'max bij complex ' + club.complex) + '</span>';
    var k = wat === 'complex' ? R.complex(naar) : wat === 'stadion' ? R.stadion(naar) : R.training(naar);
    var vol = bouw ? club.jobs.some(function(j){ return j.wat === 'complex' || j.wat === 'stadion'; }) : club.jobs.filter(function(j){ return /^tr\./.test(j.wat); }).length >= R.trainingen(club.complex);
    var arm = club.munten < k.munten;
    return '<button type="button" class="cb-knop cb-oker" data-up="' + wat + '"' + (vol || arm ? ' disabled' : '') + ' title="' + (vol ? (bouw ? 'Er wordt al gebouwd' : 'Alle trainingsvelden zijn bezet') : arm ? 'Niet genoeg munten' : '') + '">' + (bouw ? 'Niveau ' + naar : 'Naar ' + naar) + ' · ' + munt(k.munten) + ' · ' + duur(k.tijd) + '</button>';
  }
  function stadionSvg(n){
    var s = '<svg viewBox="0 0 300 120" role="img" aria-label="Je stadion van boven, niveau ' + n + '"><rect x="4" y="4" width="292" height="112" rx="22" fill="rgba(251,246,241,.05)"/>';
    if (n >= 4) s += '<rect x="22" y="8" width="256" height="104" rx="18" fill="none" stroke="#83A5F2" stroke-width="2" stroke-dasharray="4 4" opacity=".6"/>';
    s += '<rect x="62" y="30" width="176" height="60" rx="3" fill="#204ECF"/><g stroke="#83A5F2" stroke-width="1.6" fill="none"><rect x="62" y="30" width="176" height="60"/><path d="M150 30v60M62 46h18v28H62M238 46h-18v28h18"/><circle cx="150" cy="60" r="10"/></g>';
    s += '<rect x="62" y="12" width="176" height="14" rx="4" fill="#F26749"/>';
    s += '<rect x="62" y="94" width="176" height="14" rx="4" fill="#F26749"' + (n >= 2 ? '' : ' opacity=".18"') + '/>';
    s += '<rect x="40" y="30" width="16" height="60" rx="4" fill="#EA9836"' + (n >= 3 ? '' : ' opacity=".15"') + '/><rect x="244" y="30" width="16" height="60" rx="4" fill="#EA9836"' + (n >= 3 ? '' : ' opacity=".15"') + '/>';
    if (n >= 5) [[30, 14], [270, 14], [30, 106], [270, 106]].forEach(function(p){ s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="#FBF6F1"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="10" fill="#FBF6F1" opacity=".18"/>'; });
    return s + '</svg>';
  }
  function nieuwsRegel(n){
    if (n.s === 'wedstrijd') return '<li>' + (n.u === 'w' ? 'Gewonnen' : n.u === 'g' ? 'Gelijk' : 'Verloren') + ' ' + (n.thuis ? 'thuis tegen ' : 'uit bij ') + esc(n.tegen) + ': ' + (n.thuis ? n.voor + '-' + n.tegenGoals : n.tegenGoals + '-' + n.voor) + '. +' + n.munten + ' munten. <button type="button" class="cb-link" data-kijk="' + esc(n.dag) + '|' + n.div + '|' + n.m + '">Terugkijken</button></li>';
    if (n.s === 'klaar') return '<li>Klaar: ' + esc(watTekst(n.wat)) + ' is nu niveau ' + n.naar + '.</li>';
    if (n.s === 'koop') return '<li>Gekocht: ' + esc(n.naam) + ' voor ' + munt(n.prijs) + ' munten.</li>';
    if (n.s === 'verkoop') return '<li>Verkocht: ' + esc(n.naam) + ' voor ' + munt(n.prijs) + ' munten.</li>';
    return '';
  }
  function tekenHuis(){
    var t = club, tg = liga && liga.tegen, l = liga || {};
    var stand = l.clubs || [], mij = stand.findIndex(function(x){ return x.jij; }), rij = stand.slice(Math.max(0, mij - 1), Math.max(0, mij - 1) + 3);
    var wedstrijd = '<div class="cb-kaart"><div class="cb-rij"><h3>' + (tg ? 'Speelronde ' + tg.ronde + ' van ' + R.rondes : 'Volgende wedstrijd') + '</h3><span class="cb-klein">' + (tg ? (tg.thuis ? 'thuis' : 'uit') : '') + '</span></div>' +
      '<span class="cb-klein">' + tijdTekst(l.volgende || C.volgendeWedstrijd(nu())) + '</span>' +
      (tg ? '<div class="cb-duel"><div>' + logo(tg.thuis ? t : tg, 46) + '<b>' + esc(tg.thuis ? t.naam : tg.naam) + '</b></div><span class="cb-tegen">tegen</span><div>' + logo(tg.thuis ? tg : t, 46) + '<b>' + esc(tg.thuis ? tg.naam : t.naam) + '</b></div></div>' : '') +
      '<div class="cb-aftel"><b id="cbAftel">' + duur((l.volgende || C.volgendeWedstrijd(nu())) - nu()) + '</b><span>tot de aftrap</span></div>' +
      '<button type="button" class="cb-knop cb-rand" data-naar="opstelling">Opstelling en tactiek kiezen</button>' +
      (l.daarna ? '<span class="cb-klein">Daarna: ' + tijdTekst(C.daarna(nu())) + ', ' + (l.daarna.thuis ? 'thuis tegen ' : 'uit bij ') + esc(l.daarna.naam) + '</span>' : '') + '</div>';
    var ministand = '<div class="cb-kaart"><div class="cb-rij"><h3>Divisie ' + (t.div || 1) + '</h3><button type="button" class="cb-link" data-naar="stand">hele stand</button></div>' +
      (rij.length ? '<ol class="cb-ministand">' + rij.map(function(x){ return '<li' + (x.jij ? ' class="jij"' : '') + '><span>' + (stand.indexOf(x) + 1) + '</span><i style="background:' + x.k1 + '"></i><b>' + esc(x.naam) + '</b><em>' + x.p + '</em></li>'; }).join('') + '</ol>' : '<p class="cb-klein">Na de eerste speelronde staat hier de stand.</p>') +
      '<p class="cb-klein">Na ' + R.rondes + ' speelrondes gaan de beste ' + R.promotie + ' een divisie omhoog.</p></div>';
    var sel = t.spelers.slice().sort(function(a, b){ return POSVOLG[a.pos] - POSVOLG[b.pos] || b.kw - a.kw; }).map(function(s){
      return '<div class="cb-sp' + (t.basis.indexOf(s.id) >= 0 ? ' basis' : '') + '">' + gezicht(s.naam, 30, s.pos) + '<b>' + esc(s.naam) + '</b><small>' + s.pos + ' · ' + s.kw + ' ' + fitBalk(s.fit) + '</small></div>';
    }).join('');
    var training = C.TRAINING.map(function(x){ var n = t.tr[x.id] || 1; return '<div class="cb-deel"><b>' + x.naam + '</b><span class="cb-klein">' + x.uit + '</span>' + pips(n, R.maxTraining(t.complex)) + upgradeKnop('tr.' + x.id, n) + '</div>'; }).join('');
    var velden = R.trainingen(t.complex), tjobs = t.jobs.filter(function(j){ return /^tr\./.test(j.wat); }), bjob = t.jobs.filter(function(j){ return !/^tr\./.test(j.wat); })[0], jobs = '';
    function jobHtml(j, kop){ var pct = Math.max(0, Math.min(100, 100 - 100 * (j.eind - nu()) / Math.max(1, j.duur))); return '<div class="cb-job"><div class="cb-job-kop"><b>' + kop + ' · ' + esc(watTekst(j.wat)) + ' ' + j.naar + '</b><span data-eind="' + j.eind + '">' + duur(j.eind - nu()) + '</span></div><div class="cb-meter"><i style="width:' + pct.toFixed(1) + '%"></i></div><button type="button" class="cb-knop cb-blauw" data-naar="vragen" data-job="' + j.id + '">Versnellen met vragen</button></div>'; }
    for (var i = 0; i < velden; i++) jobs += tjobs[i] ? jobHtml(tjobs[i], 'Veld ' + (i + 1)) : '<div class="cb-job cb-vrij">Trainingsveld ' + (i + 1) + ' is vrij. Kies hiernaast een training.</div>';
    if (bjob) jobs += jobHtml(bjob, 'Bouw');
    var nieuws = (t.nieuws || []).slice(0, 4).map(nieuwsRegel).join('');
    $('cb-huis').innerHTML = '<h2 class="sronly">Clubhuis</h2><div class="cb-huis">' +
      '<section class="cb-kol" aria-label="Volgende wedstrijd">' + wedstrijd + ministand + '</section>' +
      '<section class="cb-kol cb-midden" aria-label="Selectie en training">' +
        '<div class="cb-kaart"><div class="cb-rij"><h3>Je selectie</h3><span class="cb-klein">' + t.spelers.length + ' spelers · blauwe rand: in de basis</span></div><div class="cb-selectie">' + sel + '</div></div>' +
        '<div class="cb-kaart"><div class="cb-rij"><h3>Training</h3><span class="cb-klein">geldt voor het hele elftal</span></div><div class="cb-train">' + training + '</div></div></section>' +
      '<section class="cb-kol" aria-label="Stadion en complex">' +
        '<div class="cb-kaart"><div class="cb-rij"><h3>Stadion</h3><span class="cb-klein">niveau ' + t.stadion + '</span></div><div class="cb-stadion">' + stadionSvg(t.stadion) + '</div>' +
          '<b>' + munt(R.plaatsen(t.stadion)) + ' plaatsen</b><span class="cb-klein">Meer fans geven je elftal thuis een duwtje, en elke thuiswedstrijd levert ' + (20 * t.stadion) + ' munten extra op.' + (t.stadion < R.stadionMax ? ' Niveau ' + (t.stadion + 1) + ': ' + R.tribune(t.stadion + 1) + '.' : '') + '</span>' + upgradeKnop('stadion', t.stadion) + '</div>' +
        '<div class="cb-kaart"><div class="cb-rij"><h3>Trainingscomplex</h3><span class="cb-klein">niveau ' + t.complex + '</span></div><div class="cb-jobs">' + jobs + '</div>' +
          '<p class="cb-klein">Niveau ' + Math.min(R.complexMax, t.complex + 1) + ' tilt de training tot niveau ' + R.maxTraining(Math.min(R.complexMax, t.complex + 1)) + (R.trainingen(t.complex + 1) > velden ? ' en geeft een trainingsveld erbij' : '') + '.</p>' + upgradeKnop('complex', t.complex) + '</div>' +
        (nieuws ? '<div class="cb-kaart"><h3>Nieuws</h3><ul class="cb-nieuws">' + nieuws + '</ul></div>' : '') +
      '</section></div>';
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-up]'); if (!b || b.disabled) return;
    b.disabled = true;
    api('/upgrade', { wat: b.getAttribute('data-up') }).then(function(j){ if (j.club){ club = j.club; tekenBalk(); tekenHuis(); } else { melding(j.fout || 'Dat lukte niet.'); b.disabled = false; } });
  });
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-kijk]'); if (!b) return;
    var x = b.getAttribute('data-kijk').split('|'); wedKeuze = { dag: x[0], div: +x[1], m: +x[2] }; naar('wedstrijd');
  });

  /* ---------- vragen ---------- */
  var vraag = null, versnelJob = '';
  function tekenVragen(job){
    if (job && job !== 'stil') versnelJob = job;
    if (!club.jobs.some(function(j){ return j.id === versnelJob; })) versnelJob = club.jobs.length ? club.jobs.slice().sort(function(a, b){ return a.eind - b.eind; })[0].id : '';
    var vak = ls('cb-vak') || ls('tb-vak') || 'reken', niv = +(ls('cb-niv') || ls('tb-niv') || 2);
    var j = club.jobs.filter(function(x){ return x.id === versnelJob; })[0];
    $('cb-vragen').innerHTML = '<div class="cb-vragen"><aside class="cb-kol">' +
      '<div class="cb-kaart"><h2>Vragen beantwoorden</h2><p class="cb-klein">Elk goed antwoord: ' + R.perGoed[niv] + ' munten en tien minuten van je training of bouw.</p>' +
        '<label class="cb-veld"><span>Vak</span><select id="cbVak">' + VAKKEN.map(function(v){ return '<option value="' + v[0] + '"' + (v[0] === vak ? ' selected' : '') + '>' + v[1] + '</option>'; }).join('') + '</select></label>' +
        '<label class="cb-veld"><span>Niveau</span><select id="cbNiv">' + NIVEAUS.map(function(v){ return '<option value="' + v[0] + '"' + (v[0] === niv ? ' selected' : '') + '>' + v[1] + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="cb-kaart"><h3>Wat je versnelt</h3>' + (club.jobs.length ? '<label class="cb-veld"><span class="sronly">Training of bouw</span><select id="cbJob">' + club.jobs.map(function(x){ return '<option value="' + x.id + '"' + (x.id === versnelJob ? ' selected' : '') + '>' + esc(watTekst(x.wat)) + ' ' + x.naar + '</option>'; }).join('') + '</select></label>' +
        '<div class="cb-groot" id="cbJobTijd">' + (j ? duur(j.eind - nu()) : '') + '</div>' : '<p class="cb-klein">Er wordt nu niets getraind of gebouwd. Je verdient wel munten.</p>') + '</div>' +
      '<div class="cb-kaart"><div class="cb-rij"><span>Vandaag verdiend</span><b>' + club.dag + ' / ' + R.dagMax + '</b></div><div class="cb-meter"><i style="width:' + Math.min(100, club.dag / R.dagMax * 100) + '%;background:#EA9836"></i></div></div>' +
      '</aside><section class="cb-kaart cb-vraagvak" id="cbVraag" aria-live="polite"><p class="cb-klein">Even een vraag ophalen...</p></section></div>';
    $('cbVak').addEventListener('change', function(){ ls('cb-vak', this.value); nieuweVraag(); });
    $('cbNiv').addEventListener('change', function(){ ls('cb-niv', this.value); nieuweVraag(); });
    if ($('cbJob')) $('cbJob').addEventListener('change', function(){ versnelJob = this.value; tekenVragen('stil'); });
    if (vraag && vraag.vak === vak && !vraag.klaar) toonVraag(); else nieuweVraag();
  }
  function nieuweVraag(){
    var vak = ls('cb-vak') || ls('tb-vak') || 'reken', niv = +(ls('cb-niv') || ls('tb-niv') || 2);
    $('cbVraag').innerHTML = '<p class="cb-klein">Even een vraag ophalen...</p>';
    api('/vraag?vak=' + vak + '&niv=' + niv).then(function(j){
      if (!j.token){ $('cbVraag').innerHTML = '<p>' + esc(j.fout || 'Er kwam geen vraag.') + '</p><button type="button" class="cb-knop cb-rand" id="cbOpnieuw">Opnieuw</button>'; $('cbOpnieuw').onclick = nieuweVraag; return; }
      vraag = j; toonVraag();
    });
  }
  function toonVraag(){
    var v = vraag, naam = (VAKKEN.filter(function(x){ return x[0] === v.vak; })[0] || [0, ''])[1];
    $('cbVraag').innerHTML = '<div class="cb-rij"><span class="cb-label">' + esc(naam) + (v.deel ? ' · ' + esc(v.deel) : '') + '</span></div>' +
      '<p class="cb-vraag">' + esc(v.v) + '</p>' + (v.svg ? '<div class="cb-vraagbeeld">' + v.svg + '</div>' : '') +
      '<div class="cb-opties">' + v.o.map(function(o, i){ return '<button type="button" class="cb-optie" data-k="' + i + '"><b>' + 'ABCD'[i] + '</b>' + esc(o) + '</button>'; }).join('') + '</div><div id="cbUitleg"></div>';
    $('cbVraag').querySelectorAll('[data-k]').forEach(function(b){ b.addEventListener('click', kies); });
  }
  function kies(e){
    var b = e.currentTarget, k = +b.getAttribute('data-k'), v = vraag;
    if (v.klaar) return; v.klaar = true;
    $('cbVraag').querySelectorAll('[data-k]').forEach(function(x){ x.disabled = true; });
    api('/antwoord', { token: v.token, keuze: k, job: versnelJob }).then(function(j){
      if (j.club){ club = j.club; tekenBalk(); }
      $('cbVraag').querySelectorAll('[data-k]').forEach(function(x){ var tekst = x.textContent.slice(1); if (tekst === j.juist) x.classList.add('goed'); else if (+x.getAttribute('data-k') === k) x.classList.add('fout'); });
      var kop = j.goed ? 'Goed!' + (j.munten ? ' +' + j.munten + ' munten' : j.dagVol ? ' (je munten voor vandaag zijn op)' : '') + (j.sneller ? ', ' + Math.round(j.sneller / 60000) + ' minuten sneller' : '') : 'Helaas, het was: ' + j.juist;
      $('cbUitleg').innerHTML = '<div class="cb-uitleg ' + (j.goed ? 'goed' : 'fout') + '"><div><b>' + esc(kop) + '</b>' + (j.uitleg ? '<p>' + esc(j.uitleg) + '</p>' : '') + '</div><button type="button" class="cb-knop cb-room" id="cbVolgende">Volgende vraag</button></div>';
      $('cbVolgende').addEventListener('click', function(){ tekenVragen('stil'); });
      $('cbVolgende').focus({ preventScroll: true });
      var jt = $('cbJobTijd'), jb = club && club.jobs.filter(function(x){ return x.id === versnelJob; })[0]; if (jt) jt.textContent = jb ? duur(jb.eind - nu()) : 'Klaar!';
    });
  }

  /* ---------- opstelling en tactiek ---------- */
  var opst = null, gekozen = null, bewaarTimer = 0;
  /* op een smal scherm staat het veld rechtop: we spelen naar boven */
  function staand(){ return window.innerWidth < 720; }
  function veldLijnen(rechtop){
    if (rechtop) return '<svg viewBox="0 0 68 105" preserveAspectRatio="none" aria-hidden="true">' +
      [0, 21, 42, 63, 84].map(function(y){ return '<rect y="' + y + '" x="0" height="10.5" width="68" fill="#2457d8"/>'; }).join('') +
      '<g stroke="#83A5F2" stroke-width=".5" fill="none"><rect x="2" y="2" width="64" height="101" vector-effect="non-scaling-stroke"/><path d="M2 52.5h64" vector-effect="non-scaling-stroke"/><ellipse cx="34" cy="52.5" rx="8.5" ry="8.5" vector-effect="non-scaling-stroke"/>' +
      '<rect y="87" x="16" height="16" width="36" vector-effect="non-scaling-stroke"/><rect y="2" x="16" height="16" width="36" vector-effect="non-scaling-stroke"/></g></svg>';
    return '<svg viewBox="0 0 105 68" preserveAspectRatio="none" aria-hidden="true">' +
      [0, 21, 42, 63, 84].map(function(x){ return '<rect x="' + x + '" y="0" width="10.5" height="68" fill="#2457d8"/>'; }).join('') +
      '<g stroke="#83A5F2" stroke-width=".5" fill="none" vector-effect="non-scaling-stroke"><rect x="2" y="2" width="101" height="64" vector-effect="non-scaling-stroke"/><path d="M52.5 2v64" vector-effect="non-scaling-stroke"/><ellipse cx="52.5" cy="34" rx="8.5" ry="8.5" vector-effect="non-scaling-stroke"/>' +
      '<rect x="2" y="16" width="16" height="36" vector-effect="non-scaling-stroke"/><rect x="2" y="25" width="5.5" height="18" vector-effect="non-scaling-stroke"/><rect x="87" y="16" width="16" height="36" vector-effect="non-scaling-stroke"/><rect x="97.5" y="25" width="5.5" height="18" vector-effect="non-scaling-stroke"/></g>' +
      '<rect x="0" y="29" width="2" height="10" fill="#FBF6F1" opacity=".7"/><rect x="103" y="29" width="2" height="10" fill="#FBF6F1" opacity=".7"/></svg>';
  }
  function herschik(basis, formatie){
    var pool = basis.map(speler).filter(Boolean), uit = [];
    var pl = C.plekken(formatie);
    pl.forEach(function(p, i){ var k = pool.filter(function(s){ return s.pos === p.pos; }).sort(function(a, b){ return b.kw - a.kw; })[0]; if (k){ uit[i] = k.id; pool.splice(pool.indexOf(k), 1); } });
    pl.forEach(function(p, i){ if (!uit[i]){ var k = pool.shift(); uit[i] = k ? k.id : ''; } });
    return uit;
  }
  function tekenOpstelling(){
    if (!opst) opst = { formatie: club.formatie, basis: club.basis.slice(), tactiek: Object.assign({}, club.tactiek) };
    var pl = C.plekken(opst.formatie), tg = liga && liga.tegen, rechtop = staand();
    var plekken = pl.map(function(p, i){
      var s = speler(opst.basis[i]); if (!s) return '';
      var fout = s.pos !== p.pos, kies = gekozen && gekozen.veld && gekozen.i === i;
      return '<button type="button" class="cb-plek' + (kies ? ' kies' : '') + (fout ? ' fout' : '') + '" data-plek="' + i + '" style="' + (rechtop ? 'left:' + p.y + '%;top:' + (95 - p.x * 1.1).toFixed(1) + '%' : 'left:' + (5 + p.x * 1.1).toFixed(1) + '%;top:' + p.y + '%') + '" aria-pressed="' + !!kies + '" aria-label="' + esc(s.naam) + ', ' + POSKORT[s.pos] + ', op de plek van ' + POSKORT[p.pos] + ', kwaliteit ' + s.kw + ', fit ' + s.fit + ' procent">' +
        gezicht(s.naam, rechtop ? 32 : 40, p.pos) + '<span class="cb-naam">' + esc(s.naam) + '</span><small>' + (fout ? 'geen ' + POSKORT[p.pos] : s.pos + ' · ' + s.kw + ' · fit ' + s.fit + '%') + '</small></button>';
    }).join('');
    var bank = club.spelers.filter(function(s){ return opst.basis.indexOf(s.id) < 0; }).sort(function(a, b){ return POSVOLG[a.pos] - POSVOLG[b.pos] || b.kw - a.kw; }).map(function(s){
      var kies = gekozen && !gekozen.veld && gekozen.id === s.id;
      return '<button type="button" class="cb-bankrij' + (kies ? ' kies' : '') + '" data-bank="' + s.id + '" aria-pressed="' + !!kies + '">' + gezicht(s.naam, 26, s.pos) + '<b>' + esc(s.naam) + '</b><small>' + s.pos + ' · ' + s.kw + ' · fit ' + s.fit + '%</small></button>';
    }).join('');
    var moe = opst.basis.map(speler).filter(function(s){ return s && s.fit < 70; }), verkeerd = pl.filter(function(p, i){ var s = speler(opst.basis[i]); return s && s.pos !== p.pos; }).length;
    var advies = moe.length ? 'Je assistent zegt: ' + moe.map(function(s){ return s.naam + ' (' + s.fit + '%)'; }).join(', ') + (moe.length === 1 ? ' is' : ' zijn') + ' moe. Een moe speler speelt slechter; zet een frisse speler van de bank erin.' :
      verkeerd ? 'Je assistent zegt: ' + verkeerd + (verkeerd === 1 ? ' speler staat' : ' spelers staan') + ' niet op hun eigen positie. Dat kost kracht.' : 'Je assistent zegt: iedereen is fit en staat op zijn plek.';
    var tactiek = Object.keys(C.TACTIEK).map(function(k){
      var g = C.TACTIEK[k], nu2 = opst.tactiek[k], uitleg = g.keuzes.filter(function(x){ return x[0] === nu2; })[0][2];
      return '<div class="cb-veld"><span style="font-weight:600;color:#FBF6F1;font-size:.88rem">' + g.naam + '</span><div class="cb-seg cb-drie">' + g.keuzes.map(function(x){ return '<button type="button" data-tk="' + k + '" data-w="' + x[0] + '" aria-pressed="' + (x[0] === nu2) + '">' + x[1] + '</button>'; }).join('') + '</div><span class="cb-klein">' + uitleg + '</span></div>';
    }).join('');
    $('cb-opstelling').innerHTML = '<div class="cb-opst"><section class="cb-kaart"><div class="cb-rij"><h2>Opstelling' + (tg ? ' tegen ' + esc(tg.naam) : '') + '</h2><span class="cb-hand" id="cbOpgeslagen">' + (bewaarTimer ? 'even opslaan...' : 'opgeslagen') + '</span></div>' +
      '<div class="cb-rij"><div class="cb-seg" role="group" aria-label="Formatie">' + Object.keys(C.FORMATIES).map(function(f){ return '<button type="button" data-form="' + f + '" aria-pressed="' + (f === opst.formatie) + '">' + f + '</button>'; }).join('') + '</div>' +
      '<span class="cb-klein">Klik een speler en dan een andere plek of iemand van de bank om te wisselen.</span></div>' +
      '<div class="cb-veldvak' + (rechtop ? ' staand' : '') + '" id="cbVeld">' + veldLijnen(rechtop) + plekken + '<span class="cb-hand" style="position:absolute;right:12px;top:8px;color:#FCDED6">' + (rechtop ? 'we spelen naar boven' : 'we spelen naar rechts') + '</span></div></section>' +
      '<aside class="cb-kol"><div class="cb-kaart"><h3>Tactiek</h3>' + tactiek + '</div>' +
      '<div class="cb-kaart"><div class="cb-rij"><h3>Bank</h3><button type="button" class="cb-knop cb-rand cb-smal" id="cbBeste">Beste elf kiezen</button></div><div class="cb-bank">' + bank + '</div></div>' +
      '<div class="cb-kaart cb-advies">' + esc(advies) + '</div></aside></div>';
  }
  function bewaarOpstelling(){
    clearTimeout(bewaarTimer); var o = $('cbOpgeslagen'); if (o) o.textContent = 'even opslaan...';
    bewaarTimer = setTimeout(function(){
      api('/opstelling', opst).then(function(j){ bewaarTimer = 0; if (j.club){ club = j.club; opst = { formatie: club.formatie, basis: club.basis.slice(), tactiek: Object.assign({}, club.tactiek) }; tekenBalk(); var o2 = $('cbOpgeslagen'); if (o2) o2.textContent = 'opgeslagen'; } else melding(j.fout || 'Opslaan lukte niet.'); });
    }, 500);
  }
  $('cb-opstelling').addEventListener('click', function(e){
    var f = e.target.closest('[data-form]'), tk = e.target.closest('[data-tk]'), p = e.target.closest('[data-plek]'), b = e.target.closest('[data-bank]');
    if (f){ opst.formatie = f.getAttribute('data-form'); opst.basis = herschik(opst.basis, opst.formatie); gekozen = null; }
    else if (tk){ opst.tactiek[tk.getAttribute('data-tk')] = tk.getAttribute('data-w'); }
    else if (e.target.closest('#cbBeste')){ opst.basis = C.besteElf(club.spelers.map(function(s){ return { id: s.id, pos: s.pos, kw: s.kw, fit: s.fit, fitT: nu() }; }), opst.formatie, nu()); gekozen = null; }
    else if (p){
      var i = +p.getAttribute('data-plek');
      if (!gekozen) gekozen = { veld: true, i: i };
      else if (gekozen.veld){ if (gekozen.i !== i){ var x = opst.basis[i]; opst.basis[i] = opst.basis[gekozen.i]; opst.basis[gekozen.i] = x; } gekozen = null; }
      else { opst.basis[i] = gekozen.id; gekozen = null; }
      if (gekozen){ tekenOpstelling(); focusNa('[data-plek="' + i + '"]'); return; }
    } else if (b){
      var id = b.getAttribute('data-bank');
      if (gekozen && gekozen.veld){ opst.basis[gekozen.i] = id; gekozen = null; }
      else if (gekozen && gekozen.id === id) gekozen = null;
      else { gekozen = { veld: false, id: id }; tekenOpstelling(); focusNa('[data-bank="' + id + '"]'); return; }
    } else return;
    tekenOpstelling(); bewaarOpstelling();
    var doel = f ? '[data-form="' + opst.formatie + '"]' : tk ? '[data-tk="' + tk.getAttribute('data-tk') + '"][data-w="' + tk.getAttribute('data-w') + '"]' : p ? '[data-plek="' + p.getAttribute('data-plek') + '"]' : b ? '#cbVeld' : '#cbBeste';
    focusNa(doel);
  });
  var wasStaand = staand();
  window.addEventListener('resize', function(){ if (staand() !== wasStaand){ wasStaand = staand(); if (scherm === 'opstelling' && club) tekenOpstelling(); } });
  function focusNa(sel){ var el = $('cb-opstelling').querySelector(sel); if (el){ if (!el.hasAttribute('tabindex') && el.tagName !== 'BUTTON') el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); } }

  /* ---------- de wedstrijd terugkijken ---------- */
  var wedKeuze = null, wed = null, speler2 = null;
  function stopWedstrijd(){ if (speler2){ cancelAnimationFrame(speler2.raf); speler2 = null; } }
  function laatsteWedstrijd(){ var n = (club.nieuws || []).filter(function(x){ return x.s === 'wedstrijd'; })[0]; return n ? { dag: n.dag, div: n.div, m: n.m } : null; }
  function tekenWedstrijd(){
    stopWedstrijd();
    var k = wedKeuze || laatsteWedstrijd();
    if (!k){
      $('cb-wedstrijd').innerHTML = '<div class="cb-kaart" style="max-width:640px"><h2>Nog geen wedstrijd gespeeld</h2><p class="cb-klein">Je eerste wedstrijd is ' + tijdTekst((liga && liga.volgende) || C.volgendeWedstrijd(nu())) + '. Daarna kun je hem hier terugkijken, van boven, met alle kansen en goals.</p><button type="button" class="cb-knop cb-rand" data-naar="opstelling">Opstelling kiezen</button></div>';
      return;
    }
    $('cb-wedstrijd').innerHTML = '<div class="cb-kaart"><p class="cb-klein">De wedstrijd wordt geladen...</p></div>';
    api('/wedstrijd?dag=' + encodeURIComponent(k.dag) + '&div=' + k.div + '&m=' + k.m).then(function(w){
      if (!w.sim){ $('cb-wedstrijd').innerHTML = '<div class="cb-kaart"><h2>Deze wedstrijd is er niet meer</h2><p class="cb-klein">' + esc(w.fout || '') + '</p></div>'; return; }
      wed = w; wedKeuze = k; toonWedstrijd();
    });
  }
  function verschilKleur(a, b){ var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16); return Math.abs((x >> 16) - (y >> 16)) + Math.abs(((x >> 8) & 255) - ((y >> 8) & 255)) + Math.abs((x & 255) - (y & 255)); }
  function toonWedstrijd(){
    var w = wed, sim = w.sim, ploeg = [w.thuis, w.uit];
    /* de ring van een ploeg: zijn eerste kleur, tenzij die wegvalt op het blauwe veld of op de kleur van de thuisploeg */
    function zichtbaar(k){ return ['#204ECF', '#14224C', '#1A1C24'].every(function(x){ return verschilKleur(k, x) >= 150; }); }
    function ringVan(c, niet){ var kies = [c.k1, c.k2, '#FBF6F1', '#EA9836'].filter(function(k){ return k && zichtbaar(k) && (!niet || verschilKleur(k, niet) >= 120); }); return kies[0] || '#FBF6F1'; }
    var r0 = ringVan(w.thuis), ring = [r0, ringVan(w.uit, r0)];
    var andere = liga && liga.laatste && liga.laatste.dag === w.dag ? liga.laatste.wedstrijden : [];
    var eerder = (club.nieuws || []).filter(function(x){ return x.s === 'wedstrijd'; });
    $('cb-wedstrijd').innerHTML = '<div class="cb-wed"><section class="cb-kaart">' +
      '<div class="cb-rij"><h2>Speelronde ' + w.ronde + ' · ' + esc(w.thuis.naam) + ' tegen ' + esc(w.uit.naam) + '</h2><span class="cb-klein">gespeeld ' + tijdTekst(w.gespeeld) + '</span></div>' +
      '<div class="cb-bord"><div><b>' + esc(w.thuis.naam) + '</b>' + logo(w.thuis, 34) + '</div><div class="cb-score"><b id="cbScore">0 - 0</b><span id="cbMinuut">aftrap</span></div><div>' + logo(w.uit, 34) + '<b>' + esc(w.uit.naam) + '</b></div></div>' +
      '<div class="cb-veldvak" id="cbWedVeld">' + veldLijnen() + '<div id="cbMannen"></div><i class="cb-bal" id="cbBal"></i><p class="cb-roep" id="cbRoep" hidden></p></div>' +
      '<div class="cb-bediening"><button type="button" class="cb-knop cb-rand cb-smal" id="cbPauze">Pauze</button><button type="button" class="cb-knop cb-rand cb-smal" id="cbSnel" aria-pressed="false">2×</button>' +
      '<button type="button" class="cb-knop cb-rand cb-smal" id="cbKansen" aria-pressed="false">Alleen de kansen</button>' +
      '<label class="cb-tijdlijn"><span class="sronly">Waar in de wedstrijd</span><input type="range" min="0" max="1000" value="0" id="cbSchuif"><span id="cbStreepjes"></span></label>' +
      '<button type="button" class="cb-knop cb-rand cb-smal" id="cbEind">Naar het eindsignaal</button></div></section>' +
      '<aside class="cb-kol"><div class="cb-kaart"><h3>Verslag</h3><ol class="cb-verslag" id="cbVerslag" aria-live="polite"></ol></div>' +
      '<div class="cb-kaart"><h3>Cijfers</h3><div id="cbCijfers"></div></div>' +
      (andere.length ? '<div class="cb-kaart"><h3>Uitslagen van deze ronde</h3><ul class="cb-uitslagen">' + andere.map(function(a){ return '<li><button type="button" data-kijk="' + esc(w.dag) + '|' + w.div + '|' + a.m + '"' + (a.m === wedKeuze.m ? ' aria-current="true"' : '') + '><span>' + esc(a.t) + '</span><b>' + a.s[0] + ' - ' + a.s[1] + '</b><span>' + esc(a.u) + '</span></button></li>'; }).join('') + '</ul></div>' : '') +
      (eerder.length > 1 ? '<div class="cb-kaart"><h3>Je vorige wedstrijden</h3><ul class="cb-nieuws">' + eerder.slice(0, 5).map(nieuwsRegel).join('') + '</ul></div>' : '') +
      '</aside></div>';
    startSpeler(w, ring, ploeg);
  }
  /* de herhaling: elke minuut een stukje, langer bij een kans */
  function startSpeler(w, ring, ploeg){
    var sim = w.sim, pl = [C.plekken(sim.formatie[0]), C.plekken(sim.formatie[1])];
    var namen = [sim.elf[0].map(function(x){ return x.naam; }), sim.elf[1].map(function(x){ return x.naam; })];
    var st = { t: 0, snel: 1, kansen: false, speelt: true, laatst: 0, raf: 0, regels: -1 };
    speler2 = st;
    var segs = [];
    for (var m = 1; m <= 90; m++){
      segs.push({ m: m, soort: 'rust0', duur: 0.9 });
      sim.momenten.filter(function(x){ return x.m === m; }).forEach(function(x){ segs.push({ m: m, soort: x.s === 'wissel' ? 'wissel' : 'kans', mom: x, duur: x.s === 'wissel' ? 1.8 : 4.2 }); });
      if (m === 45) segs.push({ m: 45, soort: 'rust', duur: 1.6 });
    }
    segs.push({ m: 90, soort: 'eind', duur: 2.5 });
    function tijden(){ var t = 0; segs.forEach(function(s){ s.start = t; s.d = s.soort === 'rust0' && st.kansen ? 0.05 : s.duur; t += s.d; }); st.totaal = t; }
    tijden();
    /* de spelers: 22 gezichtjes */
    var html = '';
    [0, 1].forEach(function(k){ namen[k].forEach(function(n, i){ html += '<span class="cb-man" id="cbM' + k + '_' + i + '" style="--ring:' + ring[k] + '">' + (window.AVATAR ? AVATAR.svg(n, 30) : '') + '</span>'; }); });
    $('cbMannen').innerHTML = html;
    var veld = $('cbWedVeld'), bal = $('cbBal'), mannen = [[], []];
    [0, 1].forEach(function(k){ for (var i = 0; i < 11; i++) mannen[k].push($('cbM' + k + '_' + i)); });
    $('cbStreepjes').innerHTML = sim.momenten.filter(function(x){ return x.s === 'goal'; }).map(function(x){ var s = segs.filter(function(y){ return y.mom === x; })[0]; return '<i style="left:' + (s.start / st.totaal * 100).toFixed(1) + '%;background:' + ring[x.k] + '"></i>'; }).join('');
    function zaadje(m, n){ var h = C.hash(w.dag + ':' + w.div + ':' + m + ':' + n); return (h % 1000) / 1000; }
    function basis(k, i){ var p = pl[k][i]; return k ? { x: 100 - p.x, y: 100 - p.y } : { x: p.x, y: p.y }; }
    function plaats(k, i, anker, bezit, tijd){
      var b = basis(k, i), kee = pl[k][i].pos === 'KEE', dx = (anker.x - 50) * (kee ? 0.12 : 0.32), dy = (anker.y - 50) * (kee ? 0.1 : 0.18);
      var duw = bezit === k ? (k ? -7 : 7) : (k ? 3 : -3);
      var x = b.x + dx + (kee ? 0 : duw) + Math.sin(tijd * 1.3 + i * 1.7 + k) * 0.8, y = b.y + dy + Math.cos(tijd * 1.1 + i * 2.3 + k) * 0.8;
      if (kee) x = k ? Math.min(97, Math.max(86, x)) : Math.max(3, Math.min(14, x));
      return { x: Math.max(2, Math.min(98, x)), y: Math.max(4, Math.min(96, y)) };
    }
    function lerp(a, b, f){ return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }; }
    function langs(pad, f){
      var pts = pad.map(function(p){ return { x: p[0], y: p[1] }; }), n = pts.length - 1, g = Math.min(n - 1e-6, f * n), i = Math.floor(g);
      return lerp(pts[i], pts[i + 1], g - i);
    }
    function naamOp(k, i, t){
      var n = namen[k][i];
      sim.momenten.forEach(function(x){ if (x.s === 'wissel' && x.k === k && x.sp === i){ var s = segs.filter(function(y){ return y.mom === x; })[0]; if (s && s.start + s.d * 0.5 <= t) n = x.in; } });
      return n;
    }
    function regel(x){
      var me = ploeg[x.k], tegen = ploeg[1 - x.k], t = segs.filter(function(y){ return y.mom === x; })[0];
      var sp = naamOp(x.k, x.sp, t.start + 0.1), as = x.as >= 0 ? naamOp(x.k, x.as, t.start + 0.1) : '';
      if (x.s === 'goal') return 'Goal! ' + sp + ' scoort voor ' + me.naam + (as ? ', na een pass van ' + as : '') + ': ' + x.stand[0] + '-' + x.stand[1] + '.';
      if (x.s === 'redding') return sp + ' schiet, maar de keeper van ' + tegen.naam + ' houdt hem tegen.';
      if (x.s === 'naast') return sp + ' (' + me.naam + ') schiet naast.';
      if (x.s === 'wissel') return 'Wissel bij ' + me.naam + ': ' + x.in + ' erin voor ' + x.uit + '.';
      return '';
    }
    function verslag(t){
      var klaar = segs.filter(function(s){ return (s.mom || s.soort === 'rust' || s.soort === 'eind') && s.start + s.d * 0.8 <= t; });
      if (klaar.length === st.regels) return;
      st.regels = klaar.length;
      var score = function(){ var g = sim.momenten.filter(function(x){ return x.s === 'goal'; }), s2 = [0, 0]; klaar.forEach(function(s){ if (s.mom && s.mom.s === 'goal') s2 = s.mom.stand; }); return s2; };
      var lijst = ['<li><b>1\'</b><span>Aftrap in het stadion van ' + esc(ploeg[0].naam) + '.</span></li>'].concat(klaar.map(function(s){
        if (s.soort === 'rust') return '<li><b>45\'</b><span>Rust.</span></li>';
        if (s.soort === 'eind') { var sc = sim.score; return '<li class="goal"><b>90\'</b><span>Einde: ' + esc(ploeg[0].naam) + ' ' + sc[0] + ', ' + esc(ploeg[1].naam) + ' ' + sc[1] + '.</span></li>'; }
        return '<li' + (s.mom.s === 'goal' ? ' class="goal"' : '') + '><b>' + s.m + '\'</b><span>' + esc(regel(s.mom)) + '</span></li>';
      }));
      var ol = $('cbVerslag'); if (!ol) return;
      ol.innerHTML = lijst.reverse().join('');
      var s2 = score(); $('cbScore').textContent = s2[0] + ' - ' + s2[1];
      var sch = [0, 0], od = [0, 0];
      klaar.forEach(function(s){ if (s.mom && s.mom.s !== 'wissel'){ sch[s.mom.k]++; if (s.mom.s !== 'naast') od[s.mom.k]++; } });
      var rijen = [['Balbezit', sim.bezit[0] + '%', sim.bezit[1] + '%', sim.bezit[0]], ['Schoten', sch[0], sch[1], sch[0] + sch[1] ? sch[0] / (sch[0] + sch[1]) * 100 : 50], ['Op doel', od[0], od[1], od[0] + od[1] ? od[0] / (od[0] + od[1]) * 100 : 50]];
      $('cbCijfers').innerHTML = rijen.map(function(r){ return '<div class="cb-cijfer"><b>' + r[1] + '</b><div><span>' + r[0] + '</span><span class="cb-twee"><i style="width:' + r[3] + '%;background:' + ring[0] + '"></i><i style="flex:1;background:' + ring[1] + '"></i></span></div><b style="text-align:right">' + r[2] + '</b></div>'; }).join('');
    }
    function teken(){
      var t = st.t, s = segs[segs.length - 1];
      for (var i = 0; i < segs.length; i++){ if (t < segs[i].start + segs[i].d){ s = segs[i]; break; } }
      var f = Math.max(0, Math.min(1, (t - s.start) / Math.max(0.001, s.d))), anker = { x: 50, y: 50 }, balPos = { x: 50, y: 50 }, bezit = -1, roep = '', roepGoal = false, sp = -1, as = -1, bk = -1;
      var W = veld.clientWidth, H = veld.clientHeight;
      if (s.soort === 'rust0'){
        bezit = zaadje(s.m, 0) * 100 < sim.bezit[0] ? 0 : 1;
        var veldspelers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], a = veldspelers[Math.floor(zaadje(s.m, 1) * 10)], b = veldspelers[Math.floor(zaadje(s.m, 2) * 10)];
        if (a === b) b = a === 10 ? 9 : a + 1;
        anker = lerp(basis(bezit, a), basis(bezit, b), f);
        var pa = plaats(bezit, a, anker, bezit, t), pb = plaats(bezit, b, anker, bezit, t);
        balPos = lerp(pa, pb, f); bk = f < 0.5 ? a : b;
      } else if (s.soort === 'kans'){
        var mo = s.mom, fb = Math.min(1, f / 0.75);
        bezit = mo.k; balPos = langs(mo.pad, fb); anker = balPos; sp = mo.sp; as = mo.as;
        if (f >= 0.75){ roep = mo.s === 'goal' ? 'GOAL! ' + naamOp(mo.k, mo.sp, t) : mo.s === 'redding' ? 'Redding!' : 'Naast!'; roepGoal = mo.s === 'goal'; }
        else if (fb > 0.55) roep = naamOp(mo.k, mo.sp, t) + ' schiet!';
      } else if (s.soort === 'wissel'){ roep = 'Wissel: ' + s.mom.in + ' erin voor ' + s.mom.uit; }
      else if (s.soort === 'rust'){ roep = 'Rust'; }
      else if (s.soort === 'eind'){ roep = 'Einde wedstrijd'; }
      for (var k = 0; k < 2; k++) for (var i2 = 0; i2 < 11; i2++){
        var p = plaats(k, i2, anker, bezit, t);
        if (s.soort === 'kans' && k === s.mom.k){
          var pad = s.mom.pad, fb2 = Math.min(1, f / 0.75);
          if (i2 === sp) p = lerp(p, { x: pad[pad.length - 2][0], y: pad[pad.length - 2][1] }, Math.min(1, fb2 * 1.6));
          else if (i2 === as) p = lerp(p, { x: pad[1][0], y: pad[1][1] }, Math.min(1, fb2 * 2.5) * (1 - Math.max(0, fb2 - 0.6)));
        }
        if (s.soort === 'kans' && k !== s.mom.k && pl[k][i2].pos === 'KEE') p = { x: k ? Math.min(97, Math.max(90, balPos.x)) : Math.max(3, Math.min(10, balPos.x)), y: 40 + (balPos.y - 50) * 0.25 + 10 };
        var el = mannen[k][i2];
        el.style.transform = 'translate(' + (p.x / 100 * W).toFixed(1) + 'px,' + (p.y / 100 * H).toFixed(1) + 'px)';
        var heeft = (k === bezit) && ((s.soort === 'rust0' && i2 === bk) || (s.soort === 'kans' && ((f < 0.3 && i2 === as) || (f >= 0.3 && f < 0.6 && i2 === sp))));
        el.classList.toggle('bal', heeft);
      }
      bal.style.transform = 'translate(' + (balPos.x / 100 * W).toFixed(1) + 'px,' + (balPos.y / 100 * H).toFixed(1) + 'px)';
      var r = $('cbRoep'); r.hidden = !roep; r.textContent = roep; r.classList.toggle('goal', roepGoal);
      $('cbMinuut').textContent = s.soort === 'rust' ? 'rust' : s.soort === 'eind' ? 'einde' : s.m + 'e minuut';
      var sch = $('cbSchuif'); if (document.activeElement !== sch) sch.value = Math.round(t / st.totaal * 1000);
      verslag(t);
    }
    function stap(tijd){
      if (speler2 !== st) return;
      var dt = st.laatst ? Math.min(0.1, (tijd - st.laatst) / 1000) : 0; st.laatst = tijd;
      if (st.speelt){ st.t = Math.min(st.totaal, st.t + dt * st.snel); if (st.t >= st.totaal){ st.speelt = false; $('cbPauze').textContent = 'Opnieuw'; } }
      teken();
      st.raf = requestAnimationFrame(stap);
    }
    $('cbPauze').onclick = function(){
      if (st.t >= st.totaal){ st.t = 0; st.regels = -1; st.speelt = true; }
      else st.speelt = !st.speelt;
      this.textContent = st.speelt ? 'Pauze' : 'Verder';
    };
    $('cbSnel').onclick = function(){ st.snel = st.snel === 1 ? 2 : 1; this.setAttribute('aria-pressed', st.snel === 2); };
    $('cbKansen').onclick = function(){
      var s = segs.filter(function(x){ return st.t < x.start + x.d; })[0] || segs[segs.length - 1], f = (st.t - s.start) / Math.max(0.001, s.d);
      st.kansen = !st.kansen; this.setAttribute('aria-pressed', st.kansen); tijden(); st.t = s.start + f * s.d; st.regels = -1;
      $('cbStreepjes').innerHTML = sim.momenten.filter(function(x){ return x.s === 'goal'; }).map(function(x){ var s2 = segs.filter(function(y){ return y.mom === x; })[0]; return '<i style="left:' + (s2.start / st.totaal * 100).toFixed(1) + '%;background:' + ring[x.k] + '"></i>'; }).join('');
    };
    $('cbEind').onclick = function(){ st.t = st.totaal; st.regels = -1; };
    $('cbSchuif').oninput = function(){ st.t = +this.value / 1000 * st.totaal; st.regels = -1; };
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches){ st.kansen = true; tijden(); $('cbKansen').setAttribute('aria-pressed', 'true'); }
    window.CBWED = st;
    st.raf = requestAnimationFrame(stap);
  }

  /* ---------- stand ---------- */
  function tekenStand(){
    var l = liga || {}, st = l.clubs || [];
    var tabel = '<table class="cb-tabel"><thead><tr><th>Plek</th><th>Club</th><th class="r" title="gespeeld">Gs</th><th class="r" title="gewonnen">W</th><th class="r" title="gelijk">G</th><th class="r" title="verloren">V</th><th class="r" title="doelpunten voor en tegen">Doelsaldo</th><th class="r">Punten</th></tr></thead><tbody>' + st.map(function(x, i){
      var zone = i < R.promotie && l.div > 1 ? ' op' : i >= st.length - R.promotie && l.div < l.divisies ? ' neer' : '';
      return '<tr class="' + (x.jij ? 'mijn' : '') + zone + '"><td>' + (i + 1) + '</td><td>' + C.logoSvg(x.logo, x.k1, x.k2, 18) + esc(x.naam) + (x.bot ? ' <small class="cb-klein">(vult aan)</small>' : '') + '</td><td class="r">' + (x.w + x.g + x.v) + '</td><td class="r">' + x.w + '</td><td class="r">' + x.g + '</td><td class="r">' + x.v + '</td><td class="r">' + x.dv + '-' + x.dt + '</td><td class="r"><b>' + x.p + '</b></td></tr>';
    }).join('') + '</tbody></table>';
    var laatste = l.laatste ? '<ul class="cb-uitslagen">' + l.laatste.wedstrijden.map(function(a){ return '<li><button type="button" data-kijk="' + esc(l.laatste.dag) + '|' + l.laatste.div + '|' + a.m + '"><span>' + esc(a.t) + '</span><b>' + a.s[0] + ' - ' + a.s[1] + '</b><span>' + esc(a.u) + '</span></button></li>'; }).join('') + '</ul><p class="cb-klein">Klik een wedstrijd om hem terug te kijken.</p>' : '<p class="cb-klein">Na de eerste speelronde zie je hier de uitslagen.</p>';
    var prog = [l.tegen, l.daarna].filter(Boolean).map(function(t, i){ return '<li>Ronde ' + t.ronde + ', ' + (i ? tijdTekst(C.daarna(nu())) : tijdTekst(l.volgende)) + ': ' + (t.thuis ? 'thuis tegen ' : 'uit bij ') + esc(t.naam) + '</li>'; }).join('');
    $('cb-stand').innerHTML = '<div class="cb-standscherm"><div class="cb-kaart"><h2>Divisie ' + (l.div || 1) + ' · seizoen ' + (l.seizoen || 1) + ', na ' + (l.ronde || 0) + ' van ' + R.rondes + ' speelrondes</h2>' + tabel +
      '<p class="cb-klein">Clubs met "vult aan" zijn computerclubs, zodat er altijd acht clubs in een divisie spelen. Winst is 3 punten, gelijk 1. De beste ' + R.promotie + ' gaan na het seizoen een divisie omhoog, de laatste ' + R.promotie + ' een omlaag.</p></div>' +
      '<div class="cb-kol"><div class="cb-kaart"><h2>Uitslagen van de laatste ronde</h2>' + laatste + '</div>' + (prog ? '<div class="cb-kaart"><h3>Programma</h3><ul class="cb-nieuws">' + prog + '</ul></div>' : '') + '</div></div>';
  }

  /* ---------- transfers ---------- */
  var marktLijst = null, marktFilter = 'alles';
  function tekenTransfers(){
    var open = liga && liga.open, t = club;
    var bod = t.bod ? '<div class="cb-kaart cb-bod"><h3>Bod op ' + esc(t.bod.naam) + '</h3><p class="cb-klein" style="margin:0">' + esc(t.bod.club) + ' biedt ' + munt(t.bod.prijs) + ' munten. Dat is meer dan de waarde van ' + munt((speler(t.bod.id) || {}).waarde || 0) + '.</p><div class="cb-rij"><button type="button" class="cb-knop cb-rand" data-bod="0">Weigeren</button><button type="button" class="cb-knop cb-oker" data-bod="1">Verkopen</button></div></div>' : '';
    var filters = [['alles', 'Alles'], ['KEE', 'Keepers'], ['VER', 'Verdedigers'], ['MID', 'Middenvelders'], ['AAN', 'Aanvallers']];
    var markt = !open ? '<p class="cb-klein">De transfermarkt is dicht. Hij gaat weer open na de laatste speelronde van het seizoen en blijft open tot en met speelronde ' + R.transferTot + '.</p>' :
      !marktLijst ? '<p class="cb-klein">De markt wordt geladen...</p>' :
      '<div class="cb-markt"><div class="cb-mrij cb-kop"><span></span><span>Speler</span><span>Plek</span><span class="cb-weg">Kwaliteit</span><span>Prijs</span><span></span></div>' + marktLijst.filter(function(s){ return marktFilter === 'alles' || s.pos === marktFilter; }).map(function(s){
        var te = t.munten < s.prijs, vol = t.spelers.length >= R.selectieMax;
        return '<div class="cb-mrij">' + gezicht(s.naam, 30, s.pos) + '<div><b>' + esc(s.naam) + '</b><small>' + (s.club ? esc(s.club) : 'vrije speler') + '</small></div><b>' + s.pos + '</b><span class="cb-weg">' + s.kw + '</span><b>' + munt(s.prijs) + '</b>' +
          '<button type="button" class="cb-knop cb-oker" data-koop="' + s.id + '"' + (te || vol ? ' disabled' : '') + '>' + (vol ? 'Selectie vol' : te ? 'Te duur' : s.club ? 'Kopen' : 'Contract geven') + '</button></div>';
      }).join('') + '</div>';
    var eigen = t.spelers.slice().sort(function(a, b){ return POSVOLG[a.pos] - POSVOLG[b.pos] || b.kw - a.kw; }).map(function(s){
      var laatsteKee = s.pos === 'KEE' && t.spelers.filter(function(x){ return x.pos === 'KEE'; }).length <= 1, kan = open && t.spelers.length > R.selectieMin && !laatsteKee;
      return '<div class="cb-bankrij" style="cursor:default">' + gezicht(s.naam, 26, s.pos) + '<span><b style="display:block">' + esc(s.naam) + '</b><small>' + s.pos + ' · ' + s.kw + '</small></span>' +
        '<button type="button" class="cb-knop cb-rand cb-smal" data-verkoop="' + s.id + '"' + (kan ? '' : ' disabled') + ' title="' + (!open ? 'De markt is dicht' : laatsteKee ? 'Je hebt een keeper nodig' : t.spelers.length <= R.selectieMin ? 'Je hebt minstens ' + R.selectieMin + ' spelers nodig' : '') + '">Verkopen · ' + munt(Math.round(s.waarde * R.verkoop / 10) * 10) + '</button></div>';
    }).join('');
    $('cb-transfers').innerHTML = '<div class="cb-transfer"><section class="cb-kaart' + (open ? '' : ' cb-dicht') + '"><div class="cb-rij"><h2>Transfermarkt</h2><span class="cb-klein" style="color:#EA9836;font-weight:600">' + (open ? 'open tot en met speelronde ' + R.transferTot : 'dicht tot het volgende seizoen') + '</span></div>' +
      (open ? '<div class="cb-seg" role="group" aria-label="Welke spelers">' + filters.map(function(f){ return '<button type="button" data-mf="' + f[0] + '" aria-pressed="' + (f[0] === marktFilter) + '">' + f[1] + '</button>'; }).join('') + '</div>' : '') + markt + '</section>' +
      '<aside class="cb-kol">' + bod + '<div class="cb-kaart"><div class="cb-rij"><h3>Je selectie</h3><span class="cb-klein">' + t.spelers.length + ' van ' + R.selectieMax + ' spelers</span></div><div class="cb-bank">' + eigen + '</div>' +
      '<p class="cb-klein">Je koopt van computerclubs en vrije spelers, niet van klasgenoten. Verkopen levert ' + Math.round(R.verkoop * 100) + '% van de waarde op.</p></div></aside></div>';
    if (open && !marktLijst) api('/markt').then(function(j){ marktLijst = j.spelers || []; if (scherm === 'transfers') tekenTransfers(); });
  }
  $('cb-transfers').addEventListener('click', function(e){
    var f = e.target.closest('[data-mf]'), k = e.target.closest('[data-koop]'), v = e.target.closest('[data-verkoop]'), b = e.target.closest('[data-bod]');
    if (f){ marktFilter = f.getAttribute('data-mf'); tekenTransfers(); return; }
    var verzoek = k ? api('/koop', { id: k.getAttribute('data-koop') }) : v ? api('/verkoop', { id: v.getAttribute('data-verkoop') }) : b ? api('/bod', { ja: b.getAttribute('data-bod') === '1' }) : null;
    if (!verzoek) return;
    (k || v || b).disabled = true;
    verzoek.then(function(j){
      if (j.club){ club = j.club; opst = null; marktLijst = null; tekenBalk(); melding(k ? 'Gekocht! Je nieuwe speler staat in je selectie.' : v || (b && b.getAttribute('data-bod') === '1') ? 'Verkocht.' : 'Bod geweigerd.'); tekenTransfers(); }
      else { melding(j.fout || 'Dat lukte niet.'); tekenTransfers(); }
    });
  });

  /* ---------- club en tenue ---------- */
  var tenue = null;
  function tekenClub(){
    if (!tenue) tenue = { k1: club.k1, k2: club.k2, patroon: club.patroon, logo: club.logo };
    var x = tenue;
    function stalen(kop, sl){ return '<div class="cb-veld"><span style="font-weight:600;color:#FBF6F1;font-size:.88rem">' + kop + '</span><div class="cb-stalen">' + C.KLEUREN.map(function(k){ return '<button type="button" class="cb-staal' + (x[sl] === k[0] ? ' aan' : '') + '" style="background:' + k[0] + '" data-tn="' + sl + '" data-w="' + k[0] + '" aria-pressed="' + (x[sl] === k[0]) + '" aria-label="' + kop + ': ' + k[1] + '" title="' + k[1] + '"></button>'; }).join('') + '</div></div>'; }
    $('cb-club').innerHTML = '<div class="cb-clubscherm"><section class="cb-kaart"><h2>' + esc(club.naam) + '</h2>' +
      '<div class="cb-tenue">' + C.shirtSvg(x.k1, x.k2, x.patroon, 170, 9, 'Het shirt van je club') + C.logoSvg(x.logo, x.k1, x.k2, 120, 'Het logo van je club') + '</div>' +
      '<p class="cb-klein">Zo zien de andere clubs jullie in de stand en in de wedstrijd. In het veld dragen je spelers een ring in je eerste kleur.</p></section>' +
      '<aside class="cb-kol"><div class="cb-kaart">' + stalen('Eerste kleur', 'k1') + stalen('Tweede kleur', 'k2') +
      '<div class="cb-veld"><span style="font-weight:600;color:#FBF6F1;font-size:.88rem">Patroon</span><div class="cb-seg">' + C.PATRONEN.map(function(p){ return '<button type="button" data-tn="patroon" data-w="' + p[0] + '" aria-pressed="' + (p[0] === x.patroon) + '">' + p[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="cb-veld"><span style="font-weight:600;color:#FBF6F1;font-size:.88rem">Logo</span><div class="cb-logos">' + Object.keys(C.LOGOS).map(function(l){ return '<button type="button" data-tn="logo" data-w="' + l + '" aria-pressed="' + (l === x.logo) + '" aria-label="' + C.LOGOS[l].naam + '" title="' + C.LOGOS[l].naam + '">' + C.logoSvg(l, x.k1, x.k2, 32) + '</button>'; }).join('') + '</div></div>' +
      '<p class="cb-fout" id="cbTenueFout" hidden></p><div class="cb-rij"><span class="cb-klein">Kleuren en logo zijn gratis.</span><button type="button" class="cb-knop cb-blauw" id="cbTenueBewaar">Opslaan</button></div></div></aside></div>';
  }
  $('cb-club').addEventListener('click', function(e){
    var b = e.target.closest('[data-tn]');
    if (b){ tenue[b.getAttribute('data-tn')] = b.getAttribute('data-w'); var sel = '[data-tn="' + b.getAttribute('data-tn') + '"][data-w="' + b.getAttribute('data-w') + '"]'; tekenClub(); var n = $('cb-club').querySelector(sel); if (n) n.focus({ preventScroll: true }); return; }
    if (e.target.closest('#cbTenueBewaar')){
      var f = $('cbTenueFout');
      if (tenue.k1 === tenue.k2){ f.textContent = 'Kies twee verschillende kleuren.'; f.hidden = false; return; }
      api('/kleding', tenue).then(function(j){ if (j.club){ club = j.club; tenue = null; tekenBalk(); tekenClub(); melding('Opgeslagen.'); } else melding(j.fout || 'Opslaan lukte niet.'); });
    }
  });

  /* ---------- nieuwe club, inloggen ---------- */
  function tekenNieuw(){
    var k1 = '#F26749', k2 = '#FBF6F1', lg = 'vogel';
    $('cbInhoud').hidden = true; $('cbStart').hidden = false;
    function teken(){
      $('cbStart').innerHTML = '<div class="cb-kaart cb-nieuw"><span class="cb-hand">welkom</span><h2>Start je voetbalclub</h2><p>Je krijgt een selectie van zestien spelers, een klein stadion en een trainingsveld. Met munten uit goed beantwoorde vragen train je je elftal, bouw je uit en koop je spelers. Elke woensdag om 16.00 en zaterdag om 14.00 speelt je club tegen een club uit je divisie.</p>' +
        '<div class="cb-tenue" id="cbNieuwTenue">' + C.shirtSvg(k1, k2, 'strepen', 110, 9) + C.logoSvg(lg, k1, k2, 80) + '</div>' +
        '<label class="cb-veld"><span>Naam van je club</span><input id="cbNaam" maxlength="24" autocomplete="off" placeholder="bijvoorbeeld FC Valk" value="' + esc(teken.naam || '') + '"></label>' +
        '<div class="cb-veld"><span>Eerste kleur</span><div class="cb-stalen" id="cbK1">' + C.KLEUREN.map(function(k){ return '<button type="button" class="cb-staal' + (k[0] === k1 ? ' aan' : '') + '" style="background:' + k[0] + '" data-k="' + k[0] + '" aria-label="' + k[1] + '" aria-pressed="' + (k[0] === k1) + '"></button>'; }).join('') + '</div></div>' +
        '<div class="cb-veld"><span>Tweede kleur</span><div class="cb-stalen" id="cbK2">' + C.KLEUREN.map(function(k){ return '<button type="button" class="cb-staal' + (k[0] === k2 ? ' aan' : '') + '" style="background:' + k[0] + '" data-k="' + k[0] + '" aria-label="' + k[1] + '" aria-pressed="' + (k[0] === k2) + '"></button>'; }).join('') + '</div></div>' +
        '<div class="cb-veld"><span>Logo</span><div class="cb-logos" id="cbLogo">' + Object.keys(C.LOGOS).map(function(l){ return '<button type="button" data-l="' + l + '" aria-pressed="' + (l === lg) + '" aria-label="' + C.LOGOS[l].naam + '">' + C.logoSvg(l, k1, k2, 30) + '</button>'; }).join('') + '</div></div>' +
        '<p class="cb-fout" id="cbNieuwFout" hidden></p><button type="button" class="cb-knop cb-koraal" id="cbMaak">Start mijn club</button></div>';
      $('cbNaam').addEventListener('input', function(){ teken.naam = this.value; });
      $('cbK1').onclick = function(e){ var b = e.target.closest('[data-k]'); if (b){ k1 = b.getAttribute('data-k'); teken(); $('cbK1').querySelector('[data-k="' + k1 + '"]').focus(); } };
      $('cbK2').onclick = function(e){ var b = e.target.closest('[data-k]'); if (b){ k2 = b.getAttribute('data-k'); teken(); $('cbK2').querySelector('[data-k="' + k2 + '"]').focus(); } };
      $('cbLogo').onclick = function(e){ var b = e.target.closest('[data-l]'); if (b){ lg = b.getAttribute('data-l'); teken(); $('cbLogo').querySelector('[data-l="' + lg + '"]').focus(); } };
      $('cbMaak').onclick = function(){
        var naam = $('cbNaam').value.trim(), f = $('cbNieuwFout');
        if (naam.length < 2){ f.textContent = 'Geef je club een naam van minstens twee letters.'; f.hidden = false; $('cbNaam').focus(); return; }
        if (k1 === k2){ f.textContent = 'Kies twee verschillende kleuren.'; f.hidden = false; return; }
        this.disabled = true;
        api('/start', { naam: naam, k1: k1, k2: k2, logo: lg }).then(function(j){ if (j.club){ laad(); } else { f.textContent = j.fout || 'Dat lukte niet.'; f.hidden = false; $('cbMaak').disabled = false; } });
      };
    }
    teken();
  }
  function tekenInloggen(){
    $('cbInhoud').hidden = true; $('cbStart').hidden = false;
    var adres = window.PROFIEL && PROFIEL.inlogAdres ? PROFIEL.inlogAdres() : '/api/account/inloggen?terug=' + encodeURIComponent(location.pathname);
    $('cbStart').innerHTML = '<div class="cb-kaart cb-nieuw"><span class="cb-hand">alleen met een account</span><h2>Clubbaas</h2><p>Word de baas van je eigen voetbalclub: train je elftal, bouw je stadion uit en koop spelers met munten die je verdient door vragen goed te beantwoorden. Twee keer per week speelt je club tegen de andere clubs van je divisie.</p><p>Je club hoort bij je account, zodat hij op elke computer hetzelfde is. Log daarom eerst in.</p><a class="cb-knop cb-koraal" href="' + esc(adres) + '">Inloggen met Microsoft</a></div>';
  }

  /* ---------- laden en de klok ---------- */
  var volgendeOphalen = 0;
  function laad(){
    return api('').then(function(j){
      if (j._status === 401){ tekenInloggen(); return; }
      if (j.nieuw){ tekenNieuw(); return; }
      if (!j.club){ $('cbStart').hidden = false; $('cbStart').innerHTML = '<div class="cb-kaart cb-nieuw"><h2>Even geen verbinding</h2><p>' + esc(j.fout || 'Probeer het zo nog eens.') + '</p></div>'; $('cbInhoud').hidden = true; return; }
      club = j.club; liga = j.liga; klokVerschil = (club.nu || Date.now()) - Date.now(); opst = null; tenue = null; marktLijst = null;
      volgendeOphalen = liga && liga.volgende ? liga.volgende + 90000 : 0;
      $('cbStart').hidden = true; $('cbInhoud').hidden = false;
      tekenBalk();
      var s = ls('cb-scherm'); naar(SCHERMEN.some(function(x){ return x[0] === s; }) ? s : 'huis', 'stil');
    });
  }
  setInterval(function(){
    if (!club) return;
    var t = nu();
    document.querySelectorAll('[data-eind]').forEach(function(el){ el.textContent = duur(+el.getAttribute('data-eind') - t); });
    var a = $('cbAftel'); if (a && liga) a.textContent = duur(liga.volgende - t);
    var jt = $('cbJobTijd'), jb = club.jobs.filter(function(x){ return x.id === versnelJob; })[0]; if (jt && jb) jt.textContent = duur(jb.eind - t);
    /* is er een training klaar of een wedstrijd gespeeld: opnieuw ophalen (niet midden in een vraag of herhaling) */
    var klaar = club.jobs.some(function(j){ return j.eind <= t; }) || (volgendeOphalen && t > volgendeOphalen);
    if (klaar && scherm !== 'vragen' && scherm !== 'wedstrijd' && !laad.bezig){ laad.bezig = true; volgendeOphalen = 0; laad().then(function(){ laad.bezig = false; }); }
  }, 1000);
  laad();
})();
