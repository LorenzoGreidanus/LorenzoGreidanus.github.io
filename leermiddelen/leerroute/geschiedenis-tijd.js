/* De leerroute geschiedenis, tijd: de eeuw bij een jaartal en de jaartallen bij een eeuw
   (ook voor Christus), de helft van een eeuw, rekenen met jaartallen (ook over het jaar 1 heen:
   er is geen jaar 0), hoe lang geleden, de tien tijdvakken, gebeurtenissen in volgorde,
   een tijdlijn lezen en gelijktijdigheid. Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var T = LEERROUTE.R, X = '×', MIN = '−', G = [];
  var NU = new Date().getFullYear();

  /* ---------- hulpjes ---------- */
  function K(R, t, goed, fout, hint, extra){
    var lijst = [goed], gezien = {}; gezien[String(goed).toLowerCase()] = 1;
    fout.forEach(function(f){ if (f == null) return; var k = String(f).toLowerCase(); if (!gezien[k]){ gezien[k] = 1; lijst.push(f); } });
    var opties = R.hussel(lijst), s = { tekst:t, opties:opties, goed:opties.indexOf(goed), hint:hint };
    if (extra){ if (extra.waarom) s.waarom = extra.waarom; if (extra.fout){ s.fout = {}; for (var k in extra.fout) s.fout[k.toLowerCase()] = extra.fout[k]; } }
    return s;
  }
  /* keuze in vaste volgorde (ja/nee, letters) */
  function V(t, opties, goed, hint){ return { tekst:t, opties:opties.slice(), goed:opties.indexOf(goed), hint:hint }; }
  function OP(o){ var s = o.stappen[o.stappen.length - 1]; if (s.opties){ o.opties = s.opties; o.goed = s.goed; } return o; }
  function F(){ var o = {}; for (var i = 0; i + 1 < arguments.length; i += 2) if (arguments[i] != null) o[String(arguments[i]).toLowerCase()] = arguments[i + 1]; return o; }
  /* een compacte tabel die ook op een telefoon past: { kop, zijkop, nadruk:[[r,c]], html } */
  function ktabel(rijen, o){
    o = o || {}; var nad = {}; (o.nadruk || []).forEach(function(q){ nad[q[0] + ',' + q[1]] = 1; });
    return '<table class="lr-tabel" style="font-size:.85rem;border-spacing:3px">' + rijen.map(function(r, ri){
      return '<tr>' + r.map(function(c, ci){ var t = (o.kop && ri === 0) || (o.zijkop && ci === 0) ? 'th' : 'td';
        return '<' + t + ' style="padding:5px 8px;min-width:0"' + (nad[ri + ',' + ci] ? ' class="nadruk"' : '') + '>' + (c === '?' ? '<b class="lr-vraagt">?</b>' : (o.html ? c : T.schoon(c))) + '</' + t + '>'; }).join('') + '</tr>';
    }).join('') + '</table>';
  }
  function hoofd(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
  /* een jaartal: negatief is voor Christus */
  function jt(j){ return j < 0 ? (-j) + ' v.Chr.' : String(j); }
  function jtl(j){ return j < 0 ? (-j) + ' v.Chr.' : j + ' n.Chr.'; }
  function eeuwVan(j){ return Math.ceil(Math.abs(j) / 100); }
  function rang(e){ return e + 'e'; }
  /* alle goede schrijfwijzen van een eeuw */
  function eeuwAnt(e, vc){
    var l = [String(e), e + 'e', e + 'de', e + 'e eeuw', e + 'de eeuw'];
    if (vc) l = l.concat([e + 'e eeuw v.chr', e + 'de eeuw v.chr', e + 'e eeuw voor christus', e + 'de eeuw voor christus', e + 'e v.chr', e + ' v.chr']);
    return l;
  }
  function getal(n){ return [String(n)]; }

  /* ================= 1 EEUWEN EN JAARTALLEN (onderbouw) ================= */
  function eeuwStappen(R, j){
    var a = Math.abs(j), nul = a % 100 === 0, vc = j < 0, e = eeuwVan(j), voor = Math.floor(a / 100);
    return [
      V('Eindigt het jaartal ' + jt(j) + ' op 00?', ['ja', 'nee'], nul ? 'ja' : 'nee', 'Kijk naar de laatste twee cijfers van ' + a + '.'),
      { tekst:nul ? 'Haal de twee nullen weg. Wat blijft er over?' : 'Haal de laatste twee cijfers weg. Wat blijft er over?' + (a < 100 ? ' (Blijft er niets over, typ dan 0.)' : ''), antwoord:getal(voor), hint:a < 100 ? a + ' heeft maar twee cijfers. Haal je die weg, dan blijft er 0 over.' : 'Van ' + a + ' blijft ' + voor + ' over.' },
      { tekst:nul ? 'Bij 00 tel je er niets bij op. De eeuw is de' : 'Tel er 1 bij op. De eeuw is de', antwoord:eeuwAnt(e, vc), hint:nul ? 'Het jaar ' + a + ' is het laatste jaar van de ' + rang(e) + ' eeuw.' : voor + ' + 1 = ' + e + '.',
        fout:nul ? F(String(e + 1), 'Bij een jaartal op 00 tel je er niets bij op: ' + a + ' is het laatste jaar van de ' + rang(e) + ' eeuw.', (e + 1) + 'e', 'Bij een jaartal op 00 tel je er niets bij op.') : F(String(voor), 'Je bent vergeten er 1 bij op te tellen.', voor + 'e', 'Je bent vergeten er 1 bij op te tellen.') }
    ];
  }
  G.push({ groep:{ id:'gs-eeuw', niveau:'onderbouw', domein:'tijd', naam:'Eeuwen en jaartallen',
      uit:'Bij een jaartal de eeuw vinden en bij een eeuw de jaartallen, ook voor Christus, en zeggen in welke helft van de eeuw een jaar ligt.' },
    doelen:[
      { id:'gs-eeuw-van-jaar', naam:'De eeuw bij een jaartal', kort:'Haal de laatste twee cijfers weg en tel er 1 bij op. Eindigt het jaartal op 00, dan tel je er niets bij op',
        uit:'<p>Een <b>eeuw</b> is 100 jaar. De 1e eeuw liep van het jaar 1 tot en met 100. De 2e eeuw van 101 tot en met 200.</p><p>Zo vind je de eeuw: haal de laatste twee cijfers weg en <b>tel er 1 bij op</b>. 1648: haal 48 weg, dan blijft 16. Plus 1 is de <b>17e eeuw</b>.</p><p>Eindigt het jaartal op <b>00</b>, dan tel je er niets bij op. 1700 is het laatste jaar van de 17e eeuw.</p>',
        wanneer:'je bij een jaartal wilt weten in welke eeuw het valt.',
        maak:function(R){
          var j = R.heel(0, 5) === 0 ? R.heel(3, 20) * 100 : R.heel(0, 7) === 0 ? R.heel(1, 99) : R.heel(101, NU);
          return { context:'In welke eeuw ligt het jaar ' + j + '?', vraag:'Het jaar ' + j + ': welke eeuw?', stappen:eeuwStappen(R, j) };
        } },
      { id:'gs-eeuw-vchr', naam:'De eeuw bij een jaartal voor Christus', kort:'Voor Christus werkt het net zo: laatste twee cijfers weg en 1 erbij. Zet er v.Chr. achter',
        uit:'<p>Voor Christus tellen de jaren <b>terug</b>. Het jaar 1 v.Chr. komt vlak voor het jaar 1 n.Chr. Er is <b>geen jaar 0</b>.</p><p>De eeuw vind je op dezelfde manier: haal de laatste twee cijfers weg en tel er 1 bij op. 753 v.Chr.: 7 + 1 = de <b>8e eeuw v.Chr.</b></p><p>Eindigt het op 00, dan tel je niets op. 500 v.Chr. hoort bij de 5e eeuw v.Chr.</p>',
        wanneer:'je een jaartal van lang geleden, voor Christus, in een eeuw wilt zetten.',
        maak:function(R){
          var j = -(R.heel(0, 5) === 0 ? R.heel(1, 30) * 100 : R.heel(0, 7) === 0 ? R.heel(1, 99) : R.heel(101, 3000));
          return { context:'In welke eeuw ligt het jaar ' + jt(j) + '?', vraag:jt(j) + ': welke eeuw?', stappen:eeuwStappen(R, j) };
        } },
      { id:'gs-jaar-van-eeuw', naam:'De jaartallen bij een eeuw', kort:'De 15e eeuw eindigt met 15 ' + X + ' 100 = 1500 en begint 99 jaar eerder, in 1401',
        uit:'<p>Andersom kan ook: welke jaren horen bij een eeuw?</p><p>Het <b>laatste jaar</b> van een eeuw is het nummer van de eeuw keer 100. De 15e eeuw eindigt in 15 ' + X + ' 100 = <b>1500</b>.</p><p>Het <b>eerste jaar</b> is een jaar na het einde van de eeuw ervoor: 14 ' + X + ' 100 + 1 = <b>1401</b>. De 15e eeuw loopt dus van 1401 tot en met 1500.</p><p>In gewone taal zeggen mensen vaak "de jaren 1400". Precies gerekend begint de eeuw met een jaar dat op 01 eindigt.</p>',
        wanneer:'je bij een eeuw de jaartallen zoekt, bijvoorbeeld om iets op een tijdlijn te zetten.',
        maak:function(R){
          var e = R.heel(1, 21), eind = e * 100, begin = (e - 1) * 100 + 1, ant = begin + ' tot en met ' + eind;
          return { context:'Van welk jaar tot en met welk jaar loopt de ' + rang(e) + ' eeuw?', vraag:'De ' + rang(e) + ' eeuw', antwoord:ant,
            controle:function(v){ var m = String(v).match(/\d+/g); return !!m && m.length === 2 && +m[0] === begin && +m[1] === eind; },
            stappen:[
              { tekst:'Het laatste jaar: ' + e + ' ' + X + ' 100 =', antwoord:getal(eind), hint:'Het nummer van de eeuw keer 100.' },
              { tekst:'Het eerste jaar: ' + (e - 1) + ' ' + X + ' 100 + 1 =', antwoord:getal(begin), hint:'De eeuw ervoor eindigde in ' + ((e - 1) * 100) + '. Het jaar daarna begint de ' + rang(e) + ' eeuw.', fout:e > 1 ? F(String(begin - 1), 'Dat is het laatste jaar van de ' + rang(e - 1) + ' eeuw. Tel er 1 bij op.') : {} },
              { tekst:'Typ beide jaartallen, bijvoorbeeld zo: 1401 tot en met 1500.', antwoord:ant, controle:function(v){ var m = String(v).match(/\d+/g); return !!m && m.length === 2 && +m[0] === begin && +m[1] === eind; }, hint:'Eerst ' + begin + ', dan ' + eind + '.' } ] };
        } },
      { id:'gs-eeuw-helft', naam:'In welke helft van de eeuw?', kort:'Eindigt het jaartal op 01 tot en met 50, dan is het de eerste helft. Op 51 tot en met 99 is het de tweede helft',
        uit:'<p>Soms zeg je preciezer waar een jaar ligt: in de <b>eerste helft</b> of de <b>tweede helft</b> van een eeuw.</p><p>Zoek eerst de eeuw. Kijk dan naar de laatste twee cijfers. Van 01 tot en met 50 is de eerste helft, van 51 tot en met 99 de tweede helft.</p><p>1648 ligt in de 17e eeuw. 48 is niet meer dan 50, dus: de <b>eerste helft van de 17e eeuw</b>.</p>',
        wanneer:'je een jaartal preciezer wilt plaatsen dan alleen de eeuw.',
        maak:function(R){
          var j; do { j = R.heel(1101, 2025); } while (j % 50 === 0);
          var e = eeuwVan(j), r = j % 100, eerste = r <= 50, helft = eerste ? 'eerste helft' : 'tweede helft';
          var ant = 'de ' + helft + ' van de ' + rang(e) + ' eeuw';
          return OP({ context:'In welk deel van welke eeuw ligt het jaar ' + j + '?', vraag:'Het jaar ' + j,
            stappen:[
              { tekst:'In welke eeuw ligt ' + j + '?', antwoord:eeuwAnt(e), hint:'Laatste twee cijfers weg en 1 erbij: ' + Math.floor(j / 100) + ' + 1.', fout:F(String(e - 1), 'Vergeet niet er 1 bij op te tellen.') },
              V('De laatste twee cijfers zijn ' + (r < 10 ? '0' + r : r) + '. Welke helft?', ['eerste helft', 'tweede helft'], helft, 'Van 01 tot en met 50 is de eerste helft, van 51 tot en met 99 de tweede.'),
              K(R, 'Dus ' + j + ' ligt in', ant, ['de ' + (eerste ? 'tweede helft' : 'eerste helft') + ' van de ' + rang(e) + ' eeuw', 'de ' + helft + ' van de ' + rang(e - 1) + ' eeuw', 'de ' + (eerste ? 'tweede helft' : 'eerste helft') + ' van de ' + rang(e - 1) + ' eeuw'], 'De ' + rang(e) + ' eeuw, de ' + helft + '.') ] });
        } }
    ] });

  /* ================= 2 REKENEN MET JAARTALLEN (onderbouw) ================= */
  var WAT = ['Een stad werd gesticht in {a}. In {b} werd ze verwoest. Hoeveel jaar bestond de stad?', 'Een tempel werd gebouwd in {a}. In {b} stortte hij in. Hoeveel jaar stond hij er?',
    'Een koning kwam aan de macht in {a}. Zijn rijk viel in {b}. Hoeveel jaar later was dat?', 'Een munt werd geslagen in {a}. Een boer vond hem in {b}. Hoeveel jaar later was dat?',
    'Een weg werd aangelegd in {a}. In {b} werd hij voor het laatst gerepareerd. Hoeveel jaar zit daartussen?', 'Een dorp ontstond in {a}. In {b} werd er een muur omheen gebouwd. Hoeveel jaar later was dat?'];
  function zin(R, a, b){ return R.kies(WAT).replace('{a}', jt(a)).replace('{b}', jt(b)).split('v.Chr..').join('v.Chr.'); }
  function overNul(a, b){ return [
    { tekst:'Van ' + jt(a) + ' tot het jaar 1 n.Chr. is', antwoord:getal(-a), eenheid:'jaar', hint:'Van 1 v.Chr. naar 1 n.Chr. is 1 jaar. Van ' + jt(a) + ' is het dus ' + (-a) + ' jaar.' },
    { tekst:'Van het jaar 1 tot ' + b + ' n.Chr. is ' + b + ' ' + MIN + ' 1 =', antwoord:getal(b - 1), eenheid:'jaar', hint:'Je begint bij 1, niet bij 0.', fout:F(String(b), 'Je begint te tellen bij het jaar 1, niet bij 0. Haal er 1 af.') },
    { tekst:'Samen: ' + (-a) + ' + ' + (b - 1) + ' =', antwoord:getal(b - a - 1), eenheid:'jaar', hint:'Tel de twee stukken op.', fout:F(String(b - a), 'Er is geen jaar 0. Daarom is het 1 jaar minder.') } ]; }
  G.push({ groep:{ id:'gs-tijdrekenen', niveau:'onderbouw', domein:'tijd', naam:'Rekenen met jaartallen',
      uit:'Uitrekenen hoeveel jaar er tussen twee jaartallen zit: na Christus, voor Christus en over het jaar 1 heen. Er is geen jaar 0.' },
    doelen:[
      { id:'gs-jaren-nchr', naam:'Jaren tussen twee jaartallen na Christus', kort:'Trek het kleinste jaartal af van het grootste',
        uit:'<p>Liggen beide jaartallen <b>na Christus</b>, dan is het makkelijk: trek het kleinste jaartal af van het grootste.</p><p>De Tachtigjarige Oorlog liep van 1568 tot 1648: 1648 ' + MIN + ' 1568 = <b>80 jaar</b>.</p>',
        wanneer:'beide jaartallen na Christus zijn.',
        maak:function(R){
          var a = R.heel(400, 1900), b = a + R.heel(3, 400); if (b > NU) b = NU;
          return { context:zin(R, a, b), vraag:'Van ' + a + ' tot ' + b, eenheid:'jaar',
            stappen:[
              V('Liggen beide jaartallen na Christus?', ['ja', 'nee'], 'ja', 'Er staat geen v.Chr. bij. Dan is het na Christus.'),
              { tekst:b + ' ' + MIN + ' ' + a + ' =', antwoord:getal(b - a), eenheid:'jaar', hint:'Trek het kleinste jaartal af van het grootste.' } ] };
        } },
      { id:'gs-jaren-vchr', naam:'Jaren tussen twee jaartallen voor Christus', kort:'Ook voor Christus: trek het kleinste getal af van het grootste. Het grootste getal is het langst geleden',
        uit:'<p>Voor Christus tellen de jaren terug. <b>Hoe groter het getal, hoe langer geleden.</b> 753 v.Chr. was eerder dan 509 v.Chr.</p><p>Het aantal jaren ertussen reken je ook met aftrekken: het grootste getal min het kleinste. 753 ' + MIN + ' 509 = <b>244 jaar</b>.</p>',
        wanneer:'beide jaartallen voor Christus zijn.',
        maak:function(R){
          var a = R.heel(150, 3000), b = a - R.heel(5, Math.min(600, a - 1));
          return { context:zin(R, -a, -b), vraag:'Van ' + a + ' v.Chr. tot ' + b + ' v.Chr.', eenheid:'jaar',
            stappen:[
              K(R, 'Welk jaartal was het eerst?', a + ' v.Chr.', [b + ' v.Chr.'], 'Voor Christus: hoe groter het getal, hoe langer geleden.'),
              { tekst:a + ' ' + MIN + ' ' + b + ' =', antwoord:getal(a - b), eenheid:'jaar', hint:'Het grootste getal min het kleinste.', fout:F(String(a + b), 'Allebei voor Christus: dan trek je af, je telt niet op.') } ] };
        } },
      { id:'gs-jaren-over-nul', naam:'Jaren tussen v.Chr. en n.Chr.', kort:'Tel de twee getallen op en haal er 1 af, want er is geen jaar 0',
        uit:'<p>Ligt het ene jaartal <b>voor</b> Christus en het andere <b>na</b> Christus? Reken dan in twee stukken: tot het jaar 1, en vanaf het jaar 1.</p><p>Na 1 v.Chr. komt meteen 1 n.Chr.: er is <b>geen jaar 0</b>. Daarom haal je er 1 af.</p><p>Van 50 v.Chr. tot 100 n.Chr.: 50 + 100 ' + MIN + ' 1 = <b>149 jaar</b>.</p>',
        wanneer:'het ene jaartal voor Christus en het andere na Christus is.',
        maak:function(R){
          var a = -R.heel(2, 900), b = R.heel(2, 900);
          return { context:zin(R, a, b), vraag:'Van ' + jt(a) + ' tot ' + b + ' n.Chr.', eenheid:'jaar', stappen:overNul(a, b) };
        } },
      { id:'gs-jaren-geleden', naam:'Hoe lang geleden?', kort:'Na Christus: dit jaar min het jaartal. Voor Christus: tel op en haal er 1 af',
        uit:'<p>Hoe lang geleden was iets? Reken van het jaartal tot <b>nu</b> (' + NU + ').</p><p>Was het na Christus, dan trek je af: ' + NU + ' ' + MIN + ' 1648 = ' + (NU - 1648) + ' jaar.</p><p>Was het voor Christus, dan tel je op en haal je er 1 af, want er is geen jaar 0: 44 v.Chr. is 44 + ' + NU + ' ' + MIN + ' 1 = ' + (NU + 43) + ' jaar geleden.</p>',
        wanneer:'je wilt weten hoe lang iets geleden is.',
        maak:function(R){
          var vc = R.heel(0, 1) === 1, j = vc ? -R.heel(10, 3000) : R.heel(100, NU - 5);
          var st = vc ? [ { tekst:'Van ' + jt(j) + ' tot het jaar 1 n.Chr. is', antwoord:getal(-j), eenheid:'jaar', hint:'Dat is het getal zelf: ' + (-j) + '.' },
              { tekst:'Van het jaar 1 tot nu (' + NU + ') is ' + NU + ' ' + MIN + ' 1 =', antwoord:getal(NU - 1), eenheid:'jaar', hint:'Je begint bij 1, niet bij 0.' },
              { tekst:'Samen: ' + (-j) + ' + ' + (NU - 1) + ' =', antwoord:getal(NU - j - 1), eenheid:'jaar', hint:'Tel de twee stukken op.', fout:F(String(NU - j), 'Er is geen jaar 0. Haal er 1 af.') } ]
            : [ V('Is ' + j + ' voor of na Christus?', ['voor Christus', 'na Christus'], 'na Christus', 'Er staat geen v.Chr. bij.'),
              { tekst:NU + ' ' + MIN + ' ' + j + ' =', antwoord:getal(NU - j), eenheid:'jaar', hint:'Dit jaar min het jaartal.' } ];
          return { context:'Het is nu ' + NU + '. Hoeveel jaar geleden was het jaar ' + jt(j) + '?', vraag:jt(j) + ': hoe lang geleden?', eenheid:'jaar', stappen:st };
        } },
      { id:'gs-jaren-kies', naam:'Rekenen met jaartallen: kies de juiste manier', kort:'Aan dezelfde kant van het jaar 1? Aftrekken. Het ene v.Chr. en het andere n.Chr.? Optellen en 1 eraf',
        uit:'<p>Kijk eerst naar de twee jaartallen.</p><ul><li>Allebei <b>na Christus</b> of allebei <b>voor Christus</b>: trek het kleinste getal af van het grootste.</li><li>Het ene <b>voor</b> en het andere <b>na</b> Christus: tel de getallen op en haal er 1 af.</li></ul>',
        wanneer:'je in een opgave eerst moet kiezen hoe je rekent.',
        maak:function(R){
          var s = R.heel(0, 2), a, b;
          if (s === 0){ a = R.heel(300, 1900); b = a + R.heel(5, 300); }
          else if (s === 1){ a = -R.heel(200, 2500); b = a + R.heel(5, Math.min(500, -a - 1)); }
          else { a = -R.heel(2, 800); b = R.heel(2, 800); }
          var kant = s === 0 ? 'allebei na Christus' : s === 1 ? 'allebei voor Christus' : 'het ene voor en het andere na Christus';
          var manier = s === 2 ? 'optellen en 1 eraf' : 'het grootste getal min het kleinste';
          var uit = s === 2 ? b - a - 1 : Math.abs(Math.abs(b) - Math.abs(a));
          return { context:zin(R, a, b), vraag:'Van ' + jt(a) + ' tot ' + jt(b), eenheid:'jaar',
            stappen:[
              K(R, 'Waar liggen de jaartallen?', kant, ['allebei na Christus', 'allebei voor Christus', 'het ene voor en het andere na Christus'].filter(function(x){ return x !== kant; }), 'Kijk of er v.Chr. achter staat.'),
              K(R, 'Hoe reken je?', manier, [s === 2 ? 'het grootste getal min het kleinste' : 'optellen en 1 eraf', 'optellen'], s === 2 ? 'Over het jaar 1 heen: optellen, en 1 eraf want er is geen jaar 0.' : 'Aan dezelfde kant: aftrekken.'),
              { tekst:s === 2 ? (-a) + ' + ' + b + ' ' + MIN + ' 1 =' : Math.max(Math.abs(a), Math.abs(b)) + ' ' + MIN + ' ' + Math.min(Math.abs(a), Math.abs(b)) + ' =', antwoord:getal(uit), eenheid:'jaar', hint:'Reken de som uit.' } ] };
        } }
    ] });

  /* ================= 3 DE TIEN TIJDVAKKEN (onderbouw) ================= */
  var TV = [[1, 'jagers en boeren', -8000, -3000], [2, 'Grieken en Romeinen', -3000, 500], [3, 'monniken en ridders', 500, 1000], [4, 'steden en staten', 1000, 1500],
    [5, 'ontdekkers en hervormers', 1500, 1600], [6, 'regenten en vorsten', 1600, 1700], [7, 'pruiken en revoluties', 1700, 1800], [8, 'burgers en stoommachines', 1800, 1900],
    [9, 'wereldoorlogen', 1900, 1950], [10, 'televisie en computer', 1950, NU]];
  function tvNaam(t){ return 'tijdvak ' + t[0] + ': ' + t[1]; }
  function tvGrens(t){ return t[0] === 1 ? 'tot 3000 v.Chr.' : t[0] === 10 ? 'van 1950 tot nu' : 'van ' + jt(t[2]) + ' tot ' + jt(t[3]); }
  function tvVan(j){ for (var i = 0; i < TV.length; i++) if (j >= TV[i][2] && j < TV[i][3]) return TV[i]; return TV[9]; }
  function andereTv(R, t, n){ return R.hussel(TV.filter(function(x){ return x !== t && Math.abs(x[0] - t[0]) <= 3; })).slice(0, n); }
  var TVTABEL = '<table class="lr-tabel" style="font-size:.85rem"><tr><th>tijdvak</th><th>jaartallen</th></tr>' + TV.map(function(t){ return '<tr><td style="text-align:left"><b>' + t[0] + '</b> ' + t[1] + '</td><td>' + tvGrens(t).replace(/^van /, '') + '</td></tr>'; }).join('') + '</table>';
  G.push({ groep:{ id:'gs-tijdvak', niveau:'onderbouw', domein:'tijd', naam:'De tien tijdvakken',
      uit:'De geschiedenis is verdeeld in tien tijdvakken, elk met een naam en vaste jaartallen. Je zet een jaartal of een eeuw in het goede tijdvak.' },
    doelen:[
      { id:'gs-tijdvak-jaar', naam:'Een jaartal in het goede tijdvak', kort:'Zoek tussen welke grensjaren het jaartal ligt en lees het tijdvak af',
        uit:'<p>De geschiedenis is verdeeld in <b>tien tijdvakken</b>. Elk tijdvak heeft een naam en begint en eindigt bij een vast jaartal. Je ziet ze hieronder in de tabel.</p><p>Zoek tussen welke twee grensjaren het jaartal ligt. 1648 ligt tussen 1600 en 1700: <b>tijdvak 6, de tijd van regenten en vorsten</b>.</p>',
        wanneer:'je een gebeurtenis in de goede tijd wilt plaatsen.',
        maak:function(R){
          var t = R.kies(TV), j;
          do { j = t[0] === 1 ? -R.heel(3200, 8000) : R.heel(t[2] + 6, t[3] - 6); } while (j === 0);
          var foutT = andereTv(R, t, 3);
          return OP({ context:'In welk tijdvak hoort het jaar ' + jt(j) + '?', vraag:'Het jaar ' + jt(j), beeld:TVTABEL, zelfBeeld:TVTABEL,
            stappen:[
              K(R, 'Tussen welke grensjaren ligt ' + jt(j) + '?', tvGrens(t), foutT.map(tvGrens), j < 0 ? 'Voor Christus: hoe groter het getal, hoe langer geleden.' : 'Zoek in de tabel de rij waar ' + j + ' tussen het begin en het eind ligt.'),
              K(R, 'Welk tijdvak is dat?', tvNaam(t), foutT.map(tvNaam), 'Het tijdvak ' + tvGrens(t) + '.') ] });
        } },
      { id:'gs-tijdvak-eeuw', naam:'Een eeuw in het goede tijdvak', kort:'Zet de eeuw eerst om in jaartallen en zoek dan het tijdvak',
        uit:'<p>Soms staat er geen jaartal maar een <b>eeuw</b>. Zet de eeuw dan eerst om in jaartallen.</p><p>De 18e eeuw loopt van 1701 tot en met 1800. Dat valt in <b>tijdvak 7, de tijd van pruiken en revoluties</b> (1700 tot 1800).</p><p>Let op: de 20e eeuw valt in twee tijdvakken. De eerste helft is tijdvak 9, de tweede helft tijdvak 10.</p>',
        wanneer:'je een eeuw in de goede tijd wilt plaatsen.',
        maak:function(R){
          var e = R.kies([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21]), vc = e <= 5 && R.heel(0, 2) === 0;
          var begin = vc ? -(e * 100) : (e - 1) * 100 + 1, eind = vc ? -((e - 1) * 100 + 1) : e * 100, t = tvVan(vc ? begin + 1 : begin);
          var gr = vc ? 'van ' + (e * 100) + ' v.Chr. tot en met ' + ((e - 1) * 100 + 1) + ' v.Chr.' : 'van ' + begin + ' tot en met ' + eind;
          var andere = [1, -1, 2].map(function(d){ var f = e + d; if (f < 1) f = e + 3; return vc ? 'van ' + (f * 100) + ' v.Chr. tot en met ' + ((f - 1) * 100 + 1) + ' v.Chr.' : 'van ' + ((f - 1) * 100 + 1) + ' tot en met ' + (f * 100); });
          if (!vc) andere[2] = 'van ' + ((e - 1) * 100) + ' tot en met ' + ((e - 1) * 100 + 99);
          var foutT = andereTv(R, t, 3);
          var naam = 'de ' + rang(e) + ' eeuw' + (vc ? ' v.Chr.' : '');
          return OP({ context:'In welk tijdvak valt ' + naam + '?', vraag:hoofd(naam), beeld:TVTABEL, zelfBeeld:TVTABEL,
            stappen:[
              K(R, 'Welke jaren horen bij ' + naam + '?', gr, andere, vc ? 'Voor Christus: de ' + rang(e) + ' eeuw v.Chr. begint in ' + (e * 100) + ' v.Chr. en telt terug.' : 'De ' + rang(e) + ' eeuw eindigt in ' + e + ' ' + X + ' 100 = ' + (e * 100) + '.'),
              K(R, 'In welk tijdvak vallen die jaren?', tvNaam(t), foutT.map(tvNaam), 'Zoek in de tabel het tijdvak ' + tvGrens(t) + '.') ] });
        } }
    ] });

  /* ================= 4 VOLGORDE EN GELIJKTIJDIGHEID (onderbouw) ================= */
  var GEB = [['Rome wordt volgens de overlevering gesticht', -753], ['De eerste Olympische Spelen in Griekenland, volgens de overlevering', -776], ['Alexander de Grote sterft', -323], ['Julius Caesar wordt vermoord', -44],
    ['Het West-Romeinse Rijk valt', 476], ['Karel de Grote wordt tot keizer gekroond', 800], ['Columbus bereikt Amerika', 1492], ['Luther publiceert zijn 95 stellingen', 1517],
    ['De Beeldenstorm', 1566], ['Het Plakkaat van Verlatinghe', 1581], ['Willem van Oranje wordt vermoord', 1584], ['De VOC wordt opgericht', 1602], ['De Vrede van Münster', 1648],
    ['Het begin van de Franse Revolutie', 1789], ['Nederland wordt een koninkrijk', 1815], ['De eerste spoorlijn in Nederland', 1839], ['De grondwet van Thorbecke', 1848],
    ['De slavernij in Suriname en op de Antillen wordt afgeschaft', 1863], ['Het begin van de Eerste Wereldoorlog', 1914], ['Vrouwen in Nederland krijgen kiesrecht', 1919],
    ['Duitsland valt Nederland binnen', 1940], ['De Watersnoodramp', 1953], ['Voor het eerst lopen mensen op de maan', 1969], ['De Berlijnse Muur valt', 1989], ['Euromunten en eurobiljetten komen in Nederland', 2002]];
  var LET = ['A', 'B', 'C', 'D'];
  /* personen: [naam, geboren, gestorven] */
  var MENS = [['Karel V', 1500, 1558], ['Filips II', 1527, 1598], ['Willem van Oranje', 1533, 1584], ['Johan van Oldenbarnevelt', 1547, 1619], ['Hugo de Groot', 1583, 1645],
    ['Rembrandt van Rijn', 1606, 1669], ['Michiel de Ruyter', 1607, 1676], ['Johan de Witt', 1625, 1672], ['Johannes Vermeer', 1632, 1675], ['Baruch Spinoza', 1632, 1677],
    ['Lodewijk XIV', 1638, 1715], ['Wolfgang Amadeus Mozart', 1756, 1791], ['Napoleon Bonaparte', 1769, 1821], ['koning Willem I', 1772, 1843], ['Johan Rudolph Thorbecke', 1798, 1872],
    ['Multatuli', 1820, 1887], ['Vincent van Gogh', 1853, 1890], ['Aletta Jacobs', 1854, 1929], ['Maarten Luther', 1483, 1546], ['Galileo Galilei', 1564, 1642],
    ['Christoffel Columbus', 1451, 1506], ['Charles Darwin', 1809, 1882], ['koningin Wilhelmina', 1880, 1962], ['Abraham Kuyper', 1837, 1920], ['Anne Frank', 1929, 1945], ['Willem Drees', 1886, 1988]];
  function mensTabel(a, b){ return ktabel([['persoon', 'geboren', 'gestorven'], [a[0], String(a[1]), String(a[2])], [b[0], String(b[1]), String(b[2])]], { kop:true }); }
  /* een tijdlijn met streepjes en letters */
  function tijdlijn(start, stap, letters, toon){
    var W = 620, L = 30, Rr = 590, Y = 96, n = 10, s = '<svg class="lr-svg" viewBox="0 0 ' + W + ' 140" role="img" aria-label="tijdlijn">';
    function x(i){ return L + i * (Rr - L) / n; }
    s += '<line x1="' + (L - 10) + '" y1="' + Y + '" x2="' + (Rr + 14) + '" y2="' + Y + '" class="as"/><path d="M' + (Rr + 14) + ' ' + Y + ' l-10 -6 M' + (Rr + 14) + ' ' + Y + ' l-10 6" class="as"/>';
    for (var i = 0; i <= n; i++){
      s += '<line x1="' + x(i) + '" y1="' + (Y - 8) + '" x2="' + x(i) + '" y2="' + (Y + 8) + '" class="as"/>';
      if (i === 0 || i === n || toon) s += '<text x="' + x(i) + '" y="' + (Y + 30) + '" class="getal klein">' + (start + i * stap) + '</text>';
    }
    letters.forEach(function(l){ s += '<path d="M' + x(l[1]) + ' ' + (Y - 12) + ' l-7 -12 h14 z" style="fill:var(--lr-' + l[2] + ')"/><text x="' + x(l[1]) + '" y="' + (Y - 32) + '" class="getal groot" style="fill:var(--lr-' + l[2] + ')">' + l[0] + '</text>'; });
    return s + '</svg>';
  }
  G.push({ groep:{ id:'gs-volgorde', niveau:'onderbouw', domein:'tijd', naam:'Volgorde en gelijktijdigheid',
      uit:'Gebeurtenissen in de goede volgorde zetten, een tijdlijn lezen, en uitzoeken of mensen in dezelfde tijd leefden.' },
    doelen:[
      { id:'gs-volgorde', naam:'Gebeurtenissen in volgorde zetten', kort:'Zoek steeds het vroegste jaartal. Voor Christus: het grootste getal is het vroegst',
        uit:'<p>Om gebeurtenissen in de goede volgorde te zetten, zoek je steeds het <b>vroegste</b> jaartal.</p><p>Let op <b>v.Chr.</b>: dat is altijd eerder dan na Christus. En voor Christus is het <b>grootste getal het vroegst</b>: 776 v.Chr. was eerder dan 44 v.Chr.</p><p>Na Christus is het kleinste getal het vroegst.</p>',
        wanneer:'je gebeurtenissen op een tijdlijn wilt zetten.',
        maak:function(R){
          var g = R.hussel(GEB).slice(0, 4), volg = g.slice().sort(function(a, b){ return a[1] - b[1]; }).map(function(x){ return LET[g.indexOf(x)]; });
          var b = ktabel([['', 'gebeurtenis', 'jaar']].concat(g.map(function(x, i){ return [LET[i], x[0], jt(x[1])]; })), { kop:true });
          var goed = volg.join(', '), fout = [], rest = LET.slice();
          for (var t = 0; t < 40 && fout.length < 3; t++){ var p = R.hussel(LET).join(', '); if (p !== goed && fout.indexOf(p) < 0) fout.push(p); }
          var st = [], over = LET.slice();
          for (var k = 0; k < 3; k++){
            var juist = volg[k], gx = g[LET.indexOf(juist)];
            st.push(V(k === 0 ? 'Welke gebeurtenis was het eerst?' : 'Welke gebeurtenis kwam daarna?', over, juist, (k === 0 ? 'Zoek het vroegste jaartal. ' : 'Zoek het vroegste jaartal van wat er nog over is. ') + (over.some(function(l){ return g[LET.indexOf(l)][1] < 0; }) ? 'Voor Christus is eerder dan na Christus, en een groter getal v.Chr. is eerder.' : 'Het kleinste jaartal is het vroegst.')));
            over = over.filter(function(l){ return l !== juist; });
          }
          st.push(K(R, 'Dus de volgorde is', goed, fout, 'Zet de letters achter elkaar zoals je ze net hebt gekozen.'));
          return OP({ context:'Zet de vier gebeurtenissen in de goede volgorde, van vroeg naar laat.', vraag:'Volgorde: ' + g.map(function(x){ return jt(x[1]); }).join(' / '), vraagHtml:'Wat is de goede volgorde?', beeld:b, zelfBeeld:b, stappen:st });
        } },
      { id:'gs-tijdlijn', naam:'Een tijdlijn lezen', kort:'Reken uit hoeveel jaar één stap is en tel de stappen vanaf het begin',
        uit:'<p>Op een <b>tijdlijn</b> staan de jaren van links (vroeg) naar rechts (laat). Vaak staan niet bij alle streepjes jaartallen.</p><p>Reken eerst uit hoeveel jaar <b>één stap</b> is: het verschil tussen begin en eind, gedeeld door het aantal stappen.</p><p>Tel dan vanaf het begin hoeveel stappen je verder moet. Van 1500 tot 2000 in 10 stappen is 50 jaar per stap. 1650 is 150 : 50 = 3 stappen na 1500.</p>',
        wanneer:'je een gebeurtenis op een tijdlijn moet aanwijzen of plaatsen.',
        maak:function(R){
          var stap = R.kies([10, 20, 25, 50, 100]), start = stap === 100 ? R.heel(0, 10) * 100 : R.heel(10, 19) * 100, eind = start + 10 * stap;
          var pos = R.hussel([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4).sort(function(a, b){ return a - b; }), letters = pos.map(function(p, i){ return [LET[i], p, i + 1]; });
          var k = R.heel(0, 3), j = start + pos[k] * stap;
          var b = tijdlijn(start, stap, letters, false);
          return OP({ context:'Welke letter op de tijdlijn hoort bij het jaar ' + j + '?', vraag:'Het jaar ' + j + ' op de tijdlijn', beeld:function(n){ return tijdlijn(start, stap, letters, n >= 1); }, zelfBeeld:b,
            stappen:[
              { tekst:'De tijdlijn loopt van ' + start + ' tot ' + eind + ' in 10 stappen. Eén stap is (' + eind + ' ' + MIN + ' ' + start + ') : 10 =', antwoord:getal(stap), eenheid:'jaar', hint:(eind - start) + ' : 10.' },
              { tekst:'Hoeveel stappen na ' + start + ' ligt ' + j + '? (' + j + ' ' + MIN + ' ' + start + ') : ' + stap + ' =', antwoord:getal(pos[k]), hint:(j - start) + ' : ' + stap + '.' },
              V('Welke letter staat bij dat streepje?', LET, LET[k], 'Tel ' + pos[k] + ' streepjes vanaf het begin, ' + start + '.') ] });
        } },
      { id:'gs-gelijktijdig', naam:'Leefden ze in dezelfde tijd?', kort:'Neem wie het eerst geboren is. Leefde die nog toen de ander geboren werd? Dan leefden ze tegelijk',
        uit:'<p>Twee mensen leefden <b>gelijktijdig</b> als hun levens elkaar overlappen: een tijd waren ze allebei in leven.</p><p>Kijk wie het <b>eerst geboren</b> is. Was die persoon nog in leven toen de ander geboren werd? Dan leefden ze een tijd tegelijk.</p><p>Rembrandt (1606 tot 1669) en Vermeer (1632 tot 1675): Rembrandt leefde nog in 1632, dus ja.</p>',
        wanneer:'je wilt weten of mensen elkaar gekend kunnen hebben, of iets van elkaar konden weten.',
        maak:function(R){
          var wil = R.heel(0, 1) === 1, a, b;
          for (var t = 0; t < 200; t++){ var p = R.hussel(MENS); a = p[0]; b = p[1]; if (a[1] === b[1]) continue; var ov = Math.min(a[2], b[2]) > Math.max(a[1], b[1]); if (Math.min(a[2], b[2]) === Math.max(a[1], b[1])) continue; if (ov === wil && Math.abs(a[1] - b[1]) < 160) break; }
          var eerst = a[1] < b[1] ? a : b, later = eerst === a ? b : a, ja = eerst[2] > later[1];
          var tb = mensTabel(a, b);
          return OP({ context:'Leefden ' + a[0] + ' en ' + b[0] + ' een tijd tegelijk?', vraag:a[0] + ' en ' + b[0], beeld:tb, zelfBeeld:tb,
            stappen:[
              K(R, 'Wie werd het eerst geboren?', eerst[0], [later[0]], 'Vergelijk de geboortejaren: ' + a[1] + ' en ' + b[1] + '.'),
              V('Leefde ' + eerst[0] + ' nog toen ' + later[0] + ' geboren werd, in ' + later[1] + '?', ['ja', 'nee'], ja ? 'ja' : 'nee', eerst[0] + ' stierf in ' + eerst[2] + '. Is dat na ' + later[1] + '?'),
              V('Dus leefden ze een tijd tegelijk?', ['ja', 'nee'], ja ? 'ja' : 'nee', ja ? 'De levens overlappen.' : eerst[0] + ' was al dood toen ' + later[0] + ' geboren werd.') ] });
        } },
      { id:'gs-overlap', naam:'Hoe lang tegelijk?', kort:'Neem het laatste geboortejaar en het eerste sterfjaar, en trek ze van elkaar af',
        uit:'<p>Leefden twee mensen tegelijk, dan kun je uitrekenen hoe lang ongeveer.</p><p>Het samen-leven begint pas als de <b>tweede</b> persoon geboren is: het <b>laatste geboortejaar</b>. Het stopt als de <b>eerste</b> persoon sterft: het <b>eerste sterfjaar</b>.</p><p>Rembrandt (1606 tot 1669) en Vermeer (1632 tot 1675): van 1632 tot 1669 is 1669 ' + MIN + ' 1632 = <b>37 jaar</b>.</p>',
        wanneer:'je wilt weten hoe lang twee mensen in dezelfde tijd leefden.',
        maak:function(R){
          var a, b;
          for (var t = 0; t < 300; t++){ var p = R.hussel(MENS); a = p[0]; b = p[1]; if (Math.min(a[2], b[2]) - Math.max(a[1], b[1]) >= 3 && a[1] !== b[1] && a[2] !== b[2]) break; }
          var lb = Math.max(a[1], b[1]), es = Math.min(a[2], b[2]), tb = mensTabel(a, b);
          return { context:a[0] + ' en ' + b[0] + ' leefden een tijd tegelijk. Hoeveel jaar ongeveer?', vraag:a[0] + ' en ' + b[0], beeld:tb, zelfBeeld:tb, eenheid:'jaar',
            stappen:[
              { tekst:'Het laatste geboortejaar (dan leven ze allebei) =', antwoord:getal(lb), hint:'Welk geboortejaar is het grootst: ' + a[1] + ' of ' + b[1] + '?', fout:F(String(Math.min(a[1], b[1])), 'Dan leefde de ander nog niet. Neem het laatste geboortejaar.') },
              { tekst:'Het eerste sterfjaar (dan stopt het) =', antwoord:getal(es), hint:'Welk sterfjaar is het kleinst: ' + a[2] + ' of ' + b[2] + '?', fout:F(String(Math.max(a[2], b[2])), 'Toen was de ander al dood. Neem het eerste sterfjaar.') },
              { tekst:es + ' ' + MIN + ' ' + lb + ' =', antwoord:getal(es - lb), eenheid:'jaar', hint:'Trek de jaartallen van elkaar af.' } ] };
        } }
    ] });

  LEERROUTE.voeg('geschiedenis', G);
})();
