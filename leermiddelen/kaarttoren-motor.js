/* Kaarttoren: de spelregels, los van het scherm.

   Een beklimming (run) van twaalf verdiepingen. Op elke verdieping wacht een
   tegenstander; op 5 en 12 een baas. Je vecht met een stapel kaarten. Aan het
   begin van elke beurt komt er een vraag: goed maakt je opgeladen (een
   energie en een kaart extra, en de opgeladen-regel op je kaarten telt mee),
   fout is een gewone beurt. Tussen de gevechten kies je een kaart uit drie,
   en onderweg kom je rustplekken, winkels en gebeurtenissen tegen.

   Sinds versie 2 zijn er ook schatten (een blijvend voordeel voor de rest van
   de klim), hulpjes (eenmalig, hoogstens drie tegelijk), treden (een zwaardere
   klim voor wie de top al haalde), de dagtoren (voor iedereen dezelfde toren
   op dezelfde dag) en dingen die je vrijspeelt.

   Alles hier is gewone data (JSON), zodat een beklimming op het apparaat
   bewaard kan worden en na herladen verder kan. Het toeval komt uit een zaadje
   (st.r), dus dezelfde torencode geeft dezelfde toren. De vragen zelf komen
   niet hier vandaan: het scherm stelt ze en geeft alleen goed of fout door.

   Gebruik (KAARTTOREN):
     nieuw(zaad, vak, { trede, slot, dag })  een nieuwe beklimming
     zetOm(oud, slot)            een bewaarde beklimming van een oudere versie omzetten (of null)
     keuzes(st)                  de kamers waar je nu heen kunt [{i, kamer}]
     kiesKamer(st, i)            naar die kamer: eerst een tussenstop, dan het gevecht
     antwoord(st, goed)          de vraag aan het begin van de beurt
     speel(st, h, goed)          kaart h uit je hand; goed alleen bij een vraagkaart
     beurtKlaar(st)              je beurt is klaar, de tegenstander is aan zet
     beloning(st, k)             kaart k uit de drie, of -1 voor geen
     kiesSchat(st, i)            na een baas: een schat uit drie
     gebruik(st, i), gooiWeg(st, i)  een hulpje gebruiken of weggooien
     rust(st, 'heel' | 'beter', kaart), koop(st, i), koopSchat(st, i), koopHulpje(st, i),
     weg(st, kaart), pleister(st), verder(st)
     gebeurtenis(st, optie, uitslagen, kaart)
     tekst(kaart, g)             de regels op een kaart, met de getallen van nu
     slot(voortgang)             wat nog niet vrijgespeeld is
     bot.*                       de speelbot, voor de test en de balanssimulatie
   Na elke stap staat in st.log wat er gebeurde, voor het scherm. */
(function(root){
  'use strict';
  var VK = root.KAARTTOREN_VAKKAARTEN || (typeof require === 'function' ? require('./kaarttoren-vakkaarten.js') : {});
  var VERSIE = 2, HOOG = 12, BAAS = [5, 12], MAXHULP = 3, MAXTREDE = 5;
  /* De knoppen voor de balans, gezet met een simulatie van honderden
     beklimmingen per niveau (speelbot hieronder, scratchpad/kaarttoren/sim.js):
     wie 75 procent goed heeft haalt in ongeveer de helft van de gevallen de
     top, wie 60 procent goed heeft komt tot ongeveer halverwege, en wie 90
     procent goed heeft wint bijna altijd. Op trede 5 haalt ook wie 75 procent
     goed heeft maar zelden de top.

     Waarom de vraag zo zwaar telt: een goed antwoord geeft een energie en een
     kaart extra en laat de tegenstander schrikken (zijn klap is die beurt
     zwakker). Drie goed op rij (op dreef) en vijf goed op rij (in vuur en
     vlam) geven nog meer. Veel nieuwe kaarten en schatten worden sterker per
     goed antwoord. Een fout is een gewone beurt, geen straf. En na elk
     gevecht puf je even uit: wie zijn gevechten met weinig schade wint, blijft
     fit; wie veel fout heeft, raakt langzaam op. */
  var B = {
    leven: 64,          /* doorzetting bij de start */
    energie: 3,         /* energie per beurt */
    trek: 5,            /* kaarten per beurt */
    slimEnergie: 1,     /* erbij na een goed antwoord */
    slimTrek: 1,
    slimZwak: 1,        /* na een goed antwoord schrikt de tegenstander: deze beurt zwak */
    dreef: 3,           /* zoveel goed op rij en je bent op dreef */
    dreefKracht: 1,     /* op dreef: elke klap doet zoveel meer */
    dreefEnergie: 1,    /* op dreef: zoveel energie extra per beurt */
    vuur: 5,            /* zoveel goed op rij en je bent in vuur en vlam */
    vuurKracht: 5,
    vuurEnergie: 3,     /* in vuur en vlam: zoveel energie erbij in plaats van die van op dreef */
    hpGroei: 0.15,      /* per verdieping meer doorzetting voor een gewone tegenstander */
    slag: 1.1,          /* hoe hard een gewone tegenstander slaat */
    slagGroei: 0.10,    /* per verdieping harder */
    baasHp: 1,          /* de doorzetting van een baas, als deel van wat er in zijn lijst staat */
    rustHeel: 0.3,      /* een rustplek heelt dit deel van je doorzetting */
    baasHeel: 0.25,     /* na de eerste baas */
    naGevecht: 16,      /* herstel na elk gewonnen gevecht: even uitpuffen */
    muntGoed: 2,        /* munten per goed antwoord */
    kennisMax: 10,      /* tot zoveel goede antwoorden telt een kenniskaart mee */
    hulpKans: 0.3       /* kans op een hulpje na een gewoon gevecht */
  };
  /* De treden: wie de top haalt, speelt de volgende vrij. Elke trede houdt de
     regels van de treden eronder. */
  var TREDEN = [
    { n:0, regel:'De gewone klim.' },
    { n:1, regel:'Gewone tegenstanders en lastpakken slaan harder.' },
    { n:2, regel:'Na een gevecht puf je minder uit: 9 doorzetting terug in plaats van 16.' },
    { n:3, regel:'Lastpakken en bazen hebben meer doorzetting.' },
    { n:4, regel:'Je begint met minder doorzetting en een kauwgom in je stapel.' },
    { n:5, regel:'De bazen beginnen met 3 kracht en de rustplekken helen minder.' }
  ];
  function tr(st, n){ return (st.trede || 0) >= n; }

  /* ---------- de kaarten ----------
     Effecten: ['s', n, x] n schade (x keer), ['sl', [a, b]] losse klappen,
     ['rs', n, p] n schade plus p voor elk goed antwoord op rij, ['b', n] blok,
     ['t', n] trek, ['e', n] energie, ['k', n] kracht, ['z', n] zwak,
     ['w', n] wankel, ['h', n] herstel, ['m', n] munten, ['pb', n] elke beurt blok.
     Nieuw in versie 2, allemaal om goed antwoorden te belonen of rommel op te ruimen:
     ['gs', n, p] n schade plus p per goed antwoord in dit gevecht,
     ['gb', n, p] n blok plus p per goed antwoord in dit gevecht,
     ['ruim', 1] rommel uit je hand weg (2: ook uit je stapels), en per stuk een kaart terug,
     ['dv', 1] je volgende vraagkaart telt dubbel, ['pg', n] na elk goed antwoord n blok,
     ['pd', n] na elk goed antwoord n schade, ['pk', n] elke beurt n kracht,
     ['ve', n] volgende beurt n energie extra, ['schoon'] niet meer zwak of wankel,
     ['opl'] alsnog opgeladen (Herkansing).
     zeld: 9 start, 0 gewoon, 1 zeldzaam, 8 rommel (alleen in een gevecht).
     fig: het plaatje op de kaart (kaarttoren-figuren.js). */
  var KAARTEN = {
    prik:      { naam:'Potloodprik', fig:'potlood', kost:1, soort:'aanval', zeld:9, w:2, doe:[['s', 6]], plus:{ doe:[['s', 9]] } },
    schrift:   { naam:'Schoolschrift', fig:'schrift', kost:1, soort:'verdediging', zeld:9, w:2, doe:[['b', 5]], plus:{ doe:[['b', 8]] } },
    liniaal:   { naam:'Liniaalzwaai', fig:'liniaal', kost:2, soort:'aanval', zeld:0, w:6, doe:[['s', 12]], slim:[['s', 5]], plus:{ doe:[['s', 16]] } },
    gum:       { naam:'Gumgooi', fig:'gum', kost:0, soort:'aanval', zeld:0, w:5, doe:[['s', 3]], slim:[['s', 3]], plus:{ doe:[['s', 5]] } },
    dubbel:    { naam:'Dubbele tik', fig:'tik', kost:1, soort:'aanval', zeld:0, w:6, doe:[['s', 4, 2]], plus:{ doe:[['s', 6, 2]] } },
    regen:     { naam:'Proppenregen', fig:'prop', kost:1, soort:'aanval', zeld:1, w:7, doe:[['s', 2, 4]], plus:{ doe:[['s', 3, 4]] } },
    uitroep:   { naam:'Uitroepteken', fig:'uitroep', kost:1, soort:'aanval', zeld:0, w:6, doe:[['s', 7], ['w', 2]], plus:{ doe:[['s', 9], ['w', 3]] } },
    sprint:    { naam:'Eindsprint', fig:'vlag', kost:2, soort:'aanval', zeld:1, w:7, doe:[['s', 18]], slim:[['s', 8]], plus:{ doe:[['s', 24]] } },
    samen:     { naam:'Samenwerken', fig:'samen', kost:1, soort:'aanval', zeld:0, w:6, doe:[['s', 5], ['b', 5]], plus:{ doe:[['s', 7], ['b', 7]] } },
    lekker:    { naam:'Lekker bezig', fig:'vlam', kost:1, soort:'aanval', zeld:1, w:7, doe:[['rs', 3, 3]], plus:{ doe:[['rs', 6, 3]] } },
    overhoring:{ naam:'Overhoring', fig:'vraag', kost:1, soort:'aanval', zeld:0, w:6, vraag:{ goed:[['s', 14]], fout:[['s', 4]] }, plus:{ vraag:{ goed:[['s', 19]], fout:[['s', 6]] } } },
    uitblinker:{ naam:'Uitblinker', fig:'ster', kost:1, soort:'aanval', zeld:1, w:7, alleenSlim:true, doe:[['s', 20]], plus:{ doe:[['s', 27]] } },
    rugzak:    { naam:'Volle rugzak', fig:'rugzak', kost:2, soort:'verdediging', zeld:0, w:5, doe:[['b', 12]], slim:[['b', 5]], plus:{ doe:[['b', 16]] } },
    bukken:    { naam:'Bukken', fig:'bukken', kost:0, soort:'verdediging', zeld:0, w:5, doe:[['b', 3]], slim:[['b', 3]], plus:{ doe:[['b', 5]] } },
    kaft:      { naam:'Kaft om je boek', fig:'boek', kost:1, soort:'verdediging', zeld:0, w:6, doe:[['b', 6], ['t', 1]], plus:{ doe:[['b', 8], ['t', 1]] } },
    paraplu:   { naam:'Paraplu', fig:'paraplu', kost:1, soort:'verdediging', zeld:0, w:5, doe:[['b', 8]], plus:{ doe:[['b', 11]] } },
    beurt:     { naam:'Beurt krijgen', fig:'vinger', kost:1, soort:'verdediging', zeld:0, w:6, vraag:{ goed:[['b', 12], ['t', 1]], fout:[['b', 4]] }, plus:{ vraag:{ goed:[['b', 16], ['t', 1]], fout:[['b', 6]] } } },
    vertrouwen:{ naam:'Zelfvertrouwen', fig:'hart', kost:1, soort:'speciaal', zeld:1, w:7, blijvend:true, doe:[['pb', 3]], plus:{ doe:[['pb', 5]] } },
    vinger:    { naam:'Vinger opsteken', fig:'vinger', kost:0, soort:'speciaal', zeld:0, w:5, doe:[['t', 1]], slim:[['t', 1]], plus:{ doe:[['t', 2]] } },
    pauzehap:  { naam:'Pauzehap', fig:'appel', kost:0, soort:'speciaal', zeld:0, w:6, eenmalig:true, doe:[['e', 1], ['t', 1]], plus:{ doe:[['e', 2], ['t', 1]] } },
    oefenen:   { naam:'Oefenen baart kunst', fig:'halter', kost:1, soort:'speciaal', zeld:1, w:8, blijvend:true, doe:[['k', 2]], plus:{ doe:[['k', 3]] } },
    blik:      { naam:'Strenge blik', fig:'oog', kost:1, soort:'speciaal', zeld:0, w:5, doe:[['z', 2]], slim:[['w', 2]], plus:{ doe:[['z', 3], ['w', 1]] } },
    aha:       { naam:'Aha-moment', fig:'lamp', kost:0, soort:'speciaal', zeld:1, w:7, alleenSlim:true, doe:[['e', 1], ['t', 2]], plus:{ doe:[['e', 2], ['t', 2]] } },
    pleister:  { naam:'Pleister', fig:'pleister', kost:1, soort:'verdediging', zeld:0, w:5, eenmalig:true, doe:[['h', 6]], plus:{ doe:[['h', 9]] } },

    /* nieuw in versie 2: aanvallen */
    stuiter:   { naam:'Stuiterbal', fig:'bal', kost:1, soort:'aanval', zeld:0, w:6, doe:[['s', 3, 2]], slim:[['s', 3, 2]], plus:{ doe:[['s', 4, 2]] } },
    kennisbom: { naam:'Kennisbom', fig:'brein', kost:2, soort:'aanval', zeld:1, w:8, doe:[['gs', 8, 3]], plus:{ doe:[['gs', 11, 4]] } },
    krijt:     { naam:'Krijtstreep', fig:'krijt', kost:0, soort:'aanval', zeld:0, w:5, doe:[['s', 4]], slim:[['w', 1]], plus:{ doe:[['s', 6]] } },
    spreekbeurt:{ naam:'Spreekbeurt', fig:'microfoon', kost:1, soort:'aanval', zeld:0, w:6, vraag:{ goed:[['s', 10], ['z', 2]], fout:[['s', 5]] }, plus:{ vraag:{ goed:[['s', 13], ['z', 2]], fout:[['s', 7]] } } },
    wisser:    { naam:'Bordenwisser', fig:'wisser', kost:1, soort:'aanval', zeld:0, w:6, doe:[['s', 7], ['ruim', 1]], plus:{ doe:[['s', 10], ['ruim', 1]] } },
    proefwerk: { naam:'Proefwerk', fig:'toets', kost:2, soort:'aanval', zeld:1, w:8, vraag:{ goed:[['s', 24]], fout:[['s', 8]] }, plus:{ vraag:{ goed:[['s', 31]], fout:[['s', 10]] } } },
    doorvragen:{ naam:'Doorvragen', fig:'vraagpijl', kost:1, soort:'aanval', zeld:0, w:6, doe:[['gs', 4, 2]], plus:{ doe:[['gs', 6, 3]] } },
    /* verdediging */
    stevig:    { naam:'Stevig weten', fig:'schildboek', kost:1, soort:'verdediging', zeld:0, w:6, doe:[['gb', 4, 2]], plus:{ doe:[['gb', 6, 3]] } },
    helm:      { naam:'Fietshelm', fig:'helm', kost:1, soort:'verdediging', zeld:0, w:5, doe:[['b', 7]], slim:[['b', 3]], plus:{ doe:[['b', 10]] } },
    ademen:    { naam:'Rustig ademen', fig:'wolk', kost:1, soort:'verdediging', zeld:0, w:5, doe:[['b', 6], ['schoon', 1]], plus:{ doe:[['b', 9], ['schoon', 1]] } },
    regenjas:  { naam:'Regenjas', fig:'jas', kost:2, soort:'verdediging', zeld:0, w:6, doe:[['b', 13]], slim:[['z', 2]], plus:{ doe:[['b', 17]] } },
    mondeling: { naam:'Mondeling', fig:'praat', kost:1, soort:'verdediging', zeld:0, w:6, vraag:{ goed:[['b', 11], ['z', 1]], fout:[['b', 5]] }, plus:{ vraag:{ goed:[['b', 14], ['z', 2]], fout:[['b', 7]] } } },
    /* speciaal */
    opruimen:  { naam:'Bureau opruimen', fig:'prullenbak', kost:0, soort:'speciaal', zeld:0, w:5, doe:[['ruim', 2], ['b', 3]], plus:{ doe:[['ruim', 2], ['b', 3], ['t', 1]] } },
    markeer:   { naam:'Markeerstift', fig:'stift', kost:0, soort:'speciaal', zeld:0, w:5, doe:[['dv', 1]], plus:{ doe:[['dv', 1], ['t', 1]] } },
    aantekeningen:{ naam:'Aantekeningen', fig:'notitie', kost:1, soort:'speciaal', zeld:1, w:7, blijvend:true, doe:[['pg', 3]], plus:{ doe:[['pg', 4]] } },
    maatje:    { naam:'Studiemaatje', fig:'maatje', kost:1, soort:'speciaal', zeld:1, w:7, blijvend:true, doe:[['pd', 4]], plus:{ doe:[['pd', 6]] } },
    plannen:   { naam:'Vooruit plannen', fig:'agenda', kost:1, soort:'speciaal', zeld:0, w:5, doe:[['ve', 2]], plus:{ kost:0 } },
    herkansing:{ naam:'Herkansing', fig:'herhaal', kost:1, soort:'speciaal', zeld:1, w:8, alleenFout:true, eenmalig:true, vraag:{ goed:[['opl', 1]], fout:[] }, plus:{ kost:0 } },
    uitleggen: { naam:'Uitleggen', fig:'bord', kost:1, soort:'speciaal', zeld:0, w:6, vraag:{ goed:[['k', 1], ['t', 1]], fout:[['t', 1]] }, plus:{ vraag:{ goed:[['k', 2], ['t', 1]], fout:[['t', 1]] } } },
    elkedag:   { naam:'Elke dag beter', fig:'plant', kost:2, soort:'speciaal', zeld:1, w:8, blijvend:true, doe:[['pk', 1]], plus:{ kost:1 } },

    /* rommel: een tegenstander stopt hem in je stapel, na het gevecht is hij weg */
    kauwgom:   { naam:'Kauwgom', fig:'kauwgom', kost:1, soort:'rommel', zeld:8, w:0, eenmalig:true, doe:[], uitleg:'Plakt aan je vingers. Speel hem om hem kwijt te raken.' },
    propje:    { naam:'Propje', fig:'propje', kost:0, soort:'rommel', zeld:8, w:0, onspeelbaar:true, doe:[], uitleg:'Neemt een plek in je hand in. Na het gevecht is hij weg.' }
  };
  /* de vakkaarten erbij, met het vak eraan vast */
  Object.keys(VK).forEach(function(vak){
    VK[vak].forEach(function(k, i){ var d = Object.assign({ vak:vak, start:i === 0 }, k); KAARTEN[k.id] = d; });
  });

  /* ---------- schatten ----------
     Een schat houd je de hele klim. Je krijgt er een na een lastpak, je
     kiest er een uit drie na de eerste baas, en de schoolwinkel verkoopt ze.
     zeld: 0 gewoon, 1 zeldzaam, 2 alleen na een baas. De regels zelf staan
     verspreid in de motor, bij het moment waarop ze werken (zoek op heeft(st, ...)). */
  var SCHATTEN = {
    etui:       { naam:'Goed gevuld etui', zeld:0, tekst:'In de eerste beurt van elk gevecht trek je 2 kaarten extra.' },
    bidon:      { naam:'Sportbidon', zeld:0, tekst:'Na elk gewonnen gevecht herstel je 5 extra.' },
    stressbal:  { naam:'Stressbal', zeld:0, tekst:'Na een fout antwoord krijg je 5 blok.' },
    agenda:     { naam:'Schoolagenda', zeld:0, tekst:'In de eerste beurt van elk gevecht heb je 1 energie extra.' },
    klassenfoto:{ naam:'Klassenfoto', zeld:0, tekst:'8 doorzetting meer voor de rest van de klim.' },
    spaarpot:   { naam:'Spaarpot', zeld:0, tekst:'Elk goed antwoord levert 1 munt extra op.' },
    schoolpas:  { naam:'Schoolpas', zeld:0, tekst:'Na elk gewonnen gevecht 8 munten extra.' },
    broodtrommel:{ naam:'Broodtrommel', zeld:0, tekst:'Uitrusten op een rustplek heelt 10 meer.' },
    cactus:     { naam:'Cactus', zeld:0, tekst:'Krijg je schade van een klap, dan krijgt de tegenstander 3 schade.' },
    zandloper:  { naam:'Zandloper', zeld:0, tekst:'Je begint elk gevecht met 8 blok.' },
    gelukspen:  { naam:'Gelukspen', zeld:0, tekst:'Na je eerste goede antwoord in elk gevecht trek je 2 kaarten.' },
    uitlegkaart:{ naam:'Uitlegkaartje', zeld:0, tekst:'Na een fout antwoord trek je 1 kaart extra.' },
    potlood:    { naam:'Scherp potlood', zeld:1, tekst:'Je eerste aanval in elk gevecht doet 8 extra schade.' },
    postit:     { naam:'Post-it', zeld:1, tekst:'Je eerste vraagkaart in elk gevecht telt dubbel.' },
    kluissleutel:{ naam:'Kluissleutel', zeld:1, tekst:'In de schoolwinkel is alles een kwart goedkoper.' },
    bureaulamp: { naam:'Bureaulamp', zeld:1, tekst:'Elke tegenstander begint wankel (2): hij krijgt de helft meer schade.' },
    koptelefoon:{ naam:'Koptelefoon', zeld:1, tekst:'Tegenstanders kunnen je niet zwak of wankel maken.' },
    leesbril:   { naam:'Leesbril', zeld:1, tekst:'Je ziet ook wat de tegenstander de beurt daarna van plan is.' },
    markeerset: { naam:'Markeerstiften', zeld:2, tekst:'Je bent al op dreef bij 2 goed op rij, en in vuur en vlam bij 4.' },
    goudster:   { naam:'Gouden ster', zeld:2, tekst:'Elk goed antwoord in een gevecht geeft 1 kracht, tot 3 per gevecht.' },
    boekentas:  { naam:'Grote boekentas', zeld:2, tekst:'Je trekt elke beurt 1 kaart meer.' },
    vulpen:     { naam:'Vulpen', zeld:2, tekst:'Vraagkaarten kosten 1 energie minder.' }
  };
  function heeft(st, id){ return (st.schatten || []).indexOf(id) >= 0; }

  /* ---------- hulpjes ----------
     Eenmalig, hoogstens drie tegelijk. Gezond en schools: geen energiedrankjes. */
  var HULPJES = {
    water:     { naam:'Flesje water', tekst:'Herstel 12 doorzetting.', ook:true },
    pepermunt: { naam:'Pepermuntje', tekst:'+2 energie deze beurt.' },
    joker:     { naam:'Spiekbriefje-joker', tekst:'Bij de volgende vraag vallen twee foute antwoorden weg.', vraag:true },
    appel:     { naam:'Appel', tekst:'10 blok.' },
    banaan:    { naam:'Banaan', tekst:'+2 kracht voor de rest van dit gevecht.' },
    grapje:    { naam:'Goede grap', tekst:'De tegenstander moet zo lachen dat hij zwak wordt (3).' },
    schriftje: { naam:'Nieuw schriftje', tekst:'Trek 3 kaarten.' },
    doekje:    { naam:'Opruimdoekje', tekst:'Alle rommel is weg, ook uit je stapels.' }
  };

  /* ---------- vrijspelen ----------
     Sommige kaarten en schatten komen pas in de toren als je een eerste
     overwinning hebt, of genoeg verdiepingen hebt geklommen (alle klimmen
     samen). Het scherm houdt de voortgang bij. */
  var VRIJ = [
    { id:'verd10', wat:'10 verdiepingen geklommen, alle klimmen samen', kaarten:['kennisbom'], schatten:['leesbril'], test:function(v){ return v.totaal >= 10; } },
    { id:'baas5', wat:'De eerste baas verslagen', kaarten:['herkansing'], schatten:['postit'], test:function(v){ return v.beste >= 5; } },
    { id:'verd25', wat:'25 verdiepingen geklommen, alle klimmen samen', kaarten:['maatje'], schatten:['cactus'], test:function(v){ return v.totaal >= 25; } },
    { id:'winst', wat:'De top gehaald', kaarten:['proefwerk'], schatten:['markeerset'], test:function(v){ return v.winst >= 1; } },
    { id:'verd40', wat:'40 verdiepingen geklommen, alle klimmen samen', kaarten:['elkedag'], schatten:['goudster'], test:function(v){ return v.totaal >= 40; } }
  ];
  /* geeft de ids die nog op slot zitten; zonder voortgang zit alles van VRIJ op slot */
  function slot(v){
    v = v || {}; v = { totaal:v.totaal || 0, beste:v.beste || 0, winst:v.winst || 0 };
    var uit = [];
    VRIJ.forEach(function(x){ if (!x.test(v)) uit = uit.concat(x.kaarten, x.schatten); });
    return uit;
  }
  function vrij(st, id){ return (st.slot || []).indexOf(id) < 0; }

  /* ---------- de tegenstanders ----------
     Een beurt van een tegenstander: a schade (x keer), b blok, k kracht,
     z maakt jou zwak, w maakt jou wankel, r stopt rommel in je stapel,
     h herstelt. Ze doen om de beurt wat in hun patroon staat.
     Eigen trekjes: goedSchade (elk goed antwoord doet hem zoveel schade),
     kijkt (had je de vraag fout, dan slaat hij zoveel harder per klap). */
  var VIJANDEN = {
    prop:      { naam:'De Prop', hp:41, patroon:[{ a:13 }, { a:8, x:2 }, { b:6, a:6 }], op:'rolt weg en geeft op' },
    kauwgom:   { naam:'Het Kauwgompje', hp:36, patroon:[{ r:1, a:6, rk:'kauwgom' }, { a:13 }, { a:11 }], op:'knapt als een bel en geeft op' },
    gum:       { naam:'De Gum', hp:48, patroon:[{ b:8 }, { a:19 }, { a:10 }], op:'is helemaal op en geeft op' },
    slijper:   { naam:'De Puntenslijper', hp:38, patroon:[{ k:2 }, { a:10 }, { a:10 }], op:'raakt bot en geeft op' },
    paperclip: { naam:'De Paperclip', hp:43, patroon:[{ a:6, x:3 }, { b:5 }, { a:15 }], op:'buigt recht en geeft op' },
    spiek:     { naam:'Het Spiekbriefje', hp:34, patroon:[{ z:2 }, { a:15 }, { a:13 }], op:'waait weg en geeft op' },
    bel:       { naam:'De Schoolbel', hp:46, patroon:[{ b:4 }, { a:22 }], op:'is uitgerinkeld en geeft op' },
    klodder:   { naam:'Het Klodderspatje', hp:38, patroon:[{ w:2, a:6 }, { a:11 }, { a:8, x:2 }], op:'droogt op en geeft op' },
    /* nieuw: elk met een patroon dat je leert lezen */
    schaar:    { naam:'De Schaar', hp:40, patroon:[{ a:7, x:2 }, { b:7 }, { a:17 }], op:'klapt dicht en geeft op' },
    nietmachine:{ naam:'De Nietmachine', hp:44, patroon:[{ a:4, x:2 }, { a:4, x:3 }, { k:2, b:6 }], op:'is door zijn nietjes heen en geeft op' },
    plakband:  { naam:'Het Plakband', hp:39, patroon:[{ z:1, a:6 }, { a:13 }, { b:8, h:6 }], op:'rolt af en geeft op' },
    passer:    { naam:'De Passer', hp:42, patroon:[{ a:6 }, { a:11 }, { a:16 }, { b:12 }], op:'draait nog een rondje en geeft op' },
    rekenmachine:{ naam:'De Rekenmachine', hp:41, patroon:[{ a:3, x:2 }, { a:3, x:3 }, { a:3, x:4 }, { b:9 }], op:'heeft een lege batterij en geeft op' },
    /* lastpakken: sterker, en daarom meer munten, een zeldzame kaart en een schat */
    klok:      { naam:'De Klok', hp:86, lastpak:true, patroon:[{ a:11 }, { a:15 }, { a:19 }, { b:10, k:1 }], op:'loopt af en geeft op' },
    zwerm:     { naam:'De Zwerm', hp:74, lastpak:true, patroon:[{ a:3, x:4 }, { b:8 }, { a:3, x:4 }], op:'vliegt alle kanten op en geeft op' },
    huiswerk:  { naam:'Het Vergeten Huiswerk', hp:94, lastpak:true, patroon:[{ r:2 }, { a:21 }, { b:9, a:10 }], op:'wordt eindelijk ingeleverd en geeft op' },
    spons:     { naam:'De Natte Spons', hp:84, lastpak:true, patroon:[{ b:14 }, { a:13, h:10 }, { a:24 }], op:'wordt uitgeknepen en geeft op' },
    prullenbak:{ naam:'De Volle Prullenbak', hp:88, lastpak:true, patroon:[{ r:2, b:8 }, { a:10, x:2 }, { r:1, a:15 }], op:'wordt geleegd en geeft op' },
    toets:     { naam:'De Toets', hp:96, lastpak:true, goedSchade:5, patroon:[{ a:11, x:2 }, { b:10, k:2 }, { a:26 }], op:'krijgt een tien en geeft op' },
    /* de bazen */
    inktvlek:  { naam:'De Inktvlek', hp:190, baas:true, patroon:[{ w:2, a:9 }, { a:20 }, { b:12, k:2 }, { a:7, x:3 }], op:'wordt opgedept en geeft op' },
    reuzenprop:{ naam:'De Reuzenprop', hp:202, baas:true, patroon:[{ a:11, x:2 }, { r:2, b:10 }, { a:25 }, { b:14 }], op:'valt uit elkaar in kleine propjes en geeft op' },
    boekenstapel:{ naam:'De Stapel Boeken', hp:196, baas:true, patroon:[{ b:12, a:8 }, { a:6, x:3 }, { r:1, z:2 }, { a:24 }], op:'valt om en geeft op' },
    rodepen:   { naam:'De Rode Pen', hp:266, baas:true, boos:2, patroon:[{ a:20 }, { z:2, b:10 }, { a:4, x:5 }, { k:2 }, { a:28 }], op:'is leeg en geeft zich gewonnen' },
    grotefout: { naam:'De Grote Fout', hp:285, baas:true, boos:2, patroon:[{ a:15 }, { r:2, a:7 }, { a:7, x:3 }, { b:15, k:2 }], op:'wordt verbeterd en geeft zich gewonnen' },
    schoolbord:{ naam:'Het Schoolbord', hp:272, baas:true, boos:2, kijkt:4, patroon:[{ a:14 }, { b:12, k:2 }, { a:6, x:3 }, { r:2, a:8 }, { a:30 }], op:'wordt schoongeveegd en geeft zich gewonnen' }
  };
  var GEWOON = ['prop', 'kauwgom', 'gum', 'slijper', 'paperclip', 'spiek', 'bel', 'klodder', 'schaar', 'nietmachine', 'plakband', 'passer', 'rekenmachine'];
  var LASTPAK = ['klok', 'zwerm', 'huiswerk', 'spons', 'prullenbak', 'toets'];
  var BAZEN = { 5:['inktvlek', 'reuzenprop', 'boekenstapel'], 12:['rodepen', 'grotefout', 'schoolbord'] };
  /* wat een tegenstander bijzonder maakt, in woorden voor het scherm */
  function trekje(id){
    var d = VIJANDEN[id] || {};
    if (d.goedSchade) return 'Elk goed antwoord doet hem ' + d.goedSchade + ' schade.';
    if (d.kijkt) return 'Had je de vraag fout, dan slaat hij ' + d.kijkt + ' harder per klap.';
    if (d.boos) return 'Onder de helft wordt hij boos: ' + d.boos + ' kracht erbij.';
    return '';
  }

  /* ---------- gebeurtenissen ----------
     Een optie kan geven: m munten, h herstel, max meer doorzetting voor de
     rest van de klim, beter (zoveel willekeurige kaarten beter), beterKies (jij
     kiest een kaart om te verbeteren), weg (jij kiest een kaart om weg te
     gooien), ruil, schat ('gewoon'), hulpje (een id of 'willekeurig'), kaart (een
     id), kaartZeld (een willekeurige zeldzame kaart). En het kan kosten: mk
     munten of hpMin doorzetting (nooit onder 1). vragen: zoveel vragen eerst,
     met goed/fout (op de eerste) of perGoed. */
  var GEBEURTENISSEN = [
    { id:'concierge', titel:'De conciërge', tekst:'Bij de trap staat de conciërge. Die heeft een vraag voor je, en een zakje munten voor wie het weet.',
      opties:[{ t:'Beantwoord de vraag', vragen:1, goed:{ m:35 }, fout:{ m:10 } }, { t:'Groet en loop door' }] },
    { id:'bieb', titel:'De bibliotheek', tekst:'Tussen de boeken ligt een oefentoets. Maak je hem goed, dan worden twee kaarten beter.',
      opties:[{ t:'Maak de oefentoets', vragen:1, goed:{ beter:2 }, fout:{ beter:1 } }, { t:'Even zitten in de leeshoek: herstel 8', h:8 }] },
    { id:'boterham', titel:'Een extra boterham', tekst:'Onder in je tas zit nog een boterham met kaas.',
      opties:[{ t:'Eet hem meteen op: herstel 15', h:15 }, { t:'Eet hem rustig op: 5 meer doorzetting voor de rest van de klim', max:5 }] },
    { id:'kluisje', titel:'Je kluisje', tekst:'Je kluisje puilt uit. Opruimen?',
      opties:[{ t:'Gooi een kaart uit je stapel weg', weg:1 }, { t:'Zoek in de hoekjes: 20 munten', m:20 }] },
    { id:'quiz', titel:'De quizmaster', tekst:'In de aula is een quiz. Drie vragen, en elke goede is 15 munten waard.',
      opties:[{ t:'Doe mee', vragen:3, perGoed:{ m:15 } }, { t:'Liever niet' }] },
    { id:'ruilen', titel:'Kaartjes ruilen', tekst:'Een klasgenoot wil ruilen: jouw zwakste kaart tegen een willekeurige kaart uit hun stapel.',
      opties:[{ t:'Ruilen', ruil:1 }, { t:'Niet ruilen' }] },
    { id:'mentor', titel:'Je mentor', tekst:'Je mentor vraagt hoe het gaat, en stelt je een vraag over de stof.',
      opties:[{ t:'Beantwoord de vraag', vragen:1, goed:{ h:20 }, fout:{ h:8 } }, { t:'Zeg dat het goed gaat: herstel 6', h:6 }] },
    /* nieuw in versie 2 */
    { id:'fotograaf', titel:'De schoolfotograaf', tekst:'In de aula worden de klassenfoto’s gemaakt. Een eigen portret kost 30 munten, en je loopt er de rest van de dag trots bij.',
      opties:[{ t:'Laat een portret maken: 30 munten, 6 meer doorzetting voor de rest van de klim', mk:30, max:6 }, { t:'Glimlach en loop door' }] },
    { id:'gevonden', titel:'Gevonden voorwerpen', tekst:'De conciërge staat bij de bak met gevonden voorwerpen. Wie een vraag over de stof goed heeft, mag er iets moois uit kiezen.',
      opties:[{ t:'Beantwoord de vraag: goed is een schat', vragen:1, goed:{ schat:'gewoon' }, fout:{ m:5 } }, { t:'Neem alleen een flesje water mee', hulpje:'water' }] },
    { id:'computer', titel:'Het computerlokaal', tekst:'Een oefenprogramma stelt je twee vragen. Elke goede maakt een kaart beter.',
      opties:[{ t:'Oefen mee', vragen:2, perGoed:{ beter:1 } }, { t:'Even zitten: herstel 8', h:8 }] },
    { id:'orkest', titel:'Het schoolorkest', tekst:'Het orkest repeteert voor de kerstviering. Meedoen kost puf, maar je leert er iets bijzonders.',
      opties:[{ t:'Speel mee: 8 doorzetting, en je krijgt een zeldzame kaart', hpMin:8, kaartZeld:1 }, { t:'Luister mee: herstel 10', h:10 }] },
    { id:'rooster', titel:'Roosterwijziging', tekst:'Het derde uur valt uit. Wat doe je met dat uur?',
      opties:[{ t:'Naar de bibliotheek: verbeter een kaart', beterKies:1 }, { t:'Naar buiten: herstel 14', h:14 }, { t:'Naar de kantine: een hulpje', hulpje:'willekeurig' }] },
    { id:'feest', titel:'Het schoolfeest', tekst:'De feestcommissie zoekt hulp bij het versieren van de aula.',
      opties:[{ t:'Help de hele middag: 6 doorzetting, en je krijgt een schat als bedankje', hpMin:6, schat:'gewoon' }, { t:'Help een kwartiertje: 15 munten', m:15 }] },
    { id:'oefenen', titel:'Spreekbeurt oefenen', tekst:'Een klasgenoot oefent een spreekbeurt en vraagt of jij drie vragen wilt beantwoorden.',
      opties:[{ t:'Beantwoord de vragen: herstel 5 per goed antwoord', vragen:3, perGoed:{ h:5 } }, { t:'Geef tips en neem de kaart Spreekbeurt mee', kaart:'spreekbeurt' }] },
    { id:'kantine', titel:'De kantine', tekst:'Er is een aanbieding: volkoren broodjes en flesjes water.',
      opties:[{ t:'Een broodje: 15 munten, herstel 18', mk:15, h:18 }, { t:'Een flesje water voor later: 10 munten', mk:10, hulpje:'water' }, { t:'Niets kopen' }] },
    { id:'brugklas', titel:'Een brugklasser zoekt de weg', tekst:'Een brugklasser zoekt lokaal 2.14 en is al te laat voor de les.',
      opties:[{ t:'Loop mee: 5 doorzetting, en je krijgt een hulpje en 20 munten als dank', hpMin:5, hulpje:'willekeurig', m:20 }, { t:'Wijs de weg en loop door' }] },
    { id:'gym', titel:'De gymles', tekst:'De gymleraar laat je kiezen: een rondje hardlopen of rustig rekken en strekken.',
      opties:[{ t:'Hardlopen: 7 doorzetting kwijt, maar 8 meer voor de rest van de klim', hpMin:7, max:8 }, { t:'Rekken en strekken: herstel 10', h:10 }] }
  ];

  /* ---------- toeval uit een zaadje ---------- */
  function kans(st){
    st.r = (st.r + 0x6D2B79F5) | 0;
    var t = st.r;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function rnd(st, n){ return Math.floor(kans(st) * n); }
  function kies(st, a){ return a[rnd(st, a.length)]; }
  function schud(st, a){ for (var i = a.length - 1; i > 0; i--){ var j = rnd(st, i + 1), h = a[i]; a[i] = a[j]; a[j] = h; } return a; }
  /* een torencode is vier letters; die worden het zaadje */
  var LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  function code(){ var c = ''; for (var i = 0; i < 4; i++) c += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length)); return c; }
  function zaadVan(c){ c = String(c || '').toUpperCase(); var h = 2166136261; for (var i = 0; i < c.length; i++){ h ^= c.charCodeAt(i); h = Math.imul(h, 16777619); } return h | 0; }
  /* de dagtoren: de datum (jjjj-mm-dd) is het zaadje, dus iedereen klimt die dag dezelfde toren */
  function dagCode(d){ d = d || new Date(); function n2(x){ return (x < 10 ? '0' : '') + x; } return d.getFullYear() + '-' + n2(d.getMonth() + 1) + '-' + n2(d.getDate()); }

  /* ---------- een kaart ---------- */
  function def(k){ return KAARTEN[k.id] || KAARTEN.prik; }
  /* wat een kaart doet, met de verbetering erin */
  function effect(k){
    var d = def(k), p = k.p ? (d.plus || {}) : {};
    return { naam:d.naam + (k.p ? '+' : ''), kost:p.kost !== undefined ? p.kost : d.kost, soort:d.soort, doe:p.doe || d.doe || [],
             slim:p.slim || d.slim || null, vraag:p.vraag || d.vraag || null, alleenSlim:!!d.alleenSlim, alleenFout:!!d.alleenFout,
             eenmalig:!!d.eenmalig, blijvend:!!d.blijvend, onspeelbaar:!!d.onspeelbaar, vak:d.vak || '', zeld:d.zeld, w:d.w || 0 };
  }
  /* wat een kaart nu kost, met de Vulpen erin */
  function kostVan(st, k){ var e = effect(k); return Math.max(0, e.kost - (e.vraag && heeft(st, 'vulpen') ? 1 : 0)); }
  function nieuweKaart(st, id, p){ st.uid = (st.uid || 0) + 1; return { id:id, p:p ? 1 : 0, u:st.uid }; }

  /* ---------- een nieuwe beklimming ----------
     o.trede (0 tot 5), o.slot (ids die nog niet vrij zijn), o.dag (een datum:
     de dagtoren, altijd trede 0 en voor iedereen dezelfde kaarten). */
  function nieuw(torencode, vak, o){
    o = o || {};
    var dag = o.dag ? String(o.dag) : '';
    torencode = dag ? 'DAG' : (torencode || code());
    var trede = dag ? 0 : Math.max(0, Math.min(MAXTREDE, +o.trede || 0));
    var st = { v:VERSIE, code:torencode, dag:dag, trede:trede, slot:dag ? slot(null) : (o.slot || []).slice(),
      r:zaadVan(dag ? 'DAG' + dag : torencode), vak:vak || 'reken', hp:B.leven, max:B.leven, munten:0,
      stapel:[], rij:-1, kol:-1, pad:[], fase:'kaart', stop:null, g:null, bel:null, log:[],
      goed:0, fout:0, reeks:0, besteReeks:0, verdiepingen:0, gewonnen:false, klaar:false, weggehaald:0, beurten:0, uid:0,
      schatten:[], hulpjes:[], gezien:[] };
    var i;
    for (i = 0; i < 5; i++) st.stapel.push(nieuweKaart(st, 'prik'));
    for (i = 0; i < 4; i++) st.stapel.push(nieuweKaart(st, 'schrift'));
    var start = (VK[vak] || VK.eigen)[0];
    st.stapel.push(nieuweKaart(st, start.id));
    if (tr(st, 4)){ st.max -= 6; st.hp = st.max; st.stapel.push(nieuweKaart(st, 'kauwgom')); }
    st.kaart = maakKaart(st);
    return st;
  }

  /* Een bewaarde beklimming van een oudere versie: versie 1 had nog geen
     schatten, hulpjes, treden of dagtoren. Die velden komen erbij, zodat je
     gewoon verder kunt. Klopt de vorm niet, dan null: het scherm begint dan
     netjes opnieuw. */
  function zetOm(s, slotNu){
    try {
      if (!s || typeof s !== 'object' || !Array.isArray(s.stapel) || !Array.isArray(s.kaart) || s.kaart.length !== HOOG) return null;
      if (s.v !== 1 && s.v !== VERSIE) return null;
      if (!s.stapel.every(function(k){ return k && KAARTEN[k.id]; })) return null;
      if (!s.kaart.every(function(rij){ return Array.isArray(rij) && rij.every(function(k){ return k && VIJANDEN[k.vijand]; }); })) return null;
      if (s.v === 1){
        s.v = VERSIE; s.dag = ''; s.trede = 0; s.slot = (slotNu || []).slice();
        s.schatten = []; s.hulpjes = []; s.gezien = [];
        if (s.stop && s.stop.soort === 'winkel'){ s.stop.schatten = []; s.stop.hulpjes = []; }
        if (s.bel){ s.bel.schatKeuze = null; s.bel.schat = ''; s.bel.hulpje = ''; }
        if (s.g){ ['goedHier', 'dv', 'pg', 'pd', 'pk', 've', 'joker', 'postit', 'reken', 'sterK', 'banaan'].forEach(function(x){ if (s.g[x] == null) s.g[x] = 0; }); }
        if (s.fase === 'stop' && s.stop && s.stop.soort === 'gebeurtenis' && !GEBEURTENISSEN.some(function(g){ return g.id === s.stop.id; })) s.stop.id = 'boterham';
      }
      ['schatten', 'hulpjes', 'gezien', 'slot', 'pad', 'log'].forEach(function(x){ if (!Array.isArray(s[x])) s[x] = []; });
      return s;
    } catch (e){ return null; }
  }

  /* ---------- de kaart van de toren ----------
     Twaalf rijen van drie kamers; op 5 en 12 alleen de baas. Elke kamer heeft
     een tegenstander en soms eerst een tussenstop (rust, winkel of een
     gebeurtenis). Je gaat steeds een rij omhoog, naar een kamer die met de
     jouwe verbonden is. */
  function maakKaart(st){
    var rijen = [];
    for (var r = 0; r < HOOG; r++){
      var f = r + 1;
      if (BAAS.indexOf(f) >= 0){ rijen.push([{ f:f, c:1, soort:'baas', vijand:kies(st, BAZEN[f]), stop:null, naar:[] }]); continue; }
      var pot = schud(st, GEWOON.slice()), rij = [];
      for (var c = 0; c < 3; c++) rij.push({ f:f, c:c, soort:'gewoon', vijand:pot[c], stop:null, naar:[] });
      /* een lastpak vanaf de derde verdieping, hoogstens een per rij */
      if (f >= 3 && kans(st) < (f === 3 ? 0.4 : 0.55)){ var l = rij[rnd(st, 3)]; l.soort = 'lastpak'; l.vijand = kies(st, LASTPAK); }
      if (f >= 2) rij.forEach(function(k){
        if (kans(st) < 0.4){ var x = kans(st); k.stop = x < 0.3 ? 'rust' : x < 0.6 ? 'winkel' : 'gebeurtenis'; }
      });
      /* voor een baas altijd een rustplek in de rij, na de eerste baas een winkel */
      var zeker = function(soort){ if (!rij.some(function(k){ return k.stop === soort; })){ var k = rij[rnd(st, 3)]; k.stop = soort; } };
      if (f === 4 || f === 11) zeker('rust');
      if (f === 6) zeker('winkel');
      if (f === 3 || f === 8) zeker('gebeurtenis');
      rijen.push(rij);
    }
    /* de gangen tussen de rijen: recht omhoog, en soms schuin, zonder kruisingen */
    for (var q = 0; q < HOOG - 1; q++){
      var nu = rijen[q], erna = rijen[q + 1];
      if (erna.length === 1){ nu.forEach(function(k){ k.naar = [0]; }); continue; }
      if (nu.length === 1){ nu[0].naar = [0, 1, 2]; continue; }
      nu.forEach(function(k, i){ k.naar = [i]; });
      [0, 1].forEach(function(a){
        var x = kans(st);
        if (x < 0.35) nu[a].naar.push(a + 1);
        else if (x < 0.7) nu[a + 1].naar.push(a);
      });
      nu.forEach(function(k){ k.naar.sort(); });
    }
    return rijen;
  }
  function kamer(st){ return st.rij >= 0 ? st.kaart[st.rij][st.kol] : null; }
  function keuzes(st){
    if (st.fase !== 'kaart') return [];
    if (st.rij >= HOOG - 1) return [];
    var idx = st.rij < 0 ? st.kaart[0].map(function(k, i){ return i; }) : kamer(st).naar;
    return idx.map(function(i){ return { i:i, kamer:st.kaart[st.rij + 1][i] }; });
  }
  function kiesKamer(st, i){
    st.log = [];
    if (st.fase !== 'kaart') return false;
    if (!keuzes(st).some(function(k){ return k.i === i; })) return false;
    st.rij++; st.kol = i; st.pad.push(i);
    var k = kamer(st);
    if (k.stop) openStop(st, k.stop); else startGevecht(st);
    return true;
  }

  /* ---------- tussenstops ---------- */
  function poolKaarten(st, zeld){
    var uit = [];
    Object.keys(KAARTEN).forEach(function(id){
      var d = KAARTEN[id];
      if (d.zeld !== zeld) return;
      if (d.vak && d.vak !== st.vak) return;
      if (d.vak && d.start) return;
      if (!vrij(st, id)) return;
      uit.push(id);
    });
    return uit;
  }
  function vakPool(st, zeld){ return poolKaarten(st, zeld).filter(function(id){ return KAARTEN[id].vak; }); }
  function algPool(st, zeld){ return poolKaarten(st, zeld).filter(function(id){ return !KAARTEN[id].vak; }); }
  /* drie verschillende kaarten om uit te kiezen; bij een lastpak of baas zit er zeker een zeldzame bij */
  function trekOpties(st, n, zeker){
    var uit = [];
    for (var p = 0; uit.length < n && p < 40; p++){
      var zeld = (zeker && !uit.length) ? 1 : (kans(st) < 0.22 ? 1 : 0);
      var vak = kans(st) < 0.38;
      var pool = vak ? vakPool(st, zeld) : algPool(st, zeld);
      if (!pool.length) pool = algPool(st, zeld);
      var id = kies(st, pool);
      if (uit.indexOf(id) < 0) uit.push(id);
    }
    return uit;
  }
  /* schatten die je nog kunt krijgen, van deze zeldzaamheid (of lager bij -1) */
  function schatPool(st, zeld){
    return Object.keys(SCHATTEN).filter(function(id){
      var d = SCHATTEN[id];
      if (heeft(st, id) || !vrij(st, id)) return false;
      return zeld < 0 ? d.zeld < 2 : d.zeld === zeld;
    });
  }
  function trekSchat(st, zeld){
    var pool = schatPool(st, zeld);
    if (!pool.length) pool = schatPool(st, -1);
    return pool.length ? kies(st, pool) : '';
  }
  function geefSchat(st, id){
    if (!id || heeft(st, id) || !SCHATTEN[id]) return false;
    st.schatten.push(id);
    if (id === 'klassenfoto'){ st.max += 8; st.hp += 8; }
    st.log.push({ t:'schat', id:id });
    return true;
  }
  function geefHulpje(st, id){
    if (id === 'willekeurig') id = kies(st, Object.keys(HULPJES));
    if (!HULPJES[id]) return false;
    /* zakken vol: dan krijg je er munten voor */
    if (st.hulpjes.length >= MAXHULP){ st.munten += 10; st.log.push({ t:'vol', id:id, n:10 }); return false; }
    st.hulpjes.push(id); st.log.push({ t:'hulpje', id:id });
    return true;
  }
  function korting(st, prijs){ return heeft(st, 'kluissleutel') ? Math.round(prijs * 0.75) : prijs; }
  function prijsVan(id){ var d = KAARTEN[id]; return (d.zeld === 1 ? 72 : 44) + (d.vak ? 6 : 0); }
  function openStop(st, soort){
    st.fase = 'stop';
    if (soort === 'rust') st.stop = { soort:'rust' };
    else if (soort === 'winkel'){
      var waren = trekOpties(st, 2, false).concat(trekOpties(st, 1, true));
      var extra = vakPool(st, 0).filter(function(id){ return waren.indexOf(id) < 0; });
      if (extra.length) waren.push(kies(st, extra));
      var sch = [], z1 = trekSchat(st, kans(st) < 0.35 ? 1 : 0);
      if (z1) sch.push(z1);
      var z2 = schatPool(st, -1).filter(function(id){ return sch.indexOf(id) < 0; });
      if (z2.length && kans(st) < 0.5) sch.push(kies(st, z2));
      var hp = schud(st, Object.keys(HULPJES)).slice(0, 2);
      st.stop = { soort:'winkel',
        waren:waren.map(function(id){ return { id:id, prijs:korting(st, prijsVan(id) - 4 + rnd(st, 9)), weg:false }; }),
        schatten:sch.map(function(id){ return { id:id, prijs:korting(st, (SCHATTEN[id].zeld === 1 ? 165 : 128) + rnd(st, 16)), weg:false }; }),
        hulpjes:hp.map(function(id){ return { id:id, prijs:korting(st, 24 + rnd(st, 12)), weg:false }; }),
        wegPrijs:korting(st, 50 + 25 * st.weggehaald), wegGedaan:false, pleister:{ prijs:korting(st, 30), weg:false, h:15 } };
    } else {
      /* een gebeurtenis die je deze klim nog niet had */
      var nog = GEBEURTENISSEN.filter(function(g){ return st.gezien.indexOf(g.id) < 0; });
      if (!nog.length) nog = GEBEURTENISSEN;
      var gb = kies(st, nog);
      st.gezien.push(gb.id);
      st.stop = { soort:'gebeurtenis', id:gb.id };
    }
  }
  function verder(st){ st.log = []; if (st.fase !== 'stop') return false; st.stop = null; startGevecht(st); return true; }
  function heel(st, n){ var voor = st.hp; st.hp = Math.min(st.max, st.hp + n); st.log.push({ t:'heel', n:st.hp - voor }); }
  function verlies(st, n){ var voor = st.hp; st.hp = Math.max(1, st.hp - n); st.log.push({ t:'kwijt', n:voor - st.hp }); }
  function beter(st, kaartIdx){
    var k = st.stapel[kaartIdx];
    if (!k || k.p || !KAARTEN[k.id].plus) return false;
    k.p = 1; st.log.push({ t:'beter', id:k.id }); return true;
  }
  function rustHeelVan(st){ return Math.round(st.max * (B.rustHeel - (tr(st, 5) ? 0.06 : 0))) + (heeft(st, 'broodtrommel') ? 10 : 0); }
  function rust(st, wat, kaartIdx){
    st.log = [];
    if (st.fase !== 'stop' || !st.stop || st.stop.soort !== 'rust') return false;
    if (wat === 'heel') heel(st, rustHeelVan(st));
    else if (!beter(st, kaartIdx)) return false;
    return verder(st) || true;
  }
  function koop(st, i){
    st.log = [];
    var w = st.stop && st.stop.soort === 'winkel' ? st.stop.waren[i] : null;
    if (!w || w.weg || st.munten < w.prijs) return false;
    st.munten -= w.prijs; w.weg = true; st.stapel.push(nieuweKaart(st, w.id)); st.log.push({ t:'erbij', id:w.id });
    return true;
  }
  function koopSchat(st, i){
    st.log = [];
    var w = st.stop && st.stop.soort === 'winkel' ? (st.stop.schatten || [])[i] : null;
    if (!w || w.weg || st.munten < w.prijs || heeft(st, w.id)) return false;
    st.munten -= w.prijs; w.weg = true; geefSchat(st, w.id);
    return true;
  }
  function koopHulpje(st, i){
    st.log = [];
    var w = st.stop && st.stop.soort === 'winkel' ? (st.stop.hulpjes || [])[i] : null;
    if (!w || w.weg || st.munten < w.prijs || st.hulpjes.length >= MAXHULP) return false;
    st.munten -= w.prijs; w.weg = true; geefHulpje(st, w.id);
    return true;
  }
  function pleister(st){
    st.log = [];
    var p = st.stop && st.stop.soort === 'winkel' ? st.stop.pleister : null;
    if (!p || p.weg || st.munten < p.prijs || st.hp >= st.max) return false;
    st.munten -= p.prijs; p.weg = true; heel(st, p.h); return true;
  }
  function weg(st, kaartIdx){
    st.log = [];
    var s = st.stop;
    if (!s || s.soort !== 'winkel' || s.wegGedaan || st.munten < s.wegPrijs || st.stapel.length <= 5 || !st.stapel[kaartIdx]) return false;
    st.munten -= s.wegPrijs; s.wegGedaan = true; st.weggehaald++;
    st.log.push({ t:'weg', id:st.stapel[kaartIdx].id }); st.stapel.splice(kaartIdx, 1);
    return true;
  }
  function gebeurtenisDef(st){ var id = st.stop && st.stop.id; return GEBEURTENISSEN.filter(function(g){ return g.id === id; })[0] || null; }
  /* kan deze optie nu? (genoeg munten, of genoeg kaarten om weg te gooien) */
  function optieKan(st, opt){
    if (opt.mk && st.munten < opt.mk) return false;
    if (opt.weg && st.stapel.length <= 5) return false;
    if (opt.beterKies && !st.stapel.some(function(k){ return !k.p && KAARTEN[k.id].plus; })) return false;
    return true;
  }
  /* uitslagen: goed of fout per gestelde vraag; kaart: de gekozen kaart bij weggooien of verbeteren */
  function gebeurtenis(st, o, uitslagen, kaartIdx){
    st.log = [];
    var gb = gebeurtenisDef(st); if (!gb || st.fase !== 'stop') return false;
    var opt = gb.opties[o]; if (!opt || !optieKan(st, opt)) return false;
    uitslagen = uitslagen || [];
    if (opt.vragen && uitslagen.length < opt.vragen) return false;
    if ((opt.weg || opt.beterKies) && !st.stapel[kaartIdx]) return false;
    if (opt.beterKies && (st.stapel[kaartIdx].p || !KAARTEN[st.stapel[kaartIdx].id].plus)) return false;
    function pas(x){
      if (!x) return;
      if (x.mk){ st.munten -= x.mk; st.log.push({ t:'betaal', n:x.mk }); }
      if (x.hpMin) verlies(st, x.hpMin);
      if (x.m){ st.munten += x.m; st.log.push({ t:'munt', n:x.m }); }
      if (x.h) heel(st, x.h);
      if (x.max){ st.max += x.max; st.hp += x.max; st.log.push({ t:'max', n:x.max }); }
      if (x.beter){
        var kan = st.stapel.map(function(k, i){ return i; }).filter(function(i){ return !st.stapel[i].p && KAARTEN[st.stapel[i].id].plus; });
        schud(st, kan).slice(0, x.beter).forEach(function(i){ beter(st, i); });
      }
      if (x.schat){ var s = trekSchat(st, 0); if (s) geefSchat(st, s); else { st.munten += 30; st.log.push({ t:'munt', n:30 }); } }
      if (x.hulpje) geefHulpje(st, x.hulpje);
      if (x.kaart){ st.stapel.push(nieuweKaart(st, x.kaart)); st.log.push({ t:'erbij', id:x.kaart }); }
      if (x.kaartZeld){ var z = kies(st, algPool(st, 1).concat(vakPool(st, 1))); st.stapel.push(nieuweKaart(st, z)); st.log.push({ t:'erbij', id:z }); }
    }
    if (opt.vragen){
      uitslagen.slice(0, opt.vragen).forEach(function(g){ tel(st, g); if (opt.perGoed && g) pas(opt.perGoed); });
      if (opt.goed || opt.fout) pas(uitslagen[0] ? opt.goed : opt.fout);
    } else pas(opt);
    if (opt.beterKies) beter(st, kaartIdx);
    if (opt.weg){ st.log.push({ t:'weg', id:st.stapel[kaartIdx].id }); st.stapel.splice(kaartIdx, 1); }
    if (opt.ruil){
      var zw = zwakste(st);
      if (zw >= 0){
        var oud = st.stapel[zw].id, pool = algPool(st, 0).concat(vakPool(st, 0)), nieuwId = kies(st, pool);
        st.stapel.splice(zw, 1, nieuweKaart(st, nieuwId));
        st.log.push({ t:'ruil', van:oud, id:nieuwId });
      }
    }
    return verder(st) || true;
  }
  function zwakste(st){
    var b = -1, bw = 99;
    st.stapel.forEach(function(k, i){ var w = (KAARTEN[k.id].w || 0) + (k.p ? 2 : 0); if (w < bw){ bw = w; b = i; } });
    return b;
  }
  /* een antwoord telt mee voor de reeks en de munten, ook buiten een gevecht;
     in een gevecht werken ook de kaarten en schatten die op een goed of fout antwoord wachten */
  function tel(st, goed){
    if (goed){ st.goed++; st.reeks++; st.besteReeks = Math.max(st.besteReeks, st.reeks); st.munten += B.muntGoed + (heeft(st, 'spaarpot') ? 1 : 0); }
    else { st.fout++; st.reeks = 0; }
    var g = st.g;
    if (!g || g.fase === 'klaar') return;
    /* op dreef: drie goed op rij en elke klap doet meer, tot je een fout maakt */
    var was = g.dreef || 0;
    g.dreef = dreefVan(st, st.reeks);
    if (g.dreef > was) st.log.push({ t:'dreef', n:g.dreef, vuur:st.reeks >= vuurGrens(st) });
    if (goed){
      g.goedHier = (g.goedHier || 0) + 1;
      if (g.goedHier === 1 && heeft(st, 'gelukspen')){ trekKaarten(st, 2); st.log.push({ t:'schatwerkt', id:'gelukspen' }); }
      if (heeft(st, 'goudster') && (g.sterK || 0) < 3){ g.sterK = (g.sterK || 0) + 1; g.kracht += 1; st.log.push({ t:'kracht', op:'j', n:1 }); }
      if (g.pg){ g.blok += g.pg; st.log.push({ t:'blok', op:'j', n:g.pg }); }
      if (g.pd && g.v.hp > 0) raak(st, g.v, g.pd);
      var vd = VIJANDEN[g.v.id];
      if (vd.goedSchade && g.v.hp > 0) raak(st, g.v, vd.goedSchade);
    } else {
      if (heeft(st, 'stressbal')){ g.blok += 5; st.log.push({ t:'blok', op:'j', n:5 }); }
      if (heeft(st, 'uitlegkaart')) trekKaarten(st, 1);
    }
  }

  function dreefGrens(st){ return heeft(st, 'markeerset') ? 2 : B.dreef; }
  function vuurGrens(st){ return heeft(st, 'markeerset') ? 4 : B.vuur; }
  function dreefVan(st, r){ return r >= vuurGrens(st) ? B.vuurKracht : r >= dreefGrens(st) ? B.dreefKracht : 0; }

  /* ---------- het gevecht ---------- */
  function schaal(st, d){
    var f = kamer(st).f;
    if (d.baas) return { hp:B.baasHp * (tr(st, 3) ? 1.12 : 1), slag:1 };
    return { hp:(1 + B.hpGroei * (f - 1)) * (d.lastpak && tr(st, 3) ? 1.15 : 1), slag:B.slag * (1 + B.slagGroei * (f - 1)) * (tr(st, 1) ? 1.1 : 1) };
  }
  function startGevecht(st){
    var k = kamer(st), d = VIJANDEN[k.vijand], s = schaal(st, d);
    var hp = Math.round(d.hp * s.hp);
    var trek = schud(st, st.stapel.map(function(c){ return { id:c.id, p:c.p, u:c.u }; }));
    st.g = { v:{ id:k.vijand, naam:d.naam, hp:hp, max:hp, blok:0, kracht:(d.baas && tr(st, 5)) ? 3 : 0, zwak:0, wankel:heeft(st, 'bureaulamp') ? 2 : 0,
                 i:d.baas ? 0 : rnd(st, d.patroon.length), slag:s.slag, boos:false, plan:null },
             hand:[], trek:trek, af:[], weg:[], energie:0, blok:heeft(st, 'zandloper') ? 8 : 0, kracht:0, zwak:0, wankel:0, pb:0, slim:false, beurt:0, fase:'vraag',
             dreef:dreefVan(st, st.reeks), goedHier:0, dv:0, pg:0, pd:0, pk:0, ve:0, joker:0,
             postit:heeft(st, 'postit') ? 1 : 0, reken:heeft(st, 'potlood') ? 8 : 0, sterK:0, banaan:0 };
    st.fase = 'gevecht';
    plan(st);
    st.g.beurt = 1;
    st.log.push({ t:'gevecht', id:k.vijand });
  }
  /* wat de tegenstander deze beurt (of over n beurten) van plan is, met zijn kracht erin */
  function planVan(st, n){
    var v = st.g.v, d = VIJANDEN[v.id], p = d.patroon[(v.i + (n || 0)) % d.patroon.length], s = v.slag, uit = {};
    Object.keys(p).forEach(function(x){
      if (x === 'rk') uit.rk = p.rk;
      else uit[x] = (x === 'a' || x === 'b') ? Math.round(p[x] * s) : p[x];
    });
    return uit;
  }
  function plan(st){ st.g.v.plan = planVan(st, 0); }
  function trekKaarten(st, n){
    var g = st.g;
    for (var i = 0; i < n; i++){
      if (g.hand.length >= 10) return;
      if (!g.trek.length){
        if (!g.af.length) return;
        g.trek = schud(st, g.af); g.af = [];
        st.log.push({ t:'schud' });
      }
      g.hand.push(g.trek.pop());
    }
  }
  function antwoord(st, goed){
    st.log = [];
    var g = st.g;
    if (!g || g.fase !== 'vraag') return false;
    g.joker = 0;
    tel(st, goed);
    st.beurten++;
    /* een kaart of schat die op een goed antwoord wacht kan de tegenstander al uitschakelen */
    if (g.v.hp <= 0){ gewonnen(st); return true; }
    g.slim = !!goed;
    if (goed && B.slimZwak){ g.v.zwak += B.slimZwak; st.log.push({ t:'zwak', op:'v', n:B.slimZwak, schrik:true }); }
    var eerste = g.beurt === 1;
    g.energie = B.energie + (goed ? B.slimEnergie : 0) + (!goed ? 0 : st.reeks >= vuurGrens(st) ? B.vuurEnergie : st.reeks >= dreefGrens(st) ? B.dreefEnergie : 0) +
      g.ve + (eerste && heeft(st, 'agenda') ? 1 : 0);
    g.ve = 0;
    if (g.pk){ g.kracht += g.pk; st.log.push({ t:'kracht', op:'j', n:g.pk }); }
    trekKaarten(st, B.trek + (goed ? B.slimTrek : 0) + (eerste && heeft(st, 'etui') ? 2 : 0) + (heeft(st, 'boekentas') ? 1 : 0));
    g.fase = 'spelen';
    st.log.push({ t:goed ? 'slim' : 'gewoon' });
    return true;
  }
  /* schade van de speler op de tegenstander, of andersom */
  function klap(n, van, op){
    n = Math.max(0, n + (van.kracht || 0) + (van.dreef || 0));
    if (van.zwak > 0) n = Math.floor(n * 0.75);
    if (op.wankel > 0) n = Math.floor(n * 1.5);
    return n;
  }
  function raak(st, doel, n){
    var afgevangen = Math.min(doel.blok, n);
    doel.blok -= afgevangen;
    var echt = n - afgevangen;
    if (doel === st.g.v) doel.hp = Math.max(0, doel.hp - echt);
    else st.hp = Math.max(0, st.hp - echt);
    st.log.push({ t:'raak', op:doel === st.g.v ? 'v' : 'j', n:echt, blok:afgevangen });
    return echt;
  }
  function kennis(g){ return Math.min(g.goedHier || 0, B.kennisMax); }
  function isRommel(k){ return KAARTEN[k.id] && KAARTEN[k.id].soort === 'rommel'; }
  function doeEffecten(st, lijst){
    var g = st.g, v = g.v;
    /* het Scherp potlood: de eerste klap van je eerste aanval doet meer */
    function sla(n){ var b = g.bonus || 0; g.bonus = 0; raak(st, v, klap(n + b, g, v)); }
    (lijst || []).forEach(function(e){
      var n = e[1];
      switch (e[0]){
        case 's': for (var x = 0; x < (e[2] || 1) && v.hp > 0; x++) sla(n); break;
        case 'sl': n.forEach(function(m){ if (v.hp > 0) sla(m); }); break;
        case 'rs': if (v.hp > 0) sla(n + e[2] * Math.min(st.reeks, 8)); break;
        case 'gs': if (v.hp > 0) sla(n + e[2] * kennis(g)); break;
        case 'b': g.blok += n; st.log.push({ t:'blok', op:'j', n:n }); break;
        case 'gb': var bl = n + e[2] * kennis(g); g.blok += bl; st.log.push({ t:'blok', op:'j', n:bl }); break;
        case 't': trekKaarten(st, n); break;
        case 'e': g.energie += n; break;
        case 'k': g.kracht += n; st.log.push({ t:'kracht', op:'j', n:n }); break;
        case 'z': v.zwak += n; st.log.push({ t:'zwak', op:'v', n:n }); break;
        case 'w': v.wankel += n; st.log.push({ t:'wankel', op:'v', n:n }); break;
        case 'h': heel(st, n); break;
        case 'm': st.munten += n; st.log.push({ t:'munt', n:n }); break;
        case 'pb': g.pb += n; g.blok += n; st.log.push({ t:'blok', op:'j', n:n }); break;
        case 'pg': g.pg += n; break;
        case 'pd': g.pd += n; break;
        case 'pk': g.pk += n; break;
        case 've': g.ve += n; break;
        case 'dv': g.dv += n; break;
        case 'schoon': g.zwak = 0; g.wankel = 0; st.log.push({ t:'schoon' }); break;
        case 'opl':
          if (!g.slim){
            g.slim = true; g.energie += B.slimEnergie; trekKaarten(st, B.slimTrek);
            v.zwak += B.slimZwak; st.log.push({ t:'zwak', op:'v', n:B.slimZwak, schrik:true }); st.log.push({ t:'slim', laat:true });
          }
          break;
        case 'ruim': ruim(st, n); break;
      }
    });
  }
  /* rommel opruimen: uit je hand (en bij 2 ook uit je stapels), met een nieuwe kaart voor elke uit je hand */
  function ruim(st, n){
    var g = st.g, inHand = g.hand.filter(isRommel);
    g.hand = g.hand.filter(function(k){ return !isRommel(k); });
    var weg = inHand.length;
    if (n >= 2){
      var t = g.trek.filter(isRommel).length + g.af.filter(isRommel).length;
      g.trek = g.trek.filter(function(k){ return !isRommel(k); });
      g.af = g.af.filter(function(k){ return !isRommel(k); });
      weg += t;
    }
    g.weg = g.weg.concat(inHand);
    st.log.push({ t:'ruim', n:weg });
    if (inHand.length) trekKaarten(st, inHand.length);
  }
  /* kan deze kaart nu? geeft een reden als het niet kan */
  function magSpelen(st, h){
    var g = st.g; if (!g || g.fase !== 'spelen') return 'niet nu';
    var k = g.hand[h]; if (!k) return 'geen kaart';
    var e = effect(k);
    if (e.onspeelbaar) return 'Deze kaart kun je niet spelen.';
    if (e.alleenSlim && !g.slim) return 'Werkt alleen na een goed antwoord.';
    if (e.alleenFout && g.slim) return 'Werkt alleen als je de vraag van deze beurt fout had.';
    if (kostVan(st, k) > g.energie) return 'Te weinig energie.';
    return '';
  }
  function speel(st, h, goed){
    st.log = [];
    if (magSpelen(st, h)) return false;
    var g = st.g, k = g.hand[h], e = effect(k);
    if (e.vraag && goed === undefined) return false;
    g.energie -= kostVan(st, k);
    g.hand.splice(h, 1);
    st.log.push({ t:'speel', id:k.id, p:k.p });
    if (e.soort === 'aanval' && g.reken){ g.bonus = g.reken; g.reken = 0; }
    if (e.vraag){
      g.joker = 0;
      var dubbel = g.dv > 0 || g.postit > 0;
      if (g.dv > 0) g.dv--; else if (g.postit > 0) g.postit = 0;
      tel(st, !!goed);
      if (g.v.hp > 0){
        doeEffecten(st, goed ? e.vraag.goed : e.vraag.fout);
        if (goed && dubbel){ st.log.push({ t:'dubbel' }); doeEffecten(st, e.vraag.goed); }
      }
    } else {
      doeEffecten(st, e.doe);
      if (g.slim && e.slim) doeEffecten(st, e.slim);
    }
    g.bonus = 0;
    if (e.eenmalig || e.blijvend) g.weg.push(k); else g.af.push(k);
    if (g.v.hp <= 0) gewonnen(st);
    return true;
  }
  /* ---------- hulpjes gebruiken ---------- */
  function hulpjeKan(st, i){
    var id = st.hulpjes[i]; if (!id || st.klaar) return '';
    var g = st.g, d = HULPJES[id];
    if (id === 'water') return st.hp < st.max && st.fase !== 'einde' && (!g || g.fase !== 'klaar') ? 'ja' : '';
    if (st.fase !== 'gevecht' || !g) return '';
    if (d.vraag) return (g.fase === 'vraag' || g.fase === 'spelen') && !g.joker ? 'ja' : '';
    return g.fase === 'spelen' ? 'ja' : '';
  }
  function gebruik(st, i){
    st.log = [];
    if (!hulpjeKan(st, i)) return false;
    var id = st.hulpjes[i], g = st.g;
    st.hulpjes.splice(i, 1);
    st.log.push({ t:'gebruik', id:id });
    switch (id){
      case 'water': heel(st, 12); break;
      case 'pepermunt': g.energie += 2; break;
      case 'joker': g.joker = 1; break;
      case 'appel': g.blok += 10; st.log.push({ t:'blok', op:'j', n:10 }); break;
      case 'banaan': g.kracht += 2; st.log.push({ t:'kracht', op:'j', n:2 }); break;
      case 'grapje': g.v.zwak += 3; st.log.push({ t:'zwak', op:'v', n:3 }); break;
      case 'schriftje': trekKaarten(st, 3); break;
      case 'doekje': ruim(st, 2); break;
    }
    return true;
  }
  function gooiWeg(st, i){ st.log = []; if (!st.hulpjes[i]) return false; st.log.push({ t:'gooi', id:st.hulpjes[i] }); st.hulpjes.splice(i, 1); return true; }

  function vijandExtra(st){ var d = VIJANDEN[st.g.v.id]; return d.kijkt && !st.g.slim ? d.kijkt : 0; }
  function beurtKlaar(st){
    st.log = [];
    var g = st.g; if (!g || g.fase !== 'spelen') return false;
    g.af = g.af.concat(g.hand); g.hand = [];
    if (g.zwak > 0) g.zwak--;
    if (g.v.wankel > 0) g.v.wankel--;
    /* de tegenstander */
    var v = g.v, p = v.plan || {}, extra = vijandExtra(st);
    v.blok = 0;
    if (p.a){
      for (var x = 0; x < (p.x || 1) && st.hp > 0 && v.hp > 0; x++){
        var echt = raak(st, g, klap(p.a + extra, v, g));
        if (echt > 0 && heeft(st, 'cactus') && v.hp > 0){ raak(st, v, 3); }
      }
    }
    if (v.hp <= 0 && st.hp > 0){ gewonnen(st); return true; }
    var oren = heeft(st, 'koptelefoon');
    if (p.b){ v.blok += p.b; st.log.push({ t:'blok', op:'v', n:p.b }); }
    if (p.k){ v.kracht += p.k; st.log.push({ t:'kracht', op:'v', n:p.k }); }
    if (p.z && !oren){ g.zwak += p.z; st.log.push({ t:'zwak', op:'j', n:p.z }); }
    if (p.w && !oren){ g.wankel += p.w; st.log.push({ t:'wankel', op:'j', n:p.w }); }
    if ((p.z || p.w) && oren) st.log.push({ t:'schatwerkt', id:'koptelefoon' });
    if (p.r){ for (var r = 0; r < p.r; r++) g.af.push(nieuweKaart(st, p.rk || 'propje')); st.log.push({ t:'rommel', n:p.r, id:p.rk || 'propje' }); }
    if (p.h){ var voor = v.hp; v.hp = Math.min(v.max, v.hp + p.h); st.log.push({ t:'vheel', n:v.hp - voor }); }
    if (v.zwak > 0) v.zwak--;
    if (g.wankel > 0) g.wankel--;
    if (st.hp <= 0){ verloren(st); return true; }
    /* een baas die onder de helft komt wordt boos: meer kracht */
    var d = VIJANDEN[v.id];
    if (d.boos && !v.boos && v.hp <= v.max / 2){ v.boos = true; v.kracht += d.boos; st.log.push({ t:'boos', n:d.boos }); }
    v.i++; plan(st);
    /* een nieuwe beurt: het blok is weg, blijvend blok komt terug */
    g.beurt++; g.blok = g.pb; g.slim = false; g.energie = 0; g.fase = 'vraag';
    if (g.pb) st.log.push({ t:'blok', op:'j', n:g.pb });
    return true;
  }
  function gewonnen(st){
    if (st.g.fase === 'klaar') return;
    var k = kamer(st), d = VIJANDEN[st.g.v.id];
    st.g.fase = 'klaar';
    st.verdiepingen = k.f;
    st.log.push({ t:'op', id:st.g.v.id });
    var m = (d.baas ? 50 : d.lastpak ? 30 + rnd(st, 11) : 12 + rnd(st, 8)) + (heeft(st, 'schoolpas') ? 8 : 0);
    st.munten += m;
    if (k.f === HOOG){ st.gewonnen = true; einde(st); return; }
    if (d.baas) heel(st, Math.round(st.max * B.baasHeel));
    else heel(st, (tr(st, 2) ? 9 : B.naGevecht));
    if (heeft(st, 'bidon')) heel(st, 5);
    st.bel = { munten:m, opties:trekOpties(st, 3, d.baas || d.lastpak), soort:k.soort, schat:'', schatKeuze:null, hulpje:'' };
    /* een lastpak geeft een schat; een baas laat je kiezen uit drie bijzondere */
    if (d.lastpak){ var s = trekSchat(st, kans(st) < 0.3 ? 1 : 0); if (s && geefSchat(st, s)) st.bel.schat = s; }
    if (d.baas){
      var pool = schud(st, schatPool(st, 2)).slice(0, 3);
      if (pool.length) st.bel.schatKeuze = pool;
    }
    if (d.baas || (d.lastpak ? kans(st) < 0.5 : kans(st) < B.hulpKans)){
      var hid = kies(st, Object.keys(HULPJES));
      if (st.hulpjes.length < MAXHULP){ st.hulpjes.push(hid); st.bel.hulpje = hid; }
    }
    st.fase = 'beloning';
  }
  function verloren(st){ st.g.fase = 'klaar'; st.log.push({ t:'uitgeteld' }); einde(st); }
  function einde(st){ st.fase = 'einde'; st.klaar = true; }
  function kiesSchat(st, i){
    st.log = [];
    if (st.fase !== 'beloning' || !st.bel || !st.bel.schatKeuze) return false;
    var id = st.bel.schatKeuze[i];
    if (i >= 0 && !id) return false;
    if (id) geefSchat(st, id);
    st.bel.schat = id || ''; st.bel.schatKeuze = null;
    return true;
  }
  function beloning(st, k){
    st.log = [];
    if (st.fase !== 'beloning' || (st.bel && st.bel.schatKeuze)) return false;
    if (k >= 0 && st.bel.opties[k]){ st.stapel.push(nieuweKaart(st, st.bel.opties[k])); st.log.push({ t:'erbij', id:st.bel.opties[k] }); }
    st.bel = null; st.g = null; st.fase = 'kaart';
    return true;
  }
  /* de score: verdiepingen tellen het zwaarst, dan goede antwoorden, en wie wint ook zijn doorzetting; elke trede telt mee */
  function punten(st){ return Math.round((st.verdiepingen * 100 + st.goed * 10 + (st.gewonnen ? st.hp * 5 : 0)) * (1 + 0.1 * (st.trede || 0))); }

  /* ---------- de tekst op een kaart ---------- */
  function effTekst(e, g, plus){
    var n = e[1], t;
    function sch(m){ return g ? klap(m, g, g.v) : m; }
    switch (e[0]){
      case 's': t = (plus ? '+' + n : sch(n)) + ' schade' + (e[2] > 1 ? ', ' + e[2] + ' keer' : ''); break;
      case 'sl': t = n.map(sch).join(' + ') + ' schade'; break;
      case 'rs': t = sch(n) + ' schade, +' + e[2] + ' per goed antwoord op rij' + (g ? ' (nu ' + sch(n + e[2] * Math.min(g.reeks || 0, 8)) + ')' : ''); break;
      case 'gs': t = sch(n) + ' schade, +' + e[2] + ' per goed antwoord in dit gevecht' + (g ? ' (nu ' + sch(n + e[2] * kennis(g)) + ')' : ''); break;
      case 'b': t = (plus ? '+' : '') + n + ' blok'; break;
      case 'gb': t = n + ' blok, +' + e[2] + ' per goed antwoord in dit gevecht' + (g ? ' (nu ' + (n + e[2] * kennis(g)) + ')' : ''); break;
      case 't': t = (plus ? '+' : '') + 'trek ' + n + (n === 1 ? ' kaart' : ' kaarten'); break;
      case 'e': t = '+' + n + ' energie'; break;
      case 'k': t = '+' + n + ' kracht'; break;
      case 'z': t = 'maak zwak (' + n + ')'; break;
      case 'w': t = 'maak wankel (' + n + ')'; break;
      case 'h': t = 'herstel ' + n; break;
      case 'm': t = '+' + n + ' munten'; break;
      case 'pb': t = 'elke beurt ' + n + ' blok'; break;
      case 'pg': t = 'na elk goed antwoord in dit gevecht: ' + n + ' blok'; break;
      case 'pd': t = 'na elk goed antwoord in dit gevecht: ' + n + ' schade op de tegenstander'; break;
      case 'pk': t = 'elke beurt ' + n + ' kracht erbij'; break;
      case 've': t = 'volgende beurt +' + n + ' energie'; break;
      case 'dv': t = 'je volgende vraagkaart telt dubbel'; break;
      case 'schoon': t = 'je bent niet meer zwak of wankel'; break;
      case 'opl': t = 'je bent alsnog opgeladen'; break;
      case 'ruim': t = n >= 2 ? 'ruim alle rommel op, ook in je stapels; trek een kaart voor elke uit je hand' : 'ruim de rommel in je hand op en trek er nieuwe kaarten voor'; break;
      default: t = '';
    }
    return t;
  }
  function zin(lijst, g, plus){ var t = (lijst || []).map(function(e){ return effTekst(e, g, plus); }).filter(Boolean).join(', '); return t ? t.charAt(0).toUpperCase() + t.slice(1) : ''; }
  /* g mag leeg zijn (buiten een gevecht); reeks voor Op dreef; st voor de kosten met de Vulpen */
  function tekst(k, g, reeks, st){
    var e = effect(k), d = def(k), gg = g ? Object.assign({}, g, { reeks:reeks || 0 }) : null;
    return {
      naam:e.naam, kost:st ? kostVan(st, k) : e.kost, soort:e.soort, vak:e.vak, zeld:e.zeld, fig:d.fig || '', bij:d.bij || '',
      eerst: e.alleenSlim ? 'Alleen na een goed antwoord.' : e.alleenFout ? 'Alleen als je de vraag van deze beurt fout had. Extra vraag.' : e.vraag ? 'Extra vraag.' : '',
      doe: d.uitleg || zin(e.doe, gg),
      slim: e.slim ? zin(e.slim, gg, true) : '',
      goed: e.vraag ? zin(e.vraag.goed, gg) || 'Niets' : '', fout: e.vraag ? zin(e.vraag.fout, gg) || 'niets' : '',
      vraag: !!e.vraag,
      na: e.blijvend ? 'Blijft dit gevecht.' : e.eenmalig ? 'Eenmalig per gevecht.' : '',
      kanBeter: !k.p && !!d.plus
    };
  }
  /* wat de tegenstander van plan is (n: zoveel beurten later), in woorden en als soort voor het plaatje */
  function planTekst(st, n){
    var g = st.g; if (!g) return null;
    var v = g.v, p = n ? planVan(st, n) : (v.plan || {}), delen = [], soort = 'anders', dmg = 0;
    var extra = n || g.fase !== 'spelen' ? 0 : vijandExtra(st);
    if (p.a){ dmg = klap(p.a + extra, v, n ? { wankel:0 } : g); delen.push((p.x > 1 ? dmg + ' × ' + p.x : dmg) + ' schade'); soort = 'aanval'; }
    if (p.b){ delen.push(p.b + ' blok'); if (!p.a) soort = 'blok'; }
    if (p.k){ delen.push('+' + p.k + ' kracht'); if (!p.a && !p.b) soort = 'kracht'; }
    if (p.h){ delen.push('herstelt ' + p.h); if (!p.a && !p.b) soort = 'heel'; }
    if (p.z){ delen.push('maakt je zwak'); if (!p.a) soort = 'raar'; }
    if (p.w){ delen.push('maakt je wankel'); if (!p.a) soort = 'raar'; }
    if (p.r){ delen.push((p.r === 1 ? 'een ' : p.r + ' ') + (p.rk === 'kauwgom' ? 'kauwgom' : (p.r === 1 ? 'propje' : 'propjes')) + ' in je stapel'); if (!p.a) soort = 'raar'; }
    return { tekst:delen.join(', '), soort:soort, schade:dmg * (p.x || 1), getal:p.a ? (p.x > 1 ? dmg + '×' + p.x : '' + dmg) : p.b ? '' + p.b : '', extra:extra };
  }

  /* ---------- de speelbot ----------
     Speelt zoals een redelijke leerling: eerst gratis kaarten die iets
     opleveren, dan genoeg blok voor wat eraan komt, en de rest in aanvallen;
     kan hij de tegenstander deze beurt uitschakelen, dan valt hij aan. Hij
     wordt gebruikt voor de balanssimulatie en voor de test in de browser.
     p: de kans dat hij een vraag goed heeft, voor wat een vraagkaart oplevert. */
  var bot = {};
  function inkomend(st){
    var g = st.g, p = g.v.plan || {};
    return p.a ? klap(p.a + vijandExtra(st), g.v, g) * (p.x || 1) : 0;
  }
  function waardeKaart(st, k, p){
    var g = st.g, e = effect(k), v = g.v;
    var lijst = e.vraag ? null : e.doe.concat(g.slim && e.slim ? e.slim : []);
    var dmg = 0, blk = 0, rest = 0, vroeg = Math.max(1, 5 - g.beurt);
    var rommel = g.hand.filter(isRommel).length;
    function tel2(l, f){
      (l || []).forEach(function(x){
        var n = x[1];
        if (x[0] === 's') dmg += f * klap(n, g, v) * (x[2] || 1);
        else if (x[0] === 'sl') n.forEach(function(m){ dmg += f * klap(m, g, v); });
        else if (x[0] === 'rs') dmg += f * klap(n + x[2] * Math.min(st.reeks, 8), g, v);
        else if (x[0] === 'gs') dmg += f * klap(n + x[2] * kennis(g), g, v);
        else if (x[0] === 'b') blk += f * n;
        else if (x[0] === 'gb') blk += f * (n + x[2] * kennis(g));
        else if (x[0] === 't') rest += f * n * 4;
        else if (x[0] === 'e') rest += f * n * 7;
        else if (x[0] === 'k') rest += f * n * 5 * vroeg;
        else if (x[0] === 'pb'){ blk += f * n; rest += f * n * 3 * vroeg; }
        else if (x[0] === 'pg' || x[0] === 'pd') rest += f * n * 2.2 * vroeg * p;
        else if (x[0] === 'pk') rest += f * n * 4 * vroeg;
        else if (x[0] === 've') rest += f * n * 5;
        else if (x[0] === 'dv') rest += f * (g.hand.some(function(c){ return effect(c).vraag; }) ? 8 : 2);
        else if (x[0] === 'schoon') rest += f * ((g.zwak ? 4 : 0) + (g.wankel ? 6 : 0));
        else if (x[0] === 'opl') rest += f * (g.slim ? 0 : 14);
        else if (x[0] === 'ruim') rest += f * rommel * 5;
        else if (x[0] === 'z') rest += f * (inkomend(st) > 0 ? n * 3 : n);
        else if (x[0] === 'w') rest += f * n * 3;
        else if (x[0] === 'h') rest += f * Math.min(n, st.max - st.hp) * 1.2;
        else if (x[0] === 'm') rest += f * n * 0.3;
      });
    }
    if (e.vraag){ tel2(e.vraag.goed, p * (g.dv || g.postit ? 2 : 1)); tel2(e.vraag.fout, 1 - p); }
    else tel2(lijst, 1);
    return { dmg:dmg, blk:blk, rest:rest, kost:kostVan(st, k) };
  }
  /* geeft de index van de kaart die hij speelt, of -1 voor Beurt klaar */
  bot.speel = function(st, p){
    var g = st.g; if (!g || g.fase !== 'spelen') return -1;
    var nodig = Math.max(0, inkomend(st) - g.blok), leven = g.v.hp + g.v.blok;
    var kan = g.hand.map(function(k, i){ return i; }).filter(function(i){ return !magSpelen(st, i); });
    if (!kan.length) return -1;
    var w = {}; kan.forEach(function(i){ w[i] = waardeKaart(st, g.hand[i], p); });
    /* uitschakelen kan: de hardste klap per energie */
    var totaal = 0, en = g.energie;
    kan.slice().sort(function(a, b){ return w[b].dmg / Math.max(0.5, w[b].kost) - w[a].dmg / Math.max(0.5, w[a].kost); })
      .forEach(function(i){ if (w[i].kost <= en && w[i].dmg > 0){ en -= w[i].kost; totaal += w[i].dmg; } });
    if (totaal >= leven){
      var hard = kan.filter(function(i){ return w[i].dmg > 0; }).sort(function(a, b){ return w[b].dmg - w[a].dmg; });
      if (hard.length) return hard[0];
    }
    var beste = -1, bs = 0.5;
    kan.forEach(function(i){
      var x = w[i], d = def(g.hand[i]);
      var s = x.dmg + Math.min(x.blk, nodig) * 1.35 + Math.max(0, x.blk - nodig) * 0.12 + x.rest;
      if (d.soort === 'rommel') s = 0.6;
      s = s / (x.kost === 0 ? 0.5 : x.kost);
      if (s > bs){ bs = s; beste = i; }
    });
    return beste;
  };
  bot.kaartWaarde = function(st, id){
    var d = KAARTEN[id]; var w = d.w || 0;
    var n = st.stapel.length;
    var aanv = st.stapel.filter(function(k){ return KAARTEN[k.id].soort === 'aanval'; }).length;
    if (d.soort === 'aanval' && aanv < n * 0.4) w += 1;
    if (d.soort === 'verdediging' && aanv > n * 0.6) w += 1;
    return w;
  };
  bot.beloning = function(st){
    var o = st.bel.opties, b = -1, bw = 0;
    o.forEach(function(id, i){ var w = bot.kaartWaarde(st, id); if (w > bw){ bw = w; b = i; } });
    if (st.stapel.length >= 22 && bw < 7) return -1;
    return bw >= 5 ? b : -1;
  };
  /* na een baas: de eerste schat uit de drie die hij het liefst heeft */
  var SCHATVOORKEUR = ['markeerset', 'boekentas', 'goudster', 'vulpen'];
  bot.schat = function(st){
    var o = st.bel.schatKeuze || [], b = 0, bw = 99;
    o.forEach(function(id, i){ var w = SCHATVOORKEUR.indexOf(id); if (w >= 0 && w < bw){ bw = w; b = i; } });
    return b;
  };
  bot.kamer = function(st){
    var k = keuzes(st), deel = st.hp / st.max, b = k[0].i, bs = -99;
    k.forEach(function(x){
      var s = 0, km = x.kamer;
      if (km.soort === 'lastpak') s += deel > 0.7 ? 1.5 : -3;
      if (km.stop === 'rust') s += deel < 0.6 ? 4 : 0.5;
      if (km.stop === 'winkel') s += st.munten >= 70 ? 2.5 : 0;
      if (km.stop === 'gebeurtenis') s += 1;
      s += kans(st) * 0.5;
      if (s > bs){ bs = s; b = x.i; }
    });
    return b;
  };
  bot.rust = function(st){
    if (st.hp < st.max * 0.62) return { wat:'heel' };
    var b = -1, bw = -1;
    st.stapel.forEach(function(k, i){ var d = KAARTEN[k.id]; if (k.p || !d.plus) return; var w = d.w + (d.zeld === 9 ? -1 : 0); if (w > bw){ bw = w; b = i; } });
    return b >= 0 ? { wat:'beter', kaart:b } : { wat:'heel' };
  };
  /* de winkel: een rijtje stappen; null als hij klaar is */
  bot.winkel = function(st){
    var s = st.stop;
    if (!s.pleister.weg && st.hp < st.max * 0.5 && st.munten >= s.pleister.prijs) return { wat:'pleister' };
    var si = -1;
    (s.schatten || []).forEach(function(w, i){ if (si < 0 && !w.weg && w.prijs <= st.munten) si = i; });
    if (si >= 0) return { wat:'schat', i:si };
    var b = -1, bw = 5.5;
    s.waren.forEach(function(w, i){ if (w.weg || w.prijs > st.munten) return; var x = bot.kaartWaarde(st, w.id); if (x > bw){ bw = x; b = i; } });
    if (b >= 0) return { wat:'koop', i:b };
    var hi = -1;
    (s.hulpjes || []).forEach(function(w, i){ if (hi < 0 && !w.weg && w.prijs <= st.munten - 30 && st.hulpjes.length < MAXHULP) hi = i; });
    if (hi >= 0) return { wat:'hulpje', i:hi };
    if (!s.wegGedaan && st.munten >= s.wegPrijs && st.stapel.length > 8){
      var z = zwakste(st); if (z >= 0 && KAARTEN[st.stapel[z].id].zeld === 9) return { wat:'weg', kaart:z };
    }
    return null;
  };
  bot.gebeurtenis = function(st){
    var gb = gebeurtenisDef(st), deel = st.hp / st.max, o;
    switch (gb.id){
      case 'bieb': o = { o:deel < 0.4 ? 1 : 0 }; break;
      case 'boterham': o = { o:deel < 0.7 ? 0 : 1 }; break;
      case 'kluisje': o = { o:0, kaart:zwakste(st) }; break;
      case 'orkest': o = { o:deel > 0.6 ? 0 : 1 }; break;
      case 'feest': o = { o:deel > 0.6 ? 0 : 1 }; break;
      case 'brugklas': o = { o:deel > 0.5 ? 0 : 1 }; break;
      case 'gym': o = { o:deel > 0.7 ? 0 : 1 }; break;
      case 'kantine': o = { o:deel < 0.75 && st.munten >= 15 ? 0 : st.munten >= 10 && st.hulpjes.length < MAXHULP ? 1 : 2 }; break;
      case 'fotograaf': o = { o:st.munten >= 60 ? 0 : 1 }; break;
      case 'rooster': o = { o:deel < 0.6 ? 1 : 0, kaart:bot.rust(Object.assign({}, st, { hp:st.max })).kaart }; break;
      default: o = { o:0 };
    }
    if (!optieKan(st, gb.opties[o.o])) o = { o:gb.opties.length - 1, kaart:zwakste(st) };
    return o;
  };
  /* hulpjes: welk hulpje hij nu zou gebruiken (de index), of -1 */
  bot.hulpjeKeuze = function(st, fase){
    var g = st.g; if (!g || !st.hulpjes.length) return -1;
    var vd = VIJANDEN[g.v.id], zwaar = vd.baas || vd.lastpak;
    function zoek(id){ var i = st.hulpjes.indexOf(id); return i >= 0 && hulpjeKan(st, i) ? i : -1; }
    function eerste(ids){ for (var k = 0; k < ids.length; k++){ var i = zoek(ids[k]); if (i >= 0) return i; } return -1; }
    if (fase === 'vraag') return zwaar ? zoek('joker') : -1;
    if (fase !== 'spelen') return -1;
    if (st.hp < st.max * 0.4 && zoek('water') >= 0) return zoek('water');
    if (g.hand.filter(isRommel).length >= 2 && zoek('doekje') >= 0) return zoek('doekje');
    if (!zwaar) return -1;
    if (inkomend(st) - g.blok >= 12 && zoek('appel') >= 0) return zoek('appel');
    if (g.beurt <= 2){ var x = eerste(['banaan', 'grapje']); if (x >= 0) return x; }
    return eerste(['pepermunt', 'schriftje']);
  };
  /* en meteen gebruiken: true als dat lukte (dan nog een stap) */
  bot.hulpje = function(st, fase){ var i = bot.hulpjeKeuze(st, fase); return i >= 0 ? gebruik(st, i) : false; };
  bot.zwakste = zwakste;

  var KT = {
    VERSIE:VERSIE, HOOG:HOOG, MAXHULP:MAXHULP, MAXTREDE:MAXTREDE, B:B, TREDEN:TREDEN, KAARTEN:KAARTEN, VIJANDEN:VIJANDEN, GEBEURTENISSEN:GEBEURTENISSEN,
    SCHATTEN:SCHATTEN, HULPJES:HULPJES, VRIJ:VRIJ, BAZEN:BAZEN, GEWOON:GEWOON, LASTPAK:LASTPAK,
    code:code, dagCode:dagCode, nieuw:nieuw, zetOm:zetOm, slot:slot, keuzes:keuzes, kiesKamer:kiesKamer, kamer:kamer, antwoord:antwoord, speel:speel,
    magSpelen:magSpelen, kostVan:kostVan, beurtKlaar:beurtKlaar, beloning:beloning, kiesSchat:kiesSchat, rust:rust, rustHeel:rustHeelVan,
    koop:koop, koopSchat:koopSchat, koopHulpje:koopHulpje, weg:weg, pleister:pleister, verder:verder,
    gebruik:gebruik, gooiWeg:gooiWeg, hulpjeKan:hulpjeKan, heeft:heeft, trekje:trekje, optieKan:optieKan,
    gebeurtenis:gebeurtenis, gebeurtenisDef:gebeurtenisDef, effect:effect, tekst:tekst, planTekst:planTekst, punten:punten,
    dreefGrens:dreefGrens, vuurGrens:vuurGrens, bot:bot
  };
  root.KAARTTOREN = KT;
  if (typeof module !== 'undefined' && module.exports) module.exports = KT;
})(typeof window !== 'undefined' ? window : globalThis);
