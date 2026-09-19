/* Een avatar bij elke bijnaam: een blob in de vormtaal van het merkboek (de
   vorm die het logo aanneemt als je erover beweegt), in een merkkleur, met
   een gezichtje. Dezelfde bijnaam geeft altijd dezelfde blob, op elk
   apparaat, want alles komt uit een hash van de naam. Geen plaatjes nodig.

   Wie een eigen avatar heeft gekozen (profiel.js), geeft een spec mee:
   'v3k2o1m0e4' = vorm, kleur, ogen, mond, extra. Dan telt de naam niet meer.

   Gebruik:
     AVATAR.svg('Noor', 32)         een <svg> als tekst, 32 pixels
     AVATAR.svg('Noor', 32, spec)   met eigen keuzes
     AVATAR.inhoud('Noor', spec)    alleen de binnenkant, voor in een eigen svg (viewBox -50..50)
     AVATAR.ontleed(spec) / AVATAR.maak({v,k,o,m,e})
     AVATAR.KEUZES                  hoeveel er van elk zijn
     AVATAR.vul(root)               vult elementen met data-avatar="naam" */
window.AVATAR = (function(){
  'use strict';
  var KLEUREN = ['#F26749', '#EA9836', '#204ECF', '#83A5F2', '#2f7d52', '#6b3fa0', '#14224C', '#d95c3b', '#1f7a6d'];
  var DONKER = { '#204ECF':1, '#14224C':1, '#6b3fa0':1, '#2f7d52':1, '#1f7a6d':1, '#d95c3b':1, '#F26749':1 };
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
  /* de blob: acht punten rond een cirkel, elk iets naar binnen of buiten, met
     zachte bochten ertussen (Catmull-Rom naar Bezier) */
  var laatstePunten = [];   /* de bochtpunten van de laatst getekende blob, voor de hoed */
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
      /* de bocht zelf, in tien stapjes: zo weten we waar de rand van het hoofd echt loopt */
      for (var t = 0; t < 1; t += 0.1){ var u = 1 - t, a0 = u*u*u, a1 = 3*u*u*t, a2 = 3*u*t*t, a3 = t*t*t;
        pts.push([a0*p1[0] + a1*c1[0] + a2*c2[0] + a3*p2[0], a0*p1[1] + a1*c1[1] + a2*c2[1] + a3*p2[1]]); }
    }
    laatstePunten = pts;
    return d + ' Z';
  }
  /* waar de hoed moet zitten: de bovenkant van het (gedraaide) hoofd in het midden, en hoe breed het daar is.
     De hoeden zijn getekend op een hoofd met de top op -46 en een halve breedte van 33 op de hoedrand (y -32). */
  function hoedPlek(draai){
    var a = draai * Math.PI / 180, top = 0, breed = 0;
    laatstePunten.forEach(function(q){
      var x = q[0] * Math.cos(a) - q[1] * Math.sin(a), y = q[0] * Math.sin(a) + q[1] * Math.cos(a);
      if (Math.abs(x) < 8 && y < top) top = y;
    });
    laatstePunten.forEach(function(q){
      var x = q[0] * Math.cos(a) - q[1] * Math.sin(a), y = q[0] * Math.sin(a) + q[1] * Math.cos(a);
      if (y < top + 18 && Math.abs(x) > breed) breed = Math.abs(x);
    });
    var s = Math.max(0.85, Math.min(1.12, breed / 33));
    return 'translate(0,' + (top + 46 - 30).toFixed(1) + ') scale(' + s.toFixed(3) + ') translate(0,30)';
  }
  var KEUZES = { vormen:8, kleuren:KLEUREN.length, ogen:5, monden:4, extras:6 };
  /* achter het gezichtje kan cosmetica staan: h (hoed), r (rand), z (zwaard), uit de winkel */
  function ontleed(spec){ var m = /^v(\d)k(\d)o(\d)m(\d)e(\d)(?:h(\d{1,2}))?(?:r(\d{1,2}))?(?:z(\d{1,2}))?(?:b(\d{1,2}))?$/.exec(String(spec || '')); return m ? { v:+m[1], k:+m[2], o:+m[3], m:+m[4], e:+m[5], h:+(m[6] || 0), r:+(m[7] || 0), z:+(m[8] || 0), b:+(m[9] || 0) } : null; }
  function maak(o){ return 'v' + (o.v % KEUZES.vormen) + 'k' + (o.k % KEUZES.kleuren) + 'o' + (o.o % KEUZES.ogen) + 'm' + (o.m % KEUZES.monden) + 'e' + (o.e % KEUZES.extras) + (o.h ? 'h' + o.h : '') + (o.r ? 'r' + o.r : '') + (o.z ? 'z' + o.z : '') + (o.b ? 'b' + o.b : ''); }
  /* de hoeden en randen uit de winkel, in de maten van het gezichtje (viewBox -50..50) */
  function hoed(n, kleur){
    if (n === 1) return '<path d="M-24,-30 L-28,-48 L-14,-38 L0,-52 L14,-38 L28,-48 L24,-30 Z" fill="#FFD166" stroke="#c9971f" stroke-width="2" stroke-linejoin="round"/><circle cx="0" cy="-42" r="3" fill="#F26749"/><circle cx="-16" cy="-38" r="2.2" fill="#204ECF"/><circle cx="16" cy="-38" r="2.2" fill="#204ECF"/>';
    if (n === 2) return '<path d="M-30,-30 L0,-50 L30,-30 Z" fill="#6b3fa0"/><path d="M-34,-29 h68" stroke="#6b3fa0" stroke-width="6" stroke-linecap="round"/><path d="M-4,-40 l1.5,3 3.5,.5 -2.5,2.5 .5,3.5 -3,-1.8 -3,1.8 .5,-3.5 -2.5,-2.5 3.5,-.5z" fill="#FFD166"/><circle cx="10" cy="-34" r="1.6" fill="#FFD166"/>';
    if (n === 3) return '<path d="M-37,-24 q37,-11 74,0" fill="none" stroke="#F3EFE9" stroke-width="10" stroke-linecap="round"/><path d="M-37,-24 q37,-11 74,0" fill="none" stroke="#F26749" stroke-width="2.6" stroke-linecap="round" transform="translate(0,-2.4)"/><path d="M-37,-24 q37,-11 74,0" fill="none" stroke="#204ECF" stroke-width="2.6" stroke-linecap="round" transform="translate(0,2.4)"/>';
    if (n === 4) return '<path d="M-36,-30 q36,-14 72,0 q-10,-28 -36,-28 q-26,0 -36,28 z" fill="#14224C"/><path d="M-36,-30 q36,8 72,0" fill="none" stroke="#14224C" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="-42" r="4.5" fill="#fff"/><circle cx="-1.6" cy="-43" r="1.1" fill="#14224C"/><circle cx="1.6" cy="-43" r="1.1" fill="#14224C"/>';
    if (n === 5) return '<path d="M-22,-30 q-4,-14 4,-22 q2,12 8,16 z M22,-30 q4,-14 -4,-22 q-2,12 -8,16 z" fill="#c0442c" stroke="#8a2416" stroke-width="1.5" stroke-linejoin="round"/>';
    if (n === 6) return '<ellipse cx="0" cy="-53" rx="20" ry="5" fill="none" stroke="#FFD166" stroke-width="4"/><ellipse cx="0" cy="-53" rx="20" ry="5" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/>';
    if (n === 7) return '<g><circle cx="-22" cy="-30" r="5" fill="#F26749"/><circle cx="-11" cy="-36" r="5" fill="#FFD166"/><circle cx="0" cy="-38" r="5" fill="#F26749"/><circle cx="11" cy="-36" r="5" fill="#FFD166"/><circle cx="22" cy="-30" r="5" fill="#F26749"/><g fill="#fff"><circle cx="-22" cy="-30" r="1.6"/><circle cx="-11" cy="-36" r="1.6"/><circle cx="0" cy="-38" r="1.6"/><circle cx="11" cy="-36" r="1.6"/><circle cx="22" cy="-30" r="1.6"/></g><path d="M-26,-28 q26,-8 52,0" fill="none" stroke="#2f7d52" stroke-width="3"/></g>';
    if (n === 8) return '<path d="M-16,-28 L0,-52 L16,-28 Z" fill="#204ECF"/><path d="M-11,-36 h22 M-6,-44 h12" stroke="#FFD166" stroke-width="3"/><circle cx="0" cy="-52" r="4" fill="#F26749"/>';
    return '';
  }
  /* de trofeeën van de bazen uit Zwaardvechter, rechtsonder bij het gezicht */
  function trofee(n){
    var g = '<g transform="translate(30,26)">';
    if (n === 1) g += '<path d="M0,-13 l3.5,7.5 8,1 -6,5.5 1.5,8 -7,-4 -7,4 1.5,-8 -6,-5.5 8,-1z" fill="#4a1230" stroke="#FFD166" stroke-width="1.5" stroke-linejoin="round"/><circle r="2.5" fill="#FFD166"/>';
    else if (n === 2) g += '<path d="M-11,-4 q4,-11 12,-8 q9,-2 10,7 q5,8 -4,11 q-8,5 -13,-1 q-9,-1 -5,-9z" fill="#22315f"/><circle cx="12" cy="-9" r="2.2" fill="#22315f"/><circle cx="-12" cy="8" r="1.6" fill="#22315f"/><circle cx="-3" cy="-2" r="2" fill="#fff" opacity=".6"/>';
    else if (n === 3) g += '<g transform="rotate(-40)"><rect x="-3" y="-13" width="6" height="20" rx="1.5" fill="#c0442c"/><path d="M-3,7 L0,13 L3,7 Z" fill="#F3EFE9" stroke="#c0442c" stroke-width="1"/><rect x="-3" y="-13" width="6" height="4" fill="#8a2416"/></g>';
    else if (n === 4) g += '<path d="M-10,-3 l4,-8 8,-1 7,5 1,8 -5,7 -9,1 -6,-5z" fill="#F3EFE9" stroke="#8f9db0" stroke-width="1.5" stroke-linejoin="round"/><path d="M-5,-4 l4,5 -3,5 M3,-7 l3,6 -2,6" fill="none" stroke="#8f9db0" stroke-width="1"/>';
    else if (n === 5) g += '<circle r="11" fill="#5b6480" stroke="#14224C" stroke-width="1.5"/><circle r="9" fill="none" stroke="#fff" stroke-width=".8" opacity=".6"/><path d="M0,0 L0,-6 M0,0 L4,2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle r="1.2" fill="#F26749"/>';
    else if (n === 6) g += '<circle r="6" fill="#3b4759"/>' + [0, 60, 120, 180, 240, 300].map(function(a){ return '<circle transform="rotate(' + a + ') translate(0,-11)" r="3" fill="#3b4759"/>'; }).join('') + '<circle cx="-2" cy="-1.5" r="1" fill="#fff"/><circle cx="2" cy="-1.5" r="1" fill="#fff"/>';
    return g + '</g>';
  }
  function rand(n){
    if (n === 1) return '<circle r="46" fill="none" stroke="#FFD166" stroke-width="5"/><circle r="46" fill="none" stroke="#c9971f" stroke-width="1.5"/>';
    if (n === 2) return '<circle r="46" fill="none" stroke="#F26749" stroke-width="5" stroke-dasharray="9 5"/><circle r="46" fill="none" stroke="#EA9836" stroke-width="5" stroke-dasharray="5 9" stroke-dashoffset="9"/>';
    if (n === 3) return '<circle r="47" fill="none" stroke="#F26749" stroke-width="2.2"/><circle r="44.5" fill="none" stroke="#EA9836" stroke-width="2.2"/><circle r="42" fill="none" stroke="#FFD166" stroke-width="2.2"/><circle r="39.5" fill="none" stroke="#2f9e8f" stroke-width="2.2"/><circle r="37" fill="none" stroke="#204ECF" stroke-width="2.2"/>';
    if (n === 4) return '<circle r="46" fill="none" stroke="#83A5F2" stroke-width="5"/><circle r="46" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 11"/>';
    if (n === 5) return '<circle r="46" fill="none" stroke="#204ECF" stroke-width="3" opacity=".6"/>' + [0, 60, 120, 180, 240, 300].map(function(a){ return '<path transform="rotate(' + a + ') translate(0,-46)" d="M0,-5 l1.5,3.5 3.5,.5 -2.5,2.5 .5,3.5 -3,-1.8 -3,1.8 .5,-3.5 -2.5,-2.5 3.5,-.5z" fill="#FFD166"/>'; }).join('');
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
  /* opties.stemming: '' (gewoon), 'au' (net geraakt), 'blij' (goed gedaan) of 'sip' (jammer); de spellen kiezen die per moment.
     opties.klasse: extra klasse op de svg, zoals 'av-juich' voor een sprongetje. */
  function svg(naam, maat, spec, opties){
    maat = maat || 32;
    var sp = ontleed(spec), stemming = opties && opties.stemming || '';
    /* elk gezichtje ademt en knippert op zijn eigen moment, anders doet een hele klas het tegelijk */
    var zaadje = hash((spec || '') + '|' + (naam || '')), d1 = (zaadje % 340) / 100, d2 = ((zaadje >>> 8) % 460) / 100;
    /* met een spec hangt niets meer van de naam af: dezelfde keuzes geven overal dezelfde blob */
    var r = toeval(sp ? 7919 * (sp.v + 1) + 17 : hash(naam));
    var kleur = KLEUREN[Math.floor(r() * KLEUREN.length)];
    if (sp) kleur = KLEUREN[sp.k % KLEUREN.length];
    var donker = !!DONKER[kleur], oog = donker ? '#fff' : '#14224C', pupil = '#14224C', mond = donker ? '#14224C' : '#14224C';
    var draai = (r() * 16 - 8).toFixed(1);
    var s = '<svg class="avatar' + (opties && opties.klasse ? ' ' + opties.klasse : '') + '" viewBox="-50 -50 100 100" overflow="visible" width="' + maat + '" height="' + maat + '" aria-hidden="true" focusable="false">';
    s += '<g class="av-alles" style="animation-delay:-' + d1 + 's">';
    s += '<g transform="rotate(' + draai + ')"><path d="' + blob(r, 46) + '" fill="' + kleur + '"/>';
    /* een lichtere gloed bovenin, zoals het glimmetje op de ridder */
    s += '<path d="M-40,-6 a40,40 0 0 1 80,0 z" fill="#fff" opacity=".14"/></g>';
    /* de ogen: vijf soorten */
    var soort = Math.floor(r() * 5), kijk = (r() - 0.5) * 5, afstand = 15;
    if (sp) soort = sp.o % 5;
    if (stemming === 'blij') soort = 1;
    if (stemming === 'au') soort = 9;
    s += '<g class="av-ogen" style="animation-delay:-' + d2 + 's">';
    if (soort === 9){                 /* au: dichtgeknepen */
      s += '<path d="M-23,-11 L-12,-4 L-23,3 M23,-11 L12,-4 L23,3" fill="none" stroke="' + oog + '" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>';
    } else if (soort === 1){          /* blij: boogjes */
      s += '<path d="M-22,-4 q7,-9 14,0 M8,-4 q7,-9 14,0" fill="none" stroke="' + oog + '" stroke-width="4.5" stroke-linecap="round"/>';
    } else if (soort === 2){          /* knipoog */
      s += '<circle cx="-' + afstand + '" cy="-5" r="8" fill="' + oog + '"/><circle cx="' + (-afstand + kijk).toFixed(1) + '" cy="-4" r="4" fill="' + pupil + '"/>';
      s += '<path d="M8,-5 q7,-7 14,0" fill="none" stroke="' + oog + '" stroke-width="4.5" stroke-linecap="round"/>';
    } else if (soort === 3){          /* bril */
      s += '<circle cx="-' + afstand + '" cy="-4" r="11" fill="' + oog + '" opacity=".95"/><circle cx="' + afstand + '" cy="-4" r="11" fill="' + oog + '" opacity=".95"/>';
      s += '<circle cx="-' + afstand + '" cy="-4" r="11" fill="none" stroke="' + pupil + '" stroke-width="3"/><circle cx="' + afstand + '" cy="-4" r="11" fill="none" stroke="' + pupil + '" stroke-width="3"/><path d="M-4,-4 h8" stroke="' + pupil + '" stroke-width="3"/>';
      s += '<circle cx="' + (-afstand + kijk).toFixed(1) + '" cy="-3" r="4" fill="' + pupil + '"/><circle cx="' + (afstand + kijk).toFixed(1) + '" cy="-3" r="4" fill="' + pupil + '"/>';
    } else if (soort === 4){          /* grote ogen */
      s += '<circle cx="-' + afstand + '" cy="-4" r="10" fill="' + oog + '"/><circle cx="' + afstand + '" cy="-4" r="10" fill="' + oog + '"/>';
      s += '<circle cx="' + (-afstand + kijk).toFixed(1) + '" cy="-3" r="5" fill="' + pupil + '"/><circle cx="' + (afstand + kijk).toFixed(1) + '" cy="-3" r="5" fill="' + pupil + '"/>';
      s += '<circle cx="' + (-afstand + kijk + 2).toFixed(1) + '" cy="-5" r="1.6" fill="#fff"/><circle cx="' + (afstand + kijk + 2).toFixed(1) + '" cy="-5" r="1.6" fill="#fff"/>';
    } else {                          /* gewone stipjes, zoals de ridder */
      s += '<circle cx="-' + afstand + '" cy="-5" r="8" fill="' + oog + '"/><circle cx="' + afstand + '" cy="-5" r="8" fill="' + oog + '"/>';
      s += '<circle cx="' + (-afstand + kijk).toFixed(1) + '" cy="-4" r="4" fill="' + pupil + '"/><circle cx="' + (afstand + kijk).toFixed(1) + '" cy="-4" r="4" fill="' + pupil + '"/>';
    }
    s += '</g>';
    /* de mond: lach, klein rondje, of een streepje */
    var m = Math.floor(r() * 4);
    if (sp) m = sp.m % 4;
    if (stemming === 'blij') m = 3;
    if (stemming === 'au') m = 1;
    if (stemming === 'sip') m = 4;
    if (m === 0) s += '<path d="M-10,12 q10,10 20,0" fill="none" stroke="' + mond + '" stroke-width="4" stroke-linecap="round"/>';
    else if (m === 1) s += '<circle cx="0" cy="14" r="4.5" fill="' + mond + '"/>';
    else if (m === 2) s += '<path d="M-7,13 h14" fill="none" stroke="' + mond + '" stroke-width="4" stroke-linecap="round"/>';
    else if (m === 4) s += '<path d="M-10,17 q10,-9 20,0" fill="none" stroke="' + mond + '" stroke-width="4" stroke-linecap="round"/>';
    else s += '<path d="M-12,10 q12,14 24,0 q-12,4 -24,0 z" fill="' + mond + '"/><path d="M-5,14 q5,6 10,0 z" fill="#F26749" opacity=".9"/>';
    /* iets extra's: blosjes, sproetjes, een krul, een petje of een sticker */
    var e = Math.floor(r() * 6);
    if (sp) e = sp.e % 6;
    if (e === 0) s += '<circle cx="-26" cy="8" r="5" fill="#F26749" opacity=".45"/><circle cx="26" cy="8" r="5" fill="#F26749" opacity=".45"/>';
    else if (e === 1) s += '<g fill="' + oog + '" opacity=".7"><circle cx="-27" cy="6" r="1.6"/><circle cx="-22" cy="10" r="1.6"/><circle cx="-30" cy="12" r="1.6"/><circle cx="27" cy="6" r="1.6"/><circle cx="22" cy="10" r="1.6"/><circle cx="30" cy="12" r="1.6"/></g>';
    if (sp && sp.h && (e === 2 || e === 3)) e = -1;   /* een krul of petje past niet onder een hoed */
    else if (e === 2) s += '<path d="M2,-44 q4,-12 14,-6 q-8,-2 -10,6" fill="none" stroke="' + kleur + '" stroke-width="5" stroke-linecap="round"/>';
    else if (e === 3) s += '<path d="M-26,-30 q26,-36 52,0 z" fill="#14224C"/><path d="M-31,-29 h62" stroke="#14224C" stroke-width="7" stroke-linecap="round"/>';
    else if (e === 4) s += '<path d="M30,-30 l3,7 7,1 -5,5 1,7 -6,-4 -6,4 1,-7 -5,-5 7,-1z" fill="#FFD166"/>';
    /* uit de winkel: eerst de rand (achter niets, want hij ligt om het gezicht), dan de hoed erop */
    s += '</g>';
    if (sp && sp.r) s += rand(sp.r);
    /* de hoed ademt mee (zelfde maat en zelfde moment) en wiebelt als je eroverheen gaat */
    if (sp && sp.h) s += '<g class="av-alles" style="animation-delay:-' + d1 + 's"><g class="av-hoed" transform="' + hoedPlek(+draai) + '">' + hoed(sp.h, kleur) + '</g></g>';
    if (sp && sp.b) s += trofee(sp.b);
    return s + '</svg>';
  }
  function vul(root){
    Array.prototype.forEach.call((root || document).querySelectorAll('[data-avatar]'), function(el){
      el.innerHTML = svg(el.getAttribute('data-avatar'), +el.getAttribute('data-maat') || 32, el.getAttribute('data-spec') || '');
    });
  }
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
      '.avatar:hover .av-hoed,.av-wiebel .av-hoed{animation:avHoed .8s ease}' +
      /* juichen: twee sprongetjes, de hoed wiebelt mee */
      '@keyframes avJuich{0%,100%{transform:translateY(0) rotate(0)}18%{transform:translateY(-.28em) rotate(-7deg)}36%{transform:translateY(0) rotate(0)}54%{transform:translateY(-.2em) rotate(6deg)}72%{transform:translateY(0) rotate(0)}}' +
      '.av-juich{animation:avJuich 1.3s ease-out 2;transform-origin:50% 100%}.av-juich .av-hoed{animation:avHoed .8s ease .1s 2}' +
      '@media(prefers-reduced-motion:reduce){.av-alles,.av-ogen,.av-hoed,.av-juich{animation:none !important}}';
    document.head.appendChild(st);
  } catch (e){}
  return { svg:svg, inhoud:inhoud, vul:vul, ontleed:ontleed, maak:maak, KEUZES:KEUZES };
})();
