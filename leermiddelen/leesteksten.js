/* De teksten van de leesbank (formaat: zie leesbank.js). Alle teksten zijn voor deze site
   geschreven. Gemaakt met bouw.js uit losse bestanden per strategie. */

/* ---------- de voorbeeldteksten uit het ontwerp ---------- */
LEESBANK.T({
  id:'bijen-bronnen', niv:'1F', strat:'verkennend', titel:'Een werkstuk over bijen', vorm:'bronnen',
  intro:'Je maakt een werkstuk over **bijen**. In de mediatheek liggen vier bronnen. Je hebt per bron maar 30 seconden.',
  bronnen:[
    { titel:'Bijen en hommels', soort:'boek', maker:'Natuurgids voor jongeren', kopjes:['Zo leeft een bijenvolk', 'Van bloem tot honing', 'Waarom er minder bijen zijn'] },
    { titel:'Zoet & Zo honingwinkel', soort:'website', maker:'zoetenzo.nl', tekst:'Bestel nu! Gratis verzending vanaf 20 euro.', kopjes:['Aanbiedingen', 'Onze potten', 'Recepten'] },
    { titel:'Zonder bij geen appel', soort:'tijdschrift', maker:'Wetenschap Junior, maart 2026', kopjes:['Bestuiven: zo werkt het', 'Wat als de bijen verdwijnen?', 'Wat kun jij doen?'] },
    { titel:'Bakken met honing', soort:'kookboek', maker:'Kookboek', kopjes:['Honingkoek', 'Appeltaart met honing', 'Koekjes voor bij de thee'] }
  ],
  taken:{
    verkennend:[
      { t:'raster', v:'Kijk 30 seconden naar elke bron. Heb je er iets aan voor je werkstuk over bijen?', kol:['ja', 'misschien', 'nee'],
        rijen:[{ z:'Bron A: Bijen en hommels', g:0 }, { z:'Bron B: Zoet & Zo honingwinkel', g:2 }, { z:'Bron C: Zonder bij geen appel', g:0 }, { z:'Bron D: Bakken met honing', g:2 }],
        u:'A en C gaan over bijen als dier: hoe ze leven en wat ze doen. B en D gaan over honing als eten.' },
      { t:'keuze', v:'Bron B noemt ook honing. Waarom heb je er toch niets aan?', o:['Een winkel wil honing verkopen, niet uitleggen.', 'Op de website staan alleen maar plaatjes van potten.', 'Een website is nooit een goede bron voor school.'],
        u:'Kijk wie het maakte: een winkel. Die wil dat je iets koopt.' },
      { t:'open', v:'Voorspel: noem twee dingen die je uit bron C gaat leren. Je hebt de tekst nog niet gelezen.', m:'Hoe een bij een bloem bestuift, en wat er gebeurt als de bijen verdwijnen.', r:2 }
    ],
    doel:[
      { t:'raster', v:'Wat wil de maker van elke bron vooral?', kol:['informeren', 'overtuigen', 'instrueren'],
        rijen:[{ z:'Bron A: Bijen en hommels', g:0 }, { z:'Bron B: Zoet & Zo honingwinkel', g:1 }, { z:'Bron D: Bakken met honing', g:2 }],
        u:'Een natuurgids legt uit, een winkel wil verkopen, een kookboek zegt hoe je iets maakt.' }
    ]
  }
});

LEESBANK.T({
  id:'katten-spinnen', niv:'1F', strat:'globaal', titel:'Waarom katten spinnen', vorm:'artikel', tijd:120,
  alineas:[
    'Bijna iedereen kent het geluid: een kat op schoot die zachtjes brommend spint. Lang wisten onderzoekers niet hoe dat geluid ontstaat. Nu weten ze het wel. De kat laat de spiertjes rond zijn stembanden heel snel trillen, twintig tot dertig keer per seconde. Dat doet hij bij het inademen en bij het uitademen.',
    'Een kat spint vaak als hij tevreden is. Een jong katje spint al als het een paar dagen oud is, terwijl het melk drinkt bij zijn moeder. Zo weet de moeder dat alles goed gaat.',
    'Toch spinnen katten ook als het juist niet goed gaat. Een kat die gewond is of bij de dierenarts op tafel ligt, spint soms ook. Onderzoekers denken dat de kat zichzelf zo rustig maakt.',
    'Misschien helpt spinnen zelfs bij het genezen. De trillingen zijn ongeveer even snel als de trillingen die artsen gebruiken om botten sneller te laten herstellen. Of dat bij katten echt zo werkt, moet nog verder onderzocht worden.'
  ],
  taken:{
    globaal:[
      { t:'koppel', v:'Welk kopje hoort bij welke alinea? Eén kopje blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 3', 'Alinea 4'],
        rechts:['Hoe het geluid ontstaat', 'Een teken voor moeder', 'Spinnen om rustig te worden', 'Een soort medicijn?'], extra:['Waarom honden niet spinnen'],
        u:'Kijk naar de eerste zin of twee van elke alinea: daar staat waar de alinea over gaat.' },
      { t:'open', v:'Waar gaat de hele tekst over? Schrijf het op in één zin.', b:'De tekst gaat over', m:'hoe en waarom katten spinnen.', r:1 },
      { t:'keuze', v:'Welke zin past het best bij de hele tekst?', o:['Katten spinnen als ze blij zijn, maar ook om zichzelf rustig te maken of te genezen.', 'Katten spinnen alleen als ze tevreden zijn.', 'Onderzoekers weten nog steeds niet hoe katten spinnen.'],
        u:'Alinea 2, 3 en 4 noemen elk een andere reden. De eerste zin noemt ze alle drie.' }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van de tekst?', o:['het spinnen van katten', 'katten bij de dierenarts', 'jonge katjes'], u:'Het onderwerp is kort en past bij de hele tekst, niet bij één alinea.' },
      { t:'open', v:'Wat is de hoofdgedachte? Schrijf één zin: wat zegt de schrijver over het onderwerp?', m:'Katten spinnen niet alleen als ze tevreden zijn, maar ook om rustig te worden en misschien om te genezen.', r:2 }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 3 begint met **Toch**. Welk verband geeft dat woord?', o:['tegenstelling', 'oorzaak en gevolg', 'opsomming'], u:'Alinea 2 zegt: spinnen als het goed gaat. Alinea 3 zegt: ook als het niet goed gaat. Dat is een tegenstelling.' }
    ]
  }
});

LEESBANK.T({
  id:'zwembad-golf', niv:'1F', strat:'zoekend', titel:'Zwembad De Golf', vorm:'folder', bron:'Folder van het zwembad, vanaf 1 september',
  blokken:[
    { kop:'Openingstijden', tabel:[['dag', 'banen', 'vrij zwemmen', 'golfslagbad'], ['maandag', '7.00-9.00', '14.00-17.00', ''], ['dinsdag', '7.00-9.00', '14.00-17.00', ''],
      ['woensdag', '7.00-9.00', '13.00-18.00', '15.00-17.00'], ['donderdag', '7.00-9.00', '14.00-17.00', ''], ['vrijdag', '7.00-9.00', '14.00-21.00', '19.00-21.00'],
      ['zaterdag', '', '10.00-17.00', '13.00-16.00'], ['zondag', '', '10.00-16.00', '11.00-15.00']] },
    { kop:'Prijzen', lijst:[['Kind tot 12 jaar', '4,50'], ['Vanaf 12 jaar', '6,00'], ['Tienbadenkaart kind', '38,00'], ['Tienbadenkaart vanaf 12', '50,00'], ['Zwemband huren', '1,00']] },
    { kop:'Let op', tekst:'Kinderen onder de 8 jaar zwemmen alleen met een volwassene erbij. De glijbaan is er voor iedereen vanaf 1,20 meter. In de herfstvakantie is het zwembad elke dag open voor vrij zwemmen, van 10.00 tot 17.00 uur.' }
  ],
  taken:{
    zoekend:[
      { t:'zoek', v:'Start je stopwatch. Beantwoord de vragen zo snel als je kunt.', vragen:[
        { v:'Hoe laat kun je op zaterdag vrij zwemmen?', s:'zaterdag', a:['van 10.00 tot 17.00 uur', '10.00-17.00', '10 tot 17', '10 tot 5', '10.00 tot 17.00', '10:00-17:00'] },
        { v:'Wat kost een tienbadenkaart voor een kind?', s:'tienbadenkaart', a:['38 euro', '38,00', '38', '€38'] },
        { v:'Op welke avond is het golfslagbad open?', s:'golfslagbad', a:['vrijdag', 'vrijdagavond', 'op vrijdag'] },
        { v:'Mag je zusje van 7 alleen gaan zwemmen?', s:'8 jaar', a:['nee', 'nee, alleen met een volwassene', 'nee met een volwassene'] },
        { v:'Hoe lang moet je zijn voor de glijbaan?', s:'glijbaan', a:['1,20 meter', '1,20', '1.20', '120 cm', '1,20 m', '1 meter 20'] },
        { v:'Je wilt woensdag om 16.00 uur in de golven. Kan dat?', s:'woensdag', a:['ja', 'ja, van 15.00 tot 17.00', 'ja het kan'] }
      ] }
    ],
    doel:[
      { t:'keuze', v:'Wat wil het zwembad vooral met deze folder?', o:['informeren: je laten weten wanneer je kunt komen en wat het kost', 'amuseren: je laten lachen', 'overtuigen: je laten vinden dat zwemmen gezond is'],
        u:'In de folder staan tijden, prijzen en regels. Dat is informatie.' }
    ]
  }
});

LEESBANK.T({
  id:'brandalarm', niv:'1F', strat:'nauwkeurig', titel:'Brandalarm op school: wat doe je?', vorm:'instructie',
  alineas:[
    'Hoor je het brandalarm? Stop dan meteen met wat je doet. Laat je tas, je jas en je telefoon liggen.',
    'Je docent loopt als eerste naar de deur. Jullie lopen in een rij achter de docent aan. Rennen mag niet. Gebruik **nooit** de lift.',
    'Je gaat door de dichtstbijzijnde nooduitgang naar buiten. Is die gang vol rook, neem dan de andere uitgang die op de plattegrond naast de deur staat.',
    'Buiten loop je naar het verzamelpunt op het sportveld. Daar ga je bij je eigen klas staan. Je docent telt of iedereen er is.',
    'Was je niet in de les, bijvoorbeeld omdat je naar de wc was? Ga dan ook naar het verzamelpunt en meld je bij je mentor. Je gaat pas weer naar binnen als de conciërge zegt dat het veilig is.'
  ],
  taken:{
    nauwkeurig:[
      { t:'raster', v:'Klopt het, klopt het niet, of staat het er niet? Schrijf ook het nummer van de alinea op.', kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[
        { z:'Je mag je telefoon meenemen naar buiten.', g:1, al:1 },
        { z:'Je loopt achter je docent aan.', g:0, al:2 },
        { z:'Bij rook neem je de trap aan de achterkant.', g:2, al:3 },
        { z:'Op het sportveld telt de conciërge de leerlingen.', g:1, al:4 },
        { z:'Was je op de wc, dan meld je je bij je mentor.', g:0, al:5 },
        { z:'De school oefent twee keer per jaar met het alarm.', g:2 }
      ], u:'Bij "staat er niet" vind je de plek niet terug. Gok dan niet: de tekst zegt er niets over.' },
      { t:'volgorde', v:'Zet de stappen in de goede volgorde.', stappen:['Je spullen laten liggen', 'In een rij achter je docent aan', 'Door de nooduitgang naar buiten', 'Naar het verzamelpunt lopen', 'Wachten tot het veilig is'] },
      { t:'open', v:'In alinea 2 staat: "Gebruik **nooit** de lift." Stel dat er "liever niet" stond. Wat zou er dan anders zijn?', m:'Dan mag het soms wel. Nu mag het nooit, ook niet als je haast hebt.', r:2 }
    ],
    verwijs:[
      { t:'keuze', v:'Alinea 3: "Is __die__ gang vol rook". Naar welk woord verwijst die?', o:['de nooduitgang', 'de plattegrond', 'de deur'], u:'Zet het in de plaats: is de gang naar de nooduitgang vol rook.' }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 5: "Was je niet in de les, **bijvoorbeeld** omdat je naar de wc was?" Welk verband geeft bijvoorbeeld?', o:['voorbeeld', 'tegenstelling', 'conclusie'] }
    ]
  }
});

LEESBANK.T({
  id:'focusfizz', niv:'1F', strat:'kritisch', titel:'Toetsweek? Drink FocusFizz!', vorm:'post',
  post:{ afzender:'focusfizz_official', label:'Gesponsord', kop:'Toetsweek? Drink FocusFizz!', zinnen:[
    'Morgen een toets? Dan wil je scherp zijn.',
    'In een blikje FocusFizz zit 80 milligram cafeïne.',
    'Uit ons onderzoek blijkt: 9 van de 10 scholieren scoren hoger met FocusFizz.',
    'Het is de lekkerste energiedrank van Nederland.',
    'Gamer Mees (2 miljoen volgers) drinkt het elke dag.',
    'Nu 2 blikjes voor 3 euro in de supermarkt.'
  ] },
  naast:{ kop:'Energiedrank en jongeren', bron:'Uit de folder van de schoolarts', tekst:'Artsen raden jongeren onder de 18 jaar af om energiedrank te drinken. Te veel cafeïne kan zorgen voor slecht slapen, hoofdpijn en een snelle hartslag. Wie goed slaapt, onthoudt de lesstof beter.' },
  taken:{
    kritisch:[
      { t:'raster', v:'Is het een feit of een mening?', kol:['feit', 'mening'], rijen:[
        { z:'Zin 2: In een blikje zit 80 milligram cafeïne.', g:0 }, { z:'Zin 4: Het is de lekkerste energiedrank van Nederland.', g:1 },
        { z:'Zin 5: Gamer Mees drinkt het elke dag.', g:0 }, { z:'Zin 6: Nu 2 blikjes voor 3 euro.', g:0 }
      ], u:'Een feit kun je nagaan. "De lekkerste" vindt iemand: dat is een mening.' },
      { t:'keuze', v:'Wie maakte de post, en wat willen ze dat jij doet?', o:['De makers van FocusFizz: ze willen dat je het koopt.', 'De schoolarts: die wil dat je gezond leeft.', 'Gamer Mees: die wil meer volgers.'], u:'Kijk naar de afzender en het woord Gesponsord: het is reclame.' },
      { t:'raster', v:'Zin 3 klinkt sterk. Welke vragen zou je erbij stellen?', kol:['goede vraag', 'doet er niet toe'], rijen:[
        { z:'Wie deed het onderzoek?', g:0 }, { z:'Hoeveel scholieren deden mee?', g:0 }, { z:'Welke kleur heeft het blikje?', g:1 }, { z:'Hoger scoren dan wie?', g:0 }
      ], u:'"Ons onderzoek" is gedaan door de makers zelf. Je weet niet hoeveel scholieren meededen en waarmee ze vergeleken.' },
      { t:'open', v:'Welke tekst vertrouw je meer: de post of de folder? Geef een reden uit de tekst.', m:'De folder: die komt van de schoolarts, die niets wil verkopen. De post is reclame van de maker zelf.', r:2 }
    ],
    argument:[
      { t:'keuze', v:'Zin 5 is waar. Zegt het iets over je cijfers?', o:['Nee: dat een gamer het drinkt, bewijst niet dat je hoger scoort.', 'Ja: Mees heeft veel volgers, dus het werkt.', 'Ja: hij drinkt het elke dag.'], u:'Veel volgers maakt iemand nog geen deskundige. Dat is een zwak argument.' }
    ],
    doel:[
      { t:'keuze', v:'Wat is het tekstdoel van de post?', o:['overtuigen', 'informeren', 'amuseren'], u:'Woorden als "lekkerste" en "Drink FocusFizz!" moeten je overhalen.' }
    ]
  }
});

LEESBANK.T({
  id:'onweer', niv:'1F', strat:'studerend', titel:'Hoe ontstaat onweer?', vorm:'leertekst', bron:'Leertekst aardrijkskunde',
  alineas:[
    'Op een warme zomerdag stijgt warme, vochtige lucht snel op. Hoe hoger de lucht komt, hoe kouder het wordt. Daardoor verandert de waterdamp in kleine druppels en ijskorrels. Zo ontstaat een hoge, donkere wolk: een onweerswolk.',
    'In de wolk gaat het er wild aan toe. Druppels en ijskorrels botsen tegen elkaar. Daarbij raken ze elektrisch geladen. Bovenin de wolk komt vooral positieve lading, onderin vooral negatieve lading.',
    'Wordt het verschil in lading te groot, dan springt er een vonk over: de bliksem. Die maakt de lucht in een flits heel heet, wel 30.000 graden. De lucht zet daardoor plotseling uit. Dat hoor je als de klap van de donder.'
  ],
  taken:{
    studerend:[
      { t:'markeer', v:'Markeer in alinea 2 twee kernwoorden.', al:1, n:2, goed:['botsen', 'geladen', 'elektrisch', 'lading', 'positieve', 'negatieve', 'ijskorrels', 'druppels'] },
      { t:'schema', v:'Vul het schema in. Gebruik je eigen woorden.', vakken:['stap 1', 'stap 2', 'stap 3', 'bliksem', 'donder'],
        m:['warme lucht stijgt op', 'damp wordt druppels en ijs', 'botsen: lading in de wolk', 'vonk door groot verschil in lading', 'hete lucht zet plots uit'], vb:0 },
      { t:'open', v:'Bedenk een toetsvraag over deze tekst, met het antwoord erbij.', m:'Waarom hoor je donder na een bliksem? Omdat de bliksem de lucht heel heet maakt, waardoor die plotseling uitzet.', r:2 }
    ],
    samenvat:[
      { t:'open', v:'Vat de tekst samen in hoogstens 25 woorden.', max:25, m:'Warme lucht stijgt op en vormt een wolk. Botsende druppels en ijs raken geladen. Te veel lading geeft bliksem; de hete lucht geeft donder.' }
    ],
    woord:[
      { t:'keuze', v:'Alinea 3: "De lucht zet daardoor plotseling __uit__." Wat betekent uitzetten hier?', o:['groter worden', 'afkoelen', 'stoppen'], u:'De hete lucht neemt opeens meer ruimte in. Dat geeft de klap.' }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 1: "**Daardoor** verandert de waterdamp in kleine druppels." Welk verband is dat?', o:['oorzaak en gevolg', 'tegenstelling', 'voorbeeld'] }
    ]
  }
});

/* ---------- verkennend lezen: 9 teksten (3 op 1F, 3 op 2F, 3 op 3F) ---------- */

/* ===== 1F ===== */
LEESBANK.T({
  id:'verkennend-skaten', niv:'1F', strat:'verkennend', titel:'Een spreekbeurt over skateboarden', vorm:'bronnen',
  intro:'Je houdt een spreekbeurt over **skateboarden**. Je wilt vertellen hoe de sport begon en hoe je je eerste truc leert. In de bibliotheek liggen vijf bronnen. Je bekijkt ze snel.',
  bronnen:[
    { titel:'Skaten van A tot Z', soort:'boek', maker:'Sportboek voor de jeugd, 2024', kopjes:['Hoe het begon: surfen op straat', 'Je eerste plank kiezen', 'Trucs voor beginners', 'Veilig vallen'] },
    { titel:'Plankenparadijs', soort:'website', maker:'plankenparadijs.nl', tekst:'Alle planken nu 20 procent korting! Op werkdagen voor 22.00 uur besteld, morgen in huis.', kopjes:['Planken', 'Wieltjes', 'Schoenen', 'Bestellen'] },
    { titel:'Je eerste ollie in vijf stappen', soort:'video', maker:'Kanaal van skateleraar Joris', tekst:'In deze video zie je stap voor stap hoe je je eerste sprong met de plank maakt.', kopjes:['Zo zet je je voeten', 'Tik de staart op de grond', 'Trek je knieën op'] },
    { titel:'Sem en de halfpipe', soort:'stripboek', maker:'Strip voor kinderen', tekst:'Sem wil de beste skater van de wijk worden. Maar dan breekt zijn plank in twee stukken...' },
    { titel:'Sport door de jaren heen', soort:'tijdschrift', maker:'Jeugdblad Hoera, juni 2025', kopjes:['Voetbal', 'Schaatsen', 'Skateboarden', 'Tennis'] }
  ],
  taken:{
    verkennend:[
      { t:'raster', v:'Bekijk elke bron kort. Heb je er iets aan voor je spreekbeurt?', kol:['ja', 'misschien', 'nee'],
        rijen:[{ z:'Bron A: Skaten van A tot Z', g:0 }, { z:'Bron B: Plankenparadijs', g:2 }, { z:'Bron C: Je eerste ollie in vijf stappen', g:0 },
          { z:'Bron D: Sem en de halfpipe', g:2 }, { z:'Bron E: Sport door de jaren heen', g:1 }],
        u:'A gaat over het begin en over trucs. C laat een truc zien. E heeft maar één stukje over skaten. B wil planken verkopen en D is een verzonnen verhaal.' },
      { t:'keuze', v:'Je wilt vertellen waar en wanneer de sport ontstond. Onder welk kopje van bron A kijk je?', o:['Hoe het begon: surfen op straat', 'Je eerste plank kiezen', 'Trucs voor beginners'],
        u:'Waar en wanneer iets ontstond, is het begin van de sport.' },
      { t:'keuze', v:'Bron C is gemaakt door een skateleraar. Waarom is dat handig voor jouw spreekbeurt?', o:['Hij weet hoe je een truc leert en legt het stap voor stap uit.', 'Hij verkoopt de beste planken voor beginners in zijn winkel.', 'Hij weet alles over de geschiedenis van alle sporten.'],
        u:'Een leraar legt uit. In de tekst bij C staat ook: stap voor stap.' },
      { t:'open', v:'Voorspel: wat leer je in bron C? Kijk alleen naar de titel en de kopjes.', m:'Hoe je een ollie maakt: hoe je je voeten zet, de staart van de plank op de grond tikt en je knieën optrekt.', r:2 }
    ],
    doel:[
      { t:'raster', v:'Wat wil de maker van elke bron vooral?', kol:['informeren', 'overtuigen', 'instrueren', 'amuseren'],
        rijen:[{ z:'Bron B: Plankenparadijs', g:1 }, { z:'Bron C: Je eerste ollie in vijf stappen', g:2 }, { z:'Bron D: Sem en de halfpipe', g:3 }, { z:'Bron E: Sport door de jaren heen', g:0 }],
        u:'Een winkel wil dat je koopt. Een video met stappen zegt wat je moet doen. Een strip is om van te genieten. Een tijdschrift over sport vroeger en nu vertelt hoe het zit.' }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van bron E?', o:['sport door de jaren heen', 'de geschiedenis van het skaten', 'voetbal en tennis'],
        u:'Bron E gaat over vier sporten. Skaten is maar één kopje.' },
      { t:'keuze', v:'Welke bron heeft als onderwerp: spullen kopen om te skaten?', o:['bron B', 'bron A', 'bron C'],
        u:'Bij B gaan de kopjes over planken, wieltjes, schoenen en bestellen.' }
    ]
  }
});

LEESBANK.T({
  id:'verkennend-hamster', niv:'1F', strat:'verkennend', titel:'Een hamster in huis?', vorm:'bronnen',
  intro:'Je wilt graag een **hamster**. Je ouders willen eerst weten wat een hamster nodig heeft en hoeveel werk het is. Je zoekt snel uit welke bronnen helpen.',
  bronnen:[
    { titel:'Een hamster in huis?', soort:'folder', maker:'Dierenasiel De Pootjes', kopjes:['Wat eet een hamster?', 'Een grote kooi', 'Een hamster slaapt overdag', 'Kost het veel?'] },
    { titel:'Knaagland', soort:'website', maker:'knaagland.nl, winkel voor knaagdieren', tekst:'Nu: luxe hamsterpaleis met drie verdiepingen voor maar 89 euro!', kopjes:['Kooien', 'Voer', 'Speeltjes', 'Aanbiedingen'] },
    { titel:'Huisdieren voor beginners', soort:'tijdschrift', maker:'Dierenblad Snuffel, 2025', kopjes:['De kat', 'Het konijn', 'De hamster', 'De goudvis'] },
    { titel:'Hamster Hugo gaat op reis', soort:'prentenboek', maker:'Verhaal voor kinderen', tekst:'Hugo kruipt uit zijn kooi en gaat de wereld zien. Hij komt een kat tegen...' }
  ],
  taken:{
    verkennend:[
      { t:'raster', v:'Bekijk elke bron kort. Heb je er iets aan?', kol:['ja', 'misschien', 'nee'],
        rijen:[{ z:'Bron A: Een hamster in huis?', g:0 }, { z:'Bron B: Knaagland', g:2 }, { z:'Bron C: Huisdieren voor beginners', g:1 }, { z:'Bron D: Hamster Hugo gaat op reis', g:2 }],
        u:'A gaat helemaal over de zorg voor een hamster. In C gaat maar één stuk over hamsters. B wil iets verkopen en D is een verzonnen verhaal.' },
      { t:'keuze', v:'Je ouders vragen of de hamster in de nacht lawaai maakt. Onder welk kopje van bron A kijk je?', o:['Een hamster slaapt overdag', 'Een grote kooi', 'Wat eet een hamster?'],
        u:'Slaapt een dier overdag, dan is het in de nacht wakker. Daar lees je dus over de nacht.' },
      { t:'keuze', v:'Wie maakte bron A? Waarom is dat een goede maker?', o:['Een dierenasiel: dat wil dat dieren een goed thuis krijgen.', 'Een dierenwinkel: die wil zo veel mogelijk kooien verkopen.', 'Een dierenarts: die ziet elke dag zieke hamsters.'],
        u:'Kijk bij de maker: Dierenasiel De Pootjes. Een asiel verkoopt geen spullen.' },
      { t:'open', v:'Voorspel: wat staat er onder het kopje "Kost het veel?" in bron A? Noem twee dingen.', m:'Wat een kooi en het voer kosten, en of je ook moet betalen voor de dierenarts.', r:2 }
    ],
    doel:[
      { t:'keuze', v:'Wat wil de maker van bron B vooral?', o:['dat je spullen voor je hamster koopt', 'dat je leert hoe een hamster leeft', 'dat je lacht om een grappige hamster'],
        u:'Een winkel met aanbiedingen en een prijs wil je overhalen om te kopen.' },
      { t:'keuze', v:'Wat voor soort tekst is bron D?', o:['een verhaal', 'een folder', 'een handleiding'],
        u:'Hugo is een verzonnen hamster die op avontuur gaat. Dat is een verhaal.' }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van bron A?', o:['de zorg voor een hamster', 'hamsters in de natuur', 'kooien kopen in een winkel'] },
      { t:'keuze', v:'Bron C heeft vier kopjes. Wat is het onderwerp van de hele bron?', o:['huisdieren voor wie nog nooit een dier had', 'de verzorging van een hamster', 'katten en konijnen'],
        u:'Het onderwerp past bij alle kopjes samen, niet bij één kopje.' }
    ]
  }
});

LEESBANK.T({
  id:'verkennend-geld', niv:'1F', strat:'verkennend', titel:'Slim met je geld', vorm:'website', bron:'Website van Stichting Muntmeter (verkoopt niets)',
  blokken:[
    { kop:'Zakgeld: hoeveel krijg jij?', tekst:'De meeste kinderen van 12 krijgen zakgeld. Sommigen krijgen het per week, anderen per maand. Hoeveel je krijgt, verschilt per gezin. Er is geen bedrag dat voor iedereen klopt. Vergelijken met vrienden zegt dus weinig.' },
    { kop:'Sparen voor iets groots', tekst:'Wil je iets duurs kopen, zoals een fiets? Schrijf eerst op wat het kost. Kies dan een vast bedrag dat je elke week opzij legt. Deel de prijs door dat bedrag. Dan weet je hoeveel weken het duurt.' },
    { kop:'Bijverdienen', tekst:'Vanaf 13 jaar mag je al licht werk doen. Denk aan folders rondbrengen of oppassen bij de buren. Zwaar werk mag nog niet. Vraag eerst thuis of het goed is.' },
    { kop:'Pas op in games', tekst:'In veel games kun je met echt geld munten, skins of kisten kopen. Een paar euro lijkt weinig. Maar vaak koop je een paar keer per week iets. Zet daarom een grens. Bijvoorbeeld: niet meer dan 5 euro per maand.' },
    { kop:'Een eigen bankpas', tekst:'Bij de meeste banken kun je al jong een eigen rekening en pas krijgen. Je ouders moeten wel meetekenen. Met een app zie je precies wat je uitgeeft.' },
    { kop:'Doe de test', tekst:'Ben jij een spaarder of een uitgever? Doe onze test van tien vragen en ontdek het in twee minuten.' }
  ],
  taken:{
    verkennend:[
      { t:'koppel', v:'Lees alleen de kopjes. Onder welk kopje vind je het antwoord? Eén kopje blijft over.',
        links:['Mag ik met 13 jaar al werken?', 'Over hoeveel weken heb ik genoeg voor een fiets?', 'Krijg ik te weinig van mijn ouders?', 'Kan ik zelf pinnen in de winkel?'],
        rechts:['Bijverdienen', 'Sparen voor iets groots', 'Zakgeld: hoeveel krijg jij?', 'Een eigen bankpas'], extra:['Doe de test'],
        u:'Je hoeft de stukken niet te lezen. Het kopje zegt al waar het stuk over gaat.' },
      { t:'keuze', v:'Je wilt een telefoon van 200 euro. Je hebt maar twee minuten. Welke twee stukken helpen je het meest om het geld bij elkaar te krijgen?',
        o:['Sparen voor iets groots en Bijverdienen', 'Zakgeld: hoeveel krijg jij? en Doe de test', 'Een eigen bankpas en Pas op in games'],
        u:'Aan geld kom je door opzij te leggen en door erbij te verdienen.' },
      { t:'open', v:'Lees alleen het kopje "Pas op in games". Voorspel waar dat stuk over gaat.', m:'Over geld dat je in games uitgeeft, bijvoorbeeld aan skins, en dat je daar een grens voor moet stellen.', r:2 },
      { t:'keuze', v:'Bovenaan staat wie de website maakt: een stichting die niets verkoopt. Wat betekent dat voor jou?', o:['Ze willen je helpen, niet iets aan je verkopen.', 'De informatie op de site is dus verouderd.', 'Je moet eerst lid worden om alles te lezen.'],
        u:'Een maker die niets verkoopt, heeft er geen voordeel bij als jij iets koopt.' }
    ],
    doel:[
      { t:'keuze', v:'Wat wil de website vooral?', o:['je uitleggen hoe je goed omgaat met je zakgeld', 'je overhalen om bij een bank een pas te nemen', 'je vermaken met grappige verhalen over sparen'],
        u:'De site geeft uitleg en tips. Hij noemt geen bank en verkoopt niets.' },
      { t:'raster', v:'Wat doet het stuk onder dit kopje vooral?', kol:['informeren', 'instrueren'],
        rijen:[{ z:'Zakgeld: hoeveel krijg jij?', g:0 }, { z:'Sparen voor iets groots', g:1 }, { z:'Een eigen bankpas', g:0 }],
        u:'Bij Sparen voor iets groots staan stappen: schrijf op, kies een bedrag, deel de prijs. Dat is instrueren.' }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van de hele website?', o:['omgaan met geld als je jong bent', 'sparen voor een nieuwe fiets', 'werken als je 13 jaar bent'],
        u:'Sparen en werken zijn maar twee stukken. Het onderwerp past bij alle kopjes.' },
      { t:'keuze', v:'Welke zin past het best als hoofdgedachte van de hele website?', o:['Je kunt al jong leren om goed met je geld om te gaan.', 'Kinderen van 12 krijgen meestal te weinig zakgeld.', 'Geld uitgeven in games is altijd een slecht plan.'],
        u:'De site zegt niet dat zakgeld te weinig is, en ook niet dat games altijd fout zijn.' }
    ]
  }
});

/* ===== 2F ===== */
LEESBANK.T({
  id:'verkennend-vulkanen', niv:'2F', strat:'verkennend', titel:'Een werkstuk over vulkanen', vorm:'bronnen',
  intro:'Voor aardrijkskunde maak je een werkstuk met de vraag: **Hoe ontstaat een vulkaanuitbarsting, en kun je die van tevoren zien aankomen?** Je hebt vijf bronnen gevonden. Je bekijkt ze eerst snel voordat je iets echt gaat lezen.',
  bronnen:[
    { titel:'Vuur uit de aarde', soort:'boek', maker:'Aardrijkskundeboek voor de onderbouw, 2023', tekst:'Waarom spuwt een berg soms vuur en as? In dit boek lees je hoe de aarde van binnen werkt en hoe mensen leven naast een vulkaan.',
      kopjes:['Platen in beweging', 'Magma: gesmolten gesteente', 'Soorten vulkanen', 'Leven naast een vulkaan'] },
    { titel:'Vulkaanwachters', soort:'website', maker:'Instituut voor Aardonderzoek, afdeling vulkanen', tekst:'Wij houden dag en nacht dertig vulkanen in de gaten met meetapparaten op de helling.',
      kopjes:['Zo meten wij trillingen', 'Gassen als waarschuwing', 'Een berg die opzwelt', 'Kan een uitbarsting voorspeld worden?'] },
    { titel:'Rondreis IJsland: vuur en ijs', soort:'reisfolder', maker:'Reisbureau Noorderlicht', tekst:'Wandel over een lavaveld en zwem in een warme bron. Boek voor 1 maart en krijg 100 euro korting!',
      kopjes:['Dag 1 tot 3: de hoofdstad', 'Dag 4 tot 7: lava en gletsjers', 'Prijzen en data'] },
    { titel:'Ik stond 200 meter van de lava!', soort:'video', maker:'Vlogger SamOpReis', tekst:'Kijk mee hoe ik bijna mijn schoenen verbrand op een lavaveld. Wat een dag!',
      kopjes:['Aankomst met de jeep', 'De klim naar boven', 'Mijn schoenzolen smelten'] },
    { titel:'Etna weer actief: vliegveld Catania dicht', soort:'nieuwsbericht', maker:'Nieuwsdienst Vandaag, 12 maart 2026', tekst:'Een grote aswolk hangt sinds vanochtend boven Oost-Sicilië.',
      kopjes:['Aswolk boven de stad', 'Geen gevaar voor inwoners', 'Onderzoekers zagen het al dagen aankomen'] }
  ],
  taken:{
    verkennend:[
      { t:'raster', v:'Bekijk titel, maker, kopjes en de korte tekst. Is de bron bruikbaar voor je werkstuk?', kol:['ja', 'misschien', 'nee'],
        rijen:[{ z:'Bron A: Vuur uit de aarde', g:0 }, { z:'Bron B: Vulkaanwachters', g:0 }, { z:'Bron C: Rondreis IJsland', g:2 },
          { z:'Bron D: Ik stond 200 meter van de lava!', g:2 }, { z:'Bron E: Etna weer actief', g:1 }],
        u:'A legt het ontstaan uit, B het voorspellen. E is een nieuwsbericht met één kopje dat bij je vraag past. C wil een reis verkopen en D wil vooral vermaken: geen van beide legt iets uit.' },
      { t:'keuze', v:'Je deelvraag is: kun je van tevoren weten dat een vulkaan gaat uitbarsten? Welke twee bronnen bekijk je daarvoor eerst?', o:['B en E', 'A en C', 'C en D', 'A en D'],
        u:'B heeft kopjes over meten en voorspellen. In E zagen onderzoekers het al dagen aankomen.' },
      { t:'keuze', v:'Je wilt uitleggen wat er diep onder de grond gebeurt voordat er lava naar buiten komt. Onder welk kopje van bron A begin je?', o:['Magma: gesmolten gesteente', 'Soorten vulkanen', 'Leven naast een vulkaan'],
        u:'Lava is magma dat boven de grond komt. Onder de grond heet het magma.' },
      { t:'keuze', v:'Bron B komt van een onderzoeksinstituut, bron D van een vlogger. Waarom is B beter voor je werkstuk?', o:['De makers meten zelf aan vulkanen en leggen uit hoe het werkt.', 'Een website is altijd nieuwer dan een video op internet.', 'De vlogger stond niet echt zo dicht bij de lava.'],
        u:'Kijk naar de maker. Onderzoekers die zelf meten, weten er meer van dan iemand die er een dag rondloopt.' },
      { t:'open', v:'Voorspel: wat lees je in bron B onder het kopje "Gassen als waarschuwing"? Je hebt het stuk nog niet gelezen.', m:'Dat een vulkaan vóór een uitbarsting meer gas uitstoot, en dat onderzoekers dat meten om mensen op tijd te waarschuwen.', r:2 }
    ],
    doel:[
      { t:'raster', v:'Wat wil de maker van elke bron vooral?', kol:['informeren', 'overtuigen', 'amuseren'],
        rijen:[{ z:'Bron A: Vuur uit de aarde', g:0 }, { z:'Bron C: Rondreis IJsland', g:1 }, { z:'Bron D: Ik stond 200 meter van de lava!', g:2 }, { z:'Bron E: Etna weer actief', g:0 }],
        u:'De reisfolder wil dat je boekt (korting!). De vlog wil een leuke, spannende video laten zien. Het boek en het nieuwsbericht vertellen hoe het zit.' },
      { t:'keuze', v:'Bron E is een nieuwsbericht. Waaraan zie je dat het snelst?', o:['Er staat een datum bij en het meldt wat er net gebeurd is.', 'Er staat een prijs bij en je kunt meteen iets boeken.', 'Er staan stappen in die je in de goede volgorde moet doen.'],
        u:'Een nieuwsbericht gaat over iets wat net gebeurd is, en heeft een datum.' }
    ],
    onderwerp:[
      { t:'keuze', v:'Bron A en bron C gaan allebei over vulkanen. Wat is het onderwerp van bron C?', o:['een vakantiereis langs vulkanen in IJsland', 'hoe een vulkaan ontstaat en uitbarst', 'de gevaren van lava voor mensen'],
        u:'De kopjes van C gaan over reisdagen en prijzen. Het onderwerp is de reis.' },
      { t:'open', v:'Lees alleen de titel en de kopjes van bron E. Welke hoofdgedachte verwacht je? Schrijf één zin.', m:'De Etna is weer uitgebarsten en het vliegveld is dicht, maar inwoners zijn niet in gevaar en onderzoekers zagen het al aankomen.', r:2 }
    ]
  }
});

LEESBANK.T({
  id:'verkennend-bijbaan', niv:'2F', strat:'verkennend', titel:'Je eerste bijbaan', vorm:'bronnen',
  intro:'Je bent 15 en wilt een **bijbaan**. Je wilt eerst weten welk werk je op jouw leeftijd mag doen en hoeveel uur. Je hebt vijf bronnen open staan, maar weinig tijd.',
  bronnen:[
    { titel:'Werken als je jong bent', soort:'website', maker:'Loket Jong Werk, informatie van de overheid, bijgewerkt januari 2026', tekst:'Ben je 13, 14 of 15? Dan gelden er strengere regels dan voor volwassenen. Hier lees je ze per leeftijd.',
      kopjes:['Welk werk mag je op welke leeftijd?', 'Werktijden: hoe laat en hoe lang?', 'Werken in de vakantie', 'Je loon en het minimumjeugdloon'] },
    { titel:'Verdien thuis 500 euro per week!', soort:'website', maker:'snelrijkthuis.biz', tekst:'Geen ervaring nodig! Werk vanuit je slaapkamer, wanneer je maar wilt. Je betaalt alleen 25 euro om te starten.',
      kopjes:['Zo werkt het', 'Ervaringen van blije verdieners', 'Meld je nu aan'] },
    { titel:'Mijn eerste baantje', soort:'tijdschrift', maker:'Tienerblad Flits, april 2026', tekst:'Drie jongeren vertellen over hun bijbaan: wat ze doen, wat ze verdienen en wat ze er lastig aan vinden.',
      kopjes:['Lotte (15) schept ijs bij een ijssalon', 'Yusuf (14) bezorgt kranten', 'Mila (16) vult vakken in de supermarkt', 'Vijf tips voor je eerste sollicitatie'] },
    { titel:'Werken op je vijftiende', soort:'folder', maker:'Loket Jong Werk, 2011', tekst:'Alles wat je moet weten over werk, uren en loon als je 15 bent.',
      kopjes:['Wat mag wel?', 'Wat mag niet?', 'Wat verdien je?'] },
    { titel:'De zomer van de ijscokar', soort:'roman', maker:'Jeugdboek', tekst:'Noor (15) gaat in de zomervakantie ijs verkopen aan het strand. Daar ontmoet ze Daan, die elke dag een ijsje komt halen. Maar waarom zegt hij nooit iets?' }
  ],
  taken:{
    verkennend:[
      { t:'raster', v:'Bekijk elke bron snel. Is hij bruikbaar voor jouw vraag: welk werk mag ik doen en hoeveel uur?', kol:['ja', 'misschien', 'nee'],
        rijen:[{ z:'Bron A: Werken als je jong bent', g:0 }, { z:'Bron B: Verdien thuis 500 euro per week!', g:2 }, { z:'Bron C: Mijn eerste baantje', g:1 },
          { z:'Bron D: Werken op je vijftiende', g:1 }, { z:'Bron E: De zomer van de ijscokar', g:2 }],
        u:'A geeft de regels en is nieuw. C vertelt ervaringen, geen regels. D gaat precies over jouw vraag, maar is oud: controleer het met A. B is onbetrouwbaar en E is een verzonnen verhaal.' },
      { t:'keuze', v:'Bron A en bron D komen van dezelfde maker. Welke kies je, en waarom?', o:['A, want D is uit 2011 en regels en lonen veranderen.', 'D, want een folder is altijd betrouwbaarder dan een website.', 'D, want die is speciaal voor jongeren van 15 geschreven.'],
        u:'Kijk naar het jaartal. Het minimumjeugdloon gaat bijna elk jaar omhoog, en ook regels kunnen veranderen.' },
      { t:'keuze', v:'Waarom vertrouw je bron B niet?', o:['De maker is onbekend en belooft veel geld voor weinig werk.', 'Er staan te weinig kopjes op deze website.', 'De site noemt niet in welke stad je moet werken.'],
        u:'Let op: je moet eerst zelf betalen om te beginnen. Dat is een bekend trucje.' },
      { t:'keuze', v:'Je wilt weten of je als 15-jarige op een schooldag tot 22.00 uur mag werken. Onder welk kopje van bron A kijk je?', o:['Werktijden: hoe laat en hoe lang?', 'Welk werk mag je op welke leeftijd?', 'Je loon en het minimumjeugdloon'],
        u:'Tot 22.00 uur gaat over hoe laat je werkt. Dat is een werktijd.' },
      { t:'open', v:'Voorspel: wat lees je in bron C in het stuk over Yusuf? Noem twee dingen.', m:'Hoe het is om op je veertiende kranten te bezorgen, bijvoorbeeld hoe vroeg hij moet beginnen en wat hij verdient.', r:2 }
    ],
    doel:[
      { t:'raster', v:'Wat wil de maker van deze bron vooral?', kol:['informeren', 'overtuigen', 'amuseren'],
        rijen:[{ z:'Bron A: Werken als je jong bent', g:0 }, { z:'Bron B: Verdien thuis 500 euro per week!', g:1 }, { z:'Bron E: De zomer van de ijscokar', g:2 }],
        u:'A legt regels uit. B wil dat je je aanmeldt en betaalt. E is een verhaal om van te genieten.' }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van bron E?', o:['een zomer van een meisje dat ijs verkoopt', 'de regels voor werken als je 15 bent', 'hoe je zelf een ijscokar begint'],
        u:'E is een roman over Noor. Er staan geen regels of tips in.' },
      { t:'open', v:'Lees de korte tekst bij bron A. Wat is volgens jou de hoofdgedachte van bron A? Schrijf één zin.', m:'Voor jongeren van 13 tot en met 15 gelden strengere regels voor werk, en die verschillen per leeftijd.', r:2 }
    ]
  }
});

LEESBANK.T({
  id:'verkennend-gitaar', niv:'2F', strat:'verkennend', titel:'Gitaar leren spelen: alles voor beginners', vorm:'website', bron:'Website van Muziekschool De Snaar',
  blokken:[
    { kop:'Akoestisch of elektrisch?', tekst:'Een akoestische gitaar heeft een holle klankkast en klinkt zonder stroom. Een elektrische gitaar heeft een versterker nodig. Wil je vooral samen zingen bij het kampvuur, dan is akoestisch handig. Wil je in een band rock spelen, dan kies je eerder elektrisch.' },
    { kop:'Wat kost een eerste gitaar?', tekst:'Een goede beginnersgitaar hoeft niet duur te zijn. Tweedehands vind je er vaak een voor 60 tot 120 euro. Laat iemand die al speelt meekijken: een kromme hals of losse onderdelen zie je als beginner niet snel.' },
    { kop:'De juiste maat', tekst:'Gitaren zijn er in verschillende maten. Ben je nog niet zo lang, dan is een gitaar van driekwart maat vaak prettiger. Je armen en vingers hoeven dan minder ver te reiken.' },
    { kop:'Je gitaar stemmen', tekst:'Een gitaar raakt snel een beetje vals. Stem hem daarom elke keer voordat je begint. Met een klein stemapparaat of een app gaat dat in een paar minuten. Van dik naar dun heten de snaren E, A, D, G, B en E.' },
    { kop:'Je eerste drie akkoorden', tekst:'Met de akkoorden G, C en D kun je al honderden liedjes spelen. Oefen eerst elk akkoord los. Wissel daarna langzaam van het ene naar het andere. Snelheid komt later vanzelf.' },
    { kop:'Pijn aan je vingers?', tekst:'In het begin doen je vingertoppen pijn van de snaren. Dat is normaal. Na een paar weken krijg je eelt en voel je het bijna niet meer. Nylon snaren zijn zachter voor je vingers dan stalen snaren.' },
    { kop:'Hoe vaak moet je oefenen?', tekst:'Elke dag een kwartier werkt beter dan één keer per week twee uur. Je vingers en je hersenen onthouden de bewegingen beter als je vaak en kort oefent.' },
    { kop:'Les bij De Snaar', tekst:'Sneller leren? Bij De Snaar krijg je les van echte muzikanten. De eerste proefles is gratis. Schrijf je nu in, want de plekken voor dit jaar gaan snel!' }
  ],
  taken:{
    verkennend:[
      { t:'koppel', v:'Lees alleen de kopjes. Onder welk kopje vind je het antwoord op de vraag? Er blijven kopjes over.',
        links:['Mijn gitaar klinkt raar, ook al speel ik het goed. Hoe kan dat?', 'Mijn zusje is tien. Past een gewone gitaar haar wel?', 'Is het erg dat mijn vingers na het spelen zeer doen?', 'Moet ik een stekker in het stopcontact hebben om te spelen?'],
        rechts:['Je gitaar stemmen', 'De juiste maat', 'Pijn aan je vingers?', 'Akoestisch of elektrisch?'], extra:['Hoe vaak moet je oefenen?', 'Les bij De Snaar'],
        u:'Een gitaar die raar klinkt is vals: dan moet je stemmen. Een gitaar zonder stroom is akoestisch.' },
      { t:'keuze', v:'Je hebt nog geen gitaar en weinig geld. Welke twee stukken lees je eerst?', o:['Wat kost een eerste gitaar? en Akoestisch of elektrisch?', 'Je eerste drie akkoorden en Hoe vaak moet je oefenen?', 'Je gitaar stemmen en Pijn aan je vingers?', 'Les bij De Snaar en De juiste maat'],
        u:'Eerst moet je kiezen wat voor gitaar je wilt en wat dat kost. Stemmen, oefenen en akkoorden komen pas als je er een hebt.' },
      { t:'open', v:'Lees alleen het kopje "Pijn aan je vingers?". Voorspel in één of twee zinnen wat erin staat.', m:'Dat je vingertoppen in het begin pijn doen van de snaren, maar dat dat na een tijdje overgaat.', r:2 },
      { t:'keuze', v:'De website is van een muziekschool. Bij welk stuk moet je daar extra op letten?', o:['Les bij De Snaar', 'De juiste maat', 'Je gitaar stemmen'],
        u:'In dat stuk heeft de maker er zelf belang bij: de school wil leerlingen die betalen.' }
    ],
    doel:[
      { t:'keuze', v:'Het laatste stuk heeft een ander doel dan de rest. Welk doel heeft dat stuk?', o:['overtuigen: je laten kiezen voor les bij deze school', 'informeren: uitleggen hoe je een gitaar stemt', 'amuseren: een grappig verhaal over een leerling'],
        u:'Woorden als "Schrijf je nu in" en "gaan snel" willen je overhalen.' },
      { t:'keuze', v:'Wat voor soort tekst is het stuk "Je eerste drie akkoorden"?', o:['een instructie: het zegt wat je moet doen', 'een verhaal: het vertelt wat iemand meemaakte', 'een mening: het zegt wat de schrijver vindt'],
        u:'Oefen eerst, wissel daarna: zulke zinnen vertellen je wat je moet doen.' }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van de hele website?', o:['beginnen met gitaar spelen', 'de geschiedenis van de gitaar', 'les nemen bij een muziekschool'],
        u:'Alleen het laatste stuk gaat over les. De rest gaat over hoe je begint.' },
      { t:'open', v:'Wat is de hoofdgedachte van de website? Schrijf één zin.', m:'Gitaar leren kan iedereen: kies een gitaar die bij je past en oefen elke dag een beetje.', r:2 }
    ]
  }
});

/* ===== 3F ===== */
LEESBANK.T({
  id:'verkennend-kweekvlees', niv:'3F', strat:'verkennend', titel:'Profielwerkstuk: kweekvlees', vorm:'bronnen',
  intro:'Voor je profielwerkstuk biologie onderzoek je de vraag: **Kan kweekvlees binnen tien jaar een groot deel van het gewone vlees vervangen?** Je verkent vijf bronnen voordat je beslist welke je grondig leest. Let op de maker, het jaartal en de vraag of de bron wel over jouw vraag gaat.',
  bronnen:[
    { titel:'Eerste kweekburger geproefd: smaakt naar meer', soort:'krantenartikel', maker:'Dagblad De Noorderkrant, augustus 2013', tekst:'In Londen proefden twee testers de eerste hamburger die in een laboratorium is gekweekt. Kostprijs: ruim 250.000 euro.',
      kopjes:['Twee jaar werk voor één burger', 'Proevers: iets droog, wel echt vlees', 'Over tien jaar in elke supermarkt?'] },
    { titel:'Vlees zonder dier', soort:'website', maker:'CelFarm, bedrijf dat kweekvlees maakt', tekst:'Onze kweekkip is beter voor het klimaat, beter voor dieren en beter voor jou. Binnenkort in jouw supermarkt.',
      kopjes:['Onze missie', 'Waarom kweekvlees de toekomst is', 'Veelgestelde vragen', 'Investeer mee'] },
    { titel:'Kweekvlees: wat weten we in 2025?', soort:'vaktijdschrift', maker:'Tijdschrift Voedsel en Wetenschap, overzichtsartikel van drie universitaire onderzoekers, 2025', tekst:'Na tien jaar beloften zetten we op een rij wat onderzoek wel en niet heeft aangetoond.',
      kopjes:['De kosten per kilo en hoe die dalen', 'Energiegebruik: minder gunstig dan gedacht?', 'Regels in Europa en daarbuiten', 'Wat vinden consumenten ervan?', 'Open vragen voor de komende jaren'] },
    { titel:'Echt vlees, eerlijk vlees', soort:'folder', maker:'Bond van Veehouders', tekst:'Kweekvlees is een fabrieksproduct vol onzekerheden. Kies voor vlees van de boer om de hoek: vertrouwd, puur en van hier.',
      kopjes:['Van het land, niet uit het lab', 'Wat weten we echt van kweekvlees?', 'Boeren uit de buurt'] },
    { titel:'Voeding van A tot Z', soort:'naslagwerk', maker:'Algemene encyclopedie, editie 2024', tekst:'Overzicht van alle voedingsstoffen en voedselgroepen, met tabellen.',
      kopjes:['Eiwitten', 'Vetten', 'Vitamines', 'Vlees en vis', 'Zuivel'] }
  ],
  taken:{
    verkennend:[
      { t:'raster', v:'Beoordeel elke bron op titel, maker, jaartal en kopjes. Hoe bruikbaar is hij voor jouw onderzoeksvraag?', kol:['bruikbaar', 'met voorbehoud', 'niet bruikbaar'],
        rijen:[{ z:'Bron A: Eerste kweekburger geproefd', g:1 }, { z:'Bron B: Vlees zonder dier', g:1 }, { z:'Bron C: Kweekvlees: wat weten we in 2025?', g:0 },
          { z:'Bron D: Echt vlees, eerlijk vlees', g:1 }, { z:'Bron E: Voeding van A tot Z', g:2 }],
        u:'C is recent, onafhankelijk en gaat precies over je vraag. A is verouderd: alleen bruikbaar voor de geschiedenis. B en D hebben belang bij een bepaald antwoord: alleen bruikbaar als je laat zien wat de betrokken partijen vinden. E is te algemeen en zegt niets over kweekvlees.' },
      { t:'keuze', v:'Wat is het grootste probleem van bron A voor jouw onderzoeksvraag?', o:['Het stuk is uit 2013; over prijs en regels is sindsdien veel veranderd.', 'Een krant hoort geen artikelen over wetenschap te schrijven.', 'De proevers vonden de burger droog, dus het stuk is bevooroordeeld.'],
        u:'Jouw vraag gaat over de komende tien jaar. Een bron van meer dan tien jaar geleden kan niet laten zien hoe het er nu voor staat.' },
      { t:'keuze', v:'Bron B en bron D spreken elkaar tegen. Wat hebben ze toch gemeen?', o:['Beide makers hebben er belang bij dat jij hun kant kiest.', 'Beide bronnen zijn geschreven door onafhankelijke onderzoekers.', 'Beide bronnen zijn te oud om nog iets mee te doen.'],
        u:'B verkoopt kweekvlees en zoekt investeerders. D komt van boeren die gewoon vlees verkopen.' },
      { t:'keuze', v:'Je deelvraag is: is kweekvlees echt beter voor het klimaat? Onder welk kopje van bron C vind je waarschijnlijk het eerlijkste antwoord?', o:['Energiegebruik: minder gunstig dan gedacht?', 'De kosten per kilo en hoe die dalen', 'Regels in Europa en daarbuiten', 'Wat vinden consumenten ervan?'],
        u:'Hoeveel energie het kweken kost, bepaalt grotendeels hoe goed het voor het klimaat is.' },
      { t:'open', v:'Voorspel wat er in bron C onder het kopje "Energiegebruik: minder gunstig dan gedacht?" staat. Let op de woorden "dan gedacht" en het vraagteken.', m:'Dat het kweken van vlees veel energie kost, waardoor het voordeel voor het klimaat misschien kleiner is dan vaak beweerd. Het vraagteken laat zien dat het nog niet zeker is.', r:3 }
    ],
    doel:[
      { t:'raster', v:'Wat is het hoofddoel van de maker?', kol:['informeren', 'overtuigen'],
        rijen:[{ z:'Bron A: Eerste kweekburger geproefd', g:0 }, { z:'Bron B: Vlees zonder dier', g:1 }, { z:'Bron C: Kweekvlees: wat weten we in 2025?', g:0 }, { z:'Bron D: Echt vlees, eerlijk vlees', g:1 }],
        u:'B en D gebruiken woorden als "beter voor jou", "vertrouwd" en "puur" en willen dat je iets kiest. A en C melden en zetten op een rij.' },
      { t:'keuze', v:'Bron B heeft het kopje "Investeer mee". Wat zegt dat over het doel van de hele website?', o:['De site wil vooral geld en klanten werven, niet neutraal informeren.', 'De site wil bezoekers uitleggen hoe beleggen in bedrijven werkt.', 'De site wil eerlijk laten zien dat kweekvlees nog niet klaar is.'],
        u:'Een maker die jouw geld wil, zal vooral de voordelen van zijn product noemen.' }
    ],
    onderwerp:[
      { t:'keuze', v:'Bron C en bron E gaan allebei over voedsel. Waarin verschilt hun onderwerp?', o:['C gaat over één nieuw product, E over voeding in het algemeen.', 'C gaat over vlees van de boer, E juist over kweekvlees.', 'C gaat over vitamines, E over de kosten van vlees.'],
        u:'Bij E komt kweekvlees in geen enkel kopje voor. Daarom is E te algemeen voor jouw vraag.' },
      { t:'open', v:'Wat is de hoofdgedachte van bron D, als je afgaat op de titel en de korte tekst? Schrijf één zin.', m:'Kweekvlees is onzeker en onnatuurlijk, dus je kunt beter vlees van een boer uit de buurt kopen.', r:2 }
    ]
  }
});

LEESBANK.T({
  id:'verkennend-afsluitdijk', niv:'3F', strat:'verkennend', titel:'Presentatie: de Afsluitdijk', vorm:'bronnen',
  intro:'Voor geschiedenis geef je een presentatie over de vraag: **Waarom werd de Afsluitdijk gebouwd, en wat betekende dat voor de mensen rond de Zuiderzee?** Je hebt een stapel bronnen en een uur de tijd. Je moet dus snel kiezen wat je echt leest.',
  bronnen:[
    { titel:'Dicht! Hoe de Zuiderzee het IJsselmeer werd', soort:'boek', maker:'Historicus Jan Wolters, 2019', tekst:'In 1932 werd het laatste gat in de dijk gedicht. Voor de een was het een overwinning op het water, voor de ander het einde van een bestaan.',
      kopjes:['Een oud plan uit 1891', 'De stormvloed van 1916', 'Bouwen met keileem en wilgentenen', 'Het einde van de Zuiderzeevissers', 'Nieuw land: de polders'] },
    { titel:'Werk aan de Afsluitdijk', soort:'website', maker:'Projectbureau van de dijkversterking, 2022', tekst:'Let op: van maandag tot en met vrijdag is één rijstrook richting Friesland afgesloten.',
      kopjes:['Omleidingen en wegafsluitingen', 'Planning van de werkzaamheden', 'Contact en klachten'] },
    { titel:'Tien wonderen van waterbouw', soort:'tijdschrift', maker:'Techniekblad Constructie, 2023', tekst:'Dammen, dijken en keringen die de wereld veranderden, met bouwtekeningen.',
      kopjes:['De Hoover Dam', 'De Afsluitdijk', 'De Drieklovendam', 'De Oosterscheldekering', 'Het Panamakanaal'] },
    { titel:'Een dorp van vissers', soort:'boek', maker:'Uitgave van Historische Kring Botterdorp, 1982', tekst:'Oud-vissers vertellen over het leven op de Zuiderzee, vóór en na de afsluiting.',
      kopjes:['Op de botter', 'Het jaar 1932', 'Een nieuw vak leren', 'Wat we kwijtraakten'] },
    { titel:'Fietsen over de Afsluitdijk', soort:'folder', maker:'Toeristenbureau Kop van Noord-Holland', tekst:'Dertig kilometer wind, water en weidse luchten. Een fietstocht om nooit te vergeten!',
      kopjes:['De route', 'Uitkijkpunt bij het monument', 'Fietsverhuur en terrasjes'] }
  ],
  taken:{
    verkennend:[
      { t:'raster', v:'Beoordeel elke bron op titel, maker en kopjes. Is hij bruikbaar voor je presentatie?', kol:['ja', 'misschien', 'nee'],
        rijen:[{ z:'Bron A: Dicht!', g:0 }, { z:'Bron B: Werk aan de Afsluitdijk', g:2 }, { z:'Bron C: Tien wonderen van waterbouw', g:1 },
          { z:'Bron D: Een dorp van vissers', g:0 }, { z:'Bron E: Fietsen over de Afsluitdijk', g:2 }],
        u:'A beantwoordt beide delen van je vraag. D gaat over wat de afsluiting voor mensen betekende. C heeft één stuk over de Afsluitdijk, en dan vooral over de techniek. B gaat over verkeer bij werk van nu, E over een dagje uit.' },
      { t:'keuze', v:'Je wilt uitleggen wat de directe aanleiding was om de dijk na jaren van twijfel echt te bouwen. Onder welk kopje van bron A zoek je?', o:['De stormvloed van 1916', 'Een oud plan uit 1891', 'Bouwen met keileem en wilgentenen', 'Nieuw land: de polders'],
        u:'Het plan bestond al sinds 1891, maar werd lang niet uitgevoerd. Een directe aanleiding is een gebeurtenis die de knoop doorhakt.' },
      { t:'keuze', v:'Bron D is uitgegeven door een vereniging uit een vissersdorp. Wat moet je daarbij bedenken?', o:['Je hoort vooral de kant van de vissers, dus vul het aan met een andere bron.', 'Het boek is uit 1982, dus wat het over 1932 zegt, klopt niet meer.', 'Een vereniging mag officieel geen geschiedenisboeken uitgeven.'],
        u:'Herinneringen van betrokkenen zijn waardevol, maar ze laten één kant zien.' },
      { t:'keuze', v:'Bron D is uit 1982, bron A uit 2019. Waarom is het oude jaartal bij D hier geen groot bezwaar?', o:['Er leefden toen nog veel vissers die de afsluiting zelf hadden meegemaakt.', 'Oudere boeken zijn altijd betrouwbaarder dan nieuwe boeken.', 'In 1982 was de Afsluitdijk pas helemaal af.'],
        u:'Bij geschiedenis kan een oudere bron juist dichter bij de gebeurtenis staan. Voor regels of prijzen ligt dat anders.' },
      { t:'open', v:'De korte tekst bij bron A zegt: "Voor de een een overwinning op het water, voor de ander het einde van een bestaan." Voorspel: wie bedoelt de schrijver met "de een" en "de ander"?', m:'De een: de mensen die nu veilig waren voor overstromingen en er nieuw land bij kregen. De ander: de vissers rond de Zuiderzee, die hun werk kwijtraakten.', r:3 }
    ],
    doel:[
      { t:'keuze', v:'Wat voor tekst is bron D vooral?', o:['een verzameling herinneringen van mensen die het meemaakten', 'een wetenschappelijk onderzoek naar de bouw van de dijk', 'een reisgids voor toeristen die het dorp bezoeken'],
        u:'Oud-vissers vertellen: het zijn hun eigen herinneringen.' },
      { t:'keuze', v:'Wat wil de maker van bron E vooral?', o:['dat je de dijk bezoekt en er een dagje uit van maakt', 'dat je leert waarom de dijk ooit is aangelegd', 'dat je weet waar je kunt klagen over het werk aan de dijk'],
        u:'Een toeristenbureau wil bezoekers trekken. Kijk naar "om nooit te vergeten" en naar de terrasjes.' }
    ],
    onderwerp:[
      { t:'keuze', v:'Neem titel, korte tekst en kopjes van bron A samen. Wat is het onderwerp van bron A?', o:['de afsluiting van de Zuiderzee en wat die voor mensen betekende', 'de techniek van dijken en dammen over de hele wereld', 'het leven van een ingenieur rond het jaar 1900'],
        u:'Bron C gaat over waterbouw in de hele wereld. Bron A blijft bij de Zuiderzee.' },
      { t:'open', v:'Welke hoofdgedachte verwacht je in bron A? Schrijf één zin.', m:'De Afsluitdijk beschermde het land tegen de zee en gaf nieuw land, maar betekende ook het einde van de Zuiderzeevisserij.', r:2 }
    ]
  }
});

LEESBANK.T({
  id:'verkennend-slaap', niv:'3F', strat:'verkennend', titel:'Tieners en slaap: waarom je pas laat moe wordt', vorm:'website', bron:'Kennisplatform Jong en Gezond, bijgewerkt in 2026',
  blokken:[
    { kop:'Een klok die verschuift', tekst:'Tijdens de puberteit gaat je biologische klok later lopen. Je lichaam maakt het slaaphormoon melatonine dan pas laat op de avond aan. Daardoor word je later moe, ook als je verstandig om tien uur in bed ligt. Dat is geen luiheid, maar een normale verandering die bij het opgroeien hoort.' },
    { kop:'Hoeveel slaap heb je nodig?', tekst:'Slaaponderzoekers adviseren tieners om elke nacht acht tot tien uur te slapen. In de praktijk halen veel scholieren dat op schooldagen niet. Wie om half twaalf in slaap valt en om half zeven de wekker hoort, komt uit op zeven uur, en vaak nog minder.' },
    { kop:'Het eerste uur op school', tekst:'Docenten merken het al lang: in het eerste lesuur zitten opvallend veel leerlingen met halfdichte ogen. In een paar Amerikaanse steden begonnen scholen bij wijze van proef later. De leerlingen sliepen daar gemiddeld ruim een halfuur langer en kwamen minder vaak te laat.' },
    { kop:'Schermen in de avond', tekst:'Een telefoon in bed houdt je op twee manieren wakker. Het licht van het scherm remt de aanmaak van melatonine een beetje. Belangrijker is vaak de spanning: een spannend spel of een groepsapp die blijft trillen, maakt je hoofd weer actief.' },
    { kop:'Inhalen in het weekend', tekst:'Op zaterdag tot twaalf uur uitslapen voelt als een oplossing. Het helpt ook een beetje om tekort in te halen. Maar je klok schuift er nog verder door op. Op zondagavond kun je dan moeilijk in slaap komen, en begint de week opnieuw met een tekort.' },
    { kop:'Bezwaren tegen later beginnen', tekst:'Niet iedereen is voor een latere start. Wie later begint, is ook later uit, en dat botst met sporttrainingen en bijbaantjes. Ook roosters van bussen en de werktijden van ouders spelen mee. Een veelgehoorde vrees is dat leerlingen dan gewoon later naar bed gaan. Bij de proeven in Amerika bleek dat mee te vallen: de bedtijd bleef ongeveer gelijk.' },
    { kop:'Wat kun je zelf doen?', tekst:'Leg je telefoon een halfuur voor het slapen buiten je kamer. Ga elke dag rond dezelfde tijd naar bed, ook in het weekend. Zoek in de ochtend het daglicht op, bijvoorbeeld door naar school te fietsen. Licht in de ochtend zet je klok weer een stukje vroeger.' },
    { kop:'Over dit platform', tekst:'Jong en Gezond is een stichting van artsen en onderzoekers. We krijgen geld van de overheid en van gezondheidsfondsen. We verkopen niets en maken geen reclame.' }
  ],
  taken:{
    verkennend:[
      { t:'raster', v:'Je doet mee aan een debat over de stelling: **Scholen moeten later beginnen.** Jij bent vóór en hebt vijf minuten om je voor te bereiden. Waar helpt elk stuk je mee? Kijk alleen naar de kopjes en de eerste zin.', kol:['argument vóór', 'argument tegen', 'geen van beide'],
        rijen:[{ z:'Een klok die verschuift', g:0 }, { z:'Het eerste uur op school', g:0 }, { z:'Bezwaren tegen later beginnen', g:1 }, { z:'Over dit platform', g:2 }],
        u:'Een klok die later loopt en slaperige leerlingen in het eerste uur pleiten vóór een latere start. De bezwaren zijn argumenten tegen, die je wel moet kennen. Over dit platform zegt iets over de maker, niet over de stelling.' },
      { t:'keuze', v:'Je tegenstander zegt: "Als school later begint, gaan leerlingen gewoon later naar bed." Onder welk kopje zoek je een antwoord daarop?', o:['Bezwaren tegen later beginnen', 'Schermen in de avond', 'Inhalen in het weekend', 'Wat kun je zelf doen?'],
        u:'Het is een bezwaar tegen later beginnen. In dat stuk staat ook wat de proeven lieten zien over de bedtijd.' },
      { t:'keuze', v:'Waarom is het stuk "Over dit platform" belangrijk voor jou als debater?', o:['Je kunt laten zien dat de bron onafhankelijk is en niets wil verkopen.', 'Daar staat hoeveel uur slaap een tiener per nacht nodig heeft.', 'Daar staat het sterkste argument voor een latere schooltijd.'],
        u:'In een debat vraagt de tegenpartij al snel: wie zegt dat? Dan wil je de maker kunnen noemen.' },
      { t:'open', v:'Lees alleen het kopje "Inhalen in het weekend". Het staat tussen stukken over slaapproblemen. Voorspel: zal dit stuk zeggen dat uitslapen een goede oplossing is? Leg uit waarom je dat denkt.', m:'Waarschijnlijk niet helemaal. Het staat tussen de problemen, dus het zegt vermoedelijk dat uitslapen maar een beetje helpt of het probleem zelfs groter maakt.', r:3 }
    ],
    doel:[
      { t:'keuze', v:'De website legt vooral uit waarom tieners later moe worden. Waarom staat er dan ook een stuk met bezwaren tegen later beginnen?', o:['De maker wil eerlijk informeren en laat daarom ook de andere kant zien.', 'De maker wil lezers overhalen om tegen een latere schooltijd te zijn.', 'De maker wil lezers vermaken met de vreemde bezwaren van ouders.'],
        u:'Een bron die wil informeren, noemt ook de nadelen. Een bron die alleen wil overtuigen, laat die vaak weg.' },
      { t:'keuze', v:'Het stuk "Wat kun je zelf doen?" heeft een ander doel dan de meeste andere stukken. Welk?', o:['instrueren: het zegt wat je kunt doen', 'amuseren: het vertelt een grappig voorval', 'overtuigen: het wil dat je de stelling steunt'],
        u:'Leg je telefoon weg, ga op tijd naar bed, zoek daglicht op: dat zijn aanwijzingen.' }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van de hele website?', o:['de slaap van tieners en het begin van de schooldag', 'het gebruik van schermen voor het slapen', 'de werking van het hormoon melatonine'],
        u:'Schermen en melatonine komen voor, maar zijn maar een deel. Het onderwerp past bij alle stukken.' },
      { t:'open', v:'Wat is de hoofdgedachte van de website? Schrijf één zin. Gebruik de titel en de kopjes.', m:'Tieners worden door hun lichaam pas laat moe en slapen daardoor vaak te kort als school vroeg begint.', r:2 }
    ]
  }
});

/* ---------- globaal lezen: 3 teksten op 1F, 3 op 2F, 3 op 3F ---------- */

/* ===== 1F ===== */
LEESBANK.T({
  id:'globaal-zebra', niv:'1F', strat:'globaal', titel:'Waarom heeft een zebra strepen?', vorm:'artikel', tijd:90,
  bron:'Artikel uit een natuurblad voor jongeren',
  alineas:[
    'Een zebra zie je van ver. Hij heeft zwarte en witte strepen over zijn hele lijf. Geen zebra heeft precies dezelfde strepen als een andere zebra. Maar waarom heeft een zebra eigenlijk strepen? Onderzoekers vragen zich dat al heel lang af.',
    'Een oud idee is dat de strepen helpen tegen leeuwen. Als een groep zebra\'s wegrent, lopen al die strepen door elkaar. Een leeuw zou dan niet goed zien waar de ene zebra ophoudt en de andere begint. Toch is daar weinig bewijs voor gevonden.',
    'Een ander idee gaat over warmte. Zwart wordt in de zon warmer dan wit. Daardoor zou er boven de strepen een klein briesje ontstaan, dat de zebra koel houdt. Ook dat is nooit goed aangetoond.',
    'Het beste bewijs gaat over vliegen. In Afrika leven steekvliegen die bloed zuigen en ziektes overbrengen. Onderzoekers gaven paarden een jas met strepen. De vliegen landden veel minder vaak op die paarden dan op paarden met een gewone jas. Ze vlogen wel naar de strepen toe, maar remden niet goed af en vlogen er weer langs.',
    'Zijn de strepen dus vooral een soort insectenspray? Veel onderzoekers denken van wel. Misschien helpen ze ook nog een beetje tegen de hitte. Het laatste woord over de zebra is nog niet gezegd.'
  ],
  taken:{
    globaal:[
      { t:'koppel', v:'Lees de tekst snel door. Welk kopje hoort bij welke alinea? Eén kopje blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 3', 'Alinea 4', 'Alinea 5'],
        rechts:['Een oude vraag', 'Verstoppen voor de leeuw', 'Koel blijven in de zon', 'De proef met de paarden', 'Wat weten we nu?'], extra:['Waar zebra\'s wonen'],
        u:'Kijk naar de eerste zin van elke alinea. Nergens staat waar zebra\'s wonen.' },
      { t:'open', v:'Waar gaat de hele tekst over? Schrijf het op in één zin.', b:'De tekst gaat over', m:'waarom zebra\'s strepen hebben en welke ideeën onderzoekers daarover hebben.', r:1 },
      { t:'keuze', v:'Welke zin past het best bij de hele tekst?', o:['Onderzoekers hebben drie ideeën, en het idee over vliegen heeft het meeste bewijs.', 'Zebra\'s hebben strepen om zich in een groep te verstoppen voor de leeuw.', 'Zebrastrepen houden de zebra koel, en dat hebben onderzoekers nu bewezen.'],
        u:'De tweede en derde zin passen maar bij één alinea, en die ideeën zijn juist niet bewezen.' },
      { t:'keuze', v:'In welke alinea lees je hoe onderzoekers een proef deden?', o:['alinea 4', 'alinea 2', 'alinea 3', 'alinea 5'] }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van de tekst?', o:['de strepen van de zebra', 'steekvliegen in Afrika', 'leeuwen op jacht'], u:'Het onderwerp past bij de hele tekst, niet bij één alinea.' },
      { t:'open', v:'Wat is de hoofdgedachte? Schrijf één zin: wat zegt de schrijver over het onderwerp?', m:'Zebra\'s hebben waarschijnlijk vooral strepen om steekvliegen op afstand te houden.', r:2 }
    ],
    alinea:[
      { t:'keuze', v:'Wat is de kernzin van alinea 4?', o:['Het beste bewijs gaat over vliegen.', 'In Afrika leven steekvliegen die bloed zuigen en ziektes overbrengen.', 'Onderzoekers gaven paarden een jas met strepen.'],
        u:'De eerste zin zegt waar de alinea over gaat. De andere zinnen vertellen er meer over.' },
      { t:'keuze', v:'Wat doet alinea 1 in de tekst?', o:['Hij leidt de tekst in met een vraag.', 'Hij geeft een voorbeeld bij het eerste idee.', 'Hij vat alle ideeën kort samen.'] }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 3 begint met "Een **ander** idee". Welk verband geeft dat?', o:['opsomming: er komt nog een idee bij', 'tegenstelling: het vorige idee klopt niet', 'oorzaak: het vorige idee zorgt hiervoor'],
        u:'Na het idee over leeuwen komt een tweede idee. Dat is een opsomming.' },
      { t:'keuze', v:'Alinea 5: "Zijn de strepen **dus** vooral een soort insectenspray?" Welk verband geeft dus?', o:['conclusie', 'voorbeeld', 'tegenstelling'],
        u:'Na alle ideeën trekt de schrijver een conclusie.' }
    ]
  }
});

LEESBANK.T({
  id:'globaal-training', niv:'1F', strat:'globaal', titel:'De eerste training', vorm:'verhaal', tijd:90,
  alineas:[
    'Yasmina stond bij het hek van sportpark De Linde. Ze trok voor de derde keer haar sokken omhoog. Op het veld waren twaalf meiden al aan het overschieten. Ze kenden elkaar allemaal. Yasmina woonde pas twee weken in de stad.',
    'De trainer zwaaide naar haar. "Jij bent vast Yasmina! Kom erbij, we beginnen zo." Yasmina liep langzaam het veld op. Ze keek naar het gras en niet naar de andere meiden.',
    'Eerst moesten ze een rondje rennen. Daarna kwam een oefening met passen. Yasmina kreeg de bal van een lang meisje met een blauwe haarband. Ze schoot hem hard terug, precies in de voeten. "Wauw," zei het meisje. "Waar heb jij gespeeld?"',
    'Aan het eind deden ze een partijtje. Yasmina scoorde twee keer. Bij het tweede doelpunt rende het meisje met de haarband op haar af en gaf haar een high five. Ze heette Lotte, hoorde Yasmina later.',
    'Na de training stond Yasmina\'s vader bij het hek. "En?" vroeg hij. "Hoe was het?" Yasmina haalde haar schouders op. "Gewoon," zei ze. Maar de hele weg naar huis neuriede ze. Thuis zette ze haar voetbalschoenen alvast klaar voor donderdag.'
  ],
  taken:{
    globaal:[
      { t:'koppel', v:'Lees het verhaal snel door. Welk kopje hoort bij welke alinea? Eén kopje blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 3', 'Alinea 4', 'Alinea 5'],
        rechts:['Alleen bij het hek', 'Het veld op', 'Een goede pass', 'Twee keer raak', 'Op weg naar huis'], extra:['Ruzie in de kleedkamer'],
        u:'Er komt geen kleedkamer in het verhaal voor, en ook geen ruzie.' },
      { t:'open', v:'Waar gaat het verhaal over? Schrijf het op in één zin.', b:'Het verhaal gaat over', m:'een meisje dat voor het eerst traint bij een nieuwe club en daar een fijne middag heeft.', r:1 },
      { t:'keuze', v:'Welke zin past het best bij het hele verhaal?', o:['Yasmina is eerst zenuwachtig, maar de training gaat beter dan ze dacht.', 'Yasmina vindt het voetballen bij de nieuwe club saai en wil stoppen.', 'Yasmina en Lotte zijn al jaren vriendinnen en zitten in één team.'],
        u:'Lotte leert ze pas op deze dag kennen. En stoppen wil ze niet: ze zet haar schoenen al klaar.' },
      { t:'keuze', v:'In welke alinea lees je dat Yasmina doelpunten maakt?', o:['alinea 4', 'alinea 3', 'alinea 5', 'alinea 2'] }
    ],
    tussen:[
      { t:'keuze', v:'Alinea 1: Yasmina trekt voor de derde keer haar sokken omhoog. Wat zegt dat over haar?', o:['Ze is zenuwachtig.', 'Haar sokken zijn te groot.', 'Ze heeft het koud.'],
        u:'Ze staat alleen bij het hek en kent niemand. Ze doet iets wat niet nodig is: zo ga je om met spanning. Ook in alinea 2 kijkt ze naar het gras.' },
      { t:'open', v:'Yasmina zegt tegen haar vader: "Gewoon." Vond ze de training echt gewoon? Noem twee dingen uit alinea 5 die het verraden.', m:'Nee, ze vond het leuk. Ze neuriet de hele weg naar huis en zet haar schoenen al klaar voor donderdag.', r:2 }
    ],
    samenvat:[
      { t:'open', v:'Vat het verhaal samen in hoogstens 30 woorden.', max:30, m:'Yasmina is nieuw in de stad en gaat zenuwachtig naar haar eerste training. Ze speelt goed, scoort twee keer, maakt een vriendin en wil graag terug.' }
    ],
    alinea:[
      { t:'keuze', v:'Wat doet alinea 1 in het verhaal?', o:['Hij laat zien waar Yasmina is en dat ze daar nog niemand kent.', 'Hij vertelt hoe de training voor Yasmina afloopt.', 'Hij legt uit hoe een voetbaltraining in elkaar zit.'] }
    ]
  }
});

LEESBANK.T({
  id:'globaal-opa', niv:'1F', strat:'globaal', titel:'Opa en zijn nieuwe telefoon', vorm:'artikel', tijd:90,
  bron:'Column van Daan (14) in de schoolkrant',
  alineas:[
    'Mijn opa is 78 en heeft sinds kort een smartphone. Oma vond dat het tijd werd. "Dan kun je de kleinkinderen appen," zei ze. Opa zei niets. Hij keek naar het ding alsof het een levende kreeft was.',
    'De eerste week belde hij mij elke dag. Niet om te kletsen, maar met een vraag. Hoe zet ik het geluid zachter? Waarom zit er ineens een hondje op mijn foto? Waar is de knop om op te hangen?',
    'Ik heb het hem allemaal uitgelegd, meestal twee keer. Daarom weet ik nu ook hoe lastig zo\'n telefoon is als je er nooit eerder een hebt gehad. Alle knoppen lijken op elkaar. En als je per ongeluk ergens op drukt, gebeurt er van alles.',
    'Inmiddels gaat het beter. Opa stuurt mij elke ochtend een appje. Meestal is het een foto van de tuin, met daaronder drie duimpjes. Soms is het per ongeluk een foto van zijn eigen neus.',
    'Vorige week vroeg ik hem of hij zijn oude telefoon terug wilde. Hij keek me aan alsof ik gek was geworden. "Dan mis ik de foto\'s van jou en je zus," zei hij. Ik heb oma nog nooit zo tevreden zien kijken.'
  ],
  taken:{
    globaal:[
      { t:'koppel', v:'Lees de column snel door. Welk kopje hoort bij welke alinea? Eén kopje blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 3', 'Alinea 4', 'Alinea 5'],
        rechts:['Een telefoon voor opa', 'Elke dag een vraag', 'Lastiger dan je denkt', 'Foto\'s in de ochtend', 'Nooit meer terug'], extra:['Opa koopt een computer'] },
      { t:'open', v:'Waar gaat de column over? Schrijf het op in één zin.', b:'De column gaat over', m:'een opa die moet leren omgaan met zijn eerste smartphone en hem nu niet meer wil missen.', r:1 },
      { t:'keuze', v:'Welke zin past het best bij de hele column?', o:['Opa vond de telefoon eerst lastig, maar nu wil hij hem niet meer missen.', 'Opa vindt de telefoon nog steeds lastig en belt Daan nog elke dag.', 'Oma helpt opa elke dag met de telefoon, want Daan heeft geen tijd.'],
        u:'Alinea 4 en 5 laten zien dat het nu goed gaat. Dat hoort bij de hele tekst.' },
      { t:'keuze', v:'In welke alinea lees je wat Daan zelf geleerd heeft?', o:['alinea 3', 'alinea 2', 'alinea 4', 'alinea 5'],
        u:'In alinea 3 schrijft Daan: daarom weet ik nu ook hoe lastig zo\'n telefoon is.' }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van de column?', o:['opa en zijn smartphone', 'appjes sturen naar je kleinkinderen', 'foto\'s maken van de tuin'], u:'De andere twee komen elk in maar één alinea voor.' }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 3: "**Daarom** weet ik nu ook hoe lastig zo\'n telefoon is." Welk verband geeft daarom?', o:['oorzaak en gevolg', 'tegenstelling', 'opsomming'],
        u:'Omdat Daan alles moest uitleggen (oorzaak), weet hij nu hoe lastig het is (gevolg).' },
      { t:'keuze', v:'Alinea 4 begint met "**Inmiddels** gaat het beter." Wat betekent inmiddels hier?', o:['tijd: nu, een tijd na de eerste week', 'oorzaak: door de foto\'s gaat het beter', 'voorwaarde: alleen als opa oefent'] }
    ],
    tussen:[
      { t:'keuze', v:'Alinea 1: opa kijkt naar de telefoon "alsof het een levende kreeft was". Wat bedoelt Daan?', o:['Opa vertrouwt het ding niet.', 'Opa vindt de telefoon mooi.', 'Opa vindt de telefoon te duur.'],
        u:'Een levende kreeft pak je niet graag op: hij kan knijpen. Opa durft de telefoon nog niet goed aan.' },
      { t:'open', v:'Alinea 5: "Ik heb oma nog nooit zo tevreden zien kijken." Waarom kijkt oma zo tevreden? Gebruik ook alinea 1.', m:'Het was haar idee dat opa een smartphone kreeg, en nu blijkt hij er blij mee te zijn.', r:2 }
    ],
    samenvat:[
      { t:'open', v:'Vat de column samen in hoogstens 25 woorden.', max:25, m:'Opa kreeg een smartphone en vond die eerst heel lastig. Na veel uitleg stuurt hij nu elke dag foto\'s en wil hij hem houden.' }
    ]
  }
});

/* ===== 2F ===== */
LEESBANK.T({
  id:'globaal-spierpijn', niv:'2F', strat:'globaal', titel:'Spierpijn: wat er echt gebeurt', vorm:'artikel', tijd:120,
  bron:'Artikel van een website over sport en gezondheid',
  alineas:[
    'Je hebt voor het eerst in maanden een flinke fietstocht gemaakt, of je hebt een nieuwe sport geprobeerd. Die avond voel je weinig. Maar de volgende ochtend kom je bijna je bed niet uit, en traplopen voelt als een straf. Iedereen kent het: spierpijn.',
    'Lange tijd dachten mensen dat spierpijn kwam door melkzuur. Die stof maakt je lichaam aan als je spieren hard werken en er te weinig zuurstof is. Toch klopt die verklaring niet. Het lichaam ruimt melkzuur binnen een paar uur na het sporten weer op, terwijl spierpijn vaak pas een dag later begint.',
    'De echte oorzaak zit in de spiervezels zelf. Als je spieren iets doen wat ze niet gewend zijn, ontstaan er kleine scheurtjes in. Vooral bewegingen waarbij een spier kracht zet terwijl hij langer wordt, zoals bergaf lopen of langzaam door je knieën zakken, geven veel van die schade. Je lichaam gaat de scheurtjes herstellen. Daarbij raakt het weefsel licht ontstoken. Daardoor wordt de spier gevoelig en stijf.',
    'Spierpijn is meestal het ergst na één tot drie dagen. Daarna zakt het vanzelf af, en na een week is het bijna altijd over. Wat helpt? Rustig bewegen, zoals wandelen of een stukje fietsen, maakt de spieren soepeler en verlicht de pijn even. Een warme douche kan prettig voelen, maar het herstel gaat er niet echt sneller door.',
    'Het goede nieuws: je spieren leren ervan. Na het herstel zijn ze beter voorbereid op dezelfde beweging. Doe je een week later precies dezelfde training, dan heb je meestal veel minder spierpijn. Begin daarom rustig met een nieuwe sport en bouw het langzaam op. Zo blijft het leuk.'
  ],
  taken:{
    globaal:[
      { t:'koppel', v:'Lees de tekst snel door. Welk kopje hoort bij welke alinea? Eén kopje blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 3', 'Alinea 4', 'Alinea 5'],
        rechts:['Herkenbaar na het sporten', 'Een oud misverstand', 'Kleine scheurtjes', 'Hoe lang en wat helpt', 'Sterker dan eerst'], extra:['Rekken voor het sporten'],
        u:'Over rekken staat niets in de tekst. Let op de eerste zinnen: "Lange tijd dachten mensen", "De echte oorzaak", "Het goede nieuws".' },
      { t:'open', v:'Waar gaat de hele tekst over? Schrijf het op in één zin.', b:'De tekst gaat over', m:'waar spierpijn echt vandaan komt, hoe lang het duurt en wat je eraan kunt doen.', r:1 },
      { t:'keuze', v:'Welke zin past het best bij de hele tekst?', o:['Spierpijn komt door kleine scheurtjes, gaat vanzelf over en maakt je spieren sterker.', 'Spierpijn komt door melkzuur, dus je moet na het sporten een warme douche nemen.', 'Spierpijn is gevaarlijk, dus je kunt beter niet aan een nieuwe sport beginnen.'],
        u:'De tekst zegt juist dat melkzuur niet de oorzaak is, en dat een douche het herstel niet versnelt.' },
      { t:'keuze', v:'In welke alinea lees je waarom een bekende verklaring voor spierpijn niet klopt?', o:['alinea 2', 'alinea 3', 'alinea 4', 'alinea 5'] }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van de tekst?', o:['spierpijn na het sporten', 'melkzuur in je spieren', 'een nieuwe sport kiezen'] },
      { t:'open', v:'Wat is de hoofdgedachte? Schrijf één zin: wat zegt de schrijver over het onderwerp?', m:'Spierpijn komt niet door melkzuur maar door kleine scheurtjes in je spieren, en je spieren worden er juist sterker van.', r:2 }
    ],
    alinea:[
      { t:'keuze', v:'Welke zin is de kernzin van alinea 3?', o:['De echte oorzaak zit in de spiervezels zelf.', 'Je lichaam gaat de scheurtjes herstellen.', 'Daardoor wordt de spier gevoelig en stijf.'],
        u:'De eerste zin zegt waar de hele alinea over gaat. De andere zinnen leggen stap voor stap uit hoe dat werkt.' },
      { t:'koppel', v:'Wat doet elke alinea in de tekst? Eén functie blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 3', 'Alinea 5'],
        rechts:['inleiden met een herkenbare situatie', 'een oude verklaring weerleggen', 'de echte oorzaak uitleggen', 'afsluiten met een advies'], extra:['een onderzoek beschrijven'],
        u:'Alinea 2 laat zien dat een oud idee niet klopt: dat is weerleggen. Een onderzoek wordt nergens beschreven.' }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 2: "Het lichaam ruimt melkzuur binnen een paar uur weer op, **terwijl** spierpijn vaak pas een dag later begint." Welk verband geeft terwijl hier?', o:['tegenstelling', 'tijd', 'oorzaak'],
        u:'Terwijl kan "op hetzelfde moment" betekenen, maar hier zet het twee dingen tegenover elkaar: het melkzuur is al weg, de pijn moet nog komen.' },
      { t:'keuze', v:'Alinea 3: "Vooral bewegingen waarbij een spier kracht zet terwijl hij langer wordt, **zoals** bergaf lopen". Welk verband geeft zoals?', o:['voorbeeld', 'vergelijking', 'opsomming'],
        u:'Bergaf lopen is een voorbeeld van zo\'n beweging.' }
    ]
  }
});

LEESBANK.T({
  id:'globaal-bijbaan', niv:'2F', strat:'globaal', titel:'Vakken vullen', vorm:'verhaal', tijd:120,
  alineas:[
    'Om half vijf stond Milan in de kantine van supermarkt De Buurtmarkt. Hij had een blauw shirt aan dat twee maten te groot was. Op het bordje op zijn borst stond zijn naam, met een fout erin: Millan. Hij zei er maar niets van.',
    'Teamleider Ricardo gaf hem een snelle rondleiding. "Hier staan de rolcontainers, daar is de koeling, en dit is je scanner. Nieuwe producten zet je achteraan, de oude schuif je naar voren. Duidelijk?" Milan knikte, al was hij de helft alweer vergeten.',
    'Zijn eerste klus was het pad met ontbijt. Hagelslag, pindakaas, jam: het ging best snel. Totdat hij een tray met dertig eieren uit de container tilde en die uit zijn handen gleed. Met een zacht gekraak kwamen de eieren op de tegels terecht. Een mevrouw met een winkelwagen keek hem aan en reed met een boog om hem heen.',
    'Milan voelde zijn gezicht warm worden. Hij wilde het liefst naar huis. Maar Ricardo kwam al aanlopen, met een emmer en een dweil. "Welkom bij de club," zei hij. "In mijn eerste week liet ik een hele krat melk vallen. Pak jij de doekjes? Dan doe ik de vloer."',
    'Om negen uur zat zijn dienst erop. Milan had drie paden gevuld en geen ei meer gebroken. Bij de uitgang draaide Ricardo zich om. "Zaterdag weer?" Milan aarzelde geen seconde. Op de fiets naar huis rekende hij uit hoeveel diensten hij nodig had voor een nieuwe telefoon. Het waren er nogal wat. Het kon hem weinig schelen.'
  ],
  taken:{
    globaal:[
      { t:'koppel', v:'Lees het verhaal snel door. Welk kopje hoort bij welke alinea? Eén kopje blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 3', 'Alinea 4', 'Alinea 5'],
        rechts:['Klaar voor de eerste dienst', 'Veel uitleg in één keer', 'Een ongeluk in het pad', 'Hulp van de teamleider', 'Het eind van de dienst'], extra:['Een klant met een klacht'],
        u:'De mevrouw in alinea 3 kijkt alleen en rijdt om Milan heen. Ze klaagt niet.' },
      { t:'open', v:'Waar gaat het verhaal over? Schrijf het op in één zin.', b:'Het verhaal gaat over', m:'een jongen die op zijn eerste werkdag in een supermarkt eieren laat vallen, door zijn teamleider geholpen wordt en graag terugkomt.', r:2 },
      { t:'keuze', v:'Welke zin past het best bij het hele verhaal?', o:['Milans eerste werkdag gaat mis, maar dankzij Ricardo eindigt hij toch goed.', 'Milan maakt op zijn eerste dag zoveel fouten dat hij niet terug mag komen.', 'Milan werkt al jaren in de supermarkt en leert Ricardo hoe het moet.'],
        u:'Ricardo vraagt aan het eind: zaterdag weer? Milan mag dus terugkomen, en hij wil het ook.' },
      { t:'keuze', v:'In welke alinea lees je hoe Milan uitleg krijgt over het werk?', o:['alinea 2', 'alinea 1', 'alinea 3', 'alinea 4'] }
    ],
    tussen:[
      { t:'keuze', v:'Alinea 1: op het bordje staat Millan, maar Milan zegt er niets van. Wat zegt dat over hem?', o:['Hij durft op zijn nieuwe werk nog niet goed iets te zeggen.', 'Hij vindt het prima, want zo schrijf je zijn naam eigenlijk.', 'Hij heeft het bordje nog helemaal niet goed bekeken.'],
        u:'Hij ziet de fout wel ("met een fout erin"), maar laat het zo. Op je eerste dag wil je niet meteen lastig doen.' },
      { t:'keuze', v:'Alinea 4: Ricardo vertelt over de krat melk. Waarom doet hij dat?', o:['Hij wil dat Milan zich minder rot voelt.', 'Hij wil laten zien dat hij zelf slordig is.', 'Hij wil Milan leren hoe je een krat tilt.'],
        u:'Milans gezicht wordt warm en hij wil naar huis. Ricardo laat merken: dit overkomt iedereen.' },
      { t:'open', v:'Alinea 5: "Milan aarzelde geen seconde." Wat antwoordt Milan op de vraag van Ricardo, en waaraan merk je nog meer hoe hij zich voelt?', m:'Hij zegt ja. Op weg naar huis rekent hij al uit hoeveel diensten hij nodig heeft, en dat het er veel zijn kan hem weinig schelen.', r:2 }
    ],
    samenvat:[
      { t:'open', v:'Vat het verhaal samen in hoogstens 35 woorden.', max:35, m:'Milan begint aan zijn eerste dienst in een supermarkt. Hij krijgt veel uitleg en laat een tray eieren vallen. Ricardo helpt hem en stelt hem gerust. Aan het eind wil Milan graag terugkomen.' }
    ],
    alinea:[
      { t:'keuze', v:'Wat is de functie van alinea 4 in het verhaal?', o:['Het verhaal draait om: na de fout komt er hulp.', 'Het verhaal begint: je leert Milan kennen.', 'Het verhaal eindigt: Milan gaat naar huis.'],
        u:'In alinea 3 gaat het mis. In alinea 4 komt Ricardo, en vanaf dan gaat het beter.' }
    ]
  }
});

LEESBANK.T({
  id:'globaal-wekker', niv:'2F', strat:'globaal', titel:'Mijn telefoon slaapt in de keuken', vorm:'artikel', tijd:120,
  bron:'Column van Fenna (16) in de schoolkrant',
  alineas:[
    'Een maand geleden viel ik in de wiskundeles bijna in slaap. Niet een beetje knikkebollen, maar echt: mijn hoofd zakte naar voren en mijn pen viel op de grond. Meneer Okafor vroeg vriendelijk of ik misschien een kussen wilde. De hele klas lag dubbel. Ik lachte mee, maar thuis heb ik eens eerlijk naar mezelf gekeken.',
    'Het probleem was niet moeilijk te vinden. Elke avond nam ik mijn telefoon mee naar bed, "alleen even" om de groepsapp te lezen. Daarna volgde nog een filmpje, en nog een. Voor ik het wist was het half één. Jongeren van mijn leeftijd hebben acht tot tien uur slaap nodig, las ik. Ik haalde er zes, op een goede dag.',
    'Daarom heb ik een experiment bedacht. Mijn telefoon slaapt sinds die dag in de keuken, aan de oplader. In de kringloopwinkel kocht ik voor twee euro een ouderwetse wekker. Hij tikt zo hard dat mijn broertje dacht dat er een specht in mijn kamer woonde.',
    'De eerste nachten waren eerlijk gezegd vreselijk. Ik lag te woelen en dacht aan alles wat ik misschien miste. Stel dat iemand iets grappigs in de groep zette? Stel dat het huiswerk was veranderd? Bovendien is een donkere kamer zonder scherm opvallend saai. Ik ben zelfs een boek gaan lezen. Uit mezelf.',
    'Nu, na drie weken, slaap ik meestal voor elf uur. Ik word wakker voordat de wekker afgaat, en in de wiskundeles zit ik rechtop. Wat ik in de groepsapp heb gemist? Eerlijk gezegd weet ik het niet meer. Zo belangrijk kan het dus niet zijn geweest.',
    'Eén ding is wel jammer. Meneer Okafor kijkt me sinds kort een beetje teleurgesteld aan. Volgens mij had hij dat kussen al gekocht.'
  ],
  taken:{
    globaal:[
      { t:'koppel', v:'Lees de column snel door. Welk kopje hoort bij welke alinea? Eén kopje blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 3', 'Alinea 4', 'Alinea 5', 'Alinea 6'],
        rechts:['In slaap in de les', 'Altijd nog één filmpje', 'Het experiment', 'Moeilijke eerste nachten', 'Drie weken later', 'Een grapje tot slot'], extra:['Tips van de schoolarts'],
        u:'Er komt geen schoolarts in de column voor. Fenna vertelt alleen wat zij zelf deed.' },
      { t:'open', v:'Waar gaat de column over? Schrijf het op in één zin.', b:'De column gaat over', m:'een scholier die haar telefoon niet meer mee naar bed neemt en daardoor veel beter slaapt.', r:1 },
      { t:'keuze', v:'Welke zin past het best bij de hele column?', o:['Zonder telefoon in bed slaapt Fenna beter, en ze mist er weinig door.', 'Fenna vindt dat scholieren helemaal geen telefoon meer moeten hebben.', 'Fenna slaapt slecht door een wekker die heel hard tikt.'],
        u:'Fenna vertelt over haar eigen experiment. Ze zegt nergens dat anderen hun telefoon moeten wegdoen.' },
      { t:'keuze', v:'In welke alinea lees je wat Fenna deed om haar probleem op te lossen?', o:['alinea 3', 'alinea 2', 'alinea 4', 'alinea 5'] }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van de column?', o:['slapen zonder telefoon op je kamer', 'de wiskundeles van meneer Okafor', 'een wekker uit de kringloopwinkel'] }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 3 begint met **Daarom**. Welk verband legt dat woord tussen alinea 2 en alinea 3?', o:['Alinea 2 noemt de oorzaak, alinea 3 het gevolg.', 'Alinea 3 spreekt tegen wat in alinea 2 staat.', 'Alinea 3 geeft een voorbeeld bij alinea 2.'],
        u:'Omdat ze te weinig sliep door haar telefoon (alinea 2), bedacht ze een experiment (alinea 3).' },
      { t:'keuze', v:'Alinea 4: "**Bovendien** is een donkere kamer zonder scherm opvallend saai." Welk verband geeft bovendien?', o:['opsomming: er komt nog een nadeel bij', 'tegenstelling: het was juist gezellig', 'conclusie: daarom ging ze lezen'],
        u:'Eerst noemt ze het woelen en het missen. Bovendien voegt daar een tweede nadeel aan toe.' }
    ],
    tussen:[
      { t:'keuze', v:'Alinea 4: "Ik ben zelfs een boek gaan lezen. Uit mezelf." Wat laat Fenna hiermee merken?', o:['Dat ze normaal bijna nooit uit zichzelf een boek leest.', 'Dat haar ouders haar verplichtten om te gaan lezen.', 'Dat lezen altijd al haar grootste hobby was.'],
        u:'Zelfs en uit mezelf laten zien dat het bijzonder is. Iets wat je altijd doet, schrijf je zo niet op.' },
      { t:'open', v:'Alinea 6: "Volgens mij had hij dat kussen al gekocht." Meent Fenna dat echt? Leg uit wat ze bedoelt.', m:'Nee, het is een grapje. Ze bedoelt dat hij haar niet meer kan plagen, omdat ze in de les niet meer in slaap valt.', r:2 }
    ],
    samenvat:[
      { t:'open', v:'Vat de column samen in hoogstens 30 woorden.', max:30, m:'Fenna viel in de les in slaap omdat ze tot laat op haar telefoon zat. Nu ligt haar telefoon in de keuken en slaapt ze veel beter.' }
    ]
  }
});

/* ===== 3F ===== */
LEESBANK.T({
  id:'globaal-bever', niv:'3F', strat:'globaal', titel:'De bever is terug, en niet iedereen juicht', vorm:'artikel', tijd:180,
  bron:'Artikel uit een tijdschrift over natuur en landschap',
  alineas:[
    'Wie langs de Maas of door de Biesbosch wandelt, ziet ze steeds vaker: boomstammen die zijn afgeknaagd tot een punt, als een geslepen potlood. Het is het werk van de bever, met staart en al ruim een meter lang en daarmee het grootste knaagdier van Europa. Dat je die sporen weer tegenkomt, is opmerkelijk, want lange tijd was de bever uit Nederland verdwenen.',
    'Eeuwenlang werd er op het dier gejaagd. Zijn dikke, waterdichte pels was gewild, en uit klieren bij zijn staart werd bevergeil gewonnen, een sterk ruikende stof die in medicijnen en parfum werd gebruikt. Bovendien werden veel natte gebieden drooggelegd voor landbouw, waardoor de bever steeds minder ruimte overhield. In 1826 werd bij Zwartewaal, in Zuid-Holland, het laatste Nederlandse exemplaar gedood.',
    'Ruim anderhalve eeuw later kwam de bever terug, met een beetje hulp. In 1988 werden in de Biesbosch bevers uitgezet die afkomstig waren uit het gebied rond de Elbe in Duitsland. Later volgden uitzettingen in onder meer de Gelderse Poort en Limburg, en ook vanuit België en Duitsland trokken bevers op eigen kracht ons land binnen. Inmiddels leven er naar schatting enkele duizenden in Nederland.',
    'Voor de natuur is dat goed nieuws. De bever is een echte bouwmeester: hij legt dammen aan in beken, waardoor het water stijgt en er nieuwe moerasjes ontstaan. In die natte stukken voelen kikkers, libellen en vissen zich thuis. Ook ontstaan er door zijn geknaag open plekken in het bos, waar zonlicht de bodem bereikt en nieuwe planten kunnen groeien. Ecologen noemen de bever daarom wel een ecosysteemingenieur: een dier dat zijn omgeving zo verandert dat er plek komt voor veel andere soorten.',
    'Toch juicht niet iedereen. Boeren zien hun land onder water lopen als een dam een sloot afsluit, en in parken verdwijnen soms bomen die er al tientallen jaren stonden. Het grootste zorgenpunt zit echter in de dijken. Bevers graven er gangen en holen in, en een dijk vol gaten kan bij hoog water verzwakken. Waterschappen leggen daarom op sommige plekken stalen gaas in de dijk, en soms worden bevers gevangen en elders weer losgelaten.',
    'De bever laat zien dat natuurherstel geen sprookje is met een eenvoudige goede afloop. Een dier dat je terughaalt, gaat zijn eigen gang, en die gang loopt niet altijd langs de wegen die mensen voor hem hebben bedacht. Leren samenleven met de bever kost tijd, geld en geduld. Daar staat een rijkere natuur tegenover.'
  ],
  taken:{
    globaal:[
      { t:'koppel', v:'Lees de tekst snel door. Welk kopje hoort bij welke alinea? Eén kopje blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 3', 'Alinea 4', 'Alinea 5', 'Alinea 6'],
        rechts:['Sporen langs de rivier', 'Waarom de bever verdween', 'Terug met hulp', 'Een bouwmeester in de natuur', 'Niet overal welkom', 'Leren samenleven'], extra:['Hoe een bever zijn jongen grootbrengt'],
        u:'De eerste zinnen wijzen de weg: "Eeuwenlang werd er gejaagd", "Ruim anderhalve eeuw later kwam de bever terug", "Toch juicht niet iedereen". Over jongen staat niets in de tekst.' },
      { t:'open', v:'Waar gaat de hele tekst over? Schrijf het op in één zin.', b:'De tekst gaat over', m:'de terugkeer van de bever in Nederland, die goed is voor de natuur maar ook problemen geeft.', r:2 },
      { t:'keuze', v:'Welke zin past het best bij de hele tekst?', o:['De terugkeer van de bever maakt de natuur rijker, maar vraagt ook om oplossingen.', 'De bever is terug in Nederland en richt zoveel schade aan dat hij weer weg moet.', 'De bever is in 1988 vanzelf vanuit Duitsland naar de Biesbosch teruggekomen.'],
        u:'De tweede zin noemt alleen de nadelen, en de tekst wil de bever niet weg hebben. De derde klopt niet: de bevers in de Biesbosch zijn uitgezet.' },
      { t:'keuze', v:'In welke alinea lees je waarom de bever belangrijk is voor andere dieren?', o:['alinea 4', 'alinea 3', 'alinea 5', 'alinea 6'] }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van de tekst?', o:['de terugkeer van de bever in Nederland', 'de jacht op bevers vroeger', 'dijken en waterschappen'],
        u:'Jacht en dijken komen maar in één alinea voor. De terugkeer is de rode draad.' },
      { t:'open', v:'Wat is de hoofdgedachte? Schrijf één zin: wat zegt de schrijver over het onderwerp?', m:'De bever is terug in Nederland; dat maakt de natuur rijker, maar mensen moeten ook leren omgaan met de problemen die hij geeft.', r:2 }
    ],
    alinea:[
      { t:'keuze', v:'Wat is de kernzin van alinea 5?', o:['Toch juicht niet iedereen.', 'Het grootste zorgenpunt zit echter in de dijken.', 'Bevers graven er gangen en holen in.'],
        u:'De rest van de alinea noemt de bezwaren: van boeren, in parken en bij de dijken. De eerste zin vat ze allemaal samen. De dijken zijn maar één van die bezwaren.' },
      { t:'keuze', v:'Wat doet alinea 6 in de tekst?', o:['Hij sluit af met een conclusie over de hele tekst.', 'Hij geeft nog een voorbeeld van schade door bevers.', 'Hij legt uit hoe een bever een dam bouwt.'] }
    ],
    signaal:[
      { t:'raster', v:'Welk verband geeft het vette woord?', kol:['oorzaak en gevolg', 'tegenstelling', 'opsomming', 'voorbeeld'], rijen:[
        { z:'Alinea 2: **Bovendien** werden veel natte gebieden drooggelegd.', g:2 },
        { z:'Alinea 2: drooggelegd voor landbouw, **waardoor** de bever steeds minder ruimte overhield.', g:0 },
        { z:'Alinea 3: uitzettingen in **onder meer** de Gelderse Poort en Limburg.', g:3 },
        { z:'Alinea 5: **Toch** juicht niet iedereen.', g:1 }
      ], u:'Bovendien voegt een reden toe aan de jacht. Onder meer betekent: dit zijn er een paar van, er zijn er meer.' },
      { t:'open', v:'Alinea 5 begint met **Toch**. Leg uit welk verband dit woord legt tussen alinea 4 en alinea 5.', m:'Een tegenstelling: alinea 4 noemt de voordelen van de bever, alinea 5 de nadelen.', r:2 }
    ]
  }
});

LEESBANK.T({
  id:'globaal-auditie', niv:'3F', strat:'globaal', titel:'Auditie', vorm:'verhaal', tijd:180,
  alineas:[
    'De gang van het conservatorium rook naar oud hout en koffie. Amira zat op een harde stoel naast de deur van zaal 3 en wreef haar handen warm, ook al was het niet koud. Achter de deur speelde iemand een snel stuk, foutloos en zonder één aarzeling. Ze probeerde niet te luisteren.',
    'Haar vader zat twee stoelen verderop. Hij had zijn nette jas aangetrokken, die hij alleen droeg op bruiloften en ouderavonden. Al twintig minuten las hij dezelfde bladzijde van een folder over de opleiding. "Ze hebben hier een eigen orgel," zei hij plotseling. "Wist je dat?" Amira knikte. Ze wist dat hij niets van orgels wist, en dat hij het die ochtend speciaal voor haar had opgezocht.',
    'Toen haar naam werd geroepen, stond ze iets te snel op. In de zaal zaten drie juryleden achter een lange tafel. De vrouw in het midden glimlachte niet en schreef al iets op voordat Amira bij de vleugel was. Het eerste stuk ging goed. Bij het tweede, het stuk dat ze maandenlang elke avond had geoefend, gleden haar vingers halverwege weg. Een seconde was het stil. Toen begon ze opnieuw bij het begin van de zin en speelde het stuk uit tot de laatste noot.',
    '"Dank je wel," zei de vrouw. "Waarom koos je juist dit stuk?" Amira had een antwoord voorbereid over techniek en opbouw. In plaats daarvan hoorde ze zichzelf vertellen dat haar oma het altijd speelde, op een piano die vals klonk, en dat zij het daardoor had leren kennen. De vrouw legde haar pen neer en boog zich een stukje naar voren. De rest van het gesprek schreef ze niets meer op.',
    'Op de gang stond haar vader al. Hij vroeg niet hoe het was gegaan. Hij hield alleen haar jas op, zoals hij vroeger deed toen ze klein was, en zei: "Ik heb gelezen dat ze hier in de kantine goede appeltaart hebben." Amira lachte, voor het eerst die dag. De uitslag zou pas over twee weken komen. Voor het eerst vond ze dat niet erg.'
  ],
  taken:{
    globaal:[
      { t:'koppel', v:'Lees het verhaal snel door. Welk kopje hoort bij welke alinea? Eén kopje blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 3', 'Alinea 4', 'Alinea 5'],
        rechts:['Wachten op de gang', 'Een vader in zijn nette jas', 'Een misser in de zaal', 'Een onverwacht antwoord', 'Appeltaart na afloop'], extra:['De uitslag komt binnen'],
        u:'De uitslag komt pas over twee weken. Die staat dus niet in het verhaal.' },
      { t:'open', v:'Waar gaat het verhaal over? Schrijf het op in één zin.', b:'Het verhaal gaat over', m:'een meisje dat zenuwachtig auditie doet op piano, een fout maakt en daarna, met steun van haar vader, rust vindt.', r:2 },
      { t:'keuze', v:'Welke zin past het best bij het hele verhaal?', o:['Amira maakt een fout op haar auditie, maar laat zien wie ze is en vindt rust.', 'Amira speelt foutloos en hoort meteen dat ze is aangenomen.', 'Amira raakt zo in paniek dat ze de zaal uit rent.'],
        u:'Ze maakt een fout, maar speelt door. De uitslag weet ze nog niet.' },
      { t:'keuze', v:'In welke alinea lees je hoe Amira zich herstelt van een fout?', o:['alinea 3', 'alinea 4', 'alinea 5', 'alinea 1'] }
    ],
    tussen:[
      { t:'keuze', v:'Alinea 2: haar vader leest al twintig minuten dezelfde bladzijde. Wat zegt dat over hem?', o:['Hij is zelf ook zenuwachtig.', 'Hij vindt de folder erg boeiend.', 'Hij kan niet goed lezen.'],
        u:'Hij leest niet echt: hij kijkt naar de bladzijde terwijl hij aan iets anders denkt. Zijn nette jas laat ook zien hoe belangrijk hij deze dag vindt.' },
      { t:'keuze', v:'Alinea 4: de vrouw legt haar pen neer en buigt zich naar voren. Wat kun je daaruit opmaken?', o:['Ze luistert nu echt naar wat Amira vertelt.', 'Ze heeft al besloten dat Amira is afgewezen.', 'Ze vindt het gesprek te lang duren.'],
        u:'Wie zich naar voren buigt en stopt met schrijven, is geboeid. Over de uitslag zegt het verhaal niets.' },
      { t:'open', v:'Alinea 5: de vader vraagt niet hoe het ging, maar begint over appeltaart. Waarom doet hij dat, denk je? Gebruik de tekst.', m:'Hij ziet dat ze gespannen is en wil haar niet onder druk zetten. Met het grapje over appeltaart laat hij merken dat hij er gewoon voor haar is.', r:3 }
    ],
    samenvat:[
      { t:'open', v:'Vat het verhaal samen in hoogstens 40 woorden.', max:40, m:'Amira doet auditie voor het conservatorium. Haar vader wacht zenuwachtig op de gang. Ze maakt een fout, maar speelt door en vertelt eerlijk over haar oma. Na afloop vindt ze rust, ook al weet ze de uitslag nog niet.' }
    ],
    alinea:[
      { t:'keuze', v:'Wat doet alinea 2 in het verhaal?', o:['Hij laat zien hoe de vader zich voelt en hoe hij Amira steunt.', 'Hij vertelt wat er in de zaal met de jury gebeurt.', 'Hij legt uit hoe een auditie op een conservatorium werkt.'] },
      { t:'keuze', v:'Wat is de functie van de laatste zin van het verhaal: "Voor het eerst vond ze dat niet erg."?', o:['Hij laat zien dat Amira aan het eind rust heeft gevonden.', 'Hij verklapt dat Amira is aangenomen.', 'Hij laat zien dat Amira niet meer wil spelen.'],
        u:'Aan het begin wreef ze haar handen en probeerde ze niet te luisteren. Nu kan ze rustig wachten. Of ze is aangenomen, weet ze nog niet.' }
    ]
  }
});

LEESBANK.T({
  id:'globaal-verveling', niv:'3F', strat:'globaal', titel:'Pleidooi voor de lege middag', vorm:'artikel', tijd:180,
  bron:'Column in een tijdschrift voor jongeren',
  alineas:[
    'Toen ik twaalf was, bestond een zondagmiddag voor de helft uit niets. Er was niets op tv, mijn vrienden waren bij hun opa en oma, en het regende. Ik lag op mijn bed en staarde naar een vochtplek op het plafond die, als je lang genoeg keek, op een olifant leek. Ik verveelde me kapot. Ik denk dat het de nuttigste middagen van mijn jeugd waren.',
    'Dat klinkt als iets wat oude mensen nu eenmaal zeggen, ik weet het. Toch zit er meer achter. Wie zich verveelt, krijgt geen kant-en-klaar vermaak aangeboden en moet dus zelf iets verzinnen. Op die regenachtige middagen bouwde ik een knikkerbaan van wc-rolletjes, tekende ik een strip over een olifant op een plafond en leerde ik, nogal slecht, jongleren. Niemand had me dat opgedragen. Het kwam voort uit het gat in de middag.',
    'Ook onderzoekers zijn in verveling geïnteresseerd geraakt. Er zijn proeven gedaan waarin mensen eerst een saaie klus moesten uitvoeren, zoals een lijst telefoonnummers overschrijven. Daarna kregen ze een opdracht waarbij ze zoveel mogelijk toepassingen moesten bedenken voor een gewoon voorwerp. De verveelde groep kwam gemiddeld met meer en creatievere ideeën dan een groep die de saaie klus had overgeslagen. Eén proef bewijst natuurlijk niet alles, maar het past in een beeld: een hoofd dat even niets hoeft, gaat vanzelf rondzwerven.',
    'Het probleem is dat dat gat in de middag nauwelijks nog bestaat. Zodra er drie seconden niets gebeurt, in de rij bij de kassa of bij de bushalte, verschijnt er een scherm. Filmpjes, berichtjes, spelletjes: er is altijd iets dat de leegte opvult voordat die de kans krijgt om ongemakkelijk te worden. Daardoor vervelen we ons zelden lang genoeg om op een idee te komen.',
    'Ik pleit dus niet voor het weggooien van telefoons. Ik pleit voor een klein beetje leegte, met opzet. Een busrit zonder oordopjes. Een middag zonder plan. Een kwartier op je bed, met je ogen op het plafond. Het voelt in het begin als zonde van je tijd, en dat is precies de bedoeling.',
    'Ik moet wel eerlijk bekennen dat ik tijdens het schrijven van deze column vier keer mijn telefoon heb gepakt. Er was niets bijzonders. Mijn plafond is tegenwoordig smetteloos wit; ik heb er gisteren tien minuten naar gekeken, voor het onderzoek. Er gebeurde niets. Ik geef het nog een week.'
  ],
  taken:{
    globaal:[
      { t:'koppel', v:'Lees de column snel door. Welk kopje hoort bij welke alinea? Eén kopje blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 3', 'Alinea 4', 'Alinea 5', 'Alinea 6'],
        rechts:['Een regenachtige zondag', 'Zelf iets verzinnen', 'Wat proeven laten zien', 'Altijd een scherm', 'Een beetje leegte, met opzet', 'Een eerlijke bekentenis'], extra:['Hoe je een knikkerbaan bouwt'],
        u:'De knikkerbaan is alleen een voorbeeld in alinea 2. Hoe je hem bouwt, staat er niet.' },
      { t:'open', v:'Waar gaat de column over? Schrijf het op in één zin.', b:'De column gaat over', m:'verveling, en waarom het goed is om je af en toe te vervelen in plaats van meteen een scherm te pakken.', r:2 },
      { t:'keuze', v:'Welke zin past het best bij de hele column?', o:['Je af en toe vervelen is nuttig, maar schermen geven daar steeds minder kans voor.', 'Telefoons zijn slecht voor jongeren en moeten daarom uit het dagelijks leven verdwijnen.', 'Onderzoekers hebben bewezen dat mensen die zich vervelen altijd slimmer zijn.'],
        u:'In alinea 5 zegt de schrijver juist dat hij niet pleit voor het weggooien van telefoons. En hij schrijft zelf dat één proef niet alles bewijst.' },
      { t:'keuze', v:'In welke alinea lees je wat de schrijver de lezer aanraadt?', o:['alinea 5', 'alinea 4', 'alinea 2', 'alinea 6'] }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van de column?', o:['het nut van verveling', 'de nadelen van telefoons', 'creativiteit bij kinderen'],
        u:'Telefoons komen pas in alinea 4 en 5 aan bod, en dan nog als iets wat de verveling in de weg zit.' }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 3: "Eén proef bewijst natuurlijk niet alles, **maar** het past in een beeld." Wat doet de schrijver met dit maar?', o:['Hij geeft toe dat het bewijs beperkt is, en houdt toch vast aan zijn punt.', 'Hij laat zien dat de proef eigenlijk niet klopt.', 'Hij noemt een tweede proef met dezelfde uitkomst.'],
        u:'Vóór het woord maar geeft hij iets toe, erna komt zijn eigen punt terug. Zo\'n tegenstelling heet ook wel een toegeving.' },
      { t:'keuze', v:'Alinea 5: "Ik pleit **dus** niet voor het weggooien van telefoons." Welk verband geeft dus?', o:['conclusie', 'tegenstelling', 'voorbeeld'],
        u:'Na alles wat hij heeft uitgelegd, trekt hij hier zijn conclusie: wat wil hij wel en niet.' }
    ],
    tussen:[
      { t:'keuze', v:'Alinea 2: "Dat klinkt als iets wat oude mensen nu eenmaal zeggen, ik weet het." Waarom schrijft de schrijver dit?', o:['Hij verwacht dat jonge lezers hem ouderwets vinden en wil dat voor zijn.', 'Hij vindt zelf dat oude mensen bijna altijd gelijk hebben.', 'Hij wil de lezer laten weten hoe oud hij precies is.'],
        u:'Hij noemt het bezwaar zelf, voordat de lezer het kan bedenken. Daarna volgt meteen "Toch zit er meer achter".' },
      { t:'open', v:'Alinea 6: de schrijver pakte vier keer zijn telefoon en keek tien minuten naar zijn plafond "voor het onderzoek". Wat laat hij hiermee over zichzelf merken?', m:'Dat hij het zelf ook moeilijk vindt om zich te vervelen. Hij lacht om zichzelf, maar blijft het proberen.', r:2 }
    ],
    samenvat:[
      { t:'open', v:'Vat de column samen in hoogstens 40 woorden.', max:40, m:'Verveling is nuttig, want wie zich verveelt, moet zelf iets bedenken; proeven wijzen ook in die richting. Door schermen vervelen we ons bijna nooit meer. De schrijver raadt aan om bewust wat leegte in te plannen.' }
    ]
  }
});

/* ---------- zoekend lezen: negen teksten, drie per niveau ---------- */

/* ===== 1F ===== */

LEESBANK.T({
  id:'zoekend-bioscoop', niv:'1F', strat:'zoekend', titel:'Bioscoop Het Doek: deze week', vorm:'rooster', bron:'Weekprogramma van Bioscoop Het Doek',
  blokken:[
    { kop:'Films deze week', tabel:[['film', 'voor wie', 'duur', 'wanneer'],
      ['De Robotkat', 'vanaf 6 jaar', '85 minuten', 'woensdag, zaterdag en zondag om 14.00'],
      ['Storm op Zee', 'vanaf 12 jaar', '110 minuten', 'elke dag om 19.30'],
      ['Het Geheim van Lisa', 'vanaf 9 jaar', '95 minuten', 'zaterdag en zondag om 16.30'],
      ['Laatste Ronde', 'vanaf 16 jaar', '125 minuten', 'vrijdag en zaterdag om 21.45']] },
    { kop:'Kaartjes en snacks', lijst:[['Kind tot 12 jaar', '7,50'], ['Vanaf 12 jaar', '10,50'], ['Woensdag: alle films', '6,00'],
      ['Popcorn klein', '3,00'], ['Popcorn groot', '4,50'], ['Flesje water', '2,00']] },
    { kop:'Goed om te weten', tekst:'Wil je zeker een plek? Dan kun je een stoel __reserveren__. Bel ons een dag van tevoren. Wij houden dan een stoel voor je vrij tot tien minuten voor de film begint. De zaal gaat een kwartier voor de film open. Eten en drinken van buiten mag je niet meenemen. Op zondag kun je na De Robotkat gratis meedoen aan een knutselmiddag.' }
  ],
  taken:{
    zoekend:[
      { t:'zoek', v:'Start je stopwatch. Beantwoord de vragen zo snel als je kunt.', vragen:[
        { v:'Hoe laat draait De Robotkat?', s:'De Robotkat', a:['om 14.00 uur', '14.00', '14:00', '14.00 uur', 'om twee uur'] },
        { v:'Hoe lang duurt Storm op Zee?', s:'Storm op Zee', a:['110 minuten', '110', '110 min', '1 uur en 50 minuten'] },
        { v:'Wat kost een grote popcorn?', s:'Popcorn groot', a:['4,50 euro', '4,50', '€4,50', '4.50'] },
        { v:'Je broer is 14. Mag hij naar Laatste Ronde?', s:'Laatste Ronde', a:['nee', 'nee, pas vanaf 16 jaar', 'nee, vanaf 16'] },
        { v:'Wat kost een kaartje op woensdag?', s:'Woensdag', a:['6 euro', '6,00', '€6', '6'] },
        { v:'Hoe lang voor de film gaat de zaal open?', s:'zaal', a:['een kwartier', '15 minuten', 'kwartier', '15 min'] }
      ] },
      { t:'keuze', v:'Je wilt weten of je een eigen zak chips mee mag nemen. Welk sleutelwoord zoek je?', o:['eten', 'popcorn', 'woensdag'],
        u:'Chips is eten. Bij "Eten en drinken van buiten" staat het antwoord. Popcorn staat bij de prijzen, maar daar staat niets over eigen eten.' },
      { t:'raster', v:'In welk blok zoek je het antwoord?', kol:['Films deze week', 'Kaartjes en snacks', 'Goed om te weten'], rijen:[
        { z:'Wanneer draait Het Geheim van Lisa?', g:0 },
        { z:'Wat kost een kaartje voor je moeder?', g:1 },
        { z:'Hoe krijg je zeker een plek?', g:2 },
        { z:'Vanaf welke leeftijd mag je naar Storm op Zee?', g:0 },
        { z:'Mag je je eigen flesje drinken mee?', g:2 }
      ] }
    ],
    doel:[
      { t:'keuze', v:'Wat voor tekst is dit?', o:['een weekprogramma met tijden en prijzen', 'een verhaal over een spannende film', 'een recensie die zegt of een film goed is'],
        u:'Je ziet een tabel met tijden en een lijst met prijzen. Er staat geen verhaal en geen mening in.' },
      { t:'keuze', v:'Wat wil de bioscoop vooral met deze tekst?', o:['je laten weten welke films er draaien en wanneer', 'je laten lachen om grappige films', 'je uitleggen hoe je zelf een film maakt'] }
    ],
    woord:[
      { t:'keuze', v:'Goed om te weten: "Dan kun je een stoel __reserveren__." Wat betekent reserveren?', o:['van tevoren een plek laten vasthouden', 'achteraf je geld terugvragen', 'een kaartje aan de kassa kopen'],
        u:'De zinnen erna helpen: je belt een dag van tevoren en de bioscoop houdt een stoel voor je vrij.' }
    ]
  }
});

LEESBANK.T({
  id:'zoekend-bus', niv:'1F', strat:'zoekend', titel:'Buslijn 14 naar school', vorm:'rooster', bron:'Dienstregeling van Busbedrijf Oost, geldig vanaf 1 september',
  blokken:[
    { kop:'Maandag tot en met vrijdag', tabel:[['halte', 'rit 1', 'rit 2', 'rit 3', 'rit 4'],
      ['Station Zuid', '7.32', '7.47', '8.02', '8.17'],
      ['Marktplein', '7.36', '7.51', '8.06', '8.21'],
      ['Ziekenhuis', '7.41', '7.56', '8.11', '8.26'],
      ['Kerkstraat', '7.44', '7.59', '8.14', '8.29'],
      ['Sportpark', '7.49', '8.04', '8.19', '8.34'],
      ['De Brug (school)', '7.52', '8.07', '8.22', '8.37']] },
    { kop:'Kaartjes', lijst:[['Losse rit, tot 12 jaar', '1,20'], ['Losse rit, vanaf 12 jaar', '2,40'], ['Dagkaart', '6,50'], ['Scholierenpas per maand', '29,00']] },
    { kop:'Let op', tekst:'In de schoolvakanties rijdt lijn 14 maar één keer per uur. Op zaterdag en zondag rijdt de bus niet naar De Brug. Door werk aan de weg is de halte Kerkstraat van 4 tot en met 15 november __vervallen__. De bus stopt in die dagen niet bij die halte. Stap in plaats daarvan in bij de halte Sportpark, vijf minuten lopen verder. Fietsen mogen niet mee in de bus. Een step die je kunt opvouwen mag wel mee.' }
  ],
  taken:{
    zoekend:[
      { t:'zoek', v:'Start je stopwatch. Beantwoord de vragen zo snel als je kunt.', vragen:[
        { v:'Hoe laat vertrekt rit 1 bij Station Zuid?', s:'Station Zuid', a:['7.32 uur', '7.32', '7:32', 'om 7.32'] },
        { v:'De school begint om 8.30 uur. Je stapt in bij Marktplein. Hoe laat gaat de laatste bus waarmee je nog op tijd bent?', s:'Marktplein', a:['8.06 uur', '8.06', '8:06', 'om 8.06', 'rit 3 om 8.06'] },
        { v:'Wat kost een scholierenpas per maand?', s:'Scholierenpas', a:['29 euro', '29,00', '€29', '29'] },
        { v:'Mag je fiets mee in de bus?', s:'Fietsen', a:['nee', 'nee, dat mag niet'] },
        { v:'Hoe vaak rijdt de bus in de schoolvakantie?', s:'schoolvakanties', a:['één keer per uur', 'een keer per uur', '1 keer per uur', 'elk uur'] },
        { v:'Je stapt normaal in bij de Kerkstraat. Waar stap je op 10 november in?', s:'Kerkstraat', a:['bij de halte Sportpark', 'Sportpark', 'halte Sportpark'] }
      ] },
      { t:'keuze', v:'Je wilt weten of de bus ook in het weekend naar school rijdt. Welk sleutelwoord zoek je?', o:['zaterdag', 'schoolvakanties', 'dagkaart'],
        u:'Het weekend is zaterdag en zondag. Bij dat woord staat het antwoord.' },
      { t:'keuze', v:'Je stapt om 7.51 uur in bij Marktplein. Hoe laat ben je bij De Brug?', o:['8.07 uur', '7.52 uur', '8.04 uur'],
        u:'Zoek 7.51 in de rij van Marktplein. Dat is rit 2. Ga in die kolom omlaag naar De Brug.' }
    ],
    doel:[
      { t:'keuze', v:'Wat voor tekst is dit?', o:['een dienstregeling', 'een reclame voor de bus', 'een nieuwsbericht over werk aan de weg'],
        u:'Een dienstregeling laat zien hoe laat een bus of trein bij elke halte is.' },
      { t:'keuze', v:'Waarom staat het blok Let op erbij?', o:['om je te waarschuwen voor dingen die anders gaan dan normaal', 'om je over te halen een scholierenpas te kopen', 'om te vertellen hoe een bus gemaakt wordt'] }
    ],
    woord:[
      { t:'keuze', v:'Let op: "is de halte Kerkstraat van 4 tot en met 15 november __vervallen__." Wat betekent vervallen hier?', o:['De halte wordt dan niet gebruikt.', 'De halte is dan nieuw gebouwd.', 'De bus komt daar dan later langs.'],
        u:'De zin erna zegt het: de bus stopt in die dagen niet bij die halte.' }
    ]
  }
});

LEESBANK.T({
  id:'zoekend-dierenpark', niv:'1F', strat:'zoekend', titel:'Dierenpark De Wilde Hoeve', vorm:'folder', bron:'Folder van het dierenpark',
  blokken:[
    { kop:'Openingstijden', lijst:[['april tot en met oktober', '9.30-18.00'], ['november tot en met maart', '10.00-16.30'], ['eerste kerstdag', 'gesloten']] },
    { kop:'Voedertijden', tabel:[['dier', 'tijd', 'waar'], ['pinguïns', '11.00 en 15.00', 'Pinguïnrots'], ['zeehonden', '11.30', 'Zeehondenbad'],
      ['otters', '13.30', 'Otterbeek'], ['stokstaartjes', '14.00', 'Zandvlakte'], ['lemuren', '15.30', 'Apeneiland']] },
    { kop:'Prijzen', lijst:[['Kind tot 3 jaar', 'gratis'], ['Kind 3 tot en met 11 jaar', '14,50'], ['Vanaf 12 jaar', '18,50'], ['Jaarkaart', '45,00']] },
    { kop:'Eten en drinken', tekst:'In restaurant De Kudde kun je pannenkoeken en friet eten. Bij de Otterbeek staat een kraam met ijs. Je mag ook je eigen eten meenemen. Picknicken kan op het grote grasveld bij de speeltuin.' },
    { kop:'Huisregels', tekst:'Elk dier heeft een eigen __verblijf__. Daar slaapt, eet en speelt het. Klim nooit over het hek van een verblijf. Geef de dieren nooit zelf eten. Ze kunnen daar ziek van worden. Honden mogen niet mee in het park.' }
  ],
  taken:{
    zoekend:[
      { t:'zoek', v:'Start je stopwatch. Beantwoord de vragen zo snel als je kunt.', vragen:[
        { v:'Hoe laat krijgen de otters eten?', s:'otters', a:['om 13.30 uur', '13.30', '13:30', 'half twee'] },
        { v:'Wat kost een kaartje voor je broertje van 2?', s:'tot 3 jaar', a:['niets', 'gratis', '0 euro', 'nul euro'] },
        { v:'Hoe laat gaat het park in december dicht?', s:'november', a:['16.30 uur', '16.30', '16:30', 'half vijf'] },
        { v:'Mag je hond mee in het park?', s:'Honden', a:['nee', 'nee, dat mag niet'] },
        { v:'Waar kun je een ijsje kopen?', s:'kraam', a:['bij de Otterbeek', 'Otterbeek', 'bij de kraam bij de Otterbeek'] },
        { v:'Hoe vaak per dag krijgen de pinguïns eten?', s:'pinguïns', a:['twee keer', '2 keer', 'twee keer per dag', 'om 11.00 en 15.00'] }
      ] },
      { t:'keuze', v:'Je wilt weten waar je je eigen boterhammen kunt opeten. Welk sleutelwoord zoek je?', o:['picknicken', 'restaurant', 'voedertijden'],
        u:'Picknicken is buiten je eigen eten opeten. In het restaurant koop je eten, en de voedertijden gaan over de dieren.' },
      { t:'koppel', v:'In welk blok zoek je? Eén blok blijft over.', links:['Wanneer gaan de zeehonden eten?', 'Wat kost een jaarkaart?', 'Mag je de dieren een stukje brood geven?', 'Is het park open op eerste kerstdag?'],
        rechts:['Voedertijden', 'Prijzen', 'Huisregels', 'Openingstijden'], extra:['Eten en drinken'],
        u:'Brood geven aan dieren lijkt bij Eten en drinken te horen. Maar dat blok gaat over jouw eten. De regel over de dieren staat bij Huisregels.' }
    ],
    doel:[
      { t:'keuze', v:'Wat wil het dierenpark vooral met deze folder?', o:['je laten weten wat je nodig hebt voor je bezoek', 'je leren hoe je zelf een dier verzorgt', 'je een spannend verhaal over dieren vertellen'] },
      { t:'keuze', v:'Welk blok vertelt vooral wat je moet doen of laten?', o:['Huisregels', 'Prijzen', 'Voedertijden'],
        u:'In de huisregels staan zinnen als "Klim nooit" en "Geef de dieren nooit zelf eten". Dat zijn regels.' }
    ],
    woord:[
      { t:'keuze', v:'Huisregels: "Elk dier heeft een eigen __verblijf__." Wat is een verblijf?', o:['de plek waar een dier woont', 'het eten dat een dier krijgt', 'de verzorger van een dier'],
        u:'De zin erna helpt: daar slaapt, eet en speelt het dier. En er staat een hek omheen.' }
    ]
  }
});

/* ===== 2F ===== */

LEESBANK.T({
  id:'zoekend-festival', niv:'2F', strat:'zoekend', titel:'Festival Zomerpier', vorm:'folder', bron:'Folder van Festival Zomerpier',
  blokken:[
    { kop:'Welkom', tekst:"Zin in twee dagen zon, zee en muziek? Op 3 en 4 juli is Zomerpier terug op het strand van Zeewijk, groter en beter dan ooit. Drie podia, de beste dj's van de kust en voor het eerst een eigen podium voor jong talent. Wacht niet te lang: vorig jaar was het festival binnen een week uitverkocht!" },
    { kop:'Programma zaterdag 3 juli', tabel:[['tijd', 'Strandpodium', 'Duintent', 'Talentstage'],
      ['14.00-15.00', 'Koorproject Zeewijk', 'DJ Noor', 'Band De Ankers'],
      ['15.30-16.30', 'Lucas Mendes', 'Zuidwester', 'Fenna Bakker'],
      ['17.00-18.30', 'The Tide', 'DJ Kofi', 'Rapklas Zeewijk'],
      ['19.30-21.00', 'Meral', 'Golfslag', ''],
      ['21.30-23.00', 'Ravi en De Zeelui', 'DJ Noor', '']] },
    { kop:'Tickets', lijst:[['Dagticket zaterdag', '39,50'], ['Dagticket zondag', '34,50'], ['Weekendticket', '65,00'], ['Kinderen tot en met 11 jaar', 'gratis, met een volwassene'], ['Kluisje voor een dag', '7,50']] },
    { kop:'Eten en drinken', tekst:'Op het festival betaal je niet met contant geld of je pinpas, maar met __consumptiemunten__. Die koop je bij de muntkraam bij de ingang. Eén munt kost 3 euro. Een flesje water is één munt, een portie friet twee munten. Munten die je overhoudt, krijg je niet terug, dus koop er niet te veel. Er zijn kramen met vegetarisch en halal eten. Een lege fles van huis mag je meenemen en gratis vullen bij de watertappunten.' },
    { kop:'Huisregels', tekst:'Ben je 16 jaar of ouder, dan mag je alleen komen. Ben je jonger, dan kom je met iemand van 18 jaar of ouder. Neem een geldig identiteitsbewijs mee, want er wordt gecontroleerd. Glas, eigen eten en tassen groter dan een A4 mogen niet mee naar binnen. De muziek is hard: gratis oordopjes haal je bij de infostand. Na 22.30 uur kun je niet meer naar binnen.' },
    { kop:'Bereikbaarheid', tekst:'Er rijdt elke tien minuten een gratis pendelbus van station Zeewijk naar het festival. De laatste bus terug vertrekt om 23.45 uur. Fietsen kun je gratis stallen bij ingang Noord.' }
  ],
  taken:{
    zoekend:[
      { t:'zoek', v:'Start je stopwatch. Beantwoord de vragen zo snel als je kunt.', vragen:[
        { v:'Op welk podium speelt Fenna Bakker?', s:'Fenna Bakker', a:['op de Talentstage', 'Talentstage', 'de Talentstage'] },
        { v:'Hoe laat begint DJ Noor voor de tweede keer?', s:'DJ Noor', a:['om 21.30 uur', '21.30', '21:30', '21.30-23.00', 'van 21.30 tot 23.00'] },
        { v:'Hoeveel euro betaal je voor een portie friet?', s:'friet', a:['6 euro', '6', '€6', '6,00', 'twee munten van 3 euro'] },
        { v:'Je bent 15. Mag je zonder volwassene naar het festival?', s:'16 jaar', a:['nee', 'nee, alleen met iemand van 18 of ouder', 'nee, met een volwassene'] },
        { v:'Hoe laat gaat de laatste pendelbus naar het station?', s:'pendelbus', a:['om 23.45 uur', '23.45', '23:45', 'kwart voor twaalf'] },
        { v:'Je hebt aan het eind nog twee munten. Krijg je je geld terug?', s:'overhoudt', a:['nee'] },
        { v:'Wat kost een weekendticket?', s:'Weekendticket', a:['65 euro', '65,00', '€65', '65'] }
      ], u:'Bij de friet moet je twee dingen combineren: de friet kost twee munten, en één munt kost 3 euro.' },
      { t:'keuze', v:'Je wilt weten hoe je je oren kunt beschermen tegen de harde muziek. Welk sleutelwoord zoek je?', o:['oordopjes', 'Strandpodium', 'kluisje'],
        u:'Met oordopjes bescherm je je oren. Het woord staat bij de huisregels.' },
      { t:'raster', v:'Zoek het op. Klopt het, klopt het niet, of staat het er niet?', kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[
        { z:'Oordopjes kosten 1 euro.', g:1 },
        { z:'Om 23.00 uur kun je nog naar binnen.', g:1 },
        { z:'Er is halal eten te koop.', g:0 },
        { z:'Bij de ingang is een EHBO-post.', g:2 },
        { z:'Een kluisje kost 7,50 euro per dag.', g:0 },
        { z:'Je mag je hond meenemen.', g:2 }
      ], u:'Oordopjes zijn gratis, en na 22.30 uur kun je niet meer naar binnen. Over EHBO en honden zegt de folder niets.' }
    ],
    doel:[
      { t:'raster', v:'Wat wil de maker met elk blok vooral?', kol:['informeren', 'overtuigen', 'instrueren'], rijen:[
        { z:'Welkom', g:1 }, { z:'Programma zaterdag 3 juli', g:0 }, { z:'Huisregels', g:2 }
      ], u:'Welkom wil je enthousiast maken ("groter en beter dan ooit", "Wacht niet te lang"). Het programma geeft alleen tijden en namen. De huisregels zeggen wat je moet doen en wat niet mag.' },
      { t:'keuze', v:'Welke zin wil je overhalen om snel een kaartje te kopen?', o:['Wacht niet te lang: vorig jaar was het festival binnen een week uitverkocht!', 'Na 22.30 uur kun je niet meer naar binnen.', 'Er rijdt elke tien minuten een gratis pendelbus van station Zeewijk naar het festival.'] }
    ],
    woord:[
      { t:'keuze', v:'Eten en drinken: "maar met __consumptiemunten__." Wat zijn consumptiemunten?', o:['munten waarmee je op het festival eten en drinken betaalt', 'munten die je wint als je meedoet aan een spel', 'munten waarmee je een kluisje openmaakt'],
        u:'De zinnen erna noemen wat je met de munten koopt: water en friet. Consumptie betekent iets wat je eet of drinkt.' }
    ]
  }
});

LEESBANK.T({
  id:'zoekend-camping', niv:'2F', strat:'zoekend', titel:'Camping De Vlinderwei: zo doen we het hier', vorm:'folder', bron:'Huisregels van Camping De Vlinderwei',
  blokken:[
    { kop:'Receptie en winkel', tabel:[['', 'receptie', 'winkel'],
      ['maandag tot en met vrijdag', '9.00-12.00 en 14.00-18.00', '8.00-10.00 en 16.00-19.00'],
      ['zaterdag', '9.00-19.00', '8.00-19.00'],
      ['zondag', '10.00-12.00', '8.00-11.00']] },
    { kop:'Prijzen per nacht', lijst:[['Plek voor een tent', '18,00'], ['Plek met stroom', '24,50'], ['Per persoon vanaf 4 jaar', '5,50'], ['Hond', '3,00'], ['Douchemuntje', '0,50']] },
    { kop:'Rust op de camping', tekst:"Tussen 23.00 en 7.30 uur is het stil op de camping. Muziek gaat dan uit, ook als die zacht staat. Auto's mogen in die tijd niet over het terrein: parkeer dan op de parkeerplaats bij de slagboom. Overdag rijd je stapvoets, want er spelen overal kinderen." },
    { kop:'Douchen en afwassen', tekst:"In het __sanitairgebouw__ bij veld B vind je douches, wc's en wasbakken voor de afwas. Een douchemuntje geeft je zes minuten warm water. Muntjes koop je bij de receptie. Tussen 10.00 en 11.00 uur wordt het gebouw schoongemaakt. Gebruik dan het kleine gebouw bij de speeltuin." },
    { kop:'Huisdieren', tekst:'Honden zijn welkom op veld A en veld C, niet op veld B. Houd je hond altijd aan de lijn. Op het strandje bij de vijver mogen geen honden komen.' },
    { kop:'Kampvuur en barbecue', tekst:'Een barbecue mag, als hij op pootjes staat, minstens een halve meter boven het gras. Een eigen kampvuur mag niet. Op vrijdagavond om 20.00 uur maakt de beheerder een groot kampvuur bij de vijver. Iedereen is welkom en marshmallows krijg je gratis. Is het lang droog geweest, dan gaat het kampvuur niet door.' },
    { kop:'Vertrek', tekst:'Op de dag van vertrek ben je om 11.00 uur van je plek af. Lever het pasje van de slagboom in bij de receptie. Ben je het pasje kwijt, dan betaal je 15 euro.' }
  ],
  taken:{
    zoekend:[
      { t:'zoek', v:'Start je stopwatch. Beantwoord de vragen zo snel als je kunt.', vragen:[
        { v:'Hoe laat is de winkel op zondag open?', s:'zondag', a:['van 8.00 tot 11.00 uur', '8.00-11.00', '8 tot 11', '8:00-11:00', 'van 8 tot 11 uur'] },
        { v:'Wat kost een plek met stroom per nacht, zonder de personen?', s:'stroom', a:['24,50 euro', '24,50', '€24,50', '24.50'] },
        { v:'Mag je hond mee naar veld B?', s:'veld B', a:['nee', 'nee, alleen op veld A en C'] },
        { v:'Hoe lang warm water krijg je voor één douchemuntje?', s:'warm water', a:['zes minuten', '6 minuten', '6 min', 'zes'] },
        { v:'Hoe laat moet je op de dag van vertrek van je plek af zijn?', s:'vertrek', a:['om 11.00 uur', '11.00', '11 uur', '11:00'] },
        { v:'Op welke avond is er een kampvuur?', s:'kampvuur', a:['op vrijdagavond', 'vrijdagavond', 'vrijdag', 'vrijdagavond om 20.00 uur'] },
        { v:'Je wilt om 10.30 uur douchen. Naar welk gebouw ga je?', s:'schoongemaakt', a:['het kleine gebouw bij de speeltuin', 'bij de speeltuin', 'het gebouw bij de speeltuin'] }
      ], u:'Bij de laatste vraag zoek je eerst de schoonmaaktijd op. 10.30 uur valt tussen 10.00 en 11.00 uur, dus het grote gebouw is dan dicht.' },
      { t:'keuze', v:'Je vader wil vanavond worstjes grillen bij de tent. Welk sleutelwoord zoek je?', o:['barbecue', 'kampvuur', 'winkel'],
        u:'Op een barbecue grill je. Het kampvuur is van de beheerder, en een eigen kampvuur mag niet.' },
      { t:'koppel', v:'In welk blok zoek je het antwoord? Eén blok blijft over.', links:['Je wilt op zaterdagochtend brood kopen.', 'Je wilt weten wat het kost als je hond meegaat.', 'Je wilt om middernacht nog muziek luisteren.', 'Je bent het pasje van de slagboom kwijt.'],
        rechts:['Receptie en winkel', 'Prijzen per nacht', 'Rust op de camping', 'Vertrek'], extra:['Huisdieren'],
        u:'Bij Huisdieren staan regels, maar geen prijs. Wat een hond kost, staat bij de prijzen.' }
    ],
    doel:[
      { t:'keuze', v:'Wat is het doel van deze tekst vooral?', o:['instrueren: vertellen wat je op de camping moet doen en laten', 'overtuigen: je overhalen om op deze camping te boeken', 'amuseren: grappige verhalen over kamperen vertellen'],
        u:'Je staat al op de camping als je dit leest. De tekst heet huisregels en zegt steeds wat mag en wat niet mag.' },
      { t:'keuze', v:'Welke zin uit de tekst is een regel?', o:['Houd je hond altijd aan de lijn.', 'Iedereen is welkom en marshmallows krijg je gratis.', 'Een douchemuntje geeft je zes minuten warm water.'],
        u:'Een regel zegt wat je moet doen of laten. De andere zinnen geven informatie.' }
    ],
    woord:[
      { t:'keuze', v:'Douchen en afwassen: "In het __sanitairgebouw__ bij veld B". Wat is een sanitairgebouw?', o:["een gebouw met douches, wc's en wasbakken", 'een gebouw waar je spullen kunt kopen', 'een gebouw waar de beheerder woont'],
        u:"Achter het woord staat wat je erin vindt: douches, wc's en wasbakken." }
    ]
  }
});

LEESBANK.T({
  id:'zoekend-klimhal', niv:'2F', strat:'zoekend', titel:'Boulderhal De Greep', vorm:'website', bron:'Website van Boulderhal De Greep in Zwolle',
  blokken:[
    { kop:'Wat is boulderen?', tekst:'Boulderen is klimmen zonder touw, op muren van hoogstens 4,5 meter. Onder de muren ligt een dikke mat die je val opvangt. Elke route heeft een kleur: geel is het makkelijkst, zwart het moeilijkst. Je hebt alleen klimschoenen nodig en een beetje magnesium, zodat je handen niet glad worden.' },
    { kop:'Openingstijden', tabel:[['dag', 'open', 'jeugduur (8 tot 16 jaar)'],
      ['maandag', '16.00-23.00', 'geen'],
      ['dinsdag', '10.00-23.00', '16.00-17.30'],
      ['woensdag', '10.00-23.00', '13.30-15.30'],
      ['donderdag', '10.00-23.00', '16.00-17.30'],
      ['vrijdag', '10.00-22.00', 'geen'],
      ['zaterdag en zondag', '9.00-20.00', '9.00-11.00']] },
    { kop:'Prijzen', tabel:[['', 'tot 18 jaar', 'vanaf 18 jaar'], ['losse entree', '9,50', '13,50'], ['tienrittenkaart', '85,00', '120,00'],
      ['klimschoenen huren', '3,50', '3,50'], ['introductieles van een uur', '15,00', '19,50']] },
    { kop:'Je eerste keer', tekst:'Ben je hier voor het eerst? Dan krijg je eerst tien minuten uitleg over veilig vallen. Die uitleg is gratis. Begin daarna op de gele routes. Klim je te lang achter elkaar, dan kunnen je vingers en schouders het niet meer aan. Een __blessure__ aan je vingers duurt vaak weken voordat je weer pijnvrij kunt klimmen. Neem dus op tijd pauze.' },
    { kop:'Huisregels', lijst:[['Onder de muur', 'Loop of zit nooit onder iemand die klimt.'], ['Kinderen', 'Onder de 14 jaar alleen met een volwassene die meekijkt.'],
      ['Schoenen', 'Alleen klimschoenen op de muur, geen sportschoenen.'], ['Eten', 'Eten en drinken alleen in de kantine.']] },
    { kop:'Bereikbaarheid', tekst:'Je vindt ons op vijf minuten lopen van het station. Kom je op de fiets, dan zet je die in de overdekte fietsenstalling. Parkeren kost 2 euro per uur.' }
  ],
  taken:{
    zoekend:[
      { t:'zoek', v:'Start je stopwatch. Beantwoord de vragen zo snel als je kunt.', vragen:[
        { v:'Hoe laat begint het jeugduur op woensdag?', s:'woensdag', a:['om 13.30 uur', '13.30', '13:30', 'half twee'] },
        { v:'Je bent 14. Wat kost een losse entree voor jou?', s:'losse entree', a:['9,50 euro', '9,50', '€9,50', '9.50'] },
        { v:'Welke kleur heeft de makkelijkste route?', s:'makkelijkst', a:['geel'] },
        { v:'Hoe hoog zijn de muren hoogstens?', s:'meter', a:['4,5 meter', '4,5', '4,5 m', 'vier en een halve meter'] },
        { v:'Je bent 13 en wilt alleen gaan klimmen. Mag dat?', s:'14 jaar', a:['nee', 'nee, alleen met een volwassene'] },
        { v:'Op welke dag is de hal in de ochtend dicht?', s:'maandag', a:['maandag', 'op maandag'] },
        { v:'Jij (15) en je vader (45) betalen allebei een losse entree en huren allebei schoenen. Wat betalen jullie samen?', s:'klimschoenen huren', a:['30 euro', '30,00', '€30', '30'] }
      ], u:'Bij de laatste vraag tel je vier bedragen op: 9,50 voor jou, 13,50 voor je vader en twee keer 3,50 voor de schoenen.' },
      { t:'keuze', v:'Je wilt weten of je bij de muur een broodje mag opeten. Welk sleutelwoord zoek je?', o:['Eten', 'Prijzen', 'Schoenen'],
        u:'Een broodje is eten. In de huisregels staat bij Eten: alleen in de kantine.' },
      { t:'raster', v:'Op welk blok van de website klik je?', kol:['Openingstijden', 'Prijzen', 'Huisregels'], rijen:[
        { z:'Mag je op sportschoenen klimmen?', g:2 },
        { z:'Is er op zondag een jeugduur?', g:0 },
        { z:'Wat kost een introductieles?', g:1 },
        { z:'Mag je onder iemand door lopen die klimt?', g:2 },
        { z:'Hoe laat gaat de hal op vrijdag dicht?', g:0 }
      ] }
    ],
    doel:[
      { t:'keuze', v:'Wat wil de klimhal vooral met het blok "Wat is boulderen?"', o:['uitleggen wat boulderen is', 'je overhalen een tienrittenkaart te kopen', 'je vertellen hoe laat je kunt komen'] },
      { t:'keuze', v:'Wat voor tekst is dit?', o:['de website van een klimhal', 'een krantenartikel over klimmen', 'een verhaal over een klimmer'],
        u:'Er staan blokken met openingstijden, prijzen en huisregels. Die vind je op de website van een bedrijf.' }
    ],
    woord:[
      { t:'keuze', v:'Je eerste keer: "Een __blessure__ aan je vingers duurt vaak weken." Wat is een blessure?', o:['letsel aan je lijf door sporten', 'een fout in je klimroute', 'een prijs voor een goede klimmer'],
        u:'De zin ervoor zegt dat je vingers het niet meer aankunnen. Daarna moet je weken wachten tot je weer pijnvrij bent.' }
    ]
  }
});

/* ===== 3F ===== */

LEESBANK.T({
  id:'zoekend-jongerenfonds', niv:'3F', strat:'zoekend', titel:'Jongerenfonds Rivierstad: geld voor jouw idee', vorm:'website', bron:'Website van de gemeente Rivierstad',
  blokken:[
    { kop:'Wat is het Jongerenfonds?', tekst:'Jij hebt de ideeën, wij hebben het geld! Heb je een plan dat je wijk leuker, groener of gezelliger maakt? Met het Jongerenfonds steunt de gemeente Rivierstad __initiatieven__ van jongeren. Denk aan een voetbaltoernooi in het park, een moestuin bij school of een muziekavond in het buurthuis. Per jaar is er 60.000 euro te verdelen. Op is op: is het geld van dit jaar verdeeld, dan kun je pas volgend jaar weer aanvragen.' },
    { kop:'Wie kan aanvragen?', tekst:'Je kunt een aanvraag doen als je tussen de 14 en 23 jaar oud bent en in Rivierstad woont. Je vraagt aan met minstens twee andere jongeren: een groep van drie is het minimum. Ben je jonger dan 18, dan tekent een ouder of verzorger mee. Verenigingen en scholen kunnen zelf geen aanvraag doen. Een groep leden of leerlingen kan dat wel, als de jongeren het plan zelf bedenken en uitvoeren.' },
    { kop:'Hoeveel geld kun je krijgen?', tabel:[['soort plan', 'hoogstens', 'eigen bijdrage'],
      ['eenmalige activiteit (één dag)', '750 euro', 'geen'],
      ['project van meerdere dagen', '2.500 euro', '10 procent van de kosten'],
      ['plan dat langer dan een jaar loopt', '5.000 euro', '20 procent van de kosten']] },
    { kop:'Wat betaalt het fonds wel en niet?', lijst:[['Huur van een zaal', 'wel, tot 300 euro per dag'], ['Prijzen en cadeaus', 'hoogstens 10 procent van het toegekende bedrag'],
      ['Spullen die je daarna zelf houdt', 'nooit, tenzij ze naar het buurthuis gaan'], ['Loon voor de aanvragers zelf', 'nooit'], ['Alcohol', 'nooit']] },
    { kop:'Zo vraag je aan', tekst:'Vul het aanvraagformulier op deze website in en voeg een begroting toe: een overzicht van alle kosten en inkomsten. Dien je aanvraag uiterlijk acht weken voor de start van je activiteit in. De jongerenraad, een groep van twaalf jongeren uit de stad, leest alle aanvragen en geeft de gemeente advies. Binnen zes weken na het indienen hoor je of je plan wordt goedgekeurd.' },
    { kop:'Na afloop', tekst:"Binnen vier weken na je activiteit stuur je een kort verslag met foto's en de bonnetjes van wat je hebt uitgegeven. Heb je minder uitgegeven dan je kreeg, dan betaal je het verschil terug. Stuur je geen verslag, dan kan de gemeente het hele bedrag terugvragen. Bovendien kun je dan twee jaar lang geen nieuwe aanvraag doen." },
    { kop:'Kleine lettertjes', tekst:'Aanvragen die later dan acht weken voor de start binnenkomen, zijn __niet-ontvankelijk__. De jongerenraad legt ze opzij zonder het plan te lezen, en je krijgt een brief dat je het een volgende keer eerder moet proberen. Een uitzondering geldt voor eenmalige activiteiten tot 250 euro: die mag je tot drie weken van tevoren aanvragen. Activiteiten in juli en augustus vraag je aan vóór 1 mei, omdat de jongerenraad in de zomer niet vergadert. Per groep wordt per kalenderjaar hoogstens één aanvraag toegekend.' }
  ],
  taken:{
    zoekend:[
      { t:'zoek', v:'Start je stopwatch. Beantwoord de vragen zo snel als je kunt. Let op: soms moet je twee dingen combineren.', vragen:[
        { v:'Hoeveel geld kun je hoogstens krijgen voor een buurtfeest van één dag?', s:'eenmalige activiteit', a:['750 euro', '750', '€750', '750,00'] },
        { v:'Jij en je beste vriendin willen samen een aanvraag doen, met z\'n tweeën. Mag dat?', s:'minimum', a:['nee', 'nee, je moet met minstens drie zijn', 'nee, minimaal drie jongeren'] },
        { v:'Jullie project duurt een week en kost 2.000 euro. Hoeveel moeten jullie zelf bijdragen?', s:'eigen bijdrage', a:['200 euro', '200', '€200', '10 procent: 200 euro'] },
        { v:'Jullie houden op zaterdag 10 juli een muziekavond in het park. Wat is de laatste dag waarop je dat kunt aanvragen?', s:'juli', a:['30 april', 'vóór 1 mei', 'voor 1 mei', 'uiterlijk 30 april'] },
        { v:'Het is oktober. Over vier weken willen jullie een filmavond van 200 euro houden. Kun je nog aanvragen?', s:'uitzondering', a:['ja', 'ja, tot drie weken van tevoren', 'ja, want het is minder dan 250 euro'] },
        { v:'Jullie krijgen 750 euro voor een sportdag. Hoeveel mag je daarvan hoogstens aan prijzen uitgeven?', s:'cadeaus', a:['75 euro', '75', '€75'] },
        { v:'Je stuurt na afloop geen verslag. Hoe lang kun je dan geen nieuwe aanvraag doen?', s:'verslag', a:['twee jaar', '2 jaar'] }
      ], u:'Bij de muziekavond is de gewone regel acht weken, maar de kleine lettertjes zeggen: voor juli en augustus vóór 1 mei. Bij de filmavond geldt de uitzondering voor eenmalige activiteiten tot 250 euro.' },
      { t:'keuze', v:'Jullie kopen een partytent voor het buurtfeest en willen die daarna zelf houden. Welk sleutelwoord zoek je?', o:['spullen', 'Na afloop', 'eigen bijdrage'],
        u:'Een tent is een ding: zoek op spullen. Het blok Na afloop lijkt te passen, maar gaat alleen over het verslag en geld terugbetalen.' },
      { t:'raster', v:'Zoek het op. Klopt het, klopt het niet, of staat het er niet?', kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[
        { z:'Een school kan zelf een aanvraag doen.', g:1 },
        { z:'De jongerenraad bestaat uit twaalf jongeren.', g:0 },
        { z:'Het fonds betaalt een zaal van 400 euro per dag helemaal.', g:1 },
        { z:'Wie 17 is, heeft een handtekening van een ouder of verzorger nodig.', g:0 },
        { z:'Het fonds betaalt ook de reiskosten van de aanvragers.', g:2 },
        { z:'Je kunt een aanvraag ook per post opsturen.', g:2 }
      ], u:'Een zaal wordt betaald tot 300 euro per dag, dus niet helemaal. Over reiskosten en post zegt de website niets.' }
    ],
    doel:[
      { t:'keuze', v:'Wat is het hoofddoel van deze webpagina?', o:['uitleggen wie geld kan krijgen en hoe je het aanvraagt', 'lezers laten vinden dat jongeren meer geld moeten krijgen', 'vertellen over leuke plannen van jongeren uit de stad'],
        u:'Bijna alle blokken geven informatie en stappen: wie, hoeveel, hoe en wanneer. De voorbeelden van plannen zijn er alleen om het fonds duidelijk te maken.' },
      { t:'keuze', v:'Vergelijk het blok "Wat is het Jongerenfonds?" met "Kleine lettertjes". Welk verschil klopt?', o:['Het eerste blok wil je enthousiast maken, de kleine lettertjes leggen regels en uitzonderingen vast.', 'Het eerste blok legt regels vast, de kleine lettertjes willen je enthousiast maken.', 'Beide blokken willen je vooral vermaken met voorbeelden van plannen.'],
        u:'"Jij hebt de ideeën, wij hebben het geld!" is wervend. De kleine lettertjes noemen termijnen en uitzonderingen.' }
    ],
    woord:[
      { t:'keuze', v:'Kleine lettertjes: "zijn __niet-ontvankelijk__." Wat betekent dat?', o:['De aanvraag wordt niet bekeken, omdat hij niet aan de regels voldoet.', 'Het plan wordt afgekeurd, omdat het niet goed genoeg is.', 'De aanvraag wordt later bekeken, als de zomer voorbij is.'],
        u:'De zin erna zegt dat de jongerenraad de aanvraag opzij legt zonder het plan te lezen. Er wordt dus niet over de inhoud geoordeeld.' },
      { t:'keuze', v:'Wat is het Jongerenfonds?: "steunt de gemeente __initiatieven__ van jongeren." Wat zijn initiatieven hier?', o:['plannen die jongeren zelf bedenken en opzetten', 'clubs waar jongeren lid van kunnen worden', 'vergaderingen van de gemeente over jongeren'],
        u:'De voorbeelden erna helpen: een toernooi, een moestuin, een muziekavond. Dat zijn plannen om iets op te zetten.' }
    ]
  }
});

LEESBANK.T({
  id:'zoekend-veerboot', niv:'3F', strat:'zoekend', titel:'Met de boot naar Zandoog', vorm:'rooster', bron:'Dienstregeling van Rederij Wadlijn, winter',
  blokken:[
    { kop:'Dienstregeling winter (1 november tot en met 31 maart)', tabel:[['dag', 'vertrek Wadhaven', 'vertrek Zandoog'],
      ['maandag tot en met vrijdag', '7.15, 11.30, 16.45', '9.00, 14.15, 18.30'],
      ['zaterdag', '8.30, 13.00, 17.30', '10.15, 15.00, 19.15'],
      ['zondag en feestdagen', '10.00, 17.00', '12.00, 18.45']] },
    { kop:'De overtocht', tekst:'De overtocht met de veerboot duurt 1 uur en 25 minuten. Op maandag, woensdag en vrijdag vaart de boot van 7.15 uur als sneldienst: die is al na 50 minuten op Zandoog. Op de sneldienst mogen geen fietsen en geen auto\'s mee. De vaartijden in de tabel zijn __indicatief__. Door het getij en het weer kan een boot eerder of later vertrekken dan hier staat.' },
    { kop:'Tarieven retour', tabel:[['', 'tot en met 11 jaar', '12 tot en met 64 jaar', '65 jaar en ouder'], ['persoon', '17,40', '34,80', '29,60']] },
    { kop:'Extra', lijst:[['Fiets, retour', '18,20'], ['Hond, retour', '6,50'], ['Toeslag sneldienst, per enkele reis', '8,00'], ['Auto tot 5 meter, retour', '189,00']] },
    { kop:'Getij en weer', tekst:'Zandoog ligt in de Waddenzee, waar het water twee keer per dag stijgt en daalt. Bij heel laag water kan de boot niet door de diepe __vaargeul__ en moet hij een langere weg nemen. De overtocht duurt dan tot een half uur langer. Bij windkracht 9 of meer kunnen afvaarten uitvallen. Kijk daarom op de dag zelf op de website of in de app.' },
    { kop:'Fietsen en honden', tekst:'Een fiets moet je in de winter vooraf reserveren, want er is plaats voor 40 fietsen per boot. Een vouwfiets in een tas gaat gratis mee als bagage. Honden mogen mee, maar niet in het restaurant aan boord. Ze blijven aan de lijn op het buitendek of in de hondenruimte.' },
    { kop:'Kleine lettertjes', tekst:'Een retourticket is geldig tot en met 14 dagen na de heenreis. Kinderen tot 4 jaar reizen gratis, maar hebben wel een eigen ticket nodig. Op 25 december en 1 januari vaart alleen de boot van 10.00 uur vanaf Wadhaven en van 12.00 uur vanaf Zandoog. Wie met een auto later dan 20 minuten voor vertrek bij de terminal is, verliest zijn plek. Voetgangers kunnen tot 5 minuten voor vertrek aan boord.' }
  ],
  taken:{
    zoekend:[
      { t:'zoek', v:'Start je stopwatch. Beantwoord de vragen zo snel als je kunt. Ga uit van een gewone dag zonder storm of laag water.', vragen:[
        { v:'Hoe laat vertrekt op zaterdag de laatste boot van Zandoog?', s:'zaterdag', a:['om 19.15 uur', '19.15', '19:15'] },
        { v:'Je neemt op donderdag de boot van 7.15 uur vanaf Wadhaven. Hoe laat ben je op Zandoog?', s:'overtocht', a:['om 8.40 uur', '8.40', '8:40', 'twintig voor negen'] },
        { v:'Je neemt op woensdag de boot van 7.15 uur vanaf Wadhaven. Hoe laat ben je op Zandoog?', s:'sneldienst', a:['om 8.05 uur', '8.05', '8:05', 'vijf over acht'] },
        { v:'Je bent 16 en neemt je fiets mee. Wat kost jouw retour samen met de fiets?', s:'Fiets, retour', a:['53 euro', '53,00', '€53', '53'] },
        { v:'Je wilt op 1 januari om 17.00 uur vanaf Wadhaven naar Zandoog. Kan dat?', s:'1 januari', a:['nee', 'nee, alleen om 10.00 uur', 'nee, dan vaart alleen de boot van 10.00'] },
        { v:'Wat betaalt je broertje van 3 voor een retour?', s:'4 jaar', a:['niets', 'gratis', '0 euro', 'niets, maar hij heeft wel een eigen ticket nodig'] },
        { v:'Je gaat op 2 december heen. Tot en met welke datum kun je met je retour terug?', s:'14 dagen', a:['16 december', 'tot en met 16 december', 't/m 16 december'] }
      ], u:'Op donderdag is de boot van 7.15 uur een gewone boot (7.15 + 1.25 = 8.40). Op woensdag is het de sneldienst (7.15 + 0.50 = 8.05). Voor je broertje geldt de uitzondering in de kleine lettertjes, niet de prijs in de tabel.' },
      { t:'keuze', v:'Je wilt weten of de boot later aankomt als het eb is. Welk sleutelwoord zoek je?', o:['laag water', 'dienstregeling', 'retour'],
        u:'Eb betekent dat het water laag staat. Bij Getij en weer staat: bij heel laag water duurt de overtocht langer.' },
      { t:'raster', v:'Zoek het op. Klopt het, klopt het niet, of staat het er niet?', kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[
        { z:'Een vouwfiets in een tas kost niets extra.', g:0 },
        { z:'Je hond mag mee in het restaurant aan boord.', g:1 },
        { z:'Met de auto moet je uiterlijk 20 minuten voor vertrek bij de terminal zijn.', g:0 },
        { z:'Er is aan boord gratis wifi.', g:2 },
        { z:'Je fiets mag mee op de sneldienst.', g:1 },
        { z:'Iemand van 70 betaalt minder dan iemand van 40.', g:0 }
      ], u:'Voor de laatste rij combineer je twee kolommen: 29,60 euro voor 65 jaar en ouder, 34,80 euro voor 12 tot en met 64 jaar.' }
    ],
    doel:[
      { t:'keuze', v:'Wat voor tekst is dit vooral?', o:['een dienstregeling met praktische informatie voor reizigers', 'een reclamefolder die het eiland Zandoog aanprijst', 'een nieuwsbericht over boten die vertraging hebben'] },
      { t:'keuze', v:'Waarom staat in het blok Getij en weer de zin "Kijk daarom op de dag zelf op de website of in de app"?', o:['De rederij wil dat je de tijden nakijkt voordat je vertrekt.', 'De rederij wil je overhalen om haar app te kopen.', 'De rederij wil uitleggen hoe het getij ontstaat.'],
        u:'Het woord daarom verwijst terug: omdat boten later kunnen gaan of uitvallen, geeft de rederij je een opdracht. Dat is instrueren.' }
    ],
    woord:[
      { t:'keuze', v:'De overtocht: "De vaartijden in de tabel zijn __indicatief__." Wat betekent indicatief?', o:['bij benadering: de tijden kunnen nog veranderen', 'verplicht: de boot vertrekt altijd precies dan', 'nieuw: de tijden gelden pas vanaf volgend jaar'],
        u:'De zin erna zegt dat een boot eerder of later kan vertrekken. De tijden geven dus een idee, maar ze staan niet vast.' },
      { t:'keuze', v:'Lees het blok Getij en weer. Wat is een __vaargeul__?', o:['een strook water die diep genoeg is om door te varen', 'een haven waar de boot op hoog water wacht', 'een dijk die het eiland tegen de zee beschermt'],
        u:'Bij heel laag water kan de boot er niet door en moet hij een langere weg nemen. Het is dus een route door het water, en die is diep.' }
    ]
  }
});

LEESBANK.T({
  id:'zoekend-sporthorloge', niv:'3F', strat:'zoekend', titel:'Sporthorloge Ritme 3', vorm:'website', bron:'Productpagina van Sportwerk',
  blokken:[
    { kop:'Over de Ritme 3', tekst:'Haal meer uit elke training. De Ritme 3 meet je hartslag, je afstand en je snelheid, en houdt bij hoe goed je slaapt. In de app op je telefoon zie je al je trainingen terug in duidelijke grafieken. Of je nu je eerste vijf kilometer loopt of traint voor een marathon: de Ritme 3 maakt je sneller, slimmer en fitter.' },
    { kop:'Batterij', tabel:[['gebruik', 'gaat mee'], ['alleen als horloge', '14 dagen'], ['met hartslag de hele dag aan', '9 dagen'], ['training met gps', '16 uur'], ['training met gps en muziek', '6 uur']] },
    { kop:'Opladen', tekst:'Laad het horloge op met de magnetische kabel die erbij zit. Van leeg tot vol duurt ongeveer 2 uur. Heb je haast? Na 15 minuten laden heb je genoeg voor een training van een uur met gps. Laad het horloge nooit op als het nat is: droog eerst de contactpunten aan de achterkant af.' },
    { kop:'Water en zwemmen', tekst:'De Ritme 3 is waterdicht tot 5 ATM. Je kunt er dus mee zwemmen in het zwembad en in open water, en ermee douchen. Gebruik het horloge niet in de sauna of in een heet bad: door de hitte kan de afdichting __poreus__ worden, waarna er toch vocht naar binnen sijpelt. Ook voor duiken is het horloge niet geschikt, omdat de druk van het water dan te hoog wordt. Spoel het horloge na zwemmen in zee of in een chloorbad af met lauw kraanwater.' },
    { kop:'Hartslag en hardlopen', tekst:'Het horloge meet je hartslag met lichtjes aan de achterkant. Draag het daarom strak, ongeveer een vingerbreedte boven je polsbot. Een tatoeage op je pols, koude handen of een losse band kunnen de meting verstoren. Loop je voor het eerst hard met de Ritme 3? __Kalibreer__ het horloge dan eerst: loop een kwartier buiten met gps aan, in je gewone tempo. Daarna weet het horloge hoe lang je passen zijn, zodat het ook op de loopband je afstand goed kan schatten.' },
    { kop:'Garantie', tekst:'Op de Ritme 3 zit twee jaar garantie. Gaat er binnen die tijd iets kapot door een fout in het horloge, dan repareren of vervangen we het gratis. De garantie geldt niet bij schade door een val, door gebruik in de sauna of bij duiken, of als je het horloge zelf hebt opengemaakt. Op de band zit zes maanden garantie. Bewaar je aankoopbon: zonder bon kunnen we je niet helpen.' },
    { kop:'Prijs en accessoires', lijst:[['Ritme 3', '179,00'], ['Extra band, siliconen', '24,95'], ['Extra band, stof', '29,95'], ['Reservekabel', '19,95']] }
  ],
  taken:{
    zoekend:[
      { t:'zoek', v:'Start je stopwatch. Beantwoord de vragen zo snel als je kunt. Let op: soms moet je rekenen of twee dingen combineren.', vragen:[
        { v:'Hoe lang gaat de batterij mee als je traint met gps en muziek?', s:'muziek', a:['6 uur', 'zes uur', '6'] },
        { v:'Je batterij is leeg. Hoe lang moet je laden voor een training van een uur met gps?', s:'Opladen', a:['15 minuten', 'een kwartier', '15 min', 'kwartier'] },
        { v:'Je stoffen band scheurt na negen maanden gewoon dragen. Krijg je via de garantie een nieuwe?', s:'garantie', a:['nee', 'nee, op de band zit maar zes maanden garantie'] },
        { v:'Je koopt het horloge met een extra stoffen band. Wat betaal je samen?', s:'stof', a:['208,95 euro', '208,95', '€208,95', '208.95'] },
        { v:'Je hebt in zee gezwommen. Wat moet je daarna met het horloge doen?', s:'zee', a:['afspoelen met lauw kraanwater', 'afspoelen met lauw water', 'afspoelen', 'het horloge afspoelen'] },
        { v:'Je horloge is na een jaar kapot omdat je het in de sauna droeg. Wordt het gratis gerepareerd?', s:'sauna', a:['nee'] },
        { v:"Je start om 9.00 uur met een volle batterij een lange fietstocht met gps, zonder muziek. Tot hoe laat houdt de batterij het ongeveer vol?", s:'gps', a:["tot 1.00 uur 's nachts", '1.00', '1.00 uur', '01.00', "1 uur 's nachts", '1:00'] }
      ], u:'Bij de fietstocht tel je 16 uur op bij 9.00 uur: dat is 1.00 uur in de nacht. Bij de band en de sauna staat het antwoord in het blok Garantie, niet bij de prijzen of bij Water en zwemmen.' },
      { t:'keuze', v:'Je wilt weten hoe lang je recht hebt op een gratis reparatie als het horloge zelf een fout heeft. Welk sleutelwoord zoek je?', o:['garantie', 'accessoires', 'opladen'],
        u:'Gratis repareren bij een fout van het product heet garantie.' },
      { t:'raster', v:'Zoek het op. Klopt het, klopt het niet, of staat het er niet?', kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[
        { z:'Met hartslag de hele dag aan gaat de batterij langer mee dan alleen als horloge.', g:1 },
        { z:'Je mag met het horloge douchen.', g:0 },
        { z:'Je kunt met het horloge betalen in een winkel.', g:2 },
        { z:'Van leeg tot vol laden duurt ongeveer 2 uur.', g:0 },
        { z:'Heb je het horloge zelf opengemaakt, dan krijg je geen garantie meer.', g:0 },
        { z:'Het horloge is er in drie kleuren.', g:2 }
      ], u:'Met hartslag aan gaat de batterij 9 dagen mee, alleen als horloge 14 dagen. Dat is dus korter.' }
    ],
    doel:[
      { t:'keuze', v:'Het blok "Over de Ritme 3" is anders dan de andere blokken. Wat wil de maker daar vooral?', o:['je overhalen om het horloge te kopen', 'je uitleggen hoe je het horloge oplaadt', 'je waarschuwen voor schade door water'] },
      { t:'keuze', v:'Welke woorden uit dat blok laten zien dat de maker je wil overhalen?', o:['sneller, slimmer en fitter', 'in duidelijke grafieken', 'je hartslag, je afstand en je snelheid'],
        u:'"Sneller, slimmer en fitter" belooft je iets. De andere woorden noemen alleen wat het horloge doet.' }
    ],
    woord:[
      { t:'keuze', v:'Water en zwemmen: "kan de afdichting __poreus__ worden". Wat betekent poreus?', o:['met kleine openingen waar vocht door kan', 'zo heet dat het gaat smelten', 'helemaal los van het horloge'],
        u:'Lees verder: daarna sijpelt er toch vocht naar binnen. De afdichting laat dus water door.' },
      { t:'keuze', v:'Hartslag en hardlopen: "__Kalibreer__ het horloge dan eerst". Wat betekent kalibreren hier?', o:['afstellen zodat het goed meet', 'opladen tot de batterij vol is', 'koppelen aan je telefoon'],
        u:'Na het kalibreren weet het horloge hoe lang je passen zijn, zodat het je afstand goed schat. Je stelt het dus af.' }
    ]
  }
});

/* ---------- nauwkeurig lezen: elk woord telt, de leerling zoekt de plek terug ---------- */

/* ===== 1F ===== */

LEESBANK.T({
  id:'nauwkeurig-pannenkoeken', niv:'1F', strat:'nauwkeurig', titel:'Pannenkoeken bakken', vorm:'instructie', bron:'Receptkaart van de kookles',
  alineas:[
    'Dit heb je nodig voor ongeveer twaalf pannenkoeken: 250 gram bloem, een half theelepeltje zout, 2 eieren, een halve liter melk en een klontje boter voor elke pannenkoek. Gebruik **alleen** eieren die nog niet over de datum zijn.',
    'Doe de bloem en het zout in een grote kom. Maak in het midden een kuiltje. Breek de eieren boven de kom en laat ze in het kuiltje vallen. Giet er dan een scheutje melk bij.',
    'Roer met een garde van binnen naar buiten. Doe **pas** meer melk erbij als het beslag glad is. Zo krijg je geen klontjes. Giet de rest van de melk er in kleine scheutjes bij. Laat het beslag daarna een kwartier staan.',
    'Zet de koekenpan op het vuur en laat er een klontje boter in smelten. Wacht tot de boter niet meer schuimt. Schep dan een soeplepel beslag in de pan en draai de pan rond. Zo wordt de pannenkoek mooi dun.',
    'Keer de pannenkoek om als de bovenkant droog is. Dat duurt ongeveer twee minuten. Bak de andere kant nog één minuut. Laat de pan **nooit** alleen staan als het vuur aan is. Ga je weg, ook al is het maar even? Zet het vuur dan uit.'
  ],
  taken:{
    nauwkeurig:[
      { t:'raster', v:'Klopt het, klopt het niet, of staat het er niet? Schrijf ook het nummer van de alinea op.', kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[
        { z:'Voor elke pannenkoek gebruik je een klontje boter.', g:0, al:1 },
        { z:'Je doet pas meer melk erbij als het beslag glad is.', g:0, al:3 },
        { z:'Je doet alle melk in één keer bij de bloem.', g:1, al:3 },
        { z:'Je schept het beslag in de pan als de boter nog schuimt.', g:1, al:4 },
        { z:'Je kunt de pannenkoeken ook in de oven bakken.', g:2 },
        { z:'Op een pannenkoek past stroop het best.', g:2 }
      ], u:'Zoek bij elke zin de plek terug. Over de oven en over stroop zegt het recept niets: die staan er niet.' },
      { t:'volgorde', v:'Zet de stappen in de goede volgorde.', stappen:['Bloem en zout in een kom doen', 'De eieren in het kuiltje laten vallen', 'Roeren tot het beslag glad is', 'Het beslag een kwartier laten staan', 'Boter in de pan laten smelten', 'De pannenkoek omkeren'] },
      { t:'keuze', v:'Je bakt een pannenkoek. De bel gaat en je moet even naar de deur. Wat doe je volgens de tekst?', o:['Je zet eerst het vuur uit.', 'Je laat het vuur aan, het is maar even.', 'Je zet het vuur lager en loopt weg.'],
        u:'Alinea 5: ook als het maar even is, zet je het vuur uit.' },
      { t:'open', v:'In alinea 5 staat: "Laat de pan **nooit** alleen staan." Stel dat er "niet te lang" stond. Wat zou er dan anders zijn?', m:'Dan mocht je soms even weglopen. Nu mag dat nooit, ook niet heel even.', r:2 }
    ],
    verwijs:[
      { t:'keuze', v:'Alinea 2: "Breek de eieren boven de kom en laat __ze__ in het kuiltje vallen." Naar welke woorden verwijst ze?', o:['de eieren', 'de bloem en het zout', 'de kom en het kuiltje'],
        u:'Zet het in de plaats: laat de eieren in het kuiltje vallen. Dat klopt.' },
      { t:'keuze', v:'Alinea 5: "__Dat__ duurt ongeveer twee minuten." Wat duurt twee minuten?', o:['tot de bovenkant droog is', 'het omkeren van de pannenkoek', 'het bakken van de andere kant'],
        u:'Omkeren gaat in een tel, en de andere kant bak je één minuut. Je wacht twee minuten tot de bovenkant droog is.' }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 3: "Doe pas meer melk erbij als het beslag glad is. **Zo** krijg je geen klontjes." Wat vertelt de zin met Zo?', o:['wat het gevolg is van de stap ervoor', 'wat je daarna moet doen', 'wat je beter niet kunt doen'],
        u:'Doordat je de melk pas later toevoegt, krijg je geen klontjes. Dat is het gevolg.' },
      { t:'keuze', v:'Alinea 5: "Ga je weg, **ook al** is het maar even?" Wat betekent ook al hier?', o:['zelfs als het kort is', 'omdat het kort is', 'nadat het kort is geweest'],
        u:'Ook al geeft een tegenstelling: het is maar even, en toch moet het vuur uit.' }
    ],
    alinea:[
      { t:'koppel', v:'Welk kopje hoort bij welke alinea? Eén kopje blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 3', 'Alinea 4', 'Alinea 5'],
        rechts:['Wat je nodig hebt', 'Beginnen in de kom', 'Goed roeren', 'Het beslag in de pan', 'Omkeren en veilig blijven'], extra:['Opdienen met stroop'],
        u:'Elke alinea gaat over één stap. Over opdienen gaat geen enkele alinea.' }
    ]
  }
});

LEESBANK.T({
  id:'nauwkeurig-hondenuitlaters', niv:'1F', strat:'nauwkeurig', titel:'Hondenuitlaters gezocht', vorm:'brief', bron:'Brief van dierenasiel De Kwispel',
  alineas:[
    'Beste leerling van klas 2, Bij dierenasiel De Kwispel wonen op dit moment veertien honden. Ze wachten op een nieuw baasje. Tot die tijd moeten ze elke dag naar buiten. Daarom zoeken we jongeren die met een hond willen wandelen.',
    'Je mag zelf meedoen als je **minstens** 13 jaar bent. Ben je jonger? Dan mag je alleen komen als er een ouder of een andere volwassene met je meeloopt. Je ouders moeten het formulier onder deze brief tekenen.',
    'De eerste keer krijg je een korte les van een van onze verzorgers. Zij leert je hoe je een hond aanlijnt en wat je doet als hij gaat trekken. **Pas** na die les mag je zelf een hond uitlaten.',
    'Je wandelt **altijd** met de hond aan de lijn, ook in het bos. Je blijft op de paden rond het asiel. Een wandeling duurt een half uur. Je bent altijd voor 17.00 uur terug, want dan krijgen de honden hun eten.',
    'Je kunt komen op woensdagmiddag en op zaterdag. Meld je bij de balie, dan hoor je met welke hond je gaat. Honden met een rode stip op hun hok zijn nog te wild. Die laten alleen de verzorgers uit. Hartelijke groet, Fatima Bouali, verzorger bij De Kwispel'
  ],
  taken:{
    nauwkeurig:[
      { t:'raster', v:'Klopt het, klopt het niet, of staat het er niet? Schrijf ook het nummer van de alinea op.', kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[
        { z:'Je mag zelf meedoen vanaf 13 jaar.', g:0, al:2 },
        { z:'Ben je 12, dan mag je helemaal niet meedoen.', g:1, al:2 },
        { z:'Na de les mag je zelf een hond uitlaten.', g:0, al:3 },
        { z:'In het bos mag de hond los lopen.', g:1, al:4 },
        { z:'Je krijgt een T-shirt van het asiel.', g:2 },
        { z:'In het asiel wonen ook katten.', g:2 }
      ], u:'Let op de kleine woorden. Ben je 12, dan mag je wel komen, maar alleen met een volwassene. En altijd aan de lijn betekent: ook in het bos.' },
      { t:'volgorde', v:'Je hebt de les al gehad. Zet de stappen van een middag bij het asiel in de goede volgorde.', stappen:['Je meldt je bij de balie', 'Je hoort met welke hond je gaat', 'Je wandelt een half uur op de paden', 'Je bent terug voor 17.00 uur', 'De honden krijgen hun eten'] },
      { t:'keuze', v:'Sem is 12 en zijn zus Lotte is 14. Wat is er voor Sem anders dan voor Lotte?', o:['Er moet een volwassene met hem meelopen.', 'Zijn ouders moeten het formulier tekenen.', 'Hij moet eerst een les van een verzorger krijgen.'],
        u:'Het formulier en de les gelden voor iedereen, dus ook voor Lotte. Alleen de volwassene is extra voor wie jonger is dan 13.' },
      { t:'open', v:'In alinea 2 staat "**minstens** 13 jaar". Stel dat er "hoogstens 13 jaar" stond. Wie mogen er dan zelf meedoen?', m:'Dan mochten alleen jongeren van 13 jaar en jonger meedoen. Nu is het andersom: je moet 13 jaar of ouder zijn.', r:2 }
    ],
    woord:[
      { t:'keuze', v:'Alinea 3: "Zij leert je hoe je een hond __aanlijnt__." Wat betekent aanlijnen?', o:['de riem aan de halsband vastmaken', 'de hond eten en water geven', 'de hond leren om te gaan zitten'],
        u:'In alinea 4 lees je dat de hond altijd aan de lijn loopt. Aanlijnen is de lijn vastmaken.' },
      { t:'keuze', v:'Alinea 5: "Meld je bij de __balie__, dan hoor je met welke hond je gaat." Wat is een balie?', o:['een soort tafel waar een medewerker je helpt', 'het hok waar de honden slapen', 'het pad dat rond het asiel loopt'] }
    ],
    alinea:[
      { t:'keuze', v:'Welke zin is de kernzin van alinea 1?', o:['Daarom zoeken we jongeren die met een hond willen wandelen.', 'Bij dierenasiel De Kwispel wonen op dit moment veertien honden.', 'Tot die tijd moeten ze elke dag naar buiten.'],
        u:'De eerste zinnen leiden ernaartoe. De laatste zin zegt waarom de brief er is: hier staat de kernzin achteraan.' },
      { t:'keuze', v:'Waar gaat alinea 2 over?', o:['wie er mag meedoen', 'hoe je een hond uitlaat', 'wanneer je kunt komen'] }
    ],
    verwijs:[
      { t:'keuze', v:'Alinea 5: "__Die__ laten alleen de verzorgers uit." Wie of wat zijn die?', o:['de honden met een rode stip', 'de jongeren die wandelen', 'de verzorgers bij de balie'],
        u:'Kijk in de zin ervoor: honden met een rode stip zijn nog te wild. Die honden laten alleen de verzorgers uit.' }
    ]
  }
});

LEESBANK.T({
  id:'nauwkeurig-vlaggenroof', niv:'1F', strat:'nauwkeurig', titel:'Spelregels van vlaggenroof', vorm:'instructie', bron:'Uit de map van de gymleraar',
  alineas:[
    'Bij vlaggenroof speel je met twee teams van zes tot tien spelers. Een middenlijn verdeelt het veld in twee helften. Elk team heeft achter in zijn eigen helft een vak. Daarin liggen drie lintjes in de kleur van het team. Dat zijn de vlaggen.',
    'Het doel is om alle drie de vlaggen van het andere team naar je eigen helft te brengen. Het team dat dat als eerste lukt, wint. Is de tijd om? Dan wint het team met de meeste vlaggen.',
    'Op de helft van de tegenstander ben je niet veilig. Een tegenstander kan je daar tikken. Ben je getikt, dan ga je naar het gevangenvak in de hoek van de andere helft. Je komt **pas** vrij als een teamgenoot je hand aantikt.',
    'In het vak met de vlaggen ben je wel veilig. Daar mag niemand je tikken. Je mag er wel **hooguit** vijf tellen blijven staan. Pak je een vlag, dan mag je er maar één tegelijk meenemen.',
    'Je mag **alleen** tikken met je hand, en **nooit** duwen of trekken. Wie dat toch doet, moet een rondje om het veld lopen. Daarna mag die speler weer meedoen.'
  ],
  taken:{
    nauwkeurig:[
      { t:'raster', v:'Klopt het, klopt het niet, of staat het er niet? Schrijf ook het nummer van de alinea op.', kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[
        { z:'Elk team heeft drie vlaggen.', g:0, al:1 },
        { z:'Je mag twee vlaggen tegelijk meenemen.', g:1, al:4 },
        { z:'Je komt vrij als een teamgenoot je hand aantikt.', g:0, al:3 },
        { z:'Wie duwt, mag niet meer meedoen.', g:1, al:5 },
        { z:'Een wedstrijd duurt tien minuten.', g:2 },
        { z:'Het team dat verliest, ruimt de lintjes op.', g:2 }
      ], u:'Wie duwt, loopt een rondje en doet daarna weer mee. Hoe lang een wedstrijd duurt, staat nergens.' },
      { t:'keuze', v:'Daan staat in het vak met de vlaggen van het andere team. Een tegenstander tikt hem. Wat gebeurt er?', o:['Niets: in dat vak mag niemand hem tikken.', 'Daan moet naar het gevangenvak.', 'Daan moet een rondje om het veld lopen.'],
        u:'Alinea 4: in het vak met de vlaggen ben je veilig. Dat is een uitzondering op alinea 3.' },
      { t:'keuze', v:'De tijd is om. Geen team heeft alle drie de vlaggen. Wie wint er?', o:['het team met de meeste vlaggen', 'het team dat de meeste spelers tikte', 'het team met de minste spelers in het gevangenvak'] },
      { t:'open', v:'Alinea 4: "Je mag er wel **hooguit** vijf tellen blijven staan." Stel dat er "minstens vijf tellen" stond. Wat zou er dan anders zijn?', m:'Dan moest je er vijf tellen of langer blijven staan. Nu mag je er niet langer dan vijf tellen staan.', r:2 }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 2: "Is de tijd om? **Dan** wint het team met de meeste vlaggen." Welk verband geeft Dan hier?', o:['voorwaarde: als dat zo is, gebeurt dit', 'tegenstelling: het gaat juist anders', 'opsomming: er komt nog iets bij'],
        u:'Je kunt het ook zo zeggen: als de tijd om is, wint het team met de meeste vlaggen. Dat is een voorwaarde.' },
      { t:'keuze', v:'Alinea 5: "Wie dat **toch** doet, moet een rondje om het veld lopen." Welk verband geeft toch?', o:['tegenstelling', 'oorzaak', 'voorbeeld'],
        u:'Duwen mag niet, en iemand doet het toch. Dat is een tegenstelling.' }
    ],
    woord:[
      { t:'keuze', v:'Alinea 3: "Ben je getikt, dan ga je naar het __gevangenvak__." Wat is het gevangenvak in dit spel?', o:['een plek waar je wacht tot een teamgenoot je bevrijdt', 'een plek waar je team de eigen vlaggen bewaart', 'een plek waar je even uitrust als je moe bent'],
        u:'De zin erna helpt: je komt pas vrij als een teamgenoot je aantikt. Je zit er dus vast.' }
    ]
  }
});

/* ===== 2F ===== */

LEESBANK.T({
  id:'nauwkeurig-spaaractie', niv:'2F', strat:'nauwkeurig', titel:'Spaar voor een koptelefoon', vorm:'instructie', bron:'Actievoorwaarden op de achterkant van de spaarkaart van Supermarkt Hoogland',
  alineas:[
    'De spaaractie van Supermarkt Hoogland loopt van maandag 1 maart tot en met zondag 25 april. Bij elke 10 euro aan boodschappen krijg je één spaarzegel. Betaal je 29 euro, dan krijg je dus twee zegels en geen drie. Op tabak, loten, cadeaukaarten en statiegeld krijg je geen zegels.',
    'Plak de zegels op de spaarkaart. Een volle kaart heeft 30 zegels. Met een volle kaart en 15 euro bijbetalen krijg je een draadloze koptelefoon. Heb je liever geen koptelefoon? Dan kun je de volle kaart ook inleveren voor een korting van 10 euro op je boodschappen. Je kiest één van de twee: allebei kan niet.',
    'Lever je volle kaart in bij de servicebalie. Dat kan tot en met zondag 2 mei, dus een week langer dan je zegels kunt sparen. Daarna is de kaart niets meer waard. Losse zegels kun je niet inleveren. Ze tellen **alleen** mee als ze op een kaart zitten.',
    'Per volle kaart krijg je één koptelefoon, zolang de voorraad strekt. Is de koptelefoon op? Dan krijg je een tegoedbon. Daarmee haal je je koptelefoon later op, uiterlijk op 31 mei. Een tegoedbon kun je niet omruilen voor geld.',
    'Je mag zegels ruilen met vrienden of familie. Zegels kopen of verkopen mag niet. Kaarten met nagemaakte of beschadigde zegels nemen we niet aan. Heb je een vraag over de actie? Stel die dan aan een medewerker bij de servicebalie.',
    'Heb je de koptelefoon en werkt hij niet goed? Breng hem dan binnen 14 dagen terug, samen met de doos en de kassabon van het bijbetalen. Je krijgt dan een nieuwe. Is hij kapotgegaan doordat hij is gevallen of nat is geworden, dan krijg je geen nieuwe.'
  ],
  taken:{
    nauwkeurig:[
      { t:'raster', v:'Klopt het, klopt het niet, of staat het er niet? Schrijf ook het nummer van de alinea op.', kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[
        { z:'Voor 19 euro aan boodschappen krijg je twee zegels.', g:1, al:1 },
        { z:'Met één volle kaart krijg je de koptelefoon én 10 euro korting.', g:1, al:2 },
        { z:'Op donderdag 29 april kun je nog een volle kaart inleveren.', g:0, al:3 },
        { z:'Je mag zegels ruilen met je neef.', g:0, al:5 },
        { z:'Een tegoedbon kun je ook in een andere winkel van Hoogland gebruiken.', g:2 },
        { z:'Kinderen onder de 12 jaar mogen niet meesparen.', g:2 }
      ], u:'Je krijgt een zegel bij elke volle 10 euro: 19 euro is één zegel. Inleveren kan tot en met 2 mei, dus 29 april kan nog.' },
      { t:'keuze', v:'Op welke boodschappen krijg je **wel** zegels?', o:['een zak appels', 'een kraslot', 'een cadeaukaart', 'statiegeld'],
        u:'Alinea 1 noemt de uitzonderingen: tabak, loten, cadeaukaarten en statiegeld. Een kraslot is ook een lot.' },
      { t:'keuze', v:'Alinea 4: je krijgt een koptelefoon "zolang de voorraad strekt". Wat betekent dat voor jou?', o:['Zijn ze op, dan krijg je je koptelefoon later.', 'Zijn de zegels op, dan stopt de actie eerder.', 'Ben je te laat, dan krijg je helemaal niets.'],
        u:'Zijn de koptelefoons op, dan krijg je een tegoedbon. Daarmee haal je hem later op. Je krijgt dus wel iets.' },
      { t:'open', v:'Alinea 1: de actie loopt "**tot en met** zondag 25 april". Stel dat er "tot zondag 25 april" stond. Waarom is dat minder duidelijk?', m:'Dan weet je niet zeker of je op 25 april zelf nog zegels krijgt. Door tot en met weet je: op 25 april krijg je ze nog wel.', r:2 }
    ],
    verwijs:[
      { t:'keuze', v:'Alinea 3: "__Daarna__ is de kaart niets meer waard." Na wanneer?', o:['na zondag 2 mei', 'na zondag 25 april', 'na het inleveren bij de servicebalie'],
        u:'Kijk in de zin ervoor: inleveren kan tot en met 2 mei. Daarna, dus na 2 mei, is de kaart niets meer waard.' },
      { t:'keuze', v:'Alinea 4: "__Daarmee__ haal je je koptelefoon later op." Waarmee?', o:['met de tegoedbon', 'met de volle spaarkaart', 'met de kassabon'] }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 1: "Betaal je 29 euro, dan krijg je **dus** twee zegels en geen drie." Welk verband geeft dus?', o:['conclusie', 'oorzaak', 'tegenstelling'],
        u:'Uit de regel ervoor (elke 10 euro één zegel) volgt dat je bij 29 euro twee zegels krijgt. Dat is een conclusie.' },
      { t:'keuze', v:'Alinea 6: "Is hij kapotgegaan **doordat** hij is gevallen of nat is geworden..." Welk verband geeft doordat?', o:['oorzaak', 'doel', 'tijd'] }
    ],
    alinea:[
      { t:'koppel', v:'Welke kop hoort bij welke alinea? Eén kop blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 3', 'Alinea 4', 'Alinea 5', 'Alinea 6'],
        rechts:['Zo krijg je zegels', 'Kiezen: koptelefoon of korting', 'Tot wanneer je kunt inleveren', 'Als de voorraad op is', 'Wat wel en niet mag met zegels', 'Als de koptelefoon niet werkt'], extra:['Zo gebruik je de koptelefoon'],
        u:'Elke alinea gaat over één ding. Hoe je de koptelefoon gebruikt, staat er niet in.' }
    ]
  }
});

LEESBANK.T({
  id:'nauwkeurig-gameclub', niv:'2F', strat:'nauwkeurig', titel:'De gameclub start weer', vorm:'brief', bron:'Brief van het Lindecollege aan leerlingen en ouders',
  alineas:[
    'Beste leerling en ouders, Na de herfstvakantie start de gameclub van het Lindecollege weer. Elke dinsdag en donderdag kun je na het achtste uur spelen in lokaal B12. De club is bedoeld voor leerlingen van klas 1 tot en met 3. We spelen samen, maar we leren ook hoe een game in elkaar zit.',
    'Meedoen kost 20 euro per half jaar. Daarvan betalen we de licenties voor de games en een nieuwe controller als er een kapotgaat. Heeft je gezin het niet breed? Neem dan contact op met meneer Okafor. Dan zoeken we samen een oplossing. Niemand hoeft thuis te blijven omdat het geld er niet is.',
    'Je kunt je aanmelden tot en met vrijdag 6 november via het formulier op de schoolsite. Er zijn 24 plekken. Zijn er meer aanmeldingen, dan loten we. Leerlingen die vorig jaar op de wachtlijst stonden, krijgen eerst een plek en doen dus niet mee aan de loting.',
    'Tijdens de club gelden een paar afspraken. We spelen **alleen** games die geschikt zijn voor jouw leeftijd. Dat zie je aan het leeftijdslabel op de doos of in de online winkel. Een eigen laptop of eigen spellen neem je niet mee, **tenzij** je docent daar vooraf toestemming voor geeft. Eten en drinken doe je in de aula, niet bij de computers.',
    'Ben je een keer verhinderd? Laat het dan voor 12.00 uur weten aan meneer Okafor. Wie twee keer achter elkaar zonder bericht wegblijft, verliest zijn plek. Die gaat dan naar de eerste leerling op de wachtlijst.',
    'In de laatste week voor de kerstvakantie houden we een toernooi, op donderdag 17 december. Daar mogen ook leerlingen aan meedoen die niet bij de club zitten, als ze zich **uiterlijk** een week van tevoren opgeven. We hopen je te zien! Met vriendelijke groet, Daniel Okafor, docent informatica'
  ],
  taken:{
    nauwkeurig:[
      { t:'raster', v:'Klopt het, klopt het niet, of staat het er niet? Schrijf ook het nummer van de alinea op.', kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[
        { z:'Een leerling uit klas 3 mag meedoen.', g:0, al:1 },
        { z:'Wie vorig jaar op de wachtlijst stond, doet ook mee aan de loting.', g:1, al:3 },
        { z:'Drinken bij de computers mag, als je oplet.', g:1, al:4 },
        { z:'Aan het toernooi mogen ook leerlingen van buiten de club meedoen.', g:0, al:6 },
        { z:'De winnaar van het toernooi krijgt een prijs.', g:2 },
        { z:'Voor het toernooi betaal je niets extra.', g:2 }
      ], u:'Wie op de wachtlijst stond, krijgt eerst een plek en loot dus niet mee. Over een prijs of over kosten voor het toernooi staat niets in de brief.' },
      { t:'keuze', v:'Wanneer mag je je eigen laptop **wel** meenemen?', o:['als je docent dat vooraf goed vindt', 'als er alleen geschikte games op staan', 'als je hem in lokaal B12 laat liggen'],
        u:'Alinea 4: tenzij je docent daar vooraf toestemming voor geeft. Dat is de enige uitzondering.' },
      { t:'keuze', v:'Jesse is dinsdag ziek. Hij laat het om 9.00 uur weten. Donderdag vergeet hij de club en laat niets weten. Wat gebeurt er?', o:['Niets: hij bleef maar één keer zonder bericht weg.', 'Hij verliest zijn plek: hij bleef twee keer weg.', 'Hij mag niet meedoen aan het toernooi.'],
        u:'Je verliest je plek pas als je twee keer achter elkaar zonder bericht wegblijft. Dinsdag gaf Jesse wel bericht.' },
      { t:'open', v:'Alinea 6: buitenstaanders geven zich "**uiterlijk** een week van tevoren" op. Mag Yara zich op maandag 14 december nog opgeven? Leg uit.', m:'Nee. Uiterlijk een week van tevoren is 10 december of eerder. Op 14 december is ze te laat.', r:2 }
    ],
    woord:[
      { t:'keuze', v:'Alinea 2: "Heeft je gezin het niet __breed__?" Wat bedoelt de schrijver?', o:['Heeft je gezin weinig geld?', 'Heeft je gezin weinig ruimte?', 'Heeft je gezin weinig tijd?'],
        u:'Het gaat in deze alinea over de 20 euro, en de laatste zin noemt geld. Het niet breed hebben betekent: weinig geld hebben.' },
      { t:'keuze', v:'Alinea 5: "Ben je een keer __verhinderd__?" Wat betekent verhinderd?', o:['Kun je een keer niet komen?', 'Kom je een keer te laat?', 'Wil je een keer iets anders spelen?'],
        u:'Je moet het laten weten voor 12.00 uur, en wie zonder bericht wegblijft, verliest zijn plek. Het gaat dus over niet kunnen komen.' }
    ],
    alinea:[
      { t:'keuze', v:'Welke zin is de kernzin van alinea 4?', o:['Tijdens de club gelden een paar afspraken.', 'We spelen alleen games die geschikt zijn voor jouw leeftijd.', 'Eten en drinken doe je in de aula, niet bij de computers.'],
        u:'De eerste zin zegt waar de hele alinea over gaat. De andere zinnen noemen de afspraken één voor één.' },
      { t:'keuze', v:'Wat doet alinea 6 in de brief?', o:['Ze noemt een extra activiteit en sluit de brief af.', 'Ze legt uit wat het kost om mee te doen.', 'Ze herhaalt de afspraken van alinea 4.'] }
    ],
    verwijs:[
      { t:'keuze', v:'Alinea 2: "__Daarvan__ betalen we de licenties voor de games." Waarvan?', o:['van de 20 euro die je betaalt', 'van het geld van de school', 'van de prijs van een controller'] },
      { t:'keuze', v:'Alinea 5: "__Die__ gaat dan naar de eerste leerling op de wachtlijst." Wat gaat naar die leerling?', o:['de plek van wie wegbleef', 'het bericht van voor 12.00 uur', 'de leerling die wegbleef'],
        u:'Zet het in de plaats: de plek gaat naar de eerste leerling op de wachtlijst. Dat klopt.' }
    ]
  }
});

LEESBANK.T({
  id:'nauwkeurig-nestkast', niv:'2F', strat:'nauwkeurig', titel:'Zo maak je een nestkast voor mezen', vorm:'instructie', bron:'Handleiding bij het bouwpakket van de natuurclub',
  alineas:[
    'In dit bouwpakket zitten zes plankjes, twaalf schroeven en een strook rubber voor het dak. Controleer eerst of alles er is. Mist er iets? Begin dan niet, maar neem contact op met de natuurclub.',
    'Kijk eerst naar het voorplankje. Daarin zit al een rond gat van 28 millimeter. Dat is groot genoeg voor een pimpelmees, maar te klein voor een koolmees. Wil je liever koolmezen? Maak het gat dan met een rasp voorzichtig groter, tot 32 millimeter. Maak het **niet** groter, anders kan een grotere vogel het nest overnemen.',
    'Schroef eerst de twee zijplankjes vast aan het achterplankje. Zet daarna de bodem ertussen. In de bodem zitten vier kleine gaatjes. Die zijn er zodat regenwater dat toch binnenkomt, weg kan lopen. Schroef **pas** daarna het voorplankje vast.',
    'Het dak gaat er als laatste op. Schroef het **alleen** aan de achterkant vast, met het rubber als scharnier. Zo kun je het dak later openen om de kast schoon te maken. Zet onder het gat geen stokje om op te zitten. Mezen hebben het niet nodig, maar katten en eksters gebruiken het wel om bij de jongen te komen.',
    'Hang de nestkast op tussen de 2 en 3 meter hoog, het liefst voor half februari. Dan zoeken mezen namelijk een plek voor hun nest. Laat het gat naar het oosten of noordoosten wijzen. Zo komt er geen felle middagzon en weinig regen naar binnen.',
    'Maak de kast elk najaar leeg, als de jongen allang zijn uitgevlogen. Gooi het oude nest weg en borstel de kast schoon met heet water. Gebruik **geen** schoonmaakmiddel, want de geur blijft lang hangen.'
  ],
  taken:{
    nauwkeurig:[
      { t:'volgorde', v:'Zet de stappen in de goede volgorde.', stappen:['Controleren of alle onderdelen er zijn', 'De zijplankjes aan het achterplankje schroeven', 'De bodem ertussen zetten', 'Het voorplankje vastschroeven', 'Het dak aan de achterkant vastmaken', 'De kast ophangen'],
        u:'Let op het woordje pas in alinea 3: het voorplankje komt na de bodem. En het dak gaat er als laatste op.' },
      { t:'raster', v:'Klopt het, klopt het niet, of staat het er niet? Schrijf ook het nummer van de alinea op.', kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[
        { z:'Door een gat van 28 millimeter kan een koolmees naar binnen.', g:1, al:2 },
        { z:'Je schroeft het voorplankje vast voordat de bodem erin zit.', g:1, al:3 },
        { z:'Het dak schroef je alleen aan de achterkant vast.', g:0, al:4 },
        { z:'Je hangt de kast op minstens 2 meter hoogte.', g:0, al:5 },
        { z:'Een houten nestkast gaat ongeveer tien jaar mee.', g:2 },
        { z:'Mezen leggen hun eieren in april.', g:2 }
      ], u:'Tussen de 2 en 3 meter betekent: minstens 2 meter. Hoe lang de kast meegaat en wanneer mezen eieren leggen, staat niet in de tekst.' },
      { t:'keuze', v:'Je wilt dat er koolmezen in je kast komen. Hoe groot maak je het gat?', o:['32 millimeter, niet groter', 'groter dan 32 millimeter, voor de zekerheid', '28 millimeter, zoals het al is'],
        u:'Alinea 2: 28 millimeter is te klein voor een koolmees. Maak het tot 32 millimeter, en niet groter.' },
      { t:'open', v:'Alinea 5: "het liefst voor half februari". Stel dat er "uiterlijk half februari" stond. Wat is het verschil?', m:'Met het liefst is het een advies: later ophangen mag ook. Met uiterlijk mag het na half februari niet meer.', r:2 }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 3: "Die zijn er **zodat** regenwater dat toch binnenkomt, weg kan lopen." Welk verband geeft zodat?', o:['doel', 'oorzaak', 'tegenstelling'],
        u:'Zodat zegt waarvoor de gaatjes dienen: dat is het doel.' },
      { t:'keuze', v:'Alinea 5: "Dan zoeken mezen **namelijk** een plek voor hun nest." Welk verband geeft namelijk?', o:['reden', 'tijd', 'tegenstelling'],
        u:'Namelijk legt uit waarom je de kast voor half februari ophangt. Dat is een reden.' }
    ],
    woord:[
      { t:'keuze', v:'Alinea 4: "met het rubber als __scharnier__". Wat is een scharnier?', o:['iets waardoor een deel open en dicht kan draaien', 'iets waardoor er geen water naar binnen komt', 'iets waardoor de schroeven beter blijven zitten'],
        u:'De zin erna helpt: zo kun je het dak later openen.' },
      { t:'keuze', v:'Alinea 6: "als de jongen allang zijn __uitgevlogen__". Wat betekent uitvliegen hier?', o:['het nest voorgoed verlaten', 'uit het ei komen', 'eten gaan zoeken en terugkomen'],
        u:'Je maakt de kast pas leeg in het najaar, als er geen jongen meer in zitten. Ze zijn dus weg.' }
    ]
  }
});

/* ===== 3F ===== */

LEESBANK.T({
  id:'nauwkeurig-skatepark', niv:'3F', strat:'nauwkeurig', titel:'Reglement van skatepark De Rails', vorm:'instructie', bron:'Bord bij de ingang van het skatepark, gemeente Westerbroek',
  alineas:[
    'Skatepark De Rails is er voor iedereen die er veilig en met respect voor anderen gebruik van wil maken. Dit reglement geldt voor skateboarders, steppers, inlineskaters en BMX-fietsers. Wie het park betreedt, gaat akkoord met de regels hieronder. Toezichthouders van de gemeente mogen iemand die zich er niet aan houdt, voor de rest van de dag de toegang ontzeggen.',
    'Het park is dagelijks geopend van 9.00 tot 21.00 uur. Van november tot en met februari sluit het al om 18.00 uur, omdat de verlichting dan niet toereikend is. Bij regen, sneeuw of ijzel is het park **in principe** open, maar de toezichthouder kan het sluiten als de baan te glad wordt. Op een gesloten baan rijden is niet toegestaan, ook niet op eigen risico.',
    'Op dinsdag- en donderdagmiddag van 15.00 tot 17.00 uur is de kleine bak gereserveerd voor beginners en kinderen tot en met 12 jaar. Ervaren rijders gebruiken in die uren **uitsluitend** de grote bak en de street-baan. Deze regel vervalt in de schoolvakanties: dan is de kleine bak voor iedereen beschikbaar.',
    'Een helm is verplicht voor iedereen onder de 16 jaar. Voor oudere rijders is een helm sterk aanbevolen, maar niet verplicht. Pols- en kniebeschermers worden beginners aangeraden. Wie zonder verplichte helm rijdt, wordt eenmaal gewaarschuwd. Bij een tweede keer moet hij het park voor die dag verlaten.',
    'Om botsingen te voorkomen, geldt in de bakken de regel "één tegelijk": je wacht op de rand tot de rijder voor je klaar is. Zit je op de rand, houd dan je benen en je board uit de baan. Toeschouwers blijven achter de lage muur. Muziek mag, mits niemand er last van heeft; een speaker op vol volume valt daar nadrukkelijk niet onder.',
    'Glas, alcohol en roken zijn in het hele park verboden. Afval gooi je in de bakken bij de ingang. Raakt er iemand gewond? Waarschuw dan direct de toezichthouder, of bel bij ernstig letsel 112. De gemeente is niet aansprakelijk voor schade aan spullen of voor letsel. Je rijdt in het park dus voor eigen rekening en risico.'
  ],
  taken:{
    nauwkeurig:[
      { t:'raster', v:'Klopt het, klopt het niet, of staat het er niet? Schrijf ook het nummer van de alinea op.', kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[
        { z:'Een rijder van 17 mag zonder helm rijden.', g:0, al:4 },
        { z:'Wie voor het eerst zonder verplichte helm rijdt, moet meteen het park uit.', g:1, al:4 },
        { z:'In januari kun je om 19.00 uur nog skaten.', g:1, al:2 },
        { z:'In de herfstvakantie mag een ervaren rijder op donderdag om 16.00 uur in de kleine bak.', g:0, al:3 },
        { z:'Voor het park betaal je per dag een kleine bijdrage.', g:2 },
        { z:'Een toezichthouder kan je een boete geven.', g:2 }
      ], u:'Verplicht is de helm alleen onder de 16. Bij de eerste keer krijg je een waarschuwing. In de schoolvakanties vervalt de regel voor de kleine bak. Over betalen of boetes zegt het reglement niets: de toezichthouder kan je alleen de toegang ontzeggen.' },
      { t:'keuze', v:'Het heeft gevroren en de toezichthouder heeft de baan gesloten. Lars (18) zegt: "Ik rijd toch op eigen risico, dat staat in het reglement." Heeft hij gelijk?', o:['Nee: op een gesloten baan mag je niet rijden, ook niet op eigen risico.', 'Ja: volgens alinea 6 rijd je in het park altijd op eigen risico.', 'Ja: hij is ouder dan 16, dus hij mag dat zelf beslissen.'],
        u:'Alinea 6 zegt wie er betaalt bij schade, niet wat er mag. Alinea 2 noemt dit geval precies: ook niet op eigen risico.' },
      { t:'keuze', v:'Alinea 3: ervaren rijders gebruiken in die uren "**uitsluitend** de grote bak en de street-baan". Wat betekent dat?', o:['alleen die twee: de kleine bak niet', 'vooral die twee: de kleine bak als het rustig is', 'eerst die twee: de kleine bak na een uur'] },
      { t:'open', v:'Alinea 2: "Bij regen, sneeuw of ijzel is het park **in principe** open". Wat zou er veranderen als in principe er niet stond?', m:'Dan was het park bij slecht weer altijd open. Nu is het meestal open, maar de toezichthouder mag het sluiten als de baan te glad is.', r:2 }
    ],
    verwijs:[
      { t:'keuze', v:'Alinea 3: "__Deze regel__ vervalt in de schoolvakanties." Welke regel?', o:['dat de kleine bak 2 middagen per week voor beginners en kinderen is', 'dat het park van november tot en met februari om 18.00 uur sluit', 'dat ervaren rijders in de bakken één tegelijk moeten rijden'],
        u:'Kijk terug in dezelfde alinea. Daar gaat het over de kleine bak op dinsdag- en donderdagmiddag.' },
      { t:'keuze', v:'Alinea 5: "een speaker op vol volume valt __daar__ nadrukkelijk niet onder." Waar valt die speaker niet onder?', o:['onder muziek waar niemand last van heeft', 'onder de regel "één tegelijk"', 'onder de spullen die op de rand mogen'],
        u:'Zet het in de plaats: een speaker op vol volume valt niet onder muziek waar niemand last van heeft.' }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 5: "Muziek mag, **mits** niemand er last van heeft". Welk verband geeft mits?', o:['voorwaarde', 'tegenstelling', 'oorzaak', 'doel'],
        u:'Mits betekent: op voorwaarde dat. Muziek mag alleen als niemand er last van heeft.' },
      { t:'keuze', v:'Alinea 6: "Je rijdt in het park **dus** voor eigen rekening en risico." Welk verband geeft dus?', o:['conclusie', 'oorzaak', 'toegeving'],
        u:'De zin ervoor zegt dat de gemeente niet aansprakelijk is. Daaruit volgt dat je zelf betaalt bij schade: een conclusie.' }
    ],
    alinea:[
      { t:'koppel', v:'Welk kopje hoort bij welke alinea? Eén kopje blijft over.', links:['Alinea 2', 'Alinea 3', 'Alinea 4', 'Alinea 5', 'Alinea 6'],
        rechts:['Openingstijden en weer', 'Voorrang voor beginners', 'Bescherming', 'Samen in de baan', 'Verboden en ongelukken'], extra:['Kosten van een abonnement'],
        u:'Zoek per alinea het onderwerp dat alle zinnen samen hebben. Over kosten gaat geen enkele alinea.' },
      { t:'keuze', v:'Alinea 6 gaat over twee dingen. Welke twee?', o:['wat verboden is en wat je doet bij een ongeluk', 'wat verboden is en wanneer het park sluit', 'hoe je afval scheidt en wie er toezicht houdt'] }
    ]
  }
});

LEESBANK.T({
  id:'nauwkeurig-vakantiewerk', niv:'3F', strat:'nauwkeurig', titel:'Welkom als vakantiekracht', vorm:'brief', bron:'Brief van Fruitteelt Ter Weide aan een nieuwe vakantiekracht',
  alineas:[
    'Beste Noor, Wat fijn dat je deze zomer bij Fruitteelt Ter Weide komt werken. In deze brief lees je wat we van je verwachten en wat je van ons mag verwachten. Lees hem zorgvuldig door en bewaar hem. Bij twijfel geldt wat hier staat, niet wat een collega je vertelt.',
    'Je werkt van maandag 12 juli tot en met vrijdag 20 augustus, eerst in de kersenpluk en daarna in de pruimen. Een werkdag begint om 7.30 uur en eindigt om 15.30 uur, met een half uur pauze om 10.00 uur en een half uur om 12.30 uur. Die pauzes worden niet doorbetaald. Wordt het 30 graden of warmer, dan beginnen we om 6.30 uur en stoppen we om 13.00 uur. Dat hoor je **uiterlijk** de avond ervoor via de groepsapp.',
    'Je uurloon is 8,40 euro bruto. Daarbovenop krijg je een plukbonus van 50 cent voor elke kist boven de twaalf per dag, **mits** de kist goed gevuld is en er geen beschadigd fruit in zit. Een kist die de voorman afkeurt, telt niet mee, ook niet voor de eerste twaalf. Je loon wordt elke twee weken op je rekening gestort; de laatste betaling volgt uiterlijk op 4 september.',
    'Veiligheid gaat voor snelheid. Op een ladder sta je **nooit** hoger dan de derde tree van boven, en je verplaatst een ladder alleen als er niemand op staat. Op de tractor en de hoogwerker rijden uitsluitend vaste medewerkers. Ook als een collega het je aanbiedt, ga je daar niet op in. Draag dichte schoenen: slippers en sandalen zijn niet toegestaan, hoe warm het ook is.',
    'Ben je ziek, bel dan voor 7.00 uur naar Mirjam, de bedrijfsleider. Een appje is niet genoeg: zij moet weten of ze iemand anders kan vragen. Wil je een dag vrij, bijvoorbeeld voor een verjaardag of een afspraak bij de tandarts, vraag dat dan **minstens** een week van tevoren aan. Vrije dagen in de laatste twee weken van juli, de drukste weken van de kersenpluk, geven we **alleen** in bijzondere gevallen.',
    'Op je eerste dag krijg je een rondleiding en een korte uitleg over het plukken. Neem die dag je identiteitsbewijs en je rekeningnummer mee, anders kunnen we je niet inschrijven en mag je nog niet beginnen. Je lunch neem je zelf mee; water, koffie en fruit staan de hele dag klaar in de kantine. We kijken ernaar uit je te ontmoeten! Hartelijke groet, Mirjam de Bruin, bedrijfsleider'
  ],
  taken:{
    nauwkeurig:[
      { t:'raster', v:'Klopt het, klopt het niet, of staat het er niet? Schrijf ook het nummer van de alinea op.', kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[
        { z:'Op een gewone werkdag krijg je voor 7 uur loon.', g:0, al:2 },
        { z:'Een afgekeurde kist telt wel mee voor de eerste twaalf.', g:1, al:3 },
        { z:'Je mag een ladder verplaatsen als de collega erop het goedvindt.', g:1, al:4 },
        { z:'Een vrije dag voor de tandarts vraag je minstens een week van tevoren aan.', g:0, al:5 },
        { z:'Je krijgt werkhandschoenen van het bedrijf.', g:2 },
        { z:'Na de zomer kun je op zaterdag blijven werken.', g:2 }
      ], u:'Van 7.30 tot 15.30 uur is 8 uur, min twee onbetaalde pauzes van een half uur: 7 uur loon. Een ladder verplaats je alleen als er niemand op staat, ook als die collega het goedvindt.' },
      { t:'keuze', v:'Noor plukt op een dag 15 goede kisten. Daarnaast keurt de voorman 2 kisten af. Hoeveel plukbonus krijgt ze die dag?', o:['1,50 euro', '2,50 euro', '7,50 euro', '0 euro'],
        u:'Afgekeurde kisten tellen niet mee. Van de 15 goede kisten zijn er 3 meer dan twaalf: 3 keer 50 cent is 1,50 euro.' },
      { t:'keuze', v:'Noor wil op dinsdag 20 juli vrij voor de verjaardag van haar oma. Ze vraagt het op 1 juli aan. Wat zegt de brief hierover?', o:['Dat ze alleen vrij krijgt als het een bijzonder geval is.', 'Dat ze vrij krijgt, want ze vraagt het ruim op tijd.', 'Dat ze geen vrij krijgt, want een verjaardag telt niet.'],
        u:'Ze vraagt het wel op tijd, maar 20 juli valt in de laatste twee weken van juli. Daarvoor geldt een uitzondering: alleen in bijzondere gevallen.' },
      { t:'open', v:'Alinea 6: "anders kunnen we je niet inschrijven en mag je **nog** niet beginnen." Wat zegt het woordje nog hier?', m:'Dat je die dag niet mag werken, maar later wel, zodra je je identiteitsbewijs en rekeningnummer hebt meegenomen.', r:2 }
    ],
    woord:[
      { t:'keuze', v:'Alinea 2: "Die pauzes worden niet __doorbetaald__." Wat betekent dat?', o:['Voor de tijd van de pauzes krijg je geen loon.', 'Je eten in de pauze moet je zelf betalen.', 'Je loon voor de pauzes krijg je pas aan het eind.'],
        u:'Doorbetalen is: het loon gaat door, ook tijdens de pauze. Niet doorbetaald betekent dat je in die tijd niets verdient.' },
      { t:'keuze', v:'Alinea 3: "Een kist die de voorman __afkeurt__, telt niet mee." Wat betekent afkeuren hier?', o:['niet goed genoeg vinden', 'zelf naar de schuur brengen', 'nog een keer laten tellen'],
        u:'In de zin ervoor staat wanneer een kist meetelt: goed gevuld en zonder beschadigd fruit. Een afgekeurde kist voldoet daar niet aan.' }
    ],
    alinea:[
      { t:'keuze', v:'Welke zin is de kernzin van alinea 4?', o:['Veiligheid gaat voor snelheid.', 'Draag dichte schoenen.', 'Op de tractor en de hoogwerker rijden uitsluitend vaste medewerkers.'],
        u:'De eerste zin vat de hele alinea samen. Ladders, tractor en schoenen zijn voorbeelden van die regel.' },
      { t:'keuze', v:'Alinea 1 heeft een andere functie dan de andere alinea’s. Welke?', o:['Ze leidt de brief in en zegt hoe je hem moet gebruiken.', 'Ze legt uit hoeveel je verdient en wanneer.', 'Ze vat alle regels uit de brief kort samen.'] }
    ],
    verwijs:[
      { t:'keuze', v:'Alinea 4: "Ook als een collega het je aanbiedt, ga je __daar__ niet op in." Waar ga je niet op in?', o:['op het aanbod om op de tractor of hoogwerker te rijden', 'op de vraag om een ladder voor iemand te verplaatsen', 'op het advies om toch sandalen te dragen'],
        u:'Kijk in de zin ervoor: daar gaat het over de tractor en de hoogwerker.' },
      { t:'keuze', v:'Alinea 5: "__zij__ moet weten of ze iemand anders kan vragen." Wie is zij?', o:['Mirjam, de bedrijfsleider', 'Noor, de vakantiekracht', 'een collega die invalt'] }
    ]
  }
});

LEESBANK.T({
  id:'nauwkeurig-huurinstrument', niv:'3F', strat:'nauwkeurig', titel:'Een instrument huren bij de muziekschool', vorm:'instructie', bron:'Muziekschool Klankrijk, voorwaarden bij het huurcontract',
  alineas:[
    'Wie bij Muziekschool Klankrijk les heeft, kan een instrument huren. Zo kun je eerst ontdekken of een instrument bij je past, voordat je er zelf een koopt. Je huurt per lesjaar; een lesjaar loopt van 1 september tot en met 30 juni. Leerlingen jonger dan 18 jaar huren via een ouder of verzorger, die het contract ondertekent en voor de betaling verantwoordelijk is.',
    'De huur bedraagt 12 euro per maand voor een blokfluit, ukelele of viool en 22 euro per maand voor een saxofoon, trompet of dwarsfluit. Het eerste huurjaar krijg je 25 procent korting, ongeacht het instrument. De huur wordt elke maand automatisch afgeschreven. In juli en augustus betaal je niets, **tenzij** je het instrument in de zomer bij je houdt; in dat geval loopt de huur gewoon door.',
    'Je kunt het contract opzeggen tegen het einde van een maand, met een opzegtermijn van één maand. Zeg je bijvoorbeeld op 10 maart op, dan eindigt de huur aan het einde van april, en lever je het instrument **uiterlijk** op die dag in. Stop je helemaal met de lessen, dan vervalt de opzegtermijn en eindigt de huur aan het einde van de maand waarin je stopt.',
    'Het instrument blijft eigendom van de muziekschool. Je mag het daarom niet uitlenen of verkopen, en ook niet door iemand anders laten repareren. Klein onderhoud doe je wel zelf: een viool berg je na het spelen op in de koffer, en bij een blaasinstrument maak je na elke les het mondstuk schoon. Riet, snaren en kleppenolie vallen niet onder de huur; die koop je zelf.',
    'Gaat er iets kapot door normaal gebruik, bijvoorbeeld een klep die na jaren spelen gaat lekken, dan laat de muziekschool het kosteloos repareren. Ontstaat de schade doordat het instrument is gevallen, nat is geworden of in een warme auto heeft gelegen, dan betaal je de reparatie zelf, met een **maximum** van 150 euro. Meld schade altijd binnen een week bij de administratie. Probeer het **nooit** eerst zelf te herstellen, want dan vervalt elke vergoeding.',
    'Wordt het instrument gestolen, doe dan aangifte bij de politie en lever een kopie van de aangifte in bij de administratie. Zonder die kopie betaal je de volledige nieuwwaarde; met de kopie betaal je een eigen bijdrage van 100 euro. Raak je het instrument kwijt, dan betaal je altijd de volledige nieuwwaarde. Wil je het instrument na afloop van het huurjaar kopen? Dan trekken we de helft van de betaalde huur af van de prijs.'
  ],
  taken:{
    nauwkeurig:[
      { t:'raster', v:'Klopt het, klopt het niet, of staat het er niet? Schrijf ook het nummer van de alinea op.', kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[
        { z:'Een leerling van 15 ondertekent zelf het huurcontract.', g:1, al:1 },
        { z:'In het eerste huurjaar betaal je voor een trompet 16,50 euro per maand.', g:0, al:2 },
        { z:'Houd je de viool in de zomer bij je, dan betaal je ook in juli en augustus.', g:0, al:2 },
        { z:'Nieuwe snaren voor je viool betaalt de muziekschool.', g:1, al:4 },
        { z:'De administratie is op woensdag gesloten.', g:2 },
        { z:'Een gehuurd instrument is verzekerd tegen brand.', g:2 }
      ], u:'Een trompet kost 22 euro; met 25 procent korting is dat 16,50 euro. Onder de 18 tekent een ouder of verzorger. Snaren koop je zelf.' },
      { t:'keuze', v:'Ruben gaat door met zijn lessen, maar zegt op 20 januari de huur van zijn saxofoon op. Wanneer eindigt de huur?', o:['aan het einde van februari', 'aan het einde van januari', 'op 20 februari', 'aan het einde van maart'],
        u:'Er zit minstens een maand tussen: dat brengt je bij 20 februari. Opzeggen gaat tegen het einde van een maand, dus eindigt de huur eind februari.' },
      { t:'keuze', v:'Isa stopt op 12 mei helemaal met haar lessen. Wanneer eindigt haar huur?', o:['aan het einde van mei', 'aan het einde van juni', 'op 12 juni'],
        u:'Wie helemaal stopt, heeft geen opzegtermijn. De huur eindigt aan het einde van de maand waarin je stopt.' },
      { t:'keuze', v:'Bij welke schade betaal je **niets**?', o:['Een klep van je dwarsfluit lekt na drie jaar spelen.', 'Je trompet valt van de standaard en heeft een deuk.', 'Je viool ligt een middag in een warme auto en barst.', 'Je probeert een lekkende klep eerst zelf te maken.'],
        u:'Alleen schade door normaal gebruik repareert de muziekschool kosteloos. Wie het eerst zelf probeert, krijgt geen vergoeding meer.' },
      { t:'open', v:'Alinea 5: "met een **maximum** van 150 euro". Je trompet valt en de reparatie kost 210 euro. Hoeveel betaal je zelf? En hoeveel zou het zijn als er "een minimum van 150 euro" stond?', m:'Nu betaal je 150 euro, want meer hoeft niet. Bij een minimum betaal je minstens 150 euro, dus hier de hele 210 euro.', r:3 }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 2: "In juli en augustus betaal je niets, **tenzij** je het instrument in de zomer bij je houdt". Welk verband geeft tenzij?', o:['voorwaarde', 'oorzaak', 'doel'],
        u:'Tenzij betekent: behalve als. Het geeft aan onder welke voorwaarde de regel niet geldt.' },
      { t:'keuze', v:'Alinea 4: "Het instrument blijft eigendom van de muziekschool. Je mag het **daarom** niet uitlenen of verkopen." Welk verband geeft daarom?', o:['gevolg', 'tegenstelling', 'opsomming'],
        u:'Omdat het instrument van de school is, mag jij het niet uitlenen. Het verbod is het gevolg.' },
      { t:'schema', v:'Alinea 5: "Probeer het nooit eerst zelf te herstellen, **want** dan vervalt elke vergoeding." Zet het verband in het schema.', vakken:['oorzaak', 'gevolg'],
        m:['je probeert de schade eerst zelf te herstellen', 'je krijgt geen vergoeding meer'], vb:0 }
    ],
    woord:[
      { t:'keuze', v:'Alinea 2: "Het eerste huurjaar krijg je 25 procent korting, __ongeacht__ het instrument." Wat betekent ongeacht hier?', o:['welk instrument je ook huurt', 'alleen voor de goedkope instrumenten', 'behalve voor blaasinstrumenten'],
        u:'De korting hangt niet af van het instrument: hij geldt voor alle instrumenten.' },
      { t:'keuze', v:'Alinea 6: "Zonder die kopie betaal je de volledige __nieuwwaarde__." Wat is de nieuwwaarde?', o:['wat het instrument nieuw in de winkel kost', 'wat het instrument nu nog waard is', 'wat je tot nu toe aan huur betaalde'],
        u:'Het woord bestaat uit nieuw en waarde: wat het instrument waard is als het nieuw is.' }
    ]
  }
});

/* ---------- kritisch lezen: 9 teksten (3 x 1F, 3 x 2F, 3 x 3F) ---------- */

/* ===== 1F ===== */
LEESBANK.T({
  id:'kritisch-gamestoel', niv:'1F', strat:'kritisch', titel:'Webwinkel: de TroonX gamestoel', vorm:'website', bron:'Website van webwinkel GameGigant',
  blokken:[
    { kop:'TroonX gamestoel', tekst:'Nu van 299 euro voor maar 99 euro! De beste gamestoel van Nederland. Nooit meer rugpijn, ook niet na een hele dag gamen. Gebruikt door de beste gamers ter wereld. Geschikt voor iedereen. Op = op! Nog maar 3 op voorraad.' },
    { kop:'Productinformatie', lijst:[['Lengte', 'geschikt tot 1,75 meter'], ['Gewicht', 'tot 90 kilo'], ['Levertijd', '4 tot 8 weken'], ['Terugsturen', 'niet mogelijk bij aanbiedingen']] },
    { kop:'Reviews', lijst:[
      ['Sanne, 3 mei: 5 sterren', 'Super stoel!!! Kopen!!!'],
      ['Gamer123, 3 mei: 5 sterren', 'Beste stoel ooit. Echt waar. Kopen.'],
      ['Jayden, 3 mei: 5 sterren', 'Top top top. Kopen.'],
      ['Fatima, 20 juni: 2 sterren', 'Na een maand zat de armleuning los. Ik wilde de stoel terugsturen, maar mijn geld terugkrijgen lukt niet.']
    ] }
  ],
  taken:{
    kritisch:[
      { t:'raster', v:'Is het een feit of een mening?', kol:['feit', 'mening'], rijen:[
        { z:'De stoel is geschikt tot 1,75 meter.', g:0 },
        { z:'Het is de beste gamestoel van Nederland.', g:1 },
        { z:'De levertijd is 4 tot 8 weken.', g:0 },
        { z:'Top top top.', g:1 }
      ], u:'Een feit kun je nagaan, bijvoorbeeld met een meetlint of een kalender. "De beste" en "top" vindt iemand: dat is een mening.' },
      { t:'keuze', v:'Wie schreef de tekst bovenaan, en waarom?', o:['De webwinkel, om de stoel snel te verkopen.', 'Een klant, om anderen te waarschuwen.', 'Een tester, om stoelen eerlijk te vergelijken.'],
        u:'Er staat een prijs, korting en "Op = op!". De winkel wil dat je koopt.' },
      { t:'keuze', v:'Bovenaan staat: "Geschikt voor iedereen." Klopt dat?', o:['Nee: bij de informatie staat tot 1,75 meter en tot 90 kilo.', 'Ja: de stoel is voor kinderen en voor volwassenen.', 'Ja: bij de productinformatie staat precies hetzelfde.'],
        u:'Ben je langer dan 1,75 meter of zwaarder dan 90 kilo, dan past de stoel niet. Dus niet voor iedereen.' },
      { t:'raster', v:'Je leest de reviews. Welke vragen stel je erbij?', kol:['goede vraag', 'doet er niet toe'], rijen:[
        { z:'Waarom staan drie reviews op dezelfde dag?', g:0 },
        { z:'Hebben die mensen de stoel echt gekocht?', g:0 },
        { z:'Welke games speelt Jayden?', g:1 },
        { z:'Waarom zeggen de lovende reviews niets over de stoel zelf?', g:0 }
      ], u:'Goede vragen helpen je om te checken of een review echt is. Welke games iemand speelt, zegt niets over de stoel.' }
    ],
    argument:[
      { t:'keuze', v:'Welke review geeft een echte reden voor de mening?', o:['Fatima: na een maand zat de armleuning los.', 'Gamer123: beste stoel ooit, echt waar.', 'Sanne: super stoel, kopen.'],
        u:'Alleen Fatima zegt waarom ze de stoel slecht vindt. De anderen roepen alleen dat hij goed is.' },
      { t:'keuze', v:'De winkel schrijft: "Gebruikt door de beste gamers ter wereld." Waarom is dat een zwak argument?', o:['Er staat niet wie die gamers zijn. Je kunt het niet nagaan.', 'Goede gamers zitten nooit op een gamestoel.', 'De beste gamers wonen niet in Nederland.'] }
    ],
    doel:[
      { t:'keuze', v:'Wat wil de winkel bereiken met "Nog maar 3 op voorraad"?', o:['Dat je snel koopt, zonder lang na te denken.', 'Dat je weet hoe groot de winkel is.', 'Dat je later terugkomt als er meer zijn.'],
        u:'Als iets bijna op is, wil je het snel hebben. Zo koop je sneller.' }
    ],
    tussen:[
      { t:'keuze', v:'Fatima schrijft: "Mijn geld terugkrijgen lukt niet." Waarom lukt dat niet?', o:['Bij een aanbieding mag je niet terugsturen.', 'Ze heeft de doos van de stoel weggegooid.', 'De levertijd van 8 weken was nog niet voorbij.'],
        u:'Het staat niet in haar review, maar wel bij de productinformatie. De stoel was in de aanbieding.' },
      { t:'open', v:'De eerste drie reviews lijken op elkaar. Wat denk jij van die reviews? Noem twee dingen uit de tekst.', m:'Ze zijn misschien nep of door de winkel zelf geschreven. Ze staan alle drie op 3 mei en zeggen bijna hetzelfde: "Kopen".', r:2 }
    ]
  }
});

LEESBANK.T({
  id:'kritisch-gratis-munten', niv:'1F', strat:'kritisch', titel:'Gratis munten in Blokkenrijk?', vorm:'post',
  post:{ afzender:'Doorgestuurd door Daan', label:'Vaak doorgestuurd', kop:'GRATIS 5000 munten in Blokkenrijk!!', zinnen:[
    'Let op, dit is echt!!! Blokkenrijk geeft vandaag 5000 gratis munten.',
    'Het spel bestaat 10 jaar, daarom wil het alle spelers bedanken.',
    'Klik op de link en vul je gebruikersnaam en je wachtwoord in.',
    'Mijn neef heeft het gedaan en kreeg echt alle munten.',
    'Al 80.000 spelers deden mee!',
    'Stuur dit door naar 10 vrienden, anders werkt het niet.',
    'Snel, want om 18.00 uur stopt de actie!'
  ] },
  naast:{ kop:'Veilig spelen', bron:'Hulppagina in het spel Blokkenrijk', tekst:'Wij vragen nooit om je wachtwoord. Ook niet via een link in een app of in een mail. Munten krijg je alleen in het spel zelf. Kreeg je een bericht over gratis munten? Klik dan niet op de link en stuur het bericht niet door. Vertel het aan je ouders of aan je mentor.' },
  taken:{
    kritisch:[
      { t:'keuze', v:'Wie heeft dit bericht als eerste gemaakt?', o:['Dat weet je niet: Daan heeft het alleen doorgestuurd.', 'Daan, want zijn naam staat boven het bericht.', 'Blokkenrijk, want het gaat over hun eigen spel.'],
        u:'Er staat "Doorgestuurd door Daan". Daan kreeg het dus zelf ook van iemand. Wie het echt maakte, staat er niet.' },
      { t:'keuze', v:'Wat wil de maker van het bericht echt van jou?', o:['Je wachtwoord, zodat hij in jouw account kan.', 'Spelers bedanken, omdat het spel 10 jaar bestaat.', 'Zoveel mogelijk nieuwe spelers voor Blokkenrijk.'],
        u:'In zin 3 moet je je wachtwoord invullen. Het spel zelf vraagt daar nooit om, zegt de hulppagina.' },
      { t:'raster', v:'Welke vragen stel je bij dit bericht?', kol:['goede vraag', 'doet er niet toe'], rijen:[
        { z:'Waarom wil een spel mijn wachtwoord hebben?', g:0 },
        { z:'Wie heeft die 80.000 spelers geteld?', g:0 },
        { z:'Hoeveel munten heb ik nu al?', g:1 },
        { z:'Staat deze actie ook in het spel zelf?', g:0 }
      ] },
      { t:'open', v:'Welke tekst vertrouw je meer: het bericht of de hulppagina? Geef een reden uit de tekst.', m:'De hulppagina: die komt van het spel zelf. Van het bericht weet je niet wie het maakte, en het vraagt om je wachtwoord.', r:2 }
    ],
    argument:[
      { t:'keuze', v:'Zin 4: "Mijn neef heeft het gedaan en kreeg echt alle munten." Is dat een sterk argument?', o:['Nee: je kent die neef niet en je kunt het niet nagaan.', 'Ja: de neef heeft het zelf geprobeerd.', 'Ja: een neef liegt niet tegen zijn familie.'],
        u:'Je weet niet eens wie "mijn neef" is, want je weet niet wie het bericht schreef.' }
    ],
    tussen:[
      { t:'keuze', v:'Zin 6: "Stuur dit door naar 10 vrienden, anders werkt het niet." Wat zegt dat over het bericht?', o:['Het moet zich zo snel mogelijk verspreiden.', 'Je krijgt meer munten als je meer vrienden hebt.', 'Het werkt alleen als je vrienden ook spelen.'],
        u:'Doorsturen heeft niets met munten te maken. De maker wil dat zoveel mogelijk mensen het bericht krijgen.' },
      { t:'keuze', v:'Zin 7: "Snel, want om 18.00 uur stopt de actie!" Waarom zet de maker haast in het bericht?', o:['Dan denk je niet goed na en klik je sneller.', 'Om 18.00 uur gaat het spel Blokkenrijk dicht.', 'Dan weet je hoe laat je moet gaan spelen.'] }
    ],
    signaal:[
      { t:'keuze', v:'Zin 2: "Het spel bestaat 10 jaar, **daarom** wil het alle spelers bedanken." Welk verband geeft daarom?', o:['oorzaak en gevolg', 'tegenstelling', 'voorbeeld'] },
      { t:'keuze', v:'Zin 7: "Snel, **want** om 18.00 uur stopt de actie!" Welk verband geeft want?', o:['reden', 'tegenstelling', 'opsomming'] }
    ]
  }
});

LEESBANK.T({
  id:'kritisch-skatebaan', niv:'1F', strat:'kritisch', titel:'Een skatebaan in het Lindepark!', vorm:'brief', bron:'Ingezonden brief in de wijkkrant',
  alineas:[
    'Ik ben Noor Bakker. Ik ben 13 jaar en ik woon in de Lindewijk. Ik schrijf deze brief omdat ik vind dat er een skatebaan moet komen in het Lindepark.',
    'Nu skaten wij op het plein bij de supermarkt. Daar rijden auto’s en busjes die spullen naar de winkel brengen. Vorige week werd mijn vriend Sem bijna geraakt door een busje. Een skatebaan in het park is veel veiliger.',
    'Ook is skaten gezond. Je bent buiten en je beweegt veel. Dat is beter dan de hele middag gamen.',
    'In het park is genoeg plek. Naast de speeltuin ligt een stuk gras waar bijna nooit iemand komt. Daar past een kleine baan precies.',
    'Iedereen in de wijk wil een skatebaan. Ik heb het aan mijn hele klas gevraagd en ze zeiden allemaal ja. Daarom vraag ik de gemeente: bouw hem dit jaar nog!'
  ],
  naast:{ kop:'Reactie in de volgende wijkkrant', bron:'Ingezonden brief van Ria Smit, Lindewijk', tekst:'Ik woon naast het Lindepark. Op dat stuk gras laat ik elke dag mijn hond uit, net als veel andere buren. Een skatebaan maakt de hele dag lawaai. Kunnen de jongeren niet naar de skatebaan in Oosterveld? Die is maar tien minuten fietsen.' },
  taken:{
    kritisch:[
      { t:'keuze', v:'Wie schreef de brief, en wat wil ze?', o:['Een meisje uit de wijk: ze wil dat er een skatebaan komt.', 'Een journalist: ze wil vertellen wat er in de wijk gebeurt.', 'De gemeente: die wil weten wat jongeren willen.'] },
      { t:'raster', v:'Is het een feit of een mening? Schrijf ook het nummer van de alinea op.', kol:['feit', 'mening'], rijen:[
        { z:'Noor is 13 jaar.', g:0, al:1 },
        { z:'Een skatebaan in het park is veel veiliger.', g:1, al:2 },
        { z:'Skaten is beter dan de hele middag gamen.', g:1, al:3 },
        { z:'Naast de speeltuin ligt een stuk gras.', g:0, al:4 }
      ], u:'Een feit kun je nagaan: je kunt kijken of er gras ligt. Wat beter of veiliger is, vindt Noor.' },
      { t:'raster', v:'Noor schrijft: "Iedereen in de wijk wil een skatebaan." Welke vragen stel je daarbij?', kol:['goede vraag', 'doet er niet toe'], rijen:[
        { z:'Heeft Noor ook volwassenen in de wijk gevraagd?', g:0 },
        { z:'Wonen al haar klasgenoten in de Lindewijk?', g:0 },
        { z:'Welk skateboard heeft Noor?', g:1 },
        { z:'Kon je in de klas ook nee zeggen?', g:0 }
      ], u:'Noor vroeg het alleen aan haar klas. Dat is nog niet iedereen in de wijk.' },
      { t:'keuze', v:'Noor schrijft dat er op het gras "bijna nooit iemand komt". Wat zegt Ria daarover?', o:['Ze laat er elke dag haar hond uit, net als veel buren.', 'Ze vindt het stuk gras te klein voor een skatebaan.', 'Ze zegt dat de speeltuin al op dat stuk gras staat.'],
        u:'Ria woont naast het park. Zij weet het daarom beter dan Noor.' }
    ],
    argument:[
      { t:'open', v:'Wat is het standpunt van Noor? Schrijf het in één zin.', b:'Noor vindt dat', m:'er een skatebaan moet komen in het Lindepark.', r:1 },
      { t:'keuze', v:'Welk argument geeft Noor in alinea 2?', o:['Skaten bij de supermarkt is gevaarlijk.', 'Skaten is goed voor je gezondheid.', 'In het park is genoeg plek voor een baan.'] }
    ],
    doel:[
      { t:'keuze', v:'Wat is het doel van de brief van Noor?', o:['overtuigen', 'informeren', 'amuseren'], u:'Noor wil dat de gemeente iets doet: "bouw hem dit jaar nog!" Ze wil de lezer overhalen.' }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 3 begint met **Ook**. Wat doet Noor met dat woord?', o:['Ze noemt nog een argument.', 'Ze geeft een voorbeeld bij alinea 2.', 'Ze zegt iets wat tegen alinea 2 ingaat.'] },
      { t:'keuze', v:'Alinea 5: "**Daarom** vraag ik de gemeente: bouw hem dit jaar nog!" Welk verband geeft daarom?', o:['conclusie', 'tegenstelling', 'opsomming'], u:'Na alle argumenten komt wat Noor wil. Daarom leidt die conclusie in.' }
    ]
  }
});

/* ===== 2F ===== */
LEESBANK.T({
  id:'kritisch-vitaminegummies', niv:'2F', strat:'kritisch', titel:'Mijn geheim voor meer energie', vorm:'post',
  post:{ afzender:'lisa.fitlife (310.000 volgers)', label:'Samenwerking', kop:'Mijn geheim voor meer energie', zinnen:[
    'Hoi lieverds! Jullie vragen me elke dag hoe ik zoveel energie heb.',
    'Mijn geheim: elke ochtend twee gummies van VitaBeer.',
    'Sinds ik ze neem, ben ik nooit meer moe, ook niet na een lange dag school en sporten.',
    'In elke gummy zit vitamine C, vitamine D en vitamine B12.',
    'Ze smaken naar aardbei en zijn echt superlekker.',
    'Volgens VitaBeer heeft 95 procent van de jongeren een tekort aan vitamines.',
    'Ik ben geen dokter, maar ik voel echt het verschil!',
    'Mijn vriendin Kim neemt ze ook en zij haalt nu alleen nog maar achten.',
    'Een pot met 60 gummies kost 24,95 euro.',
    'Met mijn code LISA20 krijg je 20 procent korting.',
    'Die code werkt alleen deze week, dus wees er snel bij!',
    'Tag een vriend die ook altijd moe is!'
  ] },
  naast:{ kop:'Vitaminepillen: nodig of niet?', bron:'Uit de folder "Gezond eten" van de jeugdarts', tekst:'De meeste jongeren krijgen genoeg vitamines binnen als ze gevarieerd eten: groente, fruit, volkorenbrood en zuivel. Alleen van vitamine D krijg je in de winter soms te weinig, omdat je dan minder zon ziet. Ben je vaak moe? Dat komt meestal door te weinig slaap, te veel schermtijd of te weinig beweging. Een vitaminepil lost dat niet op. Let ook op: in gummies zit vaak veel suiker. Twijfel je? Vraag het aan je huisarts.' },
  taken:{
    kritisch:[
      { t:'open', v:'Lisa zegt dat ze haar "geheim" deelt. Welke twee dingen in de post verraden dat ze er geld aan verdient?', m:'Het label Samenwerking boven de post en haar eigen kortingscode LISA20.', r:2,
        u:'Een samenwerking betekent bijna altijd: het merk betaalt. Met een eigen code kan het merk zien hoeveel Lisa verkoopt.' },
      { t:'raster', v:'Is het een feit of een mening?', kol:['feit', 'mening'], rijen:[
        { z:'Zin 4: In elke gummy zit vitamine C, D en B12.', g:0 },
        { z:'Zin 5: Ze zijn echt superlekker.', g:1 },
        { z:'Zin 7: Ik voel echt het verschil!', g:1 },
        { z:'Zin 9: Een pot met 60 gummies kost 24,95 euro.', g:0 }
      ], u:'Wat in een gummy zit en wat een pot kost, kun je nagaan op de verpakking. Of iets lekker is of verschil maakt, voelt Lisa zelf.' },
      { t:'raster', v:'Zin 6: "Volgens VitaBeer heeft 95 procent van de jongeren een tekort aan vitamines." Welke vragen stel je bij die claim?', kol:['goede vraag', 'doet er niet toe'], rijen:[
        { z:'Waar komt dat getal vandaan?', g:0 },
        { z:'Heeft VitaBeer er belang bij dat het getal hoog is?', g:0 },
        { z:'Bedoelen ze een klein beetje te weinig of veel te weinig?', g:0 },
        { z:'Naar welke vrucht smaken de gummies?', g:1 }
      ], u:'Het getal komt van de maker zelf, en die verkoopt vitamines. Bovendien zegt de jeugdarts iets heel anders.' },
      { t:'open', v:'Lees ook de folder van de jeugdarts. Welke tekst vertrouw je meer als je vaak moe bent? Leg uit waarom.', m:'De folder: de jeugdarts verkoopt niets en zegt dat moeheid meestal komt door slaap, schermtijd of te weinig bewegen. Lisa krijgt geld van VitaBeer.', r:3 }
    ],
    argument:[
      { t:'open', v:'Wat is het standpunt van Lisa, en wat is haar belangrijkste argument?', m:'Je moet gummies van VitaBeer nemen, want sinds zij ze neemt, is ze nooit meer moe.', r:2 },
      { t:'keuze', v:'Zin 8: Kim neemt de gummies en haalt nu alleen nog achten. Waarom is dat een zwak argument?', o:['Het gaat om één vriendin, en die achten kunnen ook een andere oorzaak hebben.', 'Kim is een vriendin van Lisa, en vriendinnen mogen geen reclame maken.', 'Achten zijn niet hoog genoeg om iets over vitamines te kunnen bewijzen.'],
        u:'Misschien leert Kim gewoon harder. Eén voorbeeld bewijst niets over alle jongeren.' }
    ],
    doel:[
      { t:'keuze', v:'Lisa sluit af met "Tag een vriend die ook altijd moe is!" Wat wil ze daarmee bereiken?', o:['Dat meer mensen de post zien, zodat er meer verkocht wordt.', 'Dat haar volgers elkaar helpen om eerder te gaan slapen.', 'Dat ze weet welke van haar volgers vaak moe zijn.'] },
      { t:'keuze', v:'Wat is het doel van de folder van de jeugdarts?', o:['informeren', 'amuseren', 'iets verkopen'], u:'De jeugdarts legt uit hoe het zit en verkoopt zelf niets.' }
    ],
    tussen:[
      { t:'keuze', v:'Zin 7: "Ik ben geen dokter, maar ik voel echt het verschil!" Wat geeft Lisa hier eigenlijk toe?', o:['Dat ze niet echt kan weten of de gummies werken.', 'Dat ze zelf liever dokter was geworden.', 'Dat de gummies alleen bij haar goed werken.'],
        u:'Een gevoel is geen bewijs. Lisa zegt zelf dat ze er geen verstand van heeft.' }
    ]
  }
});

LEESBANK.T({
  id:'kritisch-column-muziek', niv:'2F', strat:'kritisch', titel:'Alle liedjes klinken hetzelfde', vorm:'artikel', bron:'Column van Gerard Hoekstra (58) in Dagblad De Polder',
  alineas:[
    'Gisteren zat ik in de auto met mijn dochter van vijftien. Zij mocht de muziek kiezen. Na drie liedjes vroeg ik of de radio kapot was, want ik hoorde steeds hetzelfde nummer. "Pap, dat waren drie verschillende artiesten," zei ze. Ik geloofde haar niet.',
    'Vroeger was muziek beter. Dat vind ik niet alleen, dat weet iedereen van mijn leeftijd. Toen ik jong was, klonk elke plaat anders. Je had een gitaarsolo, een refrein dat je meteen kon meezingen en een tekst waar je over na moest denken. Tegenwoordig gaat elk liedje over geld, feestjes of over hoe geweldig de zanger zelf is.',
    'Ook zijn liedjes veel korter geworden. Een hit duurt nu vaak nog maar een minuut of drie. Volgens een onderzoek dat ik ergens las, slaat de helft van de luisteraars een liedje na tien seconden al over. Jongeren kunnen gewoon niet meer stilzitten. Daardoor durven makers geen lange intro meer te maken.',
    'Mijn dochter zegt dat ik ouderwets ben. Maar ik heb gelijk. Bijna alle liedjes worden tegenwoordig op een computer gemaakt. Een echte band met een drummer en een bassist hoor je bijna niet meer.',
    'Toch moet ik iets bekennen. Gisteravond, toen niemand thuis was, hoorde ik mezelf een liedje neuriën. Het was het derde nummer uit de auto. Ik heb het meteen uitgezet. Maar vanochtend zat het nog steeds in mijn hoofd.'
  ],
  taken:{
    kritisch:[
      { t:'keuze', v:'Wie schrijft deze column, en waarom?', o:['Een vader van 58: hij geeft zijn mening over muziek van nu.', 'Een muziekkenner: hij legt uit hoe hits gemaakt worden.', 'Een dj: hij wil dat je naar zijn radioprogramma luistert.'],
        u:'Kijk naar de bron en naar alinea 1. Een column is een stuk waarin iemand zijn eigen mening geeft.' },
      { t:'raster', v:'Is het een feit of een mening? Schrijf ook het nummer van de alinea op.', kol:['feit', 'mening'], rijen:[
        { z:'De dochter van de schrijver is vijftien.', g:0, al:1 },
        { z:'Vroeger was muziek beter.', g:1, al:2 },
        { z:'Een hit duurt nu vaak een minuut of drie.', g:0, al:3 },
        { z:'Jongeren kunnen niet meer stilzitten.', g:1, al:3 }
      ], u:'Hoe lang een liedje duurt, kun je meten. Of muziek beter is, vindt iemand. "Jongeren kunnen niet stilzitten" is een oordeel over een hele groep.' },
      { t:'raster', v:'Alinea 3: "Volgens een onderzoek dat ik ergens las, slaat de helft van de luisteraars een liedje na tien seconden al over." Welke vragen stel je daarbij?', kol:['goede vraag', 'doet er niet toe'], rijen:[
        { z:'Wie heeft dat onderzoek gedaan?', g:0 },
        { z:'Waar heeft de schrijver het gelezen?', g:0 },
        { z:'Gaat het om alle luisteraars of alleen om jongeren?', g:0 },
        { z:'Welk liedje neuriede de schrijver?', g:1 }
      ], u:'"Ergens gelezen" is geen bron. Je kunt het getal dus niet controleren.' }
    ],
    argument:[
      { t:'open', v:'Wat is het standpunt van de schrijver? Schrijf het in één zin.', m:'Muziek was vroeger beter dan nu.', r:1 },
      { t:'keuze', v:'Alinea 2: "Dat vind ik niet alleen, dat weet iedereen van mijn leeftijd." Wat is er mis met dat argument?', o:['Dat veel mensen iets vinden, maakt het nog geen feit.', 'Mensen van zijn leeftijd luisteren geen nieuwe muziek.', 'Hij heeft niet gevraagd hoe oud iedereen is.'],
        u:'Dit heet een beroep op de meerderheid. Ook als veel mensen het vinden, blijft het een mening.' }
    ],
    tussen:[
      { t:'keuze', v:'Alinea 1: "Ik geloofde haar niet." Wat wil de schrijver daarmee laten zien?', o:['Dat de liedjes voor hem echt allemaal hetzelfde klinken.', 'Dat zijn dochter vaak niet de waarheid vertelt.', 'Dat de radio in de auto echt kapot was.'] },
      { t:'keuze', v:'Wat laat alinea 5 zien over de schrijver?', o:['Hij vindt de muziek van nu stiekem beter dan hij toegeeft.', 'Hij is boos dat zijn dochter de muziek mocht kiezen.', 'Hij wil voortaan alleen nog naar oude platen luisteren.'],
        u:'Hij neuriet het liedje als niemand het hoort, en het zit de volgende ochtend nog in zijn hoofd. Dat zegt hij niet hardop, maar je merkt het wel.' }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 3: "**Daardoor** durven makers geen lange intro meer te maken." Welk verband geeft daardoor?', o:['oorzaak en gevolg', 'tegenstelling', 'voorbeeld'] },
      { t:'keuze', v:'Alinea 5 begint met **Toch**. Wat verandert er daar in de column?', o:['De schrijver geeft iets toe wat niet bij zijn mening past.', 'De schrijver noemt nog een argument voor zijn mening.', 'De schrijver geeft een voorbeeld bij alinea 4.'],
        u:'Toch geeft een tegenstelling. Na vier alinea’s klagen komt er iets wat daar tegenin gaat.' }
    ]
  }
});

LEESBANK.T({
  id:'kritisch-eikenbos', niv:'2F', strat:'kritisch', titel:'Stop de mountainbikeroute!', vorm:'post',
  post:{ afzender:'Red het Eikenbos', label:'Actiegroep', kop:'Stop de mountainbikeroute door ons bos!', zinnen:[
    'De gemeente wil een mountainbikeroute van 12 kilometer aanleggen, dwars door het Eikenbos.',
    'Dat is een ramp voor de natuur.',
    'Mountainbikers razen met hoge snelheid over de paden en maken alles kapot.',
    'Honderden reeën, vossen en dassen zullen vluchten en nooit meer terugkomen.',
    'Bovendien wordt het bos veel te druk voor wandelaars en hondenbezitters.',
    'Een boswachter zei vorig jaar nog dat het bos nu al te druk is.',
    'Wij wonen al dertig jaar naast het bos en weten hoe kwetsbaar het is.',
    'Iedereen die van de natuur houdt, is tegen deze route.',
    'Al 2000 mensen tekenden onze petitie.',
    'Op dinsdag 13 oktober neemt de gemeente een besluit.',
    'Teken daarom vandaag nog en deel dit bericht met iedereen die je kent!'
  ] },
  naast:{ kop:'Plan voor de mountainbikeroute', bron:'Uit de nieuwsbrief van de boswachters van het Eikenbos', tekst:'De nieuwe route wordt 12 kilometer lang. Hij loopt over bestaande paden aan de rand van het bos. Het stiltegebied in het midden, waar de dassen hun burchten hebben, blijft dicht voor fietsers. In de broedtijd, van maart tot en met juni, is een deel van de route gesloten. Nu fietsen mountainbikers nog overal door het bos, ook door het stiltegebied. Met een vaste route willen we dat stoppen.' },
  taken:{
    kritisch:[
      { t:'keuze', v:'Wie maakte het bericht, en wat willen ze dat jij doet?', o:['Een actiegroep: ze willen dat je tekent en het bericht deelt.', 'De boswachters: ze willen dat je de nieuwe route komt fietsen.', 'De gemeente: ze willen weten wat inwoners van de route vinden.'] },
      { t:'raster', v:'Is het een feit of een mening?', kol:['feit', 'mening'], rijen:[
        { z:'Zin 2: Dat is een ramp voor de natuur.', g:1 },
        { z:'Zin 8: Iedereen die van de natuur houdt, is tegen deze route.', g:1 },
        { z:'Zin 9: Al 2000 mensen tekenden onze petitie.', g:0 },
        { z:'Zin 10: Op dinsdag 13 oktober neemt de gemeente een besluit.', g:0 }
      ], u:'Het aantal handtekeningen en de datum kun je nagaan. Of iets een ramp is, en wie er tegen moet zijn, vindt de actiegroep.' },
      { t:'raster', v:'Vergelijk het bericht met de nieuwsbrief van de boswachters. Wat zeggen de boswachters over deze zinnen van de actiegroep?', kol:['zelfde', 'iets anders', 'niets over'], rijen:[
        { z:'De route is 12 kilometer lang.', g:0 },
        { z:'De route gaat dwars door het bos.', g:1 },
        { z:'Het wordt te druk voor wandelaars.', g:2 },
        { z:'Dassen en andere dieren worden door de route verjaagd.', g:1 }
      ], u:'Volgens de boswachters komt de route aan de rand, en blijft het stiltegebied met de dassenburchten dicht. Over wandelaars zeggen ze niets.' },
      { t:'open', v:'Welke bron vertrouw je meer over waar de route komt: de actiegroep of de boswachters? Leg uit waarom.', m:'De boswachters: zij maken het plan en zeggen precies waar de route komt. De actiegroep wil je overhalen en overdrijft.', r:2 }
    ],
    argument:[
      { t:'open', v:'Wat is het standpunt van de actiegroep? Noem ook twee argumenten.', m:'De mountainbikeroute moet er niet komen. Want de dieren vluchten weg, en het bos wordt te druk voor wandelaars.', r:3 },
      { t:'keuze', v:'Zin 6: "Een boswachter zei vorig jaar nog dat het bos nu al te druk is." Wat is het probleem met dit argument?', o:['Je weet niet welke boswachter het zei, of waarover precies.', 'Een boswachter weet niets van mountainbiken in het bos.', 'Vorig jaar was het bos nog veel kleiner dan nu.'],
        u:'Een deskundige zonder naam kun je niet controleren. De boswachters in de nieuwsbrief zijn juist vóór de route.' }
    ],
    doel:[
      { t:'keuze', v:'Wat is het doel van het bericht en van de nieuwsbrief?', o:['De actiegroep wil overtuigen, de boswachters informeren.', 'Ze willen je allebei informeren over de nieuwe route.', 'De actiegroep wil informeren, de boswachters overtuigen.'],
        u:'De actiegroep gebruikt woorden als "ramp" en "razen" en vraagt je te tekenen. De boswachters noemen vooral feiten over het plan.' }
    ],
    signaal:[
      { t:'keuze', v:'Zin 5 begint met **Bovendien**. Welk verband geeft dat woord?', o:['opsomming: er komt nog een argument', 'tegenstelling: er komt een tegenargument', 'oorzaak: er komt een reden voor zin 4'] },
      { t:'keuze', v:'Zin 11: "Teken **daarom** vandaag nog." Wat doet daarom in deze zin?', o:['Het leidt de conclusie in: wat jij nu moet doen.', 'Het geeft een voorbeeld van wat er in het bos gebeurt.', 'Het geeft aan wanneer de gemeente een besluit neemt.'] }
    ]
  }
});

/* ===== 3F ===== */
LEESBANK.T({
  id:'kritisch-bijbaan', niv:'3F', strat:'kritisch', titel:'Elke scholier verdient een bijbaan', vorm:'artikel', bron:'Opiniestuk van Ruud Verbeek, eigenaar van drie supermarkten, in een regionale krant',
  alineas:[
    'Wie op zaterdagochtend boodschappen doet, ziet ze overal: jongeren die vakken vullen, kassa’s bedienen en klanten de weg wijzen. Ik heb drie supermarkten en zonder hen zou ik mijn deuren kunnen sluiten. Toch merk ik dat het steeds moeilijker wordt om scholieren te vinden. Dat is jammer, want ik ben ervan overtuigd dat elke scholier vanaf vijftien jaar een bijbaan zou moeten hebben.',
    'Het eerste argument ligt voor de hand: met een bijbaan leer je omgaan met geld. Wie zelf twee uur moet werken voor een paar nieuwe schoenen, denkt wel twee keer na voordat hij ze koopt. Dat leer je niet uit een boek, dat leer je achter de kassa.',
    'Daarnaast leer je op je werk dingen die op school nauwelijks aan bod komen: op tijd komen, samenwerken met mensen die je niet zelf hebt uitgekozen en vriendelijk blijven tegen een klant die chagrijnig is. Een bekende hoogleraar economie vertelde me onlangs op een verjaardag dat jongeren met een bijbaan later meer verdienen. Als zelfs een professor dat zegt, hoeven we daar niet meer aan te twijfelen.',
    'Bovendien staan de meeste mensen achter dit idee. Uit cijfers blijkt dat tachtig procent van de ouders vindt dat hun kind moet werken. Zoveel mensen kunnen zich toch niet vergissen?',
    'Sommige mensen zeggen dat een bijbaan slecht is voor de schoolprestaties. Dat geloof ik niet. Mijn eigen zoon werkte vanaf zijn vijftiende drie avonden per week bij mij in de winkel, en hij heeft zijn vwo-diploma gewoon in één keer gehaald. Een bijbaan en school gaan dus prima samen.',
    'Natuurlijk moeten jongeren niet te veel uren maken. De wet regelt al hoeveel uur een scholier mag werken, en daar houd ik me aan. Maar binnen die grenzen kan een bijbaan een scholier alleen maar sterker maken. Ouders en scholen: moedig jullie kinderen aan. Ik heb in elk geval nog plaatsen vrij.'
  ],
  taken:{
    kritisch:[
      { t:'keuze', v:'Kijk wie het stuk schreef. Wat moet je daarom extra goed controleren?', o:['Of zijn argumenten niet vooral goed uitkomen voor zijn eigen winkels.', 'Of hij wel genoeg verstand heeft van school en van diploma’s.', 'Of hij vroeger als scholier zelf ook een bijbaan heeft gehad.'],
        u:'Een supermarkteigenaar heeft scholieren nodig als personeel. Hij heeft dus zelf belang bij zijn standpunt.' },
      { t:'raster', v:'Is het een feit of een mening? Schrijf ook het nummer van de alinea op.', kol:['feit', 'mening'], rijen:[
        { z:'De schrijver heeft drie supermarkten.', g:0, al:1 },
        { z:'Omgaan met geld leer je niet uit een boek.', g:1, al:2 },
        { z:'De wet regelt hoeveel uur een scholier mag werken.', g:0, al:6 },
        { z:'Een bijbaan kan een scholier alleen maar sterker maken.', g:1, al:6 }
      ] },
      { t:'raster', v:'Alinea 4: "Uit cijfers blijkt dat tachtig procent van de ouders vindt dat hun kind moet werken." Welke vragen stel je bij deze claim?', kol:['goede vraag', 'doet er niet toe'], rijen:[
        { z:'Uit welke cijfers, en wie heeft ze verzameld?', g:0 },
        { z:'Hoeveel ouders zijn er ondervraagd?', g:0 },
        { z:'Vinden die ouders dat hun kind vanaf vijftien moet werken, of pas later?', g:0 },
        { z:'Hoe oud is de zoon van de schrijver nu?', g:1 }
      ], u:'Een cijfer zonder bron kun je niet controleren. En "moet werken" kan van alles betekenen: elke week, of alleen in de zomer.' },
      { t:'open', v:'Een klasgenoot zegt: "Hij heeft supermarkten, dus het hele stuk is onzin." Ben je het daarmee eens? Leg uit.', m:'Nee. Zijn belang is een reden om extra kritisch te zijn, maar het maakt zijn argumenten niet vanzelf fout. Dat je met een bijbaan leert omgaan met geld en op tijd komen, kun je los van hem beoordelen.', r:3,
        u:'Een argument afwijzen alleen om wie het zegt, is zelf ook een drogreden: de persoonlijke aanval.' }
    ],
    argument:[
      { t:'open', v:'Wat is het standpunt van de schrijver?', m:'Elke scholier vanaf vijftien jaar zou een bijbaan moeten hebben.', r:1 },
      { t:'koppel', v:'In het stuk zitten drie drogredenen. Koppel elke plek aan de goede drogreden. Eén drogreden blijft over.', links:['Alinea 3: de hoogleraar op de verjaardag', 'Alinea 4: tachtig procent van de ouders', 'Alinea 5: de zoon van de schrijver'],
        rechts:['beroep op een autoriteit', 'beroep op de meerderheid', 'overhaaste generalisatie'], extra:['persoonlijke aanval'],
        u:'Een professor kan zich vergissen, en wat hij op een verjaardag zei, kun je niet nagaan. Dat veel mensen iets vinden, bewijst niets. En uit één zoon kun je geen conclusie trekken over alle scholieren.' }
    ],
    tussen:[
      { t:'keuze', v:'Alinea 6: "Ik heb in elk geval nog plaatsen vrij." Wat laat die zin tussen de regels zien?', o:['Dat hij dit stuk ook schrijft om personeel te vinden.', 'Dat zijn winkels het goed doen en snel groeien.', 'Dat hij jongeren gratis laat meewerken om te leren.'],
        u:'In alinea 1 schreef hij al dat het moeilijk is om scholieren te vinden. De laatste zin is eigenlijk een vacature.' },
      { t:'keuze', v:'Alinea 6 begint met "Natuurlijk moeten jongeren niet te veel uren maken." Waarom schrijft hij dat?', o:['Hij wil kritiek voor zijn en redelijk overkomen.', 'Hij vindt eigenlijk dat scholieren niet moeten werken.', 'Hij wil laten zien dat zijn zoon te veel werkte.'],
        u:'Hij geeft eerst een klein punt toe, zodat lezers hem eerder geloven als hij daarna met "Maar" zijn standpunt herhaalt.' }
    ],
    signaal:[
      { t:'keuze', v:'Alinea 3 begint met **Daarnaast**, alinea 4 met **Bovendien**. Wat doen die woorden in het stuk?', o:['Ze kondigen elk een volgend argument aan.', 'Ze kondigen elk een tegenargument aan.', 'Ze leiden elk de conclusie van het stuk in.'] },
      { t:'keuze', v:'Alinea 5: "Een bijbaan en school gaan **dus** prima samen." Welk verband geeft dus, en wat is daar het probleem?', o:['conclusie, maar die rust op maar één voorbeeld', 'tegenstelling, want hij spreekt zichzelf tegen', 'oorzaak, want de bijbaan zorgde voor het diploma'],
        u:'Dus leidt een conclusie in. Die conclusie gaat over alle scholieren, terwijl hij alleen zijn eigen zoon noemt.' }
    ]
  }
});

LEESBANK.T({
  id:'kritisch-oordopjes', niv:'3F', strat:'kritisch', titel:'Halve generatie straks doof door oordopjes', vorm:'artikel', bron:'NieuwsFlits.nl, rubriek Gezond',
  alineas:[
    'Jongeren die de hele dag oordopjes in hebben, lopen een groot risico om later slechthorend te worden. Dat blijkt uit nieuw onderzoek van de Hogeschool Midden-Nederland onder leerlingen van twee middelbare scholen in Amersfoort.',
    'De onderzoekers testten het gehoor van 240 leerlingen tussen de 13 en 17 jaar. Alle leerlingen vulden ook een vragenlijst in over hoe vaak en hoe hard ze muziek luisteren. Bij 31 van hen bleek het gehoor voor hoge tonen minder goed dan normaal. Na twee weken werden die leerlingen opnieuw getest. Bij de meesten was het gehoor toen weer helemaal hersteld.',
    'Toch zijn deskundigen ongerust. Volgens schattingen luistert inmiddels meer dan de helft van alle jongeren dagelijks te hard naar muziek. "Als je eenmaal blijvende gehoorschade hebt, gaat die niet meer weg," zegt een kno-arts tegen NieuwsFlits. "In het oor zitten kleine haarcellen die geluid doorgeven aan de hersenen. Als die kapotgaan, groeien ze niet terug."',
    'Ook leerlingen zelf merken iets. "Na een avondje gamen met mijn headset hoor ik soms een piep," vertelt Yara (15). "Maar die is de volgende ochtend weer weg." Haar klasgenoot Bram (16) maakt zich geen zorgen. "Mijn opa is ook doof, en die heeft nooit oordopjes gehad."',
    'De onderzoekers zelf zijn voorzichtiger. Zij benadrukken dat uit hun onderzoek niet blijkt of de oordopjes de oorzaak zijn. "Daarvoor moeten we leerlingen jarenlang volgen," aldus onderzoeker Priya Ramdin. Wel raadt ze iedereen aan om het volume niet hoger dan zestig procent te zetten en de oren na een uur luisteren even rust te geven.'
  ],
  naast:{ kop:'Uit het persbericht van de onderzoekers', bron:'Hogeschool Midden-Nederland, afdeling Audiologie', tekst:'Wij testten het gehoor van 240 leerlingen van twee scholen in Amersfoort. 31 leerlingen (13 procent) hoorden hoge tonen minder goed. Bij 22 van hen was dat na twee weken weer over. Of dit door oordopjes komt, blijkt niet uit dit onderzoek. Ons advies: zet het volume niet hoger dan 60 procent en luister niet langer dan 60 minuten achter elkaar.' },
  taken:{
    kritisch:[
      { t:'keuze', v:'Klopt de kop met wat de onderzoekers vonden?', o:['Nee: 31 van de 240 hoorden iets minder goed, en bij de meesten ging dat over.', 'Ja: meer dan de helft van de jongeren luistert te hard, dus de kop klopt.', 'Ja: de kno-arts zegt dat gehoorschade nooit meer weggaat, dus de kop klopt.'],
        u:'Van de 240 leerlingen hadden er 31 een probleem, en bij 22 van hen was het na twee weken over. Dat is lang geen "halve generatie".' },
      { t:'raster', v:'Waar komt elke bewering in het artikel vandaan?', kol:['het onderzoek', 'iemand die geïnterviewd is', 'geen bron genoemd'], rijen:[
        { z:'31 van de 240 leerlingen hoorden hoge tonen minder goed.', g:0, al:2 },
        { z:'Meer dan de helft van de jongeren luistert dagelijks te hard.', g:2, al:3 },
        { z:'Haarcellen in het oor groeien niet terug.', g:1, al:3 },
        { z:'Na een avond gamen met een headset hoor je soms een piep.', g:1, al:4 }
      ], u:'"Volgens schattingen" zegt niet wie er schatte. De kno-arts heeft geen naam, maar wordt wel geïnterviewd. Yara vertelt over haar eigen ervaring.' },
      { t:'raster', v:'Alinea 3: "Volgens schattingen luistert inmiddels meer dan de helft van alle jongeren dagelijks te hard naar muziek." Welke vragen stel je bij deze claim?', kol:['goede vraag', 'doet er niet toe'], rijen:[
        { z:'Wie heeft dat geschat, en hoe?', g:0 },
        { z:'Wat bedoelen ze precies met te hard?', g:0 },
        { z:'Gaat het om jongeren in Nederland of in de hele wereld?', g:0 },
        { z:'Op welke school zit Yara?', g:1 }
      ] },
      { t:'open', v:'Lees ook het persbericht. Welke bron vertrouw je meer over wat de onderzoekers ontdekten: het artikel of het persbericht? Leg uit waarom.', m:'Het persbericht: dat komt van de onderzoekers zelf en noemt de precieze cijfers, ook dat het bij 22 leerlingen overging. NieuwsFlits maakt het in de kop veel erger dan het is.', r:3,
        u:'Een hogeschool wil ook graag in het nieuws komen, maar over hun eigen uitkomsten zijn ze de beste bron.' }
    ],
    argument:[
      { t:'keuze', v:'Bram zegt: "Mijn opa is ook doof, en die heeft nooit oordopjes gehad." Wat klopt er niet aan die redenering?', o:['Dat doofheid ook andere oorzaken heeft, bewijst niet dat oordopjes veilig zijn.', 'Zijn opa is veel te oud om met een leerling van zestien te vergelijken.', 'Bram geeft geen argument maar alleen een mening over zijn eigen opa.'],
        u:'Ook als opa om een andere reden doof werd, kunnen oordopjes nog steeds schade doen.' },
      { t:'open', v:'Op welke informatie in het artikel lijkt de kop gebaseerd? Leg uit waarom dat geen goed bewijs is.', m:'Op de schatting dat meer dan de helft van de jongeren te hard luistert. Er staat niet bij wie dat schatte, en te hard luisteren betekent nog niet dat je doof wordt.', r:3 }
    ],
    doel:[
      { t:'keuze', v:'Waarom koos NieuwsFlits waarschijnlijk deze kop?', o:['Een kop die schrikt, zorgt dat meer mensen het artikel aanklikken.', 'De redactie wilde de uitkomst van het onderzoek kort samenvatten.', 'De onderzoekers vroegen de redactie om hun waarschuwing te herhalen.'],
        u:'De kop vat het onderzoek niet goed samen, en de onderzoekers zijn juist voorzichtig. Een spannende kop levert vooral klikken op.' },
      { t:'keuze', v:'Wat is het doel van de laatste zin van het persbericht?', o:['activeren: lezers aanzetten om zachter te luisteren', 'informeren: uitleggen hoe het onderzoek ging', 'overtuigen: lezers laten vinden dat oordopjes slecht zijn'] }
    ],
    tussen:[
      { t:'keuze', v:'Alinea 5 begint met "De onderzoekers zelf zijn voorzichtiger." Wat merk je daaraan?', o:['Het onderzoek zegt minder dan de kop doet geloven.', 'De onderzoekers zijn bang voor kritiek van kno-artsen.', 'De onderzoekers gebruiken zelf geen oordopjes.'] },
      { t:'keuze', v:'Yara zegt over de piep: "Maar die is de volgende ochtend weer weg." Wat denkt Yara waarschijnlijk?', o:['Dat de piep geen kwaad kan, omdat hij weer overgaat.', 'Dat ze haar headset beter kan weggooien.', 'Dat ze snel naar een kno-arts moet.'],
        u:'Met "Maar" maakt ze haar eigen klacht kleiner. Ze maakt zich er dus weinig zorgen over.' }
    ]
  }
});

LEESBANK.T({
  id:'kritisch-leerflow', niv:'3F', strat:'kritisch', titel:'LeerFlow: de hoofdband die je helpt leren', vorm:'website', bron:'Webwinkel van LeerFlow',
  blokken:[
    { kop:'LeerFlow: leer slimmer, niet harder', tekst:'Moeite om je te concentreren als je leert? De LeerFlow-hoofdband meet met drie sensoren je hersenactiviteit. Dwalen je gedachten af, dan trilt de band zachtjes. Zo train je jezelf om binnen twee weken gefocust te blijven. Geschikt voor elk vak en elke leeftijd. Klinisch bewezen: gebruikers halen tot 40 procent hogere cijfers.* Ontwikkeld in samenwerking met neurowetenschappers en aanbevolen door meer dan 1000 docenten. Van 149 euro voor 89 euro, alleen dit weekend!' },
    { kop:'Hoe werkt het?', lijst:[['Stap 1', 'Zet de band op en verbind hem met de app.'], ['Stap 2', 'Start een leersessie van 25 minuten.'], ['Stap 3', 'De band trilt als je afdwaalt. In de app zie je je focusscore.']] },
    { kop:'Reviews', lijst:[
      ['Merel (16), geverifieerde koper: 5 sterren', 'Sinds ik LeerFlow gebruik, haal ik voor wiskunde een 7 in plaats van een 5. Wel ga ik sinds kort ook naar bijles, dus misschien helpt dat ook.'],
      ['Docent Hans: 5 sterren', 'Als docent raad ik dit iedereen aan. Mijn leerlingen zijn veel rustiger.'],
      ['Ilias (17), geverifieerde koper: 2 sterren', 'De band trilt ook als ik gewoon even diep nadenk over een moeilijke som. Na een week werd ik er gek van.'],
      ['Anoniem: 5 sterren', 'Beste aankoop ooit!!! Iedereen moet dit hebben.']
    ] },
    { kop:'Kleine lettertjes', tekst:'* Gebaseerd op een enquête van LeerFlow onder 52 klanten die de band minstens een maand gebruikten. Klanten gaven zelf aan hoeveel hun cijfers waren gestegen. Alle reviews worden door LeerFlow gecontroleerd voordat ze online komen.' }
  ],
  naast:{ kop:'LeerFlow getest', bron:'Testlab Wijzer, onafhankelijk testbureau zonder banden met de maker', tekst:'Wij lieten twintig scholieren een maand lang leren met de LeerFlow en twintig scholieren zonder. De band zelf werkte goed en de app was makkelijk te gebruiken. Maar na die maand was er geen verschil in toetsresultaten tussen de twee groepen. Wel zeiden de gebruikers dat ze minder vaak op hun telefoon keken, omdat ze aan de band dachten. Volgens onze deskundige meten de sensoren vooral de spierspanning in je voorhoofd, niet je concentratie. Fronsen of je wenkbrauwen optrekken kan dus ook een trilling geven.' },
  taken:{
    kritisch:[
      { t:'raster', v:'Bovenaan staat: "Klinisch bewezen: gebruikers halen tot 40 procent hogere cijfers." Wat zeggen de kleine lettertjes daarover?', kol:['klopt', 'klopt niet', 'staat er niet'], rijen:[
        { z:'Het getal komt uit een enquête van LeerFlow zelf.', g:0 },
        { z:'Aan het onderzoek deden ruim duizend scholieren mee.', g:1 },
        { z:'De cijfers zijn door de scholen gecontroleerd.', g:1 },
        { z:'Alle klanten in de enquête zaten op de middelbare school.', g:2 },
        { z:'Alleen klanten die de band minstens een maand hadden, deden mee.', g:0 }
      ], u:'Er deden 52 klanten mee, en ze gaven zelf op hoeveel hun cijfers stegen. Of het scholieren waren, staat er niet.' },
      { t:'keuze', v:'Waarom past "klinisch bewezen" niet bij de kleine lettertjes?', o:['Klanten gaven zelf hun cijfers op, en er was geen groep zonder band.', 'Een klinisch onderzoek mag alleen in een ziekenhuis worden gedaan.', 'De enquête duurde korter dan de twee weken die de band nodig heeft.'],
        u:'Bij een echt onderzoek vergelijk je een groep met en een groep zonder band, en meet je de cijfers zelf. Dat deed Testlab Wijzer wel.' },
      { t:'raster', v:'De band is "aanbevolen door meer dan 1000 docenten". Welke vragen stel je bij die claim?', kol:['goede vraag', 'doet er niet toe'], rijen:[
        { z:'Wie zijn die docenten, en hoe zijn ze gevonden?', g:0 },
        { z:'Kregen ze iets voor hun aanbeveling?', g:0 },
        { z:'Hebben ze de band zelf met leerlingen getest?', g:0 },
        { z:'Hoeveel kost de band zonder korting?', g:1 }
      ] },
      { t:'open', v:'Welke bron vertrouw je meer: de website van LeerFlow of Testlab Wijzer? Geef twee redenen.', m:'Testlab Wijzer: het is onafhankelijk en vergeleek twintig scholieren met en twintig zonder band. LeerFlow verkoopt de band, vroeg het alleen aan eigen klanten en liet die zelf hun cijfers opgeven.', r:3 }
    ],
    argument:[
      { t:'keuze', v:'Merel haalt nu een 7 in plaats van een 5. Waarom bewijst dat niet dat de band werkt?', o:['Ze gaat ook naar bijles, en dat kan de oorzaak zijn.', 'Een 7 is nog altijd geen hoog cijfer voor wiskunde.', 'Merel gebruikt de band korter dan een maand.'],
        u:'Als er twee dingen tegelijk veranderen, weet je niet welke van de twee het verschil maakte.' },
      { t:'keuze', v:'De review van "Docent Hans" klinkt sterk. Welke drogreden zit erin?', o:['beroep op autoriteit: dat hij docent is, zegt niet dat de band werkt', 'beroep op de meerderheid: veel docenten zijn het met hem eens', 'overhaaste generalisatie: hij oordeelt na één enkele leerling'],
        u:'Hij noemt alleen dat hij docent is. Of hij echt docent is, en of de band iets met de rust te maken heeft, kun je niet nagaan.' }
    ],
    doel:[
      { t:'keuze', v:'Wat wil LeerFlow bereiken met "alleen dit weekend!"?', o:['Dat je koopt voordat je de band goed hebt kunnen vergelijken.', 'Dat je weet op welke dagen de webwinkel open is.', 'Dat je de band eerst een weekend gratis uitprobeert.'] },
      { t:'keuze', v:'Wat is het doel van de tekst van Testlab Wijzer?', o:['informeren: laten zien wat de band echt doet', 'overtuigen: je bij een andere winkel laten kopen', 'amuseren: grappige ervaringen van testers delen'] }
    ],
    signaal:[
      { t:'keuze', v:'Merel schrijft: "**Wel** ga ik sinds kort ook naar bijles." Welk verband geeft wel hier?', o:['een beperking: ze zet een kanttekening bij haar eigen verhaal', 'een opsomming: ze noemt nog een voordeel van de band', 'een oorzaak: ze legt uit waarom ze de band kocht'] },
      { t:'keuze', v:'Testlab Wijzer: "Fronsen of je wenkbrauwen optrekken kan **dus** ook een trilling geven." Welk verband geeft dus?', o:['conclusie', 'tegenstelling', 'tijd'],
        u:'De sensoren meten spierspanning. Daaruit volgt dat fronsen ook een trilling geeft. Dat verklaart meteen de review van Ilias.' }
    ]
  }
});

/* ---------- studerend lezen: leerteksten uit andere vakken ---------- */

/* ===== 1F ===== */

LEESBANK.T({
  id:'studerend-fotosynthese', niv:'1F', strat:'studerend', titel:'Hoe een plant zijn eigen voedsel maakt', vorm:'leertekst', bron:'Leertekst biologie',
  alineas:[
    'Een mens moet eten om te groeien. Een plant hoeft niet te eten. Hij maakt zijn eigen voedsel. Dat heet **fotosynthese**. Voor fotosynthese heeft een plant drie dingen nodig: licht, water en koolstofdioxide.',
    'Het water haalt de plant met zijn wortels uit de grond. Via de stengel gaat het naar de bladeren. Koolstofdioxide is een gas uit de lucht. Dat komt door kleine gaatjes in de bladeren naar binnen. Die gaatjes heten **huidmondjes**.',
    'In de bladeren zit een groene stof: **bladgroen**. Bladgroen vangt het licht van de zon op. Met de energie van dat licht maakt de plant van water en koolstofdioxide een soort suiker: **glucose**. Die suiker is het voedsel van de plant. Hij gebruikt hem om te groeien.',
    'Bij fotosynthese ontstaat ook zuurstof. De plant gebruikt daar zelf maar een klein deel van. De rest laat hij via de huidmondjes los in de lucht. Dat is goed nieuws voor ons, want mensen en dieren hebben zuurstof nodig om te ademen.'
  ],
  taken:{
    studerend:[
      { t:'markeer', v:'Markeer in alinea 3 twee kernwoorden.', al:2, n:2, goed:['bladgroen', 'licht', 'energie', 'glucose', 'suiker', 'voedsel', 'koolstofdioxide', 'groene stof'] },
      { t:'schema', v:'Zet de fotosynthese in een schema. Gebruik je eigen woorden.', vakken:['wat erin gaat', 'waar het gebeurt', 'wat de plant maakt', 'wat eruit gaat'],
        m:['licht, water en koolstofdioxide', 'in het bladgroen in de bladeren', 'glucose: suiker om van te groeien', 'zuurstof, via de huidmondjes'], vb:0 },
      { t:'koppel', v:'Overhoor jezelf. Welke uitleg hoort bij welk begrip? Eén uitleg blijft over.', links:['fotosynthese', 'huidmondjes', 'bladgroen', 'glucose'],
        rechts:['een plant maakt zijn eigen voedsel', 'kleine gaatjes in het blad', 'groene stof die licht opvangt', 'suiker waar de plant van groeit'], extra:['het deel dat water uit de grond haalt'],
        u:'Het deel dat water uit de grond haalt, zijn de wortels. Dat begrip staat niet links.' },
      { t:'keuze', v:'Welke vraag kan je docent NIET stellen met deze tekst?', o:['Hoeveel zuurstof maakt één boom per dag?', 'Waar komt het water voor fotosynthese vandaan?', 'Wat doet de plant met de zuurstof die ontstaat?'],
        u:'Hoeveel zuurstof een boom maakt, staat nergens in de tekst. De andere twee vragen kun je beantwoorden met alinea 2 en 4.' }
    ],
    samenvat:[
      { t:'open', v:'Vat de tekst samen in hoogstens 25 woorden.', max:25, m:'Met licht, water en koolstofdioxide maakt een plant in zijn bladeren suiker om te groeien. Daarbij komt zuurstof vrij.' }
    ],
    woord:[
      { t:'keuze', v:'Alinea 4: "Bij fotosynthese __ontstaat__ ook zuurstof." Wat betekent ontstaan hier?', o:['gemaakt worden', 'opgebruikt worden', 'opgenomen worden'],
        u:'Lees verder: de plant laat de zuurstof los in de lucht. De zuurstof is dus nieuw gemaakt.' }
    ],
    verwijs:[
      { t:'keuze', v:'Alinea 2: "__Dat__ komt door kleine gaatjes in de bladeren naar binnen." Naar welk woord verwijst Dat?', o:['koolstofdioxide', 'het water', 'de stengel'],
        u:'Kijk in de zin ervoor: koolstofdioxide is een gas uit de lucht. Dat gas komt door de gaatjes naar binnen.' },
      { t:'keuze', v:'Alinea 4: "De rest laat __hij__ via de huidmondjes los in de lucht." Wie is hij?', o:['de plant', 'de zuurstof', 'het blad'] }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van de tekst?', o:['hoe een plant zijn voedsel maakt', 'waarom mensen zuurstof nodig hebben', 'hoe wortels water uit de grond halen'],
        u:'Het onderwerp past bij de hele tekst. Zuurstof en wortels komen maar in één alinea voor.' }
    ]
  }
});

LEESBANK.T({
  id:'studerend-hunebedden', niv:'1F', strat:'studerend', titel:'De hunebedden in Drenthe', vorm:'leertekst', bron:'Leertekst geschiedenis',
  alineas:[
    'In Drenthe staan grote stapels zwerfkeien: de **hunebedden**. Ze zijn ongeveer 5000 jaar oud. Daarmee zijn ze ouder dan de piramides in Egypte. In Nederland zijn er nog 54 over. Bijna allemaal staan ze in Drenthe. Twee staan er in Groningen.',
    'Waar komen die enorme stenen vandaan? Ze lagen vroeger in Scandinavië. In een ijstijd, heel lang geleden, schoof een dikke laag ijs naar het zuiden. Het ijs nam de stenen mee. Toen het weer warmer werd, smolt het ijs. De stenen bleven liggen in Drenthe.',
    'De mensen die de hunebedden bouwden, waren boeren. Ze woonden op één plek, hielden koeien en verbouwden graan. We noemen ze het **Trechterbekervolk**. Die naam komt van hun potten: die hadden een rand in de vorm van een trechter.',
    'Een hunebed was een graf. Er werden veel mensen in begraven, vaak met potten en bijlen erbij. Hoe de boeren de zware stenen verplaatsten, weten we niet zeker. Waarschijnlijk rolden ze de stenen over boomstammen en trokken ze aan touwen.'
  ],
  taken:{
    studerend:[
      { t:'markeer', v:'Markeer in alinea 2 drie kernwoorden.', al:1, n:3, goed:['Scandinavië', 'ijstijd', 'ijs', 'stenen', 'zuiden', 'smolt', 'warmer', 'Drenthe', 'mee'] },
      { t:'schema', v:'Hoe kwamen de stenen in Drenthe? Zet het in een schema.', vakken:['stap 1', 'stap 2', 'stap 3', 'stap 4'],
        m:['de stenen liggen in Scandinavië', 'in de ijstijd schuift ijs naar het zuiden', 'het ijs neemt de stenen mee', 'het ijs smelt, de stenen blijven in Drenthe'], vb:0 },
      { t:'open', v:'Bedenk een toetsvraag over alinea 3 of 4, met het antwoord erbij.', m:'Waarom heet het volk het Trechterbekervolk? Omdat hun potten een rand hadden in de vorm van een trechter.', r:2 },
      { t:'keuze', v:'Welke vraag kan je docent NIET stellen met deze tekst?', o:['Hoe heet het grootste hunebed?', 'Hoe oud zijn de hunebedden ongeveer?', 'Waarvoor gebruikten de boeren een hunebed?'],
        u:'Over het grootste hunebed staat niets in de tekst. De leeftijd staat in alinea 1, het graf in alinea 4.' }
    ],
    alinea:[
      { t:'koppel', v:'Welk kopje hoort bij welke alinea? Eén kopje blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 3', 'Alinea 4'],
        rechts:['Ouder dan de piramides', 'Meegenomen door het ijs', 'Boeren met bijzondere potten', 'Een graf voor velen'], extra:['Hunebedden bezoeken in de zomer'] },
      { t:'keuze', v:'Wat is de kernzin van alinea 3?', o:['De mensen die de hunebedden bouwden, waren boeren.', 'Ze woonden op één plek, hielden koeien en verbouwden graan.', 'Die naam komt van hun potten.'],
        u:'De kernzin staat hier vooraan. De andere zinnen vertellen meer over die boeren.' }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van de tekst?', o:['de hunebedden', 'de ijstijd', 'potten van boeren'] },
      { t:'open', v:'Wat is de hoofdgedachte? Schrijf één zin: wat zegt de schrijver over de hunebedden?', m:'De hunebedden zijn 5000 jaar oude graven die boeren bouwden van stenen die het ijs had meegebracht.', r:2 }
    ],
    samenvat:[
      { t:'open', v:'Vat de tekst samen in hoogstens 30 woorden.', max:30, m:'De hunebedden in Drenthe zijn ongeveer 5000 jaar oud. Boeren bouwden er graven mee van stenen die het ijs uit Scandinavië had meegenomen.' }
    ]
  }
});

LEESBANK.T({
  id:'studerend-prijs', niv:'1F', strat:'studerend', titel:'Hoe ontstaat een prijs?', vorm:'leertekst', bron:'Leertekst economie',
  alineas:[
    'Waarom kost een bakje aardbeien in juni minder dan in december? Dat heeft te maken met **vraag** en **aanbod**. De vraag is hoeveel mensen iets willen kopen. Het aanbod is hoeveel er te koop is.',
    'In juni zijn er in Nederland veel aardbeien. De boeren plukken er meer dan ze makkelijk kunnen verkopen. Het aanbod is dan groot. Om toch alles te verkopen, verlagen de winkels de prijs. Een bakje is dan goedkoop.',
    'In december groeien er hier buiten geen aardbeien. Ze komen dan uit een warme kas of uit een ver land. Er zijn weinig aardbeien, dus het aanbod is klein. Toch willen sommige mensen ze graag hebben, bijvoorbeeld voor een taart. Wie ze wil, moet er meer voor betalen.',
    'Ook de vraag kan veranderen. Vlak voor Valentijnsdag willen veel mensen rozen kopen. De vraag wordt dan groter dan het aanbod. Daarom gaat de prijs van rozen omhoog. Een week later wil bijna niemand ze nog kopen. Dan daalt de prijs weer.',
    'Kort gezegd: is de vraag groot en het aanbod klein, dan stijgt de prijs. Is het aanbod groot en de vraag klein, dan daalt de prijs.'
  ],
  taken:{
    studerend:[
      { t:'markeer', v:'Markeer in alinea 1 twee kernwoorden.', al:0, n:2, goed:['vraag', 'aanbod', 'kopen', 'te koop', 'willen kopen'] },
      { t:'schema', v:'Zet alinea 3 in een schema van oorzaak en gevolg.', vakken:['oorzaak', 'gevolg voor het aanbod', 'gevolg voor de prijs'],
        m:['in december groeien hier geen aardbeien', 'weinig aardbeien: het aanbod is klein', 'de prijs gaat omhoog'], vb:0 },
      { t:'koppel', v:'Overhoor jezelf. Welke uitleg hoort bij welk begrip? Eén uitleg blijft over.', links:['vraag', 'aanbod', 'de prijs stijgt', 'de prijs daalt'],
        rechts:['hoeveel mensen iets willen kopen', 'hoeveel er te koop is', 'grote vraag, klein aanbod', 'groot aanbod, kleine vraag'], extra:['vraag en aanbod zijn even groot'] },
      { t:'keuze', v:'Welke vraag kan je docent NIET stellen met deze tekst?', o:['Hoeveel kost een bakje aardbeien in juni?', 'Waarom zijn aardbeien in december duur?', 'Wat gebeurt er met de prijs na Valentijnsdag?'],
        u:'De tekst noemt geen bedragen. Je weet alleen dat aardbeien in juni goedkoop zijn.' }
    ],
    alinea:[
      { t:'koppel', v:'Wat doet de alinea? Koppel. Eén functie blijft over.', links:['Alinea 1', 'Alinea 4', 'Alinea 5'],
        rechts:['inleiden: een vraag stellen en de begrippen uitleggen', 'een voorbeeld geven waarin de vraag verandert', 'de regel kort samenvatten'], extra:['een mening geven over dure aardbeien'],
        u:'Alinea 5 begint met "Kort gezegd". Dat is een teken dat er een samenvatting komt.' }
    ],
    woord:[
      { t:'keuze', v:'Alinea 3: "Ze komen dan uit een warme __kas__." Wat is een kas?', o:['een glazen gebouw waar planten in groeien', 'een koude opslag waar fruit in ligt', 'een grote winkel met groente en fruit'],
        u:'Buiten groeien geen aardbeien in december. In een warme kas kunnen ze wel groeien.' }
    ],
    verwijs:[
      { t:'keuze', v:'Alinea 3: "__Ze__ komen dan uit een warme kas of uit een ver land." Naar wie of wat verwijst Ze?', o:['de aardbeien', 'de boeren', 'de winkels'] },
      { t:'keuze', v:'Alinea 4: "Een week later wil bijna niemand __ze__ nog kopen." Naar wie of wat verwijst ze?', o:['de rozen', 'de mensen', 'de prijzen'] }
    ]
  }
});

/* ===== 2F ===== */

LEESBANK.T({
  id:'studerend-drijven', niv:'2F', strat:'studerend', titel:'Waarom een schip blijft drijven', vorm:'leertekst', bron:'Leertekst natuurkunde',
  alineas:[
    'Gooi een spijker in het water en hij zinkt meteen. Een containerschip van staal, dat miljarden keren zwaarder is, blijft gewoon drijven. Hoe kan dat? Het antwoord heeft te maken met twee krachten die tegen elkaar in werken.',
    'De eerste kracht is de **zwaartekracht**. Die trekt het schip naar beneden, naar de bodem van de zee. Hoe zwaarder het schip is, hoe groter deze kracht. De tweede kracht is de **opwaartse kracht**. Het water duwt van onderen tegen het schip en drukt het omhoog.',
    'Hoe groot de opwaartse kracht is, ontdekte een Griekse geleerde al meer dan tweeduizend jaar geleden. Een voorwerp in water duwt water opzij. De opwaartse kracht is precies even groot als het gewicht van dat verplaatste water. Dit heet de **wet van Archimedes**.',
    'Nu wordt duidelijk waarom de vorm van een schip zo belangrijk is. Een spijker is klein en massief. Hij duwt maar heel weinig water opzij, dus de opwaartse kracht is kleiner dan zijn gewicht. Een schip is van binnen grotendeels hol en heeft een brede romp. Daardoor zakt het een stukje in het water en duwt het een enorme hoeveelheid water opzij. Zodra het gewicht van dat water even groot is als het gewicht van het schip, zakt het niet verder. Het schip drijft.',
    'Dat zie je ook als een schip geladen wordt. Met een zware lading zakt het dieper weg, want het moet dan meer water verplaatsen. Op de romp staan daarom streepjes: de **lastlijnen**. Komt het water boven de lijn, dan is het schip te zwaar beladen en is varen niet meer veilig. In zout zeewater ligt een schip overigens iets hoger dan in zoet rivierwater, want zout water is zwaarder.'
  ],
  taken:{
    studerend:[
      { t:'markeer', v:'Markeer in alinea 3 drie kernwoorden.', al:2, n:3, goed:['opwaartse kracht', 'gewicht', 'verplaatste water', 'opzij', 'even groot', 'wet van Archimedes', 'Archimedes', 'water'] },
      { t:'schema', v:'Wat gebeurt er als een schip te water gaat? Zet het in stappen.', vakken:['stap 1', 'stap 2', 'stap 3', 'stap 4'],
        m:['het schip zakt een stukje in het water', 'het duwt water opzij', 'de opwaartse kracht wordt groter', 'gewicht verplaatst water is gewicht schip: het drijft'], vb:0 },
      { t:'koppel', v:'Overhoor jezelf. Welke uitleg hoort bij welk begrip? Eén uitleg blijft over.', links:['zwaartekracht', 'opwaartse kracht', 'wet van Archimedes', 'lastlijn'],
        rechts:['trekt het schip naar beneden', 'het water duwt het schip omhoog', 'opwaartse kracht is het gewicht van het verplaatste water', 'streep die laat zien hoe diep een schip mag liggen'],
        extra:['kracht waarmee de motor het schip vooruit duwt'] },
      { t:'open', v:'Je docent stelt deze toetsvraag: "Waarom zinkt een spijker, terwijl een stalen schip blijft drijven?" Schrijf je antwoord.', r:3,
        m:'Een spijker is klein en massief en verplaatst weinig water, dus de opwaartse kracht is kleiner dan zijn gewicht. Een schip is hol en breed en verplaatst zoveel water dat de opwaartse kracht even groot wordt als zijn gewicht.' },
      { t:'keuze', v:'Welke vraag kan je docent NIET stellen met deze tekst?', o:['Hoe snel vaart een groot containerschip?', 'Waarom ligt een geladen schip dieper?', 'Welke twee krachten werken op een schip?'],
        u:'Over snelheid staat niets in de tekst. De andere vragen beantwoord je met alinea 2 en 5.' }
    ],
    samenvat:[
      { t:'open', v:'Vat de tekst samen in hoogstens 40 woorden. Gebruik de begrippen zwaartekracht en opwaartse kracht.', max:40,
        m:'Op een schip werken zwaartekracht en opwaartse kracht. De opwaartse kracht is even groot als het gewicht van het verplaatste water. Een hol, breed schip verplaatst veel water en blijft daardoor drijven.' }
    ],
    woord:[
      { t:'keuze', v:'Alinea 4: "Een spijker is klein en __massief__." Wat betekent massief?', o:['helemaal vol, zonder holle ruimte', 'heel zwaar en van ijzer gemaakt', 'rond en glad van vorm'],
        u:'Een paar zinnen verder staat het tegenovergestelde: een schip is van binnen hol.' },
      { t:'keuze', v:'Alinea 4: "Een schip heeft een brede __romp__." Wat is de romp?', o:['het lijf van het schip dat in het water ligt', 'de motor onder in het schip', 'het dek waar de lading op staat'],
        u:'In alinea 5 staan de lastlijnen op de romp, en het water komt tot aan die lijnen. De romp ligt dus in het water.' }
    ],
    verwijs:[
      { t:'keuze', v:'Alinea 2: "__Die__ trekt het schip naar beneden." Naar welk woord verwijst Die?', o:['de zwaartekracht', 'de opwaartse kracht', 'de bodem van de zee'] },
      { t:'keuze', v:'Alinea 5: "Met een zware lading zakt het dieper weg, want __het__ moet dan meer water verplaatsen." Waar verwijst het naar?', o:['het schip', 'het water', 'de lading'],
        u:'Vul in: want het schip moet dan meer water verplaatsen. Lading is een de-woord, dus het kan daar niet naar verwijzen.' }
    ]
  }
});

LEESBANK.T({
  id:'studerend-wet', niv:'2F', strat:'studerend', titel:'Van voorstel tot wet', vorm:'leertekst', bron:'Leertekst maatschappijleer',
  alineas:[
    'In Nederland gelden duizenden wetten. Ze regelen bijvoorbeeld hoe oud je moet zijn voor een scooterrijbewijs en hoeveel uur je als scholier mag werken. Maar hoe komt zo’n wet er eigenlijk? Dat gaat in een vaste reeks stappen, en dat kan best een paar jaar duren.',
    'Meestal begint het bij de regering. Een minister laat ambtenaren een **wetsvoorstel** schrijven: een tekst waarin precies staat wat de nieuwe regel wordt. Ook leden van de Tweede Kamer mogen zelf een wetsvoorstel indienen, maar dat gebeurt minder vaak. Voordat het voorstel verder gaat, geeft de **Raad van State** advies. Deze raad kijkt of de wet goed in elkaar zit en of hij niet botst met andere wetten. De regering hoeft het advies niet op te volgen, maar doet dat vaak wel.',
    'Daarna is de **Tweede Kamer** aan de beurt. De 150 Kamerleden stellen vragen aan de minister en debatteren over het voorstel. Zij mogen het ook veranderen. Zo’n wijziging heet een **amendement**. Aan het eind stemmen de Kamerleden. Is de meerderheid voor, dan gaat het voorstel naar de Eerste Kamer.',
    'De **Eerste Kamer** heeft 75 leden. Zij kijken vooral of de wet goed uit te voeren is en of hij klopt met de Grondwet. Anders dan de Tweede Kamer mag de Eerste Kamer niets meer aan het voorstel veranderen. Ze kan alleen voor of tegen stemmen. Stemt ze tegen, dan komt de wet er niet.',
    'Is ook de Eerste Kamer akkoord, dan zetten de koning en de minister hun handtekening onder de wet. Ten slotte wordt de wet bekendgemaakt in het **Staatsblad**. Pas daarna kan de wet ingaan en moet iedereen zich eraan houden.'
  ],
  taken:{
    studerend:[
      { t:'markeer', v:'Markeer in alinea 4 drie kernwoorden.', al:3, n:3, goed:['Eerste Kamer', '75', 'uit te voeren', 'Grondwet', 'niets meer', 'veranderen', 'voor of tegen', 'tegen', 'stemmen'] },
      { t:'schema', v:'Zet de weg van een wet in een schema. Gebruik je eigen woorden.', vakken:['stap 1', 'stap 2', 'stap 3', 'stap 4', 'stap 5'],
        m:['minister laat een wetsvoorstel schrijven', 'Raad van State geeft advies', 'Tweede Kamer debatteert, wijzigt en stemt', 'Eerste Kamer stemt voor of tegen', 'handtekeningen en bekendmaking in het Staatsblad'], vb:0 },
      { t:'koppel', v:'Overhoor jezelf. Welke uitleg hoort bij welk begrip? Eén uitleg blijft over.', links:['wetsvoorstel', 'amendement', 'Raad van State', 'Staatsblad'],
        rechts:['tekst met een nieuwe regel die nog goedgekeurd moet worden', 'wijziging in een wetsvoorstel', 'geeft advies voordat het voorstel naar de Kamer gaat', 'hierin wordt een nieuwe wet bekendgemaakt'],
        extra:['mag alleen voor of tegen een voorstel stemmen'], u:'Alleen voor of tegen stemmen: dat is de Eerste Kamer, en die staat niet links.' },
      { t:'keuze', v:'Welke vraag kan je docent NIET stellen met deze tekst?', o:['Hoeveel wetten komen er elk jaar bij?', 'Wat mag de Eerste Kamer niet doen?', 'Wie geeft advies over een wetsvoorstel?'],
        u:'De tekst zegt dat er duizenden wetten zijn, maar niet hoeveel er per jaar bijkomen.' },
      { t:'open', v:'Bedenk een toetsvraag over alinea 3 of 4, met het antwoord erbij.', r:2,
        m:'Wat mag de Tweede Kamer wel en de Eerste Kamer niet? Het wetsvoorstel veranderen met een amendement.' }
    ],
    alinea:[
      { t:'keuze', v:'Wat doet alinea 1?', o:['het onderwerp inleiden met een vraag', 'de stappen kort samenvatten', 'uitleggen wat de Grondwet is'],
        u:'Alinea 1 stelt de vraag waar de rest van de tekst antwoord op geeft: hoe komt een wet er?' },
      { t:'keuze', v:'Welke zin is de kernzin van alinea 3?', o:['Daarna is de Tweede Kamer aan de beurt.', 'Zo’n wijziging heet een amendement.', 'Aan het eind stemmen de Kamerleden.'],
        u:'De hele alinea gaat over wat de Tweede Kamer doet. De andere zinnen zijn delen daarvan.' }
    ],
    onderwerp:[
      { t:'keuze', v:'Welke titel past ook goed bij de tekst?', o:['Zo komt een wet tot stand', 'Waarom we wetten nodig hebben', 'Wat de koning allemaal doet'] },
      { t:'open', v:'Wat is de hoofdgedachte? Schrijf één zin.', r:2,
        m:'Een wet komt er in vaste stappen: voorstel, advies, Tweede Kamer, Eerste Kamer en ten slotte handtekeningen en bekendmaking.' }
    ],
    samenvat:[
      { t:'open', v:'Vat de tekst samen in hoogstens 40 woorden.', max:40,
        m:'Een minister laat een wetsvoorstel schrijven en de Raad van State geeft advies. De Tweede Kamer mag het veranderen en stemt. De Eerste Kamer stemt alleen voor of tegen. Daarna tekenen koning en minister.' }
    ],
    verwijs:[
      { t:'keuze', v:'Alinea 3: "Zij mogen __het__ ook veranderen." Waar verwijst het naar?', o:['het voorstel', 'het debat', 'het amendement'],
        u:'Vul in: zij mogen het voorstel ook veranderen. Het amendement is juist die verandering zelf.' },
      { t:'keuze', v:'Alinea 4: "__Ze__ kan alleen voor of tegen stemmen." Wie is ze?', o:['de Eerste Kamer', 'de Tweede Kamer', 'de Grondwet'] }
    ]
  }
});

LEESBANK.T({
  id:'studerend-spijsvertering', niv:'2F', strat:'studerend', titel:'De reis van een boterham', vorm:'leertekst', bron:'Leertekst biologie',
  alineas:[
    'Je eet een boterham met kaas. Pas een dag of twee later is de reis van dat eten door je lichaam helemaal klaar. Onderweg wordt het in steeds kleinere deeltjes verdeeld, tot de voedingsstoffen klein genoeg zijn om in je bloed te komen. Dat proces heet **vertering**. Alle organen die daarbij helpen, noem je samen het **spijsverteringsstelsel**.',
    'De vertering begint al in je **mond**. Je tanden malen het eten fijn. Ondertussen maken je speekselklieren speeksel. Dat maakt de hap nat en glad, zodat je hem makkelijk doorslikt. Speeksel begint ook al met het afbreken van zetmeel, een stof die in brood zit.',
    'Via de **slokdarm** gaat de hap naar je maag. De slokdarm is een gespierde buis. De spieren in de wand trekken achter de hap samen en duwen hem zo naar beneden. Daarom kun je zelfs eten doorslikken als je op je hoofd staat.',
    'In de **maag** blijft het eten een paar uur. De maagwand maakt maagsap, waar een sterk zuur in zit. Dat zuur doodt de meeste bacteriën die met het eten zijn meegekomen. Bovendien begint de maag met het verteren van eiwitten, bijvoorbeeld uit de kaas. De maag kneedt alles tot een dikke brij.',
    'Daarna komt de brij in de **dunne darm**, een opgerolde buis van ongeveer zes meter. Hier wordt het meeste verteerd. De voedingsstoffen gaan door de darmwand heen in je bloed. Wat je lichaam niet kan gebruiken, gaat door naar de **dikke darm**. Die haalt er nog veel water uit. De resten die overblijven, verlaten je lichaam als ontlasting.'
  ],
  taken:{
    studerend:[
      { t:'markeer', v:'Markeer in alinea 5 drie kernwoorden.', al:4, n:3, goed:['dunne darm', 'zes meter', 'meeste verteerd', 'voedingsstoffen', 'bloed', 'darmwand', 'dikke darm', 'water', 'ontlasting'] },
      { t:'schema', v:'Zet de reis van het eten in een schema. Schrijf bij elk orgaan wat er gebeurt.', vakken:['mond', 'slokdarm', 'maag', 'dunne darm', 'dikke darm'],
        m:['tanden malen, speeksel maakt de hap glad', 'spieren duwen de hap naar de maag', 'zuur doodt bacteriën, eiwitten worden verteerd', 'voedingsstoffen gaan in het bloed', 'er wordt water uit gehaald'], vb:0 },
      { t:'open', v:'Overhoor jezelf. Dek de tekst af en beantwoord: waarom kun je eten doorslikken als je op je hoofd staat?', r:2,
        m:'Omdat de spieren in de wand van de slokdarm de hap naar de maag duwen. Daar is de zwaartekracht niet voor nodig.' },
      { t:'keuze', v:'Welke vraag kan je docent NIET stellen met deze tekst?', o:['Hoe lang is de dikke darm?', 'Wat doet het zuur in de maag?', 'Waar gaan voedingsstoffen het bloed in?'],
        u:'De tekst geeft alleen de lengte van de dunne darm: ongeveer zes meter.' }
    ],
    alinea:[
      { t:'koppel', v:'Welk kopje hoort bij welke alinea? Eén kopje blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 3', 'Alinea 4', 'Alinea 5'],
        rechts:['Een lange reis door je lichaam', 'Kauwen en speeksel', 'Een gespierde buis', 'Zuur en kneden', 'Opnemen en indikken'], extra:['Gezond eten voor sporters'] },
      { t:'keuze', v:'Wat doet alinea 1 vooral?', o:['inleiden en twee begrippen uitleggen', 'een voorbeeld geven bij de maag', 'de hele tekst samenvatten'],
        u:'Alinea 1 legt uit wat vertering en het spijsverteringsstelsel zijn. Daarna volgen de organen een voor een.' }
    ],
    woord:[
      { t:'keuze', v:'Alinea 4: "De maag __kneedt__ alles tot een dikke brij." Wat betekent kneden hier?', o:['steeds knijpen en door elkaar mengen', 'warm maken tot het zacht wordt', 'wegspoelen met veel water'],
        u:'Denk aan deeg kneden: je knijpt en mengt tot het één massa wordt. Een brij is zo’n dikke massa.' },
      { t:'keuze', v:'Alinea 3: "De slokdarm is een __gespierde__ buis." Wat betekent gespierd hier?', o:['met spieren erin', 'heel lang en dun', 'met een harde wand'],
        u:'De zin erna zegt het: de spieren in de wand trekken samen.' }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is de hoofdgedachte van de tekst?', o:['Eten wordt onderweg door je lichaam steeds kleiner gemaakt, tot voedingsstoffen in je bloed komen.', 'In je maag zit een sterk zuur dat de meeste bacteriën uit je eten doodt.', 'De dunne darm is een opgerolde buis die ongeveer zes meter lang is.'],
        u:'De tweede en derde zin passen maar bij één alinea. De hoofdgedachte past bij de hele tekst.' }
    ]
  }
});

/* ===== 3F ===== */

LEESBANK.T({
  id:'studerend-roest', niv:'3F', strat:'studerend', titel:'Waarom ijzer roest', vorm:'leertekst', bron:'Leertekst scheikunde',
  alineas:[
    'Een fiets die een winter buiten staat, krijgt bruine plekken op de ketting en het stuur. Een spijker in een vochtige schuur verandert langzaam in een bros, oranjebruin staafje. Dat verschijnsel kent iedereen: het ijzer roest. Voor scheikundigen is roesten een duidelijk voorbeeld van een **chemische reactie**. Er ontstaat een nieuwe stof met heel andere eigenschappen dan het ijzer waarmee je begon.',
    'Voor roest zijn drie stoffen nodig: ijzer, zuurstof en water. Ontbreekt een van de drie, dan roest het ijzer nauwelijks. Een spijker in droge lucht blijft daarom lang mooi, en ook een spijker in water waar alle zuurstof uit is gehaald, roest bijna niet. Bij de reactie verbindt het ijzer zich met zuurstof tot **ijzeroxide**, de bruine stof die we roest noemen. Zo’n reactie met zuurstof heet een **oxidatie**. Roest is overigens geen zuiver ijzeroxide: er zit ook water in gebonden.',
    'Sommige omstandigheden versnellen het proces. Zout is daar het beruchtste voorbeeld van. Zout water geleidt elektrische stroom veel beter dan zuiver water, en bij roesten spelen kleine elektrische stroompjes een rol. Auto’s die in de winter over gestrooide wegen rijden, en schepen op zee, hebben daarom extra last van roest. Ook warmte versnelt de reactie.',
    'Wat roest zo verraderlijk maakt, is dat het niet bij de buitenkant blijft. De roestlaag is **poreus**: er zitten talloze gaatjes en scheurtjes in. Bovendien neemt roest meer ruimte in dan het ijzer waaruit het ontstond, zodat de laag gaat bladderen en afbrokkelt. Zuurstof en water kunnen zo steeds opnieuw bij het verse ijzer eronder komen. Een ijzeren hek kan op die manier na jaren dwars doorgeroest zijn. Aluminium gedraagt zich heel anders. Ook dat metaal reageert met zuurstof, maar het oxide vormt een dun, dicht laagje dat stevig vastzit. Dat laagje schermt het metaal eronder af, waardoor de aantasting vanzelf stopt.',
    'Mensen hebben verschillende manieren bedacht om ijzer te beschermen. De eenvoudigste is het ijzer afsluiten van lucht en vocht, met verf, een laag kunststof of olie. Die bescherming werkt alleen zolang de laag heel is: een kras is genoeg om het roesten te laten beginnen. Slimmer is **verzinken**. Het ijzer krijgt dan een laagje zink. Ontstaat er toch een kras, dan reageert eerst het zink en blijft het ijzer gespaard. Het zink offert zich als het ware op. Lantaarnpalen en vangrails zijn daarom vaak verzinkt.',
    'Een derde oplossing is het ijzer mengen met andere metalen. **Roestvrij staal**, waar bijvoorbeeld pannen en bestek van gemaakt zijn, bevat minstens 10,5 procent chroom. Het chroom vormt aan het oppervlak, net als bij aluminium, een dun en dicht oxidelaagje. Raakt dat laagje beschadigd, dan herstelt het zich vanzelf met zuurstof uit de lucht.'
  ],
  taken:{
    studerend:[
      { t:'markeer', v:'Markeer in alinea 2 drie kernwoorden. Markeer geen voorbeelden.', al:1, n:3, goed:['drie stoffen', 'ijzer', 'zuurstof', 'water', 'ijzeroxide', 'oxidatie', 'verbindt', 'roest'],
        u:'De spijker in droge lucht is een voorbeeld. De kern is: ijzer, zuurstof en water geven samen ijzeroxide.' },
      { t:'schema', v:'Waarom roest ijzer steeds dieper door? Zet alinea 4 in een schema van oorzaak en gevolg.', vakken:['oorzaak', 'gevolg 1', 'gevolg 2', 'gevolg 3'],
        m:['roest is poreus en neemt meer ruimte in', 'de roestlaag bladdert af', 'zuurstof en water bereiken vers ijzer', 'het ijzer roest steeds verder door'], vb:0 },
      { t:'koppel', v:'Overhoor jezelf. Welke uitleg hoort bij welk begrip? Eén uitleg blijft over.', links:['oxidatie', 'poreus', 'verzinken', 'roestvrij staal'],
        rechts:['reactie van een stof met zuurstof', 'vol kleine gaatjes en scheurtjes', 'ijzer bedekken met een laagje zink', 'ijzer gemengd met minstens 10,5 procent chroom'],
        extra:['ijzer afsluiten met verf of olie'], u:'Afsluiten met verf of olie is de eenvoudigste bescherming uit alinea 5, maar daar staat links geen begrip voor.' },
      { t:'open', v:'Je docent stelt deze toetsvraag: "Leg uit waarom een verzinkte vangrail met een kras toch niet gaat roesten." Schrijf je antwoord.', r:3,
        m:'Bij een kras reageert eerst het zink met zuurstof en water. Het zink offert zich op, zodat het ijzer eronder gespaard blijft.' },
      { t:'keuze', v:'Welke vraag kan je docent NIET stellen met deze tekst?', o:['Bij welke temperatuur smelt ijzer?', 'Waarom roest een auto sneller in de winter?', 'Waarom is roest schadelijker dan aluminiumoxide?'],
        u:'Over smelten staat niets in de tekst. De winter staat in alinea 3, aluminium in alinea 4.' }
    ],
    samenvat:[
      { t:'open', v:'Vat de tekst samen in hoogstens 60 woorden. Noem wat roest is, waarom het zo schadelijk is en hoe je ijzer beschermt.', max:60,
        m:'IJzer roest als het met zuurstof en water reageert tot ijzeroxide; zout en warmte versnellen dat. De roestlaag is poreus en bladdert af, zodat het ijzer steeds verder doorroest. Je beschermt ijzer met verf of olie, door verzinken of door er chroom aan toe te voegen, zoals bij roestvrij staal.' }
    ],
    woord:[
      { t:'keuze', v:'Alinea 3: "Zout is daar het __beruchtste__ voorbeeld van." Wat betekent berucht?', o:['bekend om iets slechts', 'al heel lang bekend', 'zeldzaam en weinig bekend'],
        u:'Zout zorgt voor extra roest bij auto’s en schepen. Het is bekend, maar dan om iets wat schade doet.' },
      { t:'keuze', v:'Alinea 4: "Wat roest zo __verraderlijk__ maakt, is dat het niet bij de buitenkant blijft." Wat betekent verraderlijk hier?', o:['gevaarlijker dan je aan de buitenkant ziet', 'snel en goed te zien', 'alleen gevaarlijk voor schepen'],
        u:'De schade gaat onder de roestlaag gewoon door. Van buiten lijkt het minder erg dan het is.' }
    ],
    alinea:[
      { t:'keuze', v:'Welke zin is de kernzin van alinea 4?', o:['Wat roest zo verraderlijk maakt, is dat het niet bij de buitenkant blijft.', 'Een ijzeren hek kan op die manier na jaren dwars doorgeroest zijn.', 'Aluminium gedraagt zich heel anders.'],
        u:'De eerste zin noemt het punt. Het hek is een voorbeeld, en aluminium is een vergelijking.' },
      { t:'keuze', v:'In alinea 4 gaat het ineens over aluminium. Waarom doet de schrijver dat?', o:['om met een tegenstelling te laten zien waarom roest zo schadelijk is', 'om een tweede metaal te noemen dat net zo snel roest als ijzer', 'om uit te leggen hoe je ijzer met een laag aluminium beschermt'],
        u:'Het laagje op aluminium blijft dicht en zit vast; roest bladdert juist af. Door dat verschil zie je beter waarom ijzer blijft doorroesten.' }
    ]
  }
});

LEESBANK.T({
  id:'studerend-bodemdaling', niv:'3F', strat:'studerend', titel:'Een land dat langzaam zakt', vorm:'leertekst', bron:'Leertekst aardrijkskunde',
  alineas:[
    'Wie door het westen van Nederland fietst, merkt het meestal niet, maar het land onder de wielen ligt vaak lager dan de zee. Ongeveer een kwart van Nederland ligt onder zeeniveau. Het laagste punt, in een polder bij Nieuwerkerk aan den IJssel, ligt bijna zeven meter onder NAP, het peil waarmee we in Nederland hoogtes meten. Minder bekend is dat een groot deel van dat lage land nog steeds verder zakt. Die **bodemdaling** is voor een belangrijk deel door de mens zelf veroorzaakt.',
    'Om dat te begrijpen, moet je weten waaruit de bodem bestaat. In grote delen van West- en Noord-Nederland zit onder het gras een dikke laag **veen**. Veen is in duizenden jaren ontstaan in moerassen, uit resten van planten zoals mos en riet. Omdat die resten onder water lagen, kwam er geen zuurstof bij en vergingen ze niet. Ze stapelden zich laag op laag op. Nat veen is zo zacht als een spons en bestaat voor het grootste deel uit water.',
    'Vanaf de middeleeuwen wilden boeren het moerassige land gebruiken voor akkers en weilanden. Ze groeven sloten om het water af te voeren. Dat **ontwateren** had twee gevolgen. Doordat het water eruit liep, zakte het veen in elkaar, zoals een spons die je uitknijpt. Dit noemen we **inklinken**. Bovendien kwam het droge veen in contact met zuurstof. Bacteriën gingen de plantenresten afbreken, waarbij koolstofdioxide vrijkomt. Het veen verdween dus letterlijk in de lucht.',
    'Zo ontstond een vicieuze cirkel. Hoe lager het land kwam te liggen, hoe natter het werd. De boeren en later de waterschappen moesten het water daarom steeds verder wegpompen, eerst met windmolens en later met gemalen. Maar elke keer dat het waterpeil omlaag ging, kwam er weer een laag veen droog te liggen, die opnieuw inklonk en verteerde. In sommige veenweidegebieden daalt de bodem daardoor nog altijd bijna een centimeter per jaar.',
    'Die daling brengt problemen met zich mee. In oude steden staan veel huizen op houten palen. Zolang die palen onder water staan, blijven ze goed, maar als het grondwater zakt, kunnen ze gaan rotten. Wegen en leidingen verzakken, en uit het verdwijnende veen komt elk jaar veel koolstofdioxide vrij, een broeikasgas.',
    'Er wordt daarom gezocht naar manieren om het zakken af te remmen. Een voor de hand liggende oplossing is het waterpeil weer omhoog te brengen, zodat het veen nat blijft. Dat botst echter met het gebruik van het land: koeien en zware machines zakken weg in een drassige wei. Sommige boeren leggen daarom buizen in de grond die water juist de bodem in brengen. Anderen proberen gewassen die in natte grond groeien, zoals lisdodde. Het zakken helemaal stoppen lukt waarschijnlijk niet, maar het flink vertragen wel.'
  ],
  taken:{
    studerend:[
      { t:'markeer', v:'Markeer in alinea 3 vier kernwoorden. Markeer geen vergelijkingen of voorbeelden.', al:2, n:4,
        goed:['ontwateren', 'sloten', 'inklinken', 'in elkaar', 'zuurstof', 'bacteriën', 'afbreken', 'koolstofdioxide', 'droge veen', 'twee gevolgen'],
        u:'De spons is een vergelijking om het uit te leggen. De kern: ontwateren laat het veen inklinken en, met zuurstof, afbreken.' },
      { t:'schema', v:'Zet de vicieuze cirkel uit alinea 3 en 4 in een schema. Het laatste vak leidt weer naar het eerste.', vakken:['stap 1', 'stap 2', 'stap 3', 'stap 4'],
        m:['water afvoeren: het veen wordt droog', 'veen klinkt in en verteert: het land zakt', 'het land wordt natter', 'het waterpeil gaat verder omlaag'], vb:0 },
      { t:'koppel', v:'Overhoor jezelf. Welke uitleg hoort bij welk begrip? Eén uitleg blijft over.', links:['veen', 'inklinken', 'ontwateren', 'NAP'],
        rechts:['bodem uit resten van planten uit moerassen', 'in elkaar zakken doordat het water eruit gaat', 'water uit de grond afvoeren', 'peil waarmee in Nederland hoogtes worden gemeten'],
        extra:['het afbreken van plantenresten door bacteriën'] },
      { t:'keuze', v:'Welke vraag kan je docent NIET stellen met deze tekst?', o:['Hoeveel gemalen zijn er in Nederland?', 'Waarom vergingen de plantenresten in het moeras niet?', 'Welke twee gevolgen heeft het ontwateren van veen?'],
        u:'Gemalen worden genoemd in alinea 4, maar niet hoeveel het er zijn.' }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is het onderwerp van de tekst?', o:['bodemdaling in veengebieden', 'het laagste punt van Nederland', 'houten palen onder oude huizen'] },
      { t:'open', v:'Wat is de hoofdgedachte? Schrijf één zin.', r:2,
        m:'Een groot deel van Nederland zakt nog steeds doordat de mens het veen ontwatert, en dat valt wel te vertragen maar waarschijnlijk niet te stoppen.' }
    ],
    verwijs:[
      { t:'keuze', v:'Alinea 4: "... kwam er weer een laag veen droog te liggen, __die__ opnieuw inklonk en verteerde." Waar verwijst die naar?', o:['een laag veen', 'het waterpeil', 'de gemalen'] },
      { t:'keuze', v:'Alinea 6: "__Dat__ botst echter met het gebruik van het land." Waar verwijst Dat naar?', o:['het waterpeil weer omhoog brengen', 'het veen laten verdwijnen', 'het zakken helemaal stoppen'],
        u:'Kijk in de zin ervoor: de oplossing is het waterpeil omhoog brengen. Een natte wei is lastig voor koeien en machines.' }
    ],
    woord:[
      { t:'keuze', v:'Alinea 4: "Zo ontstond een __vicieuze cirkel__." Wat is een vicieuze cirkel?', o:['een probleem dat zichzelf steeds erger maakt', 'een oplossing die steeds beter gaat werken', 'een rondje dat de boeren elk jaar maken'],
        u:'Dieper wegpompen laat nieuw veen zakken, waardoor er weer dieper gepompt moet worden. Het probleem houdt zichzelf in stand.' },
      { t:'keuze', v:'Alinea 6: "koeien en zware machines zakken weg in een __drassige__ wei." Wat betekent drassig?', o:['nat en zompig', 'droog en hard', 'steil en hobbelig'] }
    ],
    samenvat:[
      { t:'open', v:'Vat de tekst samen in hoogstens 50 woorden.', max:50,
        m:'Een kwart van Nederland ligt onder zeeniveau en veel daarvan zakt verder. Ontwaterd veen klinkt in en verteert. Daardoor moet het water steeds verder omlaag en zakt het land opnieuw. Dat geeft schade aan huizen en wegen. Een hoger waterpeil remt de daling af.' }
    ]
  }
});

LEESBANK.T({
  id:'studerend-industrie', niv:'3F', strat:'studerend', titel:'De industriële revolutie', vorm:'leertekst', bron:'Leertekst geschiedenis',
  alineas:[
    'Rond 1750 leefden de meeste mensen in Europa nog ongeveer zoals hun overgrootouders. Ze woonden op het platteland en werkten op het land. Kleding en gereedschap werden met de hand gemaakt, vaak thuis: een boerengezin spon in de winter wol en weefde er stof van. Honderd jaar later zag het leven van miljoenen mensen er heel anders uit. Die grote verandering noemen historici de **industriële revolutie**.',
    'Ze begon in Groot-Brittannië, in de textielindustrie. Uitvinders bouwden machines die veel sneller konden spinnen en weven dan een mens. Zo’n machine was te groot en te duur voor een woonkamer. Daarom kwamen ze samen in grote gebouwen te staan: de eerste **fabrieken**. In het begin dreef stromend water de machines aan, waardoor fabrieken langs rivieren moesten staan.',
    'Dat veranderde door de verbeterde **stoommachine**. Deze haalde zijn kracht uit stoom van water dat verhit werd met brandende steenkool. Een fabriek met een stoommachine kon overal staan, zolang er maar steenkool aangevoerd kon worden. Ook het vervoer veranderde. In 1825 reed in Engeland de eerste openbare trein met een stoomlocomotief; in Nederland volgde in 1839 de lijn tussen Amsterdam en Haarlem. Grondstoffen en producten konden voortaan sneller en goedkoper worden vervoerd.',
    'Op het platteland was intussen minder werk, en in de fabrieken juist veel. Hele families trokken daarom naar de stad. Die groeide zo snel dat er niet genoeg huizen waren. Arbeiders woonden met grote gezinnen in kleine, vochtige woningen zonder stromend water. Ze werkten twaalf tot veertien uur per dag, zes dagen per week, voor een laag loon. Ook kinderen stonden aan de machines: ze waren goedkoop, en met hun kleine handen konden ze tussen de draden reiken.',
    'Nederland kwam pas later op gang. Pas rond 1870 groeide hier de industrie echt, bijvoorbeeld de textielindustrie in Twente. De nadelen van het fabriekswerk waren toen al bekend. In 1874 kwam er een eerste wet die fabriekswerk verbood voor kinderen onder de twaalf jaar. Werk op de boerderij en in het huishouden viel daar overigens niet onder. Ook richtten arbeiders **vakbonden** op, om samen op te komen voor een hoger loon en kortere werkdagen.',
    'Op de lange termijn maakte de industriële revolutie de samenleving veel rijker. Producten als kleding werden zo goedkoop dat gewone mensen ze konden kopen, en uiteindelijk stegen ook de lonen. Toch betaalde de eerste generatie fabrieksarbeiders daar een hoge prijs voor. De welvaart van later werd opgebouwd met het zware werk van mannen, vrouwen en kinderen die er zelf weinig van terugzagen.'
  ],
  taken:{
    studerend:[
      { t:'markeer', v:'Markeer in alinea 3 drie kernwoorden.', al:2, n:3,
        goed:['stoommachine', 'stoom', 'steenkool', 'overal', 'vervoer', 'trein', 'stoomlocomotief', 'sneller', 'goedkoper', '1825', '1839'] },
      { t:'schema', v:'Zet alinea 4 in een schema van oorzaak en gevolg.', vakken:['oorzaak', 'gevolg 1', 'gevolg 2', 'gevolg 3'],
        m:['weinig werk op het platteland, veel in de fabrieken', 'families trekken naar de stad', 'de stad groeit te snel', 'te weinig huizen: kleine, vochtige woningen'], vb:0 },
      { t:'koppel', v:'Overhoor jezelf. Welke uitleg hoort bij welk begrip? Eén uitleg blijft over.', links:['industriële revolutie', 'fabriek', 'stoommachine', 'vakbond'],
        rechts:['de grote omslag van handwerk naar werken met machines', 'groot gebouw met veel machines bij elkaar', 'haalt kracht uit stoom van verhit water', 'arbeiders die samen opkomen voor beter loon'],
        extra:['wet tegen fabriekswerk door jonge kinderen'] },
      { t:'keuze', v:'Welke vraag kan je docent NIET stellen met deze tekst?', o:['Wie bouwde de eerste stoomlocomotief?', 'Waarom stonden de eerste fabrieken langs rivieren?', 'Welk werk viel niet onder de wet van 1874?'],
        u:'De tekst noemt het jaar van de eerste trein, maar geen uitvinder. De andere twee staan in alinea 2 en 5.' },
      { t:'open', v:'Bedenk een toetsvraag over alinea 5, met het antwoord erbij.', r:2,
        m:'Wat regelde de wet van 1874? Kinderen onder de twaalf jaar mochten niet meer in een fabriek werken.' }
    ],
    alinea:[
      { t:'koppel', v:'Wat doet de alinea? Koppel. Eén functie blijft over.', links:['Alinea 1', 'Alinea 2', 'Alinea 5', 'Alinea 6'],
        rechts:['schetst hoe het leven was vóór de verandering', 'vertelt waar en hoe de verandering begon', 'laat zien hoe het in Nederland ging', 'weegt voor- en nadelen af en sluit af'],
        extra:['geeft de mening van een arbeider over zijn werk'] },
      { t:'keuze', v:'Welke zin vat alinea 3 het best samen?', o:['Door de stoommachine konden fabrieken overal staan en ging vervoer sneller.', 'In 1825 reed in Engeland de eerste openbare trein met een stoomlocomotief.', 'Een stoommachine verhit water met brandende steenkool en maakt zo stoom.'],
        u:'De tweede en derde zin zijn waar, maar het zijn details. De alinea gaat over wat de stoommachine veranderde.' }
    ],
    verwijs:[
      { t:'keuze', v:'Alinea 2: "__Ze__ begon in Groot-Brittannië, in de textielindustrie." Waar verwijst Ze naar?', o:['de industriële revolutie', 'de textielindustrie', 'de eerste fabriek'],
        u:'Kijk terug naar het eind van alinea 1. De textielindustrie kan het niet zijn: die staat in dezelfde zin als plek waar het begon.' },
      { t:'keuze', v:'Alinea 2: "Daarom kwamen __ze__ samen in grote gebouwen te staan." Waar verwijst ze naar?', o:['de machines', 'de uitvinders', 'de woonkamers'] },
      { t:'keuze', v:'Alinea 5: "Werk op de boerderij en in het huishouden viel __daar__ overigens niet onder." Waar verwijst daar naar?', o:['de wet van 1874', 'de vakbonden', 'de textielindustrie'] }
    ],
    onderwerp:[
      { t:'keuze', v:'Wat is de hoofdgedachte van de tekst?', o:['Machines en fabrieken veranderden het leven ingrijpend: op den duur rijker, maar zwaar voor de eerste arbeiders.', 'Door de verbeterde stoommachine konden fabrieken voortaan overal staan, als er maar steenkool aangevoerd kon worden.', 'Nederland begon pas rond 1870 echt met fabrieken en maakte in 1874 een eerste wet tegen kinderarbeid.'],
        u:'De andere twee zinnen gaan over één alinea. De hoofdgedachte geldt voor de hele tekst, ook voor het slot.' }
    ]
  }
});
