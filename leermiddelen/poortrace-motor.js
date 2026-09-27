/* Poortrace: de motor. Tekent de weg met drie banen in schijn-3D op een
   canvas (zoals de oude arcaderacers: een weg van plakjes die naar de horizon
   krimpen), rijdt het voertuig, zet de poorten met de antwoorden op de weg en
   doet de effecten. Wat er gevraagd wordt en wat goed is, weet de motor niet:
   dat doet poortrace.html. De motor meldt alleen welke baan je koos toen je
   door een poort reed.

   Gebruik:
     var m = POORTMOTOR.maak(canvas, { onder, poort, geremd, wacht, finish, tik });
       onder()          hoeveel beeldpunten onderaan vrij moeten blijven (de baanknoppen)
       poort(k, baan)   je reed door poort k, in baan 0, 1 of 2
       geremd()         de slip na een fout is uitgeslipt
       wacht(k)         rustige stand: je staat stil voor poort k
       finish()         over de finishlijn
     m.rit({ poorten, afstand, voertuig, kleur, spoor, spook, rustig })  een nieuwe rit
     m.poort(k, banen)  de antwoorden van poort k: [{tekst}, null, {tekst}] (null is dicht)
     m.uitslag(k, gekozen, goed)   het paneel kleurt, en het effect erbij
     m.snelheid(v), m.baan(i), m.stuur(-1|1), m.slip(), m.pauze(b), m.rijdDoor(), m.gas(b)
     m.vanaf(k)         verder na een herlaad: het voertuig staat net voorbij poort k-1
     m.voort()          hoe ver je bent, van 0 (de start) tot 1 (de finish)
     m.rivalen(lijst)   in een race de anderen: [{ id, naam, voort }], voort van 0 tot 1.
                        Ze rijden als doorzichtige karretjes met hun naam erboven mee;
                        tussen twee meldingen schuiven ze in hun eigen tempo door.

   Tekenlessen uit het Zombieveld: niets opbouwen in de lus (vaste arrays, een
   poel voor de deeltjes), geen getBoundingClientRect in de lus (alleen bij een
   nieuwe maat), en wat niet verandert (lucht, heuvels, bomen, panelen) een keer
   voortekenen op een los canvas en daarna alleen nog plakken. */
window.POORTMOTOR = (function(){
  'use strict';
  var SEG = 200, HALF = 2000, ZICHT = 240, RUMBLE = 3;
  var LAAN = [-2 / 3, 0, 2 / 3];
  /* De kleuren van de drie banen. Geen koraal: dat is de kleur van fout. */
  var BAANKLEUR = [['#EA9836', '#14224C'], ['#204ECF', '#FFFFFF'], ['#6b3fa0', '#FFFFFF']];
  var GOED = '#2f7d52', FOUT = '#F26749';

  /* De garage. Prijzen in munten die op dit apparaat blijven. */
  var VOERTUIGEN = [
    { id:'kart',  naam:'Kart',      prijs:0,   uit:'laag en wendbaar' },
    { id:'fiets', naam:'Racefiets', prijs:30,  uit:'trappen maar' },
    { id:'step',  naam:'Step',      prijs:45,  uit:'staand de bocht door' },
    { id:'auto',  naam:'Raceauto',  prijs:90,  uit:'breed, met een spoiler' },
    { id:'zweef', naam:'Zweefboot', prijs:140, uit:'zweeft net boven de weg' }
  ];
  var KLEUREN = [
    { id:'oceaan', naam:'Oceaan', kleur:'#204ECF', prijs:0 },
    { id:'koraal', naam:'Koraal', kleur:'#F26749', prijs:0 },
    { id:'amber',  naam:'Amber',  kleur:'#EA9836', prijs:15 },
    { id:'bos',    naam:'Bos',    kleur:'#2f7d52', prijs:15 },
    { id:'hemel',  naam:'Hemel',  kleur:'#83A5F2', prijs:20 },
    { id:'paars',  naam:'Paars',  kleur:'#6b3fa0', prijs:20 },
    { id:'nacht',  naam:'Nacht',  kleur:'#14224C', prijs:25 },
    { id:'goud',   naam:'Goud',   kleur:'#D9A21B', prijs:40 }
  ];
  var SPOREN = [
    { id:'geen',      naam:'Geen spoor', prijs:0 },
    { id:'vonken',    naam:'Vonken',     prijs:25 },
    { id:'bellen',    naam:'Bellen',     prijs:35 },
    { id:'sterren',   naam:'Sterren',    prijs:50 },
    { id:'regenboog', naam:'Regenboog',  prijs:80 }
  ];
  function kleurVan(id){ for (var i = 0; i < KLEUREN.length; i++) if (KLEUREN[i].id === id) return KLEUREN[i].kleur; return KLEUREN[0].kleur; }

  /* ---------- kleuren mengen ---------- */
  function rgb(h){ h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function meng(a, b, t){ var x = rgb(a), y = rgb(b); return 'rgb(' + Math.round(x[0] + (y[0] - x[0]) * t) + ',' + Math.round(x[1] + (y[1] - x[1]) * t) + ',' + Math.round(x[2] + (y[2] - x[2]) * t) + ')'; }
  function tint(h, t){ return t >= 0 ? meng(h, '#ffffff', t) : meng(h, '#000000', -t); }

  /* Overdag een zomerse lucht, in het donker de schemering met sterren. */
  var PALET = {
    licht:{ lucht:['#5fa3ee', '#a9d4fb', '#ffe6c7'], zon:'#fff3cf', heuvel1:'#b9dba0', heuvel2:'#93c776', gras:['#96d06f', '#88c563'],
            weg:['#6a7285', '#646b7e'], rand:['#F26749', '#FBF6F1'], streep:'#FBF6F1', mist:'#d3e6cf', paal:'#39415f', nacht:false },
    donker:{ lucht:['#08102c', '#1b2860', '#56407e'], zon:'#F3EFE9', heuvel1:'#253e62', heuvel2:'#1b3350', gras:['#21503e', '#1c4636'],
            weg:['#363d5c', '#313856'], rand:['#F26749', '#c9d2ea'], streep:'#e8ecf6', mist:'#233a5a', paal:'#8d97b8', nacht:true }
  };
  var MIST = 8;

  /* ---------- een voertuig, van achteren gezien ----------
     cx is het midden, by de onderkant, w de breedte. f is de fase (trappen,
     een draaiende schroef). Ook de garage tekent hiermee. */
  function rrect(c, x, y, w, h, r){
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function wiel(c, x, y, w, h){ c.fillStyle = '#1b2036'; rrect(c, x, y, w, h, w * .35); c.fill(); c.fillStyle = '#343c58'; c.fillRect(x + w * .2, y + h * .22, w * .6, h * .1); c.fillRect(x + w * .2, y + h * .55, w * .6, h * .1); }
  function tekenVoertuig(c, soort, kleur, cx, by, w, f, schaduw){
    var u = w / 100, donker = tint(kleur, -.28), licht = tint(kleur, .35);
    if (schaduw !== false){ c.fillStyle = 'rgba(10,16,40,.28)'; c.beginPath(); c.ellipse(cx, by - u, 52 * u, 7 * u, 0, 0, Math.PI * 2); c.fill(); }
    if (soort === 'fiets' || soort === 'step'){
      var fiets = soort === 'fiets', trap = Math.sin(f * 9) * (fiets ? 7 : 0);
      /* achterwiel en spatbord */
      wiel(c, cx - 4.5 * u, by - (fiets ? 36 : 20) * u, 9 * u, (fiets ? 36 : 20) * u);
      c.fillStyle = kleur; rrect(c, cx - 6 * u, by - (fiets ? 40 : 24) * u, 12 * u, 6 * u, 3 * u); c.fill();
      if (!fiets){ c.fillStyle = '#39415f'; rrect(c, cx - 9 * u, by - 26 * u, 18 * u, 5 * u, 2 * u); c.fill(); }
      /* benen */
      c.strokeStyle = '#33405f'; c.lineCap = 'round'; c.lineWidth = 7 * u;
      var heup = by - (fiets ? 46 : 64) * u;
      c.beginPath(); c.moveTo(cx - 6 * u, heup); c.lineTo(cx - (fiets ? 10 : 7) * u, by - (fiets ? 18 + trap : 27) * u); c.stroke();
      c.beginPath(); c.moveTo(cx + 6 * u, heup); c.lineTo(cx + (fiets ? 10 : 7) * u, by - (fiets ? 18 - trap : 27) * u); c.stroke();
      /* schoenen */
      c.fillStyle = '#14224C';
      c.beginPath(); c.ellipse(cx - (fiets ? 10 : 7) * u, by - (fiets ? 16 + trap : 26) * u, 5 * u, 3 * u, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(cx + (fiets ? 10 : 7) * u, by - (fiets ? 16 - trap : 26) * u, 5 * u, 3 * u, 0, 0, Math.PI * 2); c.fill();
      /* stuur */
      var stuurY = by - (fiets ? 62 : 84) * u;
      if (!fiets){ c.strokeStyle = '#39415f'; c.lineWidth = 3 * u; c.beginPath(); c.moveTo(cx, by - 24 * u); c.lineTo(cx, stuurY); c.stroke(); }
      c.strokeStyle = '#2a3150'; c.lineWidth = 3.4 * u; c.beginPath(); c.moveTo(cx - 25 * u, stuurY); c.lineTo(cx + 25 * u, stuurY); c.stroke();
      /* romp met rugzak */
      var romp = heup - 34 * u;
      c.strokeStyle = donker; c.lineWidth = 6 * u;
      c.beginPath(); c.moveTo(cx - 14 * u, romp + 6 * u); c.lineTo(cx - 23 * u, stuurY); c.stroke();
      c.beginPath(); c.moveTo(cx + 14 * u, romp + 6 * u); c.lineTo(cx + 23 * u, stuurY); c.stroke();
      c.fillStyle = kleur; rrect(c, cx - 16 * u, romp, 32 * u, 38 * u, 11 * u); c.fill();
      c.fillStyle = '#EA9836'; rrect(c, cx - 10 * u, romp + 6 * u, 20 * u, 22 * u, 5 * u); c.fill();
      c.fillStyle = 'rgba(20,34,76,.25)'; c.fillRect(cx - 10 * u, romp + 14 * u, 20 * u, 2 * u);
      /* helm */
      c.fillStyle = licht; c.beginPath(); c.arc(cx, romp - 10 * u, 12 * u, 0, Math.PI * 2); c.fill();
      c.fillStyle = kleur; c.fillRect(cx - 2.5 * u, romp - 22 * u, 5 * u, 24 * u);
      return;
    }
    if (soort === 'zweef'){
      var gloed = c.createRadialGradient(cx, by - 4 * u, 4 * u, cx, by - 4 * u, 56 * u);
      gloed.addColorStop(0, 'rgba(131,165,242,.75)'); gloed.addColorStop(1, 'rgba(131,165,242,0)');
      c.fillStyle = gloed; c.fillRect(cx - 60 * u, by - 20 * u, 120 * u, 26 * u);
      var zweef = Math.sin(f * 3) * 2 * u;
      c.fillStyle = donker; rrect(c, cx - 50 * u, by - 30 * u + zweef, 100 * u, 22 * u, 11 * u); c.fill();
      c.fillStyle = kleur; rrect(c, cx - 46 * u, by - 40 * u + zweef, 92 * u, 22 * u, 11 * u); c.fill();
      /* koepel */
      c.fillStyle = 'rgba(200,222,255,.85)'; c.beginPath(); c.ellipse(cx, by - 42 * u + zweef, 20 * u, 13 * u, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#14224C'; c.beginPath(); c.arc(cx, by - 46 * u + zweef, 7 * u, 0, Math.PI * 2); c.fill();
      /* de schroef achterop */
      c.strokeStyle = '#2a3150'; c.lineWidth = 3 * u; c.beginPath(); c.arc(cx, by - 58 * u + zweef, 17 * u, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = licht; c.lineWidth = 4 * u;
      for (var b = 0; b < 3; b++){
        var a = f * 14 + b * 2.094;
        c.beginPath(); c.moveTo(cx, by - 58 * u + zweef); c.lineTo(cx + Math.cos(a) * 15 * u, by - 58 * u + zweef + Math.sin(a) * 15 * u); c.stroke();
      }
      c.fillStyle = '#FBF6F1'; c.fillRect(cx - 38 * u, by - 32 * u + zweef, 10 * u, 4 * u); c.fillRect(cx + 28 * u, by - 32 * u + zweef, 10 * u, 4 * u);
      return;
    }
    var auto = soort === 'auto';
    /* banden */
    wiel(c, cx - 50 * u, by - (auto ? 22 : 26) * u, (auto ? 18 : 20) * u, (auto ? 22 : 26) * u);
    wiel(c, cx + (auto ? 32 : 30) * u, by - (auto ? 22 : 26) * u, (auto ? 18 : 20) * u, (auto ? 22 : 26) * u);
    if (auto){
      /* carrosserie, ruit, lampen, spoiler */
      c.fillStyle = donker; rrect(c, cx - 46 * u, by - 26 * u, 92 * u, 16 * u, 6 * u); c.fill();
      c.fillStyle = kleur;
      c.beginPath(); c.moveTo(cx - 44 * u, by - 20 * u); c.lineTo(cx - 38 * u, by - 44 * u); c.lineTo(cx + 38 * u, by - 44 * u); c.lineTo(cx + 44 * u, by - 20 * u); c.closePath(); c.fill();
      c.fillStyle = 'rgba(20,34,76,.8)'; c.beginPath(); c.moveTo(cx - 28 * u, by - 44 * u); c.lineTo(cx - 22 * u, by - 58 * u); c.lineTo(cx + 22 * u, by - 58 * u); c.lineTo(cx + 28 * u, by - 44 * u); c.closePath(); c.fill();
      c.fillStyle = kleur; rrect(c, cx - 24 * u, by - 62 * u, 48 * u, 6 * u, 3 * u); c.fill();
      c.fillStyle = '#ff5a4a'; rrect(c, cx - 40 * u, by - 34 * u, 16 * u, 6 * u, 3 * u); c.fill(); rrect(c, cx + 24 * u, by - 34 * u, 16 * u, 6 * u, 3 * u); c.fill();
      c.fillStyle = '#FBF6F1'; rrect(c, cx - 10 * u, by - 32 * u, 20 * u, 7 * u, 2 * u); c.fill();
      c.fillStyle = '#2a3150'; c.fillRect(cx - 34 * u, by - 52 * u, 3 * u, 10 * u); c.fillRect(cx + 31 * u, by - 52 * u, 3 * u, 10 * u);
      c.fillStyle = tint(kleur, -.45); rrect(c, cx - 44 * u, by - 56 * u, 88 * u, 6 * u, 2 * u); c.fill();
      c.fillStyle = '#8d97b8'; c.beginPath(); c.arc(cx + 16 * u, by - 14 * u, 3.4 * u, 0, Math.PI * 2); c.fill();
      return;
    }
    /* de kart: as, bak, stoel, bestuurder met helm, spoiler */
    c.fillStyle = '#39415f'; c.fillRect(cx - 32 * u, by - 18 * u, 64 * u, 5 * u);
    c.fillStyle = kleur;
    c.beginPath(); c.moveTo(cx - 32 * u, by - 10 * u); c.lineTo(cx - 27 * u, by - 34 * u); c.lineTo(cx + 27 * u, by - 34 * u); c.lineTo(cx + 32 * u, by - 10 * u); c.closePath(); c.fill();
    c.fillStyle = licht; c.fillRect(cx - 27 * u, by - 24 * u, 54 * u, 3 * u);
    c.fillStyle = '#ff5a4a'; rrect(c, cx - 24 * u, by - 18 * u, 9 * u, 5 * u, 2 * u); c.fill(); rrect(c, cx + 15 * u, by - 18 * u, 9 * u, 5 * u, 2 * u); c.fill();
    c.fillStyle = '#2a3150'; rrect(c, cx - 14 * u, by - 50 * u, 28 * u, 18 * u, 5 * u); c.fill();
    c.fillStyle = '#FBF6F1'; c.beginPath(); c.ellipse(cx, by - 48 * u, 19 * u, 9 * u, 0, Math.PI, 0); c.fill();
    c.fillStyle = kleur; c.beginPath(); c.arc(cx, by - 62 * u, 13 * u, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FBF6F1'; c.fillRect(cx - 2.5 * u, by - 75 * u, 5 * u, 26 * u);
    c.fillStyle = '#2a3150'; c.fillRect(cx - 30 * u, by - 40 * u, 3 * u, 8 * u); c.fillRect(cx + 27 * u, by - 40 * u, 3 * u, 8 * u);
    c.fillStyle = donker; rrect(c, cx - 38 * u, by - 44 * u, 76 * u, 5 * u, 2 * u); c.fill();
    c.fillStyle = '#8d97b8'; c.beginPath(); c.arc(cx + 20 * u, by - 9 * u, 3 * u, 0, Math.PI * 2); c.fill();
  }

  /* ---------- de motor zelf ---------- */
  function maak(canvas, o){
    o = o || {};
    var ctx = canvas.getContext('2d', { alpha:false });
    var weinigBeweging = false;
    try { weinigBeweging = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e){}
    var W = 300, H = 300, dpr = 1, hor = 100, yAuto = 250, camH = 3000, D = 2700, F = 100, schaal = 1;
    var pal = PALET.licht, palNaam = '';
    var mist = {};   /* per kleur acht stappen naar de mist toe */
    var luchtTex = null, heuvelTex = null, sprites = {};
    /* de rit */
    var zCam = 0, v = 0, vDoel = 0, x = 0, baanDoel = 1, camX = 0, boost = 0, gasAan = false;
    var slipT = 0, slipDraai = 0, slipKlaar = false, kantel = 0;
    var pauze = true, loopt = false, racen = false, klok = 0, fase = 0, tempo = 1;
    var poorten = [], nPoorten = 15, afstand = 44000, zStart = 0, finishZ = 1e9, gefinisht = false;
    var wachtK = -1, wachtGemeld = false, HOUD = 1800;
    var voertuig = 'kart', kleur = '#204ECF', spoor = 'geen', spook = null, opname = { z:[], x:[] }, opnameKlok = 0;
    var seed = 1, laatst = 0, raf = 0, luchtX = 0;
    var texPool = [document.createElement('canvas'), document.createElement('canvas'), document.createElement('canvas')];
    /* per zichtbaar plakje: waar het op het scherm staat */
    var PX = new Float32Array(ZICHT + 1), PY = new Float32Array(ZICHT + 1), PS = new Float32Array(ZICHT + 1), PC = new Float32Array(ZICHT + 1), PZ = new Float32Array(ZICHT + 1);
    var paneelRect = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], paneelVan = -1;
    var muntDoel = [40, 30];
    /* deeltjes: een vaste poel */
    var DEEL = 260, dl = [];
    for (var di = 0; di < DEEL; di++) dl.push({ aan:false, x:0, y:0, vx:0, vy:0, t:0, max:1, soort:0, kleur:'#fff', r:3, a:0 });
    var spoorX = new Float32Array(24), spoorN = 0, spoorTik = 0;
    var remSporen = [];
    /* de anderen in een race: waar ze volgens de laatste melding zijn (doel), hoe snel ze gaan (v) en waar ze nu getekend staan (z) */
    var rivalen = [], RIVAALKLEUR = ['#F26749', '#EA9836', '#2f7d52', '#6b3fa0', '#83A5F2', '#D9A21B', '#2f9e8f', '#14224C'];

    function nu(){ return performance.now(); }
    function hash(i){ var h = (i * 2654435761 + seed * 97) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822507) >>> 0; h ^= h >>> 13; return h >>> 0; }
    function bocht(i){
      if (i < 40) return 0;
      var t = i + seed * 13;
      var b = 1.25 * Math.sin(t / 150) * Math.sin(t / 61 + 1.3) + 0.35 * Math.sin(t / 23 + seed);
      /* een aanloopje: de eerste bocht komt er zachtjes in */
      return i < 90 ? b * (i - 40) / 50 : b;
    }
    function hoogte(z){
      var i = z / SEG;
      if (i < 50) return 0;
      var t = i + seed * 7;
      var h = 1500 * Math.sin(t / 97) * Math.sin(t / 43 + 2.1);
      return i < 110 ? h * (i - 50) / 60 : h;
    }

    /* ---------- thema en maat ---------- */
    function donkerNu(){
      var t = document.documentElement.getAttribute('data-theme');
      if (t === 'dark') return true; if (t === 'light') return false;
      try { return matchMedia('(prefers-color-scheme: dark)').matches; } catch (e){ return false; }
    }
    function thema(){
      var naam = donkerNu() ? 'donker' : 'licht';
      if (naam === palNaam && luchtTex) return;
      palNaam = naam; pal = PALET[naam];
      mist = {};
      ['gras0', 'gras1', 'weg0', 'weg1', 'rand0', 'rand1', 'streep'].forEach(function(k){
        var basis = k === 'streep' ? pal.streep : pal[k.replace(/\d$/, '')][+k.slice(-1)];
        mist[k] = []; for (var i = 0; i < MIST; i++) mist[k].push(meng(basis, pal.mist, Math.pow(i / (MIST - 1), 1.2) * .92));
      });
      voorteken();
      teken();
    }
    function maat(){
      var r = canvas.parentNode.getBoundingClientRect();
      W = Math.max(200, Math.round(r.width)); H = Math.max(200, Math.round(r.height));
      /* Scherp, maar niet onbeperkt: op een digibord of een scherm met veel beeldpunten
         gaat het doek hoogstens 1,6 miljoen beeldpunten groot. Elke beeldpunt kost elk beeld. */
      dpr = Math.min(2, window.devicePixelRatio || 1, Math.sqrt(1.6e6 / Math.max(1, W * H)));
      dpr = Math.max(1, dpr);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      var onder = o.onder ? o.onder() : 0;
      yAuto = H - onder - Math.max(8, H * .02);
      var staand = W / H < .9;
      hor = Math.round(H * (staand ? .34 : .38));
      var span = Math.max(80, yAuto - hor);
      /* hoe breed de weg bij de auto is: op een telefoon bijna het hele scherm */
      var breed = staand ? W * .98 : Math.min(W * .72, span * 2.5);
      camH = 2 * HALF * span / breed;
      D = camH * .92;
      F = span * D / camH;
      schaal = span / camH;   /* beeldpunten per wereldeenheid bij de auto */
      /* waar de munten heen vliegen: de meter van de munten, als die er is */
      if (o.muntDoel){ var md = o.muntDoel(); if (md) muntDoel = md; }
      voorteken();
      teken();
    }

    /* ---------- voortekenen ---------- */
    function doek(w, h){ var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
    function voorteken(){
      if (!pal) return;
      /* lucht */
      var lh = hor + 4;
      luchtTex = doek(W * dpr, lh * dpr);
      var c = luchtTex.getContext('2d'); c.scale(dpr, dpr);
      var g = c.createLinearGradient(0, 0, 0, lh);
      g.addColorStop(0, pal.lucht[0]); g.addColorStop(.62, pal.lucht[1]); g.addColorStop(1, pal.lucht[2]);
      c.fillStyle = g; c.fillRect(0, 0, W, lh);
      if (pal.nacht){
        var r = 12345;
        for (var i = 0; i < 90; i++){ r = (r * 16807) % 2147483647; var sx = r % W; r = (r * 16807) % 2147483647; var sy = r % Math.max(1, lh * .8);
          c.fillStyle = 'rgba(255,255,255,' + (.35 + (i % 5) * .12) + ')'; c.fillRect(sx, sy, i % 7 === 0 ? 2 : 1.2, i % 7 === 0 ? 2 : 1.2); }
        c.fillStyle = pal.zon; c.beginPath(); c.arc(W * .78, lh * .3, Math.min(26, lh * .12), 0, Math.PI * 2); c.fill();
        c.fillStyle = pal.lucht[1]; c.beginPath(); c.arc(W * .78 + 9, lh * .3 - 5, Math.min(24, lh * .11), 0, Math.PI * 2); c.fill();
      } else {
        var zg = c.createRadialGradient(W * .72, lh * .62, 4, W * .72, lh * .62, lh * .5);
        zg.addColorStop(0, 'rgba(255,248,225,1)'); zg.addColorStop(.18, 'rgba(255,240,200,.9)'); zg.addColorStop(1, 'rgba(255,240,200,0)');
        c.fillStyle = zg; c.fillRect(0, 0, W, lh);
        /* een paar wolkjes */
        c.fillStyle = 'rgba(255,255,255,.75)';
        [[.16, .28, 1], [.45, .18, .8], [.86, .36, .9]].forEach(function(w){
          var wx = W * w[0], wy = lh * w[1], s = Math.min(1, W / 700) * 22 * w[2];
          c.beginPath(); c.ellipse(wx, wy, s * 2.2, s * .8, 0, 0, Math.PI * 2); c.ellipse(wx + s, wy - s * .5, s * 1.3, s * .9, 0, 0, Math.PI * 2); c.ellipse(wx - s, wy - s * .3, s, s * .7, 0, 0, Math.PI * 2); c.fill();
        });
      }
      /* heuvels: twee lagen, breder dan het scherm zodat ze kunnen schuiven */
      var hh = Math.max(30, H * .16), hw = W * 2;
      /* twee lagen onder elkaar, met een lege strook ertussen: anders lekt de ene laag bij het schalen in de andere */
      heuvelTex = doek(hw * dpr, (hh * 2 + 8) * dpr);
      var hc = heuvelTex.getContext('2d'); hc.scale(dpr, dpr);
      [[pal.heuvel1, .55, 3.1, 0], [pal.heuvel2, .95, 5.3, hh + 8]].forEach(function(l){
        hc.fillStyle = l[0]; hc.beginPath(); hc.moveTo(0, hh + l[3]);
        for (var px = 0; px <= hw; px += 8){
          var t = px / hw * Math.PI * 2;
          var y = hh - hh * l[1] * (.55 + .25 * Math.sin(t * 2 + l[2]) + .2 * Math.sin(t * 5 + l[2] * 2));
          hc.lineTo(px, y + l[3]);
        }
        hc.lineTo(hw, hh + l[3]); hc.closePath(); hc.fill();
      });
      if (!pal.nacht){
        /* molentjes op de verre heuvels */
        hc.fillStyle = 'rgba(57,65,95,.35)';
        [.2, .63, 1.2, 1.7].forEach(function(p){ var mx = W * p, my = hh * .55; hc.fillRect(mx - 2, my - 14, 4, 16); hc.fillRect(mx - 9, my - 15, 18, 2); hc.fillRect(mx - 1, my - 23, 2, 18); });
      }
      /* de bomen, struiken en lantaarns: een keer, op een vaste maat */
      sprites = {};
      sprites.boom = spriteBoom(false); sprites.den = spriteBoom(true); sprites.struik = spriteStruik(); sprites.lamp = spriteLamp();
      sprites.blok = spriteBlok(); sprites.molen = spriteMolen();
      sprites.bord1 = spriteBord('Lees de vraag'); sprites.bord2 = spriteBord('Kijk vooruit'); sprites.bord3 = spriteBord('Poortrace');
      sprites.gordijn = [0, 1, 2].map(function(b){ return spriteGordijn(BAANKLEUR[b][0]); });
      sprites.gordijnGoed = spriteGordijn(GOED);
      sprites.start = spriteBanier('START', false); sprites.finish = spriteBanier('FINISH', true);
    }
    function spriteBoom(den){
      var c = doek(160, 240), g = c.getContext('2d');
      g.fillStyle = pal.nacht ? '#3a2c24' : '#7a5236'; g.fillRect(72, 150, 16, 90);
      if (den){
        g.fillStyle = pal.nacht ? '#173a2c' : '#2f7d52';
        for (var i = 0; i < 3; i++){ g.beginPath(); g.moveTo(80, 10 + i * 45); g.lineTo(20 + i * 6, 110 + i * 45); g.lineTo(140 - i * 6, 110 + i * 45); g.closePath(); g.fill(); }
        g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.moveTo(80, 10); g.lineTo(80, 200); g.lineTo(140, 200); g.closePath(); g.fill();
      } else {
        g.fillStyle = pal.nacht ? '#1d4a36' : '#4f9e4a';
        [[80, 80, 62], [48, 118, 44], [114, 116, 46], [80, 132, 50]].forEach(function(b){ g.beginPath(); g.arc(b[0], b[1], b[2], 0, Math.PI * 2); g.fill(); });
        g.fillStyle = pal.nacht ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.14)'; g.beginPath(); g.arc(62, 62, 30, 0, Math.PI * 2); g.fill();
      }
      return c;
    }
    function spriteStruik(){ var c = doek(160, 90), g = c.getContext('2d'); g.fillStyle = pal.nacht ? '#1f5040' : '#5aa850';
      [[40, 60, 34], [80, 46, 40], [122, 60, 34]].forEach(function(b){ g.beginPath(); g.arc(b[0], b[1], b[2], 0, Math.PI * 2); g.fill(); });
      g.fillStyle = pal.nacht ? '#e0b0c8' : '#F26749'; [[60, 40], [100, 34], [120, 54]].forEach(function(b){ g.beginPath(); g.arc(b[0], b[1], 5, 0, Math.PI * 2); g.fill(); }); return c; }
    function spriteLamp(){ var c = doek(120, 320), g = c.getContext('2d');
      if (pal.nacht){ var gl = g.createRadialGradient(60, 40, 2, 60, 40, 58); gl.addColorStop(0, 'rgba(255,230,160,.9)'); gl.addColorStop(1, 'rgba(255,230,160,0)'); g.fillStyle = gl; g.fillRect(0, 0, 120, 110); }
      g.fillStyle = pal.paal; g.fillRect(55, 36, 10, 284); g.fillRect(30, 30, 60, 10);
      g.fillStyle = pal.nacht ? '#ffe6a0' : '#FBF6F1'; g.beginPath(); g.ellipse(60, 44, 22, 8, 0, 0, Math.PI * 2); g.fill(); return c; }
    function spriteBlok(){ var c = doek(240, 150), g = c.getContext('2d');
      for (var i = 0; i < 3; i++){ var y = 104 - i * 48; g.fillStyle = '#FBF6F1'; rrect(g, 12 + i * 6, y, 216 - i * 12, 44, 12); g.fill();
        g.save(); rrect(g, 12 + i * 6, y, 216 - i * 12, 44, 12); g.clip(); g.fillStyle = '#F26749';
        for (var s = -40; s < 260; s += 40){ g.beginPath(); g.moveTo(s, y + 44); g.lineTo(s + 20, y + 44); g.lineTo(s + 40, y); g.lineTo(s + 20, y); g.closePath(); g.fill(); } g.restore(); }
      return c; }
    function spriteMolen(){ var c = doek(200, 320), g = c.getContext('2d');
      g.fillStyle = pal.nacht ? '#2b3558' : '#7a5236'; g.beginPath(); g.moveTo(70, 320); g.lineTo(84, 120); g.lineTo(116, 120); g.lineTo(130, 320); g.closePath(); g.fill();
      g.fillStyle = pal.nacht ? '#3a4568' : '#9b6b45'; g.beginPath(); g.moveTo(78, 124); g.lineTo(100, 92); g.lineTo(122, 124); g.closePath(); g.fill();
      g.fillStyle = pal.nacht ? '#ffe6a0' : '#FBF6F1'; g.fillRect(92, 250, 16, 26); return c; }
    function spriteBord(tekst){ var c = doek(360, 200), g = c.getContext('2d');
      g.fillStyle = pal.paal; g.fillRect(60, 110, 12, 90); g.fillRect(288, 110, 12, 90);
      g.fillStyle = '#FBF6F1'; rrect(g, 10, 10, 340, 110, 18); g.fill(); g.strokeStyle = '#204ECF'; g.lineWidth = 8; rrect(g, 14, 14, 332, 102, 15); g.stroke();
      g.fillStyle = '#14224C'; g.font = '700 40px Poppins, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tekst, 180, 66, 310); return c; }
    function spriteGordijn(kl){ var c = doek(32, 128), g = c.getContext('2d'); var gr = g.createLinearGradient(0, 0, 0, 128);
      gr.addColorStop(0, kl); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.globalAlpha = .3; g.fillStyle = gr; g.fillRect(0, 0, 32, 128); return c; }
    function spriteBanier(tekst, ruit){ var c = doek(1240, 170), g = c.getContext('2d');
      if (ruit){ for (var i = 0; i < 31; i++) for (var j = 0; j < 4; j++){ g.fillStyle = (i + j) % 2 ? '#14224C' : '#FBF6F1'; g.fillRect(i * 40, j * 42.5, 40, 42.5); } }
      else { g.fillStyle = '#204ECF'; g.fillRect(0, 0, 1240, 170); }
      g.fillStyle = ruit ? '#F26749' : '#FBF6F1'; rrect(g, 420, 30, 400, 110, 24); g.fill();
      g.fillStyle = ruit ? '#14224C' : '#204ECF'; g.font = '800 72px Poppins, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tekst, 620, 88); return c; }

    /* ---------- de panelen van een poort ---------- */
    var PW = 400, PH = 150, PG = 20;
    function paneelTex(p){
      var c = texPool[p.k % 3];
      if (c.width !== 3 * PW + 2 * PG){ c.width = 3 * PW + 2 * PG; c.height = PH; }
      var g = c.getContext('2d');
      g.clearRect(0, 0, c.width, c.height);
      for (var b = 0; b < 3; b++){
        var px = b * (PW + PG), baan = p.banen[b];
        var goedB = p.goed === b, gekozenB = p.gekozen === b, klaar = p.gekozen >= 0;
        var vlak = !baan ? '#8d97b8' : klaar ? (goedB ? GOED : gekozenB ? FOUT : '#8d97b8') : BAANKLEUR[b][0];
        var inkt = !baan ? '#14224C' : klaar ? (goedB ? '#FFFFFF' : '#14224C') : BAANKLEUR[b][1];
        g.fillStyle = 'rgba(10,16,40,.35)'; rrect(g, px + 4, 8, PW - 4, PH - 8, 26); g.fill();
        g.fillStyle = vlak; rrect(g, px, 0, PW - 4, PH - 8, 26); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 6; rrect(g, px + 5, 5, PW - 14, PH - 18, 22); g.stroke();
        if (!baan){
          g.save(); rrect(g, px, 0, PW - 4, PH - 8, 26); g.clip(); g.strokeStyle = 'rgba(20,34,76,.22)'; g.lineWidth = 14;
          for (var s = -PH; s < PW; s += 36){ g.beginPath(); g.moveTo(px + s, PH); g.lineTo(px + s + PH, 0); g.stroke(); } g.restore();
          g.fillStyle = '#14224C'; g.font = '700 40px Poppins, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('dicht', px + PW / 2, PH / 2 - 4);
          continue;
        }
        /* het nummer: dezelfde toets als op het toetsenbord */
        var teken = klaar && goedB ? '✓' : klaar && gekozenB ? '✗' : String(b + 1);
        g.fillStyle = inkt === '#FFFFFF' ? 'rgba(255,255,255,.22)' : 'rgba(20,34,76,.14)';
        g.beginPath(); g.arc(px + 40, 40, 26, 0, Math.PI * 2); g.fill();
        g.fillStyle = inkt; g.font = '800 32px Poppins, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(teken, px + 40, 42);
        /* het antwoord zo groot als past, zo nodig op twee regels */
        var t = baan.tekst, maxW = PW - 100, grootte = 62, regels = [t];
        g.font = '700 ' + grootte + 'px Poppins, system-ui, sans-serif';
        var bw = g.measureText(t).width;
        if (bw > maxW){
          grootte = Math.max(24, Math.floor(grootte * maxW / bw));
          if (grootte < 40 && t.indexOf(' ') > 0){
            var mid = t.length / 2, beste = -1;
            for (var i = 0; i < t.length; i++) if (t.charAt(i) === ' ' && (beste < 0 || Math.abs(i - mid) < Math.abs(beste - mid))) beste = i;
            regels = [t.slice(0, beste), t.slice(beste + 1)];
            g.font = '700 50px Poppins, system-ui, sans-serif';
            var w2 = Math.max(g.measureText(regels[0]).width, g.measureText(regels[1]).width);
            grootte = Math.min(50, Math.floor(50 * (PW - 70) / w2));
          }
        }
        g.font = '700 ' + grootte + 'px Poppins, system-ui, sans-serif'; g.fillStyle = inkt;
        var midX = px + (regels.length > 1 ? PW / 2 + 14 : 58 + (PW - 58) / 2) - 2;
        if (regels.length > 1){ g.fillText(regels[0], midX, PH / 2 - 4 - grootte * .55, PW - 76); g.fillText(regels[1], midX, PH / 2 - 4 + grootte * .55, PW - 76); }
        else g.fillText(t, midX, PH / 2 - 2, maxW);
      }
      p.tex = c;
    }

    /* ---------- deeltjes ---------- */
    function deel(soort, x0, y0, vx, vy, t, kl, r){
      for (var i = 0; i < DEEL; i++){ var d = dl[i]; if (d.aan) continue;
        d.aan = true; d.soort = soort; d.x = x0; d.y = y0; d.vx = vx; d.vy = vy; d.t = 0; d.max = t; d.kleur = kl; d.r = r; d.a = Math.random() * 6.28; d.x0 = x0; d.y0 = y0; return d; }
      return null;
    }
    var CONFETTI = ['#F26749', '#EA9836', '#204ECF', '#83A5F2', '#2f7d52', '#FBF6F1'];
    function barst(x0, y0, kl, n, kracht){
      n = weinigBeweging ? Math.round(n / 3) : n;
      for (var i = 0; i < n; i++){ var a = Math.random() * Math.PI * 2, s = (0.35 + Math.random()) * kracht;
        deel(i % 3 ? 1 : 2, x0, y0, Math.cos(a) * s, Math.sin(a) * s - kracht * .4, .7 + Math.random() * .5, i % 4 ? kl : '#FBF6F1', 2 + Math.random() * 3); }
    }

    /* ---------- bijwerken ---------- */
    function zAuto(){ return zCam + D; }
    function openBanen(){ var p = poorten[huidigeK()]; return p ? p.banen : [1, 1, 1]; }
    function huidigeK(){ for (var i = 0; i < poorten.length; i++) if (poorten[i] && poorten[i].gekozen < 0 && poorten[i].actief) return i; return -1; }
    function dichtsteOpen(b){
      var ob = openBanen(); if (ob[b]) return b;
      var beste = -1; for (var i = 0; i < 3; i++) if (ob[i] && (beste < 0 || Math.abs(i - b) < Math.abs(beste - b))) beste = i;
      return beste < 0 ? b : beste;
    }
    function werk(dt){
      fase += dt;
      if (!racen){ v += (0 - v) * Math.min(1, dt * 3); }
      else {
        boost = Math.max(0, boost - dt / 1.2);
        var doel = vDoel * (1 + .6 * boost) * (gasAan ? 1.5 : 1);
        /* rustige stand: de poort wacht, dus je remt af tot vlak ervoor */
        if (wachtK >= 0 && poorten[wachtK]){
          var stop = poorten[wachtK].z - HOUD, rest = stop - zAuto();
          var mag = Math.sqrt(Math.max(0, 2 * 5200 * rest));
          if (mag < doel) doel = mag;
          if (rest <= 4 && !wachtGemeld){ wachtGemeld = true; v = 0; zCam = stop - D; if (o.wacht) o.wacht(wachtK); }
        }
        if (slipT > 0){
          slipT = Math.max(0, slipT - dt);
          doel = vDoel * .22;
          slipDraai = 1 - slipT / .9;
          if (slipT === 0 && !slipKlaar){ slipKlaar = true; if (o.geremd) o.geremd(); }
        }
        if (gefinisht){ doel = 0; }
        var acc = doel > v ? 1.5 : 3.2;
        v += (doel - v) * Math.min(1, dt * acc);
        if (Math.abs(v) < 1 && doel === 0) v = 0;
        klok += dt;
        opnameKlok += dt;
        if (opnameKlok >= .2 && !gefinisht){ opnameKlok -= .2; opname.z.push(Math.round((zAuto() - zStart) / 10)); opname.x.push(Math.round(x * 100)); }
      }
      zCam += v * dt;
      /* de anderen schuiven door: naar hun laatste plek plus wat ze sindsdien gereden kunnen hebben, nooit meer dan anderhalve melding vooruit */
      for (var ri = 0; ri < rivalen.length; ri++){
        var rv = rivalen[ri]; rv.sinds += dt;
        var naar = rv.doel + rv.v * Math.min(rv.sinds, 1.5);
        rv.z += (naar - rv.z) * Math.min(1, dt * 2.5);
      }
      /* sturen: naar het midden van de gekozen baan */
      var doelX = LAAN[baanDoel], dx = doelX - x, stap = 3.4 * dt;
      var oudX = x;
      x += Math.abs(dx) < stap ? dx : (dx > 0 ? stap : -stap);
      kantel += (((x - oudX) / Math.max(dt, .001)) * .05 - kantel) * Math.min(1, dt * 10);
      camX += (x * HALF * .72 - camX) * Math.min(1, dt * 5);
      luchtX += bocht(Math.floor(zCam / SEG)) * v * dt * .0009;
      /* door een poort */
      var za = zAuto();
      for (var k = 0; k < poorten.length; k++){
        var p = poorten[k];
        if (!p || !p.actief || p.gekozen >= 0 || za < p.z) continue;
        var baan = 0, best = 9;
        for (var b = 0; b < 3; b++) if (p.banen[b] && Math.abs(LAAN[b] - x) < best){ best = Math.abs(LAAN[b] - x); baan = b; }
        p.gekozen = baan;   /* voorlopig; uitslag() zet ook wat goed was */
        if (wachtK === k){ wachtK = -1; }
        if (o.poort) o.poort(k, baan);
      }
      if (!gefinisht && za >= finishZ && racen){ gefinisht = true; if (o.finish) o.finish(); barstFinish(); }
      /* het spoor: de plek van het voertuig op het scherm, een paar beelden terug */
      spoorTik += dt;
      if (spoorTik > 1 / 40){ spoorTik = 0; for (var s = spoorX.length - 1; s > 0; s--) spoorX[s] = spoorX[s - 1]; spoorX[0] = autoSchermX(); spoorN = Math.min(spoorX.length, spoorN + 1); }
      if (racen && v > 500 && spoor !== 'geen' && spoor !== 'regenboog' && !weinigBeweging && Math.random() < dt * (spoor === 'bellen' ? 10 : 22)){
        var ax = autoSchermX() + (Math.random() - .5) * autoBreed() * .5, ay = yAuto - autoBreed() * .1;
        if (spoor === 'vonken') deel(4, ax, ay, (Math.random() - .5) * 60, 60 + Math.random() * 90, .5, Math.random() < .5 ? '#EA9836' : '#FFE168', 2);
        else if (spoor === 'bellen') deel(5, ax, ay, (Math.random() - .5) * 30, 40 + Math.random() * 40, .9, '#83A5F2', 3 + Math.random() * 5);
        else if (spoor === 'sterren') deel(6, ax, ay, (Math.random() - .5) * 70, 50 + Math.random() * 70, .8, Math.random() < .5 ? '#FFE168' : '#FBF6F1', 4 + Math.random() * 3);
      }
      /* deeltjes */
      for (var i = 0; i < DEEL; i++){
        var d = dl[i]; if (!d.aan) continue;
        d.t += dt; if (d.t >= d.max){ d.aan = false; continue; }
        if (d.soort === 3){ continue; }   /* munt: rekent zijn plek zelf uit bij het tekenen */
        d.x += d.vx * dt; d.y += d.vy * dt;
        if (d.soort === 1 || d.soort === 2 || d.soort === 7) d.vy += 520 * dt;
        if (d.soort === 5) d.vy -= 30 * dt;
        d.a += dt * 6;
      }
      if (o.tik) o.tik(klok);
    }
    function autoBreed(){ return (voertuig === 'fiets' || voertuig === 'step' ? 700 : 1100) * schaal; }
    function autoSchermX(){ return W / 2 + (x * HALF - camX) * schaal; }
    function barstFinish(){
      if (weinigBeweging) return;
      for (var i = 0; i < 90; i++) deel(7, W * Math.random(), -10 - Math.random() * 60, (Math.random() - .5) * 80, 60 + Math.random() * 120, 2.4 + Math.random(), CONFETTI[i % CONFETTI.length], 4 + Math.random() * 4);
    }

    /* ---------- tekenen ---------- */
    function teken(){
      if (!luchtTex) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* lucht en heuvels */
      ctx.drawImage(luchtTex, 0, 0, W, hor + 4);
      var hh = Math.max(30, H * .16), hw = W * 2;
      for (var laag = 0; laag < 2; laag++){
        var off = ((luchtX * (laag ? 60 : 30)) % hw + hw) % hw;
        var sy = laag * (hh + 8) * dpr, sh = hh * dpr;
        ctx.drawImage(heuvelTex, 0, sy, hw * dpr, sh, -off, hor - hh + 2, hw, hh);
        ctx.drawImage(heuvelTex, 0, sy, hw * dpr, sh, hw - off, hor - hh + 2, hw, hh);
      }
      /* De grond: elk plakje tekent zijn eigen strook gras. Alleen tussen het verste plakje
         en de horizon komt nog een vlak in de mistkleur (verderop, na de lus). */
      var basis = Math.floor(zCam / SEG), pct = (zCam - basis * SEG) / SEG;
      var camY = camH + hoogte(zAuto());
      var xo = 0, dxo = -bocht(basis) * pct, maxy = H, hVolg = hoogte(basis * SEG);
      /* Ver weg is een plakje minder dan een beeldpunt hoog. Die plakjes gaan samen in een stuk
         (hoogstens tweeënhalve beeldpunt), anders tekent elk beeld honderden vlakjes die niemand ziet. */
      var stuk = false, sx1 = 0, sy1 = 0, sw1 = 0, sx2 = 0, sy2 = 0, sw2 = 0, slvl = 0, seven = 0;
      for (var n = 0; n < ZICHT; n++){
        var i = basis + n, z1 = i * SEG - zCam, z2 = z1 + SEG;
        var s1 = z1 > 1 ? F / z1 : 0, s2 = F / z2;
        var x1 = W / 2 + s1 * (xo - camX), x2 = W / 2 + s2 * (xo + dxo - camX);
        var h1 = hVolg; hVolg = hoogte((i + 1) * SEG);
        var y1 = hor - s1 * (h1 - camY), y2 = hor - s2 * (hVolg - camY);
        PX[n] = x1; PY[n] = y1; PS[n] = s1; PC[n] = maxy; PZ[n] = z1;
        xo += dxo; dxo += bocht(i);
        if (z1 <= 1 || y2 >= y1 || y2 >= maxy){ if (z1 <= 1){ PS[n] = 0; } if (stuk){ tekenStuk(sx1, sy1, sw1, sx2, sy2, sw2, slvl, seven, 0, true); stuk = false; } continue; }
        var w1 = s1 * HALF, w2 = s2 * HALF, lvl = Math.min(MIST - 1, Math.floor(Math.pow(n / ZICHT, 1.5) * MIST));
        var even = Math.floor(i / RUMBLE) % 2;
        /* half achter een heuvelrug: alleen het deel dat boven de rug uitsteekt */
        if (y1 > maxy){ var t = (maxy - y2) / (y1 - y2); x1 = x2 + (x1 - x2) * t; w1 = w2 + (w1 - w2) * t; y1 = maxy; }
        var bij = bijzonder(i);
        if (y1 - y2 < 1.2 && !bij){
          if (!stuk){ stuk = true; sx1 = x1; sy1 = y1; sw1 = w1; slvl = lvl; seven = even; }
          sx2 = x2; sy2 = y2; sw2 = w2;
          if (sy1 - sy2 >= 2.5){ tekenStuk(sx1, sy1, sw1, sx2, sy2, sw2, slvl, seven, 0, true); stuk = false; }
          maxy = y2; continue;
        }
        if (stuk){ tekenStuk(sx1, sy1, sw1, sx2, sy2, sw2, slvl, seven, 0, true); stuk = false; }
        tekenStuk(x1, y1, w1, x2, y2, w2, lvl, even, bij, false);
        maxy = y2;
      }
      if (stuk) tekenStuk(sx1, sy1, sw1, sx2, sy2, sw2, slvl, seven, 0, true);
      if (maxy > hor){ ctx.fillStyle = mist.gras0[MIST - 1]; ctx.fillRect(0, hor, W, Math.ceil(maxy - hor) + 1); }
      /* van achter naar voren: bomen, poorten, het spook, en het voertuig zodra alles erachter staat */
      var autoGetekend = false;
      for (var m = ZICHT - 1; m >= 0; m--){
        if (!autoGetekend && PZ[m] < D - SEG * .5){ tekenAuto(); autoGetekend = true; }
        if (PS[m] <= 0) continue;
        tekenBijPlakje(basis + m, m);
      }
      if (!autoGetekend) tekenAuto();
      tekenDeeltjes();
      if (boost > 0 && !weinigBeweging) snelheidsLijnen();
    }
    /* een stuk weg: gras, randen, asfalt en de strepen. Naden: het gras op hele beeldpunten, zodat
       twee stroken precies aansluiten, en het asfalt loopt een fractie door over het stuk ervoor. */
    function tekenStuk(x1, y1, w1, x2, y2, w2, lvl, even, bij, samen){
      var gy = Math.round(y2), gh = Math.round(y1) - gy;
      if (gh > 0){ ctx.fillStyle = even ? mist.gras0[lvl] : mist.gras1[lvl]; ctx.fillRect(0, gy, W, gh); }
      var r1 = w1 / 6, r2 = w2 / 6, yv = y1 + .8;
      if (w1 > 4){
        ctx.fillStyle = mist[even ? 'rand0' : 'rand1'][lvl];
        vlak(x1 - w1 - r1, yv, x1 - w1, yv, x2 - w2, y2, x2 - w2 - r2, y2);
        vlak(x1 + w1 + r1, yv, x1 + w1, yv, x2 + w2, y2, x2 + w2 + r2, y2);
      }
      ctx.fillStyle = mist[even ? 'weg0' : 'weg1'][lvl];
      vlak(x1 - w1 - (w1 > 4 ? 0 : r1), yv, x1 + w1 + (w1 > 4 ? 0 : r1), yv, x2 + w2 + (w1 > 4 ? 0 : r2), y2, x2 - w2 - (w1 > 4 ? 0 : r2), y2);
      if (samen) return;
      /* bijzondere plakjes: de lijn van een poort, start en finish */
      if (bij && bij !== 2) poortStrepen(bij, x1, y1, w1, x2, y2, w2);
      else if (bij === 2) ruitjes(x1, y1, w1, x2, y2, w2);
      else if (even && w1 > 30){
        ctx.fillStyle = mist.streep[lvl];
        var l1 = w1 / 38, l2 = w2 / 38;
        for (var ln = -1; ln <= 1; ln += 2){ var lx1 = x1 + ln * w1 / 3, lx2 = x2 + ln * w2 / 3; vlak(lx1 - l1, y1, lx1 + l1, y1, lx2 + l2, y2, lx2 - l2, y2); }
      }
    }
    function vlak(ax, ay, bx, by, cx, cy, dx, dy){ ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.lineTo(dx, dy); ctx.closePath(); ctx.fill(); }
    /* de poort die op dit plakje staat (voor de gekleurde lijn eronder), of 2 voor start en finish (ruitjes) */
    function bijzonder(i){
      var z = i * SEG;
      if (z <= finishZ && finishZ < z + SEG * 2 && finishZ < 1e8) return 2;
      if (z <= zStart + 2 * SEG && zStart + 2 * SEG < z + SEG) return 2;
      for (var k = 0; k < poorten.length; k++){ var p = poorten[k]; if (p && p.actief && z <= p.z && p.z < z + SEG) return p; }
      return 0;
    }
    function poortStrepen(p, x1, y1, w1, x2, y2, w2){
      for (var b = 0; b < 3; b++){
        var a = -1 + b * 2 / 3, e = a + 2 / 3;
        ctx.fillStyle = p && !p.banen[b] ? '#8d97b8' : BAANKLEUR[b][0];
        vlak(x1 + a * w1, y1, x1 + e * w1, y1, x2 + e * w2, y2, x2 + a * w2, y2);
      }
    }
    function ruitjes(x1, y1, w1, x2, y2, w2){
      for (var b = 0; b < 8; b++){
        var a = -1 + b / 4, e = a + 1 / 4, mid = (y1 + y2) / 2;
        ctx.fillStyle = b % 2 ? '#14224C' : '#FBF6F1';
        vlak(x1 + a * w1, y1, x1 + e * w1, y1, (x1 + x2) / 2 + e * (w1 + w2) / 2, mid, (x1 + x2) / 2 + a * (w1 + w2) / 2, mid);
        ctx.fillStyle = b % 2 ? '#FBF6F1' : '#14224C';
        vlak((x1 + x2) / 2 + a * (w1 + w2) / 2, mid, (x1 + x2) / 2 + e * (w1 + w2) / 2, mid, x2 + e * w2, y2, x2 + a * w2, y2);
      }
    }
    /* een plaatje op de weg: wx is de plek in wereldeenheden vanaf het midden, ww en wh de maat */
    function plak(img, n, wx, ww, wh, alpha){
      var s = PS[n]; if (s <= 0) return;
      var w = ww * s, h = wh * s; if (w < 1.2) return;
      var sx = PX[n] + wx * s - w / 2, sy = PY[n] - h, clip = PC[n];
      if (sy >= clip) return;
      var over = Math.max(0, sy + h - clip);
      if (alpha !== undefined) ctx.globalAlpha = alpha;
      if (over > 0){ var bh = img.height * (1 - over / h); if (bh > 0) ctx.drawImage(img, 0, 0, img.width, bh, sx, sy, w, h - over); }
      else ctx.drawImage(img, sx, sy, w, h);
      if (alpha !== undefined) ctx.globalAlpha = 1;
    }
    function tekenBijPlakje(i, n){
      /* bomen en zo, vast per plakje */
      var h = hash(i), z = i * SEG;
      if (z > zStart - SEG * 2){
        var kant = h & 1 ? 1 : -1;
        if (i % 24 === 0) plak(sprites.lamp, n, (i % 48 ? 1 : -1) * HALF * 1.2, 700, 1860);
        else if (h % 9 === 0) plak(h % 27 === 0 ? sprites.den : sprites.boom, n, kant * HALF * (1.45 + (h >>> 5) % 100 / 60), 1500, 2250);
        else if (h % 11 === 1) plak(sprites.struik, n, kant * HALF * (1.3 + (h >>> 7) % 100 / 110), 1300, 730);
        else if (i % 170 === 85) { plak(sprites.molen, n, kant * HALF * 3.2, 3000, 4800); molenWieken(n, kant * HALF * 3.2); }
        else if (i % 130 === 60) plak(h & 2 ? sprites.bord1 : sprites.bord2, n, kant * HALF * 1.55, 1900, 1050);
      }
      /* start en finish */
      if (z <= zStart + 2 * SEG && zStart + 2 * SEG < z + SEG) banier(sprites.start, n);
      if (z <= finishZ && finishZ < z + SEG && finishZ < 1e8) banier(sprites.finish, n);
      /* het spook */
      if (spook && racen){
        var gz = spookZ();
        if (gz !== null && gz >= z && gz < z + SEG && gz - zCam > D * .7){
          var s = PS[n]; if (s > 0){ ctx.globalAlpha = .55; tekenVoertuig(ctx, spook.voertuig || 'kart', '#83A5F2', PX[n] + spookX() * HALF * s, PY[n], (voertuig === 'fiets' || voertuig === 'step' ? 700 : 1100) * s, fase, false); ctx.globalAlpha = 1; }
        }
      }
      /* de anderen in een race */
      for (var ri = 0; ri < rivalen.length; ri++){
        var rv = rivalen[ri];
        if (rv.z >= z && rv.z < z + SEG && rv.z - zCam > D * .7) tekenRivaal(rv, n);
      }
      /* de poorten */
      for (var k = 0; k < poorten.length; k++){
        var p = poorten[k];
        if (p && p.actief && p.z >= z && p.z < z + SEG) tekenPoort(p, n);
      }
    }
    function tekenRivaal(rv, n){
      var s = PS[n]; if (s <= 0) return;
      var bw = 1100 * s, cx = PX[n] + LAAN[rv.baan] * HALF * s, by = PY[n];
      if (bw < 3) return;
      ctx.globalAlpha = .6; tekenVoertuig(ctx, 'kart', rv.kleur, cx, by, bw, fase, false); ctx.globalAlpha = 1;
      /* de naam erboven, zodra hij te lezen is */
      if (bw < 26) return;
      var gr = Math.max(10, Math.min(15, bw * .16)), ty = by - bw * .92;
      ctx.font = '700 ' + gr + 'px Poppins, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var tw = ctx.measureText(rv.naam).width + gr;
      ctx.fillStyle = 'rgba(15,26,61,.78)'; rrect(ctx, cx - tw / 2, ty - gr * .8, tw, gr * 1.6, gr * .8); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.fillText(rv.naam, cx, ty + 1);
    }
    function molenWieken(n, wx){
      var s = PS[n]; if (s <= 0) return;
      var cx = PX[n] + wx * s, cy = PY[n] - 3900 * s, r = 1700 * s;
      if (cy > PC[n] || r < 2) return;
      ctx.strokeStyle = pal.nacht ? '#8d97b8' : '#FBF6F1'; ctx.lineWidth = Math.max(1, 160 * s); ctx.lineCap = 'round';
      var a0 = weinigBeweging ? .5 : fase * .9;
      for (var b = 0; b < 4; b++){ var a = a0 + b * Math.PI / 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke(); }
    }
    function banier(img, n){
      var s = PS[n]; if (s <= 0 || PY[n] - 2400 * s > PC[n]) return;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, PC[n]); ctx.clip();
      ctx.fillStyle = '#2a3150';
      var paalW = Math.max(1, 120 * s);
      ctx.fillRect(PX[n] - HALF * 1.1 * s - paalW / 2, PY[n] - 2400 * s, paalW, 2400 * s);
      ctx.fillRect(PX[n] + HALF * 1.1 * s - paalW / 2, PY[n] - 2400 * s, paalW, 2400 * s);
      ctx.drawImage(img, PX[n] - HALF * 1.1 * s, PY[n] - 2400 * s, HALF * 2.2 * s, 330 * s);
      ctx.restore();
    }
    function tekenPoort(p, n){
      var s = PS[n]; if (s <= 0) return;
      var x0 = PX[n], y0 = PY[n], clip = PC[n];
      if (y0 - 2200 * s > clip) return;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, clip); ctx.clip();
      /* de panelen hangen hoog genoeg dat je er zichtbaar onderdoor rijdt */
      var onder = 1670, boven = 2160, paal = Math.max(1, 90 * s);
      /* lichtgordijnen in de open banen, en blokken in een dichte */
      for (var b = 0; b < 3; b++){
        var a = -1 + b * 2 / 3, bx = x0 + (a + 1 / 3) * HALF * s;
        if (p.banen[b]){
          var gd = p.gekozen >= 0 && p.goed === b ? sprites.gordijnGoed : sprites.gordijn[b];
          ctx.drawImage(gd, x0 + (a + .03) * HALF * s, y0 - onder * s, (2 / 3 - .06) * HALF * s, onder * s);
        } else if (s * 1200 > 3){
          var bw = HALF * .56 * s, bh = bw * 150 / 240;
          ctx.drawImage(sprites.blok, bx - bw / 2, y0 - bh, bw, bh);
        }
      }
      /* palen tussen de banen, en de balk erboven */
      ctx.fillStyle = '#2a3150';
      for (var q = 0; q < 4; q++){ var qx = x0 + (-1 + q * 2 / 3) * HALF * s; ctx.fillRect(qx - paal / 2, y0 - boven * s, paal, boven * s); }
      ctx.fillRect(x0 - HALF * s - paal / 2, y0 - (boven + 70) * s, HALF * 2 * s + paal, 90 * s);
      /* de panelen met de antwoorden */
      if (p.tex){
        var pw = HALF * 2 * s * .985, ph = pw * PH / (3 * PW + 2 * PG), px = x0 - pw / 2, py = y0 - boven * s + 12 * s;
        ctx.drawImage(p.tex, px, py, pw, ph);
        if (p.k === paneelVan || paneelVan < 0){
          var dw = pw / (3 * PW + 2 * PG);
          for (var c = 0; c < 3; c++){ paneelRect[c][0] = px + c * (PW + PG) * dw + PW * dw / 2; paneelRect[c][1] = py + ph / 2; paneelRect[c][2] = PW * dw; }
        }
      }
      ctx.restore();
    }
    function tekenAuto(){
      var bw = autoBreed(), ax = autoSchermX(), by = yAuto;
      var hobbel = weinigBeweging || !racen ? 0 : Math.sin(fase * 22) * Math.min(1.5, v / 6000) * bw * .006;
      /* remsporen van een slip */
      if (slipT > 0 && !weinigBeweging){ ctx.fillStyle = 'rgba(20,24,40,.25)'; ctx.fillRect(ax - bw * .4, by - 2, bw * .16, H - by); ctx.fillRect(ax + bw * .24, by - 2, bw * .16, H - by); }
      /* het spoor achter het voertuig */
      if (spoor === 'regenboog' && spoorN > 2 && racen){
        var kleuren = ['#F26749', '#EA9836', '#FFE168', '#2f9e8f', '#204ECF', '#6b3fa0'], sw = bw * .09;
        for (var k = 0; k < kleuren.length; k++){
          ctx.strokeStyle = kleuren[k]; ctx.lineWidth = sw; ctx.globalAlpha = .85; ctx.beginPath();
          for (var j = 0; j < spoorN; j++){ var px = spoorX[j] + (k - 2.5) * sw, py = by - 4 + j * (H - by + 8) / (spoorX.length - 1); if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      ctx.save();
      ctx.translate(ax, by + hobbel);
      /* weinig beweging: alleen een wiebel in plaats van een hele draai */
      var e = slipDraai * (2 - slipDraai), draai = slipT > 0 ? (weinigBeweging ? Math.sin(slipDraai * Math.PI * 4) * .06 : e * Math.PI * 2) : 0;
      ctx.rotate(Math.max(-.22, Math.min(.22, kantel)) + draai);
      if (slipT > 0 && !weinigBeweging) ctx.scale(.8 + .2 * Math.cos(e * Math.PI * 4), 1);
      tekenVoertuig(ctx, voertuig, kleur, 0, 0, bw, fase);
      ctx.restore();
    }
    function tekenDeeltjes(){
      for (var i = 0; i < DEEL; i++){
        var d = dl[i]; if (!d.aan) continue;
        var f = d.t / d.max;
        if (d.soort === 3){
          /* een munt vliegt in een boog naar de muntmeter */
          var e = f * f * (3 - 2 * f), bx = d.x0 + (muntDoel[0] - d.x0) * e, by = d.y0 + (muntDoel[1] - d.y0) * e - Math.sin(f * Math.PI) * 60;
          ctx.fillStyle = '#E8B923'; ctx.beginPath(); ctx.arc(bx, by, d.r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#FFE168'; ctx.beginPath(); ctx.arc(bx - d.r * .25, by - d.r * .25, d.r * .5, 0, Math.PI * 2); ctx.fill();
          continue;
        }
        ctx.globalAlpha = Math.max(0, 1 - f);
        ctx.fillStyle = d.kleur;
        if (d.soort === 5){ ctx.strokeStyle = d.kleur; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.stroke(); }
        else if (d.soort === 6 || d.soort === 2){ ster(d.x, d.y, d.r * (d.soort === 2 ? 1.6 : 1), d.a); }
        else if (d.soort === 7){ ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.a); ctx.fillRect(-d.r, -d.r * .45, d.r * 2, d.r * .9); ctx.restore(); }
        else if (d.soort === 8){ ctx.beginPath(); ctx.arc(d.x, d.y, d.r * (1 + f * 1.8), 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(d.x - d.r / 2, d.y - d.r / 2, d.r, d.r);
      }
      ctx.globalAlpha = 1;
    }
    function ster(cx, cy, r, a){
      ctx.beginPath();
      for (var i = 0; i < 10; i++){ var rr = i % 2 ? r * .45 : r, aa = a + i * Math.PI / 5; if (i) ctx.lineTo(cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr); else ctx.moveTo(cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr); }
      ctx.closePath(); ctx.fill();
    }
    function snelheidsLijnen(){
      ctx.strokeStyle = 'rgba(255,255,255,' + (.45 * boost) + ')'; ctx.lineWidth = 2;
      var cx = W / 2, cy = hor;
      ctx.beginPath();
      for (var i = 0; i < 16; i++){
        var a = (i / 16) * Math.PI * 2 + (hash(i + Math.floor(fase * 20)) % 100) / 400;
        var r1 = Math.max(W, H) * (.35 + (hash(i * 7 + Math.floor(fase * 30)) % 100) / 300), r2 = r1 + Math.max(W, H) * .25;
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * .6); ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2 * .6);
      }
      ctx.stroke();
    }

    /* ---------- het spook: je beste rit ---------- */
    function spookIndex(){ if (!spook || !spook.z.length) return -1; return klok / .2; }
    function spookZ(){
      var f = spookIndex(); if (f < 0) return null;
      var i = Math.floor(f), t = f - i, z = spook.z;
      if (i >= z.length - 1) return zStart + z[z.length - 1] * 10;
      return zStart + (z[i] + (z[i + 1] - z[i]) * t) * 10;
    }
    function spookX(){
      var f = spookIndex(); if (f < 0) return 0;
      var i = Math.min(spook.x.length - 1, Math.floor(f)); return (spook.x[i] || 0) / 100;
    }
    /* hoeveel seconden het spook voor (min) of achter (plus) ligt, op jouw afstand */
    function spookVerschil(){
      if (!spook || !spook.z.length) return null;
      var d = (zAuto() - zStart) / 10, z = spook.z;
      if (d <= 0) return 0;
      if (d >= z[z.length - 1]) return klok - spook.t;
      var lo = 0, hi = z.length - 1;
      while (hi - lo > 1){ var mid = (lo + hi) >> 1; if (z[mid] < d) lo = mid; else hi = mid; }
      var t = lo * .2 + (z[hi] > z[lo] ? (d - z[lo]) / (z[hi] - z[lo]) * .2 : 0);
      return klok - t;
    }

    /* ---------- de lus ---------- */
    function lus(t){
      raf = 0;
      if (!loopt) return;
      var dt = Math.min(.05, Math.max(0, (t - laatst) / 1000)) * tempo; laatst = t;
      if (!pauze) werk(dt);
      else { /* stilstaand beeld: alleen de deeltjes lopen uit */
        for (var i = 0; i < DEEL; i++){ var d = dl[i]; if (d.aan){ d.t += dt; if (d.t >= d.max) d.aan = false; else if (d.soort !== 3){ d.x += d.vx * dt; d.y += d.vy * dt; if (d.soort === 7 || d.soort === 1 || d.soort === 2) d.vy += 520 * dt; } } }
      }
      teken();
      if (!pauze || actieveDeeltjes()) raf = requestAnimationFrame(lus);
    }
    function actieveDeeltjes(){ for (var i = 0; i < DEEL; i++) if (dl[i].aan) return true; return false; }
    function wek(){ if (!loopt) return; if (!raf){ laatst = nu(); raf = requestAnimationFrame(lus); } }

    /* thema volgen */
    document.addEventListener('themawissel', function(){ setTimeout(thema, 0); });
    try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', thema); } catch (e){}
    try { matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function(e){ weinigBeweging = e.matches; }); } catch (e){}
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ voorteken(); poorten.forEach(function(p){ if (p) paneelTex(p); }); teken(); });

    var api = {
      maat: maat, thema: thema,
      rit: function(r){
        r = r || {};
        nPoorten = r.poorten || 15; afstand = r.afstand || 44000;
        seed = 1 + Math.floor(Math.random() * 1000);
        zCam = 0; zStart = D; v = 0; vDoel = 0; x = 0; baanDoel = 1; camX = 0; boost = 0; gasAan = false;
        slipT = 0; slipDraai = 0; slipKlaar = false; kantel = 0; klok = 0; opnameKlok = 0; opname = { z:[], x:[] };
        racen = false; pauze = false; gefinisht = false; wachtK = -1; wachtGemeld = false;
        poorten = []; for (var k = 0; k < nPoorten; k++) poorten.push({ k:k, z:zStart + (k + 1) * afstand, banen:[null, null, null], actief:false, gekozen:-1, goed:-1, tex:null });
        finishZ = zStart + nPoorten * afstand + afstand * .4;
        HOUD = Math.max(1400, D * .7);
        if (r.voertuig) voertuig = r.voertuig; if (r.kleur) kleur = kleurVan(r.kleur); if (r.spoor) spoor = r.spoor;
        spook = r.spook && r.spook.z && r.spook.z.length ? r.spook : null;
        for (var i = 0; i < DEEL; i++) dl[i].aan = false;
        spoorN = 0; paneelVan = -1; rivalen = [];
        loopt = true; wek();
      },
      start: function(){ racen = true; pauze = false; wek(); },
      poort: function(k, banen){
        var p = poorten[k]; if (!p) return;
        p.banen = banen.slice(0, 3); p.actief = true; p.gekozen = -1; p.goed = -1; paneelVan = k;
        paneelTex(p);
        /* staat het voertuig in een dichte baan, dan schuift het naar een open */
        baanDoel = dichtsteOpen(baanDoel);
      },
      afstandTot: function(k){ var p = poorten[k]; return p ? p.z - zAuto() : 0; },
      uitslag: function(k, gekozen, goed){
        var p = poorten[k]; if (!p) return;
        p.gekozen = gekozen; p.goed = goed; paneelTex(p);
        var r = paneelRect[goed] || [W / 2, H / 3, 40];
        if (gekozen === goed){
          boost = 1;
          barst(r[0], r[1], GOED, 34, 260);
          var n = weinigBeweging ? 3 : 6;
          for (var i = 0; i < n; i++) deel(3, r[0] + (Math.random() - .5) * r[2], r[1], 0, 0, .75 + i * .06, '#E8B923', Math.max(4, Math.min(9, W / 60)));
        } else {
          var rf = paneelRect[gekozen] || r;
          barst(rf[0], rf[1], FOUT, 14, 140);
        }
        wek();
      },
      snelheid: function(nieuw){ vDoel = Math.max(0, nieuw); },
      v: function(){ return v; },
      baan: function(b){ if (b < 0 || b > 2) return false; var ob = openBanen(); if (!ob[b]) return false; baanDoel = b; return true; },
      stuur: function(r){ var b = baanDoel + r, ob = openBanen(); while (b >= 0 && b <= 2 && !ob[b]) b += r; if (b < 0 || b > 2) return false; baanDoel = b; return true; },
      baanNu: function(){ return baanDoel; },
      slip: function(){
        slipT = .9; slipDraai = 0; slipKlaar = false;
        if (!weinigBeweging) for (var i = 0; i < 10; i++) deel(8, autoSchermX() + (Math.random() - .5) * autoBreed(), yAuto - 4, (Math.random() - .5) * 90, -20 - Math.random() * 40, .8, pal.nacht ? 'rgba(200,210,235,.35)' : 'rgba(120,110,95,.35)', 6 + Math.random() * 8);
        wek();
      },
      herstel: function(){ slipT = 0; slipDraai = 0; kantel = 0; },
      pauze: function(b){ pauze = !!b; if (!b){ laatst = nu(); } wek(); if (b) teken(); },
      gepauzeerd: function(){ return pauze; },
      wachtBij: function(k){ wachtK = k; wachtGemeld = false; },
      rijdDoor: function(){ wachtK = -1; wachtGemeld = false; },
      wacht: function(){ return wachtK >= 0 && wachtGemeld; },
      /* verder na een herlaad midden in een race: het voertuig staat net voorbij poort k-1, de poorten ervoor zijn gehad */
      vanaf: function(k){
        var p = poorten[k - 1]; if (!p) return;
        zCam = p.z + 400 - D; v = 0;
        for (var i = 0; i < k && i < poorten.length; i++){ poorten[i].actief = false; poorten[i].gekozen = 0; }
      },
      gas: function(b){ gasAan = !!b; },
      stop: function(){ loopt = false; racen = false; if (raf){ cancelAnimationFrame(raf); raf = 0; } },
      klok: function(){ return klok; },
      opname: function(){ return { z:opname.z.slice(), x:opname.x.slice(), t:klok, voertuig:voertuig }; },
      spookVerschil: spookVerschil,
      voort: function(){ return finishZ < 1e8 ? Math.max(0, Math.min(1, (zAuto() - zStart) / (finishZ - zStart))) : 0; },
      rivalen: function(lijst){
        var span = finishZ < 1e8 ? finishZ - zStart : 0, nieuw = [];
        (lijst || []).forEach(function(r){
          var z = zStart + Math.max(0, Math.min(1, r.voort || 0)) * span, oud = null;
          for (var i = 0; i < rivalen.length; i++) if (rivalen[i].id === r.id) oud = rivalen[i];
          if (!oud){
            var h = 0, t = String(r.id); for (var j = 0; j < t.length; j++) h = (h * 31 + t.charCodeAt(j)) >>> 0;
            oud = { id:r.id, baan:h % 3, kleur:RIVAALKLEUR[(h >>> 3) % RIVAALKLEUR.length], z:z, doel:z, v:0, sinds:0 };
          } else {
            /* hoe snel hij ging sinds de vorige melding: daarmee rijdt hij tot de volgende door */
            oud.v = z > oud.doel ? (z - oud.doel) / Math.max(.4, oud.sinds) : 0;
            oud.doel = z; oud.sinds = 0;
          }
          oud.naam = String(r.naam || '').slice(0, 16);
          nieuw.push(oud);
        });
        rivalen = nieuw;
      },
      uiterlijk: function(vt, kl, sp){ if (vt) voertuig = vt; if (kl) kleur = kleurVan(kl); if (sp) spoor = sp; teken(); },
      zetTempo: function(t){ tempo = t || 1; },
      /* voor de proeven: wat de motor nu doet */
      stand: function(){ return { z:zAuto(), v:v, vDoel:vDoel, x:x, baan:baanDoel, klok:klok, pauze:pauze, racen:racen, wacht:wachtK, gefinisht:gefinisht, W:W, H:H, yAuto:yAuto, hor:hor }; },
      canvas: canvas
    };
    thema(); maat();
    return api;
  }

  return { maak:maak, tekenVoertuig:tekenVoertuig, VOERTUIGEN:VOERTUIGEN, KLEUREN:KLEUREN, SPOREN:SPOREN, kleurVan:kleurVan, BAANKLEUR:BAANKLEUR };
})();
