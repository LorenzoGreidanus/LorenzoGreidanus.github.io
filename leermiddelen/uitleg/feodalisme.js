/* Uitleg stap voor stap bij Het feodalisme: de piramide van heer, ridder
   en boer, en de drie afspraken die hem overeind houden. */
STAPPEN.les('feodalisme', function(){
  var S = STAPPEN;
  function piramide(licht){
    var l = ['heer', 'ridder', 'boer'];
    return '<div style="display:grid;justify-items:center;gap:4px">' + l.map(function(x, i){
      return '<span style="width:' + (120 + i * 90) + 'px;text-align:center;border-radius:10px;padding:8px;font-weight:600;' + (licht === i ? 'background:#EA9836;color:#14224C' : 'background:rgba(234,152,54,.25)') + '">' + x + '</span>';
    }).join('') + '</div>';
  }
  return [
    {
      id: 'piramide', naam: 'De feodale piramide', uitleg: 'Heer, ridder en boer, en wat ze elkaar geven.',
      stappen: [
        { kop: 'Drie lagen', beeld: piramide(),
          tekst: '<p>In de middeleeuwen was de samenleving een piramide: bovenaan de heer, daaronder de ridders, en onderaan de grote groep boeren.</p>' },
        { kop: 'De heer geeft land en bescherming', beeld: piramide(0),
          tekst: '<p>De heer bezit het land. Hij geeft stukken ervan aan ridders, en belooft iedereen te beschermen.</p>' },
        { kop: 'De ridder geeft trouw', beeld: piramide(1),
          tekst: '<p>In ruil voor land zweert de ridder trouw: hij vecht voor de heer als die hem nodig heeft.</p>' },
        { kop: 'De boer geeft voedsel en werk', beeld: piramide(2),
          tekst: '<p>De boeren werken op het land en leveren een deel van de oogst af. In ruil worden ze beschermd tegen rovers en vijanden.</p>' +
            S.bak('Iedereen heeft iets nodig van een ander. Daarom bleef de piramide eeuwenlang staan.', 'goed') }
      ]
    },
    {
      id: 'spel', naam: 'Zo speel je', uitleg: 'Elk jaar een keuze, drie meters in evenwicht.',
      stappen: [
        { kop: 'Elk jaar kiezen', beeld: S.formule('arbeid · bescherming · oogst'),
          tekst: '<p>Je speelt de heer, een ridder of een boer. Elk jaar kies je wat je geeft en wat je houdt. Er zijn geen goede antwoorden, alleen keuzes met gevolgen.</p>' },
        { kop: 'Drie meters', beeld: S.formule('eten · veiligheid · trouw'),
          tekst: '<p>De meters laten zien hoe het met de afspraken staat. Zakt er een te ver, dan wordt de band rood en begint de piramide te wankelen.</p>' +
            S.bak('Let aan het eind op de vraag: waarom bleef dit zo lang bestaan, ook al was het niet eerlijk?', 'goed') }
      ]
    }
  ];
});
