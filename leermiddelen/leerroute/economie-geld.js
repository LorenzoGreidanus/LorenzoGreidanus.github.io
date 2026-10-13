/* De leerroute economie, geld: korting en btw (erbij en eraf, 9% en 21%), budget en
   huishoudboekje, sparen en rente (enkelvoudig en samengesteld), procentuele verandering,
   de groeifactor, indexcijfers en koopkracht. Alle bedragen en situaties zijn verzonnen.
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var T = LEERROUTE.R, X = '×', MIN = '−', G = [];

  /* ---------- rekenhulpjes ---------- */
  function tn(x){ return T.toon(x); }
  function rond(x, d){ var f = Math.pow(10, d); return Math.round((x + (x >= 0 ? 1e-9 : -1e-9)) * f) / f; }
  function r2(x){ return rond(x, 2); }
  function r1(x){ return rond(x, 1); }
  function uniek(l){ var u = []; l.forEach(function(x){ if (u.indexOf(x) < 0) u.push(x); }); return u; }
  /* een bedrag: '€ 1.250,00' */
  function eu(x){ return '€ ' + T.toon(r2(x), { dec:2, vast:true, punt:true }); }
  function kaal(x){ return T.toon(r2(x), { dec:2, vast:true, punt:true }); }
  /* alle goede schrijfwijzen van een bedrag */
  function bedr(x){ x = r2(x); return uniek([T.toon(x, { dec:2, vast:true, punt:true }), T.toon(x, { dec:2, vast:true }), tn(x)]); }
  function pc(p){ var t = tn(p); return [t, t + '%', t + ' %']; }
  function F(){ var o = {}; for (var i = 0; i + 1 < arguments.length; i += 2) if (arguments[i] != null) o[String(arguments[i]).toLowerCase()] = arguments[i + 1]; return o; }
  /* fout-uitleg bij een bedrag, in elke schrijfwijze */
  function FB(x, tekst, o){ o = o || {}; bedr(x).concat(['€ ' + T.toon(r2(x), { dec:2, vast:true }), '€' + T.toon(r2(x), { dec:2, vast:true })]).forEach(function(k){ o[k.toLowerCase()] = tekst; }); return o; }
  function samen(a, b){ var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) if (!(k in o)) o[k] = b[k]; return o; }
  /* een keuzestap: goed en de foute opties, gehusseld */
  function K(R, t, goed, fout, hint, extra){
    var lijst = [goed], gezien = {}; gezien[String(goed).toLowerCase()] = 1;
    fout.forEach(function(f){ if (f == null) return; var k = String(f).toLowerCase(); if (!gezien[k]){ gezien[k] = 1; lijst.push(f); } });
    var opties = R.hussel(lijst), s = { tekst:t, opties:opties, goed:opties.indexOf(goed), hint:hint };
    if (extra){ if (extra.waarom) s.waarom = extra.waarom; if (extra.fout){ s.fout = {}; for (var k in extra.fout) s.fout[k.toLowerCase()] = extra.fout[k]; } }
    return s;
  }
  /* is de laatste stap een keuze, dan is dat ook de eindvraag bij Zelf */
  function OP(o){ var s = o.stappen[o.stappen.length - 1]; if (s.opties){ o.opties = s.opties; o.goed = s.goed; } return o; }
  /* een tabel; html:true omdat de cellen zelf al veilig zijn */
  function tabel(rijen, nadruk){ return ktabel(rijen, { kop:true, nadruk:nadruk || [] }); }
  /* een compacte tabel die ook op een telefoon past: { kop, zijkop, nadruk:[[r,c]], html } */
  function ktabel(rijen, o){
    o = o || {}; var nad = {}; (o.nadruk || []).forEach(function(q){ nad[q[0] + ',' + q[1]] = 1; });
    return '<table class="lr-tabel" style="font-size:.85rem;border-spacing:3px">' + rijen.map(function(r, ri){
      return '<tr>' + r.map(function(c, ci){ var t = (o.kop && ri === 0) || (o.zijkop && ci === 0) ? 'th' : 'td';
        return '<' + t + ' style="padding:5px 8px;min-width:0"' + (nad[ri + ',' + ci] ? ' class="nadruk"' : '') + '>' + (c === '?' ? '<b class="lr-vraagt">?</b>' : (o.html ? c : T.schoon(c))) + '</' + t + '>'; }).join('') + '</tr>';
    }).join('') + '</table>';
  }
  function hoofd(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- spullen ---------- */
  /* [wat, laagste prijs, hoogste prijs] in hele euro's; het hoge btw-tarief (21%) */
  var SPUL21 = [['een fiets', 280, 900], ['een koptelefoon', 40, 220], ['een spelcomputer', 300, 560], ['een paar sneakers', 60, 180], ['een winterjas', 70, 260],
    ['een laptop', 400, 1200], ['een telefoon', 150, 900], ['een skateboard', 40, 140], ['een bureaustoel', 60, 300], ['een rugzak', 25, 90],
    ['een spijkerbroek', 30, 120], ['een horloge', 40, 300], ['een tent', 80, 400], ['een boormachine', 50, 180]];
  /* het lage btw-tarief (9%): eten */
  var SPUL9 = [['de boodschappen voor een week', 45, 140], ['een verjaardagstaart', 16, 38], ['een fruitmand', 20, 48], ['een bestelling bij de groenteboer', 12, 60],
    ['de broodjes voor een schoolreis', 30, 90], ['een bestelling bij de slager', 18, 75], ['de boodschappen voor een feestje', 35, 110], ['een bestelling bij de bakker', 14, 50]];

  /* ================= 1 KORTING EN BTW (onderbouw) ================= */
  function kortingOpgave(R){
    var it = R.kies(SPUL21), P = R.heel(it[1], it[2]), p = R.kies([10, 15, 20, 25, 30, 35, 40, 50, 60, 70]);
    return { it:it, P:P, p:p };
  }
  function btwTarief(R){ var r = R.kies([21, 21, 9]), it = R.kies(r === 21 ? SPUL21 : SPUL9); return { r:r, it:it, E:R.heel(it[1], it[2]) }; }
  function f(r){ return tn(1 + r / 100); }
  function btwTabel(r, P, E, n, stap1, stap2){
    var een = n >= stap1 ? kaal(E / 100) : '?', hon = n >= stap2 ? kaal(E) : '?';
    return T.teken.tabel([['procent', (100 + r) + '%', '1%', '100%'], ['bedrag (€)', kaal(P), een, hon]], { zijkop:true, verhouding:true,
      pijlen:n >= stap1 ? [{ van:1, naar:2, tekst:': ' + (100 + r) }, { van:1, naar:2, tekst:': ' + (100 + r), onder:true }].concat(n >= stap2 ? [{ van:2, naar:3, tekst:X + ' 100' }, { van:2, naar:3, tekst:X + ' 100', onder:true }] : []) : [] });
  }

  G.push({ groep:{ id:'ec-proc', niveau:'onderbouw', domein:'geld', naam:'Korting en btw',
      uit:'Rekenen met procenten in de winkel: korting eraf, btw erbij, en terugrekenen naar de prijs zonder btw. Btw is 21% (het hoge tarief) of 9% (het lage tarief, onder andere voor eten).' },
    doelen:[
      { id:'ec-korting-stap', naam:'Korting: eerst het bedrag eraf', kort:'Reken uit hoeveel euro de korting is en trek dat af van de prijs',
        uit:'<p>Bij <b>korting</b> betaal je minder dan de gewone prijs. Reken eerst uit hoeveel euro de korting is.</p><p>Dat gaat met de <b>1%-methode</b>: 1% is de prijs gedeeld door 100. De korting is het aantal procent keer 1%.</p><p>Trek de korting af van de prijs. 30% korting op € 80: 1% is € 0,80, de korting is 30 ' + X + ' € 0,80 = € 24. Je betaalt € 80 ' + MIN + ' € 24 = € 56.</p>',
        wanneer:'je ook wilt weten hoeveel je bespaart.',
        maak:function(R){
          var o = kortingOpgave(R), P = o.P, p = o.p, een = P / 100, k = r2(p * een);
          return { context:'In de uitverkoop krijg je ' + p + '% korting op ' + o.it[0] + ' van ' + eu(P) + '. Wat betaal je?', vraag:p + '% korting op ' + eu(P),
            stappen:[
              { tekst:'1% van ' + eu(P) + ' = ' + eu(P) + ' : 100 =', antwoord:bedr(een), hint:'Delen door 100: de komma gaat twee plaatsen naar links. ' + P + ' wordt ' + kaal(een) + '.', fout:FB(P / 10, 'Je deelde door 10. Voor 1% deel je door 100.') },
              { tekst:'De korting is ' + p + '%: ' + p + ' ' + X + ' ' + eu(een) + ' =', antwoord:bedr(k), hint:'Doe ' + p + ' keer ' + kaal(een) + '. Bijvoorbeeld eerst ' + (p >= 10 ? '10 ' + X + ' ' + kaal(een) + ' = ' + kaal(een * 10) : p + ' ' + X + ' ' + kaal(een)) + '.' },
              { tekst:'Je betaalt ' + eu(P) + ' ' + MIN + ' ' + eu(k) + ' =', antwoord:bedr(P - k), hint:'De gewone prijs min de korting.', fout:FB(k, 'Dat is de korting. Je betaalt de prijs min de korting.') } ] };
        } },
      { id:'ec-korting-factor', naam:'Korting: direct met de factor', kort:'Bij 30% korting betaal je nog 70%: doe de prijs keer 0,7',
        uit:'<p>Bij <b>korting</b> betaal je een deel van de prijs. Bij 30% korting betaal je nog 100% ' + MIN + ' 30% = <b>70%</b>.</p><p>70% is als kommagetal 0,70. Dat heet de <b>factor</b>. Doe de prijs keer de factor, dan heb je meteen de nieuwe prijs.</p><p>30% korting op € 80: 0,7 ' + X + ' € 80 = € 56.</p>',
        wanneer:'je alleen de nieuwe prijs nodig hebt, of als je een rekenmachine gebruikt.',
        maak:function(R){
          var o = kortingOpgave(R), p = o.p, c = o.P * 100;
          for (var i = 0; i < 60; i++){ var cc = R.heel(o.it[1] * 20, o.it[2] * 20) * 5; if ((cc * (100 - p)) % 100 === 0 && cc % 100 !== 0){ c = cc; break; } }
          var P = c / 100, fa = (100 - p) / 100, nieuw = c * (100 - p) / 10000;
          return { context:'Je krijgt ' + p + '% korting op ' + o.it[0] + ' van ' + eu(P) + '. Wat betaal je?', vraag:p + '% korting op ' + eu(P),
            stappen:[
              { tekst:'Hoeveel procent betaal je nog? 100% ' + MIN + ' ' + p + '% =', antwoord:pc(100 - p), eenheid:'%', hint:'De korting gaat eraf: 100 ' + MIN + ' ' + p + '.', fout:F(p, 'Dat is de korting. Hoeveel procent betaal je nog wel?', p + '%', 'Dat is de korting. Hoeveel procent betaal je nog wel?') },
              { tekst:(100 - p) + '% als kommagetal (de factor) =', antwoord:[tn(fa), T.toon(fa, { dec:2, vast:true })], hint:(100 - p) + '% is ' + (100 - p) + ' honderdste: ' + tn(fa) + '.', fout:F(tn(100 - p), 'Deel door 100: ' + (100 - p) + '% is ' + tn(fa) + '.') },
              { tekst:'Je betaalt ' + tn(fa) + ' ' + X + ' ' + eu(P) + ' =', antwoord:bedr(nieuw), hint:'Reken ' + eu(P) + ' keer ' + tn(fa) + '.', fout:FB(P * p / 100, 'Dat is de korting. Met de factor ' + tn(fa) + ' krijg je meteen wat je betaalt.') } ] };
        } },
      { id:'ec-btw-erbij', naam:'Btw erbij: in stappen', kort:'Reken de btw uit en tel die op bij de prijs zonder btw',
        uit:'<p>Over bijna alles wat je koopt betaal je <b>btw</b>: belasting voor de overheid. De winkel rekent hem bij de prijs.</p><p>De btw is een procent van de prijs <b>zonder btw</b>. Meestal 21%. Voor eten is het 9%.</p><p>Reken eerst de btw uit met de 1%-methode. Tel hem dan op bij de prijs zonder btw. € 200 met 21% btw: 1% is € 2, de btw is 21 ' + X + ' € 2 = € 42, met btw € 242.</p>',
        wanneer:'je wilt weten hoeveel btw je betaalt en wat de prijs met btw wordt.',
        maak:function(R){
          var o = btwTarief(R), r = o.r, E = o.E, b = r2(E * r / 100);
          return { context:'De prijs zonder btw van ' + o.it[0] + ' is ' + eu(E) + '. De btw is ' + r + '%. Wat is de prijs met btw?', vraag:eu(E) + ' + ' + r + '% btw',
            stappen:[
              { tekst:'1% van ' + eu(E) + ' =', antwoord:bedr(E / 100), hint:'Deel door 100: ' + E + ' : 100.' },
              { tekst:'De btw is ' + r + '%: ' + r + ' ' + X + ' ' + eu(E / 100) + ' =', antwoord:bedr(b), hint:'Doe ' + r + ' keer ' + kaal(E / 100) + (r === 21 ? ': 20 keer en dan nog 1 keer erbij.' : ': 10 keer en dan 1 keer eraf.') },
              { tekst:'Met btw: ' + eu(E) + ' + ' + eu(b) + ' =', antwoord:bedr(E + b), hint:'Tel de btw op bij de prijs zonder btw.', fout:FB(b, 'Dat is alleen de btw. Tel hem op bij de prijs.') } ] };
        } },
      { id:'ec-btw-factor', naam:'Btw erbij: met keer 1,21 of 1,09', kort:'Met btw betaal je 121% of 109%: doe de prijs zonder btw keer 1,21 of 1,09',
        uit:'<p>Met btw betaal je de prijs zelf (100%) <b>plus</b> de btw. Bij 21% btw is dat 121%, bij 9% btw is dat 109%.</p><p>121% als kommagetal is <b>1,21</b>. Doe de prijs zonder btw keer 1,21, dan heb je meteen de prijs met btw.</p><p>€ 200 zonder btw: 1,21 ' + X + ' € 200 = € 242.</p>',
        wanneer:'je snel de prijs met btw wilt weten, bijvoorbeeld met een rekenmachine.',
        maak:function(R){
          var o = btwTarief(R), r = o.r, E = o.E;
          return { context:'De prijs zonder btw van ' + o.it[0] + ' is ' + eu(E) + '. De btw is ' + r + '%. Wat is de prijs met btw?', vraag:eu(E) + ' + ' + r + '% btw',
            stappen:[
              { tekst:'Met btw betaal je 100% + ' + r + '% =', antwoord:pc(100 + r), eenheid:'%', hint:'De prijs zelf is 100%. Daar komt ' + r + '% bij.', fout:F(r, 'Dat is alleen de btw. Je betaalt ook de prijs zelf: 100% erbij.') },
              { tekst:(100 + r) + '% als kommagetal (de factor) =', antwoord:[f(r)], hint:(100 + r) + ' : 100 = ' + f(r) + '.', fout:F(tn(r / 100), 'Dat is alleen de btw. De factor is ' + f(r) + '.') },
              { tekst:f(r) + ' ' + X + ' ' + eu(E) + ' =', antwoord:bedr(E * (100 + r) / 100), hint:'Reken ' + E + ' keer ' + f(r) + '.', fout:FB(E * r / 100, 'Dat is alleen de btw. Met ' + f(r) + ' krijg je meteen de prijs met btw.') } ] };
        } },
      { id:'ec-btw-eraf-tabel', naam:'Prijs zonder btw: met de verhoudingstabel', kort:'De prijs met btw is 121% (of 109%). Reken in de tabel naar 1% en dan naar 100%',
        uit:'<p>Soms weet je de prijs <b>met</b> btw en zoek je de prijs <b>zonder</b> btw. Pas op: je mag niet gewoon 21% van de prijs afhalen.</p><p>De prijs met btw is <b>121%</b> (of 109% bij 9% btw). Zet dat in een <b>verhoudingstabel</b>. Deel door 121, dan heb je 1%. Doe keer 100, dan heb je 100%: de prijs zonder btw.</p><p>€ 242 met btw: 1% is € 242 : 121 = € 2, 100% is € 200.</p>',
        wanneer:'je de prijs zonder btw zoekt en wilt zien wat je uitrekent.',
        maak:function(R){
          var o = btwTarief(R), r = o.r, E = o.E, P = r2(E * (100 + r) / 100);
          return { context:'In de winkel kost ' + o.it[0] + ' ' + eu(P) + ', met ' + r + '% btw. Wat is de prijs zonder btw?', vraag:eu(P) + ' zonder ' + r + '% btw',
            beeld:function(n){ return btwTabel(r, P, E, n, 2, 3); }, zelfBeeld:btwTabel(r, P, E, 0, 9, 9),
            stappen:[
              { tekst:'De prijs met btw is hoeveel procent? 100% + ' + r + '% =', antwoord:pc(100 + r), eenheid:'%', hint:'De prijs met btw is de prijs zelf (100%) plus de btw (' + r + '%).', fout:F('100', 'Met btw is meer dan 100%. Tel de btw erbij.') },
              { tekst:'1% = ' + eu(P) + ' : ' + (100 + r) + ' =', antwoord:bedr(E / 100), hint:'Deel ' + kaal(P) + ' door ' + (100 + r) + '.', fout:FB(P / 100, 'Je deelde door 100. Maar ' + kaal(P) + ' hoort bij ' + (100 + r) + '%, dus deel door ' + (100 + r) + '.') },
              { tekst:'100% = 100 ' + X + ' ' + eu(E / 100) + ' =', antwoord:bedr(E), hint:'Van 1% naar 100%: keer 100.', fout:FB(P * (100 - r) / 100, 'Zo haal je ' + r + '% van de prijs met btw af. Dat is te veel: de btw is ' + r + '% van de prijs zonder btw.') } ] };
        } },
      { id:'ec-btw-eraf-factor', naam:'Prijs zonder btw: delen door 1,21 of 1,09', kort:'De prijs met btw is 1,21 keer de prijs zonder btw. Dus deel door 1,21 (of 1,09)',
        uit:'<p>De prijs met btw is de prijs zonder btw <b>keer 1,21</b> (bij 9% btw keer 1,09).</p><p>Terugrekenen doe je dus andersom: <b>delen door 1,21</b>. € 242 : 1,21 = € 200.</p><p>Let op: <b>niet</b> keer 0,79. Dan haal je 21% van de prijs met btw af, en dat is te veel.</p>',
        wanneer:'je de prijs zonder btw zoekt en een rekenmachine hebt.',
        maak:function(R){
          var o = btwTarief(R), r = o.r, E = o.E, P = r2(E * (100 + r) / 100);
          return { context:'Je betaalt ' + eu(P) + ' voor ' + o.it[0] + '. Daarin zit ' + r + '% btw. Wat is de prijs zonder btw?', vraag:eu(P) + ' zonder ' + r + '% btw',
            stappen:[
              { tekst:'Met btw is de prijs ' + (100 + r) + '%. De factor is', antwoord:[f(r)], hint:(100 + r) + '% als kommagetal: ' + f(r) + '.', fout:F(tn(1 - r / 100), 'Dat is de factor om ' + r + '% af te halen. Maar de prijs met btw is ' + (100 + r) + '%.') },
              { tekst:'Zonder btw: ' + eu(P) + ' : ' + f(r) + ' =', antwoord:bedr(E), hint:'Delen door ' + f(r) + ', want de prijs met btw is ' + f(r) + ' keer de prijs zonder btw.',
                fout:samen(FB(P * (100 - r) / 100, 'Je haalde ' + r + '% van de prijs met btw af. Maar de btw is ' + r + '% van de prijs zonder btw. Deel door ' + f(r) + '.'), FB(P * (100 + r) / 100, 'Je deed keer ' + f(r) + '. Terugrekenen is delen.')) } ] };
        } },
      { id:'ec-btw-bedrag', naam:'Hoeveel btw zit erin?', kort:'Reken eerst de prijs zonder btw uit, en trek die af van de prijs met btw',
        uit:'<p>Op een kassabon staat vaak hoeveel btw je betaald hebt. Dat kun je zelf narekenen.</p><p>Reken eerst de prijs <b>zonder btw</b> uit: deel de prijs met btw door 1,21 (of 1,09).</p><p>De btw is het <b>verschil</b>: prijs met btw ' + MIN + ' prijs zonder btw. € 242 : 1,21 = € 200, de btw is € 242 ' + MIN + ' € 200 = € 42.</p>',
        wanneer:'je wilt weten hoeveel van de prijs naar de overheid gaat.',
        maak:function(R){
          var o = btwTarief(R), r = o.r, E = o.E, P = r2(E * (100 + r) / 100), b = r2(P - E);
          return { context:'Op de kassabon staat ' + o.it[0] + ' voor ' + eu(P) + ', met ' + r + '% btw. Hoeveel btw heb je betaald?', vraag:'btw in ' + eu(P) + ' (' + r + '%)',
            stappen:[
              { tekst:'Prijs zonder btw: ' + eu(P) + ' : ' + f(r) + ' =', antwoord:bedr(E), hint:'Deel de prijs met btw door ' + f(r) + '.' },
              { tekst:'De btw: ' + eu(P) + ' ' + MIN + ' ' + eu(E) + ' =', antwoord:bedr(b), hint:'Prijs met btw min prijs zonder btw.', fout:FB(P * r / 100, 'Dat is ' + r + '% van de prijs met btw. De btw is ' + r + '% van de prijs zonder btw. Neem het verschil.') } ] };
        } },
      { id:'ec-btw-kies', naam:'Btw: kies de juiste som', kort:'Staat de prijs met of zonder btw in de vraag? Zonder btw: keer 1,21. Met btw: delen door 1,21',
        uit:'<p>Kijk eerst goed: weet je de prijs <b>met</b> btw of <b>zonder</b> btw? En wat zoek je?</p><ul><li>Prijs zonder btw, je zoekt de prijs met btw: <b>keer 1,21</b>.</li><li>Prijs zonder btw, je zoekt alleen de btw: <b>keer 0,21</b>.</li><li>Prijs met btw, je zoekt de prijs zonder btw: <b>delen door 1,21</b>.</li></ul><p>Bij 9% btw is het 1,09 en 0,09. Keer 0,79 is nooit goed.</p>',
        wanneer:'je in een opgave eerst moet bedenken welke som past.',
        maak:function(R){
          var o = btwTarief(R), r = o.r, E = o.E, P = r2(E * (100 + r) / 100), soort = R.heel(0, 2), fr = f(r), kl = tn(r / 100), ond = tn(1 - r / 100);
          var opties = ['keer ' + fr, 'gedeeld door ' + fr, 'keer ' + ond, 'keer ' + kl];
          var c, v, goed, ant, wat;
          if (soort === 0){ c = 'De prijs zonder btw van ' + o.it[0] + ' is ' + eu(E) + '. De btw is ' + r + '%. Wat kost het in de winkel?'; v = eu(E) + ': met btw?'; wat = 'zonder btw'; goed = opties[0]; ant = E * (100 + r) / 100; }
          else if (soort === 1){ c = 'In de winkel kost ' + o.it[0] + ' ' + eu(P) + ', met ' + r + '% btw. Wat is de prijs zonder btw?'; v = eu(P) + ': zonder btw?'; wat = 'met btw'; goed = opties[1]; ant = E; }
          else { c = 'De prijs zonder btw van ' + o.it[0] + ' is ' + eu(E) + '. Hoeveel btw (' + r + '%) komt erbij?'; v = eu(E) + ': hoeveel btw?'; wat = 'zonder btw'; goed = opties[3]; ant = E * r / 100; }
          return { context:c, vraag:v,
            stappen:[
              K(R, 'Is het bedrag in de vraag met of zonder btw?', wat, [wat === 'met btw' ? 'zonder btw' : 'met btw'], 'Lees de vraag nog eens: staat er "in de winkel" of "met btw", of staat er "zonder btw"?'),
              K(R, 'Welke som past?', goed, opties.filter(function(x){ return x !== goed; }), soort === 0 ? 'Je weet de prijs zonder btw en zoekt de prijs met btw: 100% + ' + r + '% = ' + (100 + r) + '%.' : soort === 1 ? 'Je weet de prijs met btw (' + (100 + r) + '%). Terug naar 100% is delen door ' + fr + '.' : 'Je zoekt alleen de btw: ' + r + '% van de prijs zonder btw.',
                { fout:F('keer ' + ond, 'Keer ' + ond + ' haalt ' + r + '% van het bedrag af. Dat is bij btw nooit goed.') }),
              { tekst:'Reken uit: ' + (soort === 1 ? eu(P) : eu(E)) + ' ' + goed + ' =', antwoord:bedr(ant), hint:'Reken de som uit die je net gekozen hebt.' } ] };
        } }
    ] });

  /* ================= 2 BUDGET EN HUISHOUDBOEKJE (onderbouw) ================= */
  var VAST = ['de huur', 'het abonnement van je telefoon', 'de zorgverzekering', 'de contributie van de sportclub', 'het abonnement van een streamingdienst',
    'het internetabonnement', 'de verzekering van je scooter', 'het abonnement op de krant', 'het abonnement van de sportschool', 'de aflossing van een lening'];
  var VARIABEL = ['de boodschappen', 'nieuwe kleding', 'uitgaan met vrienden', 'cadeaus voor verjaardagen', 'snacks en drinken', 'een kaartje voor de bioscoop',
    'benzine voor de scooter', 'een reparatie van je fiets', 'de kapper', 'een dagje naar een pretpark'];
  var INKOMST = [['zakgeld', 20, 60], ['bijbaan', 80, 320], ['kleedgeld', 30, 70], ['oppassen', 15, 60]];
  var UITGAVE = [['telefoon', 10, 25], ['kleding', 20, 80], ['uitgaan', 15, 60], ['sport', 15, 35], ['snacks', 10, 40], ['sparen', 10, 60], ['cadeaus', 5, 30], ['streaming', 8, 14]];
  var NAMEN = ['Sam', 'Noor', 'Daan', 'Lisa', 'Mo', 'Fleur', 'Yara', 'Bram', 'Jesse', 'Amira'];
  var MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  function kies(R, lijst, n){ return R.hussel(lijst).slice(0, n); }
  /* bedragen in hele euro's of met centen (veelvoud van 5 cent) */
  function bedragC(R, a, b, centen){ return centen ? R.heel(a * 20, b * 20) * 5 : R.heel(a, b) * 100; }

  G.push({ groep:{ id:'ec-budget', niveau:'onderbouw', domein:'consument', naam:'Budget en huishoudboekje',
      uit:'Je geld bijhouden: vaste en variabele uitgaven, omrekenen per week, maand en jaar, een overschot of tekort, een huishoudboekje dat klopt, sparen voor een doel en kopen op afbetaling.' },
    doelen:[
      { id:'ec-vaste-lasten', naam:'Vaste of variabele uitgaven', kort:'Betaal je elke maand of elk jaar hetzelfde bedrag, op een vast moment? Dan is het een vaste uitgave',
        uit:'<p>Een <b>vaste uitgave</b> (vaste last) betaal je elke maand of elk jaar. Het bedrag is steeds hetzelfde. Denk aan huur of een abonnement.</p><p>Een <b>variabele uitgave</b> verschilt: de ene maand geef je er veel aan uit, de andere maand weinig of niets. Denk aan kleding of uitgaan.</p><p>Op variabele uitgaven kun je het makkelijkst besparen.</p>',
        wanneer:'je een budget maakt en wilt zien waar je op kunt besparen.',
        maak:function(R){
          var vast = R.heel(0, 1) === 1, wat = R.kies(vast ? VAST : VARIABEL);
          return OP({ context:'Je maakt een overzicht van je uitgaven.', vraag:hoofd(wat) + ': vast of variabel?',
            stappen:[
              K(R, 'Betaal je voor ' + wat + ' elke maand (of elk jaar) hetzelfde bedrag, op een vast moment?', vast ? 'ja' : 'nee', [vast ? 'nee' : 'ja'], vast ? 'Bij een abonnement, verzekering, huur of aflossing ligt het bedrag vast.' : 'Hoeveel je hieraan uitgeeft, verschilt per maand. Soms veel, soms niets.'),
              K(R, 'Dus ' + wat + ' is een', vast ? 'vaste uitgave' : 'variabele uitgave', [vast ? 'variabele uitgave' : 'vaste uitgave'], 'Hetzelfde bedrag op een vast moment is vast. Een bedrag dat verschilt is variabel.') ] });
        } },
      { id:'ec-budget-per', naam:'Per week, per maand, per jaar', kort:'Reken via een jaar: een jaar heeft 52 weken en 12 maanden',
        uit:'<p>Bedragen staan vaak per week, per maand of per jaar. Om te vergelijken reken je ze om.</p><p>Een jaar heeft <b>52 weken</b> en <b>12 maanden</b>. Een maand is dus iets meer dan 4 weken.</p><p>Van per week naar per maand ga je <b>via een jaar</b>: € 15 per week is 52 ' + X + ' € 15 = € 780 per jaar, en dat is € 780 : 12 = € 65 per maand.</p>',
        wanneer:'je bedragen per week, maand en jaar wilt vergelijken of in je budget wilt zetten.',
        maak:function(R){
          var s = R.heel(0, 3);
          if (s === 0){ var m = R.heel(6, 60), wat = R.kies(['Je telefoonabonnement kost', 'Je sportclub kost', 'Je streamingdienst kost', 'Je verdient met je bijbaan']);
            return { context:wat + ' ' + eu(m) + ' per maand. Hoeveel is dat per jaar?', vraag:eu(m) + ' per maand = … per jaar',
              stappen:[ { tekst:'Hoeveel maanden heeft een jaar?', antwoord:'12', hint:'Januari tot en met december.' },
                { tekst:'Per jaar: 12 ' + X + ' ' + eu(m) + ' =', antwoord:bedr(12 * m), hint:'Doe ' + m + ' keer 12: ' + m + ' ' + X + ' 10 + ' + m + ' ' + X + ' 2.' } ] }; }
          if (s === 1){ var w = R.heel(5, 60), wat2 = R.kies(['Je krijgt', 'Je verdient met oppassen', 'Je geeft aan snacks uit', 'Je verdient met je krantenwijk']);
            return { context:wat2 + ' ' + eu(w) + ' per week. Hoeveel is dat per jaar?', vraag:eu(w) + ' per week = … per jaar',
              stappen:[ { tekst:'Hoeveel weken heeft een jaar?', antwoord:'52', hint:'Een jaar heeft 52 weken (en een of twee dagen).', fout:F('48', '4 weken per maand is te weinig. Een jaar heeft 52 weken.') },
                { tekst:'Per jaar: 52 ' + X + ' ' + eu(w) + ' =', antwoord:bedr(52 * w), hint:'50 ' + X + ' ' + w + ' + 2 ' + X + ' ' + w + '.', fout:FB(48 * w, 'Dat is 48 weken. Een jaar heeft 52 weken.') } ] }; }
          if (s === 2){ var mj = R.heel(4, 40) * 12 + R.kies([0, 0, 6]), wat3 = R.kies(['Je zorgverzekering kost', 'De verzekering van je scooter kost', 'De contributie van de hockeyclub is', 'Je abonnement op de krant kost']);
            return { context:wat3 + ' ' + eu(mj) + ' per jaar. Hoeveel is dat per maand?', vraag:eu(mj) + ' per jaar = … per maand',
              stappen:[ { tekst:'Hoeveel maanden heeft een jaar?', antwoord:'12', hint:'Januari tot en met december.' },
                { tekst:'Per maand: ' + eu(mj) + ' : 12 =', antwoord:bedr(mj / 12), hint:'Verdeel ' + mj + ' over 12 maanden.', fout:FB(mj / 52, 'Je deelde door 52. Dat geeft het bedrag per week.') } ] }; }
          var ww = R.heel(2, 20) * 3, wat4 = R.kies(['Je verdient met je bijbaan', 'Je krijgt aan zakgeld', 'Je geeft aan eten op school uit', 'Je verdient met je krantenwijk']);
          return { context:wat4 + ' ' + eu(ww) + ' per week. Hoeveel is dat per maand?', vraag:eu(ww) + ' per week = … per maand',
            stappen:[ { tekst:'Eerst per jaar: 52 ' + X + ' ' + eu(ww) + ' =', antwoord:bedr(52 * ww), hint:'Een jaar heeft 52 weken.' },
              { tekst:'Dan per maand: ' + eu(52 * ww) + ' : 12 =', antwoord:bedr(52 * ww / 12), hint:'Een jaar heeft 12 maanden. Deel door 12.', fout:FB(4 * ww, 'Dat is 4 weken. Een maand is iets langer dan 4 weken; daarom reken je via het jaar.') } ] };
        } },
      { id:'ec-budget-over', naam:'Overschot of tekort', kort:'Tel alle inkomsten op en alle uitgaven, en trek de uitgaven af van de inkomsten',
        uit:'<p>Een <b>budget</b> is een overzicht van je inkomsten en je uitgaven, bijvoorbeeld per maand.</p><p>Tel alle <b>inkomsten</b> op. Tel alle <b>uitgaven</b> op. Reken dan inkomsten ' + MIN + ' uitgaven.</p><p>Blijft er geld over, dan heb je een <b>overschot</b>. Kom je geld tekort (de uitkomst is negatief), dan heb je een <b>tekort</b>.</p>',
        wanneer:'je wilt weten of je rondkomt met je geld.',
        maak:function(R){
          var ink, uit, ti, tu;
          for (var i = 0; i < 100; i++){
            ink = kies(R, INKOMST, 2).map(function(x){ return [x[0], R.heel(x[1], x[2])]; });
            uit = kies(R, UITGAVE, R.heel(3, 4)).map(function(x){ return [x[0], R.heel(x[1], x[2])]; });
            ti = ink.reduce(function(a, x){ return a + x[1]; }, 0); tu = uit.reduce(function(a, x){ return a + x[1]; }, 0);
            if (ti !== tu && Math.abs(ti - tu) <= 120) break;
          }
          var rijen = [['per maand', 'inkomsten', 'uitgaven']].concat(ink.map(function(x){ return [x[0], kaal(x[1]), '']; }), uit.map(function(x){ return [x[0], '', kaal(x[1])]; }));
          var b = tabel(rijen), v = ti - tu, a = Math.abs(v);
          var wie = R.kies(NAMEN);
          return OP({ context:'Het budget van ' + wie + ' per maand, in euro\'s:', vraag:'Overschot of tekort?', beeld:b, zelfBeeld:b,
            stappen:[
              { tekst:'Alle inkomsten samen =', antwoord:bedr(ti), hint:ink.map(function(x){ return x[1]; }).join(' + ') + '.' },
              { tekst:'Alle uitgaven samen =', antwoord:bedr(tu), hint:uit.map(function(x){ return x[1]; }).join(' + ') + '.' },
              { tekst:'Inkomsten ' + MIN + ' uitgaven = ' + ti + ' ' + MIN + ' ' + tu + ' =', antwoord:bedr(v), hint:v < 0 ? 'De uitgaven zijn groter. Dan komt er een min voor de uitkomst.' : 'Trek de uitgaven af van de inkomsten.', fout:v < 0 ? FB(a, 'De uitgaven zijn groter dan de inkomsten. Dan is de uitkomst negatief: zet er een min voor.') : {} },
              K(R, 'Dus ' + wie + ' heeft', (v > 0 ? 'een overschot van ' : 'een tekort van ') + eu(a), [(v > 0 ? 'een tekort van ' : 'een overschot van ') + eu(a), 'precies genoeg: geen overschot en geen tekort'], v > 0 ? 'Er blijft geld over: een overschot.' : 'Er gaat meer uit dan er binnenkomt: een tekort.') ] });
        } },
      { id:'ec-budget-saldo', naam:'Het huishoudboekje: het eindsaldo', kort:'Beginsaldo plus inkomsten min uitgaven is het eindsaldo',
        uit:'<p>In een <b>huishoudboekje</b> schrijf je op wat erbij komt en wat eraf gaat.</p><p>Je begint met het geld dat je al hebt: het <b>beginsaldo</b>. Tel de inkomsten erbij en trek de uitgaven eraf. Wat overblijft is het <b>eindsaldo</b>.</p><p>beginsaldo + inkomsten ' + MIN + ' uitgaven = eindsaldo</p>',
        wanneer:'je wilt weten hoeveel geld je aan het eind van de maand nog hebt.',
        maak:function(R){
          var cent = R.heel(0, 2) > 0, B = bedragC(R, 10, 150, cent);
          var ink = kies(R, INKOMST, 2).map(function(x){ return [x[0], bedragC(R, x[1], x[2], cent)]; });
          var uit = kies(R, UITGAVE, 3).map(function(x){ return [x[0], bedragC(R, x[1], x[2], cent)]; });
          var ti = ink.reduce(function(a, x){ return a + x[1]; }, 0), tu = uit.reduce(function(a, x){ return a + x[1]; }, 0), E = B + ti - tu;
          var wie = R.kies(NAMEN), mnd = R.kies(MAANDEN);
          var rijen = [[mnd, 'erbij', 'eraf'], ['beginsaldo', kaal(B / 100), '']].concat(ink.map(function(x){ return [x[0], kaal(x[1] / 100), '']; }), uit.map(function(x){ return [x[0], '', kaal(x[1] / 100)]; }));
          var b = tabel(rijen);
          return { context:'Het huishoudboekje van ' + wie + ' voor ' + mnd + ', in euro\'s. Wat is het eindsaldo?', vraag:'Eindsaldo van ' + mnd, beeld:b, zelfBeeld:b,
            stappen:[
              { tekst:'Inkomsten samen =', antwoord:bedr(ti / 100), hint:ink.map(function(x){ return kaal(x[1] / 100); }).join(' + ') + '. Het beginsaldo is geen inkomsten.', fout:FB((ti + B) / 100, 'Je telde het beginsaldo mee. Dat is geen inkomsten: dat geld was er al.') },
              { tekst:'Uitgaven samen =', antwoord:bedr(tu / 100), hint:uit.map(function(x){ return kaal(x[1] / 100); }).join(' + ') + '.' },
              { tekst:'Eindsaldo = ' + kaal(B / 100) + ' + ' + kaal(ti / 100) + ' ' + MIN + ' ' + kaal(tu / 100) + ' =', antwoord:bedr(E / 100), hint:'Beginsaldo plus inkomsten, en dan de uitgaven eraf.', fout:FB((ti - tu) / 100, 'Vergeet het beginsaldo niet: dat geld was er al.') } ] };
        } },
      { id:'ec-budget-post', naam:'Het huishoudboekje kloppend maken', kort:'Reken uit hoeveel er in totaal uitgegeven is en trek de bekende uitgaven eraf',
        uit:'<p>Soms klopt een huishoudboekje niet: je bent een uitgave vergeten op te schrijven. Het eindsaldo weet je wel, want dat staat op je rekening.</p><p>Begin + inkomsten is alles wat je had. Min het eindsaldo is wat er <b>in totaal uitgegeven</b> is.</p><p>Trek daar de uitgaven af die je wel weet. Wat overblijft is de <b>vergeten uitgave</b>.</p>',
        wanneer:'je een bedrag mist en wilt dat je overzicht klopt.',
        maak:function(R){
          var cent = R.heel(0, 1) === 1, B = bedragC(R, 20, 150, cent), ink, uit, ti, tu, E;
          for (var i = 0; i < 50; i++){
            ink = kies(R, INKOMST, 2).map(function(x){ return [x[0], bedragC(R, x[1], x[2], cent)]; });
            uit = kies(R, UITGAVE, 4).map(function(x){ return [x[0], bedragC(R, x[1], x[2], cent)]; });
            ti = ink.reduce(function(a, x){ return a + x[1]; }, 0); tu = uit.reduce(function(a, x){ return a + x[1]; }, 0); E = B + ti - tu;
            if (E > 0) break;
          }
          if (E <= 0){ B += tu; E = B + ti - tu; }
          var mis = R.heel(0, uit.length - 1), bekend = tu - uit[mis][1];
          var rijen = [['mei', 'erbij', 'eraf'], ['beginsaldo', kaal(B / 100), '']].concat(ink.map(function(x){ return [x[0], kaal(x[1] / 100), '']; }), uit.map(function(x, k){ return [x[0], '', k === mis ? '?' : kaal(x[1] / 100)]; }));
          var b = tabel(rijen);
          return { context:'Het huishoudboekje van Daan voor mei, in euro\'s. Op zijn rekening staat aan het eind ' + eu(E / 100) + '. Hoeveel gaf hij uit aan ' + uit[mis][0] + '?', vraag:'Wat kostte ' + uit[mis][0] + '?', beeld:b, zelfBeeld:b,
            stappen:[
              { tekst:'Alles wat Daan had: beginsaldo + inkomsten =', antwoord:bedr((B + ti) / 100), hint:kaal(B / 100) + ' + ' + ink.map(function(x){ return kaal(x[1] / 100); }).join(' + ') + '.' },
              { tekst:'In totaal uitgegeven: ' + kaal((B + ti) / 100) + ' ' + MIN + ' ' + kaal(E / 100) + ' =', antwoord:bedr(tu / 100), hint:'Wat hij had, min wat er aan het eind nog over is.' },
              { tekst:'De uitgaven die je wel weet, samen =', antwoord:bedr(bekend / 100), hint:uit.filter(function(x, k){ return k !== mis; }).map(function(x){ return kaal(x[1] / 100); }).join(' + ') + '.' },
              { tekst:hoofd(uit[mis][0]) + ': ' + kaal(tu / 100) + ' ' + MIN + ' ' + kaal(bekend / 100) + ' =', antwoord:bedr(uit[mis][1] / 100), hint:'Het totaal min de bekende uitgaven.' } ] };
        } },
      { id:'ec-budget-sparen', naam:'Sparen voor een doel', kort:'Reken uit hoeveel je nog nodig hebt, deel door wat je per week spaart en rond naar boven af',
        uit:'<p>Je wilt iets kopen en spaart er elke week voor. Hoe lang duurt dat?</p><p>Reken eerst uit hoeveel je <b>nog nodig</b> hebt: de prijs min wat je al hebt. Deel dat door wat je <b>per week</b> spaart.</p><p>Komt er een kommagetal uit? Dan rond je <b>naar boven</b> af. Na 12 weken heb je nog net te weinig, dus je hebt 13 weken nodig.</p>',
        wanneer:'je wilt weten wanneer je genoeg geld hebt.',
        maak:function(R){
          var w = R.heel(2, 10) * 4, k = R.heel(4, 20), fr = R.kies([0, 0.25, 0.5, 0.75, 0.5]), nodig = Math.round(w * (k + fr)), A = R.heel(0, 12) * 5, D = nodig + A, q = nodig / w, wk = Math.ceil(q - 1e-9);
          var wat = R.kies(['een nieuwe telefoon', 'een koptelefoon', 'een fiets', 'een spelcomputer', 'concertkaartjes', 'een skateboard', 'nieuwe sneakers', 'een tablet']);
          var st = [ { tekst:'Nog nodig: ' + eu(D) + ' ' + MIN + ' ' + eu(A) + ' =', antwoord:bedr(nodig), hint:'De prijs min wat je al gespaard hebt.' },
            { tekst:'Delen: ' + eu(nodig) + ' : ' + eu(w) + ' =', antwoord:[tn(q)], hint:'Hoe vaak past ' + w + ' in ' + nodig + '?', fout:F(tn(D / w), 'Deel wat je nog nodig hebt, niet de hele prijs.') },
            { tekst:'Hoeveel hele weken moet je sparen?', antwoord:String(wk), hint:fr ? 'Na ' + Math.floor(q) + ' weken heb je nog net te weinig. Rond naar boven af.' : 'Het komt precies uit: ' + wk + ' weken.', fout:fr ? F(Math.floor(q), 'Na ' + Math.floor(q) + ' weken heb je nog net te weinig. Rond naar boven af.') : {} } ];
          if (!A) st[0] = { tekst:'Je hebt nog niets gespaard. Je hebt dus nodig:', antwoord:bedr(nodig), hint:'De hele prijs.' };
          return { context:'Je spaart voor ' + wat + ' van ' + eu(D) + '. ' + (A ? 'Je hebt al ' + eu(A) + '.' : 'Je hebt nog niets.') + ' Je spaart elke week ' + eu(w) + '.', vraag:'Hoeveel weken sparen?', eenheid:'weken', stappen:st };
        } },
      { id:'ec-afbetaling', naam:'Kopen op afbetaling: wat kost het lenen?', kort:'Tel de aanbetaling en alle termijnen op en trek de gewone prijs ervan af',
        uit:'<p>Bij <b>kopen op afbetaling</b> betaal je niet alles in een keer. Je betaalt eerst een deel (de <b>aanbetaling</b>) en daarna elke maand een bedrag (een <b>termijn</b>).</p><p>Tel alles op wat je betaalt: aanbetaling + alle termijnen. Meestal is dat meer dan de gewone prijs (de <b>contante prijs</b>).</p><p>Het verschil is wat het lenen je kost: de <b>kredietkosten</b>.</p>',
        wanneer:'je wilt weten of betalen in termijnen duurder is.',
        maak:function(R){
          var it = R.kies(SPUL21.filter(function(x){ return x[2] >= 200; })), C = R.heel(Math.max(150, it[1]), it[2]), A = R.kies([25, 50, 75, 100, 150]), n = R.kies([6, 10, 12, 18, 24]);
          var t = Math.ceil((C - A) * (1 + R.heel(5, 22) / 100) / n), tot = n * t, totaal = A + tot;
          return { context:o2(it[0]) + ' kost contant ' + eu(C) + '. Je kunt ook ' + eu(A) + ' aanbetalen en daarna ' + n + ' maanden ' + eu(t) + ' per maand betalen. Wat kost het lenen?', vraag:'Kredietkosten?',
            stappen:[
              { tekst:'Alle termijnen samen: ' + n + ' ' + X + ' ' + eu(t) + ' =', antwoord:bedr(tot), hint:'Het bedrag per maand keer het aantal maanden.' },
              { tekst:'Alles wat je betaalt: ' + eu(A) + ' + ' + eu(tot) + ' =', antwoord:bedr(totaal), hint:'Vergeet de aanbetaling niet.' },
              { tekst:'Kosten van het lenen: ' + eu(totaal) + ' ' + MIN + ' ' + eu(C) + ' =', antwoord:bedr(totaal - C), hint:'Wat je in totaal betaalt min de contante prijs.', fout:FB(tot - C, 'Je bent de aanbetaling vergeten.') } ] };
        } }
    ] });
  function o2(s){ return hoofd(s); }

  /* ================= 3 SPAREN EN RENTE (onderbouw) ================= */
  function spaar(R, p){
    for (var i = 0; i < 200; i++){ var S = R.heel(4, 60) * 50; if (Math.abs(S * p - Math.round(S * p)) < 1e-9) return S; }
    return 1000;
  }
  G.push({ groep:{ id:'ec-rente', niveau:'onderbouw', domein:'geld', naam:'Sparen en rente',
      uit:'Rente uitrekenen: over een jaar, enkelvoudig over meer jaren, en samengesteld, waarbij je ook rente krijgt over de rente.' },
    doelen:[
      { id:'ec-rente-jaar', naam:'Rente over een jaar', kort:'Rente is een procent van je saldo: reken 1% uit en doe dat keer het rentepercentage',
        uit:'<p>Zet je geld op een spaarrekening, dan krijg je van de bank <b>rente</b>. De rente is een procent van het geld op je rekening (je <b>saldo</b>).</p><p>Reken 1% uit (deel door 100) en doe dat keer het rentepercentage.</p><p>€ 1.200 met 2,5% rente: 1% is € 12, de rente is 2,5 ' + X + ' € 12 = € 30. Na een jaar heb je € 1.230.</p>',
        wanneer:'je wilt weten hoeveel rente je na een jaar krijgt.',
        maak:function(R){
          var p = R.kies([0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]), S = spaar(R, p), ren = S * p / 100;
          return { context:'Je hebt ' + eu(S) + ' op je spaarrekening. De rente is ' + tn(p) + '% per jaar.', vraag:tn(p) + '% rente over ' + eu(S),
            stappen:[
              { tekst:'1% van ' + eu(S) + ' =', antwoord:bedr(S / 100), hint:'Deel door 100.' },
              { tekst:'De rente: ' + tn(p) + ' ' + X + ' ' + eu(S / 100) + ' =', antwoord:bedr(ren), hint:p % 1 ? tn(Math.floor(p)) + ' keer ' + kaal(S / 100) + ', plus de helft van ' + kaal(S / 100) + '.' : p + ' keer ' + kaal(S / 100) + '.' },
              { tekst:'Na een jaar heb je ' + eu(S) + ' + ' + eu(ren) + ' =', antwoord:bedr(S + ren), hint:'Je saldo plus de rente.', fout:FB(ren, 'Dat is alleen de rente. Tel hem op bij je saldo.') } ] };
        } },
      { id:'ec-rente-enkel', naam:'Enkelvoudige rente over meer jaren', kort:'Je krijgt elk jaar rente over het beginbedrag: rente per jaar keer het aantal jaren',
        uit:'<p>Bij <b>enkelvoudige rente</b> krijg je elk jaar rente over hetzelfde bedrag: het <b>beginbedrag</b>. De rente wordt niet bij je spaargeld gezet, dus je krijgt geen rente over rente.</p><p>De rente is dan elk jaar even groot. Reken de rente over één jaar uit en doe die keer het aantal jaren.</p><p>€ 2.000 met 3% enkelvoudige rente, 4 jaar: elk jaar € 60, samen 4 ' + X + ' € 60 = € 240.</p>',
        wanneer:'de rente elk jaar over hetzelfde bedrag gaat.',
        maak:function(R){
          var p = R.kies([1, 1.5, 2, 2.5, 3, 4, 5]), S = spaar(R, p), n = R.heel(2, 6), ren = S * p / 100;
          return { context:'Je zet ' + eu(S) + ' vast voor ' + n + ' jaar. De bank geeft ' + tn(p) + '% enkelvoudige rente per jaar. Hoeveel heb je na ' + n + ' jaar?', vraag:eu(S) + ', ' + tn(p) + '%, ' + n + ' jaar enkelvoudig',
            stappen:[
              { tekst:'Rente per jaar: ' + tn(p) + '% van ' + eu(S) + ' =', antwoord:bedr(ren), hint:'1% is ' + kaal(S / 100) + '. Doe dat keer ' + tn(p) + '.' },
              { tekst:'Rente in ' + n + ' jaar: ' + n + ' ' + X + ' ' + eu(ren) + ' =', antwoord:bedr(n * ren), hint:'Elk jaar dezelfde rente.' },
              { tekst:'Na ' + n + ' jaar: ' + eu(S) + ' + ' + eu(n * ren) + ' =', antwoord:bedr(S + n * ren), hint:'Beginbedrag plus alle rente.', fout:FB(n * ren, 'Dat is alleen de rente. Tel het beginbedrag erbij.') } ] };
        } },
      { id:'ec-rente-samen', naam:'Samengestelde rente: jaar na jaar', kort:'De rente komt bij je saldo, dus het volgende jaar krijg je rente over een groter bedrag',
        uit:'<p>Bij <b>samengestelde rente</b> komt de rente elk jaar bij je spaargeld. Het jaar erna krijg je rente over het nieuwe, grotere saldo. Je krijgt dus ook <b>rente over rente</b>.</p><p>Reken jaar voor jaar: rente uitrekenen, bij het saldo tellen, en dan opnieuw.</p><p>€ 1.000 met 10%: na jaar 1 € 1.100, na jaar 2 € 1.100 + € 110 = € 1.210.</p>',
        wanneer:'de rente elk jaar bij je spaargeld wordt gezet.',
        maak:function(R){
          var p, S, S1, r1v, r2v;
          for (var i = 0; i < 300; i++){
            p = R.kies([2, 4, 5, 5, 10, 2.5]); S = R.heel(4, 80) * 50; r1v = S * p / 100; S1 = S + r1v; r2v = S1 * p / 100;
            if (Math.abs(r1v * 100 - Math.round(r1v * 100)) < 1e-6 && Math.abs(r2v * 100 - Math.round(r2v * 100)) < 1e-6) break;
          }
          r1v = r2(r1v); S1 = r2(S1); r2v = r2(r2v);
          return { context:'Je zet ' + eu(S) + ' op een spaarrekening met ' + tn(p) + '% rente per jaar. De rente wordt elk jaar bij je saldo gezet. Hoeveel heb je na 2 jaar?', vraag:eu(S) + ', ' + tn(p) + '%, 2 jaar samengesteld',
            stappen:[
              { tekst:'Rente in jaar 1: ' + tn(p) + '% van ' + eu(S) + ' =', antwoord:bedr(r1v), hint:'1% is ' + kaal(S / 100) + '. Keer ' + tn(p) + '.' },
              { tekst:'Saldo na jaar 1 =', antwoord:bedr(S1), hint:kaal(S) + ' + ' + kaal(r1v) + '.' },
              { tekst:'Rente in jaar 2: ' + tn(p) + '% van ' + eu(S1) + ' =', antwoord:bedr(r2v), hint:'Nu over het nieuwe saldo: 1% is ' + kaal(S1 / 100) + '.', fout:FB(r1v, 'Dat is de rente van jaar 1. In jaar 2 krijg je rente over het nieuwe saldo, ' + kaal(S1) + '.') },
              { tekst:'Saldo na jaar 2 =', antwoord:bedr(S1 + r2v), hint:kaal(S1) + ' + ' + kaal(r2v) + '.', fout:FB(S + 2 * r1v, 'Zo reken je enkelvoudige rente. Hier krijg je in jaar 2 rente over het nieuwe saldo.') } ] };
        } }
    ] });

  /* ================= 4 GROEI, INDEXCIJFERS EN KOOPKRACHT (bovenbouw) ================= */
  /* [onderwerp, eenheid ('€' of ''), laagste, hoogste] */
  var VERAND = [['De prijs van een bioscoopkaartje', '€', 800, 1500], ['Het aantal inwoners van een dorp', '', 1200, 9000], ['De omzet van een bakkerij per week', '€', 4000, 12000],
    ['Het aantal bezoekers van een museum per maand', '', 2000, 9000], ['De prijs van een kilo kaas', '€', 900, 1800], ['Het aantal leerlingen van een school', '', 600, 1800],
    ['De huur van een appartement per maand', '€', 60000, 120000], ['Het aantal verkochte fietsen in een winkel', '', 150, 900]];
  function waarde(eh, c){ return eh === '€' ? eu(c / 100) : T.toon(c, { punt:true }); }
  function waardeAnt(eh, c){ return eh === '€' ? bedr(c / 100) : uniek([T.toon(c, { punt:true }), String(c)]); }
  /* [onderwerp, centen basisjaar laag, hoog] */
  var INDEX = [['de prijs van een brood', 200, 360], ['de gemiddelde huur per maand', 60000, 120000], ['de prijs van een bioscoopkaartje', 900, 1400],
    ['het gemiddelde loon per maand', 240000, 360000], ['de prijs van een liter melk', 100, 160], ['de prijs van een treinkaartje', 400, 900]];
  function jaren(R){ var b = R.heel(2015, 2021); return [b, b + 1, b + 2, b + 3, b + 4]; }

  G.push({ groep:{ id:'ec-index', niveau:'bovenbouw', domein:'geld', naam:'Groei, indexcijfers en koopkracht',
      uit:'Procentuele verandering, groei met de groeifactor, indexcijfers uitrekenen en terugrekenen, verandering tussen twee indexcijfers en de verandering van je koopkracht.' },
    doelen:[
      { id:'ec-procverand', naam:'Procentuele verandering', kort:'Nieuw min oud, gedeeld door oud, keer 100',
        uit:'<p>Hoeveel procent is iets gestegen of gedaald? Dat is de <b>procentuele verandering</b>.</p><p>Reken eerst het <b>verschil</b> uit: nieuw ' + MIN + ' oud. Deel het verschil door de <b>oude</b> waarde. Doe de uitkomst keer 100.</p><p>Van € 80 naar € 92: (92 ' + MIN + ' 80) : 80 ' + X + ' 100 = 15%. Bij een daling is het verschil negatief, en de verandering ook.</p>',
        wanneer:'je wilt weten hoeveel procent iets groter of kleiner is geworden.',
        maak:function(R){
          var it = R.kies(VERAND), p, O, N;
          for (var i = 0; i < 300; i++){ p = R.kies([-40, -35, -30, -25, -20, -15, -12, -10, -8, -5, -4, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60]);
            O = it[1] === '€' ? R.heel(it[2] / 5, it[3] / 5) * 5 : R.heel(it[2] / 5, it[3] / 5) * 5; if ((O * (100 + p)) % 100 === 0) break; }
          N = O * (100 + p) / 100;
          var V = N - O, d = p / 100;
          return { context:it[0] + ' ging van ' + waarde(it[1], O) + ' naar ' + waarde(it[1], N) + '. Hoeveel procent is de verandering?' + (p < 0 ? ' Een daling krijgt een min.' : ''), vraag:waarde(it[1], O) + ' → ' + waarde(it[1], N),
            stappen:[
              { tekst:'Verschil: nieuw ' + MIN + ' oud = ' + waarde(it[1], N) + ' ' + MIN + ' ' + waarde(it[1], O) + ' =', antwoord:waardeAnt(it[1], V), hint:V < 0 ? 'Het nieuwe getal is kleiner, dus het verschil is negatief.' : 'Het nieuwe getal min het oude.', fout:V < 0 ? samen(F(String(-V), 'Het is gedaald, dus het verschil krijgt een min.'), it[1] === '€' ? FB(-V / 100, 'Het is gedaald, dus het verschil krijgt een min.') : {}) : {} },
              { tekst:'Deel door de oude waarde: ' + (it[1] === '€' ? kaal(V / 100) + ' : ' + kaal(O / 100) : tn(V) + ' : ' + tn(O)) + ' =', antwoord:[tn(d)], hint:'Deel door het oude getal, ' + (it[1] === '€' ? kaal(O / 100) : tn(O)) + '.', fout:F(tn(r2(V / N)), 'Je deelde door de nieuwe waarde. Deel door de oude.') },
              { tekst:'Keer 100: de verandering is', antwoord:pc(p), eenheid:'%', hint:tn(d) + ' ' + X + ' 100.' } ] };
        } },
      { id:'ec-groeifactor', naam:'Samengestelde rente met de groeifactor', kort:'Elk jaar keer de groeifactor: eindbedrag = beginbedrag ' + X + ' groeifactor tot de macht het aantal jaren',
        uit:'<p>Bij samengestelde rente groeit je geld elk jaar met hetzelfde percentage. Bij 3% rente heb je na een jaar 103% van je geld: keer <b>1,03</b>. Dat is de <b>groeifactor</b>.</p><p>Na 5 jaar heb je 5 keer met 1,03 vermenigvuldigd: beginbedrag ' + X + ' 1,03<sup>5</sup>.</p><p>€ 2.000 met 3%, 5 jaar: 2.000 ' + X + ' 1,03<sup>5</sup> = € 2.318,55 (afgerond op centen).</p>',
        wanneer:'je geld over meer jaren groeit en je een rekenmachine hebt.',
        maak:function(R){
          var p = R.kies([1, 1.5, 2, 2.5, 3, 3.5, 4, 5]), S = R.heel(10, 100) * 50, n = R.heel(3, 10), g = 1 + p / 100, E = r2(S * Math.pow(g, n)), SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
          var macht = String(n).split('').map(function(c){ return SUP.charAt(+c); }).join('');
          return { context:'Je zet ' + eu(S) + ' op een rekening met ' + tn(p) + '% rente per jaar. De rente wordt elk jaar bijgeschreven. Hoeveel staat er na ' + n + ' jaar op? Rond af op centen.', vraag:eu(S) + ', ' + tn(p) + '%, ' + n + ' jaar',
            stappen:[
              { tekst:'De groeifactor per jaar = 1 + ' + tn(p) + ' : 100 =', antwoord:[tn(g)], hint:'100% + ' + tn(p) + '% = ' + tn(100 + p) + '%, als kommagetal ' + tn(g) + '.', fout:F(tn(p / 100), 'Dat is alleen de rente. Je houdt ook je eigen geld: 1 + ' + tn(p / 100) + '.') },
              { tekst:'Hoe vaak doe je keer de groeifactor?', antwoord:String(n), hint:'Een keer per jaar, ' + n + ' jaar lang.' },
              { tekst:'Eindbedrag = ' + kaal(S) + ' ' + X + ' ' + tn(g) + macht + ' =', antwoord:bedr(E).concat(bedr(E + 0.01), bedr(E - 0.01)), hint:'Typ op je rekenmachine ' + S + ' ' + X + ' ' + tn(g) + ' ^ ' + n + '.', fout:FB(S * (1 + n * p / 100), 'Zo reken je enkelvoudige rente. Hier groeit ook de rente mee: gebruik de macht.') } ] };
        } },
      { id:'ec-index-reken', naam:'Een indexcijfer uitrekenen', kort:'Deel de waarde door de waarde in het basisjaar en doe keer 100',
        uit:'<p>Met een <b>indexcijfer</b> zie je snel hoeveel iets veranderd is. Je kiest een <b>basisjaar</b>. Dat jaar krijgt indexcijfer <b>100</b>.</p><p>Voor een ander jaar deel je de waarde door de waarde in het basisjaar, en doe je keer 100.</p><p>Een brood kostte in het basisjaar € 2,50 en nu € 2,80: 2,80 : 2,50 ' + X + ' 100 = 112. Het brood is dus 12% duurder geworden.</p>',
        wanneer:'je veranderingen wilt vergelijken, ook van heel verschillende bedragen.',
        maak:function(R){
          var it = R.kies(INDEX), j = jaren(R), bi = R.heel(0, 1), B, idx = [], waarden = [];
          for (var t = 0; t < 400; t++){
            B = R.heel(it[1] / 10, it[2] / 10) * 10; idx = []; waarden = [];
            var ok = true;
            for (var k = 0; k < 4; k++){ var I = k === bi ? 100 : 100 + R.heel(-6, 40) / 2 * (k > bi ? 1 : -0.5); I = Math.round(I * 2) / 2; var c = B * I / 100; if (Math.abs(c - Math.round(c)) > 1e-9 || (k !== bi && I === 100)) { ok = false; break; } idx.push(I); waarden.push(Math.round(c)); }
            if (ok) break;
          }
          if (idx.length < 4){ B = 1000; idx = bi ? [96, 100, 104, 110] : [100, 104, 110, 115]; waarden = idx.map(function(I){ return B * I / 100; }); }
          var vk = R.kies([0, 1, 2, 3].filter(function(k){ return k !== bi; }));
          var rijen = [['jaar'].concat(j.slice(0, 4).map(String)), [it[0] + ' (€)'].concat(waarden.map(function(c){ return kaal(c / 100); }))];
          var b = ktabel(rijen, { kop:true, zijkop:true, nadruk:[[1, bi + 1]] });
          var q = idx[vk] / 100;
          return { context:'In de tabel zie je ' + it[0] + '. Het basisjaar is ' + j[bi] + ' (index 100). Wat is het indexcijfer in ' + j[vk] + '? Rond af op één decimaal.', vraag:'Index ' + j[vk] + ' (basisjaar ' + j[bi] + ')', beeld:b, zelfBeeld:b,
            stappen:[
              { tekst:'De waarde in het basisjaar ' + j[bi] + ' =', antwoord:bedr(B / 100), hint:'Kijk in de tabel bij ' + j[bi] + '.' },
              { tekst:'Deel: ' + kaal(waarden[vk] / 100) + ' : ' + kaal(B / 100) + ' =', antwoord:[tn(q)], hint:'De waarde in ' + j[vk] + ' gedeeld door de waarde in het basisjaar.', fout:F(tn(r2(B / waarden[vk])), 'Je deelde andersom. De waarde van ' + j[vk] + ' moet boven: ' + kaal(waarden[vk] / 100) + ' : ' + kaal(B / 100) + '.') },
              { tekst:'Keer 100: het indexcijfer is', antwoord:[tn(idx[vk])], hint:tn(q) + ' ' + X + ' 100.' } ] };
        } },
      { id:'ec-index-terug', naam:'Van indexcijfer naar bedrag', kort:'Het indexcijfer gedeeld door 100 is de factor: doe de waarde in het basisjaar keer die factor',
        uit:'<p>Weet je het indexcijfer, dan kun je het bedrag terugrekenen.</p><p>Indexcijfer 115 betekent: <b>115%</b> van het basisjaar. Als factor is dat <b>1,15</b>.</p><p>Kostte iets in het basisjaar € 40, dan kost het nu 1,15 ' + X + ' € 40 = € 46.</p>',
        wanneer:'je het indexcijfer weet en het bedrag zoekt.',
        maak:function(R){
          var it = R.kies(INDEX), j = jaren(R), B, I, c;
          for (var t = 0; t < 300; t++){ B = R.heel(it[1] / 10, it[2] / 10) * 10; I = R.kies([85, 90, 92, 95, 96, 104, 105, 106, 108, 110, 112, 115, 118, 120, 124, 125, 130, 135, 140, 102.5, 107.5, 112.5]); c = B * I / 100; if (Math.abs(c - Math.round(c)) < 1e-9) break; }
          c = Math.round(c);
          return { context:'In ' + j[0] + ' (het basisjaar, index 100) was ' + it[0] + ' ' + eu(B / 100) + '. In ' + j[4] + ' is het indexcijfer ' + tn(I) + '. Wat was ' + it[0] + ' in ' + j[4] + '?', vraag:'Index ' + tn(I) + ', basis ' + eu(B / 100),
            stappen:[
              { tekst:'Indexcijfer ' + tn(I) + ' als factor = ' + tn(I) + ' : 100 =', antwoord:[tn(I / 100)], hint:'Index ' + tn(I) + ' betekent ' + tn(I) + '% van het basisjaar.' },
              { tekst:'Het bedrag: ' + tn(I / 100) + ' ' + X + ' ' + eu(B / 100) + ' =', antwoord:bedr(c / 100), hint:'De waarde in het basisjaar keer de factor.', fout:F(tn(c), 'Je deed keer ' + tn(I) + '. Deel het indexcijfer eerst door 100.') } ] };
        } },
      { id:'ec-index-verand', naam:'Verandering tussen twee indexcijfers', kort:'Indexpunten zijn geen procenten: deel het verschil door het eerste indexcijfer en doe keer 100',
        uit:'<p>Van index 120 naar index 126 is <b>6 indexpunten</b>. Maar het is geen 6% erbij! Dat geldt alleen als je vanaf 100 begint.</p><p>Reken het als een gewone procentuele verandering: het <b>verschil</b> gedeeld door het <b>eerste</b> indexcijfer, keer 100.</p><p>(126 ' + MIN + ' 120) : 120 ' + X + ' 100 = 5%.</p>',
        wanneer:'je de verandering tussen twee jaren zoekt die allebei niet het basisjaar zijn.',
        maak:function(R){
          var j = jaren(R), a, b;
          do { a = R.heel(95, 140) + R.kies([0, 0, 0.5]); b = a + R.kies([-1, 1, 1, 1]) * R.heel(2, 15) + R.kies([0, 0, 0.5]); } while (a === 100 || b === a || b <= 80);
          var v = b - a, pr = r1(v / a * 100), wat = R.kies(['De prijsindex', 'De loonindex', 'Het indexcijfer van de huurprijzen', 'De index van de energieprijzen']);
          return { context:'In ' + j[2] + ' was ' + wat.charAt(0).toLowerCase() + wat.slice(1) + ' ' + tn(a) + ' en in ' + j[3] + ' ' + tn(b) + '. Met hoeveel procent veranderde het? Rond af op één decimaal.', vraag:'index ' + tn(a) + ' → ' + tn(b),
            stappen:[
              { tekst:'Verschil in indexpunten: ' + tn(b) + ' ' + MIN + ' ' + tn(a) + ' =', antwoord:[tn(v)], hint:'Het nieuwe indexcijfer min het oude.' },
              { tekst:'Procentuele verandering: ' + tn(v) + ' : ' + tn(a) + ' ' + X + ' 100 =', antwoord:pc(pr), eenheid:'%', hint:'Deel door het eerste indexcijfer, ' + tn(a) + ', en doe keer 100. Rond af op één decimaal.',
                fout:samen(F(tn(v), 'Dat zijn indexpunten. Deel ze nog door ' + tn(a) + ' en doe keer 100.', tn(v) + '%', 'Dat zijn indexpunten. Deel ze nog door ' + tn(a) + ' en doe keer 100.'), F(tn(r1(v / b * 100)), 'Je deelde door het nieuwe indexcijfer. Deel door het eerste, ' + tn(a) + '.')) } ] };
        } },
      { id:'ec-koopkracht', naam:'De verandering van je koopkracht', kort:'Reële index = loonindex : prijsindex ' + X + ' 100. De koopkracht verandert met de reële index min 100',
        uit:'<p>Je <b>koopkracht</b> is hoeveel je kunt kopen van je inkomen. Stijgt je loon, maar stijgen de prijzen nog harder, dan kun je toch minder kopen.</p><p>Maak van de stijgingen indexcijfers: 3% erbij is index 103. Reken dan de <b>reële index</b> uit: loonindex gedeeld door prijsindex, keer 100.</p><p>Loon +3%, prijzen +5%: 103 : 105 ' + X + ' 100 = 98,1. De koopkracht daalt dus met 1,9%. (Ongeveer 3 ' + MIN + ' 5 = ' + MIN + '2%.)</p>',
        wanneer:'je wilt weten of je er echt op vooruit of achteruit gaat.',
        maak:function(R){
          var l, pz; do { l = R.heel(1, 14) / 2; pz = R.heel(1, 16) / 2; } while (l === pz);
          var L = 100 + l, P = 100 + pz, reeel = r1(L / P * 100), k = r1(reeel - 100);
          return { context:'Dit jaar stijgen de lonen met ' + tn(l) + '% en de prijzen met ' + tn(pz) + '%. Met hoeveel procent verandert de koopkracht? Rond de reële index af op één decimaal.', vraag:'loon +' + tn(l) + '%, prijzen +' + tn(pz) + '%',
            stappen:[
              { tekst:'Loonindex = 100 + ' + tn(l) + ' =', antwoord:[tn(L)], hint:'Het loon stijgt met ' + tn(l) + '%: van 100 naar ' + tn(L) + '.' },
              { tekst:'Prijsindex = 100 + ' + tn(pz) + ' =', antwoord:[tn(P)], hint:'De prijzen stijgen met ' + tn(pz) + '%.' },
              { tekst:'Reële index = ' + tn(L) + ' : ' + tn(P) + ' ' + X + ' 100 =', antwoord:[tn(reeel)], hint:'Loonindex gedeeld door prijsindex, keer 100. Rond af op één decimaal.', fout:F(tn(r1(P / L * 100)), 'Je deelde andersom. De loonindex moet boven.') },
              { tekst:'De koopkracht verandert met ' + tn(reeel) + ' ' + MIN + ' 100 =', antwoord:pc(k), eenheid:'%', hint:k < 0 ? 'Onder de 100 is een daling: de uitkomst krijgt een min.' : 'Boven de 100 is een stijging.', fout:k < 0 ? F(tn(-k), 'De reële index is onder de 100. De koopkracht daalt: zet er een min voor.') : {} } ] };
        } }
    ] });

  LEERROUTE.voeg('economie', G);
})();
