/* De motor van Torenverdediging: alles wat rekent en niets wat tekent.

   Dezelfde motor draait op twee plekken. Wie alleen speelt heeft hem in zijn
   eigen browser. Wie samen speelt heeft hem in de spelkamer op de server: die
   tikt zestien keer per seconde (een tik is zestig milliseconden, net als
   altijd), voert wat allebei bouwen uit en stuurt de stand terug (zie
   server/kamer.js). De browser tekent dan alleen nog.

   Wat hierin zit: de kaarten en de weg, de omgevingen, de torens en wat ze
   doen, de fouten en de bazen met hun streken, wat op de weg ligt, de
   vrienden, het vliegtuig, de munten, de rondes en het toeval (met een eigen
   zaad). Wat er niet in zit: vragen, tekenen, menu's, toetsen, en alles wat
   met het scherm te maken heeft. De motor praat terug via 'haken': functies
   die de pagina meegeeft (een melding onder het bord, munten die vliegen, een
   klap op de school, een omgeving die vrijkomt, het einde).

   Gebruik:
     var W = TORENMOTOR.maak({ thema:'plein', kaart:0, torens:[...], vrij:{...}, rang:2, haak:{ ... } });
     W.stap();                 een tik van zestig milliseconden
     W.voerUit({ k:'bouw', soort:'kanon', x:120, y:300 });   bouwen, versterken, weghalen, ...
     W.pakket();               de hele stand, klein genoeg om over de lijn te sturen
   Na elke stap en elke opdracht staan de lijsten (W.vijanden, W.torens, ...)
   en de getallen (W.bank, W.wachtrij, ...) klaar om te tekenen.

   Dit bestand laadt als gewoon script in de browser (TORENMOTOR op window)
   en als module op de server (module.exports). */
(function(g){
'use strict';

/* ============================================================================
   De kaarten, de omgevingen, de torens
   ============================================================================ */
var BREED = 900, HOOG = 460;
/* Vier kaarten. Het pad begint buiten het bord (x = -40) en eindigt rechts bij
   x = 812, waar de school staat; de bovenste vijftig pixels blijven vrij voor
   de levensbalk van de baas. */
var KAARTEN = [
  { naam:'Het schoolplein', eiland:'De lagune',     archipel:'De kralensnoer',  vulkaan:'De asvlakte',   pad:[[-40,90],[190,90],[190,250],[430,250],[430,110],[650,110],[650,390],[812,390]] },
  { naam:'De zaagtand',     eiland:'De rifrand',    archipel:'De scherenkust',  vulkaan:'De lavatrap',   pad:[[-40,140],[130,140],[130,330],[300,330],[300,140],[470,140],[470,330],[640,330],[640,170],[812,170]] },
  { naam:'De grote lus',    eiland:'De baai',       archipel:'De atol',         vulkaan:'De kraterrand', pad:[[-40,150],[280,150],[280,290],[130,290],[130,390],[540,390],[540,240],[812,240]] },
  { naam:'De slingerweg',   eiland:'De kokosroute', archipel:'De eilandhop',    vulkaan:'De zwavelweg',  pad:[[-40,230],[120,230],[120,100],[330,100],[330,300],[520,300],[520,130],[720,130],[720,300],[812,300]] }
];
var BOMSTRAAL = 78, BOMVAL = 0.45;
var BOMMEN = 5, BOMPAUZE = 1.4, HERLAAD = 9, VLIEGSNEL = 190;
var KRING = 36, KRINGVAART = 1.7, VLIEGHOOGTE = 26;
var VRIEND = { aantal:2, hp:19, hpNiveau:0.4, schade:4.8, tempo:0.55, snelheid:60, leiband:150, wachten:7, klap:3.4, baasklap:3 };
var SOORTEN = {
  kanon:     {naam:'Kanon',        letter:'K', kleur:'var(--crab)',        prijs:40,  bereik:110, schade:6,  tempo:0.55, onder:'Snel en dichtbij'},
  katapult:  {naam:'Katapult',     letter:'T', kleur:'var(--deep-ocean)',  prijs:70,  bereik:200, schade:20, tempo:1.5,  onder:'Ver, maar traag'},
  vertrager: {naam:'Vertrager',    letter:'V', kleur:'var(--butterscotch)',prijs:55,  bereik:120, schade:3,  tempo:1.0,  onder:'Houdt een hele groep op', vlak:true},
  pekelpot:  {naam:'Pekelpot',     letter:'P', kleur:'#2f7d52',            prijs:80,  bereik:120, schade:11, tempo:1.1,  onder:'Raakt alles in de buurt', vlak:true},
  schutter:  {naam:'Scherpschutter',letter:'S',kleur:'#7d1f12',            prijs:120, bereik:300, schade:46, tempo:2.6,  onder:'Ver, en ziet verstopte fouten'},
  dart:      {naam:'Dartwerper',   letter:'D', kleur:'#1f7a8c',            prijs:90,  bereik:170, schade:12, tempo:0.7,  onder:'Pijlen die door twee fouten gaan', dart:true},
  tonkla:    {naam:'Tonkla Toren', letter:'T',kleur:'#6b3fa0',             prijs:170, bereik:170, schade:24, tempo:0.7,
              onder:'Schokgolf om de 20 seconden', golf:70, golftijd:20, speciaal:true, slot:'tonkla'},
  aap:       {naam:'Apentoren',    letter:'A',kleur:'#8a6a45',             prijs:160, bereik:130, schade:2.7, tempo:0.15,
              onder:'Minigun vol bananen', schotkleur:'#EFC64A', speciaal:true, slot:'aap', aap:true},
  bommenwerper: {naam:'Tonkla Bommenwerper', letter:'B', kleur:'#3f6b8f', prijs:150, bereik:0,
              schade:30, tempo:0, onder:'Patrouilleert over de weg, vijf bommen per vlucht',
              bommen:true, straal:BOMSTRAAL, speciaal:true, slot:'eiland'},
  vrienden:  {naam:'Vriendenhut',  letter:'V', kleur:'#2f7d52',            prijs:110, bereik:150,
              schade:0,  tempo:0,  onder:'Vrienden houden alles tegen tot ze vallen', vrienden:true, speciaal:true, slot:'eiland'},
  schip:     {naam:'Kanonneerboot', letter:'B', kleur:'#4a6b8a',           prijs:95,  bereik:150, schade:9.6, tempo:0.4,
              onder:'Kanonnen, alleen op het water', water:true, speciaal:true, slot:'archipel'},
  onderzeeer:{naam:'Onderzeeër',   letter:'O', kleur:'#2d5f6e',           prijs:140, bereik:250, schade:29, tempo:1.8,
              onder:'Raketten met een klap eromheen, ziet verstopte fouten', water:true, raket:true, sonar:true, straal:46, speciaal:true, slot:'archipel'},
  mortier:   {naam:'Magmamortier', letter:'M', kleur:'#b3361f',            prijs:140, bereik:210, schade:16, tempo:1.9,
              onder:'Lava die op de weg blijft branden', lava:true, straal:50, speciaal:true, slot:'vulkaan'},
  zwavel:    {naam:'Zwavelblazer', letter:'Z', kleur:'#c98a1c',            prijs:95,  bereik:105, schade:1.6, tempo:0.6,
              onder:'Zet alles in de buurt in brand', vlak:true, brand:true, speciaal:true, slot:'vulkaan'}
};
var THEMAS = [
  { id:'plein', naam:'Het schoolplein', plek:'',
    onder:'Gras, een zandweg en de school aan het eind. Met de Pekelpot, de Dartwerper, de Tonkla Toren en de Apentoren.',
    torens:['kanon','katapult','vertrager','pekelpot','schutter','dart','tonkla','aap'] },
  { id:'eiland', naam:'Tropisch eiland', slot:'eiland', strand:true, plek:' op het tropisch eiland',
    onder:'Zee, palmen en een vlonder over het zand. Met de Tonkla Bommenwerper en de Vriendenhut.',
    torens:['kanon','katapult','vertrager','schutter','bommenwerper','vrienden','dart'] },
  { id:'archipel', naam:'De eilanden', slot:'archipel', strand:true, water:true, plek:' tussen de eilanden', kracht:0.75,
    onder:'Open zee met kleine eilandjes. Landtorens passen alleen op een eiland; de Kanonneerboot en de Onderzeeër liggen op het water. Vanaf ronde zestig komt de Zeeslang.',
    torens:['kanon','katapult','schutter','onderzeeer','schip','bommenwerper','dart'] },
  { id:'vulkaan', naam:'De vulkaan', slot:'vulkaan', plek:' op de vulkaan',
    onder:'As, lavabeken en een stenen weg. Met de Magmamortier en de Zwavelblazer, en in ronde vijftig de Magmakoning.',
    torens:['kanon','katapult','vertrager','schutter','mortier','zwavel','dart'] }
];
var EILANDRONDE = 50;
var MAXKEUZE = 6, MINKEUZE = 2, SAMENKEUZE = MAXKEUZE * 2;
var BOMTIJD = 8, BOMSCHADE = 44;
var TONKLAREEKS = 50, TONKLARONDE = 20;
var PADVRIJ = 34, TORENVRIJ = 42, RAND = 26;
var WEGDING = {
  pek:     { naam:'Pekvlek',      prijs:45,  straal:34, kleur:'#3b3730', onder:'vertraagt alles wat erdoor loopt' },
  angels:  { naam:'Voetangels',   prijs:60,  straal:26, kleur:'#7d7566', onder:'doet flinke schade, groeit mee, slijt na 40 treffers', schade:5, voorraad:40 },
  hek:     { naam:'Wegversperring', prijs:80, straal:20, kleur:'#8a6a45', onder:'houdt fouten even tegen, gaat 6 keer mee', voorraad:6 }
};
var MAXWEG = 5, WEGVRIJ = 70;
var DUURDER = 0.18, MAXNIVEAU = 5;
var BAASRONDE = 10, BAASSCHADE = 4, BAASBELONING = 120;
var KRACHTEN = {
  kanon:     { naam:'Dubbelloop',   uit:'schiet twee keer zo snel',            mark:'‖' },
  katapult:  { naam:'Brandbom',     uit:'de inslag raakt alles in de buurt',   mark:'▲' },
  vertrager: { naam:'Vrieskou',     uit:'vertraagt veel sterker en langer',    mark:'❄' },
  pekelpot:  { naam:'Bijtend zuur', uit:'de golf doet bijna dubbele schade',   mark:'◎' },
  schutter:  { naam:'Kopschot',     uit:'drie keer zoveel schade tegen bazen', mark:'⊕' },
  dart:      { naam:'Roos',         uit:'elke derde pijl is een roos: drie keer zoveel schade en door tot drie fouten', mark:'◉' },
  tonkla:    { naam:'Onweer',       uit:'de schokgolf laadt twee keer zo snel',mark:'↯' },
  aap:       { naam:'Bommenwerper', uit:'gooit er om de acht seconden een bom bij', mark:'⊙' },
  bommenwerper: { naam:'Trosbom',   uit:'een veel grotere inslag en meer schade', mark:'∴' },
  vrienden:  { naam:'Vriendenclub', uit:'er loopt een vriend extra mee en ze staan sneller weer op', mark:'☺' },
  schip:     { naam:'Breedzij',     uit:'schiet op drie fouten tegelijk',        mark:'☰' },
  onderzeeer:{ naam:'Torpedo',      uit:'ruim anderhalf keer zoveel schade tegen bazen', mark:'➤' },
  mortier:   { naam:'Vuurzee',      uit:'de lava ligt twee keer zo lang en is breder', mark:'♨' },
  zwavel:    { naam:'Hittegolf',    uit:'het vuur brandt twee keer zo fel',      mark:'☀' }
};
var BAZEN = [
  { id:'zwaar',  naam:'de zware baas',  taai:9.5, vlug:0.5,  schild:0,    mark:'!',      uit:'Hij incasseert enorm veel, maar loopt langzaam.' },
  { id:'snel',   naam:'de snelle baas', taai:7,   vlug:1.2,  schild:0,    mark:'»', uit:'Minder taai, maar hij staat zo bij de klas.' },
  { id:'schild', naam:'de schildbaas',  taai:7.5, vlug:0.6,  schild:0.65, mark:'●', uit:'Zijn schild slikt bijna alles, dus je hebt harde klappen nodig.' },
  { id:'splijt', naam:'de splijter',    taai:8,   vlug:0.65, schild:0,    mark:'✦', uit:'Als hij valt spat hij uiteen in vijf snelle fouten.', splijt:5 }
];
var APENBAAS = { id:'aap', naam:'de apenbaas', taai:7.5, vlug:0.62, schild:0.25, mark:'A', kleur:'#8a6a45', gooit:true,
  uit:'Hij is de taaiste van allemaal en legt je torens met bananenschillen stil.' };
var SCHILTIJD = 6, SCHILDUUR = 4, SCHILBEREIK = 380, DUBBELSCHIL = 40;
var APENKANS = [[10, 0.05], [20, 0.15], [30, 0.35], [40, 0.75], [50, 0.35], [60, 0.25]];
function apenkans(ronde){
  if (ronde <= APENKANS[0][0]) return APENKANS[0][1];
  for (var i = 1; i < APENKANS.length; i++){
    if (ronde <= APENKANS[i][0]){
      var a = APENKANS[i-1], b = APENKANS[i];
      return a[1] + (b[1] - a[1]) * (ronde - a[0]) / (b[0] - a[0]);
    }
  }
  return APENKANS[APENKANS.length - 1][1];
}
function isMegaRonde(n){ return n % 50 === 0; }
var MEGASCHADE = 6;
var MEGABAAS = { id:'mega', naam:'de Grote Fout', taai:14, vlug:0.33, schild:0.35, mega:true, mark:'✹', kleur:'#4a1230', splijt:6, gooit:true,
  uit:'Hij heeft het schild, het gooien en het uiteenvallen van alle bazen tegelijk.' };
var KRAKEN = { id:'kraken', naam:'de Kraken', taai:13.3, vlug:0.33, schild:0.35, mega:true, mark:'≋', kleur:'#2a3f6e', splijt:6, inkt:true,
  uit:'Hij spuit inkt over het pad: dan is alles om hem heen even verstopt. Hij spat uiteen als hij valt.' };
var INKTTIJD = 7, INKTDUUR = 4, INKTBEREIK = 260;
var ZEESLANGRONDE = 60, DUIKTIJD = 7, DUIKDUUR = 3.5;
var ZEESLANG = { id:'zeeslang', naam:'de Zeeslang', taai:8, vlug:0.62, schild:0.2, duikt:true, mark:'∿', kleur:'#1f7a6d',
  uit:'Hij duikt geregeld onder: dan zwemt hij harder en raken alleen de boot, de onderzeeër en de Scherpschutter hem.' };
var UITBARSTTIJD = 9, HITTEDUUR = 4, HITTEBEREIK = 180, VONKEN = 3;
var MAGMAKONING = { id:'magma', naam:'de Magmakoning', taai:16, vlug:0.33, schild:0.3, mega:true, mark:'♨', kleur:'#7a2a12', splijt:6, uitbarst:true,
  uit:'Om de zoveel tijd barst hij uit: vonken op de weg, en torens in de buurt schieten even trager. Hij spat uiteen als hij valt.' };
var ROOFTIJD = 6, KOPIEERTIJD = 8;
var ZESTIG = {
  plein:    { id:'kopieer', naam:'de Kopieermachine', taai:7, vlug:0.6, schild:0.2, mark:'≡', kleur:'#3f5f8f', kopieert:true,
              uit:'Om de zoveel tijd spuugt hij kopieën uit van fouten die al op de weg lopen.' },
  eiland:   { id:'kapitein', naam:'de Zeeroverkapitein', taai:7, vlug:0.6, schild:0.2, mark:'☠', kleur:'#3b3730', rooft:true,
              uit:'Om de zoveel tijd rooft hij een deel van je munten. Vel hem snel, anders betaal jij hem.' },
  archipel: ZEESLANG,
  vulkaan:  { id:'aswolk', naam:'de Aswolk', taai:7, vlug:0.6, schild:0.2, mark:'☁', kleur:'#4a4441', inkt:true, uitbarst:true,
              uit:'Hij hult de weg in as: alles om hem heen is even verstopt, torens in de buurt worden heet, en er springen vonken af.' }
};
var FASENSCHADE = 8;
var TACHTIG = {
  plein:    { id:'directeur', naam:'de Directeur', taai:6, vlug:0.12, schild:0.4, fasen:true, gooit:true, mark:'⚑', kleur:'#2b2560',
              uit:'Loopt tergend langzaam, slikt bijna alles en heeft drie fases. Elke fase: schild terug, hulp erbij, en een regen van bananenschillen.' },
  eiland:   { id:'neptunus', naam:'Koning Neptunus', taai:6, vlug:0.12, schild:0.4, fasen:true, inkt:true, mark:'Ψ', kleur:'#12466b',
              uit:'Tergend langzaam en heel sterk, drie fases. Elke fase: schild terug, hulp erbij, en een golf inkt over de weg.' },
  archipel: { id:'leviathan', naam:'de Leviathan', taai:6, vlug:0.12, schild:0.4, fasen:true, duikt:true, mark:'≈', kleur:'#0d3b4a',
              uit:'Tergend langzaam en heel sterk, drie fases. Elke fase: schild terug, hulp erbij, en hij duikt onder.' },
  vulkaan:  { id:'vuurdraak', naam:'de Vuurdraak', taai:6, vlug:0.12, schild:0.4, fasen:true, uitbarst:true, mark:'♦', kleur:'#8a1c0c',
              uit:'Tergend langzaam en heel sterk, drie fases. Elke fase: schild terug, hulp erbij, en een uitbarsting.' }
};
function zwaarte(ronde){
  return ronde <= 20 ? 1 + (ronde - 1) * 0.02 : ronde <= 40 ? 1.38 + (ronde - 20) * 0.016 : 1.70 + (ronde - 40) * 0.01;
}
function baasZwaarte(ronde){
  return ronde <= 20 ? 1 + (ronde - 1) * 0.015 : ronde <= 40 ? 1.285 + (ronde - 20) * 0.015 : 1.585 + (ronde - 40) * 0.008;
}
var VIJANDKRACHT = 0.85;
function isRustronde(n){ return n > BAASRONDE && n % BAASRONDE === 1; }
var RUSTTAAI = 0.7, RUSTAANTAL = 0.65;
function isBaasRonde(n){ return n % BAASRONDE === 0; }
function isMiniRonde(n){ return n % BAASRONDE === (BAASRONDE / 2); }
var MINISCHADE = 2;
var MINIBAAS = { id:'spaarpot', naam:'de spaarpot', taai:4.5, vlug:0.9, schild:0, mark:'€', kleur:'#c9971f',
  uit:'Hij draagt de munten van de klas. Vel hem en je krijgt ze allemaal.' };
function minibeloning(ronde){ return 60 + ronde * 8; }
var FOUTEN = [
  { id:'gewoon', naam:'gewone fout', vanaf:1, kans:5, mark:'?', kleur:'#c0442c', taai:1, vlug:1, schild:0 },
  { id:'snel', naam:'snelle fout', vanaf:4, kans:3, mark:'»', kleur:'#EA9836', taai:0.62, vlug:1.7, schild:0 },
  { id:'schild', naam:'fout met schild', vanaf:7, kans:3, mark:'●', kleur:'#5b6480', taai:1.15, vlug:0.85, schild:0.55 },
  { id:'zwerm', naam:'zwerm', vanaf:9, kans:2, mark:'×', kleur:'#7d1f12', taai:0.34, vlug:1.25, schild:0, aantal:3 },
  { id:'camo', naam:'verstopte fout', vanaf:11, kans:2, mark:'¿', kleur:'#5f7d55', taai:0.55, vlug:0.8, schild:0, camo:true },
  { id:'dik', naam:'dikke fout', vanaf:22, kans:1, mark:'◆', kleur:'#6b3fa0', taai:3, vlug:0.7, schild:0, dik:true }
];
function foutNaam(id){ var f = FOUTEN.filter(function(x){ return x.id === id; })[0]; return f ? f.naam : ''; }
var GOLFSOORTEN = [
  { id:'gewoon', kans:7 },
  { id:'snel',   kans:2, vanaf:6,  naam:'snelle golf',    uit:'Bijna alles loopt hard. Vertragen loont nu dubbel.', weeg:{ snel:4 } },
  { id:'schild', kans:2, vanaf:9,  naam:'schildgolf',     uit:'Veel fouten met een schild. Je hebt harde klappen nodig, geen speldenprikken.', weeg:{ schild:4 } },
  { id:'zwerm',  kans:2, vanaf:11, naam:'zwermgolf',      uit:'Zwermen: veel kleine tegelijk. Iets dat alles in de buurt raakt is goud.', weeg:{ zwerm:4 } },
  { id:'camo',   kans:2, vanaf:14, naam:'verstopte golf', uit:'Veel verstopte fouten. Scherpschutter, iets op de weg, of vrienden die ertegenaan lopen.', weeg:{ camo:4 } },
  { id:'dik',    kans:2, vanaf:24, naam:'zware golf',     uit:'Dikke fouten, drie keer zo taai. Bundel je vuur op een plek.', weeg:{ dik:3 } }
];
var GOLFVANAF = 6;
var STARTSLOTS = 5;
var HAASTMAX = 3;
var POORTAF = 48, SPAWNAF = POORTAF + 16;

/* Wie mag er op deze fout schieten? */
function ziet(toren, e){
  if (!e) return true;
  if (e.onder > 0) return !!SOORTEN[toren.soort].water || toren.soort === 'schutter';
  return !e.camo || toren.soort === 'schutter' || !!SOORTEN[toren.soort].sonar;
}
function bereikVan(t){ return SOORTEN[t.soort].bereik + (t.niveau - 1) * 18; }
function herlaadtijd(t){ return Math.max(4, HERLAAD - (t.niveau - 1) * 1.5) * (t.kracht ? 0.7 : 1); }
function afstandTotPadOp(PAD, x, y){
  var m = 1e9;
  for (var i = 1; i < PAD.length; i++){
    var ax = PAD[i-1][0], ay = PAD[i-1][1];
    var dx = PAD[i][0] - ax, dy = PAD[i][1] - ay;
    var t = (dx || dy) ? Math.max(0, Math.min(1, ((x-ax)*dx + (y-ay)*dy) / (dx*dx + dy*dy))) : 0;
    m = Math.min(m, Math.hypot(x - (ax + t*dx), y - (ay + t*dy)));
  }
  return m;
}
/* de velden van een stand over de lijn, per soort een vaste rij, zonder namen */
var VELDEN = {
  v:['id','d','hp','maxHp','snelheid','traag','ijs','onder','soort','kleur','mark','schild','schildOp','camo','dik','brand','flits','fase','fasen','baas','baassoort','mega','mini','vorm','dood'],
  t:['id','x','y','soort','niveau','kracht','loop','mikt','uit','heet','terugslag','golfKlok'],
  /* Het vliegtuig van de Bommenwerper. Waar het vliegt en welke kant het op
     kijkt moet mee over de lijn: de gast rekent de vlucht niet zelf uit, dus
     zonder deze velden tekent hij een toestel zonder plek en zonder hoek. */
  vl:['fase','laad','laadVol','x','y','hoek','bommen'],
  s:['x','y','hoek','len','leven','kleur','dik','banaan','boot'],
  ko:['x0','y0','x1','y1','t','duur','draai','bom','dart','roos','lava','raket','straal','valt'],
  go:['x','y','r','leven','kleur','dik'],
  ci:['x','y','tekst','leven','kleur'],
  w:['id','x','y','soort','voorraad','hoek'],
  vr:['x','y','d','hp','maxHp','hoek','kleur','leven','slag','stap','bommen','hutId'],
  la:['x','y','r','leven','vol'],
  sc:['x0','y0','x1','y1','t','draai','torenId'],
  pl:['x','y','vx','vy','leven','kleur']
};
function kort(v){ var tp = typeof v; return tp === 'number' ? Math.round(v * 10) / 10 : (tp === 'string' || tp === 'boolean') ? v : null; }
function inpak(lijst, velden, extra){
  return lijst.map(function(o){
    var r = velden.map(function(k){ return kort(o[k]); });
    if (extra) extra(o, r);
    return r;
  });
}
function uitpak(rijen, velden){
  return (rijen || []).map(function(r){
    var o = {};
    velden.forEach(function(k, i){ if (r[i] !== null && r[i] !== undefined) o[k] = r[i]; });
    return o;
  });
}
function plat(o, extra){
  var r = {};
  for (var k in o){
    var v = o[k], tp = typeof v;
    if (tp === 'number') r[k] = Math.round(v * 100) / 100;
    else if (tp === 'string' || tp === 'boolean') r[k] = v;
  }
  if (extra) extra(o, r);
  return r;
}

/* ============================================================================
   De wereld: een potje, met alles erin.
   ============================================================================ */
function maak(opties){
  opties = opties || {};
  var haak = opties.haak || {};
  function zeg(naam){ var f = haak[naam]; if (typeof f === 'function'){ try { return f.apply(null, Array.prototype.slice.call(arguments, 1)); } catch (e){} } }
  function melding2(t){ zeg('melding', t); }
  function laatMuntZien(n){ zeg('munt', n); }
  function botLog(soort, extra){ zeg('log', soort, extra); }

  var toevalZaad = 1;
  function zaai(z){ toevalZaad = (z >>> 0) || 1; }
  function toeval(){
    toevalZaad = (toevalZaad + 0x6D2B79F5) | 0;
    var t = toevalZaad;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  zaai(opties.seed === undefined ? Math.floor(Math.random() * 4294967296) : opties.seed);

  /* de omgeving, de kaart en de weg */
  var thema = THEMAS.filter(function(x){ return x.id === opties.thema; })[0] || THEMAS[0];
  var kaart = KAARTEN[opties.kaart] || KAARTEN[Math.floor(toeval() * KAARTEN.length)];
  var PAD = kaart.pad;
  function padlengte(){
    var l = 0;
    for (var i = 1; i < PAD.length; i++) l += Math.hypot(PAD[i][0]-PAD[i-1][0], PAD[i][1]-PAD[i-1][1]);
    return l;
  }
  var PADLENGTE = padlengte();
  var PADSTUK = null, PADVOOR = null;
  function padStukken(){
    if (PADVOOR === PAD && PADSTUK) return PADSTUK;
    PADSTUK = [];
    for (var i = 1; i < PAD.length; i++){
      var ax = PAD[i-1][0], ay = PAD[i-1][1];
      var dx = PAD[i][0] - ax, dy = PAD[i][1] - ay;
      PADSTUK.push({ ax:ax, ay:ay, dx:dx, dy:dy, q:dx*dx + dy*dy, len:Math.sqrt(dx*dx + dy*dy), hoek:Math.atan2(dy, dx) * 180 / Math.PI });
    }
    PADVOOR = PAD;
    return PADSTUK;
  }
  function positie(afstand){
    var st = padStukken(), rest = afstand;
    for (var i = 0; i < st.length; i++){
      var S = st[i];
      if (rest <= S.len) return { x:S.ax + S.dx * (rest / S.len), y:S.ay + S.dy * (rest / S.len) };
      rest -= S.len;
    }
    return { x:PAD[PAD.length-1][0], y:PAD[PAD.length-1][1] };
  }
  function afstandTotPad(x, y){ return afstandTotPadOp(PAD, x, y); }
  function padPlek(x, y){
    var m = 1e9, plek = 0, gelopen = 0;
    for (var i = 1; i < PAD.length; i++){
      var ax = PAD[i-1][0], ay = PAD[i-1][1];
      var dx = PAD[i][0] - ax, dy = PAD[i][1] - ay, len = Math.hypot(dx, dy);
      var t = (dx || dy) ? Math.max(0, Math.min(1, ((x-ax)*dx + (y-ay)*dy) / (dx*dx + dy*dy))) : 0;
      var af = Math.hypot(x - (ax + t*dx), y - (ay + t*dy));
      if (af < m){ m = af; plek = gelopen + t * len; }
      gelopen += len;
    }
    return plek;
  }
  function padHoek(x, y){
    var st = padStukken(), m = 1e18, hk = 0;
    for (var i = 0; i < st.length; i++){
      var S = st[i];
      var t = S.q ? Math.max(0, Math.min(1, ((x-S.ax)*S.dx + (y-S.ay)*S.dy) / S.q)) : 0;
      var ex = x - (S.ax + t*S.dx), ey = y - (S.ay + t*S.dy);
      var af = ex*ex + ey*ey;
      if (af < m){ m = af; hk = S.hoek; }
    }
    return hk;
  }
  var EILANDEN = null;
  function eilanden(){
    if (EILANDEN && EILANDEN.kaart === kaart) return EILANDEN.lijst;
    var lijst = [];
    var q0 = positie(POORTAF);
    lijst.push({ x:q0.x + 12, y:q0.y, rx:72, ry:62 });
    var e = PAD[PAD.length-1];
    lijst.push({ x:e[0] + 4, y:e[1] - 22, rx:108, ry:90 });
    var kant = 1;
    for (var d = 200; d < PADLENGTE - 230; d += 140){
      var q = positie(d), hk = padHoek(q.x, q.y) * Math.PI / 180;
      var gezet = false;
      for (var poging = 0; poging < 2 && !gezet; poging++){
        var k = poging ? -kant : kant;
        var cx = q.x - Math.sin(hk) * k * 88, cy = q.y + Math.cos(hk) * k * 88;
        cx = Math.max(44, Math.min(BREED - 44, cx));
        cy = Math.max(44, Math.min(HOOG - 44, cy));
        var af = afstandTotPad(cx, cy);
        if (af < 62) continue;
        if (Math.hypot(cx - (e[0] + 4), cy - (e[1] - 22)) < 150) continue;
        var rx = Math.min(58, af - 24), ry = Math.min(46, rx * 0.82);
        if (lijst.some(function(ei){ return Math.hypot(ei.x - cx, ei.y - cy) < ei.rx + rx - 6; })) continue;
        lijst.push({ x:cx, y:cy, rx:rx, ry:ry });
        gezet = true;
      }
      kant = -kant;
    }
    EILANDEN = { kaart:kaart, lijst:lijst };
    return lijst;
  }
  function opEiland(x, y, marge){
    if (!thema.water) return true;
    var m = marge === undefined ? 0.72 : marge;
    return eilanden().some(function(ei){
      var dx = (x - ei.x) / ei.rx, dy = (y - ei.y) / ei.ry;
      return dx * dx + dy * dy <= m;
    });
  }

  /* ---------- de toestand ---------- */
  var vijanden = [], torens = [], schoten = [], vrienden = [], cijfers = [], pluis = [], golven = [], kogels = [], schillen = [], lavas = [];
  var wegdingen = [], wegTeller = 0, vijandTeller = 0, torenTeller = 0;
  var wachtrij = 5, spawnKlok = 0, rondePauze = 2;
  var bank = { munten:60, leven:12, ronde:1 };
  var rondeGehaald = 0, vuur = 0, penningen = 0, slots = STARTSLOTS, gelapt = 0;
  var haast = 0, sprongOver = false, camoGezien = false, laatsteDoor = '';
  var baasKeuzes = {}, golfKeuzes = {}, baasBijWachtrij = -1, miniBijWachtrij = -1;
  var baasAlarm = 0, pols = 0, alarmMini = false, baasSpook = 1, baasBalkIn = 0, baasLaatst = null, baasBalk = null;
  var klap = 0, klapAantal = 0, poortFlits = 0, slagen = 0;
  var rang = Math.max(1, Math.min(4, +opties.rang || 2));
  /* welke bijzondere torens vrij zijn: wat er bij het begin vrij was, plus wat er in dit potje bijkomt */
  var vrij = Object.assign({ tonkla:false, aap:false, eiland:false, archipel:false, vulkaan:false }, opties.vrij || {});
  var vrijBijStart = Object.assign({}, vrij);
  function slotVrij(slot){ return !!vrij[slot]; }
  function past(id){ var so = SOORTEN[id]; return !so.water || !!thema.water; }
  function isVrij(id){ var so = SOORTEN[id]; return !so.speciaal || slotVrij(so.slot); }
  function torenVolgorde(){
    var lijst = thema.torens.slice();
    Object.keys(SOORTEN).forEach(function(id){ if (lijst.indexOf(id) < 0) lijst.push(id); });
    return lijst;
  }
  /* het menu: wat er meegegeven is, anders de volgorde van de omgeving */
  var gekozenLijst = (Array.isArray(opties.torens) ? opties.torens : torenVolgorde()).filter(function(id){ return SOORTEN[id] && past(id); });
  if (gekozenLijst.length > SAMENKEUZE) gekozenLijst = gekozenLijst.slice(0, SAMENKEUZE);
  function gekozen(){ return gekozenLijst; }
  function reeksbonus(){ return 1 + Math.min(0.5, vuur * 0.02); }

  var W = { fase:'spel', pauze:false, snel:false, tempo:1, onsterfelijk:false, stilToren:null, thema:thema, kaart:kaart, kaartIndex:KAARTEN.indexOf(kaart), PAD:PAD, PADLENGTE:PADLENGTE, seed:toevalZaad };

  /* ---------- helpers voor bouwen ---------- */
  function angelSchade(e){
    var basis = 4 + 1.6 * bank.ronde;
    return e.baas ? basis : Math.max(basis, e.maxHp * 0.12);
  }
  function magOpWeg(x, y, behalve){
    if (afstandTotPad(x, y) > 22) return false;
    for (var i = 0; i < wegdingen.length; i++){
      if (wegdingen[i] === behalve) continue;
      if (Math.hypot(wegdingen[i].x - x, wegdingen[i].y - y) < WEGVRIJ) return false;
    }
    return true;
  }
  function wegdingBij(x, y){
    for (var i = 0; i < wegdingen.length; i++){
      if (Math.hypot(wegdingen[i].x - x, wegdingen[i].y - y) <= 24) return wegdingen[i];
    }
    return null;
  }
  function maxTorens(){ return slots; }
  function prijsVan(soort){ return Math.round(SOORTEN[soort].prijs * (1 + DUURDER * torens.length)); }
  function magHier(x, y, behalve, soort){
    if (x < RAND || x > BREED - RAND || y < RAND || y > HOOG - RAND) return false;
    if (afstandTotPad(x, y) < PADVRIJ) return false;
    var e = PAD[PAD.length-1];
    if (Math.abs(x - (e[0] + 4)) < 62 && y > e[1] - 108 && y < e[1] + 22) return false;
    if (thema.water && soort){
      var land = opEiland(x, y);
      if (SOORTEN[soort].water ? land : !land) return false;
    }
    for (var i = 0; i < torens.length; i++){
      if (torens[i] === behalve) continue;
      if (Math.hypot(torens[i].x - x, torens[i].y - y) < TORENVRIJ) return false;
    }
    return true;
  }
  function torenBij(x, y){
    for (var i = 0; i < torens.length; i++){
      if (Math.hypot(torens[i].x - x, torens[i].y - y) <= 30) return torens[i];
    }
    return null;
  }
  function slotPrijs(){
    var n = slots - STARTSLOTS;
    return Math.round(60 * Math.pow(1.25, Math.min(n, 12)) * (1 + 0.12 * Math.max(0, n - 12)) / 5) * 5;
  }
  function magSlot(){ return W.fase === 'spel' && !W.pauze && bank.munten >= slotPrijs(); }
  function koopSlotNu(){
    if (!magSlot()) return false;
    var prijs = slotPrijs();
    bank.munten -= prijs; slots++;
    laatMuntZien(-prijs);
    return true;
  }
  function haastKeer(){ return Math.pow(2, Math.min(HAASTMAX, haast)); }
  function haastExtra(){ return 0.10 * Math.min(HAASTMAX + 1, haast + 1); }
  function inPauzeTussenRondes(){ return W.fase === 'spel' && !W.pauze && wachtrij === 0 && vijanden.length === 0 && rondePauze > 0; }
  function magErbijRoepen(){ return W.fase === 'spel' && !W.pauze && wachtrij > 0 && baasBijWachtrij < 0 && miniBijWachtrij < 0; }
  function rondeNu(){
    if (inPauzeTussenRondes()){
      var bonus = Math.max(5, Math.round(rondePauze * 8)) * haastKeer();
      bank.munten += bonus;
      laatMuntZien(bonus);
      sprongOver = true;
      rondePauze = 0.01;
      melding2('Je roept de volgende ronde erbij: ' + bonus + ' munten, maar er komen ' +
        Math.round(haastExtra() * 100) + ' procent meer fouten. Sla je de volgende pauze ook ' +
        'over, dan verdubbelt het allebei.');
      return true;
    }
    if (!magErbijRoepen()) return false;
    haast = Math.min(HAASTMAX + 1, haast + 1);
    var bonus2 = Math.max(5, Math.round(24 * haastKeer()));
    bank.munten += bonus2;
    laatMuntZien(bonus2);
    var voor = wachtrij;
    rondeErbij(true);
    melding2('Ronde ' + bank.ronde + ' komt er nu bij: ' + (wachtrij - voor) +
      ' fouten extra boven op de ' + voor + ' die er nog aankomen, en ' + bonus2 + ' munten.');
    return true;
  }

  /* ---------- de bazen en de rondes ---------- */
  function baasVan(ronde){
    if (!baasKeuzes[ronde]){
      baasKeuzes[ronde] = isMegaRonde(ronde)
        ? (thema.id === 'vulkaan' ? MAGMAKONING : thema.strand ? KRAKEN : MEGABAAS)
        : ronde % 100 === 60 ? (ZESTIG[thema.id] || ZEESLANG)
        : ronde % 100 === 80 ? (TACHTIG[thema.id] || TACHTIG.plein)
          : (thema.id !== 'archipel' && toeval() < apenkans(ronde))
            ? APENBAAS
            : BAZEN[(Math.floor(ronde / BAASRONDE) - 1) % BAZEN.length];
    }
    return baasKeuzes[ronde];
  }
  function faseWissel(e){
    var q = positie(e.d);
    e.schildOp = e.schild > 0;
    e.schildTot = e.hp - e.maxHp / 6;
    e.snelheid *= 1.35;
    if (e.gooit) e.schilKlok = 0.3;
    if (e.inkt) e.inktKlok = 0.3;
    if (e.uitbarst) e.uitbarstKlok = 0.3;
    if (e.duikt){ e.duikKlok = 0.3; }
    for (var z = 0; z < 4; z++){
      var shp = Math.max(1, Math.round(e.basisHp * 0.6));
      vijanden.push({ id:++vijandTeller, d:Math.max(0, e.d - 18 - z * 16), hp:shp, maxHp:shp, snelheid:e.basisSnel * 1.3,
                      traag:0, mark:'»', soort:'snel', kleur:'#EA9836', schild:0 });
    }
    golven.push({ x:q.x, y:q.y, r:150, leven:0.7, kleur:e.kleur || '#4a1230', dik:true });
    cijfers.push({ x:q.x, y:q.y - 46, tekst:'fase ' + e.fase, leven:1.2, kleur:'#EA9836' });
    melding2((e.baasnaam || 'De baas').replace(/^de /, 'De ') + ' gaat fase ' + e.fase + ' in: schild terug, hulp erbij, en hij loopt sneller.');
  }
  function golfVan(ronde){
    if (golfKeuzes[ronde] !== undefined) return golfKeuzes[ronde];
    var g2 = GOLFSOORTEN[0];
    if (ronde >= GOLFVANAF && !isRustronde(ronde) && !isBaasRonde(ronde)){
      var mag = GOLFSOORTEN.filter(function(x){ return !x.vanaf || x.vanaf <= ronde; });
      var totaal = mag.reduce(function(a, x){ return a + x.kans; }, 0);
      var trek = toeval() * totaal;
      for (var i = 0; i < mag.length; i++){ trek -= mag[i].kans; if (trek <= 0){ g2 = mag[i]; break; } }
    }
    golfKeuzes[ronde] = g2;
    return g2;
  }
  function kiesFout(ronde){
    var mag = FOUTEN.filter(function(f){ return f.vanaf <= ronde; });
    var golf = golfVan(ronde);
    var gewicht = function(f){ return f.kans * ((golf.weeg && golf.weeg[f.id]) || 1); };
    var totaal = mag.reduce(function(a, f){ return a + gewicht(f); }, 0);
    var trek = toeval() * totaal;
    for (var i = 0; i < mag.length; i++){ trek -= gewicht(mag[i]); if (trek <= 0) return mag[i]; }
    return mag[0];
  }
  function rondeErbij(nieuweRonde){
    bank.ronde++;
    var erbij = 4 + bank.ronde + Math.floor(Math.max(0, bank.ronde - 50) / 2);
    var toeslag = haast > 0 ? Math.round(erbij * 0.10 * Math.min(HAASTMAX + 1, haast)) : 0;
    erbij += toeslag;
    if (isRustronde(bank.ronde)) erbij = Math.max(3, Math.round(erbij * RUSTAANTAL));
    wachtrij += erbij;
    baasBijWachtrij = isBaasRonde(bank.ronde) ? Math.floor(toeval() * Math.max(1, Math.floor(wachtrij / 2))) : baasBijWachtrij;
    miniBijWachtrij = isMiniRonde(bank.ronde) ? Math.floor(toeval() * Math.max(1, Math.floor(wachtrij / 2))) : miniBijWachtrij;
    if (!nieuweRonde) return;
    botLog('ronde');
    if (isRustronde(bank.ronde)){
      melding2('Ronde ' + bank.ronde + '. Rustronde: minder en zwakkere fouten. Bouw bij.');
    } else if (isBaasRonde(bank.ronde)){
      melding2('Ronde ' + bank.ronde + '. De baas loopt ergens in de tweede helft mee.');
    } else if (isMiniRonde(bank.ronde)){
      melding2('Ronde ' + bank.ronde + '. Er loopt een spaarpot mee. Vel hem en je krijgt ' +
        minibeloning(bank.ronde) + ' munten; laat je hem door, dan kost hij twee levens.');
    } else if (golfVan(bank.ronde).naam){
      var gk = golfVan(bank.ronde);
      melding2('Ronde ' + bank.ronde + '. ' + gk.naam.charAt(0).toUpperCase() + gk.naam.slice(1) + ': ' + gk.uit);
    }
  }

  /* ---------- een fout raken ---------- */
  function raakVijand(e, schade, vertragen, stil){
    if (!e || e.dood) return;
    if (e.schildOp && e.schild > 0){
      schade = schade * (1 - e.schild);
      if (e.hp - schade < (e.schildTot !== undefined ? e.schildTot : e.maxHp * 0.5)){
        e.schildOp = false;
        cijfers.push({ x:positie(e.d).x, y:positie(e.d).y - 32, tekst:'schild stuk', leven:0.8, kleur:'#EA9836' });
      }
    }
    e.hp -= schade;
    if (!stil) e.flits = 0.22;
    if (vertragen) e.traag = 1.4;
    if (e.fasen && e.hp > 0){
      var fase = e.hp > e.maxHp * 2 / 3 ? 1 : e.hp > e.maxHp / 3 ? 2 : 3;
      if (fase > (e.fase || 1)){ e.fase = fase; faseWissel(e); }
    }
    var q = positie(e.d);
    if (!stil) cijfers.push({ x:q.x, y:q.y - 18, tekst:'-' + Math.round(schade), leven:0.7, kleur:e.baas ? '#EA9836' : '#fff' });
    if (e.hp <= 0){
      e.dood = true;
      for (var k = 0; k < (e.baas ? 14 : 6); k++){
        var h = toeval() * Math.PI * 2, v = 40 + toeval() * 70;
        pluis.push({ x:q.x, y:q.y, vx:Math.cos(h)*v, vy:Math.sin(h)*v, leven:0.5, kleur:e.baas ? '#7d1f12' : '#c0442c' });
      }
      if (e.baas && e.mini){
        var buit = minibeloning(bank.ronde);
        bank.munten += buit;
        laatMuntZien(buit);
        for (var m2 = 0; m2 < 12; m2++){
          var hm = toeval() * Math.PI * 2, vm = 50 + toeval() * 80;
          pluis.push({ x:q.x, y:q.y, vx:Math.cos(hm)*vm, vy:Math.sin(hm)*vm, leven:0.6, kleur:'#EFC64A' });
        }
        cijfers.push({ x:q.x, y:q.y - 40, tekst:'+' + buit, leven:1.1, kleur:'#c9971f' });
        melding2('De spaarpot is gebroken. ' + buit + ' munten voor de klas.');
      } else if (e.baas){
        var beloning = BAASBELONING + bank.ronde * 5;
        if (e.mega) beloning += 800;
        if (e.fasen) beloning += 1200;
        botLog('geveld', { naam:e.baasnaam });
        bank.munten += beloning;
        laatMuntZien(beloning);
        penningen += (e.mega || e.fasen) ? 3 : 1;
        var heel = Math.min(e.mega ? 12 : 2, 12 - bank.leven);
        if (heel > 0) bank.leven += heel;
        var levenUit = heel > 0 ? (heel === 1 ? ', een leven terug' : ', ' + heel + ' levens terug') : '';
        var eersteAap = e.baassoort === 'aap' && !vrij.aap;
        if (eersteAap){ vrij.aap = true; zeg('vrij', 'aap'); }
        var opent = '';
        if (e.baassoort === 'kraken' && !vrij.archipel){
          vrij.archipel = true; zeg('vrij', 'archipel');
          opent = ' De eilanden staan open: kies ze bij de volgende partij.';
        }
        if (e.baassoort === 'zeeslang' && !vrij.vulkaan){
          vrij.vulkaan = true; zeg('vrij', 'vulkaan');
          opent = ' De vulkaan staat open: kies hem bij de volgende partij.';
        }
        melding2(e.mega
          ? (e.baasnaam || 'de baas').replace(/^de /, 'De ') + ' is geveld. Ronde ' + bank.ronde + ' gehaald: ' + beloning +
            ' munten, drie penningen' + (heel > 0 ? ', de school is weer heel' : '') +
            '. Hij spat nog uiteen in ' + e.splijt + ' snelle fouten, dus maak af.' + opent
          : eersteAap
            ? 'Apenbaas geveld. ' + beloning + ' munten, een penning' + levenUit + ', en de Apentoren is vrij.'
            : (e.baasnaam || 'de baas').replace(/^de /, 'De ') + ' geveld. ' + beloning + ' munten, een penning' + levenUit +
              '.' + (opent || ' Tik een toren aan.'));
        if (e.splijt){
          for (var z = 0; z < e.splijt; z++){
            var shp = Math.max(1, Math.round(e.basisHp * 0.5));
            vijanden.push({ id:++vijandTeller, d:Math.max(0, e.d - z * 16), hp:shp, maxHp:shp,
                            snelheid:e.basisSnel * 1.5, traag:0, mark:'»', soort:'snel', kleur:'#EA9836', schild:0 });
          }
          if (!e.mega) melding2('De splijter valt uiteen in ' + e.splijt + ' snelle fouten.');
        }
      }
    }
  }

  /* ---------- een opdracht: bouwen, versterken, weghalen, ... ----------
     Dezelfde regels als op het bord zelf. 'munt' zijn de munten van een goed
     antwoord, met 'goed' voor het vuur (de schadebonus van goed op rij). */
  function voerUit(d){
    if (!d) return false;
    var t = d.id !== undefined ? torens.filter(function(x){ return x.id === d.id; })[0] : null;
    var x = +d.x, y = +d.y, okXY = isFinite(x) && isFinite(y);
    var ok = true;
    if (d.k === 'munt'){ var w = Math.max(0, Math.min(500, d.w | 0)); bank.munten += w; if (w) laatMuntZien(w); if (typeof d.goed === 'boolean') vuur = d.goed ? vuur + 1 : Math.floor(vuur / 2); }
    else if (d.k === 'bouw' && okXY){
      var so = SOORTEN[d.soort];
      if (!so || !past(d.soort) || (gekozen().indexOf(d.soort) < 0 && !so.speciaal)) ok = false;
      else if (so.slot === 'tonkla' && bank.ronde < TONKLARONDE) ok = false;
      else if (so.speciaal && !isVrij(d.soort)) ok = false;
      else {
        var prijs = prijsVan(d.soort);
        if (bank.munten < prijs || torens.length >= maxTorens() || !magHier(x, y, null, d.soort)) ok = false;
        else { bank.munten -= prijs; laatMuntZien(-prijs); torens.push({ x:x, y:y, soort:d.soort, niveau:1, klok:0, id:++torenTeller }); }
      }
    }
    else if (d.k === 'sterker' && t){
      if (t.niveau >= MAXNIVEAU) ok = false;
      else {
        var kosten = Math.round(SOORTEN[t.soort].prijs * 0.8 * t.niveau);
        if (bank.munten < kosten) ok = false;
        else { bank.munten -= kosten; laatMuntZien(-kosten); t.niveau++; }
      }
    }
    else if (d.k === 'weg' && t){
      var terug = Math.round(SOORTEN[t.soort].prijs * 0.5 * t.niveau);
      bank.munten += terug; laatMuntZien(terug);
      torens = torens.filter(function(q){ return q !== t; });
    }
    else if (d.k === 'zet' && t && okXY){ if (magHier(x, y, t, t.soort)){ t.x = x; t.y = y; } else ok = false; }
    else if (d.k === 'kracht' && t){ if (penningen > 0 && !t.kracht){ penningen--; t.kracht = true; } else ok = false; }
    else if (d.k === 'wegding' && okXY){
      var w2 = WEGDING[d.soort];
      if (!w2 || wegdingen.length >= MAXWEG || bank.munten < w2.prijs || !magOpWeg(x, y, null)) ok = false;
      else { bank.munten -= w2.prijs; laatMuntZien(-w2.prijs); wegdingen.push({ x:x, y:y, soort:d.soort, id:++wegTeller, voorraad:w2.voorraad || 0, klok:0, hoek:padHoek(x, y) }); }
    }
    else if (d.k === 'dingweg'){
      var ding = wegdingen.filter(function(q){ return q.id === d.id; })[0];
      if (ding){ var t2 = Math.round(WEGDING[ding.soort].prijs * 0.5); bank.munten += t2; laatMuntZien(t2); wegdingen = wegdingen.filter(function(q){ return q !== ding; }); }
      else ok = false;
    }
    else if (d.k === 'slot'){ ok = koopSlotNu(); }
    else if (d.k === 'ronde'){ ok = rondeNu(); }
    else if (d.k === 'vrij'){ if (d.slot && vrij[d.slot] !== undefined && !vrij[d.slot]){ vrij[d.slot] = true; } else ok = false; }
    else if (d.k === 'extra'){ wachtrij += Math.max(0, Math.min(20, d.n | 0)); }   /* fouten van klasgenoten (de Klasstrijd) */
    else if (d.k === 'pz'){ W.pauze = !!d.aan; }
    else if (d.k === 'snel'){ W.snel = !!d.aan; }
    else if (d.k === 'test'){
      /* het testpaneel: munten, penningen, een ronde springen, alles vrij */
      if (d.munten) bank.munten += d.munten | 0;
      if (d.penning) penningen += d.penning | 0;
      if (d.onsterfelijk !== undefined) W.onsterfelijk = !!d.onsterfelijk;
      if (d.alles) Object.keys(vrij).forEach(function(k){ vrij[k] = true; });
      if (d.ronde){ var doel = Math.max(1, Math.min(999, d.ronde | 0)); vijanden = []; wachtrij = 0; rondePauze = 3; baasBijWachtrij = -1; miniBijWachtrij = -1; bank.ronde = doel - 1; rondeGehaald = Math.max(rondeGehaald, doel - 1); }
    }
    else ok = false;
    uit();
    return ok;
  }

  /* ---------- een tik van de klok ---------- */
  function tik(){
    var dt = 0.06, ronde = bank.ronde;
    pols += dt;
    if (poortFlits > 0) poortFlits = Math.max(0, poortFlits - dt);
    var levendeBaas = null;
    for (var bb = 0; bb < vijanden.length; bb++){
      if (vijanden[bb].baas && !vijanden[bb].dood){ levendeBaas = vijanden[bb]; break; }
    }
    if (levendeBaas){
      if (levendeBaas !== baasLaatst){ baasLaatst = levendeBaas; baasSpook = 1; }
      var nu2 = Math.max(0, levendeBaas.hp / levendeBaas.maxHp);
      baasSpook = nu2 > baasSpook ? nu2 : Math.max(nu2, baasSpook - 0.4 * dt);
      baasBalkIn = Math.min(1, baasBalkIn + dt * 4);
      baasBalk = { naam:levendeBaas.baasnaam || 'de baas', mark:levendeBaas.mark,
                   kleur:levendeBaas.kleur || '#7d1f12', deel:nu2, hp:Math.max(0, levendeBaas.hp),
                   maxHp:levendeBaas.maxHp, schild:!!levendeBaas.schildOp,
                   flits:(levendeBaas.flits || 0) > 0 };
    } else {
      baasLaatst = null;
      baasSpook = Math.max(0, baasSpook - 1.6 * dt);
      if (baasBalk){ baasBalk.deel = 0; baasBalk.hp = 0; baasBalk.flits = false; }
      baasBalkIn = Math.max(0, baasBalkIn - dt * 1.6);
    }
    var komtBaas = isBaasRonde(bank.ronde + 1), komtMini = isMiniRonde(bank.ronde + 1);
    alarmMini = !komtBaas && komtMini;
    baasAlarm = (wachtrij === 0 && vijanden.length === 0 && (komtBaas || komtMini)) ? rondePauze : 0;
    if (wachtrij === 0 && vijanden.length === 0){
      rondePauze -= dt;
      if (rondeGehaald < bank.ronde){
        rondeGehaald = bank.ronde;
        if (rondeGehaald >= EILANDRONDE && !vrij.eiland){
          vrij.eiland = true; zeg('vrij', 'eiland');
          melding2('Je hebt ronde ' + EILANDRONDE + ' overleefd. Het tropisch eiland staat open: ' +
            'kies het bij de volgende partij en speel met de Bommenwerper en de Vriendenhut.');
        }
      }
      if (rondePauze <= 0){
        haast = sprongOver ? haast + 1 : 0;
        sprongOver = false;
        wachtrij = 0; spawnKlok = 0;
        baasBijWachtrij = -1; miniBijWachtrij = -1;
        rondeErbij(true);
      }
    }
    if (wachtrij > 0){
      spawnKlok -= dt;
      if (spawnKlok <= 0){
        var basis = Math.max(0.4, 1.1 - ronde * 0.04);
        spawnKlok = (wachtrij % 5 === 0) ? basis * 1.6 : basis * 0.35;
        wachtrij--;
        poortFlits = 0.45;
        var r = rang;
        var hp = Math.max(1, Math.round((10 + ronde * 6) * (0.75 + r * 0.15) * zwaarte(ronde) *
                          VIJANDKRACHT * (thema.kracht || 1) * (isRustronde(ronde) ? RUSTTAAI : 1)));
        var basisSnel = (30 + r*5 + ronde*2.3) * (ronde <= 20 ? 1 : ronde <= 60 ? 1.1 : 1.18);
        if (wachtrij === baasBijWachtrij && isBaasRonde(ronde)){
          baasBijWachtrij = -1;
          var bz = baasVan(ronde);
          var bhp = Math.round(hp / zwaarte(ronde) * baasZwaarte(ronde) * bz.taai);
          vijanden.push({ id:++vijandTeller, d:SPAWNAF, hp:bhp, maxHp:bhp, snelheid:basisSnel * bz.vlug,
                          traag:0, mark:bz.mark, baas:true, soort:'baas', baassoort:bz.id,
                          baasnaam:bz.naam, kleur:bz.kleur,
                          schild:bz.schild, schildOp:bz.schild > 0, splijt:bz.splijt || 0,
                          basisHp:hp, basisSnel:basisSnel,
                          mega:!!bz.mega, gooit:!!bz.gooit,
                          inkt:!!bz.inkt, inktKlok:bz.inkt ? 4 : 0,
                          duikt:!!bz.duikt, duikKlok:bz.duikt ? 5 : 0, onder:0,
                          uitbarst:!!bz.uitbarst, uitbarstKlok:bz.uitbarst ? 6 : 0,
                          kopieert:!!bz.kopieert, kopieKlok:bz.kopieert ? 5 : 0,
                          rooft:!!bz.rooft, roofKlok:bz.rooft ? 4 : 0,
                          fasen:!!bz.fasen, fase:1, vorm:bz.vorm || null,
                          schilKlok:bz.gooit ? 3 : 0 });
          botLog('baas', { naam:bz.naam, hp:bhp });
        } else if (wachtrij === miniBijWachtrij && isMiniRonde(ronde)){
          miniBijWachtrij = -1;
          var mhp = Math.round(hp * MINIBAAS.taai);
          vijanden.push({ id:++vijandTeller, d:SPAWNAF, hp:mhp, maxHp:mhp, snelheid:basisSnel * MINIBAAS.vlug,
                          traag:0, mark:MINIBAAS.mark, baas:true, mini:true, soort:'baas',
                          baassoort:MINIBAAS.id, baasnaam:MINIBAAS.naam, kleur:MINIBAAS.kleur,
                          schild:0, schildOp:false, splijt:0, basisHp:hp, basisSnel:basisSnel, schilKlok:0 });
        } else {
          var f = kiesFout(ronde), hoeveel = f.aantal || 1;
          if (f.camo && !camoGezien){
            camoGezien = true;
            melding2('Er loopt een verstopte fout mee. Ontmasker hem met de Scherpschutter of met iets op de weg, daarna mag de rest er ook op schieten.');
          }
          for (var z = 0; z < hoeveel; z++){
            var thp = Math.max(1, Math.round(hp * f.taai));
            vijanden.push({ id:++vijandTeller, d:SPAWNAF + z * 15, hp:thp, maxHp:thp, snelheid:basisSnel * f.vlug,
                            traag:0, mark:f.mark, soort:f.id, kleur:f.kleur,
                            schild:f.schild, schildOp:f.schild > 0, camo:!!f.camo, dik:!!f.dik });
          }
        }
        if (wachtrij === 0) rondePauze = isBaasRonde(bank.ronde + 1) ? 8 : isBaasRonde(bank.ronde) ? 6 : isMiniRonde(bank.ronde + 1) ? 5 : 3;
      }
    }
    var verlies = 0;
    vijanden.forEach(function(e){
      if (e.brand > 0){ e.brand -= dt; raakVijand(e, (e.brandKracht || 0) * dt, false, true); }
      if (e.dood) return;
      if (e.stop > 0){ e.stop -= dt; if (e.traag > 0) e.traag -= dt; return; }
      e.d += e.snelheid * (e.traag > 0 ? (e.ijs ? 0.22 : 0.45) : 1) * (e.onder > 0 ? 1.3 : 1) * dt;
      if (e.traag > 0){ e.traag -= dt; if (e.traag <= 0) e.ijs = false; }
      if (e.d >= PADLENGTE){ e.dood = true;
        if (e.baas) botLog('door', { naam:e.baasnaam, mini:!!e.mini });
        laatsteDoor = e.baas ? (e.baasnaam || 'de baas') : ('een ' + (foutNaam(e.soort) || 'fout'));
        verlies += e.baas ? (e.mini ? MINISCHADE : e.fasen ? FASENSCHADE : e.mega ? MEGASCHADE : BAASSCHADE) : 1; }
    });
    lavas.forEach(function(l){
      l.leven -= dt;
      vijanden.forEach(function(e){
        if (e.dood) return;
        var q = positie(e.d);
        if (Math.hypot(q.x - l.x, q.y - l.y) > l.r) return;
        raakVijand(e, l.schade * dt, false, true);
        if (!(e.brand > 0)){ e.brand = 1.2; e.brandKracht = Math.max(e.brandKracht || 0, l.schade * 0.4); }
      });
    });
    lavas = lavas.filter(function(l){ return l.leven > 0; });
    vijanden.forEach(function(e){
      if (e.dood || !e.kopieert) return;
      e.kopieKlok -= dt;
      if (e.kopieKlok > 0) return;
      e.kopieKlok = KOPIEERTIJD;
      var bron = vijanden.filter(function(a){ return !a.dood && !a.baas; });
      if (!bron.length) return;
      for (var kp = 0; kp < 2; kp++){
        var o = bron[Math.floor(toeval() * bron.length)];
        vijanden.push({ id:++vijandTeller, d:Math.max(0, e.d - 20 - kp * 16), hp:o.maxHp, maxHp:o.maxHp, snelheid:o.snelheid, traag:0,
                        mark:o.mark, soort:o.soort, kleur:o.kleur, schild:o.schild, schildOp:o.schild > 0, camo:!!o.camo, dik:!!o.dik });
      }
      var qk = positie(e.d);
      golven.push({ x:qk.x, y:qk.y, r:60, leven:0.4, kleur:'#3f5f8f' });
      melding2('De Kopieermachine spuugt twee kopieën uit.');
    });
    vijanden.forEach(function(e){
      if (e.dood || !e.rooft) return;
      e.roofKlok -= dt;
      if (e.roofKlok > 0) return;
      e.roofKlok = ROOFTIJD;
      var buit = Math.min(bank.munten, Math.max(15, Math.round(bank.munten * 0.06)));
      if (buit <= 0) return;
      bank.munten -= buit;
      laatMuntZien(-buit);
      var qr = positie(e.d);
      cijfers.push({ x:qr.x, y:qr.y - 40, tekst:'-' + buit + ' munten', leven:1.1, kleur:'#c9971f' });
      melding2('De Zeeroverkapitein rooft ' + buit + ' munten. Vel hem voordat hij je kas leegt.');
    });
    vijanden.forEach(function(e){
      if (e.dood || !e.duikt) return;
      e.duikKlok -= dt;
      if (e.onder > 0) e.onder = Math.max(0.001, e.onder);
      if (e.duikKlok > 0) return;
      if (e.onder > 0){
        e.onder = 0; e.duikKlok = DUIKTIJD;
      } else {
        e.onder = DUIKDUUR; e.duikKlok = DUIKDUUR;
        var qz = positie(e.d);
        golven.push({ x:qz.x, y:qz.y, r:70, leven:0.5, kleur:'#3f9fbd' });
        melding2((e.baasnaam || 'De baas').replace(/^de /, 'De ') + ' duikt onder. Alleen de Kanonneerboot, de Onderzeeër en de Scherpschutter raken hem nu.');
      }
    });
    vijanden.forEach(function(e){
      if (e.dood || !e.uitbarst) return;
      e.uitbarstKlok -= dt;
      if (e.uitbarstKlok > 0) return;
      e.uitbarstKlok = UITBARSTTIJD;
      var qm = positie(e.d), heet = 0;
      for (var vk = 0; vk < VONKEN; vk++){
        var vhp = Math.max(1, Math.round(e.basisHp * 0.4));
        vijanden.push({ id:++vijandTeller, d:Math.max(0, e.d - 14 - vk * 14), hp:vhp, maxHp:vhp, snelheid:e.basisSnel * 1.6,
                        traag:0, mark:'✦', soort:'snel', kleur:'#ff7a1a', schild:0 });
      }
      torens.forEach(function(t){
        if (Math.hypot(t.x - qm.x, t.y - qm.y) <= HITTEBEREIK){ t.heet = HITTEDUUR; heet++; }
      });
      golven.push({ x:qm.x, y:qm.y, r:HITTEBEREIK, leven:0.6, kleur:'#ff6a1a', dik:true });
      for (var ip2 = 0; ip2 < 16; ip2++){
        var hi2 = toeval() * Math.PI * 2, vi2 = 50 + toeval() * 110;
        pluis.push({ x:qm.x, y:qm.y, vx:Math.cos(hi2)*vi2, vy:Math.sin(hi2)*vi2 - 60, leven:0.55, kleur:'#ff8c3a' });
      }
      melding2((e.baasnaam || 'De baas').replace(/^de /, 'De ') + ' barst uit: ' + VONKEN + ' vonken op de weg' +
        (heet ? ', en ' + heet + (heet === 1 ? ' toren schiet' : ' torens schieten') + ' even trager van de hitte.' : '.'));
    });
    vijanden.forEach(function(e){
      if (e.dood || !e.gooit) return;
      e.schilKlok -= dt;
      if (e.schilKlok > 0) return;
      var q = positie(e.d), mik = null, kortst = SCHILBEREIK;
      torens.forEach(function(t){
        if ((t.uit || 0) > 0) return;
        var afst = Math.hypot(t.x - q.x, t.y - q.y);
        if (afst < kortst){ kortst = afst; mik = t; }
      });
      if (!mik){ e.schilKlok = 1; return; }
      e.schilKlok = SCHILTIJD;
      var doelen = [mik];
      if (bank.ronde >= DUBBELSCHIL){
        var tweede = null, k2 = SCHILBEREIK;
        torens.forEach(function(t){
          if (t === mik || (t.uit || 0) > 0) return;
          var a2 = Math.hypot(t.x - q.x, t.y - q.y);
          if (a2 < k2){ k2 = a2; tweede = t; }
        });
        if (tweede) doelen.push(tweede);
      }
      doelen.forEach(function(t){
        schillen.push({ x0:q.x, y0:q.y, x1:t.x, y1:t.y, t:0, duur:0.55, toren:t, draai:toeval() * 360 });
      });
    });
    vijanden.forEach(function(e){
      if (e.dood || !e.inkt) return;
      e.inktKlok -= dt;
      if (e.inktKlok > 0) return;
      e.inktKlok = INKTTIJD;
      var q = positie(e.d), geraaktI = 0;
      vijanden.forEach(function(a){
        if (a.dood || a.baas || a.camo) return;
        var qa = positie(a.d);
        if (Math.hypot(qa.x - q.x, qa.y - q.y) > INKTBEREIK) return;
        a.camo = true; a.inktOp = INKTDUUR; geraaktI++;
      });
      golven.push({ x:q.x, y:q.y, r:INKTBEREIK, leven:0.7, kleur:'#2a1f4a', dik:true });
      for (var ip = 0; ip < 18; ip++){
        var hi = toeval() * Math.PI * 2, vi = 60 + toeval() * 120;
        pluis.push({ x:q.x, y:q.y, vx:Math.cos(hi)*vi, vy:Math.sin(hi)*vi, leven:0.5, kleur:'#2a1f4a' });
      }
      if (geraaktI) melding2((e.baasnaam || 'De baas').replace(/^de /, 'De ') + (e.baassoort === 'kraken' || e.baassoort === 'neptunus' ? ' spuit inkt: ' : ' blaast as: ') + geraaktI + (geraaktI === 1 ? ' fout is' : ' fouten zijn') +
        ' even verstopt. Alleen de Scherpschutter, de vrienden en wat op de weg ligt zien ze nog.');
    });
    vijanden.forEach(function(e){
      if (!(e.inktOp > 0)) return;
      e.inktOp -= dt;
      if (e.inktOp <= 0) e.camo = false;
    });
    torens.forEach(function(t){ if ((t.uit || 0) > 0) t.uit -= dt; if ((t.heet || 0) > 0) t.heet -= dt; });
    schillen.forEach(function(sl){
      sl.t += dt / sl.duur;
      sl.draai += 260 * dt;
      if (sl.t >= 1 && !sl.raak){
        sl.raak = true;
        if (torens.indexOf(sl.toren) >= 0){
          sl.toren.uit = SCHILDUUR;
          melding2(SOORTEN[sl.toren.soort].naam + ' glijdt uit over een bananenschil: ' + SCHILDUUR + ' seconden uit de running.');
          for (var sp = 0; sp < 5; sp++){
            var sh = toeval() * Math.PI * 2, sv = 25 + toeval() * 40;
            pluis.push({ x:sl.x1, y:sl.y1, vx:Math.cos(sh)*sv, vy:Math.sin(sh)*sv, leven:0.4, kleur:'#EFC64A' });
          }
        }
      }
    });
    schillen = schillen.filter(function(sl){ return sl.t < 1.2; });
    wegdingen.forEach(function(d){
      var w = WEGDING[d.soort];
      d.klok -= dt;
      vijanden.forEach(function(e){
        if (e.dood) return;
        var q = positie(e.d);
        if (Math.hypot(q.x - d.x, q.y - d.y) > w.straal) return;
        if (e.camo){
          e.camo = false;
          cijfers.push({ x:q.x, y:q.y - 32, tekst:'ontdekt', leven:0.9, kleur:'#2f7d52' });
        }
        if (d.soort === 'pek'){ e.traag = Math.max(e.traag, 0.3); }
        if (d.soort === 'angels' && d.klok <= 0 && d.voorraad > 0){
          raakVijand(e, angelSchade(e), false);
          d.voorraad--;
        }
        if (d.soort === 'hek' && d.voorraad > 0 && !(e.gehouden && e.gehouden[d.id])){
          e.gehouden = e.gehouden || {};
          e.gehouden[d.id] = true; e.stop = 1.1; d.voorraad--;
          pluis.push({ x:q.x, y:q.y, vx:0, vy:-40, leven:0.4, kleur:'#8a6a45' });
        }
      });
      if (d.soort === 'angels' && d.klok <= 0) d.klok = 0.35;
    });
    wegdingen = wegdingen.filter(function(d){ return !WEGDING[d.soort].voorraad || d.voorraad > 0; });
    torens.forEach(function(t){
      if ((t.uit || 0) > 0 || !t.kracht || t.soort !== 'aap') return;
      if (t.bomKlok === undefined) t.bomKlok = BOMTIJD;
      t.bomKlok -= dt;
      if (t.bomKlok > 0) return;
      var bereikB = bereikVan(t), doelB = null, verstB = -1, posB = null;
      vijanden.forEach(function(e){
        if (e.dood || !ziet(t, e)) return;
        var q = positie(e.d);
        if (Math.hypot(q.x - t.x, q.y - t.y) <= bereikB && e.d > verstB){ doelB = e; verstB = e.d; posB = q; }
      });
      if (!doelB) return;
      t.bomKlok = BOMTIJD;
      kogels.push({ x0:t.x, y0:t.y, x1:posB.x, y1:posB.y, t:0, duur:0.5,
                    schade:BOMSCHADE * (1 + (t.niveau - 1) * 0.6) * reeksbonus(), doel:doelB,
                    draai:toeval() * 360, brand:true, bom:true });
    });
    torens.forEach(function(t){
      var so = SOORTEN[t.soort];
      if (!so.bommen) return;
      if (!t.vlieger) t.vlieger = { x:t.x, y:t.y - 1, hoek:0, bommen:BOMMEN, fase:'vliegt', klok:0, laad:0 };
      var v = t.vlieger;
      var ligtEruit = (t.uit || 0) > 0;
      if (v.klok > 0) v.klok -= dt;
      if (v.fase === 'laadt'){
        v.x = t.x; v.y = t.y;
        if (!ligtEruit) v.laad -= dt;
        if (v.laad <= 0){ v.bommen = BOMMEN + (t.kracht ? 2 : 0); v.fase = 'vliegt'; }
        return;
      }
      var doel = null, verst = -1, pos = null;
      if (v.bommen > 0 && !ligtEruit) vijanden.forEach(function(e){
        if (e.dood || !ziet(t, e)) return;
        if (e.d > verst){ doel = e; verst = e.d; pos = positie(e.d); }
      });
      var mik;
      if (v.fase === 'terug' || v.bommen <= 0){ v.fase = 'terug'; mik = { x:t.x, y:t.y }; }
      else if (doel) mik = pos;
      else {
        if (v.wacht === undefined){ v.wacht = 1; v.richting = 1; }
        var stap = 200, aantal = Math.max(2, Math.floor(PADLENGTE / stap));
        var doelPlek = positie(Math.min(PADLENGTE - 40, 60 + v.wacht * stap));
        if (Math.hypot(doelPlek.x - v.x, doelPlek.y - v.y) < 12){
          v.wacht += v.richting;
          if (v.wacht >= aantal){ v.wacht = aantal; v.richting = -1; }
          if (v.wacht <= 0){ v.wacht = 0; v.richting = 1; }
        }
        mik = doelPlek;
      }
      var dx = mik.x - v.x, dy = mik.y - v.y, af = Math.hypot(dx, dy);
      if (af > 0.5){
        v.hoek = Math.atan2(dy, dx) * 180 / Math.PI;
        var f2 = Math.min(1, VLIEGSNEL * dt / af);
        v.x += dx * f2; v.y += dy * f2;
      }
      if (v.fase === 'terug'){
        if (af <= 6){ v.fase = 'laadt'; v.laad = herlaadtijd(t); v.laadVol = v.laad; }
        return;
      }
      if (doel && af <= 16 && v.klok <= 0){
        v.bommen--; v.klok = BOMPAUZE;
        kogels.push({ x0:pos.x, y0:pos.y, x1:pos.x, y1:pos.y, t:0, duur:BOMVAL,
                      schade:so.schade * (1 + (t.niveau - 1) * 0.6) * reeksbonus() * (t.kracht ? 1.5 : 1),
                      straal:so.straal * (t.kracht ? 1.45 : 1), doel:doel, draai:0, bom:true, valt:true });
        if (v.bommen <= 0) v.fase = 'terug';
      }
    });
    torens.forEach(function(t){
      var so = SOORTEN[t.soort];
      if (!so.vrienden) return;
      if (t.thuis === undefined) t.thuis = padPlek(t.x, t.y);
      var wil = VRIEND.aantal + (t.kracht ? 1 : 0);
      var mijn = vrienden.filter(function(v){ return v.hut === t; }).length;
      if ((t.uit || 0) > 0) return;
      if (mijn >= wil){ t.vriendKlok = VRIEND.wachten * (t.kracht ? 0.7 : 1); return; }
      if (t.vriendKlok === undefined) t.vriendKlok = 0;
      t.vriendKlok -= dt;
      if (t.vriendKlok > 0) return;
      t.vriendKlok = VRIEND.wachten * (t.kracht ? 0.7 : 1);
      var maxHp = Math.round(VRIEND.hp * (1 + (t.niveau - 1) * VRIEND.hpNiveau));
      var plek = 0;
      while (vrienden.some(function(v){ return v.hut === t && v.eigen === plek; })) plek += 28;
      vrienden.push({ hut:t, d:Math.max(SPAWNAF + 20, t.thuis), hp:maxHp, maxHp:maxHp, klok:0, eigen:plek, stap:toeval() * 6 });
    });
    vrienden.forEach(function(v){
      if (torens.indexOf(v.hut) < 0){ v.hp = 0; return; }
      var grens = Math.max(SPAWNAF + 20, v.hut.thuis - VRIEND.leiband + (v.eigen || 0));
      var q = positie(v.d);
      var tegen = null, klappen = 0;
      vijanden.forEach(function(e){
        if (e.dood) return;
        if (e.d < v.d - 18 || e.d > v.d + 22) return;
        e.stop = Math.max(e.stop || 0, 0.12);
        if (!tegen) tegen = e;
        klappen += VRIEND.klap * (e.baas ? VRIEND.baasklap : 1);
        if (e.camo){
          e.camo = false;
          cijfers.push({ x:q.x, y:q.y - 32, tekst:'ontdekt', leven:0.9, kleur:'#2f7d52' });
        }
      });
      if (tegen){
        v.klok -= dt;
        if (v.klok <= 0){
          v.klok = VRIEND.tempo;
          raakVijand(tegen, VRIEND.schade * (1 + (v.hut.niveau - 1) * 0.6) * reeksbonus(), false);
          v.slag = 0.22;
        }
        v.hp -= klappen * (1 + bank.ronde * 0.03) * dt;
      } else if (v.d > grens){
        v.d = Math.max(grens, v.d - VRIEND.snelheid * dt);
      } else if (v.d < grens){
        v.d += VRIEND.snelheid * dt;
      }
      if (v.slag > 0) v.slag -= dt;
    });
    vrienden.forEach(function(v){
      if (v.hp > 0) return;
      var q = positie(v.d);
      for (var i = 0; i < 6; i++){
        var h = toeval() * Math.PI * 2, sn = 25 + toeval() * 45;
        pluis.push({ x:q.x, y:q.y, vx:Math.cos(h)*sn, vy:Math.sin(h)*sn, leven:0.4, kleur:'#3f8f5c' });
      }
    });
    vrienden = vrienden.filter(function(v){ return v.hp > 0; });
    torens.forEach(function(t){
      var so = SOORTEN[t.soort];
      if (!so.golf || (t.uit || 0) > 0) return;
      var wacht = Math.max(6, so.golftijd - (t.niveau - 1) * 4) * (t.kracht ? 0.5 : 1);
      if (t.golfKlok === undefined) t.golfKlok = wacht;
      t.golfKlok -= dt;
      if (t.golfKlok > 0) return;
      var bereik2 = so.bereik + (t.niveau - 1) * 18;
      var raakbaar = vijanden.filter(function(e){
        if (e.dood || !ziet(t, e)) return false;
        var q = positie(e.d);
        return Math.hypot(q.x - t.x, q.y - t.y) <= bereik2;
      });
      if (!raakbaar.length) return;
      t.golfKlok = wacht;
      var kracht = so.golf * (1 + (t.niveau - 1) * 0.6) * reeksbonus();
      raakbaar.forEach(function(e){ raakVijand(e, kracht, false); });
      golven.push({ x:t.x, y:t.y, r:bereik2, leven:0.55, kleur:so.kleur, dik:true });
      melding2('De Tonkla Toren laat een schokgolf los en raakt ' + raakbaar.length + (raakbaar.length === 1 ? ' fout.' : ' fouten.'));
    });
    torens.forEach(function(t){
      var s = SOORTEN[t.soort];
      if (s.bommen || s.vrienden) return;
      var bereik = s.bereik + (t.niveau-1) * 18, schade = s.schade * (1 + (t.niveau-1) * 0.6) * reeksbonus();
      if (W.stilToren === t) return;
      if ((t.uit || 0) > 0) return;
      t.klok -= dt;
      if (t.klok > 0) return;
      var p = t, doel = null, verst = -1, doelPos = null;
      vijanden.forEach(function(e){
        if (e.dood || !ziet(t, e)) return;
        var pos = positie(e.d);
        if (Math.hypot(pos.x - p.x, pos.y - p.y) <= bereik && e.d > verst){ doel = e; verst = e.d; doelPos = pos; }
      });
      if (!doel) return;
      t.klok = s.tempo * (t.kracht && t.soort === 'kanon' ? 0.5 : 1) * ((t.heet || 0) > 0 ? 1.6 : 1);
      if (t.kracht && t.soort === 'schutter' && doel.baas) schade *= 3;
      if (t.kracht && t.soort === 'onderzeeer' && doel.baas) schade *= 1.6;
      t.mikt = Math.atan2(doelPos.y - p.y, doelPos.x - p.x) * 180 / Math.PI;
      t.terugslag = 1;
      var geraakt = s.vlak
        ? vijanden.filter(function(e){ if (e.dood || !ziet(t, e)) return false; var q = positie(e.d); return Math.hypot(q.x - p.x, q.y - p.y) <= bereik; })
        : (t.kracht && t.soort === 'schip')
          ? vijanden.filter(function(e){ if (e.dood || !ziet(t, e)) return false; var q = positie(e.d); return Math.hypot(q.x - p.x, q.y - p.y) <= bereik; }).sort(function(a, b){ return b.d - a.d; }).slice(0, 3)
          : [doel];
      if (t.soort === 'mortier'){
        kogels.push({ x0:p.x, y0:p.y, x1:doelPos.x, y1:doelPos.y, t:0, duur:0.55, schade:schade, doel:doel, draai:toeval() * 360, lava:true,
                      straal:s.straal * (t.kracht ? 1.3 : 1), lavaDuur:t.kracht ? 6 : 3, lavaSchade:schade * 0.25 });
      } else if (t.soort === 'onderzeeer'){
        kogels.push({ x0:p.x, y0:p.y, x1:doelPos.x, y1:doelPos.y, t:0, duur:0.4, schade:schade, doel:doel, draai:0, raket:true, straal:s.straal });
      } else if (t.soort === 'dart'){
        var roos = false;
        if (t.kracht){ t.worp = (t.worp || 0) + 1; roos = t.worp % 3 === 0; }
        kogels.push({ x0:p.x, y0:p.y, x1:doelPos.x, y1:doelPos.y, t:0, duur:0.22, schade:roos ? schade * 3 : schade, doel:doel, draai:0, dart:true, roos:roos });
      } else if (t.soort === 'katapult'){
        kogels.push({ x0:p.x, y0:p.y, x1:doelPos.x, y1:doelPos.y, t:0, duur:0.42, schade:schade, doel:doel, draai:toeval() * 360, brand:!!t.kracht });
      } else {
        geraakt.forEach(function(e){
          if (t.soort === 'schutter' && e.camo){
            e.camo = false;
            var qc = positie(e.d);
            cijfers.push({ x:qc.x, y:qc.y - 32, tekst:'ontdekt', leven:0.9, kleur:'#2f7d52' });
          }
          raakVijand(e, schade * (t.kracht && t.soort === 'pekelpot' ? 1.8 : 1), t.soort === 'vertrager');
          if (t.kracht && t.soort === 'vertrager'){ e.traag = 2.6; e.ijs = true; }
          if (s.brand){
            e.brand = 3;
            e.brandKracht = Math.max(e.brandKracht || 0, 2.4 * (1 + (t.niveau - 1) * 0.6) * reeksbonus() * (t.kracht ? 2 : 1));
          }
        });
        if (s.vlak){
          golven.push({ x:p.x, y:p.y, r:bereik, leven:0.34, kleur:s.kleur });
        } else {
          var vanX = p.x, vanY = p.y;
          if (t.kracht && t.soort === 'kanon'){
            t.loop = t.loop ? 0 : 1;
            var h2 = Math.atan2(doelPos.y - p.y, doelPos.x - p.x);
            var kant = t.loop ? 6 : -6;
            vanX = p.x - Math.sin(h2) * kant;
            vanY = p.y + Math.cos(h2) * kant;
          }
          var dx2 = doelPos.x - vanX, dy2 = doelPos.y - vanY;
          schoten.push({ x:vanX, y:vanY, len:Math.hypot(dx2, dy2), hoek:Math.atan2(dy2, dx2) * 180 / Math.PI, kleur:s.schotkleur || s.kleur,
                         leven:0.18, dik:t.soort === 'schutter' ? 4 : 3, banaan:t.soort === 'aap', boot:t.soort === 'schip' });
        }
      }
    });
    vijanden.forEach(function(e){ if (e.flits > 0) e.flits -= dt; });
    vijanden = vijanden.filter(function(e){
      if (e.dood) return false;
      if (!isFinite(e.hp) || !isFinite(e.d) || !isFinite(e.snelheid)){ zeg('fout', { soort:e.soort, hp:e.hp, d:e.d, snelheid:e.snelheid, ronde:bank.ronde }); return false; }
      return true;
    });
    schoten.forEach(function(s){ s.leven -= dt; });
    schoten = schoten.filter(function(s){ return s.leven > 0; });
    cijfers.forEach(function(c){ c.leven -= dt; c.y -= 26 * dt; });
    cijfers = cijfers.filter(function(c){ return c.leven > 0; });
    pluis.forEach(function(v){ v.leven -= dt; v.x += v.vx * dt; v.y += v.vy * dt; v.vy += 90 * dt; });
    pluis = pluis.filter(function(v){ return v.leven > 0; });
    golven.forEach(function(g2){ g2.leven -= dt; });
    golven = golven.filter(function(g2){ return g2.leven > 0; });
    kogels.forEach(function(k){
      k.t += dt / k.duur;
      k.draai += 340 * dt;
      if (k.t >= 1 && !k.raak){
        k.raak = true;
        var slachtoffer = (k.doel && !k.doel.dood && !(k.doel.onder > 0)) ? k.doel : null;
        if (!slachtoffer){
          var kortst = 30;
          vijanden.forEach(function(e){
            if (e.dood || e.camo || e.onder > 0) return;
            var q = positie(e.d);
            var d = Math.hypot(q.x - k.x1, q.y - k.y1);
            if (d < kortst){ kortst = d; slachtoffer = e; }
          });
        }
        if (k.brand || k.straal){
          var straal = k.straal || 60;
          var geraakt2 = 0;
          vijanden.forEach(function(e){
            if (e.dood || e.camo || e.onder > 0) return;
            var q2 = positie(e.d);
            if (Math.hypot(q2.x - k.x1, q2.y - k.y1) <= straal){ raakVijand(e, k.schade, false); geraakt2++; }
          });
          golven.push({ x:k.x1, y:k.y1, r:straal, leven:0.3, kleur:k.lava ? '#ff6a1a' : '#EA9836' });
          if (!geraakt2) raakVijand(slachtoffer, k.schade, false);
          if (k.lava) lavas.push({ x:k.x1, y:k.y1, r:straal * 0.8, leven:k.lavaDuur, vol:k.lavaDuur, schade:k.lavaSchade });
        } else if (k.dart){
          raakVijand(slachtoffer, k.schade, false);
          var ver = k.roos ? 110 : 60, hoeveel = k.roos ? 2 : 1, dichtbij = [];
          vijanden.forEach(function(e){
            if (e === slachtoffer || e.dood || e.camo || e.onder > 0) return;
            var q3 = positie(e.d), d3 = Math.hypot(q3.x - k.x1, q3.y - k.y1);
            if (d3 < ver) dichtbij.push({ e:e, d:d3 });
          });
          dichtbij.sort(function(a, b){ return a.d - b.d; });
          dichtbij.slice(0, hoeveel).forEach(function(x){ raakVijand(x.e, k.schade, false); });
          if (k.roos){
            golven.push({ x:k.x1, y:k.y1, r:30, leven:0.28, kleur:'#EFC64A' });
            cijfers.push({ x:k.x1, y:k.y1 - 12, tekst:'roos', leven:0.6, kleur:'#EFC64A' });
          }
          return;
        } else {
          raakVijand(slachtoffer, k.schade, false);
        }
        for (var i = 0; i < 5; i++){
          var h = toeval() * Math.PI * 2, v = 25 + toeval() * 45;
          pluis.push({ x:k.x1, y:k.y1, vx:Math.cos(h)*v, vy:Math.sin(h)*v, leven:0.32, kleur:'#9b8c72' });
        }
        golven.push({ x:k.x1, y:k.y1, r:26, leven:0.2, kleur:'#9b8c72' });
      }
    });
    kogels = kogels.filter(function(k){ return k.t < 1; });
    torens.forEach(function(t){ if (t.terugslag > 0) t.terugslag -= dt * 5; });
    if (klap > 0) klap -= dt;
    if (verlies){
      botLog('verlies', { n:verlies });
      if (!W.onsterfelijk) bank.leven -= verlies;
      klap = 0.9; klapAantal = verlies;
      zeg('klap', verlies, bank.leven);
      if (bank.leven <= 0){ bank.leven = 0; W.fase = 'einde'; uit(); zeg('einde'); return; }
    }
  }

  /* ---------- naar buiten ---------- */
  function uit(){
    W.vijanden = vijanden; W.torens = torens; W.schoten = schoten; W.vrienden = vrienden; W.cijfers = cijfers; W.pluis = pluis;
    W.golven = golven; W.kogels = kogels; W.schillen = schillen; W.lavas = lavas; W.wegdingen = wegdingen;
    W.bank = bank; W.wachtrij = wachtrij; W.spawnKlok = spawnKlok; W.rondePauze = rondePauze; W.rondeGehaald = rondeGehaald;
    W.vuur = vuur; W.penningen = penningen; W.slots = slots; W.gelapt = gelapt; W.haast = haast; W.sprongOver = sprongOver;
    W.camoGezien = camoGezien; W.laatsteDoor = laatsteDoor; W.baasBijWachtrij = baasBijWachtrij; W.miniBijWachtrij = miniBijWachtrij;
    W.baasAlarm = baasAlarm; W.pols = pols; W.alarmMini = alarmMini; W.baasSpook = baasSpook; W.baasBalkIn = baasBalkIn; W.baasBalk = baasBalk;
    W.klap = klap; W.klapAantal = klapAantal; W.poortFlits = poortFlits; W.slagen = slagen; W.golfKeuzes = golfKeuzes; W.baasKeuzes = baasKeuzes;
    W.vrij = vrij; W.vrijBijStart = vrijBijStart; W.gekozenLijst = gekozenLijst;
  }
  /* een stap: een tik, of twee op 2x snel, keer het tempo van het testpaneel */
  W.stap = function(){
    if (W.fase !== 'spel' || W.pauze){ uit(); return; }
    slagen++;
    var stappen = Math.max(1, W.tempo | 0) * (W.snel ? 2 : 1);
    for (var i = 0; i < stappen; i++){ tik(); if (W.fase !== 'spel') break; }
    uit();
  };
  W.voerUit = voerUit;
  /* de hele stand over de lijn: hetzelfde pakket dat de gastheer vroeger stuurde */
  W.pakket = function(f){
    return { k:'st', f:f || (W.fase === 'einde' ? 'einde' : 'spel'), ts:slagen * 60, th:thema.id, ki:KAARTEN.indexOf(kaart), pz:W.pauze, va:Math.max(1, W.tempo | 0) * (W.snel ? 2 : 1),
      gz:gekozenLijst, vb:vrijBijStart, vl:Object.keys(SOORTEN).filter(isVrij),
      g:{ munten:bank.munten, leven:bank.leven, ronde:bank.ronde, wachtrij:wachtrij, rondePauze:rondePauze, slots:slots, penningen:penningen, haast:haast,
          baasBalkIn:baasBalkIn, baasSpook:baasSpook, baasAlarm:baasAlarm, alarmMini:alarmMini, klap:klap, klapAantal:klapAantal, rondeGehaald:rondeGehaald,
          poortFlits:poortFlits, gk:golfKeuzes, bk:baasKeuzes, vuur:vuur, laatsteDoor:laatsteDoor, baasBij:baasBijWachtrij, miniBij:miniBijWachtrij },
      bb:baasBalk ? plat(baasBalk) : null,
      v:inpak(vijanden, VELDEN.v),
      t:inpak(torens, VELDEN.t, function(o, r){ r.push(o.vlieger ? VELDEN.vl.map(function(k){ return kort(o.vlieger[k]); }) : null); }),
      s:inpak(schoten, VELDEN.s), ko:inpak(kogels, VELDEN.ko), go:inpak(golven, VELDEN.go), ci:inpak(cijfers, VELDEN.ci), w:inpak(wegdingen, VELDEN.w),
      vr:inpak(vrienden, VELDEN.vr, function(o, r){ r[r.length - 1] = o.hut ? o.hut.id : null; }),
      la:inpak(lavas, VELDEN.la),
      sc:inpak(schillen, VELDEN.sc, function(o, r){ r[r.length - 1] = o.toren ? o.toren.id : null; }),
      pl:inpak(pluis.slice(-60), VELDEN.pl) };
  };
  /* de helpers die het bord en de menu's nodig hebben */
  W.positie = positie; W.padHoek = padHoek; W.padPlek = padPlek; W.afstandTotPad = afstandTotPad; W.eilanden = eilanden; W.opEiland = opEiland;
  W.bank = bank; W.magHier = magHier; W.magOpWeg = magOpWeg; W.torenBij = torenBij; W.wegdingBij = wegdingBij; W.prijsVan = prijsVan; W.maxTorens = maxTorens;
  W.slotPrijs = slotPrijs; W.magSlot = magSlot; W.haastKeer = haastKeer; W.haastExtra = haastExtra; W.inPauzeTussenRondes = inPauzeTussenRondes;
  W.magErbijRoepen = magErbijRoepen; W.golfVan = golfVan; W.baasVan = baasVan; W.isVrij = isVrij; W.past = past; W.gekozen = gekozen;
  W.reeksbonus = reeksbonus; W.toeval = toeval; W.bereikVan = bereikVan; W.ziet = ziet; W.foutNaam = foutNaam;
  W.zetRang = function(r){ rang = Math.max(1, Math.min(4, +r || 2)); };
  uit();
  return W;
}

g.TORENMOTOR = { maak:maak, BREED:BREED, HOOG:HOOG, KAARTEN:KAARTEN, SOORTEN:SOORTEN, THEMAS:THEMAS, VRIEND:VRIEND, WEGDING:WEGDING, KRACHTEN:KRACHTEN,
  BAZEN:BAZEN, APENBAAS:APENBAAS, MEGABAAS:MEGABAAS, KRAKEN:KRAKEN, ZEESLANG:ZEESLANG, MAGMAKONING:MAGMAKONING, MINIBAAS:MINIBAAS, ZESTIG:ZESTIG, TACHTIG:TACHTIG,
  FOUTEN:FOUTEN, GOLFSOORTEN:GOLFSOORTEN, GOLFVANAF:GOLFVANAF, VELDEN:VELDEN, inpak:inpak, uitpak:uitpak, plat:plat, kort:kort,
  BOMSTRAAL:BOMSTRAAL, BOMVAL:BOMVAL, BOMMEN:BOMMEN, BOMPAUZE:BOMPAUZE, HERLAAD:HERLAAD, VLIEGSNEL:VLIEGSNEL, KRING:KRING, KRINGVAART:KRINGVAART, VLIEGHOOGTE:VLIEGHOOGTE,
  EILANDRONDE:EILANDRONDE, MAXKEUZE:MAXKEUZE, MINKEUZE:MINKEUZE, SAMENKEUZE:SAMENKEUZE, BOMTIJD:BOMTIJD, BOMSCHADE:BOMSCHADE, TONKLAREEKS:TONKLAREEKS, TONKLARONDE:TONKLARONDE,
  PADVRIJ:PADVRIJ, TORENVRIJ:TORENVRIJ, RAND:RAND, MAXWEG:MAXWEG, WEGVRIJ:WEGVRIJ, DUURDER:DUURDER, MAXNIVEAU:MAXNIVEAU, BAASRONDE:BAASRONDE, BAASSCHADE:BAASSCHADE,
  BAASBELONING:BAASBELONING, SCHILTIJD:SCHILTIJD, SCHILDUUR:SCHILDUUR, SCHILBEREIK:SCHILBEREIK, DUBBELSCHIL:DUBBELSCHIL, APENKANS:APENKANS, MEGASCHADE:MEGASCHADE,
  INKTTIJD:INKTTIJD, INKTDUUR:INKTDUUR, INKTBEREIK:INKTBEREIK, ZEESLANGRONDE:ZEESLANGRONDE, DUIKTIJD:DUIKTIJD, DUIKDUUR:DUIKDUUR, UITBARSTTIJD:UITBARSTTIJD, HITTEDUUR:HITTEDUUR,
  HITTEBEREIK:HITTEBEREIK, VONKEN:VONKEN, ROOFTIJD:ROOFTIJD, KOPIEERTIJD:KOPIEERTIJD, FASENSCHADE:FASENSCHADE, VIJANDKRACHT:VIJANDKRACHT, RUSTTAAI:RUSTTAAI, RUSTAANTAL:RUSTAANTAL,
  MINISCHADE:MINISCHADE, STARTSLOTS:STARTSLOTS, HAASTMAX:HAASTMAX, POORTAF:POORTAF, SPAWNAF:SPAWNAF,
  apenkans:apenkans, isMegaRonde:isMegaRonde, zwaarte:zwaarte, baasZwaarte:baasZwaarte, isRustronde:isRustronde, isBaasRonde:isBaasRonde, isMiniRonde:isMiniRonde,
  minibeloning:minibeloning, foutNaam:foutNaam, ziet:ziet, bereikVan:bereikVan, herlaadtijd:herlaadtijd, afstandTotPadOp:afstandTotPadOp };
})(typeof globalThis !== 'undefined' ? globalThis : this);
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.TORENMOTOR;
