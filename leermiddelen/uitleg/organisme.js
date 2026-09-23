/* Uitleg stap voor stap bij Bouw het organisme: de ladder van cel tot
   organisme, en plantcel tegenover diercel. */
STAPPEN.les('organisme', function(){
  var S = STAPPEN;
  function trap(nu){
    var t = ['cel', 'weefsel', 'orgaan', 'orgaanstelsel', 'organisme'];
    return '<div class="st-rij">' + t.map(function(x, i){
      return '<span style="border-radius:12px;padding:8px 12px;font-weight:600;' + (i === nu ? 'background:#EA9836;color:#14224C' : i < nu ? 'background:rgba(234,152,54,.3)' : 'border:2px dashed rgba(127,127,127,.5)') + '">' + x + '</span>' + (i < 4 ? '<span class="st-tk">→</span>' : '');
    }).join('') + '</div>';
  }
  function cel(plant){
    return '<figure><svg viewBox="0 0 160 120" width="200" height="150" aria-hidden="true">' +
      (plant ? '<rect x="6" y="6" width="148" height="108" rx="6" fill="none" stroke="#2f7d52" stroke-width="7"/>' +
               '<rect x="14" y="14" width="132" height="92" rx="4" fill="rgba(143,216,172,.25)" stroke="currentColor" stroke-width="2"/>' +
               '<rect x="44" y="30" width="86" height="60" rx="18" fill="rgba(131,165,242,.35)" stroke="currentColor" stroke-width="1.5"/>' +
               '<ellipse cx="28" cy="30" rx="8" ry="5" fill="#2f7d52"/><ellipse cx="30" cy="90" rx="8" ry="5" fill="#2f7d52"/><ellipse cx="138" cy="96" rx="7" ry="4" fill="#2f7d52"/>' +
               '<circle cx="28" cy="60" r="10" fill="#204ECF"/>'
             : '<ellipse cx="80" cy="60" rx="70" ry="50" fill="rgba(252,222,214,.5)" stroke="currentColor" stroke-width="2"/>' +
               '<circle cx="80" cy="58" r="14" fill="#204ECF"/><circle cx="116" cy="44" r="5" fill="rgba(131,165,242,.6)"/>') +
      '</svg><figcaption>' + (plant ? 'plantcel' : 'diercel') + '</figcaption></figure>';
  }
  return [
    {
      id: 'ladder', naam: 'Van cel tot organisme', uitleg: 'Vijf lagen, elke laag bestaat uit de laag ervoor.',
      stappen: [
        { kop: 'De cel', beeld: trap(0), tekst: '<p>Alles wat leeft bestaat uit <b>cellen</b>: de kleinste bouwsteentjes, zo klein dat je een microscoop nodig hebt.</p>' },
        { kop: 'Het weefsel', beeld: trap(1), tekst: '<p>Veel dezelfde cellen met dezelfde taak vormen samen een <b>weefsel</b>. Bijvoorbeeld spierweefsel of zenuwweefsel.</p>' },
        { kop: 'Het orgaan', beeld: trap(2), tekst: '<p>Verschillende weefsels samen vormen een <b>orgaan</b>, zoals het hart (spierweefsel, zenuwweefsel en meer) of een blad van een plant.</p>' },
        { kop: 'Het orgaanstelsel', beeld: trap(3), tekst: '<p>Organen die samen één taak doen, vormen een <b>orgaanstelsel</b>: hart en bloedvaten samen zijn de bloedsomloop.</p>' },
        { kop: 'Het organisme', beeld: trap(4), tekst: '<p>Alle stelsels samen zijn het <b>organisme</b>: de hele mens, het hele dier, de hele plant.</p>' +
            S.bak('Ezelsbruggetje: Cees Wil Op Ons Oefenen: cel, weefsel, orgaan, orgaanstelsel, organisme.', 'goed') }
      ]
    },
    {
      id: 'cellen', naam: 'Plantcel of diercel?', uitleg: 'Drie dingen heeft alleen een plantcel.',
      stappen: [
        { kop: 'Wat elke cel heeft', beeld: S.rij([cel(false), cel(true)]),
          tekst: '<p>Elke cel heeft een <b>celmembraan</b> (het vliesje eromheen), <b>cytoplasma</b> (de vloeistof binnenin) en een <b>celkern</b> (die alles regelt).</p>' },
        { kop: 'Alleen in een plantcel', beeld: S.rij([cel(true)]),
          tekst: '<p>Een plantcel heeft drie dingen extra:</p><p>een stevige <b>celwand</b> (de dikke groene rand), <b>bladgroenkorrels</b> (de groene bolletjes, voor fotosynthese) en een grote <b>vacuole</b> (een blaas met vocht).</p>' },
        { kop: 'Zo zie je het verschil', beeld: S.formule('rechte hoeken + groen = plantcel'),
          tekst: '<p>Een plantcel is door de celwand vaak hoekig, een diercel rond en slap. Zie je groene korrels, dan is het zeker een plant.</p>' +
            S.bak('Een diercel heeft nooit een celwand. In het spel wordt die daarom ook niet geaccepteerd.', 'let') }
      ]
    }
  ];
});
