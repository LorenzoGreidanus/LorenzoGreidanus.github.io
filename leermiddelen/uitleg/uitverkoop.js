/* Uitleg stap voor stap bij de Uitverkoop: procenten via 1 procent, korting,
   de nieuwe prijs, hoeveel procent, btw, prijs per kilo, acties en rente.
   De spullen en prijzen komen uit het spel zelf (spul, kies en euro in
   uitverkoop.html). */
STAPPEN.les('uitverkoop', function(){
  var S = STAPPEN;
  function e(v){ return '€ ' + euro(v); }
  function kaartje(naam, prijs, bord){
    return '<div style="display:inline-grid;gap:4px;justify-items:center;background:#fff;color:#14224C;border-radius:14px;padding:12px 18px;box-shadow:0 6px 16px rgba(0,0,0,.12)">' +
      '<span style="font-size:.85rem">' + S.schoon(naam) + '</span><b style="font-size:1.5rem">' + e(prijs) + '</b>' +
      (bord ? '<span style="background:#F26749;color:#fff;border-radius:999px;padding:2px 10px;font-weight:700;font-size:.85rem">' + S.schoon(bord) + '</span>' : '') + '</div>';
  }
  function pctStrook(p, onder){ return S.strook(20, Math.round(p / 5), { breed:300, onder:onder }); }

  return [
    {
      id: 'procent', naam: 'Procenten: de truc met 1 procent', uitleg: 'Eerst 1 procent uitrekenen, dan keer het aantal procent.',
      stappen: function(){
        var s = spul(2), p = kies([15, 20, 25, 40]);
        var een = s.prijs / 100;
        return [
          { kop: 'Procent is: van de honderd', beeld: S.strook(100, p, { breed:300, onder:p + ' van de 100' }),
            tekst: '<p>' + p + ' procent betekent: ' + p + ' van elke 100. Van € 100 is ' + p + '% dus precies € ' + p + '.</p>' },
          { kop: 'Eerst 1 procent', beeld: S.formule(e(s.prijs) + ' : 100 = <span class="st-na">' + e(een) + '</span>'),
            tekst: '<p>Van een ander bedrag reken je eerst uit hoeveel <b>1 procent</b> is. Deel het bedrag door 100.</p>' +
              '<p>1% van ' + e(s.prijs) + ' is ' + e(een) + '.</p>' },
          { kop: 'Dan keer het aantal procent', beeld: S.formule(e(een) + ' × ' + p + ' = <span class="st-na">' + e(een * p) + '</span>'),
            tekst: '<p>Wil je ' + p + '%, dan neem je die 1 procent ' + p + ' keer.</p>' +
              S.bak('Deze kun je sneller: 10% is door 10, 25% is door 4, 50% is de helft.', 'goed') }
        ];
      }
    },
    {
      id: 'korting', naam: 'Korting en de nieuwe prijs', uitleg: 'Hoeveel gaat eraf, en wat betaal je dan?',
      stappen: function(){
        var s = spul(2), p = kies([10, 20, 25, 30, 40]), af = s.prijs * p / 100, nieuw = s.prijs - af;
        return [
          { kop: 'In de etalage', beeld: kaartje(s.naam, s.prijs, p + '% korting'),
            tekst: '<p>De ' + S.schoon(s.naam) + ' kost ' + e(s.prijs) + ' en er is ' + p + '% korting. Twee vragen: hoeveel korting krijg je, en wat betaal je?</p>' },
          { kop: 'De korting', beeld: S.formule(e(s.prijs) + ' : 100 × ' + p + ' = <span class="st-na">' + e(af) + '</span>'),
            tekst: '<p>De korting is ' + p + '% van de prijs: 1 procent is ' + e(s.prijs / 100) + ', keer ' + p + ' is ' + e(af) + '.</p>' },
          { kop: 'De nieuwe prijs, manier 1', beeld: S.formule(e(s.prijs) + ' − ' + e(af) + ' = <span class="st-na">' + e(nieuw) + '</span>'),
            tekst: '<p>Haal de korting van de oude prijs af. Je betaalt ' + e(nieuw) + '.</p>' },
          { kop: 'De nieuwe prijs, manier 2', beeld: S.rij([pctStrook(100 - p, 'je betaalt ' + (100 - p) + '%')]) + S.formule(e(s.prijs) + ' : 100 × ' + (100 - p) + ' = ' + e(nieuw)),
            tekst: '<p>Bij ' + p + '% korting betaal je nog <b>' + (100 - p) + '%</b>. Reken dat meteen uit: dat scheelt een stap.</p>' +
              S.bak('Let op wat er gevraagd wordt: de korting (wat eraf gaat) of de prijs (wat je betaalt).', 'let') }
        ];
      }
    },
    {
      id: 'hoeveel', naam: 'Hoeveel procent korting?', uitleg: 'Je weet de oude en de nieuwe prijs, en zoekt het percentage.',
      stappen: function(){
        var s = spul(2), p = kies([10, 20, 25, 40, 60]), nieuw = s.prijs * (100 - p) / 100, af = s.prijs - nieuw;
        return [
          { kop: 'Van ' + e(s.prijs) + ' naar ' + e(nieuw), beeld: kaartje(s.naam, s.prijs, 'nu ' + e(nieuw)),
            tekst: '<p>De prijs gaat omlaag. Hoeveel procent korting is dat?</p>' },
          { kop: 'Eerst het verschil', beeld: S.formule(e(s.prijs) + ' − ' + e(nieuw) + ' = <span class="st-na">' + e(af) + '</span>'),
            tekst: '<p>De korting in euro is het verschil tussen de oude en de nieuwe prijs.</p>' },
          { kop: 'Deel door de oude prijs, keer 100', beeld: S.formule(e(af) + ' : ' + e(s.prijs) + ' × 100 = <span class="st-na">' + p + '%</span>'),
            tekst: '<p>Welk deel van de oude prijs is dat? Deel de korting door de <b>oude</b> prijs, en keer 100 maakt er procent van.</p>' +
              S.bak('Altijd delen door de oude prijs: dat is de 100 procent.', 'let') }
        ];
      }
    },
    {
      id: 'btw', naam: 'Btw erbij', uitleg: 'Een prijs zonder btw, en wat je aan de kassa betaalt.',
      stappen: function(){
        var s = spul(2), p = kies([9, 21]), btw = s.prijs * p / 100;
        return [
          { kop: 'Btw is belasting', beeld: kaartje(s.naam, s.prijs, 'zonder btw'),
            tekst: '<p>Op bijna alles wat je koopt zit btw, een belasting voor de overheid. Voor eten en boeken is het 9%, voor de meeste andere dingen 21%.</p>' +
              '<p>Deze ' + S.schoon(s.naam) + ' kost ' + e(s.prijs) + ' <b>zonder</b> btw. Er komt ' + p + '% bij.</p>' },
          { kop: 'Reken de btw uit', beeld: S.formule(e(s.prijs) + ' : 100 × ' + p + ' = <span class="st-na">' + e(btw) + '</span>'),
            tekst: '<p>' + p + '% van ' + e(s.prijs) + ' is ' + e(btw) + '.</p>' },
          { kop: 'Tel het erbij', beeld: S.formule(e(s.prijs) + ' + ' + e(btw) + ' = <span class="st-na">' + e(s.prijs + btw) + '</span>'),
            tekst: '<p>Met btw betaal je ' + e(s.prijs + btw) + '. Of in één keer: je betaalt ' + (100 + p) + '%, dus ' + e(s.prijs) + ' : 100 × ' + (100 + p) + '.</p>' }
        ];
      }
    },
    {
      id: 'eenheid', naam: 'Wat is voordeliger?', uitleg: 'Twee verpakkingen vergelijken met de prijs per kilo of per liter.',
      stappen: function(){
        var g1 = 0.5, g2 = 1.5, per = geheel(2, 4), p1 = Math.round(g1 * (per + 0.4) * 100) / 100, p2 = Math.round(g2 * per * 100) / 100;
        function k(g){ return String(g).replace('.', ','); }
        return [
          { kop: 'Twee flessen', beeld: S.rij([kaartje('A: ' + k(g1) + ' liter', p1), kaartje('B: ' + k(g2) + ' liter', p2)]),
            tekst: '<p>Fles A is goedkoper, maar er zit ook minder in. Welke is echt voordeliger?</p>' },
          { kop: 'Reken uit wat 1 liter kost', beeld: S.formule(e(p1) + ' : ' + k(g1) + ' = <span class="st-na">' + e(p1 / g1) + '</span> per liter'),
            tekst: '<p>Deel de prijs door het aantal liter. Voor A: ' + e(p1) + ' gedeeld door ' + k(g1) + '.</p>' },
          { kop: 'En voor B', beeld: S.formule(e(p2) + ' : ' + k(g2) + ' = <span class="st-na">' + e(p2 / g2) + '</span> per liter'),
            tekst: '<p>Nu kun je ze eerlijk vergelijken: allebei de prijs voor precies 1 liter.</p>' },
          { kop: (p1 / g1 <= p2 / g2 ? 'A' : 'B') + ' is voordeliger', beeld: S.formule('A ' + e(p1 / g1) + ' <span class="st-zacht">tegen</span> B ' + e(p2 / g2)),
            tekst: '<p>De laagste prijs per liter is het voordeligst. Hier is dat ' + (p1 / g1 <= p2 / g2 ? 'A' : 'B') + '.</p>' +
              S.bak('Een grote verpakking is vaak voordeliger, maar niet altijd. Reken het na.', 'goed') }
        ];
      }
    },
    {
      id: 'actie', naam: 'Acties: 1 + 1 gratis', uitleg: 'Hoeveel betaal je echt bij een aanbieding?',
      stappen: function(){
        var s = spul(2);
        return [
          { kop: '1 + 1 gratis', beeld: kaartje(s.naam, s.prijs, '1 + 1 gratis'),
            tekst: '<p>Bij 1 + 1 gratis krijg je bij elke die je betaalt er een bij. Neem je er 4, dan betaal je er 2: ' + e(2 * s.prijs) + '.</p>' },
          { kop: '2 + 1 gratis', beeld: kaartje(s.naam, s.prijs, '2 + 1 gratis'),
            tekst: '<p>Bij 2 + 1 gratis is elke derde gratis. Neem je er 3, dan betaal je er 2: ' + e(2 * s.prijs) + '. Neem je er 4, dan betaal je er 3.</p>' },
          { kop: 'Tweede halve prijs', beeld: S.formule(e(s.prijs) + ' + ' + e(s.prijs / 2) + ' = <span class="st-na">' + e(s.prijs * 1.5) + '</span>'),
            tekst: '<p>De eerste kost de volle prijs, de tweede de helft. Voor twee betaal je anderhalve keer de prijs.</p>' +
              S.bak('Maak een rijtje: wat kost de eerste, de tweede, de derde? Dan tel je op.', 'goed') }
        ];
      }
    },
    {
      id: 'rente', naam: 'Sparen met rente', uitleg: 'Rente over rente: elk jaar keer hetzelfde getal.',
      stappen: function(){
        var start = kies([200, 400, 500]), p = kies([2, 3, 5]), f = 1 + p / 100, j1 = start * f, j2 = j1 * f;
        var fk = f.toFixed(2).replace('.', ',');
        return [
          { kop: 'Rente is geld erbij', beeld: kaartje('spaarrekening', start, p + '% rente per jaar'),
            tekst: '<p>Op een spaarrekening krijg je elk jaar rente: de bank zet er een percentage bij. Hier ' + p + '% per jaar.</p>' },
          { kop: 'Na een jaar', beeld: S.formule(e(start) + ' × ' + fk + ' = <span class="st-na">' + e(j1) + '</span>'),
            tekst: '<p>Je hebt 100% en er komt ' + p + '% bij, dus je hebt ' + (100 + p) + '%. Dat is keer ' + fk + '.</p>' },
          { kop: 'Na twee jaar', beeld: S.formule(e(j1) + ' × ' + fk + ' = <span class="st-na">' + e(j2) + '</span>'),
            tekst: '<p>Het tweede jaar krijg je rente over het hele bedrag, ook over de rente van het eerste jaar. Daarom is het meer dan twee keer ' + e(start * p / 100) + ' erbij.</p>' +
              S.bak('Na n jaar: beginbedrag × ' + fk + ' tot de macht n.', 'goed') }
        ];
      }
    }
  ];
});
