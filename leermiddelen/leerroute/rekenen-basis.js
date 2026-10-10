/* De leerroute rekenen, fundament: getalbegrip, splitsen en aanvullen, en plus en min tot 20, 100 en 1000.
   Per soort som elke manier als eigen doel, en per groep een doel "Kies de handigste manier".
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var MIN = '−';

  /* ---------- hulpjes ---------- */
  /* een invulstap */
  function S(tekst, ant, hint, fout, waarom){
    var s = { tekst:tekst, antwoord:[].concat(ant).map(String), hint:hint };
    if (fout) s.fout = fout;
    if (waarom) s.waarom = waarom;
    return s;
  }
  /* een keuzestap; o.vast houdt de volgorde (voor/na, even/oneven) */
  function K(R, tekst, lijst, goed, hint, o){
    o = o || {};
    var l = (o.vast ? lijst.slice() : R.hussel(lijst)).map(String);
    var s = { tekst:tekst, opties:l, goed:l.indexOf(String(goed)), hint:hint };
    if (o.waarom) s.waarom = o.waarom;
    if (o.fout) s.fout = o.fout;
    return s;
  }
  /* foutmeldingen: F(goed, fout1, uitleg1, fout2, uitleg2, ...), het goede antwoord valt eruit */
  function F(goed){
    var o = {};
    for (var i = 1; i < arguments.length; i += 2){ var k = String(arguments[i]).toLowerCase(); if (k !== String(goed) && !(k in o)) o[k] = arguments[i + 1]; }
    return o;
  }
  function plus(a, b){ return a + ' + ' + b; }
  function min(a, b){ return a + ' ' + MIN + ' ' + b; }
  function sp(van, naar, kleur){ var d = naar - van; return { van:van, naar:naar, tekst:(d >= 0 ? '+' : MIN) + Math.abs(d), kleur:kleur }; }
  function tal(n, enk, mv){ return n + ' ' + (n === 1 ? enk : mv); }
  function tienBoven(x){ return Math.ceil(x / 10) * 10; }
  /* een getallenlijn rond de punten, op tientallen (of honderdtallen als het ver uit elkaar ligt) */
  function lijn(R, punten, sprongen, o){
    o = o || {};
    var lo = Math.min.apply(null, punten), hi = Math.max.apply(null, punten), g = o.g || (hi - lo > 100 ? 100 : 10);
    var van = Math.floor(lo / g) * g, tot = Math.ceil(hi / g) * g;
    if (tot === van) tot += g;
    return R.teken.lijn({ van:van, tot:tot, streep:tot - van <= 30 ? 1 : undefined, labels:o.labels || [van, tot], sprongen:sprongen || [], stip:o.stip || [], nieuw:true });
  }
  function lijn20(R, sprongen, stip){ return R.teken.lijn({ van:0, tot:20, streep:1, labels:[0, 10, 20], sprongen:sprongen || [], stip:stip || [], nieuw:true }); }

  /* een rekenrekje: rijen = [[{n, k (kleur 1..5, weg = leeg), weg (doorgestreept)}], ...] */
  function kralen(rijen, aria){
    var d = 28, r = 11.5, s = '', W = 20 + 9 * d + 12 + 20;
    rijen.forEach(function(rij, y){
      var i = 0, cy = 20 + y * 34;
      s += '<line x1="6" y1="' + cy + '" x2="' + (W - 6) + '" y2="' + cy + '" class="as dun"/>';
      rij.forEach(function(seg){
        for (var k = 0; k < seg.n; k++, i++){
          var cx = 20 + i * d + (i >= 5 ? 12 : 0);
          s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" style="fill:' + (seg.k ? 'var(--lr-' + seg.k + ')' : 'var(--kaart)') + ';stroke:var(--ink);stroke-width:1.5' + (seg.weg ? ';opacity:.3' : '') + '"/>';
          if (seg.weg) s += '<path d="M' + (cx - 8) + ' ' + (cy - 8) + ' l16 16 M' + (cx + 8) + ' ' + (cy - 8) + ' l-16 16" style="stroke:var(--ink);stroke-width:2.5;fill:none"/>';
        }
      });
    });
    var H = rijen.length * 34 + 6;
    return '<svg class="lr-svg" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:' + Math.round(W * 1.4) + 'px" role="img" aria-label="' + aria + '">' + s + '</svg>';
  }
  /* blokjes in tweetallen: wat overblijft is oranje */
  function paren(e){
    var s = '', W = 200;
    for (var i = 0; i < e; i++){
      var kol = Math.floor(i / 2), rij = i % 2, los = (e % 2 === 1 && i === e - 1);
      s += '<rect x="' + (14 + kol * 36) + '" y="' + (8 + rij * 30) + '" width="24" height="24" rx="5" style="fill:var(--lr-' + (los ? 2 : 1) + ');stroke:var(--ink);stroke-width:1.5"/>';
    }
    s += '<text x="' + (W / 2) + '" y="' + (e ? 90 : 46) + '" class="getal klein">' + (e === 0 ? 'geen eenheden: er blijft niets over' : e % 2 ? 'er blijft 1 over' : 'er blijft niets over') + '</text>';
    return '<svg class="lr-svg" viewBox="0 0 ' + W + ' 98" style="max-width:300px" role="img" aria-label="' + e + ' blokjes in tweetallen">' + s + '</svg>';
  }
  /* een getallenlijn om te schatten: o = { tot, w, letters:[posities] | null, midden, ant } */
  function schat(R, o){
    var W = 600, L = 40, Rr = 560, Y = 84, tot = o.tot;
    function x(v){ return L + v / tot * (Rr - L); }
    var s = '<line x1="' + (L - 10) + '" y1="' + Y + '" x2="' + (Rr + 10) + '" y2="' + Y + '" class="as"/>';
    for (var i = 0; i <= 10; i++){ var v = tot * i / 10, g = i % 5 === 0; s += '<line x1="' + x(v) + '" y1="' + (Y - (g ? 10 : 6)) + '" x2="' + x(v) + '" y2="' + (Y + (g ? 10 : 6)) + '" class="as"/>'; }
    s += '<text x="' + x(0) + '" y="' + (Y + 32) + '" class="getal">0</text><text x="' + x(tot) + '" y="' + (Y + 32) + '" class="getal">' + tot + '</text>';
    if (o.midden) s += '<text x="' + x(tot / 2) + '" y="' + (Y + 32) + '" class="getal">' + (tot / 2) + '</text>';
    if (o.letters) o.letters.forEach(function(p, i){
      s += '<circle cx="' + x(p) + '" cy="' + Y + '" r="6" style="fill:var(--lr-1)"/><text x="' + x(p) + '" y="' + (Y - 18) + '" class="getal groot" style="fill:var(--lr-1)">' + 'ABCD'.charAt(i) + '</text>';
    });
    else s += '<circle cx="' + x(o.w) + '" cy="' + Y + '" r="7" class="stip"/>' + (o.ant ? '' : '<text x="' + x(o.w) + '" y="' + (Y - 18) + '" class="getal groot" style="fill:var(--lr-2)">?</text>');
    if (o.ant) s += '<text x="' + x(o.w) + '" y="' + (Y - (o.letters ? 46 : 18)) + '" class="getal groot" style="fill:var(--lr-2)">' + o.w + '</text>';
    return '<svg class="lr-svg" viewBox="0 0 ' + W + ' 130" role="img" aria-label="getallenlijn van 0 tot ' + tot + '">' + s + '</svg>';
  }
  /* twee rijen op een getallenlijn, even lang: het verschil blijft gelijk */
  function verschuif(rijen){
    var lo = Infinity, hi = -Infinity;
    rijen.forEach(function(r){ lo = Math.min(lo, r[0]); hi = Math.max(hi, r[1]); });
    lo = Math.floor(lo / 10) * 10; hi = Math.ceil(hi / 10) * 10; if (hi === lo) hi += 10;
    var W = 620, L = 30, Rr = 590, s = '';
    function x(v){ return L + (v - lo) / (hi - lo) * (Rr - L); }
    rijen.forEach(function(r, i){
      var y = 30 + i * 66;
      s += '<line x1="' + L + '" y1="' + y + '" x2="' + Rr + '" y2="' + y + '" class="as dun"/>';
      s += '<rect x="' + x(r[0]) + '" y="' + (y - 7) + '" width="' + (x(r[1]) - x(r[0])) + '" height="14" rx="4" style="fill:var(--lr-' + (i + 1) + ');opacity:.85"/>';
      s += '<text x="' + x(r[0]) + '" y="' + (y + 30) + '" class="getal">' + r[0] + '</text><text x="' + x(r[1]) + '" y="' + (y + 30) + '" class="getal">' + r[1] + '</text>';
    });
    return '<svg class="lr-svg" viewBox="0 0 ' + W + ' ' + (rijen.length * 66 + 10) + '" role="img" aria-label="het verschil blijft even groot">' + s + '</svg>';
  }
  /* staven: twee getallen naast elkaar, samen even lang */
  function staaf(rijen){
    var tot = rijen[0][0] + rijen[0][1], L = 10, B = 580, s = '';
    rijen.forEach(function(r, i){
      var y = 28 + i * 64, w1 = r[0] / tot * B;
      s += '<rect x="' + L + '" y="' + y + '" width="' + w1 + '" height="30" style="fill:var(--lr-1);opacity:.85;stroke:var(--kaart);stroke-width:2"/>';
      s += '<rect x="' + (L + w1) + '" y="' + y + '" width="' + (B - w1) + '" height="30" style="fill:var(--lr-2);opacity:.85;stroke:var(--kaart);stroke-width:2"/>';
      s += '<text x="' + (L + w1 / 2) + '" y="' + (y - 7) + '" class="getal">' + r[0] + '</text><text x="' + (L + w1 + (B - w1) / 2) + '" y="' + (y - 7) + '" class="getal">' + r[1] + '</text>';
    });
    return '<svg class="lr-svg" viewBox="0 0 600 ' + (rijen.length * 64 + 4) + '" role="img" aria-label="de som blijft even groot">' + s + '</svg>';
  }

  /* ================= de manieren (ook gebruikt door "Kies de handigste manier") =================
     elk geeft { stappen, beeld:function(n) } */

  /* ---- tot 20 ---- */
  function mErbij(R, a, b){
    var st = [];
    for (var i = 1; i <= b; i++){
      var v = a + i - 1;
      st.push(S((i === 1 ? 'Begin bij ' + a + '. Spring 1 verder: ' : i === b ? 'De laatste sprong: ' : 'Spring nog 1 verder: ') + v + ' + 1 =', v + 1,
        'Tel hardop verder vanaf ' + v + '. Welk getal komt daarna?'));
    }
    return { stappen:st, beeld:function(n){ var s = []; for (var i = 0; i < Math.min(n, b); i++) s.push(sp(a + i, a + i + 1, 0)); return lijn20(R, s, [a]); } };
  }
  function mGrootste(R, a, b){ /* a klein, b groot, de som is a + b */
    return { stappen:[
        K(R, 'Met welk getal begin je?', [a, b], b, 'Begin bij het grootste getal, ' + b + '. Dan hoef je maar ' + a + ' verder te tellen.', { vast:true, waarom:'Je draait de som om: ' + plus(b, a) + '. Dat mag bij plus.' }),
        S('Tel ' + a + ' verder: ' + plus(b, a) + ' =', a + b, 'Begin bij ' + b + ' en tel ' + a + ' keer 1 verder.') ],
      beeld:function(n){ var s = []; if (n >= 2) for (var i = 0; i < a; i++) s.push(sp(b + i, b + i + 1, 0)); return lijn20(R, s, n >= 1 ? [b] : []); } };
  }
  function mDubbel20(R, a){
    var r = a - 5, rij = [{ n:5, k:1 }, { n:r, k:3 }];
    return { stappen:[
        S('Splits ' + a + ' in 5 en de rest: ' + a + ' = 5 + …', r, 'Op het rekje: 5 blauwe kralen en dan nog wat gele.'),
        S('De vijven samen: 5 + 5 =', 10, 'Twee keer 5: twee handen vol.'),
        S('De rest dubbel: ' + plus(r, r) + ' =', 2 * r, 'Twee keer ' + r + '.'),
        S('Alles samen: ' + plus(10, 2 * r) + ' =', 2 * a, 'Tien en nog ' + (2 * r) + '.', F(2 * a, 10 + r, 'Je nam de rest maar een keer. Het is ' + plus(r, r) + '.')) ],
      beeld:function(){ return kralen([rij, rij], plus(a, a) + ' op een rekje'); } };
  }
  function mBijna20(R, a, b){
    var k = Math.min(a, b);
    function rij(x){ return x === k ? [{ n:k, k:1 }] : [{ n:k, k:1 }, { n:1, k:2 }]; }
    return { stappen:[
        S('Neem het kleinste getal dubbel: ' + plus(k, k) + ' =', 2 * k, k >= 5 ? 'Twee keer ' + k + '. Denk aan 5 + 5 = 10, en dan nog ' + plus(k - 5, k - 5) + '.' : 'Twee keer ' + k + '.'),
        S('Het andere getal is 1 meer. Doe er 1 bij: ' + plus(2 * k, 1) + ' =', 2 * k + 1, 'Er komt maar een kraal bij.', F(2 * k + 1, 2 * k + 2, 'Je deed er 2 bij. ' + a + ' en ' + b + ' schelen maar 1.')) ],
      beeld:function(){ return kralen([rij(a), rij(b)], plus(a, b) + ' op een rekje'); } };
  }
  function mBrug20(R, a, b){
    var k = 10 - a, r = b - k;
    return { stappen:[
        S('Maak eerst 10: ' + a + ' + … = 10', k, 'Wat is het vriendje van ' + a + '? Samen moeten ze 10 zijn.'),
        S('Splits ' + b + ': ' + b + ' = ' + k + ' + …', r, 'Je hebt al ' + k + ' gebruikt. Wat blijft er over van ' + b + '?'),
        S(plus(10, r) + ' =', a + b, 'Vanaf 10 nog ' + r + ' verder.') ],
      beeld:function(n){ var s = []; if (n >= 1) s.push(sp(a, 10, 0)); if (n >= 3) s.push(sp(10, a + b, 2)); return lijn20(R, s, [a]); } };
  }
  function mDubbelMin20(R, x){
    var a = 2 * x;
    return { stappen:[
        S('Welke dubbele som is ' + a + '? … + … = ' + a, x, 'Zoek twee dezelfde getallen die samen ' + a + ' zijn. Probeer ' + plus(x - 1, x - 1) + ' en ' + plus(x + 1, x + 1) + '.'),
        S('Haal een van de twee weg: ' + min(a, x) + ' =', x, 'Van ' + plus(x, x) + ' haal je er een ' + x + ' af. Wat blijft er over?') ],
      beeld:function(n){ return kralen([[{ n:x, k:1 }], [{ n:x, k:1, weg:n >= 2 }]], min(a, x) + ' op een rekje'); } };
  }
  function mBrugMin20(R, a, b){
    var e = a - 10, r = b - e;
    return { stappen:[
        S('Spring eerst terug naar 10: ' + a + ' ' + MIN + ' … = 10', e, 'Hoeveel is ' + a + ' meer dan 10? Kijk naar de eenheden.'),
        S('Splits ' + b + ': ' + b + ' = ' + e + ' + …', r, 'Je hebt al ' + e + ' teruggesprongen. Wat blijft er over van ' + b + '?'),
        S(min(10, r) + ' =', a - b, 'Vanaf 10 nog ' + r + ' terug.', F(a - b, 10 + r, 'Bij min spring je terug, niet verder.')) ],
      beeld:function(n){ var s = []; if (n >= 1) s.push(sp(a, 10, 0)); if (n >= 3) s.push(sp(10, a - b, 2)); return lijn20(R, s, [a]); } };
  }
  /* aanvullen: spring van het kleine naar het grote getal, via het tiental (en het honderdtal) */
  function mAanvul(R, van, naar){
    var p = van, punten = [van];
    if (p % 10 && tienBoven(p) <= naar){ p = tienBoven(p); punten.push(p); }
    if (naar % 100 === 0 && p % 100 && Math.ceil(p / 100) * 100 <= naar){ p = Math.ceil(p / 100) * 100; punten.push(p); }
    if (p < naar) punten.push(naar);
    var st = [], d = [], gr = naar > 20;
    for (var i = 0; i < punten.length - 1; i++){
      var x = punten[i], y = punten[i + 1], h;
      d.push(y - x);
      if (y % 10 === 0 && x % 10) h = x < 10 ? 'Wat is het vriendje van ' + x + '? Samen zijn ze 10.' : 'Kijk naar de eenheden van ' + x + ': ' + (x % 10) + '. Wat is het vriendje van ' + (x % 10) + '?';
      else if (y % 100 === 0 && y - x < 100) h = 'Van ' + x + ' naar ' + y + ': hoeveel tientallen zijn dat?';
      else if (y % 100 === 0) h = 'Van ' + x + ' naar ' + y + ': hoeveel honderdtallen zijn dat?';
      else h = 'Hoe ver is het van ' + x + ' naar ' + y + '?';
      st.push(S('Spring van ' + x + ' naar ' + y + ': ' + x + ' + … = ' + y, y - x, h));
    }
    var ant = naar - van;
    st.push(S('Tel de sprongen op: ' + d.join(' + ') + ' =', ant, 'Het antwoord is hoe ver je gesprongen hebt, niet waar je uitkomt.',
      F(ant, naar, 'Dat is waar je uitkomt. Het antwoord is hoe ver je gesprongen hebt.', ant + 10, gr ? 'Je telde een tiental te veel. Tel de sprongen nog eens op.' : 'Tel de sprongen nog eens op.', ant + 100, 'Je telde een honderdtal te veel. Tel de sprongen nog eens op.')));
    return { stappen:st, beeld:function(n){
      var s = []; for (var i = 0; i < Math.min(n, punten.length - 1); i++) s.push(sp(punten[i], punten[i + 1], i));
      return naar <= 20 ? lijn20(R, s, [van, naar]) : lijn(R, [van, naar], s, { stip:[van, naar] }); } };
  }

  /* ---- tot 100 en 1000 ---- */
  /* rijgen: het eerste getal heel, het tweede in een rond deel en de rest */
  function mRijgen(R, a, b, erbij){
    var u = b >= 100 ? 100 : 10, g = b - b % u, r = b % u, naam = u === 100 ? 'honderdtallen' : 'tientallen', rest = u === 100 ? 'tientallen' : 'eenheden';
    var m = erbij ? a + g : a - g, eind = erbij ? a + b : a - b, st = [];
    st.push(S('Splits ' + b + ': ' + b + ' = ' + g + ' + …', r, 'Haal de ' + naam + ' eraf: ' + min(b, g) + '.'));
    if (erbij) st.push(S('Spring eerst de ' + naam + ' erbij: ' + plus(a, g) + ' =', m, 'Tel ' + (g / u) + ' ' + (g / u === 1 ? (u === 100 ? 'honderdtal' : 'tiental') : naam) + ' bij ' + a + '. Alleen het cijfer van de ' + naam + ' verandert.',
      F(m, a + g / 10, 'Je deed er ' + (g / 10) + ' bij in plaats van ' + g + '.')));
    else st.push(S('Spring eerst de ' + naam + ' terug: ' + min(a, g) + ' =', m, 'Haal ' + (g / u) + ' ' + (g / u === 1 ? (u === 100 ? 'honderdtal' : 'tiental') : naam) + ' van ' + a + ' af. Alleen het cijfer van de ' + naam + ' verandert.',
      F(m, a + g, 'Je deed het erbij. Bij min spring je terug.', a - g / 10, 'Je haalde er ' + (g / 10) + ' af in plaats van ' + g + '.')));
    var over = erbij ? Math.floor((m + r - 1) / u) !== Math.floor(m / u) && (m + r) % u !== 0 : Math.floor(m / u) !== Math.floor((m - r) / u) && m % u !== 0, h;
    if (erbij){ var T = Math.ceil(m / u) * u; h = over ? 'Je gaat over het ' + (u === 100 ? 'honderdtal' : 'tiental') + ': spring eerst ' + (T - m) + ' naar ' + T + ', en dan nog ' + (r - (T - m)) + '.' : 'Doe de ' + rest + ' erbij: ' + plus(m, r) + '.'; }
    else { var T2 = Math.floor(m / u) * u; h = over ? 'Je gaat over het ' + (u === 100 ? 'honderdtal' : 'tiental') + ': spring eerst ' + (m - T2) + ' terug naar ' + T2 + ', en dan nog ' + (r - (m - T2)) + '.' : 'Haal de ' + rest + ' eraf: ' + min(m, r) + '.'; }
    st.push(S('Spring dan de ' + rest + (erbij ? ' erbij: ' + plus(m, r) : ' terug: ' + min(m, r)) + ' =', eind, h));
    return { stappen:st, beeld:function(n){ var s = []; if (n >= 2) s.push(sp(a, m, 0)); if (n >= 3) s.push(sp(m, eind, 2)); return lijn(R, [a, m, eind], s, { stip:[a] }); } };
  }
  /* splitsen tot 100: tientallen bij tientallen, eenheden bij eenheden */
  function mSplits(R, a, b){
    var ta = a - a % 10, ea = a % 10, tb = b - b % 10, eb = b % 10, T = ta + tb, E = ea + eb;
    return { stappen:[
        S('De tientallen samen: ' + plus(ta, tb) + ' =', T, tal(ta / 10, 'tiental', 'tientallen') + ' en ' + tal(tb / 10, 'tiental', 'tientallen') + '.'),
        S('De eenheden samen: ' + plus(ea, eb) + ' =', E, 'Alleen de laatste cijfers: ' + ea + ' en ' + eb + '.'),
        S('Alles samen: ' + plus(T, E) + ' =', a + b, E < 10 ? 'Zet de tientallen en de eenheden achter elkaar: ' + T + ' en ' + E + '.' : E + ' is 10 + ' + (E - 10) + '. Doe eerst de 10 erbij en dan de ' + (E - 10) + '.',
          F(a + b, T + E - 10, 'Je vergat het tiental dat in ' + E + ' zit.')) ],
      beeld:function(n){ return n < 3 ? R.teken.blokken({ t:T / 10, e:E }) : R.teken.blokken({ t:(T + E - E % 10) / 10, e:E % 10 }); } };
  }
  /* rijgen over het tiental: tientallen, naar het tiental, de rest */
  function mRijgenOver(R, a, b, erbij){
    var tb = b - b % 10, eb = b % 10, c = erbij ? a + tb : a - tb, T = erbij ? tienBoven(c) : c - c % 10, k = Math.abs(T - c), r = eb - k, eind = erbij ? a + b : a - b;
    return { stappen:[
        erbij ? S('Spring de tientallen erbij: ' + plus(a, tb) + ' =', c, 'Tel ' + (tb / 10) + ' keer 10 bij ' + a + '.', F(c, a + tb / 10, 'Je deed er ' + (tb / 10) + ' bij in plaats van ' + tb + '.'))
              : S('Spring de tientallen terug: ' + min(a, tb) + ' =', c, 'Haal ' + (tb / 10) + ' keer 10 van ' + a + ' af.', F(c, a + tb, 'Je deed het erbij. Bij min spring je terug.', a - tb / 10, 'Je haalde er ' + (tb / 10) + ' af in plaats van ' + tb + '.')),
        erbij ? S('Spring naar het volgende tiental: ' + c + ' + … = ' + T, k, 'Hoeveel heeft ' + c + ' nog nodig tot ' + T + '? Denk aan de vriendjes van 10.')
              : S('Spring terug naar het tiental: ' + c + ' ' + MIN + ' … = ' + T, k, 'Hoeveel is ' + c + ' meer dan ' + T + '? Kijk naar de eenheden.'),
        S('Splits ' + eb + ': ' + eb + ' = ' + k + ' + …', r, 'Je hebt al ' + k + ' gesprongen. Wat blijft er over van ' + eb + '?'),
        erbij ? S(plus(T, r) + ' =', eind, 'Vanaf ' + T + ' nog ' + r + ' verder.')
              : S(min(T, r) + ' =', eind, 'Vanaf ' + T + ' nog ' + r + ' terug.', F(eind, T + r, 'Bij min spring je terug, niet verder.')) ],
      beeld:function(n){ var s = []; if (n >= 1) s.push(sp(a, c, 0)); if (n >= 2) s.push(sp(c, T, 2)); if (n >= 4) s.push(sp(T, eind, 3)); return lijn(R, [a, eind], s, { stip:[a] }); } };
  }
  /* verwisselen: het kleine getal staat voorop, begin bij het grote */
  function mWissel(R, a, b){
    var T = tienBoven(b), k = T - b, som = a + b, st = [
      K(R, 'Met welk getal begin je?', [a, b], b, 'Begin bij het grote getal, ' + b + '. Dan spring je er maar ' + a + ' bij.', { vast:true, waarom:'Bij plus mag je de getallen omdraaien: ' + plus(a, b) + ' = ' + plus(b, a) + '.' }) ];
    var over = a > k;
    if (over){
      st.push(S('Spring naar het tiental: ' + b + ' + … = ' + T, k, 'Hoeveel heeft ' + b + ' nog nodig tot ' + T + '?'));
      st.push(S('Splits ' + a + ': ' + a + ' = ' + k + ' + …', a - k, 'Je hebt al ' + k + ' gesprongen. Wat blijft er over van ' + a + '?'));
      st.push(S(plus(T, a - k) + ' =', som, 'Vanaf ' + T + ' nog ' + (a - k) + ' verder.'));
    } else st.push(S(plus(b, a) + ' =', som, a === k ? b + ' heeft nog ' + k + ' nodig tot het volgende tiental.' : 'Alleen de eenheden veranderen: ' + plus(b % 10, a) + '.'));
    return { stappen:st, beeld:function(n){ var s = []; if (over){ if (n >= 2) s.push(sp(b, T, 0)); if (n >= 4) s.push(sp(T, som, 2)); } else if (n >= 2) s.push(sp(b, som, 0));
      return lijn(R, [b, som], s, { stip:n >= 1 ? [b] : [] }); } };
  }
  /* dubbelen tot 100: a + a, of a + (a + 1) */
  function mDubbel100(R, a, d){
    var ta = a - a % 10, ea = a % 10, st = [
      S((d ? 'Het kleinste getal is ' + a + '. Neem het dubbel. ' : 'Neem ' + a + ' dubbel. ') + 'Eerst de tientallen: ' + plus(ta, ta) + ' =', 2 * ta, 'Twee keer ' + tal(ta / 10, 'tiental', 'tientallen') + '.'),
      S('Dan de eenheden: ' + plus(ea, ea) + ' =', 2 * ea, 'Twee keer ' + ea + '.'),
      S('Samen: ' + plus(2 * ta, 2 * ea) + ' =', 2 * a, 2 * ea >= 10 ? (2 * ea) + ' is 10 + ' + (2 * ea - 10) + '. Doe eerst de 10 erbij.' : 'Tientallen en eenheden achter elkaar.') ];
    if (d) st.push(S('Het andere getal is 1 meer. Doe er 1 bij: ' + plus(2 * a, 1) + ' =', 2 * a + 1, 'Er komt alleen 1 bij.', F(2 * a + 1, 2 * a + 2, 'Je deed er 2 bij. De getallen schelen maar 1.')));
    return { stappen:st, beeld:function(n){
      if (n < 3) return R.teken.blokken({ t:2 * ta / 10, e:2 * ea });
      var s = [sp(0, a, 0), sp(a, 2 * a, 0)]; if (n >= 4) s.push(sp(2 * a, 2 * a + 1, 2));
      return R.teken.lijn({ van:0, tot:Math.ceil((2 * a + d) / 10) * 10, labels:[0], sprongen:s, nieuw:true }); } };
  }
  /* compenseren: eerst het ronde getal, dan het teveel terug */
  function mComp(R, a, b, erbij){
    var rond = tienBoven(b), k = rond - b, m = erbij ? a + rond : a - rond, eind = erbij ? a + b : a - b, groot = rond >= 100;
    var hm = groot ? (erbij ? 'Tel er ' + (rond / 100) + ' honderdtal' + (rond > 100 ? 'len' : '') + ' bij. Alleen het cijfer van de honderdtallen verandert.' : 'Haal er ' + (rond / 100) + ' honderdtal' + (rond > 100 ? 'len' : '') + ' af. Alleen het cijfer van de honderdtallen verandert.')
                   : (erbij ? 'Spring ' + (rond / 10) + ' tientallen verder vanaf ' + a + '.' : 'Spring ' + (rond / 10) + ' tientallen terug vanaf ' + a + '.');
    return { stappen:[
        S(b + ' is bijna een rond getal. Welk rond getal?', rond, plus(b, k) + ' is een rond getal.'),
        erbij ? S(plus(a, rond) + ' =', m, hm) : S(min(a, rond) + ' =', m, hm, F(m, a + rond, 'Je deed het erbij. Bij min spring je terug.')),
        erbij ? S('Je deed er ' + k + ' te veel bij. Haal ' + (k === 1 ? 'die' : 'ze') + ' er weer af: ' + min(m, k) + ' =', eind, 'Je sprong ' + rond + ' en niet ' + b + '. Dat is ' + k + ' te ver, dus spring je ' + k + ' terug.',
                F(eind, m + k, 'Je deed er nog ' + k + ' bij. Je had juist te veel erbij gedaan, dus haal je ' + k + ' eraf.'))
              : S('Je haalde er ' + k + ' te veel af. Doe ' + (k === 1 ? 'die' : 'ze') + ' er weer bij: ' + plus(m, k) + ' =', eind, 'Je haalde ' + rond + ' weg en niet ' + b + '. Dat is ' + k + ' te veel, dus doe je er ' + k + ' bij.',
                F(eind, m - k, 'Je haalde er nog ' + k + ' af. Je had juist te veel weggehaald, dus doe je er ' + k + ' bij.')) ],
      beeld:function(n){ var s = []; if (n >= 2) s.push(sp(a, m, 0)); if (n >= 3) s.push(sp(m, eind, 1)); return lijn(R, [a, m], s, { stip:[a] }); } };
  }
  /* transformeren bij plus: wat er bij het ene getal bij komt, gaat er bij het andere af */
  function mTrans(R, a, b){
    var A = tienBoven(a), k = A - a;
    return { stappen:[
        S('Maak ' + a + ' rond: ' + a + ' + … = ' + A, k, 'Hoeveel heeft ' + a + ' nog nodig tot ' + A + '?'),
        S('Haal dat bij het andere getal af: ' + min(b, k) + ' =', b - k, 'Wat je bij ' + a + ' erbij doet, haal je bij ' + b + ' eraf. Dan blijft de som even groot.',
          F(b - k, b + k, 'Je deed het erbij. Bij het andere getal haal je het eraf, anders wordt de som groter.')),
        S('De nieuwe som: ' + plus(A, b - k) + ' =', a + b, A + ' is rond. Tel de tientallen op en zet de eenheden erachter.') ],
      beeld:function(n){ return staaf(n >= 2 ? [[a, b], [A, b - k]] : [[a, b]]); } };
  }
  /* transformeren bij min: beide getallen evenveel erbij, het verschil blijft gelijk */
  function mTransMin(R, a, b){
    var B = tienBoven(b), k = B - b;
    return { stappen:[
        S('Maak ' + b + ' rond: ' + b + ' + … = ' + B, k, 'Hoeveel heeft ' + b + ' nog nodig tot ' + B + '?'),
        S('Doe dat ook bij ' + a + ': ' + plus(a, k) + ' =', a + k, 'Bij min schuif je allebei dezelfde kant op. Dan blijft het verschil even groot.',
          F(a + k, a - k, 'Bij min doe je bij allebei hetzelfde: allebei ' + k + ' erbij.')),
        S('De nieuwe som: ' + min(a + k, B) + ' =', a - b, 'Haal ' + (B / 10) + ' tientallen van ' + (a + k) + ' af.') ],
      beeld:function(n){ return verschuif(n >= 2 ? [[b, a], [B, a + k]] : [[b, a]]); } };
  }
  /* splitsen bij min, zonder lenen */
  function mSplitsMin(R, a, b){
    var ta = a - a % 10, ea = a % 10, tb = b - b % 10, eb = b % 10, T = ta - tb, E = ea - eb;
    return { stappen:[
        S('De tientallen: ' + min(ta, tb) + ' =', T, tal(ta / 10, 'tiental', 'tientallen') + ' min ' + tal(tb / 10, 'tiental', 'tientallen') + '.'),
        S('De eenheden: ' + min(ea, eb) + ' =', E, 'Alleen de laatste cijfers: ' + ea + ' en ' + eb + '.'),
        S('Wat over is samen: ' + plus(T, E) + ' =', a - b, 'De tientallen die over zijn en de eenheden die over zijn: ' + T + ' en ' + E + '.', E ? F(a - b, T - E, 'Hier tel je op: wat over is van de tientallen plus wat over is van de eenheden.') : null) ],
      beeld:function(n){ return n < 3 ? R.teken.blokken({ t:ta / 10, e:ea }) : R.teken.blokken({ t:T / 10, e:E }); } };
  }
  /* splitsen tot 1000, zonder over te gaan */
  function mSplits1000(R, a, b){
    var ha = a - a % 100, hb = b - b % 100, ta = a % 100 - a % 10, tb = b % 100 - b % 10, ea = a % 10, eb = b % 10, H = ha + hb, T = ta + tb, E = ea + eb;
    return { stappen:[
        S('De honderdtallen samen: ' + plus(ha, hb) + ' =', H, tal(ha / 100, 'honderdtal', 'honderdtallen') + ' en ' + tal(hb / 100, 'honderdtal', 'honderdtallen') + '.'),
        S('De tientallen samen: ' + plus(ta, tb) + ' =', T, tal(ta / 10, 'tiental', 'tientallen') + ' en ' + tal(tb / 10, 'tiental', 'tientallen') + '.'),
        S('De eenheden samen: ' + plus(ea, eb) + ' =', E, 'Alleen de laatste cijfers: ' + ea + ' en ' + eb + '.'),
        S('Alles samen: ' + H + ' + ' + T + ' + ' + E + ' =', a + b, 'Zet de honderdtallen, tientallen en eenheden achter elkaar.') ],
      beeld:function(){ return R.teken.blokken({ h:H / 100, t:T / 10, e:E }); } };
  }

  /* kies de handigste manier: eerst de keuze, dan de manier */
  function kiesOp(R, vraag, lijst, juist, uitleg, m, context){
    return { vraag:vraag, context:context || 'Kies eerst de handigste manier. Reken het dan uit.',
      beeld:function(n){ return n < 1 ? '' : m.beeld(n - 1); },
      stappen:[K(R, 'Welke manier is hier het handigst?', lijst, juist, uitleg, { waarom:uitleg })].concat(m.stappen) };
  }
  function nietRond(x){ return x % 10 !== 0; }
  function bijnaRond(x){ return x % 10 >= 8; }

  LEERROUTE.voeg('rekenen', [
    /* ================= 1 getalbegrip ================= */
    { groep:{ id:'getal-begrip', niveau:'basis', domein:'getallen', naam:'Getallen tot 100 en 1000', uit:'Wie getallen goed kent, rekent makkelijker. Tellen met sprongen, getallen uit elkaar halen, vergelijken, op de getallenlijn zetten en afronden.' },
      doelen:[
        { id:'getal-tellen', naam:'Tellen met sprongen', kort:'Tel verder met sprongen van 2, 5, 10, 25 of 100',
          uit:'<p>Bij <b>tellen met sprongen</b> tel je steeds hetzelfde getal erbij. Zoek eerst hoe groot de sprong is: kijk naar twee getallen naast elkaar.</p><p>Bijvoorbeeld 25, 50, 75, … De sprong is 25. Het volgende getal is 75 + 25 = 100.</p>',
          wanneer:'je snel wilt tellen, bijvoorbeeld geld of dingen in groepjes.',
          maak:function(R){
            var s = R.kies([2, 5, 10, 25, 100]), b;
            if (s === 2) b = R.heel(1, 80);
            else if (s === 5) b = R.kies([R.heel(1, 15) * 5, R.heel(0, 14) * 5 + R.heel(1, 4)]);
            else if (s === 10) b = R.heel(1, 60);
            else if (s === 25) b = R.heel(0, 32) * 25;
            else b = R.heel(1, 6) * 100 + R.kies([0, R.heel(1, 99)]);
            var r = [b, b + s, b + 2 * s], v = b + 3 * s;
            return { context:'Tel verder. Welk getal komt hierna?', vraag:r.join(', ') + ', …',
              beeld:function(n){ var j = [sp(r[0], r[1], 0), sp(r[1], r[2], 0)]; if (n >= 2) j.push(sp(r[2], v, 1)); return lijn(R, [r[0], v], j, { labels:[] }); },
              stappen:[
                S('Hoe groot is elke sprong? ' + min(r[1], r[0]) + ' =', s, 'Hoeveel moet je van ' + r[0] + ' naar ' + r[1] + ' springen?'),
                S('Spring nog een keer ' + s + ' verder: ' + plus(r[2], s) + ' =', v, s === 25 ? 'Denk aan munten van 25 cent: vier keer 25 is 100.' : 'Tel ' + s + ' bij ' + r[2] + '. Ga je over een tiental of honderdtal? Let daar goed op.',
                  F(v, r[2] + 1, 'Je sprong 1 verder. De sprong is ' + s + '.', r[2], 'Dat getal staat er al. Je moet nog een sprong verder.')) ] };
          } },
        { id:'getal-terugtellen', naam:'Terugtellen met sprongen', kort:'Tel terug met sprongen van 2, 5, 10, 25 of 100',
          uit:'<p>Bij <b>terugtellen</b> haal je er steeds hetzelfde getal af. De getallen worden kleiner.</p><p>Bijvoorbeeld 300, 275, 250, … De sprong is 25 terug. Het volgende getal is 250 ' + MIN + ' 25 = 225.</p>',
          wanneer:'je aftelt, of wilt weten wat er overblijft als er steeds evenveel af gaat.',
          maak:function(R){
            var s = R.kies([2, 5, 10, 25, 100]), b;
            if (s === 2) b = R.heel(0, 80);
            else if (s === 5) b = R.kies([R.heel(0, 15) * 5, R.heel(0, 14) * 5 + R.heel(1, 4)]);
            else if (s === 10) b = R.heel(1, 60);
            else if (s === 25) b = R.heel(0, 32) * 25;
            else b = R.heel(0, 6) * 100 + R.kies([0, R.heel(1, 99)]);
            var r = [b + 3 * s, b + 2 * s, b + s], v = b;
            return { context:'Tel terug. Welk getal komt hierna?', vraag:r.join(', ') + ', …',
              beeld:function(n){ var j = [sp(r[0], r[1], 0), sp(r[1], r[2], 0)]; if (n >= 2) j.push(sp(r[2], v, 1)); return lijn(R, [v, r[0]], j, { labels:[] }); },
              stappen:[
                S('Hoe groot is elke sprong terug? ' + min(r[0], r[1]) + ' =', s, 'Hoeveel ligt ' + r[1] + ' lager dan ' + r[0] + '?'),
                S('Spring nog een keer ' + s + ' terug: ' + min(r[2], s) + ' =', v, s === 25 ? 'Denk aan munten van 25 cent: vier keer 25 is 100.' : 'Haal ' + s + ' van ' + r[2] + ' af. Ga je terug over een tiental of honderdtal? Let daar goed op.',
                  F(v, r[2] + s, 'Je ging omhoog. Bij terugtellen worden de getallen kleiner.', r[2] - 1, 'Je sprong 1 terug. De sprong is ' + s + '.')) ] };
          } },
        { id:'getal-hte', naam:'Honderdtallen, tientallen en eenheden', kort:'Haal een getal uit elkaar: 347 = 300 + 40 + 7',
          uit:'<p>Elk cijfer in een getal heeft een eigen <b>plaats</b>. In 347 staat de 3 voor 3 honderdtallen, de 4 voor 4 tientallen en de 7 voor 7 eenheden.</p><p>Dus 347 = 300 + 40 + 7. Met blokken zie je het: platen van 100, staven van 10 en losse blokjes.</p><p>Staat er een 0, zoals in 305? Dan zijn er geen tientallen: 305 = 300 + 5.</p>',
          wanneer:'je getallen wilt splitsen om mee te rekenen.',
          maak:function(R){
            var x; do { x = R.heel(0, 4) ? R.heel(101, 999) : R.heel(11, 99); } while ((x < 100 && x % 10 === 0) || x % 100 === 0 || x === 526);
            var h = Math.floor(x / 100), t = Math.floor(x / 10) % 10, e = x % 10, delen = [];
            if (h) delen.push(h * 100); if (t) delen.push(t * 10); if (e) delen.push(e);
            var ant = [delen.join(' + ')], vol = (h ? [h * 100] : []).concat([t * 10, e]).join(' + ');
            if (ant.indexOf(vol) < 0) ant.push(vol);
            var st = [];
            if (h) st.push(S('Hoeveel honderdtallen zitten er in ' + x + '?', h, 'Het eerste cijfer van ' + x + ' telt de honderdtallen. Of tel de grote platen.'));
            st.push(S('Hoeveel tientallen?', t, 'Het cijfer ' + (h ? 'in het midden' : 'vooraan') + ' telt de tientallen. Of tel de staven.', t === 0 ? F(0, h * 10, 'Er zijn geen staven. Daarom staat er een 0.') : null));
            st.push(S('Hoeveel eenheden?', e, 'Het laatste cijfer telt de eenheden. Of tel de losse blokjes.'));
            st.push(S('Schrijf het als som: ' + x + ' =', ant, 'Een honderdtal is 100, een tiental is 10. Dus ' + (h ? tal(h, 'honderdtal', 'honderdtallen') + ' is ' + (h * 100) + ' en ' : '') + tal(t, 'tiental', 'tientallen') + ' is ' + (t * 10) + '.',
              h ? F(ant[0], h + ' + ' + t + ' + ' + e, 'Schrijf wat elk cijfer waard is, dus ' + (h * 100) + ' en niet ' + h + '.') : F(ant[0], t + ' + ' + e, 'Schrijf wat elk cijfer waard is, dus ' + (t * 10) + ' en niet ' + t + '.')));
            return { context:'Haal het getal uit elkaar, zoals 526 = 500 + 20 + 6.', vraag:String(x), antwoord:ant,
              beeld:R.teken.blokken({ h:h, t:t, e:e }), stappen:st };
          } },
        { id:'getal-even', naam:'Even en oneven', kort:'Kijk naar het laatste cijfer: 0, 2, 4, 6, 8 is even',
          uit:'<p>Een getal is <b>even</b> als je het precies in tweetallen kunt verdelen. Blijft er een over, dan is het <b>oneven</b>.</p><p>Je hoeft alleen naar het laatste cijfer te kijken. Eindigt het op 0, 2, 4, 6 of 8? Dan is het even. Op 1, 3, 5, 7 of 9? Dan is het oneven.</p>',
          wanneer:'je iets eerlijk door twee wilt delen, of wilt weten of iets in paren past.',
          maak:function(R){
            var x = R.heel(0, 2) ? R.heel(100, 999) : R.heel(10, 99), e = x % 10, ant = e % 2 ? 'oneven' : 'even';
            return { context:'Is dit getal even of oneven?', vraag:String(x), antwoord:ant,
              beeld:function(n){ return n >= 1 ? paren(e) : ''; },
              stappen:[
                S('Kijk alleen naar het laatste cijfer van ' + x + '. Welk cijfer is dat?', e, 'Het cijfer helemaal rechts.'),
                K(R, 'Kun je ' + e + ' blokjes in tweetallen verdelen zonder dat er een overblijft? Dan is het even. Is ' + x + ' even of oneven?', ['even', 'oneven'], ant,
                  'Kijk naar de blokjes: blijft er een oranje over? ' + e + (e % 2 ? ' is oneven.' : ' is even.'), { vast:true }) ] };
          } },
        { id:'getal-vergelijken', naam:'Getallen vergelijken', kort:'Vergelijk van links naar rechts: eerst de honderdtallen, dan de tientallen',
          uit:'<p>Welk getal is groter? Je <b>vergelijkt</b> van links naar rechts. Eerst de honderdtallen. Zijn die gelijk? Dan de tientallen. Zijn die ook gelijk? Dan de eenheden.</p><p>Het teken &gt; betekent groter dan, &lt; betekent kleiner dan. De open kant wijst altijd naar het grootste getal: 374 &gt; 347.</p>',
          wanneer:'je prijzen, afstanden of scores wilt vergelijken.',
          maak:function(R){
            var t = R.heel(0, 4), a, b, w;
            if (t === 0){ do { a = R.heel(100, 999); b = R.heel(100, 999); } while (Math.floor(a / 100) === Math.floor(b / 100)); }
            else if (t === 1){ var h = R.heel(1, 9) * 100; do { a = h + R.heel(0, 99); b = h + R.heel(0, 99); } while (Math.floor(a / 10) === Math.floor(b / 10)); }
            else if (t === 2){ var ht = R.heel(10, 99) * 10; do { a = ht + R.heel(0, 9); b = ht + R.heel(0, 9); } while (a === b); }
            else if (t === 3){ a = R.heel(85, 99); b = R.heel(100, 130); if (R.heel(0, 1)){ w = a; a = b; b = w; } }
            else { do { a = R.heel(10, 99); b = R.heel(10, 99); } while (a === b); }
            var plekken = Math.max(a, b) >= 100 ? [100, 10, 1] : [10, 1], NAAM = { 100:'honderdtallen', 10:'tientallen', 1:'eenheden' }, st = [], groot = Math.max(a, b);
            for (var i = 0; i < plekken.length; i++){
              var p = plekken[i], da = Math.floor(a / p) % 10, db = Math.floor(b / p) % 10, goed = da > db ? a : da < db ? b : 'nog gelijk';
              var EEN = { 100:'honderdtal', 10:'tiental', 1:'eenheid' }, hint = da === db ? 'Allebei ' + tal(da, EEN[p], NAAM[p]) + '. Dan kijk je naar de volgende plaats.' : tal(Math.max(da, db), EEN[p], NAAM[p]) + ' is meer dan ' + tal(Math.min(da, db), EEN[p], NAAM[p]) + '.';
              if (p === 100 && (a < 100 || b < 100)) hint += ' Een getal van twee cijfers heeft 0 honderdtallen.';
              st.push(K(R, 'Vergelijk de ' + NAAM[p] + ': ' + da + ' en ' + db + '. Welk getal is groter?', [a, b, 'nog gelijk'], goed, hint, { vast:true }));
              if (da !== db) break;
            }
            var teken = a > b ? '>' : '<';
            st.push(K(R, 'Welk teken hoort ertussen? ' + a + ' … ' + b, ['<', '>'], teken, 'De open kant van het teken wijst naar het grootste getal: ' + groot + '.', { vast:true }));
            return { vraag:a + ' … ' + b, context:'Welk getal is groter? Kies het goede teken.', opties:['<', '>'], goed:teken === '<' ? 0 : 1,
              beeld:function(n){ return n >= st.length ? lijn(R, [a, b], [], { stip:[a, b] }) : ''; }, stappen:st };
          } },
        { id:'getal-lijn', naam:'Getallen op de getallenlijn', kort:'Zoek eerst het midden, en schat dan waar het getal ligt',
          uit:'<p>Op een <b>getallenlijn</b> staan de getallen op volgorde: klein links, groot rechts. Vaak staan alleen het begin en het eind erbij.</p><p>Zoek dan eerst het <b>midden</b>: tussen 0 en 100 is dat 50. Ligt je getal links of rechts van het midden? Gebruik daarna de streepjes: tussen 0 en 100 is elk streepje 10.</p>',
          wanneer:'je moet schatten hoe groot iets is, of waar een getal ligt.',
          maak:function(R){
            var B = R.kies([[100, 5], [1000, 50], [200, 10]]), tot = B[0], st = B[1], mid = tot / 2, w;
            do { w = R.heel(1, 19) * st; } while (w === mid);
            var kant = w < mid ? 'links van ' + mid : 'rechts van ' + mid, streep = tot / 10, lo = Math.floor(w / streep) * streep;
            var waar = w % streep ? 'tussen ' + lo + ' en ' + (lo + streep) : 'precies op het streepje van ' + w;
            var stap1 = S('Welk getal ligt precies in het midden van 0 en ' + tot + '?', mid, 'De helft van ' + tot + '.');
            if (R.heel(0, 1)){
              var pos = [w], keer = 0;
              while (pos.length < 4 && keer++ < 800){ var p = R.heel(1, 19) * st; if (pos.every(function(q){ return Math.abs(q - p) >= 3 * st; })) pos.push(p); }
              pos.sort(function(x, y){ return x - y; });
              var letters = 'ABCD'.slice(0, pos.length).split(''), goed = pos.indexOf(w);
              return { vraag:'Waar ligt ' + w + '?', context:'Een getallenlijn van 0 tot ' + tot + '. Bij welke letter ligt het getal?', opties:letters, goed:goed,
                beeld:function(n){ return schat(R, { tot:tot, w:w, letters:pos, midden:n >= 1, ant:n >= 3 }); },
                stappen:[stap1,
                  K(R, 'Ligt ' + w + ' links of rechts van ' + mid + '?', ['links van ' + mid, 'rechts van ' + mid], kant, 'Kleinere getallen liggen links. Is ' + w + ' kleiner of groter dan ' + mid + '?', { vast:true }),
                  K(R, 'Bij welke letter ligt ' + w + '?', letters, letters[goed], 'Elk streepje is ' + streep + '. ' + w + ' ligt ' + waar + '.', { vast:true }) ] };
            }
            var ok = function(v){ var x = parseFloat(String(v).replace(/[\s.]/g, '').replace(',', '.')); return !isNaN(x) && Math.abs(x - w) <= st; };
            return { vraag:'Welk getal hoort bij de stip?', context:'Een getallenlijn van 0 tot ' + tot + '. Schat het getal bij de stip.', antwoord:String(w), controle:ok,
              beeld:function(n){ return schat(R, { tot:tot, w:w, midden:n >= 1, ant:n >= 3 }); },
              stappen:[stap1,
                K(R, 'Ligt de stip links of rechts van ' + mid + '?', ['links van ' + mid, 'rechts van ' + mid], kant, 'Kijk waar het lange streepje in het midden staat.', { vast:true }),
                { tekst:'Tel de streepjes. Welk getal is het ongeveer?', antwoord:String(w), controle:ok, hint:'Elk streepje is ' + streep + '. De stip ligt ' + waar + '.' } ] };
          } },
        { id:'getal-buren', naam:'Buurtientallen en buurhonderdtallen', kort:'Zoek het ronde getal eronder en het ronde getal erboven',
          uit:'<p>Elk getal ligt tussen twee ronde getallen. Dat zijn de <b>buren</b>. 47 ligt tussen 40 en 50: dat zijn de buurtientallen.</p><p>347 ligt tussen 300 en 400: dat zijn de buurhonderdtallen. Het buurgetal eronder vind je door de laatste cijfers 0 te maken.</p>',
          wanneer:'je wilt afronden of schatten.',
          maak:function(R){
            var hon = R.heel(0, 1), x, u;
            if (hon){ u = 100; do { x = R.heel(101, 899); } while (x % 100 === 0); }
            else { u = 10; do { x = R.kies([R.heel(11, 99), R.heel(101, 989)]); } while (x % 10 === 0); }
            var lo = Math.floor(x / u) * u, hi = lo + u, naam = hon ? 'honderdtal' : 'tiental', ant = lo + ' en ' + hi;
            var ok = function(v){ var g = String(v).replace(/(\d)\.(\d{3})/g, '$1$2').match(/\d+/g) || []; return g.length === 2 && Math.min(+g[0], +g[1]) === lo && Math.max(+g[0], +g[1]) === hi; };
            return { vraag:String(x), context:'Wat zijn de buur' + naam + 'len van dit getal?', antwoord:ant, controle:ok,
              beeld:function(n){ var lab = []; if (n >= 1) lab.push(lo); if (n >= 2) lab.push(hi); return R.teken.lijn({ van:lo, tot:hi, streep:u / 10, labels:lab, stip:[x] }); },
              stappen:[
                S('Het ' + naam + ' onder ' + x + ':', lo, 'Maak ' + (hon ? 'de tientallen en de eenheden' : 'de eenheden') + ' 0.', F(lo, x - u, 'Dat is ' + u + ' lager, maar geen rond ' + naam + '. Maak de laatste cijfers 0.')),
                S('Het ' + naam + ' boven ' + x + ':', hi, plus(lo, u) + '.', F(hi, x + u, 'Dat is ' + u + ' hoger, maar geen rond ' + naam + '. Een rond ' + naam + ' eindigt op ' + (hon ? '00' : '0') + '.')),
                { tekst:'De buur' + naam + 'len van ' + x + ' zijn:', antwoord:ant, controle:ok, hint:'Schrijf de twee getallen van hierboven op, met en ertussen. Het kleinste eerst.' } ] };
          } },
        { id:'getal-afronden', naam:'Afronden', kort:'Kies het buurgetal dat het dichtst bij ligt; bij een 5 rond je naar boven af',
          uit:'<p>Bij <b>afronden</b> kies je het ronde getal dat het dichtst bij ligt. 47 ligt dichter bij 50 dan bij 40. Afgerond op tientallen is 47 dus 50.</p><p>Op tientallen kijk je naar de eenheden, op honderdtallen naar de tientallen. Is dat cijfer 0 tot en met 4? Dan rond je naar beneden af. Is het 5 tot en met 9? Dan naar boven.</p><p>Zo is 349 afgerond op honderdtallen 300: je kijkt naar de 4.</p>',
          wanneer:'je ongeveer wilt weten hoeveel het is, of een som wilt schatten.',
          maak:function(R){
            var hon = R.heel(0, 1), x, u;
            if (hon){ u = 100; do { x = R.heel(101, 899); } while (x % 100 === 0); }
            else { u = 10; do { x = R.kies([R.heel(11, 99), R.heel(101, 989)]); } while (x % 10 === 0); }
            var lo = Math.floor(x / u) * u, hi = lo + u, c = Math.floor(x / (u / 10)) % 10, ant = c >= 5 ? hi : lo, ander = c >= 5 ? lo : hi;
            var naam = hon ? 'honderdtal' : 'tiental', kijk = hon ? 'de tientallen' : 'de eenheden';
            return { vraag:String(x), context:'Rond af op ' + naam + 'len.',
              beeld:function(n){ var lab = []; if (n >= 1) lab.push(lo); if (n >= 2) lab.push(hi, lo + u / 2); return R.teken.lijn({ van:lo, tot:hi, streep:u / 10, labels:lab, stip:[x] }); },
              stappen:[
                S('Het ' + naam + ' onder ' + x + ':', lo, 'Maak ' + (hon ? 'de tientallen en de eenheden' : 'de eenheden') + ' 0.'),
                S('Het ' + naam + ' boven ' + x + ':', hi, plus(lo, u) + '.'),
                S('Kijk naar ' + kijk + ': ' + c + '. ' + x + ' afgerond op ' + naam + 'len is', ant,
                  'Bij 0 tot en met 4 rond je naar beneden af, bij 5 tot en met 9 naar boven. Het cijfer is ' + c + '.',
                  F(ant, ander, c >= 5 ? 'Bij een ' + c + ' rond je naar boven af.' : 'Bij een ' + c + ' rond je naar beneden af.', x, 'Je moet een rond getal kiezen.'),
                  c === 5 ? 'Bij een 5 rond je altijd naar boven af.' : null) ] };
          } }
      ] },

    /* ================= 2 splitsen ================= */
    { groep:{ id:'splits-tien', niveau:'basis', domein:'getallen', naam:'Splitsen en aanvullen', uit:'Getallen splitsen en aanvullen tot een rond getal: de basis voor bijna alle andere manieren van rekenen.' },
      doelen:[
        { id:'splits-vriendjes', naam:'De vriendjes van 10', kort:'Twee getallen die samen 10 zijn: 7 en 3, 6 en 4',
          uit:'<p>De <b>vriendjes van 10</b> zijn twee getallen die samen precies 10 zijn: 1 en 9, 2 en 8, 3 en 7, 4 en 6, 5 en 5.</p><p>Op een rekje met 10 kralen zie je het: de gekleurde kralen en de witte kralen zijn samen 10. Ken je ze uit je hoofd, dan reken je veel sneller.</p>',
          wanneer:'je een getal wilt aanvullen tot 10, of over het tiental heen rekent.',
          maak:function(R){
            var a = R.heel(1, 9), b = 10 - a, voor = R.heel(0, 1);
            return { vraag:voor ? a + ' + … = 10' : '… + ' + a + ' = 10', antwoord:String(b),
              beeld:function(n){ return kralen([[{ n:a, k:1 }, { n:b, k:n >= 1 ? 2 : 0 }]], a + ' en ' + b + ' is 10'); },
              stappen:[
                S('Op het rekje zijn ' + a + ' kralen blauw. Hoeveel kralen zijn wit?', b, 'Tel de witte kralen. Of tel door van ' + a + ' tot 10.', F(b, a, 'Dat zijn de blauwe kralen. Tel de witte.')),
                S('Controleer: ' + plus(a, b) + ' =', 10, 'Samen moeten ze 10 zijn.') ] };
          } },
        { id:'splits-tot10', naam:'Splitsen tot 10', kort:'Een getal in twee stukken: 8 = 5 + 3',
          uit:'<p>Bij <b>splitsen</b> haal je een getal in twee stukken. 8 kun je splitsen in 5 en 3, of in 6 en 2.</p><p>In het splitsbeen staat het hele getal bovenaan en de twee stukken onderaan. Weet je een stuk? Tel dan door tot het hele getal.</p>',
          wanneer:'je een getal in stukken wilt springen, zoals bij rekenen via de 10.',
          maak:function(R){
            var t = R.heel(4, 10), l = R.heel(1, t - 1), r = t - l, links = R.heel(0, 1);
            var weet = links ? r : l, zoek = links ? l : r;
            return { vraag:links ? t + ' = … + ' + r : t + ' = ' + l + ' + …', antwoord:String(zoek),
              beeld:function(n){ return R.teken.splits(t, l, r, { vraag:n >= 1 ? null : (links ? 'l' : 'r') }); },
              stappen:[
                S('Je hebt al ' + weet + '. Tel door van ' + weet + ' tot ' + t + '. Hoeveel tellen is dat?', zoek, 'Steek ' + tal(weet, 'vinger', 'vingers') + ' op en tel door tot ' + t + '. Hoeveel vingers kwamen erbij?', F(zoek, t, 'Dat is het hele getal. Welk stuk ontbreekt?')),
                S('Controleer: ' + plus(l, r) + ' =', t, 'De twee stukken samen zijn het hele getal.') ] };
          } },
        { id:'splits-tiental', naam:'Aanvullen tot het tiental', kort:'Hoeveel erbij tot het volgende tiental? Kijk naar de eenheden',
          uit:'<p>Bij <b>aanvullen</b> zoek je hoeveel er nog bij moet tot een rond getal. 37 + … = 40.</p><p>Kijk alleen naar de eenheden: 7. Het vriendje van 7 is 3. Dus 37 + 3 = 40. Zo werkt het bij elk getal: 7 + 3 = 10, 17 + 3 = 20, 87 + 3 = 90.</p>',
          wanneer:'je over een tiental heen moet rekenen.',
          maak:function(R){
            var x; do { x = R.kies([R.heel(1, 9), R.heel(11, 19), R.heel(21, 99)]); } while (x % 10 === 0);
            var T = tienBoven(x), e = x % 10, k = T - x;
            return { vraag:x + ' + … = ' + T, antwoord:String(k),
              beeld:function(n){ return lijn(R, [x, T], n >= 2 ? [sp(x, T, 0)] : [], { stip:[x], labels:n >= 1 ? [T] : [] }); },
              stappen:[
                S('Wat is het volgende tiental na ' + x + '?', T, 'Het eerste ronde getal na ' + x + ', dat eindigt op 0.'),
                S('Kijk naar de eenheden: ' + e + '. Het vriendje van ' + e + ' is', k, plus(e, '…') + ' = 10.', F(k, e, 'Dat zijn de eenheden zelf. Wat moet erbij tot 10?')),
                S('Controleer: ' + plus(x, k) + ' =', T, 'Kom je precies op ' + T + '?') ] };
          } },
        { id:'splits-honderd', naam:'Aanvullen tot 100', kort:'Spring eerst naar het tiental, dan naar 100, en tel de sprongen op',
          uit:'<p>Bij <b>aanvullen tot 100</b> zoek je hoeveel er nog bij moet. 64 + … = 100.</p><p>Spring eerst naar het volgende tiental: 64 + 6 = 70. Spring dan naar 100: 70 + 30 = 100. Tel de sprongen op: 6 + 30 = 36.</p><p>Pas op: veel mensen zeggen 46. Tel de tientallen goed: van 70 naar 100 is maar 30.</p>',
          wanneer:'je wilt weten hoeveel er over is van 100, of wisselgeld van een euro.',
          maak:function(R){
            var x; do { x = R.heel(11, 89); } while (x % 10 === 0);
            var m = mAanvul(R, x, 100);
            return { vraag:x + ' + … = 100', beeld:m.beeld, stappen:m.stappen };
          } }
      ] },

    /* ================= 3 optellen tot 20 ================= */
    { groep:{ id:'plus20', niveau:'basis', domein:'getallen', naam:'Optellen tot 20', uit:'Sommen als 8 + 5 moet je snel kunnen. Er zijn handige trucjes: erbij tellen, omdraaien, dubbelen en via de 10.' },
      doelen:[
        { id:'plus20-erbij', naam:'Erbij tellen in sprongetjes', kort:'Begin bij het grote getal en tel er het kleine getal bij, 1 voor 1',
          uit:'<p>Komt er maar een klein beetje bij? Dan kun je <b>erbij tellen</b>. Begin bij het grote getal en spring 1 voor 1 verder.</p><p>9 + 3: begin bij 9 en tel 10, 11, 12. Dus 9 + 3 = 12.</p>',
          wanneer:'er maar 2, 3 of 4 bij komt.',
          maak:function(R){
            var b = R.heel(2, 4), a = R.heel(5, 20 - b), m = mErbij(R, a, b);
            return { vraag:plus(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus20-grootste', naam:'Het grootste getal eerst', kort:'Draai de som om: begin bij het grootste getal',
          uit:'<p>Bij plus mag je de getallen <b>omdraaien</b>. 2 + 9 is hetzelfde als 9 + 2.</p><p>Begin daarom altijd bij het grootste getal. Dan hoef je maar een klein stukje verder te tellen: 9, en dan 10, 11.</p>',
          wanneer:'het eerste getal klein is en het tweede groot.',
          maak:function(R){
            var a = R.heel(2, 4), b = R.heel(6, 20 - a), m = mGrootste(R, a, b);
            return { vraag:plus(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus20-dubbel', naam:'Dubbelen', kort:'Twee dezelfde getallen: 7 + 7 = 5 + 5 + 2 + 2',
          uit:'<p>Een <b>dubbele som</b> heeft twee dezelfde getallen, zoals 7 + 7. Die moet je uit je hoofd leren.</p><p>Weet je hem niet? Splits elk getal in 5 en de rest. 7 + 7 = 5 + 5 + 2 + 2 = 10 + 4 = 14. Op het rekje zie je het: twee rijen van 5 en twee keer 2.</p>',
          wanneer:'twee getallen precies even groot zijn.',
          maak:function(R){
            var a = R.heel(6, 9), m = mDubbel20(R, a);
            return { vraag:R.heel(0, 1) ? plus(a, a) : 'het dubbele van ' + a, beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus20-bijna', naam:'Bijna dubbelen', kort:'Twee getallen die 1 schelen: 6 + 7 = 6 + 6 + 1',
          uit:'<p>Schelen de getallen maar 1, zoals 6 + 7? Dan is het <b>bijna dubbel</b>.</p><p>Neem het kleinste getal dubbel en doe er 1 bij: 6 + 6 = 12, en 12 + 1 = 13.</p>',
          wanneer:'de twee getallen naast elkaar liggen, zoals 7 en 8.',
          maak:function(R){
            var k = R.heel(3, 9), a = k, b = k + 1; if (R.heel(0, 1)){ a = k + 1; b = k; }
            var m = mBijna20(R, a, b);
            return { vraag:plus(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus20-brug', naam:'Via de 10', kort:'Maak eerst 10, dan de rest erbij: 8 + 5 = 8 + 2 + 3',
          uit:'<p>Ga je over de 10 heen? Spring dan eerst <b>naar de 10</b>. 8 + 5: 8 heeft nog 2 nodig tot 10. Splits 5 in 2 en 3.</p><p>Dus 8 + 2 = 10, en dan 10 + 3 = 13. Op de getallenlijn zie je twee sprongen: naar 10 en daarna verder.</p>',
          wanneer:'de uitkomst boven de 10 komt en het eerste getal dicht bij 10 ligt.',
          maak:function(R){
            var a = R.heel(6, 9), b; do { b = R.heel(3, 9); } while (a + b <= 10);
            var m = mBrug20(R, a, b);
            return { vraag:plus(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus20-kies', naam:'Kies de handigste manier', kort:'Kijk eerst naar de getallen, kies dan het trucje dat het snelst gaat',
          uit:'<p>Je kent nu vier trucjes. Kijk eerst goed naar de som en <b>kies</b> dan:</p><p>Twee dezelfde getallen? <b>Dubbelen</b>. Schelen ze 1? <b>Bijna dubbelen</b>. Is het eerste getal heel klein? <b>Het grootste getal eerst</b>. Ligt het eerste getal dicht bij 10? <b>Via de 10</b>.</p>',
          wanneer:'je een som tot 20 snel en zonder fouten wilt uitrekenen.',
          maak:function(R){
            var lijst = ['grootste getal eerst', 'dubbelen', 'bijna dubbelen', 'via de 10'], s = R.heel(0, 3), a, b, x;
            if (s === 0){ a = R.heel(2, 3); b = R.heel(7, 9);
              return kiesOp(R, plus(a, b), lijst, lijst[0], 'Het eerste getal is klein: ' + a + '. Begin bij ' + b + ' en tel er ' + a + ' bij.', mGrootste(R, a, b)); }
            if (s === 1){ x = R.heel(6, 9);
              return kiesOp(R, plus(x, x), lijst, lijst[1], 'Twee keer hetzelfde getal: dat is een dubbele som.', mDubbel20(R, x)); }
            if (s === 2){ x = R.heel(5, 8); a = x; b = x + 1; if (R.heel(0, 1)){ a = x + 1; b = x; }
              return kiesOp(R, plus(a, b), lijst, lijst[2], a + ' en ' + b + ' schelen maar 1. Neem het kleinste dubbel en doe er 1 bij.', mBijna20(R, a, b)); }
            do { a = R.heel(7, 9); b = R.heel(3, 6); } while (a - b < 3 || a + b <= 10);
            return kiesOp(R, plus(a, b), lijst, lijst[3], a + ' ligt dicht bij 10. Maak eerst 10 en doe dan de rest erbij.', mBrug20(R, a, b));
          } }
      ] },

    /* ================= 4 aftrekken tot 20 ================= */
    { groep:{ id:'min20', niveau:'basis', domein:'getallen', naam:'Aftrekken tot 20', uit:'Sommen als 13 ' + MIN + ' 5 kun je op drie manieren handig uitrekenen: met een dubbele som, terug via de 10, of door aan te vullen.' },
      doelen:[
        { id:'min20-dubbel', naam:'Dubbelen terug', kort:'14 ' + MIN + ' 7: je weet 7 + 7 = 14, dus het is 7',
          uit:'<p>Ken je je <b>dubbele sommen</b>? Dan weet je ook de min-sommen. 7 + 7 = 14, dus 14 ' + MIN + ' 7 = 7.</p><p>Haal je de helft weg, dan blijft de andere helft over.</p>',
          wanneer:'je precies de helft van een getal afhaalt.',
          maak:function(R){
            var x = R.heel(3, 9), m = mDubbelMin20(R, x);
            return { vraag:min(2 * x, x), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'min20-brug', naam:'Terug via de 10', kort:'Spring eerst terug naar 10, dan de rest: 13 ' + MIN + ' 5 = 13 ' + MIN + ' 3 ' + MIN + ' 2',
          uit:'<p>Ga je terug onder de 10? Spring dan eerst <b>terug naar 10</b>. 13 ' + MIN + ' 5: van 13 naar 10 is 3 terug. Splits 5 in 3 en 2.</p><p>Dus 13 ' + MIN + ' 3 = 10, en dan 10 ' + MIN + ' 2 = 8.</p>',
          wanneer:'je een klein getal afhaalt en onder de 10 uitkomt.',
          maak:function(R){
            var a, b; do { a = R.heel(11, 18); b = R.heel(3, 9); } while (b <= a - 10 || a - b >= 10 || a === 2 * b);
            var m = mBrugMin20(R, a, b);
            return { vraag:min(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'min20-aanvullen', naam:'Aanvullen', kort:'13 ' + MIN + ' 9: spring van 9 naar 13 en tel hoe ver dat is',
          uit:'<p>Liggen de getallen dicht bij elkaar? Dan kun je <b>aanvullen</b>. Je zoekt hoe ver het is van het kleine naar het grote getal.</p><p>13 ' + MIN + ' 9: van 9 naar 10 is 1, van 10 naar 13 is 3. Samen 4. Dus 13 ' + MIN + ' 9 = 4.</p>',
          wanneer:'je bijna evenveel afhaalt als er is, zoals 12 ' + MIN + ' 9.',
          maak:function(R){
            var a, b; do { b = R.heel(6, 9); a = R.heel(11, 16); } while (a - b > 6 || a === 2 * b);
            var m = mAanvul(R, b, a);
            return { vraag:min(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'min20-kies', naam:'Kies de handigste manier', kort:'Kijk eerst naar de getallen, kies dan dubbelen, via de 10 of aanvullen',
          uit:'<p>Kijk eerst goed naar de som en <b>kies</b> dan:</p><p>Haal je precies de helft weg, zoals 16 ' + MIN + ' 8? <b>Dubbelen terug</b>. Liggen de getallen dicht bij elkaar, zoals 12 ' + MIN + ' 9? <b>Aanvullen</b>. Haal je er maar een klein beetje af, zoals 13 ' + MIN + ' 4? <b>Terug via de 10</b>.</p>',
          wanneer:'je een min-som tot 20 snel en zonder fouten wilt uitrekenen.',
          maak:function(R){
            var lijst = ['dubbelen terug', 'aanvullen', 'terug via de 10'], s = R.heel(0, 2), a, b, x;
            if (s === 0){ x = R.heel(6, 9);
              return kiesOp(R, min(2 * x, x), lijst, lijst[0], 'Je haalt precies de helft weg: ' + plus(x, x) + ' = ' + (2 * x) + '.', mDubbelMin20(R, x)); }
            if (s === 1){ do { b = R.heel(7, 9); a = R.heel(11, 13); } while (a - b > 4 || a === 2 * b);
              return kiesOp(R, min(a, b), lijst, lijst[1], a + ' en ' + b + ' liggen dicht bij elkaar. Spring van ' + b + ' naar ' + a + ' en tel hoe ver het is.', mAanvul(R, b, a)); }
            do { a = R.heel(11, 14); b = R.heel(3, 5); } while (b <= a - 10 || a - b < 7);
            return kiesOp(R, min(a, b), lijst, lijst[2], 'Je haalt er maar ' + b + ' af. Spring eerst terug naar 10 en dan de rest.', mBrugMin20(R, a, b));
          } }
      ] },

    /* ================= 5 optellen tot 100 ================= */
    { groep:{ id:'plus100', niveau:'basis', domein:'getallen', naam:'Optellen tot 100', uit:'Een som als 47 + 36 kun je op veel manieren uitrekenen. Leer ze allemaal, dan kies je steeds de handigste.' },
      doelen:[
        { id:'plus100-rijgen', naam:'Rijgen', kort:'Laat het eerste getal heel en spring er het tweede getal in stukken bij',
          uit:'<p>Bij <b>rijgen</b> begin je bij het eerste getal en laat je dat heel. Het tweede getal splits je in tientallen en eenheden. Je springt eerst de tientallen erbij en dan de eenheden.</p><p>Op de getallenlijn zie je elke sprong. Zo hoef je maar een getal te onthouden: waar je nu staat.</p>',
          wanneer:'het tweede getal geen rond getal is en je in je hoofd rekent.',
          maak:function(R){
            var a, b; do { a = R.heel(21, 68); b = R.heel(12, 39); } while (b % 10 === 0 || a % 10 === 0 || a % 10 + b % 10 >= 10 || a + b > 100);
            var m = mRijgen(R, a, b, true);
            return { vraag:plus(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus100-splitsen', naam:'Splitsen', kort:'Splits beide getallen in tientallen en eenheden en tel ze apart op',
          uit:'<p>Bij <b>splitsen</b> haal je beide getallen uit elkaar: tientallen bij tientallen, eenheden bij eenheden. Daarna tel je de twee uitkomsten op.</p><p>Met blokjes zie je het: eerst de staven samen, dan de losse blokjes. Zijn er 10 losse blokjes of meer? Dan maak je daar een nieuwe staaf van.</p>',
          wanneer:'je de getallen makkelijk uit elkaar kunt halen, en de eenheden samen niet meer dan 10 zijn (dan is het het makkelijkst).',
          maak:function(R){
            var a, b; do { a = R.heel(21, 59); b = R.heel(12, 39); } while (b % 10 === 0 || a % 10 === 0 || a + b > 100);
            var m = mSplits(R, a, b);
            return { vraag:plus(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus100-rijgen-tiental', naam:'Rijgen over het tiental', kort:'Tientallen erbij, dan naar het tiental, dan de rest: drie sprongen',
          uit:'<p>Kom je bij het rijgen <b>over een tiental</b>? Dan maak je drie sprongen. 47 + 36: eerst de tientallen, 47 + 30 = 77.</p><p>Dan naar het volgende tiental: 77 + 3 = 80. Van de 6 blijft nog 3 over: 80 + 3 = 83.</p>',
          wanneer:'de eenheden samen meer dan 10 zijn, zoals 7 + 6.',
          maak:function(R){
            var a, b; do { a = R.heel(21, 68); b = R.heel(12, 39); } while (b % 10 === 0 || a % 10 === 0 || a % 10 + b % 10 <= 10 || a + b > 100);
            var m = mRijgenOver(R, a, b, true);
            return { vraag:plus(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus100-verwisselen', naam:'Verwisselen', kort:'Staat het kleine getal voorop? Begin bij het grote: 8 + 57 = 57 + 8',
          uit:'<p>Bij plus mag je de getallen <b>verwisselen</b>: 8 + 57 is hetzelfde als 57 + 8.</p><p>Begin bij het grote getal. Dan hoef je er maar een klein stukje bij te springen: 57 + 3 = 60, en dan nog 5 erbij is 65.</p>',
          wanneer:'het eerste getal veel kleiner is dan het tweede.',
          maak:function(R){
            var a, b; do { a = R.heel(2, 9); b = R.heel(21, 89); } while (b % 10 === 0 || a + b > 100);
            var m = mWissel(R, a, b);
            return { vraag:plus(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus100-dubbel', naam:'Dubbelen', kort:'Twee (bijna) dezelfde getallen: 35 + 36 = 35 + 35 + 1',
          uit:'<p>Zijn de getallen gelijk, of schelen ze maar 1? Dan kun je <b>dubbelen</b>. Neem het kleinste getal dubbel: eerst de tientallen, dan de eenheden.</p><p>35 + 36: 30 + 30 = 60, 5 + 5 = 10, samen 70. Het andere getal is 1 meer, dus 70 + 1 = 71.</p>',
          wanneer:'de twee getallen (bijna) even groot zijn, zoals 25 + 25 of 45 + 46.',
          maak:function(R){
            var a; do { a = R.heel(11, 49); } while (a % 10 === 0);
            var d = R.heel(0, 1), b = a + d, v = d && R.heel(0, 1) ? plus(b, a) : plus(a, b), m = mDubbel100(R, a, d);
            return { vraag:v, beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus100-compenseren', naam:'Compenseren', kort:'Tel een rond getal erbij en haal het teveel weer weg: 47 + 29 = 47 + 30 ' + MIN + ' 1',
          uit:'<p>Is het tweede getal <b>bijna rond</b>, zoals 29 of 38? Tel dan het ronde getal erbij. Dat gaat snel.</p><p>47 + 29: doe 47 + 30 = 77. Maar je deed er 1 te veel bij. Haal die er weer af: 77 ' + MIN + ' 1 = 76. Dat heet <b>compenseren</b>.</p><p>Op de getallenlijn zie je een grote sprong vooruit en een klein sprongetje terug.</p>',
          wanneer:'het tweede getal eindigt op 8 of 9.',
          maak:function(R){
            var a, b; do { b = R.kies([18, 19, 28, 29, 38, 39, 48, 49, 58, 59]); a = R.heel(21, 69); } while (a % 10 === 0 || bijnaRond(a) || a + tienBoven(b) > 100);
            var m = mComp(R, a, b, true);
            return { vraag:plus(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus100-transformeren', naam:'Transformeren', kort:'Schuif iets van het ene getal naar het andere: 39 + 26 = 40 + 25',
          uit:'<p>Bij <b>transformeren</b> maak je een getal rond door iets van het andere getal te lenen. Wat er bij het ene bij komt, gaat er bij het andere af.</p><p>39 + 26: 39 heeft 1 nodig om 40 te worden. Haal die 1 van 26 af. Dan krijg je 40 + 25 = 65. De som blijft even groot, maar is veel makkelijker.</p>',
          wanneer:'het eerste getal bijna rond is, zoals 39 of 58.',
          maak:function(R){
            var a, b; do { a = R.kies([19, 29, 39, 49, 59, 69, 18, 28, 38, 48, 58]); b = R.heel(12, 59); } while (b % 10 === 0 || bijnaRond(b) || b % 10 < tienBoven(a) - a || a + b > 99);
            var m = mTrans(R, a, b);
            return { vraag:plus(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus100-kies', naam:'Kies de handigste manier', kort:'Kijk eerst naar de getallen, kies dan de manier die het snelst gaat',
          uit:'<p>Kijk eerst goed naar de getallen en <b>kies</b> dan:</p><p>Eindigt het tweede getal op 8 of 9? <b>Compenseren</b>. Eindigt het eerste getal op 8 of 9? <b>Transformeren</b>. Staat er een klein getal voorop? <b>Verwisselen</b>. Zijn de getallen (bijna) gelijk? <b>Dubbelen</b>. Niets van dit alles? Dan is <b>rijgen</b> een goede manier.</p>',
          wanneer:'je een som tot 100 snel en zonder fouten wilt uitrekenen.',
          maak:function(R){
            var s = R.heel(0, 4), a, b;
            if (s === 0){ do { b = R.kies([19, 29, 39, 49, 18, 28, 38]); a = R.heel(21, 69); } while (a % 10 === 0 || bijnaRond(a) || a + tienBoven(b) > 100 || Math.abs(a - b) <= 2);
              return kiesOp(R, plus(a, b), ['compenseren', 'verwisselen', 'dubbelen', 'splitsen'], 'compenseren', b + ' is bijna ' + tienBoven(b) + '. Tel ' + tienBoven(b) + ' erbij en haal het teveel weer weg.', mComp(R, a, b, true)); }
            if (s === 1){ do { a = R.kies([19, 29, 39, 49, 59, 28, 38, 48]); b = R.heel(12, 59); } while (b % 10 === 0 || bijnaRond(b) || b % 10 < tienBoven(a) - a || a + b > 99 || Math.abs(a - b) <= 2);
              return kiesOp(R, plus(a, b), ['transformeren', 'verwisselen', 'dubbelen', 'splitsen'], 'transformeren', a + ' is bijna ' + tienBoven(a) + '. Leen ' + (tienBoven(a) - a) + ' van ' + b + ', dan krijg je een rond getal.', mTrans(R, a, b)); }
            if (s === 2){ do { a = R.heel(2, 7); b = R.heel(21, 89); } while (b % 10 === 0 || bijnaRond(b) || a + b > 100);
              return kiesOp(R, plus(a, b), ['verwisselen', 'compenseren', 'dubbelen', 'splitsen'], 'verwisselen', 'Het kleine getal ' + a + ' staat voorop. Begin bij ' + b + ' en spring er ' + a + ' bij.', mWissel(R, a, b)); }
            if (s === 3){ do { a = R.heel(11, 48); } while (a % 10 === 0 || a % 10 > 6);
              var d = R.heel(0, 1), v = d && R.heel(0, 1) ? plus(a + d, a) : plus(a, a + d);
              return kiesOp(R, v, ['dubbelen', 'compenseren', 'verwisselen', 'transformeren'], 'dubbelen', d ? 'De getallen schelen maar 1. Neem ' + a + ' dubbel en doe er 1 bij.' : 'Twee dezelfde getallen: neem ' + a + ' dubbel.', mDubbel100(R, a, d)); }
            do { a = R.heel(21, 67); b = R.heel(12, 39); } while (!nietRond(a) || !nietRond(b) || bijnaRond(a) || bijnaRond(b) || a % 10 + b % 10 <= 10 || a + b > 100 || Math.abs(a - b) <= 2);
            return kiesOp(R, plus(a, b), ['rijgen', 'compenseren', 'verwisselen', 'dubbelen'], 'rijgen', 'Geen getal is bijna rond, ze zijn niet gelijk en er staat geen klein getal voorop. Dan is rijgen een goede manier.', mRijgenOver(R, a, b, true));
          } }
      ] },

    /* ================= 6 aftrekken tot 100 ================= */
    { groep:{ id:'min100', niveau:'basis', domein:'getallen', naam:'Aftrekken tot 100', uit:'Een som als 63 ' + MIN + ' 27 kun je op veel manieren uitrekenen. Bij min moet je goed opletten welke manier past.' },
      doelen:[
        { id:'min100-rijgen', naam:'Rijgen', kort:'Laat het eerste getal heel en spring het tweede getal in stukken terug',
          uit:'<p>Bij <b>rijgen</b> begin je bij het eerste getal en laat je dat heel. Het tweede getal splits je in tientallen en eenheden. Je springt eerst de tientallen terug en dan de eenheden.</p><p>68 ' + MIN + ' 23: 68 ' + MIN + ' 20 = 48, en 48 ' + MIN + ' 3 = 45.</p>',
          wanneer:'je in je hoofd rekent en het tweede getal geen rond getal is.',
          maak:function(R){
            var a, b; do { a = R.heel(35, 99); b = R.heel(12, 49); } while (b % 10 === 0 || a % 10 === 0 || b % 10 > a % 10 || a - b < 10);
            var m = mRijgen(R, a, b, false);
            return { vraag:min(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'min100-splitsen', naam:'Splitsen', kort:'Tientallen min tientallen, eenheden min eenheden: alleen als dat past',
          uit:'<p>Bij <b>splitsen</b> haal je beide getallen uit elkaar. 68 ' + MIN + ' 23: de tientallen 60 ' + MIN + ' 20 = 40, de eenheden 8 ' + MIN + ' 3 = 5. Samen 45.</p><p>Let op: dit gaat alleen goed als de eenheden bovenaan groot genoeg zijn. Bij 63 ' + MIN + ' 27 moet je 3 ' + MIN + ' 7 doen, en dat past niet. Dan moet je lenen, en dat gaat snel mis. Gebruik dan liever rijgen.</p>',
          wanneer:'de eenheden van het eerste getal groter zijn dan die van het tweede, zoals bij 68 ' + MIN + ' 23.',
          maak:function(R){
            var a, b; do { a = R.heel(35, 99); b = R.heel(12, 49); } while (b % 10 === 0 || a % 10 === 0 || b % 10 > a % 10 || a - b < 10);
            var m = mSplitsMin(R, a, b);
            return { vraag:min(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'min100-rijgen-tiental', naam:'Rijgen over het tiental', kort:'Tientallen terug, dan terug naar het tiental, dan de rest',
          uit:'<p>Ga je bij het terugspringen <b>over een tiental</b>? Dan maak je drie sprongen. 63 ' + MIN + ' 27: eerst de tientallen, 63 ' + MIN + ' 20 = 43.</p><p>Dan terug naar het tiental: 43 ' + MIN + ' 3 = 40. Van de 7 blijft nog 4 over: 40 ' + MIN + ' 4 = 36.</p>',
          wanneer:'de eenheden van het tweede getal groter zijn dan die van het eerste, zoals bij 63 ' + MIN + ' 27.',
          maak:function(R){
            var a, b; do { a = R.heel(41, 98); b = R.heel(12, 69); } while (b % 10 === 0 || a % 10 === 0 || b % 10 <= a % 10 || a - b < 5);
            var m = mRijgenOver(R, a, b, false);
            return { vraag:min(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'min100-aanvullen', naam:'Aanvullen', kort:'72 ' + MIN + ' 68: spring van 68 naar 72 en tel de sprongen op',
          uit:'<p>Liggen de getallen <b>dicht bij elkaar</b>? Dan kun je beter <b>aanvullen</b>. Je zoekt hoe ver het is van het kleine naar het grote getal.</p><p>72 ' + MIN + ' 68: van 68 naar 70 is 2, van 70 naar 72 is 2. Samen 4. Dat is het verschil.</p>',
          wanneer:'de twee getallen dicht bij elkaar liggen.',
          maak:function(R){
            var a, b; do { b = R.heel(15, 88); a = b + R.heel(3, 25); } while (b % 10 === 0 || a > 99 || a % 10 === 0 || a % 10 === b % 10 || Math.floor(a / 10) === Math.floor(b / 10));
            var m = mAanvul(R, b, a);
            return { vraag:min(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'min100-compenseren', naam:'Compenseren', kort:'Haal een rond getal eraf en doe het teveel er weer bij: 63 ' + MIN + ' 29 = 63 ' + MIN + ' 30 + 1',
          uit:'<p>Is het getal dat eraf gaat <b>bijna rond</b>, zoals 29? Haal dan het ronde getal eraf: 63 ' + MIN + ' 30 = 33.</p><p>Maar je haalde er 1 te veel af. Doe die er weer bij: 33 + 1 = 34. Dat heet <b>compenseren</b>.</p><p>Let op: bij min doe je het teveel er weer <b>bij</b>. Op de getallenlijn zie je een grote sprong terug en een klein sprongetje vooruit.</p>',
          wanneer:'het getal dat eraf gaat eindigt op 8 of 9.',
          maak:function(R){
            var a, b; do { b = R.kies([18, 19, 28, 29, 38, 39, 48, 49, 58, 59]); a = R.heel(31, 99); } while (a % 10 === 0 || bijnaRond(a) || a - tienBoven(b) < 1);
            var m = mComp(R, a, b, false);
            return { vraag:min(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'min100-transformeren', naam:'Transformeren', kort:'Schuif beide getallen evenveel op: 83 ' + MIN + ' 39 = 84 ' + MIN + ' 40',
          uit:'<p>Bij een min-som gaat het om het <b>verschil</b>. Schuif je beide getallen evenveel op, dan blijft het verschil gelijk.</p><p>83 ' + MIN + ' 39: doe bij allebei 1 erbij. Dan krijg je 84 ' + MIN + ' 40 = 44. Dat heet <b>transformeren</b> of gelijk verschuiven.</p><p>Let op: bij min doe je bij allebei hetzelfde. Bij plus haal je het juist bij het andere getal weg.</p>',
          wanneer:'het getal dat eraf gaat bijna rond is, zoals 39 of 58.',
          maak:function(R){
            var a, b; do { b = R.kies([19, 29, 39, 49, 59, 18, 28, 38, 48]); a = R.heel(31, 97); } while (a % 10 === 0 || a % 10 >= b % 10 || a - b < 10 || a + tienBoven(b) - b > 99);
            var m = mTransMin(R, a, b);
            return { vraag:min(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'min100-kies', naam:'Kies de handigste manier', kort:'Kijk eerst naar de getallen, kies dan de manier die het snelst gaat',
          uit:'<p>Kijk eerst goed naar de getallen en <b>kies</b> dan:</p><p>Liggen ze dicht bij elkaar? <b>Aanvullen</b>. Eindigt het getal dat eraf gaat op 8 of 9? <b>Compenseren</b>. Zijn de eenheden bovenaan groter? Dan kan <b>splitsen</b>. Moet je over het tiental terug? Dan is <b>rijgen</b> veilig.</p>',
          wanneer:'je een min-som tot 100 snel en zonder fouten wilt uitrekenen.',
          maak:function(R){
            var s = R.heel(0, 3), a, b;
            if (s === 0){ do { b = R.heel(21, 88); a = b + R.heel(2, 9); } while (b % 10 === 0 || bijnaRond(b) || a > 99 || a % 10 === 0 || Math.floor(a / 10) === Math.floor(b / 10));
              return kiesOp(R, min(a, b), ['aanvullen', 'rijgen', 'splitsen', 'compenseren'], 'aanvullen', a + ' en ' + b + ' liggen dicht bij elkaar. Spring van ' + b + ' naar ' + a + '.', mAanvul(R, b, a)); }
            if (s === 1){ do { b = R.kies([19, 29, 39, 49, 28, 38]); a = R.heel(41, 97); } while (a % 10 === 0 || bijnaRond(a) || a - b < 20);
              return kiesOp(R, min(a, b), ['compenseren', 'aanvullen', 'splitsen', 'rijgen'], 'compenseren', b + ' is bijna ' + tienBoven(b) + '. Haal ' + tienBoven(b) + ' eraf en doe het teveel er weer bij.', mComp(R, a, b, false)); }
            if (s === 2){ do { a = R.heel(45, 99); b = R.heel(12, 49); } while (!nietRond(a) || !nietRond(b) || bijnaRond(b) || b % 10 > a % 10 || a - b < 20);
              return kiesOp(R, min(a, b), ['splitsen', 'aanvullen', 'compenseren', 'transformeren'], 'splitsen', 'De eenheden passen: ' + min(a % 10, b % 10) + ' kan. De getallen liggen ver uit elkaar en ' + b + ' is niet bijna rond. Dan is splitsen handig.', mSplitsMin(R, a, b)); }
            do { a = R.heel(51, 98); b = R.heel(12, 47); } while (!nietRond(a) || !nietRond(b) || bijnaRond(b) || b % 10 <= a % 10 || a - b < 20);
            return kiesOp(R, min(a, b), ['rijgen', 'splitsen', 'aanvullen', 'compenseren'], 'rijgen', 'Splitsen is hier lastig: ' + min(a % 10, b % 10) + ' past niet. De getallen liggen ver uit elkaar en ' + b + ' is niet bijna rond. Rijg dus.', mRijgenOver(R, a, b, false));
          } }
      ] },

    /* ================= 7 tot 1000 ================= */
    { groep:{ id:'plus1000', niveau:'basis', domein:'getallen', naam:'Optellen en aftrekken tot 1000', uit:'Met grote getallen werken dezelfde manieren, maar nu met honderdtallen erbij. Rijgen, splitsen, aanvullen en compenseren.' },
      doelen:[
        { id:'plus1000-rijgen', naam:'Rijgen met honderdtallen', kort:'Eerst de honderdtallen erbij, dan de tientallen: 450 + 270',
          uit:'<p>Ook met grote getallen kun je <b>rijgen</b>. Laat het eerste getal heel en splits het tweede in honderdtallen en tientallen.</p><p>450 + 270: eerst 450 + 200 = 650. Dan 650 + 70. Ga je over het honderdtal? Spring dan eerst naar 700 (+50) en dan nog 20: 720.</p>',
          wanneer:'je met ronde tientallen rekent, zoals 450 + 270.',
          maak:function(R){
            var a, b; do { a = R.heel(11, 69) * 10; b = R.heel(11, 39) * 10; } while (a % 100 === 0 || b % 100 === 0 || a + b >= 1000);
            var m = mRijgen(R, a, b, true);
            return { vraag:plus(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus1000-splitsen', naam:'Splitsen met honderdtallen', kort:'Honderdtallen, tientallen en eenheden apart optellen',
          uit:'<p>Bij <b>splitsen</b> haal je beide getallen helemaal uit elkaar: honderdtallen bij honderdtallen, tientallen bij tientallen, eenheden bij eenheden.</p><p>352 + 436: 300 + 400 = 700, 50 + 30 = 80, 2 + 6 = 8. Samen 788.</p>',
          wanneer:'geen enkel deel samen boven de 9 komt, zoals bij 352 + 436.',
          maak:function(R){
            var a, b; do { a = R.heel(101, 799); b = R.heel(101, 799); } while (Math.floor(a / 100) + Math.floor(b / 100) > 9 || Math.floor(a / 10) % 10 + Math.floor(b / 10) % 10 > 9 || a % 10 + b % 10 > 9 || a % 10 === 0 || b % 100 < 10 || a % 100 < 10);
            var m = mSplits1000(R, a, b);
            return { vraag:plus(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus1000-rijgen-min', naam:'Rijgen bij aftrekken', kort:'Eerst de honderdtallen terug, dan de tientallen: 734 ' + MIN + ' 260',
          uit:'<p>Bij min kun je ook <b>rijgen</b>. 734 ' + MIN + ' 260: eerst de honderdtallen terug, 734 ' + MIN + ' 200 = 534.</p><p>Dan de tientallen: 534 ' + MIN + ' 60. Ga je terug over het honderdtal? Spring dan eerst naar 500 (34 terug) en dan nog 26 terug: 474.</p>',
          wanneer:'je een getal met ronde tientallen afhaalt, zoals 260 of 380.',
          maak:function(R){
            var a, b; do { b = R.heel(11, 49) * 10; a = R.heel(300, 999); } while (b % 100 === 0 || a - b < 100 || a % 10 === 0);
            var m = mRijgen(R, a, b, false);
            return { vraag:min(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus1000-aanvullen', naam:'Aanvullen tot een rond getal', kort:'Spring naar het tiental, het honderdtal en verder: 1000 ' + MIN + ' 647',
          uit:'<p>Bij <b>aanvullen</b> spring je van het kleine getal naar het grote, via ronde getallen. Het antwoord is de som van de sprongen.</p><p>1000 ' + MIN + ' 647: van 647 naar 650 is 3, van 650 naar 700 is 50, van 700 naar 1000 is 300. Samen 3 + 50 + 300 = 353.</p>',
          wanneer:'je van een rond getal zoals 1000 aftrekt, of wilt weten hoeveel er nog bij moet.',
          maak:function(R){
            var x, m;
            if (R.heel(0, 2)){
              do { x = R.heel(101, 989); } while (x % 10 === 0);
              m = mAanvul(R, x, 1000);
              return { vraag:min(1000, x), context:'Reken uit door aan te vullen: spring van ' + x + ' naar 1000.', beeld:m.beeld, stappen:m.stappen };
            }
            do { x = R.heel(101, 989); } while (x % 10 === 0 || x % 100 > 90);
            var H = Math.ceil(x / 100) * 100;
            m = mAanvul(R, x, H);
            return { vraag:x + ' + … = ' + H, context:'Hoeveel moet erbij tot ' + H + '?', beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus1000-compenseren', naam:'Compenseren met 99, 199 en 98', kort:'Reken met het ronde getal en verbeter daarna: 356 + 199 = 356 + 200 ' + MIN + ' 1',
          uit:'<p>Getallen als 99, 199 en 298 zijn <b>bijna rond</b>. Reken eerst met het ronde getal en verbeter daarna.</p><p>356 + 199: doe 356 + 200 = 556. Dat is 1 te veel, dus 556 ' + MIN + ' 1 = 555.</p><p>Bij min gaat het andersom: 523 ' + MIN + ' 199 = 523 ' + MIN + ' 200 + 1 = 324. Je haalde er 1 te veel af, dus doe je er 1 bij.</p>',
          wanneer:'je 99, 199, 299 of 98 erbij doet of eraf haalt.',
          maak:function(R){
            var b = R.kies([99, 199, 299, 399, 98, 198, 298]), rond = tienBoven(b), erbij = R.heel(0, 1), a;
            if (erbij){ do { a = R.heel(101, 999 - rond); } while (a % 10 === 0 || bijnaRond(a)); }
            else { do { a = R.heel(rond + 20, 999); } while (a % 10 === 0 || bijnaRond(a)); }
            var m = mComp(R, a, b, erbij);
            return { vraag:erbij ? plus(a, b) : min(a, b), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'plus1000-kies', naam:'Kies de handigste manier', kort:'Kijk eerst naar de getallen, kies dan de manier die het snelst gaat',
          uit:'<p>Kijk eerst goed naar de getallen en <b>kies</b> dan:</p><p>Zit er 99, 199 of 98 in? <b>Compenseren</b>. Trek je af van 1000? <b>Aanvullen</b>. Komt bij optellen geen deel boven de 9? <b>Splitsen</b>. Moet je bij min over het honderdtal terug? Dan is <b>rijgen</b> veilig.</p>',
          wanneer:'je een som tot 1000 snel en zonder fouten wilt uitrekenen.',
          maak:function(R){
            var s = R.heel(0, 3), a, b, x;
            if (s === 0){ b = R.kies([99, 199, 299, 98, 198]); var erbij = R.heel(0, 1);
              if (erbij){ do { a = R.heel(101, 999 - tienBoven(b)); } while (a % 10 === 0 || bijnaRond(a)); }
              else { do { a = R.heel(tienBoven(b) + 100, 999); } while (a % 10 === 0 || bijnaRond(a)); }
              return kiesOp(R, erbij ? plus(a, b) : min(a, b), ['compenseren', 'splitsen', 'aanvullen', 'rijgen'], 'compenseren', b + ' is bijna ' + tienBoven(b) + '. Reken met ' + tienBoven(b) + ' en verbeter daarna.', mComp(R, a, b, erbij)); }
            if (s === 1){ do { x = R.heel(101, 989); } while (x % 10 === 0 || Math.floor(x / 10) % 10 === 9);
              return kiesOp(R, min(1000, x), ['aanvullen', 'splitsen', 'compenseren', 'rijgen'], 'aanvullen', 'Je trekt af van 1000. Spring van ' + x + ' naar 1000 en tel de sprongen op.', mAanvul(R, x, 1000)); }
            if (s === 2){ do { a = R.heel(101, 799); b = R.heel(101, 799); } while (Math.floor(a / 100) + Math.floor(b / 100) > 9 || Math.floor(a / 10) % 10 + Math.floor(b / 10) % 10 > 9 || a % 10 + b % 10 > 9 || a % 10 === 0 || b % 10 === 0 || a % 100 < 10 || b % 100 < 10 || bijnaRond(a) || bijnaRond(b));
              return kiesOp(R, plus(a, b), ['splitsen', 'aanvullen', 'compenseren'], 'splitsen', 'Geen getal is bijna rond, en de honderdtallen, tientallen en eenheden komen samen niet boven de 9. Splits ze dus.', mSplits1000(R, a, b)); }
            do { b = R.heel(11, 47) * 10; a = R.heel(300, 999); } while (b % 100 === 0 || Math.floor(b / 10) % 10 > 7 || a - b < 200 || a % 10 === 0 || Math.floor(b / 10) % 10 <= Math.floor(a / 10) % 10);
            return kiesOp(R, min(a, b), ['rijgen', 'splitsen', 'aanvullen', 'compenseren'], 'rijgen', 'Splitsen is lastig: ' + min(Math.floor(a / 10) % 10 * 10, b % 100) + ' past niet. ' + b + ' is niet bijna rond en de getallen liggen ver uit elkaar. Rijg dus.', mRijgen(R, a, b, false));
          } }
      ] }
  ]);
})();
