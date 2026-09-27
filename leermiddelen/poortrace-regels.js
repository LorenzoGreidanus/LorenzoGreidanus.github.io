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

/* Van de vier antwoorden gaan het goede en een of twee foute op de poort.
   twee: twee banen open (de rustige stand en vmbo-bb), minder te lezen.
   Geeft de banen ([{tekst}, null, {tekst}], null is dicht), welke baan goed is
   en de antwoorden die erop staan (het goede eerst). */
function poort(q, twee){
  var goed = String(q.o[q.g]).trim(), gezien = [norm(goed)], fout = [];
  schud(q.o.map(function(o, j){ return j; })).forEach(function(j){
    var t = String(q.o[j]).trim();
    if (j === q.g || !kortOk(t) || gezien.indexOf(norm(t)) >= 0) return;
    gezien.push(norm(t)); fout.push(t);
  });
  var n = (twee || fout.length < 2) ? 2 : 3;
  var antw = [goed].concat(fout.slice(0, n - 1));
  var plek = schud([0, 1, 2]).slice(0, n), banen = [null, null, null];
  plek.forEach(function(b, i){ banen[b] = { tekst:antw[i] }; });
  return { banen:banen, goed:plek[0], antw:antw };
}

/* Hoe lang je hebt tussen de vraag en de poort: een vaste tijd die korter
   wordt naarmate het beter gaat (snelNiv), en nooit korter dan het lezen duurt.
   In de rustige stand een laag tempo; daar wacht de poort toch. */
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

g.POORTREGELS = { MAXANTW:MAXANTW, MAXVRAAG:MAXVRAAG, MINIMUM:MINIMUM, POORTEN:POORTEN, PAST:PAST, ALLES_GOED:ALLES_GOED,
                  schud:schud, kortOk:kortOk, norm:norm, geschikt:geschikt, stapel:stapel, jaarVraag:jaarVraag, poort:poort,
                  leesTijd:leesTijd, doelTijd:doelTijd, na:na };
})(typeof globalThis !== 'undefined' ? globalThis : this);
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.POORTREGELS;
