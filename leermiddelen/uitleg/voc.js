/* Uitleg stap voor stap bij De VOC-beurs. */
STAPPEN.les('voc', function(){
  var S = STAPPEN;
  return [
    {
      id: 'geschiedenis', naam: 'Van vloot naar aandeel', uitleg: 'Waarom de VOC iets nieuws was.',
      stappen: [
        { kop: 'De voorcompagnieën', beeld: S.formule('één vloot &nbsp;→&nbsp; terug: rijk &nbsp;·&nbsp; vergaan: alles kwijt'),
          tekst: '<p>Rond 1600 had elke vloot naar Azië eigen geldschieters. Kwam de vloot terug, dan verdienden ze veel. Verging hij, dan waren ze hun geld kwijt.</p>' },
        { kop: 'Te veel concurrentie', beeld: S.formule('meer schepen &nbsp;→&nbsp; duurder inkopen, goedkoper verkopen'),
          tekst: '<p>Al die compagnieën concurreerden met elkaar. In Azië stegen de prijzen, in Amsterdam zakten ze.</p>' },
        { kop: '1602: de VOC', beeld: S.tabel(['wat', 'betekenis'], [['aandeel', 'een stukje van het hele bedrijf'], ['beurs', 'de plek waar je aandelen koopt en verkoopt'], ['octrooi', 'monopolie, en het recht om oorlog te voeren en forten te bouwen'], ['dividend', 'een deel van de winst voor de aandeelhouders']]),
          tekst: '<p>De Staten-Generaal lieten de compagnieën samengaan in de Verenigde Oost-Indische Compagnie. Je kocht een aandeel in het hele bedrijf, en dat aandeel kon je op de beurs weer verkopen.</p>' },
        { kop: 'De rekening', beeld: S.formule('winst in Amsterdam &nbsp;↔&nbsp; geweld en slavernij in Azië'),
          tekst: '<p>De winst kwam van specerijen die de VOC met geweld in handen kreeg, zoals de nootmuskaat van de Banda-eilanden. Ook stierven veel zeelieden onderweg.</p>' }
      ]
    },
    {
      id: 'spel', naam: 'Zo speel je', uitleg: 'Beleggen van 1598 tot 1629.',
      stappen: [
        { kop: 'Iedereen krijgt geld', beeld: S.tabel(['rol', 'begint met'], [['bewindhebber', 'f 6.000'], ['koopman', 'f 4.000'], ['weduwe', 'f 2.500'], ['predikant', 'f 1.200'], ['timmerman', 'f 600'], ['dienstmeid', 'f 200']]),
          tekst: '<p>Wie het rijkst wordt, telt in procenten: zo kan de dienstmeid net zo goed winnen als de koopman.</p>' },
        { kop: 'Geruchten', beeld: S.formule('een gerucht kan waar zijn, of niet'),
          tekst: '<p>Op je telefoon hoor je soms een gerucht. De bewindhebbers weten wat er echt gebeurde. Als veel mensen tegelijk kopen of verkopen, gaat de koers daardoor ook op of neer.</p>' },
        { kop: 'Verzegelde brieven', beeld: S.formule('elk jaar een brief &nbsp;→&nbsp; open aan het eind'),
          tekst: '<p>Elk jaar gaat er een verzegelde brief op de stapel. Pas aan het eind gaan ze open. Dan zie je wat de winst van dat jaar kostte.</p>' }
      ]
    }
  ];
});
