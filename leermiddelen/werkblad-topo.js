/* Werkblad topografie: dezelfde kaarten als in het spel (topo-kaarten.js), met
   nummers op de kaart. De leerling schrijft de naam bij elk nummer, of zet het
   nummer bij elke naam. Het niveau van het werkblad bepaalt welke plaatsen
   meedoen: basis (v 1), uitgebreid (v 2) of alles (v 3). */
(function(){
  'use strict';
  if (!window.KAARTEN || !window.SPELBLAD) return;
  var VOLGORDE = ['nlp', 'nlh', 'nlw', 'nlr', 'nla', 'eu', 'euh', 'wl', 'wlh'].filter(function(k){ return KAARTEN[k]; });
  var NIVEAU = { 1:'basis', 2:'uitgebreid', 3:'alles' };
  var ENKEL = { land:'land', provincie:'provincie', stad:'stad', hoofdstad:'hoofdstad', rivier:'rivier', eiland:'eiland', onderdeel:'onderdeel' };
  var HET = { land:1, eiland:1, onderdeel:1 };
  function deDit(w, dit){ return (HET[w] ? (dit ? 'dit ' : 'het ') : (dit ? 'deze ' : 'de ')) + (ENKEL[w] || 'onderdeel'); }
  var MEER = { land:'landen', provincie:'provincies', stad:'steden', hoofdstad:'hoofdsteden', rivier:'rivieren', eiland:'eilanden', onderdeel:'onderdelen' };
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function hussel(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function soortVan(m, l){ return l.s || m.soort || 'vlak'; }
  function watVan(m, l){ return l.w || m.wat || 'land'; }

  /* de kaart: ondergrond, alle onderdelen in dezelfde kleur, en een nummer bij de gekozen */
  function kaartSvg(m, items){
    var r = Math.max(9, Math.round(m.breed / 62)), fs = Math.round(r * 1.1);
    var s = '<svg class="topokaart" viewBox="0 0 ' + m.breed + ' ' + m.hoog + '" role="img" aria-label="Kaart van ' + schoon(m.naam) + ' met nummers">';
    if (m.achter) s += '<path class="achter" d="' + m.achter + '"/>';
    if (m.basisVan && KAARTEN[m.basisVan]) KAARTEN[m.basisVan].landen.forEach(function(l){ if (l.d) s += '<path class="basis" d="' + l.d + '"/>'; });
    var gekozen = {}; items.forEach(function(it){ gekozen[m.landen.indexOf(it.land)] = it.nr; });
    ['vlak', 'lijn', 'punt'].forEach(function(soortNu){
      m.landen.forEach(function(l, i){
        if (soortVan(m, l) !== soortNu) return;
        if (soortNu === 'vlak'){ if (l.d) s += '<path class="doel" d="' + l.d + '"/>'; }
        else if (soortNu === 'lijn'){ if (l.d) s += '<path class="rivier" d="' + l.d + '"/>'; }
        else s += '<circle class="stad' + (gekozen[i] ? ' aan' : '') + '" cx="' + l.x + '" cy="' + l.y + '" r="' + Math.round(r * 0.42) + '"/>';
      });
    });
    /* de nummers als laatste, boven alles; bij een stip iets ernaast met een streepje */
    items.forEach(function(it){
      var l = it.land, punt = soortVan(m, l) === 'punt', x = l.x, y = l.y;
      if (punt){ var dx = l.x > m.breed * 0.9 ? -r * 1.4 : r * 1.4, dy = l.y < r * 3 ? r * 1.4 : -r * 1.4; x = l.x + dx; y = l.y + dy; }
      s += '<g class="nr">' + (punt ? '<line x1="' + l.x + '" y1="' + l.y + '" x2="' + x + '" y2="' + y + '"/>' : '') +
        '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"/><text x="' + x + '" y="' + y + '" style="font-size:' + fs + 'px">' + it.nr + '</text></g>';
    });
    return s + '</svg>';
  }

  window.SPELBLAD.topografie = {
    naam: 'Topografie', vak: 'aard',
    aantallen: [8, 10, 12, 16, 20, 25], standaard: 12, aantalNaam: 'Aantal op de kaart',
    delenKop: 'Kaart en vorm',
    delenTip: 'Dezelfde kaarten als in het spel. Het niveau hierboven bepaalt welke plaatsen meedoen: bb is de basis, kgt ook de minder bekende, hv de hele kaart.',
    delen: function(aan){
      var kaart = (aan || []).filter(function(id){ return KAARTEN[id]; })[0] || 'nlp', vorm = (aan || []).indexOf('nummer') >= 0 ? 'nummer' : 'naam';
      return '<p class="kop">Welke kaart</p>' + VOLGORDE.map(function(id){ return '<label><input type="radio" name="topo-kaart" value="' + id + '"' + (id === kaart ? ' checked' : '') + '> ' + schoon(KAARTEN[id].naam) + '</label>'; }).join('') +
        '<p class="kop">Wat doet de leerling</p>' +
        '<label><input type="radio" name="topo-vorm" value="naam"' + (vorm === 'naam' ? ' checked' : '') + '> de naam schrijven bij elk nummer</label>' +
        '<label><input type="radio" name="topo-vorm" value="nummer"' + (vorm === 'nummer' ? ' checked' : '') + '> het nummer zetten bij elke naam</label>';
    },
    lees: function(el, rang){
      var k = el.querySelector('input[name="topo-kaart"]:checked'), v = el.querySelector('input[name="topo-vorm"]:checked');
      return { kaart: k ? k.value : 'nlp', vorm: v ? v.value : 'naam', tot: rang <= 1 ? 1 : rang === 2 ? 2 : 3 };
    },
    maak: function(keuze, n){
      var m = KAARTEN[keuze.kaart];
      if (!m) return { fout: 'Deze kaart bestaat niet.' };
      var lijst = hussel(m.landen.filter(function(l){ return (l.v || 1) <= keuze.tot; })).slice(0, n);
      return lijst.map(function(l, i){ return { land: l, nr: i + 1, wat: watVan(m, l) }; });
    },
    teken: function(w){
      var m = KAARTEN[w.keuze.kaart], vorm = w.keuze.vorm, items = w.items, gemengd = m.soort === 'gemengd';
      var woord = MEER[m.wat] || 'onderdelen', enkel = ENKEL[m.wat] || 'onderdeel', vragen, antwoorden, intro;
      if (vorm === 'naam'){
        intro = 'Schrijf bij elk nummer de naam van ' + (gemengd ? 'het onderdeel; erbij staat wat voor iets het is' : deDit(m.wat)) + '.';
        vragen = items.map(function(it){ return '<li>' + (gemengd ? '<span class="wat">' + schoon(ENKEL[it.wat] || it.wat) + '</span>' : '') + '<i class="lijn topo"></i></li>'; }).join('');
        antwoorden = items.map(function(it){ return '<li>' + schoon(it.land.n) + (it.land.a && it.land.a.length ? ' <small>(ook goed: ' + schoon(it.land.a.join(', ')) + ')</small>' : '') + '</li>'; }).join('');
      } else {
        var door = hussel(items);
        intro = 'Zet in het hokje het nummer dat op de kaart bij ' + (gemengd ? 'dit onderdeel' : deDit(m.wat, true)) + ' staat.';
        vragen = door.map(function(it){ return '<li><i class="hokje"></i>' + schoon(it.land.n) + (gemengd ? ' <small>(' + schoon(ENKEL[it.wat] || it.wat) + ')</small>' : '') + '</li>'; }).join('');
        antwoorden = door.map(function(it){ return '<li><b>' + it.nr + '</b> ' + schoon(it.land.n) + '</li>'; }).join('');
      }
      return {
        titel: 'Topografie: ' + m.naam, sub: NIVEAU[w.keuze.tot] + ' · ' + items.length + ' ' + woord,
        klasse: 'topo' + (vorm === 'nummer' ? ' topo-namen' : ''), intro: intro, boven: kaartSvg(m, items), vragen: vragen, antwoorden: antwoorden
      };
    }
  };
})();
