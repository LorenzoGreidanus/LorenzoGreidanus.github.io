/* Een avatar bij elke bijnaam: een blob in de vormtaal van het merkboek (de
   vorm die het logo aanneemt als je erover beweegt), in een merkkleur, met
   een gezichtje. Dezelfde bijnaam geeft altijd dezelfde blob, op elk
   apparaat, want alles komt uit een hash van de naam. Geen plaatjes nodig.

   Wie een eigen avatar heeft gekozen (profiel.js), geeft een spec mee:
   'v3k2o1m0e4' = vorm, kleur, ogen, mond, extra. Dan telt de naam niet meer.
   Daarachter mag (in deze volgorde) c (een kleur uit de tweede rij), en dan
   de dingen uit de winkel: h r z b a q (zie cosmetica.js). x en w (haar) mogen
   er nog in staan van een eerdere versie, maar tekenen niets: het blobje is
   een blobje, geen mensje.

   Gebruik:
     AVATAR.svg('Noor', 32)         een <svg> als tekst, 32 pixels
     AVATAR.svg('Noor', 32, spec)   met eigen keuzes
     AVATAR.inhoud('Noor', spec)    alleen de binnenkant, voor in een eigen svg (viewBox -50..50)
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
  var KEUZES = { vormen:8, kleuren:KLEUREN.length, kleuren2:KLEUREN2.length, ogen:10, monden:10, extras:10 };
  var NAMEN = {
    o:['stipjes', 'blij', 'knipoog', 'bril', 'grote ogen', 'cool', 'verbaasd', 'sterren', 'tevreden', 'vastberaden'],
    m:['lach', 'rondje', 'streepje', 'schaterlach', 'tong uit', 'tanden', 'scheve grijns', 'o', 'kattensnoetje', 'beugel'],
    e:['blosjes', 'sproetjes', 'krul', 'pleister', 'ster', 'niets', 'zweetdruppel', 'snor', 'glinsters', 'moedervlekje'],
    k:['koraal', 'oranje', 'blauw', 'lichtblauw', 'groen', 'paars', 'nachtblauw', 'steenrood', 'zeegroen'],
    c:['licht perzik', 'perzik', 'karamel', 'bruin', 'donkerbruin', 'roze', 'zonnegeel', 'mint', 'lila', 'framboos', 'grijs']
  };
  var PATROON = /^v(\d)k(\d)o(\d)m(\d)e(\d)(?:c(\d{1,2}))?(?:x(\d{1,2}))?(?:w(\d))?(?:h(\d{1,2}))?(?:r(\d{1,2}))?(?:z(\d{1,2}))?(?:b(\d{1,2}))?(?:a(\d{1,2}))?(?:q(\d{1,2}))?$/;
  /* achter het gezichtje kan cosmetica staan: h (hoed), r (rand), z (zwaard), uit de winkel */
  function ontleed(spec){
    spec = String(spec || '');
    var m = PATROON.exec(spec);
    /* Een spec die ergens onderweg is afgekapt (een oude server die er 24 tekens van bewaarde):
       haal er van achteren af tot hij weer klopt, dan blijft het gezicht en valt hooguit een bril weg. */
    for (var i = 0; !m && i < 16 && spec.length > 10 && /^v\dk\do\dm\de\d/.test(spec); i++){ spec = spec.replace(/[a-z]\d*$/, ''); m = PATROON.exec(spec); }
    return m ? { v:+m[1], k:+m[2], o:+m[3], m:+m[4], e:+m[5], c:+(m[6] || 0), x:+(m[7] || 0), w:+(m[8] || 0), h:+(m[9] || 0), r:+(m[10] || 0), z:+(m[11] || 0), b:+(m[12] || 0), a:+(m[13] || 0), q:+(m[14] || 0) } : null; }
  function maak(o){
    /* x en w (haar) bestaan nog in het patroon, voor codes van even, maar worden niet meer gemaakt of getekend */
    var c = (o.c | 0) % (KLEUREN2.length + 1);
    return 'v' + (o.v % KEUZES.vormen) + 'k' + (o.k % KEUZES.kleuren) + 'o' + (o.o % KEUZES.ogen) + 'm' + (o.m % KEUZES.monden) + 'e' + (o.e % KEUZES.extras) +
      (c ? 'c' + c : '') +
      (o.h ? 'h' + o.h : '') + (o.r ? 'r' + o.r : '') + (o.z ? 'z' + o.z : '') + (o.b ? 'b' + o.b : '') + (o.a ? 'a' + o.a : '') + (o.q ? 'q' + o.q : '');
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
    /* kerstmuts: rood met een witte rand en een pompon die naar rechts hangt */
    if (n === 9) return '<path d="M-28,-30 q6,-30 26,-30 q10,0 20,10 q-14,0 -18,20 z" fill="#c0442c"/><path d="M-31,-30 h56" stroke="#F3EFE9" stroke-width="8" stroke-linecap="round"/><path d="M-31,-30 h56" stroke="#d9cfc4" stroke-width="8" stroke-linecap="round" stroke-dasharray="0 7" opacity=".7"/><circle cx="22" cy="-50" r="6" fill="#F3EFE9" stroke="#d9cfc4" stroke-width="1.2"/>';
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
  var cache = {};
  /* de binnenkant (viewBox -50..50), voor wie hem in een eigen svg tekent, zoals de arena van Zwaardvechter */
  function inhoud(naam, spec, stemming){
    var sleutel = (spec || '') + '|' + String(naam || '').toLowerCase().trim() + '|' + (stemming || '');
    if (cache[sleutel]) return cache[sleutel];
    var s = svg(naam, 100, spec, { stemming:stemming }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    if (Object.keys(cache).length > 200) cache = {};
    cache[sleutel] = s;
    return s;
  }
  function ster(cx, cy, r, kleur, lijn){
    var d = '';
    for (var i = 0; i < 10; i++){ var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + f1(cx + Math.cos(a) * rr) + ',' + f1(cy + Math.sin(a) * rr); }
    return '<path d="' + d + 'Z" fill="' + kleur + '"' + (lijn ? ' stroke="' + lijn + '" stroke-width="1.6" stroke-linejoin="round"' : '') + '/>';
  }
  /* opties.stemming: '' (gewoon), 'au' (net geraakt), 'blij' (goed gedaan), 'sip' (jammer) of 'oeps' (betrapt: grote ogen, o-mondje); de spellen kiezen die per moment.
     opties.klasse: extra klasse op de svg, zoals 'av-juich' voor een sprongetje. */
  function svg(naam, maat, spec, opties){
    maat = maat || 32;
    var sp = ontleed(spec), stemming = opties && opties.stemming || '';
    /* elk gezichtje ademt en knippert op zijn eigen moment, anders doet een hele klas het tegelijk */
    var zaadje = hash((spec || '') + '|' + (naam || '')), d1 = (zaadje % 340) / 100, d2 = ((zaadje >>> 8) % 460) / 100;
    /* met een spec hangt niets meer van de naam af: dezelfde keuzes geven overal dezelfde blob.
       Let op: de volgorde van de trekkingen hieronder is heilig, anders krijgt iedereen zonder
       eigen keuze ineens een ander gezichtje. Nieuwe dingen trekken niets uit r(). */
    var r = toeval(sp ? 7919 * (sp.v + 1) + 17 : hash(naam));
    var kleur = KLEUREN[Math.floor(r() * KLEUREN.length)];
    if (sp) kleur = sp.c ? KLEUREN2[(sp.c - 1) % KLEUREN2.length] : KLEUREN[sp.k % KLEUREN.length];
    var helder = licht(kleur);
    var donker = sp && sp.c ? helder < 0.5 : !!DONKER[kleur], oog = donker ? '#fff' : INKT, pupil = INKT;
    /* de mond is donker, behalve op een heel donker gezicht: daar zag je hem niet */
    var mond = helder < 0.22 ? '#F3EFE9' : INKT;
    var draai = (r() * 16 - 8).toFixed(1);
    var vorm = blob(r, 46);
    var P = draaiPunten(vorm.pts, +draai), M = maten(P);
    var soort = Math.floor(r() * 5), kijk = (r() - 0.5) * 5, afstand = 15;
    var m = Math.floor(r() * 4);
    var e = Math.floor(r() * 6);
    /* hoe dik de lichte rand om het hoofd is: klein getekend iets dikker, anders zie je hem niet */
    var rim = Math.max(1.6, Math.min(6, 120 / maat));

    var s = '<svg class="avatar' + (opties && opties.klasse ? ' ' + opties.klasse : '') + '" viewBox="-50 -50 100 100" overflow="visible" width="' + maat + '" height="' + maat + '" aria-hidden="true" focusable="false">';
    if (sp && sp.a) s += achtergrond(sp.a);
    s += '<g class="av-alles" style="animation-delay:-' + d1 + 's">';
    /* Het hoofd zoals het altijd was: een platte kleur met een lichtere gloed bovenin, afgeknipt op de
       vorm. Het knipsel krijgt per tekening een eigen id, dan botsen er geen twee op een pagina vol namen.
       Alleen een heel donker gezicht krijgt een lichte rand, anders valt het weg op een donkere pagina. */
    var knip = 'avk' + (++teller).toString(36) + (zaadje % 1296).toString(36);
    s += '<g transform="rotate(' + draai + ')">';
    if (helder < 0.3) s += '<path d="' + vorm.d + '" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="' + f1(rim * 2) + '" stroke-linejoin="round"/>';
    s += '<path d="' + vorm.d + '" fill="' + kleur + '"/>';
    s += '<clipPath id="' + knip + '"><path d="' + vorm.d + '"/></clipPath><path d="M-40,-6 a40,40 0 0 1 80,0 z" fill="#fff" opacity=".14" clip-path="url(#' + knip + ')"/></g>';
    /* de ogen: tien soorten */
    if (sp) soort = sp.o % 10;
    /* een bril uit de winkel over de getekende bril heen is er een te veel: dan gewone ogen */
    if (sp && sp.q && soort === 3) soort = 0;
    if (stemming === 'blij') soort = 1;
    if (stemming === 'au') soort = 'au';
    if (stemming === 'oeps') soort = 'oeps';
    var lijn = '" fill="none" stroke="' + oog + '" stroke-width="4.5" stroke-linecap="round"/>';
    s += '<g class="av-ogen" style="animation-delay:-' + d2 + 's">';
    if (soort === 'oeps' || soort === 6){  /* oeps en verbaasd: wijd open, kleine pupillen */
      s += '<circle cx="-' + afstand + '" cy="-5" r="11" fill="' + oog + '"/><circle cx="' + afstand + '" cy="-5" r="11" fill="' + oog + '"/>';
      s += '<circle cx="-' + afstand + '" cy="-4" r="4.2" class="av-pupil" fill="' + pupil + '"/><circle cx="' + afstand + '" cy="-4" r="4.2" class="av-pupil" fill="' + pupil + '"/>';
      s += '<circle cx="-' + (afstand - 1.6) + '" cy="-5.6" r="1.3" class="av-pupil" fill="#fff"/><circle cx="' + (afstand + 1.6) + '" cy="-5.6" r="1.3" class="av-pupil" fill="#fff"/>';
    } else if (soort === 'au'){        /* au: dichtgeknepen */
      s += '<path d="M-23,-11 L-12,-4 L-23,3 M23,-11 L12,-4 L23,3" fill="none" stroke="' + oog + '" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>';
    } else if (soort === 1){          /* blij: boogjes */
      s += '<path d="M-22,-4 q7,-9 14,0 M8,-4 q7,-9 14,0' + lijn;
    } else if (soort === 2){          /* knipoog */
      s += '<circle cx="-' + afstand + '" cy="-5" r="8" fill="' + oog + '"/><circle cx="' + (-afstand + kijk).toFixed(1) + '" cy="-4" r="4" class="av-pupil" fill="' + pupil + '"/>';
      s += '<path d="M8,-5 q7,-7 14,0' + lijn;
    } else if (soort === 3){          /* bril */
      s += '<circle cx="-' + afstand + '" cy="-4" r="11" fill="' + oog + '" opacity=".95"/><circle cx="' + afstand + '" cy="-4" r="11" fill="' + oog + '" opacity=".95"/>';
      s += '<circle cx="-' + afstand + '" cy="-4" r="11" fill="none" stroke="' + pupil + '" stroke-width="3"/><circle cx="' + afstand + '" cy="-4" r="11" fill="none" stroke="' + pupil + '" stroke-width="3"/><path d="M-4,-4 h8" stroke="' + pupil + '" stroke-width="3"/>';
      s += '<circle cx="' + (-afstand + kijk).toFixed(1) + '" cy="-3" r="4" class="av-pupil" fill="' + pupil + '"/><circle cx="' + (afstand + kijk).toFixed(1) + '" cy="-3" r="4" class="av-pupil" fill="' + pupil + '"/>';
    } else if (soort === 4){          /* grote ogen */
      s += '<circle cx="-' + afstand + '" cy="-4" r="10" fill="' + oog + '"/><circle cx="' + afstand + '" cy="-4" r="10" fill="' + oog + '"/>';
      s += '<circle cx="' + (-afstand + kijk).toFixed(1) + '" cy="-3" r="5" class="av-pupil" fill="' + pupil + '"/><circle cx="' + (afstand + kijk).toFixed(1) + '" cy="-3" r="5" class="av-pupil" fill="' + pupil + '"/>';
      s += '<circle cx="' + (-afstand + kijk + 2).toFixed(1) + '" cy="-5" r="1.6" class="av-pupil" fill="#fff"/><circle cx="' + (afstand + kijk + 2).toFixed(1) + '" cy="-5" r="1.6" class="av-pupil" fill="#fff"/>';
    } else if (soort === 5){          /* cool: halfdichte oogleden, alsof niets je verbaast */
      s += '<circle cx="-' + afstand + '" cy="-4" r="8" fill="' + oog + '"/><circle cx="' + afstand + '" cy="-4" r="8" fill="' + oog + '"/>';
      s += '<circle cx="' + (-afstand + kijk * 0.6).toFixed(1) + '" cy="-1.5" r="4" class="av-pupil" fill="' + pupil + '"/><circle cx="' + (afstand + kijk * 0.6).toFixed(1) + '" cy="-1.5" r="4" class="av-pupil" fill="' + pupil + '"/>';
      s += '<path d="M-24.5,-4 a9.5,9.5 0 0 1 19,0 z M5.5,-4 a9.5,9.5 0 0 1 19,0 z" fill="' + kleur + '"/><path d="M-24,-4 h18 M6,-4 h18" stroke="' + (donker ? '#fff' : INKT) + '" stroke-width="3.2" stroke-linecap="round"/>';
    } else if (soort === 7){          /* sterren in je ogen */
      s += ster(-afstand, -4, 11, '#FFD166', INKT) + ster(afstand, -4, 11, '#FFD166', INKT);
    } else if (soort === 8){          /* tevreden: dicht, een boogje naar beneden */
      s += '<path d="M-22,-6 q7,7 14,0 M8,-6 q7,7 14,0' + lijn;
    } else if (soort === 9){          /* vastberaden: stipjes met schuine wenkbrauwen */
      s += '<circle cx="-' + afstand + '" cy="-3" r="7.5" fill="' + oog + '"/><circle cx="' + afstand + '" cy="-3" r="7.5" fill="' + oog + '"/>';
      s += '<circle cx="' + (-afstand + kijk * 0.6).toFixed(1) + '" cy="-2" r="4" class="av-pupil" fill="' + pupil + '"/><circle cx="' + (afstand + kijk * 0.6).toFixed(1) + '" cy="-2" r="4" class="av-pupil" fill="' + pupil + '"/>';
      s += '<path d="M-25,-17 l14,5 M25,-17 l-14,5" fill="none" stroke="' + (donker ? '#fff' : INKT) + '" stroke-width="4" stroke-linecap="round"/>';
    } else {                          /* gewone stipjes, zoals de ridder */
      s += '<circle cx="-' + afstand + '" cy="-5" r="8" fill="' + oog + '"/><circle cx="' + afstand + '" cy="-5" r="8" fill="' + oog + '"/>';
      s += '<circle cx="' + (-afstand + kijk).toFixed(1) + '" cy="-4" r="4" class="av-pupil" fill="' + pupil + '"/><circle cx="' + (afstand + kijk).toFixed(1) + '" cy="-4" r="4" class="av-pupil" fill="' + pupil + '"/>';
    }
    s += '</g>';
    /* oeps en verbaasd: de wenkbrauwen schieten omhoog, net niet recht */
    if (soort === 'oeps' || soort === 6) s += '<path d="M-26,-21 q10,-10 21,-4 M6,-25 q10,-5 20,3" fill="none" stroke="' + (donker ? '#fff' : INKT) + '" stroke-width="3.6" stroke-linecap="round"/>';
    if (sp && sp.q) s += bril(sp.q);
    /* de mond: tien soorten */
    if (sp) m = sp.m % 10;
    if (stemming === 'blij') m = 3;
    if (stemming === 'au') m = 1;
    if (stemming === 'sip') m = 'sip';
    if (stemming === 'oeps') m = 'oeps';
    var mlijn = '" fill="none" stroke="' + mond + '" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>';
    var tong = '#F26749', tanden = '#fff';
    if (m === 'oeps') s += '<ellipse cx="3" cy="17" rx="5" ry="6.5" fill="' + mond + '"/><circle cx="-27" cy="9" r="5.5" fill="#F26749" opacity=".5"/><circle cx="27" cy="9" r="5.5" fill="#F26749" opacity=".5"/>' +
      '<path d="M37,-27 q6,9 0,13 q-6,-4 0,-13 z" fill="#83A5F2" stroke="#14224C" stroke-width="1.2" stroke-opacity=".35"/>';
    else if (m === 0) s += '<path d="M-10,12 q10,10 20,0' + mlijn;
    else if (m === 1) s += '<circle cx="0" cy="14" r="4.5" fill="' + mond + '"/>';
    else if (m === 2) s += '<path d="M-7,13 h14' + mlijn;
    else if (m === 'sip') s += '<path d="M-10,17 q10,-9 20,0' + mlijn;
    else if (m === 4) s += '<path d="M-11,11 q11,10 22,0' + mlijn + '<path d="M1,15.5 h9 v4 a4.5,4.5 0 0 1 -9,0 z" fill="#F47A8A" stroke="' + mond + '" stroke-width="2" stroke-linejoin="round"/><path d="M5.5,16 v4" stroke="#c0442c" stroke-width="1.2" stroke-linecap="round"/>';
    else if (m === 5) s += '<path d="M-13,9 h26 q0,14 -13,14 q-13,0 -13,-14 z" fill="' + mond + '"/><path d="M-11,10.5 h22 q0,3 -1,4.5 h-20 q-1,-1.5 -1,-4.5 z" fill="' + tanden + '"/>';
    else if (m === 6) s += '<path d="M-10,15 q10,5 18,-5' + mlijn + '<path d="M8,10 l3,-1" stroke="' + mond + '" stroke-width="3" stroke-linecap="round"/>';
    else if (m === 7) s += '<ellipse cx="0" cy="15" rx="5.5" ry="7" fill="' + mond + '"/><ellipse cx="0" cy="18" rx="3" ry="2.4" fill="' + tong + '" opacity=".9"/>';
    else if (m === 8) s += '<path d="M-10,12 q5,6 10,0 q5,6 10,0' + mlijn;
    else if (m === 9) s += '<path d="M-13,9 h26 q0,14 -13,14 q-13,0 -13,-14 z" fill="' + mond + '"/><path d="M-11,10.5 h22 q0,3.5 -1,5 h-20 q-1,-1.5 -1,-5 z" fill="' + tanden + '"/><path d="M-10.5,13 h21" stroke="#8f9db0" stroke-width="1.4"/><g fill="#8f9db0"><rect x="-8" y="11.5" width="3" height="3" rx=".6"/><rect x="-1.5" y="11.5" width="3" height="3" rx=".6"/><rect x="5" y="11.5" width="3" height="3" rx=".6"/></g>';
    else s += '<path d="M-12,10 h24 q0,13 -12,13 q-12,0 -12,-13 z" fill="' + mond + '"/><path d="M-6,19.5 q6,-5 12,0 q-2,3.2 -6,3.2 q-4,0 -6,-3.2 z" fill="' + tong + '"/>';
    /* iets extra's: blosjes, sproetjes, een krul, een pleister, een sticker, en de nieuwe */
    if (sp) e = sp.e % 10;
    var blos = helder > 0.55 ? '#F26749' : '#FF8FA3';
    if (e === 0) s += '<circle cx="-26" cy="8" r="5" fill="' + blos + '" opacity=".5"/><circle cx="26" cy="8" r="5" fill="' + blos + '" opacity=".5"/>';
    else if (e === 1) s += '<g fill="' + oog + '" opacity=".7"><circle cx="-27" cy="6" r="1.6"/><circle cx="-22" cy="10" r="1.6"/><circle cx="-30" cy="12" r="1.6"/><circle cx="27" cy="6" r="1.6"/><circle cx="22" cy="10" r="1.6"/><circle cx="30" cy="12" r="1.6"/></g>';
    if (sp && sp.h && e === 2) e = -1;   /* een krul past niet onder een hoed */
    else if (e === 2) s += '<path d="M2,' + f1(M.top + 3) + ' q4,-12 14,-6 q-8,-2 -10,6" fill="none" stroke="' + meng(kleur, INKT, 0.25) + '" stroke-width="5" stroke-linecap="round"/>';
    /* Hier zat een gratis petje. Nu er echte hoeden in de winkel liggen, is dat er een te veel; de plek blijft
       bestaan (anders verandert het gezichtje van iedereen die deze extra koos) en er ligt nu een pleister. */
    else if (e === 3) s += '<g transform="rotate(-16)"><rect x="13" y="-21" width="23" height="10" rx="3" fill="#F6D9B0" stroke="#c99f6e" stroke-width="1.2"/><g fill="#c99f6e"><circle cx="19" cy="-18" r="1"/><circle cx="19" cy="-14" r="1"/><circle cx="30" cy="-18" r="1"/><circle cx="30" cy="-14" r="1"/></g></g>';
    else if (e === 4) s += '<path d="M30,-30 l3,7 7,1 -5,5 1,7 -6,-4 -6,4 1,-7 -5,-5 7,-1z" fill="#FFD166" stroke="#c9971f" stroke-width="1" stroke-linejoin="round"/>';
    else if (e === 6) s += '<path d="M30,-27 q9,12 0,19 q-9,-7 0,-19 z" fill="#9EC3FF" stroke="#14224C" stroke-width="1.4" stroke-opacity=".5"/><path d="M27.5,-14 q-1,-3 .5,-5.5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>';
    else if (e === 7){ var snor = '#3a2519';
      s += '<path d="M0,7 q-5,-4 -11,-1.5 q-4,1.5 -7,-1 q3,7 11,5 q4,-1 7,-3 q3,2 7,3 q8,2 11,-5 q-3,2.5 -7,1 q-6,-2.5 -11,1.5 z" fill="' + snor + '" stroke="' + (helder < 0.3 ? 'rgba(255,255,255,.5)' : 'none') + '" stroke-width="1"/>'; }
    else if (e === 8) s += '<g fill="#FFD166" stroke="#c9971f" stroke-width=".8" stroke-linejoin="round"><path d="M-34,-30 q1.5,5 6,6 q-4.5,1 -6,6 q-1.5,-5 -6,-6 q4.5,-1 6,-6z"/><path d="M36,14 q1,3.5 4,4 q-3,1 -4,4 q-1,-3 -4,-4 q3,-.5 4,-4z"/><path d="M-38,14 q.8,2.6 3,3 q-2.2,.6 -3,3 q-.8,-2.4 -3,-3 q2.2,-.4 3,-3z"/></g>';
    else if (e === 9) s += '<circle cx="20" cy="11" r="2.5" fill="' + (helder < 0.3 ? '#F3EFE9' : INKT) + '" opacity=".85"/>';
    s += '</g>';
    /* uit de winkel: eerst de rand (achter niets, want hij ligt om het gezicht), dan de hoed erop */
    if (sp && sp.r) s += rand(sp.r);
    /* de hoed ademt mee (zelfde maat en zelfde moment) en wiebelt als je eroverheen gaat */
    if (sp && sp.h){ var hd = hoed(sp.h);
      if (hd) s += '<g class="av-alles" style="animation-delay:-' + d1 + 's"><g class="av-hoed" transform="' + hoedPlek(M, 0, 1) + '">' + halo(hd, rim * 2) + hd + '</g></g>'; }
    if (sp && sp.b) s += trofee(sp.b);
    return s + '</svg>';
  }
  function vul(root){
    Array.prototype.forEach.call((root || document).querySelectorAll('[data-avatar]'), function(el){
      el.innerHTML = svg(el.getAttribute('data-avatar'), +el.getAttribute('data-maat') || 32, el.getAttribute('data-spec') || '');
    });
  }
  /* de ogen volgen de muis: per gezichtje op de pagina schuiven de pupillen een stukje richting de muis.
     Niet in de arena van Zwaardvechter (daar staan ze in een use) en niet als iemand liever geen beweging heeft. */
  (function(){
    if (typeof document === 'undefined' || typeof matchMedia !== 'function') return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(hover: none)').matches) return;
    var mx = -1, my = -1, bezig = false;
    function kijk(){
      bezig = false;
      var vh = innerHeight, vw = innerWidth;
      Array.prototype.forEach.call(document.querySelectorAll('svg.avatar'), function(el){
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
  return { svg:svg, inhoud:inhoud, vul:vul, ontleed:ontleed, maak:maak, KEUZES:KEUZES, NAMEN:NAMEN, KLEUREN:KLEUREN, KLEUREN2:KLEUREN2 };
})();
