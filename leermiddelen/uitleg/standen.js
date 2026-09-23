/* Uitleg stap voor stap bij Stem per stand. */
STAPPEN.les('standen', function(){
  var S = STAPPEN;
  function balk(delen){
    return '<div style="width:min(480px,100%);display:flex;height:34px;border-radius:10px;overflow:hidden;font-size:.8rem;font-weight:600">' +
      delen.map(function(d){ return '<span style="flex:' + d[0] + ';background:' + d[2] + ';color:#14224C;display:grid;place-items:center;white-space:nowrap;overflow:hidden">' + d[1] + '</span>'; }).join('') + '</div>';
  }
  return [
    {
      id: 'geschiedenis', naam: 'Drie standen, drie stemmen', uitleg: 'Frankrijk, 1789: waarom de manier van stemmen alles bepaalde.',
      stappen: [
        { kop: 'Drie standen', beeld: S.tabel(['stand', 'wie'], [['Eerste Stand', 'de geestelijkheid'], ['Tweede Stand', 'de adel'], ['Derde Stand', 'iedereen anders: boeren, burgers, arbeiders']]),
          tekst: '<p>In Frankrijk was de bevolking verdeeld in drie standen. De eerste twee hadden voorrechten en betaalden nauwelijks belasting.</p>' },
        { kop: 'Hoe groot waren ze?', beeld: balk([[1, '1e', '#83A5F2'], [2, '2e', '#FCDED6'], [97, 'Derde Stand: 97%', '#EA9836']]),
          tekst: '<p>De Derde Stand was ongeveer <b>97 procent</b> van de bevolking.</p>' },
        { kop: 'Eén stem per stand', beeld: S.formule('1e: tegen &nbsp;+&nbsp; 2e: tegen &nbsp;→&nbsp; 2 tegen 1'),
          tekst: '<p>In de Staten-Generaal had elke stand één stem. De eerste en de tweede stand konden de Derde Stand dus altijd overstemmen, ook al vertegenwoordigde die bijna iedereen.</p>' },
        { kop: '1789', beeld: S.formule('juni 1789 · de Derde Stand noemt zich Nationale Vergadering'),
          tekst: '<p>De Derde Stand eiste stemmen per persoon. Toen dat niet lukte, riepen ze zichzelf uit tot Nationale Vergadering. Het begin van de Franse Revolutie.</p>' }
      ]
    },
    {
      id: 'spel', naam: 'Zo speel je', uitleg: 'De klas stemt mee over voorstellen.',
      stappen: [
        { kop: 'Het bord leidt de vergadering', beeld: S.formule('digibord + telefoons, of handen opsteken'),
          tekst: '<p>De docent opent de vergadering op het digibord. Leerlingen stemmen op hun eigen scherm, of de klas steekt handen op.</p>' },
        { kop: 'Stemmen per stand', beeld: S.formule('per persoon tellen ↔ per stand tellen'),
          tekst: '<p>Bij elk voorstel zie je wat de uitslag is als je per persoon telt, en wat er gebeurt als je per stand telt. Merk zelf hoe dat voelt.</p>' }
      ]
    }
  ];
});
