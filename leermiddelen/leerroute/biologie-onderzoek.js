/* De leerroute biologie, onderzoek doen: onderzoeksvraag, hypothese, resultaat en conclusie
   herkennen, variabelen, de controlegroep, een eerlijke proef, assen en diagrammen kiezen,
   het gemiddelde, conclusies uit tabellen en grafieken, het optimum, de gemiddelde toename
   en de procentuele verandering. Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var T = LEERROUTE.R, MIN = '−', G = [];

  /* ---------- hulpjes ---------- */
  function tn(x){ return T.toon(x); }
  function nv(x){ var a = tn(x), l = [a, String(x), a.replace(MIN, '-')]; return l.filter(function(v, i){ return l.indexOf(v) === i; }); }
  function pv(x){ return nv(x).concat(nv(x).map(function(v){ return v + '%'; })); }
  function F(){ var o = {}; for (var i = 0; i + 1 < arguments.length; i += 2) if (arguments[i] != null) o[String(arguments[i]).toLowerCase()] = arguments[i + 1]; return o; }
  function kz(tekst, opties, goed, hint, extra){ var o = T.hussel(opties), s = { tekst:tekst, opties:o, goed:o.indexOf(goed), hint:hint }; if (extra) for (var k in extra) s[k] = extra[k]; return s; }
  function kv(tekst, opties, goed, hint, extra){ var s = { tekst:tekst, opties:opties.slice(), goed:goed, hint:hint }; if (extra) for (var k in extra) s[k] = extra[k]; return s; }
  function eindKeuze(op){ var s = op.stappen[op.stappen.length - 1]; op.opties = s.opties; op.goed = s.goed; return op; }
  function r1(x){ return Math.round(x * 10) / 10; }
  function rnd(x, d){ var f = Math.pow(10, d || 0); return Math.round(x * f) / f; }
  function som(l){ return l.reduce(function(a, b){ return a + b; }, 0); }
  function cap(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
  function svg(w, h, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + w + ' ' + h + '"' + (max ? ' style="max-width:' + max + 'px"' : '') + ' role="img" aria-label="' + T.schoon(aria) + '">'; }
  function tekst(x, y, t, kl, stijl){ return '<text x="' + r1(x) + '" y="' + r1(y) + '" class="' + (kl || 'getal klein') + '"' + (stijl ? ' style="' + stijl + '"' : '') + '>' + T.schoon(t) + '</text>'; }
  /* een lijngrafiek: xs, ys (op rasterlijnen van ystap), assen met naam; o.nadruk: indexen van punten */
  function lijnGraf(xs, ys, xnaam, ynaam, ystap, o){
    o = o || {};
    var W = 520, L = 64, Rr = 24, top = 30, H = 230, pw = W - L - Rr;
    var xmin = Math.min.apply(null, xs), xmax = Math.max.apply(null, xs), ymax = Math.ceil(Math.max.apply(null, ys) / ystap + 1) * ystap;
    function x(v){ return L + (v - xmin) / ((xmax - xmin) || 1) * pw; } function y(v){ return top + H - v / ymax * H; }
    var s = svg(W, top + H + 56, 'lijngrafiek', 560);
    for (var v = 0; v <= ymax + 1e-9; v += ystap){ s += '<line x1="' + L + '" y1="' + r1(y(v)) + '" x2="' + (W - Rr) + '" y2="' + r1(y(v)) + '" class="as dun"/>' + tekst(L - 8, y(v) + 5, tn(rnd(v, 2)), 'getal klein', 'text-anchor:end'); }
    xs.forEach(function(xv){ s += '<line x1="' + r1(x(xv)) + '" y1="' + top + '" x2="' + r1(x(xv)) + '" y2="' + (top + H) + '" class="as dun"/>' + tekst(x(xv), top + H + 20, tn(xv)); });
    s += '<line x1="' + L + '" y1="' + (top + H) + '" x2="' + (W - Rr) + '" y2="' + (top + H) + '" class="as"/><line x1="' + L + '" y1="' + top + '" x2="' + L + '" y2="' + (top + H) + '" class="as"/>';
    s += '<polyline points="' + xs.map(function(xv, i){ return r1(x(xv)) + ',' + r1(y(ys[i])); }).join(' ') + '" class="boog" style="stroke:var(--lr-1)"/>';
    xs.forEach(function(xv, i){ var nad = (o.nadruk || []).indexOf(i) >= 0; s += '<circle cx="' + r1(x(xv)) + '" cy="' + r1(y(ys[i])) + '" r="' + (nad ? 7 : 4.5) + '" style="fill:var(--lr-' + (nad ? 2 : 1) + ')"/>'; });
    s += tekst(L + pw / 2, top + H + 44, xnaam, 'getal klein') + tekst(L - 8, top - 12, ynaam, 'getal klein', 'text-anchor:start');
    return s + '</svg>';
  }

  /* ---------- proeven: elk met een vraag, wat je verandert, meet en gelijk houdt ---------- */
  var PROEF = [
    { wie:'Lisa', zij:'ze', doel:'of de temperatuur invloed heeft op hoeveel gas gist maakt',
      opzet:'Ze doet water, suiker en gist in vier flesjes en zet er een ballon op. De flesjes staan in bakken water van 5, 15, 25 en 35 °C. Na 30 minuten meet ze de omtrek van elke ballon.',
      verander:'de temperatuur van het water', meet:'de omtrek van de ballon', gelijk:['de hoeveelheid gist', 'de hoeveelheid suiker', 'hoe lang ze wacht'],
      xs:[5, 15, 25, 35], xn:'temperatuur (°C)', yn:'omtrek ballon (cm)', st:2, y0:[6, 10], dir:1,
      c:{ op:'Hoe warmer het water, hoe meer gas de gist maakt.', af:'Hoe warmer het water, hoe minder gas de gist maakt.', geen:'De temperatuur heeft geen invloed op hoeveel gas de gist maakt.' },
      zin:{ vraag:'Heeft de temperatuur invloed op hoeveel gas gist maakt?', hyp:'Ik verwacht dat gist meer gas maakt als het water warmer is.', res:'Bij 25 °C was de omtrek van de ballon 18 cm.', conc:'Uit de proef blijkt dat gist meer gas maakt als het water warmer is.' } },
    { wie:'Daan', zij:'hij', doel:'of de afstand van een lamp invloed heeft op hoeveel zuurstof waterpest maakt',
      opzet:'Hij zet een takje waterpest in een bekerglas met water. Hij zet een lamp op 10, 20, 30 en 40 cm afstand. Bij elke afstand telt hij een minuut lang de belletjes zuurstof.',
      verander:'de afstand van de lamp', meet:'het aantal belletjes per minuut', gelijk:['de temperatuur van het water', 'het takje waterpest', 'hoe lang hij telt'],
      xs:[10, 20, 30, 40], xn:'afstand lamp (cm)', yn:'belletjes per minuut', st:2, y0:[26, 34], dir:-1,
      c:{ op:'Hoe verder de lamp, hoe meer belletjes waterpest maakt.', af:'Hoe verder de lamp, hoe minder belletjes waterpest maakt.', geen:'De afstand van de lamp heeft geen invloed op het aantal belletjes.' },
      zin:{ vraag:'Maakt waterpest minder zuurstof als de lamp verder weg staat?', hyp:'Ik denk dat waterpest minder zuurstof maakt als de lamp verder weg staat.', res:'Met de lamp op 10 cm telde Daan 28 belletjes in een minuut.', conc:'De resultaten laten zien dat waterpest minder zuurstof maakt als de lamp verder weg staat.' } },
    { wie:'Fatima', zij:'ze', doel:'of de temperatuur invloed heeft op het kiemen van tuinkers',
      opzet:'Ze legt in vier bakjes 20 tuinkerszaadjes op nat watten. De bakjes staan op 5, 10, 15 en 20 °C. Na drie dagen telt ze hoeveel zaadjes gekiemd zijn.',
      verander:'de temperatuur', meet:'het aantal gekiemde zaadjes', gelijk:['het aantal zaadjes per bakje', 'de hoeveelheid water', 'de soort zaadjes'],
      xs:[5, 10, 15, 20], xn:'temperatuur (°C)', yn:'gekiemde zaadjes', st:2, y0:[0, 4], dir:1, max:20,
      c:{ op:'Hoe warmer het is, hoe meer zaadjes kiemen.', af:'Hoe warmer het is, hoe minder zaadjes kiemen.', geen:'De temperatuur heeft geen invloed op het kiemen.' },
      zin:{ vraag:'Kiemen er meer tuinkerszaadjes als het warmer is?', hyp:'Mijn verwachting is dat er meer zaadjes kiemen als het warmer is.', res:'Bij 5 °C waren na drie dagen 2 van de 20 zaadjes gekiemd.', conc:'Uit de metingen volgt dat er meer zaadjes kiemen als het warmer is.' } },
    { wie:'Sem', zij:'hij', doel:'of zijn hartslag hoger wordt als hij langer touwtjespringt',
      opzet:'Hij springt 0, 1, 2 en 3 minuten touw, telkens na een flinke rustpauze. Direct daarna meet hij zijn hartslag.',
      verander:'hoe lang hij springt', meet:'zijn hartslag', gelijk:['hoe snel hij springt', 'de persoon: steeds Sem zelf', 'hoe hij zijn hartslag meet'],
      xs:[0, 1, 2, 3], xn:'tijd springen (min)', yn:'hartslag (per minuut)', st:10, y0:[60, 80], dir:1,
      c:{ op:'Hoe langer Sem springt, hoe hoger zijn hartslag.', af:'Hoe langer Sem springt, hoe lager zijn hartslag.', geen:'Hoe lang Sem springt, heeft geen invloed op zijn hartslag.' },
      zin:{ vraag:'Wordt de hartslag hoger als je langer touwtjespringt?', hyp:'Ik verwacht dat mijn hartslag hoger wordt als ik langer spring.', res:'Na 2 minuten springen was de hartslag van Sem 140 slagen per minuut.', conc:'Uit de resultaten blijkt dat de hartslag hoger wordt als je langer springt.' } },
    { wie:'Noor', zij:'ze', doel:'of maïsplantjes harder groeien met meer kunstmest',
      opzet:'Ze geeft vier groepjes plantjes per week 0, 1, 2 en 3 gram kunstmest. Na vier weken meet ze hoe lang de plantjes zijn.',
      verander:'de hoeveelheid kunstmest', meet:'de lengte van de plantjes', gelijk:['de hoeveelheid water', 'de hoeveelheid licht', 'de soort plant'],
      xs:[0, 1, 2, 3], xn:'kunstmest (g per week)', yn:'lengte (cm)', st:2, y0:[10, 16], dir:1,
      c:{ op:'Hoe meer kunstmest, hoe langer de plantjes worden.', af:'Hoe meer kunstmest, hoe korter de plantjes blijven.', geen:'De hoeveelheid kunstmest heeft geen invloed op de lengte.' },
      zin:{ vraag:'Groeien maïsplantjes harder als ze meer kunstmest krijgen?', hyp:'Als de plantjes meer kunstmest krijgen, dan groeien ze harder.', res:'De plantjes zonder kunstmest waren na vier weken 12 cm lang.', conc:'Uit de proef blijkt dat maïsplantjes harder groeien met meer kunstmest.' } },
    { wie:'Tim', zij:'hij', doel:'of brood sneller schimmelt als het warmer is',
      opzet:'Hij legt vier sneetjes van hetzelfde brood in een afgesloten zakje bij 5, 10, 20 en 30 °C. Na zes dagen telt hij de schimmelplekjes.',
      verander:'de temperatuur', meet:'het aantal schimmelplekjes', gelijk:['de soort brood', 'hoe lang hij wacht', 'de grootte van de sneetjes'],
      xs:[5, 10, 20, 30], xn:'temperatuur (°C)', yn:'schimmelplekjes', st:2, y0:[0, 4], dir:1,
      c:{ op:'Hoe warmer het is, hoe meer schimmelplekjes er komen.', af:'Hoe warmer het is, hoe minder schimmelplekjes er komen.', geen:'De temperatuur heeft geen invloed op de schimmel.' },
      zin:{ vraag:'Schimmelt brood sneller als het warmer is?', hyp:'Ik denk dat brood sneller schimmelt als het warmer is.', res:'Het sneetje bij 5 °C had na zes dagen 2 schimmelplekjes.', conc:'De metingen laten zien dat brood sneller schimmelt als het warmer is.' } },
    { wie:'Bas', zij:'hij', doel:'of zout in het water invloed heeft op het kiemen van zaadjes',
      opzet:'Hij legt in vier bakjes 20 zaadjes. Hij geeft ze water met 0, 5, 10 en 15 gram zout per liter. Na vijf dagen telt hij de gekiemde zaadjes.',
      verander:'de hoeveelheid zout in het water', meet:'het aantal gekiemde zaadjes', gelijk:['het aantal zaadjes per bakje', 'de temperatuur', 'de hoeveelheid water'],
      xs:[0, 5, 10, 15], xn:'zout (g per liter)', yn:'gekiemde zaadjes', st:2, y0:[16, 20], dir:-1, max:20,
      c:{ op:'Hoe meer zout, hoe meer zaadjes kiemen.', af:'Hoe meer zout, hoe minder zaadjes kiemen.', geen:'Zout heeft geen invloed op het kiemen.' },
      zin:{ vraag:'Kiemen er minder zaadjes als er meer zout in het water zit?', hyp:'Waarschijnlijk kiemen er minder zaadjes als er meer zout in het water zit.', res:'In het bakje met 15 gram zout was na vijf dagen 1 zaadje gekiemd.', conc:'Uit de resultaten blijkt dat er minder zaadjes kiemen als er meer zout in het water zit.' } },
    { wie:'Eva', zij:'ze', doel:'of bonenplanten harder groeien als er hardere muziek speelt',
      opzet:'Ze zet vier groepjes bonenplanten in vier gelijke ruimtes. Daar speelt muziek van 0, 40, 60 en 80 decibel. Na drie weken meet ze de lengte.',
      verander:'hoe hard de muziek is', meet:'de lengte van de planten', gelijk:['de hoeveelheid water', 'de hoeveelheid licht', 'de soort plant'],
      xs:[0, 40, 60, 80], xn:'geluid (dB)', yn:'lengte (cm)', st:2, y0:[14, 20], dir:0,
      c:{ op:'Hoe harder de muziek, hoe langer de planten worden.', af:'Hoe harder de muziek, hoe korter de planten blijven.', geen:'Hoe hard de muziek is, heeft geen invloed op de lengte van de planten.' },
      zin:{ vraag:'Groeien bonenplanten harder als er hardere muziek speelt?', hyp:'Ik verwacht dat bonenplanten harder groeien met hardere muziek.', res:'De planten bij 80 decibel waren na drie weken 18 cm lang.', conc:'Uit de proef blijkt dat de muziek geen invloed heeft op de groei van bonenplanten.' } } ];
  /* metingen bij een proef: stijgend, dalend of ongeveer gelijk, op rasterlijnen */
  function metingen(R, P){
    for (var p = 0; p < 50; p++){
      var y = R.heel(P.y0[0] / P.st, P.y0[1] / P.st) * P.st, l = [y];
      for (var i = 1; i < P.xs.length; i++){ if (P.dir){ y += P.dir * R.heel(1, 3) * P.st; l.push(y); } else l.push(l[0] + R.kies([0, P.st])); }
      /* geen invloed: de waarden gaan op en neer, nooit alleen maar omhoog of omlaag */
      if (!P.dir){ var op = false, neer = false; for (i = 1; i < l.length; i++){ if (l[i] > l[i - 1]) op = true; if (l[i] < l[i - 1]) neer = true; } if (op !== neer) continue; }
      if (l.every(function(v){ return v >= 0 && (!P.max || v <= P.max); })) return l;
    }
    return P.xs.map(function(x, i){ return P.dir >= 0 ? P.st * (i + 1) : P.st * (4 - i); });
  }
  function tabelVan(P, ys){ return T.teken.tabel([[cap(P.xn)].concat(P.xs.map(tn)), [cap(P.yn)].concat(ys.map(tn))], { zijkop:true }); }
  var TRIO = ['onafhankelijke variabele', 'afhankelijke variabele', 'constante factor'];

  G.push({ groep:{ id:'bi-opzet', niveau:'onderbouw', domein:'onderzoek', naam:'Een onderzoek opzetten',
      uit:'De onderdelen van een onderzoek herkennen: vraag, hypothese, resultaat en conclusie. Wat je verandert, meet en gelijk houdt, wat de controlegroep is, en of een proef eerlijk is.' },
    doelen:[
      { id:'bi-ond-herken', naam:'Vraag, hypothese, resultaat of conclusie?', kort:'Een vraag eindigt met een vraagteken, een hypothese is een verwachting, een conclusie beantwoordt de vraag',
        uit:'<p>Een onderzoek heeft vaste onderdelen.</p><p>De <b>onderzoeksvraag</b> is wat je wilt weten. Het is een vraag. De <b>hypothese</b> is wat je verwacht, vóór je het onderzoek doet. Een <b>resultaat</b> is wat je gemeten of gezien hebt, bijvoorbeeld een getal. De <b>conclusie</b> is het antwoord op de onderzoeksvraag, na het onderzoek.</p>',
        wanneer:'je een verslag leest of schrijft en wilt weten welk stuk wat is.',
        maak:function(R){
          var P = R.kies(PROEF), soort = R.kies(['vraag', 'hyp', 'res', 'conc']), zin = P.zin[soort], TY = ['onderzoeksvraag', 'hypothese', 'resultaat', 'conclusie'];
          var goed = { vraag:0, hyp:1, res:2, conc:3 }[soort], st = [kv('Is het een vraag?', ['ja', 'nee'], soort === 'vraag' ? 0 : 1, 'Kijk of de zin eindigt met een vraagteken.')];
          if (soort !== 'vraag') st.push(kv('Gaat de zin over wat ' + P.wie + ' verwacht vóór het onderzoek, of over wat ' + P.zij + ' gemeten of gevonden heeft?', ['wat ' + P.zij + ' verwacht', 'wat ' + P.zij + ' gemeten of gevonden heeft'], soort === 'hyp' ? 0 : 1,
            soort === 'hyp' ? 'Woorden als "ik verwacht", "ik denk", "waarschijnlijk" of "als ..., dan ..." passen bij een verwachting.' : 'De zin vertelt wat er uit het onderzoek kwam.'));
          if (soort === 'res' || soort === 'conc') st.push(kv('Is het één meting, of een antwoord op de onderzoeksvraag?', ['één meting', 'een antwoord op de onderzoeksvraag'], soort === 'res' ? 0 : 1,
            soort === 'res' ? 'Er staat één getal of waarneming in, bij één situatie.' : 'De zin zegt iets over alle metingen samen en beantwoordt de vraag.'));
          st.push(kv('Wat is de zin?', TY, goed, 'Volg de stappen: het is een ' + TY[goed] + '.'));
          return eindKeuze({ vraag:'Wat is deze zin?', vraagHtml:'Wat is deze zin?', context:P.wie + ' onderzoekt ' + P.doel + '.<br><b>"' + T.schoon(zin) + '"</b>', stappen:st });
        } },
      { id:'bi-ond-var', naam:'Wat verander je, wat meet je, wat houd je gelijk?', kort:'Wat je verandert is de onafhankelijke variabele, wat je meet de afhankelijke',
        uit:'<p>In een proef verander je <b>één ding</b> expres. Dat is de <b>onafhankelijke variabele</b>.</p><p>Je kijkt wat daardoor verandert: dat <b>meet</b> je. Dat is de <b>afhankelijke variabele</b>.</p><p>Al het andere houd je <b>gelijk</b>: de <b>constante factoren</b>. Zo weet je zeker dat een verschil komt door wat je veranderde.</p>',
        wanneer:'je een proef bedenkt of een proef van een ander begrijpt.',
        maak:function(R){
          var P = R.kies(PROEF), vr = R.heel(0, 2), c = R.kies(P.gelijk), opties = [P.verander, P.meet, c, R.kies(P.gelijk.filter(function(g){ return g !== c; }))];
          var doel = [P.verander, P.meet, c][vr];
          var st = [kz('Wat verandert ' + P.wie + ' expres?', opties, P.verander, 'Kijk wat bij de groepjes of metingen steeds anders is: ' + P.verander + '.'),
            kz('Wat meet ' + P.zij + ' na afloop?', opties, P.meet, 'Kijk wat ' + P.zij + ' telt, meet of weegt: ' + P.meet + '.')];
          st.push(vr === 2 ? kz('Welke van deze dingen houdt ' + P.zij + ' gelijk? Dat is een constante factor.', [P.verander, P.meet, c], c, c + ' is bij alle metingen hetzelfde.')
            : kz('Welke is de ' + TRIO[vr] + '?', opties, doel, vr ? 'Wat je meet, is de afhankelijke variabele.' : 'Wat je expres verandert, is de onafhankelijke variabele.'));
          return eindKeuze({ vraag:'Wat is de ' + TRIO[vr] + '?', context:P.wie + ' onderzoekt ' + P.doel + '. ' + P.opzet, stappen:st });
        } },
      { id:'bi-ond-controle', naam:'De controlegroep', kort:'De controlegroep krijgt de factor die je onderzoekt niet; verder is alles gelijk',
        uit:'<p>Bij een proef vergelijk je groepen. De <b>proefgroep</b> krijgt wat je onderzoekt, bijvoorbeeld kunstmest of een medicijn.</p><p>De <b>controlegroep</b> krijgt dat <b>niet</b>, of krijgt een nep-pil. Verder is alles precies hetzelfde.</p><p>Door te vergelijken met de controlegroep weet je of een verschil echt komt door wat je onderzoekt.</p>',
        wanneer:'je moet zeggen welke groep in een proef de controlegroep is.',
        maak:function(R){
          var CTRL = [
            ['Een tuinder onderzoekt of kunstmest tomatenplanten beter laat groeien.', ['Groep A: tien tomatenplanten met kunstmest.', 'Groep B: tien tomatenplanten zonder kunstmest.'], 'kunstmest', 1],
            ['Een laborant onderzoekt of een nieuw middel bacteriën doodt.', ['Schaal A: bacteriën met het middel erop.', 'Schaal B: dezelfde bacteriën zonder het middel.'], 'het middel', 1],
            ['Een arts onderzoekt of een nieuw medicijn helpt tegen hoofdpijn.', ['Groep A krijgt een nep-pil zonder werkzame stof.', 'Groep B krijgt het echte medicijn.'], 'het medicijn', 0],
            ['Een leerling onderzoekt of zout water het kiemen van zaadjes remt.', ['Bakje A: 20 zaadjes met gewoon water.', 'Bakje B: 20 zaadjes met zout water.'], 'zout in het water', 0],
            ['Een tandarts onderzoekt of mondwater bacteriën doodt.', ['Schaal A: bacteriën uit de mond met mondwater.', 'Schaal B: dezelfde bacteriën met gewoon water.'], 'mondwater', 1],
            ['Een boer onderzoekt welke hoeveelheid kunstmest het beste werkt.', ['Veld A krijgt 0 kg kunstmest.', 'Veld B krijgt 5 kg kunstmest.', 'Veld C krijgt 10 kg kunstmest.'], 'kunstmest', 0],
            ['Een onderzoeker test of een vitaminepil verkoudheid voorkomt.', ['Groep A slikt elke dag een vitaminepil.', 'Groep B slikt elke dag een nep-pil die er precies hetzelfde uitziet.'], 'de vitamine', 1],
            ['Een leerling onderzoekt of muziek invloed heeft op de groei van planten.', ['Plant A staat in een kamer zonder muziek.', 'Plant B staat in een even grote kamer met muziek.'], 'muziek', 0] ];
          var c = R.kies(CTRL);
          var namen = c[1].map(function(x){ var m = /^(\w+ [A-C])/.exec(x); return m ? m[1] : x; });
          return eindKeuze({ vraag:'Welke is de controlegroep?', context:c[0] + '<br>' + c[1].join('<br>'),
            stappen:[
              kz('Wat wordt er onderzocht?', [c[2], 'de grootte van de groepen', 'het tijdstip'], c[2], 'Lees de eerste zin: er wordt onderzocht wat ' + c[2] + ' doet.'),
              kv('De controlegroep krijgt ' + c[2] + ' niet. Welke is dat?', namen, c[3], namen[c[3]] + ' krijgt ' + c[2] + ' niet' + (c[1].length > 2 ? ' (0 kg).' : '.')) ] });
        } },
      { id:'bi-ond-eerlijk', naam:'Is de proef eerlijk?', kort:'Een proef is eerlijk als er maar één ding verschilt tussen de groepen',
        uit:'<p>Een proef is <b>eerlijk</b> als er tussen de groepen maar <b>één ding</b> verschilt: het ding dat je onderzoekt.</p><p>Is er nog iets anders verschillend, dan weet je niet waardoor de uitkomst komt. Dan is de proef niet eerlijk.</p>',
        wanneer:'je een proef bedenkt of beoordeelt.',
        maak:function(R){
          var E = [
            ['Noor', 'of bananenschil goed is als mest', 'bananenschil', 'Plant A krijgt bananenschil in de grond en staat in de vensterbank. Plant B krijgt geen bananenschil en staat in een donkere schuur.', 'de plek: licht of donker', 'de soort pot'],
            ['Noor', 'of bananenschil goed is als mest', 'bananenschil', 'Plant A krijgt bananenschil in de grond, plant B niet. Ze staan naast elkaar in de vensterbank en krijgen evenveel water.', null, 'de plek: licht of donker'],
            ['Kees', 'of zaadjes sneller kiemen in de warmte', 'de temperatuur', 'Bakje A staat op 25 °C en krijgt elke dag water. Bakje B staat op 10 °C en krijgt geen water.', 'het water', 'het aantal zaadjes'],
            ['Kees', 'of zaadjes sneller kiemen in de warmte', 'de temperatuur', 'Bakje A staat op 25 °C, bakje B op 10 °C. Allebei hebben ze 20 zaadjes en krijgen ze elke dag 5 mL water.', null, 'het water'],
            ['Ilse', 'of muziek invloed heeft op haar concentratie', 'muziek', 'Ze maakt om 9 uur ’s ochtends een toets met muziek. Om 11 uur ’s avonds maakt ze een even moeilijke toets zonder muziek.', 'het tijdstip: uitgerust of moe', 'de moeilijkheid van de toets'],
            ['Ilse', 'of muziek invloed heeft op haar concentratie', 'muziek', 'Op twee ochtenden maakt ze om 9 uur een even moeilijke toets: een keer met muziek en een keer zonder.', null, 'het tijdstip: uitgerust of moe'],
            ['Ravi', 'of vissen meer eten als het water warmer is', 'de temperatuur van het water', 'Aquarium A is 24 °C en heeft 5 vissen. Aquarium B is 18 °C en heeft 15 vissen.', 'het aantal vissen', 'de soort vissen'],
            ['Ravi', 'of vissen meer eten als het water warmer is', 'de temperatuur van het water', 'Aquarium A is 24 °C en aquarium B is 18 °C. Allebei hebben ze 10 vissen van dezelfde soort en krijgen ze evenveel voer.', null, 'het aantal vissen'] ];
          var e = R.kies(E), eerlijk = !e[4], anders = eerlijk ? 'niets anders' : e[4];
          return eindKeuze({ vraag:'Is deze proef eerlijk?', context:e[0] + ' onderzoekt ' + e[1] + '. ' + e[3],
            stappen:[
              kz('Welk ding verandert ' + e[0] + ' expres?', [e[2], e[5], 'niets'], e[2], 'Lees wat er onderzocht wordt: ' + e[1] + '.'),
              kz('Wat is er verder nog anders tussen de groepen?', [e[4] || e[5], 'niets anders'].concat(eerlijk ? [] : [e[5]]), anders, eerlijk ? 'Lees goed: alles behalve ' + e[2] + ' is hetzelfde.' : 'Lees goed: ook ' + e[4] + ' is anders.'),
              kv('Is de proef eerlijk?', ['ja, er verschilt maar één ding', 'nee, er verschilt meer dan één ding'], eerlijk ? 0 : 1, eerlijk ? 'Alleen ' + e[2] + ' is anders: eerlijk.' : 'Ook ' + e[4] + ' is anders: dan weet je niet waardoor de uitkomst komt.') ] });
        } }
    ] });

  /* ---------- resultaten verwerken ---------- */
  var DIAGRAM = [
    ['Je meet elke week hoe lang een zonnebloem is.', 'de tijd in weken', 'de lengte van de zonnebloem', 1],
    ['Je telt welke vogelsoorten in de tuin komen: mus, merel, koolmees en ekster.', 'de vogelsoort', 'het aantal vogels', 0],
    ['Je meet elk uur hoeveel zuurstof er in een vijver zit.', 'de tijd in uren', 'de hoeveelheid zuurstof', 1],
    ['Je meet de hartslag van leerlingen bij voetbal, zwemmen en fietsen.', 'de sport', 'de hartslag', 0],
    ['Je telt hoeveel leerlingen blauwe, bruine of groene ogen hebben.', 'de oogkleur', 'het aantal leerlingen', 0],
    ['Je meet hoeveel bacteriën er na 0, 1, 2, 3 en 4 uur in een schaaltje zitten.', 'de tijd in uren', 'het aantal bacteriën', 1],
    ['Je meet hoeveel belletjes waterpest maakt bij een lamp op 10, 20, 30 en 40 cm.', 'de afstand van de lamp', 'het aantal belletjes', 1],
    ['Je weegt meelwormen die havermout, zemelen of brood kregen.', 'de soort voer', 'het gewicht', 0],
    ['Je meet bij welke temperatuur (10, 20, 30, 40 °C) gist het meeste gas maakt.', 'de temperatuur', 'de hoeveelheid gas', 1],
    ['Je telt hoeveel pissebedden er in een vochtige en in een droge bak zitten.', 'vochtig of droog', 'het aantal pissebedden', 0],
    ['Je meet de lengte van kinderen van 4, 6, 8, 10 en 12 jaar.', 'de leeftijd', 'de lengte', 1],
    ['Je telt het aantal paardenbloemen in een weiland, een bos en een tuin.', 'de plek', 'het aantal paardenbloemen', 0] ];
  G.push({ groep:{ id:'bi-resultaat', niveau:'onderbouw', domein:'onderzoek', naam:'Resultaten verwerken',
      uit:'De resultaten van een proef zet je in een tabel en een diagram. Je kiest de assen en het soort diagram, rekent het gemiddelde uit en trekt een conclusie uit een tabel of een grafiek.' },
    doelen:[
      { id:'bi-ond-assen', naam:'Wat komt op welke as?', kort:'Wat je verandert op de x-as, wat je meet op de y-as',
        uit:'<p>Een diagram heeft twee assen. De <b>x-as</b> loopt van links naar rechts, de <b>y-as</b> van onder naar boven.</p><p>Wat je <b>verandert</b> (de onafhankelijke variabele) zet je op de <b>x-as</b>. Wat je <b>meet</b> (de afhankelijke variabele) zet je op de <b>y-as</b>.</p>',
        wanneer:'je de resultaten van een proef in een diagram zet.',
        maak:function(R){
          var P = R.kies(PROEF), xas = R.heel(0, 1), opties = [P.verander, P.meet, P.gelijk[0]];
          return eindKeuze({ vraag:'Wat zet je op de ' + (xas ? 'x-as' : 'y-as') + '?', context:P.wie + ' onderzoekt ' + P.doel + '. ' + P.opzet,
            stappen:[
              kz('Wat verandert ' + P.wie + ' expres?', opties, P.verander, 'Kijk wat bij elke meting anders is: ' + P.verander + '.'),
              kz('Wat meet ' + P.zij + '?', opties, P.meet, 'Kijk wat ' + P.zij + ' telt of meet: ' + P.meet + '.'),
              kz('Wat zet je op de ' + (xas ? 'x-as' : 'y-as') + '?', opties, xas ? P.verander : P.meet, xas ? 'Op de x-as komt wat je verandert.' : 'Op de y-as komt wat je meet.') ] });
        } },
      { id:'bi-ond-diagram', naam:'Lijndiagram of staafdiagram?', kort:'Doorlopende getallen op de x-as: lijndiagram; losse groepen: staafdiagram',
        uit:'<p>Kijk wat er op de <b>x-as</b> komt.</p><p>Zijn dat <b>getallen die doorlopen</b>, zoals tijd, temperatuur of afstand? Dan kunnen er ook waarden tussen liggen. Kies een <b>lijndiagram</b>.</p><p>Zijn het <b>losse groepen</b>, zoals soorten, kleuren of plekken? Daartussen ligt niets. Kies een <b>staafdiagram</b>.</p>',
        wanneer:'je moet kiezen hoe je je resultaten tekent.',
        maak:function(R){
          var d = R.kies(DIAGRAM), alle = DIAGRAM.map(function(x){ return x[1]; }).filter(function(x){ return x !== d[1]; });
          return eindKeuze({ vraag:'Welk diagram kies je?', context:d[0],
            stappen:[
              kz('Wat komt op de x-as?', [d[1], d[2], R.kies(alle)], d[1], 'Op de x-as komt wat je zelf kiest of verandert: ' + d[1] + '.'),
              kv('Wat voor waarden zijn dat?', ['getallen die doorlopen, zoals tijd of temperatuur', 'losse groepen of soorten'], d[3] ? 0 : 1, d[3] ? 'Tussen de waarden kunnen andere waarden liggen.' : 'Het zijn losse groepen: daar ligt niets tussen.'),
              kv('Welk diagram kies je?', ['lijndiagram', 'staafdiagram'], d[3] ? 0 : 1, d[3] ? 'Doorlopende getallen: een lijndiagram.' : 'Losse groepen: een staafdiagram.') ] });
        } },
      { id:'bi-ond-gem', naam:'Het gemiddelde van herhaalde metingen', kort:'Tel de metingen op en deel door het aantal metingen',
        uit:'<p>Je doet een meting vaak een paar keer. Dat maakt je onderzoek <b>betrouwbaarder</b>: een toevallige uitschieter valt minder op.</p><p>Je rekent dan het <b>gemiddelde</b> uit: tel alle metingen op en deel door het aantal metingen. Rond af op één decimaal.</p>',
        wanneer:'je een proef herhaald hebt en één uitkomst wilt noemen.',
        maak:function(R){
          var C = [['de lengte van een plantje', 'cm', 8, 30, 3], ['de reactietijd van een leerling', 'honderdste seconde', 18, 35, 4], ['het aantal belletjes per minuut', 'belletjes', 10, 40, 4], ['de hartslag na het sporten', 'slagen per minuut', 110, 160, 6], ['het gewicht van een meelworm', 'mg', 90, 150, 8]];
          var c = R.kies(C), n = R.kies([3, 3, 4, 5]), mid = R.heel(c[2], c[3]), m = []; for (var i = 0; i < n; i++) m.push(mid + R.heel(-c[4], c[4]));
          var s = som(m), g = rnd(s / n, 1);
          return { vraag:'Wat is het gemiddelde?', context:'Je meet ' + n + ' keer ' + c[0] + ': ' + m.join(', ') + ' ' + c[1] + '. Rond af op één decimaal.', eenheid:c[1],
            stappen:[
              { tekst:'Tel de metingen op: ' + m.join(' + ') + ' = …', antwoord:nv(s), hint:'Samen is dat ' + s + '.' },
              { tekst:'Deel door het aantal metingen (' + n + '). Het gemiddelde is …', antwoord:nv(g), eenheid:c[1], hint:s + ' : ' + n + ' = ' + tn(rnd(s / n, 4)) + (rnd(s / n, 4) !== g ? ', afgerond ' + tn(g) : '') + '.', fout:F(s, 'Deel de som nog door ' + n + '.') } ] };
        } },
      { id:'bi-ond-tabel', naam:'Een conclusie uit een tabel', kort:'Kijk wat er met de meting gebeurt als de waarde in de bovenste rij groter wordt',
        uit:'<p>In de tabel staat bovenaan wat je veranderde, en eronder wat je mat.</p><p>Lees de tabel van <b>links naar rechts</b>. Wordt de meting steeds groter, steeds kleiner, of blijft hij ongeveer gelijk?</p><p>Je conclusie zeg je dan zo: "Hoe ... , hoe ...". Of: "... heeft geen invloed op ...".</p>',
        wanneer:'je bij een proef een conclusie moet trekken.',
        maak:function(R){
          var P = R.kies(PROEF), ys = metingen(R, P), trend = P.dir > 0 ? 'op' : P.dir < 0 ? 'af' : 'geen', b = tabelVan(P, ys);
          return eindKeuze({ vraag:'Welke conclusie past bij de tabel?', context:P.wie + ' onderzoekt ' + P.doel + '.', beeld:b, zelfBeeld:b,
            stappen:[
              kv('Lees de onderste rij van links naar rechts. Wat gebeurt er met ' + P.meet + '?', ['het wordt groter', 'het wordt kleiner', 'het blijft ongeveer gelijk'], { op:0, af:1, geen:2 }[trend], 'Lees de onderste rij van links naar rechts: ' + ys.map(tn).join(', ') + '.'),
              kz('Welke conclusie past bij de tabel?', [P.c.op, P.c.af, P.c.geen], P.c[trend], 'Kies de zin die zegt wat je in de onderste rij zag.') ] });
        } },
      { id:'bi-ond-grafiek', naam:'Een grafiek aflezen', kort:'Ga vanaf de x-as recht omhoog naar de lijn en dan opzij naar de y-as',
        uit:'<p>Wil je weten hoe groot de meting was bij een bepaalde waarde? Zoek die waarde op de <b>x-as</b>. Ga recht <b>omhoog</b> tot je bij de lijn bent. Ga dan recht naar <b>links</b> en lees af op de <b>y-as</b>.</p><p>Vergelijk je twee punten, dan zie je of de lijn stijgt of daalt. Dat helpt je bij de conclusie.</p>',
        wanneer:'je resultaten uit een lijndiagram wilt halen.',
        maak:function(R){
          var P = R.kies(PROEF.filter(function(x){ return x.dir; })), ys = metingen(R, P), i = R.heel(0, 1), j = R.heel(2, 3), stijgt = ys[j] > ys[i];
          var b = function(n){ return lijnGraf(P.xs, ys, P.xn, P.yn, P.st, { nadruk:n === 0 ? [] : n === 1 ? [i] : [i, j] }); };
          return eindKeuze({ vraag:'Welke conclusie past bij de grafiek?', context:P.wie + ' onderzoekt ' + P.doel + '.', beeld:b, zelfBeeld:b(0),
            stappen:[
              { tekst:'Lees af: welke waarde hoort bij ' + tn(P.xs[i]) + ' op de x-as?', antwoord:nv(ys[i]), hint:'Ga bij ' + tn(P.xs[i]) + ' omhoog naar de lijn en dan naar links: ' + tn(ys[i]) + '.' },
              { tekst:'En bij ' + tn(P.xs[j]) + '?', antwoord:nv(ys[j]), hint:'Ga bij ' + tn(P.xs[j]) + ' omhoog naar de lijn en dan naar links: ' + tn(ys[j]) + '.' },
              kz('Welke conclusie past bij de grafiek?', [P.c.op, P.c.af, P.c.geen], stijgt ? P.c.op : P.c.af, 'De lijn ' + (stijgt ? 'stijgt' : 'daalt') + ': van ' + tn(ys[i]) + ' naar ' + tn(ys[j]) + '.') ] });
        } }
    ] });

  /* ---------- bovenbouw: grafieken en tabellen uit onderzoek ---------- */
  G.push({ groep:{ id:'bi-ondboven', niveau:'bovenbouw', domein:'onderzoek', naam:'Rekenen met onderzoeksresultaten',
      uit:'Het optimum aflezen, de gemiddelde toename per tijdseenheid uitrekenen en de procentuele verandering bepalen, zoals bij examenvragen over proeven.' },
    doelen:[
      { id:'bi-ond-optimum', naam:'Het optimum aflezen', kort:'Het optimum is de waarde op de x-as waar de lijn het hoogst is',
        uit:'<p>Veel processen in een organisme werken het best bij één bepaalde temperatuur of zuurgraad (pH). Dat is het <b>optimum</b>.</p><p>In de grafiek stijgt de lijn eerst en daalt hij daarna. Zoek het <b>hoogste punt</b> van de lijn. Ga recht naar beneden naar de x-as: daar lees je het optimum af.</p>',
        wanneer:'je bij een enzym of een plant wilt weten bij welke omstandigheid het best werkt.',
        maak:function(R){
          var temp = R.heel(0, 1), xs = temp ? [0, 10, 20, 30, 40, 50, 60] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
          var top = R.heel(2, xs.length - 3), st = temp ? 5 : 2, ys = xs.map(function(x, i){ return Math.max(0, (temp ? 40 : 20) - Math.abs(i - top) * (temp ? R.heel(2, 3) * 5 : R.heel(2, 3) * 2)); });
          ys[top] = (temp ? 40 : 20) + st;
          var wat = temp ? R.kies([['een enzym uit de maag van een dier', 'de activiteit van het enzym'], ['een enzym uit een bacterie', 'de activiteit van het enzym'], ['een enzym uit een schimmel', 'de activiteit van het enzym'], ['een enzym uit een plant', 'de activiteit van het enzym'], ['de fotosynthese van een plant', 'de zuurstofproductie']])
            : R.kies([['een enzym uit het darmkanaal', 'de activiteit van het enzym'], ['een enzym uit een plant', 'de activiteit van het enzym'], ['een enzym uit een bacterie', 'de activiteit van het enzym'], ['een enzym uit een schimmel', 'de activiteit van het enzym']]);
          var xn = temp ? 'temperatuur (°C)' : 'pH', b = function(n){ return lijnGraf(xs, ys, xn, /fotosynthese/.test(wat[0]) ? 'zuurstofproductie' : 'activiteit', st, { nadruk:n >= 1 ? [top] : [] }); };
          return { vraag:'Wat is het optimum?', context:'De grafiek laat ' + wat[1] + ' zien bij verschillende ' + (temp ? 'temperaturen' : 'pH-waarden') + '. Het gaat om ' + wat[0] + '.', beeld:b, zelfBeeld:b(0), eenheid:temp ? '°C' : '',
            stappen:[
              { tekst:'Wat is de hoogste waarde op de y-as die de lijn bereikt?', antwoord:nv(ys[top]), hint:'Zoek het hoogste punt van de lijn en lees links af: ' + ys[top] + '.' },
              { tekst:'Bij welke ' + (temp ? 'temperatuur' : 'pH') + ' is dat? Dat is het optimum.', antwoord:nv(xs[top]), eenheid:temp ? '°C' : '', hint:'Ga vanaf het hoogste punt recht naar beneden: ' + (temp ? xs[top] + ' °C' : 'pH ' + xs[top]) + '.', fout:F(ys[top], 'Dat is de hoogte van de lijn. Het optimum lees je af op de x-as.') } ] };
        } },
      { id:'bi-ond-toename', naam:'De gemiddelde toename per dag', kort:'Toename gedeeld door het aantal dagen ertussen',
        uit:'<p>Wil je weten hoe snel iets groeit? Reken de <b>gemiddelde toename</b> per dag (of per minuut) uit.</p><p>Neem de waarde aan het eind <b>min</b> de waarde aan het begin. Deel door de <b>tijd ertussen</b>.</p><p>Voorbeeld: op dag 2 is een plant 4 cm, op dag 10 is hij 20 cm. De toename is 16 cm in 8 dagen: 2 cm per dag.</p>',
        wanneer:'je bij een groeiproef of een tabel de snelheid van een verandering wilt weten.',
        maak:function(R){
          var dagen = [0, 2, 4, 6, 8, 10, 12], v = R.kies([0.5, 1, 1.5, 2, 2.5, 3]), y0 = R.heel(2, 8), ys = dagen.map(function(d, i){ return rnd(y0 + v * d + (i ? R.kies([0, 0.5, -0.5]) : 0), 1); });
          var a = R.heel(0, 4), b = R.heel(a + 2, 6);
          var dy = rnd(ys[b] - ys[a], 1), dt = dagen[b] - dagen[a], g = rnd(dy / dt, 2);
          if (rnd(dy / dt, 4) !== g) return this.maak(R);
          var tab = T.teken.tabel([['Dag'].concat(dagen.map(tn)), ['Lengte (cm)'].concat(ys.map(tn))], { zijkop:true, nadruk:[[1, a + 1], [1, b + 1]] });
          return { vraag:'Hoeveel cm groeit de plant gemiddeld per dag tussen dag ' + dagen[a] + ' en dag ' + dagen[b] + '?', context:'Een leerling meet om de twee dagen de lengte van een plant.', beeld:tab, zelfBeeld:tab, eenheid:'cm per dag',
            stappen:[
              { tekst:'Hoeveel cm groeide de plant tussen dag ' + dagen[a] + ' en dag ' + dagen[b] + '?', antwoord:nv(dy), eenheid:'cm', hint:tn(ys[b]) + ' ' + MIN + ' ' + tn(ys[a]) + ' = ' + tn(dy) + ' cm.' },
              { tekst:'Hoeveel dagen zitten ertussen?', antwoord:nv(dt), eenheid:'dagen', hint:dagen[b] + ' ' + MIN + ' ' + dagen[a] + ' = ' + dt + '.' },
              { tekst:'Deel de groei door het aantal dagen. Per dag is dat …', antwoord:nv(g), eenheid:'cm per dag', hint:tn(dy) + ' : ' + dt + ' = ' + tn(g) + '.', fout:F(rnd(dy / (b - a), 4), 'Deel door het aantal dagen, niet door het aantal metingen.') } ] };
        } },
      { id:'bi-ond-procent', naam:'De procentuele verandering', kort:'Verandering gedeeld door de beginwaarde, keer 100',
        uit:'<p>Bij een proef vergelijk je vaak hoeveel procent iets veranderd is. Zo kun je stukjes van verschillende grootte eerlijk vergelijken.</p><p>Reken: <b>verandering : beginwaarde × 100%</b>. De verandering is eind min begin, zonder min-teken als je vraagt hoeveel procent iets is af- of toegenomen.</p><p>Voorbeeld: een stukje aardappel weegt eerst 10,0 g en daarna 8,5 g. Het is 1,5 g lichter. 1,5 : 10,0 = 0,15. Dat is <b>15%</b> afname.</p>',
        wanneer:'je bij een osmoseproef of groeiproef wilt vergelijken hoeveel iets veranderd is.',
        maak:function(R){
          var begin, p, eind, af;
          do { begin = R.kies([4, 5, 8, 10, 12.5, 16, 20, 25]); p = R.kies([2, 4, 5, 6, 8, 10, 12, 15, 20, 25]); af = R.heel(0, 1); eind = begin * (1 + (af ? -p : p) / 100); } while (Math.abs(eind * 10 - Math.round(eind * 10)) > 1e-6);
          eind = rnd(eind, 1);
          var vl = R.kies(af ? ['een sterke zoutoplossing', 'een sterke suikeroplossing'] : ['kraanwater', 'gedestilleerd water']), d = rnd(Math.abs(eind - begin), 2), f = rnd(d / begin, 4);
          var dv = T.toon(begin, { dec:1, vast:true }), ev = T.toon(eind, { dec:1, vast:true });
          return { vraag:'Met hoeveel procent is de massa ' + (af ? 'afgenomen' : 'toegenomen') + '?', context:'Een stukje aardappel weegt ' + dv + ' g. Het ligt een nacht in ' + vl + '. Daarna weegt het ' + ev + ' g.', eenheid:'%',
            stappen:[
              { tekst:'Hoeveel gram is het stukje ' + (af ? 'lichter' : 'zwaarder') + ' geworden?', antwoord:nv(d), eenheid:'g', hint:(af ? dv + ' ' + MIN + ' ' + ev : ev + ' ' + MIN + ' ' + dv) + ' = ' + tn(d) + ' g.' },
              { tekst:'Deel door de beginmassa. Dat is …', antwoord:nv(f), hint:tn(d) + ' : ' + tn(begin) + ' = ' + tn(f) + '.', fout:F(rnd(d / eind, 4), 'Deel door de beginmassa (' + dv + ' g), niet door de eindmassa.') },
              { tekst:'Keer 100. De verandering is …', antwoord:pv(p), eenheid:'%', hint:tn(f) + ' × 100 = ' + p + '%.' } ] };
        } }
    ] });

  LEERROUTE.voeg('biologie', G);
})();
