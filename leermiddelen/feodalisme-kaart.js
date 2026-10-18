/* De kaart van Feodalisme: zeshoekige gebieden in rijen, met akkers, weiden,
   bossen en heuvels. Het bord en de telefoons maken hem uit hetzelfde zaadje,
   dus over de lijn gaat alleen wie wat heeft, nooit de kaart zelf.

     var k = FEOKAART.maak(zaad);
     k.hex[i] = { i, kol, rij, soort, naam, buren:[...] }
     FEOKAART.midden(h, r)   het midden van een gebied bij straal r
     FEOKAART.punten(h, r)   de zes hoeken, voor een svg-polygon
     FEOKAART.maat(r)        { b, h } van de hele kaart
     FEOKAART.afstand(a, b)  in stappen van gebied naar gebied
*/
(function(wereld){ var FEOKAART = (function(){
  'use strict';
  var KOL = 8, RIJ = 6;
  var SOORTEN = {
    akker:  { naam:'akker',  oogst:8, verdedig:1,   kleur:'#F3E2A6', donker:'#7a6a33' },
    weide:  { naam:'weide',  oogst:6, verdedig:1,   kleur:'#D3E6B5', donker:'#4d6b33' },
    bos:    { naam:'bos',    oogst:3, verdedig:1.5, kleur:'#A9CB98', donker:'#2f5a35' },
    heuvel: { naam:'heuvel', oogst:3, verdedig:1.8, kleur:'#DCCBA9', donker:'#6b5634' }
  };
  var VOOR = ['Eiken', 'Wolfs', 'Ooster', 'Wester', 'Linde', 'Kraaien', 'Beek', 'Heide', 'Molen', 'Hazel', 'Vossen', 'Zwanen',
              'Bever', 'Ganzen', 'Haver', 'Rogge', 'Wilgen', 'Elzen', 'Herten', 'Raven', 'Klaver', 'Schapen', 'Uilen', 'Steen',
              'Zand', 'Riet', 'Distel', 'Bramen', 'Vlas', 'Brem', 'Berken', 'Esdoorn', 'Mossel', 'Leeuwen', 'Valken', 'Reigers',
              'Duiven', 'Hoeven', 'Kloosters', 'Bronnen', 'Dassen', 'Egel', 'Hazen', 'Mieren', 'Paarden', 'Ossen', 'Zwijnen', 'Lammer'];
  var NA = { akker:['veld', 'akker', 'kamp', 'es'], weide:['weide', 'wei', 'hoeve', 'dal'], bos:['bos', 'woud', 'hout', 'loo'], heuvel:['berg', 'heuvel', 'rug', 'top'] };
  /* een eigen toeval met een zaadje, zodat bord en telefoon dezelfde kaart maken */
  function toeval(zaad){
    var z = (zaad >>> 0) || 1;
    return function(){ z = (z + 0x6D2B79F5) | 0; var t = Math.imul(z ^ (z >>> 15), z | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  /* rijen die om en om een halve stap opschuiven (oneven rijen naar rechts) */
  function burenVan(kol, rij){
    var oneven = rij & 1;
    var d = oneven ? [[1, 0], [-1, 0], [0, -1], [1, -1], [0, 1], [1, 1]] : [[1, 0], [-1, 0], [-1, -1], [0, -1], [-1, 1], [0, 1]];
    var uit = [];
    d.forEach(function(s){
      var k = kol + s[0], r = rij + s[1];
      if (k >= 0 && k < KOL && r >= 0 && r < RIJ) uit.push(r * KOL + k);
    });
    return uit;
  }
  function maak(zaad){
    var rnd = toeval(zaad), hex = [];
    for (var r = 0; r < RIJ; r++) for (var k = 0; k < KOL; k++) hex.push({ i:r * KOL + k, kol:k, rij:r, buren:burenVan(k, r) });
    /* het land: een paar kernen per soort, elk gebied neemt de soort van de dichtstbijzijnde kern */
    var kernen = [], verdeling = ['akker', 'akker', 'akker', 'akker', 'weide', 'weide', 'weide', 'bos', 'bos', 'bos', 'heuvel', 'heuvel'];
    verdeling.forEach(function(s){ kernen.push({ s:s, k:rnd() * KOL, r:rnd() * RIJ }); });
    hex.forEach(function(h){
      var best = null, bd = 1e9;
      kernen.forEach(function(c){ var dx = h.kol + (h.rij & 1) * 0.5 - c.k, dy = (h.rij - c.r) * 0.87, d = dx * dx + dy * dy + rnd() * 0.6; if (d < bd){ bd = d; best = c; } });
      h.soort = best.s;
    });
    /* namen: geen twee hetzelfde */
    var voor = VOOR.slice();
    for (var i = voor.length - 1; i > 0; i--){ var j = Math.floor(rnd() * (i + 1)); var t = voor[i]; voor[i] = voor[j]; voor[j] = t; }
    hex.forEach(function(h, n){ var na = NA[h.soort]; h.naam = voor[n % voor.length] + na[Math.floor(rnd() * na.length)]; });
    return { zaad:zaad, kol:KOL, rij:RIJ, hex:hex };
  }
  var W3 = Math.sqrt(3);
  function midden(h, r){ return { x:W3 * r * (h.kol + 0.5 + (h.rij & 1) * 0.5) + 4, y:r * (1 + 1.5 * h.rij) + 4 }; }
  function punten(h, r, krimp){
    var m = midden(h, r), rr = r - (krimp || 0), p = [];
    for (var i = 0; i < 6; i++){ var a = Math.PI / 180 * (60 * i - 30); p.push((m.x + rr * Math.cos(a)).toFixed(1) + ',' + (m.y + rr * Math.sin(a)).toFixed(1)); }
    return p.join(' ');
  }
  function maat(r){ return { b:W3 * r * (KOL + 0.5) + 8, h:r * (1.5 * (RIJ - 1) + 2) + 8 }; }
  /* in stappen: omrekenen naar kubuscoordinaten */
  function kubus(h){ var x = h.kol - (h.rij - (h.rij & 1)) / 2, z = h.rij; return { x:x, y:-x - z, z:z }; }
  function afstand(a, b){ var p = kubus(a), q = kubus(b); return Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y), Math.abs(p.z - q.z)); }
  /* de rand tussen twee buren, voor het tekenen van grenzen: de twee hoeken die ze delen */
  function rand(a, b, r){
    var ma = midden(a, r), mb = midden(b, r), hoek = Math.atan2(mb.y - ma.y, mb.x - ma.x);
    var p1 = hoek - Math.PI / 6, p2 = hoek + Math.PI / 6;
    return [ma.x + r * Math.cos(p1), ma.y + r * Math.sin(p1), ma.x + r * Math.cos(p2), ma.y + r * Math.sin(p2)];
  }
  /* kleine tekeningetjes per soort, om het midden van een gebied */
  function teken(soort, x, y, s){
    s = s || 1;
    var k = SOORTEN[soort].donker, o = 'stroke="' + k + '" stroke-width="' + (1.4 * s).toFixed(2) + '" fill="none" stroke-linecap="round" opacity=".55"';
    if (soort === 'akker') return '<path ' + o + ' d="M' + (x - 9 * s) + ' ' + (y + 4 * s) + 'l18 0M' + (x - 7 * s) + ' ' + (y - 1 * s) + 'l14 0M' + (x - 5 * s) + ' ' + (y - 6 * s) + 'l10 0"/>';
    if (soort === 'weide') return '<path ' + o + ' d="M' + (x - 8 * s) + ' ' + (y + 3 * s) + 'q2 -7 4 0q2 -7 4 0M' + (x + 1 * s) + ' ' + (y + 3 * s) + 'q2 -6 4 0"/>';
    if (soort === 'bos') return '<path fill="' + k + '" opacity=".45" d="M' + (x - 5 * s) + ' ' + (y + 6 * s) + 'l5 -13 5 13zM' + (x + 2 * s) + ' ' + (y + 7 * s) + 'l4 -10 4 10z"/>';
    return '<path ' + o + ' d="M' + (x - 10 * s) + ' ' + (y + 5 * s) + 'q6 -12 11 -2q4 -6 9 2"/>';
  }
  return { KOL:KOL, RIJ:RIJ, SOORTEN:SOORTEN, maak:maak, midden:midden, punten:punten, maat:maat, afstand:afstand, rand:rand, teken:teken, toeval:toeval };
})();
  wereld.FEOKAART = FEOKAART;
  if (typeof module !== 'undefined' && module.exports) module.exports = FEOKAART;
})(typeof window !== 'undefined' ? window : globalThis);
