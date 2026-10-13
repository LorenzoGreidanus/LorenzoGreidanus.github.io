/* Een werkblad om één rekenmanier te oefenen (rekenmanieren.js).

   De docent kiest de manier: rijgen, kolomsgewijs, de hokjesmethode, de
   staartdeling, ... Bovenaan staat een voorgedaan voorbeeld, stap voor stap.
   Bij elke som staat de vorm van die manier klaar: onder elkaar, een leeg
   rooster, een getallenlijn of een haptabel, met lijnen voor de tussenstappen.
   Op het antwoordblad staat elke som helemaal uitgewerkt in die manier.

   De sommen passen bij het niveau en bij de manier: compenseren krijgt
   getallen vlak onder een rond getal, verdubbelen en halveren krijgt een 25
   of een 50, aanvullen krijgt getallen die dicht bij elkaar liggen. */
(function(){
  'use strict';
  var RM = window.REKENMANIEREN;
  if (!RM || !window.SPELBLAD) return;
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function r(lo, hi){ return lo + Math.floor(Math.random() * (hi - lo + 1)); }
  function geen0(lo, hi){ var x; do { x = r(lo, hi); } while (x % 10 === 0); return x; }
  /* bijna rond: 29, 98, 199, 397 */
  function bijnaRond(lo, hi){ var x; do { x = r(lo, hi); } while (!(x % 10 >= 8 || (x >= 95 && x % 100 >= 97))); return x; }

  /* Bij cijferend en kolomsgewijs gaat het om onthouden en lenen: een som
     zonder dat oefent het niet. Dus net zo lang trekken tot het erin zit. */
  function onthoudt(a, b){ for (var i = 0; i < 7; i++) if (Math.floor(a / Math.pow(10, i)) % 10 + Math.floor(b / Math.pow(10, i)) % 10 >= 10) return true; return false; }
  function leent(a, b){ for (var i = 0; i < 7; i++) if (Math.floor(a / Math.pow(10, i)) % 10 < Math.floor(b / Math.pow(10, i)) % 10) return true; return false; }
  function keerOnthoudt(a, b){ for (var j = 0; Math.pow(10, j) <= b; j++){ var y = Math.floor(b / Math.pow(10, j)) % 10; for (var i = 0; Math.pow(10, i) <= a; i++) if ((Math.floor(a / Math.pow(10, i)) % 10) * y >= 10) return true; } return false; }
  function som(bew, id, niv){
    var s, p = 0;
    do { s = som0(bew, id, niv); p++; }
    while (p < 200 && (id === 'cijferend' || id === 'kolom') && !(bew === 'plus' ? onthoudt(s[0], s[1]) : bew === 'min' ? leent(s[0], s[1]) : bew === 'keer' ? keerOnthoudt(s[0], s[1]) : true));
    return s;
  }
  /* een som die bij de manier en het niveau (1 tot 4) past */
  function som0(bew, id, niv){
    var a, b;
    if (bew === 'plus'){
      if (id === 'compenseren'){ a = r([24, 120, 340, 1200][niv - 1], [80, 700, 900, 8000][niv - 1]); b = bijnaRond([18, 28, 98, 198][niv - 1], [89, 99, 499, 999][niv - 1]); }
      else { a = geen0([23, 124, 236, 1236][niv - 1], [89, 789, 987, 8976][niv - 1]); b = geen0([12, 112, 148, 238][niv - 1], [79, 689, 897, 4987][niv - 1]); }
      return [a, b];
    }
    if (bew === 'min'){
      if (id === 'compenseren'){ b = bijnaRond([18, 28, 98, 198][niv - 1], [49, 99, 399, 999][niv - 1]); a = r(b + [10, 30, 100, 300][niv - 1], b + [60, 500, 900, 5000][niv - 1]); }
      else if (id === 'aanvullen'){ b = geen0([38, 186, 690, 2950][niv - 1], [80, 700, 980, 7900][niv - 1]); a = b + r([7, 14, 21, 32][niv - 1], [30, 60, 120, 280][niv - 1]); }
      else { b = geen0([14, 118, 236, 1238][niv - 1], [58, 589, 789, 5789][niv - 1]); a = b + geen0([12, 104, 128, 1204][niv - 1], [40, 380, 890, 3890][niv - 1]); }
      return [a, b];
    }
    if (bew === 'keer'){
      if (id === 'compenseren'){ a = bijnaRond([18, 28, 48, 98][niv - 1], [49, 99, 199, 499][niv - 1]); b = r(3, [6, 9, 12, 25][niv - 1]); return Math.random() < .5 ? [a, b] : [b, a]; }
      if (id === 'verdubbelen'){ a = [5, 25, 50, 125][r(0, Math.min(3, niv))]; b = 2 * r(3, [9, 12, 24, 32][niv - 1]); if (a === 125) b = 8 * r(1, 4); return [b, a]; }
      if (id === 'hokjes'){ return niv <= 2 ? [geen0(12, 49), geen0(12, 39)] : [geen0(112, 489), geen0(13, 79)]; }
      if (id === 'splitsen' && niv === 1) return [geen0(13, 89), r(3, 9)];
      a = [geen0(13, 98), geen0(23, 98), geen0(112, 489), geen0(213, 987)][niv - 1];
      b = [r(3, 9), geen0(12, 39), geen0(13, 79), geen0(14, 89)][niv - 1];
      if (id === 'cijferend' && niv === 2 && Math.random() < .5){ a = geen0(112, 489); b = r(3, 9); }
      return [a, b];
    }
    /* delen: meestal precies, op de hogere niveaus soms met rest */
    b = [r(2, 9), r(3, 9), r(11, 25), r(12, 48)][niv - 1];
    var q = [r(12, 49), r(24, 249), r(23, 189), r(104, 999)][niv - 1];
    a = b * q + (niv >= 2 && Math.random() < .3 ? r(1, b - 1) : 0);
    return [a, b];
  }

  /* de vorm bij een som op het werkblad: het begin van het plaatje en lijnen om in te schrijven */
  function vorm(res, id){
    var n = res.stappen.length, bv = res.beeld(0), lijnen = '';
    var metBeeld = ['kolom', 'cijferend', 'hokjes', 'hap', 'staart', 'rijgen', 'aanvullen', 'compenseren'].indexOf(id) >= 0;
    var aantal = id === 'hokjes' || id === 'hap' || id === 'staart' ? 1 : id === 'kolom' || id === 'cijferend' ? 0 : Math.min(5, n);
    for (var i = 0; i < aantal; i++) lijnen += '<span class="lijn" aria-hidden="true"></span>';
    /* onder elkaar: lege regels onder de streep, zoveel als er tussenuitkomsten zijn */
    if (id === 'kolom' || id === 'cijferend'){
      var regels = res.stappen.filter(function(s){ return /^Regel/.test(s.tekst); }).length;
      var leeg = id === 'kolom' ? n : regels > 1 ? regels + 1 : 1;
      /* zoveel vakjes per regel als de regel met het eerste getal heeft */
      var rij = (bv.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || []).filter(function(t){ return !/rm-klein/.test(t); })[0] || '';
      var kols = (rij.match(/<td/g) || []).length;
      var leegRij = '<tr class="rm-leeg">' + Array(kols + 1).join('<td></td>') + '</tr>';
      bv = bv.replace(/<\/table>$/, Array(Math.min(6, leeg) + 1).join(leegRij) + '</table>');
    }
    return (metBeeld ? '<div class="rm-wb">' + bv + '</div>' : '') + lijnen + (id === 'hokjes' || id === 'hap' ? '<span class="rm-samen">samen: <span class="lijn kort" aria-hidden="true"></span></span>' : '');
  }

  RM.stijl();
  var KEUZES = [];
  RM.BEWERKINGEN.forEach(function(b){ RM.MANIEREN[b.id].forEach(function(m){ KEUZES.push({ waarde:b.id + '/' + m.id, bew:b, m:m }); }); });
  function standaardKeuze(){ var m = RM.mijn('keer'); return 'keer/' + (m || 'kolom'); }

  /* de stijl van de manieren op papier: vaste kleuren, ook als de site in donker staat */
  try {
    var st = document.createElement('style');
    st.textContent = '.blad{--rm-acc:#204ECF;--rm-acc2:#C4452A}' +
      '.blad .rm-onder td,.blad .rm-regels p,.blad .rm-staart{color:#14224C}.blad .rm-onder tr.rm-zacht td,.blad .rm-onder td.rm-teken{color:#4a5270}' +
      '.blad .rm-onder tr.rm-sterk td{color:#204ECF}.blad .rm-onder tr.rm-klein td{color:#C4452A}' +
      '.blad .rm-onder tr.rm-leeg td{height:1.7em;border-bottom:1px dashed #9aa3bb}' +
      '.blad .rm-hokjes th,.blad .rm-hokjes td,.blad .rm-tabel th,.blad .rm-tabel td{border-color:#9aa3bb;color:#14224C;background:none;min-width:3.6em;height:2.2em}' +
      '.blad .rm-hokjes th{background:#eef2fc}.blad .rm-tabel th{color:#4a5270}.blad .rm-tabel tr.rm-sterk td,.blad .rm-tot{color:#204ECF}' +
      '.blad .rm-lijn{color:#14224C;max-width:420px;margin:4px 0}.blad .rm-lijn text{fill:#14224C}.blad .rm-lijn .rm-sprong{fill:#204ECF}.blad .rm-lijn .rm-eind{fill:#C4452A}' +
      '.blad .rm-wb{margin:8px 0 2px}.blad .rm-wb .rm-onder{margin:0}.blad .rm-wb .rm-hokjes,.blad .rm-wb .rm-tabel{margin:0}' +
      '.blad .rm-wb .rm-staart{justify-content:flex-start;min-height:6.5em}' +
      '.blad .rm-samen{display:flex;align-items:flex-end;gap:6px;margin-top:6px;max-width:260px}.blad .rm-samen .lijn{flex:1}' +
      '.blad .rm-voorbeeld{border:1.5px solid #c9d2e6;border-radius:10px;padding:12px 14px;margin:6px 0 14px;break-inside:avoid}' +
      '.blad .rm-voorbeeld h3{font-size:1rem;margin:0 0 4px}.blad .rm-voorbeeld .rm-kort{color:#4a5270;margin:0 0 8px;font-size:.9rem}' +
      '.blad .rm-voorbeeld .rm-werk{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:start}' +
      '.blad .rm-voorbeeld ol{margin:0;padding-left:20px;font-size:.88rem;line-height:1.45}.blad .rm-voorbeeld ol b{font-variant-numeric:tabular-nums}' +
      '.blad .rm-ant{margin-top:4px}.blad .rm-ant .rm-onder,.blad .rm-ant .rm-hokjes,.blad .rm-ant .rm-tabel{font-size:.85rem;margin:4px 0}.blad .rm-ant .rm-lijn{max-width:300px}' +
      '.blad .rm-ant .rm-staart{justify-content:flex-start;font-size:.95rem}' +
      '@media(max-width:560px){.blad .rm-voorbeeld .rm-werk{grid-template-columns:minmax(0,1fr)}}' +
      '@media print{.blad .rm-wb,.blad .rm-ant{break-inside:avoid}}';
    document.head.appendChild(st);
  } catch (e){}

  window.SPELBLAD.manieren = {
    naam:'Rekenmanieren: oefenen op één manier', vak:'reken',
    aantallen:[4, 6, 8, 10, 12], standaard:6, aantalNaam:'Aantal sommen',
    delenKop:'Welke manier',
    delenTip:'Kies één manier. Bovenaan komt een voorgedaan voorbeeld; bij elke som staat de vorm van die manier klaar. Op het antwoordblad staat elke som uitgewerkt. Alle manieren stap voor stap staan op de pagina Rekenmanieren.',
    delen:function(aan){
      var gekozen = KEUZES.filter(function(k){ return aan.indexOf(k.waarde) >= 0; })[0];
      var w = gekozen ? gekozen.waarde : standaardKeuze();
      var h = '';
      RM.BEWERKINGEN.forEach(function(b){
        h += '<p class="kop">' + schoon(b.naam) + '</p>' + RM.MANIEREN[b.id].map(function(m){
          var v = b.id + '/' + m.id;
          return '<label><input type="radio" name="mn" value="' + v + '"' + (v === w ? ' checked' : '') + '> ' + schoon(m.naam) + '</label>';
        }).join('');
      });
      return h + '<p class="kop">Voorbeeld</p><label><input type="checkbox" name="mnvb" value="1"' + (aan.indexOf('zonder') >= 0 ? '' : ' checked') + '> Een voorgedaan voorbeeld bovenaan</label>';
    },
    lees:function(el, rang){
      var w = (el.querySelector('input[name="mn"]:checked') || {}).value || standaardKeuze(), d = w.split('/');
      return { bew:d[0], id:d[1], voorbeeld:!!el.querySelector('input[name="mnvb"]:checked'), niv:Math.max(1, Math.min(4, rang || 2)) };
    },
    maak:function(o, n){
      var uit = [], gezien = {};
      /* een voorbeeld en n sommen, allemaal anders */
      for (var p = 0; uit.length < n + 1 && p < (n + 1) * 60; p++){
        var s = som(o.bew, o.id, o.niv), k = s.join(',');
        if (gezien[k]) continue;
        var m = RM.manieren(o.bew, s[0], s[1]).filter(function(x){ return x.id === o.id; })[0];
        if (!m) continue;
        gezien[k] = true;
        uit.push({ a:s[0], b:s[1], res:RM.reken(o.bew, s[0], s[1], o.id) });
      }
      if (uit.length < 2) return { fout:'Bij deze manier en dit niveau lukte het niet om sommen te maken. Kies een ander niveau.' };
      var vb = uit.shift();
      uit.forEach(function(x){ x.vb = vb; x.keuze = o; });
      return uit;
    },
    teken:function(w){
      var o = w.items[0].keuze, bw = RM.bewerking(o.bew), vb = w.items[0].vb, m = vb.res.manier;
      var tk = function(x){ return x.a + ' ' + bw.teken + ' ' + x.b; };
      var boven = !o.voorbeeld ? '' : '<div class="rm-voorbeeld"><h3>Zo gaat het: ' + schoon(tk(vb)) + '</h3><p class="rm-kort">' + schoon(m.kort) + '</p>' +
        '<div class="rm-werk"><ol>' + vb.res.stappen.map(function(s){ return '<li><b>' + schoon(s.tekst) + '</b>' + (s.uitleg ? '<br>' + schoon(s.uitleg) : '') + '</li>'; }).join('') + '</ol>' +
        '<div>' + vb.res.beeld(vb.res.stappen.length) + '</div></div></div>';
      var vragen = w.items.map(function(x){
        return '<li><span class="vr">' + schoon(tk(x)) + ' = <span class="lijn kort" aria-hidden="true"></span></span>' + vorm(x.res, o.id) + '</li>';
      }).join('');
      var antwoorden = w.items.map(function(x){
        var toon = ['kolom', 'cijferend', 'hokjes', 'hap', 'staart'].indexOf(o.id) >= 0;
        return '<li><span class="goed">' + schoon(tk(x)) + ' = ' + x.res.antwoord + (x.res.rest ? ' rest ' + x.res.rest : '') + '</span>' +
          (w.uitleg ? '<small>' + schoon(x.res.stappen.map(function(s){ return s.tekst; }).join('; ')) + '.</small>' : '') +
          (toon ? '<div class="rm-ant">' + x.res.beeld(x.res.stappen.length) + '</div>' : '') + '</li>';
      }).join('');
      return { titel:'Werkblad rekenmanieren: ' + m.naam.toLowerCase(), sub:bw.naam + ' · ' + w.niveauNaam + ' · ' + w.items.length + ' sommen', klasse:'manieren',
        intro:'Reken elke som uit met ' + m.naam.toLowerCase().replace(/^de /, 'de ') + '. Schrijf de tussenstappen op.', boven:boven, vragen:vragen, antwoorden:antwoorden };
    }
  };
})();
