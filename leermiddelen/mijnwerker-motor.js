/* Mijnwerker: de motor. Alles wat de mijn is en doet, zonder scherm: de
   kaart uit een zaadgetal, de lagen, wat een blok kost en oplevert, de boor
   die graaft, klimt en valt, de brandstof, de lading en de speelbot. De
   pagina (mijnwerker.html) tekent dit en stelt de vragen; dit bestand draait
   ook los in Node, voor de balanstest en de meting met een grote kaart.

   Gebruik:
     var m = MIJNMOTOR.nieuw({ zaad:123, uit:{ boor:0, tank:0, lamp:0, ruim:0, lift:0 } });
     m.stap(dt, wil)          wil = { dx, dy } of null; een tik van de wereld
     m.gebeurt                wat er gebeurde sinds de vorige keer (de pagina leegt hem)
     m.kraak(x, y)            het blok is verdiend: de boor gaat erin
     m.lier() / m.afdaal()    de lier naar boven, de lift weer naar beneden
     m.red()                  de reddingsdrone: naar boven, de helft van de lading kwijt
     m.verkoop()              boven: lading verkopen, tank vol */
(function(root){
  'use strict';

  /* Een eigen dobbelsteen met een zaadgetal, zodat dezelfde ronde dezelfde
     kaart geeft (mulberry32). Elke ronde krijgt een nieuw zaad. */
  function dobbel(zaad){
    var a = (zaad >>> 0) || 1;
    return function(){
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- de soorten blokken ----------
     vragen: hoeveel goede antwoorden het blok kost (0 is zacht, vanzelf).
     waarde: wat het boven oplevert. */
  var T = { LUCHT:0, AARDE:1, STEEN:2, GRANIET:3, KOPER:4, ZILVER:5, GOUD:6, SMARAGD:7, ROBIJN:8, SAFFIER:9, DIAMANT:10, VONDST:11, GAS:12, BODEM:13 };
  var SOORT = [
    { id:'lucht',   naam:'gang' },
    { id:'aarde',   naam:'aarde', zacht:true },
    { id:'steen',   naam:'steen', vragen:1, hard:true },
    { id:'graniet', naam:'graniet', vragen:2, hard:true },
    { id:'koper',   naam:'koper',   vragen:1, waarde:6,   erts:true, kleur:'#E07B39' },
    { id:'zilver',  naam:'zilver',  vragen:1, waarde:15,  erts:true, kleur:'#D9DEE8' },
    { id:'goud',    naam:'goud',    vragen:1, waarde:35,  erts:true, kleur:'#F4C430' },
    { id:'smaragd', naam:'smaragd', vragen:1, waarde:60,  erts:true, kleur:'#2FBF71' },
    { id:'robijn',  naam:'robijn',  vragen:1, waarde:80,  erts:true, kleur:'#E0314B' },
    { id:'saffier', naam:'saffier', vragen:1, waarde:100, erts:true, kleur:'#3A6FF0' },
    { id:'diamant', naam:'diamant', vragen:2, waarde:160, erts:true, kleur:'#BFF3FF' },
    { id:'vondst',  naam:'iets bijzonders', vragen:1, vondst:true },
    { id:'gas',     naam:'gasbel', zacht:true, gas:true },
    { id:'bodem',   naam:'bodem', vast:true }
  ];

  /* ---------- de lagen ----------
     Hoe dieper, hoe meer steen en hoe zeldzamer en duurder het erts. band
     zegt welke vragen er in die laag komen (zie mijnwerker.html):
       laag    het gekozen niveau, zoals in de andere spellen
       midden  de lastigste vragen binnen het gekozen niveau
       hoog    een niveau hoger (nooit meer dan een stap); vwo blijft vwo
     hint: in de bovenste twee lagen kun je een fout antwoord laten wegstrepen. */
  var LAGEN = [
    { naam:'Bovengrond', van:1,   tot:15,  band:'laag',   hint:true,  steen:.09, graniet:0,   gat:0,    gas:0,
      erts:[[T.KOPER, .07], [T.ZILVER, .012]],
      aarde:'#C0915F', gang:'#5B3F29', vlek:'#A87A4E' },
    { naam:'Klei',       van:16,  tot:40,  band:'midden', hint:true,  steen:.18, graniet:.02, gat:.004, gas:0,
      erts:[[T.KOPER, .045], [T.ZILVER, .035], [T.GOUD, .008]],
      aarde:'#B06F4A', gang:'#4E2E1F', vlek:'#9A5E3D' },
    { naam:'Rots',       van:41,  tot:70,  band:'midden', hint:false, steen:.27, graniet:.08, gat:.008, gas:0,
      erts:[[T.ZILVER, .03], [T.GOUD, .026], [T.SMARAGD, .007]],
      aarde:'#8A7766', gang:'#3A2F27', vlek:'#76655A' },
    { naam:'Diepe rots', van:71,  tot:110, band:'hoog',   hint:false, steen:.26, graniet:.18, gat:.01,  gas:.008,
      erts:[[T.GOUD, .028], [T.SMARAGD, .016], [T.ROBIJN, .011], [T.SAFFIER, .006]],
      aarde:'#6A5E72', gang:'#2B2533', vlek:'#5B5063' },
    { naam:'Kern',       van:111, tot:9999, band:'hoog',  hint:false, steen:.2,  graniet:.32, gat:.01,  gas:.016,
      erts:[[T.GOUD, .02], [T.ROBIJN, .015], [T.SAFFIER, .015], [T.DIAMANT, .009]],
      aarde:'#57465E', gang:'#221A28', vlek:'#4A3B51' }
  ];
  function laagVan(y){
    for (var i = 0; i < LAGEN.length; i++) if (y <= LAGEN[i].tot) return i;
    return LAGEN.length - 1;
  }

  /* ---------- de vondsten ----------
     Wat dieper ligt is ouder: bovenin wat mensen verloren, dieper wat al
     miljoenen jaren in de grond zit. Elke vondst ligt ergens in zijn eigen
     strook, en komt in het museum boven. */
  var VONDSTEN = [
    { id:'knikker',   naam:'Knikker van klei',        soort:'voorwerp', van:2,   tot:8,   ouder:'rond 1900',
      uit:'Speelgoed van gebakken klei. Kinderen speelden er op straat mee, lang voordat er plastic was.' },
    { id:'pijp',      naam:'Kleipijp',                soort:'voorwerp', van:5,   tot:13,  ouder:'17e eeuw',
      uit:'Een tabakspijp van witte pijpaarde. Gouda was er in de Gouden Eeuw beroemd om.' },
    { id:'duit',      naam:'Duit van de VOC',         soort:'voorwerp', van:9,   tot:17,  ouder:'18e eeuw',
      uit:'Een koperen muntje met het teken van de Verenigde Oost-Indische Compagnie erop.' },
    { id:'sleutel',   naam:'IJzeren sleutel',         soort:'voorwerp', van:13,  tot:22,  ouder:'rond 1300',
      uit:'Een sleutel uit de middeleeuwen, van een kist of een huisdeur in een groeiende stad.' },
    { id:'romeins',   naam:'Romeinse munt',           soort:'voorwerp', van:18,  tot:28,  ouder:'rond 100 na Christus',
      uit:'Met de kop van een keizer erop. De Romeinen hadden forten langs de Rijn, de grens van hun rijk.' },
    { id:'trechter',  naam:'Scherf van een trechterbeker', soort:'voorwerp', van:24, tot:34, ouder:'rond 3400 voor Christus',
      uit:'Aardewerk van de hunebedbouwers, de eerste boeren in Drenthe.' },
    { id:'vuistbijl', naam:'Vuistbijl',               soort:'voorwerp', van:30,  tot:40,  ouder:'tienduizenden jaren',
      uit:'Een werktuig van vuursteen, gemaakt door neanderthalers. Ze hakten en schraapten ermee.' },
    { id:'mammoet',   naam:'Kies van een mammoet',    soort:'fossiel',  van:40,  tot:55,  ouder:'ongeveer 40.000 jaar',
      uit:'Van een wolharige mammoet uit de laatste ijstijd. Vissers halen zulke kiezen op uit de Noordzee.' },
    { id:'haai',      naam:'Tand van een oerhaai',    soort:'fossiel',  van:50,  tot:66,  ouder:'ongeveer 10 miljoen jaar',
      uit:'Haaien wisselen hun hele leven van tanden, dus er liggen er veel. Deze haai was groter dan een bus.' },
    { id:'barnsteen', naam:'Barnsteen met een mug',   soort:'fossiel',  van:60,  tot:76,  ouder:'ongeveer 40 miljoen jaar',
      uit:'Versteende hars van een boom. Een mug die erin vast kwam te zitten, is nog helemaal te zien.' },
    { id:'zeeegel',   naam:'Versteende zee-egel',     soort:'fossiel',  van:72,  tot:88,  ouder:'ongeveer 70 miljoen jaar',
      uit:'Uit de tijd dat Limburg onder de zee lag. In de mergel bij Maastricht vind je ze nog.' },
    { id:'maashagedis', naam:'Tand van de Maashagedis', soort:'fossiel', van:80, tot:98,  ouder:'ongeveer 67 miljoen jaar',
      uit:'Een reuzenhagedis die in zee leefde. Zijn schedel werd in de 18e eeuw bij Maastricht gevonden.' },
    { id:'ammoniet',  naam:'Ammoniet',                soort:'fossiel',  van:92,  tot:112, ouder:'ongeveer 180 miljoen jaar',
      uit:'Familie van de inktvis, met een schelp als een slakkenhuis. Ze stierven uit met de dinosaurussen.' },
    { id:'varen',     naam:'Afdruk van een varen',    soort:'fossiel',  van:108, tot:128, ouder:'ongeveer 300 miljoen jaar',
      uit:'Uit de moerasbossen waar later steenkool van werd. In Limburg werd die steenkool gedolven.' },
    { id:'trilobiet', naam:'Trilobiet',               soort:'fossiel',  van:124, tot:146, ouder:'ongeveer 450 miljoen jaar',
      uit:'Een van de eerste dieren met ogen. Hij kroop over de zeebodem, lang voordat er iets op het land leefde.' }
  ];
  var VONDST_BONUS = 20;

  /* ---------- de uitrusting ----------
     Blijft op dit apparaat bewaard (zie mijnwerker.html). Niveau 0 is wat je
     bij de eerste ronde hebt. */
  var UITRUSTING = [
    { id:'boor', naam:'Boor', prijs:[150, 350, 700, 1200],
      waarde:[0.30, 0.24, 0.19, 0.15, 0.12],
      uit:['een gewone boor', 'graaft sneller', 'graaft nog sneller', 'graniet en diamant: een vraag minder', 'snelst, en een vijfde minder brandstof'] },
    { id:'tank', naam:'Tank', prijs:[100, 250, 500, 900], waarde:[100, 160, 240, 340, 480],
      uit:['100 liter', '160 liter', '240 liter', '340 liter', '480 liter'] },
    { id:'lamp', naam:'Lamp', prijs:[120, 280, 550, 950], waarde:[2.2, 3.2, 4.3, 5.5, 7],
      uit:['een zaklamp', 'je ziet verder in het donker', 'nog verder', 'ver, en gasbellen van ver', 'bijna zo licht als boven'] },
    { id:'ruim', naam:'Laadruim', prijs:[100, 260, 520, 900], waarde:[6, 9, 13, 18, 25],
      uit:['6 stuks erts', '9 stuks', '13 stuks', '18 stuks', '25 stuks'] },
    { id:'lift', naam:'Lier en lift', prijs:[250, 600], waarde:[0, 1, 2],
      uit:['zelf omhoog klimmen', 'de lier trekt je in een keer naar boven', 'en de lift brengt je weer terug naar beneden'] }
  ];
  function uitVan(id){ for (var i = 0; i < UITRUSTING.length; i++) if (UITRUSTING[i].id === id) return UITRUSTING[i]; return null; }

  /* wat een stap kost aan brandstof */
  var KOST = { loop:0.3, klim:0.55, zacht:1.0, hard:1.5, gas:15 };
  /* hoe lang een stap duurt, in seconden */
  var DUUR = { loop:0.16, klim:0.22, val:0.085, hard:0.36, lier:1.6 };
  /* tot deze diepte is het licht genoeg om alles te zien */
  var LICHT_TOT = 12;

  /* ---------- de kaart ---------- */
  function maakKaart(m, kans){
    var w = m.w, h = m.h, t = m.t, x, y, i;
    for (y = 1; y < h; y++){
      var L = LAGEN[laagVan(y)];
      for (x = 0; x < w; x++){
        i = y * w + x;
        if (y === h - 1){ t[i] = T.BODEM; continue; }
        /* de bovenste rij is zachte aarde: je kunt meteen beginnen */
        if (y === 1){ t[i] = T.AARDE; continue; }
        var r = kans();
        t[i] = r < L.graniet ? T.GRANIET : r < L.graniet + L.steen ? T.STEEN : T.AARDE;
      }
    }
    /* erts in adertjes van een tot vier blokken */
    for (y = 2; y < h - 1; y++){
      var L2 = LAGEN[laagVan(y)];
      for (x = 0; x < w; x++){
        for (var e = 0; e < L2.erts.length; e++){
          if (kans() >= L2.erts[e][1]) continue;
          var soort = L2.erts[e][0], n = 1 + Math.floor(kans() * (soort >= T.SMARAGD ? 2 : 4)), ax = x, ay = y;
          for (var k = 0; k < n; k++){
            if (ax >= 0 && ax < w && ay > 1 && ay < h - 1) t[ay * w + ax] = soort;
            var d = Math.floor(kans() * 4);
            ax += d === 0 ? 1 : d === 1 ? -1 : 0; ay += d === 2 ? 1 : d === 3 ? -1 : 0;
          }
          break;
        }
      }
    }
    /* holtes en gasbellen: een paar blokken lucht of gas bij elkaar */
    for (y = 3; y < h - 2; y++){
      var L3 = LAGEN[laagVan(y)];
      for (x = 0; x < w; x++){
        var r2 = kans();
        if (r2 < L3.gat){
          var gw = 2 + Math.floor(kans() * 3), gh = 1 + Math.floor(kans() * 2);
          for (var gy = 0; gy < gh; gy++) for (var gx = 0; gx < gw; gx++){
            if (x + gx < w && y + gy < h - 1) t[(y + gy) * w + x + gx] = T.LUCHT;
          }
        } else if (r2 < L3.gat + L3.gas) t[y * w + x] = T.GAS;
      }
    }
    /* de vondsten: elk een kans op een plek in zijn eigen strook */
    VONDSTEN.forEach(function(v){
      var tot = Math.min(v.tot, h - 2);
      if (v.van > tot || kans() > 0.7) return;
      var vy = v.van + Math.floor(kans() * (tot - v.van + 1)), vx = Math.floor(kans() * w), vi = vy * w + vx;
      t[vi] = T.VONDST; m.vondst[vi] = v.id;
    });
  }

  /* ---------- een mijn ---------- */
  function Mijn(o){
    o = o || {};
    this.zaad = o.zaad >>> 0 || 1;
    this.w = o.breed || 24;
    this.h = o.diep || 151;
    this.t = new Uint8Array(this.w * this.h);
    this.gezien = new Uint8Array(this.w * this.h);
    this.vondst = {};
    this.uit = { boor:0, tank:0, lamp:0, ruim:0, lift:0 };
    var u = o.uit || {};
    for (var k in this.uit) if (typeof u[k] === 'number') this.uit[k] = Math.max(0, Math.min(uitVan(k).prijs.length, u[k] | 0));
    maakKaart(this, dobbel(this.zaad));
    var sx = Math.floor(this.w / 2);
    this.sp = { x:sx, y:0, fx:sx, fy:0, kijk:1, actie:null, brandstof:this.tankMax(), lading:[], vondsten:[], graaft:0 };
    this.gebeurt = [];
    this.diepst = 0;
    this.klok = 0;
    this.lierPunt = null;
    this.botDoel = -1;
    this.veranderd = 1;
    this.zicht = 0;       /* telt op als de lamp een nieuw vakje laat zien */   /* telt op als er een blok verandert: de pagina tekent dan opnieuw */
    this.zie();
  }
  Mijn.prototype.tankMax = function(){ return uitVan('tank').waarde[this.uit.tank]; };
  Mijn.prototype.ruim = function(){ return uitVan('ruim').waarde[this.uit.ruim]; };
  Mijn.prototype.lamp = function(){ return uitVan('lamp').waarde[this.uit.lamp]; };
  Mijn.prototype.graafDuur = function(){ return uitVan('boor').waarde[this.uit.boor]; };
  Mijn.prototype.tegel = function(x, y){
    if (x < 0 || x >= this.w || y >= this.h) return T.BODEM;
    if (y < 0) return T.LUCHT;
    return this.t[y * this.w + x];
  };
  /* hoeveel goede antwoorden dit blok kost; met de derde boor een minder bij graniet en diamant */
  Mijn.prototype.vragenVoor = function(x, y){
    var s = SOORT[this.tegel(x, y)], n = s.vragen || 0;
    if (n > 1 && this.uit.boor >= 3) n--;
    return n;
  };
  Mijn.prototype.laag = function(y){ return LAGEN[laagVan(y == null ? this.sp.y : y)]; };
  /* wat de lamp nu ziet, onthouden: zo weet de bot (en de kaart) waar erts zat */
  Mijn.prototype.zie = function(){
    var sp = this.sp, r = this.lamp() + 0.5, ri = Math.ceil(r);
    for (var dy = -ri; dy <= ri; dy++) for (var dx = -ri; dx <= ri; dx++){
      var x = sp.x + dx, y = sp.y + dy;
      if (x < 0 || x >= this.w || y < 0 || y >= this.h) continue;
      var i = y * this.w + x;
      if (dx * dx + dy * dy <= r * r && !this.gezien[i]){ this.gezien[i] = 1; if (y > LICHT_TOT) this.zicht++; }
    }
    /* dicht onder de grond is het licht: alles tot LICHT_TOT is altijd te zien */
  };
  Mijn.prototype.isGezien = function(x, y){ return y <= LICHT_TOT || !!this.gezien[y * this.w + x]; };
  Mijn.prototype.meld = function(g){ this.gebeurt.push(g); };
  Mijn.prototype.kost = function(n){
    var sp = this.sp;
    /* boven op het maaiveld rijden is gratis */
    if (sp.y === 0 && n <= KOST.loop) return;
    sp.brandstof = Math.max(0, sp.brandstof - n);
  };
  Mijn.prototype.begin = function(soort, nx, ny, duur, extra){
    var sp = this.sp;
    sp.actie = { soort:soort, x0:sp.x, y0:sp.y, x1:nx, y1:ny, t:0, duur:duur, extra:extra || null };
  };

  /* Een tik. Loopt er een beweging, dan gaat die verder; staat de boor
     stil, dan kijkt hij naar wat je wilt, en anders valt hij als er niets
     onder hem zit. Staat er een vraag open, dan staat alles stil. */
  Mijn.prototype.stap = function(dt, wil){
    var sp = this.sp;
    /* het trillen van de boor loopt ook af als er een vraag open staat */
    if (sp.graaft > 0) sp.graaft = Math.max(0, sp.graaft - dt);
    if (this.bevroren) return;
    this.klok += dt;
    if (sp.actie){
      var a = sp.actie;
      a.t += dt;
      var f = Math.min(1, a.t / a.duur);
      var e = a.soort === 'val' ? f : f * f * (3 - 2 * f);
      sp.fx = a.x0 + (a.x1 - a.x0) * e; sp.fy = a.y0 + (a.y1 - a.y0) * e;
      if (f < 1) return;
      this.klaar(a);
      return;
    }
    if (this.wacht) return;
    if (wil && (wil.dx || wil.dy) && this.probeer(wil)) return;
    /* niets onder je: vallen */
    if (sp.y < this.h - 1 && this.tegel(sp.x, sp.y + 1) === T.LUCHT) this.begin('val', sp.x, sp.y + 1, DUUR.val);
  };
  /* probeer een stap in een richting; geeft true als er iets gebeurt */
  Mijn.prototype.probeer = function(wil){
    var sp = this.sp, dx = wil.dx > 0 ? 1 : wil.dx < 0 ? -1 : 0, dy = dx ? 0 : (wil.dy > 0 ? 1 : wil.dy < 0 ? -1 : 0);
    if (dx) sp.kijk = dx;
    var nx = sp.x + dx, ny = sp.y + dy;
    if (nx < 0 || nx >= this.w) return false;
    if (dy < 0){
      /* omhoog kan alleen door een gang die er al is: een boor graaft niet naar boven */
      if (sp.y === 0) return false;
      if (this.tegel(nx, ny) !== T.LUCHT){ this.meld({ k:'omhoog' }); return false; }
      this.kost(KOST.klim);
      this.begin('klim', nx, ny, DUUR.klim);
      return true;
    }
    var s = this.tegel(nx, ny), S = SOORT[s];
    if (s === T.LUCHT){
      if (dy > 0) return false;   /* vallen doet de zwaartekracht */
      this.kost(KOST.loop);
      this.begin('loop', nx, ny, DUUR.loop);
      return true;
    }
    if (S.vast){ this.meld({ k:'bodem', x:nx, y:ny }); return false; }
    if (S.zacht){
      this.kost(S.gas ? KOST.zacht + KOST.gas : KOST.zacht * (this.uit.boor >= 4 ? 0.8 : 1));
      if (S.gas) this.meld({ k:'gas', x:nx, y:ny });
      sp.graaft = this.graafDuur();
      this.begin('graaf', nx, ny, this.graafDuur());
      return true;
    }
    /* hard, erts of een vondst: dat kost een goed antwoord */
    this.wacht = { x:nx, y:ny };
    this.meld({ k:'vraag', x:nx, y:ny, soort:S.id, nodig:this.vragenVoor(nx, ny), vol:!!S.erts && sp.lading.length >= this.ruim() });
    return true;
  };
  /* De vraag is weg zonder dat het blok verdiend is: gewoon verder. */
  Mijn.prototype.laatGaan = function(){ this.wacht = null; };
  /* Het blok is verdiend: de boor kraakt het en gaat erin. */
  Mijn.prototype.kraak = function(x, y){
    var sp = this.sp;
    this.wacht = null;
    if (sp.actie || Math.abs(x - sp.x) + Math.abs(y - sp.y) !== 1) return false;
    this.kost(KOST.hard * (this.uit.boor >= 4 ? 0.8 : 1));
    sp.graaft = DUUR.hard;
    this.begin('graaf', x, y, DUUR.hard, { hard:true });
    return true;
  };
  Mijn.prototype.klaar = function(a){
    var sp = this.sp, w = this.w, van = sp.y;
    sp.actie = null;
    if (a.soort === 'lier' || a.soort === 'red' || a.soort === 'afdaal'){
      sp.x = a.x1; sp.y = a.y1; sp.fx = sp.x; sp.fy = sp.y;
      this.zie();
      if (sp.y === 0) this.meld({ k:'boven', via:a.soort, verloren:a.extra && a.extra.verloren });
      return;
    }
    if (a.soort === 'graaf'){
      var i = a.y1 * w + a.x1, s = this.t[i], S = SOORT[s];
      this.t[i] = T.LUCHT; this.veranderd++;
      if (S.erts){
        if (sp.lading.length < this.ruim()){ sp.lading.push(S.id); this.meld({ k:'erts', soort:S.id, x:a.x1, y:a.y1 }); }
        else this.meld({ k:'vol', soort:S.id, x:a.x1, y:a.y1 });
      } else if (S.vondst){
        var id = this.vondst[i]; delete this.vondst[i];
        if (id){ sp.vondsten.push(id); this.meld({ k:'vondst', id:id, x:a.x1, y:a.y1 }); }
      } else if (S.hard) this.meld({ k:'brok', x:a.x1, y:a.y1, soort:S.id });
    }
    sp.x = a.x1; sp.y = a.y1; sp.fx = sp.x; sp.fy = sp.y;
    this.zie();
    if (sp.y > this.diepst){ this.diepst = sp.y; this.meld({ k:'diepte', y:sp.y }); }
    if (sp.y === 0 && van > 0) this.meld({ k:'boven', via:a.soort });
    else if (sp.brandstof <= 0 && sp.y > 0){ this.wacht = { leeg:true }; this.meld({ k:'leeg' }); }
  };
  /* De lier: in een keer naar boven. De lift (niveau 2) onthoudt waar je
     vandaan kwam, zodat je daar weer naartoe kunt. */
  Mijn.prototype.kanLier = function(){ return this.uit.lift >= 1 && this.sp.y > 0 && !this.sp.actie && !this.wacht; };
  Mijn.prototype.lier = function(){
    if (!this.kanLier()) return false;
    var sp = this.sp;
    this.lierPunt = this.uit.lift >= 2 ? { x:sp.x, y:sp.y } : null;
    this.begin('lier', sp.x, 0, Math.min(2.4, 0.6 + sp.y * 0.02));
    return true;
  };
  Mijn.prototype.kanAfdaal = function(){
    var p = this.lierPunt, sp = this.sp;
    return this.uit.lift >= 2 && !!p && sp.y === 0 && !sp.actie && !this.wacht && this.tegel(p.x, p.y) === T.LUCHT;
  };
  Mijn.prototype.afdaal = function(){
    if (!this.kanAfdaal()) return false;
    var p = this.lierPunt;
    this.lierPunt = null;
    this.begin('afdaal', p.x, p.y, Math.min(2.4, 0.6 + p.y * 0.02));
    return true;
  };
  /* De reddingsdrone. Geen game over: je gaat naar boven, maar de helft van
     je erts blijft achter. Vondsten laat de drone nooit vallen. */
  Mijn.prototype.red = function(){
    var sp = this.sp, kwijt = Math.floor(sp.lading.length / 2), verloren = [];
    for (var k = 0; k < kwijt; k++){
      /* het duurste gaat het eerst mee terug: de drone laat het goedkoopste vallen */
      var goedkoopst = 0;
      for (var j = 1; j < sp.lading.length; j++) if (waardeVan(sp.lading[j]) < waardeVan(sp.lading[goedkoopst])) goedkoopst = j;
      verloren.push(sp.lading.splice(goedkoopst, 1)[0]);
    }
    this.wacht = null;
    this.begin('red', sp.x, 0, Math.min(3, 1 + sp.y * 0.02), { verloren:verloren });
    return verloren;
  };
  function waardeVan(id){ for (var i = 0; i < SOORT.length; i++) if (SOORT[i].id === id) return SOORT[i].waarde || 0; return 0; }
  /* Boven: de lading verkopen en de tank vullen (dat is gratis). */
  Mijn.prototype.verkoop = function(){
    var sp = this.sp, n = {}, som = 0;
    sp.lading.forEach(function(id){ n[id] = (n[id] || 0) + 1; som += waardeVan(id); });
    var vondsten = sp.vondsten.slice();
    som += vondsten.length * VONDST_BONUS;
    sp.lading = []; sp.vondsten = [];
    sp.brandstof = this.tankMax();
    return { munten:som, erts:n, vondsten:vondsten };
  };
  /* Nieuwe uitrusting midden in een ronde (in de winkel boven). */
  Mijn.prototype.zetUit = function(id, lv){
    var oudTank = this.tankMax();
    this.uit[id] = lv;
    if (id === 'tank') this.sp.brandstof = Math.min(this.tankMax(), this.sp.brandstof + this.tankMax() - oudTank);
    this.zie();
  };
  /* hoeveel brandstof de weg naar boven ongeveer kost */
  Mijn.prototype.kostNaarBoven = function(){ return this.uit.lift >= 1 ? 0 : this.sp.y * KOST.klim + 2; };

  /* ---------- de speelbot ----------
     Kiest een richting zoals een leerling zou doen: is de lading vol of de
     tank bijna leeg, dan naar boven; ziet hij erts, dan erheen; anders
     dieper. De pagina doet de rest (vragen beantwoorden, winkelen). */
  function botKeuze(m){
    var sp = m.sp;
    if (sp.actie || m.wacht) return null;
    var vol = sp.lading.length >= m.ruim(), krap = sp.brandstof < m.kostNaarBoven() * 1.25 + 8;
    if (sp.y > 0 && (vol || krap)){
      if (m.kanLier()) return { lier:true };
      return naarBoven(m);
    }
    if (sp.y === 0 && m.kanAfdaal() && sp.brandstof > m.tankMax() * 0.9) return { afdaal:true };
    var doel = zoek(m, 7);
    if (doel) return doel;
    /* niets te zien: dieper. Is het onder je te hard of de bodem, dan opzij. */
    var onder = m.tegel(sp.x, sp.y + 1);
    if (onder === T.BODEM || (m.vragenVoor(sp.x, sp.y + 1) > 1 && Math.random() < 0.5)){
      var kant = sp.x < 2 ? 1 : sp.x > m.w - 3 ? -1 : (Math.random() < 0.5 ? -1 : 1);
      return { dx:kant, dy:0 };
    }
    return { dx:0, dy:1 };
  }
  /* de kortste weg door gangen naar het maaiveld (breedte eerst) */
  function naarBoven(m){
    var sp = m.sp, w = m.w, start = sp.y * w + sp.x, van = new Int32Array(w * m.h).fill(-2), rij = [start], kop = 0;
    van[start] = -1;
    while (kop < rij.length){
      var i = rij[kop++], x = i % w, y = (i - x) / w;
      if (y === 0){
        var j = i; while (van[j] !== start && van[j] !== -1) j = van[j];
        if (j === start) return null;
        var jx = j % w, jy = (j - jx) / w;
        return { dx:jx - sp.x, dy:jy - sp.y };
      }
      var buren = [[x, y - 1], [x - 1, y], [x + 1, y], [x, y + 1]];
      for (var b = 0; b < 4; b++){
        var bx = buren[b][0], by = buren[b][1];
        if (bx < 0 || bx >= w || by < 0 || by >= m.h) continue;
        var bi = by * w + bx;
        if (van[bi] !== -2 || m.t[bi] !== T.LUCHT) continue;
        van[bi] = i; rij.push(bi);
      }
    }
    /* geen gang naar boven (kan eigenlijk niet): dan maar omhoog proberen */
    return { dx:0, dy:-1 };
  }
  /* Dijkstra in een klein vak om de boor: het dichtstbijzijnde erts of de
     dichtstbijzijnde vondst die hij kan zien, en de eerste stap ernaartoe. */
  function zoek(m, straal){
    var sp = m.sp, w = m.w, x0 = Math.max(0, sp.x - straal), x1 = Math.min(w - 1, sp.x + straal),
        y0 = Math.max(0, sp.y - straal), y1 = Math.min(m.h - 1, sp.y + straal);
    /* het vak groeit mee tot het vorige doel erin ligt, ook als de weg erheen eerst een eind omhoog ging */
    if (m.botDoel >= 0){
      var dx0 = m.botDoel % w, dy0 = (m.botDoel - dx0) / w;
      if (Math.abs(dx0 - sp.x) + Math.abs(dy0 - sp.y) <= straal * 3){
        x0 = Math.max(0, Math.min(x0, dx0 - 1)); x1 = Math.min(w - 1, Math.max(x1, dx0 + 1));
        y0 = Math.max(0, Math.min(y0, dy0 - 1)); y1 = Math.min(m.h - 1, Math.max(y1, dy0 + 1));
      }
    }
    var bw = x1 - x0 + 1, bh = y1 - y0 + 1, n = bw * bh, afst = new Float32Array(n).fill(1e9), van = new Int32Array(n).fill(-1),
        klaar = new Uint8Array(n), start = (sp.y - y0) * bw + (sp.x - x0);
    afst[start] = 0;
    var beste = -1, vol = sp.lading.length >= m.ruim(), oud = -1;
    /* met een groot laadruim laat hij koper liggen: dat past beter bij dieper erts */
    var min = m.uit.ruim >= 3 ? 15 : m.uit.ruim >= 2 && sp.y > 20 ? 7 : 0;
    /* het doel van de vorige keer houdt hij vast zolang het er nog is, anders
       zwalkt hij tussen twee even verre brokken erts heen en weer */
    if (m.botDoel >= 0){
      var ox = m.botDoel % w, oy = (m.botDoel - ox) / w, os = SOORT[m.t[m.botDoel]];
      if (ox >= x0 && ox <= x1 && oy >= y0 && oy <= y1 && ((os.erts && !vol && (os.waarde || 0) >= min) || os.vondst)) oud = (oy - y0) * bw + (ox - x0);
    }
    for (var ronde = 0; ronde < n; ronde++){
      var i = -1, d = 1e9;
      for (var k = 0; k < n; k++) if (!klaar[k] && afst[k] < d){ d = afst[k]; i = k; }
      if (i < 0) break;
      klaar[i] = 1;
      var lx = i % bw, ly = (i - lx) / bw, x = lx + x0, y = ly + y0, s = m.t[y * w + x], S = SOORT[s];
      if (i !== start && m.isGezien(x, y) && ((S.erts && !vol && (S.waarde || 0) >= min) || S.vondst)){
        if (oud < 0 || i === oud){ beste = i; break; }
        if (beste < 0) beste = i;
        continue;
      }
      var buren = [[0, 1], [-1, 0], [1, 0], [0, -1]];
      for (var b = 0; b < 4; b++){
        var nx = x + buren[b][0], ny = y + buren[b][1];
        if (nx < x0 || nx > x1 || ny < y0 || ny > y1 || ny < 0) continue;
        var ns = m.t[ny * w + nx], NS = SOORT[ns];
        if (NS.vast) continue;
        if (buren[b][1] < 0 && ns !== T.LUCHT) continue;   /* omhoog alleen door een gang */
        var c = ns === T.LUCHT ? 1 : NS.zacht ? (NS.gas ? 20 : 2) : 2 + 3 * m.vragenVoor(nx, ny);
        var ni = (ny - y0) * bw + (nx - x0);
        if (d + c < afst[ni]){ afst[ni] = d + c; van[ni] = i; }
      }
    }
    if (beste < 0){ m.botDoel = -1; return null; }
    m.botDoel = (Math.floor(beste / bw) + y0) * w + (beste % bw + x0);
    var j = beste; while (van[j] !== start && van[j] >= 0) j = van[j];
    var jx = j % bw + x0, jy = Math.floor(j / bw) + y0;
    return { dx:jx - sp.x, dy:jy - sp.y };
  }

  var MIJNMOTOR = {
    T:T, SOORT:SOORT, LAGEN:LAGEN, VONDSTEN:VONDSTEN, UITRUSTING:UITRUSTING, KOST:KOST, DUUR:DUUR, LICHT_TOT:LICHT_TOT, VONDST_BONUS:VONDST_BONUS,
    laagVan:laagVan, uitVan:uitVan, waardeVan:waardeVan, dobbel:dobbel, botKeuze:botKeuze,
    nieuw:function(o){ return new Mijn(o); },
    soortVan:function(id){ for (var i = 0; i < SOORT.length; i++) if (SOORT[i].id === id) return SOORT[i]; return null; },
    vondstVan:function(id){ for (var i = 0; i < VONDSTEN.length; i++) if (VONDSTEN[i].id === id) return VONDSTEN[i]; return null; }
  };
  root.MIJNMOTOR = MIJNMOTOR;
  if (typeof module !== 'undefined' && module.exports) module.exports = MIJNMOTOR;
})(typeof window !== 'undefined' ? window : globalThis);
