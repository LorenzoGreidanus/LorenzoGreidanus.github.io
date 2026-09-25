/* Eigen materiaal van docenten: woordenlijsten en oefeningen.

   Gedeeld door maken.html (de docent maakt en bewaart), oefen.html (de leerling
   oefent) en bank.js (een woordenlijst als vak in de spellen).

     EIGEN.haal(code)            -> belofte met het materiaal
     EIGEN.bewaar(m, code?)      -> nieuw (zonder code) of aanpassen; zet het in de eigen lijst
     EIGEN.weg(code)             -> weghalen, van de server en uit de eigen lijst
     EIGEN.mijn()                -> de eigen lijst op dit apparaat [{code, sleutel, naam, soort, gemaakt}]
     EIGEN.afstemmen()           -> de eigen lijst met het Microsoft-account gelijk trekken
     EIGEN.vragenUitLijst(m)     -> een woordenlijst als meerkeuzevragen voor de spellen
     EIGEN.oefeningUitLijst(m,n) -> een woordenlijst als oefening voor oefen.html
     EIGEN.plakken(tekst)        -> paren uit geplakte tekst (tab, =, ;, : of " - ")
     EIGEN.kiezer(el, opts)      -> een kiezer voor de klasspellen: je eigen lijsten als knoppen, en een vakje voor een code
     EIGEN.volledig/uitslagen/nakijk/instel/wisUitslag(code, ...)  -> met de sleutel, voor de docent
     EIGEN.inlever(code, { sid, naam, klas, a })                   -> de leerling levert in, de server rekent */
var EIGEN = (function(){
  'use strict';
  var SLEUTEL = 'lg-materiaal', WEG = 'lg-materiaal-weg';
  function lees(k, anders){ try { var x = JSON.parse(localStorage.getItem(k) || 'null'); return x == null ? anders : x; } catch (e){ return anders; } }
  function zet(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e){} }
  function mijn(){ var l = lees(SLEUTEL, []); return Array.isArray(l) ? l.filter(function(m){ return m && m.code && m.sleutel; }) : []; }
  function zetMijn(l){ zet(SLEUTEL, l.slice(0, 200)); }

  function vraag(pad, methode, body){
    return fetch(pad, { method: methode || 'GET', cache: 'no-store',
      headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined })
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){
        if (!r.ok) { var f = new Error(j.fout || 'Dat lukte niet.'); f.status = r.status; throw f; }
        return j;
      }); });
  }
  function haal(code){
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!/^[A-Z0-9]{6}$/.test(code)) return Promise.reject(new Error('Een code heeft zes tekens, bijvoorbeeld K7M2QX.'));
    return vraag('/api/materiaal/' + code);
  }
  function bewaar(m, code){
    var eigen = code ? mijn().filter(function(x){ return x.code === code; })[0] : null;
    if (code && !eigen) return Promise.reject(new Error('Dit materiaal staat niet bij jou; je kunt het niet aanpassen.'));
    var p = code ? vraag('/api/materiaal/' + code + '/werk', 'POST', Object.assign({ sleutel: eigen.sleutel }, m))
                 : vraag('/api/materiaal', 'POST', m);
    return p.then(function(j){
      var c = code || j.code, l = mijn().filter(function(x){ return x.code !== c; });
      l.unshift({ code: c, sleutel: code ? eigen.sleutel : j.sleutel, naam: m.naam, soort: m.soort, gemaakt: eigen ? eigen.gemaakt : Date.now() });
      zetMijn(l);
      afstemmen();
      return { code: c };
    });
  }
  function weg(code){
    var eigen = mijn().filter(function(x){ return x.code === code; })[0];
    var klaar = function(){
      zetMijn(mijn().filter(function(x){ return x.code !== code; }));
      var w = lees(WEG, []); if (w.indexOf(code) < 0) w.push(code); zet(WEG, w);
      afstemmen();
    };
    if (!eigen){ klaar(); return Promise.resolve(); }
    return vraag('/api/materiaal/' + code + '/weg', 'POST', { sleutel: eigen.sleutel }).then(klaar);
  }
  /* Met de sleutel van wie het maakte: alles ophalen, de uitslagen, nakijken en de norm. */
  function metSleutel(code, pad, extra){
    var eigen = mijn().filter(function(x){ return x.code === code; })[0];
    if (!eigen) return Promise.reject(new Error('Dit materiaal staat niet bij jou.'));
    return vraag('/api/materiaal/' + code + '/' + pad, 'POST', Object.assign({ sleutel: eigen.sleutel }, extra || {}));
  }
  function volledig(code){ return metSleutel(code, 'volledig'); }
  function uitslagen(code){ return metSleutel(code, 'uitslagen'); }
  function nakijk(code, sid, i, punt){ return metSleutel(code, 'nakijk', { sid: sid, i: i, punt: punt }); }
  function instel(code, x){ return metSleutel(code, 'instel', x); }
  function wisUitslag(code, sid){ return metSleutel(code, 'wisuitslag', { sid: sid }); }
  /* een plaatje bij de toets zetten (data-url), en waar het daarna staat */
  function afbeelding(code, data){ return metSleutel(code, 'afb', { data: data }); }
  function afbAdres(code, id){ return '/api/materiaal/' + code + '/afb/' + id; }
  /* Een plaatje verkleinen in de browser: hoogstens 1200 beeldpunten, als jpeg.
     Zo blijft het onder de 400 kB die de server aanneemt. */
  function verklein(file, max){
    max = max || 1200;
    return new Promise(function(res, rej){
      if (!file || !/^image\//.test(file.type)) return rej(new Error('Kies een plaatje: jpg, png of webp.'));
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function(){
        URL.revokeObjectURL(url);
        var s = Math.min(1, max / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
        var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.naturalWidth * s)); c.height = Math.max(1, Math.round(img.naturalHeight * s));
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        var q = 0.82, uit = c.toDataURL('image/jpeg', q);
        while (uit.length > 520000 && q > 0.4){ q -= 0.12; uit = c.toDataURL('image/jpeg', q); }
        if (uit.length > 520000) return rej(new Error('Dit plaatje blijft te groot, ook verkleind. Snijd het bij of kies een ander.'));
        res(uit);
      };
      img.onerror = function(){ URL.revokeObjectURL(url); rej(new Error('Dit bestand kan ik niet lezen als plaatje.')); };
      img.src = url;
    });
  }
  /* een leerling levert zijn antwoorden in */
  function inlever(code, body){ return vraag('/api/materiaal/' + code + '/inlever', 'POST', body); }

  /* Met Microsoft ingelogd: de lijst gaat mee naar het account en komt terug op
     een ander apparaat. Niet ingelogd: dan blijft hij hier, en dat is genoeg. */
  function afstemmen(){
    if (typeof fetch !== 'function') return Promise.resolve(null);
    var hier = mijn(), w = lees(WEG, []);
    return vraag('/api/account/materiaal', 'POST', { materiaal: hier, weg: w })
      .then(function(j){
        zet(WEG, []);
        var heb = {}; mijn().forEach(function(x){ heb[x.code] = x; });
        (j.materiaal || []).forEach(function(x){ if (!heb[x.code]) heb[x.code] = x; });
        var l = Object.keys(heb).map(function(c){ return heb[c]; }).sort(function(a, b){ return (b.gemaakt || 0) - (a.gemaakt || 0); });
        zetMijn(l);
        return l;
      }).catch(function(){ return null; });
  }

  function schud(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), h = a[i]; a[i] = a[j]; a[j] = h; } return a; }
  /* drie andere antwoorden uit dezelfde lijst, zonder dubbele */
  function afleiders(paren, i, kant, n){
    var goed = paren[i][kant].toLowerCase(), gezien = {}, uit = [];
    gezien[goed] = 1;
    schud(paren.map(function(p, k){ return k; })).forEach(function(k){
      if (uit.length >= n || k === i) return;
      var x = paren[k][kant]; if (gezien[x.toLowerCase()]) return;
      gezien[x.toLowerCase()] = 1; uit.push(x);
    });
    return uit;
  }
  function vraagTekst(woord, naar){ return naar ? woord + ' → ' + naar.toLowerCase() + '?' : 'Wat hoort bij: ' + woord + '?'; }
  /* De woordenlijst als meerkeuzevragen, beide kanten op: zo gebruiken de
     spellen hem als een vak. t zegt welke kant op. */
  function vragenUitLijst(m){
    var p = (m && m.paren) || [], uit = [];
    p.forEach(function(x, i){
      uit.push({ v: vraagTekst(x.a, m.kopB), o: [x.b].concat(afleiders(p, i, 'b', 3)), g: 0, u: x.a + ' = ' + x.b + '.', t: 'heen' });
      uit.push({ v: vraagTekst(x.b, m.kopA), o: [x.a].concat(afleiders(p, i, 'a', 3)), g: 0, u: x.b + ' = ' + x.a + '.', t: 'terug' });
    });
    return uit;
  }
  /* De woordenlijst als oefening: meerkeuze beide kanten op, een paar keer
     typen, en een ronde koppelen. */
  function oefeningUitLijst(m, n){
    var p = schud((m && m.paren) || []), items = [];
    n = Math.min(n || 12, p.length);
    p.slice(0, n).forEach(function(x, i){
      var alle = (m.paren || []);
      var j = alle.indexOf(x);
      if (i % 3 === 2) items.push({ vorm: 'open', vraag: vraagTekst(x.a, m.kopB), antwoorden: [x.b] });
      else if (i % 2) items.push({ vorm: 'mk', vraag: vraagTekst(x.b, m.kopA), goed: x.a, fout: afleiders(alle, j, 'a', 3) });
      else items.push({ vorm: 'mk', vraag: vraagTekst(x.a, m.kopB), goed: x.b, fout: afleiders(alle, j, 'b', 3) });
    });
    if (p.length >= 4) items.push({ vorm: 'koppel', vraag: 'Koppel wat bij elkaar hoort.', paren: schud(p).slice(0, Math.min(6, p.length)) });
    return { soort: 'oefening', naam: m.naam, modus: 'oefenen', items: items, uitLijst: true };
  }
  /* Geplakt uit Word, Excel of een lijstje: elke regel een paar. */
  function plakken(tekst){
    return String(tekst || '').split(/\r?\n/).map(function(r){
      r = r.trim(); if (!r) return null;
      var m = r.split('\t'); if (m.length < 2) m = r.split(/\s*=\s*|\s*;\s*|\s+-\s+|\s*:\s+/);
      if (m.length < 2) return null;
      var a = m[0].trim(), b = m.slice(1).join(' ').trim();
      return a && b ? { a: a, b: b } : null;
    }).filter(Boolean);
  }
  /* De kiezer voor Tekenslag, de Klasquiz en de Klasstrijd. Je eigen
     woordenlijsten van dit apparaat staan als knoppen; een lijst van een
     collega haal je met de code. opts.gekozen(m, code) krijgt de lijst zodra
     hij binnen is, opts.leeg() als er niets (meer) gekozen is, opts.code is
     een code om meteen mee te beginnen (uit het adres). */
  function htmlSchoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function kiezer(el, opts){
    opts = opts || {};
    var lijsten = mijn().filter(function(m){ return m.soort === 'lijst'; }), gekozen = '', stand = '';
    function teken(){
      el.innerHTML = (lijsten.length
        ? '<div class="chips" style="margin-bottom:8px">' + lijsten.map(function(m){
            return '<button type="button" data-code="' + htmlSchoon(m.code) + '"' + (m.code === gekozen ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + '>' + htmlSchoon(m.naam) + '</button>';
          }).join('') + '</div>'
        : '<p class="tip" style="margin:0 0 8px">Op dit apparaat staan nog geen woordenlijsten. Maak er een bij <a href="maken.html?nieuw=lijst">Eigen materiaal</a>, of vul hieronder de code van een lijst in.</p>') +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><input class="veld" style="flex:0 1 14em;text-transform:uppercase;letter-spacing:.12em" maxlength="6" placeholder="code" aria-label="Code van een woordenlijst" autocapitalize="characters" autocomplete="off" spellcheck="false">' +
        '<button type="button" class="knop">Haal op</button>' + (lijsten.length ? '<a class="tip" href="maken.html?nieuw=lijst">nieuwe lijst maken</a>' : '') + '</div>' +
        '<p class="tip" role="status" style="margin:6px 0 0;min-height:1.2em">' + htmlSchoon(stand) + '</p>';
      Array.prototype.forEach.call(el.querySelectorAll('button[data-code]'), function(b){ b.addEventListener('click', function(){ laad(b.getAttribute('data-code')); }); });
      var inv = el.querySelector('input'), knop = el.querySelector('button.knop');
      knop.addEventListener('click', function(){ laad(inv.value); });
      inv.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); laad(inv.value); } });
    }
    function zetStand(t){ stand = t; var p = el.querySelector('p[role=status]'); if (p) p.textContent = t; }
    function laad(code){
      code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      zetStand('Even ophalen…');
      haal(code).then(function(m){
        if (!m || m.soort !== 'lijst') throw new Error('Deze code is geen woordenlijst.');
        gekozen = code;
        if (!lijsten.some(function(x){ return x.code === code; })) lijsten.push({ code: code, naam: m.naam, soort: 'lijst' });
        stand = m.naam + ': ' + m.paren.length + ' paren' + (m.kopA && m.kopB ? ' (' + m.kopA + ' en ' + m.kopB + ')' : '') + '.';
        teken();
        if (opts.gekozen) opts.gekozen(m, code);
      }).catch(function(e){
        gekozen = ''; zetStand(e && e.message ? e.message : 'Dat lukte niet.');
        if (opts.leeg) opts.leeg();
      });
    }
    teken();
    if (opts.code) laad(opts.code);
    return { laad: laad, code: function(){ return gekozen; } };
  }
  return { haal: haal, bewaar: bewaar, weg: weg, mijn: mijn, afstemmen: afstemmen, kiezer: kiezer,
           volledig: volledig, uitslagen: uitslagen, nakijk: nakijk, instel: instel, wisUitslag: wisUitslag, inlever: inlever,
           afbeelding: afbeelding, afbAdres: afbAdres, verklein: verklein,
           vragenUitLijst: vragenUitLijst, oefeningUitLijst: oefeningUitLijst, plakken: plakken, schud: schud };
})();
