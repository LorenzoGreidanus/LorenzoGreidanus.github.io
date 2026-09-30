/* De motor van De stad: alles wat rekent en niets wat tekent.

   De stad is een grote kaart met in het midden een veilige stad, daaromheen
   vier rustige gebieden met monsters en aan de rand de rode zone, waar
   spelers elkaar ook kunnen aanvallen. Je vecht zoals in Zwaardvechter (je
   wapen slaat vanzelf, jij loopt, ontwijkt en kiest je moment), je verdient
   XP en goud, en pas als je bij een uitgang de stad uit stapt wordt dat
   bewaard.

   Dezelfde motor draait op drie plekken: in de spelkamer op de server (die is
   de baas), in de browser als je alleen oefent, en in Node voor de tests.

   Wat hierin zit: de wereld, de zones, de hotzone, de vijanden en de bazen,
   het vechten, XP en levels, de regels voor spelers tegen spelers, verslagen
   worden en wat dat kost, de extractie, de quests en hun wachttijd, de kisten
   en de vraagstenen. Wat er niet in zit: vraagteksten, opslaan, tekenen. De
   motor weet alleen dat een kist een goed antwoord nodig heeft; de kamer
   (stad-kamer.js) stelt de vraag, kijkt hem na en meldt het resultaat.

   Alles wat de speler kan doen is een bedoeling: lopen, ontwijken, wisselen,
   de kracht gebruiken, blokken, iets gebruiken. De motor rekent zelf uit wat
   dat oplevert. XP en levels komen nergens anders vandaan.

   Gebruik:
     var W = STADMOTOR.maak({ seed:123, klok:function(){ return Date.now(); } });
     var i = W.erbij({ naam, av, klasse, held });   een speler erbij, met zijn opgeslagen personage
     W.zetInvoer(i, dx, dy, blok);                   lopen (-1..1) en blokken
     W.ontwijk(i); W.wapen(i); W.kracht(i); W.drink(i);
     W.gebruik(i)                                    wat staat er binnen handbereik: { wat:'kist'|'steen'|'uitgang'|'npc'|'lees', id }
     W.schildAan(i) / W.schildUit(i)                 het leesschild rond een vraag
     W.kistOpen(i, id) / W.steenGoed(i, id) / W.startExtract(i, id) / W.vraagFout(i, wat, id) / W.questVraag(i, t)
     W.stap(dt);                                     een stap van de klok
     W.pakketVoor(i);                                wat speler i mag zien
     W.held(i)                                       het personage zoals het bewaard wordt

   Dit bestand laadt als gewoon script in de browser (STADMOTOR op window)
   en als module op de server (module.exports). */
(function(g){
'use strict';

/* ============================================================================
   BALANS. Hier draai je aan.
   ============================================================================ */
var WERELD = { b: 3600, h: 3600 };
var MID = { x: 1800, y: 1800 };
/* De zones zijn ringen om het midden: binnen de stad ben je veilig, tot de
   tweede ring is het rustig (alleen monsters), daarbuiten is het rood. */
var ZONE = { veilig: 380, rustig: 1350 };
/* Zover om je heen komt er iets in je pakket (de halve breedte en hoogte).
   In beeld is ongeveer 980 bij 620 op een laptop en 620 bij 990 op een
   telefoon die rechtop staat; dit is allebei, met een rand erom zodat er
   niets ter plekke opdoemt. */
var KIJK = { b: 600, h: 570 };

/* De gebieden. zone 0 veilig, 1 rustig, 2 rood; lvl is hoe sterk de monsters
   er zijn. De volgorde is die van het pakket (een cijfer per gebied). */
var GEBIEDEN = [
  { id: 'stad',    naam: 'De stad',       zone: 0, lvl: [1, 1] },
  { id: 'velden',  naam: 'De velden',     zone: 1, lvl: [1, 2] },
  { id: 'bos',     naam: 'Het bos',       zone: 1, lvl: [2, 4] },
  { id: 'moeras',  naam: 'Het moeras',    zone: 1, lvl: [3, 5] },
  { id: 'heuvels', naam: 'De heuvels',    zone: 1, lvl: [4, 6] },
  { id: 'ruines',  naam: 'De ruïnes', zone: 2, lvl: [7, 11] }
];
var GEBIED = {};
GEBIEDEN.forEach(function(x, i){ x.nr = i; GEBIED[x.id] = x; });

/* De speler, zoals in Zwaardvechter. 'boog' is de wijdte van de zwaai in
   graden; de pijlboog doet ongeveer de helft maar raakt van ver. */
var SPELER = { r: 20, hp: 100, snelheid: 200, zwaard: { schade: 16, bereik: 82, tempo: 0.55 }, boog: 130,
               pijlboog: { deel: 0.55, bereik: 330, tempo: 1.2, snel: 620 }, rapen: 34, reik: 74 };
var DASH = { duur: 0.18, snel: 950, pauze: 2.2, onkwetsbaar: 0.4 };
var RAAKPAUZE = 0.8;
/* De klassen: wat de keuze doet met de basis. Dezelfde getallen als in
   Zwaardvechter, waar ze stijlen heten. De schildwacht kan blokkeren. */
var KLASSEN = {
  ridder:   { naam: 'Ridder',      maxHp: 1.3, schade: 1.15, tempo: 1.15, boogSchade: 0.8 },
  schutter: { naam: 'Schutter',    boogSchade: 1.4, boogTempo: 0.8, boogBereik: 1.15, maxHp: 0.8, schade: 0.85 },
  wacht:    { naam: 'Schildwacht', maxHp: 1.1, blok: true }
};
var KLASSE_NR = { ridder: 0, schutter: 1, wacht: 2 };
var BLOK = { max: 3, laad: 0.5, deel: 0.2, traag: 0.4 };
var CRIT = { x: 2, straal: 90, deel: 0.5, reeks: 3 };
/* De kracht van elke klasse: een knop met een eigen wachttijd. */
var KRACHT = {
  ridder:   { naam: 'Wervelslag',   pauze: 9, x: 1.6, bereik: 1.3 },
  schutter: { naam: 'Pijlenwaaier', pauze: 8, x: 0.8, pijlen: 7, waaier: 70 },
  wacht:    { naam: 'Schildstoot',  pauze: 9, x: 1.0, bereik: 120, duw: 120, verdoof: 1.2 }
};
/* Punten: een per level, hoogstens tien per soort. */
var STATS = ['kracht', 'leven', 'snel', 'bereik', 'vaardig'];
var STAT_MAX = 10;
var MAXLEVEL = 30;
/* Gemeten met een bot die zonder pauze jaagt (crit/S-balans.mjs): zonder vragen
   en quests is hij na een paar minuten level 3 en na een half uur rond
   level 10. Een leerling die ook vragen beantwoordt en rondkijkt doet er
   langer over, en zo blijft de bescherming tot level 3 een echte periode. */
function nodigVoor(level){ return Math.round(140 + 110 * Math.pow(level, 1.5)); }
/* hoeveel XP iets waard is */
var XP = { fout: function(lvl){ return 2 + 1.2 * lvl; }, kist: function(lvl){ return 20 + 6 * lvl; }, steen: function(lvl){ return 10 + 3 * lvl; },
           quest: function(L){ return 70 + 35 * L; }, baas: function(lvl){ return 120 + 60 * lvl; } };

/* Spelers tegen spelers: alleen in de rode zone, alleen vanaf level 3, en een
   klap tegen een speler doet de helft. */
var PVP = { vanaf: 3, deel: 0.5 };
/* Verslagen: een kwart van je XP binnen dit level, en wat je bij je draagt. */
var VERLIES = { deel: 0.25, terug: 4, zak: 120 };
/* Het leesschild rond een vraag in het wild. */
var SCHILD = { duur: 12, wacht: 8, gevecht: 3 };
var EXTRACT = { tijd: 5, straal: 80, slot: 6 };
var KIST = { terug: 90, slot: 10 };
var STEEN = { buff: 60, wacht: 60, slot: 10 };
var BUFF = { snel: 1.25, kracht: 1.25, taai: 0.75 };
var DRANK = { max: 3, prijs: 25, heelt: 0.6 };
/* Leven komt vanzelf terug: in de stad snel, in het wild langzaam en pas als
   je een paar tellen niet geraakt bent. Zonder dit was verslagen worden de
   enige manier om te helen. */
var HEEL = { stad: 0.25, wild: 0.03, rust: 6 };
var HERVERDEEL = 80;
/* Quests: een per figuur tegelijk, en na het afronden zoveel minuten wachten
   voor dezelfde figuur je een nieuwe geeft. */
var QUEST = { wacht: 4 * 60 * 1000, opgeven: 2 * 60 * 1000 };
/* De hotzone slaapt tot iemand op de kaart level 3 is (vanaf: dezelfde grens
   als voor spelers tegen spelers). Anders zit een beginner die alleen is
   altijd midden in de sterkste vijanden, want hij is dan de beste. */
var HEET = { r: 340, snel: 70, aantal: 7, leven: 1.5, schade: 1.25, beloning: 2, uitTijd: 15, vanaf: 3 };
var HOL = { r: 360, terug: 180, leegReset: 6 };

/* De fouten uit Zwaardvechter. xp is wat hij waard is ten opzichte van een
   gewone. De volgorde is die van het pakket. */
var FOUTEN = [
  { id: 'gewoon',   naam: 'gewone fout',      mark: '?',      kleur: '#c0442c', hp: 1,    snel: 1,    r: 19, schade: 10, xp: 1 },
  { id: 'snel',     naam: 'snelle fout',      mark: '»', kleur: '#EA9836', hp: 0.6,  snel: 1.7,  r: 16, schade: 8,  xp: 0.8 },
  { id: 'schild',   naam: 'fout met schild',  mark: '●', kleur: '#5b6480', hp: 1.3,  snel: 0.85, r: 20, schade: 12, xp: 1.2, schild: 0.5 },
  { id: 'zwerm',    naam: 'zwerm',            mark: '×', kleur: '#7d1f12', hp: 0.35, snel: 1.3,  r: 12, schade: 6,  xp: 0.4, aantal: 3 },
  { id: 'dik',      naam: 'dikke fout',       mark: '◆', kleur: '#6b3fa0', hp: 2.6,  snel: 0.65, r: 28, schade: 18, xp: 2 },
  { id: 'schutter', naam: 'schutter',         mark: '→', kleur: '#2f7d52', hp: 0.8,  snel: 0.8,  r: 17, schade: 8,  xp: 1.2, afstand: 250, laden: 2.5, mik: 0.45 },
  { id: 'pantser',  naam: 'gepantserde fout', mark: '▣', kleur: '#3b4759', hp: 1.6,  snel: 0.75, r: 22, schade: 14, xp: 1.6, pijlDeel: 0.25 },
  { id: 'splitser', naam: 'splitser',         mark: '÷', kleur: '#a0455f', hp: 1.1,  snel: 0.9,  r: 21, schade: 10, xp: 1.1, splijt: 3 },
  { id: 'stukje',   naam: 'stukje',           mark: '·', kleur: '#a0455f', hp: 0.28, snel: 1.45, r: 11, schade: 5,  xp: 0.3 },
  { id: 'genezer',  naam: 'genezer',          mark: '+',      kleur: '#2f9e8f', hp: 0.9,  snel: 0.8,  r: 18, schade: 6,  xp: 1.3, afstand: 210, heelt: 0.05 }
];
var FOUT = {};
FOUTEN.forEach(function(f, i){ f.nr = i; FOUT[f.id] = f; });
/* Welke fouten waar wonen. */
var KAMPSOORTEN = {
  velden:  ['gewoon', 'gewoon', 'snel', 'zwerm'],
  bos:     ['gewoon', 'snel', 'zwerm', 'schild', 'schutter'],
  moeras:  ['schild', 'splitser', 'genezer', 'zwerm', 'gewoon'],
  heuvels: ['schutter', 'dik', 'schild', 'pantser', 'snel'],
  ruines:  ['pantser', 'genezer', 'schutter', 'dik', 'splitser', 'schild', 'snel']
};
var HEETSOORTEN = ['gewoon', 'snel', 'schild', 'schutter', 'pantser', 'splitser', 'genezer', 'dik'];
var KAMP = { terug: 40, rust: 300, jaag: 300, lijn: 650, wakker: 1400 };

/* De zes bazen uit Zwaardvechter, elk in zijn eigen hol. */
var BAZEN = [
  { id: 'fout',  naam: 'De Grote Fout', kleur: '#4a1230', vorm: 'ster',  hp: 16, r: 46, schade: 26, schild: 0.35,
    aanvallen: ['cirkel', 'laser', 'kegel', 'spiraal', 'baan', 'tik'] },
  { id: 'inkt',  naam: 'De Inktvlek',   kleur: '#1b3a8f', vorm: 'vlek',  hp: 16, r: 50, schade: 24, schild: 0.3,
    aanvallen: ['plas', 'kegel', 'cirkel', 'regen', 'golf', 'krimp'] },
  { id: 'pen',   naam: 'De Rode Pen',   kleur: '#c0442c', vorm: 'pen',   hp: 18, r: 42, schade: 26, schild: 0.35,
    aanvallen: ['baan', 'kruis', 'laser', 'muur', 'cirkel', 'kegel'] },
  { id: 'prop',  naam: 'De Prop',       kleur: '#8a7350', vorm: 'prop',  hp: 21, r: 52, schade: 28, schild: 0.4,
    aanvallen: ['kogel', 'golf', 'baan', 'bom', 'cirkel', 'regen'] },
  { id: 'klok',  naam: 'De Klok',       kleur: '#6b3fa0', vorm: 'klok',  hp: 17, r: 46, schade: 24, schild: 0.35,
    aanvallen: ['wijzers', 'tik', 'krimp', 'spiraal', 'laser', 'kegel'] },
  { id: 'zwerm', naam: 'De Zwerm',      kleur: '#7d1f12', vorm: 'zwerm', hp: 16, r: 48, schade: 22, schild: 0.3,
    aanvallen: ['kogel', 'krimp', 'cirkel', 'bom', 'regen', 'spiraal'] }
];
BAZEN.forEach(function(b, i){ b.nr = i; });
/* waar de holen liggen, en hoe sterk de baas er is */
var HOLEN = [
  { baas: 'fout',  x: 1800, y: 640,  lvl: 4 },
  { baas: 'inkt',  x: 1800, y: 2960, lvl: 6 },
  { baas: 'pen',   x: 3080, y: 520,  lvl: 9 },
  { baas: 'prop',  x: 3330, y: 1800, lvl: 10 },
  { baas: 'klok',  x: 520,  y: 3080, lvl: 11 },
  { baas: 'zwerm', x: 270,  y: 1800, lvl: 12 }
];
/* De aanvallen van de bazen, uit Zwaardvechter. n is de sterkte (daar de
   ronde); hier anderhalf keer het level van de baas. */
var AANVAL = {
  pauze: function(n){ return Math.max(0.55, 1.6 - n * 0.03); },
  korter: function(n){ return Math.max(0.5, 1 - n * 0.012); },
  boosPauze: 1.35, boosKorter: 1.15, boosDubbel: 0.12,
  regen: { r: 50, na: 0.2, aantal: function(n){ return 7 + Math.floor(n / 8); } },
  muur: { wacht: 1, duur: 2.2, breed: 44, gat: 150, schade: 19 },
  spiraal: { na: 0.09, draai: 0.5, aantal: function(n){ return 16 + Math.min(12, Math.floor(n / 3)); } },
  bom: { snel: 170, r: 20, duur: 1.4, scherven: 10, schade: 18, aantal: function(n){ return n >= 12 ? 2 : 1; } },
  cirkel: { r: 78, wacht: 1.15, knal: 0.3, schade: 18, extra: function(n){ return 1 + Math.floor(n / 10); } },
  laser: { wacht: 0.9, duur: 1.7, boog: Math.PI * 0.55, breed: 26, schade: 16, stralen: function(n){ return n >= 15 ? 2 : 1; } },
  golf: { wacht: 0.75, duur: 1.5, tot: 460, band: 24, schade: 20, ringen: function(n){ return n >= 20 ? 2 : 1; } },
  plas: { wacht: 0.9, duur: 6.5, r: 66, schade: 9, aantal: function(n){ return 3 + Math.floor(n / 12); } },
  kegel: { wacht: 1, knal: 0.45, wijd: Math.PI * 0.17, ver: 480, schade: 20 },
  baan: { wacht: 1.05, knal: 0.35, breed: 74, schade: 19, aantal: function(n){ return n >= 15 ? 3 : 2; } },
  kruis: { wacht: 1.05, knal: 0.35, breed: 66, schade: 19 },
  kogel: { wacht: 0.55, snel: 250, r: 13, schade: 15, leven: 3, aantal: function(n){ return 8 + Math.min(8, Math.floor(n / 6)) * 2; } },
  wijzers: { wacht: 1, duur: 3.4, breed: 24, schade: 16 },
  tik: { wacht: 0.8, knal: 0.3, r: 62, schade: 16, ring: 210, na: 0.16, aantal: 12 },
  krimp: { wacht: 1.1, duur: 2.2, van: 460, band: 30, gat: Math.PI * 0.3, schade: 20 },
  schot: { wacht: 0.8, snel: 430, r: 11, schade: 14, breed: 26, leven: 2 }
};
/* de soorten aanvallen als cijfer, voor het pakket */
var AANVALSOORTEN = ['cirkel', 'laser', 'golf', 'plas', 'kegel', 'baan', 'kogel', 'tik', 'muur', 'bom', 'krimp', 'schot'];
var AANVAL_NR = {};
AANVALSOORTEN.forEach(function(s, i){ AANVAL_NR[s] = i; });
var VERAANVAL = { laser: 1, baan: 1, kruis: 1, golf: 1, regen: 1, muur: 1, wijzers: 1, krimp: 1, kogel: 1 };
var DICHTBIJAANVAL = { cirkel: 1, kegel: 1, tik: 1, spiraal: 1, bom: 1, plas: 1, krimp: 1, kogel: 1 };

/* De figuren in de stad. */
var NPCS = [
  { id: 'jager',     naam: 'De jager',     hoek: -90, af: 205, quest: true },
  { id: 'geleerde',  naam: 'De geleerde',  hoek: 0,   af: 205, quest: true },
  { id: 'verkenner', naam: 'De verkenner', hoek: 180, af: 205, quest: true },
  { id: 'trainer',   naam: 'De trainer',   hoek: 55,  af: 215 },
  { id: 'handelaar', naam: 'De handelaar', hoek: 125, af: 215 },
  { id: 'lees',      naam: 'De leestafel', hoek: 22,  af: 140 }
];
var QUESTGEVERS = ['jager', 'geleerde', 'verkenner'];

/* ---------- gereedschap ---------- */
function r1(n){ return Math.round(n); }
function r2(n){ return Math.round(n * 100) / 100; }
function klem(n, a, b){ return n < a ? a : n > b ? b : n; }
function af2(ax, ay, bx, by){ var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }
function hoekVerschil(a, b){ var d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }

/* In welk gebied ligt een punt? Eerst de afstand tot het midden (welke
   ring), dan de windrichting (welk van de vier rustige gebieden). */
function gebiedVan(x, y){
  var dx = x - MID.x, dy = y - MID.y, d = Math.sqrt(dx * dx + dy * dy);
  if (d < ZONE.veilig) return GEBIED.stad;
  if (d >= ZONE.rustig) return GEBIED.ruines;
  var h = Math.atan2(dy, dx) * 180 / Math.PI;       /* -180..180, 0 is oost, -90 noord */
  if (h >= -135 && h < -45) return GEBIED.bos;
  if (h >= -45 && h < 45) return GEBIED.heuvels;
  if (h >= 45 && h < 135) return GEBIED.moeras;
  return GEBIED.velden;
}
function zoneVan(x, y){ return gebiedVan(x, y).zone; }

/* ============================================================================
   De wereld: een potje, met alles erin.
   ============================================================================ */
function maak(opzet){
  opzet = opzet || {};
  var haak = opzet.haak || {};
  function zeg(wat, a, b, c){ if (haak[wat]) try { haak[wat](a, b, c); } catch (e){} }
  var klok = opzet.klok || function(){ return Date.now(); };

  /* Eigen toeval met een zaad, zodat de kamer en de browser dezelfde wereld
     bouwen en een potje na te spelen is. */
  var zaad = (opzet.seed || 1) >>> 0;
  function toeval(){
    zaad = (zaad + 0x6D2B79F5) >>> 0;
    var t = Math.imul(zaad ^ (zaad >>> 15), 1 | zaad);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function tussen(a, b){ return a + toeval() * (b - a); }
  function kies(l){ return l[Math.floor(toeval() * l.length)]; }

  var W = {
    seed: opzet.seed || 1, tijd: 0, tik: 0, volgend: 1,
    rots: [], muren: [], npcs: [], kisten: [], stenen: [], uitgangen: [], holen: [], kampen: [],
    fouten: [], aanvallen: [], pijlen: [], zakken: [], spelers: [],
    heet: { x: MID.x, y: MID.y - 900, r: HEET.r, lvl: 3, doel: -1, actief: false },
    kistV: 1, exV: 1
  };
  function nrVan(){ return W.volgend++; }

  /* ---------- botsen ----------
     Alles waar je niet doorheen kunt staat in een raster van vakken van 150,
     zodat een vraag "raak ik iets" alleen de paar dingen in de buurt bekijkt
     en niet alle driehonderd. */
  var VAK = 150, rasterB = Math.ceil(WERELD.b / VAK), raster = [];
  function inRaster(o, x0, y0, x1, y1){
    var a = Math.max(0, Math.floor(x0 / VAK)), b = Math.min(rasterB - 1, Math.floor(x1 / VAK));
    var c = Math.max(0, Math.floor(y0 / VAK)), d = Math.min(rasterB - 1, Math.floor(y1 / VAK));
    for (var i = a; i <= b; i++) for (var j = c; j <= d; j++){
      var k = j * rasterB + i;
      (raster[k] || (raster[k] = [])).push(o);
    }
  }
  function rond(x, y, r, s){ var o = { x: r1(x), y: r1(y), r: r1(r), s: s, rond: true }; W.rots.push(o); inRaster(o, x - r, y - r, x + r, y + r); return o; }
  function blok(x, y, b, h, s){ var o = { x: r1(x), y: r1(y), b: r1(b), h: r1(h), s: s }; W.muren.push(o); inRaster(o, x, y, x + b, y + h); return o; }
  /* raakt een rondje met straal r op (x, y) iets? laag: poelen tellen niet mee (voor pijlen) */
  function raakt(x, y, r, pijl){
    if (x < r || y < r || x > WERELD.b - r || y > WERELD.h - r) return true;
    var a = Math.max(0, Math.floor((x - r) / VAK)), b = Math.min(rasterB - 1, Math.floor((x + r) / VAK));
    var c = Math.max(0, Math.floor((y - r) / VAK)), d = Math.min(rasterB - 1, Math.floor((y + r) / VAK));
    for (var i = a; i <= b; i++) for (var j = c; j <= d; j++){
      var l = raster[j * rasterB + i];
      if (!l) continue;
      for (var k = 0; k < l.length; k++){
        var o = l[k];
        if (pijl && o.s === 'poel') continue;
        if (o.rond){
          var rr = o.r + r;
          if (af2(x, y, o.x, o.y) < rr * rr) return true;
        } else if (x + r > o.x && x - r < o.x + o.b && y + r > o.y && y - r < o.y + o.h) return true;
      }
    }
    return false;
  }
  /* per as apart, dan glijd je langs een boom in plaats van eraan te blijven plakken */
  function schuif(e, nx, ny, r){
    if (!raakt(nx, e.y, r)) e.x = nx;
    if (!raakt(e.x, ny, r)) e.y = ny;
  }

  /* ---------- de wereld bouwen ---------- */
  /* plekken die vrij moeten blijven van bomen en rotsen: kisten, stenen, uitgangen, holen */
  var vrijHouden = [];
  function magHier(x, y, r){
    for (var i = 0; i < vrijHouden.length; i++){
      var v = vrijHouden[i], rr = v.r + r;
      if (af2(x, y, v.x, v.y) < rr * rr) return false;
    }
    return true;
  }
  /* een willekeurige plek in een gebied; vrij: ook niet op een kist, steen, uitgang of in een hol */
  function plekIn(gebied, marge, vrij, extra){
    marge = marge || 40;
    for (var p = 0; p < 1000; p++){
      if (p === 500) extra = null;
      if (p === 750) vrij = false;
      var x, y;
      if (gebied.id === 'ruines'){
        x = tussen(marge + 20, WERELD.b - marge - 20); y = tussen(marge + 20, WERELD.h - marge - 20);
        if (Math.hypot(x - MID.x, y - MID.y) < ZONE.rustig + 60) continue;
      } else {
        var hoekMid = { velden: 180, bos: -90, heuvels: 0, moeras: 90 }[gebied.id];
        var h = (hoekMid + tussen(-44, 44)) * Math.PI / 180, d = tussen(ZONE.veilig + 70, ZONE.rustig - 50);
        x = MID.x + Math.cos(h) * d; y = MID.y + Math.sin(h) * d;
      }
      if (gebiedVan(x, y) !== gebied) continue;
      if (raakt(x, y, marge * 0.6)) continue;
      if (vrij && !magHier(x, y, marge)) continue;
      if (extra && !extra(x, y)) continue;
      return { x: x, y: y };
    }
    return { x: MID.x, y: MID.y - ZONE.veilig - 100 };
  }
  (function bouw(){
    /* de stad: een fontein, huisjes langs de rand en de figuren */
    rond(MID.x, MID.y, 44, 'fontein');
    for (var k = 0; k < 8; k++){
      var hh = (22.5 + k * 45) * Math.PI / 180;
      var hx = MID.x + Math.cos(hh) * 300, hy = MID.y + Math.sin(hh) * 300;
      blok(hx - 44, hy - 34, 88, 68, 'huis');
    }
    NPCS.forEach(function(n){
      var h = n.hoek * Math.PI / 180;
      W.npcs.push({ id: n.id, naam: n.naam, x: r1(MID.x + Math.cos(h) * n.af), y: r1(MID.y + Math.sin(h) * n.af), quest: !!n.quest });
    });
    /* de uitgangen: vier in de rustige zone op de diagonalen, twee in de hoeken van de rode */
    var ex = [];
    [45, 135, 225, 315].forEach(function(hk){ var h = hk * Math.PI / 180; ex.push({ x: MID.x + Math.cos(h) * 1150, y: MID.y + Math.sin(h) * 1150, rood: 0 }); });
    ex.push({ x: 560, y: 560, rood: 1 }); ex.push({ x: WERELD.b - 560, y: WERELD.h - 560, rood: 1 });
    ex.forEach(function(e){
      W.uitgangen.push({ id: nrVan(), x: r1(e.x), y: r1(e.y), r: EXTRACT.straal, rood: e.rood });
      vrijHouden.push({ x: e.x, y: e.y, r: EXTRACT.straal + 40 });
    });
    /* de holen van de bazen: een open plek */
    HOLEN.forEach(function(h){
      var def = BAZEN.filter(function(b){ return b.id === h.baas; })[0];
      var hol = { id: nrVan(), baas: def, x: h.x, y: h.y, R: HOL.r, lvl: h.lvl, terugOp: 0, b: null, leeg: 0 };
      W.holen.push(hol);
      vrijHouden.push({ x: h.x, y: h.y, r: HOL.r - 40 });
    });
    /* kisten en stenen: per gebied een paar, verspreid */
    var KISTEN = { velden: 6, bos: 6, moeras: 6, heuvels: 6, ruines: 12 };
    var STENEN = { velden: 3, bos: 3, moeras: 3, heuvels: 3, ruines: 8 };
    var soorten = ['snel', 'kracht', 'taai'];
    Object.keys(KISTEN).forEach(function(gid){
      for (var i = 0; i < KISTEN[gid]; i++){
        var p = plekIn(GEBIED[gid], 60, true);
        W.kisten.push({ id: nrVan(), x: r1(p.x), y: r1(p.y), g: gid, open: false, terugOp: 0 });
        vrijHouden.push({ x: p.x, y: p.y, r: 60 });
      }
      for (var j = 0; j < STENEN[gid]; j++){
        var q = plekIn(GEBIED[gid], 60, true);
        W.stenen.push({ id: nrVan(), x: r1(q.x), y: r1(q.y), g: gid, soort: soorten[(j + gid.length) % 3] });
        vrijHouden.push({ x: q.x, y: q.y, r: 60 });
      }
    });
    /* de kampen van de monsters */
    var KAMPEN = { velden: 7, bos: 7, moeras: 7, heuvels: 7, ruines: 16 };
    Object.keys(KAMPEN).forEach(function(gid){
      for (var i = 0; i < KAMPEN[gid]; i++){
        /* een kamp ligt niet tegen een hol, een uitgang of de poort van de stad aan:
           anders vecht je bij een baas ook nog tegen de buren */
        var p = plekIn(GEBIED[gid], 80, true, function(x, y){
          if (Math.hypot(x - MID.x, y - MID.y) < ZONE.veilig + 160) return false;
          if (W.holen.some(function(h){ return af2(x, y, h.x, h.y) < Math.pow(HOL.r + 140, 2); })) return false;
          return !W.uitgangen.some(function(e){ return af2(x, y, e.x, e.y) < 300 * 300; });
        });
        var kamp = { id: nrVan(), x: r1(p.x), y: r1(p.y), g: gid, n: 3 + Math.floor(toeval() * 3), leden: [], wacht: [] };
        W.kampen.push(kamp);
        vrijHouden.push({ x: p.x, y: p.y, r: 90 });
      }
    });
    /* het decor waar je niet doorheen kunt: bomen, rotsen, poelen en muren */
    function veel(gid, n, maak2){
      var gezet = 0;
      for (var p = 0; p < n * 6 && gezet < n; p++){
        var q = plekIn(GEBIED[gid], 30);
        if (maak2(q.x, q.y)) gezet++;
      }
    }
    veel('bos', 120, function(x, y){ var r = tussen(20, 34); if (!magHier(x, y, r + 30)) return false; rond(x, y, r, 'boom'); return true; });
    veel('velden', 34, function(x, y){ var r = tussen(16, 26); if (!magHier(x, y, r + 30)) return false; rond(x, y, r, toeval() < 0.6 ? 'struik' : 'boom'); return true; });
    veel('heuvels', 60, function(x, y){ var r = tussen(24, 46); if (!magHier(x, y, r + 30)) return false; rond(x, y, r, 'rots'); return true; });
    veel('moeras', 36, function(x, y){ var r = tussen(40, 78); if (!magHier(x, y, r + 30)) return false; rond(x, y, r, 'poel'); return true; });
    veel('ruines', 70, function(x, y){
      var lang = toeval() < 0.5, b = lang ? tussen(90, 170) : 36, h = lang ? 36 : tussen(90, 170);
      if (!magHier(x + b / 2, y + h / 2, Math.max(b, h) / 2 + 30)) return false;
      if (raakt(x + b / 2, y + h / 2, Math.max(b, h) / 2 + 10)) return false;
      blok(x, y, b, h, 'muur'); return true;
    });
    veel('ruines', 30, function(x, y){ var r = tussen(18, 30); if (!magHier(x, y, r + 30)) return false; rond(x, y, r, toeval() < 0.5 ? 'dood' : 'rots'); return true; });
  })();

  /* ---------- spelers ---------- */
  function leegHeld(klasse){
    return { klasse: klasse, level: 1, xp: 0, punten: 0, stats: { kracht: 0, leven: 0, snel: 0, bereik: 0, vaardig: 0 },
             goud: 0, drank: 1, tel: { geveld: 0, bazen: 0, kisten: 0, gered: 0, verslagen: 0, spelers: 0, vragen: 0 } };
  }
  /* Een opgeslagen personage nakijken: getallen binnen de grenzen, wat er
     niet klopt wordt het begin. De opslag komt van de server zelf, maar een
     oude of halve versie mag het potje niet omgooien. */
  function schoonHeld(h, klasse){
    var s = leegHeld(klasse);
    if (!h || typeof h !== 'object') return s;
    s.level = klem(Math.floor(+h.level) || 1, 1, MAXLEVEL);
    s.xp = klem(Math.floor(+h.xp) || 0, 0, nodigVoor(s.level) - 1);
    var gebruikt = 0;
    STATS.forEach(function(k){ var v = klem(Math.floor(+(h.stats && h.stats[k])) || 0, 0, STAT_MAX); s.stats[k] = v; gebruikt += v; });
    /* nooit meer punten dan je levels hebt verdiend */
    var totaal = s.level - 1;
    if (gebruikt > totaal){ STATS.forEach(function(k){ s.stats[k] = 0; }); gebruikt = 0; }
    s.punten = klem(Math.floor(+h.punten) || 0, 0, totaal - gebruikt);
    if (s.punten + gebruikt < totaal) s.punten = totaal - gebruikt;
    s.goud = klem(Math.floor(+h.goud) || 0, 0, 1e7);
    s.drank = klem(Math.floor(+h.drank) || 0, 0, DRANK.max);
    if (h.tel) Object.keys(s.tel).forEach(function(k){ s.tel[k] = klem(Math.floor(+h.tel[k]) || 0, 0, 1e8); });
    return s;
  }
  function spawnPlek(){
    for (var p = 0; p < 60; p++){
      var h = toeval() * Math.PI * 2, d = tussen(80, 170);
      var x = MID.x + Math.cos(h) * d, y = MID.y + Math.sin(h) * d;
      if (!raakt(x, y, SPELER.r + 4)) return { x: x, y: y };
    }
    return { x: MID.x, y: MID.y + 120 };
  }
  function afgeleid(p){
    var st = KLASSEN[p.klasse] || {}, s = p.stats, L = p.level, kr = KRACHT[p.klasse];
    var basis = SPELER.zwaard.schade * (1 + 0.03 * (L - 1)) * (1 + 0.07 * s.kracht);
    var ber = 1 + 0.05 * s.bereik;
    return {
      maxHp: Math.round((SPELER.hp + 6 * (L - 1)) * (st.maxHp || 1) * (1 + 0.10 * s.leven)),
      schade: basis * (st.schade || 1),
      bereik: SPELER.zwaard.bereik * ber,
      tempo: SPELER.zwaard.tempo * (st.tempo || 1),
      snel: SPELER.snelheid * (1 + 0.03 * s.snel),
      boogSchade: basis * SPELER.pijlboog.deel * (st.boogSchade || 1),
      boogBereik: SPELER.pijlboog.bereik * ber * (st.boogBereik || 1),
      boogTempo: SPELER.zwaard.tempo * SPELER.pijlboog.tempo * (st.boogTempo || 1),
      krachtPauze: kr.pauze * Math.pow(0.93, s.vaardig),
      krachtX: kr.x * (1 + 0.1 * s.vaardig),
      blokMax: BLOK.max + 0.3 * s.vaardig
    };
  }
  function herreken(p){
    var oud = p.af ? p.af.maxHp : 0;
    p.af = afgeleid(p);
    p.maxHp = p.af.maxHp;
    if (oud && !p.neer) p.hp = Math.min(p.maxHp, p.hp + Math.max(0, p.maxHp - oud));
    if (p.hp > p.maxHp) p.hp = p.maxHp;
    p.mkV++;
  }
  function nieuweSpeler(o){
    var klasse = KLASSEN[o.klasse] ? o.klasse : 'ridder';
    var h = schoonHeld(o.held, klasse);
    var plek = spawnPlek();
    var p = {
      nr: W.spelers.length, naam: String(o.naam || 'Speler').slice(0, 16), av: String(o.av || '').slice(0, 48), klasse: klasse,
      x: plek.x, y: plek.y, dx: 0, dy: 0, mikt: 0, kijkX: 1, kijkY: 0, wapen: klasse === 'schutter' ? 'boog' : 'zwaard', klok: 0, zwaai: 0, werv: 0,
      dash: 0, dashKlok: 0, ddx: 1, ddy: 0, raak: 1, flits: 0, blokVraag: false, blok: false, blokTijd: BLOK.max,
      krKlok: 0, crit: false, reeks: 0,
      level: h.level, xp: h.xp, punten: h.punten, stats: h.stats, goud: h.goud, buit: 0, drank: h.drank, tel: h.tel,
      hp: 1, maxHp: 1, neer: false, neerKlok: 0, uit: false, weg: false, gered: false,
      schild: 0, schildWacht: 0, leest: false, geraaktOp: -99,
      buffs: { snel: 0, kracht: 0, taai: 0 }, extract: null,
      quests: { jager: null, geleerde: null, verkenner: null }, aanbod: {}, wacht: {},
      kistSlot: {}, steenKlok: {}, exSlot: {}, delen: [],
      gebied: GEBIED.stad, ev: [], mkV: 1, runXp: 0, verloren: 0, runGoud: 0
    };
    var w = o.wacht || {};
    QUESTGEVERS.forEach(function(q){ if (+w[q] > 0) p.wacht[q] = +w[q]; });
    herreken(p);
    p.hp = p.maxHp;
    p.blokTijd = p.af.blokMax;
    return p;
  }
  W.erbij = function(o){
    var p = nieuweSpeler(o || {});
    W.spelers.push(p);
    if (Array.isArray(o && o.delen)) p.delen = o.delen.slice(0, 40);
    meld(p, { e: 'gebied', g: GEBIED.stad.nr });
    W.spelers.forEach(function(q, j){ vergeet(j); });
    return p.nr;
  };
  /* weg: de plek blijft bestaan (het nummer), maar hij doet niet meer mee */
  W.eruit = function(i){
    var p = W.spelers[i]; if (!p || p.uit) return;
    p.uit = true; p.extract = null; p.leest = false; p.schild = 0;
    W.exV++;
  };
  W.gevonden = function(i){ var p = W.spelers[i]; return p && !p.uit ? p : null; };
  function actief(p){ return p && !p.uit && !p.neer && !p.gered; }

  function meld(p, ev){ if (p && !p.uit){ p.ev.push(ev); if (p.ev.length > 60) p.ev.splice(0, p.ev.length - 60); } }
  W.meldingen = function(i){ var p = W.spelers[i]; if (!p || !p.ev.length) return null; var l = p.ev; p.ev = []; return l; };

  /* ---------- bedoelingen ---------- */
  W.zetInvoer = function(i, dx, dy, blokken){
    var p = W.spelers[i]; if (!p || p.uit) return;
    dx = +dx || 0; dy = +dy || 0;
    if (!isFinite(dx)) dx = 0; if (!isFinite(dy)) dy = 0;
    var l = Math.hypot(dx, dy);
    if (l > 1){ dx /= l; dy /= l; }
    p.dx = klem(dx, -1, 1); p.dy = klem(dy, -1, 1);
    p.blokVraag = !!blokken && p.klasse === 'wacht';
  };
  W.ontwijk = function(i){
    var p = W.spelers[i]; if (!actief(p) || p.leest || p.dashKlok > 0 || p.dash > 0) return false;
    var dx = p.dx, dy = p.dy;
    if (!dx && !dy){
      /* stil: weg van wat het dichtst bij staat, anders de kant op waar je keek */
      var d = dichtsteVijand(p, 400);
      if (d){ var wx = p.x - d.x, wy = p.y - d.y, wl = Math.hypot(wx, wy) || 1; dx = wx / wl; dy = wy / wl; }
      else { dx = p.kijkX; dy = p.kijkY; }
    }
    var l = Math.hypot(dx, dy) || 1;
    p.ddx = dx / l; p.ddy = dy / l;
    p.dash = DASH.duur; p.dashKlok = DASH.pauze;
    p.raak = Math.max(p.raak, DASH.onkwetsbaar);
    if (p.extract) stopExtract(p, 'onderbroken');
    return true;
  };
  W.wapen = function(i){
    var p = W.spelers[i]; if (!actief(p)) return;
    p.wapen = p.wapen === 'boog' ? 'zwaard' : 'boog';
    p.klok = Math.max(p.klok, 0.2); p.zwaai = 0;
  };
  W.drink = function(i){
    var p = W.spelers[i]; if (!actief(p) || p.drank <= 0 || p.hp >= p.maxHp) return false;
    p.drank--; p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * DRANK.heelt)); p.mkV++;
    meld(p, { e: 'drank', hp: p.hp });
    return true;
  };

  /* ---------- zoeken ---------- */
  /* Mag speler a speler b raken? Allebei in de rode zone, allebei level 3 of
     hoger, geen van beiden leest een vraag, en niet zichzelf. */
  function magPvp(a, b){
    if (!a || !b || a === b || !actief(a) || !actief(b)) return false;
    if (a.leest || b.leest || b.schild > 0) return false;
    if (a.level < PVP.vanaf || b.level < PVP.vanaf) return false;
    return a.gebied.zone === 2 && b.gebied.zone === 2;
  }
  W.magPvp = function(i, j){ return magPvp(W.spelers[i], W.spelers[j]); };
  /* de dichtstbijzijnde vijand binnen een afstand (monster, baas, of een speler die je mag raken) */
  function dichtsteVijand(p, max){
    var best = null, bd = max * max;
    for (var i = 0; i < wakkerLijst.length; i++){
      var f = wakkerLijst[i];
      if (f.dood || f.terug) continue;
      var d = af2(f.x, f.y, p.x, p.y) - f.r * f.r;
      if (d < bd){ bd = d; best = f; }
    }
    if (p.gebied.zone === 2 && p.level >= PVP.vanaf){
      for (var j = 0; j < W.spelers.length; j++){
        var q = W.spelers[j];
        if (!magPvp(p, q)) continue;
        var d2 = af2(q.x, q.y, p.x, p.y) - SPELER.r * SPELER.r;
        if (d2 < bd){ bd = d2; best = q; }
      }
    }
    return best;
  }

  /* ---------- het leesschild ----------
     Wie in het wild een vraag beantwoordt kan niet lopen en niet slaan. Zolang
     het paneel open is en hoogstens twaalf tellen, kan hem dan ook niets
     raken. Wie net geraakt is kan geen vraag openen: eerst weg bij de
     vijanden. In de stad is er niets om je tegen te beschermen. */
  W.schildAan = function(i){
    var p = W.spelers[i]; if (!actief(p)) return { fout: 'neer' };
    if (p.gebied.zone === 0){ p.leest = true; return { ok: true, schild: 0 }; }
    if (W.tijd - p.geraaktOp < SCHILD.gevecht) return { fout: 'gevecht' };
    if (p.schildWacht > 0) return { fout: 'wacht', s: Math.ceil(p.schildWacht) };
    p.leest = true; p.schild = SCHILD.duur; p.dx = 0; p.dy = 0;
    if (p.extract) stopExtract(p, 'onderbroken');
    return { ok: true, schild: SCHILD.duur };
  };
  W.schildUit = function(i){
    var p = W.spelers[i]; if (!p) return;
    if (p.schild > 0){ p.schild = 0; p.schildWacht = SCHILD.wacht; }
    p.leest = false;
  };

  /* ---------- gebruiken ----------
     Wat staat er binnen handbereik? Een figuur in de stad, een kist, een
     vraagsteen, of een uitgang waar je in staat. De dichtstbijzijnde wint. */
  W.gebruik = function(i){
    var p = W.spelers[i]; if (!actief(p) || p.leest) return null;
    var best = null, bd = 1e12;
    function kand(wat, o, reik, extra){
      var d = af2(o.x, o.y, p.x, p.y);
      if (d <= reik * reik && d < bd){ bd = d; best = { wat: wat, id: o.id }; if (extra) for (var k in extra) best[k] = extra[k]; }
    }
    if (p.gebied.zone === 0) W.npcs.forEach(function(n){ kand(n.id === 'lees' ? 'lees' : 'npc', n, 80, { npc: n.id }); });
    W.kisten.forEach(function(k){
      if (k.open) return;
      kand('kist', k, SPELER.reik, (p.kistSlot[k.id] || 0) > W.tijd ? { slot: Math.ceil(p.kistSlot[k.id] - W.tijd) } : null);
    });
    W.stenen.forEach(function(s){
      kand('steen', s, SPELER.reik, (p.steenKlok[s.id] || 0) > W.tijd ? { slot: Math.ceil(p.steenKlok[s.id] - W.tijd) } : null);
    });
    W.uitgangen.forEach(function(e){ if (!p.extract) kand('uitgang', e, e.r, (p.exSlot[e.id] || 0) > W.tijd ? { slot: Math.ceil(p.exSlot[e.id] - W.tijd) } : null); });
    return best;
  };
  function bij(p, o, reik){ return o && af2(o.x, o.y, p.x, p.y) <= reik * reik; }
  function vind(lijst, id){ for (var i = 0; i < lijst.length; i++) if (lijst[i].id === id) return lijst[i]; return null; }
  function lvlVan(gebied){ return Math.round((gebied.lvl[0] + gebied.lvl[1]) / 2); }
  function inHeet(x, y){ return W.heet.actief && af2(x, y, W.heet.x, W.heet.y) < W.heet.r * W.heet.r; }

  /* een goed antwoord bij een kist */
  W.kistOpen = function(i, id){
    var p = W.spelers[i], k = vind(W.kisten, id);
    if (!actief(p) || !k || k.open || !bij(p, k, SPELER.reik + 20)) return null;
    var g = GEBIED[k.g], lvl = Math.max(lvlVan(g), g.zone === 2 ? p.level : 1);
    var keer = (g.zone === 2 ? 2 : 1) * (inHeet(k.x, k.y) ? HEET.beloning : 1);
    var goud = Math.round((8 + 3 * lvl + toeval() * 6) * keer);
    var xp = Math.round(XP.kist(lvlVan(g)) * (inHeet(k.x, k.y) ? HEET.beloning : 1));
    var drank = toeval() < 0.25 && p.drank < DRANK.max ? 1 : 0;
    k.open = true; k.terugOp = W.tijd + KIST.terug; W.kistV++;
    p.buit += goud; p.runGoud += goud; p.drank += drank; p.tel.kisten++; p.mkV++;
    geefXp(p, xp, 'kist');
    meld(p, { e: 'kist', goud: goud, xp: xp, drank: drank, x: k.x, y: k.y });
    questTel(p, 'kist', { g: k.g });
    return { goud: goud, xp: xp, drank: drank };
  };
  /* een goed antwoord bij een vraagsteen: een minuut sneller, sterker of taaier */
  W.steenGoed = function(i, id){
    var p = W.spelers[i], s = vind(W.stenen, id);
    if (!actief(p) || !s || !bij(p, s, SPELER.reik + 20) || (p.steenKlok[s.id] || 0) > W.tijd) return null;
    p.buffs[s.soort] = STEEN.buff;
    p.steenKlok[s.id] = W.tijd + STEEN.wacht;
    var xp = Math.round(XP.steen(lvlVan(GEBIED[s.g])));
    geefXp(p, xp, 'steen');
    p.mkV++;
    meld(p, { e: 'buff', soort: s.soort, s: STEEN.buff, xp: xp });
    questTel(p, 'steen', { g: s.g });
    return { soort: s.soort };
  };
  /* een fout antwoord: deze kist of steen is even dicht voor jou */
  W.vraagFout = function(i, wat, id){
    var p = W.spelers[i]; if (!p) return;
    if (wat === 'kist') p.kistSlot[id] = W.tijd + KIST.slot;
    if (wat === 'steen') p.steenKlok[id] = W.tijd + STEEN.slot;
    if (wat === 'uitgang') p.exSlot[id] = W.tijd + EXTRACT.slot;
    p.reeks = 0; p.mkV++;
  };
  /* elke goede vraag telt mee voor de reeks (drie op rij: critical) en voor de quest van de geleerde */
  W.vraagGoed = function(i, onderdeel){
    var p = W.spelers[i]; if (!p) return;
    p.reeks++; p.tel.vragen++;
    if (p.reeks % CRIT.reeks === 0){ p.crit = true; meld(p, { e: 'crit' }); }
    questTel(p, 'vragen', { t: onderdeel });
    p.mkV++;
  };
  /* is er een quest met vragen over een bepaald onderdeel? de kamer kiest dan zo'n vraag */
  W.questOnderdeel = function(i){
    var p = W.spelers[i], q = p && p.quests.geleerde;
    return q && q.soort === 'vragen' ? (q.t || '') : null;
  };

  /* ---------- extractie ----------
     Na een goed antwoord blijf je vijf tellen in de kring staan. Een klap of
     een stap de kring uit en je begint opnieuw. Iedereen ziet dat je het
     probeert. */
  W.startExtract = function(i, id){
    var p = W.spelers[i], e = vind(W.uitgangen, id);
    if (!actief(p) || !e || !bij(p, e, e.r) || p.extract) return false;
    p.extract = { id: e.id, klok: 0 };
    W.exV++;
    meld(p, { e: 'extract', id: e.id, s: EXTRACT.tijd });
    return true;
  };
  function stopExtract(p, waarom){
    if (!p.extract) return;
    p.extract = null; W.exV++;
    meld(p, { e: 'extractstop', waarom: waarom });
  }
  function extractStap(p, dt){
    if (!p.extract) return;
    var e = vind(W.uitgangen, p.extract.id);
    if (!e || !bij(p, e, e.r + 4)){ stopExtract(p, 'kring'); return; }
    p.extract.klok += dt;
    if (p.extract.klok >= EXTRACT.tijd){
      p.extract = null; W.exV++;
      p.gered = true; p.tel.gered++;
      /* het goud van deze tocht gaat de kluis in */
      p.goud += p.buit; p.buit = 0; p.mkV++;
      meld(p, { e: 'gered' });
      zeg('gered', p.nr);
    }
  }
  /* Na een geslaagde extractie: de kamer heeft bewaard, en de speler gaat
     verder vanuit de stad of stopt. */
  W.naarStad = function(i){
    var p = W.spelers[i]; if (!p || p.uit) return;
    var pl = spawnPlek(); p.x = pl.x; p.y = pl.y; p.gered = false; p.raak = 1.5;
    p.runXp = 0; p.verloren = 0; p.runGoud = 0;
  };

  /* ---------- quests ---------- */
  /* Welke gebieden passen bij dit level: waar de monsters niet veel sterker zijn. */
  function passendeGebieden(p){
    var l = GEBIEDEN.filter(function(gb){ return gb.zone > 0 && gb.lvl[0] <= p.level + 1; });
    return l.length ? l : [GEBIED.velden];
  }
  function questTekst(q){
    var g = q.g ? GEBIED[q.g] : null, gn = g ? (g.naam.charAt(0).toLowerCase() + g.naam.slice(1)) : '';
    if (q.soort === 'versla') return 'Versla ' + q.nodig + ' vijanden in ' + gn;
    if (q.soort === 'soort') return 'Versla ' + q.nodig + ' keer een ' + FOUT[q.f].naam;
    if (q.soort === 'baas') return 'Versla een baas';
    if (q.soort === 'vragen') return 'Beantwoord ' + q.nodig + ' vragen goed' + (q.tn ? ' over ' + q.tn : '');
    if (q.soort === 'kist') return 'Open ' + q.nodig + ' kisten in ' + gn;
    if (q.soort === 'steen') return 'Raak ' + q.nodig + ' vraagstenen aan';
    if (q.soort === 'heet') return 'Versla ' + q.nodig + ' vijanden in de hotzone';
    return 'Quest';
  }
  function maakAanbod(p, gever){
    var q, l = passendeGebieden(p);
    if (gever === 'jager'){
      var r = toeval();
      if (p.level >= 4 && r < 0.2) q = { soort: 'baas', nodig: 1 };
      else if (r < 0.55){
        var g = l[Math.min(l.length - 1, Math.floor(toeval() * l.length))];
        var soorten = KAMPSOORTEN[g.id].filter(function(s){ return s !== 'zwerm'; });
        q = { soort: 'soort', f: kies(soorten), nodig: 3, g: g.id };
      } else q = { soort: 'versla', g: l[Math.floor(toeval() * l.length)].id, nodig: 5 + Math.floor(toeval() * 4) };
    } else if (gever === 'geleerde'){
      var d = p.delen.length ? kies(p.delen) : null;
      q = { soort: 'vragen', nodig: 5, t: d ? d.id : '', tn: d ? d.naam : '' };
    } else {
      var r2 = toeval();
      if (p.level >= 3 && r2 < 0.3) q = { soort: 'heet', nodig: 3 };
      else if (r2 < 0.65) q = { soort: 'kist', g: l[Math.floor(toeval() * l.length)].id, nodig: 2 };
      else q = { soort: 'steen', nodig: 3 };
    }
    q.gever = gever; q.n = 0;
    q.xp = Math.round(XP.quest(p.level)); q.goud = 15 + 5 * p.level;
    q.tekst = questTekst(q);
    return q;
  }
  /* wat een figuur je nu te bieden heeft; de kamer laat het zien in het paneel */
  W.npcStand = function(i, npc){
    var p = W.spelers[i]; if (!p) return null;
    var n = vind(W.npcs, npc);
    if (!n) return null;
    var uit = { npc: npc, naam: n.naam };
    if (n.quest){
      var nu = klok();
      uit.quest = p.quests[npc] ? questUit(p.quests[npc]) : null;
      uit.wacht = p.wacht[npc] && p.wacht[npc] > nu ? Math.ceil((p.wacht[npc] - nu) / 1000) : 0;
      if (!uit.quest && !uit.wacht){
        if (!p.aanbod[npc]) p.aanbod[npc] = maakAanbod(p, npc);
        uit.aanbod = questUit(p.aanbod[npc]);
      }
    }
    return uit;
  };
  function questUit(q){ return { soort: q.soort, tekst: q.tekst, n: q.n, nodig: q.nodig, xp: q.xp, goud: q.goud, gever: q.gever }; }
  W.questNeem = function(i, gever){
    var p = W.spelers[i]; if (!actief(p) || QUESTGEVERS.indexOf(gever) < 0) return false;
    var n = vind(W.npcs, gever);
    if (!bij(p, n, 110) || p.quests[gever] || !p.aanbod[gever]) return false;
    if (p.wacht[gever] && p.wacht[gever] > klok()) return false;
    p.quests[gever] = p.aanbod[gever]; p.aanbod[gever] = null; p.mkV++;
    meld(p, { e: 'quest', wat: 'neem', tekst: p.quests[gever].tekst });
    return true;
  };
  W.questWeg = function(i, gever){
    var p = W.spelers[i]; if (!p || !p.quests[gever]) return false;
    p.quests[gever] = null;
    p.wacht[gever] = klok() + QUEST.opgeven; p.mkV++;
    zeg('wacht', p.nr);
    return true;
  };
  function questTel(p, soort, info){
    QUESTGEVERS.forEach(function(gever){
      var q = p.quests[gever];
      if (!q) return;
      var telt = false;
      if (q.soort === soort){
        if (soort === 'versla') telt = !q.g || q.g === info.g;
        else if (soort === 'kist') telt = !q.g || q.g === info.g;
        else if (soort === 'vragen') telt = !q.t || q.t === info.t;
        else telt = true;
      }
      if (q.soort === 'soort' && soort === 'versla' && info.f === q.f) telt = true;
      if (q.soort === 'heet' && soort === 'versla' && info.heet) telt = true;
      if (q.soort === 'baas' && soort === 'baas') telt = true;
      if (!telt) return;
      q.n++; p.mkV++;
      if (q.n < q.nodig){ meld(p, { e: 'quest', wat: 'tel', tekst: q.tekst, n: q.n, nodig: q.nodig }); return; }
      /* klaar: de beloning meteen, en de figuur heeft even niets voor je */
      p.quests[gever] = null;
      p.wacht[gever] = klok() + QUEST.wacht;
      p.buit += q.goud; p.runGoud += q.goud;
      geefXp(p, q.xp, 'quest');
      meld(p, { e: 'quest', wat: 'klaar', tekst: q.tekst, xp: q.xp, goud: q.goud, gever: gever });
      zeg('wacht', p.nr);
    });
  }
  W.questTel = function(i, soort, info){ var p = W.spelers[i]; if (p) questTel(p, soort, info || {}); };

  /* ---------- de trainer en de handelaar ----------
     Punten zetten kan alleen in de stad: daar is de trainer. */
  W.zetPunt = function(i, stat){
    var p = W.spelers[i]; if (!actief(p) || p.gebied.zone !== 0) return false;
    if (STATS.indexOf(stat) < 0 || p.punten <= 0 || p.stats[stat] >= STAT_MAX) return false;
    p.stats[stat]++; p.punten--; herreken(p);
    return true;
  };
  function betaal(p, prijs){
    if (p.buit + p.goud < prijs) return false;
    var vanBuit = Math.min(p.buit, prijs);
    p.buit -= vanBuit; p.goud -= prijs - vanBuit; p.mkV++;
    return true;
  }
  W.herverdeel = function(i){
    var p = W.spelers[i]; if (!actief(p) || p.gebied.zone !== 0) return false;
    var som = 0; STATS.forEach(function(k){ som += p.stats[k]; });
    if (!som || !betaal(p, HERVERDEEL)) return false;
    STATS.forEach(function(k){ p.stats[k] = 0; });
    p.punten += som; herreken(p);
    return true;
  };
  W.koop = function(i, wat){
    var p = W.spelers[i]; if (!actief(p) || p.gebied.zone !== 0) return false;
    if (wat === 'drank'){
      if (p.drank >= DRANK.max || !betaal(p, DRANK.prijs)) return false;
      p.drank++; p.mkV++;
      return true;
    }
    return false;
  };

  /* ---------- XP ---------- */
  function geefXp(p, n, bron){
    n = Math.round(n);
    if (!p || n <= 0) return;
    p.runXp += n;
    if (p.level >= MAXLEVEL){ p.xp = Math.min(nodigVoor(p.level) - 1, p.xp + n); p.mkV++; return; }
    p.xp += n;
    var erbij = 0;
    while (p.level < MAXLEVEL && p.xp >= nodigVoor(p.level)){
      p.xp -= nodigVoor(p.level); p.level++; p.punten++; erbij++;
    }
    if (p.level >= MAXLEVEL) p.xp = Math.min(p.xp, nodigVoor(p.level) - 1);
    if (erbij){ herreken(p); p.hp = p.maxHp; meld(p, { e: 'level', lvl: p.level, punten: p.punten }); }
    meld(p, { e: 'xp', n: n, bron: bron });
    p.mkV++;
  }
  W.geefXp = function(i, n, bron){ geefXp(W.spelers[i], n, bron || 'test'); };

  /* ---------- geraakt worden, en verslagen ---------- */
  function tref(p, schade, door, kleur){
    /* in de stad raakt niets je, ook geen schot dat van buiten komt aanvliegen */
    if (!actief(p) || p.raak > 0 || p.schild > 0 || p.gebied.zone === 0) return 0;
    var klap = Math.max(1, Math.round(schade * (p.buffs.taai > 0 ? BUFF.taai : 1) * (p.blok ? BLOK.deel : 1)));
    p.hp -= klap;
    p.raak = p.blok ? RAAKPAUZE * 0.5 : RAAKPAUZE; p.flits = 0.25;
    p.geraaktOp = W.tijd;
    if (p.extract) stopExtract(p, 'onderbroken');
    if (p.hp <= 0){ p.hp = 0; versla(p, door); }
    return klap;
  }
  /* Verslagen. Een kwart van je XP binnen dit level (nooit een level omlaag),
     en wat je bij je draagt valt als buidel op de grond. Versloeg een speler
     je, dan krijgt die precies de XP die jij kwijt bent: er komt niets bij en
     er gaat niets verloren. */
  function versla(p, door){
    if (p.neer) return;
    var verlies = Math.floor(p.xp * VERLIES.deel);
    p.xp -= verlies; p.verloren += verlies;
    p.neer = true; p.neerKlok = VERLIES.terug; p.hp = 0; p.leest = false; p.schild = 0;
    p.extract = null; p.crit = false; p.reeks = 0; p.dash = 0;
    p.buffs = { snel: 0, kracht: 0, taai: 0 };
    p.tel.verslagen++;
    var zak = null;
    if (p.buit > 0 || p.drank > 0){
      zak = { id: nrVan(), x: r1(p.x), y: r1(p.y), buit: p.buit, drank: p.drank, van: p.naam, tot: W.tijd + VERLIES.zak };
      W.zakken.push(zak);
    }
    var kwijtBuit = p.buit, kwijtDrank = p.drank;
    p.buit = 0; p.drank = 0; p.mkV++;
    var winnaar = door && door.naam !== undefined && door !== p && W.spelers.indexOf(door) >= 0 ? door : null;
    if (winnaar){
      winnaar.tel.spelers++;
      geefXp(winnaar, verlies, 'pvp');
      meld(winnaar, { e: 'pvpwin', wie: p.naam, xp: verlies });
    }
    meld(p, { e: 'verslagen', door: winnaar ? winnaar.naam : (door && door.soort ? (door.baas ? door.baas.naam : door.soort.naam) : ''),
              speler: !!winnaar, verlies: verlies, buit: kwijtBuit, drank: kwijtDrank });
    zeg('verslagen', p.nr, winnaar ? winnaar.nr : -1, verlies);
  }
  W.versla = function(i, j){ var p = W.spelers[i]; if (p) versla(p, j >= 0 ? W.spelers[j] : null); };

  /* ---------- de vijanden ---------- */
  function foutHp(lvl){ return 21 * Math.pow(1.12, lvl - 1); }
  function maakFout(soort, x, y, lvl, extra){
    var hp = Math.max(1, Math.round(foutHp(lvl) * soort.hp * (extra && extra.heet ? HEET.leven : 1)));
    var f = { id: nrVan(), soort: soort, x: x, y: y, hx: x, hy: y, lvl: lvl, hp: hp, maxHp: hp, r: soort.r,
              snel: soort.snel * (70 + lvl * 3.2), schade: soort.schade * (1 + 0.09 * (lvl - 1)) * (extra && extra.heet ? HEET.schade : 1),
              schild: soort.schild || 0, flits: 0, slaKlok: 0.5, mikt: 0, zij: toeval() < 0.5 ? 1 : -1,
              laadKlok: soort.laden ? 1.2 + toeval() : 0, stilKlok: 0, doel: null, terug: false, stun: 0,
              dood: false, weg: 0, wakker: false, zwerf: 0, zwerfKlok: 0, heet: !!(extra && extra.heet), buiten: 0,
              kamp: extra && extra.kamp || null, groep: extra && extra.groep || null, g: gebiedVan(x, y).id };
    W.fouten.push(f);
    return f;
  }
  function vulKamp(kamp){
    var g = GEBIED[kamp.g];
    var soorten = KAMPSOORTEN[kamp.g];
    var soort = FOUT[soorten[Math.floor(toeval() * soorten.length)]];
    var lvl = g.lvl[0] + Math.floor(toeval() * (g.lvl[1] - g.lvl[0] + 1));
    var n = soort.aantal || 1;
    for (var i = 0; i < n; i++){
      var h = toeval() * Math.PI * 2, d = 20 + toeval() * 60;
      var x = kamp.x + Math.cos(h) * d, y = kamp.y + Math.sin(h) * d;
      if (raakt(x, y, soort.r)){ x = kamp.x; y = kamp.y; }
      var f = maakFout(soort, x, y, lvl, { kamp: kamp, groep: kamp });
      kamp.leden.push(f);
    }
  }
  W.kampen.forEach(function(k){ for (var i = 0; i < k.n; i++) vulKamp(k); k.max = k.leden.length; });

  /* De bazen staan in het midden van hun hol, net als in de arena. */
  function maakBaas(hol){
    var def = hol.baas;
    var hp = Math.round(foutHp(hol.lvl) * def.hp * 1.25);
    var b = { id: nrVan(), soort: { id: 'baas', naam: def.naam, r: def.r, schade: def.schade, kleur: def.kleur }, baas: def, hol: hol,
              x: hol.x, y: hol.y, hx: hol.x, hy: hol.y, lvl: hol.lvl, hp: hp, maxHp: hp, basisHp: hp, r: def.r, snel: 0, schade: def.schade,
              schild: def.schild, flits: 0, slaKlok: 0, aanvalKlok: 2.2, laatste: -1, eerste: true, boos: false,
              dood: false, weg: 0, wakker: false, actief: false, door: {}, g: gebiedVan(hol.x, hol.y).id, n: hol.lvl * 1.5 };
    hol.b = b; hol.leeg = 0;
    W.fouten.push(b);
    return b;
  }
  W.holen.forEach(maakBaas);

  /* Welke vijanden er bij een speler in de buurt zijn. Alleen die rekenen,
     de rest van de kaart staat stil tot er iemand komt. Een keer per kwart
     seconde opnieuw bepaald. */
  var wakkerLijst = [];
  function wekken(){
    var levend = W.spelers.filter(function(p){ return !p.uit; });
    wakkerLijst = [];
    var gr = KAMP.wakker * KAMP.wakker;
    W.fouten.forEach(function(f){
      var w = false;
      for (var i = 0; i < levend.length && !w; i++) if (af2(f.x, f.y, levend[i].x, levend[i].y) < gr) w = true;
      f.wakker = w;
      if (w) wakkerLijst.push(f);
    });
  }

  function doelGeldig(f, p){
    return actief(p) && !p.leest && p.schild <= 0 && p.gebied.zone !== 0 && !p.gered;
  }
  function foutenStap(dt){
    var spelers = W.spelers;
    for (var n = 0; n < wakkerLijst.length; n++){
      var f = wakkerLijst[n];
      if (f.dood){ f.weg += dt; continue; }
      if (f.flits > 0) f.flits -= dt;
      if (f.baas){ baasStap(f, dt); continue; }
      if (f.slaKlok > 0) f.slaKlok -= dt;
      if (f.stun > 0){ f.stun -= dt; continue; }
      var vx = 0, vy = 0;
      /* terug naar huis: niet te raken en hij heelt onderweg */
      if (f.terug){
        var tx = f.hx - f.x, ty = f.hy - f.y, tl = Math.hypot(tx, ty);
        f.hp = Math.min(f.maxHp, f.hp + f.maxHp * 0.25 * dt);
        if (tl < 16){ f.terug = false; f.hp = f.maxHp; }
        else { vx = tx / tl * f.snel * 1.3; vy = ty / tl * f.snel * 1.3; }
      } else {
        /* een doel houden zolang dat kan, anders iemand zoeken binnen zijn zicht */
        var d = f.doel;
        if (d && (!doelGeldig(f, d) || af2(d.x, d.y, f.x, f.y) > 700 * 700)) d = f.doel = null;
        if (!d){
          var zicht = f.heet ? 380 : KAMP.jaag, best = zicht * zicht;
          for (var j = 0; j < spelers.length; j++){
            var q = spelers[j];
            if (!doelGeldig(f, q)) continue;
            var dq = af2(q.x, q.y, f.x, f.y);
            if (dq < best){ best = dq; d = q; }
          }
          f.doel = d;
        }
        if (d && !f.heet && af2(f.x, f.y, f.hx, f.hy) > KAMP.lijn * KAMP.lijn){ f.terug = true; f.doel = null; d = null; }
        if (d){
          var ax = d.x - f.x, ay = d.y - f.y, al = Math.hypot(ax, ay) || 1;
          var wil = 1;
          if (f.stilKlok > 0) f.stilKlok -= dt;
          var stil = !!f.soort.laden && (f.laadKlok <= f.soort.mik || f.stilKlok > 0);
          if (f.soort.afstand){
            wil = stil ? 0 : al > f.soort.afstand + 40 ? 1 : al < f.soort.afstand - 40 ? -0.9 : 0;
            if (!wil && !stil){ vx = -ay / al * f.snel * 0.55 * f.zij; vy = ax / al * f.snel * 0.55 * f.zij; }
          }
          /* tegen je aan: niet verder duwen, dan staat hij niet midden in je */
          if (wil > 0 && al < f.r + SPELER.r * 0.9) wil = 0;
          vx += ax / al * f.snel * wil; vy += ay / al * f.snel * wil;
          if (f.soort.laden){
            var wilHoek = Math.atan2(ay, ax);
            f.mikt += hoekVerschil(wilHoek, f.mikt) * Math.min(1, dt * 4);
            f.laadKlok -= dt;
            if (f.laadKlok <= 0 && al < 520){
              f.laadKlok = f.soort.laden;
              f.stilKlok = AANVAL.schot.wacht;
              W.aanvallen.push({ id: nrVan(), soort: 'schot', x: f.x, y: f.y, hoek: f.mikt, t: 0, k: 1, schade: f.schade * 1.4, van: f });
            }
          }
          /* raak: tegen je aan lopen doet pijn */
          if (al < f.r + SPELER.r + 2 && f.slaKlok <= 0){ f.slaKlok = 0.8; tref(d, f.schade, f); }
        } else {
          /* rustig rondscharrelen bij het kamp */
          f.zwerfKlok -= dt;
          if (f.zwerfKlok <= 0){ f.zwerf = toeval() * Math.PI * 2; f.zwerfKlok = 1.5 + toeval() * 3; }
          var hd = af2(f.x, f.y, f.hx, f.hy);
          var hoek = hd > 70 * 70 ? Math.atan2(f.hy - f.y, f.hx - f.x) : f.zwerf;
          vx = Math.cos(hoek) * f.snel * 0.3; vy = Math.sin(hoek) * f.snel * 0.3;
        }
      }
      /* niet op elkaar staan: alleen met de eigen groep, dat zijn er een paar */
      var groep = f.groep ? f.groep.leden : null;
      if (groep){
        for (var k = 0; k < groep.length; k++){
          var g2 = groep[k];
          if (g2 === f || g2.dood) continue;
          var gx = f.x - g2.x, gy = f.y - g2.y, gl = Math.hypot(gx, gy), min = f.r + g2.r;
          if (gl > 0 && gl < min){ vx += gx / gl * (min - gl) * 6; vy += gy / gl * (min - gl) * 6; }
        }
      }
      if (vx || vy) schuif(f, f.x + vx * dt, f.y + vy * dt, f.r);
      /* de stad in komt geen monster */
      var mx = f.x - MID.x, my = f.y - MID.y, md = Math.hypot(mx, my) || 1, grens = ZONE.veilig + f.r + 6;
      if (md < grens){ f.x = MID.x + mx / md * grens; f.y = MID.y + my / md * grens; if (f.doel && f.doel.gebied.zone === 0) f.doel = null; }
      /* een genezer heelt wie er in zijn buurt staat */
      if (f.soort.heelt){
        f.heelKlok = (f.heelKlok || 0) - dt;
        if (f.heelKlok <= 0 && groep){
          f.heelKlok = 1;
          groep.forEach(function(o){
            if (o !== f && !o.dood && o.hp < o.maxHp && af2(o.x, o.y, f.x, f.y) < 150 * 150) o.hp = Math.min(o.maxHp, o.hp + Math.max(1, Math.round(o.maxHp * f.soort.heelt)));
          });
        }
      }
      /* een hete vijand die te lang buiten de hotzone staat verdwijnt */
      if (f.heet){
        if (!inHeet(f.x, f.y)) f.buiten += dt; else f.buiten = 0;
        if (f.buiten > HEET.uitTijd){ f.dood = true; f.stil = true; f.doodOp = W.tijd; }
      }
    }
  }

  function raakFout(f, schade, p, vanaf, pijl){
    if (f.dood || f.terug) return 0;
    /* een baas raak je alleen vanuit zijn hol: van buiten schieten zonder dat
       hij terug kan slaan is geen gevecht */
    if (f.baas && (!f.actief || !p || af2(p.x, p.y, f.hol.x, f.hol.y) > Math.pow(f.hol.R + 40, 2))) return 0;
    var crit = !!(p && p.crit);
    if (crit){ p.crit = false; schade *= CRIT.x; p.mkV++; }
    if (p && p.buffs.kracht > 0) schade *= BUFF.kracht;
    if (pijl && f.soort.pijlDeel) schade *= f.soort.pijlDeel;
    var echt = Math.max(1, Math.round(schade * (f.schild ? 1 - f.schild : 1)));
    f.hp -= echt; f.flits = 0.15;
    if (p){ if (!f.baas) f.doel = p; else f.door[p.nr] = (f.door[p.nr] || 0) + echt; }
    if (crit){
      meld(p, { e: 'critraak', x: r1(f.x), y: r1(f.y) });
      wakkerLijst.forEach(function(g3){
        if (g3 !== f && !g3.dood && !g3.terug && af2(g3.x, g3.y, f.x, f.y) < Math.pow(CRIT.straal + g3.r, 2)){
          var e2 = Math.round(schade * CRIT.deel * (g3.schild ? 1 - g3.schild : 1));
          g3.hp -= e2; g3.flits = 0.15;
          if (g3.hp <= 0) sterf(g3, p);
        }
      });
    }
    if (vanaf && !f.baas){ var h = Math.atan2(f.y - vanaf.y, f.x - vanaf.x); schuif(f, f.x + Math.cos(h) * 18, f.y + Math.sin(h) * 18, f.r); }
    if (f.hp <= 0) sterf(f, p);
    return echt;
  }
  function sterf(f, p){
    if (f.dood) return;
    f.dood = true; f.hp = 0; f.weg = 0; f.doodOp = W.tijd;
    if (f.baas){ baasWeg(f); return; }
    if (p && !p.uit){
      var xp = Math.max(1, Math.round(XP.fout(f.lvl) * f.soort.xp * (f.heet ? HEET.beloning : 1)));
      geefXp(p, xp, 'fout');
      p.tel.geveld++;
      if (toeval() < 0.3){
        var goud = Math.round((2 + f.lvl) * (f.heet ? HEET.beloning : 1) * (GEBIED[f.g] && GEBIED[f.g].zone === 2 ? 1.5 : 1));
        p.buit += goud; p.runGoud += goud; p.mkV++;
        meld(p, { e: 'goud', n: goud, x: r1(f.x), y: r1(f.y) });
      }
      questTel(p, 'versla', { g: f.g, f: f.soort.id, heet: f.heet || inHeet(f.x, f.y) });
    }
    if (f.soort.splijt){
      var st = FOUT.stukje;
      for (var i = 0; i < f.soort.splijt; i++){
        var hk = toeval() * Math.PI * 2;
        var s = maakFout(st, f.x + Math.cos(hk) * 26, f.y + Math.sin(hk) * 26, f.lvl, { heet: f.heet, groep: f.groep });
        s.slaKlok = 0.4; s.doel = p || null; s.wakker = true;
        if (f.groep) f.groep.leden.push(s);
        wakkerLijst.push(s);
      }
    }
    if (f.kamp) f.kamp.wacht.push(W.tijd + KAMP.terug);
  }

  /* ---------- de bazen ---------- */
  function spelersInHol(hol){
    var uit = [], rr = hol.R * hol.R;
    W.spelers.forEach(function(p){ if (actief(p) && !p.leest && !p.gered && af2(p.x, p.y, hol.x, hol.y) < rr) uit.push(p); });
    return uit;
  }
  function baasStap(b, dt){
    var hol = b.hol, levend = spelersInHol(hol);
    if (!levend.length){
      /* een leeg hol: na een paar tellen is hij weer heel en begint het opnieuw */
      hol.leeg += dt;
      if (hol.leeg > HOL.leegReset && (b.actief || b.hp < b.maxHp)){
        b.actief = false; b.hp = b.maxHp = b.basisHp; b.door = {}; b.boos = false; b.aanvalKlok = 2.2; b.eerste = true;
        W.aanvallen = W.aanvallen.filter(function(a){ return a.hol !== hol; });
      }
      return;
    }
    hol.leeg = 0;
    if (!b.actief){
      /* hij wordt wakker: met meer spelers is hij taaier */
      b.actief = true;
      var keer = 0.7 + 0.3 * levend.length;
      b.maxHp = Math.round(b.basisHp * keer); b.hp = b.maxHp;
      levend.forEach(function(p){ meld(p, { e: 'baas', naam: b.baas.naam }); });
    }
    b.aanvalKlok -= dt;
    if (b.slaKlok > 0) b.slaKlok -= dt;
    var boos = b.hp <= b.maxHp / 2;
    if (boos && !b.boos){ b.boos = true; levend.forEach(function(p){ meld(p, { e: 'boos', naam: b.baas.naam }); }); }
    var vrij = !W.aanvallen.some(function(a){ return a.hol === hol && a.soort !== 'plas'; });
    if (b.aanvalKlok <= 0 && vrij){
      baasValtAan(b, levend, boos);
      b.aanvalKlok = AANVAL.pauze(b.n) * (boos ? AANVAL.boosPauze : 1) + duurVan(b.baas.aanvallen[b.laatste], b.n);
    }
    /* tegen de baas aan lopen doet pijn */
    levend.forEach(function(p){
      if (af2(p.x, p.y, b.x, b.y) < Math.pow(b.r + SPELER.r + 2, 2) && b.slaKlok <= 0){ b.slaKlok = 0.8; tref(p, b.schade * (1 + 0.04 * b.lvl) * 0.85, b); }
    });
  }
  function baasWeg(b){
    var hol = b.hol;
    hol.b = null; hol.terugOp = W.tijd + HOL.terug;
    W.aanvallen = W.aanvallen.filter(function(a){ return a.hol !== hol; });
    /* iedereen die meedeed krijgt de XP en het goud */
    Object.keys(b.door).forEach(function(nr){
      var p = W.spelers[+nr];
      if (!p || p.uit) return;
      var xp = Math.round(XP.baas(b.lvl)), goud = 30 + 8 * b.lvl;
      p.buit += goud; p.runGoud += goud; p.tel.bazen++;
      geefXp(p, xp, 'baas');
      meld(p, { e: 'baasweg', naam: b.baas.naam, xp: xp, goud: goud });
      questTel(p, 'baas', {});
    });
  }
  function vrijPunt(hol, marge){
    var h = toeval() * Math.PI * 2, d = Math.sqrt(toeval()) * (hol.R - (marge || 50));
    return { x: hol.x + Math.cos(h) * d, y: hol.y + Math.sin(h) * d };
  }
  function eenSpeler(levend){ return levend[Math.floor(toeval() * levend.length)]; }
  function dichtsteAf(b, levend){
    var kort = 1e9;
    levend.forEach(function(p){ var d = Math.hypot(p.x - b.x, p.y - b.y); if (d < kort) kort = d; });
    return kort;
  }
  function baasValtAan(b, levend, boos){
    var rij = b.baas.aanvallen, k = AANVAL.korter(b.n) * (boos ? AANVAL.boosKorter : 1);
    var ver = dichtsteAf(b, levend) > 210;
    var wens = rij.filter(function(a){ return (ver ? VERAANVAL : DICHTBIJAANVAL)[a]; });
    if (!wens.length) wens = rij;
    var i = b.eerste ? rij.indexOf(wens[0]) : rij.indexOf(wens[Math.floor(toeval() * wens.length)]);
    if (i < 0) i = 0;
    b.eerste = false;
    if (i === b.laatste && rij.length > 1) i = (i + 1) % rij.length;
    b.laatste = i;
    zetAanval(rij[i], b, levend, k);
    if (boos && toeval() < AANVAL.boosDubbel){
      var j = (i + 1 + Math.floor(toeval() * (rij.length - 1))) % rij.length;
      zetAanval(rij[j], b, levend, k);
    }
  }
  function zetAanval(soort, b, levend, k){
    var i, n, p, hoek, doel, A = W.aanvallen, hol = b.hol, sterk = b.n;
    function erbij(a){ a.id = nrVan(); a.hol = hol; a.bz = b.baas.nr; a.lvl = b.lvl; a.t = a.t || 0; a.k = k; A.push(a); }
    if (soort === 'cirkel'){
      levend.forEach(function(P){ erbij({ soort: 'cirkel', x: P.x, y: P.y }); });
      n = AANVAL.cirkel.extra(sterk);
      for (i = 0; i < n; i++){ p = vrijPunt(hol); erbij({ soort: 'cirkel', x: p.x, y: p.y }); }
    } else if (soort === 'laser' || soort === 'wijzers'){
      var w = soort === 'wijzers' ? AANVAL.wijzers : AANVAL.laser;
      doel = eenSpeler(levend);
      hoek = Math.atan2(doel.y - b.y, doel.x - b.x) - (soort === 'wijzers' ? 0 : AANVAL.laser.boog * 0.35);
      var richting = toeval() < 0.5 ? 1 : -1;
      n = soort === 'wijzers' ? 2 : AANVAL.laser.stralen(sterk);
      for (i = 0; i < n; i++){
        erbij({ soort: 'laser', x: b.x, y: b.y, r0: b.r, richting: richting, hoek: hoek + i * Math.PI * 2 / n,
                boog: soort === 'wijzers' ? Math.PI * 2 : AANVAL.laser.boog, duur: w.duur, breed: w.breed, schade: w.schade, wacht: w.wacht });
      }
    } else if (soort === 'golf'){
      n = AANVAL.golf.ringen(sterk);
      for (i = 0; i < n; i++) erbij({ soort: 'golf', x: b.x, y: b.y, r0: b.r, t: -i * 0.55 });
    } else if (soort === 'plas'){
      doel = eenSpeler(levend);
      erbij({ soort: 'plas', x: doel.x, y: doel.y });
      n = AANVAL.plas.aantal(sterk) - 1;
      for (i = 0; i < n; i++){ p = vrijPunt(hol, 70); erbij({ soort: 'plas', x: p.x, y: p.y, t: -i * 0.12 }); }
    } else if (soort === 'kegel'){
      doel = eenSpeler(levend);
      hoek = Math.atan2(doel.y - b.y, doel.x - b.x);
      erbij({ soort: 'kegel', x: b.x, y: b.y, hoek: hoek });
      if (sterk >= 18) erbij({ soort: 'kegel', x: b.x, y: b.y, hoek: hoek + Math.PI, t: -0.4 });
    } else if (soort === 'baan'){
      hoek = toeval() * Math.PI;
      n = AANVAL.baan.aantal(sterk);
      var mid = vrijPunt(hol, 120);
      for (i = 0; i < n; i++){
        var af = (i - (n - 1) / 2) * 200;
        erbij({ soort: 'baan', hoek: hoek, t: -i * 0.1, x: mid.x + Math.cos(hoek + Math.PI / 2) * af, y: mid.y + Math.sin(hoek + Math.PI / 2) * af });
      }
    } else if (soort === 'kruis'){
      p = eenSpeler(levend); hoek = toeval() * Math.PI;
      erbij({ soort: 'baan', x: p.x, y: p.y, hoek: hoek, breed: AANVAL.kruis.breed });
      erbij({ soort: 'baan', x: p.x, y: p.y, hoek: hoek + Math.PI / 2, breed: AANVAL.kruis.breed });
    } else if (soort === 'kogel'){
      n = AANVAL.kogel.aantal(sterk);
      var draai = toeval() * Math.PI * 2;
      for (i = 0; i < n; i++) erbij({ soort: 'kogel', x: b.x, y: b.y, hoek: draai + i * Math.PI * 2 / n });
    } else if (soort === 'tik'){
      var start = Math.floor(toeval() * AANVAL.tik.aantal), om = toeval() < 0.5 ? 1 : -1;
      for (i = 0; i < AANVAL.tik.aantal; i++){
        var h3 = (start + om * i) * Math.PI * 2 / AANVAL.tik.aantal;
        erbij({ soort: 'tik', t: -i * AANVAL.tik.na, x: b.x + Math.cos(h3) * AANVAL.tik.ring, y: b.y + Math.sin(h3) * AANVAL.tik.ring });
      }
    } else if (soort === 'regen'){
      var rg = AANVAL.regen; n = rg.aantal(sterk);
      for (i = 0; i < n; i++){
        p = i === n - 1 ? eenSpeler(levend) : vrijPunt(hol, 40);
        erbij({ soort: 'cirkel', x: p.x, y: p.y, t: -i * rg.na, straal: rg.r });
      }
    } else if (soort === 'muur'){
      var kant = Math.floor(toeval() * 4);
      erbij({ soort: 'muur', x: b.x, y: b.y, hoek: kant * Math.PI / 2, gat: 0.15 + toeval() * 0.7 });
      if (sterk >= 15) erbij({ soort: 'muur', x: b.x, y: b.y, hoek: ((kant + 2) % 4) * Math.PI / 2, gat: 0.15 + toeval() * 0.7, t: -0.6 });
    } else if (soort === 'spiraal'){
      var spi = AANVAL.spiraal, start2 = toeval() * Math.PI * 2, om2 = toeval() < 0.5 ? 1 : -1;
      n = spi.aantal(sterk);
      for (i = 0; i < n; i++) erbij({ soort: 'kogel', x: b.x, y: b.y, hoek: start2 + om2 * i * spi.draai, t: -i * spi.na });
    } else if (soort === 'bom'){
      var bo = AANVAL.bom; n = bo.aantal(sterk);
      for (i = 0; i < n; i++){
        doel = eenSpeler(levend);
        hoek = Math.atan2(doel.y - b.y, doel.x - b.x) + (i ? (toeval() - 0.5) * 1.2 : 0);
        erbij({ soort: 'bom', x: b.x, y: b.y, hoek: hoek, t: -i * 0.5 });
      }
    } else if (soort === 'krimp'){
      erbij({ soort: 'krimp', x: b.x, y: b.y, r0: b.r, gat: toeval() * Math.PI * 2 });
    }
  }
  function duurVan(soort, n){
    var A = AANVAL;
    if (soort === 'laser') return A.laser.wacht + A.laser.duur;
    if (soort === 'wijzers') return A.wijzers.wacht + A.wijzers.duur;
    if (soort === 'golf') return A.golf.wacht + A.golf.duur + (A.golf.ringen(n) - 1) * 0.55;
    if (soort === 'plas') return A.plas.wacht + 1.6;
    if (soort === 'kegel') return A.kegel.wacht + A.kegel.knal + 0.4;
    if (soort === 'baan') return A.baan.wacht + A.baan.knal + 0.3;
    if (soort === 'kruis') return A.kruis.wacht + A.kruis.knal + 0.3;
    if (soort === 'kogel') return 1.6;
    if (soort === 'tik') return A.tik.wacht + A.tik.na * A.tik.aantal;
    if (soort === 'krimp') return A.krimp.wacht + A.krimp.duur;
    if (soort === 'regen') return A.cirkel.wacht + A.regen.na * A.regen.aantal(n) + 0.3;
    if (soort === 'muur') return A.muur.wacht + A.muur.duur + (n >= 15 ? 0.6 : 0);
    if (soort === 'spiraal') return A.spiraal.na * A.spiraal.aantal(n) + 1;
    if (soort === 'bom') return 0.5 * (A.bom.aantal(n) - 1) + A.bom.duur + 1.2;
    return A.cirkel.wacht + A.cirkel.knal;
  }
  /* De muur veegt van de ene kant van het hol naar de andere, met een gat. */
  function muurStand(a, hol){
    var mu = AANVAL.muur, W0 = mu.wacht * (a.k || 1), p = Math.min(1, Math.max(0, (a.t - W0) / mu.duur));
    var kant = Math.round(a.hoek / (Math.PI / 2)) % 4, langsX = kant % 2 === 0;
    var van = -hol.R - mu.breed / 2, tot = hol.R + mu.breed / 2;
    return { langsX: langsX, pos: (langsX ? hol.x : hol.y) + (kant < 2 ? van + p * (tot - van) : tot - p * (tot - van)),
             gatMidden: (langsX ? hol.y : hol.x) - hol.R + 30 + (a.gat || 0.5) * (2 * hol.R - 60), gatBreed: mu.gat, deel: p, wacht: W0 };
  }
  /* een aanval van een baas treft: de schade groeit met zijn level */
  function trefBaas(p, schade, a){
    tref(p, schade * (1 + a.lvl * 0.052) * 0.85, a.hol && a.hol.b ? a.hol.b : null);
  }
  function aanvallenStap(dt){
    var perHol = {};
    function levendIn(hol){
      if (!hol) return [];
      return perHol[hol.id] || (perHol[hol.id] = spelersInHol({ x: hol.x, y: hol.y, R: hol.R + 120 }));
    }
    W.aanvallen.forEach(function(a){
      a.t += dt;
      var levend, c;
      if (a.soort === 'schot'){
        /* het schot van een schutter: iedereen in de buurt kan geraakt worden */
        var sc = AANVAL.schot, scW = sc.wacht;
        if (a.t >= scW){
          var nx = a.x + Math.cos(a.hoek) * sc.snel * dt, ny = a.y + Math.sin(a.hoek) * sc.snel * dt;
          if (raakt(nx, ny, 3, true)){ a.klaar = true; return; }
          a.x = nx; a.y = ny;
          for (var j = 0; j < W.spelers.length; j++){
            var q = W.spelers[j];
            if (actief(q) && af2(q.x, q.y, a.x, a.y) < Math.pow(sc.r + SPELER.r * 0.8, 2)){ tref(q, a.schade, a.van); a.klaar = true; break; }
          }
          if (a.t > scW + sc.leven) a.klaar = true;
        }
        return;
      }
      levend = levendIn(a.hol);
      var k = a.k || 1;
      if (a.soort === 'cirkel'){
        c = AANVAL.cirkel;
        var cW = c.wacht * k;
        if (a.t >= cW && !a.geknald){
          a.geknald = true;
          levend.forEach(function(P){ if (Math.hypot(P.x - a.x, P.y - a.y) < (a.straal || c.r) + SPELER.r * 0.5) trefBaas(P, c.schade, a); });
        }
        if (a.t >= cW + c.knal) a.klaar = true;
      } else if (a.soort === 'laser'){
        var lW = (a.wacht || AANVAL.laser.wacht) * k;
        if (a.t >= lW){
          var deel = Math.min(1, (a.t - lW) / a.duur);
          a.nu = a.hoek + a.richting * a.boog * deel;
          var cx = Math.cos(a.nu), cy = Math.sin(a.nu);
          levend.forEach(function(P){
            var px = P.x - a.x, py = P.y - a.y, langs = px * cx + py * cy;
            if (langs < (a.r0 || 46) || langs > 620) return;
            if (Math.abs(-px * cy + py * cx) < a.breed / 2 + SPELER.r * 0.7) trefBaas(P, a.schade, a);
          });
          if (deel >= 1) a.klaar = true;
        } else a.nu = a.hoek;
      } else if (a.soort === 'golf'){
        var go = AANVAL.golf, gW = go.wacht * k, r0 = a.r0 || 46;
        if (a.t >= gW){
          var d2 = Math.min(1, (a.t - gW) / go.duur);
          a.straal = r0 + d2 * (go.tot - r0);
          levend.forEach(function(P){ if (Math.abs(Math.hypot(P.x - a.x, P.y - a.y) - a.straal) < go.band / 2 + SPELER.r * 0.7) trefBaas(P, go.schade, a); });
          if (d2 >= 1) a.klaar = true;
        }
      } else if (a.soort === 'plas'){
        var pl = AANVAL.plas, pW = pl.wacht * k;
        if (a.t >= pW){
          levend.forEach(function(P){ if (Math.hypot(P.x - a.x, P.y - a.y) < pl.r) trefBaas(P, pl.schade, a); });
          if (a.t >= pW + pl.duur) a.klaar = true;
        }
      } else if (a.soort === 'kegel'){
        var ke = AANVAL.kegel, keW = ke.wacht * k;
        if (a.t >= keW && !a.geknald){
          a.geknald = true;
          levend.forEach(function(P){
            var dx2 = P.x - a.x, dy2 = P.y - a.y;
            if (Math.hypot(dx2, dy2) > ke.ver) return;
            if (Math.abs(hoekVerschil(Math.atan2(dy2, dx2), a.hoek)) <= ke.wijd) trefBaas(P, ke.schade, a);
          });
        }
        if (a.t >= keW + ke.knal) a.klaar = true;
      } else if (a.soort === 'baan'){
        var ba = AANVAL.baan, baW = ba.wacht * k, breed = a.breed || ba.breed;
        if (a.t >= baW && !a.geknald){
          a.geknald = true;
          var bx = Math.cos(a.hoek), by = Math.sin(a.hoek);
          levend.forEach(function(P){
            var px2 = P.x - a.x, py2 = P.y - a.y;
            if (Math.abs(-px2 * by + py2 * bx) < breed / 2 + SPELER.r * 0.6 && Math.abs(px2 * bx + py2 * by) < a.hol.R + 60) trefBaas(P, ba.schade, a);
          });
        }
        if (a.t >= baW + ba.knal) a.klaar = true;
      } else if (a.soort === 'tik'){
        var ti = AANVAL.tik, tiW = ti.wacht * k;
        if (a.t >= tiW && !a.geknald){
          a.geknald = true;
          levend.forEach(function(P){ if (Math.hypot(P.x - a.x, P.y - a.y) < ti.r + SPELER.r * 0.5) trefBaas(P, ti.schade, a); });
        }
        if (a.t >= tiW + ti.knal) a.klaar = true;
      } else if (a.soort === 'kogel'){
        var ko = AANVAL.kogel;
        if (a.t >= 0){
          a.x += Math.cos(a.hoek) * ko.snel * dt; a.y += Math.sin(a.hoek) * ko.snel * dt;
          levend.forEach(function(P){ if (!a.klaar && Math.hypot(P.x - a.x, P.y - a.y) < ko.r + SPELER.r * 0.8){ trefBaas(P, ko.schade, a); a.klaar = true; } });
          if (a.t > ko.leven || af2(a.x, a.y, a.hol.x, a.hol.y) > Math.pow(a.hol.R + 140, 2)) a.klaar = true;
        }
      } else if (a.soort === 'muur'){
        var mu = AANVAL.muur, ms = muurStand(a, a.hol);
        if (a.t >= ms.wacht){
          levend.forEach(function(P){
            var langs2 = ms.langsX ? P.x : P.y, dwars2 = ms.langsX ? P.y : P.x;
            if (Math.abs(langs2 - ms.pos) < mu.breed / 2 + SPELER.r * 0.6 && Math.abs(dwars2 - ms.gatMidden) > ms.gatBreed / 2 - SPELER.r * 0.3 &&
                Math.abs(dwars2 - (ms.langsX ? a.hol.y : a.hol.x)) < a.hol.R) trefBaas(P, mu.schade, a);
          });
          if (ms.deel >= 1) a.klaar = true;
        }
      } else if (a.soort === 'bom'){
        var bo = AANVAL.bom;
        if (a.t >= 0){
          a.x += Math.cos(a.hoek) * bo.snel * dt; a.y += Math.sin(a.hoek) * bo.snel * dt;
          var knalt = a.t >= bo.duur;
          levend.forEach(function(P){ if (Math.hypot(P.x - a.x, P.y - a.y) < bo.r + SPELER.r * 0.8){ trefBaas(P, bo.schade, a); knalt = true; } });
          if (knalt){
            a.klaar = true;
            var h0 = toeval() * Math.PI * 2;
            for (var si = 0; si < bo.scherven; si++) W.aanvallen.push({ id: nrVan(), soort: 'kogel', x: a.x, y: a.y, hoek: h0 + si * Math.PI * 2 / bo.scherven, t: 0, k: a.k, hol: a.hol, bz: a.bz, lvl: a.lvl });
          }
        }
      } else if (a.soort === 'krimp'){
        var kr = AANVAL.krimp, krW = kr.wacht * k, rEind = (a.r0 || 46) + 18;
        if (a.t >= krW){
          var d3 = Math.min(1, (a.t - krW) / kr.duur);
          a.straal = kr.van - d3 * (kr.van - rEind);
          levend.forEach(function(P){
            var dx3 = P.x - a.x, dy3 = P.y - a.y;
            if (Math.abs(Math.hypot(dx3, dy3) - a.straal) >= kr.band / 2 + SPELER.r * 0.7) return;
            if (Math.abs(hoekVerschil(Math.atan2(dy3, dx3), a.gat)) > kr.gat / 2) trefBaas(P, kr.schade, a);
          });
          if (d3 >= 1) a.klaar = true;
        }
      }
    });
    W.aanvallen = W.aanvallen.filter(function(a){ return !a.klaar; });
  }

  /* ---------- de spelers ---------- */
  function spelerStap(p, dt){
    if (p.uit) return;
    if (p.neer){
      p.neerKlok -= dt;
      if (p.neerKlok <= 0){
        /* terug in de stad, met vol leven en even niet te raken */
        var pl = spawnPlek();
        p.x = pl.x; p.y = pl.y; p.neer = false; p.hp = p.maxHp; p.raak = 2; p.mkV++;
        meld(p, { e: 'terug' });
      }
      return;
    }
    if (p.gered) return;
    if (p.raak > 0) p.raak -= dt;
    if (p.flits > 0) p.flits -= dt;
    if (p.dashKlok > 0) p.dashKlok -= dt;
    if (p.krKlok > 0) p.krKlok -= dt;
    if (p.zwaai > 0) p.zwaai -= dt;
    if (p.werv > 0) p.werv -= dt;
    if (p.schildWacht > 0) p.schildWacht -= dt;
    if (p.schild > 0){
      p.schild -= dt;
      if (p.schild <= 0){ p.schild = 0; p.schildWacht = SCHILD.wacht; meld(p, { e: 'schildop' }); }
    }
    /* vanzelf helen */
    if (p.hp < p.maxHp){
      var heel = p.gebied.zone === 0 ? HEEL.stad : (W.tijd - p.geraaktOp > HEEL.rust ? HEEL.wild : 0);
      if (heel) p.hp = Math.min(p.maxHp, p.hp + p.maxHp * heel * dt);
    }
    var bf = p.buffs, eenBuf = false;
    ['snel', 'kracht', 'taai'].forEach(function(k){ if (bf[k] > 0){ bf[k] -= dt; eenBuf = true; if (bf[k] <= 0){ bf[k] = 0; p.mkV++; } } });

    /* blokken: de schildwacht, zolang er tijd op de meter staat */
    if (p.blokVraag && p.klasse === 'wacht' && p.blokTijd > 0 && !p.leest){ p.blok = true; p.blokTijd = Math.max(0, p.blokTijd - dt); }
    else { p.blok = false; p.blokTijd = Math.min(p.af.blokMax, p.blokTijd + BLOK.laad * dt); }

    if (!p.leest){
      var snel = p.af.snel * (bf.snel > 0 ? BUFF.snel : 1) * (p.blok ? BLOK.traag : 1);
      var l = Math.hypot(p.dx, p.dy);
      if (l > 0.01){
        schuif(p, p.x + p.dx * snel * dt, p.y + p.dy * snel * dt, SPELER.r);
        p.kijkX = p.dx / l; p.kijkY = p.dy / l;
      }
      if (p.dash > 0){
        p.dash -= dt;
        schuif(p, p.x + p.ddx * DASH.snel * dt, p.y + p.ddy * DASH.snel * dt, SPELER.r);
      }
    }
    var gb = gebiedVan(p.x, p.y);
    if (gb !== p.gebied){
      var was = p.gebied;
      p.gebied = gb; p.mkV++;
      meld(p, { e: 'gebied', g: gb.nr, was: was.nr });
    }
    extractStap(p, dt);
    if (!p.leest && !p.extract) wapens(p, dt);
  }

  /* Het wapen slaat vanzelf naar het dichtstbijzijnde doel binnen bereik,
     zoals in Zwaardvechter. In de rode zone kan dat ook een speler zijn. */
  function wapens(p, dt){
    p.klok -= dt;
    var d = dichtsteVijand(p, 460);
    if (d){
      var wil = Math.atan2(d.y - p.y, d.x - p.x);
      p.mikt += hoekVerschil(wil, p.mikt) * Math.min(1, dt * 12);
    } else if (p.dx || p.dy){
      p.mikt += hoekVerschil(Math.atan2(p.dy, p.dx), p.mikt) * Math.min(1, dt * 8);
    }
    if (!d || p.klok > 0 || p.gebied.zone === 0) return;
    var dr = d.r || SPELER.r, afst = Math.hypot(d.x - p.x, d.y - p.y);
    if (p.wapen === 'boog'){
      if (afst > p.af.boogBereik + dr) return;
      p.klok = p.af.boogTempo; p.zwaai = 0.12;
      var h = Math.atan2(d.y - p.y, d.x - p.x);
      schiet(p, h, p.af.boogSchade, 0, 0);
      return;
    }
    if (afst > p.af.bereik + dr) return;
    p.klok = p.af.tempo; p.zwaai = 0.18;
    slag(p, p.af.bereik, SPELER.boog / 2 * Math.PI / 180, p.af.schade, false);
  }
  function schiet(p, h, schade, door, soort){
    W.pijlen.push({ x: p.x + Math.cos(h) * (SPELER.r + 4), y: p.y + Math.sin(h) * (SPELER.r + 4),
                    vx: Math.cos(h) * SPELER.pijlboog.snel, vy: Math.sin(h) * SPELER.pijlboog.snel, hoek: h,
                    leven: p.af.boogBereik / SPELER.pijlboog.snel + 0.15, schade: schade, van: p, door: door || 0, geraakt: {}, soort: soort || 0 });
  }
  /* een slag: alles in de boog voor je (of rondom) krijgt hem */
  function slag(p, bereik, halveBoog, schade, rondom){
    var raak = 0;
    for (var i = 0; i < wakkerLijst.length; i++){
      var f = wakkerLijst[i];
      if (f.dood || f.terug) continue;
      var d = Math.hypot(f.x - p.x, f.y - p.y);
      if (d > bereik + f.r) continue;
      /* wat tegen je aan staat raak je altijd: daar is de hoek een toevalstreffer */
      if (!rondom && d > f.r + SPELER.r && Math.abs(hoekVerschil(Math.atan2(f.y - p.y, f.x - p.x), p.mikt)) > halveBoog) continue;
      raakFout(f, schade, p, p, false); raak++;
    }
    if (p.gebied.zone === 2){
      W.spelers.forEach(function(q){
        if (!magPvp(p, q)) return;
        var d2 = Math.hypot(q.x - p.x, q.y - p.y);
        if (d2 > bereik + SPELER.r) return;
        if (!rondom && d2 > 2 * SPELER.r && Math.abs(hoekVerschil(Math.atan2(q.y - p.y, q.x - p.x), p.mikt)) > halveBoog) return;
        raakSpeler(q, schade, p); raak++;
      });
    }
    return raak;
  }
  function raakSpeler(q, schade, p){
    if (!magPvp(p, q)) return 0;
    if (p.crit){ p.crit = false; schade *= CRIT.x; p.mkV++; }
    if (p.buffs.kracht > 0) schade *= BUFF.kracht;
    return tref(q, schade * PVP.deel, p);
  }
  /* de kracht van je klasse */
  W.kracht = function(i){
    var p = W.spelers[i]; if (!actief(p) || p.leest || p.krKlok > 0 || p.gebied.zone === 0) return false;
    var kr = KRACHT[p.klasse];
    p.krKlok = p.af.krachtPauze;
    if (p.klasse === 'ridder'){
      p.werv = 0.35; p.zwaai = 0.18;
      slag(p, p.af.bereik * kr.bereik, Math.PI, p.af.schade * p.af.krachtX, true);
    } else if (p.klasse === 'schutter'){
      p.zwaai = 0.12;
      for (var k = 0; k < kr.pijlen; k++){
        var h = p.mikt + (k - (kr.pijlen - 1) / 2) * (kr.waaier / (kr.pijlen - 1)) * Math.PI / 180;
        schiet(p, h, p.af.boogSchade * p.af.krachtX, 1, 1);
      }
    } else {
      p.werv = 0.3; p.raak = Math.max(p.raak, 0.5);
      wakkerLijst.forEach(function(f){
        if (f.dood || f.terug) return;
        var d = Math.hypot(f.x - p.x, f.y - p.y);
        if (d > kr.bereik + f.r) return;
        raakFout(f, p.af.schade * p.af.krachtX, p, null, false);
        if (!f.baas && !f.dood){
          var h2 = Math.atan2(f.y - p.y, f.x - p.x);
          schuif(f, f.x + Math.cos(h2) * kr.duw, f.y + Math.sin(h2) * kr.duw, f.r);
          f.stun = kr.verdoof;
        }
      });
      if (p.gebied.zone === 2) W.spelers.forEach(function(q){
        if (magPvp(p, q) && Math.hypot(q.x - p.x, q.y - p.y) < kr.bereik + SPELER.r){
          raakSpeler(q, p.af.schade * p.af.krachtX, p);
          if (q.extract) stopExtract(q, 'onderbroken');
        }
      });
    }
    meld(p, { e: 'kracht' });
    return true;
  };

  function pijlenStap(dt){
    W.pijlen.forEach(function(m){
      if (m.leven <= 0) return;
      m.leven -= dt;
      var nx = m.x + m.vx * dt, ny = m.y + m.vy * dt;
      if (raakt(nx, ny, 3, true)){ m.leven = 0; return; }
      m.x = nx; m.y = ny;
      for (var i = 0; i < wakkerLijst.length && m.leven > 0; i++){
        var f = wakkerLijst[i];
        if (f.dood || f.terug || m.geraakt[f.id]) continue;
        if (af2(f.x, f.y, m.x, m.y) < Math.pow(f.r + 6, 2)){
          raakFout(f, m.schade, m.van, null, true);
          if (m.door > 0){ m.door--; m.geraakt[f.id] = 1; } else m.leven = 0;
        }
      }
      if (m.leven > 0 && m.van && m.van.gebied.zone === 2){
        for (var j = 0; j < W.spelers.length; j++){
          var q = W.spelers[j];
          if (!magPvp(m.van, q) || m.geraakt['s' + j]) continue;
          if (af2(q.x, q.y, m.x, m.y) < Math.pow(SPELER.r + 5, 2)){
            raakSpeler(q, m.schade, m.van);
            if (m.door > 0){ m.door--; m.geraakt['s' + j] = 1; } else { m.leven = 0; break; }
          }
        }
      }
    });
    W.pijlen = W.pijlen.filter(function(m){ return m.leven > 0; });
  }

  /* ---------- de hotzone ----------
     Hij glijdt naar de speler met het hoogste level, nooit harder dan HEET.snel,
     en nooit de stad in: het doel wordt op afstand geklemd. */
  function heetStap(dt){
    var top = null;
    W.spelers.forEach(function(p){
      if (p.uit) return;
      if (!top || p.level > top.level || (p.level === top.level && p.xp > top.xp)) top = p;
    });
    var h = W.heet;
    h.actief = !!top && top.level >= HEET.vanaf;
    if (top){
      h.doel = top.nr;
      h.lvl = Math.max(3, top.level + 2);
      var doel = heetDoel(top.x, top.y);
      var dx = doel.x - h.x, dy = doel.y - h.y, dl = Math.hypot(dx, dy);
      var stap = HEET.snel * dt;
      if (dl > stap){ h.x += dx / dl * stap; h.y += dy / dl * stap; }
      else { h.x = doel.x; h.y = doel.y; }
      /* ook onderweg nooit over de rand van de stad */
      var k = heetDoel(h.x, h.y); h.x = k.x; h.y = k.y;
    }
  }
  function heetDoel(x, y){
    var min = ZONE.veilig + HEET.r + 40;
    var dx = x - MID.x, dy = y - MID.y, d = Math.hypot(dx, dy);
    if (d < min){
      if (d < 1){ dx = 0; dy = -1; d = 1; }
      x = MID.x + dx / d * min; y = MID.y + dy / d * min;
    }
    return { x: klem(x, HEET.r, WERELD.b - HEET.r), y: klem(y, HEET.r, WERELD.h - HEET.r) };
  }
  W.heetDoel = heetDoel;
  var heetGroep = { leden: [] }, heetKlok = 0;
  function heetSpawn(dt){
    heetKlok -= dt;
    if (heetKlok > 0) return;
    heetKlok = 2;
    heetGroep.leden = heetGroep.leden.filter(function(f){ return !f.dood; });
    if (!W.heet.actief){
      /* slaapt hij, dan verdwijnen de hete vijanden */
      heetGroep.leden.forEach(function(f){ f.dood = true; f.stil = true; f.doodOp = W.tijd; });
      heetGroep.leden = [];
      return;
    }
    if (!W.spelers.some(function(p){ return !p.uit; })) return;
    if (heetGroep.leden.length >= HEET.aantal) return;
    for (var poging = 0; poging < 10; poging++){
      var h = toeval() * Math.PI * 2, d = Math.sqrt(toeval()) * (W.heet.r - 40);
      var x = W.heet.x + Math.cos(h) * d, y = W.heet.y + Math.sin(h) * d;
      var soort = FOUT[kies(HEETSOORTEN)];
      if (raakt(x, y, soort.r + 4) || gebiedVan(x, y).zone === 0) continue;
      /* niet vlak naast iemand verschijnen */
      if (W.spelers.some(function(p){ return !p.uit && af2(p.x, p.y, x, y) < 220 * 220; })) continue;
      var f = maakFout(soort, x, y, W.heet.lvl, { heet: true, groep: heetGroep });
      heetGroep.leden.push(f);
      break;
    }
  }

  /* ---------- opruimen en terugkomen ---------- */
  function onderhoud(){
    /* gevelde vijanden weg, en de kampen weer vullen als er niemand vlakbij staat */
    function opgeruimd(f){ return f.dood && (f.stil || W.tijd - (f.doodOp || 0) > 1.2); }
    W.fouten = W.fouten.filter(function(f){ return !opgeruimd(f); });
    W.kampen.forEach(function(k){
      k.leden = k.leden.filter(function(f){ return !opgeruimd(f); });
      if (!k.wacht.length) return;
      if (k.wacht[0] > W.tijd) return;
      if (W.spelers.some(function(p){ return !p.uit && af2(p.x, p.y, k.x, k.y) < 500 * 500; })) return;
      k.wacht.shift();
      var levend = k.leden.filter(function(f){ return !f.dood; }).length;
      if (levend < k.max) vulKamp(k);
    });
    W.holen.forEach(function(h){ if (!h.b && h.terugOp && W.tijd >= h.terugOp && spelersInHol(h).length === 0) maakBaas(h); });
    /* kisten komen terug, op een andere plek in hetzelfde gebied */
    W.kisten.forEach(function(k){
      if (!k.open || W.tijd < k.terugOp) return;
      var p = plekIn(GEBIED[k.g], 60, true);
      k.x = r1(p.x); k.y = r1(p.y); k.open = false; W.kistV++;
    });
    W.zakken = W.zakken.filter(function(z){ return z.tot > W.tijd; });
  }
  function zakkenStap(){
    if (!W.zakken.length) return;
    W.spelers.forEach(function(p){
      if (!actief(p) || p.leest) return;
      for (var i = W.zakken.length - 1; i >= 0; i--){
        var z = W.zakken[i];
        if (af2(z.x, z.y, p.x, p.y) > Math.pow(SPELER.rapen + 10, 2)) continue;
        var drank = Math.min(z.drank, DRANK.max - p.drank);
        p.buit += z.buit; p.runGoud += z.buit; p.drank += drank; p.mkV++;
        meld(p, { e: 'zak', goud: z.buit, drank: drank, van: z.van });
        W.zakken.splice(i, 1);
      }
    });
  }

  /* ---------- de klok ---------- */
  W.stap = function(dt){
    dt = Math.min(dt || 1 / 60, 0.05);
    W.tijd += dt; W.tik++;
    if (W.tik % 15 === 1) wekken();
    W.spelers.forEach(function(p){ spelerStap(p, dt); });
    foutenStap(dt);
    aanvallenStap(dt);
    pijlenStap(dt);
    heetStap(dt);
    heetSpawn(dt);
    zakkenStap();
    if (W.tik % 30 === 0) onderhoud();
  };

  /* ---------- het personage zoals het bewaard wordt ---------- */
  W.held = function(i){
    var p = W.spelers[i]; if (!p) return null;
    return { klasse: p.klasse, level: p.level, xp: p.xp, punten: p.punten, stats: JSON.parse(JSON.stringify(p.stats)),
             goud: p.goud, drank: p.drank, tel: JSON.parse(JSON.stringify(p.tel)) };
  };
  W.wachtVan = function(i){ var p = W.spelers[i]; return p ? JSON.parse(JSON.stringify(p.wacht)) : {}; };
  W.samenvatting = function(i){
    var p = W.spelers[i]; if (!p) return null;
    return { level: p.level, xp: p.xp, nodig: nodigVoor(p.level), runXp: p.runXp, verloren: p.verloren, goud: p.goud, runGoud: p.runGoud,
             geveld: p.tel.geveld, kisten: p.tel.kisten };
  };

  /* ---------- wat een speler mag zien ----------
     Alleen wat in zijn buurt staat. Wat zelden verandert (kisten, uitgangen,
     zijn eigen level en quests) gaat alleen mee als het anders is dan wat hij
     al had. */
  var weet = [];
  function weetVan(i){ if (!weet[i]) weet[i] = { namen: {}, kist: 0, ex: 0, mk: 0 }; return weet[i]; }
  function vergeet(i){ weet[i] = null; }
  W.vergeet = vergeet;
  function dichtbij(p, x, y, extra){
    return Math.abs(x - p.x) < KIJK.b + (extra || 0) && Math.abs(y - p.y) < KIJK.h + (extra || 0);
  }
  function bits(){ var b = 0; for (var i = 0; i < arguments.length; i++) if (arguments[i]) b |= (1 << i); return b; }
  function mijnStats(p){
    var nu = klok(), qs = {}, w = {};
    QUESTGEVERS.forEach(function(gv){
      var q = p.quests[gv];
      if (q) qs[gv] = [q.soort, q.n, q.nodig, q.tekst];
      if (p.wacht[gv] && p.wacht[gv] > nu) w[gv] = Math.ceil((p.wacht[gv] - nu) / 1000);
    });
    var ks = [], sk = [];
    Object.keys(p.kistSlot).forEach(function(id){ var s = p.kistSlot[id] - W.tijd; if (s > 0) ks.push([+id, Math.ceil(s)]); });
    Object.keys(p.steenKlok).forEach(function(id){ var s = p.steenKlok[id] - W.tijd; if (s > 0) sk.push([+id, Math.ceil(s)]); });
    return { v: p.mkV, l: p.level, x: p.xp, nx: nodigVoor(p.level), pt: p.punten,
             st: STATS.map(function(k){ return p.stats[k]; }), g: p.goud, b: p.buit, d: p.drank,
             bf: [r1(p.buffs.snel), r1(p.buffs.kracht), r1(p.buffs.taai)], q: qs, w: w, r: p.reeks,
             ks: ks, sk: sk, kp: r2(p.af.krachtPauze), bm: r2(p.af.blokMax), k: KLASSE_NR[p.klasse], sn: r1(p.af.snel),
             /* voor de pagina: hoever je zwaard en je boog reiken, voor de zwaai die je ziet */
             zb: r1(p.af.bereik), bb: r1(p.af.boogBereik), mh: p.maxHp };
  }
  W.pakketVoor = function(i){
    var p = W.spelers[i];
    if (!p) return null;
    var k = weetVan(i);
    var d = {
      t: r2(W.tijd),
      m: [r1(p.x), r1(p.y), Math.round(p.mikt * 100), Math.floor(p.hp), p.maxHp,
          bits(p.neer, p.uit || p.gered, p.blok, p.crit, p.wapen === 'boog', p.leest, p.dash > 0, p.raak > 0, p.flits > 0, p.werv > 0,
               p.gebied.zone === 2 && p.level >= PVP.vanaf),
          Math.round(Math.max(0, p.zwaai) * 100), Math.round(p.blokTijd * 10), Math.round(p.schild * 10),
          p.extract ? Math.round(p.extract.klok * 10) : 0, p.extract ? p.extract.id : 0,
          Math.round(Math.max(0, p.krKlok) * 10), Math.round(Math.max(0, p.dashKlok) * 10), p.gebied.nr,
          Math.round(Math.max(0, p.schildWacht) * 10)],
      s: [], f: [], b: [], a: [], p: [], z: [],
      h: [r1(W.heet.x), r1(W.heet.y), W.heet.r, W.heet.lvl, W.heet.actief ? 1 : 0]
    };
    if (k.mk !== p.mkV){ k.mk = p.mkV; d.mk = mijnStats(p); }
    var nieuw = null;
    for (var j = 0; j < W.spelers.length; j++){
      var q = W.spelers[j];
      if (j === i || q.uit) continue;
      var zicht = dichtbij(p, q.x, q.y);
      if (!zicht && !q.extract) continue;
      if (!k.namen[j]){ k.namen[j] = 1; (nieuw || (nieuw = [])).push([j, q.naam, q.av]); }
      d.s.push([j, r1(q.x), r1(q.y), Math.round(q.mikt * 100), Math.round(100 * q.hp / q.maxHp),
                bits(q.neer, q.blok, q.zwaai > 0, q.wapen === 'boog', q.dash > 0, !!q.extract, magPvp(p, q), q.level < PVP.vanaf, q.leest, q.werv > 0, zicht, q.flits > 0),
                KLASSE_NR[q.klasse], q.level]);
    }
    if (nieuw) d.n = nieuw;
    for (var n = 0; n < wakkerLijst.length; n++){
      var f = wakkerLijst[n];
      if (!dichtbij(p, f.x, f.y, f.baas ? 80 : 0)) continue;
      if (f.baas){
        d.b.push([f.id, f.baas.nr, r1(f.x), r1(f.y), Math.max(0, r1(f.hp)), f.maxHp, bits(f.flits > 0, f.boos, f.actief, f.dood), f.hol.id]);
        continue;
      }
      d.f.push([f.id, f.soort.nr, r1(f.x), r1(f.y), Math.max(0, Math.round(100 * f.hp / f.maxHp)),
                bits(f.flits > 0, f.heet, !!f.soort.laden && (f.laadKlok <= f.soort.mik || f.stilKlok > 0), f.terug, f.stun > 0, f.dood),
                Math.round((f.mikt || 0) * 10), f.lvl]);
    }
    W.aanvallen.forEach(function(a){
      var groot = a.soort === 'laser' || a.soort === 'golf' || a.soort === 'krimp' || a.soort === 'muur' || a.soort === 'baan';
      if (!dichtbij(p, a.x, a.y, groot ? 520 : 40)) return;
      d.a.push([AANVAL_NR[a.soort], r1(a.x), r1(a.y), Math.round(a.t * 100), Math.round((a.hoek || 0) * 100), a.richting || 1,
                Math.round((a.nu || 0) * 100), r1(a.straal || 0), a.geknald ? 1 : 0, Math.round((a.k || 1) * 100), Math.round((a.gat || 0) * 100),
                a.breed || 0, Math.round((a.boog || 0) * 100), Math.round((a.duur || 0) * 100), a.r0 || 0, a.bz === undefined ? -1 : a.bz,
                a.hol ? a.hol.id : 0, a.id]);
    });
    W.pijlen.forEach(function(m){
      if (!dichtbij(p, m.x, m.y)) return;
      d.p.push([r1(m.x), r1(m.y), Math.round(m.hoek * 100), m.soort]);
    });
    W.zakken.forEach(function(z){ if (dichtbij(p, z.x, z.y)) d.z.push([z.id, z.x, z.y]); });
    if (k.kist !== W.kistV){
      k.kist = W.kistV; d.kv = W.kistV;
      d.ki = W.kisten.map(function(c){ return [c.id, c.x, c.y, c.open ? 1 : 0]; });
    }
    if (k.ex !== W.exV){
      k.ex = W.exV; d.ev = W.exV;
      var tel = {};
      W.spelers.forEach(function(q){ if (!q.uit && q.extract) tel[q.extract.id] = (tel[q.extract.id] || 0) + 1; });
      d.ex = Object.keys(tel).map(function(id){ return [+id, tel[id]]; });
    }
    return d;
  };

  /* de wereld zelf verandert niet, dus die gaat een keer over de lijn */
  W.wereldPakket = function(){
    return { b: WERELD.b, h: WERELD.h, seed: W.seed, mid: [MID.x, MID.y], zone: [ZONE.veilig, ZONE.rustig],
             ro: W.rots.map(function(o){ return [o.x, o.y, o.r, o.s]; }),
             mu: W.muren.map(function(o){ return [o.x, o.y, o.b, o.h, o.s]; }),
             npc: W.npcs.map(function(n){ return [n.id, n.x, n.y, n.naam]; }),
             st: W.stenen.map(function(s){ return [s.id, s.x, s.y, s.soort]; }),
             ex: W.uitgangen.map(function(e){ return [e.id, e.x, e.y, e.r, e.rood]; }),
             ho: W.holen.map(function(h){ return [h.id, h.baas.nr, h.x, h.y, h.R, h.lvl]; }) };
  };

  W.WERELD = WERELD;
  W.toeval = toeval;
  return W;
}

g.STADMOTOR = { maak: maak, WERELD: WERELD, MID: MID, ZONE: ZONE, KIJK: KIJK, GEBIEDEN: GEBIEDEN, GEBIED: GEBIED, gebiedVan: gebiedVan, zoneVan: zoneVan,
                SPELER: SPELER, DASH: DASH, KLASSEN: KLASSEN, KLASSE_NR: KLASSE_NR, KRACHT: KRACHT, BLOK: BLOK, CRIT: CRIT, STATS: STATS, STAT_MAX: STAT_MAX,
                MAXLEVEL: MAXLEVEL, nodigVoor: nodigVoor, XP: XP, PVP: PVP, VERLIES: VERLIES, SCHILD: SCHILD, EXTRACT: EXTRACT, KIST: KIST, STEEN: STEEN, BUFF: BUFF,
                DRANK: DRANK, HEEL: HEEL, HERVERDEEL: HERVERDEEL, QUEST: QUEST, HEET: HEET, HOL: HOL, FOUTEN: FOUTEN, FOUT: FOUT, BAZEN: BAZEN, AANVAL: AANVAL,
                AANVALSOORTEN: AANVALSOORTEN, NPCS: NPCS, QUESTGEVERS: QUESTGEVERS };
})(typeof globalThis !== 'undefined' ? globalThis : this);
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.STADMOTOR;
