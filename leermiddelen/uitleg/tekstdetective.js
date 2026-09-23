/* Uitleg stap voor stap bij de Tekstdetective: de hoofdgedachte vinden,
   signaalwoorden en het doel van de schrijver. */
STAPPEN.les('tekstdetective', function(){
  var S = STAPPEN;
  var ALINEA = 'Steeds meer jongeren slapen te weinig. <span class="st-na">Dat komt vooral doordat</span> ze tot laat op hun telefoon kijken. Het blauwe licht van het scherm houdt je hersenen wakker. <span class="st-na">Daardoor</span> val je later in slaap, terwijl de wekker gewoon om zeven uur gaat.';
  function alinea(t){ return '<p style="max-width:520px;margin:0;font-size:1rem;line-height:1.6;text-align:left">' + t + '</p>'; }
  return [
    {
      id: 'kern', naam: 'De hoofdgedachte vinden', uitleg: 'Waar gaat de alinea over, in één zin?',
      stappen: [
        { kop: 'Lees de hele alinea', beeld: alinea(ALINEA.replace(/<[^>]+>/g, '')),
          tekst: '<p>Lees eerst de hele alinea rustig door. Nog niet kiezen.</p>' },
        { kop: 'Onderwerp: waar gaat het over?', beeld: alinea(ALINEA.replace(/<[^>]+>/g, '').replace('jongeren slapen te weinig', '<b>jongeren slapen te weinig</b>')),
          tekst: '<p>Vraag je af: waar gaat het over, in een paar woorden? Hier: jongeren die te weinig slapen.</p>' },
        { kop: 'Hoofdgedachte: wat zegt de schrijver erover?', beeld: S.formule('Jongeren slapen te weinig door hun telefoon.'),
          tekst: '<p>De hoofdgedachte is het belangrijkste dat de schrijver over het onderwerp zegt, in één zin. Die staat vaak in de eerste of de laatste zin.</p>' +
            S.bak('Een voorbeeld of een detail (het blauwe licht) is geen hoofdgedachte. Het ondersteunt hem alleen.', 'let') }
      ]
    },
    {
      id: 'signaal', naam: 'Signaalwoorden', uitleg: 'Woorden die verraden hoe de zinnen samenhangen.',
      stappen: [
        { kop: 'Een woord dat het verband verraadt', beeld: alinea(ALINEA),
          tekst: '<p>Signaalwoorden laten zien hoe zinnen met elkaar samenhangen. "Dat komt doordat" en "daardoor" vertellen: het een komt door het ander.</p>' },
        { kop: 'Oorzaak en gevolg', beeld: S.formule('doordat · daardoor · dus · omdat · want'),
          tekst: '<p>Het een zorgt voor het ander.</p>' },
        { kop: 'Tegenstelling en opsomming', beeld: S.formule('maar · echter · toch &nbsp;|&nbsp; ook · bovendien · ten eerste'),
          tekst: '<p>Bij een <b>tegenstelling</b> staat iets tegenover elkaar. Bij een <b>opsomming</b> komt er nog iets bij.</p>' },
        { kop: 'En nog meer soorten', beeld: S.tabel(['verband', 'signaalwoorden'], [
            ['tijd', 'toen, daarna, eerst, ten slotte'], ['voorwaarde', 'als, mits, tenzij'], ['doel', 'om te, zodat, opdat'],
            ['toelichting', 'bijvoorbeeld, zoals, namelijk'], ['vergelijking', 'net als, zoals, evenals'], ['conclusie', 'dus, kortom, concluderend']]),
          tekst: '<p>Leer de soorten met een paar voorbeelden. Dan herken je ze ook in een tekst die je nog nooit gezien hebt.</p>' }
      ]
    },
    {
      id: 'doel', naam: 'Tekstsoort en doel', uitleg: 'Wil de schrijver informeren, overtuigen of vermaken?',
      stappen: [
        { kop: 'Waarom schreef iemand dit?', beeld: S.tabel(['doel', 'je herkent het aan'], [
            ['informeren', 'feiten, uitleg, geen mening'], ['overtuigen', 'argumenten, "je moet", "het is beter"'], ['mening geven', '"ik vind", "volgens mij"'],
            ['aanzetten tot handelen', 'een opdracht: "koop", "doe mee"'], ['amuseren', 'een grappig of spannend verhaal']]),
          tekst: '<p>Elke tekst heeft een doel. Kijk naar de woorden: staan er feiten, meningen, argumenten of opdrachten in?</p>' +
            S.bak('Reclame lijkt soms informatie, maar wil dat je iets koopt: dat is aanzetten tot handelen.', 'let') }
      ]
    }
  ];
});
