/* Werkbladen uit de vakspellen (de spellen op vakspel.js). Elk spel wordt in
   een verborgen iframe geopend met ?werkblad=1; dat venster geeft zijn keuzes
   (niveau, soort) en maakt opgaven als html, met het beeld erbij en het
   antwoord voor het antwoordblad. Dit bestand zet ze in SPELBLAD, zodat
   werkblad.html ze net zo behandelt als de Tekstdetective en de Breukenbakker.
   Wat het spel op het scherm vraagt (sleep, tik, typ, de schuif) wordt hier
   een opdracht voor papier; zie naarPapier. Het dictee en de dictation staan
   in werkblad-dictee.js: daar leest de docent voor. */
(function(){
  'use strict';
  var LIJST = [
    ['verhoudingen', 'De verhoudingstabel', 'reken'], ['metriek', 'Het metriek stelsel', 'reken'], ['cijferen', 'Cijferend vermenigvuldigen en delen', 'reken'], ['klok', 'Klokkijken en tijdrekenen', 'reken'], ['schatten', 'Schatten en afronden', 'reken'],
    ['grafieken', 'Grafieken en formules', 'wis'], ['pythagoras', 'De stelling van Pythagoras', 'wis'], ['hoeken', 'Hoeken meten en berekenen', 'wis'], ['coordinaten', 'Schatzoeken met coördinaten', 'wis'],
    ['samenvatten', 'Samenvatten', 'ned'], ['woordenschat', 'Woordenschat in context', 'ned'], ['signaalwoorden', 'Signaalwoorden en verbanden', 'ned'], ['register', 'Formeel of informeel', 'ned'],
    ['phrasal', 'Phrasal verbs en collocations', 'eng'], ['translate', 'Translate the sentence', 'eng'], ['reading', 'Reading', 'eng'],
    ['oorzaakgevolg', 'Oorzaak en gevolg', 'ges'], ['wiebenik', 'Wie ben ik?', 'ges'], ['tijdkaart', 'De kaart door de tijd', 'ges'],
    ['klimaatgrafiek', 'Klimaatgrafieken', 'aard'], ['kaartvaardigheid', 'Kaartvaardigheden', 'aard'], ['bevolkingspiramide', 'Bevolkingspiramides', 'aard'],
    ['voedselweb', 'Voedselketen en voedselweb', 'bio'], ['kruisen', 'Kruisingsschema', 'bio'],
    ['redeneren', 'Denk als een historicus', 'ges'], ['alinea', 'Bouw een alinea', 'ned'], ['situaties', 'English in real life', 'eng'], ['voordoen', 'Eerst kijken, dan zelf', 'wis'], ['onderzoek', 'Het eerlijke experiment', 'bio'], ['afwegen', 'Twee kanten', 'burg'], ['begrijpend', 'Begrijpend lezen', 'ned'], ['woordformules', 'Tabel, grafiek en formule', 'wis'], ['bedrijf', 'Werk, bedrijf en wereld', 'eco'], ['afweer', 'Afweer en evolutie', 'bio'], ['ruimte', 'Ruimtefiguren', 'wis'], ['schrijfopdracht', 'De schrijfopdracht', 'ned'], ['bronlezen', 'Lees de bron', 'reken'], ['rechtsstaat', 'Van aangifte tot uitspraak', 'burg'], ['water', 'Water in Nederland', 'aard'], ['huishoudboekje', 'Het huishoudboekje', 'eco'], ['vraagenaanbod', 'Vraag en aanbod', 'eco'], ['verkiezingen', 'Verkiezingen en zetels', 'burg'], ['partijen', 'Welke partij is dit?', 'burg'], ['democratie', 'Democratie', 'burg']
  ];
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  var stijlGezet = {};

  /* ---------- van scherm naar papier ----------
     De spellen schrijven hun opdrachten voor het scherm: sleep, tik aan, typ,
     zet de schuif. Op papier kan dat niet. Elke regel hieronder zet zo'n
     opdracht om in iets wat met een pen kan: schrijven, een stip, een kruisje,
     omcirkelen, of de letters van de kaartjes bij een vak zetten (dat laatste
     tekent vakspel.js al onder elke sleepopgave). lijn: de opgave krijgt een
     lijn om het antwoord op te schrijven, want op het scherm was dat de schuif. */
  var PAPIER = [
    [/Typ je antwoord en druk op Nakijken\.?/g, 'Schrijf je antwoord op de lijn.'],
    [/\b(druk|klik) (dan )?op Nakijken\.?/gi, ''],
    [/\bTyp in elk vakje\b/g, 'Schrijf in elk vakje'],
    [/\bTyp\b/g, 'Schrijf'], [/\btyp\b/g, 'schrijf'], [/\btypt\b/g, 'schrijft'], [/\bintypen\b/g, 'opschrijven'], [/\btypen\b/g, 'schrijven'],
    /* sleepopgaven: onder de opgave staat al "Schrijf bij elk vak de letters van de kaartjes die erin horen" */
    [/\b[Ss]leep (elk|elke|de|ze|het|alle)((?: [^.<]*?)?) naar ([^.]*?)\./g, 'Zet $1$2 bij $3.'],
    [/\bTik op de kaart het gebied aan van\b/g, 'Zet op de kaart een kruisje in het gebied van'],
    [/\bTik het punt (.*?) aan\./g, 'Zet een stip op het punt $1.'],
    [/\bTik het logo aan\./g, 'Omcirkel de letter bij het goede logo.'],
    [/\bTik minstens drie roosterpunten aan die op de lijn liggen\./g, 'Zet minstens drie stippen op roosterpunten die op de lijn liggen, en trek de lijn erdoor.'],
    [/\s*Nog eens tikken haalt een stip weer weg\.?/g, ''],
    [/\bTik partijen aan om ze in de coalitie te zetten\./g, 'Omcirkel de partijen die samen jouw coalitie vormen, en tel hun zetels op.'],
    [/\bTik (het|de) (.*?) aan\./g, 'Zet een stip op $1 $2.'],
    [/\bZet de prijs met de schuif op de (.*?)\./g, 'Wat is de $1? Schrijf hem op de lijn.', 'lijn'],
    [/ met de schuif\b/g, ''],
    /* Wie ben ik: op papier staan alle aanwijzingen er meteen, en punten zijn er niet */
    [/Lees de aanwijzing\. Weet je het al\? Kies dan een naam\. Twijfel je, vraag dan een volgende aanwijzing: dat kost punten\./g, 'Lees de aanwijzingen een voor een. Omcirkel de letter bij de goede naam.']
  ];
  function naarPapier(html, vlag){
    return PAPIER.reduce(function(h, r){
      if (!r[0].test(h)){ r[0].lastIndex = 0; return h; }
      r[0].lastIndex = 0;
      if (r[2] && vlag) vlag[r[2]] = true;
      return h.replace(r[0], r[1]);
    }, String(html == null ? '' : html));
  }
  /* is er op papier ergens plek voor het antwoord? */
  function heeftPlek(h){ return /<input|class="[^"]*\b(lijn|opties|sleep-wb|velden-wb|wb-keus)\b|stip|kruisje|[Oo]mcirkel/.test(h); }
  function papierItem(it){
    var vlag = {};
    it.vraag = naarPapier(it.vraag, vlag);
    if (it.opties) it.opties = naarPapier(it.opties);
    ['kop', 'antwoord', 'antwoordOpen', 'uitleg'].forEach(function(k){ if (it[k]) it[k] = naarPapier(it[k]); });
    if (vlag.lijn || (!it.opties && !heeftPlek(it.vraag))) it.vraag += '<span class="lijn" aria-hidden="true"></span>';
    return it;
  }

  /* ---------- open vragen ----------
     Bij open vragen wordt een meerkeuzevraag met korte keuzes (kanOpen, zie
     vakspel.js) een lijn. OPENVRAAG (werkblad-spellen.js) kijkt of de vraag
     zonder keuzes nog te snappen is; zo niet, dan komen de keuzes erbij als
     "Kies uit:" of om te omcirkelen. soort: mk, open, kies of omcirkel. */
  function papierVorm(it, open){
    if (!it.opties || !open) return { soort:'mk', opdr:'' };
    if (!it.kanOpen) return { soort:'omcirkel', opdr:'Omcirkel de letter van het goede antwoord.' };
    var d = document.createElement('div'); d.innerHTML = it.opties;
    /* de keuzes zijn plaatjes (klokken): die kun je niet opschrijven */
    if (d.querySelector('svg, img')) return { soort:'omcirkel', opdr:'Omcirkel de letter van het goede antwoord.' };
    var keuzes = [].map.call(d.querySelectorAll('.opties > span'), function(s){ var c = s.cloneNode(true), b = c.querySelector('b'); if (b) b.parentNode.removeChild(b); return c.textContent.trim(); });
    d.innerHTML = it.vraag;
    /* de vraag en de opdracht eronder: "Staat het er niet in, kies dan Not stated." staat in de opdracht */
    var vr = d.querySelector('.vr'), opdr = d.querySelector('.opdr'), eigenOpdr = !!opdr;
    var g = 'abcdefghijklmnopqrstuvwxyz'.indexOf(String(it.antwoord || '').charAt(0));
    var p = OPENVRAAG.vorm({ v:(vr ? vr.textContent : d.textContent) + (opdr ? ' ' + opdr.textContent : ''), o:keuzes, g:g });
    return { soort:p.soort, keuzes:keuzes, opdr:(p.soort === 'omcirkel' || !eigenOpdr) ? p.opdr : '', vraag:p.soort === 'open' ? OPENVRAAG.schrijfOp(it.vraag) : it.vraag };
  }

  /* het verborgen venster: een per spel, en een berichtenlijn met een nummer per vraag */
  var kader = null, kaderSpel = '', klaarBelofte = null, klaar = null, wachtend = {}, nr = 0;
  addEventListener('message', function(e){
    /* alleen antwoorden uit ons eigen verborgen venster: wat erin staat gaat als html het werkblad in */
    if (e.origin !== location.origin || !kader || e.source !== kader.contentWindow) return;
    var b = e.data || {};
    if (b.t === 'werkblad-klaar' && klaarBelofte){ klaarBelofte.res(); klaarBelofte = null; }
    if ((b.t === 'werkblad-keuzes' || b.t === 'werkblad-maak') && wachtend[b.vraagId || 'keuzes']){ wachtend[b.vraagId || 'keuzes'](b); delete wachtend[b.vraagId || 'keuzes']; }
  });
  /* Hetzelfde spel: wacht op hetzelfde laden. Klikt de docent op Maak werkblad
     terwijl de keuzes nog komen, dan ging de vraag anders naar een venster dat
     nog niet luisterde, en kwam er nooit antwoord. */
  function open(spel){
    if (kader && kaderSpel === spel && klaar) return klaar;
    if (!kader){ kader = document.createElement('iframe'); kader.setAttribute('aria-hidden', 'true'); kader.style.cssText = 'position:absolute;width:0;height:0;border:0;opacity:0;pointer-events:none'; document.body.appendChild(kader); }
    kaderSpel = spel;
    klaar = new Promise(function(res, rej){
      klaarBelofte = { res:res };
      var klok = setTimeout(function(){ klaarBelofte = null; klaar = null; rej(new Error('geen antwoord')); }, 15000);
      klaarBelofte.res = function(){ clearTimeout(klok); res(); };
      kader.src = spel + '.html?werkblad=1';
    });
    return klaar;
  }
  function vraag(spel, bericht){
    return open(spel).then(function(){
      return new Promise(function(res, rej){
        var id = bericht.t === 'werkblad-keuzes' ? 'keuzes' : 'v' + (++nr);
        bericht.vraagId = id; wachtend[id] = res;
        setTimeout(function(){ if (wachtend[id]){ delete wachtend[id]; rej(new Error('geen antwoord')); } }, 20000);
        kader.contentWindow.postMessage(bericht, location.origin);
      });
    });
  }

  LIJST.forEach(function(rij){
    var spel = rij[0], naam = rij[1], vak = rij[2], keuzes = null;
    window.SPELBLAD[spel] = {
      naam: naam, vak: vak,
      aantallen: [6, 8, 10, 12, 16, 20], standaard: 10, aantalNaam: 'Aantal opgaven', vormen: true,
      delenKop: 'Keuzes van het spel',
      delenTip: 'Dezelfde keuzes als in het spel. Het niveau komt van de keuze hierboven. Bij open vragen worden meerkeuzevragen met korte antwoorden open. Een sleepopgave wordt op papier: schrijf de letters van de kaartjes bij het goede vak.',
      delen: function(aan){
        var doel = document.getElementById('delen');
        function teken(){
          return keuzes.filter(function(k){ return k.id !== 'niveau'; }).map(function(k){
            return '<p class="kop">' + schoon(k.kop) + '</p>' + k.items.map(function(it, i){ return '<label><input type="radio" name="vs-' + schoon(k.id) + '" value="' + schoon(it.id) + '"' + ((aan && aan.indexOf(it.id) >= 0) || (!(aan && aan.length) && it.id === (k.std !== undefined ? k.std : k.items[0].id)) ? ' checked' : '') + '> ' + schoon(it.naam) + '</label>'; }).join('');
          }).join('') || '<p class="kop">Dit spel heeft geen extra keuzes.</p>';
        }
        if (keuzes) return teken();
        vraag(spel, { t:'werkblad-keuzes' }).then(function(b){
          keuzes = b.keuzes || [];
          if (b.stijl && !stijlGezet[spel]){ stijlGezet[spel] = true; var st = document.createElement('style'); st.setAttribute('data-spel', spel); st.textContent = b.stijl; document.head.appendChild(st); }
          if (doel && document.getElementById('blad').value === spel) doel.innerHTML = teken();
        }, function(){ if (doel) doel.innerHTML = '<p class="kop">Het spel laden lukte niet.</p>'; });
        return '<p class="kop">Keuzes ophalen…</p>';
      },
      lees: function(el, rang){
        var keuze = { niveau: rang <= 1 ? 'bb' : rang === 2 ? 'kgt' : 'hv' };
        (keuzes || []).forEach(function(k){ if (k.id === 'niveau') return; var r = el.querySelector('input[name="vs-' + k.id + '"]:checked'); if (r) keuze[k.id] = r.value; });
        return keuze;
      },
      maak: function(keuze, n){
        return vraag(spel, { t:'werkblad-maak', keuze:keuze, n:n }).then(function(b){ return (b.items || []).map(papierItem); });
      },
      teken: function(w){
        var niv = w.niveauNaam || '';
        var koppen = {}; w.items.forEach(function(it){ if (it.kop) koppen[it.kop] = 1; });
        var vormen = w.items.map(function(it, i){ return papierVorm(it, w.isOpen && w.isOpen(w.vorm, i)); });
        return {
          titel: naam, sub: niv + ' · ' + w.items.length + ' opgaven', klasse: 'vakspel',
          intro: OPENVRAAG.uitleg(vormen),
          vragen: w.items.map(function(it, i){
            var p = vormen[i];
            return '<li>' + (Object.keys(koppen).length > 1 && it.kop ? '<span class="odkop">' + schoon(it.kop) + '</span>' : '') + (p.vraag || it.vraag) +
              (p.opdr ? '<span class="opdr">' + schoon(p.opdr) + '</span>' : '') +
              (!it.opties ? '' : p.soort === 'open' ? '<span class="lijn" aria-hidden="true"></span>' : p.soort === 'kies' ? OPENVRAAG.kiesUit(p.keuzes) + '<span class="lijn" aria-hidden="true"></span>' : it.opties) + '</li>';
          }).join(''),
          antwoorden: w.items.map(function(it, i){ var woord = vormen[i].soort === 'open' || vormen[i].soort === 'kies'; return '<li><span class="goed">' + schoon(woord ? it.antwoordOpen : it.antwoord) + '</span>' + (w.uitleg && it.uitleg ? '<small>' + it.uitleg + '</small>' : '') + '</li>'; }).join('')
        };
      }
    };
  });
})();
