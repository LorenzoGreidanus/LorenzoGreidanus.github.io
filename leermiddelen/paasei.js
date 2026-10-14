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

  if (document.getElementById('groet')){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', leeromgeving); else leeromgeving();
  }
  return { toast:toast, confetti:confetti, ster:ster, goud:goud, feest:feest, uit:uit };
})();
