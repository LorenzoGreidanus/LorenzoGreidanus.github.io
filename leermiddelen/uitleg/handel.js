/* Uitleg stap voor stap bij De handel: vraag en aanbod, en hoe het spel werkt. */
STAPPEN.les('handel', function(){
  var S = STAPPEN;
  return [
    {
      id: 'vraag', naam: 'Vraag en aanbod', uitleg: 'Waarom prijzen bewegen.',
      stappen: [
        { kop: 'Schaars is duur', beeld: S.formule('weinig aanbod + veel vraag = <span class="st-na">hoge prijs</span>'),
          tekst: '<p>Is er van iets weinig en willen veel mensen het hebben, dan stijgt de prijs. Is er veel van en wil bijna niemand het, dan daalt hij.</p>' },
        { kop: 'Jouw aankoop telt mee', beeld: S.formule('jij koopt veel op → de voorraad slinkt → de prijs stijgt'),
          tekst: '<p>Als jij in een haven veel koopt, wordt het daar schaarser. Daardoor wordt elk volgend stuk duurder, terwijl je nog aan het kopen bent.</p>' },
        { kop: 'En jouw verkoop ook', beeld: S.formule('jij verkoopt alles tegelijk → de markt raakt vol → de prijs zakt'),
          tekst: '<p>Verkoop je alles in één keer, dan zakt de prijs onder je handen weg. Soms loont het om te spreiden over meer havens.</p>' }
      ]
    },
    {
      id: 'spel', naam: 'Zo speel je', uitleg: 'Varen, kopen, verkopen, en niet failliet gaan.',
      stappen: [
        { kop: 'Koop laag, verkoop hoog', beeld: S.formule('koop waar het goedkoop is → vaar → verkoop waar het schaars is'),
          tekst: '<p>Het verschil tussen je inkoopprijs en je verkoopprijs is je winst.</p>' },
        { kop: 'Varen is informatie halen', beeld: S.formule('je kent alleen de prijzen van havens waar je geweest bent'),
          tekst: '<p>Je weet niet wat het elders kost tot je er bent geweest. Een reis kan dus ook bedoeld zijn om te kijken.</p>' },
        { kop: 'Reizen kost geld', beeld: S.formule('elke reis kost geld, en steeds meer'),
          tekst: '<p>Elke vaart kost geld, en dat wordt steeds meer. Wie niet genoeg verdient, vaart zich arm.</p>' +
            S.bak('Zo werkte het ook voor de handelaren van de Gouden Eeuw: winst kwam van schaarste, en risico hoorde erbij.', 'goed') }
      ]
    }
  ];
});
