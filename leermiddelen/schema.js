/* Invulschema's: een vraag waarbij de leerling vakjes in een schema invult. Zes soorten:
   het DHTE-schema, onder elkaar rekenen, de verhoudingstabel, de getallenlijn, het
   kruisingsschema en een eigen tabel. Gebruikt door maken.html (bouwen en de voorvertoning),
   oefen.html (invullen en nakijken), papier.js (op papier en in het nakijkmodel) en uitslag.js.
   De server (server/materiaal.js) bewaart en kijkt na met dezelfde regels.

   ---------- een schema als vraag ----------
     { vorm:'schema', soort, vraag, punten, alles, bron, onth, tussen, kop:[…], rijen:[rij, …], lijn }
     rij:  { c:[cel, …], l:1 (een streep erboven), k:1 (klein: de rij met onthoudcijfers) }
     cel:  'tekst' (staat er al; '' is leeg), { a:['goed', 'ook goed'] } (invullen; m:1 mag leeg blijven)
           In een toets zonder antwoorden is een invulcel { i:1 }.
     lijn: { van, tot, stap, pijlen:[getal, …] } alleen bij de getallenlijn
     bron: wat de docent intypte (de som, de tabel, de ouders), om het schema opnieuw te maken.
     alles: punten alleen als alles goed is; anders telt elk goed vakje even zwaar.

   ---------- de motor ----------
     SCHEMA.SOORTEN                 de soorten met naam en uitleg
     SCHEMA.bouw(soort, bron, opt)  { kop, rijen, lijn, vraag } of { fout }; opt: { onth, tussen }
     SCHEMA.html(it, o)             het schema; o.modus: 'invul' (invulvakken), 'leeg' (papier),
                                    'model' (met de antwoorden), 'toon' (o.antwoord, met goed en fout)
     SCHEMA.lees(el)                de ingevulde waarden, in de volgorde van de vakjes
     SCHEMA.klaar(el)               alle vakjes die niet leeg mogen, zijn ingevuld
     SCHEMA.nakijk(it, a)           { per:[true/false/null], punt, juist }
     SCHEMA.toon(el, it, a)         kleurt de vakjes in el goed of fout
     SCHEMA.uitleg(it)              een uitleg in stappen (DHTE en onder elkaar), html of ''
     SCHEMA.juist(it)               de antwoorden als tekst
     SCHEMA.antwoordTekst(it, a)    een antwoord van een leerling als tekst
     SCHEMA.gelijk(a, goed)         hoofdletters, spaties, een komma of punt in een getal tellen niet */
window.SCHEMA = (function(){
  'use strict';
  var SOORTEN = [
    { id:'dhte', naam:'DHTE-schema', kort:'getal, optellen, aftrekken', hoe:'Vul in elk vakje één cijfer in. Begin bij de eenheden.' },
    { id:'onder', naam:'Onder elkaar', kort:'+ − × met tussenrijen', hoe:'Vul in elk vakje één cijfer in. Begin rechts.' },
    { id:'vt', naam:'Verhoudingstabel', kort:'vakjes leeg laten', hoe:'Vul de lege vakjes van de tabel in.' },
    { id:'lijn', naam:'Getallenlijn', kort:'aflezen bij de pijlen', hoe:'Welk getal staat bij elke pijl?' },
    { id:'kruis', naam:'Kruisingsschema', kort:'biologie', hoe:'Vul in elk vakje de combinatie van de twee letters in.' },
    { id:'tabel', naam:'Eigen tabel', kort:'elk vak, elke vorm', hoe:'Vul de lege vakjes van de tabel in.' }
  ];
  var KOLOM = ['E', 'T', 'H', 'D', 'TD', 'HD'];
  function esc(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function isIn(c){ return !!c && typeof c === 'object'; }
  function cijfers(n){ return String(n).split(''); }
  /* een getal netjes: hoogstens twee decimalen, met een komma */
  function netjes(x){ var r = Math.round(x * 100) / 100; return String(r).replace('.', ','); }
  /* als getal lezen: 7,50 = 7.5 = 7.50; 1.250 met een punt per duizend ook */
  function getal(s){
    s = String(s == null ? '' : s).replace(/\s+/g, '').replace(/€|euro$/i, '').replace(/−/g, '-');
    if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '');
    s = s.replace(',', '.');
    return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null;
  }
  function gelijk(a, goed){
    var n = function(x){ return String(x == null ? '' : x).toLowerCase().replace(/\s+/g, '').replace(/[.!?;:]+$/, ''); };
    if (n(a) === n(goed)) return true;
    var x = getal(a), y = getal(goed);
    return x !== null && y !== null && Math.abs(x - y) < 1e-9;
  }

  /* ---------- bouwen ---------- */
  function leesSom(s){
    s = String(s || '').replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/[x×*]/gi, '×').replace(/[:÷]/g, ':');
    var m = /^(\d{1,6})([+\-×:])(\d{1,6})$/.exec(s);
    if (m) return { a:+m[1], op:m[2], b:+m[3] };
    if (/^\d{1,6}$/.test(s)) return { getal:+s };
    return null;
  }
  /* een rij cijfers rechts uitgelijnd in n kolommen; in: invulvakjes */
  function rijVan(getalTekst, n, voor, invul){
    var c = cijfers(getalTekst), uit = [voor || ''];
    for (var i = 0; i < n - c.length; i++) uit.push('');
    c.forEach(function(d){ uit.push(invul ? { a:[d] } : d); });
    return uit;
  }
  /* onthouden bij optellen: per kolom (van links naar rechts) wat er van rechts bij komt */
  function onthoudRij(a, b, n){
    var A = cijfers(a).reverse(), B = cijfers(b).reverse(), carry = 0, per = [];
    for (var i = 0; i < n; i++){ var s = (+A[i] || 0) + (+B[i] || 0) + carry; carry = s >= 10 ? 1 : 0; per[i + 1] = carry; }
    var uit = [''];
    for (var k = n - 1; k >= 0; k--){
      if (k === 0){ uit.push(''); continue; }
      var c = per[k];
      uit.push(c ? { a:[String(c)] } : { a:['', '0'], m:1 });
    }
    return uit;
  }
  function bouwSom(soort, bron, opt){
    var s = leesSom(bron);
    if (!s) return { fout: soort === 'dhte' ? 'typ een som als 347 + 285, of een getal als 3528.' : 'typ een som als 347 + 285, 632 − 285 of 46 × 23.' };
    if (s.getal !== undefined){
      if (soort !== 'dhte') return { fout: 'typ een som, zoals 46 × 23.' };
      var g = String(s.getal), ng = Math.max(2, g.length);
      if (ng > 6) return { fout: 'het getal heeft hoogstens zes cijfers.' };
      return { kop:[''].concat(KOLOM.slice(0, ng).reverse()), rijen:[{ c:rijVan(g, ng, '', true) }], vraag:'Zet het getal ' + g + ' in het schema.' };
    }
    if (s.op === ':') return { fout: 'een deling kan nog niet in een schema; maak er een open vraag van.' };
    if (s.op === '-' && s.b > s.a) return { fout: 'het eerste getal moet groter zijn dan het tweede.' };
    if (soort === 'dhte' && s.op === '×') return { fout: 'keersommen gaan bij Onder elkaar.' };
    var teken = { '+':'+', '-':'−', '×':'×' }[s.op];
    var r = s.op === '+' ? s.a + s.b : s.op === '-' ? s.a - s.b : s.a * s.b;
    var tussen = [];
    if (s.op === '×' && String(s.b).length > 1 && opt.tussen !== false)
      cijfers(s.b).reverse().forEach(function(d, i){ tussen.push(String(s.a * +d * Math.pow(10, i))); });
    var n = Math.max(2, String(s.a).length, String(s.b).length, String(r).length);
    tussen.forEach(function(t){ n = Math.max(n, t.length); });
    if (n > (soort === 'dhte' ? 6 : 8)) return { fout: 'de getallen zijn te groot voor een schema.' };
    var rijen = [];
    if (s.op === '+' && opt.onth) rijen.push({ c:onthoudRij(s.a, s.b, n), k:1 });
    rijen.push({ c:rijVan(String(s.a), n, '', false) });
    rijen.push({ c:rijVan(String(s.b), n, teken, false) });
    /* de tussenrijen, met het plusteken bij de laatste: die tel je op */
    tussen.forEach(function(t, i){ rijen.push({ c:rijVan(t, n, i === tussen.length - 1 ? '+' : '', true), l:i === 0 ? 1 : 0 }); });
    rijen.push({ c:rijVan(String(r), n, '', true), l:1 });
    var naam = { '+':'optellen', '-':'aftrekken', '×':'vermenigvuldigen' }[s.op];
    return { kop:soort === 'dhte' ? [''].concat(KOLOM.slice(0, n).reverse()) : [], rijen:rijen,
      vraag:(soort === 'dhte' ? 'Reken uit in het schema: ' : 'Reken onder elkaar uit: ') + s.a + ' ' + teken + ' ' + s.b, naam:naam };
  }
  /* een tabel: een rij per regel, vakjes gescheiden door |, invullen tussen [haken], meer goede antwoorden met / */
  function leesTabel(tekst){
    return String(tekst || '').split(/\r?\n/).map(function(r){ return r.trim(); }).filter(Boolean).map(function(r){
      return r.split('|').map(function(c){
        c = c.trim(); var m = /^\[(.*)\]$/.exec(c);
        return m ? { a:m[1].split('/').map(function(x){ return x.trim(); }).filter(function(x, i){ return x || i === 0; }) } : c;
      });
    });
  }
  function bouwTabel(soort, bron){
    var rijen = leesTabel(bron);
    if (!rijen.length) return { fout:'typ de tabel: een rij per regel, de vakjes gescheiden door |.' };
    if (rijen.length > 12) return { fout:'een tabel heeft hoogstens twaalf rijen.' };
    var breed = Math.max.apply(null, rijen.map(function(r){ return r.length; }));
    if (breed > 10) return { fout:'een tabel heeft hoogstens tien kolommen.' };
    rijen.forEach(function(r){ while (r.length < breed) r.push(''); });
    if (soort === 'vt'){
      if (rijen.length !== 2) return { fout:'een verhoudingstabel heeft precies twee rijen.' };
      /* [?]: de site rekent het vakje uit met een kolom waarin allebei de getallen staan */
      var f = null;
      for (var j = 1; j < breed && f === null; j++){
        var x = isIn(rijen[0][j]) ? null : getal(rijen[0][j]), y = isIn(rijen[1][j]) ? null : getal(rijen[1][j]);
        if (x && y !== null) f = y / x;
      }
      for (var k = 1; k < breed; k++) for (var q = 0; q < 2; q++){
        var c = rijen[q][k];
        if (isIn(c) && c.a.length === 1 && c.a[0] === '?'){
          var ander = rijen[1 - q][k], w = isIn(ander) ? null : getal(ander);
          if (f === null || w === null) return { fout:'bij [?] rekent de site het vakje uit, maar dan moet er een kolom zijn met allebei de getallen, en in dezelfde kolom het andere getal.' };
          var uit = q === 1 ? w * f : w / f;
          rijen[q][k] = { a:[netjes(uit)] };
        }
      }
    }
    var n = 0; rijen.forEach(function(r){ r.forEach(function(c){ if (isIn(c)) n++; }); });
    if (!n) return { fout:'zet de vakjes die de leerling invult tussen [haken], zoals [2,50].' };
    return { kop:[], rijen:rijen.map(function(r){ return { c:r }; }) };
  }
  /* kruisingsschema: twee ouders met elk twee letters, zoals Aa × Aa */
  function combi(x, y){ var l = [x, y].sort(function(p, q){ var P = p === p.toUpperCase(), Q = q === q.toUpperCase(); return P === Q ? (p < q ? -1 : 1) : P ? -1 : 1; }); var a = l.join(''); return { a: a === l[1] + l[0] ? [a] : [a, l[1] + l[0]] }; }
  function bouwKruis(bron){
    var m = /^\s*([A-Za-z])([A-Za-z])\s*[x×*]\s*([A-Za-z])([A-Za-z])\s*$/.exec(String(bron || ''));
    if (!m) return { fout:'typ de ouders als Aa × aa: twee letters per ouder.' };
    var o1 = [m[1], m[2]], o2 = [m[3], m[4]];
    return { kop:[''].concat(o1), rijen:o2.map(function(g){ return { c:[g, combi(o1[0], g), combi(o1[1], g)] }; }),
      vraag:'Twee ouders zijn ' + m[1] + m[2] + ' en ' + m[3] + m[4] + '. Vul het kruisingsschema in.' };
  }
  /* getallenlijn: van, tot, stap van de streepjes, en waar de pijlen staan */
  function bouwLijn(bron){
    var d = String(bron || '').split('|').map(function(x){ return x.trim(); });
    var van = getal(d[0]), tot = getal(d[1]), stap = getal(d[2]);
    var pijlen = String(d[3] || '').split(/[;\s]+|,(?=\s)/).map(function(x){ return getal(x); }).filter(function(x){ return x !== null; });
    if (van === null || tot === null || !(tot > van)) return { fout:'vul een begin en een eind in, met het eind groter dan het begin.' };
    if (!(stap > 0) || (tot - van) / stap > 40) return { fout:'kies een stap voor de streepjes; hoogstens veertig streepjes.' };
    if (!pijlen.length || pijlen.length > 6) return { fout:'zet één tot zes pijlen, zoals 35; 72.' };
    if (pijlen.some(function(p){ return p < van || p > tot; })) return { fout:'een pijl staat buiten de lijn.' };
    return { kop:pijlen.map(function(_, i){ return String.fromCharCode(65 + i); }), rijen:[{ c:pijlen.map(function(p){ return { a:[netjes(p)] }; }) }],
      lijn:{ van:van, tot:tot, stap:stap, pijlen:pijlen }, vraag:'Welk getal hoort bij elke pijl?' };
  }
  function bouw(soort, bron, opt){
    opt = opt || {};
    if (soort === 'dhte' || soort === 'onder') return bouwSom(soort, bron, opt);
    if (soort === 'vt' || soort === 'tabel') return bouwTabel(soort, bron);
    if (soort === 'kruis') return bouwKruis(bron);
    if (soort === 'lijn') return bouwLijn(bron);
    return { fout:'kies een soort schema.' };
  }

  /* ---------- tekenen ---------- */
  var STIJL =
    '.sc-wrap{overflow-x:auto;max-width:100%;padding:2px 2px 6px}' +
    '.sc{border-collapse:collapse;color:var(--ink,#14224C);font-variant-numeric:tabular-nums}' +
    '.sc td,.sc th{text-align:center;padding:0}' +
    '.sc th{font-size:.72rem;font-weight:600;color:var(--link,#204ECF);letter-spacing:.06em;padding:0 2px 4px;border-bottom:2px solid var(--link,#204ECF)}' +
    /* DHTE en onder elkaar: cijfers in kolommen */
    '.sc-cijf td{width:2.4em;height:2.5em;font-size:1.25rem;font-weight:600}' +
    '.sc-dhte td{border-left:1px solid var(--rand2,#c9cedc)}.sc-dhte td:first-child,.sc-dhte th:first-child{border-left:0}' +
    '.sc-cijf td:first-child{width:1.8em;font-weight:400;color:var(--muted,#4a5270)}' +
    '.sc tr.l td{border-top:2.5px solid var(--ink,#14224C)}.sc tr.l td:first-child{border-top-color:transparent}' +
    '.sc-cijf tr.k td{height:1.9em;font-size:.95rem}' +
    '.sc input{font:inherit;font-weight:600;text-align:center;color:var(--ink,#14224C);background:var(--kaart,#fff);border:2px solid var(--rand2,#9aa3bd);border-radius:10px;box-sizing:border-box;min-height:44px}' +
    '.sc input:focus{outline:none;border-color:var(--ocean,#204ECF);box-shadow:0 0 0 3px rgba(32,78,207,.18)}' +
    '.sc-cijf input{width:2.1em;height:2.1em;padding:0}' +
    '.sc-cijf tr.k input{width:1.6em;height:1.6em;min-height:32px;border-style:dashed;font-size:.95rem;border-radius:8px}' +
    /* tabellen: verhoudingstabel, kruisingsschema, eigen tabel */
    '.sc-tab td{border:2px solid var(--ink,#14224C);padding:6px 10px;min-width:3.5em;height:2.6em;font-size:1rem}' +
    '.sc-tab td.vast0{background:var(--kaart2,#FBF6F1);font-weight:600;text-align:left;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '.sc-tab td.in{padding:4px}' +
    '.sc-tab input{width:100%;min-width:5em;height:2.4em;padding:0 6px}' +
    '.sc-kruis td{min-width:3.2em;font-weight:600;font-size:1.1rem}' +
    '.sc-kruis tr:first-child td,.sc-kruis td:first-child{border:0;color:var(--link,#204ECF)}' +
    '.sc-kruis input{min-width:3.2em;width:3.6em}' +
    /* getallenlijn */
    '.sc-lijn svg{display:block;max-width:100%;height:auto;color:var(--ink,#14224C)}' +
    '.sc-pijlen{display:flex;flex-wrap:wrap;gap:10px 18px;margin-top:6px}' +
    '.sc-pijlen label{display:flex;align-items:center;gap:6px;font-weight:600}' +
    '.sc-pijlen input{width:5.5em;height:2.4em}' +
    /* papier en het nakijkmodel */
    '.sc .sc-leeg{display:inline-block;width:1.7em;height:1.8em;border:1.5px solid #14224C;border-radius:5px;vertical-align:middle}' +
    '.sc-cijf tr.k .sc-leeg{width:1.2em;height:1.25em;border-style:dashed;border-color:#8b93ad}' +
    '.sc-tab .sc-leeg,.sc-pijlen .sc-leeg{display:block;width:auto;min-width:4em;height:1.6em;border:0;border-bottom:1.5px dotted #8b93ad;border-radius:0}' +
    '.sc .model{font-family:Caveat,cursive;font-weight:500;font-size:1.35em;color:#204ECF;line-height:1}' +
    /* nakijken */
    '.sc input.goed,.sc .model.goed{border-color:#1f7a52;background:#e3f3ea;color:#14224C}' +
    '.sc input.fout{border-color:#C4452A;background:#fde6df;color:#C4452A}' +
    '.sc input.mist{border-color:#C4452A;border-style:dashed}' +
    '.sc-uitleg{margin:10px 0 0;padding-left:20px;font-size:.92rem;line-height:1.5}' +
    '.blad .sc-cijf td{font-size:1.05rem;height:2.1em;width:2em}';
  var gezet = false;
  function stijl(){ if (gezet || typeof document === 'undefined') return; gezet = true; try { var s = document.createElement('style'); s.setAttribute('data-schema', ''); s.textContent = STIJL; document.head.appendChild(s); } catch (e){} }

  /* de invulcellen op volgorde: rij voor rij, van links naar rechts */
  function cellen(it){ var l = []; (it.rijen || []).forEach(function(r){ (r.c || []).forEach(function(c){ if (isIn(c)) l.push(c); }); }); return l; }
  function celHtml(c, i, o, it, rij){
    if (!isIn(c)) return esc(c);
    var a = (o.antwoord || [])[i], maxl = it.soort === 'dhte' || it.soort === 'onder' ? 1 : it.soort === 'kruis' ? 3 : 40;
    if (o.modus === 'leeg') return '<span class="sc-leeg"></span>';
    if (o.modus === 'model') return c.a && c.a[0] ? '<span class="model">' + esc(c.a[0]) + '</span>' : (c.m ? '' : '<span class="sc-leeg"></span>');
    if (o.modus === 'toon') return '<span class="model">' + esc(a == null ? '' : a) + '</span>';
    var naam = it.soort === 'lijn' ? 'pijl ' + String.fromCharCode(65 + i) : rij.k ? 'onthouden' : 'vakje ' + (i + 1);
    return '<input type="text" data-i="' + i + '"' + (c.m ? ' data-m="1"' : '') + ' maxlength="' + maxl + '" inputmode="' + (it.soort === 'tabel' || it.soort === 'kruis' ? 'text' : 'decimal') + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="' + esc(naam) + '"' +
      (a != null && a !== '' ? ' value="' + esc(a) + '"' : '') + '>';
  }
  function lijnSvg(l){
    var B = 600, H = 70, x0 = 20, x1 = B - 20, sc = function(v){ return x0 + (v - l.van) / (l.tot - l.van) * (x1 - x0); }, h = '';
    h += '<path d="M' + x0 + ' 40H' + x1 + '" stroke="currentColor" stroke-width="2.5"/>';
    var n = Math.round((l.tot - l.van) / l.stap);
    for (var k = 0; k <= n; k++){ var x = sc(l.van + k * l.stap), groot = k === 0 || k === n; h += '<path d="M' + x.toFixed(1) + ' ' + (groot ? 30 : 34) + 'V' + (groot ? 50 : 46) + '" stroke="currentColor" stroke-width="' + (groot ? 2.5 : 1.6) + '"/>'; }
    h += '<text x="' + x0 + '" y="66" text-anchor="middle" font-size="14" fill="currentColor">' + esc(netjes(l.van)) + '</text><text x="' + x1 + '" y="66" text-anchor="middle" font-size="14" fill="currentColor">' + esc(netjes(l.tot)) + '</text>';
    l.pijlen.forEach(function(p, i){ var x = sc(p).toFixed(1); h += '<path d="M' + x + ' 6V28M' + (x - 5) + ' 22L' + x + ' 29L' + (+x + 5) + ' 22" stroke="#F26749" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="' + (+x + 8) + '" y="16" font-size="14" font-weight="700" fill="#F26749">' + String.fromCharCode(65 + i) + '</text>'; });
    return '<svg viewBox="0 0 ' + B + ' ' + H + '" width="' + B + '" role="img" aria-label="Een getallenlijn van ' + esc(netjes(l.van)) + ' tot ' + esc(netjes(l.tot)) + ' met ' + l.pijlen.length + ' pijlen">' + h + '</svg>';
  }
  function html(it, o){
    o = o || {}; stijl();
    var i = 0, soort = it.soort;
    if (soort === 'lijn' && it.lijn){
      var c = cellen(it);
      return '<div class="sc-wrap sc-lijn">' + lijnSvg(it.lijn) + '<div class="sc sc-pijlen">' + c.map(function(cel, k){
        return '<label><span>' + String.fromCharCode(65 + k) + ' =</span>' + celHtml(cel, k, o, it, {}) + '</label>'; }).join('') + '</div></div>';
    }
    var klas = soort === 'dhte' ? 'sc-cijf sc-dhte' : soort === 'onder' ? 'sc-cijf sc-onder' : soort === 'kruis' ? 'sc-tab sc-kruis' : 'sc-tab';
    var kop = (it.kop || []).length && soort !== 'kruis' ? '<thead><tr>' + it.kop.map(function(k){ return '<th>' + esc(k) + '</th>'; }).join('') + '</tr></thead>' : '';
    var rijen = soort === 'kruis' ? [{ c:it.kop || [] }].concat(it.rijen || []) : (it.rijen || []);
    var body = rijen.map(function(r, ri){
      return '<tr class="' + (r.l ? 'l ' : '') + (r.k ? 'k' : '') + '">' + (r.c || []).map(function(c, ci){
        var vast0 = (soort === 'vt' || soort === 'tabel') && ci === 0 && !isIn(c) && c !== '';
        var cel = isIn(c) ? celHtml(c, i++, o, it, r) : esc(c);
        return '<td class="' + (isIn(c) ? 'in' : '') + (vast0 ? ' vast0' : '') + '">' + cel + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return '<div class="sc-wrap"><table class="sc ' + klas + '">' + kop + '<tbody>' + body + '</tbody></table></div>';
  }
  function lees(el){
    var l = [];
    [].forEach.call(el.querySelectorAll('.sc input[data-i]'), function(x){ l[+x.getAttribute('data-i')] = x.value.trim(); });
    for (var i = 0; i < l.length; i++) if (l[i] == null) l[i] = '';
    return l;
  }
  /* klaar om na te kijken: de onthoudvakjes mogen leeg blijven, anders verraadt de knop waar je iets onthoudt */
  function klaar(el){ return [].every.call(el.querySelectorAll('.sc input[data-i]'), function(x){ return x.getAttribute('data-m') || x.closest('tr.k') || x.value.trim(); }); }

  /* ---------- nakijken ---------- */
  /* een vakje dat leeg mag blijven (geen onthoudcijfer), telt alleen mee als er iets in staat */
  function nakijk(it, a){
    a = a || [];
    var per = [], n = 0, goed = 0;
    cellen(it).forEach(function(c, i){
      var w = a[i] == null ? '' : String(a[i]);
      if (!c.a){ per.push(null); return; }
      var ok = c.a.some(function(x){ return gelijk(w, x); });
      if (c.m && !w && ok){ per.push(null); return; }
      per.push(ok); n++; if (ok) goed++;
    });
    var punt = !n ? 1 : it.alles ? (goed === n ? 1 : 0) : goed / n;
    return { per:per, punt:punt, juist:juist(it) };
  }
  function toon(el, it, a){
    var r = nakijk(it, a);
    [].forEach.call(el.querySelectorAll('.sc input[data-i]'), function(x){
      var i = +x.getAttribute('data-i'), ok = r.per[i];
      x.readOnly = true;
      if (ok === true) x.classList.add('goed');
      else if (ok === false) x.classList.add(x.value.trim() ? 'fout' : 'mist');
    });
    return r;
  }
  function juist(it){
    var cijf = it.soort === 'dhte' || it.soort === 'onder';
    return (it.rijen || []).map(function(r){
      var l = (r.c || []).filter(isIn).map(function(c){ return c.a ? c.a[0] : ''; });
      if (!l.length) return '';
      if (r.k) return l.some(Boolean) ? 'onthouden: ' + l.filter(Boolean).join(', ') : '';
      return cijf ? l.join('') : l.join(', ');
    }).filter(Boolean).join(' · ');
  }
  function antwoordTekst(it, a){
    a = a || []; var i = 0, cijf = it.soort === 'dhte' || it.soort === 'onder';
    return (it.rijen || []).map(function(r){
      var l = (r.c || []).filter(isIn).map(function(){ var w = a[i++]; return w == null || w === '' ? (cijf ? '_' : '…') : String(w); });
      if (!l.length) return '';
      if (r.k) return l.every(function(x){ return x === '_'; }) ? '' : 'onthouden: ' + l.join(' ');
      return cijf ? l.join('') : l.join(', ');
    }).filter(Boolean).join(' · ');
  }
  /* de uitleg bij een som in het DHTE-schema of onder elkaar, uit de rijen zelf */
  function uitleg(it){
    if (it.soort !== 'dhte' && it.soort !== 'onder') return '';
    var s = leesSom(it.bron); if (!s || s.getal !== undefined) return '';
    var naam = it.soort === 'dhte' ? ['eenheden', 'tientallen', 'honderdtallen', 'duizendtallen', 'tienduizendtallen', 'honderdduizendtallen'] : null;
    var kol = function(k){ return naam && naam[k] ? 'Bij de ' + naam[k] : k === 0 ? 'Rechts' : 'In kolom ' + (k + 1) + ' van rechts'; };
    var A = cijfers(s.a).reverse(), B = cijfers(s.b).reverse(), stappen = [];
    if (s.op === '+'){
      var carry = 0, n = Math.max(A.length, B.length);
      for (var k = 0; k < n; k++){
        var x = +A[k] || 0, y = +B[k] || 0, som = x + y + carry;
        stappen.push(kol(k) + ': ' + x + ' + ' + y + (carry ? ' + ' + carry : '') + ' = ' + som + (som >= 10 ? '. Schrijf ' + (som % 10) + ' op en onthoud 1.' : '.'));
        carry = som >= 10 ? 1 : 0;
      }
      if (carry) stappen.push('Het onthouden 1 komt in de kolom ervoor.');
    } else if (s.op === '-'){
      var leen = 0;
      for (var j = 0; j < A.length; j++){
        var p = (+A[j] || 0) - leen, q = +B[j] || 0;
        if (p < q){ stappen.push(kol(j) + ': ' + p + ' − ' + q + ' kan niet. Leen 1 van de kolom ervoor: ' + (p + 10) + ' − ' + q + ' = ' + (p + 10 - q) + '.'); leen = 1; }
        else { if (j < B.length || leen) stappen.push(kol(j) + ': ' + p + ' − ' + q + ' = ' + (p - q) + '.'); leen = 0; }
      }
    } else if (s.op === '×'){
      if (B.length > 1) B.forEach(function(d, i){ stappen.push(s.a + ' × ' + (+d * Math.pow(10, i)) + ' = ' + (s.a * +d * Math.pow(10, i)) + '.'); });
      stappen.push((B.length > 1 ? 'Tel ze op: ' : s.a + ' × ' + s.b + ' = ') + (s.a * s.b) + '.');
    }
    return stappen.length ? '<ol class="sc-uitleg">' + stappen.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' : '';
  }

  return { SOORTEN:SOORTEN, bouw:bouw, html:html, lees:lees, klaar:klaar, nakijk:nakijk, toon:toon, juist:juist, antwoordTekst:antwoordTekst,
    uitleg:uitleg, gelijk:gelijk, cellen:cellen, stijl:stijl, leesSom:leesSom };
})();
if (typeof module !== 'undefined' && typeof window !== 'undefined') module.exports = window.SCHEMA;
