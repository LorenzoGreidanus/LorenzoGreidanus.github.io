/* De vragenbank van de hele site: Torenverdediging, Zwaardvechter, de
   Vragenrace en de Klasquiz putten hieruit (alles met var, zodat een spel
   zijn eigen NIVEAUS of TIJDVAKKEN erbovenop mag zetten), en onderaan staan ook de lijsten
   van de Werkwoordrace, Irregular verbs, Tijdvakken sorteren, Vlaggen en
   Landenvormen. Dit bestand is de bron; server/maak-bank.js controleert het. */
var VAKKEN = [
  {id:'reken', naam:'Rekenen',    mark:'R', kleur:'var(--crab)',       onder:'Tafels, breuken, procenten, machten, negatieve getallen, meten'},
  {id:'ned',   naam:'Nederlands', mark:'N', kleur:'var(--deep-ocean)', onder:'Spelling, werkwoorden, zinsdelen, signaalwoorden, uitdrukkingen en meer'},
  {id:'eng',   naam:'Engels',     mark:'E', kleur:'var(--butterscotch)',onder:'Woordjes, irregular verbs, grammatica en valse vrienden'},
  {id:'ges',   naam:'Geschiedenis', mark:'G', kleur:'var(--vista-blue)', onder:'Begrippen bij de tien tijdvakken, van hunebed tot globalisering'},
  {id:'aard',  naam:'Aardrijkskunde', mark:'A', kleur:'#2f7d52', onder:'Vlaggen en landenvormen, en de examenstof vmbo: weer en klimaat, water, bevolking en ruimte'},
  {id:'bio',   naam:'Biologie',    mark:'B', kleur:'#0d7b8a', onder:'Organen, bloed, vertering, planten, cellen, zintuigen en erfelijkheid'},
  {id:'wis',   naam:'Wiskunde',    mark:'W', kleur:'#6b3fa0', onder:'Vergelijkingen, formules, oppervlakte, hoeken, grafieken en Pythagoras'},
  {id:'burg',  naam:'Samenleving', mark:'S', kleur:'#a0455f', onder:'Burgerschap: democratie, rechtsstaat, media, Europa, samenleven, geld en werk; plus maatschappijkunde voor het examen vmbo'},
  {id:'eco',   naam:'Economie',    mark:'€', kleur:'#a3630f', onder:'Examenstof vmbo: consumptie, arbeid en productie, overheid, internationaal, natuur en milieu'}
];

var NIVEAUS = [
  {id: 'bb',  rang: 1, naam: 'vmbo-bb',        uitleg: 'Kleine getallen, korte vragen en rustige rondes. Fouten lopen langzaam.'},
  {id: 'kgt', rang: 2, naam: 'vmbo-kgt en tl', uitleg: 'Iets grotere getallen, ook procenten en meervouden. Normaal tempo.'},
  {id: 'havo',rang: 3, naam: 'havo',           uitleg: 'Grotere getallen, verhoudingen en meten. De fouten lopen sneller.'},
  {id: 'vwo', rang: 4, naam: 'vwo',            uitleg: 'De moeilijkste vragen en het hoogste tempo. Weinig ruimte voor fouten.'}
];

function rnd(n) { return Math.floor(Math.random() * n); }
/* In het Nederlands schrijf je 2,5 en niet 2.5. */
function kommaGetal(n, cijfers) { return Number(n).toFixed(cijfers === undefined ? 1 : cijfers).replace('.', ','); }
function kies(a) { return a[rnd(a.length)]; }
function euro(n) { return '\u20ac ' + n.toFixed(2).replace('.', ','); }
/* Het kopje boven een vraag noemt het onderdeel waar hij bij hoort. Bij
   geschiedenis is dat de naam van een tijdvak, en bij een vraag als "In welk
   tijdvak hoort dit?" is dat precies het antwoord: dan staat het antwoord
   boven de vraag en hoeft een leerling de vraag niet te lezen.

   Deze functie geeft het onderdeel terug, tenzij het een van de antwoorden
   noemt; in dat geval komt er iets neutraals te staan. Bij alle andere vragen
   verandert er niets. */
function kopVoorVraag(vraag, terugval) {
  var kop = String((vraag && vraag.t) || terugval || 'vraag');
  var klein = kop.toLowerCase();
  var lekt = ((vraag && vraag.o) || []).some(function (optie) {
    var a = String(optie).toLowerCase().trim();
    return a.length > 2 && klein.indexOf(a) >= 0;
  });
  return lekt ? (terugval || 'vraag') : kop;
}

function shuffleVraag(vraag, goedTekst) {
  const o = vraag.o.slice();
  const paren = o.map((t, i) => ({t, g: i === vraag.g}));
  for (let i = paren.length - 1; i > 0; i--) { const j = rnd(i + 1); const h = paren[i]; paren[i] = paren[j]; paren[j] = h; }
  /* svg meenemen, anders verdwijnt de vlag of de landvorm bij het schudden. */
  return {v: vraag.v, o: paren.map(p => p.t), g: paren.findIndex(p => p.g), u: vraag.u, t: vraag.t,
          svg: vraag.svg, vlag: vraag.vlag};
}
function uniek(goed, maakFout) {
  const set = [goed];
  let poging = 0;
  while (set.length < 4 && poging < 60) { const f = maakFout(); if (!set.includes(f)) set.push(f); poging++; }
  while (set.length < 4) set.push(String(Number(goed) + set.length));
  return set;
}
function bouw(v, goed, fouten, u, t) {
  const o = uniek(goed, fouten);
  return shuffleVraag({v, o, g: 0, u, t});
}

var TIJDVAKKEN = [
  {id:'tv1', naam:'1 jagers en boeren'}, {id:'tv2', naam:'2 Grieken en Romeinen'},
  {id:'tv3', naam:'3 monniken en ridders'}, {id:'tv4', naam:'4 steden en staten'},
  {id:'tv5', naam:'5 ontdekkers en hervormers'}, {id:'tv6', naam:'6 regenten en vorsten'},
  {id:'tv7', naam:'7 pruiken en revoluties'}, {id:'tv8', naam:'8 burgers en stoommachines'},
  {id:'tv9', naam:'9 wereldoorlogen'}, {id:'tv10', naam:'10 televisie en computer'}
];

var ONDERDELEN = {
  reken: [{id:'tafels',naam:'tafels'},{id:'hoofd',naam:'hoofdrekenen'},{id:'machten',naam:'machten en wortels'},{id:'negatief',naam:'negatieve getallen'},{id:'komma',naam:'kommagetallen'},{id:'gemiddelde',naam:'gemiddelde en schaal'},{id:'breuk',naam:'breuken'},{id:'procent',naam:'procenten'},{id:'verhouding',naam:'verhoudingen'},{id:'tijdgeld',naam:'tijd en geld'},{id:'meten',naam:'meten en meetkunde'}],
  /* groep zet de onderdelen onder een kop in de kiezer; zie GROEPEN hieronder */
  ned: [{id:'werkwoordspelling',naam:'werkwoordspelling',groep:'spelling'},{id:'spelling',naam:'los van het werkwoord',groep:'spelling'},{id:'meervoud',naam:'enkel en meervoud',groep:'spelling'},
        {id:'leestekens',naam:'leestekens',groep:'interpunctie'},
        {id:'woordsoorten',naam:'welk woord is wat',groep:'woordsoorten'},
        {id:'zinsontleding',naam:'zinsdelen benoemen',groep:'zinsontleding'},
        {id:'verwijswoorden',naam:'verwijswoorden',groep:'grammatica'},
        {id:'betekenis',naam:'betekenis van woorden',groep:'lezen'},{id:'synoniemen',naam:'synoniemen',groep:'lezen'},{id:'uitdrukkingen',naam:'uitdrukkingen',groep:'lezen'},{id:'tekstverbanden',naam:'signaalwoorden',groep:'lezen'}],
  eng: [{id:'woordjes NL naar EN',naam:'woordjes NL naar EN',groep:'woordenschat'},{id:'woordjes EN naar NL',naam:'woordjes EN naar NL',groep:'woordenschat'},{id:'valse vrienden',naam:'valse vrienden',groep:'woordenschat'},
        {id:'irregular verbs',naam:'irregular verbs',groep:'werkwoorden'},{id:'voorzetselwerkwoorden',naam:'werkwoord met voorzetsel',groep:'werkwoorden'},
        {id:'grammatica',naam:'grammatica',groep:'grammatica'}],
  ges: TIJDVAKKEN.map(t => ({id: t.id, naam: t.naam})).concat([{id:'staat', naam:'staatsinrichting (examen vmbo)'}, {id:'nl1900', naam:'Nederland en de wereld vanaf 1900 (examen vmbo)'}]),
  aard: [{id:'vlaggen',naam:'vlaggen van landen'},{id:'landvormen',naam:'vormen van landen'}],
  bio: [{id:'organen',naam:'organen'},{id:'bloed',naam:'bloed en ademhaling'},{id:'vertering',naam:'vertering en voeding'},{id:'planten',naam:'planten'},{id:'cellen',naam:'cellen'},{id:'zintuigen',naam:'zintuigen en zenuwen'},{id:'ordening',naam:'ordening en ecologie'},{id:'erfelijkheid',naam:'erfelijkheid'}],
  wis: [{id:'vergelijking',naam:'vergelijkingen'},{id:'formule',naam:'formules'},{id:'oppervlakte',naam:'oppervlakte en inhoud'},{id:'omtrek',naam:'omtrek'},{id:'hoeken',naam:'hoeken'},{id:'grafiek',naam:'grafieken en assenstelsel'},{id:'statistiek',naam:'statistiek'},{id:'pythagoras',naam:'stelling van Pythagoras'}],
  burg: [{id:'democratie',naam:'democratie en verkiezingen'},{id:'rechtsstaat',naam:'rechtsstaat en grondrechten'},{id:'media',naam:'media en nieuws'},{id:'europa',naam:'Europa en de wereld'},{id:'samenleven',naam:'samenleven'},{id:'geld',naam:'geld en werk'}]
};
ONDERDELEN.aard.push({id:'examen-ak', naam:'weer, water, bevolking (examen vmbo)'});
ONDERDELEN.bio.push({id:'examen-bio', naam:'examenstof vmbo'});
ONDERDELEN.wis.push({id:'examen-wis', naam:'examenstof vmbo'});
ONDERDELEN.burg.push({id:'examen-mk', naam:'maatschappijkunde (examen vmbo)'});
ONDERDELEN.eng.push({id:'examen-eng', naam:'examenwoorden en signaalwoorden (examen vmbo)', groep:'lezen'});
ONDERDELEN.eco = [{id:'examen-eco', naam:'examenstof vmbo'}];

/* De koppen boven de onderdelen. Een vak zonder groepen houdt gewoon zijn
   platte lijstje; alleen Nederlands en Engels hebben er genoeg onderdelen voor
   dat je ze wilt ordenen.

   De volgorde hier is de volgorde in de kiezer. Bij Nederlands staat spelling
   vooraan omdat daar de meeste vragen zitten en het het vaakst geoefend wordt;
   zinsontleding en woordsoorten staan bij elkaar omdat ze op elkaar lijken en
   je het verschil juist moet leren zien. */
var GROEPEN = {
  ned: [{id:'spelling',naam:'Spelling'},{id:'grammatica',naam:'Grammatica'},{id:'lezen',naam:'Lezen'},
        {id:'interpunctie',naam:'Interpunctie'},{id:'woordsoorten',naam:'Woordsoorten'},{id:'zinsontleding',naam:'Zinsontleding'}],
  eng: [{id:'woordenschat',naam:'Woordenschat'},{id:'werkwoorden',naam:'Werkwoorden'},
        {id:'grammatica',naam:'Grammatica'},{id:'lezen',naam:'Lezen'}]
};
/* De onderdelen van een vak, op groep. Een vak zonder groepen geeft een lijst
   met een naamloze groep, zodat een kiezer altijd dezelfde vorm krijgt. */
/* De kiezers tekenen hier allemaal hetzelfde rijtje uit: een kop, dan de
   onderdelen die eronder horen, dan de volgende kop. Zo staat de indeling op
   een plek in plaats van in vier pagina's.

   Een vak zonder groepen geeft alleen onderdelen terug, dus die kiezers zien er
   precies zo uit als altijd. */
function deelItems(vak){
  var uit = [];
  groepen(vak).forEach(function(g){
    if (g.naam) uit.push({ soort: 'kop', id: g.id, naam: g.naam, aantal: g.onderdelen.length });
    g.onderdelen.forEach(function(o){ uit.push({ soort: 'deel', id: o.id, naam: o.naam, groep: g.id }); });
  });
  return uit;
}
function groepen(vak){
  var lijst = ONDERDELEN[vak] || [], koppen = GROEPEN[vak];
  if (!koppen) return [{ id:'', naam:'', onderdelen: lijst.slice() }];
  var uit = koppen.map(function(g){
    return { id: g.id, naam: g.naam, onderdelen: lijst.filter(function(o){ return o.groep === g.id; }) };
  }).filter(function(g){ return g.onderdelen.length; });
  /* wat geen groep heeft valt er niet buiten, dat gaat onderaan */
  var los = lijst.filter(function(o){ return !o.groep; });
  if (los.length) uit.push({ id:'', naam:'overig', onderdelen: los });
  return uit;
}

/* ---------------------------------------------------------------------------
   Extra vragen. De Engelse werkwoorden komen uit Irregular verbs en de
   Nederlandse werkwoordspelling uit de Werkwoordrace, allebei van deze site
   zelf; de tijdvakvragen uit Tijdvakken sorteren. De rest is er los bij
   geschreven, met extra aandacht voor de kleine onderdelen: die waren na
   tien vragen al rond.
   --------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------
   Aardrijkskunde: raad het land aan zijn vlag of aan zijn vorm. De vormen komen
   van de wereldkaart uit Topografie, met alleen het hoofdland zodat je de vorm
   ziet en niet waar het ligt.

   De vlaggen zijn met de hand nagetekend, honderddertig stuks, en elke vlag
   heeft zijn eigen verhouding. Dat was eerst niet zo: alles stond in hetzelfde
   vak van 180 bij 120, waardoor het Verenigd Koninkrijk (een op twee), de
   Verenigde Staten (tien op negentien), Duitsland (drie op vijf) en Belgie
   (vijftien op dertien) allemaal werden uitgerekt. Nu wordt per vlag eerst het
   vlak op maat gezet, zo groot mogelijk binnen het kader en in het midden, en
   staan alle maten in dat vlak uitgedrukt. Zo is Belgie bijna vierkant, is
   Zwitserland echt vierkant en is Hongarije twee keer zo lang als hoog.

   Binnen de vlag klopt de meetkunde ook: de Scandinavische kruisen staan op de
   officiele verdeling van hun eigen land, het Zwitserse kruis heeft armen van
   zes bij zeven delen op een veld van tweeendertig, de zon van Japan is drie
   vijfde van de hoogte, het wiel van India heeft vierentwintig spaken, de
   Verenigde Staten hebben vijftig sterren en Zuid-Korea vier verschillende
   trigrammen. Vlaggen met een wapen erop staan er nu wel bij, gestileerd maar
   herkenbaar.

   De antwoorden zijn met opzet verwarrend: bij Ierland staat Ivoorkust, bij
   Polen staat Indonesie, en bij Slowakije staat Slovenie.
   --------------------------------------------------------------------------- */



/* Nog eens zeventig vragen Nederlands, over alle onderdelen, met extra ruimte voor vmbo-bb en vwo. */

/* Nog eens zeventig vragen Engels: woordjes voor de lagere niveaus, en meer grammatica, werkwoorden met voorzetsel en valse vrienden. */

/* Honderd vragen geschiedenis: tien per tijdvak, verdeeld over de vier niveaus. */

/* Biologie voor de onderbouw: het lichaam, planten, cellen en erfelijkheid. */

/* Wiskunde voor de onderbouw. Rekenen heeft zijn eigen vak met sommen die
   het spel zelf maakt; hier gaat het om letters, vormen en grafieken. */

/* Samenleving (burgerschap): hoe Nederland bestuurd wordt, wat je rechten
   zijn, en wat je met nieuws en geld aan moet. */


/* ---------------------------------------------------------------------------
   De examenstof geschiedenis van het vmbo (syllabus centraal examen 2026,
   GS/K/5 Staatsinrichting van Nederland en GS/K/10 Historisch overzicht
   vanaf 1900), voor leerjaar 3 en 4. In Torenverdediging, Zwaardvechter, de
   Vragenrace en de Klasquiz als twee onderdelen bij geschiedenis.
   --------------------------------------------------------------------------- */
/* ---------- examenstof vmbo (syllabi CE 2026): per vak een onderdeel ---------- */






/* De vragen zelf staan per vak in bank-<vak>.js en komen hier binnen zodra ze
   nodig zijn. BANK.zorg('ges') geeft een belofte die klaar is als de vragen er
   staan; BANK.zorg() zonder vak haalt alles op. Een spel dat de vragen meteen
   nodig heeft wacht daar netjes op. */
var BRONNEN = {}, NIVOS = {};
var BANK = (function(){
  var bezig = {}, klaar = {};
  var ALLE = ["ned", "eng", "ges", "aard", "bio", "wis", "burg", "eco"];
  /* waar staat bank.js zelf? daarnaast staan de vakbestanden */
  function map(){
    try {
      var s = document.currentScript || [].slice.call(document.scripts).filter(function(x){ return /bank\.js/.test(x.src); })[0];
      if (s && s.src) return s.src.replace(/bank\.js.*$/, "");
    } catch (e){}
    return "";
  }
  var BASIS = map();
  function een(vak){
    if (klaar[vak]) return Promise.resolve();
    if (bezig[vak]) return bezig[vak];
    bezig[vak] = new Promise(function(res){
      var s = document.createElement("script");
      s.src = BASIS + "bank-" + vak + ".js";
      s.onload = function(){ klaar[vak] = true; res(); };
      /* lukt het niet, dan gaat het spel gewoon door met wat er is */
      s.onerror = function(){ klaar[vak] = true; res(); };
      document.head.appendChild(s);
    });
    return bezig[vak];
  }
  function zorg(vak){
    var lijst = !vak ? ALLE : (Array.isArray(vak) ? vak : [vak]);
    lijst = lijst.filter(function(v){ return ALLE.indexOf(v) >= 0; });
    return Promise.all(lijst.map(een));
  }
  return { zorg: zorg, vakken: ALLE, heeft: function(v){ return !!klaar[v]; },
           /* de onderdelen van een vak, op kop; zie GROEPEN verderop */
           groepen: function(v){ return groepen(v); },
           deelItems: function(v){ return deelItems(v); } };
})();

/* De soorten sommen per niveau. Deze lijst geldt als je niets kiest; koos je
   zelf onderdelen, dan tellen die en zegt het niveau alleen nog iets over de
   getallen. */
function rekenVraag(rang, toegestaan) {
  const r = rang || 2;
  const potten = {
    1: ['tafels','tafels','hoofd','hoofd','breuk','tijdgeld','komma'],
    2: ['tafels','tafels','hoofd','hoofd','breuk','procent','tijdgeld','meten','komma','gemiddelde'],
    3: ['tafels','hoofd','breuk','procent','verhouding','tijdgeld','meten','komma','gemiddelde','machten','negatief'],
    4: ['hoofd','breuk','procent','verhouding','verhouding','meten','machten','machten','negatief','gemiddelde']
  };
  /* Heb je zelf onderdelen aangewezen, dan zijn dat ze, en bepaalt het niveau
     alleen nog hoe zwaar de som binnen dat onderdeel wordt. Eerst kijken wat
     er bij dit niveau hoort en daarna pas naar jouw keuze werkte averechts:
     tafels staan niet in de lijst van vwo, dus wie tafels en breuken koos en
     een stap omhoog ging hield alleen nog breuken over. */
  const soort = toegestaan && toegestaan.length ? kies(toegestaan) : kies(potten[r]);
  if (soort === 'tafels') {
    /* Welke tafels je krijgt hangt af van het niveau. De foute antwoorden zijn
       geen willekeurige getallen maar de fouten die leerlingen echt maken: een
       stapje te ver of te weinig in dezelfde tafel, of de buurtafel. */
    const tafelsVan = { 1:[1,2,3,4,5,10], 2:[2,3,4,5,6,7,8,9,10], 3:[3,4,6,7,8,9,11,12], 4:[6,7,8,9,11,12,13,15] };
    const a = kies(tafelsVan[r] || tafelsVan[2]);
    const b = 2 + rnd(r === 1 ? 9 : 11);
    const goed = a * b;
    const fouten = [goed + a, goed - a, goed + b, (a + 1) * b, (a - 1) * b, goed + 10]
      .filter(function(n){ return n > 0 && n !== goed; });
    const hulp = b > 5
      ? 'Reken via ' + a + ' \u00d7 10 = ' + (a * 10) + ' en haal er ' + a + ' \u00d7 ' + (10 - b) + ' = ' + (a * (10 - b)) + ' van af.'
      : 'Tel de tafel van ' + a + ' op: ' + [1,2,3,4,5].slice(0, b).map(function(k){ return a * k; }).join(', ') + '.';
    return bouw(a + ' \u00d7 ' + b, String(goed),
      function(){ return String(kies(fouten)); },
      a + ' \u00d7 ' + b + ' = ' + goed + '. ' + hulp, 'tafel van ' + a);
  }
  if (soort === 'machten') {
    /* Kwadraten en wortels. De afleiders zijn de klassieke verwarringen: keer twee
       in plaats van in het kwadraat, en de buurwortel. */
    if (rnd(2) === 0){
      const a = (r >= 4 ? 6 : 2) + rnd(r >= 4 ? 15 : 11);
      const goed = a * a;
      return bouw(a + '\u00b2', String(goed),
        () => String(kies([a * 2, (a + 1) * (a + 1), (a - 1) * (a - 1), goed + a, goed - a].filter(n => n > 0 && n !== goed))),
        a + '\u00b2 betekent ' + a + ' \u00d7 ' + a + ' = ' + goed + '. Niet ' + a + ' \u00d7 2, dat is ' + (a * 2) + '.',
        'machten');
    }
    const w = (r >= 4 ? 6 : 2) + rnd(r >= 4 ? 13 : 9);
    const kwad = w * w;
    return bouw('\u221a' + kwad, String(w),
      () => String(kies([w + 1, w - 1, w + 2, Math.round(kwad / 2), w * 2].filter(n => n > 0 && n !== w))),
      'De wortel van ' + kwad + ' is ' + w + ', want ' + w + ' \u00d7 ' + w + ' = ' + kwad + '.',
      'wortels');
  }
  if (soort === 'negatief') {
    const soortje = rnd(3);
    if (soortje === 0){
      const a = -(2 + rnd(18)), b = 2 + rnd(18);
      const goed = a + b;
      return bouw(a + ' + ' + b, String(goed),
        () => String(kies([a - b, -(a + b), b - a, goed + 1, goed - 1].filter(n => n !== goed))),
        'Van ' + a + ' ga je ' + b + ' omhoog en dan kom je op ' + goed + '.', 'negatieve getallen');
    }
    if (soortje === 1){
      const a = 3 + rnd(15), b = 4 + rnd(20);
      const goed = a - b;
      return bouw(a + ' - ' + b, String(goed),
        () => String(kies([b - a, -(a + b), a + b, goed + 2, goed - 2].filter(n => n !== goed))),
        'Je gaat onder nul: ' + a + ' - ' + b + ' = ' + goed + '. Let op het minteken.', 'negatieve getallen');
    }
    const a2 = -(2 + rnd(9)), b2 = 2 + rnd(9);
    const goed2 = a2 * b2;
    return bouw(a2 + ' \u00d7 ' + b2, String(goed2),
      () => String(kies([-goed2, goed2 + b2, goed2 - b2, a2 + b2].filter(n => n !== goed2))),
      'Min keer plus is min: ' + a2 + ' \u00d7 ' + b2 + ' = ' + goed2 + '.', 'negatieve getallen');
  }
  if (soort === 'komma') {
    const soortje = rnd(3);
    if (soortje === 0){
      const a = (10 + rnd(90)) / 10, b = (10 + rnd(90)) / 10;
      const goed = Math.round((a + b) * 10) / 10;
      return bouw(kommaGetal(a) + ' + ' + kommaGetal(b), kommaGetal(goed),
        () => kommaGetal(Math.round((goed + kies([-1, 1, 0.9, -0.9, 0.1, -0.1])) * 10) / 10),
        'Zet de komma\u2019s onder elkaar: ' + kommaGetal(a) + ' + ' + kommaGetal(b) + ' = ' + kommaGetal(goed) + '.',
        'kommagetallen');
    }
    if (soortje === 1){
      const a = (10 + rnd(90)) / 10, b = 2 + rnd(8);
      const goed = Math.round(a * b * 10) / 10;
      return bouw(kommaGetal(a) + ' \u00d7 ' + b, kommaGetal(goed),
        () => kommaGetal(Math.round((goed * kies([10, 0.1]) + kies([0, 0.5])) * 10) / 10),
        'Reken ' + (a * 10) + ' \u00d7 ' + b + ' = ' + (a * 10 * b) + ' en zet de komma terug: ' + kommaGetal(goed) + '.',
        'kommagetallen');
    }
    const c = kies([0.1, 0.25, 0.5, 0.75]);
    const namen = { 0.1:'een tiende', 0.25:'een kwart', 0.5:'de helft', 0.75:'driekwart' };
    const van = kies([40, 60, 80, 120, 200, 240]);
    const goed3 = Math.round(c * van * 100) / 100;
    return bouw(namen[c] + ' van ' + van, kommaGetal(goed3, goed3 % 1 ? 2 : 0),
      () => kommaGetal(kies([van * c * 2, van * c / 2, van - goed3, goed3 + 10].map(n => Math.round(n * 100) / 100).filter(n => n !== goed3)), 0),
      namen[c] + ' van ' + van + ' is ' + kommaGetal(goed3, goed3 % 1 ? 2 : 0) + '.', 'kommagetallen');
  }
  if (soort === 'gemiddelde') {
    if (rnd(2) === 0){
      const n = 3 + rnd(2);
      const cijfers = [];
      for (let i = 0; i < n; i++) cijfers.push(2 + rnd(9));
      const som = cijfers.reduce((a, b) => a + b, 0);
      const goed = Math.round(som / n * 10) / 10;
      return bouw('Gemiddelde van ' + cijfers.join(', '), kommaGetal(goed, goed % 1 ? 1 : 0),
        () => kommaGetal(kies([som, Math.round(som / n) + 1, Math.round(som / n) - 1, Math.round(som / (n + 1) * 10) / 10]), 0),
        'Tel ze op: ' + som + '. Deel door ' + n + ': ' + kommaGetal(goed, goed % 1 ? 1 : 0) + '.', 'gemiddelde');
    }
    const schaal = kies([100, 200, 500, 1000]);
    const cm = 2 + rnd(12);
    const meter = cm * schaal / 100;
    var mm = function(n){ return kommaGetal(n, n % 1 ? 1 : 0) + ' m'; };
    return bouw('Op schaal 1 op ' + schaal + ' is iets ' + cm + ' cm. Hoe lang is het echt?', mm(meter),
      () => mm(kies([meter * 10, meter / 10, meter * 100, meter / 2, meter + 10]).valueOf()),
      cm + ' cm keer ' + schaal + ' is ' + (cm * schaal) + ' cm, en dat is ' + mm(meter) + '.', 'schaal');
  }
  if (soort === 'hoofd') {
    const type = r === 1 ? kies(['x','+','-']) : kies(['x','+','-',':']);
    if (type === 'x') {
      const a = r === 1 ? 2 + rnd(8) : r === 2 ? 3 + rnd(10) : r === 3 ? 6 + rnd(13) : 11 + rnd(19);
      const b = r === 1 ? 2 + rnd(8) : r === 2 ? 4 + rnd(9) : r === 3 ? 5 + rnd(11) : 7 + rnd(14);
      return bouw(a + ' \u00d7 ' + b, String(a * b), () => String(a * b + (rnd(2) ? 1 : -1) * (a + rnd(b))), 'Reken in stappen: ' + a + ' \u00d7 10 = ' + (a * 10) + ', en daar haal je ' + a + ' \u00d7 ' + (10 - b) + ' van af of tel je bij op.', 'hoofdrekenen');
    }
    if (type === '+') {
      const a = r === 1 ? 12 + rnd(70) : r === 2 ? 120 + rnd(700) : r === 3 ? 640 + rnd(2400) : 2400 + rnd(7000);
      const b = r === 1 ? 8 + rnd(40) : r === 2 ? 60 + rnd(400) : r === 3 ? 180 + rnd(900) : 900 + rnd(4000);
      return bouw(a + ' + ' + b, String(a + b), () => String(a + b + (rnd(2) ? 10 : -10) * (1 + rnd(5))), 'Tel eerst de grootste getallen op, dan de tientallen, dan de eenheden.', 'hoofdrekenen');
    }
    if (type === '-') {
      const a = r === 1 ? 40 + rnd(60) : r === 2 ? 400 + rnd(600) : r === 3 ? 1200 + rnd(2000) : 4000 + rnd(6000);
      const b = r === 1 ? 8 + rnd(30) : r === 2 ? 80 + rnd(300) : r === 3 ? 240 + rnd(800) : 800 + rnd(3000);
      return bouw(a + ' \u2212 ' + b, String(a - b), () => String(a - b + (rnd(2) ? 10 : -10) * (1 + rnd(6))), 'Reken handig: haal eerst een rond getal eraf en corrigeer daarna.', 'hoofdrekenen');
    }
    const b = r <= 2 ? 3 + rnd(9) : 6 + rnd(12), q = r <= 2 ? 3 + rnd(12) : 7 + rnd(20), a = b * q;
    return bouw(a + ' : ' + b, String(q), () => String(q + (rnd(2) ? 1 : -1) * (1 + rnd(4))), 'Hoe vaak past ' + b + ' in ' + a + '? ' + b + ' \u00d7 ' + q + ' = ' + a + '.', 'hoofdrekenen');
  }
  if (soort === 'breuk') {
    const noemers = r === 1 ? [[1,2],[1,4],[1,3]] : r === 2 ? [[1,2],[1,4],[3,4],[1,3],[1,5]] : [[3,4],[2,3],[3,5],[2,5],[5,6],[3,8]];
    const f = kies(noemers), basis = f[1] * (r <= 2 ? 2 + rnd(8) : 6 + rnd(16));
    const goed = basis * f[0] / f[1];
    return bouw(f[0] + '/' + f[1] + ' van ' + basis, String(goed), () => String(goed + (rnd(2) ? 1 : -1) * (1 + rnd(6))), 'Deel eerst door ' + f[1] + ' (' + basis + ' : ' + f[1] + ' = ' + (basis / f[1]) + ') en neem daar ' + f[0] + ' keer van.', 'breuken');
  }
  if (soort === 'procent') {
    const p = r <= 2 ? kies([10,20,25,50]) : kies([5,15,35,40,60,75,80]);
    const basis = r <= 2 ? kies([20,40,60,80,120,200]) : kies([160,240,320,420,650,840]);
    const goed = basis * p / 100;
    const g = function(n){ return kommaGetal(n, n % 1 ? 1 : 0); };
    return bouw(p + '% van ' + basis, g(goed), () => g(goed + (rnd(2) ? 1 : -1) * kies([2,4,5,10])),
      '1% van ' + basis + ' is ' + g(basis / 100) + ', dus ' + p + '% is ' + p + ' \u00d7 ' + g(basis / 100) + ' = ' + g(goed) + '.',
      'procenten');
  }
  if (soort === 'verhouding') {
    const stuk = kies([2,3,4,5]), prijs = stuk * kies([0.75,1.25,1.5,2.25]), meer = stuk + kies([1,2,3]);
    const goed = prijs / stuk * meer;
    return bouw(stuk + ' pakken kosten ' + euro(prijs) + '. Wat kosten ' + meer + ' pakken?', euro(goed), () => euro(goed + (rnd(2) ? 1 : -1) * kies([0.25,0.5,0.75,1])), 'Eerst \u00e9\u00e9n pak: ' + euro(prijs) + ' : ' + stuk + ' = ' + euro(prijs / stuk) + '. Dan \u00d7 ' + meer + '.', 'verhoudingen');
  }
  if (soort === 'tijdgeld') {
    if (rnd(2)) {
      const u = 8 + rnd(11), m = kies([10,15,25,35,40,45,50]), plus = kies([25,35,40,50,55,70,80]);
      const tot = u * 60 + m + plus, gu = Math.floor(tot / 60) % 24, gm = tot % 60;
      const pad = n => (n < 10 ? '0' : '') + n;
      const goed = pad(gu) + ':' + pad(gm);
      return bouw('Het is ' + pad(u) + ':' + pad(m) + '. Hoe laat is het over ' + plus + ' minuten?', goed, () => { const d = (rnd(2) ? 1 : -1) * kies([5,10,15,60]); const t2 = tot + d; return pad(Math.floor(t2 / 60) % 24) + ':' + pad(((t2 % 60) + 60) % 60); }, 'Tel eerst tot het volgende hele uur, en daarna de rest van de minuten.', 'tijd');
    }
    const betaald = kies([10,20,50]), prijs = betaald - kies([1,2,3,4,5,6,7]) - kies([0.05,0.15,0.35,0.45,0.75,0.95]);
    const goed = betaald - prijs;
    return bouw('Je koopt iets van ' + euro(prijs) + ' en betaalt met ' + euro(betaald) + '. Hoeveel krijg je terug?', euro(goed), () => euro(goed + (rnd(2) ? 1 : -1) * kies([0.10,0.50,1,2])), 'Tel aan van ' + euro(prijs) + ' naar ' + euro(betaald) + ', eerst naar de hele euro.', 'geld');
  }
  const type = kies(['omtrek','opp','meter']);
  if (type === 'omtrek') { const a = 3 + rnd(18), b = 4 + rnd(20); return bouw('Omtrek van een rechthoek van ' + a + ' bij ' + b + ' cm', (2 * (a + b)) + ' cm', () => (2 * (a + b) + (rnd(2) ? 1 : -1) * kies([2,4,a,b])) + ' cm', 'Omtrek is 2 \u00d7 (' + a + ' + ' + b + ').', 'meten'); }
  if (type === 'opp') { const a = 3 + rnd(12), b = 4 + rnd(12); return bouw('Oppervlakte van een rechthoek van ' + a + ' bij ' + b + ' cm', (a * b) + ' cm\u00b2', () => (a * b + (rnd(2) ? 1 : -1) * kies([a,b,2,10])) + ' cm\u00b2', 'Oppervlakte is lengte \u00d7 breedte: ' + a + ' \u00d7 ' + b + '.', 'meten'); }
  const m = kies([1.5,2.5,0.75,3.2,4.05,0.4]);
  /* De afleiders waren soms halve centimeters, en dat leest raar. Nu zijn het
     de fouten die je echt maakt: een nul te veel of te weinig. */
  return bouw(kommaGetal(m, 2).replace(/,?0+$/, '') + ' meter in centimeter', Math.round(m * 100) + ' cm',
    () => Math.round(kies([m * 1000, m * 10, m * 100 + 50, m * 100 - 50, m * 100 + 5])) + ' cm',
    'Een meter is 100 cm, dus ' + kommaGetal(m, 2).replace(/,?0+$/, '') + ' meter is ' + Math.round(m * 100) + ' cm.',
    'meten');
}

/* ---------------------------------------------------------------------------
   De lijsten van de losse oefenspellen.
   --------------------------------------------------------------------------- */

/* De zinnen van de Werkwoordrace: zin met % op de plek van het gat, twee vormen, welke goed is, de regel en de uitleg. v is het niveau, s het onderdeel. */
var OPGAVEN_WERKWOORDEN = [
/* ---------- tegenwoordige tijd ---------- */
{ v:1, s:'tt', zin:'Ik % elke dag naar school.', o:['fiets','fietst'], g:0,
  r:'ik = de stam', w:'Bij ik gebruik je de stam, dus zonder t. De stam van fietsen is fiets.' },
{ v:1, s:'tt', zin:'Hij % de deur voor mij open.', o:['doet','doed'], g:0,
  r:'hij = stam + t', w:'Bij hij, zij of het komt er een t achter de stam. In de tegenwoordige tijd is dat altijd een t, nooit een d.' },
{ v:1, s:'tt', zin:'Wij % morgen naar Zwolle.', o:['gaan','gaat'], g:0,
  r:'wij = hele werkwoord', w:'Bij wij, jullie en zij meervoud schrijf je het hele werkwoord: gaan.' },
{ v:1, s:'tt', zin:'De hond % de hele nacht.', o:['blaft','blafd'], g:0,
  r:'hij = stam + t', w:'De hond is een hij, dus stam plus t. In de tegenwoordige tijd hoor je nooit een d achter de stam.' },
{ v:1, s:'tt', zin:'Ik % morgen vijftien.', o:['word','wordt'], g:0,
  r:'ik = de stam', w:'De stam van worden is word. Bij ik komt er niets achter, dus word zonder t.' },
{ v:1, s:'tt', zin:'Hij % steeds bozer.', o:['word','wordt'], g:1,
  r:'hij = stam + t', w:'Stam word plus t is wordt. Dat de stam al op een d eindigt maakt niet uit, de t komt er gewoon achter.' },
{ v:2, s:'tt', zin:'% jij ook uitgenodigd?', o:['Word','Wordt'], g:0,
  r:'jij achter het werkwoord: geen t', w:'Staat jij achter het werkwoord, dan valt de t weg. Vergelijk: jij wordt uitgenodigd, maar word jij uitgenodigd?' },
{ v:2, s:'tt', zin:'Wat % jij daarvan?', o:['vind','vindt'], g:0,
  r:'jij achter het werkwoord: geen t', w:'Jij staat achter het werkwoord, dus geen t. Wel: jij vindt daar iets van.' },
{ v:2, s:'tt', zin:'Jij % dat altijd goed.', o:['doet','doe'], g:0,
  r:'jij ervoor = stam + t', w:'Staat jij voor het werkwoord, dan komt de t er gewoon bij.' },
{ v:2, s:'tt', zin:'Mijn zus % op haar fiets naar school.', o:['rijdt','rijd'], g:0,
  r:'hij of zij = stam + t', w:'Mijn zus is een zij. De stam van rijden is rijd, daar komt een t achter.' },
{ v:2, s:'tt', zin:'Hij % nooit op mijn berichten.', o:['antwoordt','antwoord'], g:0,
  r:'hij = stam + t', w:'De stam van antwoorden is antwoord. Bij hij komt daar een t achter, ook al ziet dat er raar uit.' },
{ v:2, s:'tt', zin:'Ik % je vanavond.', o:['antwoord','antwoordt'], g:0,
  r:'ik = de stam', w:'Bij ik gebruik je alleen de stam: antwoord.' },
{ v:2, s:'tt', zin:'De leerlingen % het lokaal binnen.', o:['lopen','loopt'], g:0,
  r:'meervoud = hele werkwoord', w:'De leerlingen zijn er meer dan een, dus het hele werkwoord: lopen.' },
{ v:3, s:'tt', zin:'% je even mee naar buiten?', o:['Loop','Loopt'], g:0,
  r:'je achter het werkwoord: geen t', w:'Ook bij je in plaats van jij valt de t weg als het achter het werkwoord staat.' },
{ v:3, s:'tt', zin:'Het % me dat je er bent.', o:['verbaast','verbaasd'], g:0,
  r:'het = stam + t', w:'Hier is verbazen een gewoon werkwoord in de tegenwoordige tijd: stam verbaas plus t.' },

/* ---------- verleden tijd ---------- */
{ v:2, s:'vt', zin:'Wij % de hele middag aan ons verslag.', o:['werkten','werkden'], g:0,
  r:"het kofschip: k, dus ten", w:"Werken eindigt op ken. De k zit in 't kofschip, dus verleden tijd met ten." },
{ v:2, s:'vt', zin:'Hij % zijn huiswerk al voor het eten.', o:['maakte','maakde'], g:0,
  r:"het kofschip: k, dus te", w:"Maken eindigt op ken. De k zit in 't kofschip, dus te." },
{ v:2, s:'vt', zin:'Ik % de hele avond naar muziek.', o:['luisterde','luisterte'], g:0,
  r:"geen kofschip: r, dus de", w:"Luisteren eindigt op ren. De r zit niet in 't kofschip, dus de." },
{ v:2, s:'vt', zin:'Zij % de deur voorzichtig.', o:['opende','opente'], g:0,
  r:"geen kofschip: n, dus de", w:"Openen eindigt op nen. De n zit niet in 't kofschip, dus de." },
{ v:2, s:'vt', zin:'De hond % de hele nacht.', o:['blafte','blafde'], g:0,
  r:"het kofschip: f, dus te", w:"Blaffen eindigt op fen. De f zit in 't kofschip, dus te." },
{ v:2, s:'vt', zin:'Wij % vroeger in Emmeloord.', o:['woonden','woonten'], g:0,
  r:"geen kofschip: n, dus den", w:"Wonen eindigt op nen, dus den. Je hoort het ook: woonden." },
{ v:2, s:'vt', zin:'Ik % de bal over de schutting.', o:['gooide','gooite'], g:0,
  r:"geen kofschip, dus de", w:"Gooien eindigt op ien. Die letters zitten niet in 't kofschip, dus de." },
{ v:3, s:'vt', zin:'De juf % de les precies op tijd.', o:['startte','starte'], g:0,
  r:'stam op t, dus tte', w:'De stam is start en die eindigt al op een t. Daar komt te achter, dus twee keer t: startte.' },
{ v:3, s:'vt', zin:'Hij % een hoger cijfer.', o:['verwachtte','verwachte'], g:0,
  r:'stam op t, dus tte', w:'De stam is verwacht. Daar komt te achter, dus verwachtte met twee keer t.' },
{ v:3, s:'vt', zin:'Wij % vorig jaar naar een ander huis.', o:['verhuisden','verhuisten'], g:0,
  r:"kijk naar het hele werkwoord", w:"Verhuizen eindigt op zen, en de z zit niet in 't kofschip. Kijk dus naar het hele werkwoord, niet naar de stam verhuis." },
{ v:3, s:'vt', zin:'Ik % de vraag van de docent.', o:['beantwoordde','beantwoorde'], g:0,
  r:'stam op d, dus dde', w:'De stam is beantwoord en eindigt al op een d. Daar komt de achter: beantwoordde.' },
{ v:3, s:'vt', zin:'Hij % zich de hele les.', o:['verveelde','verveelte'], g:0,
  r:"geen kofschip: l, dus de", w:"Vervelen eindigt op len. De l zit niet in 't kofschip, dus de." },
{ v:3, s:'vt', zin:'De klas % het antwoord meteen.', o:['raadde','raadte'], g:0,
  r:'stam op d, dus de', w:'Raden eindigt op den, dus de. De stam raad eindigt al op een d: raadde.' },

{ v:1, s:'vt', zin:'Ik % gisteren naar school.', o:['fietste','fietsde'], g:0,
  r:"het kofschip: s, dus te", w:"Fietsen eindigt op sen. De s zit in 't kofschip, dus te." },
{ v:1, s:'vt', zin:'Wij % gisteren de hele middag buiten.', o:['speelden','speelten'], g:0,
  r:"geen kofschip: l, dus den", w:"Spelen eindigt op len. De l zit niet in 't kofschip, dus den." },
{ v:1, s:'vt', zin:'Zij % hard om de grap.', o:['lachte','lachde'], g:0,
  r:"het kofschip: ch, dus te", w:"Lachen eindigt op chen. De ch zit in 't kofschip, dus te." },
{ v:1, s:'vt', zin:'Ik % mijn kamer op zaterdag.', o:['poetste','poetsde'], g:0,
  r:"het kofschip: s, dus te", w:"Poetsen eindigt op sen, en de s zit in 't kofschip. Dus te." },
{ v:2, s:'vt', zin:'Hij % de bal over de schutting.', o:['gooide','gooiden'], g:0,
  r:'hij is enkelvoud', w:'De vorm met de is goed, want hij is een persoon. Gooiden gebruik je bij wij of zij meervoud.' },

/* ---------- voltooid deelwoord ---------- */
{ v:1, s:'vd', zin:'Ik heb de hele dag hard %.', o:['gewerkt','gewerkd'], g:0,
  r:"het kofschip: k, dus t", w:"Werken eindigt op ken en de k zit in 't kofschip, dus ge plus stam plus t." },
{ v:1, s:'vd', zin:'Wij hebben het samen %.', o:['gemaakt','gemaakd'], g:0,
  r:"het kofschip: k, dus t", w:"Maken hoort bij 't kofschip, dus gemaakt met een t." },
{ v:2, s:'vd', zin:'Hij heeft de deur al %.', o:['geopend','geopent'], g:0,
  r:"geen kofschip: n, dus d", w:"Openen eindigt op nen. De n zit niet in 't kofschip, dus een d: geopend." },
{ v:2, s:'vd', zin:'Zij is naar huis %.', o:['gefietst','gefietsd'], g:0,
  r:"het kofschip: s, dus t", w:"Fietsen eindigt op sen. De s zit in 't kofschip, dus een t." },
{ v:2, s:'vd', zin:'Hij heeft nog steeds niet %.', o:['geantwoord','geantwoordt'], g:0,
  r:'stam eindigt al op d', w:'De stam is antwoord en eindigt al op een d. Er komt niets meer bij: geantwoord. Een voltooid deelwoord krijgt nooit dt.' },
{ v:2, s:'vd', zin:'Ik heb de hele week %.', o:['geleerd','geleert'], g:0,
  r:"geen kofschip: r, dus d", w:"Leren eindigt op ren. De r zit niet in 't kofschip, dus een d." },
{ v:3, s:'vd', zin:'Ik heb je bericht gisteren %.', o:['ontvangen','ontvangd'], g:0,
  r:'sterk werkwoord, geen ge', w:'Ontvangen is een sterk werkwoord met een onbeklemtoond voorvoegsel. Er komt geen ge voor en geen t of d achter.' },
{ v:3, s:'vd', zin:'Ze heeft haar pas %.', o:['verloren','verliesd'], g:0,
  r:'sterk werkwoord', w:'Verliezen verandert van klank in het voltooid deelwoord: verloren. Bij sterke werkwoorden helpt het kofschip je niet.' },
{ v:3, s:'vd', zin:'Het pakketje wordt vandaag %.', o:['bezorgd','bezorgt'], g:0,
  r:"geen kofschip: g, dus d", w:"Bezorgen eindigt op gen. De g zit niet in 't kofschip, dus een d. Let op: wordt bezorgd is een voltooid deelwoord, geen persoonsvorm." },
{ v:3, s:'vd', zin:'Hij heeft zich de hele les %.', o:['verveeld','verveelt'], g:0,
  r:"geen kofschip: l, dus d", w:"Vervelen eindigt op len, dus een d. Na heeft staat altijd een voltooid deelwoord." },

{ v:1, s:'vd', zin:'Ik heb de hele middag buiten %.', o:['gespeeld','gespeelt'], g:0,
  r:"geen kofschip: l, dus d", w:"Spelen eindigt op len. De l zit niet in 't kofschip, dus een d." },
{ v:1, s:'vd', zin:'Zij heeft haar kamer %.', o:['gepoetst','gepoetsd'], g:0,
  r:"het kofschip: s, dus t", w:"Poetsen hoort bij 't kofschip, dus gepoetst met een t." },

/* ---------- de d of t val ---------- */
{ v:1, s:'val', zin:'Hij % de bal naar mij.', o:['gooit','gooid'], g:0,
  r:'persoonsvorm, dus t', w:'Dit is de persoonsvorm bij hij: stam plus t. Vervang het door lopen: hij loopt.' },
{ v:1, s:'val', zin:'De bal is naar mij %.', o:['gegooid','gegooit'], g:0,
  r:'na is: deelwoord', w:'Na is komt een voltooid deelwoord. Vervang het door lopen: het is gelopen. Dus gegooid.' },
{ v:1, s:'val', zin:'Wat % er allemaal?', o:['gebeurt','gebeurd'], g:0,
  r:'persoonsvorm, dus t', w:'Hier is gebeuren de persoonsvorm in de tegenwoordige tijd. Vervang het door lopen: wat loopt er. Je hoort een t.' },
{ v:1, s:'val', zin:'Er is iets ergs %.', o:['gebeurd','gebeurt'], g:0,
  r:'na is of heeft: deelwoord', w:'Na is, was, heeft of hebben komt een voltooid deelwoord. Vervang het door lopen: er is iets gelopen. Dus gebeurd met een d.' },
{ v:2, s:'val', zin:'Hij % zich tijdens de uitleg.', o:['verveelt','verveeld'], g:0,
  r:'persoonsvorm, dus t', w:'Dit is de persoonsvorm bij hij: stam plus t. Vervang het door lopen: hij loopt.' },
{ v:2, s:'val', zin:'Hij heeft zich vreselijk %.', o:['verveeld','verveelt'], g:0,
  r:'na heeft: deelwoord', w:'Na heeft komt een voltooid deelwoord. Vervang het door lopen: hij heeft gelopen. Dus verveeld.' },
{ v:2, s:'val', zin:'De postbode % het pakket om vier uur.', o:['bezorgt','bezorgd'], g:0,
  r:'persoonsvorm, dus t', w:'De postbode is een hij, dus stam plus t. Vervang het door lopen: de postbode loopt.' },
{ v:2, s:'val', zin:'Het pakket is al %.', o:['bezorgd','bezorgt'], g:0,
  r:'na is: deelwoord', w:'Na is komt een voltooid deelwoord. Vervang het door lopen: het is gelopen. Dus bezorgd.' },
{ v:3, s:'val', zin:'De brief is vanmorgen %.', o:['verstuurd','verstuurt'], g:0,
  r:'na is: deelwoord', w:'Na is komt een voltooid deelwoord: verstuurd met een d.' },
{ v:3, s:'val', zin:'Hij % de brief vanmorgen.', o:['verstuurt','verstuurd'], g:0,
  r:'persoonsvorm, dus t', w:'Hier is versturen de persoonsvorm bij hij: stam plus t.' },
{ v:3, s:'val', zin:'Dat had ik niet %.', o:['verwacht','verwachtte'], g:0,
  r:'na had: deelwoord', w:'Na had komt een voltooid deelwoord: verwacht. Verwachtte is verleden tijd, en die past hier niet.' },
{ v:3, s:'val', zin:'Ik % dat het zou lukken.', o:['verwachtte','verwacht'], g:0,
  r:'verleden tijd, dus tte', w:'Hier vertel je over vroeger, dus verleden tijd. Stam verwacht plus te wordt verwachtte.' },
{ v:3, s:'val', zin:'De les wordt door hem %.', o:['gegeven','geeft'], g:0,
  r:'na wordt: deelwoord', w:'Na wordt komt een voltooid deelwoord. Wordt is hier de persoonsvorm, gegeven hoort erbij.' },
{ v:3, s:'val', zin:'Het % mij dat niemand iets zei.', o:['verbaasde','verbaasd'], g:0,
  r:'verleden tijd, dus de', w:"Verbazen eindigt op zen en de z zit niet in 't kofschip, dus de. Zonder is of heeft ervoor is het geen deelwoord." },
  { v:1, s:'tt', zin:'Zij % elke ochtend om zeven uur op.', o:['staat','staad'], g:0, r:'zij = stam + t', w:'Bij hij, zij en het komt er een t achter de stam. De stam van opstaan is sta.' },
  { v:1, s:'tt', zin:'% jij vanavond thuis?', o:['Blijf','Blijft'], g:0, r:'jij achter het werkwoord = stam', w:'Staat jij achter de persoonsvorm, dan valt de t weg: blijf jij.' },
  { v:1, s:'tt', zin:'De bus % altijd te laat.', o:['komd','komt'], g:1, r:'de bus = stam + t', w:'In de tegenwoordige tijd komt er nooit een d achter de stam, alleen een t.' },
  { v:2, s:'tt', zin:'Wat % jij daar nou?', o:['vindt','vind'], g:1, r:'jij achter het werkwoord = stam', w:'Vind jij, want jij staat achter de persoonsvorm. Vindt is voor hij, zij, het.' },
  { v:2, s:'tt', zin:'Mijn oma % nog elke dag de krant.', o:['leesd','leest'], g:1, r:'zij = stam + t', w:'De stam van lezen is lees; met de t erachter wordt het leest.' },
  { v:2, s:'tt', zin:'Het % vanmiddag hard.', o:['waaid','waait'], g:1, r:'het = stam + t', w:'De stam van waaien is waai. Ook al hoor je een d, in de tegenwoordige tijd is het altijd t.' },
  { v:3, s:'tt', zin:'Als je te laat %, moet je je melden.', o:['bent','bend'], g:0, r:'je = stam + t', w:'Bij je (jij) vóór het werkwoord komt er een t achter: je bent. Bend bestaat niet.' },
  { v:3, s:'tt', zin:'De directeur % dat we morgen vrij zijn.', o:['bevestigd','bevestigt'], g:1, r:'hij = stam + t', w:'Tegenwoordige tijd: stam bevestig + t. Bevestigd met een d is het voltooid deelwoord.' },
  { v:1, s:'vt', zin:'Gisteren % ik mijn kamer.', o:['ruimte','ruimde'], g:1, r:'stam ruim, m niet in \'t kofschip = -de', w:'Ruimte is een zelfstandig naamwoord. De verleden tijd van ruimen is ruimde.' },
  { v:1, s:'vt', zin:'Wij % vorige week bij oma.', o:['logeerden','logeerten'], g:0, r:'stam logeer, r niet in \'t kofschip = -den', w:'De r staat niet in \'t kofschip, dus -de(n): logeerden.' },
  { v:1, s:'vt', zin:'Hij % de hond aan de lijn.', o:['zetde','zette'], g:1, r:'stam zet, t in \'t kofschip = -te', w:'De stam zet eindigt op een t, dus zette.' },
  { v:2, s:'vt', zin:'De juf % de proefwerken gisteren na.', o:['kijkte','keek'], g:1, r:'sterk werkwoord', w:'Kijken is een sterk werkwoord: de klinker verandert. Kijk, keek, gekeken.' },
  { v:2, s:'vt', zin:'Ik % de hele tijd of hij nog kwam.', o:['vroeg','vraagde'], g:0, r:'sterk werkwoord', w:'Vragen is sterk: vraag, vroeg, gevraagd.' },
  { v:2, s:'vt', zin:'Zij % de tafel na het eten.', o:['dekte','dekde'], g:0, r:'stam dek, k in \'t kofschip = -te', w:'De k staat in \'t kofschip, dus -te: dekte.' },
  { v:3, s:'vt', zin:'Hij % zich gisteren nog voor zijn gedrag.', o:['verontschuldigte','verontschuldigde'], g:1, r:'stam verontschuldig, g niet in \'t kofschip = -de', w:'De stam eindigt op een g; die staat niet in \'t kofschip, dus -de.' },
  { v:3, s:'vt', zin:'De reddingsbrigade % de zwemmer net op tijd.', o:['redde','redte'], g:0, r:'stam red, d niet in \'t kofschip = -de', w:'De stam red eindigt op een d; dan komt er nog een d bij: redde.' },
  { v:3, s:'vt', zin:'Wij % ons de hele avond.', o:['verveelten','verveelden'], g:1, r:'stam verveel, l niet in \'t kofschip = -den', w:'De l staat niet in \'t kofschip, dus -den.' },
  { v:1, s:'vd', zin:'Ik heb de tafel al %.', o:['gedekt','gedekd'], g:0, r:'stam dek, k in \'t kofschip = -t', w:'Ge + stam + t, want de k staat in \'t kofschip.' },
  { v:1, s:'vd', zin:'Hij is gisteren naar Groningen %.', o:['verhuist','verhuisd'], g:1, r:'verhuizen: z niet in \'t kofschip = -d', w:'Let op: het werkwoord is verhuizen, met een z. De z staat niet in \'t kofschip, dus -d: verhuisd. Verhuist is de tegenwoordige tijd (hij verhuist).' },
  { v:2, s:'vd', zin:'Ze heeft het cadeau mooi %.', o:['ingepakd','ingepakt'], g:1, r:'stam pak, k in \'t kofschip = -t', w:'De k staat in \'t kofschip, dus ingepakt.' },
  { v:2, s:'vd', zin:'De wedstrijd is %.', o:['afgelasd','afgelast'], g:1, r:'stam last, t in \'t kofschip = -t', w:'Afgelasten: de stam last eindigt al op een t, dus afgelast.' },
  { v:2, s:'vd', zin:'Heb je je huiswerk al %?', o:['gemaakd','gemaakt'], g:1, r:'stam maak, k in \'t kofschip = -t', w:'De k staat in \'t kofschip, dus gemaakt.' },
  { v:3, s:'vd', zin:'De brand is snel %.', o:['geblusd','geblust'], g:1, r:'stam blus, s in \'t kofschip = -t', w:'Blussen, stam blus: de s staat in \'t kofschip, dus geblust.' },
  { v:3, s:'vd', zin:'Wij hebben de nieuwe leerling %.', o:['verwelkomt','verwelkomd'], g:1, r:'stam verwelkom, m niet in \'t kofschip = -d', w:'De m staat niet in \'t kofschip, dus -d. Verwelkomt is de tegenwoordige tijd.' },
  { v:3, s:'vd', zin:'De prijzen zijn dit jaar flink %.', o:['gesteigd','gestegen'], g:1, r:'sterk werkwoord', w:'Stijgen is sterk: stijg, steeg, gestegen.' },
  { v:1, s:'val', zin:'Wat % er straks in de gymzaal?', o:['gebeurt','gebeurd'], g:0, r:'tegenwoordige tijd = stam + t', w:'Er gebeurt iets nu: persoonsvorm, dus stam + t.' },
  { v:1, s:'val', zin:'Er is vannacht iets ergs %.', o:['gebeurt','gebeurd'], g:1, r:'is + voltooid deelwoord', w:'Na is of heeft komt het voltooid deelwoord: gebeurd, met een d.' },
  { v:2, s:'val', zin:'Zij % altijd op tijd.', o:['antwoord','antwoordt'], g:1, r:'zij = stam + t', w:'Persoonsvorm bij zij: stam antwoord + t. Antwoord zonder t is het zelfstandig naamwoord of de ik-vorm.' },
  { v:2, s:'val', zin:'Hij heeft me nog niet %.', o:['geantwoord','geantwoordt'], g:0, r:'heeft + voltooid deelwoord', w:'Voltooid deelwoord: ge + antwoord, en de stam eindigt al op een d.' },
  { v:3, s:'val', zin:'Dat % niet, denk ik.', o:['lukt','lukd'], g:0, r:'het = stam + t', w:'Tegenwoordige tijd van lukken: stam luk + t.' },
  { v:3, s:'val', zin:'Het is hem toch nog %.', o:['gelukt','gelukd'], g:0, r:'is + voltooid deelwoord, k in \'t kofschip', w:'Voltooid deelwoord van lukken: ge + luk + t, want de k staat in \'t kofschip.' },
  { v:3, s:'val', zin:'De trainer % het team elke week harder.', o:['belast','belastt'], g:0, r:'stam belast eindigt al op t', w:'Belasten: de stam is belast en die eindigt al op een t. Er komt geen tweede t bij.' }
];

/* De onregelmatige werkwoorden van Irregular verbs: hele werkwoord, verleden tijd, voltooid deelwoord, Nederlands, v is de set. */
var VERBS_IRREGULAR = [
{ w:'be', vt:'was/were', vd:'been', nl:'zijn', v:1,
  a:{vt:['was','were','was were']}, let:'I was, you were. Allebei goed gerekend.' },
{ w:'have', vt:'had', vd:'had', nl:'hebben', v:1 },
{ w:'do', vt:'did', vd:'done', nl:'doen', v:1 },
{ w:'go', vt:'went', vd:'gone', nl:'gaan', v:1 },
{ w:'come', vt:'came', vd:'come', nl:'komen', v:1, let:'Het deelwoord is gelijk aan het hele werkwoord.' },
{ w:'get', vt:'got', vd:'got', nl:'krijgen', v:1, a:{vd:['gotten']}, let:'In Amerikaans Engels is het deelwoord gotten.' },
{ w:'make', vt:'made', vd:'made', nl:'maken', v:1 },
{ w:'take', vt:'took', vd:'taken', nl:'nemen', v:1 },
{ w:'see', vt:'saw', vd:'seen', nl:'zien', v:1 },
{ w:'know', vt:'knew', vd:'known', nl:'weten, kennen', v:1 },
{ w:'think', vt:'thought', vd:'thought', nl:'denken', v:1 },
{ w:'say', vt:'said', vd:'said', nl:'zeggen', v:1 },
{ w:'tell', vt:'told', vd:'told', nl:'vertellen', v:1 },
{ w:'give', vt:'gave', vd:'given', nl:'geven', v:1 },
{ w:'find', vt:'found', vd:'found', nl:'vinden', v:1 },
{ w:'leave', vt:'left', vd:'left', nl:'vertrekken, achterlaten', v:1 },
{ w:'feel', vt:'felt', vd:'felt', nl:'voelen', v:1 },
{ w:'put', vt:'put', vd:'put', nl:'zetten, leggen', v:1, let:'Alle drie de vormen zijn hetzelfde.' },
{ w:'bring', vt:'brought', vd:'brought', nl:'brengen', v:1 },
{ w:'begin', vt:'began', vd:'begun', nl:'beginnen', v:1 },
{ w:'keep', vt:'kept', vd:'kept', nl:'houden, bewaren', v:1 },
{ w:'write', vt:'wrote', vd:'written', nl:'schrijven', v:1 },
{ w:'read', vt:'read', vd:'read', nl:'lezen', v:1, let:'Je schrijft alle drie hetzelfde, maar de verleden tijd spreek je uit als red.' },
{ w:'run', vt:'ran', vd:'run', nl:'rennen', v:1 },
{ w:'eat', vt:'ate', vd:'eaten', nl:'eten', v:1 },
{ w:'drink', vt:'drank', vd:'drunk', nl:'drinken', v:1 },
{ w:'sit', vt:'sat', vd:'sat', nl:'zitten', v:1 },
{ w:'stand', vt:'stood', vd:'stood', nl:'staan', v:1 },

{ w:'become', vt:'became', vd:'become', nl:'worden', v:2 },
{ w:'break', vt:'broke', vd:'broken', nl:'breken', v:2 },
{ w:'buy', vt:'bought', vd:'bought', nl:'kopen', v:2 },
{ w:'catch', vt:'caught', vd:'caught', nl:'vangen', v:2 },
{ w:'choose', vt:'chose', vd:'chosen', nl:'kiezen', v:2 },
{ w:'cut', vt:'cut', vd:'cut', nl:'snijden', v:2, let:'Alle drie de vormen zijn hetzelfde.' },
{ w:'drive', vt:'drove', vd:'driven', nl:'rijden', v:2 },
{ w:'fall', vt:'fell', vd:'fallen', nl:'vallen', v:2 },
{ w:'fly', vt:'flew', vd:'flown', nl:'vliegen', v:2 },
{ w:'forget', vt:'forgot', vd:'forgotten', nl:'vergeten', v:2 },
{ w:'grow', vt:'grew', vd:'grown', nl:'groeien', v:2 },
{ w:'hear', vt:'heard', vd:'heard', nl:'horen', v:2 },
{ w:'hit', vt:'hit', vd:'hit', nl:'slaan, raken', v:2, let:'Alle drie de vormen zijn hetzelfde.' },
{ w:'hold', vt:'held', vd:'held', nl:'vasthouden', v:2 },
{ w:'lose', vt:'lost', vd:'lost', nl:'verliezen', v:2 },
{ w:'meet', vt:'met', vd:'met', nl:'ontmoeten', v:2 },
{ w:'pay', vt:'paid', vd:'paid', nl:'betalen', v:2 },
{ w:'ring', vt:'rang', vd:'rung', nl:'bellen, rinkelen', v:2 },
{ w:'send', vt:'sent', vd:'sent', nl:'sturen', v:2 },
{ w:'sing', vt:'sang', vd:'sung', nl:'zingen', v:2 },
{ w:'sleep', vt:'slept', vd:'slept', nl:'slapen', v:2 },
{ w:'speak', vt:'spoke', vd:'spoken', nl:'spreken', v:2 },
{ w:'spend', vt:'spent', vd:'spent', nl:'uitgeven, doorbrengen', v:2 },
{ w:'swim', vt:'swam', vd:'swum', nl:'zwemmen', v:2 },
{ w:'teach', vt:'taught', vd:'taught', nl:'lesgeven', v:2 },
{ w:'understand', vt:'understood', vd:'understood', nl:'begrijpen', v:2 },
{ w:'wear', vt:'wore', vd:'worn', nl:'dragen (kleding)', v:2 },
{ w:'win', vt:'won', vd:'won', nl:'winnen', v:2 },

{ w:'bite', vt:'bit', vd:'bitten', nl:'bijten', v:3 },
{ w:'blow', vt:'blew', vd:'blown', nl:'blazen, waaien', v:3 },
{ w:'build', vt:'built', vd:'built', nl:'bouwen', v:3 },
{ w:'cost', vt:'cost', vd:'cost', nl:'kosten', v:3, let:'Alle drie de vormen zijn hetzelfde.' },
{ w:'draw', vt:'drew', vd:'drawn', nl:'tekenen', v:3 },
{ w:'fight', vt:'fought', vd:'fought', nl:'vechten', v:3 },
{ w:'hide', vt:'hid', vd:'hidden', nl:'verbergen', v:3 },
{ w:'hurt', vt:'hurt', vd:'hurt', nl:'pijn doen', v:3, let:'Alle drie de vormen zijn hetzelfde.' },
{ w:'lead', vt:'led', vd:'led', nl:'leiden', v:3 },
{ w:'lend', vt:'lent', vd:'lent', nl:'uitlenen', v:3 },
{ w:'let', vt:'let', vd:'let', nl:'laten', v:3, let:'Alle drie de vormen zijn hetzelfde.' },
{ w:'mean', vt:'meant', vd:'meant', nl:'bedoelen, betekenen', v:3 },
{ w:'ride', vt:'rode', vd:'ridden', nl:'rijden op', v:3 },
{ w:'rise', vt:'rose', vd:'risen', nl:'stijgen, opkomen', v:3 },
{ w:'sell', vt:'sold', vd:'sold', nl:'verkopen', v:3 },
{ w:'shine', vt:'shone', vd:'shone', nl:'schijnen', v:3 },
{ w:'shoot', vt:'shot', vd:'shot', nl:'schieten', v:3 },
{ w:'show', vt:'showed', vd:'shown', nl:'laten zien', v:3, let:'De verleden tijd is gewoon showed, alleen het deelwoord is onregelmatig.' },
{ w:'shut', vt:'shut', vd:'shut', nl:'sluiten', v:3, let:'Alle drie de vormen zijn hetzelfde.' },
{ w:'sink', vt:'sank', vd:'sunk', nl:'zinken', v:3 },
{ w:'steal', vt:'stole', vd:'stolen', nl:'stelen', v:3 },
{ w:'tear', vt:'tore', vd:'torn', nl:'scheuren', v:3 },
{ w:'throw', vt:'threw', vd:'thrown', nl:'gooien', v:3 },
{ w:'wake', vt:'woke', vd:'woken', nl:'wakker worden', v:3 },
{ w:'beat', vt:'beat', vd:'beaten', nl:'verslaan', v:3 },
{ w:'bend', vt:'bent', vd:'bent', nl:'buigen', v:3 },
{ w:'deal', vt:'dealt', vd:'dealt', nl:'omgaan met, verdelen', v:3 },
{ w:'dig', vt:'dug', vd:'dug', nl:'graven', v:3 },
{ w:'feed', vt:'fed', vd:'fed', nl:'voeden', v:3 },
{ w:'forgive', vt:'forgave', vd:'forgiven', nl:'vergeven', v:3 },
{ w:'freeze', vt:'froze', vd:'frozen', nl:'bevriezen', v:3 },
{ w:'hang', vt:'hung', vd:'hung', nl:'hangen', v:3, let:'Voor ophangen als straf gebruik je hanged, met een gewone d.' },
{ w:'lay', vt:'laid', vd:'laid', nl:'leggen', v:3, let:'Let op het verschil met lie: lay doe je met iets, lie doe je zelf.' },
{ w:'lie', vt:'lay', vd:'lain', nl:'liggen', v:3, let:'De verleden tijd van lie is lay, en dat is verwarrend genoeg ook een werkwoord op zich.' },
{ w:'light', vt:'lit', vd:'lit', nl:'aansteken', v:3 },
{ w:'quit', vt:'quit', vd:'quit', nl:'stoppen, ermee kappen', v:3, let:'Alle drie de vormen zijn hetzelfde.' },
{ w:'seek', vt:'sought', vd:'sought', nl:'zoeken', v:3 },
{ w:'shake', vt:'shook', vd:'shaken', nl:'schudden', v:3 },
{ w:'slide', vt:'slid', vd:'slid', nl:'glijden', v:3 },
{ w:'spread', vt:'spread', vd:'spread', nl:'verspreiden', v:3, let:'Alle drie de vormen zijn hetzelfde.' },
{ w:'stick', vt:'stuck', vd:'stuck', nl:'plakken, vastzitten', v:3 },
{ w:'strike', vt:'struck', vd:'struck', nl:'slaan, staken', v:3 },
{ w:'swear', vt:'swore', vd:'sworn', nl:'zweren, vloeken', v:3 },
{ w:'sweep', vt:'swept', vd:'swept', nl:'vegen', v:3 },
{ w:'swing', vt:'swung', vd:'swung', nl:'zwaaien, schommelen', v:3 },
{ w:'burn', vt:'burnt', vd:'burnt', nl:'branden', v:3,
  a:{vt:['burned'], vd:['burned']}, let:'Burnt en burned zijn allebei goed. Burnt is Brits, burned Amerikaans.' },
{ w:'learn', vt:'learnt', vd:'learnt', nl:'leren', v:3,
  a:{vt:['learned'], vd:['learned']}, let:'Learnt en learned zijn allebei goed.' },
{ w:'dream', vt:'dreamt', vd:'dreamt', nl:'dromen', v:3,
  a:{vt:['dreamed'], vd:['dreamed']}, let:'Dreamt en dreamed zijn allebei goed.' },
{ w:'smell', vt:'smelt', vd:'smelt', nl:'ruiken', v:3,
  a:{vt:['smelled'], vd:['smelled']}, let:'Smelt en smelled zijn allebei goed.' },
{ w:'spell', vt:'spelt', vd:'spelt', nl:'spellen', v:3,
  a:{vt:['spelled'], vd:['spelled']}, let:'Spelt en spelled zijn allebei goed.' },

{ w:'arise', vt:'arose', vd:'arisen', nl:'ontstaan, zich voordoen', v:4 },
{ w:'awake', vt:'awoke', vd:'awoken', nl:'ontwaken', v:4 },
{ w:'bear', vt:'bore', vd:'borne', nl:'dragen, verdragen', v:4,
  a:{vd:['born']}, let:'Born met de betekenis geboren is een apart geval: she was born in 2012.' },
{ w:'bet', vt:'bet', vd:'bet', nl:'wedden', v:4, let:'Alle drie de vormen zijn hetzelfde.' },
{ w:'bind', vt:'bound', vd:'bound', nl:'binden', v:4 },
{ w:'bleed', vt:'bled', vd:'bled', nl:'bloeden', v:4 },
{ w:'breed', vt:'bred', vd:'bred', nl:'fokken', v:4 },
{ w:'burst', vt:'burst', vd:'burst', nl:'barsten', v:4, let:'Alle drie de vormen zijn hetzelfde.' },
{ w:'cast', vt:'cast', vd:'cast', nl:'werpen', v:4, let:'Alle drie de vormen zijn hetzelfde.' },
{ w:'creep', vt:'crept', vd:'crept', nl:'kruipen, sluipen', v:4 },
{ w:'flee', vt:'fled', vd:'fled', nl:'vluchten', v:4 },
{ w:'forbid', vt:'forbade', vd:'forbidden', nl:'verbieden', v:4 },
{ w:'kneel', vt:'knelt', vd:'knelt', nl:'knielen', v:4, a:{vt:['kneeled'], vd:['kneeled']} },
{ w:'lean', vt:'leant', vd:'leant', nl:'leunen', v:4, a:{vt:['leaned'], vd:['leaned']} },
{ w:'leap', vt:'leapt', vd:'leapt', nl:'springen', v:4, a:{vt:['leaped'], vd:['leaped']} },
{ w:'sew', vt:'sewed', vd:'sewn', nl:'naaien', v:4, let:'De verleden tijd is gewoon sewed, alleen het deelwoord is onregelmatig.' },
{ w:'shrink', vt:'shrank', vd:'shrunk', nl:'krimpen', v:4 },
{ w:'speed', vt:'sped', vd:'sped', nl:'snellen, te hard rijden', v:4, a:{vt:['speeded'], vd:['speeded']} },
{ w:'spill', vt:'spilt', vd:'spilt', nl:'morsen', v:4, a:{vt:['spilled'], vd:['spilled']} },
{ w:'spit', vt:'spat', vd:'spat', nl:'spugen', v:4 },
{ w:'split', vt:'split', vd:'split', nl:'splitsen', v:4, let:'Alle drie de vormen zijn hetzelfde.' },
{ w:'spoil', vt:'spoilt', vd:'spoilt', nl:'bederven, verwennen', v:4, a:{vt:['spoiled'], vd:['spoiled']} },
{ w:'spring', vt:'sprang', vd:'sprung', nl:'springen, ontspringen', v:4 },
{ w:'sting', vt:'stung', vd:'stung', nl:'steken (van een insect)', v:4 },
{ w:'weep', vt:'wept', vd:'wept', nl:'huilen', v:4 },
{ w:'wind', vt:'wound', vd:'wound', nl:'opwinden, kronkelen', v:4 },
{ w:'withdraw', vt:'withdrew', vd:'withdrawn', nl:'terugtrekken, opnemen', v:4 }
];

/* De gebeurtenissen van Tijdvakken sorteren: tv is het tijdvak, met jaartal en waarom het daar hoort. */
var GEBEURTENISSEN_TIJDVAKKEN = [
  { tv:1, jaar:'ca. 10.000 v.Chr.', tekst:'Mensen gaan zaaien en oogsten in plaats van rondtrekken', waarom:'De landbouw hoort bij de tijd van jagers en boeren, nog ver voor het schrift.' },
  { tv:1, jaar:'ca. 5300 v.Chr.',   tekst:'De eerste boeren vestigen zich in Zuid-Limburg', waarom:'Nederlandse prehistorie: er is nog geen schrift, we weten dit uit opgravingen.' },
  { tv:1, jaar:'ca. 3000 v.Chr.',   tekst:'In Drenthe worden hunebedden gebouwd', waarom:'Grote grafmonumenten uit de steentijd, gemaakt door boerengemeenschappen.' },
  { tv:2, jaar:'508 v.Chr.',        tekst:'In Athene mogen burgers zelf stemmen in de volksvergadering', waarom:'De Griekse democratie hoort bij de tijd van Grieken en Romeinen.' },
  { tv:2, jaar:'218 v.Chr.',        tekst:'Hannibal trekt met olifanten over de Alpen', waarom:'De oorlogen tussen Rome en Carthago spelen in de klassieke oudheid.' },
  { tv:2, jaar:'ca. 50 na Chr.',    tekst:'De Romeinen bouwen forten langs de Rijn als grens van hun rijk', waarom:'De limes liep dwars door Nederland, midden in de Romeinse tijd.' },
  { tv:3, jaar:'690',               tekst:'Willibrord komt naar de Lage Landen om te kerstenen', waarom:'Monniken verspreidden het christendom in de vroege middeleeuwen.' },
  { tv:3, jaar:'800',               tekst:'Karel de Grote wordt in Rome tot keizer gekroond', waarom:'Het Frankische rijk is het hoogtepunt van de tijd van monniken en ridders.' },
  { tv:3, jaar:'834',               tekst:'Vikingen plunderen de handelsplaats Dorestad', waarom:'De Vikingtochten vallen in de vroege middeleeuwen, voor het jaar 1000.' },
  { tv:4, jaar:'1220',              tekst:'Dordrecht krijgt als eerste stad in Holland stadsrechten', waarom:'Stadsrechten horen bij de opkomst van steden na het jaar 1000.' },
  { tv:4, jaar:'1349',              tekst:'De pest bereikt de Lage Landen', waarom:'De zwarte dood raast in de late middeleeuwen door Europa.' },
  { tv:4, jaar:'14e eeuw',          tekst:'Steden werken samen in de Hanze om handel te beschermen', waarom:'Het Hanzeverbond hoort bij de bloei van de steden voor 1500.' },
  { tv:5, jaar:'1517',              tekst:'Luther maakt zijn kritiek op de kerk openbaar', waarom:'De Reformatie is het hart van de tijd van ontdekkers en hervormers.' },
  { tv:5, jaar:'1522',              tekst:'Een schip keert terug na de eerste reis om de wereld', waarom:'De grote ontdekkingsreizen vallen in de zestiende eeuw.' },
  { tv:5, jaar:'1566',              tekst:'In de Beeldenstorm worden beelden uit kerken vernield', waarom:'Het begin van de Opstand hoort nog bij de zestiende eeuw.' },
  { tv:6, jaar:'1602',              tekst:'De VOC wordt opgericht als eerste bedrijf met aandelen', waarom:'De VOC hoort bij de Republiek in de zeventiende eeuw.' },
  { tv:6, jaar:'1642',              tekst:'Rembrandt schildert de Nachtwacht', waarom:'De schilderkunst van de Republiek valt midden in de tijd van regenten en vorsten.' },
  { tv:6, jaar:'1667',              tekst:'De Ruyter vaart de Theems op en sleept het Engelse vlaggenschip mee', waarom:'De Engelse oorlogen horen bij de zeventiende eeuw.' },
  { tv:7, jaar:'1776',              tekst:'De Amerikaanse koloniën verklaren zich onafhankelijk', waarom:'De revoluties van de achttiende eeuw horen bij pruiken en revoluties.' },
  { tv:7, jaar:'1789',              tekst:'In Parijs breekt de revolutie uit', waarom:'De Franse Revolutie is hét voorbeeld van dit tijdvak.' },
  { tv:7, jaar:'1795',              tekst:'De Bataafse Republiek wordt uitgeroepen', waarom:'Nederland verandert onder Franse invloed, eind achttiende eeuw.' },
  { tv:8, jaar:'1839',              tekst:'De eerste trein rijdt van Amsterdam naar Haarlem', waarom:'De stoommachine en het spoor horen bij de negentiende eeuw.' },
  { tv:8, jaar:'1863',              tekst:'De slavernij in Suriname en op de Cariben wordt afgeschaft', waarom:'De afschaffing valt in de tijd van burgers en stoommachines.' },
  { tv:8, jaar:'1874',              tekst:'Het kinderwetje verbiedt fabrieksarbeid door jonge kinderen', waarom:'De eerste sociale wetten komen in de negentiende eeuw.' },
  { tv:9, jaar:'1914',              tekst:'In Europa breekt de Eerste Wereldoorlog uit', waarom:'De wereldoorlogen vormen samen het tijdvak 1900 tot 1950.' },
  { tv:9, jaar:'1940',              tekst:'Duitse troepen vallen Nederland binnen', waarom:'De bezetting hoort midden in de tijd van de wereldoorlogen.' },
  { tv:9, jaar:'1945',              tekst:'Nederland wordt bevrijd', waarom:'Het einde van de Tweede Wereldoorlog valt nog binnen dit tijdvak.' },
  { tv:10, jaar:'1953',             tekst:'De watersnoodramp treft Zeeland en Zuid-Holland', waarom:'Na 1950, in de tijd van televisie en computer.' },
  { tv:10, jaar:'1969',             tekst:'De eerste mens zet voet op de maan', waarom:'De ruimtevaart hoort bij de tweede helft van de twintigste eeuw.' },
  { tv:10, jaar:'1989',             tekst:'De Berlijnse Muur valt', waarom:'Het einde van de Koude Oorlog valt in het laatste tijdvak.' },
  { tv:1, jaar:'ca. 12.000 v.Chr.', tekst:'Kleine groepen trekken achter kuddes aan en verzamelen wat ze onderweg vinden', waarom:'Jagen en verzamelen is de oudste levenswijze, voor de landbouw.' },
  { tv:2, jaar:'ca. 400 v.Chr.',    tekst:'Griekse denkers zoeken verklaringen in de natuur in plaats van bij goden', waarom:'Het begin van wetenschappelijk denken hoort bij de Grieken.' },
  { tv:2, jaar:'313',               tekst:'Het christendom wordt in het Romeinse rijk toegestaan', waarom:'Nog binnen de Romeinse tijd, ruim voor het jaar 500.' },
  { tv:3, jaar:'622',               tekst:'Mohammed vertrekt naar Medina en de islam begint zich te verspreiden', waarom:'De opkomst van de islam valt in de vroege middeleeuwen.' },
  { tv:4, jaar:'1096',              tekst:'De eerste kruistocht vertrekt naar het oosten', waarom:'De kruistochten horen bij de late middeleeuwen, na het jaar 1000.' },
  { tv:4, jaar:'1421',              tekst:'De Sint-Elisabethsvloed verzwelgt dorpen in de Grote Waard', waarom:'Vijftiende eeuw, dus nog net binnen de middeleeuwen.' },
  { tv:5, jaar:'1568',              tekst:'De Opstand tegen de Spaanse koning begint', waarom:'Het begin van de Tachtigjarige Oorlog valt in de zestiende eeuw.' },
  { tv:5, jaar:'1596',              tekst:'De eerste Nederlandse schepen bereiken Indie', waarom:'Nog voor de VOC, dus in de tijd van de ontdekkers.' },
  { tv:6, jaar:'1609',              tekst:'De Amsterdamse Wisselbank opent haar deuren', waarom:'Het handelskapitalisme van de Republiek hoort bij de zeventiende eeuw.' },
  { tv:6, jaar:'1672',              tekst:'Het rampjaar: de Republiek wordt van vier kanten aangevallen', waarom:'Midden in de tijd van regenten en vorsten.' },
  { tv:7, jaar:'1740',              tekst:'Denkers stellen dat je met je verstand alles kunt onderzoeken', waarom:'De Verlichting is het hart van de achttiende eeuw.' },
  { tv:7, jaar:'1791',              tekst:'Op Haiti komen tot slaaf gemaakte mensen in opstand', waarom:'De opstand hoort bij de revoluties van de late achttiende eeuw.' },
  { tv:8, jaar:'1848',              tekst:'Thorbecke schrijft een nieuwe grondwet met meer macht voor het parlement', waarom:'De liberale hervormingen vallen in de negentiende eeuw.' },
  { tv:8, jaar:'1884',              tekst:'Europese landen verdelen Afrika onder elkaar op een conferentie', waarom:'Het modern imperialisme hoort bij het eind van de negentiende eeuw.' },
  { tv:9, jaar:'1929',              tekst:'De beurs stort in en de wereld raakt in een diepe crisis', waarom:'De crisisjaren vallen tussen de twee wereldoorlogen.' },
  { tv:9, jaar:'1942',              tekst:'De vernietiging van de Joden in Europa komt op gang', waarom:'De Holocaust hoort bij het tijdvak van de wereldoorlogen.' },
  { tv:10, jaar:'1949',             tekst:'Indonesie wordt onafhankelijk van Nederland', waarom:'Let op: dit valt net in het tijdvak dat in 1950 begint volgens de leerstof, maar hoort inhoudelijk bij de dekolonisatie na de oorlog.' },
  { tv:10, jaar:'1957',             tekst:'Zes landen richten samen de voorloper van de Europese Unie op', waarom:'De Europese eenwording hoort bij de tijd na 1950.' },
  { tv:10, jaar:'1989',             tekst:'Steeds meer huishoudens krijgen een computer in huis', waarom:'De computer thuis hoort bij het laatste tijdvak.' },
  { tv:1, jaar:'ca. 17.000 v.Chr.', tekst:'In de grot van Lascaux worden paarden en stieren op de wand geschilderd', waarom:'Grotschilderingen zijn gemaakt door jagers-verzamelaars, lang voor de landbouw en het schrift.' },
  { tv:1, jaar:'ca. 3500 v.Chr.', tekst:'In Mesopotamië groeien dorpen uit tot de eerste steden, zoals Uruk', waarom:'De eerste steden ontstonden nog vóór 3000 v.Chr., dus aan het eind van de tijd van jagers en boeren.' },
  { tv:2, jaar:'753 v.Chr.', tekst:'Volgens de overlevering wordt Rome gesticht', waarom:'De Romeinen rekenden hun jaren vanaf de stichting van de stad. Het hoort bij de tijd van Grieken en Romeinen.' },
  { tv:2, jaar:'69', tekst:'De Bataven komen onder leiding van Julius Civilis in opstand tegen de Romeinen', waarom:'De Bataven woonden in het rivierengebied binnen het Romeinse rijk. Hun opstand hoort bij de Romeinse tijd.' },
  { tv:3, jaar:'754', tekst:'Bonifatius wordt bij Dokkum gedood', waarom:'Bonifatius was een missionaris die de Friezen wilde bekeren. Kerstening hoort bij de tijd van monniken en ridders.' },
  { tv:3, jaar:'843', tekst:'Het rijk van Karel de Grote wordt bij het Verdrag van Verdun in drieën verdeeld', waarom:'Na Karels kleinzonen viel het Frankische rijk uiteen. Dat gebeurde in de vroege middeleeuwen.' },
  { tv:4, jaar:'1099', tekst:'Kruisvaarders veroveren Jeruzalem', waarom:'De kruistochten horen bij de tijd van steden en staten: de kerk was machtig en ridders trokken naar het oosten.' },
  { tv:4, jaar:'1492', tekst:'Columbus bereikt Amerika', waarom:'Let op het jaartal: 1492 valt nog net in tijdvak 4, dat tot 1500 loopt. De gevolgen horen bij de tijd van ontdekkers en hervormers.' },
  { tv:5, jaar:'1519', tekst:'Magellaan vertrekt voor een reis rond de wereld', waarom:'Ontdekkingsreizen zijn het kenmerk van de tijd van ontdekkers en hervormers.' },
  { tv:5, jaar:'1581', tekst:'Met het Plakkaat van Verlatinghe zetten de Staten-Generaal koning Filips II af', waarom:'De Opstand tegen Spanje hoort bij de tijd van ontdekkers en hervormers, net als de reformatie die eraan voorafging.' },
  { tv:6, jaar:'1648', tekst:'Met de Vrede van Münster erkent Spanje de Republiek', waarom:'Het einde van de Tachtigjarige Oorlog valt midden in de Gouden Eeuw, de tijd van regenten en vorsten.' },
  { tv:6, jaar:'1685', tekst:'Lodewijk XIV verbiedt het protestantse geloof in Frankrijk; veel hugenoten vluchten naar de Republiek', waarom:'Een absolute vorst die bepaalt wat zijn onderdanen geloven: typisch voor de tijd van regenten en vorsten.' },
  { tv:7, jaar:'1798', tekst:'Nederland krijgt zijn eerste grondwet', waarom:'De Staatsregeling van de Bataafse Republiek kwam voort uit de ideeën van de verlichting en de Franse Revolutie.' },
  { tv:7, jaar:'1799', tekst:'De VOC wordt opgeheven', waarom:'Na bijna twee eeuwen ging de compagnie failliet; dat gebeurde aan het eind van de tijd van pruiken en revoluties.' },
  { tv:8, jaar:'1830', tekst:'België scheidt zich af van het Koninkrijk der Nederlanden', waarom:'De Belgische Revolutie hoort bij de 19e eeuw, de tijd van burgers en stoommachines.' },
  { tv:8, jaar:'1898', tekst:'Wilhelmina wordt ingehuldigd als koningin', waarom:'1898 valt nog in de 19e eeuw en hoort dus bij de tijd van burgers en stoommachines.' },
  { tv:9, jaar:'1919', tekst:'Vrouwen krijgen in Nederland kiesrecht', waarom:'Het algemeen kiesrecht kwam er in de jaren rond de Eerste Wereldoorlog, in de tijd van de wereldoorlogen.' },
  { tv:9, jaar:'1941', tekst:'Amsterdammers staken uit protest tegen de razzia\'s op joodse mannen', waarom:'De Februaristaking vond plaats tijdens de Duitse bezetting, in de tijd van de wereldoorlogen.' },
  { tv:10, jaar:'1975', tekst:'Suriname wordt onafhankelijk', waarom:'Dekolonisatie hoort bij de tijd van televisie en computer.' },
  { tv:10, jaar:'2002', tekst:'De euro vervangt de gulden', waarom:'Europese samenwerking is een kenmerk van de tijd na 1950.' }
];
