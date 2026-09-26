/* De gegevens van Kruisingsschema (kruisen.html): de eigenschappen en de
   begrippen. kruisen.html maakt er opgaven van; bank-spellen.js maakt er
   vragen van voor de vragenbank.

   EIG: een letter, het dominante en het recessieve fenotype (voluit en kort),
   de soort (mens, dier of plant), een emoji voor het organisme en per
   fenotype een kleur voor het bolletje in het label. Bij eigenschappen die
   geen kleur zijn (vorm, lengte, hoorns) is kleuren null. De letters zijn zo
   gekozen dat hoofdletter en kleine letter goed te onderscheiden zijn; alleen
   zwart houdt de Z uit het lesboek.
   BEGRIPPEN: b = het begrip, u = de uitleg, vb(e) = een voorbeeld bij
   eigenschap e, hoog = niet op vmbo-bb. */
window.KRUISEN_DATA = {
  EIG: [
    { id:'oog', naam:'oogkleur', letter:'B', dom:'bruine ogen', rec:'blauwe ogen', kort:{ dom:'bruin', rec:'blauw' }, wie:'mens', emoji:'👁️', kleuren:{ dom:'#6b3f1d', rec:'#3b7dd8' } },
    { id:'bloem', naam:'bloemkleur', letter:'R', dom:'rode bloemen', rec:'witte bloemen', kort:{ dom:'rood', rec:'wit' }, wie:'plant', emoji:'🌸', kleuren:{ dom:'#e0402f', rec:'#f7f3ea' } },
    { id:'erwt', naam:'erwtvorm', letter:'R', dom:'ronde erwten', rec:'gerimpelde erwten', kort:{ dom:'rond', rec:'gerimpeld' }, wie:'plant', emoji:'🫛', kleuren:null },
    { id:'zaad', naam:'erwtkleur', letter:'G', dom:'gele erwten', rec:'groene erwten', kort:{ dom:'geel', rec:'groen' }, wie:'plant', emoji:'🌱', kleuren:{ dom:'#e8c93a', rec:'#5aa64a' } },
    { id:'stengel', naam:'stengellengte bij erwtenplanten', letter:'L', dom:'lange stengel', rec:'korte stengel', kort:{ dom:'lang', rec:'kort' }, wie:'plant', emoji:'🌿', kleuren:null },
    { id:'vacht', naam:'vachtkleur bij cavia’s', letter:'Z', dom:'zwarte vacht', rec:'witte vacht', kort:{ dom:'zwart', rec:'wit' }, wie:'dier', emoji:'🐹', kleuren:{ dom:'#2b2b2b', rec:'#f2ede4' } },
    { id:'konijn', naam:'vachtkleur bij konijnen', letter:'G', dom:'grijze vacht', rec:'witte vacht (albino)', kort:{ dom:'grijs', rec:'wit' }, wie:'dier', emoji:'🐇', kleuren:{ dom:'#8f8f8f', rec:'#f5f2ea' } },
    { id:'hond', naam:'vachtkleur bij labradors', letter:'Z', dom:'zwarte vacht', rec:'bruine vacht', kort:{ dom:'zwart', rec:'bruin' }, wie:'dier', emoji:'🐕', kleuren:{ dom:'#2b2b2b', rec:'#7b4a26' } },
    { id:'muis', naam:'vachtkleur bij muizen', letter:'Z', dom:'zwarte vacht', rec:'bruine vacht', kort:{ dom:'zwart', rec:'bruin' }, wie:'dier', emoji:'🐁', kleuren:{ dom:'#2b2b2b', rec:'#8a5a2b' } },
    { id:'kat', naam:'haarlengte bij katten', letter:'K', dom:'korte haren', rec:'lange haren', kort:{ dom:'kort', rec:'lang' }, wie:'dier', emoji:'🐈', kleuren:null },
    { id:'koe', naam:'hoorns bij koeien', letter:'H', dom:'geen hoorns', rec:'hoorns', kort:{ dom:'geen hoorns', rec:'hoorns' }, wie:'dier', emoji:'🐄', kleuren:null }
  ],
  BEGRIPPEN: [
    { b:'dominant', u:'een eigenschap die je al ziet als je er een allel van hebt', vb:function(e){ return e.dom + ' bij ' + e.letter + e.letter.toLowerCase(); } },
    { b:'recessief', u:'een eigenschap die je alleen ziet als je er twee allelen van hebt', vb:function(e){ return e.rec + ' alleen bij ' + e.letter.toLowerCase() + e.letter.toLowerCase(); } },
    { b:'homozygoot', u:'twee dezelfde allelen voor een eigenschap', vb:function(e){ return e.letter + e.letter + ' of ' + e.letter.toLowerCase() + e.letter.toLowerCase(); } },
    { b:'heterozygoot', u:'twee verschillende allelen voor een eigenschap', vb:function(e){ return e.letter + e.letter.toLowerCase(); } },
    { b:'genotype', u:'de letters: welke allelen iemand heeft', vb:function(e){ return e.letter + e.letter.toLowerCase(); } },
    { b:'fenotype', u:'wat je van buiten ziet: de eigenschap zelf', vb:function(e){ return e.dom; } },
    { b:'allel', u:'een van de vormen van een gen', vb:function(e){ return e.letter + ' en ' + e.letter.toLowerCase(); } },
    { b:'drager', u:'iemand met een recessief allel dat je niet ziet', vb:function(e){ return e.letter + e.letter.toLowerCase() + ': ' + e.dom + ', maar draagt ' + e.letter.toLowerCase(); } },
    { b:'gen', u:'een stukje DNA met de informatie voor één eigenschap', vb:function(e){ return 'het stukje DNA dat de ' + e.naam + ' bepaalt'; } },
    { b:'chromosoom', u:'een opgerolde draad DNA in de celkern, met daarop veel genen', vb:function(){ return 'een mens heeft er 46 in elke lichaamscel, in 23 paren'; } },
    { b:'DNA', u:'de stof in de celkern waarin alle erfelijke informatie is vastgelegd', vb:function(){ return 'de lange, gedraaide dubbele spiraal in elke celkern'; } },
    { b:'geslachtschromosomen', u:'het chromosomenpaar dat bepaalt of je een jongen of een meisje wordt', vb:function(){ return 'XX bij een meisje, XY bij een jongen'; } },
    { b:'mutatie', u:'een plotselinge verandering in het DNA', vb:function(){ return 'door straling verandert een stukje DNA en ontstaat er een nieuw allel'; } },
    { b:'geslachtscel', u:'een zaadcel of eicel: die heeft van elk chromosomenpaar maar één chromosoom', vb:function(e){ return 'ouder ' + e.letter + e.letter.toLowerCase() + ' maakt cellen met óf ' + e.letter + ' óf ' + e.letter.toLowerCase(); } },
    { b:'bevruchting', u:'een zaadcel en een eicel smelten samen tot één cel', vb:function(){ return 'één allel van de vader en één van de moeder komen samen in de eerste cel van het kind'; } },
    { b:'F1', u:'de eerste generatie nakomelingen van een kruising', vb:function(e){ var A = e.letter, a = A.toLowerCase(); return 'de nakomelingen van ' + A + A + ' × ' + a + a; } },
    { b:'F2', u:'de tweede generatie: de nakomelingen van de F1 onderling', vb:function(e){ var A = e.letter, a = A.toLowerCase(); return 'de nakomelingen van twee F1-ouders ' + A + a + ' × ' + A + a + ', in de verhouding 3 : 1'; } },
    { b:'kruisbestuiving', u:'stuifmeel van de ene plant komt op de stamper van een andere plant', vb:function(){ return 'een bij brengt stuifmeel van een rode bloem naar een witte bloem op een andere plant'; } },
    { b:'zelfbestuiving', u:'stuifmeel komt op de stamper van dezelfde bloem', vb:function(){ return 'een erwtenbloem bestuift zichzelf, al voordat de bloem opengaat'; } },
    { b:'intermediair', u:'geen van beide allelen is dominant, dus de heterozygoot heeft een tussenvorm', vb:function(){ return 'rode × witte leeuwenbekjes geven roze bloemen'; }, hoog:true }
  ]
};
