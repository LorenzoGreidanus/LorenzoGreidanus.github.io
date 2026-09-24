/* De sommen en de stappenlijst van het DHTE-schema. Gedeeld door het spel
   (dhte.html) en het werkblad (werkblad.html); daarom in een eigen bestand en
   onder een eigen naam, zodat NIVEAUS niet botst met die van de vragenbank. */
var DHTEOPGAVEN = (function(){
/* ============================================================================
   HET DHTE-SCHEMA

   Duizendtallen, honderdtallen, tientallen en eenheden in een schema, met drie
   onderdelen: een getal invullen, optellen met onthouden en aftrekken met
   lenen.

   De kern is de stappenlijst. Elke som wordt eerst helemaal uitgerekend en
   omgezet in een rij stappen: dit cijfer hoort in die kolom, en dit is waarom.
   Het spel loopt die lijst af. Zo staat de uitleg bij de som en niet in de
   schermcode, en gaat aftrekken met lenen langs precies dezelfde weg als
   optellen met onthouden.
   ============================================================================ */

var NIVEAUS = [
  { id:'te',   kolommen:2, naam:'Tot 100',   uitleg:'Twee kolommen: tientallen en eenheden.' },
  { id:'hte',  kolommen:3, naam:'Tot 1000',  uitleg:'Drie kolommen, dus de honderdtallen komen erbij.' },
  { id:'dhte', kolommen:4, naam:'Tot 10000', uitleg:'Het hele schema: duizendtallen, honderdtallen, tientallen en eenheden.' }
];

var ONDERDELEN = [
  { id:'invullen',  naam:'Invullen',  uitleg:'Je ziet een getal en zet elk cijfer in de goede kolom.' },
  { id:'optellen',  naam:'Optellen',  uitleg:'Twee getallen onder elkaar. Kolom voor kolom optellen, met onthouden.' },
  { id:'aftrekken', naam:'Aftrekken', uitleg:'Twee getallen onder elkaar. Kolom voor kolom aftrekken, met lenen.' }
];

var AANTAL = 10;   /* sommen per ronde */
var PUNT   = 10;   /* punten voor een som die in één keer goed gaat */
var DUBBEL = 5;    /* vanaf zoveel goed op rij tellen ze dubbel */
var KANSEN = 2;    /* zoveel keer mag je een vakje proberen; daarna wordt het voorgezegd */

/* De namen van de plaatswaarden, geteld vanaf rechts. */
var PLAATS  = ['eenheden', 'tientallen', 'honderdtallen', 'duizendtallen'];
/* Hetzelfde rijtje voor in de kop van een kolom, met een zacht afbreekstreepje
   erin. In de zinnen eronder hoort dat streepje niet thuis, dus dat blijft een
   apart rijtje. */
var KOPWOORD = ['een­heden', 'tien­tallen', 'honderd­tallen', 'duizend­tallen'];
var ENKEL   = ['eenheid', 'tiental', 'honderdtal', 'duizendtal'];
var LETTERS = ['E', 'T', 'H', 'D'];

function heel(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }

/* Een getal uit elkaar in losse cijfers, links te beginnen. 3482 met vier
   kolommen wordt [3,4,8,2]. */
function cijfers(getal, n){
  var uit = [];
  for (var k = n - 1; k >= 0; k--){ uit.unshift(getal % 10); getal = Math.floor(getal / 10); }
  return uit;
}
/* Van kolomnummer (links te beginnen) naar plaats vanaf rechts. */
function plaats(k, n){ return n - 1 - k; }

/* ============================================================================
   DE SOMMEN
   ============================================================================ */
function getalVan(n){ return heel(Math.pow(10, n - 1), Math.pow(10, n) - 1); }

/* Optellen. Het antwoord moet in hetzelfde aantal kolommen passen, anders zou
   er links een kolom bij moeten die er niet is. En liefst met onthouden,
   want daar gaat het om: zonder onthouden is het tien keer hetzelfde trucje. */
function somOptellen(n){
  var grens = Math.pow(10, n) - 1;
  for (var poging = 0; poging < 300; poging++){
    var a = getalVan(n), b = getalVan(n);
    if (a + b > grens) continue;
    if (!heeftOnthouden(a, b, n) && Math.random() < .75) continue;
    return { a:a, b:b };
  }
  return { a:Math.pow(10, n - 1), b:Math.pow(10, n - 1) };
}
function heeftOnthouden(a, b, n){
  var ca = cijfers(a, n), cb = cijfers(b, n), mee = 0, raak = false;
  for (var k = n - 1; k >= 0; k--){
    var som = ca[k] + cb[k] + mee;
    if (som > 9) raak = true;
    mee = Math.floor(som / 10);
  }
  return raak;
}

/* Aftrekken. Twee keer lenen achter elkaar uit dezelfde nul (304 - 78) is een
   verhaal apart; dat laten we hier weg, zodat elke som met één keer lenen per
   kolom te doen is. */
function somAftrekken(n){
  for (var poging = 0; poging < 400; poging++){
    var a = getalVan(n);
    var b = heel(Math.pow(10, n - 1), a - 1);
    if (b >= a) continue;
    var proef = stappenAftrekken(a, b, n);
    if (!proef) continue;
    var geleend = proef.some(function(s){ return s.soort === 'leen'; });
    if (!geleend && Math.random() < .75) continue;
    return { a:a, b:b };
  }
  return { a:Math.pow(10, n - 1) + 1, b:Math.pow(10, n - 1) };
}

/* ============================================================================
   DE STAPPENLIJST
   Elke stap: { soort, kol, waarde, uitleg }. soort is 'antwoord' (in de
   antwoordrij), 'onthoud' of 'leen' (in de hulprij erboven). kol telt van
   links af, zodat hij zo in het raster past.
   ============================================================================ */
function stappenInvullen(getal, n){
  var c = cijfers(getal, n);
  return c.map(function(cijfer, k){
    var p = plaats(k, n);
    return { soort:'antwoord', kol:k, waarde:cijfer, uitleg:
      'In ' + getal + ' hoort de ' + cijfer + ' bij de ' + PLAATS[p] + '. ' +
      (p === 0 ? 'De eenheden staan altijd helemaal rechts.'
               : 'Tel vanaf rechts: ' + PLAATS.slice(0, p + 1).join(', ') + '.') };
  });
}

function stappenOptellen(a, b, n){
  var ca = cijfers(a, n), cb = cijfers(b, n), mee = 0, uit = [];
  for (var k = n - 1; k >= 0; k--){
    var p = plaats(k, n);
    var som = ca[k] + cb[k] + mee;
    var cijfer = som % 10, volgende = Math.floor(som / 10);
    var rekening = ca[k] + ' + ' + cb[k] + (mee ? ' + ' + mee + ' van het onthouden' : '') + ' = ' + som;
    uit.push({ soort:'antwoord', kol:k, waarde:cijfer, uitleg:
      'Bij de ' + PLAATS[p] + ': ' + rekening + '. ' +
      (volgende ? 'De ' + cijfer + ' blijft hier staan, de ' + volgende + ' gaat naar de ' + PLAATS[p + 1] + '.'
                : 'Dat past in deze kolom, dus er gaat niets naar links.') });
    if (volgende && k > 0){
      uit.push({ soort:'onthoud', kol:k - 1, waarde:volgende, uitleg:
        'Omdat ' + rekening + ' is, gaat er ' + volgende + ' ' + ENKEL[p + 1] + ' naar de kolom links. ' +
        'Zet daarom een ' + volgende + ' bij onthouden boven de ' + PLAATS[p + 1] + '.' });
    }
    mee = volgende;
  }
  return uit;
}

/* Geeft null als er twee keer achter elkaar uit dezelfde kolom geleend zou
   moeten worden: die som hoort niet in dit spel. */
function stappenAftrekken(a, b, n){
  var boven = cijfers(a, n), cb = cijfers(b, n), uit = [];
  for (var k = n - 1; k >= 0; k--){
    var p = plaats(k, n);
    if (boven[k] < cb[k]){
      if (k === 0 || boven[k - 1] === 0) return null;
      var was = boven[k - 1], wordt = was - 1;
      uit.push({ soort:'leen', kol:k - 1, waarde:wordt, uitleg:
        'Bij de ' + PLAATS[p] + ' kun je ' + cb[k] + ' niet van ' + boven[k] + ' afhalen. ' +
        'Leen daarom ' + (p === 0 ? 'een tiental' : 'een ' + ENKEL[p + 1]) + ': de ' + was + ' bij de ' +
        PLAATS[p + 1] + ' wordt ' + wordt + ', en de ' + boven[k] + ' wordt ' + (boven[k] + 10) + '.' });
      boven[k - 1] = wordt;
      boven[k] += 10;
    }
    var geleend = boven[k] > 9;
    uit.push({ soort:'antwoord', kol:k, waarde:boven[k] - cb[k], uitleg:
      'Bij de ' + PLAATS[p] + ': ' + (geleend ? 'je hebt geleend, dus reken ' : '') +
      boven[k] + ' − ' + cb[k] + ' = ' + (boven[k] - cb[k]) + '.' });
  }
  return uit;
}

return { NIVEAUS:NIVEAUS, ONDERDELEN:ONDERDELEN, AANTAL:AANTAL, PUNT:PUNT, DUBBEL:DUBBEL, KANSEN:KANSEN, PLAATS:PLAATS, KOPWOORD:KOPWOORD, ENKEL:ENKEL, LETTERS:LETTERS, heel:heel, cijfers:cijfers, plaats:plaats, getalVan:getalVan, somOptellen:somOptellen, heeftOnthouden:heeftOnthouden, somAftrekken:somAftrekken, stappenInvullen:stappenInvullen, stappenOptellen:stappenOptellen, stappenAftrekken:stappenAftrekken };
})();
