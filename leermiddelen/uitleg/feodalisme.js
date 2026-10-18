/* Uitleg stap voor stap bij Feodalisme: de piramide van koning, ridder en
   boer, wat ze elkaar geven, en hoe je het spel met de klas speelt. */
STAPPEN.les('feodalisme', function(){
  var S = STAPPEN;
  function piramide(licht){
    var l = ['koning', 'ridders', 'boeren'];
    return '<div style="display:grid;justify-items:center;gap:4px">' + l.map(function(x, i){
      return '<span style="width:' + (120 + i * 90) + 'px;text-align:center;border-radius:10px;padding:8px;font-weight:600;' + (licht === i ? 'background:#EA9836;color:#14224C' : 'background:rgba(234,152,54,.25)') + '">' + x + '</span>';
    }).join('') + '</div>';
  }
  return [
    {
      id: 'piramide', naam: 'De feodale piramide', uitleg: 'Koning, ridder en boer, en wat ze elkaar geven.',
      stappen: [
        { kop: 'Drie lagen', beeld: piramide(),
          tekst: '<p>In de middeleeuwen was de samenleving een piramide: bovenaan de koning en de grote heren, daaronder de ridders, en onderaan de grote groep boeren.</p>' },
        { kop: 'De koning geeft land in leen', beeld: piramide(0),
          tekst: '<p>Een koning kon niet overal tegelijk zijn. Daarom gaf hij stukken land in leen aan ridders en edelen. Zij beheerden het land voor hem.</p>' },
        { kop: 'De ridder zweert trouw', beeld: piramide(1),
          tekst: '<p>In ruil voor zijn leen zweert de ridder een eed van trouw. Roept de koning hem op, dan komt hij met soldaten: de heervaart. Zo wordt hij een vazal van de koning.</p>' },
        { kop: 'De boer werkt het land', beeld: piramide(2),
          tekst: '<p>Boeren wonen op het land van een heer. Ze staan een deel van hun oogst af en werken soms voor hem: herendienst. In ruil beschermt de heer hen tegen rovers en vijanden.</p>' +
            S.bak('Iedereen heeft iets nodig van een ander: land, soldaten, voedsel of bescherming. Daarom bleef de piramide eeuwenlang staan.', 'goed') }
      ]
    },
    {
      id: 'spel', naam: 'Zo speel je met de klas', uitleg: 'Drie koningen, een kaart en een klok die door de seizoenen loopt.',
      stappen: [
        { kop: 'Kastelen en land', beeld: S.formule('kasteel → land eromheen → land in leen'),
          tekst: '<p>Drie koningen kiezen op hun telefoon een plek voor hun kasteel. Ze krijgen het land eromheen, en kunnen stukken in leen geven aan ridders.</p>' },
        { kop: 'Ridders en boeren', beeld: S.formule('ridder: trouw en soldaten &nbsp;·&nbsp; boer: oogst'),
          tekst: '<p>Ridders zoeken een koning, zweren trouw en krijgen land. Elk voorjaar levert hun land soldaten. Boeren kiezen een heer om bij te wonen en geven hem een deel van de oogst.</p>' },
        { kop: 'De seizoenen', beeld: S.formule('lente · zomer · herfst · winter'),
          tekst: '<p>In de zomer trek je ten strijde. In de herfst wordt geoogst: wie dan plundert, pakt de oogst af. In de winter eet iedereen, ook elke soldaat. Te weinig voedsel? Dan lopen soldaten weg, en boerenfamilies trekken weg.</p>' +
            S.bak('Let op tijdens het spel: wie heeft echt de macht, de koning of zijn ridders?', 'goed') }
      ]
    }
  ];
});
