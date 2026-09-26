/* Werkbladen uit de vakspellen (de spellen op vakspel.js). Elk spel wordt in
   een verborgen iframe geopend met ?werkblad=1; dat venster geeft zijn keuzes
   (niveau, soort) en maakt opgaven als html, met het beeld erbij en het
   antwoord voor het antwoordblad. Dit bestand zet ze in SPELBLAD, zodat
   werkblad.html ze net zo behandelt als de Tekstdetective en de Breukenbakker.
   Het dictee en de dictation staan er niet in: die hebben geluid nodig. */
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
    ['huishoudboekje', 'Het huishoudboekje', 'eco'], ['vraagenaanbod', 'Vraag en aanbod', 'eco'], ['verkiezingen', 'Verkiezingen en zetels', 'burg']
  ];
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  var stijlGezet = {};

  /* het verborgen venster: een per spel, en een berichtenlijn met een nummer per vraag */
  var kader = null, kaderSpel = '', klaarBelofte = null, wachtend = {}, nr = 0;
  addEventListener('message', function(e){
    var b = e.data || {};
    if (b.t === 'werkblad-klaar' && klaarBelofte){ klaarBelofte.res(); klaarBelofte = null; }
    if ((b.t === 'werkblad-keuzes' || b.t === 'werkblad-maak') && wachtend[b.vraagId || 'keuzes']){ wachtend[b.vraagId || 'keuzes'](b); delete wachtend[b.vraagId || 'keuzes']; }
  });
  function open(spel){
    if (kader && kaderSpel === spel) return Promise.resolve();
    if (!kader){ kader = document.createElement('iframe'); kader.setAttribute('aria-hidden', 'true'); kader.style.cssText = 'position:absolute;width:0;height:0;border:0;opacity:0;pointer-events:none'; document.body.appendChild(kader); }
    kaderSpel = spel;
    return new Promise(function(res, rej){
      klaarBelofte = { res:res };
      var klok = setTimeout(function(){ klaarBelofte = null; rej(new Error('geen antwoord')); }, 15000);
      klaarBelofte.res = function(){ clearTimeout(klok); res(); };
      kader.src = spel + '.html?werkblad=1';
    });
  }
  function vraag(spel, bericht){
    return open(spel).then(function(){
      return new Promise(function(res, rej){
        var id = bericht.t === 'werkblad-keuzes' ? 'keuzes' : 'v' + (++nr);
        bericht.vraagId = id; wachtend[id] = res;
        setTimeout(function(){ if (wachtend[id]){ delete wachtend[id]; rej(new Error('geen antwoord')); } }, 20000);
        kader.contentWindow.postMessage(bericht, '*');
      });
    });
  }

  LIJST.forEach(function(rij){
    var spel = rij[0], naam = rij[1], vak = rij[2], keuzes = null;
    window.SPELBLAD[spel] = {
      naam: naam, vak: vak,
      aantallen: [6, 8, 10, 12, 16], standaard: 8, aantalNaam: 'Aantal opgaven',
      delenKop: 'Keuzes van het spel',
      delenTip: 'Dezelfde keuzes als in het spel. Het niveau komt van de keuze hierboven.',
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
        return vraag(spel, { t:'werkblad-maak', keuze:keuze, n:n }).then(function(b){ return b.items || []; });
      },
      teken: function(w){
        var niv = w.niveauNaam || '';
        var koppen = {}; w.items.forEach(function(it){ if (it.kop) koppen[it.kop] = 1; });
        return {
          titel: naam, sub: niv + ' · ' + w.items.length + ' opgaven', klasse: 'vakspel',
          vragen: w.items.map(function(it){ return '<li>' + (Object.keys(koppen).length > 1 && it.kop ? '<span class="odkop">' + schoon(it.kop) + '</span>' : '') + it.vraag + '</li>'; }).join(''),
          antwoorden: w.items.map(function(it){ return '<li><span class="goed">' + schoon(it.antwoord) + '</span>' + (w.uitleg && it.uitleg ? '<small>' + it.uitleg + '</small>' : '') + '</li>'; }).join('')
        };
      }
    };
  });
})();
