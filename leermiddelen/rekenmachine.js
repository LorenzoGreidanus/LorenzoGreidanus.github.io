/* ============================================================================
   REKENMACHINE - een zakrekenmachine die elk spel erbij kan zetten
   ============================================================================
   Bij sommen over korting, btw en rente gaat het om de manier, niet om het
   staartdelen. Een leerling die de som snapt maar de deling niet rond krijgt
   moet verder kunnen. Daarom een knop met een rekenmachine erachter.

   Gebruik:
       <script src="rekenmachine.js"></script>
       REKENMACHINE.koppel(knop, { naar:invoerveld });

   'naar' is niet verplicht. Staat hij erbij, dan krijgt de rekenmachine een
   knop 'Neem over' die de uitkomst met een komma in dat veld zet.

   De opmaak staat in dit bestand en gebruikt de kleurtokens van de pagina
   (--kaart, --ink, --rand2 en zo), dus hij kantelt vanzelf mee met de donkere
   stand. Alleen kleuren, nooit maten.
   ============================================================================ */
window.REKENMACHINE = (function(){
  'use strict';
  var vak = null, scherm = null, regel = null, overBtn = null, naarVeld = null, opener = null;
  var nu = '0', vorige = null, bewerking = null, nieuw = true;

  var CSS = [
    '.rmvak{position:fixed;right:16px;bottom:16px;z-index:60;width:min(300px,calc(100vw - 32px));',
    '  background:var(--kaart,#fff);color:var(--ink,#14224C);border:1px solid var(--rand2,rgba(20,34,76,.16));',
    '  border-radius:20px;padding:12px;box-shadow:0 18px 44px rgba(20,34,76,.22)}',
    '.rmvak[hidden]{display:none}',
    '.rmkop{display:flex;align-items:center;gap:8px;padding:0 2px 8px}',
    '.rmkop b{font-size:.82rem;font-weight:600;letter-spacing:.04em}',
    '.rmkop button{margin-left:auto;border:none;background:none;color:var(--muted,#5b6480);font-size:1.25rem;',
    '  line-height:1;padding:4px 6px;cursor:pointer;border-radius:8px}',
    '.rmscherm{background:var(--kaart2,#f4f7ff);border-radius:14px;padding:10px 12px;text-align:right;',
    '  font-variant-numeric:tabular-nums;overflow:hidden}',
    '.rmregel{font-size:.78rem;color:var(--muted,#5b6480);min-height:1.1em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.rmuit{font-size:1.6rem;font-weight:700;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.rmtoetsen{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}',
    '.rmtoetsen button{border:1px solid var(--rand2,rgba(20,34,76,.16));background:var(--kaart,#fff);color:var(--ink,#14224C);',
    '  border-radius:12px;padding:11px 0;font:inherit;font-size:1.02rem;font-weight:600;cursor:pointer;min-height:44px;',
    '  touch-action:manipulation}',
    '.rmtoetsen button:active{transform:scale(.97)}',
    '.rmtoetsen button.werk{background:var(--kaart2,#f4f7ff)}',
    '.rmtoetsen button.isgelijk{background:var(--ocean,#204ECF);border-color:var(--ocean,#204ECF);color:#fff}',
    '.rmover{width:100%;margin-top:8px;border:none;border-radius:12px;padding:10px;font:inherit;font-weight:600;',
    '  background:var(--crab,#F26749);color:#fff;cursor:pointer;min-height:44px}',
    '.rmover[hidden]{display:none}',
    '@media(max-width:560px){.rmvak{left:16px;right:16px;width:auto;bottom:12px}}'
  ].join('\n');

  var TOETSEN = [
    ['C', 'wis'], ['⌫', 'terug'], ['%', 'procent'], ['÷', 'op:/'],
    ['7', 'cijfer'], ['8', 'cijfer'], ['9', 'cijfer'], ['×', 'op:*'],
    ['4', 'cijfer'], ['5', 'cijfer'], ['6', 'cijfer'], ['−', 'op:-'],
    ['1', 'cijfer'], ['2', 'cijfer'], ['3', 'cijfer'], ['+', 'op:+'],
    ['0', 'cijfer'], [',', 'komma'], ['±', 'min'], ['=', 'isgelijk']
  ];

  /* Een getal zoals een mens het schrijft: hoogstens tien cijfers achter de
     komma weg, en een komma in plaats van een punt. */
  function toon(v){
    if (!isFinite(v)) return 'kan niet';
    var s = Math.abs(v) >= 1e12 ? v.toExponential(4) : String(Math.round(v * 1e8) / 1e8);
    return s.replace('.', ',');
  }
  function getal(){ return parseFloat(nu.replace(',', '.')) || 0; }

  function teken(){
    if (!scherm) return;
    scherm.textContent = nu;
    regel.textContent = vorige === null ? '' : toon(vorige) + ' ' + ({ '+':'+', '-':'−', '*':'×', '/':'÷' }[bewerking] || '');
  }
  function reken(){
    var b = getal();
    if (vorige === null || !bewerking) return b;
    if (bewerking === '+') return vorige + b;
    if (bewerking === '-') return vorige - b;
    if (bewerking === '*') return vorige * b;
    if (bewerking === '/') return b === 0 ? NaN : vorige / b;
    return b;
  }
  function doe(wat){
    if (wat === 'wis'){ nu = '0'; vorige = null; bewerking = null; nieuw = true; }
    else if (wat === 'terug'){
      if (nieuw) nu = '0';
      else { nu = nu.length > 1 ? nu.slice(0, -1) : '0'; if (nu === '-' || nu === '') nu = '0'; }
      if (nu === '0') nieuw = true;
    }
    else if (wat === 'komma'){ if (nieuw){ nu = '0,'; nieuw = false; } else if (nu.indexOf(',') < 0) nu += ','; }
    else if (wat === 'min'){ nu = nu.charAt(0) === '-' ? nu.slice(1) : '-' + nu; }
    else if (wat === 'procent'){ nu = toon(getal() / 100); nieuw = true; }
    else if (wat === 'isgelijk'){
      if (bewerking){ nu = toon(reken()); vorige = null; bewerking = null; }
      nieuw = true;
    }
    else if (wat.indexOf('op:') === 0){
      var teken2 = wat.slice(3);
      if (bewerking && !nieuw) nu = toon(reken());
      vorige = getal(); bewerking = teken2; nieuw = true;
    }
    else {                                   /* een cijfer */
      if (nieuw){ nu = wat; nieuw = false; }
      else if (nu === '0') nu = wat;
      else if (nu.replace(/[-,]/g, '').length < 12) nu += wat;
    }
    teken();
  }

  function bouw(){
    if (vak) return;
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    vak = document.createElement('div');
    vak.className = 'rmvak';
    vak.hidden = true;
    vak.setAttribute('role', 'dialog');
    vak.setAttribute('aria-label', 'Rekenmachine');
    vak.innerHTML = '<div class="rmkop"><b>Rekenmachine</b><button type="button" aria-label="Sluiten">×</button></div>' +
      '<div class="rmscherm"><div class="rmregel"></div><div class="rmuit">0</div></div>' +
      '<div class="rmtoetsen"></div>' +
      '<button class="rmover" type="button" hidden>Neem over</button>';
    document.body.appendChild(vak);

    scherm = vak.querySelector('.rmuit');
    regel = vak.querySelector('.rmregel');
    overBtn = vak.querySelector('.rmover');
    vak.querySelector('.rmkop button').addEventListener('click', dicht);

    var rij = vak.querySelector('.rmtoetsen');
    TOETSEN.forEach(function(t){
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = t[0];
      if (t[1].indexOf('op:') === 0 || t[1] === 'wis' || t[1] === 'terug' || t[1] === 'procent' || t[1] === 'min') b.className = 'werk';
      if (t[1] === 'isgelijk') b.className = 'isgelijk';
      b.addEventListener('click', function(){ doe(t[1] === 'cijfer' ? t[0] : t[1]); });
      rij.appendChild(b);
    });

    overBtn.addEventListener('click', function(){
      if (!naarVeld) return;
      if (bewerking) doe('isgelijk');
      naarVeld.value = nu;
      dicht();
      naarVeld.focus();
    });

    /* Met het toetsenbord werkt hij ook, zolang hij open staat. Typt iemand in
       een invulveld van het spel zelf, dan blijft die toets van het spel; en
       een toets die de rekenmachine oppakt gaat niet ook nog naar de pagina,
       anders kijkt Enter tegelijk het antwoord na. */
    document.addEventListener('keydown', function(e){
      if (vak.hidden) return;
      var doel = e.target;
      if (doel && /^(input|textarea|select)$/i.test(doel.tagName || '')) return;
      var k = e.key;
      function pak(){ e.preventDefault(); e.stopPropagation(); }
      if (k >= '0' && k <= '9'){ doe(k); pak(); }
      else if (k === ',' || k === '.'){ doe('komma'); pak(); }
      else if (k === '+' || k === '-' || k === '*' || k === '/'){ doe('op:' + k); pak(); }
      else if (k === 'Enter' || k === '='){ doe('isgelijk'); pak(); }
      else if (k === 'Backspace'){ doe('terug'); pak(); }
      else if (k === 'Escape'){ dicht(); pak(); }
      else if (k.toLowerCase() === 'c'){ doe('wis'); pak(); }
    }, true);
  }

  function open(){
    bouw();
    vak.hidden = false;
    overBtn.hidden = !naarVeld;
    if (opener) opener.setAttribute('aria-expanded', 'true');
    teken();
  }
  function dicht(){
    if (!vak) return;
    vak.hidden = true;
    if (opener) opener.setAttribute('aria-expanded', 'false');
  }

  /* Een knop op de pagina koppelen. De knop gaat aan en uit. */
  function koppel(knop, o){
    o = o || {};
    naarVeld = o.naar || null;
    opener = knop || null;
    bouw();
    if (!knop) return;
    knop.setAttribute('aria-expanded', 'false');
    knop.addEventListener('click', function(){ if (vak.hidden) open(); else dicht(); });
  }

  return { koppel:koppel, open:open, dicht:dicht };
})();
