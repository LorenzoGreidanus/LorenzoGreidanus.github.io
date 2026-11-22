/* Plaatswaardeschema: de docent stelt zelf het schema samen.

   Kies de kolommen voor de komma (E, TE, HTE, DHTE, tot honderdduizendtallen) en
   achter de komma (geen, t, t h of t h d): zo maak je HTE, DHTE, TE of TE , t h.
   Wat erin staat kies je ook:
   - leeg: alleen het raster, om zelf sommen in te (laten) schrijven;
   - eigen sommen of getallen: een per regel, zoals 347 + 285, 20,5 - 7,25 of 27,05;
   - sommen van de site: optellen, aftrekken, door elkaar of keersommen, passend in de kolommen.
   Een keersom (46 x 23) krijgt tussenrijen: een per cijfer van het tweede getal.
   Bovenaan staat, tenzij de docent het uitzet, een uitgewerkt voorbeeld van meenemen
   (optellen) en lenen (aftrekken).
   Bij een som staan de getallen al in het schema en vult de leerling het antwoord
   in; bij een los getal zet de leerling het getal zelf in het schema. Het
   antwoordblad toont dezelfde schema's ingevuld. Een leeg schema heeft geen
   antwoordblad.

   De eigen sommen staan niet in de link; ze blijven wel op dit apparaat bewaard. */
(function(){
  'use strict';
  if (!window.SPELBLAD) return;
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  var SLEUTEL = 'lg-schema-sommen';
  function bewaard(){ try { return localStorage.getItem(SLEUTEL) || ''; } catch (e){ return ''; } }
  var VOOR = [['e1', 'E', 1], ['e2', 'T E', 2], ['e3', 'H T E', 3], ['e4', 'D H T E', 4], ['e5', 'TD D H T E', 5], ['e6', 'HD TD D H T E', 6]];
  var NA = [['', 'geen', 0], ['k1', ', t', 1], ['k2', ', t h', 2], ['k3', ', t h d', 3]];
  var WAT = [['', 'Leeg schema'], ['eigen', 'Eigen sommen of getallen'], ['plus', 'Optelsommen van de site'], ['min', 'Aftreksommen van de site'], ['mix', 'Optellen en aftrekken door elkaar'], ['keer', 'Keersommen van de site']];
  var RIJEN = [['r2', '2'], ['r3', '3'], ['', '4'], ['r5', '5'], ['r6', '6']];
  var LETTERS = ['E', 'T', 'H', 'D', 'TD', 'HD'], KLEIN = ['t', 'h', 'd'];
  function kiesUit(lijst, aan, std){ return lijst.filter(function(x){ return x[0] && aan.indexOf(x[0]) >= 0; })[0] || lijst.filter(function(x){ return x[0] === std; })[0]; }
  function rondjes(naam, lijst, gekozen){
    return lijst.map(function(x){ return '<label><input type="radio" name="' + naam + '" value="' + x[0] + '"' + (x === gekozen ? ' checked' : '') + '> ' + x[1] + '</label>'; }).join('');
  }

  try {
    var st = document.createElement('style');
    st.textContent =
      '.blad > ol.pwschema{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--pw-breed,60mm),1fr));gap:6mm 8mm;align-items:start}' +
      '.blad > ol.pwschema > li{border-bottom:none;padding:4px 0 4px 34px;break-inside:avoid}' +
      '.blad > ol.pwschema > li::before{top:4px;width:24px;height:24px;font-size:.74rem}' +
      '.blad .pw{border-collapse:collapse;font-variant-numeric:tabular-nums}' +
      '.blad .pw th{font-size:.7rem;font-weight:700;letter-spacing:.04em;color:#204ECF;padding:0 0 2px;text-align:center;border-bottom:2px solid #204ECF}' +
      '.blad .pw td{width:8.5mm;height:9mm;border:1px solid #9aa3bd;text-align:center;font-size:1.15rem;font-weight:600;color:#14224C;padding:0}' +
      '.blad .pw td.pw-op,.blad .pw th.pw-op{border:none;width:6mm;font-weight:500;color:#4a5270}' +
      '.blad .pw td.pw-komma,.blad .pw th.pw-komma{border-top:none;border-bottom:none;width:3.4mm;vertical-align:bottom;font-weight:700;padding-bottom:1mm;border-left:1px solid #9aa3bd;border-right:1px solid #9aa3bd}' +
      '.blad .pw th.pw-komma{border:none;border-bottom:2px solid #204ECF;color:#204ECF}' +
      '.blad .pw tr.pw-onth td{height:6mm;border-style:dashed;font-size:.8rem;font-weight:500;color:#4a5270}' +
      '.blad .pw tr.pw-onth td.pw-op,.blad .pw tr.pw-onth td.pw-komma{border:none}' +
      '.blad .pw tr.pw-uit td{border-top:2.5px solid #14224C}' +
      '.blad .pw tr.pw-uit td.pw-op{border-top:none}' +
      '.blad .pw tr.pw-uit td.pw-komma{border-top:2.5px solid #14224C}' +
      '.blad .pw td.pw-goed{color:#204ECF}' +
      '.blad .pw td.pw-door{text-decoration:line-through;text-decoration-thickness:2px;color:#4a5270}' +
      '.blad .pw-uitlegvak{display:grid;gap:10px;margin:12px 0 4px}' +
      '.blad .pw-uitleg{border:1.5px solid #14224C;border-radius:12px;padding:10px 14px;break-inside:avoid}' +
      '.blad .pw-uitleg h3{margin:0 0 6px;font-size:1rem;font-weight:600;color:#14224C}' +
      '.blad .pw-vbrij{display:flex;gap:16px;align-items:flex-start}' +
      '.blad .pw-vbrij ol{margin:0;padding-left:20px;font-size:.88rem;line-height:1.45;display:grid;gap:4px}' +
      '.blad .pw-vb{flex:none}.blad .pw-vb td{width:8mm;height:8mm;font-size:1.05rem}.blad .pw-vb tr.pw-onth td{font-size:.78rem;font-weight:700}' +
      '.blad .pw-waarom{margin:6px 0 0;font-size:.84rem;color:#4a5270}' +
      '.blad .pw-uitlegvak > .pw-waarom{margin:0}' +
      '.blad .pw-som{font-size:.92rem;font-weight:600;margin:0 0 4px;color:#14224C}' +
      '.wm-zinveld textarea.pw-in{min-height:110px;font-variant-numeric:tabular-nums}' +
      '@media print{.blad .pw th,.blad .pw td{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';
    document.head.appendChild(st);
  } catch (e){}

  /* een som of een getal lezen: 347 + 285, 20,5 - 7,25 of 27,05. Geeft { a, b, op, dec } met a en b zonder komma, of { getal, dec }, of null. */
  function leesRegel(t){
    var s = String(t || '').replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/\./g, ',');
    /* een keersom: alleen hele getallen */
    var k = /^(\d{1,5})[x×*](\d{1,3})$/i.exec(s);
    if (k) return { a:+k[1], b:+k[2], op:'×', dec:0 };
    var m = /^(\d{1,6})(?:,(\d{1,3}))?(?:([+\-])(\d{1,6})(?:,(\d{1,3}))?)?$/.exec(s);
    if (!m) return null;
    var dec = Math.max((m[2] || '').length, (m[5] || '').length), vul = function(h, d){ return Number(h + (d || '') + '000'.slice(0, dec - (d || '').length)); };
    if (!m[3]) return { getal:vul(m[1], m[2]), dec:dec };
    var a = vul(m[1], m[2]), b = vul(m[4], m[5]);
    if (m[3] === '-' && b > a) return null;
    return { a:a, b:b, op:m[3], dec:dec };
  }
  function cijfers(n, dec){ var t = String(n); while (t.length <= dec) t = '0' + t; return t; }
  function metKomma(n, dec){ var t = cijfers(n, dec); return dec ? t.slice(0, -dec) + ',' + t.slice(-dec) : t; }
  /* wat een opgave aan kolommen nodig heeft: cijfers voor en achter de komma */
  function nodig(it){
    var dec = it.dec || 0, l = [it.getal, it.a, it.b, it.uit].concat(it.tussen || []).filter(function(x){ return x != null; }).map(function(x){ return cijfers(x, dec).length - dec; });
    return { voor:Math.max.apply(null, l.concat([1])), na:dec };
  }
  function willekeurig(soort, voor, na){
    var n = voor + na, hoog = Math.pow(10, n) - 1, laag = Math.pow(10, Math.max(0, n - 1)), a, b, op = soort === 'mix' ? (Math.random() < 0.5 ? '+' : '-') : soort === 'plus' ? '+' : '-';
    function tussen(x, y){ return x + Math.floor(Math.random() * (y - x + 1)); }
    if (soort === 'keer'){
      /* het antwoord past in de kolommen voor de komma: bij weinig kolommen keer een cijfer, vanaf vier ook keer twee cijfers */
      var top = Math.pow(10, voor) - 1, twee = voor >= 4 && Math.random() < 0.6;
      b = twee ? tussen(12, 49) : tussen(2, 9);
      a = tussen(Math.max(2, Math.floor(top / b / 12)), Math.max(3, Math.floor(top / b)));
      if (a % 10 === 0) a += 3;
      return { a:a, b:b, op:'×', dec:0 };
    }
    if (op === '+'){
      /* de som past in dezelfde kolommen */
      a = tussen(laag, Math.max(laag, Math.floor(hoog * 0.6))); b = tussen(Math.max(1, Math.floor(laag / 4)), Math.max(1, hoog - a));
    } else { a = tussen(Math.max(laag, 2), hoog); b = tussen(1, Math.max(1, a - 1)); }
    return { a:a, b:b, op:op, dec:na };
  }
  /* een schema tekenen. it: de opgave (of null voor leeg); goed: met de antwoorden erin */
  function tabel(it, voor, na, rijen, onth, goed){
    var kol = voor + na, kop = '<tr><th class="pw-op"></th>', i;
    for (i = voor - 1; i >= 0; i--) kop += '<th>' + LETTERS[i] + '</th>';
    if (na){ kop += '<th class="pw-komma">,</th>'; for (i = 0; i < na; i++) kop += '<th>' + KLEIN[i] + '</th>'; }
    kop += '</tr>';
    function rij(tekst, op, klasse, komma, blauw){
      /* tekst: de cijfers rechts uitgelijnd (zonder komma), of '' voor een lege rij */
      /* een getal met minder cijfers achter de komma dan het schema heeft: de vakjes rechts blijven leeg */
      var c = String(tekst || ''); if (c && it) c += new Array(Math.max(0, na - (it.dec || 0)) + 1).join(' ');
      var h = '<tr' + (klasse ? ' class="' + klasse + '"' : '') + '><td class="pw-op">' + (op || '') + '</td>';
      for (var k = 0; k < kol; k++){
        if (na && k === voor) h += '<td class="pw-komma">' + (komma ? ',' : '') + '</td>';
        var d = c.charAt(c.length - kol + k); if (d === ' ') d = '';
        h += '<td' + (blauw && d ? ' class="pw-goed"' : '') + '>' + (d || '') + '</td>';
      }
      return h + '</tr>';
    }
    var body = '';
    if (!it){
      if (onth) body += rij('', '', 'pw-onth', false);
      for (i = 0; i < rijen; i++) body += rij('', '', i === rijen - 1 && rijen > 1 ? 'pw-uit' : '', !!na);
    } else if (it.getal != null){
      body += rij(goed ? cijfers(it.getal, it.dec) : '', '', '', !!na, goed);
    } else {
      if (onth && it.op === '+') body += rij(goed ? it.onth : '', '', 'pw-onth', false, goed);
      body += rij(cijfers(it.a, it.dec), '', '', !!na) + rij(cijfers(it.b, it.dec), it.op === '+' ? '+' : it.op === '×' ? '\u00d7' : '\u2212', '', !!na);
      /* een keersom met twee of drie cijfers: een tussenrij per cijfer, die tel je op */
      (it.tussen || []).forEach(function(t, j){ body += rij(goed ? String(t) : '', j === it.tussen.length - 1 ? '+' : '', j === 0 ? 'pw-uit' : '', !!na, goed); });
      body += rij(goed ? cijfers(it.uit, it.dec) : '', '', 'pw-uit', !!na, goed);
    }
    return '<table class="pw"><thead>' + kop + '</thead><tbody>' + body + '</tbody></table>';
  }
  /* de onthoudcijfers bij optellen, als tekst zo breed als het schema (een spatie waar niets staat) */
  function onthoud(a, b, kol){
    var A = String(a).split('').reverse(), B = String(b).split('').reverse(), c = 0, uit = [];
    for (var i = 0; i < kol; i++){ var s = (+A[i] || 0) + (+B[i] || 0) + c; c = s >= 10 ? 1 : 0; uit[i + 1] = c ? '1' : ' '; }
    uit[0] = ' ';
    return uit.slice(0, kol).reverse().join('');
  }

  /* ---------- de uitleg bovenaan: een uitgewerkt voorbeeld van meenemen en van lenen ---------- */
  function vb(kop, rijen){
    return '<table class="pw pw-vb"><thead><tr><th class="pw-op"></th>' + kop.map(function(k){ return '<th>' + k + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rijen.map(function(r){ return '<tr' + (r.k ? ' class="' + r.k + '"' : '') + '><td class="pw-op">' + (r.op || '') + '</td>' + r.c.map(function(c){
        var t = typeof c === 'string' ? c : c[0], kl = typeof c === 'string' ? '' : c[1];
        return '<td' + (kl ? ' class="' + kl + '"' : '') + '>' + t + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
  }
  var UITLEG_PLUS = '<div class="pw-uitleg"><h3>Optellen: meenemen</h3><div class="pw-vbrij">' +
    vb(['H', 'T', 'E'], [{ k:'pw-onth', c:[['1', 'pw-goed'], ['1', 'pw-goed'], ''] }, { c:['4', '7', '6'] }, { op:'+', c:['3', '5', '8'] }, { k:'pw-uit', c:[['8', 'pw-goed'], ['3', 'pw-goed'], ['4', 'pw-goed']] }]) +
    '<ol><li><b>Begin rechts, bij de eenheden.</b> 6 + 8 = 14. Dat is 1 tiental en 4 eenheden. Schrijf de 4 op en <b>neem de 1 mee</b>: zet hem klein boven de tientallen.</li>' +
    '<li><b>De tientallen.</b> 7 + 5 = 12, en de 1 die je meenam erbij is 13. Schrijf de 3 op en neem weer 1 mee, nu naar de honderdtallen.</li>' +
    '<li><b>De honderdtallen.</b> 4 + 3 = 7, en de 1 erbij is 8. Schrijf 8 op. Het antwoord is 834.</li></ol></div>' +
    '<p class="pw-waarom">Waarom meenemen? In een vakje past maar \u00e9\u00e9n cijfer. Tien eenheden zijn samen 1 tiental, en dat hoort in de kolom ernaast.</p></div>';
  var UITLEG_MIN = '<div class="pw-uitleg"><h3>Aftrekken: lenen</h3><div class="pw-vbrij">' +
    vb(['H', 'T', 'E'], [{ k:'pw-onth', c:[['4', 'pw-goed'], ['11', 'pw-goed'], ['13', 'pw-goed']] }, { c:[['5', 'pw-door'], ['2', 'pw-door'], ['3', 'pw-door']] }, { op:'\u2212', c:['2', '7', '8'] }, { k:'pw-uit', c:[['2', 'pw-goed'], ['4', 'pw-goed'], ['5', 'pw-goed']] }]) +
    '<ol><li><b>Begin rechts, bij de eenheden.</b> 3 \u2212 8 kan niet. <b>Leen 1 tiental</b> van de buurman links: van de 2 tientallen blijft er 1 over. Streep de 2 door. Dat ene tiental is 10 eenheden, dus je hebt nu 13 eenheden. 13 \u2212 8 = 5.</li>' +
    '<li><b>De tientallen.</b> Er staat nu 1. 1 \u2212 7 kan niet. Leen 1 honderdtal: van de 5 blijft 4 over. Dat honderdtal is 10 tientallen, dus je hebt nu 11 tientallen. 11 \u2212 7 = 4.</li>' +
    '<li><b>De honderdtallen.</b> Er staat nu 4. 4 \u2212 2 = 2. Het antwoord is 245.</li></ol></div>' +
    '<p class="pw-waarom">Waarom mag je lenen? Het getal blijft even groot: 523 is ook 4 honderdtallen, 11 tientallen en 13 eenheden. Je wisselt alleen \u00e9\u00e9n groot stuk in voor tien kleine.</p></div>';
  var UITLEG_KEER = '<div class="pw-uitleg"><h3>Keer: ook meenemen</h3><div class="pw-vbrij">' +
    vb(['H', 'T', 'E'], [{ k:'pw-onth', c:['', ['1', 'pw-goed'], ''] }, { c:['', '4', '6'] }, { op:'\u00d7', c:['', '', '3'] }, { k:'pw-uit', c:[['1', 'pw-goed'], ['3', 'pw-goed'], ['8', 'pw-goed']] }]) +
    '<ol><li><b>Begin rechts.</b> 3 \u00d7 6 = 18. Schrijf de 8 op en neem de 1 mee naar de tientallen.</li>' +
    '<li><b>De tientallen.</b> 3 \u00d7 4 = 12, en de 1 die je meenam erbij is 13. Schrijf 13 op. Het antwoord is 138.</li>' +
    '<li><b>Keer een getal van twee cijfers?</b> Reken eerst keer de eenheden, dan keer de tientallen (zet een 0 achteraan), en tel de twee rijen op.</li></ol></div></div>';
  /* welke uitleg erbij hoort: die van de sommen op het blad; bij een leeg schema optellen en aftrekken */
  function uitleg(wat, items, na){
    var plus = !wat || wat === 'plus' || wat === 'mix', min = !wat || wat === 'min' || wat === 'mix', keer = wat === 'keer';
    if (wat === 'eigen'){ plus = min = keer = false; items.forEach(function(it){ if (it.op === '+') plus = true; if (it.op === '-') min = true; if (it.op === '×') keer = true; }); }
    var h = (plus ? UITLEG_PLUS : '') + (min ? UITLEG_MIN : '') + (keer ? UITLEG_KEER : '');
    if (!h) return '';
    return '<div class="pw-uitlegvak">' + h + (na && (plus || min) ? '<p class="pw-waarom">Met een komma gaat het precies zo. Zet de komma\u2019s recht onder elkaar, vul aan met een nul als een getal minder cijfers achter de komma heeft, en neem mee of leen gewoon over de komma heen.</p>' : '') + '</div>';
  }

  window.SPELBLAD.plaatsschema = {
    naam:'Eigen schema', kort:'Zelf een schema maken: TE, HTE, DHTE of met tienden en honderdsten', icoon:'schema', vak:'reken', eigenNiveau:true,
    aantallen:[1, 2, 3, 4, 6, 8, 9, 12, 15, 16, 20, 24], standaard:6, aantalNaam:'Aantal schema’s',
    delenKop:'Het schema',
    delenTip:'Kies de kolommen: voor de komma tot en met honderdduizendtallen, achter de komma tienden, honderdsten en duizendsten. Zo maak je bijvoorbeeld H T E, D H T E of T E , t h. Laat het schema leeg, typ je eigen sommen, of laat de site sommen maken die in de kolommen passen.',
    delen:function(aan){
      aan = aan || [];
      var wat = kiesUit(WAT, aan, '');
      var gek = VOOR.filter(function(x){ return aan.indexOf(x[0]) >= 0; }); if (!gek.length) gek = [VOOR[2]];
      return '<p class="kop">Kolommen voor de komma</p>' + VOOR.map(function(x){ return '<label><input type="checkbox" name="pw-voor" value="' + x[0] + '"' + (gek.indexOf(x) >= 0 ? ' checked' : '') + '> ' + x[1] + '</label>'; }).join('') +
        '<small>Vink er meer dan een aan en de schema’s wisselen elkaar af, bijvoorbeeld T E, H T E en D H T E op één blad.</small>' +
        '<p class="kop">Achter de komma</p>' + rondjes('pw-na', NA, kiesUit(NA, aan, '')) +
        '<p class="kop">Wat staat erin</p>' + rondjes('pw-wat', WAT, wat) +
        '<label class="wm-zinveld"><textarea class="pw-in" name="pw-sommen" aria-label="Eigen sommen of getallen, een per regel" placeholder="347 + 285\n20,5 - 7,25\n27,05" spellcheck="false">' + schoon(bewaard()) + '</textarea>' +
        '<small>Alleen bij Eigen sommen of getallen: een per regel. Een som met + of − staat al in het schema; een los getal zet de leerling er zelf in. Past een som niet in de gekozen kolommen, dan komen er kolommen bij.</small></label>' +
        '<p class="kop">Rijen in een leeg schema</p>' + rondjes('pw-rij', RIJEN, kiesUit(RIJEN, aan, '')) +
        '<p class="kop">Extra</p>' +
        '<label><input type="checkbox" name="pw-onth" value="onth"' + (aan.indexOf('onth') >= 0 ? ' checked' : '') + '> Een rij vakjes voor wat je meeneemt (bij optellen)</label>' +
        '<label><input type="checkbox" name="pw-kaal" value="kaal"' + (aan.indexOf('kaal') >= 0 ? ' checked' : '') + '> Zonder de uitleg van meenemen en lenen bovenaan</label>';
    },
    lees:function(el){
      function gekozen(naam){ var x = el.querySelector('input[name="' + naam + '"]:checked'); return x ? x.value : ''; }
      var t = el.querySelector('textarea[name="pw-sommen"]'), tekst = t ? String(t.value).slice(0, 2000) : '';
      try { if (t) localStorage.setItem(SLEUTEL, tekst); } catch (e){}
      var voors = [].map.call(el.querySelectorAll('input[name="pw-voor"]:checked'), function(x){ return Number(String(x.value).slice(1)); }).filter(function(v){ return v >= 1 && v <= 6; }).sort();
      if (!voors.length) voors = [3];
      return { voor:voors[0], voors:voors, na:(kiesUit(NA, [gekozen('pw-na')], '') || NA[0])[2], wat:gekozen('pw-wat'),
        rijen:Number((gekozen('pw-rij') || 'r4').slice(1)) || 4, onth:!!(el.querySelector('input[name="pw-onth"]') || {}).checked, kaal:!!(el.querySelector('input[name="pw-kaal"]') || {}).checked,
        sommen:tekst.split(/\r?\n/).map(function(r){ return r.trim(); }).filter(Boolean).slice(0, 40) };
    },
    maak:function(keuze, n){
      var uit = [], i, voors = keuze.voors && keuze.voors.length ? keuze.voors : [keuze.voor || 3];
      /* meer soorten aangevinkt: ze wisselen elkaar af, van klein naar groot */
      function welke(j){ return voors[j % voors.length]; }
      if (keuze.wat === 'eigen'){
        var goed = keuze.sommen.map(leesRegel).filter(Boolean);
        if (!goed.length) return { fout:'Typ je eigen sommen of getallen, een per regel. Bijvoorbeeld 347 + 285, 20,5 - 7,25 of 27,05.' };
        /* het aantal is het aantal regels dat je typte */
        uit = goed.slice(0, 40);
      } else if (keuze.wat){
        var gezien = {};
        for (i = 0; i < n * 6 && uit.length < n; i++){ var vk = welke(uit.length), w = willekeurig(keuze.wat, vk, keuze.na), sl = w.a + w.op + w.b; if (!gezien[sl]){ gezien[sl] = 1; w.vk = vk; uit.push(w); } }
      } else for (i = 0; i < n; i++) uit.push({ leeg:true, vk:welke(i) });
      uit.forEach(function(it){
        if (it.leeg || it.getal != null) return;
        if (it.op === '×'){
          it.uit = it.a * it.b;
          var cb = String(it.b).split('').reverse();
          if (cb.length > 1) it.tussen = cb.map(function(d, j){ return it.a * Number(d) * Math.pow(10, j); });
        } else it.uit = it.op === '+' ? it.a + it.b : it.a - it.b;
      });
      return uit;
    },
    teken:function(w){
      var k = w.keuze, items = w.items, leeg = !k.wat, voor = k.voor, na = k.na;
      /* Elk schema krijgt de gekozen kolommen, en meer als de som ze nodig heeft. Een keersom heeft
         geen kolommen achter de komma. Een heel getal in een schema met tienden laat die vakjes leeg. */
      items.forEach(function(it){
        if (it.leeg){ it.kv = it.vk || k.voor; it.kn = k.na; voor = Math.max(voor, it.kv); return; }
        var nd = nodig(it), soorten = k.voors || [k.voor];
        /* eigen som: het kleinste aangevinkte schema waar de som in past */
        var basis = it.vk || soorten.filter(function(v){ return v >= nd.voor; })[0] || soorten[soorten.length - 1];
        it.kv = Math.min(6, Math.max(basis, nd.voor)); it.kn = it.op === '×' ? 0 : Math.min(3, Math.max(k.na, nd.na));
        if (it.op === '+') it.onth = onthoud(it.a, it.b, it.kv + (it.dec || 0));
        voor = Math.max(voor, it.kv); na = Math.max(na, it.kn);
      });
      var breed = 6 + (voor + na) * 8.5 + (na ? 3.4 : 0) + 12;
      var soortNamen = [], gehad = {};
      items.forEach(function(it){ if (!gehad[it.kv]){ gehad[it.kv] = 1; soortNamen.push(it.kv); } });
      soortNamen.sort();
      var naam = soortNamen.map(function(v){ return LETTERS.slice(0, v).reverse().join(' '); }).join(', ') + (na ? ' , ' + KLEIN.slice(0, na).join(' ') : '');
      function vraag(it){
        if (it.leeg) return '';
        return '<p class="pw-som">' + (it.getal != null ? 'Zet in het schema: ' + metKomma(it.getal, it.dec) : metKomma(it.a, it.dec) + (it.op === '+' ? ' + ' : it.op === '×' ? ' \u00d7 ' : ' \u2212 ') + metKomma(it.b, it.dec)) + '</p>';
      }
      return {
        titel:'Plaatswaardeschema', sub:naam + ' · ' + items.length + (items.length === 1 ? ' schema' : ' schema’s'), klasse:'pwschema', enkel:leeg,
        intro:leeg ? 'Schrijf in elk vakje één cijfer. Begin rechts.' : 'Vul in elk vakje één cijfer in. Begin rechts' + (na ? ' en zet de komma’s recht onder elkaar.' : '.'),
        boven:'<style>.blad > ol.pwschema{--pw-breed:' + Math.round(breed) + 'mm}</style>' + (k.kaal ? '' : uitleg(k.wat, items, na)),
        vragen:items.map(function(it){ return '<li>' + vraag(it) + tabel(it.leeg ? null : it, it.kv, it.kn, k.rijen, k.onth, false) + '</li>'; }).join(''),
        antwoorden:leeg ? '' : items.map(function(it){ return '<li>' + vraag(it) + tabel(it, it.kv, it.kn, k.rijen, k.onth, true) + '</li>'; }).join('')
      };
    }
  };
})();
