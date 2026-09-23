/* Uitleg stap voor stap bij Tijdvakken sorteren: de tien tijdvakken, hun
   jaartallen en hoe je een gebeurtenis plaatst. */
STAPPEN.les('tijdvakken', function(){
  var S = STAPPEN;
  var JAAR = ['tot 3000 v.Chr.', '3000 v.Chr. tot 500', '500 tot 1000', '1000 tot 1500', '1500 tot 1600', '1600 tot 1700', '1700 tot 1800', '1800 tot 1900', '1900 tot 1950', 'vanaf 1950'];
  function lijst(tot){
    return S.tabel(['', 'tijdvak', 'jaren'], TIJDVAKKEN.slice(0, tot).map(function(t, i){ return [String(i + 1), t.naam.replace(/^\d+ /, ''), t.periode || JAAR[i]]; }));
  }
  return [
    {
      id: 'tien', naam: 'De tien tijdvakken', uitleg: 'Van jagers en boeren tot televisie en computer.',
      stappen: [
        { kop: 'Waarom tijdvakken?', beeld: S.formule('10 tijdvakken, elk met een eigen naam'),
          tekst: '<p>De geschiedenis is in tien stukken verdeeld. Elk tijdvak heeft een naam van twee woorden die zegt wat er toen typisch was.</p>' },
        { kop: 'De oudheid en de middeleeuwen', beeld: lijst(4),
          tekst: '<p>De eerste vier duren heel lang: duizenden jaren prehistorie, de Grieken en Romeinen, en de middeleeuwen in twee stukken.</p>' },
        { kop: 'Daarna elke eeuw een tijdvak', beeld: S.tabel(['', 'tijdvak', 'jaren'], TIJDVAKKEN.slice(4).map(function(t, i){ return [String(i + 5), t.naam.replace(/^\d+ /, ''), t.periode || JAAR[i + 4]]; })),
          tekst: '<p>Vanaf 1500 is elk tijdvak ongeveer honderd jaar. Tijdvak 9 en 10 zijn de twintigste eeuw en daarna.</p>' +
            S.bak('Ezelsbruggetje voor de namen: zeg ze elke dag een keer hardop, in volgorde. Na een week zitten ze erin.', 'goed') }
      ]
    },
    {
      id: 'plaatsen', naam: 'Een gebeurtenis plaatsen', uitleg: 'Wat past bij welk tijdvak?',
      stappen: [
        { kop: 'Zoek het sleutelwoord', beeld: S.formule('de <span class="st-na">stoommachine</span> komt in fabrieken'),
          tekst: '<p>Lees de gebeurtenis en zoek het woord dat het tijdvak verraadt. Stoommachine: dat is tijdvak 8, burgers en stoommachines.</p>' },
        { kop: 'Past het bij de naam?', beeld: S.tabel(['sleutelwoord', 'tijdvak'], [['ridders, kloosters', '3 monniken en ridders'], ['Columbus, Luther', '5 ontdekkers en hervormers'], ['VOC, stadhouder', '6 regenten en vorsten'], ['Franse Revolutie', '7 pruiken en revoluties']]),
          tekst: '<p>De naam van het tijdvak is vaak al een hint. Vraag jezelf: gaat dit over ridders, over ontdekkingsreizen, over een revolutie?</p>' },
        { kop: 'Weet je het jaartal?', beeld: S.formule('1648 → tussen 1600 en 1700 → tijdvak 6'),
          tekst: '<p>Staat er een jaartal bij, dan is het rekenen: tussen welke grenzen valt het?</p>' +
            S.bak('Twijfel je tussen twee? Denk aan wat er vóór en na kwam: eerst ontdekken (5), dan de Gouden Eeuw (6).', 'goed') }
      ]
    }
  ];
});
