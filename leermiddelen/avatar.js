/* Een avatar bij elke bijnaam: een blob in de vormtaal van het merkboek (de
   vorm die het logo aanneemt als je erover beweegt), in een merkkleur, met
   een gezichtje. Dezelfde bijnaam geeft altijd dezelfde blob, op elk
   apparaat, want alles komt uit een hash van de naam. Geen plaatjes nodig.

   Gebruik:
     AVATAR.svg('Noor', 32)     een <svg> als tekst, 32 pixels
     AVATAR.vul(root)           vult elementen met data-avatar="naam" */
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
  function blob(r, straal){
    var n = 8, p = [];
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
    }
    return d + ' Z';
  }
  function svg(naam, maat){
    maat = maat || 32;
    var r = toeval(hash(naam)), kleur = KLEUREN[Math.floor(r() * KLEUREN.length)];
    var donker = !!DONKER[kleur], oog = donker ? '#fff' : '#14224C', pupil = '#14224C', mond = donker ? '#14224C' : '#14224C';
    var draai = (r() * 16 - 8).toFixed(1);
    var s = '<svg class="avatar" viewBox="-50 -50 100 100" width="' + maat + '" height="' + maat + '" aria-hidden="true" focusable="false">';
    s += '<g transform="rotate(' + draai + ')"><path d="' + blob(r, 46) + '" fill="' + kleur + '"/>';
    /* een lichtere gloed bovenin, zoals het glimmetje op de ridder */
    s += '<path d="M-40,-6 a40,40 0 0 1 80,0 z" fill="#fff" opacity=".14"/></g>';
    /* de ogen: vijf soorten */
    var soort = Math.floor(r() * 5), kijk = (r() - 0.5) * 5, afstand = 15;
    if (soort === 1){                 /* blij: boogjes */
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
    /* de mond: lach, klein rondje, of een streepje */
    var m = Math.floor(r() * 4);
    if (m === 0) s += '<path d="M-10,12 q10,10 20,0" fill="none" stroke="' + mond + '" stroke-width="4" stroke-linecap="round"/>';
    else if (m === 1) s += '<circle cx="0" cy="14" r="4.5" fill="' + mond + '"/>';
    else if (m === 2) s += '<path d="M-7,13 h14" fill="none" stroke="' + mond + '" stroke-width="4" stroke-linecap="round"/>';
    else s += '<path d="M-12,10 q12,14 24,0 q-12,4 -24,0 z" fill="' + mond + '"/><path d="M-5,14 q5,6 10,0 z" fill="#F26749" opacity=".9"/>';
    /* iets extra's: blosjes, sproetjes, een krul, een petje of een sticker */
    var e = Math.floor(r() * 6);
    if (e === 0) s += '<circle cx="-26" cy="8" r="5" fill="#F26749" opacity=".45"/><circle cx="26" cy="8" r="5" fill="#F26749" opacity=".45"/>';
    else if (e === 1) s += '<g fill="' + oog + '" opacity=".7"><circle cx="-27" cy="6" r="1.6"/><circle cx="-22" cy="10" r="1.6"/><circle cx="-30" cy="12" r="1.6"/><circle cx="27" cy="6" r="1.6"/><circle cx="22" cy="10" r="1.6"/><circle cx="30" cy="12" r="1.6"/></g>';
    else if (e === 2) s += '<path d="M2,-44 q4,-12 14,-6 q-8,-2 -10,6" fill="none" stroke="' + kleur + '" stroke-width="5" stroke-linecap="round"/>';
    else if (e === 3) s += '<path d="M-24,-34 q24,-24 48,0 z" fill="#14224C"/><path d="M-28,-33 h60" stroke="#14224C" stroke-width="6" stroke-linecap="round"/>';
    else if (e === 4) s += '<path d="M30,-30 l3,7 7,1 -5,5 1,7 -6,-4 -6,4 1,-7 -5,-5 7,-1z" fill="#FFD166"/>';
    return s + '</svg>';
  }
  function vul(root){
    Array.prototype.forEach.call((root || document).querySelectorAll('[data-avatar]'), function(el){
      el.innerHTML = svg(el.getAttribute('data-avatar'), +el.getAttribute('data-maat') || 32);
    });
  }
  /* de paar regels stijl die elke pagina nodig heeft */
  try {
    var st = document.createElement('style');
    st.textContent = '.avatar{display:inline-block;vertical-align:middle;flex:none;margin-right:6px}.avrij{display:flex;align-items:center;gap:8px;min-width:0}.avrij .avatar{margin-right:0}.avrij>span{min-width:0}';
    document.head.appendChild(st);
  } catch (e){}
  return { svg:svg, vul:vul };
})();
