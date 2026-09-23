/* Uitleg stap voor stap bij Vlakken herkennen: waar je op let (zijden,
   rechte hoeken, evenwijdig, symmetrie) en hoe je de vierhoeken, de
   driehoeken en de veelhoeken uit elkaar houdt. De figuren komen uit het
   spel zelf (VORMEN in vlakken.html). */
STAPPEN.les('vlakken', function(){
  var S = STAPPEN;
  function v(id){ return VORMEN.filter(function(x){ return x.id === id; })[0]; }
  /* een figuur tekenen; extra is svg die erbovenop komt (assen, hoekjes) */
  function vorm(id, extra, maat){
    var f = v(id), m = maat || 130, lijf;
    if (f.rond === 'cirkel') lijf = '<circle cx="85" cy="85" r="66"/>';
    else if (f.rond === 'ovaal') lijf = '<ellipse cx="85" cy="85" rx="72" ry="48"/>';
    else lijf = '<polygon points="' + f.p + '"/>';
    return '<figure><svg viewBox="0 0 170 170" width="' + m + '" height="' + m + '" aria-hidden="true"><g fill="rgba(234,152,54,.35)" stroke="currentColor" stroke-width="3" stroke-linejoin="round">' + lijf + '</g>' + (extra || '') + '</svg><figcaption>' + f.naam + '</figcaption></figure>';
  }
  var AS = function(x1, y1, x2, y2){ return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#F26749" stroke-width="2.5" stroke-dasharray="7 5"/>'; };
  var HOEK = function(x, y, dx, dy){ return '<path d="M' + (x + dx) + ' ' + y + ' L' + (x + dx) + ' ' + (y + dy) + ' L' + x + ' ' + (y + dy) + '" fill="none" stroke="#204ECF" stroke-width="2.5"/>'; };
  var ZIJ = function(x1, y1, x2, y2){ return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#204ECF" stroke-width="6" stroke-linecap="round" opacity=".8"/>'; };

  return [
    {
      id: 'begrippen', naam: 'Waar let je op?', uitleg: 'Zijden, rechte hoeken, evenwijdige zijden en symmetrieassen.',
      stappen: [
        { kop: 'Zijden tellen', beeld: S.rij([vorm('vijfhoek'), vorm('zeshoek')]),
          tekst: '<p>Een <b>zijde</b> is een recht stuk van de rand. Tel ze rondom: een vijfhoek heeft er 5, een zeshoek 6. Een cirkel heeft geen rechte stukken, dus geen zijden.</p>' },
        { kop: 'Rechte hoeken', beeld: S.rij([vorm('rechthoek', HOEK(15, 50, 14, 14) + HOEK(155, 50, -14, 14) + HOEK(155, 120, -14, -14) + HOEK(15, 120, 14, -14))]),
          tekst: '<p>Een <b>rechte hoek</b> is een hoek van 90 graden, zoals de hoek van een blad papier. Je tekent hem met een klein vierkantje in de hoek.</p>' +
            S.bak('Twijfel je? Leg de hoek van je schrift ertegen.', 'goed') },
        { kop: 'Evenwijdige zijden', beeld: S.rij([vorm('parallellogram', ZIJ(45, 45, 160, 45) + ZIJ(10, 125, 125, 125))]),
          tekst: '<p>Twee zijden zijn <b>evenwijdig</b> als ze overal even ver uit elkaar blijven, zoals de rails van een spoorlijn. Ze komen elkaar nooit tegen.</p>' },
        { kop: 'Symmetrieassen', beeld: S.rij([vorm('vierkant', AS(85, 20, 85, 150) + AS(20, 85, 150, 85) + AS(25, 25, 145, 145) + AS(145, 25, 25, 145))]),
          tekst: '<p>Een <b>symmetrieas</b> is een vouwlijn: vouw je de figuur daarlangs dubbel, dan vallen de twee helften precies op elkaar. Een vierkant heeft er 4.</p>' }
      ]
    },
    {
      id: 'vierhoeken', naam: 'Vierhoeken uit elkaar houden', uitleg: 'Vierkant, rechthoek, ruit, parallellogram, trapezium en vlieger.',
      stappen: [
        { kop: 'Zes vierhoeken', beeld: S.rij([vorm('vierkant', '', 90), vorm('rechthoek', '', 90), vorm('ruit', '', 90), vorm('parallellogram', '', 90), vorm('trapezium', '', 90), vorm('vlieger', '', 90)]),
          tekst: '<p>Ze hebben allemaal vier zijden. Met drie vragen weet je welke het is.</p>' },
        { kop: 'Vraag 1: vier rechte hoeken?', beeld: S.rij([vorm('vierkant', '', 110), vorm('rechthoek', '', 110)]),
          tekst: '<p>Heeft hij <b>vier rechte hoeken</b>, dan is het een vierkant of een rechthoek.</p>' +
            '<p>Zijn alle zijden even lang: <b>vierkant</b>. Zo niet: <b>rechthoek</b>.</p>' },
        { kop: 'Vraag 2: twee paar evenwijdige zijden?', beeld: S.rij([vorm('ruit', '', 110), vorm('parallellogram', '', 110)]),
          tekst: '<p>Geen rechte hoeken, maar wel <b>twee paar</b> evenwijdige zijden? Dan is het een ruit of een parallellogram.</p>' +
            '<p>Alle vier de zijden even lang: <b>ruit</b>. Zo niet: <b>parallellogram</b>.</p>' },
        { kop: 'Vraag 3: één paar, of geen?', beeld: S.rij([vorm('trapezium', ZIJ(55, 45, 115, 45) + ZIJ(18, 125, 152, 125), 110), vorm('vlieger', AS(85, 12, 85, 158), 110)]),
          tekst: '<p>Precies <b>één paar</b> evenwijdige zijden: <b>trapezium</b>.</p>' +
            '<p>Geen enkel paar evenwijdig, maar wel gespiegeld over één as, met twee korte en twee lange zijden: <b>vlieger</b>.</p>' },
        { kop: 'Het geheugensteuntje', beeld: S.tabel(['', 'rechte hoeken', 'paar evenwijdig', 'zijden even lang'], [
            ['vierkant', '4', '2', 'alle vier'], ['rechthoek', '4', '2', 'twee aan twee'], ['ruit', '0', '2', 'alle vier'],
            ['parallellogram', '0', '2', 'twee aan twee'], ['trapezium', '0', '1', 'nee'], ['vlieger', '0', '0', 'twee korte, twee lange']]),
          tekst: '<p>Een vierkant is dus ook een rechthoek (met gelijke zijden) en ook een ruit (met rechte hoeken). In het spel kies je altijd de naam die het meest zegt.</p>' }
      ]
    },
    {
      id: 'driehoeken', naam: 'Driehoeken', uitleg: 'Gelijkzijdig, gelijkbenig en rechthoekig.',
      stappen: [
        { kop: 'Gelijkzijdig: alles gelijk', beeld: S.rij([vorm('driehoek', AS(85, 19, 85, 125))]),
          tekst: '<p>Alle drie de zijden even lang, alle drie de hoeken 60 graden. Hij heeft 3 symmetrieassen.</p>' },
        { kop: 'Gelijkbenig: twee benen gelijk', beeld: S.rij([vorm('gelijkbenig', AS(85, 22, 85, 148))]),
          tekst: '<p>Twee zijden (de benen) zijn even lang, de derde niet. De twee hoeken onderaan zijn even groot. Eén symmetrieas.</p>' },
        { kop: 'Rechthoekig: een hoek van 90 graden', beeld: S.rij([vorm('rechthoekig', HOEK(30, 140, 14, -14))]),
          tekst: '<p>Er zit één rechte hoek in. Meer kan niet: de drie hoeken van een driehoek zijn samen altijd 180 graden.</p>' +
            S.bak('Bij deze driehoek hoort de stelling van Pythagoras: a² + b² = c².', 'goed') }
      ]
    },
    {
      id: 'veelhoeken', naam: 'Veelhoeken en ronde vormen', uitleg: 'Vijfhoek, zeshoek, achthoek, cirkel en ovaal.',
      stappen: [
        { kop: 'Tel de zijden', beeld: S.rij([vorm('vijfhoek', '', 100), vorm('zeshoek', '', 100), vorm('achthoek', '', 100)]),
          tekst: '<p>De naam zegt het aantal zijden en hoeken: vijf, zes of acht. Tel rustig rond, en begin bij een hoek die je onthoudt.</p>' },
        { kop: 'Regelmatig', beeld: S.rij([vorm('zeshoek', AS(85, 12, 85, 158) + AS(20, 85, 150, 85), 120)]),
          tekst: '<p>Zijn alle zijden en hoeken gelijk, dan heet een veelhoek <b>regelmatig</b>. Dan heeft hij evenveel symmetrieassen als zijden.</p>' },
        { kop: 'Cirkel of ovaal?', beeld: S.rij([vorm('cirkel', '', 110), vorm('ovaal', '', 110)]),
          tekst: '<p>Bij een <b>cirkel</b> ligt elk punt van de rand even ver van het midden. Een <b>ovaal</b> is breder dan hoog. Geen van beide heeft rechte zijden.</p>' }
      ]
    }
  ];
});
