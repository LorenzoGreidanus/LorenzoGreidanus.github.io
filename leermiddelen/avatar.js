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

   Hoeden, brillen en figuren zijn sinds de herfst van 2026 voorwerpen in 3D
   (zie SCHIJN-3D hieronder): ze draaien mee, hebben licht en schaduw, en een
   vaste volgorde voor en achter het hoofd zorgt dat niets door iets anders
   heen steekt.

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
  /* figuren die uit de winkel zijn (Bloem f2 en Wolkje f3, oktober 2026): een gezichtje dat ze droeg, tekent ze niet meer */
  var FIGUUR_WEG = { 2:1, 3:1 };
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
  var PATROON = /^v(\d{1,2})k(\d)o(\d{1,2})m(\d)e(\d)(?:c(\d{1,2}))?(?:x(\d{1,2}))?(?:w(\d))?(?:h(\d{1,2}))?(?:r(\d{1,2}))?(?:z(\d{1,2}))?(?:b(\d{1,2}))?(?:a(\d{1,2}))?(?:q(\d{1,2}))?(?:f(\d))?(?:p(\d{1,2}))?(?:g(\d{1,2}))?(?:s(\d{1,2}))?$/;
  /* achter het gezichtje kan cosmetica staan: h (hoed), r (rand), z (zwaard), b, a, q, f, p (pijlboog) en s (speer), uit de winkel */
  function ontleed(spec){
    spec = String(spec || '');
    var m = PATROON.exec(spec);
    /* Een spec die ergens onderweg is afgekapt (een oude server die er 24 tekens van bewaarde):
       haal er van achteren af tot hij weer klopt, dan blijft het gezicht en valt hooguit een bril weg. */
    for (var i = 0; !m && i < 16 && spec.length > 10 && /^v\d{1,2}k\do\d{1,2}m\de\d/.test(spec); i++){ spec = spec.replace(/[a-z]\d*$/, ''); m = PATROON.exec(spec); }
    return m ? { v:+m[1], k:+m[2], o:+m[3], m:+m[4], e:+m[5], c:+(m[6] || 0), x:+(m[7] || 0), w:+(m[8] || 0), h:+(m[9] || 0), r:+(m[10] || 0), z:+(m[11] || 0), b:+(m[12] || 0), a:+(m[13] || 0), q:+(m[14] || 0), f:FIGUUR_WEG[+(m[15] || 0)] ? 0 : +(m[15] || 0), p:+(m[16] || 0), g:+(m[17] || 0), s:+(m[18] || 0) } : null; }
  function maak(o){
    /* x en w (haar) bestaan nog in het patroon, voor codes van even, maar worden niet meer gemaakt of getekend */
    var c = (o.c | 0) % (KLEUREN2.length + 1);
    return 'v' + (o.v % KEUZES.vormen) + 'k' + (o.k % KEUZES.kleuren) + 'o' + (o.o % KEUZES.ogen) + 'm' + (o.m % KEUZES.monden) + 'e' + (o.e % KEUZES.extras) +
      (c ? 'c' + c : '') +
      (o.h ? 'h' + o.h : '') + (o.r ? 'r' + o.r : '') + (o.z ? 'z' + o.z : '') + (o.b ? 'b' + o.b : '') + (o.a ? 'a' + o.a : '') + (o.q ? 'q' + o.q : '') + (o.f ? 'f' + (o.f % KEUZES.figuren) : '') + (o.p ? 'p' + o.p : '') + (o.g ? 'g' + o.g : '') + (o.s ? 's' + o.s : '');
  }
  /* Een lichte rand om een los stuk (hoed, trofee), zodat het ook op een donkere achtergrond
     te zien is. Het is dezelfde tekening nog een keer, maar dan als dikke witte omtrek eronder; wat
     binnen de vorm valt verdwijnt onder het stuk zelf, alleen de buitenkant blijft over. */
  var HALO = ' fill="none" stroke="#fff" stroke-linejoin="round" stroke-linecap="round" opacity=".42"';
  function halo(tekening, dik){
    return '<g' + HALO + ' stroke-width="' + f1(dik) + '">' + tekening.replace(/ (fill|stroke|stroke-width|opacity|stroke-opacity|fill-opacity|stroke-dasharray|stroke-dashoffset|fill-rule)="[^"]*"/g, '') + '</g>';
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
    /* discobol van De Discobal: een zilveren bol aan een touwtje, met gekleurde spiegeltjes en een glinster */
    else if (n === 8) g = '<path d="M0,-15 v4" stroke="#14224C" stroke-width="1.4" stroke-linecap="round"/><circle r="11" fill="#c9cfe0" stroke="#14224C" stroke-width="1.5"/>' +
      '<rect x="-6" y="-6" width="5.5" height="5.5" fill="#83A5F2"/><rect x="0.5" y="0.5" width="5.5" height="5.5" fill="#9A55B8"/><rect x="-6" y="0.5" width="5.5" height="5.5" fill="#fff"/><rect x="0.5" y="-9" width="5" height="3" fill="#F26749"/><rect x="-9.5" y="-3" width="3" height="5" fill="#EA9836"/>' +
      '<path d="M-11,0 h22 M0,-11 v22 M-9,-6 h18 M-9,6 h18 M-6,-9 v18 M6,-9 v18" stroke="#8f9db0" stroke-width=".7" fill="none"/>' +
      '<path d="M9,-12 l1,2.6 2.6,1 -2.6,1 -1,2.6 -1,-2.6 -2.6,-1 2.6,-1z" fill="#fff" stroke="#9A55B8" stroke-width=".6" stroke-linejoin="round"/>';
    /* slinger van De Metronoom: het groene huisje met de slinger die uitslaat */
    else if (n === 9) g = '<path d="M-9,12 L-4,-12 L4,-12 L9,12 Z" fill="#1f6b5c" stroke="#123f36" stroke-width="1.4" stroke-linejoin="round"/><path d="M-5,8 L-2,-7 L2,-7 L5,8 Z" fill="#F3EFE9" opacity=".85"/>' +
      '<path d="M-10,12 h20" stroke="#14224C" stroke-width="2.4" stroke-linecap="round"/><path d="M0,8 L8,-13" stroke="#14224C" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M1.8,-2.2 L5.4,-0.8 L7,-4.9 L3.4,-6.3 Z" fill="#EA9836" stroke="#14224C" stroke-width="1" stroke-linejoin="round"/><circle cy="8" r="1.6" fill="#FFD166"/>' +
      '<path d="M-13,-9 q-2,4 0,8 M13,-12 q3,3 2,8" fill="none" stroke="#83A5F2" stroke-width="1.4" stroke-linecap="round"/>';
    /* vulpen van De Blauwe Pen: blauw met een gouden punt, de andere kant op dan de rode pen, en een druppel inkt */
    else if (n === 10) g = '<g transform="rotate(40)"><rect x="-3.4" y="-14" width="6.8" height="18" rx="2.4" fill="#2458d6" stroke="#16389a" stroke-width="1"/><rect x="-3.4" y="-14" width="6.8" height="6" rx="2" fill="#16389a"/>' +
      '<path d="M2,-13 v6" stroke="#FFD166" stroke-width="1.2" stroke-linecap="round"/><path d="M-3,4 L0,13 L3,4 Z" fill="#FFD166" stroke="#c9971f" stroke-width="1" stroke-linejoin="round"/><path d="M0,7 v4" stroke="#c9971f" stroke-width=".8"/></g>' +
      '<path d="M-10,9.5 q2.4,3 0,5 q-2.4,-2 0,-5z" fill="#2458d6"/>';
    /* gummetje van De Gum: roze en blauw, schuin, met kruimels */
    else if (n === 11) g = '<g transform="rotate(-20)"><rect x="-11" y="-6" width="22" height="12" rx="3" fill="#e0607e" stroke="#a83a55" stroke-width="1.4"/><path d="M2,-6 h6 q3,0 3,3 v6 q0,3 -3,3 h-6 z" fill="#83A5F2" stroke="#4a6fc2" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<path d="M-8,-3 h6" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".6"/></g>' +
      '<circle cx="-9" cy="10" r="1.5" fill="#e0607e"/><circle cx="-4.5" cy="12" r="1.1" fill="#a83a55"/><circle cx="-12.5" cy="6" r="1" fill="#e0607e"/>';
    /* liniaaltje van De Liniaal: geel, schuin, met streepjes */
    else if (n === 12) g = '<g transform="rotate(-35)"><rect x="-14" y="-4.5" width="28" height="9" rx="1.5" fill="#FFD166" stroke="#c9971f" stroke-width="1.4"/>' +
      '<path d="M-10,-4.5 v4 M-6,-4.5 v2.4 M-2,-4.5 v4 M2,-4.5 v2.4 M6,-4.5 v4 M10,-4.5 v2.4" stroke="#14224C" stroke-width="1"/></g>';
    /* belletje van De Schoolbel: blauw met een gouden klepel en geluid ernaast */
    else if (n === 13) g = '<path d="M0,-11 q-8,0 -8,9 v4 l-3,4 h22 l-3,-4 v-4 q0,-9 -8,-9z" fill="#204ECF" stroke="#16389a" stroke-width="1.4" stroke-linejoin="round"/><circle cy="-12.5" r="2" fill="#16389a"/>' +
      '<circle cy="9" r="2.6" fill="#FFD166" stroke="#c9971f" stroke-width="1"/><path d="M-4,-6 q-2,3 -2,7" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".45"/>' +
      '<path d="M-13,-8 q-3,4 0,8 M13,-8 q3,4 0,8" stroke="#83A5F2" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
    /* rapportje van Het Rapport: een groen boekje met een 10 */
    else if (n === 14) g = '<g transform="rotate(-8)"><rect x="-9" y="-12" width="18" height="23" rx="2" fill="#2f7d52" stroke="#1d5537" stroke-width="1.4"/><path d="M-6,-12 v23" stroke="#1d5537" stroke-width="1.2"/>' +
      '<rect x="-3.5" y="-7" width="10.5" height="11" rx="1.5" fill="#F3EFE9"/><path d="M-1.4,-4 l1.4,-1.2 v8" stroke="#F26749" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="3.9" cy="-1.2" rx="1.8" ry="3.3" fill="none" stroke="#F26749" stroke-width="1.5"/></g>';
    /* beker van Het Proefwerk, het eindgevecht: goud met een ster, op een donkere voet */
    else if (n === 15) g = '<path d="M-8,-12 q-6,0 -6,4.5 q0,4.5 6,5.5 M8,-12 q6,0 6,4.5 q0,4.5 -6,5.5" fill="none" stroke="#c9971f" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M-8.5,-12.5 h17 v4 q0,9.5 -8.5,10.5 q-8.5,-1 -8.5,-10.5 z" fill="#FFD166" stroke="#c9971f" stroke-width="1.4" stroke-linejoin="round"/><path d="M-1.8,2 h3.6 v5 h-3.6z" fill="#c9971f"/>' +
      '<rect x="-7.5" y="7" width="15" height="5.5" rx="1.4" fill="#14224C"/>' + ster(0, -5.5, 3.6, '#fff') + '<path d="M-5.5,-10 v4" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".6"/>';
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
    /* gumkruimels van De Gum (nachtmerrie): roze, met een schoongeveegde streep en kruimels */
    /* De gezichtjes zijn bijna even groot als de schijf: wat hieronder opvalt, ligt daarom aan de rand. */
    /* gumkruimels van De Gum (nachtmerrie): roze, met kruimels rondom en een schoongeveegde veeg */
    if (n === 8) return '<circle r="49" fill="#f2b3c2"/><ellipse rx="45" ry="11" transform="rotate(-35)" fill="#FDF3F5" opacity=".9"/>' +
      [[-150, 3.4, '#e0607e'], [-120, 2.4, '#a83a55'], [-95, 3, '#e0607e'], [-60, 2.2, '#83A5F2'], [-20, 3.2, '#e0607e'], [15, 2.4, '#a83a55'], [60, 3, '#e0607e'], [95, 2.2, '#83A5F2'], [120, 3.4, '#e0607e'], [160, 2.4, '#a83a55'], [190, 3, '#e0607e'], [-175, 2, '#83A5F2']].map(function(c){
        var a = c[0] * Math.PI / 180, r = 45.5 - c[1] * 0.3;
        return '<ellipse cx="' + f1(Math.sin(a) * r) + '" cy="' + f1(-Math.cos(a) * r) + '" rx="' + c[1] + '" ry="' + f1(c[1] * 0.72) + '" transform="rotate(' + (c[0] * 2 % 90) + ' ' + f1(Math.sin(a) * r) + ' ' + f1(-Math.cos(a) * r) + ')" fill="' + c[2] + '"/>'; }).join('') + SCHIJFRAND;
    /* veilig lokaal van De Schoolbel (nachtmerrie): de lokalen van bovenaf, en drie lichten groen op, zoals als de bel gaat */
    if (n === 9){ var lk = '';
      [-34, -17, 0, 17, 34].forEach(function(y){ [-34, -17, 0, 17, 34].forEach(function(x){
        if (Math.sqrt(Math.pow(Math.abs(x) + 7, 2) + Math.pow(Math.abs(y) + 7, 2)) > 48) return;
        var aan = (x === -34 && y === 17) || (x === 34 && y === -17) || (x === 17 && y === -34) || (x === 0 && y === 34);
        lk += '<rect x="' + (x - 7) + '" y="' + (y - 7) + '" width="14" height="14" rx="2.4" fill="' + (aan ? '#3bb58f' : '#3b67de') + '" stroke="' + (aan ? '#d4f5e8' : '#83A5F2') + '" stroke-width="1.3"/>'; }); });
      return '<circle r="49" fill="#16389a"/>' + lk + SCHIJFRAND; }
    /* gouden stralen van Het Proefwerk (nachtmerrie): het eindgevecht gehaald, dus een gouden krans van punten om je heen */
    if (n === 10){ var st = '';
      for (var k = 0; k < 16; k++){ var am = k * 22.5 * Math.PI / 180, a0 = am - 0.11, a1 = am + 0.11, lang = k % 2 ? 54 : 58;
        st += '<path d="M' + f1(Math.sin(a0) * 46) + ',' + f1(-Math.cos(a0) * 46) + ' L' + f1(Math.sin(am) * lang) + ',' + f1(-Math.cos(am) * lang) + ' L' + f1(Math.sin(a1) * 46) + ',' + f1(-Math.cos(a1) * 46) + ' Z"/>'; }
      return '<g fill="#FFD166" stroke="#c9971f" stroke-width="1.2" stroke-linejoin="round">' + st + '</g><circle r="49" fill="#14224C" stroke="#FFD166" stroke-width="2.4"/>' +
        '<circle r="40" fill="#FFD166" opacity=".16"/>' + ster(0, -42, 3.6, '#FFD166'); }
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
    /* blauwe krabbel van De Blauwe Pen (nachtmerrie): met de hand rondgekrast, twee keer, een beetje bibberig */
    if (n === 12){
      var lus = function(r0, bib, golf, fase, van, tot){ var d = '';
        for (var t = 0; t <= 48; t++){ var a = van + (tot - van) * t / 48, r = r0 + bib * Math.sin(golf * a + fase); d += (t ? 'L' : 'M') + f1(Math.sin(a) * r) + ',' + f1(-Math.cos(a) * r); }
        return d; };
      return '<path d="' + lus(46.5, 1.6, 3, 0.4, -0.3, 6.6) + '" fill="none" stroke="#83A5F2" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="' + lus(45, 2, 4, 1.7, 0.5, 7.3) + '" fill="none" stroke="#2458d6" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle cx="' + f1(Math.sin(7.3) * 45.7) + '" cy="' + f1(-Math.cos(7.3) * 45.7) + '" r="2.6" fill="#16389a"/>'; }
    /* liniaalrand van De Liniaal (nachtmerrie): een gele meetlat rond je gezicht, met streepjes */
    if (n === 13){ var tk = '';
      for (var i2 = 0; i2 < 60; i2++){ var hk = i2 * Math.PI / 30, ln = i2 % 5 ? 2.4 : 4.6;
        tk += 'M' + f1(Math.sin(hk) * 49.4) + ',' + f1(-Math.cos(hk) * 49.4) + 'L' + f1(Math.sin(hk) * (49.4 - ln)) + ',' + f1(-Math.cos(hk) * (49.4 - ln)); }
      return '<circle r="46" fill="none" stroke="#FFD166" stroke-width="7"/><circle r="49.5" fill="none" stroke="#c9971f" stroke-width="1.2"/><circle r="42.5" fill="none" stroke="#c9971f" stroke-width="1.2"/>' +
        '<path d="' + tk + '" stroke="#14224C" stroke-width="1"/>'; }
    return '';
  }
  function f(v){ var r = Math.round(v * 100), neg = r < 0, x = neg ? -r : r, d = x % 100, s = '' + ((x - d) / 100); if (d) s += d < 10 ? '.0' + d : d % 10 ? '.' + d : '.' + d / 10; return neg ? '-' + s : s; }
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
  var LEEG = { v:0, k:0, o:0, m:0, e:0, c:0, x:0, w:0, h:0, r:0, z:0, b:0, a:0, q:0, f:0, g:0 };
  function model(naam, spec){
    var sleutel = (spec || '') + '|' + String(naam || '').toLowerCase().trim();
    if (modellen[sleutel]) return modellen[sleutel];
    /* '+h27' achter de spec (of als hele spec) is de hoed van een feestdag: alleen als je zelf geen hoed op hebt */
    var feest = /\+h(\d{1,2})$/.exec(spec || '');
    if (feest) spec = spec.slice(0, feest.index);
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
    if (feest && !(sp && (sp.h || sp.g === 2 || sp.g === 3))){
      var spf = {}, sl; for (sl in LEEG) spf[sl] = sp ? sp[sl] : LEEG[sl];
      spf.h = +feest[1]; sp = spf;
    }
    if (sp && sp.h && extra === 2) extra = -1;   /* een krul past niet onder een hoed */
    var zaad = hash((spec || '') + '|' + (naam || ''));
    if (aantalModellen > 300){ modellen = {}; aantalModellen = 0; }
    aantalModellen++;
    return (modellen[sleutel] = { P:P, kleur:kleur, helder:helder, donker:donker, draai:draai, d:vorm.d, M:M, bol:50 * klem(breed / 45, .8, 1.05),
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
  /* Een pad met alleen absolute punten (M L C Q Z), zodat elk punt apart verplaatst kan worden. */
  function absPad(d){
    var tok = String(d).match(/[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d*\.\d+|\d+\.?)/g) || [], i = 0, cmd = '', vorig = '';
    var x = 0, y = 0, x0 = 0, y0 = 0, kx = 0, ky = 0, uit = [];
    var ARIT = { M:2, L:2, H:1, V:1, C:6, S:4, Q:4, T:2, A:7 };
    function getal(){ return +tok[i++]; }
    while (i < tok.length){
      if (/[a-z]/i.test(tok[i])){ cmd = tok[i++]; if (/z/i.test(cmd)){ uit.push(['Z']); x = x0; y = y0; vorig = 'Z'; continue; } }
      var C = cmd.toUpperCase(), rel = cmd !== C, n = ARIT[C];
      if (!n || i + n > tok.length || /[a-z]/i.test(tok[i])){ i++; continue; }
      var bx = rel ? x : 0, by = rel ? y : 0, a, b2, c, dd, e2, g;
      if (C === 'M'){ x = bx + getal(); y = by + getal(); x0 = x; y0 = y; uit.push(['M', x, y]); cmd = rel ? 'l' : 'L'; }
      else if (C === 'L'){ x = bx + getal(); y = by + getal(); uit.push(['L', x, y]); }
      else if (C === 'H'){ x = bx + getal(); uit.push(['L', x, y]); }
      else if (C === 'V'){ y = by + getal(); uit.push(['L', x, y]); }
      else if (C === 'C'){ a = bx + getal(); b2 = by + getal(); c = bx + getal(); dd = by + getal(); x = bx + getal(); y = by + getal(); uit.push(['C', a, b2, c, dd, x, y]); kx = c; ky = dd; }
      else if (C === 'S'){ a = /[CS]/.test(vorig) ? 2 * x - kx : x; b2 = /[CS]/.test(vorig) ? 2 * y - ky : y; c = bx + getal(); dd = by + getal(); x = bx + getal(); y = by + getal(); uit.push(['C', a, b2, c, dd, x, y]); kx = c; ky = dd; }
      else if (C === 'Q'){ a = bx + getal(); b2 = by + getal(); x = bx + getal(); y = by + getal(); uit.push(['Q', a, b2, x, y]); kx = a; ky = b2; }
      else if (C === 'T'){ a = /[QT]/.test(vorig) ? 2 * x - kx : x; b2 = /[QT]/.test(vorig) ? 2 * y - ky : y; x = bx + getal(); y = by + getal(); uit.push(['Q', a, b2, x, y]); kx = a; ky = b2; }
      else if (C === 'A'){ i += 5; e2 = bx + getal(); g = by + getal(); x = e2; y = g; uit.push(['L', x, y]); }
      vorig = C;
    }
    return uit;
  }
  /* ======================================================================
     SCHIJN-3D. Alles wat op of aan het hoofd zit (hoeden, brillen, figuren
     en de krul) is een voorwerp in de ruimte van het hoofd: x naar rechts,
     y omlaag, z naar je toe, het midden van het hoofd in (0,0,0). Een
     kijkrichting draait elk punt precies zoals de ogen en de mond (eerst om
     de verticale as, dan om de x-as); daarna valt z weg, maar z bepaalt wat
     voor en wat achter ligt.

     Het hoofd is voor de diepte een draaivorm om de verticale as: op elke hoogte
     een cirkel zo breed als de blob daar. Van voren heeft dat precies de omtrek
     van de blob, en opzij draaien verandert er niets aan; daarmee rekenen we uit
     wat het hoofd verbergt.

     Drie lagen, zodat niets door iets anders heen steekt:
       achter  voor het hoofd getekend, dus erachter: de achterste helft van
               een hoedrand, de binnenkant van een kroon en de figuren, op
               diepte gesorteerd;
       midden  na het gezicht en voor de rand: schaduwen op het gezicht (op de
               blob geknipt), brilpootjes en bandjes, alleen waar ze voor het
               hoofd langs lopen;
       voor    na de rand: eerst de bril, dan de hoed (de bril zit onder de
               hoedrand).
     Een hoed zakt op het hoofd tot een van zijn raakpunten het hoofd raakt.
     Een figuur wijkt uit voor een hoed (oortjes zakken opzij, een knot
     schuift naar achteren) tot ze elkaar niet meer raken. Het licht komt van
     linksboven-voor en staat vast in beeld, net als op het hoofd. Alleen
     paden, cirkels en twee gedeelde verlopen; geen filters.
     ====================================================================== */
  var TAU = Math.PI * 2, PI = Math.PI, GR = Math.PI / 180, SCHK = '#0b1433', K0 = { cy:1, sy:0, cp:1, sp:0 };
  function eenh(v){ var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  var LICHT = eenh([-0.42, -0.6, 0.68]);
  /* een getal met hooguit één decimaal, als tekst (zelf in elkaar gezet: dat is twee keer zo snel als String()) */
  function n1(v){ var r = Math.round(v * 10), neg = r < 0, x = neg ? -r : r, d = x % 10, s = '' + ((x - d) / 10); if (d) s += '.' + d; return neg ? '-' + s : s; }
  function pp(p){ return n1(p[0]) + ',' + n1(p[1]); }
  function lijnD(pts, dicht){ if (pts.length < 2) return ''; var d = 'M' + pp(pts[0]); for (var i = 1; i < pts.length; i++) d += 'L' + pp(pts[i]); return dicht ? d + 'Z' : d; }
  /* een gesloten pad met zachte hoeken: elke hoek wordt een kleine bocht (hooguit 2,4 eenheden van de hoek af),
     zodat lange rechte stukken recht blijven en een punt (een hoedpunt) niet afgeknot wordt */
  function zachtD(pts){
    var n = pts.length; if (n < 4) return lijnD(pts, 1);
    var d = '', i;
    for (i = 0; i < n; i++){
      var p = pts[i], a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      var la = Math.sqrt((a[0] - p[0]) * (a[0] - p[0]) + (a[1] - p[1]) * (a[1] - p[1])) || 1, lb = Math.sqrt((b[0] - p[0]) * (b[0] - p[0]) + (b[1] - p[1]) * (b[1] - p[1])) || 1;
      var ka = Math.min(.5, 2.4 / la), kb = Math.min(.5, 2.4 / lb);
      d += (i ? 'L' : 'M') + pp([p[0] + (a[0] - p[0]) * ka, p[1] + (a[1] - p[1]) * ka]) + 'Q' + pp(p) + ' ' + pp([p[0] + (b[0] - p[0]) * kb, p[1] + (b[1] - p[1]) * kb]);
    }
    return d + 'Z';
  }
  /* het omhulsel van punten in beeld (monotone keten); geeft de nummers van de punten */
  function omhulsel(p){
    var idx = [], i;
    for (i = 0; i < p.length; i++) idx.push(i);
    idx.sort(function(a, b){ return p[a][0] - p[b][0] || p[a][1] - p[b][1]; });
    if (idx.length < 3) return idx;
    function kr(o, a, b){ return (p[a][0] - p[o][0]) * (p[b][1] - p[o][1]) - (p[a][1] - p[o][1]) * (p[b][0] - p[o][0]); }
    var lo = [], hi = [];
    for (i = 0; i < idx.length; i++){ while (lo.length >= 2 && kr(lo[lo.length - 2], lo[lo.length - 1], idx[i]) <= 0) lo.pop(); lo.push(idx[i]); }
    for (i = idx.length - 1; i >= 0; i--){ while (hi.length >= 2 && kr(hi[hi.length - 2], hi[hi.length - 1], idx[i]) <= 0) hi.pop(); hi.push(idx[i]); }
    hi.pop(); lo.pop();
    return lo.concat(hi);
  }
  function romp(p){ return omhulsel(p).map(function(i){ return p[i]; }); }
  /* De omtrek van een kroon die op het hoofd staat. De onderkant is de voorste helft van de onderste ring
     (boog); de rest is het omhulsel. Kijk je van onderen, dan zie je door de opening het hoofd, niet de
     binnenkant: die opening hoort er dus niet bij. */
  function boogRomp(boog, rest){
    if (!rest.length) return boog;
    var alle = rest.concat(boog), na = rest.length, H = omhulsel(alle), L = H.length;
    var i0 = H.indexOf(na), i1 = H.indexOf(na + boog.length - 1);
    function pt(i){ return alle[i]; }
    if (i0 < 0 || i1 < 0) return H.map(pt);
    function keten(a, b){ var u = [], i = a; for (var g = 0; g <= L; g++){ u.push(H[i]); if (i === b) break; i = (i + 1) % L; } return u; }
    function puurBoog(k){ for (var j = 1; j < k.length - 1; j++) if (k[j] < na) return false; return true; }
    var A = keten(i0, i1), B = keten(i1, i0);
    if (puurBoog(A)) return boog.concat(B.slice(1, -1).map(pt));
    if (puurBoog(B)) return A.map(pt).concat(boog.slice(1, -1).reverse());
    return H.map(pt);
  }
  /* de kijker: dezelfde draaiing als de ogen en de mond in teken() */
  function kijker(st){ var a = st.yaw * GR, b = st.pitch * GR; return { cy:Math.cos(a), sy:Math.sin(a), cp:Math.cos(b), sp:Math.sin(b) }; }
  function rot3(K, p){ var x1 = p[0] * K.cy + p[2] * K.sy, z1 = -p[0] * K.sy + p[2] * K.cy; return [x1, p[1] * K.cp + z1 * K.sp, -p[1] * K.sp + z1 * K.cp]; }
  /* Een stelsel in het hoofd: oorsprong o en richtingen x (rechts), u (op), f (naar voren), met schaal s.
     In beeld gezet (stelselV) rekent pt(F, x, y, z) een punt van het voorwerp om naar beeld. */
  function stelselV(K, S){
    var s = S.s || 1, sw = s * (S.w || 1), x = rot3(K, S.x), u = rot3(K, S.u), v = rot3(K, S.f);
    return { o:rot3(K, S.o), x:[x[0] * sw, x[1] * sw, x[2] * sw], u:[u[0] * s, u[1] * s, u[2] * s], f:[v[0] * sw, v[1] * sw, v[2] * sw], s:s, xz:x[2], uz:u[2], fz:v[2] };
  }
  function pt(F, x, y, z){ return [F.o[0] + F.x[0] * x + F.u[0] * y + F.f[0] * z, F.o[1] + F.x[1] * x + F.u[1] * y + F.f[1] * z, F.o[2] + F.x[2] * x + F.u[2] * y + F.f[2] * z]; }
  /* terug: een punt in het hoofd naar de maten van het voorwerp */
  function lokaal(S, p){
    var d = [p[0] - S.o[0], p[1] - S.o[1], p[2] - S.o[2]], s = S.s || 1, sw = s * (S.w || 1);
    return [(d[0] * S.x[0] + d[1] * S.x[1] + d[2] * S.x[2]) / sw, (d[0] * S.u[0] + d[1] * S.u[1] + d[2] * S.u[2]) / s, (d[0] * S.f[0] + d[1] * S.f[1] + d[2] * S.f[2]) / sw];
  }
  var HOOFDSTELSEL = { o:[0, 0, 0], x:[1, 0, 0], u:[0, -1, 0], f:[0, 0, 1], s:1 };
  /* een punt langs het licht op een bol leggen: daar valt de schaduw */
  function opBol(P, R){
    var b = P[0] * LICHT[0] + P[1] * LICHT[1] + P[2] * LICHT[2], c = P[0] * P[0] + P[1] * P[1] + P[2] * P[2] - R * R, D = b * b - c;
    var t = D > 0 ? b - Math.sqrt(D) : b; if (t < 0) t = 0;
    return [P[0] - LICHT[0] * t, P[1] - LICHT[1] * t];
  }
  function tint(k, licht){ return licht > .55 ? meng(k, '#ffffff', Math.min(.4, (licht - .55) * .55)) : meng(k, '#000000', Math.min(.45, (.55 - licht) * .4)); }
  function verf(k, l, lw){ return ' fill="' + k + '"' + (l ? ' stroke="' + l + '" stroke-width="' + n1(lw) + '" stroke-linejoin="round"' : ''); }

  /* ---------- het hoofd: de omtrek als straal per richting ---------- */
  function hoofd3(m){
    if (m.h3) return m.h3;
    var P = m.P, N = 72, R = [], i, b;
    for (b = 0; b < N; b++){
      var a = b / N * TAU - PI, dx = Math.cos(a), dy = Math.sin(a), ver = 0;
      for (i = 0; i < P.length; i++){
        var p = P[i], q = P[(i + 1) % P.length], ex = q[0] - p[0], ey = q[1] - p[1], den = dx * ey - dy * ex;
        if (Math.abs(den) < 1e-9) continue;
        var t = (p[0] * ey - p[1] * ex) / den, u = (p[0] * dy - p[1] * dx) / den;
        if (t > 0 && u >= 0 && u <= 1 && t > ver) ver = t;
      }
      R.push(ver);
    }
    var Rf = m.bol;
    function Rv(x, y){ var a = (Math.atan2(y, x) + PI) / TAU * N, j = Math.floor(a), t = a - j; return R[j % N] * (1 - t) + R[(j + 1) % N] * t; }
    /* per hoogte (stappen van 1, van -80 tot 80) het midden en de halve breedte van de blob */
    var BM = [], BW = [];
    for (b = 0; b <= 160; b++){
      var yy = b - 80 + .001, lo = 1e9, hi = -1e9;
      for (i = 0; i < P.length; i++){ var p1 = P[i], p2 = P[(i + 1) % P.length]; if ((p1[1] > yy) !== (p2[1] > yy)){ var xx = p1[0] + (yy - p1[1]) * (p2[0] - p1[0]) / (p2[1] - p1[1]); if (xx < lo) lo = xx; if (xx > hi) hi = xx; } }
      BM.push(hi > lo ? (hi + lo) / 2 : 0); BW.push(hi > lo ? (hi - lo) / 2 : 0);
    }
    /* de voorkant van het hoofd op (x, y); -1 als (x, y) buiten de omtrek valt */
    function zf(x, y){
      var a = y + 80; if (a <= 0 || a >= 160) return -1;
      var j = Math.floor(a), t = a - j, w = BW[j] * (1 - t) + BW[j + 1] * t, c = BM[j] * (1 - t) + BM[j + 1] * t, d = x - c;
      return d * d >= w * w ? -1 : Math.sqrt(w * w - d * d);
    }
    /* de halve breedte van het hoofd op hoogte y (de grootste van links en rechts) */
    function breedte(y){ var a = klem(y + 80, 0, 159.99), j = Math.floor(a), t = a - j; return BW[j] * (1 - t) + BW[j + 1] * t + Math.abs(BM[j] * (1 - t) + BM[j + 1] * t); }
    function bw(y){ var a = klem(y + 80, 0, 159.99), j = Math.floor(a), t = a - j; return BW[j] * (1 - t) + BW[j + 1] * t; }
    function bm(y){ var a = klem(y + 80, 0, 159.99), j = Math.floor(a), t = a - j; return BM[j] * (1 - t) + BM[j + 1] * t; }
    var top = 0, minX = 0, maxX = 0, zij = 0;
    P.forEach(function(q){ if (q[1] < top) top = q[1]; if (q[1] < 6){ if (q[0] < minX) minX = q[0]; if (q[0] > maxX) maxX = q[0]; } if (q[1] > -22 && q[1] < 12 && Math.abs(q[0]) > zij) zij = Math.abs(q[0]); });
    var rand0 = [[-300, -300], [300, -300], [300, 300], [-300, 300]], om = P.slice();
    if (opp(rand0) * opp(om) > 0) om.reverse();
    var buiten = lijnD(rand0, 1) + lijnD(om, 1);
    return (m.h3 = { R:R, Rv:Rv, zf:zf, Rf:Rf, breedte:breedte, bw:bw, bm:bm, buiten:buiten, top:top, half:(maxX - minX) / 2, cx:(maxX + minX) / 2, zij:zij, rho:-top,
      /* zit p (in het hoofd, rechtop) binnen het hoofd, met tol speling? */
      binnen:function(p, tol){ var z = zf(p[0], p[1]); return z > 0 && Math.abs(p[2]) < z - (tol || 0); },
      /* is p (in beeld) verborgen achter het hoofd? */
      verborgen:function(p, tol){ var z = zf(p[0], p[1]); return z >= 0 && p[2] < z - (tol || 0); } });
  }

  /* ---------- de onderdelen tekenen ----------
     C is de tekentafel voor één gezichtje in één stand: C.stukken krijgt de stukken met laag en diepte,
     C.halo de lichte randen (voor een donkere pagina), C.schaduw de schaduw op het gezicht. */
  /* het kader van een stuk in beeld (voor de volgorde: alleen stukken die over elkaar vallen tellen) */
  function bbP(lijsten, pad){
    var b = [1e9, 1e9, -1e9, -1e9]; pad = pad || 0;
    for (var i = 0; i < lijsten.length; i++){ var l = lijsten[i]; for (var j = 0; j < l.length; j++){ var p = l[j]; if (p[0] < b[0]) b[0] = p[0]; if (p[1] < b[1]) b[1] = p[1]; if (p[0] > b[2]) b[2] = p[0]; if (p[1] > b[3]) b[3] = p[1]; } }
    b[0] -= pad; b[1] -= pad; b[2] += pad; b[3] += pad; return b;
  }
  function stuk(C, laag, z, s, proef, bb){
    var p = { laag:laag, z:z, s:s, nr:C.nr++, eig:C.eig, deel:C.deel, bb:bb || null };
    if (C.proef && proef) for (var k in proef) p[k] = proef[k];
    C.stukken.push(p); C.laatst = p;
    return p;
  }
  /* ligt dit punt (in beeld) voor het hoofd, of naast het hoofd voor het midden? */
  function voorHoofd(C, p){ var z = C.H.zf(p[0], p[1]); return p[2] > (z > 0 ? z : 0); }
  function opp(P){ var a = 0; for (var i = 0, j = P.length - 1; i < P.length; j = i++) a += (P[j][0] - P[i][0]) * (P[j][1] + P[i][1]); return a; }
  /* Het gordijn: een hoed rust op het hoofd. Van onderen gezien verdwijnt de onderkant opzij achter de bol van het
     hoofd. Binnen de omtrek van het hoofd mag een kroon dan alleen te zien zijn boven het stuk van zijn onderste
     ring dat je ziet; daarbuiten altijd. Dat wordt een knipvorm (clipPath) voor de kroon. */
  /* ring: de raaklijn met het hoofd (rond, of open bij een oor of hoorntje) */
  function gordijn(C, ring, F, open){
    var n = ring.length, v = 0, i, GT = 3;   /* wat op het hoofd rust en er een fractie in zakt, telt nog als zichtbaar */
    for (i = 1; i < n; i++) if (ring[i][2] > ring[v][2]) v = i;
    var boog = [];
    if (!C.H.verborgen(ring[v], GT)){
      var lo = v, hi = v, k = 0;
      if (open){ while (lo > 0 && !C.H.verborgen(ring[lo - 1], GT)) lo--; while (hi < n - 1 && !C.H.verborgen(ring[hi + 1], GT)) hi++; }
      else {
        while (k++ < n - 1 && !C.H.verborgen(ring[(lo - 1 + n) % n], GT)) lo--;
        k = 0; while (k++ < n - 1 && hi - lo < n - 1 && !C.H.verborgen(ring[(hi + 1) % n], GT)) hi++;
      }
      for (i = lo; i <= hi; i++) boog.push(ring[(i % n + n) % n]);
    }
    if (boog.length === 1) boog.push([boog[0][0] + .01, boog[0][1]]);
    var ux = F.u[0], uy = F.u[1], ul = Math.sqrt(ux * ux + uy * uy) || 1; ux = ux / ul * 300; uy = uy / ul * 300;
    var poly = boog.length > 1 ? boog.concat([[boog[boog.length - 1][0] + ux, boog[boog.length - 1][1] + uy], [boog[0][0] + ux, boog[0][1] + uy]]) : [];
    var id = C.id + 'K' + (C.nk++);
    if (!C.knipDefs) C.knipDefs = '<path id="' + C.id + 'KB" d="' + C.H.buiten + '"/>';
    /* eerst de boog, dan de buitenkant: andersom knipt Chromium de vereniging van de twee soms verkeerd */
    C.knipDefs += '<clipPath id="' + id + '"><path d="' + (poly.length ? lijnD(poly, 1) : 'M0,0Z') + '"/><use href="#' + C.id + 'KB"/></clipPath>';
    if (!C.gordijnBoog) C.gordijnBoog = boog;
    return { id:id, poly:poly };
  }
  function knip(k, s){ return '<g clip-path="url(#' + k.id + ')">' + s + '</g>'; }
  function haloD(C, D){ C.haloD += D; return ''; }
  /* een verloop in de kleur van het onderdeel (licht linksboven, donker rechtsonder); één keer per gezichtje
     per kleur in defs, en het hoort bij de vorm zelf (geen extra laag erover) */
  function kv(C, k, soort){
    var sl = soort + k, id = C.gm[sl];
    if (!id){
      id = C.gm[sl] = C.id + 'G' + (C.ng++);
      var st = '<stop offset="0" stop-color="' + meng(k, '#ffffff', soort === 'B' ? .38 : .3) + '"/><stop offset="' + (soort === 'B' ? '.36' : '.42') + '" stop-color="' + k + '"/><stop offset="' + (soort === 'B' ? '.62' : '.58') + '" stop-color="' + k + '"/><stop offset="1" stop-color="' + meng(k, SCHK, .3) + '"/>';
      C.gdefs += soort === 'B' ? '<radialGradient id="' + id + '" cx=".36" cy=".3" r=".78">' + st + '</radialGradient>' : '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0">' + st + '</linearGradient>';
    }
    return 'url(#' + id + ')';
  }
  function verloop(C, D, soort, op){ return '<path d="' + D + '" fill="url(#' + C.id + soort + ')"' + (op != null && op < 1 ? ' opacity="' + n1(op) + '"' : '') + '/>'; }
  function profR(p, h){
    if (h <= p[0][0]) return p[0][1];
    for (var i = 1; i < p.length; i++) if (h <= p[i][0]) return p[i - 1][1] + (p[i][1] - p[i - 1][1]) * (h - p[i - 1][0]) / ((p[i][0] - p[i - 1][0]) || 1);
    return 0;
  }
  /* driehoeken voor de controle (alleen met C.proef): vierhoeken tussen twee rijen punten */
  function strookTris(a, b, dicht){
    var t = [], n = a.length, m = dicht ? n : n - 1;
    for (var i = 0; i < m; i++){ var j = (i + 1) % n; t.push([a[i], a[j], b[j]], [a[i], b[j], b[i]]); }
    return t;
  }

  /* draaivorm: ringen op hoogtes langs de as, [h, r, opzij, naar voren]; een ring met opzij of naar voren
     buigt de punt om (tovenaarshoed, kerstmuts). dicht: ook de onderkant is dicht (een dopje). */
  function rDraai(C, F, d){
    var n = C.klein ? 10 : 22, ex = d.ex || 1, ez = d.ez || 1, p = d.p, i;
    var ts = Math.atan2(F.xz * ex, F.fz * ez);
    function rp(q, t){ return pt(F, (q[2] || 0) + q[1] * Math.sin(t) * ex, q[0], (q[3] || 0) + q[1] * Math.cos(t) * ez); }
    function vol(q, nn){ nn = nn || n; if (!q[1]) return [rp(q, 0)]; var u = []; for (var j = 0; j < nn; j++) u.push(rp(q, j / nn * TAU)); return u; }
    var jb = p.length;
    for (i = 1; i < p.length; i++) if (p[i][2] || p[i][3]){ jb = i; break; }
    var tot = Math.max(jb, 2), boven = [], basis = vol(p[0]), delen = [];
    for (i = 1; i < tot; i++) boven = boven.concat(vol(p[i]));
    var romp0 = romp(boven.concat(basis));
    delen.push(romp0);
    for (i = tot; i < p.length; i++) delen.push(romp(vol(p[i]).concat(vol(p[i - 1]))));
    var gat = null, opHoofd = !d.dicht && !d.S && p[0][0] === 0;
    if (!d.dicht && F.uz < -.01){ gat = basis.slice(); if (opp(gat) * opp(romp0) > 0) gat.reverse(); }
    var D = delen.map(C.klein ? function(q){ return lijnD(q, 1); } : zachtD).join('') + (gat ? lijnD(gat, 1) : ''), lw = (d.lw || 1.4) * C.sc, s;
    if (delen.length > 1 || gat) s = '<path d="' + D + '" fill="none" stroke="' + d.l + '" stroke-width="' + n1(lw * 2) + '" stroke-linejoin="round"/><path d="' + D + '" fill="' + kv(C, d.k, 'L') + '"/>';
    else s = '<path d="' + D + '"' + verf(kv(C, d.k, 'L'), d.l, lw) + '/>';
    if (gat && opHoofd) s += '<path d="' + lijnD(gat, 1) + '" fill="' + meng(C.huid, '#000000', .14) + '"/>';
    if (d.halo !== false && !d.laag) C.halo += haloD(C, D);
    var mid = pt(F, p[0][2] || 0, p[p.length >> 1][0] * .5, p[0][3] || 0), laag = d.laag || 'voor';
    if (laag === 'auto') laag = voorHoofd(C, mid) ? 'voor' : 'achter';
    var proef = null;
    if (C.proef){ var rs = p.map(function(q){ var r = vol(q, 24); return r.length === 1 ? [r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0], r[0]] : r; }), tr = [];
      for (i = 1; i < rs.length; i++) tr = tr.concat(strookTris(rs[i - 1], rs[i], 1));
      if (d.dicht){ var c0 = rp([p[0][0], 0, p[0][2], p[0][3]], 0); rs[0].forEach(function(q, j){ tr.push([c0, q, rs[0][(j + 1) % 24]]); }); }
      proef = { poly:delen, tris:tr }; }
    var kg = opHoofd ? gordijn(C, basis, F) : null;
    if (kg && !C.hoedGordijn) C.hoedGordijn = kg;
    if (proef && gat) proef.gat = gat;
    var pk = stuk(C, laag, mid[2] + (d.dz || 0), kg ? knip(kg, s) : s, proef, bbP(delen, lw));
    if (kg && C.proef) pk.knip = kg.poly;
    if (d.raakSchaduw && !d.dicht) C.schaduwBoog = C.gordijnBoog || [];
  }
  /* De achterste helft van een rand, wand of ring ligt meestal achter het hoofd. Kijk je van boven, dan
     buigen de uiteinden voor de bol van het hoofd langs. splits() verdeelt een strook (twee randen a en b,
     of één lijn a) in de stukken die het hoofd verbergt (die gaan voor het hoofd, dus erachter) en de
     stukken die je ziet (die komen na het hoofd, maar voor de rest van de hoed). */
  function splits(C, a, b, tol, dik){
    var n = a.length, z = [], i, uit = { weg:[], zie:[] };
    function weg(p){ if (C.H.verborgen(p, tol)) return true; if (!dik) return false; var l = Math.sqrt(p[0] * p[0] + p[1] * p[1]) || 1; return C.H.verborgen([p[0] - p[0] / l * dik, p[1] - p[1] / l * dik, p[2]], tol); }
    for (i = 0; i < n; i++) z.push(!weg(a[i]) && (!b || !weg(b[i])));
    function sluit(van, tot, vis){ var sa = a.slice(van, tot + 1), sb = b ? b.slice(van, tot + 1) : null; (vis ? uit.zie : uit.weg).push({ poly:sb ? sa.concat(sb.slice().reverse()) : sa, a:sa, b:sb }); }
    var s0 = 0, v0 = z[0] && z[1];
    for (i = 1; i < n - 1; i++){ var v = z[i] && z[i + 1]; if (v !== v0){ sluit(s0, i, v0); s0 = i; v0 = v; } }
    sluit(s0, n - 1, v0);
    return uit;
  }
  /* een helft van een strook als stuk(ken): lijst van {poly, a, b}; kleur en verloop via maak(D) */
  function strookStuk(C, delen, laag, z, maak, vooraan, gesloten){
    if (!delen.length && !C.vast) return;
    var D = delen.map(function(q){ return gesloten === false ? lijnD(q.poly) : lijnD(q.poly, 1); }).join('');
    var p = stuk(C, laag, z, maak(D), C.proef ? { poly:delen.map(function(q){ return q.poly; }), tris:[].concat.apply([], delen.map(function(q){ return q.b ? strookTris(q.a, q.b) : []; })) } : null, bbP(delen.map(function(q){ return q.poly; }), 1.5));
    if (vooraan) p.vooraan = 1;
    return p;
  }
  /* rand van een hoed: een ring van de kroon naar buiten, in een voorste en een achterste helft.
     zak: hoeveel de buitenkant zakt, golf: extra zakken opzij (negatief: de rand krult omhoog, zoals bij een cowboyhoed). */
  function rRand(C, F, d){
    var n = C.klein ? 8 : 14, ts = Math.atan2(F.xz, F.fz), ri = d.r0 - .15, ru = d.r0 + d.uit, lw = (d.lw || 1.3) * C.sc;
    function zk(t){ var s = Math.sin(t); return d.zak + (d.golf || 0) * s * s; }
    function kant(t){ var sg = Math.atan2(zk(t), d.uit); return F.uz * Math.cos(sg) + (F.xz * Math.sin(t) + F.fz * Math.cos(t)) * Math.sin(sg); }
    [ts + PI / 2, ts - PI / 2].forEach(function(van, voor){
      var b = [], bi = [], i;
      for (i = 0; i <= n; i++){ var t = van + i / n * PI, st = Math.sin(t), ct = Math.cos(t); b.push(pt(F, ru * st, d.h - zk(t), ru * ct)); bi.push(pt(F, ri * st, d.h, ri * ct)); }
      var boven = kant(van + PI / 2) > 0;
      function maak(D){
        var s = '<path d="' + D + '"' + verf(boven ? kv(C, d.k, 'L') : (d.onder || meng(d.k, INKT, .32)), d.l, lw) + '/>';
        if (voor && !C.klein) (d.ringen || []).forEach(function(q){
          var u = []; for (var j = 0; j <= n; j++){ var t2 = van + j / n * PI, r = ri + (ru - ri) * q; u.push(pt(F, r * Math.sin(t2), d.h - zk(t2) * q, r * Math.cos(t2))); }
          s += '<path d="' + lijnD(u) + '" fill="none" stroke="' + d.l + '" stroke-opacity=".45" stroke-width="1"/>';
        });
        return s;
      }
      if (d.halo !== false) C.halo += haloD(C, lijnD(b.concat(bi.slice().reverse()), 1));
      if (voor){
        var sv = splits(C, b, bi, 1.6);
        strookStuk(C, sv.zie, 'voor', b[n >> 1][2], maak);
        if (sv.weg.length || C.vast) strookStuk(C, sv.weg, 'achter', b[n >> 1][2], maak);
        var sp = b.map(function(q){ return opBol(q, C.Rsch); }).concat(bi.slice().reverse().map(function(q){ return opBol(q, C.Rsch); }));
        C.schaduw += '<path d="' + lijnD(sp, 1) + '" fill="' + SCHK + '" fill-opacity=".14" stroke="' + SCHK + '" stroke-opacity=".06" stroke-width="4" stroke-linejoin="round"/>';
        var zv = -1e9; b.forEach(function(q){ if (q[2] > zv) zv = q[2]; }); C.hoedVoorZ = Math.max(C.hoedVoorZ, zv);
      } else {
        var sp2 = splits(C, b, bi);
        strookStuk(C, sp2.weg, 'achter', b[n >> 1][2], maak);
        var kg = C.hoedGordijn, pr = strookStuk(C, sp2.zie, 'voor', b[n >> 1][2], kg ? function(D){ return knip(kg, maak(D)); } : maak, 1);
        if (pr && kg && C.proef) pr.knip = kg.poly;
      }
    });
  }
  /* wand: een kroon of band om de as, van h0 tot een bovenrand (top: [graden, hoogte], gespiegeld, of rond
     de hele as met rond:1). De achterste helft toont de binnenkant. */
  function wandMaten(d){
    var hm = d.hm != null ? d.hm : d.h1;
    return {
      hT:function(t){ if (!d.top) return d.h1; var a = ((t / GR) % 360 + 360) % 360; if (!d.rond && a > 180) a = 360 - a; var T = d.top;
        for (var i = 1; i < T.length; i++) if (a <= T[i][0]) return T[i - 1][1] + (T[i][1] - T[i - 1][1]) * (a - T[i - 1][0]) / ((T[i][0] - T[i - 1][0]) || 1);
        return T[T.length - 1][1]; },
      rH:function(h){ return d.r0 + (d.r1 - d.r0) * (h - d.h0) / ((hm - d.h0) || 1); }
    };
  }
  function rWand(C, F, d){
    var n = C.klein ? 10 : 18, ts = Math.atan2(F.xz, F.fz), lw = (d.lw || 1.3) * C.sc, W = wandMaten(d);
    function hoeken(van){
      var u = [], i; for (i = 0; i <= n; i++) u.push(van + i / n * PI);
      (d.top || []).forEach(function(q){ (d.rond ? [q[0]] : [q[0], -q[0]]).forEach(function(g){ var t = van + ((g * GR - van) % TAU + TAU) % TAU; if (t > van + .01 && t < van + PI - .01) u.push(t); }); });
      return u.sort(function(a, b){ return a - b; });
    }
    var kw = null;
    if (!d.S && d.h0 <= 0){ var ring = []; for (var j = 0; j < 24; j++){ var tj = j / 24 * TAU; ring.push(pt(F, d.r0 * Math.sin(tj), d.h0, d.r0 * Math.cos(tj))); } kw = gordijn(C, ring, F); }
    [ts + PI / 2, ts - PI / 2].forEach(function(van, voor){
      var T = hoeken(van), o = [], b = [];
      T.forEach(function(t){ var st = Math.sin(t), ct = Math.cos(t), h = W.hT(t), r = W.rH(h); o.push(pt(F, d.r0 * st, d.h0, d.r0 * ct)); b.push(pt(F, r * st, h, r * ct)); });
      var glad = d.glad && !C.klein;
      function maak(D){
        if (glad && voor && D.split('M').length === 2) D = zachtD(o.concat(b.slice().reverse()));
        var s = '<path d="' + D + '"' + verf(voor ? kv(C, d.k, 'L') : (d.binnen || meng(d.k, INKT, .3)), d.l, lw) + '/>';
        if (voor && !C.klein) (d.lijnen || []).forEach(function(q){
          var u = [], runs = ''; T.forEach(function(t){ if (q[0] <= W.hT(t)){ var r = W.rH(q[0]) + .3; u.push(pt(F, r * Math.sin(t), q[0], r * Math.cos(t))); } else { if (u.length > 1) runs += lijnD(u); u = []; } });
          if (u.length > 1) runs += lijnD(u);
          s += '<path d="' + runs + '" fill="none" stroke="' + q[1] + '" stroke-width="' + n1(q[2]) + '"' + (q[3] ? ' stroke-opacity="' + q[3] + '"' : '') + ' stroke-linecap="round"/>';
        });
        return s;
      }
      if (d.halo !== false && (voor || d.open)) C.halo += haloD(C, lijnD(o.concat(b.slice().reverse()), 1));
      if (voor){
        var opHoofd = !d.S && d.h0 <= 0, sv = opHoofd ? { weg:[], zie:[{ poly:o.concat(b.slice().reverse()), a:o, b:b }] } : splits(C, o, b, 1.6);

        var pv = strookStuk(C, sv.zie, 'voor', o[o.length >> 1][2], kw ? function(D){ return knip(kw, maak(D)); } : maak);
        if (pv && kw && C.proef) pv.knip = kw.poly;
        if (sv.weg.length || C.vast) strookStuk(C, sv.weg, 'achter', o[o.length >> 1][2], maak);
        if (d.raakSchaduw) C.schaduwBoog = o;
        var zv = -1e9; o.forEach(function(q){ if (q[2] > zv) zv = q[2]; }); C.hoedVoorZ = Math.max(C.hoedVoorZ, zv);
      } else {
        var sp = d.open ? splits(C, o, b) : { weg:[{ poly:o.concat(b.slice().reverse()), a:o, b:b }], zie:[] };
        strookStuk(C, sp.weg, 'achter', d.open ? o[o.length >> 1][2] - 1 : Math.max(o[0][2], o[o.length - 1][2]), maak);
        var pz = strookStuk(C, sp.zie, 'voor', o[o.length >> 1][2] - 1, kw ? function(D){ return knip(kw, maak(D)); } : maak, 1);
        if (pz && kw && C.proef) pz.knip = kw.poly;
      }
    });
  }
  function rBol(C, F, d){
    var c = pt(F, d.c[0], d.c[1], d.c[2]), r = d.r * F.s, laag = d.laag || 'voor';
    if (laag === 'auto') laag = voorHoofd(C, [c[0], c[1], c[2] - r * (d.voorDrempel != null ? d.voorDrempel : .5)]) ? 'voor' : 'achter';
    var a = ' cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" r="' + n1(r) + '"';
    var s = '<circle' + a + verf(kv(C, d.k, 'B'), d.l, (d.lw || 1.2) * C.sc) + '/>';
    if (d.vlek){
      var v = d.vlek, nv = eenh([F.x[0] * v.n[0] + F.u[0] * v.n[1] + F.f[0] * v.n[2], F.x[1] * v.n[0] + F.u[1] * v.n[1] + F.f[1] * v.n[2], F.x[2] * v.n[0] + F.u[2] * v.n[1] + F.f[2] * v.n[2]]);
      var rv = v.r * F.s, h = Math.sqrt(Math.max(r * r - rv * rv, 0)), vc = [c[0] + nv[0] * h, c[1] + nv[1] * h], hk = Math.atan2(nv[1], nv[0]) / GR;
      s += '<ellipse cx="' + n1(vc[0]) + '" cy="' + n1(vc[1]) + '" rx="' + n1(Math.max(.1, rv * Math.abs(nv[2]))) + '" ry="' + n1(rv) + '" transform="rotate(' + n1(hk) + ' ' + n1(vc[0]) + ' ' + n1(vc[1]) + ')" fill="' + v.k + '"' + (nv[2] > .05 ? '' : ' opacity="0"') + '/>';
    }
    /* een bol op een krans: dezelfde knipvorm als de krans (wat het hoofd verbergt, valt weg) */
    var kb = d.opRing && C.ringKnip;
    if (d.richtKnip && C.ringKnip){ var rl = Math.sqrt(d.c[0] * d.c[0] + d.c[2] * d.c[2]) || 1; if ((F.xz * d.c[0] + F.fz * d.c[2]) / rl > 0) kb = C.ringKnip; else laag = 'achter'; }
    var pb = stuk(C, kb ? 'voor' : laag, c[2] + (d.dz || 0), kb ? knip(kb, s) : s, { bol:[c[0], c[1], c[2], r] }, [c[0] - r, c[1] - r, c[0] + r, c[1] + r]);
    if (kb && C.proef) pb.knip = kb.poly;
  }
  /* buis: een staaf langs punten; r1 erbij: hij loopt taps toe (hoorntjes). om: hij loopt om het hoofd
     heen en is alleen te zien waar hij voor het hoofd langs gaat (pootjes, bandjes). */
  function rBuis(C, F, d){
    var P = d.pts.map(function(q){ return pt(F, q[0], q[1], q[2]); }), lw = (d.lw || 1) * C.sc, s, z = 0, i, proef = null;
    P.forEach(function(p){ z += p[2]; }); z /= P.length;
    var laag = d.laag || 'voor';
    /* laagPunt: de laag volgt een ander punt (het eind van een beugel gaat mee met de schelp waar hij in zit) */
    if (laag === 'auto') laag = d.laagPunt ? (voorHoofd(C, pt(F, d.laagPunt[0], d.laagPunt[1], d.laagPunt[2])) ? 'voor' : 'achter') : z > 0 ? 'voor' : 'achter';
    if (d.r1 != null){
      var n = P.length, L = [], R2 = [];
      for (i = 0; i < n; i++){
        var a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.sqrt(tx * tx + ty * ty) || 1, r = (d.r + (d.r1 - d.r) * i / (n - 1)) * F.s;
        L.push([P[i][0] - ty / tl * r, P[i][1] + tx / tl * r]); R2.push([P[i][0] + ty / tl * r, P[i][1] - tx / tl * r]);
      }
      var poly = L.concat(R2.reverse()), D = C.klein ? lijnD(poly, 1) : zachtD(poly);
      s = '<path d="' + D + '"' + verf(kv(C, d.k, 'L'), d.l, lw) + '/>'; var bb = bbP([poly], lw);
      if (d.anker && !d.S){ var q0 = d.pts[0], rb = d.r, kb = gordijn(C, [pt(F, q0[0] - rb, q0[1], q0[2]), pt(F, q0[0], q0[1], q0[2] + rb), pt(F, q0[0] + rb, q0[1], q0[2])], F, 1); s = knip(kb, s); C.knipBuis = kb.poly; }
      if (C.proef){ var caps = []; for (i = 1; i < n; i++) caps.push([P[i - 1], P[i], (d.r + (d.r1 - d.r) * (i - .5) / (n - 1)) * F.s]); proef = { poly:[poly], caps:caps }; if (d.anker && !d.S) proef.knip = C.knipBuis; }
    } else {
      var rr = d.r * F.s, runs = [], loop = [];
      /* verborgen als het midden of de binnenkant van de staaf (naar het midden van het hoofd toe) achter het hoofd ligt;
         om 2: alleen het midden (een lok die over het hoofd ligt, niet eromheen) */
      var weg = function(p){ if (C.H.verborgen(p)) return true; if (d.om === 2) return false; var l = Math.sqrt(p[0] * p[0] + p[1] * p[1]) || 1; return C.H.verborgen([p[0] - p[0] / l * rr, p[1] - p[1] / l * rr, p[2]]); };
      P.forEach(function(p){ if (d.om && weg(p)){ if (loop.length > 1) runs.push(loop); loop = []; } else loop.push(p); });
      if (loop.length > 1) runs.push(loop);
      var bb = bbP(runs, rr + lw), D2 = runs.map(function(q){ return lijnD(q); }).join(''), lc = '" stroke-linecap="' + (d.om && !d.kap ? 'butt' : 'round') + '" stroke-linejoin="round"/>';
      s = (d.l ? '<path d="' + D2 + '" fill="none" stroke="' + d.l + '" stroke-width="' + n1(2 * rr + 2 * lw) + lc : '') +
        '<path d="' + D2 + '" fill="none" stroke="' + d.k + '" stroke-width="' + n1(2 * rr) + (d.streep ? '" stroke-dasharray="' + d.streep : '') + lc;
      if (d.glans && !C.klein) s += '<path d="' + D2 + '" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="' + n1(rr * .6) + '" transform="translate(' + n1(-rr * .3) + ',' + n1(-rr * .35) + ')' + lc;
      if (C.proef){ var cp = []; runs.forEach(function(q){ for (var j = 1; j < q.length; j++) cp.push([q[j - 1], q[j], rr]); }); proef = { caps:cp, stomp:d.om && !d.kap }; }
    }
    stuk(C, laag, z + (d.dz || 0), s, proef, bb);
  }
  /* vlak: een plaat (oor, klep); de achterkant krijgt een eigen kleur, de dikte zie je als hij draait */
  function rVlak(C, F, d){
    var P = d.pts.map(function(q){ return pt(F, q[0], q[1], q[2]); }), z = 0, lw = (d.lw || 1.2) * C.sc, s = '';
    P.forEach(function(p){ z += p[2]; }); z /= P.length;
    var nv = eenh([F.x[0] * d.n[0] + F.u[0] * d.n[1] + F.f[0] * d.n[2], F.x[1] * d.n[0] + F.u[1] * d.n[1] + F.f[1] * d.n[2], F.x[2] * d.n[0] + F.u[2] * d.n[1] + F.f[2] * d.n[2]]);
    var voorkant = nv[2] >= 0, kant = voorkant ? 1 : -1, licht = kant * (nv[0] * LICHT[0] + nv[1] * LICHT[1] + nv[2] * LICHT[2]);
    var laag = d.laag || 'voor'; if (laag === 'auto') laag = voorHoofd(C, [P.reduce(function(s, p){ return s + p[0]; }, 0) / P.length, P.reduce(function(s, p){ return s + p[1]; }, 0) / P.length, z]) ? 'voor' : 'achter';
    /* een klep aan de kroon: ervoor als de plek waar hij vastzit naar je toe kijkt */
    if (d.richt) laag = F.x[2] * d.richt[0] + F.u[2] * d.richt[1] + F.f[2] * d.richt[2] > 0 ? 'voor' : 'achter';
    var lijn = d.l ? (d.lc ? d.l : tint(d.l, licht)) : null;
    if (d.dik && !C.klein){
      var dk = -kant * d.dik * F.s, Q = P.map(function(p){ return [p[0] + nv[0] * dk, p[1] + nv[1] * dk]; });
      s += '<path d="' + (d.glad ? zachtD(Q) : lijnD(Q, 1)) + '"' + verf(meng(d.ka || d.k, INKT, .3), lijn ? meng(lijn, INKT, .3) : null, lw) + (d.lc ? ' stroke-linecap="round"' : '') + '/>';
    }
    var D = d.glad ? zachtD(P) : lijnD(P, 1);
    s += '<path d="' + D + '"' + verf(tint(voorkant ? d.k : (d.ka || meng(d.k, INKT, .15)), licht), lijn, lw) + (d.lc ? ' stroke-linecap="round"' : '') + '/>';
    if (d.binnen){
      var B = d.binnen.map(function(q){ return pt(F, q[0], q[1], q[2]); });
      s += '<path d="' + (d.glad ? zachtD(B) : lijnD(B, 1)) + '"' + verf(tint(d.kb, licht), d.lb ? tint(d.lb, licht) : null, (d.lwb || 1) * C.sc) + (voorkant ? '' : ' opacity="0"') + '/>';
    }
    if (d.halo) C.halo += haloD(C, D);
    var proef = null, bbv = bbP([P], lw + (d.dik || 0) * F.s), kv = null;
    if (d.voet && !d.S){ var lo = 1e9; d.pts.forEach(function(q){ lo = Math.min(lo, q[1]); }); var voet = []; d.pts.forEach(function(q, i){ if (q[1] < lo + 3) voet.push(P[i]); }); if (voet.length > 1) kv = gordijn(C, voet, F, 1); }
    if (kv) s = knip(kv, s);
    if (C.proef){ var tr = [], c = [0, 0, 0]; P.forEach(function(p){ c[0] += p[0] / P.length; c[1] += p[1] / P.length; c[2] += p[2] / P.length; }); P.forEach(function(p, i){ tr.push([c, p, P[(i + 1) % P.length]]); }); proef = { poly:[P], tris:tr, rand:d.lc ? lw / 2 : 0 }; }
    var pv2 = stuk(C, laag, z + (d.dz || 0), s, proef, bbv);
    if (kv && C.proef) pv2.knip = kv.poly;
  }
  /* doos: een blok met een vierkante doorsnede (stempel, metronoom, baret), smaller naar boven als w1 < w0 */
  function doosPunten(d){
    var u = [], c = Math.cos((d.draai || 0) * GR), s2 = Math.sin((d.draai || 0) * GR);
    [[d.h0, d.w0, d.d0], [d.h1, d.w1, d.d1]].forEach(function(q){ [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function(k){ var x = k[0] * q[1], z = k[1] * q[2]; u.push([x * c - z * s2, q[0], x * s2 + z * c]); }); });
    return u;
  }
  var DOOSVLAKKEN = [[3, 2, 6, 7], [1, 0, 4, 5], [0, 3, 7, 4], [2, 1, 5, 6], [7, 6, 5, 4], [0, 1, 2, 3]];
  function rDoos(C, F, d){
    var V = doosPunten(d).map(function(q){ return pt(F, q[0], q[1], q[2]); }), lw = (d.lw || 1.3) * C.sc, mid = [0, 0, 0], s = '', onder = '', zichtVoor = false, i;
    V.forEach(function(p){ mid[0] += p[0] / 8; mid[1] += p[1] / 8; mid[2] += p[2] / 8; });
    var proef = C.proef ? { poly:[], tris:[] } : null, proefO = C.proef ? { poly:[], tris:[] } : null;
    DOOSVLAKKEN.forEach(function(f, nr){
      var a = V[f[0]], b = V[f[1]], c = V[f[2]], e = V[f[3]];
      var u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [e[0] - a[0], e[1] - a[1], e[2] - a[2]];
      var nv = eenh([u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]);
      var fc = [(a[0] + c[0]) / 2 - mid[0], (a[1] + c[1]) / 2 - mid[1], (a[2] + c[2]) / 2 - mid[2]];
      if (nv[0] * fc[0] + nv[1] * fc[1] + nv[2] * fc[2] < 0) nv = [-nv[0], -nv[1], -nv[2]];
      var zicht = nv[2] > .015, poly = [a, b, c, e];
      if (nr === 0) zichtVoor = zicht;
      var t = '<path d="' + (zicht ? lijnD(poly, 1) : '') + '"' + verf(tint(nr === 4 && d.kt ? d.kt : d.k, nv[0] * LICHT[0] + nv[1] * LICHT[1] + nv[2] * LICHT[2]), d.l, lw) + '/>';
      if (nr === 5) onder = t; else s += t;
      var doel = nr === 5 ? proefO : proef;
      if (doel && zicht){ doel.poly.push(poly); doel.tris.push([a, b, c], [a, c, e]); }
    });
    C.doosVoor = zichtVoor;
    var bbd = bbP([V], lw);
    /* de onderkant van een blok dat op het hoofd staat, tekenen we niet: van onderen gezien zit het hoofd ervoor */
    if (!d.onder && (onder.indexOf('d=""') < 0 || C.vast)) stuk(C, 'achter', mid[2], onder, proefO, bbd);
    stuk(C, d.laag || 'voor', mid[2], s, proef, bbd);
  }
  /* ring: een torus (aureool, krans), in een achterste en een voorste helft */
  function rRing(C, F, d){
    var n = C.klein ? 10 : 16, ts = Math.atan2(F.xz * (d.ex || 1), F.fz), rt = d.rt * F.s, lc = '" stroke-linecap="round" stroke-linejoin="round"/>';
    function maak(D, stomp){
      var l2 = stomp ? lc.replace('round', 'butt') : lc;
      var s = (d.l ? '<path d="' + D + '" fill="none" stroke="' + d.l + '" stroke-width="' + n1(2 * rt + 1.6 * C.sc) + l2 : '') + '<path d="' + D + '" fill="none" stroke="' + d.k + '" stroke-width="' + n1(2 * rt) + l2;
      if (d.glans && !C.klein) s += '<path d="' + D + '" fill="none" stroke="#fff" stroke-opacity="' + d.glans + '" stroke-width="' + n1(rt * .7) + l2;
      return s;
    }
    /* een ring die laag op de hoed ligt (op het hoofd) krijgt een gordijn: wat het hoofd verbergt, valt weg */
    var laagOp = !d.S && d.h <= 1.5, kr = null;
    if (laagOp){ var ring = []; for (var j = 0; j < 24; j++){ var tj = j / 24 * TAU; ring.push(pt(F, d.r * Math.sin(tj) * (d.ex || 1), d.h, d.r * Math.cos(tj))); } kr = C.ringKnip = gordijn(C, ring, F); }
    [ts + PI / 2, ts - PI / 2].forEach(function(van, voor){
      var u = [], i; for (i = 0; i <= n; i++){ var t = van + i / n * PI; u.push(pt(F, d.r * Math.sin(t) * (d.ex || 1), d.h, d.r * Math.cos(t))); }
      if (d.halo) C.halo += '<path d="' + lijnD(u) + '" fill="none" stroke="#fff" stroke-opacity=".42" stroke-width="' + n1(2 * rt + C.rim * 1.8) + lc;
      var sp = voor && laagOp ? { weg:[], zie:[{ poly:u, a:u }] } : splits(C, u, null, voor ? 1.6 : -rt * .5, voor ? rt : 0), stomp = !voor;
      function caps(l){ var cp = []; l.forEach(function(q){ for (var j = 1; j < q.poly.length; j++) cp.push([q.poly[j - 1], q.poly[j], rt]); }); return cp; }
      [[sp.weg, 'achter', 0], [sp.zie, 'voor', voor ? 0 : 1]].forEach(function(q, k){
        if (!q[0].length && !C.vast) return;
        var mk = maak(q[0].map(function(w){ return lijnD(w.poly); }).join(''), stomp), kn = kr && q[1] === 'voor';
        var p = stuk(C, q[1], u[n >> 1][2] + (d.dz || 0), kn ? knip(kr, mk) : mk, { caps:C.proef ? caps(q[0]) : [], stomp:stomp }, bbP(q[0].map(function(w){ return w.poly; }), rt + 1));
        if (q[2]) p.vooraan = 1;
        if (kn && C.proef) p.knip = kr.poly;
      });
    });
  }
  /* versiering op het oppervlak van een kroon, wand of doos: ze buigt mee en verdwijnt als je hem van opzij ziet */
  function rSticker(C, F, d){
    var host = d.host, ex = host.ex || 1, ez = host.ez || 1, W = host.t === 'wand' ? wandMaten(host) : null, doos = host.t === 'doos';
    var rOp = W ? W.rH : function(h){ return profR(host.p, h); };
    var a0 = (d.a || 0) * GR;
    function P(t, h, off){ if (doos){ var zf = host.d0 + (host.d1 - host.d0) * (h - host.h0) / ((host.h1 - host.h0) || 1); return pt(F, t, h, zf + (off || .3)); } var r = rOp(h) + (off || .3); return pt(F, r * Math.sin(t) * ex, h, r * Math.cos(t) * ez); }
    function kijkt(t){ return doos ? (C.doosVoor ? 1 : 0) : F.xz * Math.sin(t) * ex + F.fz * Math.cos(t) * ez; }
    function tt(x, h){ return doos ? x : a0 + x / Math.max(rOp(h), 2); }
    var v = kijkt(a0), op = v <= .02 ? 0 : v < .3 ? v / .3 : 1, s = '', lw = (d.lw || 1) * C.sc;
    if (op === 0 && !C.vast && d.soort !== 'lijn' && d.soort !== 'boog' && d.soort !== 'band') return;
    var opa = op < 1 ? ' opacity="' + n1(op) + '"' : '';
    if (d.soort === 'ster' || d.soort === 'pad'){
      var pts = [];
      if (d.soort === 'ster') for (var i = 0; i < 10; i++){ var a = -PI / 2 + i * PI / 5, rr = i % 2 ? d.r * .45 : d.r, sx = Math.cos(a) * rr, sy = Math.sin(a) * rr, h = d.h - sy; pts.push(P(tt(sx, h), h)); }
      else d.pts.forEach(function(q){ var h2 = -(q[1] + 30); pts.push(P(tt(q[0], h2), h2)); });
      s = '<path d="' + lijnD(pts, 1) + '"' + verf(d.k, d.l, lw) + opa + '/>';
    } else if (d.soort === 'stip'){
      var c = P(a0, d.h);
      s = '<ellipse cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" rx="' + n1(d.r * F.s * (doos ? 1 : .35 + .65 * Math.max(0, v))) + '" ry="' + n1(d.r * F.s) + '"' + verf(d.k, d.l, lw) + opa + '/>';
    } else {
      /* lijnen en banden: alleen het stuk dat naar je toe staat */
      var runs = '', loop = [], j, ts = Math.atan2(F.xz * ex, F.fz * ez);
      if (d.soort === 'band'){
        var o = [], b = [];
        for (j = 0; j <= 24; j++){ var t = ts - PI / 2 - .2 + j / 24 * (PI + .4); if (kijkt(t) < 0) continue; o.push(P(t, d.h0, .35)); b.push(P(t, d.h1, .35)); }
        s = '<path d="' + (o.length > 1 ? lijnD(o.concat(b.reverse()), 1) : '') + '"' + verf(d.k, d.l, lw) + '/>';
      } else {
        var lijst = d.soort === 'boog' ? null : d.pts;
        var stap = function(t, h){ if (kijkt(t) > .03) loop.push(P(t, h)); else { if (loop.length > 1) runs += lijnD(loop); loop = []; } };
        if (!lijst) for (j = 0; j <= 20; j++) stap(ts - PI / 2 + j / 20 * PI, d.h);
        else for (j = 1; j < lijst.length; j++) for (var k = j === 1 ? 0 : 1; k <= 4; k++){
          var q0 = lijst[j - 1], q1 = lijst[j], f = k / 4, hh = q0[1] + (q1[1] - q0[1]) * f;
          stap(doos ? q0[0] + (q1[0] - q0[0]) * f : (q0[0] + (q1[0] - q0[0]) * f) * GR, hh);
        }
        if (loop.length > 1) runs += lijnD(loop);
        s = '<path d="' + runs + '" fill="none" stroke="' + d.k + '" stroke-width="' + n1(d.w * C.sc) + '"' + (d.op ? ' stroke-opacity="' + d.op + '"' : '') + (d.streep ? ' stroke-dasharray="' + d.streep + '"' : '') + ' stroke-linecap="round"/>';
      }
    }
    C.laatst.s += s;
  }

  /* ---------- het haar van Ferry (h23): een schil om het hoofd, begrensd door een haarlijn ---------- */
  function schil(K, c, a){
    var C2 = rot3(K, c), AX = rot3(K, [a[0], 0, 0]), AY = rot3(K, [0, a[1], 0]), AZ = rot3(K, [0, 0, a[2]]);
    var iv = [-K.sy * K.cp, -K.sp, K.cy * K.cp];   /* de kijkrichting terug in het hoofd */
    var w = eenh([iv[0] / a[0], iv[1] / a[1], iv[2] / a[2]]);
    var hulp = Math.abs(w[1]) < .9 ? [0, 1, 0] : [1, 0, 0];
    var e1 = eenh([w[1] * hulp[2] - w[2] * hulp[1], w[2] * hulp[0] - w[0] * hulp[2], w[0] * hulp[1] - w[1] * hulp[0]]), e2 = [w[1] * e1[2] - w[2] * e1[1], w[2] * e1[0] - w[0] * e1[2], w[0] * e1[1] - w[1] * e1[0]];
    return { C:C2, w:w, e1:e1, e2:e2, a:a,
      op:function(u){ return [C2[0] + u[0] * AX[0] + u[1] * AY[0] + u[2] * AZ[0], C2[1] + u[0] * AX[1] + u[1] * AY[1] + u[2] * AZ[1], C2[2] + u[0] * AX[2] + u[1] * AY[2] + u[2] * AZ[2]]; },
      rand:function(al){ var ca = Math.cos(al), sa = Math.sin(al); return [ca * e1[0] + sa * e2[0], ca * e1[1] + sa * e2[1], ca * e1[2] + sa * e2[2]]; },
      hoek:function(u){ return Math.atan2(u[0] * e2[0] + u[1] * e2[1] + u[2] * e2[2], u[0] * e1[0] + u[1] * e1[1] + u[2] * e1[2]); } };
  }
  function dot3(a, b){ return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function binnenPoly(p, poly){
    var b = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++){ var a = poly[i], c = poly[j]; if ((a[1] > p[1]) !== (c[1] > p[1]) && p[0] < (c[0] - a[0]) * (p[1] - a[1]) / (c[1] - a[1]) + a[0]) b = !b; }
    return b;
  }
  /* het stuk van de schil binnen de haarlijn dat je ziet, aan de voorkant (kant 1) of de achterkant (-1) */
  function schilStuk(E, lijn, binnen, kant){
    var n = lijn.length, s = new Array(n), i, aan = 0;
    for (i = 0; i < n; i++){ s[i] = kant * dot3(lijn[i], E.w); if (s[i] >= 0) aan++; }
    var pool = [E.w[0] * kant, E.w[1] * kant, E.w[2] * kant];
    function scherm(u){ var P = E.op(u); return [P[0], P[1], P[2]]; }
    function heleRand(){ var r = []; for (var k = 0; k < 36; k++) r.push(scherm(E.rand(k / 36 * TAU))); return r; }
    if (!aan) return binnen(pool) ? [heleRand()] : [];
    if (aan === n){ var poly = lijn.map(scherm); return binnen(pool) === binnenPoly(scherm(pool), poly) ? [poly] : [heleRand(), poly]; }
    function snij(a, b, sa, sb){ var t = sa / (sa - sb), u = eenh([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]), k = dot3(u, E.w); return eenh([u[0] - E.w[0] * k, u[1] - E.w[1] * k, u[2] - E.w[2] * k]); }
    var start = 0; while (!(s[start] >= 0 && s[(start - 1 + n) % n] < 0)) start++;
    var runs = [], run = null;
    for (var k2 = 0; k2 < n; k2++){
      var j = (start + k2) % n, vj = (j - 1 + n) % n, nj = (j + 1) % n;
      if (s[j] >= 0){
        if (s[vj] < 0){ var ui = snij(lijn[vj], lijn[j], s[vj], s[j]); run = { inA:E.hoek(ui), pts:[scherm(ui)] }; }
        run.pts.push(scherm(lijn[j]));
        if (s[nj] < 0){ var uu = snij(lijn[j], lijn[nj], s[j], s[nj]); run.uitA = E.hoek(uu); run.pts.push(scherm(uu)); runs.push(run); run = null; }
      }
    }
    var gebruikt = runs.map(function(){ return false; }), uit = [];
    for (var r0 = 0; r0 < runs.length; r0++){
      if (gebruikt[r0]) continue;
      var pts = [], r = r0, wacht = 0;
      while (!gebruikt[r] && wacht++ < 30){
        gebruikt[r] = true; pts = pts.concat(runs[r].pts);
        var ae = runs[r].uitA, pr = E.rand(ae + .07), proef = eenh([pr[0] + E.w[0] * kant * .05, pr[1] + E.w[1] * kant * .05, pr[2] + E.w[2] * kant * .05]), dir = binnen(proef) ? 1 : -1;
        var beste = r, bd = 99;
        for (var q = 0; q < runs.length; q++){ var dd = ((runs[q].inA - ae) * dir) % TAU; if (dd < 0) dd += TAU; if (dd < bd){ bd = dd; beste = q; } }
        var stappen = Math.ceil(bd / .16);
        for (var st = 1; st < stappen; st++) pts.push(scherm(E.rand(ae + dir * bd * st / stappen)));
        r = beste;
      }
      uit.push(pts);
    }
    return uit;
  }
  function richting(th, ph){ var c = Math.cos(ph); return [c * Math.sin(th), -Math.sin(ph), c * Math.cos(th)]; }
  function hoekVan(u){ return Math.atan2(u[0], u[2]); }
  function hoogteVan(u){ return Math.asin(klem(-u[1], -1, 1)); }
  /* de haarlijn van Ferry: hoogte (graden) per hoek rond het hoofd (graden, 0 is voor): laag opzij, een
     inkeping bij de scheiding, en van achteren tot onder de oren */
  var FERRY = {
    lijn:function(g){ var a = Math.abs(g), b = a <= 90 ? 18 + 27 * Math.pow(Math.cos(a * GR), 1.2) : 18 - 26 * Math.sin((a - 90) * GR); return b + 14 * Math.max(0, 1 - Math.abs(g - 4) / 6); },
    punten:[-2, 4, 10], dikte:[3, 4.4, 2.4], kleur:'#3A2E2A', lijnK:'#1f1714'
  };
  function haarlijn(ks, verschuif, grof){
    var gs = [], i, stap = grof ? 6 : 3;
    for (i = 0; i < 360 / stap; i++) gs.push(-180 + i * stap);
    ks.punten.forEach(function(g){ gs.push(g); });
    gs.sort(function(a, b){ return a - b; });
    return gs.map(function(g){ return richting(g * GR, (ks.lijn(g) + (verschuif || 0)) * GR); });
  }
  function binnenVan(ks, verschuif){ return function(u){ return hoogteVan(u) > (ks.lijn(hoekVan(u) / GR) + (verschuif || 0)) * GR; }; }
  function rHaar(C, d){
    var ks = FERRY, E = schil(C.K, d.c, d.a), lijn = haarlijn(ks, 0, C.klein), binnen = binnenVan(ks, 0), lw = 1.3 * C.sc;
    var vD = schilStuk(E, lijn, binnen, 1), aD = schilStuk(E, lijn, binnen, -1);
    var V = vD.map(function(q){ return lijnD(q, 1); }).join(''), A = aD.map(function(q){ return lijnD(q, 1); }).join('');
    var donker = meng(ks.kleur, '#000000', .3);
    C.halo += '<path d="' + A + '" fill="none" stroke="#fff" stroke-opacity=".4" stroke-linejoin="round" stroke-width="' + n1(C.rim * 1.8 + 1.5) + '"/><path d="' + V + '" fill="none" stroke="#fff" stroke-opacity=".4" stroke-linejoin="round" stroke-width="' + n1(C.rim * 1.8 + 1.5) + '"/>';
    stuk(C, 'achter', E.C[2] - 10, '<path d="' + A + '"' + verf(donker, ks.lijnK, lw) + '/>', C.proef ? { poly:aD, ell:{ c:E.C, a:d.a, K:C.K, c0:d.c }, kant:-1 } : null, bbP(aD, 1));
    var s = '<path d="' + V + '"' + verf(kv(C, ks.kleur, 'B'), ks.lijnK, lw) + '/>';
    if (!C.klein){
      /* lokken: lijnen over de schil van de kruin naar de haarlijn */
      var kruin = richting(-10 * GR, 76 * GR), sl = '';
      [-70, -45, -22, 22, 45, 70, -120, 120].forEach(function(g){
        var eind = richting(g * GR, (ks.lijn(g) + 2) * GR), loop = [];
        for (var t = 0; t <= 1.001; t += 1 / 8){
          var u = eenh([kruin[0] * (1 - t) + eind[0] * t, kruin[1] * (1 - t) + eind[1] * t, kruin[2] * (1 - t) + eind[2] * t]);
          if (dot3(u, E.w) > .04) loop.push(E.op(u)); else if (loop.length){ if (loop.length > 1) sl += lijnD(loop); loop = []; }
        }
        if (loop.length > 1) sl += lijnD(loop);
      });
      s += '<path d="' + sl + '" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="1.2" stroke-linecap="round"/>';
    }
    stuk(C, 'voor', E.C[2], s, C.proef ? { poly:vD, ell:{ c:E.C, a:d.a, K:C.K, c0:d.c }, kant:1 } : null, bbP(vD, 1));
    /* schaduw op het voorhoofd: dezelfde haarlijn een stukje lager, iets naar rechtsonder */
    var sP = schilStuk(E, haarlijn(ks, -7, true), binnenVan(ks, -7), 1).map(function(q){ return lijnD(q, 1); }).join('');
    C.schaduw += '<path transform="translate(1.6,2.2)" d="' + sP + '" fill="' + SCHK + '" fill-opacity=".18"/>';
  }

  /* ---------- een lijst onderdelen tekenen in een stelsel ---------- */
  var TEKENAAR = { draai:rDraai, rand:rRand, wand:rWand, bol:rBol, buis:rBuis, vlak:rVlak, doos:rDoos, ring:rRing, sticker:rSticker };
  function tekenDelen(C, S, delen){
    var F0 = stelselV(C.K, S), eigen = {};
    delen.forEach(function(d){
      var F = F0;
      if (d.S){ F = eigen[d.Snr] || (eigen[d.Snr] = stelselV(C.K, d.S)); }
      C.deel = d.t === 'sticker' ? d.host : d;
      if (d.t === 'haar') rHaar(C, d); else TEKENAAR[d.t](C, F, d);
    });
  }

  /* ---------- de hoeden: elk onderdeel in de maten van het ontwerp (y omhoog, 0 is de onderkant van de kroon,
     30 eenheden boven de oude hoedrand van y -30), dezelfde kleuren als de platte hoeden van vroeger ---------- */
  function kwad(a, c, b, n){ var u = []; for (var i = 1; i <= n; i++){ var t = i / n, s = 1 - t; u.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]); } return u; }
  function stip(aan, a, h, r, k, l){ return { t:'sticker', aan:aan, soort:'stip', a:a, h:h, r:r, k:k, l:l, lw:.8 }; }
  function lijnS(aan, pts, k, w, op){ return { t:'sticker', aan:aan, soort:'lijn', pts:pts, k:k, w:w, op:op }; }
  function bandS(aan, h0, h1, k, l){ return { t:'sticker', aan:aan, soort:'band', h0:h0, h1:h1, k:k, l:l, lw:.7 }; }
  /* een plat oor of een ster: punten (x, y omhoog) in een vlak, eerst gekanteld (naar buiten), dan gedraaid */
  function plaat(pts, kantel, draai, mid, z){
    var a = kantel * GR, b = draai * GR, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
    return pts.map(function(q){ var x = q[0] - mid[0], y = q[1] - mid[1], x1 = x * ca - y * sa, y1 = x * sa + y * ca, z1 = q[2] || 0; return [mid[0] + x1 * cb + z1 * sb, mid[1] + y1, (z || 0) - x1 * sb + z1 * cb]; });
  }
  function sterPunten(cx, cy, r){ var u = []; for (var i = 0; i < 10; i++){ var a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * .45 : r; u.push([cx + Math.cos(a) * rr, cy - Math.sin(a) * rr]); } return u; }
  var HOEDEN = {
    1:function(){ return { kantel:8, delen:[
      { t:'wand', h0:0, h1:22, r0:24, r1:28, top:[[0, 22], [33, 8], [90, 18], [147, 8], [180, 22]], k:'#FFD166', l:'#c9971f', lw:1.6, binnen:'#c9971f', open:1, lijnen:[[3, '#c9971f', 1.6, .6]] },
      stip(0, 0, 12, 3, '#F26749'), stip(0, -36, 5, 2.2, '#204ECF'), stip(0, 36, 5, 2.2, '#204ECF')] }; },
    2:function(){ return { kantel:7, delen:[
      { t:'draai', p:[[0, 24], [9, 19.2], [18, 14.4], [26, 10.1], [32, 7.4, 2.5, -1.7], [37, 4.8, 6.6, -4.6], [40.5, 2.6, 11.1, -7.7], [42.5, 0, 15.6, -10.8]], k:'#6b3fa0', l:'#3f2266', lw:1.2 },
      bandS(0, 1.3, 4.8, '#FFD166', '#c9a33a'), { t:'sticker', aan:0, soort:'ster', a:-17, h:15, r:6, k:'#FFD166', l:'#c9971f', lw:.9 },
      stip(0, 43, 11, 1.8, '#FFD166'), stip(0, -3, 24, 1.4, '#FFD166'), stip(0, -72, 7, 1.5, '#FFD166'), stip(0, 77, 20, 1.3, '#FFD166'),
      { t:'rand', h:0, r0:24, uit:13, zak:1.6, k:'#6b3fa0', l:'#3f2266', lw:1.3 }] }; },
    3:function(){ return { kantel:-6, delen:[
      { t:'wand', h0:-5, h1:5, r0:39, r1:31, k:'#F3EFE9', l:'#d6cdbf', lw:1, lijnen:[[2.4, '#F26749', 2.6], [-2.4, '#204ECF', 2.6]] }] }; },
    4:function(){ return { kantel:10, delen:[
      { t:'draai', p:[[0, 28], [8, 27], [15, 24], [21, 18.5], [25, 12], [27.5, 5], [28, 0]], k:'#14224C', l:'#0b1433', lw:1.2 },
      { t:'sticker', aan:0, soort:'boog', h:6, k:'#c9971f', w:1.8 }, stip(0, 0, 14, 4.5, '#fff'), stip(0, -3.3, 15, 1.1, INKT), stip(0, 3.3, 15, 1.1, INKT),
      { t:'rand', h:0, r0:28, uit:9, zak:-2.5, golf:-4, k:'#14224C', l:'#c9971f', lw:1.6, onder:'#0b1433' }] }; },
    5:function(){ return { kantel:4, smal:1, delen:[-1, 1].map(function(k){
      return { t:'buis', pts:[[k * 16, 0, 4], [k * 18.5, 7, 3.5], [k * 20, 13, 2.5], [k * 19.6, 18, 1.5], [k * 18, 22, 1]], r:6, r1:.6, k:'#c0442c', l:'#8a2416', lw:1.5, anker:1 }; }) }; },
    6:function(){ return { kantel:14, zit:'top', delen:[{ t:'ring', h:9, r:20, rt:2, k:'#FFD166', l:'#e0b347', glans:.7, halo:1 }] }; },
    7:function(){ var u = [{ t:'ring', h:0, r:26, rt:1.6, k:'#2f7d52', raak:1, dz:-1000 }];
      for (var i = 0; i < 10; i++){ var a = i * 36 * GR, s = Math.sin(a), c = Math.cos(a);
        u.push({ t:'bol', c:[32.8 * s, .6, 32.8 * c], r:5, k:i % 2 ? '#FFD166' : '#F26749', richtKnip:1, dz:2, vlek:{ n:[s, .25, c], r:1.8, k:'#fff' } }); }
      return { kantel:-10, sorteer:1, delen:u }; },
    8:function(){ return { kantel:4, smal:1, delen:[
      { t:'draai', p:[[0, 17], [33, 0]], k:'#204ECF', l:'#16389a', lw:1.5 }, bandS(0, 7, 10.4, '#FFD166'), bandS(0, 17.5, 20.5, '#FFD166'),
      { t:'bol', c:[0, 37.8, 0], r:4.5, k:'#F26749', l:'#c0442c', lw:1 }] }; },
    9:function(){ return { kantel:6, delen:[
      { t:'draai', p:[[0, 31], [9, 28.5], [17, 23.5], [23, 17, 1, 0], [27, 12, 5, 0], [29, 8.5, 11, 0], [28.5, 6.5, 17, 0], [25.5, 5.5, 23, 0], [21, 5, 29, 0], [17, 4.5, 34, 0]], k:'#D23A2E', l:'#9f2519', lw:1.4 },
      { t:'wand', h0:-5, h1:6, r0:35, r1:33.5, k:'#F7F3EC', l:'#cfc4b6', lw:1.3, glad:1 },
      stip(1, -45, 0, 1.6, '#e4dbcf'), stip(1, -20, 2, 1.4, '#e4dbcf'), stip(1, 5, -1, 1.6, '#e4dbcf'), stip(1, 28, 2, 1.4, '#e4dbcf'), stip(1, 50, 0, 1.5, '#e4dbcf'),
      { t:'bol', c:[45.3, 11.7, 0], r:7.5, k:'#F7F3EC', l:'#cfc4b6', lw:1.3 }] }; },
    10:function(){ return { kantel:6, delen:[
      { t:'draai', p:[[0, 30], [8, 29], [14, 26.5], [19, 22], [23, 15], [25.3, 7], [26, 0]], k:'#EA9836', l:'#c96a1c', lw:1.2 },
      lijnS(0, [[-24, 1], [-24, 25]], '#c0442c', 2, .55), lijnS(0, [[24, 1], [24, 25]], '#c0442c', 2, .55), lijnS(0, [[-58, 1], [-58, 24]], '#c0442c', 1.6, .4), lijnS(0, [[58, 1], [58, 24]], '#c0442c', 1.6, .4),
      { t:'ring', h:.6, r:32.5, rt:2.4, k:'#c96a1c' },
      { t:'buis', pts:[[0, 28.8, 0], [2.3, 32, 0], [3.8, 35.2, 0], [4.4, 39, 0]], r:2.5, k:'#2f7d52', l:'#24603f', lw:.8 }] }; },
    11:function(){ return { kantel:2, smal:1, delen:[-1, 1].map(function(k){
      var buiten = [[-16, 0]].concat(kwad([-16, 0], [-30, 30], [-20, 46], 6), kwad([-20, 46], [-10, 36], [-4, 0], 6));
      var binnen = [[-14, 2]].concat(kwad([-14, 2], [-22, 24], [-18, 38], 5), kwad([-18, 38], [-12, 28], [-6, 2], 5));
      function zet(pts, z){ return plaat(pts.map(function(q){ return [k * -q[0], q[1], z]; }), -k * 8, k * 15, [k * 10, 0], -2); }
      var B = zet(buiten, 0), n = plaat([[k * 10, 0, 1]], -k * 8, k * 15, [k * 10, 0], 0)[0];
      return { t:'vlak', pts:B, binnen:zet(binnen, .5), n:[n[0] - k * 10, n[1], n[2]], k:'#F3EFE9', ka:'#e3d9cc', l:'#b9ab9c', lw:1.5, kb:'#F6B8C6', dik:2, glad:1, halo:1, voet:1 }; }) }; },
    12:function(){ return { kantel:14, wmax:1.12, delen:[
      { t:'draai', p:[[0, 20], [10.5, 20.5]], k:'#22315f', l:'#151f40', lw:1.2 },
      { t:'doos', h0:10.5, h1:12.3, w0:23.3, d0:23.3, w1:23.3, d1:23.3, draai:45, k:'#14224C', kt:'#1c2c5c', l:'#0b1433', lw:1 },
      { t:'buis', pts:[[0, 13.8, 0], [14, 13.8, 0], [28, 13.8, 0], [33.4, 13.6, 0]], r:1.1, k:'#F26749' },
      { t:'buis', pts:[[34.6, 13, 0], [34.6, 6, 0]], r:1.1, k:'#F26749' },
      { t:'bol', c:[0, 15, 0], r:2.4, k:'#F26749', l:'#c0442c', lw:.6 },
      { t:'buis', pts:[[34.6, 5.6, 0], [34.6, 2.6, 0], [34.6, -.4, 0]], r:1.4, r1:2.6, k:'#EA9836', l:'#c96a1c', lw:.8 }] }; },
    13:function(){ return { kantel:8, delen:[
      { t:'wand', h0:0, h1:26, r0:26, r1:30, top:[[0, 26], [33, 10], [90, 22], [147, 10], [180, 26]], k:'#2b0d1c', l:'#c0442c', lw:2.4, binnen:'#1a0711', open:1, lijnen:[[1.2, '#F26749', 2, .7]] },
      stip(0, 0, 14, 3.4, '#F26749'), stip(0, -36, 6, 2.4, '#c0442c'), stip(0, 36, 6, 2.4, '#c0442c')] }; },
    14:function(){ return { kantel:8, delen:[
      { t:'wand', h0:0, h1:20, r0:26, r1:28, rond:1, top:[[0, 18], [25, 6], [50, 17], [80, 5], [110, 15], [140, 7], [170, 18], [200, 6], [230, 14], [260, 5], [290, 16], [320, 6], [345, 13], [360, 18]], k:'#e8dcc0', l:'#8a7350', lw:2.2, binnen:'#cdbf9e', open:1 },
      lijnS(0, [[-35, 3], [-26, 9]], '#8a7350', 1.4, .7), lijnS(0, [[5, 3], [13, 10]], '#8a7350', 1.4, .7), lijnS(0, [[31, 3], [38, 9]], '#8a7350', 1.4, .7)] }; },
    15:function(){ var bin = [], bui = [];
      for (var i = 0; i <= 10; i++){ var t = (105 + i * 6) * GR, bol = Math.sin(i / 10 * PI) * 16; bin.push([38.4 * Math.sin(t), 1.6, 38.4 * Math.cos(t)]); bui.push([(38.4 + bol) * Math.sin(t), 1.6 + bol * .32, (38.4 + bol) * Math.cos(t)]); }
      return { kantel:6, delen:[
      { t:'draai', p:[[0, 34], [8, 33], [15, 29.5], [20, 24.5], [24, 17], [26.5, 8.5], [27, 0]], k:'#F26749', l:'#d24f33', lw:1 },
      lijnS(0, [[0, 6], [0, 26]], '#c0442c', 1.6, .6),
      { t:'sticker', aan:0, soort:'pad', pts:[[-8, -30], [-6.5, -33], [-3.5, -35], [0, -35.6], [3.5, -35], [6.5, -33], [8, -30]], k:'#c0442c' },
      lijnS(0, [[-13, 3.2], [13, 3.2]], '#F3EFE9', 2),
      { t:'ring', h:.5, r:36.1, rt:2, k:'#c0442c' },
      { t:'bol', c:[0, 29.8, 0], r:2.4, k:'#c0442c' },
      { t:'vlak', pts:bin.concat(bui.reverse()), k:'#c0442c', ka:'#8a2416', l:'#8a2416', lw:1, dik:1.2, glad:1, richt:[.707, 0, -.707], halo:1 }] }; },
    16:function(){ return { kantel:6, delen:[
      { t:'draai', p:[[0, 33], [8, 32.2], [15, 29], [20, 24.5], [24, 17.5], [27, 9], [28, 0]], k:'#2f9e8f', l:'#24857a', lw:1 },
      lijnS(0, [[-21, 8], [-21, 26]], '#1f7a6d', 1.8, .7), lijnS(0, [[0, 8], [0, 27]], '#1f7a6d', 1.8, .7), lijnS(0, [[21, 8], [21, 26]], '#1f7a6d', 1.8, .7),
      { t:'wand', h0:-4.5, h1:5, r0:35.5, r1:34.5, k:'#1f7a6d', l:'#17594f', lw:1, glad:1 },
      lijnS(4, [[-50, -3], [-50, 3.6]], '#2f9e8f', 2, .8), lijnS(4, [[-25, -3], [-25, 3.6]], '#2f9e8f', 2, .8), lijnS(4, [[0, -3], [0, 3.6]], '#2f9e8f', 2, .8), lijnS(4, [[25, -3], [25, 3.6]], '#2f9e8f', 2, .8), lijnS(4, [[50, -3], [50, 3.6]], '#2f9e8f', 2, .8),
      { t:'bol', c:[0, 35.4, 0], r:7, k:'#FFD166', l:'#c9971f', lw:1.4 }] }; },
    /* koptelefoon: de dopjes zitten tegen de zijkant van het hoofd, met ruimte voor brilpootjes eronder */
    17:function(H, s){
      /* De oorschelpen plat tegen de zijkant: buiten de breedste plek van het hoofd (zij), met net genoeg ruimte om
         bij het draaien en knikken niet in het hoofd te komen. De beugel volgt de omtrek van het hoofd over de kruin. */
      var zij = H.zij, af = 3.6, dik = 8 * s, dop = function(k){ return { t:'draai', S:{ o:[k * (zij + af), -4, .8], u:[k, 0, 0], x:[0, -1, 0], f:[0, 0, 1], s:s }, p:[[0, 11.5], [5.5, 11.5], [7.2, 10], [8, 7]], ez:.72, dicht:1, laag:'auto', k:'#F26749', l:INKT, lw:2.4, groep:k, zij:k }; };
      var b = [], xe = zij + af + dik * .55, ye = -4 - 11.5 * s - 2.6;
      for (var g = -90; g <= 90; g += 6){
        var t = g * GR, dx = Math.sin(t), dy = -Math.cos(t), w = Math.pow(Math.abs(g) / 90, 2.2), R0 = H.Rv(dx, dy) + 7.5;
        /* naar de schelpen toe gaat de beugel geleidelijk naar het midden van de schelp */
        var x = dx * R0, y = dy * R0;
        if (w > 0){ var xs = (g < 0 ? -1 : 1) * xe; x = x * (1 - w) + xs * w; y = y * (1 - w) + Math.min(y, ye) * w; }
        b.push([x, -y, -1]);
      }
      /* De beugel in drie stukken: de eindjes horen bij hun schelp (zelfde laag, en de schelp komt eroverheen) */
      var band = function(pts, k){ var d = { t:'buis', S:HOOFDSTELSEL, pts:fijn(pts, 3), r:3, k:INKT, l:'#0b1433', lw:.6, glans:1, om:1 };
        if (k){ d.laag = 'auto'; d.groep = k; d.zij = k; d.laagPunt = [k * (zij + af + dik * .5), 4, .8]; } return d; };
      return { zit:'geen', delen:[band(b.slice(4, b.length - 4)), band(b.slice(0, 5), -1), dop(-1), band(b.slice(b.length - 5), 1), dop(1)] }; },
    18:function(){ return { kantel:6, delen:[
      { t:'draai', p:[[0, 24], [7, 23.4], [12, 21.5], [16, 18], [19.3, 12.5], [21.3, 6], [22, 0]], k:'#8fbf9a', l:'#5e8f6a', lw:1.2 },
      bandS(0, 2.5, 5.5, '#5e8f6a'),
      { t:'rand', h:0, r0:24, uit:14, zak:8, k:'#8fbf9a', l:'#5e8f6a', lw:1.6, onder:'#729e7d' }] }; },
    19:function(){ return { kantel:8, delen:[
      { t:'draai', p:[[0, 20], [10, 20.4], [18, 20], [22, 17], [24, 10], [24.5, 0]], k:'#a5773f', l:'#7d5a2e', lw:1.2 },
      bandS(0, 2, 6, '#5f4830'), lijnS(0, [[0, 17], [0, 24.3]], '#7d5a2e', 2, .55),
      { t:'rand', h:0, r0:20, uit:24, zak:3, golf:-15, k:'#a5773f', l:'#7d5a2e', lw:1.6, onder:'#8a6233' }] }; },
    20:function(){ return { kantel:8, delen:[
      { t:'wand', h0:0, h1:24, r0:27, r1:30, top:[[0, 12], [20, 24], [45, 10], [90, 20], [135, 10], [160, 24], [180, 12]], k:'#F7931E', l:'#c96a1c', lw:2, binnen:'#c96a1c', open:1, lijnen:[[5, '#fff', 2.4, .75]] },
      stip(0, -20, 17, 2.2, '#fff'), stip(0, 20, 17, 2.2, '#fff'), stip(0, 0, 8, 2.4, '#204ECF')] }; },
    21:function(){ return { kantel:9, delen:[
      { t:'draai', p:[[0, 22], [8, 21.8], [13, 20.7], [16.5, 18], [18.8, 13.2], [19.9, 6.6], [20.2, 0]], k:'#e8c877', l:'#a8823e', lw:1.2 },
      bandS(0, 1, 5.4, '#c0442c', '#8a2416'),
      { t:'rand', h:0, r0:22, uit:24, zak:4.5, ringen:[.5, .8], k:'#e8c877', l:'#a8823e', lw:1.3 }] }; },
    22:function(){ return { kantel:6, delen:[
      { t:'draai', p:[[0, 30], [9, 29.2], [17, 26], [23, 20], [27, 13], [29.4, 6], [30, 0]], k:'#2a3142', l:'#151a26', lw:1.6 },
      bandS(0, .6, 2.4, '#E1B94F'),
      { t:'sticker', aan:0, soort:'pad', pts:[[-8, -41], [0, -52], [8, -41], [0, -34]], k:'#E1B94F', l:'#a8831f', lw:1.2 },
      lijnS(0, [[-45, 16], [-30, 21], [-10, 26.5]], '#fff', 2.4, .28),
      { t:'draai', p:[[29.4, 6], [46, 0]], k:'#E1B94F', l:'#a8831f', lw:1.2, halo:false },
      { t:'rand', h:0, r0:30, uit:6, zak:1.5, k:'#151a26', l:'#0b0f18', lw:1, onder:'#0b0f18' }] }; },
    /* het haar van Ferry: een schil om het hoofd; bij een hoekig hoofd wat voller, zodat het hoofd er nergens doorheen steekt */
    23:function(H, s, m){ var c = [H.cx, -3, -1], a = [H.half + FERRY.dikte[0], -H.top + FERRY.dikte[1] - 3, H.half + FERRY.dikte[2]], k = 1;
      m.P.forEach(function(q){ if (q[1] < 0) k = Math.max(k, Math.sqrt(Math.pow((q[0] - c[0]) / (a[0] - 2), 2) + Math.pow((q[1] - c[1]) / (a[1] - 2), 2))); });
      return { zit:'geen', delen:[{ t:'haar', c:c, a:[a[0] * k, a[1] * k, a[2] * k], H:H }] }; },
    24:function(){ return { kantel:4, rol:-14, smal:1, delen:[
      { t:'draai', p:[[0, 15], [35, 0]], k:'#F26749', l:'#b9432b', lw:1.5 },
      stip(0, -25, 8, 2.3, '#FFD166'), stip(0, 33, 15, 2.1, '#83A5F2'), stip(0, -15, 22, 1.8, '#fff'),
      { t:'ring', h:.8, r:16.7, rt:1.6, k:'#FFD166' },
      { t:'vlak', pts:sterPunten(0, 41, 6.6).map(function(q){ return [q[0], q[1], 0]; }), n:[0, 0, 1], k:'#FFD166', ka:'#e8b84a', l:'#c9971f', lw:1.1, dik:1.6 }] }; },
    25:function(){ var zf = function(h){ return 12 - 7 * h / 33; };
      return { kantel:8, smal:1, delen:[
      { t:'doos', h0:-2.5, h1:0, w0:21, d0:14, w1:21, d1:14, k:'#14224C', l:'#0b1433', lw:1 },
      { t:'doos', h0:0, h1:33, w0:17, d0:12, w1:7, d1:5, k:'#1f6b5c', l:'#123f36', lw:1.6 },
      { t:'sticker', aan:1, soort:'pad', pts:[[-10, -33], [-4, -56], [4, -56], [10, -33]], k:'#e9e8de' },
      lijnS(1, [[-3, 21], [3, 21]], '#1f6b5c', 1, .6), lijnS(1, [[-4, 16], [4, 16]], '#1f6b5c', 1, .6), lijnS(1, [[-5.5, 11], [5.5, 11]], '#1f6b5c', 1, .6),
      stip(1, 0, 4, 2, '#FFD166'),
      { t:'buis', pts:[[0, 4, zf(4) + 1.4], [5.5, 20, zf(20) + 1.4], [11, 36, zf(36) + 1.4]], r:1, k:INKT },
      { t:'vlak', pts:[[2.6, 20.6, zf(20.6) + 2.4], [7.6, 18.9, zf(18.9) + 2.4], [9.5, 24.6, zf(24.6) + 2.4], [4.5, 26.3, zf(26.3) + 2.4]], k:'#EA9836', l:INKT, lw:1.2, dik:1.2, lc:1 }] }; },
    26:function(){ return { kantel:6, smal:1, delen:[
      { t:'doos', h0:0, h1:4, w0:22, d0:15, w1:22, d1:15, k:'#1d5537', l:'#143d27', lw:1 },
      { t:'doos', h0:4, h1:12, w0:20, d0:13.5, w1:20, d1:13.5, k:'#2f7d52', l:'#1d5537', lw:1.6 },
      lijnS(1, [[-12, 8], [12, 8]], '#F3EFE9', 1.6, .6),
      { t:'doos', h0:12, h1:19, w0:5, d0:5, w1:4, d1:4, k:'#a5773f', l:'#7d5a2e', lw:1.4 },
      { t:'bol', c:[0, 28.4, 0], r:9, k:'#a5773f', l:'#7d5a2e', lw:1.6 }] }; },
    /* mijter (Sinterklaas): plat van voor naar achter, met een gouden band en een gouden kruis */
    27:function(H){
      /* de staf staat rechts naast het hoofd, iets naar voren; hij hoort bij het hoofd, niet bij de hoed. Draait het
         hoofd weg, dan gaat hij achter het hoofd langs (laag auto, zoals de schelpen van de koptelefoon) */
      var X = H.zij + 6, Z = 6, staf = fijn([[X, -52, Z], [X, 44, Z], [X, 52, Z], [X + 2.5, 58.5, Z], [X + 8, 61.5, Z], [X + 13.5, 59, Z], [X + 15.5, 53, Z], [X + 13, 48, Z], [X + 9, 47.5, Z]], 3);
      return { kantel:5, delen:[
      { t:'draai', p:[[0, 25], [16, 26.2], [30, 24.4], [41, 18], [50, 10], [56, 3.5], [58, 0]], ez:.6, k:'#C8102E', l:'#8a0b20', lw:1.4 },
      bandS(0, 1, 6.5, '#FFD166', '#c9971f'),
      lijnS(0, [[0, 14], [0, 44]], '#FFD166', 3.4, 1), lijnS(0, [[-16, 34], [16, 34]], '#FFD166', 3.4, 1),
      lijnS(0, [[-60, 8], [-42, 40]], '#FFD166', 1.6, .55), lijnS(0, [[60, 8], [42, 40]], '#FFD166', 1.6, .55),
      { t:'buis', S:HOOFDSTELSEL, pts:staf, r:2.7, k:'#E1B94F', l:'#a8831f', lw:1.2, glans:1, laag:'auto', laagPunt:[X, 0, Z] }] }; },
    /* slaapmuts (de nacht): als de kerstmuts, maar nachtblauw met sterretjes en een slap puntje */
    28:function(){ return { kantel:6, delen:[
      { t:'draai', p:[[0, 31], [9, 28.5], [17, 23.5], [23, 17, 1, 0], [27, 12, 5, 0], [29, 8.5, 11, 0], [28.5, 6.5, 17, 0], [25.5, 5.5, 23, 0], [21, 5, 29, 0], [17, 4.5, 34, 0]], k:'#83A5F2', l:'#4d6fbf', lw:1.4 },
      { t:'wand', h0:-5, h1:6, r0:35, r1:33.5, k:'#F3EFE9', l:'#cfc4b6', lw:1.3, glad:1 },
      { t:'sticker', aan:0, soort:'ster', a:-22, h:14, r:4.6, k:'#FFD166', l:'#c9971f', lw:.8 },
      { t:'sticker', aan:0, soort:'ster', a:18, h:21, r:3.4, k:'#FFD166', l:'#c9971f', lw:.7 },
      stip(0, 0, 10, 1.5, '#FFD166'), stip(0, 40, 13, 1.3, '#FFD166'),
      { t:'bol', c:[45.3, 11.7, 0], r:7.5, k:'#F3EFE9', l:'#cfc4b6', lw:1.3 }] }; }
  };
  /* Op een bijzondere dag krijgt een gezichtje zonder eigen hoed de hoed van die dag (zie feest hieronder) */
  var FEESTHOED = { koning:20, sint:27, kerst:9, nieuw:8, halloween:10, zomer:21, nacht:28 };

  /* ---------- binnen een onderdeel? (voor het uitwijken en de controle) en punten op het oppervlak ---------- */
  function binnenDeel(d, S, p, mg){
    if (d.t === 'haar'){ var uh = [(p[0] - d.c[0]) / d.a[0], (p[1] - d.c[1]) / d.a[1], (p[2] - d.c[2]) / d.a[2]], Lh = Math.sqrt(dot3(uh, uh)) || 1;
      /* een schil: niet het hoofd zelf, alleen de laag haar erop */
      return Lh <= 1 + mg / Math.min(d.a[0], d.a[1]) && !(d.H && d.H.binnen(p, 0)) && hoogteVan([uh[0] / Lh, uh[1] / Lh, uh[2] / Lh]) / GR > FERRY.lijn(hoekVan(uh) / GR) - 1; }
    var q = lokaal(S, p), s = S.s || 1, m = mg / s, x = q[0], h = q[1], z = q[2], i;
    if (d.t === 'draai'){
      var P = d.p, ex = d.ex || 1, ez = d.ez || 1;
      for (i = 1; i < P.length; i++){
        var a = P[i - 1], b = P[i];
        if (!(b[2] || b[3])){
          if (h < Math.min(a[0], b[0]) - m || h > Math.max(a[0], b[0]) + m) continue;
          var f = klem((h - a[0]) / ((b[0] - a[0]) || 1), 0, 1), r = a[1] + (b[1] - a[1]) * f;
          if (Math.sqrt(x * x / (ex * ex) + z * z / (ez * ez)) <= r + m) return true;
        } else for (var g = 0; g <= 4; g++){
          var t = g / 4, c = [(a[2] || 0) + ((b[2] || 0) - (a[2] || 0)) * t, a[0] + (b[0] - a[0]) * t, (a[3] || 0) + ((b[3] || 0) - (a[3] || 0)) * t], rr = a[1] + (b[1] - a[1]) * t;
          if (Math.pow(x - c[0], 2) + Math.pow(h - c[1], 2) + Math.pow(z - c[2], 2) <= Math.pow(rr + m, 2)) return true;
        }
      }
      return false;
    }
    if (d.t === 'rand'){
      var rho = Math.sqrt(x * x + z * z), t2 = Math.atan2(x, z), sn = Math.sin(t2), zk = d.zak + (d.golf || 0) * sn * sn;
      if (rho < d.r0 - 1 - m || rho > d.r0 + d.uit + m) return false;
      return Math.abs(h - (d.h - zk * klem((rho - d.r0) / d.uit, 0, 1))) <= 1.1 + m;
    }
    if (d.t === 'wand'){ var W = wandMaten(d), t3 = Math.atan2(x, z); return Math.sqrt(x * x + z * z) <= W.rH(klem(h, d.h0, 99)) + m && h >= d.h0 - m && h <= W.hT(t3) + m; }
    if (d.t === 'bol') return Math.pow(x - d.c[0], 2) + Math.pow(h - d.c[1], 2) + Math.pow(z - d.c[2], 2) <= Math.pow(d.r + m, 2);
    if (d.t === 'ring'){ var ro = Math.sqrt(x * x / Math.pow(d.ex || 1, 2) + z * z); return Math.sqrt(Math.pow(ro - d.r, 2) + Math.pow(h - d.h, 2)) <= d.rt + m; }
    if (d.t === 'buis'){
      for (i = 1; i < d.pts.length; i++){
        var A = d.pts[i - 1], B = d.pts[i], v = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], w = [x - A[0], h - A[1], z - A[2]], vv = dot3(v, v) || 1, tt = klem(dot3(w, v) / vv, 0, 1);
        var r2 = d.r1 != null ? d.r + (d.r1 - d.r) * (i - 1 + tt) / (d.pts.length - 1) : d.r;
        if (Math.pow(w[0] - v[0] * tt, 2) + Math.pow(w[1] - v[1] * tt, 2) + Math.pow(w[2] - v[2] * tt, 2) <= Math.pow(r2 + m, 2)) return true;
      }
      return false;
    }
    if (d.t === 'doos'){
      var c2 = Math.cos(-(d.draai || 0) * GR), s2 = Math.sin(-(d.draai || 0) * GR), xr = x * c2 - z * s2, zr = x * s2 + z * c2, ff = klem((h - d.h0) / ((d.h1 - d.h0) || 1), 0, 1);
      return h >= d.h0 - m && h <= d.h1 + m && Math.abs(xr) <= d.w0 + (d.w1 - d.w0) * ff + m && Math.abs(zr) <= d.d0 + (d.d1 - d.d0) * ff + m;
    }
    if (d.t === 'vlak'){
      var nn = eenh(d.n), p0 = d.pts[0], dv = [x - p0[0], h - p0[1], z - p0[2]], afst = dot3(dv, nn);
      if (Math.abs(afst) > (d.dik || .6) + (d.lc ? d.lw / 2 : 0) + m + .6) return false;
      var e1 = eenh(Math.abs(nn[1]) < .9 ? [nn[2], 0, -nn[0]] : [1, 0, 0]), e2 = [nn[1] * e1[2] - nn[2] * e1[1], nn[2] * e1[0] - nn[0] * e1[2], nn[0] * e1[1] - nn[1] * e1[0]];
      function vl(q2){ var u = [q2[0] - p0[0], q2[1] - p0[1], q2[2] - p0[2]]; return [dot3(u, e1), dot3(u, e2)]; }
      var poly = d.pts.map(vl), pq = vl([x, h, z]);
      if (binnenPoly(pq, poly)) return true;
      var rr2 = m + (d.lc ? d.lw / 2 : 0) + .3;
      for (i = 0; i < poly.length; i++){ var a2 = poly[i], b2 = poly[(i + 1) % poly.length], ab = [b2[0] - a2[0], b2[1] - a2[1]], ap = [pq[0] - a2[0], pq[1] - a2[1]], k2 = klem((ap[0] * ab[0] + ap[1] * ab[1]) / ((ab[0] * ab[0] + ab[1] * ab[1]) || 1), 0, 1);
        if (Math.pow(ap[0] - ab[0] * k2, 2) + Math.pow(ap[1] - ab[1] * k2, 2) <= rr2 * rr2) return true; }
      return false;
    }
    return false;
  }
  /* FIB2: dezelfde richtingen en hun tegengestelde, zodat het niet uitmaakt welk van de twee voorwerpen eerst komt */
  var FIB2 = null;
  var FIB = (function(n){ var p = [], g = PI * (3 - Math.sqrt(5)); for (var i = 0; i < n; i++){ var y = 1 - 2 * (i + .5) / n, r = Math.sqrt(1 - y * y); p.push([Math.cos(g * i) * r, y, Math.sin(g * i) * r]); } return p; })(26);
  FIB2 = FIB.concat(FIB.map(function(v){ return [-v[0], -v[1], -v[2]]; }));
  /* punten op het oppervlak, in het hoofd (rechtop) */
  function puntenDeel(d, S){
    var F = stelselV(K0, S), u = [], i, j;
    function ring(h, r, n, ex, ez, bx, bz){ for (var k = 0; k < n; k++){ var t = k / n * TAU; u.push(pt(F, (bx || 0) + r * Math.sin(t) * (ex || 1), h, (bz || 0) + r * Math.cos(t) * (ez || 1))); } }
    if (d.t === 'draai') d.p.forEach(function(q){ ring(q[0], q[1], q[1] ? 16 : 1, d.ex, d.ez, q[2], q[3]); });
    /* een rand: drie ringen, en de buitenrand ook iets boven en onder (de rand heeft een lijn om zich heen) */
    else if (d.t === 'rand') [[0, 0], [.5, 0], [1, 0], [1, 1], [1, -1]].forEach(function(fh){ var f = fh[0]; for (var k = 0; k < 32; k++){ var t = k / 32 * TAU, sn = Math.sin(t), r = d.r0 + d.uit * f + (fh[1] ? .8 : 0); u.push(pt(F, r * sn, d.h - (d.zak + (d.golf || 0) * sn * sn) * f + fh[1], r * Math.cos(t))); } });
    else if (d.t === 'wand'){ var W = wandMaten(d); for (j = 0; j < 24; j++){ var t = j / 24 * TAU, h = W.hT(t); u.push(pt(F, d.r0 * Math.sin(t), d.h0, d.r0 * Math.cos(t)), pt(F, W.rH(h) * Math.sin(t), h, W.rH(h) * Math.cos(t))); } }
    else if (d.t === 'bol') FIB.forEach(function(v){ u.push(pt(F, d.c[0] + v[0] * d.r, d.c[1] + v[1] * d.r, d.c[2] + v[2] * d.r)); });
    else if (d.t === 'ring') for (j = 0; j < 24; j++){ var t2 = j / 24 * TAU; [[0, d.rt], [0, -d.rt], [d.rt, 0], [-d.rt, 0]].forEach(function(o){ var r = d.r + o[0]; u.push(pt(F, r * Math.sin(t2) * (d.ex || 1), d.h + o[1], r * Math.cos(t2))); }); }
    else if (d.t === 'buis') d.pts.forEach(function(q, k){ var r = d.r1 != null ? d.r + (d.r1 - d.r) * k / (d.pts.length - 1) : d.r; [[0, 0, 0], [r, 0, 0], [-r, 0, 0], [0, r, 0], [0, -r, 0], [0, 0, r], [0, 0, -r]].forEach(function(o){ u.push(pt(F, q[0] + o[0], q[1] + o[1], q[2] + o[2])); }); });
    else if (d.t === 'vlak') d.pts.concat(d.binnen || []).forEach(function(q){ u.push(pt(F, q[0], q[1], q[2])); });
    else if (d.t === 'doos') doosPunten(d).forEach(function(q){ u.push(pt(F, q[0], q[1], q[2])); });
    else if (d.t === 'haar') for (j = -180; j < 180; j += 15) for (i = 0; i < 4; i++){ var el = FERRY.lijn(j) + i * (85 - FERRY.lijn(j)) / 4, v2 = richting(j * GR, el * GR); u.push([d.c[0] + v2[0] * d.a[0], d.c[1] + v2[1] * d.a[1], d.c[2] + v2[2] * d.a[2]]); }
    return u;
  }
  /* raakpunten: waar een hoed op het hoofd rust, met hoeveel hij erin mag zakken */
  /* speling van de raakpunten (kroon, rand, dichte wand, hoger op de kroon); DOEL: zo hoog zat de oude platte hoed ongeveer (deel van de hoogte
     van het hoofd); WMAX: zo veel ruimer mag een kroon worden om zo laag te zakken */
  var ZT = 1.5, ZR = .2, ZW = .4, ZH = .8, DOEL = .72, WMAX = 1.3;
  function raakDeel(d){
    var u = [], k, t;
    function ring(h, r, tol, ex, ez){ for (k = 0; k < 32; k++){ t = k / 32 * TAU; u.push([r * Math.sin(t) * (ex || 1), h, r * Math.cos(t) * (ez || 1), tol]); } }
    /* een kroon: de onderste ring, en ook hoger op de wand (een bolle pet buigt naar binnen, naar het hoofd toe) */
    if (d.t === 'draai' && !d.dicht && !d.S && d.p[0][0] === 0){ ring(0, d.p[0][1], ZT, d.ex, d.ez); for (var pi = 1; pi < d.p.length; pi++) if (!d.p[pi][2] && !d.p[pi][3] && d.p[pi][1] > 4) ring(d.p[pi][0], d.p[pi][1], ZH, d.ex, d.ez); }
    else if (d.t === 'rand') [0, .5, 1].forEach(function(f){ for (k = 0; k < 24; k++){ t = k / 24 * TAU; var sn = Math.sin(t), r = d.r0 + d.uit * f; u.push([r * sn, d.h - (d.zak + (d.golf || 0) * sn * sn) * f - 1, r * Math.cos(t), f ? ZR : ZT, f ? 1 : 0]); } });
    else if (d.t === 'wand'){ ring(d.h0, d.r0, d.open ? ZT : ZW); if (!d.open && !d.top){ var W = wandMaten(d); ring(d.h1, W.rH(d.h1), .4); } }
    else if (d.t === 'ring' && d.raak) ring(d.h, d.r + d.rt, .3);
    else if (d.t === 'buis' && d.anker) u.push(d.pts[0].concat([1.2]));
    else if (d.t === 'vlak' && d.voet){ var lo = 1e9; d.pts.forEach(function(q){ lo = Math.min(lo, q[1]); }); d.pts.forEach(function(q){ if (q[1] < lo + 3) u.push([q[0], q[1], q[2], 1]); }); }
    else if (d.t === 'doos' && d.onder) doosPunten(d).slice(0, 4).forEach(function(q, i, a){ var n = a[(i + 1) % 4]; u.push(q.concat([.3]), [(q[0] + n[0]) / 2, q[1], (q[2] + n[2]) / 2, .3]); });
    return u;
  }
  function bouwHoed(m, H, n){
    var s = klem(m.M.bovenBreed / 33, .85, 1.12), def = HOEDEN[n](H, s, m), delen = def.delen;
    var k = (def.kantel || 0) * GR, U = [0, -Math.cos(k), Math.sin(k)], F = [0, Math.sin(k), Math.cos(k)], X = [1, 0, 0];
    if (def.rol){ var r = def.rol * GR, c = Math.cos(r), sn = Math.sin(r); [U, F, X].forEach(function(v){ var x = v[0] * c - v[1] * sn, y = v[0] * sn + v[1] * c; v[0] = x; v[1] = y; }); }
    var S = { o:[0, 0, 0], x:X, u:U, f:F, s:s }, onderste = 1e9;
    delen.forEach(function(d, i){ if (d.t === 'sticker') d.host = delen[d.aan]; if (d.S) d.Snr = i; if (d.t === 'doos') onderste = Math.min(onderste, d.h0); });
    delen.forEach(function(d){ if (d.t === 'doos' && d.h0 === onderste) d.onder = 1; });
    /* een plaat zonder opgegeven richting: de normaal volgens Newell, naar boven gericht */
    delen.forEach(function(d){ if (d.t === 'vlak' && !d.n){ var n = [0, 0, 0], P = d.pts; for (var i = 0; i < P.length; i++){ var a = P[i], b = P[(i + 1) % P.length]; n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]); } n = eenh(n); d.n = n[1] < 0 ? [-n[0], -n[1], -n[2]] : n; } });
    /* zonder rand krijgt de kroon een smalle schaduw waar hij op het hoofd staat */
    var heeftRand = delen.some(function(d){ return d.t === 'rand'; });
    if (!heeftRand) for (var j = 0; j < delen.length; j++) if ((delen[j].t === 'draai' && !delen[j].dicht && !delen[j].S) || (delen[j].t === 'wand')){ delen[j].raakSchaduw = 1; break; }
    /* de zitplek: zo laag mogelijk, zonder dat een raakpunt verder dan zijn speling in het hoofd zakt */
    var dd, poging = 0;
    if (def.zit === 'top') dd = H.rho;
    else if (def.zit !== 'geen') while (true){
      var raak = []; delen.forEach(function(d){ if (!d.S) raak = raak.concat(raakDeel(d)); });
      var standen = [K0]; [-25, 0, 25].forEach(function(y){ [-18, 0, 18].forEach(function(p){ if (y || p) standen.push(kijker({ yaw:y, pitch:p })); }); });
      /* en met een bril zakt de hoed (vooral een rand) voor het gezicht nooit zo laag dat hij op het montuur komt */
      var bq = m.sp && m.sp.q && BRILLEN[m.sp.q] ? brilTop(m.sp.q) - 3.5 : null;
      var vrij = function(a){ S.o = [U[0] * a, U[1] * a, U[2] * a]; for (var k2 = 0; k2 < standen.length; k2++){ var Fh = stelselV(standen[k2], S); for (var i = 0; i < raak.length; i++){ var q = raak[i], P = pt(Fh, q[0], q[1], q[2]); if (H.binnen(P, q[3])) return false; if (bq != null && !k2 && P[1] > bq && Math.abs(P[0]) < 36 && P[2] > H.Rf - 12) return false; } } return true; };
      for (dd = 0; dd < 90 && !vrij(dd); dd += 2);
      while (dd > 0 && vrij(dd - .25)) dd -= .25;
      /* de onderkant van de kroon blijft boven ongeveer twee derde van de hoogte van het hoofd */
      if (dd < .64 * H.rho){ if (++poging > 6) break; S.s *= .94; continue; }
      /* zit hij hoger dan de oude platte hoed, dan mag hij in de breedte wat ruimer: dan zakt hij verder */
      if (def.smal || (heeftRand && m.sp && m.sp.q) || dd <= DOEL * H.rho || (S.w || 1) >= (def.wmax || WMAX) - 1e-6) break;
      S.w = Math.min(def.wmax || WMAX, (S.w || 1) + .03);
      /* de rand groeit niet mee: alleen de kroon wordt ruimer */
      delen.forEach(function(d){ if (d.t === 'rand'){ if (d.uit0 == null) d.uit0 = d.uit; d.uit = d.uit0 / S.w; } });
    }
    s = S.s;
    if (dd != null) S.o = [U[0] * dd, U[1] * dd, U[2] * dd];
    var hd = { n:n, S:S, delen:delen, sorteer:def.sorteer, s:s };
    hd.binnen = function(p, mg){ for (var i = 0; i < delen.length; i++){ var d = delen[i]; if (d.t !== 'sticker' && binnenDeel(d, d.t === 'haar' ? null : (d.S || S), p, mg)) return true; } return false; };
    hd.punten = function(){ var u = []; delen.forEach(function(d){ if (d.t !== 'sticker') u = u.concat(puntenDeel(d, d.S || S)); }); return u; };
    return hd;
  }

  /* ---------- figuren: vast aan het hoofd, achter het hoofd langs (in het hoofd: y omlaag) ---------- */
  var FIGUREN = {
    1:function(k, l){ return [-1, 1].map(function(z){ return { t:'bol', c:[z * 31, -33, -31], r:14, k:k, zij:z, vlek:{ n:[z * .25, .1, 1], r:7.5, k:l } }; }); },
    2:function(k, l){ var u = []; for (var i = 0; i < 10; i++){ var a = i / 10 * TAU + .3; u.push({ t:'bol', c:[Math.cos(a) * 51, Math.sin(a) * 51, -29], r:11, k:l }); } return u; },
    3:function(k){ return [[-40, 8, -38, 17], [40, 4, -38, 16], [-26, -32, -35, 17], [8, -44, -30, 16], [32, -26, -36, 13]].map(function(q){ return { t:'bol', c:[q[0], q[1], q[2]], r:q[3], k:k }; }); },
    4:function(k, l, dk){ var u = []; [-1, 1].forEach(function(z){ var A = [z * 10, -38, -15], B = [z * 24, -66, -16], M = [(A[0] + B[0]) / 2 + z * 6, (A[1] + B[1]) / 2, -15], pts = [A].concat(kwad([A[0], A[1]], [M[0], M[1]], [B[0], B[1]], 6).map(function(q, i){ return [q[0], q[1], -15 - (i + 1) / 6]; }));
      /* de spriet houdt op net onder het bolletje */
      pts = pts.filter(function(p){ return Math.sqrt(Math.pow(p[0] - B[0], 2) + Math.pow(p[1] - B[1], 2) + Math.pow(p[2] - B[2], 2)) > 9.6; });
      var L1 = pts[pts.length - 1], dl = [B[0] - L1[0], B[1] - L1[1], B[2] - L1[2]], ll = Math.sqrt(dot3(dl, dl)) || 1; pts.push([B[0] - dl[0] / ll * 9.4, B[1] - dl[1] / ll * 9.4, B[2] - dl[2] / ll * 9.4]);
      u.push({ t:'buis', pts:pts, r:1.7, k:dk, zij:z }, { t:'bol', c:B, r:6, k:'#FFD166', zij:z }); }); return u; },
    5:function(k, l, dk){ return [{ t:'bol', c:[0, -47, -30], r:15, k:dk, vlek:{ n:[0, -.75, .66], r:7, k:meng(dk, '#000000', .18) } }]; },
    6:function(k){ var u = []; [-1, 1].forEach(function(z){ u.push({ t:'vlak', pts:[[z * 38, -16, -24], [z * 32, -60, -28], [z * 6, -40, -22]], binnen:[[z * 31, -26, -21.4], [z * 29, -50, -25.4], [z * 14, -38, -20.6]], k:k, l:k, lw:7, lc:1, kb:'#F6B8C6', lb:'#F6B8C6', lwb:3, zij:z, dik:1.4 }); }); return u; }
  };
  /* hoe een figuur uitwijkt voor een hoed: e van 0 (op zijn plek) tot 1 (zo ver mogelijk) */
  function wijk(n, d, e, p){
    var x = p[0], y = p[1], z = p[2], a, c, s;
    if (n === 1 || n === 6){ a = (d.zij || 1) * e * 25 * GR; c = Math.cos(a); s = Math.sin(a); return [x * c - y * s, x * s + y * c, z - e * 26]; }
    if (n === 2) return [x * (1 + e * .1), y * (1 + e * .1), z - e * 26];
    if (n === 3) return [x * (1 + e * .12), y * (1 + e * .12), z - e * 26];
    if (n === 4){ a = e * 40 * GR; var y1 = y * Math.cos(a) - z * Math.sin(a), z1 = y * Math.sin(a) + z * Math.cos(a); a = (d.zij || 1) * e * 25 * GR; return [x * Math.cos(a) - y1 * Math.sin(a), x * Math.sin(a) + y1 * Math.cos(a), z1]; }
    if (n === 5){ a = e * 60 * GR; return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]; }
    return p;
  }
  function bouwFiguur(m, H, n, hoed){
    var k = m.kleur, delen0 = FIGUREN[n](k, meng(k, '#ffffff', .3), meng(k, '#000000', .2));
    var dr = m.draai * GR, c = Math.cos(dr), s = Math.sin(dr);
    function zet(e){
      function q(p){ var w = wijk(n, d0, e, p); var x = w[0] * c - w[1] * s, y = w[0] * s + w[1] * c; return [x, -y, w[2]]; }
      var d0;
      return delen0.map(function(d){ d0 = d; var u = {}; for (var key in d) u[key] = d[key];
        if (d.c) u.c = q(d.c); if (d.pts) u.pts = d.pts.map(q); if (d.binnen) u.binnen = d.binnen.map(q);
        if (d.vlek){ var a0 = q([0, 0, 0]), a1 = q(d.vlek.n); u.vlek = { n:eenh([a1[0] - a0[0], a1[1] - a0[1], a1[2] - a0[2]]), r:d.vlek.r, k:d.vlek.k }; }
        if (u.t === 'vlak'){ var A = u.pts[0], B = u.pts[1], C2 = u.pts[2], v1 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v2 = [C2[0] - A[0], C2[1] - A[1], C2[2] - A[2]], nn = eenh([v1[1] * v2[2] - v1[2] * v2[1], v1[2] * v2[0] - v1[0] * v2[2], v1[0] * v2[1] - v1[1] * v2[0]]); u.n = nn[2] < 0 ? [-nn[0], -nn[1], -nn[2]] : nn; }
        u.laag = 'achter'; return u; });
    }
    var delen = zet(0), e = 0;
    if (hoed){
      var hp = hoed.punten();
      /* de stukken van de hoed apart: elk stuk van de figuur moet er een scheidingsvlak mee hebben, anders is de
         tekenvolgorde niet vast te leggen (een blaadje boven een kroon, tussen de punten in) */
      var hd = hoed.delen.filter(function(d){ return d.t !== 'sticker'; }).map(function(d){ return d.t === 'haar' ? null : puntenDeel(d, d.S || hoed.S); }).filter(Boolean);
      var los = function(d){ var P = puntenDeel(d, HOOFDSTELSEL); for (var j = 0; j < hd.length; j++) if (!scheidVlak(P, hd[j], hoed.S.u, 1)) return false; return true; };
      for (e = 0; e <= 1.001; e += .1){
        delen = zet(e);
        var vrij = true, i, j;
        for (i = 0; i < delen.length && vrij; i++){ var P = puntenDeel(delen[i], HOOFDSTELSEL); for (j = 0; j < P.length; j++) if (hoed.binnen(P[j], 1.5)){ vrij = false; break; } }
        for (i = 0; i < delen.length && vrij; i++) for (j = 0; j < hp.length; j++) if (binnenDeel(delen[i], HOOFDSTELSEL, hp[j], 1.5)){ vrij = false; break; }
        for (i = 0; i < delen.length && vrij; i++) if (!los(delen[i])) vrij = false;
        if (vrij) break;
      }
      if (e > 1.001){
        delen = zet(1).filter(function(d){ var P = puntenDeel(d, HOOFDSTELSEL), j; for (j = 0; j < P.length; j++) if (hoed.binnen(P[j], 1.5)) return false; for (j = 0; j < hp.length; j++) if (binnenDeel(d, HOOFDSTELSEL, hp[j], 1.5)) return false; if (!los(d)) return false; return true; });
      }
    }
    return { n:n, delen:delen, uitwijk:Math.min(1, e),
      binnen:function(p, mg){ for (var i = 0; i < delen.length; i++) if (binnenDeel(delen[i], HOOFDSTELSEL, p, mg)) return true; return false; },
      punten:function(){ var u = []; delen.forEach(function(d){ u = u.concat(puntenDeel(d, HOOFDSTELSEL)); }); return u; } };
  }
  /* een vlak tussen twee puntenwolken: de normaal n wijst van A naar B (of null als ze in elkaar zitten) */
  function scheidVlak(A, B, op, streng){
    /* echt gescheiden (een kier van minstens 0,3), of precies op elkaar langs de as van de hoed (een rand onder een kroon) */
    var ca = midden(A), cb = midden(B), beste = null, marge = -1e9, i;
    function kier(n){ var mx = -1e9, mn = 1e9; for (i = 0; i < A.length; i++){ var u = A[i][0] * n[0] + A[i][1] * n[1] + A[i][2] * n[2]; if (u > mx) mx = u; } for (i = 0; i < B.length; i++){ var v = B[i][0] * n[0] + B[i][1] * n[1] + B[i][2] * n[2]; if (v < mn) mn = v; } return mn - mx; }
    /* ook de richting tussen de dichtstbijzijnde punten (een spriet die bij een bolletje ophoudt) */
    function dichtst(L, c){ var b = L[0], bd = 1e9; L.forEach(function(p){ var d = (p[0] - c[0]) * (p[0] - c[0]) + (p[1] - c[1]) * (p[1] - c[1]) + (p[2] - c[2]) * (p[2] - c[2]); if (d < bd){ bd = d; b = p; } }); return b; }
    var a1p = dichtst(A, cb), b1p = dichtst(B, ca), a2p = dichtst(A, b1p), b2p = dichtst(B, a1p);
    /* eerst de richtingen tussen de twee; is daar al een ruime kier, dan hoeven de andere niet meer */
    var kand = [eenh([cb[0] - ca[0], cb[1] - ca[1], cb[2] - ca[2]]), eenh([cb[0] - a1p[0], cb[1] - a1p[1], cb[2] - a1p[2]]), eenh([b1p[0] - ca[0], b1p[1] - ca[1], b1p[2] - ca[2]]), eenh([b2p[0] - a2p[0], b2p[1] - a2p[1], b2p[2] - a2p[2]])].concat(FIB2);
    for (var k = 0; k < kand.length && marge < 2; k++){ var g = kier(kand[k]); if (g > marge){ marge = g; beste = kand[k]; } }
    if (marge > .3) return beste;
    if (streng) return null;   /* streng: alleen een echte kier telt (een figuur naast een hoed) */
    var neer = [-op[0], -op[1], -op[2]], a1 = kier(op), a2 = kier(neer);
    if (Math.max(a1, a2) > -.25) return a1 > a2 ? op : neer;
    return null;
  }
  function midden(P){ var c = [0, 0, 0]; P.forEach(function(p){ c[0] += p[0] / P.length; c[1] += p[1] / P.length; c[2] += p[2] / P.length; }); return c; }
  /* de krul (extra 2) als een gekruld staartje op de kruin */
  /* een vloeiende lijn door een paar punten (Catmull-Rom), n stukjes per stap */
  function vloei(P, n){
    var u = [P[0]];
    for (var i = 0; i < P.length - 1; i++){
      var a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(P.length - 1, i + 2)];
      for (var j = 1; j <= n; j++){ var t = j / n, t2 = t * t, t3 = t2 * t, q = [];
        for (var k = 0; k < 3; k++) q.push(.5 * (2 * b[k] + (c[k] - a[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t2 + (3 * b[k] - a[k] - 3 * c[k] + d[k]) * t3));
        u.push(q); }
    }
    return u;
  }
  /* De krul: een lok die vanaf de kruin naar voren komt en over het voorhoofd valt, met een krulletje aan het eind.
     Waar hij op het hoofd ligt, ligt hij net boven het oppervlak (z uit het hoofd); boven de kruin hangt hij in de lucht. */
  function bouwKrul(m, H){
    var t = H.top, r = 2.8, sy = Math.min(1, (-27 - t) / 23.5);
    function op(x, y, extra){ var z = H.zf(x, y); return [x, y, (z > 0 ? z : 0) + r + .4 + (extra || 0)]; }
    /* sy: bij een klein hoofd valt de lok minder ver, zodat hij boven een bril blijft */
    var pts = [[-3, t + 4, 0], [-3.5, t - 3, 3], [0, t - 8.5, 9], [7, t - 9, 17], [13, t - 5, 24], op(16, t + 5 * sy, .4), op(17.5, t + 14 * sy), op(14.5, t + 22 * sy), op(9.5, t + 23.5 * sy, .6), op(8, t + 18.5 * sy, 1.2), op(11, t + 16.5 * sy, 1.6)];
    /* Het hoofd draait niet als een starre bol mee: liggen de punten van de lok in een kijkrichting achter het oppervlak,
       dan komen ze iets verder naar voren (alleen het worteltje achter de kruin mag erachter verdwijnen; daar is de staaf recht afgesneden). */
    var L = vloei(pts, 5), KS = [];
    [-25, -12.5, 0, 12.5, 25].forEach(function(y){ [-18, -9, 0, 9, 18].forEach(function(p){ KS.push(kijker({ yaw:y, pitch:p })); }); });
    for (var i = 10; i < L.length; i++) for (var e = 0; e < 12; e += .25){
      var ok = true; for (var k = 0; k < KS.length && ok; k++){ var q = rot3(KS[k], L[i]), zv = H.zf(q[0], q[1]); if (zv > 0 && q[2] < zv + r * .9) ok = false;
        /* ook de rand van de staaf: daar mag het hoofd niet ervoor komen */
        for (var o = 0; o < 4 && ok; o++){ var zo = H.zf(q[0] + (o === 0 ? r : o === 1 ? -r : 0), q[1] + (o === 2 ? r : o === 3 ? -r : 0)); if (zo > 0 && q[2] < zo - 1) ok = false; } }
      if (ok) break; L[i][2] += .25;
    }
    var d = { t:'buis', pts:L.map(function(q){ return [q[0], -q[1], q[2]]; }), r:r, k:meng(m.kleur, INKT, .25), om:2, glans:1 };
    return { delen:[d], binnen:function(p, mg){ return binnenDeel(d, HOOFDSTELSEL, p, mg); }, punten:function(){ return puntenDeel(d, HOOFDSTELSEL); } };
  }

  /* ---------- brillen: het ontwerp van vroeger, om een cilinder voor het gezicht gebogen ----------
     Elk stuk: [pad, eigenschappen, wat het doet]: s werpt een volle schaduw, l een lijnschaduw, d krijgt dikte.
     poot: waar het pootje aan het montuur zit; het loopt over de zijkant van het hoofd naar achter het oor. */
  function cirkelD(cx, cy, r, n){ n = n || 20; var d = ''; for (var i = 0; i < n; i++){ var a = i / n * TAU; d += (i ? 'L' : 'M') + n1(cx + Math.cos(a) * r) + ',' + n1(cy + Math.sin(a) * r); } return d + 'Z'; }
  function rrD(x, y, w, h, r){ var d = '', hk = [[x + w - r, y + h - r], [x + r, y + h - r], [x + r, y + r], [x + w - r, y + r]]; for (var q = 0; q < 4; q++) for (var i = 0; i <= 4; i++){ var a = (q + i / 4) * PI / 2; d += (d ? 'L' : 'M') + n1(hk[q][0] + Math.cos(a) * r) + ',' + n1(hk[q][1] + Math.sin(a) * r); } return d + 'Z'; }
  function hartD(cx){ var p = [[cx, 6], [cx - 11, -5]];
    function boog(a, b){ var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, r = Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2)) / 2, a0 = Math.atan2(a[1] - my, a[0] - mx); for (var j = 1; j <= 8; j++){ var t = a0 + j / 8 * PI; p.push([mx + Math.cos(t) * r, my + Math.sin(t) * r]); } }
    boog([cx - 11, -5], [cx, -11]); boog([cx, -11], [cx + 11, -5]);
    return 'M' + p.map(function(q){ return n1(q[0]) + ',' + n1(q[1]); }).join('L') + 'Z'; }
  function rechthoek(x, y, w, h){ return 'M' + x + ',' + y + 'L' + (x + w) + ',' + y + 'L' + (x + w) + ',' + (y + h) + 'L' + x + ',' + (y + h) + 'Z'; }
  var LIJN = function(k, w, extra){ return 'fill="none" stroke="' + k + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || ''); };
  var GLANS = LIJN('#fff', 2, ' opacity=".5"');
  var BRILLEN = {
    1:function(){ return { poot:[27, -8, INKT, 3], d:[[rrD(-27, -13, 22, 16, 6), 'fill="#14224C"', 'sd'], [rrD(5, -13, 22, 16, 6), 'fill="#14224C"', 'sd'], ['M-5,-8L5,-8', LIJN(INKT, 3), 'd'], ['M-22,-9L-14,-9M10,-9L18,-9', LIJN('#fff', 2, ' opacity=".35"')]] }; },
    2:function(){ return { ketting:[[25, 4], [31, 14], [27, 26], '#c9971f'], d:[[cirkelD(15, -4, 12, 24), 'fill="#fff" fill-opacity=".14" stroke="#c9971f" stroke-width="2.5"', 'ld'], ['M8,-9.5L13,-11.5', GLANS]] }; },
    3:function(){ var g = 'fill="#fff" fill-opacity=".16" stroke="#14224C" stroke-width="2.4"'; return { poot:[27, -6, INKT, 2.4], d:[[cirkelD(-15, -4, 12, 24), g, 'ld'], [cirkelD(15, -4, 12, 24), g, 'ld'], ['M-3,-5L3,-5', LIJN(INKT, 2.4), 'd'], ['M-21,-8.5L-15,-10.5M9,-8.5L15,-10.5', GLANS]] }; },
    4:function(){ var g = 'fill="#101c3f"', v = 'fill="#1b3a8f" opacity=".85"'; return { poot:[28, -9, '#101c3f', 3], d:[[rrD(-28, -14, 24, 18, 7), g, 'sd'], [rrD(4, -14, 24, 18, 7), g, 'sd'], ['M-4,-8L4,-8', LIJN('#101c3f', 3), 'd'],
      ['M-20,-11Q-15,-4 -8,-8Q-11,0 -19,-3Q-25,-6 -20,-11Z', v], [cirkelD(14, -6, 3.4, 12), v], [cirkelD(21, -11, 1.8, 10), 'fill="#1b3a8f" opacity=".7"']] }; },
    5:function(){ var g = 'fill="#fff" fill-opacity=".18" stroke="#14224C" stroke-width="3" stroke-linejoin="round"'; return { poot:[28, -9, INKT, 3], d:[[rrD(-28, -15, 24, 19, 3), g, 'ld'], [rrD(4, -15, 24, 19, 3), g, 'ld'], ['M-4,-8L4,-8', LIJN(INKT, 3), 'd'], ['M-23,-11L-17,-12.5M9,-11L15,-12.5', GLANS]] }; },
    6:function(){ var g = 'fill="#F26D8F" stroke="#b8365a" stroke-width="2" stroke-linejoin="round"'; return { poot:[26, -6, '#b8365a', 2], d:[[hartD(-15), g, 'sd'], [hartD(15), g, 'sd'], ['M-4,-7L4,-7', LIJN('#b8365a', 2), 'd'], ['M-21,-9L-18,-11M9,-9L12,-11', LIJN('#fff', 2, ' opacity=".55"')]] }; },
    7:function(){ var g = 'fill="#FFD166" stroke="#c9971f" stroke-width="1.6" stroke-linejoin="round"', st = function(x){ return 'M' + x + ',-19l4.1,8.4 9.2,1.3 -6.6,6.5 1.6,9.2 -8.3,-4.4 -8.3,4.4 1.6,-9.2 -6.6,-6.5 9.2,-1.3z'; };
      return { poot:[27, -9, '#c9971f', 2.4], d:[[st(-15), g, 'sd'], [st(15), g, 'sd'], [cirkelD(-15, -5, 5.2, 14), 'fill="#14224C"'], [cirkelD(15, -5, 5.2, 14), 'fill="#14224C"'], ['M-4,-7L4,-7', LIJN('#c9971f', 2.4), 'd'], [cirkelD(-13, -7, 1.4, 8), 'fill="#fff" opacity=".7"'], [cirkelD(17, -7, 1.4, 8), 'fill="#fff" opacity=".7"']] }; },
    8:function(){ return { band:[-6, 3, INKT], d:[[rrD(-31, -17, 62, 23, 11), 'fill="#EA9836" stroke="#14224C" stroke-width="3" stroke-linejoin="round"', 'sd'], ['M-31,-6Q0,-14 31,-6L31,-5Q0,5 -31,-5Z', 'fill="#F26749" opacity=".55"'], ['M-22,-12L-14,-14M16,-13L22,-14', LIJN('#fff', 2.4, ' opacity=".7"')]] }; },
    9:function(){ var u = [];
      [-15, 15].forEach(function(cx){ u.push([cirkelD(cx, -5, 10, 20), 'fill="#c9cfe0"', 's'], [rechthoek(cx - 6, -11, 5, 5), 'fill="#83A5F2"'], [rechthoek(cx + 1, -6, 5, 5), 'fill="#9A55B8"'], [rechthoek(cx - 5, -1, 5, 4), 'fill="#fff"'], [rechthoek(cx + 1, -12, 4, 4), 'fill="#F26749"'],
        ['M' + (cx - 10) + ',-5L' + (cx + 10) + ',-5M' + cx + ',-15L' + cx + ',5M' + (cx - 8) + ',-11L' + (cx + 8) + ',-11M' + (cx - 8) + ',1L' + (cx + 8) + ',1', 'fill="none" stroke="#8f9db0" stroke-width=".7"'],
        [cirkelD(cx, -5, 10, 20), 'fill="none" stroke="#9A55B8" stroke-width="2.6"', 'd']); });
      u.push(['M-5,-6L5,-6', LIJN('#9A55B8', 2.6), 'd'], ['M-24,-17l.9,2.2 2.2,.9 -2.2,.9 -.9,2.2 -.9,-2.2 -2.2,-.9 2.2,-.9z M24,-18l.8,1.9 1.9,.8 -1.9,.8 -.8,1.9 -.8,-1.9 -1.9,-.8 1.9,-.8z', 'fill="#fff" stroke="#9A55B8" stroke-width=".6" stroke-linejoin="round"']);
      return { poot:[25, -7, '#9A55B8', 2.6], d:u }; }
  };
  var BRILVORM = {};
  function brilVorm(n){
    if (BRILVORM[n]) return BRILVORM[n];
    var B = BRILLEN[n]();
    B.el = B.d.map(function(q){
      var a = ' ' + q[1], dik = a.replace(/#[0-9a-fA-F]{6}/g, function(k){ return meng(k, INKT, .45); });
      if (/fill-opacity/.test(dik)) dik = dik.replace(/fill="[^"]*"/, 'fill="none"').replace(/ fill-opacity="[^"]*"/, '');
      var sw = /stroke-width="([\d.]+)"/.exec(a);
      var seg = absPad(q[0]);
      /* klein (onder 56 px): om en om een punt van een lange rij rechte stukken, dat zie je niet */
      var segK = seg.length > 14 ? seg.filter(function(z, i){ return z[0] !== 'L' || i % 2 || (seg[i + 1] && seg[i + 1][0] !== 'L'); }) : seg;
      return { seg:seg, segK:segK, a:a, dik:/d/.test(q[2] || '') ? dik : null,
        sch:/s/.test(q[2] || '') ? ' fill="' + SCHK + '" fill-opacity=".15"' : /l/.test(q[2] || '') ? ' fill="none" stroke="' + SCHK + '" stroke-opacity=".14" stroke-width="' + n1((sw ? +sw[1] : 2) * 1.3) + '" stroke-linejoin="round"' : null };
    });
    return (BRILVORM[n] = B);
  }
  /* een rij punten fijner maken, zodat het afknippen achter het hoofd netjes gaat */
  function fijn(P, max){ var u = [P[0]]; for (var i = 1; i < P.length; i++){ var a = P[i - 1], b = P[i], l = Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2) + Math.pow(b[2] - a[2], 2)), k = Math.max(1, Math.ceil(l / max)); for (var j = 1; j <= k; j++) u.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k, a[2] + (b[2] - a[2]) * j / k]); } return u; }
  /* een personage met haar opzij: vanaf welke hoek (graden van voren) zit er op hoogte y haar op het hoofd */
  function zijHaar(m, y){
    var g = m.sp && m.sp.g, min = 999; if (!g || !PERSONEN[g]) return min;
    PERSONEN[g]().forEach(function(def){ var P = def.zij; if (!P) return; for (var i = 0, j = P.length - 1; i < P.length; j = i++){ var a = P[j], b = P[i]; if ((a[1] > y) !== (b[1] > y)){ var u = a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]); if (u < min) min = u; } } });
    return min;
  }
  /* de bovenkant van het montuur (y, omlaag positief) */
  function brilTop(n){ var B = brilVorm(n); if (B.top == null){ var t = 0; B.el.forEach(function(e){ e.seg.forEach(function(q){ for (var i = 2; i < q.length; i += 2) if (q[i] < t) t = q[i]; }); }); B.top = t; } return B.top; }
  function bouwBril(m, H, n, hoed, baard){
    var B = brilVorm(n), Rg = 40, zF = H.Rf + 2.2, delen = [];
    /* een snor of baard eronder: het montuur komt er net voor, nooit erdoorheen */
    if (baard){ var bx = 0, by0 = 1e9, by1 = -1e9; B.el.forEach(function(e){ e.seg.forEach(function(q){ for (var i = 1; i < q.length; i += 2){ bx = Math.max(bx, Math.abs(q[i])); by0 = Math.min(by0, q[i + 1]); by1 = Math.max(by1, q[i + 1]); } }); });
      baard.delen.forEach(function(st){ if (st.zij || !st.omtrek) return; st.punten3.forEach(function(p){ if (Math.abs(p[0]) < bx + 3 && p[1] > by0 - 3 && p[1] < by1 + 3) zF = Math.max(zF, p[2] + 2.6 + Rg - Math.sqrt(Math.max(Rg * Rg - p[0] * p[0], 1))); }); }); }
    function om(x, y, terug){ var t = x / Rg, R = Rg - (terug || 0); return [R * Math.sin(t), y, zF - Rg + R * Math.cos(t)]; }
    function L(p){ return [p[0], -p[1], p[2]]; }
    if (B.poot) [-1, 1].forEach(function(k){
      /* Het pootje loopt van de buitenkant van het montuur over de zijkant van het hoofd naar achteren, vlak boven
         het oppervlak en een fractie omlaag naar het oor. Voorbij de zijkant zakt het in het hoofd (achter het oor).
         Het hoort bij de laag van het gezicht: wat buiten de omtrek van het hoofd zou vallen, knipt de omtrek af. */
      var x0 = k * B.poot[0], yp = B.poot[1], rp = Math.max(1.1, B.poot[3] / 2), P = [om(x0, yp), om(x0 + k * 2.5, yp)];
      var c0 = H.bm(yp), a0 = Math.atan2(P[1][0] - c0, Math.max(P[1][2], 1)), a1 = k * 104 * GR;
      for (var j = 1; j <= 14; j++){
        var t = j / 14, a = a0 + (a1 - a0) * t, y = yp + 7 * t * t, g = Math.abs(a) / GR, R = H.bw(y) + rp + .5;
        if (g > 86) R -= (rp + 4.5) * Math.min(1, (g - 86) / 14);
        /* bij een personage verdwijnt het pootje onder de bakkebaard of de pluk haar opzij */
        var gz = zijHaar(m, y); if (g > gz - 28) R -= (rp + 4.5) * Math.min(1, (g - gz + 28) / 8);
        P.push([H.bm(y) + R * Math.sin(a), y, R * Math.cos(a)]);
      }
      /* verdwijnt het pootje onder haar opzij (een personage), dan komt het na de baard en de bakkebaarden: het
         ligt erbovenop tot het onder het haar duikt, ruim voor de rand van het hoofd */
      delen.push({ t:'buis', pts:fijn(P.map(L), 2), r:rp, k:B.poot[2], om:1, laag:zijHaar(m, yp) < 999 || zijHaar(m, yp + 7) < 999 ? 'voor' : 'hoofd' });
    });
    /* het bandje van de skibril: strak om het hoofd, onder het glas door */
    /* onder een koptelefoon is het bandje smaller, zodat het onder de schelpen door past */
    if (B.band){ var gzb = zijHaar(m, B.band[0]), rb = hoed && hoed.n === 17 ? 1.6 : B.band[1], azb = hoed && hoed.n === 23 ? H.half + FERRY.dikte[2] + rb + .6 : H.Rf * .8, P2 = [], ax = Math.max(H.breedte(B.band[0]) + rb + .3, 32), rand0 = om(-31, B.band[0], 4), a1 = -Math.asin(31 / ax), az = rand0[2] / Math.cos(a1);
      for (var g = 0; g <= 60; g++){ var t = a1 - g / 60 * (TAU + 2 * a1), c2 = Math.cos(t); var pb = [(c2 > 0 ? ax : ax - rb - 3.5) * Math.sin(t), B.band[0], (c2 > 0 ? az : H.Rf * .55) * c2];
        /* bij een personage gaat het bandje onder de bakkebaard of de pluk haar door */
        if (Math.atan2(Math.abs(pb[0]), pb[2]) / GR > gzb - 22){ pb[0] *= .72; pb[2] *= .72; }
        P2.push(L(pb)); }
      delen.push({ t:'buis', pts:P2, r:rb, k:B.band[2], om:1, laag:'hoofd' }); }
    /* bij een baard of snor hangt het kettinkje korter, naast het glas: anders moet het om de baard heen */
    if (B.ketting){ var Kt = baard ? [B.ketting[0], [29.5, 7], [29.5, 11], B.ketting[3]] : B.ketting, P3 = []; kwad(Kt[0], Kt[1], Kt[2], 10).forEach(function(q){ var R3 = H.Rf + 1.2; P3.push([q[0], q[1], Math.sqrt(Math.max(R3 * R3 - q[0] * q[0] - q[1] * q[1], 1))]); });
      /* over een snor of baard heen, niet erdoor */
      P3 = fijn(P3, 2); if (baard) P3.forEach(function(p){ for (var e = 0; e < 40 && baard.binnen(p, 4); e++) p[2] += .5; });
      delen.push({ t:'buis', pts:P3.map(L), r:.75, k:Kt[3], streep:'2 2', om:1, kap:1, laag:baard ? 'voor' : 'midden' }); }
    /* voor de controle: het montuur als dunne schaal om de cilinder */
    var vorm = [], top = 0; B.el.forEach(function(e){ e.seg.forEach(function(q){ for (var i = 1; i < q.length; i += 2){ vorm.push([q[i], q[i + 1]]); if (q[i + 1] < top) top = q[i + 1]; } }); });
    return { n:n, B:B, om:om, delen:delen, top:top, zF:zF, Rg:Rg, voorDeel:{ t:'brilvoor', pts:vorm.map(function(q){ return om(q[0], q[1]); }) },
      binnen:function(p, mg){
        for (var i = 0; i < delen.length; i++) if (binnenDeel(delen[i], HOOFDSTELSEL, p, mg)) return true;
        var dz = p[2] - (zF - Rg), rho = Math.sqrt(p[0] * p[0] + dz * dz), x = Rg * Math.atan2(p[0], dz);
        if (Math.abs(rho - Rg) > 1.6 + mg || dz <= 0) return false;
        for (var j = 0; j < vorm.length; j++) if (Math.abs(vorm[j][0] - x) < 2 + mg && Math.abs(vorm[j][1] - p[1]) < 2 + mg) return true;
        return false; },
      punten:function(){ var u = vorm.map(function(q){ return om(q[0], q[1]); }); delen.forEach(function(d){ u = u.concat(puntenDeel(d, HOOFDSTELSEL)); }); return u; } };
  }
  function tekenBril(C, br){
    var K = C.K, B = br.B, s = '', dik = '', sch = '', z = 0, nz = 0, proef = C.proef ? { poly:[], cil:{ K:K, zF:br.zF, Rg:br.Rg } } : null;
    C.brilZ = rot3(K, br.om(0, br.top))[2];
    var bb = [1e9, 1e9, -1e9, -1e9];
    function kaart(seg, terug, schaduw){
      return seg.map(function(q){ var u = q[0]; for (var i = 1; i < q.length; i += 2){ var P = rot3(K, br.om(q[i], q[i + 1], terug)); if (schaduw) P = opBol(P, C.H.Rf - 1); else if (!terug){ z += P[2]; nz++; if (P[0] < bb[0]) bb[0] = P[0]; if (P[1] < bb[1]) bb[1] = P[1]; if (P[0] > bb[2]) bb[2] = P[0]; if (P[1] > bb[3]) bb[3] = P[1]; } u += (i > 1 ? ' ' : '') + n1(P[0]) + ',' + n1(P[1]); } return u; }).join('');
    }
    B.el.forEach(function(e){
      if (e.dik && !C.klein) dik += '<path d="' + kaart(e.seg, 1.8) + '"' + e.dik + '/>';
      if (e.sch && !C.klein) sch += '<path d="' + kaart(e.seg, 0, 1) + '"' + e.sch + '/>';
      s += '<path d="' + kaart(C.klein ? e.segK : e.seg) + '"' + e.a + '/>';
      if (proef && e.sch){ var P = []; e.seg.forEach(function(q){ if (q[0] !== 'Z') P.push(rot3(K, br.om(q[q.length - 2], q[q.length - 1]))); }); if (P.length > 2) proef.poly.push(P); }
    });
    C.schaduw += sch;
    tekenDelen(C, HOOFDSTELSEL, br.delen);
    C.deel = br.voorDeel;
    stuk(C, 'voor', nz ? z / nz : 40, dik + s, proef, [bb[0] - 2, bb[1] - 2, bb[2] + 2, bb[3] + 2]);
  }

  /* ---------- alles bij elkaar ---------- */
  function opbouw(m){
    if (m.d3 !== undefined) return m.d3;
    var sp = m.sp, hn = sp.h || (sp.g === 3 ? 22 : sp.g === 2 ? 23 : 0);
    /* zonder hoed, krul, bril of figuur hoeft het hoofd niet in de ruimte te worden opgemeten */
    if (!(hn && HOEDEN[hn]) && m.extra !== 2 && !(sp.q && BRILLEN[sp.q]) && !(sp.f && FIGUREN[sp.f]) && !(sp.g && PERSONEN[sp.g])) return (m.d3 = null);
    var H = hoofd3(m), d = { hoed:null, bril:null, fig:null, krul:null, baard:null };
    if (sp.g && PERSONEN[sp.g]) d.baard = bouwBaard(m, H, sp.g);
    if (hn && HOEDEN[hn]) d.hoed = bouwHoed(m, H, hn);
    else if (m.extra === 2) d.krul = bouwKrul(m, H);
    if (sp.q && BRILLEN[sp.q]) d.bril = bouwBril(m, H, sp.q, d.hoed, d.baard);
    if (sp.f && FIGUREN[sp.f]) d.fig = bouwFiguur(m, H, sp.f, d.hoed);
    if (!(d.hoed || d.bril || d.fig || d.krul || d.baard)) return (m.d3 = null);
    /* Voor elk paar onderdelen dat elkaar niet raakt, zoeken we een vlak dat ze scheidt. Wie aan de kant van de
       kijker van dat vlak ligt, ligt ervoor, in elke kijkrichting; daarmee leggen we de tekenvolgorde vast
       waar sorteren op diepte misgaat (een stengel op een pompoen van onderen gezien, een rand onder een kroon). */
    var lijst = [];
    if (d.hoed) d.hoed.delen.forEach(function(p){ if (p.t !== 'sticker') lijst.push([p, p.S || d.hoed.S]); });
    if (d.fig) d.fig.delen.forEach(function(p){ lijst.push([p, HOOFDSTELSEL]); });
    if (d.krul) lijst.push([d.krul.delen[0], HOOFDSTELSEL]);
    if (d.baard) d.baard.delen.forEach(function(st){ lijst.push([st, null]); });
    if (d.bril) lijst.push([d.bril.voorDeel, HOOFDSTELSEL]);
    var pts = lijst.map(function(q){ return q[0].t === 'brilvoor' ? q[0].pts : q[0].t === 'kussen' ? q[0].punten3 : puntenDeel(q[0], q[1]); }), regels = [];
    for (var i = 0; i < lijst.length; i++) for (var j = i + 1; j < lijst.length; j++){
      var a = lijst[i][0], b = lijst[j][0];
      if (a.groep != null && a.groep === b.groep && a.zij === b.zij) continue;
      var n = scheidVlak(pts[i], pts[j], d.hoed ? d.hoed.S.u : [0, -1, 0]);
      if (n) regels.push({ a:a, b:b, n:n });
    }
    d.regels = regels;
    return (m.d3 = d);
  }
  /* De spullen van een gezichtje in één stand. Geeft { defs, achter, schaduw, midden, voor }; met proef
     (een lijst) ook de stukken op tekenvolgorde, met hun vorm en diepte, voor de controle. */
  function teken3d(m, st, id, leeft, maat, proef){
    var D = opbouw(m); if (!D) return null;
    var H = hoofd3(m), klein = (maat || 100) < 56;
    var C = { K:kijker(st), H:H, id:id + '3', klein:klein, sc:klein ? 1.3 : 1, rim:Math.max(1.6, Math.min(6, 120 / (maat || 100))), vast:!!leeft,
      stukken:[], halo:'', haloD:'', gm:{}, ng:0, gdefs:'', schaduw:'', nr:0, nk:0, huid:m.kleur, proef:proef || null, Rsch:H.rho + 1, eig:'', hoedVoorZ:-1e9, brilZ:-1e9 };
    if (D.baard){ C.eig = 'baard'; tekenBaard(C, D.baard); }
    if (D.fig){ C.eig = 'figuur'; tekenDelen(C, HOOFDSTELSEL, D.fig.delen); }
    if (D.bril){ C.eig = 'bril'; tekenBril(C, D.bril); }
    if (D.krul){ C.eig = 'krul'; tekenDelen(C, HOOFDSTELSEL, D.krul.delen); }
    if (D.hoed){
      C.eig = 'hoed'; C.schaduwBoog = null;
      tekenDelen(C, D.hoed.S, D.hoed.delen);
      if (C.schaduwBoog){ var b = C.schaduwBoog, sp = b.map(function(q){ return opBol(q, C.Rsch); }).concat(b.slice().reverse().map(function(q){ return [q[0], q[1]]; }));
        C.schaduw += '<path d="' + lijnD(sp, 1) + '" fill="' + SCHK + '" fill-opacity=".16" stroke="' + SCHK + '" stroke-opacity=".05" stroke-width="3" stroke-linejoin="round"/>'; }
    }
    C.defs3 = C.knipDefs || '';
    var achter = [], gezicht = [], midden = [], voor = [];
    C.stukken.forEach(function(p){ (p.laag === 'achter' ? achter : p.laag === 'hoofd' ? gezicht : p.laag === 'midden' ? midden : voor).push(p); });
    /* een groep (spriet met bolletje) houdt zijn eigen volgorde en sorteert als geheel */
    var gz = {}; achter.forEach(function(p){ if (p.deel && p.deel.groep != null){ var g = p.eig + p.deel.groep; if (gz[g] == null || p.z < gz[g]) gz[g] = p.z; } });
    achter.forEach(function(p){ p.zs = p.deel && p.deel.groep != null ? gz[p.eig + p.deel.groep] : p.z; });
    achter.sort(function(a, b){ return a.zs - b.zs || a.nr - b.nr; });
    /* eerst de gewone volgorde: de bril, dan de hoed (de bril zit onder de hoedrand), binnen de hoed zoals
       ontworpen; dan beslissen de scheidingsvlakken waar dat in deze kijkrichting anders moet */
    var zs = D.hoed && D.hoed.sorteer, rang = { baard:-1, bril:0, krul:1, figuur:2, hoed:3 };
    voor.sort(function(a, b){ return rang[a.eig] - rang[b.eig] || (b.vooraan ? 1 : 0) - (a.vooraan ? 1 : 0) || (zs && a.eig === 'hoed' ? a.z - b.z : 0) || a.nr - b.nr; });
    if (D.regels.length){ var rg = D.regels.map(function(q){ return { a:q.a, b:q.b, bVoor:rot3(C.K, q.n)[2] > 0 }; }); schik(achter, rg); schik(voor, rg); }
    function tekst(l){ var s = ''; for (var i = 0; i < l.length; i++) s += l[i].s; return s; }
    if (proef){ achter.concat(['hoofd'], gezicht, midden, voor).forEach(function(p){ proef.push(p); }); }
    return { defs:'<linearGradient id="' + C.id + 'L" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset=".58" stop-color="' + SCHK + '" stop-opacity="0"/><stop offset="1" stop-color="' + SCHK + '" stop-opacity=".3"/></linearGradient>' +
        '<radialGradient id="' + C.id + 'B" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".36" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="' + SCHK + '" stop-opacity="0"/><stop offset="1" stop-color="' + SCHK + '" stop-opacity=".3"/></radialGradient>' + C.gdefs + (C.defs3 || ''),
      achter:(C.haloD ? '<path d="' + C.haloD + '" fill="none" stroke="#fff" stroke-opacity=".42" stroke-width="' + n1(C.rim * 1.8 + 1.5) + '" stroke-linejoin="round"/>' : '') + C.halo + tekst(achter), schaduw:C.schaduw + tekst(gezicht), midden:tekst(midden), voor:tekst(voor) };
  }
  /* De volgorde: stukken die in beeld over elkaar vallen, krijgen een regel. Is er een scheidingsvlak, dan
     beslist dat (wie aan de kant van de kijker ligt, komt erna); anders blijft de gewone volgorde. Dan sorteren we
     zo dat elke regel klopt (topologisch), en verder zo dicht mogelijk bij de gewone volgorde. */
  function raken(a, b){ return !a || !b || (a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]); }
  function schik(l, rg){
    var n = l.length, i, j; if (n < 2) return;
    function regel(p, q){ for (var k = 0; k < rg.length; k++){ var r = rg[k]; if (p.deel === r.a && q.deel === r.b) return r.bVoor; if (p.deel === r.b && q.deel === r.a) return !r.bVoor; } return null; }
    var na = [], inn = [];
    for (i = 0; i < n; i++){ na.push([]); inn.push(0); }
    for (i = 0; i < n; i++) for (j = i + 1; j < n; j++){
      if (l[i].deel === l[j].deel || !raken(l[i].bb, l[j].bb)) continue;
      var r = regel(l[i], l[j]), eerst = r === null ? i : r ? i : j, dan = eerst === i ? j : i;
      na[eerst].push(dan); inn[dan]++;
    }
    var uit = [], gedaan = [];
    for (var stap = 0; stap < n; stap++){
      var kies = -1;
      for (i = 0; i < n; i++) if (!gedaan[i] && !inn[i]){ kies = i; break; }
      if (kies < 0) for (i = 0; i < n; i++) if (!gedaan[i]){ kies = i; break; }
      gedaan[kies] = true; uit.push(l[kies]);
      na[kies].forEach(function(q){ inn[q]--; });
    }
    for (i = 0; i < n; i++) l[i] = uit[i];
  }
  /* Een levend gezichtje bijwerken: zelfde opbouw als het vorige beeldje, dan alleen de eigenschappen
     zetten die veranderd zijn. Opnieuw opbouwen (innerHTML) kost veel meer, zeker met dertig tegelijk. */
  var ATTR = /([\w:-]+)="([^"]*)"/g;
  function tagVan(s){ var i = 0; while (i < s.length){ var c = s.charCodeAt(i); if (c === 32 || c === 47 || c === 62) break; i++; } return s.slice(0, i); }
  function attrs(s){ var e = s.indexOf('>'), kop = e < 0 ? s : s.slice(0, e), o = {}, m; ATTR.lastIndex = 0; while ((m = ATTR.exec(kop))) o[m[1]] = m[2]; return o; }
  /* snelle weg: dezelfde eigenschappen in dezelfde volgorde; dan alleen de veranderde waarden zetten. Lukt dat
     niet (een eigenschap erbij of eraf), dan geeft hij false en doet zetLevend het met de lange weg. */
  function gelijkeNamen(el, d, o){
    var i = d.indexOf(' '), j = o.indexOf(' '), zet = [];
    while (i >= 0 && j >= 0){
      var ie = d.indexOf('="', i), je = o.indexOf('="', j);
      if (ie < 0 || je < 0) break;
      var nn = d.slice(i + 1, ie);
      if (nn !== o.slice(j + 1, je)) return false;
      var iv = d.indexOf('"', ie + 2), jv = o.indexOf('"', je + 2), v = d.slice(ie + 2, iv);
      if (v !== o.slice(je + 2, jv)) zet.push(nn, v);
      i = d.charCodeAt(iv + 1) === 32 ? iv + 1 : -1; j = o.charCodeAt(jv + 1) === 32 ? jv + 1 : -1;
    }
    if (i >= 0 || j >= 0) return false;
    for (var k = 0; k < zet.length; k += 2) el.setAttribute(zet[k], zet[k + 1]);
    return true;
  }
  function zetLevend(a, html){
    var delen = html.split('<'), oud = a.delen;
    if (oud && oud.length === delen.length){
      var els = a.els || (a.els = a.el.getElementsByTagName('*')), k = -1, ok = true;
      for (var i = 1; i < delen.length; i++){
        var d = delen[i], o = oud[i];
        if (d.charCodeAt(0) === 47){ if (d !== o){ ok = false; break; } continue; }
        k++;
        if (d === o) continue;
        var el = els[k];
        if (!el || tagVan(d) !== tagVan(o) || d.slice(d.indexOf('>')) !== o.slice(o.indexOf('>'))){ ok = false; break; }
        if (gelijkeNamen(el, d, o)) continue;
        var nA = attrs(d), oA = attrs(o), n;
        for (n in nA) if (nA[n] !== oA[n]) el.setAttribute(n, nA[n]);
        for (n in oA) if (!(n in nA)) el.removeAttribute(n);
      }
      if (ok){ a.delen = delen; return; }
    }
    a.el.innerHTML = html; a.delen = delen; a.els = null;
  }

  /* ---------- personages (g): baarden, snorren en bakkebaarden als volume op het hoofd ----------
     Elk stuk is een kussen op het oppervlak van het hoofd: een omtrek, een dikte en een kleur.
     voor: de omtrek in de maten van het gezicht (x, y), om het hoofd gebogen (een snor, een baard).
     zij: de omtrek als hoek rond het hoofd (graden, 0 is voor, 90 is opzij) en hoogte; hij komt aan
     beide kanten, gespiegeld (bakkebaarden, plukken haar opzij). dik: hoe ver hij boven het hoofd uitkomt,
     bol: hoeveel dikker hij naar de zijkant wordt (zo steken plukken opzij buiten het hoofd uit).
     lijnen: haren als lijntjes erop. */
  var PERSONEN = {
    /* 1 Lord Salisbury: kale kruin, grijze plukken opzij, een volle grijze baard en een snor */
    1:function(){ return [
      { zij:[[68, -22], [82, -25], [95, -20], [101, -10], [100, 2], [94, 10], [84, 9], [76, 2], [70, -10]], dik:1.4, bol:3.5, k:'#A3A9B3', l:'#6E7480', lw:1.4,
        lijnen:[[[78, -18], [88, -10], [92, 0]], [[86, -20], [96, -12], [98, -2]]], lk:'#7A818C' },
      { voor:'M-28,10 C-30,28 -16,42 0,44 C16,42 30,28 28,10 C22,18 12,22 0,22 C-12,22 -22,18 -28,10 Z', dik:2.6, k:'#9AA0AA', l:'#6E7480', lw:1.6,
        lijnen:['M-12,30 Q-10,35 -11,40', 'M0,29 L0,40', 'M12,30 Q10,35 11,40'], lk:'#7A818C' },
      { voor:'M-17,12 Q-8,5 0,9 Q8,5 17,12 Q8,18 0,15 Q-8,18 -17,12 Z', dik:4.4, k:'#858C97', l:'#6E7480', lw:1.4 }]; },
    /* 2 Jules Ferry: grote zwarte bakkebaarden (onder het haar van hoed 23), een snor en een gladde kin */
    2:function(){ return [
      { zij:[[62, -14], [80, -16], [96, -12], [101, 0], [99, 14], [88, 26], [66, 34], [52, 31], [47, 22], [46, 12], [52, 3], [57, -6]], dik:1.8, bol:3, k:'#3A2E2A', l:'#1f1714', lw:1.4 },
      { voor:'M-23,12 Q-11,4 0,9 Q11,4 23,12 Q12,18 0,14 Q-12,18 -23,12 Z', dik:3.8, k:'#3A2E2A', l:'#1f1714', lw:1.4 },
      { lijn:'M-5,23 Q0,26 5,23', dik:.6, k:INKT, w:3.5 }]; },
    /* 3 Otto von Bismarck: de punthelm (hoed 22) en een grote witte walrussnor */
    3:function(){ return [
      { voor:'M-28,10 C-22,-2 -8,0 0,5 C8,0 22,-2 28,10 C26,22 14,24 8,16 Q0,12 -8,16 C-14,24 -26,22 -28,10 Z', dik:4.2, k:'#ECEAE2', l:'#9C988C', lw:1.6,
        lijnen:['M-18,6 L-15,14', 'M-8,5 L-7,13', 'M8,5 L7,13', 'M18,6 L15,14'], lk:'#B5B2A8' }]; },
    /* 4 Leopold II: kaal met witte plukken opzij, een lange puntbaard en een snor */
    4:function(){ return [
      { zij:[[68, -24], [82, -27], [95, -22], [101, -12], [100, 0], [94, 7], [84, 6], [76, -1], [70, -12]], dik:1.4, bol:3.5, k:'#E2E0D8', l:'#9C988C', lw:1.4,
        lijnen:[[[78, -20], [88, -12], [92, -2]], [[86, -22], [96, -14], [98, -4]]], lk:'#B9B6AC' },
      { voor:'M-22,12 C-22,28 -10,40 0,48 C10,40 22,28 22,12 C17,19 9,22 0,22 C-9,22 -17,19 -22,12 Z', dik:2.6, k:'#E2E0D8', l:'#9C988C', lw:1.6,
        lijnen:['M-8,29 Q-4,37 0,44', 'M8,29 Q4,37 0,44'], lk:'#B9B6AC' },
      { voor:'M-20,16 Q-8,8 0,13 Q8,8 20,16 Q8,22 0,18 Q-8,22 -20,16 Z', dik:4.4, k:'#CFCCC2', l:'#9C988C', lw:1.4 }]; }
  };
  /* een pad (M, L, Q, C, Z) als rij punten, ongeveer elke 2,5 eenheid een punt; elk deelpad apart */
  function padPunten(d){
    var uit = [], cur = null, x = 0, y = 0;
    absPad(d).forEach(function(q){
      var n, i, t, s;
      if (q[0] === 'M'){ cur = [[q[1], q[2]]]; uit.push(cur); x = q[1]; y = q[2]; return; }
      if (q[0] === 'Z') return;
      if (q[0] === 'L'){ n = Math.max(1, Math.ceil(Math.sqrt((q[1] - x) * (q[1] - x) + (q[2] - y) * (q[2] - y)) / 2.5)); for (i = 1; i <= n; i++) cur.push([x + (q[1] - x) * i / n, y + (q[2] - y) * i / n]); x = q[1]; y = q[2]; return; }
      var ex = q[q.length - 2], ey = q[q.length - 1], L = Math.sqrt((ex - x) * (ex - x) + (ey - y) * (ey - y));
      n = Math.max(2, Math.ceil(L / 2.5) + 1);
      for (i = 1; i <= n; i++){ t = i / n; s = 1 - t;
        if (q[0] === 'Q') cur.push([s * s * x + 2 * s * t * q[1] + t * t * q[3], s * s * y + 2 * s * t * q[2] + t * t * q[4]]);
        else cur.push([s * s * s * x + 3 * s * s * t * q[1] + 3 * s * t * t * q[3] + t * t * t * q[5], s * s * s * y + 3 * s * s * t * q[2] + 3 * s * t * t * q[4] + t * t * t * q[6]]); }
      x = ex; y = ey;
    });
    uit.forEach(function(r){ if (r.length > 2){ var a = r[0], b = r[r.length - 1]; if (Math.abs(a[0] - b[0]) < .01 && Math.abs(a[1] - b[1]) < .01) r.pop(); } });
    return uit;
  }
  /* het stuk om het hoofd leggen: (u, v) in de maten van het stuk naar een punt in het hoofd (x, y omlaag, z naar voren) */
  function kussenPunt(H, st, u, v, extra){
    var y = v, yb = st.yb;
    if (y > yb) y = yb;
    var w = H.bw(y), c = H.bm(y), sn, t;
    if (st.zij){ var g = u * GR; sn = Math.sin(g); t = st.dik + st.bol * klem((u - 70) / 30, 0, 1) + (extra || 0); var R = w + t; return [c + st.zij * R * sn, v, R * Math.cos(g)]; }
    sn = klem((u - c) / (w || 1), -1, 1); t = st.dik + (extra || 0);
    var R2 = w + t, cs = Math.sqrt(1 - sn * sn);
    return [c + R2 * sn, v, R2 * cs];
  }
  /* binnen het kussen? (p in het hoofd) */
  function kussenBinnen(H, st, p, mg){
    var y = Math.min(p[1], st.yb), w = H.bw(y), c = H.bm(y), dx = p[0] - c, r = Math.sqrt(dx * dx + p[2] * p[2]), u, t;
    if (st.zij){ if (dx * st.zij <= 0) return false; u = Math.atan2(Math.abs(dx), p[2]) / GR; t = st.dik + st.bol * klem((u - 70) / 30, 0, 1); }
    else { if (p[2] <= 0) return false; u = c + w * (dx / (r || 1)); t = st.dik; }
    if (r < w - .5 - mg || r > w + t + (st.extra || 0) + mg) return false;
    var omt = st.omtrek;
    if (binnenPoly([u, p[1]], omt)) return true;
    for (var i = 0, j = omt.length - 1; i < omt.length; j = i++){ var a = omt[j], b = omt[i], vx = b[0] - a[0], vy = b[1] - a[1], k = klem(((u - a[0]) * vx + (p[1] - a[1]) * vy) / ((vx * vx + vy * vy) || 1), 0, 1), ex = u - a[0] - vx * k, ey = p[1] - a[1] - vy * k;
      if (ex * ex + ey * ey <= mg * mg) return true; }
    return false;
  }
  var KS25 = null;
  function bouwBaard(m, H, g){
    if (!PERSONEN[g]) return null;
    if (!KS25){ KS25 = []; [-25, -12.5, 0, 12.5, 25].forEach(function(y){ [-18, -9, 0, 9, 18].forEach(function(p){ KS25.push(kijker({ yaw:y, pitch:p })); }); }); }
    /* yb: onder de kin hangt een baard recht naar beneden, in het vlak van de onderste rij van het hoofd */
    var yb = 0; for (var yy = 0; yy < 80; yy += .5) if (H.bw(yy) > 12) yb = yy;
    var delen = [], nr = 0, voorEx = 0;
    PERSONEN[g]().forEach(function(def){
      (def.zij ? [-1, 1] : [0]).forEach(function(zij){
        var st = { zij:zij, dik:def.dik, bol:def.bol || 0, yb:yb, k:def.k, l:def.l, lw:def.lw, lk:def.lk, w:def.w, nr:nr++, t:'kussen' };
        if (def.lijn){ st.lijn = padPunten(def.lijn)[0]; st.extra = 0; }
        else st.omtrek = def.zij ? def.zij.slice() : padPunten(def.voor)[0];
        st.lijnen = (def.lijnen || []).map(function(l){ return typeof l === 'string' ? padPunten(l)[0] : l; });
        /* Een baard blijft op het hoofd: is de kin te kort (een plat of klein hoofd), dan wordt hij iets korter */
        if (st.omtrek && !st.zij){ var y0 = 1e9, y1 = -1e9; st.omtrek.forEach(function(q){ y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
          if (y1 > yb - 1 && y1 > y0){ var sch = Math.max(.4, (yb - 1 - y0) / (y1 - y0)), kort = function(q){ return [q[0], y0 + (q[1] - y0) * sch]; };
            st.omtrek = st.omtrek.map(kort); st.lijnen = st.lijnen.map(function(l){ return l.map(kort); }); } }
        /* Het hoofd draait niet als een starre bol mee: een punt dat in een kijkrichting achter het oppervlak zou
           komen (en niet achter de rand verdwijnt), komt in elke kijkrichting iets verder naar voren. */
        var rij = st.lijn || st.omtrek;
        st.ex = rij.map(function(q){
          for (var e = 0; e < 8; e += .25){
            var P = kussenPunt(H, st, q[0], q[1], e), ok = true;
            for (var k = 0; k < KS25.length && ok; k++){ var v = rot3(KS25[k], P), zv = H.zf(v[0], v[1]); if (zv > 0 && v[2] < zv + .3 && Math.abs(v[0] - H.bm(v[1])) < .9 * H.bw(v[1])) ok = false; }
            if (ok) return e;
          }
          return 8;
        });
        /* wat later komt (een snor over een baard) ligt minstens zo ver naar voren als wat eronder ligt */
        if (!st.zij && !st.lijn){ st.ex = st.ex.map(function(e){ return Math.max(e, voorEx); }); }
        st.extra = Math.max.apply(null, st.ex.concat([0]));
        if (!st.zij && !st.lijn) voorEx = Math.max(voorEx, st.extra);
        delen.push(st);
      });
    });
    function pts(st){
      var u = [], rij = st.lijn || st.omtrek;
      rij.forEach(function(q, i){ u.push(kussenPunt(H, st, q[0], q[1], st.ex[i])); });
      if (st.omtrek){ var bb = [1e9, 1e9, -1e9, -1e9]; st.omtrek.forEach(function(q){ bb[0] = Math.min(bb[0], q[0]); bb[1] = Math.min(bb[1], q[1]); bb[2] = Math.max(bb[2], q[0]); bb[3] = Math.max(bb[3], q[1]); });
        var stap = st.zij ? 5 : 3; for (var a = bb[0]; a <= bb[2]; a += stap) for (var b = bb[1]; b <= bb[3]; b += 3) if (binnenPoly([a, b], st.omtrek)) u.push(kussenPunt(H, st, a, b, st.extra)); }
      return u;
    }
    delen.forEach(function(st){ st.punten3 = pts(st); });
    return { g:g, delen:delen,
      binnen:function(p, mg){ for (var i = 0; i < delen.length; i++) if (delen[i].omtrek && kussenBinnen(H, delen[i], p, mg)) return true; return false; },
      punten:function(){ var u = []; delen.forEach(function(st){ u = u.concat(st.punten3); }); return u; } };
  }
  /* het kussen in beeld: punten achter het hoofd schuiven naar de rand van het hoofd (daar verdwijnt het achterlangs) */
  function tekenBaard(C, B){
    var K = C.K, H = C.H;
    function inBeeld(st, rij, ex){
      return rij.map(function(q, i){
        var v = rot3(K, kussenPunt(H, st, q[0], q[1], ex ? ex[i] : st.extra)), zv = H.zf(v[0], v[1]);
        if (zv > 0 && v[2] < zv - .3){ var c = H.bm(v[1]), w = H.bw(v[1]); return [c + (v[0] >= c ? w : -w), v[1], 0, 1]; }
        return v;
      });
    }
    B.delen.forEach(function(st){
      C.deel = st;
      if (st.lijn){
        var L = inBeeld(st, st.lijn, st.ex), runs = [], cur = [];
        L.forEach(function(p){ if (p[3]){ if (cur.length > 1) runs.push(cur); cur = []; } else cur.push(p); }); if (cur.length > 1) runs.push(cur);
        if (!runs.length) return;
        var D0 = runs.map(function(r){ return lijnD(r); }).join(''), z0 = 0, n0 = 0; runs.forEach(function(r){ r.forEach(function(p){ z0 += p[2]; n0++; }); });
        stuk(C, 'voor', z0 / n0, '<path d="' + D0 + '" fill="none" stroke="' + st.k + '" stroke-width="' + n1(st.w) + '" stroke-linecap="round"/>',
          C.proef ? { caps:runs.reduce(function(u, r){ for (var j = 1; j < r.length; j++) u.push([r[j - 1], r[j], st.w / 2]); return u; }, []) } : null, bbP(runs, st.w));
        return;
      }
      var O = inBeeld(st, st.omtrek, st.ex);
      if (O.every(function(p){ return p[3]; })) return;
      var D = C.klein ? lijnD(O, 1) : zachtD(O), lw = (st.lw || 1.4) * C.sc, z = 0;
      O.forEach(function(p){ z += p[2]; }); z /= O.length;
      var s = '<path d="' + D + '"' + verf(kv(C, st.k, 'B'), st.l, lw) + '/>';
      if (!C.klein && st.lijnen.length){
        var sl = '';
        st.lijnen.forEach(function(l){ var R = inBeeld(st, l, null), cur = [];
          R.forEach(function(p){ if (p[3]){ if (cur.length > 1) sl += lijnD(cur); cur = []; } else cur.push(p); }); if (cur.length > 1) sl += lijnD(cur); });
        if (sl) s += '<path d="' + sl + '" fill="none" stroke="' + meng(st.lk, INKT, .3) + '" stroke-width="1.6" stroke-linecap="round"/>';
      }
      haloD(C, D);
      /* een zachte schaduw op het gezicht, naar rechtsonder */
      C.schaduw += '<path transform="translate(1.3,1.9)" d="' + D + '" fill="' + SCHK + '" fill-opacity=".15"/>';
      var proef = null;
      if (C.proef){
        /* diepte: de punten binnen de omtrek, met hun buren in een raster tot driehoekjes */
        var tr = [], stap = st.zij ? 5 : 3, bb = [1e9, 1e9, -1e9, -1e9];
        st.omtrek.forEach(function(q){ bb[0] = Math.min(bb[0], q[0]); bb[1] = Math.min(bb[1], q[1]); bb[2] = Math.max(bb[2], q[0]); bb[3] = Math.max(bb[3], q[1]); });
        var V = function(a, b){ var v = rot3(K, kussenPunt(H, st, a, b, st.extra)), zv = H.zf(v[0], v[1]); return zv > 0 && v[2] < zv - .3 ? null : v; };
        for (var a = bb[0] - stap; a <= bb[2]; a += stap) for (var b = bb[1] - 3; b <= bb[3]; b += 3){
          var p00 = V(a, b), p10 = V(a + stap, b), p01 = V(a, b + 3), p11 = V(a + stap, b + 3);
          if (p00 && p10 && p11) tr.push([p00, p10, p11]); if (p00 && p11 && p01) tr.push([p00, p11, p01]);
        }
        proef = { poly:[O], tris:tr };
      }
      stuk(C, 'voor', z, s, proef, bbP([O], lw + 1));
    });
  }

  function teken(m, st, id, leeft, schaduw, maat, proef){
    /* het hoofd draait hooguit 25 graden opzij en 18 graden op of neer (een stemming bovenop een kijkrichting
       zou verder gaan); binnen dat bereik is gecontroleerd dat niets door iets anders heen steekt */
    if (st.yaw > 25 || st.yaw < -25 || st.pitch > 18 || st.pitch < -18){ var st2 = {}; for (var sk in st) st2[sk] = st[sk]; st2.yaw = klem(st.yaw, -25, 25); st2.pitch = klem(st.pitch, -18, 18); st = st2; }
    var sp = m.sp, stm = st.stemming || '', M = m.M, D3 = teken3d(m, st, id, leeft, maat, proef);
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

    /* hoed, bril, figuur en krul: in 3D (teken3d); wat achter het hoofd hoort, komt hier */
    var achter = D3 ? D3.achter : '';

    /* het gezicht */
    var ogen = '', rest = '';
    var ey = (soort === 3 || soort === 4 || soort === 5 || soort === 7 || soort === 'au') ? -4 : soort === 9 ? -3 : -5;
    [-1, 1].forEach(function(k){ ogen += stuk(k * 15, ey, eenOog(k)); rest += stuk(k * 15, ey, wenkbrauw(k)); });
    if (soort === 3) rest += stuk(0, -4, lijn('M-4,0 h8', pupil, 3));
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
      '<radialGradient id="' + id + 's" cx=".42" cy=".36" r=".8"><stop offset=".52" stop-color="#0b1433" stop-opacity="0"/><stop offset="1" stop-color="#0b1433" stop-opacity=".22"/></radialGradient>' + (D3 ? D3.defs : '') + '</defs>';
    if (sp.a) s += achtergrond(sp.a);
    if (schaduw) s += '<ellipse cx="0" cy="52" rx="' + f(30 * (1 + st.hop / 60)) + '" ry="4.5" fill="currentColor" opacity="' + f(.13 * (1 + st.hop / 40)) + '"/>';
    var beweeg = (st.hop || st.roll || st.sq) ? ' transform="translate(0,' + f(st.hop) + ') rotate(' + f(st.roll) + ') translate(0,46) scale(' + f(1 - st.sq) + ',' + f(1 + st.sq) + ') translate(0,-46)"' : '';
    var adem = leeft ? '' : ' class="av-alles" style="animation-delay:-' + m.d1 + 's"';
    /* Met spullen voor het hoofd ademen het hoofd en de spullen in twee groepen. Een even grote, onzichtbare
       rechthoek in allebei geeft ze dezelfde maat, dus hetzelfde draaipunt: anders schuift een hoed tijdens het ademen. */
    var kader = D3 && D3.voor && adem ? '<rect x="-120" y="-130" width="240" height="190" fill="none"/>' : '';
    s += '<g' + adem + '><g' + beweeg + '>' + kader + achter + '<g transform="rotate(' + m.draai + ')">';
    /* alleen een heel donker gezicht krijgt een lichte rand, anders valt het weg op een donkere pagina */
    if (m.helder < 0.3) s += '<path d="' + m.d + '" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="' + f1(rim * 2) + '" stroke-linejoin="round"/>';
    s += '<path d="' + m.d + '" fill="' + kleur + '"/><path d="' + m.d + '" fill="url(#' + id + 's)"/><path d="' + m.d + '" fill="url(#' + id + 'g)"/></g>';
    /* een personage (g): baard, snor en plukken haar komen uit teken3d, als volume op het hoofd */
    var kenmerk = '', binnen = '';
    s += '<g clip-path="url(#' + id + 'k)">' + (leeft ? ogen : '<g class="av-ogen" style="animation-delay:-' + m.d2 + 's">' + ogen + '</g>') + rest + binnen + (D3 ? D3.schaduw : '') + '</g>' + (D3 ? D3.midden : '') + kenmerk + los + '</g></g>';
    /* uit de winkel: eerst de rand (hij ligt om het gezicht) */
    if (sp.r) s += rand(sp.r);
    /* dan wat voor het hoofd zit: de bril en de hoed, met dezelfde beweging als het hoofd */
    if (D3 && D3.voor) s += '<g' + adem + '><g' + beweeg + '>' + kader + D3.voor + '</g></g>';
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
      if (a.maat < 64 && t - a.laatst < (a.m.d3 ? 1 / 20 : 1 / 30)) continue;
      /* Opnieuw tekenen kost het meeste, ook al zet zetLevend alleen wat veranderd is.
         Dus alleen als het gezicht er zichtbaar anders uitziet. De standen
         worden daarvoor afgerond; een kwart graad of een paar procent van een
         oog zie je niet, en in rust scheelt het zo de helft van het werk. */
      var sig = a.stemming;
      var fijn = a.maat < 64 ? 2 : 4;
      for (var sk in a.st) if (typeof a.st[sk] === 'number') sig += ',' + Math.round(a.st[sk] * (sk === 'sq' ? 400 : sk === 'yaw' || sk === 'pitch' || sk === 'roll' || sk === 'hop' ? fijn : 40));
      if (sig === a.sig) continue;
      a.sig = sig; a.laatst = t;
      zetLevend(a, teken(a.m, a.st, a.id, true, a.schaduw, a.maat));
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
  /* _proef: alleen voor de controle op botsingen (geen deel van de gewone werking) */
  /* de spec met de hoed van een bijzondere dag erachter (koning, sint, kerst, nieuw, halloween, zomer, nacht) */
  function feestSpec(spec, dag){ spec = String(spec || ''); return FEESTHOED[dag] && !/\+h\d+$/.test(spec) ? spec + '+h' + FEESTHOED[dag] : spec; }
  return { svg:svg, inhoud:inhoud, vul:vul, leef:leef, ontleed:ontleed, maak:maak, feest:feestSpec, FEESTHOED:FEESTHOED, KEUZES:KEUZES, NAMEN:NAMEN, KLEUREN:KLEUREN, KLEUREN2:KLEUREN2,
    _proef:{ model:model, rust:rustStaat, teken:teken, opbouw:opbouw, hoofd:hoofd3, kijker:kijker, rot:rot3, HOEDEN:HOEDEN, BRILLEN:BRILLEN, FIGUREN:FIGUREN, scheid:scheidVlak, punten:puntenDeel, stelsel:HOOFDSTELSEL } };
})();
