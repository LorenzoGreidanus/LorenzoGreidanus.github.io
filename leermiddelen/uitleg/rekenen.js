/* Uitleg stap voor stap bij de Rekenrace: per onderdeel van rekenen de
   manier waarop je het uit je hoofd doet, met een voorbeeld dat elke keer
   anders is. */
STAPPEN.les('rekenen', function(){
  var S = STAPPEN;
  function r(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
  function k(x){ return String(Math.round(x * 1000) / 1000).replace('.', ','); }
  /* een getallenlijn van van tot tot, met een sprong van a naar b */
  function lijn(van, tot, a, b){
    var w = 460, stap = w / (tot - van), y = 40, uit = '<line x1="10" y1="' + y + '" x2="' + (w + 10) + '" y2="' + y + '" stroke="currentColor" stroke-width="2"/>';
    for (var i = van; i <= tot; i++){
      var x = 10 + (i - van) * stap;
      uit += '<line x1="' + x + '" y1="' + (y - 6) + '" x2="' + x + '" y2="' + (y + 6) + '" stroke="currentColor" stroke-width="' + (i === 0 ? 3 : 1.5) + '"/>' +
        '<text x="' + x + '" y="' + (y + 24) + '" text-anchor="middle" font-size="13" fill="currentColor" font-weight="' + (i === 0 ? 700 : 400) + '">' + i + '</text>';
    }
    if (a != null){
      var xa = 10 + (a - van) * stap, xb = 10 + (b - van) * stap, mid = (xa + xb) / 2;
      uit += '<path d="M' + xa + ' ' + (y - 8) + ' Q' + mid + ' ' + (y - 40) + ' ' + xb + ' ' + (y - 8) + '" fill="none" stroke="#F26749" stroke-width="3" marker-end="url(#pijl)"/>' +
        '<circle cx="' + xa + '" cy="' + y + '" r="6" fill="#204ECF"/><circle cx="' + xb + '" cy="' + y + '" r="6" fill="#F26749"/>';
    }
    return '<svg viewBox="0 0 480 76" width="480" style="max-width:100%;height:auto" aria-hidden="true"><defs><marker id="pijl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#F26749"/></marker></defs>' + uit + '</svg>';
  }

  return [
    {
      id: 'tafels', naam: 'Tafels: trucs om ze te onthouden', uitleg: 'Van de tafel van 9 tot omdraaien: minder uit je hoofd leren.',
      stappen: function(){
        var a = r(3, 9), b = r(6, 9);
        return [
          { kop: 'Omdraaien mag', beeld: S.formule(a + ' × ' + b + ' = ' + b + ' × ' + a),
            tekst: '<p>Bij keer maakt de volgorde niet uit. Ken je ' + b + ' × ' + a + ', dan ken je ook ' + a + ' × ' + b + '. Dat scheelt de helft van alle tafels.</p>' },
          { kop: 'Via een tafel die je wel kent', beeld: S.formule(b + ' × ' + a + ' = 10 × ' + a + ' − ' + (10 - b) + ' × ' + a + ' = <span class="st-na">' + (a * b) + '</span>'),
            tekst: '<p>Keer 10 is makkelijk: zet er een nul achter. Van daaruit ga je terug: ' + b + ' is ' + (10 - b) + ' minder dan 10.</p>' +
              '<p>10 × ' + a + ' = ' + (10 * a) + ', min ' + (10 - b) + ' × ' + a + ' = ' + ((10 - b) * a) + ', is ' + (a * b) + '.</p>' },
          { kop: 'Verdubbelen', beeld: S.formule('4 × ' + a + ' = 2 × 2 × ' + a + ' = <span class="st-na">' + (4 * a) + '</span>'),
            tekst: '<p>Keer 4 is twee keer verdubbelen: ' + a + ' → ' + (2 * a) + ' → ' + (4 * a) + '. Keer 8 is drie keer verdubbelen.</p>' },
          { kop: 'De tafel van 9', beeld: S.formule('9 × ' + a + ' = ' + (10 * a) + ' − ' + a + ' = <span class="st-na">' + (9 * a) + '</span>'),
            tekst: '<p>9 keer iets is 10 keer min één keer. En de cijfers van de uitkomst tellen samen altijd op tot 9: ' + String(9 * a).split('').join(' + ') + ' = 9.</p>' +
              S.bak('Oefen elke dag vijf minuten de tafels die nog niet vanzelf gaan. Dat werkt beter dan één keer een uur.', 'goed') }
        ];
      }
    },
    {
      id: 'hoofd', naam: 'Hoofdrekenen: handig splitsen', uitleg: 'Grote sommen in stukken die je wel uit je hoofd kunt.',
      stappen: function(){
        var a = r(34, 89), b = r(23, 68), c = r(12, 19), d = r(6, 9);
        var at = a - a % 10, ae = a % 10;
        return [
          { kop: 'Optellen: eerst de tientallen', beeld: S.formule(a + ' + ' + b + ' = ' + a + ' + ' + (b - b % 10) + ' + ' + (b % 10)),
            tekst: '<p>Splits het tweede getal in tientallen en eenheden. Eerst ' + a + ' + ' + (b - b % 10) + ' = ' + (a + b - b % 10) + ', dan + ' + (b % 10) + ' = <b>' + (a + b) + '</b>.</p>' },
          { kop: 'Aftrekken: in twee sprongen', beeld: S.formule(a + ' − ' + (c) + ' = ' + a + ' − 10 − ' + (c - 10) + ' = <span class="st-na">' + (a - c) + '</span>'),
            tekst: '<p>Haal eerst de tien eraf (' + (a - 10) + '), dan de rest (' + (a - c) + ').</p>' },
          { kop: 'Keer: splits het grote getal', beeld: S.formule(a + ' × ' + d + ' = ' + at + ' × ' + d + ' + ' + ae + ' × ' + d + ' = ' + (at * d) + ' + ' + (ae * d) + ' = <span class="st-na">' + (a * d) + '</span>'),
            tekst: '<p>' + a + ' is ' + at + ' en ' + ae + '. Doe beide stukken keer ' + d + ' en tel ze op.</p>' },
          { kop: 'Handig: bijna een rond getal', beeld: S.formule(a + ' + 99 = ' + a + ' + 100 − 1 = <span class="st-na">' + (a + 99) + '</span>'),
            tekst: '<p>Ligt een getal vlak bij een rond getal, reken dan met het ronde getal en verbeter achteraf.</p>' +
              S.bak('Schat eerst: dan zie je meteen of een antwoord kan kloppen.', 'goed') }
        ];
      }
    },
    {
      id: 'negatief', naam: 'Negatieve getallen', uitleg: 'Rekenen onder de nul, met de getallenlijn.',
      stappen: function(){
        var a = r(-4, 2), b = r(3, 6);
        return [
          { kop: 'De getallenlijn', beeld: lijn(-8, 8),
            tekst: '<p>Links van de 0 staan de negatieve getallen. Hoe verder naar links, hoe kleiner: −6 is kleiner dan −2, net als het kouder is bij −6 graden dan bij −2.</p>' },
          { kop: 'Plus: naar rechts', beeld: lijn(-8, 8, a, a + b),
            tekst: '<p>' + a + ' + ' + b + ': begin bij ' + a + ' en ga ' + b + ' stappen naar rechts. Je komt uit op <b>' + (a + b) + '</b>.</p>' },
          { kop: 'Min: naar links', beeld: lijn(-8, 8, a, a - b),
            tekst: '<p>' + a + ' − ' + b + ': begin bij ' + a + ' en ga ' + b + ' stappen naar links. Je komt uit op <b>' + (a - b) + '</b>.</p>' },
          { kop: 'Min een min is plus', beeld: S.formule(a + ' − (−' + b + ') = ' + a + ' + ' + b + ' = <span class="st-na">' + (a + b) + '</span>'),
            tekst: '<p>Een negatief getal aftrekken is hetzelfde als het positieve getal erbij doen. Twee mintekens naast elkaar worden een plus.</p>' +
              S.bak('Bij keer en delen: min keer min is plus, min keer plus is min. −3 × −4 = 12, −3 × 4 = −12.', 'goed') }
        ];
      }
    },
    {
      id: 'komma', naam: 'Kommagetallen', uitleg: 'Tienden en honderdsten, en de komma bij keer 10 en gedeeld door 10.',
      stappen: function(){
        var g = r(12, 98) / 10, h = r(2, 9);
        return [
          { kop: 'Achter de komma', beeld: S.tabel(['T', 'E', ',', 't', 'h'], [['', '3', ',', '<span class="st-na">4</span>', '7']]),
            tekst: '<p>Na de eenheden komt de komma, en daarna de <b>tienden</b> en de <b>honderdsten</b>. In 3,47 is de 4 vier tienden en de 7 zeven honderdsten.</p>' },
          { kop: 'Keer 10: alles een plek naar links', beeld: S.formule(k(g) + ' × 10 = <span class="st-na">' + k(g * 10) + '</span>'),
            tekst: '<p>Bij keer 10 wordt elk cijfer tien keer zoveel waard: het schuift een plek op. Dat lijkt alsof de komma een plek naar rechts gaat.</p>' },
          { kop: 'Gedeeld door 10: een plek naar rechts', beeld: S.formule(k(g) + ' : 10 = <span class="st-na">' + k(g / 10) + '</span>'),
            tekst: '<p>Bij delen door 10 schuift alles terug. De komma lijkt een plek naar links te gaan.</p>' },
          { kop: 'Keer een heel getal', beeld: S.formule(k(g) + ' × ' + h + ' → ' + Math.round(g * 10) + ' × ' + h + ' = ' + (Math.round(g * 10) * h) + ' → <span class="st-na">' + k(g * h) + '</span>'),
            tekst: '<p>Reken eerst zonder komma, en zet hem er daarna weer in: er komen evenveel cijfers achter de komma als in de som.</p>' }
        ];
      }
    },
    {
      id: 'machten', naam: 'Machten en wortels', uitleg: 'Wat 3 tot de macht 4 betekent, en de wortel terug.',
      stappen: function(){
        var g = r(2, 5), m = r(2, 4), w = r(4, 12);
        var reeks = []; for (var i = 0; i < m; i++) reeks.push(g);
        return [
          { kop: 'Een macht is herhaald keer', beeld: S.formule(g + '<sup>' + m + '</sup> = ' + reeks.join(' × ') + ' = <span class="st-na">' + Math.pow(g, m) + '</span>'),
            tekst: '<p>Het kleine getal zegt hoe vaak je het grote getal met zichzelf keer doet. ' + g + ' tot de macht ' + m + ' is ' + m + ' keer een ' + g + '.</p>' +
              S.bak('Niet ' + g + ' × ' + m + ' = ' + (g * m) + ': dat is de fout die het vaakst gemaakt wordt.', 'let') },
          { kop: 'Kwadraat: een vierkant', beeld: S.formule(w + '<sup>2</sup> = ' + w + ' × ' + w + ' = <span class="st-na">' + (w * w) + '</span>'),
            tekst: '<p>Tot de macht 2 heet ook kwadraat. Een vierkant van ' + w + ' bij ' + w + ' bestaat uit ' + (w * w) + ' hokjes.</p>' },
          { kop: 'De wortel gaat terug', beeld: S.formule('√' + (w * w) + ' = <span class="st-na">' + w + '</span>'),
            tekst: '<p>De wortel vraagt: welk getal keer zichzelf geeft ' + (w * w) + '? Dat is ' + w + ', want ' + w + ' × ' + w + ' = ' + (w * w) + '.</p>' +
              S.bak('Leer de kwadraten tot 15 × 15 = 225 uit je hoofd: dan ken je ook de wortels.', 'goed') }
        ];
      }
    },
    {
      id: 'verhouding', naam: 'Verhoudingen', uitleg: 'Met een verhoudingstabel van wat je weet naar wat je zoekt.',
      stappen: function(){
        var n = r(2, 4), p = r(3, 6) * 50, doel = n * r(3, 5);
        var een = p / n;
        return [
          { kop: 'De vraag', beeld: S.formule(n + ' pakken kosten ' + p + ' cent. Wat kosten er ' + doel + '?'),
            tekst: '<p>Bij een verhouding horen twee rijen bij elkaar: het aantal pakken en de prijs. Wat je met de ene rij doet, doe je ook met de andere.</p>' },
          { kop: 'Zet het in een tabel', beeld: S.tabel(['pakken', String(n), '1', String(doel)], [['cent', String(p), '?', '?']]),
            tekst: '<p>Bovenaan de pakken, onderaan de prijs. Eerst terug naar 1 pak.</p>' },
          { kop: 'Terug naar 1', beeld: S.tabel(['pakken', String(n), '<span class="st-na">1</span>', String(doel)], [['cent', String(p), '<span class="st-na">' + een + '</span>', '?']]),
            tekst: '<p>Deel boven en onder door ' + n + ': 1 pak kost ' + p + ' : ' + n + ' = ' + een + ' cent.</p>' },
          { kop: 'Naar wat je zoekt', beeld: S.tabel(['pakken', String(n), '1', '<span class="st-na">' + doel + '</span>'], [['cent', String(p), String(een), '<span class="st-na">' + (een * doel) + '</span>']]),
            tekst: '<p>Keer boven en onder ' + doel + ': ' + doel + ' pakken kosten ' + een + ' × ' + doel + ' = ' + (een * doel) + ' cent.</p>' +
              S.bak('Boven en onder altijd hetzelfde doen, dan klopt de verhouding.', 'goed') }
        ];
      }
    },
    {
      id: 'gemiddelde', naam: 'Het gemiddelde', uitleg: 'Alles bij elkaar, en dan eerlijk verdelen.',
      stappen: function(){
        var l = [r(4, 9), r(4, 9), r(4, 9), r(4, 9)], som = l.reduce(function(a, b){ return a + b; }, 0);
        return [
          { kop: 'Vier cijfers', beeld: S.formule(l.join(' &nbsp; ')),
            tekst: '<p>Iemand haalde deze cijfers. Wat is het gemiddelde?</p>' },
          { kop: 'Tel alles op', beeld: S.formule(l.join(' + ') + ' = <span class="st-na">' + som + '</span>'),
            tekst: '<p>Het gemiddelde is wat iedereen zou krijgen als je alles eerlijk verdeelt. Eerst alles bij elkaar.</p>' },
          { kop: 'Deel door het aantal', beeld: S.formule(som + ' : 4 = <span class="st-na">' + k(som / 4) + '</span>'),
            tekst: '<p>Het waren 4 cijfers, dus deel door 4. Het gemiddelde is ' + k(som / 4) + '.</p>' +
              S.bak('Deel door het aantal getallen, niet door het grootste getal.', 'let') }
        ];
      }
    },
    {
      id: 'meten', naam: 'Meten: omrekenen met de trap', uitleg: 'Kilometer, meter, centimeter: welke kant op en hoeveel keer.',
      stappen: function(){
        var m = r(2, 9) + r(1, 9) / 10;
        return [
          { kop: 'De trap van lengtematen', beeld: S.tabel(['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'], [['kilo', 'hecto', 'deca', 'meter', 'deci', 'centi', 'milli']]),
            tekst: '<p>Elke stap op de trap is <b>keer 10</b>. Naar rechts (kleiner) keer 10 per stap, naar links (groter) gedeeld door 10.</p>' },
          { kop: 'Van meter naar centimeter', beeld: S.formule(k(m) + ' m = ' + k(m) + ' × 100 = <span class="st-na">' + k(m * 100) + ' cm</span>'),
            tekst: '<p>Van m naar cm zijn 2 stappen naar rechts: keer 10 keer 10 is keer 100.</p>' },
          { kop: 'Van meter naar kilometer', beeld: S.formule(k(m * 100) + ' m = ' + k(m * 100) + ' : 1000 = <span class="st-na">' + k(m / 10) + ' km</span>'),
            tekst: '<p>Van m naar km zijn 3 stappen naar links: gedeeld door 1000.</p>' +
              S.bak('Bij oppervlakte (m²) is elke stap keer 100, bij inhoud (m³) keer 1000. En 1 liter is 1 dm³.', 'goed') }
        ];
      }
    }
  ];
});
