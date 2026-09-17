/* De motor van Zwaardvechter: alles wat rekent en niets wat tekent.

   Dezelfde motor draait op twee plekken. Wie alleen speelt heeft hem in zijn
   eigen browser. Wie samen speelt heeft hem in de spelkamer op de server:
   die tikt zestig keer per seconde, voert de toetsen van allebei uit en
   stuurt twintig keer per seconde de stand terug (zie server/kamer.js). De
   browser tekent dan alleen nog.

   Wat hierin zit: de arena, de spelers, de fouten en de bazen, hun aanvallen,
   het lopen, slaan, schieten en ontwijken, de munten, en het toeval (met een
   eigen zaad, zodat een potje na te spelen is). Wat er niet in zit: vragen,
   winkel, tekenen, toetsen, en alles wat met het scherm te maken heeft. De
   motor praat terug via 'haken': functies die de pagina meegeeft en die
   aangeroepen worden als er iets te vertellen is (een nieuwe soort fout, een
   baas die binnenkomt, een aanval die begint, iemand die neergaat).

   Gebruik:
     var W = ZWAARDMOTOR.maak({ seed:123, spelers:[{ naam:'jij' }], haak:{ ... } });
     W.zetStats(0, stats, hp);   de uitrusting van een speler (uit de winkel)
     W.zetInvoer(0, dx, dy);     welke kant hij op loopt (-1..1)
     W.ontwijk(0); W.wapen(0);   springen, wisselen tussen zwaard en boog
     W.volgendeRonde();          de volgende ronde in (na de vragen en de winkel)
     W.stap(1 / 60);             een stap van de klok
     W.pakket();                 de hele stand, klein genoeg om over de lijn te sturen

   Dit bestand laadt als gewoon script in de browser (ZWAARDMOTOR op window)
   en als module op de server (module.exports). */
(function(g){
'use strict';

/* ============================================================================
   BALANS. Hier draai je aan.
   ============================================================================ */
const ARENA = { b:1100, h:620, rand:26 };
/* 'boog' is de wijdte van de zwaai in graden; 'pijlboog' is het tweede wapen:
   minder schade en trager, maar het raakt van ver. */
const SPELER = { r:22, hp:100, snelheid:200, zwaard:{ schade:16, bereik:82, tempo:0.55 }, boog:130,
                 pijlboog:{ deel:0.55, bereik:330, tempo:1.2, snel:620 } };
/* Ontwijken: een korte sprong in je looprichting, even onkwetsbaar, en dan
   een paar seconden wachten. */
const DASH = { duur:0.18, snel:950, pauze:2.2, onkwetsbaar:0.4 };
const MUNT_VAL = 0.35;          /* kans dat een gevelde fout een munt laat vallen */
const RAAKPAUZE = 0.8;          /* seconden onkwetsbaar na een klap */
const BAASRONDE = 5;
/* Na de laatste fout speel je nog even door om de munten op te rapen. Ligt
   er niets meer, dan hoef je ook niet te wachten. */
const RAAPTIJD = 5;

/* De fouten. */
const FOUTEN = [
  { id:'gewoon', naam:'gewone fout', vanaf:1, kans:5, mark:'?',      kleur:'#c0442c', hp:1,    snel:1,    r:19, schade:10 },
  { id:'snel',   naam:'snelle fout', vanaf:2, kans:3, mark:'»', kleur:'#EA9836', hp:0.6,  snel:1.7,  r:16, schade:8 },
  { id:'schild', naam:'fout met schild', vanaf:4, kans:2, mark:'●', kleur:'#5b6480', hp:1.3, snel:0.85, r:20, schade:12, schild:0.5 },
  { id:'zwerm',  naam:'zwerm',       vanaf:3, kans:2, mark:'×', kleur:'#7d1f12', hp:0.35, snel:1.3,  r:12, schade:6, aantal:3 },
  { id:'dik',    naam:'dikke fout',  vanaf:6, kans:1, mark:'◆', kleur:'#6b3fa0', hp:2.6,  snel:0.65, r:28, schade:18 },
  /* De schutter komt niet op je af maar zoekt zijn afstand en schiet. Waar hij
     op mikt licht eerst op de grond op, zoals bij een baas. 'afstand' is de
     afstand die hij zoekt, 'laden' de seconden tussen twee schoten, 'mik' hoe
     lang hij voor het schot al stilstaat. */
  { id:'schutter', naam:'schutter', vanaf:6, kans:2, mark:'→', kleur:'#2f7d52', hp:0.8, snel:0.8, r:17, schade:8,
    afstand:250, laden:2.5, mik:0.45 }
];
/* De zes bazen. Om de vijf rondes komt de volgende aan de beurt, en na de
   zesde begint de rij opnieuw op een hogere ronde en dus taaier. */
const BAZEN = [
  { id:'fout',    naam:'De Grote Fout', kleur:'#4a1230', vorm:'ster',  hp:16, r:46, schade:26, schild:0.35,
    aanvallen:['cirkel', 'laser', 'kegel', 'spiraal'],
    wat:'Cirkels op de grond, een laser die om hem heen draait, een waaier recht voor zich uit en een spiraal van propjes.' },
  { id:'inkt',    naam:'De Inktvlek',   kleur:'#1b3a8f', vorm:'vlek',  hp:16, r:50, schade:24, schild:0.3,
    aanvallen:['plas', 'kegel', 'cirkel', 'regen'],
    wat:'Spat inkt over de vloer die blijft liggen, spuit een waaier voor zich uit en laat het plofjes regenen. Steeds minder plek om te staan.' },
  { id:'pen',     naam:'De Rode Pen',   kleur:'#c0442c', vorm:'pen',   hp:18, r:42, schade:26, schild:0.35,
    aanvallen:['baan', 'kruis', 'laser', 'muur'],
    wat:'Streept de arena door met rechte halen, zet er kruisen doorheen en veegt een streep over de vloer met een gat erin.' },
  { id:'prop',    naam:'De Prop',       kleur:'#8a7350', vorm:'prop',  hp:21, r:52, schade:28, schild:0.4,
    aanvallen:['kogel', 'golf', 'baan', 'bom'],
    wat:'Schiet propjes in alle richtingen, rolt over de vloer en gooit bommen die in scherven uiteenspatten. Taai.' },
  { id:'klok',    naam:'De Klok',       kleur:'#6b3fa0', vorm:'klok',  hp:17, r:46, schade:24, schild:0.35,
    aanvallen:['wijzers', 'tik', 'krimp', 'spiraal'],
    wat:'Twee wijzers draaien rond, de uren tikken een voor een af, de ring loopt naar binnen en de seconden spiralen naar buiten.' },
  { id:'zwerm',   naam:'De Zwerm',      kleur:'#7d1f12', vorm:'zwerm', hp:16, r:48, schade:22, schild:0.3,
    aanvallen:['kogel', 'krimp', 'cirkel', 'bom'],
    wat:'Barst uit elkaar in propjes, sluit je in met een ring en gooit bommen. Het minste leven, het meeste in de lucht.' }
];
/* De aanvallen. Elke aanval heeft eerst een waarschuwing die je op de grond
   ziet, en dan het moment dat het raakt. Alle maten zijn in arenapunten. */
const AANVAL = {
  pauze:function(n){ return Math.max(0.55, 1.6 - n * 0.03); },   /* seconden tussen twee aanvallen: kort, en steeds korter */
  korter:function(n){ return Math.max(0.5, 1 - n * 0.012); },    /* de waarschuwing krimpt langzaam, nooit onder een halve seconde */
  boosPauze:0.3,                                                 /* onder de helft van zijn leven: nog sneller achter elkaar */
  boosKorter:0.85,                                               /* kwaad: de waarschuwing nog korter */
  boosOverlap:0.55,                                              /* kwaad: de volgende aanval begint al voor de vorige klaar is */
  boosDubbel:0.35,                                               /* kwaad: kans dat er meteen een tweede aanval bij komt */
  regen:{ r:50, na:0.2, aantal:function(n){ return 7 + Math.floor(n / 8); } },
  muur:{ wacht:1, duur:2.2, breed:44, gat:150, schade:19 },
  spiraal:{ na:0.09, draai:0.5, aantal:function(n){ return 16 + Math.min(12, Math.floor(n / 3)); } },
  bom:{ snel:170, r:20, duur:1.4, scherven:10, schade:18, aantal:function(n){ return n >= 12 ? 2 : 1; } },
  cirkel:{ r:78, wacht:1.15, knal:0.3, schade:18,
    extra:function(n){ return 1 + Math.floor(n / 10); } },
  laser:{ wacht:0.9, duur:1.7, boog:Math.PI * 0.55, breed:26, schade:16,
    stralen:function(n){ return n >= 15 ? 2 : 1; } },
  golf:{ wacht:0.75, duur:1.5, tot:620, band:24, schade:20,
    ringen:function(n){ return n >= 20 ? 2 : 1; } },
  plas:{ wacht:0.9, duur:6.5, r:66, schade:9,
    aantal:function(n){ return 3 + Math.floor(n / 12); } },
  kegel:{ wacht:1, knal:0.45, wijd:Math.PI * 0.17, ver:640, schade:20 },
  baan:{ wacht:1.05, knal:0.35, breed:74, schade:19,
    aantal:function(n){ return n >= 15 ? 3 : 2; } },
  kruis:{ wacht:1.05, knal:0.35, breed:66, schade:19 },
  kogel:{ wacht:0.55, snel:250, r:13, schade:15, leven:4,
    aantal:function(n){ return 8 + Math.min(8, Math.floor(n / 6)) * 2; } },
  wijzers:{ wacht:1, duur:3.4, breed:24, schade:16 },
  tik:{ wacht:0.8, knal:0.3, r:62, schade:16, ring:210, na:0.16, aantal:12 },
  krimp:{ wacht:1.1, duur:2.2, van:660, band:30, gat:Math.PI * 0.3, schade:20 },
  schot:{ wacht:0.8, snel:430, r:11, schade:14, breed:26, leven:3 }
};
/* De muur: een band die van de ene kant van de arena naar de andere veegt,
   met een gat erin. hoek 0 = van links naar rechts, halve pi = van boven naar
   beneden, pi = van rechts, anderhalve pi = van onder. gat is 0..1 dwars. */
function muurStand(a){
  var mu = AANVAL.muur, W0 = mu.wacht * (a.k || 1), p = Math.min(1, Math.max(0, (a.t - W0) / mu.duur));
  var kant = Math.round(a.hoek / (Math.PI / 2)) % 4, langsX = kant % 2 === 0;
  var lengte = langsX ? ARENA.b : ARENA.h, dwars = langsX ? ARENA.h : ARENA.b;
  var van = -mu.breed / 2, tot = lengte + mu.breed / 2;
  return { langsX:langsX, vooruit:kant < 2, pos:kant < 2 ? van + p * (tot - van) : tot - p * (tot - van),
           gatMidden:ARENA.rand + (a.gat || 0.5) * (dwars - 2 * ARENA.rand), gatBreed:mu.gat, deel:p, wacht:W0 };
}
/* Hoeveel fouten in een ronde, en hoe taai ze zijn. */
function aantalInRonde(n){ return 6 + Math.round(Math.min(n, 25) * 1.9 + Math.max(0, n - 25) * 0.9); }
function foutHp(n){ var k = Math.min(n, 20); return Math.round(30 * Math.pow(1.13, k - 1) * (1 + Math.max(0, n - 20) * 0.06 + Math.max(0, n - 35) * 0.05)); }
/* welke baas hoort bij deze ronde: om de beurt, daarna weer van voren af aan */
function baasVan(n){ return BAZEN[(Math.max(1, Math.round(n / BAASRONDE)) - 1) % BAZEN.length]; }
/* de uitrusting van een speler zonder winkel */
function basisStats(){
  return { schade:SPELER.zwaard.schade, bereik:SPELER.zwaard.bereik, tempo:SPELER.zwaard.tempo, snel:SPELER.snelheid, pantser:1,
           mesTempo:0, mesSchade:0, harnas:0, maxHp:SPELER.hp,
           boogSchade:SPELER.zwaard.schade * SPELER.pijlboog.deel, boogBereik:SPELER.pijlboog.bereik, boogTempo:SPELER.zwaard.tempo * SPELER.pijlboog.tempo };
}
function nieuweSp(x, y){
  return { x:x, y:y, mikt:0, klok:0, zwaai:0, raak:0, mesKlok:0, flits:0, dash:0, dashKlok:0, dx:1, dy:0, loopt:false, wapen:'zwaard' };
}
function r1(v){ return Math.round(v * 10) / 10; }
function r2(v){ return Math.round(v * 100) / 100; }

/* ============================================================================
   De wereld: een potje, met alles erin.
   ============================================================================ */
function maak(opties){
  opties = opties || {};
  var haak = opties.haak || {};
  function zeg(naam){ var f = haak[naam]; if (typeof f === 'function'){ try { return f.apply(null, Array.prototype.slice.call(arguments, 1)); } catch (e){} } }

  /* het toeval, met een zaad: hetzelfde zaad geeft hetzelfde potje */
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

  var W = {
    seed:toevalZaad, ronde:0, fase:'ronde', pauze:false,
    fouten:[], messen:[], munt:[], pluis:[], cijfers:[], aanvallen:[],
    teSpawnen:0, spawnKlok:0, tijdInRonde:0, rondeUit:0, raapTeller:-1, extra:0, geveld:0, nr:0,
    spelers:[]
  };
  (opties.spelers && opties.spelers.length ? opties.spelers : [{ naam:'jij' }]).forEach(function(o, i){
    W.spelers.push({ i:i, naam:o.naam || 'speler ' + (i + 1), sp:nieuweSp(ARENA.b / 2, ARENA.h / 2), stats:basisStats(),
                     inv:{ dx:0, dy:0 }, hp:SPELER.hp, maxHp:SPELER.hp, neer:false, munten:0, geveld:0, klaar:false,
                     dashVraag:false, wapenVraag:false, inNr:0 });
  });
  var samen = W.spelers.length > 1;
  /* met meer spelers meer fouten en een taaiere baas: twee anderhalf keer, drie twee keer, vier tweeënhalf keer */
  function meer(){ return 1 + 0.5 * (W.spelers.length - 1); }

  /* ---------- wat de spelers doen ---------- */
  W.zetInvoer = function(i, dx, dy, nr){
    var P = W.spelers[i]; if (!P) return;
    P.inv = { dx:Math.max(-1, Math.min(1, +dx || 0)), dy:Math.max(-1, Math.min(1, +dy || 0)) };
    if (nr) P.inNr = nr;
  };
  W.ontwijk = function(i){ var P = W.spelers[i]; if (P && W.fase === 'ronde' && !W.pauze) ontwijkMet(P.sp); };
  W.wapen = function(i){ var P = W.spelers[i]; if (P && W.fase === 'ronde' && !W.pauze) wisselWapenVan(P.sp); };
  W.zetStats = function(i, st, hpNu){
    var P = W.spelers[i]; if (!P || !st) return;
    ['schade', 'bereik', 'tempo', 'snel', 'pantser', 'mesTempo', 'mesSchade', 'harnas', 'maxHp', 'boogSchade', 'boogBereik', 'boogTempo'].forEach(function(k){
      if (typeof st[k] === 'number' && isFinite(st[k])) P.stats[k] = st[k];
    });
    P.maxHp = P.stats.maxHp || P.maxHp;
    if (typeof hpNu === 'number' && isFinite(hpNu)) P.hp = Math.max(0, Math.min(P.maxHp, Math.round(hpNu)));
    if (P.hp > P.maxHp) P.hp = P.maxHp;
  };
  W.geefMunten = function(i, n){ var P = W.spelers[i]; if (P) P.munten += n; };
  /* extra fouten van klasgenoten (de Klasstrijd) */
  W.extraFouten = function(n){
    if (W.fase === 'ronde'){ for (var i = 0; i < n; i++) spawn(kiesFout()); }
    else W.extra += n;
  };
  function ontwijkMet(s){
    if (s.dashKlok > 0 || s.dash > 0) return;
    if (!s.loopt){
      var d = null, da = 1e9;
      W.fouten.forEach(function(f){ var a = Math.hypot(f.x - s.x, f.y - s.y); if (a < da){ da = a; d = f; } });
      if (d){ var wx = s.x - d.x, wy = s.y - d.y, wl = Math.hypot(wx, wy) || 1; s.dx = wx / wl; s.dy = wy / wl; }
    }
    s.dash = DASH.duur; s.dashKlok = DASH.pauze;
    s.raak = Math.max(s.raak, DASH.onkwetsbaar);
    for (var i = 0; i < 6; i++){
      var hk = toeval() * Math.PI * 2, sn = 30 + toeval() * 60;
      W.pluis.push({ x:s.x, y:s.y, vx:Math.cos(hk) * sn, vy:Math.sin(hk) * sn, leven:0.35, kleur:'#83A5F2' });
    }
  }
  function wisselWapenVan(s){
    s.wapen = s.wapen === 'boog' ? 'zwaard' : 'boog';
    s.klok = Math.max(s.klok, 0.2);          /* even geen gratis slag bij het wisselen */
    s.zwaai = 0;
  }
  function levenden(){ return W.spelers.filter(function(P){ return !P.neer; }); }

  /* ---------- de rondes ---------- */
  W.volgendeRonde = function(){
    W.ronde++;
    W.fase = 'ronde'; W.pauze = false;
    W.fouten = []; W.messen = []; W.munt = []; W.pluis = []; W.cijfers = []; W.aanvallen = [];
    W.spelers.forEach(function(P, i){
      var s = P.sp;
      /* naast elkaar rond het midden */
      s.x = ARENA.b / 2 + (samen ? (i - (W.spelers.length - 1) / 2) * 70 : 0); s.y = ARENA.h / 2;
      s.raak = 0; s.klok = 0; s.mesKlok = 0; s.dash = 0; s.dashKlok = 0;
      if (P.neer){ P.neer = false; P.hp = Math.max(1, Math.round(P.maxHp / 2)); }
      P.klaar = false; P.inv = { dx:0, dy:0 };
    });
    /* in een baasronde komen er minder gewone fouten bij: de baas is het werk */
    W.teSpawnen = Math.round(aantalInRonde(W.ronde) * (W.ronde % BAASRONDE === 0 ? 0.6 : 1) * meer()) + W.extra; W.extra = 0;
    W.spawnKlok = 0.6;
    W.tijdInRonde = 0; W.rondeUit = 0; W.raapTeller = -1;
    if (W.ronde % BAASRONDE === 0) spawnBaas();
    zeg('ronde', W.ronde, W.teSpawnen, W.ronde % BAASRONDE === 0 ? baasVan(W.ronde) : null);
  };
  /* de ronde is gehaald: wat nog op de grond ligt is van jullie, samen gedeeld */
  function naarVragen(){
    var rest = 0; W.munt.forEach(function(m){ rest += m.waarde; });
    if (samen){ var elk = Math.floor(rest / W.spelers.length), over = rest - elk * W.spelers.length; W.spelers.forEach(function(P, i){ P.munten += elk + (i < over ? 1 : 0); }); }
    else W.spelers[0].munten += rest;
    W.munt = []; W.rondeUit = 0; W.raapTeller = -1;
    W.spelers.forEach(function(P){ P.klaar = false; });
    W.fase = 'vragen';
    zeg('vragen', W.ronde);
  }
  /* klaar in de winkel: de volgende ronde begint als iedereen zover is */
  W.klaar = function(i){
    var P = W.spelers[i]; if (!P || W.fase === 'ronde' || W.fase === 'einde') return false;
    P.klaar = true;
    if (W.spelers.every(function(Q){ return Q.klaar; })){ W.volgendeRonde(); return true; }
    return false;
  };

  /* ---------- de fouten ---------- */
  function kiesFout(){
    var mag = FOUTEN.filter(function(f){ return f.vanaf <= W.ronde; });
    var totaal = mag.reduce(function(a, f){ return a + f.kans; }, 0), trek = toeval() * totaal;
    for (var i = 0; i < mag.length; i++){ trek -= mag[i].kans; if (trek <= 0) return mag[i]; }
    return mag[0];
  }
  function randPlek(){
    var kant = Math.floor(toeval() * 4), x, y;
    if (kant === 0){ x = -20; y = toeval() * ARENA.h; }
    else if (kant === 1){ x = ARENA.b + 20; y = toeval() * ARENA.h; }
    else if (kant === 2){ x = toeval() * ARENA.b; y = -20; }
    else { x = toeval() * ARENA.b; y = ARENA.h + 20; }
    for (var i = 0; i < W.spelers.length; i++){
      if (Math.hypot(x - W.spelers[i].sp.x, y - W.spelers[i].sp.y) < 160) return randPlek();
    }
    return { x:x, y:y };
  }
  function spawn(soort){
    var n = soort.aantal || 1, p = randPlek(), eerste = null;
    for (var i = 0; i < n; i++){
      var h = Math.round(foutHp(W.ronde) * soort.hp);
      var f = { id:++W.nr, soort:soort, x:p.x + (toeval() - .5) * 30, y:p.y + (toeval() - .5) * 30,
                hp:h, maxHp:h, r:soort.r, snel:soort.snel * (70 + W.ronde * 1.6), flits:0, stap:toeval() * 6,
                schild:soort.schild || 0, slaKlok:0,
                /* een schutter mikt, schuift een kant op en laadt eerst */
                mikt:0, zij:toeval() < 0.5 ? 1 : -1, laadKlok:soort.laden ? 1.2 + toeval() : 0, stilKlok:0 };
      W.fouten.push(f); if (!eerste) eerste = f;
    }
    zeg('spawn', soort, eerste);
  }
  function spawnBaas(){
    var def = baasVan(W.ronde), h = Math.round(foutHp(W.ronde) * def.hp * (samen ? 0.7 + 0.3 * W.spelers.length : 1));
    var b = { id:++W.nr, soort:def, def:def, x:ARENA.b / 2, y:ARENA.h / 2, hp:h, maxHp:h, r:def.r, snel:0, flits:0, stap:0,
              schild:def.schild, slaKlok:0, baas:true, aanvalKlok:2.2, laatste:-1, eerste:true };
    W.fouten.push(b);
    /* de spelers beginnen in het midden: even opzij, anders sta je in de baas */
    W.spelers.forEach(function(P, i){ P.sp.x = ARENA.b / 2 + (i === 0 ? -150 : 150); });
    zeg('baas', def, b);
  }

  /* ---------- de bazen en hun aanvallen ---------- */
  function baasValtAan(b, levend, boos){
    var rij = b.def.aanvallen, k = AANVAL.korter(W.ronde) * (boos ? AANVAL.boosKorter : 1);
    var i = b.eerste ? 0 : Math.floor(toeval() * rij.length);
    b.eerste = false;
    if (i === b.laatste) i = (i + 1) % rij.length;
    b.laatste = i;
    zetAanval(rij[i], b, levend, k);
    /* kwaad: soms twee aanvallen tegelijk */
    if (boos && toeval() < AANVAL.boosDubbel){
      var j = (i + 1 + Math.floor(toeval() * (rij.length - 1))) % rij.length;
      zetAanval(rij[j], b, levend, k);
    }
  }
  function vrijPunt(marge){
    marge = marge || 60;
    return { x:ARENA.rand + marge + toeval() * (ARENA.b - 2 * ARENA.rand - 2 * marge),
             y:ARENA.rand + marge + toeval() * (ARENA.h - 2 * ARENA.rand - 2 * marge) };
  }
  function eenSpeler(levend){ return levend[Math.floor(toeval() * levend.length)] || W.spelers[0]; }
  function zetAanval(soort, b, levend, k){
    var i, n, p, hoek, doel, A = W.aanvallen, ronde = W.ronde;
    zeg('aanval', soort, k, b);
    if (soort === 'cirkel'){
      levend.forEach(function(P){ A.push({ id:++W.nr, soort:'cirkel', x:P.sp.x, y:P.sp.y, t:0, k:k }); });
      n = AANVAL.cirkel.extra(ronde);
      for (i = 0; i < n; i++){ p = vrijPunt(); A.push({ id:++W.nr, soort:'cirkel', x:p.x, y:p.y, t:0, k:k }); }
    } else if (soort === 'laser' || soort === 'wijzers'){
      var w = soort === 'wijzers' ? AANVAL.wijzers : AANVAL.laser;
      doel = eenSpeler(levend);
      hoek = Math.atan2(doel.sp.y - b.y, doel.sp.x - b.x) - (soort === 'wijzers' ? 0 : AANVAL.laser.boog * 0.35);
      var richting = toeval() < 0.5 ? 1 : -1;
      n = soort === 'wijzers' ? 2 : AANVAL.laser.stralen(ronde);
      for (i = 0; i < n; i++){
        A.push({ id:++W.nr, soort:'laser', x:b.x, y:b.y, r0:b.r, t:0, k:k, richting:richting,
          hoek:hoek + i * Math.PI * 2 / n,
          boog: soort === 'wijzers' ? Math.PI * 2 : AANVAL.laser.boog,
          duur:w.duur, breed:w.breed, schade:w.schade });
      }
    } else if (soort === 'golf'){
      n = AANVAL.golf.ringen(ronde);
      for (i = 0; i < n; i++) A.push({ id:++W.nr, soort:'golf', x:b.x, y:b.y, r0:b.r, t:-i * 0.55, k:k });
    } else if (soort === 'plas'){
      doel = eenSpeler(levend);
      A.push({ id:++W.nr, soort:'plas', x:doel.sp.x, y:doel.sp.y, t:0, k:k });
      n = AANVAL.plas.aantal(ronde) - 1;
      for (i = 0; i < n; i++){ p = vrijPunt(70); A.push({ id:++W.nr, soort:'plas', x:p.x, y:p.y, t:-i * 0.12, k:k }); }
    } else if (soort === 'kegel'){
      doel = eenSpeler(levend);
      hoek = Math.atan2(doel.sp.y - b.y, doel.sp.x - b.x);
      A.push({ id:++W.nr, soort:'kegel', x:b.x, y:b.y, hoek:hoek, t:0, k:k });
      if (ronde >= 18) A.push({ id:++W.nr, soort:'kegel', x:b.x, y:b.y, hoek:hoek + Math.PI, t:-0.4, k:k });
    } else if (soort === 'baan'){
      hoek = toeval() * Math.PI;
      n = AANVAL.baan.aantal(ronde);
      var mid = vrijPunt(0), stap2 = 200;
      for (i = 0; i < n; i++){
        var af = (i - (n - 1) / 2) * stap2;
        A.push({ id:++W.nr, soort:'baan', hoek:hoek, t:-i * 0.1, k:k, kl:b.def.kleur,
          x:mid.x + Math.cos(hoek + Math.PI / 2) * af, y:mid.y + Math.sin(hoek + Math.PI / 2) * af });
      }
    } else if (soort === 'kruis'){
      p = eenSpeler(levend).sp; hoek = toeval() * Math.PI;
      A.push({ id:++W.nr, soort:'baan', x:p.x, y:p.y, hoek:hoek, t:0, k:k, breed:AANVAL.kruis.breed, kl:b.def.kleur });
      A.push({ id:++W.nr, soort:'baan', x:p.x, y:p.y, hoek:hoek + Math.PI / 2, t:0, k:k, breed:AANVAL.kruis.breed, kl:b.def.kleur });
    } else if (soort === 'kogel'){
      n = AANVAL.kogel.aantal(ronde);
      var draai = toeval() * Math.PI * 2;
      for (i = 0; i < n; i++){
        var h2 = draai + i * Math.PI * 2 / n;
        A.push({ id:++W.nr, soort:'kogel', x:b.x, y:b.y, hoek:h2, t:0, k:k, kl:b.def.kleur });
      }
    } else if (soort === 'tik'){
      var start = Math.floor(toeval() * AANVAL.tik.aantal), om = toeval() < 0.5 ? 1 : -1;
      for (i = 0; i < AANVAL.tik.aantal; i++){
        var h3 = (start + om * i) * Math.PI * 2 / AANVAL.tik.aantal;
        A.push({ id:++W.nr, soort:'tik', t:-i * AANVAL.tik.na, k:k,
          x:b.x + Math.cos(h3) * AANVAL.tik.ring, y:b.y + Math.sin(h3) * AANVAL.tik.ring });
      }
    } else if (soort === 'regen'){
      var rg = AANVAL.regen; n = rg.aantal(ronde);
      for (i = 0; i < n; i++){
        p = i === n - 1 ? eenSpeler(levend).sp : vrijPunt(40);
        A.push({ id:++W.nr, soort:'cirkel', x:p.x, y:p.y, t:-i * rg.na, k:k, straal:rg.r });
      }
    } else if (soort === 'muur'){
      var kant = Math.floor(toeval() * 4);
      A.push({ id:++W.nr, soort:'muur', x:b.x, y:b.y, hoek:kant * Math.PI / 2, gat:0.15 + toeval() * 0.7, t:0, k:k, kl:b.def.kleur });
      if (ronde >= 15) A.push({ id:++W.nr, soort:'muur', x:b.x, y:b.y, hoek:((kant + 2) % 4) * Math.PI / 2, gat:0.15 + toeval() * 0.7, t:-0.6, k:k, kl:b.def.kleur });
    } else if (soort === 'spiraal'){
      var spi = AANVAL.spiraal, start2 = toeval() * Math.PI * 2, om2 = toeval() < 0.5 ? 1 : -1;
      n = spi.aantal(ronde);
      for (i = 0; i < n; i++) A.push({ id:++W.nr, soort:'kogel', x:b.x, y:b.y, hoek:start2 + om2 * i * spi.draai, t:-i * spi.na, k:k, kl:b.def.kleur });
    } else if (soort === 'bom'){
      var bo = AANVAL.bom; n = bo.aantal(ronde);
      for (i = 0; i < n; i++){
        doel = eenSpeler(levend);
        hoek = Math.atan2(doel.sp.y - b.y, doel.sp.x - b.x) + (i ? (toeval() - 0.5) * 1.2 : 0);
        A.push({ id:++W.nr, soort:'bom', x:b.x, y:b.y, hoek:hoek, t:-i * 0.5, k:k, kl:b.def.kleur });
      }
    } else if (soort === 'krimp'){
      A.push({ id:++W.nr, soort:'krimp', x:b.x, y:b.y, r0:b.r, t:0, k:k, gat:toeval() * Math.PI * 2 });
    }
  }
  function wachtVan(a, basis){ return basis * (a.k || 1); }
  /* hoe lang een aanval in totaal loopt, zodat de volgende er niet doorheen valt */
  function duurVan(soort){
    var A = AANVAL;
    if (soort === 'laser') return A.laser.wacht + A.laser.duur;
    if (soort === 'wijzers') return A.wijzers.wacht + A.wijzers.duur;
    if (soort === 'golf') return A.golf.wacht + A.golf.duur + (A.golf.ringen(W.ronde) - 1) * 0.55;
    if (soort === 'plas') return A.plas.wacht + 1.6;
    if (soort === 'kegel') return A.kegel.wacht + A.kegel.knal + 0.4;
    if (soort === 'baan') return A.baan.wacht + A.baan.knal + 0.3;
    if (soort === 'kruis') return A.kruis.wacht + A.kruis.knal + 0.3;
    if (soort === 'kogel') return 1.6;
    if (soort === 'tik') return A.tik.wacht + A.tik.na * A.tik.aantal;
    if (soort === 'krimp') return A.krimp.wacht + A.krimp.duur;
    if (soort === 'regen') return A.cirkel.wacht + A.regen.na * A.regen.aantal(W.ronde) + 0.3;
    if (soort === 'muur') return A.muur.wacht + A.muur.duur + (W.ronde >= 15 ? 0.6 : 0);
    if (soort === 'spiraal') return A.spiraal.na * A.spiraal.aantal(W.ronde) + 1;
    if (soort === 'bom') return 0.5 * (A.bom.aantal(W.ronde) - 1) + A.bom.duur + 1.2;
    return A.cirkel.wacht + A.cirkel.knal;
  }
  /* een speler wordt getroffen door een aanval */
  function tref(P, schade, kleur){
    var s2 = P.sp;
    if (s2.raak > 0 || P.neer) return;
    var klap = Math.round(schade * P.stats.pantser * (1 + W.ronde * 0.03));
    P.hp -= klap; s2.raak = RAAKPAUZE; s2.flits = 0.25;
    W.cijfers.push({ x:s2.x, y:s2.y - 26, tekst:'-' + klap, leven:0.9, kleur:kleur || '#c0442c' });
    if (P.hp <= 0){ P.hp = 0; valNeer(P); }
  }
  function stapAanvallen(dt, levend){
    W.aanvallen.forEach(function(a){
      a.t += dt;
      if (a.soort === 'cirkel'){
        var c = AANVAL.cirkel, cW = wachtVan(a, c.wacht);
        if (a.t >= cW && !a.geknald){
          a.geknald = true;
          levend.forEach(function(P){ if (Math.hypot(P.sp.x - a.x, P.sp.y - a.y) < (a.straal || c.r) + SPELER.r * 0.5) tref(P, c.schade, '#c0442c'); });
          for (var i = 0; i < 10; i++){ var hk = toeval() * Math.PI * 2, sn = 60 + toeval() * 120; W.pluis.push({ x:a.x, y:a.y, vx:Math.cos(hk) * sn, vy:Math.sin(hk) * sn, leven:0.4, kleur:'#EA9836' }); }
        }
        if (a.t >= cW + c.knal) a.klaar = true;
      } else if (a.soort === 'laser'){
        var l = AANVAL.laser, lW = wachtVan(a, l.wacht);
        var lDuur = a.duur || l.duur, lBoog = a.boog || l.boog, lBreed = a.breed || l.breed, lSch = a.schade || l.schade;
        if (a.t >= lW){
          var deel = Math.min(1, (a.t - lW) / lDuur);
          a.nu = a.hoek + a.richting * lBoog * deel;
          var cx = Math.cos(a.nu), cy = Math.sin(a.nu);
          levend.forEach(function(P){
            var px = P.sp.x - a.x, py = P.sp.y - a.y, langs = px * cx + py * cy;
            if (langs < (a.r0 || 46)) return;                 /* achter de baas is het veilig */
            var dwars = Math.abs(-px * cy + py * cx);
            if (dwars < lBreed / 2 + SPELER.r * 0.7) tref(P, lSch, '#F26749');
          });
          if (deel >= 1) a.klaar = true;
        } else a.nu = a.hoek;
      } else if (a.soort === 'golf'){
        var g = AANVAL.golf, gW = wachtVan(a, g.wacht), r0 = a.r0 || 46;
        if (a.t >= gW){
          var deel2 = Math.min(1, (a.t - gW) / g.duur);
          a.straal = r0 + deel2 * (g.tot - r0);
          levend.forEach(function(P){
            var d = Math.hypot(P.sp.x - a.x, P.sp.y - a.y);
            if (Math.abs(d - a.straal) < g.band / 2 + SPELER.r * 0.7) tref(P, g.schade, '#6b3fa0');
          });
          if (deel2 >= 1) a.klaar = true;
        }
      } else if (a.soort === 'plas'){
        var pl = AANVAL.plas, pW = wachtVan(a, pl.wacht);
        if (a.t >= pW){
          if (!a.neer){
            a.neer = true;
            for (var q = 0; q < 8; q++){ var qh = toeval() * Math.PI * 2, qs = 40 + toeval() * 70; W.pluis.push({ x:a.x, y:a.y, vx:Math.cos(qh) * qs, vy:Math.sin(qh) * qs, leven:0.4, kleur:'#1b3a8f' }); }
          }
          levend.forEach(function(P){ if (Math.hypot(P.sp.x - a.x, P.sp.y - a.y) < pl.r) tref(P, pl.schade, '#1b3a8f'); });
          if (a.t >= pW + pl.duur) a.klaar = true;
        }
      } else if (a.soort === 'kegel'){
        var ke = AANVAL.kegel, keW = wachtVan(a, ke.wacht);
        if (a.t >= keW && !a.geknald){
          a.geknald = true;
          levend.forEach(function(P){
            var dx2 = P.sp.x - a.x, dy2 = P.sp.y - a.y, af2 = Math.hypot(dx2, dy2);
            if (af2 > ke.ver) return;
            var v = Math.atan2(Math.sin(Math.atan2(dy2, dx2) - a.hoek), Math.cos(Math.atan2(dy2, dx2) - a.hoek));
            if (Math.abs(v) <= ke.wijd) tref(P, ke.schade, '#1b3a8f');
          });
        }
        if (a.t >= keW + ke.knal) a.klaar = true;
      } else if (a.soort === 'baan'){
        var ba = AANVAL.baan, baW = wachtVan(a, ba.wacht), breed = a.breed || ba.breed;
        if (a.t >= baW && !a.geknald){
          a.geknald = true;
          var bx = Math.cos(a.hoek), by = Math.sin(a.hoek);
          levend.forEach(function(P){
            var px2 = P.sp.x - a.x, py2 = P.sp.y - a.y;
            if (Math.abs(-px2 * by + py2 * bx) < breed / 2 + SPELER.r * 0.6) tref(P, ba.schade, a.kl || '#c0442c');
          });
        }
        if (a.t >= baW + ba.knal) a.klaar = true;
      } else if (a.soort === 'tik'){
        var ti = AANVAL.tik, tiW = wachtVan(a, ti.wacht);
        if (a.t >= tiW && !a.geknald){
          a.geknald = true;
          levend.forEach(function(P){ if (Math.hypot(P.sp.x - a.x, P.sp.y - a.y) < ti.r + SPELER.r * 0.5) tref(P, ti.schade, '#6b3fa0'); });
        }
        if (a.t >= tiW + ti.knal) a.klaar = true;
      } else if (a.soort === 'kogel'){
        var ko = AANVAL.kogel;
        if (a.t >= 0){
          a.x += Math.cos(a.hoek) * ko.snel * dt; a.y += Math.sin(a.hoek) * ko.snel * dt;
          levend.forEach(function(P){ if (Math.hypot(P.sp.x - a.x, P.sp.y - a.y) < ko.r + SPELER.r * 0.8) { tref(P, ko.schade, a.kl || '#8a7350'); a.klaar = true; } });
          if (a.t > ko.leven || a.x < -40 || a.x > ARENA.b + 40 || a.y < -40 || a.y > ARENA.h + 40) a.klaar = true;
        }
      } else if (a.soort === 'schot'){
        var sc = AANVAL.schot, scW = wachtVan(a, sc.wacht);
        if (a.t >= scW){
          a.x += Math.cos(a.hoek) * sc.snel * dt; a.y += Math.sin(a.hoek) * sc.snel * dt;
          levend.forEach(function(P2){
            if (Math.hypot(P2.sp.x - a.x, P2.sp.y - a.y) < sc.r + SPELER.r * 0.8){ tref(P2, sc.schade, a.kl || '#2f7d52'); a.klaar = true; }
          });
          if (a.t > scW + sc.leven || a.x < -40 || a.x > ARENA.b + 40 || a.y < -40 || a.y > ARENA.h + 40) a.klaar = true;
        }
      } else if (a.soort === 'muur'){
        var mu = AANVAL.muur, ms = muurStand(a);
        if (a.t >= ms.wacht){
          levend.forEach(function(P){
            var langs = ms.langsX ? P.sp.x : P.sp.y, dwars2 = ms.langsX ? P.sp.y : P.sp.x;
            if (Math.abs(langs - ms.pos) < mu.breed / 2 + SPELER.r * 0.6 && Math.abs(dwars2 - ms.gatMidden) > ms.gatBreed / 2 - SPELER.r * 0.3) tref(P, mu.schade, a.kl || '#c0442c');
          });
          if (ms.deel >= 1) a.klaar = true;
        }
      } else if (a.soort === 'bom'){
        var bo = AANVAL.bom;
        if (a.t >= 0){
          a.x += Math.cos(a.hoek) * bo.snel * dt; a.y += Math.sin(a.hoek) * bo.snel * dt;
          var knalt = a.t >= bo.duur;
          levend.forEach(function(P){ if (Math.hypot(P.sp.x - a.x, P.sp.y - a.y) < bo.r + SPELER.r * 0.8){ tref(P, bo.schade, a.kl || '#8a7350'); knalt = true; } });
          if (knalt){
            /* uiteen in scherven: propjes naar alle kanten */
            a.klaar = true;
            var h0 = toeval() * Math.PI * 2;
            for (var si = 0; si < bo.scherven; si++) W.aanvallen.push({ id:++W.nr, soort:'kogel', x:a.x, y:a.y, hoek:h0 + si * Math.PI * 2 / bo.scherven, t:0, k:a.k, kl:a.kl });
            for (var pi2 = 0; pi2 < 12; pi2++){ var hk2 = toeval() * Math.PI * 2, sn2 = 80 + toeval() * 140; W.pluis.push({ x:a.x, y:a.y, vx:Math.cos(hk2) * sn2, vy:Math.sin(hk2) * sn2, leven:0.45, kleur:a.kl || '#8a7350' }); }
          }
        }
      } else if (a.soort === 'krimp'){
        var kr = AANVAL.krimp, krW = wachtVan(a, kr.wacht), rEind = (a.r0 || 46) + 18;
        if (a.t >= krW){
          var deel3 = Math.min(1, (a.t - krW) / kr.duur);
          a.straal = kr.van - deel3 * (kr.van - rEind);
          levend.forEach(function(P){
            var dx3 = P.sp.x - a.x, dy3 = P.sp.y - a.y, d3 = Math.hypot(dx3, dy3);
            if (Math.abs(d3 - a.straal) >= kr.band / 2 + SPELER.r * 0.7) return;
            var vh = Math.atan2(Math.sin(Math.atan2(dy3, dx3) - a.gat), Math.cos(Math.atan2(dy3, dx3) - a.gat));
            if (Math.abs(vh) > kr.gat / 2) tref(P, kr.schade, '#6b3fa0');
          });
          if (deel3 >= 1) a.klaar = true;
        }
      }
    });
    W.aanvallen = W.aanvallen.filter(function(a){ return !a.klaar; });
  }

  /* ---------- de spelers ---------- */
  function beweeg(P, dt){
    var s = P.sp;
    if (P.neer){ s.loopt = false; return; }
    var dx = P.inv.dx, dy = P.inv.dy;
    if (dx || dy){
      s.x += dx * P.stats.snel * dt; s.y += dy * P.stats.snel * dt;
      s.loopt = true; s.dx = dx; s.dy = dy;            /* de laatste looprichting, voor het ontwijken */
    } else s.loopt = false;
    if (P.dashVraag){ P.dashVraag = false; ontwijkMet(s); }
    if (P.wapenVraag){ P.wapenVraag = false; wisselWapenVan(s); }
    if (s.dashKlok > 0) s.dashKlok -= dt;
    if (s.dash > 0){
      s.dash -= dt;
      s.x += s.dx * DASH.snel * dt; s.y += s.dy * DASH.snel * dt;
      W.pluis.push({ x:s.x - s.dx * 10, y:s.y - s.dy * 10, vx:-s.dx * 30, vy:-s.dy * 30, leven:0.3, kleur:'#83A5F2' });
    }
    s.x = Math.max(ARENA.rand, Math.min(ARENA.b - ARENA.rand, s.x));
    s.y = Math.max(ARENA.rand, Math.min(ARENA.h - ARENA.rand, s.y));
    if (s.raak > 0) s.raak -= dt;
    if (s.flits > 0) s.flits -= dt;
  }
  function wapens(P, dt){
    var s = P.sp;
    if (P.neer) return;
    var metBoog = s.wapen === 'boog';
    s.klok -= dt;
    if (s.zwaai > 0) s.zwaai -= dt;
    var dichtst = null, da = 1e9;
    W.fouten.forEach(function(f){ var d = Math.hypot(f.x - s.x, f.y - s.y); if (d < da){ da = d; dichtst = f; } });
    if (dichtst){
      var wil = Math.atan2(dichtst.y - s.y, dichtst.x - s.x);
      var verschil = Math.atan2(Math.sin(wil - s.mikt), Math.cos(wil - s.mikt));
      s.mikt += verschil * Math.min(1, dt * 12);
    }
    if (metBoog){
      var bBer = P.stats.boogBereik || SPELER.pijlboog.bereik;
      if (dichtst && da <= bBer + dichtst.r && s.klok <= 0){
        s.klok = P.stats.boogTempo || (P.stats.tempo * SPELER.pijlboog.tempo);
        s.zwaai = 0.12;
        var hp2 = Math.atan2(dichtst.y - s.y, dichtst.x - s.x);
        W.messen.push({ id:++W.nr, x:s.x, y:s.y, vx:Math.cos(hp2) * SPELER.pijlboog.snel, vy:Math.sin(hp2) * SPELER.pijlboog.snel,
                        leven:1.1, hoek:hp2, schade:P.stats.boogSchade || (P.stats.schade * SPELER.pijlboog.deel),
                        draai:0, van:P, pijl:1 });
      }
    } else if (dichtst && da <= P.stats.bereik + dichtst.r && s.klok <= 0){
      s.klok = P.stats.tempo; s.zwaai = 0.18;
      var halveBoog = SPELER.boog / 2 * Math.PI / 180, ber = P.stats.bereik, sch = P.stats.schade;
      W.fouten.forEach(function(f){
        var d = Math.hypot(f.x - s.x, f.y - s.y);
        if (d > ber + f.r) return;
        var hoek = Math.atan2(f.y - s.y, f.x - s.x);
        var af = Math.atan2(Math.sin(hoek - s.mikt), Math.cos(hoek - s.mikt));
        if (Math.abs(af) <= halveBoog) raak(f, sch, s, P);
      });
    }
    /* het werpmes: naar de verste fout, vanzelf */
    if (P.stats.mesTempo > 0){
      s.mesKlok -= dt;
      if (s.mesKlok <= 0 && W.fouten.length){
        s.mesKlok = P.stats.mesTempo;
        var verst = null, dv = -1;
        W.fouten.forEach(function(f){ var d = Math.hypot(f.x - s.x, f.y - s.y); if (d > dv){ dv = d; verst = f; } });
        var hk = Math.atan2(verst.y - s.y, verst.x - s.x);
        W.messen.push({ id:++W.nr, x:s.x, y:s.y, vx:Math.cos(hk) * 520, vy:Math.sin(hk) * 520, leven:1.2, hoek:hk, schade:P.stats.mesSchade, draai:0, van:P });
      }
    }
  }
  /* Een speler gaat neer. Alleen is dat het einde. Samen blijft hij liggen
     tot de volgende ronde, en pas als iedereen ligt is het voorbij. */
  function valNeer(P){
    if (!samen){ einde(); return; }
    P.neer = true;
    W.cijfers.push({ x:P.sp.x, y:P.sp.y - 40, tekst:P.naam + ' ligt neer', leven:1.6, kleur:'#14224C' });
    zeg('neer', P);
    if (W.spelers.every(function(Q){ return Q.neer; })) einde();
  }
  function einde(){
    if (W.fase === 'einde') return;
    W.fase = 'einde';
    zeg('einde');
  }
  function raak(f, schade, vanaf, P){
    var echt = Math.round(schade * (f.schild ? 1 - f.schild : 1));
    f.hp -= echt; f.flits = 0.15;
    W.cijfers.push({ x:f.x, y:f.y - f.r - 8, tekst:'-' + echt, leven:0.7, kleur:'#14224C' });
    if (vanaf && !f.baas){ var h = Math.atan2(f.y - vanaf.y, f.x - vanaf.x); f.x += Math.cos(h) * 18; f.y += Math.sin(h) * 18; }
    if (f.hp <= 0){
      if (P) P.geveld++; W.geveld++;
      if (f.baas){
        W.aanvallen = [];
        W.cijfers.push({ x:f.x, y:f.y - f.r - 20, tekst:(f.def ? f.def.naam : 'De baas') + ' is geveld', leven:2.2, kleur:(f.def ? f.def.kleur : '#4a1230') });
        for (var b2 = 0; b2 < 22; b2++){
          var bh = toeval() * Math.PI * 2, bs = 60 + toeval() * 160;
          W.pluis.push({ x:f.x, y:f.y, vx:Math.cos(bh) * bs, vy:Math.sin(bh) * bs, leven:0.7, kleur:b2 % 2 ? (f.def ? f.def.kleur : '#4a1230') : '#FFE168' });
        }
      }
      for (var i = 0; i < 7; i++){
        var hk = toeval() * Math.PI * 2, sn = 40 + toeval() * 90;
        W.pluis.push({ x:f.x, y:f.y, vx:Math.cos(hk) * sn, vy:Math.sin(hk) * sn, leven:0.45, kleur:f.soort.kleur });
      }
      if (f.baas || toeval() < MUNT_VAL){
        W.munt.push({ id:++W.nr, x:f.x, y:f.y, waarde:f.baas ? 25 + W.ronde * 3 : 2 + Math.floor(W.ronde / 3), leven:12 });
      }
    }
  }

  /* ---------- een stap van de klok ---------- */
  function deeltjes(dt){
    W.pluis.forEach(function(p){ p.leven -= dt; p.x += p.vx * dt; p.y += p.vy * dt; });
    W.pluis = W.pluis.filter(function(p){ return p.leven > 0; });
    W.cijfers.forEach(function(c){ c.leven -= dt; c.y -= 30 * dt; });
    W.cijfers = W.cijfers.filter(function(c){ return c.leven > 0; });
  }
  W.stap = function(dt){
    if (W.fase !== 'ronde' || W.pauze){ deeltjes(dt); return; }
    var ronde = W.ronde;
    W.tijdInRonde += dt;
    var spelers = W.spelers;
    spelers.forEach(function(P){ beweeg(P, dt); });

    /* spawnen; met twee in de arena komen ze sneller */
    if (W.teSpawnen > 0){
      W.spawnKlok -= dt;
      if (W.spawnKlok <= 0){
        spawn(kiesFout()); W.teSpawnen -= 1;
        W.spawnKlok = Math.max(0.25, 1.1 - ronde * 0.04) / (spelers.length > 1 ? 1.1 + 0.3 * spelers.length : 1);
      }
    }

    var levend = levenden();
    /* de baas staat in het midden en valt met tussenpozen aan */
    W.fouten.forEach(function(b){
      if (!b.baas) return;
      b.x = ARENA.b / 2; b.y = ARENA.h / 2;
      b.aanvalKlok -= dt;
      var boos = b.hp <= b.maxHp / 2;
      /* kwaad wacht hij niet tot de vorige aanval klaar is */
      var vrij = boos || !W.aanvallen.some(function(a){ return a.soort !== 'plas' && a.soort !== 'schot'; });
      if (b.aanvalKlok <= 0 && vrij && levend.length){
        if (boos && !b.boosGeweest){
          b.boosGeweest = true;
          W.cijfers.push({ x:b.x, y:b.y - b.r - 16, tekst:b.def.naam + ' wordt kwaad', leven:2, kleur:b.def.kleur });
        }
        baasValtAan(b, levend, boos);
        b.aanvalKlok = AANVAL.pauze(ronde) * (boos ? AANVAL.boosPauze : 1) + duurVan(b.def.aanvallen[b.laatste]) * (boos ? AANVAL.boosOverlap : 1);
      }
    });
    stapAanvallen(dt, levend);
    if (W.fase !== 'ronde') return;
    W.fouten.forEach(function(f){
      var doel = null, dl = 1e9;
      levend.forEach(function(P){ var d = Math.hypot(P.sp.x - f.x, P.sp.y - f.y); if (d < dl){ dl = d; doel = P; } });
      var vx = 0, vy = 0;
      if (doel && !f.baas){
        var ax = doel.sp.x - f.x, ay = doel.sp.y - f.y, al = Math.hypot(ax, ay) || 1;
        var wil = 1;
        /* Een schutter die mikt, en een schutter wiens streep nog op de grond
           ligt, staat stil. Dan is de streep ook echt waar het schot vandaan komt. */
        if (f.stilKlok > 0) f.stilKlok -= dt;
        var stil = !!f.soort.laden && (f.laadKlok <= f.soort.mik || f.stilKlok > 0);
        if (f.soort.afstand){
          wil = stil ? 0 : al > f.soort.afstand + 40 ? 1 : al < f.soort.afstand - 40 ? -0.9 : 0;
          if (!wil && !stil){ vx = -ay / al * f.snel * 0.55 * f.zij; vy = ax / al * f.snel * 0.55 * f.zij; }
        }
        vx += ax / al * f.snel * wil; vy += ay / al * f.snel * wil;
        if (f.soort.laden){
          var wilHoek = Math.atan2(ay, ax);
          f.mikt += Math.atan2(Math.sin(wilHoek - f.mikt), Math.cos(wilHoek - f.mikt)) * Math.min(1, dt * 4);
          f.laadKlok -= dt;
          if (f.laadKlok <= 0){
            f.laadKlok = f.soort.laden;
            f.stilKlok = AANVAL.schot.wacht;
            W.aanvallen.push({ id:++W.nr, soort:'schot', x:f.x, y:f.y, hoek:f.mikt, t:0, k:1, kl:f.soort.kleur });
          }
        }
      }
      W.fouten.forEach(function(g2){
        if (g2 === f) return;
        var gx = f.x - g2.x, gy = f.y - g2.y, gl = Math.hypot(gx, gy);
        var min = f.r + g2.r;
        if (gl > 0 && gl < min){ vx += gx / gl * (min - gl) * 6; vy += gy / gl * (min - gl) * 6; }
      });
      if (!f.baas){
        f.x += vx * dt; f.y += vy * dt;
        if (f.soort.afstand){
          if (!f.binnen && f.x > ARENA.rand && f.x < ARENA.b - ARENA.rand && f.y > ARENA.rand && f.y < ARENA.h - ARENA.rand) f.binnen = 1;
          if (f.binnen){
            f.x = Math.max(ARENA.rand, Math.min(ARENA.b - ARENA.rand, f.x));
            f.y = Math.max(ARENA.rand, Math.min(ARENA.h - ARENA.rand, f.y));
          }
        }
      }
      if (f.flits > 0) f.flits -= dt;
      f.slaKlok -= dt;
      levend.forEach(function(P){
        var s2 = P.sp;
        if (Math.hypot(s2.x - f.x, s2.y - f.y) < f.r + SPELER.r + 2 && s2.raak <= 0 && f.slaKlok <= 0){
          var klap = Math.round(f.soort.schade * P.stats.pantser * (1 + ronde * 0.03));
          P.hp -= klap; s2.raak = RAAKPAUZE; s2.flits = 0.25; f.slaKlok = 0.6;
          W.cijfers.push({ x:s2.x, y:s2.y - 26, tekst:'-' + klap, leven:0.9, kleur:'#c0442c' });
          if (P.hp <= 0){ P.hp = 0; valNeer(P); }
        }
      });
    });
    if (W.fase !== 'ronde') return;      /* het spel is net afgelopen */

    spelers.forEach(function(P){ wapens(P, dt); });
    W.messen.forEach(function(m){
      m.x += m.vx * dt; m.y += m.vy * dt; m.leven -= dt; m.draai += dt * 20;
      W.fouten.forEach(function(f){
        if (m.leven <= 0) return;
        if (Math.hypot(f.x - m.x, f.y - m.y) < f.r + 6){ raak(f, m.schade, null, m.van); m.leven = 0; }
      });
    });
    W.messen = W.messen.filter(function(m){ return m.leven > 0 && m.x > -30 && m.x < ARENA.b + 30 && m.y > -30 && m.y < ARENA.h + 30; });

    /* munten oprapen: wie erover loopt krijgt hem */
    W.munt.forEach(function(m){
      m.leven -= dt;
      levend.forEach(function(P){
        if (m.leven > 0 && Math.hypot(m.x - P.sp.x, m.y - P.sp.y) < SPELER.r + 14){
          P.munten += m.waarde; m.leven = 0;
          W.cijfers.push({ x:m.x, y:m.y - 10, tekst:'+' + m.waarde, leven:0.8, kleur:'#c9971f' });
        }
      });
    });
    W.munt = W.munt.filter(function(m){ return m.leven > 0; });
    deeltjes(dt);

    /* opruimen en de ronde afsluiten */
    W.fouten = W.fouten.filter(function(f){ return f.hp > 0; });
    if (W.teSpawnen <= 0 && !W.fouten.length && W.fase === 'ronde'){
      if (W.munt.length && W.rondeUit < RAAPTIJD){
        W.rondeUit += dt;
        var nog = Math.max(0, Math.ceil(RAAPTIJD - W.rondeUit));
        if (nog !== W.raapTeller){ W.raapTeller = nog; zeg('rapen', nog); }
      } else naarVragen();
    }
  };

  /* ---------- de stand over de lijn ---------- */
  function inpak(P){
    var s2 = P.sp;
    return [r1(s2.x), r1(s2.y), r2(s2.mikt), r2(s2.zwaai), r2(s2.raak), r2(s2.dash), r2(s2.dx), r2(s2.dy), s2.loopt ? 1 : 0, r2(s2.flits),
            Math.round(P.hp), Math.round(P.maxHp), P.stats.harnas, P.neer ? 1 : 0, Math.round(P.stats.bereik), r2(s2.dashKlok), s2.wapen === 'boog' ? 1 : 0,
            P.munten, P.geveld, P.inNr, P.klaar ? 1 : 0];
  }
  W.pakket = function(){
    return { k:'st', f:W.fase, r:W.ronde, ts:W.teSpawnen, t:r2(W.tijdInRonde), p:W.pauze ? 1 : 0,
      sp:W.spelers.map(inpak),
      fo:W.fouten.map(function(f){ return [r1(f.x), r1(f.y), Math.round(f.hp), f.maxHp, f.baas ? 'b:' + f.def.id : f.soort.id, f.r, f.flits > 0 ? 0.1 : 0, r2(f.stap), f.schild || 0, r2(f.mikt || 0), f.id]; }),
      me:W.messen.map(function(m){ return [r1(m.x), r1(m.y), r2(m.hoek), m.pijl ? 1 : 0, m.id]; }),
      mu:W.munt.map(function(m){ return [r1(m.x), r1(m.y), m.waarde, m.id]; }),
      ci:W.cijfers.map(function(c){ return [r1(c.x), r1(c.y), c.tekst, c.kleur, r2(c.leven)]; }),
      aa:W.aanvallen.map(function(a){ return [a.soort, r1(a.x), r1(a.y), r2(a.t), r2(a.hoek || 0), a.richting || 1, r2(a.nu || 0), r1(a.straal || 0), a.geknald ? 1 : 0, r2(a.k || 1), r2(a.gat || 0), a.breed || 0, r2(a.boog || 0), r2(a.duur || 0), a.r0 || 0, a.kl || '', a.id]; }) };
  };

  W.FOUTEN = FOUTEN; W.BAZEN = BAZEN;
  return W;
}

g.ZWAARDMOTOR = { maak:maak, ARENA:ARENA, SPELER:SPELER, DASH:DASH, FOUTEN:FOUTEN, BAZEN:BAZEN, AANVAL:AANVAL, BAASRONDE:BAASRONDE, muurStand:muurStand,
                  MUNT_VAL:MUNT_VAL, RAAKPAUZE:RAAKPAUZE, RAAPTIJD:RAAPTIJD, aantalInRonde:aantalInRonde, foutHp:foutHp, baasVan:baasVan, basisStats:basisStats, nieuweSp:nieuweSp };
})(typeof globalThis !== 'undefined' ? globalThis : this);
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.ZWAARDMOTOR;
