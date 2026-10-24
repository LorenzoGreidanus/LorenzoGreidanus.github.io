/* Uitleg stap voor stap bij De republiek (Weimar en de machtsovername van 1933). */
STAPPEN.les('republiek', function(){
  var S = STAPPEN;
  return [
    {
      id: 'geschiedenis', naam: 'Hoe verdween de democratie in 1933?', uitleg: 'Van een jonge republiek naar een dictatuur, in één jaar.',
      stappen: [
        { kop: 'Een jonge republiek', beeld: S.formule('1918 · keizer weg · de Republiek van Weimar'),
          tekst: '<p>Na de Eerste Wereldoorlog werd Duitsland een democratie: de Republiek van Weimar. Er kwam een parlement (de Rijksdag), een president en een rijkskanselier die de regering leidde. De grondwet had grondrechten, zoals vrijheid van meningsuiting. Maar artikel 48 gaf de president in een noodtoestand veel macht.</p>' },
        { kop: 'Crisis', beeld: S.formule('1929 · beurskrach · zes miljoen werklozen'),
          tekst: '<p>Na de beurskrach van 1929 raakten miljoenen Duitsers hun werk kwijt. Partijen die de democratie wilden afschaffen, zoals de NSDAP van Adolf Hitler en de communisten, werden groot. Het parlement vond geen meerderheid meer, en de president regeerde met noodverordeningen.</p>' },
        { kop: 'Hitler wordt kanselier', beeld: S.formule('30 januari 1933'),
          tekst: '<p>President Hindenburg benoemde Hitler tot rijkskanselier. De NSDAP had geen meerderheid. Andere politici dachten dat ze Hitler in de hand konden houden.</p>' },
        { kop: 'Stap voor stap, en langs de wet', beeld: S.formule('noodverordening → Machtigingswet → gelijkschakeling → één partij'),
          tekst: '<p>Na de brand in het parlementsgebouw (27 februari) golden de grondrechten niet meer. Op 23 maart stemde het parlement voor de Machtigingswet: de regering mocht zelf wetten maken. Daarna volgden de rechters, de vakbonden en de andere partijen: in juli 1933 was de NSDAP de enige partij. Vanaf oktober mocht alleen nog journalist zijn wie de regering betrouwbaar vond.</p>' +
            S.bak('Bijna elke stap was een wet of een noodverordening. Zo kon een democratie verdwijnen zonder dat de grondwet werd afgeschaft.', 'goed') }
      ]
    },
    {
      id: 'spel', naam: 'Zo speel je', uitleg: 'Geheime rollen, regeringen kiezen en wetten aannemen.',
      stappen: [
        { kop: 'Een geheime rol', beeld: S.formule('verdedigers ↔ ondermijners, met de sterke leider'),
          tekst: '<p>De docent opent het parlement op het digibord. Je doet mee met de code op je telefoon of laptop (meneergreidanus.nl/q). Je krijgt een geheime rol: verdediger van de democratie of ondermijner. De ondermijners kennen elkaar; één van hen is de sterke leider. Tik op je kaart om je rol te zien, en laat hem aan niemand zien.</p>' },
        { kop: 'Een regering kiezen', beeld: S.formule('president kiest kanselier → iedereen stemt'),
          tekst: '<p>Elke ronde is iemand anders president. De president kiest een kanselier, en het hele parlement stemt op de telefoon: ja of nee. Meer ja dan nee, dan is de regering gekozen. Drie keer achter elkaar afgewezen? Dan staat de republiek stil en gaat de bovenste wet er zomaar door.</p>' },
        { kop: 'Een wet aannemen', beeld: S.formule('3 wetten → 2 → 1'),
          tekst: '<p>De president trekt drie wetten en legt er in het geheim een weg. De kanselier kiest uit de laatste twee. Iedereen ziet welke wet erdoor kwam, maar niet wat er weg ging. Vraag de president en de kanselier wat ze kregen. Geloof je ze?</p>' },
        { kop: 'Machten en winnen', beeld: S.formule('5 rechtsstaatwetten ↔ 6 ondermijningswetten'),
          tekst: '<p>Elke ondermijningswet geeft de president een macht: iemand onderzoeken, iemand monddood maken, de volgende president kiezen of iemand uit het parlement zetten. De verdedigers winnen met vijf rechtsstaatwetten, of als de sterke leider uit het parlement gaat. De ondermijners winnen met zes ondermijningswetten, of als de sterke leider kanselier wordt na de derde ondermijningswet.</p>' +
            S.bak('Na het spel laat het bord zien wat er in 1933 echt gebeurde, bij elke wet.', 'goed') }
      ]
    }
  ];
});
