/* Uitleg stap voor stap bij De crisis (de Cubacrisis, oktober 1962). */
STAPPEN.les('crisis', function(){
  var S = STAPPEN;
  return [
    {
      id: 'geschiedenis', naam: 'Wat was de Cubacrisis?', uitleg: 'Oktober 1962: dertien dagen op de rand van een kernoorlog.',
      stappen: [
        { kop: 'De Koude Oorlog', beeld: S.formule('VS en de NAVO ↔ Sovjet-Unie en het Warschaupact'),
          tekst: '<p>Na de Tweede Wereldoorlog stonden de Verenigde Staten en de Sovjet-Unie tegenover elkaar, elk met bondgenoten: de NAVO (1949) en het Warschaupact (1955). Ze vochten niet rechtstreeks, maar bouwden allebei kernwapens. Wie als eerste aanvalt, wordt zelf ook vernietigd: dat heet afschrikking.</p>' },
        { kop: 'Raketten op Cuba', beeld: S.formule('14 oktober 1962 · spionagefoto’s · 145 km van Florida'),
          tekst: '<p>Cuba was sinds 1959 communistisch, met Fidel Castro als leider. In 1962 bracht de Sovjet-Unie in het geheim kernraketten naar Cuba. Op 14 oktober fotografeerde een Amerikaans spionagevliegtuig (een U-2) de lanceerplaatsen. Vanaf Cuba konden de raketten Washington in een paar minuten bereiken.</p>' },
        { kop: 'Waarom deed Moskou dat?', beeld: S.formule('Cuba beschermen · Turkije · de achterstand inhalen'),
          tekst: '<p>Chroesjtsjov wilde Cuba beschermen tegen een Amerikaanse invasie. Bovendien hadden de VS al raketten in Turkije staan, vlak bij de Sovjet-Unie. En de VS hadden veel meer raketten die de Sovjet-Unie konden raken dan andersom.</p>' },
        { kop: 'Dertien dagen', beeld: S.formule('blokkade · brieven · zwarte zaterdag · 28 oktober'),
          tekst: '<p>President Kennedy koos voor een zeeblokkade rond Cuba (22 oktober). Russische schepen keerden om. Chroesjtsjov stuurde brieven. Op zwarte zaterdag, 27 oktober, werd een U-2 neergeschoten en scheelde het weinig of een onderzeeboot vuurde een kerntorpedo af. Op 28 oktober beloofde Moskou de raketten weg te halen.</p>' },
        { kop: 'De afspraak, en het geheim', beeld: S.formule('raketten weg ↔ geen invasie <span class="st-zacht">+ in het geheim: Turkije</span>'),
          tekst: '<p>De VS beloofden Cuba niet binnen te vallen. In het geheim spraken Robert Kennedy en de Russische ambassadeur Dobrynin af dat de Amerikaanse raketten uit Turkije later zouden verdwijnen (april 1963). Omdat dat geheim bleef, leek Kennedy de winnaar en Chroesjtsjov de verliezer.</p>' +
            S.bak('Na de crisis kwam er in 1963 een directe verbinding tussen Washington en Moskou: de hotline. In 1962 bestond die nog niet.', 'goed') }
      ]
    },
    {
      id: 'spel', naam: 'Zo speel je', uitleg: 'Twee teams, geheime doelen, zeven rondes.',
      stappen: [
        { kop: 'Twee teams', beeld: S.formule('VS en de NAVO ↔ Sovjet-Unie en het Warschaupact'),
          tekst: '<p>De docent opent de crisis op het digibord. Je doet mee met de code op je laptop of telefoon (meneergreidanus.nl/q) en komt in een van de twee teams.</p>' },
        { kop: 'Geheime doelen en inlichtingen', beeld: S.formule('jouw doelen · jouw inlichtingen · alleen voor jouw team'),
          tekst: '<p>Op je scherm staan de doelen van jouw team, en elke ronde nieuwe inlichtingen. De andere kant ziet die niet. Samen hebben jullie één doel: geen kernoorlog. Komt de spanning op 100, dan krijgt niemand punten.</p>' },
        { kop: 'Overleggen en stemmen', beeld: S.formule('zet · bericht of aanbod · antwoord'),
          tekst: '<p>Elke ronde overleg je hardop met je team en stem je op je scherm: welke zet, en welk bericht naar de andere kant. Een aanbod kan de andere kant de volgende ronde aannemen. De meeste stemmen tellen; bij gelijk beslist de leider van de ronde (president of partijleider). Die kan het besluit ook eerder vastleggen.</p>' },
        { kop: 'Tegelijk onthullen', beeld: S.formule('beide zetten tegelijk → nieuws · spanning · aanzien'),
          tekst: '<p>Het bord laat beide zetten tegelijk zien, met het nieuws van de dag en wat het doet met de spanning. Te hard spelen laat de spanning oplopen; te snel toegeven kost aanzien. Zoek een uitweg die jouw team iets oplevert.</p>' +
            S.bak('Aan het eind zie je de geheime doelen van beide teams naast wat er in 1962 echt gebeurde.', 'goed') }
      ]
    }
  ];
});
