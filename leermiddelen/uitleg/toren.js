/* Uitleg stap voor stap bij Torenverdediging. */
STAPPEN.les('toren', function(){
  var S = STAPPEN;
  return [
    {
      id: 'spel', naam: 'Zo werkt Torenverdediging', uitleg: 'Vragen beantwoorden, munten verdienen, torens bouwen.',
      stappen: [
        { kop: 'De fouten lopen naar de klas', beeld: S.formule('start → pad → klas'),
          tekst: '<p>Over het pad lopen fouten naar de klas. Komen er te veel aan, dan is het spel voorbij. Jij houdt ze tegen met torens langs het pad.</p>' },
        { kop: 'Vragen geven munten', beeld: S.formule('goed antwoord → <span class="st-na">munten</span>'),
          tekst: '<p>Tussen de golven krijg je vragen uit het vak dat je koos. Elk goed antwoord levert munten op. Fout? Dan lees je waarom, en je speelt gewoon door.</p>' },
        { kop: 'Bouwen', beeld: S.formule('naast het pad: toren &nbsp;·&nbsp; op het pad: pek of versperring'),
          tekst: '<p>Tik naast het pad om een toren te zetten. Tik op het pad voor pek, voetangels of een versperring. Weghalen mag: je krijgt de helft terug.</p>' },
        { kop: 'Slim bouwen', beeld: S.formule('bochten · kruispunten · vertragen + raken'),
          tekst: '<p>Een toren in een bocht raakt de fouten langer. Pek vertraagt ze, zodat je torens vaker kunnen schieten. Meer plekken voor torens koop je erbij, elke volgende is duurder.</p>' +
            S.bak('Hoe meer vragen je goed hebt, hoe sterker je verdediging. Oefenen en spelen gaan samen.', 'goed') }
      ]
    }
  ];
});
