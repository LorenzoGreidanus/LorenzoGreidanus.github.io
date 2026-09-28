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
     inf | ik | hij | verleden tijd | verleden tijd meervoud | voltooid deelwoord | heb of ben | niveau | aanvullingen (met ;) | klank
     Elke aanvulling heeft na de # een paar letters die zeggen in welke zinnen hij logisch is:
       r  iets wat je vaker doet: past bij vaak, na school, vandaag
       a  een gewoonte (hard lachen, op mooi weer hopen): vaak, meestal, soms; niet morgen
       e  iets wat één keer gebeurt: vandaag, morgen, volgende week; niet elke week
       s  iets wat een tijd zo is (wonen, verzamelen): nu, tegenwoordig, vroeger; niet gisteren
       k  iets wat je zo meteen even doet (op de deur kloppen): straks, zo meteen; niet volgende week
       c  in de tegenwoordige tijd niet met een tijd vooraan maar met natuurlijk of toch ("Toch vergeet hij de sleutels")
       n  in de tegenwoordige tijd nooit met iets vooraan
       x  geen vraag van maken ("Vind jij een munt op straat?" is geen logische vraag)
       p  geen voltooide tijd ("Ik heb zin in een ijsje gehad")
       *  alleen bij een kind: een voldoende halen, de juf mailen, aan de nieuwe school wennen
       v  alleen bij een volwassene: naar Utrecht rijden
       f  alleen in de familie: naar oma bellen doe je niet als trainer
       h  met hebben in plaats van zijn: ik heb op een pony gereden (maar ik ben naar Utrecht gereden)
     Het onderwerp komt nooit ook in de aanvulling voor: niet "De juf zegt sorry tegen de juf". */
  var WW = [
    'fietsen|fiets|fietst|fietste|fietsten|gefietst|ben|1|naar school#r*;naar het strand#e;naar de stad#r',
    'werken|werk|werkt|werkte|werkten|gewerkt|heb|1|in de tuin#r;bij de supermarkt#r;aan een werkstuk#r*',
    'spelen|speel|speelt|speelde|speelden|gespeeld|heb|1|buiten#r*;een potje voetbal#r;op het plein#r*',
    'wachten|wacht|wacht|wachtte|wachtten|gewacht|heb|1|op de bus#r;op de trein#r;bij het station#e',
    'praten|praat|praat|praatte|praatten|gepraat|heb|1|met de buurvrouw#r;over de vakantie#r;met de trainer#r',
    'worden|word|wordt|werd|werden|geworden|ben|1|erg moe#a;boos#ec;heel verdrietig#ec',
    'vinden|vind|vindt|vond|vonden|gevonden|heb|1|een munt op straat#enx;de sleutel onder de bank#ec;het antwoord#ec',
    'rijden|rijd|rijdt|reed|reden|gereden|ben|1|naar Utrecht#ev;op een pony#r*h;in de achtbaan#eh',
    'leggen|leg|legt|legde|legden|gelegd|heb|1|het boek op de plank#k;de sleutels in de la#r',
    'zeggen|zeg|zegt|zei|zeiden|gezegd|heb|1|niets#ec;de waarheid#ec;sorry tegen de juf#e*',
    'vragen|vraag|vraagt|vroeg|vroegen|gevraagd|heb|1|de weg#k;om hulp#e',
    'maken|maak|maakt|maakte|maakten|gemaakt|heb|1|een tekening#r;pannenkoeken#r;een werkstuk over Rome#e*',
    'bellen|bel|belt|belde|belden|gebeld|heb|1|naar oma#rf;de dokter#e',
    'koken|kook|kookt|kookte|kookten|gekookt|heb|1|soep#r;macaroni#r',
    'wonen|woon|woont|woonde|woonden|gewoond|heb|1|in Amsterdam#s;in een klein huis#s;bij de zee#s',
    'leren|leer|leert|leerde|leerden|geleerd|heb|1|voor de toets#r*;Frans#s*;de woordjes#r*',
    'dansen|dans|danst|danste|dansten|gedanst|heb|1|op het feest#e;in de woonkamer#r',
    'poetsen|poets|poetst|poetste|poetsten|gepoetst|heb|1|de ramen#r;de schoenen#r',
    'halen|haal|haalt|haalde|haalden|gehaald|heb|1|brood bij de bakker#r;een voldoende#ec*',
    'hopen|hoop|hoopt|hoopte|hoopten|gehoopt|heb|1|op mooi weer#a;op een goed cijfer#e*',
    'missen|mis|mist|miste|misten|gemist|heb|1|de bus#ec;de trein#ec;een penalty#ecx',
    'zoeken|zoek|zoekt|zocht|zochten|gezocht|heb|1|de sleutels#k;een nieuwe fiets#e',
    'denken|denk|denkt|dacht|dachten|gedacht|heb|1|aan de vakantie#r;aan de toets#c*',
    'kopen|koop|koopt|kocht|kochten|gekocht|heb|1|een ijsje#r;nieuwe schoenen#e;brood#r',
    'schrijven|schrijf|schrijft|schreef|schreven|geschreven|heb|1|een brief aan oma#ef;een verhaal#r;een gedicht#e',
    'lezen|lees|leest|las|lazen|gelezen|heb|1|een spannend boek#r;de krant#r;een strip#r',
    'eten|eet|eet|at|aten|gegeten|heb|1|een appel#r;patat#r;pannenkoeken#r',
    'zwemmen|zwem|zwemt|zwom|zwommen|gezwommen|heb|1|in de zee#r;in het meer#r',
    'lopen|loop|loopt|liep|liepen|gelopen|ben|1|naar de winkel#r;naar huis#r',
    'gaan|ga|gaat|ging|gingen|gegaan|ben|1|naar de bioscoop#r;naar de markt#r',
    'komen|kom|komt|kwam|kwamen|gekomen|ben|1|te laat#ec;naar het feest#e',
    'luisteren|luister|luistert|luisterde|luisterden|geluisterd|heb|1|naar muziek#a;naar de juf#a*',
    'hebben|heb|heeft|had|hadden|gehad|heb|1|een hond#s;veel huiswerk#r*;zin in een ijsje#cp',
    'zetten|zet|zet|zette|zetten|gezet|heb|2|thee#r;de tassen in de gang#k',
    'antwoorden|antwoord|antwoordt|antwoordde|antwoordden|geantwoord|heb|2|op de vraag#k;heel snel#a',
    'houden|houd|houdt|hield|hielden|gehouden|heb|2|een spreekbeurt over haaien#e*;een klein feestje#e',
    'landen|land|landt|landde|landden|geland|ben|2|op Schiphol#e;veilig in Spanje#e',
    'lachen|lach|lacht|lachte|lachten|gelachen|heb|2|om de grap#ec;heel hard#a',
    'gebruiken|gebruik|gebruikt|gebruikte|gebruikten|gebruikt|heb|2|een woordenboek#a;de computer#a',
    'verhuizen|verhuis|verhuist|verhuisde|verhuisden|verhuisd|ben|2|naar Groningen#e;naar een groter huis#e',
    'geloven|geloof|gelooft|geloofde|geloofden|geloofd|heb|2|dat verhaal#ec;niets van die smoes#ec',
    'reizen|reis|reist|reisde|reisden|gereisd|heb|2|door Frankrijk#e;met de trein#r',
    'kloppen|klop|klopt|klopte|klopten|geklopt|heb|2|op de deur#k;op het raam#k',
    'stoppen|stop|stopt|stopte|stopten|gestopt|ben|2|met voetbal#e;met snoepen#e',
    'zitten|zit|zit|zat|zaten|gezeten|heb|2|op de bank#r;in de trein#r',
    'staan|sta|staat|stond|stonden|gestaan|heb|2|bij de deur#k;in de rij#r',
    'vergeten|vergeet|vergeet|vergat|vergaten|vergeten|heb|2|de sleutels#ec;het huiswerk#ec*',
    'ontmoeten|ontmoet|ontmoet|ontmoette|ontmoetten|ontmoet|heb|2|een oude vriend#e;de nieuwe buren#e',
    'bestellen|bestel|bestelt|bestelde|bestelden|besteld|heb|2|een pizza#e;nieuwe schoenen#e',
    'betalen|betaal|betaalt|betaalde|betaalden|betaald|heb|2|de rekening#e;met een pinpas#a',
    'herhalen|herhaal|herhaalt|herhaalde|herhaalden|herhaald|heb|2|de woordjes#r*;de vraag#k',
    'vertellen|vertel|vertelt|vertelde|vertelden|verteld|heb|2|een grappig verhaal#e;de waarheid#ec',
    'verzamelen|verzamel|verzamelt|verzamelde|verzamelden|verzameld|heb|2|postzegels#s;oude munten#s',
    'trainen|train|traint|trainde|trainden|getraind|heb|2|voor de marathon#s;op het veld#r',
    'beloven|beloof|belooft|beloofde|beloofden|beloofd|heb|3|beterschap#ec;het aan de juf#ec*',
    'leven|leef|leeft|leefde|leefden|geleefd|heb|3|gezond#s;heel zuinig#s',
    'verven|verf|verft|verfde|verfden|geverfd|heb|3|de schutting#e;de muur blauw#e',
    'wedden|wed|wedt|wedde|wedden|gewed|heb|3|om een euro#en;om een zak snoep#en',
    'redden|red|redt|redde|redden|gered|heb|3|een kat uit de sloot#enx;de situatie#ec',
    'raden|raad|raadt|raadde|raadden|geraden|heb|3|het antwoord#ec;het goede woord#ec',
    'wennen|wen|went|wende|wenden|gewend|ben|3|aan de nieuwe school#s*;aan het koude water#ec',
    'verwachten|verwacht|verwacht|verwachtte|verwachtten|verwacht|heb|3|een pakketje#e;veel van de wedstrijd#ec',
    'beantwoorden|beantwoord|beantwoordt|beantwoordde|beantwoordden|beantwoord|heb|3|alle vragen#e;de brief#e',
    'fotograferen|fotografeer|fotografeert|fotografeerde|fotografeerden|gefotografeerd|heb|3|vogels#r;de zonsondergang#e',
    /* Engelse werkwoorden: de laatste klank van de stam telt (na de laatste |), niet de letter */
    'appen|app|appt|appte|appten|geappt|heb|3|met een vriendin#r;in de groepsapp#a|p',
    'gamen|game|gamet|gamede|gameden|gegamed|heb|3|met de buurjongen#r*;op de computer#r|m',
    'chatten|chat|chat|chatte|chatten|gechat|heb|3|met de klas#r*;met een vriend#r|t',
    'mailen|mail|mailt|mailde|mailden|gemaild|heb|3|de docent#e*;een foto naar oma#ef|l',
    'skaten|skate|skatet|skatete|skateten|geskatet|heb|3|in het park#r;op het plein#r|t',
    'printen|print|print|printte|printten|geprint|heb|3|het werkstuk#e*;de foto’s#e|t',
    'downloaden|download|downloadt|downloadde|downloadden|gedownload|heb|3|een nieuwe app#e;de film#e|d',
    'crashen|crash|crasht|crashte|crashten|gecrasht|ben|3|met de skelter#enx;op de ijsbaan#enx|sj',
    'liken|like|liket|likete|liketen|geliket|heb|3|de foto#k;veel filmpjes#a|k',
    'racen|race|racet|racete|raceten|geracet|heb|3|door de straat#r*;over de baan#r*|s',
    'saven|save|savet|savede|saveden|gesaved|heb|3|het spel#k*;de tekst#k|v',
    'updaten|update|updatet|updatete|updateten|geüpdatet|heb|3|de app#e;de computer#e|t'
  ].map(function(r){
    var p = r.split('|');
    return { inf:p[0], ik:p[1], hij:p[2], vt:p[3], vtm:p[4], vd:p[5], hulp:p[6], n:+p[7], klank:p[9] || '', jij:p[0] === 'hebben' ? 'hebt' : '',
      aan:p[8].split(';').map(function(a){ var q = a.split('#'); return { t:q[0], m:q[1] || 'r' }; }) };
  });
  /* de onderwerpen: p is 1 (ik), 2 (jij), 3 (hij of zij) of 'mv'. k: kan een kind zijn, v: kan een volwassene zijn,
     f: hoort bij de familie (dan klopt naar oma bellen). Hij en zij kunnen allebei. */
  var OND = [
    { w:'ik', p:1, k:1, f:1 }, { w:'jij', p:2, k:1, f:1 }, { w:'hij', p:3, k:1, v:1, f:1 }, { w:'zij', p:3, k:1, v:1, f:1 },
    { w:'Noor', p:3, k:1, f:1 }, { w:'Daan', p:3, k:1, f:1 }, { w:'Emma', p:3, k:1, f:1 }, { w:'Bram', p:3, k:1, f:1 }, { w:'Lotte', p:3, k:1, f:1 }, { w:'Ruben', p:3, k:1, f:1 },
    { w:'mijn moeder', p:3, v:1, f:1 }, { w:'de juf', p:3, v:1 }, { w:'mijn broer', p:3, k:1, f:1 }, { w:'onze buurman', p:3, v:1 }, { w:'de trainer', p:3, v:1 },
    { w:'wij', p:'mv', k:1, f:1 }, { w:'jullie', p:'mv', k:1, f:1 }, { w:'mijn ouders', p:'mv', v:1, f:1 }, { w:'de kinderen', p:'mv', k:1, f:1 }
  ];
  /* wat er vooraan mag, per soort aanvulling */
  var NU = { r:['Vandaag', 'Morgen', 'Vaak', 'Na school', 'Vanavond', 'Op woensdag'], a:['Vaak', 'Meestal', 'Soms'], e:['Vandaag', 'Morgen', 'Volgende week', 'Zaterdag', 'Straks'],
             k:['Straks', 'Zo meteen'], s:['Nu', 'Tegenwoordig', 'Dit jaar'], c:['Natuurlijk', 'Toch'] };
  var TOEN = { r:['Gisteren', 'Vorige week', 'Vanochtend', 'Afgelopen zaterdag', 'Gisteravond'], e:['Gisteren', 'Vorige week', 'Vanochtend', 'Afgelopen zaterdag', 'Gisteravond'],
               s:['Vroeger', 'Vorig jaar'] };
  TOEN.k = TOEN.e; TOEN.a = TOEN.r;
  var TOEN_NA = { r:['gisteren', 'vorige week', 'vanochtend'], e:['gisteren', 'vorige week', 'vanochtend'], s:['vroeger', 'vorig jaar'] };
  TOEN_NA.k = TOEN_NA.e; TOEN_NA.a = TOEN_NA.r;
  function tijd(m){ return m.indexOf('s') >= 0 ? 's' : m.indexOf('k') >= 0 ? 'k' : m.indexOf('e') >= 0 ? 'e' : m.indexOf('a') >= 0 ? 'a' : 'r'; }
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
    var v = kies(lijst), a = kies(v.aan), c = a.t, m = a.m, t = tijd(m), o;
    /* een onderwerp dat past: een kind als het moet, en nooit ook in de aanvulling ("De juf zegt sorry tegen de juf") */
    do { o = kies(OND); } while ((m.indexOf('*') >= 0 && !o.k) || (m.indexOf('v') >= 0 && !o.v) || (m.indexOf('f') >= 0 && !o.f) || c.indexOf(o.w.replace(/^(de|mijn|onze) /, '')) >= 0);
    var hulp = HULP[m.indexOf('h') >= 0 ? 'heb' : v.hulp];
    /* na school: alleen bij een kind */
    var nu = (m.indexOf('c') >= 0 ? NU.c : NU[t]).filter(function(x){ return x !== 'Na school' || (o.k && !o.v); });
    var vormen = n === 1 ? ['nu', 'nuInv', 'toen', 'vd', 'vd', 'nu'] : ['nu', 'nuInv', 'vraag', 'toen', 'toenS', 'vd', 'vdInv'];
    vormen = vormen.filter(function(f){
      if (f === 'nuInv' && m.indexOf('n') >= 0) return false;
      if (f === 'vraag' && m.indexOf('x') >= 0) return false;
      if ((f === 'vd' || f === 'vdInv') && m.indexOf('p') >= 0) return false;
      return true;
    });
    var soort = kies(vormen), zin, woord, regel, S = o.w;
    if (soort === 'nu'){ woord = nuVorm(v, o); zin = hoofd(S) + ' ' + woord + ' ' + c + '.'; regel = uitlegNu(v, o, false); }
    else if (soort === 'nuInv'){ woord = nuVorm(v, o, true); zin = kies(nu) + ' ' + woord + ' ' + S + ' ' + c + '.'; regel = uitlegNu(v, o, true); }
    else if (soort === 'vraag'){ woord = nuVorm(v, o, true); zin = hoofd(woord) + ' ' + S + ' ' + c + '?'; regel = uitlegNu(v, o, true); }
    else if (soort === 'toen'){ var mv = o.p === 'mv'; woord = mv ? v.vtm : v.vt; zin = kies(TOEN[t]) + ' ' + woord + ' ' + S + ' ' + c + '.'; regel = uitlegToen(v, mv); }
    else if (soort === 'toenS'){ var mv2 = o.p === 'mv'; woord = mv2 ? v.vtm : v.vt; zin = hoofd(S) + ' ' + woord + ' ' + kies(TOEN_NA[t]) + ' ' + c + '.'; regel = uitlegToen(v, mv2); }
    else if (soort === 'vdInv'){ woord = v.vd; zin = kies(TOEN[t]) + ' ' + hulpVorm(hulp, o, true) + ' ' + S + ' ' + c + ' ' + woord + '.'; regel = uitlegVd(v); }
    else { woord = v.vd; zin = hoofd(S) + ' ' + hulpVorm(hulp, o) + ' ' + c + ' ' + woord + '.'; regel = uitlegVd(v); }
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
    'aquarium|aquaria|aquariumpje|la|pje|het|3',
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
    'theorie|theorieën|-|trema||de|3', 'industrie|industrieën|-|trema||de|3', 'bioscoop|bioscopen|bioscoopje|open|je|de|3',
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
      return { w: z.kl, zin: 'Het verkleinwoord van ' + z.ev + ' is ' + z.kl + '.', uit: 'verkleinwoord van ' + z.ev + '. ' + uitlegKl(z).replace(/\.$/, ''), sleutel: 'gk' + z.kl };
    }
    return { w: z.mv, zin: 'Eén ' + z.ev + ', twee ' + z.mv + '.', uit: 'meervoud van ' + z.ev + '. ' + uitlegMv(z).replace(/\.$/, ''), sleutel: 'gm' + z.mv };
  }

  /* ---------- hoofdletters en leestekens ---------- */
  var MEISJES = ['Noor', 'Emma', 'Lotte', 'Anna', 'Eva', 'Julia', 'Femke', 'Iris', 'Floor'], JONGENS = ['Daan', 'Sem', 'Tim', 'Bram', 'Tom', 'Ruben', 'Lars', 'Jasper', 'Joris'];
  var NAMEN = MEISJES.concat(JONGENS);
  var PLAATS = ['Amsterdam', 'Utrecht', 'Groningen', 'Zwolle', 'Arnhem', 'Leiden', 'Delft', 'Haarlem', 'Rotterdam', 'Maastricht', 'Nijmegen', 'Breda'];
  var LAND = [['Frankrijk', 'Franse', 'kaas', 'eet'], ['Spanje', 'Spaanse', 'tortilla', 'eet'], ['Duitsland', 'Duitse', 'worst', 'eet'], ['België', 'Belgische', 'friet', 'eet'],
              ['Italië', 'Italiaanse', 'pizza', 'eet'], ['Griekenland', 'Griekse', 'yoghurt', 'eet'], ['Engeland', 'Engelse', 'thee', 'drinkt'], ['Zweden', 'Zweedse', 'gehaktballetjes', 'eet']];
  var DAGEN = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
  var MAAND = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  /* spullen die bij elkaar horen: waar je ze voor meeneemt, en wat je dan meeneemt */
  var SPUL = [['Naar het strand', ['een handdoek', 'een zonnebril', 'een fles water', 'een bal', 'zonnebrand']],
              ['Naar school', ['een pen', 'een schrift', 'een appel', 'een boek', 'een liniaal']],
              ['Voor het schoolreisje', ['een jas', 'een fles water', 'een banaan', 'een rugzak', 'een paraplu']],
              ['Naar de sportles', ['een handdoek', 'sportschoenen', 'een fles water', 'een shirt', 'een korte broek']]];
  var FAM = { m:['zus', 'nicht', 'buurvrouw', 'beste vriendin'], j:['broer', 'neef', 'buurjongen', 'beste vriend'] };
  var BIJZIN = [['het regende', 'bleef ', ' thuis'], ['de bus te laat was', 'kwam ', ' te laat op school'], ['de winkel dicht was', 'fietste ', ' weer naar huis'],
                ['het zo warm was', 'ging ', ' zwemmen'], ['de film spannend was', 'keek ', ' tot het eind']];
  function twee(a){ var x = kies(a), y; do { y = kies(a); } while (y === x); return [x, y]; }
  function leesteken(niveau){
    var n = niv(niveau), soorten = n === 1 ? ['namen', 'dag', 'lijst', 'vraag', 'vraag2'] : n === 2 ? ['namen', 'dag', 'lijst', 'vraag', 'bijstelling', 'bijzin', 'land'] : ['lijst', 'vraag', 'bijstelling', 'bijzin', 'land', 'feest', 'maandLand'];
    var s = kies(soorten), nm = twee(NAMEN), zin, uit;
    if (s === 'namen'){ var p = kies(PLAATS); zin = nm[0] + ' en ' + nm[1] + ' gaan op ' + kies(DAGEN) + ' naar ' + p + '.'; uit = 'Namen en plaatsnamen krijgen een hoofdletter: ' + nm[0] + ', ' + nm[1] + ', ' + p + '. Dagen van de week niet.'; }
    else if (s === 'dag'){ var m = kies(MAAND), p2 = kies(PLAATS); zin = 'In ' + m + ' gaat ' + nm[0] + ' op een ' + kies(DAGEN) + ' naar ' + p2 + '.'; uit = 'Maanden en dagen schrijf je met een kleine letter; de naam ' + nm[0] + ' en de plaatsnaam ' + p2 + ' krijgen een hoofdletter.'; }
    else if (s === 'lijst'){ var sl = kies(SPUL), sp = sl[1].slice().sort(function(){ return Math.random() - .5; }).slice(0, n === 3 ? 4 : 3); zin = sl[0] + ' neemt ' + nm[0] + ' ' + sp.slice(0, -1).join(', ') + ' en ' + sp[sp.length - 1] + ' mee.'; uit = 'In een opsomming komen komma’s tussen de dingen, maar niet voor en.'; }
    else if (s === 'vraag'){ var p3 = kies(PLAATS); zin = 'Gaat ' + nm[0] + ' op ' + kies(DAGEN) + ' met ' + nm[1] + ' naar ' + p3 + '?'; uit = 'Een vraag eindigt op een vraagteken. Namen en plaatsnamen met een hoofdletter, de dag niet.'; }
    else if (s === 'vraag2'){ zin = 'Waarom komt ' + nm[0] + ' niet naar het feest van ' + nm[1] + '?'; uit = 'Een vraag met waarom: een vraagteken aan het eind. Namen krijgen een hoofdletter.'; }
    else if (s === 'bijstelling'){ var f = kies(FAM[MEISJES.indexOf(nm[0]) >= 0 ? 'm' : 'j']), p4 = kies(PLAATS); zin = nm[0] + ', de ' + f + ' van ' + nm[1] + ', woont in ' + p4 + '.'; uit = 'De uitleg over ' + nm[0] + ' (de ' + f + ' van ' + nm[1] + ') staat tussen twee komma’s.'; }
    else if (s === 'bijzin'){ var b = kies(BIJZIN); zin = 'Omdat ' + b[0] + ', ' + b[1] + nm[0] + b[2] + '.'; uit = 'Na een bijzin aan het begin (omdat ' + b[0] + ') komt een komma, tussen de twee werkwoorden.'; }
    else if (s === 'land'){ var l = kies(LAND); zin = nm[0] + ' ' + l[3] + ' in ' + l[0] + ' graag ' + l[1] + ' ' + l[2] + '.'; uit = 'Een land krijgt een hoofdletter, en een woord dat van een land komt ook: ' + l[1] + ' ' + l[2] + '.' + (/ë/.test(l[0]) ? ' ' + l[0] + ' met een trema.' : ''); }
    else if (s === 'feest'){ var fe = kies([['Met Pasen', 'Pasen is een feestdag: hoofdletter.'], ['Op Koningsdag', 'Koningsdag is een feestdag: hoofdletter.'], ['In de kerstvakantie', 'kerstvakantie is een gewoon woord: kleine letter, ook al is Kerstmis een feestdag.'], ['Met oud en nieuw', 'oud en nieuw schrijf je met kleine letters.']]), p5 = kies(PLAATS);
      zin = fe[0] + ' gaat ' + nm[0] + ' naar ' + p5 + '.'; uit = fe[1] + ' De naam en de plaatsnaam met een hoofdletter.'; }
    else { var l2 = kies(LAND), m2 = kies(MAAND); zin = 'Gaan ' + nm[0] + ' en ' + nm[1] + ' in ' + m2 + ' naar ' + l2[0] + '?'; uit = 'Een land krijgt een hoofdletter, een maand niet. Een vraag eindigt op een vraagteken.' + (/ë/.test(l2[0]) ? ' ' + l2[0] + ' met een trema.' : ''); }
    return { zin: zin, uit: uit, sleutel: 'gl' + zin };
  }
  return { werkwoord: werkwoord, woord: woord, leesteken: leesteken, WW: WW, ZN: ZN };
})();
