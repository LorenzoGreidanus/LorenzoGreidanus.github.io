/* De kaart van Feodalisme: zeshoekige gebieden in rijen, met akkers, weiden,
   bossen en heuvels, ketens van gebergte waar niemand doorheen komt, en
   rivieren langs de randen van gebieden waar geen leger overheen kan. Het
   bord en de telefoons maken hem uit hetzelfde zaadje, dus over de lijn gaat
   alleen wie wat heeft, nooit de kaart zelf.

     var k = FEOKAART.maak(zaad);
     k.hex[i] = { i, kol, rij, soort, naam, buren:[...], richting:[6 buren of -1] }
     k.open(a, b)            kun je van gebied a naar buur b? (geen gebergte, geen rivier)
     k.pad(a, b, brug)       de kortste weg van a naar b als lijst gebieden, of null;
                             brug(x, y) zegt of je over de rivier tussen x en y mag (een brug)
     k.isRivier(a, b)        ligt er een rivier tussen a en b?
     FEOKAART.bruggen(k, rijkVanHex, kasteelVanRijk)
                             de bruggen: per rivier een voor elk rijk dat eraan ligt,
                             zo dicht mogelijk bij zijn kasteel; { sl:'a-b', a, b, r }
     k.rivieren              lijsten van hoeken [gebied, hoek]
     FEOKAART.midden(h, r)   het midden van een gebied bij straal r
     FEOKAART.punten(h, r)   de zes hoeken, voor een svg-polygon
     FEOKAART.randen(h, r, krimp)   de zes randen met de buur erachter (of -1)
     FEOKAART.rivier(k, n, r)       de rivier als svg-pad
     FEOKAART.maat(r)        { b, h } van de hele kaart
     FEOKAART.afstand(a, b)  in stappen van gebied naar gebied, hemelsbreed
*/
(function(wereld){ var FEOKAART = (function(){
  'use strict';
  var KOL = 8, RIJ = 6;
  var SOORTEN = {
    akker:  { naam:'akker',    oogst:8, verdedig:1,   kleur:'#F3E2A6', donker:'#7a6a33' },
    weide:  { naam:'weide',    oogst:6, verdedig:1,   kleur:'#D3E6B5', donker:'#4d6b33' },
    bos:    { naam:'bos',      oogst:3, verdedig:1.5, kleur:'#A9CB98', donker:'#2f5a35' },
    heuvel: { naam:'heuvel',   oogst:3, verdedig:1.8, kleur:'#DCCBA9', donker:'#6b5634' },
    berg:   { naam:'gebergte', oogst:0, verdedig:1,   kleur:'#C9C2B8', donker:'#5d564d', dicht:true }
  };
  var VOOR = ['Eiken', 'Wolfs', 'Ooster', 'Wester', 'Linde', 'Kraaien', 'Beek', 'Heide', 'Molen', 'Hazel', 'Vossen', 'Zwanen',
              'Bever', 'Ganzen', 'Haver', 'Rogge', 'Wilgen', 'Elzen', 'Herten', 'Raven', 'Klaver', 'Schapen', 'Uilen', 'Steen',
              'Zand', 'Riet', 'Distel', 'Bramen', 'Vlas', 'Brem', 'Berken', 'Esdoorn', 'Mossel', 'Leeuwen', 'Valken', 'Reigers',
              'Duiven', 'Hoeven', 'Kloosters', 'Bronnen', 'Dassen', 'Egel', 'Hazen', 'Mieren', 'Paarden', 'Ossen', 'Zwijnen', 'Lammer'];
  var NA = { akker:['veld', 'akker', 'kamp', 'es'], weide:['weide', 'wei', 'hoeve', 'dal'], bos:['bos', 'woud', 'hout', 'loo'], heuvel:['berg', 'heuvel', 'rug', 'top'], berg:['gebergte', 'kam', 'pieken'] };
  /* een eigen toeval met een zaadje, zodat bord en telefoon dezelfde kaart maken */
  function toeval(zaad){
    var z = (zaad >>> 0) || 1;
    return function(){ z = (z + 0x6D2B79F5) | 0; var t = Math.imul(z ^ (z >>> 15), z | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  /* De buren in zes richtingen: 0 rechts, 1 rechtsonder, 2 linksonder, 3 links,
     4 linksboven, 5 rechtsboven. Oneven rijen schuiven een halve stap naar rechts.
     De rand naar buur i loopt van hoek i naar hoek i + 1. */
  var RICHT = { even:[[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]], oneven:[[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]] };
  function richtingen(kol, rij){
    return RICHT[rij & 1 ? 'oneven' : 'even'].map(function(s){
      var k = kol + s[0], r = rij + s[1];
      return k >= 0 && k < KOL && r >= 0 && r < RIJ ? r * KOL + k : -1;
    });
  }
  var W3 = Math.sqrt(3);
  function midden(h, r){ return { x:W3 * r * (h.kol + 0.5 + (h.rij & 1) * 0.5) + 4, y:r * (1 + 1.5 * h.rij) + 4 }; }
  function hoek(h, j, r, krimp){ var m = midden(h, r), a = Math.PI / 180 * (60 * j - 30), rr = r - (krimp || 0); return { x:m.x + rr * Math.cos(a), y:m.y + rr * Math.sin(a) }; }
  function punten(h, r, krimp){
    var p = [];
    for (var j = 0; j < 6; j++){ var c = hoek(h, j, r, krimp); p.push(c.x.toFixed(1) + ',' + c.y.toFixed(1)); }
    return p.join(' ');
  }
  function sleutel(a, b){ return a < b ? a + '-' + b : b + '-' + a; }

  function maak(zaad){
    var rnd = toeval(zaad), hex = [];
    for (var r = 0; r < RIJ; r++) for (var k = 0; k < KOL; k++){
      var ri = richtingen(k, r);
      hex.push({ i:r * KOL + k, kol:k, rij:r, richting:ri, buren:ri.filter(function(x){ return x >= 0; }) });
    }
    /* het land: een paar kernen per soort, elk gebied neemt de soort van de dichtstbijzijnde kern */
    var kernen = [], verdeling = ['akker', 'akker', 'akker', 'akker', 'weide', 'weide', 'weide', 'bos', 'bos', 'bos', 'heuvel', 'heuvel'];
    verdeling.forEach(function(s){ kernen.push({ s:s, k:rnd() * KOL, r:rnd() * RIJ }); });
    hex.forEach(function(h){
      var best = null, bd = 1e9;
      kernen.forEach(function(c){ var dx = h.kol + (h.rij & 1) * 0.5 - c.k, dy = (h.rij - c.r) * 0.87, d = dx * dx + dy * dy + rnd() * 0.6; if (d < bd){ bd = d; best = c; } });
      h.soort = best.s;
    });
    var grond = hex.map(function(h){ return h.soort; });
    var kaart = { zaad:zaad, kol:KOL, rij:RIJ, hex:hex, dicht:{}, rivier:{}, rivieren:[] };
    kaart.open = function(a, b){ return !kaart.dicht[a] && !kaart.dicht[b] && !kaart.rivier[sleutel(a, b)]; };
    kaart.isRivier = function(a, b){ return !!kaart.rivier[sleutel(a, b)]; };
    kaart.pad = function(a, b, brug){
      if (a === b) return [a];
      if (kaart.dicht[a] || kaart.dicht[b]) return null;
      var van = {}, rij = [a]; van[a] = -1;
      while (rij.length){
        var x = rij.shift();
        for (var q = 0; q < hex[x].buren.length; q++){
          var y = hex[x].buren[q];
          if (van[y] !== undefined || kaart.dicht[y] || (kaart.rivier[sleutel(x, y)] && !(brug && brug(x, y)))) continue;
          van[y] = x;
          if (y === b){ var p = [b]; while (van[p[0]] !== -1) p.unshift(van[p[0]]); return p; }
          rij.push(y);
        }
      }
      return null;
    };
    /* Gebergte en rivieren. Het land moet daarna nog in een stuk bereikbaar
       zijn; lukt dat niet, dan nog eens, met hetzelfde toeval verder. */
    var hoeken = maakHoeken(hex);
    for (var poging = 0; poging < 40; poging++){
      hex.forEach(function(h, n){ h.soort = grond[n]; });
      kaart.dicht = {}; kaart.rivier = {}; kaart.rivieren = [];
      for (var g = 0; g < 2; g++) gebergte(hex, kaart, rnd);
      var bezet = {};
      for (var v = 0; v < 2; v++) rivier(hex, hoeken, kaart, rnd, bezet);
      if (samen(hex, kaart)) break;
    }
    /* vangnet: lukt het niet, dan zonder rivieren, en anders ook zonder gebergte */
    if (!samen(hex, kaart)){ kaart.rivier = {}; kaart.rivieren = []; }
    if (!samen(hex, kaart)){ hex.forEach(function(h, n){ h.soort = grond[n]; }); kaart.dicht = {}; }
    /* namen: geen twee hetzelfde */
    var voor = VOOR.slice();
    for (var i = voor.length - 1; i > 0; i--){ var j = Math.floor(rnd() * (i + 1)); var t = voor[i]; voor[i] = voor[j]; voor[j] = t; }
    hex.forEach(function(h, n){ var na = NA[h.soort]; h.naam = voor[n % voor.length] + na[Math.floor(rnd() * na.length)]; });
    return kaart;
  }
  /* een keten van drie of vier gebieden gebergte, niet langs de rand van de kaart */
  function gebergte(hex, kaart, rnd){
    var start = null;
    for (var t = 0; t < 30 && !start; t++){
      var h = hex[Math.floor(rnd() * hex.length)];
      if (h.kol >= 1 && h.kol <= KOL - 2 && h.rij >= 1 && h.rij <= RIJ - 2 && !kaart.dicht[h.i] && h.buren.every(function(b){ return !kaart.dicht[b]; })) start = h;
    }
    if (!start) return;
    var lang = 3 + Math.floor(rnd() * 2), r = Math.floor(rnd() * 6), nu = start;
    for (var n = 0; n < lang && nu; n++){
      nu.soort = 'berg'; kaart.dicht[nu.i] = true;
      if (rnd() < 0.4) r = (r + (rnd() < 0.5 ? 1 : 5)) % 6;
      var volg = nu.richting[r];
      nu = volg >= 0 && !kaart.dicht[volg] ? hex[volg] : null;
    }
  }
  /* alle hoekpunten van de kaart, met welke randen erop uitkomen en welke gebieden aan die rand liggen */
  function maakHoeken(hex){
    var punt = {}, rand = {};
    function sl(c){ return Math.round(c.x * 100) + ',' + Math.round(c.y * 100); }
    hex.forEach(function(h){
      for (var j = 0; j < 6; j++){
        var a = sl(hoek(h, j, 1)), b = sl(hoek(h, (j + 1) % 6, 1));
        punt[a] = punt[a] || { sl:a, hoek:[h.i, j], buren:{} };
        punt[b] = punt[b] || { sl:b, hoek:[h.i, (j + 1) % 6], buren:{} };
        punt[a].buren[b] = true; punt[b].buren[a] = true;
        var rs = a < b ? a + '|' + b : b + '|' + a;
        rand[rs] = rand[rs] || [];
        if (rand[rs].indexOf(h.i) < 0) rand[rs].push(h.i);
      }
    });
    Object.keys(punt).forEach(function(k){ var p = punt[k]; p.binnen = Object.keys(p.buren).every(function(b){ return rand[k < b ? k + '|' + b : b + '|' + k].length === 2; }); });
    return { punt:punt, rand:rand };
  }
  /* Een rivier: begint aan de rand van de kaart en loopt langs randen van
     gebieden het land in, vijf tot acht randen lang. */
  function rivier(hex, H, kaart, rnd, bezet){
    /* aan de rand, maar wel met een rand die het land in loopt */
    var randpunten = Object.keys(H.punt).filter(function(k){ return !H.punt[k].binnen && !bezet[k] && Object.keys(H.punt[k].buren).some(function(b){ return H.rand[k < b ? k + '|' + b : b + '|' + k].length === 2; }); });
    if (!randpunten.length) return;
    var start = H.punt[randpunten[Math.floor(rnd() * randpunten.length)]];
    var p0 = xy(start.sl), lijn = [start], nu = start, lang = 5 + Math.floor(rnd() * 4), gezien = {};
    gezien[start.sl] = true;
    for (var n = 0; n < lang; n++){
      var kies = Object.keys(nu.buren).filter(function(b){
        var rs = nu.sl < b ? nu.sl + '|' + b : b + '|' + nu.sl;
        return !gezien[b] && !bezet[b] && H.rand[rs].length === 2;
      });
      if (!kies.length) break;
      var best = null, bs = -1e9;
      kies.forEach(function(b){ var q = xy(b), s = Math.hypot(q.x - p0.x, q.y - p0.y) + rnd() * 1.1; if (s > bs){ bs = s; best = b; } });
      nu = H.punt[best]; gezien[best] = true; lijn.push(nu);
    }
    if (lijn.length < 4) return;
    for (var i = 1; i < lijn.length; i++){
      var a = lijn[i - 1].sl, b = lijn[i].sl, rs = a < b ? a + '|' + b : b + '|' + a, hs = H.rand[rs];
      kaart.rivier[sleutel(hs[0], hs[1])] = true;
    }
    lijn.forEach(function(p){ bezet[p.sl] = true; Object.keys(p.buren).forEach(function(b){ bezet[b] = true; }); });
    kaart.rivieren.push(lijn.map(function(p){ return p.hoek; }));
  }
  function xy(sl){ var d = sl.split(','); return { x:+d[0] / 100, y:+d[1] / 100 }; }
  /* is al het begaanbare land met elkaar verbonden, en heeft elk gebied minstens twee open buren? */
  function samen(hex, kaart){
    var open = hex.filter(function(h){ return !kaart.dicht[h.i]; });
    if (!open.length) return false;
    var gezien = {}, rij = [open[0].i]; gezien[open[0].i] = true;
    while (rij.length){ var x = rij.shift(); hex[x].buren.forEach(function(y){ if (!gezien[y] && kaart.open(x, y)){ gezien[y] = true; rij.push(y); } }); }
    if (Object.keys(gezien).length !== open.length) return false;
    return open.every(function(h){ return h.buren.filter(function(b){ return kaart.open(h.i, b); }).length >= 2; });
  }
  /* de zes randen van een gebied, een beetje naar binnen, met de buur erachter */
  function randen(h, r, krimp){
    var uit = [];
    for (var i = 0; i < 6; i++){ var a = hoek(h, i, r, krimp), b = hoek(h, (i + 1) % 6, r, krimp); uit.push({ b:h.richting[i], x1:a.x, y1:a.y, x2:b.x, y2:b.y }); }
    return uit;
  }
  function rivierPad(kaart, n, r){
    var l = kaart.rivieren[n]; if (!l) return '';
    return l.map(function(c, i){ var p = hoek(kaart.hex[c[0]], c[1], r); return (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join('');
  }
  /* Een rivier steek je alleen over via een brug. Elk rijk heeft een brug
     over elke rivier die in of tegen zijn land loopt: de plek het dichtst bij
     zijn kasteel. Bord en telefoon rekenen hem zo allebei hetzelfde uit. */
  function bruggen(kaart, rijkVanHex, kasteelVanRijk){
    var uit = [], gezien = {};
    kaart.rivieren.forEach(function(lijn){
      /* de randen van deze rivier, in volgorde */
      var randen = [];
      for (var i = 1; i < lijn.length; i++){
        var p = hoek(kaart.hex[lijn[i - 1][0]], lijn[i - 1][1], 1), q = hoek(kaart.hex[lijn[i][0]], lijn[i][1], 1);
        Object.keys(kaart.rivier).forEach(function(sl){
          if (randen.some(function(x){ return x.sl === sl; })) return;
          var d = sl.split('-'), a = +d[0], b = +d[1];
          /* de rand tussen a en b loopt van p naar q als beide hoeken op beide gebieden liggen */
          var op = function(h, c){ for (var j = 0; j < 6; j++){ var z = hoek(kaart.hex[h], j, 1); if (Math.abs(z.x - c.x) < 0.01 && Math.abs(z.y - c.y) < 0.01) return true; } return false; };
          if (op(a, p) && op(a, q) && op(b, p) && op(b, q)) randen.push({ sl:sl, a:a, b:b });
        });
      }
      var rijken = {};
      randen.forEach(function(rd){ [rijkVanHex(rd.a), rijkVanHex(rd.b)].forEach(function(r){ if (r >= 0) rijken[r] = true; }); });
      Object.keys(rijken).forEach(function(rs){
        var r = +rs, kas = kasteelVanRijk(r), best = null, bd = 1e9;
        randen.forEach(function(rd, n){
          if (rijkVanHex(rd.a) !== r && rijkVanHex(rd.b) !== r) return;
          if (kaart.dicht[rd.a] || kaart.dicht[rd.b]) return;
          /* zo dicht bij het kasteel als het kan, maar niet op het kasteel zelf: daar staat al van alles */
          var d = kas >= 0 ? Math.min(afstand(kaart.hex[rd.a], kaart.hex[kas]), afstand(kaart.hex[rd.b], kaart.hex[kas])) + (rd.a === kas || rd.b === kas ? 1.5 : 0) : 0;
          if (d * 100 + n < bd){ bd = d * 100 + n; best = rd; }
        });
        if (best && !gezien[best.sl + '|' + r]){ gezien[best.sl + '|' + r] = true; uit.push({ sl:best.sl, a:best.a, b:best.b, r:r }); }
      });
    });
    return uit;
  }
  function maat(r){ return { b:W3 * r * (KOL + 0.5) + 8, h:r * (1.5 * (RIJ - 1) + 2) + 8 }; }
  /* in stappen: omrekenen naar kubuscoordinaten */
  function kubus(h){ var x = h.kol - (h.rij - (h.rij & 1)) / 2, z = h.rij; return { x:x, y:-x - z, z:z }; }
  function afstand(a, b){ var p = kubus(a), q = kubus(b); return Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y), Math.abs(p.z - q.z)); }
  /* kleine tekeningetjes per soort, om het midden van een gebied */
  function teken(soort, x, y, s){
    s = s || 1;
    function n(v){ return (v * s).toFixed(1); }
    var k = SOORTEN[soort].donker, o = 'stroke="' + k + '" stroke-width="' + (1.4 * s).toFixed(2) + '" fill="none" stroke-linecap="round" opacity=".55"';
    if (soort === 'akker') return '<path ' + o + ' d="M' + (x - 9 * s) + ' ' + (y + 4 * s) + 'h' + n(18) + 'M' + (x - 7 * s) + ' ' + (y - 1 * s) + 'h' + n(14) + 'M' + (x - 5 * s) + ' ' + (y - 6 * s) + 'h' + n(10) + '"/>';
    if (soort === 'weide') return '<path ' + o + ' d="M' + (x - 8 * s) + ' ' + (y + 3 * s) + 'q' + n(2) + ' ' + n(-7) + ' ' + n(4) + ' 0q' + n(2) + ' ' + n(-7) + ' ' + n(4) + ' 0M' + (x + 1 * s) + ' ' + (y + 3 * s) + 'q' + n(2) + ' ' + n(-6) + ' ' + n(4) + ' 0"/>';
    if (soort === 'bos') return '<path fill="' + k + '" opacity=".45" d="M' + (x - 5 * s) + ' ' + (y + 6 * s) + 'l' + n(5) + ' ' + n(-13) + ' ' + n(5) + ' ' + n(13) + 'zM' + (x + 2 * s) + ' ' + (y + 7 * s) + 'l' + n(4) + ' ' + n(-10) + ' ' + n(4) + ' ' + n(10) + 'z"/>';
    if (soort === 'berg') return '<path fill="#8f877c" d="M' + (x - 16 * s) + ' ' + (y + 9 * s) + 'l' + n(9) + ' ' + n(-17) + ' ' + n(9) + ' ' + n(17) + 'zM' + (x - 4 * s) + ' ' + (y + 9 * s) + 'l' + n(11) + ' ' + n(-23) + ' ' + n(11) + ' ' + n(23) + 'z"/>' +
      '<path fill="#fff" d="M' + (x + 7 * s) + ' ' + (y - 14 * s) + 'l' + n(-3.6) + ' ' + n(7.5) + 'l' + n(1.8) + ' ' + n(-1.2) + 'l' + n(1.8) + ' ' + n(1.6) + 'l' + n(1.8) + ' ' + n(-1.6) + 'l' + n(1.8) + ' ' + n(1.2) + 'z' +
      'M' + (x - 7 * s) + ' ' + (y - 8 * s) + 'l' + n(-2.8) + ' ' + n(5.3) + 'l' + n(1.4) + ' ' + n(-1) + 'l' + n(1.4) + ' ' + n(1.2) + 'l' + n(1.4) + ' ' + n(-1.2) + 'l' + n(1.4) + ' ' + n(1) + 'z"/>';
    return '<path ' + o + ' d="M' + (x - 10 * s) + ' ' + (y + 5 * s) + 'q' + n(6) + ' ' + n(-12) + ' ' + n(11) + ' ' + n(-2) + 'q' + n(4) + ' ' + n(-6) + ' ' + n(9) + ' ' + n(2) + '"/>';
  }
  return { KOL:KOL, RIJ:RIJ, SOORTEN:SOORTEN, maak:maak, midden:midden, punten:punten, randen:randen, bruggen:bruggen, rivier:rivierPad, maat:maat, afstand:afstand, teken:teken, toeval:toeval };
})();
  wereld.FEOKAART = FEOKAART;
  if (typeof module !== 'undefined' && module.exports) module.exports = FEOKAART;
})(typeof window !== 'undefined' ? window : globalThis);
