/* Grand Prix: de banen, de auto en het veld van boven.

   Gedeeld door het bord (prix-bord.html), het scherm van de leerling
   (prix.html) en de keuze van de docent (strijd.html). De namen van de banen
   en hun speelwijze staan ook in server/prix.js: daar hoort bij elke baan
   dezelfde rondetijd.

   Een baan is een gesloten pad in een vak van 300 bij 190. De start ligt aan
   het begin van het pad. PRIX.veld tekent de baan in een svg en laat de auto's
   rijden: de kamer stuurt om de twee tellen waar iedereen is en hoe hard hij
   rijdt, daartussen rekent het veld zelf verder. */
(function(){
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var MODI = {
    tempo: { naam:'Tempo', uit:'Snelle banen. Veel korte vragen achter elkaar, weinig bandenslijtage.' },
    gewoon: { naam:'Gewoon', uit:'Bochten en rechte stukken door elkaar. Teamradio en pitstops in balans.' },
    precies: { naam:'Nauwkeurig', uit:'Technische banen. Is het antwoord een getal, dan typ je het zelf. Een fout is wijd door de bocht: je verliest even vaart.' },
    herhaal: { naam:'Herhalen', uit:'Banen met een brug. Een vraag die je fout had komt terug: nu goed geeft dubbele vaart.' }
  };
  var BANEN = [
    { id:'polder', modus:'tempo', ronde:28, naam:'De Polderring', tekst:'Een ovaal met drie flauwe bochten. Je rijdt bijna altijd vol gas.', k:['3 bochten', '2 lange rechte stukken'],
      d:'M60 160 L220 160 Q275 160 270 110 Q262 40 200 34 L90 30 Q25 30 25 95 Q25 160 60 160 Z', pit:'M95 160 Q105 142 140 142 Q175 142 185 160' },
    { id:'vliegveld', modus:'tempo', ronde:30, naam:'De Vliegveldbaan', tekst:'Twee startbanen met een knik erin.', k:['6 bochten', '2 knikken'],
      d:'M30 150 L250 150 Q275 150 275 125 L275 70 Q275 45 250 45 L190 45 L175 62 L160 45 L60 45 Q30 45 30 75 L30 95 L46 108 L30 121 Z', pit:'M90 150 Q100 132 140 132 Q180 132 190 150' },
    { id:'dijk', modus:'tempo', ronde:32, naam:'De Dijkring', tekst:'Een schuine D langs de dijk, met één lange doordraaier.', k:['4 bochten', '1 lange doordraaier'],
      d:'M40 165 L240 165 Q280 165 270 125 L235 55 Q222 28 190 30 L70 36 Q28 40 28 80 L28 140 Q28 165 40 165 Z', pit:'M90 165 Q100 147 140 147 Q180 147 190 165' },
    { id:'duinen', modus:'gewoon', ronde:38, naam:'De Duinenbaan', tekst:'Snelle bochten door de duinen en één lang recht stuk.', k:['8 bochten', '1 lang recht stuk'],
      d:'M81 169 L208 169 C239 169 258 154 258 132 C258 110 239 101 218 101 L184 101 C171 101 165 92 171 82 L196 55 C208 39 196 24 177 24 L91 24 C57 24 38 42 38 70 L38 132 C38 154 57 169 81 169 Z', pit:'M100 169 Q108 151 140 151 Q172 151 180 169' },
    { id:'bos', modus:'gewoon', ronde:40, naam:'De Bosbaan', tekst:'Een slinger tussen de bomen en een haarspeld aan het eind.', k:['10 bochten', '1 haarspeld'],
      d:'M40 160 L200 160 Q262 160 262 130 Q262 105 225 105 L185 105 Q160 105 165 82 Q170 60 210 58 Q268 54 262 34 Q258 22 225 22 L120 22 Q95 22 92 45 Q90 68 65 68 Q30 68 30 100 L30 135 Q30 160 40 160 Z', pit:'M80 160 Q90 142 120 142 Q150 142 160 160' },
    { id:'heuvel', modus:'gewoon', ronde:42, naam:'De Heuvelring', tekst:'Omhoog, omlaag en twee keer scherp terug.', k:['11 bochten', '2 scherpe bochten'],
      d:'M50 165 L170 165 Q200 165 205 140 Q210 118 240 118 Q275 118 275 88 Q275 55 240 52 L205 50 Q185 48 180 32 Q174 20 150 24 L70 40 Q30 48 30 85 Q30 110 60 112 L105 114 Q125 116 122 135 Q118 148 80 146 Q40 144 38 156 Q38 165 50 165 Z', pit:'M75 165 Q85 178 115 178 Q145 178 155 165' },
    { id:'haven', modus:'precies', ronde:46, naam:'De Havenstraat', tekst:'Een stadscircuit tussen de loodsen. Alleen haakse bochten.', k:['16 bochten', 'alles haaks'],
      d:'M30 165 L270 165 L270 115 L215 115 L215 85 L262 85 L262 35 L170 35 L170 70 L120 70 L120 30 L40 30 L40 95 L80 95 L80 125 L30 125 Z', pit:'M90 165 Q100 150 150 150 Q200 150 210 165' },
    { id:'gracht', modus:'precies', ronde:46, naam:'De Grachtenring', tekst:'Langs het water en over het plein, met een knik op het rechte stuk.', k:['14 bochten', '1 knik'],
      d:'M30 160 L150 160 L165 145 L180 160 L270 160 L270 100 L230 100 L230 60 L270 60 L270 28 L110 28 L110 62 L70 62 L70 28 L30 28 Z', pit:'M40 160 Q50 175 85 175 Q120 175 130 160' },
    { id:'kasteel', modus:'precies', ronde:50, naam:'De Kasteelbaan', tekst:'Drie keer heen en weer door de kasteeltuin. De langste baan.', k:['18 bochten', '3 haarspelden'],
      d:'M40 165 L250 165 Q275 165 275 142 Q275 122 250 122 L160 122 Q140 122 140 104 Q140 88 160 88 L250 88 Q275 88 275 62 Q275 30 245 30 L190 30 Q172 30 172 48 Q172 62 155 62 Q138 62 138 46 Q138 28 115 28 L50 28 Q28 28 28 52 L28 142 Q28 165 40 165 Z', pit:'M70 165 Q80 150 115 150 Q150 150 160 165' },
    { id:'acht', modus:'herhaal', ronde:36, naam:'De Achtbaan', tekst:'Een acht. In het midden rijd je over de brug.', k:['4 bochten', '1 brug'],
      d:'M75 160 C130 160 170 45 225 45 C280 45 280 160 225 160 C170 160 130 45 75 45 C20 45 20 160 75 160 Z', pit:'M72 136 Q54 102 72 69' },
    { id:'klaver', modus:'herhaal', ronde:40, naam:'Het Klaverblad', tekst:'Een lus die over zichzelf heen draait.', k:['9 bochten', '1 brug, 2 keer'],
      d:'M40 165 L230 165 Q275 165 275 125 Q275 85 235 85 L120 85 Q80 85 80 55 Q80 28 115 28 Q150 28 150 60 L150 120 Q150 138 128 138 L62 138 Q30 138 30 150 Q30 165 40 165 Z', pit:'M170 165 Q180 150 205 150 Q230 150 240 165' },
    { id:'brug', modus:'herhaal', ronde:38, naam:'De Brugbaan', tekst:'Twee schuine rechte stukken die elkaar kruisen.', k:['6 bochten', '1 brug'],
      d:'M50 165 L240 165 Q278 165 278 135 Q278 108 240 104 L90 62 Q60 54 60 40 Q60 26 85 26 L215 26 Q245 26 245 44 Q245 58 215 66 L70 108 Q28 118 28 142 Q28 165 50 165 Z', pit:'M100 165 Q110 150 145 150 Q180 150 190 165' }
  ];
  var KLEUREN = ['#EA9836', '#F26749', '#83A5F2', '#FBF6F1', '#204ECF', '#B79BF0', '#FCDED6', '#F7C873'];
  var BANDNAAM = { zacht:'zacht', medium:'medium', hard:'hard' };
  function baan(id){ for (var i = 0; i < BANEN.length; i++) if (BANEN[i].id === id) return BANEN[i]; return BANEN[3]; }
  function kleur(nr){ return KLEUREN[((nr | 0) % KLEUREN.length + KLEUREN.length) % KLEUREN.length]; }

  /* de auto van boven, neus naar rechts, ongeveer 50 bij 31 groot */
  function auto(kl, gezicht){
    var rand = kl === '#204ECF' ? '#FBF6F1' : '#0B1230';
    return '<ellipse cx="0" cy="1.5" rx="25" ry="13" fill="#05091C" fill-opacity=".45"/>' +
      '<path d="M-20 -8.5 L3 -9.5 L10 -5 V5 L3 9.5 L-20 8.5 Z" fill="#0B1230"/>' +
      '<rect x="-26" y="-11.5" width="5.5" height="23" rx="1.6" fill="#0B1230" stroke="#5A67A6" stroke-width=".8"/>' +
      '<path d="M9 -3 L11 -11 M13 -2.4 L11 -11 M9 3 L11 11 M13 2.4 L11 11 M-13 -4 V-11 M-13 4 V11" stroke="#5A67A6" stroke-width="1.1" stroke-linecap="round"/>' +
      '<g fill="#05091C" stroke="#5A67A6" stroke-width="1"><rect x="-19" y="-15.5" width="11.5" height="7.5" rx="2.6"/><rect x="-19" y="8" width="11.5" height="7.5" rx="2.6"/><rect x="6.5" y="-14.5" width="9.5" height="6.5" rx="2.3"/><rect x="6.5" y="8" width="9.5" height="6.5" rx="2.3"/></g>' +
      '<path d="M-21 -3.4 L-14 -4 L-9 -7.6 L1 -7.6 L5 -4 L12 -2.6 L23 -1.5 V1.5 L12 2.6 L5 4 L1 7.6 L-9 7.6 L-14 4 L-21 3.4 Z" fill="' + kl + '" stroke="' + rand + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<rect x="21" y="-12.5" width="3.6" height="25" rx="1.7" fill="' + kl + '" stroke="' + rand + '" stroke-width="1.5"/>' +
      '<path d="M1 -7 L4.4 -4.4 M1 7 L4.4 4.4" stroke="#0B1230" stroke-width="1.5" stroke-linecap="round"/><path d="M-20 0 H-10" stroke="#0B1230" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round"/>' +
      '<ellipse cx="-3" cy="0" rx="6.8" ry="5.8" fill="#0B1230"/>' +
      '<g class="px-kop">' + (gezicht ? '<g transform="translate(-9 -6)">' + gezicht + '</g>' : '<circle cx="-3" r="4.3" fill="#FCDED6" stroke="#0B1230" stroke-width="1.4"/>') + '</g>';
  }
  /* de baan zelf: gloed, kerbs, asfalt, middenstreep, de pitstraat en de startstreep */
  function baanSvg(b, opt){
    opt = opt || {};
    var d = b.d, uit = '';
    if (!opt.kaal) uit += '<g fill="#16224F"><circle cx="150" cy="96" r="16"/><circle cx="20" cy="14" r="12"/><circle cx="286" cy="182" r="14"/><circle cx="288" cy="14" r="9"/><circle cx="12" cy="180" r="10"/></g>';
    uit += '<path d="' + d + '" fill="none" stroke="#83A5F2" stroke-opacity=".16" stroke-width="27" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="none" stroke="#F26749" stroke-width="19" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="none" stroke="#FBF6F1" stroke-width="19" stroke-linejoin="round" stroke-dasharray="6 6"/>' +
      '<path d="' + b.pit + '" fill="none" stroke="#EA9836" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="' + b.pit + '" fill="none" stroke="#232C57" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="' + d + '" fill="none" stroke="#2A335F" stroke-width="15" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="none" stroke="#FBF6F1" stroke-opacity=".35" stroke-width=".7" stroke-dasharray="4 6"/>';
    return uit;
  }
  /* een klein plaatje van de baan, voor de keuze */
  function plaatje(b){ return '<svg viewBox="0 0 300 190" aria-hidden="true">' + baanSvg(b, { kaal:true }) + '</svg>'; }
  function tijd(ms){ var s = Math.max(0, ms) / 1000, m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(1).replace('.', ','); }

  /* Het veld: de baan in een svg met rijdende auto's.
     opt: { mij (het kenmerk van de eigen auto), namen ('alle', 'top' of 'geen'), gezicht(naam, av) } */
  function veld(svg, opt){
    opt = opt || {};
    var b = null, pad = null, pitPad = null, len = 0, pitLen = 0, laag = null, autos = {}, st = null, loop = null, schaal = opt.schaal || 0.3;
    function el(naam, attrs){ var e = document.createElementNS(NS, naam); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
    function zetBaan(id){
      b = baan(id);
      svg.setAttribute('viewBox', '0 0 300 190');
      svg.innerHTML = baanSvg(b) + '<g class="px-start"></g><g class="px-autos"></g>';
      pad = el('path', { d: b.d }); pitPad = el('path', { d: b.pit });
      len = pad.getTotalLength(); pitLen = pitPad.getTotalLength();
      laag = svg.querySelector('.px-autos'); autos = {};
      /* de startstreep, dwars op de baan */
      var p = plek(0.012, 0);
      svg.querySelector('.px-start').innerHTML = '<g transform="translate(' + p.x.toFixed(2) + ' ' + p.y.toFixed(2) + ') rotate(' + p.hoek.toFixed(1) + ')"><rect x="-1.4" y="-7.5" width="2.8" height="15" fill="#FBF6F1"/><path d="M-.7 -7.5 V7.5" stroke="#0B1230" stroke-width="1.4" stroke-dasharray="1.9 1.9"/><path d="M.7 -5.6 V7.5" stroke="#0B1230" stroke-width="1.4" stroke-dasharray="1.9 1.9"/></g>';
    }
    function plek(frac, opzij){
      frac = ((frac % 1) + 1) % 1;
      var l = frac * len, p = pad.getPointAtLength(l), q = pad.getPointAtLength((l + 1.5) % len), hoek = Math.atan2(q.y - p.y, q.x - p.x);
      return { x: p.x - Math.sin(hoek) * (opzij || 0), y: p.y + Math.cos(hoek) * (opzij || 0), hoek: hoek * 180 / Math.PI };
    }
    function pitPlek(frac){
      var l = Math.max(0, Math.min(1, frac)) * pitLen, p = pitPad.getPointAtLength(l), q = pitPad.getPointAtLength(Math.min(pitLen, l + 1.5)), r = pitPad.getPointAtLength(Math.max(0, l - 1.5));
      return { x: p.x, y: p.y, hoek: Math.atan2(q.y - r.y, q.x - r.x) * 180 / Math.PI };
    }
    function maak(s){
      var px = s.px || {}, g = el('g', { 'class': 'px-auto' + (s.sid === opt.mij ? ' mij' : '') }), ik = s.sid === opt.mij;
      var gezicht = opt.gezicht ? opt.gezicht(s.naam, s.av) : '';
      g.innerHTML = (ik ? '<circle class="px-ring" r="10" fill="none" stroke="#FBF6F1" stroke-width="1.2" stroke-dasharray="3 2.4"/>' : '') +
        '<g class="px-lijf"><path class="px-vaart" d="M-9 0 h-7 M-9 -2 h-4.5 M-9 2 h-4.5" stroke="#EA9836" stroke-width="1" stroke-linecap="round" opacity="0"/><g transform="scale(' + schaal + ')">' + auto(kleur(px.nr), gezicht) + '</g></g>' +
        '<text class="px-naam" text-anchor="middle" y="-9.5" font-family="Poppins, sans-serif" font-weight="700" font-size="5.6" fill="#FBF6F1" stroke="#0B1230" stroke-width="1.6" paint-order="stroke" stroke-linejoin="round"></text>';
      laag.appendChild(g);
      return { g: g, lijf: g.querySelector('.px-lijf'), kop: g.querySelector('.px-kop'), naam: g.querySelector('.px-naam'), vaart: g.querySelector('.px-vaart'), d: null, x: null };
    }
    /* een nieuwe stand: per auto waar hij is en hoe hard hij rijdt */
    function zet(spelers, prix){
      if (!prix) return;
      if (!b || b.id !== prix.baan) zetBaan(prix.baan);
      var nu = performance.now(), gezien = {};
      st = { prix: prix, toen: nu, lijst: spelers || [] };
      st.lijst.forEach(function(s, i){
        if (!s.px || s.weg) return;
        gezien[s.sid] = 1;
        var a = autos[s.sid] || (autos[s.sid] = maak(s));
        a.s = s; a.rang = s.rang || i + 1;
        a.d0 = s.px.d + (s.px.v || 0) * (s.px.oud || 0) / 1000; a.t0 = nu;
        var toonNaam = opt.namen === 'geen' ? false : opt.namen === 'alle' || s.sid === opt.mij || st.lijst.length <= 10 || a.rang <= 5;
        a.naam.textContent = toonNaam ? (s.sid === opt.mij ? 'jij' : s.naam) : '';
        a.vaart.setAttribute('opacity', s.px.boost ? '1' : '0');
      });
      Object.keys(autos).forEach(function(k){ if (!gezien[k]){ laag.removeChild(autos[k].g); delete autos[k]; } });
      if (!loop) loop = requestAnimationFrame(teken);
    }
    function teken(){
      loop = requestAnimationFrame(teken);
      if (!st || !b) return;
      var nu = performance.now(), P = st.prix;
      Object.keys(autos).forEach(function(k){
        var a = autos[k], px = a.s.px, doel, p;
        if (P.fase2 === 'kwal'){
          /* de kwalificatie: elke bocht een stukje verder de baan rond */
          doel = Math.min(1, px.kwI / 8) * 0.985 + 0.012;
          a.d = a.d == null ? doel : a.d + (doel - a.d) * 0.08;
          p = plek(a.d, ((px.nr % 3) - 1) * 3);
        } else if (px.pit >= 0){
          p = pitPlek(0.25 + 0.5 * ((px.nr % 6) / 5)); a.d = null;
        } else if (px.klaar){
          p = pitPlek(0.1 + 0.8 * (((a.rang - 1) % 10) / 9)); a.d = null;
        } else {
          doel = Math.min(P.rondes, a.d0 + (px.v || 0) * (nu - a.t0) / 1000);
          /* een sprong (een nieuwe stand die net anders is) vloeit weg in plaats van te verspringen */
          a.d = a.d == null || Math.abs(doel - a.d) > 0.4 ? doel : a.d + (doel - a.d) * 0.2;
          p = plek(a.d, ((px.nr % 3) - 1) * 3);
        }
        if (a.x != null){ p.x = a.x + (p.x - a.x) * 0.35; p.y = a.y + (p.y - a.y) * 0.35; }
        a.x = p.x; a.y = p.y;
        a.g.setAttribute('transform', 'translate(' + p.x.toFixed(2) + ' ' + p.y.toFixed(2) + ')');
        a.lijf.setAttribute('transform', 'rotate(' + p.hoek.toFixed(1) + ')');
        if (a.kop) a.kop.setAttribute('transform', 'rotate(' + (-p.hoek / schaal * schaal).toFixed(1) + ' -3 0)');
      });
    }
    function waar(sid){ var a = autos[sid]; return a && a.d != null ? a.d : null; }
    function stop(){ if (loop) cancelAnimationFrame(loop); loop = null; }
    if (opt.baan) zetBaan(opt.baan);
    return { zet: zet, zetBaan: zetBaan, waar: waar, stop: stop };
  }

  window.PRIX = { MODI: MODI, BANEN: BANEN, KLEUREN: KLEUREN, BANDNAAM: BANDNAAM, baan: baan, kleur: kleur, auto: auto, baanSvg: baanSvg, plaatje: plaatje, veld: veld, tijd: tijd };
})();
