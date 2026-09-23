/* Uitleg stap voor stap bij de Vragen van de dag. */
STAPPEN.les('dag', function(){
  var S = STAPPEN;
  return [
    {
      id: 'spel', naam: 'Zo werken de vragen van de dag', uitleg: 'Tien vragen, voor iedereen hetzelfde, één poging.',
      stappen: [
        { kop: 'Tien vragen uit alle vakken', beeld: S.formule('Nederlands · Engels · geschiedenis · aardrijkskunde · biologie · wiskunde · ...'),
          tekst: '<p>Elke dag staan er tien nieuwe vragen klaar, voor iedereen op de site dezelfde. Uit alle vakken, op een niveau dat iedereen aankan.</p>' },
        { kop: 'Eén poging', beeld: S.formule('vandaag één keer &nbsp;·&nbsp; morgen tien nieuwe'),
          tekst: '<p>Je mag het één keer per dag doen. Lees elke vraag dus goed, want terug kan niet.</p>' },
        { kop: 'Snel en goed', beeld: S.formule('goed = punten &nbsp;·&nbsp; snel = <span class="st-na">bonus</span>'),
          tekst: '<p>Een goed antwoord levert punten op, en hoe sneller je het weet, hoe meer bonus. Aan het eind zie je waar je staat in het klassement van vandaag.</p>' +
            S.bak('Maak er een gewoonte van: elke dag tien vragen, en je ziet vanzelf welke vakken nog wat oefening nodig hebben.', 'goed') }
      ]
    }
  ];
});
