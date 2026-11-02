/* De Sinterklaasquiz: van 1 tot en met 5 december is de dagelijkse uitdaging (dag.html) tien vragen
   over de geschiedenis van het feest. Elke vraag: t (thema, staat boven de vraag), v (vraag),
   o (antwoorden, het eerste is goed; dag.html husselt ze) en u (uitleg, ook als je het goed had).
   Bij twijfel over een feit staat er "volgens de overlevering" of "een verklaring", of het staat er niet.
   Over de Pietendiscussie gaat geen vraag.

   SINTQUIZ.kies(dag, zaad) geeft de tien van die dag (dag 1 tot en met 5): een vaste volgorde per jaar,
   en elke dag schuift acht plekken op, zodat twee dagen hoogstens twee vragen delen.
   SINTQUIZ.rijm(goed, dag) geeft een rijmpje van de Sint bij de score. */
window.SINTQUIZ = (function(){
  'use strict';
  var VRAGEN = [
    { t:'Nicolaas', v:'Waar was de echte Sint-Nicolaas bisschop?',
      o:['In Myra, in het huidige Turkije', 'In Madrid, in Spanje', 'In Rome, in Italië', 'In Utrecht, in Nederland'],
      u:'Nicolaas was in de vierde eeuw bisschop van Myra, een stad aan de zuidkust van het huidige Turkije. Dat Sinterklaas uit Spanje komt, hoort bij het verhaal dat veel later is ontstaan.' },
    { t:'Nicolaas', v:'In welke eeuw leefde Nicolaas van Myra volgens de overlevering?',
      o:['In de vierde eeuw na Christus', 'In de eerste eeuw voor Christus', 'In de twaalfde eeuw', 'In de zestiende eeuw'],
      u:'Volgens de overlevering leefde hij ongeveer van 270 tot 343. Over zijn leven is weinig zeker bekend: veel verhalen over hem zijn legenden die pas later zijn opgeschreven.' },
    { t:'Nicolaas', v:'Waar werd Nicolaas volgens de overlevering geboren?',
      o:['In Patara, in het huidige Turkije', 'In Sevilla, in Spanje', 'In Bari, in Italië', 'In Jeruzalem'],
      u:'Volgens de verhalen werd hij geboren in Patara, een havenstad niet ver van Myra. Beide steden lagen in Lycië, een gebied in het zuiden van het huidige Turkije.' },
    { t:'Nicolaas', v:'Hoe heet de stad Myra tegenwoordig?',
      o:['Demre', 'Istanbul', 'Izmir', 'Ankara'],
      u:'Myra heet nu Demre en ligt in het zuiden van Turkije. Er staat nog steeds een oude kerk die aan Sint-Nicolaas is gewijd.' },
    { t:'Nicolaas', v:'Waar liggen sinds 1087 de botten (relieken) van Sint-Nicolaas?',
      o:['In Bari, in Italië', 'In Myra, in Turkije', 'In Madrid, in Spanje', 'In Amsterdam'],
      u:'In 1087 namen zeelieden uit Bari de relieken mee uit Myra. Ze liggen nu in de Basiliek van San Nicola in Bari, in het zuiden van Italië.' },
    { t:'feestdag', v:'Wat herdenkt de kerk volgens de overlevering op 6 december?',
      o:['De dag waarop Nicolaas stierf', 'De dag waarop Nicolaas werd geboren', 'De dag waarop Nicolaas bisschop werd', 'De dag waarop Nicolaas naar Spanje reisde'],
      u:'De feestdag van een heilige is meestal zijn sterfdag. Volgens de overlevering stierf Nicolaas op 6 december. In het feest voor kinderen zeggen we dat de Sint dan jarig is.' },
    { t:'feestdag', v:'Waarom is pakjesavond in Nederland op 5 december?',
      o:['Het is de avond voor 6 december, de feestdag van Sint-Nicolaas', 'Op 5 december werd Nicolaas geboren', 'Op 5 december kwam de eerste stoomboot aan', 'Het is de kortste dag van het jaar'],
      u:'Een feest begon vroeger vaak al op de avond ervoor, de vooravond. Daarom vieren we in Nederland pakjesavond op 5 december, de avond voor de feestdag van Sint-Nicolaas.' },
    { t:'feestdag', v:'Wanneer krijgen kinderen in Vlaanderen meestal hun cadeautjes van de Sint?',
      o:['Op de ochtend van 6 december', 'Op de avond van 5 december', 'Op 25 december', 'Op 1 januari'],
      u:'In België komt de Sint in de nacht van 5 op 6 december. De kinderen vinden hun cadeautjes de volgende ochtend. In Nederland is het feest op de avond van 5 december.' },
    { t:'feestdag', v:'Wat zetten veel kinderen in Duitsland klaar voor 6 december, de Nikolaustag?',
      o:['Een laars of schoen', 'Een kerstboom', 'Een bord met koekjes', 'Een lege sok aan de schoorsteen'],
      u:'In Duitsland zetten kinderen op de avond van 5 december een laars of schoen klaar. Op de ochtend van 6 december zit er snoep of een klein cadeautje in. De sok aan de schoorsteen hoort bij de Amerikaanse kerst.' },
    { t:'legende', v:'In een bekende legende helpt Nicolaas drie arme meisjes. Hoe?',
      o:['Hij gooit in het geheim geld naar binnen, zodat ze kunnen trouwen', 'Hij geeft ze elk een paard', 'Hij neemt ze mee op zijn schip', 'Hij leert ze lezen en schrijven'],
      u:'Hun vader had geen geld voor een bruidsschat: geld of spullen die een bruid meekreeg in het huwelijk. Volgens de legende gooide Nicolaas \'s nachts in het geheim goud naar binnen. Dat past bij het stiekem cadeautjes geven van zijn feest.' },
    { t:'legende', v:'Volgens een bekende uitleg komt het schoen zetten uit de legende van de drie meisjes. Waar kwam het goud in die legende terecht?',
      o:['In schoenen of kousen die bij het vuur te drogen stonden', 'In een gat in de tuin', 'In een taart op tafel', 'In een fles in de zee'],
      u:'In latere versies van het verhaal valt het goud in schoenen of kousen die bij de haard te drogen stonden. Of het schoen zetten echt zo is ontstaan, weet niemand zeker.' },
    { t:'traditie', v:'Wat stoppen kinderen traditioneel in hun schoen voor het paard?',
      o:['Een wortel of wat hooi', 'Een stuk appeltaart', 'Een zak kruidnoten', 'Een kopje koffie'],
      u:'Een wortel, wat hooi of een klontje suiker voor het paard, en vaak een tekening voor de Sint. De volgende ochtend ligt er dan iets lekkers in de schoen.' },
    { t:'Nicolaas', v:'Van wie is Sint-Nicolaas onder meer de beschermheilige?',
      o:['Van kinderen en zeelieden', 'Van soldaten en ridders', 'Van artsen en verpleegkundigen', 'Van jagers en boswachters'],
      u:'Nicolaas is onder meer de beschermheilige van kinderen, zeelieden en handelaren. Soldaten hebben bijvoorbeeld Sint-Maarten en Sint-Joris, jagers Sint-Hubertus.' },
    { t:'legende', v:'Waarom is Nicolaas de beschermheilige van zeelieden?',
      o:['Volgens legenden redde hij schepen in een zware storm', 'Hij was zelf kapitein op een oorlogsschip', 'Hij bouwde de eerste vuurtoren', 'Hij ontdekte een zeeroute naar Spanje'],
      u:'Er gaan verschillende legenden rond waarin Nicolaas zeelieden in nood helpt en een storm laat bedaren. Daarom vereerden zeelieden en havensteden hem.' },
    { t:'Nederland', v:'Van welke Nederlandse stad is Sint-Nicolaas de beschermheilige?',
      o:['Amsterdam', 'Utrecht', 'Maastricht', '\'s-Hertogenbosch'],
      u:'Amsterdam was een stad van zeelieden en handelaren, en Nicolaas was hun beschermheilige. De Oude Kerk was aan hem gewijd, en tegenover het Centraal Station staat de Sint-Nicolaasbasiliek. Utrecht heeft Sint-Maarten, Maastricht Sint-Servaas en Den Bosch Sint-Jan.' },
    { t:'Nicolaas', v:'Nicolaas was bisschop. Wat is een bisschop?',
      o:['Een leider in de kerk, die de zorg heeft over een gebied', 'Een koning die over een eiland regeert', 'Een monnik die nooit zijn klooster uit komt', 'Een rechter in een Romeinse stad'],
      u:'Een bisschop is in de kerk de leider van een gebied, een bisdom. Bij plechtigheden draagt hij een mijter op zijn hoofd en een staf in zijn hand.' },
    { t:'kleding', v:'Hoe heet de hoge, puntige hoed van Sinterklaas?',
      o:['Een mijter', 'Een tulband', 'Een baret', 'Een kroon'],
      u:'De mijter is de hoed van een bisschop. Op de mijter van Sinterklaas staat vaak een kruis, omdat Nicolaas een christelijke heilige is.' },
    { t:'kleding', v:'Waar lijkt de kromme staf van een bisschop op?',
      o:['Op de staf van een herder', 'Op de wandelstok van een koning', 'Op een vishengel', 'Op de speer van een soldaat'],
      u:'De kromstaf lijkt op een herdersstaf. Een bisschop zorgt voor de gelovigen zoals een herder voor zijn schapen.' },
    { t:'naam', v:'Waar komt de naam Sinterklaas vandaan?',
      o:['Van Sint Nicolaas', 'Van een Spaanse koning die Klaas heette', 'Van het woord klaar: als alles klaar is', 'Van het Latijnse woord voor cadeau'],
      u:'Sinterklaas is een verbastering van Sint Nicolaas. Klaas is een korte vorm van de naam Nicolaas.' },
    { t:'Amerika', v:'Waar komt de naam Santa Claus vandaan?',
      o:['Van het Nederlandse Sinterklaas', 'Van het Franse Saint Nicolas', 'Van het Duitse Weihnachtsmann', 'Van het Engelse Father Christmas'],
      u:'Santa Claus is een Amerikaanse verbastering van het Nederlandse Sinterklaas. Hoe het feest precies in Amerika terechtkwam, weten historici niet helemaal zeker.' },
    { t:'Amerika', v:'Hoe heette New York toen het een Nederlandse kolonie was?',
      o:['Nieuw-Amsterdam', 'Nieuw-Holland', 'Nieuw-Zeeland', 'Nieuw-Rotterdam'],
      u:'Nederlanders stichtten in de zeventiende eeuw Nieuw-Amsterdam. In 1664 namen de Engelsen de stad over en noemden haar New York. Via deze Nederlanders zou Sinterklaas in Amerika zijn gekomen, maar hoeveel ze het feest daar vierden, is niet zeker.' },
    { t:'Amerika', v:'Een Amerikaans gedicht uit 1823 maakte Santa Claus wereldberoemd. Hoe reist hij daarin?',
      o:['In een slee, getrokken door rendieren', 'Op een wit paard over de daken', 'Met een stoomboot', 'Met een luchtballon'],
      u:'In het gedicht A Visit from St. Nicholas (1823) komt Sint-Nicolaas in een kleine slee met acht rendieren. Dat beeld van Santa Claus kent nu bijna de hele wereld.' },
    { t:'Amerika', v:'Waarom brengt Santa Claus zijn cadeautjes met Kerstmis en niet op 6 december?',
      o:['In Amerika schoof het geven van cadeautjes op naar Kerstmis', 'Omdat Nicolaas op 25 december werd geboren', 'Omdat zijn slee pas met Kerstmis klaar is', 'Omdat de paus dat zo besliste'],
      u:'In Amerika groeiden de verhalen over Sint-Nicolaas en het kerstfeest in de negentiende eeuw samen. Al in het gedicht van 1823 komt hij in de nacht voor Kerstmis. Zo werd Santa Claus de cadeaubrenger van Kerstmis.' },
    { t:'Nederland', v:'Wie maakte in 1850 het prentenboek waarin Sinterklaas met een stoomboot uit Spanje komt?',
      o:['Jan Schenkman', 'Joost van den Vondel', 'Annie M.G. Schmidt', 'Hans Christian Andersen'],
      u:'Jan Schenkman was onderwijzer in Amsterdam. In zijn prentenboek uit 1850 komt de Sint met een stoomboot, toen een moderne uitvinding. Voor zover bekend kwam die stoomboot daarvoor niet in de verhalen voor.' },
    { t:'Nederland', v:'Het verhaal zegt dat Sinterklaas uit Spanje komt. Wat is een van de verklaringen daarvoor?',
      o:['Bari, waar zijn relieken liggen, viel lang onder de Spaanse koning', 'Nicolaas is in Spanje geboren', 'Nicolaas was koning van Spanje', 'In Spanje wonen de meeste bisschoppen'],
      u:'Niemand weet het zeker. Een verklaring: Bari lag in het koninkrijk Napels, dat in de zestiende en zeventiende eeuw onder de Spaanse koning viel. Een andere: sinaasappels en mandarijnen, lekkers op pakjesavond, kwamen uit Spanje.' },
    { t:'Nederland', v:'Hoe heet de jaarlijkse aankomst van Sinterklaas in een stad of dorp?',
      o:['De intocht', 'De parade', 'De kroning', 'De ommegang'],
      u:'Bij de intocht komt de Sint met de boot of te paard aan en trekt hij door de straten. Er is een landelijke intocht op televisie, en daarnaast een intocht in heel veel dorpen en steden.' },
    { t:'geschiedenis', v:'Welke schilder uit de Gouden Eeuw schilderde een beroemd Sint-Nicolaasfeest, met een blij meisje en een huilende jongen?',
      o:['Jan Steen', 'Rembrandt van Rijn', 'Johannes Vermeer', 'Vincent van Gogh'],
      u:'Jan Steen schilderde Het Sint-Nicolaasfeest rond 1665 tot 1668. Het meisje heeft een pop gekregen, haar broer staat te huilen bij zijn schoen. Het schilderij hangt in het Rijksmuseum.' },
    { t:'geschiedenis', v:'Hoe keken sommige protestantse dominees en stadsbesturen na de Reformatie naar het Sinterklaasfeest?',
      o:['Ze vonden het te katholiek en probeerden het te verbieden', 'Ze maakten er een nationale feestdag van', 'Ze verplaatsten het naar de zomer', 'Ze lieten voortaan de koning de cadeautjes brengen'],
      u:'Een heilige vereren paste niet bij het protestantse geloof. Sommige steden verboden in de zeventiende eeuw de feestmarkt of de viering, maar thuis vierden veel mensen het feest gewoon door.' },
    { t:'lekkers', v:'De kleine, ronde, knapperige koekjes die veel mensen pepernoten noemen, heten eigenlijk...',
      o:['Kruidnoten', 'Taaitaai', 'Speculaasbrokken', 'Schuimpjes'],
      u:'Echte pepernoten zijn taaier en hoekiger, vaak met anijs. De ronde knapperige koekjes met speculaaskruiden zijn kruidnoten. In de winkel staat er toch vaak pepernoten op.' },
    { t:'lekkers', v:'Waar kwamen nootmuskaat en kruidnagel vandaan, specerijen die in speculaas zitten?',
      o:['Van de Molukken, eilanden in het huidige Indonesië', 'Uit Spanje', 'Uit Myra, in Turkije', 'Uit Zuid-Amerika'],
      u:'Nootmuskaat en kruidnagel groeiden op de Molukken. De VOC bracht ze vanaf de zeventiende eeuw met schepen naar Nederland. In speculaas proef je dus de handel van toen.' },
    { t:'lekkers', v:'Hoe kregen speculaaskoeken vroeger hun figuren?',
      o:['Het deeg werd in een uitgesneden houten plank gedrukt', 'Ze werden met een mes uit de vrije hand gesneden', 'Ze werden in een ijzeren mal gegoten, net als kaarsen', 'De figuren werden er na het bakken op geschilderd'],
      u:'Een speculaasplank is een houten plank met uitgesneden figuren, zoals een molen, een ruiter of een schip. Je drukt het deeg erin en klopt het er weer uit.' },
    { t:'lekkers', v:'Welk smaakje zit van oudsher in taaitaai?',
      o:['Anijs', 'Munt', 'Citroen', 'Kokos'],
      u:'Taaitaai is een taaie koek met honing of stroop en anijs. Hij wordt vaak gebakken in de vorm van een pop of een dier.' },
    { t:'lekkers', v:'Waar wordt marsepein vooral van gemaakt?',
      o:['Van gemalen amandelen en suiker', 'Van kokos en melk', 'Van aardappelmeel en honing', 'Van gemalen hazelnoten en cacao'],
      u:'Marsepein is een zoet deeg van gemalen amandelen en suiker. Op pakjesavond krijg je het soms in de vorm van fruit, een varkentje of een vis.' },
    { t:'lekkers', v:'Waar bestaat borstplaat vooral uit?',
      o:['Suiker', 'Chocolade', 'Meel', 'Amandelen'],
      u:'Borstplaat is gemaakt van suiker, met wat water of room en een smaakje zoals vanille, koffie of aardbei. Je giet het in een vormpje en laat het hard worden.' },
    { t:'traditie', v:'Welke letter krijg je meestal als chocoladeletter?',
      o:['De eerste letter van je voornaam', 'De laatste letter van je achternaam', 'Altijd de letter Z', 'De letter van de dag waarop je jarig bent'],
      u:'Meestal krijg je de eerste letter van je voornaam. Vroeger waren de letters vaak van brood- of banketdeeg; de chocoladeletter kwam pas later.' },
    { t:'traditie', v:'Wat hoort er traditioneel bij een surprise?',
      o:['Een gedicht voor degene die hem krijgt', 'Het bonnetje van de winkel', 'Een handtekening van de burgemeester', 'Een foto van de maker'],
      u:'Een surprise is een cadeautje dat verstopt zit in iets zelfgemaakts. Er hoort een gedicht bij, vaak op rijm, dat een beetje plaagt maar ook iets aardigs zegt.' },
    { t:'traditie', v:'Wat is meestal de bedoeling van een sinterklaasgedicht?',
      o:['Op een grappige manier iets over de ontvanger zeggen', 'De prijs van het cadeau vertellen', 'Het hele leven van Nicolaas navertellen', 'Uitleggen hoe je het cadeau moet gebruiken'],
      u:'Een sinterklaasgedicht plaagt de ontvanger een beetje met zijn gewoontes of iets wat hij dit jaar deed, met een knipoog. Het hoort wel vriendelijk te blijven.' },
    { t:'traditie', v:'Wat doe je bij lootjes trekken voor pakjesavond?',
      o:['Je trekt een naam en maakt voor die persoon een surprise met een gedicht', 'Je trekt een nummer en wint een prijs', 'Je raadt welk cadeau in welk pakje zit', 'Je kiest wie de kruidnoten mag strooien'],
      u:'Bij lootjes trekken krijgt iedereen in een groep één naam. Voor die persoon maak je in het geheim een surprise met een gedicht; zo hoeft niet iedereen voor iedereen iets te maken.' },
    { t:'Nederland', v:'Welk televisieprogramma volgt sinds 2001 elk jaar de reis van de Sint, als een echte nieuwsuitzending?',
      o:['Het Sinterklaasjournaal', 'Het Klokhuis', 'Het Jeugdjournaal', 'Zapp Weekend'],
      u:'Het Sinterklaasjournaal is er sinds 2001. Het brengt het nieuws over de reis en de aankomst van de Sint, net als een gewoon journaal.' },
    { t:'Nicolaas', v:'Nicolaas is een heilige. Wat is een heilige in de katholieke kerk?',
      o:['Iemand die na zijn dood wordt vereerd om zijn voorbeeldige leven', 'Iemand die nooit is doodgegaan', 'Elke bisschop, vanzelf', 'Iemand die een kerk heeft gebouwd'],
      u:'Een heilige is iemand die volgens de kerk een voorbeeldig leven leidde en na zijn dood vereerd wordt. Elke heilige heeft een eigen feestdag; die van Nicolaas is 6 december.' }
  ];

  /* rijmpjes van de Sint, per scoreband; nooit kleinerend, ook niet bij weinig goed */
  var RIJM = {
    tien:[
      ['Tien van de tien! Ik kijk in mijn boek,', 'en zie dat jij alles wist, slim en kloek.', 'Van Myra tot Spanje, van schoen tot gedicht:', 'jij kent mijn verhaal, met een blij gezicht.'],
      ['Wat een geleerde, wat een pienter hoofd,', 'ik had het zelf haast niet geloofd!', 'Tien keer goed, je deed het fijn:', 'jouw naam mag met goud in mijn grote boek zijn.']
    ],
    veel:[
      ['Bijna alles goed, dat is heel wat waard,', 'daar zwaait zelfs mijn paard blij mee met zijn staart.', 'Wat nog niet lukte, lees je hieronder na;', 'de Sint zegt: goed gedaan, en hiep hiep hoera!'],
      ['Ik keek in mijn boek en las met plezier', 'een hele rij goede antwoorden hier.', 'Je kent de legenden, de schoen en de boot:', 'je kennis van Sinterklaas is echt groot.']
    ],
    half:[
      ['De helft wist je al, en dat is heel fijn,', 'de rest leer je nu, zo hoort het te zijn.', 'Lees onder de vragen rustig wat er staat:', 'wie nieuwsgierig is, leert het meest. Dat is mijn raad.'],
      ['Een paar wist je goed, een paar nog niet,', 'zo gaat het met elk verhaal en elk lied.', 'Wat jij vandaag leerde, dat neem je mee:', 'vertel het thuis maar, bij chocolademelk of thee.']
    ],
    weinig:[
      ['Dit waren pittige vragen, dat geef ik eerlijk toe,', 'van zoveel geschiedenis wordt zelfs een Sint wat moe.', 'Maar lees de uitleg, dan weet jij straks meer', 'dan menig geleerde, en dat is een eer.'],
      ['Niet alles ging goed, maar weet je wat telt?', 'Dat jij het geprobeerd hebt, dapper als een held.', 'Ik ben al zo oud en ik leer nog elke dag;', 'morgen weer een kans, en dan zie ik je lach.']
    ]
  };

  /* een vaste toevalsreeks uit een getal (zelfde soort als in dag.html) */
  function toeval(z){ var a = z >>> 0; return function(){ a = (a + 0x6D2B79F5) >>> 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  /* de tien van dag d (1 tot en met 5); zaad: een getal uit het jaar, zodat elk jaar anders husselt */
  function kies(d, zaad){
    var r = toeval(zaad), volg = VRAGEN.map(function(q, i){ return i; });
    for (var i = volg.length - 1; i > 0; i--){ var j = Math.floor(r() * (i + 1)), x = volg[i]; volg[i] = volg[j]; volg[j] = x; }
    var k = Math.max(0, Math.min(4, (d | 0) - 1)), uit = [];
    for (var n = 0; n < 10; n++) uit.push(VRAGEN[volg[(k * 8 + n) % volg.length]]);
    return uit;
  }
  function rijm(goed, d){
    var band = goed >= 10 ? 'tien' : goed >= 7 ? 'veel' : goed >= 4 ? 'half' : 'weinig', l = RIJM[band];
    return l[((d | 0) + goed) % l.length];
  }
  return { VRAGEN:VRAGEN, RIJM:RIJM, kies:kies, rijm:rijm };
})();
