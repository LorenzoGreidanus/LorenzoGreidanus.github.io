/* Uitleg stap voor stap bij Het eiland. */
STAPPEN.les('eiland', function(){
  var S = STAPPEN;
  return [
    {
      id: 'waarden', naam: 'Drie basiswaarden', uitleg: 'Waar een democratische rechtsstaat op rust, en waarom die waarden kunnen botsen.',
      stappen: [
        { kop: 'Drie waarden', beeld: S.tabel(['waarde', 'wat het betekent'], [['vrijheid', 'zelf mogen kiezen wat je denkt, zegt, gelooft en doet'], ['gelijkwaardigheid', 'iedereen telt even zwaar en wordt gelijk behandeld'], ['solidariteit', 'voor elkaar zorgen, ook als het je zelf iets kost']]),
          tekst: '<p>Een democratische rechtsstaat rust op drie basiswaarden: <b>vrijheid</b>, <b>gelijkwaardigheid</b> en <b>solidariteit</b>.</p>' },
        { kop: 'Ze kunnen botsen', beeld: S.formule('houden wat je vangt &nbsp;↔&nbsp; delen met wie niet kan'),
          tekst: '<p>Soms gaat de ene waarde ten koste van de andere. De vrijheid om te houden wat je verdient botst met solidariteit met wie niets verdient. Een samenleving moet daarin keuzes maken.</p>' },
        { kop: 'De Grondwet', beeld: S.formule('artikel 1 · 6 · 7 · 14 · 15 · 17 · 20'),
          tekst: '<p>In Nederland legt de Grondwet een deel van die keuzes vast: gelijke behandeling (artikel 1), vrijheid van godsdienst (6) en van meningsuiting (7), eigendom (14), een eerlijk proces (15 en 17) en bestaanszekerheid (20).</p>' }
      ]
    },
    {
      id: 'spel', naam: 'Zo speel je', uitleg: 'De klas maakt de grondwet van een eiland.',
      stappen: [
        { kop: 'Vijf groepen', beeld: S.tabel(['groep', 'mensen'], [['vissers', '10'], ['eigenaren', '4'], ['ouderen en zieken', '8'], ['nieuwkomers', '8'], ['jongeren', '10']]),
          tekst: '<p>Na een schipbreuk wonen veertig mensen op een eiland. Iedereen in de klas krijgt een groep, en elke groep heeft iets anders nodig.</p>' },
        { kop: 'Zes regels', beeld: S.formule('A · B · C &nbsp;→&nbsp; een artikel'),
          tekst: '<p>Bij elke vraag kiest de klas uit drie regels. De regel met de meeste stemmen wordt een artikel van de grondwet van het eiland. Het bord laat zien wat die regel met elke groep doet.</p>' },
        { kop: 'Wie mag meestemmen?', beeld: S.formule('regel 3 bepaalt wie er daarna nog stemt'),
          tekst: '<p>Bij de derde regel beslist de klas wie er voortaan mag meestemmen. Kiest de klas voor een kleine groep, dan tellen de stemmen van de anderen daarna niet meer.</p>' },
        { kop: 'Naast de echte', beeld: S.formule('de grondwet van het eiland ↔ de Grondwet van Nederland'),
          tekst: '<p>Na elke regel en aan het eind zie je hoe Nederland dezelfde vraag in de Grondwet regelde.</p>' }
      ]
    }
  ];
});
