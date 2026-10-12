/* Kaarttoren: de getekende plekken. Elk deel van de toren speelt zich ergens
   anders in school af: de gang (verdieping 1 tot 4), een lokaal (6 tot 8), de
   bibliotheek (9 tot 11) en de aula voor de bazen (5 en 12). Ook de toren op
   het startscherm staat hier.

     KT_DECOR.deel(verdieping)   'gang', 'lokaal', 'bieb' of 'aula'
     KT_DECOR.plek(deel)         een <svg> als tekst, viewBox 0 0 800 320, valt van onderen af
     KT_DECOR.toren()            de toren voor het startscherm
     KT_DECOR.NAAM[deel]         hoe het deel heet

   De kleuren zijn vaste merkkleuren (de tekening kantelt niet mee in het
   donker; de css legt er dan een donkere waas overheen). */
window.KT_DECOR = (function(){
  'use strict';
  var NAAM = { gang:'de gang', lokaal:'het lokaal', bieb:'de bibliotheek', aula:'de aula' };
  function deel(f){ return f === 5 || f === 12 ? 'aula' : f <= 4 ? 'gang' : f <= 8 ? 'lokaal' : 'bieb'; }
  function svg(binnen, label){
    return '<svg class="plek" viewBox="0 0 800 320" preserveAspectRatio="xMidYMax slice" role="img" aria-label="' + label + '" focusable="false">' + binnen + '</svg>';
  }
  /* een vloer met tegels in perspectief, vanaf hoogte y */
  function vloer(y){
    var lijn = 'style="stroke:var(--sc-vloerlijn,#d8c6b4)"';
    var h = '<rect x="0" y="' + y + '" width="800" height="' + (320 - y) + '" style="fill:var(--sc-vloer,#e7d8c9)"/>';
    for (var i = -8; i <= 16; i++){ h += '<path d="M' + (400 + i * 60) + ' ' + y + ' L' + (400 + i * 140) + ' 320" ' + lijn + ' stroke-width="2"/>'; }
    [y + 18, y + 44, y + 80].forEach(function(yy){ h += '<path d="M0 ' + yy + ' H800" ' + lijn + ' stroke-width="2"/>'; });
    return h;
  }
  function klok(x, y){
    return '<g transform="translate(' + x + ' ' + y + ')"><circle r="22" fill="#fff" stroke="#204ECF" stroke-width="5"/><path d="M0 0V-13M0 0l9 5" stroke="#14224C" stroke-width="3" stroke-linecap="round"/></g>';
  }
  function gang(){
    var h = '<rect width="800" height="320" style="fill:var(--sc-muur,#FCDED6)"/>' +
      '<rect y="0" width="800" height="26" style="fill:var(--sc-plint,#f4cfc4)"/>' +
      '<g fill="#FBF6F1" opacity=".9"><rect x="110" y="8" width="120" height="10" rx="5"/><rect x="560" y="8" width="120" height="10" rx="5"/></g>' +
      '<rect y="168" width="800" height="12" fill="#F6B65A"/>';
    /* de kluisjes */
    for (var i = 0; i < 14; i++){
      var x = 4 + i * 57, k = i % 3 === 2 ? '#204ECF' : '#83A5F2';
      h += '<rect x="' + x + '" y="62" width="53" height="164" rx="3" fill="' + k + '" stroke="#14224C" stroke-width="2"/>' +
        '<path d="M' + (x + 12) + ' 78h28M' + (x + 12) + ' 86h28M' + (x + 12) + ' 94h28" stroke="#14224C" stroke-width="2" opacity=".35"/>' +
        '<rect x="' + (x + 40) + '" y="138" width="5" height="16" rx="2" fill="#FBF6F1"/>';
    }
    h += '<rect x="300" y="40" width="200" height="14" rx="3" fill="#F26749"/>' + klok(400, 34);
    h += vloer(226);
    return svg(h, 'De gang met kluisjes');
  }
  function lokaal(){
    var h = '<rect width="800" height="320" style="fill:var(--sc-muur2,#FBF6F1)"/>' +
      '<rect y="196" width="800" height="10" fill="#EA9836"/>';
    /* ramen met lucht */
    [30, 590].forEach(function(x){
      h += '<rect x="' + x + '" y="34" width="180" height="140" rx="6" fill="#83A5F2" stroke="#14224C" stroke-width="3"/>' +
        '<ellipse cx="' + (x + 60) + '" cy="80" rx="34" ry="12" fill="#fff" opacity=".85"/><ellipse cx="' + (x + 120) + '" cy="120" rx="26" ry="9" fill="#fff" opacity=".7"/>' +
        '<path d="M' + (x + 90) + ' 34v140M' + x + ' 104h180" stroke="#14224C" stroke-width="3"/>';
    });
    /* een wereldkaart en een prikbord */
    h += '<rect x="250" y="40" width="160" height="110" rx="4" fill="#204ECF" stroke="#14224C" stroke-width="3"/>' +
      '<path d="M270 70q20-14 40 0t30 6q14 18-6 30t-34 6q-24-10-30-42z M350 64q16-8 34 2t6 26q-12 12-24-4t-16-24z" fill="#83A5F2"/>' +
      '<rect x="430" y="48" width="130" height="96" rx="4" fill="#EA9836" stroke="#b56d1c" stroke-width="3"/>' +
      '<rect x="444" y="60" width="38" height="30" fill="#fff" transform="rotate(-4 463 75)"/><rect x="498" y="64" width="44" height="34" fill="#FCDED6" transform="rotate(5 520 81)"/>' +
      '<rect x="452" y="102" width="40" height="28" fill="#83A5F2" transform="rotate(3 472 116)"/>' + klok(400, 176);
    h += vloer(232);
    /* tafels vooraan */
    h += '<rect x="-20" y="270" width="230" height="16" rx="4" fill="#EA9836" stroke="#b56d1c" stroke-width="2"/><rect x="590" y="270" width="240" height="16" rx="4" fill="#EA9836" stroke="#b56d1c" stroke-width="2"/>';
    return svg(h, 'Een lokaal met ramen');
  }
  function bieb(){
    var h = '<rect width="800" height="320" style="fill:var(--sc-muur,#FCDED6)"/>';
    var kl = ['#F26749', '#204ECF', '#EA9836', '#83A5F2', '#14224C', '#FBF6F1'];
    [[10, 250], [540, 250]].forEach(function(k, n){
      var x0 = k[0], w = k[1];
      h += '<rect x="' + x0 + '" y="24" width="' + w + '" height="214" fill="#b56d1c" stroke="#7a4710" stroke-width="3"/>';
      for (var r = 0; r < 4; r++){
        var y = 36 + r * 50, x = x0 + 10, i = 0;
        h += '<rect x="' + (x0 + 6) + '" y="' + (y + 40) + '" width="' + (w - 12) + '" height="6" fill="#7a4710"/>';
        while (x < x0 + w - 22){
          var bw = 10 + ((i * 7 + r * 3 + n * 5) % 4) * 4, bh = 30 + ((i * 5 + r) % 3) * 4;
          h += '<rect x="' + x + '" y="' + (y + 40 - bh) + '" width="' + bw + '" height="' + bh + '" rx="1.5" fill="' + kl[(i + r + n) % kl.length] + '" stroke="#14224C" stroke-width="1"/>';
          x += bw + 2; i++;
        }
      }
    });
    h += '<rect x="300" y="60" width="200" height="90" rx="8" fill="#204ECF" stroke="#14224C" stroke-width="3"/>' +
      '<path d="M330 90h140M330 108h110M330 126h125" stroke="#FBF6F1" stroke-width="5" stroke-linecap="round" opacity=".75"/>';
    h += vloer(238);
    h += '<ellipse cx="400" cy="296" rx="300" ry="26" fill="#F26749" opacity=".55"/>';
    return svg(h, 'De bibliotheek met boekenkasten');
  }
  function aula(){
    var h = '<rect width="800" height="320" fill="#14224C"/>' +
      '<path d="M250 0 L150 250 H650 L550 0 Z" fill="#FCDED6" opacity=".14"/>';
    /* gordijnen met plooien */
    [[0, 1], [800, -1]].forEach(function(g){
      var x = g[0], r = g[1], p = '';
      for (var i = 0; i < 5; i++){ p += '<path d="M' + (x + r * i * 30) + ' 0 v262" stroke="#c0442c" stroke-width="4"/>'; }
      h += '<path d="M' + x + ' 0 H' + (x + r * 160) + ' C' + (x + r * 130) + ' 90 ' + (x + r * 120) + ' 180 ' + (x + r * 150) + ' 262 H' + x + ' Z" fill="#F26749"/>' + p;
    });
    h += '<path d="M0 0 H800 V34 Q600 54 400 34 Q200 54 0 34 Z" fill="#c0442c"/>';
    /* vlaggetjes */
    var v = '';
    for (var i = 0; i < 13; i++){ var x = 170 + i * 36; v += '<path d="M' + x + ' 50 l16 0 l-8 18 z" fill="' + ['#EA9836', '#83A5F2', '#FBF6F1'][i % 3] + '"/>'; }
    h += '<path d="M160 48 Q400 70 640 48" fill="none" stroke="#FBF6F1" stroke-width="2" opacity=".6"/>' + v;
    /* het podium */
    h += '<rect x="0" y="244" width="800" height="76" fill="#b56d1c"/><rect x="0" y="244" width="800" height="10" fill="#EA9836"/>';
    for (var j = 0; j < 9; j++) h += '<path d="M' + (j * 100) + ' 254 V320" stroke="#7a4710" stroke-width="2"/>';
    return svg(h, 'De aula met een podium');
  }
  var PLEK = { gang:gang, lokaal:lokaal, bieb:bieb, aula:aula }, cache = {};
  function plek(d){ return cache[d] || (cache[d] = (PLEK[d] || gang)()); }

  /* de toren op het startscherm: twaalf verdiepingen, een vlag bovenop, en
     uit een paar ramen kijkt een tegenstander */
  function toren(){
    var F = window.KT_FIGUUR, h = '', W = 220, x0 = 90, top = 64, dy = 22;
    h += '<ellipse cx="200" cy="352" rx="170" ry="16" fill="#14224C" opacity=".12"/>';
    h += '<path d="M200 6 V40" stroke="#14224C" stroke-width="3"/><path d="M200 8 h36 l-8 9 l8 9 h-36 z" fill="#F26749" stroke="#14224C" stroke-width="2" stroke-linejoin="round"/>';
    h += '<path d="M80 64 L200 30 L320 64 Z" fill="#F26749" stroke="#14224C" stroke-width="3" stroke-linejoin="round"/>';
    h += '<rect x="' + x0 + '" y="' + top + '" width="' + W + '" height="' + (dy * 12 + 20) + '" fill="#FCDED6" stroke="#14224C" stroke-width="3"/>';
    for (var r = 0; r < 12; r++){
      var y = top + 10 + r * dy, f = 12 - r, baas = f === 5 || f === 12;
      h += '<path d="M' + x0 + ' ' + (y + dy - 1) + ' h' + W + '" stroke="#e7c6bb" stroke-width="2"/>';
      if (baas) h += '<rect x="' + (x0 + 3) + '" y="' + y + '" width="' + (W - 6) + '" height="' + (dy - 3) + '" fill="#F6B65A" opacity=".55"/>';
      for (var c = 0; c < 4; c++){
        if (r === 11 && (c === 1 || c === 2)) continue;
        h +='<rect x="' + (x0 + 18 + c * 50) + '" y="' + (y + 3) + '" width="34" height="' + (dy - 9) + '" rx="3" fill="' + (baas ? '#F26749' : (r + c) % 3 ? '#83A5F2' : '#204ECF') + '" stroke="#14224C" stroke-width="1.5"/>';
      }
    }
    h += '<path d="M180 ' + (top + dy * 12 + 20) + ' v-26 a20 20 0 0 1 40 0 v26" fill="#204ECF" stroke="#14224C" stroke-width="3"/>';
    if (F){
      [['prop', 46, 300, 0.42], ['inktvlek', 350, 210, 0.5], ['rodepen', 352, 70, 0.5], ['gum', 44, 168, 0.4]].forEach(function(t){
        h += '<g transform="translate(' + t[1] + ' ' + t[2] + ') scale(' + t[3] + ')">' + F.teken(t[0], '') + '</g>';
      });
    }
    return '<svg class="toren-tekening" viewBox="0 0 400 370" role="img" aria-label="Een toren van twaalf verdiepingen met tegenstanders eromheen" focusable="false">' + h + '</svg>';
  }
  return { deel:deel, plek:plek, toren:toren, NAAM:NAAM };
})();
