/* De leerroute rekenen: keer en delen. Wat keer is, de tafels met trucjes,
   delen met de tafels, en keer- en deelsommen buiten de tafels.
   Elke manier is een eigen doel. Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var L = LEERROUTE.R, schoon = L.schoon, toon = L.toon, tk = L.teken;
  var MIN = '−', NUL = 'nul­len';   /* zacht afbreekstreepje: het woord blijft "nullen" */
  function S(n){ return String(n); }
  /* foute antwoorden met uitleg; nooit het goede antwoord als fout */
  function F(goed, lijst){
    var o = {}, g = String(goed).toLowerCase();
    lijst.forEach(function(p){ var k = String(p[0]).toLowerCase(); if (k !== g && !(k in o)) o[k] = p[1]; });
    return o;
  }
  /* een keuzestap: goed + andere, gehusseld */
  function kiesStap(R, tekst, goed, andere, hint){
    var o = R.hussel([goed].concat(andere));
    return { tekst:tekst, opties:o, goed:o.indexOf(goed), hint:hint };
  }
  function kiesUit(R, lijst, n){ return R.hussel(lijst).slice(0, n); }
  function reeks(stap, aantal){ var l = []; for (var i = 1; i <= Math.min(aantal, 3); i++) l.push(i * stap); return l.join(', ') + (aantal > 3 ? ', …' : ''); }
  function rij(a, b){ var l = []; for (var i = a; i <= b; i++) l.push(i); return l; }
  function flex(){ return '<div style="display:flex;flex-wrap:wrap;gap:18px;justify-content:center;align-items:flex-start">' + [].slice.call(arguments).join('') + '</div>'; }

  /* ---------- eigen plaatjes ---------- */
  /* een rooster van stippen: rij rijen, kol stippen per rij.
     o.kleur(r,k): 0 = grijs, 1..5 = kleur; o.weg(r,k): doorgestreept; o.splitsKol / o.splitsRij: stippellijn;
     o.rechts: tekst rechts van elke rij; o.rijVak: elke rij in een ovaal (een groepje) */
  function stippen(rijen, kol, o){
    o = o || {};
    var c = 24, m = 12, rw = o.rechts ? 58 : 0, W = kol * c + 2 * m + rw, H = rijen * c + 2 * m;
    var s = '<svg class="lr-svg" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:' + Math.min(640, Math.round(W * 1.6)) + 'px" role="img" aria-label="' + schoon(o.aria || (rijen + ' rijen van ' + kol + ' stippen')) + '">';
    for (var r = 0; r < rijen; r++){
      if (o.rijVak) s += '<rect x="' + (m - 3) + '" y="' + (m + r * c + 1) + '" width="' + (kol * c + 6) + '" height="' + (c - 2) + '" rx="11" style="fill:none;stroke:var(--muted);stroke-width:1.2"/>';
      for (var k = 0; k < kol; k++){
        var kl = o.kleur ? o.kleur(r, k) : 1, cx = m + k * c + c / 2, cy = m + r * c + c / 2;
        s += '<circle cx="' + cx + '" cy="' + cy + '" r="7.5" style="fill:' + (kl ? 'var(--lr-' + kl + ')' : 'var(--muted)') + ';opacity:' + (kl ? 1 : 0.3) + '"/>';
        if (o.weg && o.weg(r, k)) s += '<path d="M' + (cx - 8) + ' ' + (cy - 8) + 'L' + (cx + 8) + ' ' + (cy + 8) + 'M' + (cx + 8) + ' ' + (cy - 8) + 'L' + (cx - 8) + ' ' + (cy + 8) + '" style="stroke:var(--ink);stroke-width:2.2;stroke-linecap:round"/>';
      }
      if (o.rechts && o.rechts[r] != null) s += '<text x="' + (m + kol * c + 12) + '" y="' + (m + r * c + c / 2 + 5) + '" class="getal klein" style="text-anchor:start">' + schoon(o.rechts[r]) + '</text>';
    }
    if (o.splitsKol) s += '<line x1="' + (m + o.splitsKol * c) + '" y1="' + (m - 8) + '" x2="' + (m + o.splitsKol * c) + '" y2="' + (H - m + 8) + '" style="stroke:var(--ink);stroke-width:2;stroke-dasharray:5 4"/>';
    if (o.splitsRij) s += '<line x1="' + (m - 8) + '" y1="' + (m + o.splitsRij * c) + '" x2="' + (m + kol * c + 8) + '" y2="' + (m + o.splitsRij * c) + '" style="stroke:var(--ink);stroke-width:2;stroke-dasharray:5 4"/>';
    return s + '</svg>';
  }
  /* groepjes: a cirkels met elk b stippen */
  function groepjes(a, b, o){
    o = o || {};
    var D = 104, W = a * D + 8, H = o.tel ? 132 : 108, kol = b <= 4 ? 2 : 3;
    var s = '<svg class="lr-svg" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:' + Math.min(640, W * 1.4) + 'px" role="img" aria-label="' + a + ' groepjes van ' + b + '">';
    for (var g = 0; g < a; g++){
      var cx = 4 + g * D + D / 2, cy = 54, rijen = Math.ceil(b / kol);
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="46" style="fill:var(--kaart);stroke:' + (o.licht ? 'var(--lr-2)' : 'var(--ink)') + ';stroke-width:2"/>';
      for (var i = 0; i < b; i++){
        var rr = Math.floor(i / kol), kk = i % kol, inRij = Math.min(kol, b - rr * kol);
        var x = cx + (kk - (inRij - 1) / 2) * 22, y = cy + (rr - (rijen - 1) / 2) * 22;
        s += '<circle cx="' + x + '" cy="' + y + '" r="7.5" style="fill:var(--lr-1)"/>';
      }
      if (o.tel) s += '<text x="' + cx + '" y="124" class="getal klein">' + b + '</text>';
    }
    return s + '</svg>';
  }
  /* eerlijk verdelen: een strook met het totaal, verdeeld in d vakken */
  function verdeel(T, d, inhoud, o){
    o = o || {};
    var w = Math.min(96, Math.floor(560 / d)), W = d * w + 20, s = '<svg class="lr-svg" viewBox="0 0 ' + W + ' ' + (o.label ? 112 : 88) + '" style="max-width:' + Math.min(640, W * 1.3) + 'px" role="img" aria-label="' + schoon(T + ' eerlijk verdelen over ' + d) + '">';
    s += '<text x="' + (W / 2) + '" y="18" class="getal">' + schoon(T + ' samen') + '</text>';
    s += '<path d="M10 30 L10 24 L' + (W - 10) + ' 24 L' + (W - 10) + ' 30" style="fill:none;stroke:var(--ink);stroke-width:1.5"/>';
    for (var i = 0; i < d; i++){
      s += '<rect x="' + (10 + i * w) + '" y="36" width="' + w + '" height="46" class="deel' + (o.vol ? ' vol' : '') + '"/>';
      s += '<text x="' + (10 + i * w + w / 2) + '" y="66" class="getal groot">' + schoon(inhoud) + '</text>';
      if (o.label) s += '<text x="' + (10 + i * w + w / 2) + '" y="104" class="getal klein">' + schoon(o.label + ' ' + (i + 1)) + '</text>';
    }
    s += '<rect x="10" y="36" width="' + (d * w) + '" height="46" class="rand"/>';
    return s + '</svg>';
  }
  /* plaatswaarde: rijen [label, getal of null] */
  var PW = ['HD', 'TD', 'D', 'H', 'T', 'E'];
  function plaats(rijen, o){
    o = o || {};
    var cols = 4; rijen.forEach(function(r){ if (r[1] != null) cols = Math.max(cols, String(r[1]).length); });
    var kop = [''].concat(PW.slice(PW.length - cols));
    var t = [kop];
    rijen.forEach(function(r){
      if (r[1] == null) return;
      var c = String(r[1]); while (c.length < cols) c = ' ' + c;
      t.push([r[0]].concat(c.split('').map(function(x){ return x === ' ' ? '' : x; })));
    });
    return tk.tabel(t, { kop:true, zijkop:true, nadruk:o.nadruk });
  }
  /* een rij als som-regels: [[a, '×', b], ...] */
  function regels(lijst, n){ return tk.tabel(lijst.slice(0, n), {}); }

  /* ---------- de tafeltrucjes als losse stappen (ook voor Kies) ---------- */
  function dubbelTabel(a, k, n){
    var kop = ['× 1', '× 2', '× 4', '× 8'].slice(0, k + 1), w = [a], p = [];
    for (var i = 1; i <= k; i++){ w.push(n >= i ? a * Math.pow(2, i) : '?'); p.push({ van:i - 1, naar:i, tekst:'dubbel' }); }
    return tk.tabel([kop, w], { kop:true, pijlen:p });
  }
  function mDubbel(a, k){
    var st = [];
    for (var i = 1; i <= k; i++){
      var voor = a * Math.pow(2, i - 1), na = voor * 2;
      st.push({ tekst:(i === 1 ? 'Verdubbel ' + a : i === 2 ? 'Verdubbel nog een keer' : 'En nog een keer') + ': 2 × ' + voor + ' =', antwoord:S(na),
        hint:'Het dubbele van ' + voor + ' is ' + voor + ' + ' + voor + '.', fout:F(na, [[voor + a, 'Je telde ' + a + ' erbij. Verdubbelen is ' + voor + ' + ' + voor + '.']]) });
    }
    return { stappen:st, beeld:function(n){ return dubbelTabel(a, k, n); } };
  }
  function mHelft(a){   /* 5 × a */
    var tien = 10 * a, vijf = 5 * a;
    return { stappen:[
      { tekst:'Eerst 10 keer: 10 × ' + a + ' =', antwoord:S(tien), hint:'Zet een nul achter ' + a + '.' },
      { tekst:'5 keer is de helft van 10 keer. De helft van ' + tien + ' =', antwoord:S(vijf), hint:'Verdeel ' + tien + ' in twee gelijke stukken.', fout:F(vijf, [[tien * 2, 'Je verdubbelde. Je moet juist halveren.']]) } ],
      beeld:function(n){ return tk.tabel([['× 10', '× 5'], [n >= 1 ? tien : '?', n >= 2 ? vijf : '?']], { kop:true, pijlen:[{ van:0, naar:1, tekst:'helft' }] }); } };
  }
  function mNegen(a){   /* 9 × a */
    var tien = 10 * a, neg = 9 * a;
    return { stappen:[
      { tekst:'Eerst 10 keer: 10 × ' + a + ' =', antwoord:S(tien), hint:'Zet een nul achter ' + a + '.' },
      { tekst:'9 keer is één keer minder. Haal er één keer ' + a + ' af: ' + tien + ' ' + MIN + ' ' + a + ' =', antwoord:S(neg), hint:'Spring van ' + tien + ' terug met ' + a + '.',
        fout:F(neg, [[tien - 1, 'Je haalde er 1 af. Haal er een heel groepje van ' + a + ' af.'], [tien - 9, 'Je haalde er 9 af. Haal er één keer ' + a + ' af.']]) } ],
      beeld:function(n){ return stippen(10, a, { kleur:function(r){ return n >= 1 ? (r === 9 ? 2 : 1) : 0; }, weg:function(r){ return n >= 2 && r === 9; }, splitsRij:n >= 1 ? 9 : 0, rechts:n >= 1 ? ['', '', '', '', '', '', '', '', '', n >= 2 ? MIN + a : ''] : null, aria:'10 rijen van ' + a + ', de laatste rij weg' }); } };
  }
  function mElf(a, m){   /* 11 × a of 12 × a */
    var tien = 10 * a, rest = (m - 10) * a, uit = m * a, st = [
      { tekst:'Eerst 10 keer: 10 × ' + a + ' =', antwoord:S(tien), hint:'Zet een nul achter ' + a + '.' } ];
    if (m === 11) st.push({ tekst:'Tel er nog één keer ' + a + ' bij: ' + tien + ' + ' + a + ' =', antwoord:S(uit), hint:tien + ' en dan nog ' + a + ' verder.', fout:F(uit, [[tien + 1, 'Je telde er 1 bij. Tel er een heel groepje van ' + a + ' bij.']]) });
    else st.push({ tekst:'Nog 2 keer: 2 × ' + a + ' =', antwoord:S(rest), hint:'Het dubbele van ' + a + '.' },
      { tekst:'Samen: ' + tien + ' + ' + rest + ' =', antwoord:S(uit), hint:'Tel ' + rest + ' bij ' + tien + '.' });
    return { stappen:st, beeld:function(n){ return tk.rooster(['10', S(m - 10)], [S(a)], [[n >= 1 ? tien : '', n >= 2 ? rest : '']]); } };
  }

  /* ---------- keer buiten de tafels: de manieren als losse stappen ---------- */
  function mSplitsKeer(a, b){   /* a × b, a één cijfer */
    var t = b - b % 10, e = b % 10, p1 = a * t, p2 = a * e;
    return { stappen:[
      { tekst:'Splits ' + b + ': ' + b + ' = ' + t + ' + …', antwoord:S(e), hint:b + ' is ' + (t / 10) + ' tientallen en nog wat eenheden.' },
      { tekst:a + ' × ' + t + ' =', antwoord:S(p1), hint:'Eerst ' + a + ' × ' + (t / 10) + ' = ' + (a * t / 10) + ', dan een nul erachter.', fout:F(p1, [[a * t / 10, 'Vergeet de nul niet: het is ' + a + ' × ' + t + ', niet ' + a + ' × ' + (t / 10) + '.']]) },
      { tekst:a + ' × ' + e + ' =', antwoord:S(p2), hint:'De tafel van ' + a + '.' },
      { tekst:'Samen: ' + p1 + ' + ' + p2 + ' =', antwoord:S(a * b), hint:'Tel de twee stukken op.' } ],
      beeld:function(n){ return tk.rooster([S(t), S(e)], [S(a)], [[n >= 2 ? p1 : '', n >= 3 ? p2 : '']]); } };
  }
  function mHokjes(a, b, kort){   /* a × b, allebei twee cijfers */
    var at = a - a % 10, ae = a % 10, bt = b - b % 10, be = b % 10;
    var c = [[at * bt, at * be], [ae * bt, ae * be]], uit = a * b;
    function vak(n, k){ var v = [['', ''], ['', '']], vol = kort ? [[1, 1], [1, 1]] : null;
      if (kort){ if (n >= 1){ v[0] = [c[0][0], c[0][1]]; } if (n >= 2){ v[1] = [c[1][0], c[1][1]]; } }
      else { var i = 0; for (var r = 0; r < 2; r++) for (var q = 0; q < 2; q++){ if (n > i) v[r][q] = c[r][q]; i++; } }
      return v; }
    var st;
    if (kort) st = [
      { tekst:'Bovenste rij: ' + at + ' × ' + bt + ' + ' + at + ' × ' + be + ' = ' + c[0][0] + ' + ' + c[0][1] + ' =', antwoord:S(c[0][0] + c[0][1]), hint:at + ' × ' + b + ' in twee stukken.' },
      { tekst:'Onderste rij: ' + ae + ' × ' + bt + ' + ' + ae + ' × ' + be + ' = ' + c[1][0] + ' + ' + c[1][1] + ' =', antwoord:S(c[1][0] + c[1][1]), hint:ae + ' × ' + b + ' in twee stukken.' },
      { tekst:'Samen: ' + (c[0][0] + c[0][1]) + ' + ' + (c[1][0] + c[1][1]) + ' =', antwoord:S(uit), hint:'Tel de twee rijen op.' } ];
    else st = [
      { tekst:at + ' × ' + bt + ' =', antwoord:S(c[0][0]), hint:(at / 10) + ' × ' + (bt / 10) + ' = ' + (at * bt / 100) + ', en dan twee ' + NUL + ' erachter.', fout:F(c[0][0], [[at * bt / 10, 'Er moeten twee ' + NUL + ' achter: een van ' + at + ' en een van ' + bt + '.']]) },
      { tekst:at + ' × ' + be + ' =', antwoord:S(c[0][1]), hint:(at / 10) + ' × ' + be + ' = ' + (at / 10 * be) + ', en dan een nul erachter.' },
      { tekst:ae + ' × ' + bt + ' =', antwoord:S(c[1][0]), hint:ae + ' × ' + (bt / 10) + ' = ' + (ae * bt / 10) + ', en dan een nul erachter.' },
      { tekst:ae + ' × ' + be + ' =', antwoord:S(c[1][1]), hint:'De tafel van ' + ae + '.' },
      { tekst:'Tel alle hokjes op: ' + c[0][0] + ' + ' + c[0][1] + ' + ' + c[1][0] + ' + ' + c[1][1] + ' =', antwoord:S(uit), hint:'Eerst de grote getallen, dan de kleine erbij.' } ];
    return { stappen:st, beeld:function(n){ return tk.rooster([S(bt), S(be)], [S(at), S(ae)], vak(n)); } };
  }
  function mCompenseer(a, b){   /* b = rond − d */
    var rond = Math.ceil(b / 10) * 10, d = rond - b, groot = a * rond, eraf = a * d, uit = a * b;
    return { stappen:[
      { tekst:b + ' is bijna een rond getal. Welk?', antwoord:S(rond), hint:'Welk tiental ligt vlak boven ' + b + '?' },
      { tekst:a + ' × ' + rond + ' =', antwoord:S(groot), hint:a + ' × ' + (rond / 10) + ' = ' + (a * rond / 10) + ', en dan een nul erachter.' },
      { tekst:'Je nam ' + (d === 1 ? 'één keer ' + a : d + ' keer ' + a) + ' te veel. Hoeveel is dat?', antwoord:S(eraf), hint:'Je rekende met ' + rond + ' in plaats van ' + b + ': dat is ' + d + ' te veel, ' + a + ' keer.', fout:F(eraf, [[d, 'Je nam ' + d + ' te veel, maar wel ' + a + ' keer. Dat is ' + d + ' × ' + a + '.']]) },
      { tekst:'Haal het eraf: ' + groot + ' ' + MIN + ' ' + eraf + ' =', antwoord:S(uit), hint:'Spring van ' + groot + ' terug met ' + eraf + '.', fout:F(uit, [[groot - d, 'Je haalde er ' + d + ' af. Haal er ' + eraf + ' af.']]) } ],
      beeld:function(n){ return tk.rooster([n >= 1 ? S(rond) : '?', n >= 1 ? MIN + d : ''], [S(a)], [[n >= 2 ? groot : '', n >= 3 ? MIN + eraf : '']]); } };
  }
  function mVerdubbelHalveer(a, b){   /* a × b: a verdubbelen, b halveren, tot een rond getal */
    var paren = [[a, b]], x = a, y = b;
    while ((x % 10 !== 0 || x === 50) && y % 2 === 0){ x *= 2; y /= 2; paren.push([x, y]); }
    var st = [];
    for (var i = 1; i < paren.length; i++){
      var p = paren[i - 1], q = paren[i];
      st.push({ tekst:(i === 1 ? 'Verdubbel ' + p[0] + ' en halveer ' + p[1] + ': ' : 'Nog een keer: ') + q[0] + ' × …', antwoord:S(q[1]), hint:'De helft van ' + p[1] + '.', fout:F(q[1], [[p[1] * 2, 'Het getal dat je verdubbelt is ' + p[0] + '. Het andere getal halveer je.']]) });
    }
    st.push({ tekst:'Reken uit: ' + x + ' × ' + y + ' =', antwoord:S(a * b), hint:x === 100 ? 'Zet twee ' + NUL + ' achter ' + y + '.' : 'Eerst ' + (x / 10) + ' × ' + y + ' = ' + (x / 10 * y) + ', dan een nul erachter.' });
    return { stappen:st, beeld:function(n){ var r = paren.map(function(p, i){ return [i <= n ? S(p[0]) : '', '×', i <= n ? S(p[1]) : '', i === paren.length - 1 && n >= st.length ? '= ' + (a * b) : '']; }); return regels(r, Math.min(paren.length, n + 1)); } };
  }
  function m25(b){
    var h = 100 * b, h2 = h / 2, uit = 25 * b;
    return { stappen:[
      { tekst:'Eerst 100 keer: 100 × ' + b + ' =', antwoord:S(h), hint:'Zet twee ' + NUL + ' achter ' + b + '.' },
      { tekst:'25 is een kwart van 100. Halveer: ' + h + ' : 2 =', antwoord:S(h2), hint:'De helft van ' + h + '.' },
      { tekst:'En nog een keer halveren: ' + h2 + ' : 2 =', antwoord:S(uit), hint:'De helft van ' + h2 + '.', fout:F(uit, [[h2, 'Je moet twee keer halveren: delen door 4.']]) } ],
      beeld:function(n){ return tk.tabel([['× 100', ': 2', ': 2'], [n >= 1 ? h : '?', n >= 2 ? h2 : '?', n >= 3 ? uit : '?']], { kop:true, pijlen:[{ van:0, naar:1, tekst:'helft' }, { van:1, naar:2, tekst:'helft' }] }); } };
  }
  function m50(b){
    var h = 100 * b, uit = 50 * b;
    return { stappen:[
      { tekst:'Eerst 100 keer: 100 × ' + b + ' =', antwoord:S(h), hint:'Zet twee ' + NUL + ' achter ' + b + '.' },
      { tekst:'50 is de helft van 100. Halveer: ' + h + ' : 2 =', antwoord:S(uit), hint:'De helft van ' + (h - h % 1000) + ' is ' + ((h - h % 1000) / 2) + (h % 1000 ? ', de helft van ' + (h % 1000) + ' is ' + (h % 1000 / 2) + '.' : '.'), fout:F(uit, [[h * 2, 'Je verdubbelde. Je moet halveren.']]) } ],
      beeld:function(n){ return tk.tabel([['× 100', '× 50'], [n >= 1 ? h : '?', n >= 2 ? uit : '?']], { kop:true, pijlen:[{ van:0, naar:1, tekst:'helft' }] }); } };
  }
  function mNullenKeer(a, za, b, zb){   /* (a met za nullen) × (b met zb nullen) */
    var A = a * Math.pow(10, za), B = b * Math.pow(10, zb), z = za + zb, uit = A * B;
    return { vraag:toon(A) + ' × ' + toon(B), stappen:[
      { tekst:'Eerst de tafel, zonder de ' + NUL + ': ' + a + ' × ' + b + ' =', antwoord:S(a * b), hint:'De tafel van ' + a + '.' },
      { tekst:'Hoeveel ' + NUL + ' tel je samen bij ' + toon(A) + ' en ' + toon(B) + '?', antwoord:S(z), hint:toon(A) + ' heeft er ' + za + ', ' + toon(B) + ' heeft er ' + zb + '.' },
      { tekst:'Zet ze achter ' + (a * b) + ': ' + toon(A) + ' × ' + toon(B) + ' =', antwoord:S(uit), hint:'Zet ' + z + ' ' + (z === 1 ? 'nul' : NUL) + ' achter ' + (a * b) + '.', fout:F(uit, [[uit / 10, 'Eén nul te weinig. Tel de ' + NUL + ' van allebei de getallen.'], [uit * 10, 'Eén nul te veel.']]) } ],
      beeld:function(n){ return tk.tabel([['de tafel', NUL, 'samen'], [n >= 1 ? a + ' × ' + b + ' = ' + (a * b) : '?', n >= 2 ? S(z) : '?', n >= 3 ? toon(uit) : '?']], { kop:true }); } };
  }

  /* ---------- delen buiten de tafels: de manieren als losse stappen ---------- */
  function mSplitsDeel(d, q){   /* (d × q) : d, q = 10a + b */
    var T = d * q, a10 = q - q % 10, b = q % 10, s1 = d * a10, s2 = d * b;
    return { stappen:[
      { tekst:'Splits ' + T + ' in stukken die je makkelijk door ' + d + ' deelt: ' + T + ' = ' + s1 + ' + …', antwoord:S(s2), hint:T + ' ' + MIN + ' ' + s1 + '.' },
      { tekst:s1 + ' : ' + d + ' =', antwoord:S(a10), hint:(s1 / 10) + ' : ' + d + ' = ' + (a10 / 10) + ', en dan een nul erachter.' },
      { tekst:s2 + ' : ' + d + ' =', antwoord:S(b), hint:'Welk getal maal ' + d + ' is ' + s2 + '?' },
      { tekst:'Samen: ' + a10 + ' + ' + b + ' =', antwoord:S(q), hint:'Tel de twee uitkomsten op.' } ],
      beeld:function(n){ return tk.splits(T, s1, n >= 1 ? s2 : '?', { vraag:n >= 1 ? '' : 'r' }) + (n >= 3 ? '<p class="getal" style="text-align:center;margin:6px 0 0">' + schoon(a10 + ' + ' + b + ' = ' + (n >= 4 ? q : '?')) + '</p>' : ''); } };
  }
  function mNullenDeel(t, d, k){   /* (t × d × 10^k) : d */
    var P = t * d, T = P * Math.pow(10, k), uit = t * Math.pow(10, k);
    return { vraag:toon(T) + ' : ' + d, stappen:[
      { tekst:'Laat de ' + (k === 1 ? 'nul' : k + ' ' + NUL) + ' van ' + toon(T) + ' even weg: ' + P + ' : ' + d + ' =', antwoord:S(t), hint:'Welk getal maal ' + d + ' is ' + P + '?' },
      { tekst:'Zet de ' + (k === 1 ? 'nul' : k + ' ' + NUL) + ' er weer achter: ' + toon(T) + ' : ' + d + ' =', antwoord:S(uit), hint:'Zet ' + k + ' ' + (k === 1 ? 'nul' : NUL) + ' achter ' + t + '.', fout:F(uit, [[t, 'Je vergat de ' + NUL + ' terug te zetten.']]) } ],
      beeld:function(n){ return tk.tabel([['zonder ' + NUL, 'met ' + NUL], [n >= 1 ? P + ' : ' + d + ' = ' + t : P + ' : ' + d, n >= 2 ? toon(T) + ' : ' + d + ' = ' + toon(uit) : toon(T) + ' : ' + d]], { kop:true }); } };
  }
  function mHap(d, q){   /* (d × q) : d met happen; q = 10a + b */
    var T = d * q, a10 = q - q % 10, b = q % 10, h1 = a10 * d, rest = T - h1, h2 = b * d;
    return { stappen:[
      { tekst:'Neem een grote hap: ' + a10 + ' × ' + d + ' =', antwoord:S(h1), hint:'10 × ' + d + ' = ' + (10 * d) + (a10 > 10 ? ', dus ' + a10 + ' × ' + d + ' is ' + (a10 / 10) + ' keer zoveel.' : '.') },
      { tekst:'Wat blijft er over? ' + T + ' ' + MIN + ' ' + h1 + ' =', antwoord:S(rest), hint:'Haal ' + h1 + ' van ' + T + ' af.' },
      { tekst:'Hoe vaak past ' + d + ' nog in ' + rest + '? … × ' + d + ' = ' + rest, antwoord:S(b), hint:'Kijk in je tabel van happen: 1 × ' + d + ' = ' + d + ', 2 × ' + d + ' = ' + (2 * d) + ', 5 × ' + d + ' = ' + (5 * d) + '.' },
      { tekst:'Tel de happen op: ' + a10 + ' + ' + b + ' =', antwoord:S(q), hint:'Je nam eerst ' + a10 + ' keer ' + d + ' en daarna ' + b + ' keer.', fout:F(q, [[b, 'Tel ook de grote hap mee.']]) } ],
      beeld:function(n){
        var happen = tk.tabel([['happen', '1 ×', '2 ×', '5 ×', '10 ×'], [S(d), d, 2 * d, 5 * d, 10 * d]], { kop:true, zijkop:true });
        var w = [['hap', 'eraf', 'over'], ['', '', S(T)]];
        if (n >= 1) w.push([a10 + ' ×', S(h1), n >= 2 ? S(rest) : '?']);
        if (n >= 3) w.push([b + ' ×', S(h2), '0']);
        if (n >= 4) w.push(['samen ' + q + ' ×', '', '']);
        return flex(happen, tk.tabel(w, { kop:true, nadruk:n >= 4 ? [[w.length - 1, 0]] : [] }));
      } };
  }
  function mGelijk(d, q){   /* (d × q) : d door beide te halveren (d even) of te verdubbelen (d eindigt op 5) */
    var T = d * q, st, r;
    if (d % 2 === 0){
      r = [[S(T), ':', S(d)], [S(T / 2), ':', S(d / 2)]];
      st = [
        { tekst:'Halveer ' + T + ':', antwoord:S(T / 2), hint:'De helft van ' + T + '.' },
        { tekst:'Halveer ook ' + d + ':', antwoord:S(d / 2), hint:'De helft van ' + d + '.', fout:F(d / 2, [[d, 'Je moet allebei de getallen halveren.']]) },
        { tekst:'Reken uit: ' + (T / 2) + ' : ' + (d / 2) + ' =', antwoord:S(q), hint:'Welk getal maal ' + (d / 2) + ' is ' + (T / 2) + '?' } ];
    } else {
      r = [[S(T), ':', S(d)], [S(2 * T), ':', S(2 * d)], [S(2 * T / 10), ':', S(2 * d / 10)]];
      st = [
        { tekst:'Verdubbel ' + T + ':', antwoord:S(2 * T), hint:T + ' + ' + T + '.' },
        { tekst:'Verdubbel ook ' + d + ':', antwoord:S(2 * d), hint:d + ' + ' + d + '. Dat wordt een rond getal.' },
        { tekst:'Streep bij allebei een nul weg en reken uit: ' + (2 * T / 10) + ' : ' + (2 * d / 10) + ' =', antwoord:S(q), hint:'Welk getal maal ' + (2 * d / 10) + ' is ' + (2 * T / 10) + '?' } ];
    }
    return { stappen:st, beeld:function(n){
      var zicht = d % 2 === 0 ? (n >= 2 ? 2 : 1) : (n >= 3 ? 3 : n >= 2 ? 2 : 1);
      var rr = r.slice(0, zicht).map(function(x){ return x.concat(['']); });
      if (n >= st.length) rr[rr.length - 1][3] = '= ' + q;
      return tk.tabel(rr, {}); } };
  }

  /* ---------- verhaaltjes ---------- */
  var GROEP = [['schalen', 'appels'], ['doosjes', 'eieren'], ['bordjes', 'koekjes'], ['zakjes', 'knikkers'], ['vazen', 'bloemen'], ['teams', 'spelers'], ['rijen', 'stoelen']];
  var VERDEEL = [['snoepjes', 'kinderen'], ['kaarten', 'spelers'], ['knikkers', 'vrienden'], ['stickers', 'leerlingen'], ['punten', 'teams'], ['pennen', 'groepjes']];
  var NAMEN = ['Sam', 'Noor', 'Daan', 'Aya', 'Milan', 'Lina', 'Finn', 'Sara', 'Yusuf', 'Emma'];
  var REST = [
    { boven:true, d:[3, 4, 5], ctx:function(T, d){ return T + ' leerlingen gaan met de auto naar het museum. In een auto passen ' + d + ' leerlingen.'; }, vraag:'Hoeveel auto\'s zijn er nodig?',
      ja:function(r){ return 'Naar boven: ' + (r === 1 ? 'de laatste leerling moet' : 'de laatste ' + r + ' leerlingen moeten') + ' ook mee, dus nog een auto'; },
      nee:function(r){ return 'Naar beneden: ' + (r === 1 ? 'de laatste leerling telt' : 'de laatste ' + r + ' leerlingen tellen') + ' niet mee'; } },
    { boven:true, d:[6, 4, 8], ctx:function(T, d){ return 'Je doet ' + T + ' eieren in doosjes van ' + d + '. Alle eieren moeten in een doosje.'; }, vraag:'Hoeveel doosjes heb je nodig?',
      ja:function(r){ return 'Naar boven: voor de laatste ' + (r === 1 ? 'ei' : r + ' eieren') + ' heb je nog een doosje nodig'; },
      nee:function(r){ return 'Naar beneden: ' + (r === 1 ? 'het laatste ei telt' : 'de laatste ' + r + ' eieren tellen') + ' niet mee'; } },
    { boven:true, d:[4, 6, 8], ctx:function(T, d){ return T + ' gasten komen eten. Aan een tafel passen ' + d + ' gasten.'; }, vraag:'Hoeveel tafels zijn er nodig?',
      ja:function(r){ return 'Naar boven: ' + (r === 1 ? 'de laatste gast heeft' : 'de laatste ' + r + ' gasten hebben') + ' ook een tafel nodig'; },
      nee:function(r){ return 'Naar beneden: ' + (r === 1 ? 'de laatste gast telt' : 'de laatste ' + r + ' gasten tellen') + ' niet mee'; } },
    { boven:false, d:[3, 4, 6, 7, 8, 9], ctx:function(T, d){ return 'Je hebt € ' + T + '. Een kaartje kost € ' + d + '.'; }, vraag:'Hoeveel kaartjes kun je kopen?',
      ja:function(r){ return 'Naar boven: van de rest koop je nog een kaartje'; },
      nee:function(r){ return 'Naar beneden: voor € ' + r + ' kun je geen kaartje meer kopen'; } },
    { boven:false, d:[5, 6, 7, 8, 9], ctx:function(T, d){ return 'Je hebt ' + T + ' knikkers. In een zakje gaan er ' + d + '.'; }, vraag:'Hoeveel volle zakjes kun je maken?',
      ja:function(r){ return 'Naar boven: de rest is ook een vol zakje'; },
      nee:function(r){ return 'Naar beneden: met ' + r + ' ' + (r === 1 ? 'knikker' : 'knikkers') + ' is een zakje niet vol'; } },
    { boven:false, d:[3, 4, 6, 7], ctx:function(T, d){ return 'Een lint is ' + T + ' meter lang. Je knipt er stukken van ' + d + ' meter van.'; }, vraag:'Hoeveel hele stukken krijg je?',
      ja:function(r){ return 'Naar boven: het stukje dat over is, telt ook als heel stuk'; },
      nee:function(r){ return 'Naar beneden: een stukje van ' + r + ' meter is geen heel stuk'; } }
  ];

  /* ============================================================ */
  LEERROUTE.voeg('rekenen', [

    /* ---------------- 1. wat keer is ---------------- */
    { groep:{ id:'keer-begrip', niveau:'basis', domein:'getallen', naam:'Wat keer is', uit:'Keer is een korte manier van optellen. Hier zie je wat een keersom betekent: groepjes, een rooster en sprongen. Dan snap je ook waarom de trucjes werken.' },
      doelen:[
        { id:'keer-herhaald', naam:'Keer is herhaald optellen', kort:'4 × 6 betekent: tel 4 keer 6 op',
          uit:'<p>Een keersom is een <b>herhaalde optelsom</b>. Het eerste getal zegt hoe vaak. Het tweede getal tel je steeds op.</p><p>Voorbeeld: 4 × 6 = 6 + 6 + 6 + 6 = 24.</p><p>Elke rij stippen is één keer 6. Tel rij voor rij verder.</p>',
          wanneer:'je een keersom nog niet uit je hoofd weet en wilt snappen wat hij betekent.',
          maak:function(R){
            var a = R.heel(3, 5), b = R.heel(3, 9), st = [];
            st.push({ tekst:a + ' × ' + b + ' betekent: ' + a + ' keer het getal …', antwoord:S(b), hint:'Het eerste getal (' + a + ') zegt hoe vaak. Het tweede getal tel je steeds op.', fout:F(b, [[a, 'Dat is hoe vaak je optelt. Welk getal tel je steeds op?']]) });
            for (var k = 2; k <= a; k++){
              var voor = (k - 1) * b, na = k * b;
              st.push({ tekst:(k === 2 ? b + ' + ' + b : 'Nog een ' + b + ' erbij: ' + voor + ' + ' + b) + ' =', antwoord:S(na), hint:k === 2 ? 'Het dubbele van ' + b + '.' : 'Tel ' + b + ' verder vanaf ' + voor + '.' });
            }
            return { vraag:a + ' × ' + b,
              beeld:function(n){ var r = []; for (var i = 0; i < a; i++) r.push(i < n ? S((i + 1) * b) : ''); return stippen(a, b, { rijVak:true, kleur:function(rr){ return rr < n ? (rr % 2 ? 2 : 1) : 0; }, rechts:r, aria:a + ' rijen van ' + b + ' stippen' }); },
              stappen:st };
          } },
        { id:'keer-groepjes', naam:'Keer als groepjes', kort:'Zoveel groepjes, met in elk groepje evenveel',
          uit:'<p>Bij een keersom heb je <b>groepjes</b> die allemaal even groot zijn. Het eerste getal is het aantal groepjes. Het tweede getal is hoeveel er in elk groepje zit.</p><p>Voorbeeld: 3 schalen met elk 5 appels is 3 × 5 = 15 appels.</p>',
          wanneer:'een verhaaltje gaat over groepjes die even groot zijn.',
          maak:function(R){
            var a = R.heel(2, 6), b = R.heel(3, 9), g = R.kies(GROEP);
            return { vraag:a + ' × ' + b, context:'Er zijn ' + a + ' ' + g[0] + ' met elk ' + b + ' ' + g[1] + '. Hoeveel ' + g[1] + ' zijn er samen?',
              beeld:function(n){ return groepjes(a, b, { tel:n >= 2, licht:n === 1 }); },
              stappen:[
                { tekst:'Hoeveel groepjes (' + g[0] + ') zijn er?', antwoord:S(a), hint:'Tel de ' + g[0] + '.', fout:F(a, [[b, 'Dat is hoeveel er in één groepje zit.']]) },
                { tekst:'Hoeveel ' + g[1] + ' zitten er in elk groepje?', antwoord:S(b), hint:'Kijk in één groepje.', fout:F(b, [[a, 'Dat is het aantal groepjes.']]) },
                { tekst:'Samen: ' + a + ' × ' + b + ' =', antwoord:S(a * b), hint:'Tel ' + a + ' keer ' + b + ': ' + b + ', ' + (2 * b) + ', …' } ] };
          } },
        { id:'keer-rooster', naam:'Keer als rooster', kort:'Rijen met evenveel stippen: rijen keer stippen per rij',
          uit:'<p>Zet je groepjes onder elkaar, dan krijg je een <b>rooster</b>: rijen met in elke rij evenveel stippen. Een rooster is een rechthoek.</p><p>Je hoeft dan niet een voor een te tellen. Het aantal rijen keer het aantal stippen in een rij is alles samen.</p>',
          wanneer:'je dingen in rijen ziet staan, zoals stoelen, tegels of eieren in een doos.',
          maak:function(R){
            var a = R.heel(3, 9), b = R.heel(3, 9);
            var bld = function(n){ return stippen(a, b, { kleur:function(r, k){ return n >= 2 && k === 0 ? 2 : n >= 1 && r === 0 ? 2 : 1; } }); };
            return { vraag:a + ' × ' + b, context:'Het rooster hoort bij deze som. Hoeveel stippen zijn het samen? Tel ze niet een voor een.',
              beeld:bld, zelfBeeld:function(){ return bld(0); },
              stappen:[
                { tekst:'Hoeveel stippen staan er in één rij?', antwoord:S(b), hint:'Tel de stippen van de bovenste rij, van links naar rechts.' },
                { tekst:'Hoeveel rijen zijn er?', antwoord:S(a), hint:'Tel de stippen in de eerste kolom, van boven naar beneden.' },
                { tekst:a + ' rijen van ' + b + ': ' + a + ' × ' + b + ' =', antwoord:S(a * b), hint:'Tel per rij verder: ' + b + ', ' + (2 * b) + ', ' + (3 * b) + ', …' } ] };
          } },
        { id:'keer-wisselen', naam:'Wisselen mag', kort:'3 × 8 is evenveel als 8 × 3: kies de handigste kant',
          uit:'<p>Bij keer mag je de getallen <b>wisselen</b>. 8 × 3 is evenveel als 3 × 8.</p><p>Draai het rooster een kwart slag: de rijen worden kolommen, maar het aantal stippen blijft hetzelfde.</p><p>Kies dus de kant die het makkelijkst is: 3 × 8 = 8 + 8 + 8 is sneller dan 3 + 3 + 3 + 3 + 3 + 3 + 3 + 3.</p>',
          wanneer:'het eerste getal groot is en het tweede klein, zoals 8 × 3.',
          maak:function(R){
            var a = R.heel(5, 9), b = R.kies([2, 3, 4]), som = [], i;
            for (i = 0; i < b; i++) som.push(a);
            return { vraag:a + ' × ' + b,
              beeld:function(n){ return n >= 1 ? stippen(b, a, { kleur:function(r){ return r % 2 ? 2 : 1; }, aria:b + ' rijen van ' + a }) : stippen(a, b, { kleur:function(){ return 1; }, aria:a + ' rijen van ' + b }); },
              stappen:[
                { tekst:'Wissel om: ' + a + ' × ' + b + ' = ' + b + ' × …', antwoord:S(a), hint:'Bij keer mag je de getallen omdraaien.', fout:F(a, [[b, 'Zet de twee getallen om: ' + b + ' komt voorop.']]) },
                { tekst:b + ' × ' + a + ' = ' + som.join(' + ') + ' =', antwoord:S(a * b), hint:'Tel ' + b + ' keer ' + a + ': ' + a + ', ' + (2 * a) + ', …' } ] };
          } },
        { id:'keer-lijn', naam:'Keer op de getallenlijn', kort:'Spring vanaf 0 steeds even ver',
          uit:'<p>Op de getallenlijn is een keersom een rij <b>sprongen van gelijke grootte</b>. Je begint bij 0.</p><p>Voorbeeld: 4 × 6 is 4 sprongen van 6: 6, 12, 18, 24.</p><p>Het eerste getal is hoeveel sprongen. Het tweede getal is hoe groot elke sprong is.</p>',
          wanneer:'je de tafel wilt opzeggen door in sprongen te tellen.',
          maak:function(R){
            var a = R.heel(2, 6), b = R.heel(2, 9), lab = [];
            for (var i = 0; i <= a; i++) lab.push(i * b);
            return { vraag:a + ' × ' + b, context:'Reken het uit met sprongen op de getallenlijn.',
              beeld:function(n){ var sp = [], tot = n >= 3 ? a : n >= 1 ? 1 : 0; for (var i = 0; i < tot; i++) sp.push({ van:i * b, naar:(i + 1) * b, tekst:'+' + b, kleur:i % 2 }); return tk.lijn({ van:0, tot:a * b, labels:lab, sprongen:sp, stip:[0], nieuw:true }); },
              stappen:[
                { tekst:'Hoe groot is elke sprong?', antwoord:S(b), hint:'Het tweede getal zegt hoe groot een sprong is.', fout:F(b, [[a, 'Dat is het aantal sprongen.']]) },
                { tekst:'Hoeveel sprongen maak je?', antwoord:S(a), hint:'Het eerste getal zegt hoe vaak je springt.', fout:F(a, [[b, 'Dat is de grootte van een sprong.']]) },
                { tekst:'Waar kom je uit? ' + a + ' × ' + b + ' =', antwoord:S(a * b), hint:'Tel in sprongen van ' + b + ': ' + lab.slice(1, 3).join(', ') + ', …' } ] };
          } }
      ] },

    /* ---------------- 2. de tafels met trucjes ---------------- */
    { groep:{ id:'tafel-trucs', niveau:'basis', domein:'getallen', naam:'De tafels met trucjes', uit:'Ken je de tafels van 1, 2, 5 en 10, dan vind je de rest met een trucje: verdubbelen, de helft van 10 keer, of 10 keer min een beetje.' },
      doelen:[
        { id:'tafel-basis', naam:'De tafels van 1, 2, 5 en 10', kort:'De basis: blijft gelijk, verdubbelen, tellen per 5, een nul erachter',
          uit:'<p>Vier tafels zijn de <b>basis</b>. Daarmee maak je straks alle andere.</p><p>× 1: het getal blijft hetzelfde. × 2: verdubbelen. × 5: tellen in sprongen van 5 (5, 10, 15, …). × 10: een nul erachter.</p>',
          wanneer:'je een som uit de tafel van 1, 2, 5 of 10 hebt.',
          maak:function(R){
            var t = R.kies([1, 2, 5, 10]), a = R.heel(2, 10), uit = a * t;
            var REG = { 1:'× 1: het getal blijft hetzelfde', 2:'× 2: verdubbelen', 5:'× 5: tellen in sprongen van 5', 10:'× 10: een nul erachter' };
            var ander = [1, 2, 5, 10].filter(function(x){ return x !== t; }).map(function(x){ return REG[x]; });
            var tw = t === 1 ? a + ' × 1 =' : t === 2 ? 'Verdubbel ' + a + ': ' + a + ' + ' + a + ' =' : t === 5 ? 'Tel in sprongen van 5 en stop na ' + a + ' sprongen: ' + a + ' × 5 =' : 'Zet een nul achter ' + a + ': ' + a + ' × 10 =';
            var lab = []; for (var i = 0; i <= a; i++) lab.push(i * t);
            return { vraag:a + ' × ' + t,
              beeld:function(n){ var sp = []; if (n >= 2) for (var i = 0; i < a; i++) sp.push({ van:i * t, naar:(i + 1) * t, tekst:i === 0 ? '+' + t : '', kleur:i % 2 }); return tk.lijn({ van:0, tot:a * t, labels:t === 1 || t === 2 ? null : lab, sprongen:sp, stip:[0] }); },
              stappen:[
                kiesStap(R, 'Welke regel hoort bij deze som?', REG[t], ander, 'Kijk naar het getal ' + t + ' in de som.'),
                { tekst:tw, antwoord:S(uit), hint:t === 5 ? 'Tel per 5: ' + reeks(5, a) + ' Stop na ' + a + ' sprongen.' : t === 10 ? a + ' wordt ' + a + '0.' : t === 2 ? 'Het dubbele van ' + a + '.' : 'Eén keer ' + a + ' is gewoon ' + a + '.' } ] };
          } },
        { id:'tafel-x2', naam:'× 2 is verdubbelen', kort:'2 keer een getal is dat getal plus zichzelf',
          uit:'<p>Keer 2 is <b>verdubbelen</b>: 2 × 7 = 7 + 7 = 14.</p><p>Bij een groter getal verdubbel je de tientallen en de eenheden apart. 2 × 34: het dubbele van 30 is 60, het dubbele van 4 is 8. Samen 68.</p>',
          wanneer:'je een getal 2 keer moet nemen, ook bij grotere getallen.',
          maak:function(R){
            var t = R.heel(1, 4) * 10, e = R.heel(1, 9), a = t + e;
            return { vraag:'2 × ' + a,
              beeld:function(n){ return flex(tk.splits(a, t, e), tk.tabel([['', S(t), S(e)], ['dubbel', n >= 1 ? S(2 * t) : '?', n >= 2 ? S(2 * e) : '?']], { zijkop:true })); },
              stappen:[
                { tekst:'Verdubbel de tientallen: 2 × ' + t + ' =', antwoord:S(2 * t), hint:t + ' + ' + t + '.' },
                { tekst:'Verdubbel de eenheden: 2 × ' + e + ' =', antwoord:S(2 * e), hint:e + ' + ' + e + '.' },
                { tekst:'Samen: ' + (2 * t) + ' + ' + (2 * e) + ' =', antwoord:S(2 * a), hint:'Tel de twee dubbelen op.' } ] };
          } },
        { id:'tafel-x4', naam:'× 4 is twee keer verdubbelen', kort:'Verdubbel, en verdubbel dan nog een keer',
          uit:'<p>4 is 2 × 2. Dus keer 4 is <b>twee keer verdubbelen</b>.</p><p>Voorbeeld: 4 × 7. Het dubbele van 7 is 14. Het dubbele van 14 is 28. Dus 4 × 7 = 28.</p>',
          wanneer:'je de tafel van 4 nog niet uit je hoofd weet, of bij een groter getal zoals 4 × 23.',
          maak:function(R){
            var a = R.kies(rij(3, 9).concat(rij(11, 25).filter(function(x){ return x !== 20; }))), m = mDubbel(a, 2);
            return { vraag:'4 × ' + a, beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'tafel-x8', naam:'× 8 is drie keer verdubbelen', kort:'Verdubbel drie keer achter elkaar',
          uit:'<p>8 is 2 × 2 × 2. Dus keer 8 is <b>drie keer verdubbelen</b>.</p><p>Voorbeeld: 8 × 6. Het dubbele van 6 is 12, dan 24, dan 48. Dus 8 × 6 = 48.</p>',
          wanneer:'je een som uit de tafel van 8 hebt, zoals 8 × 7.',
          maak:function(R){
            var a = R.kies(rij(3, 9).concat(rij(11, 15))), m = mDubbel(a, 3);
            return { vraag:'8 × ' + a, beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'tafel-x5', naam:'× 5 is de helft van × 10', kort:'Reken eerst 10 keer en neem dan de helft',
          uit:'<p>5 is de helft van 10. Dus keer 5 is <b>de helft van keer 10</b>.</p><p>Voorbeeld: 5 × 8. Eerst 10 × 8 = 80. De helft van 80 is 40. Dus 5 × 8 = 40.</p>',
          wanneer:'je iets keer 5 moet doen, ook bij grotere getallen zoals 5 × 16.',
          maak:function(R){
            var a = R.kies(rij(3, 9).concat(rij(11, 19))), m = mHelft(a);
            return { vraag:'5 × ' + a, beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'tafel-x9', naam:'× 9 is × 10 min één keer', kort:'Reken 10 keer en haal er één keer het getal af',
          uit:'<p>9 keer is één keer minder dan 10 keer. Dus <b>keer 9 = keer 10, min één keer</b>.</p><p>Voorbeeld: 9 × 7. Eerst 10 × 7 = 70. Haal er één keer 7 af: 70 ' + MIN + ' 7 = 63.</p><p>Let op: je haalt er niet 1 af, maar een heel groepje.</p>',
          wanneer:'je een som uit de tafel van 9 hebt.',
          maak:function(R){
            var a = R.heel(3, 9), m = mNegen(a);
            return { vraag:R.kies(['9 × ' + a, a + ' × 9']), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'tafel-x3', naam:'× 3 is × 2 plus één keer', kort:'Verdubbel en tel er het getal nog een keer bij',
          uit:'<p>3 keer is 2 keer en dan nog <b>één keer erbij</b>.</p><p>Voorbeeld: 3 × 7. Het dubbele van 7 is 14. Tel er nog 7 bij: 14 + 7 = 21.</p>',
          wanneer:'je een som uit de tafel van 3 hebt, ook bij grotere getallen zoals 3 × 14.',
          maak:function(R){
            var a = R.kies(rij(4, 9).concat(rij(11, 15))), d = 2 * a;
            return { vraag:'3 × ' + a,
              beeld:function(n){ return stippen(3, a, { kleur:function(r){ return r < 2 ? (n >= 1 ? 1 : 0) : (n >= 2 ? 2 : 0); }, splitsRij:2, rechts:[n >= 1 ? S(d) : '', '', n >= 2 ? '+' + a : ''] }); },
              stappen:[
                { tekst:'Eerst 2 keer: 2 × ' + a + ' =', antwoord:S(d), hint:'Het dubbele van ' + a + '.' },
                { tekst:'Tel er nog één keer ' + a + ' bij: ' + d + ' + ' + a + ' =', antwoord:S(3 * a), hint:'Tel ' + a + ' verder vanaf ' + d + '.', fout:F(3 * a, [[d + 1, 'Tel er niet 1 bij, maar een heel groepje van ' + a + '.']]) } ] };
          } },
        { id:'tafel-x6', naam:'× 6 is × 5 plus één keer', kort:'Reken 5 keer en tel er het getal nog een keer bij',
          uit:'<p>6 keer is 5 keer en dan nog <b>één keer erbij</b>.</p><p>Voorbeeld: 6 × 7. Eerst 5 × 7 = 35 (de helft van 70). Tel er nog 7 bij: 35 + 7 = 42.</p><p>Het kan ook anders: 6 × 7 is het dubbele van 3 × 7 = 21, dus 42.</p>',
          wanneer:'je een som uit de tafel van 6 hebt.',
          maak:function(R){
            var a = R.heel(3, 9), v = 5 * a;
            return { vraag:'6 × ' + a,
              beeld:function(n){ return stippen(6, a, { kleur:function(r){ return r < 5 ? (n >= 1 ? 1 : 0) : (n >= 2 ? 2 : 0); }, splitsRij:5, rechts:['', '', '', '', n >= 1 ? S(v) : '', n >= 2 ? '+' + a : ''] }); },
              stappen:[
                { tekst:'Eerst 5 keer: 5 × ' + a + ' =', antwoord:S(v), hint:'De helft van 10 × ' + a + ' = ' + (10 * a) + '.' },
                { tekst:'Tel er nog één keer ' + a + ' bij: ' + v + ' + ' + a + ' =', antwoord:S(6 * a), hint:'Tel ' + a + ' verder vanaf ' + v + '.', fout:F(6 * a, [[v + 1, 'Tel er niet 1 bij, maar een heel groepje van ' + a + '.']]) } ] };
          } },
        { id:'tafel-x7', naam:'× 7 is × 5 plus × 2', kort:'Splits 7 in 5 en 2 en tel de twee stukken op',
          uit:'<p>7 = 5 + 2. Dus 7 keer is 5 keer en 2 keer samen. Je <b>splitst</b> de som in twee makkelijke stukken.</p><p>Voorbeeld: 7 × 8. 5 × 8 = 40 en 2 × 8 = 16. Samen 40 + 16 = 56.</p>',
          wanneer:'je een som uit de tafel van 7 hebt.',
          maak:function(R){
            var a = R.heel(3, 9), v = 5 * a, t = 2 * a;
            return { vraag:'7 × ' + a,
              beeld:function(n){ return stippen(7, a, { kleur:function(r){ return r < 5 ? (n >= 1 ? 1 : 0) : (n >= 2 ? 2 : 0); }, splitsRij:5, rechts:['', '', '', '', n >= 1 ? S(v) : '', '', n >= 2 ? S(t) : ''] }); },
              stappen:[
                { tekst:'5 × ' + a + ' =', antwoord:S(v), hint:'De helft van 10 × ' + a + ' = ' + (10 * a) + '.' },
                { tekst:'2 × ' + a + ' =', antwoord:S(t), hint:'Het dubbele van ' + a + '.' },
                { tekst:'Samen: ' + v + ' + ' + t + ' =', antwoord:S(7 * a), hint:'Tel ' + t + ' bij ' + v + '.' } ] };
          } },
        { id:'tafel-buur', naam:'De buurtafel', kort:'Gebruik een som die je al weet en doe er één keer bij of af',
          uit:'<p>Weet je een som niet, kijk dan naar de <b>buur</b> die je wel weet.</p><p>Voorbeeld: 7 × 8. Je weet 7 × 7 = 49. 7 × 8 is één groepje van 7 meer: 49 + 7 = 56.</p><p>Het kan ook naar beneden: 6 × 4. Je weet 6 × 5 = 30. 6 × 4 is één keer 6 minder: 30 ' + MIN + ' 6 = 24.</p>',
          wanneer:'je een som net niet weet, maar de som ernaast wel.',
          maak:function(R){
            var a, k, b, kans = Math.random();
            do {
              a = R.heel(3, 9);
              k = kans < 0.5 ? a : R.kies([2, 5, 10]);
              b = k + R.kies([1, -1]);
            } while (b < 3 || b > 9 || b === k || ([2, 5, 10].indexOf(b) >= 0));
            var P = a * k, uit = a * b, op = b > k;
            return { vraag:a + ' × ' + b,
              beeld:function(n){ var kol = Math.max(b, k); return stippen(a, kol, { kleur:function(r, c){ if (n < 1) return c < Math.min(b, k) ? 1 : 0; return c < Math.min(b, k) ? 1 : 2; }, weg:function(r, c){ return !op && n >= 2 && c === kol - 1; }, splitsKol:n >= 1 ? Math.min(b, k) : 0, aria:a + ' rijen van ' + kol + ' stippen' }); },
              stappen:[
                { tekst:'Een buur die je al weet: ' + a + ' × ' + k + ' =', antwoord:S(P), hint:k === a ? 'Dat is een kwadraat: ' + a + ' keer zichzelf.' : k === 10 ? 'Zet een nul achter ' + a + '.' : k === 5 ? 'De helft van 10 × ' + a + '.' : 'Het dubbele van ' + a + '.' },
                { tekst:a + ' × ' + b + ' is één keer ' + a + ' ' + (op ? 'meer' : 'minder') + ': ' + P + ' ' + (op ? '+' : MIN) + ' ' + a + ' =', antwoord:S(uit), hint:(op ? 'Tel ' + a + ' bij ' + P + '.' : 'Haal ' + a + ' van ' + P + ' af.'),
                  fout:F(uit, [[op ? P + b : P - b, 'Je ' + (op ? 'telde ' : 'haalde ') + b + (op ? ' erbij' : ' eraf') + '. Het verschil is één groepje van ' + a + '.']]) } ] };
          } },
        { id:'tafel-kwadraat', naam:'De kwadraten', kort:'Een getal keer zichzelf: een vierkant',
          uit:'<p>Een getal keer zichzelf heet een <b>kwadraat</b>, zoals 6 × 6, 7 × 7 en 8 × 8. In een rooster zie je een vierkant.</p><p>Leer de kwadraten uit je hoofd: 36, 49, 64, 81. Weet je er een even niet, splits dan bij 5: 7 × 7 = 7 × 5 + 7 × 2 = 35 + 14 = 49.</p><p>Met een kwadraat vind je ook de buren: 7 × 8 = 49 + 7.</p>',
          wanneer:'je een getal keer zichzelf moet doen.',
          maak:function(R){
            var a = R.kies([6, 7, 8, 9, 11, 12]), v = 5 * a, r = a - 5, w = a * r;
            return { vraag:a + ' × ' + a,
              beeld:function(n){ return stippen(a, a, { kleur:function(rr, c){ return c < 5 ? (n >= 1 ? 1 : 0) : (n >= 2 ? 2 : 0); }, splitsKol:5, aria:a + ' bij ' + a + ' stippen, een vierkant' }); },
              stappen:[
                { tekst:'Splits bij 5. Eerst ' + a + ' × 5 =', antwoord:S(v), hint:'De helft van 10 × ' + a + ' = ' + (10 * a) + '.' },
                { tekst:'Dan de rest: ' + a + ' × ' + r + ' =', antwoord:S(w), hint:r === 1 ? 'Eén keer ' + a + '.' : r === 2 ? 'Het dubbele van ' + a + '.' : 'De tafel van ' + a + '.' },
                { tekst:'Samen: ' + v + ' + ' + w + ' =', antwoord:S(a * a), hint:'Tel ' + w + ' bij ' + v + '.' } ] };
          } },
        { id:'tafel-x11-12', naam:'× 11 en × 12', kort:'Reken 10 keer en tel er 1 of 2 keer bij',
          uit:'<p>11 = 10 + 1 en 12 = 10 + 2. Reken dus eerst <b>10 keer</b> en tel de rest erbij.</p><p>11 × 7 = 70 + 7 = 77. 12 × 7 = 70 + 14 = 84.</p>',
          wanneer:'je een som uit de tafel van 11 of 12 hebt.',
          maak:function(R){
            var m = R.kies([11, 12]), a = R.heel(3, 12), mm;
            if (a === 10) a = 9;
            mm = mElf(a, m);
            return { vraag:m + ' × ' + a, beeld:mm.beeld, stappen:mm.stappen };
          } },
        { id:'tafel-kies', naam:'Kies het handigste trucje', kort:'Kijk naar de som en kies het trucje dat past',
          uit:'<p>Nu ken je veel trucjes. Bij elke som kies je <b>het trucje dat het best past</b>.</p><p>Bij 8 × 7: drie keer verdubbelen (14, 28, 56). Bij 9 × 6: 10 × 6 min 6. Bij 5 × 7: de helft van 70.</p><p>Kijk dus eerst naar het getal uit de tafel: 4, 5, 8, 9 of 11?</p>',
          wanneer:'je niet meteen weet hoe je een tafelsom aanpakt.',
          maak:function(R){
            var t = R.kies([4, 8, 5, 9, 11]), a = R.kies([3, 6, 7]);
            var OPT = { 4:a + ' twee keer verdubbelen', 8:a + ' drie keer verdubbelen', 5:'de helft van 10 × ' + a, 9:'10 × ' + a + ' min ' + a, 11:'10 × ' + a + ' plus ' + a };
            var m = t === 4 ? mDubbel(a, 2) : t === 8 ? mDubbel(a, 3) : t === 5 ? mHelft(a) : t === 9 ? mNegen(a) : mElf(a, 11);
            var ander = kiesUit(R, [4, 8, 5, 9, 11].filter(function(x){ return x !== t; }).map(function(x){ return OPT[x]; }), 3);
            return { vraag:t + ' × ' + a,
              beeld:function(n){ return n >= 1 ? m.beeld(n - 1) : ''; },
              stappen:[kiesStap(R, 'Welk trucje past het best bij ' + t + ' × ' + a + '?', OPT[t], ander, 'Kijk naar ' + t + ': ' + (t === 4 ? '4 is 2 × 2.' : t === 8 ? '8 is 2 × 2 × 2.' : t === 5 ? '5 is de helft van 10.' : t === 9 ? '9 is één minder dan 10.' : '11 is één meer dan 10.'))].concat(m.stappen) };
          } }
      ] },

    /* ---------------- 3. delen ---------------- */
    { groep:{ id:'deel-tafel', niveau:'basis', domein:'getallen', naam:'Delen', uit:'Delen is eerlijk verdelen, of kijken hoe vaak iets past. Met de tafels in je hoofd reken je elke deelsom uit de tafels snel uit, ook als er iets overblijft.' },
      doelen:[
        { id:'deel-verdelen', naam:'Delen is eerlijk verdelen', kort:'Iedereen krijgt evenveel: deel rondje voor rondje uit',
          uit:'<p>Bij <b>eerlijk verdelen</b> krijgt iedereen evenveel. 24 : 4 betekent: verdeel 24 over 4. Hoeveel krijgt ieder?</p><p>Deel rondje voor rondje uit. Elk rondje krijgt ieder er 1. Na 6 rondjes is alles op. Dus ieder krijgt 6.</p>',
          wanneer:'een verhaaltje gaat over iets eerlijk verdelen over een aantal mensen.',
          maak:function(R){
            var d = R.heel(2, 6), q = R.heel(2, 9), T = d * q, v = R.kies(VERDEEL);
            return { vraag:T + ' : ' + d, context:T + ' ' + v[0] + ' worden eerlijk verdeeld over ' + d + ' ' + v[1] + '. Hoeveel krijgt ieder?',
              beeld:function(n){ return verdeel(T, d, n >= 3 ? S(q) : '?', { vol:n >= 3 }); },
              stappen:[
                { tekst:'Elk rondje krijgt ieder er 1. Hoeveel ' + v[0] + ' deel je per rondje uit?', antwoord:S(d), hint:'Er zijn ' + d + ' ' + v[1] + '. Ieder krijgt er 1.' },
                { tekst:'Hoeveel rondjes kun je doen tot alles op is? Tel in sprongen van ' + d + ' tot ' + T + '.', antwoord:S(q), hint:'Tel: ' + reeks(d, q) + ' tot je bij ' + T + ' bent. Hoeveel sprongen?' },
                { tekst:'Ieder krijgt evenveel als het aantal rondjes: ' + T + ' : ' + d + ' =', antwoord:S(q), hint:'Elk rondje kreeg ieder er 1.' } ] };
          } },
        { id:'deel-opdelen', naam:'Hoe vaak past het?', kort:'Spring terug in sprongen tot je bij 0 bent',
          uit:'<p>Delen kan ook betekenen: <b>hoe vaak past het erin</b>? 42 : 6 vraagt: hoe vaak past 6 in 42?</p><p>Op de getallenlijn spring je vanaf 42 terug in sprongen van 6. Het gaat sneller met een grote sprong: 5 sprongen van 6 is 30 in één keer. Dan blijft 12 over, daar passen nog 2 sprongen in. Samen 7.</p>',
          wanneer:'een verhaaltje vraagt hoe vaak iets past, zoals hoeveel kaartjes of hoeveel groepjes.',
          maak:function(R){
            var d = R.heel(3, 9), q = R.heel(6, 10), T = d * q, vijf = 5 * d, rest = T - vijf, kl = q - 5;
            var c = R.kies([
              { t:'Een kaartje kost € ' + d + '. Je hebt € ' + T + '. Hoeveel kaartjes kun je kopen?' },
              { t:'Een plank is ' + T + ' cm. Je zaagt stukken van ' + d + ' cm. Hoeveel stukken krijg je?' },
              { t:T + ' leerlingen gaan in groepjes van ' + d + '. Hoeveel groepjes zijn dat?' } ]);
            return { vraag:T + ' : ' + d, context:c.t,
              beeld:function(n){ var sp = []; if (n >= 1) sp.push({ van:T, naar:rest, tekst:'5 × ' + d, kleur:0 }); if (n >= 3) for (var i = 0; i < kl; i++) sp.push({ van:rest - i * d, naar:rest - (i + 1) * d, tekst:i === 0 ? MIN + d : '', kleur:1 }); return tk.lijn({ van:0, tot:T, labels:[0, T], sprongen:sp, stip:[T] }); },
              stappen:[
                { tekst:'Spring 5 sprongen van ' + d + ' tegelijk terug: 5 × ' + d + ' =', antwoord:S(vijf), hint:'De helft van 10 × ' + d + ' = ' + (10 * d) + '.' },
                { tekst:'Wat blijft er over? ' + T + ' ' + MIN + ' ' + vijf + ' =', antwoord:S(rest), hint:'Haal ' + vijf + ' van ' + T + ' af.' },
                { tekst:'Hoeveel sprongen van ' + d + ' passen er nog in ' + rest + '?', antwoord:S(kl), hint:'Tel in sprongen van ' + d + ' tot je bij ' + rest + ' bent: ' + reeks(d, kl) + '.' },
                { tekst:'Alle sprongen samen: 5 + ' + kl + ' =', antwoord:S(q), hint:'De grote sprong telt als 5 sprongen.', fout:F(q, [[kl + 1, 'De grote sprong was 5 sprongen, niet 1.']]) } ] };
          } },
        { id:'deel-omdraaien', naam:'Delen is de tafel omdraaien', kort:'56 : 8 = ? want ? × 8 = 56',
          uit:'<p>Delen is keer <b>andersom</b>. Bij 56 : 8 vraag je: welk getal maal 8 is 56?</p><p>Zeg de tafel van 8 op tot je bij 56 bent: 7 × 8 = 56. Dus 56 : 8 = 7.</p><p>Ken je de tafels goed, dan ken je dus ook alle deelsommen.</p>',
          wanneer:'je een deelsom uit de tafels hebt, zoals 42 : 7 of 72 : 9.',
          maak:function(R){
            var d = R.heel(2, 9), q = R.heel(2, 10), T = d * q, van = Math.max(1, Math.min(q - 2, 6)), kol = [];
            for (var i = van; i < van + 5; i++) kol.push(i);
            return { vraag:T + ' : ' + d,
              beeld:function(n){ return tk.tabel([kol.map(function(i){ return i + ' × ' + d; }), kol.map(function(i){ return n >= 1 ? S(i * d) : '?'; })], { kop:true, nadruk:n >= 2 ? [[0, kol.indexOf(q)], [1, kol.indexOf(q)]] : [] }); },
              stappen:[
                { tekst:'Welke tafel heb je nodig? De tafel van …', antwoord:S(d), hint:'Je deelt door ' + d + '.', fout:F(d, [[T, 'Je deelt door ' + d + '. Zeg die tafel op.']]) },
                { tekst:'Zoek in de tafel: … × ' + d + ' = ' + T, antwoord:S(q), hint:'Zeg de tafel van ' + d + ' op tot je bij ' + T + ' bent: ' + reeks(d, q) + '.' },
                { tekst:'Dus ' + T + ' : ' + d + ' =', antwoord:S(q), hint:'Het getal dat je net vond.' } ] };
          } },
        { id:'deel-rest', naam:'Delen met rest', kort:'Wat over is, is de rest: kijk in het verhaal of je naar boven of beneden gaat',
          uit:'<p>Niet elke deelsom gaat precies op. Wat overblijft heet de <b>rest</b>. 30 : 4 = 7 rest 2, want 7 × 4 = 28.</p><p>In een verhaaltje kijk je wat je met de rest doet. Moeten alle 30 kinderen mee in auto\'s van 4? Dan heb je <b>naar boven</b> 8 auto\'s nodig. Hoeveel kaartjes van € 4 koop je van € 30? <b>Naar beneden</b>: 7, de € 2 is niet genoeg.</p>',
          wanneer:'een deelsom niet precies uitkomt en het om echte dingen gaat.',
          maak:function(R){
            var v = R.kies(REST), d = R.kies(v.d), q = R.heel(3, 9), r = R.heel(1, d - 1), T = d * q + r, ant = v.boven ? q + 1 : q;
            var o = [v.ja(r), v.nee(r)], goed = v.boven ? 0 : 1;
            return { vraag:v.vraag, context:v.ctx(T, d),
              beeld:function(n){ var sp = []; if (n >= 1) for (var i = 0; i < q; i++) sp.push({ van:i * d, naar:(i + 1) * d, tekst:i === 0 ? '+' + d : '', kleur:0 }); if (n >= 2) sp.push({ van:q * d, naar:T, tekst:'rest ' + r, kleur:1 }); return tk.lijn({ van:0, tot:v.boven ? (q + 1) * d : T, labels:[0, q * d, T], sprongen:sp, stip:[T] }); },
              stappen:[
                { tekst:'Hoe vaak past ' + d + ' helemaal in ' + T + '?', antwoord:S(q), hint:'Zoek de grootste som uit de tafel van ' + d + ' die niet boven ' + T + ' komt: ' + q + ' × ' + d + ' = ' + (q * d) + '.', fout:F(q, [[q + 1, (q + 1) + ' × ' + d + ' = ' + ((q + 1) * d) + ', dat is meer dan ' + T + '.']]) },
                { tekst:'Hoeveel blijft er over? ' + T + ' ' + MIN + ' ' + (q * d) + ' =', antwoord:S(r), hint:q + ' × ' + d + ' = ' + (q * d) + '. Wat is het verschil met ' + T + '?' },
                { tekst:'Wat doe je met de rest?', opties:o, goed:goed, hint:v.boven ? 'Moet echt alles mee of erin? Dan heb je er nog een nodig.' : 'Kun je met wat over is nog een hele doen?' },
                { tekst:v.vraag, antwoord:S(ant), hint:v.boven ? 'Naar boven: ' + q + ' + 1.' : 'Naar beneden: de rest telt niet mee.', fout:v.boven ? F(ant, [[q, 'Dan blijven er ' + r + ' over zonder plek.']]) : F(ant, [[q + 1, 'Voor nog een heb je niet genoeg.']]) } ] };
          } },
        { id:'deel-halveren', naam:'Delen door 2, 4 en 8 is halveren', kort:': 2 is één keer halveren, : 4 twee keer, : 8 drie keer',
          uit:'<p>Delen door 2 is <b>halveren</b>. Delen door 4 is twee keer halveren, want 4 = 2 × 2. Delen door 8 is drie keer halveren.</p><p>Voorbeeld: 96 : 4. De helft van 96 is 48. De helft van 48 is 24. Dus 96 : 4 = 24.</p><p>Bij : 2 met een groot getal halveer je elk stuk apart: de helft van 468 is 200 + 30 + 4 = 234.</p>',
          wanneer:'je deelt door 2, 4 of 8.',
          maak:function(R){
            var soort = R.kies([2, 4, 4, 8, 8]);
            if (soort === 2){
              var H = R.kies([2, 4, 6, 8]), Tt = R.kies([2, 4, 6, 8]), E = R.kies([2, 4, 6, 8]), G = H * 100 + Tt * 10 + E, hh = [H * 50, Tt * 5, E / 2];
              return { vraag:G + ' : 2',
                beeld:function(n){ return tk.tabel([['', S(H * 100), S(Tt * 10), S(E)], ['helft', n >= 1 ? S(hh[0]) : '?', n >= 2 ? S(hh[1]) : '?', n >= 3 ? S(hh[2]) : '?']], { zijkop:true }); },
                stappen:[
                  { tekst:'De helft van ' + (H * 100) + ' =', antwoord:S(hh[0]), hint:'De helft van ' + H + ' is ' + (H / 2) + ', dus de helft van ' + (H * 100) + ' is ' + (H / 2) + '00.' },
                  { tekst:'De helft van ' + (Tt * 10) + ' =', antwoord:S(hh[1]), hint:'De helft van ' + Tt + ' is ' + (Tt / 2) + ', dus de helft van ' + (Tt * 10) + ' is ' + (Tt / 2) + '0.' },
                  { tekst:'De helft van ' + E + ' =', antwoord:S(hh[2]), hint:E + ' in twee gelijke stukken.' },
                  { tekst:'Samen: ' + hh[0] + ' + ' + hh[1] + ' + ' + hh[2] + ' =', antwoord:S(G / 2), hint:'Tel de drie helften op.' } ] };
            }
            var k = soort === 4 ? 2 : 3, q = soort === 4 ? R.heel(11, 49) : R.heel(11, 30), T = q * soort, st = [], w = [T];
            for (var i = 1; i <= k; i++){
              var voor = T / Math.pow(2, i - 1), na = voor / 2; w.push(na);
              st.push({ tekst:(i === 1 ? 'Halveer ' + T : i === 2 ? 'Halveer nog een keer' : 'En nog een keer') + ': ' + voor + ' : 2 =', antwoord:S(na), hint:'De helft van ' + voor + '. Halveer de tientallen en de eenheden apart.' });
            }
            st[st.length - 1].fout = F(q, [[T / 2, 'Bij : ' + soort + ' halveer je ' + k + ' keer.']]);
            return { vraag:T + ' : ' + soort,
              beeld:function(n){ var kop = [': 1', ': 2', ': 4', ': 8'].slice(0, k + 1), p = [], waarden = w.map(function(x, i){ return i === 0 || n >= i ? S(x) : '?'; }); for (var i = 1; i <= k; i++) p.push({ van:i - 1, naar:i, tekst:'helft' }); return tk.tabel([kop, waarden], { kop:true, pijlen:p }); },
              stappen:st };
          } },
        { id:'deel-door5', naam:'Delen door 5', kort:'Deel eerst door 10 en verdubbel dan',
          uit:'<p>5 is de helft van 10. Delen door 5 geeft dus <b>twee keer zoveel</b> als delen door 10.</p><p>Voorbeeld: 140 : 5. Eerst 140 : 10 = 14. Dan verdubbelen: 2 × 14 = 28. Dus 140 : 5 = 28.</p><p>Het kan ook andersom: eerst verdubbelen, dan delen door 10. 85 : 5 → 170 : 10 = 17.</p>',
          wanneer:'je een rond getal door 5 moet delen.',
          maak:function(R){
            var k = R.heel(7, 49), T = k * 10, uit = 2 * k;
            return { vraag:T + ' : 5',
              beeld:function(n){ return tk.tabel([[': 1', ': 10', ': 5'], [S(T), n >= 1 ? S(k) : '?', n >= 2 ? S(uit) : '?']], { kop:true, pijlen:[{ van:0, naar:1, tekst:': 10' }, { van:1, naar:2, tekst:'× 2' }] }); },
              stappen:[
                { tekst:'Eerst delen door 10: ' + T + ' : 10 =', antwoord:S(k), hint:'Haal de nul achter ' + T + ' weg.' },
                { tekst:'5 past twee keer zo vaak als 10. Verdubbel: 2 × ' + k + ' =', antwoord:S(uit), hint:k + ' + ' + k + '.', fout:F(uit, [[k / 2, 'Je halveerde. Je moet verdubbelen: 5 past vaker dan 10.']]) } ] };
          } },
        { id:'deel-door10', naam:'Delen door 10, 100 en 1000', kort:'Haal evenveel nullen weg als er in 10, 100 of 1000 staan',
          uit:'<p>Delen door 10 is: <b>een nul eraf</b>. Elk cijfer schuift een plek naar rechts. 450 : 10 = 45.</p><p>Delen door 100 is twee nullen eraf: 3700 : 100 = 37. Delen door 1000 is drie nullen eraf: 25.000 : 1000 = 25.</p>',
          wanneer:'je deelt door 10, 100 of 1000 en het getal eindigt op genoeg nullen.',
          maak:function(R){
            var d = R.kies([10, 100, 1000]), k = d === 10 ? R.heel(3, 999) : R.heel(2, 99), T = k * d, z = String(d).length - 1;
            if (k % 10 === 0) k += 1, T = k * d;
            return { vraag:toon(T) + ' : ' + toon(d),
              beeld:function(n){ return plaats([['getal', T], ['na : ' + d, n >= 2 ? k : null]]); },
              stappen:[
                { tekst:'Hoeveel ' + NUL + ' heeft ' + d + '?', antwoord:S(z), hint:'Tel de ' + NUL + ' in ' + d + '.' },
                { tekst:'Haal ' + (z === 1 ? 'een nul' : z + ' ' + NUL) + ' van ' + toon(T) + ' af: ' + toon(T) + ' : ' + toon(d) + ' =', antwoord:S(k), hint:'Haal ' + z + ' ' + (z === 1 ? 'nul' : NUL) + ' van het eind weg.', fout:F(k, [[T / 10, 'Je haalde er maar één nul af.'], [k * 10, 'Eén nul te weinig weggehaald.']]) } ] };
          } },
        { id:'deel-controle', naam:'Controleer met de omgekeerde som', kort:'Reken terug met keer: klopt het, dan kom je weer uit bij het begin',
          uit:'<p>Keer en delen zijn elkaars <b>omgekeerde</b>. Zo kun je een deelsom controleren.</p><p>Klopt 56 : 8 = 7? Reken terug: 7 × 8 = 56. Ja, dus het klopt. Kom je niet uit op 56, dan zit er een fout in.</p><p>Een keersom controleer je met delen: 6 × 7 = 42, want 42 : 7 = 6.</p>',
          wanneer:'je wilt weten of een antwoord klopt.',
          maak:function(R){
            var d = R.heel(3, 9), q = R.heel(3, 10), T = d * q, fout = Math.random() < 0.5, c = fout ? q + R.kies([-1, 1]) : q, nm = R.kies(NAMEN), P = c * d;
            return { vraag:T + ' : ' + d + ' = ' + c, context:nm + ' rekende deze som uit. Klopt het? Controleer met de omgekeerde som en geef het goede antwoord van ' + T + ' : ' + d + '.', antwoord:S(q),
              beeld:function(n){ return tk.tabel([['delen', 'terug met keer'], [T + ' : ' + d + ' = ' + c, c + ' × ' + d + ' = ' + (n >= 1 ? P : '?')]], { kop:true, nadruk:n >= 2 ? [[1, 1]] : [] }); },
              stappen:[
                { tekst:'Reken terug: ' + c + ' × ' + d + ' =', antwoord:S(P), hint:'De tafel van ' + d + '.' },
                { tekst:'Kom je uit op ' + T + '?', opties:['ja, de som klopt', 'nee, de som klopt niet'], goed:fout ? 1 : 0, hint:'Vergelijk ' + P + ' met ' + T + '.' },
                { tekst:'Het goede antwoord: ' + T + ' : ' + d + ' =', antwoord:S(q), hint:'Welk getal maal ' + d + ' is ' + T + '?', fout:fout ? F(q, [[c, 'Dat is het antwoord van ' + nm + ', en dat klopte niet.']]) : {} } ] };
          } }
      ] },

    /* ---------------- 4. keersommen buiten de tafels ---------------- */
    { groep:{ id:'keer-groot', niveau:'1F', domein:'getallen', naam:'Keersommen buiten de tafels', uit:'Grotere keersommen reken je uit met wat je al kunt: de tafels, nullen erachter, splitsen en slimme trucjes. Leer ze allemaal, dan kies je steeds de handigste.' },
      doelen:[
        { id:'keer-x10', naam:'× 10, × 100 en × 1000', kort:'Zet evenveel nullen achter het getal als er in 10, 100 of 1000 staan',
          uit:'<p>Keer 10 is: <b>een nul erachter</b>. Elk cijfer schuift een plek naar links. 45 × 10 = 450.</p><p>Keer 100 is twee nullen erachter: 45 × 100 = 4500. Keer 1000 is drie nullen erachter: 45 × 1000 = 45.000.</p>',
          wanneer:'je een getal keer 10, 100 of 1000 doet.',
          maak:function(R){
            var m = R.kies([10, 100, 1000]), a = R.kies([R.heel(2, 99), R.heel(101, 999)]), z = String(m).length - 1, uit = a * m;
            return { vraag:a + ' × ' + toon(m),
              beeld:function(n){ return plaats([['getal', a], ['× ' + m, n >= 2 ? uit : null]]); },
              stappen:[
                { tekst:'Hoeveel ' + NUL + ' heeft ' + toon(m) + '?', antwoord:S(z), hint:'Tel de ' + NUL + ' in ' + toon(m) + '.' },
                { tekst:'Zet ' + (z === 1 ? 'een nul' : z + ' ' + NUL) + ' achter ' + a + ': ' + a + ' × ' + toon(m) + ' =', antwoord:S(uit), hint:'Schrijf ' + a + ' en zet er ' + z + ' ' + (z === 1 ? 'nul' : NUL) + ' achter.', fout:F(uit, [[uit / 10, 'Eén nul te weinig.'], [uit * 10, 'Eén nul te veel.']]) } ] };
          } },
        { id:'keer-nullen', naam:'Keer met nullen', kort:'Reken eerst de tafel en zet dan alle nullen erachter',
          uit:'<p>Bij 4 × 30, 20 × 30 of 400 × 6 reken je <b>eerst de tafel</b> zonder de nullen. Daarna zet je <b>alle nullen</b> erachter.</p><p>20 × 30: eerst 2 × 3 = 6. Er staan samen twee nullen: 600.</p><p>Let op bij 50 × 40: 5 × 4 = 20, en dan nog twee nullen: 2000.</p>',
          wanneer:'een of allebei de getallen eindigen op nullen.',
          maak:function(R){
            var a = R.heel(2, 9), b = R.heel(2, 9), v = R.kies([[0, 1], [1, 1], [2, 0], [1, 2], [0, 2], [2, 1]]), m = mNullenKeer(a, v[0], b, v[1]);
            return { vraag:m.vraag, beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'keer-splitsen', naam:'Splitsen', kort:'Splits het grote getal in tientallen en eenheden en reken twee keersommen',
          uit:'<p>Bij <b>splitsen</b> haal je het grote getal uit elkaar. 6 × 24: 24 = 20 + 4.</p><p>Reken dan twee makkelijke keersommen: 6 × 20 = 120 en 6 × 4 = 24. Samen 144.</p><p>In het rooster zie je de twee stukken naast elkaar.</p>',
          wanneer:'je een getal van één cijfer keer een getal van twee cijfers doet.',
          maak:function(R){
            var a = R.heel(3, 9), b = R.heel(1, 9) * 10 + R.heel(1, 7), m = mSplitsKeer(a, b);
            if (b < 12) b = 12, m = mSplitsKeer(a, b);
            return { vraag:a + ' × ' + b, beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'keer-hokjes', naam:'De hokjesmethode', kort:'Splits allebei de getallen en vul vier hokjes in',
          uit:'<p>Bij de <b>hokjesmethode</b> splits je allebei de getallen in tientallen en eenheden. 23 × 14: 23 = 20 + 3 en 14 = 10 + 4.</p><p>Zet ze langs een rooster en vul elk hokje in: 20 × 10, 20 × 4, 3 × 10 en 3 × 4. Tel daarna alle hokjes op.</p>',
          wanneer:'je twee getallen van twee cijfers met elkaar vermenigvuldigt.',
          maak:function(R){
            var a = R.heel(1, 4) * 10 + R.heel(1, 9), b = R.heel(1, 3) * 10 + R.heel(1, 9), m = mHokjes(a, b, false);
            return { vraag:a + ' × ' + b, beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'keer-compenseren', naam:'Compenseren', kort:'Reken met het ronde getal en haal er daarna het teveel af',
          uit:'<p>Is een getal <b>bijna rond</b>, zoals 19 of 99? Reken dan met het ronde getal en haal het teveel er daarna af. Dat heet <b>compenseren</b>.</p><p>5 × 19: reken 5 × 20 = 100. Je nam 5 × 1 te veel, dus 100 ' + MIN + ' 5 = 95.</p><p>7 × 98: reken 7 × 100 = 700. Je nam 7 × 2 = 14 te veel, dus 700 ' + MIN + ' 14 = 686.</p>',
          wanneer:'een van de getallen net onder een rond getal ligt, zoals 29, 49 of 98.',
          maak:function(R){
            var a = R.heel(3, 9), rond = R.heel(2, 10) * 10, d = R.kies([1, 1, 2]), b = rond - d, m = mCompenseer(a, b);
            return { vraag:R.kies([a + ' × ' + b, b + ' × ' + a]), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'keer-verdubbel-halveer', naam:'Verdubbelen en halveren', kort:'Verdubbel het ene getal en halveer het andere: de uitkomst blijft gelijk',
          uit:'<p>Verdubbel je het ene getal en <b>halveer</b> je het andere, dan blijft de uitkomst gelijk. Zo maak je er een rond getal van.</p><p>25 × 16 = 50 × 8 = 100 × 4 = 400.</p><p>15 × 14 = 30 × 7 = 210.</p>',
          wanneer:'een getal op 5 eindigt en het andere getal even is.',
          maak:function(R){
            var a = R.kies([5, 15, 25, 35, 45]), b;
            if (a === 5) b = R.heel(6, 24) * 2;
            else if (a === 25) b = R.heel(3, 24) * 4;
            else b = R.kies([4, 6, 8, 12, 14, 16, 18]);
            if (b % 10 === 0) b += a === 25 ? 4 : 2;
            var m = mVerdubbelHalveer(a, b);
            return { vraag:a + ' × ' + b, beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'keer-x25', naam:'× 25 is × 100 en dan : 4', kort:'Reken 100 keer en halveer dan twee keer',
          uit:'<p>25 is een kwart van 100. Dus keer 25 is <b>keer 100 en dan delen door 4</b>.</p><p>25 × 36: eerst 100 × 36 = 3600. Dan twee keer halveren: 1800, 900. Dus 25 × 36 = 900.</p>',
          wanneer:'je iets keer 25 doet en het andere getal deelbaar is door 4.',
          maak:function(R){
            var b = R.heel(3, 24) * 4, m = m25(b);
            return { vraag:R.kies(['25 × ' + b, b + ' × 25']), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'keer-x50', naam:'× 50 is × 100 en dan : 2', kort:'Reken 100 keer en neem dan de helft',
          uit:'<p>50 is de helft van 100. Dus keer 50 is <b>keer 100 en dan de helft</b>.</p><p>50 × 37: eerst 100 × 37 = 3700. De helft van 3700 is 1850.</p>',
          wanneer:'je iets keer 50 doet.',
          maak:function(R){
            var b = R.heel(1, 9) * 10 + R.heel(1, 9), m;
            if (b < 12) b = 12 + R.heel(1, 7);
            m = m50(b);
            return { vraag:R.kies(['50 × ' + b, b + ' × 50']), beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'keer-kies', naam:'Kies de handigste manier', kort:'Kijk eerst naar de getallen en kies dan de manier',
          uit:'<p>Je kent nu veel manieren. Kijk eerst goed naar de getallen en <b>kies de handigste</b>.</p><p>Nullen? Eerst de tafel. Bijna rond? Compenseren. Een 5 en een even getal? Verdubbelen en halveren. × 25 of × 50? Via 100. Eén cijfer keer twee cijfers? Splitsen. Twee keer twee cijfers? De hokjesmethode.</p>',
          wanneer:'je een keersom krijgt en zelf moet bedenken hoe je hem aanpakt.',
          maak:function(R){
            var M = { spl:'splitsen', hok:'de hokjesmethode', comp:'compenseren', nul:'eerst de tafel, dan de ' + NUL, vh:'verdubbelen en halveren', v25:'× 100 en dan : 4', v50:'× 100 en dan : 2' };
            var soort = R.kies(['spl', 'hok', 'comp', 'nul', 'vh', 'v25', 'v50']), a, b, m, vraag, ander, hint;
            if (soort === 'spl'){ a = R.kies([3, 6, 7, 9]); b = R.heel(2, 8) * 10 + R.heel(1, 4); m = mSplitsKeer(a, b); vraag = a + ' × ' + b; ander = ['comp', 'v25', 'v50', 'nul']; hint = 'Eén getal heeft één cijfer, ' + b + ' is niet bijna rond.'; }
            else if (soort === 'hok'){ a = R.heel(1, 4) * 10 + R.heel(1, 4); b = R.heel(1, 3) * 10 + R.heel(1, 4); m = mHokjes(a, b, true); vraag = a + ' × ' + b; ander = ['comp', 'nul', 'v25', 'v50']; hint = 'Allebei de getallen hebben twee cijfers.'; }
            else if (soort === 'comp'){ a = R.kies([3, 4, 6, 7, 8, 9]); b = R.heel(3, 10) * 10 - 1; m = mCompenseer(a, b); vraag = a + ' × ' + b; ander = ['hok', 'nul', 'v25', 'vh']; hint = b + ' is bijna ' + (b + 1) + '.'; }
            else if (soort === 'nul'){ var v = R.kies([[0, 1], [1, 1], [2, 0], [1, 2]]); a = R.heel(2, 9); b = R.heel(2, 9); m = mNullenKeer(a, v[0], b, v[1]); vraag = m.vraag; ander = ['spl', 'comp', 'hok', 'vh']; hint = 'Er staan ' + NUL + ' achter de getallen.'; }
            else if (soort === 'vh'){ a = R.kies([15, 35, 45]); b = R.kies([4, 6, 8, 12, 14, 16]); m = mVerdubbelHalveer(a, b); vraag = a + ' × ' + b; ander = ['comp', 'nul', 'v25', 'hok']; hint = a + ' eindigt op 5 en ' + b + ' is even.'; }
            else if (soort === 'v25'){ b = R.kies([12, 16, 24, 32, 36, 44, 52, 56, 64, 72, 76, 84, 92, 96]); m = m25(b); vraag = '25 × ' + b; ander = ['comp', 'spl', 'nul', 'v50']; hint = '25 is een kwart van 100.'; }
            else { b = R.heel(1, 9) * 10 + R.kies([1, 2, 3, 4, 6, 7]); if (b < 12) b = 13; m = m50(b); vraag = '50 × ' + b; ander = ['comp', 'v25', 'hok']; hint = '50 is de helft van 100.'; }
            ander = kiesUit(R, ander, 3).map(function(k){ return M[k]; });
            return { vraag:vraag,
              beeld:function(n){ return n >= 1 ? m.beeld(n - 1) : ''; },
              stappen:[kiesStap(R, 'Welke manier is hier het handigst?', M[soort], ander, hint)].concat(m.stappen) };
          } }
      ] },

    /* ---------------- 5. delen buiten de tafels ---------------- */
    { groep:{ id:'deel-groot', niveau:'1F', domein:'getallen', naam:'Delen buiten de tafels', uit:'Een grote deelsom maak je kleiner: splitsen, nullen wegstrepen, happen nemen of allebei de getallen veranderen. Kies steeds de handigste manier.' },
      doelen:[
        { id:'deel-splitsen', naam:'Splitsen', kort:'Splits het getal in stukken die je makkelijk deelt',
          uit:'<p>Bij <b>splitsen</b> haal je het grote getal uit elkaar in stukken die je makkelijk deelt. 84 : 4 = 80 : 4 + 4 : 4 = 20 + 1 = 21.</p><p>Kies een stuk uit de tafel met een nul erachter. 91 : 7: 91 = 70 + 21. 70 : 7 = 10 en 21 : 7 = 3. Samen 13.</p>',
          wanneer:'je deelt door een getal van één cijfer.',
          maak:function(R){
            var d = R.heel(2, 9), q = R.heel(1, 9) * 10 + R.heel(1, 9), m;
            if (q < 11) q = 11 + R.heel(1, 8);
            m = mSplitsDeel(d, q);
            return { vraag:(d * q) + ' : ' + d, beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'deel-nullen', naam:'Delen met nullen', kort:'Reken zonder de nullen en zet ze daarna terug, of streep bij allebei een nul weg',
          uit:'<p>Bij 2400 : 6 laat je de <b>nullen</b> even weg: 24 : 6 = 4. Zet ze er daarna weer achter: 400.</p><p>Staan er bij <b>allebei</b> de getallen nullen, zoals bij 3600 : 40? Streep dan bij allebei evenveel nullen weg: 360 : 4. Dat is 36 : 4 = 9, met een nul erachter: 90.</p>',
          wanneer:'het getal eindigt op nullen, of allebei de getallen.',
          maak:function(R){
            var t = R.heel(2, 9), d = R.heel(2, 9);
            while ((t * d) % 10 === 0){ t = R.heel(2, 9); d = R.heel(2, 9); }
            if (Math.random() < 0.5){ var k = R.heel(1, 3), m = mNullenDeel(t, d, k); return { vraag:m.vraag, beeld:m.beeld, stappen:m.stappen }; }
            var kk = R.heel(0, 2), P = t * d, T = P * Math.pow(10, kk + 1), D = d * 10, uit = t * Math.pow(10, kk), st = [
              { tekst:'Streep bij allebei een nul weg: ' + toon(T) + ' : ' + D + ' = … : ' + d, antwoord:S(T / 10), hint:'Haal de laatste nul van ' + toon(T) + ' weg.' } ];
            if (kk === 0) st.push({ tekst:'Reken uit: ' + P + ' : ' + d + ' =', antwoord:S(t), hint:'Welk getal maal ' + d + ' is ' + P + '?' });
            else st.push(
              { tekst:'Laat de overige ' + (kk === 1 ? 'nul' : NUL) + ' even weg: ' + P + ' : ' + d + ' =', antwoord:S(t), hint:'Welk getal maal ' + d + ' is ' + P + '?' },
              { tekst:'Zet ' + (kk === 1 ? 'die nul' : 'die ' + kk + ' ' + NUL) + ' er weer achter: ' + toon(T) + ' : ' + D + ' =', antwoord:S(uit), hint:'Zet ' + kk + ' ' + (kk === 1 ? 'nul' : NUL) + ' achter ' + t + '.', fout:F(uit, [[uit * 10, 'Eén nul te veel: je streepte er al een weg bij allebei.']]) });
            return { vraag:toon(T) + ' : ' + D,
              beeld:function(n){ var r = [[toon(T) + ' : ' + D]]; if (n >= 1) r.push([toon(T / 10) + ' : ' + d]); if (n >= st.length) r.push(['= ' + toon(uit)]); return tk.tabel(r, {}); },
              stappen:st };
          } },
        { id:'deel-hap', naam:'De hapmethode', kort:'Neem grote happen uit het getal met een tabel van handige happen',
          uit:'<p>Bij de <b>hapmethode</b> neem je steeds een hap uit het getal tot er niets meer over is. Maak eerst een tabel met handige happen: 1 ×, 2 ×, 5 × en 10 ×.</p><p>432 : 12: een grote hap van 30 × 12 = 360. Er blijft 72 over. 72 = 6 × 12. Samen 30 + 6 = 36 happen, dus 432 : 12 = 36.</p>',
          wanneer:'je deelt door een getal van twee cijfers.',
          maak:function(R){
            var d = R.kies([12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25]), q = R.heel(1, 3) * 10 + R.heel(1, 6), m = mHap(d, q);
            return { vraag:(d * q) + ' : ' + d, beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'deel-gelijk', naam:'Gelijk maken', kort:'Doe met allebei de getallen hetzelfde: de uitkomst blijft gelijk',
          uit:'<p>Halveer of verdubbel je <b>allebei</b> de getallen, dan blijft de uitkomst van de deelsom gelijk. Zo maak je er een makkelijkere som van.</p><p>140 : 35: verdubbel allebei: 280 : 70. Streep bij allebei een nul weg: 28 : 7 = 4.</p><p>96 : 16: halveer allebei: 48 : 8 = 6.</p>',
          wanneer:'je deelt door een getal dat op 5 eindigt (verdubbelen) of door een even getal tussen 10 en 20 (halveren).',
          maak:function(R){
            var d = R.kies([12, 14, 16, 18, 15, 25, 35, 45]), q = R.heel(3, 9), m = mGelijk(d, q);
            return { vraag:(d * q) + ' : ' + d, beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'deel-kies', naam:'Kies de handigste manier', kort:'Kijk eerst naar de getallen en kies dan de manier',
          uit:'<p>Bij grote deelsommen kies je eerst <b>de handigste manier</b>.</p><p>Deel je door één cijfer? Splitsen. Staan er nullen achter? Delen met nullen. Deel je door een getal dat op 5 eindigt? Gelijk maken. Deel je door een ander getal van twee cijfers? De hapmethode.</p>',
          wanneer:'je een deelsom krijgt en zelf moet bedenken hoe je hem aanpakt.',
          maak:function(R){
            var M = { spl:'splitsen', nul:'delen met ' + NUL, hap:'de hapmethode', gel:'gelijk maken' };
            var soort = R.kies(['spl', 'nul', 'hap', 'gel']), m, vraag, hint, d, q;
            if (soort === 'spl'){ d = R.heel(3, 8); q = R.heel(1, 4) * 10 + R.heel(1, 9); m = mSplitsDeel(d, q); vraag = (d * q) + ' : ' + d; hint = 'Je deelt door ' + d + ', één cijfer.'; }
            else if (soort === 'nul'){ var t = R.heel(2, 9); d = R.heel(2, 9); while ((t * d) % 10 === 0){ t = R.heel(2, 9); d = R.heel(2, 9); } m = mNullenDeel(t, d, R.heel(2, 3)); vraag = m.vraag; hint = 'Kijk naar het eind van het getal.'; }
            else if (soort === 'hap'){ d = R.kies([13, 17, 19, 21, 23]); q = R.heel(1, 3) * 10 + R.heel(1, 6); m = mHap(d, q); vraag = (d * q) + ' : ' + d; hint = d + ' heeft twee cijfers en eindigt niet op 5.'; }
            else { d = R.kies([15, 25, 35, 45]); q = R.heel(3, 9); m = mGelijk(d, q); vraag = (d * q) + ' : ' + d; hint = d + ' eindigt op 5. Verdubbel je het, dan wordt het rond.'; }
            var ander = ['spl', 'nul', 'hap', 'gel'].filter(function(k){ return k !== soort; }).map(function(k){ return M[k]; });
            return { vraag:vraag,
              beeld:function(n){ return n >= 1 ? m.beeld(n - 1) : ''; },
              stappen:[kiesStap(R, 'Welke manier is hier het handigst?', M[soort], ander, hint)].concat(m.stappen) };
          } }
      ] }
  ]);
})();
