/* Kaarttoren: de spelregels, los van het scherm.

   Een beklimming (run) van twaalf verdiepingen. Op elke verdieping wacht een
   tegenstander; op 5 en 12 een baas. Je vecht met een stapel kaarten. Aan het
   begin van elke beurt komt er een vraag: goed maakt je opgeladen (een
   energie en een kaart extra, en de opgeladen-regel op je kaarten telt mee),
   fout is een gewone beurt. Tussen de gevechten kies je een kaart uit drie,
   en onderweg kom je rustplekken, winkels en gebeurtenissen tegen.

   Alles hier is gewone data (JSON), zodat een beklimming op het apparaat
   bewaard kan worden en na herladen verder kan. Het toeval komt uit een zaadje
   (st.r), dus dezelfde torencode geeft dezelfde toren. De vragen zelf komen
   niet hier vandaan: het scherm stelt ze en geeft alleen goed of fout door.

   Gebruik (KAARTTOREN):
     nieuw(zaad, vak)            een nieuwe beklimming
     keuzes(st)                  de kamers waar je nu heen kunt [{i, kamer}]
     kiesKamer(st, i)            naar die kamer: eerst een tussenstop, dan het gevecht
     antwoord(st, goed)          de vraag aan het begin van de beurt
     speel(st, h, goed)          kaart h uit je hand; goed alleen bij een vraagkaart
     beurtKlaar(st)              je beurt is klaar, de tegenstander is aan zet
     beloning(st, k)             kaart k uit de drie, of -1 voor geen
     rust(st, 'heel' | 'beter', kaart), koop(st, i), weg(st, kaart), pleister(st), verder(st)
     gebeurtenis(st, optie, uitslagen, kaart)
     tekst(kaart, g)             de regels op een kaart, met de getallen van nu
     bot.*                       de speelbot, voor de test en de balanssimulatie
   Na elke stap staat in st.log wat er gebeurde, voor het scherm. */
(function(root){
  'use strict';
  var VK = root.KAARTTOREN_VAKKAARTEN || (typeof require === 'function' ? require('./kaarttoren-vakkaarten.js') : {});
  var VERSIE = 1, HOOG = 12, BAAS = [5, 12];
  /* De knoppen voor de balans, gezet met een simulatie van 200 beklimmingen
     per niveau (speelbot hieronder): wie 75 procent goed heeft haalt in de
     helft van de gevallen de top, wie 60 procent goed heeft komt tot ongeveer
     halverwege, en wie 90 procent goed heeft wint bijna altijd.

     Waarom de vraag zo zwaar telt: een goed antwoord geeft een energie en een
     kaart extra en laat de tegenstander schrikken (zijn klap is die beurt
     zwakker). Drie goed op rij (op dreef) en vijf goed op rij (in vuur en
     vlam) geven nog meer. Een fout is een gewone beurt, geen straf. En na elk
     gevecht puf je even uit: wie zijn gevechten met weinig schade wint, blijft
     fit; wie veel fout heeft, raakt langzaam op. */
  var B = {
    leven: 64,          /* doorzetting bij de start */
    energie: 3,         /* energie per beurt */
    trek: 5,            /* kaarten per beurt */
    slimEnergie: 1,     /* erbij na een goed antwoord */
    slimTrek: 1,
    slimZwak: 1,        /* na een goed antwoord schrikt de tegenstander: deze beurt zwak */
    dreef: 3,           /* zoveel goed op rij en je bent op dreef */
    dreefKracht: 1,     /* op dreef: elke klap doet zoveel meer */
    dreefEnergie: 1,    /* op dreef: zoveel energie extra per beurt */
    vuur: 5,            /* zoveel goed op rij en je bent in vuur en vlam */
    vuurKracht: 4,
    vuurEnergie: 3,     /* in vuur en vlam: zoveel energie erbij in plaats van die van op dreef */
    hpGroei: 0.13,      /* per verdieping meer doorzetting voor een gewone tegenstander */
    slag: 1.05,         /* hoe hard een gewone tegenstander slaat */
    slagGroei: 0.10,    /* per verdieping harder */
    rustHeel: 0.3,      /* een rustplek heelt dit deel van je doorzetting */
    baasHeel: 0.25,     /* na de eerste baas */
    naGevecht: 16,      /* herstel na elk gewonnen gevecht: even uitpuffen */
    muntGoed: 2         /* munten per goed antwoord */
  };

  /* ---------- de kaarten ----------
     Effecten: ['s', n, x] n schade (x keer), ['sl', [a, b]] losse klappen,
     ['rs', n, p] n schade plus p voor elk goed antwoord op rij, ['b', n] blok,
     ['t', n] trek, ['e', n] energie, ['k', n] kracht, ['z', n] zwak,
     ['w', n] wankel, ['h', n] herstel, ['m', n] munten, ['pb', n] elke beurt blok.
     zeld: 9 start, 0 gewoon, 1 zeldzaam, 8 rommel (alleen in een gevecht). */
  var KAARTEN = {
    prik:      { naam:'Potloodprik', kost:1, soort:'aanval', zeld:9, w:2, doe:[['s', 6]], plus:{ doe:[['s', 9]] } },
    schrift:   { naam:'Schoolschrift', kost:1, soort:'verdediging', zeld:9, w:2, doe:[['b', 5]], plus:{ doe:[['b', 8]] } },
    liniaal:   { naam:'Liniaalzwaai', kost:2, soort:'aanval', zeld:0, w:6, doe:[['s', 12]], slim:[['s', 5]], plus:{ doe:[['s', 16]] } },
    gum:       { naam:'Gumgooi', kost:0, soort:'aanval', zeld:0, w:5, doe:[['s', 3]], slim:[['s', 3]], plus:{ doe:[['s', 5]] } },
    dubbel:    { naam:'Dubbele tik', kost:1, soort:'aanval', zeld:0, w:6, doe:[['s', 4, 2]], plus:{ doe:[['s', 6, 2]] } },
    regen:     { naam:'Proppenregen', kost:1, soort:'aanval', zeld:1, w:7, doe:[['s', 2, 4]], plus:{ doe:[['s', 3, 4]] } },
    uitroep:   { naam:'Uitroepteken', kost:1, soort:'aanval', zeld:0, w:6, doe:[['s', 7], ['w', 2]], plus:{ doe:[['s', 9], ['w', 3]] } },
    sprint:    { naam:'Eindsprint', kost:2, soort:'aanval', zeld:1, w:7, doe:[['s', 18]], slim:[['s', 8]], plus:{ doe:[['s', 24]] } },
    samen:     { naam:'Samenwerken', kost:1, soort:'aanval', zeld:0, w:6, doe:[['s', 5], ['b', 5]], plus:{ doe:[['s', 7], ['b', 7]] } },
    lekker:    { naam:'Lekker bezig', kost:1, soort:'aanval', zeld:1, w:7, doe:[['rs', 3, 3]], plus:{ doe:[['rs', 6, 3]] } },
    overhoring:{ naam:'Overhoring', kost:1, soort:'aanval', zeld:0, w:6, vraag:{ goed:[['s', 14]], fout:[['s', 4]] }, plus:{ vraag:{ goed:[['s', 19]], fout:[['s', 6]] } } },
    uitblinker:{ naam:'Uitblinker', kost:1, soort:'aanval', zeld:1, w:7, alleenSlim:true, doe:[['s', 20]], plus:{ doe:[['s', 27]] } },
    rugzak:    { naam:'Volle rugzak', kost:2, soort:'verdediging', zeld:0, w:5, doe:[['b', 12]], slim:[['b', 5]], plus:{ doe:[['b', 16]] } },
    bukken:    { naam:'Bukken', kost:0, soort:'verdediging', zeld:0, w:5, doe:[['b', 3]], slim:[['b', 3]], plus:{ doe:[['b', 5]] } },
    kaft:      { naam:'Kaft om je boek', kost:1, soort:'verdediging', zeld:0, w:6, doe:[['b', 6], ['t', 1]], plus:{ doe:[['b', 8], ['t', 1]] } },
    paraplu:   { naam:'Paraplu', kost:1, soort:'verdediging', zeld:0, w:5, doe:[['b', 8]], plus:{ doe:[['b', 11]] } },
    beurt:     { naam:'Beurt krijgen', kost:1, soort:'verdediging', zeld:0, w:6, vraag:{ goed:[['b', 12], ['t', 1]], fout:[['b', 4]] }, plus:{ vraag:{ goed:[['b', 16], ['t', 1]], fout:[['b', 6]] } } },
    vertrouwen:{ naam:'Zelfvertrouwen', kost:1, soort:'speciaal', zeld:1, w:7, blijvend:true, doe:[['pb', 3]], plus:{ doe:[['pb', 5]] } },
    vinger:    { naam:'Vinger opsteken', kost:0, soort:'speciaal', zeld:0, w:5, doe:[['t', 1]], slim:[['t', 1]], plus:{ doe:[['t', 2]] } },
    pauzehap:  { naam:'Pauzehap', kost:0, soort:'speciaal', zeld:0, w:6, eenmalig:true, doe:[['e', 1], ['t', 1]], plus:{ doe:[['e', 2], ['t', 1]] } },
    oefenen:   { naam:'Oefenen baart kunst', kost:1, soort:'speciaal', zeld:1, w:8, blijvend:true, doe:[['k', 2]], plus:{ doe:[['k', 3]] } },
    blik:      { naam:'Strenge blik', kost:1, soort:'speciaal', zeld:0, w:5, doe:[['z', 2]], slim:[['w', 2]], plus:{ doe:[['z', 3], ['w', 1]] } },
    aha:       { naam:'Aha-moment', kost:0, soort:'speciaal', zeld:1, w:7, alleenSlim:true, doe:[['e', 1], ['t', 2]], plus:{ doe:[['e', 2], ['t', 2]] } },
    pleister:  { naam:'Pleister', kost:1, soort:'verdediging', zeld:0, w:5, eenmalig:true, doe:[['h', 6]], plus:{ doe:[['h', 9]] } },
    /* rommel: een tegenstander stopt hem in je stapel, na het gevecht is hij weg */
    kauwgom:   { naam:'Kauwgom', kost:1, soort:'rommel', zeld:8, w:0, eenmalig:true, doe:[], uitleg:'Plakt aan je vingers. Speel hem om hem kwijt te raken.' },
    propje:    { naam:'Propje', kost:0, soort:'rommel', zeld:8, w:0, onspeelbaar:true, doe:[], uitleg:'Neemt een plek in je hand in. Na het gevecht is hij weg.' }
  };
  /* de vakkaarten erbij, met het vak eraan vast */
  Object.keys(VK).forEach(function(vak){
    VK[vak].forEach(function(k, i){ var d = Object.assign({ vak:vak, start:i === 0 }, k); KAARTEN[k.id] = d; });
  });

  /* ---------- de tegenstanders ----------
     Een beurt van een tegenstander: a schade (x keer), b blok, k kracht,
     z maakt jou zwak, w maakt jou wankel, r stopt rommel in je stapel,
     h herstelt. Ze doen om de beurt wat in hun patroon staat. */
  var VIJANDEN = {
    prop:      { naam:'De Prop', hp:41, patroon:[{ a:13 }, { a:8, x:2 }, { b:6, a:6 }], op:'rolt weg en geeft op' },
    kauwgom:   { naam:'Het Kauwgompje', hp:36, patroon:[{ r:1, a:6, rk:'kauwgom' }, { a:13 }, { a:11 }], op:'knapt als een bel en geeft op' },
    gum:       { naam:'De Gum', hp:48, patroon:[{ b:8 }, { a:19 }, { a:10 }], op:'is helemaal op en geeft op' },
    slijper:   { naam:'De Puntenslijper', hp:38, patroon:[{ k:2 }, { a:10 }, { a:10 }], op:'raakt bot en geeft op' },
    paperclip: { naam:'De Paperclip', hp:43, patroon:[{ a:6, x:3 }, { b:5 }, { a:15 }], op:'buigt recht en geeft op' },
    spiek:     { naam:'Het Spiekbriefje', hp:34, patroon:[{ z:2 }, { a:15 }, { a:13 }], op:'waait weg en geeft op' },
    bel:       { naam:'De Schoolbel', hp:46, patroon:[{ b:4 }, { a:22 }], op:'is uitgerinkeld en geeft op' },
    klodder:   { naam:'Het Klodderspatje', hp:38, patroon:[{ w:2, a:6 }, { a:11 }, { a:8, x:2 }], op:'droogt op en geeft op' },
    /* lastpakken: sterker, en daarom meer munten en een zeldzame kaart */
    klok:      { naam:'De Klok', hp:86, lastpak:true, patroon:[{ a:11 }, { a:15 }, { a:19 }, { b:10, k:1 }], op:'loopt af en geeft op' },
    zwerm:     { naam:'De Zwerm', hp:74, lastpak:true, patroon:[{ a:3, x:4 }, { b:8 }, { a:3, x:4 }], op:'vliegt alle kanten op en geeft op' },
    huiswerk:  { naam:'Het Vergeten Huiswerk', hp:94, lastpak:true, patroon:[{ r:2 }, { a:21 }, { b:9, a:10 }], op:'wordt eindelijk ingeleverd en geeft op' },
    /* de bazen */
    inktvlek:  { naam:'De Inktvlek', hp:190, baas:true, patroon:[{ w:2, a:9 }, { a:20 }, { b:12, k:2 }, { a:7, x:3 }], op:'wordt opgedept en geeft op' },
    reuzenprop:{ naam:'De Reuzenprop', hp:202, baas:true, patroon:[{ a:11, x:2 }, { r:2, b:10 }, { a:25 }, { b:14 }], op:'valt uit elkaar in kleine propjes en geeft op' },
    rodepen:   { naam:'De Rode Pen', hp:266, baas:true, boos:2, patroon:[{ a:20 }, { z:2, b:10 }, { a:4, x:5 }, { k:2 }, { a:28 }], op:'is leeg en geeft zich gewonnen' },
    grotefout: { naam:'De Grote Fout', hp:285, baas:true, boos:2, patroon:[{ a:15 }, { r:2, a:7 }, { a:7, x:3 }, { b:15, k:2 }], op:'wordt verbeterd en geeft zich gewonnen' }
  };
  var GEWOON = ['prop', 'kauwgom', 'gum', 'slijper', 'paperclip', 'spiek', 'bel', 'klodder'];
  var LASTPAK = ['klok', 'zwerm', 'huiswerk'];
  var BAZEN = { 5:['inktvlek', 'reuzenprop'], 12:['rodepen', 'grotefout'] };

  /* ---------- gebeurtenissen ---------- */
  var GEBEURTENISSEN = [
    { id:'concierge', titel:'De conciërge', tekst:'Bij de trap staat de conciërge. Hij heeft een vraag voor je, en een zakje munten voor wie het weet.',
      opties:[{ t:'Beantwoord zijn vraag', vragen:1, goed:{ m:35 }, fout:{ m:10 } }, { t:'Groet en loop door' }] },
    { id:'bieb', titel:'De bibliotheek', tekst:'Tussen de boeken ligt een oefentoets. Maak je hem goed, dan worden twee kaarten beter.',
      opties:[{ t:'Maak de oefentoets', vragen:1, goed:{ beter:2 }, fout:{ beter:1 } }, { t:'Even zitten in de leeshoek', h:8 }] },
    { id:'boterham', titel:'Een extra boterham', tekst:'Onder in je tas zit nog een boterham met kaas.',
      opties:[{ t:'Eet hem meteen op: herstel 15', h:15 }, { t:'Eet hem rustig op: 5 meer doorzetting voor de rest van de klim', max:5 }] },
    { id:'kluisje', titel:'Je kluisje', tekst:'Je kluisje puilt uit. Opruimen?',
      opties:[{ t:'Gooi een kaart uit je stapel weg', weg:1 }, { t:'Zoek in de hoekjes: 20 munten', m:20 }] },
    { id:'quiz', titel:'De quizmaster', tekst:'In de aula is een quiz. Drie vragen, en elke goede is 15 munten waard.',
      opties:[{ t:'Doe mee', vragen:3, perGoed:{ m:15 } }, { t:'Liever niet' }] },
    { id:'ruilen', titel:'Kaartjes ruilen', tekst:'Een klasgenoot wil ruilen: jouw zwakste kaart tegen een willekeurige kaart van hem.',
      opties:[{ t:'Ruilen', ruil:1 }, { t:'Niet ruilen' }] },
    { id:'mentor', titel:'Je mentor', tekst:'Je mentor vraagt hoe het gaat, en stelt je een vraag over de stof.',
      opties:[{ t:'Beantwoord de vraag', vragen:1, goed:{ h:20 }, fout:{ h:8 } }, { t:'Zeg dat het goed gaat: herstel 6', h:6 }] }
  ];

  /* ---------- toeval uit een zaadje ---------- */
  function kans(st){
    st.r = (st.r + 0x6D2B79F5) | 0;
    var t = st.r;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function rnd(st, n){ return Math.floor(kans(st) * n); }
  function kies(st, a){ return a[rnd(st, a.length)]; }
  function schud(st, a){ for (var i = a.length - 1; i > 0; i--){ var j = rnd(st, i + 1), h = a[i]; a[i] = a[j]; a[j] = h; } return a; }
  /* een torencode is vier letters; die worden het zaadje */
  var LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  function code(){ var c = ''; for (var i = 0; i < 4; i++) c += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length)); return c; }
  function zaadVan(c){ c = String(c || '').toUpperCase(); var h = 2166136261; for (var i = 0; i < c.length; i++){ h ^= c.charCodeAt(i); h = Math.imul(h, 16777619); } return h | 0; }

  /* ---------- een kaart ---------- */
  function def(k){ return KAARTEN[k.id] || KAARTEN.prik; }
  /* wat een kaart doet, met de verbetering erin */
  function effect(k){
    var d = def(k), p = k.p ? (d.plus || {}) : {};
    return { naam:d.naam + (k.p ? '+' : ''), kost:p.kost !== undefined ? p.kost : d.kost, soort:d.soort, doe:p.doe || d.doe || [],
             slim:p.slim || d.slim || null, vraag:p.vraag || d.vraag || null, alleenSlim:!!d.alleenSlim,
             eenmalig:!!d.eenmalig, blijvend:!!d.blijvend, onspeelbaar:!!d.onspeelbaar, vak:d.vak || '', zeld:d.zeld, w:d.w || 0 };
  }
  function nieuweKaart(st, id, p){ st.uid = (st.uid || 0) + 1; return { id:id, p:p ? 1 : 0, u:st.uid }; }

  /* ---------- een nieuwe beklimming ---------- */
  function nieuw(torencode, vak){
    torencode = torencode || code();
    var st = { v:VERSIE, code:torencode, r:zaadVan(torencode), vak:vak || 'reken', hp:B.leven, max:B.leven, munten:0,
      stapel:[], rij:-1, kol:-1, pad:[], fase:'kaart', stop:null, g:null, bel:null, log:[],
      goed:0, fout:0, reeks:0, besteReeks:0, verdiepingen:0, gewonnen:false, klaar:false, weggehaald:0, beurten:0, uid:0 };
    var i;
    for (i = 0; i < 5; i++) st.stapel.push(nieuweKaart(st, 'prik'));
    for (i = 0; i < 4; i++) st.stapel.push(nieuweKaart(st, 'schrift'));
    var start = (VK[vak] || VK.eigen)[0];
    st.stapel.push(nieuweKaart(st, start.id));
    st.kaart = maakKaart(st);
    return st;
  }

  /* ---------- de kaart van de toren ----------
     Twaalf rijen van drie kamers; op 5 en 12 alleen de baas. Elke kamer heeft
     een tegenstander en soms eerst een tussenstop (rust, winkel of een
     gebeurtenis). Je gaat steeds een rij omhoog, naar een kamer die met de
     jouwe verbonden is. */
  function maakKaart(st){
    var rijen = [];
    for (var r = 0; r < HOOG; r++){
      var f = r + 1;
      if (BAAS.indexOf(f) >= 0){ rijen.push([{ f:f, c:1, soort:'baas', vijand:kies(st, BAZEN[f]), stop:null, naar:[] }]); continue; }
      var pot = schud(st, GEWOON.slice()), rij = [];
      for (var c = 0; c < 3; c++) rij.push({ f:f, c:c, soort:'gewoon', vijand:pot[c], stop:null, naar:[] });
      /* een lastpak vanaf de derde verdieping, hoogstens een per rij */
      if (f >= 3 && kans(st) < (f === 3 ? 0.4 : 0.55)){ var l = rij[rnd(st, 3)]; l.soort = 'lastpak'; l.vijand = kies(st, LASTPAK); }
      if (f >= 2) rij.forEach(function(k){
        if (kans(st) < 0.4){ var x = kans(st); k.stop = x < 0.3 ? 'rust' : x < 0.6 ? 'winkel' : 'gebeurtenis'; }
      });
      /* voor een baas altijd een rustplek in de rij, na de eerste baas een winkel */
      function zeker(soort){ if (!rij.some(function(k){ return k.stop === soort; })){ var k = rij[rnd(st, 3)]; k.stop = soort; } }
      if (f === 4 || f === 11) zeker('rust');
      if (f === 6) zeker('winkel');
      if (f === 3 || f === 8) zeker('gebeurtenis');
      rijen.push(rij);
    }
    /* de gangen tussen de rijen: recht omhoog, en soms schuin, zonder kruisingen */
    for (var q = 0; q < HOOG - 1; q++){
      var nu = rijen[q], erna = rijen[q + 1];
      if (erna.length === 1){ nu.forEach(function(k){ k.naar = [0]; }); continue; }
      if (nu.length === 1){ nu[0].naar = [0, 1, 2]; continue; }
      nu.forEach(function(k, i){ k.naar = [i]; });
      [0, 1].forEach(function(a){
        var x = kans(st);
        if (x < 0.35) nu[a].naar.push(a + 1);
        else if (x < 0.7) nu[a + 1].naar.push(a);
      });
      nu.forEach(function(k){ k.naar.sort(); });
    }
    return rijen;
  }
  function kamer(st){ return st.rij >= 0 ? st.kaart[st.rij][st.kol] : null; }
  function keuzes(st){
    if (st.fase !== 'kaart') return [];
    if (st.rij >= HOOG - 1) return [];
    var idx = st.rij < 0 ? st.kaart[0].map(function(k, i){ return i; }) : kamer(st).naar;
    return idx.map(function(i){ return { i:i, kamer:st.kaart[st.rij + 1][i] }; });
  }
  function kiesKamer(st, i){
    st.log = [];
    if (st.fase !== 'kaart') return false;
    if (!keuzes(st).some(function(k){ return k.i === i; })) return false;
    st.rij++; st.kol = i; st.pad.push(i);
    var k = kamer(st);
    if (k.stop) openStop(st, k.stop); else startGevecht(st);
    return true;
  }

  /* ---------- tussenstops ---------- */
  function poolKaarten(st, zeld){
    var uit = [];
    Object.keys(KAARTEN).forEach(function(id){
      var d = KAARTEN[id];
      if (d.zeld !== zeld) return;
      if (d.vak && d.vak !== st.vak) return;
      if (d.vak && d.start) return;
      uit.push(id);
    });
    return uit;
  }
  function vakPool(st, zeld){ return poolKaarten(st, zeld).filter(function(id){ return KAARTEN[id].vak; }); }
  function algPool(st, zeld){ return poolKaarten(st, zeld).filter(function(id){ return !KAARTEN[id].vak; }); }
  /* drie verschillende kaarten om uit te kiezen; bij een lastpak of baas zit er zeker een zeldzame bij */
  function trekOpties(st, n, zeker){
    var uit = [];
    for (var p = 0; uit.length < n && p < 40; p++){
      var zeld = (zeker && !uit.length) ? 1 : (kans(st) < 0.22 ? 1 : 0);
      var vak = kans(st) < 0.38;
      var pool = vak ? vakPool(st, zeld) : algPool(st, zeld);
      if (!pool.length) pool = algPool(st, zeld);
      var id = kies(st, pool);
      if (uit.indexOf(id) < 0) uit.push(id);
    }
    return uit;
  }
  function prijsVan(id){ var d = KAARTEN[id]; return (d.zeld === 1 ? 72 : 44) + (d.vak ? 6 : 0); }
  function openStop(st, soort){
    st.fase = 'stop';
    if (soort === 'rust') st.stop = { soort:'rust' };
    else if (soort === 'winkel'){
      var waren = trekOpties(st, 2, false).concat(trekOpties(st, 1, true));
      var extra = vakPool(st, 0).filter(function(id){ return waren.indexOf(id) < 0; });
      if (extra.length) waren.push(kies(st, extra));
      st.stop = { soort:'winkel', waren:waren.map(function(id){ return { id:id, prijs:prijsVan(id) - 4 + rnd(st, 9), weg:false }; }),
                  wegPrijs:50 + 25 * st.weggehaald, wegGedaan:false, pleister:{ prijs:30, weg:false, h:15 } };
    } else {
      st.stop = { soort:'gebeurtenis', id:kies(st, GEBEURTENISSEN).id };
    }
  }
  function verder(st){ st.log = []; if (st.fase !== 'stop') return false; st.stop = null; startGevecht(st); return true; }
  function heel(st, n){ var voor = st.hp; st.hp = Math.min(st.max, st.hp + n); st.log.push({ t:'heel', n:st.hp - voor }); }
  function beter(st, kaartIdx){
    var k = st.stapel[kaartIdx];
    if (!k || k.p || !KAARTEN[k.id].plus) return false;
    k.p = 1; st.log.push({ t:'beter', id:k.id }); return true;
  }
  function rust(st, wat, kaartIdx){
    st.log = [];
    if (st.fase !== 'stop' || !st.stop || st.stop.soort !== 'rust') return false;
    if (wat === 'heel') heel(st, Math.round(st.max * B.rustHeel));
    else if (!beter(st, kaartIdx)) return false;
    return verder(st) || true;
  }
  function koop(st, i){
    st.log = [];
    var w = st.stop && st.stop.soort === 'winkel' ? st.stop.waren[i] : null;
    if (!w || w.weg || st.munten < w.prijs) return false;
    st.munten -= w.prijs; w.weg = true; st.stapel.push(nieuweKaart(st, w.id)); st.log.push({ t:'erbij', id:w.id });
    return true;
  }
  function pleister(st){
    st.log = [];
    var p = st.stop && st.stop.soort === 'winkel' ? st.stop.pleister : null;
    if (!p || p.weg || st.munten < p.prijs || st.hp >= st.max) return false;
    st.munten -= p.prijs; p.weg = true; heel(st, p.h); return true;
  }
  function weg(st, kaartIdx){
    st.log = [];
    var s = st.stop;
    if (!s || s.soort !== 'winkel' || s.wegGedaan || st.munten < s.wegPrijs || st.stapel.length <= 5 || !st.stapel[kaartIdx]) return false;
    st.munten -= s.wegPrijs; s.wegGedaan = true; st.weggehaald++;
    st.log.push({ t:'weg', id:st.stapel[kaartIdx].id }); st.stapel.splice(kaartIdx, 1);
    return true;
  }
  function gebeurtenisDef(st){ var id = st.stop && st.stop.id; return GEBEURTENISSEN.filter(function(g){ return g.id === id; })[0] || null; }
  /* uitslagen: goed of fout per gestelde vraag; kaart: de gekozen kaart bij weggooien */
  function gebeurtenis(st, o, uitslagen, kaartIdx){
    st.log = [];
    var gb = gebeurtenisDef(st); if (!gb || st.fase !== 'stop') return false;
    var opt = gb.opties[o]; if (!opt) return false;
    uitslagen = uitslagen || [];
    if (opt.vragen && uitslagen.length < opt.vragen) return false;
    function pas(x){
      if (!x) return;
      if (x.m){ st.munten += x.m; st.log.push({ t:'munt', n:x.m }); }
      if (x.h) heel(st, x.h);
      if (x.max){ st.max += x.max; st.hp += x.max; st.log.push({ t:'max', n:x.max }); }
      if (x.beter){
        var kan = st.stapel.map(function(k, i){ return i; }).filter(function(i){ return !st.stapel[i].p && KAARTEN[st.stapel[i].id].plus; });
        schud(st, kan).slice(0, x.beter).forEach(function(i){ beter(st, i); });
      }
    }
    if (opt.vragen){
      uitslagen.slice(0, opt.vragen).forEach(function(g){ tel(st, g); if (opt.perGoed && g) pas(opt.perGoed); });
      if (opt.goed || opt.fout) pas(uitslagen[0] ? opt.goed : opt.fout);
    } else pas(opt);
    if (opt.weg){
      if (!st.stapel[kaartIdx] || st.stapel.length <= 5) return false;
      st.log.push({ t:'weg', id:st.stapel[kaartIdx].id }); st.stapel.splice(kaartIdx, 1);
    }
    if (opt.ruil){
      var z = zwakste(st);
      if (z >= 0){
        var oud = st.stapel[z].id, pool = algPool(st, 0).concat(vakPool(st, 0)), nieuwId = kies(st, pool);
        st.stapel.splice(z, 1, nieuweKaart(st, nieuwId));
        st.log.push({ t:'ruil', van:oud, id:nieuwId });
      }
    }
    return verder(st) || true;
  }
  function zwakste(st){
    var b = -1, bw = 99;
    st.stapel.forEach(function(k, i){ var w = (KAARTEN[k.id].w || 0) + (k.p ? 2 : 0); if (w < bw){ bw = w; b = i; } });
    return b;
  }
  /* een antwoord telt mee voor de reeks en de munten, ook buiten een gevecht */
  function tel(st, goed){
    if (goed){ st.goed++; st.reeks++; st.besteReeks = Math.max(st.besteReeks, st.reeks); st.munten += B.muntGoed; }
    else { st.fout++; st.reeks = 0; }
    /* op dreef: drie goed op rij en elke klap doet meer, tot je een fout maakt */
    if (st.g){
      var was = st.g.dreef || 0;
      st.g.dreef = dreefVan(st.reeks);
      if (st.g.dreef > was) st.log.push({ t:'dreef', n:st.g.dreef, vuur:st.reeks >= B.vuur });
    }
  }

  function dreefVan(r){ return r >= B.vuur ? B.vuurKracht : r >= B.dreef ? B.dreefKracht : 0; }

  /* ---------- het gevecht ---------- */
  function schaal(st, d){
    var f = kamer(st).f;
    return d.baas ? { hp:1, slag:1 } : { hp:1 + B.hpGroei * (f - 1), slag:B.slag * (1 + B.slagGroei * (f - 1)) };
  }
  function startGevecht(st){
    var k = kamer(st), d = VIJANDEN[k.vijand], s = schaal(st, d);
    var hp = Math.round(d.hp * s.hp);
    var trek = schud(st, st.stapel.map(function(c){ return { id:c.id, p:c.p, u:c.u }; }));
    st.g = { v:{ id:k.vijand, naam:d.naam, hp:hp, max:hp, blok:0, kracht:0, zwak:0, wankel:0, i:d.baas ? 0 : rnd(st, d.patroon.length), slag:s.slag, boos:false, plan:null },
             hand:[], trek:trek, af:[], weg:[], energie:0, blok:0, kracht:0, zwak:0, wankel:0, pb:0, slim:false, beurt:0, fase:'vraag',
             dreef:dreefVan(st.reeks) };
    st.fase = 'gevecht';
    plan(st);
    st.g.beurt = 1;
    st.log.push({ t:'gevecht', id:k.vijand });
  }
  /* wat de tegenstander deze beurt van plan is, met zijn kracht erin */
  function plan(st){
    var v = st.g.v, d = VIJANDEN[v.id], p = d.patroon[v.i % d.patroon.length], s = v.slag, uit = {};
    Object.keys(p).forEach(function(x){
      if (x === 'rk') uit.rk = p.rk;
      else uit[x] = (x === 'a' || x === 'b') ? Math.round(p[x] * s) : p[x];
    });
    v.plan = uit;
  }
  function trekKaarten(st, n){
    var g = st.g;
    for (var i = 0; i < n; i++){
      if (g.hand.length >= 10) return;
      if (!g.trek.length){
        if (!g.af.length) return;
        g.trek = schud(st, g.af); g.af = [];
        st.log.push({ t:'schud' });
      }
      g.hand.push(g.trek.pop());
    }
  }
  function antwoord(st, goed){
    st.log = [];
    var g = st.g;
    if (!g || g.fase !== 'vraag') return false;
    tel(st, goed);
    st.beurten++;
    g.slim = !!goed;
    if (goed && B.slimZwak){ g.v.zwak += B.slimZwak; st.log.push({ t:'zwak', op:'v', n:B.slimZwak, schrik:true }); }
    g.energie = B.energie + (goed ? B.slimEnergie : 0) + (!goed ? 0 : st.reeks >= B.vuur ? B.vuurEnergie : st.reeks >= B.dreef ? B.dreefEnergie : 0);
    trekKaarten(st, B.trek + (goed ? B.slimTrek : 0));
    g.fase = 'spelen';
    st.log.push({ t:goed ? 'slim' : 'gewoon' });
    return true;
  }
  /* schade van de speler op de tegenstander, of andersom */
  function klap(n, van, op){
    n = Math.max(0, n + (van.kracht || 0) + (van.dreef || 0));
    if (van.zwak > 0) n = Math.floor(n * 0.75);
    if (op.wankel > 0) n = Math.floor(n * 1.5);
    return n;
  }
  function raak(st, doel, n){
    var afgevangen = Math.min(doel.blok, n);
    doel.blok -= afgevangen;
    var echt = n - afgevangen;
    if (doel === st.g.v) doel.hp = Math.max(0, doel.hp - echt);
    else st.hp = Math.max(0, st.hp - echt);
    st.log.push({ t:'raak', op:doel === st.g.v ? 'v' : 'j', n:echt, blok:afgevangen });
  }
  function doeEffecten(st, lijst){
    var g = st.g, v = g.v;
    (lijst || []).forEach(function(e){
      var n = e[1];
      switch (e[0]){
        case 's': for (var x = 0; x < (e[2] || 1) && v.hp > 0; x++) raak(st, v, klap(n, g, v)); break;
        case 'sl': n.forEach(function(m){ if (v.hp > 0) raak(st, v, klap(m, g, v)); }); break;
        case 'rs': raak(st, v, klap(n + e[2] * Math.min(st.reeks, 8), g, v)); break;
        case 'b': g.blok += n; st.log.push({ t:'blok', op:'j', n:n }); break;
        case 't': trekKaarten(st, n); break;
        case 'e': g.energie += n; break;
        case 'k': g.kracht += n; st.log.push({ t:'kracht', op:'j', n:n }); break;
        case 'z': v.zwak += n; st.log.push({ t:'zwak', op:'v', n:n }); break;
        case 'w': v.wankel += n; st.log.push({ t:'wankel', op:'v', n:n }); break;
        case 'h': heel(st, n); break;
        case 'm': st.munten += n; st.log.push({ t:'munt', n:n }); break;
        case 'pb': g.pb += n; g.blok += n; st.log.push({ t:'blok', op:'j', n:n }); break;
      }
    });
  }
  /* kan deze kaart nu? geeft een reden als het niet kan */
  function magSpelen(st, h){
    var g = st.g; if (!g || g.fase !== 'spelen') return 'niet nu';
    var k = g.hand[h]; if (!k) return 'geen kaart';
    var e = effect(k);
    if (e.onspeelbaar) return 'Deze kaart kun je niet spelen.';
    if (e.alleenSlim && !g.slim) return 'Werkt alleen na een goed antwoord.';
    if (e.kost > g.energie) return 'Te weinig energie.';
    return '';
  }
  function speel(st, h, goed){
    st.log = [];
    if (magSpelen(st, h)) return false;
    var g = st.g, k = g.hand[h], e = effect(k);
    if (e.vraag && goed === undefined) return false;
    g.energie -= e.kost;
    g.hand.splice(h, 1);
    st.log.push({ t:'speel', id:k.id, p:k.p });
    if (e.vraag){ tel(st, !!goed); doeEffecten(st, goed ? e.vraag.goed : e.vraag.fout); }
    else {
      doeEffecten(st, e.doe);
      if (g.slim && e.slim) doeEffecten(st, e.slim);
    }
    if (e.eenmalig || e.blijvend) g.weg.push(k); else g.af.push(k);
    if (g.v.hp <= 0) gewonnen(st);
    return true;
  }
  function beurtKlaar(st){
    st.log = [];
    var g = st.g; if (!g || g.fase !== 'spelen') return false;
    g.af = g.af.concat(g.hand); g.hand = [];
    if (g.zwak > 0) g.zwak--;
    if (g.v.wankel > 0) g.v.wankel--;
    /* de tegenstander */
    var v = g.v, p = v.plan || {};
    v.blok = 0;
    if (p.a){ for (var x = 0; x < (p.x || 1) && st.hp > 0; x++) raak(st, g, klap(p.a, v, g)); }
    if (p.b){ v.blok += p.b; st.log.push({ t:'blok', op:'v', n:p.b }); }
    if (p.k){ v.kracht += p.k; st.log.push({ t:'kracht', op:'v', n:p.k }); }
    if (p.z){ g.zwak += p.z; st.log.push({ t:'zwak', op:'j', n:p.z }); }
    if (p.w){ g.wankel += p.w; st.log.push({ t:'wankel', op:'j', n:p.w }); }
    if (p.r){ for (var r = 0; r < p.r; r++) g.af.push(nieuweKaart(st, p.rk || 'propje')); st.log.push({ t:'rommel', n:p.r, id:p.rk || 'propje' }); }
    if (p.h){ v.hp = Math.min(v.max, v.hp + p.h); }
    if (v.zwak > 0) v.zwak--;
    if (g.wankel > 0) g.wankel--;
    if (st.hp <= 0){ verloren(st); return true; }
    /* een baas die onder de helft komt wordt boos: meer kracht */
    var d = VIJANDEN[v.id];
    if (d.boos && !v.boos && v.hp <= v.max / 2){ v.boos = true; v.kracht += d.boos; st.log.push({ t:'boos', n:d.boos }); }
    v.i++; plan(st);
    /* een nieuwe beurt: het blok is weg, blijvend blok komt terug */
    g.beurt++; g.blok = g.pb; g.slim = false; g.energie = 0; g.fase = 'vraag';
    if (g.pb) st.log.push({ t:'blok', op:'j', n:g.pb });
    return true;
  }
  function gewonnen(st){
    var k = kamer(st), d = VIJANDEN[st.g.v.id];
    st.g.fase = 'klaar';
    st.verdiepingen = k.f;
    st.log.push({ t:'op', id:st.g.v.id });
    var m = d.baas ? 50 : d.lastpak ? 30 + rnd(st, 11) : 12 + rnd(st, 8);
    st.munten += m;
    if (k.f === HOOG){ st.gewonnen = true; einde(st); return; }
    if (d.baas) heel(st, Math.round(st.max * B.baasHeel));
    else if (B.naGevecht) heel(st, B.naGevecht);
    st.bel = { munten:m, opties:trekOpties(st, 3, d.baas || d.lastpak), soort:k.soort };
    st.fase = 'beloning';
  }
  function verloren(st){ st.g.fase = 'klaar'; st.log.push({ t:'uitgeteld' }); einde(st); }
  function einde(st){ st.fase = 'einde'; st.klaar = true; }
  function beloning(st, k){
    st.log = [];
    if (st.fase !== 'beloning') return false;
    if (k >= 0 && st.bel.opties[k]){ st.stapel.push(nieuweKaart(st, st.bel.opties[k])); st.log.push({ t:'erbij', id:st.bel.opties[k] }); }
    st.bel = null; st.g = null; st.fase = 'kaart';
    return true;
  }
  /* de score: verdiepingen tellen het zwaarst, dan goede antwoorden, en wie wint ook zijn doorzetting */
  function punten(st){ return st.verdiepingen * 100 + st.goed * 10 + (st.gewonnen ? st.hp * 5 : 0); }

  /* ---------- de tekst op een kaart ---------- */
  function effTekst(e, g, plus){
    var n = e[1], t;
    function sch(m){ return g ? klap(m, g, g.v) : m; }
    switch (e[0]){
      case 's': t = (plus ? '+' + n : sch(n)) + ' schade' + (e[2] > 1 ? ', ' + e[2] + ' keer' : ''); break;
      case 'sl': t = n.map(sch).join(' + ') + ' schade'; break;
      case 'rs': t = sch(n) + ' schade, +' + e[2] + ' per goed antwoord op rij' + (g ? ' (nu ' + sch(n + e[2] * Math.min(g.reeks || 0, 8)) + ')' : ''); break;
      case 'b': t = (plus ? '+' : '') + n + ' blok'; break;
      case 't': t = (plus ? '+' : '') + 'trek ' + n + (n === 1 ? ' kaart' : ' kaarten'); break;
      case 'e': t = '+' + n + ' energie'; break;
      case 'k': t = '+' + n + ' kracht'; break;
      case 'z': t = 'maak zwak (' + n + ')'; break;
      case 'w': t = 'maak wankel (' + n + ')'; break;
      case 'h': t = 'herstel ' + n; break;
      case 'm': t = '+' + n + ' munten'; break;
      case 'pb': t = 'elke beurt ' + n + ' blok'; break;
      default: t = '';
    }
    return t;
  }
  function zin(lijst, g, plus){ var t = (lijst || []).map(function(e){ return effTekst(e, g, plus); }).filter(Boolean).join(', '); return t ? t.charAt(0).toUpperCase() + t.slice(1) : ''; }
  /* g mag leeg zijn (buiten een gevecht); reeks voor Op dreef */
  function tekst(k, g, reeks){
    var e = effect(k), d = def(k), gg = g ? Object.assign({}, g, { reeks:reeks || 0 }) : null;
    return {
      naam:e.naam, kost:e.kost, soort:e.soort, vak:e.vak, zeld:e.zeld, fig:d.fig || '', bij:d.bij || '',
      eerst: e.alleenSlim ? 'Alleen na een goed antwoord.' : e.vraag ? 'Extra vraag.' : '',
      doe: d.uitleg || zin(e.doe, gg),
      slim: e.slim ? zin(e.slim, gg, true) : '',
      goed: e.vraag ? zin(e.vraag.goed, gg) : '', fout: e.vraag ? zin(e.vraag.fout, gg) : '',
      na: e.blijvend ? 'Blijft dit gevecht.' : e.eenmalig ? 'Eenmalig per gevecht.' : '',
      kanBeter: !k.p && !!d.plus
    };
  }
  /* wat de tegenstander van plan is, in woorden en als soort voor het plaatje */
  function planTekst(st){
    var g = st.g; if (!g) return null;
    var v = g.v, p = v.plan || {}, delen = [], soort = 'anders', dmg = 0;
    if (p.a){ dmg = klap(p.a, v, g); delen.push((p.x > 1 ? dmg + ' × ' + p.x : dmg) + ' schade'); soort = 'aanval'; }
    if (p.b){ delen.push(p.b + ' blok'); if (!p.a) soort = 'blok'; }
    if (p.k){ delen.push('+' + p.k + ' kracht'); if (!p.a) soort = 'kracht'; }
    if (p.z){ delen.push('maakt je zwak'); if (!p.a) soort = 'raar'; }
    if (p.w){ delen.push('maakt je wankel'); if (!p.a) soort = 'raar'; }
    if (p.r){ delen.push((p.r === 1 ? 'een ' : p.r + ' ') + (p.rk === 'kauwgom' ? 'kauwgom' : (p.r === 1 ? 'propje' : 'propjes')) + ' in je stapel'); if (!p.a) soort = 'raar'; }
    return { tekst:delen.join(', '), soort:soort, schade:dmg * (p.x || 1) };
  }

  /* ---------- de speelbot ----------
     Speelt zoals een redelijke leerling: eerst gratis kaarten die iets
     opleveren, dan genoeg blok voor wat eraan komt, en de rest in aanvallen;
     kan hij de tegenstander deze beurt uitschakelen, dan valt hij aan. Hij
     wordt gebruikt voor de balanssimulatie en voor de test in de browser.
     p: de kans dat hij een vraag goed heeft, voor wat een vraagkaart oplevert. */
  var bot = {};
  function inkomend(st){
    var g = st.g, p = g.v.plan || {};
    return p.a ? klap(p.a, g.v, g) * (p.x || 1) : 0;
  }
  function waardeKaart(st, k, p){
    var g = st.g, e = effect(k), v = g.v;
    var lijst = e.vraag ? null : e.doe.concat(g.slim && e.slim ? e.slim : []);
    var dmg = 0, blk = 0, rest = 0;
    function tel2(l, f){
      (l || []).forEach(function(x){
        var n = x[1];
        if (x[0] === 's') dmg += f * klap(n, g, v) * (x[2] || 1);
        else if (x[0] === 'sl') n.forEach(function(m){ dmg += f * klap(m, g, v); });
        else if (x[0] === 'rs') dmg += f * klap(n + x[2] * Math.min(st.reeks, 8), g, v);
        else if (x[0] === 'b') blk += f * n;
        else if (x[0] === 't') rest += f * n * 4;
        else if (x[0] === 'e') rest += f * n * 7;
        else if (x[0] === 'k') rest += f * n * 5 * Math.max(1, 5 - g.beurt);
        else if (x[0] === 'pb'){ blk += f * n; rest += f * n * 3 * Math.max(1, 5 - g.beurt); }
        else if (x[0] === 'z') rest += f * (inkomend(st) > 0 ? n * 3 : n);
        else if (x[0] === 'w') rest += f * n * 3;
        else if (x[0] === 'h') rest += f * Math.min(n, st.max - st.hp) * 1.2;
        else if (x[0] === 'm') rest += f * n * 0.3;
      });
    }
    if (e.vraag){ tel2(e.vraag.goed, p); tel2(e.vraag.fout, 1 - p); }
    else tel2(lijst, 1);
    return { dmg:dmg, blk:blk, rest:rest, kost:e.kost };
  }
  /* geeft de index van de kaart die hij speelt, of -1 voor Beurt klaar */
  bot.speel = function(st, p){
    var g = st.g; if (!g || g.fase !== 'spelen') return -1;
    var nodig = Math.max(0, inkomend(st) - g.blok), leven = g.v.hp + g.v.blok;
    var kan = g.hand.map(function(k, i){ return i; }).filter(function(i){ return !magSpelen(st, i); });
    if (!kan.length) return -1;
    var w = {}; kan.forEach(function(i){ w[i] = waardeKaart(st, g.hand[i], p); });
    /* uitschakelen kan: de hardste klap per energie */
    var totaal = 0, en = g.energie;
    kan.slice().sort(function(a, b){ return w[b].dmg / Math.max(0.5, w[b].kost) - w[a].dmg / Math.max(0.5, w[a].kost); })
      .forEach(function(i){ if (w[i].kost <= en && w[i].dmg > 0){ en -= w[i].kost; totaal += w[i].dmg; } });
    if (totaal >= leven){
      var hard = kan.filter(function(i){ return w[i].dmg > 0; }).sort(function(a, b){ return w[b].dmg - w[a].dmg; });
      if (hard.length) return hard[0];
    }
    var beste = -1, bs = 0.5;
    kan.forEach(function(i){
      var x = w[i], d = def(g.hand[i]);
      var s = x.dmg + Math.min(x.blk, nodig) * 1.35 + Math.max(0, x.blk - nodig) * 0.12 + x.rest;
      if (d.soort === 'rommel') s = 0.6;
      s = s / (x.kost === 0 ? 0.5 : x.kost);
      if (s > bs){ bs = s; beste = i; }
    });
    return beste;
  };
  bot.kaartWaarde = function(st, id){
    var d = KAARTEN[id]; var w = d.w || 0;
    var n = st.stapel.length;
    var aanv = st.stapel.filter(function(k){ return KAARTEN[k.id].soort === 'aanval'; }).length;
    if (d.soort === 'aanval' && aanv < n * 0.4) w += 1;
    if (d.soort === 'verdediging' && aanv > n * 0.6) w += 1;
    return w;
  };
  bot.beloning = function(st){
    var o = st.bel.opties, b = -1, bw = 0;
    o.forEach(function(id, i){ var w = bot.kaartWaarde(st, id); if (w > bw){ bw = w; b = i; } });
    if (st.stapel.length >= 22 && bw < 7) return -1;
    return bw >= 5 ? b : -1;
  };
  bot.kamer = function(st){
    var k = keuzes(st), deel = st.hp / st.max, b = k[0].i, bs = -99;
    k.forEach(function(x){
      var s = 0, km = x.kamer;
      if (km.soort === 'lastpak') s += deel > 0.7 ? 1.5 : -3;
      if (km.stop === 'rust') s += deel < 0.6 ? 4 : 0.5;
      if (km.stop === 'winkel') s += st.munten >= 70 ? 2.5 : 0;
      if (km.stop === 'gebeurtenis') s += 1;
      s += kans(st) * 0.5;
      if (s > bs){ bs = s; b = x.i; }
    });
    return b;
  };
  bot.rust = function(st){
    if (st.hp < st.max * 0.62) return { wat:'heel' };
    var b = -1, bw = -1;
    st.stapel.forEach(function(k, i){ var d = KAARTEN[k.id]; if (k.p || !d.plus) return; var w = d.w + (d.zeld === 9 ? -1 : 0); if (w > bw){ bw = w; b = i; } });
    return b >= 0 ? { wat:'beter', kaart:b } : { wat:'heel' };
  };
  /* de winkel: een rijtje stappen; null als hij klaar is */
  bot.winkel = function(st){
    var s = st.stop;
    if (!s.pleister.weg && st.hp < st.max * 0.5 && st.munten >= s.pleister.prijs) return { wat:'pleister' };
    var b = -1, bw = 5.5;
    s.waren.forEach(function(w, i){ if (w.weg || w.prijs > st.munten) return; var x = bot.kaartWaarde(st, w.id); if (x > bw){ bw = x; b = i; } });
    if (b >= 0) return { wat:'koop', i:b };
    if (!s.wegGedaan && st.munten >= s.wegPrijs && st.stapel.length > 8){
      var z = zwakste(st); if (z >= 0 && KAARTEN[st.stapel[z].id].zeld === 9) return { wat:'weg', kaart:z };
    }
    return null;
  };
  bot.gebeurtenis = function(st){
    var gb = gebeurtenisDef(st), deel = st.hp / st.max;
    switch (gb.id){
      case 'bieb': return { o:deel < 0.4 ? 1 : 0 };
      case 'boterham': return { o:deel < 0.7 ? 0 : 1 };
      case 'kluisje': return { o:0, kaart:zwakste(st) };
      case 'mentor': return { o:0 };
      default: return { o:0 };
    }
  };
  bot.zwakste = zwakste;

  var KT = {
    VERSIE:VERSIE, HOOG:HOOG, B:B, KAARTEN:KAARTEN, VIJANDEN:VIJANDEN, GEBEURTENISSEN:GEBEURTENISSEN,
    code:code, nieuw:nieuw, keuzes:keuzes, kiesKamer:kiesKamer, kamer:kamer, antwoord:antwoord, speel:speel, magSpelen:magSpelen,
    beurtKlaar:beurtKlaar, beloning:beloning, rust:rust, koop:koop, weg:weg, pleister:pleister, verder:verder,
    gebeurtenis:gebeurtenis, gebeurtenisDef:gebeurtenisDef, effect:effect, tekst:tekst, planTekst:planTekst, punten:punten, bot:bot
  };
  root.KAARTTOREN = KT;
  if (typeof module !== 'undefined' && module.exports) module.exports = KT;
})(typeof window !== 'undefined' ? window : globalThis);
