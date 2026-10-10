/* De leerroute Nederlands, spelling (zonder werkwoordspelling): klanken en lettergrepen,
   verdubbelen en verenkelen, lastige klanken, uitgangen, samenstellingen, hoofdletters,
   tekens in woorden, leenwoorden en de lastigste gevallen. Elke regel een eigen doel.
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  /* ---------- hulpjes ---------- */
  /* woorden met een gat schrijven we als 'tr[ei]n' */
  function vol(w){ return w.replace(/[\[\]]/g, ''); }
  function gat(w){ return w.replace(/\[[^\]]*\]/, '…'); }
  function delen(w){ var m = /^([^\[]*)\[([^\]]*)\](.*)$/.exec(w); return m ? [m[1], m[2], m[3]] : [w, '', '']; }
  function kern(w){ return delen(w)[1]; }
  /* het woord met het gat gekleurd: zolang het niet open is staat er een vraagteken */
  function gatBeeld(R, w, open, label){
    var d = delen(w), uit = [];
    if (d[0]) uit.push({ t:d[0], k:0 });
    uit.push({ t:open ? d[1] : '?', k:1, label:open ? label : '' });
    if (d[2]) uit.push({ t:d[2], k:0 });
    return R.teken.woord(uit);
  }
  /* een keuzestap met gehusselde opties */
  function kies1(R, tekst, goed, fout, hint, extra){
    var opt = R.hussel([goed].concat(fout.filter(function(f, i){ return f !== goed && fout.indexOf(f) === i; })));
    var s = { tekst:tekst, opties:opt, goed:opt.indexOf(goed), hint:hint };
    if (extra) for (var k in extra) s[k] = extra[k];
    return s;
  }
  /* een keuzestap met opties in vaste volgorde (kort/lang, ja/nee) */
  function vast(tekst, opties, goed, hint, extra){
    var s = { tekst:tekst, opties:opties.slice(), goed:opties.indexOf(goed), hint:hint };
    if (extra) for (var k in extra) s[k] = extra[k];
    return s;
  }
  /* is de laatste stap een keuze, dan is de eindvraag bij Zelf ook die keuze */
  function slot(op){
    var st = op.stappen[op.stappen.length - 1];
    if (st.opties){ op.opties = st.opties; op.goed = st.goed; }
    return op;
  }
  function q(t){ return '<b>' + t + '</b>'; }
  function trek(R, lijst){ return R.kies(lijst); }
  var KLINKERS = /(ij|aa|ee|oo|uu|ie|oe|eu|ei|ui|ou|au|[aeiouyëïé])/g;

  /* ========== FUNDAMENT ========== */
  /* lettergrepen (afbreken volgens het Groene Boekje) */
  var GREPEN = ['ta-fel', 'ap-pel', 'boe-ken', 'ka-bou-ter', 'o-li-fant', 'ver-jaar-dag', 'schoe-nen', 'kip-pen', 'slin-ger', 'war-me',
    'bloe-men', 'ra-men', 'zon-ne-bloem', 'pa-ra-plu', 'ba-na-nen', 'ko-nijn', 'lan-taarn', 'voet-bal-len', 'bak-ker', 'kik-ker',
    'schaat-sen', 'fiet-sen', 'le-pel', 'vo-gel', 're-gen-boog', 'te-le-vi-sie', 'cho-co-la-de', 'bo-ter-ham', 'a-vond', 'ham-ster',
    'win-kel', 'zin-gen', 'kas-teel', 'to-ma-ten', 'ko-nij-nen', 'pot-lood', 'va-kan-tie', 'gi-taar', 'le-raar', 'pan-nen-koek',
    'meis-je', 'eek-hoorn', 'mu-ziek', 'di-no-sau-rus', 'ijs-beer', 'zwem-bad', 'zie-ken-huis', 'bood-schap-pen', 'o-ma', 'ver-haal'];
  function foutGrepen(p){
    var w = p.join(''), grens = [], s = 0, uit = [];
    p.slice(0, -1).forEach(function(x){ s += x.length; grens.push(s); });
    grens.forEach(function(g, i){
      [-1, 1].forEach(function(d){
        var nieuw = grens.slice(); nieuw[i] = g + d;
        var ok = nieuw.every(function(x, j){ return x > (j ? nieuw[j - 1] : 0) && x < w.length; });
        if (!ok) return;
        var stukken = [], v = 0; nieuw.forEach(function(x){ stukken.push(w.slice(v, x)); v = x; }); stukken.push(w.slice(v));
        var t = stukken.join('-'); if (t !== p.join('-') && uit.indexOf(t) < 0) uit.push(t);
      });
    });
    return uit;
  }
  var KORT = ['bak', 'kip', 'pot', 'bus', 'pen', 'mol', 'zon', 'hek', 'vis', 'lat', 'dak', 'bed', 'put', 'mus', 'rok', 'kat', 'pit', 'bel', 'hut', 'tak',
    'kam', 'stok', 'bril', 'kop', 'pet', 'zak', 'lamp', 'tent', 'kist', 'melk'];
  var LANG = ['baan', 'maan', 'boom', 'been', 'muur', 'raam', 'kaas', 'zeep', 'boot', 'vuur', 'roos', 'buur', 'haar', 'zaal', 'teen', 'peer', 'oor', 'uur',
    'schaap', 'straat', 'jaar', 'poot', 'brood', 'steen', 'beer', 'deeg', 'rook', 'zuur'];
  var OPEN = ['ma-ken', 'ra-men', 'bo-men', 'le-zen', 'ko-ken', 'va-ren', 'sla-pen', 'bo-ter', 'ta-fel', 'le-pel', 'vo-gel', 'ro-zen', 'ne-men', 'mu-ren',
    'ja-ren', 'po-ten', 'ze-ker', 'ba-nen', 'wa-ter', 'ho-ning', 'la-den', 'ste-nen', 'pe-ren', 'be-zem', 'ko-ning', 'o-ma', 'zo-mer'];
  var DICHT = ['bak-ken', 'kip-pen', 'pot-ten', 'war-me', 'kan-ten', 'win-kel', 'vin-ger', 'ap-pel', 'kik-ker', 'mon-den', 'ber-gen', 'lam-pen', 'hel-pen',
    'ham-ster', 'bal-len', 'pen-nen', 'vis-sen', 'tak-ken', 'kas-teel', 'bus-sen', 'ster-ren', 'zus-sen', 'mos-sel', 'pin-da', 'wor-tel', 'kan-toor', 'len-te', 'tan-te', 'ker-sen'];
  /* verdubbelen: korte klank, meervoud met dubbele medeklinker */
  var DUBBEL = ['bal', 'kip', 'pot', 'bus', 'pen', 'mol', 'hek', 'vis', 'lat', 'kat', 'pit', 'bel', 'hut', 'tak', 'rok', 'mus', 'put', 'pop', 'kam', 'bom',
    'stok', 'bril', 'kop', 'pet', 'bed', 'kar', 'ton', 'mes', 'zak', 'bok', 'web', 'kom', 'ster'];
  /* verenkelen: lange klank, meervoud met een enkele klinker */
  var ENKEL = ['raam', 'boom', 'been', 'muur', 'boot', 'haan', 'peer', 'buur', 'uur', 'schaap', 'straat', 'jaar', 'poot', 'noot', 'zoon', 'traan', 'steen',
    'teen', 'zaal', 'taal', 'baan', 'deel', 'spoor', 'school', 'boon', 'kraan', 'schuur', 'oor'];
  var WW_KORT = ['bak', 'stop', 'zet', 'leg', 'pak', 'ren', 'zwem', 'bel', 'klap', 'knip', 'vul', 'kus', 'zit', 'pas'];
  var WW_LANG = ['maak', 'haal', 'neem', 'hoor', 'stuur', 'loop', 'kook', 'raap', 'slaap', 'smeer', 'leer', 'spaar', 'veeg', 'roep'];
  function klinkerVan(w){ var m = /aa|ee|oo|uu|[aeiou]/.exec(w); return m[0]; }
  function verdubbel(w){ var c = w.charAt(w.length - 1); return { mv:w + c + 'en', a:w, b:c + 'en', c:c, fout:w + 'en', foutA:w.slice(0, -1), foutB:c + 'en' }; }
  function verenkel(w){
    var m = /^(.*?)(aa|ee|oo|uu)(.*)$/.exec(w);
    return { mv:m[1] + m[2].charAt(0) + m[3] + 'en', a:m[1] + m[2].charAt(0), b:m[3] + 'en', fout:w + 'en', foutA:m[1] + m[2].charAt(0) + m[3], foutB:m[3] + 'en' };
  }
  /* roep heeft oe: geen verenkeling, maar ook geen verdubbeling (oe is altijd twee letters) */
  WW_LANG = WW_LANG.filter(function(w){ return /aa|ee|oo|uu/.test(w); });

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'spel-klank', niveau:'basis', domein:'spelling', naam:'Klanken en lettergrepen',
        uit:'Spelling begint bij luisteren. Hoeveel stukjes heeft een woord, is een klank kort of lang, en eindigt een lettergreep op een klinker of niet? Daar hangen bijna alle regels aan.' },
      doelen:[
        { id:'spel-klank-grepen', naam:'Lettergrepen klappen', kort:'Elke lettergreep heeft één klinkerklank: klap het woord en tel',
          uit:'<p>Een woord bestaat uit <b>lettergrepen</b>. Zeg het woord langzaam en klap bij elk stukje: <b>ta-fel</b> is twee klappen.</p><p>Elke lettergreep heeft precies één <b>klinkerklank</b>, zoals a, ee, ou of ie. Tel je de klinkerklanken, dan weet je hoeveel lettergrepen er zijn.</p><p>Staat er één medeklinker tussen twee klinkers, dan gaat hij naar de volgende lettergreep: ta-fel. Staan er twee, dan knip je ertussen: ap-pel.</p>',
          wanneer:'je een woord moet afbreken of wilt weten of een klank kort of lang is.',
          maak:function(R){
            var w = R.kies(GREPEN), p = w.split('-'), woord = p.join(''), kl = woord.match(KLINKERS);
            var fout = R.hussel(foutGrepen(p)).slice(0, 2);
            return slot({ vraag:woord, context:'Verdeel het woord in lettergrepen.',
              beeld:function(n){ return n >= 2 ? R.teken.woord(p.map(function(x, i){ return { t:x, k:1 + i % 3 }; })) : R.teken.woord([{ t:woord, k:0 }]); },
              stappen:[
                { tekst:'Zeg ' + q(woord) + ' langzaam en klap. Hoeveel klinkerklanken hoor je?', antwoord:String(p.length),
                  hint:'De klinkerklanken zijn: ' + kl.join(', ') + '. Elke klinkerklank is een klap.' },
                kies1(R, 'Welke verdeling klopt?', w, fout, 'Elk stukje heeft één klinkerklank. Eén medeklinker tussen twee klinkers gaat naar het volgende stukje (ta-fel), twee medeklinkers knip je uit elkaar (ap-pel).') ] });
          } },
        { id:'spel-klank-kortlang', naam:'Korte en lange klanken', kort:'Eén klinker in een gesloten lettergreep is kort, twee dezelfde klinkers zijn lang',
          uit:'<p>De <b>korte klanken</b> zijn a, e, i, o en u: bak, pen, kip, pot, bus.</p><p>De <b>lange klanken</b> aa, ee, oo en uu schrijf je in een woord als baak of boom met twee letters.</p><p>Luister goed: <b>bak</b> en <b>baak</b>, <b>man</b> en <b>maan</b>. Het verschil hoor je, en je ziet het aan het aantal letters.</p>',
          wanneer:'je moet kiezen tussen één of twee klinkers.',
          maak:function(R){
            var lang = Math.random() < .5, w = R.kies(lang ? LANG : KORT), k = klinkerVan(w);
            return slot({ vraag:w, context:'Hoor je een korte of een lange klank?',
              beeld:function(n){ var i = w.indexOf(k); return n >= 1 ? R.teken.woord([{ t:w.slice(0, i), k:0 }, { t:k, k:lang ? 2 : 1, label:n >= 2 ? (lang ? 'lang' : 'kort') : '' }, { t:w.slice(i + k.length), k:0 }].filter(function(d){ return d.t; })) : R.teken.woord([{ t:w, k:0 }]); },
              stappen:[
                { tekst:'Welke klinker of klinkers staan er in ' + q(w) + '?', antwoord:k, invoer:'tekst',
                  hint:'Kijk naar de letters a, e, i, o en u. Staan er twee dezelfde naast elkaar, schrijf ze dan allebei op.' },
                vast('Is de klank kort of lang?', ['kort', 'lang'], lang ? 'lang' : 'kort',
                  lang ? 'Er staan twee dezelfde klinkers: ' + k + '. Dat is een lange klank.' : 'Er staat maar één ' + k + ' en daarna een medeklinker. Dat is een korte klank.') ] });
          } },
        { id:'spel-klank-open', naam:'Open en gesloten lettergrepen', kort:'Eindigt de lettergreep op een klinker, dan is hij open; op een medeklinker, dan gesloten',
          uit:'<p>Een lettergreep die eindigt op een <b>klinker</b> heet <b>open</b>: <b>ma</b>-ken, <b>bo</b>-men.</p><p>Een lettergreep die eindigt op een <b>medeklinker</b> heet <b>gesloten</b>: <b>bak</b>-ken, <b>win</b>-kel.</p><p>Dit is belangrijk: in een open lettergreep klinkt één klinker al <b>lang</b>. Daarom schrijf je ma-ken met één a.</p>',
          wanneer:'je wilt weten of je één of twee letters moet schrijven.',
          maak:function(R){
            var open = Math.random() < .5, w = R.kies(open ? OPEN : DICHT), p = w.split('-'), l = p[0].charAt(p[0].length - 1);
            return slot({ vraag:w, context:'Is de eerste lettergreep open of gesloten?',
              beeld:function(n){ return R.teken.woord([{ t:p[0], k:n >= 3 ? (open ? 2 : 1) : 1, label:n >= 3 ? (open ? 'open' : 'gesloten') : '' }, { t:p[1], k:0 }]); },
              stappen:[
                { tekst:'Op welke letter eindigt de eerste lettergreep ' + q(p[0]) + '?', antwoord:l, invoer:'tekst', hint:'Kijk naar de laatste letter van ' + p[0] + ', vlak voor het streepje.' },
                vast('Is ' + q(l) + ' een klinker of een medeklinker?', ['klinker', 'medeklinker'], /[aeiou]/.test(l) ? 'klinker' : 'medeklinker', 'De klinkers zijn a, e, i, o en u. Alle andere letters zijn medeklinkers.'),
                vast('Dus de eerste lettergreep is …', ['open', 'gesloten'], open ? 'open' : 'gesloten', open ? 'Eindigt op een klinker: open.' : 'Eindigt op een medeklinker: gesloten.',
                  { waarom:open ? 'In een open lettergreep klinkt de klinker lang, ook als hij er maar één keer staat.' : 'In een gesloten lettergreep blijft één klinker kort.' }) ] });
          } }
      ] },

    { groep:{ id:'spel-dubbel', niveau:'basis', domein:'spelling', naam:'Verdubbelen en verenkelen',
        uit:'Waarom schrijf je ballen met twee l\'en en ramen met één a? Het hangt af van de klank en van de lettergrepen. Eerst elke regel apart, dan door elkaar.' },
      doelen:[
        { id:'spel-dubbel-verdubbel', naam:'Verdubbelen na een korte klank', kort:'Een korte klank moet in een gesloten lettergreep blijven: schrijf de medeklinker dubbel',
          uit:'<p>In <b>bal</b> hoor je een korte a. Maak je er twee van, dan krijg je bal-len.</p><p>Met één l zou je <b>ba-len</b> schrijven. Dan is de eerste lettergreep open en klinkt de a lang. Dat wil je niet.</p><p>Daarom <b>verdubbel</b> je de medeklinker: <b>bal-len</b>. De eerste lettergreep blijft gesloten en de a blijft kort.</p>',
          wanneer:'je een woord met een korte klank langer maakt, zoals bij het meervoud.',
          maak:function(R){
            var w = R.kies(DUBBEL), v = verdubbel(w), f = {}; f[v.fout] = 'Met één ' + v.c + ' wordt de eerste lettergreep open: ' + v.foutA + '-' + v.foutB + '. Dan klinkt de klank lang.';
            return { vraag:'één ' + w + ', twee …', context:'Schrijf het meervoud.',
              beeld:function(n){ return n >= 2 ? R.teken.woord([{ t:v.a, k:1, label:'gesloten' }, { t:v.b, k:2 }]) : R.teken.woord([{ t:w, k:0 }]); },
              stappen:[
                vast('Is de klank in ' + q(w) + ' kort of lang?', ['kort', 'lang'], 'kort', 'Er staat maar één ' + klinkerVan(w) + ' en daarna een medeklinker: dat is kort.'),
                { tekst:'De korte klank moet in een gesloten lettergreep blijven: ' + v.a + '-… Welke medeklinker schrijf je dubbel?', antwoord:v.c, invoer:'tekst', hint:'Het is de laatste letter van ' + w + '.' },
                { tekst:'Schrijf het meervoud: twee …', antwoord:v.mv, invoer:'tekst', hint:'Eerst ' + v.a + ', dan nog een keer de ' + v.c + ' en -en.', fout:f } ] };
          } },
        { id:'spel-dubbel-verenkel', naam:'Verenkelen na een lange klank', kort:'Een lange klank in een open lettergreep schrijf je met één letter',
          uit:'<p>In <b>raam</b> hoor je een lange a. Maak je er twee van, dan krijg je ra-men.</p><p>De eerste lettergreep <b>ra</b> is open: hij eindigt op een klinker. In een open lettergreep klinkt één a al lang.</p><p>Daarom <b>verenkel</b> je: <b>ramen</b>, niet raamen. Zo ook boom, bomen en muur, muren.</p>',
          wanneer:'je een woord met aa, ee, oo of uu langer maakt.',
          maak:function(R){
            var w = R.kies(ENKEL), v = verenkel(w), f = {}; f[v.fout] = 'In de open lettergreep ' + v.a + ' is één ' + v.a.slice(-1) + ' al lang genoeg.';
            return { vraag:'één ' + w + ', twee …', context:'Schrijf het meervoud.',
              beeld:function(n){ return n >= 2 ? R.teken.woord([{ t:v.a, k:2, label:'open' }, { t:v.b, k:3 }]) : R.teken.woord([{ t:w, k:0 }]); },
              stappen:[
                vast('Is de klank in ' + q(w) + ' kort of lang?', ['kort', 'lang'], 'lang', 'Er staan twee dezelfde klinkers: ' + klinkerVan(w) + '. Dat is lang.'),
                vast('Je verdeelt het meervoud zo: ' + v.a + '-' + v.b + '. Is ' + q(v.a) + ' open of gesloten?', ['open', 'gesloten'], 'open', v.a + ' eindigt op een klinker. Dan is de lettergreep open.'),
                { tekst:'Schrijf het meervoud: twee …', antwoord:v.mv, invoer:'tekst', hint:'In de open lettergreep schrijf je maar één ' + v.a.slice(-1) + ': ' + v.a + '-' + v.b + '.', fout:f } ] };
          } },
        { id:'spel-dubbel-mix', naam:'Verdubbelen of verenkelen', kort:'Eerst kort of lang, dan de lettergrepen, dan pas schrijven',
          uit:'<p>Nu door elkaar. Stel jezelf steeds twee vragen.</p><p>1 Is de klank <b>kort</b> of <b>lang</b>?</p><p>2 Hoe verdeel je het woord in lettergrepen? Kort: de medeklinker <b>dubbel</b> (bal-len, wij bak-ken). Lang: de klinker <b>enkel</b> (ra-men, wij ma-ken).</p>',
          wanneer:'je een meervoud of een werkwoord bij wij opschrijft.',
          maak:function(R){
            var kort = Math.random() < .5, ww = Math.random() < .4, w, v;
            if (ww) w = R.kies(kort ? WW_KORT : WW_LANG); else w = R.kies(kort ? DUBBEL : ENKEL);
            v = kort ? verdubbel(w) : verenkel(w);
            var goedSp = v.a + '-' + v.b, foutSp = v.foutA + '-' + v.foutB, f = {};
            f[v.fout] = kort ? 'Met één letter wordt de klank lang. Verdubbel de medeklinker.' : 'In een open lettergreep is één klinker al lang.';
            return { vraag:ww ? 'ik ' + w + ', wij …' : 'één ' + w + ', twee …', context:ww ? 'Schrijf de vorm bij wij.' : 'Schrijf het meervoud.',
              beeld:function(n){ return n >= 2 ? R.teken.woord([{ t:v.a, k:kort ? 1 : 2, label:kort ? 'gesloten' : 'open' }, { t:v.b, k:3 }]) : R.teken.woord([{ t:w, k:0 }]); },
              stappen:[
                vast('Is de klank in ' + q(w) + ' kort of lang?', ['kort', 'lang'], kort ? 'kort' : 'lang', kort ? 'Eén klinker en dan een medeklinker: kort.' : 'Twee dezelfde klinkers: lang.'),
                kies1(R, ww ? 'Hoe verdeel je de vorm bij wij in lettergrepen?' : 'Hoe verdeel je het meervoud in lettergrepen?', goedSp, [foutSp], kort ? 'De korte klank moet gesloten blijven: ' + v.a + ' eindigt op een medeklinker.' : 'De lange klank mag in een open lettergreep staan: ' + v.a + ' eindigt op een klinker.'),
                { tekst:ww ? 'Schrijf het: wij …' : 'Schrijf het meervoud: twee …', antwoord:v.mv, invoer:'tekst', hint:'Plak de lettergrepen aan elkaar: ' + goedSp + '.', fout:f } ] };
          } }
      ] }
  ]);

  /* ---------- lastige klanken ---------- */
  /* ei of ij: [woord, soort hulpje, steun]  soort: u = vaste uitgang, v = verwant woord, h = uit je hoofd */
  var EIJ = [
    ['vrol[ij]k', 'u', 'Het woord eindigt op -lijk. Die schrijf je altijd met ij.'], ['eerl[ij]k', 'u', 'Het woord eindigt op -lijk: altijd ij.'],
    ['duidel[ij]k', 'u', 'Het eindigt op -lijk: altijd ij.'], ['gevaarl[ij]k', 'u', 'Het eindigt op -lijk: altijd ij.'], ['vriendel[ij]k', 'u', 'Het eindigt op -lijk: altijd ij.'],
    ['heerl[ij]k', 'u', 'Het eindigt op -lijk: altijd ij.'], ['mogel[ij]k', 'u', 'Het eindigt op -lijk: altijd ij.'],
    ['bakker[ij]', 'u', 'Een plek waar iets gemaakt of verkocht wordt eindigt op -erij: altijd ij.'], ['slager[ij]', 'u', 'Het eindigt op -erij: altijd ij.'],
    ['drukker[ij]', 'u', 'Het eindigt op -erij: altijd ij.'], ['schilder[ij]', 'u', 'Het eindigt op -erij: altijd ij.'],
    ['waarh[ei]d', 'u', 'Het eindigt op -heid. Die schrijf je altijd met ei.'], ['snelh[ei]d', 'u', 'Het eindigt op -heid: altijd ei.'],
    ['gezondh[ei]d', 'u', 'Het eindigt op -heid: altijd ei.'], ['schoonh[ei]d', 'u', 'Het eindigt op -heid: altijd ei.'], ['domh[ei]d', 'u', 'Het eindigt op -heid: altijd ei.'],
    ['t[ij]dschrift', 'v', 'Er zit het woord tijd in, en tijd schrijf je met ij.'], ['[ij]sbeer', 'v', 'Er zit het woord ijs in: ij.'],
    ['kl[ei]nzoon', 'v', 'Er zit het woord klein in: ei.'], ['[ei]genaar', 'v', 'Familie van eigen: ei.'], ['z[ei]lboot', 'v', 'Er zit het woord zeil in: ei.'],
    ['b[ij]enkorf', 'v', 'Familie van de bij: ij.'], ['r[ei]sbureau', 'v', 'Familie van reis en reizen: ei.'], ['g[ei]tenkaas', 'v', 'Familie van de geit: ei.'],
    ['v[ij]ftig', 'v', 'Familie van vijf: ij.'], ['w[ij]svinger', 'v', 'Familie van wijs: ij.'], ['tr[ei]nkaartje', 'v', 'Familie van de trein: ei.'],
    ['schr[ij]fster', 'v', 'Familie van schrijven: ij.'], ['bl[ij]dschap', 'v', 'Familie van blij: ij.'],
    ['tr[ei]n', 'h', 'Leer het rijtje met ei: trein, plein, klein, meisje, geit, ei.'], ['pl[ei]n', 'h', 'Plein staat in het rijtje met ei.'],
    ['kl[ei]n', 'h', 'Klein staat in het rijtje met ei.'], ['m[ei]sje', 'h', 'Meisje staat in het rijtje met ei.'], ['g[ei]t', 'h', 'Geit staat in het rijtje met ei.'],
    ['w[ei]de', 'h', 'Weide is een ei-woord: leer het uit je hoofd.'], ['k[ei]', 'h', 'Kei is een ei-woord.'], ['p[ij]n', 'h', 'Pijn is een ij-woord: leer het uit je hoofd.'],
    ['l[ij]n', 'h', 'Lijn is een ij-woord.'], ['pr[ij]s', 'h', 'Prijs is een ij-woord.'], ['f[ij]n', 'h', 'Fijn is een ij-woord.'], ['t[ij]ger', 'h', 'Tijger is een ij-woord.'],
    ['d[ij]k', 'h', 'Dijk is een ij-woord.'], ['k[ij]ken', 'h', 'Kijken is een ij-woord.'], ['w[ij]n', 'h', 'Wijn is een ij-woord.'], ['p[ij]l', 'h', 'Pijl is een ij-woord.']
  ];
  var EIJ_HULP = { u:'Een vaste uitgang (-lijk, -erij, -heid)', v:'Een verwant woord dat je kent', h:'Geen regel: uit je hoofd leren' };
  var AUOU = [
    ['g[ou]dvis', 'v', 'Familie van goud: ou.'], ['h[ou]tblok', 'v', 'Er zit hout in: ou.'], ['z[ou]tvat', 'v', 'Er zit zout in: ou.'], ['k[ou]der', 'v', 'Familie van koud: ou.'],
    ['f[ou]tloos', 'v', 'Er zit fout in: ou.'], ['[ou]dste', 'v', 'Familie van oud: ou.'], ['t[ou]wtje', 'v', 'Familie van touw: ou.'], ['vr[ou]welijk', 'v', 'Familie van vrouw: ou.'],
    ['bl[au]wgrijs', 'v', 'Er zit blauw in: au.'], ['[au]tobus', 'v', 'Er zit auto in: au.'], ['s[au]sje', 'v', 'Familie van saus: au.'], ['k[ou]sje', 'v', 'Familie van kous: ou.'],
    ['b[ou]wplaats', 'v', 'Familie van bouwen: ou.'], ['tr[ou]wfoto', 'v', 'Familie van trouwen: ou.'], ['kl[au]wtje', 'v', 'Familie van klauw: au.'], ['k[au]wgom', 'v', 'Familie van kauwen: au.'],
    ['sch[ou]derblad', 'v', 'Er zit schouder in: ou.'], ['z[ou]tje', 'v', 'Familie van zout: ou.'],
    ['[au]to', 'h', 'Auto is een au-woord.'], ['p[au]ze', 'h', 'Pauze is een au-woord.'], ['s[au]s', 'h', 'Saus is een au-woord.'], ['p[au]s', 'h', 'Paus is een au-woord.'],
    ['appl[au]s', 'h', 'Applaus is een au-woord.'], ['fl[au]w', 'h', 'Flauw: au met een w erachter.'], ['l[au]w', 'h', 'Lauw: au met een w erachter.'], ['r[au]w', 'h', 'Rauw: au met een w erachter.'],
    ['g[au]w', 'h', 'Gauw: au met een w erachter.'], ['n[au]w', 'h', 'Nauw: au met een w erachter.'], ['p[au]w', 'h', 'Pauw: au met een w erachter.'], ['d[au]w', 'h', 'Dauw: au met een w erachter.'],
    ['[ou]d', 'h', 'Oud is een ou-woord.'], ['k[ou]d', 'h', 'Koud is een ou-woord.'], ['g[ou]d', 'h', 'Goud is een ou-woord.'], ['z[ou]t', 'h', 'Zout is een ou-woord.'],
    ['h[ou]t', 'h', 'Hout is een ou-woord.'], ['f[ou]t', 'h', 'Fout is een ou-woord.'], ['k[ou]s', 'h', 'Kous is een ou-woord.'], ['vr[ou]w', 'h', 'Vrouw: ou met een w erachter.'],
    ['t[ou]w', 'h', 'Touw: ou met een w erachter.'], ['m[ou]w', 'h', 'Mouw: ou met een w erachter.'], ['k[ou]', 'h', 'Kou is een ou-woord.'], ['h[ou]den', 'h', 'Houden is een ou-woord.']
  ];
  var AUOU_HULP = { v:'Een verwant woord dat je kent', h:'Geen regel: uit je hoofd leren' };
  /* g of ch: soort b = begin van het woord, t = klank voor een t, h = uit je hoofd */
  var GCH = [
    ['[g]eel', 'b', 'Aan het begin van een Nederlands woord schrijf je altijd g.'], ['[g]root', 'b', 'Aan het begin: altijd g.'], ['[g]ras', 'b', 'Aan het begin: altijd g.'],
    ['[g]oed', 'b', 'Aan het begin: altijd g.'], ['[g]ans', 'b', 'Aan het begin: altijd g.'], ['[g]evaar', 'b', 'Aan het begin: altijd g.'], ['[g]las', 'b', 'Aan het begin: altijd g.'],
    ['[g]itaar', 'b', 'Aan het begin: altijd g.'], ['[g]olf', 'b', 'Aan het begin: altijd g.'], ['[g]ordijn', 'b', 'Aan het begin: altijd g.'],
    ['na[ch]t', 'c', 'De klank staat voor een t, en het is geen werkwoord: cht.'], ['li[ch]t', 'c', 'Voor een t: cht.'], ['lu[ch]t', 'c', 'Voor een t: cht.'],
    ['a[ch]t', 'c', 'Voor een t: cht.'], ['gra[ch]t', 'c', 'Voor een t: cht.'], ['kra[ch]t', 'c', 'Voor een t: cht.'], ['za[ch]t', 'c', 'Voor een t: cht.'],
    ['e[ch]t', 'c', 'Voor een t: cht.'], ['sle[ch]t', 'c', 'Voor een t: cht.'], ['bo[ch]t', 'c', 'Voor een t: cht.'], ['to[ch]t', 'c', 'Voor een t: cht.'],
    ['do[ch]ter', 'c', 'Voor een t: cht.'], ['vlu[ch]t', 'c', 'Voor een t: cht.'], ['gedi[ch]t', 'c', 'Voor een t: cht.'], ['pra[ch]tig', 'c', 'Voor een t: cht.'],
    ['la[ch]en', 'h', 'Lachen is een ch-woord: leer het uit je hoofd.'], ['ka[ch]el', 'h', 'Kachel is een ch-woord.'], ['pe[ch]', 'h', 'Pech is een ch-woord.'],
    ['to[ch]', 'h', 'Toch is een ch-woord.'], ['zi[ch]', 'h', 'Zich is een ch-woord.'], ['jui[ch]en', 'h', 'Juichen is een ch-woord.'], ['ku[ch]en', 'h', 'Kuchen is een ch-woord.'],
    ['lie[g]en', 'h', 'Liegen is een g-woord: leer het uit je hoofd.'], ['vra[g]en', 'h', 'Vragen is een g-woord.'], ['da[g]', 'h', 'Dag is een g-woord: denk aan dagen.'],
    ['ber[g]', 'h', 'Berg is een g-woord: denk aan bergen.'], ['vlu[g]', 'h', 'Vlug is een g-woord.'], ['we[g]', 'h', 'Weg is een g-woord: denk aan wegen.'],
    ['vo[g]el', 'h', 'Vogel is een g-woord.'], ['re[g]en', 'h', 'Regen is een g-woord.'], ['te[g]el', 'h', 'Tegel is een g-woord.'], ['spie[g]el', 'h', 'Spiegel is een g-woord.'],
    ['e[g]el', 'h', 'Egel is een g-woord.'], ['vla[g]', 'h', 'Vlag is een g-woord: denk aan vlaggen.'], ['zaa[g]', 'h', 'Zaag is een g-woord.'], ['dee[g]', 'h', 'Deeg is een g-woord.']
  ];
  var GCH_HULP = { b:'Aan het begin van het woord: altijd g', c:'Er komt een t achter: cht', h:'Geen regel: uit je hoofd leren' };
  /* -d of -t: [woord, verlengd, hoe je verlengt] */
  var DT = [
    ['hon[d]', 'honden', 'twee …'], ['paar[d]', 'paarden', 'twee …'], ['hoe[d]', 'hoeden', 'twee …'], ['han[d]', 'handen', 'twee …'], ['lan[d]', 'landen', 'twee …'],
    ['tan[d]', 'tanden', 'twee …'], ['hel[d]', 'helden', 'twee …'], ['avon[d]', 'avonden', 'twee …'], ['vrien[d]', 'vrienden', 'twee …'], ['bor[d]', 'borden', 'twee …'],
    ['woor[d]', 'woorden', 'twee …'], ['mon[d]', 'monden', 'twee …'], ['baar[d]', 'baarden', 'twee …'], ['een[d]', 'eenden', 'twee …'], ['won[d]', 'wonden', 'twee …'],
    ['bloe[d]', 'bloeden', 'de wond gaat …'], ['broo[d]', 'broden', 'twee …'], ['roo[d]', 'rode', 'de … bal'], ['goe[d]', 'goede', 'het … antwoord'], ['kou[d]', 'koude', 'de … soep'],
    ['blin[d]', 'blinde', 'de … man'], ['ron[d]', 'ronde', 'de … tafel'], ['wil[d]', 'wilde', 'de … dieren'],
    ['voe[t]', 'voeten', 'twee …'], ['kan[t]', 'kanten', 'twee …'], ['kran[t]', 'kranten', 'twee …'], ['pun[t]', 'punten', 'twee …'], ['staar[t]', 'staarten', 'twee …'],
    ['plan[t]', 'planten', 'twee …'], ['har[t]', 'harten', 'twee …'], ['ten[t]', 'tenten', 'twee …'], ['kaar[t]', 'kaarten', 'twee …'], ['boo[t]', 'boten', 'twee …'],
    ['groo[t]', 'grote', 'de … boom'], ['hee[t]', 'hete', 'de … thee'], ['zoe[t]', 'zoete', 'de … taart'], ['laa[t]', 'late', 'de … bus'], ['wi[t]', 'witte', 'de … muur'],
    ['zwar[t]', 'zwarte', 'de … kat'], ['ech[t]', 'echte', 'het … geld'], ['fees[t]', 'feesten', 'twee …']
  ];
  /* f/v en s/z: [enkelvoud, meervoud] */
  var FVSZ = [
    ['wolf', 'wolven'], ['duif', 'duiven'], ['druif', 'druiven'], ['korf', 'korven'], ['golf', 'golven'], ['schijf', 'schijven'], ['brief', 'brieven'], ['dief', 'dieven'],
    ['neef', 'neven'], ['staaf', 'staven'], ['huis', 'huizen'], ['muis', 'muizen'], ['roos', 'rozen'], ['kaas', 'kazen'], ['vaas', 'vazen'], ['glas', 'glazen'],
    ['reus', 'reuzen'], ['baas', 'bazen'], ['neus', 'neuzen'], ['laars', 'laarzen'], ['gans', 'ganzen'], ['prijs', 'prijzen'], ['reis', 'reizen'], ['poes', 'poezen'],
    ['kous', 'kousen'], ['dans', 'dansen'], ['kruis', 'kruisen'], ['bus', 'bussen'], ['bos', 'bossen'], ['das', 'dassen'], ['vis', 'vissen'], ['straf', 'straffen'],
    ['stof', 'stoffen'], ['giraf', 'giraffen'], ['plas', 'plassen']
  ];
  /* -cht of -gt: [zin met gat, woord, ww (infinitief) of leeg] */
  var CHTGT = [
    ['Hij ze[gt] altijd de waarheid.', 'zeggen'], ['Het boek li[gt] op tafel.', 'liggen'], ['Zij vraa[gt] de weg.', 'vragen'], ['Zij draa[gt] een zware tas.', 'dragen'],
    ['Het vliegtuig vlie[gt] naar Spanje.', 'vliegen'], ['De hond jaa[gt] op de kat.', 'jagen'], ['Opa zaa[gt] een plank door.', 'zagen'], ['Hij lie[gt] nooit.', 'liegen'],
    ['Zij kla[gt] over de kou.', 'klagen'], ['Hij vee[gt] de vloer.', 'vegen'], ['De boom bui[gt] in de wind.', 'buigen'], ['Mijn moeder zor[gt] voor de kat.', 'zorgen'],
    ['Wie wee[gt] de appels?', 'wegen'], ['Hij ze[gt] sorry.', 'zeggen'], ['De vogel vlie[gt] weg.', 'vliegen'],
    ['Zij la[cht] om de grap.', 'lachen'], ['Het publiek jui[cht] voor de spelers.', 'juichen'], ['Hij ku[cht] even.', 'kuchen'],
    ['De lu[cht] is blauw.', ''], ['Het is midden in de na[cht].', ''], ['Doe het li[cht] aan.', ''], ['Ik heb a[cht] euro.', ''], ['De boot vaart door de gra[cht].', ''],
    ['De kra[cht] van de wind is groot.', ''], ['Pas op voor de bo[cht].', ''], ['We maken een fietsto[cht].', ''], ['Is dat een e[cht] verhaal?', ''],
    ['Het weer is sle[cht].', ''], ['Mijn zus heeft een do[cht]er.', ''], ['Ik lees een gedi[cht] voor.', ''], ['De vlu[cht] heeft vertraging.', ''], ['Het is een za[cht] kussen.', '']
  ];
  function zinBeeld(R, zin, open){
    var d = delen(zin), uit = [];
    if (d[0]) uit.push(d[0].trim());
    var w0 = d[0].split(' ').pop(), w2 = d[2].split(/[ .,?!]/)[0];
    uit[0] = d[0].slice(0, d[0].length - w0.length).trim();
    if (!uit[0]) uit.shift();
    uit.push({ t:w0 + (open ? d[1] : '…') + w2, k:1 });
    var rest = d[2].slice(w2.length).trim(), p = /^[.,?!]+/.exec(rest); if (p){ uit[uit.length - 1].t += p[0]; rest = rest.slice(p[0].length).trim(); } if (rest) uit.push(rest);
    return R.teken.zin(uit);
  }
  function gatWoord(zin){ var d = delen(zin); return d[0].split(' ').pop() + d[1] + d[2].split(/[ .,?!]/)[0]; }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'spel-klank2', niveau:'basis', domein:'spelling', naam:'Lastige klanken',
        uit:'Sommige klanken kun je op twee manieren schrijven: ei of ij, au of ou, g of ch, d of t. Bij elke klank leer je het hulpje dat werkt.' },
      doelen:[
        { id:'spel-klank2-eij', naam:'Ei of ij', kort:'Kijk of er een vaste uitgang of een verwant woord is, anders leer je het uit je hoofd',
          uit:'<p>De <b>ei</b> en de <b>ij</b> klinken hetzelfde. Er is geen klankregel, maar wel drie hulpjes.</p><p>1 Een <b>vaste uitgang</b>: -lijk en -erij altijd met ij (vrolijk, bakkerij), -heid altijd met ei (waarheid).</p><p>2 Een <b>verwant woord</b> dat je wel kent: tijdschrift heeft tijd erin, kleinzoon heeft klein erin.</p><p>3 Lukt dat niet, dan leer je het woord <b>uit je hoofd</b>. Leer vooral het rijtje met ei: trein, plein, klein, meisje, geit. Bij twijfel is de ij vaker goed.</p>',
          wanneer:'je twijfelt tussen ei en ij.',
          maak:function(R){
            var it = R.kies(EIJ), w = it[0], goed = kern(w);
            return { vraag:gat(w), context:'Ei of ij? Schrijf het hele woord.',
              beeld:function(n){ return gatBeeld(R, w, n >= 2, goed); },
              stappen:[
                kies1(R, 'Welk hulpje gebruik je bij dit woord?', EIJ_HULP[it[1]], [EIJ_HULP.u, EIJ_HULP.v, EIJ_HULP.h], it[2]),
                vast('Ei of ij?', ['ei', 'ij'], goed, it[2]),
                { tekst:'Schrijf het hele woord.', antwoord:vol(w), invoer:'tekst', hint:'Zet ' + goed + ' op de plek van de puntjes.' } ] };
          } },
        { id:'spel-klank2-auou', naam:'Au of ou', kort:'Zoek een verwant woord of leer het uit je hoofd; hoor je een w, dan -auw of -ouw',
          uit:'<p>De <b>au</b> en de <b>ou</b> klinken hetzelfde. Ook hier is geen klankregel.</p><p>Zoek een <b>verwant woord</b> dat je kent: goudvis heeft goud erin, autobus heeft auto erin.</p><p>Hoor je achter de klank nog een <b>w</b>, dan schrijf je <b>-auw</b> of <b>-ouw</b>: blauw, vrouw. De w schrijf je er dus altijd bij.</p><p>De rest leer je <b>uit je hoofd</b>. Woorden met ou komen vaker voor dan woorden met au.</p>',
          wanneer:'je twijfelt tussen au en ou.',
          maak:function(R){
            var it = R.kies(AUOU), w = it[0], goed = kern(w);
            return { vraag:gat(w), context:'Au of ou? Schrijf het hele woord.',
              beeld:function(n){ return gatBeeld(R, w, n >= 2, goed); },
              stappen:[
                vast('Welk hulpje gebruik je bij dit woord?', [AUOU_HULP.v, AUOU_HULP.h], AUOU_HULP[it[1]], it[2]),
                vast('Au of ou?', ['au', 'ou'], goed, it[2]),
                { tekst:'Schrijf het hele woord.', antwoord:vol(w), invoer:'tekst', hint:'Zet ' + goed + ' op de plek van de puntjes.' } ] };
          } },
        { id:'spel-klank2-gch', naam:'G of ch', kort:'Aan het begin altijd g, voor een t meestal cht, de rest leer je uit je hoofd',
          uit:'<p>De <b>g</b> en de <b>ch</b> klinken bijna hetzelfde. Gebruik deze hulpjes.</p><p>1 Aan het <b>begin</b> van een Nederlands woord staat altijd een <b>g</b>: geel, groot, gras.</p><p>2 Komt er een <b>t</b> achter de klank, dan is het meestal <b>cht</b>: nacht, licht, lucht. Alleen bij werkwoorden kan het -gt zijn (hij zegt). Dat leer je bij -cht of -gt.</p><p>3 De rest leer je <b>uit je hoofd</b>. Er zijn maar weinig woorden met ch, zoals lachen, kachel, pech en toch.</p>',
          wanneer:'je twijfelt tussen g en ch.',
          maak:function(R){
            var it = R.kies(GCH), w = it[0], goed = kern(w);
            return { vraag:gat(w), context:'G of ch? Schrijf het hele woord.',
              beeld:function(n){ return gatBeeld(R, w, n >= 2, goed); },
              stappen:[
                vast('Welk hulpje past bij dit woord?', [GCH_HULP.b, GCH_HULP.c, GCH_HULP.h], GCH_HULP[it[1]], it[2]),
                vast('G of ch?', ['g', 'ch'], goed, it[2]),
                { tekst:'Schrijf het hele woord.', antwoord:vol(w), invoer:'tekst', hint:'Zet ' + goed + ' op de plek van de puntjes.' } ] };
          } },
        { id:'spel-klank2-dt', naam:'-d of -t aan het eind', kort:'Maak het woord langer, dan hoor je of het een d of een t is',
          uit:'<p>Aan het eind van een woord klinkt een d als een t. Hond en bont klinken allebei met een t.</p><p>De truc: <b>verleng</b> het woord. Maak het meervoud (honden) of zet er een woord achter (de rode bal). Nu hoor je het wel: <b>hon-den</b> met een d.</p><p>Hoor je in de lange vorm een <b>d</b>, dan schrijf je een d. Hoor je een <b>t</b>, dan een t.</p>',
          wanneer:'een woord eindigt op een t-klank en je twijfelt of het een d is.',
          maak:function(R){
            var it = R.kies(DT), w = it[0], goed = kern(w), mv = it[1];
            return { vraag:gat(w), context:'-d of -t aan het eind? Schrijf het hele woord.',
              beeld:function(n){ return n >= 1 ? R.teken.woord([{ t:mv, k:2, label:'langer' }]) + gatBeeld(R, w, n >= 2, goed) : gatBeeld(R, w, false); },
              stappen:[
                { tekst:'Maak het woord langer: ' + it[2].replace('…', '<b>…</b>'), antwoord:mv, invoer:'tekst', hint:'Zeg het hardop en maak het af: ' + it[2].replace('…', mv) + '.' },
                vast('Hoor je in ' + q(mv) + ' een d of een t?', ['d', 't'], goed, 'Zeg ' + mv + ' langzaam. Luister naar de klank voor de laatste lettergreep.'),
                { tekst:'Schrijf het hele woord.', antwoord:vol(w), invoer:'tekst', hint:'Je hoorde een ' + goed + ' in ' + mv + '. Die schrijf je ook aan het eind.' } ] };
          } },
        { id:'spel-klank2-fvsz', naam:'F of v, s of z', kort:'Aan het eind schrijf je nooit v of z; in de lange vorm schrijf je wat je hoort',
          uit:'<p>Een Nederlands woord eindigt <b>nooit op een v of een z</b>. Je schrijft wolf en huis.</p><p>Maak je het woord langer, dan schrijf je wat je <b>hoort</b>: wol<b>v</b>en, hui<b>z</b>en. Maar ook kou<b>s</b>en en stra<b>ff</b>en.</p><p>Leg je vingers op je keel. Bij een <b>v</b> of <b>z</b> zoemt het, bij een f of s niet.</p>',
          wanneer:'je twijfelt tussen f en v of tussen s en z.',
          maak:function(R){
            var it = R.kies(FVSZ), ev = it[0], mv = it[1], terug = Math.random() < .4;
            var eind = ev.slice(-1), paar = eind === 'f' ? ['f', 'v'] : ['s', 'z'], heet = mv.indexOf(paar[1]) >= 0 ? paar[1] : paar[0];
            if (terug) return { vraag:'twee ' + mv + ', één …', context:'Schrijf het enkelvoud.',
              stappen:[
                vast('Staat de klank in het enkelvoud aan het eind van het woord?', ['ja', 'nee'], 'ja', 'Het enkelvoud is korter: de klank komt helemaal achteraan.'),
                vast('Welke letter schrijf je aan het eind?', paar, eind, 'Aan het eind van een woord schrijf je nooit ' + paar[1] + '.'),
                { tekst:'Schrijf het enkelvoud: één …', antwoord:ev, invoer:'tekst', hint:'Haal -en eraf en schrijf het korte woord zoals het klinkt. Aan het eind komt een ' + eind + '.' } ] };
            var f = {}; if (heet !== eind) f[ev + 'en'] = 'Zeg het hardop: je hoort een ' + heet + '. Schrijf wat je hoort.';
            return { vraag:'één ' + ev + ', twee …', context:'Schrijf het meervoud.',
              stappen:[
                vast('Zeg het meervoud hardop. Hoor je een ' + paar[0] + ' of een ' + paar[1] + '?', paar, heet, 'Het meervoud klinkt als ' + mv + '. Leg je vingers op je keel: zoemt het, dan is het een ' + paar[1] + '.'),
                { tekst:'Schrijf het meervoud: twee …', antwoord:mv, invoer:'tekst', hint:'In de lange vorm schrijf je wat je hoort: een ' + heet + '.', fout:f } ] };
          } },
        { id:'spel-klank2-chtgt', naam:'-cht of -gt', kort:'Is het een werkwoord, dan stam + t; is het geen werkwoord, dan cht',
          uit:'<p>Lucht en zegt klinken aan het eind hetzelfde. Toch schrijf je het anders.</p><p>Is het woord een <b>werkwoord</b>? Dan schrijf je de stam en een t: zeggen, zeg, hij <b>zegt</b>. Lachen, lach, zij <b>lacht</b>.</p><p>Is het <b>geen werkwoord</b>? Dan schrijf je bijna altijd <b>cht</b>: de lucht, de nacht, licht.</p>',
          wanneer:'een woord eindigt op de klank -cht.',
          maak:function(R){
            var it = R.kies(CHTGT), zin = it[0], inf = it[1], woord = gatWoord(zin), ww = !!inf;
            var st = [vast('Is ' + q(gatWoord(zin).replace(kern(zin), '…')) + ' hier een werkwoord?', ['ja', 'nee'], ww ? 'ja' : 'nee',
              ww ? 'Kijk wat er gebeurt in de zin: iemand doet iets. Het hele werkwoord is ' + inf + '.' : 'Het is een ding of hoe iets is. Je kunt er geen hij of zij voor zetten.')];
            if (ww){
              var stam = woord.slice(0, -1);
              st.push({ tekst:'Het werkwoord is ' + inf + '. Wat is de stam?', antwoord:stam, invoer:'tekst', hint:'Haal -en van ' + inf + ' af: ' + inf.slice(0, -2) + '.' + (stam.length < inf.length - 2 ? ' Aan het eind van de stam staan nooit twee dezelfde medeklinkers: ' + stam + '.' : stam.length > inf.length - 2 ? ' De klank is lang, dus schrijf je twee klinkers: ' + stam + '.' : '') });
              st.push({ tekst:'Stam + t. Schrijf het woord.', antwoord:woord, invoer:'tekst', hint:stam + ' + t = ' + woord + '.' });
            } else {
              st.push(vast('Dan schrijf je bijna altijd …', ['-cht', '-gt'], '-cht', 'Geen werkwoord: cht.'));
              st.push({ tekst:'Schrijf het woord.', antwoord:woord, invoer:'tekst', hint:'Zet ch op de plek van de puntjes.' });
            }
            return { vraag:zin.replace(/\[[^\]]*\]/, '…'), context:'-cht of -gt? Schrijf het woord met de puntjes.',
              beeld:function(n){ return zinBeeld(R, zin, n >= st.length); }, stappen:st };
          } }
      ] }
  ]);

  /* ========== 1F ========== */
  /* -ig of -lijk: [stam, uitgang] */
  var IGLIJK = [
    ['aard', 'ig'], ['hand', 'ig'], ['gezell', 'ig'], ['gelukk', 'ig'], ['last', 'ig'], ['zonn', 'ig'], ['nod', 'ig'], ['prett', 'ig'], ['honger', 'ig'],
    ['twint', 'ig'], ['dert', 'ig'], ['bez', 'ig'], ['zuin', 'ig'], ['jar', 'ig'], ['kopp', 'ig'], ['slord', 'ig'], ['vro', 'lijk'],
    ['vriende', 'lijk'], ['eer', 'lijk'], ['gevaar', 'lijk'], ['heer', 'lijk'], ['duide', 'lijk'], ['moge', 'lijk'], ['verschrikke', 'lijk'], ['vrese', 'lijk'],
    ['ongeloof', 'lijk'], ['tijde', 'lijk'], ['natuur', 'lijk'], ['persoon', 'lijk'], ['gewoon', 'lijk'], ['makke', 'lijk']
  ];
  /* -heid of -isch */
  var HEIDISCH = [
    ['waar', 'heid'], ['snel', 'heid'], ['gezond', 'heid'], ['schoon', 'heid'], ['een', 'heid'], ['vrij', 'heid'], ['dom', 'heid'], ['wijs', 'heid'],
    ['zeker', 'heid'], ['over', 'heid'], ['gelegen', 'heid'], ['mogelijk', 'heid'], ['eerlijk', 'heid'], ['duidelijk', 'heid'], ['traag', 'heid'],
    ['log', 'isch'], ['prakt', 'isch'], ['elektr', 'isch'], ['typ', 'isch'], ['fantast', 'isch'], ['med', 'isch'], ['techn', 'isch'], ['histor', 'isch'],
    ['mag', 'isch'], ['trag', 'isch'], ['krit', 'isch'], ['chaot', 'isch'], ['ritm', 'isch'], ['automat', 'isch'], ['dramat', 'isch'], ['romant', 'isch']
  ];
  /* -tie of -sie: [woord, wat je hoort, uitzondering] */
  var TIESIE = [
    ['poli[tie]', 'ts'], ['vakan[tie]', 'ts'], ['informa[tie]', 'ts'], ['situa[tie]', 'ts'], ['tradi[tie]', 'ts'], ['ac[tie]', 'ts'], ['posi[tie]', 'ts'],
    ['condi[tie]', 'ts'], ['reac[tie]', 'ts'], ['genera[tie]', 'ts'], ['organisa[tie]', 'ts'], ['adverten[tie]', 'ts'], ['concentra[tie]', 'ts'],
    ['competi[tie]', 'ts'], ['opera[tie]', 'ts'], ['combina[tie]', 'ts'], ['presenta[tie]', 'ts'], ['demonstra[tie]', 'ts'], ['na[tie]', 'ts'], ['redac[tie]', 'ts'],
    ['televi[sie]', 'z'], ['explo[sie]', 'z'], ['illu[sie]', 'z'], ['divi[sie]', 'z'], ['fu[sie]', 'z'], ['inva[sie]', 'z'], ['vi[sie]', 'z'], ['preci[sie]', 'z'],
    ['discus[sie]', 'u'], ['ver[sie]', 'u'], ['excur[sie]', 'u'], ['emis[sie]', 'u'], ['mis[sie]', 'u'], ['commis[sie]', 'u']
  ];
  /* verkleinwoorden: [woord, verkleinwoord, soort] */
  var VK_SOORT = { e:'een korte klank + l, m, n, r of ng', t:'een lange klank of tweeklank + l, n, r of w', k:'een klinker', p:'een m (niet na een korte klank)', i:'onbeklemtoond -ing', j:'een andere medeklinker (p, t, k, s, f, d)' };
  var VK_UIT = { e:'-etje', t:'-tje', k:'-tje', p:'-pje', i:'-kje', j:'-je' };
  var VERKLEIN = [
    ['bal', 'balletje', 'e'], ['kam', 'kammetje', 'e'], ['pan', 'pannetje', 'e'], ['ster', 'sterretje', 'e'], ['ring', 'ringetje', 'e'], ['zon', 'zonnetje', 'e'],
    ['pen', 'pennetje', 'e'], ['bel', 'belletje', 'e'], ['bom', 'bommetje', 'e'], ['kar', 'karretje', 'e'], ['stem', 'stemmetje', 'e'], ['wang', 'wangetje', 'e'],
    ['kom', 'kommetje', 'e'], ['vlam', 'vlammetje', 'e'], ['ding', 'dingetje', 'e'],
    ['stoel', 'stoeltje', 't'], ['schoen', 'schoentje', 't'], ['deur', 'deurtje', 't'], ['vrouw', 'vrouwtje', 't'], ['boer', 'boertje', 't'], ['steen', 'steentje', 't'],
    ['maan', 'maantje', 't'], ['been', 'beentje', 't'], ['uur', 'uurtje', 't'], ['muur', 'muurtje', 't'], ['trein', 'treintje', 't'], ['tuin', 'tuintje', 't'], ['zaal', 'zaaltje', 't'],
    ['koe', 'koetje', 'k'], ['ei', 'eitje', 'k'], ['la', 'laatje', 'k'], ['auto', 'autootje', 'k'], ['oma', 'omaatje', 'k'], ['opa', 'opaatje', 'k'], ['vlo', 'vlootje', 'k'],
    ['foto', 'fotootje', 'k'], ['ui', 'uitje', 'k'], ['bij', 'bijtje', 'k'], ['bui', 'buitje', 'k'], ['kraai', 'kraaitje', 'k'],
    ['boom', 'boompje', 'p'], ['raam', 'raampje', 'p'], ['bloem', 'bloempje', 'p'], ['duim', 'duimpje', 'p'], ['riem', 'riempje', 'p'], ['bezem', 'bezempje', 'p'],
    ['arm', 'armpje', 'p'], ['film', 'filmpje', 'p'],
    ['koning', 'koninkje', 'i'], ['woning', 'woninkje', 'i'], ['ketting', 'kettinkje', 'i'], ['tekening', 'tekeninkje', 'i'], ['wandeling', 'wandelinkje', 'i'],
    ['boek', 'boekje', 'j'], ['huis', 'huisje', 'j'], ['kat', 'katje', 'j'], ['boot', 'bootje', 'j'], ['hoed', 'hoedje', 'j'], ['bed', 'bedje', 'j'], ['dak', 'dakje', 'j'],
    ['zak', 'zakje', 'j'], ['kop', 'kopje', 'j'], ['pet', 'petje', 'j'], ['pot', 'potje', 'j'], ['vis', 'visje', 'j'], ['slof', 'slofje', 'j'], ['broek', 'broekje', 'j'], ['plas', 'plasje', 'j']
  ];
  /* meervoud: [woord, meervoud, soort] */
  var MV_SOORT = { s:'op -el, -em, -en, -er of -je', e:'op een -e die je bijna niet hoort', a:'op a, i, o, u of y', n:'anders: de gewone regel' };
  var MV_UIT = { s:'-s', e:'-s', a:'\'s', n:'-en' };
  var MEERVOUD = [
    ['tafel', 'tafels', 's'], ['lepel', 'lepels', 's'], ['vogel', 'vogels', 's'], ['sleutel', 'sleutels', 's'], ['bezem', 'bezems', 's'], ['deken', 'dekens', 's'],
    ['keuken', 'keukens', 's'], ['bakker', 'bakkers', 's'], ['kikker', 'kikkers', 's'], ['schilder', 'schilders', 's'], ['emmer', 'emmers', 's'], ['vlinder', 'vlinders', 's'],
    ['meisje', 'meisjes', 's'], ['huisje', 'huisjes', 's'], ['kopje', 'kopjes', 's'],
    ['tante', 'tantes', 'e'], ['garage', 'garages', 'e'], ['horloge', 'horloges', 'e'], ['etage', 'etages', 'e'], ['massage', 'massages', 'e'], ['reportage', 'reportages', 'e'],
    ['douche', 'douches', 'e'], ['machine', 'machines', 'e'],
    ['auto', 'auto\'s', 'a'], ['oma', 'oma\'s', 'a'], ['opa', 'opa\'s', 'a'], ['taxi', 'taxi\'s', 'a'], ['baby', 'baby\'s', 'a'], ['menu', 'menu\'s', 'a'], ['foto', 'foto\'s', 'a'],
    ['radio', 'radio\'s', 'a'], ['piano', 'piano\'s', 'a'], ['video', 'video\'s', 'a'], ['kano', 'kano\'s', 'a'], ['euro', 'euro\'s', 'a'], ['sofa', 'sofa\'s', 'a'],
    ['paraplu', 'paraplu\'s', 'a'], ['hobby', 'hobby\'s', 'a'], ['pyjama', 'pyjama\'s', 'a'], ['accu', 'accu\'s', 'a'],
    ['boek', 'boeken', 'n'], ['hond', 'honden', 'n'], ['stoel', 'stoelen', 'n'], ['deur', 'deuren', 'n'], ['fiets', 'fietsen', 'n'], ['krant', 'kranten', 'n'], ['lamp', 'lampen', 'n'],
    ['bloem', 'bloemen', 'n'], ['vriend', 'vrienden', 'n'], ['woord', 'woorden', 'n'], ['trein', 'treinen', 'n'], ['tuin', 'tuinen', 'n'], ['schoen', 'schoenen', 'n'], ['kerk', 'kerken', 'n']
  ];
  var MV_HINT = { s:'Woorden op -el, -em, -en, -er en -je krijgen -s.', e:'Een -e die je bijna niet hoort: alleen een s erachter.', a:'Na a, i, o, u en y schrijf je \'s.', n:'Geen van de bijzondere gevallen: dan -en.' };
  function mvFout(w, mv, soort){
    var f = {};
    if (soort === 'a'){ f[mv.replace('\'', '')] = 'Zonder apostrof lees je de laatste klank kort. Schrijf \'s.'; f[w + 'en'] = 'Na a, i, o, u en y krijg je \'s.'; }
    if (soort === 'e'){ f[w + '\'s'] = 'Na een -e schrijf je alleen een s, zonder apostrof.'; f[w + 'n'] = 'Het meervoud van ' + w + ' is met een s: ' + mv + '.'; }
    if (soort === 's'){ f[w + 'en'] = 'Woorden op -el, -em, -en, -er en -je krijgen een s.'; }
    if (soort === 'n'){ f[w + 's'] = 'Dit woord eindigt niet op -el, -em, -en, -er of -je: het krijgt -en.'; }
    return f;
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'spel-uitgang', niveau:'1F', domein:'spelling', naam:'Uitgangen',
        uit:'Veel woorden eindigen op een vast stukje: -ig, -lijk, -heid, -isch, -tie. Ook verkleinwoorden en meervouden hebben vaste uitgangen. Je leert ze per stuk.' },
      doelen:[
        { id:'spel-uit-iglijk', naam:'-ig of -lijk', kort:'Hoor je uch, dan -ig; hoor je luk, dan -lijk',
          uit:'<p>Gezellig en vrolijk klinken aan het eind een beetje vreemd. Je hoort <b>uch</b> en <b>luk</b>.</p><p>Hoor je <b>uch</b>? Dan schrijf je <b>-ig</b>: gezellig, handig, twintig.</p><p>Hoor je <b>luk</b>? Dan schrijf je <b>-lijk</b>: vrolijk, eerlijk, duidelijk.</p><p>Je schrijft dus nooit -ug of -luk.</p>',
          wanneer:'een bijvoeglijk naamwoord of telwoord eindigt op uch of luk.',
          maak:function(R){
            var it = R.kies(IGLIJK), lijk = it[1] === 'lijk', w = it[0] + it[1];
            var f = {}; f[it[0] + (lijk ? 'luk' : 'ug')] = 'Je hoort ' + (lijk ? 'luk' : 'uch') + ', maar je schrijft ' + (lijk ? '-lijk.' : '-ig.');
            return { vraag:it[0] + '…', context:'Schrijf het woord af.',
              beeld:function(n){ return R.teken.woord([{ t:it[0], k:0 }, { t:n >= 2 ? '-' + it[1] : '?', k:lijk ? 2 : 1, label:n >= 2 ? (lijk ? 'luk' : 'uch') : '' }]); },
              stappen:[
                vast('Zeg het woord hardop. Wat hoor je aan het eind?', ['uch', 'luk'], lijk ? 'luk' : 'uch', lijk ? 'Zeg: ' + it[0] + 'luk. Je hoort een l.' : 'Zeg: ' + it[0] + 'uch. Er zit geen l in.'),
                vast('Welke uitgang schrijf je?', ['-ig', '-lijk'], '-' + it[1], lijk ? 'Luk schrijf je als -lijk.' : 'Uch schrijf je als -ig.'),
                { tekst:'Schrijf het hele woord.', antwoord:w, invoer:'tekst', hint:it[0] + ' + ' + it[1] + '.', fout:f } ] };
          } },
        { id:'spel-uit-heidisch', naam:'-heid en -isch', kort:'Heit schrijf je -heid, ies schrijf je -isch',
          uit:'<p>Twee uitgangen die je anders schrijft dan je ze zegt.</p><p>Je hoort <b>heit</b>, maar je schrijft <b>-heid</b> met ei en een d: waarheid, snelheid. Maak je het langer, dan hoor je de d: de waarheden.</p><p>Je hoort <b>ies</b>, maar je schrijft <b>-isch</b>: logisch, praktisch, typisch. Maak je het langer, dan hoor je de s: logische.</p>',
          wanneer:'een woord eindigt op heit of ies.',
          maak:function(R){
            var it = R.kies(HEIDISCH), heid = it[1] === 'heid', w = it[0] + it[1], f = {};
            if (heid){ f[it[0] + 'heit'] = 'Je hoort heit, maar je schrijft -heid met een d.'; f[it[0] + 'hijd'] = '-heid schrijf je altijd met ei.'; }
            else { f[it[0] + 'ies'] = 'Je hoort ies, maar je schrijft -isch.'; f[it[0] + 'isj'] = 'Je schrijft -isch, met sch.'; }
            return { vraag:it[0] + '…', context:'Schrijf het woord af.',
              beeld:function(n){ return R.teken.woord([{ t:it[0], k:0 }, { t:n >= 2 ? '-' + it[1] : '?', k:heid ? 3 : 4, label:n >= 2 ? (heid ? 'heit' : 'ies') : '' }]); },
              stappen:[
                vast('Zeg het woord hardop. Wat hoor je aan het eind?', ['heit', 'ies'], heid ? 'heit' : 'ies', 'Zeg: ' + it[0] + (heid ? 'heit.' : 'ies.')),
                vast('Hoe schrijf je dat?', heid ? ['-heit', '-heid', '-hijd'] : ['-ies', '-isch', '-isj'], '-' + it[1], heid ? 'Heit schrijf je -heid: denk aan de waarheden.' : 'Ies schrijf je -isch: denk aan logische.'),
                { tekst:'Schrijf het hele woord.', antwoord:w, invoer:'tekst', hint:it[0] + ' + ' + it[1] + '.', fout:f } ] };
          } },
        { id:'spel-uit-tiesie', naam:'-tie of -sie', kort:'Hoor je tsie of sie, dan meestal -tie; hoor je zie, dan -sie',
          uit:'<p>Woorden als politie en televisie komen uit andere talen. Het eind schrijf je als <b>-tie</b> of als <b>-sie</b>.</p><p>Hoor je <b>tsie</b> of <b>sie</b>? Dan is het bijna altijd <b>-tie</b>: politie, vakantie, informatie.</p><p>Hoor je <b>zie</b>, met een zoemende z? Dan schrijf je <b>-sie</b>: televisie, explosie.</p><p>Leer de paar uitzonderingen na een s of r: discussie, missie, versie, excursie.</p>',
          wanneer:'een woord eindigt op de klank sie, tsie of zie.',
          maak:function(R){
            var it = R.kies(TIESIE), w = it[0], goed = kern(w), hoor = it[1] === 'z' ? 'zie' : 'tsie of sie';
            var hint = it[1] === 'u' ? 'Uitzondering: na een s of r schrijf je -sie, zoals discussie en versie.' : it[1] === 'z' ? 'Je hoort zie: -sie.' : 'Je hoort tsie of sie: -tie.';
            var f = {}; f[delen(w)[0] + (goed === 'tie' ? 'sie' : 'tie')] = hint;
            return { vraag:gat(w), context:'-tie of -sie? Schrijf het hele woord.',
              beeld:function(n){ return gatBeeld(R, w, n >= 2, hoor); },
              stappen:[
                vast('Zeg het woord hardop. Wat hoor je aan het eind?', ['tsie of sie', 'zie'], hoor, it[1] === 'z' ? 'Leg je vingers op je keel: het zoemt. Dat is een z.' : 'Er zoemt niets: je hoort een s, soms met een t ervoor.'),
                vast('Welke uitgang schrijf je?', ['-tie', '-sie'], '-' + goed, hint),
                { tekst:'Schrijf het hele woord.', antwoord:vol(w), invoer:'tekst', hint:delen(w)[0] + ' + ' + goed + '.', fout:f } ] };
          } },
        { id:'spel-uit-verklein', naam:'Verkleinwoorden', kort:'Het eind van het woord bepaalt welke uitgang het verkleinwoord krijgt',
          uit:'<p>Een <b>verkleinwoord</b> maak je met -je, -tje, -pje, -etje of -kje. Welke het wordt, hangt af van het eind van het woord.</p><p><b>-etje</b> na een korte klank + l, m, n, r of ng: balletje, ringetje. <b>-tje</b> na een lange klank + l, n, r of w (stoeltje) en na een klinker (koetje, autootje).</p><p><b>-pje</b> na een m die niet na een korte klank staat: boompje, bezempje. <b>-kje</b> na -ing zonder klemtoon: koninkje.</p><p>In alle andere gevallen: <b>-je</b>. Boekje, huisje, katje.</p>',
          wanneer:'je een woord kleiner maakt.',
          maak:function(R){
            var it = R.kies(VERKLEIN), w = it[0], vk = it[1], s = it[2];
            var andere = Object.keys(VK_SOORT).filter(function(k){ return k !== s && !(s === 'k' && k === 't') && !(s === 't' && k === 'k'); });
            var fout = R.hussel(andere).slice(0, 3).map(function(k){ return VK_SOORT[k]; });
            var f = {}; if (s !== 'j') f[w + 'je'] = 'Kijk nog eens naar het eind van ' + w + '.';
            if (s === 'e') f[w + 'etje'] = 'Na een korte klank verdubbel je de medeklinker: ' + vk + '.';
            if (s === 'k' && /[aou]$/.test(w)) f[w + 'tje'] = 'Na een a, o of u schrijf je de klinker dubbel, zodat hij lang blijft: ' + vk + '.';
            return { vraag:'één ' + w + ', een klein …', context:'Maak het verkleinwoord.',
              beeld:function(n){ return n >= 2 ? R.teken.woord([{ t:vk.slice(0, vk.length - VK_UIT[s].length + 1), k:0 }, { t:VK_UIT[s].slice(1), k:2, label:VK_UIT[s] }]) : R.teken.woord([{ t:w, k:0 }]); },
              stappen:[
                kies1(R, 'Hoe eindigt ' + q(w) + '?', VK_SOORT[s], fout, s === 'e' ? 'In ' + w + ' hoor je een korte klank en daarna een ' + w.replace(/^.*?[aeiou]/, '') + '.' : s === 'i' ? w + ' eindigt op -ing, en de klemtoon ligt niet op -ing.' : s === 'p' ? w + ' eindigt op een m.' : s === 'k' ? w + ' eindigt op een klinkerklank.' : s === 't' ? 'In ' + w + ' staat een lange klank of tweeklank, met daarna een ' + w.slice(-1) + '.' : w + ' eindigt op een ' + w.slice(-1) + '.'),
                vast('Welke uitgang krijgt het?', ['-je', '-tje', '-pje', '-etje', '-kje'], VK_UIT[s], 'Bij ' + VK_SOORT[s] + ' hoort ' + VK_UIT[s] + '.'),
                { tekst:'Schrijf het verkleinwoord.', antwoord:vk, invoer:'tekst', hint:s === 'e' ? 'Verdubbel de laatste medeklinker: ' + vk.slice(0, -4) + ' + etje.' : s === 'i' ? 'Maak van de g een k: ' + w.slice(0, -1) + 'k + je.' : s === 'k' && /[aou]$/.test(w) ? 'Schrijf de laatste klinker dubbel: ' + vk.slice(0, -3) + ' + tje.' : w + ' + ' + VK_UIT[s].slice(1) + '.', fout:f } ] };
          } },
        { id:'spel-uit-meervoud', naam:'Meervoud: -en, -s of \'s', kort:'Kijk naar het eind: -el, -em, -en, -er, -je en een stomme e krijgen -s, a, i, o, u, y krijgen \'s',
          uit:'<p>Meestal maak je het meervoud met <b>-en</b>: boeken, honden.</p><p>Eindigt het woord op <b>-el, -em, -en, -er of -je</b>? Dan krijgt het een <b>-s</b>: tafels, bezems, bakkers, meisjes. Dat geldt ook voor woorden op een <b>-e</b> die je bijna niet hoort: tantes.</p><p>Eindigt het woord op <b>a, i, o, u of y</b>? Dan schrijf je <b>\'s</b>: auto\'s, taxi\'s, baby\'s. Zonder apostrof zou je autos lezen met een korte o.</p><p>Let op: na een -e nooit een apostrof. Tante\'s is fout, tantes is goed.</p>',
          wanneer:'je twijfelt tussen -en, -s en \'s.',
          maak:function(R){
            var it = R.kies(MEERVOUD), w = it[0], mv = it[1], s = it[2];
            return { vraag:'één ' + w + ', twee …', context:'Schrijf het meervoud.',
              beeld:function(n){ return n >= 2 ? R.teken.woord([{ t:w, k:0 }, { t:MV_UIT[s].replace('-', ''), k:s === 'a' ? 3 : s === 'n' ? 1 : 2, label:MV_UIT[s] }]) : R.teken.woord([{ t:w, k:0 }]); },
              stappen:[
                kies1(R, 'Hoe eindigt ' + q(w) + '?', MV_SOORT[s], Object.keys(MV_SOORT).filter(function(k){ return k !== s; }).map(function(k){ return MV_SOORT[k]; }),
                  s === 'n' ? w + ' eindigt op -' + w.slice(-2) + '. Dat is geen van de bijzondere gevallen.' : s === 'a' ? w + ' eindigt op een ' + w.slice(-1) + '.' : s === 'e' ? 'Zeg ' + w + ': de e aan het eind hoor je nauwelijks.' : w + ' eindigt op -' + w.slice(-2) + '.'),
                vast('Wat komt er achter?', ['-en', '-s', '\'s'], MV_UIT[s], MV_HINT[s]),
                { tekst:'Schrijf het meervoud: twee …', antwoord:mv, invoer:'tekst', hint:w + ' + ' + MV_UIT[s].replace('-', '') + '.', fout:mvFout(w, mv, s) } ] };
          } }
      ] }
  ]);

  /* ---------- samenstellingen ---------- */
  var SAMEN = [['voetbal', 'veld'], ['school', 'tas'], ['fiets', 'bel'], ['kerst', 'boom'], ['zwem', 'bad'], ['regen', 'jas'], ['appel', 'taart'], ['voor', 'deur'],
    ['keuken', 'tafel'], ['thee', 'pot'], ['sneeuw', 'pop'], ['zand', 'bak'], ['ijs', 'beer'], ['bus', 'halte'], ['trein', 'kaartje'], ['brandweer', 'auto'],
    ['verf', 'kwast'], ['lucht', 'ballon'], ['pinda', 'kaas'], ['melk', 'fles'], ['bal', 'pen'], ['fiets', 'pad'], ['tand', 'arts'], ['school', 'plein'],
    ['hand', 'schoen'], ['water', 'fles'], ['bloem', 'pot'], ['spijker', 'broek'], ['stoep', 'rand'], ['zee', 'hond'], ['post', 'zegel'], ['tuin', 'stoel'],
    ['oor', 'bel'], ['nacht', 'lamp'], ['vis', 'kom'], ['boter', 'ham']];
  /* tussen-s: [deel 1, deel 2, s ja of nee] */
  var TUSS = [['verjaardag', 'feest', 1], ['stad', 'park', 1], ['dorp', 'plein', 1], ['veiligheid', 'bril', 1], ['gezicht', 'masker', 1], ['leeftijd', 'grens', 1],
    ['stad', 'bus', 1], ['tijd', 'duur', 1], ['oorlog', 'monument', 1], ['leven', 'loop', 1], ['station', 'hal', 1], ['bedrijf', 'leider', 1], ['dorp', 'huis', 1],
    ['verkeer', 'bord', 1], ['verkeer', 'licht', 1], ['voetbal', 'veld', 0], ['boek', 'winkel', 0], ['school', 'reis', 0], ['hand', 'doek', 0], ['tafel', 'kleed', 0],
    ['dag', 'boek', 0], ['stad', 'huis', 0], ['tijd', 'schrift', 0], ['werk', 'dag', 0], ['gemeente', 'huis', 0], ['feest', 'dag', 0], ['regen', 'boog', 0],
    ['maan', 'licht', 0], ['ijs', 'winkel', 0], ['zomer', 'vakantie', 0]];
  /* tussen-n: [deel 1, deel 2, meervoud(en), samenstelling, soort]  soort: n = alleen -en, e = ook -s, u = uitzondering zon */
  var TUSSN = [
    ['pan', 'koek', ['pannen'], 'pannenkoek', 'n'], ['boek', 'kast', ['boeken'], 'boekenkast', 'n'], ['hond', 'mand', ['honden'], 'hondenmand', 'n'],
    ['tand', 'borstel', ['tanden'], 'tandenborstel', 'n'], ['kip', 'soep', ['kippen'], 'kippensoep', 'n'], ['bes', 'sap', ['bessen'], 'bessensap', 'n'],
    ['druif', 'sap', ['druiven'], 'druivensap', 'n'], ['paard', 'stal', ['paarden'], 'paardenstal', 'n'], ['mier', 'hoop', ['mieren'], 'mierenhoop', 'n'],
    ['kat', 'bak', ['katten'], 'kattenbak', 'n'], ['bij', 'korf', ['bijen'], 'bijenkorf', 'n'], ['gans', 'bord', ['ganzen'], 'ganzenbord', 'n'],
    ['slak', 'huis', ['slakken'], 'slakkenhuis', 'n'], ['schaap', 'vlees', ['schapen'], 'schapenvlees', 'n'], ['aap', 'staartje', ['apen'], 'apenstaartje', 'n'],
    ['roos', 'struik', ['rozen'], 'rozenstruik', 'n'], ['pruim', 'boom', ['pruimen'], 'pruimenboom', 'n'], ['vrouw', 'stem', ['vrouwen'], 'vrouwenstem', 'n'],
    ['rug', 'graat', ['ruggen'], 'ruggengraat', 'n'],
    ['gemeente', 'huis', ['gemeenten', 'gemeentes'], 'gemeentehuis', 'e'], ['groente', 'soep', ['groenten', 'groentes'], 'groentesoep', 'e'],
    ['ziekte', 'kosten', ['ziekten', 'ziektes'], 'ziektekosten', 'e'], ['gedachte', 'gang', ['gedachten', 'gedachtes'], 'gedachtegang', 'e'],
    ['hoogte', 'verschil', ['hoogten', 'hoogtes'], 'hoogteverschil', 'e'], ['ruimte', 'vaart', ['ruimten', 'ruimtes'], 'ruimtevaart', 'e'],
    ['zon', 'bloem', ['zonnen'], 'zonnebloem', 'u'], ['zon', 'bril', ['zonnen'], 'zonnebril', 'u'], ['zon', 'schijn', ['zonnen'], 'zonneschijn', 'u']
  ];
  /* koppelteken: [deel 1, deel 2, soort]  k = klinkerbotsing, h = hoofdletter, o = oud- of ex-, g = geen reden */
  var KOPPEL = [['zee', 'eend', 'k'], ['zee', 'egel', 'k'], ['thee', 'ei', 'k'], ['auto', 'ongeluk', 'k'], ['video', 'opname', 'k'], ['radio', 'omroep', 'k'],
    ['foto', 'opdracht', 'k'], ['auto', 'onderdeel', 'k'], ['radio', 'uitzending', 'k'], ['piano', 'uitvoering', 'k'], ['drie', 'eenheid', 'k'],
    ['anti', 'Amerikaans', 'h'], ['pro', 'Europees', 'h'], ['oer', 'Hollands', 'h'], ['pro', 'Russisch', 'h'], ['anti', 'Europees', 'h'],
    ['oud', 'voorzitter', 'o'], ['oud', 'leerling', 'o'], ['oud', 'burgemeester', 'o'], ['ex', 'vriend', 'o'], ['ex', 'vriendin', 'o'], ['oud', 'minister', 'o'], ['ex', 'man', 'o'],
    ['zee', 'hond', 'g'], ['auto', 'band', 'g'], ['radio', 'zender', 'g'], ['foto', 'boek', 'g'], ['thee', 'pot', 'g'], ['piano', 'les', 'g'], ['menu', 'kaart', 'g'], ['video', 'band', 'g']];
  var KOPPEL_WAAROM = { k:'Twee klinkers botsen: je zou ze samen als één klank kunnen lezen', h:'Het tweede deel begint met een hoofdletter', o:'Er staat oud- of ex- voor (vroeger)', g:'Geen reden: gewoon aan elkaar' };
  function koppelWoord(it){ return it[2] === 'g' ? it[0] + it[1] : it[0] + '-' + it[1]; }

  /* ---------- hoofdletters ---------- */
  var HL = {
    z:{ t:'het eerste woord van een zin', g:1 }, w:{ t:'een gewoon woord midden in de zin', g:0 }, p:{ t:'de naam van een persoon of dier', g:1 },
    l:{ t:'de naam van een plaats, land, rivier, zee of gebergte', g:1 }, a:{ t:'een woord dat bij een land hoort, of een taal', g:1 },
    t:{ t:'een dag, maand of seizoen', g:0 }, f:{ t:'een feest of feestdag', g:1 }, r:{ t:'een godsdienst of iemand die erin gelooft', g:0 },
    m:{ t:'een merk of bedrijf', g:1 }, b:{ t:'het eerste woord van een titel', g:1 }, x:{ t:'een woord in een titel, niet het eerste', g:0 } };
  var HLZIN = {
    z:['[Gisteren] regende het de hele dag.', '[Morgen] gaan we naar oma.', '[Waar] is mijn tas?', '[Het] is koud buiten.', 'Ik ben moe. [Ik] ga slapen.', 'Kom je mee? [We] gaan zwemmen.',
      'Pas op! [De] hond bijt.', '[Mijn] broer is jarig.', '[Wie] heeft de sleutel?', 'Het regent. [Neem] een jas mee.', '[Na] school ga ik voetballen.', '[Ons] huis is groot.',
      'Wat leuk! [Dat] had ik niet verwacht.', '[Deze] film is spannend.', '[Er] staat een man voor de deur.'],
    w:['Ik ga morgen naar [school].', 'De [hond] slaapt in zijn mand.', 'Ik heb honger, [dus] ik eet een appel.', 'Mijn [moeder] werkt in de stad.', 'We wonen in een grote [stad].',
      'Hij zwemt in de [rivier].', 'Ze woont in een klein [dorp].', 'We gaan naar een ander [land].', 'Ik vind het niet leuk, [maar] ik doe het toch.', 'De [zee] is vandaag wild.',
      'De [meester] legt het uit.', 'Wat zei je? Ik hoorde je [niet].', 'Mijn [oom] heeft een boot.', 'Na het eten [gaan] we wandelen.', 'In de [bergen] ligt sneeuw.'],
    p:['Ik speel met [Pieter].', 'Mijn zus heet [Fatima].', 'Gisteren was [Daan] ziek.', 'Onze hond heet [Bobbie].', 'Heb je [Sanne] gezien?', 'De juf belde mevrouw [Jansen].',
      'Ik zit naast [Mohammed].', 'Ik heb een brief van [Emma].', 'Opa [Henk] komt vandaag.', 'Onze kat [Minoes] slaapt veel.', 'Ik ga met [Noah] naar de film.'],
    l:['We gaan naar [Amsterdam].', 'Mijn oom woont in [Duitsland].', 'De [Rijn] stroomt door Nederland.', 'Ik zwem in de [Noordzee].', 'We fietsen naar [Utrecht].',
      'Mijn opa komt uit [Marokko].', 'In [Spanje] is het warm.', 'De [Alpen] zijn hoge bergen.', 'Ze woont in [Groningen].', 'We gaan op vakantie naar [Frankrijk].',
      'Hij is geboren in [Turkije].', 'De [Maas] stroomt door Maastricht.', 'In [Europa] wonen veel mensen.', 'We wonen vlak bij [Rotterdam].'],
    a:['Ik spreek [Engels] en Nederlands.', 'Wij hebben een [Franse] juf.', 'Hij leert [Duits] op school.', 'Ik eet graag [Italiaanse] pizza.', 'Mijn moeder spreekt [Turks].',
      'Ik hou van [Spaanse] muziek.', 'De [Nederlandse] vlag is rood, wit en blauw.', 'In Friesland spreken veel mensen [Fries].', 'We eten in een [Chinees] restaurant.',
      'Hij heeft een [Belgische] fiets.', 'Mijn buurman is [Pools].', 'Ze leert [Arabisch].', 'Het [Europese] kampioenschap begint.', 'Hij kookt een [Surinaams] gerecht.'],
    t:['Op [maandag] heb ik gym.', 'Mijn verjaardag is in [januari].', 'In de [zomer] gaan we naar zee.', 'In de [herfst] vallen de bladeren.', 'Op [woensdag] zijn we vrij.',
      'Het is koud in [december].', 'In de [lente] bloeien de bloemen.', 'In de [winter] gaan we schaatsen.', 'Het weekend begint op [vrijdag].', 'In [juli] is het vakantie.',
      'Op [zondag] slapen we uit.', 'In [maart] wordt het weer warmer.'],
    f:['Met [Kerstmis] eten we samen.', 'Met [Pasen] zoeken we eieren.', 'Met [Pinksteren] zijn we twee dagen vrij.', 'Op [Koningsdag] is er een vrijmarkt.',
      'Met [Halloween] verkleden we ons.', 'Met het [Suikerfeest] krijgen we bezoek.', 'Op [Valentijnsdag] kreeg ze een kaart.', 'Op [Bevrijdingsdag] is er een festival.',
      'Op [Moederdag] krijgt mama ontbijt op bed.', 'Op [Vaderdag] gaan we met papa uit eten.', 'Met het [Offerfeest] gaan we naar familie.', 'Op [Hemelvaartsdag] zijn de scholen dicht.'],
    r:['Mijn vriendin gelooft in de [islam].', 'Het [christendom] is een oude godsdienst.', 'We leren over het [jodendom].', 'Het [boeddhisme] komt uit Azië.',
      'Mijn buurman is [christen].', 'Haar oom is [moslim].', 'Over de [islam] heb ik een spreekbeurt gehouden.'],
    m:['Ik heb schoenen van [Nike].', 'Mijn vader werkt bij [Philips].', 'We doen boodschappen bij de [Jumbo].', 'Zoek het op met [Google].', 'Mijn fiets is een [Gazelle].',
      'Ze heeft een telefoon van [Samsung].', 'Mijn jas is van [Adidas].', 'Mijn opa rijdt in een [Volvo].', 'Mijn tante heeft een [Toyota].'],
    b:['Ik lees "[De] brief voor de koning".', 'Wij lezen "[Kruistocht] in spijkerbroek".', 'Heb jij "[Koning] van Katoren" gelezen?', 'De juf leest "[Het] boek van alle dingen" voor.',
      'Hij leest "[Het] gouden ei".', 'Ik heb "[De] aanslag" uit.', 'Ik leen "[Oorlogswinter]" uit de bibliotheek.'],
    x:['Ik lees "De [brief] voor de koning".', 'Wij lezen "Kruistocht in [spijkerbroek]".', 'Heb jij "Koning [van] Katoren" gelezen?', 'De juf leest "Het [boek] van alle dingen" voor.',
      'Hij leest "Het [gouden] ei".', 'Ik heb "De [aanslag]" uit.', 'Ik lees "De brief voor de [koning]".']
  };
  function hlOpgave(R, soorten){
    var s = R.kies(soorten), zin = R.kies(HLZIN[s]), d = delen(zin), doel = d[1], groot = HL[s].g === 1;
    var fout = doel.charAt(0) === doel.charAt(0).toUpperCase() ? doel.toLowerCase() : doel.charAt(0).toUpperCase() + doel.slice(1);
    var toon = d[0] + doel.toLowerCase() + d[2];
    var labels = Object.keys(HL).filter(function(k){ return k !== s && HL[k].g !== HL[s].g; });
    var ook = Object.keys(HL).filter(function(k){ return k !== s && HL[k].g === HL[s].g; });
    var andere = R.hussel(labels).slice(0, 2).concat(R.hussel(ook).slice(0, 1)).map(function(k){ return HL[k].t; });
    var f = {}; f[fout.toLowerCase()] = groot ? 'Dit woord krijgt een hoofdletter: ' + HL[s].t + '.' : 'Hier hoort geen hoofdletter: ' + HL[s].t + '.';
    var regel = { z:'Het woord staat aan het begin van de zin. Een zin begint na een punt, vraagteken of uitroepteken.', w:'Het is geen naam en het staat niet aan het begin van de zin.',
      p:'Het woord ' + doel + ' is de naam van iemand.', l:'Het woord ' + doel + ' is een naam op de kaart.', a:'Het woord ' + doel + ' komt van de naam van een land of is een taal.', t:'Het woord ' + doel + ' is een dag, maand of seizoen.',
      f:'Het woord ' + doel + ' is een feest.', r:'Het woord ' + doel + ' gaat over een godsdienst.', m:'Het woord ' + doel + ' is de naam van een merk of bedrijf.', b:'Het staat vooraan in de titel tussen de aanhalingstekens.',
      x:'Het staat in de titel, maar niet vooraan, en het is geen naam.' }[s];
    var controle = function(v){ return String(v).trim() === doel; };
    var beeld = function(n){ var uit = []; if (d[0].trim()) uit.push(d[0].trim()); uit.push({ t:n >= 3 ? doel : doel.toLowerCase(), k:groot ? 2 : 1, label:n >= 2 ? (groot ? 'hoofdletter' : 'kleine letter') : '' }); if (d[2].trim()) uit.push(d[2].trim()); return R.teken.zin(uit); };
    return { vraag:toon, context:'Schrijf het gekleurde woord goed: met of zonder hoofdletter?', controle:controle, antwoord:doel, beeld:beeld, zelfBeeld:beeld,
      stappen:[
        kies1(R, 'Welke regel past bij ' + q(doel.toLowerCase()) + '?', HL[s].t, andere, regel),
        vast('Hoofdletter of kleine letter?', ['hoofdletter', 'kleine letter'], groot ? 'hoofdletter' : 'kleine letter',
          'De regel: ' + HL[s].t + '. Dat krijgt ' + (groot ? 'een hoofdletter.' : 'geen hoofdletter.')),
        { tekst:'Schrijf het woord goed.', antwoord:doel, controle:controle, invoer:'tekst', hint:groot ? 'Begin met een hoofdletter: ' + doel.charAt(0) + '.' : 'Alles met kleine letters.', fout:f } ] };
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'spel-samen', niveau:'1F', domein:'spelling', naam:'Samenstellingen',
        uit:'Twee woorden die samen één nieuw woord maken. Je schrijft ze aan elkaar, soms met een s, een n of een koppelteken ertussen.' },
      doelen:[
        { id:'spel-samen-aaneen', naam:'Samenstellingen aan elkaar', kort:'Twee woorden die samen één ding zijn, schrijf je als één woord',
          uit:'<p>Een <b>samenstelling</b> is een nieuw woord uit twee woorden: voetbal + veld = <b>voetbalveld</b>.</p><p>Het <b>laatste deel</b> zegt wat het is: een voetbalveld is een veld. Het eerste deel zegt wat voor veld.</p><p>Omdat het samen één ding is, schrijf je het <b>aan elkaar</b>. Een voetbal veld met een spatie is fout.</p>',
          wanneer:'je twee zelfstandige naamwoorden achter elkaar wilt zetten.',
          maak:function(R){
            var it = R.kies(SAMEN), w = it[0] + it[1], f = {}; f[it[0] + ' ' + it[1]] = 'Samen is het één ding. Schrijf het zonder spatie.';
            return { vraag:it[0] + ' + ' + it[1], context:'Maak er één woord van.',
              beeld:function(n){ return R.teken.woord([{ t:it[0], k:1 }, { t:it[1], k:2, label:n >= 1 ? 'wat het is' : '' }]); },
              stappen:[
                vast('Welk deel zegt wat het is?', [it[0], it[1]], it[1], 'Een ' + w + ' is een soort ' + it[1] + '.'),
                vast('Het is samen één ding. Hoe schrijf je het?', ['aan elkaar', 'met een spatie'], 'aan elkaar', 'Een samenstelling schrijf je altijd aan elkaar.'),
                { tekst:'Schrijf het woord.', antwoord:w, invoer:'tekst', hint:it[0] + ' en ' + it[1] + ' zonder spatie.', fout:f } ] };
          } },
        { id:'spel-samen-tussens', naam:'De tussen-s', kort:'Hoor je een s tussen de twee delen, dan schrijf je hem; hoor je hem niet, dan niet',
          uit:'<p>Soms hoor je een <b>s</b> tussen de twee delen van een samenstelling: verjaardag<b>s</b>feest, stad<b>s</b>park.</p><p>De regel is simpel: <b>hoor je de s, dan schrijf je hem</b>. Hoor je hem niet, dan schrijf je hem niet: stadhuis, dagboek.</p><p>Zeg het woord daarom altijd hardop, zoals je het normaal zegt.</p>',
          wanneer:'je twijfelt of er een s tussen de delen hoort.',
          maak:function(R){
            var it = R.kies(TUSS), s = it[2] === 1, w = it[0] + (s ? 's' : '') + it[1], f = {};
            f[it[0] + (s ? '' : 's') + it[1]] = s ? 'Je hoort een s tussen de delen. Schrijf hem ook.' : 'Je hoort geen s. Schrijf er dan ook geen.';
            return { vraag:it[0] + ' + ' + it[1], context:'Maak er één woord van. Komt er een s tussen?',
              beeld:function(n){ var d = [{ t:it[0], k:1 }]; if (n >= 1 && s) d.push({ t:'s', k:3, label:'tussen-s' }); d.push({ t:it[1], k:2 }); return R.teken.woord(d); },
              stappen:[
                vast('Zeg het woord hardop. Hoor je een s tussen de twee delen?', ['ja', 'nee'], s ? 'ja' : 'nee', 'Zeg het zoals je het normaal zegt: ' + w + '.'),
                { tekst:'Schrijf het woord.', antwoord:w, invoer:'tekst', hint:s ? it[0] + ' + s + ' + it[1] + '.' : it[0] + ' + ' + it[1] + ', zonder s.', fout:f } ] };
          } },
        { id:'spel-samen-tussenn', naam:'De tussen-n', kort:'Heeft het eerste deel alleen een meervoud op -en, dan schrijf je -en-; anders -e-',
          uit:'<p>Hoor je een <b>e</b> tussen de delen, zoals in pannenkoek? Dan moet je kiezen tussen <b>-en-</b> en <b>-e-</b>.</p><p>Kijk naar het <b>meervoud</b> van het eerste deel. Heeft het <b>alleen</b> een meervoud op -en? Dan schrijf je <b>-en-</b>: pannen, dus pannenkoek. Honden, dus hondenmand.</p><p>Kan het meervoud ook op -s (groentes) of is er geen meervoud? Dan schrijf je <b>-e-</b>: groentesoep.</p><p>Een paar <b>uitzonderingen</b> leer je uit je hoofd: zonnebloem, zonnebril, zonneschijn. Er is maar één zon.</p>',
          wanneer:'je een e hoort tussen de twee delen van een samenstelling.',
          maak:function(R){
            var it = R.kies(TUSSN), s = it[4], en = s === 'n', f = {};
            f[en ? it[3].replace(it[2][0], it[2][0].slice(0, -1)) : it[0] + 'n' + it[1]] = en ? 'Het meervoud is alleen ' + it[2][0] + ': schrijf -en-.' : s === 'u' ? 'Uitzondering: zonne- met alleen een e.' : 'Het meervoud kan ook op -s: dan schrijf je alleen een e.';
            return { vraag:it[0] + ' + ' + it[1], context:'Maak er één woord van. Schrijf je -en- of -e-?',
              beeld:function(n){ var pre = it[3].slice(0, it[3].length - it[1].length), ml = en ? 2 : 1, midden = pre.slice(-ml);
                var d = [{ t:pre.slice(0, -ml), k:1 }]; d.push({ t:n >= 3 ? midden : '?', k:3, label:n >= 3 ? (en ? '-en-' : '-e-') : '' }); d.push({ t:it[1], k:2 }); return R.teken.woord(d); },
              stappen:[
                { tekst:'Wat is het meervoud van ' + q(it[0]) + '?', antwoord:it[2], invoer:'tekst', hint:'Eén ' + it[0] + ', twee …' },
                vast('Kan het meervoud ook op -s?', ['ja', 'nee'], s === 'e' ? 'ja' : 'nee', s === 'e' ? 'Je zegt ook: twee ' + it[2][1] + '.' : 'Twee ' + it[0] + 's zeg je niet. Het is alleen ' + it[2][0] + '.'),
                vast('Welke tussenklank schrijf je?', ['-en-', '-e-'], en ? '-en-' : '-e-', en ? 'Alleen een meervoud op -en: dus -en-.' : s === 'u' ? 'Dit is een uitzondering: er is maar één zon, dus zonne-.' : 'Het meervoud kan ook op -s: dus -e-.'),
                { tekst:'Schrijf het woord.', antwoord:it[3], invoer:'tekst', hint:it[3].slice(0, it[3].length - it[1].length) + ' + ' + it[1] + '.', fout:f } ] };
          } },
        { id:'spel-samen-koppel', naam:'Het koppelteken', kort:'Een koppelteken bij botsende klinkers, voor een hoofdletter en na oud- en ex-',
          uit:'<p>Meestal schrijf je een samenstelling gewoon aan elkaar. In drie gevallen zet je er een <b>koppelteken</b> (-) tussen.</p><p>1 <b>Klinkerbotsing</b>: zee + eend. Aan elkaar lees je zeeend, met eee. Daarom: zee-eend, auto-ongeluk, radio-uitzending.</p><p>2 Het tweede deel begint met een <b>hoofdletter</b>: anti-Amerikaans, pro-Europees.</p><p>3 Er staat <b>oud-</b> of <b>ex-</b> voor, in de betekenis van vroeger: oud-leerling, ex-vriend.</p>',
          wanneer:'je twijfelt of er een streepje tussen de delen moet.',
          maak:function(R){
            var it = R.kies(KOPPEL), w = koppelWoord(it), ja = it[2] !== 'g', f = {};
            if (ja) f[it[0] + it[1]] = 'Hier hoort een koppelteken: ' + KOPPEL_WAAROM[it[2]].toLowerCase() + '.';
            else f[it[0] + '-' + it[1]] = 'Hier botst niets: schrijf het gewoon aan elkaar.';
            return { vraag:it[0] + ' + ' + it[1], context:'Maak er één woord van. Met of zonder koppelteken?',
              beeld:function(n){ var d = [{ t:it[0], k:1 }]; if (n >= 2 && ja) d.push({ t:'-', k:3, label:'koppelteken' }); d.push({ t:it[1], k:2 }); return R.teken.woord(d); },
              stappen:[
                kies1(R, 'Kijk waar de delen elkaar raken. Wat zie je?', KOPPEL_WAAROM[it[2]], [KOPPEL_WAAROM.k, KOPPEL_WAAROM.h, KOPPEL_WAAROM.o, KOPPEL_WAAROM.g],
                  it[2] === 'k' ? it[0] + ' eindigt op een klinker en ' + it[1] + ' begint met een klinker.' : it[2] === 'h' ? it[1] + ' begint met een hoofdletter.' : it[2] === 'o' ? 'Een ' + it[0] + '-' + it[1] + ' was vroeger ' + it[1] + '.' : it[0] + ' eindigt op een klinker, maar ' + it[1] + ' begint met een medeklinker.'),
                vast('Komt er een koppelteken?', ['ja', 'nee'], ja ? 'ja' : 'nee', ja ? 'Dit is een van de drie gevallen met een koppelteken.' : 'Geen botsing, geen hoofdletter, geen oud- of ex-: aan elkaar.'),
                { tekst:'Schrijf het woord.', antwoord:w, invoer:'tekst', hint:ja ? it[0] + ' - ' + it[1] + ', zonder spaties.' : it[0] + it[1] + ', aan elkaar.', fout:f } ] };
          } }
      ] },

    { groep:{ id:'hoofd-regels', niveau:'1F', domein:'leestekens', naam:'Hoofdletters',
        uit:'Wanneer schrijf je een hoofdletter? Aan het begin van een zin en bij namen. Maar ook bij talen, feesten en merken, en juist niet bij dagen en maanden.' },
      doelen:[
        { id:'hoofd-begin', naam:'Het begin van een zin', kort:'Na een punt, vraagteken of uitroepteken begint een nieuwe zin met een hoofdletter',
          uit:'<p>Elke zin begint met een <b>hoofdletter</b>.</p><p>Een nieuwe zin begint na een <b>punt</b>, een <b>vraagteken</b> of een <b>uitroepteken</b>. Na een komma gaat dezelfde zin gewoon verder: dan geen hoofdletter.</p><p>Midden in de zin krijgen gewone woorden een kleine letter.</p>',
          wanneer:'je een zin begint of twijfelt na een leesteken.',
          maak:function(R){ return hlOpgave(R, ['z', 'z', 'w']); } },
        { id:'hoofd-namen', naam:'Namen van personen en plaatsen', kort:'Een naam krijgt een hoofdletter, een gewoon woord als stad of rivier niet',
          uit:'<p>Een <b>naam</b> krijgt een hoofdletter. Dat geldt voor namen van <b>personen</b> en dieren (Pieter, Bobbie) en voor namen op de <b>kaart</b>: plaatsen, landen, rivieren, zeeën en bergen (Utrecht, Spanje, de Rijn, de Alpen).</p><p>Het gewone woord krijgt geen hoofdletter: de stad, het land, de rivier.</p><p>Vraag jezelf af: is dit de naam van precies één persoon of plek?</p>',
          wanneer:'je een naam opschrijft.',
          maak:function(R){ return hlOpgave(R, ['p', 'l', 'p', 'l', 'w']); } },
        { id:'hoofd-taal', naam:'Talen en woorden van landen', kort:'Talen en woorden die van een land komen krijgen een hoofdletter: Frans, Nederlandse',
          uit:'<p>Een woord dat van de <b>naam van een land</b> komt, krijgt ook een hoofdletter: een <b>Franse</b> juf, de <b>Nederlandse</b> vlag.</p><p>Hetzelfde geldt voor <b>talen</b>: ik spreek <b>Engels</b>, zij leert <b>Arabisch</b>.</p><p>Gewone woorden zoals taal, les of school krijgen geen hoofdletter.</p>',
          wanneer:'je over een land, een volk of een taal schrijft.',
          maak:function(R){ return hlOpgave(R, ['a', 'a', 'a', 'w']); } },
        { id:'hoofd-tijd', naam:'Dagen, maanden en feesten', kort:'Dagen, maanden en seizoenen klein, feesten groot, godsdiensten klein',
          uit:'<p><b>Geen hoofdletter</b> bij dagen, maanden en seizoenen: maandag, januari, de zomer.</p><p><b>Wel een hoofdletter</b> bij feesten en feestdagen: Kerstmis, Pasen, Koningsdag, het Suikerfeest.</p><p>Godsdiensten en de mensen die erin geloven schrijf je <b>klein</b>: de islam, het christendom, een moslim, een christen.</p>',
          wanneer:'je een datum, een feest of een godsdienst opschrijft.',
          maak:function(R){ return hlOpgave(R, ['t', 'f', 't', 'f', 'r']); } },
        { id:'hoofd-merk', naam:'Merken en titels', kort:'Een merk krijgt een hoofdletter; in een titel alleen het eerste woord en namen',
          uit:'<p>De naam van een <b>merk</b> of een <b>bedrijf</b> krijgt een hoofdletter: Nike, Philips, de Jumbo.</p><p>In de <b>titel</b> van een boek of film krijgt alleen het <b>eerste woord</b> een hoofdletter, plus de namen die erin staan: De brief voor de koning, Koning van Katoren.</p>',
          wanneer:'je over een merk, een boek of een film schrijft.',
          maak:function(R){ return hlOpgave(R, ['m', 'b', 'x', 'm', 'b', 'x']); } },
        { id:'hoofd-mix', naam:'Hoofdletter of niet: alles door elkaar', kort:'Bepaal eerst welke regel past, dan pas hoofdletter of niet',
          uit:'<p>Nu alle regels door elkaar. Stel jezelf steeds dezelfde vraag: <b>welke regel past bij dit woord?</b></p><p>Een hoofdletter bij: het begin van een zin, namen, talen en woorden van landen, feesten, merken en het eerste woord van een titel.</p><p>Een kleine letter bij: gewone woorden, dagen, maanden, seizoenen en godsdiensten.</p>',
          wanneer:'je een tekst nakijkt op hoofdletters.',
          maak:function(R){ return hlOpgave(R, Object.keys(HL)); } }
      ] }
  ]);

  /* ========== 2F ========== */
  /* trema: [goed, fout, fout, botsende klinkers] ; zonder trema als de klinkers samen geen klank vormen */
  var TREMA = [
    ['ruïne', 'ruine', 'rüine', 'u + i', 1], ['beëindigen', 'beeindigen', 'bëeindigen', 'e + ei', 1], ['naïef', 'naief', 'näief', 'a + i', 1],
    ['cafeïne', 'cafeine', 'cafëine', 'e + i', 1], ['poëzie', 'poezie', 'pöezie', 'o + e', 1], ['coördinatie', 'coordinatie', 'cöordinatie', 'o + o', 1],
    ['reëel', 'reeel', 'rëeel', 'e + ee', 1], ['geïnteresseerd', 'geinteresseerd', 'gëinteresseerd', 'e + i', 1], ['beïnvloeden', 'beinvloeden', 'bëinvloeden', 'e + i', 1],
    ['egoïst', 'egoist', 'egöist', 'o + i', 1], ['mozaïek', 'mozaiek', 'mozäiek', 'a + ie', 1], ['geïrriteerd', 'geirriteerd', 'gëirriteerd', 'e + i', 1],
    ['reünie', 'reunie', 'rëunie', 'e + u', 1], ['skiën', 'skien', 'skïen', 'i + e', 1], ['beëdigd', 'beedigd', 'bëedigd', 'e + e', 1], ['geëerd', 'geeerd', 'gëeerd', 'e + ee', 1],
    ['naïviteit', 'naiviteit', 'näiviteit', 'a + i', 1], ['ruïneren', 'ruineren', 'rüineren', 'u + i', 1],
    ['oase', 'oäse', 'öase', 'o + a', 0], ['chaos', 'chaös', 'chäos', 'a + o', 0], ['theater', 'theäter', 'thëater', 'e + a', 0], ['piano', 'piäno', 'pïano', 'i + a', 0],
    ['ideaal', 'ideäal', 'idëaal', 'e + aa', 0], ['radio', 'radiö', 'radïo', 'i + o', 0], ['reactie', 'reäctie', 'rëactie', 'e + a', 0], ['creatief', 'creätief', 'crëatief', 'e + a', 0],
    ['geopend', 'geöpend', 'gëopend', 'e + o', 0], ['beantwoorden', 'beäntwoorden', 'bëantwoorden', 'e + a', 0]
  ];
  var PAREN = ['a + i', 'o + e', 'e + i', 'u + i', 'e + e', 'o + o', 'e + u', 'i + e', 'o + a', 'a + o', 'e + a', 'i + a', 'i + o', 'e + o'];
  /* trema in het meervoud: [enkelvoud, meervoud, klemtoon, klemtoon op ie/ee] */
  var TREMAMV = [
    ['knie', 'knieën', 'KNIE', 1], ['kopie', 'kopieën', 'ko-PIE', 1], ['categorie', 'categorieën', 'ca-te-go-RIE', 1], ['industrie', 'industrieën', 'in-dus-TRIE', 1],
    ['melodie', 'melodieën', 'me-lo-DIE', 1], ['calorie', 'calorieën', 'ca-lo-RIE', 1], ['allergie', 'allergieën', 'al-ler-GIE', 1], ['energie', 'energieën', 'e-ner-GIE', 1],
    ['fantasie', 'fantasieën', 'fan-ta-SIE', 1], ['theorie', 'theorieën', 'the-o-RIE', 1], ['parodie', 'parodieën', 'pa-ro-DIE', 1], ['strategie', 'strategieën', 'stra-te-GIE', 1],
    ['zee', 'zeeën', 'ZEE', 1], ['fee', 'feeën', 'FEE', 1], ['idee', 'ideeën', 'i-DEE', 1], ['trofee', 'trofeeën', 'tro-FEE', 1], ['orchidee', 'orchideeën', 'or-chi-DEE', 1],
    ['olie', 'oliën', 'O-lie', 0], ['bacterie', 'bacteriën', 'bac-TE-rie', 0], ['porie', 'poriën', 'PO-rie', 0]
  ];
  /* apostrof: [zin, antwoord, soort] w = weglating, l = letter of afkorting, a = woord op a, i, o, u, y */
  var APOS = [
    ['Ik sta … vroeg op. (des ochtends)', '\'s ochtends', 'w'], ['Wij eten … warm. (des avonds)', '\'s avonds', 'w'], ['Ik heb … gym. (des middags)', '\'s middags', 'w'],
    ['Hij zwemt … in zee. (des zomers)', '\'s zomers', 'w'], ['Wij schaatsen … op de vaart. (des winters)', '\'s winters', 'w'], ['Ik slaap … slecht. (des nachts)', '\'s nachts', 'w'],
    ['Ik ontbijt … om zeven uur. (des morgens)', '\'s morgens', 'w'], ['Ik wil ook … fiets. (zo een)', 'zo\'n', 'w'], ['Ik heb nog nooit … grote hond gezien. (zo een)', 'zo\'n', 'w'],
    ['Hij pakt … tas. (zijn, in spreektaal)', 'z\'n', 'w'], ['Ik zoek … sleutels. (mijn, in spreektaal)', 'm\'n', 'w'], ['Ik heb … gezien. (het, in spreektaal)', '\'t', 'w'],
    ['In aap staan twee … (a)', 'a\'s', 'l'], ['In boom staan twee … (o)', 'o\'s', 'l'], ['In vuur staan twee … (u)', 'u\'s', 'l'], ['In kiwi staan twee … (i)', 'i\'s', 'l'],
    ['Ik heb drie … gekocht. (cd)', 'cd\'s', 'l'], ['In de winkel hangen tien … (tv)', 'tv\'s', 'l'], ['Op de camping zijn vier … (wc)', 'wc\'s', 'l'],
    ['Er staan twee … voor de deur. (auto)', 'auto\'s', 'a'], ['Op het plein wachten drie … (taxi)', 'taxi\'s', 'a'], ['In de wieg liggen twee … (baby)', 'baby\'s', 'a'],
    ['Het restaurant heeft twee … (menu)', 'menu\'s', 'a'], ['Ik heb tien … gemaakt. (foto)', 'foto\'s', 'a']
  ];
  var APOS_WAAROM = { w:'Er zijn letters weggelaten', l:'Het is het meervoud van een losse letter of een afkorting', a:'Het is het meervoud van een woord op a, i, o, u of y' };
  /* afkortingen: [voluit, letters, goed(e) afkorting(en), soort] */
  var AFK = [
    ['bijvoorbeeld', 'bijv', ['bijv.'], 'v'], ['enzovoort', 'enz', ['enz.'], 'v'], ['bladzijde', 'blz', ['blz.'], 'v'], ['namelijk', 'nl', ['nl.'], 'v'],
    ['ongeveer', 'ong', ['ong.'], 'v'], ['circa', 'ca', ['ca.'], 'v'], ['mevrouw', 'mevr', ['mevr.'], 'v'], ['nummer', 'nr', ['nr.'], 'v'], ['telefoon', 'tel', ['tel.'], 'v'],
    ['inclusief', 'incl', ['incl.'], 'v'], ['exclusief', 'excl', ['excl.'], 'v'], ['eventueel', 'evt', ['evt.'], 'v'], ['zogenaamd', 'zgn', ['zgn.'], 'v'],
    ['dat wil zeggen', 'dwz', ['d.w.z.'], 'w'], ['onder andere', 'oa', ['o.a.'], 'w'], ['met andere woorden', 'maw', ['m.a.w.'], 'w'], ['zo spoedig mogelijk', 'zsm', ['z.s.m.'], 'w'],
    ['in plaats van', 'ipv', ['i.p.v.'], 'w'], ['ten opzichte van', 'tov', ['t.o.v.'], 'w'], ['en dergelijke', 'ed', ['e.d.'], 'w'], ['zie ommezijde', 'zoz', ['z.o.z.'], 'w'],
    ['met betrekking tot', 'mbt', ['m.b.t.'], 'w'], ['naar aanleiding van', 'nav', ['n.a.v.'], 'w'], ['ter attentie van', 'tav', ['t.a.v.'], 'w'], ['met vriendelijke groet', 'mvg', ['m.v.g.'], 'w'],
    ['televisie', 'tv', ['tv'], 'l'], ['watercloset', 'wc', ['wc'], 'l'], ['openbaar vervoer', 'ov', ['ov'], 'l'], ['hoger algemeen voortgezet onderwijs', 'havo', ['havo'], 'l'],
    ['voorbereidend wetenschappelijk onderwijs', 'vwo', ['vwo'], 'l'], ['voorbereidend middelbaar beroepsonderwijs', 'vmbo', ['vmbo'], 'l'], ['belasting toegevoegde waarde', 'btw', ['btw'], 'l'],
    ['eerste hulp bij ongelukken', 'ehbo', ['ehbo'], 'l'], ['algemene periodieke keuring', 'apk', ['apk'], 'l'], ['middelbaar beroepsonderwijs', 'mbo', ['mbo'], 'l'],
    ['kilometer', 'km', ['km'], 'm'], ['kilogram', 'kg', ['kg'], 'm'], ['centimeter', 'cm', ['cm'], 'm'], ['millimeter', 'mm', ['mm'], 'm'], ['milliliter', 'ml', ['ml'], 'm'],
    ['meter', 'm', ['m'], 'm'], ['gram', 'g', ['g'], 'm'], ['liter', 'l', ['l'], 'm']
  ];
  var AFK_SOORT = { l:'Je zegt de letters, of je spreekt het uit als een woord (tv, havo)', m:'Het is een maat of een gewicht (km, kg)', v:'Je leest het voor als het hele woord (bijv. lees je als bijvoorbeeld)', w:'Het zijn meer woorden, die je voluit voorleest (d.w.z.)' };
  var AFK_PUNT = { l:'geen punt', m:'geen punt', v:'een punt aan het eind', w:'een punt na elke letter' };

  /* leenwoorden: c als k of s: [woord, plek van de c] */
  var CKS = [['computer', 0], ['centrum', 0], ['cadeau', 0], ['circus', 0], ['circus', 3], ['café', 0], ['citroen', 0], ['cent', 0], ['cel', 0], ['cijfer', 0], ['cirkel', 0],
    ['concert', 0], ['concert', 3], ['cola', 0], ['camera', 0], ['cactus', 0], ['cactus', 2], ['cultuur', 0], ['crisis', 0], ['accent', 1], ['accent', 2], ['succes', 2], ['succes', 3],
    ['procent', 3], ['decimaal', 2], ['actie', 1], ['product', 5], ['medicijn', 4], ['elektriciteit', 7], ['cement', 0], ['ceremonie', 0], ['conducteur', 0], ['conducteur', 5],
    ['cursus', 0], ['contact', 0], ['contact', 5], ['cyclus', 0], ['cyclus', 2], ['circuit', 0]];
  /* -isch of -istisch: [grondwoord, bijvoeglijk naamwoord] */
  var ISTISCH = [['toerist', 'toeristisch'], ['realist', 'realistisch'], ['optimist', 'optimistisch'], ['pessimist', 'pessimistisch'], ['idealist', 'idealistisch'],
    ['specialist', 'specialistisch'], ['socialist', 'socialistisch'], ['kapitalist', 'kapitalistisch'], ['humorist', 'humoristisch'], ['nationalist', 'nationalistisch'],
    ['fantast', 'fantastisch'], ['logica', 'logisch'], ['praktijk', 'praktisch'], ['techniek', 'technisch'], ['type', 'typisch'], ['elektriciteit', 'elektrisch'],
    ['magie', 'magisch'], ['tragedie', 'tragisch'], ['chaos', 'chaotisch'], ['ritme', 'ritmisch'], ['drama', 'dramatisch'], ['romantiek', 'romantisch'],
    ['automaat', 'automatisch'], ['atleet', 'atletisch'], ['kritiek', 'kritisch'], ['economie', 'economisch'], ['psychologie', 'psychologisch'], ['biologie', 'biologisch']];
  /* Engelse woorden: meervoud */
  var ENG = [['baby', 'baby\'s', 'm'], ['hobby', 'hobby\'s', 'm'], ['pony', 'pony\'s', 'm'], ['party', 'party\'s', 'm'], ['lobby', 'lobby\'s', 'm'], ['body', 'body\'s', 'm'],
    ['lolly', 'lolly\'s', 'm'], ['penalty', 'penalty\'s', 'm'], ['derby', 'derby\'s', 'm'],
    ['cowboy', 'cowboys', 'k'], ['jockey', 'jockeys', 'k'], ['display', 'displays', 'k'], ['spray', 'sprays', 'k'], ['essay', 'essays', 'k'], ['replay', 'replays', 'k'],
    ['gadget', 'gadgets', 'a'], ['laptop', 'laptops', 'a'], ['game', 'games', 'a'], ['tablet', 'tablets', 'a'], ['app', 'apps', 'a'], ['website', 'websites', 'a'],
    ['smartphone', 'smartphones', 'a'], ['team', 'teams', 'a'], ['fan', 'fans', 'a'], ['sticker', 'stickers', 'a'], ['show', 'shows', 'a'], ['shirt', 'shirts', 'a'],
    ['festival', 'festivals', 'a'], ['selfie', 'selfies', 'a'], ['smoothie', 'smoothies', 'a'], ['hit', 'hits', 'a']];
  var ENG_SOORT = { m:'op een y na een medeklinker', k:'op een y na een klinker', a:'op een andere letter' };
  /* Franse klanken: [woord met gat, klank] */
  var FRANS = [['bur[eau]', 'oo'], ['cad[eau]', 'oo'], ['niv[eau]', 'oo'], ['plat[eau]', 'oo'], ['tabl[eau]', 'oo'], ['rest[au]rant', 'oo'], ['[au]bergine', 'oo'],
    ['dou[ch]e', 'sj'], ['ma[ch]ine', 'sj'], ['[ch]ef', 'sj'], ['[ch]ampignon', 'sj'], ['[ch]arme', 'sj'], ['bro[ch]ure', 'sj'], ['[ch]alet', 'sj'], ['[ch]auffeur', 'sj'],
    ['gara[g]e', 'zj'], ['horlo[g]e', 'zj'], ['eta[g]e', 'zj'], ['massa[g]e', 'zj'], ['reporta[g]e', 'zj'], ['baga[g]e', 'zj'], ['[j]us', 'zj'], ['[j]ournaal', 'zj'],
    ['[j]ury', 'zj'], ['[g]enie', 'zj'], ['[g]iraf', 'zj'], ['[g]elei', 'zj'],
    ['trott[oi]r', 'wa'], ['t[oi]let', 'wa'], ['reserv[oi]r', 'wa'], ['repert[oi]re', 'wa']];
  var FR_SCHRIJF = { oo:['eau', 'au', 'o', 'oo'], sj:['ch', 'sj', 'sch'], zj:['g', 'j', 'zj'], wa:['oi', 'wa', 'oa'] };
  function frHint(w){
    var d = delen(w), k = d[1];
    if (k === 'eau') return 'Aan het eind van een Frans woord schrijf je de oo-klank als eau.';
    if (k === 'au') return 'Midden in of vooraan in een Frans woord schrijf je de oo-klank vaak als au.';
    if (k === 'ch') return 'De sj-klank schrijf je in Franse woorden als ch.';
    if (k === 'g') return 'Voor een e of i schrijf je de zj-klank als g.';
    if (k === 'j') return 'Voor een a, o of u schrijf je de zj-klank als j.';
    return 'De wa-klank schrijf je in Franse woorden als oi.';
  }
  /* y of ij: [woord met gat, y?] */
  var YIJ = [['bab[y]', 1], ['hobb[y]', 1], ['pon[y]', 1], ['part[y]', 1], ['t[y]pisch', 1], ['s[y]steem', 1], ['s[y]mbool', 1], ['g[y]m', 1], ['s[y]noniem', 1], ['m[y]sterie', 1],
    ['p[y]jama', 1], ['x[y]lofoon', 1], ['h[y]pnose', 1], ['f[y]siek', 1], ['s[y]mpathiek', 1], ['d[y]namisch', 1], ['c[y]clus', 1],
    ['t[ij]d', 0], ['bl[ij]', 0], ['w[ij]n', 0], ['pr[ij]s', 0], ['m[ij]n', 0], ['r[ij]k', 0], ['[ij]zer', 0], ['z[ij]', 0], ['kr[ij]t', 0], ['sp[ij]t', 0], ['bl[ij]ven', 0],
    ['t[ij]ger', 0], ['l[ij]n', 0], ['p[ij]l', 0]];

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'spel-teken', niveau:'2F', domein:'spelling', naam:'Tekens in woorden',
        uit:'Het trema, de apostrof en de punt bij afkortingen. Kleine tekens, maar ze maken een woord goed of fout.' },
      doelen:[
        { id:'spel-teken-trema', naam:'Het trema', kort:'Botsen twee klinkers die je samen als één klank zou lezen, dan krijgt de tweede een trema',
          uit:'<p>Soms staan twee klinkers naast elkaar die <b>niet</b> samen één klank zijn. In ru-i-ne hoor je u en dan i, niet de ui van huis.</p><p>Zou je ze zonder hulp als één klank lezen, dan zet je een <b>trema</b> (de twee puntjes) op de eerste letter van de nieuwe lettergreep: <b>ruïne</b>, <b>beëindigen</b>, <b>poëzie</b>.</p><p>Kunnen de klinkers samen geen klank zijn, zoals o + a in oase? Dan is een trema niet nodig.</p>',
          wanneer:'er twee klinkers naast elkaar staan die bij verschillende lettergrepen horen.',
          maak:function(R){
            var it = R.kies(TREMA), ja = it[4] === 1, kaal = ja ? it[1] : it[0];
            return slot({ vraag:kaal.replace(/[ëïöäü]/g, function(c){ return { 'ë':'e', 'ï':'i', 'ö':'o', 'ä':'a', 'ü':'u' }[c]; }), context:'Hoe schrijf je dit woord: met of zonder trema?',
              stappen:[
                kies1(R, 'Welke klinkers raken elkaar?', it[3], R.hussel(PAREN.filter(function(p){ return p !== it[3] && kaal.indexOf(p.replace(' + ', '')) < 0; })).slice(0, 2), 'Zoek de plek waar een lettergreep eindigt op een klinker en de volgende begint met een klinker.'),
                vast('Zou je ' + it[3].replace(' + ', ' en ') + ' zonder trema als één klank kunnen lezen?', ['ja', 'nee'], ja ? 'ja' : 'nee',
                  ja ? 'Samen lijken ze op een bekende klank, zoals ui, ei, oe of ee. Dan lees je het woord verkeerd.' : 'Deze letters vormen samen geen klank. Je leest het woord vanzelf goed.'),
                kies1(R, 'Welke schrijfwijze is goed?', it[0], [it[1], it[2]], ja ? 'Het trema komt op de eerste klinker van de nieuwe lettergreep.' : 'Geen botsing tot één klank: geen trema.') ] });
          } },
        { id:'spel-teken-tremamv', naam:'Het trema in het meervoud', kort:'Woorden op -ie of -ee met de klemtoon achteraan krijgen -ën: knieën, zeeën',
          uit:'<p>Woorden op <b>-ee</b> en op <b>-ie</b> met de <b>klemtoon</b> op die laatste klank krijgen in het meervoud <b>-ën</b>: knie, knie<b>ën</b>. Zee, zee<b>ën</b>. Idee, idee<b>ën</b>.</p><p>Zonder trema zou je kniee-n lezen. Het trema laat zien dat er een nieuwe lettergreep begint.</p><p>Ligt de klemtoon <b>niet</b> op de -ie? Dan valt de e weg en schrijf je <b>-iën</b>: olie, oliën. Bacterie, bacteriën.</p>',
          wanneer:'je het meervoud maakt van een woord op -ie of -ee.',
          maak:function(R){
            var it = R.kies(TREMAMV), op = it[3] === 1, ee = /ee$/.test(it[0]);
            var fout = op ? [it[0] + 'en', ee ? it[0].slice(0, -1) + 'ën' : it[0].slice(0, -1) + 'ën'] : [it[0] + 'ën', it[0] + 'n'];
            return slot({ vraag:'één ' + it[0] + ', twee …', context:'Kies het goede meervoud.',
              stappen:[
                vast('Zeg ' + q(it[0]) + ' hardop. Ligt de klemtoon op de laatste klank (' + (ee ? 'ee' : 'ie') + ')?', ['ja', 'nee'], op ? 'ja' : 'nee', 'Zeg het zo: ' + it[2] + '. De hoofdletters laten de klemtoon zien.'),
                kies1(R, 'Welk meervoud is goed?', it[1], fout, op ? 'Klemtoon achteraan: ' + it[0] + ' + ën.' : 'Klemtoon niet op de ie: de e valt weg, ' + it[0].slice(0, -1) + ' + ën.') ] });
          } },
        { id:'spel-teken-apos', naam:'De apostrof', kort:'Een apostrof voor weggelaten letters en bij het meervoud van letters, afkortingen en woorden op a, i, o, u, y',
          uit:'<p>De <b>apostrof</b> (\') gebruik je in drie gevallen.</p><p>1 Er zijn <b>letters weggelaten</b>. De apostrof staat op hun plek: des ochtends wordt <b>\'s ochtends</b>, zo een wordt <b>zo\'n</b>, mijn wordt <b>m\'n</b>.</p><p>2 Het meervoud van een <b>losse letter</b> of een <b>afkorting</b>: twee a\'s, drie cd\'s, tv\'s.</p><p>3 Het meervoud van een woord op <b>a, i, o, u of y</b>: auto\'s, taxi\'s, baby\'s.</p>',
          wanneer:'je twijfelt waar een apostrof hoort.',
          maak:function(R){
            var it = R.kies(APOS), z = it[0].replace(/ \([^)]*\)$/, ''), tussen = /\(([^)]*)\)$/.exec(it[0])[1], ant = it[1], f = {};
            if (it[2] === 'w'){ f[ant.replace('\'', '')] = 'Er zijn letters weggelaten. Zet op die plek een apostrof.'; if (ant.slice(0, 2) === '\'s') f['s\'' + ant.slice(3)] = 'De apostrof staat vooraan, op de plek van de weggelaten letters: \'s.'; }
            else { f[ant.replace('\'', '')] = 'Zonder apostrof lees je het verkeerd. Schrijf \'s.'; }
            return { vraag:z, context:'Vul in: ' + tussen + '. Zet de apostrof op de goede plek.',
              stappen:[
                kies1(R, 'Waarom komt hier een apostrof?', APOS_WAAROM[it[2]], [APOS_WAAROM.w, APOS_WAAROM.l, APOS_WAAROM.a],
                  it[2] === 'w' ? 'Vergelijk met ' + tussen.replace(/, in spreektaal/, '') + ': er vallen letters weg.' : it[2] === 'l' ? tussen + ' is een losse letter of een afkorting.' : tussen + ' eindigt op een ' + tussen.slice(-1) + '.'),
                { tekst:'Schrijf het goed.', antwoord:ant, invoer:'tekst', hint:it[2] === 'w' ? 'De apostrof komt op de plek van de letters die wegvallen.' : 'Schrijf ' + tussen + ', dan een apostrof en dan s.', fout:f } ] };
          } },
        { id:'spel-teken-afk', naam:'Afkortingen', kort:'Lees je het voluit, dan een punt; zeg je de letters of is het een maat, dan geen punt',
          uit:'<p>Bij afkortingen hangt de <b>punt</b> af van hoe je ze uitspreekt.</p><p>Lees je de afkorting voor als het <b>hele woord</b>? Dan een punt aan het eind: <b>bijv.</b>, <b>enz.</b>, <b>blz.</b> Zijn het <b>meer woorden</b>? Dan een punt na elke letter: <b>d.w.z.</b>, <b>o.a.</b></p><p>Zeg je de <b>letters</b>, of spreek je het uit als een woord? Dan <b>geen punt</b>: tv, wc, havo, btw.</p><p><b>Maten en gewichten</b> krijgen nooit een punt: km, kg, cm.</p>',
          wanneer:'je een afkorting opschrijft.',
          maak:function(R){
            var it = R.kies(AFK), s = it[3], goed = it[2];
            var controle = function(v){ return goed.indexOf(String(v).trim().toLowerCase()) >= 0; };
            var f = {}; if (s === 'v' || s === 'w') f[it[1]] = 'Je leest het voluit voor: dan komen er punten.'; else f[it[1] + '.'] = 'Hier hoort geen punt.';
            if (s === 'w') f[it[1] + '.'] = 'Het zijn meer woorden: een punt na elke letter.';
            if (s === 'v') f[it[1].split('').join('.') + '.'] = 'Het is één woord: alleen een punt aan het eind.';
            return { vraag:it[0] + ' (' + it[1] + ')', context:'Schrijf de afkorting met de letters tussen haakjes. Met of zonder punten?', controle:controle, antwoord:goed,
              stappen:[
                kies1(R, 'Hoe lees je de afkorting voor?', AFK_SOORT[s], [AFK_SOORT.l, AFK_SOORT.m, AFK_SOORT.v, AFK_SOORT.w],
                  s === 'l' ? 'Je zegt ' + it[1] + ', niet ' + it[0] + '.' : s === 'm' ? it[0] + ' is een maat of een gewicht.' : s === 'v' ? 'Je ziet ' + it[1] + ', maar je zegt ' + it[0] + '.' : 'Je zegt ' + it[0] + ': dat zijn ' + it[0].split(' ').length + ' woorden.'),
                vast('Hoeveel punten krijgt de afkorting?', ['geen punt', 'een punt aan het eind', 'een punt na elke letter'], AFK_PUNT[s],
                  s === 'w' ? 'Meer woorden die je voluit leest: na elke letter een punt.' : s === 'v' ? 'Eén woord dat je voluit leest: een punt aan het eind.' : 'Letters of een maat: geen punt.'),
                { tekst:'Schrijf de afkorting.', antwoord:goed, controle:controle, invoer:'tekst', hint:AFK_PUNT[s].charAt(0).toUpperCase() + AFK_PUNT[s].slice(1) + ': ' + goed[0], fout:f } ] };
          } }
      ] },

    { groep:{ id:'spel-leen', niveau:'2F', domein:'spelling', naam:'Leenwoorden',
        uit:'Woorden uit het Frans, Engels, Grieks en Latijn houden vaak hun eigen spelling. Met een paar regels kun je ze toch goed schrijven en lezen.' },
      doelen:[
        { id:'spel-leen-c', naam:'De c: als k of als s', kort:'Voor e, i en y klinkt de c als s; anders als k',
          uit:'<p>In leenwoorden staat vaak een <b>c</b>. Die spreek je soms uit als <b>k</b> en soms als <b>s</b>.</p><p>Staat er een <b>e, i of y</b> achter de c? Dan klinkt hij als <b>s</b>: centrum, citroen, cyclus.</p><p>In <b>alle andere gevallen</b> klinkt hij als <b>k</b>: computer, cadeau, cultuur, crisis.</p><p>In circus zie je het allebei: de eerste c is een s, de tweede een k.</p>',
          wanneer:'je een woord met een c leest of uitspreekt.',
          maak:function(R){
            var it = R.kies(CKS), w = it[0], i = it[1], na = w.charAt(i + 1) || '', s = /[eiy]/.test(na);
            var beeld = function(n){ var d = []; if (i) d.push({ t:w.slice(0, i), k:0 }); d.push({ t:'c', k:s && n >= 2 ? 2 : 1, label:n >= 2 ? (s ? 'als s' : 'als k') : '' }); if (w.slice(i + 1)) d.push({ t:w.slice(i + 1), k:0 }); return R.teken.woord(d); };
            return slot({ vraag:w, context:'Hoe spreek je de gekleurde c uit' + (w.split('c').length > 2 ? ' (let op: er zijn er meer)' : '') + '?', beeld:beeld, zelfBeeld:beeld,
              stappen:[
                { tekst:'Welke letter staat direct achter de gekleurde c?', antwoord:na, invoer:'tekst', hint:'Kijk naar de letter rechts van de gekleurde c in ' + w + '.' },
                vast('Hoe spreek je deze c uit?', ['als een s', 'als een k'], s ? 'als een s' : 'als een k', s ? 'Achter de c staat een ' + na + ': e, i of y geeft een s.' : 'Achter de c staat een ' + na + ', geen e, i of y: dan een k.') ] });
          } },
        { id:'spel-leen-istisch', naam:'-isch en -istisch', kort:'Eindigt het grondwoord op -ist, dan plak je er -isch achter: toeristisch',
          uit:'<p>Veel bijvoeglijke naamwoorden uit andere talen eindigen op <b>-isch</b>: logisch, typisch. Je hoort ies, je schrijft isch.</p><p>Eindigt het grondwoord op <b>-ist</b>? Dan plak je -isch er gewoon achter: toerist + isch = <b>toeristisch</b>. Optimist, <b>optimistisch</b>.</p><p>Bij andere woorden komt -isch direct na de stam: logica, <b>logisch</b>; techniek, <b>technisch</b>.</p>',
          wanneer:'je een bijvoeglijk naamwoord maakt van een woord uit een andere taal.',
          maak:function(R){
            var it = R.kies(ISTISCH), ist = /ist$/.test(it[0]), w = it[1], f = {};
            f[w.replace(/isch$/, 'ies')] = 'Je hoort ies, maar je schrijft -isch.'; f[w.replace(/isch$/, 'isties')] = 'Je hoort ies, maar je schrijft -isch.';
            if (ist) f[it[0].slice(0, -3) + 'isch'] = 'De -ist blijft staan: ' + it[0] + ' + isch.';
            return { vraag:it[0] + ' → …isch', context:'Maak er een bijvoeglijk naamwoord op -isch van.',
              stappen:[
                vast('Eindigt ' + q(it[0]) + ' op -ist?', ['ja', 'nee'], ist ? 'ja' : 'nee', 'Kijk naar de laatste drie letters: ' + it[0].slice(-3) + '.'),
                vast('Hoe eindigt het bijvoeglijk naamwoord?', ['-istisch', '-isch', '-ies'], ist ? '-istisch' : '-isch', ist ? 'De -ist blijft, en daar komt -isch achter: -istisch.' : 'Geen -ist: het woord eindigt gewoon op -isch.'),
                { tekst:'Schrijf het woord.', antwoord:w, invoer:'tekst', hint:ist ? it[0] + ' + isch.' : 'Het begint met ' + w.slice(0, -4) + ' en eindigt op -isch.', fout:f } ] };
          } },
        { id:'spel-leen-eng', naam:'Engelse woorden in het meervoud', kort:'Een y na een medeklinker krijgt \'s, verder gewoon -s',
          uit:'<p>Engelse woorden krijgen in het Nederlands meestal een <b>-s</b>: gadgets, games, laptops.</p><p>Eindigt het woord op een <b>y na een medeklinker</b>? Dan schrijf je <b>\'s</b>, net als bij auto\'s: baby\'s, hobby\'s, pony\'s.</p><p>Staat er een <b>klinker voor de y</b>? Dan alleen een s: cowboys, displays.</p><p>Let op: in het Nederlands schrijf je dus niet babies of hobbies.</p>',
          wanneer:'je het meervoud maakt van een Engels woord.',
          maak:function(R){
            var it = R.kies(ENG), w = it[0], mv = it[1], s = it[2], f = {};
            if (s === 'm'){ f[w.slice(0, -1) + 'ies'] = 'Dat is Engels. In het Nederlands schrijf je ' + mv + '.'; f[w + 's'] = 'Na een y die achter een medeklinker staat, schrijf je \'s.'; }
            if (s === 'k'){ f[w + '\'s'] = 'Voor de y staat een klinker: alleen een s.'; }
            if (s === 'a'){ f[w + '\'s'] = 'Geen apostrof: ' + w + ' eindigt niet op a, i, o, u of y.'; f[w + 'en'] = 'Engelse woorden krijgen meestal een s.'; }
            return { vraag:'één ' + w + ', twee …', context:'Schrijf het meervoud.',
              stappen:[
                kies1(R, 'Hoe eindigt ' + q(w) + '?', ENG_SOORT[s], [ENG_SOORT.m, ENG_SOORT.k, ENG_SOORT.a],
                  s === 'a' ? w + ' eindigt op een ' + w.slice(-1) + '.' : 'Kijk naar de letter voor de y: ' + w.slice(-2, -1) + '.'),
                vast('Wat komt erachter?', ['-s', '\'s'], s === 'm' ? '\'s' : '-s', s === 'm' ? 'Een y na een medeklinker: \'s, net als bij baby\'s.' : 'Alleen een s.'),
                { tekst:'Schrijf het meervoud: twee …', antwoord:mv, invoer:'tekst', hint:s === 'm' ? w + ' + \'s.' : w + ' + s.', fout:f } ] };
          } },
        { id:'spel-leen-frans', naam:'Franse woorden', kort:'Oo aan het eind is eau, sj is ch, zj is g of j, wa is oi',
          uit:'<p>Franse woorden houden hun Franse spelling. Leer welke letters bij welke klank horen.</p><p>De <b>oo</b> aan het eind schrijf je als <b>eau</b> (cadeau, bureau), elders vaak als <b>au</b> (restaurant).</p><p>De <b>sj</b> schrijf je als <b>ch</b> (douche, machine). De <b>zj</b> als <b>g</b> voor een e of i (garage, giraf) en als <b>j</b> voor andere klinkers (jury, journaal).</p><p>De <b>wa</b> schrijf je als <b>oi</b> (trottoir, toilet).</p>',
          wanneer:'je een woord uit het Frans opschrijft.',
          maak:function(R){
            var it = R.kies(FRANS), w = it[0], k = it[1], goed = kern(w);
            var f = {}; FR_SCHRIJF[k].forEach(function(x){ if (x !== goed) f[delen(w)[0] + x + delen(w)[2]] = frHint(w); });
            return { vraag:gat(w), context:'Welke Franse klank staat op de puntjes? Schrijf het hele woord.',
              beeld:function(n){ return gatBeeld(R, w, n >= 2, k); },
              stappen:[
                vast('Zeg het woord hardop. Welke klank hoor je op de puntjes?', ['oo', 'sj', 'zj', 'wa'], k, 'Zeg het hele woord: ' + vol(w) + '. Luister naar de plek van de puntjes.'),
                kies1(R, 'Hoe schrijf je die klank in dit woord?', goed, R.hussel(FR_SCHRIJF[k].filter(function(x){ return x !== goed; })).slice(0, 2), frHint(w)),
                { tekst:'Schrijf het hele woord.', antwoord:vol(w), invoer:'tekst', hint:'Zet ' + goed + ' op de plek van de puntjes.', fout:f } ] };
          } },
        { id:'spel-leen-y', naam:'Y of ij', kort:'Hoor je ei, dan ij; hoor je ie of i in een leenwoord, dan y',
          uit:'<p>De <b>ij</b> en de <b>y</b> lijken op elkaar, maar ze klinken anders.</p><p>De Nederlandse <b>ij</b> klinkt als <b>ei</b>: tijd, wijn, blij.</p><p>De <b>y</b> staat in leenwoorden en klinkt als <b>ie</b> of <b>i</b>: baby, hobby, systeem, gym.</p><p>Hoor je dus ie of i in een woord uit een andere taal, dan schrijf je een y.</p>',
          wanneer:'je twijfelt tussen y en ij.',
          maak:function(R){
            var it = R.kies(YIJ), w = it[0], y = it[1] === 1, f = {};
            f[delen(w)[0] + (y ? 'ij' : 'y') + delen(w)[2]] = y ? 'Je hoort geen ei, maar ie of i: schrijf een y.' : 'Je hoort ei: schrijf ij.';
            if (y) f[delen(w)[0] + 'ie' + delen(w)[2]] = 'Het is een leenwoord: de ie-klank schrijf je hier als y.';
            return { vraag:gat(w), context:'Y of ij? Schrijf het hele woord.',
              beeld:function(n){ return gatBeeld(R, w, n >= 2, y ? 'ie' : 'ei'); },
              stappen:[
                vast('Zeg het woord hardop. Welke klank hoor je op de puntjes?', ['ei, zoals in wijn', 'ie of i, zoals in baby'], y ? 'ie of i, zoals in baby' : 'ei, zoals in wijn', 'Zeg het hele woord: ' + vol(w) + '.'),
                vast('Y of ij?', ['y', 'ij'], y ? 'y' : 'ij', y ? 'De ie-klank in een leenwoord: y.' : 'De ei-klank: ij.'),
                { tekst:'Schrijf het hele woord.', antwoord:vol(w), invoer:'tekst', hint:'Zet ' + (y ? 'y' : 'ij') + ' op de plek van de puntjes.', fout:f } ] };
          } }
      ] }
  ]);

  /* ========== 3F ========== */
  /* er + voorzetsel: [voor, er/hier/daar/waar, voorzetsel, na, groep als het los moet] */
  var ERAF = [
    ['De kat springt', 'er', 'af', '.', ''], ['Ik weet', 'er', 'van', '.', ''], ['Hij denkt', 'er', 'over', 'na.', ''], ['Wat doe je', 'er', 'mee', '?', ''],
    ['Ik kijk', 'er', 'naar', '.', ''], ['Het boek ligt', 'er', 'onder', '.', ''], ['Kom je', 'er', 'bij', '?', ''], ['We praten', 'er', 'over', '.', ''],
    ['Zij is', 'er', 'aan', 'gewend.', ''], ['De sleutel zit', 'er', 'in', '.', ''], ['De dief gaat', 'er', 'vandoor', '.', ''], ['Ik ben', 'hier', 'mee', 'klaar.', ''],
    ['', 'Waar', 'over', 'gaat het boek?', ''], ['Ze houdt', 'er', 'van', 'om te dansen.', ''], ['Ik heb', 'daar', 'aan', 'gedacht.', ''], ['Hij heeft', 'er', 'op', 'gewacht.', ''],
    ['Ik zie', 'er', 'op', 'deze foto moe uit.', 'op deze foto'], ['Hij woont', 'er', 'met', 'zijn moeder.', 'met zijn moeder'], ['We waren', 'er', 'om', 'acht uur.', 'om acht uur'],
    ['Het is', 'er', 'in', 'de zomer druk.', 'in de zomer'], ['Ik was', 'er', 'voor', 'het eten al.', 'voor het eten'], ['Je ziet', 'er', 'op', 'dit plaatje blij uit.', 'op dit plaatje'],
    ['Ik ben', 'er', 'na', 'schooltijd.', 'na schooltijd'], ['Het was', 'er', 'tijdens', 'de vakantie stil.', 'tijdens de vakantie'], ['Ze speelt', 'er', 'met', 'haar vriendin.', 'met haar vriendin'],
    ['Hij zat', 'er', 'naast', 'zijn opa.', 'naast zijn opa'], ['We hebben', 'er', 'in', 'het park gespeeld.', 'in het park']
  ];
  /* lastige woorden: [zin, goed, fout, betekenis goed, betekenis fout] */
  var LASTIG = [
    ['Je moet … 18 jaar zijn.', 'ten minste', 'tenminste', 'minimaal', 'althans'], ['Lees … drie boeken.', 'ten minste', 'tenminste', 'minimaal', 'althans'],
    ['Het kost … tien euro.', 'ten minste', 'tenminste', 'minimaal', 'althans'], ['Je moet … een uur oefenen.', 'ten minste', 'tenminste', 'minimaal', 'althans'],
    ['Hij komt morgen, …, dat zei hij.', 'tenminste', 'ten minste', 'althans', 'minimaal'], ['Ik heb geen tijd, … niet vandaag.', 'tenminste', 'ten minste', 'althans', 'minimaal'],
    ['Ze is ziek, … dat denk ik.', 'tenminste', 'ten minste', 'althans', 'minimaal'], ['We winnen, … als we goed spelen.', 'tenminste', 'ten minste', 'althans', 'minimaal'],
    ['… wil ik iedereen bedanken.', 'Ten slotte', 'Tenslotte', 'tot slot', 'immers'], ['Eerst wassen, dan drogen en … strijken.', 'ten slotte', 'tenslotte', 'tot slot', 'immers'],
    ['We aten soep, daarna friet en … een ijsje.', 'ten slotte', 'tenslotte', 'tot slot', 'immers'], ['Je mag wel mee, het is … jouw feest.', 'tenslotte', 'ten slotte', 'immers', 'tot slot'],
    ['Hij lachte, hij had … gewonnen.', 'tenslotte', 'ten slotte', 'immers', 'tot slot'], ['Ik ga naar bed, het is … al laat.', 'tenslotte', 'ten slotte', 'immers', 'tot slot'],
    ['Ik wil ook … fiets.', 'zo\'n', 'zulke', 'één ding', 'meer dingen'], ['Heb jij ook … schoenen?', 'zulke', 'zo\'n', 'meer dingen', 'één ding'],
    ['Ik heb nog nooit … groot huis gezien.', 'zo\'n', 'zulke', 'één ding', 'meer dingen'], ['… vragen vind ik moeilijk.', 'Zulke', 'Zo\'n', 'meer dingen', 'één ding'],
    ['Ik wil ook … telefoon.', 'zo\'n', 'zulke', 'één ding', 'meer dingen'], ['Waar koop je … mooie bloemen?', 'zulke', 'zo\'n', 'meer dingen', 'één ding'],
    ['Met … mensen speel ik graag.', 'zulke', 'zo\'n', 'meer dingen', 'één ding'], ['Wat gezellig! Ik wil ook … feest.', 'zo\'n', 'zulke', 'één ding', 'meer dingen'],
    ['Je hebt … snoep gegeten.', 'te veel', 'teveel', 'meer dan goed is (te + veel)', 'een ding: het overschot'], ['Je eet … suiker.', 'te veel', 'teveel', 'meer dan goed is (te + veel)', 'een ding: het overschot'],
    ['Ik heb … gegeten.', 'te veel', 'teveel', 'meer dan goed is (te + veel)', 'een ding: het overschot'], ['Het … aan water loopt weg.', 'teveel', 'te veel', 'een ding: het overschot', 'meer dan goed is (te + veel)'],
    ['Het … aan suiker is slecht voor je.', 'teveel', 'te veel', 'een ding: het overschot', 'meer dan goed is (te + veel)']
  ];
  function lastigUitleg(goed){
    var g = goed.toLowerCase();
    return { 'ten minste':'Ten minste (los) betekent minimaal.', 'tenminste':'Tenminste (aan elkaar) betekent althans.', 'ten slotte':'Ten slotte (los) betekent tot slot.',
      'tenslotte':'Tenslotte (aan elkaar) betekent immers.', 'zo\'n':'Zo\'n gebruik je bij één ding.', 'zulke':'Zulke gebruik je bij meer dingen.',
      'te veel':'Te veel schrijf je los: het is te + veel, net als te weinig.', 'teveel':'Alleen het teveel, het overschot, schrijf je aan elkaar.' }[g];
  }
  /* verkleinwoorden van leenwoorden: [woord, goed, fout, fout, soort] */
  var VKLEEN = [
    ['oma', 'omaatje', 'omatje', 'oma\'tje', 'a'], ['opa', 'opaatje', 'opatje', 'opa\'tje', 'a'], ['auto', 'autootje', 'autotje', 'auto\'tje', 'a'], ['foto', 'fotootje', 'fototje', 'foto\'tje', 'a'],
    ['menu', 'menuutje', 'menutje', 'menu\'tje', 'a'], ['paraplu', 'parapluutje', 'paraplutje', 'paraplu\'tje', 'a'], ['kano', 'kanootje', 'kanotje', 'kano\'tje', 'a'],
    ['radio', 'radiootje', 'radiotje', 'radio\'tje', 'a'], ['cola', 'colaatje', 'colatje', 'cola\'tje', 'a'],
    ['taxi', 'taxi\'tje', 'taxietje', 'taxitje', 'i'], ['baby', 'baby\'tje', 'babytje', 'babietje', 'i'], ['hobby', 'hobby\'tje', 'hobbytje', 'hobbietje', 'i'],
    ['pony', 'pony\'tje', 'ponytje', 'ponietje', 'i'], ['lolly', 'lolly\'tje', 'lollytje', 'lollietje', 'i'],
    ['café', 'cafeetje', 'caféetje', 'cafétje', 'e'],
    ['cadeau', 'cadeautje', 'cadeau\'tje', 'cadeaatje', 'u'], ['bureau', 'bureautje', 'bureau\'tje', 'burootje', 'u'], ['plateau', 'plateautje', 'plateau\'tje', 'plateaatje', 'u'],
    ['cd', 'cd\'tje', 'cdtje', 'cd-tje', 'k'], ['tv', 'tv\'tje', 'tvtje', 'tv-tje', 'k'], ['sms', 'sms\'je', 'smsje', 'sms-je', 'k']
  ];
  var VKL_SOORT = { a:'het eindigt op a, o of u', i:'het eindigt op i of y', e:'het eindigt op é', u:'het eindigt op eau', k:'het is een afkorting' };
  var VKL_HINT = { a:'Na a, o of u schrijf je de klinker dubbel, zodat hij lang blijft: omaatje, autootje, menuutje.', i:'Na i of y zet je een apostrof: taxi\'tje, baby\'tje.',
    e:'De é wordt ee: cafeetje.', u:'Eau is al een lange klank: je plakt er gewoon -tje achter.', k:'Na een afkorting zet je een apostrof: cd\'tje, sms\'je.' };
  /* getallen in letters */
  var EEN = ['', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen'];
  var TIENER = ['tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien'];
  var TIG = ['', '', 'twintig', 'dertig', 'veertig', 'vijftig', 'zestig', 'zeventig', 'tachtig', 'negentig'];
  function totHonderd(n, spatie){
    if (n < 10) return EEN[n];
    if (n < 20) return TIENER[n - 10];
    var t = Math.floor(n / 10), e = n % 10;
    if (!e) return TIG[t];
    var en = (e === 2 || e === 3) ? 'ën' : 'en';
    return spatie ? EEN[e] + ' en ' + TIG[t] : EEN[e] + en + TIG[t];
  }
  function getalWoord(n, spatie){
    var h = Math.floor(n / 100), r = n % 100, s = '';
    if (h) s = (h === 1 ? '' : EEN[h]) + 'honderd';
    if (r) s += (h && spatie ? ' ' : '') + totHonderd(r, spatie);
    return s;
  }
  /* cijfers en afkortingen in samenstellingen: [deel, rest, soort, woord] s = heel woord, v = verkleinwoord, m = meervoud */
  var CIJFER = [
    ['cd', 'speler', 's', 'cd-speler'], ['18', 'jarige', 's', '18-jarige'], ['tv', 'programma', 's', 'tv-programma'], ['A4', 'papier', 's', 'A4-papier'], ['wc', 'papier', 's', 'wc-papier'],
    ['ehbo', 'doos', 's', 'ehbo-doos'], ['btw', 'nummer', 's', 'btw-nummer'], ['havo', 'leerling', 's', 'havo-leerling'], ['65', 'plusser', 's', '65-plusser'], ['3', 'jarig', 's', '3-jarig'],
    ['100', 'jarig', 's', '100-jarig'], ['vmbo', 'school', 's', 'vmbo-school'], ['tv', 'serie', 's', 'tv-serie'], ['sms', 'bericht', 's', 'sms-bericht'], ['ov', 'chipkaart', 's', 'ov-chipkaart'],
    ['cd', 'tje', 'v', 'cd\'tje'], ['tv', 'tje', 'v', 'tv\'tje'], ['A4', 'tje', 'v', 'A4\'tje'], ['sms', 'je', 'v', 'sms\'je'],
    ['cd', 's', 'm', 'cd\'s'], ['tv', 's', 'm', 'tv\'s'], ['wc', 's', 'm', 'wc\'s'], ['pc', 's', 'm', 'pc\'s']
  ];
  var CIJ_SOORT = { s:'een heel woord', v:'een verkleinuitgang (-tje of -je)', m:'een meervouds-s' };

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'spel-moeilijk', niveau:'3F', domein:'spelling', naam:'Lastige gevallen',
        uit:'De moeilijkste spelling: aan elkaar of los, verkleinwoorden van leenwoorden, getallen in letters en woorden met cijfers en afkortingen.' },
      doelen:[
        { id:'spel-moei-eraf', naam:'Eraf of er af', kort:'Horen er en het voorzetsel bij elkaar, dan aan elkaar; hoort het voorzetsel bij de woorden erna, dan los',
          uit:'<p>Staan <b>er</b> (of hier, daar, waar) en een <b>voorzetsel</b> naast elkaar, dan schrijf je ze meestal <b>aan elkaar</b>: eraf, ervan, hiermee, waarover.</p><p>Maar soms hoort het voorzetsel bij de woorden die <b>erna</b> komen: Het is er <b>in de zomer</b> druk. In hoort bij in de zomer, niet bij er. Dan schrijf je ze <b>los</b>.</p><p>Test: kun je het voorzetsel met de woorden erna als één groepje verplaatsen? In de zomer is het er druk. Dan los.</p>',
          wanneer:'er, hier, daar of waar naast een voorzetsel staat.',
          maak:function(R){
            var it = R.kies(ERAF), los = !!it[4], samen = it[1] + it[2], apart = it[1] + ' ' + it[2];
            var zin = (it[0] ? it[0] + ' ' : '') + '(' + it[1] + ' + ' + it[2] + ')' + (/^[.?!]/.test(it[3]) ? '' : ' ') + it[3];
            return slot({ vraag:zin, context:'Aan elkaar of los?',
              stappen:[
                vast('Bij welke woorden hoort ' + q(it[2]) + '?', ['bij ' + it[1].toLowerCase(), 'bij de woorden erna'], los ? 'bij de woorden erna' : 'bij ' + it[1].toLowerCase(),
                  los ? it[2] + ' hoort bij ' + it[4] + '. Dat groepje kun je samen verplaatsen.' : it[1].toLowerCase() + ' en ' + it[2] + ' horen samen. Er komt geen groepje als in de zomer achter ' + it[2] + '.'),
                vast('Hoe schrijf je het?', [samen, apart], los ? apart : samen, los ? 'Het voorzetsel hoort bij de woorden erna: los.' : 'Ze horen bij elkaar: aan elkaar.') ] });
          } },
        { id:'spel-moei-tenminste', naam:'Tenminste of ten minste', kort:'De betekenis beslist: ten minste is minimaal, tenminste is althans',
          uit:'<p>Sommige woorden schrijf je aan elkaar of los, afhankelijk van wat je bedoelt.</p><p><b>ten minste</b> = minimaal (ten minste 18 jaar). <b>tenminste</b> = althans (hij komt, tenminste, dat zei hij).</p><p><b>ten slotte</b> = tot slot. <b>tenslotte</b> = immers.</p><p><b>zo\'n</b> bij één ding, <b>zulke</b> bij meer dingen. En <b>te veel</b> schrijf je los, net als te weinig. Alleen het teveel (het overschot) is één woord.</p>',
          wanneer:'je twijfelt of je zo\'n woord aan elkaar of los schrijft.',
          maak:function(R){
            var it = R.kies(LASTIG);
            return slot({ vraag:it[0], context:'Welk woord hoort op de puntjes?',
              stappen:[
                kies1(R, 'Wat bedoel je hier?', it[3], [it[4]], lastigUitleg(it[1]) + ' Lees de zin met dat woord.'),
                kies1(R, 'Welk woord schrijf je?', it[1], [it[2]], lastigUitleg(it[1])) ] });
          } },
        { id:'spel-moei-verklleen', naam:'Verkleinwoorden van leenwoorden', kort:'Na a, o, u de klinker dubbel; na i, y en afkortingen een apostrof; é wordt ee',
          uit:'<p>Leenwoorden eindigen vaak op een klinker. Bij het verkleinwoord let je op het <b>eind</b>.</p><p>Op <b>a, o of u</b>: schrijf de klinker <b>dubbel</b>, dan blijft hij lang: omaatje, autootje, menuutje.</p><p>Op <b>i of y</b>, en bij een <b>afkorting</b>: een <b>apostrof</b>: taxi\'tje, baby\'tje, cd\'tje.</p><p>Op <b>é</b>: die wordt <b>ee</b>: cafeetje. Op <b>eau</b>: gewoon -tje erachter: cadeautje.</p>',
          wanneer:'je een leenwoord of afkorting kleiner maakt.',
          maak:function(R){
            var it = R.kies(VKLEEN), s = it[4];
            return slot({ vraag:'één ' + it[0] + ', een klein …', context:'Kies het goede verkleinwoord.',
              stappen:[
                kies1(R, 'Waar let je op bij ' + q(it[0]) + '?', VKL_SOORT[s], R.hussel(Object.keys(VKL_SOORT).filter(function(k){ return k !== s; })).slice(0, 2).map(function(k){ return VKL_SOORT[k]; }),
                  s === 'k' ? it[0] + ' is een afkorting: je zegt de letters.' : it[0] + ' eindigt op ' + (s === 'u' ? 'eau' : s === 'e' ? 'é' : 'een ' + it[0].slice(-1)) + '.'),
                kies1(R, 'Welk verkleinwoord is goed?', it[1], [it[2], it[3]], VKL_HINT[s]) ] });
          } },
        { id:'spel-moei-getal', naam:'Getallen in letters', kort:'Getallen tot duizend schrijf je aan elkaar, met een trema bij tweeën en drieën',
          uit:'<p>Een getal in letters schrijf je als <b>één woord</b>: honderdvijfentwintig, driehonderdtwaalf.</p><p>Je zegt eerst de eenheden en dan de tientallen, met <b>en</b> ertussen: vijf-en-twintig, maar zonder streepjes: <b>vijfentwintig</b>.</p><p>Komt <b>en</b> na twee of drie, dan krijgt de e een <b>trema</b>: twee<b>ën</b>twintig, drie<b>ën</b>dertig. Anders lees je tweeentwintig met eee.</p>',
          wanneer:'je een getal in letters moet schrijven, zoals op een cheque of in een verhaal.',
          maak:function(R){
            var n; do { n = R.kies([R.heel(21, 99), R.heel(101, 999), R.heel(101, 999)]); } while (n % 100 === 0 || (n < 100 && n % 10 === 0));
            var r = n % 100, e = r % 10, trema = r > 20 && (e === 2 || e === 3), goed = getalWoord(n), spatie = getalWoord(n, true);
            var derde = trema ? goed.replace('ën', 'en') : (r > 20 && e ? goed.replace(EEN[e] + 'en' + TIG[Math.floor(r / 10)], EEN[e] + '-en-' + TIG[Math.floor(r / 10)]) : goed.replace('honderd', 'honderd-'));
            if (derde === goed || derde === spatie || /-$/.test(derde)) derde = goed + 'e';
            if (spatie === goed) spatie = goed.replace('honderd', 'honderd ');
            if (spatie === goed) spatie = 'een ' + goed;
            return slot({ vraag:R.toon(n), context:'Hoe schrijf je dit getal in letters?',
              stappen:[
                vast('Schrijf je het getal aan elkaar of met spaties?', ['aan elkaar', 'met spaties'], 'aan elkaar', 'Getallen tot duizend zijn één woord.'),
                vast('Komt er een trema in?', ['ja', 'nee'], trema ? 'ja' : 'nee', trema ? 'Je zegt ' + EEN[e] + ' en ' + TIG[Math.floor(r / 10)] + '. Na ' + EEN[e] + ' komt en: dat wordt ' + EEN[e] + 'ën.' : 'Alleen na twee of drie, vlak voor en, komt een trema.'),
                kies1(R, 'Welke schrijfwijze is goed?', goed, [spatie, derde], 'Alles aan elkaar' + (trema ? ', met een trema op ' + EEN[e] + 'ën' : '') + '.') ] });
          } },
        { id:'spel-moei-cijfer', naam:'Cijfers en afkortingen in woorden', kort:'Met een heel woord erachter een koppelteken; bij -tje en meervoud een apostrof',
          uit:'<p>Plak je een <b>heel woord</b> achter een cijfer of afkorting? Dan zet je een <b>koppelteken</b>: cd-speler, 18-jarige, tv-programma.</p><p>Maak je er een <b>verkleinwoord</b> of een <b>meervoud</b> van? Dan zet je een <b>apostrof</b>: cd\'tje, A4\'tje, sms\'je, cd\'s, tv\'s.</p>',
          wanneer:'je een woord maakt met een cijfer of een afkorting erin.',
          maak:function(R){
            var it = R.kies(CIJFER), s = it[2], w = it[3], kp = s === 's', f = {};
            if (kp){ f[it[0] + it[1]] = 'Tussen een cijfer of afkorting en een heel woord komt een koppelteken.'; f[it[0] + ' ' + it[1]] = 'Gebruik een koppelteken, geen spatie.'; f[it[0] + '\'' + it[1]] = 'Een heel woord krijgt een koppelteken, geen apostrof.'; }
            else { f[it[0] + it[1]] = 'Hier komt een apostrof tussen.'; f[it[0] + '-' + it[1]] = 'Bij ' + (s === 'v' ? 'een verkleinwoord' : 'een meervoud') + ' een apostrof, geen koppelteken.'; }
            var lf = {}; Object.keys(f).forEach(function(k){ lf[k.toLowerCase()] = f[k]; }); f = lf;
            var vraag = s === 's' ? it[0] + ' + ' + it[1] : s === 'v' ? 'een kleine ' + it[0] + ': een …' : 'één ' + it[0] + ', twee …';
            return { vraag:vraag, context:s === 's' ? 'Maak er één woord van.' : s === 'v' ? 'Maak het verkleinwoord.' : 'Schrijf het meervoud.',
              stappen:[
                kies1(R, 'Wat komt er achter ' + q(it[0]) + '?', CIJ_SOORT[s], [CIJ_SOORT.s, CIJ_SOORT.v, CIJ_SOORT.m], s === 's' ? it[1] + ' is een heel woord.' : s === 'v' ? '-' + it[1] + ' maakt het klein.' : 'Een s maakt het meervoud.'),
                vast('Welk teken zet je ertussen?', ['koppelteken', 'apostrof'], kp ? 'koppelteken' : 'apostrof', kp ? 'Een heel woord erachter: koppelteken.' : 'Een verkleinwoord of meervoud: apostrof.'),
                { tekst:'Schrijf het woord.', antwoord:w, invoer:'tekst', hint:it[0] + (kp ? ' - ' : ' \' ') + it[1] + ', zonder spaties.', fout:f } ] };
          } }
      ] }
  ]);
})();
