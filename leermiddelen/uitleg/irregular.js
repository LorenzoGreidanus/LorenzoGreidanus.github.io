/* Uitleg stap voor stap bij Irregular verbs: de drie vormen, en hoe je ze
   in groepjes leert in plaats van een lange lijst. */
STAPPEN.les('irregular', function(){
  var S = STAPPEN;
  return [
    {
      id: 'vormen', naam: 'De drie vormen', uitleg: 'Infinitive, past simple en past participle: wanneer gebruik je welke?',
      stappen: [
        { kop: 'Drie vormen van één werkwoord', beeld: S.tabel(['infinitive', 'past simple', 'past participle'], [['go', 'went', 'gone'], ['see', 'saw', 'seen'], ['take', 'took', 'taken']]),
          tekst: '<p>Een onregelmatig werkwoord heeft drie vormen die je moet kennen. De eerste is het hele werkwoord, de tweede de verleden tijd, de derde het voltooid deelwoord.</p>' },
        { kop: 'Regelmatig: gewoon -ed', beeld: S.formule('walk → walk<span class="st-na">ed</span> → walk<span class="st-na">ed</span>'),
          tekst: '<p>De meeste Engelse werkwoorden zijn regelmatig: je zet er -ed achter. Onregelmatige werkwoorden doen dat niet, en die moet je leren.</p>' },
        { kop: 'Past simple: iets dat voorbij is', beeld: S.formule('Yesterday I <span class="st-na">went</span> to school.'),
          tekst: '<p>De tweede vorm gebruik je voor iets dat in het verleden gebeurde en klaar is, vaak met yesterday, last week of ago.</p>' },
        { kop: 'Past participle: na have of has', beeld: S.formule('I have <span class="st-na">gone</span> &nbsp; · &nbsp; It was <span class="st-na">taken</span>'),
          tekst: '<p>De derde vorm gebruik je na <b>have</b>, <b>has</b> of <b>had</b>, en in de lijdende vorm na was of is.</p>' +
            S.bak('Niet "I have went": na have komt altijd de derde vorm.', 'let') }
      ]
    },
    {
      id: 'groepjes', naam: 'Leren in groepjes', uitleg: 'Werkwoorden die hetzelfde patroon volgen, leer je samen.',
      stappen: [
        { kop: 'Alle drie hetzelfde', beeld: S.tabel(['', '', ''], [['cut', 'cut', 'cut'], ['put', 'put', 'put'], ['let', 'let', 'let'], ['hit', 'hit', 'hit']]),
          tekst: '<p>Een makkelijk groepje: de vormen zijn alle drie hetzelfde.</p>' },
        { kop: 'Tweede en derde hetzelfde', beeld: S.tabel(['', '', ''], [['buy', 'bought', 'bought'], ['bring', 'brought', 'brought'], ['think', 'thought', 'thought'], ['teach', 'taught', 'taught']]),
          tekst: '<p>Hier zijn de tweede en de derde vorm gelijk. Dit groepje eindigt ook nog allemaal op -ought of -aught.</p>' },
        { kop: 'Klinker verandert: i → a → u', beeld: S.tabel(['', '', ''], [['s<b>i</b>ng', 's<b>a</b>ng', 's<b>u</b>ng'], ['dr<b>i</b>nk', 'dr<b>a</b>nk', 'dr<b>u</b>nk'], ['sw<b>i</b>m', 'sw<b>a</b>m', 'sw<b>u</b>m'], ['beg<b>i</b>n', 'beg<b>a</b>n', 'beg<b>u</b>n']]),
          tekst: '<p>Bij dit groepje verandert alleen de klinker, steeds op dezelfde manier.</p>' },
        { kop: 'Zo leer je ze', beeld: S.formule('zeg hardop: <span class="st-na">sing, sang, sung</span>'),
          tekst: '<p>Zeg de drie vormen hardop achter elkaar, als een rijmpje. Leer per dag één groepje, en oefen de werkwoorden die je fout had nog een keer.</p>' +
            S.bak('Let op de spelling: in het spel telt die mee. Swam met één m, begun met één n.', 'goed') }
      ]
    }
  ];
});
