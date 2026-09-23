/* Uitleg stap voor stap bij Stadsontwerp: hoe een middeleeuwse stad in
   elkaar zit, en waarom. */
STAPPEN.les('stadsontwerp', function(){
  var S = STAPPEN;
  return [
    {
      id: 'stad', naam: 'Hoe zit een middeleeuwse stad in elkaar?', uitleg: 'Muur, poorten, markt, kerk en straten.',
      stappen: [
        { kop: 'De muur', beeld: S.formule('muur + gracht = bescherming'),
          tekst: '<p>Een stad had een muur, vaak met een gracht ervoor. Die beschermde tegen vijanden en liet zien waar de stad ophield en de stadsrechten begonnen.</p>' },
        { kop: 'De poorten', beeld: S.formule('poort = waar de wegen binnenkomen'),
          tekst: '<p>In de muur zaten poorten, precies waar de belangrijke wegen de stad in kwamen. Daar werd ook tol geheven.</p>' },
        { kop: 'De markt in het midden', beeld: S.formule('wegen van de poorten → <span class="st-na">markt</span>'),
          tekst: '<p>De wegen van de poorten kwamen samen op de markt. Daar werd gehandeld, en daar stonden vaak de kerk en het stadhuis.</p>' },
        { kop: 'Ambachten per straat', beeld: S.formule('smeden bij de poort · leerlooiers aan het water'),
          tekst: '<p>Ambachtslieden woonden vaak bij elkaar. Wie water nodig had of stonk, zoals leerlooiers, zat aan het water en aan de rand.</p>' +
            S.bak('In het spel kijkt de stadsraad mee. Kun je uitleggen waarom iets ergens staat, dan klopt het ontwerp meestal.', 'goed') }
      ]
    }
  ];
});
