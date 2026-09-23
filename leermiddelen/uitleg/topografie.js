/* Uitleg stap voor stap bij Topografie: hoe je een kaart leert, van grote
   stukken naar kleine, en hoe het spel werkt. */
STAPPEN.les('topografie', function(){
  var S = STAPPEN;
  return [
    {
      id: 'leren', naam: 'Een kaart leren', uitleg: 'Van grote stukken naar kleine, met vaste ankerpunten.',
      stappen: [
        { kop: 'Begin bij wat je al kent', beeld: S.formule('Nederland → buren → de rest'),
          tekst: '<p>Zoek eerst de plekken die je al weet, bijvoorbeeld Nederland en de landen eromheen. Die worden je <b>ankerpunten</b>: van daaruit zoek je de rest.</p>' },
        { kop: 'Leer in kleine groepjes', beeld: S.tabel(['groepje', 'bijvoorbeeld'], [['de buren', 'België, Duitsland'], ['de grote landen', 'Frankrijk, Spanje, Italië'], ['het noorden', 'Noorwegen, Zweden, Finland'], ['het oosten', 'Polen, Tsjechië, Hongarije']]),
          tekst: '<p>Leer niet de hele kaart tegelijk, maar een groepje van vier of vijf plekken die bij elkaar liggen.</p>' },
        { kop: 'Gebruik de ligging', beeld: S.formule('Portugal ligt links van Spanje, aan de zee'),
          tekst: '<p>Onthoud waar iets ligt ten opzichte van een ankerpunt: links, rechts, boven, onder, aan zee of niet.</p>' },
        { kop: 'Zo werkt het spel', beeld: S.formule('oplichten → typen → Enter'),
          tekst: '<p>Er licht iets op de kaart op. Jij typt hoe het heet en drukt op Enter. Een kleine spelfout mag. Wat je goed hebt blijft groen staan, zodat je ziet wat je al kent.</p>' +
            S.bak('Weet je het niet? Sla over en kijk goed naar het antwoord. Hij komt later terug.', 'goed') }
      ]
    }
  ];
});
