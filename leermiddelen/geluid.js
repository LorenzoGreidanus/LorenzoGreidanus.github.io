/* Geluidseffecten voor Torenverdediging en Zwaardvechter, helemaal in code
   gemaakt met de Web Audio API: oscillatoren, een ruisbuffer, filters en
   omhullenden. Geen audiobestanden, geen bibliotheken, geen netwerk.

   Gebruik:
     GELUID.speel('kanon')                         een geluid afspelen
     GELUID.speel('munt', { volume: 0.5, toon: 1.2, pan: -0.3 })
                                                   volume 0..1, toon is een factor op de
                                                   toonhoogte, pan -1 (links) tot 1 (rechts)
     GELUID.aan()                                  true of false
     GELUID.zetAan(false)                          uit, en bewaard in localStorage 'lg-geluid'
     GELUID.volume(0.4)                            hoofdvolume 0..1 (standaard 0,6); zonder
                                                   getal krijg je het huidige volume terug
     GELUID.knop(document.querySelector('#geluid')) een bestaande <button> wordt een geluidsknop
     GELUID.namen()                                de lijst met geluidsnamen
     GELUID.stemmen()                              hoeveel geluiden er nu klinken

   Een onbekende naam doet niets. Zonder AudioContext doet alles niets.
   Elk geluid mag hooguit eens per 'afstand' ms (standaard 40) en er klinken
   hooguit 24 geluiden tegelijk; wat daarboven komt, wordt overgeslagen. Zo mag
   een spel bij elke tik van elke toren speel('kanon') roepen. */
(function(){
  'use strict';

  var SLEUTEL = 'lg-geluid';
  var MAX_STEMMEN = 24;
  var STANDAARD_AFSTAND = 40;
  var MAX_IN_WACHT = 4;      // zolang de context nog niet loopt: niet meer dan dit opsparen

  var ctx = null;            // de AudioContext, pas na de eerste klik of toets
  var bus = null;            // hier komen alle geluiden samen
  var rem = null;            // zachte compressor, tegen clippen
  var hoofd = null;          // hoofdvolume, ook voor aan en uit
  var ruisBuffer = null;     // witte ruis, één keer gemaakt
  var hoofdVolume = 0.6;
  var aanStaat = leesAan();
  var stemmen = [];          // geluiden die nu klinken
  var laatst = {};           // per naam: wanneer hij het laatst begon
  var knoppen = [];
  var GELUIDEN = {};

  /* ---------- bewaren ---------- */

  function leesAan(){
    try { return localStorage.getItem(SLEUTEL) !== 'uit'; } catch (e){ return true; }
  }
  function bewaarAan(){
    try { localStorage.setItem(SLEUTEL, aanStaat ? 'aan' : 'uit'); } catch (e){}
  }

  function nu(){
    return (window.performance && performance.now) ? performance.now() : Date.now();
  }
  function tussen(x, laag, hoog){ return x < laag ? laag : (x > hoog ? hoog : x); }

  /* ---------- de context en de hoofdketen ---------- */

  // Keten: geluid -> bus -> compressor -> hoofdvolume -> luidsprekers.
  // Het hoofdvolume staat achter de compressor, zodat de compressor
  // hetzelfde doet bij elk volume.
  function maakContext(){
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e){ ctx = null; return null; }
    try {
      bus = ctx.createGain();
      bus.gain.value = 1.5;      // de geluiden zelf zijn zacht gemaakt; hier wat erbij
      rem = ctx.createDynamicsCompressor();
      rem.threshold.value = -14;
      rem.knee.value = 10;
      rem.ratio.value = 3;
      rem.attack.value = 0.004;
      rem.release.value = 0.2;
      hoofd = ctx.createGain();
      hoofd.gain.value = aanStaat ? hoofdVolume : 0;
      bus.connect(rem);
      rem.connect(hoofd);
      hoofd.connect(ctx.destination);
      ruisBuffer = maakRuis();
    } catch (e){ ctx = null; return null; }
    return ctx;
  }

  // Twee seconden witte ruis; elk ruisgeluid begint op een andere plek erin.
  function maakRuis(){
    var lengte = Math.floor(ctx.sampleRate * 2);
    var buf = ctx.createBuffer(1, lengte, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < lengte; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function hervat(){
    if (!ctx || ctx.state !== 'suspended' || !ctx.resume) return;
    try { var p = ctx.resume(); if (p && p.catch) p.catch(function(){}); } catch (e){}
  }

  // Eerste klik of toets: context maken. Daarna alleen nog hervatten als de
  // browser hem heeft stilgezet (bijvoorbeeld op een telefoon na een gesprek).
  function ontgrendel(){
    if (ctx && ctx.state === 'running') return;
    var nieuw = !ctx;
    if (!maakContext()) { stopLuisteren(); return; }
    hervat();
    if (nieuw) stilteSpelen();
  }
  function stopLuisteren(){
    document.removeEventListener('pointerdown', ontgrendel, true);
    document.removeEventListener('keydown', ontgrendel, true);
    document.removeEventListener('touchend', ontgrendel, true);
  }
  // Oudere iPhones luisteren pas na een echt afgespeeld geluid: één stil monster.
  function stilteSpelen(){
    try {
      var b = ctx.createBufferSource();
      b.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      b.connect(ctx.destination);
      b.onended = function(){ try { b.disconnect(); } catch (e){} };
      b.start(0);
    } catch (e){}
  }
  if (typeof document !== 'undefined' && document.addEventListener){
    document.addEventListener('pointerdown', ontgrendel, true);
    document.addEventListener('keydown', ontgrendel, true);
    document.addEventListener('touchend', ontgrendel, true);
  }

  /* ---------- een stem: één klinkend geluid ---------- */

  // Een stem houdt bij welke nodes er bij het geluid horen. Als de laatste
  // bron is afgelopen, worden ze allemaal losgekoppeld.
  function Stem(opties){
    var vol = opties.volume == null ? 1 : tussen(+opties.volume || 0, 0, 1);
    this.k = opties.toon == null ? 1 : tussen(+opties.toon || 1, 0.25, 4);
    this.t = ctx.currentTime + 0.01;
    this.eind = this.t;
    this.nodes = [];
    this.bronnen = 0;
    this.weg = false;
    this.uit = ctx.createGain();
    this.uit.gain.value = vol;
    this.nodes.push(this.uit);
    var pan = opties.pan == null ? 0 : tussen(+opties.pan || 0, -1, 1);
    if (pan && ctx.createStereoPanner){
      var p = ctx.createStereoPanner();
      p.pan.value = pan;
      this.uit.connect(p);
      p.connect(bus);
      this.nodes.push(p);
    } else {
      this.uit.connect(bus);
    }
  }

  // Een bron (oscillator of ruis) laten starten en stoppen, en tellen.
  Stem.prototype.bron = function(src, begin, einde, plek){
    var s = this;
    s.bronnen++;
    s.nodes.push(src);
    src.onended = function(){
      s.bronnen--;
      if (s.bronnen <= 0) s.ruimOp();
    };
    if (plek) src.start(begin, plek); else src.start(begin);
    src.stop(einde);
    if (einde > s.eind) s.eind = einde;
  };

  Stem.prototype.ruimOp = function(){
    if (this.weg) return;
    this.weg = true;
    for (var i = 0; i < this.nodes.length; i++){
      try { this.nodes[i].onended = null; } catch (e){}
      try { this.nodes[i].disconnect(); } catch (e){}
    }
    this.nodes = [];
    var j = stemmen.indexOf(this);
    if (j >= 0) stemmen.splice(j, 1);
  };

  // Snel op, even vasthouden, dan rustig weg (exponentieel klinkt natuurlijk).
  function omhul(param, t, aanzet, piek, houd, einde){
    param.setValueAtTime(0.0001, t);
    param.linearRampToValueAtTime(piek, t + aanzet);
    if (houd > 0) param.setValueAtTime(piek, t + aanzet + houd);
    param.exponentialRampToValueAtTime(0.0001, einde);
  }

  // Filter met eventueel een sweep: { type, f, naar, q, glij }.
  Stem.prototype.filter = function(o, t, duur){
    var f = ctx.createBiquadFilter();
    var max = ctx.sampleRate * 0.45;
    f.type = o.type || 'lowpass';
    f.Q.value = o.q == null ? 0.8 : o.q;
    f.frequency.setValueAtTime(tussen(o.f * this.k, 20, max), t);
    if (o.naar) f.frequency.exponentialRampToValueAtTime(tussen(o.naar * this.k, 20, max), t + (o.glij || duur));
    this.nodes.push(f);
    return f;
  };

  // Een toon. o: { vorm, f, naar, glij, t, duur, vol, aanzet, houd, filter, vib }
  // vib is een trilling op de toonhoogte: { f, diepte, vorm }.
  Stem.prototype.toon = function(o){
    var t = this.t + (o.t || 0);
    var duur = o.duur || 0.2;
    var aanzet = o.aanzet == null ? 0.005 : o.aanzet;
    var osc = ctx.createOscillator();
    osc.type = o.vorm || 'sine';
    osc.frequency.setValueAtTime(o.f * this.k, t);
    if (o.naar) osc.frequency.exponentialRampToValueAtTime(o.naar * this.k, t + (o.glij || duur));
    var g = ctx.createGain();
    omhul(g.gain, t, aanzet, o.vol == null ? 0.2 : o.vol, o.houd || 0, t + duur);
    this.nodes.push(g);
    if (o.filter){
      var f = this.filter(o.filter, t, duur);
      osc.connect(f); f.connect(g);
    } else {
      osc.connect(g);
    }
    g.connect(this.uit);
    if (o.vib){
      var lfo = ctx.createOscillator();
      var diep = ctx.createGain();
      lfo.type = o.vib.vorm || 'sine';
      lfo.frequency.value = o.vib.f;
      diep.gain.value = o.vib.diepte * this.k;
      lfo.connect(diep); diep.connect(osc.frequency);
      this.nodes.push(diep);
      this.bron(lfo, t, t + duur + 0.02);
    }
    this.bron(osc, t, t + duur + 0.02);
  };

  // Ruis door een filter. o: { t, duur, vol, aanzet, houd, type, f, naar, glij, q }
  Stem.prototype.ruis = function(o){
    var t = this.t + (o.t || 0);
    var duur = o.duur || 0.2;
    var src = ctx.createBufferSource();
    src.buffer = ruisBuffer;
    src.loop = true;
    var g = ctx.createGain();
    omhul(g.gain, t, o.aanzet == null ? 0.003 : o.aanzet, o.vol == null ? 0.2 : o.vol, o.houd || 0, t + duur);
    var f = this.filter({ type: o.type || 'lowpass', f: o.f || 1000, naar: o.naar, glij: o.glij, q: o.q }, t, duur);
    src.connect(f); f.connect(g); g.connect(this.uit);
    this.nodes.push(g);
    // Op een toevallige plek in de buffer beginnen: zo klinkt niet elke plof gelijk.
    this.bron(src, t, t + duur + 0.02, Math.random() * 1.5);
  };

  /* ---------- afspelen ---------- */

  function speel(naam, opties){
    var g = Object.prototype.hasOwnProperty.call(GELUIDEN, naam) ? GELUIDEN[naam] : null;
    if (!g || !aanStaat || !ctx) return;
    if (ctx.state === 'closed') return;
    hervat();
    if (ctx.state !== 'running' && stemmen.length >= MAX_IN_WACHT) return;
    var tijd = nu();
    if (laatst[naam] != null && tijd - laatst[naam] < g.afstand) return;
    if (stemmen.length >= MAX_STEMMEN) return;
    laatst[naam] = tijd;
    var s = null;
    try {
      s = new Stem(opties || {});
      stemmen.push(s);
      g.maak(s);
      if (!s.bronnen) { s.ruimOp(); return; }
      // Vangnet: mocht onended nooit komen, dan toch opruimen.
      var wacht = (s.eind - ctx.currentTime + 1.5) * 1000;
      setTimeout(function(){ if (!s.weg && ctx.state === 'running') s.ruimOp(); }, wacht);
    } catch (e){
      if (s) s.ruimOp();
    }
  }

  function def(naam, afstand, maak){
    GELUIDEN[naam] = { afstand: afstand, maak: maak };
  }

  /* ---------- Torenverdediging ---------- */

  // Korte doffe plof: ruisstoot door een lowpass en een lage toon die zakt.
  def('kanon', STANDAARD_AFSTAND, function(s){
    s.ruis({ duur: 0.18, vol: 0.5, f: 900, naar: 160, aanzet: 0.002 });
    s.toon({ f: 150, naar: 55, duur: 0.16, vol: 0.45, aanzet: 0.003 });
  });

  // Zwiep: ruis waarvan het filter omhoog schuift, met een klein kraakje.
  def('katapult', STANDAARD_AFSTAND, function(s){
    s.ruis({ duur: 0.28, vol: 0.3, type: 'bandpass', f: 350, naar: 2400, q: 1.8, aanzet: 0.12 });
    s.toon({ vorm: 'triangle', f: 210, naar: 170, duur: 0.06, vol: 0.08, aanzet: 0.002 });
  });

  // Steen slaat in: lage dreun met wat gruis.
  def('kei', STANDAARD_AFSTAND, function(s){
    s.toon({ f: 95, naar: 40, duur: 0.32, vol: 0.5, aanzet: 0.003 });
    s.ruis({ duur: 0.22, vol: 0.35, f: 600, naar: 110, aanzet: 0.002 });
  });

  // Fluitje dat snel omhoog gaat: pijl, dart en scherpschutter.
  def('pijl', STANDAARD_AFSTAND, function(s){
    s.toon({ f: 600, naar: 1700, glij: 0.08, duur: 0.1, vol: 0.14, aanzet: 0.004 });
    s.ruis({ duur: 0.07, vol: 0.06, type: 'highpass', f: 3000, aanzet: 0.01 });
  });

  // Knal, maar zacht: korte bandpass-tik met een lage staart.
  def('schutter', STANDAARD_AFSTAND, function(s){
    s.ruis({ duur: 0.07, vol: 0.3, type: 'bandpass', f: 1800, q: 1, aanzet: 0.001 });
    s.ruis({ duur: 0.16, vol: 0.14, f: 700, naar: 150, aanzet: 0.002 });
    s.toon({ vorm: 'triangle', f: 480, naar: 200, duur: 0.05, vol: 0.1, aanzet: 0.001 });
  });

  // Heel kort hoog popje voor de apentoren (wordt vaak geroepen).
  def('banaan', 70, function(s){
    s.toon({ f: 850, naar: 1300, glij: 0.03, duur: 0.05, vol: 0.12, aanzet: 0.002 });
  });

  // Schokgolf: lage toon die wiebelt en zakt.
  def('golf', STANDAARD_AFSTAND, function(s){
    s.toon({ f: 120, naar: 55, duur: 0.5, vol: 0.35, aanzet: 0.01, vib: { f: 9, diepte: 14 } });
    s.ruis({ duur: 0.4, vol: 0.16, f: 320, naar: 80, aanzet: 0.02 });
  });

  // Explosie: ruis waarvan de lowpass dichtgaat, met een lage klap eronder.
  def('bom', STANDAARD_AFSTAND, function(s){
    s.ruis({ duur: 0.75, vol: 0.55, f: 2400, naar: 110, glij: 0.6, aanzet: 0.003 });
    s.toon({ f: 85, naar: 32, duur: 0.55, vol: 0.5, aanzet: 0.003 });
  });

  // Borrelen en sissen: een paar bloopjes omhoog op toevallige hoogtes.
  def('lava', STANDAARD_AFSTAND, function(s){
    for (var i = 0; i < 4; i++){
      var f = 180 + Math.random() * 220;
      s.toon({ f: f, naar: f * 1.9, t: i * 0.07 + Math.random() * 0.03, duur: 0.07, vol: 0.13, aanzet: 0.004 });
    }
    s.ruis({ duur: 0.42, vol: 0.05, type: 'highpass', f: 4000, aanzet: 0.06 });
  });

  // Bliksem: zaagtand die snel heen en weer springt, gedempt, met knetter.
  def('zap', STANDAARD_AFSTAND, function(s){
    s.toon({ vorm: 'sawtooth', f: 220, duur: 0.3, vol: 0.1, aanzet: 0.002,
      vib: { f: 45, diepte: 140, vorm: 'square' }, filter: { type: 'lowpass', f: 2600, q: 1 } });
    s.toon({ vorm: 'sawtooth', f: 330, naar: 110, duur: 0.26, vol: 0.07, aanzet: 0.002,
      filter: { type: 'lowpass', f: 2000 } });
    s.ruis({ duur: 0.25, vol: 0.14, type: 'bandpass', f: 3000, naar: 1200, q: 0.8, aanzet: 0.001 });
  });

  // IJzig glinsteren: hoge sinussen met vibrato die rustig zakken.
  def('vries', STANDAARD_AFSTAND, function(s){
    s.toon({ f: 2200, naar: 1600, duur: 0.6, vol: 0.06, aanzet: 0.01, vib: { f: 7, diepte: 30 } });
    s.toon({ f: 2750, naar: 2000, t: 0.05, duur: 0.5, vol: 0.045, aanzet: 0.01, vib: { f: 8, diepte: 35 } });
    s.toon({ f: 1650, naar: 1250, t: 0.1, duur: 0.55, vol: 0.05, aanzet: 0.01, vib: { f: 6, diepte: 20 } });
    s.ruis({ duur: 0.4, vol: 0.025, type: 'highpass', f: 6000, aanzet: 0.03 });
  });

  // Heel zacht tikje als een fout geraakt wordt.
  def('raak', 60, function(s){
    s.toon({ vorm: 'triangle', f: 700, naar: 480, duur: 0.035, vol: 0.07, aanzet: 0.001 });
  });

  // Een fout gaat neer: klein bloopje omlaag.
  def('plop', STANDAARD_AFSTAND, function(s){
    s.toon({ f: 520, naar: 160, duur: 0.13, vol: 0.22, aanzet: 0.003 });
  });

  // Muntje: twee snelle hoge tonen (si, mi).
  def('munt', STANDAARD_AFSTAND, function(s){
    s.toon({ vorm: 'triangle', f: 988, duur: 0.07, vol: 0.13, aanzet: 0.002 });
    s.toon({ vorm: 'triangle', f: 1319, t: 0.06, duur: 0.26, vol: 0.13, aanzet: 0.002 });
    s.toon({ f: 2638, t: 0.06, duur: 0.15, vol: 0.025, aanzet: 0.002 });
  });

  // Toren neerzetten: houtige tok en een korte stijgende toon.
  def('bouw', STANDAARD_AFSTAND, function(s){
    s.toon({ f: 300, naar: 170, duur: 0.07, vol: 0.28, aanzet: 0.001 });
    s.ruis({ duur: 0.04, vol: 0.18, type: 'bandpass', f: 900, q: 3, aanzet: 0.001 });
    s.toon({ vorm: 'triangle', f: 440, naar: 660, t: 0.05, duur: 0.16, vol: 0.11, aanzet: 0.005 });
  });

  // Versterken: drie stijgende tonen (do, mi, sol) en een glimmend slot.
  def('sterker', STANDAARD_AFSTAND, function(s){
    s.toon({ vorm: 'triangle', f: 523, duur: 0.14, vol: 0.13 });
    s.toon({ vorm: 'triangle', f: 659, t: 0.07, duur: 0.14, vol: 0.13 });
    s.toon({ vorm: 'triangle', f: 784, t: 0.14, duur: 0.18, vol: 0.13 });
    s.toon({ f: 1046, t: 0.21, duur: 0.28, vol: 0.07 });
  });

  // Toren weghalen: twee dalende tonen.
  def('verkoop', STANDAARD_AFSTAND, function(s){
    s.toon({ vorm: 'triangle', f: 660, duur: 0.13, vol: 0.13 });
    s.toon({ vorm: 'triangle', f: 440, t: 0.09, duur: 0.18, vol: 0.13 });
  });

  // UI-klik: heel kort.
  def('klik', STANDAARD_AFSTAND, function(s){
    s.toon({ f: 1100, naar: 850, duur: 0.028, vol: 0.1, aanzet: 0.001 });
  });

  // Goed antwoord: do, mi, sol omhoog, vrolijk.
  def('goed', STANDAARD_AFSTAND, function(s){
    s.toon({ vorm: 'triangle', f: 523, duur: 0.18, vol: 0.14 });
    s.toon({ vorm: 'triangle', f: 659, t: 0.08, duur: 0.18, vol: 0.14 });
    s.toon({ vorm: 'triangle', f: 784, t: 0.16, duur: 0.36, vol: 0.14 });
    s.toon({ f: 262, duur: 0.5, vol: 0.06, aanzet: 0.01 });
  });

  // Fout antwoord: zachte lage bwomp, niet bestraffend.
  def('fout', STANDAARD_AFSTAND, function(s){
    s.toon({ f: 220, naar: 150, duur: 0.32, vol: 0.2, aanzet: 0.02 });
    s.toon({ vorm: 'triangle', f: 233, naar: 156, duur: 0.3, vol: 0.07, aanzet: 0.02,
      filter: { type: 'lowpass', f: 900 } });
  });

  // Reeks: glinsterende opgaande arpeggio.
  def('reeks', STANDAARD_AFSTAND, function(s){
    var noten = [784, 988, 1175, 1568];
    for (var i = 0; i < noten.length; i++){
      s.toon({ f: noten[i], t: i * 0.045, duur: 0.2, vol: 0.09, aanzet: 0.003 });
    }
    s.ruis({ t: 0.12, duur: 0.25, vol: 0.03, type: 'highpass', f: 6000, aanzet: 0.02 });
  });

  // Een fout bereikt de school: doffe dreun en een korte dalende toon.
  def('klap', STANDAARD_AFSTAND, function(s){
    s.toon({ f: 125, naar: 45, duur: 0.3, vol: 0.45, aanzet: 0.003 });
    s.ruis({ duur: 0.2, vol: 0.32, f: 700, naar: 120, aanzet: 0.002 });
    s.toon({ vorm: 'triangle', f: 392, naar: 262, t: 0.05, duur: 0.26, vol: 0.09 });
  });

  // Baas komt eraan: lage hoorn, twee tonen, de tweede een halve toon lager.
  def('baas', 400, function(s){
    var hoorn = { type: 'lowpass', f: 650, q: 1.2 };
    s.toon({ vorm: 'sawtooth', f: 110, duur: 0.48, vol: 0.18, aanzet: 0.07, houd: 0.25,
      filter: hoorn, vib: { f: 5, diepte: 1.5 } });
    s.toon({ f: 55, duur: 0.48, vol: 0.12, aanzet: 0.07, houd: 0.25 });
    s.toon({ vorm: 'sawtooth', f: 104, t: 0.5, duur: 0.6, vol: 0.18, aanzet: 0.07, houd: 0.3,
      filter: hoorn, vib: { f: 5, diepte: 1.5 } });
    s.toon({ f: 52, t: 0.5, duur: 0.6, vol: 0.12, aanzet: 0.07, houd: 0.3 });
  });

  // Baas verslagen: korte opgaande fanfare.
  def('baasweg', 400, function(s){
    var koper = { type: 'lowpass', f: 2200, q: 0.7 };
    var noten = [392, 523, 659];
    for (var i = 0; i < noten.length; i++){
      s.toon({ vorm: 'sawtooth', f: noten[i], t: i * 0.09, duur: 0.1, vol: 0.09, filter: koper });
      s.toon({ vorm: 'triangle', f: noten[i], t: i * 0.09, duur: 0.1, vol: 0.08 });
    }
    s.toon({ vorm: 'sawtooth', f: 784, t: 0.27, duur: 0.6, vol: 0.09, houd: 0.2, filter: koper,
      vib: { f: 6, diepte: 5 } });
    s.toon({ vorm: 'triangle', f: 784, t: 0.27, duur: 0.6, vol: 0.08, houd: 0.2 });
    s.toon({ vorm: 'triangle', f: 196, t: 0.27, duur: 0.6, vol: 0.1, houd: 0.2 });
  });

  // Nieuwe ronde: zachte bel, met boventonen die niet precies passen, net als echt metaal.
  def('ronde', 300, function(s){
    s.toon({ f: 523, duur: 1.1, vol: 0.14, aanzet: 0.003 });
    s.toon({ f: 523 * 2.76, duur: 0.7, vol: 0.045, aanzet: 0.002 });
    s.toon({ f: 523 * 5.4, duur: 0.3, vol: 0.02, aanzet: 0.002 });
    s.toon({ f: 261, duur: 1.0, vol: 0.08, aanzet: 0.005 });
  });

  // Kracht of zegen gekozen: magische sweep omhoog met glinster.
  def('kracht', 200, function(s){
    s.toon({ f: 300, naar: 1200, duur: 0.45, vol: 0.11, aanzet: 0.04, vib: { f: 6, diepte: 15 } });
    s.ruis({ duur: 0.5, vol: 0.05, type: 'bandpass', f: 1000, naar: 5000, q: 4, aanzet: 0.1 });
    var noten = [1568, 2093, 2637];
    for (var i = 0; i < noten.length; i++){
      s.toon({ f: noten[i], t: 0.25 + i * 0.07, duur: 0.28, vol: 0.05, aanzet: 0.003 });
    }
  });

  // Vraagkracht opgeladen: korte ping omhoog.
  def('lading', 200, function(s){
    s.toon({ f: 880, naar: 1760, glij: 0.06, duur: 0.2, vol: 0.12, aanzet: 0.003 });
    s.toon({ f: 1760, t: 0.06, duur: 0.22, vol: 0.04, aanzet: 0.003 });
  });

  // Overwinning: vrolijk loopje in do majeur dat eindigt op een akkoord.
  def('gewonnen', 1000, function(s){
    var melodie = [[523, 0, 0.14], [659, 0.13, 0.14], [784, 0.26, 0.14], [1046, 0.39, 0.32],
                   [784, 0.72, 0.13], [1046, 0.85, 0.13], [1319, 0.98, 1.2]];
    for (var i = 0; i < melodie.length; i++){
      var m = melodie[i];
      s.toon({ vorm: 'triangle', f: m[0], t: m[1], duur: m[2], vol: 0.13, houd: m[2] > 0.5 ? 0.25 : 0 });
    }
    var akkoord = [523, 659, 784];
    for (var j = 0; j < akkoord.length; j++){
      s.toon({ f: akkoord[j], t: 0.98, duur: 1.3, vol: 0.05, aanzet: 0.02, houd: 0.3 });
    }
    s.toon({ vorm: 'triangle', f: 131, duur: 0.36, vol: 0.11 });
    s.toon({ vorm: 'triangle', f: 196, t: 0.39, duur: 0.3, vol: 0.11 });
    s.toon({ vorm: 'triangle', f: 262, t: 0.98, duur: 1.2, vol: 0.11, houd: 0.25 });
    s.toon({ f: 2093, t: 1.02, duur: 0.3, vol: 0.035 });
    s.toon({ f: 2637, t: 1.12, duur: 0.3, vol: 0.03 });
  });

  // Einde potje: zacht dalend, maar het landt op een warm majeurakkoord.
  def('verloren', 1000, function(s){
    var zacht = { type: 'lowpass', f: 1800 };
    var melodie = [[784, 0, 0.3], [659, 0.28, 0.3], [587, 0.56, 0.3], [523, 0.84, 1.3]];
    for (var i = 0; i < melodie.length; i++){
      var m = melodie[i];
      s.toon({ vorm: 'triangle', f: m[0], t: m[1], duur: m[2], vol: 0.12, aanzet: 0.02,
        houd: m[2] > 0.5 ? 0.3 : 0, filter: zacht });
    }
    var akkoord = [262, 330, 392];
    for (var j = 0; j < akkoord.length; j++){
      s.toon({ f: akkoord[j], t: 0.84, duur: 1.4, vol: 0.05, aanzet: 0.05, houd: 0.3 });
    }
  });

  /* ---------- Zwaardvechter ---------- */

  // Zwaardzwaai: gefilterde ruis die aanzwelt en wegsuist.
  def('zwaai', STANDAARD_AFSTAND, function(s){
    s.ruis({ duur: 0.2, vol: 0.28, type: 'bandpass', f: 600, naar: 2200, glij: 0.12, q: 1.5, aanzet: 0.06 });
  });

  // Zwaard raakt: metalig tikje en een doffe plof.
  def('treffer', STANDAARD_AFSTAND, function(s){
    s.toon({ vorm: 'triangle', f: 1800, naar: 1200, duur: 0.04, vol: 0.08, aanzet: 0.001 });
    s.toon({ f: 1700, duur: 0.08, vol: 0.04, aanzet: 0.001 });
    s.toon({ f: 2550, duur: 0.06, vol: 0.025, aanzet: 0.001 });
    s.toon({ f: 160, naar: 70, duur: 0.12, vol: 0.38, aanzet: 0.002 });
    s.ruis({ duur: 0.08, vol: 0.25, f: 1200, naar: 200, aanzet: 0.001 });
  });

  // Kritieke treffer: steviger klap en daarna glinster.
  def('crit', STANDAARD_AFSTAND, function(s){
    s.ruis({ duur: 0.06, vol: 0.32, type: 'bandpass', f: 2000, q: 0.7, aanzet: 0.001 });
    s.toon({ f: 200, naar: 60, duur: 0.18, vol: 0.45, aanzet: 0.002 });
    s.toon({ vorm: 'triangle', f: 1319, t: 0.03, duur: 0.2, vol: 0.06 });
    s.toon({ f: 1568, t: 0.05, duur: 0.25, vol: 0.06 });
    s.toon({ f: 2093, t: 0.1, duur: 0.25, vol: 0.05 });
  });

  // Boog: geplukte pees en een zoevende pijl.
  def('boog', STANDAARD_AFSTAND, function(s){
    s.toon({ vorm: 'triangle', f: 330, naar: 300, duur: 0.25, vol: 0.18, aanzet: 0.002,
      filter: { type: 'lowpass', f: 1500, naar: 400 } });
    s.toon({ f: 660, duur: 0.1, vol: 0.04, aanzet: 0.002 });
    s.ruis({ t: 0.02, duur: 0.15, vol: 0.1, type: 'bandpass', f: 1500, naar: 3500, q: 2, aanzet: 0.03 });
  });

  // Werpmes: korte hoge zwiep.
  def('mes', STANDAARD_AFSTAND, function(s){
    s.ruis({ duur: 0.1, vol: 0.16, type: 'bandpass', f: 2500, naar: 5000, q: 2, aanzet: 0.02 });
    s.toon({ f: 1200, naar: 2000, duur: 0.06, vol: 0.035, aanzet: 0.01 });
  });

  // Ontwijken of sprong: snelle swoosh omhoog.
  def('dash', STANDAARD_AFSTAND, function(s){
    s.ruis({ duur: 0.2, vol: 0.26, type: 'bandpass', f: 400, naar: 3000, q: 1.2, aanzet: 0.04 });
    s.toon({ f: 300, naar: 700, duur: 0.15, vol: 0.05, aanzet: 0.02 });
  });

  // Blokkeren met een schild: metalige klank (boventonen die niet passen) en een bonk.
  def('blok', STANDAARD_AFSTAND, function(s){
    s.toon({ f: 520, duur: 0.35, vol: 0.1, aanzet: 0.001 });
    s.toon({ f: 1310, duur: 0.25, vol: 0.06, aanzet: 0.001 });
    s.toon({ f: 2150, duur: 0.15, vol: 0.035, aanzet: 0.001 });
    s.ruis({ duur: 0.03, vol: 0.16, type: 'bandpass', f: 3000, q: 2, aanzet: 0.001 });
    s.toon({ f: 180, naar: 120, duur: 0.08, vol: 0.2, aanzet: 0.001 });
  });

  // Speler geraakt: doffe klap en een korte dalende toon.
  def('au', STANDAARD_AFSTAND, function(s){
    s.toon({ f: 180, naar: 90, duur: 0.12, vol: 0.32, aanzet: 0.002 });
    s.ruis({ duur: 0.07, vol: 0.22, f: 900, aanzet: 0.001 });
    s.toon({ vorm: 'triangle', f: 440, naar: 300, t: 0.03, duur: 0.2, vol: 0.09 });
  });

  // Speler gaat neer: glijdt omlaag.
  def('neer', 200, function(s){
    s.toon({ vorm: 'triangle', f: 600, naar: 150, duur: 0.7, vol: 0.14, aanzet: 0.01,
      filter: { type: 'lowpass', f: 2000 } });
    s.toon({ f: 300, naar: 75, duur: 0.7, vol: 0.09, aanzet: 0.01 });
  });

  // Speler staat weer op: glijdt omhoog, hoopvol, met een lichtje aan het eind.
  def('op', 200, function(s){
    s.toon({ vorm: 'triangle', f: 220, naar: 880, glij: 0.5, duur: 0.6, vol: 0.13, aanzet: 0.02 });
    s.toon({ f: 440, naar: 1320, glij: 0.5, duur: 0.55, vol: 0.05, aanzet: 0.02 });
    s.toon({ f: 1760, t: 0.45, duur: 0.3, vol: 0.05, aanzet: 0.003 });
  });

  // Terug naar het checkpoint: snel trillende sweep omlaag, dan een zacht belletje.
  def('checkpoint', 300, function(s){
    s.toon({ f: 1200, naar: 300, duur: 0.5, vol: 0.09, aanzet: 0.02, vib: { f: 18, diepte: 60 } });
    s.ruis({ duur: 0.5, vol: 0.05, type: 'bandpass', f: 4000, naar: 800, q: 3, aanzet: 0.05 });
    s.toon({ f: 1046, t: 0.48, duur: 0.45, vol: 0.08, aanzet: 0.003 });
    s.toon({ f: 1568, t: 0.48, duur: 0.3, vol: 0.03, aanzet: 0.003 });
  });

  // Baasaanval licht op: twee zachte oplopende tikjes.
  def('aanval', 80, function(s){
    s.toon({ f: 600, naar: 900, duur: 0.06, vol: 0.09, aanzet: 0.002 });
    s.toon({ f: 800, naar: 1200, t: 0.07, duur: 0.07, vol: 0.09, aanzet: 0.002 });
  });

  // Baasaanval slaat in: lage dreun.
  def('knal', STANDAARD_AFSTAND, function(s){
    s.toon({ f: 75, naar: 30, duur: 0.5, vol: 0.55, aanzet: 0.003 });
    s.ruis({ duur: 0.4, vol: 0.4, f: 900, naar: 80, aanzet: 0.002 });
  });

  // Iets oprapen: drie heldere toontjes omhoog, anders dan het muntje.
  def('kist', STANDAARD_AFSTAND, function(s){
    s.toon({ f: 1175, duur: 0.06, vol: 0.1, aanzet: 0.002 });
    s.toon({ f: 1568, t: 0.05, duur: 0.1, vol: 0.1, aanzet: 0.002 });
    s.toon({ vorm: 'triangle', f: 2093, t: 0.1, duur: 0.25, vol: 0.09, aanzet: 0.002 });
  });

  /* ---------- aan, uit en volume ---------- */

  function zetHoofd(){
    if (!hoofd) return;
    var doel = aanStaat ? hoofdVolume : 0;
    try {
      hoofd.gain.cancelScheduledValues(ctx.currentTime);
      hoofd.gain.setTargetAtTime(doel, ctx.currentTime, 0.02);
    } catch (e){ hoofd.gain.value = doel; }
  }

  function zetAan(b){
    aanStaat = !!b;
    bewaarAan();
    zetHoofd();
    werkKnoppenBij();
  }

  function volume(v){
    if (typeof v === 'number' && !isNaN(v)){
      hoofdVolume = tussen(v, 0, 1);
      zetHoofd();
    }
    return hoofdVolume;
  }

  // Een andere tab zet het geluid aan of uit: hier ook.
  if (typeof window !== 'undefined' && window.addEventListener){
    window.addEventListener('storage', function(e){
      if (e.key !== SLEUTEL) return;
      aanStaat = e.newValue !== 'uit';
      zetHoofd();
      werkKnoppenBij();
    });
  }

  /* ---------- de geluidsknop ---------- */

  var LUIDSPREKER = '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/>';
  var GOLFJES = '<path d="M15.5 9.5a3.5 3.5 0 0 1 0 5"/><path d="M18 7a7 7 0 0 1 0 10"/>';
  var KRUISJE = '<path d="M16 10l4 4M20 10l-4 4"/>';

  function icoon(aan){
    return '<svg aria-hidden="true" focusable="false" width="1.25em" height="1.25em" viewBox="0 0 24 24"' +
      ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      LUIDSPREKER + (aan ? GOLFJES : KRUISJE) + '</svg>';
  }

  function werkKnopBij(el){
    el.setAttribute('aria-pressed', aanStaat ? 'true' : 'false');
    el.setAttribute('title', aanStaat ? 'Geluid aan' : 'Geluid uit');
    el.innerHTML = icoon(aanStaat);
  }
  function werkKnoppenBij(){
    for (var i = 0; i < knoppen.length; i++) werkKnopBij(knoppen[i]);
  }

  function knop(el){
    if (!el || el.__geluidKnop) return el;
    el.__geluidKnop = true;
    if (!el.getAttribute('type')) el.setAttribute('type', 'button');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Geluid');
    knoppen.push(el);
    werkKnopBij(el);
    el.addEventListener('click', function(){
      zetAan(!aanStaat);
      if (aanStaat){ ontgrendel(); speel('klik'); }
    });
    return el;
  }

  /* ---------- naar buiten ---------- */

  window.GELUID = {
    speel: speel,
    aan: function(){ return aanStaat; },
    zetAan: zetAan,
    volume: volume,
    knop: knop,
    namen: function(){ return Object.keys(GELUIDEN); },
    stemmen: function(){ return stemmen.length; }
  };
})();

/* Alle geluidsnamen

   Torenverdediging:
     kanon, katapult, kei, pijl, schutter, banaan, golf, bom, lava, zap,
     vries, raak, plop, munt, bouw, sterker, verkoop, klik, goed, fout,
     reeks, klap, baas, baasweg, ronde, kracht, lading, gewonnen, verloren

   Zwaardvechter:
     zwaai, treffer, crit, boog, mes, dash, blok, au, neer, op,
     checkpoint, aanval, knal, kist

   Minimale afstand (ms) als die afwijkt van 40: banaan 70, raak 60, aanval 80,
   lading, kracht, neer en op 200, ronde en checkpoint 300, baas en baasweg 400,
   gewonnen en verloren 1000. */
