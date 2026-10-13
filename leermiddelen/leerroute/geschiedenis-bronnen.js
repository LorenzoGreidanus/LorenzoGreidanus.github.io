/* De leerroute geschiedenis, bronnen en redeneren: primaire of secundaire bron, de vijf W's,
   feit of mening, betrouwbaarheid en bruikbaarheid met een stappenplan, standplaatsgebondenheid,
   een kenmerkend aspect herkennen, oorzaak en gevolg, soorten oorzaken en anachronismen.
   De bronnen zijn beschrijvingen; namen van gewone mensen zijn verzonnen.
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var T = LEERROUTE.R, G = [];

  /* ---------- hulpjes ---------- */
  function K(R, t, goed, fout, hint, extra){
    var lijst = [goed], gezien = {}; gezien[String(goed).toLowerCase()] = 1;
    fout.forEach(function(f){ if (f == null) return; var k = String(f).toLowerCase(); if (!gezien[k]){ gezien[k] = 1; lijst.push(f); } });
    var opties = R.hussel(lijst), s = { tekst:t, opties:opties, goed:opties.indexOf(goed), hint:hint };
    if (extra){ if (extra.waarom) s.waarom = extra.waarom; if (extra.fout){ s.fout = {}; for (var k in extra.fout) s.fout[k.toLowerCase()] = extra.fout[k]; } }
    return s;
  }
  function V(t, opties, goed, hint, waarom){ var s = { tekst:t, opties:opties.slice(), goed:opties.indexOf(goed), hint:hint }; if (waarom) s.waarom = waarom; return s; }
  function OP(o){ var s = o.stappen[o.stappen.length - 1]; if (s.opties){ o.opties = s.opties; o.goed = s.goed; } return o; }
  function hoofd(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
  var KAART = 'font-size:1rem;font-weight:400;letter-spacing:0;margin:10px auto;border:1px solid var(--rand2)';
  function bron(tekst, kop){ return '<div class="lr-tekst" style="' + KAART + '">' + (kop ? '<p style="margin:0 0 4px;font-weight:700;color:var(--lr-2)">' + kop + '</p>' : '') + [].concat(tekst).map(function(p){ return '<p>' + p + '</p>'; }).join('') + '</div>'; }
  function kort(s, n){ return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; }

  /* ================= 1 BRONNEN HERKENNEN (onderbouw) ================= */
  /* [bron, gemaakt, onderwerp, primair] */
  var BRON = [
    ['een dagboek dat een meisje in 1943 schreef over de bezetting', 'in 1943', 'de Duitse bezetting (1940 tot 1945)', 1],
    ['een foto uit 1953 van een ondergelopen dorp na de Watersnoodramp', 'in 1953', 'de Watersnoodramp van 1953', 1],
    ['een brief uit 1916 van een soldaat aan het front', 'in 1916', 'de Eerste Wereldoorlog (1914 tot 1918)', 1],
    ['een spotprent uit 1848 over de nieuwe grondwet', 'in 1848', 'de grondwet van 1848', 1],
    ['een schilderij uit 1660 van een binnenplaats in Delft', 'in 1660', 'het dagelijks leven in de 17e eeuw', 1],
    ['een krant van 7 mei 1945 over de bevrijding', 'in 1945', 'de bevrijding in 1945', 1],
    ['een kaart van Amsterdam die in 1625 getekend is', 'in 1625', 'Amsterdam in de 17e eeuw', 1],
    ['een stenen bijl die boeren in de steentijd gebruikten', 'in de steentijd', 'boeren in de steentijd', 1],
    ['het logboek van een VOC-schip uit 1650', 'in 1650', 'de reizen van de VOC', 1],
    ['een Romeinse munt met het hoofd van keizer Augustus', 'in de tijd van keizer Augustus', 'de Romeinse keizers', 1],
    ['een geschiedenisboek uit 2019 over de Tweede Wereldoorlog', 'in 2019', 'de Tweede Wereldoorlog (1939 tot 1945)', 0],
    ['een documentaire uit 2015 over de Gouden Eeuw', 'in 2015', 'de Gouden Eeuw (de 17e eeuw)', 0],
    ['een speelfilm uit 2005 over de Romeinen', 'in 2005', 'de Romeinen', 0],
    ['een tekening uit 1880 van hoe een ridderburcht er rond 1200 uitzag', 'in 1880', 'ridderburchten rond 1200', 0],
    ['een website uit 2022 over het leven van Willem van Oranje', 'in 2022', 'Willem van Oranje (1533 tot 1584)', 0],
    ['een strip uit 1985 over de Vikingen', 'in 1985', 'de Vikingen', 0],
    ['een bordje uit 2020 in een museum, naast een Romeinse helm', 'in 2020', 'Romeinse soldaten', 0],
    ['een nagebouwde boerderij uit 2010 van hoe boeren in de steentijd woonden', 'in 2010', 'boeren in de steentijd', 0],
    ['een schilderij uit 1850 van de Slag bij Nieuwpoort (1600)', 'in 1850', 'de Slag bij Nieuwpoort in 1600', 0],
    ['een spreekbeurt uit 2024 over de Watersnoodramp van 1953', 'in 2024', 'de Watersnoodramp van 1953', 0]];
  /* de vijf W's: wie, wat, waar, wanneer, waarom, en het bijschrift */
  var VIJF = [
    { wie:'Pieter Jansz, een matroos op een VOC-schip', wat:'een brief', waar:'Batavia', wanneer:'1652', waarom:'om zijn moeder te laten weten hoe het met hem ging', extra:'Hoorn',
      tekst:'Brief van Pieter Jansz, een matroos op een VOC-schip, aan zijn moeder in Hoorn. Hij schreef de brief in 1652 in Batavia, om haar te laten weten hoe het met hem ging.' },
    { wie:'de Duitse bezetter', wat:'een affiche', waar:'Amsterdam', wanneer:'1942', waarom:'om Nederlanders over te halen in Duitsland te gaan werken', extra:'Berlijn',
      tekst:'Affiche van de Duitse bezetter, in 1942 opgehangen in Amsterdam. Het moest Nederlanders overhalen om in Duitsland te gaan werken. De affiche was in Berlijn ontworpen.' },
    { wie:'Anna de Vries, een meisje van 14', wat:'een dagboek', waar:'Rotterdam', wanneer:'1940', waarom:'om voor zichzelf op te schrijven wat ze meemaakte', extra:'Delft',
      tekst:'Dagboek van Anna de Vries, een meisje van 14 uit Rotterdam. Ze schreef het in mei 1940, de week van het bombardement, om voor zichzelf op te schrijven wat ze meemaakte. Later verhuisde ze naar Delft.' },
    { wie:'een tekenaar van een liberale krant', wat:'een spotprent', waar:'Den Haag', wanneer:'1848', waarom:'om de lezers te laten lachen om de tegenstanders van de nieuwe grondwet', extra:'Utrecht',
      tekst:'Spotprent uit 1848, gemaakt in Den Haag door een tekenaar van een liberale krant. Hij wilde de lezers laten lachen om de tegenstanders van de nieuwe grondwet. De krant werd ook in Utrecht gelezen.' },
    { wie:'een fotograaf van een krant', wat:'een foto', waar:'Zeeland', wanneer:'1953', waarom:'om de lezers te laten zien hoe erg de overstroming was', extra:'Amsterdam',
      tekst:'Foto die een fotograaf van een krant in februari 1953 in Zeeland maakte. Hij wilde de lezers van de krant in Amsterdam laten zien hoe erg de overstroming was.' },
    { wie:'een Spaanse koopman', wat:'een reisverslag', waar:'Antwerpen', wanneer:'1560', waarom:'om andere kooplieden te vertellen over de handel in de stad', extra:'Sevilla',
      tekst:'Reisverslag van een Spaanse koopman uit Sevilla. Hij schreef het in 1560 in Antwerpen, om andere kooplieden te vertellen over de handel in de stad.' },
    { wie:'een verslaggever van een Amsterdamse krant', wat:'een krantenartikel', waar:'Haarlem', wanneer:'1839', waarom:'om de lezers te vertellen over de eerste treinrit', extra:'Leiden',
      tekst:'Krantenartikel uit 1839, geschreven in Haarlem door een verslaggever van een Amsterdamse krant. Hij wilde de lezers vertellen over de eerste treinrit. Een lezer uit Leiden stuurde later een brief over het artikel.' },
    { wie:'Jan Smit, een arbeider in een textielfabriek', wat:'een brief aan de krant', waar:'Tilburg', wanneer:'1890', waarom:'om te klagen over de lange werkdagen in de fabriek', extra:'Eindhoven',
      tekst:'Brief aan de krant van Jan Smit, een arbeider in een textielfabriek in Tilburg. Hij schreef de brief in 1890 om te klagen over de lange werkdagen in de fabriek. Zijn broer werkte in Eindhoven.' },
    { wie:'broeder Willem, een monnik', wat:'een kroniek', waar:'Egmond', wanneer:'1120', waarom:'om belangrijke gebeurtenissen voor later vast te leggen', extra:'Utrecht',
      tekst:'Kroniek van broeder Willem, een monnik in het klooster van Egmond. Hij schreef in 1120 belangrijke gebeurtenissen op, zodat ze voor later bewaard bleven. Het klooster kreeg ook boeken uit Utrecht.' },
    { wie:'Grietje Bos, een boerin', wat:'een rekeningenboekje', waar:'Friesland', wanneer:'1795', waarom:'om bij te houden wat ze verdiende en uitgaf', extra:'Groningen',
      tekst:'Rekeningenboekje van Grietje Bos, een boerin in Friesland. In 1795 hield ze erin bij wat ze verdiende en uitgaf. Haar boter verkocht ze op de markt in Groningen.' }];
  var WVRAAG = { wie:'Wie heeft de bron gemaakt?', wat:'Wat voor soort bron is het?', waar:'Waar is de bron gemaakt?', wanneer:'Wanneer is de bron gemaakt?', waarom:'Waarom is de bron gemaakt?' };
  var WHINT = { wie:'Zoek de maker: wie schreef, tekende of fotografeerde het?', wat:'Het eerste woord van het bijschrift zegt wat het is.', waar:'Let op: er staan meer plaatsen in. Waar werd de bron gemaakt?', wanneer:'Zoek het jaartal waarin de bron gemaakt is.', waarom:'Zoek woorden als "om", "wilde" of "zodat".' };
  /* feiten en meningen: [zin, oordeelwoord of ''] */
  var FM = [
    ['In 1602 werd de VOC opgericht.', ''], ['Willem van Oranje werd in 1584 in Delft vermoord.', ''], ['De Tweede Wereldoorlog eindigde in Europa in mei 1945.', ''],
    ['In 1919 kregen vrouwen in Nederland kiesrecht.', ''], ['De eerste spoorlijn van Nederland liep van Amsterdam naar Haarlem.', ''], ['Bij de Watersnoodramp van 1953 kwamen meer dan 1800 mensen om.', ''],
    ['Karel de Grote werd in het jaar 800 tot keizer gekroond.', ''], ['De Romeinen bouwden forten langs de Rijn.', ''], ['De Berlijnse Muur viel in 1989.', ''],
    ['In 1863 werd de slavernij in Suriname afgeschaft.', ''], ['Rembrandt schilderde De Nachtwacht.', ''], ['Napoleon maakte zijn broer Lodewijk koning van Holland.', ''],
    ['De VOC was het beste bedrijf dat ooit bestond.', 'beste'], ['Willem van Oranje was een echte held.', 'held'], ['De Romeinen waren veel slimmer dan de Germanen.', 'slimmer'],
    ['De Gouden Eeuw was de mooiste tijd van Nederland.', 'mooiste'], ['Het was dom van Napoleon om Rusland binnen te vallen.', 'dom'], ['De grondwet van 1848 was een geweldige verbetering.', 'geweldige'],
    ['Ridders leidden een saai leven.', 'saai'], ['De Nachtwacht is het mooiste schilderij ter wereld.', 'mooiste'], ['Monniken hadden een veel te streng leven.', 'te streng'],
    ['Vrouwen hadden veel eerder kiesrecht moeten krijgen.', 'moeten'], ['De stoomtrein was een prachtige uitvinding.', 'prachtige'], ['Karel de Grote was een slechte keizer.', 'slechte']];
  function woorden(zin, niet){ return zin.replace(/[.,]/g, '').split(' ').filter(function(w){ return w.length > 3 && niet.indexOf(w) < 0 && !/^\d+$/.test(w); }); }

  G.push({ groep:{ id:'gs-bron', niveau:'onderbouw', domein:'bronnen', naam:'Bronnen herkennen',
      uit:'Een bron is alles waaruit je iets over het verleden te weten komt. Je leert primaire en secundaire bronnen herkennen, de vijf W\'s van een bron vinden en feiten van meningen onderscheiden.' },
    doelen:[
      { id:'gs-primair', naam:'Primaire of secundaire bron', kort:'Is de bron gemaakt in de tijd waar hij over gaat? Dan is hij primair. Is hij later gemaakt? Dan is hij secundair',
        uit:'<p>Een <b>primaire bron</b> komt uit de tijd waar hij over gaat. Hij is gemaakt door mensen van toen: een brief, een dagboek, een foto, een munt.</p><p>Een <b>secundaire bron</b> is <b>later</b> gemaakt, door iemand die het niet zelf meemaakte: een schoolboek, een documentaire, een film.</p><p>Vraag je dus af: wanneer is de bron gemaakt, en over welke tijd gaat hij?</p>',
        wanneer:'je een bron gebruikt en wilt weten hoe dicht hij bij de gebeurtenis staat.',
        maak:function(R){
          var b = R.kies(BRON), andere = R.hussel(BRON.filter(function(x){ return x[1] !== b[1]; })).slice(0, 2).map(function(x){ return x[1]; });
          var pr = b[3] === 1, soort = pr ? 'een primaire bron' : 'een secundaire bron';
          return OP({ context:'Je onderzoekt ' + b[2] + '. Je vindt ' + b[0] + '.', vraag:hoofd(b[0]), vraagHtml:'Primair of secundair?',
            stappen:[
              K(R, 'Wanneer is de bron gemaakt?', b[1], andere, 'Kijk in de beschrijving van de bron.'),
              V('Is de bron gemaakt in de tijd waar hij over gaat, door mensen van toen?', ['ja', 'nee'], pr ? 'ja' : 'nee', 'De bron gaat over ' + b[2] + ' en is gemaakt ' + b[1] + '.'),
              V('Dus het is', ['een primaire bron', 'een secundaire bron'], soort, pr ? 'Uit de tijd zelf: primair.' : 'Later gemaakt: secundair.') ] });
        } },
      { id:'gs-vijf-w', naam:'De vijf W\'s van een bron', kort:'Zoek wie de bron maakte, wat het is, waar en wanneer hij gemaakt is, en waarom',
        uit:'<p>Bij elke bron stel je eerst vijf vragen, de <b>vijf W\'s</b>:</p><ul><li><b>Wie</b> heeft de bron gemaakt?</li><li><b>Wat</b> voor bron is het (brief, foto, affiche)?</li><li><b>Waar</b> is hij gemaakt?</li><li><b>Wanneer</b> is hij gemaakt?</li><li><b>Waarom</b> is hij gemaakt?</li></ul><p>De antwoorden staan vaak in het <b>bijschrift</b>. Lees goed: er staan soms meer plaatsen of namen in dan je nodig hebt.</p>',
        wanneer:'je een bron gaat gebruiken en wilt weten waar je mee werkt.',
        maak:function(R){
          var b = R.kies(VIJF), laatste = R.kies(['wie', 'wat', 'waar', 'wanneer', 'waarom']);
          var volg = ['wie', 'wat', 'waar', 'wanneer', 'waarom'].filter(function(w){ return w !== laatste; }).concat([laatste]);
          var anderen = VIJF.filter(function(x){ return x !== b; });
          var st = volg.map(function(w){
            var fout = R.hussel(anderen).slice(0, 2).map(function(x){ return x[w]; });
            if (w === 'waar') fout[0] = b.extra;
            return K(R, WVRAAG[w], b[w], fout, WHINT[w]);
          });
          return OP({ context:'Lees het bijschrift bij de bron.' + bron(b.tekst), vraag:WVRAAG[laatste] + ' (' + b.wat + ', ' + b.wanneer + ')', vraagHtml:WVRAAG[laatste], stappen:st });
        } },
      { id:'gs-feit-mening', naam:'Feit of mening in een bron', kort:'Een feit kun je nagaan. Een mening is een oordeel, met woorden als mooi, slecht, held of moeten',
        uit:'<p>Een <b>feit</b> kun je nagaan of controleren: het klopt of het klopt niet. In 1602 werd de VOC opgericht.</p><p>Een <b>mening</b> is wat iemand ervan vindt. Je herkent een mening aan <b>oordeelwoorden</b>: mooi, beste, slecht, dom, held, geweldig, moeten.</p><p>Zoek dus eerst of er een oordeelwoord in de zin staat.</p>',
        wanneer:'je in een bron wilt weten wat zeker is en wat iemand ervan vindt.',
        maak:function(R){
          var z = R.kies(FM), mening = !!z[1], w = woorden(z[0], z[1].split(' ')), opties = R.hussel(w).slice(0, 2);
          var geen = 'geen: alles kun je nagaan';
          return OP({ context:'Een zin uit een bron:', vraag:z[0],
            stappen:[
              K(R, 'Welk woord geeft een oordeel?', mening ? z[1] : geen, mening ? opties.concat([geen]) : opties, mening ? 'Zoek een woord waarmee de schrijver zegt wat hij ervan vindt.' : 'Staat er een woord als mooi, slecht of beste in? Of kun je alles opzoeken?'),
              V('Dus de zin is', ['een feit', 'een mening'], mening ? 'een mening' : 'een feit', mening ? 'Met een oordeelwoord is het een mening.' : 'Je kunt het nagaan: een feit.') ] });
        } }
    ] });

  /* ================= 2 BRONNEN BEOORDELEN (bovenbouw) ================= */
  /* betrouwbaarheid: [bron, erbij, belang] */
  var BETR = [
    ['Een verpleegster schreef in 1916 in haar dagboek wat ze die dag in het veldhospitaal zag. Het dagboek was alleen voor haarzelf.', 1, 0, 'Ze werkte zelf in het veldhospitaal.', 'Het dagboek was alleen voor haarzelf: ze hoefde niemand te overtuigen.'],
    ['Een schipper schreef in 1953 in zijn logboek hoe hoog het water die nacht stond. Het logboek was voor zijn eigen administratie.', 1, 0, 'Hij zag het water zelf stijgen.', 'Een logboek voor jezelf: geen reden om te overdrijven.'],
    ['Een arts noteerde in 1866 elke dag hoeveel mensen in zijn dorp ziek werden van de cholera. De lijst was voor zijn eigen werk.', 1, 0, 'Hij behandelde de zieken zelf.', 'Hij hield de lijst bij voor zijn werk, niet om iemand te overtuigen.'],
    ['Een boerin schreef in 1795 in haar rekeningenboekje hoeveel ze voor haar boter kreeg op de markt.', 1, 0, 'Ze verkocht de boter zelf.', 'Het boekje was voor haarzelf.'],
    ['Een generaal schreef een verslag over een veldslag die hij zelf leidde. Hij schrijft dat zijn soldaten dapper vochten en dat de vijand vluchtte.', 1, 1, 'Hij leidde de veldslag zelf.', 'Hij wil zelf goed overkomen bij de koning.'],
    ['Een fabriekseigenaar schreef in 1880 in de krant dat de kinderen in zijn fabriek het heel goed hadden.', 1, 1, 'Het gaat over zijn eigen fabriek.', 'Hij wil geen kritiek en geen nieuwe wet tegen kinderarbeid.'],
    ['Een koning liet een boek maken over zijn eigen regering. Daarin staat dat het volk heel blij met hem was.', 1, 1, 'Het gaat over zijn eigen regering.', 'Hij wil dat iedereen een goed beeld van hem krijgt.'],
    ['Een plantage-eigenaar schreef in 1850 in een brief aan de regering dat zijn slaven het goed hadden.', 1, 1, 'Het gaat over zijn eigen plantage.', 'Hij verdient geld aan de slavernij en wil niet dat die wordt afgeschaft.'],
    ['Een boer in Friesland schreef in 1652 in een brief wat een reiziger hem had verteld over een zeeslag. De boer was zelf nooit op zee geweest.', 0, 0, 'Hij heeft het van een reiziger gehoord.', 'Hij hoeft niemand te overtuigen.'],
    ['Een vrouw schreef in 1944 in haar dagboek wat de buurvrouw had gehoord over gevechten in een stad ver weg.', 0, 0, 'Ze heeft het van de buurvrouw gehoord.', 'Het dagboek was voor haarzelf.'],
    ['Een schooljongen schreef in 1900 een opstel over een overstroming. Zijn opa had hem verteld hoe die overstroming ging, toen opa zelf nog klein was.', 0, 0, 'Hij heeft het van zijn opa gehoord.', 'Het is een gewoon schoolopstel.'],
    ['Een koopman in Amsterdam schreef in 1630 in een brief wat matrozen in de haven vertelden over een storm bij Afrika.', 0, 0, 'Hij heeft het van matrozen in de haven gehoord.', 'Hij schrijft het op voor een vriend.']];
  var OORDEEL = ['betrouwbaar', 'minder betrouwbaar: van horen zeggen', 'niet betrouwbaar: de maker heeft er belang bij'];
  /* bruikbaarheid: [vraag, bron, onderwerp klopt, tijd en plaats kloppen] */
  var BRUIK = [
    ['Hoe wilde de Duitse bezetter dat Nederlanders over werken in Duitsland dachten?', 'een Duitse affiche uit 1942 die Nederlanders oproept om in Duitsland te gaan werken', 1, 1],
    ['Hoe wilde de Duitse bezetter dat Nederlanders over werken in Duitsland dachten?', 'een dagboek uit 1942 van een Amsterdamse schooljongen over zijn voetbalclub', 0, 1],
    ['Hoe zwaar was het werk van kinderen in Nederlandse fabrieken rond 1870?', 'een verslag uit 1869 van een onderzoek naar kinderarbeid in Nederlandse fabrieken', 1, 1],
    ['Hoe zwaar was het werk van kinderen in Nederlandse fabrieken rond 1870?', 'een foto uit 1960 van kinderen op een schoolplein', 0, 0],
    ['Hoe verliep de Watersnoodramp van 1953 in Zeeland?', 'een krantenfoto uit februari 1953 van een ondergelopen dorp in Zeeland', 1, 1],
    ['Hoe verliep de Watersnoodramp van 1953 in Zeeland?', 'een schilderij uit 1650 van een storm op zee', 0, 0],
    ['Wat vonden protestanten in 1566 van de beelden in de kerken?', 'een prent uit 1566 van protestanten die beelden uit een kerk slopen', 1, 1],
    ['Wat vonden protestanten in 1566 van de beelden in de kerken?', 'een foto uit 2020 van een kerk na een verbouwing', 0, 0],
    ['Hoe zag een Romeins fort langs de Rijn eruit?', 'de resten van een Romeins fort bij de Rijn, opgegraven door archeologen', 1, 1],
    ['Hoe zag een Romeins fort langs de Rijn eruit?', 'een brief van een Romeinse soldaat in Egypte over het eten daar', 0, 0],
    ['Hoe dachten mensen in 1848 over de nieuwe grondwet?', 'een spotprent uit 1848 over de nieuwe grondwet', 1, 1],
    ['Hoe dachten mensen in 1848 over de nieuwe grondwet?', 'een dagboek uit 1848 van een boer, over de oogst en het weer', 0, 1],
    ['Hoe leefden de arbeiders in Amsterdam rond 1900?', 'een foto uit 1905 van een arbeidersgezin in een kleine woning in Amsterdam', 1, 1],
    ['Hoe leefden de arbeiders in Amsterdam rond 1900?', 'een foto uit 1905 van een arbeidersgezin in Londen', 1, 0]];
  /* standplaatsgebondenheid: [maker en wat hij zegt, zijn kant, andere kanten, hoe de andere kant het noemt, wat dezelfde kant zegt, iets wat niemand zegt] */
  var STAND = [
    ['Een Spaanse officier noemt de opstandelingen in de Nederlanden in 1572 "ketters en rebellen".', 'aan de kant van de Spaanse koning', 'de opstandelingen', '"dappere strijders voor vrijheid en geloof"', '"ketters en rebellen"', '"Spaanse helden"'],
    ['Een fabriekseigenaar schrijft in 1875 dat werken in de fabriek "goed is voor de opvoeding van kinderen".', 'aan de kant van de fabriekseigenaren', 'de arbeiders', '"uitbuiting van kinderen"', '"goed voor de opvoeding"', '"een feest voor de fabrikant"'],
    ['Een socialistische krant schrijft in 1890 dat de fabrikanten "de arbeiders uitbuiten".', 'aan de kant van de arbeiders', 'de fabrikanten', '"eerlijk werk voor een eerlijk loon"', '"uitbuiting van de arbeiders"', '"een gevaar voor de koning"'],
    ['Een Engelse krant schrijft in 1815 dat de Slag bij Waterloo gewonnen is "door het Britse leger van Wellington".', 'aan de kant van de Britten', 'de Pruisen', '"gewonnen dankzij het Pruisische leger van Blücher"', '"gewonnen door het Britse leger"', '"gewonnen door Napoleon"'],
    ['Een plantage-eigenaar in Suriname schrijft in 1850 dat de tot slaaf gemaakte mensen "het goed hebben".', 'aan de kant van de plantage-eigenaren', 'de tot slaaf gemaakte mensen', '"een leven zonder vrijheid, vol zwaar werk en straf"', '"ze hebben het goed"', '"een vakantie op de plantage"'],
    ['Een Duitse krant schrijft in mei 1940 dat het Duitse leger Nederland "beschermt tegen Engeland".', 'aan de kant van de Duitse nazi-regering', 'de Nederlanders', '"een overval op een neutraal land"', '"bescherming tegen Engeland"', '"een bezoek van vrienden"'],
    ['Een voorvechtster van vrouwenkiesrecht schrijft in 1910 dat vrouwen "net zo verstandig zijn als mannen en dus moeten kunnen stemmen".', 'aan de kant van de voorstanders van vrouwenkiesrecht', 'de tegenstanders van vrouwenkiesrecht', '"vrouwen horen thuis, de politiek is voor mannen"', '"vrouwen moeten kunnen stemmen"', '"alleen kinderen mogen stemmen"'],
    ['Een katholieke priester schrijft in 1566 dat de beeldenstormers "kerkrovers en heiligschenners" zijn.', 'aan de kant van de katholieke kerk', 'de protestanten', '"mensen die de kerk zuiver maken van afgoderij"', '"kerkrovers en heiligschenners"', '"vrienden van de paus"'],
    ['Een Franse soldaat van Napoleon schrijft in 1812 dat de Russen "laf wegvluchten voor het grote Franse leger".', 'aan de kant van Napoleon', 'de Russen', '"een slimme terugtocht die het Franse leger uitput"', '"laf wegvluchten"', '"een overwinning voor Frankrijk"'],
    ['Een Nederlandse krant die de regering steunt, schrijft in 1947 dat de soldaten in Indonesië "orde en rust brengen".', 'aan de kant van de Nederlandse regering', 'de Indonesiërs die onafhankelijk wilden worden', '"een aanval op onze vrijheid"', '"orde en rust brengen"', '"een feest voor iedereen"']];
  var TVN = ['jagers en boeren', 'Grieken en Romeinen', 'monniken en ridders', 'steden en staten', 'ontdekkers en hervormers', 'regenten en vorsten', 'pruiken en revoluties', 'burgers en stoommachines', 'wereldoorlogen', 'televisie en computer'];
  function tvNaam(n){ return 'tijdvak ' + n + ': ' + TVN[n - 1]; }
  /* kenmerkende aspecten (ingekort): [bron, tijdvak, goed, foute] */
  var KA = [
    ['Een vonnis uit 1942: een Duitse rechtbank in Nederland veroordeelt een verzetsman ter dood.', 9, 'de Duitse bezetting van Nederland', ['de crisis van het wereldkapitalisme', 'de dekolonisatie', 'de eenwording van Europa']],
    ['Een foto uit 1932 van een lange rij werklozen bij een stempellokaal in Amsterdam.', 9, 'de crisis van het wereldkapitalisme', ['de Duitse bezetting van Nederland', 'de industriële revolutie', 'de eenwording van Europa']],
    ['Een foto uit 1943 van een trein die Joden wegvoert uit kamp Westerbork.', 9, 'racisme en discriminatie die leidden tot genocide, vooral op de Joden', ['de crisis van het wereldkapitalisme', 'de dekolonisatie', 'de democratische revoluties']],
    ['Een prent uit 1566 van mensen die heiligenbeelden uit een kerk slopen.', 5, 'de protestantse reformatie, die de christelijke kerk splitste', ['het streven van vorsten naar absolute macht', 'de industriële revolutie', 'de kruistochten']],
    ['Een tekst uit 1581 waarin de Staten-Generaal verklaren dat Filips II niet langer hun vorst is.', 5, 'het conflict in de Nederlanden dat leidde tot een eigen Nederlandse staat', ['de wetenschappelijke revolutie', 'de democratische revoluties', 'de wereldwijde verkenning door Europeanen']],
    ['Een schilderij uit 1660 van het drukke Amsterdamse stadhuis met rijke kooplieden ervoor.', 6, 'de bloei van de Nederlandse Republiek in handel en cultuur', ['het streven van vorsten naar absolute macht', 'de protestantse reformatie', 'de dekolonisatie']],
    ['Een tekening uit 1685 van het paleis van Versailles, waar Lodewijk XIV alle macht naar zich toe trok.', 6, 'het streven van vorsten naar absolute macht', ['de bloei van de Nederlandse Republiek in handel en cultuur', 'de democratische revoluties', 'de kruistochten']],
    ['Een tekening uit 1610 van de manen van Jupiter, die Galilei met zijn telescoop ontdekte.', 6, 'de wetenschappelijke revolutie', ['de protestantse reformatie', 'het streven van vorsten naar absolute macht', 'de industriële revolutie']],
    ['Een pamflet uit 1789 met de Verklaring van de rechten van de mens en de burger.', 7, 'de democratische revoluties in westerse landen', ['de wetenschappelijke revolutie', 'discussies over de sociale kwestie', 'de eenwording van Europa']],
    ['Een advertentie uit 1770 voor de verkoop van tot slaaf gemaakte mensen op een plantage in Suriname.', 7, 'plantagekoloniën en de trans-Atlantische slavenhandel', ['de democratische revoluties in westerse landen', 'de wetenschappelijke revolutie', 'de eenwording van Europa']],
    ['Een foto uit 1890 van een fabriek met hoge schoorstenen en een stoommachine.', 8, 'de industriële revolutie', ['de moderne vorm van imperialisme', 'het streven van vorsten naar absolute macht', 'de verdeling van de wereld in twee blokken (de Koude Oorlog)']],
    ['Een rapport uit 1887 over arbeiders die in krotten wonen en veertien uur per dag werken.', 8, 'discussies over de sociale kwestie', ['de moderne vorm van imperialisme', 'de dekolonisatie', 'het voeren van twee wereldoorlogen']],
    ['Een spandoek uit 1898 van een vereniging die kiesrecht voor vrouwen eist.', 8, 'de opkomst van emancipatiebewegingen', ['de industriële revolutie', 'de Duitse bezetting van Nederland', 'de verspreiding van het christendom']],
    ['Een kaart uit 1900 waarop bijna heel Afrika verdeeld is tussen Europese landen.', 8, 'de moderne vorm van imperialisme', ['discussies over de sociale kwestie', 'de dekolonisatie', 'de wetenschappelijke revolutie']],
    ['Een foto uit 1975 van het feest in Paramaribo op de dag dat Suriname onafhankelijk werd.', 10, 'de dekolonisatie', ['de eenwording van Europa', 'de crisis van het wereldkapitalisme', 'de moderne vorm van imperialisme']],
    ['Een foto uit 1961 van soldaten die de Berlijnse Muur bouwen.', 10, 'de verdeling van de wereld in twee blokken (de Koude Oorlog)', ['de dekolonisatie', 'het voeren van twee wereldoorlogen', 'de crisis van het wereldkapitalisme']],
    ['Een euromunt uit 2002, een van de eerste die in Nederland werd gebruikt.', 10, 'de eenwording van Europa', ['de dekolonisatie', 'de verdeling van de wereld in twee blokken (de Koude Oorlog)', 'de crisis van het wereldkapitalisme']],
    ['Een kroniek uit 1099 over ridders uit Europa die Jeruzalem veroveren.', 4, 'de kruistochten: de christelijke wereld breidt zich uit buiten Europa', ['de opkomst van de stedelijke burgerij', 'de protestantse reformatie', 'de industriële revolutie']],
    ['Een oorkonde uit 1220 waarin een graaf stadsrechten geeft aan een stad.', 4, 'de opkomst van de stedelijke burgerij en zelfstandige steden', ['de kruistochten: de christelijke wereld breidt zich uit buiten Europa', 'de industriële revolutie', 'de moderne vorm van imperialisme']],
    ['Een levensbeschrijving uit de 8e eeuw van Bonifatius, een monnik die de Friezen tot het christendom wilde bekeren.', 3, 'de verspreiding van het christendom in heel Europa', ['de opkomst van de stedelijke burgerij', 'de kruistochten: de christelijke wereld breidt zich uit buiten Europa', 'de protestantse reformatie']],
    ['Een lijst uit 850 van alle diensten die horigen voor hun heer moeten doen op zijn hof.', 3, 'het hofstelsel en de horigheid', ['de opkomst van handel en ambacht', 'de protestantse reformatie', 'de industriële revolutie']],
    ['Een verslag uit 430 v.Chr. van een volksvergadering in Athene, waar de burgers stemmen over een wet.', 2, 'het denken over burgerschap en politiek in de Griekse stadstaat', ['de groei van het Romeinse rijk', 'de democratische revoluties in westerse landen', 'de verspreiding van het christendom in heel Europa']],
    ['Een Romeinse mijlpaal uit de 1e eeuw, gevonden bij een weg langs de Rijn.', 2, 'de groei van het Romeinse rijk, waardoor de Grieks-Romeinse cultuur zich verspreidde', ['het denken over burgerschap en politiek in de Griekse stadstaat', 'de kruistochten: de christelijke wereld breidt zich uit buiten Europa', 'de moderne vorm van imperialisme']],
    ['Een sikkel en verkoolde graankorrels van ongeveer 4500 v.Chr., gevonden bij de resten van een boerderij.', 1, 'het ontstaan van landbouw en landbouwsamenlevingen', ['de groei van het Romeinse rijk', 'het hofstelsel en de horigheid', 'de opkomst van de stedelijke burgerij']]];
  function andereTv(R, n){ var l = []; for (var i = 1; i <= 10; i++) if (i !== n && Math.abs(i - n) <= 3) l.push(i); return R.hussel(l).slice(0, 3).map(tvNaam); }

  G.push({ groep:{ id:'gs-bron-oordeel', niveau:'bovenbouw', domein:'bronnen', naam:'Bronnen beoordelen',
      uit:'Met een stappenplan bepalen of een bron betrouwbaar en bruikbaar is, standplaatsgebondenheid herkennen, en zien bij welk kenmerkend aspect een bron hoort.' },
    doelen:[
      { id:'gs-betrouwbaar', naam:'Is de bron betrouwbaar?', kort:'Was de maker erbij? Had hij er belang bij om iets mooier of erger te maken? Met belang is de bron niet betrouwbaar',
        uit:'<p>Een bron is <b>betrouwbaar</b> als je erop kunt vertrouwen dat hij een eerlijk beeld geeft. Gebruik dit stappenplan:</p><ol><li><b>Was de maker erbij?</b> Een ooggetuige weet meer dan iemand die het van horen zeggen heeft.</li><li><b>Had de maker er belang bij</b> om te overdrijven, te liegen of iets weg te laten? Wil hij er zelf goed uitkomen, geld verdienen of mensen overtuigen?</li></ol><p>Had de maker er belang bij: <b>niet betrouwbaar</b>. Geen belang en wel erbij: <b>betrouwbaar</b>. Geen belang maar niet erbij: <b>minder betrouwbaar</b>, want het is van horen zeggen.</p>',
        wanneer:'je moet beslissen of je een bron kunt geloven.',
        maak:function(R){
          var b = R.kies(BETR), er = b[1] === 1, bel = b[2] === 1, oo = bel ? OORDEEL[2] : er ? OORDEEL[0] : OORDEEL[1];
          return OP({ context:'Lees de beschrijving van de bron.' + bron(b[0]), vraag:kort(b[0], 60), vraagHtml:'Is de bron betrouwbaar?',
            stappen:[
              V('Was de maker er zelf bij?', ['ja', 'nee'], er ? 'ja' : 'nee', b[3]),
              V('Had de maker er belang bij om iets mooier of erger te maken?', ['ja', 'nee'], bel ? 'ja' : 'nee', b[4]),
              K(R, 'Dus de bron is', oo, OORDEEL.filter(function(x){ return x !== oo; }), bel ? 'Een maker met een belang: niet betrouwbaar, ook al was hij erbij.' : er ? 'Erbij en geen belang: betrouwbaar.' : 'Geen belang, maar van horen zeggen: minder betrouwbaar.') ] });
        } },
      { id:'gs-bruikbaar', naam:'Is de bron bruikbaar?', kort:'Gaat de bron over jouw onderwerp, en over de goede tijd en plaats? Dan is hij bruikbaar, ook als hij niet betrouwbaar is',
        uit:'<p>Een bron is <b>bruikbaar</b> als hij je helpt om je onderzoeksvraag te beantwoorden. Stel twee vragen:</p><ol><li>Gaat de bron over het <b>onderwerp</b> van je vraag?</li><li>Gaat hij over de goede <b>tijd</b> en <b>plaats</b>?</li></ol><p>Twee keer ja: bruikbaar. Let op: ook een bron die <b>niet betrouwbaar</b> is, kan bruikbaar zijn. Een propaganda-affiche liegt misschien, maar laat precies zien wat de maker wilde dat mensen dachten.</p>',
        wanneer:'je bronnen zoekt bij een onderzoeksvraag.',
        maak:function(R){
          var b = R.kies(BRUIK), ja = b[2] && b[3];
          return OP({ context:'Je onderzoeksvraag: <b>' + b[0] + '</b><br>Je vindt ' + b[1] + '.', vraag:kort(b[1], 60), vraagHtml:'Is deze bron bruikbaar?',
            stappen:[
              V('Gaat de bron over het onderwerp van je vraag?', ['ja', 'nee'], b[2] ? 'ja' : 'nee', 'Je vraag gaat over: ' + b[0].replace(/\?$/, '').toLowerCase() + '. Waar gaat de bron over?'),
              V('Gaat de bron over de goede tijd en plaats?', ['ja', 'nee'], b[3] ? 'ja' : 'nee', 'Vergelijk het jaartal en de plaats in je vraag met die van de bron.'),
              V('Dus de bron is', ['bruikbaar', 'niet bruikbaar'], ja ? 'bruikbaar' : 'niet bruikbaar', ja ? 'Onderwerp, tijd en plaats kloppen.' : 'Een van de twee klopt niet.') ] });
        } },
      { id:'gs-standplaats', naam:'Standplaatsgebondenheid', kort:'Bij welke groep hoort de maker? Daardoor kijkt hij zo naar de gebeurtenis. De andere kant ziet het anders',
        uit:'<p>Iedereen kijkt naar een gebeurtenis vanuit zijn eigen plek: zijn land, geloof, partij of groep. Dat heet <b>standplaatsgebondenheid</b>.</p><p>Een Spaanse officier noemt de opstandelingen in 1572 rebellen. Een opstandeling noemt zichzelf een vrijheidsstrijder. Ze hebben het over hetzelfde, maar staan aan een <b>andere kant</b>.</p><p>Vraag je af: bij welke groep hoort de maker, en hoe zou de andere kant het zien?</p>',
        wanneer:'twee bronnen hetzelfde heel verschillend beschrijven.',
        maak:function(R){
          var b = R.kies(STAND), andereKanten = R.hussel(STAND.filter(function(x){ return x !== b; })).slice(0, 2).map(function(x){ return x[1]; });
          return OP({ context:'Lees de bron.' + bron(b[0]), vraag:kort(b[0], 60), vraagHtml:'Hoe ziet de andere kant het?',
            stappen:[
              K(R, 'Aan welke kant staat de maker?', b[1], andereKanten, 'Bij welke groep hoort de maker? Kijk naar wie hij is en wat hij schrijft.'),
              K(R, 'Hoe zouden ' + b[2] + ' het waarschijnlijk noemen?', b[3], [b[4], b[5]], b[2] + ' staan aan de andere kant. Zij zien het juist andersom.') ] });
        } },
      { id:'gs-kenmerkend', naam:'Een kenmerkend aspect herkennen', kort:'Bepaal eerst uit welk tijdvak de bron komt, en kies dan het kenmerkende aspect dat erbij past',
        uit:'<p>Bij elk tijdvak horen <b>kenmerkende aspecten</b>: ontwikkelingen die typisch zijn voor die tijd. Bijvoorbeeld de industriële revolutie in de tijd van burgers en stoommachines.</p><p>Zo vind je het kenmerkende aspect bij een bron:</p><ol><li>Zoek het <b>jaartal</b> en bepaal het <b>tijdvak</b>.</li><li>Kijk <b>waar de bron over gaat</b> en kies het kenmerkende aspect dat daarbij past.</li></ol><p>De kenmerkende aspecten staan hier ingekort.</p>',
        wanneer:'je in een toets een bron aan een kenmerkend aspect moet koppelen.',
        maak:function(R){
          var b = R.kies(KA);
          return OP({ context:'Lees de beschrijving van de bron.' + bron(b[0]), vraag:kort(b[0], 60), vraagHtml:'Bij welk kenmerkend aspect past de bron?',
            stappen:[
              K(R, 'Uit welk tijdvak komt de bron?', tvNaam(b[1]), andereTv(R, b[1]), 'Zoek het jaartal of de eeuw in de beschrijving en zoek het tijdvak.'),
              K(R, 'Bij welk kenmerkend aspect past de bron?', b[2], b[3], 'Waar gaat de bron over? Welk aspect beschrijft precies dat?') ] });
        } }
    ] });

  /* ================= 3 OORZAAK EN GEVOLG (onderbouw, redeneren) ================= */
  /* [zin, signaalwoord, oorzaak, gevolg] */
  var OG = [
    ['Doordat de boekdrukkunst werd uitgevonden, werden boeken veel goedkoper.', 'doordat', 'de boekdrukkunst werd uitgevonden', 'boeken werden veel goedkoper'],
    ['De Romeinen legden goede wegen aan, waardoor hun leger snel door het rijk kon trekken.', 'waardoor', 'de Romeinen legden goede wegen aan', 'hun leger kon snel door het rijk trekken'],
    ['Omdat bij de Watersnoodramp van 1953 veel mensen verdronken, werden de Deltawerken gebouwd.', 'omdat', 'bij de Watersnoodramp verdronken veel mensen', 'de Deltawerken werden gebouwd'],
    ['Door de handel van de VOC in specerijen werden veel kooplieden in de Republiek rijk.', 'door', 'de handel van de VOC in specerijen', 'veel kooplieden in de Republiek werden rijk'],
    ['In de steden kwamen veel fabrieken. Daardoor trokken veel mensen van het platteland naar de stad.', 'daardoor', 'in de steden kwamen veel fabrieken', 'veel mensen trokken van het platteland naar de stad'],
    ['Doordat mensen landbouw gingen bedrijven, konden ze op een vaste plek blijven wonen.', 'doordat', 'mensen gingen landbouw bedrijven', 'ze konden op een vaste plek blijven wonen'],
    ['Doordat er in 1929 een beurskrach was in New York, ontstond er een wereldwijde economische crisis.', 'doordat', 'er was een beurskrach in New York', 'er ontstond een wereldwijde economische crisis'],
    ['De pest doodde in de 14e eeuw heel veel mensen, waardoor er daarna te weinig arbeiders waren.', 'waardoor', 'de pest doodde heel veel mensen', 'er waren te weinig arbeiders'],
    ['Door de stoommachine hoefden fabrieken niet meer bij stromend water te staan.', 'door', 'de stoommachine', 'fabrieken hoefden niet meer bij stromend water te staan'],
    ['Luther kwam in conflict met de paus, omdat hij kritiek had op de katholieke kerk.', 'omdat', 'Luther had kritiek op de katholieke kerk', 'Luther kwam in conflict met de paus'],
    ['Omdat Europeanen zelf specerijen uit Azië wilden halen, zochten ze een zeeroute naar Azië.', 'omdat', 'Europeanen wilden zelf specerijen uit Azië halen', 'ze zochten een zeeroute naar Azië'],
    ['Na 1950 groeide de welvaart. Daardoor konden steeds meer gezinnen een auto kopen.', 'daardoor', 'de welvaart groeide', 'steeds meer gezinnen konden een auto kopen'],
    ['Koningin Wilhelmina vluchtte in mei 1940 naar Londen, omdat Duitsland Nederland binnenviel.', 'omdat', 'Duitsland viel Nederland binnen', 'koningin Wilhelmina vluchtte naar Londen'],
    ['Veel boeren in Europa trokken naar Amerika, doordat de oogst mislukte en er honger was.', 'doordat', 'de oogst mislukte en er was honger', 'veel boeren trokken naar Amerika']];
  var SIGNAAL = ['doordat', 'waardoor', 'omdat', 'door', 'daardoor', 'maar', 'en', 'toen', 'na'];
  /* soorten oorzaken */
  var SOORT = {
    politiek:['over macht, bestuur en wetten', ['De koning voerde een nieuwe wet in.', 'De regering verbood alle politieke partijen.', 'Twee landen sloten een verbond tegen een derde land.', 'De stadhouder kreeg meer macht.', 'Het parlement veranderde de grondwet.', 'Een nieuwe vorst nam de macht over.']],
    economisch:['over geld, handel en werk', ['De prijs van brood steeg sterk.', 'De handel met Azië leverde veel geld op.', 'Veel fabrieken gingen failliet en mensen werden werkloos.', 'De oogst mislukte, waardoor er weinig graan te koop was.', 'Kooplieden verdienden veel aan de handel in specerijen.', 'De lonen van de arbeiders daalden.']],
    sociaal:['over hoe groepen mensen samenleven', ['Arbeiders woonden met grote gezinnen in kleine, vochtige huizen.', 'Edelen keken neer op boeren en burgers.', 'De bevolking groeide zo snel dat de steden overvol raakten.', 'Mensen van verschillende standen gingen niet met elkaar om.', 'Veel gezinnen verhuisden van het platteland naar de stad.']],
    cultureel:['over ideeën, geloof, kunst en kennis', ['Nieuwe ideeën van de Verlichting werden populair.', 'Steeds meer mensen leerden lezen en schrijven.', 'Kunstenaars lieten zich inspireren door de Grieken en Romeinen.', 'Veel mensen gingen over op het protestantse geloof.', 'Wetenschappers ontdekten dat de aarde om de zon draait.']]};
  var BIJV = { politiek:'politieke', economisch:'economische', sociaal:'sociale', cultureel:'culturele' };
  /* anachronismen: [tijd (tijdvak), verhaal, goede dingen, het foute ding, uitleg] */
  var ANA = [
    [2, 'Een Romeinse soldaat staat op wacht bij een fort langs de Rijn.', ['een helm', 'een speer', 'een schild'], 'een polshorloge', 'Horloges om je pols bestaan pas sinds ongeveer honderd jaar.'],
    [4, 'Een ridder rijdt in 1200 naar een toernooi.', ['een zwaard', 'een paard', 'een maliënkolder'], 'een verrekijker', 'De verrekijker werd pas rond 1600 uitgevonden.'],
    [3, 'Een monnik schrijft in het jaar 900 in zijn klooster een boek over.', ['perkament', 'inkt', 'een ganzenveer'], 'een balpen', 'De balpen bestaat pas sinds de 20e eeuw.'],
    [1, 'Een groep jagers-verzamelaars zit rond 9000 v.Chr. bij hun kamp.', ['een speer met een vuurstenen punt', 'een vuur', 'een mand met bessen'], 'een ijzeren bijl', 'IJzer werd pas duizenden jaren later gebruikt.'],
    [6, 'Een VOC-schip vaart in 1650 naar Batavia.', ['zeilen', 'kanonnen', 'een kompas'], 'een stoommachine', 'Stoomschepen kwamen pas in de 19e eeuw.'],
    [5, 'Willem van Oranje leest in 1570 ’s avonds een brief.', ['een kaars', 'een zegel', 'een ganzenveer'], 'een gloeilamp', 'De gloeilamp werd pas in de 19e eeuw uitgevonden.'],
    [8, 'Arbeiders werken in 1880 in een textielfabriek.', ['een stoommachine', 'kolen', 'weefgetouwen'], 'een computer', 'Computers bestaan pas sinds de 20e eeuw.'],
    [9, 'Een gezin leeft in 1943 tijdens de bezetting.', ['een bonkaart', 'een radio', 'een fiets'], 'een mobiele telefoon', 'Mobiele telefoons kwamen pas aan het eind van de 20e eeuw.'],
    [2, 'Burgers in Athene gaan rond 450 v.Chr. naar de volksvergadering.', ['een tempel', 'olijven', 'een kruik met wijn'], 'aardappelen', 'Aardappelen kwamen pas na 1492 uit Amerika naar Europa.'],
    [4, 'Een kruisvaarder trekt in 1099 naar Jeruzalem.', ['een zwaard', 'een schild', 'een paard'], 'een geweer', 'Vuurwapens werden in Europa pas in de 14e eeuw gebruikt.'],
    [8, 'Soldaten van Napoleon trekken in 1812 naar Rusland.', ['een geweer met een bajonet', 'een trommel', 'paarden'], 'een tank', 'Tanks werden pas in de Eerste Wereldoorlog gebruikt.'],
    [6, 'Een koopvrouw staat in 1650 op de markt in Amsterdam.', ['haring', 'kaas', 'een weegschaal'], 'een plastic tas', 'Plastic bestaat pas sinds de 20e eeuw.']];

  G.push({ groep:{ id:'gs-oorzaak', niveau:'onderbouw', domein:'redeneren', naam:'Oorzaak en gevolg',
      uit:'Historisch redeneren: oorzaak en gevolg uit elkaar halen, oorzaken indelen in politiek, economisch, sociaal en cultureel, en zien wat niet in een tijd past.' },
    doelen:[
      { id:'gs-oorzaak-gevolg', naam:'Oorzaak en gevolg vinden', kort:'Zoek het signaalwoord. De oorzaak is waardoor iets gebeurt, het gevolg is wat er daarna gebeurt',
        uit:'<p>Een <b>oorzaak</b> is de reden waarom iets gebeurt. Het <b>gevolg</b> is wat er daardoor gebeurt.</p><p>Je herkent ze aan <b>signaalwoorden</b>: doordat, omdat, door, waardoor, daardoor.</p><p>Na <b>doordat, omdat</b> en <b>door</b> komt de oorzaak. Na <b>waardoor</b> en <b>daardoor</b> komt het gevolg. Let op: de oorzaak staat niet altijd vooraan in de zin.</p>',
        wanneer:'je in een tekst moet uitleggen waarom iets gebeurde.',
        maak:function(R){
          var z = R.kies(OG), sig = R.hussel(SIGNAAL.filter(function(w){ return w !== z[1] && (' ' + z[0].toLowerCase()).indexOf(' ' + w + ' ') < 0; })).slice(0, 2);
          var vooraan = /^(door|doordat|omdat)$/.test(z[1]);
          return OP({ context:'Lees de zin.', vraag:z[0],
            stappen:[
              K(R, 'Welk signaalwoord staat in de zin?', z[1], sig, 'Zoek een woord als doordat, omdat, door, waardoor of daardoor.'),
              K(R, 'Wat is de oorzaak?', z[2], [z[3]], vooraan ? 'Na "' + z[1] + '" komt de oorzaak.' : 'Na "' + z[1] + '" komt het gevolg. De oorzaak is het andere deel.'),
              K(R, 'Wat is het gevolg?', z[3], [z[2]], 'Het gevolg is wat er gebeurde door ' + z[2] + '.') ] });
        } },
      { id:'gs-soort-oorzaak', naam:'Soorten oorzaken', kort:'Gaat het over macht, over geld, over hoe mensen samenleven of over ideeën? Dan is het politiek, economisch, sociaal of cultureel',
        uit:'<p>Oorzaken kun je indelen in vier soorten:</p><ul><li><b>politiek</b>: over macht, bestuur, wetten en oorlog tussen landen</li><li><b>economisch</b>: over geld, handel, werk en prijzen</li><li><b>sociaal</b>: over hoe groepen mensen samenleven, standen en leefomstandigheden</li><li><b>cultureel</b>: over ideeën, geloof, kunst, wetenschap en onderwijs</li></ul><p>Vraag je af: waar gaat deze oorzaak vooral over?</p>',
        wanneer:'je oorzaken moet ordenen, bijvoorbeeld in een schema.',
        maak:function(R){
          var s = R.kies(Object.keys(SOORT)), z = R.kies(SOORT[s][1]);
          return OP({ context:'Wat voor soort oorzaak is dit?', vraag:z,
            stappen:[
              V('Waar gaat deze oorzaak vooral over?', Object.keys(SOORT).map(function(k){ return SOORT[k][0]; }), SOORT[s][0], 'Gaat het om macht, om geld, om groepen mensen of om ideeën?'),
              V('Dus het is een', ['politieke oorzaak', 'economische oorzaak', 'sociale oorzaak', 'culturele oorzaak'], BIJV[s] + ' oorzaak', SOORT[s][0].replace('over', 'Over') + ': ' + BIJV[s] + '.') ] });
        } },
      { id:'gs-anachronisme', naam:'Wat past niet in die tijd?', kort:'Bepaal uit welke tijd het verhaal komt en zoek het ding dat toen nog niet bestond',
        uit:'<p>Iets wat niet in een tijd past, heet een <b>anachronisme</b>. Een Romein met een horloge, een ridder met een verrekijker.</p><p>Bepaal eerst <b>uit welke tijd</b> het verhaal komt. Ga dan alle dingen langs: <b>bestond dit toen al?</b></p>',
        wanneer:'je een plaat, film of verhaal over het verleden bekijkt.',
        maak:function(R){
          var a = R.kies(ANA), ding = R.hussel(a[2].concat([a[3]])), andere = [];
          for (var i = 1; i <= 10; i++) if (i !== a[0] && Math.abs(i - a[0]) <= 3) andere.push(i);
          return OP({ context:a[1] + ' In het verhaal komen voor: ' + ding.join(', ') + '.', vraag:a[1], vraagHtml:'Wat past niet in die tijd?',
            stappen:[
              K(R, 'Uit welke tijd komt het verhaal?', tvNaam(a[0]), R.hussel(andere).slice(0, 2).map(tvNaam), 'Kijk naar het jaartal of naar wie er in het verhaal voorkomt.'),
              K(R, 'Welk ding bestond toen nog niet?', a[3], a[2], 'Ga alle dingen langs: konden mensen dat toen al maken?', { waarom:a[4] }) ] });
        } }
    ] });

  LEERROUTE.voeg('geschiedenis', G);
})();
