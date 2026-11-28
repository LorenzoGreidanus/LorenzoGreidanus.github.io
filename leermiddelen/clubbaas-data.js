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
  /* Spelersnamen zoals in een echte selectie: voornaam en achternaam uit hetzelfde land, vaker
     Nederlands dan buitenlands. Verzonnen combinaties, geen bestaande profvoetballers. */
  var HERKOMST = [
    [10, ['Daan', 'Thijs', 'Bram', 'Luuk', 'Jesse', 'Ruben', 'Sven', 'Joris', 'Stijn', 'Niels', 'Wouter', 'Bas', 'Koen', 'Jelle', 'Rick', 'Tim', 'Lars', 'Mats', 'Sem', 'Thomas', 'Jens', 'Gijs', 'Teun', 'Wessel', 'Mike', 'Kevin', 'Jordy', 'Dennis', 'Pim', 'Floris'],
         ['Vermeer', 'de Wit', 'Bakker', 'Jansen', 'Visser', 'Smit', 'Mulder', 'de Graaf', 'Bos', 'Koster', 'Hendriks', 'Dekker', 'Brouwer', 'van Leeuwen', 'Kramer', 'Prins', 'Meijer', 'de Boer', 'Kok', 'Hoekstra', 'Kuipers', 'Postma', 'van den Berg', 'Verhoeven', 'Schouten', 'van der Veen', 'Bosman', 'Wolters', 'Huisman', 'Mertens', 'Dijkstra', 'van Wijk', 'Brink', 'Timmermans', 'Hermans', 'van Vliet']],
    [3, ['Mohamed', 'Anass', 'Ilias', 'Yassin', 'Bilal', 'Ayoub', 'Zakaria', 'Hamza', 'Soufiane', 'Mounir', 'Achraf', 'Othman'], ['El Amrani', 'Bouzid', 'Haddou', 'Ziani', 'El Idrissi', 'Benali', 'Azzouzi', 'Tahiri', 'El Khayati', 'Bakkali', 'Ouali', 'Chaouki']],
    [3, ['Jayden', 'Dayron', 'Xavier', 'Romano', 'Damian', 'Shaquille', 'Giovanni', 'Ryan', 'Jurgen', 'Sheraldo', 'Delano', 'Calvin'], ['Pinas', 'Kanhai', 'Ramdin', 'Biharie', 'Sitaram', 'Sabajo', 'Jagroep', 'Tjin', 'Mangal', 'Esajas', 'Menig', 'Dors']],
    [2, ['Emre', 'Burak', 'Kerem', 'Arda', 'Mert', 'Yusuf', 'Ozan', 'Can', 'Furkan', 'Baris'], ['Yilmaz', 'Demir', 'Kaya', 'Aydin', 'Ozturk', 'Celik', 'Bulut', 'Kilic', 'Arslan', 'Dogan']],
    [2, ['Jonas', 'Mathias', 'Emil', 'Oliver', 'Magnus', 'Viktor', 'Henrik', 'Lukas', 'Elias', 'Nils'], ['Andersen', 'Nielsen', 'Lindqvist', 'Berg', 'Johansson', 'Hansen', 'Larsen', 'Eriksson', 'Dahl', 'Holm']],
    [2, ['Tiago', 'Diego', 'Rafael', 'Pablo', 'Mateo', 'Lucas', 'Bruno', 'Iker', 'Joao', 'Andres'], ['Silva', 'Fernandes', 'Moreno', 'Ortega', 'Costa', 'Navarro', 'Pereira', 'Ramos', 'Castillo', 'Duarte']],
    [2, ['Arne', 'Senne', 'Wout', 'Jarne', 'Robbe', 'Lander', 'Brecht', 'Seppe', 'Arno', 'Kobe'], ['Peeters', 'Maes', 'Claes', 'Goossens', 'Wouters', 'De Smet', 'Vermeulen', 'Janssens', 'Willems', 'Van Damme']],
    [2, ['Kwame', 'Ibrahim', 'Moussa', 'Samuel', 'Emmanuel', 'Abdou', 'Kofi', 'Sekou', 'Ousmane', 'Joseph'], ['Mensah', 'Diallo', 'Traore', 'Owusu', 'Kone', 'Agyei', 'Camara', 'Asante', 'Ndiaye', 'Sarr']],
    [1, ['Leon', 'Felix', 'Jonas', 'Niklas', 'Tobias', 'Moritz', 'Paul', 'Florian'], ['Schneider', 'Fischer', 'Weber', 'Wagner', 'Becker', 'Hoffmann', 'Richter', 'Krause']]
  ];
  var BOTCLUBS = ['De Kastanjes', 'Polderpijl', 'SV Bliksem', 'Duinvogels', 'FC Molenwiek', 'Noorderlicht', 'VV Dijkdraaiers', 'Oranjewind', 'De Grachtgangers', 'Tulpstad', 'Windkracht', 'FC Zonnestraal', 'SC Komeet', 'IJsvogels', 'Kanaalkoers', 'De Dukdalven', 'VV Waddenwind', 'Rode Rakkers'];
  function hash(s){ var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(zaad){ var a = zaad >>> 0; return function(){ a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function naamVoor(zaad){
    var r = rng(hash(zaad)), som = HERKOMST.reduce(function(a, x){ return a + x[0]; }, 0), x = r() * som, g = HERKOMST[0];
    for (var i = 0; i < HERKOMST.length; i++){ x -= HERKOMST[i][0]; if (x <= 0){ g = HERKOMST[i]; break; } }
    return g[1][Math.floor(r() * g[1].length)] + ' ' + g[2][Math.floor(r() * g[2].length)];
  }
  /* een speler: kwaliteit van 40 tot 90 */
  function speler(zaad, pos, kw){ return { id: (hash(zaad) % 2176782336).toString(36), naam: naamVoor(zaad), pos: pos, kw: Math.max(40, Math.min(90, Math.round(kw))), fit: 100, fitT: 0 }; }
  /* de selectie waarmee een club begint: 2 keepers, 5 verdedigers, 5 middenvelders en 4 aanvallers */
  function startSelectie(zaad, basis){
    var r = rng(hash(zaad)), uit = [], rij = [['KEE', 2], ['VER', 5], ['MID', 5], ['AAN', 4]];
    rij.forEach(function(x){ for (var i = 0; i < x[1]; i++) uit.push(speler(zaad + ':' + x[0] + i, x[0], (basis || 56) + (i < (x[0] === 'KEE' ? 1 : 3) ? 4 : -2) + Math.round((r() - 0.5) * 8))); });
    /* geen twee spelers met dezelfde voor- of achternaam in een selectie */
    var voor = {}, achter = {};
    uit.forEach(function(s, i){
      for (var k = 0; k < 20; k++){
        var d = s.naam.split(' '), v = d[0], a = d.slice(1).join(' ');
        if (!voor[v] && !achter[a]) break;
        s.naam = naamVoor(zaad + ':' + i + ':' + k);
      }
      var d2 = s.naam.split(' '); voor[d2[0]] = 1; achter[d2.slice(1).join(' ')] = 1;
    });
    return uit;
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
  var PATRONEN = [['effen', 'Effen'], ['strepen', 'Strepen'], ['baan', 'Baan'], ['helft', 'Helften']];
  var LOGOS = {
    vogel: { naam: 'Vogel', d: 'M10 23c4-7 9-9 16-9-2 3-2 5 0 7-5 0-7 2-8 6-2-3-5-4-8-4z' },
    ster: { naam: 'Ster', d: 'M20 12l2.6 5.4 5.9.8-4.3 4.1 1 5.9L20 25.4l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z' },
    kroon: { naam: 'Kroon', d: 'M11 27l1.5-11 4.5 5 3-7 3 7 4.5-5 1.5 11z' },
    golf: { naam: 'Golf', d: 'M9 20c3-3 6-3 9 0s6 3 9 0 4-2 4-2v5c-3 3-6 3-9 0s-6-3-9 0-4 2-4 2z' },
    bliksem: { naam: 'Bliksem', d: 'M23 11l-9 12h5.5l-3 11 10-14h-5.5z' },
    toren: { naam: 'Toren', d: 'M13 30V17h2.5v-3h2.5v3h4v-3h2.5v3H27v13h-5v-5h-4v5z' },
    bal: { naam: 'Bal', d: 'M20 13a8.5 8.5 0 1 0 .01 0zM20 17.5l3.3 2.4-1.3 3.9h-4l-1.3-3.9z' }
  };
  function logoOk(l){ return Object.prototype.hasOwnProperty.call(LOGOS, l) ? l : 'vogel'; }
  function helderheid(k){ var x = parseInt(String(k).slice(1), 16); return (((x >> 16) & 255) * 0.299 + ((x >> 8) & 255) * 0.587 + (x & 255) * 0.114) / 255; }
  var teller = 0;
  /* het shirt (viewBox 120 x 130), met rugnummer */
  function shirtSvg(k1, k2, patroon, maat, nr, label){
    var id = 'cbs' + (++teller), body = 'M38 10 20 18 4 42l18 12 8-10v76h60V44l8 10 18-12-16-24-18-8c-2 9-11 14-22 14S40 19 38 10z';
    var pat = patroon === 'strepen' ? '<path d="M45 0v130M60 0v130M75 0v130" stroke="' + k2 + '" stroke-width="8"/>' :
      patroon === 'baan' ? '<path d="M0 58h120v20H0z" fill="' + k2 + '"/>' :
      patroon === 'helft' ? '<path d="M60 0h60v130H60z" fill="' + k2 + '"/>' : '';
    var nrKleur = helderheid(patroon === 'helft' ? k2 : k1) > 0.55 ? '#14224C' : '#FBF6F1';
    return '<svg viewBox="0 0 120 130" width="' + maat + '" height="' + Math.round(maat * 130 / 120) + '"' + (label ? ' role="img" aria-label="' + label + '"' : ' aria-hidden="true"') + '><defs><clipPath id="' + id + '"><path d="' + body + '"/></clipPath></defs>' +
      '<path d="' + body + '" fill="' + k1 + '"/><g clip-path="url(#' + id + ')">' + pat + '</g>' +
      '<path d="' + body + '" fill="none" stroke="#14224C" stroke-width="3" stroke-linejoin="round"/>' +
      (nr ? '<text x="60" y="98" text-anchor="middle" font-family="Poppins,sans-serif" font-weight="700" font-size="30" fill="' + nrKleur + '" stroke="' + (nrKleur === '#14224C' ? 'none' : '#14224C') + '" stroke-width="1">' + nr + '</text>' : '') + '</svg>';
  }
  /* het logo: een schild (viewBox 40 x 46) */
  function logoSvg(logo, k1, k2, maat, label){
    var l = LOGOS[logoOk(logo)], teken = helderheid(k1) > 0.6 ? (k2 && helderheid(k2) < 0.6 ? k2 : '#14224C') : '#FBF6F1';
    return '<svg viewBox="0 0 40 46" width="' + maat + '" height="' + Math.round(maat * 46 / 40) + '"' + (label ? ' role="img" aria-label="' + label + '"' : ' aria-hidden="true"') + '>' +
      '<path d="M20 2 37 8v14c0 11-7 18-17 22C10 40 3 33 3 22V8z" fill="' + k1 + '" stroke="' + (k2 || '#FBF6F1') + '" stroke-width="2.5"/>' +
      '<path d="' + l.d + '" fill="' + teken + '" fill-rule="evenodd"/></svg>';
  }

  g.CLUBBAAS = { REGELS: REGELS, TRAINING: TRAINING, POS: POS, POSKLEUR: POSKLEUR, FORMATIES: FORMATIES, plekken: plekken, TACTIEK: TACTIEK, tactiek: tactiek,
    naamVoor: naamVoor, speler: speler, startSelectie: startSelectie, waarde: waarde, fitNu: fitNu, besteElf: besteElf, schema: schema, BOTCLUBS: BOTCLUBS,
    KLEUREN: KLEUREN, kleurOk: kleurOk, PATRONEN: PATRONEN, LOGOS: LOGOS, logoOk: logoOk, shirtSvg: shirtSvg, logoSvg: logoSvg, helderheid: helderheid,
    hash: hash, rng: rng, dagVan: dagVan, speeldagenRond: speeldagenRond, volgendeWedstrijd: volgendeWedstrijd, daarna: daarna };
})(typeof globalThis !== 'undefined' ? globalThis : this);
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.CLUBBAAS;
