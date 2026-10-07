/* De trucjes van de Werkwoordrace en Irregular verbs voor leer.js. */
(function(){
  'use strict';
  function kies(l){ return l[Math.floor(Math.random() * l.length)]; }
  /* ---------- werkwoordspelling ----------
     inf, stam, kof (laatste letter van de stam in 't kofschip), en een stukje
     zin waar het werkwoord in past. Alleen regelmatige werkwoorden, en geen
     v/f of z/s, zodat de regel zonder uitzondering werkt. */
  var WW = [
    { inf:'werken', stam:'werk', kof:1, zin:'% hard' }, { inf:'fietsen', stam:'fiets', kof:1, zin:'% naar school' },
    { inf:'maken', stam:'maak', kof:1, zin:'% zijn huiswerk' }, { inf:'stoppen', stam:'stop', kof:1, zin:'% met gamen' },
    { inf:'missen', stam:'mis', kof:1, zin:'% de bus' }, { inf:'poetsen', stam:'poets', kof:1, zin:'% zijn tanden' },
    { inf:'dansen', stam:'dans', kof:1, zin:'% op het feest' }, { inf:'koken', stam:'kook', kof:1, zin:'% het eten' },
    { inf:'hopen', stam:'hoop', kof:1, zin:'% op mooi weer' },
    { inf:'praten', stam:'praat', kof:1, zin:'% met zijn moeder' }, { inf:'zetten', stam:'zet', kof:1, zin:'% de tas neer' },
    { inf:'wachten', stam:'wacht', kof:1, zin:'% op de trein' }, { inf:'spelen', stam:'speel', kof:0, zin:'% voetbal' },
    { inf:'leren', stam:'leer', kof:0, zin:'% voor de toets' }, { inf:'wonen', stam:'woon', kof:0, zin:'% in Emmeloord' },
    { inf:'horen', stam:'hoor', kof:0, zin:'% de bel' }, { inf:'bellen', stam:'bel', kof:0, zin:'% zijn oma' },
    { inf:'wandelen', stam:'wandel', kof:0, zin:'% met de hond' }, { inf:'noemen', stam:'noem', kof:0, zin:'% hem Sam' },
    { inf:'antwoorden', stam:'antwoord', kof:0, zin:'% snel' }, { inf:'redden', stam:'red', kof:0, zin:'% de kat' },
    { inf:'schudden', stam:'schud', kof:0, zin:'% de fles' }, { inf:'huren', stam:'huur', kof:0, zin:'% een fiets' }
  ];
  function opT(s){ return /t$/.test(s); }
  function opDT(s){ return /[dt]$/.test(s); }
  function hijVorm(w){ return opT(w.stam) ? w.stam : w.stam + 't'; }
  function vt(w){ return w.stam + (w.kof ? 'te' : 'de'); }
  function vd(w){ return 'ge' + w.stam + (opDT(w.stam) ? '' : (w.kof ? 't' : 'd')); }
  function zinMet(w, wie, gat){ var z = w.zin.replace('%', gat); return wie.charAt(0).toUpperCase() + wie.slice(1) + ' ' + z + '.'; }
  var STAM = 'de stam is de ik-vorm: ik ';
  var WERKWOORDEN = [
    { kop:'Hij, zij en het: stam + t', kort:'Bij hij, zij, het en jij komt er een t achter de stam',
      uit:'Zoek eerst de stam: dat is wat je zegt na "ik" (ik werk, ik maak). Bij ik schrijf je alleen de stam. Bij hij, zij, het en jij komt er een t achter. Eindigt de stam al op een t, dan komt er geen tweede t bij.',
      voorbeeld:['Hij ___ hard. (werken)', STAM + 'werk', 'hij: stam + t = werkt'],
      maak:function(){ var w = kies(WW), wie = kies(['hij', 'zij', 'ik', 'hij', 'jij']), ik = wie === 'ik', goed = ik ? w.stam : hijVorm(w);
        return { vraag:zinMet(w, wie, '___') + ' (' + w.inf + ')', stappen:[STAM + w.stam],
          slot:ik ? 'ik: alleen de stam =' : (opT(w.stam) ? 'de stam eindigt al op t, dus ' + wie + ':' : wie + ': stam + t ='), antwoord:[goed], invoer:'tekst' }; } },
    { kop:'Verleden tijd: ’t kofschip', kort:'Staat de laatste letter van de stam in ’t kofschip, dan -te, anders -de',
      uit:'Kijk naar de laatste letter van de stam. Zit die in ’t kofschip (t, k, f, s, ch, p), dan schrijf je -te (meervoud -ten). Anders -de (meervoud -den).',
      voorbeeld:['Gisteren ___ hij naar school. (fietsen)', STAM + 'fiets', 'de s zit in ’t kofschip, dus -te: fietste'],
      maak:function(){ var w = kies(WW), mv = Math.random() < .3 && !/zijn /.test(w.zin), letter = /ch$/.test(w.stam) ? 'ch' : w.stam.slice(-1), goed = vt(w) + (mv ? 'n' : '');
        return { vraag:'Gisteren ___ ' + (mv ? 'wij' : 'hij') + ' ' + w.zin.replace('% ', '').replace('%', '') + '. (' + w.inf + ')', stappen:[STAM + w.stam, 'de laatste letter is ' + letter + ': ' + (w.kof ? 'die zit in ’t kofschip' : 'die zit niet in ’t kofschip')],
          slot:'dus ' + (w.kof ? '-te' : '-de') + (mv ? 'n' : '') + ':', antwoord:[goed], invoer:'tekst' }; } },
    { kop:'Voltooid deelwoord: d of t', kort:'ge + stam + t of d, met dezelfde kofschip-regel',
      uit:'Het voltooid deelwoord (na heeft, is of zijn) maak je met ge + stam + t of d. Zit de laatste letter in ’t kofschip, dan een t, anders een d. Eindigt de stam al op t of d, dan komt er niets meer bij: gepraat, gered.',
      voorbeeld:['Hij heeft lang ___. (wandelen)', STAM + 'wandel', 'de l zit niet in ’t kofschip, dus ge + wandel + d: gewandeld'],
      maak:function(){ var w = kies(WW), letter = /ch$/.test(w.stam) ? 'ch' : w.stam.slice(-1);
        return { vraag:'Hij heeft ' + w.zin.replace('% ', '').replace('%', '') + ' ___. (' + w.inf + ')', stappen:[STAM + w.stam,
          opDT(w.stam) ? 'de stam eindigt al op ' + letter + ': er komt geen letter achter' : 'de laatste letter is ' + letter + ': ' + (w.kof ? 'in ’t kofschip, dus t' : 'niet in ’t kofschip, dus d')],
          slot:'ge + ' + w.stam + (opDT(w.stam) ? ' =' : (w.kof ? ' + t =' : ' + d =')), antwoord:[vd(w)], invoer:'tekst' }; } },
    { kop:'De d of t-val', kort:'Hoor je een t maar staat er een d in de stam, schrijf dan allebei',
      uit:'Bij worden, vinden en antwoorden eindigt de stam op een d: ik word, ik vind. Bij hij, zij en het komt er toch een t achter: hij wordt, zij vindt. Je hoort het niet, dus denk aan de regel.',
      voorbeeld:['Hij ___ morgen dertien. (worden)', STAM + 'word', 'hij: stam + t = wordt'],
      maak:function(){ var l = [{ inf:'worden', stam:'word', zin:'% morgen dertien' }, { inf:'vinden', stam:'vind', zin:'% het leuk' }, { inf:'antwoorden', stam:'antwoord', zin:'% meteen' }, { inf:'redden', stam:'red', zin:'% de kat' }, { inf:'branden', stam:'brand', zin:'% van verlangen' }];
        var w = kies(l), wie = kies(['hij', 'zij', 'ik', 'hij']), ik = wie === 'ik';
        return { vraag:zinMet(w, wie, '___') + ' (' + w.inf + ')', stappen:[STAM + w.stam], slot:ik ? 'ik: alleen de stam =' : wie + ': stam + t =', antwoord:[ik ? w.stam : w.stam + 't'], invoer:'tekst' }; } }
  ];
  window.LEER_WERKWOORDEN = WERKWOORDEN;

  /* ---------- irregular verbs: rijtjes die op elkaar lijken ---------- */
  var RIJ = [
    { kop:'Drie keer hetzelfde', kort:'Hele werkwoord, verleden tijd en deelwoord zijn gelijk',
      uit:'Bij een groep korte werkwoorden verandert er niets: cut, cut, cut. Vaak eindigen ze op een t of d.', patroon:'alle drie gelijk',
      l:[['cut','cut','cut'],['put','put','put'],['let','let','let'],['hit','hit','hit'],['set','set','set'],['shut','shut','shut'],['cost','cost','cost'],['hurt','hurt','hurt'],['spread','spread','spread'],['quit','quit','quit'],['split','split','split']] },
    { kop:'Twee keer hetzelfde', kort:'De verleden tijd en het deelwoord zijn gelijk',
      uit:'Bij veel werkwoorden zijn de tweede en de derde vorm gelijk: keep, kept, kept. Ken je de verleden tijd, dan ken je het deelwoord ook.', patroon:'tweede en derde gelijk',
      l:[['keep','kept','kept'],['sleep','slept','slept'],['feel','felt','felt'],['leave','left','left'],['send','sent','sent'],['spend','spent','spent'],['build','built','built'],['meet','met','met'],['sit','sat','sat'],['find','found','found'],['buy','bought','bought'],['think','thought','thought'],['bring','brought','brought'],['catch','caught','caught'],['teach','taught','taught'],['sell','sold','sold'],['tell','told','told'],['hold','held','held'],['make','made','made'],['pay','paid','paid'],['say','said','said'],['lose','lost','lost'],['win','won','won']] },
    { kop:'i, a, u', kort:'De klinker gaat van i naar a naar u',
      uit:'Een rijtje dat klinkt als een liedje: sing, sang, sung. Eerst een i, dan een a, dan een u.', patroon:'i, a, u',
      l:[['sing','sang','sung'],['ring','rang','rung'],['drink','drank','drunk'],['swim','swam','swum'],['begin','began','begun'],['sink','sank','sunk'],['shrink','shrank','shrunk'],['stink','stank','stunk']] },
    { kop:'-ew en -own', kort:'De verleden tijd op -ew, het deelwoord op -own of -awn',
      uit:'Know, knew, known: de verleden tijd eindigt op -ew, het deelwoord op -n.', patroon:'-ew en -n',
      l:[['know','knew','known'],['grow','grew','grown'],['throw','threw','thrown'],['blow','blew','blown'],['fly','flew','flown'],['draw','drew','drawn']] },
    { kop:'-o- en -en', kort:'Een o in de verleden tijd, -en achter het deelwoord',
      uit:'Speak, spoke, spoken: in de verleden tijd een o, en het deelwoord krijgt -en (of -n) achter die vorm.', patroon:'o en -en',
      l:[['speak','spoke','spoken'],['break','broke','broken'],['choose','chose','chosen'],['steal','stole','stolen'],['freeze','froze','frozen'],['wake','woke','woken'],['write','wrote','written'],['ride','rode','ridden'],['drive','drove','driven']] }
  ];
  window.LEER_IRREGULAR = RIJ.map(function(r){
    return { kop:r.kop, kort:r.kort, uit:r.uit, voorbeeld:r.l.slice(0, 3).map(function(x){ return x.join(', '); }),
      maak:function(){ var v = kies(r.l), vb, gat = Math.random() < .5 ? 1 : 2;
        do { vb = kies(r.l); } while (vb === v && r.l.length > 1);
        var toon = v.slice(); toon[gat] = '___';
        return { vraag:toon.join(', '), stappen:['dit rijtje: ' + r.patroon, 'net als ' + vb.join(', ')], slot:(gat === 1 ? 'dus de verleden tijd van ' : 'dus het voltooid deelwoord van ') + v[0] + ' is', antwoord:[v[gat]], invoer:'tekst' }; } };
  });
})();
