/* Kaarttoren: de tegenstanders als tekening. Vriendelijke schoolspullen met
   een gezichtje; geen bloed, geen wapens. Elke figuur is de binnenkant van een
   svg met viewBox -60 -60 120 120.

     KT_FIGUUR.teken(id, stemming)   stemming: '' (gewoon), 'au' (net geraakt), 'op' (geeft op)
     KT_FIGUUR.mini(id)              een kleine versie voor op de kaart van de toren
     KT_FIGUUR.kaartIcoon(soort, fig) het plaatje linksboven op een kaart
   De kleuren zijn vaste merkkleuren: ze kantelen niet mee in het donker, net
   als de tekeningen in de andere spellen. */
window.KT_FIGUUR = (function(){
  'use strict';
  var INKT = '#14224C';
  /* ogen en mond, dezelfde voor iedereen: dat maakt ze familie */
  function gezicht(x, y, s, stemming, kleur){
    s = s || 1; kleur = kleur || INKT;
    var ox = 11 * s, r = 7 * s, p = 3.4 * s, h = '';
    if (stemming === 'op'){
      /* duizelig: kruisjes als ogen, een golvend mondje */
      [-ox, ox].forEach(function(dx){
        h += '<path d="M' + (x + dx - 4 * s) + ' ' + (y - 4 * s) + 'l' + 8 * s + ' ' + 8 * s + 'M' + (x + dx + 4 * s) + ' ' + (y - 4 * s) + 'l' + (-8 * s) + ' ' + 8 * s + '" stroke="' + kleur + '" stroke-width="' + 2.6 * s + '" stroke-linecap="round"/>';
      });
      h += '<path d="M' + (x - 9 * s) + ' ' + (y + 14 * s) + 'q' + 4.5 * s + ' ' + (-5 * s) + ' ' + 9 * s + ' 0t' + 9 * s + ' 0" fill="none" stroke="' + kleur + '" stroke-width="' + 2.6 * s + '" stroke-linecap="round"/>';
      return h;
    }
    [-ox, ox].forEach(function(dx){
      h += '<circle cx="' + (x + dx) + '" cy="' + y + '" r="' + r + '" fill="#fff" stroke="' + kleur + '" stroke-width="' + 1.6 * s + '"/>';
      h += stemming === 'au'
        ? '<path d="M' + (x + dx - 4 * s) + ' ' + y + 'h' + 8 * s + '" stroke="' + kleur + '" stroke-width="' + 2.6 * s + '" stroke-linecap="round"/>'
        : '<circle class="pupil" cx="' + (x + dx + 1.2 * s) + '" cy="' + (y + 1 * s) + '" r="' + p + '" fill="' + kleur + '"/>';
    });
    /* wenkbrauwen: een beetje ondeugend */
    h += '<path d="M' + (x - ox - 6 * s) + ' ' + (y - 11 * s) + 'l' + 10 * s + ' ' + 3 * s + 'M' + (x + ox + 6 * s) + ' ' + (y - 11 * s) + 'l' + (-10 * s) + ' ' + 3 * s + '" stroke="' + kleur + '" stroke-width="' + 2.4 * s + '" stroke-linecap="round"/>';
    h += stemming === 'au'
      ? '<ellipse cx="' + x + '" cy="' + (y + 15 * s) + '" rx="' + 5 * s + '" ry="' + 4 * s + '" fill="' + kleur + '"/>'
      : '<path d="M' + (x - 8 * s) + ' ' + (y + 13 * s) + 'q' + 8 * s + ' ' + 6 * s + ' ' + 16 * s + ' 0" fill="none" stroke="' + kleur + '" stroke-width="' + 2.6 * s + '" stroke-linecap="round"/>';
    return h;
  }
  var VORM = {
    prop: function(st){
      return '<path d="M-38 -8 L-30 -32 L-8 -40 L14 -36 L34 -22 L40 2 L32 28 L10 40 L-16 38 L-36 22 Z" fill="#F4F1EA" stroke="#9aa3b8" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M-30 -32 L-12 -10 L14 -36 M-12 -10 L-36 22 M-12 -10 L10 40 M40 2 L16 4 L34 -22" fill="none" stroke="#c9ceda" stroke-width="2"/>' +
        gezicht(0, 0, 1, st);
    },
    reuzenprop: function(st){
      return '<path d="M-50 -10 L-40 -42 L-10 -52 L20 -48 L46 -30 L52 4 L42 36 L12 52 L-22 50 L-48 28 Z" fill="#F4F1EA" stroke="#9aa3b8" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M-40 -42 L-16 -14 L20 -48 M-16 -14 L-48 28 M-16 -14 L12 52 M52 4 L20 6 L46 -30" fill="none" stroke="#c9ceda" stroke-width="2.5"/>' +
        gezicht(0, 0, 1.35, st);
    },
    kauwgom: function(st){
      return '<path d="M-36 20 C-50 -6 -34 -40 -2 -40 C30 -42 48 -14 38 14 C32 34 12 40 -6 38 C-22 38 -30 32 -36 20 Z" fill="#F49AC1" stroke="#c8588b" stroke-width="2.5"/>' +
        '<ellipse cx="-14" cy="-24" rx="8" ry="5" fill="#fff" opacity=".6"/>' + gezicht(0, 0, 1, st);
    },
    gum: function(st){
      return '<rect x="-40" y="-26" width="80" height="52" rx="10" fill="#F7C6CF" stroke="#c78592" stroke-width="2.5"/>' +
        '<path d="M-40 -2 H40 V16 a10 10 0 0 1 -10 10 H-30 a10 10 0 0 1 -10 -10 Z" fill="#83A5F2"/>' + gezicht(0, -8, 0.9, st);
    },
    slijper: function(st){
      return '<rect x="-34" y="-30" width="68" height="58" rx="8" fill="#EA9836" stroke="#b56d1c" stroke-width="2.5"/>' +
        '<circle cx="26" cy="-14" r="7" fill="#14224C" opacity=".8"/><path d="M-34 16 H34" stroke="#b56d1c" stroke-width="2"/>' + gezicht(-6, -4, 0.9, st);
    },
    paperclip: function(st){
      return '<path d="M-10 36 V-26 a12 12 0 0 1 24 0 V26 a8 8 0 0 1 -16 0 V-18" fill="none" stroke="#8b95ad" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M-10 36 V-26 a12 12 0 0 1 24 0 V26 a8 8 0 0 1 -16 0 V-18" fill="none" stroke="#d6dbe6" stroke-width="3" stroke-linecap="round"/>' + gezicht(2, -6, 0.8, st);
    },
    spiek: function(st){
      return '<path d="M-32 -38 H24 L34 -28 V38 H-32 Z" fill="#FFF7D6" stroke="#c7b36a" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M-22 -24 h40 M-22 22 h36 M-22 30 h24" stroke="#83A5F2" stroke-width="2.5" stroke-linecap="round"/>' + gezicht(0, 0, 0.9, st);
    },
    bel: function(st){
      return '<path d="M-34 26 C-32 -4 -30 -34 0 -36 C30 -34 32 -4 34 26 Z" fill="#F2C94C" stroke="#b8901d" stroke-width="2.5"/>' +
        '<rect x="-40" y="24" width="80" height="8" rx="4" fill="#b8901d"/><circle cx="0" cy="38" r="6" fill="#b8901d"/><circle cx="0" cy="-40" r="5" fill="#b8901d"/>' + gezicht(0, -4, 0.95, st);
    },
    klodder: function(st){
      return '<path d="M-30 -10 C-40 -34 -6 -44 6 -30 C18 -46 44 -30 34 -8 C50 6 36 34 14 30 C6 44 -22 42 -24 26 C-44 26 -46 0 -30 -10 Z" fill="#3a5bd9" stroke="#1c3fb0" stroke-width="2.5"/>' +
        '<circle cx="44" cy="-30" r="5" fill="#3a5bd9"/><circle cx="-44" cy="30" r="4" fill="#3a5bd9"/>' + gezicht(2, -2, 0.95, st, '#0b1638');
    },
    inktvlek: function(st){
      return '<path d="M-42 -14 C-54 -44 -12 -58 4 -40 C20 -60 56 -42 46 -12 C62 6 50 44 20 40 C8 58 -30 54 -32 34 C-58 34 -60 2 -42 -14 Z" fill="#23357a" stroke="#0f1a3d" stroke-width="3"/>' +
        '<circle cx="54" cy="-40" r="6" fill="#23357a"/><circle cx="-52" cy="44" r="5" fill="#23357a"/><ellipse cx="-18" cy="-30" rx="10" ry="5" fill="#fff" opacity=".18"/>' +
        gezicht(0, 0, 1.3, st, '#0b1638');
    },
    klok: function(st){
      var t = ''; for (var i = 0; i < 12; i++){ var a = i * Math.PI / 6; t += '<circle cx="' + (Math.sin(a) * 33).toFixed(1) + '" cy="' + (-Math.cos(a) * 33).toFixed(1) + '" r="2" fill="#14224C"/>'; }
      return '<circle r="42" fill="#fff" stroke="#204ECF" stroke-width="6"/>' + t +
        '<path d="M0 0 L0 -24 M0 0 L16 8" stroke="#F26749" stroke-width="3" stroke-linecap="round" opacity=".55"/>' + gezicht(0, -2, 0.85, st);
    },
    zwerm: function(st){
      var h = '', plek = [[-30, -26], [26, -30], [-36, 16], [30, 18], [0, -2]];
      plek.forEach(function(p, i){
        var s = i === 4 ? 0.9 : 0.62;
        h += '<g transform="translate(' + p[0] + ' ' + p[1] + ')"><path d="M-14 -14 L14 14 M14 -14 L-14 14" stroke="#F26749" stroke-width="' + (i === 4 ? 12 : 9) + '" stroke-linecap="round" transform="scale(' + s + ')"/>' +
          gezicht(0, 0, s * 0.6, st) + '</g>';
      });
      return h;
    },
    huiswerk: function(st){
      return '<rect x="-36" y="-22" width="70" height="56" rx="4" fill="#e6e9f2" stroke="#9aa3b8" stroke-width="2" transform="rotate(-6)"/>' +
        '<rect x="-34" y="-30" width="70" height="58" rx="4" fill="#fff" stroke="#9aa3b8" stroke-width="2.5" transform="rotate(4)"/>' +
        '<path d="M-24 -18 h40 M-24 20 h30" stroke="#83A5F2" stroke-width="2.5" stroke-linecap="round" transform="rotate(4)"/>' + gezicht(0, 0, 0.95, st);
    },
    rodepen: function(st){
      return '<g transform="rotate(-35)"><rect x="-14" y="-52" width="28" height="84" rx="8" fill="#d8392b" stroke="#96231a" stroke-width="2.5"/>' +
        '<rect x="-14" y="-52" width="28" height="18" rx="6" fill="#96231a"/><path d="M-14 32 L0 54 L14 32 Z" fill="#f4d9c6" stroke="#96231a" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M-3 48 L0 54 L3 48 Z" fill="#d8392b"/><path d="M14 -40 v44" stroke="#f0c0b6" stroke-width="3" stroke-linecap="round"/></g>' + gezicht(-2, -6, 1.05, st);
    },
    grotefout: function(st){
      return '<path d="M-38 -38 L38 38 M38 -38 L-38 38" stroke="#F26749" stroke-width="26" stroke-linecap="round"/>' +
        '<path d="M-38 -38 L38 38 M38 -38 L-38 38" stroke="#d8392b" stroke-width="26" stroke-linecap="round" opacity=".25" transform="translate(3 3)"/>' +
        '<circle r="24" fill="#F26749"/>' + gezicht(0, -2, 1.1, st);
    }
  };
  function teken(id, stemming){ return (VORM[id] || VORM.prop)(stemming || ''); }
  function mini(id){ return '<svg viewBox="-60 -60 120 120" aria-hidden="true" focusable="false">' + teken(id, '') + '</svg>'; }
  /* het plaatje op een kaart: voor een vakkaart een persoon, plek of ding, anders de soort */
  var IK = {
    aanval:'<path d="M5 19L17 7M14 5l5 5M4 20l2-2"/>',
    verdediging:'<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/>',
    speciaal:'<path d="M12 3l2.4 5.6 6 .6-4.5 4 1.3 6-5.2-3.1-5.2 3.1 1.3-6-4.5-4 6-.6z"/>',
    rommel:'<path d="M6 8c2-3 10-3 12 0 2 3 0 9-6 10-6-1-8-7-6-10z"/>',
    persoon:'<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-4 3.6-6 7-6s6.2 2 7 6"/>',
    plek:'<path d="M3 19l6-10 4 6 3-4 5 8z"/>',
    ding:'<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 12h6"/>'
  };
  function kaartIcoon(soort, fig){ return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (IK[fig] || IK[soort] || IK.speciaal) + '</svg>'; }
  return { teken:teken, mini:mini, kaartIcoon:kaartIcoon, gezicht:gezicht };
})();
