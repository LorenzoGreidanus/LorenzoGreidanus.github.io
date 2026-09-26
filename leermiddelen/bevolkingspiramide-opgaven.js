/* Bevolkingspiramides: per land het aandeel van de bevolking per
   leeftijdsgroep van tien jaar, mannen en vrouwen apart, in procenten van de
   hele bevolking. De cijfers zijn afgerond en bij benadering (rond 2022, naar
   de gegevens van de Verenigde Naties), zoals in een schoolatlas: de vorm is
   wat telt. soort: groei (piramide), stabiel (klok) of krimp (urn).
   bb: true bij de landen met een duidelijke vorm, voor vmbo-bb. */
window.PIRAMIDES = [
  /* ---------- groei: de piramide ---------- */
  { land:'Niger', soort:'groei', bb:true, uit:'heel brede basis: veel kinderen, weinig ouderen', levensverwachting:62, geboorte:45, sterfte:9,
    m:[10.0, 7.2, 5.4, 3.9, 2.7, 1.8, 1.0, 0.5, 0.2, 0.1], v:[9.8, 7.0, 5.4, 4.0, 2.8, 1.9, 1.1, 0.6, 0.3, 0.1] },
  { land:'Nigeria', soort:'groei', bb:true, uit:'brede basis die naar boven snel smaller wordt', levensverwachting:54, geboorte:36, sterfte:12,
    m:[8.4, 6.7, 5.3, 4.1, 3.2, 2.3, 1.5, 0.8, 0.3, 0.1], v:[8.1, 6.4, 5.2, 4.1, 3.2, 2.3, 1.6, 0.9, 0.4, 0.1] },
  { land:'Ethiopië', soort:'groei', bb:true, uit:'brede basis, elke oudere groep kleiner', levensverwachting:66, geboorte:31, sterfte:6,
    m:[7.3, 6.3, 5.5, 4.4, 3.2, 2.1, 1.4, 0.8, 0.4, 0.1], v:[7.1, 6.1, 5.4, 4.4, 3.3, 2.2, 1.5, 0.9, 0.4, 0.1] },
  { land:'Uganda', soort:'groei', bb:true, uit:'bijna de helft van de bevolking is jonger dan 20', levensverwachting:63, geboorte:37, sterfte:6,
    m:[9.0, 7.4, 5.8, 4.0, 2.5, 1.5, 0.9, 0.4, 0.2, 0.1], v:[8.9, 7.3, 5.9, 4.2, 2.7, 1.7, 1.1, 0.6, 0.3, 0.1] },
  { land:'Congo (DRC)', soort:'groei', bb:true, uit:'een echte piramide: elke groep kleiner dan de groep eronder', levensverwachting:60, geboorte:41, sterfte:9,
    m:[9.2, 7.3, 5.5, 3.9, 2.6, 1.7, 1.0, 0.5, 0.2, 0.1], v:[9.1, 7.2, 5.5, 4.0, 2.7, 1.8, 1.1, 0.6, 0.3, 0.1] },
  { land:'Kenia', soort:'groei', bb:true, uit:'brede basis en weinig ouderen, maar de jongste groep is niet meer veel groter dan de tieners', levensverwachting:63, geboorte:27, sterfte:8,
    m:[7.0, 6.3, 5.3, 4.1, 2.9, 1.9, 1.1, 0.5, 0.2, 0.1], v:[6.9, 6.2, 5.3, 4.2, 3.0, 2.0, 1.3, 0.6, 0.3, 0.1] },
  { land:'Pakistan', soort:'groei', bb:true, uit:'brede basis, veel jongeren en weinig ouderen', levensverwachting:67, geboorte:27, sterfte:7,
    m:[6.5, 6.0, 5.3, 4.2, 3.2, 2.3, 1.5, 0.8, 0.3, 0.1], v:[6.2, 5.7, 5.1, 4.1, 3.1, 2.3, 1.5, 0.9, 0.4, 0.1] },
  { land:'Egypte', soort:'groei', bb:true, uit:'de jongste groep is de grootste: de bevolking groeit nog hard', levensverwachting:71, geboorte:23, sterfte:6,
    m:[6.4, 5.0, 4.3, 4.0, 3.3, 2.6, 1.7, 0.8, 0.3, 0.1], v:[6.0, 4.8, 4.2, 3.9, 3.2, 2.6, 1.8, 0.9, 0.4, 0.1] },
  { land:'India', soort:'groei', bb:true, uit:'nog een brede basis, maar de jongste groepen worden al kleiner', levensverwachting:70, geboorte:17, sterfte:7,
    m:[4.4, 4.7, 4.5, 4.0, 3.4, 2.7, 2.0, 1.2, 0.5, 0.1], v:[4.1, 4.3, 4.2, 3.9, 3.4, 2.7, 2.0, 1.3, 0.6, 0.2] },
  { land:'Filipijnen', soort:'groei', bb:true, uit:'brede basis die langzaam smaller wordt: de groei neemt af', levensverwachting:72, geboorte:20, sterfte:7,
    m:[5.2, 5.0, 4.7, 4.0, 3.2, 2.5, 1.7, 0.8, 0.3, 0.1], v:[4.9, 4.7, 4.5, 3.9, 3.2, 2.6, 1.9, 1.1, 0.5, 0.1] },
  { land:'Mexico', soort:'groei', uit:'basis wordt smaller: de groei neemt af', levensverwachting:75, geboorte:15, sterfte:7,
    m:[4.2, 4.3, 4.3, 3.9, 3.4, 2.7, 2.0, 1.2, 0.6, 0.2], v:[4.0, 4.1, 4.2, 3.9, 3.5, 2.9, 2.2, 1.5, 0.8, 0.3] },
  /* ---------- stabiel: de klok ---------- */
  { land:'Brazilië', soort:'stabiel', bb:true, uit:'de jongste groepen zijn niet meer de grootste: de groei stopt', levensverwachting:76, geboorte:13, sterfte:7,
    m:[3.4, 3.6, 3.9, 4.1, 3.6, 3.0, 2.2, 1.3, 0.6, 0.2], v:[3.3, 3.4, 3.8, 4.1, 3.7, 3.2, 2.5, 1.7, 0.9, 0.4] },
  { land:'Turkije', soort:'stabiel', uit:'de groepen tot 40 jaar zijn bijna even breed: de groei is voorbij', levensverwachting:76, geboorte:14, sterfte:6,
    m:[3.7, 3.9, 3.9, 3.9, 3.4, 3.0, 2.1, 1.1, 0.5, 0.1], v:[3.5, 3.7, 3.7, 3.7, 3.4, 3.1, 2.4, 1.5, 0.8, 0.2] },
  { land:'Vietnam', soort:'stabiel', uit:'de dertigers zijn de grootste groep, de kinderen niet meer', levensverwachting:74, geboorte:15, sterfte:6,
    m:[4.0, 3.9, 3.9, 4.2, 3.7, 2.9, 2.3, 1.0, 0.5, 0.1], v:[3.7, 3.7, 3.7, 4.1, 3.7, 3.1, 2.6, 1.4, 0.8, 0.3] },
  { land:'Argentinië', soort:'stabiel', uit:'rechte zijkanten tot 50 jaar, daarna geleidelijk smaller', levensverwachting:76, geboorte:15, sterfte:8,
    m:[3.7, 3.9, 3.8, 3.7, 3.3, 2.7, 2.2, 1.4, 0.6, 0.2], v:[3.5, 3.7, 3.7, 3.6, 3.3, 2.8, 2.5, 1.8, 1.1, 0.4] },
  { land:'Verenigde Staten', soort:'stabiel', bb:true, uit:'bijna even brede groepen tot 60 jaar: een klokvorm', levensverwachting:77, geboorte:11, sterfte:10,
    m:[3.0, 3.3, 3.4, 3.5, 3.1, 3.0, 3.0, 2.2, 1.2, 0.4], v:[2.9, 3.2, 3.3, 3.4, 3.1, 3.1, 3.2, 2.6, 1.6, 0.8] },
  { land:'Australië', soort:'stabiel', bb:true, uit:'even brede groepen tot 60 jaar en veel immigranten van 30 tot 40', levensverwachting:83, geboorte:12, sterfte:7,
    m:[3.1, 3.0, 3.5, 3.7, 3.2, 3.0, 2.7, 2.0, 1.0, 0.3], v:[2.9, 2.9, 3.4, 3.6, 3.2, 3.1, 2.8, 2.2, 1.3, 0.5] },
  { land:'Frankrijk', soort:'stabiel', bb:true, uit:'rechte zijkanten tot 70 jaar: een klok', levensverwachting:82, geboorte:11, sterfte:10,
    m:[2.8, 3.1, 2.9, 3.1, 3.2, 3.3, 2.9, 2.3, 1.1, 0.3], v:[2.7, 3.0, 2.9, 3.1, 3.2, 3.4, 3.1, 2.7, 1.8, 0.8] },
  { land:'Verenigd Koninkrijk', soort:'stabiel', bb:true, uit:'even brede groepen tot 60 jaar, daarna smaller', levensverwachting:81, geboorte:11, sterfte:10,
    m:[2.9, 3.0, 3.2, 3.4, 3.1, 3.4, 2.7, 2.2, 1.0, 0.3], v:[2.8, 2.9, 3.1, 3.4, 3.2, 3.5, 2.9, 2.4, 1.5, 0.6] },
  { land:'Nederland', soort:'stabiel', bb:true, uit:'de groepen van 50 tot 70 zijn groot: de babyboom wordt ouder', levensverwachting:82, geboorte:10, sterfte:10,
    m:[2.5, 2.9, 3.2, 3.1, 3.0, 3.7, 3.2, 2.6, 1.3, 0.3], v:[2.4, 2.8, 3.1, 3.0, 3.0, 3.6, 3.2, 2.7, 1.8, 0.7] },
  /* ---------- krimp: de urn ---------- */
  { land:'China', soort:'krimp', bb:true, uit:'smalle basis na de eenkindpolitiek; de dertigers en vijftigers zijn de grootste groepen', levensverwachting:78, geboorte:7, sterfte:8,
    m:[3.0, 3.0, 3.1, 4.2, 3.3, 4.2, 3.3, 1.7, 0.5, 0.1], v:[2.7, 2.7, 2.9, 4.0, 3.2, 4.1, 3.2, 1.8, 0.7, 0.2] },
  { land:'Duitsland', soort:'krimp', bb:true, uit:'smalle basis en een brede groep van 50 tot 65: vergrijzing', levensverwachting:81, geboorte:9, sterfte:12,
    m:[2.4, 2.4, 2.9, 3.3, 3.0, 4.0, 3.4, 2.5, 1.3, 0.3], v:[2.3, 2.3, 2.8, 3.1, 2.9, 4.0, 3.5, 2.9, 2.0, 0.8] },
  { land:'Polen', soort:'krimp', uit:'weinig kinderen, brede groepen van 30 tot 50 en van 60 tot 70', levensverwachting:77, geboorte:9, sterfte:13,
    m:[2.5, 2.7, 2.6, 3.9, 4.0, 3.1, 3.0, 2.2, 0.8, 0.2], v:[2.4, 2.6, 2.5, 3.8, 3.9, 3.2, 3.5, 3.0, 1.5, 0.5] },
  { land:'Rusland', soort:'krimp', uit:'smalle basis, en veel minder oude mannen dan oude vrouwen', levensverwachting:72, geboorte:9, sterfte:15,
    m:[3.0, 2.9, 2.4, 4.0, 3.5, 2.9, 2.7, 1.5, 0.5, 0.1], v:[2.9, 2.8, 2.4, 4.0, 3.7, 3.4, 3.7, 2.8, 1.4, 0.4] },
  { land:'Spanje', soort:'krimp', bb:true, uit:'smalle basis en een brede groep van 40 tot 60: een urn', levensverwachting:83, geboorte:7, sterfte:10,
    m:[2.1, 2.6, 2.6, 3.3, 4.2, 3.9, 2.8, 2.1, 1.2, 0.3], v:[2.0, 2.4, 2.5, 3.3, 4.2, 4.0, 3.0, 2.4, 1.8, 0.7] },
  { land:'Portugal', soort:'krimp', bb:true, uit:'weinig kinderen en veel veertigers en vijftigers', levensverwachting:81, geboorte:8, sterfte:12,
    m:[2.0, 2.4, 2.5, 2.9, 3.6, 3.7, 3.0, 2.4, 1.3, 0.3], v:[1.9, 2.3, 2.4, 2.9, 3.8, 4.0, 3.4, 3.0, 2.1, 0.8] },
  { land:'Griekenland', soort:'krimp', bb:true, uit:'smalle basis, brede groepen van 40 tot 60 en veel ouderen', levensverwachting:80, geboorte:8, sterfte:13,
    m:[2.0, 2.4, 2.5, 3.0, 3.7, 3.8, 3.0, 2.4, 1.4, 0.3], v:[1.9, 2.3, 2.4, 3.0, 3.8, 4.0, 3.3, 2.8, 2.1, 0.7] },
  { land:'Italië', soort:'krimp', bb:true, uit:'weinig kinderen, veel vijftigers en zestigers', levensverwachting:83, geboorte:7, sterfte:12,
    m:[1.9, 2.3, 2.5, 2.8, 3.4, 4.0, 3.2, 2.7, 1.7, 0.5], v:[1.8, 2.2, 2.4, 2.8, 3.5, 4.1, 3.4, 3.2, 2.4, 1.1] },
  { land:'Japan', soort:'krimp', bb:true, uit:'smalle basis, brede top: een urn', levensverwachting:84, geboorte:7, sterfte:12,
    m:[2.0, 2.2, 2.4, 2.9, 3.7, 3.4, 2.9, 3.5, 2.1, 0.6], v:[1.9, 2.1, 2.3, 2.8, 3.6, 3.4, 3.0, 3.9, 3.0, 1.4] },
  { land:'Zuid-Korea', soort:'krimp', bb:true, uit:'heel smalle basis: het geboortecijfer is het laagste ter wereld', levensverwachting:83, geboorte:5, sterfte:7,
    m:[1.8, 2.2, 3.2, 3.5, 4.1, 4.3, 3.4, 2.1, 1.0, 0.2], v:[1.7, 2.1, 3.0, 3.3, 4.0, 4.3, 3.5, 2.4, 1.5, 0.6] }
];
/* de cijfers zijn geschat per groep; hier worden ze per land geschaald zodat mannen en vrouwen samen precies 100 procent zijn */
window.PIRAMIDES.forEach(function(l){ var t = 0; l.m.forEach(function(x){ t += x; }); l.v.forEach(function(x){ t += x; }); l.m = l.m.map(function(x){ return Math.round(x * 1000 / t) / 10; }); l.v = l.v.map(function(x){ return Math.round(x * 1000 / t) / 10; }); });
window.PIRAMIDE_GROEPEN = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90+'];

/* De begrippen van Bevolkingspiramides: b = het begrip, u = de uitleg, soort =
   bij welke vorm van piramide het past (dan hoort er een land met die vorm bij).
   bb krijgt de begrippen tot en met de demografische transitie. */
window.PIRAMIDE_BEGRIPPEN = [
  { b:'vergrijzing', u:'het aandeel ouderen in de bevolking neemt toe', soort:'krimp' },
  { b:'ontgroening', u:'het aandeel jongeren in de bevolking neemt af', soort:'krimp' },
  { b:'geboortecijfer', u:'het aantal geboorten per 1000 inwoners per jaar' },
  { b:'sterftecijfer', u:'het aantal sterfgevallen per 1000 inwoners per jaar' },
  { b:'levensverwachting', u:'hoe oud iemand gemiddeld wordt' },
  { b:'natuurlijke bevolkingsgroei', u:'geboortecijfer min sterftecijfer' },
  { b:'bevolkingspiramide', u:'een grafiek met per leeftijdsgroep het aandeel mannen en vrouwen' },
  { b:'babyboom', u:'een periode met veel geboorten, zoals vlak na 1945' },
  { b:'bevolkingsgroei', u:'het aantal inwoners van een land neemt toe', soort:'groei' },
  { b:'bevolkingskrimp', u:'het aantal inwoners van een land neemt af', soort:'krimp' },
  { b:'immigratie', u:'mensen komen van buiten het land om er te gaan wonen' },
  { b:'emigratie', u:'mensen vertrekken uit het land om ergens anders te gaan wonen' },
  { b:'leeftijdsgroep', u:'alle mensen van bijvoorbeeld 10 tot 19 jaar samen: één balk in de piramide' },
  { b:'zuigelingensterfte', u:'het aantal baby’s dat sterft voor de eerste verjaardag, per 1000 geboorten' },
  { b:'bevolkingsdichtheid', u:'het gemiddelde aantal inwoners per vierkante kilometer' },
  { b:'gezinsplanning', u:'ouders bepalen zelf hoeveel kinderen ze krijgen en wanneer' },
  { b:'vruchtbaarheidscijfer', u:'het gemiddelde aantal kinderen dat een vrouw in haar leven krijgt' },
  { b:'volkstelling', u:'het tellen van alle inwoners van een land, met hun leeftijd en geslacht' },
  { b:'vrouwenoverschot', u:'er zijn meer vrouwen dan mannen, zoals in de oudste leeftijdsgroepen', soort:'krimp' },
  { b:'pensioenleeftijd', u:'de leeftijd waarop mensen stoppen met werken en AOW krijgen' },
  { b:'eenkindpolitiek', u:'de regel in China waardoor de meeste gezinnen maar één kind mochten krijgen', soort:'krimp' },
  { b:'asielzoeker', u:'iemand die zijn land is ontvlucht en in een ander land om bescherming vraagt' },
  { b:'verstedelijking', u:'steeds meer mensen gaan in steden wonen in plaats van op het platteland' },
  { b:'overbevolking', u:'er wonen meer mensen in een gebied dan er met het voedsel, water en werk kunnen leven' },
  /* vanaf hier alleen kgt en hv */
  { b:'demografische transitie', u:'de overgang van hoge naar lage geboorte- en sterftecijfers' },
  { b:'grijze druk', u:'het aantal 65-plussers ten opzichte van de werkende leeftijdsgroep' },
  { b:'groene druk', u:'het aantal jongeren onder de 20 ten opzichte van de werkende leeftijdsgroep' },
  { b:'sociale bevolkingsgroei', u:'immigratie min emigratie: de groei door verhuizen over de grens' },
  { b:'vestigingsoverschot', u:'er komen meer mensen het land binnen dan er vertrekken' },
  { b:'beroepsbevolking', u:'alle mensen die werken of werk zoeken' },
  { b:'geboorteoverschot', u:'er worden meer mensen geboren dan er sterven', soort:'groei' }
];
/* de gevolgen van een piramide (havo en vwo): soort, vraag, goed antwoord en afleiders */
window.PIRAMIDE_GEVOLGEN = [
  { soort:'krimp', v:'Wat is een gevolg van deze piramide voor de zorg?', goed:'meer vraag naar ouderenzorg en verpleeghuizen', mis:['meer vraag naar kinderopvang en consultatiebureaus', 'minder ziekenhuizen nodig', 'niets: de zorgvraag verandert niet'] },
  { soort:'krimp', v:'Wat is een gevolg van deze piramide voor de pensioenen?', goed:'minder werkenden betalen voor meer gepensioneerden', mis:['de pensioenen worden automatisch hoger', 'jongeren gaan eerder met pensioen', 'er zijn minder gepensioneerden'] },
  { soort:'krimp', v:'Wat is een gevolg van deze piramide voor scholen?', goed:'scholen krijgen minder leerlingen en sluiten of fuseren', mis:['er moeten veel nieuwe basisscholen bij', 'klassen worden groter', 'er komen meer leraren tekort door meer kinderen'] },
  { soort:'groei', v:'Wat is een gevolg van deze piramide voor scholen?', goed:'er zijn veel scholen en leraren nodig voor alle kinderen', mis:['scholen sluiten omdat er weinig kinderen zijn', 'ouderenzorg is het grootste probleem', 'er zijn te veel leraren'] },
  { soort:'groei', v:'Wat is een gevolg van deze piramide voor de arbeidsmarkt over 15 jaar?', goed:'heel veel jongeren zoeken tegelijk werk', mis:['er zijn te weinig jongeren om de banen te vullen', 'de meeste werkenden gaan met pensioen', 'niets: de bevolking blijft gelijk'] },
  { soort:'stabiel', v:'Wat past bij deze piramide?', goed:'de bevolking blijft ongeveer even groot', mis:['de bevolking verdubbelt in twintig jaar', 'de helft van de bevolking is jonger dan 15', 'er zijn bijna geen ouderen'] }
];
/* de vier fasen van het demografisch transitiemodel, als antwoorden */
window.PIRAMIDE_FASEN = ['fase 1: hoog geboorte- en sterftecijfer, bevolking groeit niet', 'fase 2: sterftecijfer daalt, geboortecijfer blijft hoog: snelle groei', 'fase 3: geboortecijfer daalt ook, groei neemt af', 'fase 4: allebei laag, bevolking stabiel of krimpend'];
