/* Uitleg stap voor stap bij de Vragenrace. */
STAPPEN.les('race', function(){
  var S = STAPPEN;
  return [
    {
      id: 'spel', naam: 'Zo werkt de Vragenrace', uitleg: 'Zestig seconden, tijd erbij voor goed, tijd eraf voor fout.',
      stappen: [
        { kop: 'Kies een vak en een niveau', beeld: S.formule('vak → onderdeel (mag) → niveau'),
          tekst: '<p>Kies het vak dat je wilt oefenen, en als je wilt één onderdeel, bijvoorbeeld één tijdvak of alleen breuken. Het niveau past zich onderweg aan: gaat het goed, dan worden de vragen iets moeilijker.</p>' },
        { kop: 'De klok', beeld: S.formule('60 s &nbsp;·&nbsp; goed <span class="st-na">+3 s</span> &nbsp;·&nbsp; fout −5 s'),
          tekst: '<p>Je begint met zestig seconden. Elk goed antwoord geeft punten en drie seconden erbij. Een fout kost vijf seconden.</p>' },
        { kop: 'Een reeks', beeld: S.formule('3 goed op rij → punten <span class="st-na">× 2</span>'),
          tekst: '<p>Heb je drie goed op rij, dan tellen je punten dubbel zolang je goed blijft. Eén fout en de reeks begint opnieuw.</p>' },
        { kop: 'Rustig blijven loont', beeld: S.formule('snel gokken kost meer dan het oplevert'),
          tekst: '<p>Een fout kost meer tijd dan een goed antwoord oplevert. Lees de vraag dus even goed, liever een seconde langer dan een fout.</p>' +
            S.bak('Fout gehad? Die vraag komt terug in Mijn fouten, zodat je hem nog een keer kunt oefenen.', 'goed') }
      ]
    }
  ];
});
