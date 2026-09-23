/* Uitleg stap voor stap bij De vergadering: de Staten-Generaal van de
   Republiek in 1672, en eenparigheid van stemmen. */
STAPPEN.les('vergadering', function(){
  var S = STAPPEN;
  return [
    {
      id: 'geschiedenis', naam: 'De Republiek en het rampjaar', uitleg: 'Zeven gewesten, één stem per gewest, en iedereen moet ja zeggen.',
      stappen: [
        { kop: 'Zeven gewesten', beeld: S.formule('Holland · Zeeland · Utrecht · Gelderland · Overijssel · Friesland · Groningen'),
          tekst: '<p>De Republiek der Zeven Verenigde Nederlanden bestond uit zeven gewesten. Elk gewest bestuurde zichzelf, en samen vormden ze de Staten-Generaal in Den Haag.</p>' },
        { kop: 'Holland betaalt het meest', beeld: S.formule('Holland bijna 60% &nbsp;·&nbsp; Overijssel nog geen 4%'),
          tekst: '<p>Holland was verreweg het rijkste gewest en betaalde bijna zestig procent van alles. Toch had elk gewest in de Staten-Generaal precies <b>één stem</b>.</p>' },
        { kop: 'Eenparigheid van stemmen', beeld: S.formule('6 × ja + 1 × nee = <span class="st-na">geen besluit</span>'),
          tekst: '<p>Voor belangrijke besluiten, zoals oorlog en belasting, moesten alle zeven gewesten ja zeggen. Eén nee blokkeerde alles.</p>' },
        { kop: '1672, het rampjaar', beeld: S.formule('Frankrijk, Engeland, Munster en Keulen vallen aan'),
          tekst: '<p>In 1672 werd de Republiek van alle kanten aangevallen. Er moest snel geld komen voor het leger, maar dan moest iedereen het eens worden.</p>' +
            S.bak('Het volk zei over dat jaar: redeloos, radeloos en reddeloos.', 'goed') }
      ]
    },
    {
      id: 'spel', naam: 'Zo speel je', uitleg: 'Praten, beloven en op het goede moment laten stemmen.',
      stappen: [
        { kop: 'Jij bent Holland', beeld: S.formule('doel: alle zeven voor de oorlogsbelasting'),
          tekst: '<p>Jij speelt Holland en wilt de oorlogsbelasting erdoor krijgen.</p>' },
        { kop: 'Elke dag een zet', beeld: S.formule('praten · toezeggen · in stemming brengen'),
          tekst: '<p>Elke dag praat je met een gewest, doe je een toezegging, of breng je het voorstel in stemming. Geld en dagen zijn beperkt.</p>' },
        { kop: 'Timing', beeld: S.formule('te vroeg stemmen = een nee'),
          tekst: '<p>Breng het pas in stemming als je denkt dat iedereen ja zegt. Een gewest dat nog twijfelt, kan alles tegenhouden.</p>' }
      ]
    }
  ];
});
