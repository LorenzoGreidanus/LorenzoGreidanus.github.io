/* De leerroute Nederlands: werkwoordspelling.
   Fundament: het hele werkwoord, de stam, de persoonsvorm en het onderwerp.
   1F: de tegenwoordige tijd en de verleden tijd. 2F: het voltooid deelwoord
   en bijzondere gevallen. 3F: lastige werkwoorden. Elke regel en elk trucje
   is een eigen doel. Zie leerroute.js voor het formaat.

   Opbouw: eerst een woordenboek van werkwoorden (LEX, met stam, verleden tijd
   en voltooid deelwoord), dan zinnen (raamwerken met een gat), dan de doelen. */
(function(){
  'use strict';
  var R = LEERROUTE.R;
  function kies(l){ return R.kies(l); }
  function cap(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
  function eind(t, c){ return t.slice(-c.length) === c; }
  function kans(p){ return Math.random() < p; }

  /* ---------- het woordenboek ---------- */
  var LEX = {};
  /* een zwak werkwoord: alles volgt uit het hele werkwoord en de stam */
  function zwak(h, s, vv){
    var b = h.slice(0, -2), letter = /ch$/.test(b) ? 'ch' : b.slice(-1);
    var kof = letter === 'ch' || 'tkfsp'.indexOf(letter) >= 0, u = kof ? 't' : 'd';
    return { h:h, s:s, vt:s + (kof ? 'te' : 'de'), vtm:s + (kof ? 'ten' : 'den'), vd:(vv ? '' : 'ge') + s + (s.slice(-1) === u ? '' : u),
      zwak:true, kof:kof, letter:letter, vv:!!vv };
  }
  /* 'werken werk' is zwak; '+vertellen vertel' heeft een voorvoegsel (geen ge-);
     sterk: 'lopen loop liep liepen gelopen' */
  function lees(tekst, sterk){
    tekst.split(',').forEach(function(x){
      x = x.trim(); if (!x) return;
      var vv = x.charAt(0) === '+'; if (vv) x = x.slice(1);
      var p = x.split(/\s+/);
      LEX[p[0]] = sterk ? { h:p[0], s:p[1], vt:p[2], vtm:p[3], vd:p[4], sterk:true, vv:vv } : zwak(p[0], p[1], vv);
    });
  }
  lees('werken werk, fietsen fiets, maken maak, hopen hoop, wonen woon, spelen speel, leren leer, bouwen bouw, praten praat, zetten zet,' +
    'wachten wacht, antwoorden antwoord, landen land, melden meld, leiden leid, redden red, reizen reis, verven verf, leven leef,' +
    'durven durf, beven beef, proeven proef, niezen nies, blozen bloos, vrezen vrees, bellen bel, poetsen poets, koken kook, dansen dans,' +
    'huilen huil, luisteren luister, wandelen wandel, tekenen teken, missen mis, pakken pak, stoppen stop, rennen ren, sturen stuur,' +
    'horen hoor, leggen leg, trainen train, gooien gooi, groeien groei, schaatsen schaats, plakken plak, oefenen oefen, zweten zweet,' +
    'groeten groet, rusten rust, lusten lust, testen test, printen print, klappen klap, kosten kost, plannen plan, scheuren scheur,' +
    'repareren repareer, parkeren parkeer, schillen schil, drogen droog, kleuren kleur, pellen pel, delen deel, huren huur, blaffen blaf,' +
    'ruimen ruim, nodigen nodig, leveren lever, vullen vul, halen haal, blesseren blesseer, voetballen voetbal, stofzuigen stofzuig,' +
    'glimlachen glimlach, beeldbellen beeldbel, handballen handbal, korfballen korfbal, zonnebaden zonnebaad, raadplegen raadpleeg,' +
    'stijldansen stijldans, basketballen basketbal, rangschikken rangschik, beeldhouwen beeldhouw, knippen knip, kloppen klop,' +
    'kussen kus, zwaaien zwaai, branden brand, scoren scoor, dromen droom, kraken kraak, smeren smeer, boren boor, duren duur, jagen jaag,' +
    'haten haat, wedden wed,' +
    '+vertellen vertel, +verhuizen verhuis, +betalen betaal, +bestellen bestel, +herhalen herhaal, +ontdekken ontdek, +gebeuren gebeur,' +
    '+gebruiken gebruik, +geloven geloof, +beloven beloof, +verdienen verdien, +beantwoorden beantwoord, +verbranden verbrand,' +
    '+vertrouwen vertrouw, +herkennen herken, +verbeteren verbeter, +bewaren bewaar, +verzamelen verzamel, +verwarmen verwarm,' +
    '+verbouwen verbouw, +bezorgen bezorg, +versieren versier, +vertalen vertaal, +ontmoeten ontmoet, +verwachten verwacht,' +
    '+verhuren verhuur, +verwennen verwen, +herhalen herhaal, +ontsnappen ontsnap, +verklaren verklaar, +betekenen beteken');
  lees('lopen loop liep liepen gelopen, schrijven schrijf schreef schreven geschreven, vinden vind vond vonden gevonden,' +
    'rijden rijd reed reden gereden, worden word werd werden geworden, lezen lees las lazen gelezen, geven geef gaf gaven gegeven,' +
    'eten eet at aten gegeten, drinken drink dronk dronken gedronken, zingen zing zong zongen gezongen, zwemmen zwem zwom zwommen gezwommen,' +
    'springen spring sprong sprongen gesprongen, kijken kijk keek keken gekeken, blijven blijf bleef bleven gebleven,' +
    'slapen slaap sliep sliepen geslapen, roepen roep riep riepen geroepen, komen kom kwam kwamen gekomen, nemen neem nam namen genomen,' +
    'spreken spreek sprak spraken gesproken, breken breek brak braken gebroken, helpen help hielp hielpen geholpen,' +
    '+vergeten vergeet vergat vergaten vergeten, +beginnen begin begon begonnen begonnen, zitten zit zat zaten gezeten,' +
    'liggen lig lag lagen gelegen, vallen val viel vielen gevallen, houden houd hield hielden gehouden, vragen vraag vroeg vroegen gevraagd,' +
    'zoeken zoek zocht zochten gezocht, kopen koop kocht kochten gekocht, denken denk dacht dachten gedacht, brengen breng bracht brachten gebracht,' +
    'kiezen kies koos kozen gekozen, vliegen vlieg vloog vlogen gevlogen, schieten schiet schoot schoten geschoten,' +
    'sluiten sluit sloot sloten gesloten, staan sta stond stonden gestaan, gaan ga ging gingen gegaan, slaan sla sloeg sloegen geslagen,' +
    'zien zie zag zagen gezien, doen doe deed deden gedaan, trekken trek trok trokken getrokken, winnen win won wonnen gewonnen,' +
    '+verliezen verlies verloor verloren verloren, bieden bied bood boden geboden, krijgen krijg kreeg kregen gekregen,' +
    'hangen hang hing hingen gehangen, glijden glijd gleed gleden gegleden, snijden snijd sneed sneden gesneden,' +
    'fluiten fluit floot floten gefloten, +ontbijten ontbijt ontbeet ontbeten ontbeten, meten meet mat maten gemeten,' +
    'weten weet wist wisten geweten, bidden bid bad baden gebeden, schijnen schijn scheen schenen geschenen,' +
    '+vertrekken vertrek vertrok vertrokken vertrokken, bakken bak bakte bakten gebakken, lachen lach lachte lachten gelachen,' +
    'raden raad raadde raadden geraden, stelen steel stal stalen gestolen, wassen was waste wasten gewassen,' +
    '+bevriezen bevries bevroor bevroren bevroren, dragen draag droeg droegen gedragen, vechten vecht vocht vochten gevochten', true);
  LEX.houden.s2 = 'hou';
  /* ga + t schrijf je gaat: de a blijft lang */
  LEX.gaan.t3 = 'gaat'; LEX.staan.t3 = 'staat'; LEX.slaan.t3 = 'slaat';
  /* Engelse werkwoorden: heel stam vt vd klank kofschip(1/0) */
  var ENG = [];
  ('updaten update updatete geüpdatet t 1, racen race racete geracet s 1, crashen crash crashte gecrasht sj 1, recyclen recycle recyclede gerecycled l 0,' +
   'downloaden download downloadde gedownload d 0, mailen mail mailde gemaild l 0, skaten skate skatete geskatet t 1, liken like likete geliket k 1,' +
   'deleten delete deletete gedeletet t 1, saven save savede gesaved v 0, chatten chat chatte gechat t 1, gamen game gamede gegamed m 0,' +
   'checken check checkte gecheckt k 1, coachen coach coachte gecoacht tsj 1, surfen surf surfte gesurft f 1, scannen scan scande gescand n 0,' +
   'streamen stream streamde gestreamd m 0, appen app appte geappt p 1, joggen jog jogde gejogd g 0, relaxen relax relaxte gerelaxt ks 1,' +
   'faken fake fakete gefaket k 1, timen time timede getimed m 0').split(',').forEach(function(x){
    var p = x.trim().split(/\s+/);
    var e = { h:p[0], s:p[1], vt:p[2], vtm:p[2] + 'n', vd:p[3], klank:p[4], kof:p[5] === '1', eng:true, zwak:true };
    if (p[0] === 'updaten') e.vdAlt = ['geüpdatet', 'geupdatet'];
    LEX[p[0]] = e; ENG.push(e);
  });

  /* ---------- vormen ---------- */
  function ott(V, p, inv){
    if (p === '1' || p === 'geb' || (p === '2' && inv)) return V.s;
    if (p === 'mv') return V.h;
    if (V.t3) return V.t3;
    return eind(V.s, 't') ? V.s : V.s + 't';
  }
  function ottAlle(V, p, inv){ var f = ott(V, p, inv); return f === V.s && V.s2 ? [f, V.s2] : f; }
  function ovt(V, p){ return p === 'mv' ? V.vtm : V.vt; }
  function vdAlle(V){ return V.vdAlt || V.vd; }
  var AUX = {
    h:{ '1':'heb', '2':'hebt', '2i':'heb', u:'hebt', '3':'heeft', mv:'hebben', vt:'had', vtm:'hadden' },
    z:{ '1':'ben', '2':'bent', '2i':'ben', u:'bent', '3':'is', mv:'zijn', vt:'was', vtm:'waren' },
    zal:{ '1':'zal', '2':'zult', '2i':'zul', u:'zult', '3':'zal', mv:'zullen' } };
  function auxV(a, p, inv){ var A = AUX[a]; return p === '2' && inv ? A['2i'] : A[p]; }
  function auxVt(a, p){ return p === 'mv' ? AUX[a].vtm : AUX[a].vt; }
  /* zoals je hem fout zou maken als het zwak was */
  function nepZwak(V){ return zwak(V.h, V.s, V.vv); }

  /* ---------- de stam ---------- */
  var VER = { niets:'niets: dit is al de stam', dubbel:'één medeklinker weghalen', klinker:'de klinker dubbel schrijven',
    vf:'de v wordt een f', zs:'de z wordt een s', vfk:'klinker dubbel en v wordt f', zsk:'klinker dubbel en z wordt s' };
  function verandering(h, s){
    var b = h.slice(0, -2);
    if (s === b) return 'niets';
    if (/([^aeiou])\1$/.test(b) && s === b.slice(0, -1)) return 'dubbel';
    var l = b.slice(-1), sl = s.slice(-1), k = s.length === b.length + 1;
    if (l === 'v' && sl === 'f') return k ? 'vfk' : 'vf';
    if (l === 'z' && sl === 's') return k ? 'zsk' : 'zs';
    if (k) return 'klinker';
    return 'anders';
  }
  function klinkerVan(b){ var m = /([aeou])[^aeiou]+$/.exec(b); return m ? m[1] : 'e'; }
  function verHint(h, c){
    var b = h.slice(0, -2), kl = klinkerVan(b);
    var t = { niets:'Eindigt ' + b + ' niet op twee dezelfde medeklinkers, niet op v of z, en klinkt het zoals in ' + h + '? Dan is het al de stam.',
      dubbel:b + ' eindigt op twee dezelfde medeklinkers. Aan het eind van een woord schrijf je er maar één.',
      klinker:'In ' + h + ' klinkt de ' + kl + ' lang. Zonder -en staat de ' + kl + ' alleen voor de medeklinker: schrijf hem dubbel, dan blijft hij lang.',
      vf:'Een stam eindigt nooit op een v. Maak van de v een f.',
      zs:'Een stam eindigt nooit op een z. Maak van de z een s.',
      vfk:'Twee dingen: de ' + kl + ' klinkt lang, dus schrijf hem dubbel. En een stam eindigt nooit op een v: maak er een f van.',
      zsk:'Twee dingen: de ' + kl + ' klinkt lang, dus schrijf hem dubbel. En een stam eindigt nooit op een z: maak er een s van.' };
    return t[c] || 'Zeg ik ervoor: ik ... Wat je dan zegt, is de stam.';
  }
  function stamHint(V){
    if (V.eng) return 'Haal -n of -en van ' + V.h + ' af, zodat het Engelse woord overblijft: ik ...';
    if (/^(gaan|staan|slaan|zien|doen)$/.test(V.h)) return 'Zeg ik ervoor: ik ... Wat je dan zegt, is de stam.';
    var c = verandering(V.h, V.s);
    return 'Haal -en van ' + V.h + ' af: ' + V.h.slice(0, -2) + '. ' + (c === 'niets' ? 'Meer hoeft er niet te veranderen.' : verHint(V.h, c));
  }
  function stStam(V){ return invul('De stam van ' + V.h + ' is', V.s2 ? [V.s, V.s2] : V.s, stamHint(V), { fout:stamFout(V) }); }
  function stamFout(V){
    var f = {}, b = V.h.slice(0, -2);
    if (b !== V.s && !V.eng) f[b] = 'Bijna. Let nog op de spelling: ' + verHint(V.h, verandering(V.h, V.s));
    if (V.h !== V.s) f[V.h] = 'Dat is het hele werkwoord. De stam is korter: haal -en eraf.';
    return f;
  }

  /* ---------- stappen ---------- */
  function keuze(tekst, goed, fout, hint, extra){
    var lijst = [goed];
    (fout || []).forEach(function(f){ if (f != null && f !== '' && lijst.indexOf(f) < 0) lijst.push(f); });
    var o = R.hussel(lijst), s = { tekst:tekst, opties:o, goed:o.indexOf(goed), hint:hint };
    if (extra) for (var k in extra) s[k] = extra[k];
    return s;
  }
  function invul(tekst, ant, hint, extra){
    var s = { tekst:tekst, antwoord:ant, hint:hint };
    if (extra) for (var k in extra) s[k] = extra[k];
    return s;
  }
  /* de laatste keuze is ook de vraag bij Zelf */
  function eindKeuze(op){ var s = op.stappen[op.stappen.length - 1]; if (s.opties){ op.opties = s.opties; op.goed = s.goed; } return op; }

  /* ---------- zinnen ---------- */
  function GAT(w){ return '(' + w + ') __'; }
  function bouw(parts, slot){
    parts = parts.filter(function(p){ return p && p.t; });
    var tekst = parts.map(function(p, i){ return i === 0 && p.rol !== 'gat' ? cap(p.t) : p.t; }).join(' ') + slot;
    return { parts:parts, slot:slot, tekst:tekst };
  }
  /* de zin als plaatje; merk: { rol:{ k, label, t } } kleurt een stuk (en t vult het in) */
  function tekenZin(b, merk){
    merk = merk || {};
    return R.teken.zin(b.parts.map(function(p, i){
      var m = merk[p.rol], t = m && m.t != null ? m.t : p.t;
      if (i === 0 && (p.rol !== 'gat' || (m && m.t != null))) t = cap(t);
      if (i === b.parts.length - 1) t += b.slot;
      return m ? { t:t, k:m.k, label:m.label } : t;
    }));
  }
  /* de onderwerpen */
  var ONDW = [ { t:'ik', p:'1' }, { t:'jij', p:'2' }, { t:'je', p:'2' }, { t:'u', p:'u', v:1 }, { t:'hij', p:'3' }, { t:'zij', p:'3' },
    { t:'Sanne', p:'3' }, { t:'Daan', p:'3' }, { t:'mijn broer', p:'3' }, { t:'mijn zus', p:'3' }, { t:'de buurvrouw', p:'3', v:1 },
    { t:'opa', p:'3', v:1 }, { t:'wij', p:'mv' }, { t:'we', p:'mv' }, { t:'jullie', p:'mv' }, { t:'mijn ouders', p:'mv', v:1 },
    { t:'de kinderen', p:'mv' }, { t:'Noah en Lisa', p:'mv' } ];
  /* s: 'a' iedereen, 'k' geen volwassenen, 'e' één kind */
  function ondw(F, filter){
    var l = ONDW.filter(function(o){
      if (F && F.s === 'k' && o.v) return false;
      if (F && F.s === 'e' && (o.v || o.p === 'mv')) return false;
      return !filter || filter(o);
    });
    /* past het filter niet bij dit raamwerk (veertien worden met wij), dan een onderwerp dat wel past */
    return l.length ? kies(l) : ondw(F);
  }
  function isP(lijst){ return function(o){ return lijst.indexOf(o.p) >= 0; }; }
  /* raamwerk: werkwoord, rest van de zin, tijdwoorden nu, tijdwoorden toen, hulpwerkwoord (h hebben, z zijn), wie (a, k, e), o: alleen tegenwoordige tijd */
  function raam(lijst){ return lijst.map(function(a){ return { w:a[0], x:a[1], nu:a[2].split('/'), toen:a[3].split('/'), aux:a[4] || 'h', s:a[5] || 'a', o:a[6] === 'o' }; }); }
  var FR_ALG = raam([
    ['fietsen', 'naar school', 'elke dag/vandaag', 'gisteren/vorige week', 'z', 'k'],
    ['werken', 'in de supermarkt', 'elke zaterdag/vandaag', 'vorige zomer/gisteren'],
    ['spelen', 'een potje voetbal', 'elke middag/vandaag', 'gisteren/vorige week', 'h', 'k'],
    ['maken', 'het huiswerk voor Engels', 'nu/vanavond', 'gisteren/vorige week', 'h', 'k'],
    ['lopen', 'met de hond door het park', 'elke ochtend/nu', 'gisteren/vorige week'],
    ['wonen', 'in een flat', 'nu/sinds kort', 'vroeger/vorig jaar'],
    ['lezen', 'een spannend boek', 'elke avond/nu', 'gisteren/vorige week'],
    ['koken', 'pasta met tomatensaus', 'vanavond/elke vrijdag', 'gisteren/vorige week'],
    ['bellen', 'de tandarts', 'straks/vandaag', 'gisteren/vorige week'],
    ['schrijven', 'een brief aan de burgemeester', 'nu/vandaag', 'gisteren/vorige week'],
    ['leren', 'voor de toets', 'vandaag/elke avond', 'gisteren/vorige week', 'h', 'k'],
    ['kijken', 'naar een serie', 'elke avond/nu', 'gisteren/vorige week'],
    ['slapen', 'bij oma', 'vannacht/vandaag', 'vorige week/gisteren', 'h', 'k'],
    ['zwemmen', 'in het meer', 'elke zomer/vandaag', 'vorige zomer/gisteren'],
    ['drinken', 'thee met honing', 'elke ochtend/nu', 'gisteren/vroeger'],
    ['dansen', 'op het schoolfeest', 'vanavond/vandaag', 'vorige week/gisteren', 'h', 'k'],
    ['poetsen', 'de schoenen', 'vandaag/elke zondag', 'gisteren/vorige week'],
    ['zingen', 'in een koor', 'elke woensdag/nu', 'vroeger/vorig jaar'],
    ['helpen', 'de buren', 'vanmiddag/vandaag', 'gisteren/vorige week'],
    ['luisteren', 'naar de radio', 'nu/elke ochtend', 'gisteren/vroeger'],
    ['tekenen', 'een strip', 'nu/elke pauze', 'gisteren/vorige week', 'h', 'k'],
    ['trainen', 'bij de voetbalclub', 'drie keer per week/vandaag', 'vorig jaar/gisteren', 'h', 'k'],
    ['sturen', 'een appje naar oma', 'nu/vanavond', 'gisteren/vorige week'],
    ['horen', 'een vreemd geluid', 'nu/elke nacht', 'gisteren/vorige week'],
    ['pakken', 'de bus naar huis', 'vandaag/elke dag', 'gisteren/vorige week'],
    ['rennen', 'een rondje door het park', 'elke dinsdag/nu', 'gisteren/vorige week'],
    ['komen', 'naar het feest', 'morgen/vanavond', 'gisteren/vorige week', 'z'],
    ['blijven', 'thuis', 'vandaag/vanavond', 'gisteren/vorig weekend', 'z'],
    ['geven', 'een spreekbeurt', 'morgen/vandaag', 'gisteren/vorige week', 'h', 'k'],
    ['nemen', 'de trein', 'vandaag/morgen', 'gisteren/vorige week'],
    ['krijgen', 'een nieuwe fiets', 'morgen/vandaag', 'gisteren/vorig jaar'],
    ['kopen', 'nieuwe schoenen', 'vandaag/morgen', 'gisteren/vorige week'],
    ['zoeken', 'een plekje in de trein', 'nu/elke ochtend', 'gisteren/vorige week'],
    ['vragen', 'hulp aan de mentor', 'morgen/vandaag', 'gisteren/vorige week', 'h', 'k'],
    ['springen', 'van de hoge duikplank', 'nu/vandaag', 'gisteren/vorige zomer', 'h', 'k'],
    ['verhuizen', 'naar Groningen', 'volgende maand/binnenkort', 'vorig jaar/vorige maand', 'z'],
    ['reizen', 'door Frankrijk', 'deze zomer/volgende maand', 'vorige zomer/vorig jaar'],
    ['verven', 'de schuur', 'vandaag/morgen', 'gisteren/vorige week'],
    ['betalen', 'met de pinpas', 'nu/altijd', 'gisteren/vorige week'],
    ['vertellen', 'een mop', 'nu/vandaag', 'gisteren/vorige week'],
    ['denken', 'aan de vakantie', 'nu/vaak', 'gisteren/vorige week'],
    ['gooien', 'de bal naar de keeper', 'nu/vandaag', 'gisteren/vorige week', 'h', 'k'],
    ['bouwen', 'een hut in het bos', 'vandaag/deze week', 'gisteren/vorige zomer', 'h', 'k'],
    ['gaan', 'naar de bioscoop', 'morgen/vanavond', 'gisteren/vorige week', 'z'],
    ['doen', 'de boodschappen', 'vandaag/morgen', 'gisteren/vorige week'],
    ['zien', 'een vliegtuig in de lucht', 'nu/vandaag', 'gisteren/vorige week'],
    ['staan', 'bij de bushalte', 'nu/elke ochtend', 'gisteren/vorige week'],
    ['huilen', 'om de droevige film', 'nu/vanavond', 'gisteren/vorige week'],
    ['stoppen', 'met gamen', 'nu/vanavond', 'gisteren/vorige week', 'z', 'k'],
    ['wandelen', 'langs het strand', 'elke zondag/vandaag', 'gisteren/vorige week'],
    ['oefenen', 'voor de musical', 'elke dag/vandaag', 'gisteren/vorige week', 'h', 'k'],
    ['leggen', 'het boek op tafel', 'nu/vandaag', 'gisteren/vorige week'],
    ['bestellen', 'een pizza', 'vanavond/vandaag', 'gisteren/vorige week'],
    ['ontdekken', 'een geheime gang', 'nu/vandaag', 'gisteren/vorige week', 'h', 'k'],
    ['gebruiken', 'een woordenboek', 'nu/vandaag', 'gisteren/vorige week'],
    ['herhalen', 'de woordjes', 'vandaag/elke avond', 'gisteren/vorige week', 'h', 'k'],
    ['verdienen', 'geld met oppassen', 'nu/elke week', 'vorig jaar/vorige week', 'h', 'k'],
    ['schaatsen', 'op de vaart', 'vandaag/morgen', 'vorige winter/gisteren'],
    ['plakken', 'een pleister op de wond', 'nu/vandaag', 'gisteren/vorige week'],
    ['hopen', 'op mooi weer', 'vandaag/nu', 'gisteren/vorige week'],
    ['missen', 'de bus', 'vandaag/vaak', 'gisteren/vorige week'],
    ['dromen', 'over de vakantie', 'vaak/elke nacht', 'vannacht/vorige week'],
    ['kloppen', 'op de deur', 'nu/altijd', 'gisteren/vorige week'],
    ['knippen', 'een plaatje uit de krant', 'nu/vandaag', 'gisteren/vorige week']
  ]);
  /* stam op -d */
  var FR_D = raam([
    ['worden', 'bang bij deze film', 'altijd/nu', 'gisteren/vroeger', 'z'],
    ['worden', 'moe van het sporten', 'altijd/vandaag', 'gisteren/vorige week', 'z'],
    ['worden', 'veertien', 'morgen/volgende week', 'vorige week/vorig jaar', 'z', 'e'],
    ['vinden', 'gym het leukste vak', 'nu/dit jaar', 'vroeger/vorig jaar', 'h', 'k'],
    ['vinden', 'de nieuwe juf aardig', 'nu/eigenlijk', 'vroeger/vorig jaar', 'h', 'k'],
    ['vinden', 'een oplossing voor het probleem', 'altijd/nu', 'gisteren/vorige week'],
    ['rijden', 'paard op de manege', 'elke zondag/vandaag', 'vroeger/vorige week', 'h', 'k'],
    ['rijden', 'naar Amsterdam', 'morgen/vandaag', 'gisteren/vorige week', 'z'],
    ['houden', 'veel van chocola', 'nog steeds/nog altijd', 'vroeger/als kind'],
    ['houden', 'een spreekbeurt over haaien', 'morgen/vandaag', 'gisteren/vorige week', 'h', 'k'],
    ['antwoorden', 'snel op een appje', 'altijd/nu', 'gisteren/vroeger'],
    ['bieden', 'tien euro voor de oude fiets', 'nu/vandaag', 'gisteren/vorige week'],
    ['landen', 'op Schiphol', 'vanavond/morgen', 'gisteren/vorige week', 'z'],
    ['raden', 'het antwoord', 'altijd/nu', 'gisteren/vroeger', 'h', 'a', 'o'],
    ['redden', 'de kat uit de boom', 'nu/vandaag', 'gisteren/vorige week'],
    ['glijden', 'van de glijbaan', 'nu/vandaag', 'gisteren/vroeger', 'z', 'k'],
    ['snijden', 'het brood in plakjes', 'nu/elke ochtend', 'gisteren/vorige week'],
    ['leiden', 'de vergadering', 'vandaag/morgen', 'gisteren/vorige week'],
    ['beantwoorden', 'de vraag van de juf', 'nu/altijd', 'gisteren/vorige week', 'h', 'k'],
    ['melden', 'het probleem bij de mentor', 'nu/morgen', 'gisteren/vorige week', 'h', 'k'],
    ['bidden', 'voor het eten', 'altijd/elke avond', 'vroeger/gisteren']
  ]);
  /* stam op -t */
  var FR_T = raam([
    ['zetten', 'de vaas op tafel', 'nu/vandaag', 'gisteren/vorige week'],
    ['zetten', 'thee voor de gasten', 'nu/vanavond', 'gisteren/vorige week'],
    ['praten', 'met de mentor', 'vandaag/morgen', 'gisteren/vorige week', 'h', 'k'],
    ['wachten', 'op de bus', 'al tien minuten/nu', 'gisteren/vorige week'],
    ['zitten', 'vooraan in de klas', 'nu/vandaag', 'gisteren/vorig jaar', 'h', 'k'],
    ['eten', 'een appel', 'elke dag/nu', 'gisteren/vorige week'],
    ['weten', 'het antwoord niet', 'nu/nog steeds', 'gisteren/toen'],
    ['schieten', 'de bal in het doel', 'nu/vandaag', 'gisteren/vorige week', 'h', 'k'],
    ['sluiten', 'de deur van de klas', 'nu/altijd', 'gisteren/vorige week'],
    ['vergeten', 'de sleutels', 'altijd/vaak', 'gisteren/vorige week'],
    ['fluiten', 'een vrolijk liedje', 'nu/vaak', 'gisteren/vroeger'],
    ['zweten', 'bij de bootcamp', 'altijd/nu', 'gisteren/vorige week'],
    ['printen', 'het verslag voor geschiedenis', 'nu/vandaag', 'gisteren/vorige week', 'h', 'k'],
    ['testen', 'de nieuwe app', 'vandaag/nu', 'gisteren/vorige week'],
    ['rusten', 'even na de lunch', 'altijd/vandaag', 'gisteren/vroeger'],
    ['ontmoeten', 'een vriend in de stad', 'morgen/vandaag', 'gisteren/vorige week'],
    ['verwachten', 'een pakketje', 'vandaag/morgen', 'gisteren/vorige week'],
    ['ontbijten', 'met brood en thee', 'elke dag/nu', 'gisteren/vroeger'],
    ['lusten', 'geen spruitjes', 'nog steeds/nu', 'vroeger/vorig jaar'],
    ['groeten', 'de buren', 'altijd/elke ochtend', 'gisteren/vroeger'],
    ['meten', 'de lengte van de tafel', 'nu/vandaag', 'gisteren/vorige week']
  ]);
  /* verven, reizen: v of z voor -en */
  var FR_VZ = raam([
    ['verven', 'de schuur', 'vandaag/morgen', 'gisteren/vorige week'],
    ['verven', 'het hek rood', 'vandaag/morgen', 'gisteren/vorige zomer'],
    ['reizen', 'door Frankrijk', 'deze zomer/volgende maand', 'vorige zomer/vorig jaar'],
    ['reizen', 'met de trein naar Parijs', 'morgen/deze week', 'vorige week/vorig jaar'],
    ['verhuizen', 'naar Groningen', 'volgende maand/binnenkort', 'vorig jaar/vorige maand', 'z'],
    ['leven', 'heel gezond', 'nu/sinds kort', 'vroeger/vorig jaar'],
    ['durven', 'niet in het donker naar buiten', 'nog steeds/nu', 'vroeger/als kind'],
    ['geloven', 'het verhaal van de buurman', 'nu/meteen', 'eerst/vroeger'],
    ['beloven', 'hulp aan de buren', 'nu/vandaag', 'gisteren/vorige week'],
    ['proeven', 'de soep', 'nu/vandaag', 'gisteren/vorige week'],
    ['niezen', 'heel hard', 'nu/de hele dag', 'gisteren/vorige week'],
    ['blozen', 'van verlegenheid', 'nu/altijd', 'gisteren/vroeger'],
    ['beven', 'van de kou', 'nu/de hele tijd', 'gisteren/vorige winter'],
    ['vrezen', 'het ergste', 'nu/meteen', 'eerst/gisteren']
  ]);
  /* Engelse werkwoorden */
  var FR_ENG = raam([
    ['updaten', 'de app', 'nu/vandaag', 'gisteren/vorige week'],
    ['racen', 'door de straat', 'elke dag/nu', 'gisteren/vroeger', 'h', 'k'],
    ['crashen', 'in het racespel', 'vaak/nu', 'gisteren/vorige week', 'h', 'k'],
    ['recyclen', 'plastic flessen', 'altijd/nu', 'vroeger/vorig jaar'],
    ['downloaden', 'een nieuwe game', 'nu/vandaag', 'gisteren/vorige week', 'h', 'k'],
    ['mailen', 'de docent', 'vandaag/nu', 'gisteren/vorige week', 'h', 'k'],
    ['skaten', 'in het park', 'elke middag/vandaag', 'gisteren/vroeger', 'h', 'k'],
    ['liken', 'de nieuwe video', 'nu/vandaag', 'gisteren/vorige week', 'h', 'k'],
    ['deleten', 'de oude bestanden', 'nu/vandaag', 'gisteren/vorige week'],
    ['saven', 'het document', 'nu/altijd', 'gisteren/vorige week'],
    ['chatten', 'met vrienden', 'elke avond/nu', 'gisteren/vroeger', 'h', 'k'],
    ['gamen', 'online', 'elke avond/nu', 'gisteren/vorige week', 'h', 'k'],
    ['checken', 'de berichten', 'nu/elke ochtend', 'gisteren/vorige week'],
    ['coachen', 'het voetbalteam', 'elke zaterdag/nu', 'vorig jaar/vroeger'],
    ['surfen', 'op de golven', 'vandaag/elke zomer', 'gisteren/vorige zomer'],
    ['scannen', 'de boodschappen', 'nu/altijd', 'gisteren/vorige week'],
    ['streamen', 'de wedstrijd', 'vanavond/nu', 'gisteren/vorige week'],
    ['appen', 'met oma', 'nu/elke dag', 'gisteren/vorige week'],
    ['joggen', 'in het bos', 'elke ochtend/nu', 'gisteren/vroeger'],
    ['relaxen', 'op de bank', 'nu/vanavond', 'gisteren/vorig weekend'],
    ['faken', 'een blessure', 'nu/vaak', 'gisteren/vroeger', 'h', 'k'],
    ['timen', 'de ronde', 'nu/altijd', 'gisteren/vorige week']
  ]);
  /* be-, ge-, her-, ont-, ver-: persoonsvorm of voltooid deelwoord */
  var FR_PV = raam([
    ['verhuizen', 'naar Spanje', 'morgen/volgende maand', 'vorige maand/vorig jaar', 'z'],
    ['vertellen', 'een spannend verhaal', 'nu/vanavond', 'gisteren/vorige week'],
    ['betalen', 'de rekening', 'nu/vandaag', 'gisteren/vorige week'],
    ['bestellen', 'een pizza', 'vanavond/nu', 'gisteren/vorige week'],
    ['herhalen', 'de woordjes', 'vandaag/nu', 'gisteren/vorige week'],
    ['verdienen', 'geld met oppassen', 'nu/elke week', 'vorig jaar/vorige maand'],
    ['beantwoorden', 'de vraag', 'nu/vandaag', 'gisteren/vorige week'],
    ['verbranden', 'het oude papier', 'nu/vandaag', 'gisteren/vorige week'],
    ['vertrouwen', 'het verhaal niet', 'nu/nog steeds', 'eerst/vroeger'],
    ['beloven', 'beterschap', 'nu/vandaag', 'gisteren/vorige week'],
    ['geloven', 'het verhaal van de buurman', 'nu/meteen', 'eerst/vroeger'],
    ['herkennen', 'de stem van de juf', 'nu/meteen', 'gisteren/meteen'],
    ['verbeteren', 'het wereldrecord', 'vandaag/morgen', 'gisteren/vorig jaar'],
    ['bewaren', 'de kaartjes in een doos', 'altijd/nu', 'vroeger/vorig jaar'],
    ['verzamelen', 'voetbalplaatjes', 'nu/elke week', 'vroeger/vorig jaar'],
    ['verwarmen', 'de soep', 'nu/vanavond', 'gisteren/vorige week'],
    ['verbouwen', 'de keuken', 'nu/deze maand', 'vorig jaar/vorige maand'],
    ['bezorgen', 'de pakketjes', 'vandaag/elke dag', 'gisteren/vorige week'],
    ['versieren', 'de klas', 'vandaag/morgen', 'gisteren/vorige week'],
    ['vertalen', 'de tekst', 'nu/vandaag', 'gisteren/vorige week'],
    ['verhuren', 'het huis aan toeristen', 'nu/elke zomer', 'vorig jaar/vorige zomer'],
    ['verklaren', 'de uitslag', 'nu/morgen', 'gisteren/vorige week']
  ]);
  /* gebeuren heeft een ding als onderwerp: eigen zinnen (pv of vd) */
  var GEBEUR = [
    ['Wat {G} hier?', 'pv', 'wat'], ['Wat is er gisteren {G}?', 'vd', 'er'], ['Dat {G} elke dag.', 'pv', 'dat'],
    ['Er is iets geks {G}.', 'vd', 'iets geks'], ['Er {G} iets geks.', 'pv', 'iets geks'], ['Het ongeluk is vlak voor de school {G}.', 'vd', 'het ongeluk'],
    ['Zoiets {G} niet vaak.', 'pv', 'zoiets'], ['Wat er ook {G}, ik blijf rustig.', 'pv', 'wat'], ['Het is allemaal heel snel {G}.', 'vd', 'het'],
    ['Wanneer is dat {G}?', 'vd', 'dat'] ];
  /* scheidbare werkwoorden: heel, deeltje, kern, rest, nu, toen, hulpww */
  var FR_SCH = [
    ['opbellen', 'op', 'bellen', 'oma', 'vanavond/morgen', 'gisteren/vorige week', 'h'],
    ['aanbieden', 'aan', 'bieden', 'hulp', 'nu/vandaag', 'gisteren/vorige week', 'h'],
    ['opruimen', 'op', 'ruimen', 'de kamer', 'vandaag/nu', 'gisteren/vorige week', 'h'],
    ['afmaken', 'af', 'maken', 'het werkstuk', 'vandaag/morgen', 'gisteren/vorige week', 'h'],
    ['meedoen', 'mee', 'doen', 'aan de wedstrijd', 'morgen/vandaag', 'gisteren/vorig jaar', 'h'],
    ['uitleggen', 'uit', 'leggen', 'de som', 'nu/morgen', 'gisteren/vorige week', 'h'],
    ['opzoeken', 'op', 'zoeken', 'het woord in het woordenboek', 'nu/vandaag', 'gisteren/vorige week', 'h'],
    ['inleveren', 'in', 'leveren', 'het werkstuk', 'morgen/vandaag', 'gisteren/vorige week', 'h'],
    ['aankomen', 'aan', 'komen', 'in Parijs', 'morgen/vanavond', 'gisteren/vorige week', 'z'],
    ['opstaan', 'op', 'staan', 'om zeven uur', 'elke dag/morgen', 'gisteren/vroeger', 'z'],
    ['afwassen', 'af', 'wassen', 'na het eten', 'vandaag/elke avond', 'gisteren/vorige week', 'h'],
    ['aanzetten', 'aan', 'zetten', 'de computer', 'nu/elke ochtend', 'gisteren/vorige week', 'h'],
    ['invullen', 'in', 'vullen', 'het formulier', 'nu/vandaag', 'gisteren/vorige week', 'h'],
    ['terugkomen', 'terug', 'komen', 'uit Spanje', 'morgen/volgende week', 'gisteren/vorige week', 'z'],
    ['meenemen', 'mee', 'nemen', 'een paraplu', 'vandaag/morgen', 'gisteren/vorige week', 'h'],
    ['schoonmaken', 'schoon', 'maken', 'de keuken', 'vandaag/morgen', 'gisteren/vorige week', 'h'],
    ['uitnodigen', 'uit', 'nodigen', 'de hele klas', 'morgen/nu', 'gisteren/vorige week', 'h'],
    ['ophalen', 'op', 'halen', 'oma van het station', 'vanavond/morgen', 'gisteren/vorige week', 'h'],
    ['afspreken', 'af', 'spreken', 'met vrienden', 'morgen/vanavond', 'gisteren/vorige week', 'h'],
    ['uitgeven', 'uit', 'geven', 'veel geld', 'nu/elke maand', 'vorige maand/gisteren', 'h'],
    ['aantrekken', 'aan', 'trekken', 'een warme jas', 'vandaag/nu', 'gisteren/vorige week', 'h'],
    ['aanbellen', 'aan', 'bellen', 'bij de buren', 'nu/morgen', 'gisteren/vorige week', 'h']
  ].map(function(a){ return { w:a[0], d:a[1], k:a[2], x:a[3], nu:a[4].split('/'), toen:a[5].split('/'), aux:a[6], s:'a' }; });
  /* vaste samenstellingen: voetballen */
  var FR_VAST = raam([
    ['voetballen', 'op het plein', 'elke pauze/nu', 'gisteren/vroeger', 'h', 'k'],
    ['stofzuigen', 'de woonkamer', 'vandaag/elke zaterdag', 'gisteren/vorige week'],
    ['glimlachen', 'naar de camera', 'nu/altijd', 'gisteren/vorige week'],
    ['beeldbellen', 'met oma', 'elke zondag/nu', 'gisteren/vorige week'],
    ['handballen', 'bij een club', 'elke zaterdag/nu', 'vroeger/vorig jaar', 'h', 'k'],
    ['korfballen', 'in de gymles', 'vandaag/elke week', 'gisteren/vorige week', 'h', 'k'],
    ['zonnebaden', 'op het strand', 'nu/elke middag', 'gisteren/vorige zomer'],
    ['raadplegen', 'het woordenboek', 'nu/vaak', 'gisteren/vorige week'],
    ['stijldansen', 'op de bruiloft', 'vanavond/vandaag', 'gisteren/vorige week'],
    ['basketballen', 'in het park', 'elke middag/nu', 'gisteren/vroeger', 'h', 'k'],
    ['rangschikken', 'de boeken op kleur', 'nu/vandaag', 'gisteren/vorige week'],
    ['beeldhouwen', 'in de kunstles', 'vandaag/nu', 'gisteren/vorige week', 'h', 'k']
  ]);
  var FR_OTT = FR_ALG.concat(FR_D, FR_T);
  var FR_VERL = FR_OTT.filter(function(F){ return !F.o; });
  function zwakF(F){ var V = LEX[F.w]; return V.zwak; }
  function sterkF(F){ var V = LEX[F.w]; return V.sterk && V.vt !== nepZwak(V).vt; }

  /* een zin uit een raamwerk: tijd 'ott' of 'ovt' (gat = persoonsvorm) of 'vd' (gat = voltooid deelwoord);
     volg 'n' gewoon, 'i' tijdwoord vooraan, 'v' vraag */
  function zinF(F, o, tijd, volg, w){
    var tw = kies(tijd === 'ott' ? F.nu : F.toen), inv = volg !== 'n';
    var O = { t:o.t, rol:'o' }, G = { t:GAT(w || F.w), rol:'gat' }, T = { t:tw, rol:'tw' }, X = { t:F.x, rol:'x' }, P;
    if (tijd === 'vd'){
      var A = { t:auxV(F.aux, o.p, inv), rol:'aux' };
      P = volg === 'n' ? [O, A, T, X, G] : volg === 'i' ? [T, A, O, X, G] : [A, O, T, X, G];
    } else P = volg === 'n' ? [O, G, T, X] : volg === 'i' ? [T, G, O, X] : [G, O, T, X];
    var b = bouw(P, volg === 'v' ? '?' : '.'); b.tw = tw; b.inv = inv; b.aux = A ? A.t : null; return b;
  }
  function volgorde(p){ var r = Math.random(); return r < (p == null ? .5 : p) ? 'n' : r < .8 ? 'i' : 'v'; }
  var CTX = 'Vul de goede vorm van het werkwoord in.';

  /* ---------- de tegenwoordige tijd ---------- */
  var RS = 'alleen de stam', RT = 'stam + t', RH = 'het hele werkwoord';
  function regel(p, inv){ return p === '1' || p === 'geb' ? RS : p === 'mv' ? RH : p === '2' && inv ? RS : RT; }
  function wieIs(o){
    if (o.p === '3' && !/^(hij|zij)$/.test(o.t)) return o.t + ' (één persoon: hij of zij)';
    if (o.p === 'mv' && !/^(wij|we|jullie)$/.test(o.t)) return o.t + ' (meer personen)';
    return o.t;
  }
  function regelHint(o, inv){
    if (o.p === '1') return 'Het onderwerp is ik. Bij ik schrijf je alleen de stam, ook als je een t hoort.';
    if (o.p === '2') return inv ? 'Er staat ' + o.t + ' achter de persoonsvorm. Dan valt de t weg.' : 'Er staat ' + o.t + ' voor de persoonsvorm. Dan is het stam + t.';
    if (o.p === 'u') return 'Het onderwerp is u. Bij u komt er altijd een t achter de stam, ook als u achter de persoonsvorm staat.';
    if (o.p === 'mv') return 'Het onderwerp is ' + wieIs(o) + '. Bij meer personen neem je het hele werkwoord.';
    return 'Het onderwerp is ' + wieIs(o) + '. Dan schrijf je stam + t, ook als het onderwerp achter de persoonsvorm staat.';
  }
  function regelFout(o, inv){
    var f = {};
    if (o.p === '1') f[RT] = 'Bij ik komt er nooit een t achter de stam.';
    if (o.p === '2' && inv) f[RT] = 'Kijk waar ' + o.t + ' staat: achter de persoonsvorm. Dan geen t.';
    if (o.p === '2' && !inv) f[RS] = cap(o.t) + ' staat voor de persoonsvorm. Dan blijft de t.';
    if (o.p === 'u' && inv) f[RS] = 'De t valt alleen weg bij jij en je. Bij u blijft hij staan.';
    if (o.p === '3' && inv) f[RS] = 'De t valt alleen weg bij jij en je, niet bij ' + o.t + '.';
    if (o.p === 'mv') f[RT] = cap(o.t) + ': dat zijn meer personen. Dan neem je het hele werkwoord.';
    else f[RH] = 'Het hele werkwoord gebruik je alleen bij meer personen.';
    return f;
  }
  function stRegel(o, inv, hint){
    return keuze('Het onderwerp is ' + o.t + '. Welke regel past?', regel(o.p, inv), [RS, RT, RH], hint || regelHint(o, inv), { fout:regelFout(o, inv) });
  }
  function vormFout(V, o, inv, goed){
    var fout = {}, s = V.s, r = regel(o.p, inv), lijst = [].concat(goed);
    function zet(k, v){ k = k.toLowerCase(); if (lijst.indexOf(k) < 0 && !fout[k]) fout[k] = v; }
    if (V.t3) zet(s + 't', 'Bijna: de a klinkt lang, dus schrijf ' + V.t3 + '.');
    if (eind(s, 't')) zet(s + 't', 'Twee t\'s aan het eind schrijf je nooit. De stam ' + s + ' eindigt al op een t.');
    if (r === RT && !eind(s, 't')) zet(s, 'Je vergat de t achter de stam.' + (eind(s, 'd') ? ' Ook na een d komt er een t: dt.' : ''));
    if (r === RS) zet(s + 't', o.p === '1' ? 'Bij ik komt er geen t achter de stam.' : o.p === 'geb' ? 'Bij een bevel schrijf je alleen de stam.' : cap(o.t) + ' staat achter de persoonsvorm. Dan valt de t weg.');
    if (eind(s, 'd')) zet(s.slice(0, -1) + 't', 'De stam is ' + s + ', met een d. Die d blijft staan.');
    if (r !== RH) zet(V.h, 'Het hele werkwoord gebruik je alleen bij meer personen.');
    else zet(eind(s, 't') ? s : s + 't', cap(o.t) + ': dat zijn meer personen. Neem het hele werkwoord.');
    return fout;
  }
  function vormHint(V, o, inv){
    var r = regel(o.p, inv), s = V.s;
    if (r === RS) return 'De stam van ' + V.h + ' is ' + s + '. Daar komt niets achter.';
    if (r === RH) return 'Neem het hele werkwoord: ' + V.h + '.';
    if (eind(s, 't')) return 'De stam ' + s + ' eindigt al op een t. Er komt geen tweede t bij.';
    if (V.t3) return 'Stam ' + s + ' + t. Schrijf ' + V.t3 + ', met aa, zodat de klank lang blijft.';
    return 'Stam ' + s + ' + t.' + (eind(s, 'd') ? ' Je hoort het niet, maar je schrijft wel dt.' : '');
  }
  function stVormOtt(V, o, inv, tekst){
    var a = ottAlle(V, o.p, inv);
    return invul(tekst || 'Dus de goede vorm is', a, vormHint(V, o, inv), { fout:vormFout(V, o, inv, a) });
  }
  function stOnderwerp(b, F, o){
    var andere = [b.tw, F.x].filter(function(t){ return t && t !== o.t; });
    return keuze('Wie of wat doet iets in deze zin? Dat is het onderwerp.', o.t, andere,
      'Vraag: wie of wat doet hier iets? Een tijd zoals "' + b.tw + '" is nooit het onderwerp.');
  }
  function woordOtt(V, o, inv){
    var r = regel(o.p, inv);
    if (r === RH) return R.teken.woord([{ t:V.h, k:3, label:'hele werkwoord' }]);
    if (r === RT && V.t3) return R.teken.woord([{ t:V.t3.slice(0, -1), k:3, label:'stam, lang' }, { t:'t', k:4, label:'+ t' }]);
    if (r === RT && !eind(V.s, 't')) return R.teken.woord([{ t:V.s, k:3, label:'stam' }, { t:'t', k:4, label:'+ t' }]);
    return R.teken.woord([{ t:V.s, k:3, label:'stam' }]);
  }
  /* een opgave in de tegenwoordige tijd; plan: welke stappen, in welke volgorde */
  function opgOtt(F, o, volg, plan, ctx){
    var V = LEX[F.w], b = zinF(F, o, 'ott', volg), inv = b.inv, st = [];
    var L = ott(LEX.lopen, o.p, inv);
    plan.forEach(function(k){
      if (k === 'o') st.push(stOnderwerp(b, F, o));
      else if (k === 'plek') st.push(keuze('Staat ' + o.t + ' voor of achter de persoonsvorm?', inv ? 'achter de persoonsvorm' : 'voor de persoonsvorm',
        [inv ? 'voor de persoonsvorm' : 'achter de persoonsvorm'], 'Kijk in de zin: staat ' + o.t + ' voor het gat of erna?'));
      else if (k === 'isjij') st.push(keuze('Is het onderwerp jij of je?', o.p === '2' ? 'ja' : 'nee', [o.p === '2' ? 'nee' : 'ja'],
        'Het onderwerp is ' + o.t + '. Alleen bij jij en je valt de t weg als ze achter de persoonsvorm staan.'));
      else if (k === 'getal') st.push(keuze('Gaat "' + o.t + '" over één persoon, of over meer?', o.p === 'mv' ? 'meer dan één' : 'één', [o.p === 'mv' ? 'één' : 'meer dan één'],
        'Tel de personen in "' + o.t + '". Wij, we, jullie en twee namen met "en" zijn altijd meer personen.'));
      else if (k === 'regel') st.push(stRegel(o, inv, plan.indexOf('lopen') >= 0 ? 'Je zei ' + L + '. ' + (L === 'loopt' ? 'Daar hoor je een t: dus stam + t.' : L === 'loop' ? 'Daar hoor je geen t: dus alleen de stam.' : 'Dat is het hele werkwoord.') : null));
      else if (k === 'stam') st.push(stStam(V));
      else if (k === 'tstam') st.push(keuze('De stam van ' + V.h + ' is ' + V.s + '. Eindigt die al op een t?', eind(V.s, 't') ? 'ja' : 'nee', [eind(V.s, 't') ? 'nee' : 'ja'],
        'Kijk naar de laatste letter van ' + V.s + '.', { waarom:eind(V.s, 't') ? 'Dan komt er nooit nog een t bij: hij ' + V.s + ', niet ' + V.s + 't.' : '' }));
      else if (k === 'lopen') st.push(keuze('Zet lopen op de plek van het gat. Wat zeg je dan?', L, ['loop', 'loopt', 'lopen'],
        'Lees de zin hardop met loop, loopt en lopen. Welke klinkt goed bij ' + o.t + (inv ? ' achter het werkwoord' : '') + '?',
        { waarom:'Bij lopen hoor je meteen of er een t achter komt.' }));
      else if (k === 'vorm') st.push(stVormOtt(V, o, inv));
    });
    var io = plan.indexOf('o'), iw = Math.max(plan.indexOf('stam'), plan.indexOf('regel'), plan.indexOf('tstam')), vorm = [].concat(ottAlle(V, o.p, inv))[0];
    return { context:ctx || CTX, vraag:b.tekst, stappen:st, beeld:function(n){
      var merk = { gat:{ k:2, label:'persoonsvorm' } };
      if (io >= 0 ? n > io : n > 0) merk.o = { k:1, label:'onderwerp' };
      if (n >= st.length) merk.gat.t = vorm;
      return tekenZin(b, merk) + (iw >= 0 && n > iw ? woordOtt(V, o, inv) : '');
    } };
  }

  /* ---------- de verleden tijd ---------- */
  var KOF = '\'t kofschip: t, k, f, s, ch en p';
  function letterHint(V){ var b = V.h.slice(0, -2); return 'Haal -en van ' + V.h + ' af: ' + b + '. Kijk naar de laatste letter' + (V.letter === 'ch' ? ' (ch telt als één klank)' : '') + '.'; }
  function teDe(V, p, ezel){
    var mv = p === 'mv', g = (V.kof ? '-te' : '-de') + (mv ? 'n' : ''), a = (V.kof ? '-de' : '-te') + (mv ? 'n' : '');
    var hint = V.eng ? 'Luister naar de laatste klank van ' + V.s + ': ' + V.klank + '. ' + (V.kof ? 'Die klank zit in \'t kofschip, dus -te.' : 'Die klank zit niet in \'t kofschip, dus -de.')
      : 'In ' + V.h + ' staat voor -en een ' + V.letter + '. ' + (V.kof ? 'Die zit in ' + (ezel || '\'t kofschip') + ', dus -te.' : 'Die zit niet in ' + (ezel || '\'t kofschip') + ', dus -de.');
    var f = {}; f[a] = V.kof ? 'De ' + (V.eng ? 'klank ' + V.klank : V.letter) + ' zit wel in \'t kofschip.' : 'De ' + (V.eng ? 'klank ' + V.klank : V.letter) + ' zit niet in \'t kofschip. Kijk naar het hele werkwoord, niet naar de stam.';
    return keuze('Komt er ' + (mv ? '-ten of -den' : '-te of -de') + ' achter de stam?', g, [a], hint, { fout:f });
  }
  function woordOvt(V, p){ var u = (V.kof ? 'te' : 'de') + (p === 'mv' ? 'n' : ''); return R.teken.woord([{ t:V.s, k:3, label:'stam' }, { t:u, k:4, label:'+ ' + u }]); }
  function vormOvtHint(V, p){
    if (V.sterk) return 'Een sterk werkwoord: de klank verandert. Zeg hardop: ' + (p === 'mv' ? 'gisteren ... wij' : 'gisteren ... ik') + '. Je zegt niet ' + ovt(nepZwak(V), p) + '.';
    var u = (V.kof ? 'te' : 'de') + (p === 'mv' ? 'n' : '');
    return 'Stam ' + V.s + ' + ' + u + '.' + ((eind(V.s, 't') && V.kof) || (eind(V.s, 'd') && !V.kof) ? ' Schrijf de ' + V.s.slice(-1) + ' van de stam en de ' + u.charAt(0) + ' van ' + u + ' allebei.' : '');
  }
  function vormOvtFout(V, p){
    var f = {}, goed = ovt(V, p), mv = p === 'mv';
    function zet(k, v){ if (k && k !== goed && !f[k]) f[k] = v; }
    if (V.sterk){ zet(ovt(nepZwak(V), p), 'Dit is een sterk werkwoord: de klank verandert, er komt geen -te of -de achter.'); zet(mv ? V.vt : V.vtm, mv ? 'Bij meer personen komt er nog -en achter.' : 'Dat is het meervoud. Bij één persoon: ' + V.vt + '.'); return f; }
    var ander = V.s + (V.kof ? 'de' : 'te') + (mv ? 'n' : '');
    zet(ander, V.kof ? 'De ' + V.letter + ' zit in \'t kofschip: dan -te.' : 'Kijk naar het hele werkwoord: ' + V.h + '. De ' + V.letter + ' zit niet in \'t kofschip, dus -de.');
    if ((eind(V.s, 't') && V.kof) || (eind(V.s, 'd') && !V.kof)) zet(V.s + 'e' + (mv ? 'n' : ''), 'Er mist een letter: stam ' + V.s + ' + ' + (V.kof ? 'te' : 'de') + (mv ? 'n' : '') + '.');
    zet(mv ? V.vt : V.vtm, mv ? 'Bij meer personen komt er een n achter: -' + (V.kof ? 'ten' : 'den') + '.' : 'Bij één persoon geen n erachter.');
    zet(V.vt + 't', 'In de verleden tijd komt er nooit een extra t achter, ook niet bij jij of hij.');
    return f;
  }
  function stVormOvt(V, p){ return invul('Dus de goede vorm is', ovt(V, p), vormOvtHint(V, p), { fout:vormOvtFout(V, p) }); }
  function stTijd(b, tijd){
    var g = tijd === 'ott' ? 'tegenwoordige tijd' : 'verleden tijd';
    return keuze('Staat deze zin in de tegenwoordige of de verleden tijd?', g, [tijd === 'ott' ? 'verleden tijd' : 'tegenwoordige tijd'],
      'Kijk naar het tijdwoord "' + b.tw + '". ' + (tijd === 'ott' ? 'Dat gaat over nu, altijd of straks.' : 'Dat is al voorbij.'));
  }
  /* plan: tijd, o, getal, stam, letter, kof, fok, tede, sterk, sz, vorm */
  function opgOvt(F, o, volg, plan, ctx){
    var V = LEX[F.w], b = zinF(F, o, 'ovt', volg), st = [], p = o.p;
    var nep = ovt(nepZwak(V), p), echt = ovt(V, p);
    plan.forEach(function(k){
      if (k === 'tijd') st.push(stTijd(b, 'ovt'));
      else if (k === 'o') st.push(stOnderwerp(b, F, o));
      else if (k === 'getal') st.push(keuze('Gaat "' + o.t + '" over één persoon, of over meer?', p === 'mv' ? 'meer dan één' : 'één', [p === 'mv' ? 'één' : 'meer dan één'],
        'Tel de personen in "' + o.t + '". Bij meer personen komt er in de verleden tijd een n achter.'));
      else if (k === 'stam') st.push(stStam(V));
      else if (k === 'letter') st.push(invul('Welke letter staat in ' + V.h + ' voor -en?', V.letter, letterHint(V), { fout:V.letter !== V.s.slice(-1) ? (function(){ var f = {}; f[V.s.slice(-1)] = 'Dat is de laatste letter van de stam. Kijk naar het hele werkwoord: ' + V.h + '.'; return f; })() : {} }));
      else if (k === 'kof' || k === 'fok'){
        var naam = k === 'kof' ? '\'t kofschip' : '\'t fokschaap';
        st.push(keuze('Zit de ' + V.letter + ' in ' + naam + '?', V.kof ? 'ja' : 'nee', [V.kof ? 'nee' : 'ja'],
          (k === 'kof' ? KOF : '\'t fokschaap: t, f, k, s, ch en p') + '. Staat de ' + V.letter + ' daarin?',
          { waarom:V.kof ? 'Ja: dan komt er -te achter de stam.' : 'Nee: dan komt er -de achter de stam.' }));
      }
      else if (k === 'tede') st.push(teDe(V, p, plan.indexOf('fok') >= 0 ? '\'t fokschaap' : null));
      else if (k === 'sterk') st.push(keuze('Lees de zin hardop met allebei de vormen. Welke klinkt goed?', echt, [nep],
        'Een sterk werkwoord krijgt geen -te of -de. De klinker verandert. Zeg de hele zin hardop met gisteren erbij.'));
      else if (k === 'sz') st.push(keuze('Is ' + F.w + ' een zwak of een sterk werkwoord?', V.sterk ? 'sterk: de klank verandert' : 'zwak: stam + te of de', [V.sterk ? 'zwak: stam + te of de' : 'sterk: de klank verandert'],
        'Zeg hardop: gisteren ... ' + (p === 'mv' ? 'wij' : 'ik') + '. ' + (V.sterk ? 'Hoor je ' + nep + '? Nee, de klank verandert.' : 'Je zegt stam + te of de. De klank blijft hetzelfde.')));
      else if (k === 'vorm') st.push(stVormOvt(V, p));
    });
    var io = plan.indexOf('o'), iw = Math.max(plan.indexOf('tede'), plan.indexOf('kof'), plan.indexOf('fok'));
    return { context:ctx || 'Zet het werkwoord in de verleden tijd.', vraag:b.tekst, stappen:st, beeld:function(n){
      var merk = { gat:{ k:2, label:'persoonsvorm' } };
      if (io < 0 || n > io) merk.o = { k:1, label:'onderwerp' };
      if (n >= st.length) merk.gat.t = echt;
      return tekenZin(b, merk) + (V.zwak && iw >= 0 && n > iw ? woordOvt(V, p) : '');
    } };
  }

  /* ---------- het voltooid deelwoord ---------- */
  var VV = /^(be|ge|her|ont|ver)/;
  function voorvoegsel(V){ var m = VV.exec(V.h); return V.vv && m ? m[1] : null; }
  function geHint(V){
    var pre = voorvoegsel(V);
    if (pre) return V.h + ' begint met ' + pre + '-. Dan komt er geen ge- voor.';
    if (/^bellen$/.test(V.h)) return 'Be- is hier geen voorvoegsel: "llen" is geen werkwoord. Dus wel ge-.';
    if (/^(verven)$/.test(V.h)) return 'Ver- is hier geen voorvoegsel: "ven" is geen werkwoord. Dus wel ge-.';
    if (/^(beven)$/.test(V.h)) return 'Be- is hier geen voorvoegsel: "ven" is geen werkwoord. Dus wel ge-.';
    return V.h + ' begint niet met be-, ge-, her-, ont- of ver-. Dus wel ge-.';
  }
  function tdKeuze(V, ezel){
    var g = V.kof ? 't' : 'd';
    var hint = V.eng ? 'Luister naar de laatste klank van ' + V.s + ': ' + V.klank + '. ' + (V.kof ? 'Die zit in \'t kofschip: t.' : 'Die zit niet in \'t kofschip: d.')
      : 'In ' + V.h + ' staat voor -en een ' + V.letter + '. ' + (V.kof ? 'Die zit in ' + (ezel || '\'t kofschip') + ': t.' : 'Die zit niet in ' + (ezel || '\'t kofschip') + ': d.');
    var f = {}; f[V.kof ? 'd' : 't'] = V.kof ? 'De ' + (V.eng ? 'klank ' + V.klank : V.letter) + ' zit wel in \'t kofschip.' : 'De ' + (V.eng ? 'klank ' + V.klank : V.letter) + ' zit niet in \'t kofschip.';
    return keuze('Komt er een t of een d achter de stam?', g, [V.kof ? 'd' : 't'], hint, { fout:f });
  }
  function vdHint(V){
    if (V.sterk) return 'Zeg hardop: ik heb ... of ik ben ... Een sterk werkwoord eindigt meestal op -en.';
    var pre = voorvoegsel(V), u = V.kof ? 't' : 'd', dubbel = V.s.slice(-1) === u;
    return (pre ? 'Geen ge- (' + pre + '-), ' : V.eng ? 'ge + ' : 'ge + ') + V.s + (dubbel ? ': de stam eindigt al op een ' + u + ', er komt er geen tweede bij.' : ' + ' + u + '.');
  }
  function vdFout(V){
    var f = {}, goed = [].concat(vdAlle(V));
    function zet(k, v){ if (k && goed.indexOf(k) < 0 && !f[k]) f[k] = v; }
    if (V.sterk){ zet(nepZwak(V).vd, 'Dit is een sterk werkwoord: ' + V.vd + '. Zeg het hardop.'); return f; }
    var u = V.kof ? 't' : 'd', a = V.kof ? 'd' : 't', basis = V.vd.slice(0, V.vd.length - (V.s.slice(-1) === u ? 0 : 1));
    if (V.s.slice(-1) !== u) zet(basis + a, V.kof ? 'Kijk naar ' + (V.eng ? 'de klank ' + V.klank : 'de ' + V.letter) + ': die zit in \'t kofschip, dus t.' : 'Kijk naar ' + (V.eng ? 'de klank ' + V.klank : 'het hele werkwoord ' + V.h) + ': ' + (V.eng ? V.klank : V.letter) + ' zit niet in \'t kofschip, dus d.');
    if (voorvoegsel(V)) zet('ge' + V.vd, 'Bij ' + voorvoegsel(V) + '- komt er geen ge- voor.');
    else if (!V.eng) zet(V.vd.replace(/^ge/, ''), 'Je vergat ge- ervoor.');
    if (V.s.slice(-1) === u) zet(V.vd + u, 'De stam ' + V.s + ' eindigt al op een ' + u + '. Twee keer schrijf je hem niet.');
    return f;
  }
  function stVormVd(V){ return invul('Dus het voltooid deelwoord is', vdAlle(V), vdHint(V), { fout:vdFout(V) }); }
  function stPvVd(soort, b){
    return keuze('Wat moet er op de plek van het gat: de persoonsvorm of een voltooid deelwoord?', soort === 'vd' ? 'voltooid deelwoord' : 'persoonsvorm', [soort === 'vd' ? 'persoonsvorm' : 'voltooid deelwoord'],
      soort === 'vd' ? 'Er staat al een persoonsvorm: ' + (b.aux || 'een vorm van hebben of zijn') + '. Het werkwoord achteraan is dan het voltooid deelwoord.' : 'Er staat geen ander werkwoord in de zin. Dan is het gat de persoonsvorm.');
  }
  /* plan: pvvd, stam, ge, td, sterk, vorm */
  function opgVd(F, o, volg, plan, ctx){
    var V = LEX[F.w], b = zinF(F, o, 'vd', volg), st = [];
    plan.forEach(function(k){
      if (k === 'pvvd') st.push(stPvVd('vd', b));
      else if (k === 'stam') st.push(stStam(V));
      else if (k === 'ge') st.push(keuze('Komt er ge- voor het voltooid deelwoord van ' + V.h + '?', voorvoegsel(V) ? 'nee' : 'ja', [voorvoegsel(V) ? 'ja' : 'nee'], geHint(V),
        { waarom:voorvoegsel(V) ? 'Be-, ge-, her-, ont- en ver- krijgen nooit nog ge- ervoor.' : '' }));
      else if (k === 'td') st.push(tdKeuze(V));
      else if (k === 'sterk') st.push(keuze('Lees de zin hardop met allebei de vormen. Welke klinkt goed?', V.vd, [nepZwak(V).vd], 'Een sterk werkwoord krijgt geen t of d achteraan, maar eindigt meestal op -en. Vaak verandert de klinker ook.'));
      else if (k === 'vorm') st.push(stVormVd(V));
    });
    return { context:ctx || CTX, vraag:b.tekst, stappen:st, beeld:function(n){
      var merk = { gat:{ k:2, label:'voltooid deelwoord' }, aux:{ k:5, label:'persoonsvorm' } };
      if (n >= st.length) merk.gat.t = V.vd;
      var h = tekenZin(b, merk), it = plan.indexOf('td');
      if (V.zwak && it >= 0 && n > it){ var u = V.kof ? 't' : 'd', pre = V.eng || !voorvoegsel(V) ? 'ge' : ''; h += R.teken.woord([].concat(pre ? [{ t:pre, k:5, label:'ge' }] : [], [{ t:V.s, k:3, label:'stam' }], V.s.slice(-1) === u ? [] : [{ t:u, k:4, label:'+ ' + u }])); }
      return h;
    } };
  }

  /* ---------- het fundament: zinnen ---------- */
  /* onderwerp, pv nu, pv vroeger, hele werkwoord, zinsdelen (^ = kan vooraan), wie (1) of wat (0), 2 = er staat nog een werkwoord */
  var BASIS = [
    ['mijn broer', 'speelt', 'speelde', 'spelen', '^elke zaterdag|voetbal', 1], ['Sanne', 'fietst', 'fietste', 'fietsen', '^elke dag|naar school', 1],
    ['de hond', 'blaft', 'blafte', 'blaffen', '^de hele nacht', 0], ['wij', 'eten', 'aten', 'eten', '^op vrijdag|altijd|patat', 1],
    ['de bus', 'rijdt', 'reed', 'rijden', '^vaak|te laat', 0], ['mijn opa', 'leest', 'las', 'lezen', '^elke ochtend|de krant', 1],
    ['jullie', 'maken', 'maakten', 'maken', 'veel lawaai', 1], ['ik', 'heb', 'had', 'hebben', 'mijn huiswerk|al|gemaakt', 1, 2],
    ['de kinderen', 'spelen', 'speelden', 'spelen', '^in het park', 1], ['het meisje', 'zingt', 'zong', 'zingen', 'een mooi lied', 1],
    ['de leraar', 'schrijft', 'schreef', 'schrijven', 'de som|^op het bord', 1], ['mijn ouders', 'werken', 'werkten', 'werken', '^in een ziekenhuis', 1],
    ['de zon', 'schijnt', 'scheen', 'schijnen', '^de hele dag', 0], ['Daan', 'wint', 'won', 'winnen', '^altijd|met schaken', 1],
    ['onze kat', 'slaapt', 'sliep', 'slapen', '^op de bank', 0], ['mijn zus', 'kan', 'kon', 'kunnen', 'heel goed|tekenen', 1, 2],
    ['de trein', 'vertrekt', 'vertrok', 'vertrekken', '^om acht uur', 0], ['wij', 'gaan', 'gingen', 'gaan', '^vaak|naar de bioscoop', 1],
    ['het water', 'kookt', 'kookte', 'koken', '^in de pan', 0], ['de voetballers', 'trainen', 'trainden', 'trainen', '^twee keer per week', 1],
    ['Lisa', 'heeft', 'had', 'hebben', 'een nieuwe telefoon', 1], ['mijn vader', 'kookt', 'kookte', 'koken', '^elke avond|het eten', 1],
    ['de vogels', 'fluiten', 'floten', 'fluiten', '^in de tuin', 0], ['jij', 'bent', 'was', 'zijn', 'altijd|op tijd', 1],
    ['de juf', 'geeft', 'gaf', 'geven', 'ons|veel huiswerk', 1], ['het kind', 'huilt', 'huilde', 'huilen', 'om zijn knuffel', 1],
    ['mijn vrienden', 'wonen', 'woonden', 'wonen', '^in dezelfde straat', 1], ['mijn moeder', 'drinkt', 'dronk', 'drinken', '^elke ochtend|koffie', 1],
    ['de leerlingen', 'schrijven', 'schreven', 'schrijven', 'een verhaal', 1], ['Noah', 'wil', 'wilde', 'willen', '^later|piloot|worden', 1, 2],
    ['de bakker', 'bakt', 'bakte', 'bakken', '^elke nacht|vers brood', 1], ['we', 'moeten', 'moesten', 'moeten', '^elke dag|een uur|lezen', 1, 2],
    ['mijn broertje', 'speelt', 'speelde', 'spelen', 'graag|met lego', 1], ['de oude man', 'loopt', 'liep', 'lopen', 'met een stok', 1],
    ['het meisje', 'heeft', 'had', 'hebben', 'haar fiets|^in de schuur|gezet', 1, 2], ['mijn tante', 'woont', 'woonde', 'wonen', '^in Rotterdam', 1],
    ['de honden', 'rennen', 'renden', 'rennen', '^door het park', 0], ['ik', 'luister', 'luisterde', 'luisteren', '^vaak|naar muziek', 1],
    ['de regen', 'valt', 'viel', 'vallen', '^op het dak', 0], ['Emma', 'belt', 'belde', 'bellen', '^elke avond|haar oma', 1],
    ['de winkel', 'sluit', 'sloot', 'sluiten', '^om zes uur', 0], ['mijn neef', 'zwemt', 'zwom', 'zwemmen', '^elke week|in het meer', 1]
  ];
  function delenVan(r){ var front = -1; var d = r[4].split('|').map(function(c, i){ if (c.charAt(0) === '^'){ c = c.slice(1); if (front < 0) front = i; } return c; }); d.front = front; return d; }
  function basisZin(r, tijd, voorop){
    var d = delenVan(r), pv = tijd === 'ovt' ? r[2] : r[1], P;
    if (voorop && d.front >= 0) P = [{ t:d[d.front], rol:'z' + d.front }, { t:pv, rol:'pv' }, { t:r[0], rol:'o' }].concat(d.map(function(c, i){ return i === d.front ? null : { t:c, rol:'z' + i }; }));
    else P = [{ t:r[0], rol:'o' }, { t:pv, rol:'pv' }].concat(d.map(function(c, i){ return { t:c, rol:'z' + i }; }));
    var b = bouw(P, '.'); b.pv = pv; b.delen = d; return b;
  }

  /* ---------- lijsten voor de stam ---------- */
  var STAM_GEWOON = ('werken werk,fietsen fiets,drinken drink,zingen zing,denken denk,helpen help,luisteren luister,wandelen wandel,tekenen teken,' +
    'huilen huil,bouwen bouw,kijken kijk,vinden vind,worden word,rijden rijd,antwoorden antwoord,poetsen poets,dansen dans,wachten wacht,' +
    'zoeken zoek,roepen roep,gooien gooi,groeien groei,zetten zet,bellen bel,rennen ren,stoppen stop,pakken pak,zitten zit,liggen lig,' +
    'zwemmen zwem,knippen knip,missen mis,vallen val,kussen kus,winnen win,trekken trek,leggen leg,redden red,kloppen klop,oefenen oefen').split(',');
  var STAM_KLINKER = ('lopen loop,maken maak,wonen woon,spelen speel,horen hoor,koken kook,praten praat,slapen slaap,eten eet,sturen stuur,' +
    'huren huur,leren leer,kopen koop,hopen hoop,nemen neem,spreken spreek,breken breek,stelen steel,smeren smeer,raden raad,haten haat,' +
    'betalen betaal,herhalen herhaal,vertalen vertaal,dromen droom,halen haal,jagen jaag,vragen vraag,dragen draag,boren boor,kraken kraak,' +
    'duren duur,zweten zweet,weten weet,meten meet').split(',');
  var STAM_VZ = ('verven verf,reizen reis,leven leef,geven geef,schrijven schrijf,blijven blijf,lezen lees,kiezen kies,verhuizen verhuis,' +
    'durven durf,geloven geloof,beloven beloof,proeven proef,niezen nies,blozen bloos,vriezen vries,wijzen wijs,verliezen verlies,' +
    'graven graaf,sterven sterf,zweven zweef,kleven kleef,beven beef,vrezen vrees,drijven drijf,wrijven wrijf,prijzen prijs').split(',');
  function opgStam(lijst, keus){
    var p = kies(lijst).split(' '), h = p[0], s = p[1], b = h.slice(0, -2), c = verandering(h, s);
    var fout = keus.filter(function(x){ return x !== c; }), andere = R.hussel(fout).slice(0, 3).map(function(x){ return VER[x]; });
    var f3 = {}; if (b !== s) f3[b] = 'Dat is nog zonder de spellingregel. ' + verHint(h, c); f3[h] = 'Dat is het hele werkwoord. Haal -en eraf.';
    var st = [
      invul('Haal -en van ' + h + ' af. Wat houd je over?', b, 'Streep de laatste twee letters van ' + h + ' weg: de e en de n.'),
      keuze('Moet er nog iets veranderen, zodat het klinkt en gespeld wordt zoals het hoort?', VER[c], andere, verHint(h, c)),
      invul('De stam van ' + h + ' is', s, 'Zeg ik ervoor: ik ... ' + (c === 'niets' ? 'Er verandert niets.' : verHint(h, c)), { fout:f3 }) ];
    return { context:'Zoek de stam van het werkwoord.', vraag:h, stappen:st, beeld:function(n){
      if (n === 0) return R.teken.woord([{ t:b, k:1, label:'zonder -en' }, { t:'en', k:5, label:'-en' }]);
      if (n < 3) return R.teken.woord([{ t:b, k:1, label:'zonder -en' }, { t:'en', k:5, label:'weg', doorgehaald:true }]);
      return R.teken.woord([{ t:s, k:3, label:'stam' }]);
    } };
  }

  /* ---------- voltooid deelwoord als bijvoeglijk naamwoord ---------- */
  var VERL = [['verven', 'de schuur'], ['verhuizen', 'de kast'], ['betalen', 'de rekening'], ['bestellen', 'de pizza'], ['gebruiken', 'de laptop'],
    ['herhalen', 'de woordjes'], ['ontdekken', 'de gang'], ['plakken', 'de band'], ['poetsen', 'de schoenen'], ['repareren', 'de fiets'],
    ['parkeren', 'de auto'], ['koken', 'de eieren'], ['schillen', 'de appel'], ['verbranden', 'de pannenkoek'], ['plannen', 'de reis'],
    ['bewaren', 'de brieven'], ['versieren', 'de taart'], ['verwarmen', 'de soep'], ['vertalen', 'de tekst'], ['verzamelen', 'de plaatjes'],
    ['scheuren', 'de broek'], ['drogen', 'de bloemen'], ['kleuren', 'de tekening'], ['pellen', 'de garnalen'], ['missen', 'de bus'],
    ['redden', 'de kat', 'geredde'], ['zetten', 'de thee', 'gezette'], ['printen', 'het verslag'], ['testen', 'de app'], ['huren', 'de fiets'],
    ['verwennen', 'de hond'], ['maken', 'de opdracht'], ['delen', 'de chips'], ['branden', 'de kaars']];
  function bijv(a){ return a[2] || LEX[a[0]].vd + 'e'; }
  /* werkwoord, zin met {G}, bijvoeglijk */
  var BIJV = [['plannen', 'De {G} reis naar Parijs gaat niet door.'], ['gebruiken', 'Ik koop het {G} boek van mijn neef.'],
    ['verbranden', 'Het {G} hout ligt nog in de kachel.'], ['parkeren', 'De {G} auto staat voor de deur.'], ['koken', 'Ik eet de {G} eieren met zout.'],
    ['verven', 'De pas {G} muur is nog nat.'], ['repareren', 'Ik haal de {G} fiets morgen op.'], ['scheuren', 'Gooi die {G} broek maar weg.'],
    ['missen', 'Dat was een {G} kans.'], ['testen', 'De {G} app werkt prima.'], ['printen', 'Het {G} verslag ligt op tafel.'],
    ['zetten', 'De {G} thee is nog heet.', 'gezette'], ['redden', 'De {G} kat zit alweer in de boom.', 'geredde'], ['verwennen', 'Het {G} kind wil steeds meer.'],
    ['betalen', 'De {G} rekening ligt in de la.'], ['bestellen', 'De {G} pizza komt om zes uur.'], ['schillen', 'Leg de {G} appel op het bord.'],
    ['drogen', 'De {G} bloemen staan in een vaas.'], ['kleuren', 'Ik ruim alle {G} potloden op.'], ['versieren', 'De {G} taart staat in de koelkast.'],
    ['vertalen', 'Lees de {G} tekst nog een keer.'], ['poetsen', 'De {G} schoenen staan bij de deur.'], ['plakken', 'De {G} band is alweer lek.'],
    ['delen', 'Ze eindigden op een {G} tweede plaats.'], ['verwachten', 'De {G} regen bleef uit.'], ['blesseren', 'De {G} speler zit op de bank.'],
    ['huren', 'De {G} fiets moet om vijf uur terug.'], ['pellen', 'Ik eet graag {G} garnalen.'], ['maken', 'Lever het {G} huiswerk morgen in.'],
    ['sluiten', 'We staan voor een {G} deur.'], ['stelen', 'De {G} fiets is teruggevonden.'], ['breken', 'Zij loopt met een {G} arm in het gips.'],
    ['verliezen', 'De {G} sleutel lag onder de bank.'], ['bakken', 'Ik eet de {G} eieren met brood.'], ['wassen', 'De {G} kleren liggen op het bed.'],
    ['vergeten', 'Het {G} boek ligt nog op school.'], ['bevriezen', 'We schaatsen op het {G} meer.']];
  function bijvVan(a){ if (a[2]) return a[2]; var vd = LEX[a[0]].vd; return /en$/.test(vd) ? vd : vd + 'e'; }

  /* ---------- gebiedende wijs ---------- */
  var GEB = [['worden', '{G} lid van onze club!'], ['komen', '{G} maar binnen!'], ['lopen', '{G} niet zo hard!'], ['vinden', '{G} de vijf verschillen!'],
    ['houden', '{G} de deur even open!'], ['rijden', '{G} voorzichtig!'], ['antwoorden', '{G} in hele zinnen!'], ['zetten', '{G} de stoelen op tafel!'],
    ['wachten', '{G} even op mij!'], ['praten', '{G} niet door elkaar!'], ['lezen', '{G} de tekst goed!'], ['schrijven', '{G} de datum bovenaan!'],
    ['kijken', '{G} goed uit!'], ['fietsen', '{G} voorzichtig naar huis!'], ['luisteren', '{G} goed naar de uitleg!'], ['doen', '{G} de deur dicht!'],
    ['gaan', '{G} maar zitten!'], ['raden', '{G} eens wie er komt!'], ['blijven', '{G} staan!'], ['nemen', '{G} een paraplu mee!'],
    ['leggen', '{G} de telefoon weg!'], ['beantwoorden', '{G} alle vragen!'], ['snijden', '{G} de taart in acht stukken!'],
    ['stoppen', '{G} met praten!'], ['bellen', '{G} me straks even!'], ['eten', '{G} het bord leeg!'], ['bieden', '{G} meteen je excuses aan!'],
    ['vergeten', '{G} de sleutels niet!'], ['helpen', '{G} de nieuwe leerling even!'], ['branden', '{G} je niet aan de pan!']];
  /* zinnen met een onderwerp erin, om het verschil te zien */
  var GEB_O = [['worden', '{G} u ook lid van onze club?', 'u'], ['komen', '{G} u maar binnen.', 'u'], ['rijden', '{G} jij voorzichtig naar huis?', 'jij'],
    ['houden', '{G} u de deur even open?', 'u'], ['vinden', '{G} jij de vijf verschillen?', 'jij'], ['antwoorden', '{G} hij altijd in hele zinnen?', 'hij'],
    ['worden', '{G} je ook lid van onze club?', 'je'], ['wachten', '{G} u even op mij?', 'u'], ['lopen', '{G} hij niet te hard?', 'hij'],
    ['zetten', '{G} jij de stoelen op tafel?', 'jij'], ['vinden', '{G} u de weg naar het station?', 'u'], ['worden', '{G} Daan ook lid?', 'Daan'],
    ['rijden', '{G} u morgen naar Utrecht?', 'u'], ['houden', '{G} jij van spruitjes?', 'jij'], ['lezen', '{G} u de tekst nog even?', 'u']];
  function persVan(t){ return t === 'u' ? 'u' : /^(jij|je)$/.test(t) ? '2' : t === 'ik' ? '1' : '3'; }

  /* ---------- lastig onderwerp ---------- */
  /* zin, werkwoord, onderwerp, kern, getal, afleider */
  var LO = [
    ['Een groep leerlingen {G} naar het museum.', 'gaan', 'een groep leerlingen', 'groep', '3', 'leerlingen'],
    ['Er {G} veel fietsen voor de school.', 'staan', 'veel fietsen', 'fietsen', 'mv', 'er'],
    ['Er {G} een boek op tafel.', 'liggen', 'een boek', 'boek', '3', 'er'],
    ['Het aantal leerlingen {G} elk jaar.', 'groeien', 'het aantal leerlingen', 'aantal', '3', 'leerlingen'],
    ['Iedereen in de klas {G} het antwoord.', 'weten', 'iedereen in de klas', 'iedereen', '3', 'de klas'],
    ['Mijn broer en mijn zus {G} in Utrecht.', 'wonen', 'mijn broer en mijn zus', 'broer en zus', 'mv', 'mijn zus'],
    ['De doos met koekjes {G} in de kast.', 'staan', 'de doos met koekjes', 'doos', '3', 'koekjes'],
    ['Elk kind {G} een cadeautje.', 'krijgen', 'elk kind', 'kind', '3', 'een cadeautje'],
    ['Niemand {G} de oplossing.', 'vinden', 'niemand', 'niemand', '3', 'de oplossing'],
    ['Wie van jullie {G} er mee naar de film?', 'gaan', 'wie van jullie', 'wie', '3', 'jullie'],
    ['Er {G} drie katten in de tuin.', 'zitten', 'drie katten', 'katten', 'mv', 'er'],
    ['Er {G} een kat in de tuin.', 'zitten', 'een kat', 'kat', '3', 'er'],
    ['Het team van mijn broer {G} bijna altijd.', 'winnen', 'het team van mijn broer', 'team', '3', 'mijn broer'],
    ['De leraar van de kinderen {G} een verhaal.', 'vertellen', 'de leraar van de kinderen', 'leraar', '3', 'de kinderen'],
    ['De kinderen van de buren {G} buiten.', 'spelen', 'de kinderen van de buren', 'kinderen', 'mv', 'de buren'],
    ['Jij en ik {G} morgen samen naar school.', 'fietsen', 'jij en ik', 'jij en ik', 'mv', 'jij'],
    ['Een van de jongens {G} zijn fiets.', 'zoeken', 'een van de jongens', 'een', '3', 'de jongens'],
    ['Het publiek {G} hard.', 'klappen', 'het publiek', 'publiek', '3', 'hard'],
    ['Mijn opa en oma {G} elk jaar naar Spanje.', 'gaan', 'mijn opa en oma', 'opa en oma', 'mv', 'oma'],
    ['Er {G} veel mensen op het strand.', 'liggen', 'veel mensen', 'mensen', 'mv', 'er'],
    ['Er {G} iemand aan de deur.', 'staan', 'iemand', 'iemand', '3', 'er'],
    ['De klas {G} morgen op schoolreis.', 'gaan', 'de klas', 'klas', '3', 'morgen'],
    ['Twee van mijn vrienden {G} op voetbal.', 'zitten', 'twee van mijn vrienden', 'twee', 'mv', 'mijn vrienden'],
    ['Het geluid van de vogels {G} mij wakker.', 'maken', 'het geluid van de vogels', 'geluid', '3', 'de vogels'],
    ['De bal en de knuppel {G} in de schuur.', 'liggen', 'de bal en de knuppel', 'bal en knuppel', 'mv', 'de knuppel'],
    ['Ieder van ons {G} een eigen kluisje.', 'krijgen', 'ieder van ons', 'ieder', '3', 'ons'],
    ['Een zak chips {G} twee euro.', 'kosten', 'een zak chips', 'zak', '3', 'chips'],
    ['De spelers van het team {G} hard.', 'trainen', 'de spelers van het team', 'spelers', 'mv', 'het team'],
    ['Elke leerling {G} een laptop.', 'krijgen', 'elke leerling', 'leerling', '3', 'een laptop'],
    ['Het gezin van Daan {G} in een groot huis.', 'wonen', 'het gezin van Daan', 'gezin', '3', 'Daan'],
    ['Er {G} een brief voor jou.', 'liggen', 'een brief', 'brief', '3', 'er'],
    ['Er {G} vandaag twee lessen uit.', 'vallen', 'twee lessen', 'lessen', 'mv', 'er'],
    ['De moeder van de tweeling {G} bij de bakker.', 'werken', 'de moeder van de tweeling', 'moeder', '3', 'de tweeling']];

  /* ---------- hebben en zijn, kunnen en co ---------- */
  var HZ = { hebben:{ '1':'heb', '2':'hebt', '2i':'heb', u:['hebt', 'heeft'], '3':'heeft', mv:'hebben' }, zijn:{ '1':'ben', '2':'bent', '2i':'ben', u:'bent', '3':'is', mv:'zijn' },
    kunnen:{ '1':'kan', '2':['kunt', 'kan'], '2i':['kun', 'kan'], u:['kunt', 'kan'], '3':'kan', mv:'kunnen' },
    zullen:{ '1':'zal', '2':['zult', 'zal'], '2i':['zul', 'zal'], u:['zult', 'zal'], '3':'zal', mv:'zullen' },
    willen:{ '1':'wil', '2':['wilt', 'wil'], '2i':'wil', u:['wilt', 'wil'], '3':'wil', mv:'willen' },
    mogen:{ '1':'mag', '2':'mag', '2i':'mag', u:'mag', '3':'mag', mv:'mogen' } };
  function hzVorm(w, p, inv){ var T = HZ[w]; return p === '2' && inv ? T['2i'] : T[p]; }
  var HZ_RAAM = [['hebben', 'een nieuwe fiets', 'nu/sinds kort'], ['hebben', 'veel huiswerk', 'vandaag/morgen'], ['hebben', 'een hond', 'nu/sinds kort'],
    ['hebben', 'het erg druk', 'vandaag/deze week'], ['hebben', 'vrij', 'morgen/vandaag'], ['hebben', 'last van hoofdpijn', 'vandaag/nu'],
    ['zijn', 'jarig', 'morgen/vandaag'], ['zijn', 'ziek', 'vandaag/nu'], ['zijn', 'thuis', 'vanavond/nu'], ['zijn', 'te laat', 'vandaag/weer'],
    ['zijn', 'erg moe', 'nu/vandaag'], ['zijn', 'op vakantie', 'deze week/nu']];
  var HUN = [['{K} hebben gisteren de wedstrijd gewonnen.', 'zij'], ['Gisteren hebben {K} de wedstrijd gewonnen.', 'zij'], ['{K} hebben een nieuwe hond.', 'zij'],
    ['Hebben {K} hun huiswerk al gemaakt?', 'zij'], ['{K} komen morgen bij ons eten.', 'zij'], ['Ik heb {K} een kaartje gestuurd.', 'hun'],
    ['De juf gaf {K} een compliment.', 'hun'], ['{K} willen later in Amsterdam wonen.', 'zij'], ['Wij hebben {K} de weg gewezen.', 'hun'],
    ['Waarom hebben {K} niets gezegd?', 'zij'], ['{K} hebben het koud.', 'zij'], ['Opa heeft {K} een verhaal verteld.', 'hun'],
    ['{K} hebben geen zin in school.', 'zij'], ['Morgen hebben {K} vrij.', 'zij'], ['Ik geef {K} morgen de sleutel.', 'hun'], ['Hebben {K} al gegeten?', 'zij']];

  /* ---------- de doelen ---------- */
  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'ww-basis', niveau:'basis', domein:'werkwoorden', naam:'Het werkwoord zelf', uit:'Voor je een werkwoord goed kunt spellen, moet je het kunnen vinden: het hele werkwoord, de stam, de persoonsvorm en het onderwerp dat erbij hoort.' },
      doelen:[
        { id:'ww-hele-werkwoord', naam:'Het hele werkwoord', kort:'Zoek het woord dat iets is wat je doet, en zet het in de vorm van het woordenboek',
          uit:'<p>Een <b>werkwoord</b> is iets wat je doet of wat er gebeurt: lopen, lezen, regenen. In een zin heeft het vaak een andere vorm: ik loop, zij las.</p><p>Het <b>hele werkwoord</b> is de vorm uit het woordenboek. Je vindt hem door "wij" ervoor te zetten in de tegenwoordige tijd: zij las, wij lezen. Het hele werkwoord is dus lezen.</p>',
          wanneer:'je een werkwoord wilt opzoeken of de stam nodig hebt.',
          maak:function(){
            var r = kies(BASIS.filter(function(r){ return !r[6]; })), tijd = kans(.5) ? 'ott' : 'ovt', b = basisZin(r, tijd, kans(.3)), pv = b.pv;
            var andere = R.hussel([r[0]].concat(b.delen)).filter(function(t){ return t !== pv; }).slice(0, 2), f = {};
            if (pv !== r[3]) f[pv] = 'Dat is de vorm in deze zin. Het hele werkwoord is de vorm met wij ervoor: wij ...';
            var st = [
              keuze('Welk woord is iets wat je doet of wat er gebeurt? Dat is het werkwoord.', pv, andere, 'Zet "ik kan" voor elk woord. Bij welk woord klinkt dat als iets wat je kunt doen?'),
              invul('Het hele werkwoord van ' + pv + ' is', r[3], 'Zet wij ervoor in de tegenwoordige tijd: wij ... Zo staat het ook in het woordenboek.', { fout:f }) ];
            return { context:'Zoek het werkwoord en maak er het hele werkwoord van.', vraag:b.tekst, stappen:st, beeld:function(n){
              return tekenZin(b, n > 0 ? { pv:{ k:2, label:n > 1 ? 'van ' + r[3] : 'werkwoord' } } : {}); } };
          } },
        { id:'ww-stam', naam:'De stam: -en eraf', kort:'Haal -en van het hele werkwoord af; staan er twee dezelfde medeklinkers, dan blijft er één over',
          uit:'<p>Bijna elke regel begint bij de <b>stam</b>. Je vindt de stam zo: neem het hele werkwoord en haal <b>-en</b> eraf. Werken wordt werk.</p><p>Staan er dan twee dezelfde medeklinkers aan het eind, dan schrijf je er maar <b>één</b>: zetten wordt zet, bellen wordt bel.</p><p>Controleer met ik: ik werk, ik zet. Dat is de stam.</p>',
          wanneer:'je een werkwoord moet vervoegen: bijna elke vorm begint bij de stam.',
          maak:function(){ return opgStam(STAM_GEWOON, ['niets', 'dubbel', 'klinker', 'vf']); } },
        { id:'ww-stam-klinker', naam:'De stam: lange klank, dubbele klinker', kort:'Klinkt de klinker lang, schrijf hem dan dubbel: lopen wordt loop',
          uit:'<p>Bij <b>lopen</b> klinkt de o lang. Haal je -en eraf, dan staat er lop. Dat klinkt kort.</p><p>Daarom schrijf je de klinker <b>dubbel</b>: loop. Zo blijft de klank hetzelfde als in het hele werkwoord. Maken wordt maak, wonen wordt woon, spelen wordt speel.</p>',
          wanneer:'het hele werkwoord een lange a, e, o of u heeft vlak voor de laatste medeklinker.',
          maak:function(){ return opgStam(STAM_KLINKER, ['niets', 'dubbel', 'klinker']); } },
        { id:'ww-stam-vz', naam:'De stam: v wordt f, z wordt s', kort:'Een stam eindigt nooit op v of z: verven wordt verf, reizen wordt reis',
          uit:'<p>Een stam eindigt nooit op een <b>v</b> of een <b>z</b>. Van de v maak je een <b>f</b>, van de z een <b>s</b>: verven wordt verf, reizen wordt reis.</p><p>Soms moet ook de klinker dubbel: leven wordt leef, lezen wordt lees.</p><p>Let op: de v en de z van het hele werkwoord heb je later nog nodig bij de verleden tijd.</p>',
          wanneer:'het hele werkwoord een v of z heeft vlak voor -en.',
          maak:function(){ return opgStam(STAM_VZ, ['vf', 'zs', 'vfk', 'zsk', 'niets']); } },
        { id:'ww-pv-tijd', naam:'De persoonsvorm: verander de tijd', kort:'Zet de zin in een andere tijd: het woord dat verandert, is de persoonsvorm',
          uit:'<p>In elke zin staat een <b>persoonsvorm</b>: het werkwoord dat bij het onderwerp hoort.</p><p>Zo vind je hem: zet de zin in een <b>andere tijd</b>. Staat hij in de tegenwoordige tijd, maak er dan de verleden tijd van, en andersom. Het woord dat verandert, is de persoonsvorm.</p><p>Mijn broer speelt voetbal. Mijn broer speelde voetbal. Speelt verandert, dus speelt is de persoonsvorm.</p>',
          wanneer:'je de persoonsvorm zoekt in een zin met meer werkwoorden.',
          maak:function(){
            var r = kies(BASIS), tijd = kans(.5) ? 'ott' : 'ovt', ander = tijd === 'ott' ? 'ovt' : 'ott', voorop = kans(.3);
            var b = basisZin(r, tijd, voorop), b2 = basisZin(r, ander, voorop);
            var st = [ stTijd({ tw:'' }, tijd),
              { tekst:'Zet de zin in de ' + (ander === 'ovt' ? 'verleden' : 'tegenwoordige') + ' tijd: ' + b2.tekst, info:true },
              invul('Welk woord is veranderd? Dat is de persoonsvorm.', b.pv, 'Leg de twee zinnen naast elkaar en kijk woord voor woord. Welk woord is anders?') ];
            st[0].hint = tijd === 'ott' ? 'Gebeurt het nu, of altijd? Dan is het de tegenwoordige tijd.' : 'Is het al voorbij? Dan is het de verleden tijd.';
            return { context:'Zoek de persoonsvorm door de tijd te veranderen.', vraag:b.tekst, stappen:st, beeld:function(n){
              var h = tekenZin(b, n >= 3 ? { pv:{ k:2, label:'persoonsvorm' } } : {});
              if (n >= 2) h += tekenZin(b2, { pv:{ k:4, label:'veranderd' } });
              return h; } };
          } },
        { id:'ww-pv-vraag', naam:'De persoonsvorm: maak er een vraag van', kort:'Maak er een ja/nee-vraag van: het werkwoord dat vooraan komt, is de persoonsvorm',
          uit:'<p>Een tweede manier om de <b>persoonsvorm</b> te vinden: maak van de zin een <b>ja/nee-vraag</b>. Dat is een vraag waarop je ja of nee kunt zeggen.</p><p>Het werkwoord dat dan <b>vooraan</b> staat, is de persoonsvorm. Sanne fietst naar school. Fietst Sanne naar school? Fietst staat vooraan.</p><p>Let op: een vraag met wie, wat of waar ervoor is geen ja/nee-vraag.</p>',
          wanneer:'je de tijd lastig kunt veranderen, of als controle.',
          maak:function(){
            var r = kies(BASIS.filter(function(r){ return r[0] !== 'jij'; })), tijd = kans(.5) ? 'ott' : 'ovt', b = basisZin(r, tijd, false), d = b.delen;
            var pv = b.pv, oMid = /^[A-Z]/.test(r[0]) ? r[0] : r[0], rest = d.join(' ');
            var jn = cap(pv) + ' ' + oMid + ' ' + rest + '?', zin = cap(r[0]) + ' ' + pv + ' ' + rest + '?';
            var andere = [zin]; if (!/^(ik|wij|we|jullie)$/.test(r[0]) && r[1] !== r[3]) andere.push((r[5] ? 'Wie ' : 'Wat ') + pv + ' ' + rest + '?');
            var st = [
              keuze('Maak er een ja/nee-vraag van. Welke vraag is dat?', jn, andere, 'Op een ja/nee-vraag zeg je ja of nee. Er staat geen vraagwoord vooraan, en de volgorde van de woorden verandert.'),
              invul('Welk woord staat in die vraag vooraan? Dat is de persoonsvorm.', pv, 'Kijk naar het eerste woord van de vraag: ' + jn + '') ];
            var bv = bouw([{ t:pv, rol:'pv' }, { t:r[0], rol:'o' }].concat(d.map(function(c){ return { t:c, rol:'x' }; })), '?');
            return { context:'Zoek de persoonsvorm met een ja/nee-vraag.', vraag:b.tekst, stappen:st, beeld:function(n){
              var h = tekenZin(b, n >= 2 ? { pv:{ k:2, label:'persoonsvorm' } } : {});
              if (n >= 1) h += tekenZin(bv, { pv:{ k:4, label:'vooraan' } });
              return h; } };
          } },
        { id:'ww-onderwerp', naam:'Het onderwerp: wie of wat + pv?', kort:'Vraag "wie of wat" en zet de persoonsvorm erachter: het antwoord is het onderwerp',
          uit:'<p>Het <b>onderwerp</b> is wie of wat iets doet. Het hoort bij de persoonsvorm: samen bepalen ze hoe je het werkwoord schrijft.</p><p>Zo vind je het: zoek eerst de persoonsvorm. Vraag dan: <b>wie of wat + persoonsvorm?</b> Het antwoord is het onderwerp.</p><p>Elke ochtend leest mijn opa de krant. Wie leest? Mijn opa. Het onderwerp staat dus niet altijd vooraan.</p>',
          wanneer:'je wilt weten of er een t achter het werkwoord moet: dat hangt van het onderwerp af.',
          maak:function(){
            var r = kies(BASIS), tijd = kans(.5) ? 'ott' : 'ovt', b = basisZin(r, tijd, kans(.55)), pv = b.pv;
            var andere = R.hussel(b.delen.filter(function(c){ return c !== r[0]; })).slice(0, 2);
            var st = [
              invul('Wat is de persoonsvorm?', pv, 'Maak er een ja/nee-vraag van of zet de zin in een andere tijd. Het werkwoord dat vooraan komt of verandert, is de persoonsvorm.'),
              keuze('Vraag: wie of wat ' + pv + '? Wie of wat is het onderwerp?', r[0], andere, 'Zet "wie of wat" voor ' + pv + ' en lees de zin. Een tijd of een plaats is nooit het onderwerp.') ];
            return eindKeuze({ context:'Zoek het onderwerp.', vraag:b.tekst, stappen:st, beeld:function(n){
              var m = {}; if (n >= 1) m.pv = { k:2, label:'persoonsvorm' }; if (n >= 2) m.o = { k:1, label:'onderwerp' };
              return tekenZin(b, m); } });
          } }
      ] },

    { groep:{ id:'ww-ott', niveau:'1F', domein:'werkwoorden', naam:'De tegenwoordige tijd', uit:'Ik loop, jij loopt, loop jij? Wanneer schrijf je alleen de stam, wanneer stam + t en wanneer het hele werkwoord? Hier oefen je elke regel apart, en daarna alles door elkaar.' },
      doelen:[
        { id:'ww-ott-ik', naam:'Ik + stam', kort:'Bij ik schrijf je alleen de stam, ook als je een t hoort: ik word',
          uit:'<p>Is het onderwerp <b>ik</b>, dan schrijf je <b>alleen de stam</b>: ik loop, ik werk, ik fiets.</p><p>Ook als je aan het eind een t hoort: <b>ik word</b>, ik vind, ik rijd. De stam van worden is word, dus ik word.</p><p>Het maakt niet uit waar ik staat: morgen word ik veertien.</p>',
          wanneer:'het onderwerp ik is.',
          maak:function(){ var F = kies(FR_OTT); return opgOtt(F, ONDW[0], volgorde(.5), ['stam', 'regel', 'vorm']); } },
        { id:'ww-ott-t', naam:'Jij, u, hij: stam + t', kort:'Bij jij en je (ervoor), u en hij, zij of het komt er een t achter de stam',
          uit:'<p>Bij <b>jij</b>, <b>je</b>, <b>u</b> en <b>hij, zij, het</b> schrijf je <b>stam + t</b>: jij loopt, u werkt, zij fietst.</p><p>Dat geldt ook voor één persoon met een naam: Sanne fietst, mijn broer werkt. Dat is allemaal hij of zij.</p><p>Hoor je de t niet goed, schrijf hem toch: hij word + t = <b>hij wordt</b>.</p>',
          wanneer:'het onderwerp één persoon is, maar niet ik.',
          maak:function(){ var F = kies(FR_OTT), o = ondw(F, isP(['2', 'u', '3'])); return opgOtt(F, o, 'n', ['o', 'regel', 'stam', 'vorm']); } },
        { id:'ww-ott-inversie', naam:'Jij achter de pv: geen t', kort:'Staat jij of je achter de persoonsvorm, dan valt de t weg: loop jij, word je',
          uit:'<p>Jij loopt. Maar: <b>loop jij</b> mee? Staat <b>jij</b> of <b>je</b> achter de persoonsvorm, dan valt de t weg.</p><p>Dat gebeurt in een vraag (word je moe?) en als er iets anders vooraan staat (morgen word je veertien).</p><p>Schrijf dan alleen de stam: <b>word</b> jij, <b>vind</b> je, <b>zit</b> jij.</p>',
          wanneer:'jij of je direct na het werkwoord staat.',
          maak:function(){ var F = kies(FR_OTT), o = kies([ONDW[1], ONDW[2]]); return opgOtt(F, o, kans(.5) ? 'i' : 'v', ['o', 'plek', 'regel', 'vorm']); } },
        { id:'ww-ott-u-hij', naam:'U en hij achter de pv: wel een t', kort:'Alleen jij en je verliezen de t: wordt u, wordt hij, maar word jij',
          uit:'<p>De t valt <b>alleen</b> weg bij <b>jij</b> en <b>je</b> achter de persoonsvorm.</p><p>Bij <b>u</b> en bij <b>hij, zij, het</b> blijft de t altijd staan: wordt u lid?, morgen wordt hij veertien, vindt Sanne dat ook?</p><p>Vraag dus eerst: is het onderwerp jij of je? Alleen dan geen t.</p>',
          wanneer:'het onderwerp achter de persoonsvorm staat.',
          maak:function(){ var F = kies(FR_OTT), o = kans(.35) ? kies([ONDW[1], ONDW[2]]) : ondw(F, isP(['u', '3'])); return opgOtt(F, o, kans(.5) ? 'i' : 'v', ['o', 'isjij', 'regel', 'vorm']); } },
        { id:'ww-ott-d', naam:'Stam op -d: hij vindt', kort:'Eindigt de stam op d, dan krijg je bij hij dt: hoor je het niet, schrijf het wel',
          uit:'<p>Bij worden, vinden en rijden eindigt de stam op een <b>d</b>: word, vind, rijd.</p><p>Je volgt gewoon de regels. Bij ik: alleen de stam, <b>ik vind</b>. Bij hij: stam + t, <b>hij vindt</b>. Jij achter de pv: <b>vind jij</b>.</p><p>Je hoort het verschil niet, maar je schrijft het wel. Denk nooit "het klinkt als t", denk aan de regel.</p>',
          wanneer:'je twijfelt tussen d, t en dt.',
          maak:function(){ var F = kies(FR_D), o = ondw(F, kans(.85) ? isP(['1', '2', 'u', '3']) : null); return opgOtt(F, o, volgorde(.45), ['o', 'regel', 'stam', 'vorm']); } },
        { id:'ww-ott-t-stam', naam:'Stam op -t: hij zet', kort:'Eindigt de stam al op t, dan komt er geen tweede t bij: hij zet, niet zett',
          uit:'<p>Bij zetten, praten en wachten eindigt de stam al op een <b>t</b>: zet, praat, wacht.</p><p>Moet er volgens de regel een t bij, dan zie je dat niet: <b>hij zet</b>, jij praat, zij wacht. Twee t\'s aan het eind schrijf je nooit.</p><p>Bij ik is het ook gewoon de stam: ik zet. De vorm is dan dus vaak hetzelfde.</p>',
          wanneer:'de stam eindigt op een t.',
          maak:function(){ var F = kies(FR_T), o = ondw(F, isP(['1', '2', 'u', '3'])); return opgOtt(F, o, volgorde(.5), ['o', 'regel', 'tstam', 'vorm']); } },
        { id:'ww-ott-mv', naam:'Meervoud: het hele werkwoord', kort:'Bij wij, jullie, zij (meer) en twee mensen: het hele werkwoord',
          uit:'<p>Is het onderwerp <b>meer dan één</b>, dan schrijf je het <b>hele werkwoord</b>: wij lopen, jullie worden, de kinderen spelen.</p><p>Let op onderwerpen als <b>Noah en Lisa</b> of <b>mijn ouders</b>: dat zijn er ook meer.</p><p>Hier maakt het niet uit of het onderwerp voor of achter de persoonsvorm staat: worden jullie?</p>',
          wanneer:'het onderwerp meer personen of dingen zijn.',
          maak:function(){ var F = kies(FR_OTT), o = ondw(F, kans(.8) ? isP(['mv']) : isP(['2', '3'])); return opgOtt(F, o, volgorde(.5), ['o', 'getal', 'vorm']); } },
        { id:'ww-ott-lopen', naam:'Het trucje: vervang door lopen', kort:'Zet lopen op de plek: hoor je loopt, dan stam + t; hoor je loop, dan alleen de stam',
          uit:'<p>Twijfel je over d, t of dt? Zet dan het werkwoord <b>lopen</b> op die plek. Bij lopen hoor je de t wel.</p><p>Jij (worden) morgen veertien. Jij <b>loopt</b> morgen veertien: je hoort een t. Dus jij <b>wordt</b>.</p><p>Morgen (worden) jij veertien. Morgen <b>loop</b> jij: geen t. Dus <b>word</b> jij. De zin klinkt gek, maar de vorm klopt.</p>',
          wanneer:'je de regel niet meteen weet en wilt horen of er een t komt.',
          maak:function(){ var F = kies(kans(.7) ? FR_D : FR_OTT), o = ondw(F, kans(.85) ? isP(['1', '2', 'u', '3']) : null); return opgOtt(F, o, volgorde(.4), ['lopen', 'regel', 'vorm']); } },
        { id:'ww-ott-kies', naam:'Kies de goede vorm', kort:'Alles door elkaar: zoek het onderwerp, kies de regel en schrijf de vorm',
          uit:'<p>Nu staat alles door elkaar. Werk steeds in dezelfde volgorde:</p><p><b>1</b> Zoek het onderwerp. <b>2</b> Kies de regel: alleen de stam (ik, en jij of je achter de pv), stam + t (jij, u, hij), of het hele werkwoord (meer personen). <b>3</b> Schrijf de vorm, ook als je de t of de d niet hoort.</p>',
          wanneer:'je een tekst nakijkt of een toets maakt.',
          maak:function(){ var F = kies(FR_OTT), o = ondw(F); return opgOtt(F, o, volgorde(.45), ['o', 'regel', 'vorm']); } }
      ] },

    { groep:{ id:'ww-ovt', niveau:'1F', domein:'werkwoorden', naam:'De verleden tijd', uit:'Werkte of werkde? Bij zwakke werkwoorden kies je met \'t kofschip tussen -te en -de. Sterke werkwoorden veranderen van klank: die leer je uit je hoofd.' },
      doelen:[
        { id:'ww-ovt-zwak', naam:'Zwak: stam + te of de', kort:'De verleden tijd van een zwak werkwoord is stam + te of stam + de, bij ik, jij en hij hetzelfde',
          uit:'<p>De meeste werkwoorden zijn <b>zwak</b>. De verleden tijd maak je dan zo: <b>stam + te</b> of <b>stam + de</b>. Ik werkte, ik woonde.</p><p>Bij ik, jij, u en hij is het allemaal hetzelfde: ik werkte, jij werkte, hij werkte. Er komt <b>geen extra t</b> bij.</p><p>Of het -te of -de wordt, zie je aan de letter voor -en in het hele werkwoord. Daarover gaat het volgende doel.</p>',
          wanneer:'het al voorbij is en het werkwoord zwak is.',
          maak:function(){ var F = kies(FR_VERL.concat(FR_VZ).filter(zwakF)), o = ondw(F, isP(['1', '2', 'u', '3'])); return opgOvt(F, o, volgorde(.6), ['tijd', 'stam', 'tede', 'vorm']); } },
        { id:'ww-ovt-kofschip', naam:'\'t kofschip', kort:'Zit de letter voor -en in \'t kofschip (t, k, f, s, ch, p), dan -te; anders -de',
          uit:'<p>Haal -en van het hele werkwoord af en kijk naar de <b>laatste letter</b>. Zit die in <b>\'t kofschip</b>, dan wordt het -te. Anders -de.</p><p>De letters van \'t kofschip zijn: <b>t, k, f, s, ch</b> en <b>p</b>.</p><p>Werken: de k zit erin, dus werk<b>te</b>. Wonen: de n zit er niet in, dus woon<b>de</b>.</p>',
          wanneer:'je twijfelt tussen -te en -de.',
          maak:function(){ var F = kies(FR_VERL.filter(function(F){ var V = LEX[F.w]; return V.zwak && !/[aeiouvz]/.test(V.letter); })), o = ondw(F); return opgOvt(F, o, volgorde(.6), ['stam', 'letter', 'kof', 'vorm']); } },
        { id:'ww-ovt-fokschaap', naam:'\'t fokschaap', kort:'Dezelfde letters, een ander ezelsbruggetje: t, f, k, s, ch en p',
          uit:'<p>Vind je \'t kofschip lastig te onthouden? Gebruik dan <b>\'t fokschaap</b>. Het zijn precies dezelfde letters: <b>t, f, k, s, ch</b> en <b>p</b>.</p><p>Zit de letter voor -en erin, dan -te: fietsen, fietste. Zit hij er niet in, dan -de: bellen, belde.</p><p>Kies het ezelsbruggetje dat jij het makkelijkst onthoudt.</p>',
          wanneer:'je \'t kofschip vergeten bent, of liever een schaap onthoudt.',
          maak:function(){ var F = kies(FR_VERL.filter(function(F){ var V = LEX[F.w]; return V.zwak && !/[aeiouvz]/.test(V.letter); })), o = ondw(F); return opgOvt(F, o, volgorde(.6), ['letter', 'fok', 'tede', 'vorm']); } },
        { id:'ww-ovt-vz', naam:'Verven, reizen: kijk naar het hele werkwoord', kort:'De stam is verf, maar in verven staat een v: dus verfde',
          uit:'<p>Let op bij werkwoorden met een <b>v</b> of <b>z</b> voor -en. De stam eindigt op f of s: verf, reis. Die zitten in \'t kofschip!</p><p>Toch kijk je naar het <b>hele werkwoord</b>: verven, reizen. De v en de z zitten niet in \'t kofschip. Dus: ik <b>verfde</b>, ik <b>reisde</b>.</p><p>Zo ook: leven, leefde; verhuizen, verhuisde.</p>',
          wanneer:'de stam op f of s eindigt, maar het hele werkwoord een v of z heeft.',
          maak:function(){ var F = kies(FR_VZ), o = ondw(F); return opgOvt(F, o, volgorde(.6), ['stam', 'letter', 'kof', 'vorm']); } },
        { id:'ww-ovt-mv', naam:'Meervoud: -ten of -den', kort:'Bij meer personen komt er een n achter: zij werkten, wij woonden',
          uit:'<p>Is het onderwerp <b>meer dan één</b>, dan komt er in de verleden tijd een <b>n</b> achter: -ten of -den.</p><p>Wij werk<b>ten</b>, jullie woon<b>den</b>, de kinderen speel<b>den</b>.</p><p>Of het -ten of -den wordt, bepaal je weer met \'t kofschip.</p>',
          wanneer:'het onderwerp meer personen zijn en het al voorbij is.',
          maak:function(){ var F = kies(FR_VERL.concat(FR_VZ).filter(zwakF)), o = ondw(F, kans(.8) ? isP(['mv']) : isP(['2', '3'])); return opgOvt(F, o, volgorde(.6), ['o', 'getal', 'tede', 'vorm']); } },
        { id:'ww-ovt-sterk', naam:'Sterke werkwoorden', kort:'Bij sterke werkwoorden verandert de klank: lopen, liep; vinden, vond. Die leer je uit je hoofd',
          uit:'<p>Sommige werkwoorden krijgen geen -te of -de. De <b>klank verandert</b>: lopen wordt <b>liep</b>, vinden wordt <b>vond</b>, schrijven wordt <b>schreef</b>. Dat zijn <b>sterke werkwoorden</b>.</p><p>Je herkent ze door het hardop te zeggen: gisteren loopte ik? Nee, gisteren liep ik.</p><p>Bij meer personen komt er -en achter: wij liepen. Soms verandert dan nog iets: hij gaf, wij gaven.</p>',
          wanneer:'stam + te of de raar klinkt.',
          maak:function(){ var F = kies(FR_VERL.filter(sterkF)), o = ondw(F); return opgOvt(F, o, volgorde(.6), ['sterk', 'getal', 'vorm']); } },
        { id:'ww-ovt-kies', naam:'Kies de goede vorm', kort:'Alles door elkaar: zwak of sterk, -te of -de, één of meer',
          uit:'<p>Nu staat alles door elkaar. Werk zo:</p><p><b>1</b> Is het voorbij? Dan verleden tijd. <b>2</b> Zwak of sterk? Zeg het hardop. <b>3</b> Zwak: kijk naar de letter voor -en en gebruik \'t kofschip. <b>4</b> Meer personen? Dan komt er een n achter.</p>',
          wanneer:'je een verhaal in de verleden tijd schrijft of nakijkt.',
          maak:function(){ var F = kies(FR_VERL.concat(FR_VZ).filter(function(F){ return zwakF(F) || sterkF(F); })), o = ondw(F), V = LEX[F.w];
            return opgOvt(F, o, volgorde(.6), V.sterk ? ['tijd', 'sz', 'vorm'] : ['tijd', 'sz', 'tede', 'vorm']); } }
      ] },

    { groep:{ id:'ww-vd', niveau:'2F', domein:'werkwoorden', naam:'Het voltooid deelwoord', uit:'Gewerkt, gewoond, gelopen, betaald: het voltooid deelwoord met de t of de d, zonder ge- bij een voorvoegsel, en de lastige twijfel tussen verhuist en verhuisd.' },
      doelen:[
        { id:'ww-vd-zwak', naam:'Ge + stam + t of d', kort:'Het voltooid deelwoord van een zwak werkwoord: ge + stam + t of d, weer met \'t kofschip',
          uit:'<p>Het <b>voltooid deelwoord</b> staat achteraan, na een vorm van hebben of zijn: ik heb gewerkt, zij is verhuisd.</p><p>Bij zwakke werkwoorden: <b>ge + stam + t</b> of <b>ge + stam + d</b>. Welke het wordt, bepaal je weer met <b>\'t kofschip</b>: werken, gewerkt; wonen, gewoond.</p><p>Controleer met de verleden tijd: werkte heeft een t, gewerkt ook.</p>',
          wanneer:'er al een vorm van hebben of zijn in de zin staat.',
          maak:function(){ var F = kies(FR_VERL.concat(FR_VZ).filter(function(F){ var V = LEX[F.w]; return V.zwak && !V.vv; })), o = ondw(F); return opgVd(F, o, volgorde(.6), ['pvvd', 'stam', 'td', 'vorm']); } },
        { id:'ww-vd-sterk', naam:'Sterke werkwoorden: gelopen', kort:'Sterke werkwoorden eindigen op -en en veranderen vaak van klank: gelopen, geschreven',
          uit:'<p>Bij <b>sterke werkwoorden</b> eindigt het voltooid deelwoord meestal op <b>-en</b>: gelopen, gegeven, geslapen.</p><p>Vaak verandert ook de klinker: schrijven, <b>geschreven</b>; vinden, <b>gevonden</b>; drinken, <b>gedronken</b>.</p><p>Zeg het hardop met ik heb of ik ben ervoor. Geloopt klinkt fout: gelopen.</p>',
          wanneer:'ge + stam + t of d raar klinkt.',
          maak:function(){ var F = kies(FR_VERL.filter(function(F){ var V = LEX[F.w]; return V.sterk && !V.vv && V.vd !== nepZwak(V).vd && !/eee/.test(nepZwak(V).vd); })), o = ondw(F); return opgVd(F, o, volgorde(.6), ['pvvd', 'sterk', 'vorm']); } },
        { id:'ww-vd-ge', naam:'Zonder ge-: be-, ge-, her-, ont-, ver-', kort:'Begint het werkwoord met be-, ge-, her-, ont- of ver-, dan komt er geen ge- voor',
          uit:'<p>Begint een werkwoord met <b>be-, ge-, her-, ont-</b> of <b>ver-</b>, dan krijgt het voltooid deelwoord <b>geen ge-</b>: betalen, <b>betaald</b>; vertrouwen, <b>vertrouwd</b>; herhalen, <b>herhaald</b>.</p><p>De t of d bepaal je gewoon met \'t kofschip.</p><p>Let op: bij bellen en verven is be- of ver- geen voorvoegsel. Daar komt wel ge- voor: gebeld, geverfd.</p>',
          wanneer:'het werkwoord begint met be, ge, her, ont of ver.',
          maak:function(){
            var r = Math.random(), F;
            if (r < .65) F = kies(FR_PV);
            else if (r < .9) F = kies([FR_ALG.filter(function(F){ return F.w === 'bellen' || F.w === 'verven'; })[kies([0, 1])], FR_VZ.filter(function(F){ return F.w === 'beven'; })[0]]);
            else F = kies(FR_ALG.filter(function(F){ var V = LEX[F.w]; return V.zwak && !V.vv; }));
            return opgVd(F, ondw(F), volgorde(.6), ['ge', 'td', 'vorm']); } },
        { id:'ww-vd-verleng', naam:'Het trucje: maak het langer', kort:'Twijfel je tussen d en t? Zet het voor een zelfstandig naamwoord: de verhuisde kast, dus verhuisd',
          uit:'<p>Hoor je niet of een voltooid deelwoord op d of t eindigt? <b>Maak het langer</b>. Zet het als bijvoeglijk naamwoord voor een woord.</p><p>De kast is verhuis(d/t). Zeg: de <b>verhuisde</b> kast. Je hoort een d, dus <b>verhuisd</b>.</p><p>De schuur is geverf(d/t): de geverfde schuur, dus <b>geverfd</b>. De bus is gemis(d/t): de gemiste bus, dus <b>gemist</b>.</p>',
          wanneer:'je twijfelt tussen d en t aan het eind van een voltooid deelwoord.',
          maak:function(){
            var a = kies(VERL), V = LEX[a[0]], adj = bijv(a), fout = adj.replace(/(d|t)e$/, function(x){ return x === 'de' ? 'te' : 'de'; });
            var lid = a[1].split(' ')[0], nw = a[1].split(' ').slice(1).join(' '), u = /de$/.test(adj) ? 'd' : 't', o = ondw({ s:'a' }), tw = kies(['gisteren', 'vorige week', 'net', 'vanochtend']);
            var b = bouw([{ t:o.t, rol:'o' }, { t:auxV('h', o.p, false), rol:'aux' }, { t:tw, rol:'tw' }, { t:a[1], rol:'x' }, { t:GAT(a[0]), rol:'gat' }], '.');
            var st = [
              keuze('Maak het langer: zet het voor "' + nw + '". Wat zeg je?', lid + ' ' + adj + ' ' + nw, [lid + ' ' + fout + ' ' + nw], 'Zeg allebei hardop. Welke klinkt zoals jij het echt zegt?'),
              keuze('Je hoort ' + adj + '. Dus het voltooid deelwoord eindigt op', u, [u === 'd' ? 't' : 'd'], 'In ' + adj + ' hoor je een ' + u + ' voor de e. Die ' + u + ' staat ook aan het eind van het voltooid deelwoord.'),
              stVormVd(V) ];
            return { context:CTX, vraag:b.tekst, stappen:st, beeld:function(n){
              var h = tekenZin(b, { gat:n >= 3 ? { k:2, label:'voltooid deelwoord', t:V.vd } : { k:2, label:'voltooid deelwoord' } });
              if (n >= 1) h += R.teken.zin([lid, { t:adj, k:4, label:'langer' }, nw]);
              return h; } };
          } },
        { id:'ww-vd-engels', naam:'Engelse werkwoorden: gecrasht, geüpdatet', kort:'Ge + Engelse stam + t of d: luister naar de laatste klank, niet naar de letter',
          uit:'<p>Engelse werkwoorden volgen de Nederlandse regels. De stam is het Engelse woord: <b>update</b>, <b>crash</b>, <b>recycle</b>.</p><p>Voor de t of d luister je naar de <b>laatste klank</b> van de stam. Update eindigt op de klank t: <b>geüpdatet</b>. Crash eindigt op sj, net als de s: <b>gecrasht</b>. Recycle eindigt op een l: <b>gerecycled</b>.</p><p>Let op het trema in geüpdatet: zo lees je ge-up en niet geu.</p>',
          wanneer:'je een Engels werkwoord in een Nederlandse zin gebruikt.',
          maak:function(){ var F = kies(FR_ENG), o = ondw(F); return opgVd(F, o, volgorde(.6), ['stam', 'td', 'vorm']); } },
        { id:'ww-vd-pv', naam:'Verhuist of verhuisd?', kort:'Is het de persoonsvorm (verhuist) of een voltooid deelwoord (verhuisd)? Vervang door lopen of gelopen',
          uit:'<p>Verhuist en verhuisd klinken hetzelfde. Kijk welke <b>rol</b> het woord heeft.</p><p>Is het de <b>persoonsvorm</b>? Dan volg je de regels van de tegenwoordige tijd: hij <b>verhuist</b> morgen. Is het een <b>voltooid deelwoord</b>? Dan ge + stam + t/d, of zonder ge-: hij is <b>verhuisd</b>.</p><p>Het trucje: vervang het door <b>lopen</b>. Zeg je loopt, dan is het de persoonsvorm. Zeg je gelopen, dan is het een voltooid deelwoord.</p>',
          wanneer:'je twijfelt tussen t en d bij werkwoorden als verhuizen, vertellen en gebeuren.',
          maak:function(){
            if (kans(.2)){
              var g = kies(GEBEUR), V0 = LEX.gebeuren, bg = bouw([{ t:g[0].replace('{G}', GAT('gebeuren')), rol:'x' }], '');
              var goed0 = g[1] === 'vd' ? V0.vd : ott(V0, '3', false);
              var st0 = [ stPvVd(g[1], { aux:g[1] === 'vd' ? (/ is /.test(' ' + g[0] + ' ') ? 'is' : null) : null }),
                keuze('Zet lopen op die plek. Wat zeg je?', g[1] === 'vd' ? 'gelopen' : 'loopt', [g[1] === 'vd' ? 'loopt' : 'gelopen'], 'Lees de zin hardop met loopt en met gelopen.'),
                g[1] === 'vd' ? stVormVd(V0) : invul('Dus de goede vorm is', goed0, 'Persoonsvorm bij ' + g[2] + ' (dat is het): stam gebeur + t.', { fout:{ gebeurd:'Dat is het voltooid deelwoord. Hier is het de persoonsvorm: stam + t.' } }) ];
              if (g[1] === 'vd') st0[2].fout.gebeurt = 'Dat is de persoonsvorm. Hier is het een voltooid deelwoord: gebeur + d (geen ge-).';
              return { context:CTX, vraag:bg.tekst, stappen:st0 };
            }
            var F = kies(FR_PV), V = LEX[F.w], vd = kans(.5), o = ondw(F, isP(['2', 'u', '3'])), b = zinF(F, o, vd ? 'vd' : 'ott', 'n'), pv = ott(V, o.p, false);
            var laatste = vd ? stVormVd(V) : stVormOtt(V, o, false);
            if (vd) laatste.fout[pv] = 'Dat is de persoonsvorm. Hier is het een voltooid deelwoord.';
            else laatste.fout[V.vd] = 'Dat is het voltooid deelwoord. Hier is het de persoonsvorm.';
            var st = [ stPvVd(vd ? 'vd' : 'pv', b),
              keuze('Zet lopen op die plek. Wat zeg je?', vd ? 'gelopen' : 'loopt', [vd ? 'loopt' : 'gelopen'], 'Lees de zin hardop met loopt en met gelopen. Welke klinkt goed?'),
              laatste ];
            return { context:CTX, vraag:b.tekst, stappen:st, beeld:function(n){
              var m = { gat:{ k:2, label:vd ? 'voltooid deelwoord' : 'persoonsvorm' } };
              if (n >= 1 && vd) m.aux = { k:5, label:'persoonsvorm' };
              if (n >= 3) m.gat.t = vd ? V.vd : pv;
              return tekenZin(b, m); } };
          } },
        { id:'ww-vd-kies', naam:'Kies de goede vorm', kort:'Alles door elkaar: zwak of sterk, ge- of niet, t of d',
          uit:'<p>Nu staat alles door elkaar. Werk zo:</p><p><b>1</b> Staat er al een persoonsvorm (heb, is, hebben)? Dan is het gat een voltooid deelwoord. <b>2</b> Klinkt ge + stam + t/d raar? Dan is het sterk: zeg het hardop. <b>3</b> Zwak: begint het met be-, ge-, her-, ont- of ver-? Dan geen ge-. <b>4</b> T of d: \'t kofschip, of maak het langer.</p>',
          wanneer:'je een tekst nakijkt.',
          maak:function(){
            var F = kies(FR_VERL.concat(FR_VZ, FR_PV).filter(function(F){ var V = LEX[F.w]; return V.zwak || (V.sterk && V.vd !== nepZwak(V).vd && !/eee/.test(nepZwak(V).vd)); })), V = LEX[F.w];
            return opgVd(F, ondw(F), volgorde(.6), V.sterk ? ['pvvd', 'sterk', 'vorm'] : V.vv ? ['pvvd', 'ge', 'td', 'vorm'] : ['pvvd', 'td', 'vorm']); } }
      ] },

    { groep:{ id:'ww-bijzonder', niveau:'2F', domein:'werkwoorden', naam:'Bijzondere gevallen', uit:'Het voltooid deelwoord voor een zelfstandig naamwoord, de gebiedende wijs, de tijden herkennen en de val van je en jouw.' },
      doelen:[
        { id:'ww-bijv-vd', naam:'De geplande reis: -de of -te', kort:'Gebruik je een voltooid deelwoord als bijvoeglijk naamwoord, kijk dan naar het voltooid deelwoord: gepland, dus geplande',
          uit:'<p>Een voltooid deelwoord kan ook voor een zelfstandig naamwoord staan: de <b>geplande</b> reis, het <b>gebruikte</b> boek.</p><p>Twijfel je tussen -de en -te? Kijk naar het <b>voltooid deelwoord</b>. Gepland eindigt op een d: geplan<b>de</b>. Gebruikt eindigt op een t: gebruik<b>te</b>. Verbrand: verbran<b>de</b>.</p><p>Eindigt het voltooid deelwoord op -en, dan blijft het zo: de gesloten deur.</p>',
          wanneer:'er een werkwoordsvorm voor een zelfstandig naamwoord staat.',
          maak:function(){
            var a = kies(BIJV), V = LEX[a[0]], adj = bijvVan(a), soort = /en$/.test(V.vd) ? 'op -en' : /d$/.test(V.vd) ? 'op een d' : 'op een t';
            var b = bouw([{ t:a[1].replace('{G}', GAT(a[0])), rol:'x' }], ''), f = {};
            if (soort !== 'op -en'){ f[adj.replace(/(d|t)e$/, function(x){ return x === 'de' ? 'te' : 'de'; })] = 'Kijk naar het voltooid deelwoord: ' + V.vd + '.'; f[V.vd] = 'Er komt nog een e achter, want het staat voor een zelfstandig naamwoord.'; }
            var st = [
              invul('Wat is het voltooid deelwoord van ' + a[0] + '? Denk: ik heb ...', V.vd, vdHint(V), { fout:vdFout(V) }),
              keuze('Hoe eindigt ' + V.vd + '?', soort, ['op een d', 'op een t', 'op -en'], 'Kijk naar de laatste letters van ' + V.vd + '.'),
              invul('Dus voor het zelfstandig naamwoord schrijf je', adj, soort === 'op -en' ? 'Een voltooid deelwoord op -en blijft hetzelfde: ' + V.vd + '.' : V.vd + ' + e' + (adj.length > V.vd.length + 1 ? ', met een dubbele medeklinker zodat de klank kort blijft' : '') + '.', { fout:f }) ];
            return { context:'Vul de goede vorm in.', vraag:b.tekst, stappen:st, beeld:function(n){
              var h = tekenZin(b, n >= 3 ? { x:{ k:3, label:'', t:a[1].replace('{G}', adj) } } : {});
              if (n >= 1) h += R.teken.woord(n >= 2 && soort !== 'op -en' ? [{ t:V.vd, k:3, label:'voltooid deelwoord' }, { t:adj.slice(V.vd.length), k:4, label:'+ ' + adj.slice(V.vd.length) }] : [{ t:V.vd, k:3, label:'voltooid deelwoord' }]);
              return h; } };
          } },
        { id:'ww-gebiedend', naam:'De gebiedende wijs: Word lid!', kort:'Een bevel zonder onderwerp is alleen de stam: Kom binnen! Word lid!',
          uit:'<p>Met de <b>gebiedende wijs</b> geef je een bevel of een tip: Kom binnen! Word lid! Wacht even!</p><p>Er staat <b>geen onderwerp</b> in de zin. Je schrijft dan <b>alleen de stam</b>: Word lid! (niet Wordt lid!)</p><p>Staat er wel een onderwerp, zoals u, dan volg je de gewone regels: <b>Wordt u lid?</b> Komt u binnen?</p>',
          wanneer:'een zin begint met een werkwoord en eindigt met een uitroepteken.',
          maak:function(){
            var met = kans(.3), a = met ? kies(GEB_O) : kies(GEB), V = LEX[a[0]], ot = met ? a[2] : null, p = met ? persVan(ot) : 'geb', inv = true;
            var o = { t:ot || '', p:p }, b = bouw([{ t:a[1].replace('{G}', GAT(a[0])), rol:'x' }], ''), vorm = ottAlle(V, p, inv);
            var hint = met ? regelHint(o, inv) : 'Er staat geen onderwerp in de zin: het is een bevel. Dan schrijf je alleen de stam.';
            var st = [
              keuze('Staat er een onderwerp in de zin?', met ? 'ja: ' + ot : 'nee: het is een bevel', [met ? 'nee: het is een bevel' : 'ja: ' + kies(['u', 'jij', 'hij'])], met ? 'Wie doet het? ' + cap(ot) + ' staat in de zin.' : 'Zoek wie het doet. Staat er ik, jij, u of hij? Nee: je praat tegen iemand.'),
              keuze('Welke regel past?', regel(p, inv), [RS, RT, RH], hint, { fout:met ? regelFout(o, inv) : (function(){ var f = {}; f[RT] = 'Een bevel heeft geen onderwerp, dus ook geen t.'; return f; })() }),
              invul('Dus de goede vorm is', vorm, vormHint(V, o, inv), { fout:vormFout(V, o, inv, vorm) }) ];
            return { context:'Vul de goede vorm in.', vraag:b.tekst, stappen:st };
          } },
        { id:'ww-tijden', naam:'De tijden herkennen', kort:'Tegenwoordig of verleden, en voltooid of niet: zo vind je ott, ovt, vtt en vvt',
          uit:'<p>Er zijn vier tijden die je moet kennen. Je vindt ze met twee vragen.</p><p><b>1</b> Staat de persoonsvorm in de <b>tegenwoordige</b> of de <b>verleden</b> tijd? <b>2</b> Staat er een <b>voltooid deelwoord</b> in de zin? Dan is het voltooid, anders onvoltooid.</p><p><b>ott</b> ik werk, <b>ovt</b> ik werkte, <b>vtt</b> ik heb gewerkt, <b>vvt</b> ik had gewerkt.</p>',
          wanneer:'je een tekst in dezelfde tijd moet houden, of als de toets naar de tijd vraagt.',
          maak:function(){
            var F = kies(FR_ALG.filter(function(F){ var V = LEX[F.w]; return V.zwak || V.sterk; })), o = ondw(F), V = LEX[F.w], tijd = kies(['ott', 'ovt', 'vtt', 'vvt']), volg = kans(.65) ? 'n' : 'i', inv = volg === 'i';
            var tw = kies(tijd === 'ott' ? F.nu : F.toen), pv, vd = null;
            if (tijd === 'ott') pv = ott(V, o.p, inv); else if (tijd === 'ovt') pv = ovt(V, o.p);
            else { pv = tijd === 'vtt' ? auxV(F.aux, o.p, inv) : auxVt(F.aux, o.p); vd = V.vd; }
            var O = { t:o.t, rol:'o' }, P = { t:pv, rol:'pv' }, T = { t:tw, rol:'tw' }, X = { t:F.x, rol:'x' }, D = vd ? { t:vd, rol:'vd' } : null;
            var b = bouw(inv ? [T, P, O, X, D] : [O, P, T, X, D], '.');
            var tt = tijd === 'ott' || tijd === 'vtt';
            var st = [
              invul('Wat is de persoonsvorm?', pv, 'Zet de zin in een andere tijd of maak er een vraag van. Het werkwoord dat verandert of vooraan komt, is de persoonsvorm.'),
              keuze('Staat ' + pv + ' in de tegenwoordige of in de verleden tijd?', tt ? 'tegenwoordige tijd' : 'verleden tijd', [tt ? 'verleden tijd' : 'tegenwoordige tijd'], tt ? pv + ' is een vorm van nu.' : pv + ' is een vorm van vroeger: de verleden tijd.'),
              keuze('Staat er ook een voltooid deelwoord in de zin?', vd ? 'ja: ' + vd : 'nee', [vd ? 'nee' : 'ja'], vd ? 'Kijk naar het laatste werkwoord: ' + vd + ', na een vorm van hebben of zijn.' : 'Er staat maar één werkwoord in de zin.'),
              keuze('In welke tijd staat de zin?', tijd, ['ott', 'ovt', 'vtt', 'vvt'], 'o = onvoltooid (geen voltooid deelwoord), v = voltooid (wel). Dan t = tegenwoordig of v = verleden, en t = tijd.') ];
            return eindKeuze({ context:'In welke tijd staat deze zin?', vraag:b.tekst, stappen:st, beeld:function(n){
              var m = {}; if (n >= 1) m.pv = { k:2, label:'persoonsvorm' }; if (n >= 3 && vd) m.vd = { k:3, label:'voltooid deelwoord' };
              return tekenZin(b, m); } });
          } },
        { id:'ww-toekomend', naam:'De toekomende tijd: zal en zullen', kort:'Zal of zullen met een heel werkwoord: dat is de toekomende tijd (ottt)',
          uit:'<p>Praat je over later, dan kun je <b>zal</b> of <b>zullen</b> gebruiken met een heel werkwoord: ik zal morgen bellen, zij zullen komen.</p><p>Dat heet de <b>onvoltooid tegenwoordige toekomende tijd</b>, kort: <b>ottt</b>.</p><p>Let op de vormen: ik zal, jij zult (achter de pv: zul jij), u zult, hij zal, wij zullen. Jij zal en zal jij mogen ook.</p>',
          wanneer:'je zal of zullen in een zin ziet staan.',
          maak:function(){
            var F = kies(FR_ALG.filter(function(F){ var V = LEX[F.w]; return V.zwak || V.sterk; })), o = ondw(F), V = LEX[F.w], tijd = kans(.45) ? 'ottt' : kies(['ott', 'ovt', 'vtt', 'vvt']), volg = kans(.65) ? 'n' : 'i', inv = volg === 'i';
            var tw = kies(tijd === 'ott' || tijd === 'ottt' ? F.nu : F.toen), pv, rest = null;
            if (tijd === 'ott') pv = ott(V, o.p, inv); else if (tijd === 'ovt') pv = ovt(V, o.p);
            else if (tijd === 'ottt'){ pv = auxV('zal', o.p, inv); rest = { t:V.h, rol:'inf' }; }
            else { pv = tijd === 'vtt' ? auxV(F.aux, o.p, inv) : auxVt(F.aux, o.p); rest = { t:V.vd, rol:'vd' }; }
            var O = { t:o.t, rol:'o' }, P = { t:pv, rol:'pv' }, T = { t:tw, rol:'tw' }, X = { t:F.x, rol:'x' };
            var b = bouw(inv ? [T, P, O, X, rest] : [O, P, T, X, rest], '.'), zal = tijd === 'ottt', vd = /^v/.test(tijd);
            var st = [
              keuze('Staat er een vorm van zullen in de zin (zal, zult, zul, zullen)?', zal ? 'ja: ' + pv : 'nee', [zal ? 'nee' : 'ja'], 'Kijk naar de persoonsvorm: ' + pv + '.'),
              keuze('Staat er een voltooid deelwoord in de zin?', vd ? 'ja: ' + V.vd : 'nee', [vd ? 'nee' : 'ja'], vd ? 'Het laatste werkwoord is ' + V.vd + ': een voltooid deelwoord.' : zal ? 'Achteraan staat ' + V.h + ': dat is een heel werkwoord, geen voltooid deelwoord.' : 'Er staat maar één werkwoord in de zin.'),
              keuze('In welke tijd staat de zin?', tijd, ['ott', 'ovt', 'vtt', 'vvt', 'ottt'], zal ? 'Zal of zullen met een heel werkwoord: de toekomende tijd, ottt.' : 'Geen zal of zullen: kies uit ott, ovt, vtt en vvt. Is ' + pv + ' tegenwoordig of verleden? En is er een voltooid deelwoord?') ];
            return eindKeuze({ context:'In welke tijd staat deze zin?', vraag:b.tekst, stappen:st, beeld:function(n){
              var m = {}; if (n >= 1) m.pv = { k:2, label:'persoonsvorm' }; if (n >= 2 && rest) m[rest.rol] = { k:3, label:rest.rol === 'vd' ? 'voltooid deelwoord' : 'heel werkwoord' };
              return tekenZin(b, m); } });
          } },
        { id:'ww-jouw', naam:'Je zus, jouw broer: geen jij', kort:'Staat er je zus of jouw broer achter de pv, dan is het onderwerp hij of zij: wordt je zus',
          uit:'<p>Word jij veertien? Daar valt de t weg, want <b>jij</b> staat achter de persoonsvorm.</p><p>Maar: <b>Wordt jouw broer</b> veertien? <b>Wordt je zus</b> veertien? Hier is het onderwerp niet jij, maar jouw broer en je zus. Dat is hij of zij: dus stam + t.</p><p>Het trucje: laat jouw of je weg. Wordt broer? Dan hoor je dat het over hij gaat. Je betekent hier jouw.</p>',
          wanneer:'er je of jouw achter de persoonsvorm staat.',
          maak:function(){
            var JOUW = [{ t:'jouw broer', p:'3' }, { t:'je zus', p:'3' }, { t:'jouw moeder', p:'3' }, { t:'je vader', p:'3' }, { t:'jouw beste vriend', p:'3' }, { t:'je opa', p:'3' }, { t:'jouw buurvrouw', p:'3' }, { t:'je nichtje', p:'3' }, { t:'jouw ouders', p:'mv' }, { t:'je vrienden', p:'mv' }];
            var F = kies(FR_OTT), o = kans(.65) ? kies(JOUW) : kies([ONDW[1], ONDW[2]]), volg = kans(.5) ? 'i' : 'v';
            if (F.s === 'e' && o.p === 'mv') o = kies(JOUW.slice(0, 8));
            var V = LEX[F.w], b = zinF(F, o, 'ott', volg), inv = true, eigen = o.p === '2';
            var st = [
              stOnderwerp(b, F, o),
              keuze('Is het onderwerp zelf jij of je?', eigen ? 'ja' : 'nee: ' + (o.p === 'mv' ? 'het zijn er meer' : 'het is hij of zij'), [eigen ? (kans(.5) ? 'nee: het is hij of zij' : 'nee: het zijn er meer') : 'ja'],
                eigen ? 'Er staat alleen ' + o.t + '. Dat is het onderwerp.' : 'Laat ' + o.t.split(' ')[0] + ' weg: ' + o.t.split(' ').slice(1).join(' ') + '. Dan zie je dat het niet over jij gaat.'),
              stRegel(o, inv),
              stVormOtt(V, o, inv) ];
            return { context:CTX, vraag:b.tekst, stappen:st, beeld:function(n){
              var m = { gat:{ k:2, label:'persoonsvorm' } }; if (n >= 1) m.o = { k:1, label:'onderwerp' }; if (n >= 4) m.gat.t = [].concat(ottAlle(V, o.p, inv))[0];
              return tekenZin(b, m) + (n >= 3 ? woordOtt(V, o, inv) : ''); } };
          } }
      ] },

    { groep:{ id:'ww-lastig', niveau:'3F', domein:'werkwoorden', naam:'Lastige werkwoorden', uit:'Engelse werkwoorden in alle tijden, een dubbele d of t in de verleden tijd, samengestelde werkwoorden, hebben en kunnen, en een lastig onderwerp.' },
      doelen:[
        { id:'ww-eng-tijden', naam:'Engelse werkwoorden in alle tijden', kort:'Hij updatet, hij updatete, geüpdatet: de Nederlandse regels met de Engelse stam',
          uit:'<p>Een Engels werkwoord krijgt de <b>Nederlandse regels</b>. De stam is het Engelse woord: <b>update</b>, <b>race</b>, <b>chat</b>.</p><p>Tegenwoordige tijd: hij update + t = <b>hij updatet</b>, hij racet. Verleden tijd: stam + te of de, met de laatste <b>klank</b> in \'t kofschip: hij <b>updatete</b>, hij racete, zij recyclede. Voltooid deelwoord: <b>geüpdatet</b>, geracet.</p><p>Het ziet er vreemd uit, maar zo is het goed.</p>',
          wanneer:'je een Engels werkwoord moet vervoegen.',
          maak:function(){
            var F = kies(FR_ENG), o = ondw(F), V = LEX[F.w], soort = kies(['ott', 'ovt', 'vd']), volg = volgorde(.5);
            var namen = { ott:'persoonsvorm, tegenwoordige tijd', ovt:'persoonsvorm, verleden tijd', vd:'voltooid deelwoord' };
            var b = zinF(F, o, soort, volg), inv = b.inv, st = [
              keuze('Welke vorm moet er op de plek van het gat?', namen[soort], [namen.ott, namen.ovt, namen.vd].filter(function(x){ return x !== namen[soort]; }),
                soort === 'vd' ? 'Er staat al een persoonsvorm (' + b.aux + '): het gat is een voltooid deelwoord.' : 'Het gat is de persoonsvorm. Kijk naar het tijdwoord "' + b.tw + '".'),
              stStam(V) ];
            if (soort === 'ott'){ st.push(stRegel(o, inv)); st.push(stVormOtt(V, o, inv)); }
            else if (soort === 'ovt'){ st.push(teDe(V, o.p)); st.push(stVormOvt(V, o.p)); }
            else { st.push(tdKeuze(V)); st.push(stVormVd(V)); }
            var vorm = soort === 'ott' ? ott(V, o.p, inv) : soort === 'ovt' ? ovt(V, o.p) : V.vd;
            return { context:CTX, vraag:b.tekst, stappen:st, beeld:function(n){
              var m = { gat:{ k:2, label:soort === 'vd' ? 'voltooid deelwoord' : 'persoonsvorm' }, o:{ k:1, label:'onderwerp' } };
              if (n >= st.length) m.gat.t = vorm;
              return tekenZin(b, m) + (n >= 2 ? R.teken.woord([{ t:V.s, k:3, label:'stam' }]) : ''); } };
          } },
        { id:'ww-ovt-dt', naam:'Antwoordde, praatte: dubbele letter', kort:'Eindigt de stam op d of t, dan staan er in de verleden tijd twee d\'s of t\'s: antwoord + de',
          uit:'<p>Eindigt de stam op een <b>d</b>, dan wordt het in de verleden tijd stam + de: antwoord + de = <b>antwoordde</b>. Twee d\'s!</p><p>Eindigt de stam op een <b>t</b>, dan stam + te: praat + te = <b>praatte</b>, wacht + te = wachtte.</p><p>Je hoort maar één d of t, maar je schrijft ze allebei: de laatste letter van de stam en de eerste van de uitgang.</p>',
          wanneer:'de stam eindigt op d of t en het is verleden tijd.',
          maak:function(){ var F = kies(FR_D.concat(FR_T).filter(function(F){ var V = LEX[F.w]; return V.zwak && !F.o; })), o = ondw(F); return opgOvt(F, o, volgorde(.6), ['stam', 'tede', 'vorm']); } },
        { id:'ww-scheidbaar', naam:'Opbellen: hij belt op, opgebeld', kort:'Een scheidbaar werkwoord gaat uit elkaar; ge- komt in het midden: opgebeld',
          uit:'<p>Sommige werkwoorden gaan in een zin <b>uit elkaar</b>: opbellen wordt hij <b>belt</b> oma <b>op</b>. Aanbieden wordt zij <b>biedt</b> hulp <b>aan</b>.</p><p>De persoonsvorm maak je van het tweede deel: bellen, dus hij belt; bieden, dus hij biedt (stam op d + t).</p><p>In het voltooid deelwoord komt <b>ge- in het midden</b>: op + ge + beld = <b>opgebeld</b>, aangeboden, meegedaan.</p>',
          wanneer:'het werkwoord begint met een woordje als op, aan, af, mee, uit of in.',
          maak:function(){
            var F = kies(FR_SCH), K = LEX[F.k], o = ondw(F), soort = kies(['ott', 'ott', 'ovt', 'vd']), tw = kies(soort === 'ott' ? F.nu : F.toen), volg = kans(.6) ? 'n' : 'i', inv = volg === 'i';
            var O = { t:o.t, rol:'o' }, G = { t:GAT(F.w), rol:'gat' }, T = { t:tw, rol:'tw' }, X = { t:F.x, rol:'x' }, D = { t:F.d, rol:'deel' }, P, b, vorm;
            if (soort === 'vd'){ var A = { t:auxV(F.aux, o.p, inv), rol:'aux' }; P = inv ? [T, A, O, X, G] : [O, A, T, X, G]; vorm = F.d + K.vd; }
            else { P = inv ? [T, G, O, X, D] : [O, G, T, X, D]; vorm = soort === 'ott' ? ott(K, o.p, inv) : ovt(K, o.p); }
            b = bouw(P, '.');
            var namen = { ott:'persoonsvorm, tegenwoordige tijd', ovt:'persoonsvorm, verleden tijd', vd:'voltooid deelwoord' };
            var st = [
              keuze('Welke vorm moet er op de plek van het gat?', namen[soort], [namen.ott, namen.ovt, namen.vd].filter(function(x){ return x !== namen[soort]; }),
                soort === 'vd' ? 'Er staat al een persoonsvorm (' + A.t + '): het gat is een voltooid deelwoord.' : 'Achteraan staat "' + F.d + '": het werkwoord is uit elkaar gegaan. Het gat is de persoonsvorm. Kijk naar "' + tw + '".'),
              invul('Haal "' + F.d + '" eraf. Welk werkwoord blijft er over?', F.k, F.w + ' = ' + F.d + ' + ...') ];
            if (soort === 'vd') st.push(invul('Dus het voltooid deelwoord is', vorm, 'Het voltooid deelwoord van ' + F.k + ' is ' + K.vd + '. Zet ' + F.d + ' ervoor: ' + F.d + ' + ' + K.vd + '.', { fout:(function(){ var f = {}; f['ge' + F.d + K.vd.replace(/^ge/, '')] = 'Ge- komt in het midden: ' + F.d + ' + ge + ...'; f[K.vd] = 'Je vergat ' + F.d + ' ervoor.'; return f; })() }));
            else if (soort === 'ott') st.push(stVormOtt(K, o, inv, 'Dus de persoonsvorm (van ' + F.k + ') is'));
            else st.push(invul('Dus de persoonsvorm (van ' + F.k + ') is', vorm, vormOvtHint(K, o.p), { fout:vormOvtFout(K, o.p) }));
            return { context:CTX, vraag:b.tekst, stappen:st, beeld:function(n){
              var m = { gat:{ k:2, label:soort === 'vd' ? 'voltooid deelwoord' : 'persoonsvorm' } };
              if (n >= 2 && soort !== 'vd') m.deel = { k:4, label:'hoort erbij' };
              if (n >= 3) m.gat.t = vorm;
              return tekenZin(b, m) + (soort === 'vd' && n >= 3 ? R.teken.woord([{ t:F.d, k:4, label:F.d }, { t:K.vd, k:3, label:'van ' + F.k }]) : ''); } };
          } },
        { id:'ww-vast', naam:'Voetballen: hij voetbalt, gevoetbald', kort:'Een vast samengesteld werkwoord blijft één woord: ge- komt ervoor, de regels gelden gewoon',
          uit:'<p>Voetballen, stofzuigen en glimlachen zijn ook uit twee woorden gemaakt. Maar ze gaan <b>niet uit elkaar</b>: hij <b>voetbalt</b>, niet hij balt voet.</p><p>Je behandelt ze als één gewoon werkwoord. De stam: voetbal. Hij voetbal + t = <b>voetbalt</b>. Verleden tijd: <b>voetbalde</b>. Voltooid deelwoord: ge- ervoor, <b>gevoetbald</b>, gestofzuigd, geglimlacht.</p>',
          wanneer:'een werkwoord uit twee woorden niet uit elkaar gaat.',
          maak:function(){
            var F = kies(FR_VAST), V = LEX[F.w], o = ondw(F), soort = kies(['ott', 'ovt', 'vd']), volg = volgorde(.55), b = zinF(F, o, soort, volg), inv = b.inv;
            var namen = { ott:'persoonsvorm, tegenwoordige tijd', ovt:'persoonsvorm, verleden tijd', vd:'voltooid deelwoord' };
            var st = [
              keuze('Gaat ' + F.w + ' in een zin uit elkaar?', 'nee: het blijft één woord', ['ja: het gaat uit elkaar'], 'Zeg: hij ' + ott(V, '3', false) + '. Je zegt niet dat de woorden los staan. Het blijft één werkwoord.'),
              keuze('Welke vorm moet er op de plek van het gat?', namen[soort], [namen.ott, namen.ovt, namen.vd].filter(function(x){ return x !== namen[soort]; }),
                soort === 'vd' ? 'Er staat al een persoonsvorm (' + b.aux + '): het gat is een voltooid deelwoord.' : 'Het gat is de persoonsvorm. Kijk naar het tijdwoord "' + b.tw + '".') ];
            var vorm;
            if (soort === 'ott'){ st.push(stVormOtt(V, o, inv)); vorm = ott(V, o.p, inv); }
            else if (soort === 'ovt'){ st.push(stVormOvt(V, o.p)); vorm = ovt(V, o.p); }
            else { st.push(stVormVd(V)); vorm = V.vd; }
            return { context:CTX, vraag:b.tekst, stappen:st, beeld:function(n){
              var m = { gat:{ k:2, label:soort === 'vd' ? 'voltooid deelwoord' : 'persoonsvorm' }, o:{ k:1, label:'onderwerp' } }; if (n >= 3) m.gat.t = vorm;
              return tekenZin(b, m) + (n >= 1 ? R.teken.woord([{ t:V.s, k:3, label:'stam: één woord' }]) : ''); } };
          } },
        { id:'ww-hebben', naam:'Hebben, zijn en "hun hebben"', kort:'Ik heb, jij hebt, hij heeft; ik ben, jij bent, hij is. En hun is nooit het onderwerp',
          uit:'<p><b>Hebben</b> en <b>zijn</b> volgen hun eigen vormen. Hebben: ik heb, jij hebt (heb jij?), u hebt of heeft, hij <b>heeft</b>, wij hebben. Zijn: ik ben, jij bent (ben jij?), u bent, hij <b>is</b>, wij zijn.</p><p>En dan de bekende fout: <b>hun hebben</b>. Hun kan nooit het onderwerp zijn. Het moet <b>zij hebben</b> gewonnen.</p><p>Hun gebruik je wel als het niet het onderwerp is: ik heb hun een kaartje gestuurd.</p>',
          wanneer:'je hebben of zijn gebruikt, of twijfelt tussen hun en zij.',
          maak:function(){
            if (kans(.35)){
              var h = kies(HUN), b0 = bouw([{ t:h[0].replace('{K}', '(zij/hun) __'), rol:'x' }], ''), ond = h[1] === 'zij';
              var st0 = [
                keuze('Is het woord op de plek van het gat het onderwerp? Vraag: wie of wat + persoonsvorm?', ond ? 'ja: het is het onderwerp' : 'nee: het is niet het onderwerp', [ond ? 'nee: het is niet het onderwerp' : 'ja: het is het onderwerp'],
                  ond ? 'Vraag wie het doet. Dat zijn zij: het onderwerp.' : 'Het onderwerp staat er al. Het gat is degene aan wie iets gegeven of gestuurd wordt.'),
                keuze('Welk woord moet er staan?', h[1], [h[1] === 'zij' ? 'hun' : 'zij'], ond ? 'Hun is nooit het onderwerp. Het onderwerp is zij.' : 'Het is niet het onderwerp: dan is hun goed.', { fout:{ hun:'Hun kan nooit het onderwerp zijn. Zeg: zij hebben.', zij:'Zij gebruik je als onderwerp. Hier staat het onderwerp er al.' } }) ];
              return eindKeuze({ context:'Kies het goede woord.', vraag:b0.tekst, stappen:st0 });
            }
            var a = kies(HZ_RAAM), w = a[0], F = { w:w, x:a[1], nu:a[2].split('/'), toen:['gisteren'], s:'a' }, o = ondw(F, w === 'zijn' ? function(o){ return o.p !== 'u'; } : null), volg = volgorde(.5), b = zinF(F, o, 'ott', volg), inv = b.inv;
            var vorm = hzVorm(w, o.p, inv), eerst = [].concat(vorm)[0], T = HZ[w];
            var tabel = 'ik ' + T['1'] + ', jij ' + [].concat(T['2'])[0] + ', ' + [].concat(T['2i'])[0] + ' jij, u ' + [].concat(T.u)[0] + ', hij ' + T['3'] + ', wij ' + T.mv;
            var f = {}; if (w === 'hebben'){ f.hebt = 'Bij hij, zij en het is het heeft.'; f.heeft = 'Heeft gebruik je bij hij, zij, het (en u).'; f.hebben = 'Hebben is voor meer personen.'; f.heb = 'Heb is voor ik, of voor jij achter de persoonsvorm.'; }
            else { f.bent = 'Bent is voor jij, je en u voor de persoonsvorm.'; f.is = 'Is is voor hij, zij en het.'; f.ben = 'Ben is voor ik, of voor jij achter de persoonsvorm.'; f.zijn = 'Zijn is voor meer personen.'; }
            [].concat(vorm).forEach(function(x){ delete f[x]; });
            var st = [ stOnderwerp(b, F, o),
              keuze('Staat ' + o.t + ' voor of achter de persoonsvorm?', inv ? 'achter de persoonsvorm' : 'voor de persoonsvorm', [inv ? 'voor de persoonsvorm' : 'achter de persoonsvorm'], 'Kijk in de zin: staat ' + o.t + ' voor het gat of erna?'),
              invul('Dus de goede vorm van ' + w + ' is', vorm, w + ': ' + tabel + '.', { fout:f }) ];
            return { context:CTX, vraag:b.tekst, stappen:st, beeld:function(n){
              var m = { gat:{ k:2, label:'persoonsvorm' } }; if (n >= 1) m.o = { k:1, label:'onderwerp' }; if (n >= 3) m.gat.t = eerst;
              return tekenZin(b, m); } };
          } },
        { id:'ww-kunnen', naam:'Kunnen, zullen, willen, mogen', kort:'Ik kan, jij kunt (kun jij?), hij kan; ik mag, jij mag, hij mag: nooit magt',
          uit:'<p>Deze werkwoorden hebben hun eigen vormen. <b>Kunnen</b>: ik kan, jij kunt, kun jij?, u kunt, hij kan. <b>Zullen</b>: ik zal, jij zult, zul jij?, hij zal. <b>Willen</b>: ik wil, jij wilt, wil jij?, hij wil.</p><p>Bij jij en u mag ook kan, zal en wil, maar kunt, zult en wilt zijn netter. Bij hij komt er <b>nooit een t</b>: hij kan, hij zal, hij wil.</p><p><b>Mogen</b> krijgt nooit een t: ik mag, jij mag, hij mag.</p>',
          wanneer:'je kunnen, zullen, willen of mogen gebruikt.',
          maak:function(){
            var w = kies(['kunnen', 'kunnen', 'zullen', 'willen', 'mogen']), F = kies(FR_ALG.filter(function(F){ return F.aux; })), o = ondw(F), volg = volgorde(.45), inv = volg !== 'n';
            var tw = w === 'zullen' ? kies(['morgen', 'straks', 'volgende week', 'later']) : kies(F.nu), O = { t:o.t, rol:'o' }, G = { t:GAT(w), rol:'gat' }, T = { t:tw, rol:'tw' }, X = { t:F.x, rol:'x' }, I = { t:F.w, rol:'inf' };
            var b = bouw(volg === 'n' ? [O, G, T, X, I] : volg === 'i' ? [T, G, O, X, I] : [G, O, T, X, I], volg === 'v' ? '?' : '.'); b.tw = tw;
            var vorm = hzVorm(w, o.p, inv), Tb = HZ[w];
            var tabel = 'ik ' + Tb['1'] + ', jij ' + [].concat(Tb['2'])[0] + ', ' + [].concat(Tb['2i'])[0] + ' jij, u ' + [].concat(Tb.u)[0] + ', hij ' + Tb['3'] + ', wij ' + Tb.mv;
            var f = {}, wie = {}, NAAM = { '1':'ik', '2':'jij', '2i':'jij achter de persoonsvorm', u:'u', '3':'hij, zij, het', mv:'meer personen' };
            Object.keys(NAAM).forEach(function(k){ [].concat(Tb[k]).forEach(function(x){ (wie[x] = wie[x] || []).push(NAAM[k]); }); });
            Object.keys(wie).concat([Tb['3'] + 't']).forEach(function(x){
              if ([].concat(vorm).indexOf(x) >= 0 || f[x]) return;
              f[x] = wie[x] ? cap(x) + ' hoort bij ' + wie[x].join(' en ') + '. Kijk goed naar het onderwerp: ' + o.t + '.' : 'Die vorm bestaat niet: ' + tabel + '.';
            });
            var st = [ stOnderwerp(b, F, o),
              keuze('Staat ' + o.t + ' voor of achter de persoonsvorm?', inv ? 'achter de persoonsvorm' : 'voor de persoonsvorm', [inv ? 'voor de persoonsvorm' : 'achter de persoonsvorm'], 'Kijk in de zin: staat ' + o.t + ' voor het gat of erna?'),
              invul('Dus de goede vorm van ' + w + ' is', vorm, w + ': ' + tabel + '.', { fout:f }) ];
            return { context:CTX, vraag:b.tekst, stappen:st, beeld:function(n){
              var m = { gat:{ k:2, label:'persoonsvorm' } }; if (n >= 1) m.o = { k:1, label:'onderwerp' }; if (n >= 3) m.gat.t = [].concat(vorm)[0];
              var h = tekenZin(b, m);
              if (n >= 3) h += R.teken.tabel([['ik', 'jij', 'jij (achter)', 'u', 'hij, zij', 'meer'], [Tb['1'], [].concat(Tb['2']).join(' / '), [].concat(Tb['2i']).join(' / '), [].concat(Tb.u).join(' / '), Tb['3'], Tb.mv]], { kop:true });
              return h; } };
          } },
        { id:'ww-lastig-onderwerp', naam:'Een lastig onderwerp', kort:'Zoek de kern: een groep leerlingen gaat (de groep), er staan veel fietsen (de fietsen)',
          uit:'<p>Soms is het onderwerp lastig. Zoek dan de <b>kern</b>: het belangrijkste woord.</p><p><b>Een groep leerlingen gaat</b> naar het museum: de kern is groep, en dat is één groep. <b>De doos met koekjes staat</b> in de kast: het gaat om de doos.</p><p>Bij <b>er</b> staat het onderwerp achter de persoonsvorm: <b>er staan veel fietsen</b>, er ligt een boek. Er is nooit het onderwerp.</p>',
          wanneer:'het onderwerp lang is, met "en" of "van" erin, of als de zin met er begint.',
          maak:function(){
            var a = kies(LO), V = LEX[a[1]], o = { t:a[2], p:a[4] }, b = bouw([{ t:a[0].replace('{G}', GAT(a[1])), rol:'x' }], '');
            var vorm = ott(V, o.p, false), d = a[5];
            var st = [
              keuze('Wat is het onderwerp? Vraag: wie of wat + persoonsvorm?', a[2], [d].concat(eind(d, a[2].split(' ').slice(-1)[0]) ? [] : [a[2].split(' ').slice(-1)[0]]).filter(function(x){ return x !== a[2]; }),
                /^Er /.test(a[0]) ? 'Er is nooit het onderwerp. Kijk wat er na de persoonsvorm komt.' : 'Neem het hele stuk dat de handeling doet, niet alleen een woord eruit.'),
              keuze('De kern van het onderwerp is "' + a[3] + '". Is dat één, of zijn het er meer?', a[4] === 'mv' ? 'meer dan één' : 'één', [a[4] === 'mv' ? 'één' : 'meer dan één'],
                a[4] === 'mv' ? 'Kijk naar ' + a[3] + ': dat zijn er meer.' : 'Het gaat om ' + a[3] + ': dat is één.'),
              invul('Dus de goede vorm is', vorm, a[4] === 'mv' ? 'Meer dan één: het hele werkwoord, ' + V.h + '.' : 'Eén: stam ' + V.s + (eind(V.s, 't') ? ', die al op een t eindigt.' : ' + t.'), { fout:vormFout(V, o, false, vorm) }) ];
            return { context:CTX, vraag:b.tekst, stappen:st, beeld:function(n){
              var t = a[0].replace('{G}', n >= 3 ? vorm : GAT(a[1]));
              var i = t.toLowerCase().indexOf(a[2].toLowerCase());
              if (n < 1 || i < 0) return R.teken.zin([t]);
              return R.teken.zin([t.slice(0, i).trim(), { t:t.substr(i, a[2].length), k:1, label:'onderwerp, kern: ' + a[3] }, t.slice(i + a[2].length).trim()].filter(function(x){ return x; }));
            } };
          } }
      ] }
  ]);
})();
