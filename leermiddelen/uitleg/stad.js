/* Uitleg stap voor stap bij Arena (stad.html). */
STAPPEN.les('stad', function(){
  var S = STAPPEN;
  return [
    {
      id: 'spel', naam: 'Zo werkt Arena', uitleg: 'Quests en kisten met vragen, en veilig naar een uitgang.',
      stappen: [
        { kop: 'Lopen en vechten', beeld: S.formule('WASD of pijltjes · spatie ontwijkt · Q zwaard of boog · F je kracht · E gebruiken · R drankje'),
          tekst: '<p>Loop met WASD, de pijltjes of door je vinger op de kaart te houden. Je wapen slaat vanzelf als er een vijand dichtbij is. Ridder, Schutter en Schildwacht hebben elk een eigen kracht.</p>' },
        { kop: 'De stad is veilig', beeld: S.formule('in de stad: <span class="st-na">geen vijanden, geen gevechten</span>'),
          tekst: '<p>Midden op de kaart ligt de stad. Daar begin je, daar haal je quests bij De jager, De geleerde en De verkenner, zet je punten in bij De trainer en koop je drankjes. Niemand kan je daar raken.</p>' },
        { kop: 'Vragen zijn je sleutels', beeld: S.formule('quest, kist, vraagsteen, uitgang → <span class="st-na">een goed antwoord</span>'),
          tekst: '<p>Een quest vraagt soms om vragen goed te beantwoorden. Een kist, een vraagsteen en een uitgang gaan open met een goed antwoord. Fout? Dan lees je de uitleg en probeer je het later met een andere vraag.</p>' },
        { kop: 'Bewaren doe je bij een uitgang', beeld: S.formule('uitgang: goed antwoord → <span class="st-na">5 tellen in de ring</span> → bewaard'),
          tekst: '<p>Wat je verdient, is pas bewaard als je via een uitgang de kaart verlaat. Word je eerder verslagen, dan ben je een kwart van je XP in dat level kwijt, en je goud en drankjes blijven liggen.</p>' +
            S.bak('Hoe langer je blijft, hoe meer je verdient, maar hoe meer je kunt verliezen. Weet wanneer je moet gaan.', 'goed') },
        { kop: 'De rode ruïnes', beeld: S.formule('rode zone: <span class="st-na">betere buit, en spelers vanaf level 3</span>'),
          tekst: '<p>Aan de rand liggen de rode ruïnes. De buit is er beter, en daar kunnen spelers vanaf level 3 elkaar aanvallen; wie wint, krijgt de XP die de ander kwijtraakt. Een rode cirkel volgt de sterkste speler op de kaart: de vijanden daarin zijn extra sterk.</p>' }
      ]
    }
  ];
});
