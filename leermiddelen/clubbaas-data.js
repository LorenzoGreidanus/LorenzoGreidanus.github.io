/* ============================================================================
   CLUBBAAS: de gedeelde gegevens en spelregels van de voetbalmanager.
   Werkt in de browser (window.CLUBBAAS) en op de server (import), net als
   teambaas-data.js: wat hier staat rekent de server echt af, de pagina toont het.

   - Twee speeldagen per week: woensdag 16.00 en zaterdag 14.00 (Nederlandse tijd).
   - Een divisie heeft 8 clubs (aangevuld met computerclubs); een seizoen is een
     hele competitie, uit en thuis: 14 speelrondes, dus 7 weken.
   - REGELS: munten, training, stadion, complex, fitheid, transfers.
   - Het shirt en het logo als svg, zodat de pagina en de voorpagina ze delen.
   ============================================================================ */
(function(g){
  'use strict';
  var DAG = 86400000, UUR = 3600000;

  /* ---------- tijd: alles in Nederlandse tijd ---------- */
  function verschil(t){
    try {
      var d = new Date(t), f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(d), o = {};
      f.forEach(function(p){ o[p.type] = p.value; });
      return Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour % 24, +o.minute, +o.second) - Math.floor(t / 1000) * 1000;
    } catch (e){ return UUR; }
  }
  function dagVan(t){ return new Date(t + verschil(t)).toISOString().slice(0, 10); }
  /* de speeldagen: [dag van de week (ma = 0), uur, minuut] */
  var SPEELDAGEN = [[2, 16, 0], [5, 14, 0]];
  function speeldagenRond(t){
    var d = new Date(t + verschil(t)), dag = (d.getUTCDay() + 6) % 7, uit = [];
    for (var w = -1; w <= 1; w++) SPEELDAGEN.forEach(function(s){
      var x = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dag + s[0] + 7 * w, s[1], s[2], 0);
      uit.push(x - verschil(x));
    });
    return uit.sort(function(a, b){ return a - b; });
  }
  /* de eerstvolgende wedstrijd na t, en de wedstrijd daarna */
  function volgendeWedstrijd(t){ return speeldagenRond(t).filter(function(x){ return x > t; })[0]; }
  function daarna(t){ return volgendeWedstrijd(volgendeWedstrijd(t) + 60000); }

  /* ---------- de regels ---------- */
  var REGELS = {
    perDivisie: 8,                      /* clubs per divisie */
    rondes: 14,                         /* speelrondes per seizoen: iedereen twee keer tegen iedereen */
    promotie: 2,                        /* zoveel gaan er omhoog en omlaag */
    dagMax: 300,                        /* munten per dag uit vragen */
    perGoed: [0, 10, 10, 12, 15],       /* munten per goed antwoord, per niveau (1 bb .. 4 vwo) */
    versnel: 10 * 60000,                /* een goed antwoord haalt er tien minuten af */
    startMunten: 250,
    /* munten na een wedstrijd: winst, gelijk of verlies, plus per goal, plus de kaartverkoop thuis */
    wedstrijdMunten: function(u, goals, thuis, stadion){ return ({ w: 120, g: 70, v: 40 })[u] + 10 * goals + (thuis ? 20 * stadion : 0); },
    /* het trainingscomplex: tot welk niveau je kunt trainen en hoeveel trainingen tegelijk */
    maxTraining: function(complex){ return Math.min(10, 1 + 2 * complex); },
    trainingen: function(complex){ return complex >= 4 ? 3 : complex >= 2 ? 2 : 1; },
    complexMax: 5, stadionMax: 5,
    training: function(n){ return { munten: 60 * (n - 1), tijd: (n - 1) * 30 * 60000 }; },
    complex: function(n){ return { munten: 400 * (n - 1), tijd: (n - 1) * 6 * UUR }; },
    stadion: function(n){ return { munten: 300 * (n - 1), tijd: (n - 1) * 4 * UUR }; },
    plaatsen: function(n){ return [0, 1200, 3000, 6000, 12000, 25000][Math.max(1, Math.min(5, n))]; },
    tribune: function(n){ return ['', 'een kleine tribune', 'een tweede tribune', 'tribunes rondom', 'een overdekt stadion', 'een groot stadion met dak'][Math.max(1, Math.min(5, n))]; },
    thuisVoordeel: function(n){ return 0.03 + 0.01 * n; },
    /* fitheid: herstel per uur, en wat een wedstrijd kost (naar het druk zetten) */
    herstel: 0.3,                       /* tussen twee speeldagen (70 tot 98 uur) komt er 21 tot 29 bij */
    moe: { laag: 14, midden: 22, hoog: 32 },   /* wie altijd hoog druk zet, moet spelers laten rusten */
    selectieMin: 14, selectieMax: 20,
    transferTot: 2,                     /* de transfermarkt is open tot en met speelronde 2 van een seizoen */
    verkoop: 0.8                        /* verkopen levert 80% van de waarde op */
  };
  var TRAINING = [
    { id: 'snelheid', naam: 'Snelheid', uit: 'sneller bij de bal, sterk over de vleugels' },
    { id: 'schieten', naam: 'Schieten', uit: 'meer kansen worden goals' },
    { id: 'passen', naam: 'Passen', uit: 'meer balbezit, sterk door het midden' },
    { id: 'verdedigen', naam: 'Verdedigen', uit: 'minder kansen voor de tegenstander' },
    { id: 'keepen', naam: 'Keepen', uit: 'je keeper houdt meer ballen' }
  ];

  /* ---------- posities, formaties en tactiek ---------- */
  var POS = { KEE: 'Keeper', VER: 'Verdediger', MID: 'Middenvelder', AAN: 'Aanvaller' };
  /* ringkleuren per positie; geen donkerblauw, want het veld is blauw */
  var POSKLEUR = { KEE: '#FCDED6', VER: '#83A5F2', MID: '#EA9836', AAN: '#F26749' };
  var FORMATIES = { '4-3-3': [4, 3, 3], '4-4-2': [4, 4, 2], '5-3-2': [5, 3, 2], '3-5-2': [3, 5, 2] };
  /* de plekken van een formatie, van de keeper naar voren; x van 0 (eigen doel) tot 100, y van 0 tot 100 */
  function plekken(formatie){
    var lijn = FORMATIES[formatie] || FORMATIES['4-3-3'], uit = [{ pos: 'KEE', x: 6, y: 50 }], xs = [24, 47, 70];
    lijn.forEach(function(n, li){
      for (var i = 0; i < n; i++) uit.push({ pos: ['VER', 'MID', 'AAN'][li], x: xs[li] + (n >= 5 && (i === 0 || i === n - 1) ? 4 : 0), y: Math.round((i + 1) * 100 / (n + 1)) });
    });
    return uit;
  }
  var TACTIEK = {
    stijl: { naam: 'Speelstijl', keuzes: [['verdedigend', 'Verdedigend', 'Minder kansen tegen, maar ook minder kansen voor jou.'], ['gebalanceerd', 'Gebalanceerd', 'Even veel aandacht voor aanvallen en verdedigen.'], ['aanvallend', 'Aanvallend', 'Meer kansen voor jou, maar achterin staat het open.']] },
    druk: { naam: 'Druk zetten', keuzes: [['laag', 'Laag', 'Spaart energie: je spelers zijn na de wedstrijd minder moe.'], ['midden', 'Midden', 'Normaal: een beetje moe na de wedstrijd.'], ['hoog', 'Hoog', 'Vaker de bal terug, maar je spelers raken sneller moe.']] },
    via: { naam: 'Aanvallen via', keuzes: [['midden', 'Midden', 'Sterk als je goed kunt passen.'], ['vleugels', 'Vleugels', 'Sterk als je snel bent.'], ['lang', 'Lange bal', 'Sterk als je goed kunt schieten, ook met een zwak middenveld.']] }
  };
  function tactiek(t){
    t = t || {};
    var ok = function(s, w, d){ return TACTIEK[s].keuzes.some(function(k){ return k[0] === w; }) ? w : d; };
    return { stijl: ok('stijl', t.stijl, 'gebalanceerd'), druk: ok('druk', t.druk, 'midden'), via: ok('via', t.via, 'midden') };
  }

  /* ---------- spelers ---------- */
  /* Spelersnamen: echte voetballers, op hun eigen positie. Sterren komen alleen voor bij een hoge
     kwaliteit (vanaf 74), zodat je ze niet voor een paar munten koopt. De kwaliteit, de fitheid en wat
     ze in het spel doen zijn verzonnen; de gezichtjes komen uit avatar.js, er zijn geen foto's. */
  var NAMEN = {KEE: {ster: ["Thibaut Courtois","Alisson Becker","Ederson Moraes","Marc-André ter Stegen","Jan Oblak","Mike Maignan","Gianluigi Donnarumma","Manuel Neuer","Emiliano Martínez","Yassine Bounou","Diogo Costa","Bart Verbruggen"],rest: ["Justin Bijlow","Mark Flekken","Remko Pasveer","Andries Noppert","Nick Olij","Kjell Scherpen","Robin Roefs","Joël Drommel","Etienne Vaessen","Walter Benítez","Jasper Cillessen","Tim Krul","Hidde Jurjus","Jeroen Zoet","Sergio Padt","André Onana","David Raya","Jordan Pickford","Unai Simón","Gregor Kobel","Yann Sommer","Koen Casteels","Kasper Schmeichel","Wojciech Szczęsny","Aaron Ramsdale","Nick Pope","Mile Svilar","Maarten Stekelenburg","Lucas Chevalier","Guglielmo Vicario"]},VER: {ster: ["Virgil van Dijk","Rúben Dias","William Saliba","Achraf Hakimi","Antonio Rüdiger","Joško Gvardiol","Alessandro Bastoni","Marquinhos","Trent Alexander-Arnold","Alphonso Davies","Theo Hernández","Matthijs de Ligt","Jeremie Frimpong","Micky van de Ven"],rest: ["Nathan Aké","Stefan de Vrij","Denzel Dumfries","Jurriën Timber","Lutsharel Geertruida","Daley Blind","Jan Paul van Hecke","Sven Botman","Quilindschy Hartman","Ian Maatsen","Devyne Rensch","Jorrel Hato","Jordan Teze","Owen Wijndal","Bart van Rooij","Ryan Flamingo","Olivier Boscagli","Armando Obispo","Josip Šutalo","Anton Gaaei","Mitchel Bakker","Tyrell Malacia","Bruno Martins Indi","Hans Hateboer","Kenny Tete","Joël Veltman","Patrick van Aanholt","João Cancelo","Kyle Walker","John Stones","Andrew Robertson","Éder Militão","David Alaba","Dayot Upamecano","Gabriel Magalhães","Ben White","Kim Min-jae","Ronald Araújo","Jules Koundé","Alejandro Balde","Dani Carvajal","Federico Dimarco","Ibrahima Konaté","Pau Cubarsí","Nuno Mendes","Kalidou Koulibaly","Jan Vertonghen","Toby Alderweireld","Thomas Meunier","Timothy Castagne","Arthur Theate","Zeno Debast","Kieran Trippier","Reece James","Marc Cucurella","Pedro Porro","Cristian Romero","Destiny Udogie","Nayef Aguerd","Noussair Mazraoui","Romain Saïss","Lisandro Martínez","Nico Schlotterbeck","Manuel Akanji","Merih Demiral","Ferdi Kadıoğlu"]},MID: {ster: ["Kevin De Bruyne","Rodri","Jude Bellingham","Pedri","Federico Valverde","Declan Rice","Martin Ødegaard","Bruno Fernandes","Jamal Musiala","Florian Wirtz","Frenkie de Jong","Tijjani Reijnders","Luka Modrić","Toni Kroos","Joshua Kimmich","Xavi Simons"],rest: ["Ryan Gravenberch","Teun Koopmeiners","Joey Veerman","Jerdy Schouten","Mats Wieffer","Marten de Roon","Georginio Wijnaldum","Davy Klaassen","Kenneth Taylor","Quinten Timber","Wouter Burger","Guus Til","Jordy Clasie","Ismael Saibari","Calvin Stengs","Kevin Strootman","Donny van de Beek","Sven Mijnans","Kees Smit","Gavi","Aurélien Tchouaméni","Eduardo Camavinga","Bernardo Silva","İlkay Gündoğan","Nicolò Barella","Hakan Çalhanoğlu","Sandro Tonali","Enzo Fernández","Moisés Caicedo","Alexis Mac Allister","Dominik Szoboszlai","Youri Tielemans","Amadou Onana","Axel Witsel","Sofyan Amrabat","Azzedine Ounahi","Bilal El Khannouss","Arda Güler","Orkun Kökçü","Vitinha","João Neves","Warren Zaïre-Emery","Adrien Rabiot","N'Golo Kanté","Casemiro","Mason Mount","Bruno Guimarães","James Maddison","Martín Zubimendi","Mikel Merino","Lucas Paquetá","Granit Xhaka","Christian Eriksen","Pierre-Emile Højbjerg","Jordan Henderson","Fabian Ruiz","Scott McTominay","Conor Gallagher","Leon Goretzka","Aleksandar Pavlović"]},AAN: {ster: ["Kylian Mbappé","Erling Haaland","Lionel Messi","Cristiano Ronaldo","Mohamed Salah","Harry Kane","Vinícius Júnior","Lamine Yamal","Raphinha","Robert Lewandowski","Bukayo Saka","Lautaro Martínez","Cody Gakpo","Ousmane Dembélé","Cole Palmer"],rest: ["Memphis Depay","Donyell Malen","Wout Weghorst","Steven Bergwijn","Brian Brobbey","Noa Lang","Justin Kluivert","Joshua Zirkzee","Luuk de Jong","Vangelis Pavlidis","Santiago Giménez","Ricardo Pepi","Hirving Lozano","Dušan Tadić","Mohammed Kudus","Myron Boadu","Crysencio Summerville","Hakim Ziyech","Steven Berghuis","Antoine Griezmann","Marcus Rashford","Son Heung-min","Julián Álvarez","Victor Osimhen","Khvicha Kvaratskhelia","Rafael Leão","Romelu Lukaku","Jérémy Doku","Loïs Openda","Viktor Gyökeres","Alexander Isak","Darwin Núñez","Luis Díaz","Gabriel Martinelli","Ollie Watkins","Leroy Sané","Serge Gnabry","Kai Havertz","Niclas Füllkrug","Ademola Lookman","Dušan Vlahović","Federico Chiesa","Álvaro Morata","Nico Williams","Youssef En-Nesyri","Brahim Díaz","Abde Ezzalzouli","Kenan Yıldız","Kerem Aktürkoğlu","Randal Kolo Muani","Marcus Thuram","Christopher Nkunku","Kingsley Coman","Michael Olise","Jonathan David","Benjamin Šeško","Leandro Trossard","Jarrod Bowen","Dominic Solanke","Phil Foden"]}};
  var STER = 74;
  var BOTCLUBS = ['De Kastanjes', 'Polderpijl', 'SV Bliksem', 'Duinvogels', 'FC Molenwiek', 'Noorderlicht', 'VV Dijkdraaiers', 'Oranjewind', 'De Grachtgangers', 'Tulpstad', 'Windkracht', 'FC Zonnestraal', 'SC Komeet', 'IJsvogels', 'Kanaalkoers', 'De Dukdalven', 'VV Waddenwind', 'Rode Rakkers'];
  function hash(s){ var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(zaad){ var a = zaad >>> 0; return function(){ a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function naamVoor(zaad, pos, kw){
    var g = NAMEN[pos] || NAMEN.MID, l = (kw || 0) >= STER ? g.ster : g.rest;
    return l[hash(zaad) % l.length];
  }
  /* een speler: kwaliteit van 40 tot 90 */
  function speler(zaad, pos, kw){ return { id: (hash(zaad) % 2176782336).toString(36), naam: naamVoor(zaad, pos, kw), pos: pos, kw: Math.max(40, Math.min(90, Math.round(kw))), fit: 100, fitT: 0 }; }
  /* de selectie waarmee een club begint: 2 keepers, 5 verdedigers, 5 middenvelders en 4 aanvallers */
  function startSelectie(zaad, basis){
    var r = rng(hash(zaad)), uit = [], rij = [['KEE', 2], ['VER', 5], ['MID', 5], ['AAN', 4]];
    rij.forEach(function(x){ for (var i = 0; i < x[1]; i++) uit.push(speler(zaad + ':' + x[0] + i, x[0], (basis || 56) + (i < (x[0] === 'KEE' ? 1 : 3) ? 4 : -2) + Math.round((r() - 0.5) * 8))); });
    return uniekeNamen(uit, zaad);
  }
  /* geen twee spelers met dezelfde naam in een selectie */
  function uniekeNamen(spelers, zaad){
    var bezet = {};
    spelers.forEach(function(s, i){
      for (var k = 0; k < 40 && bezet[s.naam]; k++) s.naam = naamVoor(zaad + ':' + i + ':' + k, s.pos, s.kw);
      bezet[s.naam] = 1;
    });
    return spelers;
  }
  function waarde(kw){ return Math.max(40, Math.round((Math.pow(Math.max(0, kw - 40), 1.6) * 1.2 + 40) / 10) * 10); }
  /* fitheid nu: na een wedstrijd herstelt een speler elk uur een beetje */
  function fitNu(s, t){ return Math.max(0, Math.min(100, Math.round((s.fit == null ? 100 : s.fit) + Math.max(0, t - (s.fitT || 0)) / UUR * REGELS.herstel))); }
  /* de beste elf voor een formatie: per plek de beste fitte speler op die positie */
  function besteElf(spelers, formatie, t){
    var vrij = spelers.slice(), uit = [];
    plekken(formatie).forEach(function(p){
      var score = function(s){ return s.kw * (0.7 + 0.3 * fitNu(s, t) / 100) * (s.pos === p.pos ? 1 : p.pos === 'KEE' || s.pos === 'KEE' ? 0.3 : 0.8); };
      vrij.sort(function(a, b){ return score(b) - score(a); });
      var s = vrij.shift(); uit.push(s ? s.id : '');
    });
    return uit;
  }

  /* ---------- het speelschema: iedereen een keer thuis en een keer uit ---------- */
  function schema(n){
    var ids = []; for (var i = 0; i < n; i++) ids.push(i);
    var rondes = [];
    for (var r = 0; r < n - 1; r++){
      var paren = [];
      for (var k = 0; k < n / 2; k++){ var a = ids[k], b = ids[n - 1 - k]; paren.push(r % 2 ? [b, a] : [a, b]); }
      rondes.push(paren);
      ids.splice(1, 0, ids.pop());
    }
    return rondes.concat(rondes.map(function(p){ return p.map(function(x){ return [x[1], x[0]]; }); }));
  }

  /* ---------- kleuren, shirt en logo ---------- */
  var KLEUREN = [['#F26749', 'koraal'], ['#204ECF', 'diepblauw'], ['#EA9836', 'oker'], ['#83A5F2', 'lichtblauw'], ['#FBF6F1', 'wit'], ['#14224C', 'nachtblauw'],
    ['#9B6BF2', 'paars'], ['#F27BB0', 'roze'], ['#F2D649', 'geel'], ['#3CC6E8', 'ijsblauw'], ['#A8683A', 'kastanje'], ['#1A1C24', 'zwart']];
  function kleurOk(k){ for (var i = 0; i < KLEUREN.length; i++) if (KLEUREN[i][0] === k) return true; return false; }
  /* patronen voor het shirt: [id, naam, prijs]; de eerste vier zijn gratis */
  var PATRONEN = [['effen', 'Effen', 0], ['strepen', 'Strepen', 0], ['baan', 'Baan', 0], ['helft', 'Helften', 0],
    ['smal', 'Smalle strepen', 100], ['middenbaan', 'Middenbaan', 100], ['ringen', 'Ringen', 100], ['schouders', 'Schouders', 100],
    ['sjerp', 'Sjerp', 150], ['blokken', 'Blokken', 150], ['pijl', 'Pijl', 150], ['zijbanen', 'Zijbanen', 150]];
  function patroonOk(p){ return PATRONEN.some(function(x){ return x[0] === p; }) ? p : 'effen'; }
  function patroonPrijs(p){ var x = PATRONEN.filter(function(y){ return y[0] === p; })[0]; return x ? x[2] : 0; }
  var LOGOS = {
    vogel: { naam: 'Vogel', d: 'M10 23c4-7 9-9 16-9-2 3-2 5 0 7-5 0-7 2-8 6-2-3-5-4-8-4z' },
    ster: { naam: 'Ster', d: 'M20 12l2.6 5.4 5.9.8-4.3 4.1 1 5.9L20 25.4l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z' },
    kroon: { naam: 'Kroon', d: 'M11 27l1.5-11 4.5 5 3-7 3 7 4.5-5 1.5 11z' },
    golf: { naam: 'Golf', d: 'M9 20c3-3 6-3 9 0s6 3 9 0 4-2 4-2v5c-3 3-6 3-9 0s-6-3-9 0-4 2-4 2z' },
    bliksem: { naam: 'Bliksem', d: 'M23 11l-9 12h5.5l-3 11 10-14h-5.5z' },
    toren: { naam: 'Toren', d: 'M13 30V17h2.5v-3h2.5v3h4v-3h2.5v3H27v13h-5v-5h-4v5z' },
    bal: { naam: 'Bal', d: 'M20 13a8.5 8.5 0 1 0 .01 0zM20 17.5l3.3 2.4-1.3 3.9h-4l-1.3-3.9z' },
    anker: { naam: 'Anker', d: 'M19 11h2v3h3v2h-3v11c3-.3 5-2 6-4.5l-2-1 4-2 1 4.5-1.6-.8c-1.4 3.6-4.6 5.8-8.4 5.8s-7-2.2-8.4-5.8L10 23l1-4.5 4 2-2 1c1 2.5 3 4.2 6 4.5V16h-3v-2h3z' },
    molen: { naam: 'Molen', d: 'M18.5 20h3l2 11h-7zM20 21 11 12l1.5-1.5 7.5 7.5 7.5-7.5L29 12zM20 19l-8 8 1.5 1.5L20 22l6.5 6.5L28 27z' },
    vis: { naam: 'Vis', d: 'M9 21c4-5 10-6 15-3l5-4v14l-5-4c-5 3-11 2-15-3zM14 20.5a1.3 1.3 0 1 0 .01 0z' },
    boom: { naam: 'Boom', d: 'M20 10l8 11h-4l5 6H11l5-6h-4zM18.5 27h3v5h-3z' },
    vlam: { naam: 'Vlam', d: 'M20 10c1 5 7 7 7 13a7 7 0 0 1-14 0c0-3 2-5 3-6 0 2 1 3 2 3-1-4 0-7 2-10z' }
  };
  function logoOk(l){ return Object.prototype.hasOwnProperty.call(LOGOS, l) ? l : 'vogel'; }
  /* de vorm van het logo: [id, naam, prijs, pad] */
  var LOGOVORMEN = [['schild', 'Schild', 0, 'M20 2 37 8v14c0 11-7 18-17 22C10 40 3 33 3 22V8z'], ['rond', 'Rond', 0, 'M20 3.5a19 19 0 1 0 .01 0z'],
    ['wapen', 'Wapen', 100, 'M3 4h34v16c0 12-8 19-17 23C11 39 3 32 3 20z'], ['ruit', 'Ruit', 100, 'M20 2 38 23 20 44 2 23z'], ['zeshoek', 'Zeshoek', 150, 'M20 2l17 10v21L20 43 3 33V12z']];
  function vormOk(v){ return LOGOVORMEN.some(function(x){ return x[0] === v; }) ? v : 'schild'; }
  function vormPrijs(v){ var x = LOGOVORMEN.filter(function(y){ return y[0] === v; })[0]; return x ? x[2] : 0; }
  function lettersOk(l){ l = String(l || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3); return l; }
  function helderheid(k){ var x = parseInt(String(k).slice(1), 16); return (((x >> 16) & 255) * 0.299 + ((x >> 8) & 255) * 0.587 + (x & 255) * 0.114) / 255; }
  /* een tenue: shirt (twee kleuren en een patroon), mouwen, kraag, broek en sokken */
  function tenue(x, basis){
    x = x || {}; basis = basis || {};
    var k1 = kleurOk(x.k1) ? x.k1 : (basis.k1 || '#F26749'), k2 = kleurOk(x.k2) ? x.k2 : (basis.k2 || '#FBF6F1');
    return { k1: k1, k2: k2, patroon: patroonOk(x.patroon || basis.patroon), mouw: kleurOk(x.mouw) ? x.mouw : k1, kraag: kleurOk(x.kraag) ? x.kraag : k2,
      broek: kleurOk(x.broek) ? x.broek : (basis.broek || '#FBF6F1'), sok: kleurOk(x.sok) ? x.sok : k1 };
  }
  /* alle tenues van een club, ook voor een club van voor de tenues (alleen k1, k2 en patroon) */
  function tenues(c){
    var tn = c.tenues || {};
    return {
      thuis: tenue(tn.thuis, { k1: c.k1, k2: c.k2, patroon: c.patroon, broek: c.k2 }),
      uit: tenue(tn.uit, { k1: c.k2 === '#FBF6F1' ? '#FBF6F1' : c.k2, k2: c.k1, patroon: 'effen', broek: c.k1 }),
      keeper: tenue(tn.keeper, { k1: '#F2D649', k2: '#14224C', patroon: 'effen', broek: '#14224C' })
    };
  }
  var teller = 0;
  function patroonSvg(p, k2){
    var s = '', i;
    if (p === 'strepen') s = '<path d="M45 0v130M60 0v130M75 0v130" stroke="' + k2 + '" stroke-width="8"/>';
    else if (p === 'smal') { for (i = 30; i <= 92; i += 9) s += '<path d="M' + i + ' 0v130" stroke="' + k2 + '" stroke-width="3.5"/>'; }
    else if (p === 'baan') s = '<path d="M0 58h120v20H0z" fill="' + k2 + '"/>';
    else if (p === 'helft') s = '<path d="M60 0h60v130H60z" fill="' + k2 + '"/>';
    else if (p === 'middenbaan') s = '<path d="M50 0h20v130H50z" fill="' + k2 + '"/>';
    else if (p === 'ringen') { for (i = 34; i < 130; i += 22) s += '<path d="M0 ' + i + 'h120v11H0z" fill="' + k2 + '"/>'; }
    else if (p === 'schouders') s = '<path d="M0 0h120v40H0z" fill="' + k2 + '"/>';
    else if (p === 'sjerp') s = '<path d="M26 8h20l66 122H92z" fill="' + k2 + '"/>';
    else if (p === 'blokken') { for (var y = 0; y < 130; y += 15) for (var x = (y / 15) % 2 ? 15 : 0; x < 120; x += 30) s += '<rect x="' + x + '" y="' + y + '" width="15" height="15" fill="' + k2 + '"/>'; }
    else if (p === 'pijl') s = '<path d="M30 40l30 22 30-22v14L60 76 30 54z" fill="' + k2 + '"/>';
    else if (p === 'zijbanen') s = '<path d="M30 30h8v100h-8zM82 30h8v100h-8z" fill="' + k2 + '"/>';
    return s;
  }
  /* een tenue als svg: alleen het shirt (viewBox 120 x 130) of het hele tenue met broek en sokken (120 x 215) */
  function tenueSvg(tn, maat, opties){
    opties = opties || {}; tn = tenue(tn);
    var id = 'cbs' + (++teller), heel = !!opties.heel, hoog = heel ? 215 : 130;
    var body = 'M38 10 20 18 4 42l18 12 8-10v76h60V44l8 10 18-12-16-24-18-8c-2 9-11 14-22 14S40 19 38 10z';
    var nrKleur = helderheid(tn.patroon === 'helft' ? tn.k2 : tn.k1) > 0.55 ? '#14224C' : '#FBF6F1';
    var s = '<svg viewBox="0 0 120 ' + hoog + '" width="' + maat + '" height="' + Math.round(maat * hoog / 120) + '"' + (opties.label ? ' role="img" aria-label="' + opties.label + '"' : ' aria-hidden="true"') + '><defs><clipPath id="' + id + '"><path d="' + body + '"/></clipPath></defs>';
    if (heel){
      s += '<path d="M36 170h18v38H36zM66 170h18v38H66z" fill="' + tn.sok + '" stroke="#14224C" stroke-width="2.5"/><path d="M36 176h18v5H36zM66 176h18v5H66z" fill="' + tn.k2 + '"/>' +
        '<path d="M30 126h60l5 40H66l-6-16-6 16H25z" fill="' + tn.broek + '" stroke="#14224C" stroke-width="3" stroke-linejoin="round"/>';
    }
    s += '<path d="' + body + '" fill="' + tn.k1 + '"/><g clip-path="url(#' + id + ')">' + patroonSvg(tn.patroon, tn.k2) +
      '<path d="M0 0h30v60H0zM90 0h30v60H90z" fill="' + tn.mouw + '" transform="translate(0 0)"/></g>' +
      '<path d="M38 10c2 9 11 14 22 14s20-5 22-14" fill="none" stroke="' + tn.kraag + '" stroke-width="6"/>' +
      '<path d="' + body + '" fill="none" stroke="#14224C" stroke-width="3" stroke-linejoin="round"/>' +
      (opties.nr ? '<text x="60" y="98" text-anchor="middle" font-family="Poppins,sans-serif" font-weight="700" font-size="30" fill="' + nrKleur + '" stroke="' + (nrKleur === '#14224C' ? 'none' : '#14224C') + '" stroke-width="1">' + opties.nr + '</text>' : '');
    return s + '</svg>';
  }
  /* het oude aanroepen: alleen het shirt */
  function shirtSvg(k1, k2, patroon, maat, nr, label){ return tenueSvg({ k1: k1, k2: k2, patroon: patroon }, maat, { nr: nr, label: label }); }
  /* het logo (viewBox 40 x 46): een vorm met een symbool of letters */
  function logoSvg(logo, k1, k2, maat, label, vorm, letters){
    var v = LOGOVORMEN.filter(function(x){ return x[0] === vormOk(vorm); })[0], teken = helderheid(k1) > 0.6 ? (k2 && helderheid(k2) < 0.6 ? k2 : '#14224C') : '#FBF6F1';
    var l = lettersOk(letters), binnen = l ? '<text x="20" y="' + (l.length > 2 ? 26.5 : 28) + '" text-anchor="middle" font-family="Poppins,sans-serif" font-weight="700" font-size="' + (l.length > 2 ? 11 : l.length > 1 ? 14 : 18) + '" fill="' + teken + '">' + l + '</text>' :
      '<path d="' + LOGOS[logoOk(logo)].d + '" fill="' + teken + '" fill-rule="evenodd"/>';
    return '<svg viewBox="0 0 40 46" width="' + maat + '" height="' + Math.round(maat * 46 / 40) + '"' + (label ? ' role="img" aria-label="' + label + '"' : ' aria-hidden="true"') + '>' +
      '<path d="' + v[3] + '" fill="' + k1 + '" stroke="' + (k2 || '#FBF6F1') + '" stroke-width="2.5" stroke-linejoin="round"/>' + binnen + '</svg>';
  }

  g.CLUBBAAS = { REGELS: REGELS, TRAINING: TRAINING, POS: POS, POSKLEUR: POSKLEUR, FORMATIES: FORMATIES, plekken: plekken, TACTIEK: TACTIEK, tactiek: tactiek,
    naamVoor: naamVoor, uniekeNamen: uniekeNamen, NAMEN_VERSIE: 3, speler: speler, startSelectie: startSelectie, waarde: waarde, fitNu: fitNu, besteElf: besteElf, schema: schema, BOTCLUBS: BOTCLUBS,
    KLEUREN: KLEUREN, kleurOk: kleurOk, PATRONEN: PATRONEN, patroonOk: patroonOk, patroonPrijs: patroonPrijs, LOGOS: LOGOS, logoOk: logoOk, LOGOVORMEN: LOGOVORMEN, vormOk: vormOk, vormPrijs: vormPrijs, lettersOk: lettersOk,
    tenue: tenue, tenues: tenues, tenueSvg: tenueSvg, shirtSvg: shirtSvg, logoSvg: logoSvg, helderheid: helderheid,
    hash: hash, rng: rng, dagVan: dagVan, speeldagenRond: speeldagenRond, volgendeWedstrijd: volgendeWedstrijd, daarna: daarna };
})(typeof globalThis !== 'undefined' ? globalThis : this);
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.CLUBBAAS;
