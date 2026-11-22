/* Zinsdeelstrepen: de leerling verdeelt zinnen in zinsdelen door er strepen tussen te zetten.

   Op het blad staan de zinnen ruim gezet, zodat er plaats is voor een streep. De docent kiest
   hoe moeilijk de zinnen zijn (of typt eigen zinnen, met een streep | tussen de zinsdelen) en
   wat de leerling doet: alleen strepen zetten, ook de persoonsvorm onderstrepen, ook het
   onderwerp, of alle zinsdelen benoemen. Op het antwoordblad staan de strepen en, als dat
   gevraagd is, de namen eronder.

   Een zin staat hier als 'Mijn broer=ow|speelt=pv|voetbal=lv'. Eindigt hij op ' ?', dan is het
   een vraagzin. De afkortingen staan in NAAM. */
(function(){
  'use strict';
  if (!window.SPELBLAD) return;
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  var SLEUTEL = 'lg-zinsdeel-zinnen';
  function bewaard(){ try { return localStorage.getItem(SLEUTEL) || ''; } catch (e){ return ''; } }
  var NAAM = { pv:'persoonsvorm', ow:'onderwerp', lv:'lijdend voorwerp', mv:'meewerkend voorwerp', bwb:'bijwoordelijke bepaling', wg:'rest van het gezegde', ng:'naamwoordelijk deel', vzv:'voorzetselvoorwerp' };

  var ZINNEN = {
    1:[
      'De hond=ow|blaft=pv|hard=bwb', 'Mijn broer=ow|speelt=pv|voetbal=lv', 'Wij=ow|eten=pv|vanavond=bwb|pizza=lv', 'De juf=ow|leest=pv|een verhaal=lv',
      'Sara=ow|fietst=pv|naar school=bwb', 'Mijn oma=ow|bakt=pv|elke zondag=bwb|een taart=lv', 'De kat=ow|slaapt=pv|op de bank=bwb', 'Ik=ow|koop=pv|een nieuw schrift=lv',
      'De bus=ow|vertrekt=pv|om acht uur=bwb', 'Tom=ow|schrijft=pv|een brief=lv', 'De kinderen=ow|spelen=pv|in de tuin=bwb', 'Mijn vader=ow|wast=pv|de auto=lv',
      'Wij=ow|kijken=pv|een film=lv', 'De bakker=ow|verkoopt=pv|vers brood=lv', 'Het meisje=ow|tekent=pv|een paard=lv', 'Jij=ow|drinkt=pv|elke ochtend=bwb|thee=lv',
      'De trein=ow|rijdt=pv|naar Utrecht=bwb', 'Mijn zus=ow|zoekt=pv|haar sleutels=lv', 'De leerlingen=ow|maken=pv|hun huiswerk=lv', 'Opa=ow|leest=pv|de krant=lv|in de tuin=bwb',
      'De vogel=ow|bouwt=pv|een nest=lv', 'Wij=ow|wonen=pv|in een klein dorp=bwb', 'De keeper=ow|vangt=pv|de bal=lv', 'Mila=ow|zwemt=pv|elke dag=bwb|in het zwembad=bwb',
      'De buurman=ow|maait=pv|het gras=lv', 'Ik=ow|vergeet=pv|vaak=bwb|mijn gymtas=lv', 'De winkel=ow|sluit=pv|om zes uur=bwb', 'Mijn moeder=ow|kookt=pv|vanavond=bwb|soep=lv',
      'De docent=ow|schrijft=pv|de som=lv|op het bord=bwb', 'Het konijn=ow|eet=pv|een wortel=lv'
    ],
    2:[
      'Morgen=bwb|gaan=pv|wij=ow|naar de dierentuin=bwb', 'Gisteren=bwb|kocht=pv|mijn vader=ow|een nieuwe fiets=lv', 'De docent=ow|geeft=pv|de klas=mv|een opdracht=lv',
      'Heb=pv|jij=ow|mijn tas=lv|gezien=wg ?', 'Na de les=bwb|fietsen=pv|we=ow|snel=bwb|naar huis=bwb', 'Oma=ow|vertelt=pv|ons=mv|een spannend verhaal=lv',
      'Ik=ow|heb=pv|gisteren=bwb|een boek=lv|gelezen=wg', 'In de pauze=bwb|eet=pv|Daan=ow|een appel=lv', 'Mijn zus=ow|stuurt=pv|haar vriendin=mv|een kaart=lv',
      'Waarom=bwb|komt=pv|de bus=ow|vandaag=bwb|zo laat=bwb ?', 'De trainer=ow|legt=pv|de spelers=mv|de regels=lv|uit=wg', 'Volgende week=bwb|krijgen=pv|wij=ow|ons rapport=lv',
      'Wij=ow|hebben=pv|in de vakantie=bwb|veel=bwb|gezwommen=wg', 'Loopt=pv|jouw broer=ow|ook=bwb|mee=wg ?', 'De ober=ow|brengt=pv|de gasten=mv|het eten=lv',
      'Elke zaterdag=bwb|helpt=pv|Noor=ow|haar opa=lv|in de tuin=bwb', 'Mijn ouders=ow|hebben=pv|een nieuwe auto=lv|gekocht=wg', 'Vanavond=bwb|kijken=pv|wij=ow|samen=bwb|een film=lv',
      'De burgemeester=ow|geeft=pv|de winnaar=mv|een beker=lv', 'Wanneer=bwb|begint=pv|de voorstelling=ow ?', 'Door de regen=bwb|kwam=pv|ik=ow|te laat=bwb|op school=bwb',
      'Ik=ow|leen=pv|mijn buurman=mv|mijn pen=lv', 'De hond=ow|heeft=pv|de hele nacht=bwb|geblaft=wg', 'In het bos=bwb|zagen=pv|we=ow|een hert=lv',
      'Wil=pv|jij=ow|mij=mv|het zout=lv|geven=wg ?', 'De schilder=ow|verft=pv|vandaag=bwb|de voordeur=lv', 'Mijn tante=ow|heeft=pv|mij=mv|een cadeau=lv|gegeven=wg',
      'Straks=bwb|bel=pv|ik=ow|mijn oma=lv', 'De leerlingen=ow|moeten=pv|morgen=bwb|een toets=lv|maken=wg', 'Op het plein=bwb|voetballen=pv|de jongens=ow|elke middag=bwb'
    ],
    3:[
      'De oude man met de hoed=ow|wacht=pv|al een uur=bwb|op de bus=vzv', 'Mijn nieuwe buurmeisje=ow|is=pv|erg aardig=ng',
      'De directeur van onze school=ow|heeft=pv|gisteren=bwb|alle ouders=mv|een brief=lv|gestuurd=wg', 'Na de lange vakantie=bwb|was=pv|iedereen=ow|weer=bwb|uitgerust=ng',
      'Hij=ow|rekent=pv|op jouw hulp=vzv', 'De leerlingen uit klas twee=ow|verlangen=pv|naar de zomervakantie=vzv', 'Omdat het regende=bwb|bleven=pv|we=ow|binnen=bwb',
      'Mijn broer=ow|wordt=pv|later=bwb|brandweerman=ng', 'De politie=ow|zoekt=pv|sinds vanochtend=bwb|naar de verdwenen fiets=vzv',
      'Het meisje met de rode jas=ow|gaf=pv|de conciërge=mv|de gevonden sleutels=lv', 'Ik=ow|denk=pv|vaak=bwb|aan onze vakantie in Spanje=vzv',
      'De nieuwe leerling=ow|bleek=pv|een heel goede schaker=ng', 'Wie=ow|heeft=pv|de laatste koekjes=lv|opgegeten=wg ?', 'Zodra de bel gaat=bwb|rennen=pv|alle leerlingen=ow|naar buiten=bwb',
      'De burgemeester=ow|overhandigt=pv|de winnaar van de wedstrijd=mv|een grote beker=lv', 'Mijn opa=ow|vertelde=pv|ons=mv|gisteravond=bwb|een verhaal over vroeger=lv',
      'Die toets=ow|was=pv|veel moeilijker dan de vorige=ng', 'Wij=ow|hebben=pv|lang=bwb|op de uitslag=vzv|gewacht=wg', 'De trein naar Groningen=ow|vertrekt=pv|vandaag=bwb|van spoor vijf=bwb',
      'Hij=ow|vertelde=pv|dat hij ziek was=lv', 'In de kelder van het oude huis=bwb|vonden=pv|de kinderen=ow|een kist vol brieven=lv', 'Mijn zus=ow|houdt=pv|van boeken met een spannend einde=vzv',
      'De kok van het restaurant=ow|heeft=pv|vanavond=bwb|een nieuw gerecht=lv|bedacht=wg', 'Volgens de weerman=bwb|blijft=pv|het=ow|de hele week=bwb|droog=ng',
      'De leraar=ow|vroeg=pv|of iedereen klaar was=lv', 'Wie te laat komt=ow|krijgt=pv|een briefje=lv', 'Ondanks de kou=bwb|stonden=pv|honderden fans=ow|urenlang=bwb|voor de ingang=bwb',
      'De jongen die naast mij zit=ow|leent=pv|mij=mv|altijd=bwb|zijn rekenmachine=lv', 'Onze buren=ow|zijn=pv|vorige maand=bwb|naar Friesland=bwb|verhuisd=wg',
      'Tijdens het onweer=bwb|bleef=pv|onze hond=ow|de hele avond=bwb|onder de tafel=bwb'
    ]
  };

  /* een zin lezen: 'Mijn broer=ow|speelt=pv|voetbal=lv ?' geeft { delen:[{ t, n }], eind } */
  function leesZin(s){
    s = String(s || '').replace(/\s+/g, ' ').trim();
    var eind = '.', m = /\s*([.?!])$/.exec(s);
    if (m){ eind = m[1]; s = s.slice(0, m.index); }
    var delen = s.split('|').map(function(d){
      var k = /^(.*?)(?:=\s*([a-z]{2,3}))?$/.exec(d.trim()) || [], t = (k[1] || '').trim(), n = (k[2] || '').toLowerCase();
      return { t:t, n:NAAM[n] ? n : '' };
    }).filter(function(d){ return d.t; });
    return delen.length >= 2 ? { delen:delen, eind:eind } : null;
  }
  function schud(l){ l = l.slice(); for (var i = l.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), x = l[i]; l[i] = l[j]; l[j] = x; } return l; }

  try {
    var st = document.createElement('style');
    st.textContent =
      '.blad > ol.zinsstrepen > li{padding-top:9px;padding-bottom:9px;break-inside:avoid}' +
      '.blad .zs-zin{margin:0;font-size:1.16rem;font-weight:500;line-height:2.1;word-spacing:.62em;letter-spacing:.01em;color:#14224C}' +
      '.blad .zs-ruim .zs-zin{line-height:2.9}' +
      '.blad .zs-lijn{display:block;height:8mm;border-bottom:1px dotted #7a829c;margin:0 0 2mm}' +
      '.blad .zs-goed{word-spacing:normal;line-height:1.5;display:flex;flex-wrap:wrap;align-items:flex-start;gap:4px 0}' +
      '.blad .zs-deel{display:inline-flex;flex-direction:column;align-items:center;padding:0 2px}' +
      '.blad .zs-deel small{font-size:.66rem;font-weight:600;letter-spacing:.03em;color:#204ECF;line-height:1.3}' +
      '.blad .zs-pv > span{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px}' +
      '.blad .zs-ow > span{text-decoration:underline;text-decoration-style:double;text-underline-offset:3px}' +
      '.blad .zs-streep{font-style:normal;font-weight:700;color:#F26749;padding:0 7px}' +
      '.blad .zs-uitleg{border:1.5px solid #14224C;border-radius:12px;padding:10px 14px;margin:12px 0 4px;break-inside:avoid}' +
      '.blad .zs-uitleg h3{margin:0 0 6px;font-size:1rem;font-weight:600;color:#14224C}' +
      '.blad .zs-uitleg ol{margin:0;padding-left:20px;font-size:.88rem;line-height:1.45;display:grid;gap:4px}' +
      '.blad .zs-uitleg .zs-vb{margin:8px 0 0;font-size:.9rem;color:#14224C}' +
      '.blad .zs-uitleg .zs-vb .zs-streep{padding:0 5px}' +
      '.blad .zs-uitleg .zs-proef{margin:2px 0 0;font-size:.84rem;color:#4a5270}' +
      '.blad .zs-afk{margin:8px 0 0;font-size:.8rem;color:#4a5270;line-height:1.5}' +
      '.blad .zs-afk b{color:#204ECF;font-weight:700}' +
      '@media print{.blad .zs-streep,.blad .zs-deel small{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';
    document.head.appendChild(st);
  } catch (e){}

  var ZIN = [['z1', 'Makkelijk: korte zinnen'], ['z2', 'Gemiddeld: ook vraagzinnen en een meewerkend voorwerp'], ['z3', 'Moeilijk: lange zinsdelen en bijzinnen'], ['zmix', 'Door elkaar'], ['zeigen', 'Eigen zinnen']];
  var WAT = [['', 'Alleen strepen zetten'], ['wpv', 'Strepen en de persoonsvorm onderstrepen'], ['wow', 'Strepen, persoonsvorm en onderwerp'], ['wbenoem', 'Strepen en alle zinsdelen benoemen']];
  function kiesUit(lijst, aan, std){ return lijst.filter(function(x){ return x[0] && aan.indexOf(x[0]) >= 0; })[0] || lijst.filter(function(x){ return x[0] === std; })[0]; }
  function rondjes(naam, lijst, gekozen){
    return lijst.map(function(x){ return '<label><input type="radio" name="' + naam + '" value="' + x[0] + '"' + (x === gekozen ? ' checked' : '') + '> ' + x[1] + '</label>'; }).join('');
  }
  var S = '<i class="zs-streep">|</i>';
  var UITLEG = '<div class="zs-uitleg"><h3>Zo zet je zinsdeelstrepen</h3><ol>' +
    '<li><b>Zoek de persoonsvorm.</b> Maak van de zin een vraag. Het werkwoord dat vooraan komt, is de persoonsvorm.</li>' +
    '<li><b>Doe de verplaatsproef.</b> Alles wat samen vóór de persoonsvorm kan staan, is één zinsdeel.</li>' +
    '<li><b>Zet de strepen.</b> Tussen elk zinsdeel komt een streep. De persoonsvorm is altijd een eigen zinsdeel.</li></ol>' +
    '<p class="zs-vb">Voorbeeld: Mijn oma' + S + 'bakt' + S + 'elke zondag' + S + 'een taart.</p>' +
    '<p class="zs-proef">De proef: <b>Elke zondag</b> bakt mijn oma een taart. <b>Een taart</b> bakt mijn oma elke zondag. Het kan, dus het zijn zinsdelen.</p></div>';

  function zinTekst(z){ return schoon(z.delen.map(function(d){ return d.t; }).join(' ') + z.eind); }
  /* welke namen op het antwoordblad staan */
  function toonNaam(wat, n){ return wat === 'wbenoem' ? !!n : wat === 'wow' ? n === 'pv' || n === 'ow' : wat === 'wpv' ? n === 'pv' : false; }
  function goedZin(z, wat){
    return z.delen.map(function(d, i){
      var laatste = i === z.delen.length - 1, n = toonNaam(wat, d.n) ? d.n : '';
      return '<span class="zs-deel' + (n === 'pv' ? ' zs-pv' : n === 'ow' && wat !== 'wbenoem' ? ' zs-ow' : '') + '"><span>' + schoon(d.t) + (laatste ? schoon(z.eind) : '') + '</span>' + (n ? '<small>' + (wat === 'wbenoem' ? n : NAAM[n]) + '</small>' : '') + '</span>';
    }).join(S);
  }

  window.SPELBLAD.zinsdeelstrepen = {
    naam:'Zinsdeelstrepen', kort:'Zinnen in zinsdelen verdelen met strepen, met of zonder benoemen', icoon:'tekst', vak:'ned', eigenNiveau:true,
    aantallen:[5, 8, 10, 12, 15, 20, 25, 30], standaard:10, aantalNaam:'Aantal zinnen',
    delenKop:'De zinnen',
    delenTip:'De leerling zet een streep tussen de zinsdelen. Kies hoe moeilijk de zinnen zijn of typ je eigen zinnen. Op het antwoordblad staan de strepen.',
    delen:function(aan){
      aan = aan || [];
      return '<p class="kop">Welke zinnen</p>' + rondjes('zs-zin', ZIN, kiesUit(ZIN, aan, 'z1')) +
        '<label class="wm-zinveld"><textarea name="zs-zinnen" aria-label="Eigen zinnen, een per regel, met een streep tussen de zinsdelen" placeholder="Mijn broer | speelt | voetbal.\nMorgen | gaan | wij | naar de dierentuin." spellcheck="false">' + schoon(bewaard()) + '</textarea>' +
        '<small>Alleen bij Eigen zinnen: een zin per regel, met een streep | tussen de zinsdelen. De leerling ziet de zin zonder strepen. Wil je de namen op het antwoordblad, zet dan =pv, =ow, =lv, =mv, =bwb, =wg, =ng of =vzv achter een zinsdeel: Mijn broer=ow | speelt=pv | voetbal=lv.</small></label>' +
        '<p class="kop">Wat doet de leerling</p>' + rondjes('zs-wat', WAT, kiesUit(WAT, aan, '') || WAT[0]) +
        '<p class="kop">Extra</p>' +
        '<label><input type="checkbox" name="zs-ruim" value="ruim"' + (aan.indexOf('ruim') >= 0 ? ' checked' : '') + '> Meer ruimte tussen de zinnen</label>' +
        '<label><input type="checkbox" name="zs-kaal" value="kaal"' + (aan.indexOf('kaal') >= 0 ? ' checked' : '') + '> Zonder de uitleg bovenaan</label>';
    },
    lees:function(el){
      function gekozen(naam){ var x = el.querySelector('input[name="' + naam + '"]:checked'); return x ? x.value : ''; }
      var t = el.querySelector('textarea[name="zs-zinnen"]'), tekst = t ? String(t.value).slice(0, 4000) : '';
      try { if (t) localStorage.setItem(SLEUTEL, tekst); } catch (e){}
      return { zin:gekozen('zs-zin') || 'z1', wat:gekozen('zs-wat'), ruim:!!(el.querySelector('input[name="zs-ruim"]') || {}).checked, kaal:!!(el.querySelector('input[name="zs-kaal"]') || {}).checked,
        eigen:tekst.split(/\r?\n/).map(function(r){ return r.trim(); }).filter(Boolean).slice(0, 40) };
    },
    maak:function(keuze, n){
      if (keuze.zin === 'zeigen'){
        var goed = keuze.eigen.map(leesZin).filter(Boolean);
        if (!goed.length) return { fout:'Typ je eigen zinnen, een per regel, met een streep | tussen de zinsdelen. Bijvoorbeeld: Mijn broer | speelt | voetbal.' };
        return goed;
      }
      var bron = keuze.zin === 'z2' ? ZINNEN[2] : keuze.zin === 'z3' ? ZINNEN[3] : keuze.zin === 'zmix' ? ZINNEN[1].concat(ZINNEN[2], ZINNEN[3]) : ZINNEN[1];
      return schud(bron).slice(0, n).map(leesZin).filter(Boolean);
    },
    teken:function(w){
      var k = w.keuze, items = w.items, wat = k.wat || '';
      var doe = wat === 'wbenoem' ? 'Zet een streep tussen de zinsdelen. Schrijf onder elk zinsdeel de afkorting van de naam.'
        : wat === 'wow' ? 'Zet een streep tussen de zinsdelen. Zet een streep onder de persoonsvorm en twee strepen onder het onderwerp.'
        : wat === 'wpv' ? 'Zet een streep tussen de zinsdelen. Zet een streep onder de persoonsvorm.'
        : 'Zet een streep tussen de zinsdelen.';
      var afk = '';
      if (wat === 'wbenoem'){
        var gebruikt = {}; items.forEach(function(z){ z.delen.forEach(function(d){ if (d.n) gebruikt[d.n] = 1; }); });
        var lijst = Object.keys(NAAM).filter(function(n){ return gebruikt[n]; });
        if (!lijst.length) lijst = ['pv', 'ow', 'lv', 'mv', 'bwb'];
        afk = '<p class="zs-afk">' + lijst.map(function(n){ return '<b>' + n + '</b> ' + NAAM[n]; }).join(' · ') + '</p>';
      }
      var namen = { z1:'makkelijk', z2:'gemiddeld', z3:'moeilijk', zmix:'door elkaar', zeigen:'eigen zinnen' };
      return {
        titel:'Zinsdeelstrepen', sub:(namen[k.zin] || 'makkelijk') + ' · ' + items.length + (items.length === 1 ? ' zin' : ' zinnen'), klasse:'zinsstrepen' + (k.ruim ? ' zs-ruim' : ''),
        intro:doe,
        boven:(k.kaal ? '' : UITLEG) + afk,
        vragen:items.map(function(z){ return '<li><p class="zs-zin">' + zinTekst(z) + '</p>' + (wat === 'wbenoem' ? '<span class="zs-lijn"></span>' : '') + '</li>'; }).join(''),
        antwoorden:items.map(function(z){ return '<li><p class="zs-zin zs-goed">' + goedZin(z, wat) + '</p></li>'; }).join('')
      };
    }
  };
})();
