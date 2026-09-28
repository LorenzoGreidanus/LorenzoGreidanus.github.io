/* De zinnenmaker van het dictee: nieuwe opgaven zonder eind, zodat je heel
   lang kunt oefenen zonder dat er iets terugkomt.

   Alles wat getoetst wordt, staat hier uitgeschreven: elke vorm van elk
   werkwoord, elk meervoud en elk verkleinwoord. Er wordt dus niets
   "uitgerekend" wat fout kan gaan; alleen de zin eromheen wordt gebouwd,
   uit onderwerpen, tijden en aanvullingen die bij elk werkwoord passen.

     DICTEE_MAKER.werkwoord('kgt')  { zin, woord, regel, sleutel }
     DICTEE_MAKER.woord('kgt')      { w, zin, uit, sleutel }  meervoud of verkleinwoord
     DICTEE_MAKER.leesteken('kgt')  { zin, uit, sleutel }

   Nagekeken met de Woordenlijst (het Groene Boekje): gamede, gegamed,
   likete, geliket, racete, geracet, savede, gesaved, geüpdatet, geappt. */
window.DICTEE_MAKER = (function(){
  'use strict';
  function kies(a){ return a[Math.floor(Math.random() * a.length)]; }
  function hoofd(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
  var NIV = { bb:1, kgt:2, hv:3 };
  function niv(n){ return NIV[n] || 2; }

  /* ---------- werkwoorden ----------
     inf | ik | hij | verleden tijd | verleden tijd meervoud | voltooid deelwoord | heb of ben | niveau | aanvullingen (met ;)
     Een aanvulling past in elke vorm: "Ik fiets naar school", "Morgen fiets jij naar school", "Fiets jij naar school?",
     "Gisteren fietste ik naar school" en "Ik ben naar school gefietst". Geen tijdwoorden in de aanvulling: die komen uit de zin. */
  var WW = [
    'fietsen|fiets|fietst|fietste|fietsten|gefietst|ben|1|naar school;naar het strand;naar de stad',
    'werken|werk|werkt|werkte|werkten|gewerkt|heb|1|in de tuin;bij de supermarkt;aan een werkstuk',
    'spelen|speel|speelt|speelde|speelden|gespeeld|heb|1|buiten;een potje voetbal;op het plein',
    'wachten|wacht|wacht|wachtte|wachtten|gewacht|heb|1|op de bus;bij het station;op de trein',
    'praten|praat|praat|praatte|praatten|gepraat|heb|1|met de buurvrouw;over de vakantie;met de trainer',
    'worden|word|wordt|werd|werden|geworden|ben|1|erg moe;boos;heel verdrietig',
    'vinden|vind|vindt|vond|vonden|gevonden|heb|1|een munt op straat;de sleutel onder de bank;het antwoord',
    'rijden|rijd|rijdt|reed|reden|gereden|ben|1|naar Utrecht;naar huis;naar het zwembad',
    'leggen|leg|legt|legde|legden|gelegd|heb|1|het boek op de plank;de sleutels in de la',
    'zeggen|zeg|zegt|zei|zeiden|gezegd|heb|1|niets;de waarheid;sorry tegen de juf',
    'vragen|vraag|vraagt|vroeg|vroegen|gevraagd|heb|1|de weg;om hulp;naar de tijd',
    'maken|maak|maakt|maakte|maakten|gemaakt|heb|1|een tekening;pannenkoeken;een werkstuk over Rome',
    'bellen|bel|belt|belde|belden|gebeld|heb|1|naar oma;de dokter',
    'koken|kook|kookt|kookte|kookten|gekookt|heb|1|soep;een lekkere maaltijd;macaroni',
    'wonen|woon|woont|woonde|woonden|gewoond|heb|1|in Amsterdam;bij de zee;in een klein huis',
    'leren|leer|leert|leerde|leerden|geleerd|heb|1|voor de toets;Frans;de woordjes',
    'dansen|dans|danst|danste|dansten|gedanst|heb|1|op het feest;in de woonkamer',
    'poetsen|poets|poetst|poetste|poetsten|gepoetst|heb|1|de ramen;de schoenen',
    'halen|haal|haalt|haalde|haalden|gehaald|heb|1|brood bij de bakker;een voldoende',
    'hopen|hoop|hoopt|hoopte|hoopten|gehoopt|heb|1|op mooi weer;op een goed cijfer',
    'missen|mis|mist|miste|misten|gemist|heb|1|de bus;de trein;een penalty',
    'zoeken|zoek|zoekt|zocht|zochten|gezocht|heb|1|de sleutels;een nieuwe fiets',
    'denken|denk|denkt|dacht|dachten|gedacht|heb|1|aan de vakantie;aan de toets',
    'kopen|koop|koopt|kocht|kochten|gekocht|heb|1|een ijsje;nieuwe schoenen;brood',
    'schrijven|schrijf|schrijft|schreef|schreven|geschreven|heb|1|een brief aan oma;een verhaal;een gedicht',
    'lezen|lees|leest|las|lazen|gelezen|heb|1|een spannend boek;de krant;een strip',
    'eten|eet|eet|at|aten|gegeten|heb|1|een appel;patat;pannenkoeken',
    'zwemmen|zwem|zwemt|zwom|zwommen|gezwommen|heb|1|in de zee;in het meer',
    'lopen|loop|loopt|liep|liepen|gelopen|ben|1|naar de winkel;naar huis',
    'gaan|ga|gaat|ging|gingen|gegaan|ben|1|naar de bioscoop;naar de markt',
    'komen|kom|komt|kwam|kwamen|gekomen|ben|1|te laat;naar het feest',
    'luisteren|luister|luistert|luisterde|luisterden|geluisterd|heb|1|naar muziek;naar de juf',
    'hebben|heb|heeft|had|hadden|gehad|heb|1|een hond;veel huiswerk;zin in een ijsje',
    'zetten|zet|zet|zette|zetten|gezet|heb|2|thee;de tassen in de gang',
    'antwoorden|antwoord|antwoordt|antwoordde|antwoordden|geantwoord|heb|2|op de vraag;heel snel',
    'houden|houd|houdt|hield|hielden|gehouden|heb|2|een spreekbeurt over haaien;een klein feestje',
    'landen|land|landt|landde|landden|geland|ben|2|op Schiphol;veilig in Spanje',
    'lachen|lach|lacht|lachte|lachten|gelachen|heb|2|om de grap;heel hard',
    'gebruiken|gebruik|gebruikt|gebruikte|gebruikten|gebruikt|heb|2|een woordenboek;de computer',
    'verhuizen|verhuis|verhuist|verhuisde|verhuisden|verhuisd|ben|2|naar Groningen;naar een groter huis',
    'geloven|geloof|gelooft|geloofde|geloofden|geloofd|heb|2|dat verhaal;niets van die smoes',
    'reizen|reis|reist|reisde|reisden|gereisd|heb|2|door Frankrijk;met de trein',
    'kloppen|klop|klopt|klopte|klopten|geklopt|heb|2|op de deur;op het raam',
    'stoppen|stop|stopt|stopte|stopten|gestopt|ben|2|met voetbal;met snoepen',
    'zitten|zit|zit|zat|zaten|gezeten|heb|2|op de bank;in de trein',
    'staan|sta|staat|stond|stonden|gestaan|heb|2|bij de deur;in de rij',
    'vergeten|vergeet|vergeet|vergat|vergaten|vergeten|heb|2|de sleutels;het huiswerk',
    'ontmoeten|ontmoet|ontmoet|ontmoette|ontmoetten|ontmoet|heb|2|een oude vriend;de nieuwe buren',
    'bestellen|bestel|bestelt|bestelde|bestelden|besteld|heb|2|een pizza;nieuwe schoenen',
    'betalen|betaal|betaalt|betaalde|betaalden|betaald|heb|2|de rekening;met een pinpas',
    'herhalen|herhaal|herhaalt|herhaalde|herhaalden|herhaald|heb|2|de woordjes;de vraag',
    'vertellen|vertel|vertelt|vertelde|vertelden|verteld|heb|2|een grappig verhaal;de waarheid',
    'verzamelen|verzamel|verzamelt|verzamelde|verzamelden|verzameld|heb|2|postzegels;oude munten',
    'trainen|train|traint|trainde|trainden|getraind|heb|2|voor de marathon;op het veld',
    'beloven|beloof|belooft|beloofde|beloofden|beloofd|heb|3|beterschap;het aan de juf',
    'leven|leef|leeft|leefde|leefden|geleefd|heb|3|gezond;heel zuinig',
    'verven|verf|verft|verfde|verfden|geverfd|heb|3|de schutting;de muur blauw',
    'verbranden|verbrand|verbrandt|verbrandde|verbrandden|verbrand|ben|3|in de zon',
    'wedden|wed|wedt|wedde|wedden|gewed|heb|3|om een euro;om een zak snoep',
    'redden|red|redt|redde|redden|gered|heb|3|een kat uit de sloot;de situatie',
    'raden|raad|raadt|raadde|raadden|geraden|heb|3|het antwoord;het goede woord',
    'wennen|wen|went|wende|wenden|gewend|ben|3|aan de nieuwe school;aan het koude water',
    'verwachten|verwacht|verwacht|verwachtte|verwachtten|verwacht|heb|3|een pakketje;veel van de wedstrijd',
    'beantwoorden|beantwoord|beantwoordt|beantwoordde|beantwoordden|beantwoord|heb|3|alle vragen;de brief',
    'fotograferen|fotografeer|fotografeert|fotografeerde|fotografeerden|gefotografeerd|heb|3|vogels;de zonsondergang',
    /* Engelse werkwoorden: de laatste klank van de stam telt (na de |), niet de letter */
    'appen|app|appt|appte|appten|geappt|heb|3|met een vriendin;naar de groepsapp|p',
    'gamen|game|gamet|gamede|gameden|gegamed|heb|3|met mijn neef;op de computer|m',
    'chatten|chat|chat|chatte|chatten|gechat|heb|3|met de klas;met een vriend|t',
    'mailen|mail|mailt|mailde|mailden|gemaild|heb|3|de docent;een foto naar oma|l',
    'skaten|skate|skatet|skatete|skateten|geskatet|heb|3|in het park;op het plein|t',
    'printen|print|print|printte|printten|geprint|heb|3|het werkstuk;de foto’s|t',
    'downloaden|download|downloadt|downloadde|downloadden|gedownload|heb|3|een nieuwe app;de film|d',
    'crashen|crash|crasht|crashte|crashten|gecrasht|ben|3|met de skelter;op de ijsbaan|sj',
    'liken|like|liket|likete|liketen|geliket|heb|3|de foto;elk filmpje|k',
    'racen|race|racet|racete|raceten|geracet|heb|3|door de straat;over de baan|s',
    'saven|save|savet|savede|saveden|gesaved|heb|3|het spel;de tekst|v',
    'updaten|update|updatet|updatete|updateten|geüpdatet|heb|3|de app;de computer|t'
  ].map(function(r){
    var p = r.split('|');
    return { inf:p[0], ik:p[1], hij:p[2], vt:p[3], vtm:p[4], vd:p[5], hulp:p[6], n:+p[7], aan:p[8].split(';'), klank:p[9] || '', jij:p[0] === 'hebben' ? 'hebt' : '' };
  });
  /* de onderwerpen: p is 1 (ik), 2 (jij), 3 (hij of zij) of 'mv' */
  var OND = [
    { w:'ik', p:1 }, { w:'jij', p:2 }, { w:'hij', p:3 }, { w:'zij', p:3 },
    { w:'Noor', p:3 }, { w:'Daan', p:3 }, { w:'Emma', p:3 }, { w:'Bram', p:3 }, { w:'Lotte', p:3 }, { w:'Ruben', p:3 },
    { w:'mijn moeder', p:3 }, { w:'de juf', p:3 }, { w:'mijn broer', p:3 }, { w:'onze buurman', p:3 }, { w:'de trainer', p:3 },
    { w:'wij', p:'mv' }, { w:'jullie', p:'mv' }, { w:'mijn ouders', p:'mv' }, { w:'de kinderen', p:'mv' }
  ];
  var NU = ['Vandaag', 'Morgen', 'Elke week', 'Na school', 'Vanavond', 'Op woensdag', 'Straks'];
  var TOEN = ['Gisteren', 'Vorige week', 'Vanochtend', 'Vorig jaar', 'Afgelopen zaterdag', 'Gisteravond'];
  /* iets wat lang duurt (wonen, een hond hebben) past niet bij gisteren */
  var LANG = { wonen:1, leven:1, hebben:1, verzamelen:1, wennen:1, geloven:1 }, TOEN_LANG = ['Vorig jaar', 'Vroeger', 'In de zomer'];
  var KOF = /(t|k|f|s|ch|p|x|sh)$/;
  var HULP = { heb:{ 1:'heb', 2:'hebt', 3:'heeft', mv:'hebben', inv:'heb' }, ben:{ 1:'ben', 2:'bent', 3:'is', mv:'zijn', inv:'ben' } };
  function kofTekst(letter, erin){ return 'de ' + letter + (erin ? ' zit' : ' zit niet') + ' in ’t kofschip'; }
  /* de letter (of klank) die bepaalt of het -te of -de wordt */
  function kofLetter(v){
    if (v.klank) return v.klank;
    if (/ven$/.test(v.inf) && /f$/.test(v.ik)) return 'v';
    if (/zen$/.test(v.inf) && /s$/.test(v.ik)) return 'z';
    var m = /(ch|[a-z])$/.exec(v.ik); return m ? m[1] : '';
  }
  function inKof(l){ return /^(t|k|f|s|ch|p|x|sj)$/.test(l); }
  /* regelmatig in de verleden tijd: stam + te of de */
  function vtSoort(v){ return v.vt === v.ik + 'te' ? 'te' : v.vt === v.ik + 'de' ? 'de' : ''; }
  function ondTekst(o){ return o.w === 'ik' || o.w === 'jij' || o.w === 'hij' || o.w === 'zij' || o.w === 'wij' || o.w === 'jullie' ? o.w : hoofd(o.w); }
  function uitlegNu(v, o, inv){
    if (o.p === 'mv') return hoofd(o.w) + ' is meervoud: het hele werkwoord, ' + v.inf + '.';
    if (o.p === 1) return 'Bij ik alleen de stam: ik ' + v.ik + '.' + (/d$/.test(v.ik) ? ' De d hoort bij de stam (' + v.inf + '), ook al hoor je een t.' : '');
    if (o.p === 2 && inv) return 'Staat jij achter het werkwoord, dan krijgt het geen t: ' + v.ik + ' jij. Staat jij ervoor, dan wel: jij ' + (v.jij || v.hij) + '.';
    var wie = o.p === 2 ? 'Jij staat vóór het werkwoord' : (o.w === 'hij' || o.w === 'zij') ? 'Het onderwerp is ' + o.w : ondTekst(o) + ' is één persoon, een hij of zij';
    if (v.inf === 'hebben') return wie + '. Hebben is onregelmatig: ' + (o.p === 2 ? 'jij hebt' : 'hij heeft') + '.';
    if (v.hij === v.ik) return wie + ': stam + t. De stam ' + v.ik + ' eindigt al op een t; daar komt geen tweede t bij.';
    return wie + ': stam + t. De stam is ' + v.ik + ' (ik ' + v.ik + '), dus ' + (o.p === 2 ? 'jij ' : '') + v.hij + '.';
  }
  function uitlegToen(v, mv){
    var s = vtSoort(v), vorm = mv ? v.vtm : v.vt;
    if (!s) return vorm + ' is de verleden tijd van ' + v.inf + '. Dat werkwoord is onregelmatig: ik ' + v.ik + ', ik ' + v.vt + ', ik heb of ben ' + v.vd + '.';
    var l = kofLetter(v), uit = 'Verleden tijd: stam ' + v.ik + ' + ' + s + (mv ? 'n' : '') + ', want ' + kofTekst(l, inKof(l)) + '.';
    if (v.klank) uit += ' Bij een Engels werkwoord telt de laatste klank die je hoort, niet de letter.';
    else if (l === 'v' || l === 'z') uit += ' Kijk naar ' + v.inf + ': daarin hoor je een ' + l + ', geen ' + (l === 'v' ? 'f' : 's') + '.';
    if (/[td]$/.test(v.ik) && !v.klank) uit += ' De stam eindigt al op een ' + v.ik.slice(-1) + ', dus je schrijft er twee: ' + vorm + '.';
    return uit;
  }
  function uitlegVd(v){
    var los = v.vd.replace(/ü/g, 'u'), ge = /^ge/.test(los) && !/^(ge|be|her|ont|ver)/.test(v.inf), kern = ge ? los.slice(2) : los, stam = v.ik.replace(/ü/g, 'u');
    var uit, voor = ge ? 'ge + ' : '';
    if (/en$/.test(v.vd) && kern !== stam) uit = v.vd + ' is het voltooid deelwoord van ' + v.inf + ': een sterk werkwoord, dus het eindigt op -en.';
    else if (/[td]$/.test(stam) && kern === stam) uit = 'Voltooid deelwoord: ' + voor + 'stam. De stam ' + v.ik + ' eindigt al op een ' + stam.slice(-1) + '; daar komt niets meer bij: ' + v.vd + '.';
    else if (kern === stam + 't' || kern === stam + 'd'){
      var l = kofLetter(v);
      uit = 'Voltooid deelwoord: ' + voor + 'stam + ' + kern.slice(-1) + ', want ' + kofTekst(l, inKof(l)) + '.' + (vtSoort(v) ? ' Denk aan de verleden tijd: ' + v.vt + '.' : '');
      if (v.klank) uit += ' Bij een Engels werkwoord telt de laatste klank die je hoort.';
      else if (l === 'v' || l === 'z') uit += ' Kijk naar ' + v.inf + ': daarin hoor je een ' + l + '.';
    }
    else uit = v.vd + ' is het voltooid deelwoord van ' + v.inf + '. Dat werkwoord is onregelmatig: ik ' + v.vt + ', ik heb of ben ' + v.vd + '.';
    if (!ge && /^(ge|be|her|ont|ver)/.test(v.inf)) uit += ' Er komt geen ge- voor, want ' + v.inf + ' begint al met ' + /^(ge|be|her|ont|ver)/.exec(v.inf)[1] + '-.';
    if (/ü/.test(v.vd)) uit += ' Het trema op de ü zorgt dat je ge-up leest en niet geu.';
    return uit;
  }
  function nuVorm(v, o, inv){
    if (o.p === 'mv') return v.inf;
    if (o.p === 1 || (o.p === 2 && inv)) return v.ik;
    if (o.p === 2) return v.jij || v.hij;
    return v.hij;
  }
  function hulpVorm(h, o, inv){ return o.p === 'mv' ? h.mv : (o.p === 2 && inv) ? h.inv : h[o.p]; }
  function werkwoord(niveau){
    var n = niv(niveau), lijst = WW.filter(function(v){ return v.n <= n; });
    if (n === 3 && Math.random() < .45) lijst = WW.filter(function(v){ return v.n === 3; });
    var v = kies(lijst), c = kies(v.aan), o;
    /* niet "De juf zegt sorry tegen de juf" */
    do { o = kies(OND); } while (c.indexOf(o.w.replace(/^(de|mijn|onze) /, '')) >= 0);
    var vormen = n === 1 ? ['nu', 'nuInv', 'toen', 'vd', 'vd', 'nu'] : ['nu', 'nuInv', 'vraag', 'toen', 'toenS', 'vd', 'vdInv'];
    var soort = kies(vormen), zin, woord, regel;
    var S = o.w;
    if (soort === 'nu'){ woord = nuVorm(v, o); zin = hoofd(S) + ' ' + woord + ' ' + c + '.'; regel = uitlegNu(v, o, false); }
    else if (soort === 'nuInv'){ woord = nuVorm(v, o, true); zin = kies(NU) + ' ' + woord + ' ' + S + ' ' + c + '.'; regel = uitlegNu(v, o, true); }
    else if (soort === 'vraag'){ woord = nuVorm(v, o, true); zin = hoofd(woord) + ' ' + S + ' ' + c + '?'; regel = uitlegNu(v, o, true); }
    else if (soort === 'toen'){ var mv = o.p === 'mv'; woord = mv ? v.vtm : v.vt; zin = kies(LANG[v.inf] ? TOEN_LANG : TOEN) + ' ' + woord + ' ' + S + ' ' + c + '.'; regel = uitlegToen(v, mv); }
    else if (soort === 'toenS'){ var mv2 = o.p === 'mv'; woord = mv2 ? v.vtm : v.vt; zin = hoofd(S) + ' ' + woord + ' ' + kies(LANG[v.inf] ? ['vroeger', 'vorig jaar'] : ['gisteren', 'vorige week', 'vanochtend']) + ' ' + c + '.'; regel = uitlegToen(v, mv2); }
    else if (soort === 'vdInv'){ woord = v.vd; zin = kies(LANG[v.inf] ? TOEN_LANG : TOEN) + ' ' + hulpVorm(HULP[v.hulp], o, true) + ' ' + S + ' ' + c + ' ' + woord + '.'; regel = uitlegVd(v); }
    else { woord = v.vd; zin = hoofd(S) + ' ' + hulpVorm(HULP[v.hulp], o) + ' ' + c + ' ' + woord + '.'; regel = uitlegVd(v); }
    return { zin: zin, woord: woord, regel: regel, sleutel: 'gw' + zin };
  }

  /* ---------- meervouden en verkleinwoorden ----------
     enkelvoud | meervoud | verkleinwoord (- als er geen gewoon verkleinwoord is) | regel meervoud | regel verkleinwoord | de of het | niveau */
  var ZN = [
    'boom|bomen|boompje|open|pje|de|1', 'raam|ramen|raampje|open|pje|het|1', 'bal|ballen|balletje|dubbel|etje|de|1',
    'kat|katten|katje|dubbel|je|de|1', 'boek|boeken|boekje|en|je|het|1', 'hond|honden|hondje|en|je|de|1',
    'huis|huizen|huisje|sz|je|het|1', 'brief|brieven|briefje|fv|je|de|1', 'tafel|tafels|tafeltje|s|tje|de|1',
    'stoel|stoelen|stoeltje|en|tje|de|1', 'schoen|schoenen|schoentje|en|tje|de|1', 'deur|deuren|deurtje|en|tje|de|1',
    'auto|auto’s|autootje|apo|klinker|de|1', 'foto|foto’s|fotootje|apo|klinker|de|1', 'kind|kinderen|kindje|eren|je|het|1',
    'ei|eieren|eitje|eren|tje|het|1', 'bed|bedden|bedje|dubbel|je|het|1', 'pen|pennen|pennetje|dubbel|etje|de|1',
    'zak|zakken|zakje|dubbel|je|de|1', 'muur|muren|muurtje|open|tje|de|1', 'vis|vissen|visje|dubbel|je|de|1',
    'muis|muizen|muisje|sz|je|de|1', 'duif|duiven|duifje|fv|je|de|1', 'fiets|fietsen|fietsje|en|je|de|1',
    'appel|appels|appeltje|s|tje|de|1', 'oma|oma’s|omaatje|apo|klinker|de|1', 'trein|treinen|treintje|en|tje|de|1',
    'kam|kammen|kammetje|dubbel|etje|de|1', 'vogel|vogels|vogeltje|s|tje|de|1', 'boot|boten|bootje|open|je|de|1',
    'stad|steden|stadje|anders|je|de|2', 'schip|schepen|scheepje|anders|anders|het|2', 'dag|dagen|dagje|anders|je|de|2',
    'glas|glazen|glaasje|anders|anders|het|2', 'blad|bladeren|blaadje|eren|anders|het|2', 'kalf|kalveren|kalfje|eren|je|het|2',
    'koning|koningen|koninkje|en|kje|de|2', 'ketting|kettingen|kettinkje|en|kje|de|2', 'ring|ringen|ringetje|en|etje|de|2',
    'ster|sterren|sterretje|dubbel|etje|de|2', 'pan|pannen|pannetje|dubbel|etje|de|2', 'menu|menu’s|menuutje|apo|klinker|het|2',
    'paraplu|paraplu’s|parapluutje|apo|klinker|de|2', 'idee|ideeën|ideetje|trema|tje|het|2', 'knie|knieën|knietje|trema|tje|de|2',
    'zee|zeeën|-|trema||de|2', 'roos|rozen|roosje|sz|je|de|2', 'golf|golven|golfje|fv|je|de|2', 'slot|sloten|slotje|open|je|het|2',
    'bezem|bezems|bezempje|s|pje|de|2', 'lepel|lepels|lepeltje|s|tje|de|2', 'tuin|tuinen|tuintje|en|tje|de|2',
    'woning|woningen|woninkje|en|kje|de|2', 'weg|wegen|weggetje|anders|etje|de|2', 'regel|regels|regeltje|s|tje|de|2',
    'baby|baby’s|baby’tje|apo|y|de|3', 'kopie|kopieën|kopietje|trema|tje|de|3', 'bacterie|bacteriën|-|trema2||de|3',
    'museum|musea|museumpje|la|pje|het|3', 'politicus|politici|-|la||de|3', 'radio|radio’s|radiootje|apo|klinker|de|3',
    'studio|studio’s|studiootje|apo|klinker|de|3', 'mama|mama’s|mamaatje|apo|klinker|de|3', 'kanaal|kanalen|kanaaltje|open|tje|het|3',
    'euro|euro’s|-|apo||de|3', 'hobby|hobby’s|-|apo||de|3', 'ski|ski’s|-|apo||de|3', 'porie|poriën|-|trema2||de|3',
    'drug|drugs|-|s||de|3', 'aquarium|aquaria|aquariumpje|la|pje|het|3',
    'kast|kasten|kastje|en|je|de|1', 'lamp|lampen|lampje|en|je|de|1', 'jas|jassen|jasje|dubbel|je|de|1', 'pop|poppen|popje|dubbel|je|de|1',
    'bus|bussen|busje|dubbel|je|de|1', 'hek|hekken|hekje|dubbel|je|het|1', 'pet|petten|petje|dubbel|je|de|1', 'kop|koppen|kopje|dubbel|je|de|1',
    'pak|pakken|pakje|dubbel|je|het|1', 'neus|neuzen|neusje|sz|je|de|1', 'broek|broeken|broekje|en|je|de|1', 'plant|planten|plantje|en|je|de|1',
    'hoed|hoeden|hoedje|en|je|de|1', 'paard|paarden|paardje|en|je|het|1', 'been|benen|beentje|open|tje|het|1', 'haan|hanen|haantje|open|tje|de|1',
    'straat|straten|straatje|open|je|de|1', 'jaar|jaren|jaartje|open|tje|het|1', 'uur|uren|uurtje|open|tje|het|1', 'meer|meren|meertje|open|tje|het|1',
    'poes|poezen|poesje|sz|je|de|1', 'kaas|kazen|kaasje|sz|je|de|1', 'koe|koeien|koetje|anders|tje|de|1',
    'hart|harten|hartje|en|je|het|2', 'bord|borden|bordje|en|je|het|2', 'kuil|kuilen|kuiltje|en|tje|de|2', 'wiel|wielen|wieltje|en|tje|het|2',
    'stem|stemmen|stemmetje|dubbel|etje|de|2', 'bom|bommen|bommetje|dubbel|etje|de|2', 'kar|karren|karretje|dubbel|etje|de|2', 'tak|takken|takje|dubbel|je|de|2',
    'wolf|wolven|wolfje|fv|je|de|2', 'kaart|kaarten|kaartje|en|je|de|2', 'doos|dozen|doosje|sz|je|de|2', 'kerk|kerken|kerkje|en|je|de|2',
    'reis|reizen|reisje|sz|je|de|2', 'fles|flessen|flesje|dubbel|je|de|2', 'mes|messen|mesje|dubbel|je|het|2', 'bril|brillen|brilletje|dubbel|etje|de|2',
    'agenda|agenda’s|agendaatje|apo|klinker|de|3', 'pyjama|pyjama’s|-|apo||de|3', 'collega|collega’s|-|apo||de|3', 'party|party’s|-|apo||de|3',
    'theorie|theorieën|-|trema||de|3', 'industrie|industrieën|-|trema||de|3', 'olie|oliën|-|trema2||de|3', 'bioscoop|bioscopen|bioscoopje|open|je|de|3',
    'musicus|musici|-|la||de|3'
  ].map(function(r){ var p = r.split('|'); return { ev:p[0], mv:p[1], kl:p[2] === '-' ? '' : p[2], rm:p[3], rk:p[4], de:p[5] === 'de', n:+p[6] }; });
  function uitlegMv(z){
    var r = z.rm, ev = z.ev, mv = z.mv;
    if (r === 'open') return 'Je zegt ' + mv.replace(/([aeiou])(?=[^aeiou][aeiou])/g, '$1-') + ': de lettergreep eindigt op de klinker, dus die schrijf je één keer. In het enkelvoud ' + ev + ' staan er twee.';
    if (r === 'dubbel') return 'Een korte klank: de medeklinker komt er twee keer in, anders zou je een lange klank lezen. ' + ev + ', ' + mv + '.';
    if (r === 'sz') return 'In het meervoud hoor je een z, dus je schrijft een z: ' + mv + '. In het enkelvoud blijft het een s: ' + ev + '.';
    if (r === 'fv') return 'In het meervoud hoor je een v, dus je schrijft een v: ' + mv + '. In het enkelvoud blijft het een f: ' + ev + '.';
    if (r === 'apo') return ev + ' eindigt op een ' + (/y$/.test(ev) ? 'y na een medeklinker' : 'lange klinker (a, i, o, u of y)') + ': het meervoud krijgt een apostrof + s, anders lees je een korte klank.';
    if (r === 'trema') return ev + ' eindigt op een e of ie met de klemtoon erop: je schrijft -ën met een trema, zodat je de e los leest: ' + mv + '.';
    if (r === 'trema2') return 'Het woord eindigt op -ie zonder klemtoon: er komt -en achter, de laatste e valt weg en krijgt een trema: ' + mv + '.';
    if (r === 'eren') return 'Een paar het-woorden krijgen -eren in het meervoud: ' + mv + (ev === 'kalf' ? ', en de f wordt een v' : '') + '.';
    if (r === 'la') return 'Een woord uit het Latijn: het meervoud is ' + mv + ' (van ' + ev + ').';
    if (r === 's') return 'Een woord op -el, -em, -er of -en zonder klemtoon krijgt meestal -s: ' + mv + '.';
    if (r === 'anders') return 'Een uitzondering: het meervoud van ' + ev + ' is ' + mv + '. Die moet je gewoon onthouden.';
    return 'Gewoon -en achter het woord: ' + mv + '.';
  }
  function uitlegKl(z){
    var r = z.rk, ev = z.ev, kl = z.kl;
    if (r === 'je') return 'Achter de meeste medeklinkers komt -je: ' + kl + '.';
    if (r === 'tje') return 'Na een lange klank of tweeklank op een klinker, l, n, r of w komt -tje: ' + kl + '.';
    if (r === 'pje') return 'Na een lange klank op een m komt -pje: ' + kl + '.';
    if (r === 'etje') return 'Na een korte klank op een l, m, n, ng of r komt -etje; de medeklinker komt er twee keer in (behalve ng): ' + kl + '.';
    if (r === 'kje') return 'Na -ing zonder klemtoon wordt het -inkje: ' + kl + '.';
    if (r === 'klinker') return ev + ' eindigt op een lange klinker: die schrijf je dubbel, en dan -tje: ' + kl + '.';
    if (r === 'y') return 'Na een y komt een apostrof, en dan -tje: ' + kl + '.';
    return 'Een uitzondering: het verkleinwoord van ' + ev + ' is ' + kl + '.';
  }
  function woord(niveau){
    var n = niv(niveau), lijst = ZN.filter(function(z){ return z.n === n || (z.n < n && Math.random() < .3); });
    if (!lijst.length) lijst = ZN.filter(function(z){ return z.n <= n; });
    var z = kies(lijst);
    if (z.kl && Math.random() < .5){
      return { w: z.kl, zin: 'Een ' + (z.de ? 'kleine ' : 'klein ') + z.ev + ' is een ' + z.kl + '.', uit: 'verkleinwoord van ' + z.ev + '. ' + uitlegKl(z).replace(/\.$/, ''), sleutel: 'gk' + z.kl };
    }
    return { w: z.mv, zin: 'Eén ' + z.ev + ', twee ' + z.mv + '.', uit: 'meervoud van ' + z.ev + '. ' + uitlegMv(z).replace(/\.$/, ''), sleutel: 'gm' + z.mv };
  }

  /* ---------- hoofdletters en leestekens ---------- */
  var NAMEN = ['Noor', 'Daan', 'Sem', 'Emma', 'Tim', 'Lotte', 'Bram', 'Anna', 'Tom', 'Eva', 'Julia', 'Ruben', 'Femke', 'Lars', 'Iris', 'Jasper', 'Floor', 'Joris'];
  var PLAATS = ['Amsterdam', 'Utrecht', 'Groningen', 'Zwolle', 'Arnhem', 'Leiden', 'Delft', 'Haarlem', 'Rotterdam', 'Maastricht', 'Nijmegen', 'Breda'];
  var LAND = [['Frankrijk', 'Franse', 'kaas'], ['Spanje', 'Spaanse', 'tortilla'], ['Duitsland', 'Duitse', 'worst'], ['België', 'Belgische', 'friet'],
              ['Italië', 'Italiaanse', 'pizza'], ['Griekenland', 'Griekse', 'yoghurt'], ['Engeland', 'Engelse', 'thee'], ['Zweden', 'Zweedse', 'gehaktballetjes']];
  var DAGEN = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
  var MAAND = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  var SPUL = ['een appel', 'een boek', 'een fles water', 'een handdoek', 'een pen', 'een jas', 'een paraplu', 'een banaan', 'een schrift', 'een zonnebril'];
  var FAM = [['zus', 'haar'], ['broer', 'zijn'], ['buurman', 'de'], ['nicht', 'haar'], ['neef', 'zijn'], ['trainer', 'de']];
  var BIJZIN = [['het regende', 'bleef ', ' thuis'], ['de bus te laat was', 'kwam ', ' te laat op school'], ['de winkel dicht was', 'fietste ', ' weer naar huis'],
                ['het zo warm was', 'ging ', ' zwemmen'], ['de film spannend was', 'keek ', ' tot het eind']];
  function twee(a){ var x = kies(a), y; do { y = kies(a); } while (y === x); return [x, y]; }
  function leesteken(niveau){
    var n = niv(niveau), soorten = n === 1 ? ['namen', 'dag', 'lijst', 'vraag', 'vraag2'] : n === 2 ? ['namen', 'dag', 'lijst', 'vraag', 'bijstelling', 'bijzin', 'land'] : ['lijst', 'vraag', 'bijstelling', 'bijzin', 'land', 'feest', 'maandLand'];
    var s = kies(soorten), nm = twee(NAMEN), zin, uit;
    if (s === 'namen'){ var p = kies(PLAATS); zin = nm[0] + ' en ' + nm[1] + ' gaan op ' + kies(DAGEN) + ' naar ' + p + '.'; uit = 'Namen en plaatsnamen krijgen een hoofdletter: ' + nm[0] + ', ' + nm[1] + ', ' + p + '. Dagen van de week niet.'; }
    else if (s === 'dag'){ var m = kies(MAAND), p2 = kies(PLAATS); zin = 'In ' + m + ' fietst ' + nm[0] + ' elke ' + kies(DAGEN) + ' naar ' + p2 + '.'; uit = 'Maanden en dagen schrijf je met een kleine letter; de naam ' + nm[0] + ' en de plaatsnaam ' + p2 + ' krijgen een hoofdletter.'; }
    else if (s === 'lijst'){ var sp = SPUL.slice().sort(function(){ return Math.random() - .5; }).slice(0, n === 3 ? 4 : 3); zin = nm[0] + ' neemt ' + sp.slice(0, -1).join(', ') + ' en ' + sp[sp.length - 1] + ' mee.'; uit = 'In een opsomming komen komma’s tussen de dingen, maar niet voor en.'; }
    else if (s === 'vraag'){ var p3 = kies(PLAATS); zin = 'Gaat ' + nm[0] + ' op ' + kies(DAGEN) + ' met ' + nm[1] + ' naar ' + p3 + '?'; uit = 'Een vraag eindigt op een vraagteken. Namen en plaatsnamen met een hoofdletter, de dag niet.'; }
    else if (s === 'vraag2'){ zin = 'Waarom komt ' + nm[0] + ' niet naar het feest van ' + nm[1] + '?'; uit = 'Een vraag met waarom: een vraagteken aan het eind. Namen krijgen een hoofdletter.'; }
    else if (s === 'bijstelling'){ var f = kies(FAM), p4 = kies(PLAATS); zin = nm[0] + ', de ' + f[0] + ' van ' + nm[1] + ', woont in ' + p4 + '.'; uit = 'De uitleg over ' + nm[0] + ' (de ' + f[0] + ' van ' + nm[1] + ') staat tussen twee komma’s.'; }
    else if (s === 'bijzin'){ var b = kies(BIJZIN); zin = 'Omdat ' + b[0] + ', ' + b[1] + nm[0] + b[2] + '.'; uit = 'Na een bijzin aan het begin (omdat ' + b[0] + ') komt een komma, tussen de twee werkwoorden.'; }
    else if (s === 'land'){ var l = kies(LAND); zin = nm[0] + ' eet in ' + l[0] + ' graag ' + l[1] + ' ' + l[2] + '.'; uit = 'Een land krijgt een hoofdletter, en een woord dat van een land komt ook: ' + l[1] + ' ' + l[2] + '.' + (/ë/.test(l[0]) ? ' ' + l[0] + ' met een trema.' : ''); }
    else if (s === 'feest'){ var fe = kies([['Met Pasen', 'Pasen is een feestdag: hoofdletter.'], ['Op Koningsdag', 'Koningsdag is een feestdag: hoofdletter.'], ['In de kerstvakantie', 'kerstvakantie is een gewoon woord: kleine letter, ook al is Kerstmis een feestdag.'], ['Met oud en nieuw', 'oud en nieuw schrijf je met kleine letters.']]), p5 = kies(PLAATS);
      zin = fe[0] + ' gaat ' + nm[0] + ' naar ' + p5 + '.'; uit = fe[1] + ' De naam en de plaatsnaam met een hoofdletter.'; }
    else { var l2 = kies(LAND), m2 = kies(MAAND); zin = 'Gaan ' + nm[0] + ' en ' + nm[1] + ' in ' + m2 + ' naar ' + l2[0] + '?'; uit = 'Een land krijgt een hoofdletter, een maand niet. Een vraag eindigt op een vraagteken.' + (/ë/.test(l2[0]) ? ' ' + l2[0] + ' met een trema.' : ''); }
    return { zin: zin, uit: uit, sleutel: 'gl' + zin };
  }
  return { werkwoord: werkwoord, woord: woord, leesteken: leesteken, WW: WW, ZN: ZN };
})();
