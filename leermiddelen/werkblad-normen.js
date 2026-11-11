/* Normen en waarden: een werkblad bij Mens en maatschappij dat op zichzelf staat.

   Bovenaan staat de uitleg (waarde, norm, sanctie, met een voorbeeld als
   ketting), daaronder opdrachten in verschillende vormen: aankruisen,
   koppelen, een dilemma en eigen voorbeelden. De leerling heeft er geen boek
   of les bij nodig. Elk niveau heeft zijn eigen blad (keuze.rang, 1 tot 4):
     bb    korte zinnen, minder regels per opdracht, de botsende waarden staan er al
     kgt   de basis: waarde, norm, geschreven of ongeschreven, sanctie
     havo  ook formele en informele sancties, het waardenconflict en begrippen
     vwo   ook moraal en recht, feit of norm, en dilemma's uit de samenleving
   De losse meerkeuzevragen over dit onderwerp staan in de vragenbank
   (bank-burg.js, onderdeel normen). */
(function(){
  'use strict';
  if (!window.SPELBLAD) return;
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function schud(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pak(a, n){ return schud(a).slice(0, n); }
  var LETTERS = 'ABCDEFGH';

  /* ---------- de stof ---------- */
  var WAARDEN = ['eerlijkheid', 'vrijheid', 'veiligheid', 'respect', 'gezondheid', 'gelijkheid', 'vriendschap', 'behulpzaamheid', 'gastvrijheid', 'zelfstandigheid', 'een schone leefomgeving', 'rechtvaardigheid'];
  var NORMEN = ['Je steekt je hand op als je iets wilt zeggen.', 'Je fietst niet door rood.', 'Je zegt dank je wel als je iets krijgt.', 'Je komt op tijd op school.', 'Je gooit je afval in de prullenbak.',
    'Je laat een ander uitpraten.', 'Je draagt een helm op de scooter.', 'Je staat op voor een oudere in de bus.', 'Je spiekt niet bij een toets.', 'Je doet thuis je schoenen uit.', 'Je zet je telefoon uit in de bioscoop.', 'Je klopt voordat je een kamer binnengaat.'];
  /* norm, de waarde erachter */
  var PAREN = [
    ['Je liegt niet tegen je vrienden.', 'eerlijkheid'], ['Je doet je fietslicht aan in het donker.', 'veiligheid'], ['Je laat een ander uitpraten.', 'respect'],
    ['Je gooit geen afval op straat.', 'een schone leefomgeving'], ['Je helpt een klasgenoot die iets niet snapt.', 'behulpzaamheid'], ['Je biedt bezoek iets te drinken aan.', 'gastvrijheid'],
    ['Je behandelt iedereen hetzelfde, wie het ook is.', 'gelijkheid'], ['Je rookt niet waar anderen er last van hebben.', 'gezondheid'], ['Je mag zelf weten wat je gelooft.', 'vrijheid'], ['Je verklapt een geheim van een vriend niet.', 'vertrouwen']
  ];
  /* de regel, geschreven (1) of ongeschreven (0), waar hij staat */
  var REGELS = [
    ['Je mag niet stelen.', 1, 'Wetboek van Strafrecht'], ['Je geeft een hand als je iemand voor het eerst ontmoet.', 0, ''], ['Je mag niet appen op de fiets.', 1, 'de verkeerswet'],
    ['Je praat zacht in de stiltecoupé van de trein.', 1, 'de huisregels van de trein'], ['Je staat op voor een oudere in de bus.', 0, ''], ['Je gaat naar school tot je zestiende.', 1, 'de Leerplichtwet'],
    ['Je neemt iets mee als je op een verjaardag komt.', 0, ''], ['Je eet niet in het lokaal.', 1, 'de schoolregels'], ['Je dringt niet voor in de rij.', 0, ''], ['Je zegt gedag als je de klas binnenkomt.', 0, ''],
    ['In het zwembad draag je geen schoenen.', 1, 'de huisregels van het zwembad'], ['Je kijkt iemand aan als je met hem praat.', 0, '']
  ];
  /* de situatie, positief (1) of negatief (0), formeel (1) of informeel (0) */
  var SANCTIES = [
    ['Je krijgt een boete omdat je door rood fietste.', 0, 1], ['Je docent geeft je een compliment voor je spreekbeurt.', 1, 0], ['Je klasgenoten lachen je uit om wat je zei.', 0, 0],
    ['Je krijgt je diploma na het examen.', 1, 1], ['Je moet nablijven omdat je te laat was.', 0, 1], ['Je buurvrouw bedankt je met een reep chocola.', 1, 0],
    ['Je wordt een week geschorst van school.', 0, 1], ['Je vrienden negeren je nadat je hebt gelogen.', 0, 0], ['Je krijgt een lintje van de burgemeester.', 1, 1], ['Je teamgenoten juichen als je de bal afgeeft.', 1, 0],
    ['De rechter geeft een taakstraf voor vernieling.', 0, 1], ['Mensen in de trein kijken je boos aan omdat je hard belt.', 0, 0]
  ];
  /* de situatie, de twee waarden die botsen */
  var DILEMMAS = [
    ['Je beste vriend spiekt bij een toets. De docent vraagt na afloop aan jou of je iets hebt gezien.', 'eerlijkheid', 'vriendschap (trouw aan je vriend)'],
    ['De gemeente wil camera’s ophangen in het centrum. Het wordt er veiliger door, maar iedereen wordt gefilmd.', 'veiligheid', 'privacy (vrijheid)'],
    ['Een klasgenoot plaatst een grap over een andere leerling in de groepsapp. Iedereen lacht, maar die leerling is er niet blij mee.', 'vrijheid om te zeggen wat je wilt', 'respect voor een ander'],
    ['Je vindt een portemonnee met vijftig euro op straat. Er zit geen naam in en je spaart al maanden voor nieuwe schoenen.', 'eerlijkheid', 'je eigen belang (welvaart)'],
    ['Je hebt je oma beloofd om zaterdag te helpen in de tuin. Dan belt je team: ze komen een speler tekort voor de wedstrijd.', 'je aan je belofte houden (betrouwbaarheid)', 'trouw aan je team']
  ];
  /* vwo: vraagstukken uit de samenleving, met een argument voor elke kant */
  var DILEMMAS_VWO = [
    ['Een politicus wil een demonstratie verbieden, omdat er kwetsende leuzen over een bevolkingsgroep worden geroepen.', 'vrijheid van meningsuiting', 'bescherming tegen discriminatie'],
    ['Wie niets laat vastleggen, staat in Nederland geregistreerd als orgaandonor. Voorstanders wijzen op de wachtlijsten, tegenstanders vinden dat je zelf moet kiezen.', 'solidariteit met zieken', 'zelfbeschikking over je eigen lichaam'],
    ['Een school wil telefoons de hele dag verbieden. Leerlingen leren dan beter, maar ze mogen niet meer zelf bepalen wanneer ze hun telefoon gebruiken.', 'goed onderwijs (het belang van de groep)', 'vrijheid en eigen verantwoordelijkheid'],
    ['De overheid wil suikerhoudende frisdrank veel duurder maken, zodat mensen gezonder gaan leven.', 'volksgezondheid', 'keuzevrijheid van de burger']
  ];
  /* de uitspraak, normatief (1) of feitelijk (0) */
  var STELLINGEN = [
    ['De straffen voor vandalisme moeten zwaarder worden.', 1], ['De Tweede Kamer heeft 150 leden.', 0], ['Jongeren horen op hun zestiende te mogen stemmen.', 1],
    ['In Nederland mag je vanaf je achttiende stemmen.', 0], ['Het is onfatsoenlijk om in de trein hard te bellen.', 1], ['Nederland heeft twaalf provincies.', 0],
    ['Iedereen zou een deel van zijn inkomen aan goede doelen moeten geven.', 1], ['Artikel 1 van de Grondwet verbiedt discriminatie.', 0], ['Een goede burger houdt rekening met zijn buren.', 1], ['Roken in de horeca is sinds 2008 verboden.', 0]
  ];
  var BEGRIPPEN_VWO = [
    ['anomie', 'een toestand waarin normen hun houvast verliezen'], ['moraal', 'de opvattingen in een groep over wat goed en fout is'],
    ['universele waarden', 'waarden die bijna overal ter wereld belangrijk gevonden worden'], ['tegencultuur', 'een groep die zich afzet tegen de heersende normen en waarden']
  ];
  var BEGRIPPEN = [
    ['socialisatie', 'het aanleren van de normen en waarden van je omgeving'], ['internaliseren', 'een norm zo eigen maken dat je hem vanzelfsprekend vindt'],
    ['sociale controle', 'mensen houden elkaar aan de normen'], ['subcultuur', 'een groep met eigen normen, waarden en stijl binnen de samenleving'],
    ['dominante cultuur', 'de normen en waarden van de meeste mensen in een land'], ['etnocentrisme', 'andere culturen beoordelen vanuit je eigen cultuur'],
    ['cultuurrelativisme', 'een cultuur beoordelen vanuit die cultuur zelf'], ['waardenconflict', 'twee waarden botsen, zodat je moet kiezen']
  ];

  try {
    var st = document.createElement('style');
    st.textContent =
      '.blad .nw-uitleg{border:1.5px solid #14224C;border-radius:10px;padding:12px 14px;margin:12px 0 4px;break-inside:avoid}' +
      '.blad .nw-uitleg > p.kop{font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;font-weight:600;color:#14224C;margin:0 0 8px}' +
      '.blad .nw-begrip{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 18px}' +
      '.blad .nw-begrip div b{display:block;font-size:.88rem;font-weight:600}' +
      '.blad .nw-begrip div span{display:block;font-size:.8rem;line-height:1.4;color:#14224C}' +
      '.blad .nw-begrip div em{display:block;font-size:.78rem;line-height:1.4;color:#4a5270}' +
      '.blad .nw-ketting{display:flex;align-items:stretch;gap:6px;margin-top:12px}' +
      '.blad .nw-ketting > div{flex:1;min-width:0;border-radius:8px;padding:7px 9px;font-size:.78rem;line-height:1.35;background:#FCDED6;color:#14224C}' +
      '.blad .nw-ketting > div:nth-of-type(2){background:#DCE5FB}.blad .nw-ketting > div:nth-of-type(3){background:#FBF6F1;box-shadow:inset 0 0 0 1.5px #14224C}' +
      '.blad .nw-ketting > div b{display:block;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase}' +
      '.blad .nw-ketting > i{align-self:center;font-style:normal;font-weight:600;color:#14224C}' +
      '.blad ol.normen > li > h3{font-size:.98rem;font-weight:600;margin:0}' +
      '.blad ol.normen > li > p{font-size:.88rem;color:#4a5270;margin:2px 0 8px}' +
      '.blad ol.normen table{border-collapse:collapse;width:100%;font-size:.88rem}' +
      '.blad ol.normen th,.blad ol.normen td{border:1px solid #9aa3bb;padding:5px 8px;text-align:left;vertical-align:middle;color:#14224C}' +
      '.blad ol.normen th{font-size:.72rem;font-weight:600;background:#f1f3f8;text-align:center;width:13%;white-space:nowrap}' +
      '.blad ol.normen th:first-child{text-align:left;width:auto}' +
      '.blad ol.normen td.vak{text-align:center}' +
      '.blad ol.normen td.vak::before{content:"";display:inline-block;width:14px;height:14px;border:1.5px solid #14224C;border-radius:3px;vertical-align:middle}' +
      '.blad ol.normen td.schrijf{height:34px;width:40%}' +
      '.blad ol.normen td.letter{width:52px}' +
      '.blad ol.normen .nw-keus{display:flex;flex-wrap:wrap;gap:5px 16px;margin:8px 0 0;font-size:.86rem}' +
      '.blad ol.normen .nw-keus span b{margin-right:5px}' +
      '.blad ol.normen .nw-geval{border-left:3px solid #F26749;padding:4px 0 4px 12px;margin:4px 0 10px;font-size:.92rem;color:#14224C}' +
      '.blad ol.normen .nw-open{margin-top:8px;font-size:.9rem}' +
      '.blad ol.normen .nw-open i{display:block;border-bottom:1px solid #9aa3bb;height:26px}' +
      '.blad ol.normen .nw-open i.hoog{height:30px}' +
      '.blad ol.antw.normen > li b{display:block;font-weight:600}' +
      '.blad ol.antw.normen > li span{display:block;font-size:.88rem;line-height:1.5}' +
      '@media(max-width:560px){.blad .nw-begrip{grid-template-columns:1fr}.blad .nw-ketting{flex-direction:column}.blad .nw-ketting > i{transform:rotate(90deg)}}' +
      '@media print{.blad .nw-ketting > div,.blad ol.normen th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';
    document.head.appendChild(st);
  } catch (e){}

  function uitleg(rang){
    var hoog = rang >= 3;
    var b = rang <= 1 ? [
      ['Waarde', 'Iets wat je belangrijk vindt.', 'Bijvoorbeeld: eerlijk zijn, veilig zijn, respect.'],
      ['Norm', 'Een regel: zo hoor je je te gedragen. Achter elke regel zit een waarde.', 'Bijvoorbeeld: je liegt niet. De waarde is eerlijkheid.'],
      ['Geschreven of ongeschreven', 'Sommige regels staan op papier, zoals de wet of de schoolregels. Andere regels staan nergens, maar iedereen kent ze.', 'Niet stelen staat in de wet. Dank je wel zeggen staat nergens.'],
      ['Sanctie', 'Wat er gebeurt na je gedrag. Doe je het goed, dan krijg je een beloning. Breek je de regel, dan krijg je straf.', 'Een compliment is een beloning. Een boete is een straf.']
    ] : [
      ['Waarde', 'Iets wat mensen belangrijk vinden.', 'Bijvoorbeeld: eerlijkheid, veiligheid, respect.'],
      ['Norm', 'Een regel voor gedrag. Een norm komt voort uit een waarde.', 'Bijvoorbeeld: je liegt niet; je laat een ander uitpraten.'],
      ['Geschreven of ongeschreven', 'Een geschreven norm staat op papier: een wet of de schoolregels. Een ongeschreven norm kent iedereen, maar hij staat nergens.', 'Niet stelen staat in de wet. Opstaan voor een oudere in de bus staat nergens.'],
      ['Sanctie', 'De reactie op gedrag. Een positieve sanctie is een beloning, een negatieve sanctie is een straf.', 'Een compliment is positief, een boete is negatief.']
    ];
    if (hoog) b.push(['Formeel of informeel', 'Een formele sanctie is officieel vastgelegd. Een informele sanctie komt van mensen om je heen.', 'Een schorsing is formeel, een boze blik is informeel.'],
      ['Waardenconflict', 'Twee waarden botsen en je kunt ze niet allebei volgen. Je staat dan voor een dilemma.', 'Camera’s op straat: veiligheid botst met privacy.']);
    if (rang >= 4) b.push(['Moraal en recht', 'Moraal is wat mensen goed of fout vinden. Recht is wat in de wet staat. Die twee vallen niet altijd samen.', 'Liegen tegen een vriend is niet strafbaar, maar de meeste mensen keuren het af.'],
      ['Feit of norm', 'Een feitelijke uitspraak kun je nagaan. Een normatieve uitspraak zegt hoe het zou moeten zijn: er zit een waarde in.', 'Feit: de criminaliteit daalt. Norm: de straffen moeten zwaarder.']);
    return '<div class="nw-uitleg"><p class="kop">Uitleg: lees dit eerst</p><div class="nw-begrip">' + b.map(function(x){
      return '<div><b>' + x[0] + '</b><span>' + x[1] + '</span><em>' + x[2] + '</em></div>';
    }).join('') + '</div>' +
      '<div class="nw-ketting"><div><b>Waarde</b>Veiligheid: mensen willen veilig over straat.</div><i>→</i><div><b>Norm</b>Je doet je fietslicht aan in het donker.</div><i>→</i><div><b>Sanctie</b>Zonder licht: een boete. Met licht: niemand schrikt van je.</div></div></div>';
  }

  /* ---------- de opdrachten: elk maakt zijn eigen gegevens en tekent vraag en antwoord ---------- */
  var OPDRACHT = {
    soort:{ maak:function(k){ var n = k.rang <= 1 ? 3 : 4; return schud(pak(WAARDEN, n).map(function(w){ return [w.charAt(0).toUpperCase() + w.slice(1) + '.', 1]; }).concat(pak(NORMEN, n).map(function(x){ return [x, 0]; }))); },
      vraag:function(d){ return '<h3>Waarde of norm?</h3><p>Zet een kruisje in het goede vakje.</p><table><tr><th></th><th>waarde</th><th>norm</th></tr>' +
        d.map(function(x){ return '<tr><td>' + schoon(x[0]) + '</td><td class="vak"></td><td class="vak"></td></tr>'; }).join('') + '</table>'; },
      antw:function(d){ return '<b>Waarde of norm?</b>' + d.map(function(x){ return '<span>' + schoon(x[0]) + ' <span class="goed" style="display:inline">' + (x[1] ? 'waarde' : 'norm') + '</span></span>'; }).join(''); } },
    paar:{ maak:function(k){ var p = pak(PAREN, k.rang <= 1 ? 4 : 5); return { p:p, w:schud(p.map(function(x){ return x[1]; })) }; },
      vraag:function(d){ return '<h3>Welke waarde zit achter de norm?</h3><p>Schrijf achter elke norm de letter van de waarde die erbij hoort.</p><table>' +
        d.p.map(function(x){ return '<tr><td>' + schoon(x[0]) + '</td><td class="letter"></td></tr>'; }).join('') + '</table>' +
        '<div class="nw-keus">' + d.w.map(function(w, i){ return '<span><b>' + LETTERS.charAt(i) + '</b>' + schoon(w) + '</span>'; }).join('') + '</div>'; },
      antw:function(d){ return '<b>Welke waarde zit achter de norm?</b>' + d.p.map(function(x){ return '<span>' + schoon(x[0]) + ' <span class="goed" style="display:inline">' + LETTERS.charAt(d.w.indexOf(x[1])) + ' · ' + schoon(x[1]) + '</span></span>'; }).join(''); } },
    regel:{ maak:function(){ return schud(pak(REGELS.filter(function(r){ return r[1]; }), 3).concat(pak(REGELS.filter(function(r){ return !r[1]; }), 3))); },
      vraag:function(d){ return '<h3>Geschreven of ongeschreven?</h3><p>Staat de regel ergens op papier, of weet iedereen hem gewoon?</p><table><tr><th></th><th>geschreven</th><th>ongeschreven</th></tr>' +
        d.map(function(x){ return '<tr><td>' + schoon(x[0]) + '</td><td class="vak"></td><td class="vak"></td></tr>'; }).join('') + '</table>'; },
      antw:function(d){ return '<b>Geschreven of ongeschreven?</b>' + d.map(function(x){ return '<span>' + schoon(x[0]) + ' <span class="goed" style="display:inline">' + (x[1] ? 'geschreven (' + schoon(x[2]) + ')' : 'ongeschreven') + '</span></span>'; }).join(''); } },
    sanctie:{ maak:function(k){ return { hoog:k.hoog, s:pak(SANCTIES, k.rang <= 1 ? 5 : 6) }; },
      vraag:function(d){ return '<h3>Welke sanctie is dit?</h3><p>' + (d.hoog ? 'Kruis twee vakjes aan: positief of negatief, en formeel of informeel.' : 'Is het een beloning (positief) of een straf (negatief)?') + '</p><table><tr><th></th><th>positief</th><th>negatief</th>' + (d.hoog ? '<th>formeel</th><th>informeel</th>' : '') + '</tr>' +
        d.s.map(function(x){ return '<tr><td>' + schoon(x[0]) + '</td><td class="vak"></td><td class="vak"></td>' + (d.hoog ? '<td class="vak"></td><td class="vak"></td>' : '') + '</tr>'; }).join('') + '</table>'; },
      antw:function(d){ return '<b>Welke sanctie is dit?</b>' + d.s.map(function(x){ return '<span>' + schoon(x[0]) + ' <span class="goed" style="display:inline">' + (x[1] ? 'positief' : 'negatief') + (d.hoog ? ', ' + (x[2] ? 'formeel' : 'informeel') : '') + '</span></span>'; }).join(''); } },
    begrip:{ maak:function(k){ var p = k.rang >= 4 ? schud(pak(BEGRIPPEN_VWO, 3).concat(pak(BEGRIPPEN, 3))) : pak(BEGRIPPEN, 5); return { p:p, w:schud(p.map(function(x){ return x[1]; })) }; },
      vraag:function(d){ return '<h3>Begrippen</h3><p>Schrijf achter elk begrip de letter van de goede omschrijving.</p><table>' +
        d.p.map(function(x){ return '<tr><td>' + schoon(x[0]) + '</td><td class="letter"></td></tr>'; }).join('') + '</table>' +
        '<div class="nw-keus" style="display:grid">' + d.w.map(function(w, i){ return '<span><b>' + LETTERS.charAt(i) + '</b>' + schoon(w) + '</span>'; }).join('') + '</div>'; },
      antw:function(d){ return '<b>Begrippen</b>' + d.p.map(function(x){ return '<span>' + schoon(x[0]) + ' <span class="goed" style="display:inline">' + LETTERS.charAt(d.w.indexOf(x[1])) + ' · ' + schoon(x[1]) + '</span></span>'; }).join(''); } },
    dilemma:{ maak:function(k){ return { rang:k.rang, g:pak(k.rang >= 4 ? DILEMMAS_VWO : DILEMMAS, 1)[0] }; },
      vraag:function(d){
        var g = d.g, kop = '<h3>Een dilemma</h3><div class="nw-geval">' + schoon(g[0]) + '</div>';
        /* bb: de twee waarden staan er al, de leerling kiest en legt uit */
        if (d.rang <= 1) return kop + '<p>Hier botsen twee waarden: <b>' + schoon(g[1]) + '</b> en <b>' + schoon(g[2]) + '</b>.</p>' +
          '<div class="nw-open">a. Welke van de twee vind jij hier het belangrijkst?<i class="hoog"></i></div><div class="nw-open">b. Wat zou jij doen? Schrijf ook op waarom.<i class="hoog"></i><i class="hoog"></i></div>';
        if (d.rang >= 4) return kop + '<div class="nw-open">a. Welke twee waarden botsen hier?<i></i></div><div class="nw-open">b. Geef voor elke kant een argument.<i></i><i></i><i></i></div>' +
          '<div class="nw-open">c. Wat is jouw standpunt? Noem de waarde die voor jou de doorslag geeft en leg uit waarom.<i></i><i></i><i></i></div>';
        return kop + '<div class="nw-open">a. Welke twee waarden botsen hier?<i></i></div><div class="nw-open">b. Wat zou jij doen?<i></i><i></i></div><div class="nw-open">c. Welke waarde vind jij hier het belangrijkst? Leg uit waarom.<i></i><i></i></div>';
      },
      antw:function(d){
        var g = d.g, paar = '<span class="goed" style="display:inline">' + schoon(g[1]) + ' en ' + schoon(g[2]) + '</span>';
        if (d.rang <= 1) return '<b>Een dilemma</b><span>Eigen antwoord. Goed als de leerling een van de twee waarden kiest en zegt waarom.</span>';
        if (d.rang >= 4) return '<b>Een dilemma</b><span>a. ' + paar + '</span><span>b. Eigen antwoord: bij elke waarde een argument dat erbij past.</span><span>c. Eigen antwoord. Goed als het standpunt steunt op een waarde en ingaat op de andere kant.</span>';
        return '<b>Een dilemma</b><span>a. ' + paar + '</span><span>b en c. Eigen antwoord. Goed als de leerling een keuze maakt en die uitlegt met een waarde.</span>';
      } },
    stelling:{ maak:function(){ return schud(pak(STELLINGEN.filter(function(x){ return x[1]; }), 3).concat(pak(STELLINGEN.filter(function(x){ return !x[1]; }), 3))); },
      vraag:function(d){ return '<h3>Feit of norm?</h3><p>Kun je de uitspraak nagaan (feitelijk), of zegt hij hoe het zou moeten zijn (normatief)?</p><table><tr><th></th><th>feitelijk</th><th>normatief</th></tr>' +
        d.map(function(x){ return '<tr><td>' + schoon(x[0]) + '</td><td class="vak"></td><td class="vak"></td></tr>'; }).join('') + '</table>'; },
      antw:function(d){ return '<b>Feit of norm?</b>' + d.map(function(x){ return '<span>' + schoon(x[0]) + ' <span class="goed" style="display:inline">' + (x[1] ? 'normatief' : 'feitelijk') + '</span></span>'; }).join(''); } },
    eigen:{ maak:function(){ return pak(['Thuis', 'Op school', 'Bij je sport of hobby', 'In de bus of trein', 'Op sociale media', 'In de winkel'], 3); },
      vraag:function(d){ return '<h3>Jouw normen en waarden</h3><p>Schrijf bij elke plek een norm die daar geldt en de waarde die erachter zit.</p><table><tr><th>plek</th><th style="text-align:left">een norm</th><th style="text-align:left">de waarde erachter</th></tr>' +
        d.map(function(x){ return '<tr><td>' + schoon(x) + '</td><td class="schrijf"></td><td class="schrijf" style="width:30%"></td></tr>'; }).join('') + '</table>'; },
      antw:function(){ return '<b>Jouw normen en waarden</b><span>Eigen antwoord. Goed als de norm een regel voor gedrag is en de waarde zegt waarom die regel er is. Bijvoorbeeld: thuis ruim je je bord op (norm), omdat je samen voor het huis zorgt (waarde: verantwoordelijkheid).</span>'; } }
  };
  /* de volgorde op het blad: eerst herkennen, dan toepassen, dan zelf nadenken */
  var VOLGORDE = {
    1:['soort', 'paar', 'sanctie', 'regel', 'dilemma', 'eigen'],
    2:['soort', 'paar', 'regel', 'sanctie', 'dilemma', 'eigen'],
    3:['soort', 'paar', 'sanctie', 'begrip', 'dilemma', 'eigen'],
    4:['paar', 'sanctie', 'begrip', 'stelling', 'dilemma', 'eigen']
  };

  window.SPELBLAD.normenwaarden = {
    naam:'Normen en waarden', kort:'Met uitleg: zelfstandig te maken', icoon:'weegschaal', vak:'burg',
    aantallen:[3, 4, 5, 6], standaard:5, aantalNaam:'Aantal opdrachten',
    delenKop:'Wat staat erop',
    delenTip:'Een werkblad dat op zichzelf staat: bovenaan de uitleg van waarde, norm en sanctie, daaronder opdrachten om aan te kruisen, te koppelen en zelf over na te denken. Elk niveau heeft een eigen blad: bb met korte zinnen en meer houvast, havo met formele en informele sancties en begrippen, vwo ook met moraal en recht en vraagstukken uit de samenleving.',
    delen:function(aan){
      aan = aan || [];
      return '<p class="kop">Uitleg</p><label><input type="checkbox" name="nw-kaal" value="kaal"' + (aan.indexOf('kaal') >= 0 ? ' checked' : '') + '> Zonder de uitleg bovenaan (na een les)</label>';
    },
    lees:function(el, rang){
      var kaal = el.querySelector('input[name="nw-kaal"]');
      rang = Math.max(1, Math.min(4, rang || 2));
      return { uitleg:!(kaal && kaal.checked), rang:rang, hoog:rang >= 3 };
    },
    maak:function(keuze, n){
      return VOLGORDE[keuze.rang].slice(0, n).map(function(id){ return { id:id, d:OPDRACHT[id].maak(keuze) }; });
    },
    teken:function(w){
      var k = w.keuze;
      return {
        titel:'Normen en waarden', sub:'Mens en maatschappij · ' + (w.niveauNaam ? w.niveauNaam + ' · ' : '') + w.items.length + ' opdrachten',
        klasse:'normen',
        vragen:w.items.map(function(it){ return '<li>' + OPDRACHT[it.id].vraag(it.d) + '</li>'; }).join(''),
        antwoorden:w.items.map(function(it){ return '<li>' + OPDRACHT[it.id].antw(it.d) + '</li>'; }).join(''),
        boven:k.uitleg ? uitleg(k.rang) : ''
      };
    }
  };
})();
