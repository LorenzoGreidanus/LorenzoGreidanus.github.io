/* De leerroute rekenen, getallen van 1F tot 3F: grote getallen, cijferen (plus, min, keer en
   delen onder elkaar), kommagetallen, schatten, negatieve getallen, de volgorde van bewerkingen,
   machten en wortels, delers en veelvouden, en grote en kleine getallen.
   Elke manier een eigen doel. Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, MIN = '−', X = '×';

  /* ---------- hulpjes ---------- */
  function H(a, b){ return R0.heel(a, b); }
  function K(l){ return R0.kies(l); }
  function rnd(x, d){ var p = Math.pow(10, d == null ? 9 : d); return Math.round(x * p) / p; }
  function S(x){ return T(rnd(x, 10), { dec:10 }); }
  function S2(x){ return T(x, { dec:2, vast:true }); }
  function E(x){ return R0.geld(x).replace(' ', ' '); }
  function pad(s, n){ s = String(s); while (s.length < n) s = ' ' + s; return s; }
  function nul3(n){ n = String(n); while (n.length < 3) n = '0' + n; return n; }
  function dR(n, i){ return Math.floor(n / Math.pow(10, i)) % 10; }
  function lengte(n){ return String(n).length; }
  function ggd(a, b){ while (b){ var t = b; b = a % b; a = t; } return a; }
  function delersVan(n){ var d = []; for (var i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; }
  function st(tekst, ant, hint, extra){
    var s = { tekst:tekst, antwoord:typeof ant === 'number' ? S(ant) : ant, hint:hint };
    for (var k in (extra || {})) s[k] = extra[k];
    return s;
  }
  function kz(tekst, goed, fout, hint, extra){
    var o = R0.hussel([goed].concat(fout)), s = { tekst:tekst, opties:o, goed:o.indexOf(goed), hint:hint };
    for (var k in (extra || {})) s[k] = extra[k];
    return s;
  }
  function kzVast(tekst, opties, goed, hint){ return { tekst:tekst, opties:opties, goed:opties.indexOf(goed), hint:hint }; }
  function eindKeuze(op){ var l = op.stappen[op.stappen.length - 1]; op.opties = l.opties; op.goed = l.goed; return op; }
  /* foute antwoorden met uitleg; alle schrijfwijzen van het getal als sleutel */
  function F(paren, goed){
    var f = {};
    paren.forEach(function(p){
      if (p[0] == null || !isFinite(p[0]) || (goed != null && rnd(p[0]) === rnd(goed))) return;
      var a = S(p[0]);
      [a, a.replace(/−/g, '-'), a.replace(/\./g, ''), a.replace(/−/g, '-').replace(/\./g, '')].forEach(function(k){ f[k.toLowerCase()] = p[1]; });
    });
    return f;
  }
  var SUP = { '0':'⁰', '1':'¹', '2':'²', '3':'³', '4':'⁴', '5':'⁵', '6':'⁶', '7':'⁷', '8':'⁸', '9':'⁹', '-':'⁻', '−':'⁻' };
  var UNSUP = { '⁰':'0', '¹':'1', '²':'2', '³':'3', '⁴':'4', '⁵':'5', '⁶':'6', '⁷':'7', '⁸':'8', '⁹':'9', '⁻':'-' };
  function sup(n){ return String(n).split('').map(function(c){ return SUP[c] || c; }).join(''); }
  function expr(s){ return s.replace(/\^(\d+)/g, function(m, d){ return sup(d); }); }
  function tienMacht(e){ return '10' + sup(e); }
  function wet(m, e){ return S(m) + ' ' + X + ' ' + tienMacht(e); }
  /* wetenschappelijke notatie lezen: 3,2 x 10^6, 3,2 × 10⁶, 3.2*10^-4, 3,2e6 */
  function leesWet(v){
    var t = String(v).toLowerCase().replace(/\s+/g, '').replace(/[−–—]/g, '-').replace(/[×*·]/g, 'x');
    t = t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, function(s){ return '^' + s.split('').map(function(c){ return UNSUP[c]; }).join(''); });
    var m = /^(\d+(?:[.,]\d+)?)x10\^?\(?(-?\d+)\)?$/.exec(t) || /^(\d+(?:[.,]\d+)?)e(-?\d+)$/.exec(t);
    return m ? { m:parseFloat(m[1].replace(',', '.')), e:parseInt(m[2], 10) } : null;
  }
  function wetControle(m, e){ return function(v){ var p = leesWet(v); return !!p && Math.abs(p.m - m) < 1e-9 && p.e === e; }; }
  function lijstControle(goed){
    var g = goed.slice().sort(function(a, b){ return a - b; }).join(',');
    return function(v){ return (String(v).match(/\d+/g) || []).map(Number).sort(function(a, b){ return a - b; }).join(',') === g; };
  }
  /* een som uitrekenen met de juiste volgorde: + − × : ^ en haakjes */
  function reken(s){
    var t = s.replace(/\s+/g, ''), i = 0;
    function getal(){ var m = /^\d+/.exec(t.slice(i)); i += m[0].length; return +m[0]; }
    function factor(){ var v; if (t[i] === '('){ i++; v = som(); i++; } else v = getal(); while (t[i] === '^'){ i++; v = Math.pow(v, getal()); } return v; }
    function term(){ var v = factor(); while (t[i] === X || t[i] === ':'){ var o = t[i++], w = factor(); v = o === ':' ? v / w : v * w; } return v; }
    function som(){ var v = term(); while (t[i] === '+' || t[i] === MIN){ var o = t[i++], w = term(); v = o === '+' ? v + w : v - w; } return v; }
    return som();
  }

  /* ---------- getallen in woorden ---------- */
  var EEN = ['nul', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien'];
  var TIG = ['', '', 'twintig', 'dertig', 'veertig', 'vijftig', 'zestig', 'zeventig', 'tachtig', 'negentig'];
  function w99(n){ if (n < 20) return EEN[n]; var t = Math.floor(n / 10), e = n % 10; if (!e) return TIG[t]; var ew = EEN[e]; return ew + (/e$/.test(ew) ? 'ën' : 'en') + TIG[t]; }
  function w999(n){ var h = Math.floor(n / 100), r = n % 100; return (h ? (h === 1 ? '' : EEN[h]) + 'honderd' : '') + (r ? w99(r) : ''); }
  function w6(n){ var d = Math.floor(n / 1000), r = n % 1000; return (d ? (d === 1 ? '' : w999(d)) + 'duizend' : '') + (r ? w999(r) : ''); }
  function woorden(n){
    var mj = Math.floor(n / 1e9), mi = Math.floor(n / 1e6) % 1000, rest = n % 1e6, d = [];
    if (mj) d.push(w999(mj) + ' miljard'); if (mi) d.push(w999(mi) + ' miljoen'); if (rest) d.push(w6(rest));
    return d.join(' ') || 'nul';
  }

  /* ---------- plaatjes ---------- */
  function nr(x){ return typeof x === 'number' ? (x < 0 ? MIN + (-x) : String(x)) : String(x); }
  /* onder elkaar: lijst [[teken, getal]], strepen na welke regels, onth { kolom van rechts: cijfer } */
  function onder(lijst, strepen, onth){
    var r = lijst.map(function(x){ return [x[0] || ' ', nr(x[1])]; }), L = 0;
    r.forEach(function(x){ L = Math.max(L, x[1].length); });
    var o = { strepen:strepen || [1] };
    if (onth){ var a = []; for (var i = 0; i <= L; i++) a.push(' '); Object.keys(onth).forEach(function(k){ var p = L - (+k); if (p >= 0) a[p] = String(onth[k]); }); o.onth = a.join(''); }
    return R0.teken.cijfer(r.map(function(x){ return x[0] + pad(x[1], L); }), o);
  }
  /* plaatswaardetabel met kommagetallen: D H T E , t h d */
  /* een smalle tabel (past ook op een telefoon): o.kop, o.nadruk [[r, c]] */
  function klein(rijen, o){
    o = o || {}; var nad = {}; (o.nadruk || []).forEach(function(p){ nad[p[0] + ',' + p[1]] = 1; });
    return '<div><table class="lr-tabel" style="border-spacing:3px;margin:0 auto">' + rijen.map(function(r, ri){ return '<tr>' + r.map(function(c, ci){ var t = o.kop && ri === 0 ? 'th' : 'td';
      return '<' + t + (nad[ri + ',' + ci] ? ' class="nadruk"' : '') + ' style="min-width:0;padding:6px 9px">' + (c === '?' ? '<b class="lr-vraagt">?</b>' : R0.schoon(c)) + '</' + t + '>'; }).join('') + '</tr>'; }).join('') + '</table>' + (o.onder ? '<p class="lr-wanneer" style="text-align:center">' + o.onder + '</p>' : '') + '</div>';
  }
  /* plaatswaardetabel: alleen de kolommen die de getallen nodig hebben */
  function pwDelen(v){ var s = T(v, { dec:3 }).replace(/\./g, '').split(','); return { i:s[0], d:s[1] || '' }; }
  function pwTabel(getallen, o){
    o = o || {}; var ni = 1, nd = 0;
    getallen.forEach(function(v){ if (v === '?') return; var d = pwDelen(v); ni = Math.max(ni, d.i.length); nd = Math.max(nd, d.d.length); });
    var kop = ['D', 'H', 'T', 'E'].slice(4 - ni).concat(nd ? [','].concat(['t', 'h', 'd'].slice(0, nd)) : []);
    var rijen = [kop].concat(getallen.map(function(v){
      if (v === '?'){ var q = kop.map(function(){ return ''; }); q[ni - 1] = '?'; return q; }
      var d = pwDelen(v), ip = d.i, r = []; while (ip.length < ni) ip = ' ' + ip;
      ip.split('').forEach(function(c){ r.push(c === ' ' ? '' : c); });
      if (nd){ r.push(d.d ? ',' : ''); for (var i = 0; i < nd; i++) r.push(d.d[i] || ''); }
      return r; }));
    var nad = o.kolom != null ? [[0, ni + 1 + o.kolom], [1, ni + 1 + o.kolom]] : [];
    return klein(rijen, { kop:true, nadruk:nad, onder:nd ? 't = tienden, h = honderdsten, d = duizendsten' : '' });
  }
  /* getallenlijn waarop het getal bij de stip verborgen is: toon true = laten zien, false = '?', 'leeg' = niets */
  function lijnZonder(o, verberg, toon){
    o.toon = function(x){ return verberg.some(function(v){ return Math.abs(x - v) < 1e-9; }) ? (toon === 'leeg' ? '' : toon ? S(x) : '?') : S(x); };
    return R0.teken.lijn(o);
  }
  function regelsBeeld(regels){ return '<div class="lr-tekst">' + regels.map(function(r, i){ return '<p>' + (i ? '= ' : '') + R0.schoon(r) + '</p>'; }).join('') + '</div>'; }

  var PLAATS = ['eenheden', 'tientallen', 'honderdtallen', 'duizendtallen', 'tienduizendtallen', 'honderdduizendtallen', 'miljoenen'];

  LEERROUTE.voeg('rekenen', [

    /* ===================== 1F ===================== */
    { groep:{ id:'groot-getal', niveau:'1F', domein:'getallen', naam:'Grote getallen', uit:'Getallen tot een miljoen en een miljard: lezen, schrijven, de waarde van een cijfer, afronden en vergelijken. Zo begrijp je de getallen in het nieuws.' },
      doelen:[
        { id:'groot-lezen', naam:'Van woorden naar cijfers', kort:'Schrijf een groot getal in groepjes van drie cijfers: miljoen, duizend en de rest',
          uit:'<p>Een groot getal in woorden zet je om in <b>groepjes van drie cijfers</b>. Eerst de miljoenen, dan de duizenden, dan de rest.</p><p>Elk groepje na de eerste heeft altijd drie cijfers. Vul aan met nullen: zestigduizend wordt <b>060</b> in het groepje van de duizenden.</p><p>Voorbeeld: twee miljoen zestigduizend driehonderd = 2.060.300.</p>',
          wanneer:'je een getal in woorden leest, zoals in een tekst of op een cheque.',
          maak:function(R){
            var mj = R.heel(1, 4) === 1 ? R.heel(1, 9) : 0;
            var mi = mj && R.heel(0, 2) === 0 ? R.heel(0, 99) : R.heel(1, 999);
            var du = K([R.heel(1, 999), R.heel(1, 9) * 10, R.heel(1, 9) * 100, R.heel(1, 9), 0]);
            var re = K([R.heel(1, 999), R.heel(1, 9) * 100, R.heel(1, 99), R.heel(1, 9) * 10, 0]);
            var n = mj * 1e9 + mi * 1e6 + du * 1e3 + re, w = woorden(n);
            var kop = (mj ? ['miljard'] : []).concat(['miljoen', 'duizend', 'rest']);
            var vak = (mj ? [String(mj)] : []).concat([mj ? nul3(mi) : String(mi), nul3(du), nul3(re)]);
            var stappen = [];
            if (mj) stappen.push(st('Hoeveel miljard? Kijk naar het woord voor "miljard".', mj, 'Er staat ' + w999(mj) + ' miljard.'));
            stappen.push(st('De miljoenen' + (mj ? ' (drie cijfers):' : ':'), mj ? nul3(mi) : mi, mi ? 'Er staat ' + w999(mi) + ' miljoen.' + (mj && mi < 100 ? ' Vul aan tot drie cijfers: ' + nul3(mi) + '.' : '') : 'Er staat geen miljoen in het getal. Dan schrijf je 000.'));
            stappen.push(st('De duizenden (drie cijfers):', nul3(du), du ? 'Er staat ' + w999(du) + 'duizend. Vul aan tot drie cijfers: ' + nul3(du) + '.' : 'Er staat geen duizend in. Dan schrijf je 000.'));
            stappen.push(st('De rest (drie cijfers):', nul3(re), re ? 'Na het woord duizend staat ' + w999(re) + '. Drie cijfers: ' + nul3(re) + '.' : 'Er komt niets meer na de duizenden. Dan schrijf je 000.'));
            stappen.push(st('Het hele getal:', T(n), 'Zet de groepjes achter elkaar: ' + vak.join('.') + '.'));
            return { vraag:w, vraagHtml:'<span style="font-size:.62em">' + R.schoon(w) + '</span>', context:'Schrijf het getal in cijfers.',
              beeld:function(k){ return klein([kop, vak.map(function(v, i){ return i < k ? v : '?'; })], { kop:true }); },
              stappen:stappen };
          } },
        { id:'groot-schrijven', naam:'Van cijfers naar woorden', kort:'Lees het getal per groepje van drie: zoveel miljoen, zoveel duizend en de rest',
          uit:'<p>Een groot getal lees je <b>per groepje van drie cijfers</b>, van links naar rechts. De punten helpen je: na de eerste punt komen de duizenden.</p><p>Bij 4.060.200 lees je: <b>4</b> miljoen, <b>060</b> duizend en <b>200</b>. Dus: vier miljoen zestigduizend tweehonderd.</p><p>Getallen onder het miljoen schrijf je aan elkaar. Na miljoen en miljard komt een spatie.</p>',
          wanneer:'je een groot getal moet voorlezen of uitschrijven.',
          maak:function(R){
            var mi = R.heel(1, 99), du = K([R.heel(1, 999), R.heel(1, 9) * 10, R.heel(1, 9) * 100, R.heel(1, 99)]), re = K([R.heel(1, 999), R.heel(1, 9) * 100, R.heel(1, 99), 0]);
            var n = mi * 1e6 + du * 1e3 + re, s = String(n), fout = [];
            for (var i = 0; i < s.length - 1; i++){ if (s[i] === s[i + 1]) continue; var t = s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2); if (t[0] !== '0' && fout.indexOf(+t) < 0) fout.push(+t); }
            if (du !== re && re >= 100) fout.push(mi * 1e6 + re * 1e3 + du);
            fout.push(mi * 1e6 + (du % 100) * 1e3 + re);
            fout = R.hussel(fout.filter(function(x, j, a){ return x !== n && x >= 1e6 && a.indexOf(x) === j; })).slice(0, 3);
            while (fout.length < 3) fout.push(n + (fout.length + 1) * 1e3);
            return eindKeuze({ vraag:T(n), context:'Hoe schrijf je dit getal in woorden?',
              beeld:function(k){ return R.teken.tabel([['miljoen', 'duizend', 'rest'], [String(mi), nul3(du), nul3(re)]], { kop:true, nadruk:k < 3 ? [[1, k]] : [] }); },
              stappen:[
                st('Hoeveel miljoen? Kijk naar het eerste groepje.', mi, 'Het eerste groepje voor de eerste punt is ' + mi + '.'),
                st('Hoeveel duizend? Kijk naar het tweede groepje.', du, 'Het tweede groepje is ' + nul3(du) + '. Dat is ' + du + ' duizend.'),
                st('En de rest? Kijk naar het laatste groepje.', re, 'Het laatste groepje is ' + nul3(re) + '.'),
                kz('Welke schrijfwijze is goed?', woorden(n), fout.map(woorden), 'Lees: ' + w999(mi) + ' miljoen, ' + (du ? w999(du) + 'duizend' : '') + (re ? ', ' + w999(re) : '') + '.') ] });
          } },
        { id:'groot-plaats', naam:'De waarde van een cijfer', kort:'Tel de plaatsen van rechts en zet achter het cijfer evenveel nullen',
          uit:'<p>Elk cijfer in een getal heeft een <b>plaats</b>. Van rechts naar links: eenheden, tientallen, honderdtallen, duizendtallen, tienduizendtallen, honderdduizendtallen, miljoenen.</p><p>De <b>waarde</b> van een cijfer hangt af van die plaats. In 3.482.615 staat de 8 op de plaats van de tienduizendtallen. De 8 is dus 80.000 waard.</p>',
          wanneer:'je wilt weten hoeveel een cijfer in een groot getal echt waard is.',
          maak:function(R){
            var n, p, c;
            do { n = R.heel(1000000, 9999999); p = R.heel(2, 6); c = dR(n, p); } while (!c);
            var cijfers = String(n).split(''), kop = ['M', 'HD', 'TD', 'D', 'H', 'T', 'E'];
            return { vraag:T(n), context:'Hoeveel is het cijfer op de plaats van de <b>' + PLAATS[p] + '</b> waard?',
              beeld:function(k){ return klein([kop, cijfers], { kop:true, nadruk:k >= 1 ? [[0, 6 - p], [1, 6 - p]] : [], onder:'M = miljoenen, HD = honderdduizendtallen, TD = tienduizendtallen, D = duizendtallen, H = honderdtallen, T = tientallen, E = eenheden' }); },
              stappen:[
                st('Tel van rechts: eenheden is plaats 1, tientallen plaats 2, enzovoort. Op welke plaats staan de ' + PLAATS[p] + '?', p + 1, 'Eenheden 1, tientallen 2, honderdtallen 3, duizendtallen 4, tienduizendtallen 5, honderdduizendtallen 6, miljoenen 7.'),
                st('Welk cijfer staat op plaats ' + (p + 1) + ' van rechts?', c, 'Tel ' + (p + 1) + ' cijfers vanaf rechts in ' + T(n) + '. De punten tellen niet mee.'),
                st('Hoeveel is die ' + c + ' waard?', c * Math.pow(10, p), 'Rechts van de ' + c + ' staan nog ' + p + ' cijfers. Zet ' + p + ' nullen achter de ' + c + '.', { fout:F([[c, 'Dat is het cijfer zelf. Hoeveel is het waard op deze plaats? Zet er nullen achter.']]) }) ] };
          } },
        { id:'groot-afronden', naam:'Afronden op duizendtallen en miljoenen', kort:'Kijk naar het cijfer rechts van de plaats waarop je afrondt: 5 of meer gaat omhoog',
          uit:'<p>Bij <b>afronden</b> zoek je het ronde getal dat het dichtst bij ligt. Je kijkt naar het cijfer <b>rechts</b> van de plaats waarop je afrondt.</p><p>Is dat cijfer 5, 6, 7, 8 of 9? Dan rond je naar boven af. Is het 0, 1, 2, 3 of 4? Dan rond je naar beneden af.</p><p>Voorbeeld: 47.680 op duizendtallen. Rechts van de 7 staat een 6, dus naar boven: 48.000.</p>',
          wanneer:'een precies getal niet nodig is, zoals in een krantenkop of bij het schatten.',
          maak:function(R){
            var mil = R.heel(0, 1) === 1, eenheid = mil ? 1e6 : 1000, n;
            do { n = mil ? R.heel(1000001, 99999999) : R.heel(10001, 999999); } while (n % eenheid === 0);
            var laag = Math.floor(n / eenheid) * eenheid, hoog = laag + eenheid, c = Math.floor(n / (eenheid / 10)) % 10, op = c >= 5, ant = op ? hoog : laag;
            var naam = mil ? 'miljoenen' : 'duizendtallen', rechts = mil ? 'honderdduizendtallen' : 'honderdtallen';
            return { vraag:T(n), context:'Rond af op ' + (mil ? '<b>hele miljoenen</b>' : '<b>duizendtallen</b>') + '.',
              beeld:function(k){ return lijnZonder({ van:laag, tot:hoog, streep:eenheid / 10, labels:[laag, hoog], stip:[n], sprongen:k >= 4 ? [{ van:n, naar:ant, tekst:'' }] : [], nieuw:true }, [n], 'leeg'); },
              stappen:[
                st('Rond eerst naar beneden af: laat alles na de ' + naam + ' nul worden.', laag, 'Houd de cijfers tot en met de ' + naam + ' en maak de rest 0: ' + T(laag) + '.'),
                st('Welk cijfer staat rechts van de ' + naam + '? (de ' + rechts + ')', c, 'In ' + T(n) + ' staan de ' + rechts + ' ' + (mil ? 'direct na de eerste punt.' : 'direct na de punt.')),
                kz('Dat cijfer is een ' + c + '. Rond je naar boven of naar beneden af?', op ? 'naar boven' : 'naar beneden', [op ? 'naar beneden' : 'naar boven'], 'Bij 5, 6, 7, 8 of 9 naar boven. Bij 0 tot en met 4 naar beneden.'),
                st('Het afgeronde getal:', ant, op ? 'Naar boven: één ' + (mil ? 'miljoen' : 'duizend') + ' meer dan ' + T(laag) + '.' : 'Naar beneden: dat is ' + T(laag) + '.', { fout:F([[op ? laag : hoog, 'Kijk nog eens naar het cijfer ' + c + ': ' + (op ? 'dat is 5 of meer, dus naar boven.' : 'dat is minder dan 5, dus naar beneden.')]]) }) ] };
          } },
        { id:'groot-ordenen', naam:'Grote getallen vergelijken', kort:'Evenveel cijfers? Vergelijk van links naar rechts tot je een verschil vindt',
          uit:'<p>Hebben de getallen evenveel cijfers? Dan vergelijk je ze <b>van links naar rechts</b>, cijfer voor cijfer.</p><p>Bij het eerste cijfer dat verschilt, beslis je: het getal met het grootste cijfer daar is het grootst. Zijn ook die cijfers gelijk? Dan kijk je naar het volgende cijfer.</p><p>Voorbeeld: 4.<b>3</b>72.000 is groter dan 4.<b>2</b>98.500, want 3 is meer dan 2.</p>',
          wanneer:'je getallen op volgorde zet, zoals inwoners van steden of bezoekers per jaar.',
          maak:function(R){
            var groot = R.heel(0, 1) === 1, k = R.heel(1, 2), pre = String(R.heel(1, 9)) + (k === 2 ? String(R.heel(0, 9)) : '');
            var drie = R.hussel([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3).sort(function(a, b){ return a - b; });
            var top = groot ? drie[2] : drie[0], ander = groot ? [drie[1], drie[0]] : [drie[1], drie[2]];
            var x1 = R.heel(0, 9), x2; do { x2 = R.heel(0, 9); } while (x2 === x1);
            function staart(l){ var s = ''; for (var i = 0; i < l; i++) s += R.heel(0, 9); return s; }
            var r = 7 - k - 2, g = [pre + top + x1 + staart(r), pre + top + x2 + staart(r), pre + ander[0] + staart(r + 1), pre + ander[1] + staart(r + 1)].map(Number);
            var ant = groot ? Math.max.apply(null, g) : Math.min.apply(null, g), toon = R.hussel(g);
            var plek = PLAATS[6 - k], andereP = [PLAATS[6 - k + (k === 1 ? -1 : 1)], PLAATS[3]].filter(function(x){ return x !== plek; });
            return eindKeuze({ vraag:toon.map(T).join('   '), vraagHtml:'<span style="font-size:.7em">' + toon.map(T).join(' &nbsp; ') + '</span>', context:'Welk getal is het <b>' + (groot ? 'grootst' : 'kleinst') + '</b>?',
              stappen:[
                kz('Alle getallen hebben 7 cijfers en beginnen met ' + pre + '. Op welke plaats staat het eerste cijfer dat verschilt?', plek, andereP, 'Tel van links: miljoenen, honderdduizendtallen, tienduizendtallen. Na de ' + pre + ' komt de plaats van de ' + plek + '.'),
                kz('Twee getallen hebben daar een ' + top + '. Kijk bij die twee naar het volgende cijfer. Welk getal is het ' + (groot ? 'grootst' : 'kleinst') + '?', T(ant), g.filter(function(x){ return x !== ant; }).map(T), (groot ? 'De ' + top + ' is het grootste cijfer op die plaats.' : 'De ' + top + ' is het kleinste cijfer op die plaats.') + ' Bij de twee getallen met een ' + top + ' kijk je naar het cijfer erna.') ] });
          } },
        { id:'groot-krant', naam:'Grote getallen in de krant', kort:'2,3 miljoen is 2 miljoen plus 0,3 miljoen: 2.300.000',
          uit:'<p>In de krant staat vaak <b>2,3 miljoen</b> in plaats van 2.300.000. Dat is korter en makkelijker te lezen.</p><p>Zo reken je het om: 2 miljoen = 2.000.000 en 0,3 miljoen = 3 tienden van een miljoen = 300.000. Samen is dat 2.300.000.</p><p>Een miljoen heeft 6 nullen, een miljard heeft er 9.</p>',
          wanneer:'je een getal met miljoen of miljard in cijfers wilt schrijven.',
          maak:function(R){
            var mrd = R.heel(0, 2) === 0, z = mrd ? 9 : 6, unit = mrd ? 'miljard' : 'miljoen', dec = R.heel(1, 2), xi;
            do { xi = dec === 1 ? R.heel(1, 99) * 10 : R.heel(101, 999); } while (xi % 100 === 0 || (dec === 2 && xi % 10 === 0));
            var x = xi / 100, heel = Math.floor(xi / 100), deel = xi % 100, n = xi * Math.pow(10, z - 2);
            var deelTxt = dec === 1 ? String(deel / 10) : String(deel), deelNaam = dec === 1 ? 'tienden' : 'honderdsten';
            var ctx = K(['In Nederland keken {x} mensen naar de finale.', 'Het museum had vorig jaar {x} bezoekers.', 'De gemeente geeft {x} euro uit aan nieuwe fietspaden.', 'Het liedje is {x} keer gestreamd.', 'Het bedrijf verdiende vorig jaar {x} euro.', 'Er reden {x} auto\'s over de brug.']);
            return { vraag:T(x) + ' ' + unit, context:ctx.replace('{x}', '<b>' + T(x) + ' ' + unit + '</b>') + ' Schrijf dit getal helemaal in cijfers.',
              beeld:function(k){ return R.teken.tabel([[unit, 'in cijfers'], [String(heel), k >= 2 ? T(heel * Math.pow(10, z)) : '?'], [T(rnd(deel / 100)), k >= 3 ? T(deel * Math.pow(10, z - 2)) : '?'], [T(x), k >= 4 ? T(n) : '?']], { kop:true }); },
              stappen:[
                st('Hoeveel nullen heeft 1 ' + unit + '?', z, '1 miljoen = 1.000.000 en 1 miljard = 1.000.000.000. Tel de nullen.'),
                st(heel + ' ' + unit + ' =', heel * Math.pow(10, z), 'Zet ' + z + ' nullen achter de ' + heel + '.'),
                st(T(rnd(deel / 100)) + ' ' + unit + ' =', deel * Math.pow(10, z - 2), T(rnd(deel / 100)) + ' is ' + deelTxt + ' ' + deelNaam + '. Eén ' + (dec === 1 ? 'tiende' : 'honderdste') + ' van een ' + unit + ' is ' + T(Math.pow(10, z - dec)) + '.'),
                st('Samen:', n, T(heel * Math.pow(10, z)) + ' + ' + T(deel * Math.pow(10, z - 2)) + '.') ] };
          } }
      ] },

    { groep:{ id:'cijf-plusmin', niveau:'1F', domein:'getallen', naam:'Optellen en aftrekken onder elkaar', uit:'Grote getallen tel je op of trek je af onder elkaar: kolomsgewijs met tussenuitkomsten, of cijferend met onthouden en lenen. Je leert ook wanneer je het beter in je hoofd doet.' },
      doelen:[
        { id:'cijf-kolomplus', naam:'Kolomsgewijs optellen', kort:'Tel van links naar rechts per plaats op en zet de tussenuitkomsten onder elkaar',
          uit:'<p>Bij <b>kolomsgewijs optellen</b> zet je de getallen onder elkaar. Je begint <b>links</b>, bij de grootste plaats.</p><p>Per plaats schrijf je een tussenuitkomst op: eerst de honderdtallen, dan de tientallen, dan de eenheden. Tot slot tel je de tussenuitkomsten op.</p><p>Voorbeeld: 476 + 358. 400 + 300 = 700, 70 + 50 = 120, 6 + 8 = 14. Samen 834.</p>',
          wanneer:'je de tussenstappen wilt zien en niet wilt onthouden.',
          maak:function(R){
            var len = R.heel(3, 4), lo = Math.pow(10, len - 1), a, b;
            do { a = R.heel(lo, lo * 10 - 1); b = R.heel(lo, lo * 10 - 1); } while (a % 10 + b % 10 < 10 || a % 10 === 0 || b % 10 === 0 || dR(a, 1) + dR(b, 1) < 6);
            var delen = [];
            for (var i = len - 1; i >= 0; i--){ var w = Math.pow(10, i); delen.push({ x:dR(a, i) * w, y:dR(b, i) * w, s:(dR(a, i) + dR(b, i)) * w, naam:PLAATS[i] }); }
            var stappen = delen.map(function(d, j){ return st('De ' + d.naam + ': ' + d.x + ' + ' + d.y + ' =', d.s, j === 0 ? 'Reken ' + (d.x / Math.pow(10, len - 1)) + ' + ' + (d.y / Math.pow(10, len - 1)) + ' en zet er ' + (len === 3 ? 'twee' : 'drie') + ' nullen achter.' : 'Tel alleen de ' + d.naam + ' van beide getallen op.'); });
            stappen.push(st('Tel de tussenuitkomsten op: ' + delen.map(function(d){ return d.s; }).join(' + ') + ' =', a + b, 'Begin met de grootste: ' + delen[0].s + ' + ' + delen[1].s + ' = ' + (delen[0].s + delen[1].s) + '.'));
            return { vraag:a + ' + ' + b,
              beeld:function(k){ var l = [['', a], ['+', b]]; delen.forEach(function(d, j){ if (j < k) l.push(['', d.s]); }); if (k > len) l.push(['', a + b]); return onder(l, k > len ? [1, 1 + len] : [1]); },
              stappen:stappen };
          } },
        { id:'cijf-cijferplus', naam:'Cijferend optellen', kort:'Begin rechts, tel per kolom op en onthoud het tiental voor de volgende kolom',
          uit:'<p>Bij <b>cijferend optellen</b> begin je <b>rechts</b>, bij de eenheden. Je rekent alleen met losse cijfers.</p><p>Is de uitkomst in een kolom 10 of meer? Dan schrijf je het laatste cijfer op en <b>onthoud</b> je de 1. Die zet je klein boven de volgende kolom en tel je daar mee.</p><p>Voorbeeld: 476 + 358. 6 + 8 = 14: schrijf 4, onthoud 1. 7 + 5 + 1 = 13: schrijf 3, onthoud 1. 4 + 3 + 1 = 8. Antwoord 834.</p>',
          wanneer:'de getallen lang zijn en je snel en zonder veel tussenuitkomsten wilt rekenen.',
          maak:function(R){
            var len = R.heel(3, 4), lo = Math.pow(10, len - 1), a, b, ov;
            do { a = R.heel(lo, lo * 10 - 1); b = R.heel(lo, lo * 10 - 1); ov = 0; for (var i = 0; i < len - 1; i++) if (dR(a, i) + dR(b, i) + (i && dR(a, i - 1) + dR(b, i - 1) >= 10 ? 1 : 0) >= 10) ov++; } while (ov < 2);
            var stappen = [], onth = [], c = 0;
            for (i = 0; i < len; i++){
              var x = dR(a, i), y = dR(b, i), s = x + y + c, laatste = i === len - 1;
              stappen.push(st((i === 0 ? 'Begin rechts. ' : '') + 'De ' + PLAATS[i] + ': ' + x + ' + ' + y + (c ? ' + 1 (onthouden)' : '') + ' =', s, c ? 'Tel ' + x + ' + ' + y + ' en vergeet de 1 die je onthouden hebt niet.' : 'Tel alleen de cijfers van de ' + PLAATS[i] + ': ' + x + ' en ' + y + '.',
                { waarom:!laatste && s >= 10 ? 'Schrijf ' + (s % 10) + ' op en onthoud 1.' : 'Schrijf ' + s + ' op.', fout:c ? F([[s - 1, 'Je vergat de 1 die je onthouden had.']], s) : {} }));
              c = s >= 10 ? 1 : 0; onth.push(c);
            }
            stappen.push(st('Het antwoord:', a + b, 'Lees de cijfers onder de streep van links naar rechts.'));
            return { vraag:a + ' + ' + b,
              beeld:function(k){ var l = [['', a], ['+', b]], o = {}; for (var j = 0; j < Math.min(k, len); j++) if (onth[j] && j < len - 1) o[j + 1] = 1; if (k) l.push(['', k >= len ? String(a + b) : String(a + b).slice(-k)]); return onder(l, [1], o); },
              stappen:stappen };
          } },
        { id:'cijf-kolommin', naam:'Kolomsgewijs aftrekken', kort:'Trek per plaats af, van links naar rechts; kom je tekort, dan schrijf je een min',
          uit:'<p>Bij <b>kolomsgewijs aftrekken</b> trek je per plaats af, van links naar rechts: honderdtallen, tientallen, eenheden.</p><p>Soms is het onderste cijfer groter. Dan kom je iets <b>tekort</b> en schrijf je een min. Bij 523 − 278: 500 − 200 = 300, 20 − 70 = −50, 3 − 8 = −5.</p><p>Tot slot reken je alles samen: 300 − 50 − 5 = 245.</p>',
          wanneer:'je niet wilt lenen en liever met tussenuitkomsten werkt.',
          maak:function(R){
            var a, b;
            do { a = R.heel(301, 989); b = R.heel(102, a - 100); } while (dR(a, 2) <= dR(b, 2) || (dR(a, 1) >= dR(b, 1) && dR(a, 0) >= dR(b, 0)) || a % 10 === b % 10);
            var delen = [2, 1, 0].map(function(i){ var w = Math.pow(10, i); return { x:dR(a, i) * w, y:dR(b, i) * w, s:(dR(a, i) - dR(b, i)) * w, naam:PLAATS[i] }; });
            var stappen = delen.map(function(d){
              return st('De ' + d.naam + ': ' + d.x + ' ' + MIN + ' ' + d.y + ' =', d.s, d.s < 0 ? d.y + ' is ' + (-d.s) + ' meer dan ' + d.x + '. Je komt ' + (-d.s) + ' tekort: schrijf er een min voor.' : 'Haal ' + d.y + ' van ' + d.x + ' af.',
                { fout:d.s < 0 ? F([[-d.s, 'Let op: ' + d.x + ' ' + MIN + ' ' + d.y + ' is kleiner dan 0. Je komt ' + (-d.s) + ' tekort, dus het wordt min ' + (-d.s) + '.']]) : {} });
            });
            var som = delen.map(function(d, j){ return j === 0 ? String(d.s) : (d.s < 0 ? MIN + ' ' + (-d.s) : '+ ' + d.s); }).join(' ');
            stappen.push(st('Reken samen: ' + som + ' =', a - b, 'Begin bij ' + delen[0].s + ' en reken van links naar rechts.'));
            return { vraag:a + ' ' + MIN + ' ' + b,
              beeld:function(k){ var l = [['', a], [MIN, b]]; delen.forEach(function(d, j){ if (j < k) l.push(['', d.s]); }); if (k > 3) l.push(['', a - b]); return onder(l, k > 3 ? [1, 4] : [1]); },
              stappen:stappen };
          } },
        { id:'cijf-cijfermin', naam:'Cijferend aftrekken met lenen', kort:'Begin rechts; is het bovenste cijfer te klein, leen dan 1 van de kolom ernaast',
          uit:'<p>Bij <b>cijferend aftrekken</b> begin je rechts en trek je per kolom het onderste cijfer van het bovenste af.</p><p>Is het bovenste cijfer te klein? Dan <b>leen</b> je 1 van de kolom links ervan. Daar staat dan 1 minder, en jij krijgt er 10 bij.</p><p>Voorbeeld: 523 − 278. 3 − 8 kan niet: leen, 13 − 8 = 5. Bij de tientallen staat nu 1. 1 − 7 kan niet: leen, 11 − 7 = 4. Bij de honderdtallen staat nu 4. 4 − 2 = 2. Antwoord 245.</p>',
          wanneer:'de getallen lang zijn en je snel wilt aftrekken.',
          maak:function(R){
            var len = R.heel(3, 4), a, b, leent;
            function cijfersGetal(l, min){ var s = String(R.heel(min, 9)); for (var i = 1; i < l; i++) s += R.heel(min, 9); return +s; }
            do { a = cijfersGetal(len, 2); b = cijfersGetal(len, 1); leent = 0; var l2 = 0; for (var i = 0; i < len; i++){ if (dR(a, i) - l2 < dR(b, i)){ leent++; l2 = 1; } else l2 = 0; } } while (b >= a || leent < 1 || a - b < Math.pow(10, len - 2));
            var stappen = [], leen = 0, nieuw = {};
            for (i = 0; i < len; i++){
              var cur = dR(a, i) - leen, y = dR(b, i), tekst = (i === 0 ? 'Begin rechts. ' : '') + 'De ' + PLAATS[i] + ': ' + (leen ? 'er staat nu ' + cur + ', want je leende er 1 van. ' : ''), ant, f = {};
              if (cur < y){ tekst += cur + ' ' + MIN + ' ' + y + ' kan niet. Leen 1 van de ' + PLAATS[i + 1] + ': ' + (cur + 10) + ' ' + MIN + ' ' + y + ' ='; ant = cur + 10 - y; leen = 1; nieuw[i + 1] = dR(a, i + 1) - 1; f = F([[y - cur, 'Je deed ' + y + ' ' + MIN + ' ' + cur + '. Onder elkaar trek je altijd het onderste cijfer van het bovenste af. Leen eerst.']], ant); }
              else { tekst += cur + ' ' + MIN + ' ' + y + ' ='; ant = cur - y; leen = 0; if (cur !== dR(a, i)) f = F([[dR(a, i) - y, 'Je leende hier al 1 van. Er staat nu ' + cur + '.']], ant); }
              stappen.push(st(tekst, ant, cur < y ? 'Na het lenen heb je ' + (cur + 10) + '. Haal er ' + y + ' af.' : 'Haal ' + y + ' van ' + cur + ' af.', { fout:f }));
            }
            stappen.push(st('Het antwoord:', a - b, 'Lees de cijfers onder de streep van links naar rechts.'));
            var res = String(a - b); while (res.length < len) res = '0' + res;
            return { vraag:a + ' ' + MIN + ' ' + b,
              beeld:function(k){ var l = [['', a], [MIN, b]], o = {}; Object.keys(nieuw).forEach(function(j){ if (+j <= k) o[j] = nieuw[j]; }); if (k) l.push(['', k >= len ? String(a - b) : res.slice(-k)]); return onder(l, [1], o); },
              stappen:stappen };
          } },
        { id:'cijf-nullen', naam:'Aftrekken over nullen heen', kort:'Leen bij het eerste cijfer dat geen 0 is: de nullen worden negens en rechts krijg je 10',
          uit:'<p>Bij 1000 − 368 staan er boven alleen nullen. Je kunt pas lenen bij de <b>1</b> helemaal links.</p><p>Leen 1 duizendtal. Dat wordt <b>9 honderdtallen, 9 tientallen en 10 eenheden</b> (900 + 90 + 10 = 1000). De nullen worden dus negens, en bij de eenheden staat 10.</p><p>Daarna trek je gewoon per kolom af: 10 − 8 = 2, 9 − 6 = 3, 9 − 3 = 6. Antwoord 632.</p>',
          wanneer:'je cijferend aftrekt van een rond getal zoals 1000, 5000 of 400.',
          maak:function(R){
            var groot = R.heel(0, 2) > 0, k, a, b;
            if (groot){ k = R.heel(1, 9); a = k * 1000; do { b = R.heel(101, 999); } while (b % 10 === 0 || dR(b, 1) === 0); }
            else { k = R.heel(2, 9); a = k * 100; do { b = R.heel(11, a - 1); } while (b % 10 === 0 || dR(b, 1) === 0); }
            var top = groot ? 'duizendtal' : 'honderdtal', stappen = [];
            stappen.push(st('Boven staan nullen. Leen 1 ' + top + '. Dan heb je ' + (k - 1 ? (k - 1) + (groot ? (k === 2 ? ' duizendtal, ' : ' duizendtallen, ') : (k === 2 ? ' honderdtal, ' : ' honderdtallen, ')) : '') + (groot ? '9 honderdtallen, ' : '') + '9 tientallen en hoeveel eenheden?', 10,
              groot ? '1 duizendtal = 900 + 90 + 10. Er komen 10 eenheden.' : '1 honderdtal = 90 + 10. Er komen 10 eenheden.', { waarom:groot ? '1000 = 900 + 90 + 10' : '100 = 90 + 10' }));
            stappen.push(st('De eenheden: 10 ' + MIN + ' ' + dR(b, 0) + ' =', 10 - dR(b, 0), 'Je hebt 10 eenheden. Haal er ' + dR(b, 0) + ' af.', { fout:F([[dR(b, 0), 'Er staat geen 0 meer, maar 10. Je leende toch?']]) }));
            stappen.push(st('De tientallen: 9 ' + MIN + ' ' + dR(b, 1) + ' =', 9 - dR(b, 1), 'De 0 bij de tientallen is een 9 geworden.'));
            if (groot) stappen.push(st('De honderdtallen: 9 ' + MIN + ' ' + dR(b, 2) + ' =', 9 - dR(b, 2), 'Ook bij de honderdtallen staat nu een 9.'));
            else if (b >= 100) stappen.push(st('De honderdtallen: ' + (k - 1) + ' ' + MIN + ' ' + dR(b, 2) + ' =', k - 1 - dR(b, 2), 'Bij de honderdtallen staat nu ' + (k - 1) + ', want je leende er 1 van.'));
            stappen.push(st('Het antwoord:', a - b, (groot && k > 1 ? 'Vergeet de ' + (k - 1) + (k === 2 ? ' duizendtal' : ' duizendtallen') + ' niet. ' : '') + 'Lees de cijfers onder de streep.'));
            var len = lengte(a), res = String(a - b); while (res.length < len) res = '0' + res;
            return { vraag:a + ' ' + MIN + ' ' + b,
              beeld:function(n){ var l = [['', a], [MIN, b]], o = {}, d = n - 1;
                if (n >= 1){ o[1] = 9; if (groot){ o[2] = 9; o[3] = k - 1; } else o[2] = k - 1; }
                if (d > 0) l.push(['', n >= stappen.length ? String(a - b) : res.slice(-d)]);
                return onder(l, [1], n >= 1 ? o : null); },
              stappen:stappen };
          } },
        { id:'cijf-aanvul', naam:'Aftrekken door aan te vullen', kort:'Spring van het kleine getal naar het grote: eerst naar een tiental, dan een honderdtal, dan het eind',
          uit:'<p>Bij 1000 − 368 kun je ook <b>aanvullen</b>. Je vraagt: hoeveel moet er bij 368 om bij 1000 te komen?</p><p>Spring in handige stappen: van 368 naar 370 (+2), naar 400 (+30), naar 1000 (+600). Tel de sprongen op: 2 + 30 + 600 = 632.</p><p>Zo hoef je niet over de nullen heen te lenen.</p>',
          wanneer:'je aftrekt van een rond getal en het tweede getal er dichtbij ligt.',
          maak:function(R){
            var a = K([1000, 1000, 2000, 3000, 5000, 10000]), b;
            do { b = a - R.heel(112, 988); } while (b % 10 === 0 || b >= a - 100);
            var c10 = Math.ceil(b / 10) * 10, c100 = Math.ceil(b / 100) * 100, spr = [];
            spr.push({ van:b, naar:c10 }); if (c100 > c10) spr.push({ van:c10, naar:c100 }); spr.push({ van:c100, naar:a });
            var stappen = spr.map(function(s, j){ var naam = j === spr.length - 1 ? 'het eind, ' + T(a) : (s.naar % 100 === 0 ? 'het volgende honderdtal, ' + T(s.naar) : 'het volgende tiental, ' + T(s.naar));
              return st('Spring van ' + T(s.van) + ' naar ' + naam + '. Hoeveel spring je?', s.naar - s.van, 'Reken ' + T(s.naar) + ' ' + MIN + ' ' + T(s.van) + ', of tel aan: ' + T(s.van) + ' + ... = ' + T(s.naar) + '.'); });
            stappen.push(st('Tel de sprongen op: ' + spr.map(function(s){ return s.naar - s.van; }).join(' + ') + ' =', a - b, 'Alle sprongen samen zijn het verschil.'));
            return { vraag:T(a) + ' ' + MIN + ' ' + T(b),
              beeld:function(k){ var v = Math.floor(b / 100) * 100; return R.teken.lijn({ van:v, tot:a, labels:[v, a], sprongen:spr.slice(0, k).map(function(s){ return { van:s.van, naar:s.naar, tekst:'+' + T(s.naar - s.van) }; }), stip:[b], nieuw:true }); },
              stappen:stappen };
          } },
        { id:'cijf-plusmin-kies', naam:'Kies de handigste manier', kort:'Rond of bijna rond: in je hoofd. Drie cijfers: kolomsgewijs. Vier of meer: cijferend',
          uit:'<p>Je kent nu drie manieren. Kies steeds de <b>handigste</b>:</p><p><b>In je hoofd</b> als de getallen rond of bijna rond zijn, zoals 450 + 300 of 499 + 236.</p><p><b>Kolomsgewijs</b> bij twee getallen van drie cijfers die niet rond zijn. <b>Cijferend</b> bij getallen van vier cijfers of meer: dan heb je de minste tussenuitkomsten.</p>',
          wanneer:'je een plus- of minsom krijgt en eerst even kijkt welke manier het snelst gaat.',
          maak:function(R){
            var soort = K(['hoofd', 'kolom', 'cijfer']), opties = ['In je hoofd', 'Kolomsgewijs', 'Cijferend'], a, b, plus = R.heel(0, 1) === 1, stappen = [], hint;
            if (soort === 'hoofd'){
              var vorm = R.heel(0, 2);
              if (vorm === 0){ a = R.heel(2, 6) * 100 + K([0, 50]); b = R.heel(1, 3) * 100 + K([0, 50]); plus = true; }
              else if (vorm === 1){ a = R.heel(2, 9) * 1000; b = R.heel(1, 9) * 100 + K([0, 50]); plus = false; }
              else { a = R.heel(2, 6) * 100 - 1; b = R.heel(111, 399); plus = true; }
              hint = 'De getallen zijn rond of bijna rond. Dan reken je het snelst in je hoofd.';
              stappen.push(kzVast('Welke manier is hier het handigst?', opties, 'In je hoofd', hint));
              if (vorm === 2){ stappen.push(st('Reken met ' + (a + 1) + ': ' + (a + 1) + ' + ' + b + ' =', a + 1 + b, (a + 1) + ' is een rond getal. Tel de honderdtallen erbij.'));
                stappen.push(st('Je telde 1 te veel. Haal 1 eraf:', a + b, (a + 1 + b) + ' ' + MIN + ' 1.')); }
              else stappen.push(st('Reken uit in je hoofd:', plus ? a + b : a - b, plus ? 'Eerst de honderdtallen, dan de rest.' : 'Hoeveel honderdtallen blijven er over? Denk aan ' + T(a) + ' = ' + (a / 100) + ' honderdtallen.'));
            } else if (soort === 'kolom'){
              do { a = R.heel(234, 987); b = R.heel(123, 876); } while (a % 10 === 0 || b % 10 === 0 || a % 100 > 95 || b % 100 > 95 || (!plus && b >= a - 50));
              hint = 'Twee getallen van drie cijfers, niet rond. Kolomsgewijs zie je alle tussenstappen.';
              stappen.push(kzVast('Welke manier is hier het handigst?', opties, 'Kolomsgewijs', hint));
              var h = (dR(a, 2) + (plus ? 1 : -1) * dR(b, 2)) * 100;
              stappen.push(st('Begin links bij de honderdtallen: ' + dR(a, 2) * 100 + (plus ? ' + ' : ' ' + MIN + ' ') + dR(b, 2) * 100 + ' =', h, 'Reken ' + dR(a, 2) + (plus ? ' + ' : ' ' + MIN + ' ') + dR(b, 2) + ' en zet er twee nullen achter.'));
              stappen.push(st('Doe ook de tientallen en eenheden en tel alles samen. Het antwoord:', plus ? a + b : a - b, plus ? 'Tientallen: ' + dR(a, 1) * 10 + ' + ' + dR(b, 1) * 10 + '. Eenheden: ' + dR(a, 0) + ' + ' + dR(b, 0) + '.' : 'Tientallen: ' + dR(a, 1) * 10 + ' ' + MIN + ' ' + dR(b, 1) * 10 + '. Eenheden: ' + dR(a, 0) + ' ' + MIN + ' ' + dR(b, 0) + '. Een min mag.'));
            } else {
              do { a = R.heel(2345, 9876); b = R.heel(1234, 9876); } while (a % 10 === 0 || b % 10 === 0 || (plus ? a % 10 + b % 10 < 10 : (a % 10 >= b % 10 || b > a - 500)));
              hint = 'Getallen van vier cijfers: cijferend gaat het snelst.';
              stappen.push(kzVast('Welke manier is hier het handigst?', opties, 'Cijferend', hint));
              stappen.push(st('Begin rechts bij de eenheden: ' + (plus ? dR(a, 0) + ' + ' + dR(b, 0) : (dR(a, 0) + 10) + ' ' + MIN + ' ' + dR(b, 0) + ' (je leent 1)') + ' =', plus ? dR(a, 0) + dR(b, 0) : dR(a, 0) + 10 - dR(b, 0), plus ? 'Schrijf het laatste cijfer op en onthoud 1.' : 'Je leent 1 van de tientallen, dus je hebt ' + (dR(a, 0) + 10) + '.'));
              stappen.push(st('Reken alle kolommen uit. Het antwoord:', plus ? a + b : a - b, plus ? 'Vergeet het onthouden niet.' : 'Vergeet niet dat je bij de tientallen 1 leende.'));
            }
            return { vraag:T(a) + (plus ? ' + ' : ' ' + MIN + ' ') + T(b), stappen:stappen, antwoord:S(plus ? a + b : a - b) };
          } }
      ] },

    { groep:{ id:'cijf-keer', niveau:'1F', domein:'getallen', naam:'Vermenigvuldigen onder elkaar', uit:'Grote keersommen met het rooster, kolomsgewijs met deelproducten, en cijferend met één of twee cijfers.' },
      doelen:[
        { id:'cijf-hokjes', naam:'De hokjesmethode', kort:'Splits beide getallen, reken elk hokje uit en tel alle hokjes op',
          uit:'<p>Bij de <b>hokjesmethode</b> splits je de getallen in tientallen en eenheden (of honderdtallen). Je zet ze in een <b>rooster</b>: het ene getal boven, het andere links.</p><p>In elk hokje reken je een kleine keersom uit. Tot slot tel je alle hokjes op.</p><p>Voorbeeld: 34 × 27. Boven 30 en 4, links 20 en 7. De hokjes: 600, 80, 210 en 28. Samen 918.</p>',
          wanneer:'je overzicht wilt houden over alle stukjes van een keersom.',
          maak:function(R){
            var tweeTwee = R.heel(0, 2) > 0, a, b, kop, zij;
            if (tweeTwee){ do { a = R.heel(12, 98); b = R.heel(12, 98); } while (a % 10 === 0 || b % 10 === 0); kop = [a - a % 10, a % 10]; zij = [b - b % 10, b % 10]; }
            else { do { a = R.heel(123, 987); } while (a % 10 === 0 || dR(a, 1) === 0); b = R.heel(3, 9); kop = [dR(a, 2) * 100, dR(a, 1) * 10, a % 10]; zij = [b]; }
            var cellen = [];
            zij.forEach(function(z, r){ kop.forEach(function(k, c){ cellen.push({ r:r, c:c, z:z, k:k, p:z * k }); }); });
            function nullen(x){ var n = 0; while (x && x % 10 === 0){ n++; x /= 10; } return n; }
            var stappen = cellen.map(function(c){ var nz = nullen(c.z) + nullen(c.k), kz2 = c.z / Math.pow(10, nullen(c.z)), kk = c.k / Math.pow(10, nullen(c.k));
              return st('Hokje: ' + c.z + ' ' + X + ' ' + c.k + ' =', c.p, nz ? kz2 + ' ' + X + ' ' + kk + ' = ' + kz2 * kk + '. Zet er ' + (nz === 1 ? 'een nul' : nz === 2 ? 'twee nullen' : nz + ' nullen') + ' achter.' : 'Een som uit de tafels: ' + c.z + ' ' + X + ' ' + c.k + '.'); });
            stappen.push(st('Tel alle hokjes op: ' + cellen.map(function(c){ return c.p; }).join(' + ') + ' =', a * b, 'Begin met de grootste getallen.'));
            return { vraag:a + ' ' + X + ' ' + b,
              beeld:function(n){ var vak = zij.map(function(z, r){ return kop.map(function(k, c){ var i = r * kop.length + c; return i < n ? T(z * k) : (i === n ? '?' : ''); }); }); return R.teken.rooster(kop, zij, vak) + (n > cellen.length ? '<p class="lr-wanneer"><b>Samen</b> ' + T(a * b) + '</p>' : ''); },
              stappen:stappen };
          } },
        { id:'cijf-kolomkeer', naam:'Kolomsgewijs vermenigvuldigen', kort:'Reken de deelproducten uit, zet ze onder elkaar en tel ze op',
          uit:'<p>Bij <b>kolomsgewijs vermenigvuldigen</b> zet je de getallen onder elkaar. Je rekent de <b>deelproducten</b> uit en zet ze onder de streep, onder elkaar.</p><p>Voorbeeld: 364 × 7. 7 × 300 = 2100, 7 × 60 = 420, 7 × 4 = 28. Samen 2548.</p><p>Bij 36 × 24 zijn er vier deelproducten: 20 × 30, 20 × 6, 4 × 30 en 4 × 6.</p>',
          wanneer:'je de stappen van een grote keersom netjes onder elkaar wilt zien.',
          maak:function(R){
            var drie = R.heel(0, 1) === 1, a, b, delen = [];
            if (drie){ do { a = R.heel(123, 987); } while (a % 10 === 0 || dR(a, 1) === 0); b = R.heel(3, 9); [2, 1, 0].forEach(function(i){ var x = dR(a, i) * Math.pow(10, i); delen.push({ x:b, y:x, p:b * x }); }); }
            else { do { a = R.heel(13, 98); b = R.heel(13, 98); } while (a % 10 === 0 || b % 10 === 0); var tb = b - b % 10, eb = b % 10, ta = a - a % 10, ea = a % 10;
              delen = [{ x:tb, y:ta, p:tb * ta }, { x:tb, y:ea, p:tb * ea }, { x:eb, y:ta, p:eb * ta }, { x:eb, y:ea, p:eb * ea }]; }
            var stappen = delen.map(function(d){ return st(d.x + ' ' + X + ' ' + d.y + ' =', d.p, (d.x % 10 === 0 || d.y % 10 === 0) ? 'Reken zonder de nullen en zet ze er daarna achter.' : 'Een som uit de tafels.'); });
            stappen.push(st('Tel de deelproducten op: ' + delen.map(function(d){ return d.p; }).join(' + ') + ' =', a * b, 'Tel ze onder elkaar op, of begin met de grootste.'));
            return { vraag:a + ' ' + X + ' ' + b,
              beeld:function(n){ var l = [['', a], [X, b]]; delen.forEach(function(d, j){ if (j < n) l.push(['', d.p]); }); if (n > delen.length) l.push(['', a * b]); return onder(l, n > delen.length ? [1, 1 + delen.length] : [1]); },
              stappen:stappen };
          } },
        { id:'cijf-cijfer1', naam:'Cijferend keer één cijfer', kort:'Begin rechts, vermenigvuldig elk cijfer en onthoud de tientallen voor de volgende kolom',
          uit:'<p>Bij <b>cijferend vermenigvuldigen</b> begin je rechts. Je vermenigvuldigt elk cijfer van het bovenste getal met het onderste cijfer.</p><p>Is de uitkomst 10 of meer? Schrijf het laatste cijfer op en <b>onthoud</b> de tientallen. Die tel je op bij de volgende kolom.</p><p>Voorbeeld: 364 × 7. 7 × 4 = 28: schrijf 8, onthoud 2. 7 × 6 = 42, + 2 = 44: schrijf 4, onthoud 4. 7 × 3 = 21, + 4 = 25. Antwoord 2548.</p>',
          wanneer:'je een groot getal met één cijfer vermenigvuldigt.',
          maak:function(R){
            var len = R.heel(3, 4), lo = Math.pow(10, len - 1), a, d, ov;
            do { a = R.heel(lo + 1, lo * 10 - 1); d = R.heel(3, 9); ov = 0; for (var i = 0; i < len - 1; i++) if (dR(a, i) * d >= 10) ov++; } while (ov < 2 || a % 10 === 0);
            var stappen = [], c = 0, onth = [];
            for (i = 0; i < len; i++){
              var x = dR(a, i), p = d * x + c, laatste = i === len - 1;
              stappen.push(st((i === 0 ? 'Begin rechts. ' : '') + 'De ' + PLAATS[i] + ': ' + d + ' ' + X + ' ' + x + (c ? ' + ' + c + ' (onthouden)' : '') + ' =', p,
                c ? 'Eerst ' + d + ' ' + X + ' ' + x + ' = ' + d * x + ', dan de ' + c + ' erbij.' : 'De tafel van ' + d + ': ' + d + ' ' + X + ' ' + x + '.',
                { waarom:!laatste && p >= 10 ? 'Schrijf ' + (p % 10) + ' op en onthoud ' + Math.floor(p / 10) + '.' : 'Schrijf ' + p + ' op.', fout:c ? F([[d * x, 'Je vergat de ' + c + ' die je onthouden had.']], p) : {} }));
              c = Math.floor(p / 10); onth.push(c);
            }
            stappen.push(st('Het antwoord:', a * d, 'Lees de cijfers onder de streep van links naar rechts.'));
            return { vraag:a + ' ' + X + ' ' + d,
              beeld:function(k){ var l = [['', a], [X, d]], o = {}; for (var j = 0; j < Math.min(k, len - 1); j++) if (onth[j]) o[j + 1] = onth[j]; if (k) l.push(['', k >= len ? String(a * d) : String(a * d).slice(-k)]); return onder(l, [1], o); },
              stappen:stappen };
          } },
        { id:'cijf-cijfer2', naam:'Cijferend keer twee cijfers', kort:'Eerst keer de eenheden, dan keer de tientallen met een 0 vooraan, en tel de regels op',
          uit:'<p>Bij 46 × 37 maak je <b>twee regels</b>. De eerste regel is 46 × 7 = 322.</p><p>De tweede regel is 46 × 30. De 3 van 37 betekent 3 tientallen. Daarom zet je eerst een <b>0</b> onder de eenheden en reken je dan 46 × 3 = 138 erachter. Zo krijg je 1380.</p><p>Tot slot tel je de regels op: 322 + 1380 = 1702.</p>',
          wanneer:'je vermenigvuldigt met een getal van twee cijfers.',
          maak:function(R){
            var a, b;
            do { a = R.heel(0, 2) ? R.heel(13, 98) : R.heel(112, 489); b = R.heel(13, 98); } while (b % 10 === 0 || a % 10 === 0 || b % 10 === 1);
            var eb = b % 10, tb = Math.floor(b / 10), r1 = a * eb, r2 = a * tb * 10;
            return { vraag:a + ' ' + X + ' ' + b,
              beeld:function(n){ var l = [['', a], [X, b]]; if (n >= 1) l.push(['', r1]); if (n >= 2) l.push(['+', r2]); if (n >= 3) l.push(['', a * b]); return onder(l, n >= 3 ? [1, 3] : [1]); },
              stappen:[
                st('Eerste regel: ' + a + ' ' + X + ' ' + eb + ' =', r1, 'Cijferend van rechts naar links, met onthouden.'),
                st('Tweede regel: de ' + tb + ' van ' + b + ' is ' + tb + ' tientallen. Zet eerst een 0 onder de eenheden. ' + a + ' ' + X + ' ' + tb * 10 + ' =', r2, a + ' ' + X + ' ' + tb + ' = ' + a * tb + ', met een 0 erachter.', { fout:F([[a * tb, 'Vergeet de 0 niet: je rekent met ' + tb * 10 + ', niet met ' + tb + '.']]) }),
                st('Tel de twee regels op: ' + r1 + ' + ' + r2 + ' =', a * b, 'Cijferend optellen, van rechts naar links.') ] };
          } }
      ] },

    { groep:{ id:'cijf-deel', niveau:'1F', domein:'getallen', naam:'Delen onder elkaar', uit:'Grote deelsommen met happen of met een staartdeling, delen met een rest, en wat je met die rest doet in een verhaal.' },
      doelen:[
        { id:'cijf-hap', naam:'De hapmethode', kort:'Haal steeds een grote hap van het getal af, en tel aan het eind de happen op',
          uit:'<p>Bij de <b>hapmethode</b> haal je steeds een grote hap van het getal af. Een hap is een handig aantal keer de deler, zoals 100 keer, 20 keer of 5 keer.</p><p>Voorbeeld: 744 : 6. Hap 100 × 6 = 600, er blijft 144 over. Hap 20 × 6 = 120, er blijft 24 over. Hap 4 × 6 = 24, er blijft 0 over.</p><p>Tel de happen op: 100 + 20 + 4 = <b>124</b>.</p>',
          wanneer:'je een groot getal deelt en liever met handige stukken werkt dan met een staartdeling.',
          maak:function(R){
            var d = K([3, 4, 6, 7, 8, 9, 12, 15, 25]), q;
            do { q = d < 10 ? R.heel(21, 199) : R.heel(21, 79); } while (q % 10 === 0);
            var N = q * d, happen = [Math.floor(q / 100) * 100, Math.floor(q / 10) % 10 * 10, q % 10].filter(function(x){ return x; }), over = N, rijen = [];
            var stappen = happen.map(function(h){ var oud = over; over -= h * d; rijen.push([T(over), MIN + ' ' + T(h * d), h + ' ' + X]);
              return st('Neem een hap van ' + h + ' ' + X + ' ' + d + '. Hoeveel blijft er over van ' + T(oud) + '?', over, h + ' ' + X + ' ' + d + ' = ' + T(h * d) + '. Reken ' + T(oud) + ' ' + MIN + ' ' + T(h * d) + '.', { waarom:h + ' ' + X + ' ' + d + ' = ' + T(h * d) }); });
            stappen.push(st('Tel de happen op: ' + happen.join(' + ') + ' =', q, 'Zoveel keer past ' + d + ' in ' + T(N) + '.'));
            return { vraag:T(N) + ' : ' + d,
              beeld:function(n){ var r = [['nog over', 'hap eraf', 'keer'], [T(N), '', '']].concat(rijen.slice(0, n)); if (n > happen.length) r.push(['', 'samen', q + ' ' + X]); return R.teken.tabel(r, { kop:true }); },
              stappen:stappen };
          } },
        { id:'cijf-staart', naam:'De staartdeling', kort:'Deel cijfer voor cijfer van links naar rechts en neem de rest mee naar het volgende cijfer',
          uit:'<p>Bij een <b>staartdeling</b> deel je het getal <b>cijfer voor cijfer</b>, van links naar rechts.</p><p>Voorbeeld: 744 : 6. Hoe vaak past 6 in 7? 1 keer, er blijft 1 over. Haal de 4 erbij: 14. Hoe vaak past 6 in 14? 2 keer, er blijft 2 over. Haal de 4 erbij: 24. 6 past 4 keer in 24.</p><p>Lees de uitkomsten achter elkaar: <b>124</b>. Past de deler niet? Schrijf dan een 0 op.</p>',
          wanneer:'je cijferend deelt door één cijfer.',
          maak:function(R){
            var d = R.heel(2, 9), q, N;
            do { q = R.heel(12, 299); N = q * d; } while (N < 100 || N > 9999);
            var ds = String(N), cur = 0, i = 0, stappen = [], rijen = [];
            while (cur < d){ cur = cur * 10 + (+ds[i++]); }
            var qd = Math.floor(cur / d), rest = cur - qd * d;
            stappen.push(st((i > 1 ? ds[0] + ' is te klein. Neem ' + cur + '. ' : '') + 'Hoe vaak past ' + d + ' in ' + cur + '?', qd, 'Welk getal keer ' + d + ' komt het dichtst bij ' + cur + ', zonder erboven te komen?', { waarom:qd + ' ' + X + ' ' + d + ' = ' + qd * d + ', er blijft ' + rest + ' over.' }));
            rijen.push([String(cur), String(qd), String(rest)]);
            while (i < ds.length){
              var c = +ds[i++]; cur = rest * 10 + c; qd = Math.floor(cur / d); var oud = rest; rest = cur - qd * d;
              stappen.push(st('Er bleef ' + oud + ' over. Haal de ' + c + ' erbij: ' + cur + '. Hoe vaak past ' + d + ' in ' + cur + '?', qd, qd ? 'Zoek in de tafel van ' + d + ' het grootste getal dat niet boven ' + cur + ' komt.' : d + ' is groter dan ' + cur + '. Het past 0 keer: schrijf een 0 op.', { waarom:qd ? qd + ' ' + X + ' ' + d + ' = ' + qd * d + ', er blijft ' + rest + ' over.' : 'Past niet: schrijf een 0 op.' }));
              rijen.push([String(cur), String(qd), String(rest)]);
            }
            stappen.push(st('Lees de uitkomsten achter elkaar. Het antwoord:', q, 'De cijfers die je opschreef: ' + rijen.map(function(r){ return r[1]; }).join(', ') + '.'));
            return { vraag:N + ' : ' + d,
              beeld:function(n){ return R.teken.tabel([['je deelt', 'past', 'blijft over']].concat(rijen.slice(0, n)), { kop:true }); },
              stappen:stappen };
          } },
        { id:'cijf-rest', naam:'Delen met rest', kort:'Wat overblijft is de rest; schrijf die als breuk of als kommagetal',
          uit:'<p>Bij 47 : 4 past de 4 <b>11 keer</b> (11 × 4 = 44). Er blijft <b>3</b> over: dat is de <b>rest</b>.</p><p>De rest kun je ook verdelen. 3 van de 4 is de breuk 3/4. Dus 47 : 4 = 11 3/4.</p><p>Als kommagetal: 3/4 = 0,75. Dus 47 : 4 = <b>11,75</b>.</p>',
          wanneer:'een deling niet precies uitkomt en je toch een exact antwoord wilt.',
          maak:function(R){
            var d = K([2, 4, 5, 8, 10, 20, 25]), q = R.heel(3, 40), r = R.heel(1, d - 1), N = q * d + r, g = ggd(r, d), br = r + '/' + d, kb = (r / g) + '/' + (d / g);
            var brs = g > 1 ? [br, kb] : [br], dec = rnd(r / d);
            return { vraag:N + ' : ' + d, context:'Reken uit. Schrijf de rest als breuk en als kommagetal.',
              beeld:function(n){ return klein([['past', 'rest', 'breuk', 'kommagetal'], [n >= 1 ? String(q) : '?', n >= 2 ? String(r) : '?', n >= 3 ? br : '?', n >= 4 ? S(q + dec) : '?']], { kop:true }); },
              stappen:[
                st('Hoe vaak past ' + d + ' helemaal in ' + N + '?', q, q + ' ' + X + ' ' + d + ' = ' + q * d + '. Past er nog een ' + d + ' bij?'),
                st('Hoeveel blijft er over? ' + N + ' ' + MIN + ' ' + q * d + ' =', r, 'Trek ' + q * d + ' van ' + N + ' af.'),
                st('De rest is ' + r + ' van de ' + d + '. Als breuk:', brs, 'De rest boven de streep, de deler eronder.'),
                st('Als kommagetal: ' + q + ' + ' + br + ' =', [S(q + dec), q + ' ' + br].concat(g > 1 ? [q + ' ' + kb] : []), br + ' = ' + r + ' : ' + d + ' = ' + S(dec) + '. Tel dat bij ' + q + '.') ] };
          } },
        { id:'cijf-verhaal', naam:'Delen in een verhaal', kort:'Kijk in het verhaal wat je met de rest doet: naar boven of naar beneden afronden',
          uit:'<p>In een verhaal moet je goed nadenken over de <b>rest</b>.</p><p>130 leerlingen in busjes van 8: 130 : 8 = 16, rest 2. Die 2 leerlingen moeten ook mee. Je hebt dus <b>17</b> busjes nodig: naar boven afronden.</p><p>130 snoepjes in zakjes van 8: ook 16, rest 2. Maar 2 snoepjes vullen geen zakje. Je kunt <b>16</b> zakjes helemaal vullen: naar beneden afronden.</p>',
          wanneer:'een deling uit een verhaal niet precies uitkomt.',
          maak:function(R){
            var C = K([
              { t:'{N} leerlingen gaan op schoolreis met busjes. In een busje passen {k} leerlingen. Hoeveel busjes zijn er nodig?', e:'busjes', k:[8, 9], N:[60, 250], op:true },
              { t:'Er komen {N} gasten op een feest. Aan een tafel passen {k} mensen. Hoeveel tafels heb je nodig?', e:'tafels', k:[6, 8, 10], N:[40, 200], op:true },
              { t:'Je verhuist {N} boeken. In een doos passen {k} boeken. Hoeveel dozen heb je nodig?', e:'dozen', k:[12, 15, 20], N:[100, 400], op:true },
              { t:'{N} kinderen gaan kamperen. In een tent slapen {k} kinderen. Hoeveel tenten zijn er nodig?', e:'tenten', k:[3, 4, 6], N:[25, 90], op:true },
              { t:'Een lift neemt {k} mensen tegelijk mee. {N} mensen willen naar boven. Hoe vaak moet de lift minstens gaan?', e:'keer', k:[6, 8, 12], N:[40, 150], op:true },
              { t:'Je hebt {N} snoepjes. In een zakje doe je er {k}. Hoeveel zakjes kun je helemaal vullen?', e:'zakjes', k:[6, 8, 12], N:[50, 300], op:false },
              { t:'Je hebt € {N}. Een bioscoopkaartje kost € {k}. Hoeveel kaartjes kun je kopen?', e:'kaartjes', k:[7, 9, 11, 12], N:[30, 120], op:false },
              { t:'Een plank is {N} cm lang. Je zaagt er stukken van {k} cm van. Hoeveel hele stukken krijg je?', e:'stukken', k:[15, 25, 30, 40], N:[150, 400], op:false },
              { t:'Een boer heeft {N} eieren. In een doos gaan er {k}. Hoeveel volle dozen krijgt hij?', e:'dozen', k:[6, 10, 12], N:[50, 300], op:false },
              { t:'In een zaal staan {N} stoelen. In een rij passen {k} stoelen. Hoeveel volle rijen kun je maken?', e:'rijen', k:[8, 12, 15], N:[60, 250], op:false } ]);
            var k = K(C.k), N; do { N = R.heel(C.N[0], C.N[1]); } while (N % k === 0 || N < 2 * k);
            var q = Math.floor(N / k), r = N - q * k, ant = C.op ? q + 1 : q;
            var goedT = C.op ? 'Er is er nog één nodig: naar boven afronden' : 'De rest is niet genoeg: naar beneden afronden', foutT = C.op ? 'De rest is niet genoeg: naar beneden afronden' : 'Er is er nog één nodig: naar boven afronden';
            return { vraag:N + ' : ' + k, context:C.t.replace('{N}', N).replace('{k}', k), eenheid:C.e,
              stappen:[
                st('Hoe vaak past ' + k + ' helemaal in ' + N + '?', q, q + ' ' + X + ' ' + k + ' = ' + q * k + '. Probeer of er nog een ' + k + ' bij past.'),
                st('Hoeveel blijft er over? ' + N + ' ' + MIN + ' ' + q * k + ' =', r, 'Trek ' + q * k + ' van ' + N + ' af.'),
                kz('Wat doe je met de rest van ' + r + '?', goedT, [foutT], C.op ? 'Wat overblijft, telt ook mee. Daar is er nog één voor nodig.' : 'Met ' + r + ' kun je er geen volle meer maken. Die tellen niet mee.'),
                st('Het antwoord:', ant, C.op ? q + ' plus nog één.' : 'Alleen de volle tellen: ' + q + '.', { eenheid:C.e, fout:F([[C.op ? q : q + 1, C.op ? 'Dan blijven er ' + r + ' over. Die moeten ook mee.' : 'Met de rest van ' + r + ' kun je er geen volle maken.']]) }) ] };
          } }
      ] },

    { groep:{ id:'komma-basis', niveau:'1F', domein:'getallen', naam:'Kommagetallen', uit:'Tienden, honderdsten en duizendsten: wat een cijfer achter de komma waard is, kommagetallen op de lijn, vergelijken, optellen en aftrekken, keer en gedeeld door 10, 100 en 1000, en afronden.' },
      doelen:[
        { id:'komma-plaats', naam:'Tienden, honderdsten en duizendsten', kort:'Het eerste cijfer na de komma zijn tienden, dan honderdsten, dan duizendsten',
          uit:'<p>Achter de komma gaat de plaatswaarde verder. Het eerste cijfer zijn de <b>tienden</b>, het tweede de <b>honderdsten</b>, het derde de <b>duizendsten</b>.</p><p>In 3,472 is de 4 dus 4 tienden (0,4), de 7 is 7 honderdsten (0,07) en de 2 is 2 duizendsten (0,002).</p>',
          wanneer:'je wilt weten hoeveel een cijfer achter de komma waard is.',
          maak:function(R){
            var ip, dd, p, v, alle;
            do { ip = R.heel(0, 2) ? R.heel(1, 9) : R.heel(10, 99); dd = [R.heel(1, 9), R.heel(1, 9), R.heel(1, 9)]; p = R.heel(0, 2); v = dd[p]; alle = String(ip).split('').map(Number).concat(dd); } while (alle.filter(function(x){ return x === v; }).length > 1);
            var x = ip + dd[0] / 10 + dd[1] / 100 + dd[2] / 1000, NAMEN = ['tienden', 'honderdsten', 'duizendsten'], kol = 5 + p;
            var waarde = rnd(v / Math.pow(10, p + 1));
            return { vraag:S(x), context:'Hoeveel is de <b>' + v + '</b> waard?',
              beeld:function(n){ return pwTabel([x], { kolom:n >= 1 ? p : null }); },
              stappen:[
                kz('Op welke plaats staat de ' + v + '?', NAMEN[p], NAMEN.filter(function(x, i){ return i !== p; }).concat(['eenheden']).slice(0, 3), 'Tel de cijfers achter de komma: eerst tienden, dan honderdsten, dan duizendsten.'),
                st('Hoeveel is de ' + v + ' dan waard?', [S(waarde), v + '/' + Math.pow(10, p + 1)], '1 tiende = 0,1, 1 honderdste = 0,01, 1 duizendste = 0,001. Dus ' + v + ' ' + NAMEN[p] + ' = ' + v + ' keer zoveel.', { fout:F([[v, 'Dat is het cijfer zelf. Het staat achter de komma, dus het is minder dan 1.'], [v * Math.pow(10, p + 1), 'Achter de komma wordt het kleiner, niet groter.']]) }) ] };
          } },
        { id:'komma-lijn', naam:'Kommagetallen op de getallenlijn', kort:'Kijk hoeveel één stukje is, en tel de stukjes vanaf het begin',
          uit:'<p>Tussen 2 en 3 kun je de lijn in <b>10 stukjes</b> verdelen. Elk stukje is dan <b>0,1</b>: 2,1, 2,2, 2,3 en zo verder.</p><p>Tussen 2,3 en 2,4 kun je weer in 10 stukjes verdelen. Elk stukje is dan 0,01: 2,31, 2,32, 2,33 ...</p><p>Kijk dus eerst <b>hoeveel één stukje is</b>. Tel dan de stukjes tot de stip.</p>',
          wanneer:'je een kommagetal op een lijn, liniaal of maatbeker moet aflezen.',
          maak:function(R){
            var hon = R.heel(0, 1) === 1, a = hon ? R.heel(0, 9) + R.heel(0, 9) / 10 : R.heel(0, 9), stuk = hon ? 0.01 : 0.1, k = R.heel(1, 9);
            a = rnd(a); var tot = rnd(a + stuk * 10), v = rnd(a + k * stuk);
            function beeld(n){ return lijnZonder({ van:a, tot:tot, streep:stuk, labels:[a, tot], stip:[v] }, [v], n >= 3); }
            return { vraag:'stip ' + S(v), vraagHtml:'Welk getal hoort bij de stip?', zelfBeeld:function(){ return beeld(0); },
              beeld:beeld,
              stappen:[
                st('In hoeveel stukjes is de lijn van ' + S(a) + ' tot ' + S(tot) + ' verdeeld?', 10, 'Tel de stukjes tussen de streepjes.'),
                st('Hoeveel is één stukje?', S(stuk), 'Van ' + S(a) + ' tot ' + S(tot) + ' is ' + S(stuk * 10) + '. Deel dat door 10.', { fout:F([[1, 'De hele lijn is maar ' + S(stuk * 10) + ' lang. Eén stukje is dus kleiner.']]) }),
                st('Tel de stukjes vanaf ' + S(a) + ' tot de stip. Welk getal hoort bij de stip?', S(v), 'De stip staat ' + k + ' stukjes na ' + S(a) + ': ' + S(a) + ' + ' + k + ' ' + X + ' ' + S(stuk) + '.') ] };
          } },
        { id:'komma-vergelijk', naam:'Kommagetallen vergelijken', kort:'Maak de getallen even lang met nullen, en vergelijk dan',
          uit:'<p>Wat is groter: 0,5 of 0,45? Veel mensen denken 0,45, want 45 is meer dan 5. Maar dat klopt niet!</p><p>Maak de getallen eerst <b>even lang</b>: zet een 0 achter 0,5. Dan krijg je <b>0,50</b>. Een nul achteraan verandert niets aan het getal.</p><p>Nu vergelijk je 50 honderdsten met 45 honderdsten. Dus 0,5 is groter.</p>',
          wanneer:'je kommagetallen met een verschillend aantal cijfers achter de komma vergelijkt.',
          maak:function(R){
            var i = R.heel(0, 9), a, b;
            do { a = R.heel(1, 9); b = R.heel(11, 99); } while (b % 10 === 0 || Math.abs(a * 10 - b) < 3);
            var x = rnd(i + a / 10), y = rnd(i + b / 100), groter = R.heel(0, 1) === 1, ant = groter ? Math.max(x, y) : Math.min(x, y);
            var paar = R.hussel([x, y]);
            return eindKeuze({ vraag:S(paar[0]) + ' of ' + S(paar[1]), context:'Welk getal is <b>' + (groter ? 'groter' : 'kleiner') + '</b>?',
              stappen:[
                st('Maak ' + S(x) + ' even lang als ' + S(y) + ': zet er een 0 achter.', i + ',' + a + '0', 'Schrijf ' + S(x) + ' met twee cijfers achter de komma.'),
                kz('Vergelijk ' + a * 10 + ' honderdsten met ' + b + ' honderdsten. Welke is meer?', (a * 10 > b ? a * 10 : b) + ' honderdsten', [(a * 10 > b ? b : a * 10) + ' honderdsten'], 'Welk getal is groter: ' + a * 10 + ' of ' + b + '?'),
                kz('Welk getal is ' + (groter ? 'groter' : 'kleiner') + '?', S(ant), [S(ant === x ? y : x)], S(Math.max(x, y)) + ' is het grotere getal, want ' + Math.max(a * 10, b) + ' honderdsten is meer.') ] });
          } },
        { id:'komma-plusmin', naam:'Kommagetallen optellen en aftrekken', kort:"Zet de komma's onder elkaar, vul aan met nullen en reken zoals altijd",
          uit:"<p>Bij optellen en aftrekken met kommagetallen zet je de <b>komma's onder elkaar</b>. Dan staan de tienden onder de tienden en de honderdsten onder de honderdsten.</p><p>Heeft een getal minder cijfers achter de komma? <b>Vul aan met nullen</b>: 12,5 wordt 12,50 en € 20 wordt € 20,00.</p><p>Reken dan uit zonder op de komma te letten, en zet de komma in het antwoord recht onder de andere komma's.</p>",
          wanneer:'je met geld rekent of met maten zoals meters en kilo\'s.',
          maak:function(R){
            var geld = R.heel(0, 2) === 0, x, y, plus;
            if (geld){ x = K([5, 10, 20, 50]); y = R.heel(101, x * 100 - 101) / 100; if (Math.round(y * 100) % 10 === 0) y = rnd(y + 0.01); plus = false; }
            else { do { x = R.heel(11, 299) / 10; y = R.heel(101, 999) / 100; plus = R.heel(0, 1) === 1; } while (Math.round(x * 10) % 10 === 0 || Math.round(y * 100) % 10 === 0 || (!plus && y >= x)); }
            var X100 = Math.round(x * 100), Y100 = Math.round(y * 100), r100 = plus ? X100 + Y100 : X100 - Y100, r = r100 / 100, opT = plus ? ' + ' : ' ' + MIN + ' ';
            return { vraag:geld ? '€ ' + x + opT + E(y) : S(x) + opT + S(y), context:geld ? 'Je betaalt met een biljet van € ' + x + '. Het kost ' + E(y) + '. Hoeveel krijg je terug?' : "Reken uit. Zet de komma's onder elkaar.",
              beeld:function(n){ var l = [['', n >= 1 ? S2(x) : (geld ? String(x) + '   ' : S(x) + ' ')], [plus ? '+' : MIN, S2(y)]]; if (n >= 3) l.push(['', S2(r)]); return onder(l, [1]); },
              stappen:[
                st('Geef ' + (geld ? '€ ' + x : S(x)) + ' ook twee cijfers achter de komma:', S2(x), geld ? 'Een heel bedrag krijgt ,00 erachter.' : 'Zet er een 0 achter.'),
                st('Reken uit zonder komma: ' + X100 + opT + Y100 + ' =', r100, plus ? 'Cijferend optellen, van rechts naar links.' : 'Cijferend aftrekken, of aanvullen van ' + Y100 + ' tot ' + X100 + '.'),
                st('Zet de komma terug: twee cijfers van achteren.', S2(r), 'Tel twee cijfers van rechts in ' + r100 + ' en zet daar de komma.', { fout:F([[r100, 'Vergeet de komma niet.']]) }) ] };
          } },
        { id:'komma-keer10', naam:'Keer 10, 100 en 1000', kort:'Bij keer schuift de komma naar rechts: zoveel plaatsen als er nullen zijn',
          uit:'<p>Bij <b>keer 10</b> wordt het getal 10 keer zo groot. Elk cijfer schuift één plaats op, of anders gezegd: de <b>komma schuift één plaats naar rechts</b>.</p><p>Bij keer 100 schuift de komma 2 plaatsen, bij keer 1000 schuift hij 3 plaatsen. Zijn er geen cijfers meer? Vul aan met nullen.</p><p>Voorbeeld: 3,75 × 100 = 375 en 0,4 × 1000 = 400.</p>',
          wanneer:'je omrekent, zoals van meter naar centimeter of van euro naar cent.',
          maak:function(R){
            var f = K([10, 100, 1000]), z = lengte(f) - 1, m, k, x, res;
            do { k = R.heel(1, 3); m = R.heel(11, 9999); x = rnd(m / Math.pow(10, k)); res = rnd(m * f / Math.pow(10, k)); } while (m % 10 === 0 || res >= 10000 || x >= 1000);
            return { vraag:S(x) + ' ' + X + ' ' + T(f),
              beeld:function(n){ return pwTabel([x, n >= 3 ? res : '?']); },
              stappen:[
                st('Hoeveel nullen heeft ' + T(f) + '?', z, 'Tel de nullen achter de 1.'),
                kz('Het getal wordt ' + T(f) + ' keer zo groot. Naar welke kant schuift de komma?', 'naar rechts', ['naar links'], 'Bij keer wordt het getal groter. De komma schuift dan naar rechts.'),
                st('Schuif de komma ' + z + (z === 1 ? ' plaats' : ' plaatsen') + ' naar rechts:', res, 'Verplaats de komma in ' + S(x) + ' ' + z + ' keer één cijfer naar rechts. Vul aan met nullen als dat nodig is.', { fout:F([[rnd(m / Math.pow(10, k) / f), 'Je schoof de komma naar links. Bij keer gaat hij naar rechts.']]) }) ] };
          } },
        { id:'komma-deel10', naam:'Gedeeld door 10, 100 en 1000', kort:'Bij delen schuift de komma naar links: zoveel plaatsen als er nullen zijn',
          uit:'<p>Bij <b>gedeeld door 10</b> wordt het getal 10 keer zo klein. De <b>komma schuift één plaats naar links</b>.</p><p>Bij : 100 schuift de komma 2 plaatsen, bij : 1000 schuift hij 3 plaatsen. Staat er geen cijfer meer? Zet er een 0 voor.</p><p>Voorbeeld: 45 : 100 = 0,45 en 3,7 : 1000 = 0,0037.</p>',
          wanneer:'je omrekent, zoals van centimeter naar meter of van gram naar kilo.',
          maak:function(R){
            var f = K([10, 100, 1000]), z = lengte(f) - 1, m, k, x, res;
            do { k = R.heel(0, 3 - z); m = R.heel(2, 9999); x = rnd(m / Math.pow(10, k)); res = rnd(m / Math.pow(10, k + z)); } while (m % 10 === 0 || x >= 10000);
            return { vraag:S(x) + ' : ' + T(f),
              beeld:function(n){ return pwTabel([x, n >= 3 ? res : '?']); },
              stappen:[
                st('Hoeveel nullen heeft ' + T(f) + '?', z, 'Tel de nullen achter de 1.'),
                kz('Het getal wordt ' + T(f) + ' keer zo klein. Naar welke kant schuift de komma?', 'naar links', ['naar rechts'], 'Bij delen wordt het getal kleiner. De komma schuift dan naar links.'),
                st('Schuif de komma ' + z + (z === 1 ? ' plaats' : ' plaatsen') + ' naar links:', res, (k ? '' : 'Een heel getal heeft een komma aan het eind: ' + S(x) + ' = ' + S(x) + ',0. ') + 'Verplaats de komma ' + z + ' keer één cijfer naar links. Zet er nullen voor als dat nodig is.', { fout:F([[rnd(x * f), 'Je schoof de komma naar rechts. Bij delen gaat hij naar links.']]) }) ] };
          } },
        { id:'komma-afronden', naam:'Kommagetallen afronden', kort:'Kijk naar het cijfer rechts van de plaats waarop je afrondt: 5 of meer gaat omhoog',
          uit:'<p>Bij <b>afronden</b> houd je een paar cijfers en laat je de rest weg. Je kijkt naar het <b>eerste cijfer dat wegvalt</b>.</p><p>Is dat 5, 6, 7, 8 of 9? Dan gaat het laatste cijfer dat je houdt één omhoog. Is het 0 tot en met 4? Dan blijft het zoals het is.</p><p>Voorbeeld: 7,46 op hele getallen wordt 7 (de 4 valt weg). 7,46 op tienden wordt 7,5 (de 6 valt weg). € 1,879 op centen wordt € 1,88.</p>',
          wanneer:'een antwoord te veel cijfers achter de komma heeft, zoals bij geld of metingen.',
          maak:function(R){
            var mode = K(['heel', 'tienden', 'centen']), k = mode === 'centen' ? 3 : 2, d = mode === 'heel' ? 0 : mode === 'tienden' ? 1 : 2, m;
            do { m = mode === 'centen' ? R.heel(1001, 2999) : R.heel(101, 9999); } while (m % 10 === 0 || (mode === 'heel' && dR(m, 1) === 0));
            var x = m / Math.pow(10, k), q = Math.floor(m / Math.pow(10, k - d)), c = dR(m, k - d - 1), op = c >= 5, ant = rnd((op ? q + 1 : q) / Math.pow(10, d));
            var lo = rnd(q / Math.pow(10, d)), hi = rnd((q + 1) / Math.pow(10, d)), naam = ['hele getallen', 'tienden', 'centen'][d];
            var welk = ['het eerste', 'het tweede', 'het derde'][d], antT = mode === 'centen' ? S2(ant) : T(ant, { dec:d, vast:true });
            return { vraag:mode === 'centen' ? '€ ' + S(x) : S(x), context:mode === 'centen' ? 'Een liter benzine kost € ' + S(x) + '. Rond af op <b>centen</b>.' : 'Rond af op <b>' + naam + '</b>.',
              beeld:function(n){ return lijnZonder({ van:lo, tot:hi, streep:rnd((hi - lo) / 10), labels:[lo, hi], stip:[x], sprongen:n >= 3 ? [{ van:x, naar:ant, tekst:'' }] : [], nieuw:true }, [x], 'leeg'); },
              stappen:[
                st('Welk cijfer valt als eerste weg? Dat is ' + welk + ' cijfer achter de komma.', c, 'Je houdt ' + (d ? d + (d === 1 ? ' cijfer' : ' cijfers') + ' achter de komma' : 'alleen het hele getal') + '. Kijk naar het cijfer daarna.'),
                kz('Dat cijfer is een ' + c + '. Rond je naar boven of naar beneden af?', op ? 'naar boven' : 'naar beneden', [op ? 'naar beneden' : 'naar boven'], 'Bij 5, 6, 7, 8 of 9 naar boven. Bij 0 tot en met 4 naar beneden.'),
                st('Het afgeronde getal:', antT, op ? 'Het laatste cijfer dat je houdt gaat één omhoog.' : 'Laat de cijfers die wegvallen gewoon weg.', { fout:F([[op ? lo : hi, 'Kijk nog eens naar de ' + c + '.']]) }) ] };
          } }
      ] },

    { groep:{ id:'schat-basis', niveau:'1F', domein:'getallen', naam:'Schatten', uit:'Met ronde getallen snel ongeveer uitrekenen: om een antwoord te controleren of om te weten of je genoeg geld hebt.' },
      doelen:[
        { id:'schat-afronden', naam:'Afronden en ongeveer uitrekenen', kort:'Rond elk getal af op een rond getal en reken daarmee',
          uit:'<p>Bij <b>schatten</b> hoef je niet precies te rekenen. Je rondt de getallen eerst af op <b>ronde getallen</b>. Daarmee reken je makkelijk in je hoofd.</p><p>Voorbeeld: 398 + 512. Rond af op honderdtallen: 400 + 500 = 900. Het antwoord is dus ongeveer 900.</p><p>Bij keer: 48 × 21 is ongeveer 50 × 20 = 1000.</p>',
          wanneer:'je snel wilt weten hoe groot een antwoord ongeveer is.',
          maak:function(R){
            var soort = K(['plus', 'min', 'keer']), a, b, ra, rb, plaats, w, est, opT;
            function rond(x, e){ return Math.round(x / e) * e; }
            if (soort === 'keer'){ w = 10; plaats = 'tientallen'; do { a = R.heel(12, 98); b = R.heel(12, 98); } while (a % 10 === 0 || b % 10 === 0 || a % 10 === 5 || b % 10 === 5); opT = ' ' + X + ' '; }
            else { w = 100; plaats = 'honderdtallen'; do { a = R.heel(112, 989); b = R.heel(112, 989); } while (a % 100 < 10 || b % 100 < 10 || a % 100 === 50 || b % 100 === 50 || (soort === 'min' && rond(a, 100) <= rond(b, 100))); opT = soort === 'plus' ? ' + ' : ' ' + MIN + ' '; }
            ra = rond(a, w); rb = rond(b, w); est = soort === 'keer' ? ra * rb : soort === 'plus' ? ra + rb : ra - rb;
            function hint(x, r){ return 'Kijk naar het cijfer rechts van de ' + plaats + ' in ' + x + ': ' + dR(x, w === 10 ? 0 : 1) + '. ' + (r > x ? 'Dat is 5 of meer: naar boven.' : 'Dat is minder dan 5: naar beneden.'); }
            return { vraag:a + opT + b, context:'Schat de uitkomst. Rond elk getal af op <b>' + plaats + '</b>.',
              beeld:function(n){ return R.teken.tabel([['getal', 'afgerond'], [String(a), n >= 1 ? T(ra) : '?'], [String(b), n >= 2 ? T(rb) : '?'], ['schatting', n >= 3 ? T(est) : '?']], { kop:true }); },
              stappen:[
                st('Rond ' + a + ' af op ' + plaats + ':', ra, hint(a, ra)),
                st('Rond ' + b + ' af op ' + plaats + ':', rb, hint(b, rb)),
                st('Reken uit: ' + ra + opT + rb + ' =', est, soort === 'keer' ? 'Reken ' + ra / 10 + ' ' + X + ' ' + rb / 10 + ' en zet er twee nullen achter.' : 'Reken met de honderdtallen: ' + ra / 100 + opT + rb / 100 + ', en dan twee nullen erachter.') ] };
          } },
        { id:'schat-controle', naam:'Schatten om te controleren', kort:'Schat de uitkomst en kijk of het gegeven antwoord daar in de buurt ligt',
          uit:'<p>Met een schatting kun je controleren of een antwoord <b>kan kloppen</b>. Dat is handig bij een rekenmachine: een verkeerde toets zie je zo meteen.</p><p>Klopt 48 × 21 = 10.080? Schat: 50 × 20 = 1000. Maar 10.080 is ongeveer tien keer zo groot. Dat kan dus <b>niet kloppen</b>. Het goede antwoord is 1008.</p>',
          wanneer:'je een antwoord van een rekenmachine of van iemand anders wilt controleren.',
          maak:function(R){
            var twee = R.heel(0, 1) === 1, a, b, ra, rb, est;
            if (twee){ do { a = R.heel(12, 98); b = R.heel(12, 98); } while (a % 10 === 0 || b % 10 === 0 || a % 10 === 5 || b % 10 === 5); ra = Math.round(a / 10) * 10; rb = Math.round(b / 10) * 10; }
            else { do { a = R.heel(112, 989); } while (a % 100 < 10 || a % 100 === 50); b = R.heel(3, 9); ra = Math.round(a / 100) * 100; rb = b; }
            est = ra * rb;
            var echt = a * b, goed = R.heel(0, 1) === 1, claim = goed ? echt : (R.heel(0, 1) ? echt * 10 : Math.round(echt / 10));
            var ja = 'Ja, het kan kloppen', nee = 'Nee, het klopt niet', stappen = [];
            stappen.push(st('Rond ' + a + ' af op ' + (twee ? 'tientallen' : 'honderdtallen') + ':', ra, 'Kijk naar het cijfer rechts van de ' + (twee ? 'tientallen' : 'honderdtallen') + '.'));
            if (twee) stappen.push(st('Rond ' + b + ' af op tientallen:', rb, 'Kijk naar het laatste cijfer van ' + b + '.'));
            stappen.push(st('Je schatting: ' + ra + ' ' + X + ' ' + rb + ' =', est, twee ? 'Reken ' + ra / 10 + ' ' + X + ' ' + rb / 10 + ' en zet er twee nullen achter.' : 'Reken ' + ra / 100 + ' ' + X + ' ' + rb + ' en zet er twee nullen achter.'));
            stappen.push(kz('Ligt ' + T(claim) + ' in de buurt van ' + T(est) + '?', goed ? ja : nee, [goed ? nee : ja], goed ? T(claim) + ' en ' + T(est) + ' zijn ongeveer even groot.' : T(claim) + ' is ongeveer ' + (claim > est ? 'tien keer zo groot als' : 'tien keer zo klein als') + ' ' + T(est) + '. Dat kan niet.'));
            return eindKeuze({ vraag:a + ' ' + X + ' ' + b + ' = ' + T(claim), context:'Kan dit antwoord kloppen? Controleer het met een schatting.', stappen:stappen });
          } },
        { id:'schat-geld', naam:'Heb je genoeg geld?', kort:"Rond de prijzen naar boven af op hele euro's en tel op",
          uit:"<p>Sta je bij de kassa en wil je weten of je genoeg geld hebt? Dan <b>schat</b> je.</p><p>Rond elke prijs <b>naar boven</b> af op hele euro's: € 4,95 wordt € 5. Zo reken je nooit te weinig. Kom je dan nog onder je bedrag uit? Dan heb je zeker genoeg.</p><p>Voorbeeld: 3 × € 4,95 en € 3,49. Ongeveer 3 × € 5 + € 4 = € 19. Met € 20 heb je genoeg.</p>",
          wanneer:'je in de winkel wilt weten of je geld genoeg is.',
          maak:function(R){
            var B, k, p, q, pr, qr, est, laag, echt;
            do {
              B = K([10, 15, 20, 25, 30, 40, 50]); k = R.heel(2, 4); p = rnd(R.heel(1, 9) + K([0.49, 0.75, 0.89, 0.95, 0.99])); q = rnd(R.heel(1, 6) + K([0.25, 0.49, 0.79, 0.95]));
              pr = Math.ceil(p); qr = Math.ceil(q); est = k * pr + qr; laag = k * Math.floor(p) + Math.floor(q); echt = rnd(k * p + q);
            } while (Math.abs(est - B) > 5 || !(est <= B || laag > B));
            var genoeg = est <= B, d1 = K(['pakken sap', 'schriften', 'broodjes', 'bekers ijs', 'pennen']), d2 = K(['een tijdschrift', 'een zak chips', 'een fles water', 'een kaart']);
            return eindKeuze({ vraag:'Is € ' + B + ' genoeg?', context:'Je hebt € ' + B + '. Je koopt ' + k + ' ' + d1 + ' van ' + E(p) + ' per stuk en ' + d2 + ' van ' + E(q) + '.',
              beeld:function(n){ var nb = function(t){ return t.replace(/ /g, '\u00a0'); }; return klein([['je koopt', 'naar boven'], [nb(k + ' ' + X + ' ' + E(p)), n >= 2 ? nb(k + ' ' + X + ' € ' + pr + ' = € ' + k * pr) : (n >= 1 ? nb(k + ' ' + X + ' € ' + pr) : '?')], [nb(E(q)), n >= 3 ? nb('€ ' + qr) : '?'], ['samen', n >= 4 ? nb('€ ' + est) : '?']], { kop:true }); },
              stappen:[
                st('Rond ' + E(p) + " naar boven af op hele euro's:", pr, 'Het volgende hele bedrag boven ' + E(p) + '.'),
                st(k + ' ' + X + ' € ' + pr + ' =', pr * k, 'De tafel van ' + pr + '.'),
                st('Rond ' + E(q) + ' naar boven af:', qr, 'Het volgende hele bedrag boven ' + E(q) + '.'),
                st('Samen ongeveer: ' + k * pr + ' + ' + qr + ' =', est, 'Tel de afgeronde bedragen op.'),
                kz('Je hebt € ' + B + '. Is dat genoeg?', genoeg ? 'Ja, het is genoeg' : 'Nee, het is niet genoeg', [genoeg ? 'Nee, het is niet genoeg' : 'Ja, het is genoeg'], genoeg ? 'Zelfs naar boven afgerond is het € ' + est + '. Dat is niet meer dan € ' + B + '.' : 'Ook zonder de centen is het al € ' + laag + '. Dat is meer dan € ' + B + '.') ] });
          } }
      ] },

    /* ===================== 2F ===================== */
    { groep:{ id:'komma-reken', niveau:'2F', domein:'getallen', naam:'Rekenen met kommagetallen', uit:'Keer en delen met kommagetallen: komma\'s tellen, slim rekenen met 0,5, 0,25 en 0,1, delen in tienden en de deler heel maken.' },
      doelen:[
        { id:'komma-keerheel', naam:'Kommagetal keer een heel getal', kort:'Reken zonder komma en zet de komma terug: evenveel cijfers erachter als in de som',
          uit:'<p>Bij 3 × 2,45 reken je eerst <b>zonder komma</b>: 3 × 245 = 735.</p><p>Tel daarna hoeveel cijfers er <b>achter de komma</b> stonden in de som: bij 2,45 zijn dat er 2. Zet in het antwoord ook 2 cijfers achter de komma: <b>7,35</b>.</p><p>Controleer met een schatting: 3 × 2,5 is ongeveer 7,5. Dat klopt.</p>',
          wanneer:'je een kommagetal vermenigvuldigt met een heel getal, zoals een prijs keer een aantal.',
          maak:function(R){
            var n = R.heel(2, 9), k = R.heel(1, 2), m;
            do { m = k === 2 ? R.heel(101, 999) : R.heel(11, 199); } while (m % 10 === 0);
            var x = rnd(m / Math.pow(10, k)), p = n * m, ant = rnd(p / Math.pow(10, k));
            return { vraag:n + ' ' + X + ' ' + S(x),
              stappen:[
                st('Reken zonder komma: ' + n + ' ' + X + ' ' + m + ' =', p, 'Vermenigvuldig ' + m + ' met ' + n + ', bijvoorbeeld onder elkaar.'),
                st('Hoeveel cijfers staan er achter de komma in ' + S(x) + '?', k, 'Tel de cijfers na de komma.'),
                st('Zet de komma terug: ' + (k === 1 ? 'één cijfer' : k + ' cijfers') + ' van achteren in ' + p + '.', S(ant), 'Schat ter controle: ' + n + ' ' + X + ' ' + Math.round(x) + ' is ongeveer ' + n * Math.round(x) + '.', { fout:F([[p, 'Vergeet de komma niet.'], [rnd(p / Math.pow(10, k === 1 ? 2 : 1)), 'Tel nog eens de cijfers achter de komma.']]) }) ] };
          } },
        { id:'komma-keerkomma', naam:'Kommagetal keer kommagetal', kort:"Reken zonder komma's en tel alle cijfers achter de komma samen",
          uit:"<p>Bij 0,4 × 0,3 reken je eerst <b>zonder komma's</b>: 4 × 3 = 12.</p><p>Tel dan de cijfers achter de komma in <b>beide getallen</b> samen: 1 + 1 = 2. Het antwoord krijgt dus 2 cijfers achter de komma: <b>0,12</b>.</p><p>Heb je te weinig cijfers? Zet er nullen voor: 0,3 × 0,02 = 6 met 3 cijfers achter de komma = 0,006.</p>",
          wanneer:'je twee kommagetallen met elkaar vermenigvuldigt.',
          maak:function(R){
            var k1 = R.heel(1, 2), k2 = R.heel(1, 2), xm, ym, y;
            do { xm = k1 === 1 ? R.heel(2, 99) : R.heel(2, 99); ym = k2 === 1 ? R.heel(2, 9) : R.heel(2, 99); y = rnd(ym / Math.pow(10, k2)); } while (xm % 10 === 0 || ym % 10 === 0 || [0.5, 0.25, 0.1].indexOf(y) >= 0 || (k1 === 2 && k2 === 2 && xm * ym < 10));
            var x = rnd(xm / Math.pow(10, k1)), p = xm * ym, kk = k1 + k2, ant = rnd(p / Math.pow(10, kk));
            return { vraag:S(x) + ' ' + X + ' ' + S(y),
              stappen:[
                st("Reken zonder komma's: " + xm + ' ' + X + ' ' + ym + ' =', p, 'Laat de komma en de nullen vooraan weg.'),
                st('Tel de cijfers achter de komma samen: ' + k1 + ' + ' + k2 + ' =', kk, S(x) + ' heeft er ' + k1 + ', ' + S(y) + ' heeft er ' + k2 + '.'),
                st('Zet de komma: ' + kk + ' cijfers van achteren in ' + p + '.', S(ant), (lengte(p) <= kk ? p + ' heeft te weinig cijfers. Zet er nullen voor, en dan 0, ervoor.' : 'Tel ' + kk + ' cijfers van rechts in ' + p + ' en zet daar de komma.') + (p % 10 === 0 ? ' Nullen aan het eind achter de komma mag je weglaten.' : ''), { fout:F([[rnd(p / Math.pow(10, kk - 1)), 'Tel de cijfers achter de komma van beide getallen samen.'], [p, 'Vergeet de komma niet.']]) }) ] };
          } },
        { id:'komma-keerhalf', naam:'Keer 0,5, 0,25 en 0,1', kort:'Keer 0,5 is de helft, keer 0,25 is een kwart, keer 0,1 is een tiende',
          uit:'<p>Sommige kommagetallen zijn heel handig:</p><p><b>Keer 0,5</b> is hetzelfde als de helft nemen: 46 × 0,5 = 23.<br><b>Keer 0,25</b> is een kwart nemen, dus de helft van de helft: 64 × 0,25 = 16.<br><b>Keer 0,1</b> is een tiende nemen, dus delen door 10: 47 × 0,1 = 4,7.</p><p>Let op: keer een getal kleiner dan 1 maakt het antwoord <b>kleiner</b>.</p>',
          wanneer:'je keer 0,5, 0,25 of 0,1 doet, zoals bij korting of een recept.',
          maak:function(R){
            var f = K([0.5, 0.25, 0.1]), x, stappen = [], NAMEN = { 0.5:'de helft nemen', 0.25:'een kwart nemen', 0.1:'een tiende nemen' };
            if (f === 0.5) x = R.heel(0, 1) ? R.heel(6, 200) * 2 : rnd(R.heel(6, 99) * 2 / 10);
            else if (f === 0.25) x = R.heel(3, 60) * 4;
            else x = R.heel(0, 1) ? R.heel(11, 999) : rnd(R.heel(11, 999) / 10);
            var ant = rnd(x * f);
            stappen.push(kz(X + ' ' + S(f) + ' is hetzelfde als ...', NAMEN[f], Object.keys(NAMEN).filter(function(k){ return +k !== f; }).map(function(k){ return NAMEN[k]; }), S(f) + ' = ' + (f === 0.5 ? '1/2' : f === 0.25 ? '1/4' : '1/10') + '.'));
            if (f === 0.5) stappen.push(st('De helft van ' + S(x) + ' =', ant, S(x) + ' : 2.', { fout:F([[x * 2, 'Keer 0,5 maakt het getal kleiner, niet groter.']]) }));
            else if (f === 0.25){ stappen.push(st('De helft van ' + S(x) + ' =', x / 2, S(x) + ' : 2.')); stappen.push(st('En daar weer de helft van:', ant, S(x / 2) + ' : 2.')); }
            else stappen.push(st(S(x) + ' : 10 =', ant, 'De komma schuift één plaats naar links.', { fout:F([[x * 10, 'Een tiende nemen maakt het kleiner. Deel door 10.']]) }));
            return { vraag:S(x) + ' ' + X + ' ' + S(f), stappen:stappen };
          } },
        { id:'komma-deelheel', naam:'Kommagetal delen door een heel getal', kort:'Reken in tienden of honderdsten, deel, en zet het terug als kommagetal',
          uit:'<p>Bij 12,6 : 3 kun je rekenen in <b>tienden</b>. 12,6 is 126 tienden.</p><p>126 tienden : 3 = 42 tienden. En 42 tienden is <b>4,2</b>.</p><p>Met twee cijfers achter de komma reken je in honderdsten: 7,25 : 5 = 725 honderdsten : 5 = 145 honderdsten = 1,45.</p>',
          wanneer:'je een kommagetal eerlijk verdeelt, zoals een bedrag over een paar mensen.',
          maak:function(R){
            var n = R.heel(2, 9), k = R.heel(1, 2), rm, xm;
            do { rm = k === 1 ? R.heel(11, 99) : R.heel(101, 999); xm = rm * n; } while (rm % 10 === 0 || xm % 10 === 0);
            var x = rnd(xm / Math.pow(10, k)), r = rnd(rm / Math.pow(10, k)), eenh = k === 1 ? 'tienden' : 'honderdsten';
            return { vraag:S(x) + ' : ' + n,
              stappen:[
                st(S(x) + ' is hoeveel ' + eenh + '?', xm, 'Laat de komma weg. Dan tel je in ' + eenh + '.'),
                st(xm + ' ' + eenh + ' : ' + n + ' =', rm, 'Deel ' + xm + ' door ' + n + '. Dat zijn nog steeds ' + eenh + '.'),
                st(rm + ' ' + eenh + ' is als kommagetal:', S(r), (k === 1 ? 'Eén' : 'Twee') + (k === 1 ? ' cijfer' : ' cijfers') + ' achter de komma.', { fout:F([[rm, 'Dat zijn nog ' + eenh + '. Zet de komma terug.']]) }) ] };
          } },
        { id:'komma-deelkomma', naam:'Delen door een kommagetal', kort:'Maak de deler heel: doe beide getallen keer 10 of keer 100',
          uit:'<p>Delen door een kommagetal is lastig. Maak de deler daarom eerst <b>heel</b>.</p><p>Doe <b>beide getallen</b> even vaak keer 10 of keer 100. De uitkomst blijft dan hetzelfde. Bij 4,5 : 0,15 doe je allebei keer 100: 450 : 15 = <b>30</b>.</p><p>Eén cijfer achter de komma bij de deler: keer 10. Twee cijfers: keer 100.</p>',
          wanneer:'je deelt door een kommagetal, zoals: hoeveel flesjes van 0,25 liter vul je met 6 liter?',
          maak:function(R){
            var y = K([0.2, 0.5, 0.4, 0.25, 0.15, 0.05, 0.3, 0.6, 1.5, 2.5, 0.12, 0.04]), q = R.heel(3, 40);
            var k = String(y).split('.')[1].length, f = Math.pow(10, k), ym = Math.round(y * f), xm = q * ym, x = rnd(xm / f);
            return { vraag:S(x) + ' : ' + S(y),
              stappen:[
                st('Met hoeveel moet je de deler ' + S(y) + ' vermenigvuldigen, zodat hij heel wordt?', f, k === 1 ? 'Eén cijfer achter de komma: keer 10.' : 'Twee cijfers achter de komma: keer 100.'),
                st('Doe het eerste getal ook keer ' + f + ': ' + S(x) + ' ' + X + ' ' + f + ' =', xm, 'De komma schuift ' + k + (k === 1 ? ' plaats' : ' plaatsen') + ' naar rechts.', { waarom:'Doe je beide getallen even vaak keer ' + f + ', dan blijft de uitkomst hetzelfde.' }),
                st('En de deler: ' + S(y) + ' ' + X + ' ' + f + ' =', ym, 'De komma schuift ' + k + (k === 1 ? ' plaats' : ' plaatsen') + ' naar rechts.'),
                st('Deel nu: ' + T(xm) + ' : ' + ym + ' =', q, 'Hoe vaak past ' + ym + ' in ' + T(xm) + '?', { fout:F([[rnd(x / ym), 'Je moet ook het eerste getal keer ' + f + ' doen.']]) }) ] };
          } },
        { id:'komma-kies', naam:'Kies de handigste manier', kort:"Kijk eerst naar de som: komma's tellen, helft of tiende, delen in tienden of de deler heel maken",
          uit:"<p>Je kent nu vier manieren. Kijk eerst goed naar de som en kies de <b>handigste</b>:</p><p><b>Helft, kwart of tiende</b> bij keer 0,5, 0,25 of 0,1.<br><b>Komma's tellen</b> bij keer een ander kommagetal.<br><b>Delen in tienden of honderdsten</b> als je een kommagetal deelt door een heel getal.<br><b>De deler heel maken</b> als je deelt door een kommagetal.</p>",
          wanneer:'je een som met kommagetallen krijgt en eerst kijkt welke manier past.',
          maak:function(R){
            var O = ["Komma's tellen", 'Helft, kwart of tiende', 'Delen in tienden of honderdsten', 'De deler heel maken'];
            var soort = R.heel(0, 3), stappen = [], vraag, ant, xm, ym, x, y, q;
            if (soort === 0){
              do { xm = R.heel(11, 99); ym = R.heel(2, 9); } while (xm % 10 === 0 || ym === 5);
              x = rnd(xm / 10); y = rnd(ym / 10); ant = rnd(xm * ym / 100); vraag = S(x) + ' ' + X + ' ' + S(y);
              stappen.push(kzVast('Welke manier is hier het handigst?', O, O[0], 'Keer een kommagetal dat geen 0,5, 0,25 of 0,1 is: reken zonder komma\'s en tel de cijfers achter de komma.'));
              stappen.push(st("Zonder komma's: " + xm + ' ' + X + ' ' + ym + ' =', xm * ym, 'Laat de komma\'s weg.'));
              stappen.push(st('Twee cijfers achter de komma. Het antwoord:', S(ant), 'Tel twee cijfers van rechts in ' + xm * ym + '.'));
            } else if (soort === 1){
              var f = K([0.5, 0.25, 0.1]); x = f === 0.25 ? R.heel(3, 30) * 4 : R.heel(6, 99) * 2; ant = rnd(x * f); vraag = x + ' ' + X + ' ' + S(f);
              stappen.push(kzVast('Welke manier is hier het handigst?', O, O[1], 'Keer ' + S(f) + ' is ' + (f === 0.5 ? 'de helft' : f === 0.25 ? 'een kwart' : 'een tiende') + '. Dat reken je zo uit.'));
              if (f === 0.25){ stappen.push(st('De helft van ' + x + ' =', x / 2, x + ' : 2.')); stappen.push(st('En weer de helft:', ant, (x / 2) + ' : 2.')); }
              else stappen.push(st((f === 0.5 ? 'De helft van ' + x : 'Een tiende van ' + x) + ' =', ant, f === 0.5 ? x + ' : 2.' : x + ' : 10.'));
            } else if (soort === 2){
              var n = R.heel(2, 9), rm; do { rm = R.heel(11, 99); xm = rm * n; } while (rm % 10 === 0 || xm % 10 === 0);
              x = rnd(xm / 10); ant = rnd(rm / 10); vraag = S(x) + ' : ' + n;
              stappen.push(kzVast('Welke manier is hier het handigst?', O, O[2], 'Je deelt een kommagetal door een heel getal. Reken in tienden.'));
              stappen.push(st(S(x) + ' = ' + xm + ' tienden. ' + xm + ' : ' + n + ' =', rm, 'Deel ' + xm + ' door ' + n + '.'));
              stappen.push(st(rm + ' tienden is:', S(ant), 'Eén cijfer achter de komma.'));
            } else {
              y = K([0.2, 0.5, 0.4, 0.3, 0.6]); q = R.heel(3, 30); ym = Math.round(y * 10); xm = q * ym; x = rnd(xm / 10); ant = q; vraag = S(x) + ' : ' + S(y);
              stappen.push(kzVast('Welke manier is hier het handigst?', O, O[3], 'Je deelt door een kommagetal. Maak de deler heel.'));
              stappen.push(st('Beide getallen keer 10: ' + S(x) + ' ' + X + ' 10 =', xm, 'De komma schuift één plaats naar rechts.'));
              stappen.push(st('Deel nu: ' + xm + ' : ' + ym + ' =', q, 'Hoe vaak past ' + ym + ' in ' + xm + '?'));
            }
            return { vraag:vraag, stappen:stappen, antwoord:S(ant) };
          } }
      ] },

    { groep:{ id:'neg-basis', niveau:'2F', domein:'getallen', naam:'Negatieve getallen', uit:'Getallen onder nul: op de getallenlijn en de thermometer, vergelijken, plus en min over nul heen, min een negatief getal en het verschil tussen twee temperaturen.' },
      doelen:[
        { id:'neg-lijn', naam:'Negatieve getallen op de getallenlijn', kort:'Links van 0 staan de negatieve getallen: hoe verder naar links, hoe kleiner',
          uit:'<p>Links van 0 gaat de getallenlijn verder. Daar staan de <b>negatieve getallen</b>: −1, −2, −3 en zo verder.</p><p>Je kent ze van de <b>thermometer</b>: −5 °C is 5 graden onder nul.</p><p>Lees een stip zo af: kijk hoeveel één stukje is, kijk of de stip links of rechts van 0 ligt, en tel de stukjes vanaf 0.</p>',
          wanneer:'je een temperatuur of een getal onder nul afleest.',
          maak:function(R){
            var groot = R.heel(0, 1) === 1, s = groot ? 2 : 1, van = groot ? -20 : -10, v;
            do { v = R.heel(van / s, -van / s) * s; } while (v === 0 || (v > 0 && R.heel(0, 2)));
            function beeld(n){ return lijnZonder({ van:van, tot:-van, streep:s, labels:[van, 0, -van], stip:[v] }, [v], n >= 3); }
            return { vraag:'stip ' + v + ' ' + van, vraagHtml:'Welk getal hoort bij de stip?', zelfBeeld:function(){ return beeld(0); }, beeld:beeld,
              stappen:[
                st('Hoeveel is één stukje op deze lijn?', s, 'Van 0 tot ' + (-van) + ' zijn ' + (-van / s) + ' stukjes.'),
                kz('Ligt de stip links of rechts van 0?', v < 0 ? 'links, dus het getal is negatief' : 'rechts, dus het getal is positief', [v < 0 ? 'rechts, dus het getal is positief' : 'links, dus het getal is negatief'], 'Kijk waar de 0 staat.'),
                st('Welk getal hoort bij de stip?', S(v), 'De stip ligt ' + Math.abs(v) / s + ' stukjes ' + (v < 0 ? 'links' : 'rechts') + ' van 0. Elk stukje is ' + s + '.', { fout:v < 0 ? F([[-v, 'Links van 0 zijn de getallen negatief. Zet er een min voor.']]) : {} }) ] };
          } },
        { id:'neg-ordenen', naam:'Negatieve getallen vergelijken', kort:'Hoe verder naar links op de getallenlijn, hoe kleiner: −12 is kleiner dan −2',
          uit:'<p>Op de getallenlijn geldt: <b>hoe verder naar links, hoe kleiner</b>. Dat geldt ook voor negatieve getallen.</p><p>Dus −12 is kleiner dan −2, want −12 ligt verder naar links. Denk aan de thermometer: −12 °C is kouder dan −2 °C.</p><p>Een negatief getal is altijd kleiner dan een positief getal.</p>',
          wanneer:'je temperaturen, scores of standen onder nul vergelijkt.',
          maak:function(R){
            var kl = R.heel(0, 1) === 1, nNeg = R.heel(0, 2) === 0 ? 4 : R.heel(2, 3), g = [];
            while (g.length < nNeg){ var x = R.heel(-20, -1); if (g.indexOf(x) < 0) g.push(x); }
            while (g.length < 4){ var y = R.heel(1, 12); if (g.indexOf(y) < 0) g.push(y); }
            g = R.hussel(g);
            var ant = kl ? Math.min.apply(null, g) : Math.max.apply(null, g), mn = Math.min.apply(null, g), mx = Math.max.apply(null, g);
            var van = Math.floor((mn - 1) / 5) * 5, tot = Math.max(0, Math.ceil((mx + 1) / 5) * 5);
            return eindKeuze({ vraag:g.map(S).join('   '), context:'Welk getal is het <b>' + (kl ? 'kleinst' : 'grootst') + '</b>?',
              beeld:function(n){ return n >= 1 ? R.teken.lijn({ van:van, tot:tot, streep:1, labels:[van, 0, tot], stip:g }) : ''; },
              stappen:[
                kz('Waar ligt het ' + (kl ? 'kleinste' : 'grootste') + ' getal op de getallenlijn?', kl ? 'het meest naar links' : 'het meest naar rechts', [kl ? 'het meest naar rechts' : 'het meest naar links'], 'Hoe verder naar links, hoe kleiner het getal.'),
                kz('Welk getal is het ' + (kl ? 'kleinst' : 'grootst') + '?', S(ant), g.filter(function(x){ return x !== ant; }).map(S), kl ? 'Zoek het getal dat het verst onder nul is.' : (ant > 0 ? 'Een positief getal is groter dan elk negatief getal.' : 'Alle getallen zijn negatief. Het grootste ligt het dichtst bij 0.')) ] });
          } },
        { id:'neg-plusmin', naam:'Plus en min over nul heen', kort:'Plus is naar rechts springen, min is naar links; spring eerst naar 0',
          uit:'<p>Op de getallenlijn betekent <b>plus</b>: naar rechts springen. <b>Min</b> betekent: naar links springen.</p><p>Bij −3 + 8 begin je bij −3 en spring je 8 naar rechts. Spring eerst naar 0: dat zijn 3 stappen. Dan nog 5: je komt uit op <b>5</b>.</p><p>Bij 2 − 7 spring je 7 naar links. Eerst 2 naar 0, dan nog 5: je komt uit op <b>−5</b>.</p>',
          wanneer:'je rekent met temperaturen, schulden of hoogtes onder en boven nul.',
          maak:function(R){
            var c = R.heel(1, 4), a, b, plus;
            if (c === 1){ a = R.heel(-9, -1); b = R.heel(-a + 1, -a + 9); plus = true; }
            else if (c === 2){ a = R.heel(1, 9); b = R.heel(a + 1, a + 9); plus = false; }
            else if (c === 3){ a = R.heel(-9, -1); b = R.heel(1, 9); plus = false; }
            else { a = R.heel(-15, -5); b = R.heel(1, -a - 1); plus = true; }
            var res = plus ? a + b : a - b, over = (a < 0) !== (res < 0) && res !== 0, kant = plus ? 'rechts' : 'links', stappen = [];
            stappen.push(kz('Bij ' + (plus ? 'plus' : 'min') + ' spring je naar ...', kant, [plus ? 'links' : 'rechts'], 'Plus is naar rechts, min is naar links.'));
            if (over){
              stappen.push(st('Spring eerst van ' + S(a) + ' naar 0. Hoeveel stappen is dat?', Math.abs(a), 'Tel van ' + S(a) + ' tot 0.'));
              stappen.push(st('Je moet ' + b + ' stappen. Hoeveel moet je na 0 nog?', b - Math.abs(a), b + ' ' + MIN + ' ' + Math.abs(a) + '.'));
              stappen.push(st('Waar kom je uit?', S(res), 'Vanaf 0 nog ' + (b - Math.abs(a)) + ' naar ' + kant + '.', { fout:F([[-res, 'Kijk aan welke kant van 0 je uitkomt.']]) }));
            } else stappen.push(st('Spring ' + b + ' stappen naar ' + kant + ' vanaf ' + S(a) + '. Waar kom je uit?', S(res), plus ? 'Naar rechts wordt het getal groter: ' + S(a) + ' komt dichter bij 0.' : 'Naar links wordt het getal kleiner: nog verder onder 0.', { fout:F([[-res, 'Let op het teken: je blijft onder 0.'], [plus ? a - b : a + b, 'Je sprong de verkeerde kant op.']]) }));
            var lo = Math.min(a, res, 0) - 2, hi = Math.max(a, res, 0) + 2;
            return { vraag:S(a) + (plus ? ' + ' : ' ' + MIN + ' ') + b,
              beeld:function(n){ var sp = []; if (over){ if (n >= 2) sp.push({ van:a, naar:0, tekst:(plus ? '+' : MIN) + Math.abs(a) }); if (n >= 3) sp.push({ van:0, naar:res, tekst:(plus ? '+' : MIN) + Math.abs(res) }); } else if (n >= 2) sp.push({ van:a, naar:res, tekst:(plus ? '+' : MIN) + b });
                return R.teken.lijn({ van:lo, tot:hi, streep:1, labels:[lo, 0, hi], sprongen:sp, stip:[a], nieuw:true }); },
              stappen:stappen };
          } },
        { id:'neg-minmin', naam:'Min een negatief getal', kort:'Min min wordt plus: 5 − −3 = 5 + 3',
          uit:'<p>Een negatief getal <b>aftrekken</b> is hetzelfde als het positieve getal <b>optellen</b>. Twee mintekens naast elkaar worden een plus.</p><p>5 − −3 = 5 + 3 = <b>8</b>.</p><p>Denk aan een schuld van 3 euro die iemand van je afhaalt: dan heb je 3 euro meer. Of aan de thermometer: het verschil tussen 5 en −3 is 8 graden.</p>',
          wanneer:'je in een som twee mintekens naast elkaar ziet staan.',
          maak:function(R){
            var a, b = R.heel(1, 9);
            do { a = R.heel(-9, 12); } while (a === 0 || a === b || a === -b);
            var goed = S(a) + ' + ' + b, fout = [S(a) + ' ' + MIN + ' ' + b, S(-a) + ' + ' + b, S(-a) + ' ' + MIN + ' ' + b];
            return { vraag:S(a) + ' ' + MIN + ' ' + S(-b),
              beeld:function(n){ var lo = Math.min(a, 0) - 2, hi = Math.max(a + b, 0) + 2; return R.teken.lijn({ van:lo, tot:hi, streep:1, labels:[lo, 0, hi], stip:[a], sprongen:n >= 1 ? [{ van:a, naar:a + b, tekst:'+' + b }] : [], nieuw:true }); },
              stappen:[
                kz('Min een negatief getal is hetzelfde als plus. Hoe schrijf je de som anders?', goed, fout, 'Het eerste getal blijft hetzelfde. Alleen ' + MIN + ' ' + S(-b) + ' wordt + ' + b + '.'),
                st('Reken uit: ' + goed + ' =', S(a + b), a < 0 ? 'Begin bij ' + S(a) + ' op de getallenlijn en spring ' + b + ' naar rechts.' : 'Tel ' + b + ' bij ' + a + ' op.', { fout:F([[a - b, 'Min min wordt plus. Je moet ' + b + ' erbij tellen.']]) }) ] };
          } },
        { id:'neg-verschil', naam:'Verschil tussen twee temperaturen', kort:'Tel de afstand op de thermometer: ligt 0 ertussen, tel dan de twee stukken op',
          uit:'<p>Het <b>verschil</b> tussen twee temperaturen is de afstand op de thermometer.</p><p>Ligt <b>0 ertussen</b>? Tel dan de twee stukken op. Van −6 °C naar 9 °C: 6 graden naar 0, dan nog 9 graden. Het verschil is 6 + 9 = <b>15 graden</b>.</p><p>Zijn beide temperaturen onder nul? Trek dan af: van −12 °C naar −5 °C is 12 − 5 = 7 graden.</p>',
          wanneer:'je wilt weten hoeveel warmer of kouder het is geworden.',
          maak:function(R){
            var over = R.heel(0, 4) < 3, t1, t2, ctx;
            if (over){ t1 = R.heel(-15, -1); t2 = R.heel(1, 20); ctx = K(["'s Nachts is het {k} °C. Overdag wordt het {w} °C.", 'In Moskou is het {k} °C, in Madrid is het {w} °C.', 'In Madrid is het {w} °C, in Moskou is het {k} °C.', 'Buiten is het {k} °C. In de schuur is het {w} °C.']); }
            else { t1 = R.heel(-20, -3); t2 = R.heel(t1 + 2, -1); ctx = K(['In Oslo is het {w} °C, in Moskou is het {k} °C.', "Om 6 uur 's ochtends is het {k} °C. Om 10 uur is het {w} °C.", 'In de diepvriezer is het {k} °C. In het vriesvak van de koelkast is het {w} °C.']); }
            var kEerst = ctx.indexOf('{k}') < ctx.indexOf('{w}'), A = kEerst ? t1 : t2, B = kEerst ? t2 : t1, d = t2 - t1, stappen;
            ctx = ctx.replace('{k}', S(t1)).replace('{w}', S(t2));
            if (over) stappen = [
              st('Van ' + S(t1) + ' naar 0: hoeveel graden?', -t1, S(t1) + ' is ' + (-t1) + ' graden onder nul.'),
              st('Van 0 naar ' + t2 + ': hoeveel graden?', t2, 'Van 0 tot ' + t2 + '.'),
              st('Het verschil: ' + (-t1) + ' + ' + t2 + ' =', d, 'Tel de twee stukken op.', { eenheid:'graden', fout:F([[Math.abs(t1 + t2), 'Je trok af. Maar 0 ligt ertussen: tel de twee stukken op.']], d) }) ];
            else stappen = [
              st('Hoeveel graden onder nul is ' + S(t1) + '?', -t1, 'Kijk naar het getal zonder de min.'),
              st('En ' + S(t2) + '?', -t2, 'Kijk naar het getal zonder de min.'),
              st('Het verschil: ' + (-t1) + ' ' + MIN + ' ' + (-t2) + ' =', d, 'Beide onder nul: trek af.', { eenheid:'graden', fout:F([[-t1 - t2, 'Beide temperaturen zijn onder nul. Dan trek je af.']], d) }) ];
            return { vraag:S(A) + ' °C en ' + S(B) + ' °C', context:ctx + ' Hoeveel graden is het verschil?', eenheid:'graden',
              beeld:function(n){ var lo = Math.min(t1, 0) - 2, hi = Math.max(t2, 0) + 2, sp = []; if (over){ if (n >= 1) sp.push({ van:t1, naar:0, tekst:String(-t1) }); if (n >= 2) sp.push({ van:0, naar:t2, tekst:String(t2) }); } else if (n >= 3) sp.push({ van:t1, naar:t2, tekst:String(d) });
                return R.teken.lijn({ van:lo, tot:hi, labels:[lo, 0, hi], stip:[t1, t2], sprongen:sp, nieuw:true }); },
              stappen:stappen };
          } }
      ] },

    { groep:{ id:'volg-regels', niveau:'2F', domein:'getallen', naam:'Volgorde van bewerkingen', uit:'In welke volgorde reken je een lange som uit? Haakjes, machten, keer en delen, plus en min, en van links naar rechts.' },
      doelen:[
        { id:'volg-haakjes', naam:'Haakjes eerst', kort:'Wat tussen haakjes staat, reken je altijd als eerste uit',
          uit:'<p>Staan er <b>haakjes</b> in een som? Dan reken je eerst uit wat <b>tussen de haakjes</b> staat.</p><p>(12 + 8) × 3: eerst 12 + 8 = 20, dan 20 × 3 = <b>60</b>.</p><p>Zonder haakjes was het anders geweest: 12 + 8 × 3 = 12 + 24 = 36.</p>',
          wanneer:'er haakjes in een som staan.',
          maak:function(R){
            var v = R.heel(0, 3), a, b, c, s, uit, binnen, opB, opBuiten, fout;
            if (v === 0){ a = R.heel(2, 15); b = R.heel(2, 15); c = R.heel(2, 9); s = '(' + a + ' + ' + b + ') ' + X + ' ' + c; binnen = a + b; opB = a + ' + ' + b; opBuiten = binnen + ' ' + X + ' ' + c; fout = a + b * c; }
            else if (v === 1){ a = R.heel(2, 9); b = R.heel(8, 20); c = R.heel(2, b - 2); s = a + ' ' + X + ' (' + b + ' ' + MIN + ' ' + c + ')'; binnen = b - c; opB = b + ' ' + MIN + ' ' + c; opBuiten = a + ' ' + X + ' ' + binnen; fout = a * b - c; }
            else if (v === 2){ c = R.heel(2, 9); var q = R.heel(2, 9); b = R.heel(2, 20); a = q * c + b; s = '(' + a + ' ' + MIN + ' ' + b + ') : ' + c; binnen = a - b; opB = a + ' ' + MIN + ' ' + b; opBuiten = binnen + ' : ' + c; fout = b % c === 0 ? a - b / c : null; }
            else { b = R.heel(5, 20); c = R.heel(3, 15); a = R.heel(b + c + 5, 60); s = a + ' ' + MIN + ' (' + b + ' + ' + c + ')'; binnen = b + c; opB = b + ' + ' + c; opBuiten = a + ' ' + MIN + ' ' + binnen; fout = a - b + c; }
            uit = reken(s);
            return { vraag:s,
              beeld:function(n){ return regelsBeeld([s].concat(n >= 1 ? [opBuiten] : []).concat(n >= 2 ? [S(uit)] : [])); },
              stappen:[
                st('Eerst tussen de haakjes: ' + opB + ' =', binnen, 'Reken alleen uit wat tussen ( en ) staat.'),
                st('Dan: ' + opBuiten + ' =', uit, 'Nu staat er nog maar één bewerking.', { fout:F([[fout, 'Je deed de haakjes niet eerst.']], uit) }) ] };
          } },
        { id:'volg-keerplus', naam:'Keer en delen voor plus en min', kort:'Zonder haakjes doe je eerst keer en delen, daarna plus en min',
          uit:'<p>Staan er geen haakjes? Dan doe je eerst <b>keer en delen</b>, en daarna pas <b>plus en min</b>.</p><p>4 + 5 × 6: eerst 5 × 6 = 30, dan 4 + 30 = <b>34</b>.</p><p>Let op: van links naar rechts rekenen geeft hier 54. Dat is fout!</p>',
          wanneer:'er in een som zowel plus of min als keer of delen staat.',
          maak:function(R){
            var v = R.heel(0, 3), a, b, c, s, p, opP, opRest, fout;
            if (v === 0){ a = R.heel(2, 20); b = R.heel(2, 9); c = R.heel(2, 9); s = a + ' + ' + b + ' ' + X + ' ' + c; p = b * c; opP = b + ' ' + X + ' ' + c; opRest = a + ' + ' + p; fout = (a + b) * c; }
            else if (v === 1){ b = R.heel(2, 9); c = R.heel(2, 9); a = R.heel(b * c + 1, b * c + 30); s = a + ' ' + MIN + ' ' + b + ' ' + X + ' ' + c; p = b * c; opP = b + ' ' + X + ' ' + c; opRest = a + ' ' + MIN + ' ' + p; fout = (a - b) * c; }
            else if (v === 2){ c = R.heel(2, 9); p = R.heel(2, 9); b = p * c; a = R.heel(2, 30); s = a + ' + ' + b + ' : ' + c; opP = b + ' : ' + c; opRest = a + ' + ' + p; fout = (a + b) % c === 0 ? (a + b) / c : null; }
            else { c = R.heel(2, 9); p = R.heel(2, 9); b = p * c; a = R.heel(p + 1, p + 40); s = a + ' ' + MIN + ' ' + b + ' : ' + c; opP = b + ' : ' + c; opRest = a + ' ' + MIN + ' ' + p; fout = a > b && (a - b) % c === 0 ? (a - b) / c : null; }
            var uit = reken(s);
            return { vraag:s,
              beeld:function(n){ return regelsBeeld([s].concat(n >= 1 ? [opRest] : []).concat(n >= 2 ? [S(uit)] : [])); },
              stappen:[
                st('Eerst ' + (/:/.test(opP) ? 'delen' : 'keer') + ': ' + opP + ' =', p, 'Keer en delen gaan voor plus en min.'),
                st('Dan: ' + opRest + ' =', uit, 'Nu nog de ' + (/\+/.test(opRest) ? 'plus' : 'min') + '.', { fout:F([[fout, 'Je rekende van links naar rechts. Keer en delen gaan voor.']], uit) }) ] };
          } },
        { id:'volg-links', naam:'Van links naar rechts', kort:'Bij plus en min samen, of keer en delen samen, reken je van links naar rechts',
          uit:'<p>Staan er alleen <b>plus en min</b>? Of alleen <b>keer en delen</b>? Dan reken je gewoon <b>van links naar rechts</b>.</p><p>20 − 8 + 3: eerst 20 − 8 = 12, dan 12 + 3 = <b>15</b>. Niet eerst 8 + 3!</p><p>48 : 4 × 2: eerst 48 : 4 = 12, dan 12 × 2 = <b>24</b>.</p>',
          wanneer:'er in een som alleen plus en min staan, of alleen keer en delen.',
          maak:function(R){
            var v = R.heel(0, 3), a, b, c, s, eerst, opE, opRest, fout;
            if (v === 0){ b = R.heel(3, 20); c = R.heel(2, 15); a = R.heel(b + 5, 60); s = a + ' ' + MIN + ' ' + b + ' + ' + c; eerst = a - b; opE = a + ' ' + MIN + ' ' + b; opRest = eerst + ' + ' + c; fout = a - (b + c); }
            else if (v === 1){ b = R.heel(2, 9); var k = R.heel(2, 12); a = b * k; c = R.heel(2, 6); s = a + ' : ' + b + ' ' + X + ' ' + c; eerst = k; opE = a + ' : ' + b; opRest = k + ' ' + X + ' ' + c; fout = a % (b * c) === 0 ? a / (b * c) : null; }
            else if (v === 2){ b = R.heel(3, 20); c = R.heel(2, 15); a = R.heel(b + c + 3, 70); s = a + ' ' + MIN + ' ' + b + ' ' + MIN + ' ' + c; eerst = a - b; opE = a + ' ' + MIN + ' ' + b; opRest = eerst + ' ' + MIN + ' ' + c; fout = b > c ? a - (b - c) : null; }
            else { b = R.heel(2, 6); c = R.heel(2, 5); var k2 = R.heel(2, 6); a = b * c * k2; s = a + ' : ' + b + ' : ' + c; eerst = a / b; opE = a + ' : ' + b; opRest = eerst + ' : ' + c; fout = b % c === 0 ? a / (b / c) : null; }
            var uit = reken(s);
            return { vraag:s,
              beeld:function(n){ return regelsBeeld([s].concat(n >= 1 ? [opRest] : []).concat(n >= 2 ? [S(uit)] : [])); },
              stappen:[
                st('Begin links: ' + opE + ' =', eerst, 'Reken de eerste twee getallen uit.'),
                st('Dan: ' + opRest + ' =', uit, 'Nu nog één bewerking.', { fout:F([[fout, 'Je begon rechts. Bij gelijke bewerkingen ga je van links naar rechts.']], uit) }) ] };
          } },
        { id:'volg-machten', naam:'Machten in de rij', kort:'Haakjes, dan machten, dan keer en delen, dan plus en min',
          uit:'<p>De hele volgorde is:</p><p>1 <b>haakjes</b>, 2 <b>machten</b>, 3 <b>keer en delen</b>, 4 <b>plus en min</b>. Bij gelijke bewerkingen van links naar rechts.</p><p>Voorbeeld: 2 + 3² × 4. Eerst de macht: 3² = 9. Dan keer: 9 × 4 = 36. Dan plus: 2 + 36 = <b>38</b>.</p>',
          wanneer:'er een macht, zoals een kwadraat, in een lange som staat.',
          maak:function(R){
            var v = R.heel(0, 3), s, stappen, regels;
            if (v === 0){ var a = R.heel(2, 20), b = R.heel(2, 5), c = R.heel(2, 5); s = a + ' + ' + b + '^2 ' + X + ' ' + c;
              regels = [a + ' + ' + b * b + ' ' + X + ' ' + c, a + ' + ' + b * b * c];
              stappen = [st('Eerst de macht: ' + expr(b + '^2') + ' =', b * b, b + ' ' + X + ' ' + b + '.', { fout:F([[b * 2, expr(b + '^2') + ' is ' + b + ' ' + X + ' ' + b + ', niet ' + b + ' ' + X + ' 2.']], b * b) }),
                st('Dan keer: ' + b * b + ' ' + X + ' ' + c + ' =', b * b * c, 'Keer gaat voor plus.'), st('Dan plus: ' + a + ' + ' + b * b * c + ' =', a + b * b * c, 'Tel op.') ]; }
            else if (v === 1){ var d = R.heel(2, 6), b2 = R.heel(2, 15), a2 = b2 + d, c2 = R.heel(2, 30); s = '(' + a2 + ' ' + MIN + ' ' + b2 + ')^2 + ' + c2;
              regels = [d + '^2 + ' + c2, d * d + ' + ' + c2];
              stappen = [st('Eerst de haakjes: ' + a2 + ' ' + MIN + ' ' + b2 + ' =', d, 'Wat tussen haakjes staat gaat voor.'),
                st('Dan de macht: ' + expr(d + '^2') + ' =', d * d, d + ' ' + X + ' ' + d + '.', { fout:F([[d * 2, expr(d + '^2') + ' is ' + d + ' ' + X + ' ' + d + '.']], d * d) }), st('Dan plus: ' + d * d + ' + ' + c2 + ' =', d * d + c2, 'Tel op.') ]; }
            else if (v === 2){ var a3 = R.heel(2, 6), b3 = R.heel(2, 5), c3; c3 = R.heel(1, a3 * b3 * b3 - 1); s = a3 + ' ' + X + ' ' + b3 + '^2 ' + MIN + ' ' + c3;
              regels = [a3 + ' ' + X + ' ' + b3 * b3 + ' ' + MIN + ' ' + c3, a3 * b3 * b3 + ' ' + MIN + ' ' + c3];
              stappen = [st('Eerst de macht: ' + expr(b3 + '^2') + ' =', b3 * b3, b3 + ' ' + X + ' ' + b3 + '.'),
                st('Dan keer: ' + a3 + ' ' + X + ' ' + b3 * b3 + ' =', a3 * b3 * b3, 'Keer gaat voor min.', { fout:F([[a3 * b3 * a3 * b3, 'Alleen de ' + b3 + ' staat in het kwadraat, niet ' + a3 + ' ' + X + ' ' + b3 + '.']], a3 * b3 * b3) }),
                st('Dan min: ' + a3 * b3 * b3 + ' ' + MIN + ' ' + c3 + ' =', a3 * b3 * b3 - c3, 'Trek af.') ]; }
            else { var s4 = R.heel(2, 6), a4 = R.heel(1, s4 - 1), b4 = s4 - a4, ds = delersVan(s4 * s4).filter(function(x){ return x > 1 && x < s4 * s4; }), d4 = K(ds), c4 = R.heel(2, 20); s = c4 + ' + (' + a4 + ' + ' + b4 + ')^2 : ' + d4;
              regels = [c4 + ' + ' + s4 + '^2 : ' + d4, c4 + ' + ' + s4 * s4 + ' : ' + d4, c4 + ' + ' + s4 * s4 / d4];
              stappen = [st('Eerst de haakjes: ' + a4 + ' + ' + b4 + ' =', s4, 'Wat tussen haakjes staat gaat voor.'), st('Dan de macht: ' + expr(s4 + '^2') + ' =', s4 * s4, s4 + ' ' + X + ' ' + s4 + '.'),
                st('Dan delen: ' + s4 * s4 + ' : ' + d4 + ' =', s4 * s4 / d4, 'Delen gaat voor plus.'), st('Dan plus: ' + c4 + ' + ' + s4 * s4 / d4 + ' =', c4 + s4 * s4 / d4, 'Tel op.', { fout:F([[(c4 + s4 * s4) / d4, 'Delen gaat voor plus.']], c4 + s4 * s4 / d4) }) ]; }
            var uit = reken(s);
            stappen[stappen.length - 1].antwoord = S(uit);
            return { vraag:expr(s),
              beeld:function(n){ var r = [expr(s)]; for (var i = 0; i < n && i < regels.length; i++) r.push(expr(regels[i])); if (n >= stappen.length) r.push(S(uit)); return regelsBeeld(r); },
              stappen:stappen };
          } },
        { id:'volg-stappen', naam:'Een lange som in stappen', kort:'Schrijf na elke stap de hele som opnieuw op, met één tussenuitkomst erin',
          uit:'<p>Bij een lange som doe je <b>één bewerking per regel</b>. Schrijf na elke stap de hele som opnieuw op, met de tussenuitkomst erin.</p><p>3 × (8 − 2) + 12 : 4 − 2²<br>= 3 × 6 + 12 : 4 − 2² (haakjes)<br>= 3 × 6 + 12 : 4 − 4 (macht)<br>= 18 + 3 − 4 (keer en delen)<br>= <b>17</b> (plus en min, van links naar rechts)</p>',
          wanneer:'een som zo lang is dat je het overzicht kwijt kunt raken.',
          maak:function(R){
            var v = R.heel(0, 2), s, stappen = [], regels = [], uit;
            if (v === 0){
              var a, b, c, d, e, f, p;
              do { a = R.heel(2, 6); p = R.heel(2, 6); c = R.heel(1, 9); b = c + p; e = R.heel(2, 5); d = e * R.heel(2, 8); f = R.heel(2, 4); } while (a * p + d / e - f * f < 1);
              s = a + ' ' + X + ' (' + b + ' ' + MIN + ' ' + c + ') + ' + d + ' : ' + e + ' ' + MIN + ' ' + f + '^2';
              regels = [a + ' ' + X + ' ' + p + ' + ' + d + ' : ' + e + ' ' + MIN + ' ' + f + '^2', a + ' ' + X + ' ' + p + ' + ' + d + ' : ' + e + ' ' + MIN + ' ' + f * f, a * p + ' + ' + d + ' : ' + e + ' ' + MIN + ' ' + f * f, a * p + ' + ' + d / e + ' ' + MIN + ' ' + f * f];
              stappen = [st('Haakjes: ' + b + ' ' + MIN + ' ' + c + ' =', p, 'Eerst wat tussen haakjes staat.', { waarom:'Nu staat er: ' + expr(regels[0]) }),
                st('Machten: ' + expr(f + '^2') + ' =', f * f, f + ' ' + X + ' ' + f + '.', { waarom:'Nu staat er: ' + regels[1] }),
                st('Keer en delen, van links naar rechts. Eerst ' + a + ' ' + X + ' ' + p + ' =', a * p, 'Keer gaat voor plus.', { waarom:'Nu staat er: ' + regels[2] }),
                st('Dan ' + d + ' : ' + e + ' =', d / e, 'Delen gaat voor plus en min.', { waarom:'Nu staat er: ' + regels[3] }),
                st('Plus en min, van links naar rechts: ' + regels[3] + ' =', 0, 'Eerst ' + a * p + ' + ' + d / e + ', dan ' + MIN + ' ' + f * f + '.') ];
            } else if (v === 1){
              var a1, b1, c1, d1, e1, s1;
              do { a1 = R.heel(1, 4); b1 = R.heel(1, 4); s1 = a1 + b1; c1 = R.heel(2, 6); d1 = R.heel(2, 6); e1 = R.heel(2, 15); } while (s1 * s1 <= c1 * d1);
              s = '(' + a1 + ' + ' + b1 + ')^2 ' + MIN + ' ' + c1 + ' ' + X + ' ' + d1 + ' + ' + e1;
              regels = [s1 + '^2 ' + MIN + ' ' + c1 + ' ' + X + ' ' + d1 + ' + ' + e1, s1 * s1 + ' ' + MIN + ' ' + c1 + ' ' + X + ' ' + d1 + ' + ' + e1, s1 * s1 + ' ' + MIN + ' ' + c1 * d1 + ' + ' + e1];
              stappen = [st('Haakjes: ' + a1 + ' + ' + b1 + ' =', s1, 'Eerst wat tussen haakjes staat.', { waarom:'Nu staat er: ' + expr(regels[0]) }),
                st('Machten: ' + expr(s1 + '^2') + ' =', s1 * s1, s1 + ' ' + X + ' ' + s1 + '.', { waarom:'Nu staat er: ' + regels[1] }),
                st('Keer: ' + c1 + ' ' + X + ' ' + d1 + ' =', c1 * d1, 'Keer gaat voor plus en min.', { waarom:'Nu staat er: ' + regels[2] }),
                st('Plus en min, van links naar rechts: ' + regels[2] + ' =', 0, 'Eerst ' + s1 * s1 + ' ' + MIN + ' ' + c1 * d1 + ', dan + ' + e1 + '.', { fout:F([[s1 * s1 - (c1 * d1 + e1), 'Van links naar rechts: eerst de min, dan de plus.']], s1 * s1 - c1 * d1 + e1) }) ];
            } else {
              var a2, b2, c2, d2, e2, f2, q2;
              do { d2 = R.heel(2, 6); q2 = R.heel(2, 6); b2 = R.heel(1, d2 * q2 - 1); c2 = d2 * q2 - b2; e2 = R.heel(2, 6); f2 = R.heel(2, 6); a2 = R.heel(q2 + 2, 40); } while (b2 < 1 || c2 < 1);
              s = a2 + ' ' + MIN + ' (' + b2 + ' + ' + c2 + ') : ' + d2 + ' + ' + e2 + ' ' + X + ' ' + f2;
              regels = [a2 + ' ' + MIN + ' ' + (b2 + c2) + ' : ' + d2 + ' + ' + e2 + ' ' + X + ' ' + f2, a2 + ' ' + MIN + ' ' + q2 + ' + ' + e2 + ' ' + X + ' ' + f2, a2 + ' ' + MIN + ' ' + q2 + ' + ' + e2 * f2];
              stappen = [st('Haakjes: ' + b2 + ' + ' + c2 + ' =', b2 + c2, 'Eerst wat tussen haakjes staat.', { waarom:'Nu staat er: ' + regels[0] }),
                st('Delen: ' + (b2 + c2) + ' : ' + d2 + ' =', q2, 'Delen gaat voor plus en min.', { waarom:'Nu staat er: ' + regels[1] }),
                st('Keer: ' + e2 + ' ' + X + ' ' + f2 + ' =', e2 * f2, 'Keer gaat voor plus en min.', { waarom:'Nu staat er: ' + regels[2] }),
                st('Plus en min, van links naar rechts: ' + regels[2] + ' =', 0, 'Eerst ' + a2 + ' ' + MIN + ' ' + q2 + ', dan + ' + e2 * f2 + '.', { fout:F([[a2 - (q2 + e2 * f2), 'Van links naar rechts: eerst de min, dan de plus.']], a2 - q2 + e2 * f2) }) ];
            }
            uit = reken(s); stappen[stappen.length - 1].antwoord = S(uit);
            return { vraag:expr(s),
              beeld:function(n){ var r = [expr(s)]; for (var i = 0; i < n && i < regels.length; i++) r.push(expr(regels[i])); if (n >= stappen.length) r.push(S(uit)); return regelsBeeld(r); },
              stappen:stappen };
          } },
        { id:'volg-zethaakjes', naam:'Haakjes zetten', kort:'Reken eerst zonder haakjes en probeer dan waar haakjes de uitkomst goed maken',
          uit:'<p>Soms klopt een som pas als je er <b>haakjes</b> in zet. Haakjes veranderen de volgorde, en dus de uitkomst.</p><p>2 + 3 × 4 = 14. Maar (2 + 3) × 4 = <b>20</b>.</p><p>Werkwijze: reken eerst uit wat er zonder haakjes uitkomt. Probeer dan haakjes om twee of drie getallen, tot de uitkomst klopt.</p>',
          wanneer:'je moet laten zien welke bewerking eerst moet om op een uitkomst te komen.',
          maak:function(R){
            var n, o, plekken, w, geen, doel, opties;
            for (var poging = 0; poging < 200; poging++){
              n = [R.heel(2, 9), R.heel(2, 9), R.heel(2, 9), R.heel(2, 9)];
              o = [K(['+', MIN, X]), K(['+', MIN, X]), K(['+', MIN, X])];
              if (o.indexOf(X) < 0) o[R.heel(0, 2)] = X;
              plekken = [[0, 1], [1, 2], [2, 3], [0, 2], [1, 3]].map(function(p){
                var t = ''; for (var i = 0; i < 4; i++){ if (i === p[0]) t += '('; t += n[i]; if (i === p[1]) t += ')'; if (i < 3) t += ' ' + o[i] + ' '; } return t; });
              var zonder = n[0] + ' ' + o[0] + ' ' + n[1] + ' ' + o[1] + ' ' + n[2] + ' ' + o[2] + ' ' + n[3];
              geen = reken(zonder);
              if (geen < 0) continue;
              w = plekken.map(reken);
              var kandidaten = plekken.map(function(p, i){ return i; }).filter(function(i){ return w[i] >= 0 && w[i] !== geen && w.filter(function(x){ return x === w[i]; }).length === 1; });
              if (!kandidaten.length) continue;
              doel = K(kandidaten);
              var andere = plekken.filter(function(p, i){ return i !== doel && w[i] !== w[doel]; });
              if (andere.length < 2) continue;
              opties = R.hussel(andere).slice(0, 3).concat([zonder]);
              opties = R.hussel(opties).slice(0, 3);
              break;
            }
            var goed = plekken[doel];
            return eindKeuze({ vraag:n[0] + ' ' + o[0] + ' ' + n[1] + ' ' + o[1] + ' ' + n[2] + ' ' + o[2] + ' ' + n[3] + ' = ' + w[doel], context:'Zet haakjes zodat de uitkomst klopt.',
              stappen:[
                st('Reken eerst uit zonder haakjes: wat komt eruit?', S(geen), 'Eerst keer, dan plus en min van links naar rechts.'),
                kz('Dat is niet ' + w[doel] + '. Waar moeten de haakjes staan?', goed, opties, 'Probeer elke keuze: reken eerst uit wat tussen de haakjes staat. Welke geeft ' + w[doel] + '?') ] });
          } }
      ] },

    { groep:{ id:'macht-basis', niveau:'2F', domein:'getallen', naam:'Machten en wortels', uit:'Kwadraten en andere machten, machten van 10, wortels uit kwadraten en een wortel schatten.' },
      doelen:[
        { id:'macht-kwadraat', naam:'Kwadraten', kort:'Een getal in het kwadraat is dat getal keer zichzelf',
          uit:'<p>Een getal <b>in het kwadraat</b> is dat getal keer zichzelf. Je schrijft een kleine 2 rechtsboven: 13² = 13 × 13.</p><p>Let op: 13² is niet 13 × 2!</p><p>Reken handig door te splitsen: 13 × 13 = 10 × 13 + 3 × 13 = 130 + 39 = <b>169</b>.</p>',
          wanneer:'je de oppervlakte van een vierkant uitrekent, of een kwadraat in een som ziet.',
          maak:function(R){
            var g; do { g = R.heel(11, 25); } while (g === 20);
            var t = g - g % 10, e = g % 10;
            return { vraag:expr(g + '^2'),
              stappen:[
                kz(expr(g + '^2') + ' betekent ...', g + ' ' + X + ' ' + g, [g + ' ' + X + ' 2', g + ' + ' + g], 'De kleine 2 zegt: twee keer het getal ' + g + ' met elkaar vermenigvuldigen.'),
                st('Splits: ' + t + ' ' + X + ' ' + g + ' =', t * g, (t / 10) + ' ' + X + ' ' + g + ' en dan een 0 erachter.'),
                st(e + ' ' + X + ' ' + g + ' =', e * g, e + ' ' + X + ' ' + t + ' + ' + e + ' ' + X + ' ' + e + '.'),
                st('Samen: ' + t * g + ' + ' + e * g + ' =', g * g, 'Tel op.', { fout:F([[g * 2, 'Dat is ' + g + ' ' + X + ' 2. Een kwadraat is ' + g + ' ' + X + ' ' + g + '.']], g * g) }) ] };
          } },
        { id:'macht-tien', naam:'Machten van 10', kort:'10 tot de macht 3 is een 1 met 3 nullen: 1000',
          uit:'<p>Bij <b>machten van 10</b> zegt het kleine getal hoeveel <b>nullen</b> er achter de 1 komen.</p><p>10³ = 10 × 10 × 10 = 1000: drie nullen. 10⁶ = 1.000.000: zes nullen.</p><p>Andersom: 100.000 heeft vijf nullen, dus 100.000 = 10⁵. En 4 × 10³ = 4 × 1000 = 4000.</p>',
          wanneer:'je met heel grote getallen werkt, zoals bij afstanden in het heelal of in de krant.',
          maak:function(R){
            var soort = R.heel(0, 2), e = R.heel(2, 9), m;
            if (soort === 0) return { vraag:tienMacht(e) + ' = …',
              stappen:[ st('Hoeveel nullen komen er achter de 1?', e, 'Het kleine getal is ' + e + '.'), st('Schrijf het getal op:', Math.pow(10, e), 'Een 1 met ' + e + ' nullen.') ] };
            if (soort === 1) return { vraag:T(Math.pow(10, e)) + ' = 10 tot de macht …',
              stappen:[ st('Tel de nullen van ' + T(Math.pow(10, e)) + ':', e, 'De punten tellen niet mee.'), st('Dus ' + T(Math.pow(10, e)) + ' = 10 tot de macht', e, 'Evenveel als het aantal nullen.') ], antwoord:[String(e), '10^' + e, tienMacht(e)] };
            m = R.heel(2, 9);
            return { vraag:m + ' ' + X + ' ' + tienMacht(e),
              stappen:[ st(tienMacht(e) + ' =', Math.pow(10, e), 'Een 1 met ' + e + ' nullen.'), st(m + ' ' + X + ' ' + T(Math.pow(10, e)) + ' =', m * Math.pow(10, e), 'Zet ' + e + ' nullen achter de ' + m + '.') ] };
          } },
        { id:'macht-ander', naam:'Andere machten', kort:'Het kleine getal zegt hoe vaak je het getal met zichzelf vermenigvuldigt',
          uit:'<p>Bij 2⁵ vermenigvuldig je de 2 <b>vijf keer</b> met zichzelf: 2 × 2 × 2 × 2 × 2.</p><p>Reken stap voor stap: 2 × 2 = 4, × 2 = 8, × 2 = 16, × 2 = <b>32</b>.</p><p>Het grote getal heet het <b>grondtal</b>, het kleine getal de <b>exponent</b>.</p>',
          wanneer:'je een macht met een ander grondtal dan 10 uitrekent.',
          maak:function(R){
            var b = K([2, 2, 3, 3, 4, 5, 6]), e = b === 2 ? R.heel(3, 5) : b === 3 ? R.heel(3, 4) : b === 5 ? R.heel(3, 4) : 3;
            var lang = []; for (var i = 0; i < e; i++) lang.push(b); lang = lang.join(' ' + X + ' ');
            var stappen = [kz(expr(b + '^' + e) + ' betekent ...', lang, [b + ' ' + X + ' ' + e, e + ' ' + X + ' ' + e + (e === 3 ? ' ' + X + ' ' + e : '')].filter(function(x){ return x !== lang; }), 'De ' + b + ' komt ' + e + ' keer voor.')];
            var w = b;
            for (i = 2; i <= e; i++){ var nw = w * b; stappen.push(st((i === 2 ? b + ' ' + X + ' ' + b : w + ' ' + X + ' ' + b) + ' =', nw, i === 2 ? 'De tafel van ' + b + '.' : 'Doe de vorige uitkomst nog een keer ' + X + ' ' + b + '.', i === e ? { fout:F([[b * e, 'Dat is ' + b + ' ' + X + ' ' + e + '. Bij een macht vermenigvuldig je ' + b + ' met zichzelf.']], nw) } : {})); w = nw; }
            return { vraag:expr(b + '^' + e), stappen:stappen };
          } },
        { id:'macht-wortel', naam:'Wortels van kwadraten', kort:'Zoek het getal dat keer zichzelf het getal onder de wortel geeft',
          uit:'<p>De <b>wortel</b> is het omgekeerde van het kwadraat. √144 is het getal dat keer zichzelf 144 geeft. Dat is 12, want 12 × 12 = 144.</p><p>Zo vind je het: kijk eerst tussen welke tientallen het ligt (10² = 100, 20² = 400). Kijk dan naar het <b>laatste cijfer</b>: eindigt het op 4, dan eindigt de wortel op 2 of 8. Kies dan de goede.</p>',
          wanneer:'je bij een vierkant de zijde zoekt als je de oppervlakte weet.',
          maak:function(R){
            var g; do { g = R.heel(11, 29); } while (g % 10 === 0);
            var n = g * g, t = g - g % 10, e = g % 10, laatst = n % 10;
            var EIND = { 1:'1 of 9', 4:'2 of 8', 9:'3 of 7', 6:'4 of 6', 5:'5' }, alleEind = ['1 of 9', '2 of 8', '3 of 7', '4 of 6', '5'];
            var tient = ['tussen 10 en 20', 'tussen 20 en 30', 'tussen 0 en 10', 'tussen 30 en 40'], goedT = 'tussen ' + t + ' en ' + (t + 10);
            var kand = laatst === 5 ? [t + 5] : [t + (EIND[laatst].split(' of ').map(Number)[0]), t + (EIND[laatst].split(' of ').map(Number)[1])];
            return { vraag:'√' + n,
              stappen:[
                kz('Tussen welke tientallen ligt de wortel? (10² = 100, 20² = 400, 30² = 900)', goedT, tient.filter(function(x){ return x !== goedT; }).slice(0, 2), n + ' ligt tussen ' + t * t + ' en ' + (t + 10) * (t + 10) + '.'),
                kz(n + ' eindigt op een ' + laatst + '. Op welk cijfer eindigt de wortel?', EIND[laatst], R.hussel(alleEind.filter(function(x){ return x !== EIND[laatst]; })).slice(0, 2), 'Welke cijfers keer zichzelf eindigen op ' + laatst + '? Bijvoorbeeld ' + (EIND[laatst].split(' of ')[0]) + ' ' + X + ' ' + (EIND[laatst].split(' of ')[0]) + ' = ' + Math.pow(+EIND[laatst].split(' of ')[0], 2) + '.'),
                st(kand.length > 1 ? 'Het is ' + kand[0] + ' of ' + kand[1] + '. Welke is het? √' + n + ' =' : 'Dan is √' + n + ' =', g, kand.length > 1 ? (t + 5) + '² = ' + (t + 5) * (t + 5) + '. Is ' + n + ' kleiner, dan is het ' + kand[0] + '. Is het groter, dan ' + kand[1] + '.' : 'Controleer: ' + g + ' ' + X + ' ' + g + ' = ' + n + '.') ] };
          } },
        { id:'macht-schatwortel', naam:'Een wortel schatten', kort:'Zoek de kwadraten net onder en net boven het getal',
          uit:'<p>Niet elk getal is een kwadraat. √50 is geen heel getal. Je kunt wel <b>schatten</b> tussen welke twee hele getallen het ligt.</p><p>Zoek het kwadraat <b>net onder</b> 50: dat is 49 = 7². En het kwadraat <b>net boven</b> 50: dat is 64 = 8².</p><p>Dus √50 ligt <b>tussen 7 en 8</b>.</p>',
          wanneer:'je ongeveer wilt weten hoe groot een wortel is, zonder rekenmachine.',
          maak:function(R){
            var n, f;
            do { n = R.heel(5, 200); f = Math.floor(Math.sqrt(n)); } while (f * f === n);
            var goed = f + ' en ' + (f + 1), fout = [(f - 1) + ' en ' + f, (f + 1) + ' en ' + (f + 2)];
            fout.push(Math.round(n / 2) + ' en ' + (Math.round(n / 2) + 1));
            fout = fout.filter(function(x, i, a){ return x !== goed && a.indexOf(x) === i; });
            return eindKeuze({ vraag:'√' + n, context:'Tussen welke twee hele getallen ligt deze wortel?',
              stappen:[
                st('Welk kwadraat ligt net onder ' + n + '?', f * f, 'Probeer kwadraten: ' + f + ' ' + X + ' ' + f + ' en ' + (f + 1) + ' ' + X + ' ' + (f + 1) + '.'),
                st('Welk kwadraat ligt net boven ' + n + '?', (f + 1) * (f + 1), 'Het volgende kwadraat na ' + f * f + '.'),
                kz('Dus √' + n + ' ligt tussen ...', goed, fout.slice(0, 3), f * f + ' = ' + f + '² en ' + (f + 1) * (f + 1) + ' = ' + (f + 1) + '².') ] });
          } }
      ] },

    { groep:{ id:'macht-delers', niveau:'2F', domein:'getallen', naam:'Delers en veelvouden', uit:'Delers in paren vinden, veelvouden, de regels voor deelbaarheid, en de grootste gemeenschappelijke deler en het kleinste gemeenschappelijke veelvoud in een verhaal.' },
      doelen:[
        { id:'macht-delers-paren', naam:'Delers vinden in paren', kort:'Probeer 1, 2, 3 ... en schrijf elke deler op samen met zijn partner',
          uit:'<p>Een <b>deler</b> van 24 is een getal waardoor je 24 precies kunt delen, zonder rest.</p><p>Zoek de delers <b>in paren</b>: 1 × 24, 2 × 12, 3 × 8, 4 × 6. Probeer 1, 2, 3, 4 ... Zodra je een getal tegenkomt dat je al hebt, ben je klaar.</p><p>De delers van 24 zijn dus: 1, 2, 3, 4, 6, 8, 12 en 24.</p>',
          wanneer:'je alle delers van een getal zoekt, bijvoorbeeld om een breuk te vereenvoudigen.',
          maak:function(R){
            var n, paren;
            do { n = R.heel(12, 100); paren = []; for (var d = 2; d * d <= n; d++) if (n % d === 0) paren.push(d); } while (paren.length < 2 || paren.length > 4);
            var alle = delersVan(n), stappen = [], vorige = 1;
            paren.forEach(function(d){
              var over = []; for (var x = vorige + 1; x < d; x++) over.push(x);
              stappen.push(st((stappen.length ? '' : 'Het eerste paar is 1 ' + X + ' ' + n + '. ') + (over.length ? over.join(', ') + (over.length === 1 ? ' past' : ' passen') + ' niet. ' : '') + 'Probeer ' + d + ': ' + n + ' : ' + d + ' =', n / d, 'Deel ' + n + ' door ' + d + '.', { waarom:'Paar: ' + d + ' ' + X + ' ' + n / d + ' = ' + n }));
              vorige = d;
            });
            var ctrl = lijstControle(alle);
            stappen.push(st('Schrijf alle delers op, van klein naar groot:', alle.join(', '), 'Alle getallen uit de paren: 1, ' + n + ', ' + paren.map(function(d){ return d + ', ' + n / d; }).join(', ') + '.' + (paren.some(function(d){ return d * d === n; }) ? ' Een deler die met zichzelf een paar vormt, schrijf je één keer op.' : ''), { controle:ctrl }));
            return { vraag:'De delers van ' + n, controle:ctrl, antwoord:alle.join(', '),
              beeld:function(k){ var r = [['deler', 'partner'], ['1', String(n)]]; paren.forEach(function(d, i){ if (i < k) r.push([String(d), String(n / d)]); }); return R.teken.tabel(r, { kop:true }); },
              stappen:stappen };
          } },
        { id:'macht-veelvoud', naam:'Veelvouden', kort:'Een veelvoud krijg je door het getal keer 1, 2, 3 ... te doen: de tafel van dat getal',
          uit:'<p>De <b>veelvouden</b> van 7 zijn de getallen uit de tafel van 7: 7, 14, 21, 28 en zo verder. Ze gaan oneindig door.</p><p>Zoek je het eerste veelvoud van 7 boven 100? Kijk hoe vaak 7 in 100 past: 14 keer, want 14 × 7 = 98. Het volgende veelvoud is 98 + 7 = <b>105</b>.</p>',
          wanneer:'je wilt weten of een getal in een tafel zit, of welk getal uit een tafel het eerst boven een grens komt.',
          maak:function(R){
            var d = R.heel(6, 19), N; do { N = K([50, 100, 150, 200, 250, 300, 500, 1000]) + K([0, 0, R.heel(1, 40)]); } while (N % d === 0);
            var q = Math.floor(N / d);
            return { vraag:'Het eerste veelvoud van ' + d + ' boven ' + N,
              stappen:[
                st('Hoe vaak past ' + d + ' in ' + N + '?', q, 'Probeer ' + Math.floor(q / 10) * 10 + ' ' + X + ' ' + d + ' = ' + Math.floor(q / 10) * 10 * d + ' en ga verder.'),
                st(q + ' ' + X + ' ' + d + ' =', q * d, 'Dat is het grootste veelvoud dat nog niet boven ' + N + ' komt.'),
                st('Het volgende veelvoud: ' + q * d + ' + ' + d + ' =', (q + 1) * d, 'Tel er nog één keer ' + d + ' bij.', { fout:F([[q * d, 'Dat is nog niet boven ' + N + '. Tel er nog ' + d + ' bij.']]) }) ] };
          } },
        { id:'macht-deelbaar', naam:'Deelbaar door 2, 3, 5, 9 en 10', kort:'Kijk naar het laatste cijfer (2, 5, 10) of tel alle cijfers op (3, 9)',
          uit:'<p>Met een paar <b>regels</b> zie je snel of een getal deelbaar is, zonder te delen.</p><p>Door <b>2</b>: het laatste cijfer is even. Door <b>5</b>: het laatste cijfer is 0 of 5. Door <b>10</b>: het laatste cijfer is 0.</p><p>Door <b>3</b>: de som van alle cijfers is deelbaar door 3. Door <b>9</b>: de som van alle cijfers is deelbaar door 9. Bij 3417: 3 + 4 + 1 + 7 = 15. 15 is deelbaar door 3, dus 3417 ook.</p>',
          wanneer:'je snel wilt weten of iets eerlijk te verdelen is, of een breuk kunt vereenvoudigen.',
          maak:function(R){
            var k = K([2, 3, 5, 9, 10]), ja = R.heel(0, 1) === 1, N;
            do { N = R.heel(102, 9998); } while ((N % k === 0) !== ja || (k === 9 && !ja && N % 3 !== 0 && R.heel(0, 1)));
            var som = String(N).split('').reduce(function(a, c){ return a + (+c); }, 0), stappen;
            var antw = ja ? 'Ja' : 'Nee';
            if (k === 3 || k === 9) stappen = [
              st('Tel alle cijfers van ' + N + ' op:', som, String(N).split('').join(' + ') + '.'),
              kzVast('Is ' + som + ' deelbaar door ' + k + '? Dus: is ' + N + ' deelbaar door ' + k + '?', ['Ja', 'Nee'], antw, som + ' in de tafel van ' + k + '? ' + (som >= 10 ? 'Twijfel je? Tel de cijfers van ' + som + ' nog eens op.' : ''))];
            else stappen = [
              st('Wat is het laatste cijfer van ' + N + '?', N % 10, 'Kijk naar het cijfer helemaal rechts.'),
              kzVast('Is ' + N + ' deelbaar door ' + k + '?', ['Ja', 'Nee'], antw, k === 2 ? 'Deelbaar door 2 als het laatste cijfer even is: 0, 2, 4, 6 of 8.' : k === 5 ? 'Deelbaar door 5 als het laatste cijfer 0 of 5 is.' : 'Deelbaar door 10 als het laatste cijfer 0 is.')];
            return eindKeuze({ vraag:'Is ' + N + ' deelbaar door ' + k + '?', stappen:stappen });
          } },
        { id:'macht-ggd', naam:'De grootste gemeenschappelijke deler', kort:'Zoek de delers van het kleinste getal en kies de grootste die ook het andere getal deelt',
          uit:'<p>De <b>ggd</b> (grootste gemeenschappelijke deler) is het grootste getal dat <b>allebei</b> de getallen precies deelt.</p><p>Bij 24 en 36: de delers van 24 zijn 1, 2, 3, 4, 6, 8, 12, 24. Welke van die delen ook 36? 1, 2, 3, 4, 6 en 12. De grootste is <b>12</b>.</p><p>Handig bij verdelen: met 24 rode en 36 blauwe knikkers maak je zo 12 gelijke zakjes.</p>',
          wanneer:'je twee soorten dingen eerlijk over zoveel mogelijk gelijke groepjes verdeelt.',
          maak:function(R){
            var a, b, g;
            do { a = R.heel(8, 48); b = R.heel(a + 2, 72); g = ggd(a, b); } while (g < 2 || g === a || delersVan(a).length > 10);
            var C = K([
              { t:'Je hebt {a} rode en {b} blauwe knikkers. Je maakt zoveel mogelijk zakjes die precies hetzelfde zijn, zonder dat er iets overblijft. Hoeveel zakjes?', e:'zakjes' },
              { t:'Een bloemist heeft {a} rozen en {b} tulpen. Ze maakt zoveel mogelijk gelijke boeketten, zonder dat er bloemen overblijven. Hoeveel boeketten?', e:'boeketten' },
              { t:'Er zijn {a} meisjes en {b} jongens. De juf maakt zoveel mogelijk groepjes met in elk groepje evenveel meisjes en evenveel jongens. Hoeveel groepjes?', e:'groepjes' },
              null ]);
            var da = delersVan(a), ctrl = lijstControle(da);
            return { vraag:C ? 'ggd van ' + a + ' en ' + b + ' ' + C.e : 'De ggd van ' + a + ' en ' + b, vraagHtml:R.schoon('De ggd van ' + a + ' en ' + b), context:C ? C.t.replace('{a}', a).replace('{b}', b) : '', eenheid:C ? C.e : '',
              beeld:function(n){ return n >= 1 ? klein([['deler van ' + a, 'deelt ook ' + b + '?']].concat(da.map(function(d){ return [String(d), n >= 2 ? (b % d === 0 ? 'ja' : 'nee') : '']; })), { kop:true, nadruk:n >= 2 ? [[da.indexOf(g) + 1, 0], [da.indexOf(g) + 1, 1]] : [] }) : ''; },
              stappen:[
                st('Schrijf alle delers van ' + a + ' op:', da.join(', '), 'Zoek de paren: 1 ' + X + ' ' + a + ', 2 ' + X + ' ... Schrijf ze op van klein naar groot.', { controle:ctrl }),
                st('Welke van die delers deelt ook ' + b + '? Kies de grootste:', g, 'Begin bij de grootste deler van ' + a + ' en kijk of ' + b + ' er precies door te delen is.', { fout:F([[a, b + ' is niet precies door ' + a + ' te delen.']], g) }) ] };
          } },
        { id:'macht-kgv', naam:'Wanneer vallen ze weer samen?', kort:'Loop de tafel van het grootste getal af tot je een getal vindt dat ook in de andere tafel zit',
          uit:'<p>Bus A vertrekt elke 12 minuten, bus B elke 18 minuten. Om 8.00 uur vertrekken ze samen. Wanneer weer?</p><p>Zoek het <b>kgv</b>: het kleinste getal dat in <b>beide tafels</b> zit. Loop de tafel van het grootste getal af: 18, 36, ... Zit 18 in de tafel van 12? Nee. Zit 36 in de tafel van 12? Ja!</p><p>Na <b>36 minuten</b> vertrekken ze weer samen.</p>',
          wanneer:'twee dingen zich elk in hun eigen ritme herhalen en je wilt weten wanneer ze samenvallen.',
          maak:function(R){
            var a, b, k;
            do { a = R.heel(3, 15); b = R.heel(a + 1, 20); var l = a * b / ggd(a, b); k = l / b; } while (b % a === 0 || k > 4 || k < 2);
            var kgv = k * b;
            var C = K([
              { t:'Bus A vertrekt elke {a} minuten, bus B elke {b} minuten. Om 8.00 uur vertrekken ze samen. Na hoeveel minuten vertrekken ze weer samen?', e:'minuten' },
              { t:'Een rode lamp knippert elke {a} seconden, een groene lamp elke {b} seconden. Ze knipperen net samen. Na hoeveel seconden knipperen ze weer samen?', e:'seconden' },
              { t:'Sanne traint elke {a} dagen, Mo elke {b} dagen. Vandaag trainen ze allebei. Na hoeveel dagen trainen ze weer op dezelfde dag?', e:'dagen' } ]);
            var stappen = [];
            for (var i = 1; i <= k; i++){ var v = i * b, zit = v % a === 0;
              stappen.push(kzVast(i + ' ' + X + ' ' + b + ' = ' + v + '. Zit ' + v + ' in de tafel van ' + a + '?', ['ja', 'nee'], zit ? 'ja' : 'nee', v + ' : ' + a + (zit ? ' = ' + v / a + ', dat komt precies uit.' : ' komt niet precies uit.'))); }
            stappen.push(st('Na hoeveel ' + C.e + ' vallen ze weer samen?', kgv, 'Het eerste getal uit de tafel van ' + b + ' dat ook in de tafel van ' + a + ' zit.', { eenheid:C.e, fout:F([[a * b, 'Dat klopt ook, maar het kan eerder. Zoek het kleinste getal.']], kgv) }));
            return { vraag:'elke ' + a + ' en elke ' + b + ' ' + C.e, vraagHtml:R.schoon('Elke ' + a + ' en elke ' + b + ' ' + C.e), context:C.t.replace('{a}', a).replace('{b}', b), eenheid:C.e, stappen:stappen };
          } }
      ] },

    /* ===================== 3F ===================== */
    { groep:{ id:'macht-sci', niveau:'3F', domein:'getallen', naam:'Grote en kleine getallen', uit:'Heel grote en heel kleine getallen in de wetenschappelijke notatie, voorvoegsels als kilo, mega en micro, de tekenregels bij keer en delen, en zinvol afronden.' },
      doelen:[
        { id:'macht-wetnot', naam:'Naar de wetenschappelijke notatie', kort:'Zet de komma na het eerste cijfer en tel hoeveel plaatsen hij schuift',
          uit:'<p>Heel grote en heel kleine getallen schrijf je korter in de <b>wetenschappelijke notatie</b>: een getal tussen 1 en 10, keer een macht van 10.</p><p>3.200.000: zet de komma na het eerste cijfer: 3,2. De komma schuift 6 plaatsen. Dus 3.200.000 = <b>3,2 × 10⁶</b>.</p><p>Bij een klein getal is de macht negatief: 0,00045 = 4,5 × 10⁻⁴, want de komma schuift 4 plaatsen naar rechts.</p>',
          wanneer:'je heel grote of heel kleine getallen kort wilt opschrijven, zoals in de natuurkunde.',
          maak:function(R){
            var klein = R.heel(0, 2) === 0, mm, m, e, x;
            do { mm = R.heel(11, 99); } while (mm % 10 === 0);
            m = mm / 10;
            if (klein){ e = -R.heel(2, 5); } else e = R.heel(3, 9);
            x = rnd(mm * Math.pow(10, e - 1), 12);
            var ctrl = wetControle(m, e);
            return { vraag:T(x, { dec:12 }), context:'Schrijf in de wetenschappelijke notatie. Typ bijvoorbeeld 3,2 x 10^6.', controle:ctrl, antwoord:wet(m, e),
              stappen:[
                st('Welk getal tussen 1 en 10 krijg je met de cijfers ' + String(mm).split('').join(' en ') + '?', S(m), 'Zet de komma direct achter het eerste cijfer dat geen 0 is.'),
                kz('Schuift de komma naar links of naar rechts?', klein ? 'naar rechts, de macht wordt negatief' : 'naar links, de macht is positief', [klein ? 'naar links, de macht is positief' : 'naar rechts, de macht wordt negatief'], klein ? 'Het getal is kleiner dan 1. Om ' + S(m) + ' te krijgen, schuift de komma naar rechts.' : 'Het getal is groot. Om ' + S(m) + ' te krijgen, schuift de komma naar links.'),
                st('Hoeveel plaatsen schuift de komma? Dat is de macht' + (klein ? ' (met een min ervoor)' : '') + ':', S(e), 'Tel de cijfers ' + (klein ? 'van de komma in ' + T(x, { dec:12 }) + ' tot en met het eerste cijfer dat geen 0 is.' : 'na het eerste cijfer.'), { fout:klein ? F([[-e, 'Bij een getal kleiner dan 1 is de macht negatief.']]) : {} }),
                st('Schrijf op in de wetenschappelijke notatie:', wet(m, e), S(m) + ' keer 10 tot de macht ' + S(e) + '.', { controle:ctrl }) ] };
          } },
        { id:'macht-wetterug', naam:'Terug naar een gewoon getal', kort:'Positieve macht: komma naar rechts. Negatieve macht: komma naar links',
          uit:'<p>Bij 4,5 × 10³ schuift de komma <b>3 plaatsen naar rechts</b>: 4500.</p><p>Bij een <b>negatieve macht</b> schuift de komma naar links. 4,5 × 10⁻³ = 0,0045. Vul de lege plaatsen aan met nullen.</p><p>Controle: een positieve macht geeft een groot getal, een negatieve macht een getal kleiner dan 1.</p>',
          wanneer:'je een getal in de wetenschappelijke notatie gewoon wilt uitschrijven.',
          maak:function(R){
            var klein = R.heel(0, 1) === 1, mm, e;
            do { mm = R.heel(11, 99); } while (mm % 10 === 0);
            e = klein ? -R.heel(1, 5) : R.heel(2, 8);
            var m = mm / 10, x = rnd(mm * Math.pow(10, e - 1), 12), xt = T(x, { dec:12 });
            return { vraag:wet(m, e), context:'Schrijf als gewoon getal.', antwoord:xt,
              stappen:[
                kz('De macht is ' + S(e) + '. Naar welke kant schuift de komma?', klein ? 'naar links, het getal wordt klein' : 'naar rechts, het getal wordt groot', [klein ? 'naar rechts, het getal wordt groot' : 'naar links, het getal wordt klein'], klein ? 'Een negatieve macht: het getal wordt kleiner dan 1.' : 'Een positieve macht: het getal wordt groot.'),
                st('Hoeveel plaatsen schuift de komma?', Math.abs(e), 'Kijk naar het getal in de macht, zonder de min.'),
                st('Schrijf het getal op:', xt, 'Schuif de komma in ' + S(m) + ' ' + Math.abs(e) + ' plaatsen naar ' + (klein ? 'links' : 'rechts') + ' en vul aan met nullen.', { fout:F([[rnd(mm * Math.pow(10, -e - 1), 12), 'Je schoof de komma de verkeerde kant op.']]) }) ] };
          } },
        { id:'macht-voorvoegsel', naam:'Kilo, mega, giga, milli, micro en nano', kort:'Elk voorvoegsel is een macht van 10: kilo is duizend, mega een miljoen, milli een duizendste',
          uit:'<p>Een <b>voorvoegsel</b> voor een eenheid is een vast getal:</p><p><b>kilo</b> = 1000 = 10³, <b>mega</b> = 1.000.000 = 10⁶, <b>giga</b> = 1.000.000.000 = 10⁹.<br><b>milli</b> = 0,001 = 10⁻³, <b>micro</b> = 0,000001 = 10⁻⁶, <b>nano</b> = 10⁻⁹.</p><p>Dus 3,5 megawatt = 3,5 × 1.000.000 watt = 3.500.000 watt. Tussen twee buren (zoals nano en micro) zit steeds een factor 1000.</p>',
          wanneer:'je met eenheden werkt zoals gigabyte, megawatt, milligram of micrometer.',
          maak:function(R){
            var V = { kilo:3, mega:6, giga:9, milli:-3, micro:-6 }, FACT = { 3:'1.000', 6:'1.000.000', 9:'1.000.000.000', '-3':'0,001', '-6':'0,000001' };
            var soort = R.heel(0, 3);
            if (soort < 3){
              var C = K([['kilo', 'gram'], ['kilo', 'meter'], ['mega', 'watt'], ['mega', 'byte'], ['giga', 'byte'], ['giga', 'watt'], ['milli', 'gram'], ['milli', 'liter'], ['milli', 'meter'], ['micro', 'gram'], ['micro', 'meter']]);
              var e = V[C[0]], x, res;
              x = e > 0 ? (R.heel(0, 1) ? R.heel(2, 9) : rnd(R.heel(11, 99) / 10)) : (e === -3 ? R.heel(2, 999) : R.heel(2, 99)); res = rnd(x * Math.pow(10, e), 12);
              var opties = Object.keys(FACT).filter(function(k){ return +k !== e; }).map(function(k){ return X + ' ' + FACT[k]; });
              return { vraag:S(x) + ' ' + C[0] + C[1] + ' = … ' + C[1],
                stappen:[
                  kz('Wat betekent ' + C[0] + '?', X + ' ' + FACT[e], R.hussel(opties).slice(0, 3), C[0] + ' = 10' + sup(e) + '.'),
                  st('Reken uit: ' + S(x) + ' ' + X + ' ' + FACT[e] + ' =', T(res, { dec:12 }), e > 0 ? 'De komma schuift ' + e + ' plaatsen naar rechts.' : 'De komma schuift ' + (-e) + ' plaatsen naar links. Vul aan met nullen.', { eenheid:C[1] }) ], eenheid:C[1] };
            }
            var P = K([['nano', 'micro', 'meter'], ['micro', 'milli', 'gram'], ['milli', 'een', 'liter'], ['mega', 'giga', 'byte'], ['kilo', 'mega', 'watt']]);
            var naarGroot = R.heel(0, 1) === 1, y = naarGroot ? R.heel(2, 99) * 100 : R.heel(2, 9) + R.heel(0, 9) / 10;
            var van = naarGroot ? P[0] : P[1], naar = naarGroot ? P[1] : P[0], uit = naarGroot ? rnd(y / 1000) : rnd(y * 1000);
            var vanW = van === 'een' ? P[2] : van + P[2], naarW = naar === 'een' ? P[2] : naar + P[2];
            return { vraag:S(y) + ' ' + vanW + ' = … ' + naarW, eenheid:naarW,
              stappen:[
                st('Hoeveel ' + (naarGroot ? vanW : naarW) + ' gaan er in één ' + (naarGroot ? naarW : vanW) + '?', 1000, 'Tussen twee buren in de rij nano, micro, milli, (gewoon), kilo, mega, giga zit steeds 1000.'),
                kz('Wordt het getal groter of kleiner?', naarGroot ? 'kleiner: delen door 1000' : 'groter: keer 1000', [naarGroot ? 'groter: keer 1000' : 'kleiner: delen door 1000'], naarGroot ? 'Een ' + naarW + ' is groter dan een ' + vanW + '. Je hebt er dus minder van nodig.' : 'Een ' + naarW + ' is kleiner dan een ' + vanW + '. Je hebt er dus meer van nodig.'),
                st('Reken uit:', S(uit), naarGroot ? S(y) + ' : 1000.' : S(y) + ' ' + X + ' 1000.', { eenheid:naarW, fout:F([[naarGroot ? y * 1000 : y / 1000, 'Je ging de verkeerde kant op.']]) }) ] };
          } },
        { id:'macht-wetreken', naam:'Rekenen met de wetenschappelijke notatie', kort:'Keer: getallen keer en machten optellen. Delen: getallen delen en machten aftrekken',
          uit:'<p>Bij <b>keer</b> vermenigvuldig je de getallen en tel je de machten op: (3 × 10⁴) × (2 × 10³) = 6 × 10⁷.</p><p>Bij <b>delen</b> deel je de getallen en trek je de machten af: (8 × 10⁶) : (2 × 10²) = 4 × 10⁴.</p><p>Komt er een getal groter dan 10 uit? Maak het weer kleiner en de macht één hoger: 12 × 10⁵ = 1,2 × 10⁶.</p>',
          wanneer:'je met heel grote of heel kleine getallen moet vermenigvuldigen of delen.',
          maak:function(R){
            var keer = R.heel(0, 1) === 1, a, b, p, q, m, e;
            if (keer){ a = R.heel(2, 9); b = R.heel(2, 9); p = R.heel(2, 9); q = R.heel(0, 3) ? R.heel(2, 8) : -R.heel(2, 5); m = a * b; e = p + q; }
            else { var paar = K([[8, 2], [6, 3], [9, 3], [8, 4], [6, 2], [9, 2], [7, 2], [5, 2], [2, 4], [3, 6], [1, 2], [2, 5], [3, 5], [1, 4], [4, 5]]); a = paar[0]; b = paar[1]; p = R.heel(5, 12); q = R.heel(2, p - 1); m = rnd(a / b); e = p - q; }
            var stappen = [], mN = m, eN = e;
            stappen.push(st(keer ? 'Vermenigvuldig de getallen: ' + a + ' ' + X + ' ' + b + ' =' : 'Deel de getallen: ' + a + ' : ' + b + ' =', S(m), keer ? 'De tafels.' : a + ' : ' + b + '.'));
            stappen.push(st(keer ? 'Tel de machten op: ' + p + ' + ' + (q < 0 ? '(' + S(q) + ')' : q) + ' =' : 'Trek de machten af: ' + p + ' ' + MIN + ' ' + q + ' =', S(e), keer ? 'Bij keer tel je de machten op.' : 'Bij delen trek je de machten af.', { fout:F([[keer ? p * q : (p % q === 0 ? p / q : null), keer ? 'Bij keer tel je de machten op, je vermenigvuldigt ze niet.' : 'Bij delen trek je de machten af.']], e) }));
            if (m >= 10){ mN = rnd(m / 10); eN = e + 1;
              stappen.push(st(S(m) + ' is groter dan 10. Schrijf ' + S(m) + ' ' + X + ' ' + tienMacht(e) + ' als ' + S(mN) + ' ' + X + ' 10 tot de macht', S(eN), S(m) + ' = ' + S(mN) + ' ' + X + ' 10. Dus de macht wordt één hoger.')); }
            else if (m < 1){ mN = rnd(m * 10); eN = e - 1;
              stappen.push(st(S(m) + ' is kleiner dan 1. Schrijf ' + S(m) + ' ' + X + ' ' + tienMacht(e) + ' als ' + S(mN) + ' ' + X + ' 10 tot de macht', S(eN), S(m) + ' = ' + S(mN) + ' ' + X + ' 10' + sup(-1) + '. Dus de macht wordt één lager.')); }
            var ctrl = wetControle(mN, eN);
            stappen.push(st('Het antwoord in de wetenschappelijke notatie:', wet(mN, eN), 'Een getal tussen 1 en 10, keer 10 tot de macht ' + S(eN) + '.', { controle:ctrl }));
            return { vraag:'(' + a + ' ' + X + ' ' + tienMacht(p) + ') ' + (keer ? X : ':') + ' (' + b + ' ' + X + ' ' + tienMacht(q) + ')', context:'Typ je antwoord bijvoorbeeld als 6 x 10^7.', controle:ctrl, antwoord:wet(mN, eN), stappen:stappen };
          } },
        { id:'macht-tekens', naam:'Keer en delen met negatieve getallen', kort:'Eén minteken: het antwoord is negatief. Twee mintekens: positief',
          uit:'<p>Bij keer en delen met negatieve getallen tel je de <b>mintekens</b>.</p><p><b>Eén minteken</b>: het antwoord is negatief. −6 × 4 = −24.<br><b>Twee mintekens</b>: het antwoord is positief. −6 × −4 = 24.</p><p>Reken eerst zonder tekens uit, en zet daarna het goede teken ervoor.</p>',
          wanneer:'je vermenigvuldigt of deelt met getallen onder nul.',
          maak:function(R){
            var keer = R.heel(0, 1) === 1, x = R.heel(2, 12), y = R.heel(2, 12), vorm = R.heel(0, 2), a, b, uitk;
            if (keer){ a = x; b = y; uitk = x * y; } else { a = x * y; b = y; uitk = x; }
            var sa = vorm === 1 ? 1 : -1, sb = vorm === 0 ? 1 : -1, mins = (sa < 0 ? 1 : 0) + (sb < 0 ? 1 : 0), res = (mins === 1 ? -1 : 1) * uitk;
            return { vraag:S(sa * a) + ' ' + (keer ? X : ':') + ' ' + S(sb * b),
              stappen:[
                st('Hoeveel mintekens staan er in de som?', mins, 'Tel de mintekens voor de getallen.'),
                kz('Is het antwoord positief of negatief?', mins === 1 ? 'negatief' : 'positief', [mins === 1 ? 'positief' : 'negatief'], 'Eén minteken: negatief. Twee mintekens: positief.'),
                st('Reken uit zonder tekens: ' + a + ' ' + (keer ? X : ':') + ' ' + b + ' =', uitk, keer ? 'De tafel van ' + b + '.' : 'Hoe vaak past ' + b + ' in ' + a + '?'),
                st('Het antwoord, met het goede teken:', S(res), mins === 1 ? 'Zet er een min voor.' : 'Twee mintekens: het antwoord is positief.', { fout:F([[-res, mins === 1 ? 'Eén minteken: het antwoord is negatief.' : 'Twee mintekens heffen elkaar op: positief.']]) }) ] };
          } },
        { id:'macht-decimalen', naam:'Afronden op decimalen', kort:'Kijk naar het eerste cijfer dat wegvalt: 5 of meer, dan gaat het laatste cijfer omhoog',
          uit:'<p>Rond je af op <b>2 decimalen</b>, dan houd je 2 cijfers achter de komma.</p><p>Kijk naar het eerste cijfer dat <b>wegvalt</b>. Is dat 5 of meer? Dan gaat het laatste cijfer dat je houdt één omhoog. Anders blijft het zoals het is.</p><p>Voorbeeld: 3,14159 op 3 decimalen. Je houdt 3,141 en de 5 valt weg. Dus <b>3,142</b>.</p>',
          wanneer:'een rekenmachine meer cijfers geeft dan zinvol is.',
          maak:function(R){
            var d = R.heel(1, 3), m;
            do { m = R.heel(100001, 9999999); } while (m % 10 === 0);
            var k = 5, x = m / 1e5, q = Math.floor(m / Math.pow(10, k - d)), laatst = q % 10, c = dR(m, k - d - 1), op = c >= 5, ant = rnd((op ? q + 1 : q) / Math.pow(10, d));
            return { vraag:T(x, { dec:5 }), context:'Rond af op <b>' + d + (d === 1 ? ' decimaal' : ' decimalen') + '</b>.',
              stappen:[
                st('Wat is het ' + ['eerste', 'tweede', 'derde'][d - 1] + ' cijfer achter de komma? Dat is het laatste dat je houdt.', laatst, 'Tel ' + d + (d === 1 ? ' cijfer' : ' cijfers') + ' na de komma.'),
                st('Welk cijfer komt daarna? Dat valt als eerste weg.', c, 'Het cijfer op plaats ' + (d + 1) + ' achter de komma.'),
                kz('Dat is een ' + c + '. Gaat de ' + laatst + ' omhoog?', op ? 'ja, één omhoog' : 'nee, die blijft', [op ? 'nee, die blijft' : 'ja, één omhoog'], 'Bij 5, 6, 7, 8 of 9 gaat het omhoog.'),
                st('Het afgeronde getal:', T(ant, { dec:d, vast:true }), op ? 'De ' + laatst + ' wordt ' + (laatst + 1) + (laatst === 9 ? ': dan schuift er een 1 door naar links.' : '.') : 'Laat alles na de ' + d + 'e decimaal weg.', { fout:F([[op ? rnd(q / Math.pow(10, d)) : rnd((q + 1) / Math.pow(10, d)), 'Kijk nog eens naar de ' + c + ' die wegvalt.']], ant) }) ] };
          } },
        { id:'macht-zinvol', naam:'Zinvol afronden', kort:'Kijk naar de situatie: hoe nauwkeurig kun je het echt meten of betalen?',
          uit:'<p>Een rekenmachine geeft vaak veel cijfers: 16,666666... Maar zoveel cijfers zijn meestal <b>niet zinvol</b>.</p><p>Kijk naar de <b>situatie</b>. Geld betaal je in centen: 2 decimalen. Een temperatuur in het weerbericht heeft 1 decimaal. Een plank meet je met een meetlint in hele centimeters.</p><p>Rond daarna gewoon af zoals je gewend bent.</p>',
          wanneer:'je een antwoord van de rekenmachine opschrijft in een echte situatie.',
          maak:function(R){
            var C = R.heel(0, 3), tekst, x, d, eenh;
            do {
            if (C === 0){ var bedrag = K([50, 100, 40, 25, 70, 80]), p = K([3, 6, 7, 9]); x = bedrag / p; d = 2; eenh = 'euro'; tekst = 'Je deelt € ' + bedrag + ' eerlijk met ' + p + ' mensen. De rekenmachine geeft ' + T(x, { dec:6 }) + '. Hoeveel euro krijgt ieder?'; }
            else if (C === 1){ var tt = [R.heel(80, 220), R.heel(80, 220), R.heel(80, 220), R.heel(80, 220), R.heel(80, 220), R.heel(80, 220), R.heel(80, 220)], som = tt.reduce(function(a, b){ return a + b; }, 0); x = som / 70; d = 1; eenh = '°C'; tekst = 'De temperatuur was een week lang gemiddeld ' + T(x, { dec:6 }) + ' °C, zegt de rekenmachine. Wat zeg je in het weerbericht?'; }
            else if (C === 2){ var L = R.heel(150, 400), st2 = K([3, 6, 7]); x = L / st2; d = 0; eenh = 'cm'; tekst = 'Je zaagt een plank van ' + L + ' cm in ' + st2 + ' gelijke stukken. De rekenmachine geeft ' + T(x, { dec:6 }) + '. Je meet met een meetlint in hele centimeters. Hoe lang is elk stuk?'; }
            else { var gr = K([250, 400, 350, 500]), van = K([3, 6]), voor = K([2, 4, 5]); x = gr / van * voor; d = 0; eenh = 'gram'; tekst = 'Een recept voor ' + van + ' personen gebruikt ' + gr + ' gram meel. Jij kookt voor ' + voor + ' personen. De rekenmachine geeft ' + T(x, { dec:6 }) + '. Je weegschaal weegt in hele grammen. Hoeveel meel?'; }
            } while (Math.abs(x * Math.pow(10, d + 1) - Math.round(x * Math.pow(10, d + 1))) < 1e-6);
            var O = ['op hele getallen', 'op 1 decimaal', 'op 2 decimalen'], q = Math.round(x * Math.pow(10, d)) / Math.pow(10, d), c = Math.floor(x * Math.pow(10, d + 1) + 1e-9) % 10;
            var xt = T(x, { dec:6 }), antT = T(q, { dec:d, vast:true });
            return { vraag:xt + ' → ' + eenh, context:tekst, eenheid:eenh,
              stappen:[
                kzVast('Hoe nauwkeurig is zinvol?', O, O[d], ['Je meetlint meet in hele centimeters.', 'Een temperatuur in het weerbericht heeft 1 decimaal.', 'Geld betaal je in centen: 2 cijfers achter de komma.', 'Je weegschaal weegt in hele grammen.'][C === 3 ? 3 : d]),
                st('Welk cijfer valt als eerste weg?', c, 'Het cijfer op plaats ' + (d + 1) + ' achter de komma in ' + xt + '.'),
                st('Het afgeronde antwoord:', antT, c >= 5 ? 'Het is ' + c + ': het laatste cijfer gaat één omhoog.' : 'Het is ' + c + ': laat de rest weg.', { eenheid:eenh, fout:F([[rnd(x, 6), 'Zoveel cijfers zijn niet zinvol. Rond af.']]) }) ] };
          } }
      ] }
  ]);
})();
