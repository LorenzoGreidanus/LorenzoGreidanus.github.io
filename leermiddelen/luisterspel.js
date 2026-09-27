/* Luisteren en typen, voor het dictee (Nederlands) en de dictation (Engels).
   De browser leest voor met voorlezen.js (speechSynthesis); de leerling ziet
   de tekst niet en typt wat hij hoort. Kan de browser niet voorlezen, of staat
   er geen stem voor de taal op het apparaat, dan is er een noodknop die de
   tekst even laat zien, zodat het spel toch bruikbaar blijft.

     LUISTER.opgave({
       onderdeel, onderdeelNaam, taal:'nl-NL',
       spreek:'Hij vindt het leuk.',        wat de stem zegt
       antwoord:'vindt' of ['color', 'colour'],  wat er getypt moet worden
       gat:'Hij ___ het leuk.',             (niet verplicht) de zin met een gat in beeld: dan typ je alleen het woord
       exact:true,                          hoofdletters en leestekens tellen mee (anders niet)
       zin:true,                            een hele zin typen: een groter vak, en per woord nakijken
       woordScore:true,                     het doorlopende dictee: elk woord telt apart, komma’s tellen niet
       stukje:'Hij vindt het',              (niet verplicht) knop "Alleen het stukje": dat deel nog eens
       stukken:['Toen we aankwamen,', …],   (niet verplicht) knoppen 1, 2, 3: elk stukje een keer extra
       soorten:true,                        het soort fout benoemen (d/t, ei/ij, …); standaard bij Nederlands
       naKijk:function(uitslag){},          na het nakijken: { ok, typen:[{soort,e,g}], woorden:{goed,van}, eigen, goed, html }
       vraag, opdracht, uitleg, antwoordTekst, sleutel, beeldExtra
     })
   geeft een opgave in de 'eigen' vorm van vakspel.js.

   Luisteren: drie keer per opgave, net als bij een dictee in de klas. Langzaam
   en Alleen het stukje tellen elk als een keer: het is dezelfde zin nog eens.
   De stukjes van een lange zin in het doorlopende dictee tellen niet mee,
   maar elk stukje kan maar een keer; zo leest een docent ook voor: de hele
   zin, dan in stukjes, dan nog eens de hele zin. */
window.LUISTER = (function(){
  'use strict';
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  var CSS = '.luister{display:grid;gap:12px;justify-items:center}' +
    '.luister [hidden]{display:none!important}' +
    '.luister .spreker{width:120px;height:90px;color:var(--nadruk)}' +
    '.luister .spreker .golf{opacity:.25;transition:opacity .2s}' +
    '.luister.praat .spreker .golf{opacity:1;animation:luistergolf .9s ease-in-out infinite alternate}' +
    '@keyframes luistergolf{from{transform:scale(.96);transform-origin:40% 50%}to{transform:scale(1.04);transform-origin:40% 50%}}' +
    '@media(prefers-reduced-motion:reduce){.luister.praat .spreker .golf{animation:none}}' +
    '.luister .knoppen{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}' +
    /* de spelkleur met de inkt die erbij hoort (vakspel.js rekent die uit): leesbaar in licht en donker */
    '.luister .knoppen button{border:none;border-radius:999px;padding:12px 22px;font-weight:600;min-height:46px;background:var(--spelkleur,#204ECF);color:var(--spelinkt,#fff)}' +
    '.luister .knoppen button.stil{background:var(--kaart2);color:var(--ink);box-shadow:inset 0 0 0 1px var(--rand2)}' +
    '.luister .knoppen button:disabled,.luister .stukken button:disabled{opacity:.45;cursor:not-allowed}' +
    '.luister .stukken{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;align-items:center}' +
    '.luister .stukken span{font-size:.86rem;color:var(--muted);margin-right:4px}' +
    '.luister .stukken button{min-width:46px;min-height:46px;border-radius:12px;border:1px solid var(--rand2);background:var(--kaart);color:var(--ink);font-weight:600}' +
    '.luister .teller{font-size:.86rem;color:var(--muted);text-align:center;min-height:1.3em}' +
    '.luister .gat{font-size:1.15rem;font-weight:600;text-align:center;line-height:1.5}' +
    '.luister .gat .gatnw{white-space:nowrap}' +
    '.luister .gat b{display:inline-block;min-width:4em;border-bottom:3px solid var(--nadruk);color:var(--nadruk)}' +
    '.luister input,.luister textarea{width:min(100%,26em);border-radius:14px;border:2px solid var(--rand2);background:var(--kaart);color:var(--ink);font:inherit;font-size:1.15rem;font-weight:600;padding:0 14px}' +
    '.luister input{height:54px;text-align:center}' +
    '.luister textarea{width:min(100%,36em);min-height:64px;padding:12px 14px;line-height:1.45;resize:none;overflow:hidden;font-size:1.08rem}' +
    '.luister input:focus,.luister textarea:focus{outline:none;border-color:var(--nadruk);box-shadow:0 0 0 4px var(--nadruk-zacht)}' +
    '.luister .goed{background:var(--goed-bg);border-color:var(--goed);color:var(--goed)}' +
    '.luister .fout{background:var(--fout-bg);border-color:var(--fout);color:var(--fout)}' +
    '.luister .flits{min-height:1.6em;font-size:1.2rem;font-weight:600;color:var(--nadruk);text-align:center;max-width:40ch}' +
    '.luister .geen{font-size:.86rem;color:var(--muted);text-align:center;max-width:46ch}' +
    '.luister .nood{display:grid;gap:8px;justify-items:center}' +
    '.luister .verschil{font-size:1.05rem;text-align:center;line-height:1.7;max-width:40em;overflow-wrap:anywhere}' +
    '.luister .verschil span,.dicteetekst span{padding:0 1px;border-radius:4px}' +
    '.luister .verschil .weg,.dicteetekst .weg{background:var(--fout-bg);color:var(--fout);text-decoration:line-through}' +
    '.luister .verschil .erbij,.dicteetekst .erbij{background:var(--goed-bg);color:var(--goed);font-weight:700}' +
    '.luister .verschil .fw,.dicteetekst .fw{background:none;padding:0;border-bottom:2px dotted var(--fout)}' +
    '.luister .verschil small{display:block;color:var(--muted);font-size:.78rem}' +
    /* het soort fout, met de regel erbij (in de uitslag van vakspel.js, dus alleen spans) */
    '.fouttypen{display:block;margin-top:8px}' +
    '.fouttypen .ft{display:block;background:var(--kaart2);border-radius:10px;padding:8px 11px;margin-top:6px;font-size:.92rem;text-align:left}' +
    '.fouttypen .ft b{display:inline-block;margin-right:6px;padding:1px 9px;border-radius:999px;background:var(--fout-bg);color:var(--fout);font-size:.8rem}' +
    '.fouttypen .ftvb{font-weight:600;overflow-wrap:anywhere}' +
    '.fouttypen .ftregel{display:block;color:var(--muted);font-size:.86rem;margin-top:3px}' +
    '.stemkeuze{display:grid;gap:6px;justify-items:start}' +
    '.stemkeuze .stemrij{display:flex;gap:8px;flex-wrap:wrap;max-width:100%}' +
    '.stemkeuze select{min-height:46px;max-width:100%;border-radius:12px;border:1px solid var(--rand2);background:var(--kaart);color:var(--ink);font:inherit;font-size:.92rem;padding:0 12px}' +
    '.stemkeuze button{min-height:46px;border-radius:999px;border:1px solid var(--rand2);background:var(--kaart2);color:var(--ink);font-weight:600;padding:0 18px}';
  var cssGezet = false;
  function zetCss(){ if (cssGezet) return; cssGezet = true; var s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }
  var SPREKER = '<svg class="spreker" viewBox="0 0 120 90" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M18 36h16l20-16v50L34 54H18z" fill="currentColor" fill-opacity=".15"/>' +
    '<g class="golf"><path d="M68 32a18 18 0 0 1 0 26"/><path d="M80 22a32 32 0 0 1 0 46"/><path d="M92 12a46 46 0 0 1 0 66"/></g></svg>';

  /* ---------- vergelijken ---------- */
  /* krullende en rechte aanhalingstekens en apostrofs zijn hetzelfde, net als dubbele spaties */
  function eenheid(t){ return String(t == null ? '' : t).replace(/[’‘‚‛`´]/g, "'").replace(/[“”„‟«»]/g, '"').replace(/\s+/g, ' ').trim(); }
  function norm(t, exact){
    t = eenheid(t);
    if (exact) return t;
    return t.toLowerCase().replace(/[.,!?;:"]/g, '').replace(/\s+/g, ' ').trim();
  }
  function lev(a, b){
    a = String(a); b = String(b);
    if (a === b) return 0;
    var v = [], i, j;
    for (j = 0; j <= b.length; j++) v[j] = j;
    for (i = 1; i <= a.length; i++){
      var vorig = v[0]; v[0] = i;
      for (j = 1; j <= b.length; j++){
        var t = v[j];
        v[j] = Math.min(v[j] + 1, v[j - 1] + 1, vorig + (a[i - 1] === b[j - 1] ? 0 : 1));
        vorig = t;
      }
    }
    return v[b.length];
  }
  /* het verschil letter voor letter: wat de leerling te veel (doorgestreept)
     of te weinig (groen) had, via de langste gemeenschappelijke deelrij */
  function verschil(eigen, goed){
    var a = eigen.split(''), b = goed.split(''), n = a.length, m = b.length, L = [];
    for (var i = 0; i <= n; i++){ L[i] = []; for (var j = 0; j <= m; j++) L[i][j] = 0; }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    var uit = '', p = 0, q = 0;
    while (p < n && q < m){
      if (a[p] === b[q]){ uit += schoon(a[p]); p++; q++; }
      else if (L[p + 1][q] >= L[p][q + 1]){ uit += '<span class="weg">' + schoon(a[p]) + '</span>'; p++; }
      else { uit += '<span class="erbij">' + schoon(b[q]) + '</span>'; q++; }
    }
    while (p < n){ uit += '<span class="weg">' + schoon(a[p]) + '</span>'; p++; }
    while (q < m){ uit += '<span class="erbij">' + schoon(b[q]) + '</span>'; q++; }
    return uit;
  }

  /* ---------- het soort fout ----------
     Wat voor fout is het? We leggen het getypte en het goede woord naast
     elkaar en maken ze stap voor stap gelijk: eerst de hoofdletters weg, dan de
     accenten, de leestekens, spaties en streepjes, dan d en t aan het eind,
     ei en ij, au en ou, g en ch, s en z, f en v, en dubbele letters. Elke stap
     die het verschil kleiner maakt, is een soort fout die de leerling maakte.
     Blijft er daarna nog verschil over, dan is het een andere letter. */
  var SOORTEN = {
    dt: { naam:'d/t', deel:'werkwoorden', regel:'Werkwoord: zoek de stam (de ik-vorm). Hij, zij, het, u en jij vóór het werkwoord: stam + t. Verleden tijd en voltooid deelwoord: kijk of de stam eindigt op een letter uit ’t kofschip. Geen werkwoord? Maak het woord langer: honden, dus hond.' },
    hoofdletter: { naam:'hoofdletter', deel:'leestekens', regel:'Een hoofdletter aan het begin van een zin en bij namen: mensen, dieren, plaatsen, landen, talen en feestdagen. Dagen, maanden, seizoenen en windstreken krijgen een kleine letter.' },
    leesteken: { naam:'leesteken', deel:'leestekens', regel:'Een vraag eindigt op een vraagteken, een mededeling op een punt. Een komma staat tussen dingen die je opnoemt (niet voor en) en tussen twee delen van een zin die elk een persoonsvorm hebben. Een apostrof hoort in woorden als baby’s en foto’s.' },
    trema: { naam:'trema of accent', deel:'woorden', regel:'Een trema zet je op een klinker die anders met de klinker ervoor één klank zou maken: België, ideeën, geïnteresseerd. Accenten als é, è en ê horen bij woorden uit het Frans: café, crème, enquête.' },
    spatie: { naam:'spatie of streepje', deel:'woorden', regel:'Een samenstelling schrijf je aan elkaar: voetbalveld, huiswerkklas. Een streepje komt ertussen als er anders klinkers botsen (zee-egel) en in namen als Noord-Holland.' },
    eiij: { naam:'ei of ij', deel:'woorden', regel:'Ei en ij klinken hetzelfde, dus je moet het woordbeeld kennen. Een steun: de uitgang is altijd lijk met ij en heid met ei (eigenlijk, vrijheid).' },
    auou: { naam:'au of ou', deel:'woorden', regel:'Au en ou klinken hetzelfde, dus je moet het woordbeeld kennen. Ou komt het meest voor (koud, oud, zout); au zit in woorden als pauze, saus en blauw.' },
    gch: { naam:'g of ch', deel:'woorden', regel:'G en ch klinken bijna hetzelfde. Leer het woordbeeld en denk aan een verwant woord: lachen en lach, liegen en leugen.' },
    szfv: { naam:'s of z, f of v', deel:'woorden', regel:'Aan het eind van een woord schrijf je s en f, nooit z of v: ik reis, ik leef. In het hele werkwoord hoor je de z of v wel: reizen, leven.' },
    dubbel: { naam:'dubbele letter', deel:'woorden', regel:'Na een korte klank komt een dubbele medeklinker: bakker, zitten, gezellig. Een lange klank aan het eind van een lettergreep schrijf je met één letter: bo-men, ra-men.' },
    woord: { naam:'woord vergeten of te veel', deel:'', regel:'Luister nog eens in stukjes en tel de woorden. Elk woord dat je hoort, schrijf je op; niet meer en niet minder.' },
    anders: { naam:'andere letter', deel:'woorden', regel:'Kijk welke letters anders zijn en zeg het woord in stukjes: on-mid-del-lijk. Schrijf het daarna een keer goed op.' }
  };
  /* [soort, gelijkmaken, (niet verplicht) wanneer de stap mag: anders zou kado/cadeau een au/ou-fout zijn] */
  function beide(re){ return function(a, b){ return re.test(a) && re.test(b); }; }
  var STAPPEN = [
    ['hoofdletter', function(s){ return s.toLowerCase(); }],
    ['trema', function(s){ return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }],
    ['leesteken', function(s){ return s.replace(/[.,!?;:'"()…]/g, ''); }],
    ['spatie', function(s){ return s.replace(/[\s\-]+/g, ''); }],
    /* d en t aan het eind, ook rond een uitgang e of en: vind/vindt, speelde/speelte, wachten/wachtten, geüpdate/geüpdatet */
    ['dt', function(s){ return s.replace(/[dt]*(en|e)?[dt]*$/, '①'); }, function(a, b){ return /[dt](en|e)?$/.test(a) || /[dt](en|e)?$/.test(b); }],
    ['eiij', function(s){ return s.replace(/ei|ij/g, '②'); }, beide(/ei|ij/)],
    ['auou', function(s){ return s.replace(/au|ou/g, '③'); }, beide(/au|ou/)],
    ['gch', function(s){ return s.replace(/ch|g/g, '④'); }, beide(/ch|g/)],
    ['szfv', function(s){ return s.replace(/[sz]/g, '⑤').replace(/[fv]/g, '⑥'); }, beide(/[szfv]/)],
    ['dubbel', function(s){ return s.replace(/(.)\1+/g, '$1'); }]
  ];
  function soortVan(e, g){
    var a = String(e == null ? '' : e), b = String(g == null ? '' : g), d = lev(a, b), uit = [];
    if (!d) return uit;
    for (var i = 0; i < STAPPEN.length && d > 0; i++){
      if (STAPPEN[i][2] && !STAPPEN[i][2](a, b)) continue;
      var a2 = STAPPEN[i][1](a), b2 = STAPPEN[i][1](b), d2 = lev(a2, b2);
      if (d2 < d){ uit.push(STAPPEN[i][0]); a = a2; b = b2; d = d2; }
    }
    if (d > 0) uit.push('anders');
    return uit;
  }

  /* ---------- een zin woord voor woord ----------
     De getypte woorden en de goede woorden worden naast elkaar gelegd (een
     woord vergeten, een woord te veel, twee woorden aan elkaar of een woord
     uit elkaar), en dan telt elk woord apart. soepel: een komma telt niet mee
     (die hoor je niet altijd) en een uitroepteken is net zo goed als een punt. */
  function kaal(w){ return String(w).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.,!?;:'"()…\-]/g, ''); }
  function woordVorm(w, opt){
    var s = eenheid(w);
    if (!opt.exact) return norm(s, false);
    if (opt.soepel) s = s.replace(/,/g, '').replace(/!/g, '.');
    return s;
  }
  function vergelijkZin(eigen, goed, opt){
    opt = opt || {};
    var E = eenheid(eigen).split(' ').filter(function(w){ return woordVorm(w, opt) !== ''; }),
        G = eenheid(goed).split(' ').filter(function(w){ return woordVorm(w, opt) !== ''; });
    var n = E.length, m = G.length, K = [], W = [], i, j;
    for (i = 0; i <= n; i++){ K[i] = []; W[i] = []; for (j = 0; j <= m; j++) K[i][j] = Infinity; }
    K[0][0] = 0;
    function zet(i2, j2, k, stap){ if (k < K[i2][j2] - 1e-9){ K[i2][j2] = k; W[i2][j2] = stap; } }
    for (i = 0; i <= n; i++) for (j = 0; j <= m; j++){
      var k = K[i][j]; if (k === Infinity) continue;
      if (i < n && j < m){
        var same = woordVorm(E[i], opt) === woordVorm(G[j], opt), ka = kaal(E[i]), kb = kaal(G[j]);
        zet(i + 1, j + 1, k + (same ? 0 : 0.3 + 0.7 * lev(ka, kb) / Math.max(1, ka.length, kb.length)), [i, j, 1, 1]);
      }
      if (i < n) zet(i + 1, j, k + 1, [i, j, 1, 0]);
      if (j < m) zet(i, j + 1, k + 1, [i, j, 0, 1]);
      if (i < n && j + 1 < m && kaal(E[i]) === kaal(G[j]) + kaal(G[j + 1])) zet(i + 1, j + 2, k + 0.5, [i, j, 1, 2]);
      if (i + 1 < n && j < m && kaal(E[i]) + kaal(E[i + 1]) === kaal(G[j])) zet(i + 2, j + 1, k + 0.5, [i, j, 2, 1]);
    }
    var paren = [];
    for (i = n, j = m; i > 0 || j > 0;){
      var st = W[i][j]; if (!st) break;
      var e = st[2] ? E.slice(st[0], st[0] + st[2]).join(' ') : null, g = st[3] ? G.slice(st[1], st[1] + st[3]).join(' ') : null;
      paren.unshift({ e: e, g: g, n: st[3], ok: st[2] === 1 && st[3] === 1 && woordVorm(e, opt) === woordVorm(g, opt) });
      i = st[0]; j = st[1];
    }
    var aantalGoed = 0, extra = 0, typen = [], html = [];
    paren.forEach(function(p){
      if (p.ok){ aantalGoed++; html.push(schoon(p.g)); return; }
      if (p.e === null){ typen.push({ soort:'woord', e:'', g:p.g }); html.push('<span class="erbij">' + schoon(p.g) + '</span>'); return; }
      if (p.g === null){ extra++; typen.push({ soort:'woord', e:p.e, g:'' }); html.push('<span class="weg">' + schoon(p.e) + '</span>'); return; }
      var a = woordVorm(p.e, opt), b = woordVorm(p.g, opt);
      soortVan(a, b).forEach(function(s){ typen.push({ soort:s, e:p.e, g:p.g }); });
      html.push('<span class="fw">' + verschil(opt.exact ? eenheid(p.e) : p.e.toLowerCase(), opt.exact ? eenheid(p.g) : p.g.toLowerCase()) + '</span>');
    });
    return { paren: paren, goed: aantalGoed, van: m, extra: extra, typen: typen, html: html.join(' '), ok: aantalGoed === m && !extra };
  }

  /* per soort fout een regel: de naam, een paar voorbeelden (vind → vindt) en de regel */
  function typenHtml(typen){
    var groep = {}, volg = [];
    (typen || []).forEach(function(t){ if (!SOORTEN[t.soort]) return; if (!groep[t.soort]){ groep[t.soort] = []; volg.push(t.soort); } groep[t.soort].push(t); });
    if (!volg.length) return '';
    return '<span class="fouttypen">' + volg.map(function(s){
      var gezien = {}, vb = groep[s].filter(function(t){ var k = t.e + '|' + t.g; if (gezien[k]) return false; gezien[k] = 1; return true; }).slice(0, 3).map(function(t){
        return t.e === '' ? 'vergeten: ' + schoon(t.g) : t.g === '' ? 'te veel: ' + schoon(t.e) : schoon(t.e) + ' → ' + schoon(t.g);
      });
      return '<span class="ft"><b>' + schoon(SOORTEN[s].naam) + '</b><span class="ftvb">' + vb.join(', ') + '</span><span class="ftregel">' + SOORTEN[s].regel + '</span></span>';
    }).join('') + '</span>';
  }

  /* ---------- een opgave ---------- */
  function opgave(o){
    zetCss();
    var goedLijst = (Array.isArray(o.antwoord) ? o.antwoord : [o.antwoord]).map(String);
    var zin = !!(o.zin || o.woordScore), taal = o.taal || 'nl-NL', nl = /^nl/i.test(taal);
    var soorten = o.soorten !== undefined ? !!o.soorten : nl, MAX = o.max || 3;
    var TEMPO = 0.92, LANGZAAM = 0.7;
    return {
      onderdeel: o.onderdeel, onderdeelNaam: o.onderdeelNaam, vorm: 'eigen', sleutel: o.sleutel, uitleg: o.uitleg, antwoordTekst: o.antwoordTekst || goedLijst[0],
      vraag: o.vraag || 'Luister en typ wat je hoort.', opdracht: o.opdracht || '', beeld: o.beeldExtra || '',
      teken: function(el, api){
        var kan = !!(window.VOORLEES && VOORLEES.kan()), keren = 0, spreekt = false, beurt = 0, gebruikt = {};
        var stukken = (o.stukken || []).filter(function(s){ return s && String(s).trim(); });
        var invoerAttr = ' id="luisterInvoer" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" data-gramm="false" enterkeyhint="done" aria-label="Typ wat je hoort"';
        el.innerHTML = '<div class="luister" id="luistervak">' + SPREKER +
          (o.gat ? '<p class="gat">' + schoon(o.gat).replace(/_{2,}([.,?!]?)/, '<span class="gatnw"><b>&nbsp;</b>$1</span>') + '</p>' : '') +
          (kan ? '<div class="knoppen" role="group" aria-label="Luisteren"><button type="button" id="luisterBtn">Luister</button>' +
            '<button type="button" class="stil" id="langzaamBtn">Langzaam</button>' +
            (o.stukje ? '<button type="button" class="stil" id="stukjeBtn">Alleen het stukje</button>' : '') + '</div>' : '') +
          (kan && stukken.length > 1 ? '<div class="stukken" role="group" aria-label="Luister per stukje"><span>per stukje</span>' +
            stukken.map(function(s, i){ return '<button type="button" data-i="' + i + '" aria-label="Stukje ' + (i + 1) + ' nog een keer">' + (i + 1) + '</button>'; }).join('') + '</div>' : '') +
          '<p class="teller" id="luisterTeller"></p>' +
          '<div class="nood" id="noodvak"' + (kan ? ' hidden' : '') + '><p class="geen" id="noodUit">' + (kan ? '' : 'Deze browser kan niet voorlezen. Op een telefoon of in een andere browser werkt het meestal wel.') + ' Noodoplossing: laat de tekst even zien, en typ hem dan uit je hoofd.</p>' +
            '<div class="knoppen"><button type="button" class="stil" id="flitsBtn">Laat de tekst even zien</button></div></div>' +
          '<p class="flits" id="flits" aria-live="polite"></p>' +
          (zin ? '<textarea rows="2"' + invoerAttr + ' placeholder="typ de hele zin"></textarea>'
               : '<input type="text"' + invoerAttr + ' placeholder="' + (o.gat ? 'het woord' : 'typ hier') + '">') +
          '<div class="verschil" id="verschil"></div></div>';
        var $ = function(id){ return el.querySelector('#' + id); };
        var vak = $('luistervak'), inv = $('luisterInvoer'), lb = $('luisterBtn'), sb = $('langzaamBtn'), kb = $('stukjeBtn'), fb = $('flitsBtn'), fl = $('flits'), tel = $('luisterTeller');
        var stukKnoppen = el.querySelectorAll('.stukken button');

        function stand(){
          var klaar = !api.bezig(), over = MAX - keren;
          if (lb){ lb.textContent = keren ? 'Nog eens' : 'Luister'; lb.disabled = klaar || spreekt || over <= 0; }
          if (sb) sb.disabled = klaar || spreekt || over <= 0;
          if (kb) kb.disabled = klaar || spreekt || over <= 0;
          if (fb) fb.disabled = klaar || spreekt || over <= 0;
          Array.prototype.forEach.call(stukKnoppen, function(b){ b.disabled = klaar || spreekt || !!gebruikt[b.getAttribute('data-i')]; });
          tel.textContent = klaar ? '' : !kan ? (over <= 0 ? 'Je hebt de tekst ' + MAX + ' keer gezien.' : 'Je kunt de tekst nog ' + over + ' keer laten zien.')
            : over <= 0 ? 'Je hebt ' + MAX + ' keer geluisterd. Typ wat je gehoord hebt.'
            : !keren ? 'Je kunt ' + MAX + ' keer luisteren, ook langzaam.'
            : 'Je kunt nog ' + over + ' keer luisteren' + (stukKnoppen.length ? ', en elk stukje nog een keer' : '') + '.';
        }
        function toonNood(tekst){
          var nv = $('noodvak'); if (!nv) return;
          nv.hidden = false;
          if (tekst) $('noodUit').textContent = tekst + ' Noodoplossing: laat de tekst even zien, en typ hem dan uit je hoofd.';
        }
        /* Voorlezen. De golfjes lopen precies zolang de stem praat: voorlezen.js
           meldt het einde (of een fout). Een vangnet voor als die melding nooit komt. */
        function lees(tekst, tempo, telt, na){
          if (!api.bezig() || spreekt || !kan) return false;
          if (telt && keren >= MAX) return false;
          if (telt) keren++;
          spreekt = true; vak.classList.add('praat');
          var mijn = ++beurt;
          var vangnet = setTimeout(function(){ af('te lang'); }, Math.max(8000, String(tekst).length * 220 / tempo));
          function af(reden){
            if (mijn !== beurt) return;
            beurt++; clearTimeout(vangnet);
            spreekt = false; vak.classList.remove('praat');
            reden = String(reden || '');
            /* niet gehoord, dan telt het ook niet */
            var gehoord = /^(klaar|stop|te lang|interrupted|canceled)$/.test(reden);
            if (!gehoord && telt) keren = Math.max(0, keren - 1);
            if (!gehoord && na) na(false);
            /* not-allowed: de browser wil pas praten na een klik; dan gewoon op Luister drukken */
            if (!gehoord && reden !== 'not-allowed') toonNood('De stem doet het niet op dit apparaat.');
            stand();
            if (reden === 'not-allowed' && api.bezig()) tel.textContent = 'Druk op Luister om te beginnen.';
          }
          VOORLEES.spreek({ v: tekst, taal: taal, tempo: tempo, klaar: af });
          stand();
          return true;
        }
        if (lb) lb.addEventListener('click', function(){ if (lees(o.spreek, TEMPO, true)) inv.focus(); });
        if (sb) sb.addEventListener('click', function(){ if (lees(o.spreek, LANGZAAM, true)) inv.focus(); });
        if (kb) kb.addEventListener('click', function(){ if (lees(o.stukje, 0.8, true)) inv.focus(); });
        Array.prototype.forEach.call(stukKnoppen, function(b){
          b.addEventListener('click', function(){
            var i = b.getAttribute('data-i');
            if (gebruikt[i]) return;
            if (lees(stukken[i], 0.8, false, function(ok){ if (!ok) delete gebruikt[i]; })){ gebruikt[i] = true; stand(); inv.focus(); }
          });
        });
        /* de noodknop: de tekst even in beeld, zo lang als nodig is om hem te lezen */
        if (fb) fb.addEventListener('click', function(){
          if (!api.bezig() || spreekt || keren >= MAX) return;
          keren++; spreekt = true; fl.textContent = o.spreek; stand();
          setTimeout(function(){ fl.textContent = ''; spreekt = false; stand(); if (api.bezig()) inv.focus(); }, Math.min(9000, 1500 + String(o.spreek).length * 60));
        });
        /* staat er geen stem voor deze taal op het apparaat, dan meteen de noodknop erbij */
        var stemWeg = null;
        function stemCheck(){
          /* de opgave is weg (de volgende staat er al): niet meer luisteren naar nieuwe stemmen */
          if (!document.body.contains(vak)){ if (stemWeg) stemWeg(); return; }
          if (kan && VOORLEES.stemmenBekend && VOORLEES.stemmenBekend() && !VOORLEES.stemVoor(taal))
            toonNood('Op dit apparaat staat geen ' + (nl ? 'Nederlandse' : 'Engelse') + ' stem, dus voorlezen lukt misschien niet.');
        }
        if (kan && VOORLEES.opStemmen) stemWeg = VOORLEES.opStemmen(stemCheck);

        var knop = api.knop('Nakijken', function(){ kijkNa(); });
        inv.addEventListener('keydown', function(e){ if (e.key === 'Enter' && !e.isComposing){ e.preventDefault(); kijkNa(); } });
        if (zin) inv.addEventListener('input', function(){
          if (/\n/.test(inv.value)) inv.value = inv.value.replace(/\s*\n\s*/g, ' ');
          inv.style.height = 'auto'; inv.style.height = (inv.scrollHeight + 4) + 'px';
        });

        function nakijken(w){
          var res;
          if (zin){
            /* de goede zin die er het dichtst bij ligt; zonder woordScore is alleen de hele zin precies goed, goed */
            goedLijst.forEach(function(g){
              var r = vergelijkZin(w, g, { exact: !!o.exact, soepel: !!o.woordScore });
              r.goedTekst = g;
              if (!o.woordScore) r.ok = norm(g, o.exact) === norm(w, o.exact);
              if (!res || (r.ok && !res.ok) || (r.ok === res.ok && r.goed - r.extra > res.goed - res.extra)) res = r;
            });
            return { ok: res.ok, typen: res.typen, woorden: { goed: res.goed, van: res.van }, eigen: w, goed: res.goedTekst, html: res.html, paren: res.paren };
          }
          var ok = goedLijst.some(function(g){ return norm(g, o.exact) === norm(w, o.exact); });
          var beste = goedLijst.slice().sort(function(a, b){ return lev(norm(w, o.exact), norm(a, o.exact)) - lev(norm(w, o.exact), norm(b, o.exact)); })[0];
          var a = norm(w, o.exact), b = norm(beste, o.exact);
          var toonEigen = !o.exact && beste === beste.toLowerCase() ? w.toLowerCase() : w;
          return { ok: ok, typen: ok ? [] : soortVan(a, b).map(function(s){ return { soort:s, e:w, g:beste }; }),
                   woorden: { goed: ok ? 1 : 0, van: 1 }, eigen: w, goed: beste, html: verschil(toonEigen, beste) };
        }
        function kijkNa(){
          if (!api.bezig()) return;
          var w = eenheid(inv.value);
          if (!w){ api.uit('Typ eerst wat je hoort.'); inv.focus(); return; }
          var res = nakijken(w);
          inv.disabled = true; inv.classList.add(res.ok ? 'goed' : 'fout'); knop.disabled = true;
          if (window.VOORLEES) VOORLEES.stop();
          vak.classList.remove('praat'); fl.textContent = '';
          if (!res.ok) $('verschil').innerHTML = res.html + '<small>' + (zin ? 'onderstreept: een woord met een fout; ' : '') + 'doorgestreept: te veel of anders; groen: zo hoort het</small>';
          var extra = res.ok ? '' : (o.woordScore ? '<b>' + res.woorden.goed + ' van de ' + res.woorden.van + ' woorden goed.</b> ' : '') +
            'Goed is: <b>' + schoon(res.goed) + '</b>' + (soorten ? typenHtml(res.typen) : '');
          api.klaar(res.ok, extra, o.woordScore ? { goed: res.woorden.goed, van: res.woorden.van } : undefined);
          stand();
          if (o.naKijk) try { o.naKijk(res); } catch (e){}
        }
        el.proef = function(){ inv.value = goedLijst[0]; kijkNa(); };
        el.proefFout = function(){ inv.value = 'xq' + goedLijst[0] + 'z'; kijkNa(); };
        el.proefTyp = function(t){ inv.value = t; kijkNa(); };
        stand();
        /* meteen voorlezen als het kan: dat scheelt een klik per woord */
        setTimeout(function(){
          /* niet in een werkblad (dan staat de opgave niet in de pagina), en niet zonder stem voor de taal */
          if (!document.body.contains(vak) || !api.bezig()) return;
          var geenStem = kan && VOORLEES.stemmenBekend && VOORLEES.stemmenBekend() && !VOORLEES.stemVoor(taal);
          if (kan && !geenStem) lees(o.spreek, TEMPO, true);
          inv.focus();
        }, 250);
      }
    };
  }

  /* ---------- de keuze van de stem ----------
     Een klein keuzemenu "Stem" als er meer dan een stem voor de taal is, met
     een knop om hem te horen. De keuze blijft op dit apparaat (voorlezen.js). */
  function stemNaam(s){
    return String(s.name || '').replace(/^(Microsoft|Google|Apple)\s+/i, '').replace(/\s+-\s+.*$/, '').trim() + ' · ' + s.lang;
  }
  function stemKeuze(doel, taal){
    if (!doel || !window.VOORLEES || !VOORLEES.kan() || !VOORLEES.opStemmen) return;
    zetCss();
    taal = taal || 'nl-NL';
    doel.classList.add('stemkeuze');
    doel.hidden = true;
    function teken(){
      var lijst = VOORLEES.stemmenVoor(taal);
      if (lijst.length < 2){ doel.hidden = true; doel.innerHTML = ''; doel.removeAttribute('data-lijst'); return; }
      var nu = VOORLEES.stemVoor(taal), kenmerk = lijst.map(function(s){ return s.name; }).join('|') + '#' + (nu ? nu.name : '');
      if (doel.getAttribute('data-lijst') === kenmerk) return;
      doel.setAttribute('data-lijst', kenmerk);
      doel.hidden = false;
      doel.innerHTML = '<label class="eyebrow" for="stemKies">stem</label><div class="stemrij"><select id="stemKies">' +
        lijst.map(function(s){ return '<option value="' + schoon(s.name) + '"' + (nu && s.name === nu.name ? ' selected' : '') + '>' + schoon(stemNaam(s)) + '</option>'; }).join('') +
        '</select><button type="button" id="stemProbeer">Probeer</button></div>';
      var sel = doel.querySelector('select');
      sel.addEventListener('change', function(){ VOORLEES.kiesStem(taal, sel.value); doel.setAttribute('data-lijst', kenmerk.replace(/#.*$/, '#' + sel.value)); });
      doel.querySelector('#stemProbeer').addEventListener('click', function(){
        var s = VOORLEES.stemmenVoor(taal).filter(function(x){ return x.name === sel.value; })[0];
        VOORLEES.spreek({ v: /^nl/i.test(taal) ? 'Zo klink ik als ik het dictee voorlees.' : 'This is how I sound when I read to you.', taal: taal, stem: s });
      });
    }
    VOORLEES.opStemmen(teken);
  }

  return { opgave: opgave, norm: norm, verschil: verschil, soortVan: soortVan, vergelijkZin: vergelijkZin, typenHtml: typenHtml,
           SOORTEN: SOORTEN, eenheid: eenheid, stemKeuze: stemKeuze };
})();
