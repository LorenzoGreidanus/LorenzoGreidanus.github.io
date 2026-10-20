/* De rekenmanieren: een som op meer manieren uitgerekend, stap voor stap.

   Bij rekenen zijn er vaak meer goede manieren. 23 × 14 kun je splitsen,
   in hokjes zetten, kolomsgewijs of cijferend uitrekenen. Welke het beste
   past, hangt af van de leerling en van de methode op school. Daarom kiest
   een leerling (of de docent voor de hele klas) een eigen manier per
   bewerking, en laat elke uitleg die manier zien. De andere manieren staan
   er een tik naast.

   Alleen hele getallen; bij delen mag er een rest overblijven.

   Gebruik (REKENMANIEREN):
     BEWERKINGEN                     [{ id:'plus'|'min'|'keer'|'deel', naam, teken }]
     manieren(bew, a, b)            de manieren die bij deze som passen
     reken(bew, a, b, id)           { manier, stappen:[{ som, uitkomst, tekst, uitleg }], beeld(k), antwoord, rest }
     herken('489 × 9')              { bew, a, b } of null
     mijn(bew)                      de gekozen manier: eigen keuze, anders die van de klas, anders null
     kies(bew, id)                  de eigen keuze bewaren (lg-rekenmanier)
     klas(manieren)                 de keuze van de docent voor de klas bewaren (lg-rekenmanier-klas)
     uitleg(el, bew, a, b, o)       de uitleg in el: een keuze uit de manieren en de stappen
                                    o: { stapVoorStap:true, kort:false, opKies:function(id){} }
     tekst(bew, a, b, id)           de uitwerking als platte tekst, voor een antwoordblad
   Elke stap heeft een som die je kunt narekenen (som en uitkomst); de test
   in de scratchpad doet dat voor duizenden sommen per manier. */
(function(root){
  'use strict';
  var X = '×', MIN = '−', DEEL = ':';
  var BEWERKINGEN = [
    { id:'plus', naam:'Optellen', teken:'+' },
    { id:'min', naam:'Aftrekken', teken:MIN },
    { id:'keer', naam:'Vermenigvuldigen', teken:X },
    { id:'deel', naam:'Delen', teken:DEEL }
  ];
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  /* de stukken van een getal per plaats, van groot naar klein: 489 -> [400, 80, 9] (nullen eruit) */
  function plaatsen(n){
    var s = String(n), uit = [];
    for (var i = 0; i < s.length; i++){ var d = +s.charAt(i); if (d) uit.push(d * Math.pow(10, s.length - 1 - i)); }
    return uit.length ? uit : [0];
  }
  function cijfer(n, i){ return Math.floor(n / Math.pow(10, i)) % 10; }   /* i = 0: de eenheden */
  var PLAATS = ['eenheden', 'tientallen', 'honderdtallen', 'duizendtallen', 'tienduizendtallen', 'honderdduizendtallen'];
  function st(som, uitkomst, uitleg, tekst){ return { som:som, uitkomst:uitkomst, uitleg:uitleg || '', tekst:tekst || (som + ' = ' + uitkomst) }; }
  function rondOp(n, stap){ return Math.ceil(n / stap) * stap; }

  /* ---------- plaatjes ---------- */
  /* Onder elkaar: rijen met een teken en een getal, rechts uitgelijnd; klein
     zijn de cijfers die je onthoudt of leent, boven een kolom. */
  function onder(rijen, o){
    o = o || {};
    var breed = 0;
    rijen.forEach(function(r){ breed = Math.max(breed, String(r.getal).length + (r.inspring || 0)); });
    if (o.klein) Object.keys(o.klein).forEach(function(k){ breed = Math.max(breed, +k + 1); });
    var h = '<table class="rm-onder" aria-hidden="true">';
    if (o.klein && Object.keys(o.klein).length){
      h += '<tr class="rm-klein"><td></td>';
      for (var c = breed - 1; c >= 0; c--) h += '<td>' + (o.klein[c] !== undefined ? schoon(o.klein[c]) : '') + '</td>';
      h += '</tr>';
    }
    rijen.forEach(function(r){
      var s = String(r.getal), ins = r.inspring || 0;
      h += '<tr class="' + (r.streep ? 'rm-streep ' : '') + (r.sterk ? 'rm-sterk ' : '') + (r.zacht ? 'rm-zacht' : '') + '"><td class="rm-teken">' + (r.teken || '') + '</td>';
      for (var i = breed - 1; i >= 0; i--){
        var j = i - ins, ch = j >= 0 && j < s.length ? s.charAt(s.length - 1 - j) : '';
        h += '<td' + (r.door && r.door.indexOf(j) >= 0 ? ' class="rm-door"' : '') + '>' + ch + '</td>';
      }
      h += '</tr>';
    });
    return h + '</table>';
  }
  /* de getallenlijn met sprongen: van start, steeds een sprong erbij of eraf */
  function lijn(start, sprongen){
    var punten = [start]; sprongen.forEach(function(s){ punten.push(punten[punten.length - 1] + s); });
    var lo = Math.min.apply(null, punten), hi = Math.max.apply(null, punten), W = 520, L = 30, R = 30, span = Math.max(1, hi - lo);
    /* kleine sprongen krijgen een minimale breedte, zodat het label past */
    var xs = [L], tot = 0, len = sprongen.map(function(s){ return Math.max(Math.abs(s) / span, 0.13); });
    len.forEach(function(x){ tot += x; });
    var x = L; sprongen.forEach(function(s, i){ x += (W - L - R) * len[i] / tot * (s >= 0 ? 1 : 1); xs.push(x); });
    /* bij aftrekken loopt de lijn van rechts naar links */
    var terug = sprongen.length && sprongen.every(function(s){ return s < 0; });
    if (terug) xs = xs.map(function(v){ return W - v; });
    var h = '<svg class="rm-lijn" viewBox="0 0 ' + W + ' 96" aria-hidden="true"><line x1="10" y1="70" x2="' + (W - 10) + '" y2="70" class="rm-as"/>';
    sprongen.forEach(function(s, i){
      var a = xs[i], b = xs[i + 1], m = (a + b) / 2, hgt = 30;
      h += '<path d="M' + a.toFixed(1) + ' 70 Q' + m.toFixed(1) + ' ' + (70 - hgt * 2) + ' ' + b.toFixed(1) + ' 70" class="rm-boog"/>' +
        '<text x="' + m.toFixed(1) + '" y="' + (70 - hgt - 6) + '" class="rm-sprong">' + (s >= 0 ? '+' : MIN) + Math.abs(s) + '</text>';
    });
    punten.forEach(function(p, i){ h += '<line x1="' + xs[i].toFixed(1) + '" y1="64" x2="' + xs[i].toFixed(1) + '" y2="76" class="rm-as"/><text x="' + xs[i].toFixed(1) + '" y="92" class="rm-punt' + (i === punten.length - 1 ? ' rm-eind' : '') + '">' + p + '</text>'; });
    return h + '</svg>';
  }
  /* de hokjes: de stukken van a boven, die van b links, in elk hokje het product */
  function hokjes(da, db, k){
    var h = '<table class="rm-hokjes" aria-hidden="true"><tr><th>' + X + '</th>' + da.map(function(x){ return '<th>' + x + '</th>'; }).join('') + '</tr>', n = 0;
    db.forEach(function(y){
      h += '<tr><th>' + y + '</th>' + da.map(function(x){ n++; return '<td>' + (n <= k ? x * y : '') + '</td>'; }).join('') + '</tr>';
    });
    return h + '</table>';
  }
  /* een tabel met regels: voor de hapmethode */
  function tabel(kop, rijen){
    return '<table class="rm-tabel" aria-hidden="true"><tr>' + kop.map(function(x){ return '<th>' + x + '</th>'; }).join('') + '</tr>' +
      rijen.map(function(r){ return '<tr' + (r.sterk ? ' class="rm-sterk"' : '') + '>' + r.cellen.map(function(x){ return '<td>' + x + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
  }
  function regels(l){ return '<div class="rm-regels" aria-hidden="true">' + l.map(function(x){ return '<p>' + x + '</p>'; }).join('') + '</div>'; }

  /* ---------- optellen ---------- */
  var PLUS = [
    { id:'rijgen', naam:'Rijgen', kort:'Begin bij het eerste getal en spring er het tweede in stukken bij.', route:'plus1000-rijgen',
      kan:function(){ return true; },
      reken:function(a, b){
        var st0 = [], x = a, d = plaatsen(b);
        d.forEach(function(p, i){ st0.push(st(x + ' + ' + p, x + p, i === 0 ? 'Laat ' + a + ' heel en spring eerst de ' + PLAATS[String(p).length - 1] + ' erbij.' : 'Dan de ' + PLAATS[String(p).length - 1] + '.')); x += p; });
        return { stappen:st0, beeld:function(k){ return lijn(a, d.slice(0, k)); } };
      } },
    { id:'splitsen', naam:'Splitsen', kort:'Splits allebei de getallen en tel de stukken van dezelfde soort bij elkaar.', route:'plus1000-splitsen',
      kan:function(a, b){ return a >= 10 && b >= 10; },
      reken:function(a, b){
        var n = Math.max(String(a).length, String(b).length), st0 = [], som = [];
        for (var i = n - 1; i >= 0; i--){
          var pa = cijfer(a, i) * Math.pow(10, i), pb = cijfer(b, i) * Math.pow(10, i);
          if (!pa && !pb) continue;
          st0.push(st(pa + ' + ' + pb, pa + pb, 'De ' + PLAATS[i] + ' bij elkaar.')); som.push(pa + pb);
        }
        st0.push(st(som.join(' + '), a + b, 'Tel de stukken op.'));
        return { stappen:st0, beeld:function(k){
          var l = [a + ' = ' + plaatsen(a).join(' + '), b + ' = ' + plaatsen(b).join(' + ')];
          st0.slice(0, k).forEach(function(s){ l.push(s.tekst); });
          return regels(l);
        } };
      } },
    { id:'compenseren', naam:'Compenseren', kort:'Maak er een rond getal van, en reken het teveel er daarna weer af.', route:'plus1000-compenseren',
      kan:function(a, b){ return b >= 8 && (b % 10 >= 7 || b % 100 >= 95); },
      reken:function(a, b){
        var r = b % 100 >= 95 && b >= 95 ? rondOp(b, 100) : rondOp(b, 10), te = r - b;
        var st0 = [st(a + ' + ' + r, a + r, b + ' is bijna ' + r + '. Tel eerst ' + r + ' erbij: dat is makkelijk.'),
          st((a + r) + ' ' + MIN + ' ' + te, a + b, 'Je deed er ' + te + ' te veel bij. Haal die er weer af.')];
        return { stappen:st0, beeld:function(k){ return lijn(a, [r, -te].slice(0, k)); } };
      } },
    { id:'kolom', naam:'Kolomsgewijs', kort:'Onder elkaar, van links naar rechts: per kolom optellen en daarna de tussenuitkomsten bij elkaar.', route:'cijf-kolomplus',
      kan:function(a, b){ return a >= 10 || b >= 10; },
      reken:function(a, b){
        var n = Math.max(String(a).length, String(b).length), st0 = [], delen = [];
        for (var i = n - 1; i >= 0; i--){
          var pa = cijfer(a, i) * Math.pow(10, i), pb = cijfer(b, i) * Math.pow(10, i);
          if (!pa && !pb) continue;
          delen.push(pa + pb); st0.push(st(pa + ' + ' + pb, pa + pb, 'De ' + PLAATS[i] + ': schrijf de uitkomst onder de streep.'));
        }
        st0.push(st(delen.join(' + '), a + b, 'Tel de tussenuitkomsten op.'));
        return { stappen:st0, beeld:function(k){
          var r = [{ getal:a }, { teken:'+', getal:b, streep:true }];
          delen.slice(0, k).forEach(function(d){ r.push({ getal:d, zacht:true }); });
          if (k > delen.length){ r[r.length - 1].streep = true; r.push({ getal:a + b, sterk:true }); }
          return onder(r);
        } };
      } },
    { id:'cijferend', naam:'Cijferend', kort:'Onder elkaar, van rechts naar links, per cijfer; boven de 9 onthoud je een 1.', route:'cijf-cijferplus',
      kan:function(a, b){ return a >= 10 || b >= 10; },
      reken:function(a, b){
        var n = Math.max(String(a).length, String(b).length), st0 = [], c = 0, klein = {}, uit = '';
        for (var i = 0; i < n; i++){
          var x = cijfer(a, i), y = cijfer(b, i), s = x + y + c;
          st0.push(st(x + ' + ' + y + (c ? ' + ' + c : ''), s, (i === 0 ? 'Begin rechts. ' : '') + 'De ' + PLAATS[i] + (c ? ', met de ' + c + ' die je onthield' : '') + '. ' + (s >= 10 ? 'Schrijf ' + (s % 10) + ' op en onthoud 1.' : 'Schrijf ' + s + ' op.')));
          c = s >= 10 ? 1 : 0; if (c) klein[i + 1] = 1;
        }
        if (c) st0.push(st('1', 1, 'Er blijft een 1 over: die zet je er vooraan bij.', 'Schrijf de 1 vooraan op.'));
        st0.push(st(a + ' + ' + b, a + b, 'Lees het antwoord onder de streep.'));
        return { stappen:st0, beeld:function(k){
          var kl = {}; Object.keys(klein).forEach(function(i){ if (+i <= k) kl[i] = klein[i]; });
          var som = String(a + b), toon = k >= st0.length - 1 ? som : som.slice(-Math.min(k, som.length));
          return onder([{ getal:a }, { teken:'+', getal:b, streep:true }, { getal:k ? toon : '', sterk:k >= st0.length - 1 }], { klein:kl });
        } };
      } }
  ];

  /* ---------- aftrekken ---------- */
  var MINUS = [
    { id:'rijgen', naam:'Rijgen', kort:'Begin bij het eerste getal en spring het tweede er in stukken af.', route:'plus1000-rijgen-min',
      kan:function(){ return true; },
      reken:function(a, b){
        var st0 = [], x = a, d = plaatsen(b);
        d.forEach(function(p, i){ st0.push(st(x + ' ' + MIN + ' ' + p, x - p, i === 0 ? 'Laat ' + a + ' heel en haal eerst de ' + PLAATS[String(p).length - 1] + ' eraf.' : 'Dan de ' + PLAATS[String(p).length - 1] + '.')); x -= p; });
        return { stappen:st0, beeld:function(k){ return lijn(a, d.slice(0, k).map(function(p){ return -p; })); } };
      } },
    { id:'aanvullen', naam:'Aanvullen', kort:'Begin bij het kleine getal en spring naar het grote: het verschil is wat je erbij deed.', route:'cijf-aanvul',
      kan:function(a, b){ return a > b; },
      reken:function(a, b){
        /* sprongen naar ronde getallen: eerst naar het volgende tiental, dan honderdtal, ... en dan naar a */
        var x = b, spr = [], st0 = [];
        for (var p = 10; p <= 100000 && x < a; p *= 10){
          var naar = rondOp(x + 1, p); if (x % p === 0) continue;
          if (naar > a) break;
          naar = Math.min(rondOp(x, p), a); if (naar <= x) continue;
          spr.push(naar - x); x = naar;
        }
        /* en dan in een keer naar a */
        if (x < a){ spr.push(a - x); x = a; }
        x = b;
        spr.forEach(function(s, i){ st0.push(st(x + ' + ' + s, x + s, i === 0 ? 'Begin bij ' + b + ' en spring naar een rond getal.' : x + s === a ? 'En de laatste sprong naar ' + a + '.' : 'Spring verder.')); x += s; });
        st0.push(st(spr.join(' + '), a - b, 'Tel de sprongen op: zo ver ligt ' + b + ' van ' + a + '.'));
        return { stappen:st0, beeld:function(k){ return lijn(b, spr.slice(0, k)); } };
      } },
    { id:'compenseren', naam:'Compenseren', kort:'Haal er een rond getal af, en doe het teveel er daarna weer bij.', route:'min100-compenseren',
      kan:function(a, b){ return b >= 8 && (b % 10 >= 7 || b % 100 >= 95) && a >= rondOp(b, b % 100 >= 95 && b >= 95 ? 100 : 10); },
      reken:function(a, b){
        var r = b % 100 >= 95 && b >= 95 ? rondOp(b, 100) : rondOp(b, 10), te = r - b;
        var st0 = [st(a + ' ' + MIN + ' ' + r, a - r, b + ' is bijna ' + r + '. Haal eerst ' + r + ' eraf.'),
          st((a - r) + ' + ' + te, a - b, 'Je haalde er ' + te + ' te veel af. Doe die er weer bij.')];
        return { stappen:st0, beeld:function(k){ return lijn(a, [-r, te].slice(0, k)); } };
      } },
    { id:'kolom', naam:'Kolomsgewijs', kort:'Onder elkaar, van links naar rechts per kolom aftrekken; mag een tussenuitkomst onder nul zijn.', route:'cijf-kolommin',
      kan:function(a, b){ return a >= 10; },
      reken:function(a, b){
        var n = String(a).length, st0 = [], delen = [];
        for (var i = n - 1; i >= 0; i--){
          var pa = cijfer(a, i) * Math.pow(10, i), pb = cijfer(b, i) * Math.pow(10, i);
          if (!pa && !pb) continue;
          delen.push(pa - pb); st0.push(st(pa + ' ' + MIN + ' ' + pb, pa - pb, 'De ' + PLAATS[i] + '.' + (pa - pb < 0 ? ' Dat wordt onder nul: schrijf ' + MIN + Math.abs(pa - pb) + ' op.' : '')));
        }
        st0.push(st(delen.map(function(d, i){ return i === 0 ? String(d) : (d < 0 ? MIN + ' ' + Math.abs(d) : '+ ' + d); }).join(' '), a - b, 'Reken de tussenuitkomsten samen uit.'));
        return { stappen:st0, beeld:function(k){
          var r = [{ getal:a }, { teken:MIN, getal:b, streep:true }];
          delen.slice(0, k).forEach(function(d){ r.push({ teken:d < 0 ? MIN : '', getal:Math.abs(d), zacht:true }); });
          if (k > delen.length){ r[r.length - 1].streep = true; r.push({ getal:a - b, sterk:true }); }
          return onder(r);
        } };
      } },
    { id:'cijferend', naam:'Cijferend', kort:'Onder elkaar, van rechts naar links; is het bovenste cijfer te klein, dan leen je bij de buurman.', route:'cijf-cijfermin',
      kan:function(a, b){ return a >= 10; },
      reken:function(a, b){
        var n = String(a).length, st0 = [], leen = 0, klein = {}, door = [];
        for (var i = 0; i < n; i++){
          var x = cijfer(a, i) - leen, y = cijfer(b, i), geleend = x < y;
          if (leen) door.push(i);
          if (geleend){ klein[i] = x + 10; }
          else if (leen) klein[i] = x;
          var s = (geleend ? x + 10 : x) - y;
          st0.push(st((geleend ? x + 10 : x) + ' ' + MIN + ' ' + y, s, (i === 0 ? 'Begin rechts. ' : '') + 'De ' + PLAATS[i] + '. ' +
            (leen ? 'Hier is 1 geleend, dus het cijfer is ' + x + '. ' : '') + (geleend ? (x < 0 ? '' : x + ' ' + MIN + ' ' + y + ' kan niet: leen 1 van de ' + PLAATS[i + 1] + ', dan wordt het ' + (x + 10) + '. ') : '') + 'Schrijf ' + s + ' op.'));
          leen = geleend ? 1 : 0;
        }
        st0.push(st(a + ' ' + MIN + ' ' + b, a - b, 'Lees het antwoord onder de streep (een 0 vooraan schrijf je niet).'));
        return { stappen:st0, beeld:function(k){
          var kl = {}, dr = [];
          Object.keys(klein).forEach(function(i){ if (+i < k) kl[i] = klein[i]; });
          door.forEach(function(i){ if (i < k) dr.push(i); });
          var uit = String(a - b), toon = k >= st0.length - 1 ? uit : ('0'.repeat(n) + uit).slice(-n).slice(-Math.min(k, n));
          return onder([{ getal:a, door:dr }, { teken:MIN, getal:b, streep:true }, { getal:k ? toon : '', sterk:k >= st0.length - 1 }], { klein:kl });
        } };
      } }
  ];

  /* ---------- vermenigvuldigen ---------- */
  var KEER = [
    { id:'splitsen', naam:'Splitsen', kort:'Splits een getal in stukken die je makkelijk keer het andere doet, en tel de stukken op.', route:'keer-splitsen',
      kan:function(a, b){ return a >= 10 || b >= 10; },
      reken:function(a, b){
        /* het getal met de meeste stukken splitsen? Nee: het kleinste getal heel laten werkt als het een cijfer is */
        var heel, splits;
        if (b < 10){ heel = b; splits = a; } else if (a < 10){ heel = a; splits = b; } else { heel = a; splits = b; }
        var d = plaatsen(splits), st0 = [];
        d.forEach(function(p){ st0.push(st(heel + ' ' + X + ' ' + p, heel * p, p % 10 === 0 && p > 9 ? 'Reken ' + heel + ' ' + X + ' ' + (p / Math.pow(10, String(p).length - 1)) + ' en zet de nullen erachter.' : 'Uit de tafels.')); });
        st0.push(st(d.map(function(p){ return heel * p; }).join(' + '), a * b, 'Tel de stukken op.'));
        return { stappen:st0, beeld:function(k){
          var l = [splits + ' = ' + d.join(' + ')];
          st0.slice(0, k).forEach(function(s){ l.push(s.tekst); });
          return regels(l);
        } };
      } },
    { id:'hokjes', naam:'De hokjesmethode', kort:'Splits allebei de getallen, zet ze langs een rooster en vul elk hokje in.', route:'cijf-hokjes',
      kan:function(a, b){ return a >= 10 && b >= 10 && String(a).length <= 4 && String(b).length <= 3; },
      reken:function(a, b){
        var da = plaatsen(a), db = plaatsen(b), st0 = [], som = [];
        db.forEach(function(y){ da.forEach(function(x){ st0.push(st(x + ' ' + X + ' ' + y, x * y, 'Een hokje: ' + x + ' ' + X + ' ' + y + '.')); som.push(x * y); }); });
        st0.push(st(som.join(' + '), a * b, 'Tel alle hokjes op.'));
        return { stappen:st0, beeld:function(k){ return hokjes(da, db, k) + (k >= st0.length ? '<p class="rm-tot">samen ' + (a * b) + '</p>' : ''); } };
      } },
    { id:'kolom', naam:'Kolomsgewijs', kort:'Onder elkaar: reken de deelproducten uit, zet ze onder de streep en tel ze op.', route:'cijf-kolomkeer',
      kan:function(a, b){ return a >= 10 || b >= 10; },
      reken:function(a, b){
        var da = plaatsen(a), db = plaatsen(b), st0 = [], delen = [];
        db.forEach(function(y){ da.forEach(function(x){ delen.push(x * y); st0.push(st(y + ' ' + X + ' ' + x, x * y, x % 10 || y % 10 ? 'Uit de tafels' + (x > 9 || y > 9 ? ', met de nullen erachter.' : '.') : 'Reken zonder de nullen en zet ze er daarna achter.')); }); });
        st0.push(st(delen.join(' + '), a * b, 'Tel de deelproducten op.'));
        return { stappen:st0, beeld:function(k){
          var r = [{ getal:a }, { teken:X, getal:b, streep:true }];
          delen.slice(0, k).forEach(function(d){ r.push({ getal:d, zacht:true }); });
          if (k > delen.length){ r[r.length - 1].streep = true; r.push({ teken:'+', getal:a * b, sterk:true }); r[r.length - 1].teken = ''; }
          return onder(r);
        } };
      } },
    { id:'cijferend', naam:'Cijferend', kort:'Onder elkaar, van rechts naar links per cijfer, met onthouden; bij twee cijfers twee regels.', route:'cijf-cijfer2',
      kan:function(a, b){ return a >= 10 && String(b).length <= 3; },
      reken:function(a, b){
        var st0 = [], regelsUit = [], nb = String(b).length, na = String(a).length, kleinPer = [];
        for (var j = 0; j < nb; j++){
          var y = cijfer(b, j), c = 0, klein = {};
          if (!y && nb > 1){ regelsUit.push(0); kleinPer.push({}); continue; }
          if (nb > 1) st0.push(st(a + ' ' + X + ' ' + (y * Math.pow(10, j)), a * y * Math.pow(10, j), 'Regel ' + (regelsUit.length + 1) + ': ' + a + ' keer de ' + y + ' van de ' + PLAATS[j] + '.' + (j ? ' Zet eerst ' + (j === 1 ? 'een 0' : j + ' nullen') + ' rechts, want het zijn ' + PLAATS[j] + '.' : ''), 'Regel ' + (regelsUit.length + 1) + ': ' + a + ' ' + X + ' ' + (y * Math.pow(10, j)) + ' = ' + a * y * Math.pow(10, j)));
          for (var i = 0; i < na; i++){
            var x = cijfer(a, i), p = x * y + c, laatste = i === na - 1;
            st0.push(st(y + ' ' + X + ' ' + x + (c ? ' + ' + c : ''), p, (i === 0 && j === 0 ? 'Begin rechts. ' : '') + 'De ' + PLAATS[i] + ' van ' + a + (c ? ', met de ' + c + ' die je onthield' : '') + '. ' + (!laatste && p >= 10 ? 'Schrijf ' + (p % 10) + ' op en onthoud ' + Math.floor(p / 10) + '.' : 'Schrijf ' + p + ' op.')));
            c = Math.floor(p / 10); if (c && !laatste) klein[i + 1 + j] = c;
          }
          regelsUit.push(a * y * Math.pow(10, j)); kleinPer.push(klein);
        }
        var echte = regelsUit.filter(function(r, j){ return cijfer(b, j) || nb === 1; });
        if (echte.length > 1) st0.push(st(echte.join(' + '), a * b, 'Tel de regels op.'));
        else st0.push(st(a + ' ' + X + ' ' + b, a * b, 'Lees het antwoord onder de streep.'));
        return { stappen:st0, beeld:function(k){
          /* hoeveel regels zijn er al af, op basis van het aantal stappen */
          var r = [{ getal:a }, { teken:X, getal:b, streep:true }], tel = 0, kl = {};
          for (var j = 0; j < nb; j++){
            var y = cijfer(b, j); if (!y && nb > 1) continue;
            var nodig = na + (nb > 1 ? 1 : 0);
            if (k >= tel + nodig){ r.push({ getal:regelsUit[j], zacht:echte.length > 1 }); if (!Object.keys(kl).length) Object.keys(kleinPer[j]).forEach(function(c){ kl[c] = kleinPer[j][c]; }); }
            else if (k > tel){ var gedaan = k - tel - (nb > 1 ? 1 : 0); var s = String(regelsUit[j]); r.push({ getal:gedaan > 0 ? s.slice(-(gedaan + j)) : (j ? '0'.repeat(j) : ''), zacht:true }); Object.keys(kleinPer[j]).forEach(function(c){ if (+c - j <= gedaan) kl[c] = kleinPer[j][c]; }); }
            tel += nodig;
          }
          if (k >= st0.length && echte.length > 1){ r[r.length - 1].streep = true; r.push({ getal:a * b, sterk:true }); }
          else if (k >= st0.length) r[r.length - 1].sterk = true;
          return onder(r, { klein:kl });
        } };
      } },
    { id:'compenseren', naam:'Compenseren', kort:'Reken met een rond getal dat dichtbij ligt, en haal het verschil er daarna af.', route:'keer-compenseren',
      kan:function(a, b){ return [a, b].some(function(f){ return f >= 18 && (f % 10 >= 8 || (f >= 95 && f % 100 >= 95)); }); },
      reken:function(a, b){
        var f = [a, b].filter(function(x){ return x >= 18 && (x % 10 >= 8 || (x >= 95 && x % 100 >= 95)); })[0], g = f === a ? b : a;
        var r = f >= 95 && f % 100 >= 95 ? rondOp(f, 100) : rondOp(f, 10), te = r - f;
        var st0 = [st(r + ' ' + X + ' ' + g, r * g, f + ' is bijna ' + r + '. Reken eerst ' + r + ' ' + X + ' ' + g + '.'),
          st(te + ' ' + X + ' ' + g, te * g, 'Dat is ' + te + ' keer ' + g + ' te veel.'),
          st((r * g) + ' ' + MIN + ' ' + (te * g), a * b, 'Haal het teveel eraf.')];
        return { stappen:st0, beeld:function(k){ return regels(st0.slice(0, k).map(function(s){ return s.tekst; }).concat(k ? [] : [f + ' = ' + r + ' ' + MIN + ' ' + te])); } };
      } },
    { id:'verdubbelen', naam:'Verdubbelen en halveren', kort:'Maak het ene getal twee keer zo groot en het andere twee keer zo klein, tot het makkelijk wordt.', route:'keer-verdubbel-halveer',
      kan:function(a, b){ return [[a, b], [b, a]].some(function(p){ return [5, 15, 25, 35, 45, 50, 125, 250].indexOf(p[0]) >= 0 && p[1] % 2 === 0 && p[1] >= 4; }); },
      reken:function(a, b){
        var p = [[a, b], [b, a]].filter(function(q){ return [5, 15, 25, 35, 45, 50, 125, 250].indexOf(q[0]) >= 0 && q[1] % 2 === 0 && q[1] >= 4; })[0];
        var x = p[0], y = p[1], st0 = [];
        while (y % 2 === 0 && x % 10 !== 0 && y > 2){ st0.push(st((x * 2) + ' ' + X + ' ' + (y / 2), x * y, 'Verdubbel ' + x + ' en halveer ' + y + ': de uitkomst blijft gelijk.', x + ' ' + X + ' ' + y + ' = ' + (x * 2) + ' ' + X + ' ' + (y / 2))); x *= 2; y /= 2; }
        st0.push(st(x + ' ' + X + ' ' + y, a * b, 'Nu is het makkelijk.'));
        return { stappen:st0, beeld:function(k){ return regels(st0.slice(0, k).map(function(s){ return s.tekst; })); } };
      } }
  ];

  /* ---------- delen ---------- */
  /* happen: steeds een handig veelvoud van b eraf: een tafel met nullen erachter (40 keer, 300 keer) */
  function happen(a, b){
    var rest = a, uit = [];
    while (rest >= b){
      var best = 1;
      for (var m = 1; m * b <= rest; m *= 10) [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function(f){ if (f * m * b <= rest && f * m > best) best = f * m; });
      uit.push({ keer:best, eraf:best * b, voor:rest, na:rest - best * b });
      rest -= best * b;
    }
    return { happen:uit, rest:rest };
  }
  var DELEN = [
    { id:'hap', naam:'De hapmethode', kort:'Haal er steeds een handige hap af (10 keer, 40 keer, 100 keer) en tel op hoe vaak.', route:'cijf-hap',
      kan:function(a, b){ return b >= 2 && a >= b; },
      reken:function(a, b){
        var h = happen(a, b), st0 = [];
        h.happen.forEach(function(x){ st0.push(st(x.voor + ' ' + MIN + ' ' + x.eraf, x.na, 'Neem een hap van ' + x.keer + ' ' + X + ' ' + b + ' = ' + x.eraf + '.', x.keer + ' ' + X + ' ' + b + ' = ' + x.eraf + ', er blijft ' + x.na + ' over')); });
        st0.push(st(h.happen.map(function(x){ return x.keer; }).join(' + '), Math.floor(a / b), 'Tel op hoe vaak je hapte.' + (h.rest ? ' Er blijft ' + h.rest + ' over: de rest.' : '')));
        return { stappen:st0, beeld:function(k){
          return tabel(['er is nog', 'hap', 'keer'], h.happen.slice(0, k).map(function(x){ return { cellen:[x.voor, MIN + ' ' + x.eraf, x.keer] }; })
            .concat(k > h.happen.length ? [{ cellen:[h.rest + (h.rest ? ' (rest)' : ''), '', 'samen ' + Math.floor(a / b)], sterk:true }] : []));
        } };
      } },
    { id:'staart', naam:'De staartdeling', kort:'Van links naar rechts: hoe vaak past de deler, schrijf dat op, trek af en haal het volgende cijfer erbij.', route:'cijf-staart',
      kan:function(a, b){ return b >= 2 && a >= b; },
      reken:function(a, b){
        var s = String(a), st0 = [], deel = 0, q = '', rijen = [];
        for (var i = 0; i < s.length; i++){
          deel = deel * 10 + (+s.charAt(i));
          var past = Math.floor(deel / b);
          if (!q && !past && i < s.length - 1) continue;
          q += past;
          st0.push(st(past + ' ' + X + ' ' + b, past * b, 'Hoe vaak past ' + b + ' in ' + deel + '? ' + past + ' keer. Schrijf ' + past + ' achter de streep en ' + (past * b) + ' onder ' + deel + '.', b + ' past ' + past + ' keer in ' + deel + ': ' + past + ' ' + X + ' ' + b + ' = ' + (past * b)));
          rijen.push({ onder:past * b, eind:i, rest:deel - past * b });
          st0.push(st(deel + ' ' + MIN + ' ' + (past * b), deel - past * b, i < s.length - 1 ? 'Trek af en haal het volgende cijfer (' + s.charAt(i + 1) + ') erbij.' : 'Trek af: dit is de rest.'));
          deel -= past * b;
        }
        st0.push(st(a + ' ' + DEEL + ' ' + b, Math.floor(a / b), 'Het antwoord staat achter de streep' + (deel ? ', met rest ' + deel : '') + '.'));
        return { stappen:st0, beeld:function(k){
          /* klassieke Nederlandse vorm: deler / deeltal \ uitkomst, en eronder de stappen */
          var n = Math.ceil(k / 2), lijnen = [{ getal:s, kop:true }];
          for (var j = 0; j < n && j < rijen.length; j++){
            var r = rijen[j]; lijnen.push({ getal:String(r.onder), inspring:s.length - 1 - r.eind, teken:MIN, streep:true });
            if (k >= j * 2 + 2) lijnen.push({ getal:r.eind < s.length - 1 ? String(r.rest * 10 + (+s.charAt(r.eind + 1))) : String(r.rest), inspring:s.length - 1 - r.eind - (r.eind < s.length - 1 ? 1 : 0), zacht:true });
          }
          var qd = k >= st0.length ? q.replace(/^0+(?=\d)/, '') : q.slice(0, n);
          return '<div class="rm-staart" aria-hidden="true"><span class="rm-deler">' + b + '</span><span class="rm-sl">/</span>' + onder(lijnen) + '<span class="rm-sl">\\</span><span class="rm-q">' + qd + (k >= st0.length && a % b ? '<small>rest ' + (a % b) + '</small>' : '') + '</span></div>';
        } };
      } },
    { id:'splitsen', naam:'Splitsen', kort:'Splits het grote getal in stukken die je makkelijk deelt, en tel de uitkomsten op.', route:'deel-splitsen',
      kan:function(a, b){ return b >= 2 && a >= b * 2; },
      reken:function(a, b){
        var h = happen(a, b), st0 = [], stukken = h.happen.map(function(x){ return x.eraf; });
        if (h.rest) stukken.push(h.rest);
        st0.push(st(stukken.join(' + '), a, 'Splits ' + a + ' in stukken waar ' + b + ' precies in past' + (h.rest ? ', plus wat overblijft' : '') + '.', a + ' = ' + stukken.join(' + ')));
        h.happen.forEach(function(x){ st0.push(st(x.eraf + ' ' + DEEL + ' ' + b, x.keer, 'Deel elk stuk.')); });
        st0.push(st(h.happen.map(function(x){ return x.keer; }).join(' + '), Math.floor(a / b), 'Tel de uitkomsten op.' + (h.rest ? ' De ' + h.rest + ' is de rest.' : '')));
        return { stappen:st0, beeld:function(k){ return regels(st0.slice(0, k).map(function(s){ return s.tekst; })); } };
      } }
  ];
  var MANIEREN = { plus:PLUS, min:MINUS, keer:KEER, deel:DELEN };

  function bewVan(id){ return BEWERKINGEN.filter(function(x){ return x.id === id; })[0]; }
  function manieren(bew, a, b){ return (MANIEREN[bew] || []).filter(function(m){ return m.kan(a, b); }); }
  function reken(bew, a, b, id){
    var lijst = manieren(bew, a, b), m = lijst.filter(function(x){ return x.id === id; })[0] || lijst[0];
    if (!m) return null;
    var r = m.reken(a, b);
    r.manier = m; r.antwoord = bew === 'plus' ? a + b : bew === 'min' ? a - b : bew === 'keer' ? a * b : Math.floor(a / b);
    r.rest = bew === 'deel' ? a % b : 0;
    return r;
  }
  /* een som uit een tekst herkennen: "489 × 9", "1386 : 6", "45 + 37 =", "93 − 48" */
  function herken(t){
    var m = /^\s*(\d{1,6})\s*([+\-−×x*:÷/])\s*(\d{1,6})\s*=?\s*\??\s*$/i.exec(String(t || '').replace(/\./g, ''));
    if (!m) return null;
    var a = +m[1], b = +m[3], o = m[2], bew = o === '+' ? 'plus' : /[\-−]/.test(o) ? 'min' : /[×x*]/i.test(o) ? 'keer' : 'deel';
    if (bew === 'min' && b > a) return null;
    if (bew === 'deel' && b === 0) return null;
    return { bew:bew, a:a, b:b };
  }

  /* ---------- de keuze ---------- */
  function lees(k){ try { var v = JSON.parse(localStorage.getItem(k) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e){ return {}; } }
  function mijn(bew){ var e = lees('lg-rekenmanier'); if (e[bew]) return e[bew]; var k = lees('lg-rekenmanier-klas'); return k[bew] || null; }
  function vanKlas(bew){ return lees('lg-rekenmanier-klas')[bew] || null; }
  function eigen(bew){ return lees('lg-rekenmanier')[bew] || null; }
  function kies(bew, id){ var e = lees('lg-rekenmanier'); if (id) e[bew] = id; else delete e[bew]; try { localStorage.setItem('lg-rekenmanier', JSON.stringify(e)); } catch (x){} }
  function klas(m){
    var schoonM = {};
    Object.keys(m || {}).forEach(function(b){ if (MANIEREN[b] && MANIEREN[b].some(function(x){ return x.id === m[b]; })) schoonM[b] = m[b]; });
    try { localStorage.setItem('lg-rekenmanier-klas', JSON.stringify(schoonM)); } catch (x){}
  }

  /* ---------- de uitleg in een pagina ---------- */
  var stijlGezet = false;
  function stijl(){
    if (stijlGezet || typeof document === 'undefined') return; stijlGezet = true;
    var s = document.createElement('style');
    s.textContent =
      '.rm{--rm-acc:#204ECF;--rm-acc2:#F26749;text-align:left;margin-top:12px}' +
      ':root[data-theme="dark"] .rm{--rm-acc:#83A5F2;--rm-acc2:#F58C72}' +
      '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .rm{--rm-acc:#83A5F2;--rm-acc2:#F58C72}}' +
      '.rm-kies{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}' +
      '.rm-kies button{min-height:44px;padding:6px 12px;border-radius:999px;border:1.5px solid var(--rand2,rgba(20,34,76,.2));background:var(--kaart,#fff);color:var(--ink,#14224C);font:inherit;font-size:.86rem;font-weight:600;cursor:pointer}' +
      '.rm-kies button[aria-pressed="true"]{background:var(--rm-acc);border-color:var(--rm-acc);color:#fff}' +
      ':root[data-theme="dark"] .rm-kies button[aria-pressed="true"]{color:#14224C}' +
      '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .rm-kies button[aria-pressed="true"]{color:#14224C}}' +
      '.rm-kies button .rm-ster{margin-left:4px}' +
      '.rm-kort{font-size:.9rem;color:var(--muted,#5b6480);margin:0 0 10px}' +
      '.rm-werk{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;align-items:start}' +
      '@media(max-width:640px){.rm-werk{grid-template-columns:minmax(0,1fr)}}' +
      '.rm-stappen{margin:0;padding:0;list-style:none;counter-reset:rm;display:grid;gap:6px}' +
      '.rm-stappen li{counter-increment:rm;position:relative;padding:7px 10px 7px 36px;border-radius:12px;background:var(--kaart2,#f4f7ff);font-size:.94rem;line-height:1.4}' +
      '.rm-stappen li::before{content:counter(rm);position:absolute;left:8px;top:7px;width:20px;height:20px;border-radius:50%;background:var(--rm-acc);color:#fff;font-size:.72rem;font-weight:700;display:grid;place-items:center}' +
      ':root[data-theme="dark"] .rm-stappen li::before{color:#14224C}' +
      '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .rm-stappen li::before{color:#14224C}}' +
      '.rm-stappen li b{display:block;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}' +
      '.rm-stappen li span{color:var(--muted,#5b6480);font-size:.86rem}' +
      '.rm-stappen li.rm-laatste{background:color-mix(in srgb,var(--rm-acc) 16%,var(--kaart,#fff))}' +
      '.rm-beeld{background:var(--kaart,#fff);border:1px solid var(--rand,rgba(20,34,76,.1));border-radius:14px;padding:12px;overflow-x:auto;min-height:60px}' +
      '.rm-onder{border-collapse:collapse;font-variant-numeric:tabular-nums;font-size:1.25rem;font-weight:600;margin:0 auto}' +
      '.rm-onder td{width:1.15em;height:1.6em;text-align:center;padding:0}' +
      '.rm-onder td.rm-teken{color:var(--muted,#5b6480);width:1.4em}' +
      '.rm-onder tr.rm-streep td{border-bottom:2px solid currentColor}' +
      '.rm-onder tr.rm-zacht td{color:var(--muted,#5b6480);font-weight:500}' +
      '.rm-onder tr.rm-sterk td{color:var(--rm-acc)}' +
      '.rm-onder tr.rm-klein td{font-size:.62em;height:1.2em;color:var(--rm-acc2);font-weight:700;vertical-align:bottom}' +
      '.rm-onder td.rm-door{text-decoration:line-through;text-decoration-color:var(--rm-acc2);text-decoration-thickness:2px}' +
      '.rm-lijn{display:block;width:100%;height:auto;max-width:560px;margin:0 auto}' +
      '.rm-lijn .rm-as{stroke:currentColor;stroke-width:2}.rm-lijn .rm-boog{fill:none;stroke:var(--rm-acc);stroke-width:2.4}' +
      '.rm-lijn text{font:600 14px Poppins,system-ui,sans-serif;fill:currentColor;text-anchor:middle}.rm-lijn .rm-sprong{fill:var(--rm-acc)}.rm-lijn .rm-eind{fill:var(--rm-acc2);font-weight:700}' +
      '.rm-hokjes,.rm-tabel{border-collapse:collapse;margin:0 auto;font-variant-numeric:tabular-nums}' +
      '.rm-hokjes th,.rm-hokjes td,.rm-tabel th,.rm-tabel td{border:1.5px solid var(--rand2,rgba(20,34,76,.2));padding:6px 10px;text-align:center;min-width:3.2em}' +
      '.rm-hokjes th{background:color-mix(in srgb,var(--rm-acc) 14%,transparent)}.rm-hokjes td{font-weight:700}' +
      '.rm-tabel th{font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted,#5b6480)}.rm-tabel tr.rm-sterk td{font-weight:700;color:var(--rm-acc)}' +
      '.rm-tot{text-align:center;margin:8px 0 0;font-weight:700;color:var(--rm-acc)}' +
      '.rm-regels p{margin:0 0 4px;font-variant-numeric:tabular-nums;font-weight:600}' +
      '.rm-staart{display:flex;align-items:flex-start;justify-content:center;gap:2px;font-size:1.25rem;font-weight:600}' +
      '.rm-staart .rm-onder{margin:0}.rm-staart .rm-deler,.rm-staart .rm-sl,.rm-staart .rm-q{line-height:1.6em}' +
      '.rm-staart .rm-q{color:var(--rm-acc);font-variant-numeric:tabular-nums}.rm-staart .rm-q small{display:block;font-size:.7em}' +
      '.rm-knoppen{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;align-items:center}' +
      '.rm-knoppen button,.rm-knoppen a{min-height:44px;padding:0 16px;border-radius:999px;border:1.5px solid var(--rand2,rgba(20,34,76,.2));background:var(--kaart,#fff);color:var(--ink,#14224C);font:inherit;font-weight:600;font-size:.9rem;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}' +
      '.rm-knoppen .rm-hoofd{background:var(--rm-acc);border-color:var(--rm-acc);color:#fff}' +
      ':root[data-theme="dark"] .rm-knoppen .rm-hoofd{color:#14224C}' +
      '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .rm-knoppen .rm-hoofd{color:#14224C}}' +
      '.rm-mijn{font-size:.84rem;color:var(--muted,#5b6480)}';
    document.head.appendChild(s);
  }
  function stapHtml(s, i){ return '<li><b>' + schoon(s.tekst) + '</b>' + (s.uitleg ? '<span>' + schoon(s.uitleg) + '</span>' : '') + '</li>'; }
  /* o: { stapVoorStap, opKies(id), meer:url } */
  function uitleg(el, bew, a, b, o){
    if (!el) return;
    stijl(); o = o || {};
    var lijst = manieren(bew, a, b); if (!lijst.length){ el.innerHTML = ''; return; }
    var gekozen = mijn(bew), id = lijst.some(function(m){ return m.id === gekozen; }) ? gekozen : lijst[0].id, k = 0;
    function teken(){
      var r = reken(bew, a, b, id), n = r.stappen.length, toon = o.stapVoorStap ? Math.max(1, k) : n, isEigen = eigen(bew) === id, klasM = vanKlas(bew);
      el.innerHTML = '<div class="rm"><div class="rm-kies" role="group" aria-label="Kies een manier">' + lijst.map(function(m){
          return '<button type="button" data-rm="' + m.id + '" aria-pressed="' + (m.id === id ? 'true' : 'false') + '">' + schoon(m.naam) + (eigen(bew) === m.id ? '<span class="rm-ster" aria-label="(jouw manier)">★</span>' : '') + '</button>';
        }).join('') + '</div>' +
        '<p class="rm-kort">' + schoon(r.manier.kort) + '</p>' +
        '<div class="rm-werk"><ol class="rm-stappen">' + r.stappen.slice(0, toon).map(stapHtml).join('').replace(/<li>(?![\s\S]*<li>)/, '<li class="' + (toon >= n ? 'rm-laatste' : '') + '">') + '</ol>' +
        '<div class="rm-beeld">' + r.beeld(toon) + '</div></div>' +
        '<div class="rm-knoppen">' +
          (o.stapVoorStap && toon < n ? '<button type="button" class="rm-hoofd" data-rm-volg>Volgende stap</button><button type="button" data-rm-alles>Alle stappen</button>' : '') +
          (o.stapVoorStap && toon >= n && n > 1 ? '<button type="button" data-rm-opnieuw>Nog eens, stap voor stap</button>' : '') +
          (isEigen ? '<span class="rm-mijn">★ Dit is jouw manier.</span>' : '<button type="button" data-rm-mijn>Dit is mijn manier</button>') +
          (klasM && !eigen(bew) ? '<span class="rm-mijn">' + (klasM === id ? 'Dit is de manier van je docent.' : 'Je docent koos ' + schoon((MANIEREN[bew].filter(function(m){ return m.id === klasM; })[0] || {}).naam || '') + '.') + '</span>' : '') +
          (o.meer ? '<a href="' + schoon(o.meer) + '">Alle manieren</a>' : '') +
        '</div></div>';
    }
    teken();
    el.onclick = function(e){
      var t = e.target.closest ? e.target.closest('button') : null; if (!t) return;
      if (t.hasAttribute('data-rm')){ id = t.getAttribute('data-rm'); k = 1; teken(); if (o.opKies) o.opKies(id); return; }
      if (t.hasAttribute('data-rm-volg')){ k = Math.max(1, k) + 1; teken(); return; }
      if (t.hasAttribute('data-rm-alles')){ k = 999; teken(); return; }
      if (t.hasAttribute('data-rm-opnieuw')){ k = 1; teken(); return; }
      if (t.hasAttribute('data-rm-mijn')){ kies(bew, id); teken(); if (o.opMijn) o.opMijn(id); return; }
    };
  }
  /* als platte tekst, voor een antwoordblad: "489 × 9: 400 × 9 = 3600, ..." */
  function tekst(bew, a, b, id){
    var r = reken(bew, a, b, id || mijn(bew)); if (!r) return '';
    return r.manier.naam + ': ' + r.stappen.map(function(s){ return s.tekst; }).join('; ') + '.';
  }

  var API = { BEWERKINGEN:BEWERKINGEN, MANIEREN:MANIEREN, manieren:manieren, reken:reken, herken:herken, mijn:mijn, vanKlas:vanKlas, kies:kies, klas:klas, uitleg:uitleg, tekst:tekst, bewerking:bewVan, stijl:stijl, eigen:eigen };
  if (typeof module === 'object' && module.exports) module.exports = API;
  root.REKENMANIEREN = API;
})(typeof window !== 'undefined' ? window : this);
