/* Uitleg stap voor stap bij Mijn fouten. */
STAPPEN.les('fouten', function(){
  var S = STAPPEN;
  return [
    {
      id: 'spel', naam: 'Zo werkt je foutenmap', uitleg: 'Wat je fout had, komt terug tot het goed gaat.',
      stappen: [
        { kop: 'Fouten verzamelen zich vanzelf', beeld: S.formule('Vragenrace · Torenverdediging · Zwaardvechter → <span class="st-na">je map</span>'),
          tekst: '<p>Elke vraag die je fout had in de Vragenrace, Torenverdediging of de Zwaardvechter komt in je foutenmap. Je hoeft daar niets voor te doen.</p>' },
        { kop: 'Goed is weg, fout komt terug', beeld: S.formule('goed → uit de map &nbsp;·&nbsp; fout → nog een keer'),
          tekst: '<p>Beantwoord je een vraag hier goed, dan gaat hij uit je map. Weer fout? Dan komt hij later nog een keer. Zo oefen je precies wat je nog niet kunt.</p>' },
        { kop: 'Waarom dit werkt', beeld: S.formule('herhalen wat misging = leren'),
          tekst: '<p>Wat je al kunt, hoef je niet te oefenen. Door je eigen fouten nog eens te maken, gebruik je je tijd waar het het meest oplevert.</p>' +
            S.bak('Met een speelcode of inlog reist je map mee naar een ander apparaat.', 'goed') }
      ]
    }
  ];
});
