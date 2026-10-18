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
  /* ---------- de tekeningen, gedeeld door bord en telefoon ----------
     Alles is getekend op de maat van een gebied met straal 24 en wordt met s
     geschaald. v (het nummer van het gebied) geeft wat afwisseling. */
  function g(x, y, s, binnen){ return '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + (+s).toFixed(3) + ')" pointer-events="none">' + binnen + '</g>'; }
  /* licht in het midden van elk gebied, en water rondom */
  var LICHT = { akker:'#FAEFC8', weide:'#E6F1D2', bos:'#C3DDB4', heuvel:'#EADFC6', berg:'#DCD6CD' };
  function defs(pre){
    return Object.keys(SOORTEN).map(function(k){
      return '<radialGradient id="' + pre + '-' + k + '" cx="50%" cy="42%" r="62%"><stop offset="0" stop-color="' + LICHT[k] + '"/><stop offset="1" stop-color="' + SOORTEN[k].kleur + '"/></radialGradient>';
    }).join('') +
      '<pattern id="' + pre + '-water" width="28" height="14" patternUnits="userSpaceOnUse"><rect width="28" height="14" fill="#bcd6e3"/><path d="M0 7q7 -4 14 0t14 0" fill="none" stroke="#a9cadb" stroke-width="1.4"/></pattern>';
  }
  function boom(x, y, k, donker){
    return '<rect x="' + (x - 0.8 * k) + '" y="' + (y + 2.6 * k) + '" width="' + (1.6 * k) + '" height="' + (4.4 * k) + '" rx="' + (0.6 * k) + '" fill="#6b4a2b"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + (5 * k) + '" fill="' + (donker ? '#356b3c' : '#3f7d45') + '"/>' +
      '<circle cx="' + (x - 1.5 * k) + '" cy="' + (y - 1.6 * k) + '" r="' + (2.5 * k) + '" fill="#5f9b57"/>';
  }
  function teken(soort, x, y, s, v){
    s = s || 1; v = v || 0;
    if (soort === 'akker'){
      var kl = v % 2 ? ['#EFD486', '#E2BA55', '#EAC86C'] : ['#E8C565', '#EFD486', '#DDB04A'];
      return g(x, y, s, '<g transform="rotate(' + (v % 3 - 1) * 7 + ')">' +
        '<rect x="-12" y="-10" width="24" height="5" rx="2" fill="' + kl[0] + '"/><rect x="-14" y="-4" width="28" height="5" rx="2" fill="' + kl[1] + '"/><rect x="-11" y="2" width="22" height="5" rx="2" fill="' + kl[2] + '"/>' +
        '<path d="M-10 -7.5h20M-12 -1.5h24M-9 4.5h18" stroke="#b98d2e" stroke-width=".7" stroke-dasharray="1.6 1.8" opacity=".7"/></g>');
    }
    if (soort === 'weide'){
      var gras = '<path d="M-11 6q1 -4 2 0q1 -4 2 0M6 7q1 -3.4 2 0q1 -3.4 2 0M-2 -8q1 -3.4 2 0q1 -3.4 2 0" stroke="#5f8a42" stroke-width="1" fill="none" stroke-linecap="round"/>' +
        '<circle cx="8" cy="-4" r="1.1" fill="#fff"/><circle cx="-9" cy="-2" r="1.1" fill="#F2C94C"/>';
      var schaap = v % 3 === 1 ? '' : '<g transform="translate(' + (v % 2 ? -1 : 2) + ' 0)"><ellipse rx="4.8" ry="3.3" fill="#fff" stroke="#14224C" stroke-width=".7"/><circle cx="-4.4" cy="-.9" r="1.8" fill="#14224C"/><path d="M-2 2.8v2.2M2 2.8v2.2" stroke="#14224C" stroke-width=".9" stroke-linecap="round"/></g>';
      return g(x, y, s, gras + schaap);
    }
    if (soort === 'bos') return g(x, y, s, boom(-7, 0, 1, v % 2) + boom(6, -2, 1.15, !(v % 2)) + boom(-1, 5, 0.95, false));
    if (soort === 'heuvel') return g(x, y, s,
      '<path d="M-15 7c3 -11 11 -13 16 -3c3 -7 10 -7 14 3z" fill="#C9B184"/><path d="M-15 7c3 -11 11 -13 16 -3l-3 3z" fill="#DCC9A0"/><path d="M1 4c3 -7 10 -7 14 3h-6z" fill="#D5C095"/>' +
      '<path d="M-9 -1l1.6 -1.6M-5 -3l1.6 -1.6M6 0l1.4 -1.4" stroke="#8a7347" stroke-width=".8" stroke-linecap="round"/>');
    if (soort === 'berg') return g(x, y, s,
      '<path d="M-17 9l8 -16 8 16z" fill="#7d756a"/><path d="M-17 9l8 -16 0 16z" fill="#988f83"/><path d="M-9 -7l-2.6 5.3 1.3 -.8 1.3 1 1.3 -1 1.3 .8z" fill="#fff"/>' +
      '<path d="M-4 9l11 -23 11 23z" fill="#857d71"/><path d="M-4 9l11 -23 0 23z" fill="#a39b8f"/><path d="M7 -14l-3.6 7.5 1.8 -1.2 1.8 1.5 1.8 -1.5 1.8 1.2z" fill="#fff"/>');
    return '';
  }
  /* een kasteel met twee torens en een donjon; daken en vaandel in de kleur van het rijk */
  function kasteel(x, y, s, kleur){
    var lijn = 'stroke="#14224C" stroke-width="1" stroke-linejoin="round"', kant = '';
    for (var i = 0; i < 4; i++) kant += '<rect x="' + (-8.6 + i * 5) + '" y="-2.6" width="2.6" height="2.8" fill="#F3ECDF" ' + lijn + '/>';
    return g(x, y, s,
      '<ellipse cx="0" cy="10.4" rx="17" ry="3.4" fill="#14224C" opacity=".2"/>' +
      /* de donjon achteraan, met het vaandel */
      '<path d="M0 -15v-10" stroke="#14224C" stroke-width="1.1"/><path d="M0 -25h8.5l-2.2 2.4 2.2 2.4h-8.5z" fill="' + kleur + '" ' + lijn + '/>' +
      '<path d="M-5.5 0v-12.6h1.6v-2.4h2.2v2.4h3.4v-2.4h2.2v2.4h1.6v12.6z" fill="#E6DCCB" ' + lijn + '/>' +
      '<rect x="-1.1" y="-10" width="2.2" height="3.4" rx="1.1" fill="#14224C"/>' +
      /* de muur met kantelen en de poort */
      kant + '<rect x="-11" y="0" width="22" height="10" fill="#F3ECDF" ' + lijn + '/>' +
      '<path d="M-7.5 4h3M4 7h3.4M-8 7.6h2" stroke="#d3c5ae" stroke-width=".8" stroke-linecap="round"/>' +
      '<path d="M-3.4 10v-5.2a3.4 3.4 0 0 1 6.8 0v5.2z" fill="#6b4a2b" ' + lijn + '/><path d="M0 1.4v8.6" stroke="#14224C" stroke-width=".6" opacity=".5"/>' +
      /* twee torens met spitse daken */
      '<rect x="-16.5" y="-5" width="7" height="15" fill="#F8F2E8" ' + lijn + '/><rect x="9.5" y="-5" width="7" height="15" fill="#F8F2E8" ' + lijn + '/>' +
      '<path d="M-17.8 -5l4.8 -10 4.8 10z" fill="' + kleur + '" ' + lijn + '/><path d="M8.2 -5l4.8 -10 4.8 10z" fill="' + kleur + '" ' + lijn + '/>' +
      '<rect x="-14.1" y="-1.2" width="2.2" height="3.4" rx="1.1" fill="#14224C"/><rect x="11.9" y="-1.2" width="2.2" height="3.4" rx="1.1" fill="#14224C"/>');
  }
  /* een boerderij met een rood dak */
  function huis(x, y, s){
    return g(x, y, s,
      '<path d="M-4.2 3.4v-4.8h8.4v4.8z" fill="#FBF6F1" stroke="#14224C" stroke-width=".8" stroke-linejoin="round"/>' +
      '<path d="M-5.6 -1.2l5.6 -4.6 5.6 4.6z" fill="#c0442c" stroke="#14224C" stroke-width=".8" stroke-linejoin="round"/>' +
      '<rect x="-1" y=".4" width="2" height="3" fill="#14224C"/>');
  }
  /* soldaten: een schild in de kleur van het rijk, met het aantal */
  function schild(x, y, s, kleur, n, inkt){
    return g(x, y, s,
      '<path d="M0 -10.5l8.6 3.1v5.4c0 6 -3.9 9.4 -8.6 11.2c-4.7 -1.8 -8.6 -5.2 -8.6 -11.2v-5.4z" fill="' + kleur + '" stroke="#14224C" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<path d="M0 -8.4l6.6 2.4v4c0 4.6 -2.9 7.2 -6.6 8.7" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.1"/>' +
      '<text y="2.9" text-anchor="middle" font-size="' + (String(n).length > 1 ? 8.6 : 9.8) + '" font-weight="700" fill="' + (inkt || '#fff') + '" font-family="Poppins,Arial,sans-serif">' + n + '</text>');
  }
  /* een leger onderweg: een vaandel boven het schild */
  function vaandel(x, y, s, kleur, n, inkt){
    return g(x, y, s, '<path d="M0 -10v-9" stroke="#14224C" stroke-width="1.2"/><path d="M0 -19h9l-2.4 2.6 2.4 2.6h-9z" fill="' + kleur + '" stroke="#14224C" stroke-width=".9" stroke-linejoin="round"/>') + schild(x, y, s, kleur, n, inkt);
  }
  return { KOL:KOL, RIJ:RIJ, SOORTEN:SOORTEN, maak:maak, midden:midden, punten:punten, randen:randen, bruggen:bruggen, rivier:rivierPad, maat:maat, afstand:afstand,
           teken:teken, defs:defs, kasteel:kasteel, huis:huis, schild:schild, vaandel:vaandel, toeval:toeval };
})();
  wereld.FEOKAART = FEOKAART;
  if (typeof module !== 'undefined' && module.exports) module.exports = FEOKAART;
})(typeof window !== 'undefined' ? window : globalThis);
