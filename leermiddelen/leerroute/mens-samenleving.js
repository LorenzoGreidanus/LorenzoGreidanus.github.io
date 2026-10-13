/* De leerroute mens en maatschappij, samenleving: feit of mening, standpunt en argument,
   drogredenen, een nieuwsbericht controleren met een stappenplan, cijfers uit een tabel of
   grafiek lezen en een percentage of verandering uitrekenen, strafrecht of civiel recht en de
   stappen van een strafzaak. Alle cijfers, plaatsen en berichten zijn verzonnen.
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var T = LEERROUTE.R, X = '×', MIN = '−', G = [];
  var NU = new Date().getFullYear();

  /* ---------- hulpjes ---------- */
  function tn(x){ return T.toon(x); }
  function tp(x){ return T.toon(x, { punt:true }); }
  function uniek(l){ var u = []; l.forEach(function(x){ if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function aant(x){ return uniek([tp(x), String(x)]); }
  function r1(x){ return Math.round((x + (x >= 0 ? 1e-9 : -1e-9)) * 10) / 10; }
  function pc(p){ var t = tn(p); return [t, t + '%', t + ' %']; }
  function F(){ var o = {}; for (var i = 0; i + 1 < arguments.length; i += 2) if (arguments[i] != null) o[String(arguments[i]).toLowerCase()] = arguments[i + 1]; return o; }
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
    return '<table class="lr-tabel" style="font-size:.85rem;border-spacing:3px">' + rijen.map(function(r, ri){
      return '<tr>' + r.map(function(c, ci){ var t = (o.kop && ri === 0) || (o.zijkop && ci === 0) ? 'th' : 'td';
        return '<' + t + ' style="padding:5px 8px;min-width:0"' + (nad[ri + ',' + ci] ? ' class="nadruk"' : '') + '>' + (c === '?' ? '<b class="lr-vraagt">?</b>' : (o.html ? c : T.schoon(c))) + '</' + t + '>'; }).join('') + '</tr>';
    }).join('') + '</table>';
  }
  function hoofd(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
  var KAART = 'font-size:1rem;font-weight:400;letter-spacing:0;margin:10px auto;border:1px solid var(--rand2)';
  var GRIJS = 'font-size:.86rem;color:var(--muted)';
  function woorden(zin, niet){ return zin.replace(/[.,]/g, '').split(' ').filter(function(w){ return w.length > 3 && niet.indexOf(w) < 0 && !/^\d+$/.test(w); }); }
  var GEMEENTE = ['Zandhoven', 'Bergeling', 'Waterdam', 'Lindewijk', 'Oosterhoek', 'Veldmeer', 'Kreekdorp', 'Heidelo'];

  /* ================= 1 FEIT, MENING EN ARGUMENT (onderbouw, denken) ================= */
  var FM = [
    ['Nederland heeft twaalf provincies.', ''], ['De Tweede Kamer heeft 150 leden.', ''], ['In Nederland mag je stemmen vanaf je achttiende.', ''], ['De Eerste Kamer heeft 75 leden.', ''],
    ['De regering en de Tweede Kamer zitten in Den Haag.', ''], ['Amsterdam is de hoofdstad van Nederland.', ''], ['De koning ondertekent nieuwe wetten.', ''],
    ['De Tweede Kamer wordt normaal gesproken elke vier jaar gekozen.', ''], ['De gemeenteraad wordt elke vier jaar gekozen.', ''], ['Een rechter beslist of iemand schuldig is.', ''],
    ['Stemmen vanaf zestien is een slecht idee.', 'slecht'], ['De Tweede Kamer heeft veel te veel leden.', 'te veel'], ['Politici zijn saaie mensen.', 'saaie'],
    ['Den Haag is de mooiste stad van Nederland.', 'mooiste'], ['De regering moet meer geld aan onderwijs geven.', 'moet'], ['Verkiezingen zijn hartstikke belangrijk.', 'hartstikke belangrijk'],
    ['Het is beter om op een kleine partij te stemmen.', 'beter'], ['De koning verdient te veel geld.', 'te veel'], ['Het nieuwe zwembad is een geweldig plan.', 'geweldig'],
    ['Straffen voor winkeldieven zijn veel te licht.', 'te licht']];
  var SA = [
    ['de school moet een gratis fruitkraam krijgen', 'met gratis fruit eten leerlingen gezonder'], ['mobiele telefoons moeten in de klas uit', 'zonder telefoon letten leerlingen beter op'],
    ['de gemeente moet meer fietspaden aanleggen', 'fietsen is goed voor het milieu'], ['jongeren van zestien moeten mogen stemmen', 'de besluiten van de politiek gaan ook over hun toekomst'],
    ['er moet een verbod op vuurwerk komen', 'elk jaar raken mensen gewond door vuurwerk'], ['de bibliotheek moet langer open blijven', 'leerlingen kunnen daar na school rustig huiswerk maken'],
    ['schooluniformen zijn een goed idee', 'met een uniform ziet niemand wie dure kleren heeft'], ['het skatepark moet blijven', 'jongeren hebben in de buurt geen andere plek om te sporten'],
    ['de bus moet vaker rijden', 'veel mensen in het dorp hebben geen auto'], ['snoepautomaten moeten uit de school', 'snoep is slecht voor je tanden']];
  /* drogredenen: [naam, wat er mis is, voorbeelden] */
  var DROG = [
    ['persoonlijke aanval', 'het gaat over de persoon, niet over wat hij zegt', ['Je moet niet luisteren naar Ahmed over gezond eten. Hij eet zelf elke dag patat.', 'Wat Lisa zegt over het klimaat klopt vast niet. Ze heeft een onvoldoende voor aardrijkskunde.', 'Die wethouder wil een nieuw zwembad, maar hij kan zelf niet eens zwemmen.', 'Je hoeft niet naar haar plan te luisteren, ze is pas vijftien.']],
    ['beroep op de meerderheid', 'omdat veel mensen iets vinden of doen, zou het goed of waar zijn', ['Iedereen in de klas heeft een smartphone, dus een smartphone is goed voor kinderen.', 'Miljoenen mensen kijken dit programma, dus het moet wel goed zijn.', 'Bijna niemand stemt op die partij, dus haar ideeën zijn slecht.', 'De meeste mensen geloven het, dus het is waar.']],
    ['overhaaste generalisatie', 'uit een paar gevallen wordt een conclusie over alles getrokken', ['Mijn buurjongen van achttien rijdt slecht auto. Jonge mensen kunnen dus niet autorijden.', 'Ik heb twee keer een slechte pizza gegeten in die stad. Alle restaurants daar zijn slecht.', 'Mijn telefoon van dat merk ging kapot. Dat merk maakt dus alleen maar slechte telefoons.', 'Een jongen uit 3B pestte mijn broertje. Die hele klas is dus gemeen.']],
    ['vals dilemma', 'er worden maar twee keuzes gegeven, terwijl er meer zijn', ['Of je bent voor een verbod op vuurwerk, of je vindt het niet erg dat mensen gewond raken.', 'Je doet mee met de staking, of je laat je collega\'s in de steek.', 'Of we bouwen hier huizen, of jongeren krijgen nooit een woning.', 'Of je stopt nu met gamen, of je haalt nooit je diploma.']],
    ['onjuist beroep op een autoriteit', 'iemand wordt aangehaald die geen deskundige is op dit onderwerp', ['Een bekende voetballer zegt dat deze vitaminepillen tegen griep helpen, dus het is waar.', 'Mijn oom is piloot en hij zegt dat de huizenprijzen volgend jaar dalen. Dan klopt dat dus.', 'Een beroemde zanger zegt dat je van dit drankje slimmer wordt. Dus het werkt.', 'Een acteur uit een ziekenhuisserie raadt dit medicijn aan, dus het werkt.']],
    ['verkeerd oorzakelijk verband', 'omdat iets eerder gebeurde, zou het de oorzaak zijn', ['Sinds er een nieuwe burgemeester is, regent het vaker. Het komt dus door de burgemeester.', 'Ik droeg mijn gelukssokken en we wonnen. De sokken zorgden voor de winst.', 'Na de nieuwe schoolregels kregen meer leerlingen griep. De regels maken mensen dus ziek.', 'Ik at een banaan voor de toets en haalde een negen. Bananen maken je dus slim.']]];

  G.push({ groep:{ id:'mm-denken', niveau:'onderbouw', domein:'denken', naam:'Feit, mening en argument',
      uit:'Goed nadenken over wat mensen zeggen: een feit en een mening uit elkaar halen, een standpunt en een argument herkennen, en zien wanneer een redenering niet deugt.' },
    doelen:[
      { id:'mm-feit-mening', naam:'Feit of mening', kort:'Een feit kun je nagaan. Een mening is een oordeel, met woorden als mooi, slecht, te veel of moet',
        uit:'<p>Een <b>feit</b> kun je nagaan: het klopt of het klopt niet. De Tweede Kamer heeft 150 leden.</p><p>Een <b>mening</b> is wat iemand ervan vindt. Je herkent een mening aan <b>oordeelwoorden</b>: mooi, slecht, beter, saai, te veel, moet.</p><p>Zoek dus eerst of er een oordeelwoord in de zin staat.</p>',
        wanneer:'je nieuws, posts of een debat volgt en wilt weten wat zeker is.',
        maak:function(R){
          var z = R.kies(FM), mening = !!z[1], opties = R.hussel(woorden(z[0], z[1].split(' '))).slice(0, 2), geen = 'geen: alles kun je nagaan';
          return OP({ context:'Is dit een feit of een mening?', vraag:z[0],
            stappen:[
              K(R, 'Welk woord geeft een oordeel?', mening ? z[1] : geen, mening ? opties.concat([geen]) : opties, mening ? 'Zoek het woord waarmee de schrijver zegt wat hij ervan vindt.' : 'Staat er een woord als mooi, slecht of te veel in? Of kun je alles opzoeken?'),
              V('Dus de zin is', ['een feit', 'een mening'], mening ? 'een mening' : 'een feit', mening ? 'Met een oordeelwoord is het een mening.' : 'Je kunt het nagaan: een feit.') ] });
        } },
      { id:'mm-argument', naam:'Standpunt en argument', kort:'Het standpunt is wat iemand vindt. Het argument is waarom. Signaalwoorden: want (argument volgt) en dus (standpunt volgt)',
        uit:'<p>Een <b>standpunt</b> is wat iemand vindt of wil. Een <b>argument</b> is de reden waarom.</p><p>Je herkent ze aan <b>signaalwoorden</b>. Na <b>want</b> komt het argument: "Vuurwerk moet verboden worden, want er raken mensen gewond." Na <b>dus</b> komt het standpunt: "Er raken mensen gewond, dus vuurwerk moet verboden worden."</p>',
        wanneer:'je in een discussie of tekst wilt zien wat iemand vindt en waarom.',
        maak:function(R){
          var s = R.kies(SA), want = R.heel(0, 1) === 1, zin = want ? hoofd(s[0]) + ', want ' + s[1] + '.' : hoofd(s[1]) + ', dus ' + s[0] + '.';
          return OP({ context:'Lees de zin.', vraag:zin,
            stappen:[
              K(R, 'Welk signaalwoord staat in de zin?', want ? 'want' : 'dus', want ? ['dus', 'maar'] : ['want', 'maar'], 'Zoek het woordje tussen de twee delen van de zin.'),
              K(R, 'Wat is het standpunt (wat vindt de schrijver)?', s[0], [s[1]], want ? 'Het standpunt staat voor "want".' : 'Het standpunt staat na "dus".'),
              K(R, 'Wat is het argument (waarom)?', s[1], [s[0]], want ? 'Na "want" komt het argument.' : 'Het argument staat voor "dus".') ] });
        } },
      { id:'mm-drogreden', naam:'Een drogreden herkennen', kort:'Kijk wat er mis is met de redenering en geef die fout zijn naam',
        uit:'<p>Een <b>drogreden</b> is een argument dat overtuigend klinkt, maar niet deugt. Bekende drogredenen:</p><ul>' + DROG.map(function(d){ return '<li><b>' + d[0] + '</b>: ' + d[1] + '.</li>'; }).join('') + '</ul><p>Vraag je af: wat is er mis met deze redenering?</p>',
        wanneer:'je in een discussie of reclame wilt zien of een argument echt klopt.',
        maak:function(R){
          var d = R.kies(DROG), z = R.kies(d[2]), andere = R.hussel(DROG.filter(function(x){ return x !== d; })).slice(0, 3);
          return OP({ context:'Welke drogreden zit hierin?', vraag:z,
            stappen:[
              K(R, 'Wat is er mis met de redenering?', d[1], andere.map(function(x){ return x[1]; }), 'Lees de redenering nog eens: waar gaat het eigenlijk over?'),
              K(R, 'Welke drogreden is dat?', d[0], andere.map(function(x){ return x[0]; }), hoofd(d[1]) + ': dat heet ' + d[0] + '.') ] });
        } }
    ] });

  /* ================= 2 NIEUWS EN CIJFERS (onderbouw, samenleving) ================= */
  var NIEUWS = [
    ['Gemeente {g} bouwt een nieuw zwembad', 'een woordvoerder van de gemeente', 'iemand die het weet'],
    ['Minder treinen door werk aan het spoor bij {g}', 'de spoorbeheerder', 'een reiziger op het perron'],
    ['Nieuwe regels voor e-bikes op het fietspad', 'de minister van Infrastructuur', 'iedereen'],
    ['Middelbare school in {g} krijgt zonnepanelen', 'de directeur van de school', 'een kennis van een leraar'],
    ['Zware storm verwacht aan de kust', 'het KNMI', 'een man op het strand'],
    ['Bibliotheek in {g} gaat ook op zondag open', 'de wethouder van cultuur', 'iemand op sociale media'],
    ['Busvervoer in {g} wordt duurder', 'het busbedrijf', 'een onbekende']];
  var GOEDMAKER = ['een landelijke nieuwsomroep', 'een regionale krant', 'een bekende nieuwssite met een redactie'], SLECHTMAKER = ['een onbekend account: @nieuwsflits_247', 'een site zonder naam van de maker', 'een account dat net is aangemaakt: @echtnieuws99'];
  /* een tabel met aantallen: [titel, [categorieën], laag, hoog] */
  var TAB = [['Zo komen de leerlingen van een school naar school', ['fiets', 'bus', 'lopend', 'auto', 'scooter'], 20, 400],
    ['Inwoners van {g} per leeftijdsgroep', ['0 tot 18 jaar', '18 tot 40 jaar', '40 tot 65 jaar', '65 jaar en ouder'], 2000, 9000],
    ['Zo stemden de leerlingen bij de schoolverkiezing', ['Lijst A', 'Lijst B', 'Lijst C', 'blanco'], 15, 300],
    ['Hoeveel uur per week jongeren in {g} sporten', ['0 uur', '1 tot 3 uur', '3 tot 6 uur', 'meer dan 6 uur'], 40, 600],
    ['Wat jongeren in {g} het vaakst gebruiken om nieuws te volgen', ['sociale media', 'nieuwssite', 'tv', 'krant', 'radio'], 10, 500]];
  /* verandering: [wat, laag, hoog] */
  var VER = [['Het aantal inwoners van {g}', 6000, 60000], ['Het aantal leden van de jeugdraad', 20, 200], ['Het aantal mensen dat stemde in {g}', 3000, 40000],
    ['Het aantal fietsendiefstallen in {g}', 100, 900], ['Het aantal bezoekers van de bibliotheek in {g}', 2000, 30000], ['Het aantal leerlingen van een school', 400, 1800]];
  function staven(o){
    /* o: { titel, namen, waarden, max, stap, nadruk:[i] } */
    var n = o.namen.length, W = 600, H = 300, L = 60, Rr = 580, B = 240, Tp = 20, bw = (Rr - L) / n;
    function sy(v){ return B - v / o.max * (B - Tp); }
    var s = '<svg class="lr-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + T.schoon(o.titel) + '">';
    for (var v = 0; v <= o.max + 1e-9; v += o.stap){ s += '<line x1="' + L + '" y1="' + sy(v) + '" x2="' + Rr + '" y2="' + sy(v) + '" class="as dun"/><text x="' + (L - 8) + '" y="' + (sy(v) + 5) + '" class="getal klein" style="text-anchor:end">' + tp(v) + '</text>'; }
    o.waarden.forEach(function(w, i){
      var x = L + i * bw + bw * 0.18, b = bw * 0.64;
      s += '<rect x="' + x + '" y="' + sy(w) + '" width="' + b + '" height="' + (B - sy(w)) + '" style="fill:var(--lr-' + ((o.nadruk || []).indexOf(i) >= 0 ? 2 : 1) + ');opacity:.85"/>';
      s += '<text x="' + (x + b / 2) + '" y="' + (sy(w) - 6) + '" class="getal klein">' + tp(w) + '</text>';
      s += '<text x="' + (x + b / 2) + '" y="' + (B + 22) + '" class="getal klein">' + T.schoon(o.namen[i]) + '</text>';
    });
    s += '<line x1="' + L + '" y1="' + B + '" x2="' + Rr + '" y2="' + B + '" class="as"/>';
    return s + '</svg>';
  }

  G.push({ groep:{ id:'mm-media', niveau:'onderbouw', domein:'samenleving', naam:'Nieuws en cijfers',
      uit:'Een nieuwsbericht controleren met een stappenplan, en cijfers over de samenleving uit een tabel of grafiek halen: een percentage, een verschil en een procentuele verandering.' },
    doelen:[
      { id:'mm-nieuws-check', naam:'Een nieuwsbericht controleren', kort:'Vier vragen: wie maakte het, staat er een bron bij, is het actueel, en staat het ook bij andere media? Pas bij vier keer ja vertrouw je het',
        uit:'<p>Niet alles wat je online leest, klopt. Controleer een nieuwsbericht met vier vragen:</p><ol><li><b>Wie</b> heeft het gemaakt? Een bekende nieuwsorganisatie, of een onbekend account?</li><li>Noemt het bericht een duidelijke <b>bron</b>: een organisatie, of iemand met een functie? Iets vaags als iedereen of iemand die het weet telt niet.</li><li>Is het bericht <b>actueel</b>, of is het oud nieuws?</li><li>Staat het nieuws ook bij <b>andere</b> betrouwbare media?</li></ol><p>Is het antwoord vier keer ja, dan kun je het bericht waarschijnlijk vertrouwen. Is één antwoord nee, dan vertrouw je het nog niet en deel je het niet zomaar.</p>',
        wanneer:'je een bericht ziet dat je wilt geloven of doorsturen.',
        maak:function(R){
          var it = R.kies(NIEUWS), gm = R.kies(GEMEENTE), goed = R.heel(0, 4) < 2, c = [1, 1, 1, 1];
          if (!goed){ var nee = R.hussel([0, 1, 2, 3]).slice(0, R.heel(1, 2)); nee.forEach(function(i){ c[i] = 0; }); }
          var maker = c[0] ? R.kies(GOEDMAKER) : R.kies(SLECHTMAKER), kop = it[0].replace('{g}', gm);
          var datum = c[2] ? 'vandaag' : R.heel(3, 9) + ' maart ' + (NU - R.heel(3, 6));
          var tekst = c[1] ? 'Dat meldt ' + it[1] + '.' : 'Dat zegt ' + it[2] + '.';
          var kaart = '<div class="lr-tekst" style="' + KAART + '"><p style="margin:0 0 4px;' + GRIJS + '">' + maker + ' · ' + datum + '</p><p style="margin:0 0 6px;font-weight:700;font-size:1.08rem">' + kop + '</p><p>' + tekst + '</p></div>';
          var extra = c[3] ? 'Je zoekt het op: twee andere nieuwssites melden hetzelfde.' : 'Je zoekt het op: je vindt het bericht nergens anders.';
          var ok = c.every(function(x){ return x; }), conc = ok ? 'je kunt het waarschijnlijk vertrouwen' : 'je vertrouwt het nog niet';
          return OP({ context:'Je ziet dit bericht. ' + extra + kaart, vraag:kop + ' (' + c.join('') + ')', vraagHtml:'Kun je dit bericht vertrouwen?',
            stappen:[
              V('Is de maker een bekende nieuwsorganisatie?', ['ja', 'nee'], c[0] ? 'ja' : 'nee', 'Kijk bovenaan het bericht: wie heeft het gemaakt?'),
              V('Noemt het bericht een duidelijke bron: een organisatie, of iemand met een functie?', ['ja', 'nee'], c[1] ? 'ja' : 'nee', 'Staat er een persoon of organisatie bij, zoals de gemeente of het KNMI? Of iets vaags, zoals iemand die je niet kent?'),
              V('Is het bericht actueel?', ['ja', 'nee'], c[2] ? 'ja' : 'nee', 'Kijk naar de datum bovenaan.'),
              V('Staat het nieuws ook bij andere media?', ['ja', 'nee'], c[3] ? 'ja' : 'nee', 'Lees wat je vond toen je het opzocht.'),
              V('Dus', ['je kunt het waarschijnlijk vertrouwen', 'je vertrouwt het nog niet'], conc, ok ? 'Vier keer ja.' : 'Minstens één antwoord was nee.') ] });
        } },
      { id:'mm-tabel-procent', naam:'Een percentage uit een tabel', kort:'Tel het totaal op, deel het deel door het totaal en doe keer 100',
        uit:'<p>In een tabel staan vaak aantallen. Om te vergelijken reken je ze om in <b>procenten</b>.</p><p>Tel eerst alle aantallen op: dat is het <b>totaal</b> (100%). Deel het aantal dat je zoekt door het totaal en doe keer 100.</p><p>120 van de 480 leerlingen komen met de bus: 120 : 480 ' + X + ' 100 = 25%.</p>',
        wanneer:'je cijfers over de samenleving wilt vergelijken.',
        maak:function(R){
          var t = R.kies(TAB), gm = R.kies(GEMEENTE), titel = t[0].replace('{g}', gm), w = t[1].map(function(){ return R.heel(t[2], t[3]); }), tot = w.reduce(function(a, b){ return a + b; }, 0), i = R.heel(0, t[1].length - 1), p = r1(w[i] / tot * 100);
          var b = ktabel([['', 'aantal']].concat(t[1].map(function(c, j){ return [c, tp(w[j])]; })), { kop:true });
          return { context:titel + '. Hoeveel procent is "' + t[1][i] + '"? Rond af op één decimaal.', vraag:titel + ': ' + t[1][i], vraagHtml:'Hoeveel procent is "' + t[1][i] + '"?', beeld:b, zelfBeeld:b, eenheid:'%',
            stappen:[
              { tekst:'Het totaal: ' + w.map(tp).join(' + ') + ' =', antwoord:aant(tot), hint:'Tel alle aantallen in de tabel op.' },
              { tekst:tp(w[i]) + ' : ' + tp(tot) + ' ' + X + ' 100 =', antwoord:pc(p), eenheid:'%', hint:'Deel het deel door het totaal, keer 100. Rond af op één decimaal.', fout:F(tn(r1(tot / w[i] * 100)), 'Je deelde andersom. Het deel moet boven.') } ] };
        } },
      { id:'mm-grafiek', naam:'Een staafgrafiek lezen', kort:'Lees de twee staven af en trek de kleinste van de grootste af',
        uit:'<p>In een <b>staafgrafiek</b> zie je in één oogopslag welke groep het grootst is. Het getal lees je af boven de staaf of op de as links.</p><p>Wil je weten hoeveel meer de ene groep is dan de andere? Lees beide staven af en trek de kleinste van de grootste af.</p>',
        wanneer:'je in het nieuws of een werkstuk een grafiek tegenkomt.',
        maak:function(R){
          var t = R.kies(TAB), gm = R.kies(GEMEENTE), titel = t[0].replace('{g}', gm), stap = t[3] >= 1000 ? 1000 : t[3] >= 400 ? 50 : 25;
          var w, a, b; do { w = t[1].map(function(){ return Math.round(R.heel(t[2], t[3]) / (stap / 5)) * (stap / 5); }); var p = R.hussel(t[1].map(function(c, j){ return j; })); a = p[0]; b = p[1]; } while (w[a] === w[b] || w.some(function(x){ return x <= 0; }));
          var max = Math.ceil(Math.max.apply(null, w) / stap) * stap + stap, groot = w[a] > w[b] ? a : b, klein = groot === a ? b : a;
          var g = function(n){ return staven({ titel:titel, namen:t[1], waarden:w, max:max, stap:stap, nadruk:n >= 1 ? [a, b] : [] }); };
          return { context:titel + '. Hoeveel meer is "' + t[1][groot] + '" dan "' + t[1][klein] + '"?', vraag:titel + ': ' + t[1][groot] + ' en ' + t[1][klein], vraagHtml:'Hoeveel meer is "' + t[1][groot] + '"?', beeld:g, zelfBeeld:g(0),
            stappen:[
              { tekst:'"' + hoofd(t[1][groot]) + '" =', antwoord:aant(w[groot]), hint:'Kijk naar het getal boven de staaf "' + t[1][groot] + '".' },
              { tekst:'"' + hoofd(t[1][klein]) + '" =', antwoord:aant(w[klein]), hint:'Kijk naar het getal boven de staaf "' + t[1][klein] + '".' },
              { tekst:tp(w[groot]) + ' ' + MIN + ' ' + tp(w[klein]) + ' =', antwoord:aant(w[groot] - w[klein]), hint:'De grootste min de kleinste.' } ] };
        } },
      { id:'mm-verandering', naam:'Procentuele verandering in de samenleving', kort:'Nieuw min oud, gedeeld door oud, keer 100',
        uit:'<p>Groeit of krimpt iets in de samenleving? Dat zeg je vaak in procenten.</p><p>Reken het <b>verschil</b> uit: nieuw ' + MIN + ' oud. Deel door het <b>oude</b> getal en doe keer 100.</p><p>Van 2.000 naar 2.300 inwoners: 300 : 2.000 ' + X + ' 100 = 15% groei. Een daling krijgt een min.</p>',
        wanneer:'je wilt zeggen hoe snel iets groeit of krimpt.',
        maak:function(R){
          var v = R.kies(VER), gm = R.kies(GEMEENTE), wat = v[0].replace('{g}', gm), j1 = R.heel(2015, NU - 4), j2 = j1 + R.heel(2, 4), o, n, p;
          for (var t = 0; t < 200; t++){ o = R.heel(v[1], v[2]); p = R.kies([-30, -25, -20, -15, -12, -10, -8, -5, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50]); n = o * (100 + p) / 100; if (Number.isInteger(n)) break; }
          if (!Number.isInteger(n)){ o = 1000; p = 10; n = 1100; }
          var b = ktabel([['jaar', String(j1), String(j2)], [wat.replace(/^Het aantal /, 'aantal ').replace(/ in .*$/, ''), tp(o), tp(n)]], { kop:true, zijkop:true });
          return { context:wat + ' veranderde van ' + j1 + ' naar ' + j2 + '. Met hoeveel procent?' + (p < 0 ? ' Een daling krijgt een min.' : ''), vraag:wat + ': ' + tp(o) + ' → ' + tp(n), vraagHtml:'Met hoeveel procent veranderde het?', beeld:b, zelfBeeld:b, eenheid:'%',
            stappen:[
              { tekst:'Verschil: ' + tp(n) + ' ' + MIN + ' ' + tp(o) + ' =', antwoord:aant(n - o), hint:n < o ? 'Het werd minder, dus het verschil is negatief.' : 'Nieuw min oud.', fout:n < o ? F(tp(o - n), 'Het is gedaald: zet er een min voor.', String(o - n), 'Het is gedaald: zet er een min voor.') : {} },
              { tekst:'Delen door het oude getal en keer 100: ' + tp(n - o) + ' : ' + tp(o) + ' ' + X + ' 100 =', antwoord:pc(p), eenheid:'%', hint:'Deel door ' + tp(o) + ', het getal van ' + j1 + '.', fout:F(tn(r1((n - o) / n * 100)), 'Je deelde door het nieuwe getal. Deel door het oude.') } ] };
        } }
    ] });

  /* ================= 3 RECHT EN DE STRAFZAAK (onderbouw, recht) ================= */
  var STRAF = ['Een jongen steelt een telefoon uit een winkel.', 'Iemand vernielt een bushokje.', 'Een man slaat iemand in elkaar op straat.', 'Iemand breekt in bij een huis.',
    'Een vrouw verkoopt drugs op een schoolplein.', 'Iemand bedreigt een klasgenoot online met geweld.', 'Een man rijdt dronken auto en veroorzaakt een ongeluk.', 'Iemand steelt een fiets bij het station.'];
  var CIVIEL = ['Twee buren hebben ruzie over een schutting op de grens van hun tuinen.', 'Een huurder wil dat de verhuurder de kapotte verwarming maakt.', 'Een webwinkel levert een bestelde laptop niet, en de koper wil zijn geld terug.',
    'Een man en een vrouw gaan scheiden en zijn het niet eens over wie het huis krijgt.', 'Een werknemer krijgt zijn loon niet uitbetaald door zijn baas.', 'Een klant vindt dat de fietsenmaker zijn fiets slecht heeft gerepareerd en wil zijn geld terug.'];
  /* de strafzaak in stappen: [wie, wat] */
  var ZAAK = [['het slachtoffer', 'doet aangifte bij de politie'], ['de politie', 'zoekt uit wat er gebeurd is, houdt de verdachte aan en verhoort hem'],
    ['de officier van justitie', 'beslist of de zaak naar de rechter gaat'], ['de rechter', 'behandelt de zaak op een zitting en doet uitspraak'], ['het gerechtshof', 'behandelt de zaak opnieuw als iemand in hoger beroep gaat']];
  var ROL = [['de politie', ['houdt een verdachte aan', 'neemt de aangifte op', 'verhoort een verdachte', 'zoekt sporen op de plek van de inbraak'], 'opsporen: uitzoeken wat er gebeurd is'],
    ['de officier van justitie', ['beslist of de verdachte voor de rechter moet komen', 'eist op de zitting een straf', 'besluit een zaak te seponeren (niet verder te vervolgen)'], 'vervolgen: de verdachte aanklagen'],
    ['de advocaat', ['komt op voor de verdachte', 'geeft de verdachte advies over wat hij moet zeggen', 'probeert op de zitting een lagere straf te krijgen voor de verdachte'], 'verdedigen: opkomen voor de verdachte'],
    ['de rechter', ['beslist of de verdachte schuldig is', 'bepaalt welke straf de verdachte krijgt', 'leidt de zitting en doet uitspraak'], 'rechtspreken: beslissen over schuld en straf']];

  G.push({ groep:{ id:'mm-recht', niveau:'onderbouw', domein:'recht', naam:'Recht en de strafzaak',
      uit:'Het verschil tussen strafrecht en civiel recht, de stappen van een strafzaak van aangifte tot uitspraak, en wie in een strafzaak wat doet.' },
    doelen:[
      { id:'mm-straf-civiel', naam:'Strafrecht of civiel recht?', kort:'Heeft iemand een strafbaar feit gepleegd? Dan is het strafrecht. Hebben twee partijen ruzie over geld, spullen of een afspraak? Dan is het civiel recht',
        uit:'<p>Er zijn twee grote soorten rechtszaken.</p><p><b>Strafrecht</b>: iemand heeft een <b>strafbaar feit</b> gepleegd, zoals diefstal of geweld. De overheid (het Openbaar Ministerie) vervolgt de verdachte. Hij kan een straf krijgen.</p><p><b>Civiel recht</b> (burgerlijk recht): twee mensen of bedrijven hebben <b>ruzie</b> over geld, spullen of een afspraak. Een van hen stapt zelf naar de rechter.</p>',
        wanneer:'je wilt weten wat voor rechtszaak het wordt.',
        maak:function(R){
          var straf = R.heel(0, 1) === 1, z = R.kies(straf ? STRAF : CIVIEL);
          return OP({ context:'Wat voor zaak wordt dit?', vraag:z,
            stappen:[
              V('Gaat het om een strafbaar feit, of om ruzie tussen twee partijen?', ['een strafbaar feit', 'ruzie tussen twee partijen'], straf ? 'een strafbaar feit' : 'ruzie tussen twee partijen', straf ? 'Stelen, vernielen, geweld, inbreken en bedreigen zijn strafbaar.' : 'Hier willen twee partijen iets van elkaar: geld, een reparatie of spullen.'),
              V('Dus het is', ['strafrecht', 'civiel recht'], straf ? 'strafrecht' : 'civiel recht', straf ? 'Een strafbaar feit: strafrecht.' : 'Een ruzie tussen partijen: civiel recht.') ] });
        } },
      { id:'mm-strafzaak', naam:'De stappen van een strafzaak', kort:'Aangifte, politie, officier van justitie, rechter, en eventueel hoger beroep',
        uit:'<p>Een strafzaak gaat in vaste stappen:</p><ol>' + ZAAK.map(function(z){ return '<li><b>' + hoofd(z[0]) + '</b> ' + z[1] + '.</li>'; }).join('') + '</ol><p>De officier van justitie hoort bij het <b>Openbaar Ministerie</b> (OM). Hij kan een zaak ook <b>seponeren</b> (laten vallen) of zelf een straf opleggen, bijvoorbeeld een boete.</p>',
        wanneer:'je wilt weten wat er gebeurt nadat iemand aangifte doet.',
        maak:function(R){
          var terug = R.heel(0, 2) === 0, i = terug ? R.heel(1, ZAAK.length - 1) : R.heel(0, ZAAK.length - 2), nu = ZAAK[i], na = ZAAK[terug ? i - 1 : i + 1];
          var andere = ZAAK.filter(function(z){ return z !== nu && z !== na; }).map(function(z){ return z[0]; });
          var VOLG = 'De volgorde: aangifte, politie, officier van justitie, rechter, hoger beroep.';
          var st = [V('Welke stap is dit?', ['stap 1', 'stap 2', 'stap 3', 'stap 4', 'stap 5'], 'stap ' + (i + 1), VOLG),
            K(R, terug ? 'Wie was hiervoor aan de beurt?' : 'Wie komt daarna?', na[0], andere.concat(['de advocaat']), (terug ? 'Voor ' : 'Na ') + nu[0] + ' komt ' + na[0] + '.')];
          if (!terug) st.push(K(R, 'Wat doet ' + na[0] + '?', na[1], R.hussel(ZAAK.filter(function(z){ return z !== na; })).slice(0, 2).map(function(z){ return z[1]; }), 'Denk aan de volgorde van de stappen.'));
          return OP({ context:'In een strafzaak: ' + nu[0] + ' ' + nu[1] + '.' + (!terug && i === 3 ? ' De verdachte is het niet eens met de uitspraak en gaat in hoger beroep.' : '') + (terug ? ' Wie was daarvoor aan de beurt?' : ' Wie komt daarna?'), vraag:hoofd(nu[0]) + ' ' + nu[1] + (terug ? '. Ervoor?' : '. En dan?'), vraagHtml:terug ? 'Wie was hiervoor aan de beurt?' : 'Wie komt daarna?', stappen:st });
        } },
      { id:'mm-strafzaak-wie', naam:'Wie doet wat in een strafzaak?', kort:'De politie spoort op, de officier van justitie vervolgt en eist, de advocaat verdedigt, de rechter beslist',
        uit:'<p>In een strafzaak heeft iedereen een eigen taak:</p><ul><li><b>De politie</b> zoekt uit wat er gebeurd is en houdt verdachten aan.</li><li><b>De officier van justitie</b> beslist of iemand vervolgd wordt en eist op de zitting een straf.</li><li><b>De advocaat</b> komt op voor de verdachte.</li><li><b>De rechter</b> beslist of de verdachte schuldig is en welke straf hij krijgt.</li></ul>',
        wanneer:'je een rechtszaak in het nieuws volgt.',
        maak:function(R){
          var r = R.kies(ROL), t = R.kies(r[1]);
          return OP({ context:'Wie doet dit in een strafzaak?', vraag:'… ' + t + '.',
            stappen:[ V('Wat voor taak is dit?', ROL.map(function(x){ return x[2]; }), r[2], 'Gaat het om uitzoeken, om aanklagen, om opkomen voor de verdachte of om beslissen?'),
              V('Wie doet dat?', ROL.map(function(x){ return x[0]; }), r[0], hoofd(r[2]) + ': dat doet ' + r[0] + '.') ] });
        } }
    ] });

  LEERROUTE.voeg('mens', G);
})();
