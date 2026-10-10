/* De leerroute Nederlands: literatuur, gesprekken, feedback en tekstsoorten.
   Het verhaal ontleden (motor, thema, motief, rollen, ontwikkeling, titel, omstandigheden,
   effect van verteltechnieken), genres (vorm, verhaalgenres, effect, beeld, alliteratie),
   literatuur door de tijd (middeleeuwen, Gouden Eeuw, Max Havelaar, oorlogsliteratuur,
   periode herkennen, universele thema's), lezen en vinden (mening, recensie, boek kiezen,
   leesbeleving, wat je leert), gesprekken in situaties, discussiëren, feedback en reflectie,
   en teksten schrijven (samenvatting, verslag, recensie, verhaal, instructie).
   Alle teksten zijn voor deze leerroute geschreven; fragmenten uit oude werken zijn
   naverteld in hedendaags Nederlands. Zie leerroute.js voor het formaat. */
(function(){
  'use strict';

  /* ---------- hulpjes ---------- */
  function q(w){ return '‘' + w + '’'; }
  function hoofd(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
  function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  /* een leestekst: alinea's in html (eigen inhoud) */
  function tekst(alineas, titel){
    return '<div class="lr-tekst">' + (titel ? '<p><b>' + titel + '</b></p>' : '') +
      [].concat(alineas).map(function(p){ return '<p>' + p + '</p>'; }).join('') + '</div>';
  }
  /* een keuzestap: goed en de foute opties, gehusseld; fm = { 'foute optie':'uitleg' } */
  function K(R, t, goed, fout, hint, fm, waarom){
    var lijst = [goed], gezien = {}; gezien[String(goed).toLowerCase()] = 1;
    fout.forEach(function(f){ var k = String(f).toLowerCase(); if (f != null && !gezien[k]){ gezien[k] = 1; lijst.push(f); } });
    var o = R.hussel(lijst), s = { tekst:t, opties:o, goed:o.indexOf(goed), hint:hint };
    if (fm){ s.fout = {}; for (var k in fm) s.fout[k.toLowerCase()] = fm[k]; }
    if (waarom) s.waarom = waarom;
    return s;
  }
  /* de opgave; eind = welke stap de eindvraag bij Zelf is (standaard de laatste) */
  function OP(vraag, context, stappen, eind){
    var l = stappen[eind == null ? stappen.length - 1 : eind];
    return { vraag:vraag, context:context, stappen:stappen, opties:l.opties, goed:l.goed };
  }
  /* n dingen uit een lijst, zonder die in 'niet' */
  function trek(R, lijst, niet, n){
    niet = [].concat(niet || []);
    return R.hussel(lijst.filter(function(x){ return niet.indexOf(x) < 0; })).slice(0, n);
  }
  /* algemeen item: { t:[alinea's], s:[[vraag, goed, [fout], hint], ...] } */
  function gen(R, it){
    var st = it.s.map(function(x){ return K(R, x[0], x[1], x[2], x[3]); });
    return OP(it.s[it.s.length - 1][0], tekst(it.t), st);
  }

  /* ================= HET VERHAAL ONTLEDEN ================= */

  /* motor: [fragment, naam, wens, [foute wensen], hindernis, [foute hindernissen]] */
  var MOTOR = [
    ['Al sinds groep zes droomt Jesse ervan om in het eerste elftal van zijn club te spelen. Maar bij de selectie blesseert hij zijn enkel. De trainer zegt dat hij de rest van het seizoen op de bank moet zitten.', 'Jesse', 'in het eerste elftal spelen', ['trainer worden', 'een nieuwe club zoeken'], 'hij heeft een geblesseerde enkel', ['hij is te klein', 'zijn ouders willen het niet']],
    ['Noor vindt een klein hondje in het park. Ze noemt hem Bolletje en wil hem heel graag houden. Maar haar moeder zegt nee: in hun flat mogen geen huisdieren.', 'Noor', 'het hondje houden', ['een nieuwe flat zoeken', 'elke dag naar het park gaan'], 'in hun flat mogen geen huisdieren', ['het hondje is ziek', 'Noor is bang voor honden']],
    ['Sem wil meedoen aan de talentenshow van school. Hij kan heel goed zingen. Maar als hij voor een groep moet staan, krijgt hij geen woord meer uit zijn keel.', 'Sem', 'meedoen aan de talentenshow', ['leren gitaar spelen', 'de show organiseren'], 'hij is heel bang om voor een groep te staan', ['hij kan niet zingen', 'de show gaat niet door']],
    ['Lina is net verhuisd naar een dorp waar ze niemand kent. Ze wil graag nieuwe vrienden maken. Maar de meiden in haar klas kennen elkaar al jaren en laten haar er niet tussen.', 'Lina', 'nieuwe vrienden maken', ['terug verhuizen naar de stad', 'de beste van de klas worden'], 'de meiden in haar klas laten haar er niet tussen', ['ze mag niet naar school', 'ze heeft geen telefoon']],
    ['Daan spaart al een jaar voor een nieuwe fiets. Hij heeft bijna genoeg geld. Dan wordt zijn spaarpot gestolen uit zijn kamer.', 'Daan', 'een nieuwe fiets kopen', ['een nieuwe spaarpot kopen', 'de dief vergeven'], 'zijn spaargeld is gestolen', ['de winkel is dicht', 'zijn oude fiets is nog goed']],
    ['Yara wil arts worden, net als haar tante. Ze haalt hoge cijfers voor biologie. Maar voor wiskunde staat ze een dikke onvoldoende, en zonder wiskunde mag ze die richting niet kiezen.', 'Yara', 'arts worden', ['wiskundeleraar worden', 'bij haar tante wonen'], 'ze staat een onvoldoende voor wiskunde', ['ze haalt slechte cijfers voor biologie', 'haar tante wil het niet']],
    ['Kian wil weten wie zijn echte vader is. Zijn moeder wil er nooit over praten. Elke keer als hij ernaar vraagt, begint ze over iets anders.', 'Kian', 'weten wie zijn echte vader is', ['met zijn moeder op vakantie gaan', 'een nieuwe vader krijgen'], 'zijn moeder wil er niet over praten', ['zijn vader woont in het buitenland', 'Kian durft het niet te vragen']],
    ['Het is de laatste dag van het schoolkamp. Fenna wil haar kamergenoten verrassen met een feest. Maar de leiding heeft streng gezegd dat iedereen om tien uur in bed moet liggen.', 'Fenna', 'haar kamergenoten verrassen met een feest', ['eerder naar huis gaan', 'de leiding helpen met koken'], 'iedereen moet om tien uur in bed liggen', ['haar kamergenoten zijn ziek', 'er is geen eten']],
    ['Bram heeft per ongeluk de nieuwe telefoon van zijn zus laten vallen. Het scherm is gebarsten. Hij wil het laten maken voordat zij thuiskomt, maar de reparatie kost veel meer dan hij heeft.', 'Bram', 'de telefoon laten maken voordat zijn zus thuiskomt', ['een nieuwe telefoon voor zichzelf kopen', 'zijn zus ophalen'], 'hij heeft niet genoeg geld voor de reparatie', ['zijn zus is al thuis', 'de winkel heeft geen nieuwe schermen']],
    ['Mila wil met haar beste vriendin naar het concert van haar favoriete zangeres. Maar de kaartjes zijn binnen vijf minuten uitverkocht.', 'Mila', 'naar het concert van haar favoriete zangeres gaan', ['zelf zangeres worden', 'een nieuwe vriendin zoeken'], 'de kaartjes zijn uitverkocht', ['haar vriendin wil niet mee', 'het concert is afgelast']],
    ['De opa van Ravi is ernstig ziek en ligt in een ziekenhuis in India. Ravi wil hem nog één keer zien. Maar zijn ouders hebben geen geld voor de reis.', 'Ravi', 'zijn opa nog één keer zien', ['dokter worden', 'naar India verhuizen'], 'zijn ouders hebben geen geld voor de reis', ['zijn opa wil hem niet zien', 'het ziekenhuis is dicht']],
    ['Tess wil de schaakwedstrijd van de stad winnen. In de finale moet ze spelen tegen Kevin, die nog nooit een partij heeft verloren.', 'Tess', 'de schaakwedstrijd winnen', ['vrienden worden met Kevin', 'leren schaken'], 'ze moet spelen tegen iemand die nog nooit heeft verloren', ['ze kent de regels niet', 'de wedstrijd gaat niet door']],
    ['Joep wil laten zien dat hij oud genoeg is om alleen met de trein naar zijn oom in Groningen te gaan. Maar zijn moeder vindt het veel te gevaarlijk.', 'Joep', 'alleen met de trein naar zijn oom gaan', ['in Groningen gaan wonen', 'zijn oom uitnodigen'], 'zijn moeder vindt het te gevaarlijk', ['er rijden geen treinen', 'zijn oom is niet thuis']],
    ['Sara heeft een geheim: ze wil danseres worden. Maar haar vader wil dat ze later het familiebedrijf overneemt. Hij vindt dansen tijdverspilling.', 'Sara', 'danseres worden', ['het familiebedrijf overnemen', 'haar vader helpen'], 'haar vader wil dat ze het familiebedrijf overneemt', ['ze kan niet dansen', 'er is geen dansschool']]
  ];
  function maakMotor(R, it){
    var n = it[1], zin = function(w, h){ return n + ' wil ' + w + ', maar ' + h + '.'; };
    return OP('Wat is de motor van het verhaal?', tekst(it[0]), [
      K(R, 'Wat wil ' + n + '?', it[2], it[3], 'Zoek woorden als wil, droomt of spaart. Wat wil ' + n + ' bereiken?'),
      K(R, 'Wat staat ' + n + ' in de weg?', it[4], it[5], 'Zoek wat het moeilijk maakt. Vaak staat het na maar of dan.'),
      K(R, 'Wat is de motor van het verhaal?', zin(it[2], it[4]), [zin(it[3][0], it[4]), zin(it[2], it[5][0])], 'Zet de wens en de hindernis samen: ' + n + ' wil ' + it[2] + ', maar ' + it[4] + '.')
    ]);
  }

  /* thema: [samenvatting, onderwerp, thema, [foute thema's]] */
  var THEMA = [
    ['Tim en Mo zitten samen in een voetbalteam. Als Mo naar het eerste team mag en Tim niet, wordt het lastig tussen hen. Pas aan het eind merken ze dat ze elkaar meer nodig hebben dan de club.', 'een voetbalteam', 'vriendschap', ['vrijheid', 'schuld']],
    ['Na de dood van haar oma gaat Lotte elke dag naar het tuintje dat oma had aangelegd. Ze zorgt voor de planten, en langzaam leert ze leven met het gemis.', 'een tuintje', 'verlies', ['jaloezie', 'vrijheid']],
    ['Joris gaat voor het eerst alleen op vakantie met vrienden. Hij moet zelf koken, op tijd zijn en problemen oplossen. Thuis merkt hij dat hij veel zelfstandiger is geworden.', 'een vakantie met vrienden', 'opgroeien', ['verlies', 'jaloezie']],
    ['Eva’s nieuwe stiefzus krijgt alle aandacht van haar vader. Eva verstopt stiekem de spullen van haar stiefzus, en voelt zich daarna rot.', 'een stiefzus', 'jaloezie', ['vrijheid', 'moed']],
    ['Amir durft niet te zeggen dat hij gepest wordt. Op een dag ziet hij dat een jonger kind hetzelfde overkomt. Hij stapt op de pesters af en zegt dat ze moeten stoppen.', 'pesten op school', 'moed', ['liefde', 'verlies']],
    ['Een oude man woont alleen in een groot huis. Niemand komt meer langs. Elke dag wacht hij bij het raam op de postbode, alleen om even iemand te spreken.', 'een oude man en de postbode', 'eenzaamheid', ['jaloezie', 'moed']],
    ['Sven heeft per ongeluk een brand veroorzaakt in de schuur van de buren. Niemand weet dat hij het was. Hij kan niet meer slapen en durft de buren niet meer aan te kijken.', 'een brand in een schuur', 'schuld', ['vriendschap', 'liefde']],
    ['Een vogel wordt in een kooi gehouden door een rijke koopman. Elke dag kijkt hij naar de vogels die buiten vliegen. Als het deurtje een keer open blijft staan, twijfelt hij.', 'een vogel in een kooi', 'vrijheid', ['schuld', 'vriendschap']],
    ['Jun is de enige in de klas die stottert. Hij wil gewoon meedoen, maar iedereen kijkt naar hem als hij praat. In de schoolmusical laat hij zien wat hij wel kan: zingen zonder te stotteren.', 'een schoolmusical', 'anders zijn', ['verlies', 'schuld']],
    ['Lisa vertelt haar beste vriendin een geheim. De volgende dag weet de hele klas het. Lisa weet niet of ze haar vriendin ooit nog iets kan vertellen.', 'een geheim', 'vertrouwen', ['opgroeien', 'vrijheid']],
    ['Na de scheiding van hun ouders wonen Bas en zijn zus in twee verschillende huizen. Ze missen elkaar. Elke zondag spreken ze af bij de snackbar halverwege.', 'een snackbar', 'familie', ['moed', 'jaloezie']],
    ['Ilse wordt verliefd op de nieuwe jongen in de straat. Ze schrijft hem brieven, maar durft ze niet te sturen. Aan het eind geeft ze hem er toch één.', 'brieven schrijven', 'liefde', ['verlies', 'schuld']],
    ['Ruben verliest zijn hond bij een ongeluk. Hij wil niets meer met dieren te maken hebben. Pas als hij een jong katje in de sloot ziet, durft hij weer van een dier te houden.', 'een hond en een katje', 'verlies', ['jaloezie', 'vrijheid']],
    ['Jade is altijd de beste van de klas. Als een nieuwe leerling hogere cijfers haalt, vertelt Jade rond dat die leerling spiekt.', 'cijfers op school', 'jaloezie', ['vrijheid', 'liefde']],
    ['Kofi komt uit Ghana en woont pas een jaar in Nederland. Hij snapt de grapjes van zijn klasgenoten niet en voelt zich steeds de vreemde eend. Langzaam vindt hij toch zijn plek.', 'verhuizen naar Nederland', 'anders zijn', ['jaloezie', 'schuld']]
  ];
  var ONDERWERPEN = THEMA.map(function(x){ return x[1]; });
  function maakThema(R, it){
    var fm = {}; fm[it[1]] = 'Dat is het onderwerp: waar het aan de buitenkant over gaat. Het thema is groter: een gevoel of een levensvraag.';
    return OP('Wat is het thema van dit verhaal?', tekst(it[0]), [
      K(R, 'Wat is het onderwerp: waar gaat het over aan de buitenkant?', it[1], trek(R, ONDERWERPEN, [it[1]], 2), 'Het onderwerp is iets concreets wat je ziet in het verhaal: een ding, een plek of een gebeurtenis.'),
      K(R, 'Wat is het thema: waar gaat het eigenlijk over?', it[2], [it[1], it[3][0]], 'Vraag je af welk gevoel of welke levensvraag achter ' + q(it[1]) + ' zit.', fm)
    ]);
  }

  /* motief: [[drie momenten], motief, [fout], betekenis, [fout]] */
  var MOTIEF = [
    [['Op de eerste schooldag draagt Mila de rode sjaal van haar overleden moeder.', 'Als ze verdrietig is, ruikt ze aan de sjaal.', 'Op de laatste bladzijde geeft ze de sjaal aan haar kleine zusje.'], 'de rode sjaal', ['de eerste schooldag', 'het kleine zusje'], 'de herinnering aan haar moeder', ['het koude weer', 'de mode op school']],
    [['Elke avond staat Daan op het balkon naar de treinen te kijken.', 'Als zijn vader vertrekt, neemt hij de trein van zeven uur.', 'Aan het eind stapt Daan zelf in de trein naar de stad.'], 'de trein', ['het balkon', 'zijn vader'], 'weggaan en een nieuw leven beginnen', ['Daan houdt van techniek', 'treinen komen vaak te laat']],
    [['Noor zit in de pauze altijd alleen bij het hek van het schoolplein.', 'Als ze ruzie heeft met haar moeder, fietst ze naar het hek bij de wei.', 'Aan het eind klimt ze over het hek en loopt ze de wei in.'], 'een hek', ['de pauze', 'haar moeder'], 'Noor voelt zich opgesloten en wil vrij zijn', ['Noor houdt van paarden', 'Noor zit graag buiten']],
    [['Op de avond dat Tim hoort dat zijn ouders gaan scheiden, stormt het.', 'Als hij ruzie maakt met zijn vader, slaat de regen tegen de ramen.', 'Pas als het weer goed is tussen hen, schijnt de zon.'], 'het weer', ['de ramen', 'zijn vader'], 'hoe Tim zich vanbinnen voelt', ['hoe laat het is', 'welk seizoen het is']],
    [['De oude klok in de gang van opa tikt luid.', 'Als opa ziek wordt, blijft de klok stilstaan.', 'Na de begrafenis zet Ravi de klok weer in gang.'], 'de klok van opa', ['de gang', 'de begrafenis'], 'de tijd die opa nog heeft, en dat het leven doorgaat', ['Ravi komt vaak te laat', 'opa repareert graag klokken']],
    [['Elke ochtend staat Sanne lang voor de spiegel en vindt ze zichzelf lelijk.', 'In de kleedkamer van de gymzaal kijkt ze nooit in de spiegel.', 'Op de laatste bladzijde kijkt ze in de spiegel en lacht ze.'], 'de spiegel', ['de gymzaal', 'de ochtend'], 'hoe Sanne over zichzelf denkt', ['Sanne wil kapper worden', 'de gymzaal is oud']],
    [['Jasper ziet als kind een meeuw boven de haven zweven.', 'Als hij in een jeugdgevangenis zit, tekent hij meeuwen op de muur van zijn cel.', 'Op de dag dat hij vrijkomt, vliegt er een meeuw over zijn hoofd.'], 'de meeuw', ['de haven', 'de muur'], 'vrijheid', ['Jasper houdt van tekenen', 'de haven is vies']],
    [['Lotte slaapt altijd met het licht aan.', 'Als ze per ongeluk in de donkere kelder wordt opgesloten, zoekt ze wanhopig naar een lichtknop.', 'Aan het eind doet ze voor het eerst zelf het licht uit.'], 'licht en donker', ['de kelder', 'haar bed'], 'Lottes angst, en dat ze die overwint', ['de stroom valt vaak uit', 'Lotte leest graag in bed']],
    [['Fenna vindt op zolder een doos met brieven van haar opa.', 'Bij elke brief hoort ze iets nieuws over zijn leven in de oorlog.', 'Aan het eind schrijft ze zelf een brief aan haar kleinkind, dat nog niet bestaat.'], 'brieven', ['de zolder', 'de oorlog'], 'herinneringen doorgeven aan de volgende generatie', ['Fenna wil postbode worden', 'de zolder is rommelig']],
    [['Ilias speelt piano als hij alleen thuis is.', 'Als zijn broer in het ziekenhuis ligt, speelt hij het lievelingsliedje van zijn broer.', 'Als zijn broer weer thuiskomt, zingen ze dat liedje samen.'], 'het lievelingsliedje', ['het ziekenhuis', 'alleen thuis zijn'], 'de band tussen Ilias en zijn broer', ['Ilias wil beroemd worden', 'het ziekenhuis heeft een piano']],
    [['Bas krijgt van zijn vader een sleutel van het nieuwe huis.', 'Na een ruzie verliest hij de sleutel en kan hij niet meer naar binnen.', 'Aan het eind laat zijn vader een nieuwe sleutel maken, en Bas hangt hem aan een ketting om zijn nek.'], 'de sleutel', ['de ruzie', 'de ketting'], 'of Bas zich thuis voelt bij zijn vader', ['Bas raakt vaak dingen kwijt', 'het huis is nieuw']],
    [['Yara zwemt als kind in de rivier achter het dorp.', 'Als ze ouder is, wil ze de rivier volgen naar de grote stad.', 'Aan het eind komt ze terug en zit ze weer aan de oever.'], 'de rivier', ['het dorp', 'de grote stad'], 'haar leven: weggaan en weer thuiskomen', ['Yara zwemt graag', 'het dorp ligt aan het water']],
    [['Kevin draagt de oude voetbalschoenen van zijn grote broer.', 'In het begin zijn ze hem veel te groot.', 'Aan het eind van het seizoen passen ze precies.'], 'de voetbalschoenen van zijn broer', ['het seizoen', 'zijn grote broer'], 'Kevin groeit op en wordt net zo goed als zijn broer', ['Kevin heeft geen geld voor nieuwe schoenen', 'voetbalschoenen slijten snel']],
    [['Op het nachtkastje van Emma staat een foto van haar en haar beste vriendin.', 'Na hun ruzie legt ze de foto omgekeerd neer.', 'Als ze het goedmaken, zet ze de foto weer rechtop.'], 'de foto', ['het nachtkastje', 'de ruzie'], 'de vriendschap tussen Emma en haar vriendin', ['Emma fotografeert graag', 'het nachtkastje is oud']]
  ];
  function maakMotief(R, it){
    return OP('Waar staat het motief voor?', tekst(it[0].map(function(z, i){ return '<b>' + (i + 1) + '</b> ' + z; })), [
      K(R, 'Wat komt in alle drie de stukjes terug?', it[1], it[2], 'Lees de drie stukjes. Welk ding of welk beeld zie je in elk stukje?'),
      K(R, 'Waar staat ' + it[1] + ' voor?', it[3], it[4], 'Kijk wat er met ' + it[1] + ' gebeurt in het begin en aan het eind. Wat zegt dat over het personage?')
    ]);
  }

  /* rollen: tekst, en per rol [naam, wat hij of zij doet] */
  var ROL = [
    { t:'Mila wil de schoolkrant redden, want de directeur wil ermee stoppen. Directeur Van Dam vindt de krant te duur en wil de stekker eruit trekken. Mila’s opa, een oud-journalist, leert haar hoe je een goed artikel schrijft.', h:['Mila', 'wil de schoolkrant redden'], t2:['directeur Van Dam', 'wil met de schoolkrant stoppen'], p:['opa', 'leert Mila hoe je een goed artikel schrijft'] },
    { t:'Sem wil de zwemwedstrijd winnen. Zijn grootste rivaal Kees probeert hem steeds uit zijn concentratie te halen met gemene opmerkingen. Zijn trainster Ans traint elke ochtend extra met hem.', h:['Sem', 'wil de zwemwedstrijd winnen'], t2:['Kees', 'probeert Sem uit zijn concentratie te halen'], p:['trainster Ans', 'traint elke ochtend extra met Sem'] },
    { t:'Lina zoekt haar verdwenen kat. De buurjongen Rick heeft de kat stiekem opgesloten in zijn schuur en liegt erover. Lina’s vriendin Puck helpt haar met het ophangen van briefjes in de hele wijk.', h:['Lina', 'zoekt haar verdwenen kat'], t2:['Rick', 'heeft de kat opgesloten en liegt erover'], p:['Puck', 'hangt samen met Lina briefjes op'] },
    { t:'Ridder Walter moet de prinses bevrijden uit de toren. De tovenaar Morgo heeft de toren betoverd, zodat niemand erin kan. Een sprekende uil wijst Walter de geheime ingang.', h:['ridder Walter', 'moet de prinses bevrijden'], t2:['de tovenaar Morgo', 'heeft de toren betoverd'], p:['de uil', 'wijst Walter de geheime ingang'] },
    { t:'Daan wil uitzoeken wie er op school de fietsbanden lek prikt. De conciërge, meneer Smit, doet het zelf, en hij stuurt Daan steeds de verkeerde kant op. Daans zus Eva bekijkt de camerabeelden met hem.', h:['Daan', 'wil uitzoeken wie de banden lek prikt'], t2:['meneer Smit', 'prikt de banden lek en stuurt Daan de verkeerde kant op'], p:['Eva', 'bekijkt de camerabeelden met Daan'] },
    { t:'Yara wil naar de kunstacademie. Haar moeder vindt dat onzin en wil dat ze rechten gaat studeren. Haar tekenleraar, meneer Okafor, helpt haar met haar map vol tekeningen.', h:['Yara', 'wil naar de kunstacademie'], t2:['Yara’s moeder', 'wil dat Yara rechten gaat studeren'], p:['meneer Okafor', 'helpt Yara met haar map vol tekeningen'] },
    { t:'Kian wil met zijn band de bandjeswedstrijd winnen. Jordy, de zanger van een andere band, steelt hun nummer en speelt het eerder. De geluidsvrouw, Fatima, helpt Kian om op het laatste moment een nieuw nummer te maken.', h:['Kian', 'wil met zijn band de wedstrijd winnen'], t2:['Jordy', 'steelt het nummer van de band van Kian'], p:['Fatima', 'helpt Kian snel een nieuw nummer te maken'] },
    { t:'Fenna wil de bakkerij van haar oma redden. Meneer Bakker wil het pand slopen voor een parkeergarage. Buurman Henk zamelt samen met Fenna geld in.', h:['Fenna', 'wil de bakkerij van haar oma redden'], t2:['meneer Bakker', 'wil het pand slopen voor een parkeergarage'], p:['buurman Henk', 'zamelt samen met Fenna geld in'] },
    { t:'Jesse wil de hoofdrol in de schoolmusical. Zijn klasgenoot Romy wil dezelfde rol en vertelt de regisseur leugens over hem. Zijn vriend Ahmed oefent elke dag de liedjes met hem.', h:['Jesse', 'wil de hoofdrol in de schoolmusical'], t2:['Romy', 'vertelt leugens over Jesse om de rol te krijgen'], p:['Ahmed', 'oefent elke dag de liedjes met Jesse'] },
    { t:'Prinses Ilse wil zelf koningin worden. Haar oom, de hertog, wil de troon voor zichzelf en sluit haar op. De kokkin smokkelt elke avond briefjes voor haar naar buiten.', h:['prinses Ilse', 'wil zelf koningin worden'], t2:['de hertog', 'wil de troon voor zichzelf en sluit Ilse op'], p:['de kokkin', 'smokkelt briefjes voor Ilse naar buiten'] },
    { t:'Bram wil met zijn klas een schoolreis naar Parijs organiseren. Mentor De Wit zegt bij elk plan dat het niet kan. Zijn klasgenoot Noor maakt met hem een begroting die klopt.', h:['Bram', 'wil een schoolreis naar Parijs organiseren'], t2:['mentor De Wit', 'zegt bij elk plan dat het niet kan'], p:['Noor', 'maakt met Bram een begroting die klopt'] },
    { t:'Astronaut Zara moet het ruimteschip veilig terug naar de aarde brengen. De boordcomputer neemt het schip over en wil niet terug. De kleine robot Pip helpt Zara om de computer uit te schakelen.', h:['Zara', 'moet het ruimteschip terug naar de aarde brengen'], t2:['de boordcomputer', 'neemt het schip over en wil niet terug'], p:['de robot Pip', 'helpt Zara de computer uit te schakelen'] },
    { t:'Ravi wil zijn vader overhalen om een hond te nemen. Zijn vader vindt honden vies en zegt steeds nee. Ravi’s oma neemt hem mee naar het asiel en laat zien hoe lief de honden daar zijn.', h:['Ravi', 'wil zijn vader overhalen om een hond te nemen'], t2:['Ravi’s vader', 'zegt steeds nee tegen een hond'], p:['Ravi’s oma', 'neemt Ravi mee naar het asiel'] },
    { t:'Lotte wil de verdwijning van haar buurvrouw oplossen. Inspecteur Kramer wil haar er juist buiten houden en verstopt bewijs. Haar buurjongen Tom kraakt het wachtwoord van de laptop van de buurvrouw.', h:['Lotte', 'wil de verdwijning van haar buurvrouw oplossen'], t2:['inspecteur Kramer', 'houdt Lotte erbuiten en verstopt bewijs'], p:['Tom', 'kraakt het wachtwoord van de laptop'] }
  ];
  var ROLNAAM = { h:'de hoofdpersoon', t2:'de tegenspeler', p:'de helper' };
  var ROLHINT = { h:'Om wie draait het verhaal? Wie wil iets bereiken?', t2:'Wie maakt het de hoofdpersoon moeilijk?', p:'Wie helpt de hoofdpersoon om te krijgen wat hij of zij wil?' };
  function maakRol(R, it){
    var r = R.kies(['h', 't2', 'p']), wie = it[r][0];
    return OP('Welke rol heeft ' + wie + '?', tekst(it.t), [
      K(R, 'Wat doet ' + wie + ' in het verhaal?', it[r][1], ['h', 't2', 'p'].filter(function(x){ return x !== r; }).map(function(x){ return it[x][1]; }), 'Zoek ' + wie + ' in de tekst en lees wat er over ' + wie + ' staat.'),
      K(R, 'Welke rol heeft ' + wie + '?', ROLNAAM[r], ['de hoofdpersoon', 'de tegenspeler', 'de helper'], ROLHINT[r] + ' ' + hoofd(wie) + ' ' + it[r][1] + '.')
    ]);
  }

  /* ontwikkeling: [begin, eind, naam, eigenschap begin, eigenschap eind, andere eigenschap] */
  var ONTW = [
    ['Sem zegt in de klas nooit iets. Als de juf hem iets vraagt, wordt hij rood en kijkt hij naar de grond.', 'Aan het eind van het jaar houdt Sem een presentatie voor de hele school. Hij maakt zelfs een grap.', 'Sem', 'verlegen', 'zelfverzekerd', 'gemeen'],
    ['Lotte denkt alleen aan zichzelf. Ze pakt altijd het grootste stuk taart en leent nooit iets uit.', 'Als haar buurmeisje ziek is, brengt Lotte elke dag het huiswerk en haar eigen snoep.', 'Lotte', 'egoïstisch', 'zorgzaam', 'bang'],
    ['Kevin lacht anderen uit en duwt jongere kinderen opzij.', 'Nadat hij zelf gepest is op zijn nieuwe club, biedt Kevin zijn excuses aan en neemt hij het op voor een brugklasser.', 'Kevin', 'gemeen', 'vriendelijk', 'verlegen'],
    ['Noor durft niet het water in. Bij zwemles blijft ze aan de kant staan.', 'In de zomer springt Noor van de hoge duikplank, en ze lacht als ze bovenkomt.', 'Noor', 'bang', 'moedig', 'lui'],
    ['Tim heeft nergens zin in. Hij hangt de hele dag op de bank en maakt nooit zijn huiswerk.', 'Als hij een bijbaan bij de dierenarts krijgt, staat Tim elke zaterdag om zeven uur klaar, en hij haalt zijn cijfers op.', 'Tim', 'lui', 'ijverig', 'jaloers'],
    ['Eva vertrouwt niemand. Ze vertelt nooit iets over zichzelf en houdt iedereen op afstand.', 'Aan het eind vertelt Eva haar nieuwe vriendin haar grootste geheim.', 'Eva', 'wantrouwig', 'open', 'brutaal'],
    ['Jesse schept altijd op over zijn dure kleren en zijn hoge cijfers.', 'Na een paar maanden op een nieuwe school, waar niemand hem kent, praat Jesse vooral over anderen en luistert hij goed.', 'Jesse', 'opschepperig', 'bescheiden', 'verlegen'],
    ['Mo raakt snel boos. Als hij verliest, smijt hij zijn controller door de kamer.', 'Aan het eind van het verhaal verliest Mo de finale, en hij geeft zijn tegenstander rustig een hand.', 'Mo', 'driftig', 'rustig', 'vrolijk'],
    ['Fenna is altijd vrolijk en maakt overal grapjes over.', 'Na de dood van haar hond is Fenna stil. Ze zit vaak alleen en lacht bijna nooit meer.', 'Fenna', 'vrolijk', 'somber', 'gemeen'],
    ['Daan is eerlijk. Hij vertelt altijd de waarheid, ook als dat lastig is.', 'Om bij de populaire groep te horen, liegt Daan tegen zijn ouders en verraadt hij zijn beste vriend.', 'Daan', 'eerlijk', 'onbetrouwbaar', 'verlegen'],
    ['Ravi is heel onzeker over zijn tekeningen. Hij laat ze aan niemand zien.', 'Ravi stuurt een tekening in voor een wedstrijd en hangt hem trots op in de aula.', 'Ravi', 'onzeker', 'trots', 'boos'],
    ['Lisa is jaloers op haar zus, die alles beter kan.', 'Als haar zus een belangrijke wedstrijd verliest, troost Lisa haar en zegt ze hoe knap ze haar zus vindt.', 'Lisa', 'jaloers', 'meelevend', 'lui'],
    ['Bram is een zorgeloze jongen die nergens over nadenkt.', 'Na het ongeluk van zijn vader zorgt Bram voor zijn kleine broertjes en denkt hij goed na voordat hij iets doet.', 'Bram', 'zorgeloos', 'verantwoordelijk', 'gemeen'],
    ['Yara wil alles alleen doen. Hulp vragen vindt ze zwak.', 'Als het project te groot wordt, vraagt Yara haar klasgenoten om hulp, en samen maken ze het af.', 'Yara', 'koppig', 'open voor hulp', 'bang']
  ];
  function maakOntw(R, it){
    var n = it[2], b = it[3], e = it[4], o = it[5];
    return OP('Hoe ontwikkelt ' + n + ' zich?', tekst(['<b>Begin</b> ' + it[0], '<b>Eind</b> ' + it[1]]), [
      K(R, 'Hoe is ' + n + ' aan het begin?', b, [e, o], 'Lees alleen het begin. Wat doet ' + n + ' daar? Wat voor iemand doet zoiets?'),
      K(R, 'Hoe is ' + n + ' aan het eind?', e, [b, o], 'Lees alleen het eind. Wat doet ' + n + ' nu anders dan in het begin?'),
      K(R, 'Hoe ontwikkelt ' + n + ' zich?', 'van ' + b + ' naar ' + e, ['van ' + e + ' naar ' + b, n + ' blijft de hele tijd ' + b], 'Eerst ' + b + ', aan het eind ' + e + '. Zet het in de goede volgorde.')
    ]);
  }

  /* titel: [titel, samenvatting, soort, verklaring, [foute verklaringen]] */
  var TSOORT = { naam:'de naam van de hoofdpersoon', ding:'een belangrijk voorwerp', plaats:'de plaats waar het verhaal speelt', fig:'iets figuurlijks: het thema' };
  var THINT = { naam:'Is de titel een naam? Van wie dan?', ding:'Is de titel een ding dat in het verhaal een grote rol speelt?', plaats:'Is de titel een plek waar het verhaal zich afspeelt?', fig:'Kan de titel letterlijk niet kloppen? Dan is hij figuurlijk bedoeld.' };
  var TITEL = [
    ['Het zilveren medaillon', 'Lotte vindt op zolder een zilveren medaillon met een foto van een onbekend meisje. Ze gaat op zoek naar wie het meisje is, en ontdekt dat ze een tante had van wie niemand iets wist.', 'ding', 'het medaillon zet de hele zoektocht in gang', ['Lotte wil juwelier worden', 'het verhaal speelt in een juwelierszaak']],
    ['Mila', 'Mila is twaalf als haar moeder voor een jaar naar het buitenland vertrekt. Het boek volgt Mila dat hele jaar: thuis, op school en in haar dromen.', 'naam', 'het hele boek draait om Mila en wat zij meemaakt', ['Mila komt maar één keer voor', 'het boek gaat over een land dat Mila heet']],
    ['Het eiland', 'Vier kinderen stranden na een storm op een onbewoond eiland. Ze moeten samen overleven tot er hulp komt.', 'plaats', 'het hele verhaal speelt zich af op het eiland', ['een van de kinderen heet Eiland', 'de kinderen bouwen een eiland']],
    ['Tegen de stroom in', 'Sara is de enige in haar familie die wil studeren. Iedereen zegt dat ze moet gaan werken, maar zij zet door.', 'fig', 'Sara doet wat zij wil, ook al wil iedereen om haar heen iets anders', ['Sara zwemt tegen de stroom van een rivier in', 'het verhaal speelt bij een rivier']],
    ['De laatste bus', 'Daan mist de laatste bus naar huis na een feest. Tijdens zijn lange wandeling door de nacht ontmoet hij een oude man die zijn leven verandert.', 'ding', 'doordat Daan de laatste bus mist, begint het hele verhaal', ['Daan wordt later buschauffeur', 'het hele verhaal speelt in een bus']],
    ['Kopje onder', 'Na de scheiding van haar ouders zakt Noor steeds verder weg: slechte cijfers en geen vrienden meer. Haar mentor helpt haar langzaam weer overeind.', 'fig', 'het gaat steeds slechter met Noor, alsof ze kopje onder gaat', ['Noor valt in het water', 'het verhaal speelt in een zwembad']],
    ['Villa Zonnehoek', 'In verzorgingshuis Villa Zonnehoek raakt de vijftienjarige vrijwilliger Joep bevriend met de bewoners.', 'plaats', 'het verhaal speelt zich af in het verzorgingshuis Villa Zonnehoek', ['Joep woont in een villa', 'de zon schijnt het hele verhaal']],
    ['Kai', 'Kai is een jongen die niet kan horen. Het boek vertelt hoe hij zijn eerste jaar op een gewone middelbare school doorkomt.', 'naam', 'het hele boek draait om Kai en zijn eerste schooljaar', ['Kai is een bijfiguur', 'Kai is de naam van de school']],
    ['De sleutelbos', 'Conciërge Wim verliest zijn sleutelbos, met de sleutels van elke deur van de school. Drie leerlingen helpen hem zoeken en ontdekken geheime kamers.', 'ding', 'het zoeken naar de sleutelbos is de motor van het verhaal', ['Wim heet eigenlijk Sleutelbos', 'het verhaal speelt in een slotenwinkel']],
    ['Een huis van glas', 'Online lijkt het leven van Jade perfect. Maar thuis is er veel ruzie, en ze is bang dat iedereen dat ontdekt.', 'fig', 'iedereen kijkt naar het leven van Jade, en het kan elk moment breken', ['Jade woont in een glazen huis', 'het verhaal gaat over een glasblazer']],
    ['Zomer in Zeeland', 'Tess logeert een zomer bij haar oom op een boerderij in Zeeland. Daar leert ze zeilen en wordt ze voor het eerst verliefd.', 'plaats', 'het verhaal speelt zich af in Zeeland, tijdens één zomer', ['het boek gaat over de geschiedenis van Zeeland', 'Tess heet eigenlijk Zeeland']],
    ['Bas', 'Bas is de jongste van zes kinderen en wil eindelijk eens gezien worden. Het boek laat zien hoe hij zijn eigen plek vindt.', 'naam', 'het hele boek draait om Bas en zijn zoektocht naar een eigen plek', ['Bas is de oudste broer', 'Bas is de naam van de hond']],
    ['Het rode schrift', 'Ilias vindt het rode schrift van zijn overleden opa. Het is een dagboek uit de tijd dat opa naar Nederland kwam.', 'ding', 'het schrift vertelt het verhaal van opa, en daar gaat het boek over', ['Ilias houdt van de kleur rood', 'Ilias moet een schrift kopen voor school']],
    ['Sterker dan ijzer', 'Na een zwaar ongeluk moet Fenna opnieuw leren lopen. Ze geeft niet op en loopt een jaar later de schoolrun uit.', 'fig', 'Fenna is heel sterk vanbinnen en geeft niet op', ['Fenna werkt in een ijzerfabriek', 'het verhaal gaat over metaal']],
    ['Fatima', 'Fatima is de eerste keeper van haar club die een meisje is. Het boek volgt haar seizoen vol tegenwind en overwinningen.', 'naam', 'het hele boek draait om Fatima en haar seizoen', ['Fatima is de trainer', 'Fatima is de naam van de club']]
  ];
  function maakTitel(R, it){
    var s = it[2];
    return OP('Waarom past de titel bij het verhaal?', tekst(it[1], it[0]), [
      K(R, 'Waar verwijst de titel ' + q(it[0]) + ' naar?', TSOORT[s], Object.keys(TSOORT).filter(function(x){ return x !== s; }).map(function(x){ return TSOORT[x]; }), THINT[s]),
      K(R, 'Waarom past de titel bij het verhaal?', it[3], it[4], 'Zoek in de samenvatting waar ' + q(it[0]) + ' terugkomt. Kies de uitleg die echt in het verhaal staat.')
    ]);
  }

  /* omstandigheden: [fragment, waar wanneer of welke situatie, [fout], invloed, [fout]] */
  var INVLOED = [
    ['1943. Jan zit ondergedoken op een zolder in Amsterdam. Hij hoort zijn vriendjes buiten voetballen, maar hij mag niet eens bij het raam komen.', 'de Tweede Wereldoorlog: Jan moet zich verstoppen', ['een zomervakantie', 'een voetbaltoernooi'], 'Jan kan niet naar buiten, want niemand mag hem zien', ['Jan heeft geen zin om te voetballen', 'Jan is ziek']],
    ['Een sneeuwstorm sluit het dorp in de bergen af. Er kan geen auto meer in of uit. Dan wordt de buurvrouw van Mila ernstig ziek.', 'een sneeuwstorm in de bergen', ['een hete zomer', 'een drukke stad'], 'er kan geen ambulance komen, dus Mila moet zelf hulp zoeken', ['Mila gaat lekker sleeën', 'de buurvrouw gaat op vakantie']],
    ['Het is 1850. Lena is twaalf en werkt al vier jaar in een fabriek. Ze droomt ervan om te leren lezen.', 'de negentiende eeuw: veel kinderen moesten werken', ['de toekomst', 'een vakantie'], 'Lena kan niet naar school, omdat ze moet werken', ['Lena vindt lezen saai', 'Lena is te jong om te lezen']],
    ['Op een onbewoond eiland, zonder telefoon of internet, moeten vier vrienden zien te overleven.', 'een onbewoond eiland zonder contact met de wereld', ['een drukke camping', 'hun eigen huis'], 'ze kunnen niemand om hulp vragen en moeten alles zelf doen', ['ze gaan lekker zwemmen', 'ze bestellen eten']],
    ['In de woestijn is het overdag vijftig graden. Ahmed en zijn kameel moeten de oase bereiken voordat hun water op is.', 'een hete woestijn', ['een koud bos', 'een grote stad'], 'water is het belangrijkste, en de tijd dringt', ['Ahmed heeft het koud', 'de kameel wil spelen']],
    ['Het is het jaar 2190. Op aarde is bijna geen schoon water meer. Kira moet een plek vinden waar nog een bron is.', 'de toekomst: er is bijna geen schoon water', ['de middeleeuwen', 'een gewone zomer'], 'water is zeldzaam, dus Kira moet op een gevaarlijke zoektocht', ['Kira gaat naar de supermarkt', 'Kira wil gaan zwemmen']],
    ['Het is middernacht in een verlaten pretpark. De stroom is uitgevallen en de achtbaan staat stil. Tess en haar broer zijn de weg kwijt.', 'een donker, verlaten pretpark ’s nachts', ['een zonnige middag', 'een volle bioscoop'], 'het is eng, en ze zien bijna niets', ['ze kunnen lekker in de achtbaan', 'ze vervelen zich']],
    ['In de middeleeuwen mocht een boerenzoon niet met een adellijk meisje trouwen. Toch wordt Willem verliefd op de dochter van de graaf.', 'de middeleeuwen: arm en rijk mochten niet trouwen', ['deze tijd', 'de toekomst'], 'hun liefde is verboden, dus ze moeten het geheimhouden', ['ze trouwen meteen', 'de graaf vindt het prima']],
    ['Jasmijn woont in een klein dorp waar iedereen alles van elkaar weet. Ze heeft een groot geheim.', 'een klein dorp waar iedereen elkaar kent', ['een grote stad', 'een onbewoond eiland'], 'het is heel moeilijk om haar geheim te bewaren', ['niemand let op Jasmijn', 'Jasmijn verveelt zich']],
    ['Tijdens een hittegolf valt in de hele stad de stroom uit. De opa van Bas kan heel slecht tegen de hitte.', 'een hittegolf zonder stroom', ['een koude winter', 'een gewone lentedag'], 'Bas moet een koele plek voor zijn opa zoeken', ['Bas gaat ijs eten', 'opa gaat zonnebaden']],
    ['Zoë maakt met haar ouders een wereldreis met een zeilboot. Midden op de oceaan gaat de motor kapot.', 'midden op de oceaan', ['in een haven', 'op een camping'], 'er is geen hulp in de buurt, ze moeten het zelf oplossen', ['ze lopen naar een garage', 'ze gaan lekker zwemmen']],
    ['Het is de nacht van 31 januari 1953. In het Zeeuwse dorp van Kees breekt de dijk en stijgt het water.', 'de watersnoodramp van 1953', ['een droge zomer', 'een schoolreis'], 'Kees en zijn familie moeten vluchten voor het water', ['Kees gaat schaatsen', 'Kees gaat vissen']],
    ['Tijdens de coronatijd zit Femke maandenlang thuis. Ze ziet haar vrienden alleen op een scherm.', 'de coronatijd: iedereen moest thuisblijven', ['een zomervakantie', 'een schoolreis'], 'Femke voelt zich eenzaam, omdat ze niemand echt kan zien', ['Femke heeft het druk met feestjes', 'Femke gaat elke dag naar school']],
    ['In een kleine stad in 1960 is Tom de enige jongen die wil balletdansen. De andere jongens lachen hem uit.', 'een kleine stad in 1960', ['een dansschool in deze tijd', 'de toekomst'], 'in die tijd vonden veel mensen ballet niets voor jongens, dus Tom moet extra hard vechten voor zijn droom', ['iedereen moedigt Tom aan', 'Tom vindt dansen saai']]
  ];
  function maakInvloed(R, it){
    return OP('Hoe beïnvloedt dat het verhaal?', tekst(it[0]), [
      K(R, 'Waar of wanneer speelt dit, of in welke omstandigheid?', it[1], it[2], 'Zoek woorden over de tijd, de plek of de situatie: een jaartal, het weer, een gebeurtenis.'),
      K(R, 'Hoe beïnvloedt dat wat er gebeurt?', it[3], it[4], 'Wat kan het personage door ' + it[1] + ' niet, of juist wel? Kies wat er echt door verandert.')
    ]);
  }

  /* verteltechniek en effect */
  var TECH = {
    ik:['een ik-verteller', 'je kruipt in het hoofd van de hoofdpersoon en leeft mee'],
    flash:['een flashback', 'je begrijpt waarom het personage nu zo doet'],
    cliff:['stoppen op het spannendste moment', 'je wilt meteen verder lezen'],
    open:['een open einde', 'je gaat zelf nadenken over hoe het afloopt'],
    vooruit:['een vooruitwijzing', 'je voelt dat er iets gaat gebeuren en wordt ongerust'],
    wissel:['wisselend perspectief: steeds een ander personage', 'je ziet hetzelfde verhaal door de ogen van twee personages'],
    dag:['een dagboek', 'het voelt echt en persoonlijk, alsof je iemands geheimen leest']
  };
  var TECHHINT = {
    ik:'Wie vertelt? Staat er ik?', flash:'Springt het verhaal terug naar iets wat eerder gebeurde?', cliff:'Kijk naar het eind: hoor je wat er gebeurt?',
    open:'Weet je aan het eind hoe het afloopt?', vooruit:'Staat er iets over wat later gaat gebeuren?', wissel:'Wie vertelt er? Is dat steeds dezelfde?', dag:'Zie je een datum, of een begroeting aan een dagboek?'
  };
  var EFFECT = [
    ['Ik keek naar mijn cijfer: een drie. Mijn handen trilden. Hoe moest ik dit aan mijn vader vertellen?', 'ik'],
    ['Ik stond aan de rand van het veld en voelde iedereen naar me kijken. Mijn hart bonsde. Als ik deze strafschop miste, was het mijn schuld.', 'ik'],
    ['Mo durft niet het water in. Vijf jaar geleden ging hij bijna kopje onder in zee. Zijn vader trok hem er nog net op tijd uit.', 'flash'],
    ['Tess wil nooit meer naar de kermis. Toen ze zeven was, raakte ze daar haar moeder kwijt in de drukte. Ze heeft een uur huilend bij de botsauto’s gestaan.', 'flash'],
    ['Langzaam ging de deur open. Daar, in het donker, stond iemand die Sam heel goed kende. <i>Einde van hoofdstuk 4.</i>', 'cliff'],
    ['‘Ik moet je de waarheid vertellen over je vader,’ zei oma. Ze haalde diep adem. <i>Einde van hoofdstuk 9.</i>', 'cliff'],
    ['Lieke stond op het perron. De trein naar Parijs stond klaar, haar vader stond achter haar. Ze keek naar de trein, en toen naar haar vader. <i>Einde.</i>', 'open'],
    ['Bram hield de brief vast. Hij kon hem verscheuren of op de bus doen. Hij stak zijn hand uit naar de brievenbus. <i>Einde.</i>', 'open'],
    ['Die ochtend zwaaide Jesse zijn moeder vrolijk gedag. Hij wist nog niet dat het de laatste gewone dag van zijn leven zou zijn.', 'vooruit'],
    ['Fenna stopte het vreemde steentje in haar zak. Later zou ze wensen dat ze het nooit had opgeraapt.', 'vooruit'],
    ['<b>Noor:</b> Waarom praat Lisa niet meer met me? Wat heb ik gedaan?<br><b>Lisa:</b> Ik durf Noor niet te vertellen dat ik ga verhuizen. Ze wordt vast boos.', 'wissel'],
    ['<b>Hoofdstuk 1, Tim:</b> Die nieuwe jongen is vast een opschepper.<br><b>Hoofdstuk 2, Ilias:</b> Ik wil gewoon dat ze me aardig vinden. Daarom vertel ik zoveel over mijn oude school.', 'wissel'],
    ['<i>Lief dagboek, vandaag lachte Sem naar me in de gang. Niemand mag het weten, maar ik denk dat ik verliefd ben.</i>', 'dag'],
    ['<i>Dinsdag 4 maart. Weer ruzie thuis. Ik schrijf het hier op, want tegen niemand anders kan ik het zeggen.</i>', 'dag']
  ];
  function maakEffect(R, it){
    var k = it[1], ander = trek(R, Object.keys(TECH), [k], 2);
    return OP('Wat is het effect op jou als lezer?', tekst(it[0]), [
      K(R, 'Welke verteltechniek gebruikt de schrijver?', TECH[k][0], ander.map(function(x){ return TECH[x][0]; }), TECHHINT[k]),
      K(R, 'Wat is het effect op jou als lezer?', TECH[k][1], trek(R, Object.keys(TECH), [k], 2).map(function(x){ return TECH[x][1]; }), 'Wat doet ' + TECH[k][0] + ' met jou? Denk aan wat je voelt of wilt als je dit leest.')
    ]);
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'lit-verhaal', niveau:'2F', domein:'fictie', naam:'Het verhaal ontleden', kd:['nl9A.a', 'nl9A.b', 'nl9A.c', 'nl9A.d'],
        uit:'Hoe zit een verhaal in elkaar? Wat wil de hoofdpersoon, wat staat in de weg, waar gaat het eigenlijk over, en wie speelt welke rol? Hier leer je een verhaal uit elkaar te halen.' },
      doelen:[
        { id:'lit-verhaal-motor', naam:'De motor van het verhaal', kort:'De hoofdpersoon wil iets, maar iets staat in de weg: dat drijft het verhaal',
          uit:'<p>Elk verhaal heeft een <b>motor</b>: de hoofdpersoon <b>wil</b> iets, maar er staat iets <b>in de weg</b>. Daardoor komt het verhaal in beweging.</p><p><i>Noor wil het hondje houden, maar in hun flat mogen geen huisdieren.</i></p><p>Zoek eerst de wens (wil, droomt, spaart), dan de hindernis (maar, dan).</p>',
          wanneer:'je wilt uitleggen waar een verhaal om draait.',
          maak:function(R){ return maakMotor(R, R.kies(MOTOR)); } },
        { id:'lit-verhaal-thema', naam:'Het thema', kort:'Het onderwerp is de buitenkant; het thema is waar het eigenlijk over gaat',
          uit:'<p>Het <b>onderwerp</b> is waar een verhaal aan de buitenkant over gaat: <i>een voetbalteam</i>.</p><p>Het <b>thema</b> is waar het eigenlijk over gaat: een gevoel of een levensvraag die je overal in het verhaal terugziet. <i>Vriendschap, verlies, opgroeien, jaloezie, moed.</i></p><p>Vraag je af: wat leren of voelen de personages?</p>',
          wanneer:'een vraag zegt: wat is het thema van dit verhaal?',
          maak:function(R){ return maakThema(R, R.kies(THEMA)); } },
        { id:'lit-verhaal-motief', naam:'Een motief', kort:'Iets wat steeds terugkomt en voor iets groters staat',
          uit:'<p>Een <b>motief</b> is iets wat <b>steeds terugkomt</b> in een verhaal: een ding, een plek of een soort weer.</p><p>Een motief staat vaak <b>voor iets groters</b>. De sjaal van een overleden moeder staat voor de herinnering aan haar.</p><p>Let op wat er met het motief gebeurt aan het begin en aan het eind.</p>',
          wanneer:'je in een verhaal hetzelfde ding steeds weer tegenkomt.',
          maak:function(R){ return maakMotief(R, R.kies(MOTIEF)); } },
        { id:'lit-verhaal-rol', naam:'De rol van een personage', kort:'Hoofdpersoon, tegenspeler of helper: kijk wat het personage doet voor de hoofdpersoon',
          uit:'<p>Personages hebben een <b>rol</b> in het verhaal.</p><p>De <b>hoofdpersoon</b>: om hem of haar draait het, die wil iets. De <b>tegenspeler</b>: werkt de hoofdpersoon tegen. De <b>helper</b>: helpt de hoofdpersoon.</p><p>Vraag je bij elk personage af: wat doet hij of zij voor de hoofdpersoon?</p>',
          wanneer:'je de personages van een verhaal wilt beschrijven.',
          maak:function(R){ return maakRol(R, R.kies(ROL)); } },
        { id:'lit-verhaal-ontwikkeling', naam:'Hoe een personage verandert', kort:'Vergelijk het begin met het eind: van wat naar wat?',
          uit:'<p>In veel verhalen <b>verandert</b> de hoofdpersoon. Dat heet de <b>ontwikkeling</b> van het personage.</p><p>Vergelijk het <b>begin</b> met het <b>eind</b>. <i>Aan het begin is Sem verlegen, aan het eind houdt hij een presentatie.</i> Sem ontwikkelt zich van verlegen naar zelfverzekerd.</p>',
          wanneer:'een vraag zegt: hoe verandert de hoofdpersoon?',
          maak:function(R){ return maakOntw(R, R.kies(ONTW)); } },
        { id:'lit-verhaal-titel', naam:'De titel verklaren', kort:'Zoek waar de titel terugkomt en waarom hij past',
          uit:'<p>Een titel is niet zomaar gekozen. Hij verwijst vaak naar <b>de hoofdpersoon</b>, een <b>belangrijk voorwerp</b>, de <b>plaats</b> waar het speelt, of iets <b>figuurlijks</b>: het thema.</p><p><i>Tegen de stroom in</i> gaat niet over een rivier, maar over iemand die anders kiest dan de rest.</p>',
          wanneer:'een vraag zegt: verklaar de titel.',
          maak:function(R){ return maakTitel(R, R.kies(TITEL)); } },
        { id:'lit-verhaal-invloed', naam:'Tijd, plaats en omstandigheden', kort:'Wat kan een personage door de tijd, de plek of de situatie wel of niet?',
          uit:'<p>De <b>tijd</b>, de <b>plaats</b> en de <b>omstandigheden</b> bepalen wat er in een verhaal kan gebeuren.</p><p>In 1943 moet Jan zich verstoppen: hij kan niet naar buiten. In een sneeuwstorm kan er geen ambulance komen.</p><p>Vraag je af: wat kan het personage hierdoor <b>niet</b>, of juist <b>wel</b>?</p>',
          wanneer:'een vraag zegt: welke invloed heeft de tijd of de plaats op het verhaal?',
          maak:function(R){ return maakInvloed(R, R.kies(INVLOED)); } },
        { id:'lit-verhaal-effect', naam:'Het effect van een verteltechniek', kort:'Herken de techniek en zeg wat die met jou als lezer doet',
          uit:'<p>Een schrijver kiest een <b>verteltechniek</b> om een <b>effect</b> te bereiken.</p><p>Een <b>ik-verteller</b>: je leeft mee. Een <b>flashback</b>: je snapt waarom iemand zo doet. <b>Stoppen op het spannendste moment</b>: je wilt verder. Een <b>open einde</b>: je gaat zelf nadenken. Een <b>vooruitwijzing</b>: je wordt ongerust. <b>Wisselend perspectief</b>: je ziet twee kanten. Een <b>dagboek</b>: het voelt echt en persoonlijk.</p>',
          wanneer:'een vraag zegt: wat is het effect van deze manier van vertellen?',
          maak:function(R){ return maakEffect(R, R.kies(EFFECT)); } }
      ] }
  ]);

  /* ================= GENRES ================= */

  var VORM = { poezie:'korte regels, vaak met rijm of ritme', proza:'gewone zinnen achter elkaar, met een verteller', drama:'namen met wat ze zeggen, en aanwijzingen tussen haakjes' };
  var VORMNAAM = { poezie:'poëzie', proza:'proza', drama:'drama' };
  var VORMEN = [
    ['De wind waait door de straat,<br>de bladeren dansen mee.<br>Het is al herfst, het is al laat,<br>de zon zakt in de zee.', 'poezie'],
    ['Stil<br>is de nacht,<br>alleen de maan<br>die op mij wacht.', 'poezie'],
    ['Mijn fiets, mijn trouwe vriend,<br>jij brengt mij elke dag<br>door regen en door wind<br>naar school, met een lach.', 'poezie'],
    ['Op het plein<br>een bal, een kreet,<br>een meisje dat<br>haar naam vergeet.', 'poezie'],
    ['Ik schrijf jouw naam<br>in het zand bij de zee.<br>De golven komen<br>en nemen hem mee.', 'poezie'],
    ['Maandag: regen.<br>Dinsdag: wind.<br>Woensdag: zon,<br>dan ben ik weer een kind.', 'poezie'],
    ['Sanne fietste zo hard als ze kon. Ze was al tien minuten te laat, en het eerste uur had ze een toets. Bij het stoplicht keek ze op haar telefoon: nog vijf minuten.', 'proza'],
    ['Het huis aan het eind van de straat stond al jaren leeg. De kinderen uit de buurt fietsten er altijd met een boog omheen. Tot er op een avond licht brandde op zolder.', 'proza'],
    ['Opa vertelde graag over vroeger. Hoe hij als jongen op de boerderij hielp, en hoe hij elke ochtend om vijf uur de koeien molk.', 'proza'],
    ['Toen Ravi de brief opende, viel er een foto uit. Hij herkende het gezicht meteen. Het was zijn vader, maar dan veertig jaar jonger.', 'proza'],
    ['De bus was vol. Mila stond tussen een man met een grote koffer en een vrouw met een huilende baby. Ze zette haar muziek harder.', 'proza'],
    ['Het was de eerste dag van de zomervakantie. Daan werd wakker van de zon die door de gordijnen scheen, en hij wist meteen: vandaag ga ik naar zee.', 'proza'],
    ['<b>MOEDER:</b> Waar was je zo laat nog?<br><b>TIM</b> (kijkt naar de grond): Bij Mo. We waren aan het gamen.<br><b>MOEDER:</b> Tot twaalf uur?', 'drama'],
    ['<i>(Een klaslokaal. LISA zit alleen. NOOR komt binnen.)</i><br><b>NOOR:</b> Mag ik hier zitten?<br><b>LISA:</b> Als je wilt.', 'drama'],
    ['<b>KONING:</b> Wie heeft mijn kroon gestolen?<br><b>NAR</b> (lacht): Misschien heeft u hem zelf op, majesteit.<br><i>(De koning voelt aan zijn hoofd.)</i>', 'drama'],
    ['<b>SEM:</b> Ik ga niet mee.<br><b>VADER:</b> Je hebt geen keus.<br><i>(SEM loopt boos naar de deur en slaat hem dicht.)</i>', 'drama'],
    ['<i>(Een bushalte. Het regent.)</i><br><b>JADE:</b> Komt die bus nog?<br><b>OUDE MAN:</b> Ik wacht hier al veertig jaar, elke dag.', 'drama'],
    ['<b>DOKTER:</b> Hoe voel je je vandaag?<br><b>FENNA</b> (zachtjes): Beter. Mag ik naar huis?<br><b>DOKTER</b> (glimlacht): Nog één nachtje.', 'drama']
  ];
  function maakVorm(R, it){
    var k = it[1];
    return OP('Is dit poëzie, proza of drama?', tekst(it[0]), [
      K(R, 'Wat zie je aan de vorm?', VORM[k], Object.keys(VORM).filter(function(x){ return x !== k; }).map(function(x){ return VORM[x]; }), 'Kijk eerst alleen naar hoe de tekst eruitziet: korte regels, gewone zinnen, of namen met een dubbele punt?'),
      K(R, 'Is dit poëzie, proza of drama?', VORMNAAM[k], ['poëzie', 'proza', 'drama'], 'Korte regels: poëzie. Gewone zinnen met een verteller: proza. Namen met tekst om te spelen: drama.')
    ]);
  }

  var GENRE = {
    detective:['een detective', 'een misdaad, en iemand die uitzoekt wie het gedaan heeft'],
    fantasy:['een fantasyverhaal', 'magie, of wezens die niet echt bestaan'],
    sf:['sciencefiction', 'de toekomst, met techniek die nu nog niet bestaat'],
    hist:['een historische roman', 'een echte tijd uit het verleden'],
    griezel:['een griezelverhaal', 'iets engs en onverklaarbaars dat je bang maakt']
  };
  var GENRES = [
    ['Inspecteur Vos bekeek de kapotte ruit. De glasscherven lagen buiten, niet binnen. ‘De dief kwam niet van buiten,’ zei ze. ‘Hij was al binnen.’', 'detective'],
    ['Iemand had de prijzenkast van de school leeggehaald. Sanne en Bas vonden een spoor van modder dat naar het kantoor van de conciërge liep.', 'detective'],
    ['Naast de lege kluis lag een briefje met één letter: K. Rechercheur Dekker had drie verdachten, en twee van hen hadden een naam met een K.', 'detective'],
    ['De diamant was verdwenen uit het museum, terwijl het alarm de hele nacht aan stond. Speurder Lily schreef op wie er allemaal een sleutel had.', 'detective'],
    ['Elin hief haar staf en fluisterde een spreuk. De draak boog zijn kop en liet haar op zijn rug klimmen.', 'fantasy'],
    ['In het woud van Ardenmoor woonden elfen die zo oud waren als de bomen zelf. Alleen wie een zuiver hart had, kon hun stad vinden.', 'fantasy'],
    ['De pratende vos keek Tom aan. ‘Jij bent de uitverkorene,’ zei hij. ‘Alleen jij kunt de toverspiegel weer heel maken.’', 'fantasy'],
    ['Toen Mira de oude ring omdeed, werd ze onzichtbaar. Achter haar hoorde ze een trol grommen.', 'fantasy'],
    ['In het jaar 2240 woonde Kai met zijn ouders op een ruimtestation rond Mars. Zijn robot Zeta maakte elke ochtend zijn ontbijt.', 'sf'],
    ['De tijdmachine zoemde. Nog drie seconden, en Ilse zou in het jaar 3000 staan.', 'sf'],
    ['Iedereen in de stad had een chip in zijn hoofd waarmee je gedachten kon versturen. Alleen Noor had er geen, en dat was verboden.', 'sf'],
    ['Het ruimteschip naderde de onbekende planeet. Op het scherm verscheen een signaal dat niet van mensen kwam.', 'sf'],
    ['Amsterdam, 1665. Pieter werkte als loopjongen bij een koopman aan de gracht. In de haven lagen de schepen van de VOC, vol peper en nootmuskaat.', 'hist'],
    ['Het was de winter van 1944. Er was bijna geen eten meer in de stad, en Hanna liep met haar moeder naar de boeren om eten te ruilen.', 'hist'],
    ['Pompeji, in het jaar 79. Marcus keek naar de Vesuvius, waar een dikke rookwolk uit opsteeg.', 'hist'],
    ['Leiden, 1574. De stad werd al maanden belegerd door de Spanjaarden. De mensen aten gras en brood van zemelen.', 'hist'],
    ['Elke nacht om drie uur hoorde Lotte gekras op zolder. Maar op zolder was niets, alleen een oude pop die steeds op een andere plek zat.', 'griezel'],
    ['In de spiegel zag Daan een gezicht achter zich. Toen hij zich omdraaide, was er niemand.', 'griezel'],
    ['Het kerkhof was mistig. Tussen de graven bewoog iets, langzaam en schuifelend, recht op Mo af.', 'griezel'],
    ['De babyfoon kraakte. Een onbekende stem fluisterde de naam van Ellen, terwijl haar broertje diep lag te slapen.', 'griezel']
  ];
  function maakGenre(R, it){
    var k = it[1], rest = Object.keys(GENRE).filter(function(x){ return x !== k; });
    return OP('Welk genre is dit?', tekst(it[0]), [
      K(R, 'Welk kenmerk zie je in dit fragment?', GENRE[k][1], trek(R, rest, [], 2).map(function(x){ return GENRE[x][1]; }), 'Waar draait het om? Een misdaad, magie, de toekomst, een echte tijd van vroeger, of iets engs?'),
      K(R, 'Welk genre is dit?', GENRE[k][0], trek(R, rest, [], 2).map(function(x){ return GENRE[x][0]; }), 'Welk genre draait om ' + GENRE[k][1] + '?')
    ]);
  }

  /* effect van een genrekenmerk: [fragment, wat de schrijver doet, [fout], effect, [fout]] */
  var GEFFECT = [
    ['Mijn broertje at zoveel spaghetti dat hij de rest van de week sliep. Toen hij wakker werd, vroeg hij of er nog toetje was.', 'hij overdrijft op een grappige manier', ['hij beschrijft een eng geluid', 'hij verstopt een aanwijzing'], 'je moet lachen', ['je wordt bang', 'je gaat puzzelen wie de dader is']],
    ['‘Wat is je lievelingsdier?’ vroeg de juf. ‘Een vlieg,’ zei Bram. ‘Want die is altijd op de hoogte.’', 'hij maakt een woordgrap', ['hij beschrijft hoe het vroeger was', 'hij laat de toekomst zien'], 'je moet lachen', ['je voelt hoe oneerlijk iets was', 'je wordt ongerust']],
    ['Oom Kees was de slechtste kok van de familie. Zelfs de hond liep weg als hij de pannen pakte.', 'hij overdrijft op een grappige manier', ['hij geeft een aanwijzing', 'hij beschrijft een andere wereld'], 'je moet lachen', ['je wordt bang', 'je gaat nadenken over de toekomst']],
    ['De deur kraakte. Iets schuifelde over de vloer. Lisa hield haar adem in.', 'hij beschrijft enge geluiden', ['hij maakt een grapje', 'hij beschrijft hoe het vroeger was'], 'je voelt spanning en wordt een beetje bang', ['je moet lachen', 'je leert iets over vroeger']],
    ['In het oude ziekenhuis brandde nog één lamp. Op de gang stond een rolstoel die langzaam vanzelf begon te rijden.', 'er gebeurt iets engs wat eigenlijk niet kan', ['hij maakt een woordgrap', 'hij geeft een feit uit de geschiedenis'], 'je wordt bang', ['je moet lachen', 'je droomt weg in een mooie wereld']],
    ['Op de vloer lag een rood haar. Niemand in het huis had rood haar, behalve de tuinman. Maar die zei dat hij de hele avond thuis was geweest.', 'hij geeft je een aanwijzing', ['hij overdrijft op een grappige manier', 'hij beschrijft een andere wereld'], 'je gaat zelf puzzelen wie de dader is', ['je moet lachen', 'je droomt weg in een andere wereld']],
    ['De inspecteur zag dat de klok in de kamer tien minuten achterliep. Hij glimlachte, maar zei nog niets.', 'hij verstopt een aanwijzing die je nog niet snapt', ['hij beschrijft enge geluiden', 'hij maakt een woordgrap'], 'je gaat zelf puzzelen wat de aanwijzing betekent', ['je wordt bang', 'je leert hoe het vroeger was']],
    ['Rond 1900 werkten kinderen van tien al in de fabriek. Jan stond twaalf uur per dag aan een lawaaiige machine, en ’s avonds viel hij doodmoe in bed.', 'hij beschrijft hoe het leven vroeger was', ['hij overdrijft op een grappige manier', 'hij laat de toekomst zien'], 'je leert hoe het vroeger was en vergelijkt het met nu', ['je moet lachen', 'je gaat puzzelen wie de dader is']],
    ['Hanna trok haar jas met de gele ster dicht. Ze mocht niet meer met de tram, niet meer naar het park en niet meer naar haar oude school.', 'hij beschrijft hoe het leven vroeger was', ['hij maakt een woordgrap', 'hij beschrijft een andere wereld'], 'je voelt hoe oneerlijk het in die tijd was', ['je moet lachen', 'je droomt weg in een andere wereld']],
    ['In de stad van de toekomst bepaalde een computer welk beroep je kreeg. Niemand mocht zelf kiezen, ook Zara niet.', 'hij laat een toekomst zien waarin iets mis is', ['hij beschrijft enge geluiden', 'hij maakt een woordgrap'], 'je gaat nadenken over hoe het later kan worden', ['je moet lachen', 'je leert hoe het vroeger was']],
    ['Alle mensen droegen een bril die de wereld mooier maakte. Toen Kai zijn bril afzette, zag hij grijze, kapotte straten.', 'hij laat een toekomst zien waarin iets mis is', ['hij geeft een aanwijzing', 'hij beschrijft hoe het vroeger was'], 'je gaat nadenken over hoe het later kan worden', ['je moet lachen', 'je gaat puzzelen wie de dader is']],
    ['Achter de kast van haar oma vond Iris een deur naar een land waar het altijd herfst was en de bomen konden praten.', 'hij neemt je mee naar een wereld die niet bestaat', ['hij beschrijft hoe het vroeger was', 'hij geeft een aanwijzing'], 'je droomt weg in een andere wereld', ['je leert hoe het vroeger was', 'je gaat puzzelen wie de dader is']],
    ['De jonge heks Luna kende nog maar één spreuk, en die ging altijd mis: in plaats van licht kwamen er kikkers uit haar toverstaf.', 'hij laat magie op een grappige manier mislukken', ['hij beschrijft enge geluiden', 'hij beschrijft hoe het vroeger was'], 'je moet lachen', ['je wordt bang', 'je voelt hoe oneerlijk het was']],
    ['Elke ochtend stond hij bij de bushalte. Elke ochtend durfde Emma niets te zeggen. Vandaag zou ze het doen.', 'hij laat je wachten op een moment waar je naar uitkijkt', ['hij maakt een woordgrap', 'hij laat de toekomst zien'], 'je leeft mee en hoopt dat het goed afloopt', ['je moet lachen', 'je gaat nadenken over de toekomst']]
  ];
  function maakGEffect(R, it){
    return OP('Wat doet dit met jou als lezer?', tekst(it[0]), [
      K(R, 'Wat doet de schrijver hier?', it[1], it[2], 'Lees goed. Is het grappig, eng, een aanwijzing, iets van vroeger, de toekomst of een verzonnen wereld?'),
      K(R, 'Wat doet dit met jou als lezer?', it[3], it[4], 'De schrijver doet dit: ' + it[1] + '. Wat voel of doe jij dan als lezer?')
    ]);
  }

  /* beeld en vormgeving: [tekst, wat je ziet, wat het vertelt, [fout], functie, [foute functies]] */
  var FUNC = { gevoel:'het laat zien hoe iemand zich voelt', sfeer:'het zet de sfeer', grap:'het maakt het grappig', nadruk:'het geeft extra nadruk',
    uiterlijk:'het laat zien hoe iets eruitziet', meer:'het vertelt iets wat de tekst niet zegt', vorm:'de vorm past bij waar de tekst over gaat' };
  var BEELD = [
    ['Tim kwam binnen met zijn rapport.', 'een tekening van Tim met een grote glimlach en een rapport vol hoge cijfers', 'dat Tim blij is met zijn rapport', ['dat Tim boos is', 'dat Tim een nieuwe tas heeft'], 'gevoel', ['grap', 'nadruk']],
    ['De deur van het oude huis ging open.', 'een donkere tekening met spinnenwebben, een kapotte lamp en twee gele ogen in de hoek', 'dat er iets engs in het huis is', ['dat het huis gezellig is', 'dat er een feest is'], 'sfeer', ['grap', 'uiterlijk']],
    ['De hond van oma was een beetje dik.', 'een tekening van een hond die zo rond is als een bal en niet door het hondenluik past', 'hoe dik de hond echt is', ['dat de hond ziek is', 'dat oma een kat heeft'], 'grap', ['sfeer', 'gevoel']],
    ['En toen viel de toren om. <b style="font-size:1.7em;letter-spacing:.05em">BOEM!</b>', 'het woord BOEM staat in heel grote letters', 'hoe hard de klap was', ['dat het stil was', 'dat de toren nieuw was'], 'nadruk', ['gevoel', 'sfeer']],
    ['Ze zag het kasteel van de koning.', 'een grote tekening van een kasteel met zeven torens, een gracht en wapperende vlaggen', 'hoe het kasteel eruitziet', ['dat de koning boos is', 'dat het kasteel klein is'], 'uiterlijk', ['grap', 'nadruk']],
    ['Mo zei dat hij niet bang was.', 'een tekening van Mo met trillende knieën en zweetdruppels op zijn voorhoofd', 'dat Mo eigenlijk wel bang is', ['dat Mo heel dapper is', 'dat Mo het warm heeft van de zon'], 'meer', ['uiterlijk', 'nadruk']],
    ['Een gedicht over regen.', 'de woorden van het gedicht staan van boven naar beneden, als vallende druppels', 'dat het gedicht er zelf uitziet als regen', ['dat de dichter niet kon schrijven', 'dat het gedicht over de zon gaat'], 'vorm', ['grap', 'gevoel']],
    ['Fien zegt: ‘Ik vind het prima.’', 'een tekstballon, met een klein donderwolkje boven het hoofd van Fien', 'dat Fien het helemaal niet prima vindt', ['dat Fien heel blij is', 'dat het gaat regenen'], 'meer', ['uiterlijk', 'sfeer']],
    ['Ik moest me stil houden. <span style="font-size:.8em">Heel stil.</span> <span style="font-size:.6em">Nog stiller.</span>', 'de woorden worden steeds kleiner gedrukt', 'dat het steeds stiller wordt', ['dat de schrijver ruimte tekort had', 'dat het steeds harder wordt'], 'vorm', ['grap', 'uiterlijk']],
    ['Sanne liep het bos in.', 'eerst zijn de tekeningen fel en vrolijk; hoe dieper ze het bos in loopt, hoe grijzer en donkerder ze worden', 'dat het steeds enger wordt', ['dat het lente wordt', 'dat Sanne een kleurplaat maakt'], 'sfeer', ['grap', 'nadruk']],
    ['De leeuw brulde.', 'een tekening van een brullende leeuw met een piepklein muisje op zijn neus dat terugbrult', 'een muisje dat terugbrult', ['dat de leeuw ziek is', 'dat de leeuw slaapt'], 'grap', ['sfeer', 'uiterlijk']],
    ['‘IK WIL HET NIET!’ riep Noor.', 'de woorden van Noor staan in hoofdletters', 'dat Noor heel hard schreeuwt', ['dat Noor fluistert', 'dat Noor een naam noemt'], 'nadruk', ['uiterlijk', 'sfeer']],
    ['Opa vertelde over zijn jeugd.', 'een oude zwart-witfoto van een jongen op een boerderij', 'hoe de jeugd van opa eruitzag', ['dat opa nu op een boerderij woont', 'dat opa van zwart-wit houdt'], 'uiterlijk', ['grap', 'nadruk']],
    ['Lotte zat alleen op het schoolplein.', 'een tekening van een enorm, leeg schoolplein met heel klein Lotte in een hoekje', 'hoe alleen en klein Lotte zich voelt', ['dat het schoolplein nieuw is', 'dat het vakantie is'], 'gevoel', ['grap', 'nadruk']]
  ];
  function maakBeeld(R, it){
    return OP('Wat voegt het beeld toe aan de tekst?', tekst([it[0], '<i>Bij de tekst:</i> ' + it[1] + '.']), [
      K(R, 'Wat vertelt het beeld of de vormgeving je?', it[2], it[3], 'Kijk naar wat er bij de tekst staat: ' + it[1] + '. Wat weet je daardoor?'),
      K(R, 'Wat voegt het beeld toe aan de tekst?', FUNC[it[4]], it[5].map(function(x){ return FUNC[x]; }), 'Het beeld vertelt je ' + it[2] + '. Wat doet dat met de tekst?')
    ]);
  }

  /* alliteratie: [zin, beginklank] */
  var ALLIT = [
    ['Wilde wind waait over het water.', 'w'], ['Koude kikkers kwaken in de kreek.', 'k'], ['Mijn moeder maakt elke maandag muffins.', 'm'],
    ['Bram bakt bruine broodjes bij de bakker.', 'b'], ['Zes zieke zebra’s zitten in de zon.', 'z'], ['Pim pakt een paarse paraplu.', 'p'],
    ['Lieve Lotte lacht heel luid.', 'l'], ['Stille sterren staan aan de hemel.', 's'], ['Fien fietst fluitend naar Frankrijk.', 'f'],
    ['Tien tamme tijgers eten taart.', 't'], ['Ronde rode rozen ruiken heerlijk.', 'r'], ['Grote grijze golven gooien het bootje omhoog.', 'g'],
    ['Negen natte neuzen in een nest.', 'n'], ['Vrolijk vliegt de vlinder voorbij.', 'v'], ['Hoge huizen hebben heel smalle ramen.', 'h']
  ];
  var LETTERS = ['b', 'd', 'f', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'z'];
  /* twee foute beginklanken: eerst die van de andere woorden in de zin */
  function andereKlank(R, k, nee){
    var uit = [];
    nee.forEach(function(w){ var c = w.toLowerCase().charAt(0); if (c !== k && LETTERS.indexOf(c) >= 0 && uit.indexOf(c) < 0) uit.push(c); });
    uit = R.hussel(uit).slice(0, 1);
    return uit.concat(trek(R, LETTERS, [k].concat(uit), 2)).slice(0, 2);
  }
  function maakAllit(R, it){
    var w = it[0].replace(/[.,!?]/g, '').split(' '), k = it[1];
    var ja = w.filter(function(x){ return x.toLowerCase().charAt(0) === k; }), nee = w.filter(function(x){ return x.toLowerCase().charAt(0) !== k; });
    var goed = ja.join(', '), f1 = ja.slice(0, -1).concat([R.kies(nee)]).join(', '), f2 = nee.concat([ja[0]]).join(', ');
    return OP('Welke woorden alliteren?', tekst('<i>' + it[0] + '</i>'), [
      K(R, 'Met welke klank beginnen veel woorden?', k, andereKlank(R, k, nee), 'Zeg de zin hardop en let op het begin van elk woord. Welke klank hoor je steeds?'),
      K(R, 'Welke woorden alliteren?', goed, [f1, f2], 'Kies alle woorden die beginnen met de ' + k + ', en geen andere.')
    ]);
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'lit-genre', niveau:'1F', domein:'fictie', naam:'Genres', kd:['nl9B.a', 'nl9B.b', 'nl9B.c', 'nl9B.d'],
        uit:'Gedicht, verhaal of toneelstuk? Detective of fantasy? Elk genre heeft zijn eigen kenmerken, en die doen iets met jou als lezer. Ook plaatjes, letters en klanken horen erbij.' },
      doelen:[
        { id:'lit-genre-vorm', naam:'Poëzie, proza of drama', kort:'Herken aan de vorm: korte regels, gewone zinnen of tekst om te spelen',
          uit:'<p>Je herkent de drie hoofdgenres aan de <b>vorm</b>.</p><p><b>Poëzie</b>: korte regels, vaak met rijm of ritme. <b>Proza</b>: gewone zinnen achter elkaar, met een verteller. <b>Drama</b>: tekst om te spelen, met de namen van wie er praat en aanwijzingen tussen haakjes.</p>',
          wanneer:'je een tekst krijgt en wilt weten wat voor soort tekst het is.',
          maak:function(R){ return maakVorm(R, R.kies(VORMEN)); } },
        { id:'lit-genre-soort', naam:'Verhaalgenres', kort:'Misdaad, magie, toekomst, vroeger of iets engs: elk genre heeft een kenmerk',
          uit:'<p>Verhalen horen bij een <b>genre</b>. Je herkent het aan een <b>kenmerk</b>.</p><p><b>Detective</b>: een misdaad en iemand die zoekt wie het deed. <b>Fantasy</b>: magie en wezens die niet bestaan. <b>Sciencefiction</b>: de toekomst, met nieuwe techniek. <b>Historische roman</b>: een echte tijd van vroeger. <b>Griezelverhaal</b>: iets engs wat je bang maakt.</p>',
          wanneer:'je een boek zoekt of een fragment moet indelen.',
          maak:function(R){ return maakGenre(R, R.kies(GENRES)); } },
        { id:'lit-genre-effect', naam:'Het effect van een genre', kort:'Wat de schrijver doet, doet iets met jou: lachen, schrikken, puzzelen of nadenken',
          uit:'<p>Elk genre wil iets met de lezer doen. Dat is het <b>effect</b>.</p><p>Een grappige overdrijving laat je <b>lachen</b>. Enge geluiden maken je <b>bang</b>. Een aanwijzing laat je <b>puzzelen</b>. Een verhaal over vroeger laat je <b>leren hoe het was</b>. Een toekomstverhaal laat je <b>nadenken</b> over later.</p>',
          wanneer:'een vraag zegt: wat is het effect op de lezer?',
          maak:function(R){ return maakGEffect(R, R.kies(GEFFECT)); } },
        { id:'lit-genre-beeld', naam:'Illustraties en vormgeving', kort:'Een plaatje of de letters vertellen vaak meer dan de tekst',
          uit:'<p>In veel boeken, strips en gedichten doet het <b>beeld</b> mee: een illustratie, de kleur, of hoe de letters eruitzien.</p><p>Een beeld kan laten zien <b>hoe iemand zich voelt</b>, de <b>sfeer</b> zetten, het <b>grappig</b> maken, <b>nadruk</b> geven of iets vertellen wat de tekst <b>niet</b> zegt. <i>Mo zegt dat hij niet bang is,</i> maar op het plaatje trillen zijn knieën.</p>',
          wanneer:'je een prentenboek, strip of gedicht met beeld bekijkt.',
          maak:function(R){ return maakBeeld(R, R.kies(BEELD)); } },
        { id:'lit-genre-allit', naam:'Alliteratie', kort:'Woorden die met dezelfde klank beginnen, vlak na elkaar',
          uit:'<p>Bij <b>alliteratie</b> beginnen woorden die dicht bij elkaar staan met <b>dezelfde klank</b>. Het heet ook <b>beginrijm</b>.</p><p><i><b>K</b>oude <b>k</b>ikkers <b>k</b>waken.</i> Je hoort het meteen als je de zin hardop zegt.</p><p>Je ziet alliteratie in gedichten, in reclame en in uitdrukkingen als <i>met man en macht</i>.</p>',
          wanneer:'je een gedicht, slogan of uitdrukking leest die lekker klinkt.',
          maak:function(R){ return maakAllit(R, R.kies(ALLIT)); } }
      ] }
  ]);

  /* ================= LITERATUUR DOOR DE TIJD ================= */

  var MIDDEL = [
    { t:['In <i>Van den vos Reynaerde</i> klagen de dieren bij koning Nobel, de leeuw, over de vos Reynaert. Reynaert heeft iedereen bedrogen, maar met slimme leugens praat hij zich er steeds uit.'],
      s:[['Wie zijn de personages in dit verhaal?', 'dieren die zich gedragen als mensen', ['ridders en jonkvrouwen', 'boeren uit een dorp'], 'Koning Nobel is een leeuw, Reynaert is een vos. Wat zijn het dus?'],
         ['Wat voor verhaal is het dus?', 'een dierenverhaal dat laat zien hoe mensen zijn', ['een sprookje voor kleine kinderen', 'een ridderverhaal over een veldslag'], 'De dieren praten en bedriegen elkaar, net als mensen.']] },
    { t:['<i>Van den vos Reynaerde</i> is geschreven in de dertiende eeuw. De schrijver noemt zichzelf alleen Willem. Over zijn leven weten we bijna niets.'],
      s:[['Wanneer is het verhaal geschreven?', 'in de dertiende eeuw: de middeleeuwen', ['in de Gouden Eeuw', 'in de negentiende eeuw'], 'De dertiende eeuw is de tijd van 1200 tot 1300.'],
         ['Wat zegt het dat we bijna niets over de schrijver weten?', 'in de middeleeuwen was het verhaal belangrijker dan de schrijver', ['Willem wilde heel beroemd worden', 'het boek is pas kort geleden geschreven'], 'Van veel middeleeuwse verhalen kennen we de schrijver niet eens.']] },
    { t:['In <i>Karel ende Elegast</i> krijgt koning Karel de Grote ’s nachts van een engel de opdracht om uit stelen te gaan. Onderweg ontmoet hij Elegast, een ridder die hij zelf uit zijn land had verbannen.'],
      s:[['Welke personages komen hierin voor?', 'een koning, een engel en een ridder', ['pratende dieren', 'een detective en een dief'], 'Lees wie Karel, de engel en Elegast zijn.'],
         ['Wat voor verhaal is Karel ende Elegast?', 'een ridderverhaal', ['een dierenverhaal', 'een toneelstuk uit de Gouden Eeuw'], 'Er komen een koning en een ridder in voor, en het speelt in de middeleeuwen.']] },
    { t:['Karel en Elegast breken samen in bij het kasteel van Eggeric, de zwager van de koning. Daar hoort Elegast dat Eggeric van plan is de koning te vermoorden.'],
      s:[['Wat ontdekken Karel en Elegast?', 'dat Eggeric de koning wil vermoorden', ['dat Elegast een verrader is', 'dat de engel loog'], 'Lees wat Elegast hoort in het kasteel.'],
         ['Wat leert de koning in dit verhaal?', 'de ridder die hij verbande is trouw, en zijn eigen zwager is een verrader', ['stelen mag altijd', 'hij kan beter thuisblijven'], 'Wie helpt de koning, en wie wil hem kwaad doen?']] },
    { t:['In de middeleeuwen konden de meeste mensen niet lezen. Verhalen werden voorgedragen of voorgelezen, bijvoorbeeld aan het hof van een edelman.'],
      s:[['Hoe leerden de meeste mensen verhalen kennen?', 'door te luisteren naar iemand die het vertelde of voorlas', ['door zelf boeken te kopen', 'door naar de schouwburg te gaan'], 'De meeste mensen konden niet lezen. Hoe hoorden ze dan een verhaal?'],
         ['Waarom stonden veel van die verhalen op rijm?', 'met rijm kun je een verhaal makkelijker onthouden en voordragen', ['rijm was toen verplicht', 'de schrijvers wilden het moeilijk maken'], 'Denk aan een liedje: waarom onthoud je dat zo makkelijk?']] },
    { t:['Een middeleeuws boek werd met de hand geschreven, vaak door monniken in een klooster. Over één boek deed je soms maanden.'],
      s:[['Hoe werd een boek gemaakt?', 'met de hand overgeschreven', ['gedrukt met een drukpers', 'getypt op een machine'], 'Lees de eerste zin nog eens.'],
         ['Wat betekent dat voor boeken in die tijd?', 'boeken waren zeldzaam en heel duur', ['iedereen had veel boeken thuis', 'boeken waren gratis'], 'Als je maanden over één boek doet, hoeveel boeken zijn er dan?']] },
    { t:['In <i>Beatrijs</i> verlaat een non het klooster voor de man van wie ze houdt. Na vele jaren keert ze terug. Maria heeft al die tijd haar plaats ingenomen, zodat niemand haar heeft gemist.'],
      s:[['Welke rol speelt het geloof in dit verhaal?', 'Maria doet een wonder en helpt Beatrijs', ['het geloof speelt geen rol', 'Beatrijs wordt gestraft door de koning'], 'Wie neemt de plaats van Beatrijs in?'],
         ['Wat zegt dat over de middeleeuwen?', 'het christelijk geloof was heel belangrijk in het leven van mensen', ['mensen geloofden toen niet in God', 'kloosters bestonden nog niet'], 'Het verhaal speelt in een klooster en Maria doet een wonder.']] },
    { t:['Een ridder in een middeleeuws verhaal moest dapper zijn, trouw aan zijn heer, en zwakkeren beschermen.'],
      s:[['Wat waren belangrijke waarden voor een ridder?', 'moed en trouw', ['rijkdom en luxe', 'slimheid en bedrog'], 'Lees wat een ridder moest zijn.'],
         ['Welk personage gedraagt zich als een echte ridder?', 'Elegast, die de koning redt, al was hij door hem verbannen', ['Reynaert, die iedereen bedriegt', 'Eggeric, die de koning wil vermoorden'], 'Wie is trouw aan de koning, ook al heeft de koning hem slecht behandeld?']] },
    { t:['In <i>Van den vos Reynaerde</i> lokt Reynaert Bruun de beer naar een gespleten boomstam. Hij belooft hem honing. De kop van Bruun raakt vast, en de boeren slaan hem bont en blauw.'],
      s:[['Hoe krijgt Reynaert Bruun te pakken?', 'hij belooft hem honing', ['hij vecht met hem', 'hij vraagt de koning om hulp'], 'Wat wil een beer graag hebben?'],
         ['Wat voor personage is Reynaert?', 'sluw en gemeen', ['trouw en dapper', 'dom en goedhartig'], 'Reynaert lokt Bruun met een list in de val.']] },
    { t:['Aan het eind van <i>Van den vos Reynaerde</i> zou Reynaert worden opgehangen. Maar hij vertelt de koning over een verborgen schat. De koning gelooft hem en laat hem gaan.'],
      s:[['Hoe ontsnapt Reynaert aan zijn straf?', 'hij liegt over een schat', ['hij vlucht uit de gevangenis', 'hij vraagt eerlijk om vergeving'], 'Wat vertelt Reynaert aan de koning?'],
         ['Wat laat het verhaal zien over de koning?', 'zelfs de koning laat zich door hebzucht bedriegen', ['de koning is altijd eerlijk en wijs', 'dieren kunnen niet praten'], 'Waarom gelooft de koning het verhaal over de schat?']] },
    { t:['Middeleeuwse verhalen zijn geschreven in het Middelnederlands. Een paar woorden: <i>ic</i> (ik), <i>hi</i> (hij), <i>ende</i> (en), <i>coninc</i> (koning).'],
      s:[['Wat valt op aan deze woorden?', 'ze lijken op ons Nederlands, maar zijn anders gespeld', ['het is Engels', 'we schrijven ze nu precies zo'], 'Vergelijk ic met ik en coninc met koning.'],
         ['Wat betekent: die coninc ende die vos?', 'de koning en de vos', ['de konijnen en de vos', 'die koning eet de vos'], 'Die betekent hier de, ende betekent en.']] },
    { t:['In <i>Mariken van Nieumeghen</i> gaat een meisje zeven jaar met de duivel mee. Hij heet Moenen. Pas als ze een toneelstuk ziet over God en de duivel, krijgt ze spijt.'],
      s:[['Waarom krijgt Mariken spijt?', 'ze ziet een toneelstuk over God en de duivel', ['de duivel stuurt haar weg', 'haar oom geeft haar straf'], 'Lees wat Mariken ziet.'],
         ['Welk thema speelt een grote rol?', 'zonde en vergeving', ['sport en spel', 'techniek en de toekomst'], 'Ze gaat met de duivel mee en krijgt daarna spijt.']] },
    { t:['In <i>Karel ende Elegast</i> krijgt koning Karel van een engel de opdracht om die nacht uit stelen te gaan. Karel vindt het vreemd, maar hij gehoorzaamt.'],
      s:[['Waarom gaat de koning stelen?', 'een engel, dus God, geeft hem die opdracht', ['hij heeft geld nodig', 'Elegast dwingt hem'], 'Van wie krijgt Karel de opdracht?'],
         ['Wat zegt dat over hoe mensen toen dachten?', 'een opdracht van God ging boven je eigen wil, zelfs voor een koning', ['koningen deden altijd wat ze zelf wilden', 'stelen was toen heel normaal'], 'Karel vindt het vreemd, maar doet het toch. Waarom?']] },
    { t:['Veel middeleeuwse verhalen kennen we in verschillende versies. Wie het verhaal voordroeg, veranderde soms iets, en wie het met de hand overschreef ook.'],
      s:[['Waarom zijn er verschillende versies?', 'verhalen werden verteld en overgeschreven, en daarbij veranderde er iets', ['de koning wilde dat elke stad een eigen versie had', 'de boeken zijn vertaald uit het Engels'], 'Lees wat vertellers en overschrijvers deden.'],
         ['Hoe heet het als verhalen vooral van mond tot mond gaan?', 'mondelinge overlevering', ['boekdrukkunst', 'journalistiek'], 'Van mond tot mond: er wordt verteld, niet gelezen.']] }
  ];

  var GOUD = [
    { t:['De zeventiende eeuw heet in Nederland de Gouden Eeuw. Amsterdam werd rijk door de handel over zee. Er was geld voor kunst: schilderijen, gedichten en toneel.'],
      s:[['Waardoor was er in de Gouden Eeuw veel geld?', 'door de handel over zee', ['door de landbouw', 'door de uitvinding van de stoommachine'], 'Lees de tweede zin.'],
         ['Wat betekende dat voor de literatuur?', 'er was geld en publiek voor toneel en gedichten', ['niemand had tijd om te lezen', 'boeken waren verboden'], 'Als er geld is voor kunst, wat gebeurt er dan met toneel en gedichten?']] },
    { t:['Joost van den Vondel schreef het toneelstuk <i>Gijsbrecht van Aemstel</i>. Het gaat over de val van Amsterdam in de middeleeuwen. Met dit stuk werd in 1638 de nieuwe Schouwburg in Amsterdam geopend.'],
      s:[['Wat voor tekst is Gijsbrecht van Aemstel?', 'een toneelstuk', ['een roman', 'een dagboek'], 'Lees de eerste zin.'],
         ['Waar werd het voor het eerst gespeeld?', 'in de Schouwburg in Amsterdam', ['in een kerk in Utrecht', 'op het Muiderslot'], 'Welk gebouw werd met dit stuk geopend?']] },
    { t:['<i>Gijsbrecht van Aemstel</i> werd eeuwenlang elk jaar rond nieuwjaar opgevoerd in Amsterdam.'],
      s:[['Hoe vaak werd het stuk gespeeld?', 'elk jaar, eeuwenlang', ['maar één keer', 'alleen in de middeleeuwen'], 'Lees de zin precies.'],
         ['Wat zegt dat over het stuk?', 'het was heel belangrijk voor de Amsterdammers', ['niemand vond het goed', 'het was een stuk voor kleine kinderen'], 'Een stuk dat eeuwenlang elk jaar terugkomt, is een traditie.']] },
    { t:['Gerbrand Bredero schreef <i>Spaanschen Brabander</i>. De hoofdpersoon, Jerolimo, doet alsof hij rijk en deftig is. In werkelijkheid heeft hij geen cent en betaalt hij niemand.'],
      s:[['Wat voor iemand is Jerolimo?', 'een opschepper die doet alsof hij rijk is', ['een eerlijke koopman', 'een dappere ridder'], 'Lees wat Jerolimo doet en wat hij echt heeft.'],
         ['Waarom lacht het publiek om hem?', 'iedereen ziet dat zijn deftige gedoe nep is', ['hij vertelt de hele tijd moppen', 'hij is een pratend dier'], 'Hij doet deftig, maar hij heeft geen cent.']] },
    { t:['Bredero liet zijn personages praten zoals gewone Amsterdammers op straat praatten, met hun eigen woorden en uitspraak.'],
      s:[['Hoe praten de personages van Bredero?', 'in de gewone straattaal van Amsterdam', ['in het Latijn', 'in deftige, moeilijke taal'], 'Lees hoe de personages praten.'],
         ['Wat is het effect daarvan?', 'de personages komen echt en levendig over', ['niemand kon het volgen', 'het werd een saai stuk'], 'Personages die praten zoals de mensen op straat: hoe komt dat over?']] },
    { t:['Vondel schreef ook het toneelstuk <i>Lucifer</i>, over een engel die in opstand komt tegen God. Na twee voorstellingen werd het stuk verboden, omdat de kerk het niet gepast vond.'],
      s:[['Waarom werd Lucifer verboden?', 'de kerk vond het onderwerp niet gepast', ['er kwam niemand kijken', 'Vondel wilde het zelf niet meer'], 'Lees de laatste zin.'],
         ['Wat zegt dat over de Gouden Eeuw?', 'de kerk had veel invloed op wat er gespeeld mocht worden', ['iedereen mocht alles spelen', 'toneel was helemaal verboden'], 'Wie bepaalde dat het stuk niet meer gespeeld mocht worden?']] },
    { t:['In de Schouwburg speelden in het begin alleen mannen, ook de vrouwenrollen. Pas in 1655 stond er in Amsterdam voor het eerst een vrouw op het toneel.'],
      s:[['Wie speelden de vrouwenrollen in het begin?', 'mannen', ['vrouwen', 'kinderen'], 'Lees de eerste zin.'],
         ['Wat is anders dan nu?', 'nu spelen vrouwen gewoon zelf vrouwenrollen', ['nu is er geen toneel meer', 'nu spelen alleen kinderen toneel'], 'Hoe gaat het nu in het theater?']] },
    { t:['In de Gouden Eeuw schreven mensen woorden soms zo: <i>ick</i>, <i>daer</i>, <i>mensch</i>, <i>syn</i>.'],
      s:[['Hoe schrijven we deze woorden nu?', 'ik, daar, mens, zijn', ['ik, deer, mensen, zien', 'precies hetzelfde als toen'], 'Zeg de oude woorden hardop. Welk woord van nu hoor je?'],
         ['Wat zegt dat over de spelling?', 'er waren nog geen vaste spellingregels; die kwamen later', ['mensen konden toen niet schrijven', 'het is Duits'], 'Ick en daer zijn geen fouten: zo schreef men toen.']] },
    { t:['P.C. Hooft was dichter en schreef ook geschiedenis. Hij woonde op het Muiderslot, waar hij schrijvers, geleerden en kunstenaars ontving.'],
      s:[['Waar ontmoetten schrijvers elkaar bij Hooft?', 'op het Muiderslot', ['in een café in Parijs', 'in de Schouwburg van Rotterdam'], 'Lees waar Hooft woonde.'],
         ['Wat zegt dat over schrijvers in die tijd?', 'ze zochten elkaar op om over kunst en gedichten te praten', ['ze werkten altijd helemaal alleen', 'ze waren allemaal boeren'], 'Hooft ontving schrijvers en kunstenaars. Waarom zouden ze komen?']] },
    { t:['Jacob Cats schreef gedichten met een les erin: hoe je een goede vrouw, man of ouder moest zijn. Zijn boeken stonden in heel veel huizen.'],
      s:[['Wat wilde Cats met zijn gedichten?', 'mensen leren hoe ze goed moesten leven', ['mensen aan het lachen maken', 'mensen bang maken'], 'Lees wat er in zijn gedichten stond.'],
         ['Hoe noem je een tekst met een les erin?', 'een tekst met een moraal', ['een detective', 'een griezelverhaal'], 'Een les over goed of fout gedrag heet een moraal.']] },
    { t:['In <i>Gijsbrecht van Aemstel</i> wordt de stad Amsterdam in de kerstnacht aangevallen en verwoest. Gijsbrecht moet uiteindelijk vluchten met zijn familie.'],
      s:[['Wat gebeurt er met Gijsbrecht?', 'hij verliest zijn stad en moet vluchten', ['hij wordt koning van Nederland', 'hij wint de oorlog'], 'Lees de laatste zin.'],
         ['Welk thema zie je hierin?', 'oorlog en verlies', ['humor en bedrog', 'liefde voor de zee'], 'Een stad die verwoest wordt en een familie die moet vluchten.']] },
    { t:['Constantijn Huygens werkte als secretaris voor de stadhouder en schreef daarnaast gedichten. Hij sprak en schreef in veel talen.'],
      s:[['Wat was het werk van Huygens?', 'hij werkte voor de stadhouder', ['hij was acteur', 'hij was visser'], 'Lees de eerste zin.'],
         ['Wat zegt dat over veel schrijvers in die tijd?', 'ze schreven vaak naast een ander beroep', ['ze werden rijk van hun boeken', 'ze konden maar één taal'], 'Huygens schreef gedichten daarnaast. Wat was zijn hoofdwerk?']] },
    { t:['In de Gouden Eeuw kwamen er in Amsterdam veel boeken uit. Er waren daar veel drukkerijen.'],
      s:[['Hoe werden boeken nu gemaakt, anders dan in de middeleeuwen?', 'ze werden gedrukt in plaats van met de hand geschreven', ['ze werden gratis uitgedeeld', 'iedereen schreef zelf zijn boeken'], 'Lees de tweede zin.'],
         ['Wat was het gevolg?', 'gedichten en verhalen bereikten veel meer lezers', ['er werd minder gelezen', 'alleen de koning had boeken'], 'Als je een boek kunt drukken, hoeveel exemplaren kun je dan maken?']] }
  ];

  var HAVELAAR = [
    { t:['<i>Max Havelaar</i> verscheen in 1860. De schrijver noemde zich Multatuli. Zijn echte naam was Eduard Douwes Dekker.'],
      s:[['Wat is Multatuli?', 'een schuilnaam van de schrijver', ['zijn echte naam', 'de naam van de hoofdpersoon'], 'Lees de laatste zin: wat was zijn echte naam?'],
         ['Wanneer verscheen het boek?', 'in 1860, in de negentiende eeuw', ['in 1660, in de Gouden Eeuw', 'in 1960, na de Tweede Wereldoorlog'], 'Een jaartal met 18 ervoor hoort bij de negentiende eeuw.']] },
    { t:['Multatuli werkte als ambtenaar in Nederlands-Indië, het huidige Indonesië. Dat was toen een kolonie van Nederland.'],
      s:[['Wat was Nederlands-Indië?', 'een kolonie van Nederland: het huidige Indonesië', ['een provincie van Nederland', 'een land in Europa'], 'Lees de tweede zin.'],
         ['Waarom kon hij goed over de kolonie schrijven?', 'hij had er zelf gewerkt en gezien wat er gebeurde', ['hij had er een boek over gelezen', 'hij was er nooit geweest'], 'Wat deed Multatuli in Nederlands-Indië?']] },
    { t:['In het boek ziet Max Havelaar dat de Javaanse bevolking wordt uitgebuit. De mensen moeten zwaar werken, en hun vee en oogst worden afgepakt. De Nederlandse regering kijkt weg.'],
      s:[['Wat ziet Havelaar gebeuren?', 'de bevolking wordt uitgebuit en bestolen', ['de bevolking wordt rijk', 'de Nederlanders helpen de boeren'], 'Lees wat er met de mensen, hun vee en hun oogst gebeurt.'],
         ['Wat wil Multatuli met zijn boek?', 'de lezers wakker schudden: dit onrecht moet stoppen', ['de lezers laten lachen', 'reclame maken voor koffie'], 'Hij laat onrecht zien terwijl de regering wegkijkt. Wat wil hij dan?']] },
    { t:['Het boek begint met Batavus Droogstoppel, een saaie koffiemakelaar uit Amsterdam. Hij denkt alleen aan geld en vindt gedichten en verhalen onzin.'],
      s:[['Wat voor iemand is Droogstoppel?', 'een saaie man die alleen aan geld denkt', ['een dichter die van verhalen houdt', 'een held die opkomt voor de Javanen'], 'Lees wat hij denkt en vindt.'],
         ['Waarom laat Multatuli zo iemand vertellen?', 'hij laat zien hoe Nederlanders alleen aan de winst dachten, niet aan de mensen die ervoor werkten', ['Droogstoppel is de held van het boek', 'Multatuli vond Droogstoppel heel slim'], 'Droogstoppel verdient aan koffie. Denkt hij aan de mensen die de koffie maken?']] },
    { t:['In het boek staat ook het verhaal van Saïdjah en Adinda, twee jonge Javanen die van elkaar houden. De buffel van de vader van Saïdjah wordt afgepakt, en het loopt slecht met hen af.'],
      s:[['Wat gebeurt er met de buffel?', 'hij wordt afgepakt', ['hij wordt verkocht voor veel geld', 'hij loopt weg'], 'Lees de tweede zin.'],
         ['Waarom raakt dit verhaal lezers?', 'je ziet het onrecht bij gewone mensen met wie je meeleeft', ['het verhaal is heel grappig', 'het is een spannende detective'], 'Het gaat over twee jonge mensen die van elkaar houden. Wat voel je als hen onrecht wordt gedaan?']] },
    { t:['Aan het eind van het boek neemt Multatuli zelf het woord. Hij richt zich rechtstreeks tot koning Willem III en vraagt of hij dit onrecht wil laten gebeuren.'],
      s:[['Tegen wie praat Multatuli aan het eind?', 'tegen de koning', ['tegen Droogstoppel', 'tegen zijn moeder'], 'Lees de tweede zin.'],
         ['Wat is het effect daarvan?', 'het boek wordt een aanklacht: het onrecht is echt en er moet iets gebeuren', ['het boek wordt een sprookje', 'het boek eindigt met een grap'], 'De schrijver stapt uit het verhaal en spreekt de koning zelf aan.']] },
    { t:['De naam Multatuli komt uit het Latijn en betekent: ik heb veel gedragen.'],
      s:[['Wat zegt deze schuilnaam over de schrijver?', 'hij vond dat hij veel onrecht en tegenslag had meegemaakt', ['hij kon zware dingen tillen', 'hij gaf Latijnse les'], 'Veel gedragen kan ook figuurlijk zijn: veel verdriet of tegenslag.'],
         ['Welke naam stond op het boek als schrijver?', 'Multatuli', ['Eduard Douwes Dekker', 'Max Havelaar'], 'Een schuilnaam gebruik je in plaats van je echte naam.']] },
    { t:['Het keurmerk Max Havelaar, dat je op koffie en bananen kunt zien, is naar dit boek genoemd. Het keurmerk moet ervoor zorgen dat boeren een eerlijke prijs krijgen.'],
      s:[['Waarom heet het keurmerk zo?', 'net als in het boek gaat het om een eerlijke behandeling van boeren', ['Max Havelaar was een koffiemerk', 'de schrijver heeft het zelf bedacht'], 'Waar ging het boek over, en waar is het keurmerk voor?'],
         ['Wat zegt dat over het boek?', 'het thema van het boek is nu nog steeds belangrijk', ['het boek is vergeten', 'niemand weet meer waar het over gaat'], 'Ruim honderd jaar later noemde men er nog een keurmerk naar.']] },
    { t:['Rond 1860 verdiende Nederland veel geld met koffie uit de kolonie. De koffie werd in Nederland op veilingen verkocht.'],
      s:[['Waar verdiende Nederland veel geld mee?', 'met de handel in koffie uit de kolonie', ['met de verkoop van boeken', 'met toerisme'], 'Lees de eerste zin.'],
         ['Wie betaalde volgens Multatuli de prijs voor die rijkdom?', 'de boeren op Java, die zwaar moesten werken voor weinig', ['de kopers in Amsterdam', 'de koning zelf'], 'Wie maakte de koffie, en wat kregen zij ervoor?']] },
    { t:['In de negentiende eeuw lazen steeds meer mensen. Kranten en boeken werden goedkoper, en meer kinderen gingen naar school.'],
      s:[['Wat veranderde er?', 'meer mensen konden lezen en kochten boeken', ['er werd minder gelezen', 'boeken werden weer met de hand geschreven'], 'Lees de zinnen nog eens.'],
         ['Waarom kon Max Havelaar daardoor veel invloed hebben?', 'veel mensen lazen het en gingen praten over de kolonie', ['alleen de koning las het', 'het boek werd verboden'], 'Hoe meer lezers, hoe meer mensen erover praten.']] },
    { t:['Havelaar is in het boek assistent-resident van Lebak, een gebied op Java. Hij klaagt de plaatselijke regent aan, maar zijn bazen geven hem geen gelijk.'],
      s:[['Hoe reageren zijn bazen?', 'ze geven hem geen gelijk', ['ze straffen de regent meteen', 'ze geven hem een prijs'], 'Lees het eind van de laatste zin.'],
         ['Wat doet Havelaar daarna?', 'hij neemt ontslag', ['hij wordt de baas van de kolonie', 'hij gaat de regent helpen'], 'Hij krijgt geen gelijk en wil niet meedoen aan het onrecht.']] },
    { t:['Een stukje uit het boek, naverteld in gewoon Nederlands: Droogstoppel zegt dat hij niets tegen gedichten heeft, maar dat het allemaal leugens zijn. Hij houdt van de waarheid, en van goede zaken doen.'],
      s:[['Wat vindt Droogstoppel van gedichten en verhalen?', 'leugens en tijdverspilling', ['het mooiste wat er is', 'belangrijk voor de handel'], 'Lees wat hij over gedichten zegt.'],
         ['Hoe moet de lezer naar Droogstoppel kijken?', 'met spot: Multatuli maakt hem belachelijk', ['met bewondering: hij is het voorbeeld', 'met medelijden: hij is ziek'], 'Een man die zegt dat hij van de waarheid houdt, maar alleen aan geld denkt.']] },
    { t:['Nu vinden veel mensen dat Nederland in de koloniale tijd veel onrecht heeft gedaan. In 1860 dachten de meeste Nederlanders daar anders over.'],
      s:[['Wat was er in 1860 bijzonder aan het boek?', 'Multatuli gaf kritiek op iets wat de meeste Nederlanders normaal vonden', ['iedereen dacht er al net zo over', 'het was het eerste boek in het Nederlands'], 'Hoe dachten de meeste mensen er toen over?'],
         ['Wat is het verschil met nu?', 'nu wordt er veel meer openlijk gepraat over het onrecht in de koloniale tijd', ['Nederland heeft nu nog steeds een kolonie op Java', 'niemand leest nu nog over de koloniale tijd'], 'Lees de eerste zin.']] }
  ];

  var OORLOG = [
    { t:['Anne Frank kreeg op haar dertiende verjaardag, 12 juni 1942, een dagboek. Een paar weken later dook ze met haar familie onder.'],
      s:[['Hoe oud was Anne toen ze haar dagboek kreeg?', '13 jaar', ['10 jaar', '16 jaar'], 'Lees de eerste zin.'],
         ['Waarom moest de familie Frank onderduiken?', 'ze waren Joods, en de Duitse bezetters vervolgden Joden', ['ze hadden iets gestolen', 'ze wilden op reis'], 'Het is 1942, midden in de Tweede Wereldoorlog.']] },
    { t:['De familie Frank verstopte zich in het achterhuis van het bedrijf van Annes vader, aan de Prinsengracht in Amsterdam. Ze zaten daar met acht mensen.'],
      s:[['Waar zat Anne ondergedoken?', 'in het achterhuis van het bedrijf van haar vader in Amsterdam', ['op een boerderij in Friesland', 'in een kelder in Duitsland'], 'Lees de eerste zin.'],
         ['Waarom heet het boek Het Achterhuis?', 'naar de plek waar ze ondergedoken zaten', ['naar een huis waar Anne later woonde', 'naar een straat in Duitsland'], 'Waar woonde Anne in de jaren dat ze het dagboek schreef?']] },
    { t:['Anne schreef haar dagboek als brieven aan een vriendin die niet bestond: Kitty.'],
      s:[['Aan wie schreef Anne haar brieven?', 'aan Kitty, een vriendin die niet bestond', ['aan haar zus Margot', 'aan de koningin'], 'Lees de zin.'],
         ['Wat is het effect van die briefvorm?', 'het voelt alsof Anne rechtstreeks tegen jou praat', ['het wordt een toneelstuk', 'het wordt een gedicht op rijm'], 'Een brief is aan iemand gericht. Hoe voelt het als jij die lezer bent?']] },
    { t:['In het Achterhuis moesten de onderduikers overdag heel stil zijn. Beneden werkten mensen in het bedrijf die niets mochten merken.'],
      s:[['Waarom moesten ze stil zijn?', 'niemand mocht ontdekken dat er mensen verstopt zaten', ['het was een bibliotheek', 'ze waren ziek'], 'Wie werkten er beneden, en wat mochten die niet merken?'],
         ['Welk woord past bij het leven in het Achterhuis?', 'opgesloten', ['vrij', 'zorgeloos'], 'Ze konden niet naar buiten en moesten stil zijn.']] },
    { t:['Een paar mensen hielpen de onderduikers, zoals Miep Gies. Ze brachten eten, boeken en nieuws van buiten. Dat was levensgevaarlijk.'],
      s:[['Wat deden de helpers?', 'ze brachten eten, boeken en nieuws', ['ze verraadden de onderduikers', 'ze woonden ook in het Achterhuis'], 'Lees de tweede zin.'],
         ['Waarom was dat dapper?', 'als ze gepakt werden, werden ze zelf ook zwaar gestraft', ['het was helemaal niet gevaarlijk', 'ze kregen er veel geld voor'], 'Lees de laatste zin: levensgevaarlijk.']] },
    { t:['Op 4 augustus 1944 werden de onderduikers ontdekt en opgepakt. Anne overleed begin 1945 in het concentratiekamp Bergen-Belsen. Alleen haar vader Otto overleefde de oorlog. Miep Gies had het dagboek bewaard, en Otto liet het in 1947 uitgeven.'],
      s:[['Wie van de onderduikers overleefde de oorlog?', 'alleen Otto Frank, de vader van Anne', ['Anne', 'iedereen'], 'Lees de derde zin.'],
         ['Wat deed Otto Frank met het dagboek?', 'hij liet het uitgeven als boek', ['hij verbrandde het', 'hij hield het geheim'], 'Lees de laatste zin.']] },
    { t:['In het Achterhuis schrijft Anne over ruzie met haar moeder, over verliefd worden op Peter en over wie ze later wil worden. Ze wil schrijfster worden.'],
      s:[['Waar schrijft Anne over, naast de oorlog?', 'gewone dingen van opgroeien: ruzie, verliefdheid en dromen', ['alleen over het nieuws van het front', 'over haar werk op kantoor'], 'Lees waar Anne over schrijft.'],
         ['Waarom spreekt het boek jongeren nu nog aan?', 'ze herkennen de gevoelens van een tiener', ['het is een avonturenverhaal met een vrolijk einde', 'het speelt in deze tijd'], 'Ruzie met je ouders en verliefd worden: kennen jongeren dat nu ook?']] },
    { t:['Anne hoorde op de radio dat een minister vroeg om dagboeken en brieven uit de oorlog te bewaren. Daarna begon ze haar dagboek te herschrijven, zodat het later een boek kon worden.'],
      s:[['Waarom ging Anne haar dagboek herschrijven?', 'ze wilde dat het na de oorlog een boek kon worden', ['ze had het kwijtgemaakt', 'haar vader vond het slecht'], 'Lees het eind van de laatste zin.'],
         ['Wat zegt dat over Anne?', 'ze wilde echt schrijfster worden', ['ze vond schrijven saai', 'ze wilde de oorlog vergeten'], 'Ze werkt haar dagboek om tot een boek.']] },
    { t:['<i>Het Achterhuis</i> is in meer dan zeventig talen vertaald. Het Achterhuis aan de Prinsengracht is nu een museum.'],
      s:[['Wat is er nu in het Achterhuis?', 'een museum', ['een school', 'een winkel'], 'Lees de laatste zin.'],
         ['Waarom lezen mensen over de hele wereld het boek?', 'het laat zien wat oorlog en vervolging met gewone mensen doen', ['het is een grappig boek', 'het gaat over Amsterdam in de Gouden Eeuw'], 'Waar gaat het dagboek over?']] },
    { t:['Jan Terlouw schreef <i>Oorlogswinter</i> (1972). De vijftienjarige Michiel moet in de laatste winter van de oorlog een gevaarlijke opdracht uitvoeren voor het verzet.'],
      s:[['Wat voor boek is Oorlogswinter?', 'een jeugdroman die in de Tweede Wereldoorlog speelt', ['een dagboek uit de oorlog', 'een toneelstuk uit de Gouden Eeuw'], 'Het is geschreven in 1972, en het speelt in de oorlog.'],
         ['Wat is het verschil met Het Achterhuis?', 'Oorlogswinter is een roman, Het Achterhuis is een echt dagboek', ['Oorlogswinter is ook een echt dagboek', 'Het Achterhuis is verzonnen'], 'Wie schreef Het Achterhuis, en wanneer? En Oorlogswinter?']] },
    { t:['In <i>Oorlogswinter</i> moet Michiel kiezen: helpt hij het verzet, ook al is dat gevaarlijk voor zijn familie?'],
      s:[['Voor welke keuze staat Michiel?', 'helpen, ook al is het gevaarlijk', ['naar school gaan of niet', 'welke fiets hij koopt'], 'Lees de vraag die Michiel zichzelf moet stellen.'],
         ['Welk thema zie je hierin?', 'moed en verantwoordelijkheid', ['humor', 'jaloezie'], 'Durf je iets gevaarlijks te doen omdat het goed is?']] },
    { t:['Harry Mulisch schreef <i>De aanslag</i> (1982). In januari 1945 wordt in Haarlem een foute politieman doodgeschoten. Als straf steken de Duitsers het huis van de familie van de jonge Anton in brand.'],
      s:[['Wat gebeurt er met het huis van de familie van Anton?', 'het wordt in brand gestoken', ['het wordt een museum', 'Anton verkoopt het'], 'Lees de laatste zin.'],
         ['Wat laat het boek zien?', 'hoe één gebeurtenis in de oorlog iemands hele leven bepaalt', ['dat oorlog spannend en leuk is', 'hoe je een huis bouwt'], 'Anton is nog jong als dit gebeurt. Wat doet dat met de rest van zijn leven?']] },
    { t:['Marga Minco schreef <i>Het bittere kruid</i> (1957), over een Joods meisje dat in de oorlog haar familie verliest. Ze schrijft in korte, sobere zinnen.'],
      s:[['Hoe schrijft Minco?', 'in korte, sobere zinnen', ['in lange zinnen vol grappen', 'op rijm'], 'Lees de laatste zin.'],
         ['Wat is het effect van die sobere stijl?', 'het verdriet komt juist hard aan, omdat het zo rustig verteld wordt', ['het verhaal wordt grappig', 'je snapt er niets van'], 'Als iets heel ergs heel rustig wordt verteld, wat doet dat met jou?']] }
  ];

  /* periode herkennen: [fragment, wat valt op, periode] */
  var PERIODE = ['de middeleeuwen', 'de Gouden Eeuw', 'de negentiende eeuw', 'de Tweede Wereldoorlog', 'deze tijd'];
  var HERKEN = [
    ['<i>Die vos was quaet ende fel. Hi loech den coninc.</i>', 'Middelnederlandse woorden als ende, hi en coninc', 0],
    ['Een ridder rijdt naar het hof van de koning. Daar draagt een speelman een lang verhaal op rijm voor.', 'een ridder, het hof en een verteller die op rijm voordraagt', 0],
    ['<i>Ic wille u segghen een wonder.</i>', 'woorden als ic en segghen', 0],
    ['Een monnik schreef het verhaal met de hand over in het klooster. Bij de eerste letter tekende hij een kleine draak.', 'een monnik die een boek met de hand overschrijft', 0],
    ['<i>Ick seg u, mijn heer, dat het schip uyt Oost-Indien is gekomen.</i>', 'oude spelling als ick en uyt, en een schip uit Oost-Indië', 1],
    ['In de Schouwburg van Amsterdam speelt een man de rol van een prinses. Het publiek lacht om een opschepper die doet alsof hij rijk is.', 'een man in een vrouwenrol, in de eerste Schouwburg', 1],
    ['De dichter schreef een lang gedicht voor de opening van het nieuwe stadhuis op de Dam, betaald met het geld van de handel over zee.', 'een nieuw stadhuis, betaald met de rijke handel over zee', 1],
    ['<i>Zoo sprak de koopman tot zijnen klerk: de koffie uit Java moet nog heden verkocht worden.</i>', 'spelling als zoo en zijnen, en koffie uit de kolonie Java', 2],
    ['Een ambtenaar schrijft een boze brief over het onrecht in de kolonie. Hij reist per stoomschip terug naar Holland.', 'een kolonie en een stoomschip', 2],
    ['De fabrieksarbeiders werkten twaalf uur per dag. ’s Avonds las de dochter van de fabrikant bij een olielamp een roman.', 'fabrieksarbeiders en een olielamp', 2],
    ['Lies mag niet meer naar haar oude school en moet een gele ster dragen. ’s Nachts hoort ze bommenwerpers overkomen.', 'een gele ster en bommenwerpers in de nacht', 3],
    ['Het was de hongerwinter. Moeder kookte tulpenbollen, omdat er geen ander eten meer was.', 'de hongerwinter en tulpenbollen als eten', 3],
    ['Vader verstopte de radio onder de vloer, want alle radio’s moesten bij de bezetter worden ingeleverd.', 'een verstopte radio en een bezetter', 3],
    ['Jesse scrolt door zijn telefoon en ziet dat zijn filmpje al duizend keer is bekeken.', 'een telefoon en een filmpje online', 4],
    ['Mila kijkt in de app of haar trein vertraging heeft. Ze stuurt haar moeder een berichtje dat ze later komt.', 'een app en een berichtje naar haar moeder', 4]
  ];
  var OPVALLEND = HERKEN.map(function(x){ return x[1]; });
  function maakHerken(R, it){
    var p = PERIODE[it[2]], zelfde = HERKEN.filter(function(x){ return x[2] === it[2]; }).map(function(x){ return x[1]; });
    return OP('Uit welke tijd komt dit fragment?', tekst(it[0]), [
      K(R, 'Wat valt op aan de taal of de inhoud?', it[1], trek(R, OPVALLEND, zelfde, 2), 'Let op oude spelling, en op dingen die bij een tijd horen: ridders, schepen, kolonies, de oorlog of telefoons.'),
      K(R, 'Uit welke tijd komt dit fragment?', p, trek(R, PERIODE, [p], 2), 'Bij welke tijd hoort dit: ' + it[1] + '?')
    ]);
  }

  /* universele thema's: [oud verhaal, thema, [fout], situatie nu, [fout]] */
  var UNIV = [
    ['<i>Van den vos Reynaerde</i> (middeleeuwen): de vos praat zich met slimme leugens steeds onder zijn straf uit.', 'bedrog en mooie praatjes', ['liefde', 'eenzaamheid'], 'iemand die zich met mooie praatjes overal uit kletst, ook als hij fout zit', ['iemand die verliefd wordt op een klasgenoot', 'iemand die verhuist naar een nieuwe stad']],
    ['<i>Karel ende Elegast</i> (middeleeuwen): de verbannen ridder Elegast redt de koning, terwijl zijn zwager hem wil vermoorden.', 'trouw en verraad', ['opgroeien', 'humor'], 'je beste vriend roddelt over je, en de klasgenoot met wie je ruzie had, neemt het voor je op', ['je wint een prijs voor je werkstuk', 'je gaat op vakantie met je familie']],
    ['<i>Beatrijs</i> (middeleeuwen): een non verlaat het klooster voor de liefde. Als ze na jaren spijt heeft en terugkomt, wordt ze vergeven.', 'spijt en vergeving', ['hebzucht', 'oorlog'], 'iemand maakt een grote fout, heeft spijt en krijgt een tweede kans', ['iemand wordt rijk met een nieuwe app', 'iemand wint een voetbalwedstrijd']],
    ['<i>Gijsbrecht van Aemstel</i> (Gouden Eeuw): Gijsbrecht ziet zijn stad in de oorlog verwoest worden en moet vluchten.', 'oorlog en vluchten', ['humor en bedrog', 'verliefdheid'], 'een gezin dat vlucht voor de oorlog in hun land en ergens anders opnieuw moet beginnen', ['een gezin dat een nieuwe auto koopt', 'een klas die op schoolreis gaat']],
    ['<i>Spaanschen Brabander</i> (Gouden Eeuw): Jerolimo doet alsof hij rijk en deftig is, maar hij heeft geen cent.', 'schijn en opschepperij', ['trouw', 'verlies'], 'iemand die online een perfect leven laat zien, terwijl het thuis heel anders is', ['iemand die eerlijk vertelt dat hij weinig geld heeft', 'iemand die een oude vriend terugziet']],
    ['<i>Max Havelaar</i> (1860): Havelaar ziet dat arme boeren worden uitgebuit, zodat anderen rijk worden van de koffie.', 'onrecht en uitbuiting', ['verliefdheid', 'opgroeien'], 'kinderen in arme landen die voor heel weinig geld kleren maken voor rijke landen', ['een school die een sportdag organiseert', 'een jongen die verliefd wordt']],
    ['<i>Het Achterhuis</i> (1942 tot 1944): Anne heeft ruzie met haar moeder, wordt verliefd en vraagt zich af wie ze wil worden.', 'opgroeien', ['hebzucht', 'bedrog'], 'een meisje van dertien dat botst met haar ouders en nadenkt over wie ze wil zijn', ['een man die een bedrijf begint', 'een oude vrouw die gaat verhuizen']],
    ['<i>Het Achterhuis</i> (1942 tot 1944): Anne zit twee jaar binnen en mag niet naar buiten. Ze verlangt naar de lucht en de kastanjeboom die ze door het raam ziet.', 'verlangen naar vrijheid', ['hebzucht', 'opschepperij'], 'iemand die in de coronatijd maanden thuis moest blijven en verlangde om weer naar buiten te gaan', ['iemand die een nieuwe fiets krijgt', 'iemand die een toets haalt']],
    ['<i>Mariken van Nieumeghen</i> (rond 1500): Mariken laat zich door de duivel verleiden met mooie beloftes. Pas later ziet ze wat ze fout heeft gedaan.', 'verleiding en spijt', ['trouw', 'oorlog'], 'iemand die zich door een vriend laat overhalen om iets stoms te doen, en er later spijt van heeft', ['iemand die een prijs wint', 'iemand die een huisdier krijgt']],
    ['<i>Lucifer</i> (Gouden Eeuw): de engel Lucifer is jaloers en komt in opstand tegen God. Hij verliest en wordt uit de hemel verstoten.', 'jaloezie en opstand tegen de macht', ['vriendschap', 'vrijheid in de natuur'], 'een speler die jaloers is op de aanvoerder en het team tegen de trainer opzet', ['een speler die zijn teamgenoot helpt', 'een speler die een nieuwe club zoekt']],
    ['<i>Oorlogswinter</i> (1972): Michiel moet kiezen of hij het verzet helpt, ook al brengt hij daarmee zijn familie in gevaar.', 'moed en verantwoordelijkheid', ['opschepperij', 'hebzucht'], 'iemand die ziet dat een klasgenoot gepest wordt en moet kiezen of hij ingrijpt', ['iemand die een nieuwe telefoon koopt', 'iemand die op vakantie gaat']],
    ['<i>Van den vos Reynaerde</i> (middeleeuwen): koning Nobel laat de vos gaan, omdat Reynaert hem een verborgen schat belooft.', 'hebzucht', ['moed', 'vergeving'], 'iemand die een nepbericht gelooft, omdat hem een grote prijs wordt beloofd', ['iemand die een vriend helpt verhuizen', 'iemand die een gedicht schrijft']],
    ['<i>De aanslag</i> (1982): Anton verliest in één nacht zijn hele familie. Zijn hele leven blijft hij zoeken naar wat er echt gebeurde.', 'verlies en de vraag wie er schuld heeft', ['humor', 'opschepperij'], 'iemand die na een ongeluk jarenlang wil weten wie er schuld had', ['iemand die een feest organiseert', 'iemand die een nieuwe sport leert']]
  ];
  function maakUniv(R, it){
    return OP('Welke situatie van nu past bij hetzelfde thema?', tekst(it[0]), [
      K(R, 'Welk thema zit in dit oude verhaal?', it[1], it[2], 'Vraag je af wat het personage voelt of doet. Dat thema kan in elke tijd voorkomen.'),
      K(R, 'Welke situatie van nu past bij hetzelfde thema?', it[3], it[4], 'Zoek een situatie van nu waarin ook ' + it[1] + ' een rol speelt.')
    ]);
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'lit-tijd', niveau:'3F', domein:'fictie', naam:'Literatuur door de tijd', kd:['nl9C.a', 'nl9C.b', 'nl9C.c', 'nl9C.d'],
        uit:'Van de vos Reynaert tot het dagboek van Anne Frank: literatuur uit verschillende tijden. Je leert hoe de tijd een verhaal kleurt, je herkent de periode aan de taal, en je ziet wat in al die eeuwen hetzelfde is gebleven.' },
      doelen:[
        { id:'lit-tijd-middel', naam:'De middeleeuwen', kort:'Ridders, sprekende dieren, het geloof en verhalen die werden voorgedragen',
          uit:'<p>In de <b>middeleeuwen</b> (ongeveer 500 tot 1500) konden de meeste mensen niet lezen. Verhalen werden <b>voorgedragen</b>, vaak op rijm, en boeken werden <b>met de hand</b> overgeschreven.</p><p>Bekende verhalen: <i>Van den vos Reynaerde</i> (een sluwe vos bedriegt de dieren aan het hof van koning Nobel) en <i>Karel ende Elegast</i> (koning Karel gaat op bevel van een engel uit stelen, samen met de ridder Elegast).</p><p>Belangrijk in die tijd: <b>ridders</b>, <b>trouw</b> en het <b>geloof</b>.</p>',
          wanneer:'je een oud verhaal leest met ridders, koningen of sprekende dieren.',
          maak:function(R){ return gen(R, R.kies(MIDDEL)); } },
        { id:'lit-tijd-goud', naam:'De Gouden Eeuw', kort:'De rijke zeventiende eeuw: toneel in de Schouwburg, Vondel en Bredero',
          uit:'<p>In de <b>Gouden Eeuw</b> (de zeventiende eeuw) werd Amsterdam rijk door de handel over zee. Er was geld voor kunst, en vooral <b>toneel</b> was populair.</p><p><b>Vondel</b> schreef <i>Gijsbrecht van Aemstel</i>, waarmee in 1638 de Schouwburg in Amsterdam werd geopend. <b>Bredero</b> schreef grappige stukken in de taal van de straat, zoals <i>Spaanschen Brabander</i>.</p><p>De spelling lag nog niet vast: <i>ick, daer, mensch</i>.</p>',
          wanneer:'je leest over toneel, dichters of de rijke handelsstad Amsterdam.',
          maak:function(R){ return gen(R, R.kies(GOUD)); } },
        { id:'lit-tijd-havelaar', naam:'Max Havelaar', kort:'Multatuli gaf in 1860 kritiek op de uitbuiting in de kolonie',
          uit:'<p>In <b>1860</b> verscheen <i>Max Havelaar</i> van <b>Multatuli</b>, de schuilnaam van Eduard Douwes Dekker. Hij had zelf als ambtenaar in <b>Nederlands-Indië</b> gewerkt, het huidige Indonesië.</p><p>Het boek is een aanklacht: de Javaanse bevolking werd <b>uitgebuit</b>, terwijl Nederland rijk werd van de koffie. De koffiemakelaar Droogstoppel wordt belachelijk gemaakt, en aan het eind spreekt Multatuli de koning zelf aan.</p>',
          wanneer:'je leest over de negentiende eeuw of over de koloniale tijd.',
          maak:function(R){ return gen(R, R.kies(HAVELAAR)); } },
        { id:'lit-tijd-oorlog', naam:'Oorlogsliteratuur', kort:'Het Achterhuis van Anne Frank en andere boeken over de Tweede Wereldoorlog',
          uit:'<p>Over de <b>Tweede Wereldoorlog</b> (1940 tot 1945 in Nederland) is veel geschreven. Het bekendste boek is <i>Het Achterhuis</i>: het echte <b>dagboek</b> van Anne Frank, die twee jaar ondergedoken zat in Amsterdam.</p><p>Er zijn ook <b>romans</b> over de oorlog, zoals <i>Oorlogswinter</i> van Jan Terlouw en <i>De aanslag</i> van Harry Mulisch. Een dagboek is echt gebeurd en toen geschreven; een roman is later bedacht.</p>',
          wanneer:'je een boek leest dat in de oorlog speelt.',
          maak:function(R){ return gen(R, R.kies(OORLOG)); } },
        { id:'lit-tijd-herken', naam:'Herken de periode', kort:'Oude spelling en dingen uit die tijd verraden wanneer een tekst speelt',
          uit:'<p>Je herkent de tijd van een tekst aan de <b>taal</b> en aan de <b>inhoud</b>.</p><p><b>Middeleeuwen</b>: <i>ic, hi, ende, coninc</i>; ridders, monniken. <b>Gouden Eeuw</b>: <i>ick, uyt, daer</i>; de Schouwburg, de handel over zee. <b>Negentiende eeuw</b>: <i>zoo, zijnen, mensch</i>; kolonies, stoomschepen, fabrieken. <b>Tweede Wereldoorlog</b>: onderduiken, de gele ster, de hongerwinter. <b>Nu</b>: telefoons en apps.</p>',
          wanneer:'je een fragment krijgt en moet zeggen uit welke tijd het komt.',
          maak:function(R){ return maakHerken(R, R.kies(HERKEN)); } },
        { id:'lit-tijd-univ', naam:'Wat is nu nog hetzelfde?', kort:'Universele thema’s: in elke tijd gaat het over liefde, bedrog, moed en onrecht',
          uit:'<p>Oude verhalen spelen in een andere tijd, maar de <b>thema’s</b> zijn vaak hetzelfde gebleven: bedrog, trouw, liefde, opgroeien, onrecht, moed. Dat heten <b>universele thema’s</b>.</p><p>De sluwe vos Reynaert lijkt op iemand die zich nu met mooie praatjes overal uit kletst. Jerolimo, die doet alsof hij rijk is, lijkt op iemand die online een perfect leven laat zien.</p>',
          wanneer:'je een oud verhaal wilt vergelijken met je eigen tijd.',
          maak:function(R){ return maakUniv(R, R.kies(UNIV)); } }
      ] }
  ]);

  /* ================= LEZEN EN VINDEN ================= */

  /* mening onderbouwen: [mening, over het boek, over iets anders, te vaag] */
  var ONDERBOUW = [
    ['Ik vind <i>Het geheim van de vuurtoren</i> een goed boek.', 'Elk hoofdstuk eindigt spannend, dus je wilt steeds verder lezen.', 'Mijn beste vriend vond het ook goed.', 'Het is gewoon echt een leuk boek.'],
    ['Ik vind <i>Kopje onder</i> een saai boek.', 'In de eerste vijftig bladzijden gebeurt er bijna niets.', 'Ik moest het lezen voor school.', 'Het is gewoon niks.'],
    ['Ik vind <i>De laatste bus</i> een mooi boek.', 'De schrijver beschrijft de nacht zo goed dat je het donker bijna voelt.', 'Het boek was in de aanbieding.', 'Het is echt mooi, gewoon.'],
    ['Ik vind <i>Sterker dan ijzer</i> een ontroerend boek.', 'Je leest de gedachten van Fenna als ze opnieuw leert lopen, dus je leeft echt mee.', 'Ik las het in de zomervakantie aan het strand.', 'Het deed gewoon iets met me.'],
    ['Ik vind <i>Villa Zonnehoek</i> een grappig boek.', 'De gesprekken tussen Joep en de oude meneer Bakker zijn heel droog en grappig.', 'De schrijver komt uit mijn dorp.', 'Het is gewoon lachen.'],
    ['Ik vind <i>Het eiland</i> een ongeloofwaardig boek.', 'De kinderen bouwen in één dag een huis, terwijl ze geen gereedschap hebben.', 'Ik ben zelf nog nooit op een eiland geweest.', 'Het klopt gewoon niet.'],
    ['Ik vind <i>Kai</i> een leerzaam boek.', 'Je leert hoe het is om op een gewone school te zitten als je niet kunt horen.', 'Mijn moeder heeft het voor me gekocht.', 'Je leert er gewoon veel van.'],
    ['Ik vind <i>Tegen de stroom in</i> een goed boek.', 'Sara is een sterk personage dat echt verandert in het verhaal.', 'Ik had dat weekend toch niets anders te doen.', 'Het is een topboek.'],
    ['Ik vind <i>Het rode schrift</i> een spannend boek.', 'Je komt pas op de laatste bladzijde te weten wat er met opa gebeurd is.', 'Ik heb zelf ook een rood schrift.', 'Het is gewoon heel spannend.'],
    ['Ik vind <i>Een huis van glas</i> een te moeilijk boek.', 'De zinnen zijn heel lang en er staan veel moeilijke woorden in.', 'Ik had die week veel toetsen.', 'Het is gewoon te moeilijk.'],
    ['Ik vind <i>De sleutelbos</i> een leuk boek voor de brugklas.', 'Het speelt op een middelbare school, dus brugklassers herkennen veel.', 'Mijn zus zit ook in de brugklas.', 'Het is gewoon leuk voor iedereen.'],
    ['Ik vind <i>Zomer in Zeeland</i> een romantisch boek.', 'Hoe Tess verliefd wordt, wordt heel langzaam en echt beschreven.', 'Ik ga deze zomer zelf naar Zeeland.', 'Het is gewoon heel romantisch.'],
    ['Ik vind <i>Fatima</i> een sterk sportboek.', 'De wedstrijden zijn zo beschreven dat je zelf in het doel lijkt te staan.', 'Ik speel zelf ook voetbal.', 'Het is echt een goed boek, zeg maar.'],
    ['Ik vind <i>Bas</i> een saai boek.', 'Elk hoofdstuk gaat weer over hetzelfde probleem, en er verandert niets.', 'Ik lees eigenlijk liever strips.', 'Het is gewoon saai.']
  ];
  function maakOnderbouw(R, it){
    var fm = {}; fm[it[2]] = 'Dat gaat niet over het boek zelf.'; fm[it[3]] = 'Dat is te vaag: wat is er dan goed of slecht aan?';
    return OP('Welk argument onderbouwt de mening het best?', tekst(it[0]), [
      K(R, 'Welk argument gaat niet over het boek, maar over iets anders?', it[2], [it[1], it[3]], 'Gaat het argument over het verhaal, de personages of de schrijfstijl? Of over jou, je vrienden of de winkel?'),
      K(R, 'Welk argument is te vaag: het zegt niet wat er goed of slecht aan is?', it[3], [it[1], it[2]], 'Zoek het argument met gewoon of echt, zonder iets concreets uit het boek.'),
      K(R, 'Welk argument onderbouwt de mening het best?', it[1], [it[2], it[3]], 'Kies het argument dat iets concreets uit het boek noemt.', fm)
    ]);
  }

  /* recensie lezen: [titel, tekst, oordeel, argument, [foute argumenten]] */
  var OORDEEL = { pos:'positief', neg:'negatief', gem:'positief én negatief' };
  var OORDHINT = { pos:'Zoek woorden als wat een boek, aanrader of sterren.', neg:'Zoek woorden als saai, jammer of te moeilijk.', gem:'Zie je zowel iets goeds als een maar of wel jammer?' };
  var RECENSIE = [
    ['Het geheim van de vuurtoren', 'Wat een boek! Vanaf de eerste bladzijde wil je weten wat er in de vuurtoren gebeurd is. De schrijver laat je steeds net iets te weinig weten. Ik las het in één avond uit.', 'pos', 'de schrijver houdt het geheim lang spannend', ['de illustraties zijn prachtig', 'het boek is te kort']],
    ['Kopje onder', 'Het onderwerp is belangrijk, maar het boek is saai. De hoofdpersoon blijft vlak, en de gesprekken klinken niet echt. Jammer.', 'neg', 'de gesprekken klinken niet echt', ['het onderwerp is onbelangrijk', 'het boek is te dik']],
    ['De laatste bus', 'Het begin is sterk: de nacht, de lege straten, de vreemde oude man. Maar het einde is rommelig, en ik snap nog steeds niet wat er met Daan is gebeurd.', 'gem', 'het begin is sterk, maar het einde is rommelig', ['het begin is saai', 'het boek heeft mooie plaatjes']],
    ['Sterker dan ijzer', 'Dit boek raakte me. Fenna is een personage dat je nooit vergeet. De schrijver maakt het nergens zielig, en dat maakt het juist zo sterk.', 'pos', 'de schrijver maakt het nergens zielig', ['het boek is heel zielig', 'het boek is erg grappig']],
    ['Villa Zonnehoek', 'Grappig? Soms. Maar veel grappen worden drie keer herhaald. En de oude mensen in het boek zijn allemaal hetzelfde: doof en mopperig.', 'neg', 'de oude mensen zijn allemaal hetzelfde', ['het boek is te spannend', 'de grappen zijn allemaal nieuw']],
    ['Het eiland', 'Vier kinderen, één eiland, geen volwassenen. Het is spannend, en je wilt weten hoe ze het redden. Wel jammer dat de kinderen in één dag een huis bouwen: dat geloof je niet.', 'gem', 'het is spannend, maar soms ongeloofwaardig', ['er gebeurt niets', 'het boek is te moeilijk']],
    ['Kai', 'Een boek dat laat zien hoe het is om doof te zijn op school. Je leert veel, en Kai is grappig en eerlijk. Een aanrader voor iedereen.', 'pos', 'je leert hoe het is om doof te zijn op school', ['het boek is te kort', 'de kaft is mooi']],
    ['De sleutelbos', 'De geheime kamers zijn leuk bedacht, maar het verhaal gaat heel langzaam. Pas na honderd bladzijden gebeurt er iets.', 'gem', 'leuk bedacht, maar het gaat heel langzaam', ['het is vanaf de eerste bladzijde spannend', 'er zitten te veel grappen in']],
    ['Een huis van glas', 'Dit boek is te moeilijk voor de onderbouw. De zinnen zijn lang, de woorden moeilijk, en het verhaal springt steeds heen en weer in de tijd.', 'neg', 'de zinnen zijn lang en het verhaal springt in de tijd', ['het boek is te makkelijk', 'het verhaal is grappig']],
    ['Het rode schrift', 'Ontroerend en spannend tegelijk. Via de brieven van opa leer je hoe het was om naar een nieuw land te komen. Ik heb gehuild aan het eind.', 'pos', 'via de brieven leer je hoe het was om naar een nieuw land te komen', ['het boek is saai', 'opa is een grappig personage']],
    ['Zomer in Zeeland', 'Een fijn boek voor in de vakantie, al weet je vanaf bladzijde één hoe het afloopt. Verrassingen zitten er niet in.', 'gem', 'fijn om te lezen, maar voorspelbaar', ['vol verrassingen', 'veel te moeilijk']],
    ['Fatima', 'Het beste sportboek van het jaar. De wedstrijden zijn zo beschreven dat je het zweet bijna ruikt. En Fatima is een held met twijfels, en dat maakt haar echt.', 'pos', 'Fatima is een held met twijfels', ['Fatima is perfect', 'het boek gaat niet over sport']],
    ['Bas', 'Het idee is goed, maar het werkt niet. Elk hoofdstuk draait om hetzelfde probleem, en Bas verandert nooit. Na de helft heb ik het weggelegd.', 'neg', 'Bas verandert nooit', ['het idee is slecht', 'het boek is te kort']],
    ['Tegen de stroom in', 'Sara is een sterk en echt personage. Je ziet haar groeien, van onzeker meisje tot iemand die voor zichzelf opkomt. Wel had het verhaal wat korter gekund.', 'gem', 'sterk personage, maar het verhaal is wat lang', ['Sara blijft hetzelfde', 'het verhaal is te kort']]
  ];
  function maakRecensie(R, it){
    return OP('Welk argument geeft de recensent?', tekst(it[1], it[0]), [
      K(R, 'Wat vindt de recensent van het boek?', OORDEEL[it[2]], ['positief', 'negatief', 'positief én negatief'], OORDHINT[it[2]]),
      K(R, 'Welk argument geeft de recensent?', it[3], it[4], 'Kies het argument dat echt in de recensie staat, en dat past bij het oordeel: ' + OORDEEL[it[2]] + '.')
    ]);
  }

  /* boek kiezen: vier genres en vier onderwerpen */
  var KG = { sp:['een spannend boek', 'houdt van spanning'], gr:['een grappig boek', 'wil graag lachen om een boek'], fa:['een fantasyboek', 'houdt van magie en andere werelden'], hi:['een boek dat vroeger speelt', 'leest graag over vroeger'] };
  var KO = { sport:'sport', dier:'dieren', vriend:'vriendschap', fam:'familie' };
  var FLAP = [
    ['sp', 'sport', 'Doelpunt in het donker', 'Iemand saboteert de voetbalclub van Mo: kapotte doelen, gestolen shirts. Wie wil de club kapotmaken, vlak voor de finale?'],
    ['sp', 'dier', 'Het spoor van de wolf', 'In het bos bij Lotte verdwijnen schapen. Iedereen zegt dat het een wolf is, maar Lotte vindt sporen van iets anders.'],
    ['sp', 'vriend', 'Wie liegt er?', 'Vier vrienden, één geheim. Als een van hen verdwijnt, weet Noor zeker dat een van de andere drie liegt.'],
    ['sp', 'fam', 'Het testament', 'Na de dood van opa blijkt er een geheim testament te zijn. Ravi ontdekt dat iemand in zijn eigen familie het wil laten verdwijnen.'],
    ['gr', 'sport', 'Bankzitter Bas', 'Bas zit al drie seizoenen op de bank bij de slechtste hockeyclub van het land. Tot de hele selectie tegelijk griep krijgt.'],
    ['gr', 'dier', 'Mijn kat is de baas', 'Kat Miep vindt dat zij de baas is in huis. Ze heeft gelijk. Een dagboek vol kattenstreken.'],
    ['gr', 'vriend', 'Twee halve helden', 'Sem en Jip zijn beste vrienden en de onhandigste jongens van de school. Samen willen ze de schoolmusical redden. Wat kan er misgaan? Alles.'],
    ['gr', 'fam', 'Help, mijn opa gaat dansen', 'Opa Henk is zeventig en schrijft zich in voor een danswedstrijd op tv. Zijn kleindochter Fien moet zijn danspartner worden.'],
    ['fa', 'sport', 'De gouden bal', 'Wie de gouden bal schiet, kan nooit meer missen. Maar elk doelpunt kost Yara een herinnering.'],
    ['fa', 'dier', 'De draak in de schuur', 'Daan vindt een ei in de schuur van zijn oom. Er komt een draak uit, en die groeit elke dag een meter.'],
    ['fa', 'vriend', 'De poort van de nacht', 'Elke nacht om twaalf uur gaat er een poort open naar een andere wereld. Alleen samen kunnen Lina en Kofi de weg terug vinden.'],
    ['fa', 'fam', 'De heks in onze straat', 'Isa ontdekt dat haar oma een heks is, en dat de toverkracht in de familie zit. Ook bij haar.'],
    ['hi', 'sport', 'De schaatser van 1963', 'In de strenge winter van 1963 wil de vijftienjarige Klaas de Elfstedentocht rijden. Hij traint elke dag op de bevroren sloten bij zijn dorp.'],
    ['hi', 'dier', 'Het werkpaard', 'Amsterdam, 1900. Jan werkt met Bles, het paard dat de bierwagen trekt. Als Bles verkocht dreigt te worden, bedenkt Jan een plan.'],
    ['hi', 'vriend', 'Vriendinnen in oorlogstijd', 'Amsterdam, 1942. Sara is Joods, Lies niet. Hun vriendschap wordt op de proef gesteld als Sara moet onderduiken.'],
    ['hi', 'fam', 'De brieven van overgrootvader', 'In 1918 vertrekt Willem naar Amerika om werk te zoeken. Honderd jaar later leest zijn achterkleinzoon de brieven die hij naar huis stuurde.']
  ];
  var NAMEN = ['Sem', 'Lisa', 'Mo', 'Noor', 'Daan', 'Yara', 'Kofi', 'Fien', 'Ravi', 'Tess'];
  function maakKiezen(R){
    var doel = R.kies(FLAP), wie = R.kies(NAMEN);
    var g1 = R.kies(FLAP.filter(function(f){ return f[0] === doel[0] && f[1] !== doel[1]; }));
    var g2 = R.kies(FLAP.filter(function(f){ return f[1] === doel[1] && f[0] !== doel[0]; }));
    var drie = R.hussel([doel, g1, g2]), fm = {};
    fm[g1[2]] = 'Dat is wel het goede soort boek, maar het gaat niet over ' + KO[doel[1]] + '.';
    fm[g2[2]] = 'Dat gaat wel over ' + KO[doel[1]] + ', maar het is niet ' + KG[doel[0]][0] + '.';
    var ctx = '<p><b>' + wie + '</b> ' + KG[doel[0]][1] + ' en leest graag over ' + KO[doel[1]] + '.</p>' +
      tekst(drie.map(function(f){ return '<b>' + f[2] + '</b><br>' + f[3]; }));
    return OP('Welk boek past het best bij ' + wie + '?', ctx, [
      K(R, 'Wat voor boek zoekt ' + wie + '?', KG[doel[0]][0], Object.keys(KG).filter(function(x){ return x !== doel[0]; }).map(function(x){ return KG[x][0]; }), 'Lees de eerste zin: ' + wie + ' ' + KG[doel[0]][1] + '.'),
      K(R, 'Waar wil ' + wie + ' over lezen?', KO[doel[1]], Object.keys(KO).filter(function(x){ return x !== doel[1]; }).map(function(x){ return KO[x]; }), 'Lees het eind van de eerste zin.'),
      K(R, 'Welk boek past het best bij ' + wie + '?', doel[2], [g1[2], g2[2]], 'Zoek de flaptekst die ' + KG[doel[0]][0] + ' is én over ' + KO[doel[1]] + ' gaat.', fm)
    ]);
  }

  /* leesbeleving: [fragment, alleen wat er gebeurt, te vaag, goede beleving] */
  var BELEVING = [
    ['Tim gaat de donkere kelder in. Jij weet al dat er iemand staat, maar Tim weet het niet.', 'Tim ging de kelder in en daar stond iemand.', 'Het was wel spannend.', 'Ik werd zenuwachtig, omdat ik al wist dat er iemand in de kelder stond en Tim niet.'],
    ['Lotte neemt afscheid van haar oude hond.', 'Lotte nam afscheid van haar hond.', 'Het was zielig.', 'Ik moest bijna huilen, omdat ik zelf ook een oude hond heb en weet hoe dat voelt.'],
    ['Opa Henk valt tijdens de danswedstrijd op tv, en staat lachend weer op.', 'Opa viel en stond weer op.', 'Het was grappig.', 'Ik moest hardop lachen, omdat opa doordanste alsof er niets gebeurd was.'],
    ['Sara moet onderduiken en neemt afscheid van haar vriendin Lies.', 'Sara ging onderduiken.', 'Het deed me wel wat.', 'Ik werd er stil van, omdat ze niet wisten of ze elkaar ooit terug zouden zien.'],
    ['Mo krijgt eindelijk de bal en scoort in de laatste minuut.', 'Mo scoorde in de laatste minuut.', 'Het was leuk.', 'Ik juichte bijna mee, omdat ik het hele boek had gehoopt dat Mo zou scoren.'],
    ['Kai wordt in de klas uitgelachen, omdat hij zijn gehoorapparaat is vergeten.', 'Kai werd uitgelachen.', 'Ik vond het niet leuk.', 'Ik werd boos op de klas, omdat Kai er niets aan kon doen.'],
    ['Na tien jaar ziet Noor haar vader terug.', 'Noor zag haar vader terug.', 'Het was mooi.', 'Ik kreeg kippenvel, omdat Noor zo lang op dit moment had gewacht.'],
    ['De draak van Daan groeit zo snel dat hij door het dak van de schuur breekt.', 'De draak brak door het dak.', 'Het was een gek stuk.', 'Ik moest lachen en schrok tegelijk, omdat ik het zo voor me zag.'],
    ['Bas blijkt aan het eind de dief te zijn.', 'Bas was de dief.', 'Het einde was apart.', 'Ik was echt verrast, omdat Bas het hele boek de aardigste jongen leek.'],
    ['Fenna loopt na een jaar oefenen de schoolrun uit.', 'Fenna liep de run uit.', 'Het was een mooi einde.', 'Ik was trots op Fenna, omdat ik had gelezen hoe zwaar het voor haar was.'],
    ['Jesse verraadt zijn beste vriend om bij de populaire groep te horen.', 'Jesse verraadde zijn vriend.', 'Ik vond het niks.', 'Ik ergerde me aan Jesse, omdat zijn vriend altijd voor hem klaarstond.'],
    ['Lina vindt haar kat terug in de schuur van de buurjongen.', 'Lina vond haar kat terug.', 'Het was fijn.', 'Ik was opgelucht, omdat ik al bang was dat de kat dood was.'],
    ['Yara laat haar tekeningen eindelijk aan haar moeder zien, en haar moeder huilt.', 'Yara liet haar tekeningen zien.', 'Het was een ontroerend stuk.', 'Ik werd er warm van, omdat haar moeder eindelijk zag wat Yara kon.'],
    ['In het oude huis gaat midden in de nacht vanzelf de muziekdoos spelen.', 'De muziekdoos ging vanzelf spelen.', 'Het was eng.', 'Ik durfde bijna niet verder te lezen, omdat ik me voorstelde dat het in mijn eigen huis gebeurde.']
  ];
  function maakBeleving(R, it){
    var fm = {}; fm[it[1]] = 'Dat vertelt alleen wat er gebeurt, niet wat jij voelde.'; fm[it[2]] = 'Daar staat geen reden bij: waardoor voelde je dat?';
    return OP('Welke zin verwoordt je leeservaring het best?', tekst('<i>Je las:</i> ' + it[0]), [
      K(R, 'Welke zin vertelt alleen wat er gebeurt?', it[1], [it[2], it[3]], 'Zoek de zin zonder gevoel: alleen wat er in het boek gebeurt.'),
      K(R, 'Welke zin is te vaag: er staat geen reden bij?', it[2], [it[1], it[3]], 'Zoek de korte zin met een gevoel, maar zonder omdat.'),
      K(R, 'Welke zin verwoordt je leeservaring het best?', it[3], [it[1], it[2]], 'Kies de zin met een gevoel én een reden: omdat ...', fm)
    ]);
  }

  /* wat leer je: [verhaal, inzicht, te letterlijk, klopt niet] */
  var LEREN = [
    ['Kai is doof. Op zijn nieuwe school wordt hij eerst buitengesloten. Als hij een klasgenoot gebarentaal leert, worden ze vrienden.', 'Iemand die anders is, wil gewoon meedoen. Als je moeite doet, kun je elkaar leren kennen.', 'Gebarentaal is een taal met je handen.', 'Dove mensen willen geen vrienden.'],
    ['Sem durft niet te zingen voor publiek. Met hulp van zijn vrienden doet hij toch mee aan de talentenshow. Het gaat niet perfect, maar hij is trots.', 'Je hoeft niet perfect te zijn om trots te mogen zijn op iets wat je eng vond.', 'Een talentenshow is op een podium.', 'Als je bang bent, kun je beter niets doen.'],
    ['Lisa vertelt het geheim van haar vriendin door, en de vriendschap gaat kapot.', 'Vertrouwen is snel kapot en moeilijk te herstellen.', 'Lisa had een vriendin met een geheim.', 'Geheimen doorvertellen maakt vriendschappen sterker.'],
    ['Kofi komt uit Ghana en woont pas een jaar in Nederland. Hij snapt de grapjes niet en mist zijn familie.', 'Ik snap nu beter hoe het voelt voor iemand die net in Nederland komt wonen.', 'Ghana ligt in Afrika.', 'Nieuwe leerlingen hebben het altijd makkelijk.'],
    ['Een oude man woont alleen. Elke dag wacht hij bij het raam op de postbode, alleen om even iemand te spreken.', 'Een kort praatje kan heel veel betekenen voor iemand die alleen is.', 'De postbode komt elke dag.', 'Oude mensen willen het liefst niemand zien.'],
    ['Jesse verraadt zijn beste vriend om bij de populaire groep te horen. Daarna heeft hij geen echte vrienden meer.', 'Echte vrienden zijn belangrijker dan populair zijn.', 'Jesse zit op een middelbare school.', 'Verraad maakt je populair.'],
    ['Lotte slaapt altijd met het licht aan. Als haar broertje bang is in het donker, moet zij hem helpen. Zo overwint ze haar eigen angst.', 'Door een ander te helpen, kun je zelf sterker worden.', 'Lotte heeft een broertje.', 'Je moet altijd met het licht aan slapen.'],
    ['In haar dagboek schrijft Anne Frank dat ze, ondanks alles, nog steeds gelooft dat mensen vanbinnen goed zijn.', 'Ook in een heel moeilijke tijd kun je hoop houden.', 'Anne schreef in een dagboek.', 'In de oorlog was het leven makkelijk.'],
    ['De spaarpot van Daan wordt gestolen. Zijn buren laten hem klusjes doen, zodat hij toch zijn fiets kan kopen.', 'Als je pech hebt, kunnen mensen om je heen je helpen.', 'Daan wilde een fiets kopen.', 'Je kunt buren nooit vertrouwen.'],
    ['Sara wil danseres worden, maar haar vader wil dat ze het familiebedrijf overneemt. Ze kiest toch voor haar droom.', 'Je eigen droom volgen kan belangrijk zijn, ook als anderen iets anders van je verwachten.', 'Sara’s vader heeft een bedrijf.', 'Je moet altijd doen wat je ouders zeggen.'],
    ['Kevin pest jongere kinderen. Als hij zelf gepest wordt op zijn nieuwe club, snapt hij hoe dat voelt.', 'Soms snap je pas hoe een ander zich voelt als je het zelf meemaakt.', 'Kevin zit op een club.', 'Pesten is niet zo erg.'],
    ['In het verhaal van Saïdjah wordt de buffel van een arme boer afgepakt door machtige mensen.', 'Ik snap beter hoe oneerlijk het voor arme mensen in de kolonie was.', 'Een buffel is een sterk dier.', 'Machtige mensen zijn altijd eerlijk.'],
    ['Yara wil alles alleen doen. Pas als ze om hulp vraagt, lukt het project.', 'Hulp vragen is geen zwakte.', 'Yara deed een project.', 'Je moet alles altijd alleen doen.'],
    ['Ravi laat zijn tekeningen aan niemand zien. Als hij er toch één inlevert voor een wedstrijd, vinden veel mensen hem prachtig.', 'Als je jezelf durft te laten zien, ontdek je dat anderen je werk waarderen.', 'Ravi maakt tekeningen.', 'Je kunt je werk beter verstoppen.']
  ];
  function maakLeren(R, it){
    var fm = {}; fm[it[2]] = 'Dat is alleen een feitje uit het verhaal, geen les.'; fm[it[3]] = 'Dat past niet bij het verhaal: daar gebeurt juist het omgekeerde.';
    return OP('Wat kun je van dit verhaal leren?', tekst(it[0]), [
      K(R, 'Welke zin is alleen een feitje uit het verhaal, geen les?', it[2], [it[1], it[3]], 'Een feitje vertelt gewoon iets wat in het verhaal staat. Het zegt niets over jezelf of over anderen.'),
      K(R, 'Wat kun je van dit verhaal leren?', it[1], [it[2], it[3]], 'Kies de zin die iets zegt over mensen in het algemeen, en die past bij wat er in het verhaal gebeurt.', fm)
    ]);
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'lit-mening', niveau:'1F', domein:'fictie', naam:'Lezen en vinden', kd:['nl8A.b', 'nl8A.d', 'nl8B.a', 'nl8B.b', 'nl8B.c'],
        uit:'Wat vind jij van een boek, en waarom? Hier leer je je mening te onderbouwen, een recensie te lezen, een boek te kiezen dat bij je past, en te zeggen wat een verhaal met je doet.' },
      doelen:[
        { id:'lit-mening-onderbouw', naam:'Je mening onderbouwen', kort:'Een goed argument noemt iets concreets uit het boek zelf',
          uit:'<p>Een mening over een boek is sterker met een goed <b>argument</b>.</p><p>Een goed argument gaat over <b>het boek zelf</b>: het verhaal, de personages of hoe het geschreven is. <i>Elk hoofdstuk eindigt spannend.</i></p><p>Een zwak argument gaat over iets anders (<i>mijn vriend vond het ook goed</i>) of is te <b>vaag</b> (<i>het is gewoon leuk</i>).</p>',
          wanneer:'je een boekverslag schrijft of in de klas over een boek praat.',
          maak:function(R){ return maakOnderbouw(R, R.kies(ONDERBOUW)); } },
        { id:'lit-mening-recensie', naam:'Een recensie lezen', kort:'Zoek het oordeel van de recensent, en het argument erbij',
          uit:'<p>In een <b>recensie</b> geeft iemand zijn <b>oordeel</b> over een boek, film of game, met <b>argumenten</b>.</p><p>Zoek eerst het oordeel: positief, negatief, of allebei. Let op woorden als <i>aanrader, saai, jammer, maar, wel</i>.</p><p>Zoek dan het argument: waarom vindt de recensent dat?</p>',
          wanneer:'je wilt weten of een boek de moeite waard is.',
          maak:function(R){ return maakRecensie(R, R.kies(RECENSIE)); } },
        { id:'lit-mening-kiezen', naam:'Een boek kiezen dat bij je past', kort:'Weet wat je zoekt, en lees de flaptekst',
          uit:'<p>Een boek kiezen doe je in twee stappen.</p><p>1 Weet wat je zoekt: welk <b>soort boek</b> (spannend, grappig, fantasy, over vroeger) en welk <b>onderwerp</b> (sport, dieren, vriendschap, familie).</p><p>2 Lees de <b>flaptekst</b> op de achterkant. Past het bij allebei? Dan heb je een goede kans dat je het leuk vindt.</p>',
          wanneer:'je in de bibliotheek een nieuw boek zoekt.',
          maak:function(R){ return maakKiezen(R); } },
        { id:'lit-mening-beleving', naam:'Je leeservaring verwoorden', kort:'Zeg wat je voelde én waardoor',
          uit:'<p>Wat deed het boek met jou? Dat is je <b>leeservaring</b>.</p><p>Vertel niet alleen wat er gebeurt, en zeg niet alleen <i>het was spannend</i>. Zeg wat je <b>voelde</b> en <b>waardoor</b>: <i>Ik werd zenuwachtig, omdat ik al wist dat er iemand in de kelder stond.</i></p>',
          wanneer:'je in een boekverslag of gesprek vertelt wat een boek met je deed.',
          maak:function(R){ return maakBeleving(R, R.kies(BELEVING)); } },
        { id:'lit-mening-leren', naam:'Wat leer je van een verhaal?', kort:'Een verhaal leert je iets over jezelf, over anderen of over de wereld',
          uit:'<p>Een verhaal kan je iets <b>leren</b>: over jezelf, over andere mensen of over de wereld.</p><p>Dat is geen feitje uit het verhaal (<i>Kai is doof</i>), maar iets wat je <b>breder</b> kunt zeggen: <i>Iemand die anders is, wil gewoon meedoen.</i></p><p>Check of je les echt past bij wat er in het verhaal gebeurt.</p>',
          wanneer:'een vraag zegt: wat heb je van dit boek geleerd?',
          maak:function(R){ return maakLeren(R, R.kies(LEREN)); } }
      ] }
  ]);

  /* ================= GESPREKKEN IN SITUATIES ================= */

  /* bellen: [situatie, vraag goed, vaag, bot] */
  var BEL = [
    ['Je belt de tandarts om een afspraak te maken.', 'Ik wil graag een afspraak maken voor een controle. Kan dat volgende week?', 'Ja, het gaat over mijn tanden en zo.', 'Ik moet een afspraak, nu meteen.'],
    ['Je belt de sportschool om te vragen of je een gratis proefles kunt doen.', 'Ik wil graag vragen of ik een gratis proefles kan doen.', 'Ik wil iets met sporten.', 'Geef me even een gratis les.'],
    ['Je belt een winkel om te vragen of je bestelling al binnen is.', 'Ik heb vorige week een jas besteld. Is die al binnen?', 'Is mijn ding er al?', 'Waarom duurt het zo lang met mijn jas?'],
    ['Je belt de huisarts, omdat je al drie dagen koorts hebt.', 'Ik heb al drie dagen koorts. Kan ik vandaag langskomen?', 'Ik voel me niet zo lekker en zo.', 'Ik moet nu de dokter spreken.'],
    ['Je belt de bibliotheek, omdat je een geleend boek kwijt bent.', 'Ik ben een boek van de bibliotheek kwijtgeraakt. Wat moet ik nu doen?', 'Er is iets met een boek.', 'Dat boek is weg, dat is niet mijn schuld.'],
    ['Je belt een restaurant om een tafel te reserveren voor de verjaardag van je moeder.', 'Ik wil graag een tafel reserveren voor vier personen, zaterdag om zes uur.', 'Hebben jullie nog ergens plek?', 'Zet ons zaterdag maar ergens neer.'],
    ['Je belt de school, omdat je ziek bent en niet kunt komen.', 'Ik wil me ziek melden. Ik zit in klas 2B en ik heb koorts.', 'Ik kom niet.', 'Zeg maar tegen iedereen dat ik er niet ben.'],
    ['Je belt het zwembad om te vragen hoe laat het open is.', 'Ik wil graag weten hoe laat het zwembad zondag open is.', 'Wanneer kan ik eigenlijk komen enzo?', 'Zeg even hoe laat jullie open zijn.'],
    ['Je belt de fietsenmaker, omdat je band lek is.', 'Mijn achterband is lek. Kan ik mijn fiets morgen brengen?', 'Mijn fiets doet raar.', 'Mijn fiets moet vandaag nog klaar.'],
    ['Je belt een bedrijf om te vragen of ze een stageplek hebben.', 'Ik zoek een stageplek voor school, in april. Hebben jullie misschien plek?', 'Hebben jullie iets voor mij?', 'Jullie moeten mij een stageplek geven.'],
    ['Je belt de bioscoop, omdat je je telefoon daar hebt laten liggen.', 'Ik heb gisteravond mijn telefoon in zaal 3 laten liggen. Is hij gevonden?', 'Is er iets gevonden?', 'Iemand bij jullie heeft mijn telefoon gepakt.'],
    ['Je belt de kapper om een afspraak te verzetten.', 'Ik heb morgen om vier uur een afspraak, maar dan kan ik niet. Kan het op een andere dag?', 'Het lukt niet met mijn afspraak.', 'Ik kom morgen niet, regel maar iets anders.'],
    ['Je belt de dierenarts, omdat je kat niet meer eet.', 'Mijn kat eet al twee dagen niet. Kan ik vandaag langskomen?', 'Er is iets met mijn kat.', 'Jullie moeten nu naar mijn kat kijken.'],
    ['Je belt het theater om te vragen of er nog kaartjes zijn.', 'Zijn er nog kaartjes voor de voorstelling van zaterdagavond?', 'Is er nog iets voor zaterdag?', 'Hou twee kaartjes voor me apart.']
  ];
  var BELLER = ['Sanne de Vries', 'Mo el Amrani', 'Daan Bakker', 'Lisa Jansen', 'Kofi Mensah', 'Yara Visser', 'Tim de Jong', 'Noor Hendriks'];
  var GROET = ['Goedemorgen', 'Goedemiddag'];
  function maakBellen(R, it){
    var naam = R.kies(BELLER), groet = R.kies(GROET);
    var open = groet + ', u spreekt met ' + naam + '.', fm = {};
    fm['Hallo, wie is dit?'] = 'Jij belt. Dan noem je eerst zelf je naam.';
    fm['Ik heb een vraag.'] = 'Begin met een groet en je naam, dan weet de ander wie er belt.';
    fm[it[2]] = 'Dat is te vaag: de ander weet nog niet wat je wilt.'; fm[it[3]] = 'Dat is onbeleefd. Vraag het vriendelijk en duidelijk.';
    var dank = 'Dank u wel voor uw hulp. Tot ziens!';
    return OP('Hoe stel je je vraag?', tekst(it[0] + ' Je heet ' + naam + '.'), [
      K(R, 'Hoe begin je het gesprek?', open, ['Hallo, wie is dit?', 'Ik heb een vraag.'], 'Jij belt: begin met een groet en noem je voor- en achternaam.', fm),
      K(R, 'Hoe stel je je vraag?', it[1], [it[2], it[3]], 'Zeg in één of twee zinnen precies wat je wilt, en vraag het beleefd.', fm),
      K(R, 'Hoe sluit je het gesprek af?', dank, ['Oké, doei.', 'Je hangt meteen op zonder iets te zeggen.'], 'Bedank de ander en neem netjes afscheid.')
    ], 1);
  }

  /* klacht: [situatie, opening, feit, verwijt, overdreven, oplossing, eis, vaag] */
  var KLACHT = [
    ['Je nieuwe broek is na één keer wassen gescheurd.', 'Goedemiddag, ik kom over de broek die ik vorige week hier kocht.', 'De naad is na één keer wassen gescheurd.', 'Jullie verkopen echt alleen maar rommel.', 'Dit is het slechtste product ter wereld.', 'Kan ik hem ruilen of mijn geld terugkrijgen?', 'Ik wil mijn geld terug en een nieuwe broek, gratis.', 'Doe er maar iets aan.'],
    ['Je pizza wordt een uur te laat en koud bezorgd.', 'Goedenavond, ik bel over mijn bestelling van vanavond.', 'De pizza kwam een uur te laat, en hij was koud.', 'Jullie bezorger is echt een slak.', 'Ik ben bijna verhongerd door jullie.', 'Kunt u een nieuwe pizza sturen of het geld terugbetalen?', 'Ik wil de hele maand gratis pizza.', 'Ik wil gewoon dat het goed komt.'],
    ['Je koptelefoon doet het na twee weken al niet meer.', 'Goedemiddag, ik kom over de koptelefoon die ik twee weken geleden kocht.', 'Het linkeroortje geeft geen geluid meer.', 'Jullie verkopen expres kapotte spullen.', 'Het is het slechtste wat ik ooit gekocht heb.', 'Valt dit onder de garantie? Kan hij gemaakt of geruild worden?', 'Geef me meteen de duurste koptelefoon die u heeft.', 'Doe maar wat.'],
    ['In de bioscoop zit je naast een groepje dat de hele film door praat. Je gaat naar een medewerker.', 'Sorry, mag ik iets vragen over zaal 2?', 'Het groepje naast me praat de hele film door. Ik kan de film niet volgen.', 'Jullie laten hier ook iedereen binnen.', 'Ik heb nog nooit zoveel herrie meegemaakt.', 'Kunt u ze vragen stil te zijn, of mag ik op een andere plek zitten?', 'Gooi ze er nu meteen uit.', 'Kunt u iets doen?'],
    ['Je krijgt een cijfer dat volgens jou niet klopt: de punten zijn verkeerd opgeteld.', 'Meneer, mag ik iets vragen over mijn toets van vorige week?', 'Als ik de punten optel, kom ik op 34 en niet op 30.', 'U kunt niet eens rekenen.', 'U heeft mijn hele rapport verpest.', 'Wilt u de punten nog een keer nakijken?', 'Ik wil gewoon een tien.', 'Er klopt iets niet, denk ik.'],
    ['De buren hebben ’s nachts steeds harde muziek aan.', 'Hallo, mag ik even iets vragen over de muziek van gisteravond?', 'Gisteravond stond de muziek tot twee uur ’s nachts hard aan. Ik kon niet slapen.', 'Jullie zijn echt asociaal.', 'Ik heb al een maand geen oog dichtgedaan.', 'Zou de muziek na elf uur zachter kunnen?', 'Jullie moeten verhuizen.', 'Kan het een beetje anders?'],
    ['Het broodje dat je in de schoolkantine kocht, is oud en hard.', 'Sorry, ik heb een probleem met het broodje dat ik net kocht.', 'Het broodje is hard, en de datum op het zakje is van gisteren.', 'Jullie verkopen afval.', 'Ik had wel dood kunnen gaan.', 'Mag ik een vers broodje in plaats van dit?', 'Ik wil de hele week gratis eten.', 'Dit is niet echt goed.'],
    ['Je trein viel uit, en je kwam een uur te laat. Je belt de klantenservice.', 'Goedemiddag, ik bel over mijn reis van vanochtend.', 'Mijn trein van 8.12 uur viel uit, daardoor kwam ik een uur te laat.', 'Bij jullie gaat ook alles altijd mis.', 'Door jullie is mijn hele leven verpest.', 'Kan ik mijn reisgeld terugkrijgen?', 'Ik wil een jaar lang gratis reizen.', 'Ik wil iets terug.'],
    ['Het boek dat je online bestelde, komt beschadigd aan. Je belt de winkel.', 'Goedemorgen, ik bel over mijn bestelling met nummer 4471.', 'De kaft is gescheurd en een paar bladzijden zijn nat.', 'Jullie pakken alles slordig in.', 'Het boek is totaal vernield, er is niets meer van over.', 'Kunt u een nieuw exemplaar sturen?', 'Stuur me tien boeken extra.', 'Ik wil dat jullie het oplossen.'],
    ['Je groepsgenoot doet al twee weken niets voor jullie project.', 'Hoi, kan ik even met je praten over ons project?', 'Je hebt de afgelopen twee weken nog niets ingeleverd voor ons project.', 'Jij bent gewoon lui.', 'Jij doet nooit ergens iets.', 'Kun jij vóór vrijdag de inleiding schrijven?', 'Jij moet nu alles alleen doen.', 'Doe eens wat meer.'],
    ['De kapper heeft je haar veel korter geknipt dan je vroeg.', 'Sorry, mag ik even iets zeggen over mijn haar?', 'Ik had gevraagd om twee centimeter eraf, maar het is veel korter geworden.', 'U kunt echt niet knippen.', 'Ik kan zo nooit meer naar buiten.', 'Kunt u het zo bijwerken dat het netjes wordt?', 'Ik betaal hier helemaal niks voor.', 'Het is niet wat ik wilde.'],
    ['De wifi in je hotelkamer werkt al twee dagen niet.', 'Goedemorgen, ik wil iets melden over de wifi op mijn kamer.', 'Op kamer 214 werkt de wifi al twee dagen niet.', 'Dit hotel is één grote grap.', 'Ik zit hier al dagen afgesloten van de wereld.', 'Kan iemand ernaar kijken, of kan ik een andere kamer krijgen?', 'Ik wil mijn hele verblijf gratis.', 'Kunt u er iets aan doen?'],
    ['Je kreeg in de sportwinkel te weinig wisselgeld terug.', 'Sorry, ik denk dat er iets misging bij het afrekenen.', 'Ik betaalde met twintig euro voor iets van twaalf euro, maar ik kreeg maar drie euro terug.', 'U probeert me op te lichten.', 'U steelt van al uw klanten.', 'Wilt u het nog even narekenen?', 'Geef me die schoenen dan maar gratis.', 'Er klopt iets niet.'],
    ['De nieuwe app van school logt je steeds uit, waardoor je je huiswerk niet ziet.', 'Goedemiddag, ik wil een probleem met de app melden.', 'Ik word elke keer na een minuut uitgelogd, en dan zie ik mijn huiswerk niet.', 'Wie heeft deze app gemaakt, een kleuter?', 'De app werkt nooit, bij niemand.', 'Kunt u kijken wat er misgaat met mijn account?', 'Dan hoef ik dus geen huiswerk meer te maken.', 'Hij doet raar.']
  ];
  function maakKlacht(R, it){
    var fm = {};
    fm[it[3]] = 'Dat is een verwijt. Dan gaat de ander in de verdediging.'; fm[it[4]] = 'Dat is overdreven. Noem gewoon wat er echt mis is.';
    fm[it[6]] = 'Dat is te veel geëist. Vraag iets wat redelijk is.'; fm[it[7]] = 'Dat is te vaag: de ander weet niet wat je wilt.';
    return OP('Wat vraag je?', tekst(it[0]), [
      K(R, 'Hoe begin je?', it[1], ['Ik ben echt woedend!', 'Dit pik ik niet langer!'], 'Begin rustig en beleefd, en zeg waar het over gaat.'),
      K(R, 'Hoe vertel je wat er mis is?', it[2], [it[3], it[4]], 'Noem precies wat er gebeurd is, zonder verwijt en zonder te overdrijven.', fm),
      K(R, 'Wat vraag je?', it[5], [it[6], it[7]], 'Vraag een redelijke, duidelijke oplossing.', fm)
    ]);
  }

  /* sollicitatie: [baan, sterk punt, niet relevant, negatief, goede vraag, onvoorbereid, ongepast] */
  var SOLL = [
    ['vakkenvuller in de supermarkt', 'Ik werk netjes en ik ben altijd op tijd. Thuis heb ik ook vaste taken.', 'Ik ben heel goed in gamen.', 'Ik kom vaak te laat, maar dat is niet zo erg.', 'Op welke dagen en tijden zou ik moeten werken?', 'Wat voor winkel is dit eigenlijk?', 'Mag ik ook thuisblijven als ik geen zin heb?'],
    ['folderbezorger', 'Ik fiets graag en ik ken de wijk goed.', 'Ik vind pizza lekker.', 'Ik kom afspraken niet altijd na.', 'Hoeveel folders moet ik per week bezorgen, en in welke straten?', 'Wat moet ik eigenlijk bezorgen?', 'Mag ik de folders ook in de container gooien?'],
    ['hulp in de keuken van een restaurant', 'Ik kook thuis vaak en ik kan goed samenwerken.', 'Ik heb drie katten.', 'Ik hou niet van afwassen en opruimen.', 'Wat zou ik op een gewone avond allemaal doen?', 'Is dit een restaurant of een snackbar?', 'Mag ik gratis eten meenemen voor mijn vrienden?'],
    ['hulp bij de buitenschoolse opvang', 'Ik pas vaak op mijn neefjes en ik bedenk graag spelletjes.', 'Ik ben fan van een voetbalclub.', 'Kinderen vind ik eigenlijk vaak irritant.', 'Met hoeveel kinderen werk ik, en wie helpt me als ik iets niet weet?', 'Wat doen jullie hier precies?', 'Mag ik tijdens het werk op mijn telefoon?'],
    ['medewerker bij een tuincentrum', 'Ik help mijn opa vaak in de tuin en ik werk graag buiten.', 'Ik kan goed tekenen.', 'Ik heb een hekel aan vies worden.', 'Werk ik vooral buiten, of ook in de winkel?', 'Verkopen jullie ook planten?', 'Hoe lang duurt de pauze? Daar heb ik het meeste zin in.'],
    ['kassamedewerker bij een bakker', 'Ik kan goed rekenen en ik ben vriendelijk tegen mensen.', 'Ik heb een nieuwe telefoon.', 'Ik praat niet graag met onbekende mensen.', 'Leer ik eerst hoe de kassa werkt, en van wie?', 'Verkopen jullie ook brood?', 'Krijgt mijn hele familie korting op taarten?'],
    ['hulp bij een dierenwinkel', 'Ik heb zelf konijnen en ik weet hoe je dieren verzorgt.', 'Mijn lievelingskleur is blauw.', 'Ik vind het schoonmaken van hokken vies.', 'Moet ik ook de dieren voeren en de hokken schoonmaken?', 'Hebben jullie eigenlijk dieren?', 'Mag ik een hamster mee naar huis nemen?'],
    ['bijlesgever wiskunde voor een brugklasser', 'Ik haal hoge cijfers voor wiskunde en ik kan dingen geduldig uitleggen.', 'Ik zit op hiphopdans.', 'Ik word snel boos als iemand iets niet snapt.', 'Met welke onderwerpen heeft hij de meeste moeite?', 'Over welk vak gaat het?', 'Mag ik de antwoorden gewoon voorzeggen?'],
    ['ijsverkoper op het strand', 'Ik ben vrolijk, ik kan goed tegen warmte en ik ben snel met geld.', 'Ik heb een broertje.', 'Ik werk niet graag als het druk is.', 'Hoeveel uur werk ik op een zonnige dag?', 'Verkopen jullie ijs?', 'Mag ik zelf de hele dag ijs eten?'],
    ['hulp bij de bibliotheek', 'Ik lees veel en ik werk netjes en precies.', 'Ik kan goed zingen.', 'Ik vind stil zijn heel moeilijk.', 'Help ik vooral met boeken terugzetten, of ook bij de balie?', 'Lenen jullie boeken uit?', 'Mag ik boeken gratis houden?'],
    ['schoonmaker in een sporthal', 'Ik werk graag zelfstandig en ik maak dingen grondig schoon.', 'Ik volg een serie op tv.', 'Ik laat dingen soms liggen als niemand het ziet.', 'Welke ruimtes moet ik schoonmaken, en hoe laat begin ik?', 'Wat moet ik hier eigenlijk doen?', 'Mag ik sporten in plaats van schoonmaken?'],
    ['medewerker in een fietsenwinkel', 'Ik repareer mijn eigen fiets en ik weet veel van fietsen.', 'Ik heb een hond.', 'Ik kan niet zo goed met gereedschap.', 'Doe ik ook reparaties, of help ik vooral in de winkel?', 'Verkopen jullie fietsen?', 'Mag ik een fiets lenen voor de vakantie?'],
    ['koffieschenker in een zorgcentrum', 'Ik praat graag met ouderen en ik ben geduldig.', 'Ik verzamel munten.', 'Ik vind oude mensen saai.', 'Help ik ook bij activiteiten, zoals spelletjes?', 'Wonen hier mensen?', 'Mag ik oortjes in tijdens het werk?']
  ];
  function maakSoll(R, it){
    var fm = {};
    fm[it[2]] = 'Dat heeft niets met deze baan te maken.'; fm[it[3]] = 'Daarmee laat je zien waarom ze je juist níet moeten nemen.';
    fm[it[5]] = 'Dan laat je zien dat je je niet hebt voorbereid.'; fm[it[6]] = 'Dat is geen gepaste vraag in een sollicitatiegesprek.';
    return OP('Welke vraag stel jij aan het eind?', tekst('Je solliciteert als <b>' + it[0] + '</b>.'), [
      K(R, 'Wat vertel je over jezelf?', it[1], [it[2], it[3]], 'Noem iets wat je goed kunt en wat past bij werken als ' + it[0] + '.', fm),
      K(R, 'Welke vraag stel jij aan het eind?', it[4], [it[5], it[6]], 'Stel een vraag over het werk zelf, die laat zien dat je je hebt voorbereid.', fm)
    ]);
  }

  /* afspraak maken: [situatie, goed, vaag, bot]; afzeggen: [situatie, goed, vaag, bot] */
  var MAKEN = [
    ['Je wilt met je klasgenoot afspreken om aan jullie werkstuk te werken.', 'Zullen we donderdag om vier uur in de bieb aan ons werkstuk werken?', 'Zullen we een keer afspreken?', 'We werken donderdag aan het werkstuk, jij regelt de rest.'],
    ['Je wilt met je oma samen naar de markt.', 'Oma, zullen we zaterdag om tien uur naar de markt? Ik kom je thuis ophalen.', 'Oma, gaan we binnenkort naar de markt?', 'Oma, morgen markt.'],
    ['Je wilt met je teamgenoten extra trainen.', 'Zullen we woensdag om half vijf op het veld bij de club extra trainen?', 'Wie wil er een keer extra trainen?', 'Iedereen komt woensdag, anders lig je eruit.'],
    ['Je wilt met je mentor praten over je cijfers.', 'Heeft u dinsdag na het zevende uur tijd voor een gesprek in uw lokaal?', 'Kunnen we een keer praten?', 'Ik kom straks wel even langs.'],
    ['Je wilt met een vriend naar de film.', 'Zullen we vrijdag naar de film van half acht? Dan zien we elkaar om kwart over zeven bij de ingang.', 'Zin om een keer naar de film te gaan?', 'Vrijdag film, jij regelt de kaartjes.'],
    ['Je wilt je buurvrouw helpen met boodschappen.', 'Zal ik maandag om drie uur bij u aanbellen om samen boodschappen te doen?', 'Ik kan u een keer helpen.', 'Ik kom wel als ik tijd heb.'],
    ['Je wilt met je groepje de presentatie oefenen.', 'Zullen we morgen in de grote pauze in lokaal 12 de presentatie oefenen?', 'We moeten nog een keer oefenen.', 'Oefen het zelf maar thuis.'],
    ['Je wilt met je neef gaan zwemmen.', 'Zullen we zondag om twee uur bij de ingang van het zwembad afspreken?', 'Gaan we binnenkort zwemmen?', 'Zondag zwemmen, ik zie wel wanneer.']
  ];
  var AFZEG = [
    ['Je kunt morgen niet naar je bijbaan, omdat je ziek bent.', 'Sorry, ik ben ziek en kan morgen niet komen werken. Zal ik volgende week een extra dienst doen?', 'Ik kom morgen niet.', 'Ik heb geen zin, dus ik kom niet.'],
    ['Je kunt zaterdag niet afspreken met je vriendin, omdat je moet oppassen.', 'Sorry, ik moet zaterdag oppassen op mijn broertje. Kunnen we zondag afspreken?', 'Zaterdag gaat niet.', 'Ik zie je wel een keer.'],
    ['Je kunt donderdag niet naar de tandarts, omdat je dan een toets hebt.', 'Goedemorgen, helaas moet ik mijn afspraak van donderdag afzeggen, want ik heb dan een toets. Kan het op vrijdag?', 'Ik kan donderdag niet.', 'Ik kom gewoon niet, dat zien jullie wel.'],
    ['Je kunt vanavond niet naar de training, omdat je oma jarig is.', 'Sorry, ik kan vanavond niet, want mijn oma is jarig. Donderdag ben ik er weer.', 'Ik ben er niet.', 'Ik sla vandaag over.'],
    ['Je kunt niet naar het groepsoverleg, omdat je bus uitvalt.', 'Sorry, mijn bus valt uit, dus ik ben er om vier uur niet. Kunnen we om vijf uur online overleggen?', 'Ik ben er niet.', 'Doe het maar zonder mij.'],
    ['Je kunt niet naar de verjaardag van je neef, omdat je moet werken.', 'Sorry, ik moet zaterdag werken en kan niet op je feestje komen. Zal ik zondag langskomen met je cadeau?', 'Ik kan niet komen.', 'Ik heb wel wat beters te doen.'],
    ['Je kunt woensdag niet naar de bijles, omdat je naar het ziekenhuis moet voor een controle.', 'Sorry, ik moet woensdag naar het ziekenhuis voor een controle. Kan de bijles op vrijdag?', 'Woensdag lukt niet.', 'Bijles is toch saai, ik kom niet.']
  ];
  var NOEMEN = { maken:'de dag, de tijd en de plek', afzeg:'sorry, de reden en een nieuw voorstel' };
  function maakAfspraak(R){
    var afz = Math.random() < 0.47, it = R.kies(afz ? AFZEG : MAKEN), fm = {};
    fm[it[2]] = afz ? 'Er staat geen reden en geen nieuw voorstel in.' : 'Dan weet de ander nog niet wanneer en waar.';
    fm[it[3]] = 'Dat is onbeleefd of onduidelijk.';
    var st = [
      K(R, 'Wat moet je allemaal noemen?', afz ? NOEMEN.afzeg : NOEMEN.maken, [afz ? NOEMEN.maken : NOEMEN.afzeg, 'alleen dat het niet lukt'], afz ? 'Je zegt een afspraak af. Wat wil de ander dan weten?' : 'Je maakt een afspraak. Wat moet de ander weten om er te zijn?'),
      K(R, 'Welke zin is het best?', it[1], [it[2], it[3]], afz ? 'Zoek de zin met sorry, een reden en een nieuw voorstel.' : 'Zoek de zin met een dag, een tijd en een plek.', fm)
    ];
    if (afz) st.unshift(K(R, 'Wanneer zeg je de afspraak af?', 'zo snel mogelijk, zodra je weet dat het niet lukt', ['vijf minuten van tevoren', 'helemaal niet, het valt vast niet op'], 'Hoe eerder de ander het weet, hoe beter die er rekening mee kan houden.'));
    else st.push(K(R, 'Hoe zorg je dat jullie hetzelfde hebben afgesproken?', 'Je herhaalt de afspraak nog even kort.', ['Je gaat ervan uit dat de ander het wel weet.', 'Je vraagt de dag ervoor: wanneer was het ook alweer?'], 'Door de afspraak te herhalen, merk je meteen of jullie hetzelfde bedoelen.'));
    var i = afz ? 2 : 1;
    return OP('Welke zin is het best?', tekst(it[0]), st, i);
  }

  /* non-verbaal: [beschrijving, signaal, betekenis, [fout]] */
  var SIGNAAL = ['oogcontact', 'houding', 'gezichtsuitdrukking', 'stem', 'gebaren'];
  var NONVERB = [
    ['Terwijl jij praat, kijkt Mo steeds op zijn telefoon in plaats van naar jou.', 'oogcontact', 'hij luistert niet echt', ['hij is heel geïnteresseerd', 'hij is verdrietig']],
    ['Lisa zit met haar armen over elkaar en draait haar rug half naar de groep.', 'houding', 'ze doet niet mee of is het er niet mee eens', ['ze is blij en ontspannen', 'ze wil graag het woord']],
    ['Je klasgenoot praat heel zacht en langzaam als hij over zijn cijfer vertelt.', 'stem', 'hij schaamt zich of is teleurgesteld', ['hij is trots', 'hij is boos op jou']],
    ['Bij het sollicitatiegesprek kijkt Noor de werkgever rustig aan.', 'oogcontact', 'ze komt zelfverzekerd en eerlijk over', ['ze is brutaal', 'ze verveelt zich']],
    ['Daan zit tijdens het gesprek onderuitgezakt op zijn stoel.', 'houding', 'het interesseert hem niet zo', ['hij is heel nieuwsgierig', 'hij is zenuwachtig']],
    ['De docent fronst en trekt haar wenkbrauwen op als je je antwoord geeft.', 'gezichtsuitdrukking', 'ze twijfelt of ze het snapt', ['ze is heel blij met je antwoord', 'ze is moe']],
    ['Tijdens jouw presentatie glimlacht je mentor steeds.', 'gezichtsuitdrukking', 'ze vindt dat het goed gaat', ['ze verveelt zich', 'ze is het niet met je eens']],
    ['Je vriend zegt op een spottende toon: ‘Ja, leuk hoor.’', 'stem', 'hij bedoelt eigenlijk het omgekeerde', ['hij vindt het echt leuk', 'hij is moe']],
    ['Een spreker beweegt zijn armen druk en wijst bij elk punt naar zijn dia.', 'gebaren', 'hij is enthousiast en wil iets duidelijk maken', ['hij is verlegen', 'hij is verdrietig']],
    ['Tijdens het gesprek tikt Sanne steeds met haar pen op tafel en kijkt ze op de klok.', 'gebaren', 'ze heeft haast of wil weg', ['ze is ontspannen', 'ze is heel geïnteresseerd']],
    ['Je zus praat steeds harder en sneller.', 'stem', 'ze wordt boos of opgewonden', ['ze is rustig', 'ze is moe']],
    ['Bij de kennismaking staat de nieuwe leerling rechtop en kijkt hij de klas vrolijk rond.', 'houding', 'hij voelt zich zeker en wil kennismaken', ['hij is bang', 'hij wil met rust gelaten worden']],
    ['Je vriendin kijkt weg als je vraagt waar ze gisteren was.', 'oogcontact', 'ze voelt zich ongemakkelijk bij die vraag', ['ze is heel trots', 'ze is boos op iemand anders']],
    ['Je tegenstander bij het schaken leunt achterover, met zijn handen achter zijn hoofd.', 'houding', 'hij voelt zich zeker van zijn zaak', ['hij is bang om te verliezen', 'hij snapt het spel niet']],
    ['De kassamedewerker rolt met haar ogen als jij om een tasje vraagt.', 'gezichtsuitdrukking', 'ze vindt je vraag lastig of vervelend', ['ze helpt je graag', 'ze heeft pijn']],
    ['Je opa legt zijn hand op je schouder als je vertelt dat je verdrietig bent.', 'gebaren', 'hij wil je troosten', ['hij wil dat je weggaat', 'hij is boos']]
  ];
  var SIGHINT = { oogcontact:'Waar kijkt de persoon naar?', houding:'Hoe zit of staat de persoon?', gezichtsuitdrukking:'Wat doet het gezicht: ogen, mond, wenkbrauwen?', stem:'Hoe klinkt de stem: hard, zacht, snel, spottend?', gebaren:'Wat doen de handen en armen?' };
  function maakNonverb(R, it){
    return OP('Wat zegt dat?', tekst(it[0]), [
      K(R, 'Waar let je hier op?', it[1], trek(R, SIGNAAL, [it[1]], 2), SIGHINT[it[1]]),
      K(R, 'Wat zegt dat?', it[2], it[3], 'Stel je voor dat jij dit ziet of hoort. Wat zegt het zonder woorden?')
    ]);
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'gesprek-situatie', niveau:'2F', domein:'mondeling', naam:'Gesprekken in situaties', kd:['nl4A.b', 'nl4A.c', 'nl4A.d', 'nl4A.e'],
        uit:'Elk gesprek heeft zijn eigen regels. Aan de telefoon, bij een klacht, op een sollicitatie of als je een afspraak maakt. En wat zeg je zonder woorden, met je ogen, je houding en je stem?' },
      doelen:[
        { id:'gesprek-situatie-bellen', naam:'Telefoneren', kort:'Groet, noem je naam, stel je vraag duidelijk en sluit netjes af',
          uit:'<p>Aan de telefoon zie je elkaar niet. Daarom gaat een telefoongesprek in vaste stappen.</p><p>1 <b>Openen</b>: groet en noem je naam. <i>Goedemiddag, u spreekt met Sanne de Vries.</i> 2 Je <b>vraag</b>: kort en precies. 3 <b>Afsluiten</b>: bedank de ander en neem afscheid.</p>',
          wanneer:'je een bedrijf, de dokter of de school belt.',
          maak:function(R){ return maakBellen(R, R.kies(BEL)); } },
        { id:'gesprek-situatie-klacht', naam:'Een klacht netjes brengen', kort:'Blijf rustig, noem de feiten en vraag een redelijke oplossing',
          uit:'<p>Als iets niet goed is, mag je klagen. Met een <b>nette klacht</b> bereik je het meest.</p><p>1 Begin <b>rustig</b> en zeg waar het over gaat. 2 Noem de <b>feiten</b>: wat er mis is, zonder verwijt en zonder te overdrijven. 3 Vraag een <b>redelijke oplossing</b>: ruilen, geld terug, een nieuwe afspraak.</p>',
          wanneer:'je iets kapot of verkeerd geleverd krijgt, of iets niet eerlijk vindt.',
          maak:function(R){ return maakKlacht(R, R.kies(KLACHT)); } },
        { id:'gesprek-situatie-soll', naam:'Een sollicitatiegesprek', kort:'Vertel wat je goed kunt voor deze baan, en stel een goede vraag',
          uit:'<p>Bij een <b>sollicitatiegesprek</b> voor een bijbaan wil de werkgever weten of je bij de baan past.</p><p>Vertel iets wat je goed kunt en wat <b>past bij de baan</b>. Bij een dierenwinkel: <i>Ik heb zelf konijnen.</i></p><p>Stel aan het eind een <b>goede vraag</b> over het werk. Dat laat zien dat je je hebt voorbereid.</p>',
          wanneer:'je solliciteert naar een bijbaan of stageplek.',
          maak:function(R){ return maakSoll(R, R.kies(SOLL)); } },
        { id:'gesprek-situatie-afspraak', naam:'Een afspraak maken of afzeggen', kort:'Maken: dag, tijd en plek. Afzeggen: snel, met sorry, een reden en een nieuw voorstel',
          uit:'<p>Een <b>afspraak maken</b>: noem de <b>dag</b>, de <b>tijd</b> en de <b>plek</b>. Herhaal aan het eind kort wat jullie hebben afgesproken.</p><p>Een <b>afspraak afzeggen</b>: doe het <b>zo snel mogelijk</b>. Zeg <b>sorry</b>, geef een <b>reden</b> en doe een <b>nieuw voorstel</b>.</p>',
          wanneer:'je iets wilt afspreken of een afspraak niet kunt nakomen.',
          maak:function(R){ return maakAfspraak(R); } },
        { id:'gesprek-situatie-nonverbaal', naam:'Non-verbale communicatie', kort:'Ogen, houding, gezicht, stem en gebaren zeggen ook iets',
          uit:'<p>Je praat niet alleen met woorden. Ook je <b>oogcontact</b>, je <b>houding</b>, je <b>gezichtsuitdrukking</b>, je <b>stem</b> en je <b>gebaren</b> zeggen iets. Dat heet <b>non-verbale communicatie</b>.</p><p>Iemand met de armen over elkaar en de rug naar je toe doet niet echt mee. Iemand die je rustig aankijkt, komt zeker en eerlijk over.</p>',
          wanneer:'je wilt snappen wat iemand bedoelt, of zelf goed overkomen.',
          maak:function(R){ return maakNonverb(R, R.kies(NONVERB)); } }
      ] }
  ]);

  /* ================= DISCUSSIËREN ================= */

  /* toelichting vragen: [uitspraak, wat is onduidelijk, [fout], goede vraag, gesloten, aanval] */
  var TOELICHT = [
    ['In de groepsles zegt Sem: ‘Het nieuwe rooster is gewoon slecht.’', 'wat er precies slecht is aan het rooster', ['wie Sem is', 'hoe laat het is'], 'Wat vind je er precies slecht aan?', 'Vind je het rooster slecht?', 'Waarom zeur je altijd?'],
    ['Je klasgenoot zegt: ‘We moeten het werkstuk anders aanpakken.’', 'hoe hij het dan wil aanpakken', ['welk vak het is', 'wanneer de deadline is'], 'Hoe zou jij het dan willen aanpakken?', 'Moeten we het anders doen?', 'Jij hebt toch zelf ook niks gedaan?'],
    ['De docent zegt: ‘Je inleiding is nog te mager.’', 'wat er nog mist in de inleiding', ['wat een inleiding is', 'hoe lang de hele tekst is'], 'Wat zou ik nog in de inleiding moeten zetten?', 'Is mijn inleiding mager?', 'Dat vind ik niet eerlijk.'],
    ['Iemand in de discussie zegt: ‘Uit onderzoek blijkt dat sociale media slecht zijn voor jongeren.’', 'welk onderzoek dat is en wat eruit bleek', ['wat sociale media zijn', 'wie er in de discussie zit'], 'Welk onderzoek bedoel je, en wat bleek daar precies uit?', 'Klopt dat?', 'Jij zit zelf ook de hele dag op je telefoon.'],
    ['Je teamgenoot zegt: ‘Jij moet beter samenspelen.’', 'wat je precies anders moet doen', ['wie de trainer is', 'wanneer de wedstrijd is'], 'Kun je een voorbeeld geven van wanneer ik beter had kunnen samenspelen?', 'Moet ik beter samenspelen?', 'Kijk eerst maar naar jezelf.'],
    ['Je vriendin zegt ‘Ik heb het druk’ als je vraagt of ze zaterdag meegaat.', 'of ze echt niet kan, of liever een andere keer wil', ['waar ze woont', 'hoe oud ze is'], 'Bedoel je dat je zaterdag niet kunt, of wil je liever een andere keer?', 'Heb je het druk?', 'Jij hebt het ook altijd druk.'],
    ['De voorzitter zegt: ‘We gaan voor optie B.’', 'waarom er voor optie B gekozen is', ['wat optie A was', 'wie de voorzitter is'], 'Kun je uitleggen waarom we voor optie B kiezen?', 'Gaan we voor B?', 'B is toch dom?'],
    ['Je groepsgenoot zegt: ‘Dat deel van de presentatie moet korter.’', 'welk deel en hoeveel korter', ['wanneer de presentatie is', 'wie er presenteert'], 'Welk deel bedoel je precies, en hoeveel korter moet het?', 'Moet het korter?', 'Doe het dan zelf.'],
    ['Een klasgenoot zegt: ‘De schoolreis is te duur.’', 'welk bedrag hij wel redelijk vindt', ['waar de reis heen gaat', 'wie de reis organiseert'], 'Welk bedrag zou jij wel redelijk vinden?', 'Is het te duur?', 'Dan blijf je toch thuis?'],
    ['Je mentor zegt: ‘Je moet je beter voorbereiden op toetsen.’', 'hoe je dat het best kunt doen', ['wanneer de volgende toets is', 'welke cijfers je hebt'], 'Hoe kan ik me volgens u het best voorbereiden?', 'Moet ik me beter voorbereiden?', 'Ik leer toch al heel veel.'],
    ['Je trainer zegt: ‘Volgende week doen we het anders.’', 'wat er anders wordt', ['hoe laat de training begint', 'wie er komt'], 'Wat gaan we dan anders doen?', 'Doen we het anders?', 'Waarom verander je altijd alles?'],
    ['Je klasgenoot zegt: ‘Dat idee werkt nooit.’', 'waarom het volgens hem niet werkt', ['wie het idee bedacht', 'hoe laat het is'], 'Waarom denk je dat het niet werkt?', 'Werkt het niet?', 'Jij vindt ook alles stom.'],
    ['Een klasgenoot zegt: ‘Die website is niet betrouwbaar.’', 'waaraan hij ziet dat de website niet betrouwbaar is', ['hoe de website heet', 'wie de website gebruikt'], 'Waaraan zie je dat de website niet betrouwbaar is?', 'Is hij niet betrouwbaar?', 'Jij weet het ook altijd beter.']
  ];
  function maakToelicht(R, it){
    var fm = {}; fm[it[4]] = 'Daar komt alleen ja of nee op. Dan weet je nog steeds niet wat de ander bedoelt.'; fm[it[5]] = 'Dat is een aanval, geen vraag om uitleg.';
    return OP('Welke vraag stel je om uitleg?', tekst(it[0]), [
      K(R, 'Wat is er niet duidelijk aan wat er gezegd wordt?', it[1], it[2], 'Wat zou je moeten weten om de uitspraak echt te snappen?'),
      K(R, 'Welke vraag stel je om uitleg?', it[3], [it[4], it[5]], 'Stel een open vraag over ' + it[1] + '.', fm)
    ]);
  }

  /* reageren: [uitspraak, instemmen met argument, weerleggen met argument, zonder argument, persoonlijk] */
  var REAGEER = [
    ['Lars zegt: ‘Mobieltjes moeten de hele dag in de kluis, want ze leiden af in de les.’', 'Dat klopt, en in de pauze praten we dan ook meer met elkaar.', 'Ik snap het, maar je kunt je telefoon in de les ook goed gebruiken om iets op te zoeken.', 'Nee, dat is onzin.', 'Jij wilt dat alleen omdat je zelf geen goede telefoon hebt.'],
    ['Ayla zegt: ‘Huiswerk moet worden afgeschaft, want je leert op school al genoeg.’', 'Dat vind ik ook, en dan hebben we meer tijd voor sport en rust.', 'Ik begrijp het, maar met huiswerk oefen je de stof nog een keer, en dan onthoud je het beter.', 'Dat is gewoon niet waar.', 'Jij maakt toch nooit je huiswerk.'],
    ['Jens zegt: ‘School moet later beginnen, want jongeren zijn ’s ochtends nog moe.’', 'Klopt, en uitgeruste leerlingen kunnen zich beter concentreren.', 'Dat snap ik, maar dan duren de lessen ook tot later, en dan heb je minder tijd voor je bijbaan of sport.', 'Wat een raar idee.', 'Jij komt altijd te laat, dus natuurlijk wil jij dat.'],
    ['Fleur zegt: ‘We moeten op schoolreis naar een pretpark, want dat vindt iedereen leuk.’', 'Eens, en in een pretpark is er voor iedereen wel iets te doen.', 'Ik zie het anders: niet iedereen houdt van achtbanen, dus een stadsbezoek past bij meer mensen.', 'Nee joh.', 'Jij bent toch altijd bang in de achtbaan.'],
    ['Ravi zegt: ‘Er moet een frisdrankautomaat in de kantine, want leerlingen willen dat.’', 'Dat klopt, dan hoeven we in de pauze niet naar de supermarkt.', 'Dat snap ik, maar frisdrank is ongezond, en de school wil juist gezond eten stimuleren.', 'Slecht plan.', 'Jij drinkt al veel te veel frisdrank.'],
    ['Lieke zegt: ‘Gamen is slecht voor jongeren, want ze bewegen te weinig.’', 'Klopt, wie de hele dag gamet, zit veel te veel stil.', 'Dat geldt niet voor iedereen: veel jongeren die gamen, sporten ook.', 'Wat een onzin.', 'Jij kunt gewoon niet gamen.'],
    ['Bas zegt: ‘Een schooluniform is een goed idee, want dan wordt niemand gepest om zijn kleren.’', 'Eens, en het scheelt ’s ochtends ook tijd bij het kiezen.', 'Ik begrijp het, maar pesters vinden dan wel iets anders, zoals je schoenen of je tas.', 'Echt niet.', 'Jij hebt gewoon geen smaak.'],
    ['Tom zegt: ‘Fietsen naar school is beter dan de bus, want dan krijg je beweging.’', 'Eens, en je bent ook niet afhankelijk van een bus die te laat is.', 'Dat klopt deels, maar voor leerlingen die twintig kilometer verderop wonen, is fietsen niet te doen.', 'Nee.', 'Jij woont gewoon naast de school.'],
    ['Sara zegt: ‘Iedereen moet een bijbaan hebben, want dan leer je met geld omgaan.’', 'Klopt, en je leert ook op tijd komen en samenwerken.', 'Ik snap het, maar sommige leerlingen hebben die tijd nodig voor school of om thuis te helpen.', 'Belachelijk.', 'Jij wilt alleen maar opscheppen over je geld.'],
    ['Mo zegt: ‘De kerstvakantie moet langer, want iedereen is aan het eind van het jaar moe.’', 'Eens, en uitgeruste leerlingen leren na de vakantie beter.', 'Ik begrijp het, maar dan moet een andere vakantie korter worden, en dat wil bijna niemand.', 'Dat gaat echt niet gebeuren.', 'Jij bent altijd moe, ook in september.'],
    ['Noa zegt: ‘Toetsen kun je beter op de computer maken, want dan krijg je sneller je cijfer.’', 'Klopt, en de docent heeft dan minder nakijkwerk.', 'Dat snap ik, maar bij een vak als wiskunde moet je je berekening op papier kunnen laten zien.', 'Nee, dat is stom.', 'Jij kunt toch niet eens typen.'],
    ['Finn zegt: ‘Honden moeten overal aan de lijn, want niet iedereen vindt honden leuk.’', 'Eens, en zo kan een hond ook niet zomaar de weg op rennen.', 'Dat begrijp ik, maar honden moeten ook kunnen rennen, dus er moeten losloopgebieden blijven.', 'Wat een gezeur.', 'Jij bent gewoon bang voor honden.'],
    ['Esra zegt: ‘De bibliotheek moet ook op zondag open, want dan kunnen scholieren er rustig leren.’', 'Klopt, en thuis is het in het weekend vaak druk.', 'Dat snap ik, maar dan moeten de medewerkers ook op zondag werken, en dat kost veel geld.', 'Niet nodig.', 'Jij gaat toch nooit naar de bieb.']
  ];
  function maakReageer(R, it){
    var eens = Math.random() < 0.5, goed = eens ? it[1] : it[2], ander = eens ? it[2] : it[1], fm = {};
    fm[ander] = eens ? 'Daarmee zeg je dat je het er niet mee eens bent. Jij bent het er juist wel mee eens.' : 'Daarmee zeg je dat je het ermee eens bent. Jij bent het er juist niet mee eens.';
    fm[it[4]] = 'Dat gaat over de persoon, niet over het argument.'; fm[it[3]] = 'Daar staat geen argument in.';
    return OP('Welke reactie past bij jou?', tekst(it[0]) + '<p>Jij bent het er <b>' + (eens ? 'wél' : 'níet') + '</b> mee eens.</p>', [
      K(R, 'Welke reactie geeft geen enkel argument?', it[3], [it[1], it[2]], 'Zoek de reactie zonder want, omdat of een uitleg.'),
      K(R, 'Welke reactie valt de persoon aan in plaats van het argument?', it[4], [it[1], it[2]], 'Zoek de reactie die iets zegt over de spreker zelf: jij ...'),
      K(R, 'Welke reactie past bij jou?', goed, [ander, it[4]], eens ? 'Je bent het eens: kies de reactie die instemt én er een argument bij geeft.' : 'Je bent het niet eens: kies de reactie die het argument weerlegt met een tegenargument.', fm)
    ]);
  }

  /* besluiten: [discussie, besluit, [fout], reden] */
  var BESLUIT = [
    [['Sem: Ik wil naar het pretpark.', 'Lisa: Het pretpark is duur. Lasergamen is goedkoper.', 'Mo: Lasergamen lijkt me leuk, en het past in ons budget.', 'Noor: Prima, lasergamen dan.'], 'lasergamen', ['het pretpark', 'thuisblijven'], 'het leuk is en in ons budget past'],
    [['Yara: Ik wil ons werkstuk over haaien doen.', 'Daan: Haaien is goed, daar is veel over te vinden.', 'Fien: Ik dacht aan vulkanen, maar haaien vind ik ook prima.', 'Kofi: Haaien, dan kunnen we in het aquarium foto’s maken.'], 'een werkstuk over haaien', ['een werkstuk over vulkanen', 'een werkstuk over dinosaurussen'], 'er veel over te vinden is en we in het aquarium foto’s kunnen maken'],
    [['Tim: Laten we met de sponsorloop geld ophalen voor het dierenasiel.', 'Ilse: Of voor de voedselbank in onze stad.', 'Ravi: De voedselbank helpt mensen hier in de buurt, dat vind ik belangrijker.', 'Tim: Ja, daar kan ik ook achter staan.'], 'geld ophalen voor de voedselbank', ['geld ophalen voor het dierenasiel', 'geen sponsorloop houden'], 'die mensen in onze eigen buurt helpt'],
    [['Mila: Dinsdag kan ik niet oefenen.', 'Bram: Woensdag na school dan?', 'Jade: Woensdag past mij goed.', 'Mila: Woensdag kan ik ook.'], 'oefenen op woensdag na school', ['oefenen op dinsdag', 'niet oefenen'], 'iedereen dan kan'],
    [['Lars: Thema van het schoolfeest: de jaren tachtig!', 'Esra: Of een glitterfeest.', 'Finn: De jaren tachtig is leuker, dan kan iedereen zich verkleden.', 'Esra: Oké, de jaren tachtig is ook goed, als er maar glitters bij mogen.'], 'een feest met als thema de jaren tachtig', ['een glitterfeest', 'een feest zonder thema'], 'iedereen zich dan kan verkleden'],
    [['Ahmed: De leerlingenraad moet vragen om meer prullenbakken op het plein.', 'Sanne: Of om bankjes.', 'Joep: Het plein ligt vol afval, prullenbakken zijn het belangrijkst.', 'Sanne: Klopt, eerst prullenbakken, bankjes later.'], 'eerst meer prullenbakken vragen', ['eerst bankjes vragen', 'niets vragen'], 'het plein vol afval ligt'],
    [['Lotte: Ik wil de inleiding schrijven.', 'Sem: Dan doe ik de plaatjes.', 'Noor: En ik de conclusie.', 'Sem: Prima, dan heeft iedereen een eigen deel.'], 'Lotte de inleiding, Sem de plaatjes en Noor de conclusie', ['Lotte doet alles', 'Sem de inleiding, Lotte de plaatjes en Noor de conclusie'], 'iedereen dan een eigen deel heeft'],
    [['Bas: Een griezelfilm voor de filmavond!', 'Ilse: Daar durf ik niet naar te kijken.', 'Kai: Een komedie dan, daar kan iedereen naar kijken.', 'Bas: Goed, een komedie.'], 'een komedie kijken', ['een griezelfilm kijken', 'geen film kijken'], 'iedereen daarnaar kan kijken'],
    [['Yara: Pizza op kamp!', 'Mo: Ik eet geen varkensvlees, en op veel pizza’s zit salami.', 'Lisa: Een pizza met groente kan iedereen eten.', 'Mo: Dat is goed.'], 'pizza met groente', ['pizza met salami', 'patat'], 'iedereen die kan eten'],
    [['Daan: Met de klas naar Parijs!', 'Fien: Te ver en te duur voor drie dagen.', 'Kofi: Antwerpen is dichtbij en goedkoper.', 'Daan: Ook goed, Antwerpen dan.'], 'naar Antwerpen', ['naar Parijs', 'naar Londen'], 'het dichtbij en goedkoper is'],
    [['Jade: Wie doet zaterdag de kantinedienst?', 'Tim: Ik kan in de ochtend.', 'Esra: Ik in de middag.', 'Jade: Dan doet Tim de ochtend en Esra de middag.'], 'Tim de ochtend en Esra de middag', ['Tim de hele dag', 'Esra de ochtend en Tim de middag'], 'dat voor allebei past'],
    [['Lars: Laten we op de kerstmarkt koekjes verkopen.', 'Noor: Of zelfgemaakte kaarten.', 'Ravi: Koekjes verkopen sneller, en we kunnen ze samen bakken.', 'Noor: Ja, en ik maak er mooie zakjes voor.'], 'koekjes verkopen', ['kaarten verkopen', 'niets verkopen'], 'ze sneller verkopen en we ze samen kunnen bakken']
  ];
  var AFROND_FOUT = ['Ik beslis het wel, want dit duurt me te lang.', 'We stoppen, iedereen doet maar wat hij wil.', 'Laten we nog even verder praten, misschien komt er nog een idee.'];
  function maakBesluit(R, it){
    var goed = 'Dus: ' + it[1] + ', omdat ' + it[3] + '. Is iedereen het daarmee eens?', f2 = 'Dus: ' + it[2][0] + '. Klaar.', f1 = R.kies(AFROND_FOUT), fm = {};
    fm[f2] = 'Dat is niet waar de groep het over eens werd.'; fm[f1] = 'Zo rond je niet samen af: je vat niets samen en vraagt niemand iets.';
    var regels = it[0].map(function(r){ var p = r.indexOf(':'); return '<b>' + r.slice(0, p) + ':</b>' + r.slice(p + 1); });
    return OP('Wat zeg je om af te ronden?', tekst(regels), [
      K(R, 'Waar zijn de meesten het aan het eind over eens?', it[1], it[2], 'Lees vooral de laatste beurten. Waar zegt iedereen ja tegen?'),
      K(R, 'Wat zeg je om af te ronden?', goed, [f1, f2], 'Vat het besluit samen, met de reden, en vraag of iedereen het ermee eens is.', fm)
    ]);
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'gesprek-discussie', niveau:'2F', domein:'mondeling', naam:'Discussiëren en beslissen', kd:['nl4B.a', 'nl4B.b', 'nl4B.d', 'nl4B.e'],
        uit:'In een discussie wil je elkaar begrijpen en samen verder komen. Je vraagt om uitleg, je reageert op argumenten met argumenten, en je rondt af met een besluit.' },
      doelen:[
        { id:'gesprek-discussie-uitleg', naam:'Om uitleg vragen', kort:'Vraag met een open vraag wat de ander precies bedoelt',
          uit:'<p>Iemand zegt iets vaags: <i>Het rooster is gewoon slecht.</i> Dan kun je pas goed reageren als je weet wat hij <b>precies bedoelt</b>.</p><p>Vraag om <b>uitleg</b> met een <b>open vraag</b>: <i>Wat vind je er precies slecht aan?</i> Of vraag om een voorbeeld.</p><p>Niet doen: een vraag waar alleen ja of nee op komt, of de ander aanvallen.</p>',
          wanneer:'je in een gesprek niet goed snapt wat iemand bedoelt.',
          maak:function(R){ return maakToelicht(R, R.kies(TOELICHT)); } },
        { id:'gesprek-discussie-reageer', naam:'Reageren op een argument', kort:'Stem in of weerleg, maar altijd met een argument en nooit tegen de persoon',
          uit:'<p>In een discussie reageer je op het <b>argument</b> van de ander, niet op de persoon.</p><p>Ben je het <b>eens</b>? Stem in en geef er nog een argument bij: <i>Klopt, en ...</i></p><p>Ben je het <b>oneens</b>? Weerleg het met een tegenargument: <i>Ik snap het, maar ...</i></p><p>Een reactie zonder argument (<i>Wat een onzin</i>) of een aanval op de persoon (<i>Jij ...</i>) helpt niemand.</p>',
          wanneer:'je in een discussie wilt reageren op wat iemand zegt.',
          maak:function(R){ return maakReageer(R, R.kies(REAGEER)); } },
        { id:'gesprek-discussie-besluit', naam:'Samen tot een besluit komen', kort:'Vat het besluit samen met de reden, en check of iedereen het eens is',
          uit:'<p>Aan het eind van een overleg moet er een <b>besluit</b> komen. Kijk waar de meesten het <b>over eens</b> zijn.</p><p>Rond af door het besluit <b>samen te vatten</b>, met de <b>reden</b>, en te <b>checken</b> of iedereen het ermee eens is: <i>Dus: lasergamen, omdat het leuk is en in ons budget past. Is iedereen het daarmee eens?</i></p>',
          wanneer:'je met een groepje iets moet beslissen.',
          maak:function(R){ return maakBesluit(R, R.kies(BESLUIT)); } }
      ] }
  ]);

  /* ================= FEEDBACK EN REFLECTIE ================= */

  /* tops en tips: [werk, top, vage top, tip, vage tip, botte tip] */
  var TOPTIP = [
    ['Je klasgenoot hield een presentatie over haaien. Ze vertelde veel weetjes en had mooie foto’s, maar ze las alles van haar blad en keek de klas bijna niet aan.', 'Je foto’s lieten goed zien hoe groot een walvishaai is.', 'Het was wel goed.', 'Probeer volgende keer de klas vaker aan te kijken, bijvoorbeeld door alleen steekwoorden op je blad te zetten.', 'Het kan nog beter.', 'Dat voorlezen was echt saai, zeg.'],
    ['Een klasgenoot schreef een verhaal. Het begin is spannend, maar er staan veel lange zinnen in en het einde komt heel plotseling.', 'Je eerste zin, over de krakende trap, maakt meteen nieuwsgierig.', 'Leuk verhaal!', 'Knip je lange zinnen eens op in kortere, dan leest het sneller.', 'Schrijf het wat beter.', 'Je einde slaat nergens op.'],
    ['Je groepsgenoot maakte een poster. De kop is groot en duidelijk, maar er staat zoveel tekst op dat je het van een afstand niet kunt lezen.', 'Je kop is groot en goed te lezen, ook van achter in de klas.', 'Mooie poster.', 'Gebruik minder tekst en grotere letters, dan kun je hem van ver lezen.', 'Er klopt iets niet aan.', 'Niemand gaat die poster lezen.'],
    ['Een klasgenoot schreef een e-mail aan een bedrijf. De vraag is duidelijk, maar de aanhef is ‘Hoi!’ en er staan drie spelfouten in.', 'Je vraag aan het bedrijf staat duidelijk in de eerste alinea.', 'Prima mail.', 'Begin met ‘Geachte heer of mevrouw’ en laat de spellingcontrole erover gaan.', 'Het moet wat netter.', 'Dit stuur je toch niet naar een bedrijf?'],
    ['Je klasgenoot las een gedicht voor. Hij las met veel gevoel, maar zo zacht dat de achterste rij het niet verstond.', 'Je las met veel gevoel, vooral de laatste regel klonk echt verdrietig.', 'Goed gedaan.', 'Praat iets harder, zodat ook de achterste rij je kan horen.', 'Let op je stem.', 'Niemand kon je verstaan, joh.'],
    ['Een klasgenoot schreef een boekverslag. De samenvatting is goed, maar ze geeft haar mening zonder argumenten.', 'Je samenvatting is kort en staat in de goede volgorde.', 'Je hebt goed je best gedaan.', 'Zet bij je mening ook waarom, bijvoorbeeld wat je spannend vond en waardoor.', 'Je mening kan beter.', 'Je mening is waardeloos.'],
    ['Je groepsgenoot leidde de vergadering. Iedereen kwam aan het woord, maar aan het eind wist niemand wat er besloten was.', 'Je zorgde dat iedereen aan de beurt kwam, ook wie stil was.', 'Het ging prima.', 'Vat aan het eind kort samen wat we besloten hebben.', 'Het einde was wat rommelig.', 'Wat een chaos was dat.'],
    ['Je klasgenoot hield een betoog over schoolfruit. Hij had sterke argumenten, maar hij sprak heel snel.', 'Je argument dat fruit goedkoper is dan snoep uit de automaat was sterk.', 'Goed betoog.', 'Neem na elk argument even een pauze, dan kunnen we je beter volgen.', 'Doe het rustiger.', 'Je ratelde als een machine.'],
    ['Een klasgenoot schreef een instructie voor het maken van een tosti. De stappen zijn duidelijk, maar ze staan niet in de goede volgorde.', 'Elke stap is kort en duidelijk geschreven.', 'Leuke instructie.', 'Zet de stap ‘Zet het tosti-ijzer aan’ helemaal vooraan.', 'De volgorde is niet goed.', 'Hiermee brandt iedereen zijn tosti aan.'],
    ['Je klasgenoot maakte een filmpje over afval op school. De beelden zijn mooi, maar de muziek is zo hard dat je de stem niet hoort.', 'Je beelden van de volle prullenbakken laten het probleem goed zien.', 'Toffe film.', 'Zet de muziek zachter als je praat, zodat we je stem goed horen.', 'Het geluid is niet goed.', 'Die muziek is echt irritant.'],
    ['Een klasgenoot schreef een sollicitatiebrief. Hij vertelt goed wat hij kan, maar de brief is twee kantjes lang.', 'Je laat goed zien dat je ervaring hebt met kinderen.', 'Goede brief.', 'Maak hem korter, tot één kantje: haal de herhalingen eruit.', 'Hij is niet zo goed.', 'Niemand leest zo’n lange brief.'],
    ['Je klasgenoot deed een interview. Ze stelde goede open vragen, maar ze vroeg niet door.', 'Door je open vragen vertelde de geïnterviewde veel.', 'Leuk interview.', 'Vraag door als iemand iets interessants zegt, bijvoorbeeld met: hoe kwam dat?', 'Het kon wat dieper.', 'Je luisterde gewoon niet.'],
    ['Een klasgenoot schreef een gedicht. De beeldspraak is mooi, maar het rijm voelt soms geforceerd.', 'De vergelijking van de maan met een zilveren munt vind ik heel mooi.', 'Mooi gedicht.', 'Laat het rijm los waar het niet lekker loopt: een gedicht hoeft niet te rijmen.', 'Het rijm is niet goed.', 'Dat rijm is echt kinderachtig.']
  ];
  function maakTopTip(R, it){
    var fm = {}; fm[it[2]] = 'Dat is te vaag: wat was er dan goed?'; fm[it[5]] = 'Dat is niet vriendelijk, en het helpt niet om het beter te doen.'; fm[it[4]] = 'Dat is te vaag: wat moet er dan beter, en hoe?';
    return OP('Welke tip is concreet en vriendelijk?', tekst(it[0]), [
      K(R, 'Welke top is concreet?', it[1], [it[2], it[5]], 'Een goede top noemt precies wat er goed was.', fm),
      K(R, 'Welke tip is concreet en vriendelijk?', it[3], [it[4], it[5]], 'Een goede tip zegt precies wat de ander kan doen, en is vriendelijk.', fm)
    ]);
  }

  /* feedback ontvangen: [feedback, goede reactie, actie, [foute acties]] */
  var ONTVANG = [
    ['Je docent zegt: ‘Je betoog heeft goede argumenten, maar je slot is te kort.’', '‘Dank u. Wat moet er volgens u nog in mijn slot?’', 'In mijn slot vat ik mijn argumenten samen en herhaal ik mijn standpunt.', ['Ik schrijf een heel nieuw betoog over iets anders.', 'Ik laat het slot weg, dan valt het niet op.']],
    ['Een klasgenoot zegt: ‘Je praatte bij je presentatie heel snel.’', '‘Bedankt. Was het de hele tijd te snel, of vooral aan het begin?’', 'Ik oefen thuis met een timer en neem na elk deel een pauze.', ['Ik maak de presentatie korter door de helft weg te laten.', 'Ik laat volgende keer iemand anders presenteren.']],
    ['Je mentor zegt: ‘In je verslag staan veel spelfouten.’', '‘Dank u. Gaat het vooral om de werkwoorden of om andere woorden?’', 'Ik lees mijn tekst voortaan hardop na en gebruik de spellingcontrole.', ['Ik schrijf voortaan kortere verslagen.', 'Ik vraag een klasgenoot om mijn verslag te schrijven.']],
    ['Je groepsgenoot zegt: ‘Jij neemt in de groep steeds alles over.’', '‘Dat wist ik niet. Wanneer merkte je dat het meest?’', 'Ik vraag in het volgende overleg eerst wat de anderen willen doen.', ['Ik zeg in het volgende overleg helemaal niets meer.', 'Ik ga in een ander groepje.']],
    ['Je docent zegt: ‘Je samenvatting is te lang.’', '‘Dank u. Wat kan ik volgens u weglaten?’', 'Ik haal de voorbeelden en details eruit en houd alleen de kern over.', ['Ik maak de letters kleiner, dan past het op één blad.', 'Ik schrijf er nog een paar zinnen bij.']],
    ['Een klasgenoot zegt: ‘Je poster is mooi, maar ik snap niet wat je bedoelt.’', '‘Dank je. Welk deel was niet duidelijk?’', 'Ik zet een duidelijke kop boven mijn poster en maak de tekst korter.', ['Ik maak de poster nog kleuriger.', 'Ik laat de poster zoals hij is, hij is toch mooi.']],
    ['Je docent zegt: ‘De toon van je e-mail aan het bedrijf is te informeel.’', '‘Dank u. Welke woorden zijn te informeel?’', 'Ik begin met Geachte en schrijf u in plaats van jij.', ['Ik zet er wat emoji’s in, dan is het vriendelijker.', 'Ik bel het bedrijf maar in plaats van te mailen.']],
    ['Je klasgenoot zegt: ‘Je verhaal is spannend, maar het einde snap ik niet.’', '‘Bedankt. Wat snapte je niet aan het einde?’', 'Ik schrijf het einde opnieuw, zodat duidelijk is hoe het afloopt.', ['Ik maak het begin minder spannend.', 'Ik zeg dat het een open einde is, dan hoef ik niets te doen.']],
    ['Je docent zegt: ‘Je bronnen staan er niet bij.’', '‘Dank u. Hoe moet ik de bronnen precies noteren?’', 'Ik zet onder mijn werkstuk een lijst met de websites en boeken die ik gebruikt heb.', ['Ik haal alle informatie weg die ik heb opgezocht.', 'Ik neem de teksten van internet woord voor woord over.']],
    ['Je klasgenoot zegt: ‘Je keek tijdens je presentatie alleen naar de docent.’', '‘Dank je, dat had ik niet door. Hoe kan ik de klas er beter bij betrekken?’', 'Ik kijk volgende keer bewust naar alle kanten van de klas.', ['Ik kijk volgende keer alleen naar mijn blad.', 'Ik ga met mijn rug naar de klas staan.']],
    ['Je stagebegeleider zegt: ‘Je bent vriendelijk tegen klanten, maar je vraagt te weinig hulp.’', '‘Dank u. Bij welke dingen had ik hulp moeten vragen?’', 'Als ik iets niet weet, vraag ik het meteen aan een collega.', ['Ik doe voortaan alles alleen, dan stoor ik niemand.', 'Ik ben minder vriendelijk tegen klanten.']],
    ['Een klasgenoot zegt: ‘Je alinea’s zijn heel lang.’', '‘Bedankt. Waar zou jij een nieuwe alinea beginnen?’', 'Ik begin een nieuwe alinea bij elk nieuw onderwerp.', ['Ik schrijf alles in één grote alinea.', 'Ik zet na elke zin een witregel.']]
  ];
  var VERDEDIG = ['‘Dat is niet waar, ik heb er heel hard aan gewerkt.’', '‘Jij doet het zelf ook niet beter.’', '‘Dat zegt iedereen, maar ik vind het goed zo.’'];
  var NEGEER = ['‘Oké.’ En je denkt er verder niet meer aan.', 'Je haalt je schouders op en zegt niets.'];
  function maakOntvang(R, it){
    var v = R.kies(VERDEDIG), n = R.kies(NEGEER), fm = {};
    fm[v] = 'Zo ga je in de verdediging. Dan leer je er niets van.'; fm[n] = 'Zo doe je niets met de feedback.';
    return OP('Wat doe je met de feedback?', tekst(it[0]), [
      K(R, 'Hoe reageer je het best?', it[1], [v, n], 'Bedank de ander en vraag door, zodat je precies weet wat je kunt verbeteren.', fm),
      K(R, 'Wat doe je met de feedback?', it[2], it[3], 'Kies iets concreets wat het probleem echt oplost.')
    ]);
  }

  /* checklist: { kop, z:[drie zinnen], slot, ww:[zinnummer, foute zin, fout woord, goed woord] } */
  var CHECK = { kop:'Er staat een kop boven de tekst.', hoofd:'Elke zin begint met een hoofdletter en eindigt met een punt.', slot:'De tekst heeft een slotzin die afrondt.', ww:'De werkwoorden zijn goed gespeld.' };
  var CHECKHINT = { kop:'Begin bovenaan: wat zie je boven de eerste zin?', hoofd:'Kijk naar het begin en het eind van elke zin. Mist er een hoofdletter of een punt?', slot:'Lees de laatste zin. Rondt die de tekst af, of stopt de tekst gewoon?', ww:'Zoek in elke zin de persoonsvorm en controleer de d of de t.' };
  var NAKIJK = [
    { kop:'Onze schoolreis naar Texel', z:['Vorige week gingen we met de hele klas naar Texel.', 'We fietsten over het eiland en bezochten het zeehondencentrum.', 'Daar zagen we hoe zieke zeehonden worden verzorgd.'], slot:'Het was een leerzame en gezellige reis.', ww:[1, 'We fietsde over het eiland en bezochten het zeehondencentrum.', 'fietsde', 'fietsten'] },
    { kop:'Waarom bijen belangrijk zijn', z:['Een bij vliegt van bloem naar bloem.', 'Zo neemt hij stuifmeel mee en bestuift hij planten.', 'Zonder bijen groeien er veel minder vruchten.'], slot:'Daarom moeten we goed voor bijen zorgen.', ww:[0, 'Een bij vliegd van bloem naar bloem.', 'vliegd', 'vliegt'] },
    { kop:'Mijn bijbaan bij de bakker', z:['Elke zaterdag werk ik bij de bakker in ons dorp.', 'Ik sta achter de toonbank en help de klanten.', 'Om vijf uur maak ik de winkel schoon.'], slot:'Ik vind het een leuke baan, omdat ik veel mensen spreek.', ww:[0, 'Elke zaterdag werkt ik bij de bakker in ons dorp.', 'werkt', 'werk'] },
    { kop:'De geschiedenis van de fiets', z:['De eerste fiets had nog geen trappers.', 'Je duwde jezelf vooruit met je voeten.', 'Later kwamen er trappers, een ketting en banden met lucht.'], slot:'Zo werd de fiets wat we nu kennen.', ww:[1, 'Je duwden jezelf vooruit met je voeten.', 'duwden', 'duwde'] },
    { kop:'Een dag in het dierenasiel', z:['Op woensdag help ik in het dierenasiel.', 'Ik geef de katten eten en maak hun hokken schoon.', 'Soms wordt er een dier opgehaald door een nieuw baasje.'], slot:'Dat vind ik het mooiste moment van de dag.', ww:[2, 'Soms word er een dier opgehaald door een nieuw baasje.', 'word', 'wordt'] },
    { kop:'Hoe een vulkaan uitbarst', z:['Diep onder de grond is het heel heet.', 'Daar smelt steen tot gloeiend magma.', 'Als de druk te groot wordt, komt het magma omhoog.'], slot:'Zo ontstaat een uitbarsting.', ww:[2, 'Als de druk te groot word, komt het magma omhoog.', 'word', 'wordt'] },
    { kop:'Ons klassenfeest', z:['Vrijdag hielden we een feest in de aula.', 'Iedereen nam iets lekkers mee.', 'De mentor had een quiz over de klas bedacht.'], slot:'We willen dit volgend jaar zeker weer doen.', ww:[1, 'Iedereen namen iets lekkers mee.', 'namen', 'nam'] },
    { kop:'Waarom ik graag lees', z:['Lezen is voor mij de beste manier om te ontspannen.', 'In een boek beleef ik avonturen die ik zelf nooit meemaak.', 'Bovendien leer ik er nieuwe woorden van.'], slot:'Daarom lees ik elke avond voor het slapen.', ww:[1, 'In een boek beleefd ik avonturen die ik zelf nooit meemaak.', 'beleefd', 'beleef'] },
    { kop:'De Elfstedentocht', z:['De Elfstedentocht is een schaatstocht langs elf Friese steden.', 'De tocht is bijna tweehonderd kilometer lang.', 'Hij vindt alleen plaats als het ijs overal dik genoeg is.'], slot:'Daarom wordt de tocht maar zelden gereden.', ww:[2, 'Hij vind alleen plaats als het ijs overal dik genoeg is.', 'vind', 'vindt'] },
    { kop:'Tips voor een goede nachtrust', z:['Leg je telefoon een uur voor het slapen weg.', 'Ga elke avond rond dezelfde tijd naar bed.', 'Zorg dat je kamer donker en koel is.'], slot:'Dan word je de volgende ochtend uitgerust wakker.', ww:[2, 'Zorgt dat je kamer donker en koel is.', 'zorgt', 'zorg'] },
    { kop:'Mijn opa uit Suriname', z:['Mijn opa kwam in 1975 vanuit Suriname naar Nederland.', 'Hij vond het hier eerst erg koud.', 'Nu woont hij al ruim vijftig jaar in Rotterdam.'], slot:'Hij vertelt nog vaak over zijn jeugd in Paramaribo.', ww:[1, 'Hij vondt het hier eerst erg koud.', 'vondt', 'vond'] },
    { kop:'Afval op het schoolplein', z:['Na elke pauze ligt het schoolplein vol afval.', 'Veel leerlingen gooien hun papiertjes gewoon op de grond.', 'Er staan maar twee prullenbakken op het hele plein.'], slot:'Meer prullenbakken zouden dus echt helpen.', ww:[1, 'Veel leerlingen gooit hun papiertjes gewoon op de grond.', 'gooit', 'gooien'] }
  ];
  function maakNakijk(R, it){
    var soort = R.kies(['kop', 'hoofd', 'slot', 'ww']), z = it.z.slice(), h = (it.ww[0] + 1) % 3;
    if (soort === 'ww') z[it.ww[0]] = it.ww[1];
    if (soort === 'hoofd') z[h] = z[h].charAt(0).toLowerCase() + z[h].slice(1, -1);
    var eerst = it.z[h].split(' ')[0];
    var fix = {
      kop:'Zet er een kop boven, bijvoorbeeld: ' + it.kop + '.',
      hoofd:'Begin de zin met ' + q(eerst) + ' met een hoofdletter en zet er een punt achter.',
      slot:'Voeg een slotzin toe, zoals: ' + it.slot,
      ww:'Verbeter de werkwoordsfout: ' + q(it.ww[2]) + ' wordt ' + q(it.ww[3]) + '.'
    };
    var body = z.join(' ') + (soort === 'slot' ? '' : ' ' + it.slot);
    var ctx = tekst(body, soort === 'kop' ? null : it.kop) + '<p><b>Checklist</b><br>1 ' + CHECK.kop + '<br>2 ' + CHECK.hoofd + '<br>3 ' + CHECK.slot + '<br>4 ' + CHECK.ww + '</p>';
    var rest = ['kop', 'hoofd', 'slot', 'ww'].filter(function(x){ return x !== soort; });
    return OP('Hoe verbeter je de tekst?', ctx, [
      K(R, 'Loop de checklist af. Welk punt klopt niet?', CHECK[soort], rest.map(function(x){ return CHECK[x]; }), CHECKHINT[soort]),
      K(R, 'Hoe verbeter je de tekst?', fix[soort], trek(R, rest, [], 2).map(function(x){ return fix[x]; }), 'Kies de verbetering die hoort bij het punt dat niet klopte: ' + CHECK[soort].charAt(0).toLowerCase() + CHECK[soort].slice(1))
    ]);
  }

  /* reflecteren: [situatie, oorzaak in je aanpak, [fout], volgende keer, [fout]] */
  var AANPAK = [
    ['Je begon pas de avond voor de deadline aan je verslag. Je had geen tijd om het na te lezen, en er stonden veel fouten in.', 'ik begon te laat, dus ik had geen tijd om na te lezen', ['de opdracht was gewoon te moeilijk', 'de docent kijkt te streng na'], 'Ik maak een planning en begin een week van tevoren, met een dag om na te lezen.', ['Ik hoop dat de volgende opdracht makkelijker is.', 'Ik lever het volgende keer gewoon later in.']],
    ['Bij je presentatie raakte je de draad kwijt, omdat je niet had geoefend.', 'ik had niet geoefend', ['het publiek was te druk', 'de beamer was te fel'], 'Ik oefen mijn presentatie twee keer hardop, één keer voor iemand thuis.', ['Ik schrijf de hele tekst op en lees hem voor.', 'Ik vraag of iemand anders mag presenteren.']],
    ['Voor je betoog zocht je argumenten op internet, maar je schreef niet op waar je ze vond. Je kreeg punten aftrek voor je bronnen.', 'ik heb mijn bronnen niet meteen opgeschreven', ['internet is nooit betrouwbaar', 'bronnen zijn niet belangrijk'], 'Ik schrijf bij elk argument meteen de website en de datum op.', ['Ik gebruik volgende keer geen internet meer.', 'Ik verzin de bronnen er achteraf bij.']],
    ['Bij de groepsopdracht deed iedereen hetzelfde deel, en de rest bleef liggen.', 'we hadden de taken niet verdeeld', ['mijn groepsgenoten zijn lui', 'de opdracht was te groot'], 'We maken aan het begin een takenlijst met wie wat doet.', ['Ik doe volgende keer alles alleen.', 'Ik kies volgende keer een ander groepje.']],
    ['Je las een moeilijke tekst één keer snel door en kon de vragen niet beantwoorden.', 'ik las te snel en zonder aanpak', ['de tekst was saai', 'de vragen waren oneerlijk'], 'Ik lees eerst de vragen, en daarna de tekst per alinea, en ik markeer de kernzinnen.', ['Ik sla moeilijke teksten voortaan over.', 'Ik gok de antwoorden.']],
    ['Je begon zonder plan aan een verhaal. Halverwege wist je niet meer hoe het verder moest.', 'ik begon zonder schrijfplan', ['ik heb geen fantasie', 'het onderwerp was stom'], 'Ik schrijf eerst in steekwoorden op wat er in het begin, het midden en het slot gebeurt.', ['Ik schrijf volgende keer een korter verhaal.', 'Ik neem een verhaal van internet.']],
    ['In je interview stelde je alleen gesloten vragen. Je kreeg korte antwoorden en weinig informatie.', 'ik stelde vooral gesloten vragen', ['de persoon wilde niet praten', 'het onderwerp was te moeilijk'], 'Ik bereid open vragen voor die beginnen met hoe, wat of waarom.', ['Ik interview volgende keer iemand anders.', 'Ik stel nog meer vragen met ja of nee.']],
    ['Je leerde voor je woordjestoets alleen door de lijst te lezen. Op de toets wist je de helft niet meer.', 'alleen lezen is te weinig: ik heb mezelf niet overhoord', ['ik ben slecht in talen', 'de toets was te lang'], 'Ik overhoor mezelf, verspreid over een paar korte momenten in de week.', ['Ik lees de lijst de avond ervoor nog een keer extra.', 'Ik leer niet meer, dan kan het ook niet tegenvallen.']],
    ['Je mail aan de stagebegeleider kreeg geen antwoord. Je had geen onderwerp ingevuld.', 'zonder onderwerp viel mijn mail niet op', ['de stagebegeleider is onbeleefd', 'e-mail werkt nooit'], 'Ik vul een duidelijk onderwerp in, zoals: vraag over een stageplek in april.', ['Ik stuur dezelfde mail tien keer.', 'Ik zet het hele bericht in het onderwerp.']],
    ['Tijdens de discussie werd je boos en riep je dingen zonder argumenten. Niemand luisterde nog naar je.', 'ik bleef niet rustig en gaf geen argumenten', ['de anderen waren dom', 'het onderwerp was te gevoelig'], 'Ik schrijf vooraf twee argumenten op en tel tot drie voordat ik reageer.', ['Ik zeg volgende keer niets meer.', 'Ik praat harder, zodat ze wel moeten luisteren.']],
    ['Je samenvatting was bijna even lang als de tekst zelf, omdat je alles overnam.', 'ik heb hoofdzaken en bijzaken niet gescheiden', ['de tekst was te lang', 'samenvatten is gewoon niks voor mij'], 'Ik zoek eerst per alinea de kernzin en laat voorbeelden en details weg.', ['Ik schrijf kleiner, dan lijkt het korter.', 'Ik neem volgende keer alleen de eerste alinea over.']],
    ['Je poster was mooi, maar je had zo lang aan de plaatjes gewerkt dat de tekst niet af was.', 'ik heb mijn tijd slecht verdeeld', ['de poster was te groot', 'ik had te weinig stiften'], 'Ik schrijf eerst de tekst en ga daarna pas versieren.', ['Ik maak volgende keer geen plaatjes meer.', 'Ik vraag gewoon om meer tijd.']]
  ];
  function maakAanpak(R, it){
    return OP('Wat doe je volgende keer anders?', tekst(it[0]), [
      K(R, 'Wat ging er mis in je aanpak?', it[1], it[2], 'Zoek iets wat je zelf anders had kunnen doen. Het ligt niet aan de opdracht of aan anderen.'),
      K(R, 'Wat doe je volgende keer anders?', it[3], it[4], 'Kies iets concreets wat je zelf gaat doen en wat dit oplost: ' + it[1] + '.')
    ]);
  }

  /* leerdoelen: [situatie, goed, vaag, niet haalbaar] */
  var LEERDOEL = [
    ['Bij je presentatie las je alles voor van je blad.', 'Bij mijn volgende presentatie gebruik ik alleen steekwoorden en kijk ik de klas aan.', 'Ik wil beter presenteren.', 'Ik wil nooit meer zenuwachtig zijn.'],
    ['In je verslag stonden veel fouten met d en t.', 'Bij mijn volgende verslag controleer ik van elke persoonsvorm of er een d of t hoort.', 'Ik wil beter worden in spelling.', 'Ik wil nooit meer een spelfout maken.'],
    ['Je samenvatting was veel te lang.', 'Bij mijn volgende samenvatting schrijf ik per alinea één zin, en blijf ik onder de honderd woorden.', 'Ik wil betere samenvattingen maken.', 'Ik wil elke tekst in één woord kunnen samenvatten.'],
    ['In discussies zeg je bijna nooit iets.', 'In de volgende discussie zeg ik minstens twee keer mijn mening, met een argument.', 'Ik wil meer meedoen.', 'Ik wil de beste spreker van de school worden.'],
    ['Je begon steeds te laat aan je werkstukken.', 'Voor mijn volgende werkstuk maak ik een planning en begin ik twee weken voor de deadline.', 'Ik wil beter plannen.', 'Ik wil al mijn werkstukken een maand te vroeg af hebben.'],
    ['Je e-mails aan docenten zijn te informeel.', 'In mijn volgende e-mail aan een docent gebruik ik een nette aanhef en schrijf ik u.', 'Ik wil nettere mails schrijven.', 'Ik wil al mijn e-mails foutloos en perfect schrijven.'],
    ['Bij leesteksten mis je vaak de hoofdgedachte.', 'Bij de volgende leestekst zoek ik eerst per alinea de kernzin, en daarna de hoofdgedachte.', 'Ik wil beter lezen.', 'Ik wil elke tekst in één keer helemaal begrijpen.'],
    ['Je verhalen hebben geen spannend begin.', 'Mijn volgende verhaal begin ik midden in de actie, met een spannende eerste zin.', 'Ik wil leukere verhalen schrijven.', 'Ik wil een beroemde schrijver worden.'],
    ['Je praat bij presentaties te zacht.', 'Ik oefen mijn volgende presentatie thuis zo hard dat iemand op drie meter afstand me goed hoort.', 'Ik wil beter met mijn stem omgaan.', 'Ik wil altijd en overal door iedereen gehoord worden.'],
    ['Je feedback aan klasgenoten is vaak alleen: goed gedaan.', 'Bij de volgende feedbackronde geef ik elke klasgenoot één concrete top en één concrete tip.', 'Ik wil betere feedback geven.', 'Ik wil dat iedereen mijn feedback altijd perfect vindt.'],
    ['Je vergeet bij werkstukken vaak je bronnen.', 'Bij mijn volgende werkstuk schrijf ik elke bron meteen op in een lijstje onderaan.', 'Ik wil beter op bronnen letten.', 'Ik wil alle bronnen van de hele wereld kennen.'],
    ['Je raakt bij toetsen in paniek door de tijdsdruk.', 'Bij de volgende toets kijk ik eerst hoeveel vragen er zijn en verdeel ik mijn tijd.', 'Ik wil rustiger worden.', 'Ik wil nooit meer stress hebben.'],
    ['In je betogen ontbreekt een tegenargument.', 'In mijn volgende betoog noem en weerleg ik minstens één tegenargument.', 'Ik wil betere betogen schrijven.', 'Ik wil dat iedereen het altijd met mijn betoog eens is.']
  ];
  function maakLeerdoel(R, it){
    var fm = {}; fm[it[2]] = 'Te vaag: wat ga je precies doen, en wanneer?'; fm[it[3]] = 'Dat is niet haalbaar. Kies iets wat je echt kunt doen.';
    return OP('Welk leerdoel is het best?', tekst(it[0]), [
      K(R, 'Welk leerdoel is te vaag?', it[2], [it[1], it[3]], 'Een vaag leerdoel zegt niet wat je gaat doen en wanneer.'),
      K(R, 'Welk leerdoel is niet haalbaar?', it[3], [it[1], it[2]], 'Zoek het leerdoel met nooit meer, altijd, of het beste van iedereen.'),
      K(R, 'Welk leerdoel is het best?', it[1], [it[2], it[3]], 'Kies het leerdoel dat zegt wat je doet, wanneer, en dat je echt kunt halen.', fm)
    ]);
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'reflect-feedback', niveau:'1F', domein:'schrijven', naam:'Feedback en reflectie', kd:['nl5A.a', 'nl5A.b', 'nl5A.c', 'nl5A.d'],
        uit:'Van feedback en terugkijken leer je het meest. Hier oefen je tops en tips geven, feedback ontvangen, je tekst nakijken met een checklist, nadenken over je aanpak en een goed leerdoel kiezen.' },
      doelen:[
        { id:'reflect-feedback-toptip', naam:'Tops en tips geven', kort:'Een top zegt precies wat goed was; een tip is concreet en vriendelijk',
          uit:'<p>Met <b>tops en tips</b> help je een ander verder.</p><p>Een goede <b>top</b> noemt precies wat er goed was: <i>Je foto’s lieten goed zien hoe groot een walvishaai is.</i> Niet alleen: <i>goed gedaan</i>.</p><p>Een goede <b>tip</b> is <b>concreet</b> (wat kan de ander doen?) en <b>vriendelijk</b>: <i>Probeer de klas vaker aan te kijken.</i></p>',
          wanneer:'je feedback geeft op een tekst of presentatie van een klasgenoot.',
          maak:function(R){ return maakTopTip(R, R.kies(TOPTIP)); } },
        { id:'reflect-feedback-ontvang', naam:'Feedback ontvangen', kort:'Bedank, vraag door en doe er iets concreets mee',
          uit:'<p>Feedback krijgen is niet altijd fijn. Toch leer je er het meest van.</p><p>1 <b>Luister</b> en bedank de ander. 2 <b>Vraag door</b> als je niet precies weet wat hij bedoelt. 3 Bedenk wat je er <b>concreet</b> mee gaat doen.</p><p>Niet doen: jezelf verdedigen, of er niets mee doen.</p>',
          wanneer:'je feedback krijgt van een docent of klasgenoot.',
          maak:function(R){ return maakOntvang(R, R.kies(ONTVANG)); } },
        { id:'reflect-feedback-check', naam:'Nakijken met een checklist', kort:'Loop elk punt van de checklist langs en verbeter wat niet klopt',
          uit:'<p>Met een <b>checklist</b> kijk je je eigen tekst na. Je loopt de punten <b>één voor één</b> langs.</p><p>Bijvoorbeeld: staat er een <b>kop</b>? Begint elke zin met een <b>hoofdletter</b> en eindigt hij met een <b>punt</b>? Is er een <b>slotzin</b>? Zijn de <b>werkwoorden</b> goed gespeld?</p><p>Klopt een punt niet? Dan verbeter je precies dat.</p>',
          wanneer:'je een tekst af hebt en hem wilt nakijken voor je hem inlevert.',
          maak:function(R){ return maakNakijk(R, R.kies(NAKIJK)); } },
        { id:'reflect-feedback-aanpak', naam:'Reflecteren op je aanpak', kort:'Wat ging er mis in je aanpak, en wat doe je volgende keer anders?',
          uit:'<p><b>Reflecteren</b> is terugkijken op hoe je iets hebt aangepakt.</p><p>Vraag je af: wat ging goed, en wat ging er mis in <b>mijn aanpak</b>? Zoek iets wat je <b>zelf</b> anders had kunnen doen, niet de schuld bij de opdracht of bij anderen.</p><p>Bedenk dan wat je <b>volgende keer</b> concreet anders doet.</p>',
          wanneer:'je een opdracht terugkrijgt en wilt leren van wat er gebeurde.',
          maak:function(R){ return maakAanpak(R, R.kies(AANPAK)); } },
        { id:'reflect-feedback-leerdoel', naam:'Een goed leerdoel', kort:'Concreet en haalbaar: wat ga je doen, en wanneer?',
          uit:'<p>Een goed <b>leerdoel</b> is <b>concreet</b>: je weet wat je gaat doen en wanneer. <i>Bij mijn volgende presentatie gebruik ik alleen steekwoorden.</i></p><p>En het is <b>haalbaar</b>: je kunt het echt halen. <i>Ik wil nooit meer zenuwachtig zijn</i> lukt niemand.</p><p><i>Ik wil beter presenteren</i> is te vaag: wat ga je dan doen?</p>',
          wanneer:'je na feedback bedenkt wat je volgende keer wilt verbeteren.',
          maak:function(R){ return maakLeerdoel(R, R.kies(LEERDOEL)); } }
      ] }
  ]);

  /* ================= TEKSTEN SCHRIJVEN ================= */

  /* samenvatting: { t:[drie alinea's], k:[drie kernzinnen], x:'zin die er niet in hoort' } */
  var SAMV = [
    { t:['Nederland is een echt fietsland. Er zijn hier meer fietsen dan inwoners. Bijna iedereen heeft er minstens één.', 'Dat komt onder andere doordat ons land zo plat is. Je hoeft bijna nooit een berg op. Ook zijn er veel fietspaden, apart van de auto’s.', 'Fietsen is bovendien gezond en goed voor het milieu. Wie fietst, beweegt elke dag en stoot geen uitlaatgassen uit.'],
      k:['In Nederland zijn meer fietsen dan inwoners.', 'Dat komt doordat het land plat is en er veel fietspaden zijn.', 'Fietsen is ook gezond en goed voor het milieu.'], x:'Ik vind fietsen in de regen echt verschrikkelijk.' },
    { t:['Veel jongeren slapen te weinig. Ze hebben zo’n negen uur slaap nodig, maar halen dat vaak niet.', 'Een belangrijke oorzaak is het scherm. Wie ’s avonds laat nog op zijn telefoon zit, valt later in slaap.', 'Te weinig slaap heeft gevolgen. Je kunt je slechter concentreren en je wordt sneller ziek.'],
      k:['Veel jongeren slapen minder dan de negen uur die ze nodig hebben.', 'Een oorzaak is dat ze ’s avonds laat nog op hun telefoon zitten.', 'Daardoor concentreren ze zich slechter en worden ze sneller ziek.'], x:'Mijn broer zit zelfs tot twee uur ’s nachts te gamen.' },
    { t:['In de oceanen drijft enorm veel plastic. Een deel daarvan komt van afval dat mensen op straat of op het strand laten liggen.', 'Dieren zien het plastic vaak aan voor eten. Schildpadden eten plastic zakjes, omdat die op kwallen lijken.', 'Iedereen kan helpen door minder plastic te gebruiken en zijn afval goed weg te gooien.'],
      k:['In de oceanen drijft veel plastic, deels van afval dat mensen laten liggen.', 'Dieren zien dat plastic aan voor eten.', 'Je kunt helpen door minder plastic te gebruiken en afval goed weg te gooien.'], x:'Schildpadden zijn mijn lievelingsdieren.' },
    { t:['Sinds een paar jaar leven er weer wolven in Nederland. Ze kwamen vanzelf uit Duitsland.', 'Niet iedereen is daar blij mee. Sommige wolven doden schapen, en boeren zijn daar boos over.', 'Natuurorganisaties wijzen erop dat de wolf de natuur in balans helpt houden. Hij jaagt vooral op zieke en zwakke dieren, zoals herten.'],
      k:['Er leven weer wolven in Nederland, die uit Duitsland kwamen.', 'Boeren zijn boos, omdat wolven schapen doden.', 'Natuurorganisaties zeggen dat de wolf de natuur in balans houdt.'], x:'Volgens mij moeten we de wolven gewoon eten geven.' },
    { t:['Chocolade wordt gemaakt van cacaobonen. Die groeien aan bomen in warme landen, zoals Ivoorkust en Ghana.', 'De bonen worden gedroogd, geroosterd en gemalen. Daarna mengt men ze met suiker en vaak ook met melk.', 'Veel cacaoboeren verdienen erg weinig. Daarom zijn er keurmerken die zorgen voor een eerlijkere prijs.'],
      k:['Chocolade komt van cacaobonen uit warme landen.', 'De bonen worden gedroogd, geroosterd, gemalen en gemengd met suiker.', 'Veel cacaoboeren verdienen weinig, daarom zijn er keurmerken.'], x:'Pure chocolade is veel lekkerder dan melkchocolade.' },
    { t:['Bijna alle jongeren gamen weleens. Veel van hen doen dat elke week een paar uur.', 'Gamen kan goed zijn. Je traint je reactiesnelheid en je leert samenwerken in een team.', 'Toch is te veel gamen niet goed. Wie de hele dag speelt, beweegt te weinig en slaapt slechter.'],
      k:['Bijna alle jongeren gamen.', 'Gamen kan je reactie en samenwerking trainen.', 'Te veel gamen zorgt voor te weinig beweging en slechter slapen.'], x:'Mijn favoriete game is een voetbalspel.' },
    { t:['In Nederland scheiden we ons afval. Papier, glas, plastic en groente-afval gaan apart.', 'Gescheiden afval kan opnieuw gebruikt worden. Van oud papier maken fabrieken bijvoorbeeld nieuw papier.', 'Toch gaat het vaak mis. Veel mensen gooien plastic bij het restafval, en dan kan het niet meer opnieuw gebruikt worden.'],
      k:['In Nederland scheiden we papier, glas, plastic en groente-afval.', 'Gescheiden afval kan opnieuw gebruikt worden.', 'Het gaat vaak mis, omdat mensen plastic bij het restafval gooien.'], x:'Bij ons thuis staat de papierbak in de schuur.' },
    { t:['In de nacht van 31 januari op 1 februari 1953 braken in Zeeland en Zuid-Holland op veel plekken de dijken door.', 'Het water overstroomde grote delen van het land. Er kwamen meer dan achttienhonderd mensen om.', 'Na de ramp besloot de regering tot de Deltawerken. Met grote dammen en keringen wordt het land nu beter beschermd.'],
      k:['In 1953 braken in Zeeland en Zuid-Holland de dijken door.', 'Meer dan achttienhonderd mensen kwamen om.', 'Daarna werden de Deltawerken gebouwd om het land te beschermen.'], x:'Mijn overgrootmoeder vertelde er vaak over.' },
    { t:['Veel jongeren slaan het ontbijt over. Ze hebben ’s ochtends geen honger of geen tijd.', 'Toch is ontbijten belangrijk. Je lichaam heeft na de nacht energie nodig om goed te kunnen werken.', 'Een snel ontbijt kan al genoeg zijn, zoals een boterham, een banaan of een bakje yoghurt.'],
      k:['Veel jongeren slaan het ontbijt over.', 'Ontbijten is belangrijk, omdat je lichaam na de nacht energie nodig heeft.', 'Een snel ontbijt, zoals een boterham of een banaan, is al genoeg.'], x:'Ik eet zelf het liefst hagelslag.' },
    { t:['Ongeveer tweeduizend jaar geleden kwamen de Romeinen naar Nederland. De Rijn vormde de grens van hun rijk.', 'Langs de rivier bouwden ze forten en wegen. Uit sommige van die forten groeiden later steden, zoals Utrecht.', 'Ze brachten ook nieuwe dingen mee, zoals stenen huizen en badhuizen.'],
      k:['Tweeduizend jaar geleden kwamen de Romeinen naar Nederland, tot aan de Rijn.', 'Ze bouwden forten en wegen, waaruit later steden groeiden.', 'Ze brachten ook nieuwe dingen mee, zoals stenen huizen.'], x:'Ik zou zelf graag een Romeins fort bezoeken.' },
    { t:['Op steeds meer daken liggen zonnepanelen. Ze maken stroom van zonlicht.', 'Dat is goed voor het milieu, want er worden geen kolen of gas voor verbrand.', 'Een nadeel is dat ze ’s nachts en bij weinig zon minder stroom geven. Daarom zoekt men naar manieren om stroom op te slaan.'],
      k:['Steeds meer daken hebben zonnepanelen die stroom maken van zonlicht.', 'Dat is goed voor het milieu.', 'Een nadeel is dat ze bij weinig zon minder stroom geven.'], x:'Mijn buurman heeft wel twintig panelen op zijn dak.' },
    { t:['De bibliotheek is meer dan een plek met boeken. Je kunt er ook studeren, computers gebruiken en cursussen volgen.', 'Voor jongeren tot achttien jaar is een abonnement bij de meeste bibliotheken gratis.', 'Toch komen veel jongeren er nooit. Ze weten vaak niet wat de bibliotheek allemaal te bieden heeft.'],
      k:['In de bibliotheek kun je ook studeren, computers gebruiken en cursussen volgen.', 'Voor jongeren is een abonnement meestal gratis.', 'Toch komen veel jongeren er nooit, omdat ze niet weten wat er te doen is.'], x:'De bieb bij mij in de buurt heeft heel fijne stoelen.' }
  ];
  var LET = ['A', 'B', 'C', 'D'];
  function rond5(x){ return Math.max(10, Math.round(x / 5) * 5); }
  function maakSamv(R, it){
    var zinnen = R.hussel([{ z:it.k[0], i:0 }, { z:it.k[1], i:1 }, { z:it.k[2], i:2 }, { z:it.x, i:-1 }]);
    var letter = function(i){ for (var j = 0; j < 4; j++) if (zinnen[j].i === i) return LET[j]; };
    var n = it.t.join(' ').split(/\s+/).length, m = rond5(it.k.join(' ').split(/\s+/).length);
    var orde = [letter(0), letter(1), letter(2)], goed = orde.join(', ');
    var f1 = [orde[1], orde[0], orde[2]].join(', '), f2 = [orde[0], orde[2], orde[1]].join(', ');
    var ctx = tekst(it.t) + '<p><b>Zinnen voor je samenvatting</b><br>' + zinnen.map(function(s, j){ return LET[j] + ' ' + s.z; }).join('<br>') + '</p>';
    return OP('Wat is de goede volgorde voor je samenvatting?', ctx, [
      K(R, 'De tekst heeft ongeveer ' + n + ' woorden. Hoe lang wordt je samenvatting ongeveer?', 'ongeveer ' + m + ' woorden', ['ongeveer ' + rond5(n) + ' woorden', 'ongeveer ' + rond5(n * 2) + ' woorden'], 'Een samenvatting is veel korter dan de tekst: per alinea houd je alleen de kern over, in één zin.'),
      K(R, 'Welke zin hoort niet in de samenvatting?', 'zin ' + letter(-1), LET.map(function(l){ return 'zin ' + l; }), 'Een samenvatting heeft geen eigen mening en geen eigen voorbeelden. Welke zin staat niet in de tekst?'),
      K(R, 'Welke zin komt als eerste?', 'zin ' + orde[0], orde.map(function(l){ return 'zin ' + l; }), 'Houd de volgorde van de tekst aan. Welke zin hoort bij de eerste alinea?'),
      K(R, 'Wat is de goede volgorde voor je samenvatting?', goed, [f1, f2], 'Eerst de zin bij alinea 1 (zin ' + orde[0] + '), dan alinea 2, dan alinea 3.')
    ]);
  }

  /* verslag: [onderzoek, inleiding, werkwijze, resultaten, conclusie] */
  var DEEL = ['inleiding', 'werkwijze', 'resultaten', 'conclusie'];
  var DEELWAT = { inleiding:'hij vertelt wat je wilde onderzoeken', werkwijze:'hij vertelt hoe je het onderzoek hebt gedaan', resultaten:'hij vertelt wat je hebt gemeten of gevonden', conclusie:'hij geeft antwoord op de onderzoeksvraag' };
  var VERSLAG = [
    ['ijs en zout', 'Wij wilden weten of ijs sneller smelt als er zout op ligt.', 'We legden twee ijsblokjes op een bord en strooiden zout op één ervan. Om de vijf minuten keken we hoeveel er nog over was.', 'Het ijsblokje met zout was na twintig minuten gesmolten, het andere na dertig minuten.', 'IJs smelt dus sneller als er zout op ligt.'],
    ['fietsen naar school', 'Onze vraag was: hoeveel leerlingen uit onze klas fietsen naar school?', 'We lieten alle 28 leerlingen van de klas een vragenlijst invullen.', 'Van de 28 leerlingen fietsen er 21 naar school. Vier komen met de bus en drie lopen.', 'De meeste leerlingen uit onze klas fietsen dus naar school.'],
    ['schermtijd', 'We onderzochten hoeveel tijd leerlingen per dag op hun telefoon zitten.', 'Tien leerlingen keken een week lang elke avond naar hun schermtijd en schreven die op.', 'Gemiddeld zaten ze drie uur per dag op hun telefoon.', 'Leerlingen zitten dus veel op hun telefoon: gemiddeld drie uur per dag.'],
    ['papieren vliegtuigjes', 'We wilden weten welk papieren vliegtuigje het verst vliegt: een smal of een breed model.', 'We vouwden van elk model drie vliegtuigjes en gooiden ze allemaal vanaf dezelfde plek.', 'De smalle vliegtuigjes vlogen gemiddeld 8 meter, de brede 5 meter.', 'Het smalle model vliegt dus het verst.'],
    ['afval in de kantine', 'Onze vraag was: hoeveel afval komt er na één pauze in de kantine terecht?', 'Na de grote pauze hebben we alle prullenbakken in de kantine gewogen.', 'Samen woog het afval 6 kilo, vooral plastic flesjes en papier.', 'Na één pauze ligt er dus zo’n 6 kilo afval, vooral plastic en papier.']
  ];
  function maakVerslag(R, it){
    var d = R.heel(0, 3), deel = DEEL[d];
    return OP('In welk deel van het verslag hoort deze zin?', tekst('<i>Een verslag over ' + it[0] + '.</i>') + tekst(it[d + 1]), [
      K(R, 'Wat doet deze zin?', DEELWAT[deel], DEEL.filter(function(x){ return x !== deel; }).map(function(x){ return DEELWAT[x]; }), 'Vertelt de zin wat je wilde weten, wat je deed, wat je vond, of wat het antwoord is?'),
      K(R, 'In welk deel van het verslag hoort deze zin?', deel, DEEL, 'Een zin die ' + DEELWAT[deel].replace('hij ', '') + ', hoort in de ' + deel + '.')
    ]);
  }

  /* recensie schrijven: [soort, titel, oordeel, samenvatting, vraag, argument, niet over het werk, vaag, slot, nieuw argument, iets anders] */
  var RECSCHRIJF = [
    ['de film', 'De laatste trein', 'De laatste trein is een spannende film die je tot het eind vasthoudt.', 'De laatste trein gaat over een meisje dat in een trein vastzit.', 'Zou De laatste trein een goede film zijn?', 'Door de korte, snelle scènes zit je de hele tijd op het puntje van je stoel.', 'Ik keek de film met mijn nichtje.', 'De film is gewoon echt goed.', 'Hou je van spanning? Ga dan zeker kijken.', 'Ook de muziek is trouwens heel mooi.', 'Morgen ga ik naar de verjaardag van mijn opa.'],
    ['het boek', 'Het eiland', 'Het eiland is een teleurstellend boek.', 'Het eiland gaat over vier kinderen op een onbewoond eiland.', 'Is Het eiland een goed boek?', 'De personages praten allemaal hetzelfde, waardoor je ze niet uit elkaar houdt.', 'Ik heb het boek van mijn tante gekregen.', 'Het is gewoon geen leuk boek.', 'Wil je een goed avonturenboek? Kies dan liever een ander boek.', 'De kaft is trouwens wel mooi.', 'Ik ga nu mijn huiswerk maken.'],
    ['de game', 'Ruimtekoerier', 'Ruimtekoerier is de leukste game van dit jaar.', 'In Ruimtekoerier bezorg je pakketjes op andere planeten.', 'Wat zou Ruimtekoerier voor game zijn?', 'Elke planeet heeft eigen regels, dus je moet steeds een nieuwe aanpak bedenken.', 'Mijn beste vriend speelt het ook.', 'Het is echt een vette game.', 'Hou je van puzzelen en de ruimte? Dan moet je deze game spelen.', 'De prijs is ook nog eens laag.', 'Mijn controller is trouwens kapot.'],
    ['de serie', 'Klas 2C', 'Klas 2C is een grappige serie, maar het verhaal is te voorspelbaar.', 'Klas 2C gaat over een brugklas op een school in Utrecht.', 'Is Klas 2C de moeite waard?', 'Na de eerste aflevering weet je al precies hoe elke aflevering afloopt.', 'Ik keek het op mijn telefoon in de bus.', 'Het is gewoon een beetje zo zo.', 'Wil je lachen zonder na te denken? Dan is deze serie iets voor jou.', 'De acteur die de leraar speelt, is ook goed.', 'Volgende week begint mijn vakantie.'],
    ['het boek', 'Sterker dan ijzer', 'Sterker dan ijzer is een ontroerend en sterk boek.', 'Sterker dan ijzer gaat over Fenna, die opnieuw moet leren lopen.', 'Heb jij Sterker dan ijzer al gelezen?', 'De schrijver laat de gedachten van Fenna zo eerlijk zien dat je echt met haar meeleeft.', 'Het boek lag in de bieb bij de ingang.', 'Het boek is gewoon heel mooi.', 'Een aanrader voor iedereen die van echte verhalen houdt.', 'Ook de bladzijden zijn lekker dik.', 'Ik heb morgen een toets.'],
    ['de film', 'Robotvriend', 'Robotvriend is een saaie film.', 'Robotvriend gaat over een jongen die een robot bouwt.', 'Moet je naar Robotvriend gaan?', 'In het eerste uur gebeurt er bijna niets: de robot wordt alleen maar gebouwd.', 'De popcorn in de bioscoop was koud.', 'Het is echt een stomme film.', 'Zoek je een spannende film? Sla deze dan maar over.', 'De robot was wel mooi gemaakt.', 'Ik ging met de bus naar de bioscoop.'],
    ['de musical', 'De schoolmusical', 'De schoolmusical van dit jaar was een groot succes.', 'De musical ging over een school die dicht zou gaan.', 'Hoe zou de musical zijn geweest?', 'De zang was sterk: na het slotlied stond de hele zaal te klappen.', 'Ik zat naast de moeder van een klasgenoot.', 'Het was gewoon heel goed.', 'Mis de musical volgend jaar niet!', 'Het decor was trouwens ook mooi.', 'De kantine was die avond dicht.'],
    ['het album', 'Middernacht', 'Het nieuwe album Middernacht heeft mooie liedjes, maar ze lijken te veel op elkaar.', 'Middernacht is het nieuwe album van zangeres Lune.', 'Is Middernacht een goed album?', 'Bijna elk nummer heeft hetzelfde rustige tempo, waardoor je na vijf nummers afhaakt.', 'Ik luisterde het album op de fiets.', 'Het is een beetje matig.', 'Fijn om op de achtergrond te luisteren, maar verwacht geen verrassingen.', 'Ook de hoes is mooi.', 'Ik ga nu naar voetbal.'],
    ['het boek', 'De draak in de schuur', 'De draak in de schuur is een heerlijk grappig boek.', 'De draak in de schuur gaat over Daan, die een drakenei vindt.', 'Wat vind jij van De draak in de schuur?', 'De draak doet zulke rare dingen dat je steeds hardop moet lachen.', 'Ik heb het boek in de vakantie gelezen.', 'Het is gewoon een leuk boek.', 'Wil je lachen? Lees dan dit boek.', 'De tekeningen zijn ook mooi.', 'Mijn zus leest liever strips.'],
    ['de game', 'Bouwmeester', 'Bouwmeester is een teleurstellende game.', 'In Bouwmeester bouw je je eigen stad.', 'Is Bouwmeester leuk?', 'De game loopt steeds vast, en dan ben je alles kwijt wat je gebouwd hebt.', 'Mijn broer speelt het elke dag.', 'Het is gewoon een slechte game.', 'Wacht liever tot de makers de fouten hebben opgelost.', 'De muziek is wel goed.', 'Ik heb een nieuwe telefoon.'],
    ['de serie', 'Het verborgen dorp', 'Het verborgen dorp is een spannende serie die je in één keer wilt uitkijken.', 'Het verborgen dorp gaat over een dorp waar mensen verdwijnen.', 'Moet je Het verborgen dorp kijken?', 'Elke aflevering eindigt op een spannend moment, dus je wilt meteen verder.', 'Ik keek het samen met mijn vader.', 'Het is echt een toffe serie.', 'Hou je van een mysterie? Dan is dit jouw serie.', 'De acteurs zijn ook goed.', 'Ik ga zo eten.'],
    ['de film', 'Kampioen', 'Kampioen is een mooie sportfilm, alleen het einde is te zoetsappig.', 'Kampioen gaat over een meisje dat bokser wil worden.', 'Is Kampioen een goede film?', 'Aan het eind is alles opeens opgelost, zonder dat je snapt hoe.', 'De bioscoopstoelen waren heel zacht.', 'Het einde is niet zo goed.', 'Een fijne film voor sportfans, als je een zoet einde niet erg vindt.', 'De bokswedstrijden zien er ook echt uit.', 'Ik heb morgen training.']
  ];
  function maakRecSchrijf(R, it){
    var fm = {}; fm[it[3]] = 'Dat is een samenvatting, geen oordeel.'; fm[it[4]] = 'Dat is een vraag: je zegt niet wat jij ervan vindt.';
    fm[it[6]] = 'Dat gaat niet over ' + it[0] + ' zelf.'; fm[it[7]] = 'Dat is te vaag: wat is er dan goed of slecht aan?';
    fm[it[9]] = 'Dat is een nieuw argument. Dat hoort niet in het slot.'; fm[it[10]] = 'Dat heeft niets met de recensie te maken.';
    return OP('Welke slotzin past bij je recensie?', tekst('Je schrijft een recensie over ' + it[0] + ' <i>' + it[1] + '</i>.'), [
      K(R, 'Welke zin geeft een duidelijk oordeel?', it[2], [it[3], it[4]], 'Een oordeel zegt wat jij ervan vindt: goed, slecht, of allebei.', fm),
      K(R, 'Welk argument past bij dat oordeel?', it[5], [it[6], it[7]], 'Een goed argument noemt iets concreets uit ' + it[0] + ' zelf.', fm),
      K(R, 'Welke slotzin past bij je recensie?', it[8], [it[9], it[10]], 'Sluit af met een advies aan de lezer: voor wie is het wel of niet iets?', fm)
    ]);
  }

  /* verhaal opbouwen: [begin, midden, hoogtepunt, slot] */
  var VDEEL = ['het begin', 'het midden', 'het hoogtepunt', 'het slot'];
  var VWAT = ['je maakt kennis met de hoofdpersoon en het probleem', 'het probleem wordt groter en de spanning stijgt', 'het spannendste moment: nu gaat het gebeuren', 'het probleem is opgelost en het verhaal loopt af'];
  var VERHAAL = [
    ['Lina woont met haar kat Pip in een flat. Op een ochtend is Pip verdwenen.', 'Lina zoekt overal. Ze hangt briefjes op, maar niemand heeft Pip gezien. Het begint te regenen.', 'Dan hoort ze zacht gemiauw uit de schuur van de buurjongen. Ze trekt de deur open.', 'Pip springt in haar armen. Die avond ligt hij weer spinnend op haar bed.'],
    ['Sem kan heel goed zingen, maar hij durft niet op te treden. Toch schrijft hij zich in voor de talentenshow.', 'Bij de repetities vergeet hij zijn tekst. Hij wil zich afmelden, maar zijn vrienden overtuigen hem om door te gaan.', 'Dan staat hij op het podium. Het licht gaat aan, de zaal is stil, en hij opent zijn mond.', 'Na het laatste woord klinkt applaus. Sem is trots, ook al heeft hij niet gewonnen.'],
    ['Tijdens het schoolkamp gaat Daan met twee vrienden het bos in om hout te zoeken.', 'Ze lopen steeds verder en raken de weg kwijt. Het wordt donker en hun telefoons hebben geen bereik.', 'Opeens horen ze takken kraken. Er komt iets met een lamp recht op hen af.', 'Het is de kampleider. Opgelucht lopen ze met hem mee terug naar het kampvuur.'],
    ['Mila zit in het hockeyteam dat voor het eerst in de finale staat. Niemand verwacht dat ze winnen.', 'In de eerste helft staat haar team met 2-0 achter. In de rust praat de trainer het team moed in, en ze maken twee doelpunten.', 'Het is 2-2 en er volgen strafballen. Mila moet de laatste nemen.', 'Ze scoort. Het team wint de beker en viert het tot laat in de kantine.'],
    ['Ilias vindt op zolder een oude kist van zijn opa, met een slot erop.', 'Hij zoekt de sleutel overal. Zijn moeder zegt dat hij de kist moet laten staan, en dat maakt hem nog nieuwsgieriger.', 'In de oude jas van opa vindt hij een sleutel. Met trillende handen draait hij hem om in het slot.', 'In de kist liggen brieven over hoe opa naar Nederland kwam. Ilias leest ze samen met zijn moeder.'],
    ['Noor en Lisa zijn al jaren beste vriendinnen, tot Lisa een geheim van Noor doorvertelt.', 'Noor praat niet meer met Lisa. Op school ontlopen ze elkaar, en het wordt steeds erger.', 'Op schoolkamp moeten ze samen een tent opzetten in de stromende regen. Lisa begint te huilen.', 'Ze praten het uit en maken het goed. De tent staat scheef, maar ze lachen erom.']
  ];
  function maakVerhaal(R, it){
    var d = R.heel(0, 3);
    return OP('Waar hoort dit stukje in het verhaal?', tekst(it[d]), [
      K(R, 'Wat gebeurt er in dit stukje?', VWAT[d], VWAT.filter(function(x, i){ return i !== d; }), 'Leer je iemand kennen, wordt het steeds spannender, is dit het spannendste moment, of is het probleem opgelost?'),
      K(R, 'Waar hoort dit stukje in het verhaal?', VDEEL[d], VDEEL, 'In dit stukje: ' + VWAT[d] + '. Waar in de spanningsboog hoort dat?')
    ]);
  }

  /* instructie: [onderwerp, [vier stappen in de goede volgorde]] */
  var INSTR = [
    ['Een tosti maken', ['Pak twee boterhammen.', 'Leg kaas op één boterham.', 'Leg de andere boterham erop.', 'Bak de tosti drie minuten in het tosti-ijzer.']],
    ['Thee zetten', ['Vul de waterkoker met water.', 'Zet de waterkoker aan.', 'Giet het kokende water op het theezakje.', 'Haal het zakje er na drie minuten uit.']],
    ['Een plant verpotten', ['Haal de plant uit de oude pot.', 'Doe een laagje aarde in de nieuwe pot.', 'Zet de plant in de nieuwe pot.', 'Vul de pot aan met aarde en geef water.']],
    ['Een bestand opslaan', ['Klik op Bestand.', 'Klik op Opslaan als.', 'Typ een naam voor je bestand.', 'Klik op Opslaan.']],
    ['Pannenkoeken bakken', ['Meng het meel met de melk en de eieren.', 'Smelt een klontje boter in de pan.', 'Giet een laagje beslag in de pan.', 'Keer de pannenkoek om als de onderkant bruin is.']],
    ['Een e-mail sturen', ['Klik op Nieuw bericht.', 'Typ het e-mailadres van de ontvanger.', 'Schrijf je bericht.', 'Klik op Verzenden.']],
    ['Je handen wassen', ['Maak je handen nat.', 'Doe zeep op je handen.', 'Wrijf je handen twintig seconden in.', 'Spoel de zeep af en droog je handen.']],
    ['Een tent opzetten', ['Leg het grondzeil op de grond.', 'Zet de stokken in elkaar.', 'Hang het tentdoek aan de stokken.', 'Zet de tent vast met haringen.']],
    ['Een ei koken', ['Vul een pan met water.', 'Breng het water aan de kook.', 'Leg het ei voorzichtig in het kokende water.', 'Haal het ei er na zeven minuten uit.']],
    ['Een broodje gezond maken', ['Snijd het broodje open.', 'Smeer er boter op.', 'Leg er kaas, ham, tomaat en sla op.', 'Doe het broodje dicht.']],
    ['Een cadeau inpakken', ['Leg het cadeau op het papier.', 'Vouw het papier om het cadeau.', 'Plak het papier vast met plakband.', 'Plak er een kaartje met je naam op.']],
    ['Een fietsband oppompen', ['Draai het dopje van het ventiel.', 'Zet de pomp op het ventiel.', 'Pomp tot de band hard is.', 'Draai het dopje weer op het ventiel.']]
  ];
  function maakInstr(R, it){
    var st = R.hussel(it[1].map(function(z, i){ return { z:z, i:i }; }));
    var L = function(i){ for (var j = 0; j < 4; j++) if (st[j].i === i) return LET[j]; };
    var orde = [L(0), L(1), L(2), L(3)], goed = orde.join(', ');
    var f1 = [orde[1], orde[0], orde[2], orde[3]].join(', '), f2 = [orde[0], orde[1], orde[3], orde[2]].join(', ');
    var ctx = tekst(st.map(function(s, j){ return '<b>' + LET[j] + '</b> ' + s.z; }), it[0]);
    return OP('Wat is de goede volgorde?', ctx, [
      K(R, 'Welke stap komt als eerste?', 'stap ' + orde[0], LET.map(function(l){ return 'stap ' + l; }), 'Wat moet je doen voordat je met de rest kunt beginnen?'),
      K(R, 'Welke stap komt als laatste?', 'stap ' + orde[3], LET.map(function(l){ return 'stap ' + l; }), 'Na welke stap ben je klaar?'),
      K(R, 'Wat is de goede volgorde?', goed, [f1, f2], 'Begin met stap ' + orde[0] + ' en eindig met stap ' + orde[3] + '. Wat moet er daartussen eerst?')
    ]);
  }

  /* gebiedende wijs: [je-zin, hele werkwoord, stam, goede instructie, je-vorm, stam met t] */
  var GEBIED = [
    ['Je moet de eieren breken.', 'breken', 'breek', 'Breek de eieren.', 'Je breekt de eieren.', 'Breekt de eieren.'],
    ['Je moet de ui snijden.', 'snijden', 'snijd', 'Snijd de ui.', 'Je snijdt de ui.', 'Snijdt de ui.'],
    ['Je moet de pan op het vuur zetten.', 'zetten', 'zet', 'Zet de pan op het vuur.', 'Je zet de pan op het vuur.', 'De pan wordt op het vuur gezet.'],
    ['Je moet tien minuten wachten.', 'wachten', 'wacht', 'Wacht tien minuten.', 'Je wacht tien minuten.', 'Er wordt tien minuten gewacht.'],
    ['Je moet het water over de thee gieten.', 'gieten', 'giet', 'Giet het water over de thee.', 'Je giet het water over de thee.', 'Het water wordt over de thee gegoten.'],
    ['Je moet de soep goed roeren.', 'roeren', 'roer', 'Roer de soep goed.', 'Je roert de soep goed.', 'Roert de soep goed.'],
    ['Je moet het papier dubbel vouwen.', 'vouwen', 'vouw', 'Vouw het papier dubbel.', 'Je vouwt het papier dubbel.', 'Vouwt het papier dubbel.'],
    ['Je moet op de groene knop drukken.', 'drukken', 'druk', 'Druk op de groene knop.', 'Je drukt op de groene knop.', 'Drukt op de groene knop.'],
    ['Je moet een kleur kiezen.', 'kiezen', 'kies', 'Kies een kleur.', 'Je kiest een kleur.', 'Kiest een kleur.'],
    ['Je moet je naam typen.', 'typen', 'typ', 'Typ je naam.', 'Je typt je naam.', 'Typt je naam.'],
    ['Je moet de fles goed schudden.', 'schudden', 'schud', 'Schud de fles goed.', 'Je schudt de fles goed.', 'Schudt de fles goed.'],
    ['Je moet boter op het brood smeren.', 'smeren', 'smeer', 'Smeer boter op het brood.', 'Je smeert boter op het brood.', 'Smeert boter op het brood.'],
    ['Je moet de taart veertig minuten bakken.', 'bakken', 'bak', 'Bak de taart veertig minuten.', 'Je bakt de taart veertig minuten.', 'Bakt de taart veertig minuten.'],
    ['Je moet de lengte van de plank meten.', 'meten', 'meet', 'Meet de lengte van de plank.', 'Je meet de lengte van de plank.', 'De lengte van de plank wordt gemeten.'],
    ['Je moet de tekst eerst helemaal lezen.', 'lezen', 'lees', 'Lees de tekst eerst helemaal.', 'Je leest de tekst eerst helemaal.', 'Leest de tekst eerst helemaal.'],
    ['Je moet het meel wegen.', 'wegen', 'weeg', 'Weeg het meel.', 'Je weegt het meel.', 'Weegt het meel.'],
    ['Je moet het touw strak houden.', 'houden', ['houd', 'hou'], 'Houd het touw strak.', 'Je houdt het touw strak.', 'Houdt het touw strak.'],
    ['Je moet de schroef vast draaien.', 'draaien', 'draai', 'Draai de schroef vast.', 'Je draait de schroef vast.', 'Draait de schroef vast.']
  ];
  function maakGebied(R, it){
    var stam = [].concat(it[2]), fm = {}, sfm = {};
    sfm[stam[0] + 't'] = 'Bij de stam komt geen t. Haal alleen -en van het hele werkwoord af.';
    sfm[it[1]] = 'Dat is het hele werkwoord. Haal -en eraf voor de stam.';
    fm[it[4]] = 'Dat is een gewone zin met je. Een instructie begint met het werkwoord.';
    fm[it[5]] = it[5].toLowerCase().indexOf(stam[0] + 't ') === 0 ? 'Daar staat een t achter de stam. In een instructie gebruik je alleen de stam.' : 'Zo zeg je wat er gebeurt, maar je geeft geen opdracht. Een instructie begint met de stam van het werkwoord.';
    var s1 = { tekst:'Wat is de stam van ' + q(it[1]) + '?', antwoord:stam, hint:'Haal -en van ' + q(it[1]) + ' af. Een stam eindigt niet op twee dezelfde medeklinkers, een lange klank schrijf je met twee klinkers, en een z of v wordt een s of f.', fout:sfm };
    return OP('Hoe schrijf je de stap als instructie?', tekst(it[0]), [
      s1,
      K(R, 'Hoe schrijf je de stap als instructie?', it[3], [it[4], it[5]], 'Begin met de stam: ' + stam[0] + '. Laat je en moet weg.', fm)
    ]);
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'tekst-soort', niveau:'2F', domein:'schrijven', naam:'Teksten schrijven', kd:['nl3A.a', 'nl3A.c', 'nl3C.a', 'nl3C.b'],
        uit:'Elke tekstsoort heeft een eigen opbouw. Hier oefen je een samenvatting, een verslag, een recensie, een verhaal en een instructie: wat erin hoort, en in welke volgorde.' },
      doelen:[
        { id:'tekst-soort-samenvatting', naam:'Een samenvatting schrijven', kort:'Alleen de kern, in de volgorde van de tekst, en veel korter',
          uit:'<p>Een <b>samenvatting</b> geeft de kern van een tekst in je eigen woorden.</p><p>1 De <b>lengte</b>: veel korter dan de tekst. Per alinea houd je alleen de kern over. 2 Alleen wat in de tekst staat: <b>geen mening</b> en geen eigen voorbeelden. 3 De <b>volgorde</b> van de tekst: eerst de kern van alinea 1, dan alinea 2, enzovoort.</p>',
          wanneer:'je een tekst moet samenvatten voor school of om te leren.',
          maak:function(R){ return maakSamv(R, R.kies(SAMV)); } },
        { id:'tekst-soort-verslag', naam:'Een verslag opbouwen', kort:'Inleiding, werkwijze, resultaten en conclusie',
          uit:'<p>Een <b>verslag</b> van een onderzoek heeft vier delen.</p><p><b>Inleiding</b>: wat wilde je onderzoeken? <b>Werkwijze</b>: hoe heb je het gedaan? <b>Resultaten</b>: wat heb je gemeten of gevonden? <b>Conclusie</b>: wat is het antwoord op je vraag?</p>',
          wanneer:'je een verslag schrijft van een proefje, enquête of onderzoek.',
          maak:function(R){ return maakVerslag(R, R.kies(VERSLAG)); } },
        { id:'tekst-soort-recensie', naam:'Een recensie schrijven', kort:'Een duidelijk oordeel, een concreet argument en een advies aan het eind',
          uit:'<p>In een <b>recensie</b> geef je je <b>oordeel</b> over een boek, film, game of serie.</p><p>1 Een duidelijk <b>oordeel</b>: wat vind je ervan? 2 <b>Argumenten</b> die iets concreets noemen uit het werk zelf. 3 Een <b>slot</b> met een advies: voor wie is het wel of niet iets?</p><p>Een korte samenvatting mag, maar die is niet je oordeel.</p>',
          wanneer:'je je mening over een boek, film of game opschrijft voor anderen.',
          maak:function(R){ return maakRecSchrijf(R, R.kies(RECSCHRIJF)); } },
        { id:'tekst-soort-verhaal', naam:'Een verhaal opbouwen', kort:'Begin, midden met stijgende spanning, hoogtepunt en slot',
          uit:'<p>Een verhaal volgt een <b>spanningsboog</b>.</p><p><b>Begin</b>: je leert de hoofdpersoon en het probleem kennen. <b>Midden</b>: het probleem wordt groter, de spanning stijgt. <b>Hoogtepunt</b>: het spannendste moment. <b>Slot</b>: het probleem is opgelost en het verhaal loopt af.</p>',
          wanneer:'je een eigen verhaal schrijft of een verhaal wilt ontleden.',
          maak:function(R){ return maakVerhaal(R, R.kies(VERHAAL)); } },
        { id:'tekst-soort-instr-volg', naam:'Een instructie: de volgorde', kort:'Zet de stappen in de volgorde waarin je ze uitvoert',
          uit:'<p>Een <b>instructie</b> vertelt stap voor stap hoe je iets doet. De stappen staan in de <b>volgorde</b> waarin je ze uitvoert.</p><p>Vraag je bij elke stap af: wat moet ik eerst gedaan hebben? Je kunt pas thee schenken als het water kookt.</p>',
          wanneer:'je een handleiding, recept of stappenplan schrijft.',
          maak:function(R){ return maakInstr(R, R.kies(INSTR)); } },
        { id:'tekst-soort-instr-gebied', naam:'Een instructie: de gebiedende wijs', kort:'Begin elke stap met de stam van het werkwoord',
          uit:'<p>In een instructie schrijf je elke stap in de <b>gebiedende wijs</b>: je begint met de <b>stam</b> van het werkwoord.</p><p><i>Je moet de eieren breken</i> wordt <i>Breek de eieren.</i></p><p>De stam is het hele werkwoord min -en: <i>snijden</i> wordt <i>snijd</i>, <i>kiezen</i> wordt <i>kies</i>. Er komt geen t achter.</p>',
          wanneer:'je een recept of stappenplan schrijft.',
          maak:function(R){ return maakGebied(R, R.kies(GEBIED)); } }
      ] }
  ]);
})();
