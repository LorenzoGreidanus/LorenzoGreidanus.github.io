/* De bestellingen van de Breukenbakker. Gedeeld door het spel (breukenbakker.html)
   en het werkblad (werkblad.html); daarom in een eigen bestand en onder een
   eigen naam, zodat NIVEAUS en SOORTEN niet botsen met die van de vragenbank. */
var BREUKOPGAVEN = (function(){
/* ============================================================================
   DE BESTELLINGEN
   Elke soort som maakt zichzelf met getallen die bij het niveau passen en geeft
   terug: de bestelling (tekst), wat de taart moet laten zien, het antwoord als
   breuk {t:teller, n:noemer} of als getal, en de uitleg.
   Een soort toevoegen: schrijf een maak-functie en zet hem in SOORTEN.
   ============================================================================ */
function ggd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ var t = b; b = a % b; a = t; } return a || 1; }
function kort(t, n){ var d = ggd(t, n); return { t:t / d, n:n / d }; }
function kies(a){ return a[Math.floor(Math.random() * a.length)]; }
/* ---------------------------------------------------------------------------
   DE PLAATJES BIJ DE KEUZES
   Je ziet wat je gaat oefenen voordat je het leest: een taart in stukken zegt
   meer dan het woord "ongelijke noemers". Elke keuze tekent zichzelf met
   miniTaart(): een rondje met n punten, waarvan er vol gekleurd zijn.
   --------------------------------------------------------------------------- */
function miniTaart(n, vol, x, y, r){
  var punten = [], i;
  for (i = 0; i < n; i++){
    var a1 = -Math.PI / 2 + i * 2 * Math.PI / n, a2 = -Math.PI / 2 + (i + 1) * 2 * Math.PI / n;
    var x1 = x + r * Math.cos(a1), y1 = y + r * Math.sin(a1), x2 = x + r * Math.cos(a2), y2 = y + r * Math.sin(a2);
    var groot = (2 * Math.PI / n) > Math.PI ? 1 : 0;
    punten.push('<path d="M' + x + ' ' + y + ' L' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' A' + r + ' ' + r + ' 0 ' + groot + ' 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' Z" fill="' + (i < vol ? 'currentColor' : 'transparent') + '"/>');
  }
  return '<g stroke="currentColor" stroke-width="1.6">' + punten.join('') +
    '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke-width="2"/></g>';
}
function tekenteken(t, x, y){ return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">' + t + '</text>'; }
function plaatje(inhoud){ return '<svg viewBox="0 0 72 34" class="soorticoon" aria-hidden="true">' + inhoud + '</svg>'; }

function br(b){ return b.n === 1 ? String(b.t) : b.t + '/' + b.n; }
var NAMEN = ['appeltaart', 'pizza', 'chocoladetaart', 'quiche', 'pannenkoek', 'kaastaart'];

var SOORTEN = [
  { id:'lezen', naam:'welke breuk zie je', icoon:plaatje(miniTaart(8, 3, 20, 17, 13) + tekenteken('?', 50, 23)), maak:function(niv){
      var n = kies(niv === 1 ? [2, 3, 4, 6, 8] : niv === 2 ? [3, 4, 5, 6, 8, 10] : [5, 6, 7, 8, 9, 10, 12]);
      var t = 1 + Math.floor(Math.random() * (n - 1));
      return { taart:{ n:n, vol:t }, eenheid:'breuk',
        vraag:'Welk deel van de ' + kies(NAMEN) + ' is er nog?', antwoord:{ t:t, n:n },
        hoe:'De taart is in ' + n + ' stukken verdeeld en er liggen er ' + t + ', dus ' + t + '/' + n + '.' + (kort(t, n).n !== n ? ' Korter mag ook: ' + br(kort(t, n)) + '.' : ''), ook:[kort(t, n)] };
    } },
  { id:'gelijk', naam:'gelijke breuken', icoon:plaatje(miniTaart(2, 1, 15, 17, 13) + tekenteken('=', 36, 23) + miniTaart(6, 3, 57, 17, 13)), maak:function(niv){
      var kleine = kies(niv === 1 ? [[1, 2], [1, 4], [1, 3]] : [[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [2, 5]]);
      var maal = kies(niv === 1 ? [2, 3] : niv === 2 ? [2, 3, 4] : [3, 4, 5, 6]);
      var n = kleine[1] * maal, t = kleine[0] * maal;
      return { taart:{ n:n, vol:t }, eenheid:'breuk', kort:true,
        vraag:'De bakker snijdt ' + t + '/' + n + '. Hoe heet dat stuk zo kort mogelijk?', antwoord:{ t:kleine[0], n:kleine[1] },
        hoe:'Teller en noemer kun je allebei delen door ' + maal + ': ' + t + ' : ' + maal + ' = ' + kleine[0] + ' en ' + n + ' : ' + maal + ' = ' + kleine[1] + '. Dus ' + kleine[0] + '/' + kleine[1] + '.' };
    } },
  { id:'optellen', naam:'stukken bij elkaar', icoon:plaatje(miniTaart(4, 1, 15, 17, 13) + tekenteken('+', 36, 23) + miniTaart(4, 2, 57, 17, 13)), maak:function(niv){
      var n = kies(niv === 1 ? [4, 6, 8] : [5, 6, 8, 10, 12]);
      var a = 1 + Math.floor(Math.random() * (n - 2)), b = 1 + Math.floor(Math.random() * (n - a - 1));
      return { termen:[{ n:n, vol:a }, { n:n, vol:b }], eenheid:'breuk',
        vraag:'Twee klanten bestellen ' + a + '/' + n + ' en ' + b + '/' + n + '. Hoeveel taart gaat de deur uit?',
        antwoord:{ t:a + b, n:n }, ook:[kort(a + b, n)],
        hoe:'De noemers zijn gelijk, dus je telt alleen de tellers op: ' + a + ' + ' + b + ' = ' + (a + b) + ', dus ' + (a + b) + '/' + n + '.' + (kort(a + b, n).n !== n ? ' Dat is ook ' + br(kort(a + b, n)) + '.' : '') };
    } },
  { id:'ongelijk', naam:'ongelijke noemers', niv:2, icoon:plaatje(miniTaart(2, 1, 15, 17, 13) + tekenteken('+', 36, 23) + miniTaart(3, 1, 57, 17, 13)), maak:function(niv){
      var paren = niv === 2 ? [[2, 4], [3, 6], [2, 6], [4, 8], [2, 8], [3, 9]] : [[2, 3], [3, 4], [2, 5], [4, 6], [3, 5], [5, 6]];
      var p = kies(paren), n1 = p[0], n2 = p[1];
      var t1 = 1 + Math.floor(Math.random() * (n1 - 1)), t2 = 1 + Math.floor(Math.random() * (n2 - 1));
      var noemer = n1 * n2 / ggd(n1, n2), teller = t1 * (noemer / n1) + t2 * (noemer / n2);
      return { termen:[{ n:n1, vol:t1 }, { n:n2, vol:t2 }], eenheid:'breuk', ook:[kort(teller, noemer)],
        vraag:'Tel op: ' + t1 + '/' + n1 + ' + ' + t2 + '/' + n2 + '.', antwoord:{ t:teller, n:noemer },
        hoe:'Maak de noemers gelijk op ' + noemer + '. Dan is ' + t1 + '/' + n1 + ' gelijk aan ' + (t1 * noemer / n1) + '/' + noemer + ' en ' + t2 + '/' + n2 + ' gelijk aan ' + (t2 * noemer / n2) + '/' + noemer + '. Samen ' + teller + '/' + noemer + '.' };
    } },
  { id:'deelvan', naam:'deel van een aantal', icoon:plaatje('<g fill="currentColor">' + '<circle cx="12" cy="11" r="5"/><circle cx="27" cy="11" r="5"/><circle cx="42" cy="11" r="5" opacity=".28"/>' + '<circle cx="12" cy="25" r="5"/><circle cx="27" cy="25" r="5" opacity=".28"/><circle cx="42" cy="25" r="5" opacity=".28"/>' + '</g>' + tekenteken('?', 60, 23)), maak:function(niv){
      var n = kies(niv === 1 ? [2, 3, 4] : [3, 4, 5, 6, 8]);
      var t = 1 + Math.floor(Math.random() * (n - 1));
      var totaal = n * kies(niv === 1 ? [2, 3, 4] : [3, 4, 6, 8]);
      var ding = kies(['cupcakes', 'broodjes', 'koekjes', 'punten taart']);
      return { taart:{ n:n, vol:t }, eenheid:'aantal',
        vraag:'Er staan ' + totaal + ' ' + ding + ' klaar. De klant neemt er ' + t + '/' + n + ' van mee. Hoeveel is dat?',
        antwoord:{ t:totaal / n * t, n:1 },
        hoe:'Eerst een ' + n + 'de deel: ' + totaal + ' : ' + n + ' = ' + (totaal / n) + '. Dan keer ' + t + ': ' + (totaal / n) + ' x ' + t + ' = ' + (totaal / n * t) + '.' };
    } },
  { id:'vergelijk', naam:'welk stuk is groter', icoon:plaatje(miniTaart(3, 2, 15, 17, 13) + tekenteken('>', 36, 23) + miniTaart(4, 2, 57, 17, 13)), maak:function(niv){
      var a, b, lijst = niv === 1 ? [[1, 2], [1, 3], [1, 4], [2, 4], [3, 4], [2, 3]] : [[2, 3], [3, 4], [3, 5], [5, 8], [4, 6], [5, 6], [7, 10], [2, 5]];
      a = kies(lijst); do { b = kies(lijst); } while (a[0] / a[1] === b[0] / b[1]);
      var groter = a[0] / a[1] > b[0] / b[1] ? 1 : 2;
      return { twee:[{ t:a[0], n:a[1] }, { t:b[0], n:b[1] }], keuze:[br({ t:a[0], n:a[1] }), br({ t:b[0], n:b[1] })], antwoord:groter,
        vraag:'Welk stuk is groter?',
        hoe:a[0] + '/' + a[1] + ' is ' + Math.round(a[0] / a[1] * 100) + ' procent van de taart, ' + b[0] + '/' + b[1] + ' is ' + Math.round(b[0] / b[1] * 100) + ' procent. Reken breuken om naar dezelfde noemer of naar procenten, dan zie je het meteen.' };
    } },
  { id:'procent', naam:'breuk naar procent', niv:2, icoon:plaatje(miniTaart(4, 1, 18, 17, 13) + tekenteken('→', 38, 23) + tekenteken('%', 58, 24)), maak:function(niv){
      var p = kies(niv === 2 ? [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [1, 10], [3, 10]] : [[3, 8], [5, 8], [1, 8], [7, 10], [2, 5], [5, 6], [1, 3]]);
      var waarde = p[0] / p[1] * 100, afgerond = Math.round(waarde * 10) / 10;
      return { taart:{ n:p[1], vol:p[0] }, eenheid:'procent',
        vraag:'Hoeveel procent van de taart is ' + p[0] + '/' + p[1] + '?', antwoord:{ t:afgerond, n:1 }, marge:0.15,
        hoe:p[0] + ' : ' + p[1] + ' = ' + (p[0] / p[1]).toFixed(4).replace(/0+$/, '').replace('.', ',') + ', en dat keer 100 is ' + String(afgerond).replace('.', ',') + ' procent.' + (Math.abs(waarde - afgerond) > 0.001 ? ' Afgerond op een decimaal.' : '') };
    } },
  { id:'heelenrest', naam:'hele taarten en een rest', niv:3, icoon:plaatje(miniTaart(1, 1, 15, 17, 13) + tekenteken('+', 36, 23) + miniTaart(4, 1, 57, 17, 13)), maak:function(niv){
      var n = kies([3, 4, 5, 6, 8]), heel = kies([1, 2, 3]), rest = 1 + Math.floor(Math.random() * (n - 1));
      var teller = heel * n + rest;
      return { taart:{ n:n, vol:rest, heel:heel }, eenheid:'breuk',
        vraag:'De bakker heeft ' + heel + ' hele ' + (heel === 1 ? 'taart' : 'taarten') + ' en ' + rest + '/' + n + '. Hoeveel is dat in een breuk?',
        antwoord:{ t:teller, n:n },
        hoe:'Elke hele taart is ' + n + '/' + n + '. ' + heel + ' keer ' + n + ' is ' + (heel * n) + ', plus ' + rest + ' is ' + teller + '. Dus ' + teller + '/' + n + '.' };
    } }
];
var NIVEAUS = [
  { id:1, naam:'vmbo-bb',        uit:'Halven, derden, kwarten en achtsten, met de taart erbij.' },
  { id:2, naam:'vmbo-kgt en tl', uit:'Ook gelijknamig maken, procenten en grotere noemers.' },
  { id:3, naam:'havo en vwo',    uit:'Ongelijke noemers, hele taarten met een rest en lastigere procenten.' }
];

return { ggd:ggd, kort:kort, kies:kies, miniTaart:miniTaart, tekenteken:tekenteken, plaatje:plaatje, br:br, NAMEN:NAMEN, SOORTEN:SOORTEN, NIVEAUS:NIVEAUS };
})();
