/* ============================================================================
   COSMETICA. De winkel voor wie is ingelogd: met de munten die je in de
   oefenspellen verdient koop je een hoed, een rand om je gezichtje of een
   ander zwaard of een andere boog voor Zwaardvechter. Alleen voor de sier: niets hiervan maakt
   een spel makkelijker.

   Een gekocht ding zit in je avatar-spec: v1k2o3m4e5 krijgt er h2 (hoed 2),
   r1 (rand 1), z3 (zwaard 3), f2 (figuur 2) of p1 (pijlboog 1) achter. avatar.js tekent hoed en rand,
   zwaard.html tekent het zwaard en de boog (met COSMETICA.boog en COSMETICA.pijl hieronder). De server (server/profiel.js) kent deze
   lijst ook: hij rekent de prijs af en haalt uit je spec wat je niet bezit.

   Dit bestand werkt in de browser (window.COSMETICA) en op de server (import).
   ============================================================================ */
(function(g){
  var ITEMS = [
    /* hoeden: h1 tot h8 */
    { id:'h1', soort:'h', n:1, naam:'Kroon',          prijs:900, uit:'voor wie het klassement aanvoert' },
    { id:'h2', soort:'h', n:2, naam:'Tovenaarshoed',  prijs:500,  uit:'paars, met sterren' },
    { id:'h3', soort:'h', n:3, naam:'Zweetband',      prijs:600, uit:'wit met rood en blauw, klaar voor de sprint' },
    { id:'h4', soort:'h', n:4, naam:'Piratenhoed',    prijs:600, uit:'met doodshoofd' },
    { id:'h5', soort:'h', n:5, naam:'Hoorntjes',      prijs:400,  uit:'een beetje ondeugend' },
    { id:'h6', soort:'h', n:6, naam:'Halo',           prijs:1200, uit:'een engel, zogenaamd' },
    { id:'h7', soort:'h', n:7, naam:'Bloemenkrans',   prijs:350,  uit:'lente op je hoofd' },
    { id:'h8', soort:'h', n:8, naam:'Feestmuts',      prijs:250,  uit:'altijd jarig' },
    /* seizoenshoeden: alleen te koop in hun seizoen (maand/dag van, maand/dag tot); wie hem heeft mag hem altijd op */
    { id:'h9',  soort:'h', n:9,  naam:'Kerstmuts',    prijs:400, uit:'alleen in december te koop', seizoen:[12, 1, 12, 31] },
    { id:'h10', soort:'h', n:10, naam:'Pompoenhoed',  prijs:400, uit:'alleen in oktober te koop', seizoen:[10, 1, 10, 31] },
    { id:'h11', soort:'h', n:11, naam:'Hazenoren',    prijs:400, uit:'alleen rond Pasen te koop (half maart tot eind april)', seizoen:[3, 15, 4, 30] },
    /* alleen voor wie bij de eigenaar van de site in de klas zat: niet te koop */
    { id:'h12', soort:'h', n:12, naam:'Baret',          prijs:0, oud:true, uit:'omdat je bij meneer Greidanus in de klas zat' },
    /* nieuwe hoeden: h15 tot h19 altijd te koop, h20 en h21 in hun seizoen */
    { id:'h15', soort:'h', n:15, naam:'Pet achterstevoren', prijs:350, uit:'de klep naar achteren, natuurlijk' },
    { id:'h16', soort:'h', n:16, naam:'Beanie',         prijs:300, uit:'gebreid, met een pompon' },
    { id:'h17', soort:'h', n:17, naam:'Koptelefoon',    prijs:550, uit:'muziek aan, wereld uit' },
    { id:'h18', soort:'h', n:18, naam:'Vissershoedje',  prijs:400, uit:'zacht en een beetje sloom' },
    { id:'h19', soort:'h', n:19, naam:'Cowboyhoed',     prijs:500, uit:'yeehaw' },
    { id:'h20', soort:'h', n:20, naam:'Oranje kroon',   prijs:300, uit:'alleen rond Koningsdag te koop (20 tot en met 30 april)', seizoen:[4, 20, 4, 30] },
    { id:'h21', soort:'h', n:21, naam:'Strohoed',       prijs:400, uit:'alleen in de zomer te koop (half juni tot eind augustus)', seizoen:[6, 15, 8, 31] },
    /* figuren: f1 tot f6, vast aan je hoofd; ze draaien mee als je gezichtje een kant op kijkt */
    { id:'f1', soort:'f', n:1, naam:'Oortjes',        prijs:500,  uit:'twee ronde oortjes, als een beertje' },
    { id:'f2', soort:'f', n:2, naam:'Bloem',          prijs:700,  uit:'een krans van blaadjes om je hoofd' },
    { id:'f3', soort:'f', n:3, naam:'Wolkje',         prijs:700,  uit:'zacht en bol, als een wolk' },
    { id:'f4', soort:'f', n:4, naam:'Voelsprieten',   prijs:600,  uit:'twee sprieten met een bolletje' },
    { id:'f5', soort:'f', n:5, naam:'Knotje',         prijs:400,  uit:'een knot boven op je hoofd' },
    { id:'f6', soort:'f', n:6, naam:'Kattenoren',     prijs:600,  uit:'spits, met roze binnenkant' },
    /* achtergronden: a1 tot a3, een schijf achter het gezichtje */
    { id:'a1', soort:'a', n:1, naam:'Zonsopgang',     prijs:800,  uit:'oranje en geel achter je' },
    { id:'a2', soort:'a', n:2, naam:'Oceaan',         prijs:800,  uit:'diep blauw achter je' },
    { id:'a3', soort:'a', n:3, naam:'Sterrennacht',   prijs:1400, uit:'paars met sterren' },
    { id:'a5', soort:'a', n:5, naam:'Ruitjespapier',  prijs:600,  uit:'zoals in je wiskundeschrift' },
    { id:'a6', soort:'a', n:6, naam:'Confetti',       prijs:900,  uit:'altijd feest' },
    { id:'a7', soort:'a', n:7, naam:'Sneeuw',         prijs:700,  uit:'alleen in de winter te koop (december tot en met februari)', seizoen:[12, 1, 2, 29] },
    /* brillen: q1 tot q3 */
    { id:'q1', soort:'q', n:1, naam:'Zonnebril',      prijs:450,  uit:'cool, altijd' },
    { id:'q2', soort:'q', n:2, naam:'Monocle',        prijs:900,  uit:'deftig, met kettinkje' },
    { id:'q3', soort:'q', n:3, naam:'Ronde bril',     prijs:500,  uit:'voor wie veel leest' },
    { id:'q5', soort:'q', n:5, naam:'Vierkante bril', prijs:400,  uit:'een dik zwart montuur' },
    { id:'q6', soort:'q', n:6, naam:'Hartjesbril',    prijs:450,  uit:'alles ziet er lief uit' },
    { id:'q7', soort:'q', n:7, naam:'Sterrenbril',    prijs:500,  uit:'voor een feestje' },
    { id:'q8', soort:'q', n:8, naam:'Skibril',        prijs:600,  uit:'klaar voor de piste' },
    /* randen: r1 tot r5 */
    { id:'r1', soort:'r', n:1, naam:'Gouden ring',    prijs:700, uit:'een rand van goud' },
    { id:'r2', soort:'r', n:2, naam:'Vuurring',       prijs:900, uit:'oranje vlammen' },
    { id:'r3', soort:'r', n:3, naam:'Regenboog',      prijs:1600, uit:'alle kleuren' },
    { id:'r4', soort:'r', n:4, naam:'IJsring',        prijs:900, uit:'koud blauw' },
    { id:'r5', soort:'r', n:5, naam:'Sterrenkrans',   prijs:1200, uit:'sterren eromheen' },
    { id:'r6', soort:'r', n:6, naam:'Krijtcirkel',    prijs:0, oud:true, uit:'omdat je bij meneer Greidanus in de klas zat' },
    { id:'r9',  soort:'r', n:9,  naam:'Neonring',     prijs:1000, uit:'roze en lichtblauw, als een lichtreclame' },
    { id:'r10', soort:'r', n:10, naam:'Pixelrand',    prijs:1100, uit:'blokjes, zoals in een oud spelletje' },
    /* zwaarden voor Zwaardvechter: z1 tot z5 */
    { id:'z1', soort:'z', n:1, naam:'Vlammend zwaard', prijs:1000, uit:'een oranje kling die gloeit' },
    { id:'z2', soort:'z', n:2, naam:'IJszwaard',       prijs:1000, uit:'lichtblauw en koud' },
    { id:'z3', soort:'z', n:3, naam:'Gouden zwaard',   prijs:1500, uit:'van puur goud' },
    { id:'z4', soort:'z', n:4, naam:'Lichtzwaard',     prijs:2200, uit:'groen licht, zoemt niet' },
    { id:'z5', soort:'z', n:5, naam:'Houten oefenzwaard', prijs:200, uit:'doet net zo veel pijn, eerlijk waar' },
    { id:'z6', soort:'z', n:6, naam:'Krijtje',            prijs:0, oud:true, uit:'omdat je bij meneer Greidanus in de klas zat' },
    /* bogen voor Zwaardvechter: p1 tot p6, met pijlen die erbij horen */
    { id:'p1', soort:'p', n:1, naam:'Elfenboog',   prijs:900,  uit:'groen hout, gouden punten en veren als blaadjes' },
    { id:'p2', soort:'p', n:2, naam:'IJsboog',     prijs:1100, uit:'lichtblauw en koud, de pijlen laten een spoor van ijs' },
    { id:'p3', soort:'p', n:3, naam:'Gouden boog', prijs:1500, uit:'van puur goud, met witte veren' },
    { id:'p4', soort:'p', n:4, naam:'Vuurboog',    prijs:1800, uit:'gloeit oranje, de pijlen trekken een vuurstreep' },
    { id:'p5', soort:'p', n:5, naam:'Sterrenboog', prijs:2200, uit:'nachtblauw met sterretjes, en paars licht' },
    { id:'p6', soort:'p', n:6, naam:'Takkenboog',  prijs:250,  uit:'een tak met een touwtje, en veren van papier' },
    /* trofeeën: niet te koop, je speelt ze vrij door een baas in Zwaardvechter te verslaan */
    { id:'b1', soort:'b', n:1, naam:'Sterrenkroon van De Grote Fout', prijs:0, baas:'fout',  uit:'versla De Grote Fout in Zwaardvechter' },
    { id:'b2', soort:'b', n:2, naam:'Inktspat van De Inktvlek',      prijs:0, baas:'inkt',  uit:'versla De Inktvlek in Zwaardvechter' },
    { id:'b3', soort:'b', n:3, naam:'Pen van De Rode Pen',           prijs:0, baas:'pen',   uit:'versla De Rode Pen in Zwaardvechter' },
    { id:'b4', soort:'b', n:4, naam:'Propje van De Prop',            prijs:0, baas:'prop',  uit:'versla De Prop in Zwaardvechter' },
    { id:'b5', soort:'b', n:5, naam:'Wijzerplaat van De Klok',       prijs:0, baas:'klok',  uit:'versla De Klok in Zwaardvechter' },
    { id:'b6', soort:'b', n:6, naam:'Zwermpje van De Zwerm',         prijs:0, baas:'zwerm', uit:'versla De Zwerm in Zwaardvechter' },
    /* De nachtmerrie: alleen tegen een baas, met alles gekocht, en hij is veel
       taaier. Elke baas geeft een ander soort ding, zodat het opvalt dat je het
       gehaald hebt. baas:'nm-...' zorgt dat de winkel ze weigert en het
       vrijspelen ze wel doorlaat; er hoefde daardoor niets aan de server te
       veranderen. */
    { id:'h13', soort:'h', n:13, naam:'Nachtmerriekroon',   prijs:0, baas:'nm-fout',  uit:'versla De Grote Fout in de nachtmerrie' },
    { id:'q4',  soort:'q', n:4,  naam:'Inktbril',           prijs:0, baas:'nm-inkt',  uit:'versla De Inktvlek in de nachtmerrie' },
    { id:'r7',  soort:'r', n:7,  naam:'Rode streep',        prijs:0, baas:'nm-pen',   uit:'versla De Rode Pen in de nachtmerrie' },
    { id:'h14', soort:'h', n:14, naam:'Propkroon',          prijs:0, baas:'nm-prop',  uit:'versla De Prop in de nachtmerrie' },
    { id:'a4',  soort:'a', n:4,  naam:'Middernacht',        prijs:0, baas:'nm-klok',  uit:'versla De Klok in de nachtmerrie' },
    { id:'r8',  soort:'r', n:8,  naam:'Zwermring',          prijs:0, baas:'nm-zwerm', uit:'versla De Zwerm in de nachtmerrie' },
    /* Te verdienen door dagen op rij te oefenen (spel.js kijkt na elk potje).
       Ze lopen via hetzelfde spoor als de trofeeën van een baas (baas:'reeks-..'),
       zodat de server ze doorlaat als vrijgespeeld en weigert in de winkel;
       verdien is wat de winkel eronder zet. */
    { id:'b7',  soort:'b', n:7,  naam:'Vlammetje',          prijs:0, baas:'reeks-5',  verdien:'5 dagen op rij', uit:'oefen vijf dagen op rij' },
    { id:'r11', soort:'r', n:11, naam:'Lauwerkrans',        prijs:0, baas:'reeks-14', verdien:'14 dagen op rij', uit:'oefen veertien dagen op rij' }
  ];
  var SOORTEN = { h:'Hoeden', f:'Figuren', q:'Brillen', a:'Achtergronden', r:'Randen', z:'Zwaarden', p:'Bogen', b:'Trofeeën' };
  /* is dit item nu te koop? Zonder seizoen altijd; met seizoen alleen tussen die dagen (jaar loopt gewoon door) */
  function inSeizoen(it, nu){
    if (!it || !it.seizoen) return true;
    var d = nu || new Date(), m = d.getMonth() + 1, dag = d.getDate(), s = it.seizoen;
    var na = m > s[0] || (m === s[0] && dag >= s[1]), voor = m < s[2] || (m === s[2] && dag <= s[3]);
    return s[0] <= s[2] ? (na && voor) : (na || voor);
  }
  function vanBaas(baasId){ for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].baas === baasId) return ITEMS[i]; return null; }
  /* wat je wint als je deze baas in de nachtmerrie verslaat */
  function vanNachtmerrie(baasId){ return vanBaas('nm-' + baasId); }
  function vind(id){ for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i]; return null; }
  /* de spec uit elkaar: het gezichtje en wat erop en eromheen zit. Het gezichtje (basis) is wat
     iedereen gratis kiest: vorm, kleur, ogen, mond, extra, en sinds kort ook c (tweede rij kleuren),
     x en w (haar, niet meer in gebruik maar nog geldig). Oude specs zonder die drie blijven gewoon geldig. */
  function ontleed(spec){
    var m = /^(v\d{1,2}k\do\d{1,2}m\de\d(?:c\d{1,2})?(?:x\d{1,2})?(?:w\d)?)(?:h(\d{1,2}))?(?:r(\d{1,2}))?(?:z(\d{1,2}))?(?:b(\d{1,2}))?(?:a(\d{1,2}))?(?:q(\d{1,2}))?(?:f(\d))?(?:p(\d{1,2}))?$/.exec(String(spec || ''));
    return m ? { basis:m[1], h:+(m[2] || 0), r:+(m[3] || 0), z:+(m[4] || 0), b:+(m[5] || 0), a:+(m[6] || 0), q:+(m[7] || 0), f:+(m[8] || 0), p:+(m[9] || 0) } : null;
  }
  function bouw(o){ return o.basis + (o.h ? 'h' + o.h : '') + (o.r ? 'r' + o.r : '') + (o.z ? 'z' + o.z : '') + (o.b ? 'b' + o.b : '') + (o.a ? 'a' + o.a : '') + (o.q ? 'q' + o.q : '') + (o.f ? 'f' + o.f : '') + (o.p ? 'p' + o.p : ''); }
  /* haal uit een spec wat niet in het bezit zit */
  function toegestaan(spec, bezit){
    var o = ontleed(spec); if (!o) return '';
    bezit = bezit || {};
    if (o.h && !bezit['h' + o.h]) o.h = 0;
    if (o.r && !bezit['r' + o.r]) o.r = 0;
    if (o.z && !bezit['z' + o.z]) o.z = 0;
    if (o.b && !bezit['b' + o.b]) o.b = 0;
    if (o.a && !bezit['a' + o.a]) o.a = 0;
    if (o.q && !bezit['q' + o.q]) o.q = 0;
    if (o.f && !bezit['f' + o.f]) o.f = 0;
    if (o.p && !bezit['p' + o.p]) o.p = 0;
    return bouw(o);
  }
  /* De bogen. Per boog de kleuren van het hout (met een donkere rand en een lichte glans), de greep, de
     punten van de boog, de pees, en van de pijl: schacht, punt en veren. gloed geeft een waas eromheen en
     een gekleurd spoor achter de pijl. 0 is de boog waar iedereen mee begint. */
  var BOGEN = [
    { hout:'#9a6b3c', rand:'#4a3320', glans:'#d6a66a', greep:'#3b4759', tip:'#c9971f', pees:'#f3efe9', schacht:'#b08a5a', punt:'#dfe6ee', veer:'#F26749' },
    { hout:'#5fa35a', rand:'#1f4a2c', glans:'#b7e39a', greep:'#8a6a3f', tip:'#FFD166', pees:'#e8f3d8', schacht:'#c7a46b', punt:'#FFD166', veer:'#2fbf71', blad:true },
    { hout:'#9fd3ff', rand:'#2d5b8a', glans:'#ffffff', greep:'#204ECF', tip:'#e6f6ff', pees:'#e6f6ff', schacht:'#cfe9ff', punt:'#e6f6ff', veer:'#83A5F2', gloed:'#83A5F2' },
    { hout:'#FFD166', rand:'#8a5a0f', glans:'#fff3c4', greep:'#c0442c', tip:'#fff3c4', pees:'#fff8e0', schacht:'#e0b64a', punt:'#FFD166', veer:'#FBF6F1' },
    { hout:'#F26749', rand:'#7a2414', glans:'#FFD166', greep:'#14224C', tip:'#FFD166', pees:'#FFD166', schacht:'#EA9836', punt:'#FFD166', veer:'#c0442c', gloed:'#EA9836' },
    { hout:'#3a3f8f', rand:'#14224C', glans:'#c489c0', greep:'#9A55B8', tip:'#ffffff', pees:'#e6dcff', schacht:'#6b5fb0', punt:'#ffffff', veer:'#9A55B8', gloed:'#9A55B8', sterren:true },
    { hout:'#8a7a55', rand:'#4a3f28', glans:'#b8a77a', greep:'#d9c7a0', tip:'#6b5a3a', pees:'#d9cdb5', schacht:'#9a8a60', punt:'#9aa3ad', veer:'#f3efe9', knoest:true }
  ];
  function bs(n){ return BOGEN[n] || BOGEN[0]; }
  function r1(v){ return Math.round(v * 10) / 10; }
  /* De pijl, liggend langs de x-as: de inkeping op x0, de punt op x0 + len. */
  function pijl(n, x0, len){
    var b = bs(n), p = x0 + len;
    return '<path d="M' + r1(x0 + 1) + ',0 L' + r1(p - 6) + ',0" stroke="' + b.rand + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M' + r1(x0 + 1) + ',0 L' + r1(p - 6) + ',0" stroke="' + b.schacht + '" stroke-width="1.7" stroke-linecap="round"/>' +
      /* de veren: twee schuine vlakjes achteraan */
      '<path d="M' + r1(x0 + 1.5) + ',-0.6 L' + r1(x0) + ',-4.4 L' + r1(x0 + 8.5) + ',-1.3 L' + r1(x0 + 9.5) + ',-0.6 Z M' + r1(x0 + 1.5) + ',0.6 L' + r1(x0) + ',4.4 L' + r1(x0 + 8.5) + ',1.3 L' + r1(x0 + 9.5) + ',0.6 Z" fill="' + b.veer + '" stroke="' + b.rand + '" stroke-width=".7" stroke-linejoin="round"/>' +
      /* de punt: een pijlpunt met een weerhaak */
      '<path d="M' + r1(p) + ',0 L' + r1(p - 7.5) + ',-3.4 L' + r1(p - 5.8) + ',0 L' + r1(p - 7.5) + ',3.4 Z" fill="' + b.punt + '" stroke="' + b.rand + '" stroke-width=".8" stroke-linejoin="round"/>';
  }
  /* Het spoor achter een vliegende pijl: een streepje dat wegvaagt, in de gloed van de boog. */
  function spoor(n, x0, lang){
    var b = bs(n);
    return b.gloed ? '<path d="M' + r1(x0 - lang) + ',0 L' + r1(x0 + 2) + ',0" stroke="' + b.gloed + '" stroke-width="5" stroke-linecap="round" opacity=".35"/>' +
                     '<path d="M' + r1(x0 - lang * 0.6) + ',0 L' + r1(x0 + 2) + ',0" stroke="' + b.pees + '" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>'
                   : '<path d="M' + r1(x0 - lang * 0.7) + ',0 L' + r1(x0) + ',0" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".45"/>';
  }
  /* De boog, met de greep op (bx, 0) en de pijlrichting langs +x. Een recurve: de armen buigen naar
     achteren en de punten krullen weer naar voren. trek is hoe ver de pees naar achteren staat (0 tot 10);
     metPijl legt er een pijl op. */
  function boog(n, bx, trek, metPijl){
    var b = bs(n), px = bx + 0.4, py = 15.6;   /* waar de pees aan de boog vastzit */
    var arm = 'M' + r1(bx + 3.2) + ',-19 C' + r1(bx - 1.2) + ',-16.5 ' + r1(bx - 0.4) + ',-11 ' + r1(bx + 3.4) + ',-6.5 C' + r1(bx + 6.6) + ',-2.6 ' + r1(bx + 6.6) + ',2.6 ' + r1(bx + 3.4) + ',6.5 C' +
              r1(bx - 0.4) + ',11 ' + r1(bx - 1.2) + ',16.5 ' + r1(bx + 3.2) + ',19';
    var s = '';
    if (b.gloed) s += '<path d="' + arm + '" fill="none" stroke="' + b.gloed + '" stroke-width="9" stroke-linecap="round" opacity=".3"/>';
    var tx = px - (trek || 0);
    var pees = 'M' + r1(px) + ',' + (-py) + ' L' + r1(tx) + ',0 L' + r1(px) + ',' + py;
    /* de pees met een donker randje, anders valt een lichte pees weg op een lichte vloer */
    s += '<path d="' + pees + '" fill="none" stroke="' + b.rand + '" stroke-width="2.3" stroke-linejoin="round" opacity=".55"/>' +
      '<path d="' + pees + '" fill="none" stroke="' + b.pees + '" stroke-width="1.2" stroke-linejoin="round"/>';
    if (metPijl) s += pijl(n, tx, 31);
    s += '<path d="' + arm + '" fill="none" stroke="' + b.rand + '" stroke-width="5.4" stroke-linecap="round"/>' +
      '<path d="' + arm + '" fill="none" stroke="' + b.hout + '" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M' + r1(bx + 1.2) + ',-13 C' + r1(bx + 1.8) + ',-9.5 ' + r1(bx + 3.6) + ',-7.4 ' + r1(bx + 4.8) + ',-5.2" fill="none" stroke="' + b.glans + '" stroke-width="1.1" stroke-linecap="round" opacity=".85"/>' +
      '<path d="M' + r1(bx + 4.8) + ',5.2 C' + r1(bx + 3.6) + ',7.4 ' + r1(bx + 1.8) + ',9.5 ' + r1(bx + 1.2) + ',13" fill="none" stroke="' + b.glans + '" stroke-width="1.1" stroke-linecap="round" opacity=".5"/>' +
      '<rect x="' + r1(bx + 3.6) + '" y="-4.2" width="4.2" height="8.4" rx="1.6" fill="' + b.greep + '" stroke="' + b.rand + '" stroke-width=".9"/>' +
      '<circle cx="' + r1(bx + 3.2) + '" cy="-19" r="1.7" fill="' + b.tip + '" stroke="' + b.rand + '" stroke-width=".8"/>' +
      '<circle cx="' + r1(bx + 3.2) + '" cy="19" r="1.7" fill="' + b.tip + '" stroke="' + b.rand + '" stroke-width=".8"/>';
    if (b.blad) s += '<path d="M' + r1(bx + 5.2) + ',-5 q3.5,-4 7,-3 q-2.5,3.6 -7,3z" fill="' + b.veer + '" stroke="' + b.rand + '" stroke-width=".7"/>';
    if (b.sterren) s += [[bx + 1.4, -12, 1.2], [bx + 5.8, -3.2, .9], [bx + 1.6, 12.4, 1.1]].map(function(q){ return '<circle cx="' + r1(q[0]) + '" cy="' + q[1] + '" r="' + q[2] + '" fill="#fff"/>'; }).join('');
    if (b.knoest) s += '<circle cx="' + r1(bx + 1.2) + '" cy="-11.5" r="1.2" fill="' + b.rand + '"/><circle cx="' + r1(bx + 1.6) + '" cy="10.5" r="1" fill="' + b.rand + '"/>' +
      '<path d="M' + r1(bx + 3.6) + ',-2 h4.2 M' + r1(bx + 3.6) + ',1.2 h4.2" stroke="' + b.rand + '" stroke-width=".7" opacity=".6"/>';
    return s;
  }
  g.COSMETICA = { ITEMS:ITEMS, SOORTEN:SOORTEN, vind:vind, vanBaas:vanBaas, vanNachtmerrie:vanNachtmerrie, ontleed:ontleed, bouw:bouw, toegestaan:toegestaan, inSeizoen:inSeizoen,
                  BOGEN:BOGEN, boog:boog, pijl:pijl, spoor:spoor };
})(typeof globalThis !== 'undefined' ? globalThis : this);
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.COSMETICA;
