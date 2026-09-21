/* ============================================================================
   WAPENS. De wapenkast van De stad, en de winkel erbij.

   Hoe het in elkaar zit. Iedereen begint met het roestige pistool; dat is met
   opzet een slecht wapen, want daarmee ga je op zoek naar iets beters. In de
   stad liggen wapens in kisten, en die ben je kwijt zodra je neergaat: dat
   hoort zo, dat is waar de spanning zit.

   Wat je koopt is iets anders. Met de munten die je in de oefenspellen
   verdient koop je een wapen dat van jou blijft, en dat kies je voor je de
   stad in gaat. Een gekocht wapen raak je niet kwijt als je neergaat; alleen
   wat je gevonden hebt. Kopen kan alleen wie een speelcode of een account
   heeft, want anders is er niets om het in te bewaren.

   Een uitrusting is een hoofdwapen en een zijwapen. Het zijwapen is altijd
   iets lichts: als je hoofdwapen leeg is pak je dat, en anders je vuisten.

   De tabel hieronder is de enige plek waar een wapen beschreven staat. De
   motor van het spel leest hem, de winkel leest hem, en de server leest hem
   ook: die rekent de prijs af en weigert een uitrusting met een wapen dat je
   niet hebt. Zou de prijs alleen in de browser staan, dan was hij gratis.

   tempo is schoten per seconde, spreid in graden, bereik in beeldpunten.

   Dit bestand werkt in de browser (window.WAPENS) en op de server (import).
   ============================================================================ */
(function(g){
  var LIJST = [
    /* ---- wat je altijd hebt ---- */
    { id:'vuist', naam:'Blote handen', prijs:0, altijd:true, licht:true,
      schade:11, tempo:2.2, bereik:34, spreid:0, korrels:1, mag:0, kogelsnel:0, nabij:true,
      uit:'als alles op is. Het werkt, maar je wilt het niet.' },
    { id:'roestig', naam:'Roestig pistool', prijs:0, altijd:true, licht:true,
      schade:12, tempo:2.5, bereik:300, spreid:9, korrels:1, mag:1, kogelsnel:760,
      uit:'waar iedereen mee begint. Een kogel per keer en hij schiet scheef.' },

    /* ---- het zijwapen: klein, snel te trekken ---- */
    { id:'pistool', naam:'Pistool', prijs:350, licht:true,
      schade:19, tempo:3.4, bereik:430, spreid:4, korrels:1, mag:12, kogelsnel:880,
      uit:'twaalf kogels, recht vooruit. De eerste stap omhoog.' },
    { id:'revolver', naam:'Revolver', prijs:800, licht:true,
      schade:34, tempo:1.7, bereik:520, spreid:3, korrels:1, mag:6, kogelsnel:980,
      uit:'zes zware kogels. Raak je, dan telt het.' },

    /* ---- het hoofdwapen ---- */
    { id:'hagel', naam:'Hagelgeweer', prijs:700,
      schade:11, tempo:1.1, bereik:230, spreid:15, korrels:6, mag:6, kogelsnel:760,
      uit:'zes korrels tegelijk. Dichtbij veegt hij een portiek leeg, verder weg doet hij niets.' },
    { id:'mp', naam:'Machinepistool', prijs:1100,
      schade:11, tempo:10.5, bereik:360, spreid:11, korrels:1, mag:34, kogelsnel:820,
      uit:'heel snel en heel onnauwkeurig. Voor een straat vol.' },
    { id:'karabijn', naam:'Karabijn', prijs:1500,
      schade:15, tempo:7.5, bereik:560, spreid:7, korrels:1, mag:30, kogelsnel:1040,
      uit:'dertig kogels, goed op elke afstand. Het wapen waar je op uitkomt.' },
    { id:'scherp', naam:'Scherpschutter', prijs:2400,
      schade:62, tempo:0.85, bereik:820, spreid:1, korrels:1, mag:5, kogelsnel:1500,
      uit:'over de hele avenue, maar je hebt maar vijf kogels en hij laadt traag.' }
  ];

  /* Waar je mee begint als je niets gekocht hebt, en waar je op terugvalt als
     een uitrusting iets noemt wat er niet is. */
  var STANDAARD = { hoofd: 'roestig', zij: 'vuist' };
  /* hoeveel kogels je meekrijgt bij een gekocht wapen */
  var KOGELS_MEE = 34;

  function vind(id){ for (var i = 0; i < LIJST.length; i++) if (LIJST[i].id === id) return LIJST[i]; return null; }
  function teKoop(){ return LIJST.filter(function(w){ return w.prijs > 0; }); }
  /* heb je dit wapen? wat altijd mag hoeft niet in bezit te staan */
  function heeft(id, bezit){
    var w = vind(id);
    if (!w) return false;
    return !!(w.altijd || (bezit && bezit[id]));
  }
  /* Een uitrusting die klopt: allebei bestaande wapens, allebei in bezit, en
     het zijwapen moet licht zijn. Alles wat niet klopt valt terug op de
     standaard in plaats van te weigeren, zodat een oude uitrusting na een
     wijziging nooit iemand buitensluit. */
  function schoon(uit, bezit){
    uit = uit && typeof uit === 'object' ? uit : {};
    var h = String(uit.hoofd || '').slice(0, 12), z = String(uit.zij || '').slice(0, 12);
    if (!heeft(h, bezit)) h = STANDAARD.hoofd;
    var zw = vind(z);
    if (!zw || !zw.licht || !heeft(z, bezit)) z = STANDAARD.zij;
    return { hoofd: h, zij: z };
  }

  g.WAPENS = { LIJST:LIJST, STANDAARD:STANDAARD, KOGELS_MEE:KOGELS_MEE,
               vind:vind, teKoop:teKoop, heeft:heeft, schoon:schoon };
})(typeof globalThis !== 'undefined' ? globalThis : this);
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.WAPENS;
