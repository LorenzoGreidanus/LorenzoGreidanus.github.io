/* De motor van De stad: alles wat rekent en niets wat tekent.

   Dezelfde motor draait op twee plekken, net als die van Zwaardvechter. Wie
   alleen oefent heeft hem in zijn eigen browser. Wie meedoet aan een potje
   heeft hem in de spelkamer op de server: die tikt en stuurt de stand terug.

   Wat hierin zit: de wereld met zijn muren, de spelers, de
   kisten, de buit die op de grond ligt, het schieten, en de plekken waar je
   eruit kunt stappen. Wat er niet in zit: vragen, tekenen, toetsen. De vragen
   horen bij de pagina, precies zoals bij de andere spellen; de motor weet
   alleen dat een kist op slot zit en dat iemand hem open meldt.

   Het grote verschil met de andere motoren is het pakket. Daar krijgt
   iedereen dezelfde stand, en daarom passen er vier spelers in een arena.
   Hier is de wereld te groot om helemaal door de lijn te duwen, dus krijgt
   elke speler alleen wat er in zijn buurt staat: pakketVoor(i). Dat kost meer
   rekenwerk op de server maar houdt de pakketten klein, en dat is wat bepaalt
   hoeveel mensen er tegelijk in kunnen.

   Gebruik:
     var W = STADMOTOR.maak({ seed:123, spelers:[{ naam:'jij' }], haak:{ ... } });
     W.zetInvoer(i, dx, dy, mx, my);   lopen (-1..1) en waar je heen mikt
     W.schiet(i, aan);                 de trekker vast of los
     W.gebruik(i);                     oprapen, een kist proberen, extractie starten
     W.stap(dt);                       een stap van de klok
     W.pakketVoor(i);                  wat speler i mag zien

   Dit bestand laadt als gewoon script in de browser (STADMOTOR op window)
   en als module op de server (module.exports). */
(function(g){
'use strict';

/* ---------- de wereld ---------- */
var WERELD = { b: 3200, h: 2200 };
var KIJK = { b: 980, h: 620 };          /* wat een speler ongeveer ziet; het pakket gaat iets ruimer */
var RAND = 60;                          /* zoveel blijft er vrij langs de kant van de wereld */
/* De maten van de stad: hoe breed een straat is en hoe groot een huizenblok.
   Vier kolommen en drie rijen passen er precies in, met een straat rondom. */
var STAD = { straat: 160, blokB: 600, blokH: 520 };

var SPELER = {
  r: 15, snel: 205, hp: 100,
  neerTijd: 0,                          /* wie neer is blijft liggen tot de vragen goed zijn */
  raakPauze: 0.45,                      /* zo lang ben je onraakbaar na een klap */
  rapen: 46                             /* tot zover kun je iets oppakken */
};

/* De wapens staan in wapens.js, want de winkel en de server moeten dezelfde
   lijst kennen: die rekent de prijs af en weigert een uitrusting met een wapen
   dat je niet gekocht hebt. In de browser laadt wapens.js als script voor dit
   bestand; op de server importeert server/stad.js hem eerst. */
function kast(){
  var k = g.WAPENS;
  if (!k || !k.LIJST) throw new Error('stad-motor: wapens.js moet eerder geladen zijn');
  return k;
}
function wapenVan(id){
  var w = kast().vind(id);
  return w || kast().vind(kast().STANDAARD.hoofd);
}

/* Wat er in een kist kan zitten. waarde telt mee voor wat je meeneemt als je
   het veld uit komt; dat is waar het om draait. */
var BUIT = [
  { id:'pistool',  naam:'Pistool',        soort:'wapen', waarde:20,  kans:18 },
  { id:'revolver', naam:'Revolver',       soort:'wapen', waarde:30,  kans:10 },
  { id:'hagel',    naam:'Hagelgeweer',    soort:'wapen', waarde:35,  kans:12 },
  { id:'mp',       naam:'Machinepistool', soort:'wapen', waarde:45,  kans:9 },
  { id:'karabijn', naam:'Karabijn',       soort:'wapen', waarde:55,  kans:8 },
  { id:'scherp',   naam:'Scherpschutter', soort:'wapen', waarde:90,  kans:3 },
  { id:'kogels',   naam:'Kogels',         soort:'kogels', aantal:24, waarde:5,  kans:22 },
  { id:'verband',  naam:'Verband',        soort:'leven', leven:45,   waarde:8,  kans:16 },
  { id:'munt',     naam:'Zakje munten',   soort:'schat', waarde:30,  kans:10 },
  { id:'kroon',    naam:'Gouden kroon',   soort:'schat', waarde:120, kans:4 }
];

/* waar je mee begint, en waar je mee terugkomt als je neer bent geweest */
/* De juggernaut. Alle getallen staan hier bij elkaar, want ze hangen aan
   elkaar: hoe lang hij te zien is voor hij stormt bepaalt of je nog weg kunt,
   en hoe lang hij suf staat bepaalt hoeveel je eraf krijgt. Samen maken ze uit
   of hij te verslaan is, en dat moet hij zijn.

   pantser is hoeveel van een kogel er doorheen komt: 0,55 betekent dat je er
   bijna twee keer zoveel in moet pompen als in een speler. Terwijl hij suf is
   geldt dat niet, dan komt alles erin. */
var JUGGER = {
  hp: 620, snel: 84, r: 30, schade: 32, slaBereik: 48, slaPauze: 1.5,
  pantser: 0.55, sufKeer: 2.1,
  ruik: 760,                       /* zo ver ziet hij je */
  stormVan: 200, stormTot: 580,    /* op deze afstand zet hij aan */
  stormWacht: 6.5,                 /* zo lang duurt het voor hij weer kan */
  stormKlaar: 0.9,                 /* zo lang staat hij te grommen; dit is je waarschuwing */
  stormSnel: 340, stormDuur: 1.3, stormSchade: 44,
  suf: 2.2,                        /* zo lang staat hij stil na een muur */
  sufRaak: 1.1,                    /* korter als hij jou raakte: dan was het zijn goede dag */
  terug: 75,                       /* zo lang duurt het voor er een nieuwe is */
  buit: 4, punt: 150
};
/* Hoeveel er tegelijk rondlopen. Twee als er niemand is, en er komt er een bij
   per paar spelers, tot zes. Een zwerm hoort bij zombies, niet bij dit. */
var JUGGER_AANTAL = { min: 2, perSpeler: 0.5, max: 6 };

var START = { wapen: 'roestig', kogels: 30 };
var EXTRACT = { tijd: 12, straal: 74, waarschuw: 3 };   /* zo lang moet je blijven staan */
var KOGEL = { leven: 1.4 };

/* ---------- gereedschap ---------- */
function r1(n){ return Math.round(n); }
function r2(n){ return Math.round(n * 100) / 100; }
function klem(n, a, b){ return n < a ? a : n > b ? b : n; }

function maak(opzet){
  opzet = opzet || {};
  var haak = opzet.haak || {};
  function zeg(wat, a, b, c){ if (haak[wat]) try { haak[wat](a, b, c); } catch (e){} }

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
  function trek(lijst){
    var totaal = 0, i;
    for (i = 0; i < lijst.length; i++) totaal += lijst[i].kans;
    var t = toeval() * totaal;
    for (i = 0; i < lijst.length; i++){ t -= lijst[i].kans; if (t <= 0) return lijst[i]; }
    return lijst[lijst.length - 1];
  }

  var W = {
    seed: opzet.seed || 1, tijd: 0, fase: 'bezig',
    muren: [], kisten: [], buit: [], kogels: [], extracties: [], juggers: [], juggerKlok: 0,
    spelers: [], volgend: 1,
    /* Tellertjes voor wat zelden verandert. Een pakket zegt welk nummer de
       ontvanger al heeft; is het gelijk, dan gaan de kisten en de uitgangen
       er niet in mee. Scheelt elke tik een paar honderd bytes voor niets. */
    kistVersie: 1, exVersie: 1
  };
  function nrVan(){ return W.volgend++; }

  /* ---------- de stad bouwen ----------
     Avenues van noord naar zuid, dwarsstraten van west naar oost, en
     daartussen huizenblokken. Een blok wordt in vieren gedeeld met stegen
     ertussen, en er valt er weleens een weg: dan is er een binnenplaats. Een
     enkel blok is geen huizenblok maar een park, een plein of een bouwput,
     zodat de stad niet overal hetzelfde is.

     Waarom straten en niet losse blokken, zoals het was. Op een veld met losse
     blokken zie je overal even ver en is elke route hetzelfde. In een stad kijk
     je een straat door en zie je iemand van ver aankomen, terwijl je in een
     steeg pas ziet wie er staat als je er bent. Dat verschil is het spel.

     Voor de motor blijft alles een rechthoek waar je niet doorheen kunt; soort
     zegt alleen hoe de pagina hem tekent (0 gebouw, 1 muurtje of kiosk,
     2 container). */
  (function bouwStad(){
    var kolommen = Math.floor((WERELD.b - STAD.straat) / (STAD.blokB + STAD.straat));
    var rijen = Math.floor((WERELD.h - STAD.straat) / (STAD.blokH + STAD.straat));
    W.stad = { straat: STAD.straat, blokB: STAD.blokB, blokH: STAD.blokH, kolommen: kolommen, rijen: rijen, blokken: [] };

    function muur(x, y, b, h, soort){
      if (b < 30 || h < 30) return;
      W.muren.push({ x: r1(x), y: r1(y), b: r1(b), h: r1(h), s: soort || 0 });
    }
    /* een huizenblok: in vieren, met een steeg ertussen */
    function huizen(x0, y0){
      var steeg = 46;
      var halfB = (STAD.blokB - steeg) / 2, halfH = (STAD.blokH - steeg) / 2;
      var weg = Math.floor(toeval() * 5);   /* 4 betekent: alle vier blijven staan */
      for (var q = 0; q < 4; q++){
        if (q === weg) continue;
        var kx = x0 + (q % 2) * (halfB + steeg), ky = y0 + Math.floor(q / 2) * (halfH + steeg);
        /* niet elk huis vult zijn kwart helemaal: dat geeft portieken */
        var kb = halfB - Math.floor(toeval() * 60), kh = halfH - Math.floor(toeval() * 50);
        muur(kx, ky, kb, kh, 0);
      }
    }
    /* een park: niets in de weg, wel een paar bankjes langs de rand */
    function park(x0, y0){
      for (var q = 0; q < 4; q++){
        muur(x0 + 40 + toeval() * (STAD.blokB - 160), y0 + 40 + toeval() * (STAD.blokH - 130), 70, 34, 1);
      }
    }
    /* een plein: een kiosk in het midden en verder open */
    function plein(x0, y0){
      muur(x0 + STAD.blokB / 2 - 70, y0 + STAD.blokH / 2 - 55, 140, 110, 1);
    }
    /* een bouwput: containers, kriskras */
    function bouwput(x0, y0){
      for (var q = 0; q < 6; q++){
        muur(x0 + 50 + toeval() * (STAD.blokB - 200), y0 + 50 + toeval() * (STAD.blokH - 150), 110, 58, 2);
      }
    }
    for (var rij = 0; rij < rijen; rij++){
      for (var kol = 0; kol < kolommen; kol++){
        var x0 = STAD.straat + kol * (STAD.blokB + STAD.straat);
        var y0 = STAD.straat + rij * (STAD.blokH + STAD.straat);
        var rol = toeval();
        var soort = rol < 0.64 ? 'huizen' : rol < 0.78 ? 'park' : rol < 0.9 ? 'plein' : 'bouwput';
        W.stad.blokken.push({ x: r1(x0), y: r1(y0), soort: soort });
        if (soort === 'huizen') huizen(x0, y0);
        else if (soort === 'park') park(x0, y0);
        else if (soort === 'plein') plein(x0, y0);
        else bouwput(x0, y0);
      }
    }
    /* de kisten staan in de straten, de stegen en de parken */
    for (var i = 0; i < 18; i++){
      var p = vrijePlek(40);
      W.kisten.push({ nr: nrVan(), x: r1(p.x), y: r1(p.y), open: false, bezig: 0, vak: '' });
    }
    /* drie metro-ingangen, ver uit elkaar: wie eruit wil moet een eind lopen */
    var hoeken = [
      { x: RAND + 130, y: RAND + 130 }, { x: WERELD.b - RAND - 130, y: RAND + 150 },
      { x: WERELD.b / 2, y: WERELD.h - RAND - 130 }
    ];
    hoeken.forEach(function(h){ W.extracties.push({ nr: nrVan(), x: r1(h.x), y: r1(h.y), r: EXTRACT.straal }); });
  })();

  function raaktMuur(x, y, r){
    for (var i = 0; i < W.muren.length; i++){
      var m = W.muren[i];
      if (x + r > m.x && x - r < m.x + m.b && y + r > m.y && y - r < m.y + m.h) return m;
    }
    return null;
  }
  function vrijePlek(r, weg){
    for (var p = 0; p < 200; p++){
      var x = tussen(RAND + r, WERELD.b - RAND - r), y = tussen(RAND + r, WERELD.h - RAND - r);
      if (raaktMuur(x, y, r + 14)) continue;
      if (weg && Math.hypot(x - weg.x, y - weg.y) < (weg.r || 0)) continue;
      return { x: x, y: y };
    }
    return { x: WERELD.b / 2, y: WERELD.h / 2 };
  }

  /* ---------- spelers ----------
     Je uitrusting is het hoofdwapen en het zijwapen die je gekocht hebt. Die
     krijg je terug zodra je neergaat; wat je in de stad vond ben je dan kwijt.
     Wie niets gekocht heeft begint met het roestige pistool, en dat is met
     opzet een slecht wapen. */
  function nieuweSpeler(naam, av, uitrusting){
    var p = vrijePlek(SPELER.r);
    var u = kast().schoon(uitrusting, alles(uitrusting));
    return {
      naam: String(naam || 'speler').slice(0, 16), av: av || '',
      x: p.x, y: p.y, hoek: 0, dx: 0, dy: 0, mx: p.x + 40, my: p.y,
      hp: SPELER.hp, maxHp: SPELER.hp, neer: false, uit: false,
      uitrusting: u, wapen: u.hoofd, kogels: kast().KOGELS_MEE, spullen: [], punten: 0, geveld: 0, gevallen: 0,
      schietKlok: 0, raakKlok: 0, trekker: false, extractNr: 0, extractKlok: 0,
      bezigKist: 0, inv: 0
    };
  }
  /* De kamer heeft al nagekeken of deze speler zijn uitrusting bezit (dat kan
     alleen daar, want daar staat het profiel). Hier wordt alleen nog gekeken
     of de wapens bestaan en of het zijwapen licht genoeg is. */
  function alles(u){
    var b = {};
    if (u && u.hoofd) b[u.hoofd] = true;
    if (u && u.zij) b[u.zij] = true;
    return b;
  }
  (opzet.spelers || [{ naam: 'jij' }]).forEach(function(s){ W.spelers.push(nieuweSpeler(s.naam, s.av, s.uitrusting)); });

  W.erbij = function(naam, av, uitrusting){
    var p = nieuweSpeler(naam, av, uitrusting);
    W.spelers.push(p);
    /* iedereen moet de naam van de nieuwe nog krijgen, en hij die van hen */
    W.spelers.forEach(function(q, j){ if (W.vergeet) W.vergeet(j); });
    return W.spelers.length - 1;
  };
  W.eruit = function(i){ var p = W.spelers[i]; if (p){ p.uit = true; p.trekker = false; } };

  W.zetInvoer = function(i, dx, dy, mx, my){
    var p = W.spelers[i]; if (!p || p.neer || p.uit) return;
    p.dx = klem(dx || 0, -1, 1); p.dy = klem(dy || 0, -1, 1);
    if (typeof mx === 'number' && typeof my === 'number' && isFinite(mx) && isFinite(my)){
      p.mx = mx; p.my = my;
      p.hoek = Math.atan2(my - p.y, mx - p.x);
    }
    p.inv++;
  };
  W.schiet = function(i, aan){ var p = W.spelers[i]; if (p && !p.neer && !p.uit) p.trekker = !!aan; };

  /* ---------- oppakken, kisten, extractie ----------
     Een druk op gebruiken doet het dichtstbijzijnde dat kan: iets oppakken,
     een kist proberen, of bij een extractieplek gaan staan. */
  W.gebruik = function(i){
    var p = W.spelers[i]; if (!p || p.neer || p.uit) return null;
    var j, d;
    for (j = 0; j < W.buit.length; j++){
      d = Math.hypot(W.buit[j].x - p.x, W.buit[j].y - p.y);
      if (d <= SPELER.rapen){ pak(p, W.buit[j]); W.buit.splice(j, 1); return { wat: 'buit' }; }
    }
    for (j = 0; j < W.kisten.length; j++){
      var k = W.kisten[j];
      if (k.open) continue;
      d = Math.hypot(k.x - p.x, k.y - p.y);
      if (d <= SPELER.rapen + 8){
        if (k.bezig && k.bezig !== i + 1) return { wat: 'bezet' };
        k.bezig = i + 1; p.bezigKist = k.nr; W.kistVersie++;
        zeg('kist', i, k.nr);
        return { wat: 'kist', nr: k.nr };
      }
    }
    return null;
  };
  /* de pagina meldt dat de vragen bij een kist goed waren */
  W.kistOpen = function(i, nr){
    var p = W.spelers[i]; if (!p) return null;
    for (var j = 0; j < W.kisten.length; j++){
      var k = W.kisten[j];
      if (k.nr !== nr || k.open || k.bezig !== i + 1) continue;
      k.open = true; k.bezig = 0; p.bezigKist = 0; W.kistVersie++;
      var uit = [];
      var n = 1 + Math.floor(toeval() * 2.4);
      for (var m = 0; m < n; m++){
        var b = trek(BUIT);
        uit.push(b.id);
        pak(p, { soort: b.soort, id: b.id });
      }
      zeg('kistuit', i, uit);
      return uit;
    }
    return null;
  };
  W.kistLos = function(i, nr){
    var p = W.spelers[i];
    for (var j = 0; j < W.kisten.length; j++){
      if (W.kisten[j].nr === nr && W.kisten[j].bezig === i + 1){ W.kisten[j].bezig = 0; W.kistVersie++; }
    }
    if (p) p.bezigKist = 0;
  };

  function buitVan(id){ for (var i = 0; i < BUIT.length; i++) if (BUIT[i].id === id) return BUIT[i]; return null; }
  function pak(p, ding){
    var b = buitVan(ding.id); if (!b) return;
    if (b.soort === 'wapen'){
      if (p.spullen.indexOf(b.id) < 0) p.spullen.push(b.id);
      var nu = wapenVan(p.wapen), nieuw = wapenVan(b.id);
      if (nieuw.schade * nieuw.tempo > nu.schade * nu.tempo){ p.wapen = b.id; }
      p.kogels += 18;
    } else if (b.soort === 'kogels'){ p.kogels += b.aantal;
    } else if (b.soort === 'leven'){ p.hp = Math.min(p.maxHp, p.hp + b.leven);
    } else { p.spullen.push(b.id); }
    p.punten += b.waarde;
  }

  /* wat een speler bij zich heeft: de lijst zelf, voor in de kluis */
  W.spullenVan = function(i){ var p = W.spelers[i]; return p ? p.spullen.slice() : []; };
  /* wat een speler bij zich heeft, in waarde; dat neemt hij mee als hij het veld uit komt */
  W.buitWaarde = function(i){
    var p = W.spelers[i]; if (!p) return 0;
    var som = 0;
    p.spullen.forEach(function(id){ var b = buitVan(id); if (b) som += b.waarde; });
    return som;
  };

  /* ---------- neergaan en terugkomen ---------- */
  function velT(p, door){
    if (p.neer || p.uit) return;
    p.neer = true; p.trekker = false; p.hp = 0; p.gevallen++;
    p.extractNr = 0; p.extractKlok = 0;
    if (p.bezigKist){ W.kistLos(W.spelers.indexOf(p), p.bezigKist); }
    /* alles wat je bij je had valt op de grond: dat is de inzet */
    p.spullen.forEach(function(id){
      W.buit.push({ nr: nrVan(), x: r1(p.x + tussen(-26, 26)), y: r1(p.y + tussen(-26, 26)), id: id });
    });
    /* Alles wat je in de stad gevonden had ben je kwijt. Je eigen uitrusting
       krijg je terug: die heb je gekocht, en wat je koopt blijft van jou. Wie
       niets gekocht heeft staat er weer met het roestige pistool, en dat is
       precies de reden om iets te kopen. */
    p.spullen = []; p.punten = 0;
    p.wapen = (p.uitrusting && p.uitrusting.hoofd) || START.wapen;
    p.kogels = kast().KOGELS_MEE;
    zeg('neer', W.spelers.indexOf(p), door);
  }
  /* de pagina meldt dat de vragen om terug te komen goed waren */
  W.herleef = function(i){
    var p = W.spelers[i]; if (!p || !p.neer) return false;
    var plek = vrijePlek(SPELER.r);
    p.x = plek.x; p.y = plek.y; p.hp = p.maxHp; p.neer = false; p.raakKlok = 1.6;
    zeg('herleef', i);
    return true;
  };

  /* ---------- de klok ---------- */
  W.stap = function(dt){
    dt = Math.min(dt || 1 / 60, 0.05);
    W.tijd += dt;
    spelersStap(dt);
    juggersStap(dt);
    kogelsStap(dt);
    extractStap(dt);
  };

  function levendeSpelers(){
    return W.spelers.filter(function(p){ return !p.neer && !p.uit; });
  }

  function schuif(e, nx, ny, r){
    /* per as apart, dan glijd je langs een muur in plaats van eraan te blijven plakken */
    if (!raaktMuur(nx, e.y, r)) e.x = klem(nx, r, WERELD.b - r);
    if (!raaktMuur(e.x, ny, r)) e.y = klem(ny, r, WERELD.h - r);
  }

  function spelersStap(dt){
    W.spelers.forEach(function(p, i){
      if (p.uit) return;
      if (p.raakKlok > 0) p.raakKlok -= dt;
      if (p.neer) return;
      var l = Math.hypot(p.dx, p.dy);
      if (l > 0.01){
        var v = SPELER.snel * dt / (l > 1 ? l : 1);
        schuif(p, p.x + p.dx * v, p.y + p.dy * v, SPELER.r);
      }
      if (p.schietKlok > 0) p.schietKlok -= dt;
      if (p.trekker && p.schietKlok <= 0) schietNu(p, i);
    });
  }

  function schietNu(p, i){
    var w = wapenVan(p.wapen);
    if (w.mag > 0 && p.kogels <= 0){ p.wapen = 'vuist'; w = wapenVan('vuist'); }
    p.schietKlok = 1 / w.tempo;
    if (w.nabij){
      /* blote handen: alles vlak voor je neus krijgt een tik */
      var raak = false;
      W.juggers.forEach(function(z){
        if (raak || z.hp <= 0) return;
        var dz = Math.hypot(z.x - p.x, z.y - p.y);
        if (dz < w.bereik + JUGGER.r && Math.abs(hoekVerschil(Math.atan2(z.y - p.y, z.x - p.x), p.hoek)) < 0.9){
          raakJugger(z, w.schade, i); raak = true;
        }
      });
      W.spelers.forEach(function(q, j){
        if (raak || j === i || q.neer || q.uit) return;
        var d2 = Math.hypot(q.x - p.x, q.y - p.y);
        if (d2 < w.bereik + 15 && Math.abs(hoekVerschil(Math.atan2(q.y - p.y, q.x - p.x), p.hoek)) < 0.9){
          raakSpeler(q, w.schade, i); raak = true;
        }
      });
      zeg('slag', i, raak);
      return;
    }
    if (w.mag > 0){
      p.kogels--;
      /* meteen omwisselen als dit de laatste was, anders staat er nog een
         wapen met nul kogels in beeld tot je opnieuw de trekker overhaalt */
      /* leeg: eerst je zijwapen, en pas als dat ook niets is je vuisten */
      if (p.kogels <= 0){
        var zij = (p.uitrusting && p.uitrusting.zij) || 'vuist';
        p.wapen = zij === p.wapen ? 'vuist' : zij;
        if (p.wapen !== 'vuist') p.kogels = Math.round(kast().KOGELS_MEE / 2);
      }
    }
    for (var k = 0; k < w.korrels; k++){
      var afw = (toeval() - 0.5) * (w.spreid * Math.PI / 180) * 2;
      var h = p.hoek + afw;
      W.kogels.push({ nr: nrVan(), x: p.x + Math.cos(h) * (SPELER.r + 4), y: p.y + Math.sin(h) * (SPELER.r + 4),
                      vx: Math.cos(h) * w.kogelsnel, vy: Math.sin(h) * w.kogelsnel,
                      van: i, schade: w.schade, over: w.bereik, leven: KOGEL.leven });
    }
    zeg('schot', i, p.wapen);
  }
  function hoekVerschil(a, b){ var d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }

  /* Is er vrij zicht tussen twee punten, of staat er een gebouw tussen? Hij
     stormt alleen als er niets in de weg staat; anders zou hij zich meteen te
     pletter lopen en was er niets te ontwijken. */
  function vrijZicht(x1, y1, x2, y2){
    var dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy);
    var n = Math.ceil(l / 24);
    for (var i = 1; i < n; i++){
      if (raaktMuur(x1 + dx * i / n, y1 + dy * i / n, 6)) return false;
    }
    return true;
  }
  /* Een kogel of een vuist in de juggernaut. Zijn pantser houdt het meeste
     tegen, behalve terwijl hij suf tegen een muur staat: dan komt alles erin,
     en dat is de beloning voor het ontwijken. */
  function raakJugger(z, schade, door){
    if (z.hp <= 0) return;
    z.hp -= schade * (z.fase === 'suf' ? JUGGER.pantser * JUGGER.sufKeer : JUGGER.pantser);
    z.pijn = 0.18;
    if (z.hp > 0) return;
    z.hp = 0;
    var p = W.spelers[door];
    if (p && !p.uit){ p.punten += JUGGER.punt; p.geveld++; }
    /* wat hij bij zich had valt op straat; een wapen zit er altijd bij */
    var los = BUIT.filter(function(b){ return b.soort === 'wapen'; });
    for (var i = 0; i < JUGGER.buit; i++){
      var b = i === 0 ? los[Math.floor(toeval() * los.length)] : trek(BUIT);
      var h = toeval() * Math.PI * 2, af = 14 + toeval() * 30;
      W.buit.push({ nr: nrVan(), x: r1(z.x + Math.cos(h) * af), y: r1(z.y + Math.sin(h) * af), id: b.id });
    }
    zeg('juggerweg', z.nr, door);
  }

  function raakSpeler(q, schade, door){
    if (q.raakKlok > 0 || q.neer || q.uit) return;
    q.hp -= schade;
    q.raakKlok = SPELER.raakPauze;
    if (q.hp <= 0){
      var p = W.spelers[door];
      /* geveld telde zombies; nu telt het spelers, anders staat er een teller
         in beeld die nooit meer verandert */
      if (p && !p.uit && door !== W.spelers.indexOf(q)){ p.punten += 40; p.geveld++; }
      velT(q, door);
    }
  }
  /* Er lopen er zoveel als er spelers zijn, en een gevelde komt na een tijd
     ergens anders terug. Hij verschijnt nooit vlak naast iemand. */
  function juggersErbij(dt){
    W.juggerKlok -= dt;
    if (W.juggerKlok > 0) return;
    W.juggerKlok = 3;
    var levend = levendeSpelers();
    var wil = Math.max(JUGGER_AANTAL.min, Math.min(JUGGER_AANTAL.max,
      Math.round(JUGGER_AANTAL.min + levend.length * JUGGER_AANTAL.perSpeler)));
    var nu = W.juggers.filter(function(z){ return z.hp > 0; }).length;
    for (var i = nu; i < wil; i++){
      /* Op acht- tot vijftienhonderd van de dichtstbijzijnde speler: ver
         genoeg om niet uit het niets naast iemand te staan, dichtbij genoeg om
         binnen een halve minuut iets te betekenen. Is er niemand, dan maakt
         het niet uit waar hij begint. */
      var plek = null;
      for (var poging = 0; poging < 30 && !plek; poging++){
        var k = vrijePlek(JUGGER.r);
        if (!levend.length){ plek = k; break; }
        var kort = Math.min.apply(null, levend.map(function(q){ return Math.hypot(k.x - q.x, k.y - q.y); }));
        if (kort > 850 && kort < 1500) plek = k;
      }
      if (!plek) plek = vrijePlek(JUGGER.r);
      W.juggers.push({ nr: nrVan(), x: plek.x, y: plek.y, hoek: 0, hp: JUGGER.hp,
                       fase: 'loop', klok: 0, slaKlok: 0, stormPauze: JUGGER.stormWacht,
                       sx: 0, sy: 0, pijn: 0, zwerf: 0, zwerfKlok: 0 });
      zeg('juggererbij', W.juggers[W.juggers.length - 1].nr);
    }
  }

  function juggersStap(dt){
    juggersErbij(dt);
    var levend = levendeSpelers();
    W.juggers.forEach(function(z){
      if (z.hp <= 0) return;
      if (z.pijn > 0) z.pijn -= dt;
      if (z.slaKlok > 0) z.slaKlok -= dt;
      if (z.stormPauze > 0) z.stormPauze -= dt;

      /* suf tegen een muur: hij staat stil en is kwetsbaar */
      if (z.fase === 'suf'){
        z.klok -= dt;
        if (z.klok <= 0){ z.fase = 'loop'; z.stormPauze = JUGGER.stormWacht; }
        return;
      }
      /* de stormloop zelf: rechtuit, hij stuurt niet meer bij */
      if (z.fase === 'storm'){
        z.klok -= dt;
        var nx = z.x + z.sx * JUGGER.stormSnel * dt, ny = z.y + z.sy * JUGGER.stormSnel * dt;
        var geraakt = null;
        for (var i = 0; i < levend.length; i++){
          if (Math.hypot(levend[i].x - nx, levend[i].y - ny) < JUGGER.r + SPELER.r + 6){ geraakt = levend[i]; break; }
        }
        if (geraakt){
          raakSpeler(geraakt, JUGGER.stormSchade, -1);
          z.fase = 'suf'; z.klok = JUGGER.sufRaak;
          zeg('juggersuf', z.nr, false);
          return;
        }
        if (raaktMuur(nx, ny, JUGGER.r) || nx < JUGGER.r || ny < JUGGER.r || nx > WERELD.b - JUGGER.r || ny > WERELD.h - JUGGER.r){
          z.fase = 'suf'; z.klok = JUGGER.suf;
          zeg('juggersuf', z.nr, true);
          return;
        }
        z.x = nx; z.y = ny;
        if (z.klok <= 0){ z.fase = 'loop'; z.stormPauze = JUGGER.stormWacht; }
        return;
      }

      /* wie is er het dichtst bij? */
      var doel = null, best = JUGGER.ruik;
      for (var j = 0; j < levend.length; j++){
        var d = Math.hypot(levend[j].x - z.x, levend[j].y - z.y);
        if (d < best){ best = d; doel = levend[j]; }
      }

      /* grommend klaarstaan: hij draait nog mee, dus wegrennen helpt niet, opzij stappen wel */
      if (z.fase === 'klaar'){
        z.klok -= dt;
        if (doel) z.hoek = Math.atan2(doel.y - z.y, doel.x - z.x);
        if (z.klok <= 0){
          z.fase = 'storm'; z.klok = JUGGER.stormDuur;
          z.sx = Math.cos(z.hoek); z.sy = Math.sin(z.hoek);
          zeg('juggerstorm', z.nr);
        }
        return;
      }

      if (!doel){
        /* Niemand binnen ruikafstand: slenteren naar wie het dichtst bij is.
           Willekeurig rondlopen klinkt logischer, maar twee stipjes die
           willekeurig lopen in een stad van drie bij twee kilometer vinden
           elkaar nooit, en dan is er geen spel. Op vier tiende van zijn
           snelheid loop je er makkelijk bij weg. */
        var ver = null, verAf = 1e9;
        for (var w = 0; w < levend.length; w++){
          var da = Math.hypot(levend[w].x - z.x, levend[w].y - z.y);
          if (da < verAf){ verAf = da; ver = levend[w]; }
        }
        if (!ver){
          if (!z.zwerfKlok || z.zwerfKlok <= 0){ z.zwerf = toeval() * Math.PI * 2; z.zwerfKlok = 2 + toeval() * 3; }
          z.zwerfKlok -= dt;
          z.hoek = z.zwerf;
        } else {
          z.hoek = Math.atan2(ver.y - z.y, ver.x - z.x);
        }
        schuif(z, z.x + Math.cos(z.hoek) * JUGGER.snel * 0.4 * dt, z.y + Math.sin(z.hoek) * JUGGER.snel * 0.4 * dt, JUGGER.r);
        return;
      }

      z.hoek = Math.atan2(doel.y - z.y, doel.x - z.x);
      if (best <= JUGGER.slaBereik){
        if (z.slaKlok <= 0){ z.slaKlok = JUGGER.slaPauze; raakSpeler(doel, JUGGER.schade, -1); zeg('juggerslag', z.nr); }
        return;
      }
      if (best >= JUGGER.stormVan && best <= JUGGER.stormTot && z.stormPauze <= 0 && vrijZicht(z.x, z.y, doel.x, doel.y)){
        z.fase = 'klaar'; z.klok = JUGGER.stormKlaar;
        zeg('juggerklaar', z.nr);
        return;
      }
      schuif(z, z.x + Math.cos(z.hoek) * JUGGER.snel * dt, z.y + Math.sin(z.hoek) * JUGGER.snel * dt, JUGGER.r);
    });
    /* een gevelde blijft nog even liggen zodat de pagina hem kan laten verdwijnen */
    W.juggers = W.juggers.filter(function(z){
      if (z.hp > 0) return true;
      z.weg = (z.weg || 0) + dt;
      return z.weg < 1.2;
    });
  }

  function kogelsStap(dt){
    W.kogels.forEach(function(k){
      if (k.leven <= 0) return;
      var stap = Math.hypot(k.vx, k.vy) * dt;
      k.over -= stap; k.leven -= dt;
      if (k.over <= 0){ k.leven = 0; return; }
      var nx = k.x + k.vx * dt, ny = k.y + k.vy * dt;
      if (raaktMuur(nx, ny, 2)){ k.leven = 0; return; }
      if (nx < 0 || ny < 0 || nx > WERELD.b || ny > WERELD.h){ k.leven = 0; return; }
      /* wie zit er tussen waar hij was en waar hij komt? eerst de juggernauts,
         want die zijn groot en staan vaak voor iemand anders */
      var i;
      for (i = 0; i < W.juggers.length; i++){
        var z = W.juggers[i];
        if (z.hp > 0 && lijnRaakt(k.x, k.y, nx, ny, z.x, z.y, JUGGER.r)){
          raakJugger(z, k.schade, k.van); k.leven = 0; return;
        }
      }
      for (i = 0; i < W.spelers.length; i++){
        var q = W.spelers[i];
        if (i === k.van || q.neer || q.uit) continue;
        if (lijnRaakt(k.x, k.y, nx, ny, q.x, q.y, SPELER.r)){
          raakSpeler(q, k.schade, k.van); k.leven = 0; return;
        }
      }
      k.x = nx; k.y = ny;
    });
    W.kogels = W.kogels.filter(function(k){ return k.leven > 0; });
  }
  /* staat het rondje met middelpunt (cx,cy) in de weg van het lijntje (x1,y1)-(x2,y2)? */
  function lijnRaakt(x1, y1, x2, y2, cx, cy, r){
    var dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
    var t = l2 ? klem(((cx - x1) * dx + (cy - y1) * dy) / l2, 0, 1) : 0;
    var px = x1 + dx * t, py = y1 + dy * t;
    return (px - cx) * (px - cx) + (py - cy) * (py - cy) <= r * r;
  }

  /* ---------- eruit stappen ----------
     Je moet stil in de kring blijven staan. Loop je eruit, dan begint de
     teller opnieuw: dat is wat het spannend maakt als er iemand op je jaagt.
     Iedereen ziet waar er iemand staat te wachten, want anders weet je nooit
     waar je heen moet als je iemand wilt onderscheppen. */
  function extractStap(dt){
    W.spelers.forEach(function(p, i){
      if (p.neer || p.uit){ p.extractNr = 0; p.extractKlok = 0; return; }
      var op = null;
      for (var j = 0; j < W.extracties.length; j++){
        var e = W.extracties[j];
        if (Math.hypot(e.x - p.x, e.y - p.y) <= e.r){ op = e; break; }
      }
      if (!op){
        if (p.extractNr){ W.exVersie++; zeg('extractstop', i, p.extractNr); }
        p.extractNr = 0; p.extractKlok = 0; return;
      }
      if (p.extractNr !== op.nr){ p.extractNr = op.nr; p.extractKlok = 0; W.exVersie++; zeg('extractstart', i, op.nr); }
      p.extractKlok += dt;
      if (p.extractKlok >= EXTRACT.tijd){
        p.uit = true; p.trekker = false;
        zeg('extractklaar', i, W.buitWaarde(i));
      }
    });
  }

  /* ---------- wat een speler mag zien ----------
     Alleen wat in zijn buurt staat. De wereld is te groot om helemaal door de
     lijn te duwen, en wat achter de horizon gebeurt hoeft hij ook niet te
     weten. De rand eromheen is ruim genoeg dat er niets ter plekke opdoemt. */
  var MARGE = 1.35;
  function dichtbij(p, x, y){
    return Math.abs(x - p.x) < KIJK.b * MARGE / 2 && Math.abs(y - p.y) < KIJK.h * MARGE / 2;
  }
  /* Welke namen heeft deze ontvanger al gehad, en welk tellertje kent hij van
     de kisten en de uitgangen. Dit hoort bij de ontvanger en niet bij de
     wereld, dus het staat apart. */
  var weet = [];
  function weetVan(i){
    if (!weet[i]) weet[i] = { namen: {}, kist: 0, ex: 0 };
    return weet[i];
  }
  W.vergeet = function(i){ weet[i] = null; };

  W.pakketVoor = function(i){
    var p = W.spelers[i];
    if (!p) return null;
    var k = weetVan(i);
    var d = {
      t: r2(W.tijd), ik: i,
      m: [r1(p.x), r1(p.y), r2(p.hoek), r1(p.hp), r1(p.maxHp), p.neer ? 1 : 0, p.uit ? 1 : 0,
          p.wapen, p.kogels, p.punten, p.geveld, p.gevallen, r2(p.extractKlok), p.extractNr, p.bezigKist],
      s: [], j: [], k: [], b: []
    };
    /* De naam en de avatar van een ander gaan een keer mee, zodra hij voor
       het eerst in beeld komt. Daarna alleen nog zijn nummer: dat scheelde
       vijfentwintig van de tweeenveertig bytes per speler per pakket. */
    var nieuw = null;
    W.spelers.forEach(function(q, j){
      if (j === i || q.uit) return;
      var zichtbaar = dichtbij(p, q.x, q.y);
      if (!zichtbaar && !q.extractNr) return;
      if (!k.namen[j]){
        k.namen[j] = 1;
        (nieuw || (nieuw = [])).push([j, q.naam, q.av]);
      }
      d.s.push([j, r1(q.x), r1(q.y), r2(q.hoek), r1(q.hp), q.neer ? 1 : 0,
                q.extractNr, r1(q.extractKlok), zichtbaar ? 1 : 0]);
    });
    if (nieuw) d.n = nieuw;

    /* De juggernauts in de buurt. De fase gaat als cijfer mee, want de pagina
       tekent hem anders als hij klaarstaat om te stormen of suf staat: 0 lopen,
       1 klaarstaan, 2 stormen, 3 suf, 4 geveld. */
    var FASENR = { loop: 0, klaar: 1, storm: 2, suf: 3 };
    W.juggers.forEach(function(z){
      if (!dichtbij(p, z.x, z.y)) return;
      d.j.push([z.nr, r1(z.x), r1(z.y), r2(z.hoek), r1(z.hp), z.hp <= 0 ? 4 : (FASENR[z.fase] || 0)]);
    });

    /* Een kogel wordt een streepje op het scherm; daar is de hoek genoeg voor.
       De snelheid in x en y waren twee getallen van vier cijfers voor niets. */
    W.kogels.forEach(function(g){
      if (!dichtbij(p, g.x, g.y)) return;
      d.k.push([r1(g.x), r1(g.y), r2(Math.atan2(g.vy, g.vx))]);
    });
    W.buit.forEach(function(b){
      if (!dichtbij(p, b.x, b.y)) return;
      d.b.push([b.nr, b.x, b.y, b.id]);
    });
    /* Kisten en uitgangen veranderen zelden. Ze gaan alleen mee als er iets
       gebeurd is sinds de vorige keer dat deze speler ze kreeg. */
    if (k.kist !== W.kistVersie){
      k.kist = W.kistVersie;
      d.kv = W.kistVersie;
      d.ki = [];
      W.kisten.forEach(function(kist){ d.ki.push([kist.nr, kist.x, kist.y, kist.open ? 1 : 0, kist.bezig]); });
    }
    if (k.ex !== W.exVersie){
      k.ex = W.exVersie;
      d.ev = W.exVersie;
      d.ex = [];
      W.extracties.forEach(function(e){
        var bezet = 0;
        W.spelers.forEach(function(q){ if (!q.uit && q.extractNr === e.nr) bezet++; });
        d.ex.push([e.nr, e.x, e.y, e.r, bezet]);
      });
    }
    return d;
  };

  /* de wereld zelf verandert niet, dus die gaat een keer over de lijn */
  W.wereldPakket = function(){
    return { b: WERELD.b, h: WERELD.h, seed: W.seed,
             mu: W.muren.map(function(m){ return [m.x, m.y, m.b, m.h, m.s || 0]; }),
             stad: W.stad,
             ex: W.extracties.map(function(e){ return [e.nr, e.x, e.y, e.r]; }) };
  };

  W.WERELD = WERELD;
  return W;
}

g.STADMOTOR = { maak: maak, WERELD: WERELD, KIJK: KIJK, SPELER: SPELER, STAD: STAD, JUGGER: JUGGER,
                  BUIT: BUIT, EXTRACT: EXTRACT, START: START, wapenVan: wapenVan,
                  /* de wapenkast zit in wapens.js; dit is er alleen een doorgeefluik naartoe */
                  get WAPENS(){ return kast().LIJST; } };
})(typeof globalThis !== 'undefined' ? globalThis : this);
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.STADMOTOR;
