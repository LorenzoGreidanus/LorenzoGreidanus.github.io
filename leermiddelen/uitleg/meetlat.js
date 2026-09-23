/* Uitleg stap voor stap bij Langs de meetlat. */
STAPPEN.les('meetlat', function(){
  var S = STAPPEN;
  function lat(pos){
    return '<div style="width:min(460px,100%);display:grid;gap:6px"><div style="position:relative;height:14px;border-radius:999px;background:linear-gradient(90deg,#1f6b41,#EA9836,#a8371f)">' +
      (pos != null ? '<span style="position:absolute;left:calc(' + pos + '% - 10px);top:-5px;width:20px;height:24px;border-radius:6px;background:#fff;border:2px solid #14224C"></span>' : '') +
      '</div><div style="display:flex;justify-content:space-between;font-size:.85rem;font-weight:600"><span>goed</span><span>fout</span></div></div>';
  }
  return [
    {
      id: 'oordelen', naam: 'Oordelen over het verleden', uitleg: 'Keuzes tijdens de bezetting, en waarom oordelen lastig is.',
      stappen: [
        { kop: 'Keuzes in de bezetting', beeld: S.formule('1940–1945 · Nederland bezet door Duitsland'),
          tekst: '<p>Tijdens de Tweede Wereldoorlog moesten gewone mensen keuzes maken: meewerken, zwijgen, helpen of verzet plegen. Vaak zonder te weten hoe het zou aflopen.</p>' },
        { kop: 'Goed, fout, en alles ertussen', beeld: lat(50),
          tekst: '<p>Na de oorlog sprak men vaak van "goed" en "fout". Maar veel keuzes lagen ergens ertussen: wie meewerkte om zijn gezin te voeden, deed dat iets verkeerds?</p>' },
        { kop: 'Meer weten verandert je oordeel', beeld: lat(30),
          tekst: '<p>Een oordeel hangt af van wat je weet: wat wist iemand toen, wat kon hij kiezen, en wat gebeurde er daarna? Hoe meer je weet, hoe preciezer je oordeelt.</p>' +
            S.bak('Oordeel met de kennis van toen, niet alleen met de kennis van nu.', 'goed') }
      ]
    },
    {
      id: 'spel', naam: 'Zo speel je', uitleg: 'Schuiven, lezen hoe het verderging, en opnieuw schuiven.',
      stappen: [
        { kop: 'Schuif de kaart', beeld: lat(20),
          tekst: '<p>Je krijgt zestien mensen die een keuze maakten. Schuif elke kaart langs de meetlat, van goed naar fout.</p>' },
        { kop: 'Lees hoe het verderging', beeld: lat(65),
          tekst: '<p>Daarna lees je wat er met die persoon gebeurde. Dan mag je je oordeel bijstellen. Het spel rekent je niet na: er is geen goed antwoord.</p>' },
        { kop: 'Kijk of je bent opgeschoven', beeld: S.formule('eerste oordeel → tweede oordeel'),
          tekst: '<p>Aan het eind zie je hoe vaak je van mening veranderde. Bespreek met de klas: waarom schoof je?</p>' }
      ]
    }
  ];
});
