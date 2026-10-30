/* De resultaten van een eigen oefening of toets (maken.html): het overzicht, het
   nakijken, de norm, de analyse per vraag, papieren toetsen invoeren en toetsen
   met elkaar vergelijken. Rekenen doet nakijk.js; praten met de server eigen.js;
   de volgorde van versie B komt uit papier.js.

     UITSLAG.open(code, opts)  het resultatenscherm van een stuk
                               opts.terug()      terug naar Mijn materiaal
                               opts.bewerk(code) naar de editor
                               opts.nakijken     meteen beginnen met nakijken
     UITSLAG.vergelijk(opts)   alle eigen toetsen naast elkaar

   Drie standen bij een stuk: Resultaten (uitslagvak), Nakijken (nakijkvak, een
   antwoord tegelijk, met de toetsen 1, 2 en 3) en Papieren toets invoeren
   (papiervak). Een papieren toets is een gewone inlevering met papier en versie
   erbij; de punten staan in h, net als met de hand nagekeken antwoorden. */
var UITSLAG = (function(){
  'use strict';
  function $(id){ return document.getElementById(id); }
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function melding(el, tekst, soort){ if (!el) return; el.textContent = tekst || ''; el.className = 'melding' + (soort ? ' ' + soort : ''); }
  function komma(x, n){ return x == null ? '–' : Number(x).toFixed(n == null ? 1 : n).replace('.', ','); }
  function getal(x){ x = Math.round(x * 100) / 100; return komma(x, x % 1 ? (Math.round(x * 10) === x * 10 ? 1 : 2) : 0); }
  function pct(w){ return w == null ? 'nog niet nagekeken' : Math.round(w * 100) + '%'; }
  function meer(n, een, veel){ return n + ' ' + (n === 1 ? een : veel); }
  var VORMNAAM = { mk: 'Meerkeuze', open: 'Open', koppel: 'Koppelen', volgorde: 'Volgorde', groepen: 'Groepen', gaten: 'Gatentekst', aanwijzen: 'Aanwijzen',
    topo: 'Topografie', 'topo-wijs': 'Kaart: aanwijzen', 'topo-typ': 'Kaart: typen', 'topo-kies': 'Kaart: kiezen' };
  /* topografie telt per manier van vragen: aanwijzen, typen of kiezen */
  function soortVan(it){ return it.vorm === 'topo' ? 'topo-' + (it.wijze || 'wijs') : it.vorm; }
  /* bij typen en kiezen staat de plek niet in de vraag; voor de docent wel erbij */
  function vraagVan(it){ return it.vorm === 'topo' && it.wijze !== 'wijs' ? it.vraag.replace(/ Typ de naam\.$/, '') + ' (' + it.naam + ')' : it.vraag; }
  function ptn(it){ return it && it.punten ? it.punten : 1; }
  function afbHtml(it){
    if (!it.afb) return '';
    return '<div class="paneelafb"><div class="beeld"><img alt="" src="' + schoon(EIGEN.afbAdres(code, it.afb)) + '">' +
      (it.vorm === 'aanwijzen' ? it.plekken.map(function(p, i){ return '<span class="stip" style="left:' + Number(p.x) + '%;top:' + Number(p.y) + '%">' + (i + 1) + '</span>'; }).join('') : '') + '</div></div>';
  }
  var PIJL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  var opts = {}, terug = function(){};
  var code = '', u = null, b = null, an = null, klasFilter = null, bewaard = null, leerling = null, alleRijen = false;

  var SECTIES = ['lijstvak', 'bewerkvak', 'uitslagvak', 'vergelijkvak', 'nakijkvak', 'papiervak'];
  function toon(sectie){
    SECTIES.forEach(function(s){ var el = $(s); if (el) el.classList.toggle('hide', s !== sectie); });
    var kop = $('paginakop'); if (kop) kop.classList.add('hide');
    document.body.classList.add('uitslagstand');
    window.scrollTo(0, 0);
  }
  function zichtbaar(){ return b.rijen.filter(function(r){ return klasFilter === null || r.klas === klasFilter; }); }
  function rijVan(sid){ return u.rijen.filter(function(x){ return x.sid === sid; })[0] || null; }
  function telt(i){ return (u.neutraal || []).indexOf(i) < 0; }

  /* het antwoord van een leerling leesbaar, per vorm */
  function antwoordTekst(it, a, r){
    if (r && r.papier) return 'Op papier gemaakt (versie ' + (r.versie || 'A') + ')';
    if (a == null || a === '' || (Array.isArray(a) && !a.length)) return '(niets ingevuld)';
    switch (it.vorm){
      case 'koppel': return it.paren.map(function(p, i){ return p.a + ' → ' + (a[i] || '—'); }).join('; ');
      case 'volgorde': return a.join(' → ');
      case 'groepen': return it.groepen.map(function(g){ return g.naam + ': ' + (a.filter(function(x){ return x[1] === g.naam; }).map(function(x){ return x[0]; }).join(', ') || '—'); }).join('; ');
      case 'gaten': { var i = 0; return String(it.tekst).replace(/\[[^\]]+\]/g, function(){ return '[' + (a[i++] || '…') + ']'; }); }
      case 'aanwijzen': return it.plekken.map(function(p, k){ return (k + 1) + ': ' + (a[k] || '—'); }).join('; ');
      case 'topo': return it.wijze === 'wijs' ? 'wees ' + a + ' aan' : String(a);
    }
    return String(a);
  }
  /* hetzelfde antwoord: hoofdletters en spaties tellen niet */
  function gelijkVan(it, r, i){ return r.papier ? null : antwoordTekst(it, r.a[i], r).toLowerCase().replace(/\s+/g, ' ').trim(); }

  /* ================= een stuk openen ================= */
  function open(c, o){
    opts = Object.assign({}, opts, o || {}); if (o && o.terug) terug = o.terug;
    code = c; u = null; leerling = null; klasFilter = null; alleRijen = false; nk = null;
    toon('uitslagvak');
    $('uitslagKop').textContent = 'Resultaten';
    $('rsBewerk').classList.toggle('hide', !opts.bewerk);
    var vlak = function(h){ return '<i class="skelet skelet-kaart" style="--h:' + h + 'px"></i>'; };
    $('uitslagInhoud').setAttribute('aria-busy', 'true');
    $('uitslagInhoud').innerHTML = '<div class="skelet-vak" role="status"><span class="skelet-sr">Resultaten laden…</span>' +
      '<div class="rstegels" style="margin-bottom:16px">' + vlak(78) + vlak(78) + vlak(78) + vlak(78) + '</div>' +
      '<div class="rsmidden" style="margin-bottom:16px">' + vlak(320) + vlak(320) + '</div>' + vlak(260) + '</div>';
    melding($('uitslagMelding'), 'Ophalen…');
    var nakijken = !!(o && o.nakijken);
    EIGEN.uitslagen(code).then(function(j){
      u = j; u.neutraal = u.neutraal || []; bewaard = JSON.parse(JSON.stringify(u.norm));
      melding($('uitslagMelding'), '');
      $('uitslagInhoud').removeAttribute('aria-busy');
      $('uitslagKop').innerHTML = schoon(u.naam) + ' <span>· resultaten</span>';
      document.title = u.naam + ' · resultaten · meneer Greidanus';
      tekenAlles();
      if (nakijken && u.rijen.length){ b = NAKIJK.bereken(u); an = NAKIJK.analyse(u, b); beginNakijken(); }
    }).catch(function(f){
      melding($('uitslagMelding'), f.message, 'fout');
      $('uitslagInhoud').removeAttribute('aria-busy');
      $('uitslagInhoud').innerHTML = '<p class="leeg"><button class="knop stil klein" type="button" id="uitslagOpnieuw">Probeer opnieuw</button></p>';
      $('uitslagOpnieuw').addEventListener('click', function(){ open(c); });
    });
  }
  function tekenAlles(){
    if (!u.rijen.length){
      $('uitslagInhoud').innerHTML = '<div class="kaart rsleeg"><p><b>Nog niemand heeft ingeleverd.</b> Deel de code <span class="mcode">' + schoon(code) + '</span> met je klas; de antwoorden komen hier binnen zodra een leerling klaar is.</p>' +
        '<p class="tip">Maakten leerlingen de toets op papier? Print hem met Op papier, en zet daarna per leerling de punten erin.</p>' +
        '<div class="rij"><button class="knop" type="button" data-papierinvoer>Papieren toets invoeren</button><a class="knop stil" href="papieren-toets.html?code=' + schoon(code) + '" target="_blank" rel="noopener">Op papier printen</a></div></div>';
      return;
    }
    opbouw(); teken();
  }
  function opbouw(){
    var topo = u.items.some(function(it){ return it.vorm === 'topo'; });
    $('uitslagInhoud').innerHTML =
      '<div class="rsklassen" id="rsKlassen" role="group" aria-label="Klas"></div>' +
      '<div id="rsOproep"></div>' +
      '<section class="rstegels" id="rsTegels" aria-label="Samenvatting"></section>' +
      '<section class="kaart rsleerling hide" id="rsLeerling" tabindex="-1" aria-label="Een leerling"></section>' +
      '<div class="rsmidden">' +
        '<section class="paneel rsleerlingen" aria-labelledby="rsLlKop">' +
          '<div class="rspkop"><h3 class="kopje" id="rsLlKop">Leerlingen</h3><span class="tip rsklik">klik op een naam voor alle antwoorden</span>' +
          '<span class="rspknoppen"><button class="knop stil klein" type="button" data-papierinvoer>Papieren toets invoeren</button><button class="knop stil klein" type="button" id="csv">Downloaden (Excel)</button></span></div>' +
          '<div id="rsTabel"></div></section>' +
        '<aside class="paneel rsnorm" aria-labelledby="rsNormKop">' +
          '<h3 class="kopje" id="rsNormKop">Zo wordt het een cijfer</h3>' +
          '<div class="seg" role="radiogroup" aria-labelledby="rsNormKop">' +
            [['cesuur', 'Cesuur'], ['nterm', 'N-term'], ['auto', 'Automatisch']].map(function(x){ return '<label><input type="radio" name="normm" value="' + x[0] + '"><span>' + x[1] + '</span></label>'; }).join('') + '</div>' +
          '<div id="rsNormRegel"></div>' +
          '<div class="rseffect hide" id="rsEffect" role="status" aria-live="polite"></div>' +
          '<p class="tip rsnormtip" id="rsNormTip"></p>' +
          '<p class="melding" id="normMelding" role="status" aria-live="polite"></p>' +
          '<div class="rsverdeling"><p class="kopje">Verdeling van de cijfers</p><div class="balkjes" id="verdeling" role="img"></div></div>' +
        '</aside>' +
      '</div>' +
      (topo ? '<section class="paneel rsplek" aria-labelledby="rsPlekKop"><h3 class="kopje" id="rsPlekKop">Per plek</h3><p class="tip">Welk deel van de klas elke plek goed had, over alle vragen erover. De lastigste staan bovenaan.</p><div class="perplek" id="perPlek"></div></section>' : '') +
      '<section class="paneel rsvragen" aria-labelledby="rsVrKop"><div class="rspkop"><h3 class="kopje" id="rsVrKop">Per vraag</h3><span class="tip">hoeveel er goed hadden, en of de vraag de sterke en zwakke leerlingen uit elkaar haalt</span></div><div id="rsVragen"></div></section>' +
      (u.modus === 'toets' ? '<section class="paneel rsterug" id="rsTerug" aria-label="Wat leerlingen terugzien"></section>' : '');
    zetNormKeuze(); tekenNormRegel();
    $('csv').addEventListener('click', downloadCsv);
  }

  /* ---------- de norm: eerst het effect zien, dan bewaren ---------- */
  function zetNormKeuze(){ [].forEach.call(document.querySelectorAll('input[name="normm"]'), function(r){ r.checked = r.value === u.norm.methode; }); }
  function tekenNormRegel(){
    var n = u.norm, h = '';
    if (n.methode === 'cesuur') h = '<label class="rsschuif"><span id="rsNormTekst"></span><input type="range" id="normCes" min="20" max="90" step="1" value="' + Math.round(n.cesuur) + '" aria-label="Cesuur in procenten"></label>';
    else if (n.methode === 'nterm') h = '<label class="rsschuif"><span id="rsNormTekst"></span><input type="range" id="normN" min="0" max="3" step="0.1" value="' + n.n + '" aria-label="N-term"></label>';
    else h = '<p class="rsschuif" id="rsNormTekst"></p>';
    $('rsNormRegel').innerHTML = h;
  }
  function normTekst(){
    var el = $('rsNormTekst'); if (!el) return;
    var n = u.norm;
    if (n.methode === 'cesuur') el.innerHTML = 'Een 5,5 bij <b>' + Math.round(n.cesuur) + '%</b> van de punten <span class="tip">(' + getal(b.max * n.cesuur / 100) + ' van ' + getal(b.max) + ')</span>';
    else if (n.methode === 'nterm') el.innerHTML = 'Cijfer = 9 × score / maximum + <b>' + komma(n.n) + '</b> <span class="tip">zoals bij de centrale examens</span>';
    else el.innerHTML = b.cesuur != null ? 'Nu een 5,5 bij <b>' + komma(b.cesuur) + '%</b> van de punten <span class="tip">(' + getal(b.max * b.cesuur / 100) + ' van ' + getal(b.max) + ')</span>' : 'Nog niets om mee te rekenen.';
  }
  function zelfdeNorm(x, y){ return x.methode === y.methode && (x.methode !== 'cesuur' || Math.round(x.cesuur * 10) === Math.round(y.cesuur * 10)) && (x.methode !== 'nterm' || Math.round(x.n * 10) === Math.round(y.n * 10)); }
  function normNaam(n, ces){ return n.methode === 'nterm' ? 'N-term ' + komma(n.n) : n.methode === 'auto' ? 'automatisch' + (ces != null ? ', ' + komma(ces) + '%' : '') : 'cesuur ' + Math.round(n.cesuur) + '%'; }
  function tekenEffect(){
    var el = $('rsEffect'); if (!el) return;
    if (zelfdeNorm(u.norm, bewaard)){ el.classList.add('hide'); el.innerHTML = ''; return; }
    var oud = NAKIJK.bereken(Object.assign({}, u, { norm: bewaard })), voor = {};
    oud.rijen.forEach(function(r){ voor[r.sid] = r.cijfer; });
    var zakt = 0, stijgt = 0;
    b.rijen.forEach(function(r){ var v = voor[r.sid]; if (v == null || r.cijfer == null) return; if (v >= 5.5 && r.cijfer < 5.5) zakt++; if (v < 5.5 && r.cijfer >= 5.5) stijgt++; });
    var delen = [];
    if (stijgt) delen.push('<b>' + meer(stijgt, 'leerling komt', 'leerlingen komen') + '</b> boven de 5,5');
    if (zakt) delen.push('<b>' + meer(zakt, 'leerling zakt', 'leerlingen zakken') + '</b> onder de 5,5');
    var zin = delen.length ? delen.join(' en ') + '.' : 'Geen cijfer verandert van kant.';
    if (oud.gem != null && b.gem != null && oud.gem !== b.gem) zin += ' Het gemiddelde gaat van ' + komma(oud.gem) + ' naar ' + komma(b.gem) + '.';
    el.innerHTML = '<p>Vergeleken met de bewaarde norm (' + normNaam(bewaard, oud.cesuur) + '): ' + zin + '</p>' +
      '<div class="rij"><button class="knop klein" type="button" id="normBewaar">Bewaar deze norm</button><button class="knop stil klein" type="button" id="normTerug">Terug naar de bewaarde</button></div>';
    el.classList.remove('hide');
  }
  function bewaarInstel(x, klaar, el){
    return EIGEN.instel(code, x).then(function(){ melding(el || $('normMelding'), klaar, 'goed'); })
      .catch(function(f){ melding(el || $('normMelding'), 'Opslaan lukte niet: ' + f.message, 'fout'); throw f; });
  }

  /* ---------- het overzicht tekenen ---------- */
  function teken(){
    b = NAKIJK.bereken(u); an = NAKIJK.analyse(u, b);
    if (nk && !$('nakijkvak').classList.contains('hide')) nkTeken();
    if (!$('rsTabel')) return;
    var rijen = zichtbaar(), cijfers = rijen.map(function(r){ return r.cijfer; }).filter(function(c){ return c != null; });
    var gem = cijfers.length ? cijfers.reduce(function(a, c){ return a + c; }, 0) / cijfers.length : null;
    var vold = cijfers.filter(function(c){ return c >= 5.5; }).length;
    var open = rijen.reduce(function(a, r){ return a + r.open; }, 0), klaar = rijen.filter(function(r){ return !r.open; }).length;
    var papier = rijen.filter(function(r){ return r.rij.papier; }).length;
    tekenKlassen();
    /* eerst nakijken, dan pas cijfers: zolang er antwoorden open staan is elk cijfer voorlopig */
    var openVragen = an.filter(function(a){ return a.telt && openIn(a.i, rijen); });
    $('rsOproep').innerHTML = open ? '<section class="rsoproep" aria-label="Nakijken"><div class="rsoptekst"><b>Nog ' + meer(open, 'antwoord', 'antwoorden') + ' nakijken</b>' +
      '<span>bij ' + openVragen.slice(0, 3).map(function(a){ return 'vraag ' + (a.i + 1); }).join(', ').replace(/, ([^,]*)$/, ' en $1') + (openVragen.length > 3 ? ' en nog ' + (openVragen.length - 3) + ' andere' : '') + '. Tot die klaar zijn, zijn de cijfers voorlopig.</span></div>' +
      '<div class="rsvoortgang"><div class="rsbalk"><i style="width:' + Math.round(klaar / Math.max(1, rijen.length) * 100) + '%"></i></div><small>' + klaar + ' van ' + rijen.length + ' helemaal nagekeken</small></div>' +
      '<button class="knop rsbegin" type="button" data-beginnakijk>Begin met nakijken</button></section>' : '';
    var vl = open ? ' <i class="voorlopig">voorlopig</i>' : '';
    $('rsTegels').innerHTML =
      '<div class="rstegel"><span>Gemiddeld cijfer' + vl + '</span><b' + (gem != null && gem < 5.5 ? ' class="onv"' : '') + '>' + komma(gem) + '</b></div>' +
      '<div class="rstegel"><span>Voldoende' + vl + '</span><b>' + vold + ' <small>van ' + cijfers.length + '</small></b></div>' +
      '<div class="rstegel"><span>Ingeleverd</span><b>' + rijen.length + (papier ? ' <small>waarvan ' + papier + ' op papier</small>' : '') + '</b></div>' +
      (open ? '<button type="button" class="rstegel let" data-beginnakijk aria-label="Na te kijken: ' + open + '. Begin met nakijken"><span>Na te kijken</span><b>' + open + ' <span aria-hidden="true">→</span></b></button>'
            : '<div class="rstegel klaar"><span>Na te kijken</span><b>0 <small>alles nagekeken</small></b></div>');
    /* de norm */
    zetNormKeuze(); normTekst(); tekenEffect();
    var weinig = b.rijen.length < 20;
    $('rsNormTip').textContent = u.norm.methode === 'auto'
      ? 'Automatisch (Cohen-Schotanus) rekent met de beste 5% van de leerlingen en de raadkans.' + (weinig ? ' Met ' + meer(b.rijen.length, 'leerling', 'leerlingen') + ' is dat wankel: de beste 5% is dan ' + meer(Math.max(1, Math.ceil(b.rijen.length * 0.05)), 'leerling', 'leerlingen') + '. Kies liever een cesuur.' : '')
      : 'Automatisch rekent met de beste leerlingen en de raadkans (Cohen-Schotanus).' + (weinig ? ' Bij minder dan twintig leerlingen is dat wankel.' : '');
    $('rsNormTip').classList.toggle('let', u.norm.methode === 'auto' && weinig);
    var ver = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; cijfers.forEach(function(c){ ver[Math.min(9, Math.max(0, Math.floor(c) - 1))]++; });
    var hoog = Math.max.apply(null, ver.concat([1]));
    $('verdeling').setAttribute('aria-label', ver.map(function(n, i){ return n + ' keer een ' + (i + 1); }).join(', '));
    $('verdeling').innerHTML = ver.map(function(n, i){ return '<div class="' + (i < 5 ? 'onv' : '') + '"><span>' + (n || '') + '</span><i style="height:' + Math.round(n / hoog * 100) + '%"></i><b>' + (i + 1) + '</b></div>'; }).join('');
    tekenTabel(rijen); tekenVragen(rijen);
    if ($('perPlek')) tekenPerPlek(rijen);
    if ($('rsTerug')) $('rsTerug').innerHTML = '<div class="rsterugtekst"><b>' + (u.terugzien ? 'Leerlingen zien hun score en de goede antwoorden' : 'Leerlingen zien alleen hun score') + '</b>' +
      '<span>' + (u.terugzien ? 'Zet het uit als de toets nog in een andere klas komt.' : 'Zet de goede antwoorden aan als alle klassen de toets gemaakt hebben.') + '</span></div>' +
      '<button class="knop stil" type="button" id="terugzienWissel">' + (u.terugzien ? 'Alleen de score laten zien' : 'Goede antwoorden laten zien') + '</button><p class="melding" id="terugMelding" role="status" aria-live="polite"></p>';
    if (leerling) tekenLeerling();
  }
  function openIn(i, rijen){ return rijen.filter(function(r){ return NAKIJK.waarde(r.rij, i) == null; }).length; }
  function tekenKlassen(){
    var per = {}, volg = [];
    b.rijen.forEach(function(r){ if (!(r.klas in per)){ per[r.klas] = 0; volg.push(r.klas); } per[r.klas]++; });
    volg.sort(function(x, y){ return (x ? 0 : 1) - (y ? 0 : 1) || x.localeCompare(y, 'nl'); });
    if (volg.length < 2){ $('rsKlassen').innerHTML = ''; klasFilter = null; return; }
    var knop = function(w, tekst, n){ var aan = klasFilter === w; return '<button type="button" class="klasknop' + (aan ? ' aan' : '') + '" aria-pressed="' + aan + '" data-klas="' + (w === null ? '*' : schoon(w)) + '">' + tekst + ' · ' + n + '</button>'; };
    $('rsKlassen').innerHTML = '<span class="rsklaslabel">Klas</span>' + knop(null, 'Alle klassen', b.rijen.length) + volg.map(function(k){ return knop(k, k ? schoon(k) : 'zonder klas', per[k]); }).join('');
  }
  function tekenTabel(rijen){
    var kort = !alleRijen && rijen.length > 20, l = kort ? rijen.slice(0, 15) : rijen;
    $('rsTabel').innerHTML = '<div class="schuif"><table class="tabel kaartjes rstabel"><thead><tr><th>Naam</th><th>Klas</th><th class="getal">Punten</th><th class="getal">Cijfer</th><th><span class="sronly">Nakijken</span></th></tr></thead><tbody>' +
      l.map(function(r){
        return '<tr' + (leerling === r.sid ? ' class="aan"' : '') + '><td data-l=""><button class="linkknop rsnaam" type="button" data-leerling="' + schoon(r.sid) + '">' + schoon(r.naam) + '</button>' +
            (r.rij.papier ? ' <span class="papierlabel" title="Op papier gemaakt, versie ' + schoon(r.rij.versie || 'A') + '">papier · ' + schoon(r.rij.versie || 'A') + '</span>' : '') +
            (r.pogingen > 1 ? ' <small class="tip">(' + r.pogingen + '×)</small>' : '') + '</td>' +
          '<td data-l="Klas">' + schoon(r.klas || '–') + '</td>' +
          '<td class="getal" data-l="Punten">' + getal(r.score) + ' / ' + getal(b.max) + '</td>' +
          '<td class="getal' + (r.cijfer != null && r.cijfer < 5.5 ? ' onv' : '') + '" data-l="Cijfer"><b>' + komma(r.cijfer) + '</b></td>' +
          '<td data-l="">' + (r.open ? '<span class="pil let">' + r.open + ' open</span>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      (kort ? '<button class="linkknop" type="button" id="alleRijen">Alle ' + rijen.length + ' leerlingen</button>' : '');
  }
  /* Per vraag in gewone taal: hoeveel er goed hadden, en of de vraag onderscheidt.
     Een vraag die verdacht is, krijgt de uitleg en de knop om hem niet mee te laten tellen. */
  function onderscheid(a){
    if (a.n < 5 || a.rit == null) return { t: '–', k: '', titel: 'Te weinig nagekeken antwoorden om iets te zeggen.' };
    var titel = 'rit ' + komma(a.rit, 2) + ': hoe sterk goed op deze vraag samenhangt met goed op de rest van de toets. Onder 0,2 is zwak.';
    return a.rit >= 0.3 ? { t: 'goed', k: 'goed', titel: titel } : a.rit >= 0.2 ? { t: 'redelijk', k: '', titel: titel } : { t: 'niet', k: 'onv', titel: titel };
  }
  function verdacht(a){
    if (!a.telt || a.n < 5) return '';
    if (a.rit != null && a.rit < 0.2) return 'Let op: wie de rest goed had, had deze niet vaker goed. Klopt het goede antwoord, en is de vraag duidelijk?';
    if (a.p != null && a.p < 0.25) return 'Bijna niemand had deze goed. Klopt het goede antwoord, en is de stof behandeld?';
    return '';
  }
  function tekenVragen(rijen){
    $('rsVragen').innerHTML = '<div class="vrrij vrkop" aria-hidden="true"><span>Nr</span><span>Vraag</span><span>Goed</span><span>Onderscheidt</span><span></span></div>' +
      an.map(function(a){
        var it = u.items[a.i], v = verdacht(a), o = onderscheid(a), open = openIn(a.i, rijen), pc = a.p == null ? null : Math.round(a.p * 100);
        var actie = !a.telt ? '<button class="knop stil klein" type="button" data-neutraal="' + a.i + '" data-aan="1">Laat weer meetellen</button>'
          : open ? '<button class="knop klein" type="button" data-nkvraag="' + a.i + '">Nakijken (' + open + ')</button>'
          : v ? '<button class="knop stil klein" type="button" data-neutraal="' + a.i + '">Laat niet meetellen</button>'
          : '<button class="linkknop" type="button" data-nkvraag="' + a.i + '" data-alle="1">Antwoorden</button>';
        return '<div class="vrrij' + (v ? ' verdacht' : '') + (a.telt ? '' : ' uit') + '"><b class="vrnr">' + (a.i + 1) + '</b>' +
          '<span class="vrtekst"><button class="linkknop vrknop" type="button" data-nkvraag="' + a.i + '" data-alle="1">' + schoon(vraagVan(it)) + '</button> <span class="tip">· ' + VORMNAAM[soortVan(it)].toLowerCase() + ' · ' + meer(ptn(it), 'punt', 'punten') + '</span>' +
            (!a.telt ? '<small class="vruitleg">Telt niet mee: niemand krijgt er punten voor, en het maximum is lager.</small>' : v ? '<small class="vruitleg">' + v + '</small>' : '') + '</span>' +
          '<span class="vrgoed" data-l="Goed"><span class="rsbalk klein"><i style="width:' + (pc || 0) + '%"></i></span><span class="getal">' + (pc == null ? '–' : pc + '%') + '</span></span>' +
          '<span class="vrond ' + o.k + '" data-l="Onderscheidt" title="' + schoon(o.titel) + '">' + o.t + '</span>' +
          '<span class="vractie">' + actie + '</span></div>';
      }).join('');
  }
  /* Topografie: per plek hoe vaak het goed ging, over alle vragen over die plek */
  function tekenPerPlek(rijen){
    var per = {}, volg = [];
    u.items.forEach(function(it, i){
      if (it.vorm !== 'topo' || !telt(i)) return;
      var s = it.kaart + '|' + it.plek;
      if (!per[s]){ per[s] = { naam: it.naam, goed: 0, n: 0, wijze: {} }; volg.push(s); }
      rijen.forEach(function(r){
        var w = NAKIJK.waarde(r.rij, i); if (w == null) return;
        per[s].goed += w; per[s].n++;
        var z = per[s].wijze[it.wijze] = per[s].wijze[it.wijze] || [0, 0]; z[0] += w; z[1]++;
      });
    });
    var l = volg.map(function(s){ return per[s]; }).filter(function(p){ return p.n; }).sort(function(a, c){ return a.goed / a.n - c.goed / c.n || a.naam.localeCompare(c.naam, 'nl'); });
    var WZ = { wijs: 'aanwijzen', typ: 'typen', kies: 'kiezen' };
    $('perPlek').innerHTML = l.length ? l.map(function(p){
      var pc = Math.round(p.goed / p.n * 100), wz = Object.keys(p.wijze);
      return '<div class="' + (pc < 55 ? 'onv' : '') + '"><b>' + schoon(p.naam) + '</b><span class="pbalk"><i style="width:' + pc + '%"></i></span><span class="getal">' + pc + '%</span>' +
        '<small>' + (wz.length > 1 ? wz.map(function(w){ return WZ[w] + ' ' + Math.round(p.wijze[w][0] / p.wijze[w][1] * 100) + '%'; }).join(' · ') : (WZ[wz[0]] || '') + ', ' + meer(p.n, 'antwoord', 'antwoorden')) + '</small></div>';
    }).join('') : '<p class="tip">Nog niets om te laten zien.</p>';
  }

  /* ---------- een leerling: alle antwoorden, met Vorige en Volgende ---------- */
  function oordeelKnoppen(r, i){
    var it = u.items[i], h = r.h && r.h[i], heeft = h !== undefined && h !== null, w = NAKIJK.waarde(r, i), auto = r.p[i], p = ptn(it);
    var k = function(x, tekst){ var aan = heeft && Math.abs(h - x) < 0.001; return '<button type="button" class="nk' + (aan ? ' aan' : '') + '" data-nk="' + r.sid + '|' + i + '|' + x + '" aria-pressed="' + aan + '">' + tekst + '</button>'; };
    var keus = p > 1 ? '<label class="nkpunten"><span class="sronly">Punten voor vraag ' + (i + 1) + '</span><select class="veld mini" data-nkpunt="' + r.sid + '|' + i + '"><option value="">punten</option>' +
      Array.apply(null, Array(p + 1)).map(function(x, n){ var aan = heeft && Math.abs(h * p - n) < 0.01; return '<option value="' + n + '"' + (aan ? ' selected' : '') + '>' + n + ' van ' + p + '</option>'; }).join('') + '</select></label>' : '';
    return '<span class="nkknoppen">' + k(1, 'Goed') + k(0.5, 'Half') + k(0, 'Fout') + keus +
      (heeft ? '<button type="button" class="nk" data-nk="' + r.sid + '|' + i + '|auto">' + (auto == null ? 'Wissen' : 'Automatisch (' + pct(auto) + ')') + '</button>' : '') +
      '</span><span class="nkstand' + (w == null ? ' let' : '') + '">' + (w == null ? 'nog niet nagekeken' : getal(w * p) + ' van ' + p + (heeft ? ' · met de hand' : '')) + '</span>';
  }
  function tekenLeerling(focus){
    var el = $('rsLeerling'), r = rijVan(leerling);
    if (!el) return;
    if (!r){ leerling = null; el.classList.add('hide'); return; }
    var lijst = zichtbaar(), k = lijst.map(function(x){ return x.sid; }).indexOf(r.sid);
    var br = b.rijen.filter(function(x){ return x.sid === r.sid; })[0];
    var soort = {};
    u.items.forEach(function(it, i){ var w = NAKIJK.waarde(r, i); if (w == null || !telt(i)) return; var s = soort[soortVan(it)] = soort[soortVan(it)] || [0, 0]; s[0] += w * ptn(it); s[1] += ptn(it); });
    el.innerHTML = '<div class="rspkop"><h3>' + schoon(r.naam) + (r.klas ? ' <small class="tip">' + schoon(r.klas) + '</small>' : '') + (r.papier ? ' <span class="papierlabel">papier · versie ' + schoon(r.versie || 'A') + '</span>' : '') + '</h3>' +
      '<span class="rspknoppen"><button class="knop stil klein" type="button" data-llstap="-1"' + (k > 0 ? '' : ' disabled') + '>← Vorige</button>' +
      '<button class="knop stil klein" type="button" data-llstap="1"' + (k >= 0 && k < lijst.length - 1 ? '' : ' disabled') + '>Volgende →</button>' +
      '<button class="knop stil klein" type="button" data-llsluit>Sluiten</button></span></div>' +
      '<p>Cijfer <b>' + komma(br.cijfer) + '</b>' + (br.open ? ' (voorlopig, ' + br.open + ' open)' : '') + ' · ' + getal(br.score) + ' van de ' + getal(b.max) + ' punten · ' +
        (r.papier ? 'op papier ingevoerd ' : 'ingeleverd ') + new Date(r.t).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '</p>' +
      '<div class="soortscore">' + Object.keys(soort).map(function(v){ var s = soort[v], p = s[1] ? s[0] / s[1] : 0; return '<div><span>' + VORMNAAM[v] + '</span><span class="pbalk"><i style="width:' + Math.round(p * 100) + '%"></i></span><b>' + Math.round(p * 100) + '%</b></div>'; }).join('') + '</div>' +
      '<div class="nklijst">' + u.items.map(function(it, i){
        return '<div class="nkrij' + (telt(i) ? '' : ' uit') + '"><div><b>' + (i + 1) + '. ' + schoon(vraagVan(it)) + '</b><p>' + schoon(antwoordTekst(it, r.a[i], r)) + '</p>' +
          (u.juist[i] ? '<small class="tip">Goed: ' + schoon(u.juist[i]) + '</small>' : '') + '</div>' + oordeelKnoppen(r, i) + '</div>';
      }).join('') + '</div>' +
      '<div class="rij rsllvoet">' + (r.papier ? '<button class="knop stil klein" type="button" data-papierbewerk="' + schoon(r.sid) + '">Punten aanpassen</button>' : '') +
        '<button class="knop gevaar klein" type="button" data-wis="' + schoon(r.sid) + '">Inlevering weghalen</button></div>';
    el.classList.remove('hide');
    if (focus){ el.scrollIntoView({ block: 'start' }); el.focus({ preventScroll: true }); }
  }

  /* ---------- klikken in de resultaten ---------- */
  function klik(e){
    var k = e.target.closest('button'); if (!k || !u) return;
    var g = function(n){ return k.getAttribute(n); };
    if (k.hasAttribute('data-beginnakijk')) beginNakijken();
    else if (k.hasAttribute('data-nkvraag')) startNakijk({ per: 'vraag', i: Number(g('data-nkvraag')), alleenOpen: !k.hasAttribute('data-alle') });
    else if (k.hasAttribute('data-klas')){ var w = g('data-klas'); klasFilter = w === '*' ? null : w; alleRijen = false; teken(); }
    else if (k.id === 'alleRijen'){ alleRijen = true; teken(); }
    else if (k.hasAttribute('data-leerling')){ leerling = g('data-leerling'); tekenTabel(zichtbaar()); tekenLeerling(true); }
    else if (k.hasAttribute('data-llstap')){
      var l = zichtbaar(), i = l.map(function(x){ return x.sid; }).indexOf(leerling) + Number(g('data-llstap'));
      if (l[i]){ leerling = l[i].sid; if (!alleRijen && i >= 15) alleRijen = true; tekenTabel(l); tekenLeerling(true); }
    }
    else if (k.hasAttribute('data-llsluit')){ var oud = leerling; leerling = null; $('rsLeerling').classList.add('hide'); tekenTabel(zichtbaar()); var t = document.querySelector('[data-leerling="' + oud + '"]'); if (t) t.focus(); }
    else if (k.hasAttribute('data-nk')){ var d = g('data-nk').split('|'); zetPunt(d[0], Number(d[1]), d[2] === 'auto' ? null : Number(d[2])); }
    else if (k.hasAttribute('data-neutraal')) zetNeutraal(Number(g('data-neutraal')), k.hasAttribute('data-aan'));
    else if (k.hasAttribute('data-papierinvoer')) startInvoer();
    else if (k.hasAttribute('data-papierbewerk')) startInvoer(g('data-papierbewerk'));
    else if (k.id === 'normBewaar'){
      var n = JSON.parse(JSON.stringify(u.norm));
      bewaarInstel({ norm: n }, 'Norm bewaard: ' + normNaam(n, b.cesuur) + '.').then(function(){ bewaard = n; tekenEffect(); }, function(){});
    }
    else if (k.id === 'normTerug'){ u.norm = JSON.parse(JSON.stringify(bewaard)); tekenNormRegel(); teken(); melding($('normMelding'), ''); }
    else if (k.id === 'terugzienWissel'){
      var nu = !u.terugzien; u.terugzien = nu; teken();
      bewaarInstel({ terugzien: nu }, nu ? 'Leerlingen zien nu na het inleveren de goede antwoorden.' : 'Leerlingen zien nu alleen hun score.', $('terugMelding')).catch(function(){ u.terugzien = !nu; teken(); });
    }
    else if (k.hasAttribute('data-wis')){
      var r = rijVan(g('data-wis'));
      if (!r || !confirm('De inlevering van ' + r.naam + ' weghalen?' + (r.papier ? '' : ' Dan kan ' + r.naam + ' de toets opnieuw maken.') + ' Dit kan niet terug.')) return;
      EIGEN.wisUitslag(code, r.sid).then(function(){ u.rijen = u.rijen.filter(function(x){ return x !== r; }); leerling = null; tekenAlles(); })
        .catch(function(f){ alert('Weghalen lukte niet: ' + f.message); });
    }
  }
  function zetNeutraal(i, aan){
    var nu = (u.neutraal || []).filter(function(x){ return x !== i; });
    if (!aan) nu.push(i);
    u.neutraal = nu; teken();
    var el = $('normMelding');
    EIGEN.instel(code, { neutraal: nu }).then(function(){ melding(el, aan ? 'Vraag ' + (i + 1) + ' telt weer mee.' : 'Vraag ' + (i + 1) + ' telt niet meer mee; de cijfers zijn opnieuw berekend.', 'goed'); })
      .catch(function(f){ melding(el, 'Opslaan lukte niet: ' + f.message, 'fout'); });
  }
  function zetPunt(sid, i, punt){
    var r = rijVan(sid); if (!r) return Promise.resolve();
    r.h = r.h || {};
    var oud = r.h[i];
    if (punt === null) delete r.h[i]; else r.h[i] = punt;
    teken();
    return EIGEN.nakijk(code, sid, i, punt).catch(function(f){
      if (oud === undefined) delete r.h[i]; else r.h[i] = oud;
      teken(); alert('Opslaan lukte niet: ' + f.message);
    });
  }
  function luister(){
    $('uitslagInhoud').addEventListener('click', klik);
    $('uitslagInhoud').addEventListener('change', function(e){
      var t = e.target;
      if (t.name === 'normm'){ u.norm = Object.assign({}, u.norm, { methode: t.value }); tekenNormRegel(); teken(); return; }
      var s = t.getAttribute && t.getAttribute('data-nkpunt');
      if (s && t.value !== ''){ var d = s.split('|'), it = u.items[Number(d[1])]; zetPunt(d[0], Number(d[1]), Number(t.value) / ptn(it)); }
    });
    $('uitslagInhoud').addEventListener('input', function(e){
      if (e.target.id === 'normCes'){ u.norm = Object.assign({}, u.norm, { cesuur: Number(e.target.value) }); teken(); }
      if (e.target.id === 'normN'){ u.norm = Object.assign({}, u.norm, { n: Number(e.target.value) }); teken(); }
    });
    $('nakijkInhoud').addEventListener('click', nkKlik);
    $('nakijkInhoud').addEventListener('change', function(e){
      if (e.target.id === 'nkAlleenOpen'){ nk.alleenOpen = e.target.checked; nkRij(); nkTeken(); }
      if (e.target.name === 'nkper'){ nk.per = e.target.value; if (nk.per === 'leerling' && !nk.sid){ var l = eersteLeerling(); nk.sid = l ? l.sid : null; } nkRij(); nkTeken(); }
      if (e.target.id === 'nkZelfde'){ zelfdeAan = e.target.checked; try { localStorage.setItem('lg-nakijk-zelfde', zelfdeAan ? '1' : ''); } catch (x){} }
    });
    $('papierInhoud').addEventListener('click', pvKlik);
    $('papierInhoud').addEventListener('input', pvInput);
    $('papierInhoud').addEventListener('change', function(e){ if (e.target.name === 'pvversie'){ pvLees(); inv.versie = e.target.value; pvTekenVragen(); } });
    $('papierInhoud').addEventListener('keydown', pvToets);
    document.addEventListener('keydown', nkToets);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', luister); else luister();

  /* ================= nakijken: een antwoord tegelijk ================= */
  var nk = null, zelfdeAan = false;
  try { zelfdeAan = localStorage.getItem('lg-nakijk-zelfde') === '1'; } catch (e){}
  function totaalOpen(){ return zichtbaar().reduce(function(a, r){ return a + r.open; }, 0); }
  function eersteLeerling(){ return zichtbaar().filter(function(r){ return r.open; })[0] || zichtbaar()[0]; }
  function beginNakijken(){
    var rijen = zichtbaar(), a = an.filter(function(x){ return x.telt && openIn(x.i, rijen); })[0];
    startNakijk({ per: 'vraag', i: a ? a.i : 0, alleenOpen: true });
  }
  function startNakijk(o){
    nk = { per: o.per || 'vraag', i: o.i || 0, sid: o.sid || null, alleenOpen: o.alleenOpen !== false, begin: totaalOpen(), pos: 0 };
    nkRij(); toon('nakijkvak');
    $('nakijkNaam').textContent = u.naam + (klasFilter ? ' · klas ' + klasFilter : '');
    nkTeken(true);
  }
  /* de rij antwoorden om langs te gaan; wat je nakijkt blijft erin staan, zodat Vorige werkt */
  function nkRij(){
    var rijen = zichtbaar();
    if (nk.per === 'vraag') nk.rij = rijen.filter(function(r){ return !nk.alleenOpen || NAKIJK.waarde(r.rij, nk.i) == null; }).map(function(r){ return { sid: r.sid, i: nk.i }; });
    else {
      var r = rijVan(nk.sid);
      nk.rij = r ? u.items.map(function(it, i){ return i; }).filter(function(i){ return !nk.alleenOpen || NAKIJK.waarde(r, i) == null; }).map(function(i){ return { sid: r.sid, i: i }; }) : [];
    }
    nk.pos = 0;
  }
  function nkLijst(){
    var rijen = zichtbaar();
    if (nk.per === 'vraag') return an.filter(function(a){ return !nk.alleenOpen || (a.telt && openIn(a.i, rijen)) || a.i === nk.i; }).map(function(a){
      var it = u.items[a.i], n = openIn(a.i, rijen), aan = a.i === nk.i;
      return '<li><button type="button" class="nkvraag' + (aan ? ' aan' : '') + '" data-nkkies="v:' + a.i + '"' + (aan ? ' aria-current="true"' : '') + '><i>' + (a.i + 1) + '</i>' +
        '<span class="nkvtekst"><b>' + schoon(PAPIER.kort(it)) + '</b><small>' + VORMNAAM[soortVan(it)].toLowerCase() + ' · ' + meer(ptn(it), 'punt', 'punten') + '</small></span>' +
        (n ? '<span class="nktel">' + n + ' over</span>' : '<span class="nkklaar">klaar</span>') + '</button></li>';
    }).join('');
    return rijen.filter(function(r){ return !nk.alleenOpen || r.open || r.sid === nk.sid; }).map(function(r){
      var aan = r.sid === nk.sid;
      return '<li><button type="button" class="nkvraag' + (aan ? ' aan' : '') + '" data-nkkies="l:' + schoon(r.sid) + '"' + (aan ? ' aria-current="true"' : '') + '><i>' + schoon((r.naam || '?').charAt(0).toUpperCase()) + '</i>' +
        '<span class="nkvtekst"><b>' + schoon(r.naam) + '</b><small>' + schoon(r.klas || 'zonder klas') + (r.rij.papier ? ' · papier' : '') + '</small></span>' +
        (r.open ? '<span class="nktel">' + r.open + ' over</span>' : '<span class="nkklaar">klaar</span>') + '</button></li>';
    }).join('');
  }
  function nkTeken(focus){
    if (!nk) return;
    var open = totaalOpen(), gedaan = Math.max(0, nk.begin - open);
    $('nakijkVoortgang').innerHTML = nk.begin ? '<span class="rsbalk groen"><i style="width:' + Math.round(gedaan / nk.begin * 100) + '%"></i></span><span>' + gedaan + ' van ' + nk.begin + '</span>' : '<span>' + (open ? meer(open, 'antwoord', 'antwoorden') + ' open' : 'alles nagekeken') + '</span>';
    var lijst = nkLijst();
    $('nakijkInhoud').innerHTML =
      '<nav class="paneel nklinks" aria-label="Wat er na te kijken is">' +
        '<div class="seg" role="radiogroup" aria-label="Nakijken per"><label><input type="radio" name="nkper" value="vraag"' + (nk.per === 'vraag' ? ' checked' : '') + '><span>Per vraag</span></label>' +
          '<label><input type="radio" name="nkper" value="leerling"' + (nk.per === 'leerling' ? ' checked' : '') + '><span>Per leerling</span></label></div>' +
        '<ol class="nkvragen">' + (lijst || '<li class="tip">Hier staat niets meer open.</li>') + '</ol>' +
        '<label class="vink nkalleen"><input type="checkbox" id="nkAlleenOpen"' + (nk.alleenOpen ? ' checked' : '') + '> Alleen wat nog nagekeken moet worden</label>' +
      '</nav>' +
      '<section class="paneel nkmidden" aria-label="Een antwoord nakijken" id="nkMidden">' + nkMidden() + '</section>' +
      '<p class="sronly" role="status" aria-live="polite" id="nkStatus">' + schoon(nkStatus) + '</p>';
    if (focus){ var k = $('nkAntwoord') || $('nkMidden'); if (k) k.focus({ preventScroll: true }); }
  }
  var nkStatus = '';
  function nkMidden(){
    var e = nk.rij[nk.pos];
    if (!e) return nkKlaar();
    var r = rijVan(e.sid), i = e.i, it = u.items[i];
    if (!r) return nkKlaar();
    var h = r.h && r.h[i], heeft = h !== undefined && h !== null, w = NAKIJK.waarde(r, i), auto = r.p[i], p = ptn(it);
    var wie = nk.per === 'vraag' ? 'antwoord ' + (nk.pos + 1) + ' van ' + nk.rij.length + ' bij deze vraag' : 'vraag ' + (nk.pos + 1) + ' van ' + nk.rij.length + ' bij ' + r.naam;
    /* hetzelfde antwoord bij anderen: wat nog open staat, en wat je eerder gaf */
    var mijn = gelijkVan(it, r, i), zelfde = [], eerder = {};
    if (mijn != null) u.rijen.forEach(function(x){
      if (x === r || x.papier || (klasFilter !== null && x.klas !== klasFilter) || gelijkVan(it, x, i) !== mijn) return;
      /* alleen wat nog helemaal open staat gaat mee; een automatisch nagekeken antwoord niet */
      var hx = x.h && x.h[i];
      if (hx !== undefined && hx !== null) eerder[hx] = (eerder[hx] || 0) + 1;
      else if (NAKIJK.waarde(x, i) == null) zelfde.push(x.sid);
    });
    var eerderTekst = Object.keys(eerder).map(function(k){ return oordeelNaam(Number(k), p) + (eerder[k] > 1 ? ' (' + eerder[k] + '×)' : ''); }).join(', ');
    var juist = u.juist[i] || (it.vorm === 'open' ? '' : '');
    var stand = w == null ? 'Nog niet nagekeken' : (heeft ? 'Met de hand: ' : 'Automatisch: ') + oordeelNaam(w, p);
    var knop = function(x, tekst, toets, soort){ var aan = heeft && Math.abs(h - x) < 0.001; return '<button type="button" class="oordeel ' + soort + (aan ? ' aan' : '') + '" data-oordeel="' + x + '" aria-pressed="' + aan + '" aria-keyshortcuts="' + toets + '">' + tekst + ' <kbd>' + toets + '</kbd></button>'; };
    return '<div class="nkkop"><p class="kopje">Vraag ' + (i + 1) + ' · ' + meer(p, 'punt', 'punten') + (telt(i) ? '' : ' · telt niet mee') + '</p><span class="tip">' + schoon(wie) + '</span></div>' +
      '<p class="nkvraagtekst">' + schoon(vraagVan(it)) + '</p>' + afbHtml(it) +
      '<div class="nkchips">' + (juist ? '<span class="chip goed"><b>Goed is:</b> ' + schoon(juist) + '</span>' : '<span class="chip">Geen antwoordsleutel: je kijkt zelf na</span>') +
        (eerderTekst ? '<span class="chip">Eerder bij hetzelfde antwoord: ' + schoon(eerderTekst) + '</span>' : '') + '</div>' +
      '<div class="nkantwoord" id="nkAntwoord" tabindex="-1"><div class="nkwie"><b>' + schoon(r.naam) + '</b>' + (r.klas ? ' · ' + schoon(r.klas) : '') + (r.papier ? ' · <span class="papierlabel">papier · ' + schoon(r.versie || 'A') + '</span>' : '') + '</div>' +
        '<p class="nkant' + (r.papier ? ' papier' : '') + '">' + schoon(antwoordTekst(it, r.a[i], r)) + '</p><p class="nkstandregel' + (w == null ? ' let' : '') + '">' + schoon(stand) + '</p></div>' +
      '<div class="oordelen">' + knop(1, 'Goed', '1', 'goed') + knop(0.5, 'Half', '2', 'half') + knop(0, 'Fout', '3', 'fout') + '</div>' +
      (p > 1 ? '<div class="nkptn" role="group" aria-label="Of geef punten"><span class="tip">Of geef punten:</span>' + Array.apply(null, Array(p + 1)).map(function(x, n){
          var aan = heeft && Math.abs(h * p - n) < 0.01; return '<button type="button" class="nkpt' + (aan ? ' aan' : '') + '" data-oordeel="' + (n / p) + '" aria-pressed="' + aan + '">' + n + '</button>'; }).join('') + '</div>' : '') +
      (heeft ? '<button class="linkknop nkauto" type="button" data-oordeel="auto">' + (auto == null ? 'Oordeel wissen' : 'Terug naar automatisch (' + pct(auto) + ')') + '</button>' : '') +
      (zelfde.length ? '<label class="vink nkzelfde"><input type="checkbox" id="nkZelfde"' + (zelfdeAan ? ' checked' : '') + '> Hetzelfde antwoord staat er nog ' + meer(zelfde.length, 'keer', 'keer') + ': kijk die meteen mee na</label>' : '') +
      '<div class="nknav"><button type="button" class="knop stil" data-nkstap="-1"' + (nk.pos > 0 ? '' : ' disabled') + '>← Vorige <kbd>K</kbd></button>' +
        '<button type="button" class="knop stil" data-nkstap="1">Volgende <kbd>J</kbd> →</button>' +
        '<span class="tip">Na een oordeel ga je vanzelf naar het volgende antwoord.</span></div>' +
      (nk.per === 'vraag' ? '<p class="nkneutraal">' + (telt(i) ? '<button class="linkknop" type="button" data-nkneutraal="' + i + '">Laat deze vraag niet meetellen</button>' : 'Deze vraag telt niet mee. <button class="linkknop" type="button" data-nkneutraal="' + i + '" data-aan="1">Laat weer meetellen</button>') + '</p>' : '');
  }
  function oordeelNaam(w, p){ return w >= 0.999 ? 'goed' : w <= 0.001 ? 'fout' : Math.abs(w - 0.5) < 0.001 && p === 1 ? 'half' : getal(w * p) + ' van ' + p + ' punten'; }
  function nkKlaar(){
    var rijen = zichtbaar(), volgende, nogOpen = totaalOpen();
    if (nk.per === 'vraag'){
      volgende = an.filter(function(a){ return a.telt && a.i !== nk.i && openIn(a.i, rijen); });
      var na = volgende.filter(function(a){ return a.i > nk.i; })[0] || volgende[0];
      return '<div class="nkklaarvak"><p class="nkvraagtekst">' + (nk.rij.length ? 'Alles bij vraag ' + (nk.i + 1) + ' is nagekeken.' : 'Bij vraag ' + (nk.i + 1) + ' staat niets meer open.') + '</p>' +
        (na ? '<button class="knop" type="button" data-nkkies="v:' + na.i + '">Door naar vraag ' + (na.i + 1) + ' (' + openIn(na.i, rijen) + ' open)</button>'
            : '<p>' + (nogOpen ? 'Er staan nog antwoorden open bij vragen die niet meetellen.' : 'Alles is nagekeken. De cijfers zijn nu definitief.') + '</p>') +
        '<button class="knop stil" type="button" data-naarresultaten>Naar de resultaten</button></div>';
    }
    var r = rijVan(nk.sid), l = rijen.filter(function(x){ return x.open && x.sid !== nk.sid; });
    return '<div class="nkklaarvak"><p class="nkvraagtekst">' + (r ? 'Alles van ' + schoon(r.naam) + ' is nagekeken.' : 'Kies links een leerling.') + '</p>' +
      (l[0] ? '<button class="knop" type="button" data-nkkies="l:' + schoon(l[0].sid) + '">Door naar ' + schoon(l[0].naam) + ' (' + l[0].open + ' open)</button>' : '<p>' + (nogOpen ? '' : 'Alles is nagekeken. De cijfers zijn nu definitief.') + '</p>') +
      '<button class="knop stil" type="button" data-naarresultaten>Naar de resultaten</button></div>';
  }
  function nkOordeel(waarde){
    var e = nk.rij[nk.pos]; if (!e) return;
    var r = rijVan(e.sid), it = u.items[e.i];
    var mee = [];
    if (zelfdeAan && waarde !== null && $('nkZelfde')){
      var mijn = gelijkVan(it, r, e.i);
      u.rijen.forEach(function(x){ if (x !== r && !x.papier && (klasFilter === null || x.klas === klasFilter) && gelijkVan(it, x, e.i) === mijn && NAKIJK.waarde(x, e.i) == null) mee.push(x.sid); });
    }
    /* de anderen eerst lokaal, dan een keer tekenen */
    mee.forEach(function(sid){ var x = rijVan(sid); x.h = x.h || {}; x.h[e.i] = waarde; });
    zetPunt(e.sid, e.i, waarde);
    mee.forEach(function(sid){ EIGEN.nakijk(code, sid, e.i, waarde).catch(function(f){ var x = rijVan(sid); if (x) delete x.h[e.i]; teken(); melding($('uitslagMelding'), 'Opslaan lukte niet: ' + f.message, 'fout'); }); });
    nkStatus = r.naam + ': ' + (waarde === null ? 'weer automatisch' : oordeelNaam(waarde, ptn(it))) + (mee.length ? ', en nog ' + meer(mee.length, 'antwoord', 'antwoorden') + ' hetzelfde' : '') + '.';
    if (waarde !== null && nk.pos < nk.rij.length) nk.pos++;
    /* wat meteen mee is nagekeken, hoeft niet nog eens langs */
    if (mee.length){
      var voor = nk.rij.slice(0, nk.pos), na = nk.rij.slice(nk.pos).filter(function(x){ return x.i !== e.i || mee.indexOf(x.sid) < 0; });
      nk.rij = voor.concat(na);
    }
    nkTeken(true);
  }
  function nkKlik(e){
    var k = e.target.closest('button'); if (!k) return;
    if (k.hasAttribute('data-oordeel')){ var v = k.getAttribute('data-oordeel'); nkOordeel(v === 'auto' ? null : Number(v)); }
    else if (k.hasAttribute('data-nkstap')){ nk.pos = Math.max(0, Math.min(nk.rij.length, nk.pos + Number(k.getAttribute('data-nkstap')))); nkStatus = ''; nkTeken(true); }
    else if (k.hasAttribute('data-nkkies')){
      var w = k.getAttribute('data-nkkies');
      if (w.charAt(0) === 'v'){ nk.per = 'vraag'; nk.i = Number(w.slice(2)); } else { nk.per = 'leerling'; nk.sid = w.slice(2); }
      nkRij(); nkStatus = ''; nkTeken(true);
    }
    else if (k.hasAttribute('data-naarresultaten')) naarResultaten();
    else if (k.hasAttribute('data-nkneutraal')){ zetNeutraal(Number(k.getAttribute('data-nkneutraal')), k.hasAttribute('data-aan')); nkTeken(); }
  }
  function nkToets(e){
    if (!nk || $('nakijkvak').classList.contains('hide') || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT' || (tag === 'INPUT' && !/^(checkbox|radio)$/.test(t.type))) return;
    var k = e.key;
    if (k === '1' || k === '2' || k === '3'){ e.preventDefault(); nkOordeel(k === '1' ? 1 : k === '2' ? 0.5 : 0); }
    else if (k === 'j' || k === 'J' || (k === 'ArrowRight' && tag !== 'INPUT')){ e.preventDefault(); nk.pos = Math.min(nk.rij.length, nk.pos + 1); nkStatus = ''; nkTeken(true); }
    else if (k === 'k' || k === 'K' || (k === 'ArrowLeft' && tag !== 'INPUT')){ e.preventDefault(); nk.pos = Math.max(0, nk.pos - 1); nkStatus = ''; nkTeken(true); }
  }
  function naarResultaten(){ nk = null; inv = null; toon('uitslagvak'); tekenAlles(); }

  /* ================= een papieren toets invoeren ================= */
  var inv = null;
  function startInvoer(sid){
    var r = sid ? rijVan(sid) : null;
    inv = r ? { sid: r.sid, naam: r.naam, klas: r.klas || '', versie: r.versie || 'A', w: {} } : { sid: null, naam: '', klas: inv ? inv.klas : '', versie: inv ? inv.versie : 'A', w: {} };
    if (r) Object.keys(r.h || {}).forEach(function(i){ var x = r.h[i]; if (x != null) inv.w[i] = getal(x * ptn(u.items[i])); });
    toon('papiervak');
    $('papierNaam').textContent = u.naam;
    pvTeken();
    $('pvNaam').focus();
  }
  function pvTeken(){
    var klassen = {}; u.rijen.forEach(function(r){ if (r.klas) klassen[r.klas] = 1; });
    $('papierInhoud').innerHTML = '<div class="pvgrid">' +
      '<section class="paneel pvform" aria-labelledby="pvKop"><h3 class="kopje" id="pvKop">' + (inv.sid ? 'Punten aanpassen' : 'Een leerling invoeren') + '</h3>' +
        '<p class="tip">Typ per vraag de punten, in de volgorde van de versie die de leerling had. <b>g</b> is alle punten, <b>h</b> de helft, <b>f</b> nul. Met Tab of Enter ga je naar de volgende vraag. Laat je een vraag leeg, dan staat hij bij Nakijken nog open.</p>' +
        '<div class="pvwie"><label class="veldnaam">Naam<input class="veld" id="pvNaam" maxlength="40" autocomplete="off" value="' + schoon(inv.naam) + '"></label>' +
          '<label class="veldnaam">Klas<input class="veld" id="pvKlas" maxlength="8" autocomplete="off" list="pvKlassen" value="' + schoon(inv.klas) + '"></label>' +
          '<datalist id="pvKlassen">' + Object.keys(klassen).sort().map(function(k){ return '<option value="' + schoon(k) + '">'; }).join('') + '</datalist>' +
          '<div><span class="veldnaam" id="pvVersieKop">Versie</span><div class="seg" role="radiogroup" aria-labelledby="pvVersieKop"><label><input type="radio" name="pvversie" value="A"' + (inv.versie === 'A' ? ' checked' : '') + '><span>A</span></label><label><input type="radio" name="pvversie" value="B"' + (inv.versie === 'B' ? ' checked' : '') + '><span>B</span></label></div></div></div>' +
        '<ol class="pvvragen" id="pvVragen"></ol>' +
        '<p class="pvtotaal" id="pvTotaal" aria-live="polite"></p>' +
        '<div class="rij"><button class="knop" type="button" id="pvBewaar">' + (inv.sid ? 'Bewaren' : 'Bewaren en volgende leerling') + '</button>' +
          '<button class="knop stil" type="button" id="pvLeeg">' + (inv.sid ? 'Annuleren' : 'Leegmaken') + '</button>' +
          '<a class="linkknop" href="papieren-toets.html?code=' + schoon(code) + '&amp;versie=AB" target="_blank" rel="noopener">Toets en nakijkmodel printen</a></div>' +
        '<p class="melding" id="pvMelding" role="status" aria-live="polite"></p></section>' +
      '<aside class="paneel pvlijst" aria-labelledby="pvLijstKop" id="pvLijst"></aside></div>';
    pvTekenVragen(); pvTekenLijst();
  }
  function pvTekenVragen(){
    var orde = PAPIER.volgorde(u.items, code, inv.versie);
    $('pvVragen').innerHTML = orde.map(function(i, k){
      var it = u.items[i], p = ptn(it);
      return '<li><span class="pvnr">' + (k + 1) + '</span><label for="pv-' + i + '" class="pvvraag"><b>' + schoon(PAPIER.kort(it)) + '</b><small>' + VORMNAAM[soortVan(it)] + (orde[k] !== k ? ' · in de site vraag ' + (i + 1) : '') + (telt(i) ? '' : ' · telt niet mee') + '</small></label>' +
        '<span class="pvin"><input class="veld" id="pv-' + i + '" data-pv="' + i + '" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="–" value="' + schoon(inv.w[i] || '') + '"><span>/ ' + p + '</span></span>' +
        '<span class="pvfout" id="pvf-' + i + '"></span></li>';
    }).join('');
    pvTotaal();
  }
  /* wat er in een vakje staat, als deel van de punten (0 tot 1); null is leeg, NaN is fout */
  function pvWaarde(i, tekst){
    var p = ptn(u.items[i]), t = String(tekst || '').trim().toLowerCase().replace(',', '.');
    if (!t) return null;
    if (t === 'g') return 1; if (t === 'h') return 0.5; if (t === 'f') return 0;
    if (!/^\d+(\.\d+)?$/.test(t)) return NaN;
    var n = Number(t); return n > p ? NaN : Math.round(n / p * 10000) / 10000;
  }
  function pvLees(){
    if (!$('pvNaam')) return;
    inv.naam = $('pvNaam').value; inv.klas = $('pvKlas').value;
    [].forEach.call(document.querySelectorAll('[data-pv]'), function(el){ inv.w[el.getAttribute('data-pv')] = el.value; });
  }
  function pvTotaal(){
    var s = 0, max = 0, leeg = 0, fout = 0, h = {};
    [].forEach.call(document.querySelectorAll('[data-pv]'), function(el){
      var i = Number(el.getAttribute('data-pv')), w = pvWaarde(i, el.value), p = ptn(u.items[i]);
      var f = $('pvf-' + i);
      if (w !== w){ fout++; el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', 'pvf-' + i); f.textContent = 'Een getal van 0 tot ' + p + ', of g, h of f.'; }
      else { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); f.textContent = ''; }
      if (!telt(i)) return;
      max += p;
      if (w == null) leeg++; else if (w === w){ s += w * p; h[i] = w; }
    });
    var c = max ? NAKIJK.cijferVan(s, max, u.norm, u.norm.methode === 'auto' ? b.cesuur : null) : null;
    $('pvTotaal').innerHTML = 'Totaal <b>' + getal(s) + '</b> van ' + getal(max) + ' punten' + (leeg ? ', ' + meer(leeg, 'vraag', 'vragen') + ' leeg' : ' · cijfer <b>' + komma(c) + '</b> met de huidige norm') + (fout ? ' · <span class="onv">' + meer(fout, 'vakje klopt', 'vakjes kloppen') + ' niet</span>' : '');
  }
  function pvInput(e){ if (e.target.hasAttribute('data-pv')) pvTotaal(); }
  function pvToets(e){
    if (e.key !== 'Enter' || !(e.target.hasAttribute('data-pv') || e.target.id === 'pvNaam' || e.target.id === 'pvKlas')) return;
    e.preventDefault();
    var velden = [$('pvNaam'), $('pvKlas')].concat([].slice.call(document.querySelectorAll('[data-pv]'))), i = velden.indexOf(e.target);
    if (velden[i + 1]) velden[i + 1].focus(); else $('pvBewaar').focus();
  }
  function pvKlik(e){
    var k = e.target.closest('button'); if (!k) return;
    if (k.id === 'pvBewaar') pvBewaar();
    else if (k.id === 'pvLeeg'){ if (inv.sid){ naarResultaten(); return; } inv = { sid: null, naam: '', klas: $('pvKlas').value, versie: inv.versie, w: {} }; pvTeken(); $('pvNaam').focus(); }
    else if (k.hasAttribute('data-pvbewerk')) startInvoer(k.getAttribute('data-pvbewerk'));
    else if (k.hasAttribute('data-pvwis')){
      var r = rijVan(k.getAttribute('data-pvwis'));
      if (!r || !confirm('De papieren toets van ' + r.naam + ' weghalen? Dit kan niet terug.')) return;
      EIGEN.wisUitslag(code, r.sid).then(function(){ u.rijen = u.rijen.filter(function(x){ return x !== r; }); b = NAKIJK.bereken(u); an = NAKIJK.analyse(u, b); if (inv.sid === r.sid) inv.sid = null; pvTekenLijst(); melding($('pvMelding'), r.naam + ' is weggehaald.', 'goed'); })
        .catch(function(f){ melding($('pvMelding'), 'Weghalen lukte niet: ' + f.message, 'fout'); });
    }
    else if (k.hasAttribute('data-naarresultaten')) naarResultaten();
  }
  function pvBewaar(){
    pvLees();
    var naam = inv.naam.trim(), klas = inv.klas.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8), h = {}, fout = null;
    if (!naam){ melding($('pvMelding'), 'Vul de naam van de leerling in.', 'fout'); $('pvNaam').setAttribute('aria-invalid', 'true'); $('pvNaam').focus(); return; }
    $('pvNaam').removeAttribute('aria-invalid');
    [].forEach.call(document.querySelectorAll('[data-pv]'), function(el){ var i = Number(el.getAttribute('data-pv')), w = pvWaarde(i, el.value); if (w !== w){ if (!fout) fout = el; } else if (w != null) h[i] = w; });
    if (fout){ melding($('pvMelding'), 'Een vakje klopt niet: typ een getal van 0 tot het maximum, of g, h of f.', 'fout'); fout.focus(); return; }
    var zelfde = !inv.sid && u.rijen.filter(function(r){ return r.naam.toLowerCase().replace(/\s+/g, ' ') === naam.toLowerCase().replace(/\s+/g, ' ') && (r.klas || '') === klas; })[0];
    if (zelfde && !confirm('Er staat al een inlevering van ' + zelfde.naam + (klas ? ' in ' + klas : '') + (zelfde.papier ? ' op papier' : '') + '. Toch nog een erbij?')) return;
    var knop = $('pvBewaar'); knop.disabled = true; knop.setAttribute('aria-busy', 'true');
    EIGEN.papier(code, { sid: inv.sid || undefined, naam: naam, klas: klas, versie: inv.versie, h: h }).then(function(j){
      knop.disabled = false; knop.removeAttribute('aria-busy');
      var r = rijVan(j.sid);
      if (!r){ r = { sid: j.sid, t: Date.now(), a: [], pogingen: 1, papier: true }; u.rijen.push(r); }
      Object.assign(r, { naam: naam, klas: klas, versie: inv.versie, h: j.h || h, p: u.items.map(function(){ return null; }) });
      u.rijen.sort(function(x, y){ return x.naam.localeCompare(y.naam, 'nl'); });
      b = NAKIJK.bereken(u); an = NAKIJK.analyse(u, b);
      var br = b.rijen.filter(function(x){ return x.sid === j.sid; })[0];
      var klaar = 'Bewaard: ' + naam + ' (versie ' + inv.versie + '), ' + getal(br.score) + ' van ' + getal(b.max) + ' punten' + (br.open ? ', ' + br.open + ' open' : ', cijfer ' + komma(br.cijfer)) + '.';
      inv = { sid: null, naam: '', klas: klas, versie: inv.versie, w: {} };
      pvTeken(); melding($('pvMelding'), klaar, 'goed'); $('pvNaam').focus();
    }).catch(function(f){
      knop.disabled = false; knop.removeAttribute('aria-busy');
      melding($('pvMelding'), 'Bewaren lukte niet: ' + f.message + (f.status >= 400 && f.status < 500 ? '' : ' Controleer je internet en probeer het opnieuw.'), 'fout');
    });
  }
  function pvTekenLijst(){
    b = NAKIJK.bereken(u);
    var l = b.rijen.filter(function(r){ return r.rij.papier; });
    $('pvLijst').innerHTML = '<h3 class="kopje" id="pvLijstKop">Op papier ingevoerd · ' + l.length + '</h3>' +
      (l.length ? '<ul class="pvrijen">' + l.map(function(r){
        return '<li' + (inv && inv.sid === r.sid ? ' class="aan"' : '') + '><span><b>' + schoon(r.naam) + '</b><small>' + schoon(r.klas || 'zonder klas') + ' · versie ' + schoon(r.rij.versie || 'A') + ' · ' + getal(r.score) + ' / ' + getal(b.max) + (r.open ? ' · ' + r.open + ' open' : ' · ' + komma(r.cijfer)) + '</small></span>' +
          '<button class="knop stil klein" type="button" data-pvbewerk="' + schoon(r.sid) + '">Bewerken</button><button class="knop gevaar klein" type="button" data-pvwis="' + schoon(r.sid) + '" aria-label="' + schoon(r.naam) + ' weghalen">Weghalen</button></li>';
      }).join('') + '</ul>' : '<p class="tip">Nog niemand. Wie je bewaart, komt hier te staan en telt meteen mee in de cijfers.</p>') +
      '<button class="knop stil pvklaar" type="button" data-naarresultaten>Klaar: naar de resultaten</button>';
  }

  function downloadCsv(){
    var rijen = zichtbaar(), sep = ';';
    var cel = function(x){ x = String(x == null ? '' : x); return /[;"\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
    var kop = ['Naam', 'Klas', 'Punten', 'Max', 'Procent', 'Cijfer', 'Voorlopig', 'Papier'].concat(u.items.map(function(it, i){ return 'V' + (i + 1); }));
    var regels = [kop.join(sep)].concat(rijen.map(function(r){
      return [r.naam, r.klas, komma(r.score, 2), b.max, r.pct, komma(r.cijfer), r.open ? 'ja' : '', r.rij.papier ? 'versie ' + (r.rij.versie || 'A') : ''].concat(u.items.map(function(it, i){ var w = NAKIJK.waarde(r.rij, i); return w == null ? '' : komma(w * ptn(it), 2); })).map(cel).join(sep);
    }));
    var blob = new Blob(['﻿' + regels.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (u.naam || 'uitslag').replace(/[^\w\- ]+/g, '') + '.csv';
    document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ================= vergelijken ================= */
  var alle = null, gekozen = {}, vKlas = '', vSorteer = 'naam', open1 = '';
  function vergelijk(o){
    opts = Object.assign({}, opts, o || {}); if (o && o.terug) terug = o.terug;
    toon('vergelijkvak');
    $('vergelijkInhoud').innerHTML = '';
    var stukken = EIGEN.mijn().filter(function(m){ return m.soort !== 'lijst' && m.soort !== 'dictee' && m.soort !== 'topo'; });
    if (!stukken.length){ $('vergelijkInhoud').innerHTML = '<p class="leeg">Je hebt nog geen oefeningen of toetsen gemaakt.</p>'; return; }
    melding($('vergelijkMelding'), 'Uitslagen ophalen van ' + meer(stukken.length, 'toets', 'toetsen') + '…');
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
        return '<label class="vink"><input type="checkbox" data-toets="' + schoon(x.code) + '"' + (gekozen[x.code] ? ' checked' : '') + '> ' + schoon(x.naam) +
          ' <small class="tip">' + new Date(x.t).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) + '</small></label>';
      }).join('') + '</div>' +
      '<div class="rij" style="margin-top:10px">' + (Object.keys(klassen).length > 1 ? '<label class="tip">Klas <select class="veld mini" id="vKlas"><option value="">alle</option>' + Object.keys(klassen).sort().map(function(k){ return '<option' + (k === vKlas ? ' selected' : '') + '>' + schoon(k) + '</option>'; }).join('') + '</select></label>' : '') +
        '<label class="tip">Volgorde <select class="veld mini" id="vSorteer"><option value="naam">op naam</option><option value="laag"' + (vSorteer === 'laag' ? ' selected' : '') + '>laagste gemiddelde eerst</option><option value="lijn"' + (vSorteer === 'lijn' ? ' selected' : '') + '>grootste daling eerst</option></select></label></div></div>' +
      '<div class="kaart"><h3>Per toets</h3><div class="schuif"><table class="tabel"><thead><tr><th>Toets</th><th class="getal">Ingeleverd</th><th class="getal">Gemiddeld</th><th class="getal">Voldoende</th><th>Norm</th><th></th></tr></thead><tbody>' +
        toetsen.map(function(t){
          var papier = t.b.rijen.filter(function(r){ return r.rij.papier; }).length;
          return '<tr><td>' + schoon(t.naam) + '</td><td class="getal">' + t.b.rijen.length + (papier ? ' <small>' + papier + ' op papier</small>' : '') + '</td><td class="getal' + (t.b.gem < 5.5 ? ' onv' : '') + '"><b>' + komma(t.b.gem) + '</b></td><td class="getal">' + (t.b.voldoende == null ? '–' : t.b.voldoende + '%') + '</td>' +
            '<td class="tip">' + normNaam(t.b.norm, t.b.cesuur) + '</td>' +
            '<td><button class="knop stil klein" type="button" data-naaropen="' + schoon(t.code) + '">Resultaten</button></td></tr>';
        }).join('') + '</tbody></table></div></div>' +
      (aandacht.length ? '<div class="kaart aandacht"><h3>Aandacht</h3><p class="tip">Gemiddeld onder de 5,5, of het laatste cijfer anderhalve punt of meer lager dan het vorige.</p><ul>' +
        aandacht.map(function(w){ return '<li><b>' + schoon(w.naam) + '</b>' + (w.klas ? ' (' + schoon(w.klas) + ')' : '') + ': gemiddeld ' + komma(w.gem) + (w.trend != null && w.trend <= -1.5 ? ', laatste keer ' + komma(-w.trend) + ' lager' : '') + '</li>'; }).join('') + '</ul></div>' : '') +
      '<div class="kaart"><h3>Per leerling</h3><p class="tip">Leerlingen worden herkend aan hun klas en naam, ook als ze de toets op papier maakten. Klik op een naam voor de sterke en zwakke soorten vragen.</p><div class="schuif"><table class="tabel matrix"><thead><tr><th>Leerling</th><th>Klas</th>' +
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
          var p = ptn(it);
          var sv = soortVan(it), k = klas[sv] = klas[sv] || [0, 0]; k[0] += v * p; k[1] += p;
          if (zelf){ var hh = hij[sv] = hij[sv] || [0, 0]; hh[0] += v * p; hh[1] += p; }
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
  function weg(){
    /* een norm die je nog niet bewaarde, ga je niet stil kwijt */
    if (u && bewaard && !zelfdeNorm(u.norm, bewaard) && !$('uitslagvak').classList.contains('hide') && !confirm('De nieuwe norm is nog niet bewaard. Toch terug? Dan blijft de bewaarde norm staan.')) return false;
    if (u && bewaard) u.norm = JSON.parse(JSON.stringify(bewaard));
    nk = null; inv = null; document.body.classList.remove('uitslagstand');
    return true;
  }
  document.addEventListener('click', function(e){
    var k = e.target.closest('button, input'); if (!k) return;
    if (k.hasAttribute('data-uitslagterug')){ if (weg()) terug(); }
    if (k.hasAttribute('data-naarresultaten') && !$('uitslagvak').contains(k) && !$('nakijkInhoud').contains(k) && !$('papierInhoud').contains(k)) naarResultaten();
    if (k.id === 'rsBewerk' && u && opts.bewerk){ if (weg()) opts.bewerk(code); }
    if (k.id === 'rsVergelijk'){ if (weg()) vergelijk(); }
    if (k.hasAttribute('data-naaropen')) open(k.getAttribute('data-naaropen'));
    if (k.hasAttribute('data-wie')){ var s = k.getAttribute('data-wie'); open1 = open1 === s ? '' : s; tekenVergelijk(); }
    if (k.hasAttribute('data-toets')){ gekozen[k.getAttribute('data-toets')] = k.checked; tekenVergelijk(); }
  });
  return { open: open, vergelijk: vergelijk };
})();
