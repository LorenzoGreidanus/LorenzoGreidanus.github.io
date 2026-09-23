/* Uitleg stap voor stap bij De Cubacrisis. */
STAPPEN.les('crisis', function(){
  var S = STAPPEN;
  return [
    {
      id: 'geschiedenis', naam: 'Wat was de Cubacrisis?', uitleg: 'Oktober 1962: dertien dagen op de rand van een kernoorlog.',
      stappen: [
        { kop: 'De Koude Oorlog', beeld: S.formule('Verenigde Staten ↔ Sovjet-Unie'),
          tekst: '<p>Na de Tweede Wereldoorlog stonden de Verenigde Staten en de Sovjet-Unie tegenover elkaar. Ze vochten niet rechtstreeks, maar bouwden allebei kernwapens.</p>' },
        { kop: 'Raketten op Cuba', beeld: S.formule('oktober 1962 · Sovjetraketten op 150 km van de VS'),
          tekst: '<p>In oktober 1962 ontdekten de Amerikanen dat de Sovjet-Unie raketten op Cuba plaatste, vlak bij hun kust. President Kennedy eiste dat ze weggingen.</p>' },
        { kop: 'Dertien dagen', beeld: S.formule('blokkade · dreigen · geheime onderhandelingen'),
          tekst: '<p>De VS legden een blokkade rond Cuba. Dertien dagen lang kon één verkeerde stap een kernoorlog beginnen. Uiteindelijk haalde de Sovjet-Unie de raketten weg, en de VS haalden in stilte hun raketten uit Turkije.</p>' +
            S.bak('Geen van beide kon winnen zonder zelf ook alles te verliezen. Daarom zochten ze uiteindelijk een uitweg.', 'goed') }
      ]
    },
    {
      id: 'spel', naam: 'Zo speel je', uitleg: 'Twee kampen, elke dag een zet.',
      stappen: [
        { kop: 'Twee kampen', beeld: S.formule('het Witte Huis ↔ het Kremlin'),
          tekst: '<p>De docent opent de crisis op het digibord. Leerlingen doen mee met een code en worden verdeeld over het Witte Huis en het Kremlin.</p>' },
        { kop: 'Elke dag een zet', beeld: S.formule('beide kampen kiezen → <span class="st-na">samen</span> zien wat er gebeurt'),
          tekst: '<p>Elke dag kiest elk kamp een zet op de eigen schermen. De meerderheid beslist. Pas als beide zetten op tafel liggen, zie je wat ze samen aanrichten.</p>' },
        { kop: 'De spanning', beeld: S.formule('te hard → escalatie · te zacht → gezichtsverlies'),
          tekst: '<p>Speel je te hard, dan loopt de spanning op. Geef je te snel toe, dan verlies je aanzien. Zoek, net als in 1962, een uitweg die beide kanten kunnen accepteren.</p>' }
      ]
    }
  ];
});
