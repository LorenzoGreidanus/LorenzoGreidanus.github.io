/* De leerroute: een hele leerlijn per vak, en elk doel stap voor stap.

   leerroute.html?vak=rekenen laadt dit bestand en daarna de inhoud uit
   leerroute/<vak>-*.js (zie BESTANDEN). Een doel gaat in vier fases, zoals
   een docent het aan het bord doet:
     1 Uitleg    wat het trucje is, met een plaatje
     2 Voordoen  een som, stap voor stap uitgewerkt (jij klikt door)
     3 Samen     drie sommen: jij vult elke stap in, met een hint als het misgaat
     4 Zelf      zes sommen zonder stappen; vijf goed is beheerst
   Wat je beheerst bewaart lg-route (doel-id: 1 bezig, 2 beheerst); profiel.js
   neemt dat mee naar je andere apparaten.

   ---------- de inhoud ----------
     LEERROUTE.voeg('rekenen', [ { groep:{...}, doelen:[ doel, ... ] }, ... ]);

   groep: { id, niveau:'basis'|'1F'|'2F'|'3F', domein:<id uit VAKKEN>, naam, uit }
   doel:  { id, naam, kort, uit (html), wanneer (tekst, mag weg), beeld (html, mag weg),
            maak:function(R){ return opgave; } }
   opgave: {
     vraag:'47 + 36',               tekst, groot in beeld (vraagHtml mag ook)
     context:'een zinnetje erboven', mag weg
     beeld:function(n){ ... }       html bij n afgeronde stappen (0 .. stappen.length), of een vaste string
     stappen:[ stap, ... ],
     antwoord:'83' | ['83', ...],   het eindantwoord voor Zelf; weg = het antwoord van de laatste stap
     opties:[...], goed:0           een eindvraag als keuze in plaats van invullen
     eenheid:'cm'                   achter het invulvak
   }
   stap: { tekst:'47 + 30 =', antwoord:'77' | [...], hint:'...', fout:{ '76':'uitleg bij dit foute antwoord' } }
     of  { tekst, opties:['ei','ij'], goed:0, hint }   kiezen
     of  { tekst, info:true }                         alleen lezen
   Een antwoord mag ook een functie zijn: controle:function(invoer){ return true; }.

   R (de helpers voor maak): R.heel(a,b), R.kies(lijst), R.hussel(lijst), R.toon(getal),
   R.teken.* voor plaatjes: lijn, blokken, splits, tabel, cijfer, strook, rooster, klok, zin, woord. */
window.LEERROUTE = (function(){
  'use strict';

  /* ---------- de vakken: niveaus en domeinen in vaste volgorde ---------- */
  var VAKKEN = {
    rekenen: { naam:'Rekenen', kleur:'#204ECF', hand:'elke manier, stap voor stap',
      lead:'Van tellen tot het examen: per onderwerp elke rekenmanier, eerst uitgelegd, dan voorgedaan, dan samen en dan zelf.',
      niveaus:[
        { id:'basis', naam:'Fundament', uit:'De basis die je zonder nadenken moet kunnen: getallen, plus, min, de tafels en delen. Hier staan alle manieren om te rekenen, zodat je kunt kiezen wat bij een som past.' },
        { id:'1F', naam:'1F', uit:'Het niveau aan het eind van de basisschool: grote getallen, cijferen, kommagetallen, eenvoudige breuken en procenten, meten en tabellen.' },
        { id:'2F', naam:'2F', uit:'Het niveau voor iedereen in het voortgezet onderwijs: rekenen met breuken en procenten, schaal, omrekenen, oppervlakte en inhoud, grafieken en het gemiddelde.' },
        { id:'3F', naam:'3F', uit:'Het niveau voor havo en vwo en voor het mbo-examen: procentuele verandering, rente, samengestelde eenheden, formules en grote en kleine getallen.' } ],
      domeinen:[ { id:'getallen', naam:'Getallen' }, { id:'verhoudingen', naam:'Verhoudingen' }, { id:'meten', naam:'Meten en meetkunde' }, { id:'verbanden', naam:'Verbanden' } ] },
    nederlands: { naam:'Nederlands', kleur:'#D9522F', hand:'elke regel, stap voor stap',
      lead:'Van klanken en lettergrepen tot examenteksten: per onderwerp elke regel en elk trucje, eerst uitgelegd, dan voorgedaan, dan samen en dan zelf.',
      niveaus:[
        { id:'basis', naam:'Fundament', uit:'De basis van spelling en zinnen: klanken, lettergrepen, woordsoorten en de persoonsvorm. Hierop bouwt alles verder.' },
        { id:'1F', naam:'1F', uit:'Het niveau aan het eind van de basisschool: de meeste spellingregels, werkwoorden in de tegenwoordige en verleden tijd, zinsdelen en teksten begrijpen.' },
        { id:'2F', naam:'2F', uit:'Het niveau voor iedereen in het voortgezet onderwijs: alle werkwoordspelling, leestekens, zakelijke teksten lezen en een goede alinea of e-mail schrijven.' },
        { id:'3F', naam:'3F', uit:'Het niveau voor havo en vwo: tekststructuren, argumentatie, samenvatten, formeel schrijven en de lastigste spelling.' } ],
      domeinen:[ { id:'spelling', naam:'Spelling' }, { id:'werkwoorden', naam:'Werkwoordspelling' }, { id:'grammatica', naam:'Grammatica' },
        { id:'leestekens', naam:'Leestekens en hoofdletters' }, { id:'woordenschat', naam:'Woordenschat' }, { id:'lezen', naam:'Lezen' },
        { id:'fictie', naam:'Verhalen en gedichten' }, { id:'schrijven', naam:'Schrijven' }, { id:'mondeling', naam:'Spreken en luisteren' } ] }
  };
  /* welke inhoudsbestanden bij een vak horen, in deze volgorde geladen */
  var BESTANDEN = {
    rekenen:['rekenen-basis', 'rekenen-tafels', 'rekenen-getallen', 'rekenen-verhoudingen', 'rekenen-meten', 'rekenen-meetkunde', 'rekenen-algebra', 'rekenen-data'],
    nederlands:['nederlands-spelling', 'nederlands-werkwoorden', 'nederlands-grammatica', 'nederlands-lezen', 'nederlands-schrijven', 'nederlands-bronnen', 'nederlands-taal', 'nederlands-literatuur']
  };
  var SAMEN = 3, ZELF = 6, BEHEERST = 5;

  var GROEPEN = [], DOELEN = [], OP_ID = {}, GROEP_ID = {}, volg = 0;
  function voeg(vak, blokken){
    (blokken || []).forEach(function(b){
      var g = b.groep; if (!g || !g.id) return;
      if (!GROEP_ID[g.id]){ g.vak = vak; g.volg = volg++; g.doelen = []; GROEPEN.push(g); GROEP_ID[g.id] = g; }
      var gg = GROEP_ID[g.id];
      (b.doelen || []).forEach(function(d){
        if (!d || !d.id || OP_ID[d.id]) return;
        d.vak = vak; d.groep = gg; gg.doelen.push(d); DOELEN.push(d); OP_ID[d.id] = d;
      });
    });
  }

  /* Na het laden krijgt elke groep met drie of meer doelen een laatste doel
     "Alles door elkaar": elke som komt uit een ander doel van de groep, zodat
     je oefent zonder te weten welke manier of regel er nu aan de beurt is. */
  function mixen(){
    GROEPEN.forEach(function(g){
      var eigen = g.doelen.filter(function(d){ return !d.mix; });
      if (eigen.length < 3 || OP_ID[g.id + '-mix']) return;
      var d = { id:g.id + '-mix', mix:true, naam:'Alles door elkaar', kort:'Alles uit ' + g.naam.toLowerCase() + ' gemengd, zoals in een toets',
        uit:'<p>Hier komen alle doelen van <b>' + schoon(g.naam.toLowerCase()) + '</b> door elkaar. Bij elke som zie je uit welk doel hij komt, maar je kiest zelf hoe je hem aanpakt.</p><p>Zo oefen je wat in een toets gebeurt: je weet niet van tevoren welke soort som er komt.</p><ul>' +
          eigen.map(function(x){ return '<li>' + schoon(x.naam) + '</li>'; }).join('') + '</ul>',
        wanneer:'je de losse doelen van deze groep geoefend hebt en wilt weten of je alles door elkaar kunt.',
        maak:function(R){
          var x = eigen[Math.floor(Math.random() * eigen.length)], o = x.maak(R);
          o.context = '<span class="lr-uitdoel">uit: ' + schoon(x.naam) + '</span>' + (o.context ? '<br>' + o.context : '');
          return o;
        } };
      d.vak = g.vak; d.groep = g; g.doelen.push(d); DOELEN.push(d); OP_ID[d.id] = d;
    });
  }

  /* ---------- hulpjes ---------- */
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function $(id){ return document.getElementById(id); }
  function heel(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
  function kies(l){ return l[Math.floor(Math.random() * l.length)]; }
  function hussel(l){ l = l.slice(); for (var i = l.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), x = l[i]; l[i] = l[j]; l[j] = x; } return l; }
  /* een getal zoals op school: komma voor decimalen, punten vanaf 10.000 */
  function toon(x, o){
    o = o || {};
    if (typeof x !== 'number' || !isFinite(x)) return String(x);
    var d = o.dec == null ? 6 : o.dec, r = Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
    var neg = r < 0; r = Math.abs(r);
    var s = o.dec != null && o.vast ? r.toFixed(d) : String(r);
    if (/e/.test(s)) s = r.toFixed(d).replace(/\.?0+$/, '');
    var p = s.split('.'), h = p[0];
    if (h.length > 4 || (o.punt && h.length > 3)) h = h.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '−' : '') + h + (p[1] ? ',' + p[1] : '');
  }
  function geld(x){ return '€ ' + toon(x, { dec:2, vast:true }); }
  /* wat iemand intypt, op alle manieren die hetzelfde betekenen */
  /* streng: een antwoord uit de inhoud; 45.000 is dan alleen vijfenveertigduizend. Wat een leerling typt mag beide kanten op */
  function lezingen(t, streng){
    t = String(t == null ? '' : t).toLowerCase().replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"')
      .replace(/[−–—]/g, '-').replace(/×/g, 'x').replace(/\s+/g, ' ').trim().replace(/[.!]$/, '');
    var uit = [t.replace(/\s*([:\/=+x*-])\s*/g, '$1').replace(/^-\s+/, '-')];
    var c = t.replace(/^€\s*/, '').replace(/\s*(€|euro)$/, '').replace(/\s/g, '');
    if (/^-?[\d.,]+$/.test(c) && /\d/.test(c)){
      var a = [];
      if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(c)) a.push(c.replace(/\./g, '').replace(',', '.'));
      if (/^-?\d+(,\d+)?$/.test(c)) a.push(c.replace(',', '.'));
      if (/^-?\d*\.\d+$/.test(c) && !(streng && /^-?\d{1,3}(\.\d{3})+$/.test(c))) a.push(c);
      if (/^-?\d+,-$/.test(c + '-')) a.push(c.replace(',', ''));
      a.forEach(function(x){ var n = parseFloat(x); if (!isNaN(n)) uit.push('n:' + Math.round(n * 1e9) / 1e9); });
    }
    return uit;
  }
  function klopt(invoer, ant, controle){
    if (controle) { try { return !!controle(invoer); } catch (e){ return false; } }
    var mijn = lezingen(invoer), lijst = [].concat(ant);
    return lijst.some(function(a){ var z = lezingen(a, true); return z.some(function(x){ return mijn.indexOf(x) >= 0; }); });
  }
  function eerste(ant){ return [].concat(ant)[0]; }
  function beeldVan(op, n){ var b = op.beeld; if (!b) return ''; if (typeof b === 'function'){ try { return b(n) || ''; } catch (e){ return ''; } } return b; }

  /* ---------- plaatjes ---------- */
  /* op een telefoon tekenen we smaller, dan worden de getallen groter */
  function smal(){ try { return window.innerWidth < 560; } catch (e){ return false; } }
  var KL = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];
  var teken = {
    /* de getallenlijn met sprongen: { van, tot, streep, labels:[..], sprongen:[{van,naar,tekst}], stip:[..], nieuw:true } */
    lijn:function(o){
      var W = smal() ? 420 : 660, L = 30, Rr = W - 30, Y = 118, van = o.van, tot = o.tot, span = tot - van || 1;
      function x(n){ return L + (n - van) / span * (Rr - L); }
      var st = o.streep; if (!st){ var opties = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000]; st = opties[opties.length - 1]; for (var i = 0; i < opties.length; i++) if (span / opties[i] <= 20){ st = opties[i]; break; } }
      var s = '<svg class="lr-svg" viewBox="0 0 ' + W + ' 160" role="img" aria-label="' + schoon(o.aria || 'getallenlijn') + '">';
      s += '<line x1="' + (L - 12) + '" y1="' + Y + '" x2="' + (Rr + 12) + '" y2="' + Y + '" class="as"/>';
      var labels = o.labels || null, lab = {};
      if (labels) labels.forEach(function(n){ lab[n] = 1; });
      var eerst = Math.ceil(van / st) * st;
      for (var n = eerst; n <= tot + 1e-9; n += st){
        var nn = Math.round(n * 1000) / 1000, groot = (nn % (st * 5) === 0) || nn === van || nn === tot;
        s += '<line x1="' + x(nn) + '" y1="' + (Y - (groot ? 8 : 5)) + '" x2="' + x(nn) + '" y2="' + (Y + (groot ? 8 : 5)) + '" class="as"/>';
        if (!labels && (span / st <= 12 || groot)) lab[nn] = 1;
      }
      var sprongen = o.sprongen || [], eerstLab = [];
      /* de getallen van de sprongen en stippen eerst; een getal dat te dicht bij een ander staat valt weg */
      (o.stip || []).forEach(function(n){ eerstLab.push(n); });
      sprongen.forEach(function(sp){ eerstLab.push(sp.van, sp.naar); });
      /* past een getal van een sprong er niet naast, dan op een tweede regel; een gewoon streepjesgetal valt weg */
      var gezet = [[], []], belangrijk = {};
      eerstLab.forEach(function(n){ belangrijk[n] = 1; });
      var getekend = {};
      eerstLab.concat(Object.keys(lab).map(Number)).forEach(function(n){ if (n < van - 1e-9 || n > tot + 1e-9 || getekend[n]) return;
        var t = String(o.toon ? o.toon(n) : toon(n)), bx = x(n), half = t.length * 4.6 + 6;
        function vrij(r){ return !gezet[r].some(function(g){ return Math.abs(g[0] - bx) < g[1] + half; }); }
        var rij = vrij(0) ? 0 : belangrijk[n] && vrij(1) ? 1 : -1;
        if (rij < 0) return;
        gezet[rij].push([bx, half]); getekend[n] = 1;
        if (rij) s += '<line x1="' + bx + '" y1="' + (Y + 10) + '" x2="' + bx + '" y2="' + (Y + 34) + '" class="as dun"/>';
        s += '<text x="' + bx + '" y="' + (Y + 28 + rij * 22) + '" class="getal">' + schoon(t) + '</text>'; });
      sprongen.forEach(function(sp, i){
        var x1 = x(sp.van), x2 = x(sp.naar), mid = (x1 + x2) / 2, h = Math.max(26, Math.min(86, Math.abs(x2 - x1) * .55)), kl = KL[(sp.kleur != null ? sp.kleur : i) % KL.length];
        var laatste = o.nieuw && i === sprongen.length - 1;
        s += '<path d="M' + x1 + ' ' + (Y - 4) + ' Q' + mid + ' ' + (Y - 4 - h * 1.6) + ' ' + x2 + ' ' + (Y - 4) + '" class="boog' + (laatste ? ' nieuw' : '') + '" pathLength="100" style="stroke:' + kl + '"/>';
        var r = x2 > x1 ? -1 : 1;
        s += '<path d="M' + x2 + ' ' + (Y - 4) + ' l' + (r * 9) + ' -9 M' + x2 + ' ' + (Y - 4) + ' l' + (r * 2) + ' -12" class="pijl' + (laatste ? ' nieuw' : '') + '" style="stroke:' + kl + '"/>';
        if (sp.tekst) s += '<text x="' + mid + '" y="' + (Y - 12 - h * .8) + '" class="sprong' + (laatste ? ' nieuw' : '') + '" style="fill:' + kl + '">' + schoon(sp.tekst) + '</text>';
      });
      (o.stip || []).forEach(function(n){ s += '<circle cx="' + x(n) + '" cy="' + Y + '" r="6" class="stip"/>'; });
      return s + '</svg>';
    },
    /* honderdplaten, tienstaven en losse blokjes: { h, t, e } */
    blokken:function(o){
      var h = o.h || 0, t = o.t || 0, e = o.e || 0, s = '', x = 0, W;
      for (var i = 0; i < h; i++){ s += '<g transform="translate(' + x + ' 0)">'; for (var r = 0; r < 10; r++) for (var c = 0; c < 10; c++) s += '<rect x="' + (c * 7) + '" y="' + (r * 7) + '" width="6.4" height="6.4" class="blok h"/>'; s += '</g>'; x += 78; }
      for (i = 0; i < t; i++){ s += '<g transform="translate(' + x + ' 0)">'; for (r = 0; r < 10; r++) s += '<rect x="0" y="' + (r * 7) + '" width="6.4" height="6.4" class="blok t"/>'; s += '</g>'; x += 12; }
      if (t) x += 8;
      for (i = 0; i < e; i++){ s += '<rect x="' + (x + (i % 3) * 8) + '" y="' + (49 + Math.floor(i / 3) * -8 + 14) + '" width="6.4" height="6.4" class="blok e"/>'; if (i % 3 === 2 && i < e - 1) {} }
      W = Math.max(40, x + 28);
      return '<svg class="lr-svg" viewBox="-2 -2 ' + (W + 4) + ' 76" style="max-width:' + Math.min(640, (W + 4) * 2.2) + 'px" role="img" aria-label="' + h + ' honderdtallen, ' + t + ' tientallen en ' + e + ' eenheden">' + s + '</svg>';
    },
    /* een splitsbeen: boven het getal, onder de twee delen; vraag:'l'|'r' laat een vakje leeg */
    splits:function(top, links, rechts, o){
      o = o || {};
      function vak(x, y, t, leeg){ return '<rect x="' + (x - 34) + '" y="' + y + '" width="68" height="40" rx="10" class="vak' + (leeg ? ' leeg' : '') + '"/><text x="' + x + '" y="' + (y + 27) + '" class="getal groot">' + (leeg ? '?' : schoon(t)) + '</text>'; }
      return '<svg class="lr-svg" viewBox="0 0 220 132" style="max-width:240px" role="img" aria-label="' + schoon(top + ' splitsen in ' + links + ' en ' + rechts) + '">' +
        '<line x1="110" y1="44" x2="52" y2="88" class="as"/><line x1="110" y1="44" x2="168" y2="88" class="as"/>' +
        vak(110, 4, top, o.vraag === 't') + vak(52, 88, links, o.vraag === 'l') + vak(168, 88, rechts, o.vraag === 'r') + '</svg>';
    },
    /* een tabel; o.kop: eerste rij is kop; o.pijlen:[{van,naar,tekst,onder}] tussen kolommen (verhoudingstabel); o.nadruk:[[r,c]] */
    tabel:function(rijen, o){
      o = o || {};
      var nad = {}; (o.nadruk || []).forEach(function(p){ nad[p[0] + ',' + p[1]] = 1; });
      var cols = rijen[0] ? rijen[0].length : 0;
      function pijlrij(onder){
        var p = (o.pijlen || []).filter(function(x){ return !!x.onder === onder; }); if (!p.length) return '';
        var cel = []; for (var c = 0; c < cols; c++) cel.push('');
        p.forEach(function(x){ cel[x.naar] = '<span class="lr-pijl">' + (x.van < x.naar ? '' : '') + schoon(x.tekst) + '</span>'; });
        return '<tr class="pijlen">' + cel.map(function(t){ return '<td>' + t + '</td>'; }).join('') + '</tr>';
      }
      return '<table class="lr-tabel' + (o.verhouding ? ' verh' : '') + '">' + pijlrij(false) + rijen.map(function(r, ri){
        return '<tr>' + r.map(function(c, ci){ var kop = (o.kop && ri === 0) || (o.zijkop && ci === 0), t = kop ? 'th' : 'td';
          return '<' + t + (nad[ri + ',' + ci] ? ' class="nadruk"' : '') + '>' + (c === '?' ? '<b class="lr-vraagt">?</b>' : (o.html ? c : schoon(c))) + '</' + t + '>'; }).join('') + '</tr>';
      }).join('') + pijlrij(true) + '</table>';
    },
    /* cijferen onder elkaar: regels als tekst, rechts uitgelijnd; onth: onthouden cijfers erboven; streep: na welke regel */
    cijfer:function(regels, o){
      o = o || {};
      var breed = Math.max.apply(null, regels.concat([o.onth || '']).map(function(r){ return String(r).length; }));
      function rij(t, kl){ t = String(t); while (t.length < breed) t = ' ' + t; return '<tr' + (kl ? ' class="' + kl + '"' : '') + '>' + t.split('').map(function(ch){ return '<td' + (/[+−x×:-]/.test(ch) ? ' class="teken"' : '') + '>' + (ch === ' ' ? '' : schoon(ch)) + '</td>'; }).join('') + '</tr>'; }
      var s = '<table class="lr-cijfer">' + (o.onth ? rij(o.onth, 'onth') : '');
      regels.forEach(function(r, i){ s += rij(r, o.streep != null && i === o.streep + 1 ? 'streep' : (o.strepen && o.strepen.indexOf(i - 1) >= 0 ? 'streep' : '')); });
      return s + '</table>';
    },
    /* een strook in n delen, vol gekleurd; boven/onder: labels bij de deelstreepjes (n+1 stuks) */
    strook:function(n, vol, o){
      o = o || {};
      var W = smal() ? 420 : 600, x0 = 20, w = (W - 40) / n, s = '<svg class="lr-svg" viewBox="0 0 ' + W + ' ' + (o.onder ? 112 : 86) + '" role="img" aria-label="' + schoon(o.aria || ('strook in ' + n + ' delen, ' + vol + ' gekleurd')) + '">';
      for (var i = 0; i < n; i++) s += '<rect x="' + (x0 + i * w) + '" y="30" width="' + w + '" height="34" class="deel' + (i < vol ? ' vol' : '') + '"' + (i < vol && o.kleur ? ' style="fill:' + o.kleur + '"' : '') + '/>';
      s += '<rect x="' + x0 + '" y="30" width="' + (W - 40) + '" height="34" class="rand"/>';
      (o.boven || []).forEach(function(t, i){ if (t !== '' && t != null) s += '<text x="' + (x0 + i * w) + '" y="20" class="getal klein">' + schoon(t) + '</text>'; });
      (o.onder || []).forEach(function(t, i){ if (t !== '' && t != null) s += '<text x="' + (x0 + i * w) + '" y="88" class="getal klein">' + schoon(t) + '</text>'; });
      return s + '</svg>';
    },
    /* het keer-rooster (hokjesmethode): kop:[getallen bovenaan], zij:[getallen links], vak:[[..]] */
    rooster:function(kop, zij, vak){
      return '<table class="lr-tabel rooster"><tr><th>×</th>' + kop.map(function(k){ return '<th>' + schoon(k) + '</th>'; }).join('') + '</tr>' +
        zij.map(function(z, r){ return '<tr><th>' + schoon(z) + '</th>' + kop.map(function(k, c){ var v = vak && vak[r] ? vak[r][c] : ''; return '<td>' + (v === '?' ? '<b class="lr-vraagt">?</b>' : schoon(v == null ? '' : v)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
    },
    /* een wijzerklok */
    klok:function(u, m){
      var s = '<svg class="lr-svg" viewBox="0 0 160 160" style="max-width:180px" role="img" aria-label="klok">' + '<circle cx="80" cy="80" r="72" class="wijzerplaat"/>';
      for (var i = 0; i < 60; i++){ var a = i * 6 * Math.PI / 180, r1 = i % 5 ? 66 : 60; s += '<line x1="' + (80 + Math.sin(a) * r1) + '" y1="' + (80 - Math.cos(a) * r1) + '" x2="' + (80 + Math.sin(a) * 70) + '" y2="' + (80 - Math.cos(a) * 70) + '" class="as' + (i % 5 ? ' dun' : '') + '"/>'; }
      for (i = 1; i <= 12; i++){ a = i * 30 * Math.PI / 180; s += '<text x="' + (80 + Math.sin(a) * 49) + '" y="' + (86 - Math.cos(a) * 49) + '" class="getal klein">' + i + '</text>'; }
      var ah = ((u % 12) + m / 60) * 30 * Math.PI / 180, am = m * 6 * Math.PI / 180;
      s += '<line x1="80" y1="80" x2="' + (80 + Math.sin(ah) * 36) + '" y2="' + (80 - Math.cos(ah) * 36) + '" class="wijzer kort"/>';
      s += '<line x1="80" y1="80" x2="' + (80 + Math.sin(am) * 58) + '" y2="' + (80 - Math.cos(am) * 58) + '" class="wijzer"/><circle cx="80" cy="80" r="4" class="stip"/>';
      return s + '</svg>';
    },
    /* een zin met gemarkeerde stukken: delen = ['tekst', { t:'De hond', k:1, label:'onderwerp' }, ...] */
    zin:function(delen, o){
      o = o || {};
      return '<p class="lr-zin' + (o.dicht ? ' dicht' : '') + '">' + delen.map(function(d){
        if (typeof d === 'string') return '<span class="los">' + schoon(d) + '</span>';
        var k = d.k == null ? 1 : d.k;
        return '<span class="stuk k' + k + (d.doorgehaald ? ' weg' : '') + '"><span class="t">' + schoon(d.t) + '</span>' + (d.label ? '<small>' + schoon(d.label) + '</small>' : '') + '</span>';
      }).join(o.dicht ? '' : ' ') + '</p>';
    },
    /* een woord in stukken (lettergrepen, stam en uitgang): delen zoals bij zin, zonder spaties */
    woord:function(delen){ return teken.zin(delen, { dicht:true }); }
  };
  var R = { heel:heel, kies:kies, hussel:hussel, toon:toon, geld:geld, teken:teken, schoon:schoon };

  /* ---------- voortgang ---------- */
  function lees(){ try { return JSON.parse(localStorage.getItem('lg-route') || '{}') || {}; } catch (e){ return {}; } }
  function zet(id, s){
    var v = lees(); if ((v[id] | 0) >= s) return;
    v[id] = s;
    try { localStorage.setItem('lg-route', JSON.stringify(v)); } catch (e){}
    try { if (window.PROFIEL && PROFIEL.sync) PROFIEL.sync(); } catch (e){}
  }

  /* ---------- de klas ----------
     Is de leerling aan een klas gekoppeld (klas.js), dan gaat na elke ronde Zelf een melding
     naar de klas, met de hele stand van de leerroute: zo ziet de docent in het klasoverzicht
     welke doelen bezig en beheerst zijn. Bij het openen gaat de stand stil mee als hij
     veranderd is sinds de vorige melding (bijvoorbeeld op een ander apparaat beheerst). */
  function meldKlas(extra){
    try {
      if (!window.KLAS || !KLAS.lees || !KLAS.lees()) return;
      var route = lees(), sleutel = KLAS.lees().code + ':' + JSON.stringify(route).length + ':' + Object.keys(route).filter(function(k){ return route[k] === 2; }).length;
      if (extra.stil){ if (localStorage.getItem('lg-route-klas') === sleutel || !Object.keys(route).length) return; }
      KLAS.meld(Object.assign({ spel:'leerroute', vak:vak, route:route }, extra));
      localStorage.setItem('lg-route-klas', sleutel);
    } catch (e){}
  }

  /* ---------- de pagina ---------- */
  var vak = null, V = null, wortel = null;
  function doelenVan(){ return volgorde().reduce(function(a, g){ return a.concat(g.doelen); }, []); }
  function volgorde(){
    var ni = {}, di = {};
    V.niveaus.forEach(function(n, i){ ni[n.id] = i; }); V.domeinen.forEach(function(d, i){ di[d.id] = i; });
    return GROEPEN.filter(function(g){ return g.vak === vak && g.doelen.length; }).sort(function(a, b){
      return (ni[a.niveau] - ni[b.niveau]) || ((di[a.domein] == null ? 99 : di[a.domein]) - (di[b.domein] == null ? 99 : di[b.domein])) || (a.volg - b.volg);
    });
  }
  function status(id){ return lees()[id] | 0; }

  /* ---------- kerndoelen (leerroute/kerndoelen.js) ---------- */
  function KDN(){ return window.LR_KERNDOELEN || null; }
  function kdCodes(g){ var K = KDN(); if (g.kd && g.kd.length) return g.kd; return K && K.koppel[g.id] ? K.koppel[g.id] : []; }
  /* 'rw10A.c' wordt { kd:'rw10', zin:'rw10A', nr:'10', letter:'A', deel:'c' } */
  function kdDelen(code){ var m = /^([a-z]+)(\d+)([A-Z])(?:\.([a-z]))?$/.exec(code) || []; return { kd:m[1] + m[2], zin:m[1] + m[2] + m[3], nr:m[2], letter:m[3], deel:m[4] || '' }; }
  function kdKort(code){ var d = kdDelen(code); return d.nr + d.letter + (d.deel ? d.deel : ''); }
  function kdPillen(g){
    var K = KDN(), c = kdCodes(g); if (!c.length) return '';
    return '<p class="lr-kdrij"><span>kerndoel</span>' + c.map(function(code){ var d = kdDelen(code);
      return '<a class="lr-kd' + (K.hv[code] ? ' hv' : '') + '" href="#k=' + d.zin + '" title="' + schoon('Kerndoel ' + d.nr + d.letter + (d.deel ? ', onderdeel ' + d.deel : '') + ': ' + (K.deel[code] || K.zin[d.zin] || '')) + '">' + kdKort(code) + '</a>'; }).join('') + '</p>';
  }
  function kdBlok(g){
    var K = KDN(), c = kdCodes(g); if (!c.length) return '';
    var perZin = {};
    c.forEach(function(code){ var d = kdDelen(code); (perZin[d.zin] = perZin[d.zin] || []).push(code); });
    var n0 = V.niveaus.filter(function(x){ return x.id === g.niveau; })[0];
    return '<details class="lr-kdblok"><summary><b>Kerndoel' + (c.length > 1 ? 'en' : '') + '</b> ' + Object.keys(perZin).map(function(z){ var d = kdDelen(z + '.x'); return d.nr + d.letter; }).join(', ') +
      ' <span>· ' + (g.niveau === 'basis' ? 'fundament, onder 1F' : 'referentieniveau ' + schoon(n0 ? n0.naam : g.niveau)) + '</span></summary>' +
      Object.keys(perZin).map(function(z){ var d = kdDelen(z + '.x');
        return '<p><b>Kerndoel ' + d.nr + '</b> ' + schoon(K.kd[d.kd] || '') + ' <b>Doelzin ' + d.letter + '</b> ' + schoon(K.zin[z] || '') + '</p><ul>' +
          perZin[z].map(function(code){ var e = kdDelen(code); return e.deel ? '<li><b>' + e.deel + '.</b> ' + schoon(K.deel[code] || '') + (K.hv[code] ? ' <i>(aanvulling havo en vwo)</i>' : '') + '</li>' : ''; }).join('') + '</ul>';
      }).join('') +
      '<p class="lr-kdbron">Uit het Uitvoeringsbesluit WVO 2020, bijlage 1, sinds 1 augustus 2026. <a href="#kerndoelen">Alle kerndoelen bij deze leerroute</a></p></details>';
  }
  /* onderaan het overzicht: per doelzin de onderdelen en welke groepen eraan werken */
  function kdVerantwoording(gr){
    var K = KDN(); if (!K) return '';
    var perZin = {}, volgordeZin = [];
    gr.forEach(function(g){ kdCodes(g).forEach(function(code){ var d = kdDelen(code);
      if (!perZin[d.zin]){ perZin[d.zin] = {}; volgordeZin.push(d.zin); }
      (perZin[d.zin][code] = perZin[d.zin][code] || []).push(g); }); });
    volgordeZin.sort(function(a, b){ var x = kdDelen(a + '.x'), y = kdDelen(b + '.x'); return (+x.nr - +y.nr) || (x.letter < y.letter ? -1 : 1); });
    return '<section class="lr-verant" id="kerndoelen"><h2>Kerndoelen bij deze leerroute</h2>' +
      '<p class="lr-lead">De groepen hierboven zijn gekoppeld aan de kerndoelen voor ' + (vak === 'rekenen' ? 'rekenen en wiskunde (10 tot en met 17)' : 'Nederlands (1 tot en met 9)') +
      ' zoals ze sinds 1 augustus 2026 in de wet staan, tot op het onderdeel van de doelzin. De niveaus (fundament, 1F, 2F, 3F) volgen het referentiekader taal en rekenen. Per groep staan alleen de onderdelen waar hij echt aan werkt.</p>' +
      volgordeZin.map(function(z){ var d = kdDelen(z + '.x');
        return '<div class="lr-kdzin" id="k-' + z + '"><h3>Kerndoel ' + d.nr + d.letter + '</h3><p>' + schoon(K.kd[d.kd] || '') + ' ' + schoon(K.zin[z] || '') + '</p><ul>' +
          Object.keys(perZin[z]).sort().map(function(code){ var e = kdDelen(code);
            return '<li><span><b>' + e.deel + '.</b> ' + schoon(K.deel[code] || '') + (K.hv[code] ? ' <i>(aanvulling havo en vwo)</i>' : '') + '</span><span class="lr-kdgr">' +
              perZin[z][code].map(function(g){ return '<a href="#g=' + g.id + '">' + schoon(g.naam) + '</a>'; }).join('') + '</span></li>'; }).join('') + '</ul></div>';
      }).join('') +
      '<p class="lr-kdbron">Bron: <a href="' + K.wet + '">Uitvoeringsbesluit WVO 2020, bijlage 1</a>, ingevoerd door het <a href="' + K.bron + '">Besluit vernieuwde kerndoelen Nederlands en rekenen en wiskunde (Stb. 2026, 198)</a>. De teksten zijn letterlijk overgenomen.</p></section>';
  }
  function bol(s){ return '<i class="lr-bol s' + s + '" aria-hidden="true">' + (s === 2 ? '<svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></svg>' : '') + '</i>'; }
  var STATUS = ['nog niet geoefend', 'bezig', 'beheerst'];

  function overzicht(naarId){
    document.title = V.naam + ': de leerroute · meneer Greidanus';
    var gr = volgorde(), alle = doelenVan(), v = lees(), klaar = alle.filter(function(d){ return v[d.id] === 2; }).length;
    var volgende = alle.filter(function(d){ return v[d.id] !== 2; })[0];
    var h = '<section class="lr-top"><p class="hand">' + schoon(V.hand) + '</p><h1>' + schoon(V.naam) + ': de hele leerroute</h1>' +
      '<p class="lr-lead">' + schoon(V.lead) + '</p>' +
      '<div class="lr-stand"><div class="lr-balk" role="img" aria-label="' + klaar + ' van ' + alle.length + ' doelen beheerst"><i style="width:' + (alle.length ? Math.round(klaar / alle.length * 100) : 0) + '%"></i></div>' +
      '<p><b>' + klaar + '</b> van de ' + alle.length + ' doelen beheerst</p>' +
      (volgende ? '<a class="btn" href="#d=' + volgende.id + '">' + (klaar || v[volgende.id] ? 'Ga verder: ' : 'Begin bij: ') + schoon(volgende.naam) + '</a>' : '<p class="hand">alles beheerst!</p>') + '</div>' +
      '<p class="lr-hoe"><b>Zo werkt een doel.</b> Je leest de uitleg, kijkt hoe het gaat, doet drie sommen samen met de stappen en dan zes zelf. Heb je er vijf van de zes goed, dan beheers je het doel en krijgt het een vinkje.</p>' +
      '<ol class="lr-nav">' + V.niveaus.map(function(n){ var d = alle.filter(function(x){ return x.groep.niveau === n.id; }); if (!d.length) return '';
        var k = d.filter(function(x){ return v[x.id] === 2; }).length;
        return '<li><a href="#n=' + n.id + '"><b>' + schoon(n.naam) + '</b><span>' + k + '/' + d.length + '</span></a></li>'; }).join('') + '</ol></section>';
    V.niveaus.forEach(function(n){
      var gn = gr.filter(function(g){ return g.niveau === n.id; }); if (!gn.length) return;
      h += '<section class="lr-niveau" id="n-' + n.id + '"><div class="lr-nkop"><span class="lr-nlabel">' + schoon(n.naam) + '</span><p>' + schoon(n.uit) + '</p></div>';
      V.domeinen.forEach(function(dm){
        var gd = gn.filter(function(g){ return g.domein === dm.id; }); if (!gd.length) return;
        h += '<h2 class="lr-dom">' + schoon(dm.naam) + '</h2><div class="lr-groepen">';
        gd.forEach(function(g){
          var k = g.doelen.filter(function(d){ return v[d.id] === 2; }).length;
          h += '<article class="lr-groep" id="g-' + g.id + '"><div class="lr-gkop"><h3>' + schoon(g.naam) + '</h3><span class="lr-tel' + (k === g.doelen.length ? ' af' : '') + '">' + k + '/' + g.doelen.length + '</span></div>' +
            (g.uit ? '<p class="lr-guit">' + schoon(g.uit) + '</p>' : '') + kdPillen(g) +
            '<ol class="lr-doelen">' + g.doelen.map(function(d){ var s = v[d.id] | 0;
              return '<li><a href="#d=' + d.id + '" title="' + STATUS[s] + '">' + bol(s) + '<span><b>' + schoon(d.naam) + '</b>' + (d.kort ? '<small>' + schoon(d.kort) + '</small>' : '') + '</span></a></li>'; }).join('') + '</ol></article>';
        });
        h += '</div>';
      });
      h += '</section>';
    });
    h += kdVerantwoording(gr);
    wortel.innerHTML = h;
    if (naarId){ var el = $(naarId); if (el){ el.scrollIntoView({ block:'start' }); return; } }
    scrollTo(0, 0);
  }

  /* ---------- een doel ---------- */
  var D = null, fase = 1, op = null, n = 0, ronde = [], rNr = 0, zelfGoed = 0, geholpen = false, pogingen = 0;
  var FASES = ['Uitleg', 'Voordoen', 'Samen', 'Zelf'];
  function nieuweOpgave(gezien){
    for (var p = 0; p < 40; p++){ var o = D.maak(R); if (!gezien || !gezien[o.vraag + '|' + (o.context || '')]){ if (gezien) gezien[o.vraag + '|' + (o.context || '')] = 1; return o; } }
    return D.maak(R);
  }
  function kop(){
    var g = D.groep, n0 = V.niveaus.filter(function(x){ return x.id === g.niveau; })[0], s = status(D.id);
    return '<nav class="lr-kruim" aria-label="Waar je bent"><a href="#">' + schoon(V.naam) + '</a><span>›</span><a href="#n=' + g.niveau + '">' + schoon(n0 ? n0.naam : g.niveau) + '</a><span>›</span><a href="#g=' + g.id + '">' + schoon(g.naam) + '</a></nav>' +
      '<div class="lr-dkop"><h1>' + schoon(D.naam) + '</h1>' + (s ? '<span class="lr-label s' + s + '">' + bol(s) + STATUS[s] + '</span>' : '') + '</div>' +
      (D.kort ? '<p class="lr-kort">' + schoon(D.kort) + '</p>' : '') +
      '<ol class="lr-fases">' + FASES.map(function(f, i){ return '<li><button type="button" data-fase="' + (i + 1) + '" class="' + (i + 1 === fase ? 'nu' : i + 1 < fase ? 'gedaan' : '') + '"' + (i + 1 === fase ? ' aria-current="step"' : '') + '><b>' + (i + 1) + '</b>' + f + '</button></li>'; }).join('') + '</ol>';
  }
  function toonDoel(){
    var h = kop() + '<div class="lr-kaart" id="lrKaart"></div>';
    wortel.innerHTML = h;
    Array.prototype.forEach.call(wortel.querySelectorAll('[data-fase]'), function(b){ b.addEventListener('click', function(){ startFase(+b.getAttribute('data-fase')); }); });
  }
  function openDoel(id){
    D = OP_ID[id]; if (!D || D.vak !== vak){ overzicht(); return; }
    document.title = D.naam + ' · ' + V.naam + ' · meneer Greidanus';
    startFase(1);
    scrollTo(0, 0);
  }
  function startFase(f){
    fase = f; toonDoel();
    if (f === 1) uitleg();
    else if (f === 2){ op = nieuweOpgave(); n = 0; voordoen(); }
    else if (f === 3){ ronde = []; var gz = {}; for (var i = 0; i < SAMEN; i++) ronde.push(nieuweOpgave(gz)); rNr = 0; samen(); }
    else { ronde = []; gz = {}; for (i = 0; i < ZELF; i++) ronde.push(nieuweOpgave(gz)); rNr = 0; zelfGoed = 0; ronde.forEach(function(o){ o.uit = null; }); zelf(); }
  }
  function kaart(){ return $('lrKaart'); }
  function knoppen(lijst){ return '<div class="lr-knoppen">' + lijst.join('') + '</div>'; }
  function broers(){
    var b = D.groep.doelen.filter(function(d){ return d !== D; });
    if (!b.length) return '';
    var v = lees();
    return '<div class="lr-broers"><p class="eyebrow">andere manieren en doelen bij ' + schoon(D.groep.naam.toLowerCase()) + '</p><ul>' +
      b.map(function(d){ return '<li><a href="#d=' + d.id + '">' + bol(v[d.id] | 0) + schoon(d.naam) + '</a></li>'; }).join('') + '</ul></div>';
  }
  function uitleg(){
    var vb = D.beeld || '';
    if (!vb){ try { var o = D.maak(R); vb = beeldVan(o, (o.stappen || []).length); } catch (e){} }
    kaart().innerHTML = '<p class="eyebrow">1 · de uitleg</p>' +
      '<div class="lr-uit">' + (D.uit || '') + '</div>' +
      (vb ? '<div class="lr-beeld">' + vb + '</div>' : '') +
      (D.wanneer ? '<p class="lr-wanneer"><b>Handig als</b> ' + schoon(D.wanneer) + '</p>' : '') + kdBlok(D.groep) +
      knoppen(['<button class="btn" type="button" id="lrVerder">Laat zien hoe het gaat</button>', '<a class="linkbtn" href="#g=' + D.groep.id + '">Terug naar de leerroute</a>']) + broers();
    $('lrVerder').addEventListener('click', function(){ startFase(2); });
  }
  function vraagBlok(o){
    return (o.context ? '<p class="lr-context">' + o.context + '</p>' : '') + '<div class="lr-som">' + (o.vraagHtml || schoon(o.vraag)) + '</div>';
  }
  function stapTekst(st, ant){
    var t = st.tekst || '';
    return '<span class="lr-stekst">' + t + '</span>' + (ant != null ? ' <b class="lr-sant">' + schoon(ant) + '</b>' : '');
  }
  function antVan(st){ return st.opties ? st.opties[st.goed] : st.info ? null : eerste(st.antwoord); }
  /* 2: voordoen. Elke klik een stap erbij, het plaatje groeit mee */
  /* 2: voordoen. Net als samen: elke stap met zijn invulvak of keuzeknoppen. Het vak dat
     aan de beurt is licht op; bij Volgende stap typt de motor het antwoord erin, en het
     wordt groen. Zo zie je precies waar je straks wat invult. */
  var typKlok = null;
  function voordoenVak(s, stand){
    /* stand: 'leeg' (nog niet aan de beurt), 'nu' (licht op, nog leeg), 'typ' (wordt nu ingevuld), 'vol' (al ingevuld) */
    var ant = antVan(s);
    if (s.opties) return '<div class="lr-opties lr-voor" role="group" aria-label="keuzes">' + s.opties.map(function(t, i){
      return '<button type="button" class="lr-optie' + (i === s.goed && (stand === 'vol' || stand === 'typ') ? ' goed' + (stand === 'typ' ? ' tik' : '') : '') + '" disabled>' + schoon(t) + '</button>'; }).join('') + '</div>';
    return '<span class="lr-invul lr-voor"><input type="text" disabled tabindex="-1" aria-label="invulvak" value="' + (stand === 'vol' ? schoon(ant) : '') + '"' +
      ' class="' + (stand === 'vol' ? 'goed' : stand === 'nu' ? 'wacht' : stand === 'typ' ? 'wacht typ' : '') + '"' + (stand === 'typ' ? ' data-typ="' + schoon(ant) + '"' : '') + '>' +
      (s.eenheid ? '<span class="lr-eenh">' + schoon(s.eenheid) + '</span>' : '') + '</span>';
  }
  function voordoen(typNu){
    clearTimeout(typKlok);
    var st = op.stappen || [], af = n >= st.length, b = beeldVan(op, typNu ? n - 1 : n);
    kaart().innerHTML = '<p class="eyebrow">2 · kijk hoe het gaat</p>' + vraagBlok(op) +
      (b ? '<div class="lr-beeld" aria-live="polite">' + b + '</div>' : '') +
      '<ol class="lr-stappen">' + st.map(function(s, i){
        if (s.info) return i < n ? '<li class="klaar' + (i === n - 1 ? ' nieuw' : '') + '">' + stapTekst(s) + '</li>' : '<li class="later" aria-hidden="true"><span class="lr-stekst">…</span></li>';
        var typ = typNu && i === n - 1, stand = typ ? 'typ' : i < n ? 'vol' : i === n ? 'nu' : 'leeg';
        if (stand === 'leeg') return '<li class="later" aria-hidden="true"><span class="lr-stekst">…</span></li>';
        return '<li class="' + (stand === 'nu' ? 'nu' : 'klaar') + (typ ? ' nieuw' : '') + '">' + stapTekst(s) + voordoenVak(s, stand) +
          (stand === 'vol' && s.waarom ? '<small>' + s.waarom + '</small>' : '') +
          (stand === 'nu' ? '<p class="lr-hier">' + (s.opties ? 'Hier kies je straks het goede antwoord.' : 'Hier vul je straks het antwoord in.') + '</p>' : '') + '</li>';
      }).join('') + '</ol>' +
      (af ? '<p class="lr-eind">Het antwoord: <b>' + schoon(eindAnt(op)) + (op.eenheid ? ' ' + schoon(op.eenheid) : '') + '</b></p>' : '') +
      knoppen(af ? ['<button class="btn" type="button" id="lrVerder">Nu samen</button>', '<button class="btn tweede" type="button" id="lrNog">Nog een voorbeeld</button>']
                 : ['<button class="btn" type="button" id="lrStap">' + (n ? 'Volgende stap' : 'Vul de eerste stap in') + '</button>', '<button class="linkbtn" type="button" id="lrAlles">Alles in een keer</button>']);
    /* het antwoord letter voor letter in het vak, dan groen en het plaatje erbij */
    var inp = kaart().querySelector('input[data-typ]');
    if (inp){
      var tekst = inp.getAttribute('data-typ'), k = 0, rustig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      var klaar = function(){ inp.value = tekst; inp.classList.remove('wacht', 'typ'); inp.classList.add('goed'); var bl = kaart().querySelector('.lr-beeld'), nb = beeldVan(op, n); if (bl && nb) bl.innerHTML = nb; };
      if (rustig) klaar();
      else (function tik(){ if (!inp.isConnected) return; k++; inp.value = tekst.slice(0, k); if (k < tekst.length) typKlok = setTimeout(tik, 70 + Math.random() * 60); else typKlok = setTimeout(klaar, 160); })();
    } else if (typNu){ var bl = kaart().querySelector('.lr-beeld'), nb = beeldVan(op, n); if (bl && nb) bl.innerHTML = nb; }
    var nu = kaart().querySelector('.lr-stappen li.nu, .lr-stappen li.nieuw');
    if (nu && nu.getBoundingClientRect().bottom > innerHeight - 120) nu.scrollIntoView({ block:'center', behavior:'smooth' });
    if (af){ $('lrVerder').addEventListener('click', function(){ startFase(3); }); $('lrNog').addEventListener('click', function(){ op = nieuweOpgave(); n = 0; voordoen(); }); $('lrVerder').focus({ preventScroll:true }); }
    else {
      $('lrStap').addEventListener('click', function(){ n++; voordoen(true); });
      $('lrAlles').addEventListener('click', function(){ n = st.length; voordoen(); });
      $('lrStap').focus({ preventScroll:true });
    }
  }
  function eindAnt(o){ if (o.opties) return o.opties[o.goed]; if (o.antwoord != null) return eerste(o.antwoord); var st = o.stappen || []; for (var i = st.length - 1; i >= 0; i--){ var a = antVan(st[i]); if (a != null) return a; } return ''; }
  function invoerHtml(st, id){
    if (st.opties) return '<div class="lr-opties" role="group">' + st.opties.map(function(t, i){ return '<button type="button" class="lr-optie" data-i="' + i + '">' + schoon(t) + '</button>'; }).join('') + '</div>';
    return '<span class="lr-invul"><input id="' + id + '" type="text" inputmode="' + (st.invoer === 'tekst' || (st.antwoord != null && !/^[\d\s.,€−-]+$/.test(String(eerste(st.antwoord)))) ? 'text' : 'decimal') + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Jouw antwoord">' +
      (st.eenheid ? '<span class="lr-eenh">' + schoon(st.eenheid) + '</span>' : '') + '<button class="btn klein" type="button" id="' + id + 'K">Kijk na</button></span>';
  }
  /* 3: samen. Elke stap zelf invullen; fout geeft een hint, twee keer fout geeft het antwoord */
  function samen(){
    op = ronde[rNr]; n = 0; geholpen = false; samenStap();
  }
  function samenStap(){
    var st = op.stappen || [];
    while (n < st.length && st[n].info) n++;
    var af = n >= st.length, b = beeldVan(op, n);
    pogingen = 0;
    kaart().innerHTML = '<p class="eyebrow">3 · samen · som ' + (rNr + 1) + ' van ' + ronde.length + '</p>' + vraagBlok(op) +
      (b ? '<div class="lr-beeld" aria-live="polite">' + b + '</div>' : '') +
      '<ol class="lr-stappen">' + st.map(function(s, i){
        if (i < n) return '<li class="klaar' + (s.geholpen ? ' geholpen' : '') + '">' + stapTekst(s, antVan(s)) + '</li>';
        if (i === n) return '<li class="nu">' + stapTekst(s) + invoerHtml(s, 'lrIn') + '<p class="lr-terug" id="lrTerug" role="status" aria-live="polite"></p></li>';
        return '<li class="later" aria-hidden="true"><span class="lr-stekst">…</span></li>';
      }).join('') + '</ol>' +
      (af ? '<p class="lr-eind">Het antwoord: <b>' + schoon(eindAnt(op)) + (op.eenheid ? ' ' + schoon(op.eenheid) : '') + '</b>' + (geholpen ? '' : ' <span class="lr-goedtxt">Alle stappen zelf!</span>') + '</p>' +
        knoppen([rNr < ronde.length - 1 ? '<button class="btn" type="button" id="lrVerder">Volgende som</button>' : '<button class="btn" type="button" id="lrVerder">Nu zelf</button>']) : '');
    if (af){ zet(D.id, 1); $('lrVerder').addEventListener('click', function(){ if (rNr < ronde.length - 1){ rNr++; samen(); } else startFase(4); }); $('lrVerder').focus({ preventScroll:true }); return; }
    koppelStap(st[n], function(ok){
      if (ok){ n++; samenStap(); return; }
    });
  }
  function koppelStap(s, klaar){
    var tk = $('lrTerug');
    function fout(waarde){
      pogingen++;
      var eigen = s.fout && waarde != null ? s.fout[String(waarde).trim().toLowerCase()] : null;
      if (pogingen >= 2){
        s.geholpen = true; geholpen = true;
        tk.className = 'lr-terug fout'; tk.innerHTML = (eigen ? schoon(eigen) + ' ' : '') + 'Het is <b>' + schoon(antVan(s)) + '</b>. ' + (s.hint ? schoon(s.hint) : '');
        var vb = document.createElement('button'); vb.type = 'button'; vb.className = 'btn klein'; vb.textContent = 'Verder'; vb.id = 'lrDoor';
        tk.parentNode.appendChild(vb); vb.addEventListener('click', function(){ klaar(true); }); vb.focus({ preventScroll:true });
        var inp = $('lrIn'); if (inp) inp.disabled = true;
        Array.prototype.forEach.call(document.querySelectorAll('.lr-optie'), function(b){ b.disabled = true; });
        var kk = $('lrInK'); if (kk) kk.disabled = true;
        return;
      }
      tk.className = 'lr-terug hint'; tk.innerHTML = (eigen ? schoon(eigen) + ' ' : 'Nog niet. ') + (s.hint ? '<b>Hint:</b> ' + schoon(s.hint) : 'Kijk nog eens goed.');
    }
    if (s.opties){
      Array.prototype.forEach.call(document.querySelectorAll('.lr-optie'), function(b){
        b.addEventListener('click', function(){
          var i = +b.getAttribute('data-i');
          if (i === s.goed){ b.classList.add('goed'); setTimeout(function(){ klaar(true); }, 380); }
          else { b.classList.add('fout'); b.disabled = true; fout(s.opties[i]); }
        });
      });
      var eerst = document.querySelector('.lr-optie'); if (eerst) eerst.focus({ preventScroll:true });
      return;
    }
    var inp = $('lrIn');
    function kijk(){
      var w = inp.value; if (!w.trim()) return;
      if (klopt(w, s.antwoord, s.controle)){ inp.classList.add('goed'); inp.disabled = true; setTimeout(function(){ klaar(true); }, 320); }
      else { inp.classList.add('fout'); setTimeout(function(){ inp.classList.remove('fout'); }, 600); fout(w); if (pogingen < 2){ inp.select(); } }
    }
    $('lrInK').addEventListener('click', kijk);
    inp.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); kijk(); } });
    setTimeout(function(){ try { inp.focus({ preventScroll:true }); } catch (e){} }, 30);
  }
  /* 4: zelf. Alleen het eindantwoord; bij fout of "ik zit vast" de uitwerking */
  function zelf(){
    op = ronde[rNr];
    var st = { antwoord:op.antwoord != null ? op.antwoord : eindAnt(op), controle:op.controle, opties:op.opties, goed:op.goed, eenheid:op.eenheid, invoer:op.invoer };
    if (op.opties){ st.opties = op.opties; st.goed = op.goed; }
    kaart().innerHTML = '<p class="eyebrow">4 · zelf · som ' + (rNr + 1) + ' van ' + ronde.length + '</p>' + vraagBlok(op) +
      (op.zelfBeeld ? '<div class="lr-beeld">' + beeldVan({ beeld:op.zelfBeeld }, 0) + '</div>' : '') +
      '<div class="lr-zelfin">' + invoerHtml(st, 'lrIn') + '</div><p class="lr-terug" id="lrTerug" role="status" aria-live="polite"></p>' +
      '<div class="lr-bollen" aria-label="' + zelfGoed + ' goed">' + ronde.map(function(o, i){ return '<i class="' + (o.uit === true ? 'goed' : o.uit === false ? 'fout' : i === rNr ? 'nu' : '') + '"></i>'; }).join('') + '</div>' +
      '<div id="lrUitw"></div>' + knoppen(['<button class="linkbtn" type="button" id="lrVast">Ik zit vast: help me stap voor stap</button>']);
    var klaarMet = function(ok){
      op.uit = ok; if (ok) zelfGoed++;
      var tk = $('lrTerug');
      tk.className = 'lr-terug ' + (ok ? 'goed' : 'fout');
      tk.innerHTML = ok ? kies(['Goed!', 'Klopt!', 'Precies.', 'Goed zo.']) : 'Niet goed. Het is <b>' + schoon(eindAnt(op)) + (op.eenheid ? ' ' + schoon(op.eenheid) : '') + '</b>. Zo gaat het:';
      $('lrVast').classList.add('hide');
      if (!ok) $('lrUitw').innerHTML = (beeldVan(op, (op.stappen || []).length) ? '<div class="lr-beeld">' + beeldVan(op, (op.stappen || []).length) + '</div>' : '') +
        '<ol class="lr-stappen">' + (op.stappen || []).map(function(s){ return '<li class="klaar">' + stapTekst(s, antVan(s)) + '</li>'; }).join('') + '</ol>';
      var vb = document.createElement('button'); vb.type = 'button'; vb.className = 'btn lr-volg'; vb.textContent = rNr < ronde.length - 1 ? 'Volgende' : 'Bekijk je uitslag';
      $('lrUitw').appendChild(vb); vb.addEventListener('click', function(){ if (rNr < ronde.length - 1){ rNr++; zelf(); } else eind(); }); vb.focus({ preventScroll:true });
    };
    if (op.opties){
      Array.prototype.forEach.call(document.querySelectorAll('.lr-optie'), function(b){
        b.addEventListener('click', function(){ var i = +b.getAttribute('data-i'); Array.prototype.forEach.call(document.querySelectorAll('.lr-optie'), function(x){ x.disabled = true; if (+x.getAttribute('data-i') === op.goed) x.classList.add('goed'); }); if (i !== op.goed) b.classList.add('fout'); klaarMet(i === op.goed); });
      });
    } else {
      var inp = $('lrIn');
      var kijk = function(){ if (inp.disabled || !inp.value.trim()) return; inp.disabled = true; $('lrInK').disabled = true; var ok = klopt(inp.value, st.antwoord, op.controle); inp.classList.add(ok ? 'goed' : 'fout'); klaarMet(ok); };
      $('lrInK').addEventListener('click', kijk);
      inp.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); kijk(); } });
      setTimeout(function(){ try { inp.focus({ preventScroll:true }); } catch (e){} }, 30);
    }
    /* vast: deze som telt niet als zelf goed, maar je doet hem samen met de stappen */
    $('lrVast').addEventListener('click', function(){
      op.uit = false;
      (op.stappen || []).forEach(function(s){ s.geholpen = false; });
      n = 0; geholpen = true; pogingen = 0;
      zelfSamen(function(){});
    });
  }
  function zelfSamen(na){
    var st = op.stappen || [];
    while (n < st.length && st[n].info) n++;
    var af = n >= st.length, b = beeldVan(op, n);
    pogingen = 0;
    kaart().innerHTML = '<p class="eyebrow">4 · zelf · som ' + (rNr + 1) + ' van ' + ronde.length + ' · samen met de stappen</p>' + vraagBlok(op) +
      (b ? '<div class="lr-beeld">' + b + '</div>' : '') +
      '<ol class="lr-stappen">' + st.map(function(s, i){
        if (i < n) return '<li class="klaar">' + stapTekst(s, antVan(s)) + '</li>';
        if (i === n) return '<li class="nu">' + stapTekst(s) + invoerHtml(s, 'lrIn') + '<p class="lr-terug" id="lrTerug" role="status" aria-live="polite"></p></li>';
        return '<li class="later" aria-hidden="true"><span class="lr-stekst">…</span></li>';
      }).join('') + '</ol>' +
      (af ? '<p class="lr-eind">Het antwoord: <b>' + schoon(eindAnt(op)) + '</b>. Deze telt niet als zelf goed, maar nu weet je hoe het gaat.</p>' + knoppen(['<button class="btn" type="button" id="lrVerder">' + (rNr < ronde.length - 1 ? 'Volgende' : 'Bekijk je uitslag') + '</button>']) : '');
    if (af){ na(); $('lrVerder').addEventListener('click', function(){ if (rNr < ronde.length - 1){ rNr++; zelf(); } else eind(); }); $('lrVerder').focus({ preventScroll:true }); return; }
    koppelStap(st[n], function(){ n++; zelfSamen(na); });
  }
  function eind(){
    var ok = zelfGoed >= BEHEERST;
    zet(D.id, ok ? 2 : 1);
    meldKlas({ ronde:zelfGoed, punten:ok ? 1 : 0, niveau:D.groep.niveau });
    var alle = doelenVan(), i = alle.indexOf(D), v = lees(), volgende = null;
    for (var j = i + 1; j < alle.length; j++) if (v[alle[j].id] !== 2){ volgende = alle[j]; break; }
    toonDoel();
    Array.prototype.forEach.call(wortel.querySelectorAll('.lr-fases button'), function(b){ b.classList.remove('nu'); b.classList.add('gedaan'); });
    kaart().innerHTML = '<p class="eyebrow">je uitslag</p><h2 class="lr-uitkop">' + (zelfGoed === ZELF ? 'Foutloos!' : ok ? 'Beheerst!' : zelfGoed >= 3 ? 'Bijna' : 'Nog even oefenen') + '</h2>' +
      '<div class="lr-bollen groot">' + ronde.map(function(o){ return '<i class="' + (o.uit ? 'goed' : 'fout') + '"></i>'; }).join('') + '</div>' +
      '<p class="lr-uit">Je had er <b>' + zelfGoed + ' van de ' + ZELF + '</b> zelf goed. ' + (ok ? 'Dit doel heeft nu een vinkje in je leerroute.' : 'Bij ' + BEHEERST + ' goed krijgt het een vinkje. Kijk nog eens naar de uitleg of doe de sommen samen.') + '</p>' +
      knoppen((ok && volgende ? ['<a class="btn" href="#d=' + volgende.id + '">Volgende: ' + schoon(volgende.naam) + '</a>'] : []).concat(
        ok ? ['<button class="btn tweede" type="button" id="lrNogeens">Nog een ronde</button>'] : ['<button class="btn" type="button" id="lrNogeens">Nog een ronde zelf</button>', '<button class="btn tweede" type="button" id="lrSamen">Eerst weer samen</button>'],
        ['<a class="linkbtn" href="#g=' + D.groep.id + '">Terug naar de leerroute</a>'])) + broers();
    $('lrNogeens').addEventListener('click', function(){ startFase(4); });
    var s = $('lrSamen'); if (s) s.addEventListener('click', function(){ startFase(3); });
  }

  /* ---------- laden en de adresbalk ---------- */
  function route(){
    var h = location.hash.replace(/^#/, ''), m;
    if ((m = /^d=([a-z0-9-]+)$/.exec(h))) openDoel(m[1]);
    else if ((m = /^g=([a-z0-9-]+)$/.exec(h))) overzicht('g-' + m[1]);
    else if ((m = /^n=([a-z0-9]+)$/i.exec(h))) overzicht('n-' + m[1]);
    else if ((m = /^k=([a-z]+\d+[A-Z])$/.exec(h))) overzicht('k-' + m[1]);
    else if (h === 'kerndoelen') overzicht('kerndoelen');
    else overzicht();
  }
  function laad(lijst, klaar){
    var i = 0;
    (function volgende(){
      if (i >= lijst.length){ klaar(); return; }
      var s = document.createElement('script'); s.src = 'leerroute/' + lijst[i++] + '.js?v=' + (window.LR_VERSIE || '1');
      s.onload = volgende; s.onerror = volgende; document.head.appendChild(s);
    })();
  }
  function start(){
    wortel = $('lr');
    var m = /[?&]vak=([a-z]+)/.exec(location.search);
    vak = m && VAKKEN[m[1]] ? m[1] : 'rekenen'; V = VAKKEN[vak];
    document.documentElement.style.setProperty('--vak', V.kleur);
    var naam = document.querySelector('.lgnaam > span'); if (naam) naam.textContent = V.naam + ': de leerroute';
    wortel.innerHTML = '<p class="lr-laden">De leerroute laden…</p>';
    laad(['kerndoelen'].concat(BESTANDEN[vak]), function(){ mixen(); setTimeout(function(){ meldKlas({ stil:true }); }, 1500); route(); window.addEventListener('hashchange', route); });
  }
  return { voeg:voeg, start:start, R:R, teken:teken, _klopt:klopt, _mixen:mixen, _staat:function(){ return { op:op, n:n, fase:fase, eind:op ? eindAnt(op) : null }; }, _doelen:function(){ return DOELEN; }, _groepen:function(){ return GROEPEN; }, VAKKEN:VAKKEN, BESTANDEN:BESTANDEN };
})();
