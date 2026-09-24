/* De resultaten van een eigen oefening of toets (maken.html): nakijken met de
   hand, de norm instellen, de analyse per vraag, en toetsen met elkaar
   vergelijken. Rekenen doet nakijk.js; praten met de server eigen.js.

     UITSLAG.open(code)     het resultatenscherm van een stuk
     UITSLAG.vergelijk()    alle eigen toetsen naast elkaar
   Beide tekenen in hun eigen sectie en roepen bij "terug" opts.terug() aan. */
var UITSLAG = (function(){
  'use strict';
  function $(id){ return document.getElementById(id); }
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function melding(el, tekst, soort){ el.textContent = tekst || ''; el.className = 'melding' + (soort ? ' ' + soort : ''); }
  function komma(x, n){ return x == null ? '–' : Number(x).toFixed(n == null ? 1 : n).replace('.', ','); }
  function pct(w){ return w == null ? 'nakijken' : Math.round(w * 100) + '%'; }
  var VORMNAAM = { mk: 'Meerkeuze', open: 'Open', koppel: 'Koppelen', volgorde: 'Volgorde', groepen: 'Groepen', gaten: 'Gatentekst' };
  var terug = function(){};
  var code = '', u = null, b = null, an = null, paneel = null, bewaarTimer = null, klasFilter = '';

  function toon(sectie){ ['lijstvak', 'bewerkvak', 'uitslagvak', 'vergelijkvak'].forEach(function(s){ var el = $(s); if (el) el.classList.toggle('hide', s !== sectie); }); var kop = $('paginakop'); if (kop) kop.classList.toggle('hide', sectie === 'uitslagvak' || sectie === 'vergelijkvak'); window.scrollTo(0, 0); }

  /* het antwoord van een leerling leesbaar, per vorm */
  function antwoordTekst(it, a){
    if (a == null || a === '' || (Array.isArray(a) && !a.length)) return '(niets ingevuld)';
    switch (it.vorm){
      case 'koppel': return it.paren.map(function(p, i){ return p.a + ' → ' + (a[i] || '—'); }).join('; ');
      case 'volgorde': return a.join(' → ');
      case 'groepen': return it.groepen.map(function(g){ return g.naam + ': ' + (a.filter(function(x){ return x[1] === g.naam; }).map(function(x){ return x[0]; }).join(', ') || '—'); }).join('; ');
      case 'gaten': { var i = 0; return String(it.tekst).replace(/\[[^\]]+\]/g, function(){ return '[' + (a[i++] || '…') + ']'; }); }
    }
    return String(a);
  }

  /* ================= een stuk ================= */
  function open(c, opts){
    terug = (opts && opts.terug) || terug;
    code = c; u = null; paneel = null; klasFilter = '';
    toon('uitslagvak');
    $('uitslagKop').textContent = 'Resultaten';
    $('uitslagInhoud').innerHTML = '';
    melding($('uitslagMelding'), 'Ophalen…');
    EIGEN.uitslagen(code).then(function(j){
      u = j; melding($('uitslagMelding'), '');
      $('uitslagKop').textContent = u.naam;
      if (!u.rijen.length){
        $('uitslagInhoud').innerHTML = '<p class="leeg">Nog niemand heeft ingeleverd. Deel de code <b>' + schoon(code) + '</b> met je klas; de antwoorden komen hier binnen zodra een leerling klaar is.</p>';
        return;
      }
      opbouw(); teken();
    }).catch(function(f){ melding($('uitslagMelding'), f.message, 'fout'); });
  }
  function opbouw(){
    var n = u.norm, klassen = {};
    u.rijen.forEach(function(r){ if (r.klas) klassen[r.klas] = 1; });
    var kl = Object.keys(klassen).sort();
    $('uitslagInhoud').innerHTML =
      '<div id="oproep"></div><div class="samenvatting" id="samen"></div>' +
      '<div class="uitslaggrid">' +
        '<div class="kaart"><h3>Norm</h3>' +
          '<div class="modus" role="radiogroup" aria-label="Norm">' +
            '<label><input type="radio" name="normm" value="cesuur"' + (n.methode === 'cesuur' ? ' checked' : '') + '><span><b>Cesuur</b>: bij <input class="veld mini" id="normCes" type="number" min="10" max="95" step="1" value="' + n.cesuur + '" aria-label="Cesuur in procenten"> % van de punten een 5,5</span></label>' +
            '<label><input type="radio" name="normm" value="nterm"' + (n.methode === 'nterm' ? ' checked' : '') + '><span><b>N-term</b>: 9 × score / max + <input class="veld mini" id="normN" type="number" min="0" max="3" step="0.1" value="' + n.n + '" aria-label="N-term"></span></label>' +
            '<label><input type="radio" name="normm" value="auto"' + (n.methode === 'auto' ? ' checked' : '') + '><span><b>Automatisch</b> (Cohen-Schotanus): de cesuur schuift mee met hoe de beste leerlingen het deden, rekening houdend met de raadkans. <span class="tip" id="autoCes"></span></span></label>' +
          '</div>' +
          (u.modus === 'toets' ? '<p class="tip" style="margin-top:8px">Na het inleveren zien leerlingen ' + (u.terugzien ? 'hun score en de goede antwoorden' : 'alleen hun score') + '. Dat zet je bij Bewerken.</p>' : '') +
          '<p class="melding" id="normMelding" role="status" aria-live="polite"></p>' +
        '</div>' +
        '<div class="kaart"><h3>Verdeling van de cijfers</h3><div class="balkjes" id="verdeling" role="img"></div></div>' +
      '</div>' +
      '<div class="kaart"><div class="rij" style="justify-content:space-between"><h3>Leerlingen</h3><span class="rij">' +
        (kl.length > 1 ? '<label class="tip">Klas <select class="veld mini" id="klasKies"><option value="">alle</option>' + kl.map(function(k){ return '<option>' + k + '</option>'; }).join('') + '</select></label>' : '') +
        '<button class="knop stil klein" type="button" id="csv">Downloaden (Excel)</button></span></div>' +
        '<div class="schuif"><table class="tabel kaartjes" id="leerlingTabel"></table></div></div>' +
      '<div class="kaart"><h3>Per vraag</h3><p class="tip">p: het deel van de punten dat de klas haalde. rit: of wie het goed doet op de rest, het hier ook goed doet (onder 0,2 is zwak). Vink een vraag uit om hem niet mee te laten tellen.</p>' +
        '<div class="schuif"><table class="tabel kaartjes" id="vraagTabel"></table></div></div>' +
      '<div class="kaart hide" id="nakijkPaneel" tabindex="-1"></div>';
    [].forEach.call(document.querySelectorAll('input[name="normm"]'), function(r){ r.addEventListener('change', normVeranderd); });
    $('normCes').addEventListener('input', function(){ zetMethode('cesuur'); normVeranderd(); });
    $('normN').addEventListener('input', function(){ zetMethode('nterm'); normVeranderd(); });
    if ($('klasKies')) $('klasKies').addEventListener('change', function(){ klasFilter = this.value; teken(); });
    $('csv').addEventListener('click', downloadCsv);
  }
  /* een keer: de inhoud wordt telkens opnieuw getekend, de luisteraars blijven */
  function luister(){
    $('uitslagInhoud').addEventListener('click', function(e){ if (u) klik(e); });
    $('uitslagInhoud').addEventListener('change', function(e){
      var c = e.target.closest('[data-telt]'); if (!c || !u) return;
      var i = Number(c.getAttribute('data-telt')), nu = (u.neutraal || []).filter(function(x){ return x !== i; });
      if (!c.checked) nu.push(i);
      u.neutraal = nu; teken();
      bewaarInstel({ neutraal: nu }, c.checked ? 'Vraag ' + (i + 1) + ' telt weer mee.' : 'Vraag ' + (i + 1) + ' telt niet meer mee; de cijfers zijn opnieuw berekend.');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', luister); else luister();
  function zetMethode(m){ [].forEach.call(document.querySelectorAll('input[name="normm"]'), function(r){ r.checked = r.value === m; }); }
  /* wat een andere norm doet: wie zakt eronder, wie komt erboven, en wat het gemiddelde doet */
  var normEffect = '';
  function normVeranderd(){
    var m = (document.querySelector('input[name="normm"]:checked') || {}).value || 'cesuur';
    var voor = {}; if (b) b.rijen.forEach(function(r){ voor[r.sid] = r.cijfer; });
    var gemVoor = b ? b.gem : null;
    u.norm = { methode: m, cesuur: Number($('normCes').value) || 55, n: $('normN').value === '' ? 1 : Number($('normN').value) };
    teken();
    var zakt = 0, stijgt = 0;
    b.rijen.forEach(function(r){ var v = voor[r.sid]; if (v == null || r.cijfer == null) return; if (v >= 5.5 && r.cijfer < 5.5) zakt++; if (v < 5.5 && r.cijfer >= 5.5) stijgt++; });
    var delen = [];
    if (zakt) delen.push(zakt + (zakt === 1 ? ' leerling zakt' : ' leerlingen zakken') + ' onder de 5,5');
    if (stijgt) delen.push(stijgt + (stijgt === 1 ? ' leerling komt' : ' leerlingen komen') + ' erboven');
    if (gemVoor != null && b.gem != null && gemVoor !== b.gem) delen.push('gemiddelde van ' + komma(gemVoor) + ' naar ' + komma(b.gem));
    normEffect = delen.length ? delen.join(', ') + '.' : 'Geen cijfer verandert van kant.';
    melding($('normMelding'), normEffect, '');
    clearTimeout(bewaarTimer);
    bewaarTimer = setTimeout(function(){ bewaarInstel({ norm: u.norm }, 'Norm opgeslagen. ' + normEffect); }, 700);
  }
  function bewaarInstel(x, klaar){
    EIGEN.instel(code, x).then(function(){ melding($('normMelding'), klaar, 'goed'); })
      .catch(function(f){ melding($('normMelding'), 'Opslaan lukte niet: ' + f.message, 'fout'); });
  }
  function zichtbaar(){ return b.rijen.filter(function(r){ return !klasFilter || r.klas === klasFilter; }); }
  function teken(){
    b = NAKIJK.bereken(u); an = NAKIJK.analyse(u, b);
    var rijen = zichtbaar(), cijfers = rijen.map(function(r){ return r.cijfer; }).filter(function(c){ return c != null; });
    var gem = cijfers.length ? cijfers.reduce(function(a, c){ return a + c; }, 0) / cijfers.length : null;
    var vold = cijfers.length ? Math.round(cijfers.filter(function(c){ return c >= 5.5; }).length / cijfers.length * 100) : null;
    var open = rijen.reduce(function(a, r){ return a + r.open; }, 0);
    var eersteOpen = an.filter(function(a){ return a.open; })[0];
    /* eerst nakijken, dan pas cijfers: zolang er antwoorden open staan is elk cijfer voorlopig */
    $('oproep').innerHTML = open ? '<div class="nakijkoproep"><div><b>' + open + (open === 1 ? ' antwoord wacht' : ' antwoorden wachten') + ' op jou.</b><span>Tot je ze hebt nagekeken zijn de cijfers hieronder voorlopig.</span></div>' +
      '<button class="knop" type="button" data-beginnakijk="' + (eersteOpen ? eersteOpen.i : 0) + '">Begin met nakijken</button></div>' : '';
    $('samen').innerHTML = tegel(rijen.length, 'ingeleverd') + tegel(komma(gem), open ? 'gemiddeld cijfer, voorlopig' : 'gemiddeld cijfer', open ? 'voorlopig' : '') +
      tegel(vold == null ? '–' : vold + '%', open ? 'voldoende, voorlopig' : 'voldoende', open ? 'voorlopig' : '') +
      (open ? '' : tegel(b.max, 'punten te halen'));
    var klein = rijen.length && rijen.length < 20 ? ' Met ' + rijen.length + (rijen.length === 1 ? ' leerling' : ' leerlingen') + ' is dat wankel: de bovenste 5% is dan ' + Math.max(1, Math.ceil(rijen.length * 0.05)) + (Math.max(1, Math.ceil(rijen.length * 0.05)) === 1 ? ' leerling' : ' leerlingen') + '.' : '';
    $('autoCes').textContent = b.norm.methode === 'auto' && b.cesuur != null ? 'Nu: een 5,5 bij ' + komma(b.cesuur, 1) + '% van de punten.' + klein : (rijen.length && rijen.length < 20 ? 'Bij minder dan twintig leerlingen is deze berekening wankel.' : '');
    /* verdeling */
    var ver = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; cijfers.forEach(function(c){ ver[Math.min(9, Math.max(0, Math.floor(c) - 1))]++; });
    var hoog = Math.max.apply(null, ver.concat([1]));
    $('verdeling').setAttribute('aria-label', ver.map(function(n, i){ return n + ' keer een ' + (i + 1); }).join(', '));
    $('verdeling').innerHTML = ver.map(function(n, i){ return '<div class="' + (i < 5 ? 'onv' : '') + '"><span>' + (n || '') + '</span><i style="height:' + Math.round(n / hoog * 100) + '%"></i><b>' + (i + 1) + '</b></div>'; }).join('');
    /* leerlingen */
    $('leerlingTabel').innerHTML = '<thead><tr><th>Naam</th><th>Klas</th><th class="getal">Punten</th><th class="getal">%</th><th class="getal">Cijfer</th><th>Nakijken</th><th></th></tr></thead><tbody>' +
      rijen.map(function(r){
        return '<tr><td data-l="Naam"><b>' + schoon(r.naam) + '</b>' + (r.pogingen > 1 ? ' <small class="tip">(' + r.pogingen + '×)</small>' : '') + '</td><td data-l="Klas">' + schoon(r.klas) + '</td>' +
          '<td class="getal" data-l="Punten">' + komma(r.score, r.score % 1 ? 1 : 0) + ' / ' + b.max + '</td><td class="getal" data-l="Procent">' + r.pct + '</td>' +
          '<td class="getal' + (r.cijfer < 5.5 ? ' onv' : '') + '" data-l="Cijfer"><b>' + komma(r.cijfer) + '</b>' + (r.open ? '<small>voorlopig</small>' : '') + '</td>' +
          '<td data-l="Nakijken">' + (r.open ? '<span class="pil let">' + r.open + ' open</span>' : '<span class="tip">klaar</span>') + '</td>' +
          '<td class="actie"><button class="knop stil klein" type="button" data-leerling="' + r.sid + '" aria-label="Bekijk ' + schoon(r.naam) + '">Bekijk</button></td></tr>';
      }).join('') + '</tbody>';
    /* per vraag */
    $('vraagTabel').innerHTML = '<thead><tr><th>#</th><th>Vraag</th><th class="getal">Punten</th><th class="getal">p</th><th class="getal">rit</th><th>Telt mee</th><th></th></tr></thead><tbody>' +
      an.map(function(a){
        return '<tr' + (a.telt ? '' : ' class="uit"') + '><td class="nr">' + (a.i + 1) + '</td><td class="vraagcel"><span class="soortpil">' + VORMNAAM[a.vorm] + '</span> ' + schoon(a.vraag) +
          (a.let ? '<small class="letop">' + schoon(a.let) + '</small>' : '') + '</td>' +
          '<td class="getal" data-l="Punten">' + a.punten + '</td><td class="getal" data-l="p">' + (a.p == null ? '–' : komma(a.p, 2)) + '<span class="pbalk"><i style="width:' + Math.round((a.p || 0) * 100) + '%"></i></span></td>' +
          '<td class="getal' + (a.rit != null && a.rit < 0.2 ? ' onv' : '') + '" data-l="rit">' + (a.rit == null ? '–' : komma(a.rit, 2)) + '</td>' +
          '<td data-l="Telt mee"><label class="vink klein"><input type="checkbox" data-telt="' + a.i + '"' + (a.telt ? ' checked' : '') + ' aria-label="Vraag ' + (a.i + 1) + ' telt mee"><span class="alleen-klein">telt mee</span></label></td>' +
          '<td class="actie"><button class="knop ' + (a.open ? '' : 'stil ') + 'klein" type="button" data-vraag="' + a.i + '">' + (a.open ? 'Nakijken (' + a.open + ')' : 'Antwoorden') + '</button></td></tr>';
      }).join('') + '</tbody>';
    if (paneel) tekenPaneel();
  }
  function tegel(waarde, uitleg, soort){ return '<div class="' + (soort || '') + '"><b>' + waarde + '</b><span>' + uitleg + '</span></div>'; }

  /* ---------- nakijken: per vraag of per leerling ---------- */
  function klik(e){
    var k = e.target.closest('button'); if (!k) return;
    if (k.hasAttribute('data-vraag')){ paneel = { soort: 'vraag', i: Number(k.getAttribute('data-vraag')), alleenOpen: an[Number(k.getAttribute('data-vraag'))].open > 0 }; tekenPaneel(true); }
    else if (k.hasAttribute('data-beginnakijk')){ paneel = { soort: 'vraag', i: Number(k.getAttribute('data-beginnakijk')), alleenOpen: true }; tekenPaneel(true); }
    else if (k.hasAttribute('data-stapnaar')){ paneel = { soort: 'vraag', i: Number(k.getAttribute('data-stapnaar')), alleenOpen: true }; tekenPaneel(true); }
    else if (k.hasAttribute('data-leerling')){ paneel = { soort: 'leerling', sid: k.getAttribute('data-leerling') }; tekenPaneel(true); }
    else if (k.hasAttribute('data-nk')){ var d = k.getAttribute('data-nk').split('|'); zetPunt(d[0], Number(d[1]), d[2] === 'auto' ? null : Number(d[2])); }
    else if (k.hasAttribute('data-stap')){ paneel.i = Math.max(0, Math.min(u.items.length - 1, paneel.i + Number(k.getAttribute('data-stap')))); tekenPaneel(true); }
    else if (k.hasAttribute('data-alleenopen')){ paneel.alleenOpen = !paneel.alleenOpen; tekenPaneel(); }
    else if (k.hasAttribute('data-sluit')){ paneel = null; $('nakijkPaneel').classList.add('hide'); }
    else if (k.hasAttribute('data-wis')){
      var r = u.rijen.filter(function(x){ return x.sid === k.getAttribute('data-wis'); })[0];
      if (!r || !confirm('De inlevering van ' + r.naam + ' weghalen? Dan kan ' + r.naam + ' de toets opnieuw maken. Dit kan niet terug.')) return;
      EIGEN.wisUitslag(code, r.sid).then(function(){ u.rijen = u.rijen.filter(function(x){ return x !== r; }); paneel = null; $('nakijkPaneel').classList.add('hide'); if (u.rijen.length) teken(); else open(code); })
        .catch(function(f){ alert('Weghalen lukte niet: ' + f.message); });
    }
  }
  function knoppen(r, i){
    var h = r.h && r.h[i], w = NAKIJK.waarde(r, i), auto = r.p[i];
    var k = function(p, tekst){ var aan = h !== undefined && h !== null ? h === p : false; return '<button type="button" class="nk' + (aan ? ' aan' : '') + '" data-nk="' + r.sid + '|' + i + '|' + p + '" aria-pressed="' + aan + '">' + tekst + '</button>'; };
    return '<span class="nkknoppen">' + k(1, 'Goed') + k(0.5, 'Half') + k(0, 'Fout') +
      (h !== undefined && h !== null ? '<button type="button" class="nk" data-nk="' + r.sid + '|' + i + '|auto">' + (auto == null ? 'Wissen' : 'Automatisch (' + pct(auto) + ')') + '</button>' : '') +
      '</span><span class="nkstand' + (w == null ? ' let' : '') + '">' + pct(w) + (h !== undefined && h !== null ? ' · met de hand' : '') + '</span>';
  }
  function tekenPaneel(focus){
    var el = $('nakijkPaneel'); el.classList.remove('hide');
    var h = '';
    if (paneel.soort === 'vraag'){
      var i = paneel.i, it = u.items[i];
      var rijen = zichtbaar().map(function(x){ return x.rij; }).filter(function(r){ return !paneel.alleenOpen || NAKIJK.waarde(r, i) == null; });
      h = '<div class="rij" style="justify-content:space-between"><h3>Vraag ' + (i + 1) + ' van ' + u.items.length + '</h3><span class="rij">' +
        '<button class="knop stil klein" type="button" data-stap="-1"' + (i ? '' : ' disabled') + '>Vorige</button><button class="knop stil klein" type="button" data-stap="1"' + (i < u.items.length - 1 ? '' : ' disabled') + '>Volgende</button>' +
        '<button class="knop stil klein" type="button" data-sluit>Sluiten</button></span></div>' +
        '<p><span class="soortpil">' + VORMNAAM[it.vorm] + '</span> <b>' + schoon(it.vraag) + '</b></p>' +
        '<p class="tip">Goed antwoord: ' + schoon(u.juist[i] || (it.vorm === 'open' ? 'geen, je kijkt zelf na' : '')) + (it.uitleg ? ' · ' + schoon(it.uitleg) : '') + '</p>' +
        '<button class="linkknop" type="button" data-alleenopen>' + (paneel.alleenOpen ? 'Laat alle antwoorden zien' : 'Alleen wat nog nagekeken moet worden') + '</button>' +
        '<div class="nklijst">' + (rijen.length ? rijen.map(function(r){
          return '<div class="nkrij"><div><b>' + schoon(r.naam) + '</b><p>' + schoon(antwoordTekst(it, r.a[i])) + '</p></div>' + knoppen(r, i) + '</div>';
        }).join('') : klaarTekst(i)) + '</div>';
    } else {
      var r = u.rijen.filter(function(x){ return x.sid === paneel.sid; })[0];
      if (!r){ el.classList.add('hide'); return; }
      var br = b.rijen.filter(function(x){ return x.sid === r.sid; })[0];
      /* per soort vraag: waar zit het */
      var soort = {};
      u.items.forEach(function(it, i){ var w = NAKIJK.waarde(r, i); if (w == null || (u.neutraal || []).indexOf(i) >= 0) return; var s = soort[it.vorm] = soort[it.vorm] || [0, 0]; s[0] += w * (it.punten || 1); s[1] += it.punten || 1; });
      h = '<div class="rij" style="justify-content:space-between"><h3>' + schoon(r.naam) + (r.klas ? ' <small class="tip">' + schoon(r.klas) + '</small>' : '') + '</h3><span class="rij">' +
        '<button class="knop gevaar klein" type="button" data-wis="' + r.sid + '">Inlevering weghalen</button><button class="knop stil klein" type="button" data-sluit>Sluiten</button></span></div>' +
        '<p>Cijfer <b>' + komma(br.cijfer) + '</b>' + (br.open ? ' (voorlopig)' : '') + ' · ' + komma(br.score, br.score % 1 ? 1 : 0) + ' van de ' + b.max + ' punten · ingeleverd ' +
          new Date(r.t).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '</p>' +
        '<div class="soortscore">' + Object.keys(soort).map(function(v){ var s = soort[v], p = s[1] ? s[0] / s[1] : 0; return '<div><span>' + VORMNAAM[v] + '</span><span class="pbalk"><i style="width:' + Math.round(p * 100) + '%"></i></span><b>' + Math.round(p * 100) + '%</b></div>'; }).join('') + '</div>' +
        '<div class="nklijst">' + u.items.map(function(it, i){
          return '<div class="nkrij' + ((u.neutraal || []).indexOf(i) >= 0 ? ' uit' : '') + '"><div><b>' + (i + 1) + '. ' + schoon(it.vraag) + '</b><p>' + schoon(antwoordTekst(it, r.a[i])) + '</p>' +
            (u.juist[i] ? '<small class="tip">Goed: ' + schoon(u.juist[i]) + '</small>' : '') + '</div>' + knoppen(r, i) + '</div>';
        }).join('') + '</div>';
    }
    el.innerHTML = h;
    if (focus){ el.scrollIntoView({ block: 'start' }); el.focus({ preventScroll: true }); }
  }
  /* alles bij deze vraag is nagekeken: door naar de volgende vraag met open antwoorden, of klaar */
  function klaarTekst(i){
    var volgende = an.filter(function(a){ return a.open && a.i !== i; })[0];
    if (volgende) return '<p class="leeg">Alles bij deze vraag is nagekeken. <button class="knop klein" type="button" data-stapnaar="' + volgende.i + '">Door naar vraag ' + (volgende.i + 1) + ' (' + volgende.open + ' open)</button></p>';
    var nogOpen = an.reduce(function(a, x){ return a + x.open; }, 0);
    return '<p class="leeg">' + (nogOpen ? 'Alles bij deze vraag is nagekeken.' : 'Alles is nagekeken. De cijfers hierboven zijn nu definitief.') + '</p>';
  }
  function zetPunt(sid, i, punt){
    var r = u.rijen.filter(function(x){ return x.sid === sid; })[0]; if (!r) return;
    var oud = r.h[i];
    if (punt === null) delete r.h[i]; else r.h[i] = punt;
    teken();
    EIGEN.nakijk(code, sid, i, punt).catch(function(f){
      if (oud === undefined) delete r.h[i]; else r.h[i] = oud;
      teken(); alert('Opslaan lukte niet: ' + f.message);
    });
  }
  function downloadCsv(){
    var rijen = zichtbaar(), sep = ';';
    var cel = function(x){ x = String(x == null ? '' : x); return /[;"\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
    var kop = ['Naam', 'Klas', 'Punten', 'Max', 'Procent', 'Cijfer', 'Voorlopig'].concat(u.items.map(function(it, i){ return 'V' + (i + 1); }));
    var regels = [kop.join(sep)].concat(rijen.map(function(r){
      return [r.naam, r.klas, komma(r.score, 2), b.max, r.pct, komma(r.cijfer), r.open ? 'ja' : ''].concat(u.items.map(function(it, i){ var w = NAKIJK.waarde(r.rij, i); return w == null ? '' : komma(w * (it.punten || 1), 2); })).map(cel).join(sep);
    }));
    var blob = new Blob(['﻿' + regels.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (u.naam || 'uitslag').replace(/[^\w\- ]+/g, '') + '.csv';
    document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ================= vergelijken ================= */
  var alle = null, gekozen = {}, vKlas = '', vSorteer = 'naam', open1 = '';
  function vergelijk(opts){
    terug = (opts && opts.terug) || terug;
    toon('vergelijkvak');
    $('vergelijkInhoud').innerHTML = '';
    var stukken = EIGEN.mijn().filter(function(m){ return m.soort !== 'lijst'; });
    if (!stukken.length){ $('vergelijkInhoud').innerHTML = '<p class="leeg">Je hebt nog geen oefeningen of toetsen gemaakt.</p>'; return; }
    melding($('vergelijkMelding'), 'Uitslagen ophalen van ' + stukken.length + (stukken.length === 1 ? ' toets' : ' toetsen') + '…');
    Promise.all(stukken.map(function(m){ return EIGEN.uitslagen(m.code).then(function(j){ return { code: m.code, naam: j.naam, u: j }; }, function(){ return null; }); }))
      .then(function(l){
        alle = l.filter(function(x){ return x && x.u.rijen.length; }).map(function(x){
          x.b = NAKIJK.bereken(x.u);
          x.t = Math.min.apply(null, x.u.rijen.map(function(r){ return r.t; }));
          return x;
        }).sort(function(a, c){ return a.t - c.t; });
        melding($('vergelijkMelding'), '');
        if (!alle.length){ $('vergelijkInhoud').innerHTML = '<p class="leeg">Er is nog niets ingeleverd bij je oefeningen en toetsen.</p>'; return; }
        gekozen = {}; alle.forEach(function(x){ gekozen[x.code] = true; });
        tekenVergelijk();
      });
  }
  function tekenVergelijk(){
    var sel = alle.filter(function(x){ return gekozen[x.code]; });
    var toetsen = sel.map(function(x){
      var b2 = vKlas ? Object.assign({}, x.b, { rijen: x.b.rijen.filter(function(r){ return r.klas === vKlas; }) }) : x.b;
      var c = b2.rijen.map(function(r){ return r.cijfer; }).filter(function(v){ return v != null; });
      b2.gem = c.length ? Math.round(c.reduce(function(a, v){ return a + v; }, 0) / c.length * 10) / 10 : null;
      b2.voldoende = c.length ? Math.round(c.filter(function(v){ return v >= 5.5; }).length / c.length * 100) : null;
      return { code: x.code, naam: x.naam, b: b2, x: x };
    });
    var v = NAKIJK.vergelijk(toetsen);
    var klassen = {}; alle.forEach(function(x){ x.u.rijen.forEach(function(r){ if (r.klas) klassen[r.klas] = 1; }); });
    var l = v.leerlingen.slice();
    if (vSorteer === 'laag') l.sort(function(a, c){ return (a.gem == null ? 99 : a.gem) - (c.gem == null ? 99 : c.gem); });
    if (vSorteer === 'lijn') l.sort(function(a, c){ return (a.trend == null ? 99 : a.trend) - (c.trend == null ? 99 : c.trend); });
    var aandacht = v.leerlingen.filter(function(w){ return (w.gem != null && w.gem < 5.5) || (w.trend != null && w.trend <= -1.5); });
    $('vergelijkInhoud').innerHTML =
      '<div class="kaart"><h3>Welke toetsen</h3><div class="toetskeus">' + alle.map(function(x){
        return '<label class="vink"><input type="checkbox" data-toets="' + x.code + '"' + (gekozen[x.code] ? ' checked' : '') + '> ' + schoon(x.naam) +
          ' <small class="tip">' + new Date(x.t).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) + '</small></label>';
      }).join('') + '</div>' +
      '<div class="rij" style="margin-top:10px">' + (Object.keys(klassen).length > 1 ? '<label class="tip">Klas <select class="veld mini" id="vKlas"><option value="">alle</option>' + Object.keys(klassen).sort().map(function(k){ return '<option' + (k === vKlas ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select></label>' : '') +
        '<label class="tip">Volgorde <select class="veld mini" id="vSorteer"><option value="naam">op naam</option><option value="laag"' + (vSorteer === 'laag' ? ' selected' : '') + '>laagste gemiddelde eerst</option><option value="lijn"' + (vSorteer === 'lijn' ? ' selected' : '') + '>grootste daling eerst</option></select></label></div></div>' +
      '<div class="kaart"><h3>Per toets</h3><div class="schuif"><table class="tabel"><thead><tr><th>Toets</th><th class="getal">Ingeleverd</th><th class="getal">Gemiddeld</th><th class="getal">Voldoende</th><th>Norm</th><th></th></tr></thead><tbody>' +
        toetsen.map(function(t){
          var n = t.b.norm;
          return '<tr><td>' + schoon(t.naam) + '</td><td class="getal">' + t.b.rijen.length + '</td><td class="getal' + (t.b.gem < 5.5 ? ' onv' : '') + '"><b>' + komma(t.b.gem) + '</b></td><td class="getal">' + (t.b.voldoende == null ? '–' : t.b.voldoende + '%') + '</td>' +
            '<td class="tip">' + (n.methode === 'nterm' ? 'N-term ' + komma(n.n) : n.methode === 'auto' ? 'automatisch, ' + komma(t.b.cesuur) + '%' : 'cesuur ' + komma(n.cesuur, 0) + '%') + '</td>' +
            '<td><button class="knop stil klein" type="button" data-naaropen="' + t.code + '">Resultaten</button></td></tr>';
        }).join('') + '</tbody></table></div></div>' +
      (aandacht.length ? '<div class="kaart aandacht"><h3>Aandacht</h3><p class="tip">Gemiddeld onder de 5,5, of het laatste cijfer anderhalve punt of meer lager dan het vorige.</p><ul>' +
        aandacht.map(function(w){ return '<li><b>' + schoon(w.naam) + '</b>' + (w.klas ? ' (' + schoon(w.klas) + ')' : '') + ': gemiddeld ' + komma(w.gem) + (w.trend != null && w.trend <= -1.5 ? ', laatste keer ' + komma(-w.trend) + ' lager' : '') + '</li>'; }).join('') + '</ul></div>' : '') +
      '<div class="kaart"><h3>Per leerling</h3><p class="tip">Leerlingen worden herkend aan hun klas en naam. Klik op een naam voor de sterke en zwakke soorten vragen.</p><div class="schuif"><table class="tabel matrix"><thead><tr><th>Leerling</th><th>Klas</th>' +
        toetsen.map(function(t, i){ return '<th class="getal" title="' + schoon(t.naam) + '">T' + (i + 1) + '</th>'; }).join('') + '<th class="getal">Gem.</th><th class="getal">Lijn</th></tr></thead><tbody>' +
        l.map(function(w){
          var sleutel = (w.klas || '') + '|' + w.naam;
          return '<tr><td><button class="linkknop" type="button" data-wie="' + schoon(sleutel) + '">' + schoon(w.naam) + '</button></td><td>' + schoon(w.klas || '') + '</td>' +
            w.cijfers.map(function(c){ return '<td class="getal' + (c != null && c < 5.5 ? ' onv' : '') + '">' + (c == null ? '<span class="tip">–</span>' : komma(c)) + '</td>'; }).join('') +
            '<td class="getal' + (w.gem != null && w.gem < 5.5 ? ' onv' : '') + '"><b>' + komma(w.gem) + '</b></td>' +
            '<td class="getal">' + (w.trend == null ? '' : w.trend > 0 ? '<span class="op">↑ ' + komma(w.trend) + '</span>' : w.trend < 0 ? '<span class="neer">↓ ' + komma(-w.trend) + '</span>' : '=') + '</td></tr>' +
            (open1 === sleutel ? '<tr class="detail"><td colspan="' + (toetsen.length + 4) + '">' + detail(w, toetsen) + '</td></tr>' : '');
        }).join('') + '</tbody></table></div>' +
        '<p class="tip">' + toetsen.map(function(t, i){ return 'T' + (i + 1) + ': ' + schoon(t.naam); }).join(' · ') + '</p></div>';
    var vk = $('vKlas'); if (vk) vk.addEventListener('change', function(){ vKlas = this.value; tekenVergelijk(); });
    $('vSorteer').addEventListener('change', function(){ vSorteer = this.value; tekenVergelijk(); });
  }
  /* Een leerling over alle gekozen toetsen: per soort vraag zijn score naast die van de klas. */
  function detail(w, toetsen){
    var hij = {}, klas = {};
    toetsen.forEach(function(t){
      var u2 = t.x.u;
      u2.rijen.forEach(function(r){
        var zelf = (r.klas || '') === (w.klas || '') && r.naam.toLowerCase().replace(/\s+/g, ' ').trim() === w.naam.toLowerCase().replace(/\s+/g, ' ').trim();
        if (vKlas && r.klas !== vKlas) return;
        u2.items.forEach(function(it, i){
          if ((u2.neutraal || []).indexOf(i) >= 0) return;
          var v = NAKIJK.waarde(r, i); if (v == null) return;
          var p = it.punten || 1;
          var k = klas[it.vorm] = klas[it.vorm] || [0, 0]; k[0] += v * p; k[1] += p;
          if (zelf){ var hh = hij[it.vorm] = hij[it.vorm] || [0, 0]; hh[0] += v * p; hh[1] += p; }
        });
      });
    });
    var soorten = Object.keys(hij);
    if (!soorten.length) return '<span class="tip">Nog niets om te laten zien.</span>';
    return '<div class="soortscore">' + soorten.map(function(s){
      var p = hij[s][0] / hij[s][1], k = klas[s] ? klas[s][0] / klas[s][1] : 0, verschil = Math.round((p - k) * 100);
      return '<div><span>' + VORMNAAM[s] + '</span><span class="pbalk"><i style="width:' + Math.round(p * 100) + '%"></i><em style="left:' + Math.round(k * 100) + '%" title="klas"></em></span><b>' + Math.round(p * 100) + '%</b>' +
        '<small class="' + (verschil < -10 ? 'onv' : '') + '">' + (verschil >= 0 ? '+' : '') + verschil + ' t.o.v. klas</small></div>';
    }).join('') + '</div>';
  }
  document.addEventListener('click', function(e){
    var k = e.target.closest('button, input'); if (!k) return;
    if (k.hasAttribute('data-uitslagterug')){ clearTimeout(bewaarTimer); terug(); }
    if (k.hasAttribute('data-naaropen')) open(k.getAttribute('data-naaropen'));
    if (k.hasAttribute('data-wie')){ var s = k.getAttribute('data-wie'); open1 = open1 === s ? '' : s; tekenVergelijk(); }
    if (k.hasAttribute('data-toets')){ gekozen[k.getAttribute('data-toets')] = k.checked; tekenVergelijk(); }
  });
  return { open: open, vergelijk: vergelijk };
})();
