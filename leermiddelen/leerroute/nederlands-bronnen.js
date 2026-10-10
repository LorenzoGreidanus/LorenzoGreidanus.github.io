/* De leerroute Nederlands: bronnen en informatie.
   Betrouwbare bronnen (maker, datum, soort bron, belang, checken, kiezen), misleiding herkennen
   (clickbait, foto's, nepsites, reclame als nieuws, framing, bronnen vergelijken), informatie zoeken
   (zoekwoorden, inhoudsopgave, register, dienstregeling, tabel, infographic, instructie, formulier)
   en informatie verwerken (citeren, parafraseren, bronvermelding, plagiaat, aantekeningen, schema's,
   twee bronnen samenvoegen). Alle bronnen, sites, accounts en merken zijn verzonnen.
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';

  /* ---------- hulpjes ---------- */
  function q(w){ return '‘' + w + '’'; }
  function hoofd(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
  /* een keuzestap: goed en de foute opties, gehusseld; extra: { fout:{}, waarom } */
  function K(R, t, goed, fout, hint, extra){
    var lijst = [goed], gezien = {}; gezien[String(goed).toLowerCase()] = 1;
    fout.forEach(function(f){ if (f == null) return; var k = String(f).toLowerCase(); if (!gezien[k]){ gezien[k] = 1; lijst.push(f); } });
    var opties = R.hussel(lijst);
    var s = { tekst:t, opties:opties, goed:opties.indexOf(goed), hint:hint };
    if (extra){
      if (extra.waarom) s.waarom = extra.waarom;
      if (extra.fout){ s.fout = {}; for (var k in extra.fout) s.fout[k.toLowerCase()] = extra.fout[k]; }
    }
    return s;
  }
  /* een keuzestap met vaste volgorde (bron A, B, C of ja/nee) */
  function V(t, opties, goed, hint, extra){
    var s = { tekst:t, opties:opties.slice(), goed:typeof goed === 'number' ? goed : opties.indexOf(goed), hint:hint };
    if (extra){
      if (extra.waarom) s.waarom = extra.waarom;
      if (extra.fout){ s.fout = {}; for (var k in extra.fout) s.fout[k.toLowerCase()] = extra.fout[k]; }
    }
    return s;
  }
  /* de opgave: is de laatste stap een keuze, dan is dat ook de vraag bij Zelf */
  function OP(vraag, context, stappen){
    var l = stappen[stappen.length - 1], o = { vraag:vraag, context:context, stappen:stappen };
    if (l.opties){ o.opties = l.opties; o.goed = l.goed; }
    return o;
  }
  /* n dingen uit een lijst, niet die in 'niet' */
  function ander(R, lijst, niet, n){
    niet = [].concat(niet); var uit = [];
    R.hussel(lijst).forEach(function(x){ if (uit.length < n && niet.indexOf(x) < 0 && uit.indexOf(x) < 0) uit.push(x); });
    return uit;
  }
  function fouten(paren){ var f = {}; for (var i = 0; i < paren.length; i += 2) if (paren[i] != null) f[paren[i]] = paren[i + 1]; return f; }
  var LETTERS = ['A', 'B', 'C', 'D'];
  var BRONLET = ['bron A', 'bron B', 'bron C'];
  var GRIJS = 'font-size:.86rem;color:var(--muted)';
  var KAART = 'font-size:1rem;font-weight:400;letter-spacing:0;margin:10px auto;border:1px solid var(--rand2)';
  /* een bron als kaartje: { kop, url, datum, label, tekst (lijst of tekst), door, onder, naam (Bron A) } */
  function bron(o){
    var s = '<div class="lr-tekst" style="' + KAART + '">';
    if (o.naam) s += '<p style="margin:0 0 4px;font-weight:700;color:var(--lr-2)">' + o.naam + '</p>';
    if (o.label) s += '<p style="margin:0 0 6px"><span style="display:inline-block;font-size:.74rem;font-weight:700;letter-spacing:.06em;padding:1px 9px;border-radius:999px;border:1.5px solid var(--muted);color:var(--muted)">' + o.label + '</span></p>';
    if (o.url || o.datum) s += '<p style="margin:0 0 4px;' + GRIJS + '">' + [o.url, o.datum].filter(Boolean).join(' · ') + '</p>';
    if (o.kop) s += '<p style="margin:0 0 6px;font-weight:700;font-size:1.08rem">' + o.kop + '</p>';
    [].concat(o.tekst || []).forEach(function(p){ s += '<p>' + p + '</p>'; });
    if (o.door) s += '<p style="margin:0;' + GRIJS + '">Door: ' + o.door + '</p>';
    if (o.onder) s += '<p style="margin:0;' + GRIJS + '">' + o.onder + '</p>';
    return s + '</div>';
  }
  /* een gewoon tekstblok */
  function blok(delen){ return '<div class="lr-tekst" style="' + KAART + '">' + [].concat(delen).map(function(p){ return '<p>' + p + '</p>'; }).join('') + '</div>'; }
  /* een tabel: kop (lijst), rijen (lijsten); de eerste kolom is vet */
  function tabel(kop, rijen, titel){
    var td = 'padding:5px 10px;border-bottom:1px solid var(--rand2);text-align:left;white-space:nowrap';
    var s = '<div class="lr-tekst" style="' + KAART + ';overflow-x:auto">' + (titel ? '<p style="margin:0 0 6px;font-weight:700">' + titel + '</p>' : '') +
      '<table style="border-collapse:collapse;font-variant-numeric:tabular-nums;font-size:.95rem;margin:0 auto">';
    if (kop) s += '<tr>' + kop.map(function(k){ return '<th style="' + td + ';color:var(--lr-2)">' + k + '</th>'; }).join('') + '</tr>';
    rijen.forEach(function(r){ s += '<tr>' + r.map(function(c, i){ return '<td style="' + td + (i === 0 ? ';font-weight:600' : '') + '">' + c + '</td>'; }).join('') + '</tr>'; });
    return s + '</table></div>';
  }
  var MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  /* een datum in dat jaar; in het huidige jaar nooit later dan vandaag */
  function datum(R, jaar){
    var nu = new Date(), m = R.heel(0, jaar >= nu.getFullYear() ? nu.getMonth() : 11);
    var d = R.heel(1, jaar >= nu.getFullYear() && m === nu.getMonth() ? Math.max(1, Math.min(28, nu.getDate())) : 28);
    return d + ' ' + MAANDEN[m] + ' ' + jaar;
  }

  /* ================= 1 BETROUWBARE BRONNEN ================= */

  /* --- wie is de maker --- */
  var MSOORT = {
    expert:{ wie:'een deskundige op dit onderwerp', oordeel:'ja, de maker weet hier veel van' },
    verkoper:{ wie:'een bedrijf dat iets wil verkopen', oordeel:'pas op, de maker wil iets verkopen' },
    anoniem:{ wie:'een onbekend account zonder echte naam', oordeel:'nee, je weet niet wie het gemaakt heeft' },
    bekend:{ wie:'een bekend persoon, maar geen deskundige', oordeel:'pas op, de maker weet hier niet meer van dan jij' }
  };
  var MHINT = {
    expert:'Kijk naar het beroep van de maker. Heeft dat werk met het onderwerp te maken?',
    verkoper:'De maker is een winkel of een merk. En in de tekst staat een aanbieding.',
    anoniem:'Staat er een echte naam bij? Een account met een bijnaam en cijfers is onbekend.',
    bekend:'De maker is bekend, maar van iets heel anders. Heeft zijn werk met dit onderwerp te maken?'
  };
  /* [soort, door, kop, tekst] */
  var MAKER = [
    ['expert', 'dr. Ilse Meijer, sportarts', 'Waarom je spieren pijn doen na het sporten', 'Spierpijn ontstaat door kleine scheurtjes in je spieren. Na een paar dagen zijn die hersteld. Rustig bewegen helpt om sneller op te knappen.'],
    ['expert', 'prof. Joost Hendriks, bijenonderzoeker aan de universiteit', 'Hoe bijen de weg naar huis vinden', 'Bijen onthouden waar de zon staat. Daarmee vinden ze de weg terug naar hun kast, ook als die kilometers ver weg is.'],
    ['expert', 'dr. Nadia El Amrani, slaaponderzoeker', 'Hoeveel slaap heb jij nodig?', 'Tieners hebben acht tot tien uur slaap per nacht nodig. Wie te weinig slaapt, kan zich op school slechter concentreren.'],
    ['expert', 'Kees Dijkstra, weerkundige bij het weerinstituut', 'Zo ontstaat onweer', 'Onweer ontstaat als warme, vochtige lucht snel opstijgt. In de wolk bouwt zich elektrische spanning op. Die ontlaadt zich als bliksem.'],
    ['expert', 'Femke Bos, tandarts', 'Hoe vaak moet je je tanden poetsen?', 'Poets twee keer per dag, twee minuten lang. Gebruik tandpasta met fluoride. Dat beschermt je tanden tegen gaatjes.'],
    ['expert', 'Sander Kok, dierenarts', 'Mag een hond chocola eten?', 'Nee. In chocola zit een stof die giftig is voor honden. Een hond kan er erg ziek van worden.'],
    ['verkoper', 'TopFitShop, webwinkel in sportvoeding', 'Waarom je elke dag een eiwitshake nodig hebt', 'Zonder extra eiwitten groeien je spieren niet. Bestel nu onze TopFit-shake met 20% korting!'],
    ['verkoper', 'GlowPure, merk van huidcrème', 'Het geheim van een gave huid', 'Puistjes? Dat ligt aan je crème. Met GlowPure is je huid in drie dagen gaaf. Nu voor maar € 14,99.'],
    ['verkoper', 'DroomBed, winkel in matrassen', 'Zo slaap je eindelijk goed', 'Slecht slapen ligt bijna altijd aan je matras. Op een DroomBed Deluxe slaap je als een roos. Vandaag besteld, morgen in huis.'],
    ['verkoper', 'PixelPlay, maker van spelcomputers', 'Gamen maakt je slimmer', 'Elke dag gamen traint je hersenen. Met de nieuwe PixelPlay 5 word je slimmer en sneller. Nu in de winkel!'],
    ['verkoper', 'Snorrr, merk van kattenvoer', 'Waarom jouw kat dit voer nodig heeft', 'Gewoon kattenvoer is niet genoeg. Alleen Snorrr Supreme geeft je kat alles wat hij nodig heeft. Probeer het nu met korting.'],
    ['verkoper', 'BrainBoost, maker van vitaminepillen', 'Hogere cijfers met één pil per dag', 'Leerlingen die BrainBoost slikken, halen hogere cijfers. Bestel nu twee potjes voor de prijs van één.'],
    ['anoniem', '@waarheid_nu_123', 'Bananen zijn slecht voor je hart!!', 'Wist je dat bananen je hart kapotmaken? Niemand vertelt het je, maar het is echt waar. Deel dit met iedereen!'],
    ['anoniem', '@groeitips4u', 'Zo word je in een week tien centimeter langer', 'Hang elke avond tien minuten aan een deur. Na een week ben je tien centimeter langer. Gegarandeerd!'],
    ['anoniem', '@schoolnieuws_xx', 'Morgen zijn alle scholen dicht door de hitte!', 'Het wordt morgen zo heet dat alle scholen dichtgaan. Blijf gewoon thuis. Stuur dit door!'],
    ['anoniem', '@feitjes_247', 'Telefoons laten planten doodgaan', 'Als je telefoon naast een plant ligt, gaat de plant binnen een week dood. Het komt door de straling.'],
    ['anoniem', '@gezond_gratis', 'Chocola geneest verkoudheid', 'Eet bij verkoudheid een hele reep chocola. De volgende dag ben je beter. Dokters willen niet dat je dit weet.'],
    ['bekend', 'zangeres Mila Star, bekend van tv', 'Zo leer je het snelst voor een toets', 'Ik leer nooit en haal toch goede cijfers. Gewoon de avond ervoor even het boek doorbladeren, dat werkt het best.'],
    ['bekend', 'voetballer Rico Smit', 'Zo ontstaat een aardbeving', 'Een aardbeving komt door de maan. Als de maan vol is, trekt hij aan de aarde en dan gaat de grond trillen.'],
    ['bekend', 'acteur Tim Vos', 'Een gebroken arm geneest vanzelf', 'Met een gebroken arm hoef je echt niet naar het ziekenhuis. Gewoon stilhouden, dan groeit het vanzelf weer goed.'],
    ['bekend', 'gamer StreamKing, 500.000 volgers', 'Zo bescherm je je ogen tegen schermen', 'Je ogen worden echt nooit moe van een scherm. Ik game zelf twaalf uur per dag en ik zie alles nog prima.'],
    ['bekend', 'rapper Bas Bliksem', 'Waarom je geen ontbijt nodig hebt', 'Ik eet nooit ontbijt en ik ben superfit. Ontbijt is gewoon iets wat fabrieken hebben verzonnen.']
  ];
  function maakMaker(R){
    var it = R.kies(MAKER), s = it[0], m = MSOORT[s];
    var andere = ander(R, MAKER.filter(function(x){ return x !== it; }).map(function(x){ return x[1]; }), [it[1]], 2);
    var soorten = Object.keys(MSOORT).filter(function(k){ return k !== s; });
    var f = {}; if (s !== 'expert') f[MSOORT.expert.oordeel] = 'Dan moet de maker wel verstand hebben van dit onderwerp. Is dat zo?';
    return OP('Kun je deze bron vertrouwen?', 'Je zoekt informatie en vindt deze bron.' + bron({ kop:it[2], tekst:it[3], door:it[1] }), [
      K(R, 'Wie heeft deze tekst gemaakt?', it[1], andere, 'Kijk onderaan de bron, achter Door.'),
      K(R, 'Wat voor maker is dat?', m.wie, ander(R, soorten, [], 2).map(function(k){ return MSOORT[k].wie; }), MHINT[s]),
      K(R, 'Kun je deze bron over dit onderwerp vertrouwen?', m.oordeel, ander(R, soorten, [], 2).map(function(k){ return MSOORT[k].oordeel; }),
        'Je weet nu: de maker is ' + m.wie + '. Wat betekent dat voor de informatie?', { fout:f })
    ]);
  }

  /* --- wanneer is de bron gemaakt --- */
  /* het echte jaar: de bronnen schuiven mee */
  var NU = new Date().getFullYear();
  /* [vraag, kop van de bron, adres, verandert het (1/0), waarom] */
  var DATUM = [
    ['Wat kost een kaartje voor Dierenpark De Wildernis?', 'Toegangsprijzen Dierenpark De Wildernis', 'dierenpark-dewildernis.nl', 1, 'Prijzen gaan bijna elk jaar omhoog.'],
    ['Hoe laat gaat Zwembad De Kolk open?', 'Openingstijden Zwembad De Kolk', 'zwembaddekolk.nl', 1, 'Openingstijden veranderen vaak, bijvoorbeeld in de vakantie.'],
    ['Welke laptop is nu het best voor school?', 'De beste laptops voor scholieren', 'techtest-online.nl', 1, 'Er komen elk jaar nieuwe en betere laptops uit.'],
    ['Welke films draaien er nu in de bioscoop?', 'Nu in de bioscoop', 'filmagenda-noord.nl', 1, 'Er draaien elke week andere films.'],
    ['Wat kost een abonnement bij Sportschool Sterk?', 'Tarieven Sportschool Sterk', 'sportschoolsterk.nl', 1, 'Prijzen veranderen vaak.'],
    ['Welke apps gebruiken jongeren nu het meest?', 'Top 10 apps onder jongeren', 'jongerenpeiling.nl', 1, 'Welke apps populair zijn, verandert heel snel.'],
    ['Wie is de trainer van het eerste team van VV De Meeuwen?', 'Selectie en staf VV De Meeuwen', 'vvdemeeuwen.nl', 1, 'Clubs krijgen geregeld een nieuwe trainer.'],
    ['Hoe laat vertrekt de bus naar het centrum?', 'Dienstregeling lijn 7', 'busplanner-regio.nl', 1, 'Een dienstregeling verandert meestal elk jaar.'],
    ['Hoeveel poten heeft een spin?', 'Alles over spinnen', 'weetwolk.nl', 0, 'Een spin heeft altijd acht poten. Dat verandert niet.'],
    ['Hoe ontstaat een regenboog?', 'Zo ontstaat een regenboog', 'kenniskompas.nl', 0, 'Hoe licht en regen samen een regenboog maken, verandert niet.'],
    ['In welk jaar begon de Tweede Wereldoorlog?', 'De Tweede Wereldoorlog in het kort', 'geschiedenisplein.nl', 0, 'Wat er vroeger is gebeurd, verandert niet meer.'],
    ['Wat is de hoofdstad van Frankrijk?', 'Frankrijk: feiten op een rij', 'landenwijzer.nl', 0, 'De hoofdstad van een land verandert bijna nooit.'],
    ['Hoe maak je twee breuken gelijknamig?', 'Rekenen met breuken', 'rekenhulp-online.nl', 0, 'Een rekenregel verandert niet.'],
    ['Hoe werkt je hart?', 'Je hart en je bloed', 'lichaamwijzer.nl', 0, 'Hoe je hart werkt, verandert niet.'],
    ['Hoe vouw je een papieren vliegtuig?', 'Een papieren vliegtuig vouwen in zes stappen', 'knutselhoek.nl', 0, 'Hoe je een vliegtuigje vouwt, verandert niet.'],
    ['Waarom vallen bladeren in de herfst?', 'Waarom bomen hun bladeren verliezen', 'natuurweetjes.nl', 0, 'Wat bomen in de herfst doen, verandert niet.']
  ];
  var DNIEUW = 'ja, de bron is nieuw genoeg', DOUD = 'nee, de bron is te oud', DBLIJFT = 'ja, deze informatie verandert toch niet';
  function maakDatum(R){
    var it = R.kies(DATUM), snel = !!it[3];
    var oud = snel ? R.kies([0, 0, 1, 1, 4, 5, 6, 7, 9]) : R.heel(5, 14), jaar = NU - oud;
    var goed = !snel ? DBLIJFT : oud <= 1 ? DNIEUW : DOUD;
    var f = {};
    if (snel) f[DBLIJFT] = 'Deze informatie verandert wel. ' + it[4];
    if (!snel) f[DOUD] = 'De bron is wel oud, maar deze informatie verandert niet. Dan mag dat.';
    if (snel && oud > 1) f[DNIEUW] = 'Een bron van ' + oud + ' jaar oud is te oud voor informatie die vaak verandert.';
    var ctx = 'Het is nu ' + NU + '. Je zoekt op: <b>' + it[0] + '</b> Je vindt deze bron.' +
      bron({ url:it[2], datum:'geplaatst op ' + datum(R, jaar), kop:it[1], tekst:'Op deze pagina lees je alles over dit onderwerp.' });
    return OP('Kun je deze bron gebruiken?', ctx, [
      { tekst:'In welk jaar is de bron geplaatst?', antwoord:String(jaar), hint:'Kijk bovenaan de bron, achter het adres van de website.' },
      { tekst:'Het is nu ' + NU + '. Hoeveel jaar oud is de bron?', antwoord:oud ? String(oud) : ['0', 'nul'], hint:'Reken uit: ' + NU + ' − ' + jaar + '.' },
      V('Verandert deze informatie snel?', ['ja, dit verandert vaak', 'nee, dit blijft hetzelfde'], snel ? 0 : 1,
        'Denk na: kan het antwoord op de vraag volgend jaar anders zijn?', { waarom:it[4] }),
      V('Kun je deze bron gebruiken voor jouw vraag?', [DNIEUW, DOUD, DBLIJFT], goed,
        snel ? 'Deze informatie verandert vaak. Dan moet de bron nieuw zijn: hooguit een jaar oud.' : 'Deze informatie verandert niet. Dan maakt het niet uit hoe oud de bron is.', { fout:f })
    ]);
  }

  /* --- wat voor soort bron --- */
  var BSOORT = {
    nieuws:{ naam:'een nieuwssite', kenm:'een kop, een datum en wie, wat, waar en wanneer', wil:'vertellen wat er is gebeurd', hint:'Er staat een datum bij, en de tekst vertelt wat er gebeurd is, waar en wanneer.' },
    reclame:{ naam:'reclame', kenm:'een product, een prijs en een knop om te kopen', wil:'je iets laten kopen', hint:'Zie je een prijs of een knop om te bestellen?' },
    blog:{ naam:'een blog', kenm:'iemand schrijft in de ik-vorm over zijn eigen ervaring', wil:'een eigen ervaring en mening delen', hint:'Wie schrijft er? Iemand die over zichzelf vertelt, met ik en mijn.' },
    ency:{ naam:'een encyclopedie', kenm:'zakelijke uitleg met feiten, zonder mening', wil:'uitleg geven over een onderwerp', hint:'De tekst legt rustig uit wat iets is, met feiten en zonder mening.' },
    sociaal:{ naam:'sociale media', kenm:'een korte post met likes, hashtags en reacties', wil:'snel iets delen, vaak zonder controle', hint:'Zie je een accountnaam met @, likes en hashtags?' }
  };
  var BRONNEN = [
    ['nieuws', 'DeStadskrant.nl', 'Brand in sporthal Oost: niemand gewond', 'Gisteravond rond acht uur brak er brand uit in sporthal De Kolk in Almere. De brandweer was snel ter plaatse. Er raakte niemand gewond. De sporthal blijft een week dicht.'],
    ['nieuws', 'RegioNu.nl', 'Nieuwe fietsbrug over het kanaal geopend', 'Wethouder Jansen opende dinsdagochtend de nieuwe fietsbrug over het kanaal in Zwolle. Fietsers zijn nu vijf minuten sneller in het centrum.'],
    ['nieuws', 'Dagblad De Delta', 'Zeehond zwemt door de gracht in Leiden', 'Woensdag zwom er een zeehond door de gracht in het centrum van Leiden. Dierenhulpverleners hebben het dier gevangen en teruggebracht naar zee.'],
    ['nieuws', 'NieuwsNoord.nl', 'Bus 12 rijdt vanaf maandag vaker', 'Vanaf maandag rijdt buslijn 12 in Groningen elk kwartier in plaats van elk halfuur. Dat meldt het busbedrijf.'],
    ['reclame', 'SnelChef', 'De SnelChef-pan: koken in vijf minuten!', 'Nooit meer lang in de keuken staan. Met de SnelChef-pan is je eten in vijf minuten klaar. Nu voor € 39,95.'],
    ['reclame', 'RunFast', 'Nieuw: de RunFast Turbo', 'Ren sneller dan ooit op de lichtste schoen van het jaar. Alleen deze week voor € 89,99.'],
    ['reclame', 'Sneakerz', 'Mega-uitverkoop bij Sneakerz', 'Alle sneakers tot 50% korting. Op is op! Vanaf € 29,99.'],
    ['reclame', 'Zonnig Reizen', 'Last minute naar de zon!', 'Een week Spanje met vlucht en hotel. Boek snel, er zijn nog maar een paar plekken. Vanaf € 399.'],
    ['blog', 'Het blog van Noor', 'Mijn eerste week op de middelbare school', 'Ik was echt zenuwachtig voor mijn eerste dag. Maar mijn mentor was superaardig en ik heb al twee nieuwe vriendinnen. Ik vind het nu al leuker dan de basisschool!'],
    ['blog', 'Sem kookt', 'Waarom ik nooit meer pizza bestel', 'Vorige week heb ik zelf pizza gemaakt, en eerlijk: die was veel lekkerder. Ik vind bestellen echt zonde van je geld.'],
    ['blog', 'Het reisdagboek van Lotte', 'Drie dagen kamperen in de regen', 'Het regende drie dagen lang en onze tent lekte. Toch vond ik het een van mijn leukste vakanties ooit.'],
    ['blog', 'De gamehoek van Daan', 'Wat ik van de nieuwe update vind', 'Ik heb de nieuwe update twee dagen gespeeld. Ik vind de nieuwe levels te moeilijk, maar de plaatjes zijn wel heel mooi.'],
    ['ency', 'WeetWiki, online encyclopedie', 'Octopus', 'De octopus is een weekdier dat in zee leeft. Hij heeft acht armen, drie harten en blauw bloed. Octopussen kunnen van kleur veranderen.'],
    ['ency', 'WeetWiki, online encyclopedie', 'Vulkaan', 'Een vulkaan is een opening in de aardkorst waar gesmolten gesteente naar buiten komt. Boven de grond heet dat gesteente lava.'],
    ['ency', 'WeetWiki, online encyclopedie', 'Eiffeltoren', 'De Eiffeltoren is een ijzeren toren in Parijs. Hij werd gebouwd voor de wereldtentoonstelling van 1889.'],
    ['ency', 'WeetWiki, online encyclopedie', 'Regenwoud', 'Een regenwoud is een bos waar het bijna elke dag regent. Er leven heel veel soorten dieren en planten.'],
    ['sociaal', '@lisa_lifestyle', '', 'Eindelijk weekend! Wie gaat er ook naar het strand?', '1.204 likes · 87 reacties · #weekend #zon'],
    ['sociaal', '@voetbalfan_mo', '', 'Wat een goal gisteren!! Beste wedstrijd van het jaar', '856 likes · 42 reacties · #voetbal'],
    ['sociaal', '@echtnieuws_247', '', 'LET OP: morgen geen school in heel Nederland!!! Deel dit!', '23.500 likes · 3.100 reacties · #nieuws #geenschool'],
    ['sociaal', '@kattenliefde', '', 'Mijn kat slaapt al de hele dag op mijn huiswerk', '3.410 likes · 120 reacties · #kat #huiswerk']
  ];
  function bronKaart(R, it){
    var s = it[0];
    if (s === 'nieuws') return bron({ url:it[1], datum:datum(R, NU), kop:it[2], tekst:it[3], door:'de redactie' });
    if (s === 'reclame') return bron({ url:it[1], kop:it[2], tekst:[it[3], '<span style="display:inline-block;padding:4px 14px;border-radius:999px;background:var(--lr-2);color:#fff;font-weight:700">Bestel nu</span>'] });
    if (s === 'blog') return bron({ url:it[1], kop:it[2], tekst:it[3], onder:'12 reacties' });
    if (s === 'ency') return bron({ url:it[1], kop:it[2], tekst:it[3], onder:'Bronnen: drie boeken en twee onderzoeken' });
    return bron({ kop:it[1], tekst:it[3], onder:it[4] });
  }
  function maakSoort(R){
    var it = R.kies(BRONNEN), s = BSOORT[it[0]], rest = Object.keys(BSOORT).filter(function(k){ return k !== it[0]; });
    return OP('Wat voor soort bron is dit?', 'Je vindt deze bron op internet.' + bronKaart(R, it), [
      K(R, 'Wat valt je op aan deze bron?', s.kenm, ander(R, rest, [], 2).map(function(k){ return BSOORT[k].kenm; }), s.hint),
      K(R, 'Wat voor soort bron is dit?', s.naam, ander(R, rest, [], 2).map(function(k){ return BSOORT[k].naam; }), 'Je zag: ' + s.kenm + '. Bij welke soort bron hoort dat?'),
      K(R, 'Wat wil deze bron vooral?', s.wil, ander(R, rest, [], 2).map(function(k){ return BSOORT[k].wil; }), 'Denk aan wat ' + s.naam + ' meestal doet.')
    ]);
  }

  /* --- wil de maker iets verkopen of overtuigen --- */
  var BNIETS = 'niets, de maker verkoopt niets en vraagt niets van je';
  /* [kop, tekst, door, wat wil de tekst, belang (null = neutraal)] */
  var BELANG = [
    ['Melk is onmisbaar voor sterke botten', 'Zonder melk worden je botten zwak. Drink daarom elke dag drie glazen ZuivelPlus-melk.', 'ZuivelPlus, een melkfabriek', 'dat je elke dag ZuivelPlus-melk drinkt', 'hij verkoopt meer melk'],
    ['Een elektrische step is de veiligste manier naar school', 'Met een step ben je sneller en veiliger op school dan met de fiets. Kijk in onze winkel voor de nieuwste modellen.', 'StepXpress, een winkel in elektrische steps', 'dat je een elektrische step koopt', 'hij verkoopt meer steps'],
    ['Bijles is niet meer nodig met onze app', 'Met de LeerSlim-app haal je zonder bijles hogere cijfers. Een abonnement kost maar € 9,99 per maand.', 'LeerSlim, een bedrijf dat een leer-app verkoopt', 'dat je een abonnement op de app neemt', 'hij krijgt meer abonnementen'],
    ['Elke dag gamen is goed voor je hersenen', 'Wie elke dag twee uur gamet, wordt slimmer. Ontdek ons aanbod games in de winkel.', 'GameWereld, een winkel in games', 'dat je meer games koopt', 'hij verkoopt meer games'],
    ['Kraanwater is ongezond: drink flessenwater', 'In kraanwater zitten stoffen die je niet wilt. Kies voor het pure water van Bron Kristal.', 'Bron Kristal, een merk flessenwater', 'dat je flessenwater koopt in plaats van kraanwater', 'hij verkoopt meer flessen water'],
    ['Stem op ons, dan wordt de bus gratis', 'Wil je een gratis bus? Stem dan op Partij Vooruit. Alleen wij zorgen voor een betere stad.', 'Partij Vooruit, een politieke partij', 'dat je op Partij Vooruit stemt', 'de partij krijgt meer stemmen'],
    ['De nieuwe snelweg is goed voor iedereen', 'De nieuwe weg zorgt voor minder files en meer banen. Iedereen gaat erop vooruit.', 'Asfalt BV, het bedrijf dat de weg mag aanleggen', 'dat je voor de nieuwe snelweg bent', 'hij verdient geld aan de aanleg'],
    ['Dit energiedrankje maakt je slimmer', 'Drink een blikje Boost voor je toets en je haalt zeker een voldoende.', 'Boost Energy, de maker van het drankje', 'dat je blikjes Boost koopt', 'hij verkoopt meer blikjes'],
    ['Een vakantie in Spanje is altijd beter', 'In Spanje schijnt altijd de zon. Boek nu je reis bij ons en geniet!', 'Zonnig Reizen, een reisbureau', 'dat je een reis naar Spanje boekt', 'hij verkoopt meer reizen'],
    ['Iedereen heeft drie paar sportschoenen nodig', 'Voor elke sport heb je andere schoenen nodig. Kom langs voor onze voordeelpakketten.', 'RunFast, een schoenenwinkel', 'dat je meer sportschoenen koopt', 'hij verkoopt meer schoenen'],
    ['Hoe oud wordt een olifant?', 'Een olifant in het wild wordt meestal zestig tot zeventig jaar oud.', 'WeetWiki, een online encyclopedie', 'alleen dat je iets te weten komt', null],
    ['Zo ontstaat een regenboog', 'Een regenboog ontstaat als zonlicht door regendruppels schijnt. Het licht valt dan uiteen in kleuren.', 'het weerinstituut', 'alleen dat je iets te weten komt', null],
    ['Waarom vallen bladeren in de herfst?', 'In de herfst krijgt een boom minder licht. Hij laat zijn bladeren vallen om water en energie te sparen.', 'een schoolboek biologie voor de brugklas', 'alleen dat je iets te weten komt', null],
    ['Hoe werkt een vulkaan?', 'Diep onder de grond is het zo heet dat steen smelt. Bij een vulkaan komt dat gesmolten steen naar boven.', 'KennisKompas, een kennissite van een museum', 'alleen dat je iets te weten komt', null],
    ['De eerste fiets', 'De eerste fiets had nog geen trappers. Je duwde jezelf vooruit met je voeten.', 'een geschiedenisboek', 'alleen dat je iets te weten komt', null]
  ];
  var BJA = 'nee, de maker heeft er belang bij', BNEE = 'ja, de maker heeft er geen belang bij';
  function maakBelang(R){
    var it = R.kies(BELANG), heeft = !!it[4];
    var wilAnder = ander(R, BELANG.filter(function(x){ return x[4] && x !== it; }).map(function(x){ return x[3]; }), [it[3]], 2);
    if (heeft) wilAnder[1] = 'alleen dat je iets te weten komt';
    var alleBelang = BELANG.filter(function(x){ return x[4] && x !== it; }).map(function(x){ return x[4]; });
    var belangAnder = heeft ? [BNIETS].concat(ander(R, alleBelang, [it[4]], 1)) : ander(R, alleBelang, [], 2);
    var f = heeft ? fouten([BNEE, 'Kijk nog eens: de maker heeft er wel iets aan, want ' + it[4] + '.'])
      : fouten([BJA, 'De maker verkoopt niets en vraagt niets van je. Dan heeft hij er geen belang bij.']);
    return OP('Is deze bron neutraal?', 'Lees de bron. Let goed op wie hem gemaakt heeft.' + bron({ kop:it[0], tekst:it[1], door:it[2] }), [
      K(R, 'Wat wil de tekst dat jij denkt of doet?', it[3], wilAnder, heeft ? 'Lees de laatste zin goed. Wat moet je volgens de tekst gaan doen?' : 'Vraagt de tekst je iets te kopen, te kiezen of te doen? Of legt hij alleen iets uit?'),
      K(R, 'Wat heeft de maker eraan als jij dat doet?', heeft ? it[4] : BNIETS, belangAnder, 'De maker is ' + it[2] + '. Wat levert het die maker op?'),
      V('Is deze bron neutraal?', [BJA, BNEE], heeft ? 0 : 1, heeft ? 'Als de maker er iets aan verdient, is de bron niet neutraal.' : 'Een maker die er niets aan verdient, kan neutraal uitleggen.', { fout:f })
    ]);
  }

  /* --- check het in een tweede bron --- */
  var CHFOUT = ['de reacties onder de post', 'een ander bericht van hetzelfde account', 'het aantal likes van de post', 'een vriend die de post ook deelde'];
  var CJA = 'ja, de tweede bron zegt hetzelfde', CNEE = 'nee, de tweede bron zegt iets anders', CLIKES = 'ja, want de post heeft veel likes';
  /* [account, post, checkbron, wat daar staat, zegt (kort), tegendeel (kort), klopt] */
  var CHECK = [
    ['@feitjes_247', 'Wist je dat een goudvis maar drie seconden iets kan onthouden?', 'een encyclopedie over dieren', 'Goudvissen kunnen dingen maanden onthouden. Ze leren bijvoorbeeld op welk moment ze eten krijgen.', 'een goudvis onthoudt dingen maanden', 'een goudvis onthoudt maar drie seconden', 0],
    ['@leerlingen_tips', 'De zomervakantie begint dit jaar een week later!', 'de website van de school', 'Let op: dit schooljaar begint de zomervakantie een week later dan vorig jaar.', 'de vakantie begint een week later', 'de vakantie begint op de gewone datum', 1],
    ['@weetjesbaas', 'Bliksem slaat nooit twee keer op dezelfde plek in.', 'de website van het weerinstituut', 'Bliksem kan heel goed vaker op dezelfde plek inslaan. Hoge torens worden zelfs vaak getroffen.', 'bliksem kan vaker op dezelfde plek inslaan', 'bliksem slaat maar één keer op een plek in', 0],
    ['@dierenfeitjes', 'Een octopus heeft drie harten!', 'een encyclopedie over dieren', 'Een octopus heeft drie harten en blauw bloed.', 'een octopus heeft drie harten', 'een octopus heeft één hart', 1],
    ['@stadsnieuws_nu', 'Het zwembad is deze hele week dicht!', 'de website van het zwembad', 'Wegens onderhoud zijn we van maandag tot en met zondag gesloten.', 'het zwembad is deze week dicht', 'het zwembad is gewoon open', 1],
    ['@brommer_info', 'Vanaf je veertiende mag je al op een brommer rijden.', 'de officiële website over rijbewijzen', 'Een brommer mag je pas besturen vanaf 16 jaar. Je hebt dan een rijbewijs AM nodig.', 'je mag pas vanaf 16 jaar brommer rijden', 'je mag vanaf 14 jaar brommer rijden', 0],
    ['@gezond_gratis', 'Met nat haar naar buiten? Dan word je verkouden.', 'een gezondheidssite van artsen', 'Verkoudheid komt door een virus. Van kou of nat haar word je niet verkouden.', 'verkoudheid komt door een virus, niet door nat haar', 'van nat haar word je verkouden', 0],
    ['@bergbeklimmer_jan', 'De Mount Everest is de hoogste berg ter wereld.', 'een encyclopedie', 'Met bijna 8850 meter is de Mount Everest de hoogste berg op aarde.', 'de Mount Everest is de hoogste berg', 'een andere berg is hoger', 1],
    ['@hersenweetjes', 'Je gebruikt maar tien procent van je hersenen.', 'een wetenschapssite van een universiteit', 'Op scans zie je dat mensen bijna al hun hersenen gebruiken, alleen niet allemaal tegelijk.', 'je gebruikt bijna al je hersenen', 'je gebruikt maar tien procent van je hersenen', 0],
    ['@boerderijfan', 'Stieren worden woest van de kleur rood.', 'een encyclopedie over dieren', 'Stieren zien de kleur rood niet goed. Ze reageren op de beweging van de doek.', 'stieren reageren op beweging, niet op rood', 'stieren worden boos van de kleur rood', 0],
    ['@boekenwurm_99', 'Goed nieuws: de bibliotheek is nu ook op zondag open!', 'de website van de bibliotheek', 'Nieuw: we zijn voortaan ook op zondag open, van 12.00 tot 17.00 uur.', 'de bibliotheek is nu ook op zondag open', 'de bibliotheek is op zondag dicht', 1],
    ['@ruimtefan', 'Op Mars is het altijd lekker warm.', 'een encyclopedie', 'Op Mars is het gemiddeld zestig graden onder nul.', 'op Mars is het heel koud', 'op Mars is het warm', 0],
    ['@weetjesbaas', 'Ingeslikte kauwgom blijft zeven jaar in je maag zitten.', 'een gezondheidssite van artsen', 'Kauwgom die je inslikt, verlaat je lichaam binnen een paar dagen.', 'kauwgom is binnen een paar dagen weer uit je lichaam', 'kauwgom blijft jaren in je maag', 0],
    ['@fruitfeitjes', 'Bananen groeien niet aan een boom, maar aan een plant!', 'een encyclopedie over planten', 'De bananenplant lijkt op een boom, maar het is een heel grote plant zonder hout.', 'bananen groeien aan een grote plant', 'bananen groeien aan een boom', 1],
    ['@treinreiziger', 'De trein naar Zwolle rijdt vandaag niet!', 'de reisplanner van het treinbedrijf', 'Let op: door werk aan het spoor rijden er vandaag geen treinen naar Zwolle.', 'er rijden vandaag geen treinen naar Zwolle', 'de treinen naar Zwolle rijden gewoon', 1],
    ['@reisweetjes', 'Je kunt de Chinese Muur vanuit de ruimte met het blote oog zien.', 'een wetenschapssite', 'Astronauten zeggen dat je de Chinese Muur vanuit de ruimte niet met het blote oog kunt zien. Hij is daarvoor te smal.', 'je kunt de muur vanuit de ruimte niet zien', 'je kunt de muur vanuit de ruimte goed zien', 0]
  ];
  function maakCheck(R){
    var it = R.kies(CHECK), klopt = !!it[6];
    var derde = ander(R, CHECK.filter(function(x){ return x !== it; }).map(function(x){ return x[4]; }), [], 1)[0];
    var ctx = 'Je ziet deze post. Je twijfelt of het klopt.' + bron({ naam:'De post', kop:it[0], tekst:it[1], onder:R.heel(2, 40) + '.' + R.heel(100, 999) + ' likes' }) +
      bron({ naam:'Wat je vindt bij ' + it[2], tekst:it[3] });
    return OP('Klopt de post?', ctx, [
      K(R, 'Waar check je dit het best?', it[2], ander(R, CHFOUT, [], 2), 'Kies een bron die er verstand van heeft en die niets met de post te maken heeft.',
        { fout:fouten(['het aantal likes van de post', 'Veel likes zegt niets. Ook onzin kan veel likes krijgen.', 'de reacties onder de post', 'In de reacties schrijft iedereen maar wat. Je weet niet wie het zijn.']) }),
      K(R, 'Wat zegt ' + it[2] + '?', it[4], [it[5], derde], 'Lees de tweede bron nog eens goed.'),
      V('Klopt de bewering uit de post?', [CJA, CNEE, CLIKES], klopt ? 0 : 1, 'Zet de post naast de tweede bron. Zeggen ze hetzelfde?',
        { fout:fouten([CLIKES, 'Likes zeggen niets over of iets waar is. Kijk wat de tweede bron zegt.']) })
    ]);
  }

  /* --- welke bron is het betrouwbaarst --- */
  /* [zoekvraag, goed [adres, titel, stukje], verkoper [..], zwak [..], 'anoniem' | 'oud'] */
  var DRIE = [
    ['Hoeveel slaap heeft een tiener nodig?', ['slaapinstituut-info.nl', 'Slaap bij tieners: hoeveel heb je nodig?', 'Slaaponderzoekers leggen uit: tieners hebben acht tot tien uur slaap nodig. Lees hier waarom.'],
      ['droombed.nl', 'Beter slapen? Begin met een DroomBed!', 'Op ons matras slaap je dieper. Nu 30% korting op alle matrassen.'],
      ['forum.praatmaar.nl', 'Re: hoeveel slaap???', 'Geplaatst door xXslaapkopXx: ik slaap zelf 5 uur en ik voel me prima, dus dat is genoeg.'], 'anoniem'],
    ['Hoe ontstaan gaatjes in je tanden?', ['tandartsen-uitleg.nl', 'Tandartsen leggen uit: zo ontstaan gaatjes', 'Bacteriën in je mond maken van suiker zuur. Dat zuur maakt gaatjes in je tanden.'],
      ['snoepparadijs.nl', 'Snoep is gewoon gezond!', 'Ons snoep is lekker en goed voor je humeur. Bestel nu 2 kilo voor € 10.'],
      ['tandenweetjes.nl', 'Gaatjes komen door koud water', 'Geplaatst op 3 juni 1998. Wie koud water drinkt, krijgt gaatjes.'], 'oud'],
    ['Hoe ontstaat een aardbeving?', ['kenniskompas.nl', 'Aardbevingen: zo werkt het', 'Geologen leggen uit hoe stukken van de aardkorst langs elkaar schuiven en de grond laten trillen.'],
      ['veiligthuis-shop.nl', 'Bescherm je huis tegen aardbevingen!', 'Koop nu ons aardbevingspakket met zaklamp en noodradio. Maar € 79.'],
      ['@mysterie_weetjes', 'Aardbevingen komen door de maan!!', 'Een account zonder naam: de maan trekt aan de aarde en dan gaat alles trillen.'], 'anoniem'],
    ['Welke telefoon heeft de beste camera?', ['techtest-online.nl', 'Getest: de camera’s van tien nieuwe telefoons', 'Onze testers maakten met elke telefoon honderd foto’s. Dit zijn de uitkomsten. Geplaatst: deze maand.'],
      ['nova-telefoons.nl', 'De Nova X: de beste camera ooit!', 'Koop nu de Nova X met een gratis hoesje.'],
      ['telefoonblog.nl', 'De beste cameratelefoons van dit moment', 'Geplaatst op 4 april 2015. Dit zijn de beste telefoons die je nu kunt kopen.'], 'oud'],
    ['Is een hond een goed huisdier voor een gezin?', ['dierenwelzijn-info.nl', 'Een hond in huis: waar moet je aan denken?', 'Dierenartsen vertellen wat een hond nodig heeft: elke dag wandelen, goed voer en veel aandacht.'],
      ['puppyparadijs.nl', 'Koop nu je puppy!', 'Schattige puppy’s, vandaag nog mee naar huis. Betaal eenvoudig online.'],
      ['@doggo_lover22', 'honden zijn het allerbeste', 'Een account zonder naam: iedereen moet een hond nemen, punt.'], 'anoniem'],
    ['Hoe ontstaat een regenboog?', ['weerinstituut-uitleg.nl', 'Zo ontstaat een regenboog', 'Weerkundigen leggen uit: zonlicht valt in regendruppels uiteen in kleuren.'],
      ['regenboogshop.nl', 'Regenboogkleding voor iedereen!', 'Vrolijke kleren in alle kleuren. Nu 2 halen, 1 betalen.'],
      ['forum.vragenvuur.nl', 'Re: regenboog?', 'Geplaatst door zonnetje123: ik denk dat het door de wolken komt of zo.'], 'anoniem'],
    ['Wanneer is de Eiffeltoren gebouwd?', ['weetwiki.nl', 'Eiffeltoren', 'De Eiffeltoren werd gebouwd voor de wereldtentoonstelling van 1889. Onderaan de pagina staan de bronnen.'],
      ['parijsreizen.nl', 'Stedentrip Parijs met uitzicht op de Eiffeltoren', 'Boek nu drie nachten in Parijs vanaf € 199.'],
      ['@reisweetjes_xx', 'eiffeltoren is 100 jaar oud ofzo', 'Een account zonder naam en zonder bronnen.'], 'anoniem'],
    ['Waar let je op bij hardloopschoenen?', ['atletiekuitleg.nl', 'Zo kies je goede hardloopschoenen', 'Trainers van de atletiekbond leggen uit waar je op let: demping, pasvorm en grip.'],
      ['runfast.nl', 'De RunFast Turbo: de beste schoen ter wereld!', 'Alleen deze week 25% korting. Bestel nu!'],
      ['sportnieuws-archief.nl', 'De beste hardloopschoenen van het jaar', 'Geplaatst op 9 mei 2008. Dit zijn de schoenen van dit seizoen.'], 'oud'],
    ['Kun je bij harde wind veilig in zee zwemmen?', ['reddingsbrigade-uitleg.nl', 'Veilig zwemmen in zee', 'De reddingsbrigade legt uit: bij harde wind ontstaan gevaarlijke stromingen. Zwem dan niet in zee.'],
      ['surfshop-degolf.nl', 'Harde wind? Perfect surfweer!', 'Huur nu een surfplank voor € 15 per dag.'],
      ['@strandtijger', 'zee is altijd veilig joh', 'Een account zonder naam: ik zwem altijd, ook bij storm.'], 'anoniem'],
    ['Hoeveel water moet je per dag drinken?', ['gezondheidsplein-uitleg.nl', 'Hoeveel moet je drinken?', 'Diëtisten raden ongeveer anderhalve liter per dag aan. Bij sporten of hitte meer.'],
      ['bronkristal.nl', 'Drink elke dag drie flessen Bron Kristal!', 'Puur water voor een gezond lijf. Nu 6 flessen voor € 3.'],
      ['forum.praatmaar.nl', 'Re: water drinken', 'Geplaatst door waterrat: ik drink nooit water, alleen frisdrank, gaat prima.'], 'anoniem'],
    ['Hoe leer je het best voor een toets?', ['leerwijzer-uitleg.nl', 'Slim leren voor een toets', 'Onderzoekers raden aan: leer in korte stukjes, verspreid over een paar dagen.'],
      ['leerslim.nl', 'Nooit meer leren met de LeerSlim-app!', 'Haal zonder moeite hogere cijfers. Probeer nu een maand voor € 9,99.'],
      ['@toetstopper', 'leren is voor watjes', 'Een account zonder naam: gewoon de avond ervoor even kijken.'], 'anoniem'],
    ['Wat eet een egel?', ['natuurweetjes.nl', 'Wat eet een egel?', 'Biologen vertellen: een egel eet vooral insecten, wormen en slakken.'],
      ['dierenvoer-direct.nl', 'Egelvoer: nu in de aanbieding!', 'Speciaal egelvoer voor in je tuin. Bestel 3 zakken voor € 12.'],
      ['tuindieren-blog.nl', 'Geef een egel een schaaltje melk', 'Geplaatst op 2 januari 2004. Egels houden van melk.'], 'oud'],
    ['Waarom heeft een zebra strepen?', ['kenniskompas.nl', 'Waarom heeft een zebra strepen?', 'Biologen denken dat de strepen vliegen op afstand houden. Ze leggen uit hoe ze dat hebben onderzocht.'],
      ['zebrashop.nl', 'Zebraprint: dé trend van dit jaar!', 'Koop nu een trui met zebrastrepen voor € 29,99.'],
      ['@dierengekkie', 'zebra’s zijn eigenlijk zwart met wit', 'Een account zonder naam, zonder uitleg en zonder bron.'], 'anoniem'],
    ['Mag je je telefoon de hele nacht laten opladen?', ['techtest-online.nl', 'Je telefoon ’s nachts opladen: kan dat kwaad?', 'Onze technici testten tien telefoons. Nieuwe telefoons stoppen zelf met laden als ze vol zijn. Geplaatst: dit jaar.'],
      ['laadpaleis.nl', 'Koop een nieuwe snellader!', 'Met onze lader is je telefoon in 20 minuten vol. Nu € 24,95.'],
      ['gsm-tips.nl', 'Laat je telefoon nooit ’s nachts laden!', 'Geplaatst op 7 oktober 2005. Dan gaat je batterij kapot.'], 'oud'],
    ['Welke dieren leven op Antarctica?', ['weetwiki.nl', 'Dieren op Antarctica', 'Pinguïns, zeehonden en walvissen leven op en rond Antarctica. Onderaan staan de bronnen.'],
      ['poolreizen.nl', 'Zie de pinguïns zelf!', 'Boek nu een cruise naar Antarctica vanaf € 4.999.'],
      ['@ijsbeer_fan', 'er leven ijsberen op antarctica', 'Een account zonder naam en zonder bronnen.'], 'anoniem']
  ];
  function zoekResultaat(letter, r){
    return '<p style="margin:0 0 12px"><b style="color:var(--lr-2)">' + letter + '</b> <span style="' + GRIJS + '">' + r[0] + '</span><br><b>' + r[1] + '</b><br>' + r[2] + '</p>';
  }
  function maakDrie(R){
    var it = R.kies(DRIE), volg = R.hussel([0, 1, 2]), rijen = [it[1], it[2], it[3]];
    var lg = volg.indexOf(0), lv = volg.indexOf(1), lz = volg.indexOf(2);
    var ctx = 'Je zoekt op: <b>' + it[0] + '</b> Dit zijn de eerste drie resultaten.' +
      '<div class="lr-tekst" style="' + KAART + '">' + volg.map(function(i, k){ return zoekResultaat('Bron ' + LETTERS[k], rijen[i]); }).join('') + '</div>';
    var oud = it[4] === 'oud';
    var f = {}; f[BRONLET[lv]] = 'Die bron wil iets verkopen.'; f[BRONLET[lz]] = oud ? 'Die bron is heel oud.' : 'Bij die bron weet je niet wie de maker is.';
    return OP('Welke bron is het betrouwbaarst?', ctx, [
      V('Welke bron wil iets verkopen?', BRONLET, lv, 'Zoek woorden als koop, bestel, korting of een prijs.'),
      V(oud ? 'Welke bron is heel oud?' : 'Bij welke bron weet je niet wie de maker is?', BRONLET, lz,
        oud ? 'Kijk naar de datum: welke bron is meer dan tien jaar oud?' : 'Zoek een forum of een account zonder echte naam.'),
      V('Welke bron is het betrouwbaarst?', BRONLET, lg, 'Streep de twee bronnen van de vorige stappen weg. Welke blijft over? Kijk of daar een deskundige maker bij staat.', { fout:f })
    ]);
  }

  /* ================= 2 MISLEIDING HERKENNEN ================= */

  /* --- clickbait: [kop, tekst, wat de kop belooft, wat er echt staat, eerlijke kop, overdreven kop] --- */
  var CLICK = [
    ['Dit ene voedingsmiddel maakt je in een week superslim!', 'Onderzoekers keken of vis eten goed is voor je geheugen. Bij volwassenen die jarenlang elke week vis aten, ging het geheugen iets minder snel achteruit. Of het bij kinderen ook werkt, weten ze nog niet.',
      'van één soort eten word je in een week superslim', 'wie jarenlang vis eet, houdt zijn geheugen misschien iets langer goed', 'Onderzoek: vis eten is misschien goed voor je geheugen', 'Vis eten maakt iedereen meteen slimmer'],
    ['SCHOK: school gaat volgende week dicht!', 'Basisschool De Linde is volgende week woensdagmiddag een paar uur dicht. De leraren hebben dan een studiemiddag. De rest van de week is er gewoon les.',
      'de school gaat helemaal dicht', 'de school is één middag dicht voor een studiemiddag', 'Woensdagmiddag geen les op De Linde door studiemiddag', 'De Linde sluit voor altijd de deuren'],
    ['Je gelooft nooit wat deze hond deed!', 'Hond Bobbie uit Assen begon hard te blaffen toen er rook uit de schuur kwam. Zijn baasje zag het op tijd en belde de brandweer.',
      'de hond deed iets ongelooflijks', 'de hond blafte bij rook, zodat zijn baasje de brandweer kon bellen', 'Hond Bobbie blaft bij brand in schuur', 'Hond blust brand helemaal alleen'],
    ['Telefoons verboden in heel Nederland!', 'Op het Delta College mogen leerlingen vanaf volgend jaar hun telefoon niet meer gebruiken in de les. In de pauze mag het wel.',
      'telefoons worden overal in Nederland verboden', 'één school verbiedt telefoons in de les', 'Delta College: geen telefoons meer in de les', 'Alle scholen pakken telefoons af'],
    ['Wetenschappers geschokt: chocola is gezond!', 'Pure chocola bevat stoffen die goed zijn voor je hart. Maar er zit ook veel suiker en vet in. Een klein stukje per dag kan geen kwaad, zeggen onderzoekers.',
      'chocola is gezond', 'een klein stukje pure chocola kan geen kwaad, maar er zit ook veel suiker in', 'Een stukje pure chocola per dag kan geen kwaad', 'Eet zoveel chocola als je wilt'],
    ['Met deze truc ben je in één dag rijk!', 'Wie elke week een paar euro opzij legt, heeft na een jaar een mooi bedrag gespaard. Een spaarpot of een spaarrekening helpt daarbij.',
      'je wordt in één dag rijk', 'elke week een beetje sparen levert na een jaar een mooi bedrag op', 'Sparen? Leg elke week een paar euro opzij', 'Word rijk zonder te werken'],
    ['Gamers opgelet: jouw spelcomputer kan ontploffen!', 'Bij één oud type spelcomputer kan de lader soms te warm worden. De maker raadt aan om de lader niet onder een deken te leggen.',
      'jouw spelcomputer kan ontploffen', 'bij één oud type kan de lader te warm worden', 'Lader van oude spelcomputer kan te warm worden', 'Alle spelcomputers zijn levensgevaarlijk'],
    ['Zomer voorbij: nooit meer zon in augustus!', 'Het weerinstituut verwacht dat de komende week wat koeler en natter wordt dan normaal. Daarna wordt het weer warmer.',
      'de zomer is voorgoed voorbij', 'de komende week wordt wat koeler en natter, daarna wordt het warmer', 'Komende week koeler en natter, daarna weer warmer', 'Geen zon meer tot volgend jaar'],
    ['Leraar laat hele klas zakken!', 'In klas 2B haalden veel leerlingen een onvoldoende voor de toets wiskunde. De leraar geeft volgende week een extra uitlegles. Daarna mogen de leerlingen de toets opnieuw maken.',
      'de hele klas blijft zitten door de leraar', 'veel leerlingen hadden een onvoldoende en mogen de toets opnieuw maken', 'Klas 2B mag wiskundetoets opnieuw maken na extra les', 'Hele klas 2B blijft zitten'],
    ['Dit drankje geneest verkoudheid in één uur!', 'Warme thee met honing kan een zere keel wat verzachten. De verkoudheid zelf gaat er niet sneller door over, zeggen artsen.',
      'het drankje maakt je in een uur beter', 'thee met honing verzacht een zere keel, maar geneest verkoudheid niet', 'Thee met honing helpt tegen een zere keel', 'Nooit meer verkouden door thee'],
    ['Ramp in de supermarkt: alles uitverkocht!', 'In de supermarkt aan de Dorpsstraat waren zaterdag de aardbeien op. Door het mooie weer kochten veel mensen meer fruit dan normaal.',
      'alles in de supermarkt is op', 'de aardbeien waren op in één supermarkt', 'Aardbeien uitverkocht door mooi weer', 'Supermarkt moet sluiten door lege schappen'],
    ['Kinderen moeten voortaan op zaterdag naar school!', 'Een paar ouders in Leiden vinden dat scholen op zaterdag extra activiteiten moeten organiseren, zoals sport en muziek. De gemeente heeft nog niets besloten.',
      'zaterdag wordt een gewone schooldag', 'een paar ouders willen activiteiten op zaterdag, maar er is niets besloten', 'Ouders willen sport en muziek op zaterdag, gemeente beslist later', 'Zaterdag is vanaf nu een schooldag'],
    ['Eindelijk bewezen: katten haten hun baasje', 'Katten laten hun liefde anders zien dan honden. Ze knipperen langzaam met hun ogen of komen naast je zitten. Dat betekent dat ze je vertrouwen.',
      'katten haten hun baasje', 'katten laten op een andere manier zien dat ze je vertrouwen', 'Zo laat een kat zien dat hij je vertrouwt', 'Katten houden van niemand'],
    ['Nieuwe app leest al je gedachten!', 'Een nieuwe app raadt welke muziek je leuk vindt. Hij kijkt daarvoor naar de liedjes die je eerder hebt geluisterd.',
      'de app weet wat je denkt', 'de app raadt welke muziek je leuk vindt, op basis van je oude liedjes', 'App raadt welke muziek je leuk vindt', 'App weet alles over jou'],
    ['Zwemmen na het eten: levensgevaarlijk!', 'Veel mensen denken dat je na het eten niet mag zwemmen. Volgens artsen klopt dat niet. Je kunt hooguit wat last van je buik krijgen.',
      'zwemmen na het eten is heel gevaarlijk', 'zwemmen na het eten is niet gevaarlijk, hooguit krijg je wat buikpijn', 'Artsen: zwemmen na het eten kan gewoon', 'Na het eten mag je nooit meer zwemmen'],
    ['Gratis pizza voor iedereen!', 'Pizzeria Bella in Hoorn geeft zaterdag de eerste twintig klanten een gratis pizza. Daarna betaal je gewoon.',
      'iedereen krijgt gratis pizza', 'alleen de eerste twintig klanten krijgen zaterdag een gratis pizza', 'Eerste twintig klanten krijgen gratis pizza bij Bella', 'Pizzeria Bella geeft elke dag pizza weg']
  ];
  function maakClick(R){
    var it = R.kies(CLICK), rest = CLICK.filter(function(x){ return x !== it; });
    return OP('Welke kop is eerlijk?', 'Je ziet deze kop met een stukje tekst.' + bron({ kop:it[0], tekst:it[1] }), [
      K(R, 'Lees alleen de kop. Wat belooft de kop?', it[2], [it[3], R.kies(rest)[2]], 'Wat denk je dat er gebeurd is als je alleen de kop leest?'),
      K(R, 'Lees nu de tekst. Wat staat er echt?', it[3], [it[2], R.kies(rest)[3]], 'Lees de tekst zin voor zin. Wat is er echt gebeurd of ontdekt?'),
      K(R, 'Welke kop past eerlijk bij de tekst?', it[4], [it[0], it[5]], 'Een eerlijke kop zegt wat er echt in de tekst staat, zonder te overdrijven.',
        { fout:fouten([it[0], 'Dat is de kop die meer belooft dan de tekst. Dat heet clickbait.', it[5], 'Die kop overdrijft nog steeds. Staat dat echt in de tekst?']) })
    ]);
  }

  /* --- een foto bij het verkeerde nieuws: [kop, door, waar en wanneer, de foto, wat zoeken laat zien, kort, past] --- */
  var FOTO = [
    ['Zwolle loopt onder water na hevige regen!', '@nieuws_snel', 'in Zwolle, vandaag', 'een straat vol water, met palmbomen langs de weg', 'Deze foto stond in 2017 al online, bij een bericht over een orkaan in Florida (Amerika).', 'de foto is in 2017 in Florida gemaakt', 0],
    ['Enorme file op de A28 door sneeuw', '@verkeer_nu', 'op de A28, vanochtend', 'een snelweg vol auto’s in de sneeuw', 'Deze foto stond in 2010 al online, bij een bericht over sneeuw in Duitsland.', 'de foto is in 2010 in Duitsland gemaakt', 0],
    ['Duizenden mensen bij concert in het Stadspark', 'Dagblad De Delta', 'in het Stadspark, gisteravond', 'een grote menigte voor een verlicht podium', 'Deze foto staat sinds gisteravond online, bij berichten van het Stadspark en van de krant.', 'de foto is gisteravond in het Stadspark gemaakt', 1],
    ['Grote brand in fabriek bij de haven van Delfzijl', '@regio_alarm', 'in Delfzijl, vannacht', 'grote vlammen en zwarte rook boven een bos', 'Deze foto stond in 2015 al online, bij een bericht over een bosbrand in Spanje.', 'de foto is in 2015 in Spanje gemaakt', 0],
    ['Zeehond zwemt door de gracht in Leiden', 'RegioNu.nl', 'in Leiden, vanochtend', 'een zeehond in een gracht met oude huizen', 'Deze foto staat sinds vanochtend online. Hij is gemaakt door een fotograaf van een Leidse krant.', 'de foto is vanochtend in Leiden gemaakt', 1],
    ['Ruzie op de tribune bij de derby van zondag', '@voetbal_roddels', 'bij de derby, zondag', 'supporters die met stoelen gooien', 'Deze foto stond in 2012 al online, bij een wedstrijd in een ander land.', 'de foto is in 2012 in een ander land gemaakt', 0],
    ['Lange rij voor de nieuwe snoepwinkel in Breda', '@bredanieuws_echt', 'in Breda, vandaag', 'een lange rij mensen voor een winkel', 'Deze foto stond in 2019 al online, bij de opening van een kledingwinkel in Londen.', 'de foto is in 2019 in Londen gemaakt', 0],
    ['Storm blaast daken van huizen in Den Helder', 'NieuwsNoord.nl', 'in Den Helder, vannacht', 'een huis zonder dak, met dakpannen op straat', 'Deze foto staat sinds vanochtend online, bij verschillende nieuwssites over de storm in Den Helder.', 'de foto is vannacht in Den Helder gemaakt', 1],
    ['Haai gezien bij het strand van Scheveningen!', '@strandnieuws', 'bij Scheveningen, vandaag', 'een haaienvin vlak bij een strand met palmbomen', 'Deze foto stond in 2014 al online. Hij is gemaakt in Australië.', 'de foto is in 2014 in Australië gemaakt', 0],
    ['Leerlingen protesteren voor het stadhuis van Arnhem', 'RegioNu.nl', 'in Arnhem, vanmiddag', 'jongeren met borden voor een groot gebouw', 'Deze foto staat sinds vanmiddag online, bij de lokale omroep van Arnhem.', 'de foto is vanmiddag in Arnhem gemaakt', 1],
    ['Sneeuwpop van tien meter hoog in Assen', '@gekke_feitjes', 'in Assen, deze week', 'een enorme sneeuwpop naast een huis', 'Deze foto stond in 2008 al online. Hij is gemaakt in Canada.', 'de foto is in 2008 in Canada gemaakt', 0],
    ['Nieuwe brug in Nijmegen eindelijk open', 'DeStadskrant.nl', 'in Nijmegen, vandaag', 'een brug met vlaggetjes en mensen die oversteken', 'Deze foto staat sinds vandaag online, bij de gemeente Nijmegen en de lokale krant.', 'de foto is vandaag in Nijmegen gemaakt', 1],
    ['Wolf loopt door de winkelstraat van Apeldoorn', '@dierennieuws_nu', 'in Apeldoorn, gisteren', 'een wolf in een besneeuwde straat met hoge bergen op de achtergrond', 'Deze foto stond in 2016 al online. Hij is gemaakt in een dorp in Italië.', 'de foto is in 2016 in Italië gemaakt', 0],
    ['Recordaantal bezoekers op de kermis in Tilburg', 'Dagblad De Delta', 'in Tilburg, gisteren', 'een reuzenrad met heel veel mensen eromheen', 'Deze foto staat sinds gisteren online, op de site van de kermis en bij de krant.', 'de foto is gisteren in Tilburg gemaakt', 1]
  ];
  var FJA = 'ja, de foto komt van deze gebeurtenis', FNEE = 'nee, de foto komt van iets anders', FECHT = 'ja, want de foto ziet er echt uit';
  function maakFoto(R){
    var it = R.kies(FOTO), past = !!it[6], rest = FOTO.filter(function(x){ return x !== it; });
    var ctx = 'Je ziet dit bericht. Je zoekt de foto op met <b>omgekeerd zoeken</b>: je zoekt met de foto zelf, niet met woorden.' +
      bron({ naam:'Het bericht', kop:it[0], tekst:'<i>[foto: ' + it[3] + ']</i>', door:it[1] }) + bron({ naam:'Wat het zoeken naar de foto laat zien', tekst:it[4] });
    return OP('Past de foto bij het bericht?', ctx, [
      K(R, 'Waar en wanneer zou de foto volgens het bericht gemaakt zijn?', it[2], ander(R, rest.map(function(x){ return x[2]; }), [], 2), 'Lees de kop van het bericht. Over welke plaats gaat het?'),
      K(R, 'Wat laat het zoeken naar de foto zien?', it[5], ander(R, rest.map(function(x){ return x[5]; }), [], 2), 'Lees het tweede blok: waar en wanneer stond de foto voor het eerst online?'),
      V('Past de foto bij het bericht?', [FJA, FNEE, FECHT], past ? 0 : 1, 'Vergelijk: het bericht gaat over iets ' + it[2] + '. Het zoeken laat zien: ' + it[5] + '.',
        { fout:fouten([FECHT, 'Een echte foto kan toch bij het verkeerde nieuws staan. Kijk waar en wanneer hij gemaakt is.']) })
    ]);
  }

  /* --- nepsite of nepaccount: [soort, adres of naam, kop, tekst, kenmerk, nep, onder] --- */
  var NKENM = {
    lang:'extra woorden en een rare extensie aan het eind', tik:'er zit een tikfout in de naam', site:'niets vreemds: een korte naam die bij de organisatie past',
    nieuw:'een rare naam met cijfers, en het account is nieuw en plaatst heel veel', nadoen:'het lijkt op een bekend account, maar het is nieuw en heeft bijna geen volgers', account:'niets vreemds: een bekend account met een link naar de officiële website'
  };
  var NHINT = {
    lang:'Lees het adres letter voor letter. Hoe eindigt het, en staan er veel losse woorden in?', tik:'Lees de naam heel precies. Is hij goed gespeld?', site:'Lees het adres. Is het kort en past het bij de naam van de organisatie?',
    nieuw:'Kijk naar de naam en naar de regel eronder: hoe lang bestaat het account en hoeveel plaatst het?', nadoen:'Een beroemd persoon heeft heel veel volgers. Hoeveel heeft dit account er?', account:'Kijk naar de regel onder de naam: hoe lang bestaat het account, en staat er een link?'
  };
  var NEP = [
    ['site', 'www.sneakerz-outlet-90korting.xyz', 'Sneakerz Outlet', 'Alle merkschoenen 90% korting! Alleen vandaag! Je betaalt vooraf.', 'lang', 1, ''],
    ['site', 'www.gratis-telefoon-winnen.click', 'Prijzenpaleis', 'Gefeliciteerd, je hebt gewonnen! Vul je bankgegevens in om je prijs te krijgen.', 'lang', 1, ''],
    ['site', 'www.pakket-bezorging-status-nl.top', 'Pakketdienst', 'Je pakket kon niet worden bezorgd. Betaal € 1,99 om het opnieuw te laten bezorgen.', 'lang', 1, ''],
    ['site', 'www.concertkaartjes-goedkoop-24.shop', 'Kaartjeskraam', 'Uitverkochte concerten? Bij ons nog kaartjes voor de halve prijs!', 'lang', 1, ''],
    ['site', 'www.stadsbannk.nl', 'Stadsbank', 'Je rekening is geblokkeerd. Log hier in met je pincode om hem weer te openen.', 'tik', 1, ''],
    ['site', 'www.zwembaddekoll.nl', 'Zwembad De Kolk', 'Win een jaarabonnement! Vul je naam, je adres en je wachtwoord in.', 'tik', 1, ''],
    ['site', 'www.zwembaddekolk.nl', 'Zwembad De Kolk', 'Openingstijden, tarieven en zwemlessen.', 'site', 0, 'Kolkweg 12, Almere · info@zwembaddekolk.nl'],
    ['site', 'www.bibliotheekzuidrand.nl', 'Bibliotheek Zuidrand', 'Leen boeken, reserveer een studieplek of kom naar de voorleesmiddag.', 'site', 0, 'Marktplein 3, Zuidrand · info@bibliotheekzuidrand.nl'],
    ['site', 'www.wielwijs.nl', 'Fietsenwinkel WielWijs', 'Reparaties en nieuwe fietsen. Kom langs in onze winkel.', 'site', 0, 'Stationsstraat 8, Meerdorp · contact@wielwijs.nl'],
    ['site', 'www.dierenparkdewildernis.nl', 'Dierenpark De Wildernis', 'Koop je kaartjes online en bekijk de plattegrond van het park.', 'site', 0, 'Wildernislaan 1, Bosrijk · info@dierenparkdewildernis.nl'],
    ['account', '@echtnieuws_247', 'Echt Nieuws', 'LET OP: morgen geen school in heel Nederland!!! Deel dit!', 'nieuw', 1, 'lid sinds vorige week · 12 volgers · 300 berichten per dag'],
    ['account', '@winactie_gratis_123', 'Gratis Winactie', 'Like en deel dit bericht en win een nieuwe laptop!', 'nieuw', 1, 'lid sinds gisteren · 40 volgers · 150 berichten per dag'],
    ['account', '@d0kter_tips_99', 'Dokter Tips', 'Drink elke dag citroensap, dan word je nooit meer ziek!', 'nieuw', 1, 'lid sinds vorige maand · 31 volgers · 200 berichten per dag'],
    ['account', '@mila_star_officieel_echt', 'Mila Star', 'Ik geef 100 concertkaartjes weg! Stuur me je wachtwoord en je doet mee.', 'nadoen', 1, 'lid sinds deze maand · 85 volgers'],
    ['account', '@brandweer_oost_officieel1', 'Brandweer Oost', 'Er is een gaslek in de hele stad! Ga meteen naar buiten!', 'nadoen', 1, 'lid sinds gisteren · 9 volgers'],
    ['account', '@bibliotheekzuidrand', 'Bibliotheek Zuidrand', 'Zaterdag is er een voorleesmiddag voor kinderen. Kom je ook?', 'account', 0, 'lid sinds 2015 · 4.200 volgers · link: bibliotheekzuidrand.nl'],
    ['account', '@zwembaddekolk', 'Zwembad De Kolk', 'Door onderhoud is het wedstrijdbad maandag dicht. Het recreatiebad is wel open.', 'account', 0, 'lid sinds 2016 · 2.800 volgers · link: zwembaddekolk.nl'],
    ['account', '@weerinstituut', 'Het Weerinstituut', 'Morgen is er kans op onweer in het oosten van het land.', 'account', 0, 'lid sinds 2011 · 310.000 volgers · link: weerinstituut.nl'],
    ['account', '@milastar', 'Mila Star', 'Morgen begint mijn tour! Kaartjes koop je via mijn website.', 'account', 0, 'lid sinds 2017 · 2,1 miljoen volgers · link: milastar.nl']
  ];
  var NCONT = 'ja: er staat een adres of een link naar de officiële website', NGEEN = 'nee: er staat geen adres en geen link';
  var NECHT = 'waarschijnlijk echt', NNEP = 'waarschijnlijk nep';
  function maakNep(R){
    var it = R.kies(NEP), site = it[0] === 'site', nep = !!it[5];
    var soorten = site ? ['lang', 'tik', 'site'] : ['nieuw', 'nadoen', 'account'];
    var kaart = site ? bron({ url:'<span style="font-family:ui-monospace,Consolas,monospace;font-size:.95rem;color:var(--ink)">' + it[1] + '</span>', kop:it[2], tekst:it[3], onder:it[6] || 'Je vindt nergens een adres of contactgegevens.' })
      : bron({ kop:it[2] + ' <span style="font-weight:400;' + GRIJS + '">' + it[1] + '</span>', tekst:it[3], onder:it[6] });
    return OP('Echt of nep?', (site ? 'Je komt op deze website.' : 'Je ziet dit bericht van een account.') + kaart, [
      K(R, site ? 'Kijk naar het adres van de website. Wat valt op?' : 'Kijk naar de naam en de regel eronder. Wat valt op?', NKENM[it[4]], soorten.filter(function(k){ return k !== it[4]; }).map(function(k){ return NKENM[k]; }), NHINT[it[4]]),
      V('Kun je nagaan wie erachter zit?', [NCONT, NGEEN], nep ? 1 : 0, 'Kijk onderaan: staat daar een adres, een e-mail of een link naar een officiële website?'),
      V('Is dit echt of waarschijnlijk nep?', [NECHT, NNEP], nep ? 1 : 0, nep ? 'Een raar adres of een nieuw account zonder afzender: dat zijn twee waarschuwingen.' : 'Een gewone naam en een echte afzender: dan is het waarschijnlijk echt.',
        { fout:nep ? fouten([NECHT, 'Let op: het lijkt echt, maar ' + NKENM[it[4]] + '.']) : fouten([NNEP, 'Hier is niets vreemds aan, en je weet wie erachter zit.']) })
    ]);
  }

  /* --- reclame die op nieuws lijkt: [soort, bron, label, kop, tekst, merk (null = geen reclame)] --- */
  var RECL = [
    ['artikel', 'StadNu.nl', 'Advertorial', 'Waarom steeds meer scholieren kiezen voor BrainBoost', 'Scholieren in het hele land halen hogere cijfers. Hun geheim? Elke ochtend één BrainBoost-pil. Verkrijgbaar vanaf € 19,95.', 'BrainBoost'],
    ['artikel', 'RegioNu.nl', 'Gesponsord', 'Zo blijf je de hele dag fit', 'Wie goed ontbijt, kan zich beter concentreren. Een kom CrunchyKorn geeft je energie tot de lunch.', 'CrunchyKorn'],
    ['artikel', 'ReisMagazine Online', 'In samenwerking met Zonnig Reizen', 'Vijf verborgen plekjes in Spanje', 'Witte dorpjes, lege stranden en heerlijk eten. Ontdek ze zelf met een reis van Zonnig Reizen.', 'Zonnig Reizen'],
    ['artikel', 'DeStadskrant.nl', 'Advertentie', 'Onderzoek: je matras bepaalt je cijfers', 'Leerlingen die op een goed matras slapen, halen betere cijfers. DroomBed heeft nu een speciaal scholierenmatras.', 'DroomBed'],
    ['artikel', 'SportNu.nl', 'Gesponsord', 'Hoe de RunFast Turbo het hardlopen veranderde', 'Steeds meer lopers kiezen voor de nieuwe RunFast Turbo. Volgens kenners is het de lichtste schoen ooit.', 'RunFast'],
    ['post', '@lisa_lifestyle', '#reclame', '', 'Ik ben zó blij met mijn nieuwe GlowPure-crème! Mijn huid was nog nooit zo mooi. Met mijn code LISA10 krijg je korting.', 'GlowPure'],
    ['post', '@sem_gamet', 'Betaalde samenwerking met PixelPlay', '', 'Deze nieuwe controller is echt de beste die ik ooit heb gehad!', 'PixelPlay'],
    ['post', '@noah_kookt', '#gesponsord', '', 'Met deze SnelChef-pan kook ik alles in vijf minuten. Echt een aanrader!', 'SnelChef'],
    ['post', '@fit_met_femke', 'Betaalde samenwerking met TopFitShop', '', 'Elke ochtend mijn TopFit-shake. Zonder kan ik niet meer!', 'TopFitShop'],
    ['artikel', 'DeStadskrant.nl', '', 'Nieuwe fietsenstalling bij het station is al vol', 'De nieuwe fietsenstalling bij het station is na twee weken al vol. De gemeente kijkt of er meer plekken bij kunnen.', null],
    ['artikel', 'RegioNu.nl', '', 'Gemeente plant 200 nieuwe bomen in het centrum', 'De komende maanden plant de gemeente 200 nieuwe bomen in het centrum. Zo moet de stad in de zomer koeler blijven.', null],
    ['artikel', 'NieuwsNoord.nl', '', 'Brug over de rivier een week dicht', 'Vanaf maandag is de brug over de rivier een week dicht voor onderhoud. Fietsers kunnen met de pont.', null],
    ['post', '@lisa_lifestyle', '', '', 'Vandaag met mijn zus naar het strand geweest. Wat een heerlijke dag!', null],
    ['post', '@voetbalfan_mo', '', '', 'Wat een wedstrijd gisteren! Ik heb nog steeds geen stem van het juichen.', null]
  ];
  var RLABELS = ['Advertorial', 'Gesponsord', 'Advertentie', '#reclame', '#gesponsord', 'Betaalde samenwerking'];
  var RGEEN = 'er staat geen label';
  function maakRecl(R){
    var it = R.kies(RECL), post = it[0] === 'post', recl = !!it[5], label = it[2];
    var tekst = it[4] + (label.charAt(0) === '#' ? ' ' + label : '');
    var kaart = post ? bron({ label:label && label.charAt(0) !== '#' ? label : '', kop:it[1], tekst:tekst, onder:R.heel(1, 9) + '.' + R.heel(100, 999) + ' likes' })
      : bron({ label:label, url:it[1], datum:datum(R, NU), kop:it[3], tekst:tekst });
    var labelGoed = recl ? label : RGEEN;
    var labelFout = recl ? [RGEEN, ander(R, RLABELS.filter(function(l){ return label.replace('#', '').toLowerCase().indexOf(l.replace('#', '').toLowerCase()) !== 0; }), [], 1)[0]] : ander(R, RLABELS, [], 2);
    var MERK = 'het merk ' + it[5], RED = 'de redactie van de nieuwssite', ZELF = 'de maker van de post zelf';
    var anderMerk = 'het merk ' + R.kies(RECL.filter(function(x){ return x[5] && x[5] !== it[5]; }))[5];
    var wie = recl ? MERK : post ? ZELF : RED;
    var wieFout = recl ? [post ? ZELF : RED, anderMerk] : [post ? RED : ZELF, anderMerk];
    var opties = post ? ['reclame: de maker wordt betaald', 'een gewone post zonder reclame'] : ['reclame die eruitziet als nieuws', 'gewoon nieuws'];
    return OP(post ? 'Is dit reclame?' : 'Nieuws of reclame?', (post ? 'Je ziet deze post.' : 'Je leest dit bericht op een nieuwssite.') + kaart, [
      K(R, 'Kijk boven, in en onder de tekst. Welk label zie je?', labelGoed, labelFout, 'Zoek een klein woordje of een hashtag. Soms staat het boven de kop, soms helemaal aan het eind.'),
      K(R, 'Wie zit er achter deze tekst?', wie, wieFout, recl ? 'Het label zegt dat er voor de tekst betaald is. Welk merk wordt er genoemd?' : 'Er staat geen label. Wie heeft dit dan zelf geschreven?'),
      V(post ? 'Is dit reclame of een gewone post?' : 'Is dit nieuws of reclame?', opties, recl ? 0 : 1, recl ? 'Een label als ' + label + ' betekent: er is voor betaald. Dan is het reclame.' : 'Er staat geen label en er wordt niets verkocht.',
        { fout:recl ? fouten([opties[1], 'Kijk nog eens naar het label: ' + label + '.']) : null })
    ]);
  }

  /* --- framing: [feit, [kop, kleurwoord, 'pos'|'neg', [neutrale woorden]], [tweede kop ...]] --- */
  var FRAME = [
    ['het zwembad wordt 1 euro duurder', ['Gezinnen de dupe: zwembad weer duurder', 'de dupe', 'neg', ['zwembad', 'gezinnen']], ['Slechts 1 euro meer voor een dagje zwemmen', 'slechts', 'pos', ['euro', 'zwemmen']]],
    ['er komen 50 parkeerplaatsen bij de school', ['Eindelijk 50 parkeerplaatsen bij de school', 'eindelijk', 'pos', ['parkeerplaatsen', 'school']], ['Gemeente propt 50 parkeerplaatsen bij de school', 'propt', 'neg', ['gemeente', 'school']]],
    ['de laatste bus rijdt voortaan om tien uur', ['Dorp in de steek gelaten: laatste bus al om tien uur', 'in de steek gelaten', 'neg', ['dorp', 'bus']], ['Busbedrijf kiest slim: laatste bus om tien uur', 'slim', 'pos', ['busbedrijf', 'tien uur']]],
    ['het team verloor met 3-2', ['Team strijdt knap, maar verliest met 3-2', 'knap', 'pos', ['team', 'verliest']], ['Team gaat onderuit: 3-2', 'onderuit', 'neg', ['team', '3-2']]],
    ['telefoons gaan voortaan in een kluisje', ['Rust in de klas: telefoons gaan in een kluisje', 'rust', 'pos', ['klas', 'kluisje']], ['Strenge school sluit telefoons op in kluisjes', 'strenge', 'neg', ['telefoons', 'kluisjes']]],
    ['er kwamen 200 mensen naar het buurtfeest', ['Maar liefst 200 bezoekers op het buurtfeest', 'maar liefst', 'pos', ['bezoekers', 'buurtfeest']], ['Slechts 200 mensen op het buurtfeest', 'slechts', 'neg', ['mensen', 'buurtfeest']]],
    ['het wordt morgen 30 graden', ['Heerlijk zomerweer: morgen 30 graden', 'heerlijk', 'pos', ['zomerweer', 'morgen']], ['Morgen wordt het drukkend heet: 30 graden', 'drukkend', 'neg', ['morgen', 'graden']]],
    ['het schoolfeest stopt voortaan om elf uur', ['School is spelbreker: feest een uur korter', 'spelbreker', 'neg', ['school', 'feest']], ['Veilig thuis: schoolfeest stopt om elf uur', 'veilig', 'pos', ['schoolfeest', 'elf uur']]],
    ['er worden dertig bomen gekapt voor een fietspad', ['Dertig bomen sneuvelen voor fietspad', 'sneuvelen', 'neg', ['bomen', 'fietspad']], ['Nieuw, veilig fietspad: dertig bomen maken plaats', 'veilig', 'pos', ['fietspad', 'bomen']]],
    ['de zomervakantie wordt een week korter', ['Leerlingen beroofd van een week vakantie', 'beroofd', 'neg', ['leerlingen', 'vakantie']], ['Leerlingen krijgen een waardevolle extra lesweek', 'waardevolle', 'pos', ['leerlingen', 'lesweek']]],
    ['er opent een snackbar naast de school', ['Ongezonde snackbar opent vlak naast school', 'ongezonde', 'neg', ['snackbar', 'school']], ['Smullen in de pauze: snackbar opent naast school', 'smullen', 'pos', ['pauze', 'school']]],
    ['de bibliotheek is voortaan op maandag dicht', ['Harde klap voor lezers: bieb op maandag dicht', 'harde klap', 'neg', ['bieb', 'maandag']], ['Slimme keuze: bieb op maandag dicht, zaterdag langer open', 'slimme', 'pos', ['bieb', 'zaterdag']]],
    ['de toets is verplaatst naar volgende week', ['Chaos op school: toets verschoven', 'chaos', 'neg', ['school', 'toets']], ['Fijn: een week extra om te leren voor de toets', 'fijn', 'pos', ['week', 'toets']]],
    ['de nieuwe skatebaan kost 80.000 euro', ['Geldverspilling: 80.000 euro voor een skatebaan', 'geldverspilling', 'neg', ['euro', 'skatebaan']], ['Jongeren blij met nieuwe skatebaan van 80.000 euro', 'blij', 'pos', ['jongeren', 'skatebaan']]],
    ['er kwamen 12 klachten over het festival', ['Twaalf klachten over het lawaai van het festival', 'lawaai', 'neg', ['klachten', 'festival']], ['Maar 12 klachten op 20.000 festivalbezoekers', 'maar', 'pos', ['klachten', 'festivalbezoekers']]]
  ];
  var GEVOEL = { pos:'positief: het klinkt als goed nieuws', neg:'negatief: het klinkt als slecht nieuws', neu:'neutraal: alleen het feit, zonder kleur' };
  function maakFrame(R){
    var it = R.kies(FRAME), welk = R.heel(1, 2), kop = it[welk], rest = FRAME.filter(function(x){ return x !== it; });
    var ctx = 'Twee nieuwssites schrijven over hetzelfde nieuws. Ze kiezen allebei een andere kop.' +
      '<div class="lr-tekst" style="' + KAART + '"><p><b style="color:var(--lr-2)">Kop 1</b> ' + it[1][0] + '</p><p style="margin:0"><b style="color:var(--lr-2)">Kop 2</b> ' + it[2][0] + '</p></div>';
    return OP('Welk gevoel geeft kop ' + welk + '?', ctx, [
      K(R, 'Welk feit staat in allebei de koppen?', it[0], ander(R, rest.map(function(x){ return x[0]; }), [], 2), 'Wat is er echt gebeurd? Laat de woorden weg die een mening geven.'),
      K(R, 'Welk woord in kop ' + welk + ' geeft een kleur aan het nieuws?', kop[1], kop[3], 'Welk woord kun je weglaten zonder dat het feit verandert? Dat woord geeft een gevoel.',
        { waarom:'Zonder ' + q(kop[1]) + ' blijft het feit hetzelfde: ' + it[0] + '.' }),
      K(R, 'Welk gevoel wil kop ' + welk + ' je geven?', GEVOEL[kop[2]], [GEVOEL[kop[2] === 'pos' ? 'neg' : 'pos'], GEVOEL.neu], 'Het woord ' + q(kop[1]) + ': maakt dat het nieuws beter of erger?',
        { fout:fouten([GEVOEL.neu, 'Het woord ' + q(kop[1]) + ' geeft juist een kleur. De kop is dus niet neutraal.']) })
    ]);
  }

  /* --- twee bronnen vergelijken --- */
  /* weglaten: [maker 1, tekst 1, maker 2, tekst 2 (vollediger), in allebei, alleen in 2, staat nergens] */
  var VWEG = [
    ['BelBaas, een telefoonwinkel', 'De Nova X heeft een supercamera en een groot scherm. Nu voor € 499!', 'TechTest, een testsite', 'De Nova X heeft een goede camera en een groot scherm. Maar de batterij is na vijf uur al leeg.', 'de Nova X heeft een goede camera en een groot scherm', 'de batterij is snel leeg', 'de Nova X is waterdicht'],
    ['pretpark Avonturia zelf', 'Avonturia heeft twintig attracties en een gloednieuwe achtbaan. Kom snel!', 'Dagblad De Delta', 'Avonturia heeft twintig attracties en een nieuwe achtbaan. De achtbaan is wel vaak dicht door storingen.', 'Avonturia heeft twintig attracties en een nieuwe achtbaan', 'de achtbaan is vaak dicht door storingen', 'Avonturia is gratis voor kinderen'],
    ['Boost Energy, de maker van het drankje', 'Een blikje Boost geeft je meteen energie. Perfect voor een drukke dag!', 'een gezondheidssite van artsen', 'Een blikje Boost geeft snel energie. Maar er zit net zoveel suiker in als in acht suikerklontjes.', 'Boost geeft snel energie', 'er zit heel veel suiker in Boost', 'Boost is goed voor je tanden'],
    ['de gemeente', 'Het nieuwe fietspad langs de rivier is veilig en snel.', 'DeStadskrant.nl', 'Het nieuwe fietspad langs de rivier is veilig en snel. Voor de aanleg zijn wel dertig bomen gekapt.', 'het fietspad is veilig en snel', 'er zijn dertig bomen gekapt', 'het fietspad is twee kilometer lang'],
    ['de organisatie van het festival', 'Het festival was een groot succes, met veel bekende artiesten.', 'RegioNu.nl', 'Op het festival traden veel bekende artiesten op. Door de regen gingen veel bezoekers wel vroeg naar huis.', 'er traden veel bekende artiesten op', 'veel bezoekers gingen vroeg naar huis door de regen', 'het festival duurde drie dagen'],
    ['StudieMaat, de maker van de app', 'Met StudieMaat leer je sneller voor je toetsen.', 'een consumentensite', 'StudieMaat helpt je sneller leren. Maar je moet wel elke maand € 9,99 betalen.', 'StudieMaat helpt je sneller leren', 'de app kost elke maand geld', 'de app werkt ook zonder internet'],
    ['Camping De Duinen zelf', 'Onze camping ligt vlak bij het strand en heeft een zwembad.', 'een reviewsite', 'De camping ligt vlak bij het strand en heeft een zwembad. Dat zwembad is alleen in juli en augustus open.', 'de camping ligt bij het strand en heeft een zwembad', 'het zwembad is alleen in juli en augustus open', 'de camping heeft een eigen winkel'],
    ['de school', 'De nieuwe kantine heeft gezond en lekker eten.', 'de leerlingenkrant', 'De nieuwe kantine heeft gezond eten. De prijzen zijn wel bijna twee keer zo hoog als vorig jaar.', 'de kantine heeft gezond eten', 'de prijzen zijn bijna twee keer zo hoog', 'de kantine is ook in het weekend open']
  ];
  /* tegenspraak: [maker 1, tekst 1, maker 2 (weet het best), tekst 2, in allebei, waarin ze verschillen, iets anders] */
  var VTEGEN = [
    ['de organisatie van de demonstratie', 'Zaterdag demonstreerden 5000 mensen op het Plein voor meer fietspaden.', 'de politie', 'Op het Plein demonstreerden zaterdag ongeveer 2000 mensen voor meer fietspaden.', 'er was zaterdag een demonstratie voor meer fietspaden', 'hoeveel mensen er waren', 'hoe lang de demonstratie duurde', ['er demonstreerden 5000 mensen', 'de demonstratie was op zondag']],
    ['DeStadskrant.nl', 'De nieuwe sporthal is in maart klaar.', 'de bouwer van de sporthal', 'De bouw van de sporthal loopt vertraging op. Hij is pas in september klaar.', 'er komt een nieuwe sporthal', 'wanneer de sporthal klaar is', 'waar de sporthal komt', ['de sporthal is in maart klaar', 'de sporthal komt naast het zwembad']],
    ['@natuurnieuws', 'In het Kroonbos zijn drie wolven gezien!', 'de boswachter van het Kroonbos', 'In het Kroonbos is één wolf gezien, op een camera bij het meer.', 'er is een wolf gezien in het Kroonbos', 'hoeveel wolven er gezien zijn', 'wanneer de wolf gezien is', ['er zijn drie wolven gezien', 'de wolf is gezien bij de rivier']],
    ['RegioNu.nl', 'Een kaartje voor het concert kost € 25.', 'de website van de concertzaal', 'Kaartjes voor het concert kosten € 35.', 'er is een concert', 'wat een kaartje kost', 'hoe laat het concert begint', ['een kaartje kost € 25', 'het concert is uitverkocht']],
    ['de klassenapp', 'De bus voor de schoolreis vertrekt om 8.00 uur.', 'de brief van de school', 'De bus voor de schoolreis vertrekt om 8.30 uur bij het hek.', 'er gaat een bus voor de schoolreis', 'hoe laat de bus vertrekt', 'waar de schoolreis heen gaat', ['de bus vertrekt om 8.30 uur', 'de schoolreis gaat naar een pretpark']],
    ['@pretparkfan', 'De nieuwe achtbaan in Avonturia is 60 meter hoog!', 'de website van Avonturia', 'Onze nieuwe achtbaan is 40 meter hoog en gaat 90 kilometer per uur.', 'Avonturia heeft een nieuwe achtbaan', 'hoe hoog de achtbaan is', 'hoe lang de rij voor de achtbaan is', ['de achtbaan is 60 meter hoog', 'de achtbaan gaat 120 kilometer per uur']],
    ['@stadsnieuws_nu', 'De brug gaat maandag dicht voor onderhoud.', 'de gemeente', 'De brug gaat woensdag dicht voor onderhoud.', 'de brug gaat dicht voor onderhoud', 'op welke dag de brug dichtgaat', 'hoe lang de brug dicht blijft', ['de brug gaat maandag dicht', 'de brug blijft een maand dicht']]
  ];
  function maakVergelijk(R){
    var tegen = R.heel(1, 3) === 1, it = R.kies(tegen ? VTEGEN : VWEG), wissel = R.heel(0, 1) === 1;
    var b1 = { maker:it[0], tekst:it[1] }, b2 = { maker:it[2], tekst:it[3] };
    var A = wissel ? b2 : b1, B = wissel ? b1 : b2, X = wissel ? 'A' : 'B', Y = wissel ? 'B' : 'A';
    var ctx = 'Je vindt twee bronnen over hetzelfde onderwerp.' + bron({ naam:'Bron A', tekst:A.tekst, door:A.maker }) + bron({ naam:'Bron B', tekst:B.tekst, door:B.maker });
    var stap1 = K(R, 'Wat staat er in allebei de bronnen?', it[4], tegen ? it[7] : [it[5], it[6]], 'Lees bron A en bron B naast elkaar. Welk stuk komt in allebei voor?');
    if (tegen){
      return OP('Welke bron weet het best?', ctx, [
        stap1,
        K(R, 'Waarin spreken de bronnen elkaar tegen?', it[5], [it[6], 'nergens: ze zeggen precies hetzelfde'], 'Zoek een getal, een dag of een tijd. Staat er in bron A iets anders dan in bron B?'),
        V('Welke bron weet dit waarschijnlijk het best?', ['bron A', 'bron B'], X === 'A' ? 0 : 1, 'Wie gaat er zelf over, of wie heeft het zelf gezien of geteld? ' + hoofd(it[2]) + ' of ' + it[0] + '?',
          { waarom:hoofd(it[2]) + ' weet het uit de eerste hand.' })
      ]);
    }
    var VOL = 'bron ' + X + ': die noemt ook het minder goede nieuws', KORT = 'bron ' + Y + ': die is korter en positiever', EVEN = 'allebei even volledig';
    return OP('Welke bron is vollediger?', ctx, [
      stap1,
      K(R, 'Wat vertelt bron ' + X + ' wel en bron ' + Y + ' niet?', it[5], [it[4], it[6]], 'Kijk naar het laatste stuk van bron ' + X + '. Staat dat ook in bron ' + Y + '?'),
      K(R, 'Welke bron geeft het vollediger beeld?', VOL, [KORT, EVEN], 'Bron ' + X + ' vertelt ook: ' + it[5] + '. Bron ' + Y + ' laat dat weg.',
        { fout:fouten([KORT, 'Korter en positiever is niet vollediger. Bron ' + Y + ' laat iets belangrijks weg.', EVEN, 'Bron ' + X + ' vertelt meer: ' + it[5] + '.']),
          waarom:'Kijk ook wie bron ' + Y + ' maakte: ' + it[0] + '. Die heeft er belang bij om het minder goede nieuws weg te laten.' })
    ]);
  }

  /* ================= 3 INFORMATIE ZOEKEN ================= */

  /* --- zoekwoorden: [vraag, kern, [geen kern], wat wil je weten, goede zoekwoorden, te lang, te vaag] --- */
  var ZOEK = [
    ['Hoe lang leeft een olifant in het wild?', 'olifant', ['wild', 'lang'], 'hoe oud hij wordt', 'olifant leeftijd wild', 'ik wil graag weten hoe lang een olifant eigenlijk leeft in het wild', 'dieren'],
    ['Wanneer is de Eiffeltoren gebouwd?', 'Eiffeltoren', ['wanneer', 'gebouwd'], 'in welk jaar hij gebouwd is', 'Eiffeltoren bouwjaar', 'kan iemand mij vertellen wanneer die toren in Parijs is gebouwd', 'toren'],
    ['Hoeveel calorieën zitten er in een banaan?', 'banaan', ['hoeveel', 'zitten'], 'hoeveel calorieën erin zitten', 'banaan calorieën', 'hoeveel calorieën zitten er nou eigenlijk in zo’n banaan', 'fruit'],
    ['Waarom wordt de lucht rood als de zon ondergaat?', 'zonsondergang', ['waarom', 'wordt'], 'waarom de lucht dan rood wordt', 'zonsondergang rode lucht oorzaak', 'ik snap niet waarom de lucht soms rood wordt als de zon ondergaat', 'lucht'],
    ['Hoe laat gaat het zwembad in Almere open op zondag?', 'zwembad Almere', ['laat', 'gaat'], 'de openingstijden op zondag', 'zwembad Almere openingstijden zondag', 'hoe laat gaat dat zwembad in Almere eigenlijk open op een zondag', 'zwembad'],
    ['Hoeveel inwoners heeft Groningen?', 'Groningen', ['hoeveel', 'heeft'], 'het aantal inwoners', 'Groningen aantal inwoners', 'weet iemand hoeveel mensen er in de stad Groningen wonen', 'stad'],
    ['Welke dieren leven er op Antarctica?', 'Antarctica', ['welke', 'leven'], 'welke dieren daar leven', 'Antarctica dieren', 'wat voor soorten dieren leven er allemaal op Antarctica', 'kou'],
    ['Hoe maak je pannenkoeken zonder ei?', 'pannenkoeken', ['maak', 'zonder'], 'een recept zonder ei', 'pannenkoeken recept zonder ei', 'hoe kan ik thuis pannenkoeken bakken als ik geen eieren heb', 'eten'],
    ['Wie heeft de gloeilamp uitgevonden?', 'gloeilamp', ['wie', 'heeft'], 'wie de uitvinder is', 'gloeilamp uitvinder', 'wie was de persoon die ooit de gloeilamp heeft uitgevonden', 'licht'],
    ['Hoe ver is de maan van de aarde?', 'maan', ['ver', 'hoe'], 'de afstand tot de aarde', 'afstand maan aarde', 'hoe ver weg staat de maan nou eigenlijk van onze aarde', 'ruimte'],
    ['Hoe lang moet je een ei koken voor een zacht eitje?', 'zacht ei', ['moet', 'lang'], 'hoe lang het moet koken', 'zacht ei kooktijd', 'hoeveel minuten moet ik een ei koken als ik een zacht eitje wil', 'koken'],
    ['Waarom hebben zebra’s strepen?', 'zebra', ['waarom', 'hebben'], 'waarom hij strepen heeft', 'zebra strepen waarom', 'ik vraag me af waarom zebra’s eigenlijk strepen hebben', 'Afrika'],
    ['Wat is de hoogste berg van Europa?', 'berg in Europa', ['wat', 'is'], 'welke het hoogst is', 'hoogste berg Europa', 'ik moet voor school weten wat de allerhoogste berg van heel Europa is', 'bergen'],
    ['Hoeveel uur slaap heeft een tiener nodig?', 'slaap van een tiener', ['hoeveel', 'heeft'], 'hoeveel uur slaap nodig is', 'tiener slaap uren', 'hoeveel uur moet iemand van mijn leeftijd eigenlijk slapen', 'slapen'],
    ['Hoe oud werd Anne Frank?', 'Anne Frank', ['hoe', 'werd'], 'hoe oud ze werd', 'Anne Frank leeftijd', 'hoe oud was Anne Frank toen ze stierf, dat wil ik weten', 'oorlog'],
    ['Hoe hard kan een jachtluipaard rennen?', 'jachtluipaard', ['hard', 'kan'], 'hoe snel hij rent', 'jachtluipaard snelheid', 'hoe hard kan zo’n jachtluipaard nou eigenlijk rennen', 'katten']
  ];
  function maakZoek(R){
    var it = R.kies(ZOEK), rest = ZOEK.filter(function(x){ return x !== it; });
    return OP('Welke zoekwoorden kies je?', 'Je wilt dit opzoeken op internet: <b>' + it[0] + '</b>', [
      K(R, 'Waar gaat je vraag over? Wat is de kern?', it[1], it[2], 'Vraagwoorden als hoe, wat en hoeveel zijn nooit de kern. Over welk ding of welke persoon gaat het?'),
      K(R, 'Wat wil je precies weten?', it[3], ander(R, rest.map(function(x){ return x[3]; }), [], 2), 'Lees de vraag nog eens: ' + it[0]),
      K(R, 'Welke zoekwoorden zijn het best?', it[4], [it[5], it[6]], 'Goede zoekwoorden zijn de kern plus wat je wilt weten: ' + it[1] + ' en ' + it[3] + '. Laat de rest weg.',
        { fout:fouten([it[5], 'Dat is een hele zin. Laat de losse woorden weg en houd alleen de kern over.', it[6], 'Dat is te vaag: dan krijg je duizenden resultaten over van alles.']) })
    ]);
  }

  /* --- boeken met een inhoudsopgave en een register --- */
  /* hfd: [titel, over (voor in een zin), [onderwerpen]]; reg: [woord, vraag, [geen trefwoord], hoofdstuk] */
  var BOEKEN = [
    { titel:'Het grote dierenboek',
      hfd:[['Zoogdieren', 'zoogdieren', ['hoe lang een olifant zwanger is', 'waarom een walvis geen vis is']], ['Vogels', 'vogels', ['hoe een adelaar jaagt', 'waarom vogels in de herfst wegtrekken']],
        ['Vissen', 'vissen', ['hoe een haai ademt', 'waarom een zalm de rivier op zwemt']], ['Reptielen', 'reptielen', ['waarom een slang vervelt', 'hoe oud een schildpad kan worden']],
        ['Insecten', 'insecten', ['hoe bijen honing maken', 'hoe een rups een vlinder wordt']], ['Dieren in gevaar', 'dieren in gevaar', ['welke dieren bijna uitgestorven zijn', 'hoe je bedreigde dieren kunt helpen']]],
      reg:[['adelaar', 'Je wilt weten hoe hoog een adelaar kan vliegen.', ['hoog', 'vliegen'], 1], ['bever', 'Je wilt weten hoe een bever een dam bouwt.', ['dam', 'bouwen'], 0],
        ['dolfijn', 'Je wilt weten hoe een dolfijn slaapt.', ['slapen', 'nacht'], 0], ['egel', 'Je wilt weten wat een egel in de winter doet.', ['winter', 'stekels'], 0],
        ['giraf', 'Je wilt weten hoe lang de nek van een giraf is.', ['nek', 'lengte'], 0], ['haai', 'Je wilt weten hoeveel tanden een haai heeft.', ['tanden', 'bek'], 2],
        ['hagedis', 'Je wilt weten waarom een hagedis zijn staart kan loslaten.', ['staart', 'loslaten'], 3], ['krokodil', 'Je wilt weten hoe hard een krokodil kan bijten.', ['bijten', 'kaken'], 3],
        ['libel', 'Je wilt weten hoe snel een libel vliegt.', ['snel', 'vleugels'], 4], ['mier', 'Je wilt weten hoeveel een mier kan tillen.', ['tillen', 'kracht'], 4],
        ['neushoorn', 'Je wilt weten waarom de neushoorn bijna uitgestorven is.', ['uitgestorven', 'hoorn'], 5], ['pinguïn', 'Je wilt weten hoe diep een pinguïn kan duiken.', ['duiken', 'diep'], 1],
        ['uil', 'Je wilt weten waarom een uil ’s nachts jaagt.', ['nacht', 'jagen'], 1], ['walvis', 'Je wilt weten hoe zwaar een walvis is.', ['gewicht', 'zee'], 0]] },
    { titel:'Ons lichaam',
      hfd:[['Het skelet', 'het skelet', ['hoeveel botten je hebt', 'hoe een gebroken bot geneest']], ['Spieren', 'je spieren', ['hoe een spier samentrekt', 'waarom je spierpijn krijgt']],
        ['Hart en bloed', 'je hart en je bloed', ['hoe je hart pompt', 'waarom bloed rood is']], ['Ademhaling', 'de ademhaling', ['wat je longen doen', 'waarom je buiten adem raakt']],
        ['Spijsvertering', 'de spijsvertering', ['wat er in je maag gebeurt', 'hoe je eten wordt verteerd']], ['Zintuigen', 'je zintuigen', ['hoe je oog werkt', 'hoe je proeft en ruikt']]],
      reg:[['knie', 'Je wilt weten hoe je knie buigt.', ['buigen', 'been'], 0], ['rib', 'Je wilt weten hoeveel ribben je hebt.', ['hoeveel', 'borst'], 0],
        ['schedel', 'Je wilt weten hoe dik je schedel is.', ['dik', 'hoofd'], 0], ['kuit', 'Je wilt weten waarom je kramp in je kuit krijgt.', ['kramp', 'been'], 1],
        ['ader', 'Je wilt weten waarom je aders blauw lijken.', ['blauw', 'huid'], 2], ['hartslag', 'Je wilt weten wat een normale hartslag is.', ['normaal', 'sporten'], 2],
        ['long', 'Je wilt weten hoeveel lucht er in je longen past.', ['lucht', 'passen'], 3], ['middenrif', 'Je wilt weten wat je middenrif doet bij het ademen.', ['ademen', 'buik'], 3],
        ['maag', 'Je wilt weten hoeveel eten er in je maag past.', ['eten', 'buik'], 4], ['darm', 'Je wilt weten hoe lang je darm is.', ['lengte', 'buik'], 4],
        ['tong', 'Je wilt weten hoeveel smaken je tong kan proeven.', ['smaak', 'proeven'], 5], ['oor', 'Je wilt weten hoe je oor geluid opvangt.', ['geluid', 'horen'], 5],
        ['neus', 'Je wilt weten hoe je neus geuren ruikt.', ['geur', 'ruiken'], 5]] },
    { titel:'Alles over het weer',
      hfd:[['Wolken', 'wolken', ['welke soorten wolken er zijn', 'waarom wolken wit zijn']], ['Regen en sneeuw', 'regen en sneeuw', ['hoe een sneeuwvlok ontstaat', 'waarom het regent']],
        ['Wind en storm', 'wind en storm', ['hoe een orkaan ontstaat', 'hoe je windkracht meet']], ['Onweer', 'onweer', ['waarom het bliksemt', 'hoe ver weg een onweersbui is']],
        ['Het klimaat', 'het klimaat', ['waarom de aarde opwarmt', 'wat het verschil is tussen weer en klimaat']]],
      reg:[['stapelwolk', 'Je wilt weten hoe hoog een stapelwolk kan worden.', ['hoog', 'lucht'], 0], ['mist', 'Je wilt weten waarom het ’s ochtends vaak mistig is.', ['ochtend', 'zicht'], 0],
        ['hagel', 'Je wilt weten hoe groot een hagelsteen kan worden.', ['groot', 'ijs'], 1], ['ijzel', 'Je wilt weten waarom ijzel zo glad is.', ['glad', 'weg'], 1],
        ['regenboog', 'Je wilt weten hoeveel kleuren een regenboog heeft.', ['kleuren', 'zon'], 1], ['dauw', 'Je wilt weten waarom het gras ’s ochtends nat is van de dauw.', ['gras', 'ochtend'], 1],
        ['tornado', 'Je wilt weten hoe hard het waait in een tornado.', ['waaien', 'hard'], 2], ['donder', 'Je wilt weten waarom donder zo hard klinkt.', ['geluid', 'hard'], 3],
        ['bliksemafleider', 'Je wilt weten hoe een bliksemafleider werkt.', ['werken', 'dak'], 3], ['zeespiegel', 'Je wilt weten hoeveel de zeespiegel stijgt.', ['stijgen', 'water'], 4],
        ['broeikaseffect', 'Je wilt weten wat het broeikaseffect is.', ['aarde', 'warm'], 4]] },
    { titel:'Nederland vroeger',
      hfd:[['De prehistorie', 'de prehistorie', ['hoe hunebedden zijn gebouwd', 'hoe jagers en verzamelaars leefden']], ['De Romeinen', 'de Romeinen', ['hoe de Romeinen langs de Rijn woonden', 'hoe een Romeins legerkamp eruitzag']],
        ['De middeleeuwen', 'de middeleeuwen', ['hoe ridders leefden', 'waarom er kastelen werden gebouwd']], ['De Gouden Eeuw', 'de Gouden Eeuw', ['hoe de VOC handel dreef', 'welke schilders er toen leefden']],
        ['De Tweede Wereldoorlog', 'de Tweede Wereldoorlog', ['hoe Nederland werd bevrijd', 'hoe mensen in de oorlog onderdoken']]],
      reg:[['hunebed', 'Je wilt weten hoe zwaar de stenen van een hunebed zijn.', ['stenen', 'zwaar'], 0], ['mammoet', 'Je wilt weten wanneer de laatste mammoet leefde.', ['laatste', 'ijstijd'], 0],
        ['legioen', 'Je wilt weten hoeveel soldaten er in een Romeins legioen zaten.', ['soldaten', 'Romeins'], 1], ['aquaduct', 'Je wilt weten hoe een aquaduct water vervoerde.', ['water', 'vervoeren'], 1],
        ['ridder', 'Je wilt weten hoe zwaar het harnas van een ridder was.', ['harnas', 'zwaar'], 2], ['kasteel', 'Je wilt weten waarom er een gracht om een kasteel lag.', ['gracht', 'water'], 2],
        ['pest', 'Je wilt weten hoe de pest zich verspreidde.', ['ziekte', 'verspreiden'], 2], ['VOC', 'Je wilt weten welke schepen de VOC had.', ['schepen', 'handel'], 3],
        ['Rembrandt', 'Je wilt weten welke schilderijen Rembrandt maakte.', ['schilderijen', 'kunst'], 3], ['verzet', 'Je wilt weten wat het verzet deed in de oorlog.', ['oorlog', 'doen'], 4],
        ['Anne Frank', 'Je wilt weten waar Anne Frank ondergedoken zat.', ['onderduiken', 'huis'], 4]] }
  ];
  /* een boek met bladzijden: elk hoofdstuk krijgt een begin, elk trefwoord een bladzijde in zijn hoofdstuk */
  function maakBoek(R){
    var b = R.kies(BOEKEN), start = [], p = R.heel(3, 6);
    b.hfd.forEach(function(){ start.push(p); p += R.heel(14, 32); });
    var eind = p - 1, bezet = {};
    var reg = b.reg.map(function(r){
      var van = start[r[3]] + 1, tot = r[3] + 1 < start.length ? start[r[3] + 1] - 1 : eind, bl;
      do { bl = R.heel(van, tot); } while (bezet[bl]);
      bezet[bl] = 1;
      return { woord:r[0], vraag:r[1], niet:r[2], hfd:r[3], blz:bl };
    }).sort(function(x, y){ return x.woord.toLowerCase().localeCompare(y.woord.toLowerCase(), 'nl'); });
    return { b:b, start:start, reg:reg };
  }
  function inhoudHtml(B){
    return tabel(['', 'hoofdstuk', 'bladzijde'], B.b.hfd.map(function(h, i){ return [String(i + 1), h[0], String(B.start[i])]; }), B.b.titel + ': inhoud');
  }
  function registerHtml(B){
    return tabel(null, B.reg.map(function(r){ return [r.woord, String(r.blz)]; }), B.b.titel + ': register');
  }
  function maakInhoud(R){
    var B = maakBoek(R), i = R.heel(0, B.b.hfd.length - 1), h = B.b.hfd[i], onderwerp = R.kies(h[2]);
    var andere = ander(R, B.b.hfd.map(function(x){ return x[0]; }), [h[0]], 2);
    return OP('Op welke bladzijde begin je?', 'Je wilt lezen <b>' + onderwerp + '</b>. Je kijkt in de inhoudsopgave voor in het boek.' + inhoudHtml(B), [
      K(R, 'In welk hoofdstuk lees je ' + onderwerp + '?', h[0], andere, 'Waar gaat ' + q(onderwerp) + ' over? Welk hoofdstuk past daarbij?'),
      { tekst:'Op welke bladzijde begint het hoofdstuk ' + q(h[0]) + '?', antwoord:String(B.start[i]), hint:'Kijk in de rij van ' + h[0] + ' naar de laatste kolom.' }
    ]);
  }
  function maakRegister(R){
    var B = maakBoek(R), r = R.kies(B.reg);
    return OP('Op welke bladzijde kijk je?', r.vraag + ' Je zoekt in het register achter in het boek.' + registerHtml(B), [
      K(R, 'Welk trefwoord zoek je op in het register?', r.woord, r.niet, 'Een trefwoord is het ding of de persoon waar het om gaat. Welk woord uit de vraag staat in het register?',
        { fout:fouten([r.niet[0], q(r.niet[0]) + ' staat niet in het register. Zoek het belangrijkste woord.', r.niet[1], q(r.niet[1]) + ' staat niet in het register. Zoek het belangrijkste woord.']) }),
      { tekst:'Op welke bladzijde staat ' + q(r.woord) + '?', antwoord:String(r.blz), hint:'Het register staat op alfabet. Zoek bij de ' + r.woord.charAt(0).toUpperCase() + ' en kijk naar het getal erachter.' }
    ]);
  }
  var INH = 'in de inhoudsopgave', REG = 'in het register';
  function maakWaarZoek(R){
    var B = maakBoek(R), viaInhoud = R.heel(0, 1) === 1, vraag, blz, stap2;
    if (viaInhoud){
      var i = R.heel(0, B.b.hfd.length - 1), h = B.b.hfd[i];
      vraag = 'Je wilt het hele hoofdstuk over <b>' + h[1] + '</b> lezen.'; blz = B.start[i];
      stap2 = { tekst:'Op welke bladzijde begint het hoofdstuk ' + q(h[0]) + '?', antwoord:String(blz), hint:'Kijk in de inhoudsopgave in de rij van ' + h[0] + '.' };
    } else {
      var r = R.kies(B.reg); vraag = r.vraag.replace(/^Je wilt weten /, 'Je wilt weten ').replace(/\.$/, '') + '.'; blz = r.blz;
      stap2 = { tekst:'Op welke bladzijde staat ' + q(r.woord) + '?', antwoord:String(blz), hint:'Zoek ' + q(r.woord) + ' in het register, bij de ' + r.woord.charAt(0).toUpperCase() + '.' };
    }
    return OP('Waar zoek je, en op welke bladzijde?', vraag + ' Je hebt dit boek. Voorin staat de inhoudsopgave, achterin het register.' + inhoudHtml(B) + registerHtml(B), [
      V('Waar zoek je dit het handigst?', [INH, REG], viaInhoud ? 0 : 1, 'Een heel onderwerp vind je in de inhoudsopgave. Eén los woord zoek je in het register.',
        { fout:viaInhoud ? fouten([REG, 'Je zoekt een heel hoofdstuk, geen los woord. Hoofdstukken staan in de inhoudsopgave.']) : fouten([INH, 'In de inhoudsopgave staan alleen de hoofdstukken. Een los woord zoek je in het register.']) }),
      stap2
    ]);
  }

  /* --- scannen in een dienstregeling --- */
  var HALTES = ['Station', 'Markt', 'Ziekenhuis', 'Sportpark', 'Schoolstraat', 'Zwembad', 'Kerkplein', 'Bibliotheek', 'Winkelcentrum', 'Dorpshuis', 'Molenweg', 'Stadhuis'];
  function tijd(m){ var h = Math.floor(m / 60), mm = m % 60; return h + '.' + (mm < 10 ? '0' : '') + mm; }
  function tijdAnt(m){ var t = tijd(m), h = Math.floor(m / 60); var l = [t, t.replace('.', ':')]; if (h < 10) l.push('0' + t, '0' + t.replace('.', ':')); return l; }
  function maakScan(R){
    var haltes = R.hussel(HALTES).slice(0, 5), lijn = R.heel(2, 19), stuk = [0];
    for (var i = 1; i < 5; i++) stuk.push(stuk[i - 1] + R.heel(3, 7));
    var eerste = R.heel(13, 18) * 5 + 6 * 60, tussen = R.kies([15, 20, 30]), ritten = [0, 1, 2, 3].map(function(k){ return eerste + k * tussen; });
    function t(rit, h){ return ritten[rit] + stuk[h]; }
    var tab = tabel(['halte'].concat(['rit 1', 'rit 2', 'rit 3', 'rit 4']), haltes.map(function(h, hi){ return [h].concat(ritten.map(function(r, ri){ return tijd(t(ri, hi)); })); }), 'Buslijn ' + lijn);
    var soort = R.kies(['eerste', 'aankomst', 'duur']), X = R.heel(0, 3), Y, k;
    var rijFout = function(h){ return ander(R, haltes, [h], 2); };
    if (soort === 'eerste'){
      k = R.heel(0, 3);
      var nu = t(k, X) - R.heel(1, tussen - 1);
      return OP('Hoe laat gaat de eerste bus?', 'Je staat om <b>' + tijd(nu) + ' uur</b> bij halte <b>' + haltes[X] + '</b>.' + tab, [
        K(R, 'In welke rij kijk je?', haltes[X], rijFout(haltes[X]), 'Je staat bij ' + haltes[X] + '. Zoek die halte in de eerste kolom.'),
        { tekst:'Wat is in die rij de eerste tijd na ' + tijd(nu) + '?', antwoord:tijdAnt(t(k, X)), hint:'Lees de rij van ' + haltes[X] + ' van links naar rechts. Welke tijd komt als eerste na ' + tijd(nu) + '?',
          fout:k > 0 ? fouten([tijd(t(k - 1, X)), 'Die bus is al weg: ' + tijd(t(k - 1, X)) + ' is vóór ' + tijd(nu) + '.']) : null }
      ]);
    }
    if (soort === 'aankomst'){
      X = R.heel(0, 2); Y = R.heel(X + 1, 4); k = R.heel(0, 3);
      return OP('Hoe laat ben je bij ' + haltes[Y] + '?', 'Je neemt de bus van <b>' + tijd(t(k, X)) + ' uur</b> bij halte <b>' + haltes[X] + '</b>. Je stapt uit bij <b>' + haltes[Y] + '</b>.' + tab, [
        V('In welke kolom staat de bus van ' + tijd(t(k, X)) + ' bij ' + haltes[X] + '?', ['rit 1', 'rit 2', 'rit 3', 'rit 4'], k, 'Zoek eerst de rij van ' + haltes[X] + '. Kijk dan in welke kolom ' + tijd(t(k, X)) + ' staat.'),
        { tekst:'Ga in die kolom naar beneden tot de rij van ' + haltes[Y] + '. Welke tijd staat daar?', antwoord:tijdAnt(t(k, Y)), hint:'Blijf in de kolom rit ' + (k + 1) + ' en zoek de rij van ' + haltes[Y] + '.' }
      ]);
    }
    X = R.heel(0, 2); Y = R.heel(X + 1, 4); k = R.heel(0, 3);
    return OP('Hoeveel minuten duurt de rit?', 'Hoe lang zit je in de bus van <b>' + haltes[X] + '</b> naar <b>' + haltes[Y] + '</b>? Kijk naar rit ' + (k + 1) + '.' + tab, [
      { tekst:'Hoe laat vertrekt rit ' + (k + 1) + ' bij ' + haltes[X] + '?', antwoord:tijdAnt(t(k, X)), hint:'Zoek de rij van ' + haltes[X] + ' in de kolom rit ' + (k + 1) + '.' },
      { tekst:'Hoe laat is rit ' + (k + 1) + ' bij ' + haltes[Y] + '?', antwoord:tijdAnt(t(k, Y)), hint:'Zoek de rij van ' + haltes[Y] + ' in dezelfde kolom.' },
      { tekst:'Hoeveel minuten zit er tussen ' + tijd(t(k, X)) + ' en ' + tijd(t(k, Y)) + '?', antwoord:String(stuk[Y] - stuk[X]), eenheid:'minuten', hint:'Tel van ' + tijd(t(k, X)) + ' door tot ' + tijd(t(k, Y)) + '. Let op als je over het hele uur gaat.' }
    ]);
  }

  /* --- informatie uit een tabel --- */
  var PERS = ['Sanne', 'Daan', 'Mila', 'Noah', 'Yara', 'Sem', 'Lotte', 'Mohammed', 'Fenna', 'Jesse'];
  var VAKKEN = ['Nederlands', 'Engels', 'wiskunde', 'biologie', 'geschiedenis', 'aardrijkskunde', 'gym', 'muziek', 'tekenen', 'Frans', 'economie', 'techniek'];
  var DAGEN = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag'];
  var PLAATSEN = ['Bergdorp', 'Zandvoorde', 'Molenveld', 'Dijkhoven', 'Eikenrode', 'Haverdam', 'Lindewaard'];
  function euro(x){ var s = x.toFixed(2).replace('.', ','); return s; }
  function maakTabel(R){
    var soort = R.kies(['prijs', 'rooster', 'afstand']);
    if (soort === 'prijs'){
      var rij = [['kind', 'Kind', '0 t/m 12 jaar', 1, 12], ['tiener', 'Tiener', '13 t/m 17 jaar', 13, 17], ['volw', 'Volwassene', '18 t/m 64 jaar', 18, 64], ['senior', 'Senior', '65 jaar en ouder', 65, 85]];
      var basis = R.kies([3, 3.5, 4]), los = [basis, basis + 1, basis + 2.5, basis + 1.5];
      var kol = ['los kaartje', 'tienbadenkaart', 'maandabonnement'];
      var prijs = los.map(function(l){ return [l, l * 9, l * 6 + R.kies([0, 0.5, 1])]; });
      var tab = tabel(['', 'los kaartje', 'tienbadenkaart', 'maandabonnement'], rij.map(function(r, i){ return [r[1] + ' <span style="font-weight:400;' + GRIJS + '">(' + r[2] + ')</span>'].concat(prijs[i].map(function(p){ return '€ ' + euro(p); })); }), 'Prijzen Zwembad De Kolk');
      var ri = R.heel(0, 3), ki = R.heel(0, 2), wie = R.kies(PERS), oud = R.heel(rij[ri][3], rij[ri][4]);
      if (ri === 0 && oud < 6) oud = R.heel(6, 12);
      var p = prijs[ri][ki];
      return OP('Wat kost het?', wie + ' is <b>' + oud + ' jaar</b> en wil een <b>' + kol[ki] + '</b> kopen.' + tab, [
        K(R, 'In welke rij kijk je?', rij[ri][1], ander(R, rij.map(function(r){ return r[1]; }), [rij[ri][1]], 2), wie + ' is ' + oud + ' jaar. Kijk achter elke rij welke leeftijden erbij horen.'),
        K(R, 'In welke kolom kijk je?', kol[ki], kol.filter(function(k){ return k !== kol[ki]; }), wie + ' wil een ' + kol[ki] + '. Zoek dat woord bovenaan de tabel.'),
        { tekst:'Wat kost een ' + kol[ki] + ' voor ' + wie + '? €', antwoord:euro(p), hint:'Zoek het vakje waar de rij ' + rij[ri][1] + ' en de kolom ' + kol[ki] + ' elkaar kruisen.' }
      ]);
    }
    if (soort === 'rooster'){
      var r = [1, 2, 3, 4, 5, 6].map(function(){ return R.hussel(VAKKEN).slice(0, 5); });
      var tabR = tabel(['uur'].concat(DAGEN), r.map(function(rij, u){ return [(u + 1) + 'e uur'].concat(rij); }), 'Lesrooster klas 1C');
      var u = R.heel(0, 5), d = R.heel(0, 4), vak = r[u][d];
      return OP('Welk vak heb je?', 'Welk vak heb je op <b>' + DAGEN[d] + '</b> het <b>' + (u + 1) + 'e uur</b>?' + tabR, [
        K(R, 'In welke kolom kijk je?', DAGEN[d], ander(R, DAGEN, [DAGEN[d]], 2), 'De dagen staan bovenaan. Zoek ' + DAGEN[d] + '.'),
        K(R, 'In welke rij kijk je?', 'het ' + (u + 1) + 'e uur', ander(R, [1, 2, 3, 4, 5, 6].map(function(x){ return 'het ' + x + 'e uur'; }), ['het ' + (u + 1) + 'e uur'], 2), 'De uren staan in de eerste kolom.'),
        { tekst:'Welk vak heb je op ' + DAGEN[d] + ' het ' + (u + 1) + 'e uur?', antwoord:vak, hint:'Ga in de kolom van ' + DAGEN[d] + ' naar beneden tot het ' + (u + 1) + 'e uur.' }
      ]);
    }
    var pl = R.hussel(PLAATSEN).slice(0, 4), km = [];
    for (var a = 0; a < 4; a++){ km[a] = []; for (var b = 0; b < 4; b++) km[a][b] = a === b ? 0 : b < a ? km[b][a] : R.heel(8, 95); }
    var tabA = tabel([''].concat(pl), pl.map(function(p, a){ return [p].concat(km[a].map(function(x){ return x ? String(x) : '·'; })); }), 'Afstanden in kilometers');
    var A = R.heel(0, 3), B2 = R.kies([0, 1, 2, 3].filter(function(x){ return x !== A; }));
    return OP('Hoeveel kilometer is het?', 'Hoeveel kilometer is het van <b>' + pl[A] + '</b> naar <b>' + pl[B2] + '</b>?' + tabA, [
      K(R, 'In welke rij kijk je?', pl[A], ander(R, pl, [pl[A]], 2), 'Je vertrekt in ' + pl[A] + '. Zoek die plaats in de eerste kolom.'),
      K(R, 'In welke kolom kijk je?', pl[B2], ander(R, pl, [pl[B2], pl[A]], 2), 'Je gaat naar ' + pl[B2] + '. Zoek die plaats bovenaan.'),
      { tekst:'Hoeveel kilometer is het van ' + pl[A] + ' naar ' + pl[B2] + '?', antwoord:String(km[A][B2]), eenheid:'km', hint:'Zoek het vakje waar de rij ' + pl[A] + ' en de kolom ' + pl[B2] + ' elkaar kruisen.' }
    ]);
  }

  /* --- een infographic lezen --- */
  var INFO = [
    ['Hoe komen de leerlingen van het Delta College naar school?', ['fiets', 'lopen', 'bus', 'auto', 'anders']],
    ['Wat doen jongeren het liefst in hun vrije tijd?', ['gamen', 'sporten', 'vrienden zien', 'lezen', 'muziek maken']],
    ['Welk huisdier hebben de brugklassers?', ['hond', 'kat', 'vis', 'konijn', 'geen huisdier']],
    ['Hoe lang zitten jongeren per dag op hun telefoon?', ['minder dan 1 uur', '1 tot 2 uur', '2 tot 4 uur', 'meer dan 4 uur']],
    ['Wat eten leerlingen als ontbijt?', ['brood', 'yoghurt of muesli', 'niets', 'fruit', 'iets anders']],
    ['Welk vak vinden de leerlingen van klas 2 het leukst?', ['gym', 'tekenen', 'biologie', 'wiskunde', 'geschiedenis']]
  ];
  function procenten(R, n){
    for (;;){
      var w = []; for (var i = 0; i < n; i++) w.push(R.heel(3, 20));
      var som = w.reduce(function(a, b){ return a + b; }, 0), p = w.map(function(x){ return Math.round(x / som * 100); });
      var tot = p.reduce(function(a, b){ return a + b; }, 0), mx = p.indexOf(Math.max.apply(null, p)); p[mx] += 100 - tot;
      var max = Math.max.apply(null, p), uniek = {}, ok = p.every(function(x){ if (uniek[x] || x < 2) return false; uniek[x] = 1; return true; });
      if (ok && p.filter(function(x){ return x === max; }).length === 1) return p;
    }
  }
  function infographic(R, titel, cats, p){
    var rijH = 38, W = 560, L = 160, maxW = W - L - 60, mx = Math.max.apply(null, p);
    var s = '<svg class="lr-svg" viewBox="0 0 ' + W + ' ' + (cats.length * rijH + 8) + '" role="img" aria-label="' + R.schoon(titel) + '">';
    cats.forEach(function(c, i){
      var y = 4 + i * rijH, w = Math.max(4, p[i] / mx * maxW);
      s += '<text x="' + (L - 10) + '" y="' + (y + 22) + '" style="font-size:14px;text-anchor:end">' + R.schoon(c) + '</text>';
      s += '<rect x="' + L + '" y="' + (y + 6) + '" width="' + w + '" height="24" rx="6" style="fill:var(--lr-' + (i % 5 + 1) + ')"/>';
      s += '<text x="' + (L + w + 8) + '" y="' + (y + 23) + '" style="font-size:15px;font-weight:700">' + p[i] + '%</text>';
    });
    s += '</svg>';
    return '<div class="lr-tekst" style="' + KAART + '"><p style="margin:0 0 6px;font-weight:700">' + R.schoon(titel) + '</p>' + s + '<p style="margin:4px 0 0;' + GRIJS + '">Uit een enquête onder 400 jongeren.</p></div>';
  }
  function pctAnt(v){ return [String(v), v + '%', v + ' %', v + ' procent']; }
  function maakInfo(R){
    var it = R.kies(INFO), cats = it[1], p = procenten(R, cats.length), plaatje = infographic(R, it[0], cats, p);
    var titels = ander(R, INFO.filter(function(x){ return x !== it; }).map(function(x){ return x[0]; }), [], 2);
    var titelStap = K(R, 'Waar gaat de infographic over?', it[0], titels, 'Lees eerst de titel boven de balken.');
    var soort = R.kies(['getal', 'meest', 'verschil']), i = R.heel(0, cats.length - 1);
    if (soort === 'getal'){
      return OP('Hoeveel procent?', 'Hoeveel procent hoort bij <b>' + cats[i] + '</b>?' + plaatje, [
        titelStap,
        { tekst:'Zoek de balk van ' + q(cats[i]) + '. Welk getal staat erachter?', antwoord:pctAnt(p[i]), eenheid:'%', hint:'Zoek links het woord ' + q(cats[i]) + ' en kijk naar het getal aan het eind van die balk.' }
      ]);
    }
    if (soort === 'meest'){
      var mx = p.indexOf(Math.max.apply(null, p));
      return OP('Wat kozen de meeste jongeren?', 'Welk antwoord kozen de meeste jongeren?' + plaatje, [
        titelStap,
        K(R, 'Welke balk is het langst?', cats[mx], ander(R, cats, [cats[mx]], 2), 'Kijk welke balk het verst naar rechts gaat, of zoek het hoogste getal.')
      ]);
    }
    var j; do { j = R.heel(0, cats.length - 1); } while (j === i);
    var a = p[i] > p[j] ? i : j, b = a === i ? j : i;
    return OP('Hoeveel procentpunt scheelt het?', 'Hoeveel procentpunt scheelt het tussen <b>' + cats[a] + '</b> en <b>' + cats[b] + '</b>?' + plaatje, [
      { tekst:'Hoeveel procent hoort bij ' + q(cats[a]) + '?', antwoord:pctAnt(p[a]), eenheid:'%', hint:'Zoek de balk van ' + q(cats[a]) + '.' },
      { tekst:'Hoeveel procent hoort bij ' + q(cats[b]) + '?', antwoord:pctAnt(p[b]), eenheid:'%', hint:'Zoek de balk van ' + q(cats[b]) + '.' },
      { tekst:'Hoeveel procentpunt scheelt het? ' + p[a] + ' − ' + p[b] + ' =', antwoord:[String(p[a] - p[b]), (p[a] - p[b]) + ' procentpunt', (p[a] - p[b]) + ' procentpunten'], eenheid:'procentpunt',
        hint:'Het verschil tussen twee percentages heet procentpunt. Trek het kleinste getal af van het grootste: ' + p[a] + ' − ' + p[b] + '.' }
    ]);
  }

  /* --- een instructie lezen: [titel, tekst, [stappen in de goede volgorde], signaalwoorden] --- */
  var INSTR = [
    ['Aanmelden voor de schoolreis', 'Lever het formulier uiterlijk vrijdag in bij je mentor. Voordat je het inlevert, moet een ouder het ondertekenen. Vul eerst je naam en je klas in. Als laatste betaal je € 25 via de schoolapp.',
      ['je naam en klas invullen', 'een ouder laten ondertekenen', 'het formulier inleveren bij je mentor', '€ 25 betalen via de schoolapp'], 'voordat, eerst, als laatste'],
    ['Een tent opzetten', 'Zet de tent pas op nadat je een vlakke plek hebt gevonden. Begin dus met het zoeken van een vlakke plek. Steek de haringen in de grond zodra de tent staat. Span tot slot de scheerlijnen.',
      ['een vlakke plek zoeken', 'de tent opzetten', 'de haringen in de grond steken', 'de scheerlijnen spannen'], 'pas nadat, begin met, zodra, tot slot'],
    ['Een boek lenen in de bibliotheek', 'Scan als laatste je boeken bij de uitleenautomaat. Het allereerst laat je bij de balie een pas maken. Daarna zoek je de boeken uit die je wilt lenen. Voordat je gaat scannen, leg je je pas op de automaat.',
      ['een pas laten maken bij de balie', 'de boeken uitzoeken', 'je pas op de automaat leggen', 'de boeken scannen'], 'als laatste, het allereerst, daarna, voordat'],
    ['Noedels klaarmaken', 'Roer als laatste het kruidenzakje erdoor. Kook eerst een halve liter water. Doe de noedels in het kokende water. Laat ze daarna drie minuten koken.',
      ['water koken', 'de noedels in het water doen', 'de noedels drie minuten laten koken', 'het kruidenzakje erdoor roeren'], 'als laatste, eerst, daarna'],
    ['Een lekke band plakken', 'Plak als laatste de plakker op het gat. Haal eerst de band van de velg. Zoek daarna het gat door de binnenband in een bak water te houden. Schuur het plekje rond het gat ruw voordat je de plakker erop zet.',
      ['de band van de velg halen', 'het gat zoeken in een bak water', 'het plekje rond het gat ruw schuren', 'de plakker op het gat plakken'], 'als laatste, eerst, daarna, voordat'],
    ['Inloggen op de schoolsite', 'Klik als laatste op Inloggen. Open eerst de schoolsite. Vul daarna je leerlingnummer in. Voordat je op Inloggen klikt, typ je je wachtwoord.',
      ['de schoolsite openen', 'je leerlingnummer invullen', 'je wachtwoord typen', 'op Inloggen klikken'], 'als laatste, eerst, daarna, voordat'],
    ['Een plant verpotten', 'Zet de plant als laatste in de nieuwe pot en druk de aarde aan. Pak eerst een pot die groter is. Doe daarna een laagje verse aarde onderin. Haal de plant pas uit zijn oude pot als de nieuwe pot klaarstaat.',
      ['een grotere pot pakken', 'een laagje aarde onderin doen', 'de plant uit de oude pot halen', 'de plant in de nieuwe pot zetten'], 'als laatste, eerst, daarna, pas als'],
    ['Een spreekbeurt voorbereiden', 'Oefen je spreekbeurt als laatste hardop voor de spiegel. Kies eerst een onderwerp dat je leuk vindt. Zoek daarna informatie in boeken en op betrouwbare sites. Maak een spiekbriefje met kernwoorden voordat je gaat oefenen.',
      ['een onderwerp kiezen', 'informatie zoeken', 'een spiekbriefje maken', 'hardop oefenen'], 'als laatste, eerst, daarna, voordat'],
    ['Een cake bakken', 'Zet de cake als laatste vijftig minuten in de oven. Verwarm eerst de oven voor op 180 graden. Meng daarna boter, suiker, eieren en meel. Vet de bakvorm in voordat je het beslag erin giet.',
      ['de oven voorverwarmen', 'boter, suiker, eieren en meel mengen', 'de bakvorm invetten', 'de cake in de oven zetten'], 'als laatste, eerst, daarna, voordat'],
    ['Een pakket terugsturen', 'Breng het pakket als laatste naar het afgiftepunt. Meld het eerst aan op de website van de winkel. Print daarna het retourlabel. Plak het label op de doos voordat je de deur uitgaat.',
      ['het pakket aanmelden op de website', 'het retourlabel printen', 'het label op de doos plakken', 'het pakket naar het afgiftepunt brengen'], 'als laatste, eerst, daarna, voordat'],
    ['Een nieuwe telefoon instellen', 'Zet als laatste je apps terug. Laad de telefoon eerst helemaal op. Kies daarna je taal en je wifi. Maak een pincode voordat je je apps terugzet.',
      ['de telefoon helemaal opladen', 'je taal en je wifi kiezen', 'een pincode maken', 'je apps terugzetten'], 'als laatste, eerst, daarna, voordat'],
    ['Brandalarm op school', 'Ga als laatste op het schoolplein bij je klas staan. Stop eerst meteen met wat je doet. Laat je tas liggen en loop daarna rustig naar de dichtstbijzijnde uitgang. Wacht buiten op je docent voordat je naar het schoolplein loopt.',
      ['stoppen met wat je doet', 'rustig naar de uitgang lopen', 'buiten op je docent wachten', 'op het schoolplein bij je klas staan'], 'als laatste, eerst, daarna, voordat']
  ];
  var SIGFOUT = ['want, omdat, dus', 'bijvoorbeeld, zoals, ook', 'maar, toch, echter'];
  function maakInstr(R){
    var it = R.kies(INSTR), eerst = R.heel(0, 1) === 1, st = it[2], goed = eerst ? st[0] : st[3], tegen = eerst ? st[3] : st[0];
    var fout = {}; fout[tegen] = eerst ? 'Dat doe je juist als laatste. Kijk welk woord ervoor staat.' : 'Dat doe je juist als eerste.';
    return OP('Wat doe je ' + (eerst ? 'als eerste' : 'als laatste') + '?', 'Lees de instructie. Let op: de zinnen staan niet in de goede volgorde.' + bron({ kop:it[0], tekst:it[1] }), [
      K(R, 'Welke woorden in de tekst zeggen iets over de volgorde?', it[3], ander(R, SIGFOUT, [], 2), 'Zoek woorden die met tijd te maken hebben: wat komt eerst en wat komt later?'),
      K(R, 'Wat moet je ' + (eerst ? 'als eerste' : 'als laatste') + ' doen?', goed, [tegen, eerst ? st[2] : st[1]],
        eerst ? 'Zoek een woord als eerst, begin met of het allereerst. De eerste zin is niet altijd de eerste stap!' : 'Zoek een woord als als laatste of tot slot.', { fout:fout })
    ]);
  }

  /* --- een formulier lezen --- */
  var FORMS = [
    ['Aanmelden voor zwemles', [['Voornaam', 1], ['Achternaam', 1], ['Geboortedatum (dd-mm-jjjj)', 1], ['E-mailadres van je ouder', 1], ['Zwemdiploma’s die je al hebt', 0], ['Opmerkingen', 0]]],
    ['Een bibliotheekpas aanvragen', [['Voornaam', 1], ['Achternaam', 1], ['Geboortedatum (dd-mm-jjjj)', 1], ['Adres', 1], ['Telefoonnummer', 0], ['Favoriete soort boeken', 0]]],
    ['Inschrijven bij de voetbalclub', [['Naam', 1], ['Geboortedatum (dd-mm-jjjj)', 1], ['Adres', 1], ['Rugnummer dat je graag wilt', 0], ['Vorige club', 0], ['Allergieën', 0]]],
    ['Aanmelden voor de schoolreis', [['Naam', 1], ['Klas', 1], ['Geboortedatum (dd-mm-jjjj)', 1], ['Telefoonnummer van je ouder', 1], ['Dieet of allergie', 0], ['Met wie wil je in de bus?', 0]]],
    ['Aanmelden voor de muziekschool', [['Voornaam', 1], ['Achternaam', 1], ['Geboortedatum (dd-mm-jjjj)', 1], ['Instrument', 1], ['Hoe lang speel je al?', 0], ['Favoriete muziek', 0]]]
  ];
  function formHtml(f){
    return '<div class="lr-tekst" style="' + KAART + '"><p style="margin:0 0 8px;font-weight:700;font-size:1.08rem">' + f[0] + '</p>' +
      f[1].map(function(v){ return '<p style="margin:0 0 6px">' + v[0] + (v[1] ? ' <b style="color:var(--lr-2)">*</b>' : '') + '<span style="display:block;height:28px;border:1.5px solid var(--rand2);border-radius:8px;margin-top:2px"></span></p>'; }).join('') +
      '<p style="margin:6px 0 0;' + GRIJS + '">Velden met een * zijn verplicht.</p></div>';
  }
  function twee(n){ return (n < 10 ? '0' : '') + n; }
  function maakForm(R){
    var f = R.kies(FORMS);
    if (R.heel(0, 1)){
      var ja = f[1].filter(function(v){ return v[1]; }), nee = f[1].filter(function(v){ return !v[1]; }), g = R.kies(ja)[0];
      return OP('Welk veld is verplicht?', 'Je vult dit formulier in.' + formHtml(f), [
        K(R, 'Wat betekent het sterretje (*) achter een veld?', 'dit veld moet je invullen', ['dit veld mag je overslaan', 'dit veld vult de organisatie zelf in'], 'Lees de kleine regel onderaan het formulier.'),
        K(R, 'Welk van deze velden moet je verplicht invullen?', g, ander(R, nee.map(function(v){ return v[0]; }), [], 2), 'Kijk welk veld een * heeft.',
          { fout:(function(){ var x = {}; nee.forEach(function(v){ x[v[0]] = 'Achter ' + q(v[0]) + ' staat geen *. Dat veld mag je leeg laten.'; }); return x; })() })
      ]);
    }
    var d = R.heel(1, 28), m = R.heel(1, 12), j = R.heel(NU - 16, NU - 12), goed = twee(d) + '-' + twee(m) + '-' + j;
    var fout = {}; if (d + '-' + m + '-' + j !== goed) fout[d + '-' + m + '-' + j] = 'Het formulier vraagt twee cijfers voor de dag en de maand (dd-mm). Zet er een 0 voor.';
    if (d !== m && d <= 12) fout[twee(m) + '-' + twee(d) + '-' + j] = 'Eerst de dag, dan de maand.';
    fout[j + '-' + twee(m) + '-' + twee(d)] = 'Het jaar komt achteraan: jjjj staat aan het eind.';
    return OP('Wat vul je in?', 'Je bent geboren op <b>' + d + ' ' + MAANDEN[m - 1] + ' ' + j + '</b>. Je vult dit formulier in.' + formHtml(f), [
      K(R, 'Wat betekent dd-mm-jjjj?', 'dag-maand-jaar, met twee cijfers voor de dag en de maand', ['jaar-maand-dag', 'maand-dag-jaar'], 'd is dag, m is maand, j is jaar. Elke letter is één cijfer.'),
      { tekst:'Wat vul je in bij Geboortedatum?', antwoord:goed, hint:'Dag: ' + twee(d) + ', maand: ' + twee(m) + ' (' + MAANDEN[m - 1] + '), jaar: ' + j + '. Zet er streepjes tussen.', fout:fout }
    ]);
  }

  /* ================= 4 INFORMATIE VERWERKEN ================= */

  /* --- citeren: [wie, site, letterlijke zin, veranderde zin] --- */
  var CIT = [
    ['bioloog Eva Smit', 'Natuurweetjes.nl', 'Zonder bijen zouden veel planten geen vruchten krijgen.', 'Zonder bijen krijgen planten nooit meer vruchten.'],
    ['sportarts Ilse Meijer', 'Sportengezond.nl', 'Wie elke dag een uur beweegt, slaapt beter en kan zich beter concentreren.', 'Wie sport, haalt altijd betere cijfers.'],
    ['slaaponderzoeker Nadia El Amrani', 'Slaapinstituut-info.nl', 'Tieners hebben acht tot tien uur slaap per nacht nodig.', 'Tieners moeten minstens twaalf uur slapen.'],
    ['weerkundige Kees Dijkstra', 'Weerwijzer.nl', 'De zomers in Nederland worden steeds warmer en droger.', 'Het wordt in Nederland elke zomer heel heet.'],
    ['tandarts Femke Bos', 'Tandartsen-uitleg.nl', 'Twee keer per dag poetsen is de beste bescherming tegen gaatjes.', 'Eén keer per dag poetsen is genoeg.'],
    ['dierenarts Sander Kok', 'Dierenwelzijn-info.nl', 'Chocola is giftig voor honden, ook een klein stukje.', 'Een klein stukje chocola kan een hond geen kwaad.'],
    ['historicus Ruben Vos', 'Geschiedenisplein.nl', 'Zonder de handel over zee was de Republiek in de Gouden Eeuw nooit zo rijk geworden.', 'De Republiek werd in de Gouden Eeuw rijk door de landbouw.'],
    ['boswachter Anouk Visser', 'Natuurweetjes.nl', 'Wie in het bos op de paden blijft, helpt de dieren die er leven.', 'Dieren in het bos hebben last van alle wandelaars.'],
    ['schrijver Lotte Peters', 'Leesplein.nl', 'Wie veel leest, leert ongemerkt heel veel nieuwe woorden.', 'Wie veel leest, hoeft geen woordjes meer te leren.'],
    ['verkeersdeskundige Ahmed Bakkali', 'Veiligverkeer-uitleg.nl', 'Met een helm op is de kans op ernstig hoofdletsel veel kleiner.', 'Met een helm op kan je niets meer gebeuren.'],
    ['sterrenkundige Joost Hendriks', 'Sterrenkijker.nl', 'Op de maan is geen lucht, dus je hoort er ook geen geluid.', 'Op de maan is het heel stil, omdat er niemand woont.'],
    ['diëtist Sara Jansen', 'Gezondheidsplein-uitleg.nl', 'Een glas water is de beste dorstlesser die er is.', 'Frisdrank is net zo goed als water.'],
    ['milieudeskundige Tom Kramer', 'KennisKompas.nl', 'Elk jaar komt er veel plastic in zee terecht, en daar hebben dieren last van.', 'Al het plastic in zee komt uit Nederland.'],
    ['psycholoog Mirjam Brouwer', 'Jongerenpeiling.nl', 'Jongeren die vaak buiten spelen, voelen zich meestal vrolijker.', 'Jongeren die binnen blijven, zijn altijd somber.'],
    ['bioloog Eva Smit', 'Natuurweetjes.nl', 'Een octopus kan in een paar tellen van kleur veranderen.', 'Een octopus kan in een paar tellen van vorm veranderen.']
  ];
  function maakCitaat(R){
    var it = R.kies(CIT), wie = hoofd(it[0]), goed = wie + ' zegt: “' + it[2] + '” (bron: ' + it[1] + ')';
    var zonder = it[2], anders = wie + ' zegt: “' + it[3] + '” (bron: ' + it[1] + ')', geenBron = wie + ' zegt: “' + it[2] + '”';
    var fout = ander(R, [zonder, anders, geenBron], [], 2);
    return OP('Welk citaat is goed?', 'Je schrijft een werkstuk. Je wilt deze zin letterlijk overnemen.' + bron({ url:it[1], tekst:it[2], door:it[0] }), [
      K(R, 'Een citaat neem je letterlijk over. Wat zet je eromheen?', 'aanhalingstekens: “ ”', ['haakjes: ( )', 'een streep eronder'], 'Zo laat je zien dat de woorden niet van jou zijn, maar letterlijk van iemand anders.'),
      K(R, 'Wat zet je er verder bij?', 'wie het zei en waar het staat', ['je eigen mening erover', 'niets, de aanhalingstekens zijn genoeg'], 'De lezer moet kunnen nagaan waar de zin vandaan komt.'),
      K(R, 'Welk citaat is goed?', goed, fout, 'Een goed citaat heeft precies dezelfde woorden, aanhalingstekens, en de naam en de bron erbij.',
        { fout:fouten([zonder, 'Hier staan geen aanhalingstekens en geen bron. Zo lijkt het alsof jij het bedacht hebt.', anders, 'Tussen aanhalingstekens moeten precies dezelfde woorden staan. Hier is de zin veranderd.', geenBron, 'De bron ontbreekt. Waar kan de lezer dit nakijken?']) })
    ]);
  }

  /* --- parafraseren: [bronzin, kern, geen kern, goede parafrase, bijna letterlijk, betekenis veranderd] --- */
  var PARA = [
    ['Bijen zijn erg belangrijk, omdat ze bloemen bestuiven, waardoor er vruchten kunnen groeien.', 'bijen zorgen ervoor dat er vruchten groeien', 'bijen maken honing',
      'Bijen brengen stuifmeel van bloem naar bloem. Daardoor kunnen er vruchten ontstaan.', 'Bijen zijn heel belangrijk, omdat ze bloemen bestuiven, waardoor er vruchten kunnen groeien.', 'Bijen zijn belangrijk, omdat ze vruchten opeten.'],
    ['Tieners die ’s avonds lang op hun telefoon zitten, slapen vaak slechter, doordat het licht van het scherm hen wakker houdt.', 'schermlicht in de avond zorgt voor slechter slapen', 'tieners hebben een telefoon',
      'Het licht van een scherm houdt je wakker. Wie ’s avonds veel op zijn telefoon kijkt, slaapt daardoor vaak minder goed.', 'Tieners die ’s avonds lang op hun mobiel zitten, slapen vaak slechter, doordat het licht van het scherm hen wakker houdt.', 'Tieners slapen slecht, omdat ze ’s nachts berichten krijgen.'],
    ['In de Gouden Eeuw werd Amsterdam een van de rijkste steden ter wereld, vooral door de handel over zee.', 'Amsterdam werd rijk door handel over zee', 'Amsterdam is een oude stad',
      'Door de handel met schepen werd Amsterdam in de Gouden Eeuw heel rijk, rijker dan bijna elke andere stad.', 'In de Gouden Eeuw werd Amsterdam een van de rijkste steden van de wereld, vooral door de handel over zee.', 'In de Gouden Eeuw werd Amsterdam rijk door de landbouw.'],
    ['Wie elke dag een halfuur buiten beweegt, voelt zich vaak fitter en vrolijker.', 'buiten bewegen maakt je fitter en vrolijker', 'een halfuur is kort',
      'Ben je elke dag even buiten actief, dan voel je je vaak beter en blijer.', 'Wie elke dag een halfuur buiten beweegt, voelt zich vaak fitter en blijer.', 'Wie buiten beweegt, wordt altijd beter in sport.'],
    ['Plastic in zee breekt niet af, maar valt uiteen in kleine stukjes die vissen opeten.', 'plastic wordt kleine stukjes die vissen opeten', 'vissen leven in zee',
      'Plastic verdwijnt niet in zee. Het wordt steeds kleiner, en die stukjes komen in de maag van vissen terecht.', 'Plastic in de zee breekt niet af, maar valt uiteen in kleine stukjes die vissen opeten.', 'Plastic in zee lost na een tijdje helemaal op.'],
    ['Een egel houdt in de winter een winterslaap, omdat er dan bijna geen insecten te vinden zijn.', 'een egel slaapt in de winter, omdat er weinig eten is', 'egels hebben stekels',
      'Omdat een egel in de winter bijna geen insecten kan vinden om te eten, slaapt hij die maanden.', 'Een egel houdt ’s winters een winterslaap, omdat er dan bijna geen insecten te vinden zijn.', 'Een egel slaapt in de winter, omdat hij het koud heeft.'],
    ['Door de stijgende zeespiegel moeten de dijken in Nederland steeds hoger worden.', 'dijken moeten hoger door een hogere zee', 'Nederland heeft dijken',
      'Het zeewater komt steeds hoger. Daarom moeten de Nederlandse dijken omhoog.', 'Door de stijgende zeespiegel moeten de dijken in ons land steeds hoger worden.', 'Door de stijgende zeespiegel zijn dijken niet meer nodig.'],
    ['Wie hardop leest, onthoudt de tekst beter dan wie alleen in stilte leest.', 'hardop lezen helpt om beter te onthouden', 'lezen is leuk',
      'Lees je een tekst hardop voor, dan blijft hij beter hangen dan als je hem stil leest.', 'Wie hardop leest, onthoudt een tekst beter dan wie alleen in stilte leest.', 'Wie hardop leest, begrijpt de tekst niet.'],
    ['Een octopus kan van kleur veranderen om zich te verstoppen voor vijanden.', 'een octopus verandert van kleur om zich te verstoppen', 'een octopus woont in zee',
      'Om niet gezien te worden door vijanden, past een octopus zijn kleur aan.', 'Een octopus kan van kleur wisselen om zich te verstoppen voor vijanden.', 'Een octopus verandert van kleur als hij boos is.'],
    ['Fietsen naar school is goed voor je gezondheid en het is beter voor het milieu dan de auto.', 'fietsen is gezond en beter voor het milieu', 'veel leerlingen hebben een fiets',
      'Wie op de fiets naar school gaat, doet iets goeds voor zijn lijf. Bovendien vervuilt een fiets minder dan een auto.', 'Fietsen naar school is goed voor je gezondheid en het is beter voor het milieu dan de auto nemen.', 'Fietsen naar school is gevaarlijker dan met de auto.'],
    ['In een regenwoud leven meer soorten dieren dan in welk ander bos ook.', 'regenwouden hebben de meeste soorten dieren', 'het regent vaak in een regenwoud',
      'Geen enkel bos heeft zoveel verschillende diersoorten als het regenwoud.', 'In een regenwoud leven meer soorten dieren dan in elk ander bos.', 'In een regenwoud leven bijna geen dieren door de regen.'],
    ['Ontbijten helpt je om je ’s ochtends op school beter te concentreren.', 'ontbijt helpt je concentratie', 'school begint ’s ochtends',
      'Als je eet voordat je naar school gaat, kun je je aandacht beter bij de les houden.', 'Ontbijten helpt je om je ’s morgens op school beter te concentreren.', 'Ontbijten maakt je ’s ochtends juist slaperig.'],
    ['Vulkanen ontstaan vaak op plekken waar twee stukken van de aardkorst tegen elkaar aan duwen.', 'vulkanen ontstaan waar stukken aardkorst botsen', 'vulkanen zijn gevaarlijk',
      'Op plaatsen waar delen van de aardkorst tegen elkaar drukken, komen vaak vulkanen voor.', 'Vulkanen ontstaan vaak op plekken waar twee delen van de aardkorst tegen elkaar aan duwen.', 'Vulkanen ontstaan op plekken waar het heel warm weer is.'],
    ['Huiswerk maken met muziek op kan je afleiden, vooral als de muziek teksten heeft.', 'muziek met tekst leidt af bij huiswerk', 'veel jongeren luisteren muziek',
      'Luister je naar liedjes met tekst terwijl je huiswerk maakt, dan raak je sneller afgeleid.', 'Huiswerk maken met muziek aan kan je afleiden, vooral als de muziek teksten heeft.', 'Huiswerk maken met muziek op helpt je altijd beter te leren.'],
    ['Walvissen zijn geen vissen, maar zoogdieren: ze ademen lucht en drinken als jong melk.', 'walvissen zijn zoogdieren', 'walvissen zijn groot',
      'Een walvis is eigenlijk een zoogdier. Hij haalt adem boven water, en een jong drinkt melk bij zijn moeder.', 'Walvissen zijn geen vissen, maar zoogdieren: ze ademen lucht en drinken als jong melk bij hun moeder.', 'Walvissen zijn vissen die lucht kunnen ademen.']
  ];
  function maakParafrase(R){
    var it = R.kies(PARA), rest = PARA.filter(function(x){ return x !== it; });
    return OP('Welke parafrase klopt?', 'Je wilt deze zin <b>in je eigen woorden</b> in je werkstuk zetten.' + blok(it[0]), [
      K(R, 'Wat is de kern van de zin?', it[1], [it[2], R.kies(rest)[1]], 'Wat wil de zin vooral zeggen? Een los feitje is niet de kern.'),
      K(R, 'Welke parafrase klopt?', it[3], [it[4], it[5]], 'Een goede parafrase zegt hetzelfde, maar met andere woorden en vaak in een andere volgorde.',
        { fout:fouten([it[4], 'Hier zijn maar een of twee woorden veranderd. Dat is bijna letterlijk overgeschreven.', it[5], 'Dat is wel in eigen woorden, maar de betekenis klopt niet meer.']) })
    ]);
  }

  /* --- een bronvermelding maken --- */
  var AUTEURS = [['Sanne', 'Bakker'], ['Daan', 'Mulder'], ['Fatima', 'El Idrissi'], ['Lotte', 'Peters'], ['Ruben', 'Hendriks'], ['Mila', 'Jansen'], ['Youssef', 'Amrani'],
    ['Eva', 'Smit'], ['Joris', 'Kramer'], ['Noor', 'Vermeulen'], ['Tim', 'Brouwer'], ['Lisa', 'Koster']];
  var TITELS = ['Waarom bijen zo belangrijk zijn', 'Zo ontstaat een vulkaan', 'Plastic in de oceaan', 'Het leven van de Romeinen', 'Waarom we slapen', 'De kracht van de wind',
    'Hoe een egel de winter doorkomt', 'Het geheim van de octopus', 'Dijken in Nederland', 'De Gouden Eeuw in tien stappen', 'Het weer van morgen voorspellen', 'Wat je hart allemaal doet'];
  var SITES = ['Natuurweetjes.nl', 'KennisKompas.nl', 'Weetwolk.nl', 'Leerplein24.nl', 'Geschiedenisplein.nl', 'Sterrenkijker.nl', 'Lichaamwijzer.nl', 'Weerwijzer.nl'];
  function maakBronverm(R){
    var a = R.kies(AUTEURS), titel = R.kies(TITELS), site = R.kies(SITES), jaar = R.heel(NU - 11, NU - 1);
    var naam = a[1] + ', ' + a[0].charAt(0) + '.';
    var goed = naam + ' (' + jaar + '). ' + titel + '. ' + site;
    var fouteLijst = [naam + ' ' + titel + '. (' + jaar + '). ' + site, a[0] + ' ' + a[1] + ' (' + jaar + '). ' + titel + '. ' + site, naam + ' ' + titel + '. ' + site, site + ' (' + jaar + '). ' + titel + '. ' + naam];
    var f = fouten([fouteLijst[0], 'Het jaar staat op de verkeerde plek. Het komt meteen na de naam.', fouteLijst[1], 'Schrijf eerst de achternaam, dan een komma en de voorletter.', fouteLijst[2], 'Het jaar ontbreekt.', fouteLijst[3], 'De volgorde klopt niet: eerst de auteur, dan het jaar, de titel en als laatste de website.']);
    return OP('Welke bronvermelding is goed?', 'Je gebruikt dit artikel voor je werkstuk. Achteraan zet je een bronvermelding: <b>auteur (jaar). Titel. Website.</b>' +
      bron({ url:site, datum:'geplaatst op ' + datum(R, jaar), kop:titel, tekst:'In dit artikel lees je er alles over.', door:a[0] + ' ' + a[1] }), [
      K(R, 'Hoe schrijf je de auteur in een bronvermelding?', naam, [a[0] + ' ' + a[1], a[0].charAt(0) + '. ' + a[1]], 'Eerst de achternaam, dan een komma, dan de eerste letter van de voornaam met een punt.'),
      { tekst:'Welk jaar zet je tussen haakjes?', antwoord:String(jaar), hint:'Kijk bovenaan het artikel: wanneer is het geplaatst?' },
      K(R, 'Welke bronvermelding is goed?', goed, ander(R, fouteLijst, [], 2), 'De volgorde is: auteur (jaar). Titel. Website.', { fout:f })
    ]);
  }

  /* --- plagiaat herkennen --- */
  var PL_OVER = ['ja, letterlijk', 'ja, met maar een paar woorden anders', 'nee, het staat in eigen woorden'];
  var PL_BRON = ['aanhalingstekens én de bron', 'alleen de bron, geen aanhalingstekens', 'geen bron en geen aanhalingstekens'];
  var PL_JA = 'ja, dit is plagiaat', PL_NEE = 'nee, dit is geen plagiaat';
  /* soort: [hoe overgenomen, wat erbij staat, plagiaat?, uitleg] */
  var PLAGSOORT = {
    letterlijk:[0, 2, 1, 'Je neemt letterlijk over zonder aanhalingstekens en zonder bron. Dan doe je alsof het van jou is.'],
    bijna:[1, 2, 1, 'Een paar woorden veranderen is niet genoeg. Het is nog steeds overgeschreven, en er staat geen bron bij.'],
    citaat:[0, 0, 0, 'Letterlijk overnemen mag, als je er aanhalingstekens omheen zet en de bron noemt. Dit is een citaat.'],
    letterbron:[0, 1, 1, 'De bron staat erbij, maar de zin is letterlijk overgenomen zonder aanhalingstekens. Dan lijken de woorden van jou.'],
    eigen:[2, 1, 0, 'In eigen woorden met een bron erbij: zo hoort het.'],
    eigenzonder:[2, 2, 1, 'Ook als je iets in eigen woorden zegt, moet je de bron noemen. Het idee is niet van jou.']
  };
  function maakPlagiaat(R){
    var it = R.kies(PARA), site = R.kies(['Natuurweetjes.nl', 'KennisKompas.nl', 'Weetwolk.nl', 'Leerplein24.nl']), soort = R.kies(Object.keys(PLAGSOORT)), s = PLAGSOORT[soort];
    var tekst = soort === 'letterlijk' ? it[0] : soort === 'bijna' ? it[4] : soort === 'citaat' ? 'Op ' + site + ' staat: “' + it[0] + '”' :
      soort === 'letterbron' ? it[0] + ' (bron: ' + site + ')' : soort === 'eigen' ? it[3] + ' (bron: ' + site + ')' : it[3];
    var ctx = 'Een leerling gebruikte deze bron voor een werkstuk.' + bron({ naam:'De bron', url:site, tekst:it[0] }) + bron({ naam:'Wat de leerling schreef', tekst:tekst });
    return OP('Is dit plagiaat?', ctx, [
      V('Heeft de leerling de zin (bijna) letterlijk overgenomen?', PL_OVER, s[0], 'Leg de twee teksten naast elkaar. Zijn de woorden hetzelfde, bijna hetzelfde, of heel anders?'),
      V('Wat staat er bij de tekst van de leerling?', PL_BRON, s[1], 'Zoek aanhalingstekens “ ” en een stukje als (bron: ...).'),
      V('Is dit plagiaat?', [PL_JA, PL_NEE], s[2] ? 0 : 1, 'Overgenomen woorden horen tussen aanhalingstekens met een bron. Eigen woorden krijgen ook een bron. Ontbreekt er iets, dan is het plagiaat.',
        { waarom:s[3], fout:s[2] ? fouten([PL_NEE, s[3]]) : fouten([PL_JA, s[3]]) })
    ]);
  }

  /* --- aantekeningen maken: [tekst, onderwerp, [geen onderwerp], kernwoorden, hele zin, bijzaak] --- */
  var AANT = [
    ['Een koala slaapt wel twintig uur per dag. Dat komt doordat hij alleen eucalyptusbladeren eet. Daar zit heel weinig energie in. In een dierentuin in Australië woont een koala die zelfs 22 uur slaapt.', 'koala’s', ['dierentuinen', 'Australië'],
      'koala: slaapt 20 uur per dag, eet eucalyptus, weinig energie', 'Een koala slaapt wel twintig uur per dag, doordat hij alleen eucalyptusbladeren eet.', 'dierentuin Australië: koala slaapt 22 uur'],
    ['Vulkanen ontstaan waar stukken van de aardkorst botsen of uit elkaar gaan. Gesmolten steen komt dan naar boven. Boven de grond heet dat lava. In IJsland zijn wel dertig actieve vulkanen.', 'vulkanen', ['IJsland', 'steen'],
      'vulkaan: aardkorst botst of scheurt, gesmolten steen omhoog, boven de grond lava', 'Vulkanen ontstaan waar stukken van de aardkorst botsen of uit elkaar gaan, en dan komt gesmolten steen naar boven.', 'IJsland: dertig actieve vulkanen'],
    ['De Romeinen bouwden langs de Rijn een rij forten. Die grens heette de limes. Zo hielden ze vijanden buiten hun rijk. In Utrecht kun je nog resten van zo’n fort zien.', 'de Romeinse grens langs de Rijn', ['Utrecht', 'vijanden'],
      'Romeinen: forten langs Rijn, grens heet limes, vijanden buiten houden', 'De Romeinen bouwden langs de Rijn een rij forten en die grens heette de limes.', 'Utrecht: resten van een fort'],
    ['Je hart is een spier zo groot als je vuist. Het pompt bloed door je hele lichaam. Bij elke slag gaat er zuurstof naar je spieren. Bij een baby klopt het hart veel sneller dan bij een volwassene.', 'het hart', ['baby’s', 'vuisten'],
      'hart: spier, zo groot als vuist, pompt bloed, zuurstof naar spieren', 'Je hart is een spier zo groot als je vuist en het pompt bloed door je hele lichaam.', 'baby: hart klopt sneller'],
    ['Bij onweer zie je eerst de bliksem en hoor je daarna pas de donder. Dat komt doordat licht veel sneller gaat dan geluid. Tel de seconden ertussen en deel door drie, dan weet je hoeveel kilometer de bui weg is. Mijn opa deed dat altijd met mij.', 'onweer', ['opa’s', 'seconden'],
      'onweer: eerst bliksem, dan donder, licht sneller dan geluid, seconden gedeeld door 3 is afstand in km', 'Bij onweer zie je eerst de bliksem en hoor je daarna pas de donder.', 'opa telde altijd met mij'],
    ['Plastic in zee breekt niet af. Het valt uiteen in heel kleine stukjes: microplastics. Vissen eten die op, en zo komt plastic ook in ons eten. Op een strand in Zeeland vond een klas ooit duizend doppen op één dag.', 'plastic in zee', ['stranden', 'doppen'],
      'plastic in zee: breekt niet af, wordt microplastics, vissen eten het, komt in ons eten', 'Plastic in zee breekt niet af, maar het valt uiteen in heel kleine stukjes.', 'Zeeland: klas vond duizend doppen'],
    ['Bijen bestuiven bloemen. Ze brengen stuifmeel van de ene bloem naar de andere. Daardoor kunnen er vruchten groeien, zoals appels en peren. Een bij kan wel duizenden bloemen per dag bezoeken.', 'bijen en bestuiving', ['appels', 'peren'],
      'bijen: bestuiven bloemen, stuifmeel van bloem naar bloem, zo groeien vruchten', 'Bijen brengen stuifmeel van de ene bloem naar de andere, en daardoor kunnen er vruchten groeien.', 'één bij: duizenden bloemen per dag'],
    ['In de Gouden Eeuw was de Republiek heel rijk. Dat kwam vooral door de handel over zee. Schepen van de VOC haalden specerijen uit Azië. Op een schilderij in het museum zie je zo’n schip in de haven.', 'de Gouden Eeuw', ['schilderijen', 'Azië'],
      'Gouden Eeuw: Republiek rijk, handel over zee, VOC haalde specerijen uit Azië', 'In de Gouden Eeuw was de Republiek heel rijk, vooral door de handel over zee.', 'schilderij in museum: schip in haven'],
    ['Een regenboog ontstaat als de zon schijnt terwijl het regent. Het licht gaat door de druppels en valt uiteen in kleuren. Je ziet hem alleen als de zon achter je staat. Gisteren zag ik er een boven ons schoolplein.', 'de regenboog', ['schoolpleinen', 'druppels'],
      'regenboog: zon en regen tegelijk, licht door druppels valt uiteen in kleuren, zon achter je', 'Een regenboog ontstaat als de zon schijnt terwijl het regent.', 'gisteren boven het schoolplein'],
    ['Wolven leven in een roedel. Dat is een familie met ouders en jongen. Samen jagen ze op grote dieren, zoals herten. In het Kroonbos is vorig jaar één wolf op een camera gezien.', 'wolven', ['herten', 'camera’s'],
      'wolven: leven in roedel (familie), jagen samen op grote dieren', 'Wolven leven in een roedel, en dat is een familie met ouders en jongen.', 'Kroonbos: één wolf op camera'],
    ['Slapen is belangrijk voor je hersenen. Tijdens je slaap ruimen ze op wat je die dag hebt geleerd. Wie te weinig slaapt, onthoudt minder. Mijn broer slaapt in het weekend tot twaalf uur.', 'slaap en leren', ['broers', 'het weekend'],
      'slaap: hersenen ruimen geleerde op, te weinig slaap is minder onthouden', 'Tijdens je slaap ruimen je hersenen op wat je die dag hebt geleerd.', 'broer slaapt tot twaalf uur'],
    ['Een dijk beschermt het land tegen het water. Nederland ligt voor een groot deel onder zeeniveau. Zonder dijken zou het westen onder water staan. De Afsluitdijk is ruim dertig kilometer lang.', 'dijken in Nederland', ['de Afsluitdijk', 'het westen'],
      'dijk: beschermt tegen water, groot deel van NL onder zeeniveau, zonder dijken westen onder water', 'Een dijk beschermt het land tegen het water, want Nederland ligt voor een groot deel onder zeeniveau.', 'Afsluitdijk: ruim 30 km lang'],
    ['Een octopus is heel slim. Hij kan potjes openen en de weg vinden in een doolhof. Ook kan hij van kleur veranderen om zich te verstoppen. In een aquarium in Duitsland ontsnapte er ooit een octopus uit zijn bak.', 'de octopus', ['aquariums', 'Duitsland'],
      'octopus: slim, opent potjes, vindt weg in doolhof, verandert van kleur om te verstoppen', 'Een octopus is heel slim en hij kan potjes openen.', 'aquarium Duitsland: octopus ontsnapte']
  ];
  function maakAant(R){
    var it = R.kies(AANT);
    return OP('Welke aantekening is het best?', 'Je leest dit stukje voor je werkstuk en maakt aantekeningen.' + blok(it[0]), [
      K(R, 'Waar gaat dit stukje over?', it[1], it[2], 'Welk woord komt steeds terug? Een voorbeeld of een plaats is niet het onderwerp.'),
      K(R, 'Welke aantekening is het best?', it[3], [it[4], it[5]], 'Een goede aantekening heeft het onderwerp en de belangrijkste dingen in een paar kernwoorden. Geen hele zinnen, geen losse voorbeelden.',
        { fout:fouten([it[4], 'Dat is een hele zin overgeschreven. Dat kost veel tijd, en de rest van de kern ontbreekt.', it[5], 'Dat is een bijzaak: een los voorbeeld. De kern ontbreekt.']) })
    ]);
  }

  /* --- een schema kiezen: [soort, tekst, [labels], (bij tabel: twee foute paren)] --- */
  var SCHSOORT = {
    web:{ doet:'kenmerken van één onderwerp noemen', schema:'een woordweb', vraag:'Wat zet je in het midden van het woordweb?', hint:'In het midden van een woordweb staat het onderwerp. Waar gaan alle kenmerken over?' },
    tijd:{ doet:'gebeurtenissen in volgorde van tijd vertellen', schema:'een tijdlijn', vraag:'Wat zet je helemaal vooraan op de tijdlijn?', hint:'Vooraan op een tijdlijn staat wat het eerst gebeurde. Kijk naar jaartallen of woorden als eerst.' },
    keten:{ doet:'laten zien hoe het ene het andere veroorzaakt', schema:'een pijlenketen van oorzaak en gevolg', vraag:'Waarmee begint de pijlenketen?', hint:'De keten begint bij de eerste oorzaak: waar begint alles mee?' },
    tabel:{ doet:'twee dingen met elkaar vergelijken', schema:'een vergelijkingstabel met twee kolommen', vraag:'Wat zet je boven de twee kolommen?', hint:'Boven de kolommen staan de twee dingen die je vergelijkt.' }
  };
  var SCH = [
    ['web', 'De giraf is het hoogste dier op aarde. Hij heeft een lange nek, lange poten en een paarse tong. Hij eet bladeren van hoge bomen.', ['giraf', 'lange nek', 'paarse tong', 'eet bladeren']],
    ['web', 'Een vulkaan heeft bovenop een krater. Diep binnenin zit een magmakamer. Bij een uitbarsting komen er lava, as en gassen naar buiten.', ['vulkaan', 'krater', 'magmakamer', 'lava en as']],
    ['web', 'Een ridder droeg een harnas en had een zwaard en een schild. Hij woonde vaak in een kasteel en diende een heer.', ['ridder', 'harnas', 'zwaard en schild', 'kasteel']],
    ['web', 'De egel is een klein zoogdier met stekels. Hij eet insecten en slakken. In de winter houdt hij een winterslaap.', ['egel', 'stekels', 'eet insecten', 'winterslaap']],
    ['tijd', 'In 1940 viel Duitsland Nederland binnen. In 1942 dook Anne Frank onder in het Achterhuis. In 1944 werd ze gevonden en weggevoerd. In 1945 was Nederland weer vrij.', ['1940 inval', '1942 onderduiken', '1944 gevonden', '1945 bevrijding']],
    ['tijd', 'Eerst legt de vlinder een eitje. Uit het eitje komt een rups. De rups maakt een cocon. Na een paar weken kruipt er een vlinder uit.', ['eitje', 'rups', 'cocon', 'vlinder']],
    ['tijd', 'In de ochtend vertrok de klas met de bus. Rond twaalf uur kwamen ze aan in het museum. Na de lunch gingen ze naar het park. Om vijf uur waren ze weer terug op school.', ['vertrek met de bus', 'aankomst museum', 'naar het park', 'terug op school']],
    ['tijd', 'Om zeven uur gaat de wekker. Om half acht ontbijt Sara. Om acht uur fietst ze naar school. Om half negen begint de eerste les.', ['7.00 wekker', '7.30 ontbijt', '8.00 fietsen', '8.30 eerste les']],
    ['keten', 'Door hevige regen stijgt het water in de rivier. Daardoor komt er te veel druk op de dijk. Die breekt dan door. Zo loopt een dorp onder water.', ['hevige regen', 'water stijgt', 'dijk breekt', 'dorp onder water']],
    ['keten', 'Je gaat te laat naar bed. Daardoor slaap je te kort. De volgende dag ben je moe en kun je je slecht concentreren. Zo haal je een lager cijfer voor je toets.', ['laat naar bed', 'te kort slapen', 'moe en afgeleid', 'lager cijfer']],
    ['keten', 'Er wordt veel bos gekapt. Daardoor verliezen dieren hun leefgebied. Ze vinden minder eten. Zo sterven sommige soorten uit.', ['bos gekapt', 'leefgebied weg', 'minder eten', 'soorten sterven uit']],
    ['keten', 'Het wordt op aarde warmer. Daardoor smelt het ijs op de polen. Het water in de zee stijgt. Zo moeten de dijken hoger worden.', ['aarde warmer', 'ijs smelt', 'zeespiegel stijgt', 'dijken hoger']],
    ['tabel', 'Een hond en een kat zijn allebei populaire huisdieren. Een hond moet je elke dag uitlaten, een kat niet. Een hond is vaak erg trouw, een kat is zelfstandiger. Een kat kost meestal minder geld dan een hond.', ['hond', 'kat', 'uitlaten en trouw', 'huisdieren en geld']],
    ['tabel', 'Met de fiets en met de bus kun je naar school. De fiets is gratis, de bus kost geld. Op de fiets beweeg je, in de bus zit je stil. Als het regent, blijf je in de bus droog.', ['fiets', 'bus', 'gratis en geld', 'regen en droog']],
    ['tabel', 'Een e-book en een papieren boek verschillen nogal. Een e-book is licht, ook als je er honderd hebt. Een papieren boek heeft geen batterij nodig. Een e-book is vaak goedkoper.', ['e-book', 'papieren boek', 'licht en batterij', 'goedkoop en duur']],
    ['tabel', 'De Noordpool en de Zuidpool zijn allebei heel koud. Op de Noordpool leven ijsberen, op de Zuidpool pinguïns. De Zuidpool is land onder het ijs, de Noordpool is bevroren zee.', ['Noordpool', 'Zuidpool', 'ijsberen en pinguïns', 'land en zee']]
  ];
  /* tekst over twee regels als hij te lang is */
  function regels(R, t, x, y, max, extra){
    var w = String(t).split(' '), a = [], b = [];
    w.forEach(function(x2){ if ((a.join(' ') + ' ' + x2).trim().length <= max && !b.length) a.push(x2); else b.push(x2); });
    var st = 'font-size:13px;text-anchor:middle' + (extra || '');
    if (!b.length) return '<text x="' + x + '" y="' + (y + 5) + '" style="' + st + '">' + R.schoon(t) + '</text>';
    return '<text x="' + x + '" y="' + (y - 3) + '" style="' + st + '">' + R.schoon(a.join(' ')) + '</text><text x="' + x + '" y="' + (y + 13) + '" style="' + st + '">' + R.schoon(b.join(' ')) + '</text>';
  }
  function schemaSvg(R, soort, d, licht){
    var s = '<svg class="lr-svg" viewBox="0 0 560 200" role="img" aria-label="' + R.schoon(SCHSOORT[soort].schema) + '">';
    function vak(x, y, w, h, aan, rond){ return '<rect x="' + (x - w / 2) + '" y="' + (y - h / 2) + '" width="' + w + '" height="' + h + '" rx="' + (rond || 10) + '" style="fill:var(--kaart2);stroke:' + (aan ? 'var(--lr-2)' : 'var(--muted)') + ';stroke-width:' + (aan ? 3.5 : 1.5) + '"/>'; }
    var lijn = 'stroke:var(--muted);stroke-width:2';
    if (soort === 'web'){
      var pos = [[100, 40], [460, 40], [280, 172]];
      pos.forEach(function(p){ s += '<line x1="280" y1="96" x2="' + p[0] + '" y2="' + p[1] + '" style="' + lijn + '"/>'; });
      s += '<ellipse cx="280" cy="96" rx="70" ry="34" style="fill:var(--kaart2);stroke:' + (licht ? 'var(--lr-2)' : 'var(--muted)') + ';stroke-width:' + (licht ? 3.5 : 1.5) + '"/>' + regels(R, d[0], 280, 96, 16, ';font-weight:700');
      pos.forEach(function(p, i){ s += vak(p[0], p[1], 150, 40) + regels(R, d[i + 1], p[0], p[1], 20); });
    } else if (soort === 'tijd'){
      s += '<line x1="30" y1="80" x2="530" y2="80" style="' + lijn + '"/><path d="M530 80 l-10 -6 M530 80 l-10 6" style="' + lijn + '"/>';
      [80, 213, 346, 480].forEach(function(x, i){ s += '<circle cx="' + x + '" cy="80" r="' + (i === 0 && licht ? 10 : 7) + '" style="fill:' + (i === 0 && licht ? 'var(--lr-2)' : 'var(--muted)') + '"/>' + regels(R, d[i], x, 122, 16, i === 0 && licht ? ';font-weight:700' : ''); });
    } else if (soort === 'keten'){
      [70, 210, 350, 490].forEach(function(x, i){
        s += vak(x, 100, 120, 56, i === 0 && licht) + regels(R, d[i], x, 100, 15);
        if (i < 3) s += '<path d="M' + (x + 62) + ' 100 h16 m-7 -6 l7 6 l-7 6" style="' + lijn + ';fill:none"/>';
      });
    } else {
      s += vak(185, 40, 200, 40, licht, 6) + regels(R, d[0], 185, 40, 22, ';font-weight:700') + vak(375, 40, 200, 40, licht, 6) + regels(R, d[1], 375, 40, 22, ';font-weight:700');
      [80, 120, 160].forEach(function(y){ s += vak(185, y + 6, 200, 34, false, 6) + vak(375, y + 6, 200, 34, false, 6); });
    }
    return s + '</svg>';
  }
  function maakSchema(R){
    var it = R.kies(SCH), soort = it[0], d = it[2], S = SCHSOORT[soort], rest = Object.keys(SCHSOORT).filter(function(k){ return k !== soort; });
    var goed3, fout3;
    if (soort === 'web'){ goed3 = d[0]; fout3 = [d[1], d[2]]; }
    else if (soort === 'tijd'){ goed3 = d[0]; fout3 = [d[3], d[1]]; }
    else if (soort === 'keten'){ goed3 = d[0]; fout3 = [d[3], d[2]]; }
    else { goed3 = d[0] + ' en ' + d[1]; fout3 = [d[2], d[3]]; }
    var o = OP('Welk schema past bij de tekst?', 'Je wilt deze tekst in een schema zetten.' + blok(it[1]), [
        K(R, 'Wat doet de tekst vooral?', S.doet, ander(R, rest, [], 2).map(function(k){ return SCHSOORT[k].doet; }), 'Staan er jaartallen of woorden als eerst en daarna? Woorden als daardoor? Worden twee dingen vergeleken? Of gaat alles over één ding?'),
        K(R, 'Welk schema past daar het best bij?', S.schema, ander(R, rest, [], 2).map(function(k){ return SCHSOORT[k].schema; }), 'De tekst wil ' + S.doet + '. Welk schema laat dat zien?'),
        K(R, S.vraag, goed3, fout3, S.hint)
      ]);
    o.beeld = function(n){ return n >= 2 ? schemaSvg(R, soort, d, n >= 3) : ''; };
    return o;
  }

  /* --- twee bronnen samenvoegen: [onderwerp, [bron A: dubbel, eigen 1, eigen 2], [bron B: dubbel, nieuw], [kort: dubbel, alleen in A, nieuw in B]] --- */
  var SAMV = [
    ['de pinguïn', ['Pinguïns kunnen niet vliegen.', 'Ze leven vooral op het zuidelijk halfrond.', 'De keizerspinguïn is de grootste soort.'], ['Een pinguïn is een vogel die niet kan vliegen.', 'Pinguïns kunnen wel heel goed zwemmen.'], ['pinguïns kunnen niet vliegen', 'de keizerspinguïn is de grootste soort', 'pinguïns zwemmen heel goed']],
    ['de Eiffeltoren', ['De Eiffeltoren staat in Parijs.', 'Hij is gebouwd voor de wereldtentoonstelling van 1889.', 'Hij is gemaakt van ijzer.'], ['De beroemde toren in Parijs heet de Eiffeltoren.', 'Elk jaar bezoeken miljoenen mensen de toren.'], ['de toren staat in Parijs', 'hij is gemaakt van ijzer', 'miljoenen mensen bezoeken hem']],
    ['de egel', ['Een egel heeft stekels op zijn rug.', 'Hij eet insecten, wormen en slakken.', 'Een egel is vooral ’s nachts actief.'], ['Op de rug van een egel zitten stekels.', 'In de winter houdt een egel een winterslaap.'], ['een egel heeft stekels', 'hij eet insecten en slakken', 'hij houdt een winterslaap']],
    ['vulkanen', ['Een vulkaan spuwt lava en as.', 'De meeste vulkanen liggen rond de Grote Oceaan.', 'Er zijn ongeveer 1500 actieve vulkanen.'], ['Uit een vulkaan komen lava en as.', 'IJsland heeft veel vulkanen.'], ['er komen lava en as uit een vulkaan', 'er zijn ongeveer 1500 actieve vulkanen', 'IJsland heeft veel vulkanen']],
    ['de Romeinen', ['De Romeinen kwamen ongeveer 2000 jaar geleden naar Nederland.', 'Ze bouwden forten langs de Rijn.', 'Ze legden ook wegen aan.'], ['Langs de Rijn bouwden de Romeinen forten.', 'Romeinse soldaten droegen een helm en een schild.'], ['ze bouwden forten langs de Rijn', 'ze legden wegen aan', 'soldaten droegen een helm en een schild']],
    ['het hart', ['Je hart is een spier.', 'Het pompt bloed door je lichaam.', 'Het is ongeveer zo groot als je vuist.'], ['Het hart pompt het bloed rond in je lichaam.', 'In rust klopt het hart zo’n zeventig keer per minuut.'], ['het hart pompt bloed rond', 'het is zo groot als je vuist', 'het klopt zo’n zeventig keer per minuut']],
    ['de maan', ['De maan draait in ongeveer een maand om de aarde.', 'Op de maan is geen lucht.', 'In 1969 liepen er voor het eerst mensen op de maan.'], ['Op de maan kun je niet ademen, want er is geen lucht.', 'Je ziet altijd dezelfde kant van de maan.'], ['er is geen lucht op de maan', 'in 1969 liepen er mensen op de maan', 'je ziet altijd dezelfde kant']],
    ['bijen', ['Bijen maken honing.', 'Ze bestuiven bloemen.', 'Een bijenvolk heeft één koningin.'], ['Bijen zorgen voor de bestuiving van bloemen.', 'Er zijn in Nederland honderden soorten bijen.'], ['bijen bestuiven bloemen', 'een bijenvolk heeft één koningin', 'er zijn honderden soorten bijen']],
    ['de walvis', ['Een walvis is een zoogdier.', 'Hij ademt lucht door een blaasgat.', 'De blauwe vinvis is het grootste dier dat ooit heeft geleefd.'], ['Walvissen zijn geen vissen, maar zoogdieren.', 'Jonge walvissen drinken melk bij hun moeder.'], ['een walvis is een zoogdier', 'de blauwe vinvis is het grootste dier', 'jongen drinken melk']],
    ['de fiets', ['Nederland heeft meer fietsen dan inwoners.', 'Fietsen is goed voor je gezondheid.', 'De eerste fiets had nog geen trappers.'], ['Er zijn in Nederland meer fietsen dan mensen.', 'Nederland heeft heel veel kilometers fietspad.'], ['er zijn meer fietsen dan inwoners', 'de eerste fiets had geen trappers', 'er zijn veel kilometers fietspad']],
    ['de octopus', ['Een octopus heeft acht armen.', 'Hij heeft drie harten.', 'Hij kan van kleur veranderen.'], ['Een octopus kan zijn kleur aanpassen.', 'Een octopus heeft blauw bloed.'], ['hij kan van kleur veranderen', 'hij heeft drie harten', 'hij heeft blauw bloed']],
    ['onweer', ['Bij onweer zie je bliksem.', 'Daarna hoor je de donder.', 'Licht gaat sneller dan geluid.'], ['Eerst zie je de bliksem, pas daarna hoor je de donder.', 'Schuil bij onweer nooit onder een boom.'], ['eerst de bliksem, dan de donder', 'licht gaat sneller dan geluid', 'schuil niet onder een boom']]
  ];
  function maakSamen(R){
    var it = R.kies(SAMV), A = it[1], B = it[2], k = it[3];
    var goed = A.join(' ') + ' ' + B[1], dubbel = A.join(' ') + ' ' + B.join(' '), mist = A.join(' ');
    var ctx = 'Je schrijft een stukje over <b>' + it[0] + '</b>. Je hebt twee bronnen.' + bron({ naam:'Bron A', tekst:A.join(' ') }) + bron({ naam:'Bron B', tekst:B.join(' ') });
    return OP('Welke samengevoegde tekst is goed?', ctx, [
      K(R, 'Welk feit staat in allebei de bronnen?', k[0], [k[1], k[2]], 'Zoek een feit dat in bron A staat en in bron B ook, met andere woorden.'),
      K(R, 'Welk feit is nieuw in bron B?', k[2], [k[0], k[1]], 'Lees bron B. Welk feit kende je nog niet uit bron A?'),
      K(R, 'Welke samengevoegde tekst is goed?', goed, [dubbel, mist], 'Een goede tekst noemt elk feit één keer: alles uit bron A, plus het nieuwe feit uit bron B.',
        { fout:fouten([dubbel, 'Hier staat hetzelfde feit twee keer in: ' + k[0] + '.', mist, 'Hier mist het nieuwe feit uit bron B: ' + k[2] + '.']) })
    ]);
  }

  /* ================= de groepen ================= */
  function D(id, naam, kort, uit, wanneer, maak, beeld){ var d = { id:id, naam:naam, kort:kort, uit:uit, wanneer:wanneer, maak:maak }; if (beeld) d.beeld = beeld; return d; }
  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'bron-betrouw', niveau:'1F', domein:'lezen', naam:'Betrouwbare bronnen', kd:['nl2C.a', 'nl2C.c'],
        uit:'Niet alles wat je leest, klopt. Kijk wie de maker is, wanneer de bron gemaakt is, wat voor bron het is en of de maker er iets aan verdient. En twijfel je? Check het in een tweede bron.' },
      doelen:[
        D('bron-maker', 'Wie is de maker?', 'Kijk wie de bron gemaakt heeft: een deskundige, een verkoper, een bekend persoon of een onbekend account',
          '<p>Vraag je bij elke bron eerst af: <b>wie heeft dit gemaakt?</b> De naam staat vaak onderaan of bovenaan.</p><p>Een <b>deskundige</b> weet veel van het onderwerp: een arts over je gezondheid, een bioloog over dieren. Een <b>bedrijf</b> wil vaak iets verkopen. Van een <b>onbekend account</b> weet je niet wie het is. En een <b>bekend persoon</b> is niet vanzelf deskundige.</p>',
          'je iets leest en wilt weten of je het kunt geloven.', maakMaker),
        D('bron-datum', 'Wanneer is de bron gemaakt?', 'Kijk naar de datum en vraag je af of de informatie snel verandert',
          '<p>Kijk naar de <b>datum</b> van de bron. Reken uit hoe oud hij is.</p><p>Verandert de informatie <b>snel</b>, zoals prijzen, openingstijden of de nieuwste telefoons? Dan moet de bron nieuw zijn. Verandert de informatie <b>niet</b>, zoals hoeveel poten een spin heeft? Dan mag de bron ouder zijn.</p>',
          'je informatie zoekt die klopt voor vandaag.', maakDatum),
        D('bron-soort', 'Wat voor soort bron?', 'Een nieuwssite, reclame, een blog, een encyclopedie of sociale media: elke soort wil iets anders',
          '<p>Elke <b>soort bron</b> herken je aan de vorm.</p><p>Een <b>nieuwssite</b> vertelt wat er gebeurd is, met een datum. <b>Reclame</b> heeft een product en een prijs. Op een <b>blog</b> schrijft iemand over zichzelf. Een <b>encyclopedie</b> legt zakelijk uit. Op <b>sociale media</b> deelt iedereen snel iets, vaak zonder controle.</p>',
          'je wilt weten wat een bron met jou wil.', maakSoort),
        D('bron-belang', 'Wil de maker iets van je?', 'Vraag je af wat de maker eraan heeft als jij hem gelooft',
          '<p>Sommige makers hebben er <b>belang</b> bij dat jij iets gelooft. Een melkfabriek zegt dat melk onmisbaar is, want dan verkoopt hij meer melk.</p><p>Vraag je af: <b>wat heeft de maker eraan</b> als ik dit geloof of doe? Verdient hij er iets aan, dan is de bron <b>niet neutraal</b>. Zoek dan ook een andere bron.</p>',
          'een tekst je iets wil laten kopen, kiezen of vinden.', maakBelang),
        D('bron-check', 'Check het in een tweede bron', 'Twijfel je? Zoek het op bij een betrouwbare bron die niets met de eerste te maken heeft',
          '<p>Lees je iets wat vreemd klinkt? <b>Check het</b> in een tweede bron.</p><p>Kies een bron die er <b>verstand</b> van heeft en <b>los staat</b> van de eerste: een encyclopedie, de officiële website of een site van deskundigen. Likes en reacties zeggen niets: ook onzin kan heel vaak gedeeld worden.</p>',
          'je een bericht ziet en twijfelt of het klopt.', maakCheck),
        D('bron-kies', 'Welke bron is het betrouwbaarst?', 'Streep de verkoper en de onbekende of oude bron weg, en kies de deskundige',
          '<p>Je zoekt iets op en krijgt drie resultaten. Welke kies je?</p><p>Streep eerst de bron weg die iets wil <b>verkopen</b>. Streep dan de bron weg van een <b>onbekende maker</b> of een bron die <b>heel oud</b> is. Wat overblijft, is vaak de bron van een <b>deskundige</b>: die is het betrouwbaarst.</p>',
          'je moet kiezen welke bron je gebruikt voor een werkstuk.', maakDrie)
      ] },
    { groep:{ id:'bron-misleid', niveau:'2F', domein:'lezen', naam:'Misleiding herkennen', kd:['nl2C.b', 'nl2B.c'],
        uit:'Sommige bronnen proberen je om de tuin te leiden: met een kop die te veel belooft, een foto van iets anders, een nepsite, reclame die op nieuws lijkt of gekleurde woorden. Leer de trucs herkennen.' },
      doelen:[
        D('bron-clickbait', 'Een kop die te veel belooft', 'Vergelijk de kop met de tekst: zegt de tekst echt wat de kop belooft?',
          '<p>Sommige koppen beloven veel meer dan er in de tekst staat. Ze willen alleen dat je klikt. Dat heet <b>clickbait</b>.</p><p>Lees eerst de kop en vraag je af wat die belooft. Lees dan de tekst: <b>wat staat er echt?</b> Let op woorden als <i>schok, nooit, iedereen, je gelooft nooit</i> en veel uitroeptekens.</p>',
          'een kop heel spannend of schokkend klinkt.', maakClick),
        D('bron-foto', 'Een foto bij het verkeerde nieuws', 'Zoek de foto op: is hij echt op die plek en op die dag gemaakt?',
          '<p>Een foto kan echt zijn, maar toch bij het <b>verkeerde nieuws</b> staan. Een oude foto van een overstroming in een ander land wordt dan gebruikt voor nieuws van vandaag.</p><p>Je kunt de foto opzoeken met <b>omgekeerd zoeken</b>: je zoekt met de foto zelf. Dan zie je <b>waar en wanneer</b> hij voor het eerst online stond. Let ook op dingen die niet passen, zoals palmbomen in Nederland.</p>',
          'een foto je erg verbaast of boos maakt.', maakFoto),
        D('bron-nep', 'Nepsites en nepaccounts', 'Kijk naar het adres of de accountnaam, en zoek een echte afzender',
          '<p>Een <b>nepsite</b> herken je vaak aan het <b>adres</b>: extra woorden, een rare extensie zoals .xyz of .top, of een tikfout in de naam.</p><p>Een <b>nepaccount</b> is vaak nieuw, heeft een naam met cijfers, plaatst heel veel of doet een bekend account na met bijna geen volgers.</p><p>Kijk ook of er een <b>afzender</b> staat: een adres, een e-mail of een link naar de officiële website.</p>',
          'een site of account je om geld of gegevens vraagt.', maakNep),
        D('bron-reclame', 'Reclame die op nieuws lijkt', 'Zoek het kleine label: advertorial, gesponsord, betaalde samenwerking of #reclame',
          '<p>Soms ziet <b>reclame</b> eruit als een gewoon nieuwsbericht of een gewone post. Er is dan voor betaald door een merk.</p><p>Je herkent het aan een klein <b>label</b>: <i>advertorial, gesponsord, advertentie, in samenwerking met, betaalde samenwerking, #reclame</i>. Staat het er, dan wil de tekst je iets laten kopen.</p>',
          'een bericht of post heel positief is over één product.', maakRecl),
        D('bron-framing', 'Framing: dezelfde feiten, een ander gevoel', 'Zoek het woord dat je kunt weglaten zonder dat het feit verandert: dat woord kleurt',
          '<p>Twee koppen kunnen hetzelfde <b>feit</b> geven en toch een heel ander gevoel. <i>Maar liefst 200 bezoekers</i> klinkt goed, <i>slechts 200 bezoekers</i> klinkt slecht.</p><p>Dat heet <b>framing</b>. Zoek het woord dat je kunt weglaten zonder dat het feit verandert. Dat woord <b>kleurt</b> het nieuws positief of negatief.</p>',
          'je merkt dat een kop je blij of boos wil maken.', maakFrame),
        D('bron-vergelijk', 'Twee bronnen vergelijken', 'Zet twee bronnen naast elkaar: wat zeggen ze allebei, wat laat de een weg en waar spreken ze elkaar tegen?',
          '<p>Lees je twee bronnen over hetzelfde, <b>vergelijk</b> ze dan.</p><p>Wat staat er in <b>allebei</b>? Wat vertelt de ene bron <b>wel</b> en de andere <b>niet</b>? Een maker die er belang bij heeft, laat het minder goede nieuws vaak weg.</p><p>Spreken de bronnen elkaar <b>tegen</b>, bijvoorbeeld over een getal? Kijk dan wie het uit de eerste hand weet.</p>',
          'je twee bronnen hebt die niet helemaal hetzelfde zeggen.', maakVergelijk)
      ] },
    { groep:{ id:'info-zoek', niveau:'1F', domein:'lezen', naam:'Informatie zoeken', kd:['nl2A.f', 'nl2B.d'],
        uit:'Je hoeft niet alles te lezen om te vinden wat je zoekt. Kies goede zoekwoorden, gebruik een inhoudsopgave of register, scan een tabel of dienstregeling, en lees een instructie of formulier in de goede volgorde.' },
      doelen:[
        D('info-zoekwoord', 'Goede zoekwoorden kiezen', 'Zoek met de kern van je vraag plus wat je wilt weten, zonder hele zinnen',
          '<p>Zoek je iets op internet, typ dan geen hele zin. Kies <b>zoekwoorden</b>.</p><p>Neem de <b>kern</b> van je vraag: het ding of de persoon waar het om gaat. Zet erbij <b>wat je wilt weten</b>. Bijvoorbeeld: <i>Hoe lang leeft een olifant in het wild?</i> wordt <b>olifant leeftijd wild</b>.</p><p>Te vaag, zoals <i>dieren</i>, geeft duizenden resultaten over van alles.</p>',
          'je iets opzoekt met een zoekmachine.', maakZoek),
        D('info-inhoud', 'Zoeken in de inhoudsopgave', 'Bedenk bij welk hoofdstuk je onderwerp hoort en kijk op welke bladzijde het begint',
          '<p>Voor in een boek staat de <b>inhoudsopgave</b>: alle hoofdstukken met de bladzijde waar ze beginnen.</p><p>Bedenk eerst bij <b>welk hoofdstuk</b> je onderwerp hoort. Hoe een adelaar jaagt, staat bij <i>Vogels</i>. Kijk dan op welke <b>bladzijde</b> dat hoofdstuk begint.</p>',
          'je een heel onderwerp in een boek zoekt.', maakInhoud),
        D('info-register', 'Zoeken in het register', 'Kies het trefwoord en zoek het op alfabet achter in het boek',
          '<p>Achter in een boek staat vaak een <b>register</b>: een lijst met trefwoorden op <b>alfabet</b>, met de bladzijden waar ze staan.</p><p>Kies eerst het <b>trefwoord</b>: het ding of de persoon waar het om gaat. Zoek het dan op bij de goede letter en lees het getal erachter.</p>',
          'je één los woord of begrip in een boek zoekt.', maakRegister),
        D('info-waar', 'Inhoudsopgave of register?', 'Een heel onderwerp: inhoudsopgave. Eén los woord: register',
          '<p>Je kunt op twee plekken zoeken in een boek.</p><p>Zoek je een <b>heel onderwerp</b> of hoofdstuk? Kijk dan voorin, in de <b>inhoudsopgave</b>. Zoek je <b>één los woord</b>, zoals een dier of een persoon? Kijk dan achterin, in het <b>register</b>.</p>',
          'je een boek hebt en snel iets wilt vinden.', maakWaarZoek),
        D('info-scan', 'Scannen in een dienstregeling', 'Zoek eerst de goede rij of kolom en lees dan alleen dat ene getal',
          '<p>Bij <b>scannen</b> lees je niet alles. Je zoekt één gegeven, zoals een vertrektijd.</p><p>Zoek eerst de goede <b>rij</b>: de halte waar je bent. Zoek dan de goede <b>kolom</b>: de bus die je neemt. Lees alleen wat in dat ene vakje staat.</p>',
          'je in een dienstregeling of rooster één tijd zoekt.', maakScan),
        D('info-tabel', 'Informatie uit een tabel halen', 'Zoek de rij en de kolom; waar ze elkaar kruisen, staat je antwoord',
          '<p>In een <b>tabel</b> staat informatie in rijen en kolommen.</p><p>Bedenk welke <b>rij</b> je nodig hebt en welke <b>kolom</b>. Lees de koppen bovenaan en de eerste kolom links. Het antwoord staat in het vakje waar je rij en je kolom elkaar <b>kruisen</b>.</p>',
          'je een prijs, een vak of een afstand in een tabel zoekt.', maakTabel),
        D('info-infographic', 'Een infographic lezen', 'Lees eerst de titel, zoek dan de goede balk en lees het getal',
          '<p>Een <b>infographic</b> laat cijfers zien in een plaatje, bijvoorbeeld met balken.</p><p>Lees eerst de <b>titel</b>: waar gaat het over? Zoek dan de <b>balk</b> die je nodig hebt en lees het getal erbij. De langste balk is de grootste groep.</p>',
          'je cijfers in een plaatje moet begrijpen.', maakInfo, infographic({ schoon:function(t){ return t; } }, INFO[0][0], INFO[0][1], [48, 21, 14, 11, 6])),
        D('info-instructie', 'Een instructie lezen', 'Let op woorden als eerst, daarna, voordat en als laatste: de zinnen staan niet altijd op volgorde',
          '<p>In een <b>instructie</b> staat wat je moet doen. Maar de zinnen staan niet altijd in de goede volgorde.</p><p>Let op de <b>volgordewoorden</b>: <i>eerst, begin met, daarna, voordat, nadat, zodra, als laatste, tot slot</i>. Die vertellen wat je eerst doet en wat later.</p>',
          'je iets moet maken, aanvragen of instellen.', maakInstr),
        D('info-formulier', 'Een formulier invullen', 'Let op de sterretjes en op hoe je iets moet schrijven, zoals dd-mm-jjjj',
          '<p>Op een <b>formulier</b> zie je vaak een <b>sterretje *</b>. Dat veld moet je invullen.</p><p>Soms staat er hoe je iets moet schrijven. <b>dd-mm-jjjj</b> betekent: twee cijfers voor de dag, twee voor de maand, vier voor het jaar. 5 maart 2012 wordt dan <b>05-03-2012</b>.</p>',
          'je je aanmeldt voor een club, cursus of pas.', maakForm)
      ] },
    { groep:{ id:'info-verwerk', niveau:'2F', domein:'schrijven', naam:'Informatie verwerken', kd:['nl3A.b', 'nl3C.c'],
        uit:'Voor een werkstuk gebruik je informatie uit bronnen. Je zet het in je eigen woorden of citeert het netjes, je noemt je bronnen, je maakt aantekeningen en schema’s, en je voegt informatie uit twee bronnen samen.' },
      doelen:[
        D('info-citaat', 'Citeren', 'Letterlijk overnemen mag, met aanhalingstekens en de bron erbij',
          '<p>Wil je een zin <b>letterlijk</b> overnemen? Dan maak je een <b>citaat</b>.</p><p>Zet de zin tussen <b>aanhalingstekens</b> en verander er geen woord aan. Zet erbij <b>wie</b> het zei en <b>waar</b> het staat. Bijvoorbeeld: <i>Tandarts Femke Bos zegt: “Twee keer per dag poetsen is de beste bescherming.” (bron: Tandartsen-uitleg.nl)</i></p>',
          'iemand iets precies goed zegt en je dat letterlijk wilt laten zien.', maakCitaat),
        D('info-parafrase', 'Parafraseren', 'Zeg hetzelfde in je eigen woorden: andere woorden, dezelfde betekenis',
          '<p>Bij <b>parafraseren</b> zet je informatie in <b>je eigen woorden</b>.</p><p>Zoek eerst de <b>kern</b>. Schrijf die dan op met andere woorden en vaak in een andere volgorde. Pas op: een of twee woorden veranderen is niet genoeg. En de <b>betekenis</b> moet hetzelfde blijven.</p>',
          'je informatie uit een bron in je werkstuk wilt gebruiken.', maakParafrase),
        D('info-bronvermelding', 'Een bronvermelding maken', 'Auteur (jaar). Titel. Website: altijd in die volgorde',
          '<p>Achter in je werkstuk zet je een <b>bronvermelding</b>, zodat de lezer alles kan nakijken.</p><p>De volgorde: <b>auteur (jaar). Titel. Website.</b> Bij de auteur schrijf je eerst de achternaam, dan een komma en de voorletter.</p><p>Voorbeeld: <i>Bakker, S. (2023). Waarom bijen zo belangrijk zijn. Natuurweetjes.nl</i></p>',
          'je een werkstuk of verslag afmaakt.', maakBronverm),
        D('info-plagiaat', 'Plagiaat herkennen', 'Overgenomen woorden tussen aanhalingstekens met bron, eigen woorden met bron: anders is het plagiaat',
          '<p><b>Plagiaat</b> is doen alsof iets van jou is, terwijl het van een ander komt.</p><p>Neem je woorden <b>letterlijk</b> over? Dan horen ze tussen <b>aanhalingstekens</b>, met de <b>bron</b> erbij. Zet je iets in <b>eigen woorden</b>? Dan noem je ook de bron. Een paar woorden veranderen is niet genoeg.</p>',
          'je controleert of je werkstuk eerlijk is.', maakPlagiaat),
        D('info-aantekening', 'Aantekeningen maken', 'Schrijf het onderwerp en een paar kernwoorden op, geen hele zinnen',
          '<p>Bij het lezen maak je <b>aantekeningen</b>. Schrijf geen hele zinnen over: dat kost veel tijd.</p><p>Zet het <b>onderwerp</b> vooraan, met een dubbele punt. Schrijf daarachter de belangrijkste dingen in <b>kernwoorden</b>. Voorbeelden en losse details laat je weg.</p><p><i>koala: slaapt 20 uur, eet eucalyptus, weinig energie</i></p>',
          'je informatie verzamelt voor een werkstuk of een toets.', maakAant),
        D('info-schema', 'Een schema kiezen', 'Kenmerken: woordweb. Volgorde: tijdlijn. Oorzaak en gevolg: pijlenketen. Vergelijken: tabel',
          '<p>Met een <b>schema</b> zie je in één keer hoe informatie in elkaar zit. Kies het schema dat past bij wat de tekst doet.</p><p>Kenmerken van één onderwerp: een <b>woordweb</b>. Gebeurtenissen na elkaar: een <b>tijdlijn</b>. Het ene veroorzaakt het andere: een <b>pijlenketen</b>. Twee dingen vergelijken: een <b>tabel</b> met twee kolommen.</p>',
          'je een tekst wilt ordenen om hem te leren of uit te leggen.', maakSchema),
        D('info-samenvoegen', 'Twee bronnen samenvoegen', 'Noem elk feit één keer: wat dubbel is één keer, en wat nieuw is erbij',
          '<p>Gebruik je <b>twee bronnen</b>, dan staat er vaak hetzelfde in, met andere woorden.</p><p>Zoek wat <b>dubbel</b> is: dat noem je maar één keer. Zoek wat <b>nieuw</b> is in de tweede bron: dat voeg je toe. Zo krijg je één tekst waarin elk feit precies één keer staat.</p>',
          'je informatie uit meer bronnen in één tekst zet.', maakSamen)
      ] }
  ]);
})();
