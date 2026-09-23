/* Uitleg stap voor stap bij De Conferentie van Berlijn. */
STAPPEN.les('berlijn', function(){
  var S = STAPPEN;
  return [
    {
      id: 'geschiedenis', naam: 'Wat was de Conferentie van Berlijn?', uitleg: 'Europa verdeelt Afrika, 1884 en 1885.',
      stappen: [
        { kop: 'De wedloop om Afrika', beeld: S.formule('rond 1880: Europese landen willen grondstoffen, markten en macht'),
          tekst: '<p>Aan het eind van de negentiende eeuw wilden steeds meer Europese landen een stuk van Afrika: voor grondstoffen, voor nieuwe markten en voor aanzien. Dat dreigde tot ruzie en oorlog te leiden.</p>' },
        { kop: 'Afspraken in Berlijn', beeld: S.formule('1884–1885 · veertien landen · geen enkele Afrikaan'),
          tekst: '<p>Daarom kwamen veertien landen bijeen in Berlijn om regels af te spreken voor wie welk gebied mocht claimen. Er zat geen enkele Afrikaan aan tafel.</p>' },
        { kop: 'De gevolgen', beeld: S.formule('grenzen met een liniaal · volken gescheiden of samengevoegd'),
          tekst: '<p>In de jaren daarna werd bijna heel Afrika verdeeld. Grenzen werden vaak recht getrokken, dwars door volken en gebieden heen. Veel van die grenzen bestaan nog steeds.</p>' +
            S.bak('Denk tijdens het spel na over wie er niet aan tafel zit, en wat dat betekent.', 'goed') }
      ]
    },
    {
      id: 'spel', naam: 'Zo speel je', uitleg: 'Claimen, ruilen en samen tekenen.',
      stappen: [
        { kop: 'Vier onderhandelaars', beeld: S.formule('ieder eigen doelen · niemand kan iets afdwingen'),
          tekst: '<p>Jullie spelen de vier belangrijkste landen. Ieder heeft eigen doelen. Omdat niemand iets kan afdwingen, moet je praten en ruilen.</p>' },
        { kop: 'Elke ronde een zet', beeld: S.formule('claim leggen · ruilen'),
          tekst: '<p>Elke ronde leg je een claim op een gebied of doe je een ruil met een ander land.</p>' },
        { kop: 'Tekenen', beeld: S.formule('alle vier tekenen, of bezwaar tegen één gebied'),
          tekst: '<p>Aan het eind moet de kaart door alle vier ondertekend worden. Je mag ook bezwaar maken tegen één gebied.</p>' }
      ]
    }
  ];
});
