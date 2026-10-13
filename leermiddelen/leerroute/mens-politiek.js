/* De leerroute mens en maatschappij, politiek: de opkomst, de kiesdeler en volle zetels in de
   Tweede Kamer, een meerderheid (76 van de 150, in de Eerste Kamer 38 van de 75), een coalitie
   met een meerderheid, restzetels met de methode van de grootste gemiddelden, de voorkeurdrempel,
   de trias politica en hoe een wet tot stand komt. Alle partijen en uitslagen zijn verzonnen.
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var T = LEERROUTE.R, X = '×', MIN = '−', G = [];

  /* ---------- hulpjes ---------- */
  function tn(x){ return T.toon(x); }
  function tp(x){ return T.toon(x, { punt:true }); }
  function uniek(l){ var u = []; l.forEach(function(x){ if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function aant(x){ return uniek([tp(x), String(x)]); }
  function r1(x){ return Math.round(x * 10 + 1e-9) / 10; }
  function r2(x){ return Math.round(x * 100 + 1e-9) / 100; }
  function pc(p){ var t = tn(p); return [t, t + '%', t + ' %']; }
  function F(){ var o = {}; for (var i = 0; i + 1 < arguments.length; i += 2) if (arguments[i] != null) o[String(arguments[i]).toLowerCase()] = arguments[i + 1]; return o; }
  function FA(x, tekst, o){ o = o || {}; aant(x).forEach(function(k){ o[k.toLowerCase()] = tekst; }); return o; }
  function K(R, t, goed, fout, hint, extra){
    var lijst = [goed], gezien = {}; gezien[String(goed).toLowerCase()] = 1;
    fout.forEach(function(f){ if (f == null) return; var k = String(f).toLowerCase(); if (!gezien[k]){ gezien[k] = 1; lijst.push(f); } });
    var opties = R.hussel(lijst), s = { tekst:t, opties:opties, goed:opties.indexOf(goed), hint:hint };
    if (extra){ if (extra.waarom) s.waarom = extra.waarom; if (extra.fout){ s.fout = {}; for (var k in extra.fout) s.fout[k.toLowerCase()] = extra.fout[k]; } }
    return s;
  }
  function V(t, opties, goed, hint){ return { tekst:t, opties:opties.slice(), goed:opties.indexOf(goed), hint:hint }; }
  function OP(o){ var s = o.stappen[o.stappen.length - 1]; if (s.opties){ o.opties = s.opties; o.goed = s.goed; } return o; }
  /* een compacte tabel die ook op een telefoon past: { kop, zijkop, nadruk:[[r,c]], html } */
  function ktabel(rijen, o){
    o = o || {}; var nad = {}; (o.nadruk || []).forEach(function(q){ nad[q[0] + ',' + q[1]] = 1; });
    return '<table class="lr-tabel" style="font-size:.78rem;border-spacing:2px">' + rijen.map(function(r, ri){
      return '<tr>' + r.map(function(c, ci){ var t = (o.kop && ri === 0) || (o.zijkop && ci === 0) ? 'th' : 'td';
        return '<' + t + ' style="padding:4px 5px;min-width:0"' + (nad[ri + ',' + ci] ? ' class="nadruk"' : '') + '>' + (c === '?' ? '<b class="lr-vraagt">?</b>' : (o.html ? c : T.schoon(c))) + '</' + t + '>'; }).join('') + '</tr>';
    }).join('') + '</table>';
  }
  function hoofd(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
  function tabel(rijen, o){ o = o || {}; o.kop = true; return ktabel(rijen, o); }

  var PARTIJ = ['Samen Sterk', 'Nieuw Begin', 'Groene Golf', 'Vrijheidslijst', 'Sociale Unie', 'Verbond Nederland', 'Liberale Lijst', 'Dorp en Stad', 'Jong Nederland', 'Recht door Zee', 'Toekomst Nu', 'Ouderenbond'];
  var GEMEENTE = ['Zandhoven', 'Bergeling', 'Waterdam', 'Lindewijk', 'Oosterhoek', 'Veldmeer', 'Kreekdorp', 'Heidelo'];

  /* ---------- de zetelverdeling ----------
     kiesdeler = stemmen op alle partijen samen : 150; volle zetels = stemmen : kiesdeler, naar beneden;
     restzetels een voor een naar het grootste gemiddelde stemmen : (zetels + 1). Alleen partijen
     met minstens een volle zetel doen mee; in deze opgaven heeft elke partij die. */
  function uitslag(R, n, minRest){
    for (var poging = 0; poging < 500; poging++){
      var k = R.heel(600, 720) * 100, tot = 150 * k, delen = [], som = 0, i;
      for (i = 0; i < n; i++){ var d = R.heel(10, 60); delen.push(d); som += d; }
      var st = delen.map(function(d){ return Math.round(tot * d / som); }), verschil = tot - st.reduce(function(a, b){ return a + b; }, 0);
      st[0] += verschil;
      var vol = st.map(function(v){ return Math.floor(v / k); });
      if (vol.some(function(z){ return z < 1; })) continue;
      var rest = 150 - vol.reduce(function(a, b){ return a + b; }, 0);
      if (rest < minRest) continue;
      /* restzetels een voor een */
      var z = vol.slice(), volg = [], gems = [], ok = true;
      for (var r = 0; r < rest; r++){
        var g = st.map(function(v, j){ return v / (z[j] + 1); }), best = 0;
        for (i = 1; i < n; i++) if (g[i] > g[best]) best = i;
        /* geen gelijke of bijna gelijke gemiddelden: dat zou loten worden */
        var gs = g.slice().sort(function(a, b){ return b - a; }); if (gs[0] - gs[1] < 3) { ok = false; break; }
        gems.push(g); volg.push(best); z[best]++;
      }
      if (!ok) continue;
      var namen = R.hussel(PARTIJ).slice(0, n);
      return { k:k, tot:tot, st:st, vol:vol, rest:rest, volg:volg, gems:gems, eind:z, namen:namen };
    }
    return null;
  }
  function gemTxt(x){ return tp(Math.round(x)); }

  /* ================= 1 VERKIEZINGEN EN ZETELS (onderbouw) ================= */
  G.push({ groep:{ id:'mm-zetels', niveau:'onderbouw', domein:'politiek', naam:'Verkiezingen en zetels',
      uit:'Rekenen met een verkiezingsuitslag: de opkomst, de kiesdeler, de volle zetels van een partij en of een coalitie een meerderheid heeft.' },
    doelen:[
      { id:'mm-opkomst', naam:'Het opkomstpercentage', kort:'Deel het aantal kiezers dat gestemd heeft door het aantal kiesgerechtigden en doe keer 100',
        uit:'<p><b>Kiesgerechtigden</b> zijn alle mensen die mogen stemmen. Niet iedereen gaat ook echt stemmen.</p><p>De <b>opkomst</b> is het deel van de kiesgerechtigden dat gestemd heeft, in procenten.</p><p>opkomst = gestemd : kiesgerechtigden ' + X + ' 100. In een dorp met 8.000 kiesgerechtigden stemmen 5.200 mensen: 5.200 : 8.000 ' + X + ' 100 = 65%.</p>',
        wanneer:'je wilt weten hoeveel mensen er bij een verkiezing gingen stemmen.',
        maak:function(R){
          var kg = R.heel(80, 1200) * 50, p = R.heel(400, 850) / 10, g = Math.round(kg * p / 100), uit = r1(g / kg * 100), gm = R.kies(GEMEENTE);
          return { context:'In de gemeente ' + gm + ' mogen ' + tp(kg) + ' mensen stemmen voor de gemeenteraad. ' + tp(g) + ' mensen hebben gestemd. Wat is de opkomst? Rond af op één decimaal.', vraag:'Opkomst in ' + gm, eenheid:'%',
            stappen:[
              { tekst:'Delen: ' + tp(g) + ' : ' + tp(kg) + ' = (rond af op drie decimalen)', antwoord:[tn(Math.round(g / kg * 1000) / 1000)], hint:'Het aantal dat gestemd heeft, gedeeld door het aantal kiesgerechtigden.', fout:F(tn(Math.round(kg / g * 1000) / 1000), 'Je deelde andersom. Het aantal dat stemde moet boven.') },
              { tekst:'Keer 100, afgerond op één decimaal: de opkomst is', antwoord:pc(uit).concat(pc(Math.round(g / kg * 1000) / 10)), eenheid:'%', hint:'De komma gaat twee plaatsen naar rechts. Rond af op één decimaal.' } ] };
        } },
      { id:'mm-kiesdeler', naam:'De kiesdeler', kort:'Deel alle stemmen op de partijen samen door 150, het aantal zetels in de Tweede Kamer',
        uit:'<p>De Tweede Kamer heeft <b>150 zetels</b>. Hoeveel stemmen kost één zetel? Dat is de <b>kiesdeler</b>.</p><p>kiesdeler = alle stemmen op de partijen samen : 150</p><p>Zijn er 10.500.000 stemmen uitgebracht op de partijen, dan is de kiesdeler 10.500.000 : 150 = 70.000. Voor elke 70.000 stemmen krijgt een partij een zetel.</p>',
        wanneer:'je wilt uitrekenen hoeveel zetels een partij krijgt.',
        maak:function(R){
          var k = R.heel(600, 720) * 100, tot = 150 * k;
          return { context:'Bij de verkiezingen voor de Tweede Kamer zijn er ' + tp(tot) + ' stemmen uitgebracht op de partijen. Wat is de kiesdeler?', vraag:'Kiesdeler bij ' + tp(tot) + ' stemmen',
            stappen:[
              { tekst:'Hoeveel zetels heeft de Tweede Kamer?', antwoord:'150', hint:'De Tweede Kamer heeft 150 leden.', fout:F('75', 'Dat is de Eerste Kamer. De Tweede Kamer heeft 150 zetels.') },
              { tekst:'Kiesdeler: ' + tp(tot) + ' : 150 =', antwoord:aant(k), hint:'Deel eerst door 10 en dan door 15, of reken ' + tp(tot / 1000) + ' : 150 en doe dan keer 1000.' } ] };
        } },
      { id:'mm-volle-zetels', naam:'Volle zetels van een partij', kort:'Deel de stemmen van de partij door de kiesdeler en rond naar beneden af',
        uit:'<p>Hoeveel zetels krijgt een partij? Deel het aantal stemmen op de partij door de <b>kiesdeler</b>.</p><p>Komt er een kommagetal uit, dan rond je <b>naar beneden</b> af. Dat zijn de <b>volle zetels</b>. Wat overblijft, telt mee bij de verdeling van de restzetels.</p><p>Een partij met 1.500.000 stemmen, kiesdeler 70.000: 1.500.000 : 70.000 = 21,4. Dat zijn <b>21 volle zetels</b>.</p>',
        wanneer:'je de uitslag van een partij in zetels wilt omrekenen.',
        maak:function(R){
          var k = R.heel(600, 720) * 100, z = R.heel(1, 40), v = Math.round(k * (z + R.heel(5, 95) / 100)), q = v / k, p = R.kies(PARTIJ);
          return { context:'De kiesdeler is ' + tp(k) + '. De partij ' + p + ' krijgt ' + tp(v) + ' stemmen. Hoeveel volle zetels krijgt ' + p + '?', vraag:p + ': ' + tp(v) + ' stemmen', eenheid:'zetels',
            stappen:[
              { tekst:'Delen: ' + tp(v) + ' : ' + tp(k) + ' = (rond af op twee decimalen)', antwoord:[tn(r2(q))], hint:'Stemmen van de partij gedeeld door de kiesdeler.' },
              { tekst:'Naar beneden afgerond: hoeveel volle zetels?', antwoord:aant(z), hint:'Alleen het hele getal voor de komma telt: ' + z + '.', fout:F(String(z + 1), 'Je rondde naar boven af. Volle zetels rond je altijd naar beneden af.') } ] };
        } },
      { id:'mm-meerderheid', naam:'Heeft de coalitie een meerderheid?', kort:'Tel de zetels van de partijen op. In de Tweede Kamer heb je er 76 nodig, in de Eerste Kamer 38',
        uit:'<p>Een <b>coalitie</b> is een groep partijen die samen gaan regeren. Ze willen een <b>meerderheid</b>: meer dan de helft van de zetels.</p><p>De Tweede Kamer heeft 150 zetels. De helft is 75, dus een meerderheid is <b>76 zetels</b>. De Eerste Kamer heeft 75 zetels: een meerderheid is <b>38</b>.</p><p>Tel de zetels van de partijen op en kijk of je aan 76 (of 38) komt.</p>',
        wanneer:'je wilt weten of partijen samen genoeg zetels hebben om wetten aan te nemen.',
        maak:function(R){
          var ek = R.heel(0, 3) === 0, tot = ek ? 75 : 150, nodig = ek ? 38 : 76, n = R.heel(2, 4), namen = R.hussel(PARTIJ).slice(0, n), z, som;
          do { z = namen.map(function(){ return R.heel(ek ? 4 : 8, ek ? 20 : 40); }); som = z.reduce(function(a, b){ return a + b; }, 0); } while (Math.abs(som - nodig) > (ek ? 8 : 15) || som > tot - 5);
          var ja = som >= nodig, kamer = ek ? 'de Eerste Kamer' : 'de Tweede Kamer';
          var b = tabel([['partij', 'zetels in ' + kamer]].concat(namen.map(function(p, i){ return [p, String(z[i])]; })));
          return OP({ context:'Deze partijen willen samen een coalitie vormen. Hebben ze een meerderheid in ' + kamer + '?', vraag:namen.join(', ') + ' (' + (ek ? 'EK' : 'TK') + ')', vraagHtml:'Meerderheid in ' + kamer + '?', beeld:b, zelfBeeld:b,
            stappen:[
              { tekst:'Zetels samen: ' + z.join(' + ') + ' =', antwoord:aant(som), hint:'Tel alle zetels van de coalitie op.' },
              { tekst:'Hoeveel zetels heb je nodig voor een meerderheid in ' + kamer + '?', antwoord:String(nodig), hint:kamer + ' heeft ' + tot + ' zetels. Meer dan de helft is ' + nodig + '.', fout:F(String(tot / 2), 'Precies de helft is geen meerderheid. Je hebt er één meer nodig.', String(Math.floor(tot / 2)), 'Dat is niet meer dan de helft. Je hebt er ' + nodig + ' nodig.') },
              V('Dus de coalitie heeft', ['een meerderheid', 'geen meerderheid'], ja ? 'een meerderheid' : 'geen meerderheid', som + (ja ? ' is ' + nodig + ' of meer.' : ' is minder dan ' + nodig + '.')) ] });
        } },
      { id:'mm-coalitie', naam:'Welke coalitie heeft een meerderheid?', kort:'Tel bij elke combinatie de zetels op en kijk welke aan 76 komt',
        uit:'<p>Na de verkiezingen zoeken partijen samen een meerderheid. Vaak zijn er een paar mogelijke combinaties.</p><p>Tel bij <b>elke combinatie</b> de zetels van de partijen op. De combinatie met <b>76 of meer</b> zetels heeft een meerderheid in de Tweede Kamer.</p>',
        wanneer:'je na een verkiezing wilt zien welke coalities mogelijk zijn.',
        maak:function(R){
          for (var t = 0; t < 500; t++){
            var n = 7, namen = R.hussel(PARTIJ).slice(0, n), z = [], rest = 150;
            for (var i = 0; i < n - 1; i++){ var x = R.heel(4, Math.min(38, rest - (n - 1 - i) * 3)); z.push(x); rest -= x; }
            z.push(rest); if (rest < 2 || rest > 40) continue;
            var combis = [], idx = [0, 1, 2, 3, 4, 5, 6];
            for (var c = 0; c < 30 && combis.length < 8; c++){ var k = R.hussel(idx).slice(0, R.heel(2, 3)).sort(); var key = k.join(); if (!combis.some(function(x){ return x.join() === key; })) combis.push(k); }
            var som = function(k){ return k.reduce(function(a, j){ return a + z[j]; }, 0); };
            var goedL = combis.filter(function(k){ return som(k) >= 76; }), foutL = combis.filter(function(k){ return som(k) < 76 && som(k) >= 55; });
            if (goedL.length && foutL.length >= 2){
              var keus = [goedL[0], foutL[0], foutL[1]], naam = function(k){ return k.map(function(j){ return namen[j]; }).join(' + '); };
              var b = tabel([['partij', 'zetels']].concat(namen.map(function(p, j){ return [p, String(z[j])]; })));
              var vol = R.hussel(keus);
              return OP({ context:'De uitslag van de verkiezingen voor de Tweede Kamer. Welke combinatie heeft een meerderheid?', vraag:vol.map(naam).join(' / '), vraagHtml:'Welke coalitie heeft 76 zetels of meer?', beeld:b, zelfBeeld:b,
                stappen:vol.map(function(k){ return { tekst:naam(k) + ': ' + k.map(function(j){ return z[j]; }).join(' + ') + ' =', antwoord:aant(som(k)), hint:'Zoek de zetels van deze partijen in de tabel en tel ze op.' }; })
                  .concat([K(R, 'Welke combinatie heeft een meerderheid?', naam(keus[0]), [naam(keus[1]), naam(keus[2])], 'De combinatie met 76 zetels of meer.')]) });
            }
          }
          return null;
        } }
    ] });

  /* ================= 2 RESTZETELS EN VOORKEURSTEMMEN (bovenbouw) ================= */
  G.push({ groep:{ id:'mm-restzetels', niveau:'bovenbouw', domein:'politiek', naam:'Restzetels en voorkeurstemmen',
      uit:'Na de volle zetels blijven er zetels over. Die verdeel je met de methode van de grootste gemiddelden, zoals bij de Tweede Kamer. En: wanneer word je gekozen met voorkeurstemmen?' },
    doelen:[
      { id:'mm-restzetel-een', naam:'Eén restzetel verdelen', kort:'Reken per partij stemmen : (volle zetels + 1) uit. Het grootste gemiddelde krijgt de restzetel',
        uit:'<p>Tel je de volle zetels van alle partijen op, dan kom je meestal niet aan 150. De zetels die over zijn, heten <b>restzetels</b>.</p><p>De Tweede Kamer verdeelt ze met de methode van de <b>grootste gemiddelden</b>. Reken voor elke partij uit: stemmen : (volle zetels + 1). Dat is het gemiddelde aantal stemmen per zetel als de partij er één zetel bij zou krijgen.</p><p>De partij met het <b>grootste gemiddelde</b> krijgt de restzetel. Alleen partijen die minstens één volle zetel hebben, doen mee.</p>',
        wanneer:'je een verkiezingsuitslag helemaal in zetels wilt omrekenen.',
        maak:function(R){
          var u = uitslag(R, 4, 1), g = u.gems[0], w = u.volg[0], vraagJ = [0, 1, 2, 3].filter(function(j){ return j !== w; });
          var open = [w, R.kies(vraagJ)], somVol = u.vol.reduce(function(a, b){ return a + b; }, 0);
          var rijen = [['partij', 'stemmen', 'volle zetels', 'gem.']].concat(u.namen.map(function(p, j){ return [p, tp(u.st[j]), String(u.vol[j]), open.indexOf(j) >= 0 ? '?' : gemTxt(g[j])]; }));
          var b = tabel(rijen), wie = u.namen[w];
          var st = [{ tekst:'Volle zetels samen: ' + u.vol.join(' + ') + ' =', antwoord:aant(somVol), hint:'Tel de kolom volle zetels op.' },
            { tekst:'Restzetels: 150 ' + MIN + ' ' + somVol + ' =', antwoord:aant(u.rest), hint:'De Tweede Kamer heeft 150 zetels.' }];
          open.forEach(function(j){ st.push({ tekst:'Gemiddelde van ' + u.namen[j] + ': ' + tp(u.st[j]) + ' : (' + u.vol[j] + ' + 1) = (rond af op hele stemmen)', antwoord:aant(Math.round(g[j])), hint:'Deel de stemmen door ' + (u.vol[j] + 1) + '.', fout:FA(Math.round(u.st[j] / u.vol[j]), 'Je deelde door ' + u.vol[j] + '. Tel er eerst 1 bij op: deel door ' + (u.vol[j] + 1) + '.') }); });
          st.push(K(R, 'Wie krijgt de eerste restzetel?', wie, u.namen.filter(function(p){ return p !== wie; }), 'Vergelijk de vier gemiddelden. Het grootste wint.'));
          var o = OP({ context:'Een verkiezingsuitslag voor de Tweede Kamer met vier partijen. De kiesdeler is ' + tp(u.k) + '. Wie krijgt de eerste restzetel? (gem. is het gemiddelde.)', vraag:u.namen.join(', ') + ' ' + tp(u.st[0]), vraagHtml:'Wie krijgt de eerste restzetel?', beeld:b, zelfBeeld:b, stappen:st });
          o._uitslag = u; return o;
        } },
      { id:'mm-restzetel-meer', naam:'Meer restzetels: steeds opnieuw', kort:'Geef de restzetel aan het grootste gemiddelde, reken voor die partij een nieuw gemiddelde uit en kijk opnieuw',
        uit:'<p>Zijn er meer restzetels, dan verdeel je ze <b>een voor een</b>.</p><p>De partij met het grootste gemiddelde krijgt de eerste restzetel. Voor die partij reken je dan een <b>nieuw gemiddelde</b> uit: stemmen : (zetels + 1), met de nieuwe zetel erbij. De andere gemiddelden blijven hetzelfde.</p><p>Dan vergelijk je opnieuw. Een partij kan zo ook twee restzetels krijgen.</p>',
        wanneer:'er twee of meer restzetels te verdelen zijn.',
        maak:function(R){
          var u = uitslag(R, 4, 2), g = u.gems[0], w = u.volg[0], w2 = u.volg[1], wie = u.namen[w], wie2 = u.namen[w2];
          var rijen = [['partij', 'stemmen', 'volle zetels', 'gem.']].concat(u.namen.map(function(p, j){ return [p, tp(u.st[j]), String(u.vol[j]), gemTxt(g[j])]; }));
          var b = tabel(rijen), nieuw = u.st[w] / (u.vol[w] + 2);
          var o = OP({ context:'Een verkiezingsuitslag voor de Tweede Kamer met vier partijen. Er zijn ' + u.rest + ' restzetels. De gemiddelden staan al in de kolom gem. (stemmen : (volle zetels + 1), afgerond). Wie krijgt de tweede restzetel?', vraag:u.namen.join(', ') + ' ' + tp(u.st[0]), vraagHtml:'Wie krijgt de tweede restzetel?', beeld:b, zelfBeeld:b,
            stappen:[
              K(R, 'Wie krijgt de eerste restzetel?', wie, u.namen.filter(function(p){ return p !== wie; }), 'Het grootste gemiddelde in de tabel.'),
              { tekst:wie + ' heeft nu ' + (u.vol[w] + 1) + ' zetels. Nieuw gemiddelde: ' + tp(u.st[w]) + ' : (' + (u.vol[w] + 1) + ' + 1) = (rond af op hele stemmen)', antwoord:aant(Math.round(nieuw)), hint:'Deel de stemmen van ' + wie + ' door ' + (u.vol[w] + 2) + '.', fout:FA(Math.round(g[w]), 'Dat is het oude gemiddelde. ' + wie + ' heeft er een zetel bij: deel door ' + (u.vol[w] + 2) + '.') },
              K(R, 'Wie krijgt de tweede restzetel?', wie2, u.namen.filter(function(p){ return p !== wie2; }), 'Vergelijk het nieuwe gemiddelde van ' + wie + ' met de andere drie gemiddelden.') ] });
          o._uitslag = u; return o;
        } },
      { id:'mm-voorkeur', naam:'Gekozen met voorkeurstemmen?', kort:'Een kandidaat met minstens 25% van de kiesdeler aan stemmen is gekozen, ook als hij laag op de lijst staat',
        uit:'<p>Je stemt altijd op één <b>kandidaat</b> van een partij. De zetels van een partij gaan in principe naar de kandidaten bovenaan de lijst.</p><p>Maar heeft een kandidaat zelf veel stemmen, dan is hij gekozen met <b>voorkeurstemmen</b>, ook als hij laag op de lijst staat. Bij de Tweede Kamer is de grens (de <b>voorkeurdrempel</b>) <b>25% van de kiesdeler</b>.</p><p>Kiesdeler 70.000: de drempel is 70.000 : 4 = 17.500 stemmen.</p>',
        wanneer:'je wilt weten of een kandidaat lager op de lijst toch in de Kamer komt.',
        maak:function(R){
          var k = R.heel(150, 180) * 400, d = k / 4, ja = R.heel(0, 1) === 1, v = ja ? R.heel(d + 50, d * 2) : R.heel(Math.round(d * 0.4), d - 50), plek = R.heel(12, 40), p = R.kies(PARTIJ);
          var naam = R.kies(['Fatima el Amrani', 'Joris de Boer', 'Sanne Visser', 'Mehmet Yilmaz', 'Lotte Bakker', 'Kevin Jansen', 'Noor Hendriks', 'Daan Mulder']);
          return OP({ context:'De kiesdeler is ' + tp(k) + '. ' + naam + ' staat op plek ' + plek + ' van de lijst van ' + p + ' en krijgt ' + tp(v) + ' stemmen. De partij haalt genoeg zetels. Is ' + naam + ' gekozen met voorkeurstemmen?', vraag:naam + ': ' + tp(v) + ' stemmen', vraagHtml:'Gekozen met voorkeurstemmen?',
            stappen:[
              { tekst:'De voorkeurdrempel: 25% van ' + tp(k) + ' = ' + tp(k) + ' : 4 =', antwoord:aant(d), hint:'25% is een kwart: deel door 4.' },
              V('Heeft ' + naam + ' ' + tp(d) + ' stemmen of meer?', ['ja', 'nee'], ja ? 'ja' : 'nee', 'Vergelijk ' + tp(v) + ' met ' + tp(d) + '.'),
              V('Dus ' + naam + ' is', ['gekozen met voorkeurstemmen', 'niet gekozen met voorkeurstemmen'], ja ? 'gekozen met voorkeurstemmen' : 'niet gekozen met voorkeurstemmen', ja ? 'Boven de drempel: gekozen, ook vanaf plek ' + plek + '.' : 'Onder de drempel: dan telt de plek op de lijst.') ] });
        } }
    ] });

  /* ================= 3 DE TRIAS POLITICA (onderbouw, recht) ================= */
  var TRIAS = {
    wetgevende:['wetten maken', ['De Tweede Kamer stemt over een nieuw wetsvoorstel.', 'De Eerste Kamer neemt een wet aan.', 'De minister stuurt een wetsvoorstel naar de Tweede Kamer.', 'Kamerleden dienen een amendement in om een wetsvoorstel te veranderen.', 'Een paar Kamerleden schrijven zelf een wetsvoorstel.', 'De Eerste Kamer stemt tegen een wetsvoorstel.']],
    uitvoerende:['wetten uitvoeren en het land besturen', ['De politie houdt een verdachte aan.', 'De minister zorgt dat de nieuwe wet op de scholen wordt uitgevoerd.', 'De Belastingdienst stuurt mensen een aanslag.', 'Een ambtenaar van een ministerie regelt de uitbetaling van de huurtoeslag.', 'Het kabinet voert een nieuwe regel voor de kinderopvang in.', 'Een minister laat nieuwe dijken aanleggen.']],
    rechterlijke:['rechtspreken: oordelen of iemand zich aan de wet hield', ['Een rechter veroordeelt een dief tot een taakstraf.', 'Een rechter beslist in een ruzie tussen een huurder en een verhuurder.', 'Het gerechtshof behandelt een zaak in hoger beroep.', 'De Hoge Raad doet uitspraak in een belangrijke zaak.', 'Een kinderrechter spreekt een jongere vrij.']]};
  var WIE = { wetgevende:'de regering en de Staten-Generaal (Tweede en Eerste Kamer) samen', uitvoerende:'de regering (koning en ministers), met ambtenaren en politie', rechterlijke:'de rechters' };
  /* de wet in stappen: [wie, wat] */
  var WET = [['de minister', 'schrijft een wetsvoorstel'], ['de Raad van State', 'geeft advies over het voorstel'], ['de Tweede Kamer', 'bespreekt het voorstel, kan het veranderen en stemt erover'],
    ['de Eerste Kamer', 'stemt over het voorstel en kan het alleen aannemen of verwerpen'], ['de koning en de minister', 'ondertekenen de wet'], ['het Staatsblad', 'publiceert de wet, zodat iedereen hem kan lezen']];
  var KLAAR = ['De minister heeft een wetsvoorstel geschreven.', 'De Raad van State heeft advies gegeven over het voorstel.', 'De Tweede Kamer heeft het voorstel besproken en aangenomen.',
    'De Eerste Kamer heeft het voorstel aangenomen.', 'De koning en de minister hebben de wet ondertekend.', 'De nieuwe wet staat in het Staatsblad.'];
  var WETLIJST ='<ol>' + WET.map(function(w){ return '<li><b>' + hoofd(w[0]) + '</b> ' + w[1] + '.</li>'; }).join('') + '</ol>';

  G.push({ groep:{ id:'mm-staat', niveau:'onderbouw', domein:'recht', naam:'De trias politica en de wet',
      uit:'De macht in Nederland is verdeeld over drie machten. Je leert bij een handeling zeggen welke macht het is, en je leert de stappen waarmee een wet tot stand komt.' },
    doelen:[
      { id:'mm-trias', naam:'Welke macht is het?', kort:'Wetten maken is de wetgevende macht, wetten uitvoeren de uitvoerende macht, rechtspreken de rechterlijke macht',
        uit:'<p>In een rechtsstaat is de macht verdeeld over drie machten, zodat niemand alle macht heeft. Dat heet de <b>trias politica</b>.</p><ul><li>De <b>wetgevende macht</b> maakt de wetten: ' + WIE.wetgevende + '.</li><li>De <b>uitvoerende macht</b> voert de wetten uit en bestuurt: ' + WIE.uitvoerende + '.</li><li>De <b>rechterlijke macht</b> spreekt recht: ' + WIE.rechterlijke + '.</li></ul><p>Vraag je af: wordt er een wet <b>gemaakt</b>, <b>uitgevoerd</b>, of <b>beoordeelt</b> iemand of de wet is overtreden?</p>',
        wanneer:'je moet zeggen wie in Nederland wat doet.',
        maak:function(R){
          var m = R.kies(Object.keys(TRIAS)), z = R.kies(TRIAS[m][1]);
          return OP({ context:'Bij welke macht hoort dit?', vraag:z,
            stappen:[
              V('Wat gebeurt er?', Object.keys(TRIAS).map(function(k){ return TRIAS[k][0]; }), TRIAS[m][0], m === 'wetgevende' ? 'Er wordt een wet gemaakt, veranderd of aangenomen of verworpen.' : m === 'uitvoerende' ? 'Er wordt een wet of regel in de praktijk uitgevoerd.' : 'Iemand beslist als rechter in een zaak.'),
              V('Dus het hoort bij de', ['wetgevende macht', 'uitvoerende macht', 'rechterlijke macht'], m + ' macht', hoofd(TRIAS[m][0]) + ': de ' + m + ' macht.') ] });
        } },
      { id:'mm-wet', naam:'Hoe een wet tot stand komt', kort:'Minister, Raad van State, Tweede Kamer, Eerste Kamer, koning en minister, Staatsblad',
        uit:'<p>Een nieuwe wet gaat in vaste stappen:</p>' + WETLIJST + '<p>Let op: alleen de <b>Tweede Kamer</b> kan een voorstel veranderen (met een amendement). De <b>Eerste Kamer</b> kan alleen ja of nee zeggen. Ook Tweede Kamerleden mogen zelf een wetsvoorstel schrijven, dan begint het bij hen.</p>',
        wanneer:'je wilt weten waar een wetsvoorstel nu is en wat er nog moet gebeuren.',
        maak:function(R){
          var terug = R.heel(0, 2) === 0, i = terug ? R.heel(1, WET.length - 1) : R.heel(0, WET.length - 2), j = terug ? i - 1 : i + 1, ander = WET[j];
          var andere = WET.filter(function(w, k){ return k !== i && k !== j; }).map(function(w){ return w[0]; });
          var VOLG = 'De volgorde: minister, Raad van State, Tweede Kamer, Eerste Kamer, koning en minister, Staatsblad.';
          var st = [V('Welke stap is dit?', ['stap 1', 'stap 2', 'stap 3', 'stap 4', 'stap 5', 'stap 6'], 'stap ' + (i + 1), VOLG),
            K(R, terug ? 'Wie was hiervoor aan de beurt?' : 'Wie is nu aan de beurt?', ander[0], R.hussel(andere).slice(0, 3), (terug ? 'Voor stap ' + (i + 1) + ' komt stap ' + i + ': ' : 'Na stap ' + (i + 1) + ' komt stap ' + (i + 2) + ': ') + ander[0] + '.')];
          if (!terug) st.push(K(R, 'Wat ' + (ander[0].indexOf(' en ') > 0 ? 'doen ' : 'doet ') + ander[0] + '?', ander[1], R.hussel(WET.filter(function(w){ return w !== ander; })).slice(0, 2).map(function(w){ return w[1]; }), 'Denk aan de volgorde van de stappen.'));
          return OP({ context:KLAAR[i] + (terug ? ' Wie was daarvoor aan de beurt?' : ' Wie is nu aan de beurt, en wat gebeurt er?'), vraag:KLAAR[i] + (terug ? ' Ervoor?' : ' Daarna?'), vraagHtml:terug ? 'Wie was hiervoor aan de beurt?' : 'Wat gebeurt er nu?', stappen:st });
        } }
    ] });

  LEERROUTE.voeg('mens', G);
})();
