/* Uitleg stap voor stap bij het Bronnenlab: de drie vragen van een
   historicus, en primair tegenover secundair. */
STAPPEN.les('bronnenlab', function(){
  var S = STAPPEN;
  var BRON = '<blockquote style="margin:0;max-width:480px;font-style:italic;text-align:left;border-left:4px solid #EA9836;padding:4px 12px">"Onze dappere soldaten verjoegen de vijand in één dag. Niemand van ons raakte gewond."<br><span style="font-style:normal;font-size:.85rem">Brief van een generaal aan de koning, 1702</span></blockquote>';
  return [
    {
      id: 'drie', naam: 'De drie vragen bij een bron', uitleg: 'Wie maakte hem, wanneer, en wat wordt weggelaten?',
      stappen: [
        { kop: 'Een bron', beeld: BRON,
          tekst: '<p>Een <b>bron</b> is alles waaruit je iets over het verleden kunt leren: een brief, een foto, een schilderij, een munt, een krant. Maar een bron vertelt nooit zomaar de waarheid.</p>' },
        { kop: '1. Wie maakte dit, en waarom?', beeld: BRON.replace('een generaal', '<b>een generaal</b>'),
          tekst: '<p>Iemand heeft de bron gemaakt, met een reden. Een generaal die aan de koning schrijft, wil graag goed overkomen. Dat kleurt wat hij schrijft.</p>' },
        { kop: '2. Wanneer is het gemaakt?', beeld: BRON.replace('1702', '<b>1702</b>'),
          tekst: '<p>Op het moment zelf, of pas veel later? Een bron uit de tijd zelf heet <b>primair</b>. Een boek dat er later over geschreven is, heet <b>secundair</b>.</p>' },
        { kop: '3. Wat wordt weggelaten?', beeld: BRON,
          tekst: '<p>Wat zie of hoor je juist niet? Hier: niets over gewonden aan de andere kant, niets over wat het kostte. Wat ontbreekt, zegt soms net zoveel als wat er staat.</p>' +
            S.bak('Betrouwbaar is niet hetzelfde als bruikbaar. Een eenzijdige bron vertelt je nog steeds hoe die generaal wilde dat de koning erover dacht.', 'goed') }
      ]
    }
  ];
});
