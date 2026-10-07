/* De trucjes van de Rekenrace voor leer.js: per onderdeel een paar lessen.
   Elke maak() geeft een nieuwe som met de stappen van het trucje. */
window.LEER_REKENEN = (function(){
  'use strict';
  function heel(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
  function kies(l){ return l[Math.floor(Math.random() * l.length)]; }
  function toon(x){ return String(Math.round(x * 10000) / 10000).replace('.', ','); }
  var MIN = '−', KEER = '×';
  var plus = [
    { kop:'Optellen in twee stappen', kort:'Eerst de tientallen erbij, dan de eenheden',
      uit:'Twee getallen van twee cijfers tel je het makkelijkst op in stukken: eerst de tientallen van het tweede getal erbij, dan de eenheden.',
      voorbeeld:['47 + 36', 'eerst de tientallen: 47 + 30 = 77', 'dan de eenheden: 77 + 6 = 83'],
      maak:function(){ var a = heel(21, 79), b; do { b = heel(12, 49); } while (b % 10 === 0); var t = b - b % 10, e = b % 10;
        return { vraag:a + ' + ' + b, stappen:[a + ' + ' + t + ' = ' + (a + t)], slot:(a + t) + ' + ' + e + ' =', antwoord:[String(a + b)], invoer:'getal' }; } },
    { kop:'Via het tiental', kort:'Vul eerst aan tot het volgende tiental',
      uit:'Kom je over een tiental heen, splits dan het tweede getal: eerst tot het tiental, dan de rest. Zo hoef je nooit te tellen.',
      voorbeeld:['38 + 7', '7 = 2 + 5, want 38 + 2 = 40', '40 + 5 = 45'],
      maak:function(){ var a, b; do { a = heel(1, 8) * 10 + heel(5, 9); b = heel(4, 9); } while (a % 10 + b <= 10); var aan = 10 - a % 10;
        return { vraag:a + ' + ' + b, stappen:[b + ' = ' + aan + ' + ' + (b - aan), a + ' + ' + aan + ' = ' + (a + aan)], slot:(a + aan) + ' + ' + (b - aan) + ' =', antwoord:[String(a + b)], invoer:'getal' }; } },
    { kop:'Aftrekken in twee stappen', kort:'Eerst de tientallen eraf, dan de eenheden',
      uit:'Bij aftrekken werkt het net zo: haal eerst de tientallen eraf en dan de eenheden.',
      voorbeeld:['83 ' + MIN + ' 36', 'eerst de tientallen: 83 ' + MIN + ' 30 = 53', 'dan de eenheden: 53 ' + MIN + ' 6 = 47'],
      maak:function(){ var a = heel(52, 98), b; do { b = heel(13, 49); } while (b % 10 === 0 || b >= a); var t = b - b % 10, e = b % 10;
        return { vraag:a + ' ' + MIN + ' ' + b, stappen:[a + ' ' + MIN + ' ' + t + ' = ' + (a - t)], slot:(a - t) + ' ' + MIN + ' ' + e + ' =', antwoord:[String(a - b)], invoer:'getal' }; } },
    { kop:'Bijna een tiental', kort:'Reken met het ronde getal en verbeter daarna',
      uit:'Staat er 19, 29 of 48, reken dan met 20, 30 of 50. Daarna haal je eraf wat je te veel deed.',
      voorbeeld:['56 + 29', '29 is 30 ' + MIN + ' 1', '56 + 30 = 86, en dan 1 eraf: 85'],
      maak:function(){ var a = heel(23, 69), d = kies([1, 2]), rond = 10 * heel(2, 5), b = rond - d;
        return { vraag:a + ' + ' + b, stappen:[b + ' is ' + rond + ' ' + MIN + ' ' + d, a + ' + ' + rond + ' = ' + (a + rond)], slot:(a + rond) + ' ' + MIN + ' ' + d + ' =', antwoord:[String(a + b)], invoer:'getal' }; } }
  ];
  var delen = [
    { kop:'Delen is de tafel omdraaien', kort:'Zoek de keersom uit de tafel',
      uit:'Bij 56 : 8 vraag je: hoe vaak past 8 in 56? Dat is dezelfde vraag als 8 ' + KEER + ' ? = 56. Ken je de tafel, dan ken je de deling.',
      voorbeeld:['56 : 8', '8 ' + KEER + ' ? = 56', '8 ' + KEER + ' 7 = 56, dus 56 : 8 = 7'],
      maak:function(){ var t = heel(3, 9), k = heel(2, 9);
        return { vraag:(t * k) + ' : ' + t, stappen:[t + ' ' + KEER + ' ? = ' + (t * k)], slot:(t * k) + ' : ' + t + ' =', antwoord:[String(k)], invoer:'getal' }; } },
    { kop:'Delen door 2, 4 en 8', kort:'Halveren, en nog een keer halveren',
      uit:'Delen door 2 is halveren. Delen door 4 is twee keer halveren, delen door 8 drie keer.',
      voorbeeld:['96 : 4', 'de helft van 96 is 48', 'de helft van 48 is 24'],
      maak:function(){ var d = kies([4, 4, 8]), q = heel(6, 25), v = d * q, st = [], x = v;
        for (var i = 1; i < (d === 4 ? 2 : 3); i++){ st.push('de helft van ' + x + ' is ' + (x / 2)); x = x / 2; }
        return { vraag:v + ' : ' + d, stappen:st, slot:'de helft van ' + x + ' is', antwoord:[String(q)], invoer:'getal' }; } },
    { kop:'Grote getallen splitsen', kort:'Splits in een stuk dat je makkelijk deelt',
      uit:'Een groot getal deel je in stukken. Kies een stuk dat je in een keer kunt delen, meestal een tiental van de tafel, en deel de rest apart.',
      voorbeeld:['84 : 4', '84 = 80 + 4', '80 : 4 = 20 en 4 : 4 = 1', '20 + 1 = 21'],
      maak:function(){ var d = heel(2, 6), m = heel(1, 4), e = heel(1, 9), q = 10 * m + e, v = d * q;
        return { vraag:v + ' : ' + d, stappen:[v + ' = ' + (d * 10 * m) + ' + ' + (d * e), (d * 10 * m) + ' : ' + d + ' = ' + (10 * m), (d * e) + ' : ' + d + ' = ' + e], slot:(10 * m) + ' + ' + e + ' =', antwoord:[String(q)], invoer:'getal' }; } }
  ];
  var komma = [
    { kop:'Keer 10, 100 en 1000', kort:'De komma schuift naar rechts',
      uit:'Keer 10 maakt elk cijfer tien keer zo veel waard: de komma schuift een plaats naar rechts. Keer 100 twee plaatsen, keer 1000 drie. Is er geen cijfer meer, dan komt er een nul.',
      voorbeeld:['3,45 ' + KEER + ' 100', 'keer 100: de komma twee plaatsen naar rechts', '3,45 wordt 345'],
      maak:function(){ var g = heel(11, 999) / 100, k = kies([10, 100, 1000]), n = String(k).length - 1;
        return { vraag:toon(g) + ' ' + KEER + ' ' + k, stappen:['keer ' + k + ': de komma ' + n + (n === 1 ? ' plaats' : ' plaatsen') + ' naar rechts'], slot:toon(g) + ' ' + KEER + ' ' + k + ' =', antwoord:[toon(g * k)], invoer:'getal' }; } },
    { kop:'Delen door 10 en 100', kort:'De komma schuift naar links',
      uit:'Delen door 10 maakt alles tien keer zo klein: de komma schuift een plaats naar links. Door 100 twee plaatsen. Staat er geen komma, denk hem dan achter het getal.',
      voorbeeld:['45 : 100', '45 is 45,0', 'twee plaatsen naar links: 0,45'],
      maak:function(){ var g = heel(3, 950), k = kies([10, 100]), n = k === 10 ? 1 : 2;
        return { vraag:g + ' : ' + k, stappen:[g + ' is ' + g + ',0', 'delen door ' + k + ': de komma ' + n + (n === 1 ? ' plaats' : ' plaatsen') + ' naar links'], slot:g + ' : ' + k + ' =', antwoord:[toon(g / k)], invoer:'getal' }; } },
    { kop:'Optellen met een komma', kort:'Eerst de hele getallen, dan de tienden',
      uit:'Tel de hele getallen bij elkaar en de tienden bij elkaar. Zijn het samen tien tienden of meer, dan is dat een heel getal erbij.',
      voorbeeld:['3,6 + 4,7', '3 + 4 = 7', '0,6 + 0,7 = 1,3', '7 + 1,3 = 8,3'],
      maak:function(){ var a1 = heel(1, 15), a2 = heel(1, 9), b1 = heel(1, 15), b2 = heel(1, 9), som = a2 + b2;
        return { vraag:toon(a1 + a2 / 10) + ' + ' + toon(b1 + b2 / 10), stappen:[a1 + ' + ' + b1 + ' = ' + (a1 + b1), toon(a2 / 10) + ' + ' + toon(b2 / 10) + ' = ' + toon(som / 10)], slot:(a1 + b1) + ' + ' + toon(som / 10) + ' =', antwoord:[toon(a1 + b1 + som / 10)], invoer:'getal' }; } }
  ];
  var procent = [
    { kop:'10 procent', kort:'10% is delen door 10',
      uit:'Procent betekent per honderd. 10% is een tiende deel: deel door 10. Van 10% maak je snel 20%, 30% of 40%: gewoon 2, 3 of 4 keer zoveel.',
      voorbeeld:['30% van 80', '10% van 80 = 8', '30% is 3 keer zoveel: 3 ' + KEER + ' 8 = 24'],
      maak:function(){ var g = 10 * heel(3, 40), p = kies([10, 20, 30, 40]), t = g / 10;
        return p === 10 ? { vraag:'10% van ' + g, stappen:['10% is een tiende: delen door 10'], slot:g + ' : 10 =', antwoord:[String(t)], invoer:'getal' }
          : { vraag:p + '% van ' + g, stappen:['10% van ' + g + ' = ' + t], slot:(p / 10) + ' ' + KEER + ' ' + t + ' =', antwoord:[String(t * p / 10)], invoer:'getal' }; } },
    { kop:'50, 25 en 75 procent', kort:'De helft, een kwart en drie kwart',
      uit:'50% is de helft. 25% is een kwart: twee keer halveren. 75% is drie kwart: eerst een kwart, dan drie keer zoveel.',
      voorbeeld:['75% van 60', '25% van 60 = 15', '3 ' + KEER + ' 15 = 45'],
      maak:function(){ var p = kies([50, 25, 75]), g = 4 * heel(5, 40);
        if (p === 50) return { vraag:'50% van ' + g, stappen:['50% is de helft'], slot:g + ' : 2 =', antwoord:[String(g / 2)], invoer:'getal' };
        if (p === 25) return { vraag:'25% van ' + g, stappen:['25% is een kwart: twee keer halveren', 'de helft van ' + g + ' = ' + (g / 2)], slot:'de helft van ' + (g / 2) + ' =', antwoord:[String(g / 4)], invoer:'getal' };
        return { vraag:'75% van ' + g, stappen:['25% van ' + g + ' = ' + (g / 4)], slot:'3 ' + KEER + ' ' + (g / 4) + ' =', antwoord:[String(3 * g / 4)], invoer:'getal' }; } },
    { kop:'5 en 1 procent', kort:'5% is de helft van 10%, 1% is delen door 100',
      uit:'1% is een honderdste deel: deel door 100. 5% is de helft van 10%.',
      voorbeeld:['5% van 240', '10% van 240 = 24', 'de helft van 24 = 12'],
      maak:function(){ if (Math.random() < .5){ var g = 20 * heel(3, 30); return { vraag:'5% van ' + g, stappen:['10% van ' + g + ' = ' + (g / 10)], slot:'de helft van ' + (g / 10) + ' =', antwoord:[String(g / 20)], invoer:'getal' }; }
        var h = 100 * heel(2, 30); return { vraag:'1% van ' + h, stappen:['1% is een honderdste: delen door 100'], slot:h + ' : 100 =', antwoord:[String(h / 100)], invoer:'getal' }; } },
    { kop:'Een breuk van een getal', kort:'Een kwart van iets is delen door 4',
      uit:'Een derde van iets is delen door 3, een kwart delen door 4. Bij drie kwart reken je eerst een kwart uit en doe je dat drie keer.',
      voorbeeld:['3/4 van 80', '1/4 van 80 = 80 : 4 = 20', '3 ' + KEER + ' 20 = 60'],
      maak:function(){ var n = kies([2, 3, 4, 5]), g = n * heel(4, 20);
        if (n >= 3 && Math.random() < .5){ var t = n - 1; return { vraag:t + '/' + n + ' van ' + g, stappen:['1/' + n + ' van ' + g + ' = ' + (g / n)], slot:t + ' ' + KEER + ' ' + (g / n) + ' =', antwoord:[String(t * g / n)], invoer:'getal' }; }
        return { vraag:'1/' + n + ' van ' + g, stappen:['1/' + n + ' is delen door ' + n], slot:g + ' : ' + n + ' =', antwoord:[String(g / n)], invoer:'getal' }; } }
  ];
  /* ---------- grote keersommen: splitsen en onder elkaar ---------- */
  /* een getal in zijn delen: 489 -> [400, 80, 9], nullen weggelaten */
  function delenVan(a){ var s = String(a), uit = []; for (var i = 0; i < s.length; i++){ var d = +s[i] * Math.pow(10, s.length - 1 - i); if (d) uit.push(d); } return uit; }
  /* 489 x 9 onder elkaar, als tabel: onthouden cijfers klein erboven, en met of zonder de uitkomst */
  function cijfer(a, b, metUitkomst){
    var ds = String(a).split('').map(Number), uit = String(a * b), breed = Math.max(uit.length, ds.length) + 1;
    /* onth[i]: wat er overblijft na het cijfer op plek i; dat staat boven het cijfer links ervan */
    var onth = [], rest = 0;
    for (var i = ds.length - 1; i >= 0; i--){ var p = ds[i] * b + rest; rest = Math.floor(p / 10); onth[i] = rest; }
    function rij(cellen, kl){ var pad = []; for (var k = cellen.length; k < breed; k++) pad.push(''); return '<tr' + (kl ? ' class="' + kl + '"' : '') + '>' + pad.concat(cellen).map(function(c){ return '<td' + (c === KEER ? ' class="teken"' : '') + '>' + c + '</td>'; }).join('') + '</tr>'; }
    var boven = ds.map(function(_, j){ return metUitkomst && j < ds.length - 1 && onth[j + 1] ? String(onth[j + 1]) : ''; });
    var maal = [KEER]; for (var m = 1; m < ds.length; m++) maal.push(''); maal.push(String(b));
    var streep = []; for (var s2 = 0; s2 < breed; s2++) streep.push('');
    return '<table class="lr-cijfer" aria-label="' + a + ' keer ' + b + ' onder elkaar">' + rij(boven, 'onth') + rij(ds.map(String)) + rij(maal.slice(-(ds.length + 1))) +
      rij(streep, 'streep') + (metUitkomst ? rij(uit.split('')) : rij(['?'])) + '</table>';
  }
  /* de stappen van onder elkaar, van rechts naar links */
  function cijferStappen(a, b){
    var ds = String(a).split('').map(Number), st = [], rest = 0;
    for (var i = ds.length - 1; i >= 0; i--){
      var p = ds[i] * b, tot = p + rest, laatste = i === 0;
      st.push(b + ' ' + KEER + ' ' + ds[i] + ' = ' + p + (rest ? ', plus ' + rest + ' onthouden = ' + tot : '') + (laatste ? ': schrijf ' + tot + ' op' : ': schrijf ' + (tot % 10) + (tot >= 10 ? ', onthoud ' + Math.floor(tot / 10) : '')));
      rest = Math.floor(tot / 10);
    }
    return st;
  }
  var keer = [
    { kop:'Keer met splitsen', kort:'Splits het grote getal in honderdtallen, tientallen en eenheden',
      uit:'Een grote keersom maak je klein: splits het getal in stukken die je met de tafels uitrekent, en tel de stukken op. Bij 400 ' + KEER + ' 9 reken je 4 ' + KEER + ' 9 = 36 en zet je er twee nullen achter.',
      voorbeeld:['489 ' + KEER + ' 9', '400 ' + KEER + ' 9 = 3600', '80 ' + KEER + ' 9 = 720', '9 ' + KEER + ' 9 = 81', '3600 + 720 + 81 = 4401'],
      maak:function(){ var a = Math.random() < .3 ? heel(23, 98) : heel(123, 899), b = heel(3, 9), d = delenVan(a);
        return { vraag:a + ' ' + KEER + ' ' + b, stappen:[a + ' = ' + d.join(' + ')].concat(d.map(function(x){ return x + ' ' + KEER + ' ' + b + ' = ' + (x * b); })), slot:d.map(function(x){ return x * b; }).join(' + ') + ' =', antwoord:[String(a * b)], invoer:'getal' }; } },
    { kop:'Onder elkaar', kort:'Van rechts naar links, en onthoud wat over de tien gaat',
      uit:'Zet de getallen onder elkaar. Begin rechts: keer het laatste cijfer, schrijf de eenheden op en onthoud de tientallen. Bij het volgende cijfer tel je wat je onthield erbij op.',
      beeld:cijfer(489, 9, true),
      voorbeeld:cijferStappen(489, 9),
      maak:function(){ var a = heel(123, 899), b = heel(3, 9);
        return { vraag:a + ' ' + KEER + ' ' + b, beeld:cijfer(a, b, false), beeldNa:cijfer(a, b, true), stappen:cijferStappen(a, b), slot:'uitkomst onder de streep:', antwoord:[String(a * b)], invoer:'getal' }; } },
    { kop:'Twee cijfers keer twee cijfers', kort:'Splits het tweede getal in tientallen en eenheden',
      uit:'Bij 23 ' + KEER + ' 14 splits je de 14 in 10 en 4. Eerst 23 ' + KEER + ' 10, dan 23 ' + KEER + ' 4, en dan optellen.',
      voorbeeld:['23 ' + KEER + ' 14', '23 ' + KEER + ' 10 = 230', '23 ' + KEER + ' 4 = 92', '230 + 92 = 322'],
      maak:function(){ var a = heel(12, 49), t = heel(1, 4), e = heel(2, 9), b = 10 * t + e;
        return { vraag:a + ' ' + KEER + ' ' + b, stappen:[b + ' = ' + (10 * t) + ' + ' + e, a + ' ' + KEER + ' ' + (10 * t) + ' = ' + (a * 10 * t), a + ' ' + KEER + ' ' + e + ' = ' + (a * e)], slot:(a * 10 * t) + ' + ' + (a * e) + ' =', antwoord:[String(a * b)], invoer:'getal' }; } }
  ];
  return { plus:plus, delen:delen, komma:komma, procent:procent, keer:keer, delenVan:delenVan };
})();
