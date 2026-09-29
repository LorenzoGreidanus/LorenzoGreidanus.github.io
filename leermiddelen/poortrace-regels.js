/* Poortrace: de regels. Welke vragen op een poort passen, welke antwoorden
   erop komen, hoe lang je hebt tot de poort en wat een goede poort oplevert.

   Dezelfde regels op twee plekken. Wie alleen rijdt heeft ze in zijn eigen
   browser (poortrace.html). Wie met vrienden of de klas racet heeft ze in de
   spelkamer op de server (server/kamer.js): daar kiest de kamer de vraag,
   zet hij de antwoorden op de banen, kijkt hij na en telt hij de punten.
   Zo rijdt een race precies zoals een rit alleen, maar kan niemand met de
   ontwikkelhulp van zijn browser zeggen dat hij verder is of meer goed had.

   Laadt als gewoon script (POORTREGELS op window) en als module op de server. */
(function(g){
'use strict';

/* Een poort draagt een kort antwoord. Daarom doen alleen de onderdelen mee
   waar dat werkt: woordjes, topografie, jaartallen, begrippen, tafels en
   rekenen. Van een vraag moeten het goede antwoord en minstens een fout
   antwoord hoogstens 24 tekens zijn, de vraag zelf hoogstens 150, en er mag
   geen plaatje bij dat een antwoord is (een klok, het DHTE-schema).
   Gemeten in september 2026, korte vragen per onderdeel: Engels woordjes
   136 en 243, irregular verbs 287; topografie 160, vlaggen 166; betekenis
   144, synoniemen 55; per tijdvak 15 tot 31; bij rekenen alles behalve de
   klok en het DHTE-schema. Een onderdeel met minder dan MINIMUM korte vragen
   op jouw niveau staat niet in de kiezer. */
var MAXANTW = 24, MAXVRAAG = 150, MINIMUM = 12, POORTEN = 15;
var PAST = {
  reken: ['tafels', 'hoofd', 'cijferen', 'machten', 'negatief', 'komma', 'gemiddelde', 'breuk', 'procent', 'verhouding', 'tijdgeld', 'meten', 'metriek', 'schatten'],
  ned:   ['betekenis', 'synoniemen', 'meervoud', 'werkwoordspelling', 'spelling'],
  eng:   ['woordjes NL naar EN', 'woordjes EN naar NL', 'irregular verbs', 'valse vrienden', 'phrasal verbs', 'examen-eng'],
  ges:   ['jaartallen', 'tv1', 'tv2', 'tv3', 'tv4', 'tv5', 'tv6', 'tv7', 'tv8', 'tv9', 'tv10', 'staat', 'nl1900'],
  aard:  ['topografie', 'vlaggen', 'examen-ak'],
  bio:   ['organen', 'bloed', 'vertering', 'planten', 'cellen', 'zintuigen', 'ordening', 'erfelijkheid'],
  wis:   ['vergelijking', 'formule', 'oppervlakte', 'omtrek', 'statistiek'],
  burg:  ['democratie', 'rechtsstaat', 'bestuurslagen'],
  eco:   ['examen-eco', 'vraag en aanbod'],
  eigen: ['heen', 'terug']
};

function schud(a){ for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), h = a[i]; a[i] = a[j]; a[j] = h; } return a; }
function kortOk(t){ t = String(t == null ? '' : t); return t.length > 0 && t.length <= MAXANTW && t.indexOf('<') < 0; }
function norm(t){ return String(t).trim().toLowerCase(); }
function geschikt(q){
  if (!q || !q.v || !Array.isArray(q.o) || q.svg || q.beeld) return false;
  if (String(q.v).length > MAXVRAAG) return false;
  var g = q.o[q.g]; if (!kortOk(g)) return false;
  return q.o.some(function(o, j){ return j !== q.g && kortOk(o) && norm(o) !== norm(g); });
}

/* De stapel waar de vragen van af komen: de nummers in de bron die in de
   gekozen onderdelen vallen, eerst rond het niveau en dan ruimer; nooit
   buiten de gekozen onderdelen. Met nJaren komen de jaartallen erbij
   ({ s:'j' }), de rest is { s:'b' }. Geschud. */
function stapel(bron, nivo, mag, r, nJaren){
  var alles = [];
  for (var i = 0; i < bron.length; i++) if (mag.indexOf(bron[i].t) >= 0 && geschikt(bron[i])) alles.push(i);
  var onder = r >= 4 ? r - 2 : r - 1;
  var ids = alles.filter(function(i){ return (nivo[i] || 2) <= r && (nivo[i] || 2) >= onder; });
  if (ids.length < 20) ids = alles.filter(function(i){ return (nivo[i] || 2) <= r; });
  if (ids.length < MINIMUM) ids = alles.filter(function(i){ return (nivo[i] || 2) <= r + 1; });
  if (!ids.length) ids = alles;
  var pot = ids.map(function(i){ return { s:'b', i:i }; });
  if (nJaren && mag.indexOf('jaartallen') >= 0) for (var j = 0; j < nJaren; j++) pot.push({ s:'j', i:j });
  return schud(pot);
}

/* Een jaartal uit Tijdvakken sorteren. De foute jaartallen komen van andere
   gebeurtenissen: op vmbo-bb ver weg in de tijd, op havo en vwo juist dichtbij.
   tvNamen: de namen van de tijdvakken zonder nummer, tijdvak 1 eerst. */
function jaarVraag(geb, i, r, tvNamen){
  var e = geb[i];
  var ander = geb.filter(function(x){ return x.jaar !== e.jaar; });
  if (r <= 1) ander = ander.filter(function(x){ return Math.abs(x.tv - e.tv) >= 2; });
  else if (r === 2) ander = ander.filter(function(x){ return x.tv !== e.tv; });
  else ander.sort(function(a, b){ return Math.abs(a.tv - e.tv) - Math.abs(b.tv - e.tv) || Math.random() - .5; }), ander = ander.slice(0, 8);
  schud(ander);
  var fout = [];
  ander.forEach(function(x){ if (fout.length < 3 && fout.indexOf(x.jaar) < 0) fout.push(x.jaar); });
  return { v:'Wanneer was dit? ' + e.tekst + '.', o:[e.jaar].concat(fout), g:0, u:e.waarom + ' Tijdvak ' + e.tv + ': ' + (tvNamen[e.tv - 1] || '') + '.', t:'jaartallen' };
}

/* Van de vier antwoorden gaan het goede en twee foute op de poort: alle drie
   de banen zijn open, ook op vmbo-bb en in de rustige stand (tot september
   2026 was daar een baan dicht). Heeft een vraag zelf te weinig korte foute
   antwoorden (een paar procent, vooral bij begrippen), dan komt de derde uit
   reserve: de goede antwoorden van andere vragen van hetzelfde onderdeel (zie
   reserve hieronder), een lijst of een functie die er een geeft. Alleen als
   ook dat niets oplevert blijft een baan dicht.
   Geeft de banen ([{tekst}, {tekst}, {tekst}], null is dicht), welke baan goed
   is en de antwoorden die erop staan (het goede eerst). */
function poort(q, reserve){
  var goed = String(q.o[q.g]).trim(), gezien = [norm(goed)], fout = [];
  function erbij(t){
    t = String(t == null ? '' : t).trim();
    if (!kortOk(t) || gezien.indexOf(norm(t)) >= 0) return;
    gezien.push(norm(t)); fout.push(t);
  }
  schud(q.o.map(function(o, j){ return j; })).forEach(function(j){ if (j !== q.g) erbij(q.o[j]); });
  if (fout.length < 2 && reserve){
    var extra = typeof reserve === 'function' ? reserve() : reserve;
    if (Array.isArray(extra)) for (var i = 0; i < extra.length && fout.length < 2; i++) erbij(extra[i]);
  }
  var n = fout.length < 2 ? 2 : 3;
  var antw = [goed].concat(fout.slice(0, n - 1));
  var plek = schud([0, 1, 2]).slice(0, n), banen = [null, null, null];
  plek.forEach(function(b, i){ banen[b] = { tekst:antw[i] }; });
  return { banen:banen, goed:plek[0], antw:antw };
}
/* Reserve voor de foute antwoorden: de korte goede antwoorden van andere
   vragen uit de bron met hetzelfde onderdeel (q.t), geschud. */
function reserve(bron, q){
  var uit = [];
  for (var i = 0; i < (bron || []).length; i++){
    var x = bron[i];
    if (!x || x === q || x.t !== q.t || !Array.isArray(x.o) || x.v === q.v) continue;
    var t = String(x.o[x.g] == null ? '' : x.o[x.g]).trim();
    if (kortOk(t)) uit.push(t);
  }
  return schud(uit).slice(0, 12);
}

/* Hoe lang je hebt tussen de vraag en de poort: een vaste tijd die korter
   wordt naarmate het beter gaat (snelNiv), en nooit korter dan het lezen duurt.
   In de rustige stand een laag tempo; daar wacht de poort toch. Een dichte
   baan (null) telt niet mee. */
function leesTijd(v, banen){
  var n = String(v).length; banen.forEach(function(b){ if (b) n += b.tekst.length; });
  return 1.6 + n * .045;
}
function doelTijd(niveau, snelNiv, v, banen, rustig){
  if (rustig) return 10;
  var f = Math.min(1, snelNiv / 10);
  var traag = niveau === 'bb' ? 8 : niveau === 'kgt' ? 7 : 6.5, snel = niveau === 'bb' ? 5.6 : niveau === 'kgt' ? 4.8 : 4.2;
  return Math.max(traag + (snel - traag) * f, leesTijd(v, banen));
}

/* Na een poort: de reeks, het tempo en de punten. s is { goed, reeks, beste,
   snelNiv, punten }; geeft de punten die erbij kwamen. */
function na(s, goed, rustig){
  if (goed){
    s.goed++; s.reeks++; s.beste = Math.max(s.beste, s.reeks);
    var erbij = 100 + Math.min(50, (s.reeks - 1) * 10) + (rustig ? 0 : s.snelNiv * 5);
    s.punten += erbij;
    if (!rustig) s.snelNiv = Math.min(12, s.snelNiv + 1);
    return erbij;
  }
  s.reeks = 0;
  if (!rustig) s.snelNiv = Math.max(0, s.snelNiv - 2);
  return 0;
}
/* alles goed: tweehonderd punten extra (niet in de tijdrit) */
var ALLES_GOED = 200;

/* Een foute poort: het voertuig slipt SLIP seconden en rijdt dan vanzelf
   door; pas daarna komt de volgende vraag. Geen uitleg die blijft staan (tot
   september 2026 stond de weg stil tot je op Volgende tikte): het goede
   antwoord staat even in een balk boven de weg, en de gemiste vragen staan
   met hun uitleg op het eindscherm. Met de motor nagemeten: een fout kost
   zo ongeveer anderhalve seconde ten opzichte van een goede poort (de slip
   zelf, en daarna optrekken vanaf een kwart van de snelheid), en het tempo
   van de volgende poorten zakt. De kamer rekent met hetzelfde getal (raceMinMs). */
var SLIP = 1.2;

/* Oneindig: geen finish, je rijdt tot de tank leeg is. Hij loopt leeg terwijl
   je rijdt (verbruik procent per seconde, plus groei per poort die je had,
   maal de factor van je niveau: op vmbo-bb rijd je trager, dus iets zuiniger).
   Elke poort geeft brandstof: goed veel, met een beetje extra voor een reeks,
   fout een beetje. laag, bijna en hapert zijn de grenzen voor de meter.
   Hij loopt ook leeg in de slip na een fout: gratis tijd is er niet meer,
   want er is geen uitleg meer om te lezen. Alleen rijden: tijdens de pauze
   verbruik je niets. In een race houdt de kamer de tank bij, met dezelfde
   getallen en de klok van de kamer; pauze is er daar niet. */
var TANK = { goed:24, reeks:1, reeksMax:4, fout:5, verbruik:2.5, groei:.045, laag:30, bijna:15, hapert:12 };
var TANK_NIV = { bb:.85, kgt:1, havo:1.12, vwo:1.12 };
/* Oneindig telt in kilometers: wie het verst reed, wint. Van poort tot poort
   is KM_POORT km (de motor: afstand 44000 per poort), dus een tank van vijftig
   poorten is vijf kilometer. plek is in poorten vanaf de start (poort k staat
   op k+1, zoals m.plek() en de kamer, die hem in duizendsten bijhoudt). */
var KM_POORT = .1;
function km(plek){ return Math.max(0, +plek || 0) * KM_POORT; }
function kmTekst(k){ return (Math.floor(Math.max(0, +k || 0) * 10) / 10).toFixed(1).replace('.', ',') + ' km'; }
/* procent per seconde, na k poorten */
function verbruik(k, niveau){ return (TANK.verbruik + TANK.groei * k) * (TANK_NIV[niveau] || 1); }
/* hoeveel brandstof een poort geeft; reeks is de reeks na deze poort. Nooit boven de volle tank. */
function tanken(tank, goed, reeks){
  var erbij = goed ? TANK.goed + Math.min(TANK.reeksMax, (reeks - 1) * TANK.reeks) : TANK.fout;
  return Math.max(0, Math.min(erbij, Math.ceil(100 - tank)));
}

g.POORTREGELS = { MAXANTW:MAXANTW, SLIP:SLIP, MAXVRAAG:MAXVRAAG, MINIMUM:MINIMUM, POORTEN:POORTEN, PAST:PAST, ALLES_GOED:ALLES_GOED,
                  TANK:TANK, TANK_NIV:TANK_NIV, KM_POORT:KM_POORT, km:km, kmTekst:kmTekst,
                  schud:schud, kortOk:kortOk, norm:norm, geschikt:geschikt, stapel:stapel, jaarVraag:jaarVraag, poort:poort, reserve:reserve,
                  leesTijd:leesTijd, doelTijd:doelTijd, na:na, verbruik:verbruik, tanken:tanken };
})(typeof globalThis !== 'undefined' ? globalThis : this);
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.POORTREGELS;
