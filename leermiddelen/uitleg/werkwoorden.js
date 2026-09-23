/* Uitleg stap voor stap bij de Werkwoordrace: de stam, de tegenwoordige
   tijd met de t-regel, de verleden tijd met 't kofschip, het voltooid
   deelwoord en de d-of-t-val. */
STAPPEN.les('werkwoorden', function(){
  var S = STAPPEN;
  function kies(a){ return a[Math.floor(Math.random() * a.length)]; }
  /* een rijtje werkwoorden met hun stam, voor de voorbeelden */
  var WW = [
    { hel:'werken', stam:'werk', vt:'werkte', vd:'gewerkt' }, { hel:'fietsen', stam:'fiets', vt:'fietste', vd:'gefietst' },
    { hel:'maken', stam:'maak', vt:'maakte', vd:'gemaakt' }, { hel:'hopen', stam:'hoop', vt:'hoopte', vd:'gehoopt' },
    { hel:'wonen', stam:'woon', vt:'woonde', vd:'gewoond' }, { hel:'spelen', stam:'speel', vt:'speelde', vd:'gespeeld' },
    { hel:'leren', stam:'leer', vt:'leerde', vd:'geleerd' }, { hel:'bouwen', stam:'bouw', vt:'bouwde', vd:'gebouwd' }
  ];
  var KOF = 't k f s ch p';
  function kofschip(){ return S.formule('<span class="st-na">\'t</span> <span class="st-na">k</span>o<span class="st-na">f</span><span class="st-na">s</span><span class="st-na">ch</span>i<span class="st-na">p</span>'); }

  return [
    {
      id: 'stam', naam: 'Eerst de stam', uitleg: 'Bijna elke regel begint bij de stam van het werkwoord.',
      stappen: function(){
        var w = kies(WW);
        return [
          { kop: 'Wat is de stam?', beeld: S.formule(w.hel + ' <span class="st-zacht">→</span> ik <span class="st-na">' + w.stam + '</span>'),
            tekst: '<p>De stam vind je door het werkwoord met <b>ik</b> in de tegenwoordige tijd te zetten: ik ' + w.stam + '. Dat stuk is de stam.</p>' },
          { kop: 'Let op de klank', beeld: S.formule('lopen → ik loop &nbsp; · &nbsp; geven → ik geef &nbsp; · &nbsp; verhuizen → ik verhuis'),
            tekst: '<p>Soms verandert de stam een beetje, zodat hij hetzelfde klinkt: een dubbele klinker (loop), of een v die een f wordt (geef), of een z die een s wordt (verhuis).</p>' +
              S.bak('Een stam eindigt nooit op v of z.', 'goed') }
        ];
      }
    },
    {
      id: 'tt', naam: 'Tegenwoordige tijd: stam of stam + t', uitleg: 'Ik werk, jij werkt, hij werkt. En de valkuil bij jij.',
      stappen: [
        { kop: 'Ik: alleen de stam', beeld: S.formule('ik <span class="st-na">werk</span> &nbsp; · &nbsp; ik <span class="st-na">word</span>'),
          tekst: '<p>Bij <b>ik</b> schrijf je alleen de stam. Ook als je een t hoort: ik word, ik vind.</p>' },
        { kop: 'Jij, je, hij, zij, het: stam + t', beeld: S.formule('hij werk<span class="st-na">t</span> &nbsp; · &nbsp; hij word<span class="st-na">t</span>'),
          tekst: '<p>Bij hij, zij, het, jij en u komt er een <b>t</b> achter de stam. Eindigt de stam op d, dan krijg je dt: hij wordt, zij vindt.</p>' },
        { kop: 'Jij achter het werkwoord: geen t', beeld: S.formule('jij word<span class="st-na">t</span> &nbsp; <span class="st-zacht">maar</span> &nbsp; word jij?'),
          tekst: '<p>Staat <b>jij</b> of <b>je</b> achter het werkwoord, dan valt de t weg: word jij, loop je mee?</p>' +
            S.bak('Dat geldt alleen voor jij en je. Bij hij blijft de t: wordt hij?', 'let') },
        { kop: 'Wij, jullie, zij: het hele werkwoord', beeld: S.formule('wij werken &nbsp; · &nbsp; jullie worden'),
          tekst: '<p>In het meervoud gebruik je het hele werkwoord, net als in het woordenboek.</p>' +
            S.bak('Twijfel je over d of t? Vervang het werkwoord door lopen: hij loopt, dus hij wordt. Ik loop, dus ik word.', 'goed') }
      ]
    },
    {
      id: 'vt', naam: 'Verleden tijd: \'t kofschip', uitleg: 'Werkte of werkde? Kijk naar de laatste letter van de stam.',
      stappen: function(){
        var a = kies(WW.slice(0, 4)), b = kies(WW.slice(4));
        return [
          { kop: 'Te of de?', beeld: S.formule('hij ' + a.stam + '<span class="st-na">te</span> &nbsp; · &nbsp; hij ' + b.stam + '<span class="st-na">de</span>'),
            tekst: '<p>Bij zwakke werkwoorden komt er in de verleden tijd <b>te</b> of <b>de</b> achter de stam (in het meervoud ten of den). Welke het is, hangt af van de letter vóór -en in het hele werkwoord.</p>' },
          { kop: '\'t kofschip', beeld: kofschip(),
            tekst: '<p>Onthoud de medeklinkers uit <b>\'t kofschip</b>: ' + KOF + '.</p>' +
              '<p>Haal -en van het hele werkwoord af en kijk naar de letter die dan achteraan staat. Zit die in \'t kofschip, dan wordt het <b>te</b>. Anders <b>de</b>.</p>' },
          { kop: a.hel + ': ' + a.vt, beeld: S.formule(a.hel.slice(0, -3) + '<span class="st-na">' + a.hel.slice(-3, -2) + '</span>en <span class="st-zacht">→ in \'t kofschip →</span> ' + a.vt),
            tekst: '<p>In ' + a.hel + ' staat vóór -en een <b>' + a.hel.slice(-3, -2) + '</b>. Die zit in \'t kofschip, dus stam ' + a.stam + ' + te = ' + a.vt + '.</p>' },
          { kop: b.hel + ': ' + b.vt, beeld: S.formule(b.hel.slice(0, -3) + '<span class="st-na">' + b.hel.slice(-3, -2) + '</span>en <span class="st-zacht">→ niet in \'t kofschip →</span> ' + b.vt),
            tekst: '<p>In ' + b.hel + ' staat vóór -en een <b>' + b.hel.slice(-3, -2) + '</b>. Die zit er niet in, dus stam ' + b.stam + ' + de = ' + b.vt + '.</p>' +
              S.bak('Kijk naar het hele werkwoord, niet naar de stam: leven → ik leef, maar in leven staat een v. Dus hij leefde. En verhuizen → hij verhuisde.', 'let') }
        ];
      }
    },
    {
      id: 'vd', naam: 'Voltooid deelwoord: ge + stam + t of d', uitleg: 'Ik heb gewerkt, ik heb gewoond. Hetzelfde kofschip.',
      stappen: function(){
        var a = kies(WW.slice(0, 4)), b = kies(WW.slice(4));
        return [
          { kop: 'Na heb, heeft of ben', beeld: S.formule('ik heb <span class="st-na">' + a.vd + '</span>'),
            tekst: '<p>Het voltooid deelwoord gebruik je na een vorm van hebben, zijn of worden. Het begint meestal met <b>ge</b>.</p>' },
          { kop: 'T of d: weer het kofschip', beeld: S.formule(a.vd + ' &nbsp; · &nbsp; ' + b.vd),
            tekst: '<p>Achter de stam komt een <b>t</b> als de letter vóór -en in \'t kofschip zit, en anders een <b>d</b>. Hoor je het niet? Maak de verleden tijd: ' + a.vt + ' met een t, dus ' + a.vd + '. ' + b.vt + ' met een d, dus ' + b.vd + '.</p>' },
          { kop: 'Stam eindigt al op t of d', beeld: S.formule('gezet &nbsp; · &nbsp; gebrand &nbsp; · &nbsp; <s>gezett</s>'),
            tekst: '<p>Eindigt de stam al op een t of d, dan komt er niets meer bij: zetten → gezet, branden → gebrand.</p>' +
              S.bak('Een voltooid deelwoord eindigt nooit op dt.', 'let') }
        ];
      }
    },
    {
      id: 'val', naam: 'De d-of-t-val', uitleg: 'Gebeurt of gebeurd: dezelfde klank, twee vormen.',
      stappen: [
        { kop: 'Twee woorden die hetzelfde klinken', beeld: S.formule('het gebeur<span class="st-na">t</span> &nbsp; · &nbsp; het is gebeur<span class="st-na">d</span>'),
          tekst: '<p>Sommige werkwoorden klinken in de tegenwoordige tijd en als voltooid deelwoord precies hetzelfde. Dan moet je nadenken welke vorm er staat.</p>' },
        { kop: 'Is er een hulpwerkwoord?', beeld: S.formule('het <span class="st-na">is</span> gebeurd'),
          tekst: '<p>Staat er een vorm van <b>hebben, zijn of worden</b> bij, dan is het meestal een voltooid deelwoord: gebeurd, met een d (gebeurde).</p>' },
        { kop: 'Vervang door een sterk werkwoord', beeld: S.formule('het gebeurt → het <span class="st-na">valt</span> &nbsp; · &nbsp; het is gebeurd → het is <span class="st-na">gevallen</span>'),
          tekst: '<p>Twijfel je nog? Zet er een werkwoord als vallen of lopen in. Hoor je "valt", dan is het de tegenwoordige tijd (t). Hoor je "gevallen", dan het voltooid deelwoord.</p>' +
            S.bak('Deze truc werkt bij bijna elke twijfel: vervang het werkwoord door lopen of vallen.', 'goed') }
      ]
    }
  ];
});
