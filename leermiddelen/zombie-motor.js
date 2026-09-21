/* De motor van Het zombiespel: alles wat rekent en niets wat tekent.

   Dezelfde motor draait op twee plekken, net als die van Zwaardvechter. Wie
   alleen oefent heeft hem in zijn eigen browser. Wie meedoet aan een potje
   heeft hem in de spelkamer op de server: die tikt en stuurt de stand terug.

   Wat hierin zit: de wereld met zijn muren, de spelers, de zombies, de
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
     var W = ZOMBIEMOTOR.maak({ seed:123, spelers:[{ naam:'jij' }], haak:{ ... } });
     W.zetInvoer(i, dx, dy, mx, my);   lopen (-1..1) en waar je heen mikt
     W.schiet(i, aan);                 de trekker vast of los
     W.gebruik(i);                     oprapen, een kist proberen, extractie starten
     W.stap(dt);                       een stap van de klok
     W.pakketVoor(i);                  wat speler i mag zien

   Dit bestand laadt als gewoon script in de browser (ZOMBIEMOTOR op window)
   en als module op de server (module.exports). */
(function(g){
'use strict';

/* ---------- de wereld ---------- */
var WERELD = { b: 3200, h: 2200 };
var KIJK = { b: 980, h: 620 };          /* wat een speler ongeveer ziet; het pakket gaat iets ruimer */
var RAND = 60;                          /* zoveel blijft er vrij langs de kant van de wereld */

var SPELER = {
  r: 15, snel: 205, hp: 100,
  neerTijd: 0,                          /* wie neer is blijft liggen tot de vragen goed zijn */
  raakPauze: 0.45,                      /* zo lang ben je onraakbaar na een klap */
  rapen: 46                             /* tot zover kun je iets oppakken */
};

/* De zombies. Ze zijn hier geen mensen maar vlekken, net als de fouten in
   Zwaardvechter: dit is een schoolsite en het hoeft niet echt te lijken. */
var ZOMBIES = [
  { id:'sloffer', naam:'Sloffer',  hp:44,  snel:52,  schade:9,  r:15, kleur:'#6f8f5a', kans:58, punt:6 },
  { id:'renner',  naam:'Renner',   hp:26,  snel:132, schade:7,  r:13, kleur:'#c9803f', kans:28, punt:9 },
  { id:'dikkerd', naam:'Dikkerd',  hp:150, snel:38,  schade:17, r:22, kleur:'#7a5a86', kans:14, punt:20 }
];
var ZOMBIE = { ruik: 460, slaBereik: 30, slaPauze: 1.05, maxInWereld: 150, bijGroeien: 3.2,
               bijSpeler: 0.62, minAf: 340, maxAf: 900 };
/* Hoeveel er in de buurt van de spelers verschijnen in plaats van ergens in de
   wereld. Een wereld van drie bij twee kilometer met twintig zombies erin is
   leeg: je ziet er een dertiende van, dus je komt er anderhalve tegen. */

/* De wapens. Tempo is schoten per seconde, spreiding in graden. */
var WAPENS = [
  { id:'vuist',   naam:'Blote handen', schade:11, tempo:2.2, bereik:34,  spreid:0,  korrels:1, mag:0,  kogelsnel:0,    nabij:true },
  { id:'pistool', naam:'Pistool',      schade:19, tempo:3.4, bereik:430, spreid:4,  korrels:1, mag:12, kogelsnel:880 },
  { id:'hagel',   naam:'Hagelgeweer',  schade:11, tempo:1.1, bereik:230, spreid:15, korrels:6, mag:6,  kogelsnel:760 },
  { id:'karabijn',naam:'Karabijn',     schade:15, tempo:7.5, bereik:560, spreid:7,  korrels:1, mag:30, kogelsnel:1040 },
  { id:'scherp',  naam:'Scherpschutter', schade:62, tempo:0.85, bereik:820, spreid:1, korrels:1, mag:5, kogelsnel:1500 }
];
function wapenVan(id){ for (var i = 0; i < WAPENS.length; i++) if (WAPENS[i].id === id) return WAPENS[i]; return WAPENS[0]; }

/* Wat er in een kist kan zitten. waarde telt mee voor wat je meeneemt als je
   het veld uit komt; dat is waar het om draait. */
var BUIT = [
  { id:'pistool',  naam:'Pistool',        soort:'wapen', waarde:20,  kans:20 },
  { id:'hagel',    naam:'Hagelgeweer',    soort:'wapen', waarde:35,  kans:14 },
  { id:'karabijn', naam:'Karabijn',       soort:'wapen', waarde:55,  kans:10 },
  { id:'scherp',   naam:'Scherpschutter', soort:'wapen', waarde:90,  kans:4 },
  { id:'kogels',   naam:'Kogels',         soort:'kogels', aantal:24, waarde:5,  kans:22 },
  { id:'verband',  naam:'Verband',        soort:'leven', leven:45,   waarde:8,  kans:16 },
  { id:'munt',     naam:'Zakje munten',   soort:'schat', waarde:30,  kans:10 },
  { id:'kroon',    naam:'Gouden kroon',   soort:'schat', waarde:120, kans:4 }
];

var EXTRACT = { tijd: 12, straal: 74, waarschuw: 3 };   /* zo lang moet je blijven staan */
var KOGEL = { leven: 1.4 };
var GOLF = { pauze: 18, eerste: 2 };                    /* om de zoveel tellen komt er een groepje bij */

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
    muren: [], kisten: [], buit: [], zombies: [], kogels: [], extracties: [],
    spelers: [], golfKlok: GOLF.eerste, volgend: 1,
    /* Tellertjes voor wat zelden verandert. Een pakket zegt welk nummer de
       ontvanger al heeft; is het gelijk, dan gaan de kisten en de uitgangen
       er niet in mee. Scheelt elke tik een paar honderd bytes voor niets. */
    kistVersie: 1, exVersie: 1
  };
  function nrVan(){ return W.volgend++; }

  /* ---------- de wereld bouwen ----------
     Blokken met ruimte ertussen, want een zombie die achter een muur staat is
     geen zombie maar een muur. De kisten liggen tussen de blokken in, en de
     drie plekken om eruit te stappen liggen ver uit elkaar: wie extract moet
     een stuk lopen, en dat is waar de spanning zit. */
  (function bouw(){
    var vakB = WERELD.b / 4, vakH = WERELD.h / 3;
    for (var rij = 0; rij < 3; rij++){
      for (var kol = 0; kol < 4; kol++){
        var n = 1 + Math.floor(toeval() * 3);
        for (var k = 0; k < n; k++){
          var b = tussen(90, 260), h = tussen(70, 210);
          var x = kol * vakB + tussen(40, vakB - b - 40);
          var y = rij * vakH + tussen(40, vakH - h - 40);
          if (b < 40 || h < 40) continue;
          W.muren.push({ x: r1(x), y: r1(y), b: r1(b), h: r1(h) });
        }
      }
    }
    for (var i = 0; i < 16; i++){
      var p = vrijePlek(40);
      W.kisten.push({ nr: nrVan(), x: r1(p.x), y: r1(p.y), open: false, bezig: 0, vak: '' });
    }
    var hoeken = [
      { x: RAND + 120, y: RAND + 120 }, { x: WERELD.b - RAND - 120, y: RAND + 140 },
      { x: WERELD.b / 2, y: WERELD.h - RAND - 120 }
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

  /* ---------- spelers ---------- */
  function nieuweSpeler(naam, av){
    var p = vrijePlek(SPELER.r);
    return {
      naam: String(naam || 'speler').slice(0, 16), av: av || '',
      x: p.x, y: p.y, hoek: 0, dx: 0, dy: 0, mx: p.x + 40, my: p.y,
      hp: SPELER.hp, maxHp: SPELER.hp, neer: false, uit: false,
      wapen: 'vuist', kogels: 0, spullen: [], punten: 0, geveld: 0, gevallen: 0,
      schietKlok: 0, raakKlok: 0, trekker: false, extractNr: 0, extractKlok: 0,
      bezigKist: 0, inv: 0
    };
  }
  (opzet.spelers || [{ naam: 'jij' }]).forEach(function(s){ W.spelers.push(nieuweSpeler(s.naam, s.av)); });

  W.erbij = function(naam, av){
    var p = nieuweSpeler(naam, av);
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
    p.spullen = []; p.punten = 0; p.wapen = 'vuist'; p.kogels = 0;
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
    zombiesErbij(dt);
    spelersStap(dt);
    zombiesStap(dt);
    kogelsStap(dt);
    extractStap(dt);
  };

  function levendeSpelers(){
    return W.spelers.filter(function(p){ return !p.neer && !p.uit; });
  }

  function zombiesErbij(dt){
    W.golfKlok -= dt;
    if (W.golfKlok > 0) return;
    W.golfKlok = GOLF.pauze;
    var levend = levendeSpelers();
    var wil = Math.min(ZOMBIE.maxInWereld, 40 + Math.floor(W.tijd / GOLF.pauze) * ZOMBIE.bijGroeien + levend.length * 6);
    var tekort = Math.max(0, Math.round(wil) - W.zombies.length);
    for (var i = 0; i < tekort; i++){
      var s = trek(ZOMBIES), p;
      /* Het merendeel komt in de buurt van iemand binnen, maar buiten beeld:
         ver genoeg om niet uit het niets op te duiken, dichtbij genoeg om
         binnen een halve minuut iets tegen te komen. */
      if (levend.length && toeval() < ZOMBIE.bijSpeler){
        var q = levend[Math.floor(toeval() * levend.length)];
        p = null;
        for (var poging = 0; poging < 14 && !p; poging++){
          var h = toeval() * Math.PI * 2, af = tussen(ZOMBIE.minAf, ZOMBIE.maxAf);
          var kx = klem(q.x + Math.cos(h) * af, RAND + s.r, WERELD.b - RAND - s.r);
          var ky = klem(q.y + Math.sin(h) * af, RAND + s.r, WERELD.h - RAND - s.r);
          if (!raaktMuur(kx, ky, s.r + 10) && Math.hypot(kx - q.x, ky - q.y) > ZOMBIE.minAf * 0.8) p = { x: kx, y: ky };
        }
      }
      if (!p) p = vrijePlek(s.r);
      W.zombies.push({ nr: nrVan(), soort: s.id, x: p.x, y: p.y, hp: s.hp, maxHp: s.hp, slaKlok: 0, hoek: 0 });
    }
    zeg('golf', W.zombies.length);
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
      W.zombies.forEach(function(z){
        if (raak) return;
        var d = Math.hypot(z.x - p.x, z.y - p.y);
        if (d < w.bereik + 15 && Math.abs(hoekVerschil(Math.atan2(z.y - p.y, z.x - p.x), p.hoek)) < 0.9){
          raakZombie(z, w.schade, i); raak = true;
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
    if (w.mag > 0) p.kogels--;
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

  function raakZombie(z, schade, door){
    z.hp -= schade;
    if (z.hp > 0) return;
    var s = soortVan(z.soort);
    var p = W.spelers[door];
    if (p && !p.uit){ p.punten += s.punt; p.geveld++; }
    /* af en toe laat een zombie iets vallen; anders loont schieten niet */
    if (toeval() < 0.16){
      var b = trek(BUIT);
      W.buit.push({ nr: nrVan(), x: r1(z.x), y: r1(z.y), id: b.id });
    }
    z.hp = 0;
    zeg('zombieweg', z.nr, door);
  }
  function raakSpeler(q, schade, door){
    if (q.raakKlok > 0 || q.neer || q.uit) return;
    q.hp -= schade;
    q.raakKlok = SPELER.raakPauze;
    if (q.hp <= 0){
      var p = W.spelers[door];
      if (p && !p.uit && door !== W.spelers.indexOf(q)) p.punten += 40;
      velT(q, door);
    }
  }
  function soortVan(id){ for (var i = 0; i < ZOMBIES.length; i++) if (ZOMBIES[i].id === id) return ZOMBIES[i]; return ZOMBIES[0]; }

  function zombiesStap(dt){
    var levend = levendeSpelers();
    W.zombies.forEach(function(z){
      if (z.hp <= 0) return;
      var s = soortVan(z.soort);
      if (z.slaKlok > 0) z.slaKlok -= dt;
      /* wie is het dichtst in de buurt? verder dan ruiken kijkt hij niet */
      var doel = null, best = ZOMBIE.ruik;
      for (var i = 0; i < levend.length; i++){
        var d = Math.hypot(levend[i].x - z.x, levend[i].y - z.y);
        if (d < best){ best = d; doel = levend[i]; }
      }
      if (!doel){
        /* niemand in de buurt: langzaam rondscharrelen */
        if (!z.zwerf || z.zwerfKlok <= 0){ z.zwerf = toeval() * Math.PI * 2; z.zwerfKlok = tussen(1.5, 4); }
        z.zwerfKlok -= dt;
        schuif(z, z.x + Math.cos(z.zwerf) * s.snel * 0.35 * dt, z.y + Math.sin(z.zwerf) * s.snel * 0.35 * dt, s.r);
        z.hoek = z.zwerf;
        return;
      }
      var h = Math.atan2(doel.y - z.y, doel.x - z.x);
      z.hoek = h;
      if (best > ZOMBIE.slaBereik){
        schuif(z, z.x + Math.cos(h) * s.snel * dt, z.y + Math.sin(h) * s.snel * dt, s.r);
      } else if (z.slaKlok <= 0){
        z.slaKlok = ZOMBIE.slaPauze;
        raakSpeler(doel, s.schade, -1);
        zeg('zombieslag', z.nr);
      }
    });
    W.zombies = W.zombies.filter(function(z){ return z.hp > 0; });
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
      /* wie zit er tussen waar hij was en waar hij komt? */
      var i;
      for (i = 0; i < W.zombies.length; i++){
        var z = W.zombies[i];
        if (z.hp > 0 && lijnRaakt(k.x, k.y, nx, ny, z.x, z.y, soortVan(z.soort).r)){
          raakZombie(z, k.schade, k.van); k.leven = 0; return;
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

  var SOORTNR = {};
  ZOMBIES.forEach(function(z, i){ SOORTNR[z.id] = i; });

  W.pakketVoor = function(i){
    var p = W.spelers[i];
    if (!p) return null;
    var k = weetVan(i);
    var d = {
      t: r2(W.tijd), ik: i,
      m: [r1(p.x), r1(p.y), r2(p.hoek), r1(p.hp), r1(p.maxHp), p.neer ? 1 : 0, p.uit ? 1 : 0,
          p.wapen, p.kogels, p.punten, p.geveld, p.gevallen, r2(p.extractKlok), p.extractNr, p.bezigKist],
      s: [], z: [], k: [], b: []
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

    W.zombies.forEach(function(z){
      if (!dichtbij(p, z.x, z.y)) return;
      /* de soort als cijfer in plaats van als woord */
      d.z.push([z.nr, r1(z.x), r1(z.y), r2(z.hoek), SOORTNR[z.soort] || 0, r1(z.hp)]);
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
             mu: W.muren.map(function(m){ return [m.x, m.y, m.b, m.h]; }),
             ex: W.extracties.map(function(e){ return [e.nr, e.x, e.y, e.r]; }) };
  };

  W.WERELD = WERELD;
  return W;
}

g.ZOMBIEMOTOR = { maak: maak, WERELD: WERELD, KIJK: KIJK, SPELER: SPELER, ZOMBIES: ZOMBIES,
                  WAPENS: WAPENS, BUIT: BUIT, EXTRACT: EXTRACT, wapenVan: wapenVan };
})(typeof globalThis !== 'undefined' ? globalThis : this);
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.ZOMBIEMOTOR;
