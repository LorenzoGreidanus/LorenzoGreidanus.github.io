/* Uitleg stap voor stap bij de Balans: een vergelijking oplossen door aan
   beide kanten hetzelfde te doen. De opgaven komen uit het spel zelf
   (maakOpgave in balans.html), op het niveau van de gekozen uitleg. */
STAPPEN.les('balans', function(){
  var S = STAPPEN;
  function kant(o){
    var l = [], i;
    for (i = 0; i < o.x; i++) l.push('x');
    for (i = 0; i < Math.abs(o.n); i++) l.push(o.n < 0 ? '-1' : '1');
    return l;
  }
  function tekst(o){
    var d = [];
    if (o.x) d.push((o.x === 1 ? '' : o.x) + 'x');
    if (o.n || !o.x) d.push(d.length ? (o.n < 0 ? '− ' + (-o.n) : '+ ' + o.n) : String(o.n));
    return d.join(' ');
  }
  function som(L, R){ return S.formule(tekst(L) + ' = ' + tekst(R)); }
  function beeld(L, R, weg){ return '<div style="display:grid;gap:12px;width:100%">' + S.weeg(kant(L), kant(R), weg) + som(L, R) + '</div>'; }

  /* een opgave oplossen, stap voor stap; L en R worden onderweg bijgewerkt */
  function oplossen(op){
    var L = { x:op.L.x, n:op.L.n }, R = { x:op.R.x, n:op.R.n }, x = op.x, uit = [];
    uit.push({ kop: 'De balans: ' + tekst(L) + ' = ' + tekst(R), beeld: beeld(L, R),
      tekst: '<p>Links en rechts wegen even zwaar. Een blauw zakje is <b>x</b>: daar zit een onbekend aantal blokjes in. Een oranje blokje is 1' + (L.n < 0 || R.n < 0 ? ', een rood blokje is −1' : '') + '.</p>' +
        '<p>Het doel: één zakje alleen aan een kant. Wat je aan de ene kant doet, doe je ook aan de andere kant, anders raakt de balans uit evenwicht.</p>' });
    /* 1. zakjes aan twee kanten: haal de kleinste hoeveelheid weg */
    var m = Math.min(L.x, R.x);
    if (m > 0){
      uit.push({ kop: 'Haal ' + m + ' ' + (m === 1 ? 'zakje' : 'zakjes') + ' weg aan beide kanten', beeld: beeld(L, R, { links:{ x:m }, rechts:{ x:m } }),
        tekst: '<p>Er liggen zakjes aan twee kanten. Haal er links en rechts ' + m + ' weg: dan blijft het in evenwicht, en staan de zakjes nog maar aan één kant.</p>' });
      L.x -= m; R.x -= m;
      uit.push({ kop: 'Nu: ' + tekst(L) + ' = ' + tekst(R), beeld: beeld(L, R), tekst: '<p>De zakjes staan nu alleen nog links.</p>' });
    }
    /* 2. rode blokjes: leg er evenveel oranje bij, dan vallen ze tegen elkaar weg */
    if (L.n < 0){
      var r = -L.n;
      uit.push({ kop: 'Rode blokjes wegwerken', beeld: beeld(L, R),
        tekst: '<p>Links liggen ' + r + ' rode blokjes: dat is −' + r + '. Een rood en een oranje blokje samen zijn 0.</p>' +
          '<p>Leg daarom aan <b>beide</b> kanten ' + r + ' oranje blokjes erbij. Links vallen ze tegen de rode weg, rechts komen er ' + r + ' bij.</p>' +
          S.formule(tekst(L) + ' <span class="st-na">+ ' + r + '</span> = ' + tekst(R) + ' <span class="st-na">+ ' + r + '</span>') });
      L.n = 0; R.n += r;
      uit.push({ kop: 'Nu: ' + tekst(L) + ' = ' + tekst(R), beeld: beeld(L, R), tekst: '<p>De zakjes staan nu alleen, zonder losse blokjes ernaast.</p>' });
    } else if (L.n > 0){
      var b = L.n;
      uit.push({ kop: 'Haal ' + b + ' ' + (b === 1 ? 'blokje' : 'blokjes') + ' weg aan beide kanten', beeld: beeld(L, R, { links:{ een:b }, rechts:{ een:b } }),
        tekst: '<p>Naast de zakjes liggen ' + b + ' losse blokjes. Haal er links ' + b + ' weg, en rechts ook ' + b + '.</p>' +
          S.formule(tekst(L) + ' <span class="st-na">− ' + b + '</span> = ' + tekst(R) + ' <span class="st-na">− ' + b + '</span>') });
      L.n = 0; R.n -= b;
      uit.push({ kop: 'Nu: ' + tekst(L) + ' = ' + tekst(R), beeld: beeld(L, R), tekst: '<p>Links liggen alleen nog zakjes.</p>' });
    }
    /* 3. delen */
    if (L.x > 1){
      uit.push({ kop: 'Verdeel eerlijk over de zakjes', beeld: beeld({ x:1, n:0 }, { x:0, n:x }),
        tekst: '<p>' + L.x + ' zakjes wegen samen ' + R.n + '. Dan weegt één zakje ' + R.n + ' : ' + L.x + ' = <b>' + x + '</b>.</p>' +
          S.formule(tekst(L) + ' = ' + R.n + ' <span class="st-zacht">→</span> x = ' + R.n + ' : ' + L.x + ' = <span class="st-na">' + x + '</span>') });
    } else {
      uit.push({ kop: 'x = ' + x, beeld: beeld({ x:1, n:0 }, { x:0, n:x }), tekst: '<p>Eén zakje weegt evenveel als ' + x + ' blokjes: x = <b>' + x + '</b>.</p>' });
    }
    /* 4. controle */
    var lw = op.L.x * x + op.L.n, rw = op.R.x * x + op.R.n;
    uit.push({ kop: 'Controleer: vul x = ' + x + ' in', beeld: S.formule(tekst(op.L).replace('x', ' × ' + x) + ' = ' + lw + ' <span class="st-zacht">en</span> ' + (op.R.x ? tekst(op.R).replace('x', ' × ' + x) + ' = ' : '') + rw),
      tekst: '<p>Zet ' + x + ' op de plaats van x in de oorspronkelijke vergelijking. Links komt er ' + lw + ' uit, rechts ' + rw + '. Gelijk, dus het klopt.</p>' +
        S.bak('Zo kun je elke vergelijking nakijken, ook op een toets.', 'goed') });
    return uit;
  }

  return [
    { id: 'een', naam: 'Eerste stappen: 3x + 2 = 11', uitleg: 'Losse blokjes weghalen, dan delen.', stappen: function(){ return oplossen(maakOpgave('een')); } },
    { id: 'twee', naam: 'x aan twee kanten: 5x + 1 = 2x + 10', uitleg: 'Eerst de zakjes aan één kant krijgen.', stappen: function(){ return oplossen(maakOpgave('twee')); } },
    { id: 'drie', naam: 'Met negatief: 4x − 3 = 9', uitleg: 'Rode blokjes wegwerken door er oranje bij te leggen.', stappen: function(){ return oplossen(maakOpgave('drie')); } }
  ];
});
