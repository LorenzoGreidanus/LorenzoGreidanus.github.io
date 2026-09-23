/* Uitleg stap voor stap bij De stad. */
STAPPEN.les('stad', function(){
  var S = STAPPEN;
  return [
    {
      id: 'spel', naam: 'Zo werkt De stad', uitleg: 'Kisten openen met vragen, en heelhuids naar de metro.',
      stappen: [
        { kop: 'Lopen en mikken', beeld: S.formule('WASD of pijltjes · muis om te mikken · E om te pakken'),
          tekst: '<p>Loop met WASD of de pijltjes en mik met de muis. Op een telefoon sleep je links om te lopen en tik je rechts om te schieten.</p>' },
        { kop: 'Een kist openen', beeld: S.formule('kist → <span class="st-na">3 vragen goed</span> → buit'),
          tekst: '<p>In portieken en stegen staan kisten. Ze gaan pas open als je drie vragen goed hebt. Dan zit er buit in.</p>' },
        { kop: 'Pas van jou bij de metro', beeld: S.formule('buit telt pas bij een van de drie metro-ingangen'),
          tekst: '<p>Wat je vindt, is pas echt van jou als je de stad uit komt bij een metro-ingang. Ga je onderweg neer, dan blijft je buit op straat liggen voor wie hem ophaalt. Je eigen wapens krijg je wel terug.</p>' +
            S.bak('Hoe langer je blijft, hoe meer je vindt, maar hoe meer je kunt verliezen. Weet wanneer je moet gaan.', 'goed') }
      ]
    }
  ];
});
