/* Uitleg stap voor stap bij het DHTE-schema: wat de kolommen betekenen,
   optellen met onthouden en aftrekken met lenen. De voorbeelden komen uit
   het spel zelf (somOptellen, stappenOptellen en de rest in dhte.html), dus
   de uitleg zegt precies wat het spel ook zegt als je een vakje mist. */
STAPPEN.les('dhte', function(){
  var S = STAPPEN;

  /* Een uitgewerkt voorbeeld: de stappenlijst van het spel, en na elke stap
     het schema zoals het er dan uitziet. */
  function uitgewerkt(soort, n){
    var som = soort === 'optellen' ? somOptellen(n) : somAftrekken(n);
    var a = som.a, b = som.b, lijst = soort === 'optellen' ? stappenOptellen(a, b, n) : stappenAftrekken(a, b, n);
    var boven = cijfers(a, n), onder = cijfers(b, n), hulp = [], antw = [], weg = [];
    for (var i = 0; i < n; i++){ hulp.push(null); antw.push(null); }
    var teken = soort === 'optellen' ? '+' : '−', hulpNaam = soort === 'optellen' ? 'onthouden' : 'lenen';
    function beeld(licht, nieuw){
      return S.schema({ n:n, boven:boven.slice(), onder:onder, teken:teken, hulp:{ naam:hulpNaam, cijfers:hulp.slice() },
                        antwoord:antw.slice(), doorgestreept:weg.slice(), licht:licht, nieuw:nieuw });
    }
    var uit = [{
      kop: 'Het voorbeeld: ' + a + ' ' + teken + ' ' + b,
      tekst: '<p>Zet de getallen onder elkaar, elk cijfer in zijn eigen kolom: eenheden onder eenheden, tientallen onder tientallen.</p>' +
             '<p>Je begint <b>rechts</b>, bij de eenheden, en werkt naar links.</p>',
      beeld: beeld(n - 1)
    }];
    lijst.forEach(function(st){
      var p = plaats(st.kol, n);
      if (st.soort === 'antwoord'){
        antw[st.kol] = st.waarde;
        uit.push({ kop: 'De ' + PLAATS[p], tekst: '<p>' + st.uitleg + '</p>', beeld: beeld(st.kol, { rij:'antwoord', kol:st.kol }) });
      } else if (st.soort === 'onthoud'){
        hulp[st.kol] = st.waarde;
        uit.push({ kop: 'Onthouden', tekst: '<p>' + st.uitleg + '</p>', beeld: beeld(st.kol, { rij:'hulp', kol:st.kol }) });
      } else {
        /* lenen: links wordt een minder, en hier komt er tien bij */
        hulp[st.kol] = st.waarde;
        weg.push(st.kol);
        boven[st.kol + 1] = boven[st.kol + 1] + 10;
        uit.push({ kop: 'Lenen', tekst: '<p>' + st.uitleg + '</p>' +
          S.bak('Links zet je het nieuwe cijfer bij <b>lenen</b> en streep je het oude door. In deze kolom reken je nu met ' + boven[st.kol + 1] + '.'),
          beeld: beeld(st.kol + 1, { rij:'hulp', kol:st.kol }) });
      }
    });
    var uitkomst = soort === 'optellen' ? a + b : a - b;
    uit.push({
      kop: 'Klaar: ' + a + ' ' + teken + ' ' + b + ' = ' + uitkomst,
      tekst: '<p>Lees het antwoord van links naar rechts: <b>' + uitkomst + '</b>.</p>' +
        (soort === 'optellen'
          ? S.bak('Controleer het door te schatten: ' + a + ' is ongeveer ' + rond(a) + ' en ' + b + ' is ongeveer ' + rond(b) + '. Samen ongeveer ' + (rond(a) + rond(b)) + '. Dat komt aardig in de buurt.', 'goed')
          : S.bak('Controleer het met optellen: ' + uitkomst + ' + ' + b + ' moet weer ' + a + ' zijn. En dat klopt.', 'goed')),
      beeld: beeld(null)
    });
    return uit;
  }
  /* afronden op het grootste plaatsje, om te schatten */
  function rond(x){ var m = Math.pow(10, String(x).length - 1); return Math.round(x / m) * m; }

  return [
    {
      id: 'schema', naam: 'Wat is het DHTE-schema?', uitleg: 'Duizendtallen, honderdtallen, tientallen en eenheden: waar hoort elk cijfer?',
      stappen: function(){
        var n = 4, getal = getalVan(4), c = cijfers(getal, n), vol = [false, false, false, false];
        var uit = [
          { kop: 'Vier kolommen', beeld: S.schema({ n:4 }),
            tekst: '<p>In het schema heeft elk cijfer van een getal een eigen kolom. Van rechts naar links:</p>' +
              '<p><b>E</b> eenheden (losse), <b>T</b> tientallen (groepjes van 10), <b>H</b> honderdtallen (groepjes van 100) en <b>D</b> duizendtallen (groepjes van 1000).</p>' },
          { kop: 'Elke kolom is tien keer zoveel', beeld: S.rij([S.formule('1 D = 10 H'), S.formule('1 H = 10 T'), S.formule('1 T = 10 E')]),
            tekst: '<p>Ga je een kolom naar links, dan wordt een cijfer tien keer zoveel waard. Tien eenheden zijn samen één tiental, tien tientallen één honderdtal.</p>' +
              '<p>Daarom gaat er bij optellen iets naar links als een kolom boven de negen komt.</p>' },
          { kop: 'Het getal ' + getal, beeld: S.formule(String(getal)),
            tekst: '<p>Laten we <b>' + getal + '</b> in het schema zetten. Je kijkt naar elk cijfer apart en vraagt: bij welke plaats hoort dit?</p>' }
        ];
        for (var k = n - 1; k >= 0; k--){
          vol[k] = true;
          var p = plaats(k, n);
          uit.push({ kop: 'De ' + c[k] + ' bij de ' + PLAATS[p],
            beeld: S.schema({ n:4, getal:getal, vulGetal:vol.slice(), licht:k, nieuw:{ rij:'antwoord', kol:k } }),
            tekst: '<p>' + (p === 0 ? 'De ' + c[k] + ' staat helemaal rechts, dus bij de <b>eenheden</b>.' : 'Tel vanaf rechts: ' + PLAATS.slice(0, p + 1).join(', ') + '. De ' + c[k] + ' staat op de ' + (p + 1) + 'e plek van rechts, dus bij de <b>' + PLAATS[p] + '</b>.') + '</p>' +
              '<p>' + c[k] + ' ' + (c[k] === 1 ? ENKEL[p] : PLAATS[p]) + ' is ' + (c[k] * Math.pow(10, p)) + '.</p>' });
        }
        uit.push({ kop: 'Samen weer ' + getal, beeld: S.schema({ n:4, getal:getal, vulGetal:[true, true, true, true] }),
          tekst: '<p>Tel je de waarde van elke kolom op, dan krijg je het getal terug:</p>' +
            S.formule(c.map(function(x, k){ return String(x * Math.pow(10, plaats(k, n))); }).join(' + ') + ' = ' + getal) });
        uit.push({ kop: 'Een nul telt ook mee', beeld: S.schema({ n:4, getal:2035, vulGetal:[true, true, true, true], licht:1 }),
          tekst: '<p>In <b>2035</b> zijn er geen honderdtallen. Toch zet je er een <b>0</b>: anders schuift alles een plek op en lees je 235.</p>' +
            S.bak('Een lege kolom is een nul, en die schrijf je op.', 'goed') });
        return uit;
      }
    },
    {
      id: 'optellen', naam: 'Optellen met onthouden', uitleg: 'Onder elkaar optellen, van rechts naar links. Wat doe je als een kolom boven de negen komt?',
      stappen: function(){
        var intro = [{
          kop: 'Het idee', beeld: S.rij([S.formule('7 + 5 = 12'), '→', S.formule('<span class="st-na">1</span> tiental en 2 eenheden')]),
          tekst: '<p>In één kolom passen maar tien cijfers: 0 tot en met 9. Tel je in een kolom meer dan 9 bij elkaar, dan maak je van tien stuks één groepje voor de kolom links.</p>' +
            '<p>Dat groepje schrijf je klein boven die kolom, bij <b>onthouden</b>. Straks tel je het daar mee.</p>'
        }];
        return intro.concat(uitgewerkt('optellen', 3));
      }
    },
    {
      id: 'aftrekken', naam: 'Aftrekken met lenen', uitleg: 'Onder elkaar aftrekken, van rechts naar links. Wat doe je als het boven te klein is?',
      stappen: function(){
        var intro = [{
          kop: 'Het idee', beeld: S.rij([S.formule('2 − 7 ?'), '→', S.formule('<span class="st-na">12</span> − 7 = 5')]),
          tekst: '<p>Bij aftrekken haal je in elke kolom het onderste cijfer van het bovenste af. Maar soms is het bovenste te klein, zoals 2 − 7.</p>' +
            '<p>Dan <b>leen</b> je: je pakt één groepje uit de kolom links. Daar komt er één af, en hier komen er tien bij. Van 2 wordt 12, en 12 − 7 kan wel.</p>' +
            S.bak('Nooit de kleine van de grote aftrekken (7 − 2): dat is de fout die het vaakst gemaakt wordt.', 'let')
        }];
        return intro.concat(uitgewerkt('aftrekken', 3));
      }
    }
  ];
});
