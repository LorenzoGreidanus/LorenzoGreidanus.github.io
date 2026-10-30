/* Paaseieren: kleine verrassingen, alleen voor de lol.
   Ze kosten nooit punten, maken geen geluid, staan uit in de lesmodus en bewegen
   niet voor wie "minder beweging" heeft aangezet (dan blijft alleen de tekst).

   In de leeromgeving (index.html):
   - een jaartal in het zoekveld (1492, 1648, 1945, ...): een regeltje geschiedenis met wat confetti;
   - de Konami-code (pijltjes omhoog, omhoog, omlaag, omlaag, links, rechts, links, rechts, B, A):
     de vaktegels maken een rondje en je vindt een geheim feesthoedje voor je gezichtje;
   - zeven keer snel op het logo: het speldje rolt weg en de groet protesteert.
   In de spellen (vakspel.js laadt dit bestand pas als het nodig is):
   - PAASEI.ster(): na tien goed op rij vliegt er een sterretje langs;
   - PAASEI.goud(): de gouden vraag, met een glinstering.
   De nacht en de bijzondere dagen staan in de groet van index.html. */
window.PAASEI = (function(){
  'use strict';
  var KLEUREN = ['#F26749', '#EA9836', '#204ECF', '#83A5F2', '#FCDED6', '#FFD166'];
  /* de opmaak zit hier zelf in, zodat elke pagina dit los kan laden */
  (function(){
    if (document.getElementById('paasei-stijl')) return;
    var st = document.createElement('style'); st.id = 'paasei-stijl';
    st.textContent =
      '.paasei-toast{position:fixed;left:50%;bottom:22px;z-index:90;transform:translate(-50%,20px);opacity:0;pointer-events:none;max-width:min(92vw,520px);' +
        'display:flex;flex-direction:column;align-items:center;gap:2px;padding:12px 20px;border-radius:20px;text-align:center;font-size:.92rem;line-height:1.4;' +
        'background:#fff;color:#14224C;border:1.5px solid rgba(20,34,76,.14);box-shadow:0 14px 34px rgba(20,34,76,.16);transition:opacity .3s cubic-bezier(.16,1,.3,1),transform .3s cubic-bezier(.16,1,.3,1)}' +
      '.paasei-toast.aan{opacity:1;transform:translate(-50%,0)}' +
      '.paasei-toast b{font-family:"Caveat",cursive;font-size:1.5rem;font-weight:600;line-height:1;color:#D9522F}' +
      ':root[data-theme="dark"] .paasei-toast{background:#182652;color:#F3EFE9;border-color:rgba(243,239,233,.18)}:root[data-theme="dark"] .paasei-toast b{color:#F26749}' +
      '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .paasei-toast{background:#182652;color:#F3EFE9;border-color:rgba(243,239,233,.18)}:root:not([data-theme="light"]) .paasei-toast b{color:#F26749}}' +
      '.paasei-snipper{position:fixed;z-index:89;width:9px;height:6px;border-radius:2px;pointer-events:none}' +
      '.paasei-ster{position:fixed;left:0;top:0;z-index:89;width:30px;height:30px;pointer-events:none}' +
      '.paasei-ster svg{width:100%;height:100%;fill:#FFD166;stroke:#c9971f;stroke-width:1.2;stroke-linejoin:round}' +
      '@media(prefers-reduced-motion:reduce){.paasei-toast{transition:none}}';
    (document.head || document.documentElement).appendChild(st);
  })();
  function rustig(){ try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e){ return false; } }
  /* in de lesmodus (main.lesalleen in de leeromgeving) geen verrassingen */
  function uit(){ return !!document.querySelector('main.lesalleen, body.lesmodus'); }

  /* een bericht onderaan, in het handschrift van de site; het gaat vanzelf weer weg */
  var toastEl = null, toastKlok = null;
  function toast(html, ms){
    if (!toastEl){
      toastEl = document.createElement('div'); toastEl.className = 'paasei-toast';
      toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = html;
    toastEl.classList.add('aan');
    clearTimeout(toastKlok); toastKlok = setTimeout(function(){ toastEl.classList.remove('aan'); }, ms || 4200);
  }

  /* confetti vanuit een plek (een element, of het midden van het scherm) */
  function confetti(van, n){
    if (rustig()) return;
    var r = van && van.getBoundingClientRect ? van.getBoundingClientRect() : { left:innerWidth / 2, top:innerHeight / 3, width:0, height:0 };
    var x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
    for (var i = 0; i < (n || 28); i++){
      var d = document.createElement('i'); d.className = 'paasei-snipper'; d.setAttribute('aria-hidden', 'true');
      d.style.background = KLEUREN[i % KLEUREN.length];
      d.style.left = x0 + 'px'; d.style.top = y0 + 'px';
      if (i % 3 === 0) d.style.borderRadius = '50%';
      document.body.appendChild(d);
      var hoek = Math.random() * Math.PI * 2, kracht = 60 + Math.random() * 130;
      var dx = Math.cos(hoek) * kracht, dy = Math.sin(hoek) * kracht - 60;
      var anim = d.animate([
        { transform:'translate(-50%,-50%) rotate(0deg)', opacity:1 },
        { transform:'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) rotate(' + (Math.random() * 360) + 'deg)', opacity:1, offset:.45 },
        { transform:'translate(calc(-50% + ' + (dx * 1.2) + 'px), calc(-50% + ' + (dy + 180) + 'px)) rotate(' + (Math.random() * 720) + 'deg)', opacity:0 }
      ], { duration:1300 + Math.random() * 500, easing:'cubic-bezier(.16,1,.3,1)', fill:'forwards' });
      anim.onfinish = (function(el){ return function(){ el.remove(); }; })(d);
    }
  }

  /* een sterretje dat bovenlangs vliegt (tien goed op rij); het raakt niets aan */
  function ster(){
    if (rustig() || uit()) return;
    var s = document.createElement('div'); s.className = 'paasei-ster'; s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.2l-5.9 3.3 1.3-6.6-4.9-4.5 6.6-.8z"/></svg>';
    document.body.appendChild(s);
    var a = s.animate([
      { transform:'translate(-40px, 90px) rotate(0deg) scale(.6)', opacity:0 },
      { opacity:1, offset:.12 },
      { transform:'translate(' + (innerWidth * .5) + 'px, 30px) rotate(200deg) scale(1)', opacity:1, offset:.55 },
      { transform:'translate(' + (innerWidth + 40) + 'px, 110px) rotate(420deg) scale(.7)', opacity:0 }
    ], { duration:2200, easing:'cubic-bezier(.45,0,.55,1)' });
    a.onfinish = function(){ s.remove(); };
  }

  /* de gouden vraag: een korte glinstering over de kaart */
  function goud(kaart){
    if (!kaart || rustig()) return;
    kaart.animate([{ boxShadow:'0 0 0 0 rgba(255,209,102,.0)' }, { boxShadow:'0 0 0 10px rgba(255,209,102,.45)' }, { boxShadow:'0 0 0 0 rgba(255,209,102,.0)' }], { duration:1100, easing:'ease-out' });
  }

  /* ---------- de leeromgeving ---------- */
  function leeromgeving(){
    var zoek = document.getElementById('zoek');
    /* jaartallen in het zoekveld */
    var JAREN = {
      '1492':'Columbus komt aan in Amerika.',
      '1517':'Luther publiceert zijn 95 stellingen: de Reformatie begint.',
      '1568':'De Tachtigjarige Oorlog begint.',
      '1602':'De VOC wordt opgericht.',
      '1648':'Vrede van Münster: de Tachtigjarige Oorlog is voorbij.',
      '1672':'Het rampjaar: redeloos, radeloos en reddeloos.',
      '1789':'De Franse Revolutie: vrijheid, gelijkheid, broederschap.',
      '1815':'Het Koninkrijk der Nederlanden begint.',
      '1848':'Thorbecke schrijft een nieuwe grondwet.',
      '1919':'Vrouwen krijgen in Nederland kiesrecht.',
      '1940':'10 mei: Duitsland valt Nederland binnen.',
      '1945':'5 mei: Nederland is bevrijd.',
      '1953':'De watersnoodramp.',
      '1969':'Een kleine stap voor een mens: de eerste mens op de maan.',
      '1989':'De Berlijnse Muur valt.'
    };
    var gezien = {};
    if (zoek) zoek.addEventListener('input', function(){
      var w = zoek.value.trim();
      if (!JAREN[w] || gezien[w] || uit()) return;
      gezien[w] = true;
      toast('<b>' + w + '</b> <span>' + JAREN[w] + '</span>', 5200);
      confetti(zoek, 22);
    });

    /* de Konami-code */
    var CODE = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'], pos = 0;
    addEventListener('keydown', function(e){
      var t = e.target && e.target.tagName;
      if (/INPUT|TEXTAREA|SELECT/.test(t || '')) { pos = 0; return; }
      var k = String(e.key || '').toLowerCase();
      pos = k === CODE[pos] ? pos + 1 : (k === CODE[0] ? 1 : 0);
      if (pos < CODE.length) return;
      pos = 0;
      if (uit()) return;
      feest();
    });

    /* zeven keer snel op het logo */
    var merk = document.getElementById('merk'), tikken = [];
    if (merk) merk.addEventListener('click', function(){
      var nu = Date.now();
      tikken = tikken.filter(function(t){ return nu - t < 3000; }); tikken.push(nu);
      if (tikken.length < 7 || uit()) return;
      tikken = [];
      var groet = document.getElementById('groet'), oud = groet ? groet.textContent : '';
      if (groet){ groet.textContent = 'hé, niet zo hard tikken!'; setTimeout(function(){ groet.textContent = oud; }, 3200); }
      var pin = merk.querySelector('.lgmark') || merk;
      if (!rustig()) pin.animate([
        { transform:'none' },
        { transform:'rotate(80deg) translateY(4px)', offset:.15 },
        { transform:'translateX(140px) rotate(440deg)', offset:.55 },
        { transform:'translateX(140px) rotate(440deg)', offset:.7 },
        { transform:'none' }
      ], { duration:2400, easing:'cubic-bezier(.45,0,.55,1)' });
    });
  }
  /* de Konami-code gevonden: de vaktegels maken een rondje, confetti, en het geheime hoedje */
  function feest(){
    var tegels = document.querySelectorAll('.vaktegel, .spelkaart, .tegel');
    if (!rustig()) Array.prototype.forEach.call(tegels, function(t, i){
      t.animate([{ transform:'none' }, { transform:'translateY(-14px) rotate(-4deg)' }, { transform:'translateY(0) rotate(4deg)' }, { transform:'none' }],
        { duration:700, delay:i * 45, easing:'cubic-bezier(.16,1,.3,1)' });
    });
    confetti(null, 40);
    var nieuw = window.PROFIEL && PROFIEL.geheimGevonden ? PROFIEL.geheimGevonden('h24') : false;
    toast(nieuw
      ? '<b>Je vond een geheim!</b> <span>Een feesthoedje voor je gezichtje. Zet hem op via het rondje rechtsboven.</span>'
      : '<b>Feest!</b> <span>Het geheime hoedje had je al gevonden.</span>', 6000);
    if (nieuw && window.VERNIEUWGEZICHT) VERNIEUWGEZICHT();
  }

  /* ---------- bijzondere dagen: een strook versiering boven de groet en een hoedje op het gezichtje ----------
     index.html zet window.LG_DAG (koning, april, sint, kerst, nieuw, halloween, zomer, nacht); ?dag=... om te bekijken.
     De hoed van de dag is een echte hoed op het gezichtje: AVATAR.feest(spec, dag) in avatar.js. */
  var r1 = function(n){ return Math.round(n * 10) / 10; };
  function touw(B, y0, zak){
    var A = [-6, y0], M = [B / 2, y0 + 4], C = [B + 6, y0];
    function boog(P, Q, t){
      var cx = (P[0] + Q[0]) / 2, cy = (P[1] + Q[1]) / 2 + zak * 2;
      var x = (1 - t) * (1 - t) * P[0] + 2 * t * (1 - t) * cx + t * t * Q[0], y = (1 - t) * (1 - t) * P[1] + 2 * t * (1 - t) * cy + t * t * Q[1];
      var dx = 2 * (1 - t) * (cx - P[0]) + 2 * t * (Q[0] - cx), dy = 2 * (1 - t) * (cy - P[1]) + 2 * t * (Q[1] - cy), l = Math.hypot(dx, dy);
      return { x:x, y:y, nx:-dy / l, ny:dx / l };
    }
    return {
      pad:'M' + A + ' Q' + [(A[0] + M[0]) / 2, (A[1] + M[1]) / 2 + zak * 2] + ' ' + M + ' Q' + [(M[0] + C[0]) / 2, (M[1] + C[1]) / 2 + zak * 2] + ' ' + C,
      punt:function(t){ return t < .5 ? boog(A, M, t * 2) : boog(M, C, t * 2 - 1); }
    };
  }
  var VLEUGEL = 'M-3 -2 C-7 -10 -15 -12 -24 -8 C-21 -5 -21 -1 -20 2 C-17 -1 -15 0 -13 3 C-11 0 -8 0 -6 3 C-5 1 -4 0 -3 1 Z';
  function vleer(x, y, ver, duur, v, s){
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><g class="pe-vlucht" style="--ver:' + ver + 'px;animation-duration:' + duur + 's;animation-delay:' + v + 's"><g class="pe-dobber">' +
      '<g class="pe-vl"><path d="' + VLEUGEL + '" fill="currentColor"/></g><g class="pe-vr"><path d="' + VLEUGEL + '" fill="currentColor" transform="scale(-1 1)"/></g>' +
      '<ellipse cx="0" cy="2" rx="4" ry="6" fill="currentColor"/><circle cx="0" cy="-5" r="4" fill="currentColor"/><path d="M-3.4 -7 L-4.2 -12.5 L-1 -8.4 Z M3.4 -7 L4.2 -12.5 L1 -8.4 Z" fill="currentColor"/>' +
      '<circle cx="-1.5" cy="-5.4" r=".9" fill="#FFD166"/><circle cx="1.5" cy="-5.4" r=".9" fill="#FFD166"/></g></g></g>';
  }
  function pijl(x, y, kleur, v, groot){
    var s = []; for (var k = 0; k < 10; k++){ var h = k * Math.PI / 5; s.push('M' + r1(Math.cos(h) * groot * .35) + ' ' + r1(Math.sin(h) * groot * .35) + ' L' + r1(Math.cos(h) * groot) + ' ' + r1(Math.sin(h) * groot)); }
    return '<g transform="translate(' + x + ' ' + y + ')"><path class="pe-spoor" style="animation-delay:' + v + 's" d="M0 70 L0 6" stroke="' + kleur + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<g class="pe-knal" style="animation-delay:' + v + 's"><path d="' + s.join(' ') + '" stroke="' + kleur + '" stroke-width="2.6" stroke-linecap="round"/><circle r="2.6" fill="' + kleur + '"/></g></g>';
  }
  function strook(dag, B){
    var R = B - 60, s = '', i, t, p;
    if (dag === 'koning'){
      var T = touw(B, 8, 13), KL = ['#F7931E', '#AE1C28', '#FFFFFF', '#21468B'], n = Math.max(8, Math.round(B / 28));
      s += '<path d="' + T.pad + '" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".55"/><g stroke="#14224C" stroke-width="1" stroke-linejoin="round">';
      for (i = 0; i < n; i++){
        var t1 = .02 + i * (.96 / n), t2 = t1 + .96 / n * .7;
        if (Math.abs((t1 + t2) / 2 - .5) < .015) continue;
        var a = T.punt(t1), b = T.punt(t2), m = T.punt((t1 + t2) / 2);
        s += '<path class="pe-vlag" style="animation-delay:' + r1(i * .13) + 's;transform-origin:' + r1(m.x) + 'px ' + r1(m.y) + 'px" d="M' + r1(a.x) + ' ' + r1(a.y) + ' L' + r1(b.x) + ' ' + r1(b.y) + ' L' + r1(m.x + m.nx * 24) + ' ' + r1(m.y + m.ny * 24) + ' Z" fill="' + KL[i % 4] + '"/>';
      }
      s += '</g>';
    } else if (dag === 'kerst'){
      var K = touw(B, 8, 13), LK = ['#F26749', '#FFD166', '#83A5F2', '#2f9e8f'], nl = Math.max(8, Math.round(B / 34));
      s += '<path d="' + K.pad + '" fill="none" stroke="#2f7d52" stroke-width="2.4"/>';
      for (i = 0; i < nl; i++){
        t = .03 + i * (.94 / (nl - 1)); if (Math.abs(t - .5) < .015) continue;
        p = K.punt(t);
        s += '<g transform="translate(' + r1(p.x) + ' ' + r1(p.y) + ') rotate(' + r1(Math.atan2(p.ny, p.nx) * 180 / Math.PI - 90) + ')"><rect x="-3" y="0" width="6" height="6" rx="1" fill="#2f3b5c"/>' +
          '<ellipse class="pe-lamp" style="animation-delay:' + r1(i * .35 % 2.1) + 's" cx="0" cy="13" rx="5.2" ry="8" fill="' + LK[i % 4] + '" stroke="#14224C" stroke-width="1"/></g>';
      }
    } else if (dag === 'nieuw'){
      s += pijl(R - 140, 34, '#F26749', 0, 22) + pijl(R - 60, 26, '#204ECF', .7, 26) + pijl(R + 10, 44, '#EA9836', 1.4, 18) + pijl(R - 100, 60, '#83A5F2', 2.1, 14) +
        '<text x="' + (R - 230) + '" y="66" font-family="Caveat, cursive" font-weight="600" font-size="34" fill="#D9522F" transform="rotate(-6 ' + (R - 200) + ' 56)">' + (new Date().getFullYear() + (new Date().getMonth() === 11 ? 1 : 0)) + '</text>';
    } else if (dag === 'sint'){
      s += '<g fill="#A4652E" stroke="#6E3F17" stroke-width="1.2">' + [[R - 280, 26, 7, 0], [R - 220, 60, 6, .4], [R - 150, 22, 7, .9], [R - 80, 64, 5, 1.3], [R - 100, 34, 6, .6]].map(function(q){
        return q[0] > 10 ? '<circle class="pe-noot" style="animation-delay:' + q[3] + 's" cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '"/>' : ''; }).join('') + '</g>' +
        '<g transform="translate(' + (R - 8) + ' 34)"><rect x="0" y="12" width="44" height="34" rx="4" fill="#F26749" stroke="#14224C" stroke-width="1.5"/><rect x="-3" y="3" width="50" height="12" rx="3" fill="#EA9836" stroke="#14224C" stroke-width="1.5"/><path d="M22 3 V46" stroke="#FFD166" stroke-width="5"/><path d="M22 3 C13 -9 4 -3 13 3 M22 3 C31 -9 40 -3 31 3" fill="none" stroke="#FFD166" stroke-width="3" stroke-linecap="round"/></g>';
    } else if (dag === 'halloween'){
      s += vleer(Math.max(30, R - 300), 30, Math.min(200, B * .4), 7, 0, 1.15) + vleer(Math.max(60, R - 250), 64, Math.min(150, B * .3), 9, -3, .9) + vleer(Math.max(90, R - 180), 20, 110, 6, -1.5, .75) +
        '<defs><radialGradient id="pe-licht" cx="50%" cy="55%" r="65%"><stop offset="0" stop-color="#FFF6C2"/><stop offset=".45" stop-color="#FFD25A"/><stop offset="1" stop-color="#F28A12"/></radialGradient>' +
        '<radialGradient id="pe-schil" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#F7A23A"/><stop offset="1" stop-color="#D9661A"/></radialGradient></defs>' +
        '<g transform="translate(' + (R + 4) + ' 50)"><path d="M-2 -24 C-3 -32 2 -38 9 -37" fill="none" stroke="#6E4A1F" stroke-width="6" stroke-linecap="round"/>' +
        '<ellipse cx="-22" cy="4" rx="17" ry="27" fill="url(#pe-schil)" stroke="#9c4a12" stroke-width="1.4"/><ellipse cx="22" cy="4" rx="17" ry="27" fill="url(#pe-schil)" stroke="#9c4a12" stroke-width="1.4"/>' +
        '<ellipse cx="-10" cy="3" rx="16" ry="29" fill="url(#pe-schil)" stroke="#9c4a12" stroke-width="1.2"/><ellipse cx="10" cy="3" rx="16" ry="29" fill="url(#pe-schil)" stroke="#9c4a12" stroke-width="1.2"/><ellipse cx="0" cy="2" rx="13" ry="30" fill="url(#pe-schil)" stroke="#9c4a12" stroke-width="1.2"/>' +
        '<g fill="#5a2208" stroke="#5a2208" stroke-width="3" stroke-linejoin="round"><path d="M-23 -6 L-12 -18 L-5 -4 Q-14 -2 -23 -6 Z M5 -4 L12 -18 L23 -6 Q14 -2 5 -4 Z"/><path d="M-4 5 L0 -1 L4 5 Z"/><path d="M-24 9 Q0 20 24 9 Q19 27 0 29 Q-19 27 -24 9 Z"/></g>' +
        '<g class="pe-gloed"><path d="M-23 -6 L-12 -18 L-5 -4 Q-14 -2 -23 -6 Z M5 -4 L12 -18 L23 -6 Q14 -2 5 -4 Z" fill="url(#pe-licht)"/><path d="M-4 5 L0 -1 L4 5 Z" fill="url(#pe-licht)"/><path d="M-24 9 Q0 20 24 9 Q19 27 0 29 Q-19 27 -24 9 Z" fill="url(#pe-licht)"/></g>' +
        '<rect x="-6" y="11" width="7" height="6" rx="1" fill="#E07A1F"/><rect x="5" y="22" width="7" height="7" rx="1" fill="#E07A1F"/></g>';
    } else if (dag === 'zomer'){
      var xb = R - 110;
      s += '<g class="pe-meeuw"><path d="M' + (xb - 160) + ' 30 q6 -6 12 0 q6 -6 12 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>' +
        '<g class="pe-meeuw" style="animation-delay:-1.4s"><path d="M' + (xb - 110) + ' 18 q4 -4 8 0 q4 -4 8 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></g>' +
        '<ellipse class="pe-balschaduw" cx="' + xb + '" cy="82.5" rx="11" ry="2.4" fill="currentColor" opacity=".3"/>' +
        '<g transform="translate(' + xb + ' 70.5)"><g class="pe-bal"><circle r="11.5" fill="#FFFFFF" stroke="#14224C" stroke-width="1.4"/><path d="M0 -11.5 A11.5 11.5 0 0 1 9.4 -6.6 L0 0 Z" fill="#F26749"/><path d="M9.4 6.6 A11.5 11.5 0 0 1 0 11.5 L0 0 Z" fill="#204ECF"/><path d="M-9.4 -6.6 A11.5 11.5 0 0 1 0 -11.5 L0 0 Z" fill="#FFD166"/><path d="M-11.5 0 A11.5 11.5 0 0 1 -9.4 -6.6 L0 0 Z M0 11.5 A11.5 11.5 0 0 1 -9.4 6.6 L0 0 Z" fill="#83A5F2"/></g></g>';
    } else if (dag === 'nacht'){
      s += '<path d="M' + (R + 12) + ' 18 a26 26 0 1 0 24 34 a20 20 0 1 1 -24 -34 z" fill="#FFD166"/>' +
        [[R - 200, 20, 1.8, 0], [R - 130, 50, 1.4, .8], [R - 80, 16, 1.8, 1.6], [R - 40, 70, 1.3, .4], [R - 160, 80, 1.2, 1.2], [R + 40, 86, 1.4, 2]].map(function(q){
          return q[0] > 10 ? '<circle class="pe-twinkel" style="animation-delay:' + q[3] + 's" cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="currentColor"/>' : ''; }).join('') +
        '<text class="pe-zzz" x="58" y="84" font-family="Caveat, cursive" font-weight="600" font-size="26" fill="#83A5F2">z z z</text>';
    } else if (dag === 'april'){
      s += '<g transform="translate(' + (R - 30) + ' 46) rotate(10)"><rect x="0" y="0" width="86" height="36" rx="10" fill="none" stroke="#D9522F" stroke-width="2.5"/><text x="43" y="25" text-anchor="middle" font-family="Caveat, cursive" font-weight="600" font-size="26" fill="#D9522F">1 april!</text></g>';
    }
    return '<svg class="pe-strook-svg" aria-hidden="true" width="' + B + '" height="100" viewBox="0 0 ' + B + ' 100" style="overflow:visible">' + s + '</svg>';
  }
  function sneeuw(){
    if (rustig() || document.querySelector('.pe-sneeuw')) return;
    var sn = document.createElement('div'); sn.className = 'pe-sneeuw'; sn.setAttribute('aria-hidden', 'true');
    var h = ''; for (var i = 0; i < 34; i++){ var g = 3 + (i % 4) * 1.4;
      h += '<i style="left:' + r1((i * 37.3 + (i % 3) * 11) % 100) + '%;width:' + g + 'px;height:' + g + 'px;animation-duration:' + r1(7 + (i * 1.7) % 6) + 's;animation-delay:' + r1(-(i * .73) % 9) + 's"></i>'; }
    sn.innerHTML = h; document.body.appendChild(sn);
  }
  /* Welke bijzondere dag is het, en wat zegt het handschrift dan? Voor de voorpagina.
     Dezelfde dagen als de groet in leermiddelen/index.html: verander je er een, verander dan allebei. */
  function welkeDag(zoek){
    var nu = new Date(), mnd = nu.getMonth() + 1, dag = nu.getDate(), u = nu.getHours(), soort = '';
    var koningsdag = new Date(nu.getFullYear(), 3, 27).getDay() === 0 ? 26 : 27;
    if (mnd === 4 && dag === koningsdag) soort = 'koning';
    else if (mnd === 4 && dag === 1) soort = 'april';
    else if (mnd === 12 && dag >= 1 && dag <= 5) soort = 'sint';
    else if (mnd === 12 && dag >= 24 && dag <= 26) soort = 'kerst';
    else if ((mnd === 12 && dag === 31) || (mnd === 1 && dag <= 7)) soort = 'nieuw';
    else if (mnd === 10 && dag >= 27) soort = 'halloween';
    else if ((mnd === 7 && dag >= 15) || (mnd === 8 && dag <= 20)) soort = 'zomer';
    else if (u >= 23 || u < 5) soort = 'nacht';
    var adres = (/[?&]dag=([a-z]+)/.exec(zoek || '') || [])[1];
    if (adres && /^(koning|april|sint|kerst|nieuw|halloween|zomer|nacht)$/.test(adres)) soort = adres;
    var tekst = { koning:'fijne Koningsdag!', april:'alle toetsen zijn afgelast... 1 april!', sint:mnd === 12 && dag === 5 ? 'vanavond is het pakjesavond!' : 'het is bijna pakjesavond!',
      kerst:'fijne kerst!', nieuw:'gelukkig nieuwjaar!', halloween:mnd === 10 && dag < 31 ? 'boe! bijna Halloween' : 'boe! fijne Halloween', zomer:'fijne vakantie! (oefenen mag ook)', nacht:'zou je niet eens gaan slapen?' }[soort] || '';
    return { dag:soort, tekst:tekst };
  }
  function feestdag(){
    var dag = window.LG_DAG, top = document.querySelector('main .top');
    if (!dag || !top) return;
    document.documentElement.setAttribute('data-dag', dag);
    var vak = document.createElement('div'); vak.className = 'pe-strook'; vak.setAttribute('aria-hidden', 'true');
    /* achteraan: het eerste kind van .top heeft op een laptop een eigen rol in het raster */ top.appendChild(vak);
    function teken(){ var B = Math.max(300, Math.min(top.clientWidth, 1100)); vak.innerHTML = strook(dag, B); }
    teken();
    var wacht = null; addEventListener('resize', function(){ clearTimeout(wacht); wacht = setTimeout(teken, 150); });
    /* sneeuw bij kerst: over de bovenkant van de pagina, achter niets wat je moet lezen */
    if (dag === 'kerst') sneeuw();
    /* het hoedje van de dag zet de groet zelf op het gezichtje: een echte 3D-hoed (AVATAR.feest), alleen als je zelf geen hoed op hebt */
  }
  /* de opmaak en de beweging van de bijzondere dagen */
  (function(){
    var st = document.createElement('style');
    st.textContent =
      'main .top{position:relative}' +
      'html[data-dag] main .top{padding-top:104px}' +
      '.pe-strook{position:absolute;left:0;right:0;top:0;height:100px;pointer-events:none;color:var(--ink,#14224C);overflow:visible}' +
      'main.lesalleen .pe-strook,main.lesalleen ~ .pe-sneeuw{display:none}' +
      '.begroetgezicht{position:relative}' +
            '.pe-sneeuw{position:absolute;left:0;right:0;top:0;height:640px;overflow:hidden;pointer-events:none;z-index:1}' +
      '.pe-sneeuw i{position:absolute;top:0;border-radius:50%;background:#fff;box-shadow:0 0 0 1px rgba(20,34,76,.14);animation:pe-val linear infinite}' +
      '@keyframes pe-val{from{transform:translate(0,-20px)}to{transform:translate(18px,660px)}}' +
      '@keyframes pe-wapper{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}.pe-vlag{transform-box:view-box;animation:pe-wapper 2.6s ease-in-out infinite}' +
      '@keyframes pe-gloei{0%,100%{opacity:1}50%{opacity:.45}}.pe-lamp{animation:pe-gloei 2.1s ease-in-out infinite}' +
      '@keyframes pe-stijg{0%{stroke-dasharray:0 80;opacity:1}30%{stroke-dasharray:64 80;opacity:1}38%,100%{opacity:0}}.pe-spoor{animation:pe-stijg 2.8s ease-out infinite}' +
      '@keyframes pe-knal{0%,30%{transform:scale(0);opacity:0}38%{transform:scale(.3);opacity:1}70%{transform:scale(1);opacity:1}100%{transform:scale(1.15);opacity:0}}.pe-knal{transform-box:fill-box;transform-origin:center;animation:pe-knal 2.8s ease-out infinite}' +
      '@keyframes pe-tol{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-6px) rotate(20deg)}}.pe-noot{transform-box:fill-box;transform-origin:center;animation:pe-tol 2.4s ease-in-out infinite}' +
      '@keyframes pe-vlucht{0%{transform:translateX(0) scaleX(1)}48%{transform:translateX(var(--ver)) scaleX(1)}52%{transform:translateX(var(--ver)) scaleX(-1)}96%{transform:translateX(0) scaleX(-1)}100%{transform:translateX(0) scaleX(1)}}.pe-vlucht{animation:pe-vlucht 7s ease-in-out infinite}' +
      '@keyframes pe-dobber{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}.pe-dobber{animation:pe-dobber 1.6s ease-in-out infinite}' +
      '@keyframes pe-kl{0%,100%{transform:rotate(0)}50%{transform:rotate(38deg) scaleY(.6)}}@keyframes pe-kr{0%,100%{transform:rotate(0)}50%{transform:rotate(-38deg) scaleY(.6)}}' +
      '.pe-vl{transform-box:fill-box;transform-origin:right center;animation:pe-kl .42s ease-in-out infinite}.pe-vr{transform-box:fill-box;transform-origin:left center;animation:pe-kr .42s ease-in-out infinite}' +
      '@keyframes pe-gloed{0%,100%{opacity:1;filter:drop-shadow(0 0 2px #FFF3B0) drop-shadow(0 0 6px #FFD166)}50%{opacity:.88;filter:drop-shadow(0 0 2px #FFD166)}}.pe-gloed{animation:pe-gloed 1.8s ease-in-out infinite}' +
      '@keyframes pe-stuiter{0%{transform:translateY(0) scale(1.08,.9);animation-timing-function:cubic-bezier(.2,.7,.4,1)}12%{transform:translateY(-3px) scale(1)}50%{transform:translateY(-20px);animation-timing-function:cubic-bezier(.6,0,.8,.3)}100%{transform:translateY(0) scale(1.08,.9)}}' +
      '.pe-bal{transform-box:fill-box;transform-origin:center bottom;animation:pe-stuiter 1.1s infinite}' +
      '@keyframes pe-schaduw{0%,100%{transform:scaleX(1);opacity:.3}50%{transform:scaleX(.5);opacity:.12}}.pe-balschaduw{transform-box:fill-box;transform-origin:center;animation:pe-schaduw 1.1s infinite}' +
      '@keyframes pe-meeuw{0%,100%{transform:translate(0,0)}50%{transform:translate(14px,-5px)}}.pe-meeuw{animation:pe-meeuw 5s ease-in-out infinite}' +
      '@keyframes pe-twinkel{0%,100%{opacity:1}50%{opacity:.25}}.pe-twinkel{animation:pe-twinkel 2.4s ease-in-out infinite}' +
      '@keyframes pe-zweef{0%,100%{transform:translateY(0);opacity:.9}50%{transform:translateY(-6px);opacity:.5}}.pe-zzz{animation:pe-zweef 3s ease-in-out infinite}' +
      '@keyframes pe-schommel{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}.pe-staf{transform-box:fill-box;transform-origin:center bottom;animation:pe-schommel 4s ease-in-out infinite}' +
      '@media(prefers-reduced-motion:reduce){.pe-strook *{animation:none !important}.pe-knal{transform:none;opacity:1}.pe-sneeuw{display:none}}';
    (document.head || document.documentElement).appendChild(st);
  })();

  if (document.getElementById('groet')){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', leeromgeving); else leeromgeving();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', feestdag); else feestdag();
  }
  return { toast:toast, confetti:confetti, ster:ster, goud:goud, feest:feest, uit:uit, welkeDag:welkeDag, strook:strook, sneeuw:sneeuw };
})();
