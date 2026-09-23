/* Uitleg stap voor stap bij Het lichaam: de stelsels, waar de organen
   zitten en wat ze doen. */
STAPPEN.les('lichaam', function(){
  var S = STAPPEN;
  return [
    {
      id: 'stelsels', naam: 'Organen werken samen in stelsels', uitleg: 'Wat een stelsel is, en welke je leert.',
      stappen: [
        { kop: 'Een orgaan', beeld: S.formule('hart · longen · maag · lever · nieren'),
          tekst: '<p>Een <b>orgaan</b> is een deel van je lichaam met een eigen taak. Het hart pompt bloed, de longen halen zuurstof binnen.</p>' },
        { kop: 'Een orgaanstelsel', beeld: S.formule('mond → slokdarm → maag → darmen'),
          tekst: '<p>Organen die samen één taak doen, vormen een <b>orgaanstelsel</b>. Alle organen die je eten verwerken, samen het verteringsstelsel.</p>' },
        { kop: 'De stelsels in het spel', beeld: S.tabel(['stelsel', 'wat het doet', 'organen'], [
            ['spijsvertering', 'eten afbreken en opnemen', 'slokdarm, maag, lever, darmen'], ['ademhaling', 'zuurstof erin, koolstofdioxide eruit', 'luchtpijp, longen'],
            ['bloedsomloop', 'stoffen rondbrengen', 'hart, bloedvaten'], ['uitscheiding', 'afvalstoffen eruit', 'nieren, blaas'],
            ['zenuwstelsel', 'berichten doorgeven', 'hersenen, ruggenmerg'], ['hormonen', 'regelen met stofjes in je bloed', 'schildklier']]),
          tekst: '<p>Leer per stelsel: welke organen horen erbij, en wat doen ze samen.</p>' }
      ]
    },
    {
      id: 'plek', naam: 'Waar zit wat?', uitleg: 'Een paar vaste punten om de rest aan op te hangen.',
      stappen: [
        { kop: 'Borstkas en buik', beeld: S.formule('boven het middenrif: hart, longen &nbsp;|&nbsp; eronder: maag, lever, darmen'),
          tekst: '<p>Het <b>middenrif</b> is een spier die je romp in tweeën deelt. Daarboven in de borstkas: hart en longen. Daaronder in de buik: de verteringsorganen.</p>' },
        { kop: 'Links of rechts?', beeld: S.formule('lever rechts &nbsp;·&nbsp; maag links &nbsp;·&nbsp; hart iets links'),
          tekst: '<p>De <b>lever</b> is groot en ligt rechtsboven in je buik. De <b>maag</b> ligt links. Het hart zit in het midden, iets naar links.</p>' +
            S.bak('Let op: in een plaatje kijk je naar iemand toe. Zijn rechts is dan jouw links.', 'let') },
        { kop: 'Achteraan', beeld: S.formule('nieren: achter in je rug, links en rechts'),
          tekst: '<p>De <b>nieren</b> zitten achter in je buik, tegen je rug, ter hoogte van je middel. Het ruggenmerg loopt door je wervelkolom.</p>' }
      ]
    }
  ];
});
