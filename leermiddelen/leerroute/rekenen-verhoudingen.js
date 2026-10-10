/* De leerroute rekenen, verhoudingen: breuken, kommagetallen en procenten, de verhoudingstabel,
   procenten berekenen, verhoudingen vergelijken, schaal en procentuele verandering.
   Elke manier is een eigen doel. Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var T = LEERROUTE.R, MIN = '−', X = '×', GS = ' ', G = [];

  /* ---------- rekenhulpjes ---------- */
  function ggd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ var t = a % b; a = b; b = t; } return a; }
  function kgv(a, b){ return a / ggd(a, b) * b; }
  function tn(x){ return T.toon(x); }
  function ec(c){ return T.geld(Math.round(c) / 100); }            /* een bedrag in centen als '€ 12,50' */
  function pc(p){ var t = tn(p); return [t, t + '%', t + ' %']; }   /* een percentage, met en zonder % */
  function met(x, u){ var t = sp(x); return [t, t + ' ' + u, t + u]; }
  function sp(x){ return tn(x).replace(/\./g, ' '); }               /* grote getallen met een spatie: 50 000 */
  function spv(x){ return [sp(x), String(x)]; }
  function br(t, n){ return t + '/' + n; }
  function vb(t, n){ var g = ggd(t, n); return [t / g, n / g]; }
  function gem(t, n){ var s = vb(t, n); t = s[0]; n = s[1]; if (n === 1) return String(t); var h = Math.floor(t / n), r = t - h * n; return h ? h + GS + r + '/' + n : r + '/' + n; }
  function eindig(n){ while (n % 2 === 0) n /= 2; while (n % 5 === 0) n /= 5; return n === 1; }
  /* alle goede schrijfwijzen van t/n: eenvoudigste eerst (of het gemengde getal eerst) */
  function bvar(t, n, gemEerst){
    var s = vb(t, n), l = [], een = s[1] === 1 ? String(s[0]) : br(s[0], s[1]), g = gem(t, n);
    if (gemEerst){ l.push(g); if (l.indexOf(een) < 0) l.push(een); } else { l.push(een); if (l.indexOf(g) < 0) l.push(g); }
    if (l.indexOf(br(t, n)) < 0) l.push(br(t, n));
    if (eindig(s[1])){ var d = tn(t / n); if (l.indexOf(d) < 0) l.push(d); }
    return l;
  }
  /* fout-uitleg: F(sleutel, tekst, sleutel, tekst, ...) */
  function F(){ var o = {}; for (var i = 0; i + 1 < arguments.length; i += 2) if (arguments[i] != null) o[String(arguments[i]).toLowerCase()] = arguments[i + 1]; return o; }
  function FG(c, tekst, o){ o = o || {}; [tn(c / 100), T.toon(c / 100, { dec:2, vast:true }), ec(c).toLowerCase()].forEach(function(k){ o[k] = tekst; }); return o; }
  /* een keuzestap; de opties worden gehusseld */
  function kz(tekst, opties, goed, hint, extra){ var o = T.hussel(opties), s = { tekst:tekst, opties:o, goed:o.indexOf(goed), hint:hint }; if (extra) for (var k in extra) s[k] = extra[k]; return s; }
  function eindKeuze(op){ var s = op.stappen[op.stappen.length - 1]; op.opties = s.opties; op.goed = s.goed; return op; }

  /* ---------- plaatjes ---------- */
  /* verhoudingstabel die meegroeit: cols [{ b, o, toon:stap, vul:stap, vulB:stap, pijl }] */
  function vtab(kop, cols, n){
    var zicht = cols.filter(function(c){ return (c.toon || 0) <= n; }), r1 = [kop[0]], r2 = [kop[1]], pijlen = [], nad = [];
    zicht.forEach(function(c, i){
      r1.push(c.vulB != null && n < c.vulB ? '?' : String(c.b));
      r2.push(c.vul != null && n < c.vul ? '?' : String(c.o));
      if (c.pijl && i > 0 && n >= Math.max(c.vul || 0, c.vulB || 0)){ pijlen.push({ van:i, naar:i + 1, tekst:c.pijl }); pijlen.push({ van:i, naar:i + 1, tekst:c.pijl, onder:true }); }
      if (c.eind && n >= Math.max(c.vul || 0, c.vulB || 0)) nad.push([c.vulB != null ? 0 : 1, i + 1]);
    });
    return T.teken.tabel([r1, r2], { zijkop:true, verhouding:true, pijlen:pijlen, nadruk:nad });
  }
  function stapel(){ return '<div style="width:100%;max-width:640px">' + Array.prototype.slice.call(arguments).join('') + '</div>'; }
  /* een procentenstrook: delen, vol, boven (procenten) en onder (bedragen) */
  function pstrook(delen, vol, onder){
    var boven = []; for (var i = 0; i <= delen; i++) boven.push(delen > 10 && i % 2 ? '' : tn(i * 100 / delen) + '%');
    return T.teken.strook(delen, vol, { boven:boven, onder:onder, aria:'procentenstrook' });
  }
  /* een getallenlijn in breuken: n stukjes per heel, hele, stip, sprongen [{van,naar,tekst}] in stukjes */
  function blijn(o){
    var n = o.n, tot = n * o.hele, L = 30, Rr = 570, Y = 112;
    function x(k){ return Math.round((L + k / tot * (Rr - L)) * 10) / 10; }
    var s = '<svg class="lr-svg" viewBox="0 0 600 ' + (o.klamp ? 182 : 152) + '" role="img" aria-label="getallenlijn met breuken">';
    if (o.klamp){ var k1 = x(o.klamp.van), k2 = x(o.klamp.naar), ky = Y + 46;
      s += '<path d="M' + k1 + ' ' + (ky - 7) + ' V' + ky + ' H' + k2 + ' V' + (ky - 7) + '" class="boog" style="stroke:var(--lr-1)"/>';
      s += '<text x="' + ((k1 + k2) / 2) + '" y="' + (ky + 20) + '" class="sprong" style="fill:var(--lr-1)">' + T.schoon(o.klamp.tekst) + '</text>'; }
    s += '<line x1="' + (L - 10) + '" y1="' + Y + '" x2="' + (Rr + 10) + '" y2="' + Y + '" class="as"/>';
    for (var k = 0; k <= tot; k++){
      var heel = k % n === 0;
      s += '<line x1="' + x(k) + '" y1="' + (Y - (heel ? 11 : 6)) + '" x2="' + x(k) + '" y2="' + (Y + (heel ? 11 : 6)) + '" class="as"/>';
      if (heel) s += '<text x="' + x(k) + '" y="' + (Y + 32) + '" class="getal">' + (k / n) + '</text>';
    }
    (o.sprongen || []).forEach(function(j, i){
      var x1 = x(j.van), x2 = x(j.naar), mid = (x1 + x2) / 2, h = Math.max(12, Math.min(52, Math.abs(x2 - x1) * .45)), kl = 'var(--lr-' + (1 + (j.kleur != null ? j.kleur : i) % 5) + ')';
      s += '<path d="M' + x1 + ' ' + (Y - 4) + ' Q' + mid + ' ' + (Y - 4 - h * 1.6) + ' ' + x2 + ' ' + (Y - 4) + '" class="boog" style="stroke:' + kl + '"/>';
      if (j.tekst) s += '<text x="' + mid + '" y="' + (Y - 10 - h * .8) + '" class="sprong" style="fill:' + kl + '">' + T.schoon(j.tekst) + '</text>';
    });
    if (o.stip != null){ s += '<circle cx="' + x(o.stip) + '" cy="' + Y + '" r="7" class="stip"/>'; if (o.stipTekst) s += '<text x="' + x(o.stip) + '" y="' + (Y + 32) + '" class="getal" style="fill:var(--lr-2)">' + T.schoon(o.stipTekst) + '</text>'; }
    return s + '</svg>';
  }
  /* deel van een deel: b kolommen waarvan a gekleurd; d rijen waarvan c ook gekleurd */
  function deelVanDeel(b, a, d, c, n){
    var W = 300, H = 180, x0 = 10, y0 = 10, w = (W - 20) / b, rij = n >= 1 ? d : 1, h = (H - 20) / rij, s = '<svg class="lr-svg" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:340px" role="img" aria-label="rechthoek: deel van een deel">';
    for (var i = 0; i < b; i++) for (var j = 0; j < rij; j++){
      var dubbel = n >= 2 && i < a && j < c;
      s += '<rect x="' + (x0 + i * w) + '" y="' + (y0 + j * h) + '" width="' + w + '" height="' + h + '" class="deel' + (i < a && !dubbel ? ' vol' : '') + '"' + (dubbel ? ' style="fill:var(--lr-2);opacity:.85"' : '') + '/>';
    }
    return s + '<rect x="' + x0 + '" y="' + y0 + '" width="' + (W - 20) + '" height="' + (H - 20) + '" class="rand"/></svg>';
  }
  /* een schaallijn: stukken van s cm die elk v voorstellen; en een gemeten afstand van d cm */
  function schaalstok(s, v, eenh, d, toonD){
    var m = Math.max(4, Math.ceil(d / s)), px = 540 / (m * s), x0 = 30, y = 40, out = '<svg class="lr-svg" viewBox="0 0 600 ' + (toonD ? 150 : 90) + '" role="img" aria-label="schaallijn">';
    for (var i = 0; i < m; i++) out += '<rect x="' + (x0 + i * s * px) + '" y="' + y + '" width="' + (s * px) + '" height="12" class="deel' + (i % 2 ? '' : ' vol') + '"/>';
    for (i = 0; i <= m; i++) out += '<text x="' + (x0 + i * s * px) + '" y="' + (y - 10) + '" class="getal klein">' + T.schoon(tn(i * v) + (i === m ? ' ' + eenh : '')) + '</text>';
    out += '<text x="' + (x0 + s * px / 2) + '" y="' + (y + 32) + '" class="getal klein">' + T.schoon(tn(s) + ' cm') + '</text>';
    if (toonD){
      var yd = 112, x2 = x0 + d * px;
      out += '<line x1="' + x0 + '" y1="' + yd + '" x2="' + x2 + '" y2="' + yd + '" class="boog" style="stroke:var(--lr-2)"/>';
      out += '<line x1="' + x0 + '" y1="' + (yd - 8) + '" x2="' + x0 + '" y2="' + (yd + 8) + '" class="boog" style="stroke:var(--lr-2)"/><line x1="' + x2 + '" y1="' + (yd - 8) + '" x2="' + x2 + '" y2="' + (yd + 8) + '" class="boog" style="stroke:var(--lr-2)"/>';
      out += '<text x="' + ((x0 + x2) / 2) + '" y="' + (yd + 26) + '" class="getal" style="fill:var(--lr-2)">' + T.schoon(tn(d) + ' cm op de kaart') + '</text>';
    }
    return out + '</svg>';
  }
  /* vergroten met factor k: een klein vierkant en het grote vierkant vol kleine vierkantjes */
  function vergroot(k, toonRooster, ruimte){
    var u = 26, s = '<svg class="lr-svg" viewBox="0 0 ' + (u * k + u + 60) + ' ' + (u * k + 40) + '" style="max-width:' + Math.min(420, (u * k + u + 60) * 1.6) + 'px" role="img" aria-label="vergroten met factor ' + k + '">';
    s += '<rect x="4" y="' + (u * k - u + 4) + '" width="' + u + '" height="' + u + '" class="deel vol"/>';
    var x0 = u + 34;
    for (var i = 0; i < k; i++) for (var j = 0; j < k; j++) s += '<rect x="' + (x0 + i * u) + '" y="' + (4 + j * u) + '" width="' + u + '" height="' + u + '" class="deel' + (toonRooster || (i === 0 && j === k - 1) ? ' vol' : '') + '"' + (toonRooster ? '' : ' style="opacity:.9"') + '/>';
    s += '<rect x="' + x0 + '" y="4" width="' + (u * k) + '" height="' + (u * k) + '" class="rand"/>';
    s += '<text x="' + (x0 + u * k / 2) + '" y="' + (u * k + 26) + '" class="getal klein">' + T.schoon(X + k + (ruimte ? ' in elke richting' : ' in lengte en breedte')) + '</text>';
    return s + '</svg>';
  }

  /* ---------- 1. Breuken begrijpen (fundament) ---------- */
  var HOEVEEL = [
    ['Van de {H} leerlingen fietst {b} naar school.', 'leerlingen'], ['Een zak bevat {H} snoepjes. Jij krijgt {b} ervan.', 'snoepjes'],
    ['Een rit duurt {H} minuten. Je hebt al {b} gehad.', 'minuten'], ['Je hebt {H} euro. Je geeft {b} uit.', 'euro'],
    ['Een wandeling is {H} km. Je hebt {b} gelopen.', 'km'], ['In de klas zitten {H} stoelen. {b} is bezet.', 'stoelen'] ];
  function hoeveelZin(R, t, n, H){ var z = R.kies(HOEVEEL); return { zin:z[0].replace('{H}', H).replace('{b}', br(t, n)), eenh:z[1] }; }
  function breukStrooks(a, b, c, d){ return stapel(T.teken.strook(b, a, { boven:[br(a, b)], aria:'strook ' + a + ' van ' + b }), T.teken.strook(d, c, { boven:[br(c, d)], aria:'strook ' + c + ' van ' + d })); }
  /* drie soorten vergelijk-paren */
  function paarNoemer(R){ var n = R.heel(3, 12), a = R.heel(1, n - 1), b; do { b = R.heel(1, n - 1); } while (b === a); return { a:a, b:n, c:b, d:n }; }
  function paarTeller(R){ var t = R.heel(1, 3), b = R.heel(t + 1, 12), d; do { d = R.heel(t + 1, 12); } while (d === b); return { a:t, b:b, c:t, d:d }; }
  function paarHalf(R){
    for (;;){ var b = R.heel(3, 12), d = R.heel(3, 12), a = R.heel(1, Math.ceil(b / 2) - 1), c = R.heel(Math.floor(d / 2) + 1, d - 1);
      if (b !== d && a !== c && a >= 1 && c < d) return R.heel(0, 1) ? { a:a, b:b, c:c, d:d } : { a:c, b:d, c:a, d:b }; }
  }
  function groterVan(p){ return p.a * p.d > p.c * p.b ? br(p.a, p.b) : br(p.c, p.d); }
  function halfZin(t, n){ return t * 2 < n ? 'minder dan een half' : 'meer dan een half'; }

  G.push({ groep:{ id:'breuk-begrip', niveau:'basis', domein:'verhoudingen', naam:'Breuken begrijpen',
      uit:'Wat een breuk is, waar hij op de getallenlijn ligt, welke breuken even groot zijn en hoe je breuken vergelijkt. En hoe je een breuk van een hoeveelheid uitrekent.' },
    doelen:[
      { id:'breuk-deel', naam:'Een deel van een geheel', kort:'De noemer zegt in hoeveel gelijke stukken het geheel is verdeeld, de teller hoeveel stukken je neemt',
        uit:'<p>Een <b>breuk</b> is een deel van een geheel. Het geheel is verdeeld in <b>gelijke</b> stukken.</p><p>Het getal onder de streep is de <b>noemer</b>: in hoeveel stukken het geheel is verdeeld. Het getal boven de streep is de <b>teller</b>: hoeveel stukken je neemt.</p><p>Een strook in 8 stukken met 3 stukken gekleurd: dat is 3/8.</p>',
        wanneer:'je wilt zeggen welk deel van iets je hebt.',
        maak:function(R){
          var n = R.kies([2, 3, 4, 5, 6, 8, 10, 12]), t = R.heel(1, n - 1), b = R.teken.strook(n, t);
          return { vraag:'Welk deel? ' + br(t, n), vraagHtml:'Welk deel is gekleurd?', beeld:b, zelfBeeld:b,
            stappen:[
              { tekst:'In hoeveel gelijke stukken is de strook verdeeld? Dat is de noemer.', antwoord:String(n), hint:'Tel alle stukken, de gekleurde en de witte.', fout:F(n - t, 'Dat zijn alleen de witte stukken. Tel ze allemaal.') },
              { tekst:'Hoeveel stukken zijn gekleurd? Dat is de teller.', antwoord:String(t), hint:'Tel alleen de gekleurde stukken.' },
              { tekst:'Welk deel is gekleurd?', antwoord:[br(t, n)].concat(bvar(t, n)), hint:'De teller komt boven de streep, de noemer eronder: ' + t + '/' + n + '.', fout:F(br(n, t), 'Je hebt teller en noemer omgedraaid.') } ] };
        } },
      { id:'breuk-lijn', naam:'Breuken op de getallenlijn', kort:'Verdeel elk stuk van 0 tot 1 in gelijke stukjes en tel de stukjes vanaf 0',
        uit:'<p>Een breuk is ook een <b>getal</b> en heeft een plek op de getallenlijn.</p><p>Kijk eerst in hoeveel gelijke stukjes het stuk van 0 tot 1 is verdeeld. Dat is de <b>noemer</b>. Tel dan hoeveel stukjes je vanaf 0 naar rechts gaat. Dat is de <b>teller</b>.</p><p>Voorbij de 1 tel je gewoon door: 5 vierden is 5/4, dat is 1&ensp;1/4.</p>',
        wanneer:'je breuken wilt ordenen of wilt zien hoe groot een breuk is.',
        maak:function(R){
          var n = R.kies([2, 3, 4, 5, 6, 8, 10]), hele = R.kies([1, 2, 2]), t; do { t = R.heel(1, n * hele - 1); } while (t % n === 0);
          return { vraag:'Stip op ' + br(t, n) + ' (' + hele + ')', vraagHtml:'Welke breuk hoort bij de stip?', zelfBeeld:blijn({ n:n, hele:hele, stip:t }),
            beeld:function(k){ return blijn({ n:n, hele:hele, stip:t, klamp:k >= 1 ? { van:0, naar:n, tekst:'van 0 tot 1: ' + n + ' stukjes' } : null, sprongen:k >= 2 ? [{ van:0, naar:t, tekst:t + ' stukjes', kleur:1 }] : [], stipTekst:k >= 3 ? br(t, n) : '' }); },
            stappen:[
              { tekst:'In hoeveel gelijke stukjes is het stuk van 0 tot 1 verdeeld?', antwoord:String(n), hint:'Tel de stukjes tussen 0 en 1, niet de streepjes.', fout:F(n + 1, 'Je telde de streepjes. Tel de stukjes ertussen.') },
              { tekst:'Hoeveel stukjes ligt de stip rechts van 0?', antwoord:String(t), hint:'Begin bij 0 en tel elk stukje tot je bij de stip bent.' },
              { tekst:'Welke breuk hoort bij de stip?', antwoord:[br(t, n)].concat(bvar(t, n, true)), hint:'Teller: het aantal stukjes vanaf 0, dus ' + t + '. Noemer: ' + n + '.' } ] };
        } },
      { id:'breuk-gelijk', naam:'Gelijkwaardige breuken', kort:'Doe teller en noemer keer of gedeeld door hetzelfde getal, dan blijft de breuk even groot',
        uit:'<p>2/4 en 1/2 zijn <b>even groot</b>. Kijk maar naar twee stroken: 2 van de 4 stukken is evenveel als 1 van de 2.</p><p>Doe je de teller en de noemer <b>keer hetzelfde getal</b>, dan krijg je een gelijkwaardige breuk. Delen door hetzelfde getal mag ook.</p><p>2/3 = …/12: van 3 naar 12 is keer 4, dus 2 keer 4 = 8. Dan 2/3 = 8/12.</p>',
        wanneer:'je breuken met verschillende noemers wilt vergelijken of optellen.',
        maak:function(R){
          var b = R.heel(2, 6), a = R.heel(1, b - 1), k = R.heel(2, 5), groot = R.heel(0, 1);
          if (groot) return { vraag:br(a, b) + ' = …/' + (b * k),
            beeld:function(n){ return breukStrooks(a, b, n >= 2 ? a * k : 0, b * k); },
            stappen:[
              { tekst:'Van noemer ' + b + ' naar noemer ' + (b * k) + ': keer welk getal?', antwoord:String(k), hint:b + ' ' + X + ' … = ' + (b * k) + '. Denk aan de tafel van ' + b + '.' },
              { tekst:'Doe de teller ook keer ' + k + ': ' + a + ' ' + X + ' ' + k + ' =', antwoord:String(a * k), hint:'Wat je met de noemer doet, doe je ook met de teller.', fout:F(a, 'De teller moet ook keer ' + k + '.') } ] };
          return { vraag:br(a * k, b * k) + ' = …/' + b,
            beeld:function(n){ return breukStrooks(a * k, b * k, n >= 2 ? a : 0, b); },
            stappen:[
              { tekst:'Van noemer ' + (b * k) + ' naar noemer ' + b + ': gedeeld door welk getal?', antwoord:String(k), hint:(b * k) + ' : … = ' + b + '.' },
              { tekst:'Deel de teller ook door ' + k + ': ' + (a * k) + ' : ' + k + ' =', antwoord:String(a), hint:'Wat je met de noemer doet, doe je ook met de teller.', fout:F(a * k, 'De teller moet ook gedeeld door ' + k + '.') } ] };
        } },
      { id:'breuk-van-strook', naam:'Breuk van een hoeveelheid: met een strook', kort:'Zet de hoeveelheid onder de strook, reken uit wat één stuk is en tel de stukken die je nodig hebt',
        uit:'<p>3/4 van 20: teken een <b>strook</b> in 4 gelijke stukken. Onder het einde van de strook zet je 20.</p><p>Eén stuk is dan 20 : 4 = 5. Zet onder elk streepje wat daar hoort: 5, 10, 15, 20.</p><p>3/4 is drie stukken. Onder het derde streepje staat 15. Dus 3/4 van 20 is <b>15</b>.</p>',
        wanneer:'je wilt zien wat je uitrekent, of als je twijfelt waar je door moet delen.',
        maak:function(R){
          var n = R.kies([2, 3, 4, 5, 6, 8, 10]), t; do { t = R.heel(1, n - 1); } while (ggd(t, n) > 1); var u = R.heel(2, 12), H = n * u, z = hoeveelZin(R, t, n, H);
          return { context:z.zin, vraag:br(t, n) + ' van ' + H,
            beeld:function(k){ var onder = []; for (var i = 0; i <= n; i++) onder.push(i === 0 ? '0' : i === n ? String(H) : k >= 2 ? String(i * u) : ''); return R.teken.strook(n, k >= 3 ? t : 0, { onder:onder }); },
            stappen:[
              { tekst:'In hoeveel gelijke stukken verdeel je de strook?', antwoord:String(n), hint:'Kijk naar de noemer van ' + br(t, n) + '.', fout:F(t, 'Dat is de teller. De noemer zegt in hoeveel stukken.') },
              { tekst:'Onder het einde staat ' + H + '. Hoeveel is één stuk? ' + H + ' : ' + n + ' =', antwoord:String(u), hint:'Verdeel ' + H + ' eerlijk over ' + n + ' stukken.' },
              { tekst:'Kleur ' + t + (t === 1 ? ' stuk' : ' stukken') + '. Wat staat onder het laatste gekleurde stuk? ' + t + ' ' + X + ' ' + u + ' =', antwoord:String(t * u), hint:'Tel ' + t + ' keer ' + u + '.' } ] };
        } },
      { id:'breuk-van-reken', naam:'Breuk van een hoeveelheid: delen en dan keer', kort:'Deel eerst door de noemer, doe dan keer de teller',
        uit:'<p>3/4 van 20 reken je in twee stappen.</p><p><b>Eerst delen door de noemer</b>: 1/4 van 20 is 20 : 4 = 5.</p><p><b>Dan keer de teller</b>: 3/4 is 3 keer zoveel, dus 3 ' + X + ' 5 = 15.</p>',
        wanneer:'je snel een deel van een getal wilt uitrekenen, ook bij grotere getallen.',
        maak:function(R){
          var n = R.kies([3, 4, 5, 6, 8, 10]), t; do { t = R.heel(2, n - 1); } while (ggd(t, n) > 1); var u = R.heel(3, 25), H = n * u, z = hoeveelZin(R, t, n, H);
          return { context:z.zin, vraag:br(t, n) + ' van ' + H,
            beeld:function(k){ var onder = []; for (var i = 0; i <= n; i++) onder.push(i === 0 ? '0' : i === n ? String(H) : i === 1 && k >= 1 ? String(u) : i === t && k >= 2 ? String(t * u) : ''); return R.teken.strook(n, k >= 2 ? t : k >= 1 ? 1 : 0, { onder:onder }); },
            stappen:[
              { tekst:'Eerst 1/' + n + ' van ' + H + ': ' + H + ' : ' + n + ' =', antwoord:String(u), hint:'Delen door de noemer, dus door ' + n + '.', fout:F(H % t === 0 ? H / t : null, 'Je deelde door de teller. Deel door de noemer.') },
              { tekst:'Dan ' + br(t, n) + ': ' + t + ' ' + X + ' ' + u + ' =', antwoord:String(t * u), hint:br(t, n) + ' is ' + t + ' keer zoveel als 1/' + n + '.' } ] };
        } },
      { id:'breuk-verg-noemer', naam:'Vergelijken: zelfde noemer', kort:'Zijn de noemers gelijk, dan is de breuk met de grootste teller het grootst',
        uit:'<p>3/8 of 5/8? De noemers zijn <b>gelijk</b>. De stukken zijn dus even groot.</p><p>Dan kijk je alleen naar de <b>tellers</b>: wie de meeste stukken heeft, heeft het meest. 5/8 is groter.</p>',
        wanneer:'de twee breuken dezelfde noemer hebben.',
        maak:function(R){
          var p = paarNoemer(R), g = groterVan(p);
          return eindKeuze({ context:'Welke breuk is groter?', vraag:br(p.a, p.b) + ' of ' + br(p.c, p.d),
            beeld:function(k){ return k >= 1 ? breukStrooks(p.a, p.b, p.c, p.d) : ''; },
            stappen:[
              { tekst:'De noemers zijn allebei ' + p.b + '. De stukken zijn dus even groot.', info:true },
              kz('Welke teller is groter?', [String(p.a), String(p.c)], String(Math.max(p.a, p.c)), 'Vergelijk ' + p.a + ' en ' + p.c + '.'),
              kz('Welke breuk is groter?', [br(p.a, p.b), br(p.c, p.d), 'ze zijn even groot'], g, 'De breuk met de grootste teller heeft de meeste stukken.') ] });
        } },
      { id:'breuk-verg-teller', naam:'Vergelijken: zelfde teller', kort:'Zijn de tellers gelijk, dan is de breuk met de kleinste noemer het grootst',
        uit:'<p>3/5 of 3/8? De tellers zijn <b>gelijk</b>: je krijgt allebei 3 stukken.</p><p>Maar een strook in 5 stukken heeft <b>grotere stukken</b> dan een strook in 8 stukken. Hoe kleiner de noemer, hoe groter elk stuk.</p><p>Dus 3/5 is groter dan 3/8.</p>',
        wanneer:'de twee breuken dezelfde teller hebben.',
        maak:function(R){
          var p = paarTeller(R), g = groterVan(p);
          return eindKeuze({ context:'Welke breuk is groter?', vraag:br(p.a, p.b) + ' of ' + br(p.c, p.d),
            beeld:function(k){ return k >= 2 ? breukStrooks(p.a, p.b, p.c, p.d) : ''; },
            stappen:[
              { tekst:'De tellers zijn allebei ' + p.a + '. Je krijgt dus evenveel stukken.', info:true },
              kz('Bij welke noemer zijn de stukken het grootst?', [String(p.b), String(p.d)], String(Math.min(p.b, p.d)), 'Een taart in ' + Math.min(p.b, p.d) + ' stukken of in ' + Math.max(p.b, p.d) + ' stukken: waar zijn de stukken groter?', { fout:F(Math.max(p.b, p.d), 'Meer stukken betekent juist kleinere stukken.') }),
              kz('Welke breuk is groter?', [br(p.a, p.b), br(p.c, p.d), 'ze zijn even groot'], g, 'Evenveel stukken, maar bij de kleinste noemer zijn ze het grootst.') ] });
        } },
      { id:'breuk-verg-half', naam:'Vergelijken: via een half', kort:'Kijk of elke breuk meer of minder is dan een half',
        uit:'<p>3/8 of 4/7? Geen gelijke tellers, geen gelijke noemers. Vergelijk ze dan allebei met <b>een half</b>.</p><p>De helft van 8 is 4. 3 is minder dan 4, dus 3/8 is <b>minder dan een half</b>. De helft van 7 is 3,5. 4 is meer, dus 4/7 is <b>meer dan een half</b>.</p><p>Dus 4/7 is groter.</p>',
        wanneer:'de ene breuk onder een half zit en de andere erboven.',
        maak:function(R){
          var p = paarHalf(R), g = groterVan(p);
          return eindKeuze({ context:'Welke breuk is groter?', vraag:br(p.a, p.b) + ' of ' + br(p.c, p.d),
            beeld:function(k){ return k >= 2 ? breukStrooks(p.a, p.b, p.c, p.d) : ''; },
            stappen:[
              kz('Is ' + br(p.a, p.b) + ' meer of minder dan een half?', ['meer dan een half', 'minder dan een half'], halfZin(p.a, p.b), 'De helft van ' + p.b + ' is ' + tn(p.b / 2) + '. Is ' + p.a + ' meer of minder?'),
              kz('Is ' + br(p.c, p.d) + ' meer of minder dan een half?', ['meer dan een half', 'minder dan een half'], halfZin(p.c, p.d), 'De helft van ' + p.d + ' is ' + tn(p.d / 2) + '. Is ' + p.c + ' meer of minder?'),
              kz('Welke breuk is groter?', [br(p.a, p.b), br(p.c, p.d), 'ze zijn even groot'], g, 'De breuk die meer dan een half is, is de grootste.') ] });
        } },
      { id:'breuk-verg-kies', naam:'Breuken vergelijken: kies de handigste manier', kort:'Kijk eerst: zelfde noemer, zelfde teller of rond een half?',
        uit:'<p>Bij twee breuken kijk je eerst wat ze <b>gemeen</b> hebben.</p><p>Zelfde <b>noemer</b>: vergelijk de tellers. Zelfde <b>teller</b>: de kleinste noemer wint. Niets gelijk, maar de een is minder en de ander meer dan een half: vergelijk ze met <b>een half</b>.</p>',
        wanneer:'je twee breuken moet vergelijken en wilt weten welke aanpak het snelst gaat.',
        maak:function(R){
          var soort = R.heel(0, 2), p = [paarNoemer, paarTeller, paarHalf][soort](R), g = groterVan(p);
          var M = ['kijk naar de tellers (zelfde noemer)', 'kijk naar de noemers (zelfde teller)', 'vergelijk met een half'];
          var hint = ['Kijk of de noemers gelijk zijn: ' + p.b + ' en ' + p.d + '.', 'Kijk of de tellers gelijk zijn: ' + p.a + ' en ' + p.c + '.', 'Teller en noemer zijn allebei anders. Is de ene minder en de andere meer dan een half?'][soort];
          var uitleg = ['Gelijke noemers: de grootste teller wint.', 'Gelijke tellers: de kleinste noemer heeft de grootste stukken.', br(p.a, p.b) + ' is ' + halfZin(p.a, p.b) + ' en ' + br(p.c, p.d) + ' is ' + halfZin(p.c, p.d) + '.'][soort];
          return eindKeuze({ context:'Welke breuk is groter?', vraag:br(p.a, p.b) + ' of ' + br(p.c, p.d),
            stappen:[
              kz('Welke manier is hier het handigst?', M, M[soort], hint),
              kz('Welke breuk is groter?', [br(p.a, p.b), br(p.c, p.d), 'ze zijn even groot'], g, uitleg, { waarom:uitleg }) ] });
        } }
    ] });

  /* ---------- 2. Breuk, kommagetal en procent (1F) ---------- */
  var RIJTJES = [[1, 2, 50], [1, 4, 25], [3, 4, 75], [1, 5, 20], [2, 5, 40], [3, 5, 60], [4, 5, 80], [1, 10, 10], [3, 10, 30], [7, 10, 70], [9, 10, 90], [1, 100, 1], [1, 20, 5], [1, 8, 12.5]];
  function delenStappen(t, n){
    var U = 100 % n === 0 ? 100 : 1000, naam = U === 100 ? 'honderdsten' : 'duizendsten';
    return [
      { tekst:'Een breuk is een deling: ' + br(t, n) + ' = ' + t + ' : ' + n + '.', info:true },
      { tekst:'Schrijf ' + t + ' als ' + naam + ': ' + t + ' = … ' + naam, antwoord:String(t * U), hint:'1 heel is ' + U + ' ' + naam + '. Dan is ' + t + ' heel ' + t + ' ' + X + ' ' + U + '.' },
      { tekst:(t * U) + ' : ' + n + ' =', antwoord:String(t * U / n), hint:'Deel ' + (t * U) + ' door ' + n + '. Splits als het moet.' },
      { tekst:'Dat zijn ' + (t * U / n) + ' ' + naam + '. Als kommagetal: ' + br(t, n) + ' =', antwoord:tn(t / n), hint:'Bij ' + naam + ' staan er ' + (U === 100 ? 'twee' : 'drie') + ' cijfers achter de komma.', fout:F(tn(t * U / n / 10), 'Let op de plaats van de komma.') } ];
  }
  function noemerStappen(t, n){
    var U = 10 % n === 0 ? 10 : 100, k = U / n, naam = U === 10 ? 'tienden' : 'honderdsten';
    return [
      { tekst:'Maak de noemer ' + U + '. ' + n + ' ' + X + ' … = ' + U, antwoord:String(k), hint:'Hoe vaak past ' + n + ' in ' + U + '?' },
      { tekst:'De teller ook keer ' + k + ': ' + t + ' ' + X + ' ' + k + ' =', antwoord:String(t * k), hint:'Teller en noemer doe je allebei keer ' + k + '.' },
      { tekst:'Dat zijn ' + (t * k) + ' ' + naam + '. Als kommagetal: ' + br(t, n) + ' =', antwoord:tn(t / n), hint:br(t * k, U) + ' schrijf je met ' + (U === 10 ? 'één cijfer' : 'twee cijfers') + ' achter de komma.' } ];
  }
  function R0strook(n, t, k){ var boven = [], onder = []; for (var i = 0; i <= n; i++){ boven.push(i === 0 ? '0' : i === n ? '1' : ''); onder.push(i === 0 ? '0%' : i === n ? '100%' : ''); } return T.teken.strook(n, k ? t : 0, { boven:boven, onder:onder }); }

  G.push({ groep:{ id:'breuk-om', niveau:'1F', domein:'verhoudingen', naam:'Breuk, kommagetal en procent',
      uit:'Een breuk, een kommagetal en een procent kunnen hetzelfde zeggen: 3/4 = 0,75 = 75%. Hier leer je ze in elkaar omzetten.' },
    doelen:[
      { id:'breuk-om-rijtjes', naam:'De bekende rijtjes', kort:'Ken de vaste rijtjes uit je hoofd: 1/2 = 0,5 = 50%, 1/4 = 0,25 = 25% enzovoort',
        uit:'<p>Sommige breuken kom je steeds tegen. Leer hun <b>rijtje</b> uit je hoofd:</p><p>1/2 = 0,5 = 50% &nbsp; 1/4 = 0,25 = 25% &nbsp; 3/4 = 0,75 = 75%<br>1/5 = 0,2 = 20% &nbsp; 1/10 = 0,1 = 10% &nbsp; 1/100 = 0,01 = 1%</p><p>Met deze rijtjes reken je ook andere uit: 2/5 is twee keer 1/5, dus 0,4 en 40%.</p>',
        wanneer:'je snel wilt wisselen tussen breuk, kommagetal en procent.',
        maak:function(R){
          var r = R.kies(RIJTJES), t = r[0], n = r[1], p = r[2], d = tn(t / n), b = br(t, n), van = R.heel(0, 2);
                    var stB = { tekst:'Als breuk:', antwoord:b, hint:'Het rijtje is ' + b + ' = ' + d + ' = ' + tn(p) + '%. Schrijf de breuk zo eenvoudig mogelijk.', fout:F(br(p, 100), 'Dat klopt, maar het kan eenvoudiger. Deel teller en noemer door hetzelfde getal.') };
          if (van === 0) return { vraag:b + ' = …%', beeld:function(k){ return R0strook(n, t, k >= 1); },
            stappen:[ { tekst:'Als kommagetal: ' + b + ' =', antwoord:d, hint:'Denk aan het rijtje, of reken ' + t + ' : ' + n + '.' },
                      { tekst:'Als procent: ' + d + ' =', antwoord:pc(p), eenheid:'%', hint:'Keer 100: ' + d + ' ' + X + ' 100 = ' + tn(p) + '.' } ] };
          if (van === 1) return { vraag:tn(p) + '% = …', context:'Schrijf als breuk.', beeld:function(k){ return R0strook(n, t, k >= 1); },
            stappen:[ { tekst:'Als kommagetal: ' + tn(p) + '% =', antwoord:d, hint:'Procent is per honderd: ' + tn(p) + ' : 100.' }, stB ] };
          return { vraag:d + ' = …', context:'Schrijf als breuk.', beeld:function(k){ return R0strook(n, t, k >= 1); },
            stappen:[ { tekst:'Als procent: ' + d + ' =', antwoord:pc(p), eenheid:'%', hint:'Keer 100: ' + d + ' ' + X + ' 100 = ' + tn(p) + '.' }, stB ] };
        } },
      { id:'breuk-om-delen', naam:'Breuk naar kommagetal: delen', kort:'Een breuk is een deling: reken teller gedeeld door noemer uit',
        uit:'<p>De breukstreep betekent <b>gedeeld door</b>. 3/8 is dus 3 : 8.</p><p>3 : 8 is lastig. Maak er <b>duizendsten</b> van: 3 = 3000 duizendsten. 3000 : 8 = 375. Dus 3/8 = 375 duizendsten = <b>0,375</b>.</p><p>Gaat de noemer precies in 100, dan neem je honderdsten.</p>',
        wanneer:'de noemer niet makkelijk naar 10 of 100 gaat, zoals bij 8 of 40.',
        maak:function(R){
          var n = R.kies([4, 8, 8, 20, 25, 40, 40, 50]), t; do { t = R.heel(1, n - 1); } while (ggd(t, n) !== 1);
          var st = delenStappen(t, n);
          return { vraag:br(t, n) + ' = …', context:'Schrijf als kommagetal.', stappen:st,
                        beeld:function(k){ return k >= 4 ? R0strook(n, t, true) : ''; } };
        } },
      { id:'breuk-om-noemer', naam:'Breuk naar kommagetal: via 10 of 100', kort:'Maak de noemer 10 of 100, dan lees je het kommagetal zo af',
        uit:'<p>Tienden en honderdsten kun je direct als kommagetal schrijven: 6/10 = 0,6 en 35/100 = 0,35.</p><p>Dus maak je de noemer <b>10 of 100</b>. 3/5: doe teller en noemer keer 2, dan krijg je 6/10 = <b>0,6</b>. 7/20: keer 5 geeft 35/100 = <b>0,35</b>.</p>',
        wanneer:'de noemer precies in 10 of 100 past, zoals 2, 4, 5, 20, 25 of 50.',
        maak:function(R){
          var n = R.kies([2, 4, 5, 5, 20, 20, 25, 50]), t; do { t = R.heel(1, n - 1); } while (ggd(t, n) !== 1);
          return { vraag:br(t, n) + ' = …', context:'Schrijf als kommagetal.', stappen:noemerStappen(t, n) };
        } },
      { id:'breuk-om-procent', naam:'Kommagetal naar procent', kort:'Keer 100: 0,35 is 35 honderdsten, dus 35%',
        uit:'<p><b>Procent</b> betekent: van de honderd. 35% is 35 honderdsten.</p><p>0,35 is ook 35 honderdsten. Dus 0,35 = <b>35%</b>. Je doet het kommagetal <b>keer 100</b>: de komma schuift twee plaatsen naar rechts.</p><p>Let op: 0,4 = 0,40 = 40%. En 0,05 = 5%.</p>',
        wanneer:'je een kommagetal of een uitkomst van een deling als procent wilt schrijven.',
        maak:function(R){
          var soort = R.heel(0, 5), p = soort < 3 ? R.heel(1, 99) : soort === 3 ? R.heel(1, 9) * 10 : soort === 4 ? R.heel(1, 9) : R.heel(21, 50) * 5;
          var d = tn(p / 100);
          return { vraag:d + ' = …%',
            beeld:function(k){ return k >= 1 && p <= 100 ? T.teken.strook(10, Math.round(p / 10), { boven:['0%', '', '', '', '', '50%', '', '', '', '', '100%'], aria:d }) : ''; },
            stappen:[
              { tekst:'Hoeveel honderdsten is ' + d + '? ' + d + ' = …/100', antwoord:String(p), hint:'Schrijf twee cijfers achter de komma: ' + T.toon(p / 100, { dec:2, vast:true }) + '. Dat zijn ' + p + ' honderdsten.', fout:F(tn(p / 10), 'Dat zijn tienden. Kijk naar honderdsten: twee cijfers achter de komma.') },
              { tekst:'Honderdsten zijn procenten. Dus ' + d + ' =', antwoord:pc(p), eenheid:'%', hint:p + ' honderdsten is ' + p + '%.', fout:F(tn(p / 10), 'De komma moet twee plaatsen opschuiven, niet een.') } ] };
        } },
      { id:'breuk-om-vereenvoudig', naam:'Procent naar breuk', kort:'Schrijf het procent als honderdsten en vereenvoudig de breuk',
        uit:'<p>35% betekent 35 van de 100. Als breuk: <b>35/100</b>.</p><p>Dan <b>vereenvoudig</b> je: deel teller en noemer door hetzelfde getal. 35 en 100 kun je allebei door 5 delen: 35/100 = <b>7/20</b>.</p><p>Neem het grootste getal dat in allebei past, dan ben je in een keer klaar.</p>',
        wanneer:'je een procent als breuk wilt schrijven, bijvoorbeeld om er makkelijker mee te rekenen.',
        maak:function(R){
          var p; do { p = R.heel(2, 98); } while (ggd(p, 100) === 1 || p === 50);
          var g = ggd(p, 100), andere = []; for (var i = 2; i < g; i++) if (g % i === 0) andere.push(i);
          var fo = {}; andere.forEach(function(x){ fo[String(x)] = 'Dat kan, maar er past een groter getal in ' + p + ' en 100. Dan ben je in een keer klaar.'; });
          return { vraag:p + '% = …', context:'Schrijf als breuk, zo eenvoudig mogelijk.',
            stappen:[
              { tekst:p + '% als honderdsten: ' + p + '% = …/100', antwoord:String(p), hint:'Procent betekent van de honderd.' },
              { tekst:'Wat is het grootste getal waardoor ' + p + ' en 100 allebei deelbaar zijn?', antwoord:String(g), hint:'Probeer ' + (g % 25 === 0 ? '25' : g % 20 === 0 ? '20' : g % 10 === 0 ? '10' : g % 5 === 0 ? '5' : '4, dan 2') + '. Past het in allebei?', fout:fo },
              { tekst:'Deel teller en noemer door ' + g + ': ' + br(p, 100) + ' =', antwoord:br(p / g, 100 / g), hint:p + ' : ' + g + ' = ' + (p / g) + ' en 100 : ' + g + ' = ' + (100 / g) + '.', fout:F(br(p, 100), 'Dat is nog niet vereenvoudigd.') } ] };
        } },
      { id:'breuk-om-kies', naam:'Breuk naar kommagetal: kies de handigste manier', kort:'Gaat de noemer in 10 of 100? Dan via 10 of 100. Anders delen',
        uit:'<p>Een breuk als kommagetal schrijven kan op twee manieren.</p><p>Past de noemer precies in <b>10 of 100</b> (2, 4, 5, 20, 25, 50)? Maak dan de noemer 10 of 100.</p><p>Lukt dat niet (8, 40)? Dan <b>deel</b> je: teller gedeeld door noemer.</p>',
        wanneer:'je een breuk als kommagetal moet schrijven en snel wilt kiezen hoe.',
        maak:function(R){
          var via = R.heel(0, 1), n = via ? R.kies([2, 4, 5, 20, 25, 50]) : R.kies([8, 40]), t; do { t = R.heel(1, n - 1); } while (ggd(t, n) !== 1);
          var M = ['eerst een noemer van 10 of 100 maken', 'delen: teller gedeeld door noemer'];
          var st = via ? noemerStappen(t, n) : delenStappen(t, n).slice(1);
          return { vraag:br(t, n) + ' = …', context:'Schrijf als kommagetal.',
            stappen:[ kz('Welke manier is hier het handigst?', M, M[via ? 0 : 1], via ? 'Past ' + n + ' precies in 10 of in 100?' : 'Past ' + n + ' in 10 of 100? Nee, dus ...') ].concat(st) };
        } }
    ] });

  /* ---------- 3. De verhoudingstabel (1F) ---------- */
  var DING = [['pak sap', 'pakken sap'], ['schrift', 'schriften'], ['kaartje', 'kaartjes'], ['zak chips', 'zakken chips'], ['fles water', 'flessen water'], ['pot jam', 'potten jam'], ['broodje', 'broodjes'], ['pen', 'pennen'], ['reep', 'repen'], ['ijsje', 'ijsjes']];
  function stuks(d, a){ return a + ' ' + (a === 1 ? d[0] : d[1]); }
  function kostZin(d, a, c){ return stuks(d, a) + ' ' + (a === 1 ? 'kost' : 'kosten') + ' ' + ec(c) + '.'; }
  var KOP = ['aantal', 'prijs'];
  /* routes voor de kies-opgave en de losse doelen */
  function routeVia1(R){
    var a = R.kies([3, 7, 9, 6, 4]), b; do { b = R.heel(2, 13); } while (ggd(a, b) !== 1 || b === 1);
    var p = R.heel(7, 60) * 5;
    return { a:a, b:b, A:a * p, B:b * p, cols:[{ b:a, o:ec(a * p) }, { b:1, o:ec(p), toon:1, vul:1, pijl:':' + a }, { b:b, o:ec(b * p), vul:2, pijl:X + b, eind:1 }],
      st:[ { tekst:'Eerst terug naar 1: ' + ec(a * p) + ' : ' + a + ' =', antwoord:ec(p), hint:'Deel door ' + a + '. Reken in centen: ' + (a * p) + ' : ' + a + '.' },
           { tekst:'Dan naar ' + b + ': ' + b + ' ' + X + ' ' + ec(p) + ' =', antwoord:ec(b * p), hint:'Keer ' + b + '. Reken in centen: ' + b + ' ' + X + ' ' + p + '.' } ] };
  }
  function routeDubbel(R, lijst){
    var keer = R.kies(lijst || [2, 4, 0.5, 0.25]), p = R.heel(5, 60) * 5, a = keer >= 1 ? R.heel(2, keer === 8 ? 5 : 9) : R.heel(1, 6) * Math.round(1 / keer);
    var b = a * keer, cols = [{ b:a, o:ec(a * p) }], st = [], x = a;
    while (x !== b){
      var y = keer > 1 ? x * 2 : x / 2, w = keer > 1 ? 'Verdubbel' : 'Halveer';
      cols.push({ b:y, o:ec(y * p), vul:st.length + 1, pijl:keer > 1 ? X + '2' : ':2', eind:y === b ? 1 : 0 });
      st.push({ tekst:w + ': ' + y + ' ' + (y === 1 ? 'kost' : 'kosten') + ' ' + (keer > 1 ? '2 ' + X + ' ' + ec(x * p) : ec(x * p) + ' : 2') + ' =', antwoord:ec(y * p), hint:keer > 1 ? 'Twee keer ' + ec(x * p) + '.' : 'De helft van ' + ec(x * p) + '.' });
      x = y;
    }
    return { a:a, b:b, A:a * p, B:b * p, cols:cols, st:st };
  }
  function routeTien(R){
    var p = R.heel(5, 90) * 5, a, b;
    if (R.heel(0, 1)){ a = R.heel(2, 9); b = a * 10; } else { b = R.heel(2, 9); a = b * 10; }
    return { a:a, b:b, A:a * p, B:b * p, cols:[{ b:a, o:ec(a * p) }, { b:b, o:ec(b * p), vul:1, pijl:b > a ? X + '10' : ':10', eind:1 }],
      st:[ { tekst:(b > a ? 'Keer 10: ' + b + ' kosten 10 ' + X + ' ' + ec(a * p) : 'Gedeeld door 10: ' + b + ' kosten ' + ec(a * p) + ' : 10') + ' =', antwoord:ec(b * p), hint:b > a ? 'Keer 10: de komma schuift een plaats naar rechts.' : 'Gedeeld door 10: de komma schuift een plaats naar links.' } ] };
  }
  function routeTussen(R){
    var a, b, g;
    do { a = R.heel(4, 24); b = R.heel(4, 30); g = ggd(a, b); } while (g < 2 || g % 5 === 0 || g === a || g === b || a === b || b === 2 * a || a === 2 * b || a > 18 || b > 30);
    var q; do { q = R.heel(10, 120) * 5; } while (q % g === 0);
    return { a:a, b:b, g:g, A:a / g * q, B:b / g * q, cols:[{ b:a, o:ec(a / g * q) }, { b:g, o:ec(q), toon:1, vul:1, pijl:':' + (a / g) }, { b:b, o:ec(b / g * q), vul:2, pijl:X + (b / g), eind:1 }],
      st:[ { tekst:'Eerst naar ' + g + ': ' + ec(a / g * q) + ' : ' + (a / g) + ' =', antwoord:ec(q), hint:'Van ' + a + ' naar ' + g + ' is gedeeld door ' + (a / g) + '.' },
           { tekst:'Dan naar ' + b + ': ' + (b / g) + ' ' + X + ' ' + ec(q) + ' =', antwoord:ec(b / g * q), hint:'Van ' + g + ' naar ' + b + ' is keer ' + (b / g) + '.' } ] };
  }
  function tabelOpgave(R, rt, eersteStap){
    var d = R.kies(DING), off = eersteStap ? 1 : 0;
    var cols = rt.cols.map(function(c){ var o = {}; for (var k in c) o[k] = c[k]; if (o.toon) o.toon += off; if (o.vul) o.vul += off; return o; });
    return { context:kostZin(d, rt.a, rt.A), vraag:'Wat ' + (rt.b === 1 ? 'kost' : 'kosten') + ' ' + stuks(d, rt.b) + '?',
      beeld:function(n){ return vtab(KOP, cols, n); }, stappen:(eersteStap ? [eersteStap] : []).concat(rt.st) };
  }

  G.push({ groep:{ id:'verh-tabel', niveau:'1F', domein:'verhoudingen', naam:'De verhoudingstabel',
      uit:'In een verhoudingstabel doe je boven en onder steeds hetzelfde. Er zijn veel routes: via 1, verdubbelen, keer 10, kolommen optellen of een handig tussengetal.' },
    doelen:[
      { id:'verh-via1', naam:'Via 1', kort:'Reken eerst uit wat 1 kost, dan wat het aantal kost dat je zoekt',
        uit:'<p>4 pakken sap kosten € 6,00. Wat kosten er 7?</p><p>Ga eerst <b>terug naar 1</b>: € 6,00 : 4 = € 1,50. Daarna <b>naar 7</b>: 7 ' + X + ' € 1,50 = € 10,50.</p><p>In de tabel doe je boven en onder hetzelfde: eerst gedeeld door 4, dan keer 7.</p>',
        wanneer:'de getallen niet handig in elkaar passen, maar de prijs van 1 wel mooi uitkomt.',
        maak:function(R){ return tabelOpgave(R, routeVia1(R)); } },
      { id:'verh-dubbel', naam:'Verdubbelen en halveren', kort:'Doe boven en onder keer 2 of gedeeld door 2, zo vaak als nodig',
        uit:'<p>3 kaartjes kosten € 4,50. Wat kosten er 12?</p><p><b>Verdubbel</b>: 6 kosten € 9,00. Nog een keer: 12 kosten € 18,00.</p><p>Andersom kan ook: van 16 naar 8 naar 4 is steeds <b>halveren</b>.</p>',
        wanneer:'het aantal dat je zoekt 2, 4 of 8 keer zo groot is, of de helft of een kwart.',
        maak:function(R){ return tabelOpgave(R, routeDubbel(R, [4, 4, 8, 0.25, 0.25])); } },
      { id:'verh-tien', naam:'Keer 10 en gedeeld door 10', kort:'Ga met keer 10 of gedeeld door 10 naar een handig getal en reken daarvandaan verder',
        uit:'<p>Keer 10 en gedeeld door 10 gaan heel snel: de komma schuift een plaats.</p><p>3 schriften kosten € 1,20. Wat kosten er 60? <b>Keer 10</b>: 30 kosten € 12,00. Dan keer 2: 60 kosten € 24,00.</p><p>40 kosten € 18,00, wat kosten er 12? <b>Gedeeld door 10</b>: 4 kosten € 1,80. Dan keer 3: 12 kosten € 5,40.</p>',
        wanneer:'er een 10 of een veelvoud van 10 in de getallen zit.',
        maak:function(R){
          var p = R.heel(5, 60) * 5, k = R.heel(2, 5), a, m, b, op;
          if (R.heel(0, 1)){ a = R.heel(2, 9); m = a * 10; b = m * k; op = X + '10'; } else { m = R.heel(2, 9); a = m * 10; b = m * k; op = ':10'; }
          var cols = [{ b:a, o:ec(a * p) }, { b:m, o:ec(m * p), toon:1, vul:1, pijl:op }, { b:b, o:ec(b * p), vul:2, pijl:X + k, eind:1 }];
          var d = R.kies(DING);
          return { context:kostZin(d, a, a * p), vraag:'Wat kosten ' + stuks(d, b) + '?', beeld:function(n){ return vtab(KOP, cols, n); },
            stappen:[
              { tekst:(op === ':10' ? 'Gedeeld door 10: ' + m + ' kosten ' + ec(a * p) + ' : 10' : 'Keer 10: ' + m + ' kosten 10 ' + X + ' ' + ec(a * p)) + ' =', antwoord:ec(m * p), hint:op === ':10' ? 'De komma schuift een plaats naar links.' : 'De komma schuift een plaats naar rechts.', fout:FG(op === ':10' ? a * p * 10 : a * p / 10, 'De komma schoof de verkeerde kant op.') },
              { tekst:'Dan keer ' + k + ': ' + b + ' kosten ' + k + ' ' + X + ' ' + ec(m * p) + ' =', antwoord:ec(b * p), hint:'Van ' + m + ' naar ' + b + ' is keer ' + k + '.' } ] };
        } },
      { id:'verh-optellen', naam:'Kolommen optellen', kort:'Maak twee kolommen die samen het aantal geven en tel ze op',
        uit:'<p>10 kaartjes kosten € 24,00. Wat kosten er 13?</p><p>13 = 10 + 3. Je weet al wat 10 kosten. Reken uit wat 3 kosten: via 1 kost een kaartje € 2,40, dus 3 kosten € 7,20.</p><p>Dan <b>tel je de kolommen op</b>: € 24,00 + € 7,20 = € 31,20.</p>',
        wanneer:'het aantal dat je zoekt de som is van twee aantallen die je makkelijk uitrekent.',
        maak:function(R){
          var p = R.heel(6, 60) * 5, e = R.heel(2, 9), m = R.kies([10, 10, 20]), n = m + e, d = R.kies(DING);
          var cols = [{ b:m, o:ec(m * p) }, { b:1, o:ec(p), toon:1, vul:1, pijl:':' + m }, { b:e, o:ec(e * p), toon:2, vul:2, pijl:X + e }, { b:n, o:ec(n * p), vul:3, pijl:m + ' + ' + e, eind:1 }];
          return { context:kostZin(d, m, m * p), vraag:'Wat kosten ' + stuks(d, n) + '?', beeld:function(k){ return vtab(KOP, cols, k); },
            stappen:[
              { tekst:'Via 1: 1 ' + d[0] + ' kost ' + ec(m * p) + ' : ' + m + ' =', antwoord:ec(p), hint:'Gedeeld door ' + m + '.' },
              { tekst:e + ' ' + d[1] + ' kosten ' + e + ' ' + X + ' ' + ec(p) + ' =', antwoord:ec(e * p), hint:'Reken in centen: ' + e + ' ' + X + ' ' + p + '.' },
              { tekst:n + ' = ' + m + ' + ' + e + '. Tel de kolommen op: ' + ec(m * p) + ' + ' + ec(e * p) + ' =', antwoord:ec(n * p), hint:'Tel de prijs van ' + m + ' en van ' + e + ' bij elkaar.', fout:FG(e * p, 'Dat is alleen de prijs van ' + e + '. Tel de prijs van ' + m + ' erbij.') } ] };
        } },
      { id:'verh-tussen', naam:'Via een handig tussengetal', kort:'Zoek een getal dat in allebei de aantallen past en ga daar eerst naartoe',
        uit:'<p>6 broodjes kosten € 10,00. Wat kosten er 9? Via 1 wordt het lastig: € 10,00 : 6 komt niet mooi uit.</p><p>Zoek een getal dat in <b>6 en in 9</b> past: 3. Ga eerst naar 3: € 10,00 : 2 = € 5,00. Dan naar 9: 3 ' + X + ' € 5,00 = € 15,00.</p>',
        wanneer:'via 1 een lastig getal geeft, maar er een getal is dat in allebei de aantallen past.',
        maak:function(R){
          var rt = routeTussen(R);
          var deel = []; for (var i = 2; i < rt.g; i++) if (rt.g % i === 0) deel.push(i);
          var fo = {}; deel.forEach(function(x){ fo[String(x)] = 'Dat past ook in allebei, maar met ' + rt.g + ' ben je sneller klaar.'; }); fo['1'] = 'Via 1 kan, maar dan krijg je een lastig bedrag. Zoek een groter getal.';
          var stap = { tekst:'Welk getal past in ' + rt.a + ' en in ' + rt.b + '? Neem het grootste.', antwoord:String(rt.g), hint:'Zoek in de tafels: ' + rt.a + ' en ' + rt.b + ' zitten allebei in de tafel van ' + rt.g + '.', fout:fo };
          return tabelOpgave(R, rt, stap);
        } },
      { id:'verh-kies', naam:'Kies de handigste route', kort:'Kijk eerst naar de getallen en kies dan: via 1, verdubbelen, keer 10 of een tussengetal',
        uit:'<p>In een verhoudingstabel kom je op veel manieren bij het antwoord. Kijk eerst naar de <b>twee aantallen</b>:</p><p>Is het ene 2 of 4 keer het andere? <b>Verdubbel of halveer</b>. Is het 10 keer zo groot of klein? <b>Keer of gedeeld door 10</b>. Past er een getal in allebei? Neem een <b>tussengetal</b>. Anders: <b>via 1</b>.</p>',
        wanneer:'je een verhoudingstabel invult en de snelste route wilt.',
        maak:function(R){
          var soort = R.heel(0, 3), rt = [routeVia1, routeDubbel, routeTien, routeTussen][soort](R);
          var M = ['via 1', 'verdubbelen of halveren', 'keer 10 of gedeeld door 10', 'via een handig tussengetal'];
          var hint = ['Het ene aantal past niet in het andere en ze hebben geen getal gemeen. Ga dan eerst naar 1.', 'Van ' + rt.a + ' naar ' + rt.b + ': is dat keer 2 of de helft?', 'Van ' + rt.a + ' naar ' + rt.b + ': is dat keer 10 of gedeeld door 10?', rt.a + ' en ' + rt.b + ' zitten allebei in de tafel van ' + rt.g + '. Via 1 geeft een lastig bedrag.'][soort];
          return tabelOpgave(R, rt, kz('Welke route is hier het handigst?', M, M[soort], hint));
        } }
    ] });

  /* ---------- 4. Procenten: de basis (1F) ---------- */
  function procBasis(cfg){
    return function(R){
      var H = cfg.H(R), uit = H * cfg.p / 100, d = cfg.delen, stuk = H / d;
      return { vraag:cfg.p + '% van ' + tn(H),
        beeld:function(k){ var onder = []; for (var i = 0; i <= d; i++) onder.push(i === 0 ? '0' : i === d ? tn(H) : k >= cfg.toonOnder && (d <= 10 || i % 2 === 0) ? tn(i * stuk) : ''); return pstrook(d, k >= cfg.toonOnder ? cfg.vol : 0, onder); },
        stappen:cfg.st(H, R) };
    };
  }
  G.push({ groep:{ id:'proc-basis', niveau:'1F', domein:'verhoudingen', naam:'Procenten: de basis',
      uit:'Procent betekent: van de honderd. Een paar procenten moet je direct kunnen uitrekenen. Daarmee kun je later elk procent uitrekenen.' },
    doelen:[
      { id:'proc-helft', naam:'50% is de helft', kort:'50% is 1/2: deel door 2',
        uit:'<p>100% is het hele bedrag. <b>50%</b> is de helft daarvan, dus 1/2.</p><p>50% van 80 is 80 : 2 = <b>40</b>.</p>',
        wanneer:'je 50% korting of de helft van iets wilt uitrekenen.',
        maak:procBasis({ p:50, delen:2, vol:1, toonOnder:2, H:function(R){ return R.kies([R.heel(3, 60) * 2, R.heel(2, 30) * 10, R.heel(11, 49)]); },
          st:function(H){ return [
            { tekst:'Welk deel is 50%?', antwoord:['1/2', 'de helft', 'een half', 'half', 'helft'], hint:'50 van de 100: dat is de helft.', invoer:'tekst' },
            { tekst:'De helft van ' + tn(H) + ': ' + tn(H) + ' : 2 =', antwoord:tn(H / 2), hint:'Splits als het moet: de helft van ' + (H - H % 10) + ' en de helft van ' + (H % 10) + '.', fout:F(tn(H / 5), 'Je deelde door 5. 50% is de helft: deel door 2.') } ]; } }) },
      { id:'proc-kwart', naam:'25% is een kwart', kort:'25% is 1/4: deel door 4, of twee keer halveren',
        uit:'<p><b>25%</b> is een kwart, dus 1/4. Je deelt door 4.</p><p>Handig: deel twee keer door 2. 25% van 60: de helft is 30, de helft daarvan is <b>15</b>.</p>',
        wanneer:'je een kwart van iets nodig hebt, zoals 25% korting.',
        maak:procBasis({ p:25, delen:4, vol:1, toonOnder:2, H:function(R){ return R.heel(2, 50) * 4; },
          st:function(H){ return [
            { tekst:'De helft van ' + H + ' (50%) =', antwoord:String(H / 2), hint:H + ' : 2.' },
            { tekst:'Nog een keer de helft: 25% = ' + (H / 2) + ' : 2 =', antwoord:String(H / 4), hint:'De helft van de helft is een kwart.', fout:F(H / 2, 'Dat is 50%. Halveer nog een keer.') } ]; } }) },
      { id:'proc-tien', naam:'10% is delen door 10', kort:'10% is 1/10: deel door 10, de komma schuift een plaats',
        uit:'<p><b>10%</b> is 10 van de 100, dus 1/10. Je deelt door 10.</p><p>10% van 350 is <b>35</b>. 10% van 45 is <b>4,5</b>: de komma schuift een plaats naar links.</p>',
        wanneer:'je 10% nodig hebt, of als begin voor andere procenten.',
        maak:procBasis({ p:10, delen:10, vol:1, toonOnder:2, H:function(R){ return R.kies([R.heel(2, 99) * 10, R.heel(11, 99), R.heel(11, 90) * 100]); },
          st:function(H){ return [
            { tekst:'Welk deel is 10%?', antwoord:['1/10', 'een tiende', 'tiende'], hint:'10 van de 100 is 1 van de 10.', invoer:'tekst' },
            { tekst:'Gedeeld door 10: ' + tn(H) + ' : 10 =', antwoord:tn(H / 10), hint:'Haal een nul weg, of schuif de komma een plaats naar links.', fout:F(tn(H / 100), 'Je deelde door 100. Voor 10% deel je door 10.') } ]; } }) },
      { id:'proc-een', naam:'1% is delen door 100', kort:'1% is 1/100: deel door 100, de komma schuift twee plaatsen',
        uit:'<p><b>1%</b> is 1 van de 100. Je deelt door 100.</p><p>1% van 800 is <b>8</b>. 1% van 250 is <b>2,5</b>: de komma schuift twee plaatsen naar links.</p>',
        wanneer:'je een klein procent nodig hebt, of als begin voor procenten als 3% of 7%.',
        maak:procBasis({ p:1, delen:10, vol:0, toonOnder:99, H:function(R){ return R.kies([R.heel(2, 99) * 100, R.heel(11, 99) * 10, R.heel(101, 999)]); },
          st:function(H){ return [
            { tekst:'Welk deel is 1%?', antwoord:['1/100', 'een honderdste', 'honderdste'], hint:'1 van de 100.', invoer:'tekst' },
            { tekst:'Gedeeld door 100: ' + tn(H) + ' : 100 =', antwoord:tn(H / 100), hint:'Eindigt het getal op 00? Haal die weg. Anders schuif je de komma twee plaatsen naar links.', fout:F(tn(H / 10), 'Dat is 10%. Voor 1% deel je door 100.') } ]; } }) },
      { id:'proc-vijf', naam:'5% is de helft van 10%', kort:'Reken eerst 10% uit en neem daar de helft van',
        uit:'<p>5% is de <b>helft van 10%</b>.</p><p>5% van 240: eerst 10% = 24. De helft daarvan is <b>12</b>.</p>',
        wanneer:'je 5% nodig hebt, bijvoorbeeld voor 15% of 35%.',
        maak:procBasis({ p:5, delen:20, vol:1, toonOnder:2, H:function(R){ return R.kies([R.heel(2, 50) * 20, R.heel(3, 40) * 10]); },
          st:function(H){ return [
            { tekst:'Eerst 10%: ' + H + ' : 10 =', antwoord:tn(H / 10), hint:'10% is gedeeld door 10.' },
            { tekst:'5% is de helft: ' + tn(H / 10) + ' : 2 =', antwoord:tn(H / 20), hint:'De helft van ' + tn(H / 10) + '.', fout:F(tn(H / 10), 'Dat is 10%. 5% is de helft daarvan.') } ]; } }) },
      { id:'proc-twintig', naam:'20% is twee keer 10%', kort:'Reken eerst 10% uit en doe dat keer 2',
        uit:'<p>20% is <b>2 keer 10%</b>.</p><p>20% van 70: eerst 10% = 7. Dan 2 ' + X + ' 7 = <b>14</b>.</p><p>Zo gaat het ook met 30%, 40% enzovoort.</p>',
        wanneer:'je 20% nodig hebt, of een ander veelvoud van 10%.',
        maak:procBasis({ p:20, delen:10, vol:2, toonOnder:2, H:function(R){ return R.kies([R.heel(2, 60) * 10, R.heel(11, 99)]); },
          st:function(H){ return [
            { tekst:'Eerst 10%: ' + tn(H) + ' : 10 =', antwoord:tn(H / 10), hint:'10% is gedeeld door 10.' },
            { tekst:'20% is 2 keer 10%: 2 ' + X + ' ' + tn(H / 10) + ' =', antwoord:tn(H / 5), hint:'Verdubbel ' + tn(H / 10) + '.', fout:F(tn(H / 20), 'Je nam de helft. 20% is het dubbele van 10%.') } ]; } }) },
      { id:'proc-75', naam:'75% is drie keer 25%', kort:'Reken eerst 25% uit en doe dat keer 3',
        uit:'<p>75% is 3/4, dus <b>3 keer 25%</b>.</p><p>75% van 40: eerst 25% = 40 : 4 = 10. Dan 3 ' + X + ' 10 = <b>30</b>.</p><p>Of: 100% min 25%. Dat is 40 ' + MIN + ' 10 = 30.</p>',
        wanneer:'je 75% nodig hebt van een getal dat makkelijk door 4 gaat.',
        maak:procBasis({ p:75, delen:4, vol:3, toonOnder:2, H:function(R){ return R.heel(2, 40) * 4; },
          st:function(H){ return [
            { tekst:'Eerst 25%: ' + H + ' : 4 =', antwoord:String(H / 4), hint:'25% is een kwart: deel door 4, of twee keer halveren.' },
            { tekst:'75% is 3 keer 25%: 3 ' + X + ' ' + (H / 4) + ' =', antwoord:String(H * 3 / 4), hint:'Drie keer ' + (H / 4) + '.', fout:F(H / 4, 'Dat is 25%. Doe het nog keer 3.') } ]; } }) }
    ] });

  /* ---------- 5. Rekenen met breuken (2F) ---------- */
  function coprimeTeller(R, n, min){ var t; do { t = R.heel(min || 1, n - 1); } while (ggd(t, n) !== 1); return t; }
  function paarOngelijk(R){
    for (;;){ var b = R.kies([2, 3, 4, 5, 6, 8, 10, 12]), d = R.kies([2, 3, 4, 5, 6, 8, 10, 12]);
      if (b === d || b % d === 0 || d % b === 0 || kgv(b, d) > 24) continue;
      var a = coprimeTeller(R, b), c = coprimeTeller(R, d), min = R.heel(0, 2) === 0;
      if (min && a * d < c * b){ var x = a, y = b; a = c; b = d; c = x; d = y; }
      if (min && a * d === c * b) continue;
      return { a:a, b:b, c:c, d:d, min:min, L:kgv(b, d) };
    }
  }
  function ongelijkStappen(p){
    var L = p.L, a2 = p.a * L / p.b, c2 = p.c * L / p.d, S = p.min ? a2 - c2 : a2 + c2, tk = p.min ? ' ' + MIN + ' ' : ' + ';
    var fo = {}; if (p.b * p.d !== L) fo[String(p.b * p.d)] = 'Dat kan ook, maar ' + L + ' is kleiner. Dan reken je met kleinere getallen.';
    var st = [
      { tekst:'Zoek de kleinste noemer waar ' + p.b + ' en ' + p.d + ' allebei in passen:', antwoord:String(L), hint:'Zoek in de tafel van ' + Math.max(p.b, p.d) + ' het eerste getal dat ook in de tafel van ' + Math.min(p.b, p.d) + ' zit.', fout:fo },
      { tekst:br(p.a, p.b) + ' = …/' + L, antwoord:String(a2), hint:'De noemer gaat keer ' + (L / p.b) + ', dus de teller ook: ' + p.a + ' ' + X + ' ' + (L / p.b) + '.' },
      { tekst:br(p.c, p.d) + ' = …/' + L, antwoord:String(c2), hint:'De noemer gaat keer ' + (L / p.d) + ', dus de teller ook: ' + p.c + ' ' + X + ' ' + (L / p.d) + '.' },
      { tekst:br(a2, L) + tk + br(c2, L) + ' =', antwoord:[br(S, L)].concat(bvar(S, L, true)), hint:(p.min ? 'Trek de tellers af: ' : 'Tel de tellers op: ') + a2 + tk + c2 + '. De noemer blijft ' + L + '.', fout:F(br(S, 2 * L), 'De noemer tel je niet op. Die blijft ' + L + '.') } ];
    if (ggd(S, L) > 1 || S > L) st.push({ tekst:'Schrijf ' + br(S, L) + ' zo eenvoudig mogelijk:', antwoord:bvar(S, L, true), hint:(ggd(S, L) > 1 ? 'Deel teller en noemer door ' + ggd(S, L) + '.' : '') + (S > L ? ' Haal de helen eruit: hoe vaak past ' + L + ' in ' + S + '?' : ''), fout:F(br(S, L), 'Dat klopt, maar het kan eenvoudiger.') });
    return st;
  }
  G.push({ groep:{ id:'breuk-reken', niveau:'2F', domein:'verhoudingen', naam:'Rekenen met breuken',
      uit:'Vereenvoudigen, gelijknamig maken, optellen en aftrekken, helen en gemengde getallen, vermenigvuldigen en delen met breuken.' },
    doelen:[
      { id:'breuk-vereenvoudig', naam:'Vereenvoudigen', kort:'Deel teller en noemer door het grootste getal dat in allebei past',
        uit:'<p>12/18 kun je <b>eenvoudiger</b> schrijven. Zoek een getal dat in 12 en in 18 past. Neem het <b>grootste</b>: 6.</p><p>12 : 6 = 2 en 18 : 6 = 3. Dus 12/18 = <b>2/3</b>. De breuk blijft even groot, alleen de getallen worden kleiner.</p><p>Neem je een kleiner getal, zoals 2, dan moet je daarna nog een keer delen.</p>',
        wanneer:'je een antwoord met een breuk zo eenvoudig mogelijk wilt opschrijven.',
        maak:function(R){
          var n = R.heel(2, 9), t = coprimeTeller(R, n), g = R.kies([2, 3, 4, 5, 6, 8]), T1 = t * g, N1 = n * g;
          var fo = {}; for (var i = 2; i < g; i++) if (g % i === 0) fo[String(i)] = 'Dat past ook in allebei, maar er past een groter getal in. Dan ben je in een keer klaar.';
          return { vraag:br(T1, N1) + ' = …', context:'Schrijf zo eenvoudig mogelijk.',
            beeld:function(k){ return k >= 3 ? breukStrooks(T1, N1, t, n) : T.teken.strook(N1, T1); },
            stappen:[
              { tekst:'Wat is het grootste getal dat in ' + T1 + ' en in ' + N1 + ' past?', antwoord:String(g), hint:'Probeer de tafels: zitten ' + T1 + ' en ' + N1 + ' allebei in de tafel van ' + g + '?', fout:fo },
              { tekst:'Teller: ' + T1 + ' : ' + g + ' =', antwoord:String(t), hint:'Hoe vaak past ' + g + ' in ' + T1 + '?' },
              { tekst:'Noemer: ' + N1 + ' : ' + g + ' =', antwoord:String(n), hint:'Hoe vaak past ' + g + ' in ' + N1 + '?' },
              { tekst:'Dus ' + br(T1, N1) + ' =', antwoord:br(t, n), hint:'De nieuwe teller boven, de nieuwe noemer onder.', fout:F(br(T1, N1), 'Dat is de breuk waar je mee begon.') } ] };
        } },
      { id:'breuk-gelijknamig', naam:'Gelijknamig maken', kort:'Zoek een noemer waar allebei de noemers in passen en schrijf beide breuken met die noemer',
        uit:'<p>Breuken zijn <b>gelijknamig</b> als ze dezelfde noemer hebben. 2/3 en 3/4 zijn dat niet.</p><p>Zoek een getal dat in de tafel van 3 én van 4 zit: <b>12</b>. Dan: 2/3 = 8/12 en 3/4 = 9/12.</p><p>Nu kun je ze makkelijk vergelijken, optellen of aftrekken.</p>',
        wanneer:'je breuken met verschillende noemers wilt vergelijken, optellen of aftrekken.',
        maak:function(R){
          var p = paarOngelijk(R), L = p.L, a2 = p.a * L / p.b, c2 = p.c * L / p.d, st = ongelijkStappen(p).slice(0, 3);
          var goed = br(a2, L) + ' en ' + br(c2, L);
          return { vraag:br(p.a, p.b) + ' en ' + br(p.c, p.d), context:'Maak deze breuken gelijknamig.', stappen:st, antwoord:goed,
            controle:function(v){ var m = String(v).replace(/\s+/g, '').match(/(\d+)\/(\d+)/g) || []; return m.length === 2 && m[0] === br(a2, L) && m[1] === br(c2, L); },
            beeld:function(k){ return k >= 3 ? breukStrooks(a2, L, c2, L) : breukStrooks(p.a, p.b, p.c, p.d); } };
        } },
      { id:'breuk-plus-gelijk', naam:'Optellen en aftrekken: gelijke noemers', kort:'Zijn de noemers gelijk, tel dan alleen de tellers op of trek ze af',
        uit:'<p>3/8 + 2/8: de noemers zijn gelijk, de stukken zijn even groot. Je telt dus <b>alleen de tellers</b> op: 3 + 2 = 5. Het antwoord is <b>5/8</b>.</p><p>De noemer blijft hetzelfde. Bij aftrekken gaat het net zo: 7/10 ' + MIN + ' 3/10 = 4/10 = 2/5.</p>',
        wanneer:'de breuken dezelfde noemer hebben.',
        maak:function(R){
          var n = R.heel(3, 12), min = R.heel(0, 2) === 0, a = R.heel(1, n - 1), c = R.heel(1, n - 1);
          if (min && a === c) a = a === n - 1 ? a - 1 : a + 1;
          if (min && a < c){ var x = a; a = c; c = x; }
          var S = min ? a - c : a + c, tk = min ? ' ' + MIN + ' ' : ' + ';
          var st = [
            { tekst:'De noemers zijn gelijk. ' + (min ? 'Trek de tellers af: ' : 'Tel de tellers op: ') + a + tk + c + ' =', antwoord:String(S), hint:'Alleen de getallen boven de streep.' },
            { tekst:'Dus ' + br(a, n) + tk + br(c, n) + ' =', antwoord:[br(S, n)].concat(bvar(S, n, true)), hint:'De noemer blijft ' + n + '.', fout:F(min ? null : br(S, 2 * n), 'De noemer tel je niet op. Die blijft ' + n + '.') } ];
          if (ggd(S, n) > 1 || S > n) st.push({ tekst:'Schrijf ' + br(S, n) + ' zo eenvoudig mogelijk:', antwoord:bvar(S, n, true), hint:(ggd(S, n) > 1 ? 'Deel teller en noemer door ' + ggd(S, n) + '.' : '') + (S > n ? ' Haal de helen eruit: hoe vaak past ' + n + ' in ' + S + '?' : ''), fout:F(br(S, n), 'Dat klopt, maar het kan eenvoudiger.') });
          return { vraag:br(a, n) + tk + br(c, n), stappen:st };
        } },
      { id:'breuk-plus-ongelijk', naam:'Optellen en aftrekken: ongelijke noemers', kort:'Maak eerst de noemers gelijk, tel of trek dan de tellers af',
        uit:'<p>1/3 + 1/4: de stukken zijn niet even groot. Je kunt ze nog niet optellen.</p><p>Maak eerst de noemers <b>gelijk</b>: 1/3 = 4/12 en 1/4 = 3/12. Nu wel: 4/12 + 3/12 = <b>7/12</b>.</p><p>Schrijf het antwoord daarna zo eenvoudig mogelijk.</p>',
        wanneer:'de breuken verschillende noemers hebben.',
        maak:function(R){ var p = paarOngelijk(R); return { vraag:br(p.a, p.b) + (p.min ? ' ' + MIN + ' ' : ' + ') + br(p.c, p.d), stappen:ongelijkStappen(p) }; } },
      { id:'breuk-gemengd', naam:'Helen en gemengde getallen', kort:'Haal de helen uit een breuk, of zet een gemengd getal terug in een breuk',
        uit:'<p>7/4 is meer dan 1 heel, want 4/4 is 1. Haal de <b>helen</b> eruit: 4 past 1 keer in 7, er blijven 3 vierden over. Dus 7/4 = <b>1&ensp;3/4</b>.</p><p>Andersom: 2&ensp;1/3. In 2 helen zitten 2 ' + X + ' 3 = 6 derden. Plus 1 derde is 7 derden: <b>7/3</b>.</p>',
        wanneer:'een breuk groter is dan 1, of als je met een gemengd getal wilt rekenen.',
        maak:function(R){
          var n = R.heel(2, 8), t; do { t = R.heel(n + 1, 4 * n); } while (t % n === 0);
          var h = Math.floor(t / n), r = t - h * n;
          var gemengd = [h + GS + br(r, n)]; if (gem(t, n) !== gemengd[0]) gemengd.push(gem(t, n));
          var lijn = function(k){ return blijn({ n:n, hele:h + 1, stip:t, sprongen:k >= 1 ? [{ van:0, naar:h * n, tekst:h + (h === 1 ? ' heel' : ' helen'), kleur:0 }].concat(k >= 2 ? [{ van:h * n, naar:t, tekst:'+' + br(r, n), kleur:1 }] : []) : [] }); };
          if (R.heel(0, 1)) return { vraag:br(t, n) + ' = …', context:'Schrijf als gemengd getal.', beeld:lijn,
            stappen:[
              { tekst:'Hoe vaak past ' + n + ' in ' + t + '? Dat zijn de helen.', antwoord:String(h), hint:h + ' ' + X + ' ' + n + ' = ' + (h * n) + '. Past er nog een ' + n + ' bij?' },
              { tekst:'Hoeveel blijft er over? ' + t + ' ' + MIN + ' ' + (h * n) + ' =', antwoord:String(r), hint:'Trek de helen eraf: ' + t + ' ' + MIN + ' ' + h + ' ' + X + ' ' + n + '.' },
              { tekst:'Dus ' + br(t, n) + ' =', antwoord:gemengd, hint:'Eerst de helen, dan de breuk: ' + h + ' en ' + br(r, n) + '.' } ] };
          return { vraag:h + GS + br(r, n) + ' = …/' + n, context:'Schrijf als breuk.', beeld:lijn,
            stappen:[
              { tekst:'In 1 heel zitten ' + n + ' stukjes van 1/' + n + '. In ' + h + (h === 1 ? ' heel: ' : ' helen: ') + h + ' ' + X + ' ' + n + ' =', antwoord:String(h * n), hint:'Reken ' + h + ' keer ' + n + '.' },
              { tekst:'Tel de ' + r + ' erbij: ' + (h * n) + ' + ' + r + ' =', antwoord:String(t), hint:'Er komen nog ' + r + ' stukjes bij.', fout:F(h * n, 'Vergeet de ' + r + ' niet.') },
              { tekst:'Dus ' + h + GS + br(r, n) + ' =', antwoord:br(t, n), hint:'De teller is ' + t + ', de noemer blijft ' + n + '.' } ] };
        } },
      { id:'breuk-keer-heel', naam:'Breuk keer een geheel getal', kort:'Doe alleen de teller keer het getal, de noemer blijft hetzelfde',
        uit:'<p>3/4 ' + X + ' 6 betekent: 6 keer 3/4. Op de getallenlijn zijn dat 6 sprongen van 3 vierden.</p><p>Je doet <b>alleen de teller keer 6</b>: 3 ' + X + ' 6 = 18. Dat zijn 18 vierden: <b>18/4</b>.</p><p>Schrijf het daarna eenvoudiger: 18/4 = 4&ensp;2/4 = <b>4&ensp;1/2</b>.</p>',
        wanneer:'je een breuk een aantal keer moet nemen, zoals 6 keer 3/4 liter.',
        maak:function(R){
          var n, t, h; do { n = R.kies([2, 3, 4, 5, 6, 8]); t = coprimeTeller(R, n); h = R.heel(2, 9); } while (t * h / n > 6 || t * h / n < 1);
          var S = t * h, hele = Math.ceil(S / n);
          return { vraag:br(t, n) + ' ' + X + ' ' + h,
            beeld:function(k){ var sp = []; for (var i = 0; i < h; i++) sp.push({ van:i * t, naar:(i + 1) * t, tekst:i === 0 ? '+' + br(t, n) : '', kleur:i % 2 }); return blijn({ n:n, hele:hele, sprongen:sp, stip:k >= 2 ? S : null }); },
            stappen:[
              { tekst:'Doe de teller keer ' + h + ': ' + t + ' ' + X + ' ' + h + ' =', antwoord:String(S), hint:'Alleen de teller. De noemer blijft ' + n + '.', fout:F(n * h, 'Je deed de noemer keer ' + h + '. Doe de teller keer ' + h + '.') },
              { tekst:'Je hebt ' + br(S, n) + '. Zo eenvoudig mogelijk:', antwoord:bvar(S, n, true), hint:'Hoe vaak past ' + n + ' in ' + S + '? Dat zijn de helen.' } ] };
        } },
      { id:'breuk-keer-breuk', naam:'Breuk keer breuk', kort:'Teller keer teller en noemer keer noemer',
        uit:'<p>Twee breuken vermenigvuldig je zo: <b>teller keer teller</b> en <b>noemer keer noemer</b>.</p><p>2/3 ' + X + ' 3/5: 2 ' + X + ' 3 = 6 en 3 ' + X + ' 5 = 15. Dat is 6/15 = <b>2/5</b>.</p><p>Je hoeft de noemers niet gelijk te maken. Dat is alleen bij optellen en aftrekken nodig.</p>',
        wanneer:'je twee breuken met elkaar vermenigvuldigt.',
        maak:function(R){
          var b = R.heel(2, 7), d = R.heel(2, 7), a = R.heel(1, b - 1), c = R.heel(1, d - 1), Tt = a * c, Nn = b * d;
          return { vraag:br(a, b) + ' ' + X + ' ' + br(c, d),
            stappen:[
              { tekst:'Teller keer teller: ' + a + ' ' + X + ' ' + c + ' =', antwoord:String(Tt), hint:'De getallen boven de streep: ' + a + ' en ' + c + '.' },
              { tekst:'Noemer keer noemer: ' + b + ' ' + X + ' ' + d + ' =', antwoord:String(Nn), hint:'De getallen onder de streep: ' + b + ' en ' + d + '.', fout:F(kgv(b, d) !== Nn ? kgv(b, d) : null, 'Hier maak je niet gelijknamig. Doe gewoon ' + b + ' ' + X + ' ' + d + '.') },
              { tekst:ggd(Tt, Nn) > 1 ? 'Dat is ' + br(Tt, Nn) + '. Zo eenvoudig mogelijk:' : 'Dus ' + br(a, b) + ' ' + X + ' ' + br(c, d) + ' =', antwoord:bvar(Tt, Nn), hint:ggd(Tt, Nn) > 1 ? 'Deel teller en noemer door ' + ggd(Tt, Nn) + '.' : 'Teller ' + Tt + ', noemer ' + Nn + '.' } ] };
        } },
      { id:'breuk-deel-van-deel', naam:'Deel van een deel', kort:'Kleur eerst de ene breuk, neem daar de andere breuk van en tel de hokjes',
        uit:'<p>2/3 van 3/4: wat betekent dat? Teken een rechthoek. Kleur <b>3/4</b>: verdeel in 4 stroken en kleur er 3.</p><p>Verdeel de rechthoek nu ook in <b>3 rijen</b>. Neem 2 van de 3 rijen van het gekleurde stuk. Die hokjes zijn dubbel gekleurd: 6 van de 12. Dus 2/3 van 3/4 = 6/12 = <b>1/2</b>.</p><p>Dat is hetzelfde als 2/3 ' + X + ' 3/4.</p>',
        wanneer:'je wilt zien waarom breuk keer breuk werkt, of bij een vraag als "de helft van 3/4".',
        maak:function(R){
          var b = R.heel(2, 5), d = R.heel(2, 4), a = R.heel(1, b - 1), c = R.heel(1, d - 1);
          return { vraag:br(c, d) + ' van ' + br(a, b),
            beeld:function(k){ return deelVanDeel(b, a, d, c, k); },
            stappen:[
              { tekst:'Je ziet ' + br(a, b) + ': ' + a + ' van de ' + b + ' stroken gekleurd. Verdeel de rechthoek nu ook in ' + d + ' rijen. Hoeveel hokjes zijn er in totaal?', antwoord:String(b * d), hint:b + ' stroken en ' + d + ' rijen: ' + b + ' ' + X + ' ' + d + '.' },
              { tekst:'Neem ' + c + ' van de ' + d + ' rijen van het gekleurde stuk. Hoeveel hokjes zijn dubbel gekleurd?', antwoord:String(a * c), hint:a + ' stroken breed en ' + c + ' rijen hoog: ' + a + ' ' + X + ' ' + c + '.' },
              { tekst:'Dus ' + br(c, d) + ' van ' + br(a, b) + ' =', antwoord:[br(a * c, b * d)].concat(bvar(a * c, b * d)), hint:'Dubbel gekleurde hokjes boven de streep, alle hokjes eronder: ' + br(a * c, b * d) + '.' } ] };
        } },
      { id:'breuk-delen', naam:'Delen door een breuk', kort:'Hoe vaak past de breuk erin? Tel eerst hoe vaak 1/n past, deel dan door de teller',
        uit:'<p>3 : 1/4 betekent: <b>hoe vaak past 1/4 in 3</b>?</p><p>In 1 heel past 1/4 vier keer. In 3 helen dus 3 ' + X + ' 4 = <b>12</b> keer.</p><p>3 : 3/4? 3/4 is drie keer zo groot als 1/4. Dan past het drie keer minder vaak: 12 : 3 = <b>4</b>.</p>',
        wanneer:'je wilt weten hoeveel porties van een breuk ergens in passen, zoals glazen van 1/4 liter uit een fles.',
        maak:function(R){
          var a, n, t; do { a = R.heel(2, 6); n = R.heel(2, 6); t = R.heel(1, n - 1); } while (ggd(t, n) !== 1 || (a * n) % t !== 0 || a * n > 36);
          var keer = a * n / t;
          var st = [
            { tekst:'Hoe vaak past 1/' + n + ' in 1 heel?', antwoord:String(n), hint:'In 1 heel zitten ' + n + ' stukjes van 1/' + n + '.' },
            { tekst:'Hoe vaak past 1/' + n + ' in ' + a + ' helen? ' + a + ' ' + X + ' ' + n + ' =', antwoord:String(a * n), hint:'Elke heel geeft ' + n + ' stukjes.' } ];
          if (t > 1) st.push({ tekst:br(t, n) + ' is ' + t + ' keer zo groot als 1/' + n + '. Dus ' + (a * n) + ' : ' + t + ' =', antwoord:String(keer), hint:'Een groter stuk past minder vaak. Deel door ' + t + '.', fout:F(a * n * t, 'Een groter stuk past juist minder vaak. Deel door ' + t + '.') });
          return { vraag:a + ' : ' + br(t, n),
            beeld:function(k){ var sp = []; if (k >= st.length) for (var i = 0; i < keer; i++) sp.push({ van:i * t, naar:(i + 1) * t, kleur:i % 2 }); return blijn({ n:n, hele:a, sprongen:sp }); },
            stappen:st };
        } },
      { id:'breuk-reken-kies', naam:'Rekenen met breuken: kies de juiste manier', kort:'Kijk eerst wat voor som het is, dan weet je welke manier je nodig hebt',
        uit:'<p>Bij breuken hangt de manier af van de som.</p><p><b>Plus of min met gelijke noemers</b>: tel alleen de tellers op of af. <b>Plus of min met ongelijke noemers</b>: eerst gelijknamig maken. <b>Keer</b>: teller keer teller, noemer keer noemer. <b>Gedeeld door</b> een breuk: hoe vaak past de breuk erin?</p>',
        wanneer:'je een som met breuken krijgt en eerst moet bedenken hoe je hem aanpakt.',
        maak:function(R){
          var soort = R.heel(0, 3), M = ['alleen de tellers optellen of aftrekken', 'eerst gelijknamig maken', 'teller keer teller, noemer keer noemer', 'kijken hoe vaak de breuk erin past'], vraag, st;
          if (soort === 0){ var n = R.heel(3, 12), a = R.heel(1, n - 1), c; do { c = R.heel(1, n - 1); } while (c === a); var S = a + c;
            vraag = br(a, n) + ' + ' + br(c, n);
            st = [ { tekst:'Tel de tellers op: ' + a + ' + ' + c + ' =', antwoord:String(S), hint:'De noemer ' + n + ' blijft.' },
                   { tekst:'Dus ' + vraag + ' =', antwoord:[br(S, n)].concat(bvar(S, n, true)), hint:'Teller ' + S + ', noemer ' + n + '.' } ]; }
          else if (soort === 1){ var p = paarOngelijk(R), L = p.L, a2 = p.a * L / p.b, c2 = p.c * L / p.d, S2 = p.min ? a2 - c2 : a2 + c2;
            vraag = br(p.a, p.b) + (p.min ? ' ' + MIN + ' ' : ' + ') + br(p.c, p.d);
            st = [ { tekst:'Maak gelijknamig: ' + br(p.a, p.b) + ' = …/' + L + ' en ' + br(p.c, p.d) + ' = …/' + L + '. Hoe groot is de eerste teller?', antwoord:String(a2), hint:'De kleinste noemer waar ' + p.b + ' en ' + p.d + ' in passen is ' + L + '. ' + p.a + ' ' + X + ' ' + (L / p.b) + '.' },
                   { tekst:br(a2, L) + (p.min ? ' ' + MIN + ' ' : ' + ') + br(c2, L) + ' =', antwoord:[br(S2, L)].concat(bvar(S2, L, true)), hint:br(p.c, p.d) + ' = ' + br(c2, L) + '. Reken nu met de tellers.' } ]; }
          else if (soort === 2){ var b = R.heel(2, 6), d = R.heel(2, 6), a3 = R.heel(1, b - 1), c3 = R.heel(1, d - 1);
            vraag = br(a3, b) + ' ' + X + ' ' + br(c3, d);
            st = [ { tekst:'Teller keer teller: ' + a3 + ' ' + X + ' ' + c3 + ' =', antwoord:String(a3 * c3), hint:'Boven de streep.' },
                   { tekst:'Noemer keer noemer geeft ' + (b * d) + '. Dus ' + vraag + ' =', antwoord:bvar(a3 * c3, b * d), hint:br(a3 * c3, b * d) + ', en vereenvoudig als het kan.' } ]; }
          else { var aa, nn, tt; do { aa = R.heel(2, 6); nn = R.heel(2, 6); tt = R.heel(1, nn - 1); } while (ggd(tt, nn) !== 1 || (aa * nn) % tt !== 0);
            vraag = aa + ' : ' + br(tt, nn);
            st = [ { tekst:'Hoe vaak past 1/' + nn + ' in ' + aa + '? ' + aa + ' ' + X + ' ' + nn + ' =', antwoord:String(aa * nn), hint:'In 1 heel past 1/' + nn + ' precies ' + nn + ' keer.' },
                   { tekst:tt > 1 ? 'En ' + br(tt, nn) + ' past ' + tt + ' keer minder vaak: ' + (aa * nn) + ' : ' + tt + ' =' : 'Dus ' + vraag + ' =', antwoord:String(aa * nn / tt), hint:tt > 1 ? 'Deel door de teller ' + tt + '.' : 'Dat had je net al uitgerekend.' } ]; }
          var hint = ['Kijk naar de noemers: zijn ze gelijk? En is het plus of min?', 'Plus of min, en de noemers zijn verschillend.', 'Het is een keersom.', 'Het is een deelsom met een breuk.'][soort];
          return { vraag:vraag, stappen:[kz('Welke manier heb je hier nodig?', M, M[soort], hint)].concat(st) };
        } }
    ] });

  /* ---------- 6. Procenten berekenen (2F) ---------- */
  var PKOP = ['procent', 'bedrag'];
  function stap1procent(H, p){
    var e = H / 100;
    return [ { tekst:'Eerst 1%: ' + tn(H) + ' : 100 =', antwoord:tn(e), hint:'Gedeeld door 100: de komma schuift twee plaatsen naar links.', fout:F(tn(H / 10), 'Dat is 10%. Voor 1% deel je door 100.') },
             { tekst:p + '% is ' + p + ' keer zoveel: ' + p + ' ' + X + ' ' + tn(e) + ' =', antwoord:tn(e * p), hint:'Reken ' + p + ' ' + X + ' ' + tn(e) + '. Splits als het moet.' } ];
  }
  function stap10procent(H, p){
    var t = H / 10, k = Math.floor(p / 10), vijf = p % 10 === 5;
    var st = [ { tekst:'Eerst 10%: ' + tn(H) + ' : 10 =', antwoord:tn(t), hint:'Gedeeld door 10: de komma schuift een plaats naar links.', fout:F(tn(H / 100), 'Dat is 1%. Voor 10% deel je door 10.') } ];
    if (vijf) st.push({ tekst:'5% is de helft van 10%: ' + tn(t) + ' : 2 =', antwoord:tn(t / 2), hint:'De helft van ' + tn(t) + '.' });
    if (!vijf) st.push({ tekst:p + '% is ' + k + ' keer 10%: ' + k + ' ' + X + ' ' + tn(t) + ' =', antwoord:tn(t * k), hint:'Reken ' + k + ' ' + X + ' ' + tn(t) + '.' });
    else st.push({ tekst:p + '% = ' + (k > 1 ? k + ' ' + X + ' ' : '') + '10% + 5% = ' + (k > 1 ? k + ' ' + X + ' ' + tn(t) : tn(t)) + ' + ' + tn(t / 2) + ' =', antwoord:tn(H * p / 100), hint:(k > 1 ? k + ' ' + X + ' ' + tn(t) + ' = ' + tn(k * t) + '. ' : '') + 'Tel ' + tn(t / 2) + ' erbij.' });
    return st;
  }
  var DINGEN = ['een jas', 'een fiets', 'een spelcomputer', 'een paar sneakers', 'een koptelefoon', 'een tent', 'een skateboard', 'een telefoon'];
  function prijsZin(R, P, p){ return R.kies(DINGEN).replace(/^./, function(c){ return c.toUpperCase(); }) + ' kost ' + ec(P * 100) + '. Je krijgt ' + p + '% korting.'; }
  function procKeuzeOpgave(R){
    var soort = R.heel(0, 2), p, H;
    if (soort === 0){ p = R.kies([3, 4, 6, 7, 8, 9, 11, 12, 13]); H = R.heel(2, 15) * 100; }
    else if (soort === 1){ p = R.kies([30, 70, 90]); do { H = R.heel(3, 90) * 10; } while (H % 100 === 0); }
    else { p = R.kies([25, 75]); do { H = R.heel(3, 40) * 4; } while (H % 10 === 0); }
    var st = soort === 0 ? stap1procent(H, p) : soort === 1 ? stap10procent(H, p) : [
      { tekst:p + '% is ' + br(p / 25, 4) + '. Eerst 1/4: ' + H + ' : 4 =', antwoord:String(H / 4), hint:'Deel door 4, of halveer twee keer.' } ].concat(p === 75 ? [{ tekst:'3/4 is 3 keer zoveel: 3 ' + X + ' ' + (H / 4) + ' =', antwoord:String(H * 3 / 4), hint:'Drie keer ' + (H / 4) + '.' }] : []);
    return { p:p, H:H, soort:soort, st:st };
  }

  G.push({ groep:{ id:'proc-reken', niveau:'2F', domein:'verhoudingen', naam:'Procenten berekenen',
      uit:'Elk procent van elk bedrag: met de 1%- of 10%-methode, de procentenstrook, de verhoudingstabel, een breuk of een factor. En: hoeveel procent is het, korting en btw.' },
    doelen:[
      { id:'proc-1methode', naam:'De 1%-methode', kort:'Reken eerst 1% uit en doe dat keer het aantal procent',
        uit:'<p>7% van 300? Reken eerst <b>1%</b> uit: 300 : 100 = 3.</p><p>7% is 7 keer zoveel: 7 ' + X + ' 3 = <b>21</b>.</p><p>Met deze methode kun je elk procent uitrekenen.</p>',
        wanneer:'het procent een lastig getal is, zoals 3%, 7% of 12%, en het bedrag een rond honderdtal.',
        maak:function(R){
          var p = R.kies([3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 23, 24]), H = R.kies([R.heel(2, 15) * 100, R.heel(3, 19) * 50]);
          var cols = [{ b:'100%', o:tn(H) }, { b:'1%', o:tn(H / 100), toon:1, vul:1, pijl:':100' }, { b:p + '%', o:tn(H * p / 100), vul:2, pijl:X + p, eind:1 }];
          return { vraag:p + '% van ' + tn(H), beeld:function(k){ return vtab(['procent', 'getal'], cols, k); }, stappen:stap1procent(H, p) };
        } },
      { id:'proc-10methode', naam:'De 10%-methode', kort:'Reken eerst 10% uit en bouw daarmee het procent op',
        uit:'<p>30% van 70? Reken eerst <b>10%</b> uit: 70 : 10 = 7. 30% is 3 keer zoveel: 3 ' + X + ' 7 = <b>21</b>.</p><p>15% van 80? 10% = 8. 5% is de helft daarvan: 4. Samen: 8 + 4 = <b>12</b>.</p>',
        wanneer:'het procent een veelvoud is van 10 of 5, zoals 30%, 15% of 45%.',
        maak:function(R){
          var p = R.kies([20, 30, 40, 60, 70, 80, 90, 15, 35, 45, 15, 35]), H = p % 10 ? R.heel(2, 30) * 20 : R.kies([R.heel(3, 90) * 10, R.heel(11, 99)]);
          var st = stap10procent(H, p), cols = [{ b:'100%', o:tn(H) }, { b:'10%', o:tn(H / 10), toon:1, vul:1, pijl:':10' }];
          if (p % 10) cols.push({ b:'5%', o:tn(H / 20), toon:2, vul:2, pijl:':2' });
          cols.push({ b:p + '%', o:tn(H * p / 100), vul:st.length, pijl:p % 10 ? (p > 15 ? Math.floor(p / 10) + ' ' + X + ' 10% + 5%' : '10% + 5%') : X + (p / 10), eind:1 });
          return { vraag:p + '% van ' + tn(H), beeld:function(k){ return vtab(['procent', 'getal'], cols, k); }, stappen:st };
        } },
      { id:'proc-strook', naam:'Met de procentenstrook', kort:'Zet 0% en 100% boven de strook en het bedrag eronder, en lees af wat bij je procent hoort',
        uit:'<p>Een <b>procentenstrook</b> heeft boven de procenten en onder de bedragen. Links 0% en 0, rechts 100% en het hele bedrag.</p><p>40% van € 250: verdeel de strook in 10 stukken van 10%. Eén stuk is € 250 : 10 = € 25. 40% is 4 stukken: 4 ' + X + ' € 25 = <b>€ 100</b>.</p>',
        wanneer:'je wilt zien welk deel je uitrekent, of als het procent mooi op de strook past.',
        maak:function(R){
          var p = R.kies([10, 20, 25, 30, 40, 60, 70, 75, 80, 90]), d = p % 20 === 0 ? 5 : p % 25 === 0 ? 4 : 10, k = p * d / 100, u = R.heel(2, d === 10 ? 40 : 60), H = d * u;
          return { vraag:p + '% van ' + ec(H * 100),
            beeld:function(n){ var onder = []; for (var i = 0; i <= d; i++) onder.push(i === 0 ? '0' : i === d ? tn(H) : n >= 2 ? tn(i * u) : ''); return pstrook(d, n >= 3 ? k : 0, onder); },
            stappen:[
              { tekst:'De strook heeft ' + d + ' stukken. Hoeveel procent is één stuk?', antwoord:pc(100 / d), eenheid:'%', hint:'100% verdeeld over ' + d + ' stukken: 100 : ' + d + '.' },
              { tekst:'Hoeveel euro is één stuk? ' + ec(H * 100) + ' : ' + d + ' =', antwoord:ec(u * 100), hint:'Het hele bedrag verdeeld over ' + d + ' stukken.' },
              { tekst:p + '% is ' + k + (k === 1 ? ' stuk' : ' stukken') + ': ' + k + ' ' + X + ' ' + ec(u * 100) + ' =', antwoord:ec(k * u * 100), hint:'Tel ' + k + ' keer ' + ec(u * 100) + '.' } ] };
        } },
      { id:'proc-tabel', naam:'Met de verhoudingstabel', kort:'Zet 100% boven het hele bedrag en reken in de tabel naar je procent',
        uit:'<p>Zet in een verhoudingstabel <b>100%</b> boven het hele bedrag. Doe boven en onder steeds hetzelfde.</p><p>35% van € 600: 100% is € 600. Gedeeld door 100: 1% is € 6. Keer 35: 35% is <b>€ 210</b>.</p><p>Kies een handige route: via 10%, via 25% of via 1%.</p>',
        wanneer:'je overzicht wilt houden, ook bij lastige procenten.',
        maak:function(R){
          var r = R.heel(0, 2), p, H, mid, deel, keer;
          if (r === 0){ p = R.kies([20, 30, 40, 60, 70, 80, 90]); H = R.heel(3, 60) * 10; mid = 10; }
          else if (r === 1){ p = 75; H = R.heel(5, 60) * 4; mid = 25; }
          else { p = R.kies([3, 6, 7, 12, 13, 18, 35, 45, 65]); H = R.heel(2, 15) * 100; mid = 1; }
          deel = 100 / mid; keer = p / mid;
          var cols = [{ b:'100%', o:ec(H * 100) }, { b:mid + '%', o:ec(H * mid), toon:1, vul:1, pijl:':' + deel }, { b:p + '%', o:ec(H * p), vul:2, pijl:X + keer, eind:1 }];
          return { vraag:p + '% van ' + ec(H * 100), beeld:function(k){ return vtab(PKOP, cols, k); },
            stappen:[
              { tekst:'Van 100% naar ' + mid + '% is gedeeld door ' + deel + '. ' + ec(H * 100) + ' : ' + deel + ' =', antwoord:ec(H * mid), hint:'Doe onder hetzelfde als boven: gedeeld door ' + deel + '.' },
              { tekst:'Van ' + mid + '% naar ' + p + '% is keer ' + keer + '. ' + keer + ' ' + X + ' ' + ec(H * mid) + ' =', antwoord:ec(H * p), hint:'Reken in centen als dat makkelijker is.' } ] };
        } },
      { id:'proc-breuk', naam:'Via een breuk', kort:'Herken het procent als breuk en neem die breuk van het bedrag',
        uit:'<p>Veel procenten zijn een bekende <b>breuk</b>: 25% = 1/4, 20% = 1/5, 75% = 3/4, 12,5% = 1/8.</p><p>75% van 48: 3/4 van 48. Eerst 1/4: 48 : 4 = 12. Dan 3 ' + X + ' 12 = <b>36</b>.</p>',
        wanneer:'het procent een bekende breuk is en het getal daar mooi door deelbaar is.',
        maak:function(R){
          var r = R.kies([[25, 1, 4], [75, 3, 4], [20, 1, 5], [40, 2, 5], [60, 3, 5], [80, 4, 5], [50, 1, 2], [12.5, 1, 8]]), p = r[0], t = r[1], n = r[2], u = R.heel(3, 40), H = n * u;
          var st = [
            { tekst:'Welke breuk is ' + tn(p) + '%?', antwoord:br(t, n), hint:'Denk aan de rijtjes: ' + tn(p) + '% = ' + tn(p / 100) + ' = …', fout:F(tn(p) + '/100', 'Dat klopt, maar met een eenvoudige breuk rekent het makkelijker.') },
            { tekst:'Eerst 1/' + n + ' van ' + H + ': ' + H + ' : ' + n + ' =', antwoord:String(u), hint:'Deel door de noemer ' + n + '.' } ];
          if (t > 1) st.push({ tekst:br(t, n) + ' is ' + t + ' keer zoveel: ' + t + ' ' + X + ' ' + u + ' =', antwoord:String(t * u), hint:'Keer de teller ' + t + '.' });
          return { vraag:tn(p) + '% van ' + H, stappen:st, beeld:function(k){ var onder = []; for (var i = 0; i <= n; i++) onder.push(i === 0 ? '0' : i === n ? String(H) : k >= 2 && i <= t ? String(i * u) : ''); return pstrook(n, k >= 2 ? t : 0, onder); } };
        } },
      { id:'proc-factor', naam:'Met een factor', kort:'Schrijf het procent als kommagetal en vermenigvuldig',
        uit:'<p>35% is 35 honderdsten, dus <b>0,35</b>. Dat getal heet de <b>factor</b>.</p><p>35% van 80 = 0,35 ' + X + ' 80 = <b>28</b>.</p><p>Met een rekenmachine is dit de snelste manier. Zonder rekenmachine: reken 35 ' + X + ' 80 = 2800 en deel door 100.</p>',
        wanneer:'je een rekenmachine mag gebruiken, of bij een lastig procent.',
        maak:function(R){
          var p; do { p = R.heel(11, 95); } while (p % 10 === 0);
          var H = R.heel(4, 60) * 5, f = p / 100;
          return { context:'Je mag een rekenmachine gebruiken.', vraag:p + '% van ' + H,
            stappen:[
              { tekst:p + '% als kommagetal: ' + p + ' : 100 =', antwoord:tn(f), hint:p + ' honderdsten: 0,' + (p < 10 ? '0' : '') + p + '.', fout:F(tn(p / 10), 'Dat zijn tienden. Deel door 100.') },
              { tekst:tn(f) + ' ' + X + ' ' + H + ' =', antwoord:tn(f * H), hint:'Of zonder rekenmachine: ' + p + ' ' + X + ' ' + H + ' = ' + (p * H) + ', en dan gedeeld door 100.' } ] };
        } },
      { id:'proc-hoeveel', naam:'Hoeveel procent is het?', kort:'Deel het deel door het geheel en doe de uitkomst keer 100',
        uit:'<p>18 van de 24 leerlingen fietsen. Hoeveel procent is dat?</p><p>Deel het <b>deel</b> door het <b>geheel</b>: 18 : 24 = 0,75. Doe dat <b>keer 100</b>: 75%.</p><p>Let op: het geheel is altijd waar je het deel mee vergelijkt.</p>',
        wanneer:'je wilt weten welk deel iets is van het geheel, in procenten.',
        maak:function(R){
          var Gh = R.kies([20, 25, 40, 50, 80, 200, 250, 400, 500, 30, 60]), p; do { p = R.heel(1, 99); } while ((p * Gh) % 100 !== 0);
          var d = p * Gh / 100, z = R.kies(['Van de {G} leerlingen komen er {d} met de bus.', 'Je had {d} van de {G} vragen goed.', 'Op een feest zijn {G} gasten. Er dansen er {d}.', 'In een doos zitten {G} knikkers. Er zijn {d} blauw.', 'Van de {G} bezoekers kwamen er {d} met de trein.']);
          return { context:z.replace('{G}', Gh).replace('{d}', d), vraag:d + ' van ' + Gh + ' = …%',
            stappen:[
              { tekst:'Deel : geheel = ' + d + ' : ' + Gh + ' =', antwoord:tn(d / Gh), hint:'Het deel is ' + d + ', het geheel is ' + Gh + '. Maak er eventueel een breuk van: ' + br(d, Gh) + '.', fout:F(tn(Gh / d), 'Je deelde andersom. Het deel gaat door het geheel.') },
              { tekst:'Keer 100: ' + tn(d / Gh) + ' ' + X + ' 100 =', antwoord:pc(p), eenheid:'%', hint:'De komma schuift twee plaatsen naar rechts.' } ] };
        } },
      { id:'proc-hoeveel-tabel', naam:'Hoeveel procent: met een tabel', kort:'Zet het geheel onder 100% en reken in de tabel naar het deel',
        uit:'<p>Hoeveel procent is 12 van 40? Zet 40 onder <b>100%</b> in een verhoudingstabel.</p><p>Gedeeld door 10: <b>10%</b> is 4. 12 is 3 keer 4, dus 3 keer 10% = <b>30%</b>.</p><p>Gaat 10% niet mooi uit, neem dan 1%.</p>',
        wanneer:'het deel een mooi aantal keer 10% of 1% van het geheel is.',
        maak:function(R){
          var tien = R.heel(0, 2) > 0, Gh, k, p, stuk;
          if (tien){ Gh = R.heel(2, 20) * 10; k = R.heel(1, 9); p = k * 10; stuk = Gh / 10; }
          else { Gh = R.heel(2, 9) * 100; do { k = R.heel(2, 49); } while (k % 10 === 0); p = k; stuk = Gh / 100; }
          var d = k * stuk, m = tien ? 10 : 1;
          var cols = [{ b:'100%', o:tn(Gh) }, { b:m + '%', o:tn(stuk), toon:1, vul:1, pijl:':' + (100 / m) }, { b:p + '%', o:tn(d), vulB:3, pijl:X + k, eind:1 }];
          return { context:'Hoeveel procent is ' + d + ' van ' + Gh + '?', vraag:d + ' van ' + Gh + ' = …%', beeld:function(n){ return vtab(['procent', 'aantal'], cols, n); },
            stappen:[
              { tekst:'Onder 100% staat ' + Gh + '. Wat hoort bij ' + m + '%? ' + Gh + ' : ' + (100 / m) + ' =', antwoord:tn(stuk), hint:'Gedeeld door ' + (100 / m) + ', boven en onder.' },
              { tekst:'Hoe vaak past ' + tn(stuk) + ' in ' + d + '? ' + d + ' : ' + tn(stuk) + ' =', antwoord:String(k), hint:'Welk getal keer ' + tn(stuk) + ' is ' + d + '?' },
              { tekst:'Dus ' + d + ' is ' + k + ' ' + X + ' ' + m + '% =', antwoord:pc(p), eenheid:'%', hint:k + ' keer ' + m + '%.' } ] };
        } },
      { id:'proc-korting', naam:'Korting: het bedrag eraf', kort:'Reken de korting uit en trek die van de prijs af',
        uit:'<p>Een jas kost € 80. Je krijgt 25% korting.</p><p>Reken eerst de <b>korting</b> uit: 25% van € 80 = € 20. Trek die van de prijs af: € 80 ' + MIN + ' € 20 = <b>€ 60</b>.</p>',
        wanneer:'je ook wilt weten hoeveel korting je krijgt.',
        maak:function(R){
          var p = R.kies([10, 20, 25, 30, 40, 50, 15, 35]), P = R.heel(4, 60) * 5, K = P * p;
          return { context:prijsZin(R, P, p), vraag:'Wat betaal je?',
            stappen:[
              { tekst:'De korting: ' + p + '% van ' + ec(P * 100) + ' =', antwoord:ec(K), hint:'10% van ' + ec(P * 100) + ' is ' + ec(P * 10) + '. Bouw daarmee ' + p + '% op.' },
              { tekst:'Je betaalt: ' + ec(P * 100) + ' ' + MIN + ' ' + ec(K) + ' =', antwoord:ec(P * 100 - K), hint:'Haal de korting van de prijs af.', fout:FG(K, 'Dat is de korting. Haal die nog van de prijs af.') } ] };
        } },
      { id:'proc-korting-direct', naam:'Korting: direct met de factor', kort:'Bij 30% korting betaal je 70%: doe de prijs keer 0,7',
        uit:'<p>Bij 30% korting betaal je nog <b>70%</b> van de prijs. Je hoeft de korting niet apart uit te rekenen.</p><p>70% = 0,7. Een jas van € 80: 0,7 ' + X + ' € 80 = <b>€ 56</b>.</p>',
        wanneer:'je alleen de nieuwe prijs wilt weten, zeker met een rekenmachine.',
        maak:function(R){
          var p = R.kies([10, 20, 25, 30, 40, 50, 15, 35]), P = R.heel(4, 60) * 5, f = (100 - p) / 100;
          return { context:prijsZin(R, P, p), vraag:'Wat betaal je?',
            stappen:[
              { tekst:'Hoeveel procent betaal je nog? 100% ' + MIN + ' ' + p + '% =', antwoord:pc(100 - p), eenheid:'%', hint:'De korting gaat eraf: 100 ' + MIN + ' ' + p + '.', fout:F(p, 'Dat is de korting. Hoeveel procent betaal je nog?') },
              { tekst:(100 - p) + '% als factor (kommagetal):', antwoord:tn(f), hint:(100 - p) + ' : 100.' },
              { tekst:tn(f) + ' ' + X + ' ' + ec(P * 100) + ' =', antwoord:ec(P * (100 - p)), hint:'Of: ' + (100 - p) + '% van ' + ec(P * 100) + '. 1% is ' + ec(P) + '.', fout:FG(P * p, 'Dat is de korting. Je moet ' + (100 - p) + '% hebben.') } ] };
        } },
      { id:'proc-btw-stap', naam:'Btw erbij: in stappen', kort:'Reken de btw uit en tel die bij de prijs op',
        uit:'<p>In winkels betaal je <b>btw</b>, een belasting. Meestal is dat <b>21%</b>, bij eten en boeken <b>9%</b>.</p><p>Een fiets kost € 400 zonder btw. De btw: 21% van € 400. 1% is € 4, dus 21% is € 84. Met btw: € 400 + € 84 = <b>€ 484</b>.</p><p>Handig: 21% = 10% + 10% + 1%. En 9% = 10% ' + MIN + ' 1%.</p>',
        wanneer:'je wilt zien hoeveel btw je betaalt.',
        maak:function(R){
          var r = R.kies([21, 21, 9]), P = R.kies([R.heel(2, 40) * 10, R.heel(2, 9) * 100]), B = P * r;
          return { context:(r === 21 ? 'Een ' + R.kies(['laptop', 'fiets', 'kast', 'televisie']) : 'Een ' + R.kies(['boodschappentas', 'stapel boeken', 'taart'])) + ' kost ' + ec(P * 100) + ' zonder btw. Er komt ' + r + '% btw bij.', vraag:'Prijs met btw?',
            stappen:[
              { tekst:'De btw: ' + r + '% van ' + ec(P * 100) + ' =', antwoord:ec(B), hint:'1% is ' + ec(P) + '. ' + (r === 21 ? '21% = 10% + 10% + 1%.' : '9% = 10% ' + MIN + ' 1%.') },
              { tekst:'Met btw: ' + ec(P * 100) + ' + ' + ec(B) + ' =', antwoord:ec(P * 100 + B), hint:'Tel de btw bij de prijs op.', fout:FG(B, 'Dat is alleen de btw. Tel hem bij de prijs op.') } ] };
        } },
      { id:'proc-btw-factor', naam:'Btw erbij: met keer 1,21 of 1,09', kort:'Met btw betaal je 121% of 109%: doe de prijs keer 1,21 of 1,09',
        uit:'<p>Met 21% btw betaal je 100% + 21% = <b>121%</b> van de prijs. Als factor is dat <b>1,21</b>.</p><p>€ 400 zonder btw: 1,21 ' + X + ' € 400 = <b>€ 484</b>. Bij 9% btw doe je keer 1,09.</p>',
        wanneer:'je in een keer de prijs met btw wilt uitrekenen, zeker met een rekenmachine.',
        maak:function(R){
          var r = R.kies([21, 21, 9]), P = R.kies([R.heel(2, 40) * 10, R.heel(2, 9) * 100, R.heel(11, 99)]), f = (100 + r) / 100;
          return { context:'Iets kost ' + ec(P * 100) + ' zonder btw. Er komt ' + r + '% btw bij. Je mag een rekenmachine gebruiken.', vraag:'Prijs met btw?',
            stappen:[
              { tekst:'Met btw betaal je 100% + ' + r + '% =', antwoord:pc(100 + r), eenheid:'%', hint:'De prijs zelf plus de btw.' },
              { tekst:'Als factor (kommagetal):', antwoord:tn(f), hint:(100 + r) + ' : 100.', fout:F(tn(r / 100), 'Dat is alleen de btw. Je wilt de prijs met btw: 1 + ' + tn(r / 100) + '.') },
              { tekst:tn(f) + ' ' + X + ' ' + ec(P * 100) + ' =', antwoord:ec(P * (100 + r)), hint:'Zonder rekenmachine: ' + ec(P * 100) + ' + ' + r + '% van ' + ec(P * 100) + '.' } ] };
        } },
      { id:'proc-kies', naam:'Procenten: kies de handigste manier', kort:'Kijk naar het procent en het getal en kies de 1%-methode, de 10%-methode of een breuk',
        uit:'<p>Welke manier het handigst is, zie je aan het <b>procent</b> en het <b>getal</b>.</p><p>Een bekende breuk (25%, 75%) en een getal dat door 4 gaat? <b>Via een breuk</b>. Een veelvoud van 10% (30%, 70%)? <b>De 10%-methode</b>. Een lastig procent (3%, 7%) van een rond honderdtal? <b>De 1%-methode</b>.</p>',
        wanneer:'je een procent moet uitrekenen en snel de handigste weg wilt kiezen.',
        maak:function(R){
          var o = procKeuzeOpgave(R), M = ['de 1%-methode', 'de 10%-methode', 'via een breuk'];
          var hint = ['Het procent is lastig, maar ' + o.H + ' is een rond honderdtal: 1% is makkelijk.', o.p + '% is ' + (o.p / 10) + ' keer 10%.', o.p + '% is een bekende breuk en ' + o.H + ' gaat door 4.'][o.soort];
          return { vraag:o.p + '% van ' + o.H, stappen:[kz('Welke manier is hier het handigst?', M, M[o.soort], hint)].concat(o.st) };
        } }
    ] });

  /* ---------- 7. Verhoudingen vergelijken (2F) ---------- */
  var ING = [['bloem', 'gram', 25], ['suiker', 'gram', 25], ['boter', 'gram', 25], ['pasta', 'gram', 50], ['rijst', 'gram', 50], ['melk', 'ml', 50], ['room', 'ml', 25], ['eieren', '', 1]];
  var NAMEN = [['Sam', 'Noa'], ['Daan', 'Lina'], ['Mo', 'Fleur'], ['Jesse', 'Amira'], ['Bram', 'Yara'], ['Tim', 'Sanne']];
  function tweeNamen(n, x, a, b){ var l = []; for (var i = 0; i <= n; i++) l.push(i === 0 ? a : i === x ? b : ''); return l; }
  function koopStap(naam, w, c, eenh){
    /* prijs per kilo (eenh 'kilo') of per 100 gram (eenh '100') */
    if (eenh === '100'){ var m = w / 100; return { tekst:naam + ': ' + w + ' g is ' + m + ' keer 100 g. Per 100 g: ' + ec(c) + ' : ' + m + ' =', antwoord:ec(c / m), hint:'Deel de prijs door ' + m + '.' }; }
    if (w > 1000){ var k = w / 1000; return { tekst:naam + ': ' + w + ' g is ' + k + ' kilo. Per kilo: ' + ec(c) + ' : ' + k + ' =', antwoord:ec(c / k), hint:'Deel de prijs door ' + k + '.' }; }
    var f = 1000 / w; return { tekst:naam + ': ' + w + ' g past ' + f + ' keer in een kilo. Per kilo: ' + f + ' ' + X + ' ' + ec(c) + ' =', antwoord:ec(c * f), hint:'1 kilo is 1000 g. Doe de prijs keer ' + f + '.' };
  }
  function koopOpgave(R, soort){
    /* soort: 0 per stuk, 1 per kilo, 2 per 100 g */
    var A, B, cA, cB, pA, pB, ctx, stA, stB, prod;
    do { pA = soort === 1 ? R.heel(20, 75) * 20 : R.heel(5, 40) * 5; pB = soort === 1 ? R.heel(20, 75) * 20 : R.heel(5, 40) * 5; } while (pA === pB);
    if (soort === 0){
      prod = R.kies([['ei', 'eieren'], ['pen', 'pennen'], ['batterij', 'batterijen'], ['reep', 'repen'], ['broodje', 'broodjes']]);
      do { A = R.kies([3, 4, 5, 6, 8, 10, 12]); B = R.kies([3, 4, 5, 6, 8, 10, 12]); } while (A === B);
      cA = A * pA; cB = B * pB;
      ctx = 'Pak A: ' + A + ' ' + prod[1] + ' voor ' + ec(cA) + '. Pak B: ' + B + ' ' + prod[1] + ' voor ' + ec(cB) + '.';
      stA = { tekst:'Pak A per stuk: ' + ec(cA) + ' : ' + A + ' =', antwoord:ec(pA), hint:'Reken in centen: ' + cA + ' : ' + A + '.' };
      stB = { tekst:'Pak B per stuk: ' + ec(cB) + ' : ' + B + ' =', antwoord:ec(pB), hint:'Reken in centen: ' + cB + ' : ' + B + '.' };
    } else {
      prod = R.kies(['kaas', 'koffie', 'noten', 'druiven', 'gehakt', 'drop']);
      if (soort === 1){ var W = [250, R.kies([500, 2000, 200])]; if (R.heel(0, 1)) W.reverse(); A = W[0]; B = W[1]; }
      else { do { A = R.kies([200, 300, 400, 600, 700, 800, 900]); B = R.kies([200, 300, 400, 600, 700, 800, 900]); } while (A === B || (A % 300 !== 0 && B % 300 !== 0 && A % 700 !== 0 && B % 700 !== 0)); }
      var per = soort === 1 ? 1000 : 100;
      cA = pA * A / per; cB = pB * B / per;
      ctx = 'Pak A: ' + A + ' g ' + prod + ' voor ' + ec(cA) + '. Pak B: ' + B + ' g ' + prod + ' voor ' + ec(cB) + '.';
      stA = koopStap('Pak A', A, cA, soort === 1 ? 'kilo' : '100'); stB = koopStap('Pak B', B, cB, soort === 1 ? 'kilo' : '100');
    }
    var best = pA < pB ? 'pak A' : 'pak B';
    return { ctx:ctx, st:[stA, stB, kz('Welk pak is de beste koop?', ['pak A', 'pak B', 'ze zijn even duur'], best, 'Vergelijk ' + ec(pA) + ' en ' + ec(pB) + '. Het laagste bedrag is de beste koop.', { fout:F(best === 'pak A' ? 'pak B' : 'pak A', 'Dat pak is per ' + (soort === 0 ? 'stuk' : soort === 1 ? 'kilo' : '100 gram') + ' juist duurder.') })] };
  }

  G.push({ groep:{ id:'verh-vergelijk', niveau:'2F', domein:'verhoudingen', naam:'Verhoudingen vergelijken',
      uit:'Recepten omrekenen, verdelen in een verhouding, mengsels, en de beste koop: per stuk, per kilo of per 100 gram.' },
    doelen:[
      { id:'verh-recept', naam:'Recepten omrekenen', kort:'Reken met een verhoudingstabel van het aantal personen in het recept naar het aantal dat je nodig hebt',
        uit:'<p>Een recept voor 4 personen gebruikt 300 g pasta. Je kookt voor 6 personen.</p><p>Zet het in een <b>verhoudingstabel</b>. 4 en 6 passen allebei in de tafel van 2. Ga eerst naar <b>2 personen</b>: 300 : 2 = 150 g. Dan naar 6: 3 ' + X + ' 150 = <b>450 g</b>.</p>',
        wanneer:'je een recept voor meer of minder personen wilt maken.',
        maak:function(R){
          var pr = R.kies([[4, 6], [4, 10], [6, 4], [6, 9], [8, 12], [6, 10], [8, 6], [10, 4], [9, 6], [3, 5], [2, 5], [4, 3], [10, 15], [12, 8]]), a = pr[0], b = pr[1], g = ggd(a, b);
          var ing = R.kies(ING), u = ing[2] === 1 ? R.heel(1, 3) : R.heel(2, 10) * ing[2], X1 = a / g * u, Y = b / g * u, e = ing[1];
          var kop = ['personen', ing[0] + (e ? ' (' + e + ')' : '')];
          var cols = [{ b:a, o:tn(X1) }, { b:g, o:tn(u), toon:1, vul:1, pijl:':' + (a / g) }, { b:b, o:tn(Y), vul:2, pijl:X + (b / g), eind:1 }];
          return { context:'Een recept voor ' + a + ' personen gebruikt ' + tn(X1) + (e ? ' ' + e + ' ' : ' ') + ing[0] + '.', vraag:'Hoeveel voor ' + b + ' personen?',
            beeld:function(k){ return vtab(kop, cols, k); },
            stappen:[
              { tekst:'Eerst naar ' + g + (g === 1 ? ' persoon' : ' personen') + ': ' + tn(X1) + ' : ' + (a / g) + ' =', antwoord:e ? met(u, e) : String(u), eenheid:e, hint:g === 1 ? 'Ga terug naar 1 persoon: deel door ' + a + '.' : a + ' en ' + b + ' passen allebei in de tafel van ' + g + '. Deel door ' + (a / g) + '.' },
              { tekst:'Dan naar ' + b + ' personen: ' + (b / g) + ' ' + X + ' ' + tn(u) + ' =', antwoord:e ? met(Y, e) : String(Y), eenheid:e, hint:'Van ' + g + ' naar ' + b + ' is keer ' + (b / g) + '.' } ] };
        } },
      { id:'verh-verdelen', naam:'Verdelen in een verhouding', kort:'Tel de delen op, reken uit wat één deel is en neem het aantal delen dat iemand krijgt',
        uit:'<p>Sam en Noa verdelen € 120 in de verhouding <b>2 : 3</b>. Sam krijgt 2 delen, Noa 3 delen.</p><p>Samen zijn dat <b>5 delen</b>. Eén deel is € 120 : 5 = € 24. Noa krijgt 3 ' + X + ' € 24 = <b>€ 72</b>. Sam krijgt 2 ' + X + ' € 24 = € 48.</p>',
        wanneer:'iets niet eerlijk in gelijke stukken, maar in een verhouding verdeeld wordt.',
        maak:function(R){
          var x, y; do { x = R.heel(1, 5); y = R.heel(1, 5); } while (x === y || ggd(x, y) !== 1);
          var u = R.heel(3, 40), Tt = (x + y) * u, nm = R.kies(NAMEN), wie = R.heel(0, 1), k = wie ? y : x;
          return { context:nm[0] + ' en ' + nm[1] + ' verdelen ' + ec(Tt * 100) + ' in de verhouding ' + x + ' : ' + y + '.', vraag:'Hoeveel krijgt ' + nm[wie] + '?',
            beeld:function(n){ var onder = []; for (var i = 0; i <= x + y; i++) onder.push(i === 0 ? '0' : i === x + y ? tn(Tt) : n >= 2 ? tn(i * u) : ''); return T.teken.strook(x + y, x, { boven:tweeNamen(x + y, x, nm[0], nm[1]), onder:onder }); },
            stappen:[
              { tekst:'Hoeveel delen zijn het samen? ' + x + ' + ' + y + ' =', antwoord:String(x + y), hint:nm[0] + ' krijgt ' + x + ' delen en ' + nm[1] + ' ' + y + '.' },
              { tekst:'Eén deel: ' + ec(Tt * 100) + ' : ' + (x + y) + ' =', antwoord:ec(u * 100), hint:'Deel het hele bedrag door het aantal delen samen.', fout:FG(Tt * 100 / k, 'Deel door alle delen samen, niet alleen door de delen van ' + nm[wie] + '.') },
              { tekst:nm[wie] + ' krijgt ' + k + (k === 1 ? ' deel' : ' delen') + ': ' + k + ' ' + X + ' ' + ec(u * 100) + ' =', antwoord:ec(k * u * 100), hint:k + ' keer ' + ec(u * 100) + '.' } ] };
        } },
      { id:'verh-mengsel', naam:'Verhoudingen in een mengsel', kort:'Tel de delen op, reken uit hoeveel één deel is en neem de delen die je zoekt',
        uit:'<p>Limonade maak je met <b>1 deel siroop op 5 delen water</b>. Je wilt 1,2 liter limonade.</p><p>Samen zijn dat 6 delen. 1,2 liter = 1200 ml. Eén deel is 1200 : 6 = 200 ml. Siroop is 1 deel: <b>200 ml</b>. Water is 5 delen: 1000 ml.</p>',
        wanneer:'je iets mengt in een vaste verhouding, zoals limonade, verf of beton.',
        maak:function(R){
          var mx = R.kies([['limonade', 'siroop', 'water', 1, R.heel(4, 9)], ['groene verf', 'blauwe verf', 'gele verf', R.kies([2, 3]), R.kies([3, 5])], ['ijsthee', 'thee', 'sap', R.kies([2, 3]), 1], ['saus', 'olie', 'azijn', 3, 1]]);
          var a = mx[3], b = mx[4]; if (a === b) b = a + 1;
          var D = a + b, u = R.kies([50, 100, 150, 200, 250]), ml = D * u, liter = ml % 100 === 0 && R.heel(0, 1), wie = R.heel(0, 1), k = wie ? b : a, naam = wie ? mx[2] : mx[1];
          var st = [ { tekst:'Hoeveel delen zijn het samen? ' + a + ' + ' + b + ' =', antwoord:String(D), hint:a + ' ' + (a === 1 ? 'deel' : 'delen') + ' ' + mx[1] + ' en ' + b + ' ' + (b === 1 ? 'deel' : 'delen') + ' ' + mx[2] + '.' } ];
          if (liter) st.push({ tekst:tn(ml / 1000) + ' liter = … ml', antwoord:met(ml, 'ml'), eenheid:'ml', hint:'1 liter is 1000 ml. Doe keer 1000.' });
          st.push({ tekst:'Eén deel: ' + ml + ' ml : ' + D + ' =', antwoord:met(u, 'ml'), eenheid:'ml', hint:'Deel de hele hoeveelheid door ' + D + '.', fout:F(ml / k === Math.round(ml / k) && k !== D ? ml / k : null, 'Deel door alle delen samen.') });
          st.push({ tekst:mx[1 + wie].replace(/^./, function(c){ return c.toUpperCase(); }) + ' is ' + k + (k === 1 ? ' deel' : ' delen') + ': ' + k + ' ' + X + ' ' + u + ' ml =', antwoord:met(k * u, 'ml'), eenheid:'ml', hint:k + ' keer ' + u + ' ml.' });
          return { context:'Je maakt ' + mx[0] + ' met ' + mx[1] + ' en ' + mx[2] + ' in de verhouding ' + a + ' : ' + b + '. Je wilt ' + (liter ? tn(ml / 1000) + ' liter' : ml + ' ml') + ' ' + mx[0] + '.', vraag:'Hoeveel ml ' + naam + '?',
            beeld:T.teken.strook(D, a, { boven:tweeNamen(D, a, mx[1], mx[2]) }), stappen:st };
        } },
      { id:'verh-koop-stuk', naam:'Beste koop: prijs per stuk', kort:'Reken voor elk pak uit wat één stuk kost en vergelijk',
        uit:'<p>Pak A: 6 eieren voor € 1,80. Pak B: 10 eieren voor € 2,70. Welke is de <b>beste koop</b>?</p><p>Reken de <b>prijs per stuk</b> uit. A: € 1,80 : 6 = € 0,30. B: € 2,70 : 10 = € 0,27.</p><p>B is per ei goedkoper, dus B is de beste koop.</p>',
        wanneer:'de pakken een verschillend aantal stuks bevatten.',
        maak:function(R){ var o = koopOpgave(R, 0); return eindKeuze({ context:o.ctx, vraag:'Welk pak is de beste koop?', stappen:o.st }); } },
      { id:'verh-koop-kilo', naam:'Beste koop: prijs per kilo', kort:'Reken voor elk pak uit wat een kilo kost en vergelijk',
        uit:'<p>Pak A: 250 g kaas voor € 3,20. Pak B: 500 g voor € 5,90.</p><p>Reken de <b>prijs per kilo</b> uit. 250 g past 4 keer in een kilo: 4 ' + X + ' € 3,20 = € 12,80. 500 g past 2 keer: 2 ' + X + ' € 5,90 = € 11,80.</p><p>B is per kilo goedkoper: de beste koop.</p>',
        wanneer:'de gewichten mooi in een kilo passen, zoals 200 g, 250 g, 500 g of 2 kilo.',
        maak:function(R){ var o = koopOpgave(R, 1); return eindKeuze({ context:o.ctx, vraag:'Welk pak is de beste koop?', stappen:o.st }); } },
      { id:'verh-koop-100g', naam:'Beste koop: prijs per 100 gram', kort:'Reken voor elk pak uit wat 100 gram kost en vergelijk',
        uit:'<p>Pak A: 300 g noten voor € 2,70. Pak B: 700 g voor € 6,65.</p><p>Deze gewichten passen niet mooi in een kilo. Reken daarom de <b>prijs per 100 gram</b> uit. A: € 2,70 : 3 = € 0,90. B: € 6,65 : 7 = € 0,95.</p><p>A is per 100 g goedkoper: de beste koop.</p>',
        wanneer:'de gewichten honderdtallen zijn die niet mooi in een kilo passen, zoals 300 g of 700 g.',
        maak:function(R){ var o = koopOpgave(R, 2); return eindKeuze({ context:o.ctx, vraag:'Welk pak is de beste koop?', stappen:o.st }); } },
      { id:'verh-koop-kies', naam:'Beste koop: kies de handigste manier', kort:'Kijk naar de verpakkingen en kies: per stuk, per kilo of per 100 gram',
        uit:'<p>Bij de beste koop kies je eerst <b>waarmee</b> je vergelijkt.</p><p>Tel je stuks, zoals eieren? Dan <b>per stuk</b>. Gewichten als 250 g en 500 g? Die passen mooi in een kilo: <b>per kilo</b>. Gewichten als 300 g en 700 g? Dan <b>per 100 gram</b>.</p>',
        wanneer:'je in de winkel twee verpakkingen wilt vergelijken.',
        maak:function(R){
          var soort = R.heel(0, 2), o = koopOpgave(R, soort), M = ['prijs per stuk', 'prijs per kilo', 'prijs per 100 gram'];
          var hint = ['De pakken bevatten stuks, geen grammen.', 'Kijk of de gewichten mooi in 1000 g passen.', 'Passen de gewichten mooi in 1000 g? Nee, maar het zijn wel honderdtallen.'][soort];
          return eindKeuze({ context:o.ctx, vraag:'Welk pak is de beste koop?', stappen:[kz('Hoe vergelijk je hier het handigst?', M, M[soort], hint)].concat(o.st) });
        } }
    ] });

  /* ---------- 8. Schaal (2F) ---------- */
  function schaalVar(S){ return ['1 : ' + sp(S), '1:' + S, '1:' + tn(S), String(S)]; }
  G.push({ groep:{ id:'schaal-basis', niveau:'2F', domein:'verhoudingen', naam:'Schaal',
      uit:'Wat een schaal betekent, rekenen van de kaart naar het echt en terug, de schaal zelf berekenen, de schaallijn gebruiken en rekenen met een verhoudingstabel.' },
    doelen:[
      { id:'schaal-betekenis', naam:'Wat schaal betekent', kort:'Schaal 1 : 100 betekent: 1 cm op de kaart is 100 cm in het echt',
        uit:'<p>Een kaart of plattegrond is een verkleining. De <b>schaal</b> zegt hoeveel.</p><p>Schaal <b>1 : 100</b> betekent: 1 cm op de tekening is <b>100 cm</b> in het echt. Dat is 1 meter.</p><p>Schaal 1 : 50 000 betekent: 1 cm op de kaart is 50 000 cm. Dat is 500 meter.</p>',
        wanneer:'je een kaart of plattegrond leest.',
        maak:function(R){
          var S = R.kies([50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 25000, 50000, 100000, 200000]), km = S >= 100000;
          var st = [
            { tekst:'1 cm op de kaart is … cm in het echt', antwoord:spv(S), eenheid:'cm', hint:'Het getal achter de 1 : zegt het al.' },
            { tekst:'In meter: ' + sp(S) + ' cm : 100 =', antwoord:met(S / 100, 'm'), eenheid:'m', hint:'100 cm is 1 m. Deel door 100.', fout:F(tn(S / 1000), 'Je deelde door 1000. Van cm naar m deel je door 100.') } ];
          if (km) st.push({ tekst:'In kilometer: ' + sp(S / 100) + ' m : 1000 =', antwoord:met(S / 100000, 'km'), eenheid:'km', hint:'1000 m is 1 km.' });
          return { context:'1 cm op de kaart is hoeveel ' + (km ? 'kilometer' : 'meter') + ' in het echt?', vraag:'Schaal 1 : ' + sp(S), stappen:st };
        } },
      { id:'schaal-naar-echt', naam:'Van kaart naar werkelijkheid', kort:'Doe de afstand op de kaart keer de schaal en reken de cm om naar m of km',
        uit:'<p>Op een kaart met schaal 1 : 50 000 meet je 4,5 cm.</p><p>In het echt is dat <b>keer de schaal</b>: 4,5 ' + X + ' 50 000 = 225 000 cm. Reken dat om: 225 000 cm = 2250 m = <b>2,25 km</b>.</p><p>Omrekenen: van cm naar m deel je door 100, van m naar km door 1000.</p>',
        wanneer:'je een afstand op een kaart of plattegrond meet en wilt weten hoe ver het echt is.',
        maak:function(R){
          var kaart = R.heel(0, 1), S = kaart ? R.kies([10000, 25000, 50000, 100000, 200000]) : R.kies([50, 100, 200]);
          var d = kaart ? R.kies([1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 12]) : R.heel(4, 30) / 2, cm = d * S;
          var st = [
            { tekst:tn(d) + ' cm ' + X + ' ' + sp(S) + ' =', antwoord:spv(cm), eenheid:'cm', hint:'Doe ' + tn(d) + ' keer ' + sp(S) + '.' },
            { tekst:'In meter: ' + sp(cm) + ' cm : 100 =', antwoord:met(cm / 100, 'm'), eenheid:'m', hint:'Van cm naar m: deel door 100.' } ];
          if (kaart) st.push({ tekst:'In kilometer: ' + sp(cm / 100) + ' m : 1000 =', antwoord:met(cm / 100000, 'km'), eenheid:'km', hint:'Van m naar km: deel door 1000.' });
          return { context:'Op een ' + (kaart ? 'kaart' : 'plattegrond') + ' met schaal 1 : ' + sp(S) + ' meet je ' + tn(d) + ' cm.', vraag:'Hoeveel ' + (kaart ? 'km' : 'm') + ' is dat echt?', stappen:st };
        } },
      { id:'schaal-naar-kaart', naam:'Van werkelijkheid naar kaart', kort:'Reken de echte afstand om naar cm en deel door de schaal',
        uit:'<p>Een fietstocht is 3 km. Hoe lang is die op een kaart met schaal 1 : 50 000?</p><p>Reken eerst om naar <b>cm</b>: 3 km = 3000 m = 300 000 cm. Dan <b>gedeeld door de schaal</b>: 300 000 : 50 000 = <b>6 cm</b>.</p>',
        wanneer:'je iets op een kaart of plattegrond wilt tekenen.',
        maak:function(R){
          var kaart = R.heel(0, 1), S = kaart ? R.kies([25000, 50000, 100000, 200000]) : R.kies([50, 100, 200]), d = R.kies([2, 2.5, 3, 4, 5, 6, 7.5, 8, 10, 12]), cm = d * S;
          var st = kaart ? [
            { tekst:tn(cm / 100000) + ' km = … m', antwoord:met(cm / 100, 'm'), eenheid:'m', hint:'1 km is 1000 m.' },
            { tekst:sp(cm / 100) + ' m = … cm', antwoord:spv(cm), eenheid:'cm', hint:'1 m is 100 cm.' } ] : [
            { tekst:tn(cm / 100) + ' m = … cm', antwoord:spv(cm), eenheid:'cm', hint:'1 m is 100 cm.' } ];
          st.push({ tekst:sp(cm) + ' : ' + sp(S) + ' =', antwoord:met(d, 'cm'), eenheid:'cm', hint:'Hoe vaak past ' + sp(S) + ' in ' + sp(cm) + '?' });
          return { context:'In het echt is iets ' + (kaart ? tn(cm / 100000) + ' km' : tn(cm / 100) + ' m') + ' lang. De schaal is 1 : ' + sp(S) + '.', vraag:'Hoeveel cm op de ' + (kaart ? 'kaart' : 'plattegrond') + '?', stappen:st };
        } },
      { id:'schaal-zelf', naam:'De schaal berekenen', kort:'Zet de echte afstand om naar cm en deel door de afstand op de kaart',
        uit:'<p>Op een kaart is 4 cm in het echt 2 km. Wat is de schaal?</p><p>Maak de eenheden gelijk: 2 km = <b>200 000 cm</b>. 4 cm is 200 000 cm, dus 1 cm is 200 000 : 4 = 50 000 cm.</p><p>De schaal is <b>1 : 50 000</b>.</p>',
        wanneer:'er geen schaal bij een kaart staat, maar je wel een afstand weet.',
        maak:function(R){
          var kaart = R.heel(0, 1), S = kaart ? R.kies([10000, 20000, 25000, 50000, 100000]) : R.kies([50, 100, 200, 500]), d = R.kies([2, 3, 4, 5, 6, 8, 10]), cm = d * S;
          var st = kaart ? [ { tekst:tn(cm / 100000) + ' km = … cm', antwoord:spv(cm), eenheid:'cm', hint:'1 km = 1000 m = 100 000 cm.' } ] : [ { tekst:tn(cm / 100) + ' m = … cm', antwoord:spv(cm), eenheid:'cm', hint:'1 m = 100 cm.' } ];
          st.push({ tekst:'1 cm op de kaart is ' + sp(cm) + ' : ' + d + ' cm. Dus de schaal is', antwoord:schaalVar(S), hint:'Reken ' + sp(cm) + ' : ' + d + ' uit en schrijf 1 : ervoor.' });
          return { context:'Op een ' + (kaart ? 'kaart' : 'plattegrond') + ' is ' + d + ' cm in het echt ' + (kaart ? tn(cm / 100000) + ' km' : tn(cm / 100) + ' m') + '.', vraag:'Wat is de schaal?', stappen:st };
        } },
      { id:'schaal-lijn', naam:'De schaallijn gebruiken', kort:'Kijk hoe vaak een stuk van de schaallijn in je afstand past',
        uit:'<p>Veel kaarten hebben een <b>schaallijn</b> (of schaalstok): een lijntje met stukken. Bij elk stuk staat hoeveel het in het echt is.</p><p>Is 2 cm op de schaallijn 1 km, en meet je 7 cm? Dan past 2 cm <b>3,5 keer</b> in 7 cm. In het echt is het 3,5 ' + X + ' 1 km = <b>3,5 km</b>.</p>',
        wanneer:'er op de kaart een schaallijn staat in plaats van een getal.',
        maak:function(R){
          var s = R.kies([1, 2]), m = R.heel(0, 1), v = m ? R.kies([100, 200, 250, 500]) : R.kies([1, 2, 5]), eenh = m ? 'm' : 'km', k = R.kies([1.5, 2, 2.5, 3, 3.5, 4, 5, 6]), d = s * k;
          var b = schaalstok(s, v, eenh, d, true);
          return { context:'Op de schaallijn is ' + s + ' cm in het echt ' + v + ' ' + eenh + '. Op de kaart meet je ' + tn(d) + ' cm.', vraag:'Hoe ver is het echt?', beeld:b, zelfBeeld:b,
            stappen:[
              { tekst:'Hoe vaak past ' + s + ' cm in ' + tn(d) + ' cm? ' + tn(d) + ' : ' + s + ' =', antwoord:tn(k), hint:'Tel de stukken van de schaallijn onder je afstand.' },
              { tekst:'Elk stuk is ' + v + ' ' + eenh + '. ' + tn(k) + ' ' + X + ' ' + v + ' =', antwoord:met(k * v, eenh), eenheid:eenh, hint:tn(k) + ' keer ' + v + '.' } ] };
        } },
      { id:'schaal-tabel', naam:'Schaal met de verhoudingstabel', kort:'Zet kaart en werkelijkheid in een verhoudingstabel en begin bij 1 cm',
        uit:'<p>Schaal 1 : 25 000 betekent: 1 cm is 25 000 cm = <b>250 m</b>. Zet dat in een <b>verhoudingstabel</b>: boven de kaart, onder het echt.</p><p>6 cm op de kaart? Keer 6: 6 ' + X + ' 250 = <b>1500 m</b>. Andersom: 1000 m echt is 1000 : 250 = <b>4 cm</b> op de kaart.</p>',
        wanneer:'je meerdere afstanden moet omrekenen met dezelfde schaal.',
        maak:function(R){
          var S = R.kies([10000, 20000, 25000, 50000, 100000]), e = S / 100, d = R.kies([2, 3, 4, 5, 6, 8, 1.5, 2.5]), terug = R.heel(0, 1), kop = ['kaart (cm)', 'echt (m)'];
          var cols = [{ b:1, o:sp(e), vul:1 }, terug ? { b:tn(d), o:sp(d * e), vulB:2, pijl:X + tn(d), eind:1 } : { b:tn(d), o:sp(d * e), vul:2, pijl:X + tn(d), eind:1 }];
          return { context:'De schaal is 1 : ' + sp(S) + '.', vraag:terug ? sp(d * e) + ' m echt is … cm' : tn(d) + ' cm is … m echt', beeld:function(k){ return vtab(kop, cols, k); },
            stappen:[
              { tekst:'1 cm op de kaart is ' + sp(S) + ' cm. In meter:', antwoord:met(e, 'm'), eenheid:'m', hint:sp(S) + ' : 100.' },
              terug ? { tekst:'Hoe vaak past ' + sp(e) + ' m in ' + sp(d * e) + ' m? ' + sp(d * e) + ' : ' + sp(e) + ' =', antwoord:met(d, 'cm'), eenheid:'cm', hint:'Zoveel cm is het op de kaart.' }
                    : { tekst:tn(d) + ' ' + X + ' ' + sp(e) + ' m =', antwoord:met(d * e, 'm'), eenheid:'m', hint:'Keer ' + tn(d) + ', boven en onder.' } ] };
        } }
    ] });

  /* ---------- 9. Procentuele verandering (3F) ---------- */
  G.push({ groep:{ id:'proc-verander', niveau:'3F', domein:'verhoudingen', naam:'Procentuele verandering',
      uit:'Toename en afname in procenten, terugrekenen naar 100%, groeifactoren, rente, procentpunten en procenten na elkaar.' },
    doelen:[
      { id:'proc-verandering', naam:'Toename en afname in procenten', kort:'Verschil gedeeld door de oude waarde, keer 100',
        uit:'<p>Een abonnement ging van € 40 naar € 46. Met hoeveel procent steeg het?</p><p>Reken het <b>verschil</b>: 46 ' + MIN + ' 40 = 6. Deel door de <b>oude</b> waarde: 6 : 40 = 0,15. Keer 100: <b>15%</b>.</p><p>De formule: (nieuw ' + MIN + ' oud) : oud ' + X + ' 100.</p>',
        wanneer:'je wilt weten met hoeveel procent iets is gestegen of gedaald.',
        maak:function(R){
          var O, p, op; do { O = R.kies([40, 50, 80, 120, 150, 200, 250, 300, 400, 500, 600, 800]); p = R.kies([5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 50]); } while ((O * p) % 100 !== 0);
          op = R.heel(0, 1); var diff = O * p / 100, N = op ? O + diff : O - diff, geld = R.heel(0, 1);
          var z = geld ? 'Een ' + R.kies(['abonnement', 'treinkaartje', 'concertkaartje', 'lidmaatschap']) + ' kostte ' + ec(O * 100) + '. Nu kost het ' + ec(N * 100) + '.' : R.kies(['Een school had ' + O + ' leerlingen. Nu zijn het er ' + N + '.', 'Vorig jaar kwamen er ' + O + ' bezoekers. Dit jaar ' + N + '.', 'Een club had ' + O + ' leden. Nu ' + N + '.']);
          return { context:z, vraag:'Hoeveel procent ' + (op ? 'stijging' : 'daling') + '?',
            stappen:[
              { tekst:'Het verschil: ' + (op ? N + ' ' + MIN + ' ' + O : O + ' ' + MIN + ' ' + N) + ' =', antwoord:tn(diff), hint:'Het grootste getal min het kleinste.' },
              { tekst:'Deel door de oude waarde: ' + tn(diff) + ' : ' + O + ' =', antwoord:tn(diff / O), hint:'De oude waarde is ' + O + ', het getal van eerst.', fout:F(tn(diff / N), 'Je deelde door de nieuwe waarde. Deel door de oude.') },
              { tekst:'Keer 100:', antwoord:pc(p), eenheid:'%', hint:tn(diff / O) + ' ' + X + ' 100.' } ] };
        } },
      { id:'proc-terug-btw', naam:'Terugrekenen: de prijs zonder btw', kort:'De prijs met btw is 121% (of 109%): deel door 1,21 (of 1,09)',
        uit:'<p>Een fiets kost € 484 met 21% btw. Wat kost hij zonder btw?</p><p>Let op: de 21% hoort bij de prijs <b>zonder</b> btw. € 484 is dus <b>121%</b>. Je deelt door de factor: € 484 : 1,21 = <b>€ 400</b>.</p><p>Niet 21% van € 484 afhalen: dat geeft een verkeerd antwoord.</p>',
        wanneer:'je een prijs met btw hebt en de prijs zonder btw zoekt.',
        maak:function(R){
          var r = R.kies([21, 21, 9]), P = R.kies([R.heel(2, 40) * 10, R.heel(2, 9) * 100, R.heel(11, 99)]), M = P * (100 + r), f = (100 + r) / 100;
          return { context:'Iets kost ' + ec(M) + ' met ' + r + '% btw. Je mag een rekenmachine gebruiken.', vraag:'Prijs zonder btw?',
            stappen:[
              { tekst:ec(M) + ' is …% van de prijs zonder btw', antwoord:pc(100 + r), eenheid:'%', hint:'De prijs zonder btw is 100%. Daar komt ' + r + '% bij.', fout:F(100 - r, 'De btw komt erbij, niet eraf.') },
              { tekst:'Als factor:', antwoord:tn(f), hint:(100 + r) + ' : 100.' },
              { tekst:ec(M) + ' : ' + tn(f) + ' =', antwoord:ec(P * 100), hint:'Terug naar 100%: deel door ' + tn(f) + '.', fout:FG(Math.round(M * (100 - r) / 100), 'Je haalde ' + r + '% van de prijs met btw af. Maar de ' + r + '% hoort bij de prijs zonder btw. Deel door ' + tn(f) + '.') } ] };
        } },
      { id:'proc-terug-korting', naam:'Terugrekenen: de oude prijs', kort:'Na 20% korting is de nieuwe prijs 80%: reken via 1% terug naar 100%',
        uit:'<p>Na 20% korting kost iets € 48. Wat kostte het eerst?</p><p>€ 48 is niet 100%, maar <b>80%</b> van de oude prijs. Reken in een tabel terug: 1% is € 48 : 80 = € 0,60. <b>100%</b> is 100 ' + X + ' € 0,60 = <b>€ 60</b>.</p><p>Met een factor gaat het ook: € 48 : 0,8 = € 60.</p>',
        wanneer:'je de nieuwe prijs weet en de prijs van voor de korting zoekt.',
        maak:function(R){
          var p = R.kies([10, 20, 25, 30, 40, 50, 15]), O = R.heel(2, 40) * 10, N = O * (100 - p);
          var cols = [{ b:(100 - p) + '%', o:ec(N), vulB:1 }, { b:'1%', o:ec(O), toon:2, vul:2, pijl:':' + (100 - p) }, { b:'100%', o:ec(O * 100), vul:3, pijl:X + '100', eind:1 }];
          return { context:'Na ' + p + '% korting kost iets ' + ec(N) + '.', vraag:'Wat was de oude prijs?', beeld:function(k){ return vtab(PKOP, cols, k); },
            stappen:[
              { tekst:ec(N) + ' is …% van de oude prijs', antwoord:pc(100 - p), eenheid:'%', hint:'De oude prijs is 100%. Daar ging ' + p + '% af.', fout:F(p, 'Dat is de korting. Hoeveel procent is er nog over?') },
              { tekst:'1% is ' + ec(N) + ' : ' + (100 - p) + ' =', antwoord:ec(O), hint:'Deel door ' + (100 - p) + '. Reken eventueel in centen: ' + N + ' : ' + (100 - p) + '.' },
              { tekst:'100% is 100 ' + X + ' ' + ec(O) + ' =', antwoord:ec(O * 100), hint:'Keer 100: de komma schuift twee plaatsen.', fout:FG(Math.round(N * (100 + p) / 100), 'Je deed er ' + p + '% bij. Maar de ' + p + '% hoort bij de oude prijs, niet bij de nieuwe.') } ] };
        } },
      { id:'proc-groeifactor', naam:'De groeifactor', kort:'Bij p% erbij doe je keer (1 + p/100), bij p% eraf keer (1 ' + MIN + ' p/100)',
        uit:'<p>Iets stijgt met 5%. Dan is het nieuwe 105% van het oude. De <b>groeifactor</b> is <b>1,05</b>.</p><p>Iets daalt met 5%. Dan is het nieuwe 95%: de groeifactor is <b>0,95</b>.</p><p>Je rekent het nieuwe getal in een keer uit: oud ' + X + ' groeifactor.</p>',
        wanneer:'je een stijging of daling in een keer wilt uitrekenen.',
        maak:function(R){
          var B = R.kies([200, 400, 500, 800, 1000, 1200, 2000, 2500, 5000]), p = R.kies([2, 3, 4, 5, 6, 8, 10, 12, 15, 20]), op = R.heel(0, 1), f = (100 + (op ? p : -p)) / 100, geld = R.heel(0, 1), rw = op ? 'stijgt' : 'daalt';
          var z = geld ? R.kies(['Een fiets kost ', 'Een laptop kost ', 'Een scooter kost ']) + ec(B * 100) + '. De prijs ' + rw + ' met ' + p + '%.' : R.kies(['Een stad heeft ' + B + ' inwoners. Het aantal ' + rw + ' met ' + p + '%.', 'Een bos heeft ' + B + ' bomen. Het aantal ' + rw + ' met ' + p + '%.', 'Een festival heeft ' + B + ' bezoekers. Het aantal ' + rw + ' met ' + p + '%.']);
          return { context:z, vraag:geld ? 'Wat is de nieuwe prijs?' : 'Wat is het nieuwe aantal?',
            stappen:[
              { tekst:'De groeifactor: 1 ' + (op ? '+' : MIN) + ' ' + tn(p / 100) + ' =', antwoord:tn(f), hint:op ? 'Erbij: 100% + ' + p + '% = ' + (100 + p) + '%.' : 'Eraf: 100% ' + MIN + ' ' + p + '% = ' + (100 - p) + '%.', fout:F(tn(op ? (100 - p) / 100 : (100 + p) / 100), 'Let op: het ' + rw + '.') },
              { tekst:(geld ? ec(B * 100) : B) + ' ' + X + ' ' + tn(f) + ' =', antwoord:geld ? ec(B * f * 100) : tn(B * f), hint:'Gebruik je rekenmachine, of reken ' + p + '% uit en tel het erbij of haal het eraf.' } ] };
        } },
      { id:'proc-rente', naam:'Rente over een jaar', kort:'Reken het rentepercentage van het bedrag uit en tel het erbij',
        uit:'<p>Zet je geld op een spaarrekening, dan krijg je <b>rente</b>: een percentage van je geld, elk jaar.</p><p>€ 1500 met 2% rente: de rente is 2% van € 1500 = € 30. Na een jaar heb je € 1500 + € 30 = <b>€ 1530</b>.</p>',
        wanneer:'je wilt weten hoeveel je na een jaar sparen hebt.',
        maak:function(R){
          var K = R.kies([500, 800, 1000, 1200, 1500, 2000, 2500, 4000, 600]), r = R.kies([1, 1.5, 2, 2.5, 3, 4]), rente = K * r;
          return { context:'Je zet ' + ec(K * 100) + ' op een spaarrekening. De rente is ' + tn(r) + '% per jaar.', vraag:'Hoeveel heb je na 1 jaar?',
            stappen:[
              { tekst:'De rente: ' + tn(r) + '% van ' + ec(K * 100) + ' =', antwoord:ec(rente), hint:'1% van ' + ec(K * 100) + ' is ' + ec(K) + '. Doe dat keer ' + tn(r) + '.' },
              { tekst:'Na een jaar: ' + ec(K * 100) + ' + ' + ec(rente) + ' =', antwoord:ec(K * 100 + rente), hint:'Tel de rente bij je geld.', fout:FG(rente, 'Dat is alleen de rente. Tel hem bij je geld op.') } ] };
        } },
      { id:'proc-samengesteld', naam:'Samengestelde rente', kort:'Elk jaar keer de groeifactor: na n jaar keer de groeifactor tot de macht n',
        uit:'<p>Bij <b>samengestelde rente</b> krijg je het tweede jaar ook rente over de rente.</p><p>€ 1000 met 3% rente: de groeifactor is 1,03. Na 1 jaar: € 1030. Na 2 jaar: 1,03 ' + X + ' € 1030 = € 1060,90. Na 3 jaar: € 1092,73.</p><p>Korter met de rekenmachine: € 1000 ' + X + ' 1,03<sup>3</sup>.</p>',
        wanneer:'je geld meerdere jaren laat staan, of als iets elk jaar met hetzelfde percentage groeit.',
        maak:function(R){
          var K = R.kies([500, 1000, 2000, 2500, 4000, 5000]), r = R.kies([2, 3, 4, 5, 10]), n = R.kies([2, 3]), f = (100 + r) / 100, c = K * 100;
          var st = [{ tekst:'De groeifactor bij ' + r + '% rente:', antwoord:tn(f), hint:'100% + ' + r + '% = ' + (100 + r) + '%.' }];
          for (var j = 1; j <= n; j++){ var nieuw = Math.round(c * (100 + r) / 100); st.push({ tekst:'Na ' + j + ' jaar: ' + tn(f) + ' ' + X + ' ' + ec(c) + ' =', antwoord:ec(nieuw), hint:'Gebruik je rekenmachine. Rond af op hele centen.' }); c = nieuw; }
          var exact = Math.round(K * 100 * Math.pow(f, n)); st[st.length - 1].antwoord = [ec(c)].concat(exact !== c ? [ec(exact)] : []);
          st[st.length - 1].waarom = 'Korter: ' + ec(K * 100) + ' ' + X + ' ' + tn(f) + '<sup>' + n + '</sup>.';
          return { context:'Je zet ' + ec(K * 100) + ' op een spaarrekening met ' + r + '% rente per jaar. Je mag een rekenmachine gebruiken.', vraag:'Hoeveel na ' + n + ' jaar?', stappen:st };
        } },
      { id:'proc-procentpunt', naam:'Procent of procentpunt', kort:'Het verschil tussen twee percentages heet procentpunt; de verandering in procent reken je uit ten opzichte van het oude percentage',
        uit:'<p>De rente gaat van 2% naar 3%. Dat is <b>1 procentpunt</b> erbij: 3 ' + MIN + ' 2 = 1.</p><p>Maar in procenten is het veel meer: 1 is de helft van 2. De rente stijgt met <b>50%</b>.</p><p>Procentpunt: het gewone verschil. Procent: het verschil gedeeld door het oude percentage, keer 100.</p>',
        wanneer:'twee percentages met elkaar vergeleken worden, zoals in het nieuws.',
        maak:function(R){
          var a, d, op; do { a = R.kies([2, 4, 5, 10, 20, 25, 40, 50]); d = R.heel(1, 10); op = R.heel(0, 1); } while ((d * 100) % a !== 0 || (!op && d >= a) || a + d > 95);
          var b = op ? a + d : a - d, q = d * 100 / a;
          var z = R.kies(['De rente gaat van ' + a + '% naar ' + b + '%.', 'Een partij had ' + a + '% van de stemmen. Nu is dat ' + b + '%.', 'Van de leerlingen sportte ' + a + '%. Een jaar later is dat ' + b + '%.']);
          return { context:z, vraag:'Hoeveel procent ' + (op ? 'stijging' : 'daling') + '?',
            stappen:[
              { tekst:'Het verschil in procentpunten:', antwoord:met(d, 'procentpunt').concat([d + ' procentpunten']), eenheid:'procentpunt', hint:'Gewoon aftrekken: ' + Math.max(a, b) + ' ' + MIN + ' ' + Math.min(a, b) + '.' },
              { tekst:'In procenten: ' + d + ' : ' + a + ' ' + X + ' 100 =', antwoord:pc(q), eenheid:'%', hint:'Deel door het oude percentage ' + a + ' en doe keer 100.', fout:F(d, 'Dat is het verschil in procentpunten. De vraag is: hoeveel procent van ' + a + ' is dat?') } ] };
        } },
      { id:'proc-na-elkaar', naam:'Procenten na elkaar', kort:'Reken elke stap met de groeifactor van het nieuwe bedrag: 20% erbij en 20% eraf is niet hetzelfde',
        uit:'<p>Een prijs van € 50 gaat 20% omhoog en daarna 20% omlaag. Is hij dan weer € 50? <b>Nee</b>.</p><p>Eerst: 1,2 ' + X + ' € 50 = € 60. Dan: 0,8 ' + X + ' € 60 = <b>€ 48</b>. De tweede keer reken je met een <b>groter bedrag</b>, dus gaat er meer af.</p><p>Samen: 1,2 ' + X + ' 0,8 = 0,96. Dat is 4% minder.</p>',
        wanneer:'er twee keer een procent bij of af gaat.',
        maak:function(R){
          var P = R.kies([40, 80, 100, 120, 200, 60, 160]), p = R.kies([10, 20, 25, 50]), q = R.kies([10, 20, 25, 50]), eerstOp = R.heel(0, 2) > 0;
          var f1 = (100 + (eerstOp ? p : -p)) / 100, f2 = (100 + (eerstOp ? -q : q)) / 100, c1 = Math.round(P * 100 * f1), c2 = Math.round(c1 * f2);
          var verg = c2 > P * 100 ? 'hoger' : c2 < P * 100 ? 'lager' : 'gelijk';
          return { context:'Iets kost ' + ec(P * 100) + '. De prijs gaat eerst ' + p + '% ' + (eerstOp ? 'omhoog' : 'omlaag') + ' en daarna ' + q + '% ' + (eerstOp ? 'omlaag' : 'omhoog') + '.', vraag:'Wat is de prijs nu?', antwoord:ec(c2),
            stappen:[
              { tekst:'Eerst ' + p + '% ' + (eerstOp ? 'erbij' : 'eraf') + ': ' + tn(f1) + ' ' + X + ' ' + ec(P * 100) + ' =', antwoord:ec(c1), hint:'De groeifactor is ' + tn(f1) + '.' },
              { tekst:'Dan ' + q + '% ' + (eerstOp ? 'eraf' : 'erbij') + ': ' + tn(f2) + ' ' + X + ' ' + ec(c1) + ' =', antwoord:ec(c2), hint:'Reken met het nieuwe bedrag ' + ec(c1) + ', niet met ' + ec(P * 100) + '.', fout:p === q ? FG(P * 100, 'Nee: de tweede keer reken je met het nieuwe bedrag. Dan is ' + q + '% een ander bedrag.') : {} },
              kz('Vergeleken met het begin is de prijs nu', ['hoger', 'lager', 'gelijk'], verg, 'Vergelijk ' + ec(c2) + ' met ' + ec(P * 100) + '.') ] };
        } }
    ] });

  /* ---------- 10. Schaal en oppervlakte (3F) ---------- */
  function plattegrondOpgave(R){
    var S = R.kies([50, 100, 200]), l, b;
    if (S === 100){ l = R.heel(6, 18) / 2; b = R.heel(4, 14) / 2; } else if (S === 50){ l = R.heel(6, 18); b = R.heel(4, 14); } else { l = R.heel(3, 12) / 2; b = R.heel(2, 8) / 2; }
    var L = l * S / 100, B = b * S / 100;
    return { S:S, ctx:'Op een plattegrond met schaal 1 : ' + S + ' is een kamer ' + tn(l) + ' cm lang en ' + tn(b) + ' cm breed.',
      st:[
        { tekst:'Lengte in het echt: ' + tn(l) + ' ' + X + ' ' + S + ' cm = … m', antwoord:met(L, 'm'), eenheid:'m', hint:tn(l) + ' ' + X + ' ' + S + ' = ' + tn(l * S) + ' cm. Deel door 100 voor meters.' },
        { tekst:'Breedte in het echt: ' + tn(b) + ' ' + X + ' ' + S + ' cm = … m', antwoord:met(B, 'm'), eenheid:'m', hint:tn(b) + ' ' + X + ' ' + S + ' = ' + tn(b * S) + ' cm. Deel door 100 voor meters.' },
        { tekst:'Oppervlakte: ' + tn(L) + ' ' + X + ' ' + tn(B) + ' =', antwoord:met(L * B, 'm²'), eenheid:'m²', hint:'Lengte keer breedte, allebei in meter.', fout:F(tn(l * b), 'Dat is de oppervlakte op de plattegrond, in cm².') } ] };
  }
  function vlakKaartOpgave(R){
    var S = R.kies([100, 200, 500, 1000]), A = R.heel(2, 20), f = S * S, cm2 = A * f;
    return { S:S, ctx:'Een vijver heeft op een kaart met schaal 1 : ' + S + ' een oppervlakte van ' + A + ' cm².',
      st:[
        { tekst:'Lengtes gaan keer ' + S + '. De oppervlakte gaat keer ' + S + ' ' + X + ' ' + S + ' =', antwoord:spv(f), hint:'Oppervlakte: lengte keer breedte, en allebei gaan ze keer ' + S + '.', fout:F(S, 'Dat is de factor voor lengtes. Voor oppervlakte doe je die keer zichzelf.') },
        { tekst:A + ' cm² ' + X + ' ' + sp(f) + ' =', antwoord:spv(cm2), eenheid:'cm²', hint:A + ' keer ' + sp(f) + '.' },
        { tekst:'In m²: ' + sp(cm2) + ' : 10 000 =', antwoord:met(cm2 / 10000, 'm²'), eenheid:'m²', hint:'1 m² = 100 cm ' + X + ' 100 cm = 10 000 cm².', fout:F(tn(cm2 / 100), 'Bij m² deel je door 10 000, niet door 100.') } ] };
  }
  G.push({ groep:{ id:'schaal-opp', niveau:'3F', domein:'verhoudingen', naam:'Schaal en oppervlakte',
      uit:'Vergroot je iets met factor k, dan gaat de oppervlakte keer k² en de inhoud keer k³. Zo reken je ook met plattegronden en kaarten.' },
    doelen:[
      { id:'schaal-opp-k2', naam:'Oppervlakte gaat keer k²', kort:'Worden alle lengtes k keer zo groot, dan wordt de oppervlakte k ' + X + ' k keer zo groot',
        uit:'<p>Een vierkant van 1 bij 1 vergroot je 3 keer: het wordt 3 bij 3. Daar passen <b>9</b> kleine vierkantjes in, niet 3.</p><p>Worden lengtes <b>k</b> keer zo groot, dan wordt de oppervlakte <b>k ' + X + ' k = k²</b> keer zo groot.</p><p>Een foto van 12 cm² met alle lengtes keer 2: 12 ' + X + ' 4 = 48 cm².</p>',
        wanneer:'je een tekening, foto of figuur vergroot of verkleint en de oppervlakte wilt weten.',
        maak:function(R){
          var k = R.heel(2, 5), L1 = R.heel(2, 6), A1 = R.heel(3, 30), z = R.kies(['Een foto', 'Een tekening', 'Een logo', 'Een poster']);
          return { context:z + ' heeft een oppervlakte van ' + A1 + ' cm². Je vergroot hem: een zijde van ' + L1 + ' cm wordt ' + (L1 * k) + ' cm.', vraag:'Nieuwe oppervlakte?',
            beeld:function(n){ return vergroot(k, n >= 2); },
            stappen:[
              { tekst:'Hoeveel keer zo groot worden de lengtes? ' + (L1 * k) + ' : ' + L1 + ' =', antwoord:String(k), hint:'Deel de nieuwe lengte door de oude.' },
              { tekst:'De oppervlakte gaat keer ' + k + ' ' + X + ' ' + k + ' =', antwoord:String(k * k), hint:'Lengte en breedte gaan allebei keer ' + k + '.', fout:F(k, 'Dat is de factor voor lengtes. De oppervlakte gaat keer ' + k + ' ' + X + ' ' + k + '.') },
              { tekst:A1 + ' ' + X + ' ' + (k * k) + ' =', antwoord:met(A1 * k * k, 'cm²'), eenheid:'cm²', hint:A1 + ' keer ' + (k * k) + '.', fout:F(A1 * k, 'Je deed de oppervlakte maar keer ' + k + '. Het moet keer ' + (k * k) + '.') } ] };
        } },
      { id:'schaal-inhoud-k3', naam:'Inhoud gaat keer k³', kort:'Worden alle lengtes k keer zo groot, dan wordt de inhoud k ' + X + ' k ' + X + ' k keer zo groot',
        uit:'<p>Een kubus van 1 bij 1 bij 1 vergroot je 2 keer: hij wordt 2 bij 2 bij 2. Daar passen <b>8</b> kleine kubusjes in.</p><p>Worden alle lengtes <b>k</b> keer zo groot, dan wordt de inhoud <b>k ' + X + ' k ' + X + ' k = k³</b> keer zo groot.</p><p>Een doos van 50 cm³, alle ribben keer 3: 50 ' + X + ' 27 = 1350 cm³.</p>',
        wanneer:'je een voorwerp of doos in alle richtingen vergroot en de inhoud wilt weten.',
        maak:function(R){
          var k = R.heel(2, 4), L1 = R.heel(2, 5), V1 = R.heel(2, 50), z = R.kies(['Een doos', 'Een kubus', 'Een aquarium', 'Een bak']);
          return { context:z + ' heeft een inhoud van ' + V1 + ' cm³. Een grotere is in alle richtingen even veel vergroot: een ribbe van ' + L1 + ' cm wordt ' + (L1 * k) + ' cm.', vraag:'Nieuwe inhoud?',
            beeld:function(n){ return vergroot(k, n >= 2, true); },
            stappen:[
              { tekst:'Hoeveel keer zo groot worden de lengtes? ' + (L1 * k) + ' : ' + L1 + ' =', antwoord:String(k), hint:'Deel de nieuwe lengte door de oude.' },
              { tekst:'De inhoud gaat keer ' + k + ' ' + X + ' ' + k + ' ' + X + ' ' + k + ' =', antwoord:String(k * k * k), hint:'Lengte, breedte en hoogte gaan alle drie keer ' + k + '.', fout:F(k * k, 'Dat is de factor voor oppervlakte. Bij inhoud komt de hoogte er ook bij.') },
              { tekst:V1 + ' ' + X + ' ' + (k * k * k) + ' =', antwoord:met(V1 * k * k * k, 'cm³'), eenheid:'cm³', hint:V1 + ' keer ' + (k * k * k) + '.' } ] };
        } },
      { id:'schaal-plattegrond', naam:'Oppervlakte op een plattegrond', kort:'Reken eerst de lengte en breedte om naar het echt, doe dan lengte keer breedte',
        uit:'<p>Op een plattegrond met schaal 1 : 100 is een kamer 4 cm bij 3,5 cm.</p><p>Reken eerst de <b>lengtes</b> om: 4 cm is 400 cm = 4 m. 3,5 cm is 350 cm = 3,5 m.</p><p>Dan de <b>oppervlakte</b>: 4 ' + X + ' 3,5 = <b>14 m²</b>.</p>',
        wanneer:'je de lengte en breedte op een plattegrond kunt meten.',
        maak:function(R){ var o = plattegrondOpgave(R); return { context:o.ctx, vraag:'Oppervlakte in het echt?', stappen:o.st }; } },
      { id:'schaal-opp-kaart', naam:'Oppervlakte op een kaart: keer de schaal in het kwadraat', kort:'Doe de oppervlakte op de kaart keer schaal ' + X + ' schaal en reken om naar m²',
        uit:'<p>Een vijver heeft een rare vorm. Op een kaart met schaal 1 : 200 is de oppervlakte 6 cm².</p><p>Lengtes gaan keer 200, dus de oppervlakte gaat keer <b>200 ' + X + ' 200 = 40 000</b>. 6 ' + X + ' 40 000 = 240 000 cm².</p><p>Omrekenen: 1 m² = 10 000 cm². Dus 240 000 : 10 000 = <b>24 m²</b>.</p>',
        wanneer:'je alleen de oppervlakte op de kaart weet, bijvoorbeeld bij een figuur met een rare vorm.',
        maak:function(R){ var o = vlakKaartOpgave(R); return { context:o.ctx, vraag:'Oppervlakte in het echt (m²)?', stappen:o.st }; } },
      { id:'schaal-opp-kies', naam:'Oppervlakte en schaal: kies de handigste manier', kort:'Weet je lengte en breedte, reken die dan eerst om. Weet je alleen de oppervlakte, doe dan keer schaal ' + X + ' schaal',
        uit:'<p>Bij oppervlakte en schaal kun je op twee manieren rekenen.</p><p>Weet je de <b>lengte en breedte</b> op de plattegrond? Reken die eerst om naar meters en doe dan lengte keer breedte.</p><p>Weet je alleen de <b>oppervlakte</b> op de kaart? Doe die keer schaal ' + X + ' schaal en reken om naar m².</p>',
        wanneer:'je de oppervlakte in het echt zoekt en eerst moet bedenken hoe.',
        maak:function(R){
          var soort = R.heel(0, 1), o = soort ? vlakKaartOpgave(R) : plattegrondOpgave(R), M = ['eerst de lengtes omrekenen', 'de oppervlakte keer schaal ' + X + ' schaal'];
          return { context:o.ctx, vraag:'Oppervlakte in het echt (m²)?',
            stappen:[kz('Welke manier is hier het handigst?', M, M[soort], soort ? 'Je weet geen lengte en breedte, alleen de oppervlakte op de kaart.' : 'Je weet de lengte en de breedte op de plattegrond.')].concat(o.st) };
        } }
    ] });

  /* de eenheid van de laatste stap staat ook achter het eindantwoord */
  G.forEach(function(g){ g.doelen.forEach(function(d){ var maak = d.maak; d.maak = function(R){ var o = maak(R), st = o.stappen[o.stappen.length - 1]; if (o.eenheid == null && !o.opties && o.antwoord == null && st && st.eenheid && !st.opties) o.eenheid = st.eenheid; return o; }; }); });
  LEERROUTE.voeg('rekenen', G);
})();
