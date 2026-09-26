/* Het podium aan het eind van een klassenspel, zoals bij een quizshow:
   eerst plek 3, dan plek 2, dan met tromgeroffel en zoeklichten de winnaar.

   PODIUM.onthul(doel, plekken, opties)
     plekken: [{ rang, naam, beeld, regel }] op volgorde, de winnaar eerst (hooguit 3).
              beeld is html (het gezichtje), regel een korte tekst zoals "1200 punten".
     opties.klaar:    functie die draait zodra het podium staat (ook na Sla over).
     opties.winnaar:  eigen tekst voor de winnaar, bv. "Team Rood wint!".

   Het podium is een eigen donker toneel, in licht en donker thema: zoeklichten
   hebben donker nodig. Daarom vaste kleuren hier en geen kleurtokens. */
(function(){
  var CSS =
    '.pd-podium{position:relative;overflow:hidden;isolation:isolate;border-radius:24px;margin-top:16px;padding:16px 12px 0;' +
      'min-height:clamp(340px,50vw,470px);display:flex;flex-direction:column;color:#F3EFE9;text-align:center;' +
      'background:radial-gradient(120% 85% at 50% 0%,#2c3d7c 0%,#17245a 50%,#0b1330 100%);' +
      'box-shadow:0 18px 40px rgba(11,19,48,.28),inset 0 0 0 1.5px rgba(243,239,233,.14)}' +
    /* de zaal gaat op zwart als de winnaar komt */
    '.pd-podium::before{content:"";position:absolute;inset:0;background:#040917;opacity:0;transition:opacity .9s ease;z-index:0;pointer-events:none}' +
    '.pd-spanning::before{opacity:.62}.pd-onthuld::before,.pd-klaar::before{opacity:.38}' +
    /* de lichtflits bij de onthulling */
    '.pd-onthuld::after{content:"";position:absolute;inset:0;z-index:4;pointer-events:none;opacity:0;' +
      'background:radial-gradient(circle at 50% 58%,rgba(255,250,232,.95),rgba(255,250,232,0) 60%);animation:pdFlits 1s ease-out}' +
    '@keyframes pdFlits{0%{opacity:1}100%{opacity:0}}' +
    '.pd-kop{position:relative;z-index:3;margin:2px 0 0;min-height:1.4em;font-weight:700;letter-spacing:-.01em;line-height:1.25;' +
      'font-size:clamp(1.15rem,3.4vw,1.9rem);padding:0 96px}' +
    '.pd-kop.pd-nieuw{animation:pdKop .5s cubic-bezier(.22,1,.36,1)}' +
    '@keyframes pdKop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
    '.pd-spanning .pd-kop{animation:pdPuls .46s ease-in-out infinite alternate}' +
    '@keyframes pdPuls{from{transform:scale(1)}to{transform:scale(1.05)}}' +
    '.pd-sla{position:absolute;top:10px;right:10px;z-index:6;min-height:44px;padding:6px 16px;border-radius:999px;cursor:pointer;' +
      'border:1.5px solid rgba(243,239,233,.38);background:rgba(4,9,23,.35);color:#F3EFE9;font:inherit;font-size:.86rem;font-weight:500}' +
    '.pd-sla:hover{border-color:#F3EFE9}.pd-sla:focus-visible{outline:3px solid #83A5F2;outline-offset:2px}' +
    /* de trap */
    '.pd-trap{position:relative;z-index:1;margin-top:auto;display:grid;grid-template-columns:1fr 1.18fr 1fr;align-items:end;' +
      'gap:clamp(6px,1.6vw,14px);padding:0 clamp(2px,2.4vw,28px)}' +
    '.pd-plek{min-width:0;display:flex;flex-direction:column;align-items:center;transition:filter .7s ease}' +
    '.pd-spanning .pd-p2,.pd-spanning .pd-p3{filter:brightness(.5) saturate(.7)}' +
    '.pd-wie{position:relative;width:100%;min-width:0;padding-bottom:8px;opacity:0;transform:translateY(-46px) scale(.7);' +
      'transition:opacity .35s ease .45s,transform .75s cubic-bezier(.34,1.56,.64,1) .45s}' +
    '.pd-op .pd-wie{opacity:1;transform:none}' +
    '.pd-beeld{position:relative;display:flex;justify-content:center;margin-bottom:4px}' +
    /* een gouden gloed achter de winnaar */
    '.pd-p1 .pd-beeld::before{content:"";position:absolute;left:50%;top:50%;width:190%;aspect-ratio:1;transform:translate(-50%,-50%) scale(.4);z-index:-1;opacity:0;' +
      'background:radial-gradient(circle,rgba(255,221,120,.55),rgba(255,221,120,0) 62%);transition:opacity 1s ease,transform 1.2s cubic-bezier(.22,1,.36,1)}' +
    '.pd-onthuld .pd-p1 .pd-beeld::before,.pd-klaar .pd-p1 .pd-beeld::before{opacity:1;transform:translate(-50%,-50%) scale(1)}' +
    '.pd-beeld svg,.pd-beeld .pd-team{width:clamp(52px,11vw,86px);height:auto}' +
    '.pd-p1 .pd-beeld svg,.pd-p1 .pd-beeld .pd-team{width:clamp(66px,15vw,118px)}' +
    '.pd-team{aspect-ratio:1;border-radius:50%;display:grid;place-items:center;color:#14224C;font-weight:800;font-size:clamp(1.3rem,4vw,2.4rem);' +
      'box-shadow:inset 0 -6px 0 rgba(20,34,76,.18)}' +
    '.pd-naam{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;max-width:100%;overflow:hidden;overflow-wrap:anywhere;font-size:clamp(.92rem,2.4vw,1.3rem);line-height:1.2}' +
    '.pd-p1 .pd-naam{font-size:clamp(1.05rem,3vw,1.7rem)}' +
    '.pd-wie small{display:block;color:rgba(243,239,233,.78);font-size:clamp(.78rem,1.8vw,1rem)}' +
    '.pd-p1 .pd-wie{padding-top:clamp(26px,4.4vw,40px)}' +
    '.pd-kroon{position:absolute;left:50%;top:0;width:clamp(34px,6vw,52px);transform:translate(-50%,6%) rotate(-8deg);opacity:0}' +
    '.pd-op .pd-kroon{animation:pdKroon .7s cubic-bezier(.34,1.56,.64,1) .9s forwards}' +
    '@keyframes pdKroon{from{opacity:0;transform:translate(-50%,-90%) rotate(-30deg)}to{opacity:1;transform:translate(-50%,6%) rotate(-8deg)}}' +
    '.pd-blok{width:100%;height:0;border-radius:14px 14px 0 0;overflow:hidden;display:grid;justify-items:center;align-content:start;' +
      'color:#14224C;font-weight:800;font-size:clamp(1.6rem,5vw,3.1rem);line-height:1;box-shadow:inset 0 10px 0 rgba(255,255,255,.28);' +
      'transition:height .8s cubic-bezier(.22,1,.36,1)}' +
    '.pd-blok span{padding-top:.3em;opacity:0;transition:opacity .4s ease .5s}' +
    '.pd-op .pd-blok span{opacity:1}' +
    '.pd-p1 .pd-blok{--h:clamp(112px,18vw,172px);background:linear-gradient(#F8DD83,#EFC64A)}' +
    '.pd-p2 .pd-blok{--h:clamp(80px,13vw,126px);background:linear-gradient(#B7CBF7,#83A5F2)}' +
    '.pd-p3 .pd-blok{--h:clamp(58px,9.5vw,94px);background:linear-gradient(#F3B36A,#EA9836)}' +
    '.pd-op .pd-blok{height:var(--h)}' +
    '.pd-p1.pd-blokop .pd-blok{height:var(--h);transition-duration:2.6s}' +
    '.pd-leeg{visibility:hidden}' +
    /* de winnaar springt eruit */
    '.pd-onthuld .pd-p1 .pd-wie{animation:pdPop .95s cubic-bezier(.34,1.56,.64,1)}' +
    '@keyframes pdPop{0%{opacity:0;transform:scale(.2)}60%{opacity:1;transform:scale(1.14)}100%{transform:none}}' +
    '.pd-onthuld .pd-p1 .pd-wie,.pd-klaar .pd-p1 .pd-wie{transition-delay:0s}' +
    /* zoeklichten en licht op de vloer */
    '.pd-spot{position:absolute;top:-12px;width:36%;height:130%;z-index:0;pointer-events:none;opacity:0;transform-origin:50% 0;' +
      'background:linear-gradient(to bottom,rgba(255,228,160,.5),rgba(255,228,160,.16) 60%,rgba(255,228,160,0) 92%);' +
      'clip-path:polygon(46% 0,54% 0,100% 100%,0 100%);filter:blur(9px);mix-blend-mode:screen;' +
      'transition:opacity .7s ease,transform 1.1s cubic-bezier(.22,1,.36,1)}' +
    '.pd-l{left:-8%;transform:rotate(-20deg)}.pd-r{right:-8%;transform:rotate(20deg)}' +
    '.pd-spanning .pd-spot,.pd-onthuld .pd-spot,.pd-klaar .pd-spot{opacity:1}' +
    '.pd-spanning .pd-l{animation:pdZwaaiL 1.3s ease-in-out infinite alternate}' +
    '.pd-spanning .pd-r{animation:pdZwaaiR 1.05s ease-in-out infinite alternate}' +
    '@keyframes pdZwaaiL{from{transform:rotate(-42deg)}to{transform:rotate(6deg)}}' +
    '@keyframes pdZwaaiR{from{transform:rotate(42deg)}to{transform:rotate(-6deg)}}' +
    '.pd-onthuld .pd-l,.pd-klaar .pd-l{transform:rotate(var(--pd-l,-24deg))}' +
    '.pd-onthuld .pd-r,.pd-klaar .pd-r{transform:rotate(var(--pd-r,24deg))}' +
    '.pd-vloer{position:absolute;left:50%;bottom:0;width:62%;height:50%;transform:translateX(-50%);z-index:0;pointer-events:none;opacity:0;' +
      'background:radial-gradient(ellipse at 50% 100%,rgba(255,232,160,.5),rgba(255,232,160,0) 70%);transition:opacity 1.2s ease}' +
    '.pd-onthuld .pd-vloer,.pd-klaar .pd-vloer{opacity:1}' +
    /* confetti */
    '.pd-confetti{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden}' +
    '.pd-confetti i{position:absolute;top:-24px;border-radius:2px;opacity:0;animation:pdVal 2.6s cubic-bezier(.25,.6,.5,1) forwards}' +
    '@keyframes pdVal{0%{opacity:1;transform:translate(0,0) rotate(0)}85%{opacity:1}100%{opacity:0;transform:translate(var(--dx),560px) rotate(var(--r))}}' +
    /* Sla over: alles in een keer, zonder beweging */
    '.pd-direct *,.pd-direct{transition:none !important}.pd-direct .pd-wie{animation:none !important}' +
    '@media(max-width:560px){.pd-kop{padding:0 4px;margin-top:48px}}' +
    '@media(prefers-reduced-motion:reduce){.pd-podium *,.pd-podium::after{animation:none !important;transition:none !important}}';

  var KONFETTI = ['#F26749', '#EA9836', '#EFC64A', '#83A5F2', '#204ECF', '#8fd3a8', '#FCDED6', '#fff'];
  var KROON = '<svg class="pd-kroon" viewBox="0 0 48 34" aria-hidden="true"><path d="M4 28 1 7l12 9 11-15 11 15 12-9-3 21z" fill="#EFC64A" stroke="#14224C" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<circle cx="24" cy="19" r="3.4" fill="#F26749"/><circle cx="12" cy="21" r="2.4" fill="#83A5F2"/><circle cx="36" cy="21" r="2.4" fill="#83A5F2"/></svg>';

  function stijl(){
    if (document.getElementById('pd-stijl')) return;
    var s = document.createElement('style'); s.id = 'pd-stijl'; s.textContent = CSS;
    document.head.appendChild(s);
  }
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }

  function onthul(doel, plekken, opties){
    opties = opties || {};
    plekken = (plekken || []).filter(Boolean).slice(0, 3);
    if (!doel) return;
    if (!plekken.length){ doel.innerHTML = ''; if (opties.klaar) opties.klaar(); return; }
    stijl();
    var rustig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* links plek 2, midden de winnaar, rechts plek 3 */
    doel.innerHTML = '<div class="pd-podium">' +
      '<div class="pd-vloer"></div><div class="pd-spot pd-l"></div><div class="pd-spot pd-r"></div>' +
      '<p class="pd-kop" aria-live="polite"></p>' +
      '<div class="pd-trap">' + [1, 0, 2].map(function(i){
        var p = plekken[i];
        if (!p) return '<div class="pd-plek pd-leeg"></div>';
        return '<div class="pd-plek pd-p' + (i + 1) + '" data-i="' + i + '"><div class="pd-wie">' + (i === 0 ? KROON : '') +
          '<div class="pd-beeld">' + (p.beeld || '') + '</div><b class="pd-naam">' + schoon(p.naam) + '</b>' +
          (p.regel ? '<small>' + schoon(p.regel) + '</small>' : '') + '</div>' +
          '<div class="pd-blok"><span>' + (p.rang || i + 1) + '</span></div></div>';
      }).join('') + '</div>' +
      '<div class="pd-confetti" aria-hidden="true"></div>' +
      '<button type="button" class="pd-sla">Sla over</button></div>';
    var el = doel.firstChild, kop = el.querySelector('.pd-kop'), wekkers = [], af = false;
    function na(ms, f){ wekkers.push(setTimeout(f, ms)); }
    function plek(i){ return el.querySelector('.pd-plek[data-i="' + i + '"]'); }
    function zeg(t){ kop.textContent = t; kop.classList.remove('pd-nieuw'); void kop.offsetWidth; kop.classList.add('pd-nieuw'); }
    function winTekst(){
      if (opties.winnaar) return opties.winnaar;
      var gedeeld = plekken.filter(function(p){ return p.rang && p.rang === plekken[0].rang; }).length > 1;
      return gedeeld ? 'Gedeelde eerste plek!' : plekken[0].naam + ' wint!';
    }
    /* de zoeklichten eindigen op het gezicht van de winnaar */
    function richt(){
      var r = el.getBoundingClientRect(), w = plek(0);
      if (!w || !r.width) return;
      var b = w.getBoundingClientRect(), x = b.left + b.width / 2 - r.left, y = r.height * 0.5;
      el.style.setProperty('--pd-l', (-Math.atan2(x - r.width * 0.1, y) * 180 / Math.PI).toFixed(1) + 'deg');
      el.style.setProperty('--pd-r', (-Math.atan2(x - r.width * 0.9, y) * 180 / Math.PI).toFixed(1) + 'deg');
    }
    function konfetti(){
      if (rustig) return;
      var s = '';
      for (var i = 0; i < 90; i++){
        var w = 6 + Math.round(Math.random() * 6);
        s += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;width:' + w + 'px;height:' + Math.round(w * 1.6) + 'px;background:' + KONFETTI[i % KONFETTI.length] +
          ';--dx:' + Math.round(Math.random() * 120 - 60) + 'px;--r:' + Math.round(Math.random() * 900 - 450) + 'deg;animation-duration:' + (2 + Math.random() * 1.6).toFixed(2) +
          's;animation-delay:' + (Math.random() * .6).toFixed(2) + 's"></i>';
      }
      el.querySelector('.pd-confetti').innerHTML = s;
    }
    /* het gezichtje van de winnaar springt van blijdschap (avatar.js kent av-juich) */
    function juich(){ var sv = plek(0) && plek(0).querySelector('.pd-beeld svg'); if (sv) sv.classList.add('av-juich'); }
    function klaar(overgeslagen){
      if (af) return;
      af = true;
      wekkers.forEach(clearTimeout);
      if (overgeslagen) el.classList.add('pd-direct');
      el.classList.remove('pd-spanning');
      el.classList.add('pd-klaar');
      [0, 1, 2].forEach(function(i){ var p = plek(i); if (p) p.classList.add('pd-op'); });
      richt();
      if (overgeslagen){ zeg(winTekst()); konfetti(); juich(); }
      var sla = el.querySelector('.pd-sla'); if (sla) sla.parentNode.removeChild(sla);
      if (opties.klaar) opties.klaar();
    }
    el.querySelector('.pd-sla').addEventListener('click', function(){ klaar(true); });
    if (rustig){ klaar(true); return { klaar:function(){} }; }

    var t = 600, eerst = [];
    if (plekken[2]) eerst.push(2);
    if (plekken[1]) eerst.push(1);
    zeg(plekken.length > 1 ? 'Wie staan er op het podium?' : 'Wie heeft er gewonnen?');
    eerst.forEach(function(i){
      t += 1100;
      na(t, function(){ zeg('Op plek ' + (plekken[i].rang || i + 1) + '…'); plek(i).classList.add('pd-op'); });
      t += 1300;
    });
    /* tromgeroffel: de zaal op zwart, de lichten zoeken, het hoogste blok komt omhoog */
    t += 900;
    na(t, function(){ zeg('En de winnaar is…'); el.classList.add('pd-spanning'); plek(0).classList.add('pd-blokop'); });
    t += 3100;
    na(t, function(){ richt(); el.classList.remove('pd-spanning'); el.classList.add('pd-onthuld'); plek(0).classList.add('pd-op'); zeg(winTekst()); konfetti(); juich(); });
    t += 1800;
    na(t, function(){ klaar(false); });
    return { klaar:function(){ klaar(true); } };
  }
  window.PODIUM = { onthul:onthul };
})();
