/* Uitleg stap voor stap bij Landenvormen: waar je op let als je een land
   alleen aan zijn omtrek moet herkennen. */
STAPPEN.les('landenvormen', function(){
  var S = STAPPEN;
  return [
    {
      id: 'vorm', naam: 'Een land herkennen aan zijn vorm', uitleg: 'Zoek het opvallendste stukje en maak er een plaatje van.',
      stappen: [
        { kop: 'Alleen de omtrek', beeld: S.formule('geen kaart · geen buren · geen grootte'),
          tekst: '<p>In dit spel zie je alleen de rand van een land, altijd even groot in beeld. Je kunt dus niet zien waar het ligt of hoe groot het is. Alleen de vorm telt.</p>' },
        { kop: 'Zoek het opvallendste stukje', beeld: S.tabel(['land', 'waar je het aan ziet'], [
            ['Italië', 'een laars, met Sicilië als bal voor de neus'], ['Chili', 'heel lang en heel smal'], ['Noorwegen', 'een rafelige kust met fjorden, dik bovenaan'],
            ['Griekenland', 'een hand met drie vingers naar beneden, en eilandjes'], ['Frankrijk', 'bijna een zeshoek'], ['Denemarken', 'een duim die omhoog wijst, met eilanden ernaast']]),
          tekst: '<p>Bijna elk land heeft één stukje dat je onthoudt: een punt, een bocht, een schiereiland. Kijk daar eerst naar.</p>' },
        { kop: 'Maak er een plaatje van', beeld: S.formule('Italië = een laars'),
          tekst: '<p>Bedenk waar de vorm op lijkt: een dier, een voorwerp, een letter. Een plaatje in je hoofd onthoud je veel beter dan een naam.</p>' },
        { kop: 'Buren zien er anders uit', beeld: '',
          tekst: '<p>De vier landen waaruit je kiest liggen in hetzelfde deel van de wereld. Weet je het niet zeker, sluit dan eerst de landen uit die het zeker niet zijn: te rond, te lang, geen kust.</p>' +
            S.bak('Tip: speel ook Topografie. Weet je waar een land ligt, dan herken je de vorm ook sneller.', 'goed') }
      ]
    }
  ];
});
