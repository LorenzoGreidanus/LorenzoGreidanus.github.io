/* Uitleg stap voor stap bij de Breukenbakker: voor elke soort bestelling
   een korte uitleg en een voorbeeld dat uit het spel zelf komt (SOORTEN in
   breukenbakker.html), met de taarten erbij. */
STAPPEN.les('breukenbakker', function(){
  var S = STAPPEN;
  function soort(id){ return SOORTEN.filter(function(s){ return s.id === id; })[0]; }
  function maak(id, niv){ return soort(id).maak(niv || 2); }
  function b(t, n){ return '<b>' + t + '/' + n + '</b>'; }
  function breuk(t, n){ return n === 1 ? String(t) : '<span style="display:inline-grid;text-align:center;line-height:1.05;vertical-align:middle"><span style="border-bottom:3px solid currentColor;padding:0 4px">' + t + '</span><span>' + n + '</span></span>'; }

  return [
    {
      id: 'lezen', naam: 'Welke breuk zie je?', uitleg: 'Wat de teller en de noemer betekenen, aan een taart.',
      stappen: function(){
        var s = maak('lezen'), n = s.taart.n, t = s.taart.vol;
        return [
          { kop: 'Een taart in gelijke stukken', beeld: S.taart(n, 0),
            tekst: '<p>Een breuk begint altijd met iets dat in <b>gelijke</b> stukken is gesneden. Deze taart is in ' + n + ' even grote stukken verdeeld.</p>' },
          { kop: 'De noemer: in hoeveel stukken', beeld: S.formule(breuk('?', '<span class="st-na">' + n + '</span>')),
            tekst: '<p>Het getal <b>onder</b> de streep heet de <b>noemer</b>. Het noemt in hoeveel stukken het geheel is verdeeld: hier ' + n + '.</p>' },
          { kop: 'De teller: hoeveel stukken er zijn', beeld: S.rij([S.taart(n, t), S.formule(breuk('<span class="st-na">' + t + '</span>', n))]),
            tekst: '<p>Het getal <b>boven</b> de streep heet de <b>teller</b>. Die telt hoeveel van die stukken er zijn: hier liggen er nog ' + t + '.</p>' +
              '<p>Dus is er ' + b(t, n) + ' van de taart over.</p>' },
          { kop: 'Zo lees je het', beeld: S.formule(breuk(t, n) + ' <span class="st-zacht">=</span> ' + t + ' van de ' + n + ' stukken'),
            tekst: '<p>Lees een breuk als "' + t + ' van de ' + n + '". De noemer zegt hoe groot een stuk is, de teller hoeveel je er hebt.</p>' +
              S.bak('Hoe groter de noemer, hoe kleiner elk stuk: 1/8 is kleiner dan 1/4.', 'goed') }
        ];
      }
    },
    {
      id: 'gelijk', naam: 'Korter schrijven (vereenvoudigen)', uitleg: 'Twee breuken die even groot zijn, en de kortste vorm vinden.',
      stappen: function(){
        var s = maak('gelijk'), n = s.taart.n, t = s.taart.vol, kt = s.antwoord.t, kn = s.antwoord.n, deler = n / kn;
        return [
          { kop: 'Even veel taart, andere stukken', beeld: S.rij([S.taart(n, t, { onder:t + '/' + n }), '=', S.taart(kn, kt, { onder:kt + '/' + kn })]),
            tekst: '<p>Links is de taart in ' + n + ' stukken gesneden, rechts in ' + kn + '. Toch is er links en rechts precies <b>even veel</b> taart.</p>' +
              '<p>Daarom zijn ' + b(t, n) + ' en ' + b(kt, kn) + ' gelijke breuken.</p>' },
          { kop: 'Zoek een getal dat in allebei past', beeld: S.formule(t + ' en ' + n + ' <span class="st-zacht">passen allebei in de tafel van</span> <span class="st-na">' + deler + '</span>'),
            tekst: '<p>Om een breuk korter te schrijven zoek je een getal waardoor je de teller én de noemer allebei kunt delen.</p>' +
              '<p>' + t + ' en ' + n + ' kun je allebei delen door <b>' + deler + '</b>.</p>' },
          { kop: 'Deel boven en onder door hetzelfde', beeld: S.formule(breuk(t + ' : ' + deler, n + ' : ' + deler) + ' <span class="st-zacht">=</span> ' + breuk('<span class="st-na">' + kt + '</span>', '<span class="st-na">' + kn + '</span>')),
            tekst: '<p>' + t + ' : ' + deler + ' = ' + kt + ' en ' + n + ' : ' + deler + ' = ' + kn + '. Dus ' + b(t, n) + ' = ' + b(kt, kn) + '.</p>' +
              S.bak('Altijd boven én onder door hetzelfde getal. Alleen de teller of alleen de noemer delen maakt er een andere breuk van.', 'let') },
          { kop: 'Kan het nog korter?', beeld: S.formule(breuk(kt, kn)),
            tekst: '<p>Kijk of er nog een getal is waardoor ' + kt + ' en ' + kn + ' allebei te delen zijn (behalve 1). Is dat er niet, dan staat de breuk zo kort mogelijk.</p>' +
              S.bak('Snel: deel eerst door 2 zolang allebei even zijn, dan door 3, dan door 5.', 'goed') }
        ];
      }
    },
    {
      id: 'optellen', naam: 'Optellen met gelijke noemers', uitleg: 'Stukken van even grote taarten bij elkaar.',
      stappen: function(){
        var s = maak('optellen'), n = s.termen[0].n, x = s.termen[0].vol, y = s.termen[1].vol, som = x + y;
        return [
          { kop: 'Twee bestellingen', beeld: S.rij([S.taart(n, x, { onder:x + '/' + n }), '+', S.taart(n, y, { onder:y + '/' + n })]),
            tekst: '<p>' + s.vraag + '</p><p>Beide taarten zijn in ' + n + ' stukken gesneden: de stukken zijn even groot.</p>' },
          { kop: 'Tel de stukken', beeld: S.formule(breuk(x, n) + ' + ' + breuk(y, n) + ' = ' + breuk('<span class="st-na">' + x + ' + ' + y + '</span>', n)),
            tekst: '<p>Zijn de noemers gelijk, dan tel je alleen de <b>tellers</b> op. De noemer blijft ' + n + ': de stukken worden niet kleiner of groter doordat je ze bij elkaar legt.</p>' },
          { kop: 'Het antwoord: ' + som + '/' + n, beeld: S.rij([S.taart(n, som, { onder:som + '/' + n })]),
            tekst: '<p>' + x + ' + ' + y + ' = ' + som + ', dus ' + b(som, n) + '.</p>' +
              (s.ook && s.ook[0] && s.ook[0].n !== n ? S.bak('Korter mag ook: ' + s.ook[0].t + '/' + s.ook[0].n + '.', 'goed') : '') +
              S.bak('Tel nooit de noemers op: ' + x + '/' + n + ' + ' + y + '/' + n + ' is geen ' + som + '/' + (2 * n) + '.', 'let') }
        ];
      }
    },
    {
      id: 'ongelijk', naam: 'Optellen met ongelijke noemers', uitleg: 'Eerst de stukken even groot maken, dan optellen.',
      stappen: function(){
        var s = maak('ongelijk', 3), a = s.termen[0], c = s.termen[1], N = s.antwoord.n, f1 = N / a.n, f2 = N / c.n;
        return [
          { kop: 'Stukken van verschillende maat', beeld: S.rij([S.taart(a.n, a.vol, { onder:a.vol + '/' + a.n }), '+', S.taart(c.n, c.vol, { onder:c.vol + '/' + c.n })]),
            tekst: '<p>' + s.vraag + '</p><p>De ene taart is in ' + a.n + ' stukken gesneden, de andere in ' + c.n + '. Die stukken zijn niet even groot, dus je kunt ze niet zomaar tellen.</p>' },
          { kop: 'Zoek een noemer die bij allebei past', beeld: S.formule('tafel van ' + a.n + ' en tafel van ' + c.n + ' <span class="st-zacht">→</span> <span class="st-na">' + N + '</span>'),
            tekst: '<p>Zoek het kleinste getal dat in de tafel van ' + a.n + ' én in de tafel van ' + c.n + ' zit. Dat is <b>' + N + '</b>. Dat wordt de nieuwe noemer.</p>' },
          { kop: 'Maak de eerste breuk gelijknamig', beeld: S.rij([S.taart(a.n, a.vol, { onder:a.vol + '/' + a.n }), '=', S.taart(N, a.vol * f1, { onder:(a.vol * f1) + '/' + N })]),
            tekst: '<p>' + a.n + ' keer ' + f1 + ' is ' + N + '. Wat je met de noemer doet, doe je ook met de teller: ' + a.vol + ' keer ' + f1 + ' = ' + (a.vol * f1) + '.</p>' +
              S.formule(breuk(a.vol + ' × ' + f1, a.n + ' × ' + f1) + ' = ' + breuk(a.vol * f1, N)) },
          { kop: 'En de tweede', beeld: S.rij([S.taart(c.n, c.vol, { onder:c.vol + '/' + c.n }), '=', S.taart(N, c.vol * f2, { onder:(c.vol * f2) + '/' + N })]),
            tekst: '<p>' + c.n + ' keer ' + f2 + ' is ' + N + ', dus ook de teller keer ' + f2 + ': ' + c.vol + ' × ' + f2 + ' = ' + (c.vol * f2) + '.</p>' +
              S.formule(breuk(c.vol + ' × ' + f2, c.n + ' × ' + f2) + ' = ' + breuk(c.vol * f2, N)) },
          { kop: 'Nu wel optellen', beeld: S.formule(breuk(a.vol * f1, N) + ' + ' + breuk(c.vol * f2, N) + ' = ' + breuk('<span class="st-na">' + s.antwoord.t + '</span>', N)),
            tekst: '<p>De stukken zijn nu even groot, dus je telt de tellers op: ' + (a.vol * f1) + ' + ' + (c.vol * f2) + ' = ' + s.antwoord.t + '. Het antwoord is ' + b(s.antwoord.t, N) + '.</p>' +
              (s.antwoord.t > N ? S.bak('Dat is meer dan een hele taart: ' + Math.floor(s.antwoord.t / N) + ' hele en ' + (s.antwoord.t % N) + '/' + N + '.', 'goed') : '') }
        ];
      }
    },
    {
      id: 'deelvan', naam: 'Een deel van een aantal', uitleg: 'Hoeveel is 3/4 van 20? Eerst delen, dan keer.',
      stappen: function(){
        var s = maak('deelvan'), n = s.taart.n, t = s.taart.vol, totaal = s.antwoord.t / t * n, een = totaal / n;
        var bol = function(k, kleur){ var h = ''; for (var i = 0; i < k; i++) h += '<span style="display:inline-block;width:14px;height:14px;border-radius:50%;margin:2px;background:' + kleur + '"></span>'; return h; };
        function groepen(tot){ var uit = []; for (var g = 0; g < n; g++) uit.push('<span style="display:inline-block;padding:4px;border:2px dashed currentColor;border-radius:10px;margin:3px;max-width:' + (Math.min(een, 4) * 18 + 12) + 'px">' + bol(een, g < tot ? '#EA9836' : 'rgba(127,127,127,.45)') + '</span>'); return uit.join(''); }
        return [
          { kop: 'De vraag', beeld: '<div style="max-width:420px;text-align:center">' + bol(totaal, '#EA9836') + '</div>',
            tekst: '<p>' + s.vraag + '</p><p>Een breuk van een aantal reken je in twee stappen uit.</p>' },
          { kop: 'Stap 1: deel door de noemer', beeld: '<div style="max-width:520px;text-align:center">' + groepen(0) + '</div>',
            tekst: '<p>De noemer is ' + n + ', dus je verdeelt de ' + totaal + ' in ' + n + ' gelijke groepjes: ' + totaal + ' : ' + n + ' = <b>' + een + '</b>. Eén ' + n + 'de deel is ' + een + '.</p>' },
          { kop: 'Stap 2: keer de teller', beeld: '<div style="display:grid;gap:10px;justify-items:center"><div style="max-width:520px;text-align:center">' + groepen(t) + '</div>' + S.formule(een + ' × ' + t + ' = <span class="st-na">' + s.antwoord.t + '</span>') + '</div>',
            tekst: '<p>De teller is ' + t + ', dus je neemt ' + t + ' van die groepjes: ' + een + ' × ' + t + ' = <b>' + s.antwoord.t + '</b>.</p>' +
              S.bak('Eerst delen door de noemer, dan keer de teller. Zo blijven de getallen klein.', 'goed') }
        ];
      }
    },
    {
      id: 'vergelijk', naam: 'Welk stuk is groter?', uitleg: 'Twee breuken vergelijken met dezelfde noemer of met procenten.',
      stappen: function(){
        var s = maak('vergelijk'), x = s.twee[0], y = s.twee[1], N = x.n * y.n / ggd(x.n, y.n);
        var gx = x.t * N / x.n, gy = y.t * N / y.n, groot = gx > gy ? x : y;
        return [
          { kop: 'Twee stukken', beeld: S.rij([S.taart(x.n, x.t, { onder:x.t + '/' + x.n }), '?', S.taart(y.n, y.t, { onder:y.t + '/' + y.n })]),
            tekst: '<p>Welk stuk is groter: ' + b(x.t, x.n) + ' of ' + b(y.t, y.n) + '? Op het oog is het soms lastig te zien.</p>' },
          { kop: 'Maak de noemers gelijk', beeld: S.formule(breuk(x.t, x.n) + ' = ' + breuk(gx, N) + ' <span class="st-zacht">en</span> ' + breuk(y.t, y.n) + ' = ' + breuk(gy, N)),
            tekst: '<p>Reken allebei om naar dezelfde noemer, ' + N + '. Dan zijn de stukken even groot en hoef je alleen de tellers te vergelijken.</p>' },
          { kop: 'Vergelijk de tellers', beeld: S.formule(gx + ' ' + (gx > gy ? '&gt;' : '&lt;') + ' ' + gy),
            tekst: '<p>' + gx + ' is ' + (gx > gy ? 'meer' : 'minder') + ' dan ' + gy + ', dus ' + b(groot.t, groot.n) + ' is het grootste stuk.</p>' +
              S.bak('Of reken allebei om naar procenten: ' + x.t + '/' + x.n + ' is ongeveer ' + Math.round(x.t / x.n * 100) + '% en ' + y.t + '/' + y.n + ' is ongeveer ' + Math.round(y.t / y.n * 100) + '%.', 'goed') }
        ];
      }
    },
    {
      id: 'procent', naam: 'Van breuk naar procent', uitleg: 'Een breuk omrekenen naar procenten met een deling.',
      stappen: function(){
        var s = maak('procent', 3), n = s.taart.n, t = s.taart.vol, dec = t / n, p = s.antwoord.t;
        var d = String(Math.round(dec * 10000) / 10000).replace('.', ','), pt = String(p).replace('.', ',');
        return [
          { kop: 'Procent betekent: van de honderd', beeld: S.strook(100, 0, { breed:300 }),
            tekst: '<p>Procent betekent "van de honderd". Je vraagt je af: als de taart in 100 stukjes zou zijn gesneden, hoeveel daarvan is ' + b(t, n) + '?</p>' },
          { kop: 'Deel de teller door de noemer', beeld: S.formule(t + ' : ' + n + ' = <span class="st-na">' + d + '</span>'),
            tekst: '<p>Een breuk is eigenlijk een deling: ' + t + '/' + n + ' is ' + t + ' gedeeld door ' + n + '. Dat is ' + d + '.</p>' },
          { kop: 'Keer honderd', beeld: S.rij([S.taart(n, t), '=', S.formule('<span class="st-na">' + pt + '%</span>')]),
            tekst: '<p>' + d + ' × 100 = ' + pt + '. Dus ' + b(t, n) + ' is <b>' + pt + '%</b> van de taart.</p>' +
              S.bak('Deze moet je uit je hoofd kennen: 1/2 = 50%, 1/4 = 25%, 3/4 = 75%, 1/5 = 20%, 1/10 = 10%.', 'goed') }
        ];
      }
    },
    {
      id: 'heelenrest', naam: 'Hele taarten en een rest', uitleg: 'Van 2 hele en 1/4 naar één breuk.',
      stappen: function(){
        var s = maak('heelenrest', 3), n = s.taart.n, rest = s.taart.vol, heel = s.taart.heel, T = s.antwoord.t;
        return [
          { kop: 'Hele taarten en een stuk', beeld: S.taart(n, rest, { heel:heel, r:34 }),
            tekst: '<p>' + s.vraag + '</p>' },
          { kop: 'Snijd de hele taarten ook', beeld: (function(){ var h = ''; for (var i = 0; i < heel; i++) h += S.taart(n, n, { r:34 }); return S.rij([h, S.taart(n, rest, { r:34 })]); })(),
            tekst: '<p>Snijd elke hele taart ook in ' + n + ' stukken. Eén hele taart is dan ' + b(n, n) + '.</p>' },
          { kop: 'Tel alle stukken', beeld: S.formule(heel + ' × ' + n + ' + ' + rest + ' = <span class="st-na">' + T + '</span>'),
            tekst: '<p>' + heel + ' hele taarten zijn ' + heel + ' × ' + n + ' = ' + (heel * n) + ' stukken. Plus de ' + rest + ' losse stukken is ' + T + '.</p>' +
              '<p>Het antwoord is ' + b(T, n) + '.</p>' +
              S.bak('Een breuk waarvan de teller groter is dan de noemer, is meer dan één geheel.', 'goed') }
        ];
      }
    }
  ];
});
