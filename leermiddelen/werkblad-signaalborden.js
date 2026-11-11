/* Signaalwoorden als verkeersborden: een werkblad bij Nederlands.

   Een signaalwoord doet in een tekst wat een bord langs de weg doet: het
   vertelt wat eraan komt. Rechtdoor (er komt meer bij), keren (nu het
   tegenovergestelde), let op (het een zorgt voor het ander), enzovoort.
   Bovenaan het blad staat de bordenkaart: acht borden, elk met zijn verband
   en de woorden die erbij horen. Daaronder twee soorten opgaven:
     bord   in de zin staat het signaalwoord vet: welk bord hoort erbij?
     woord  het bord staat erbij: welk van de drie woorden past in de zin?
   De borden zijn zelf getekend in de merkkleuren (geen echte borden uit het
   reglement) en hebben vaste kleuren, want ze staan op wit papier. */
(function(){
  'use strict';
  if (!window.SPELBLAD) return;
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }

  var BLAUW = '#204ECF', ROOD = '#F26749', INKT = '#14224C', GEEL = '#EA9836';
  function svg(binnen, naam){ return '<svg class="sb-bord" viewBox="0 0 48 48" role="img" aria-label="' + schoon(naam) + '">' + binnen + '</svg>'; }
  var W = 'fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
  /* id, letter, verband, wat het bord zegt, de woorden, de tekening */
  var BORDEN = [
    { id:'opsomming', naam:'Opsomming', bord:'Rechtdoor', zegt:'Ga door: er komt nog iets bij.', woorden:'en, ook, bovendien, daarnaast, verder, ten eerste',
      t:'<circle cx="24" cy="24" r="22" fill="' + BLAUW + '"/><path d="M24 37V12M14 21l10-10 10 10" ' + W + '/>' },
    { id:'tegenstelling', naam:'Tegenstelling', bord:'Keren', zegt:'De tekst keert om: nu komt het tegenovergestelde.', woorden:'maar, echter, toch, daarentegen, hoewel, desondanks',
      t:'<circle cx="24" cy="24" r="22" fill="' + BLAUW + '"/><path d="M31 37V20a7 7 0 0 0-14 0v10M10 24l7 7 7-7" ' + W + '/>' },
    { id:'oorzaak', naam:'Oorzaak en gevolg', bord:'Let op', zegt:'Let op: het een zorgt voor het ander.', woorden:'omdat, want, doordat, daardoor, waardoor, daarom',
      t:'<path d="M24 4 45 42H3Z" fill="#fff" stroke="' + ROOD + '" stroke-width="4" stroke-linejoin="round"/><circle cx="15" cy="33" r="3.2" fill="' + INKT + '"/><path d="M20 33h11M27 28.5l5 4.5-5 4.5" fill="none" stroke="' + INKT + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' },
    { id:'voorbeeld', naam:'Voorbeeld', bord:'Informatie', zegt:'Hier krijg je een voorbeeld bij wat er net stond.', woorden:'bijvoorbeeld, zoals, onder andere, een voorbeeld hiervan is',
      t:'<rect x="3" y="3" width="42" height="42" rx="7" fill="' + BLAUW + '"/><circle cx="24" cy="13.5" r="3.4" fill="#fff"/><path d="M24 22v15" ' + W + '/>' },
    { id:'tijd', naam:'Tijd en volgorde', bord:'Route', zegt:'Volg de route: eerst dit, dan dat.', woorden:'eerst, daarna, toen, vervolgens, voordat, nadat',
      t:'<rect x="3" y="9" width="42" height="30" rx="6" fill="' + BLAUW + '"/><text x="24" y="30.5" text-anchor="middle" font-family="Poppins,Arial,sans-serif" font-weight="600" font-size="15" fill="#fff">1 2 3</text>' },
    { id:'voorwaarde', naam:'Voorwaarde', bord:'Voorrang verlenen', zegt:'Het mag of gebeurt alleen als iets anders eerst klopt.', woorden:'als, mits, tenzij, indien, op voorwaarde dat',
      t:'<path d="M4 6h40L24 43Z" fill="#fff" stroke="' + ROOD + '" stroke-width="4" stroke-linejoin="round"/><text x="24" y="23" text-anchor="middle" font-family="Poppins,Arial,sans-serif" font-weight="600" font-size="10.5" fill="' + INKT + '">als</text>' },
    { id:'conclusie', naam:'Conclusie', bord:'Einde', zegt:'Einde van de uitleg: dit is de slotsom.', woorden:'dus, kortom, al met al, samengevat, daaruit blijkt',
      t:'<circle cx="24" cy="24" r="21" fill="#fff" stroke="' + INKT + '" stroke-width="3"/><path d="M11 33 33 11M15 37 37 15M13 35 35 13" fill="none" stroke="' + INKT + '" stroke-width="1.8" stroke-linecap="round"/>' },
    { id:'vergelijking', naam:'Vergelijking', bord:'Twee banen', zegt:'Twee dingen lopen naast elkaar: ze lijken op elkaar.', woorden:'net als, evenals, net zoals, even ... als, vergeleken met',
      t:'<rect x="3" y="3" width="42" height="42" rx="7" fill="' + GEEL + '"/><path d="M16 37V13M10 19l6-6 6 6M32 37V13M26 19l6-6 6 6" fill="none" stroke="' + INKT + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' }
  ];
  var LETTERS = 'ABCDEFGH';
  BORDEN.forEach(function(b, i){ b.letter = LETTERS.charAt(i); b.svg = svg(b.t, 'Bord ' + b.letter + ': ' + b.bord); });
  function bordVan(id){ return BORDEN.filter(function(b){ return b.id === id; })[0]; }

  /* verband, de zin met {w} op de plek van het signaalwoord, het woord, twee woorden die niet passen */
  var ZINNEN = [
    ['opsomming', 'Fietsen is goedkoop. {w} is het goed voor je conditie.', 'Bovendien', ['Toch', 'Bijvoorbeeld']],
    ['opsomming', 'In de kantine koop je broodjes, fruit {w} soep.', 'en', ['maar', 'dus']],
    ['opsomming', 'Mila zit op hockey. Ze speelt {w} gitaar in een bandje.', 'ook', ['echter', 'dus']],
    ['opsomming', 'De school krijgt nieuwe laptops. {w} wordt het plein opgeknapt.', 'Daarnaast', ['Daardoor', 'Kortom']],
    ['opsomming', 'Er zijn drie redenen om te gaan stemmen. {w} bepaal je zo mee wie het land bestuurt.', 'Ten eerste', ['Toch', 'Daarentegen']],
    ['opsomming', 'Je levert je verslag in. {w} lever je de bronnenlijst in.', 'Verder', ['Maar', 'Hoewel']],
    ['tegenstelling', 'Het regende de hele dag, {w} de wedstrijd ging gewoon door.', 'maar', ['want', 'dus']],
    ['tegenstelling', 'Sem had hard geleerd. {w} haalde hij een onvoldoende.', 'Toch', ['Daardoor', 'Bovendien']],
    ['tegenstelling', 'Veel mensen vinden vliegen handig. Het is {w} slecht voor het klimaat.', 'echter', ['bijvoorbeeld', 'dus']],
    ['tegenstelling', 'Mijn zus houdt van drukte. Ik ben {w} graag alleen.', 'daarentegen', ['daardoor', 'ook']],
    ['tegenstelling', '{w} het koud was, liep Noor zonder jas naar school.', 'Hoewel', ['Omdat', 'Als']],
    ['tegenstelling', 'De film kreeg slechte recensies. {w} zat de zaal elke avond vol.', 'Desondanks', ['Daardoor', 'Kortom']],
    ['oorzaak', 'De trein viel uit, {w} Yara te laat op school kwam.', 'waardoor', ['hoewel', 'tenzij']],
    ['oorzaak', 'Ik neem een paraplu mee, {w} het gaat vanmiddag regenen.', 'want', ['maar', 'dus']],
    ['oorzaak', '{w} het hard had gevroren, lag er ijs op de sloot.', 'Doordat', ['Hoewel', 'Tenzij']],
    ['oorzaak', 'Het had dagen niet geregend. {w} stond het gras er dor bij.', 'Daardoor', ['Toch', 'Bijvoorbeeld']],
    ['oorzaak', 'Daan blijft thuis, {w} hij koorts heeft.', 'omdat', ['hoewel', 'mits']],
    ['oorzaak', 'De winkel had te weinig klanten. {w} moest hij sluiten.', 'Daarom', ['Toch', 'Bovendien']],
    ['voorbeeld', 'Sommige dieren houden een winterslaap, {w} de egel.', 'bijvoorbeeld', ['daardoor', 'tenzij']],
    ['voorbeeld', 'In Zuid-Europese landen, {w} Spanje en Italië, is het in de zomer erg warm.', 'zoals', ['maar', 'dus']],
    ['voorbeeld', 'Op het schoolfeest was er van alles te doen, {w} karaoke en een quiz.', 'onder andere', ['daardoor', 'hoewel']],
    ['voorbeeld', 'Kleine dingen helpen het milieu. {w} je eigen tas meenemen naar de winkel.', 'Een voorbeeld hiervan is', ['Het gevolg hiervan is', 'De conclusie is']],
    ['voorbeeld', 'In veel beroepen moet je goed kunnen rekenen. Een timmerman moet {w} elke dag meten.', 'bijvoorbeeld', ['echter', 'kortom']],
    ['voorbeeld', 'Sommige stoffen lossen op in water, {w} suiker en zout.', 'zoals', ['want', 'tenzij']],
    ['tijd', '{w} was je je handen, daarna snijd je de groente.', 'Eerst', ['Hoewel', 'Dus']],
    ['tijd', 'We aten bij oma. {w} gingen we met de trein naar huis.', 'Daarna', ['Bijvoorbeeld', 'Tenzij']],
    ['tijd', '{w} je de straat oversteekt, kijk je goed naar links en naar rechts.', 'Voordat', ['Doordat', 'Hoewel']],
    ['tijd', '{w} de bel was gegaan, liep de klas naar buiten.', 'Nadat', ['Tenzij', 'Zoals']],
    ['tijd', 'Meng de bloem met de melk. Voeg {w} de eieren toe.', 'vervolgens', ['echter', 'bijvoorbeeld']],
    ['tijd', 'Ze trainden maanden voor de finale. {w} was het eindelijk zover.', 'Toen', ['Tenzij', 'Zoals']],
    ['voorwaarde', '{w} het morgen vriest, strooit de gemeente zout op de weg.', 'Als', ['Hoewel', 'Zoals']],
    ['voorwaarde', 'Je mag mee op kamp, {w} je ouders het formulier hebben getekend.', 'mits', ['maar', 'want']],
    ['voorwaarde', 'De wedstrijd gaat door, {w} het veld onder water staat.', 'tenzij', ['omdat', 'zoals']],
    ['voorwaarde', '{w} je de toets wilt herkansen, meld je je aan bij je mentor.', 'Indien', ['Doordat', 'Hoewel']],
    ['voorwaarde', 'Je krijgt je geld terug, {w} je de bon nog hebt.', 'op voorwaarde dat', ['ondanks dat', 'net als']],
    ['voorwaarde', '{w} je geen helm draagt, mag je niet meedoen met de les.', 'Als', ['Hoewel', 'Nadat']],
    ['conclusie', 'Het licht is uit en de fietsen zijn weg. Er is {w} niemand thuis.', 'dus', ['bijvoorbeeld', 'echter']],
    ['conclusie', 'De bus is duur, komt vaak te laat en zit vol. {w}: ik ga voortaan op de fiets.', 'Kortom', ['Bijvoorbeeld', 'Tenzij']],
    ['conclusie', 'Alle proeven gaven dezelfde uitkomst. {w} dat de stof oplost in water.', 'Daaruit blijkt', ['Daarentegen', 'Zoals']],
    ['conclusie', 'We hebben de voordelen en de nadelen bekeken. {w} is het plan goed voor de buurt.', 'Al met al', ['Bijvoorbeeld', 'Voordat']],
    ['conclusie', 'Zij traint elke dag, eet gezond en slaapt genoeg. {w}: ze doet er alles aan om te winnen.', 'Samengevat', ['Daarentegen', 'Tenzij']],
    ['conclusie', 'De sporen lopen naar de schuur en de deur staat open. De dief is {w} daar naar binnen gegaan.', 'dus', ['toch', 'ook']],
    ['vergelijking', '{w} zijn vader wil Bram later kok worden.', 'Net als', ['Tenzij', 'Doordat']],
    ['vergelijking', 'Een vleermuis vindt zijn weg met geluid, {w} een dolfijn.', 'evenals', ['tenzij', 'dus']],
    ['vergelijking', 'De nieuwe telefoon is {w} duur als de oude.', 'even', ['toch', 'dus']],
    ['vergelijking', '{w} vorig jaar valt er dit jaar veel minder regen.', 'Vergeleken met', ['Doordat', 'Tenzij']],
    ['vergelijking', 'Zij zingt {w} haar moeder vroeger zong: helder en zuiver.', 'net zoals', ['omdat', 'tenzij']],
    ['vergelijking', 'Een hart werkt {w} een pomp: het duwt het bloed door je lichaam.', 'net als', ['omdat', 'tenzij']]
  ];

  try {
    var st = document.createElement('style');
    st.textContent =
      '.blad .sb-bord{width:44px;height:44px;flex:none;display:block}' +
      '.blad .sb-kaart{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 18px;border:1.5px solid #14224C;border-radius:10px;padding:12px 14px;margin:12px 0 4px;break-inside:avoid}' +
      '.blad .sb-kaart > p{grid-column:1/-1;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;font-weight:600;color:#14224C;margin:0}' +
      '.blad .sb-rij{display:flex;gap:10px;align-items:flex-start;min-width:0}' +
      '.blad .sb-rij .sb-bord{width:38px;height:38px}' +
      '.blad .sb-rij b{display:block;font-size:.86rem;font-weight:600;line-height:1.25}' +
      '.blad .sb-rij b i{font-style:normal;display:inline-block;min-width:1.2em}' +
      '.blad .sb-rij small{display:block;font-size:.76rem;line-height:1.35;color:#4a5270}' +
      '.blad .sb-rij em{display:block;font-size:.78rem;line-height:1.35;font-style:italic;color:#14224C}' +
      '.blad ol.signaalborden .sb-zin{font-weight:500}' +
      '.blad ol.signaalborden .sb-zin b{font-weight:600;text-decoration:underline;text-underline-offset:3px}' +
      '.blad ol.signaalborden .sb-gat{display:inline-block;min-width:110px;border-bottom:1.5px solid #14224C;height:1.1em;vertical-align:baseline}' +
      '.blad ol.signaalborden .sb-met{display:flex;gap:12px;align-items:flex-start}' +
      '.blad ol.signaalborden .sb-met > div{min-width:0;flex:1}' +
      '.blad ol.signaalborden .sb-doe{display:flex;flex-wrap:wrap;gap:6px 22px;align-items:flex-end;margin-top:8px;font-size:.9rem;color:#4a5270}' +
      '.blad ol.signaalborden .sb-doe i{display:inline-block;width:46px;border-bottom:1.5px solid #14224C;height:1.2em;margin-left:6px}' +
      '.blad ol.signaalborden .sb-doe i.lang{width:170px}' +
      '.blad ol.signaalborden .sb-kies{display:flex;flex-wrap:wrap;gap:6px 10px;margin-top:8px;font-size:.9rem}' +
      '.blad ol.signaalborden .sb-kies span{border:1.5px solid #14224C;border-radius:999px;padding:2px 12px}' +
      '.blad ol.antw.signaalborden .sb-ant{display:flex;gap:10px;align-items:center}' +
      '.blad ol.antw.signaalborden .sb-ant .sb-bord{width:30px;height:30px}' +
      '@media(max-width:560px){.blad .sb-kaart{grid-template-columns:1fr}}' +
      '@media print{.blad .sb-bord,.blad .sb-kaart{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';
    document.head.appendChild(st);
  } catch (e){}

  var SOORTEN = [['mix', 'Door elkaar'], ['bord', 'Welk bord hoort erbij?'], ['woord', 'Welk woord past bij het bord?']];
  function schud(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  /* het woord in de zin: klein midden in de zin, met een hoofdletter aan het begin */
  function zinMet(z, binnen){ return schoon(z).replace('{w}', binnen); }
  function kaart(){
    return '<div class="sb-kaart"><p>De bordenkaart: een signaalwoord is een bord in de tekst</p>' + BORDEN.map(function(b){
      return '<div class="sb-rij">' + b.svg + '<div><b><i>' + b.letter + '</i> ' + schoon(b.naam) + '</b><small>' + schoon(b.zegt) + '</small><em>' + schoon(b.woorden) + '</em></div></div>';
    }).join('') + '</div>';
  }

  window.SPELBLAD.signaalborden = {
    naam:'Signaalwoorden als verkeersborden', kort:'Elk verband een bord: rechtdoor, keren, let op', icoon:'pijl', vak:'ned', eigenNiveau:true,
    aantallen:[8, 12, 16, 20, 24], standaard:12, aantalNaam:'Aantal zinnen',
    delenKop:'Wat staat erop',
    delenTip:'Een signaalwoord werkt als een verkeersbord: het zegt wat er in de tekst aankomt. Bovenaan staat de bordenkaart met acht borden en hun signaalwoorden. De leerling zoekt bij elke zin het bord, of kiest het woord dat bij het bord past.',
    delen:function(aan){
      aan = aan || [];
      var soort = SOORTEN.filter(function(s){ return aan.indexOf(s[0]) >= 0; })[0] || SOORTEN[0];
      return '<p class="kop">Opgaven</p>' + SOORTEN.map(function(s){
        return '<label><input type="radio" name="sb-soort" value="' + s[0] + '"' + (s === soort ? ' checked' : '') + '> ' + s[1] + '</label>';
      }).join('') +
        '<p class="kop">Hulp</p><label><input type="checkbox" name="sb-kaal" value="kaal"' + (aan.indexOf('kaal') >= 0 ? ' checked' : '') + '> Zonder de bordenkaart bovenaan (als toets)</label>';
    },
    lees:function(el){
      var s = el.querySelector('input[name="sb-soort"]:checked'), kaal = el.querySelector('input[name="sb-kaal"]');
      return { soort:s ? s.value : 'mix', kaart:!(kaal && kaal.checked) };
    },
    maak:function(keuze, n){
      /* eerlijk over de acht borden: per ronde van elk bord een zin */
      var per = {}; BORDEN.forEach(function(b){ per[b.id] = schud(ZINNEN.filter(function(z){ return z[0] === b.id; })); });
      var uit = [];
      while (uit.length < n){
        var ronde = schud(BORDEN).map(function(b){ return per[b.id].pop(); }).filter(Boolean);
        if (!ronde.length) break;
        uit = uit.concat(ronde);
      }
      uit = uit.slice(0, n);
      return uit.map(function(z, i){
        var soort = keuze.soort === 'mix' ? (i % 2 ? 'woord' : 'bord') : keuze.soort;
        return { soort:soort, bord:z[0], zin:z[1], woord:z[2], kies:schud([z[2]].concat(z[3])) };
      });
    },
    teken:function(w){
      var k = w.keuze;
      var vragen = w.items.map(function(it){
        var b = bordVan(it.bord);
        if (it.soort === 'bord'){
          return '<li><span class="vr sb-zin">' + zinMet(it.zin, '<b>' + schoon(it.woord) + '</b>') + '</span>' +
            '<div class="sb-doe"><span>Bord bij het onderstreepte woord:<i></i></span><span>Verband:<i class="lang"></i></span></div></li>';
        }
        return '<li><div class="sb-met">' + b.svg + '<div><span class="vr sb-zin">' + zinMet(it.zin, '<span class="sb-gat"></span>') + '</span>' +
          '<div class="sb-kies">' + it.kies.map(function(x){ return '<span>' + schoon(x) + '</span>'; }).join('') + '</div></div></div></li>';
      }).join('');
      var antwoorden = w.items.map(function(it){
        var b = bordVan(it.bord);
        return '<li><div class="sb-ant">' + b.svg + '<div><span class="goed">' + (it.soort === 'bord' ? b.letter + ' · ' + schoon(b.naam.toLowerCase()) : schoon(it.woord)) + '</span>' +
          (w.uitleg !== false ? '<small>' + (it.soort === 'bord' ? 'Het woord ' + schoon(it.woord.toLowerCase()) + ' hoort bij bord ' + b.letter + '. ' : 'Bord ' + b.letter + ': ' + schoon(b.naam.toLowerCase()) + '. ') + schoon(b.zegt) + '</small>' : '') + '</div></div></li>';
      }).join('');
      return {
        titel:'Signaalwoorden als verkeersborden', sub:'Nederlands · ' + w.items.length + ' zinnen',
        klasse:'signaalborden', vragen:vragen, antwoorden:antwoorden,
        intro:k.kaart ? 'Een signaalwoord is een bord in de tekst: het vertelt wat eraan komt. Gebruik de bordenkaart.' : 'Een signaalwoord is een bord in de tekst: het vertelt wat eraan komt.',
        boven:(k.kaart ? kaart() : '') + (w.items.some(function(it){ return it.soort === 'woord'; }) ? '<p class="bladintro">Staat er een bord voor de zin? Omcirkel dan het woord dat bij het bord past en schrijf het op de streep.</p>' : '')
      };
    }
  };
})();
