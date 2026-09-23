/* Uitleg stap voor stap bij de Zwaardvechter. */
STAPPEN.les('zwaard', function(){
  var S = STAPPEN;
  return [
    {
      id: 'spel', naam: 'Zo werkt de Zwaardvechter', uitleg: 'Lopen, ontwijken, slaan, en na elke ronde vragen voor geld.',
      stappen: [
        { kop: 'Lopen en ontwijken', beeld: S.formule('pijltjes of WASD &nbsp;·&nbsp; spatie = ontwijken'),
          tekst: '<p>Loop met de pijltjes of WASD, of houd op een telefoon je vinger op de arena. Met spatie of de knop Ontwijk maak je een sprong waarbij niets je raakt.</p>' },
        { kop: 'Slaan gaat vanzelf', beeld: S.formule('zwaard: dichtbij en hard &nbsp;·&nbsp; boog: van ver, zachter'),
          tekst: '<p>Je wapen slaat vanzelf naar de dichtstbijzijnde fout binnen bereik. Met Q wissel je tussen zwaard en boog. Jij zorgt dat je op de goede plek staat.</p>' },
        { kop: 'Na elke ronde: vragen', beeld: S.formule('goed antwoord → <span class="st-na">geld</span> → beter zwaard, harnas, laarzen'),
          tekst: '<p>Na elke ronde beantwoord je een paar vragen. Elk goed antwoord is geld, en daarmee koop je een scherper zwaard, een harnas, snellere laarzen of een werpmes.</p>' },
        { kop: 'Bazen en schutters', beeld: S.formule('licht de grond op? stap eruit'),
          tekst: '<p>Een baas of een schutter laat eerst zien waar hij gaat raken: de grond licht op. Stap daar op tijd uit.</p>' +
            S.bak('Samen spelen kan ook: dan beantwoordt de hele klas dezelfde vragen tussen de rondes.', 'goed') }
      ]
    }
  ];
});
