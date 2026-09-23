/* Uitleg stap voor stap bij Vlaggen: hoe je vlaggen die op elkaar lijken
   uit elkaar houdt. De plaatjes zijn de vlaggen van de site zelf. */
STAPPEN.les('vlaggen', function(){
  var S = STAPPEN;
  function vlag(code, naam){ return '<figure><img src="vlaggen/' + code + '.svg" alt="" style="height:64px;width:auto;border:1px solid rgba(127,127,127,.4);border-radius:4px;display:block"><figcaption>' + naam + '</figcaption></figure>'; }
  return [
    {
      id: 'kijken', naam: 'Hoe kijk je naar een vlag?', uitleg: 'Kleuren, richting, verhouding en een teken.',
      stappen: [
        { kop: '1. De kleuren', beeld: S.rij([vlag('nl', 'Nederland'), vlag('fr', 'Frankrijk')]),
          tekst: '<p>Begin bij de kleuren. Nederland en Frankrijk hebben allebei rood, wit en blauw, dus je hebt meer nodig.</p>' },
        { kop: '2. Liggend of staand', beeld: S.rij([vlag('de', 'Duitsland'), vlag('be', 'België')]),
          tekst: '<p>Lopen de banen van links naar rechts (liggend) of van boven naar beneden (staand)? Duitsland en België hebben dezelfde kleuren, maar Duitsland ligt en België staat.</p>' },
        { kop: '3. De tint en de verhouding', beeld: S.rij([vlag('nl', 'Nederland'), vlag('lu', 'Luxemburg')]),
          tekst: '<p>Nederland heeft donkerblauw, Luxemburg lichtblauw, en de vlag van Luxemburg is langer.</p>' },
        { kop: '4. Een teken of een kruis', beeld: S.rij([vlag('dk', 'Denemarken'), vlag('no', 'Noorwegen'), vlag('is', 'IJsland')]),
          tekst: '<p>De Scandinavische landen hebben allemaal een kruis dat iets naar links staat. Let op de kleuren: Denemarken wit op rood, Noorwegen blauw met wit op rood, IJsland rood met wit op blauw.</p>' }
      ]
    },
    {
      id: 'lastig', naam: 'Lastige paren', uitleg: 'Vlaggen die bijna hetzelfde zijn.',
      stappen: [
        { kop: 'Ierland en Ivoorkust', beeld: S.rij([vlag('ie', 'Ierland'), vlag('ci', 'Ivoorkust')]),
          tekst: '<p>Precies elkaars spiegelbeeld. Ierland begint links met <b>groen</b> (het groene eiland), Ivoorkust met oranje.</p>' },
        { kop: 'Italië en Ierland', beeld: S.rij([vlag('it', 'Italië'), vlag('ie', 'Ierland')]),
          tekst: '<p>Allebei groen, wit en nog een kleur. Italië eindigt in <b>rood</b>, Ierland in oranje.</p>' },
        { kop: 'Onthouden', beeld: '',
          tekst: '<p>Bedenk bij elke lastige vlag één ezelsbruggetje en zeg het hardop. In het spel staan de vlaggen die op elkaar lijken steeds samen, dus je oefent precies het verschil.</p>' +
            S.bak('Fout gehad? Kijk bij het antwoord wat het verschil is, en zoek hem later nog een keer op.', 'goed') }
      ]
    }
  ];
});
