/* Uitleg stap voor stap bij Jagers en boeren. */
STAPPEN.les('jagers', function(){
  var S = STAPPEN;
  return [
    {
      id: 'omslag', naam: 'Van jagen naar boeren', uitleg: 'Waarom mensen gingen zaaien en blijven wonen.',
      stappen: [
        { kop: 'Jagers-verzamelaars', beeld: S.formule('jagen · vissen · verzamelen · rondtrekken'),
          tekst: '<p>Lang leefden mensen in kleine groepen die rondtrokken met de seizoenen. Ze aten wat ze vonden: wild, vis, noten, bessen.</p>' },
        { kop: 'Boeren', beeld: S.formule('zaaien · oogsten · vee · <span class="st-na">op één plek blijven</span>'),
          tekst: '<p>Rond 5000 voor Christus kwamen in onze streken mensen die graan zaaiden en vee hielden. Zij bleven op één plek wonen, bij hun akkers.</p>' },
        { kop: 'Wat het opleverde en kostte', beeld: S.tabel(['boer worden', ''], [['meer eten van hetzelfde stuk land', '+'], ['voorraad voor de winter', '+'], ['hard werken, het hele jaar', '−'], ['een misoogst is een ramp', '−']]),
          tekst: '<p>Boeren kon meer mensen voeden, maar was zwaar en riskant. In het spel merk je zelf waarom groepen toch overstapten.</p>' }
      ]
    },
    {
      id: 'spel', naam: 'Zo speel je', uitleg: 'Twaalf jaar, zes ploegen per jaar.',
      stappen: [
        { kop: 'Verdeel je ploegen', beeld: S.formule('6 ploegen → jagen · verzamelen · zaaien · bouwen'),
          tekst: '<p>Je groep heeft twaalf mensen. Elk jaar verdeel je zes ploegen over jagen, verzamelen, zaaien en bouwen.</p>' },
        { kop: 'Kijk vooruit', beeld: S.formule('zaaien nu → oogst later'),
          tekst: '<p>Wat je zaait, levert pas later iets op. Bouwen kost nu tijd, maar geeft een plek om te blijven. Jagen levert meteen eten, zolang er wild is.</p>' +
            S.bak('Twaalf jaar lang bepaal jij het. Kijk aan het eind hoe je groep veranderd is.', 'goed') }
      ]
    }
  ];
});
