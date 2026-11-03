/* De leesbank: teksten om leesstrategieën en leesvaardigheden mee te oefenen,
   op papier (werkblad-lezen.js, het opdrachtenboek) en op het scherm
   (leesstrategieen.html). De teksten zelf staan in leesteksten.js; hoe ze
   eruitzien maakt leesblad.js.

   ---------- de doelen ----------
   DOELEN: de zes strategieën en de negen vaardigheden, elk met een kaartje
   "Zo lees je" van drie stappen. Een tekst hoort bij één strategie (strat),
   en heeft taken voor die strategie en voor een paar vaardigheden.

   ---------- een tekst ----------
   LEESBANK.T({
     id:'zwembad', niv:'1F', strat:'zoekend', titel:'Zwembad De Golf',
     vorm:'folder',            artikel | folder | website | post | bronnen | leertekst | instructie | verhaal | brief | rooster
     bron:'Folder van het zwembad',   wie het maakte (mag weg)
     tijd:0,                   leestijd in seconden (mag weg)
     intro:'…',                de situatie: waarom lees je (mag weg; vooral bij bronnen)
     alineas:['…', '…'],       de tekst in alinea's (artikel, leertekst, instructie, verhaal, brief)
     blokken:[{ kop, tekst } | { kop, lijst:[[links, rechts], …] } | { kop, tabel:[[kop, kop], [cel, cel], …] }],
                               folder, website, rooster (mag ook naast alineas)
     bronnen:[{ titel, soort, maker, kopjes:[…], tekst }],          bronnen (verkennend lezen); letters A, B, C… vanzelf
     post:{ afzender, label, kop, zinnen:[…] },                      post; de zinnen krijgen een nummer
     naast:{ kop, bron, tekst },                                     een tweede korte tekst ernaast (mag weg)
     taken:{ zoekend:[opdracht, …], woord:[opdracht, …] }
   });
   In tekst mag **vet** en __onderstreept__; verder geen html.

   ---------- een opdracht ----------
     { t:'keuze', v, o:[goed, fout, fout(, fout)], u }        meerkeuze; de eerste optie is goed
     { t:'raster', v, kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[{ z, g, al }], u }
                                                              per rij een keuze uit kol (g is de index); al = alinea (mag weg)
     { t:'koppel', v, links:[…], rechts:[…], extra:[…], u }   rechts[i] hoort bij links[i]; extra blijft over
     { t:'volgorde', v, stappen:[…], u }                       stappen in de goede volgorde
     { t:'zoek', v, vragen:[{ v, s, a:[…] }] }                 s = sleutelwoord, a = goede antwoorden (de eerste is het model)
     { t:'open', v, m, r, b, max }                             m = modelantwoord, r = lijnen, b = begin, max = woorden
     { t:'schema', v, vakken:[…], m:[…], vb }                  een rij vakken met pijlen; vb = index van een ingevuld voorbeeld
     { t:'markeer', v, al, n, goed:[…] }                       n woorden markeren in alinea al (vanaf 0); goed = woorden die mogen
   u is de uitleg bij het antwoord (mag weg). */
window.LEESBANK = (function(){
  'use strict';
  var DOELEN = [
    { id:'verkennend', soort:'strategie', naam:'Verkennend lezen', kort:'Bekijk titel, kopjes en plaatjes en beslis of je iets aan de tekst hebt',
      zo:['Lees alleen de titel, de kopjes en de plaatjes.', 'Kijk wie het maakte en waarom.', 'Beslis: heb ik hier iets aan?'] },
    { id:'globaal', soort:'strategie', naam:'Globaal lezen', kort:'Lees snel door en weet waar de tekst over gaat',
      zo:['Lees snel door. Stop niet bij een moeilijk woord.', 'Let op de eerste zin van elke alinea.', 'Vraag je af: waar gaat dit stuk over?'] },
    { id:'zoekend', soort:'strategie', naam:'Zoekend lezen', kort:'Zoek met een sleutelwoord snel één gegeven',
      zo:['Wat zoek je? Onderstreep het sleutelwoord in de vraag.', 'Laat je ogen over de tekst gaan tot je dat woord ziet.', 'Lees alleen daar. De rest sla je over.'] },
    { id:'nauwkeurig', soort:'strategie', naam:'Nauwkeurig lezen', kort:'Lees elk woord en zoek de plek terug',
      zo:['Lees langzaam, zin voor zin. Elk woord telt.', 'Let op kleine woorden: nooit, altijd, alleen, pas, niet.', 'Zoek bij elke vraag de plek terug. Gok niet.'] },
    { id:'kritisch', soort:'strategie', naam:'Kritisch lezen', kort:'Feit of mening, wie schrijft dit en waarom',
      zo:['Wie schreef dit, en wat wil die van jou?', 'Feit of mening? Een feit kun je nagaan.', 'Waar komt een getal vandaan? Kun je het controleren?'] },
    { id:'studerend', soort:'strategie', naam:'Studerend lezen', kort:'Markeer, maak een schema en overhoor jezelf',
      zo:['Lees per alinea en markeer alleen de kernwoorden.', 'Zet de stof in een schema in je eigen woorden.', 'Overhoor jezelf: wat zou de docent vragen?'] },
    { id:'onderwerp', soort:'vaardigheid', naam:'Onderwerp en hoofdgedachte', kort:'Waar gaat het over, en wat zegt de schrijver erover?',
      zo:['Het onderwerp is kort: waar gaat de tekst over?', 'Kijk naar de titel, de inleiding en het slot.', 'De hoofdgedachte is één zin: wat zegt de schrijver over het onderwerp?'] },
    { id:'doel', soort:'vaardigheid', naam:'Tekstdoel en tekstsoort', kort:'Wat wil de schrijver bij jou bereiken?',
      zo:['Wil de schrijver dat je iets weet, vindt, doet of leuk vindt?', 'Kijk naar de vorm: folder, nieuwsbericht, reclame, verhaal.', 'Bewijs het met woorden uit de tekst.'] },
    { id:'alinea', soort:'vaardigheid', naam:'Kernzinnen en alinea’s', kort:'Vind de kernzin en de functie van een alinea',
      zo:['Een alinea gaat over één ding.', 'De kernzin staat vaak vooraan, soms achteraan.', 'Vraag je af wat de alinea doet: inleiden, uitleggen, een voorbeeld geven, afsluiten.'] },
    { id:'signaal', soort:'vaardigheid', naam:'Signaalwoorden en verbanden', kort:'Welk woord verbindt de zinnen, en hoe?',
      zo:['Zoek het woord dat twee zinnen of delen verbindt.', 'Bedenk welk verband het geeft: oorzaak, tegenstelling, opsomming, doel...', 'Zet het verband in een schema.'] },
    { id:'verwijs', soort:'vaardigheid', naam:'Verwijswoorden', kort:'Naar wie of wat verwijst het woord?',
      zo:['Zoek het verwijswoord: hij, zij, het, die, dat, daar, hun...', 'Kijk terug in de zin of de zin ervoor.', 'Zet het gevonden woord op de plek van het verwijswoord. Klopt de zin nog?'] },
    { id:'samenvat', soort:'vaardigheid', naam:'Samenvatten', kort:'De kern in weinig woorden',
      zo:['Zoek per alinea de kern.', 'Laat voorbeelden en bijzaken weg.', 'Schrijf het in je eigen woorden en tel je woorden.'] },
    { id:'tussen', soort:'vaardigheid', naam:'Tussen de regels lezen', kort:'Het staat er niet, maar je weet het wel',
      zo:['Wat doet of zegt iemand precies?', 'Wat zegt dat over wat diegene voelt of denkt?', 'Noem de woorden uit de tekst die het verraden.'] },
    { id:'woord', soort:'vaardigheid', naam:'Woordbetekenis uit de tekst', kort:'Een moeilijk woord afleiden uit de zinnen eromheen',
      zo:['Lees de zin met het woord, en de zin ervoor en erna.', 'Welke woorden in de buurt helpen je?', 'Vul jouw betekenis in op de plek van het woord. Klopt de zin?'] },
    { id:'argument', soort:'vaardigheid', naam:'Standpunt en argumenten', kort:'Wat vindt de schrijver, en waarom?',
      zo:['Zoek het standpunt: wat vindt de schrijver?', 'Zoek de argumenten: waarom vindt die dat?', 'Let op signaalwoorden als want, omdat, daarom en dus.'] }
  ];
  var NIVEAUS = [
    { id:'1F', naam:'1F', uit:'Korte teksten en duidelijke vragen. Past bij vmbo-bb en de eerste klassen.' },
    { id:'2F', naam:'2F', uit:'Langere teksten met meer details. Past bij vmbo-kgt en tl, en havo en vwo onderbouw.' },
    { id:'3F', naam:'3F', uit:'Lange teksten met lastige woorden en tussen de regels lezen. Past bij havo en vwo bovenbouw.' }
  ];
  var VORMEN = { artikel:'artikel', folder:'folder', website:'website', post:'bericht op sociale media', bronnen:'bronnen', leertekst:'leertekst',
    instructie:'instructie', verhaal:'verhaal', brief:'brief', rooster:'rooster' };
  var TEKSTEN = [], OP = {};
  function T(t){ if (!t || !t.id || OP[t.id]) return; t.taken = t.taken || {}; TEKSTEN.push(t); OP[t.id] = t; }
  function doel(id){ return DOELEN.filter(function(d){ return d.id === id; })[0] || null; }
  /* teksten met taken voor dit doel, op dit niveau (of alle niveaus) */
  function teksten(doelId, niv){
    return TEKSTEN.filter(function(t){ return (!doelId || (t.taken[doelId] || []).length) && (!niv || t.niv === niv); });
  }
  return { DOELEN:DOELEN, NIVEAUS:NIVEAUS, VORMEN:VORMEN, TEKSTEN:TEKSTEN, T:T, doel:doel, teksten:teksten, tekst:function(id){ return OP[id] || null; } };
})();
