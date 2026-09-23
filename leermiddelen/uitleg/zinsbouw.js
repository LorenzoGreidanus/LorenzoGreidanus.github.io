/* Uitleg stap voor stap bij Zinsbouw: de vaste volgorde van een Engelse
   zin, vragen, ontkennen, always en never, -ing, there is en de voltooide tijd. */
STAPPEN.les('zinsbouw', function(){
  var S = STAPPEN;
  function blokjes(woorden, kleuren){
    return '<div class="st-rij">' + woorden.map(function(w, i){
      return '<span style="display:inline-grid;gap:2px;justify-items:center"><span style="background:' + (kleuren[i] || '#EA9836') + ';color:#14224C;border-radius:10px;padding:6px 12px;font-weight:600">' + S.schoon(w[0]) + '</span><small style="font-size:.72rem;opacity:.8">' + S.schoon(w[1] || '') + '</small></span>';
    }).join('') + '</div>';
  }
  var ONW = '#83A5F2', WW = '#F26749', LV = '#EA9836', PL = '#8fd8ac', TD = '#FCDED6';
  return [
    {
      id: 'volgorde', naam: 'De vaste volgorde', uitleg: 'Wie, doet, wat, waar, wanneer.',
      stappen: [
        { kop: 'Wie doet wat', beeld: blokjes([['I', 'wie'], ['play', 'doet'], ['football', 'wat']], [ONW, WW, LV]),
          tekst: '<p>Een Engelse zin begint bijna altijd met <b>wie</b> iets doet, dan het werkwoord (<b>doet</b>), dan <b>wat</b>.</p>' },
        { kop: 'Dan waar, dan wanneer', beeld: blokjes([['I', 'wie'], ['play', 'doet'], ['football', 'wat'], ['in the park', 'waar'], ['on Saturday', 'wanneer']], [ONW, WW, LV, PL, TD]),
          tekst: '<p>Daarna komt <b>waar</b> het gebeurt, en als laatste <b>wanneer</b>. Onthoud: waar vóór wanneer.</p>' },
        { kop: 'Anders dan in het Nederlands', beeld: S.formule('Op zaterdag <b>speel</b> ik voetbal. &nbsp;→&nbsp; I <b>play</b> football on Saturday.'),
          tekst: '<p>In het Nederlands mag het werkwoord naar voren springen. In het Engels blijft het vlak na wie het doet.</p>' +
            S.bak('Begin je toch met de tijd? Dan: On Saturday, I play football. Het werkwoord blijft na I.', 'goed') }
      ]
    },
    {
      id: 'vragen', naam: 'Vragen stellen en ontkennen', uitleg: 'Met do, does en did, of met het hulpwerkwoord naar voren.',
      stappen: [
        { kop: 'Een vraag met do of does', beeld: blokjes([['Do', 'hulpje'], ['you', 'wie'], ['like', 'doet'], ['pizza', 'wat'], ['?', '']], [WW, ONW, WW, LV, TD]),
          tekst: '<p>Heeft de zin geen hulpwerkwoord, dan zet je <b>do</b> of <b>does</b> vooraan. Bij he, she en it: does. In het verleden: did.</p>' },
        { kop: 'Na does geen -s meer', beeld: S.formule('She like<span class="st-na">s</span> pizza. → Do<span class="st-na">es</span> she like pizza?'),
          tekst: '<p>De -s schuift naar does. Het werkwoord zelf staat weer kaal: like, niet likes.</p>' },
        { kop: 'Met een hulpwerkwoord: omdraaien', beeld: S.formule('She <b>can</b> swim. → <b>Can</b> she swim?'),
          tekst: '<p>Staat er al een hulpwerkwoord (can, is, are, have, will), dan zet je dat vooraan. Geen do nodig.</p>' },
        { kop: 'Ontkennen: not na het hulpje', beeld: S.formule('I <span class="st-na">do not</span> (don\'t) like pizza. &nbsp; · &nbsp; She <span class="st-na">can\'t</span> swim.'),
          tekst: '<p>Ontkennen werkt hetzelfde: not komt na het hulpwerkwoord. Is er geen, dan gebruik je do not, does not of did not.</p>' }
      ]
    },
    {
      id: 'vaak', naam: 'Always, often, never', uitleg: 'Waar zet je hoe vaak?',
      stappen: [
        { kop: 'Voor het werkwoord', beeld: blokjes([['I', 'wie'], ['always', 'hoe vaak'], ['walk', 'doet'], ['to school', 'waar']], [ONW, PL, WW, PL]),
          tekst: '<p>Woorden als always, often, sometimes en never staan <b>vóór</b> het gewone werkwoord.</p>' },
        { kop: 'Maar na am, is, are', beeld: blokjes([['She', 'wie'], ['is', 'zijn'], ['never', 'hoe vaak'], ['late', '']], [ONW, WW, PL, LV]),
          tekst: '<p>Bij een vorm van <b>to be</b> (am, is, are, was, were) staan ze <b>erna</b>.</p>' +
            S.bak('Nederlands: ik loop altijd. Engels: I always walk.', 'goed') }
      ]
    },
    {
      id: 'tijden', naam: 'Bezig zijn, there is en de voltooide tijd', uitleg: 'Am/is/are + -ing, there is/are, have + derde vorm.',
      stappen: [
        { kop: 'Bezig zijn: am, is, are + -ing', beeld: S.formule('I <span class="st-na">am reading</span> a book right now.'),
          tekst: '<p>Ben je nu met iets bezig, dan gebruik je am, is of are en een werkwoord op -ing.</p>' },
        { kop: 'There is en there are', beeld: S.formule('There <span class="st-na">is</span> a dog. &nbsp; · &nbsp; There <span class="st-na">are</span> two dogs.'),
          tekst: '<p>"Er is" en "er zijn": is bij één, are bij meer.</p>' },
        { kop: 'Voltooid: have of has + derde vorm', beeld: S.formule('I <span class="st-na">have seen</span> that film. &nbsp; · &nbsp; He <span class="st-na">has finished</span>.'),
          tekst: '<p>Iets dat gebeurd is en nu nog telt: have (bij he, she, it: has) en de derde vorm van het werkwoord.</p>' }
      ]
    }
  ];
});
