/* ============================================================================
   COSMETICA. De winkel voor wie is ingelogd: met de munten die je in de
   oefenspellen verdient koop je een hoed, een rand om je gezichtje of een
   ander zwaard voor Zwaardvechter. Alleen voor de sier: niets hiervan maakt
   een spel makkelijker.

   Een gekocht ding zit in je avatar-spec: v1k2o3m4e5 krijgt er h2 (hoed 2),
   r1 (rand 1) of z3 (zwaard 3) achter. avatar.js tekent hoed en rand,
   zwaard.html tekent het zwaard. De server (server/profiel.js) kent deze
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
    /* achtergronden: a1 tot a3, een schijf achter het gezichtje */
    { id:'a1', soort:'a', n:1, naam:'Zonsopgang',     prijs:800,  uit:'oranje en geel achter je' },
    { id:'a2', soort:'a', n:2, naam:'Oceaan',         prijs:800,  uit:'diep blauw achter je' },
    { id:'a3', soort:'a', n:3, naam:'Sterrennacht',   prijs:1400, uit:'paars met sterren' },
    /* brillen: q1 tot q3 */
    { id:'q1', soort:'q', n:1, naam:'Zonnebril',      prijs:450,  uit:'cool, altijd' },
    { id:'q2', soort:'q', n:2, naam:'Monocle',        prijs:900,  uit:'deftig, met kettinkje' },
    { id:'q3', soort:'q', n:3, naam:'Ronde bril',     prijs:500,  uit:'voor wie veel leest' },
    /* randen: r1 tot r5 */
    { id:'r1', soort:'r', n:1, naam:'Gouden ring',    prijs:700, uit:'een rand van goud' },
    { id:'r2', soort:'r', n:2, naam:'Vuurring',       prijs:900, uit:'oranje vlammen' },
    { id:'r3', soort:'r', n:3, naam:'Regenboog',      prijs:1600, uit:'alle kleuren' },
    { id:'r4', soort:'r', n:4, naam:'IJsring',        prijs:900, uit:'koud blauw' },
    { id:'r5', soort:'r', n:5, naam:'Sterrenkrans',   prijs:1200, uit:'sterren eromheen' },
    { id:'r6', soort:'r', n:6, naam:'Krijtcirkel',    prijs:0, oud:true, uit:'omdat je bij meneer Greidanus in de klas zat' },
    /* zwaarden voor Zwaardvechter: z1 tot z5 */
    { id:'z1', soort:'z', n:1, naam:'Vlammend zwaard', prijs:1000, uit:'een oranje kling die gloeit' },
    { id:'z2', soort:'z', n:2, naam:'IJszwaard',       prijs:1000, uit:'lichtblauw en koud' },
    { id:'z3', soort:'z', n:3, naam:'Gouden zwaard',   prijs:1500, uit:'van puur goud' },
    { id:'z4', soort:'z', n:4, naam:'Lichtzwaard',     prijs:2200, uit:'groen licht, zoemt niet' },
    { id:'z5', soort:'z', n:5, naam:'Houten oefenzwaard', prijs:200, uit:'doet net zo veel pijn, eerlijk waar' },
    { id:'z6', soort:'z', n:6, naam:'Krijtje',            prijs:0, oud:true, uit:'omdat je bij meneer Greidanus in de klas zat' },
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
    { id:'r8',  soort:'r', n:8,  naam:'Zwermring',          prijs:0, baas:'nm-zwerm', uit:'versla De Zwerm in de nachtmerrie' }
  ];
  var SOORTEN = { h:'Hoeden', q:'Brillen', a:'Achtergronden', r:'Randen', z:'Zwaarden', b:'Trofeeën van de bazen' };
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
  /* de spec uit elkaar: het gezichtje en wat erop en eromheen zit */
  function ontleed(spec){
    var m = /^(v\dk\do\dm\de\d)(?:h(\d{1,2}))?(?:r(\d{1,2}))?(?:z(\d{1,2}))?(?:b(\d{1,2}))?(?:a(\d{1,2}))?(?:q(\d{1,2}))?$/.exec(String(spec || ''));
    return m ? { basis:m[1], h:+(m[2] || 0), r:+(m[3] || 0), z:+(m[4] || 0), b:+(m[5] || 0), a:+(m[6] || 0), q:+(m[7] || 0) } : null;
  }
  function bouw(o){ return o.basis + (o.h ? 'h' + o.h : '') + (o.r ? 'r' + o.r : '') + (o.z ? 'z' + o.z : '') + (o.b ? 'b' + o.b : '') + (o.a ? 'a' + o.a : '') + (o.q ? 'q' + o.q : ''); }
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
    return bouw(o);
  }
  g.COSMETICA = { ITEMS:ITEMS, SOORTEN:SOORTEN, vind:vind, vanBaas:vanBaas, vanNachtmerrie:vanNachtmerrie, ontleed:ontleed, bouw:bouw, toegestaan:toegestaan, inSeizoen:inSeizoen };
})(typeof globalThis !== 'undefined' ? globalThis : this);
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.COSMETICA;
