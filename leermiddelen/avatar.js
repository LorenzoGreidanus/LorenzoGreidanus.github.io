/* Een avatar bij elke bijnaam: een blob in de vormtaal van het merkboek (de
   vorm die het logo aanneemt als je erover beweegt), in een merkkleur, met
   een gezichtje. Dezelfde bijnaam geeft altijd dezelfde blob, op elk
   apparaat, want alles komt uit een hash van de naam. Geen plaatjes nodig.

   Het gezicht ligt op een bol: kijkt een gezichtje opzij, dan schuiven ogen,
   mond en blosjes mee en worden ze smaller aan de rand. Een zacht licht
   linksboven en schaduw aan de rand geven het lijf diepte. (Het idee komt uit
   de Bible Strong Avatar Lab; de code hier is eigen werk, niet van daar.)

   Wie een eigen avatar heeft gekozen (profiel.js), geeft een spec mee:
   'v3k2o1m0e4' = vorm, kleur, ogen, mond, extra. Dan telt de naam niet meer.
   Vorm 0-7 zijn blobs, 8 een blok, 9 een boon, 10 een druppel; ogen 10 zijn
   pil-ogen. Daarachter mag (in deze volgorde) c (een kleur uit de tweede rij),
   en dan de dingen uit de winkel: h r z b a q f (zie cosmetica.js); f is een
   figuur die aan het hoofd vastzit en meedraait. x en w (haar) mogen er nog in
   staan van een eerdere versie, maar tekenen niets: het blobje is een
   blobje, geen mensje.

   Gebruik:
     AVATAR.svg('Noor', 32)         een <svg> als tekst, 32 pixels, stil
     AVATAR.svg('Noor', 32, spec, { stemming:'blij', kijk:[x, y], leef:true })
                                    stemming: '' gewoon, blij, trots, denkt, sip, oeps, au, slaapt
                                    kijk: de kant die het hoofd op kijkt, x en y van -1 tot 1
                                    leef: het gezichtje gaat leven zodra het in de pagina staat;
                                          een tekst in plaats van true is een sleutel: een nieuw
                                          gezichtje met dezelfde sleutel gaat verder waar het oude was
     AVATAR.leef(el, opties)        een svg uit AVATAR.svg laten leven; geeft { zet, juich, juichElke, kijk, volg }
     AVATAR.inhoud('Noor', spec, stemming, kijk)  alleen de binnenkant, voor in een eigen svg (viewBox -50..50)
     AVATAR.ontleed(spec) / AVATAR.maak({v,k,o,m,e,c,...})
     AVATAR.KEUZES                  hoeveel er van elk zijn
     AVATAR.NAMEN                   hoe elke keuze heet, voor de kiezer
     AVATAR.vul(root)               vult elementen met data-avatar="naam" */
window.AVATAR = (function(){
  'use strict';
  var KLEUREN = ['#F26749', '#EA9836', '#204ECF', '#83A5F2', '#2f7d52', '#6b3fa0', '#14224C', '#d95c3b', '#1f7a6d'];
  var DONKER = { '#204ECF':1, '#14224C':1, '#6b3fa0':1, '#2f7d52':1, '#1f7a6d':1, '#d95c3b':1, '#F26749':1 };
  /* de tweede rij kleuren (c1 tot c11). De eerste vijf (huidtinten) staan niet meer in de kiezer,
     want zonder haar lijkt een blob in huidskleur op een kaal hoofdje; ze tekenen nog wel. */
  var KLEUREN2 = ['#F7CFB0', '#E9AE82', '#C98A57', '#94603A', '#5E3B25', '#F4A6BF', '#F6C945', '#6CCBAE', '#A98BE0', '#E2466F', '#8C97AB'];
  /* telt de getekende gezichtjes, voor een eigen id per knipsel */
  var teller = 0;
  var INKT = '#14224C';
  function hash(s){
    var h = 2166136261;
    s = String(s || '').toLowerCase().trim();
    for (var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function toeval(zaad){
    var a = zaad >>> 0;
    return function(){
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /* twee kleuren mengen (t = 0 is a, 1 is b), en hoe licht een kleur is (0 zwart, 1 wit) */
  function meng(a, b, t){
    var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16), u = '#';
    for (var s = 16; s >= 0; s -= 8){ var c = Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t); u += (c < 16 ? '0' : '') + c.toString(16); }
    return u;
  }
  function licht(k){ var x = parseInt(k.slice(1), 16); return (((x >> 16) & 255) * 0.299 + ((x >> 8) & 255) * 0.587 + (x & 255) * 0.114) / 255; }
  function f1(n){ return (+n).toFixed(1).replace('.0', ''); }
  /* de blob: acht punten rond een cirkel, elk iets naar binnen of buiten, met
     zachte bochten ertussen (Catmull-Rom naar Bezier). Ook de rand zelf komt
     terug, in stapjes: daarmee past een hoed precies op dit hoofd. */
  function blob(r, straal){
    var n = 8, p = [], pts = [];
    for (var i = 0; i < n; i++){
      var a = i / n * Math.PI * 2, s = straal * (0.86 + r() * 0.16);
      p.push([Math.cos(a) * s, Math.sin(a) * s]);
    }
    var d = 'M' + p[0][0].toFixed(1) + ',' + p[0][1].toFixed(1);
    for (i = 0; i < n; i++){
      var p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      var c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ' C' + c1[0].toFixed(1) + ',' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(1) + ',' + c2[1].toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
      for (var t = 0; t < 0.999; t += 1 / 12){ var u = 1 - t, a0 = u*u*u, a1 = 3*u*u*t, a2 = 3*u*t*t, a3 = t*t*t;
        pts.push([a0*p1[0] + a1*c1[0] + a2*c2[0] + a3*p2[0], a0*p1[1] + a1*c1[1] + a2*c2[1] + a3*p2[1]]); }
    }
    return { d:d + ' Z', pts:pts };
  }
  /* de rand van het hoofd rechtop gezet (de blob staat een paar graden scheef) */
  function draaiPunten(pts, draai){
    var a = draai * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return pts.map(function(q){ return [q[0] * c - q[1] * s, q[0] * s + q[1] * c]; });
  }
  /* de maten van het rechte hoofd: de top in het midden en de halve breedte op ooghoogte */
  function maten(P){
    var top = 0, breed = 0, bovenBreed = 0;
    P.forEach(function(q){ if (Math.abs(q[0]) < 8 && q[1] < top) top = q[1]; });
    P.forEach(function(q){ if (Math.abs(q[1] + 8) < 7 && Math.abs(q[0]) > breed) breed = Math.abs(q[0]); if (q[1] < top + 18 && Math.abs(q[0]) > bovenBreed) bovenBreed = Math.abs(q[0]); });
    return { top:top, breed:breed || 42, bovenBreed:bovenBreed };
  }
  /* waar de hoed moet zitten: de bovenkant van het hoofd in het midden, en hoe breed het daar is.
     De hoeden zijn getekend op een hoofd met de top op -46 en een halve breedte van 33 op de hoedrand (y -32).
     op en groter: voor een kapsel met volume (een afro) komt de hoed hoger en iets groter te staan. */
  function hoedPlek(M, op, groter){
    var s = Math.max(0.85, Math.min(1.12, M.bovenBreed / 33)) * (groter || 1);
    return 'translate(0,' + (M.top - (op || 0) + 46 - 30).toFixed(1) + ') scale(' + s.toFixed(3) + ') translate(0,30)';
  }
  /* de lijven die geen blob zijn: een blok, een boon en een druppel (vorm 8, 9 en 10) */
  var VORMEN = {
    8: function(){ var p = []; for (var i = 0; i < 16; i++){ var a = i / 16 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); p.push([(c < 0 ? -1 : 1) * Math.pow(Math.abs(c), .42) * 41, (s < 0 ? -1 : 1) * Math.pow(Math.abs(s), .42) * 39]); } return p; },
    9: function(){ var p = []; for (var i = 0; i < 10; i++){ var a = i / 10 * Math.PI * 2; p.push([Math.cos(a) * 36 * (1 + .07 * Math.sin(a * 2)), Math.sin(a) * 47]); } return p; },
    10: function(){ var p = []; for (var i = 0; i < 12; i++){ var a = i / 12 * Math.PI * 2 - Math.PI / 2, s = i === 0 ? 62 : (i === 1 || i === 11) ? 45 : 43; p.push([Math.cos(a) * s, Math.sin(a) * s + 5]); } return p; }
  };
  /* dezelfde zachte bochten als blob(), maar door punten die al vastliggen */
  function glad(p){
    var n = p.length, d = 'M' + p[0][0].toFixed(1) + ',' + p[0][1].toFixed(1), pts = [];
    for (var i = 0; i < n; i++){
      var p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      var c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ' C' + c1[0].toFixed(1) + ',' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(1) + ',' + c2[1].toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
      for (var t = 0; t < 0.999; t += 1 / 12){ var u = 1 - t, a0 = u*u*u, a1 = 3*u*u*t, a2 = 3*u*t*t, a3 = t*t*t;
        pts.push([a0*p1[0] + a1*c1[0] + a2*c2[0] + a3*p2[0], a0*p1[1] + a1*c1[1] + a2*c2[1] + a3*p2[1]]); }
    }
    return { d:d + ' Z', pts:pts };
  }
  var KEUZES = { vormen:11, kleuren:KLEUREN.length, kleuren2:KLEUREN2.length, ogen:11, monden:10, extras:10, figuren:7 };
  var NAMEN = {
    v:['vorm 1', 'vorm 2', 'vorm 3', 'vorm 4', 'vorm 5', 'vorm 6', 'vorm 7', 'vorm 8', 'blok', 'boon', 'druppel'],
    o:['stipjes', 'blij', 'knipoog', 'bril', 'grote ogen', 'cool', 'verbaasd', 'sterren', 'tevreden', 'vastberaden', 'pil-ogen'],
    m:['lach', 'rondje', 'streepje', 'schaterlach', 'tong uit', 'tanden', 'scheve grijns', 'o', 'kattensnoetje', 'beugel'],
    e:['blosjes', 'sproetjes', 'krul', 'pleister', 'ster', 'niets', 'zweetdruppel', 'snor', 'glinsters', 'moedervlekje'],
    k:['koraal', 'oranje', 'blauw', 'lichtblauw', 'groen', 'paars', 'nachtblauw', 'steenrood', 'zeegroen'],
    c:['licht perzik', 'perzik', 'karamel', 'bruin', 'donkerbruin', 'roze', 'zonnegeel', 'mint', 'lila', 'framboos', 'grijs'],
    f:['geen', 'oortjes', 'bloem', 'wolkje', 'voelsprieten', 'knotje', 'kattenoren']
  };
  var PATROON = /^v(\d{1,2})k(\d)o(\d{1,2})m(\d)e(\d)(?:c(\d{1,2}))?(?:x(\d{1,2}))?(?:w(\d))?(?:h(\d{1,2}))?(?:r(\d{1,2}))?(?:z(\d{1,2}))?(?:b(\d{1,2}))?(?:a(\d{1,2}))?(?:q(\d{1,2}))?(?:f(\d))?(?:p(\d{1,2}))?$/;
  /* achter het gezichtje kan cosmetica staan: h (hoed), r (rand), z (zwaard), b, a, q, f en p (pijlboog), uit de winkel */
  function ontleed(spec){
    spec = String(spec || '');
    var m = PATROON.exec(spec);
    /* Een spec die ergens onderweg is afgekapt (een oude server die er 24 tekens van bewaarde):
       haal er van achteren af tot hij weer klopt, dan blijft het gezicht en valt hooguit een bril weg. */
    for (var i = 0; !m && i < 16 && spec.length > 10 && /^v\d{1,2}k\do\d{1,2}m\de\d/.test(spec); i++){ spec = spec.replace(/[a-z]\d*$/, ''); m = PATROON.exec(spec); }
    return m ? { v:+m[1], k:+m[2], o:+m[3], m:+m[4], e:+m[5], c:+(m[6] || 0), x:+(m[7] || 0), w:+(m[8] || 0), h:+(m[9] || 0), r:+(m[10] || 0), z:+(m[11] || 0), b:+(m[12] || 0), a:+(m[13] || 0), q:+(m[14] || 0), f:+(m[15] || 0), p:+(m[16] || 0) } : null; }
  function maak(o){
    /* x en w (haar) bestaan nog in het patroon, voor codes van even, maar worden niet meer gemaakt of getekend */
    var c = (o.c | 0) % (KLEUREN2.length + 1);
    return 'v' + (o.v % KEUZES.vormen) + 'k' + (o.k % KEUZES.kleuren) + 'o' + (o.o % KEUZES.ogen) + 'm' + (o.m % KEUZES.monden) + 'e' + (o.e % KEUZES.extras) +
      (c ? 'c' + c : '') +
      (o.h ? 'h' + o.h : '') + (o.r ? 'r' + o.r : '') + (o.z ? 'z' + o.z : '') + (o.b ? 'b' + o.b : '') + (o.a ? 'a' + o.a : '') + (o.q ? 'q' + o.q : '') + (o.f ? 'f' + (o.f % KEUZES.figuren) : '') + (o.p ? 'p' + o.p : '');
  }
  /* Een lichte rand om een los stuk (hoed, trofee), zodat het ook op een donkere achtergrond
     te zien is. Het is dezelfde tekening nog een keer, maar dan als dikke witte omtrek eronder; wat
     binnen de vorm valt verdwijnt onder het stuk zelf, alleen de buitenkant blijft over. */
  var HALO = ' fill="none" stroke="#fff" stroke-linejoin="round" stroke-linecap="round" opacity=".42"';
  function halo(tekening, dik){
    return '<g' + HALO + ' stroke-width="' + f1(dik) + '">' + tekening.replace(/ (fill|stroke|stroke-width|opacity|stroke-opacity|fill-opacity|stroke-dasharray|stroke-dashoffset|fill-rule)="[^"]*"/g, '') + '</g>';
  }
  /* de hoeden en randen uit de winkel, in de maten van het gezichtje (viewBox -50..50) */
  function hoed(n){
    if (n === 1) return '<path d="M-24,-30 L-28,-48 L-14,-38 L0,-52 L14,-38 L28,-48 L24,-30 Z" fill="#FFD166" stroke="#c9971f" stroke-width="2" stroke-linejoin="round"/><path d="M-24,-33 h48" stroke="#c9971f" stroke-width="1.6" opacity=".6"/><circle cx="0" cy="-42" r="3" fill="#F26749"/><circle cx="-16" cy="-38" r="2.2" fill="#204ECF"/><circle cx="16" cy="-38" r="2.2" fill="#204ECF"/>';
    /* tovenaarshoed: een hoge punt die een beetje omknikt, met een brede rand */
    if (n === 2) return '<path d="M-24,-31 Q-12,-40 -6,-56 Q-2,-66 8,-70 Q2,-62 6,-50 Q10,-40 24,-31 Z" fill="#6b3fa0"/><path d="M-36,-30 q36,-9 72,0" fill="none" stroke="#6b3fa0" stroke-width="6" stroke-linecap="round"/><path d="M-22,-34 q22,-6 44,0" fill="none" stroke="#FFD166" stroke-width="3"/><path d="M-2,-50 l1.5,3 3.5,.5 -2.5,2.5 .5,3.5 -3,-1.8 -3,1.8 .5,-3.5 -2.5,-2.5 3.5,-.5z" fill="#FFD166"/><circle cx="10" cy="-42" r="1.6" fill="#FFD166"/><circle cx="-10" cy="-40" r="1.2" fill="#FFD166"/>';
    if (n === 3) return '<path d="M-37,-26 q37,-11 74,0" fill="none" stroke="#F3EFE9" stroke-width="10" stroke-linecap="round"/><path d="M-37,-26 q37,-11 74,0" fill="none" stroke="#F26749" stroke-width="2.6" stroke-linecap="round" transform="translate(0,-2.4)"/><path d="M-37,-26 q37,-11 74,0" fill="none" stroke="#204ECF" stroke-width="2.6" stroke-linecap="round" transform="translate(0,2.4)"/>';
    if (n === 4) return '<path d="M-36,-30 q36,-14 72,0 q-10,-28 -36,-28 q-26,0 -36,28 z" fill="#14224C"/><path d="M-36,-30 q36,8 72,0" fill="none" stroke="#14224C" stroke-width="5" stroke-linecap="round"/><path d="M-28,-36 q28,-8 56,0" fill="none" stroke="#c9971f" stroke-width="1.8"/><circle cx="0" cy="-44" r="4.5" fill="#fff"/><circle cx="-1.6" cy="-45" r="1.1" fill="#14224C"/><circle cx="1.6" cy="-45" r="1.1" fill="#14224C"/>';
    if (n === 5) return '<path d="M-22,-30 q-4,-14 4,-22 q2,12 8,16 z M22,-30 q4,-14 -4,-22 q-2,12 -8,16 z" fill="#c0442c" stroke="#8a2416" stroke-width="1.5" stroke-linejoin="round"/>';
    if (n === 6) return '<ellipse cx="0" cy="-53" rx="20" ry="5" fill="none" stroke="#FFD166" stroke-width="4"/><ellipse cx="0" cy="-53" rx="20" ry="5" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/>';
    if (n === 7) return '<g><path d="M-26,-28 q26,-8 52,0" fill="none" stroke="#2f7d52" stroke-width="3"/><circle cx="-22" cy="-30" r="5" fill="#F26749"/><circle cx="-11" cy="-36" r="5" fill="#FFD166"/><circle cx="0" cy="-38" r="5" fill="#F26749"/><circle cx="11" cy="-36" r="5" fill="#FFD166"/><circle cx="22" cy="-30" r="5" fill="#F26749"/><g fill="#fff"><circle cx="-22" cy="-30" r="1.6"/><circle cx="-11" cy="-36" r="1.6"/><circle cx="0" cy="-38" r="1.6"/><circle cx="11" cy="-36" r="1.6"/><circle cx="22" cy="-30" r="1.6"/></g></g>';
    /* feestmuts: iets hoger dan vroeger, met strepen en een pompon */
    if (n === 8) return '<path d="M-17,-29 L2,-62 L17,-29 Z" fill="#204ECF" stroke="#16389a" stroke-width="1.5" stroke-linejoin="round"/><path d="M-11,-37 L13,-37 M-5,-48 L8,-48" stroke="#FFD166" stroke-width="3.4" stroke-linecap="round"/><circle cx="2" cy="-62" r="4.5" fill="#F26749"/>';
    /* kerstmuts: een brede witte bontrand over het hele hoofd, de rode muts valt naar rechts om,
       met de pompon aan de punt. Een plooi en een glimlicht geven hem een beetje vorm. */
    if (n === 9) return '<path d="M-31,-31 Q-27,-58 0,-63 Q24,-67 38,-46 Q30,-49 23,-47 Q27,-40 31,-31 Z" fill="#D23A2E" stroke="#9f2519" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<path d="M23,-47 Q16,-57 1,-60" fill="none" stroke="#9f2519" stroke-width="2" stroke-linecap="round" opacity=".55"/>' +
      '<path d="M-21,-37 Q-17,-53 -3,-57" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".28"/>' +
      '<rect x="-37" y="-37" width="74" height="12" rx="6" fill="#F7F3EC" stroke="#cfc4b6" stroke-width="1.3"/>' +
      '<g fill="#e4dbcf"><circle cx="-26" cy="-31" r="1.6"/><circle cx="-12" cy="-29.5" r="1.4"/><circle cx="3" cy="-32" r="1.6"/><circle cx="17" cy="-29.5" r="1.4"/><circle cx="29" cy="-31.5" r="1.5"/></g>' +
      '<circle cx="38" cy="-45" r="7.5" fill="#F7F3EC" stroke="#cfc4b6" stroke-width="1.3"/><circle cx="36" cy="-47.5" r="2.4" fill="#fff"/>';
    /* pompoenhoed: oranje met ribbels en een steeltje */
    if (n === 10) return '<path d="M-30,-30 q0,-26 30,-26 q30,0 30,26 z" fill="#EA9836"/><path d="M-12,-30 q0,-22 12,-24 M12,-30 q0,-22 -12,-24" fill="none" stroke="#c0442c" stroke-width="2" opacity=".55"/><path d="M-33,-30 h66" stroke="#c96a1c" stroke-width="5" stroke-linecap="round"/><path d="M0,-56 q6,-6 4,-12" fill="none" stroke="#2f7d52" stroke-width="5" stroke-linecap="round"/>';
    /* hazenoren: twee lange oren met roze binnenkant */
    if (n === 11) return '<g fill="#F3EFE9" stroke="#b9ab9c" stroke-width="1.5"><path d="M-16,-30 q-14,-30 -4,-46 q10,10 12,46 z"/><path d="M16,-30 q14,-30 4,-46 q-10,10 -12,46 z"/></g><g fill="#F6B8C6"><path d="M-14,-32 q-8,-22 -4,-36 q6,10 8,36 z"/><path d="M14,-32 q8,-22 4,-36 q-6,10 -8,36 z"/></g>';
    /* baret: het platte bord met een kwastje, voor wie bij hem in de klas zat */
    if (n === 12) return '<g><path d="M-20,-38 h40 v10 q-20,9 -40,0 z" fill="#22315f"/><path d="M0,-52 L33,-41 L0,-30 L-33,-41 Z" fill="#14224C"/><path d="M0,-50 L28,-41 L0,-32 L-28,-41 Z" fill="none" stroke="#3b4d82" stroke-width="1"/><circle cx="0" cy="-41" r="2.4" fill="#F26749"/><path d="M0,-41 q22,1 26,4" fill="none" stroke="#F26749" stroke-width="2.2" stroke-linecap="round"/><path d="M26,-37 v8" stroke="#F26749" stroke-width="2.2" stroke-linecap="round"/><path d="M23,-29 h6 l-1,5 h-4 z" fill="#EA9836"/></g>';
    /* nachtmerriekroon van De Grote Fout: donker met een rode gloed eronder */
    if (n === 13) return '<path d="M-26,-30 L-30,-52 L-15,-40 L0,-56 L15,-40 L30,-52 L26,-30 Z" fill="#2b0d1c" stroke="#c0442c" stroke-width="2.4" stroke-linejoin="round"/><circle cx="0" cy="-44" r="3.4" fill="#F26749"/><circle cx="-17" cy="-39" r="2.4" fill="#c0442c"/><circle cx="17" cy="-39" r="2.4" fill="#c0442c"/><path d="M-26,-29 h52" stroke="#F26749" stroke-width="2" opacity=".7"/>';
    /* propkroon van De Prop: verfrommeld papier met scherpe punten */
    if (n === 14) return '<path d="M-28,-29 L-22,-44 L-12,-36 L-2,-50 L8,-36 L20,-46 L28,-29 Z" fill="#e8dcc0" stroke="#8a7350" stroke-width="2.2" stroke-linejoin="round"/><path d="M-16,-33 l6,-6 M2,-34 l5,-7 M16,-33 l4,-6" stroke="#8a7350" stroke-width="1.4" opacity=".7"/>';
    /* pet achterstevoren: de klep wijst naar achteren, voorop zie je het gaatje met het bandje */
    if (n === 15) return '<path d="M6,-50 q18,-12 34,-5 l-3,5 q-14,-4 -27,4 z" fill="#c0442c"/><path d="M-34,-29 q-2,-27 34,-27 q36,0 34,27 z" fill="#F26749"/><path d="M0,-56 v24" stroke="#c0442c" stroke-width="1.6" opacity=".6"/><path d="M-8,-29 q8,-12 16,0 z" fill="#c0442c"/><path d="M-8,-32 h16" stroke="#F3EFE9" stroke-width="2" stroke-linecap="round"/><path d="M-35,-29 h70" stroke="#c0442c" stroke-width="4" stroke-linecap="round"/><circle cx="0" cy="-56" r="2.4" fill="#c0442c"/>';
    /* beanie: een gebreide muts met een omgeslagen rand en een pompon */
    if (n === 16) return '<circle cx="0" cy="-60" r="7" fill="#FFD166" stroke="#c9971f" stroke-width="1.4"/><path d="M-33,-30 q-2,-26 33,-28 q35,2 33,28 z" fill="#2f9e8f"/><path d="M-12,-54 v16 M0,-57 v19 M12,-54 v16" stroke="#1f7a6d" stroke-width="1.8" stroke-linecap="round" opacity=".7"/><path d="M-35,-35 q35,-7 70,0 v9 q-35,-6 -70,0 z" fill="#1f7a6d"/><path d="M-26,-35 v8 M-13,-37 v8 M0,-38 v8 M13,-37 v8 M26,-35 v8" stroke="#2f9e8f" stroke-width="2" stroke-linecap="round" opacity=".8"/>';
    /* koptelefoon: een beugel over je hoofd en twee dikke dopjes */
    if (n === 17) return '<path d="M-38,-4 q-4,-50 38,-50 q42,0 38,50" fill="none" stroke="#14224C" stroke-width="6" stroke-linecap="round"/><path d="M-30,-24 q6,-24 30,-26" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".35"/><rect x="-47" y="-16" width="13" height="24" rx="6" fill="#F26749" stroke="#14224C" stroke-width="2.4"/><rect x="34" y="-16" width="13" height="24" rx="6" fill="#F26749" stroke="#14224C" stroke-width="2.4"/><path d="M-43,-10 v12 M43,-10 v12" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".5"/>';
    /* vissershoedje: een zachte bol met een schuin aflopende rand */
    if (n === 18) return '<path d="M-24,-32 q0,-22 24,-22 q24,0 24,22 z" fill="#8fbf9a"/><path d="M-24,-36 q24,-5 48,0" fill="none" stroke="#5e8f6a" stroke-width="3"/><path d="M-38,-24 q38,-16 76,0 l-8,-9 q-30,-8 -60,0 z" fill="#8fbf9a" stroke="#5e8f6a" stroke-width="1.6" stroke-linejoin="round"/>';
    /* cowboyhoed: een bol met een deuk, een band, en een rand die aan de zijkant omhoog krult */
    if (n === 19) return '<path d="M-20,-32 q-2,-22 8,-24 q6,4 12,0 q6,4 12,0 q10,2 8,24 z" fill="#a5773f"/><path d="M-20,-36 q20,-5 40,0" fill="none" stroke="#5f4830" stroke-width="4"/><path d="M-44,-40 q8,14 44,12 q36,2 44,-12 q-4,16 -44,18 q-40,-2 -44,-18 z" fill="#a5773f" stroke="#7d5a2e" stroke-width="1.6" stroke-linejoin="round"/>';
    /* oranje kroon voor Koningsdag: van karton, met een zigzag */
    if (n === 20) return '<path d="M-27,-29 L-30,-50 L-20,-40 L-10,-54 L0,-42 L10,-54 L20,-40 L30,-50 L27,-29 Z" fill="#F7931E" stroke="#c96a1c" stroke-width="2" stroke-linejoin="round"/><path d="M-27,-34 h54" stroke="#fff" stroke-width="2.4" opacity=".75"/><circle cx="-10" cy="-47" r="2.2" fill="#fff"/><circle cx="10" cy="-47" r="2.2" fill="#fff"/><circle cx="0" cy="-38" r="2.4" fill="#204ECF"/>';
    /* strohoed voor de zomer: een brede rand met een rood lint */
    if (n === 21) return '<path d="M-46,-27 q46,-14 92,0 q-10,6 -46,6 q-36,0 -46,-6 z" fill="#e8c877" stroke="#b8924a" stroke-width="1.6" stroke-linejoin="round"/><path d="M-22,-31 q0,-22 22,-22 q22,0 22,22 z" fill="#e8c877" stroke="#b8924a" stroke-width="1.6"/><path d="M-22,-34 q22,-5 44,0" fill="none" stroke="#c0442c" stroke-width="4"/><path d="M-36,-26 q36,-9 72,0 M-14,-46 q14,-4 28,0" fill="none" stroke="#b8924a" stroke-width="1" opacity=".6"/>';
    return '';
  }
  /* de trofeeën, rechtsonder bij het gezicht */
  function trofee(n){
    var g = '';
    if (n === 1) g = '<path d="M0,-13 l3.5,7.5 8,1 -6,5.5 1.5,8 -7,-4 -7,4 1.5,-8 -6,-5.5 8,-1z" fill="#4a1230" stroke="#FFD166" stroke-width="1.5" stroke-linejoin="round"/><circle r="2.5" fill="#FFD166"/>';
    else if (n === 2) g = '<path d="M-11,-4 q4,-11 12,-8 q9,-2 10,7 q5,8 -4,11 q-8,5 -13,-1 q-9,-1 -5,-9z" fill="#22315f"/><circle cx="12" cy="-9" r="2.2" fill="#22315f"/><circle cx="-12" cy="8" r="1.6" fill="#22315f"/><circle cx="-3" cy="-2" r="2" fill="#fff" opacity=".6"/>';
    else if (n === 3) g = '<g transform="rotate(-40)"><rect x="-3" y="-13" width="6" height="20" rx="1.5" fill="#c0442c"/><path d="M-3,7 L0,13 L3,7 Z" fill="#F3EFE9" stroke="#c0442c" stroke-width="1"/><rect x="-3" y="-13" width="6" height="4" fill="#8a2416"/></g>';
    else if (n === 4) g = '<path d="M-10,-3 l4,-8 8,-1 7,5 1,8 -5,7 -9,1 -6,-5z" fill="#F3EFE9" stroke="#8f9db0" stroke-width="1.5" stroke-linejoin="round"/><path d="M-5,-4 l4,5 -3,5 M3,-7 l3,6 -2,6" fill="none" stroke="#8f9db0" stroke-width="1"/>';
    else if (n === 5) g = '<circle r="11" fill="#5b6480" stroke="#14224C" stroke-width="1.5"/><circle r="9" fill="none" stroke="#fff" stroke-width=".8" opacity=".6"/><path d="M0,0 L0,-6 M0,0 L4,2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle r="1.2" fill="#F26749"/>';
    else if (n === 6) g = '<circle r="6" fill="#3b4759"/>' + [0, 60, 120, 180, 240, 300].map(function(a){ return '<circle transform="rotate(' + a + ') translate(0,-11)" r="3" fill="#3b4759"/>'; }).join('') + '<circle cx="-2" cy="-1.5" r="1" fill="#fff"/><circle cx="2" cy="-1.5" r="1" fill="#fff"/>';
    /* vlammetje: vijf dagen op rij geoefend */
    else if (n === 7) g = '<path d="M0,13 q-12,0 -11,-11 q1,-8 7,-13 q0,6 4,8 q1,-8 7,-12 q-1,8 5,13 q4,5 -1,11 q-4,4 -11,4z" fill="#F26749" stroke="#c0442c" stroke-width="1.4" stroke-linejoin="round"/><path d="M0,11 q-5,0 -5,-5 q0,-4 4,-7 q0,4 3,5 q3,2 3,4 q0,3 -5,3z" fill="#FFD166"/>';
    if (!g) return '';
    return '<g transform="translate(30,26)">' + halo(g, 5) + g + '</g>';
  }
  /* De achtergrond uit de winkel: een schijf achter het gezichtje. Vroeger met een verloop, maar
     een verloop heeft een id nodig, en met een klas vol gezichtjes op een pagina botsen die. Nu vlak,
     met een lichte rand zodat een donkere schijf op een donkere pagina niet wegvalt. */
  var SCHIJFRAND = '<circle r="49" fill="none" stroke="#fff" stroke-width="1.6" opacity=".3"/>';
  function achtergrond(n){
    if (n === 1) return '<circle r="49" fill="#F47A45"/><path d="M-49,0 a49,49 0 0 0 98,0 z" fill="#FFC35C" opacity=".8"/><circle cy="30" r="19" fill="#FFD166" opacity=".6"/>';
    if (n === 2) return '<circle r="49" fill="#2d5bd6"/><path d="M-49,0 a49,49 0 0 1 98,0 z" fill="#83A5F2" opacity=".75"/><path d="M-34,22 q8,-6 16,0 t16,0 t16,0" fill="none" stroke="#fff" stroke-width="2.5" opacity=".5"/>';
    /* middernacht van De Klok: een wijzerplaat achter je gezichtje */
    if (n === 4) return '<circle r="49" fill="#2e2558"/><circle cy="-8" r="38" fill="#4a3a80" opacity=".6"/><g stroke="#FFD166" stroke-width="2" opacity=".75">' + [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(function(a){ return '<path transform="rotate(' + a + ')" d="M0,-45 v-4"/>'; }).join('') + '</g><path d="M0,0 L0,-30" stroke="#F26749" stroke-width="2.6" stroke-linecap="round" opacity=".8"/><path d="M0,0 L20,10" stroke="#FFD166" stroke-width="2.6" stroke-linecap="round" opacity=".8"/>' + SCHIJFRAND;
    if (n === 3) return '<circle r="49" fill="#2a2466"/><circle cy="-14" r="36" fill="#5a3796" opacity=".7"/><g fill="#FFD166"><circle cx="-34" cy="-22" r="2"/><circle cx="30" cy="-30" r="1.6"/><circle cx="38" cy="8" r="1.4"/><circle cx="-38" cy="14" r="1.3"/><circle cx="8" cy="-44" r="1.8"/><circle cx="-12" cy="42" r="1.5"/></g>' + SCHIJFRAND;
    /* ruitjespapier, zoals in je wiskundeschrift, met de rode kantlijn */
    if (n === 5){
      var l = '';
      for (var i = -40; i <= 40; i += 10){ var h = Math.sqrt(49 * 49 - i * i).toFixed(1); l += 'M' + i + ',-' + h + 'V' + h + 'M-' + h + ',' + i + 'H' + h; }
      var kl = Math.sqrt(49 * 49 - 33 * 33).toFixed(1);
      return '<circle r="49" fill="#FDFBF4" stroke="#b9c7e6" stroke-width="1.4"/><path d="' + l + '" stroke="#9db4ea" stroke-width="1" opacity=".8"/><path d="M-33,-' + kl + 'V' + kl + '" stroke="#F26749" stroke-width="1.6"/>';
    }
    /* confetti: snippers in alle merkkleuren */
    if (n === 6) return '<circle r="49" fill="#FFF1CC" stroke="#EA9836" stroke-width="1.4" opacity=".95"/>' + [[-40, -24, 20, '#F26749'], [-30, -40, -30, '#204ECF'], [-6, -47, 60, '#2f9e8f'], [22, -42, 10, '#6b3fa0'], [40, -22, -40, '#F26749'], [45, 4, 30, '#FFD166'], [38, 28, -20, '#204ECF'], [18, 43, 50, '#2f9e8f'], [-14, 45, -10, '#F26749'], [-36, 32, 40, '#6b3fa0'], [-46, 6, -60, '#EA9836']].map(function(c){
      return '<rect x="-2.6" y="-1.5" width="5.2" height="3" rx=".8" fill="' + c[3] + '" transform="translate(' + c[0] + ',' + c[1] + ') rotate(' + c[2] + ')"/>'; }).join('');
    /* sneeuw: een winterlucht met vlokjes en een witte heuvel onderaan */
    if (n === 7) return '<circle r="49" fill="#5f86d9"/><path d="M-46,18 q22,-12 46,-4 q24,-8 46,4 a49,49 0 0 1 -92,0 z" fill="#F3F6FB"/><g fill="#fff">' + [[-34, -28, 2.2], [-20, -42, 1.6], [4, -46, 2], [26, -38, 1.8], [40, -18, 2.2], [-44, -6, 1.6], [44, 4, 1.4], [-38, 10, 1.3], [16, -44, 1.2]].map(function(c){ return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>'; }).join('') + '</g>' + SCHIJFRAND;
    return '';
  }
  /* de bril uit de winkel, over de ogen heen */
  function bril(n){
    if (n === 1) return '<g><rect x="-27" y="-13" width="22" height="16" rx="6" fill="#14224C"/><rect x="5" y="-13" width="22" height="16" rx="6" fill="#14224C"/><path d="M-5,-8 h10 M-27,-8 h-6 M27,-8 h6" stroke="#14224C" stroke-width="3" stroke-linecap="round"/><path d="M-22,-9 h8 M10,-9 h8" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".35"/></g>';
    if (n === 2) return '<g fill="none" stroke="#c9971f" stroke-width="2.5"><circle cx="15" cy="-4" r="12"/><path d="M25,4 q6,10 2,22" stroke-width="1.5" stroke-dasharray="2 2"/></g>';
    if (n === 3) return '<g fill="none" stroke="#14224C" stroke-width="2.4"><circle cx="-15" cy="-4" r="12"/><circle cx="15" cy="-4" r="12"/><path d="M-3,-5 h6 M-27,-6 h-6 M27,-6 h6" stroke-linecap="round"/></g>';
    /* inktbril van De Inktvlek: donkere glazen met een spat eroverheen */
    if (n === 4) return '<g><rect x="-28" y="-14" width="24" height="18" rx="7" fill="#101c3f"/><rect x="4" y="-14" width="24" height="18" rx="7" fill="#101c3f"/><path d="M-4,-8 h8 M-28,-9 h-5 M28,-9 h5" stroke="#101c3f" stroke-width="3" stroke-linecap="round"/><path d="M-20,-11 q5,7 12,3 q-3,8 -11,5 q-6,-3 -1,-8z" fill="#1b3a8f" opacity=".85"/><circle cx="14" cy="-6" r="3.4" fill="#1b3a8f" opacity=".85"/><circle cx="21" cy="-11" r="1.8" fill="#1b3a8f" opacity=".7"/></g>';
    /* vierkante bril: een dik montuur, het glas een beetje wit */
    if (n === 5) return '<g stroke="#14224C" stroke-width="3" stroke-linejoin="round"><rect x="-28" y="-15" width="24" height="19" rx="3" fill="#fff" fill-opacity=".18"/><rect x="4" y="-15" width="24" height="19" rx="3" fill="#fff" fill-opacity=".18"/><path d="M-4,-8 h8 M-28,-9 h-5 M28,-9 h5" fill="none" stroke-linecap="round"/></g>';
    /* hartjesbril: roze hartjes als glazen */
    if (n === 6) return '<g fill="#F26D8F" stroke="#b8365a" stroke-width="2" stroke-linejoin="round"><path d="M-15,6 l-11,-11 a5.8,5.8 0 0 1 11,-6 a5.8,5.8 0 0 1 11,6 z"/><path d="M15,6 l-11,-11 a5.8,5.8 0 0 1 11,-6 a5.8,5.8 0 0 1 11,6 z"/><path d="M-4,-7 h8 M-26,-6 h-6 M26,-6 h6" fill="none" stroke-linecap="round"/></g><path d="M-21,-9 l3,-2 M9,-9 l3,-2" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/>';
    /* sterrenbril: voor een feestje, geel met donkere glazen */
    if (n === 7) return '<g stroke="#c9971f" stroke-width="1.6" stroke-linejoin="round"><path d="M-15,-19 l4.1,8.4 9.2,1.3 -6.6,6.5 1.6,9.2 -8.3,-4.4 -8.3,4.4 1.6,-9.2 -6.6,-6.5 9.2,-1.3z" fill="#FFD166"/><path d="M15,-19 l4.1,8.4 9.2,1.3 -6.6,6.5 1.6,9.2 -8.3,-4.4 -8.3,4.4 1.6,-9.2 -6.6,-6.5 9.2,-1.3z" fill="#FFD166"/></g><circle cx="-15" cy="-5" r="5.2" fill="#14224C"/><circle cx="15" cy="-5" r="5.2" fill="#14224C"/><path d="M-4,-7 h8" stroke="#c9971f" stroke-width="2.4" stroke-linecap="round"/><circle cx="-13" cy="-7" r="1.4" fill="#fff" opacity=".7"/><circle cx="17" cy="-7" r="1.4" fill="#fff" opacity=".7"/>';
    /* skibril: een band om je hoofd en een groot oranje glas */
    if (n === 8) return '<path d="M-46,-6 h92" stroke="#14224C" stroke-width="6" stroke-linecap="round"/><rect x="-31" y="-17" width="62" height="23" rx="11" fill="#EA9836" stroke="#14224C" stroke-width="3"/><path d="M-31,-6 q31,-8 62,0 v1 q-31,10 -62,0 z" fill="#F26749" opacity=".55"/><path d="M-22,-12 l8,-2 M16,-13 l6,-1" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>';
    return '';
  }
  function rand(n){
    if (n === 1) return '<circle r="46" fill="none" stroke="#FFD166" stroke-width="5"/><circle r="46" fill="none" stroke="#c9971f" stroke-width="1.5"/>';
    if (n === 2) return '<circle r="46" fill="none" stroke="#F26749" stroke-width="5" stroke-dasharray="9 5"/><circle r="46" fill="none" stroke="#EA9836" stroke-width="5" stroke-dasharray="5 9" stroke-dashoffset="9"/>';
    if (n === 3) return '<circle r="47" fill="none" stroke="#F26749" stroke-width="2.2"/><circle r="44.5" fill="none" stroke="#EA9836" stroke-width="2.2"/><circle r="42" fill="none" stroke="#FFD166" stroke-width="2.2"/><circle r="39.5" fill="none" stroke="#2f9e8f" stroke-width="2.2"/><circle r="37" fill="none" stroke="#204ECF" stroke-width="2.2"/>';
    if (n === 4) return '<circle r="46" fill="none" stroke="#83A5F2" stroke-width="5"/><circle r="46" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 11"/>';
    if (n === 5) return '<circle r="46" fill="none" stroke="#204ECF" stroke-width="3" opacity=".6"/>' + [0, 60, 120, 180, 240, 300].map(function(a){ return '<path transform="rotate(' + a + ') translate(0,-46)" d="M0,-5 l1.5,3.5 3.5,.5 -2.5,2.5 .5,3.5 -3,-1.8 -3,1.8 .5,-3.5 -2.5,-2.5 3.5,-.5z" fill="#FFD166" stroke="#c9971f" stroke-width=".8" stroke-linejoin="round"/>'; }).join('');
    /* rode streep van De Rode Pen: een halo met een doorgehaalde streep */
    if (n === 7) return '<circle r="46" fill="none" stroke="#c0442c" stroke-width="5"/><circle r="46" fill="none" stroke="#8a2416" stroke-width="1.6"/><path d="M-40,4 q40,14 80,0" fill="none" stroke="#c0442c" stroke-width="3" stroke-linecap="round" opacity=".5"/>';
    /* zwermring van De Zwerm: losse propjes rond je gezicht */
    if (n === 8) return '<circle r="46" fill="none" stroke="#7d1f12" stroke-width="2" opacity=".5"/>' + [0, 45, 90, 135, 180, 225, 270, 315].map(function(a){ return '<circle transform="rotate(' + a + ') translate(0,-46)" r="4" fill="#9b2a18" stroke="#F26749" stroke-width="1"/>'; }).join('');
    /* krijtcirkel: een streep krijt op een schoolbord, met een hand getrokken */
    if (n === 6) return '<circle r="46" fill="none" stroke="#2b4a3a" stroke-width="7"/><circle r="46" fill="none" stroke="#F3EFE9" stroke-width="3.6" stroke-dasharray="34 6" stroke-linecap="round" opacity=".95"/><circle r="46" fill="none" stroke="#F3EFE9" stroke-width="1.2" stroke-dasharray="18 22" opacity=".45" transform="rotate(9)"/>';
    /* neonring: roze met een lichtblauwe gloed erbuiten */
    if (n === 9) return '<circle r="49" fill="none" stroke="#3fe0d0" stroke-width="2" opacity=".85"/><circle r="45.5" fill="none" stroke="#ff4fa3" stroke-width="5"/><circle r="45.5" fill="none" stroke="#fff" stroke-width="1.4" opacity=".75"/>';
    /* pixelrand: blokjes, zoals in een oud spelletje */
    if (n === 10){ var kl = ['#FFD166', '#F26749', '#2f9e8f', '#204ECF']; var s = '';
      for (var i = 0; i < 24; i++) s += '<rect x="-3.2" y="-49.2" width="6.4" height="6.4" fill="' + kl[i % 4] + '" transform="rotate(' + (i * 15) + ')"/>';
      return s; }
    /* lauwerkrans: gouden blaadjes aan twee kanten, voor wie twee weken op rij oefende */
    if (n === 11){ var b = '';
      [-1, 1].forEach(function(z){ for (var j = 0; j < 7; j++){ var a = 76 - j * 19; b += '<ellipse cx="4" rx="7" ry="3.2" fill="' + (j % 2 ? '#FFD166' : '#EAB53F') + '" stroke="#b8862a" stroke-width="1" transform="scale(' + z + ',1) rotate(' + a + ') translate(46,0) rotate(' + (j % 2 ? -125 : -55) + ')"/>'; } });
      return '<path d="M-8,45.3 A46,46 0 0 1 -35,-29.6 M8,45.3 A46,46 0 0 0 35,-29.6" fill="none" stroke="#b8862a" stroke-width="2.2" stroke-linecap="round"/>' + b + '<path d="M-7,48 l7,-5 7,5" fill="none" stroke="#c0442c" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>'; }
    return '';
  }
  function f(v){ return String(Math.round(v * 100) / 100); }
  function klem(v, a, b){ return v < a ? a : v > b ? b : v; }
  function esc(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function ster(cx, cy, r, kleur, lijn){
    var d = '';
    for (var i = 0; i < 10; i++){ var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + f1(cx + Math.cos(a) * rr) + ',' + f1(cy + Math.sin(a) * rr); }
    return '<path d="' + d + 'Z" fill="' + kleur + '"' + (lijn ? ' stroke="' + lijn + '" stroke-width="1.6" stroke-linejoin="round"' : '') + '/>';
  }

  /* Alles wat vastligt voor een naam en spec: kleur, vorm, ogen, mond, extra.
     Let op: de volgorde van de trekkingen hieronder is heilig, anders krijgt iedereen zonder
     eigen keuze ineens een ander gezichtje. Nieuwe dingen trekken niets uit r(). */
  var modellen = {}, aantalModellen = 0;
  var LEEG = { v:0, k:0, o:0, m:0, e:0, c:0, x:0, w:0, h:0, r:0, z:0, b:0, a:0, q:0, f:0 };
  function model(naam, spec){
    var sleutel = (spec || '') + '|' + String(naam || '').toLowerCase().trim();
    if (modellen[sleutel]) return modellen[sleutel];
    var sp = ontleed(spec);
    var r = toeval(sp ? 7919 * (sp.v + 1) + 17 : hash(naam));
    var kleur = KLEUREN[Math.floor(r() * KLEUREN.length)];
    if (sp) kleur = sp.c ? KLEUREN2[(sp.c - 1) % KLEUREN2.length] : KLEUREN[sp.k % KLEUREN.length];
    var helder = licht(kleur), donker = sp && sp.c ? helder < 0.5 : !!DONKER[kleur];
    var draai = +(r() * 16 - 8).toFixed(1);
    var vorm = blob(r, 46);
    var soort = Math.floor(r() * 5), kijk = (r() - 0.5) * 5, mond = Math.floor(r() * 4), extra = Math.floor(r() * 6);
    if (sp){ soort = sp.o % KEUZES.ogen; mond = sp.m % 10; extra = sp.e % 10; }
    /* een bril uit de winkel over de getekende bril heen is er een te veel: dan gewone ogen */
    if (sp && sp.q && soort === 3) soort = 0;
    var v = sp ? sp.v % KEUZES.vormen : 0;
    if (VORMEN[v]){ vorm = glad(VORMEN[v]()); draai = +(draai * (v === 10 ? 1.6 : .5)).toFixed(1); }
    var P = draaiPunten(vorm.pts, draai), M = maten(P), breed = 0;
    P.forEach(function(q){ if (Math.abs(q[0]) > breed) breed = Math.abs(q[0]); });
    if (sp && sp.h && extra === 2) extra = -1;   /* een krul past niet onder een hoed */
    var zaad = hash((spec || '') + '|' + (naam || ''));
    if (aantalModellen > 300){ modellen = {}; aantalModellen = 0; }
    aantalModellen++;
    return (modellen[sleutel] = { kleur:kleur, helder:helder, donker:donker, draai:draai, d:vorm.d, M:M, bol:50 * klem(breed / 45, .8, 1.05),
      ogen:soort, kijk:kijk, mond:mond, extra:extra, sp:sp || LEEG, zaad:zaad, d1:(zaad % 340) / 100, d2:((zaad >>> 8) % 460) / 100 });
  }

  /* De stand van een gezichtje: waar het hoofd heen kijkt (yaw en pitch in graden), de ogen (gx, gy),
     hoe open ze zijn, het ooglid (trots), en een sprongetje (hop, sq). */
  function nulStaat(){ return { yaw:0, pitch:0, roll:0, gx:0, gy:0, open:1, lid:0, hop:0, sq:0 }; }
  /* wat een stemming met het hoofd doet */
  function stemDoel(s, d, t){
    if (s === 'sip'){ d.pitch += 12; d.gy = .8; d.open = Math.min(d.open, .85); d.yaw *= .5; }
    else if (s === 'trots'){ d.pitch -= 9; d.lid = .42; d.gy = -.3; }
    else if (s === 'denkt'){ d.yaw = 15; d.pitch = -9; d.gx = .9; d.gy = -.9; }
    else if (s === 'slaapt'){ d.pitch = 10; d.yaw *= .3; d.roll = 6 + (t ? 2 * Math.sin(t * .8) : 0); }
    else if (s === 'oeps') d.pitch -= 3;
    return d;
  }
  /* stil: elk gezichtje kijkt een eigen kant op, uit de naam; kijk:[x,y] kiest zelf */
  function rustStaat(m, stemming, kijk){
    var st = nulStaat();
    if (kijk){ st.yaw = klem(+kijk[0] || 0, -1, 1) * 22; st.pitch = klem(+kijk[1] || 0, -1, 1) * 14; st.gx = klem(+kijk[0] || 0, -1, 1); st.gy = klem(+kijk[1] || 0, -1, 1); }
    else { st.yaw = ((m.zaad % 19) - 9) * 1.5; st.pitch = (((m.zaad >>> 5) % 9) - 4) * 1.2; st.gx = st.yaw / 16; st.gy = st.pitch / 12; }
    stemDoel(stemming || '', st, 0);
    st.stemming = stemming || '';
    return st;
  }

  /* De tekening. leeft: zonder de css-beweging (dan doet avatar.js het zelf, per beeldje).
     maat: hoe groot hij op het scherm komt, voor de dikte van de lichte rand. */
  function teken(m, st, id, leeft, schaduw, maat){
    var sp = m.sp, stm = st.stemming || '', M = m.M;
    var Rf = m.bol, ya = st.yaw * Math.PI / 180, pa = st.pitch * Math.PI / 180, cy = Math.cos(ya), sy = Math.sin(ya), cp = Math.cos(pa), sn = Math.sin(pa);
    function rot(x, y, z){ var x1 = x * cy + z * sy, z1 = -x * sy + z * cy; return [x1, y * cp + z1 * sn, -y * sn + z1 * cp]; }
    function nrm(x, y, z){ var l = Math.sqrt(x * x + y * y + z * z) || 1; return rot(x / l, y / l, z / l); }
    /* een stukje gezicht op (x,y) ligt op de bol: het schuift mee en wordt smaller aan de rand */
    function stuk(x, y, inner){
      if (!inner) return '';
      var z = Math.sqrt(Math.max(Rf * Rf - x * x - y * y, 4)), P = rot(x, y, z), TX = nrm(1, 0, -x / z), TY = nrm(0, 1, -y / z);
      var o = klem((rot(x / Rf, y / Rf, z / Rf)[2] - .15) / .3, 0, 1);
      if (o <= 0) return '';
      return '<g transform="matrix(' + [TX[0], TX[1], TY[0], TY[1], P[0], P[1]].map(f).join(',') + ')"' + (o < 1 ? ' opacity="' + f(o) + '"' : '') + '>' + inner + '</g>';
    }
    var kleur = m.kleur, oog = m.donker ? '#fff' : INKT, pupil = INKT, lidK = m.donker ? '#fff' : INKT;
    /* de mond is donker, behalve op een heel donker gezicht: daar zag je hem niet */
    var mondK = m.helder < 0.22 ? '#F3EFE9' : INKT, blos = m.helder > 0.55 ? '#F26749' : '#FF8FA3';
    var rim = Math.max(1.6, Math.min(6, 120 / (maat || 100)));
    var pk = leeft ? '' : ' class="av-pupil"';
    var soort = m.ogen;
    if (stm === 'blij') soort = 1; else if (stm === 'au') soort = 'au'; else if (stm === 'oeps') soort = 'oeps'; else if (stm === 'slaapt') soort = 8;
    var px = klem(st.gx * 2.6 + m.kijk * .8, -4, 4), py = klem(st.gy * 2.4, -3, 3);
    function lijn(d, kl, w){ return '<path d="' + d + '" fill="none" stroke="' + kl + '" stroke-width="' + (w || 4.5) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
    /* het ooglid: trots doet hem half dicht, cool heeft hem altijd half dicht */
    var lid = Math.max(st.lid, soort === 5 ? .667 : 0), lidId = id + 'l' + Math.round(lid * 20);
    function eenOog(k){
      if (soort === 1) return lijn('M-7,1 q7,-9 14,0', oog);
      if (soort === 'au') return lijn(k < 0 ? 'M-8,-7 L3,0 L-8,7' : 'M8,-7 L-3,0 L8,7', oog);
      if (soort === 8) return lijn('M-7,-1 q7,7 14,0', oog);
      if (soort === 2 && k > 0) return lijn('M-7,0 q7,-7 14,0', oog);
      if (soort === 7) return '<g transform="translate(' + f(px * .4) + ',' + f(py * .4) + ')">' + ster(0, 0, 11, '#FFD166', INKT) + '</g>';
      var s, ring = '', r0 = 8;
      if (soort === 10){ r0 = 9.5; s = '<rect' + pk + ' x="' + f(-4.6 + px * .7) + '" y="' + f(-9.5 + py * .7) + '" width="9.2" height="19" rx="4.6" fill="' + mondK + '"/><ellipse' + pk + ' cx="' + f(-1.6 + px * .7) + '" cy="' + f(-4.4 + py * .7) + '" rx="1.5" ry="2.6" fill="#fff" opacity=".55"/>'; }
      else if (soort === 4){ r0 = 10; s = '<circle r="10" fill="' + oog + '"/><circle' + pk + ' cx="' + f(px) + '" cy="' + f(py + 1) + '" r="5" fill="' + pupil + '"/><circle' + pk + ' cx="' + f(px + 2) + '" cy="' + f(py - 1) + '" r="1.6" fill="#fff"/>'; }
      else if (soort === 3){ r0 = 11; s = '<circle r="11" fill="' + oog + '" opacity=".95"/><circle' + pk + ' cx="' + f(px) + '" cy="' + f(py + 1) + '" r="4" fill="' + pupil + '"/>'; ring = '<circle r="11" fill="none" stroke="' + pupil + '" stroke-width="3"/>'; }
      else if (soort === 'oeps' || soort === 6){ r0 = 11; s = '<circle r="11" fill="' + oog + '"/><circle' + pk + ' cx="' + f(px * .8) + '" cy="' + f(py * .8 + 1) + '" r="4.2" fill="' + pupil + '"/><circle' + pk + ' cx="' + f(px * .8 + 1.6) + '" cy="' + f(py * .8 - .6) + '" r="1.3" fill="#fff"/>'; }
      else if (soort === 5) s = '<circle r="8" fill="' + oog + '"/><circle' + pk + ' cx="' + f(px * .6) + '" cy="' + f(py + 2.5) + '" r="4" fill="' + pupil + '"/>';
      else if (soort === 9){ r0 = 7.5; s = '<circle r="7.5" fill="' + oog + '"/><circle' + pk + ' cx="' + f(px * .6) + '" cy="' + f(py + 1) + '" r="4" fill="' + pupil + '"/>'; }
      else s = '<circle r="8" fill="' + oog + '"/><circle' + pk + ' cx="' + f(px) + '" cy="' + f(py + 1) + '" r="4" fill="' + pupil + '"/>';
      var g = st.open < .99 ? '<g transform="scale(1,' + f(klem(st.open, .06, 1)) + ')">' + s + '</g>' : s;
      if (lid > .03){
        var cut = -12 + lid * 18;
        g = '<g clip-path="url(#' + lidId + ')">' + g + '</g>';
        if (soort !== 10) g += lijn('M' + f(-r0 - 1) + ',' + f(cut) + ' h' + f(2 * r0 + 2), lidK, soort === 5 ? 3.2 : 2.4);
      }
      return g + ring;
    }
    function wenkbrauw(k){
      var d = '', w = 3.4;
      if (stm === 'sip') d = k < 0 ? 'M-9,-12 L7,-16' : 'M9,-12 L-7,-16';
      else if (stm === 'denkt') d = k < 0 ? 'M-8,-14 q8,-3 15,0' : 'M-8,-19 q8,-6 15,-1';
      else if (stm === 'au') d = k < 0 ? 'M-9,-15 L7,-11' : 'M9,-15 L-7,-11';
      else if (soort === 'oeps' || soort === 6){ d = k < 0 ? 'M-11,-16 q10,-10 21,-4' : 'M-9,-20 q10,-5 20,3'; w = 3.6; }
      else if (soort === 9){ d = k < 0 ? 'M-10,-14 l14,5' : 'M10,-14 l-14,5'; w = 4; }
      return d ? lijn(d, lidK, w) : '';
    }
    var mnd = m.mond;
    if (stm === 'blij') mnd = 3; else if (stm === 'au') mnd = 1; else if (stm === 'sip') mnd = 'sip'; else if (stm === 'oeps') mnd = 'oeps';
    else if (stm === 'trots') mnd = 'trots'; else if (stm === 'denkt') mnd = 'denkt'; else if (stm === 'slaapt') mnd = 'slaapt';
    var mlijn = '" fill="none" stroke="' + mondK + '" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>';
    var mondSvg;
    if (mnd === 'oeps') mondSvg = '<ellipse cx="3" cy="17" rx="5" ry="6.5" fill="' + mondK + '"/>';
    else if (mnd === 0) mondSvg = '<path d="M-10,12 q10,10 20,0' + mlijn;
    else if (mnd === 1) mondSvg = '<circle cx="0" cy="14" r="4.5" fill="' + mondK + '"/>';
    else if (mnd === 2) mondSvg = '<path d="M-7,13 h14' + mlijn;
    else if (mnd === 'sip') mondSvg = '<path d="M-10,17 q10,-9 20,0' + mlijn;
    else if (mnd === 'trots') mondSvg = '<path d="M-9,13 q9,7 18,-3' + mlijn;
    else if (mnd === 'denkt') mondSvg = '<path d="M-3,15 q5,-2 10,1' + mlijn;
    else if (mnd === 'slaapt') mondSvg = '<ellipse cx="2" cy="15" rx="3" ry="3.6" fill="' + mondK + '"/>';
    else if (mnd === 4) mondSvg = '<path d="M-11,11 q11,10 22,0' + mlijn + '<path d="M1,15.5 h9 v4 a4.5,4.5 0 0 1 -9,0 z" fill="#F47A8A" stroke="' + mondK + '" stroke-width="2" stroke-linejoin="round"/><path d="M5.5,16 v4" stroke="#c0442c" stroke-width="1.2" stroke-linecap="round"/>';
    else if (mnd === 5) mondSvg = '<path d="M-13,9 h26 q0,14 -13,14 q-13,0 -13,-14 z" fill="' + mondK + '"/><path d="M-11,10.5 h22 q0,3 -1,4.5 h-20 q-1,-1.5 -1,-4.5 z" fill="#fff"/>';
    else if (mnd === 6) mondSvg = '<path d="M-10,15 q10,5 18,-5' + mlijn + '<path d="M8,10 l3,-1" stroke="' + mondK + '" stroke-width="3" stroke-linecap="round"/>';
    else if (mnd === 7) mondSvg = '<ellipse cx="0" cy="15" rx="5.5" ry="7" fill="' + mondK + '"/><ellipse cx="0" cy="18" rx="3" ry="2.4" fill="#F26749" opacity=".9"/>';
    else if (mnd === 8) mondSvg = '<path d="M-10,12 q5,6 10,0 q5,6 10,0' + mlijn;
    else if (mnd === 9) mondSvg = '<path d="M-13,9 h26 q0,14 -13,14 q-13,0 -13,-14 z" fill="' + mondK + '"/><path d="M-11,10.5 h22 q0,3.5 -1,5 h-20 q-1,-1.5 -1,-5 z" fill="#fff"/><path d="M-10.5,13 h21" stroke="#8f9db0" stroke-width="1.4"/><g fill="#8f9db0"><rect x="-8" y="11.5" width="3" height="3" rx=".6"/><rect x="-1.5" y="11.5" width="3" height="3" rx=".6"/><rect x="5" y="11.5" width="3" height="3" rx=".6"/></g>';
    else mondSvg = '<path d="M-12,10 h24 q0,13 -12,13 q-12,0 -12,-13 z" fill="' + mondK + '"/><path d="M-6,19.5 q6,-5 12,0 q-2,3.2 -6,3.2 q-4,0 -6,-3.2 z" fill="#F26749"/>';

    /* figuren achter het hoofd: ze zitten vast aan het lijf en draaien mee */
    var achter = '', lichter = meng(kleur, '#ffffff', .3), donkerder = meng(kleur, '#000000', .2);
    function bol(x, y, z, r, kl, plat){ var P = rot(x, y, z), c = '<circle cx="' + f(P[0]) + '" cy="' + f(P[1]) + '" r="' + r + '" fill="'; return c + kl + '"/>' + (plat ? '' : c + 'url(#' + id + 's)"/>'); }
    function vlakje(pts, kl, w){ return '<path d="M' + pts.map(function(q){ var P = rot(q[0], q[1], q[2]); return f(P[0]) + ',' + f(P[1]); }).join(' L') + 'Z" fill="' + kl + '" stroke="' + kl + '" stroke-width="' + w + '" stroke-linejoin="round"/>'; }
    var fig = sp.f;
    if (fig === 1) [-1, 1].forEach(function(k){ achter += bol(k * 31, -33, -4, 14, kleur) + bol(k * 32, -34, 2, 7.5, lichter, 1); });
    else if (fig === 2) for (var i = 0; i < 10; i++){ var an = i / 10 * Math.PI * 2 + .3; achter += bol(Math.cos(an) * 51, Math.sin(an) * 51, -14, 11, lichter); }
    else if (fig === 3) [[-40, 8, -6, 17], [40, 4, -6, 16], [-26, -32, -8, 17], [8, -44, -10, 16], [32, -26, -8, 13]].forEach(function(q){ achter += bol(q[0], q[1], q[2], q[3], kleur); });
    else if (fig === 4) [-1, 1].forEach(function(k){ var A = rot(k * 10, -38, 10), B = rot(k * 24, -66, -2); achter += '<path d="M' + f(A[0]) + ',' + f(A[1]) + ' Q' + f((A[0] + B[0]) / 2 + k * 6) + ',' + f((A[1] + B[1]) / 2) + ' ' + f(B[0]) + ',' + f(B[1]) + '" fill="none" stroke="' + donkerder + '" stroke-width="3.4" stroke-linecap="round"/>' + bol(k * 24, -66, -2, 6, '#FFD166', 1); });
    else if (fig === 5) achter += bol(0, -47, -10, 15, donkerder) + bol(0, -37, -4, 7, donkerder, 1);
    else if (fig === 6) [-1, 1].forEach(function(k){ achter += vlakje([[k * 38, -16, -6], [k * 32, -60, -10], [k * 6, -40, -4]], kleur, 7) + vlakje([[k * 31, -26, -3], [k * 29, -50, -7], [k * 14, -38, -2]], '#F6B8C6', 3); });

    /* het gezicht */
    var ogen = '', rest = '';
    var ey = (soort === 3 || soort === 4 || soort === 5 || soort === 7 || soort === 'au') ? -4 : soort === 9 ? -3 : -5;
    [-1, 1].forEach(function(k){ ogen += stuk(k * 15, ey, eenOog(k)); rest += stuk(k * 15, ey, wenkbrauw(k)); });
    if (soort === 3) rest += stuk(0, -4, lijn('M-4,0 h8', pupil, 3));
    if (sp.q) rest += stuk(0, -4, '<g transform="translate(0,4)">' + bril(sp.q) + '</g>');
    rest += stuk(0, 13, '<g transform="translate(0,-13)">' + mondSvg + '</g>');
    var e = m.extra;
    if (e === 0 || stm === 'oeps' || stm === 'blij') [-1, 1].forEach(function(k){ rest += stuk(k * 26, 8, '<circle r="5" fill="' + (e === 0 ? blos : '#F26749') + '" opacity=".5"/>'); });
    if (e === 1) [-1, 1].forEach(function(k){ rest += stuk(k * 26, 9, '<g fill="' + oog + '" opacity=".7"><circle cx="' + k + '" cy="-3" r="1.6"/><circle cx="' + (-4 * k) + '" cy="1" r="1.6"/><circle cx="' + (4 * k) + '" cy="3" r="1.6"/></g>'); });
    /* Hier zat ooit een gratis petje. Nu er echte hoeden in de winkel liggen, is dat er een te veel; de plek blijft
       bestaan (anders verandert het gezichtje van iedereen die deze extra koos) en er ligt nu een pleister. */
    else if (e === 3) rest += stuk(19, -22, '<g transform="rotate(-16)"><rect x="-11.5" y="-5" width="23" height="10" rx="3" fill="#F6D9B0" stroke="#c99f6e" stroke-width="1.2"/><g fill="#c99f6e"><circle cx="-5.5" cy="-2" r="1"/><circle cx="-5.5" cy="2" r="1"/><circle cx="5.5" cy="-2" r="1"/><circle cx="5.5" cy="2" r="1"/></g></g>');
    else if (e === 4) rest += stuk(30, -22, '<path transform="translate(-30,-22)" d="M30,-30 l3,7 7,1 -5,5 1,7 -6,-4 -6,4 1,-7 -5,-5 7,-1z" fill="#FFD166" stroke="#c9971f" stroke-width="1" stroke-linejoin="round"/>');
    else if (e === 6) rest += stuk(30, -18, '<g transform="translate(-30,-18)"><path d="M30,-27 q9,12 0,19 q-9,-7 0,-19 z" fill="#9EC3FF" stroke="#14224C" stroke-width="1.4" stroke-opacity=".5"/><path d="M27.5,-14 q-1,-3 .5,-5.5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".85"/></g>');
    else if (e === 7) rest += stuk(0, 7, '<path transform="translate(0,-7)" d="M0,7 q-5,-4 -11,-1.5 q-4,1.5 -7,-1 q3,7 11,5 q4,-1 7,-3 q3,2 7,3 q8,2 11,-5 q-3,2.5 -7,1 q-6,-2.5 -11,1.5 z" fill="#3a2519" stroke="' + (m.helder < 0.3 ? 'rgba(255,255,255,.5)' : 'none') + '" stroke-width="1"/>');
    else if (e === 9) rest += stuk(20, 11, '<circle r="2.5" fill="' + (m.helder < 0.3 ? '#F3EFE9' : INKT) + '" opacity=".85"/>');

    /* los in beeld, niet op de bol: glinsters, het zweetdruppeltje van oeps, zzz en een denkwolkje */
    var los = '';
    if (e === 8) los += '<g fill="#FFD166" stroke="#c9971f" stroke-width=".8" stroke-linejoin="round"><path d="M-34,-30 q1.5,5 6,6 q-4.5,1 -6,6 q-1.5,-5 -6,-6 q4.5,-1 6,-6z"/><path d="M36,14 q1,3.5 4,4 q-3,1 -4,4 q-1,-3 -4,-4 q3,-.5 4,-4z"/><path d="M-38,14 q.8,2.6 3,3 q-2.2,.6 -3,3 q-.8,-2.4 -3,-3 q2.2,-.4 3,-3z"/></g>';
    if (stm === 'oeps') los += '<path d="M37,-27 q6,9 0,13 q-6,-4 0,-13 z" fill="#83A5F2" stroke="#14224C" stroke-width="1.2" stroke-opacity=".35"/>';
    if (stm === 'slaapt') los += '<g fill="currentColor" font-family="Poppins,system-ui,sans-serif" font-weight="700"><text x="34" y="-34" font-size="13" opacity=".7">z</text><text x="44" y="-46" font-size="9" opacity=".45">z</text></g>';
    if (stm === 'denkt') los += '<g fill="currentColor" opacity=".45"><circle cx="36" cy="-38" r="2.6"/><circle cx="43" cy="-46" r="3.4"/><circle cx="52" cy="-55" r="4.4"/></g>';

    /* het licht glijdt een klein beetje mee als het hoofd draait */
    var lx = .34 - st.yaw / 320, ly = .28 - st.pitch / 320;
    var s = '<defs><clipPath id="' + id + 'k"><path transform="rotate(' + m.draai + ')" d="' + m.d + '"/></clipPath>' +
      (lid > .03 ? '<clipPath id="' + lidId + '"><rect x="-16" y="' + f(-12 + lid * 18) + '" width="32" height="40"/></clipPath>' : '') +
      '<radialGradient id="' + id + 'g" cx="' + f(lx) + '" cy="' + f(ly) + '" r=".62"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 's" cx=".42" cy=".36" r=".8"><stop offset=".52" stop-color="#0b1433" stop-opacity="0"/><stop offset="1" stop-color="#0b1433" stop-opacity=".22"/></radialGradient></defs>';
    if (sp.a) s += achtergrond(sp.a);
    if (schaduw) s += '<ellipse cx="0" cy="52" rx="' + f(30 * (1 + st.hop / 60)) + '" ry="4.5" fill="currentColor" opacity="' + f(.13 * (1 + st.hop / 40)) + '"/>';
    var beweeg = (st.hop || st.roll || st.sq) ? ' transform="translate(0,' + f(st.hop) + ') rotate(' + f(st.roll) + ') translate(0,46) scale(' + f(1 - st.sq) + ',' + f(1 + st.sq) + ') translate(0,-46)"' : '';
    var adem = leeft ? '' : ' class="av-alles" style="animation-delay:-' + m.d1 + 's"';
    s += '<g' + adem + '><g' + beweeg + '><g transform="rotate(' + m.draai + ')">' + achter;
    /* alleen een heel donker gezicht krijgt een lichte rand, anders valt het weg op een donkere pagina */
    if (m.helder < 0.3) s += '<path d="' + m.d + '" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="' + f1(rim * 2) + '" stroke-linejoin="round"/>';
    s += '<path d="' + m.d + '" fill="' + kleur + '"/><path d="' + m.d + '" fill="url(#' + id + 's)"/><path d="' + m.d + '" fill="url(#' + id + 'g)"/></g>';
    s += '<g clip-path="url(#' + id + 'k)">' + (leeft ? ogen : '<g class="av-ogen" style="animation-delay:-' + m.d2 + 's">' + ogen + '</g>') + rest + '</g>' + los + '</g></g>';
    /* uit de winkel: eerst de rand (hij ligt om het gezicht), dan de hoed of de krul op de kruin */
    if (sp.r) s += rand(sp.r);
    var hd = sp.h ? hoed(sp.h) : '';
    if (hd || e === 2){
      var T = rot(0, -44, 14), plek = 'translate(' + f(T[0]) + ',' + f(T[1] + 44) + ') rotate(' + f(st.yaw * .3) + ',0,' + f(M.top) + ')';
      var op = hd ? '<g transform="' + hoedPlek(M, 0, 1) + '"><g class="av-hoed">' + halo(hd, rim * 2) + hd + '</g></g>'
                  : '<path d="M2,' + f1(M.top + 3) + ' q4,-12 14,-6 q-8,-2 -10,6" fill="none" stroke="' + meng(kleur, INKT, 0.25) + '" stroke-width="5" stroke-linecap="round"/>';
      s += '<g' + adem + '><g' + beweeg + '><g transform="' + plek + '">' + op + '</g></g></g>';
    }
    if (sp.b) s += trofee(sp.b);
    return s;
  }

  function nieuwId(){ teller = (teller + 1) % 1e9; return 'av' + teller.toString(36) + '_'; }
  function kop(naam, spec, maat, klasse, extra){
    return '<svg class="avatar' + (klasse ? ' ' + klasse : '') + '" viewBox="-50 -50 100 100" overflow="visible" width="' + maat + '" height="' + maat + '" aria-hidden="true" focusable="false" data-an="' + esc(naam) + '" data-as="' + esc(spec) + '"' + (extra || '') + '>';
  }
  /* opties.stemming: '' (gewoon), 'au' (net geraakt), 'blij' (goed gedaan), 'sip' (jammer), 'oeps' (betrapt: grote ogen, o-mondje),
     'trots' (gewonnen), 'denkt' (een vraag loopt) of 'slaapt' (wachten); de spellen kiezen die per moment.
     opties.klasse: extra klasse op de svg, zoals 'av-juich' voor een sprongetje.
     opties.kijk: [x, y] van -1 tot 1, de kant die het hoofd op kijkt.
     opties.leef: true of een sleutel; opties.volg: hoe sterk het hoofd de muis of vinger volgt (0 tot 1). */
  function svg(naam, maat, spec, opties){
    maat = maat || 32; opties = opties || {};
    var m = model(naam, spec), stemming = opties.stemming || '', extra = stemming ? ' data-st="' + esc(stemming) + '"' : '';
    if (opties.leef){
      extra += ' data-leef="' + esc(opties.leef === true ? '1' : opties.leef) + '"' +
        (opties.volg != null ? ' data-volg="' + (+opties.volg) + '"' : '') + (opties.kijk ? ' data-kijk="' + (+opties.kijk[0] || 0) + ',' + (+opties.kijk[1] || 0) + '"' : '');
      wacht();
    }
    return kop(naam, spec, maat, opties.klasse, extra) + teken(m, rustStaat(m, stemming, opties.kijk), nieuwId(), false, false, maat) + '</svg>';
  }
  var cache = {}, aantalCache = 0;
  /* de binnenkant (viewBox -50..50), voor wie hem in een eigen svg tekent, zoals de arena van Zwaardvechter;
     kijk: [x, y], de kant die het hoofd op kijkt (daar mikt de speler) */
  function inhoud(naam, spec, stemming, kijk){
    var sleutel = (spec || '') + '|' + String(naam || '').toLowerCase().trim() + '|' + (stemming || '') + '|' + (kijk ? kijk.join(',') : '');
    if (cache[sleutel]) return cache[sleutel];
    if (aantalCache > 300){ cache = {}; aantalCache = 0; }
    aantalCache++;
    var m = model(naam, spec);
    return (cache[sleutel] = teken(m, rustStaat(m, stemming, kijk), nieuwId(), false, false, 100));
  }
  function vul(root){
    Array.prototype.forEach.call((root || document).querySelectorAll('[data-avatar]'), function(el){
      el.innerHTML = svg(el.getAttribute('data-avatar'), +el.getAttribute('data-maat') || 32, el.getAttribute('data-spec') || '');
    });
  }
  /* ---------- leven ----------
     Een levend gezichtje wordt elk beeldje opnieuw getekend: het hoofd drijft een
     beetje, volgt de muis of vinger, de ogen knipperen en kijken rond, en een
     stemming veert erin. Eén lus voor de hele pagina, alleen voor wat in beeld is.
     Wie minder beweging wil, krijgt een stil gezichtje dat wel van stemming wisselt. */
  var rustig = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LEVEND = [], BEWAARD = {}, loopt = false, vorige = 0, muis = { x:0, y:0, aan:false, t:0 }, muisAan = false;
  var io = typeof IntersectionObserver === 'function' ? new IntersectionObserver(function(es){
    es.forEach(function(e){ for (var i = 0; i < LEVEND.length; i++) if (LEVEND[i].el === e.target) LEVEND[i].zicht = e.isIntersecting; });
  }) : null;
  function leef(el, opties){
    if (!el || typeof document === 'undefined') return null;
    opties = opties || {};
    var sv = el.tagName && el.tagName.toLowerCase() === 'svg' ? el : null;
    if (!sv){
      el.innerHTML = svg(opties.naam || '', opties.maat || 120, opties.spec || '', { stemming:opties.stemming, kijk:opties.kijk });
      sv = el.querySelector('svg');
    }
    for (var i = 0; i < LEVEND.length; i++) if (LEVEND[i].el === sv){ stel(LEVEND[i], opties); return LEVEND[i].api; }
    var naam = opties.naam != null ? opties.naam : sv.getAttribute('data-an') || '', spec = opties.spec != null ? opties.spec : sv.getAttribute('data-as') || '';
    var m = model(naam, spec), nu = performance.now() / 1000, stemming = opties.stemming != null ? opties.stemming : sv.getAttribute('data-st') || '';
    if (opties.kijk === undefined && sv.getAttribute('data-kijk')) opties.kijk = sv.getAttribute('data-kijk').split(',').map(Number);
    var a = { el:sv, m:m, st:rustStaat(m, stemming, opties.kijk), v:nulStaat(), stemming:stemming, volg:opties.volg == null ? .5 : +opties.volg,
      kijk:opties.kijk || null, sleutel:opties.sleutel || '', fase:(m.zaad % 1000) / 10, knip:nu + .6 + Math.random() * 3, dichtTot:0,
      sac:nu + Math.random() * 2, sacDoel:[0, 0], juichElke:0, volgendJuich:0, sinds:nu, laatst:0, zicht:true, schaduw:!!opties.schaduw, id:nieuwId(), klein:0, sig:'' };
    /* hetzelfde gezichtje, net opnieuw in de pagina gezet: gewoon doorgaan */
    var oud = null;
    if (a.sleutel){
      for (var j = 0; j < LEVEND.length; j++) if (LEVEND[j].sleutel === a.sleutel){ oud = LEVEND[j]; LEVEND.splice(j, 1); break; }
      if (!oud && BEWAARD[a.sleutel] && nu - BEWAARD[a.sleutel].t < 30) oud = BEWAARD[a.sleutel];
    }
    if (oud && oud.m === m){
      a.st = oud.st; a.v = oud.v; a.knip = oud.knip; a.sac = oud.sac; a.sacDoel = oud.sacDoel; a.juichElke = oud.juichElke; a.volgendJuich = oud.volgendJuich;
      a.sinds = oud.stemming === stemming ? oud.sinds : nu;
      if (oud.stemming !== stemming) opwinding(a, stemming);
    } else opwinding(a, stemming);
    sv.setAttribute('data-lv', '1');
    a.api = {
      zet:function(s){ s = s || ''; if (s !== a.stemming){ a.stemming = s; a.sinds = performance.now() / 1000; opwinding(a, s); } return a.api; },
      juich:function(kracht){ a.v.hop = -(kracht || 150); return a.api; },
      juichElke:function(sec){ a.juichElke = sec || 0; a.volgendJuich = 0; return a.api; },
      kijk:function(xy){ a.kijk = xy || null; return a.api; },
      volg:function(w){ a.volg = +w || 0; return a.api; }
    };
    stel(a, opties);
    LEVEND.push(a);
    if (io) io.observe(sv);
    if (!muisAan && typeof addEventListener === 'function'){
      muisAan = true;
      addEventListener('pointermove', function(e){ muis.x = e.clientX; muis.y = e.clientY; muis.aan = true; muis.t = performance.now() / 1000; }, { passive:true });
      addEventListener('pointerdown', function(e){ muis.x = e.clientX; muis.y = e.clientY; muis.aan = true; muis.t = performance.now() / 1000; }, { passive:true });
    }
    if (!loopt){ loopt = true; requestAnimationFrame(stap); }
    return a.api;
  }
  function stel(a, o){
    if (o.volg != null) a.volg = +o.volg;
    if (o.kijk !== undefined) a.kijk = o.kijk;
    if (o.juichElke) a.juichElke = o.juichElke;
    if (o.stemming != null && o.stemming !== a.stemming){ a.stemming = o.stemming; a.sinds = performance.now() / 1000; opwinding(a, o.stemming); }
  }
  /* een nieuwe stemming krijgt een duwtje: een sprongetje bij blij, een schrikje bij oeps */
  function opwinding(a, s){ if (s === 'blij' || s === 'trots') a.v.hop = -130; else if (s === 'oeps') a.v.hop = -70; }
  function veer(a, p, doel, k, c, dt){ a.v[p] += ((doel - a.st[p]) * k - a.v[p] * c) * dt; a.st[p] += a.v[p] * dt; }
  function stap(nu){
    var t = nu / 1000, dt = Math.min(.05, t - (vorige || t)); vorige = t;
    if (muis.aan && t - muis.t > 3) muis.aan = false;
    for (var i = LEVEND.length - 1; i >= 0; i--){
      var a = LEVEND[i];
      if (!a.el.isConnected){
        LEVEND.splice(i, 1); if (io) io.unobserve(a.el);
        if (a.sleutel){ a.t = t; BEWAARD[a.sleutel] = a; }
        continue;
      }
      if (!a.zicht) continue;
      var d = { yaw:0, pitch:0, roll:0, gx:a.sacDoel[0], gy:a.sacDoel[1], open:1, lid:0 };
      if (!rustig){
        d.yaw = 7 * Math.sin(t * .35 + a.fase) + 3 * Math.sin(t * .9 + a.fase * 2); d.pitch = 4 * Math.sin(t * .27 + a.fase * 3); d.roll = 1.6 * Math.sin(t * .41 + a.fase);
        if (t > a.sac){ a.sac = t + .7 + Math.random() * 2.6; a.sacDoel = [(Math.random() - .5) * 1.2, (Math.random() - .5) * .8]; }
      } else { d.gx = d.gy = 0; }
      if (a.kijk){
        var kx = klem(+a.kijk[0] || 0, -1, 1), ky = klem(+a.kijk[1] || 0, -1, 1);
        d.yaw = kx * 22 + d.yaw * .3; d.pitch = ky * 14 + d.pitch * .3; d.gx = kx; d.gy = ky;
      } else if (muis.aan && a.volg > 0){
        var r = a.el.getBoundingClientRect(), dx = muis.x - (r.left + r.width / 2), dy = muis.y - (r.top + r.height / 2), dist = Math.sqrt(dx * dx + dy * dy) || 1, w = a.volg;
        d.yaw = d.yaw * (1 - w) + klem(dx / (r.width * 1.4 + 220) * 30, -22, 22) * w;
        d.pitch = d.pitch * (1 - w) + klem(dy / (r.height * 1.4 + 220) * 22, -16, 16) * w;
        var bereik = Math.min(1, dist / Math.max(60, r.width));
        d.gx = dx / dist * bereik; d.gy = dy / dist * bereik;
      }
      stemDoel(a.stemming, d, t);
      if (a.stemming === 'au' && !rustig) d.roll += Math.sin(t * 38) * 4 * Math.max(0, 1 - (t - a.sinds) / .6);
      if (!rustig){
        if (t > a.knip){ a.knip = t + 2.2 + Math.random() * 4; a.dichtTot = t + .13; if (Math.random() < .18) a.knip = t + .32; }
        if (t < a.dichtTot) d.open = .05;
        if (a.juichElke && t > a.volgendJuich){ a.volgendJuich = t + a.juichElke; a.v.hop = -150; }
        var n = Math.ceil(dt / .008), h = dt / n;
        for (var q = 0; q < n; q++){
          veer(a, 'yaw', d.yaw, 90, 13, h); veer(a, 'pitch', d.pitch, 90, 13, h); veer(a, 'roll', d.roll, 120, 14, h);
          veer(a, 'gx', d.gx, 500, 40, h); veer(a, 'gy', d.gy, 500, 40, h);
          veer(a, 'open', d.open, 1400, 70, h); veer(a, 'lid', d.lid, 200, 24, h);
          veer(a, 'hop', 0, 260, 9, h);
        }
        a.st.sq = klem(-a.v.hop / 1500, -.08, .08);
      } else {
        ['yaw', 'pitch', 'roll', 'gx', 'gy', 'open', 'lid'].forEach(function(p){ a.st[p] = d[p]; });
        a.st.hop = 0; a.st.sq = 0;
      }
      a.st.stemming = a.stemming;
      /* kleine gezichtjes hoeven niet elk beeldje: dertig keer per seconde is genoeg */
      if (!a.klein || t - a.klein > 1){ a.klein = t; a.maat = a.el.getBoundingClientRect().width || 40; }
      if (a.maat < 64 && t - a.laatst < 1 / 30) continue;
      var sig = rustig ? a.stemming + a.st.yaw + ',' + a.st.pitch : '';
      if (rustig && sig === a.sig) continue;
      a.sig = sig; a.laatst = t;
      a.el.innerHTML = teken(a.m, a.st, a.id, true, a.schaduw, a.maat);
    }
    if (LEVEND.length) requestAnimationFrame(stap); else loopt = false;
  }
  /* gezichtjes die met leef:true als tekst in de pagina komen, gaan vanzelf leven */
  var wachter = null;
  function wacht(){
    if (wachter || typeof MutationObserver !== 'function' || typeof document === 'undefined') return;
    if (!document.body){ document.addEventListener('DOMContentLoaded', wacht, { once:true }); return; }
    wachter = new MutationObserver(function(lijst){
      for (var i = 0; i < lijst.length; i++){
        var t = lijst[i].target;
        /* de gezichtjes die al leven, tekenen zichzelf elk beeldje opnieuw: die overslaan */
        if (t.nodeType === 1 && t.closest && t.closest('svg[data-lv]')) continue;
        for (var j = 0; j < lijst[i].addedNodes.length; j++) if (lijst[i].addedNodes[j].nodeType === 1){ zoek(); return; }
      }
    });
    wachter.observe(document.body, { childList:true, subtree:true });
    zoek();
  }
  function zoek(){
    Array.prototype.forEach.call(document.querySelectorAll('svg.avatar[data-leef]:not([data-lv])'), function(el){
      var s = el.getAttribute('data-leef'), k = el.getAttribute('data-kijk');
      leef(el, { sleutel:s !== '1' ? s : '', stemming:el.getAttribute('data-st') || '', volg:el.hasAttribute('data-volg') ? +el.getAttribute('data-volg') : undefined,
        kijk:k ? k.split(',').map(Number) : undefined });
    });
  }

  /* de ogen van de stille gezichtjes volgen de muis: per gezichtje op de pagina schuiven de pupillen een stukje richting de muis.
     Niet in de arena van Zwaardvechter (daar staan ze in een use) en niet als iemand liever geen beweging heeft. */
  (function(){
    if (typeof document === 'undefined' || typeof matchMedia !== 'function') return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(hover: none)').matches) return;
    var mx = -1, my = -1, bezig = false;
    function kijk(){
      bezig = false;
      var vh = innerHeight, vw = innerWidth;
      Array.prototype.forEach.call(document.querySelectorAll('svg.avatar:not([data-lv])'), function(el){
        var r = el.getBoundingClientRect();
        if (!r.width || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return;
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2 - r.height * 0.04;
        var dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1;
        /* dichtbij: vol uitslaan; ver weg: een klein beetje */
        var kracht = Math.min(1, d / (r.width * 3)) * 3.2;
        var tx = (dx / d * kracht).toFixed(2), ty = (dy / d * kracht * 0.7).toFixed(2);
        Array.prototype.forEach.call(el.querySelectorAll('.av-pupil'), function(p){ p.style.transform = 'translate(' + tx + 'px,' + ty + 'px)'; });
      });
    }
    addEventListener('mousemove', function(e){ mx = e.clientX; my = e.clientY; if (!bezig){ bezig = true; requestAnimationFrame(kijk); } }, { passive:true });
  })();
  /* de paar regels stijl die elke pagina nodig heeft */
  try {
    var st = document.createElement('style');
    st.textContent = '.avatar{display:inline-block;vertical-align:middle;flex:none;margin-right:6px}.avrij{display:flex;align-items:center;gap:8px;min-width:0}.avrij .avatar{margin-right:0}.avrij>span{min-width:0}' +
      /* leven: ademen, knipperen, en een hoed die wiebelt onder de muis */
      '@keyframes avAdem{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-1.4px) scale(1.018,1.01)}}' +
      '@keyframes avKnip{0%,91%,100%{transform:scaleY(1)}94.5%{transform:scaleY(.06)}}' +
      '@keyframes avHoed{0%,100%{transform:rotate(0) translateY(0)}35%{transform:rotate(-9deg) translateY(-4px)}70%{transform:rotate(4deg) translateY(-1px)}}' +
      '.av-alles{transform-box:fill-box;transform-origin:50% 100%;animation:avAdem 3.4s ease-in-out infinite}' +
      '.av-ogen{transform-box:fill-box;transform-origin:center;animation:avKnip 4.6s linear infinite}' +
      '.av-hoed{transform-box:fill-box;transform-origin:50% 100%}' +
      '.av-pupil{transition:transform .14s ease-out}' +
      '.avatar:hover .av-hoed,.av-wiebel .av-hoed{animation:avHoed .8s ease}' +
      /* juichen: twee sprongetjes, de hoed wiebelt mee */
      '@keyframes avJuich{0%,100%{transform:translateY(0) rotate(0)}18%{transform:translateY(-.28em) rotate(-7deg)}36%{transform:translateY(0) rotate(0)}54%{transform:translateY(-.2em) rotate(6deg)}72%{transform:translateY(0) rotate(0)}}' +
      '.av-juich{animation:avJuich 1.3s ease-out 2;transform-origin:50% 100%}.av-juich .av-hoed{animation:avHoed .8s ease .1s 2}' +
      '@media(prefers-reduced-motion:reduce){.av-alles,.av-ogen,.av-hoed,.av-juich{animation:none !important}}';
    document.head.appendChild(st);
  } catch (e){}
  return { svg:svg, inhoud:inhoud, vul:vul, leef:leef, ontleed:ontleed, maak:maak, KEUZES:KEUZES, NAMEN:NAMEN, KLEUREN:KLEUREN, KLEUREN2:KLEUREN2 };
})();
