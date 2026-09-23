/* Uitleg stap voor stap bij De leenmannen. */
STAPPEN.les('leenmannen', function(){
  var S = STAPPEN;
  return [
    {
      id: 'leen', naam: 'Het leenstelsel', uitleg: 'Land in ruil voor trouw, en waarom dat misging.',
      stappen: [
        { kop: 'Een koning kan niet overal zijn', beeld: S.formule('groot rijk · geen wegen · geen telefoon'),
          tekst: '<p>Rond het jaar 1000 was het rijk groot en reizen traag. Een koning kon zijn land niet zelf besturen of verdedigen.</p>' },
        { kop: 'Land in leen', beeld: S.formule('koning → land → <span class="st-na">leenman</span> → trouw en soldaten'),
          tekst: '<p>Daarom gaf hij gebieden <b>in leen</b> aan mannen die hem trouw zwoeren: zijn leenmannen of vazallen. Zij bestuurden en verdedigden dat gebied voor hem.</p>' },
        { kop: 'Het probleem: erfelijk', beeld: S.formule('vader zweert trouw → zoon erft het leen → <span class="st-na">zoon zwoer niets</span>'),
          tekst: '<p>Na verloop van tijd ging een leen over van vader op zoon. Die zoon had de koning nooit iets beloofd, en voelde zich eerder heer van zijn eigen gebied.</p>' +
            S.bak('Zo werden leenmannen machtiger en de koning zwakker.', 'goed') }
      ]
    },
    {
      id: 'spel', naam: 'Zo speel je', uitleg: 'Tik een gebied aan en kies wat je doet.',
      stappen: [
        { kop: 'De kaart', beeld: S.formule('tik een gebied → wie heeft het → kies'),
          tekst: '<p>Je bent koning van Frankrijk. Tik een gebied aan: je ziet wie het in leen heeft en hoe trouw hij is. Daar kies je wat je doet.</p>' },
        { kop: 'Houd het rijk bij elkaar', beeld: S.formule('geven · belonen · terugnemen'),
          tekst: '<p>Geef je te veel weg, dan worden je leenmannen te machtig. Geef je te weinig, dan zijn je grenzen onbewaakt. Zoek het evenwicht.</p>' }
      ]
    }
  ];
});
