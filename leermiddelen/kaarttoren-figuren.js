/* Kaarttoren: de tegenstanders als tekening. Vriendelijke schoolspullen met
   een gezichtje; geen bloed, geen wapens, geen neuzen. Elke figuur is de
   binnenkant van een svg met viewBox -60 -60 120 120.

     KT_FIGUUR.teken(id, stemming)   stemming: '' (gewoon), 'au' (net geraakt), 'op' (geeft op)
     KT_FIGUUR.mini(id)              een kleine versie voor op de kaart van de toren
     KT_FIGUUR.kaartIcoon(soort, fig) het lijnplaatje op een kaart (viewBox 0 0 24 24)
     KT_FIGUUR.schat(id), KT_FIGUUR.hulpje(id)  het eigen icoontje van een schat of hulpje
   De kleuren zijn vaste merkkleuren: ze kantelen niet mee in het donker, net
   als de tekeningen in de andere spellen. */
window.KT_FIGUUR = (function(){
  'use strict';
  var INKT = '#14224C';
  /* ogen en mond, dezelfde voor iedereen: dat maakt ze familie.
     oog: de kleur van het oogwit (een krijtgezicht op het schoolbord heeft donkere ogen met lichte pupillen) */
  function gezicht(x, y, s, stemming, kleur, oog){
    s = s || 1; kleur = kleur || INKT; oog = oog || '#fff';
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
      h += '<circle cx="' + (x + dx) + '" cy="' + y + '" r="' + r + '" fill="' + oog + '" stroke="' + kleur + '" stroke-width="' + 1.6 * s + '"/>';
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
    },

    /* ---------- nieuw in versie 2 ---------- */
    /* De Schaar: knipt twee keer, klapt dicht, en dan een grote knip */
    schaar: function(st){
      return '<path d="M-7 -2 L-36 -52 L-24 -56 L6 -8 Z" fill="#e6e9f2" stroke="#8b95ad" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M7 -2 L36 -52 L24 -56 L-6 -8 Z" fill="#d6dbe6" stroke="#8b95ad" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M-8 8 L-20 24 M8 8 L20 24" stroke="#c0442c" stroke-width="8" stroke-linecap="round"/>' +
        '<ellipse cx="-24" cy="36" rx="14" ry="16" fill="none" stroke="#F26749" stroke-width="9"/>' +
        '<ellipse cx="24" cy="36" rx="14" ry="16" fill="none" stroke="#F26749" stroke-width="9"/>' +
        '<circle r="20" fill="#83A5F2" stroke="#204ECF" stroke-width="2.5"/>' + gezicht(0, -2, 0.62, st);
    },
    /* De Nietmachine: steeds meer nietjes, en dan laadt hij bij */
    nietmachine: function(st){
      return '<rect x="-48" y="18" width="96" height="16" rx="7" fill="#8b95ad" stroke="#5b6480" stroke-width="2.5"/>' +
        '<path d="M-46 14 C-46 -2 -40 -22 -22 -22 L40 -22 C48 -22 52 -16 52 -8 L52 4 C52 10 48 14 42 14 Z" fill="#F26749" stroke="#c0442c" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<circle cx="-40" cy="20" r="6" fill="#5b6480"/><path d="M44 14 v8 h-10 v-8" fill="none" stroke="#d6dbe6" stroke-width="2.5"/>' +
        '<path d="M-30 -14 h60" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".45"/>' + gezicht(6, -2, 0.78, st);
    },
    /* Het Plakband: maakt je zwak, slaat, en plakt zichzelf weer heel */
    plakband: function(st){
      return '<path d="M30 20 C40 34 44 46 40 58 L28 56 C30 46 26 34 18 26 Z" fill="#f7e7c4" stroke="#c7b36a" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<circle r="42" fill="#f7e7c4" stroke="#c7b36a" stroke-width="3"/><circle r="34" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>' +
        '<circle cx="12" cy="18" r="13" fill="#e9e3da" stroke="#c7b36a" stroke-width="2.5"/>' + gezicht(-6, -12, 0.78, st);
    },
    /* De Passer: draait steeds een rondje harder, en rust dan uit */
    passer: function(st){
      return '<path d="M-4 -24 L-30 50 M4 -24 L30 50" stroke="#8b95ad" stroke-width="8" stroke-linecap="round"/>' +
        '<path d="M-4 -24 L-30 50 M4 -24 L30 50" stroke="#d6dbe6" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M26 40 L34 40 L30 54 Z" fill="#14224C"/><rect x="24" y="30" width="12" height="10" rx="2" fill="#EA9836"/>' +
        '<rect x="-4" y="-58" width="8" height="12" rx="3" fill="#5b6480"/>' +
        '<circle cy="-26" r="24" fill="#83A5F2" stroke="#204ECF" stroke-width="2.5"/>' + gezicht(0, -28, 0.72, st);
    },
    /* De Rekenmachine: twee, drie, vier klappen, en dan even rekenen */
    rekenmachine: function(st){
      var k = '';
      for (var r = 0; r < 3; r++) for (var c = 0; c < 4; c++){
        k += '<rect x="' + (-26 + c * 14) + '" y="' + (6 + r * 13) + '" width="10" height="9" rx="2.5" fill="' + (r === 2 && c === 3 ? '#F26749' : '#e6e9f2') + '"/>';
      }
      return '<rect x="-36" y="-50" width="72" height="104" rx="12" fill="#3a4a7a" stroke="#14224C" stroke-width="2.5"/>' +
        '<rect x="-28" y="-42" width="56" height="38" rx="6" fill="#FCDED6" stroke="#14224C" stroke-width="2"/>' + k +
        gezicht(0, -26, 0.62, st);
    },
    /* De Natte Spons (lastpak): blokt, slaat en zuigt zich weer vol */
    spons: function(st){
      return '<path d="M-36 -46 q-4 8 0 12 q4 -4 0 -12 Z M40 -40 q-4 8 0 12 q4 -4 0 -12 Z" fill="#83A5F2"/>' +
        '<rect x="-48" y="18" width="96" height="20" rx="8" fill="#204ECF" stroke="#14224C" stroke-width="2.5"/>' +
        '<rect x="-48" y="-30" width="96" height="54" rx="12" fill="#F6B65A" stroke="#b56d1c" stroke-width="2.5"/>' +
        '<g fill="#d98a2a" opacity=".55"><ellipse cx="-34" cy="-18" rx="4" ry="3"/><ellipse cx="34" cy="-20" rx="5" ry="3.5"/><ellipse cx="-36" cy="12" rx="3.5" ry="2.5"/><ellipse cx="38" cy="10" rx="4" ry="3"/><ellipse cx="22" cy="-24" rx="2.5" ry="2"/></g>' +
        gezicht(0, -4, 0.9, st);
    },
    /* De Volle Prullenbak (lastpak): gooit rommel in je stapel */
    prullenbak: function(st){
      return '<path d="M-26 -38 L-12 -50 L2 -40 L-10 -30 Z M6 -46 L22 -54 L30 -40 L14 -34 Z" fill="#F4F1EA" stroke="#9aa3b8" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M-38 -30 L38 -30 L30 52 L-30 52 Z" fill="#9aa3b8" stroke="#5b6480" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<rect x="-44" y="-36" width="88" height="10" rx="5" fill="#5b6480"/>' +
        '<path d="M-20 -18 L-17 44 M0 -18 V44 M20 -18 L17 44" stroke="#c9ceda" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>' +
        '<rect x="-30" y="-14" width="60" height="38" rx="12" fill="#e6e9f2"/>' + gezicht(0, 0, 0.8, st);
    },
    /* De Toets (lastpak): elk goed antwoord doet hem pijn */
    toets: function(st){
      return '<rect x="-38" y="-50" width="76" height="100" rx="5" fill="#fff" stroke="#9aa3b8" stroke-width="2.5"/>' +
        '<path d="M-28 -36 h36 M-28 26 h52 M-28 36 h40" stroke="#83A5F2" stroke-width="2.5" stroke-linecap="round"/>' +
        '<circle cx="26" cy="-36" r="15" fill="none" stroke="#F26749" stroke-width="3.5"/><text x="26" y="-30" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-weight="700" font-size="17" fill="#F26749">?</text>' +
        gezicht(0, -6, 0.86, st);
    },
    /* De Stapel Boeken (baas op 5) */
    boekenstapel: function(st){
      return '<rect x="-46" y="30" width="92" height="20" rx="4" fill="#204ECF" stroke="#14224C" stroke-width="2.5"/>' +
        '<rect x="-40" y="12" width="84" height="18" rx="4" fill="#F26749" stroke="#c0442c" stroke-width="2.5" transform="rotate(-3)"/>' +
        '<rect x="-52" y="-34" width="100" height="44" rx="5" fill="#EA9836" stroke="#b56d1c" stroke-width="2.5" transform="rotate(2)"/>' +
        '<rect x="-34" y="-56" width="72" height="20" rx="4" fill="#83A5F2" stroke="#204ECF" stroke-width="2.5" transform="rotate(-4)"/>' +
        '<path d="M-40 40 h80 M-30 20 h66" stroke="#fff" stroke-width="2" opacity=".5"/>' +
        '<path d="M-46 -30 v38 M42 -26 v38" stroke="#b56d1c" stroke-width="3" opacity=".6"/>' + gezicht(0, -12, 1.1, st);
    },
    /* Het Schoolbord (baas op 12): een krijtgezicht dat ziet of je het fout had */
    schoolbord: function(st){
      return '<rect x="-12" y="40" width="6" height="18" fill="#b56d1c"/><rect x="8" y="40" width="6" height="18" fill="#b56d1c"/>' +
        '<rect x="-56" y="-46" width="112" height="88" rx="6" fill="#b56d1c" stroke="#7a4710" stroke-width="2.5"/>' +
        '<rect x="-49" y="-39" width="98" height="74" rx="3" fill="#1d3354"/>' +
        '<path d="M-42 -28 q6 -6 12 0 t12 0 M20 -30 h20 M24 -22 h12 M-40 24 h18 M-42 30 h30" stroke="#FBF6F1" stroke-width="2" stroke-linecap="round" fill="none" opacity=".55"/>' +
        '<rect x="20" y="32" width="14" height="5" rx="2" fill="#FBF6F1"/>' +
        gezicht(0, -2, 1.05, st, '#FBF6F1', '#14224C');
    }
  };
  function teken(id, stemming){ return (VORM[id] || VORM.prop)(stemming || ''); }
  function mini(id){ return '<svg viewBox="-60 -60 120 120" aria-hidden="true" focusable="false">' + teken(id, '') + '</svg>'; }

  /* ---------- het plaatje op een kaart ----------
     Lijntekeningen (24 bij 24) in de kleur van de tekst; per kaart een eigen
     plaatje, en voor wie geen eigen heeft het plaatje van de soort. */
  var IK = {
    aanval:'<path d="M5 19L17 7M14 5l5 5M4 20l2-2"/>',
    verdediging:'<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/>',
    speciaal:'<path d="M12 3l2.4 5.6 6 .6-4.5 4 1.3 6-5.2-3.1-5.2 3.1 1.3-6-4.5-4 6-.6z"/>',
    rommel:'<path d="M6 8c2-3 10-3 12 0 2 3 0 9-6 10-6-1-8-7-6-10z"/>',
    plek:'<path d="M3 19l6-10 4 6 3-4 5 8z"/>',
    ding:'<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 12h6"/>',
    muziek:'<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    potlood:'<path d="M4 20l1.5-5L16 4.5l3.5 3.5L9 18.5z"/><path d="M13.5 7l3.5 3.5M4 20l3.5-1.5"/>',
    schrift:'<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 3.5v17M12 8h4M12 11.5h4"/>',
    liniaal:'<rect x="2.5" y="8.5" width="19" height="7" rx="1.5" transform="rotate(-30 12 12)"/><path d="M8 13l-1-2M11 11.3l-1.5-2.6M14 9.6l-1-2"/>',
    gum:'<path d="M4 15l8-8 6 6-8 8H6z"/><path d="M9 10l6 6M12 21h8"/>',
    tik:'<path d="M5 12h6M8 9l3 3-3 3M13 12h6M16 9l3 3-3 3"/>',
    prop:'<path d="M6 9l3-4 6 1 3 4-1 6-5 3-5-2-2-5z"/><path d="M9 5l2 6 7-1M11 11l-4 5"/>',
    uitroep:'<path d="M12 4v10"/><circle cx="12" cy="19" r="1.3"/>',
    vlag:'<path d="M6 21V4M6 4h11l-2.5 4L17 12H6"/>',
    samen:'<circle cx="8.5" cy="10" r="4"/><circle cx="15.5" cy="10" r="4"/><path d="M5 19h14"/>',
    vlam:'<path d="M12 21c4 0 6-2.5 6-6 0-4-3-6-4-10-1 3-3 4-3 6-1-1-1.5-2-1.5-3C7 10 6 12.5 6 15c0 3.5 2 6 6 6z"/>',
    vraag:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
    ster:'<path d="M12 3l2.4 5.6 6 .6-4.5 4 1.3 6-5.2-3.1-5.2 3.1 1.3-6-4.5-4 6-.6z"/>',
    rugzak:'<path d="M7 8a5 5 0 0 1 10 0v11a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19z"/><path d="M10 4.5V3h4v1.5M9 13h6v4H9z"/>',
    bukken:'<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>',
    boek:'<path d="M4 5.5C6 4 9 4 12 6c3-2 6-2 8-.5V19c-2-1.5-5-1.5-8 .5-3-2-6-2-8-.5z"/><path d="M12 6v13.5"/>',
    paraplu:'<path d="M3 12a9 9 0 0 1 18 0zM12 12v6.5a2 2 0 0 1-4 0"/>',
    vinger:'<path d="M9 12V5a1.5 1.5 0 0 1 3 0v6M12 10V9a1.5 1.5 0 0 1 3 0v3M15 11.5a1.5 1.5 0 0 1 3 0V15c0 3-2.5 6-6 6s-5-2-6.5-4.5L4 14a1.5 1.5 0 0 1 2.5-1.5L9 15"/>',
    hart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    appel:'<path d="M12 8c-2-1.5-6-1-6 4 0 4 3 8 6 7 3 1 6-3 6-7 0-5-4-5.5-6-4z"/><path d="M12 8c0-2 1-3.5 3-4"/>',
    halter:'<path d="M3 12h18M5.5 8v8M8.5 6.5v11M15.5 6.5v11M18.5 8v8"/>',
    oog:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    lamp:'<path d="M9 17h6M10 20.5h4M12 3a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1v.5h6V15c0-.4.2-.8.5-1.1A6 6 0 0 0 12 3z"/>',
    pleister:'<rect x="2.5" y="8" width="19" height="8" rx="4" transform="rotate(-35 12 12)"/><path d="M10.5 10.5h.01M13.5 13.5h.01M10.5 13.5h.01M13.5 10.5h.01"/>',
    kauwgom:'<path d="M5 15c-2-5 2-10 7-10s9 4 7 9c-1 3-4 5-7 5s-6-1-7-4z"/><path d="M9 9.5a3 3 0 0 1 3-1.5"/>',
    propje:'<path d="M6 10l3-5 6 1 3 5-2 6-6 2-4-3z"/><path d="M9 5l1 6 8 0M10 11l-4 4"/>',
    bal:'<circle cx="12" cy="10" r="6"/><path d="M6.5 8.5c3 1.5 8 1.5 11 0M4 21h4M16 21h4M12 17v1.5"/>',
    brein:'<path d="M9 4.5A3 3 0 0 0 6 8a3 3 0 0 0-1.5 5.3A3 3 0 0 0 8 18a3 3 0 0 0 4 1.5V5.2A3 3 0 0 0 9 4.5zM15 4.5A3 3 0 0 1 18 8a3 3 0 0 1 1.5 5.3A3 3 0 0 1 16 18a3 3 0 0 1-4 1.5"/><path d="M12 5.2A3 3 0 0 1 15 4.5"/>',
    krijt:'<rect x="9" y="2.5" width="6" height="14" rx="1.5" transform="rotate(35 12 12)"/><path d="M3 20.5c3-1 5 1 8 0s5-1 9 0"/>',
    microfoon:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
    wisser:'<rect x="3" y="8" width="18" height="8" rx="2"/><path d="M3 12.5h18M7 16v3M17 16v3"/>',
    toets:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 11l2 2 3.5-3.5M9 16.5h6"/>',
    vraagpijl:'<path d="M4 12h11M11 8l4 4-4 4"/><path d="M17.5 6.5a2 2 0 1 1 2.8 1.8c-.5.2-.8.6-.8 1.2M19.5 12.5h.01"/>',
    schildboek:'<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M8.5 10c1.2-.8 2.4-.8 3.5 0 1.1-.8 2.3-.8 3.5 0v4.5c-1.2-.8-2.4-.8-3.5 0-1.1-.8-2.3-.8-3.5 0z"/>',
    helm:'<path d="M3.5 15a8.5 8.5 0 0 1 17 0v1.5h-17z"/><path d="M9 6.8l1 8.2M15 6.8l-1 8.2M12 6.5V15"/>',
    wolk:'<path d="M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8.5a4.5 4.5 0 0 1 .5 9.5z"/><path d="M9 14h6"/>',
    jas:'<path d="M9 3.5l3 2.5 3-2.5 4.5 2.5L21 12l-3 1v8H6v-8l-3-1 1.5-6z"/><path d="M12 6v15"/>',
    praat:'<path d="M4 5.5h16v10H11l-4.5 4v-4H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    prullenbak:'<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13.5h9l1-13.5"/><path d="M10 11v6M14 11v6"/>',
    stift:'<path d="M14 4l6 6-9 9H5v-6z"/><path d="M11.5 6.5l6 6M3 21h7"/>',
    notitie:'<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4"/><path d="M8 2v3M12 2v3M16 2v3"/>',
    maatje:'<circle cx="8.5" cy="11" r="4.5"/><circle cx="16" cy="12" r="4"/><path d="M7 10.5h.01M10 10.5h.01M14.8 11.5h.01M17.3 11.5h.01"/>',
    agenda:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9.5h16M8.5 3v4M15.5 3v4M8 13.5h3M8 16.5h6"/>',
    herhaal:'<path d="M4 12a8 8 0 0 1 14-5.3L20 8M20 4v4h-4M20 12a8 8 0 0 1-14 5.3L4 16M4 20v-4h4"/>',
    bord:'<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M7 20l2-4M17 20l-2-4M7 8.5h5M7 11.5h8"/>',
    plant:'<path d="M7 21h10l1-6H6zM12 15V9"/><path d="M12 11c-3 0-5-2-5-5 3 0 5 2 5 5zM12 9c0-3 2-5 5-5 0 3-2 5-5 5z"/>'
  };
  function kaartIcoon(soort, fig){ return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (IK[fig] || IK[soort] || IK.speciaal) + '</svg>'; }

  /* ---------- schatten en hulpjes ----------
     Eigen kleine tekeningen (24 bij 24) in vaste merkkleuren, met een
     donkerblauwe lijn, zodat ze op een licht en een donker vlak te zien zijn. */
  var L = ' stroke="#14224C" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"';
  var SCHAT = {
    etui:'<rect x="3" y="8" width="18" height="10" rx="4" fill="#EA9836"' + L + '/><path d="M5 11.5h14" stroke="#14224C" stroke-width="1.2" stroke-dasharray="1.5 1.5"/><path d="M7 8V5.5l1.5-2 1.5 2V8" fill="#F26749"' + L + '/><path d="M13 8V4.5h3V8" fill="#83A5F2"' + L + '/>',
    bidon:'<rect x="7" y="7" width="10" height="14" rx="3" fill="#204ECF"' + L + '/><rect x="9" y="3" width="6" height="4" rx="1" fill="#83A5F2"' + L + '/><path d="M9.5 11h5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>',
    stressbal:'<circle cx="12" cy="12" r="8.5" fill="#F26749"' + L + '/><circle cx="9.3" cy="10.5" r="1" fill="#14224C"/><circle cx="14.7" cy="10.5" r="1" fill="#14224C"/><path d="M9 14q3 2.2 6 0" fill="none"' + L + '/>',
    agenda:'<rect x="5" y="3.5" width="14" height="17" rx="2" fill="#204ECF"' + L + '/><path d="M8 3.5v17" stroke="#83A5F2" stroke-width="1.4"/><path d="M15 3.5v7l1.5-1.2L18 10.5v-7" fill="#F26749"' + L + '/>',
    klassenfoto:'<rect x="3" y="5" width="18" height="14" rx="2" fill="#FCDED6"' + L + '/><circle cx="16" cy="9.5" r="1.8" fill="#EA9836"/><path d="M5 17l4.5-5 3 3 2-2 4.5 4z" fill="#83A5F2"' + L + '/>',
    spaarpot:'<path d="M5 9h14l-1.5 11h-11z" fill="#EA9836"' + L + '/><rect x="9.5" y="9" width="5" height="1.6" rx=".8" fill="#14224C"/><circle cx="12" cy="5.5" r="3" fill="#F6B65A"' + L + '/>',
    schoolpas:'<rect x="3" y="6" width="18" height="12" rx="2" fill="#83A5F2"' + L + '/><rect x="5.5" y="9" width="5" height="6" rx="1" fill="#FBF6F1"' + L + '/><path d="M13 10h5M13 13h3.5" stroke="#14224C" stroke-width="1.4" stroke-linecap="round"/>',
    broodtrommel:'<rect x="3.5" y="9" width="17" height="10" rx="2" fill="#F26749"' + L + '/><path d="M3 9.5c0-2.5 2-4 4-4h10c2 0 4 1.5 4 4z" fill="#204ECF"' + L + '/><rect x="10" y="11" width="4" height="2.5" rx="1" fill="#FBF6F1"/>',
    cactus:'<path d="M7 16h10l-1 5H8z" fill="#F26749"' + L + '/><path d="M10 16V7a2 2 0 0 1 4 0v9" fill="#83A5F2"' + L + '/><path d="M10 12H8a1.5 1.5 0 0 1-1.5-1.5V9M14 10.5h2a1.5 1.5 0 0 0 1.5-1.5V7.5" fill="none"' + L + '/>',
    zandloper:'<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" fill="#FCDED6"' + L + '/><path d="M9 19.5c1-2 2-2.5 3-3 1 .5 2 1 3 3z" fill="#EA9836"/>',
    gelukspen:'<path d="M4 20l2-5 9-9 3 3-9 9z" fill="#F26749"' + L + '/><path d="M18.5 2.5l.9 2 2.1.2-1.6 1.4.5 2.1-1.9-1.1-1.9 1.1.5-2.1-1.6-1.4 2.1-.2z" fill="#EA9836"' + L + '/>',
    uitlegkaart:'<rect x="4" y="4" width="16" height="16" rx="3" fill="#FCDED6"' + L + '/><circle cx="12" cy="8.5" r="1.2" fill="#14224C"/><path d="M12 11.5v5" stroke="#14224C" stroke-width="1.8" stroke-linecap="round"/>',
    potlood:'<path d="M3.5 20.5l1.5-5L15.5 5l3.5 3.5L8.5 19z" fill="#EA9836"' + L + '/><path d="M3.5 20.5l1.5-5 3.5 3.5z" fill="#FCDED6"' + L + '/><path d="M15.5 5l1.5-1.5 3.5 3.5L19 8.5z" fill="#F26749"' + L + '/>',
    postit:'<path d="M4 4h16v11l-5 5H4z" fill="#F6B65A"' + L + '/><path d="M15 20v-5h5" fill="#EA9836"' + L + '/><path d="M7 8.5h9M7 11.5h6" stroke="#14224C" stroke-width="1.2" stroke-linecap="round"/>',
    kluissleutel:'<circle cx="8" cy="12" r="4.5" fill="#EA9836"' + L + '/><circle cx="8" cy="12" r="1.5" fill="#FBF6F1"/><path d="M12.5 12H21M18 12v3M15.5 12v2.5" fill="none" stroke="#14224C" stroke-width="2" stroke-linecap="round"/>',
    bureaulamp:'<path d="M14 4l5 5-3 1-3-3z" fill="#204ECF"' + L + '/><path d="M14.5 6.5L8 13l3 7" fill="none" stroke="#14224C" stroke-width="1.6" stroke-linecap="round"/><path d="M6 20.5h9" stroke="#14224C" stroke-width="2" stroke-linecap="round"/><path d="M17 10l2.5 5.5L22 11z" fill="#F6B65A" opacity=".8"/>',
    koptelefoon:'<path d="M5 14v-2a7 7 0 0 1 14 0v2" fill="none" stroke="#14224C" stroke-width="1.8"/><rect x="3" y="13" width="5" height="7" rx="2" fill="#F26749"' + L + '/><rect x="16" y="13" width="5" height="7" rx="2" fill="#F26749"' + L + '/>',
    leesbril:'<circle cx="7" cy="13" r="4" fill="#83A5F2" fill-opacity=".45"' + L + '/><circle cx="17" cy="13" r="4" fill="#83A5F2" fill-opacity=".45"' + L + '/><path d="M11 12.5q1-1.2 2 0M3 12l-1-3M21 12l1-3" fill="none"' + L + '/>',
    markeerset:'<path d="M5 20l1-9 3-1 1 1-2 9z" fill="#F26749"' + L + '/><path d="M10.5 20l1-11 3-1 1 1-2 11z" fill="#EA9836"' + L + '/><path d="M16 20l1-13 3-1 1 1-2 13z" fill="#83A5F2"' + L + '/>',
    goudster:'<path d="M12 2.5l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.7l-5.8 3.3 1.4-6.4-4.9-4.4 6.5-.7z" fill="#EA9836"' + L + '/><path d="M12 7v5" stroke="#FBF6F1" stroke-width="1.4" stroke-linecap="round"/>',
    boekentas:'<path d="M6 9a6 6 0 0 1 12 0v10.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5z" fill="#204ECF"' + L + '/><rect x="8.5" y="13" width="7" height="5" rx="1.2" fill="#83A5F2"' + L + '/><path d="M10 3.5h4" stroke="#14224C" stroke-width="1.6" stroke-linecap="round"/>',
    vulpen:'<path d="M14 3l7 7-7 4-4-4z" fill="#14224C"' + L + '/><path d="M10 10l4 4-6 6-4.5-.5L3 15z" fill="#EA9836"' + L + '/><path d="M3.5 20.5L8 16" stroke="#14224C" stroke-width="1.2"/>'
  };
  var HULP = {
    water:'<rect x="8" y="7" width="8" height="14" rx="2.5" fill="#83A5F2"' + L + '/><rect x="9.5" y="3" width="5" height="4" rx="1" fill="#204ECF"' + L + '/><path d="M8 12h8" stroke="#FBF6F1" stroke-width="1.4"/>',
    pepermunt:'<circle cx="12" cy="12" r="8" fill="#FBF6F1"' + L + '/><path d="M12 4.5a7.5 7.5 0 0 1 0 15M5 9.5l14 5M5 14.5l14-5" stroke="#F26749" stroke-width="1.6" fill="none"/>',
    joker:'<path d="M5 3h10l4 4v14H5z" fill="#FCDED6"' + L + '/><path d="M9.5 10a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.6" fill="none" stroke="#F26749" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17" r="1.1" fill="#F26749"/>',
    appel:'<path d="M12 8c-2-1.5-7-1-7 4.5 0 4 3 8.5 7 7.5 4 1 7-3.5 7-7.5C19 7 14 6.5 12 8z" fill="#F26749"' + L + '/><path d="M12 8c0-2 1-3.5 3-4.5" fill="none"' + L + '/><path d="M13 5.5c1.5-1.5 3.5-1.5 4.5-.5-1.5 1.5-3 1.5-4.5.5z" fill="#FBF6F1"' + L + '/>',
    banaan:'<path d="M4 7c1 8 9 13 16 9-1-1-1.5-1.8-2-2.6C13 15.5 8 12 6.5 6z" fill="#F6B65A"' + L + '/><path d="M4 7L4.5 4.5 6.5 6" fill="#b56d1c"' + L + '/>',
    grapje:'<path d="M3.5 5h17v11H11l-5 4v-4H3.5z" fill="#FBF6F1"' + L + '/><path d="M8 9v4M8 11h2.5M10.5 9v4M14 13l1.5-4 1.5 4M14.5 11.8h2" fill="none" stroke="#F26749" stroke-width="1.4" stroke-linecap="round"/>',
    schriftje:'<rect x="5" y="3.5" width="14" height="17" rx="2" fill="#204ECF"' + L + '/><rect x="9" y="7" width="7" height="4" rx="1" fill="#FBF6F1"/><path d="M7.5 3.5v17" stroke="#83A5F2" stroke-width="1.4"/>',
    doekje:'<path d="M4 8l9-4 7 6-8 10-8-5z" fill="#83A5F2"' + L + '/><path d="M8 10l6 3M9 14l4 2" stroke="#FBF6F1" stroke-width="1.2" stroke-linecap="round"/><path d="M19 3.5v3M17.5 5h3" stroke="#EA9836" stroke-width="1.4" stroke-linecap="round"/>'
  };
  function schat(id){ return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (SCHAT[id] || SCHAT.goudster) + '</svg>'; }
  function hulpje(id){ return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (HULP[id] || HULP.water) + '</svg>'; }
  return { teken:teken, mini:mini, kaartIcoon:kaartIcoon, gezicht:gezicht, schat:schat, hulpje:hulpje, VORM:VORM, IK:IK, SCHAT:SCHAT, HULP:HULP };
})();
