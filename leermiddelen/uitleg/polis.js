/* Uitleg stap voor stap bij De polis: de bestuursvormen van een Griekse
   stadstaat, en hoe het spel werkt. */
STAPPEN.les('polis', function(){
  var S = STAPPEN;
  return [
    {
      id: 'vormen', naam: 'Wie mag er stemmen?', uitleg: 'Monarchie, aristocratie, oligarchie, tirannie en democratie.',
      stappen: [
        { kop: 'Een polis', beeld: S.formule('stadstaat = stad + land eromheen + eigen bestuur'),
          tekst: '<p>Griekenland was geen land maar een verzameling stadstaten, poleis. Elke polis had zijn eigen bestuur, en dat kon veranderen.</p>' },
        { kop: 'De bestuursvormen', beeld: S.tabel(['vorm', 'wie heeft de macht'], [['monarchie', 'één koning'], ['aristocratie', 'de beste families, de adel'], ['oligarchie', 'een kleine rijke groep'], ['tirannie', 'één man die de macht greep'], ['democratie', 'alle vrije mannelijke burgers']]),
          tekst: '<p>Het woord zegt het: mono is één, oligo is weinig, demos is het volk, kratos is macht.</p>' +
            S.bak('Ook in de democratie van Athene mochten vrouwen, slaven en vreemdelingen niet stemmen.', 'let') },
        { kop: 'Omwentelingen', beeld: S.formule('groep te lang buitengesloten → onrust → <span class="st-na">nieuwe bestuursvorm</span>'),
          tekst: '<p>Voelde een grote groep zich te lang buitengesloten, dan kon het omslaan. Zo rolde een polis van de ene bestuursvorm in de andere.</p>' }
      ]
    },
    {
      id: 'spel', naam: 'Zo speel je', uitleg: 'Stemmen ronselen en zien wat er zetel voor zetel gebeurt.',
      stappen: [
        { kop: 'Veertig zetels', beeld: S.formule('bestuursvorm bepaalt wie er stemt'),
          tekst: '<p>Je brengt voorstellen in bij de vergadering. De bestuursvorm bepaalt wie van de veertig zetels mag stemmen.</p>' },
        { kop: 'Kies een kant', beeld: S.formule('wie je buitensluit, komt terug'),
          tekst: '<p>Bij elke kwestie kies je een kant. Verlies je de steun van een groep te lang, dan komt er een omwenteling en verandert de hele zaal.</p>' }
      ]
    }
  ];
});
