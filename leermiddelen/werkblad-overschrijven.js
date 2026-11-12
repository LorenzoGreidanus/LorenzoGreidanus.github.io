/* Overschrijven: de leerling schrijft een zin een aantal keer over.

   De docent typt de zin en kiest hoe vaak (5 tot 100 keer). Op het blad staat
   de zin bovenaan, daaronder genummerde schrijfregels: een lange zin krijgt
   twee of drie regels per keer. Hoeveel ruimte er is, stelt de docent zelf in:
   het aantal regels per keer (vanzelf, of 1 tot 4) en de hoogte van een regel
   (smal, gewoon, ruim). Het blad hoort bij geen enkel vak (vak 'los',
   onder Zonder vak) en heeft geen tweede blad (enkel): er valt niets na te
   kijken behalve of het er staat.

   De zin staat niet in de link (de onderdelen in het adres zijn losse
   woorden); hij blijft wel op dit apparaat bewaard, zodat je hem niet elke
   keer opnieuw typt. */
(function(){
  'use strict';
  if (!window.SPELBLAD) return;
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  var SLEUTEL = 'lg-overschrijf-zin', STANDAARD = 'Ik lever mijn huiswerk op tijd in.', MAX = 160;
  function bewaard(){ try { return localStorage.getItem(SLEUTEL) || ''; } catch (e){ return ''; } }
  function netjes(t){ return String(t || '').replace(/\s+/g, ' ').trim().slice(0, MAX); }
  /* hoeveel schrijfregels een keer overschrijven nodig heeft: zo'n vijftig letters passen op een regel */
  function regels(zin){ return Math.max(1, Math.min(4, Math.ceil(zin.length / 50))); }

  try {
    var st = document.createElement('style');
    st.textContent =
      '.blad .os-zin{border:1.5px solid #14224C;border-radius:10px;padding:12px 16px;margin:12px 0 6px;break-inside:avoid}' +
      '.blad .os-zin small{display:block;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;font-weight:600;color:#4a5270;margin-bottom:4px}' +
      '.blad .os-zin b{display:block;font-size:1.15rem;font-weight:600;line-height:1.4;color:#14224C;overflow-wrap:anywhere}' +
      '.blad > ol.overschrijven > li{padding-top:2px;padding-bottom:6px;border-bottom:none}' +
      '.blad > ol.overschrijven > li::before{top:9px;background:none;color:#14224C;border:1.5px solid #14224C;width:24px;height:24px;font-size:.74rem}' +
      '.blad .os-regel{display:block;height:10mm;border-bottom:1px solid #14224C}' +
      '.blad .os-hulp .os-regel{height:11mm;background-image:linear-gradient(#b9c0d2,#b9c0d2);background-size:100% 1px;background-repeat:no-repeat;background-position:0 55%}' +
      '.blad .os-slot{margin-top:18px;break-inside:avoid;font-size:.92rem;color:#14224C}' +
      '.blad .os-slot p{margin:0 0 2px;font-weight:500}' +
      '.blad .os-slot .os-regel{height:9mm}' +
      '.blad .os-teken{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:22px;break-inside:avoid;font-size:.84rem;color:#4a5270}' +
      '.blad .os-teken span{display:block;border-top:1px solid #14224C;padding-top:4px;margin-top:14mm}' +
      '.wm-zinveld{display:grid;gap:6px;margin-bottom:10px}' +
      '.wm-zinveld textarea{font:inherit;width:100%;min-height:74px;border:1.5px solid var(--rand2,rgba(20,34,76,.16));border-radius:12px;padding:10px 12px;background:var(--kaart,#fff);color:inherit;resize:vertical}' +
      '.wm-zinveld small{font-size:.8rem;color:var(--muted)}' +
      '@media print{.blad .os-hulp .os-regel{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';
    document.head.appendChild(st);
  } catch (e){}

  var LIJNEN = [['lijn', 'Gewone schrijfregels'], ['hulp', 'Regels met een hulplijn (netjes schrijven)']];
  /* de ruimte: regels per keer ('' is vanzelf, naar de lengte van de zin) en de hoogte van een regel in mm */
  var PERKEER = [['', 'Vanzelf'], ['r1', '1'], ['r2', '2'], ['r3', '3'], ['r4', '4']];
  var HOOGTE = [['smal', 'Smal', 8], ['', 'Gewoon', 10], ['ruim', 'Ruim', 13]];
  function kiesUit(lijst, aan){ return lijst.filter(function(x){ return x[0] && aan.indexOf(x[0]) >= 0; })[0] || lijst.filter(function(x){ return !x[0]; })[0]; }
  function rondjes(naam, lijst, gekozen){
    return lijst.map(function(x){ return '<label><input type="radio" name="' + naam + '" value="' + x[0] + '"' + (x === gekozen ? ' checked' : '') + '> ' + x[1] + '</label>'; }).join('');
  }

  window.SPELBLAD.overschrijven = {
    naam:'Overschrijven', kort:'Een zin een aantal keer overschrijven', icoon:'pen', vak:'los', eigenNiveau:true, zonderAntwoord:true,
    aantallen:[5, 10, 15, 20, 25, 30, 40, 50, 75, 100], standaard:10, aantalNaam:'Aantal keer',
    delenKop:'De zin',
    delenTip:'De leerling schrijft de zin het gekozen aantal keer over, bijvoorbeeld na een gemiste afspraak. Een lange zin krijgt vanzelf meer schrijfregels per keer.',
    delen:function(aan){
      aan = aan || [];
      var lijn = LIJNEN.filter(function(l){ return aan.indexOf(l[0]) >= 0; })[0] || LIJNEN[0];
      return '<label class="wm-zinveld">' +
        '<textarea name="os-zin" aria-label="De zin om over te schrijven" maxlength="' + MAX + '" placeholder="' + schoon(STANDAARD) + '" spellcheck="true">' + schoon(bewaard()) + '</textarea>' +
        '<small>Hoogstens ' + MAX + ' tekens. Laat je het leeg, dan staat er een voorbeeldzin.</small></label>' +
        '<p class="kop">Schrijfregels</p>' + LIJNEN.map(function(l){
          return '<label><input type="radio" name="os-lijn" value="' + l[0] + '"' + (l === lijn ? ' checked' : '') + '> ' + l[1] + '</label>';
        }).join('') +
        '<p class="kop">Regels per keer</p>' + rondjes('os-per', PERKEER, kiesUit(PERKEER, aan)) +
        '<p class="kop">Hoogte van een regel</p>' + rondjes('os-hoog', HOOGTE, kiesUit(HOOGTE, aan)) +
        '<p class="kop">Onderaan</p>' +
        '<label><input type="checkbox" name="os-vraag" value="vraag"' + (aan.indexOf('vraag') >= 0 ? ' checked' : '') + '> De vraag: wat doe je de volgende keer anders?</label>' +
        '<label><input type="checkbox" name="os-teken" value="teken"' + (aan.indexOf('teken') >= 0 ? ' checked' : '') + '> Ruimte voor een handtekening van leerling en ouder of verzorger</label>';
    },
    lees:function(el){
      var z = el.querySelector('textarea[name="os-zin"]'), l = el.querySelector('input[name="os-lijn"]:checked');
      var zin = netjes(z ? z.value : '');
      try { if (z) localStorage.setItem(SLEUTEL, zin); } catch (e){}
      var per = el.querySelector('input[name="os-per"]:checked'), hoog = el.querySelector('input[name="os-hoog"]:checked');
      return { zin:zin || STANDAARD, lijn:l ? l.value : 'lijn', per:per ? Number(per.value.slice(1)) || 0 : 0, hoog:(kiesUit(HOOGTE, [hoog ? hoog.value : '']) || HOOGTE[1])[2],
        vraag:!!(el.querySelector('input[name="os-vraag"]') || {}).checked, teken:!!(el.querySelector('input[name="os-teken"]') || {}).checked };
    },
    maak:function(keuze, n){
      var uit = [];
      for (var i = 0; i < n; i++) uit.push({ nr:i + 1 });
      return uit;
    },
    teken:function(w){
      var k = w.keuze, n = w.items.length, r = k.per || regels(k.zin), regel = '';
      for (var i = 0; i < r; i++) regel += '<span class="os-regel"></span>';
      var slot = (k.vraag ? '<div class="os-slot"><p>Wat doe je de volgende keer anders?</p><span class="os-regel"></span><span class="os-regel"></span><span class="os-regel"></span></div>' : '') +
        (k.teken ? '<div class="os-teken"><span>Handtekening leerling</span><span>Handtekening ouder of verzorger</span></div>' : '');
      return {
        titel:'Overschrijven', sub:n + ' keer', klasse:'overschrijven' + (k.lijn === 'hulp' ? ' os-hulp' : ''), enkel:true,
        /* de hoogte van een regel: een eigen stijlregel bij het blad, zodat hij ook in een kopie van het blad meegaat */
        boven:(k.hoog && k.hoog !== 10 ? '<style>.blad > ol.overschrijven .os-regel{height:' + k.hoog + 'mm}</style>' : '') + '<div class="os-zin"><small>Schrijf deze zin ' + n + ' keer netjes over</small><b>' + schoon(k.zin) + '</b></div>',
        /* het slot hoort onder de laatste regel: het zit in de laatste opgave, zodat het niet los op een nieuwe bladzijde komt */
        vragen:w.items.map(function(it, j){ return '<li>' + regel + (j === n - 1 ? slot : '') + '</li>'; }).join(''),
        antwoorden:''
      };
    }
  };
})();
