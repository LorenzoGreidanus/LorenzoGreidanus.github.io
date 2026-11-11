/* Hoe een tekst uit de leesbank (leesbank.js, leesteksten.js) eruitziet: de
   tekst in zijn eigen vorm (folder, bericht, bronnen, artikel), het kaartje
   "Zo lees je" en de opdrachten met antwoordruimte op papier. Gebruikt door
   werkblad-lezen.js, het opdrachtenboek (werkblad-boek.js) en, voor de tekst
   op het scherm, leesstrategieen.html.

     LEESBLAD.bereid(tekst, doelId)     de taken met de keuzes een keer geschud: { t, doel, ops:[…] }
     LEESBLAD.tekstHtml(tekst)          de tekst zelf
     LEESBLAD.zoHtml(doelId)            het kaartje Zo lees je
     LEESBLAD.blad(prep, { zo, tijd })  { v, a }: alles voor het werkblad en voor het antwoordblad
     LEESBLAD.opmaak(tekst)             **vet** en __onderstreept__ naar html, de rest ontsnapt
     LEESBLAD.normaal(antwoord)         een antwoord om te vergelijken (zoekvragen op het scherm)
   De kleuren gaan via de tokens van de pagina (--ink, --muted, --kaart, --rand),
   met de kleuren van het papier als terugval. */
window.LEESBLAD = (function(){
  'use strict';
  var LETTERS = 'ABCDEFGHIJ', abc = 'abcd';
  function esc(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function opmaak(t){ return esc(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/__([^_]+)__/g, '<u>$1</u>'); }
  function schud(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), h = a[i]; a[i] = a[j]; a[j] = h; } return a; }
  /* een antwoord om te vergelijken: kleine letters, geen spaties en leestekens, 10:00 = 10.00 = 10 uur */
  function normaal(s){
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/€/g, '').replace(/\beuro\b/g, '').replace(/\buur\b/g, '').replace(/(\d)[.:](\d\d)\b/g, '$1$2').replace(/,00\b/g, '')
      .replace(/[^a-z0-9,]+/g, '');
  }

  var IKOON = {
    klok:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2h4"/></svg>',
    pijl:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>'
  };

  /* ---------- de stijl, een keer in de pagina ---------- */
  var STIJL =
    '.lb{--lb-ink:var(--ink,#14224C);--lb-muted:var(--muted,#4a5270);--lb-rand:var(--rand2,#c9d2e6);--lb-zacht:var(--kaart2,#FBF6F1);color:var(--lb-ink)}' +
    '.lb-zo{display:flex;gap:12px;align-items:flex-start;background:var(--lb-zacht);border-radius:12px;padding:10px 14px;margin:0 0 12px;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '.lb-zo > b{font-size:.82rem;white-space:nowrap;padding-top:1px}' +
    '.lb-zo ol{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px 14px;font-size:.8rem;line-height:1.4;counter-reset:z}' +
    '.lb-zo li{counter-increment:z}.lb-zo li::before{content:counter(z) " ";font-weight:600;color:#F26749}' +
    '@media (max-width:600px){.lb-zo{flex-direction:column;gap:4px}.lb-zo ol{grid-template-columns:1fr}}' +
    '.lb-intro{margin:0 0 10px;font-size:.92rem;line-height:1.5}' +
    '.lb-tekst{border:1.5px solid var(--lb-ink);border-radius:12px;padding:14px 16px;margin:0 0 14px;break-inside:auto}' +
    '.lb-tkop{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;margin:0 0 8px}' +
    '.lb-tkop h3{margin:0;font-size:1.12rem;font-weight:600;line-height:1.25}' +
    '.lb-bron{font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--lb-muted);font-weight:600}' +
    '.lb-al{display:grid;grid-template-columns:22px 1fr;gap:6px;margin:0 0 8px;font-family:Georgia,"Times New Roman",serif;font-size:.95rem;line-height:1.6}' +
    '.lb-al:last-child{margin-bottom:0}' +
    '.lb-al > b{font-family:Poppins,system-ui,sans-serif;font-size:.68rem;color:#F26749;padding-top:4px}' +
    '.lb-al u,.lb-blok u,.lb-post u{text-decoration-thickness:2px;text-underline-offset:3px}' +
    '.lb-v-verhaal .lb-al > b{visibility:hidden}' +
    '.lb-blokken{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px}' +
    '.lb-blok{min-width:0}.lb-blok.breed{grid-column:1/-1}' +
    '.lb-blok h4{margin:0 0 4px;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--link,#204ECF);font-weight:600}' +
    '.lb-blok p{margin:0;font-size:.88rem;line-height:1.5}' +
    '.lb-blok table{border-collapse:collapse;width:100%;font-size:.84rem}' +
    '.lb-blok th{text-align:left;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:var(--link,#204ECF);padding:3px 6px;border-bottom:1.5px solid var(--link,#204ECF)}' +
    '.lb-blok th,.lb-blok td{text-align:left}.lb-blok td{padding:3px 6px;border-bottom:1px solid var(--lb-rand)}' +
    '.lb-lijst{display:grid;grid-template-columns:1fr auto;gap:2px 12px;font-size:.86rem}' +
    '.lb-lijst span{padding:2px 0;border-bottom:1px dotted var(--lb-rand)}.lb-lijst span:nth-child(even){font-weight:600;text-align:right}' +
    '.lb-lijst.lang{grid-template-columns:minmax(6em,max-content) minmax(0,1fr)}.lb-lijst.lang span:nth-child(odd){font-weight:600}.lb-lijst.lang span:nth-child(even){font-weight:400;text-align:left}' +
    '@media (max-width:600px){.lb-blokken{grid-template-columns:1fr}.lb-blok table{display:block;overflow-x:auto}}' +
    '.lb-bronnen{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}' +
    '.lb-br{border:1.5px solid var(--lb-ink);border-radius:10px;overflow:hidden;display:flex;flex-direction:column;break-inside:avoid}' +
    '.lb-brk{display:flex;gap:10px;align-items:center;padding:8px 10px;background:var(--lb-zacht);-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '.lb-brk > b{flex:none;width:24px;height:24px;border-radius:50%;background:var(--lb-ink);color:var(--room,#fff);display:grid;place-items:center;font-size:.75rem}' +
    '.lb-brt{font-weight:600;font-size:.92rem;line-height:1.2}.lb-brs{font-size:.72rem;color:var(--lb-muted)}' +
    '.lb-brb{padding:6px 10px 8px;font-size:.82rem;line-height:1.45;border-top:1px dashed var(--lb-rand)}' +
    '.lb-brb small{display:block;font-size:.64rem;letter-spacing:.08em;font-weight:600;color:var(--lb-muted)}' +
    '@media (max-width:600px){.lb-bronnen{grid-template-columns:1fr}}' +
    '.lb-paar{display:grid;grid-template-columns:1.4fr 1fr;gap:12px;align-items:start}' +
    '@media (max-width:600px){.lb-paar{grid-template-columns:1fr}}' +
    '.lb-post{border:1.5px solid var(--lb-ink);border-radius:14px;overflow:hidden}' +
    '.lb-pk{display:flex;gap:9px;align-items:center;padding:8px 12px;border-bottom:1px solid var(--lb-rand)}' +
    '.lb-pk i{width:28px;height:28px;border-radius:50%;background:#EA9836;flex:none}' +
    '.lb-pk b{display:block;font-size:.84rem}.lb-pk small{font-size:.7rem;color:var(--lb-muted)}' +
    '.lb-pkop{background:#FCDED6;color:#14224C;padding:10px 12px;font-weight:600;font-size:1.05rem;line-height:1.25;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '.lb-post ol{margin:0;padding:8px 12px 10px 34px;font-size:.9rem;line-height:1.5}' +
    '.lb-post ol li::marker{font-size:.72rem;color:var(--lb-muted);font-weight:600}' +
    '.lb-naast{border:1.5px solid var(--lb-ink);border-radius:14px;padding:10px 12px;background:var(--lb-zacht);-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '.lb-naast small{font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--lb-muted);font-weight:600}' +
    '.lb-naast b{display:block;margin:2px 0 4px}.lb-naast p{margin:0;font-family:Georgia,"Times New Roman",serif;font-size:.88rem;line-height:1.5}' +
    /* de opdrachten op papier */
    '.lb-tijd{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;font-size:.9rem;margin:0 0 12px}' +
    '.lb-tijd svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;vertical-align:-4px;margin-right:4px}' +
    '.lb-tv{display:inline-flex;align-items:center;gap:4px}.lb-tv i{width:26px;height:26px;border:1.5px solid var(--lb-ink);border-radius:6px}' +
    '.lb-ops{list-style:none;margin:0;padding:0;counter-reset:op}' +
    '.lb-op{counter-increment:op;position:relative;padding:4px 0 12px 34px;break-inside:avoid;font-size:.93rem;line-height:1.45}' +
    '.lb-op::before{content:counter(op);position:absolute;left:0;top:3px;width:24px;height:24px;border-radius:50%;background:#204ECF;color:#fff;font-size:.75rem;font-weight:600;display:grid;place-items:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '.lb-v{display:block;font-weight:500;margin-bottom:6px}' +
    '.lb-k{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 18px}.lb-k.een{grid-template-columns:1fr}' +
    '.lb-k span > b{display:inline-block;width:22px}' +
    '.lb-r{border-collapse:collapse;width:100%;font-size:.88rem}' +
    '.lb-r th{white-space:nowrap;font-size:.62rem;letter-spacing:.06em;text-transform:uppercase;color:var(--lb-muted);font-weight:600;padding:4px;border-bottom:1.5px solid var(--lb-ink);text-align:center}' +
    '.lb-r th:first-child{text-align:left}' +
    '.lb-r td{padding:5px 4px;border-bottom:1px solid var(--lb-rand);text-align:center;height:24px}.lb-r td:first-child{text-align:left}' +
    '.lb-o{display:inline-block;width:15px;height:15px;border:1.5px solid var(--lb-ink);border-radius:50%;vertical-align:middle}' +
    '.lb-hok{display:inline-block;width:30px;height:24px;border:1.5px solid var(--lb-ink);border-radius:6px;vertical-align:middle;flex:none}' +
    '.lb-kp{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 18px}' +
    '.lb-kp > span{display:flex;align-items:center;gap:8px}' +
    '.lb-kies{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}' +
    '.lb-kies span{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--lb-rand);border-radius:8px;padding:4px 10px;font-size:.86rem}' +
    '.lb-kies span > b{width:20px;height:20px;border-radius:6px;background:var(--lb-ink);color:var(--room,#fff);font-size:.72rem;display:grid;place-items:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '.lb-vo{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 14px}' +
    '.lb-vo span{display:flex;align-items:center;gap:8px;border:1px solid var(--lb-rand);border-radius:8px;padding:4px 8px;font-size:.88rem}' +
    '.lb-zk{border-collapse:collapse;width:100%;font-size:.88rem}' +
    '.lb-zk th{font-size:.66rem;letter-spacing:.06em;text-transform:uppercase;color:var(--lb-muted);font-weight:600;padding:4px;border-bottom:1.5px solid var(--lb-ink);text-align:left}' +
    '.lb-zk td{padding:4px;border-bottom:1px solid var(--lb-rand);vertical-align:bottom}' +
    '.lb-zk td:first-child{width:22px;color:var(--lb-muted);font-weight:600}' +
    '.lb-zk .lb-l{display:block;border-bottom:1.5px dotted #8b93ad;height:24px;min-width:90px}' +
    '.lb-l{display:block;border-bottom:1.5px dotted #8b93ad;height:28px}' +
    '.lb-b{display:flex;align-items:flex-end;gap:6px;border-bottom:1.5px dotted #8b93ad;height:28px;color:var(--lb-muted);font-size:.88rem;padding-bottom:2px}' +
    '.lb-wd{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px 8px}' +
    '.lb-wd i{border-bottom:1.5px dotted #8b93ad;height:24px;font-style:normal;font-size:.6rem;color:#8b93ad;text-align:right}' +
    '.lb-sc{display:flex;align-items:stretch;gap:4px;flex-wrap:wrap}' +
    '.lb-sc > span{flex:1 1 110px;min-height:64px;border:1.5px solid var(--lb-ink);border-radius:10px;padding:5px 8px;box-sizing:border-box}' +
    '.lb-sc small{display:block;font-size:.62rem;letter-spacing:.06em;text-transform:uppercase;font-weight:600;color:var(--lb-muted)}' +
    '.lb-sc em{font-family:Caveat,cursive;font-style:normal;font-size:1.15rem;color:#204ECF;line-height:1.1}' +
    '.lb-sc > svg{flex:none;width:14px;align-self:center;fill:none;stroke:var(--lb-ink);stroke-width:2.5}' +
    '.lb-mk{display:flex;gap:16px;margin-top:6px}.lb-mk .lb-l{flex:1}' +
    /* het antwoordblad */
    '.lb-ant{list-style:none;margin:0;padding:0;counter-reset:op}' +
    '.lb-ant > li{counter-increment:op;position:relative;padding:2px 0 8px 30px;font-size:.9rem;line-height:1.45;break-inside:avoid}' +
    '.lb-ant > li::before{content:counter(op);position:absolute;left:0;top:2px;width:22px;height:22px;border-radius:50%;border:1.5px solid #204ECF;color:#204ECF;font-size:.72rem;font-weight:600;display:grid;place-items:center}' +
    '.lb-ant ul{margin:2px 0 0;padding-left:18px}.lb-ant small{display:block;color:var(--lb-muted);font-size:.82rem}' +
    '.lb-ant .goed{font-weight:600}' +
    /* in werkblad.html: een tekst is een geheel, zonder nummer */
    '.blad > ol > li.lb-li{counter-increment:none;padding-left:0;break-inside:auto}' +
    '.blad > ol > li.lb-li::before{display:none}' +
    '.blad > ol > li.lb-li + li.lb-li{border-top:2px solid #14224C;margin-top:10px;padding-top:18px}' +
    /* op papier staat een tekst altijd in zijn geheel op een bladzijde, met zijn kopje erboven; past hij niet meer, dan begint hij op de volgende */
    '@media print{.lb[class*="lb-v-"],.blad > ol > li.lb-li.tekstblok{break-inside:avoid;page-break-inside:avoid}.lb-intro{break-after:avoid}.lb-op{break-inside:avoid}}';
  var gezet = false;
  function stijl(){
    if (gezet) return; gezet = true;
    try { var s = document.createElement('style'); s.setAttribute('data-leesblad', ''); s.textContent = STIJL; document.head.appendChild(s); } catch (e){}
  }

  /* ---------- de tekst ---------- */
  function alineasHtml(t){
    return (t.alineas || []).map(function(a, i){ return '<p class="lb-al"><b>' + (i + 1) + '</b><span>' + opmaak(a) + '</span></p>'; }).join('');
  }
  function blokHtml(b){
    var h = b.kop ? '<h4>' + opmaak(b.kop) + '</h4>' : '';
    if (b.tabel) return '<div class="lb-blok breed">' + h + '<table><thead><tr>' + b.tabel[0].map(function(c){ return '<th>' + opmaak(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      b.tabel.slice(1).map(function(r){ return '<tr>' + r.map(function(c){ return '<td>' + opmaak(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    /* een lijst met lange zinnen rechts (huisregels): links een smalle kop, rechts de zin over de rest van de breedte */
    if (b.lijst) return '<div class="lb-blok' + (b.lijst.some(function(x){ return String(x[1]).length > 24; }) ? ' breed' : '') + '">' + h + '<div class="lb-lijst' + (b.lijst.some(function(x){ return String(x[1]).length > 24; }) ? ' lang' : '') + '">' + b.lijst.map(function(r){ return '<span>' + opmaak(r[0]) + '</span><span>' + opmaak(r[1]) + '</span>'; }).join('') + '</div></div>';
    return '<div class="lb-blok' + (String(b.tekst || '').length > 260 ? ' breed' : '') + '">' + h + '<p>' + opmaak(b.tekst) + '</p></div>';
  }
  function bronHtml(b, i){
    var st = (b.kopjes || []).length ? '<small>' + (/boek/.test(b.soort) ? 'INHOUD' : 'KOPJES') + '</small>' + b.kopjes.map(opmaak).join('<br>') : '';
    return '<div class="lb-br"><div class="lb-brk"><b>' + LETTERS.charAt(i) + '</b><div><div class="lb-brt">' + opmaak(b.titel) + '</div><div class="lb-brs">' + opmaak(b.soort) + ' · ' + opmaak(b.maker) + '</div></div></div>' +
      ((b.tekst || st) ? '<div class="lb-brb">' + (b.tekst ? '<span>' + opmaak(b.tekst) + '</span>' + (st ? '<br>' : '') : '') + st + '</div>' : '') + '</div>';
  }
  function postHtml(p){
    return '<div class="lb-post"><div class="lb-pk"><i aria-hidden="true"></i><span><b>' + opmaak(p.afzender) + '</b>' + (p.label ? '<small>' + opmaak(p.label) + '</small>' : '') + '</span></div>' +
      '<div class="lb-pkop">' + opmaak(p.kop) + '</div><ol>' + (p.zinnen || []).map(function(z){ return '<li>' + opmaak(z) + '</li>'; }).join('') + '</ol></div>';
  }
  function naastHtml(n){
    return '<div class="lb-naast">' + (n.bron ? '<small>' + opmaak(n.bron) + '</small>' : '') + '<b>' + opmaak(n.kop) + '</b><p>' + opmaak(n.tekst) + '</p></div>';
  }
  function tekstHtml(t){
    stijl();
    var binnen = '';
    if ((t.bronnen || []).length) binnen += '<div class="lb-bronnen">' + t.bronnen.map(bronHtml).join('') + '</div>';
    if (t.post) binnen += postHtml(t.post);
    if ((t.alineas || []).length) binnen += alineasHtml(t);
    if ((t.blokken || []).length) binnen += '<div class="lb-blokken">' + t.blokken.map(blokHtml).join('') + '</div>';
    if (t.naast) binnen = '<div class="lb-paar"><div>' + binnen + '</div>' + naastHtml(t.naast) + '</div>';
    var kop = t.vorm === 'post' ? '' : '<div class="lb-tkop"><h3>' + opmaak(t.titel) + '</h3>' + (t.bron ? '<span class="lb-bron">' + opmaak(t.bron) + '</span>' : '') + '</div>';
    /* bronnen en een bericht staan los op het blad, zonder kader eromheen */
    var kader = t.vorm !== 'bronnen' && t.vorm !== 'post';
    return (t.intro ? '<p class="lb-intro">' + opmaak(t.intro) + '</p>' : '') +
      '<div class="lb lb-v-' + esc(t.vorm) + (kader ? ' lb-tekst' : '') + '"' + (kader ? '' : ' style="margin:0 0 14px"') + '>' + kop + binnen + '</div>';
  }
  function zoHtml(doelId){
    var d = window.LEESBANK && LEESBANK.doel(doelId); if (!d) return '';
    stijl();
    return '<div class="lb lb-zo"><b>Zo lees je</b><ol>' + d.zo.map(function(s){ return '<li>' + opmaak(s) + '</li>'; }).join('') + '</ol></div>';
  }

  /* ---------- de taken klaarzetten: wat geschud wordt, een keer ---------- */
  function bereid(t, doelId){
    var ops = (t.taken[doelId] || []).map(function(o){
      var p = { o:o };
      if (o.t === 'keuze'){ p.orde = schud(o.o.map(function(_, i){ return i; })); p.goed = p.orde.indexOf(0); }
      if (o.t === 'koppel'){
        var alle = o.rechts.map(function(r, i){ return { r:r, i:i }; }).concat((o.extra || []).map(function(r){ return { r:r, i:-1 }; }));
        p.rechts = schud(alle);
        p.letter = o.links.map(function(_, i){ var k = -1; p.rechts.forEach(function(x, j){ if (x.i === i) k = j; }); return LETTERS.charAt(k); });
      }
      if (o.t === 'volgorde'){
        var st = o.stappen.map(function(s, i){ return { s:s, i:i }; }), sch = schud(st), n = 0;
        /* niet toevallig al op volgorde */
        while (sch.every(function(x, j){ return x.i === j; }) && n++ < 5) sch = schud(st);
        p.stappen = sch;
      }
      return p;
    });
    return { t:t, doel:doelId, ops:ops };
  }

  /* ---------- een opdracht op papier ---------- */
  function lijnen(n){ var h = ''; for (var i = 0; i < n; i++) h += '<span class="lb-l"></span>'; return h; }
  function opdrachtHtml(p, t){
    var o = p.o, h = '<span class="lb-v">' + opmaak(o.v) + '</span>';
    switch (o.t){
      case 'keuze':
        var lang = p.orde.some(function(i){ return o.o[i].length > 38; });
        return h + '<div class="lb-k' + (lang ? ' een' : '') + '">' + p.orde.map(function(i, j){ return '<span><b>' + abc.charAt(j) + '</b>' + opmaak(o.o[i]) + '</span>'; }).join('') + '</div>';
      case 'raster':
        var al = o.rijen.some(function(r){ return r.al != null; });
        return h + '<table class="lb-r"><thead><tr><th></th>' + o.kol.map(function(k){ return '<th>' + opmaak(k) + '</th>'; }).join('') + (al ? '<th>alinea</th>' : '') + '</tr></thead><tbody>' +
          o.rijen.map(function(r){ return '<tr><td>' + opmaak(r.z) + '</td>' + o.kol.map(function(){ return '<td><span class="lb-o"></span></td>'; }).join('') + (al ? '<td><span class="lb-hok"></span></td>' : '') + '</tr>'; }).join('') + '</tbody></table>';
      case 'koppel':
        return h + '<div class="lb-kp">' + o.links.map(function(l){ return '<span><span class="lb-hok"></span>' + opmaak(l) + '</span>'; }).join('') + '</div>' +
          '<div class="lb-kies">' + p.rechts.map(function(x, j){ return '<span><b>' + LETTERS.charAt(j) + '</b>' + opmaak(x.r) + '</span>'; }).join('') + '</div>';
      case 'volgorde':
        return h + '<div class="lb-vo">' + p.stappen.map(function(x){ return '<span><span class="lb-hok"></span>' + opmaak(x.s) + '</span>'; }).join('') + '</div>';
      case 'zoek':
        return h + '<table class="lb-zk"><thead><tr><th></th><th>Vraag</th><th style="width:19%">Sleutelwoord</th><th style="width:25%">Antwoord</th></tr></thead><tbody>' +
          o.vragen.map(function(q, i){ return '<tr><td>' + String.fromCharCode(97 + i) + '</td><td>' + opmaak(q.v) + '</td><td><span class="lb-l"></span></td><td><span class="lb-l"></span></td></tr>'; }).join('') + '</tbody></table>';
      case 'open':
        if (o.max){ var w = ''; for (var i = 1; i <= o.max; i++) w += '<i>' + (i % 5 ? '' : i) + '</i>'; return h + '<div class="lb-wd">' + w + '</div>'; }
        return h + (o.b ? '<span class="lb-b">' + opmaak(o.b) + '</span>' + lijnen((o.r || 1) - 1) : lijnen(o.r || 2));
      case 'schema':
        return h + '<div class="lb-sc">' + o.vakken.map(function(v, i){
          return (i ? IKOON.pijl : '') + '<span><small>' + opmaak(v) + '</small>' + (o.vb === i ? '<em>' + opmaak(o.m[i]) + '</em>' : '') + '</span>';
        }).join('') + '</div>';
      case 'markeer':
        var l = ''; for (var k = 0; k < o.n; k++) l += '<span class="lb-l"></span>';
        return h + '<span class="lb-v" style="font-weight:400;font-size:.84rem;color:var(--lb-muted)">Markeer in de tekst en schrijf de woorden ook hier op.</span><div class="lb-mk">' + l + '</div>';
    }
    return h;
  }
  function antwoordHtml(p){
    var o = p.o, u = o.u ? '<small>' + opmaak(o.u) + '</small>' : '';
    switch (o.t){
      case 'keuze': return '<span class="goed">' + abc.charAt(p.goed) + '. ' + opmaak(o.o[0]) + '</span>' + u;
      case 'raster': return '<ul>' + o.rijen.map(function(r){ return '<li>' + opmaak(r.z) + ': <b>' + opmaak(o.kol[r.g]) + '</b>' + (r.al != null ? ' (alinea ' + r.al + ')' : '') + '</li>'; }).join('') + '</ul>' + u;
      case 'koppel': return '<ul>' + o.links.map(function(l, i){ return '<li>' + opmaak(l) + ': <b>' + p.letter[i] + '</b> ' + opmaak(o.rechts[i]) + '</li>'; }).join('') + '</ul>' + u;
      case 'volgorde': return '<span class="goed">' + p.stappen.map(function(x){ return x.i + 1; }).join(', ') + '</span> (van links naar rechts, rij voor rij)<ul>' + o.stappen.map(function(s, i){ return '<li>' + (i + 1) + '. ' + opmaak(s) + '</li>'; }).join('') + '</ul>' + u;
      case 'zoek': return '<ul>' + o.vragen.map(function(q, i){ return '<li>' + String.fromCharCode(97 + i) + '. <b>' + opmaak(q.a[0]) + '</b> <small style="display:inline">(sleutelwoord: ' + opmaak(q.s) + ')</small></li>'; }).join('') + '</ul>';
      case 'open': return '<span>Bijvoorbeeld: <b>' + (o.b ? opmaak(o.b) + ' ' : '') + opmaak(o.m) + '</b></span>' + u;
      case 'schema': return '<ul>' + o.vakken.map(function(v, i){ return '<li>' + opmaak(v) + ': <b>' + opmaak(o.m[i]) + '</b></li>'; }).join('') + '</ul>' + u;
      case 'markeer': return '<span>Bijvoorbeeld: <b>' + o.goed.slice(0, Math.max(o.n + 2, 4)).map(opmaak).join(', ') + '</b></span>' + u;
    }
    return '';
  }

  /* ---------- een heel blad: tekst, kaartje, tijd, opdrachten ---------- */
  function blad(prep, opt){
    opt = opt || {};
    stijl();
    var t = prep.t, d = LEESBANK.doel(prep.doel), tijd = '';
    if (opt.tijd !== false && prep.doel === t.strat && (t.tijd || t.strat === 'zoekend' || t.strat === 'verkennend')){
      var zin = t.strat === 'zoekend' ? 'Hoe lang deed je over alle vragen? Schrijf je tijd op.' : t.strat === 'verkennend' ? ((t.bronnen || []).length ? 'Je hebt per bron 30 seconden.' : 'Bekijk eerst 30 seconden alleen de titel en de kopjes.') :
        'Je hebt ' + (t.tijd % 60 ? t.tijd + ' seconden' : (t.tijd / 60) + (t.tijd === 60 ? ' minuut' : ' minuten')) + '. Lees de tekst één keer. Hoe lang deed je erover?';
      tijd = '<div class="lb-tijd"><span>' + IKOON.klok + zin + '</span><span class="lb-tv">Tijd <i></i>:<i></i><i></i></span></div>';
    }
    var v = '<div class="lb">' + (opt.kop ? '<span class="odkop">' + esc(d ? d.naam : '') + ' · ' + esc(t.niv) + '</span>' : '') +
      (opt.zo !== false ? zoHtml(prep.doel) : '') + tekstHtml(t) + tijd +
      '<ol class="lb-ops">' + prep.ops.map(function(p){ return '<li class="lb-op">' + opdrachtHtml(p, t) + '</li>'; }).join('') + '</ol></div>';
    var a = '<div class="lb"><b>' + opmaak(t.titel) + '</b><ol class="lb-ant">' + prep.ops.map(function(p){ return '<li>' + antwoordHtml(p) + '</li>'; }).join('') + '</ol></div>';
    return { v:v, a:a };
  }

  return { bereid:bereid, tekstHtml:tekstHtml, zoHtml:zoHtml, blad:blad, opmaak:opmaak, normaal:normaal, schud:schud, esc:esc, stijl:stijl, LETTERS:LETTERS };
})();
