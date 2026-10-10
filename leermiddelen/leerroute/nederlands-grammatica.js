/* De leerroute Nederlands, grammatica: woordsoorten, zinsdelen (ontleden),
   samengestelde zinnen en de lastige zinsdelen. Elke proef en elk trucje is
   een eigen doel. Werkwoordspelling staat in nederlands-werkwoorden.js.
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var G = [];

  /* ---------- hulpjes ---------- */
  var NAMEN = ['Sara', 'Tom', 'Noah', 'Lisa', 'Daan', 'Emma', 'Sam', 'Fatima', 'Mo', 'Jesse', 'Anouk', 'Bram', 'Yara', 'Milan', 'Lotte', 'Ayoub', 'Iris', 'Finn', 'Nina', 'Ruben', 'Julia', 'Kees', 'Amira', 'Thijs', 'Eva', 'Utrecht', 'Amsterdam', 'Spanje', 'Nederland', 'Rotterdam', 'Max', 'Zoë', 'Luuk', 'Mila', 'Jan', 'Piet', 'Anna'];
  function q(w){ return '‘' + w + '’'; }
  function isNaam(w){ return NAMEN.indexOf(String(w).split(' ')[0].replace(/[.,?!]/g, '')) >= 0; }
  function klein(t){ t = String(t); return isNaam(t) ? t : t.charAt(0).toLowerCase() + t.slice(1); }
  function groot(t){ t = String(t); return t.charAt(0).toUpperCase() + t.slice(1); }
  function uniek(l){ var u = []; l.forEach(function(x){ if (u.indexOf(x) < 0) u.push(x); }); return u; }
  /* opties met één goede; fout: lijst foute opties (dubbel en gelijk aan goed vallen weg) */
  function kiesOpties(R, goed, fout, max){
    var l = [goed];
    R.hussel(uniek(fout)).forEach(function(x){ if (l.length < (max || 4) && x !== goed && l.indexOf(x) < 0) l.push(x); });
    l = R.hussel(l);
    return { opties:l, goed:l.indexOf(goed) };
  }
  function keuze(R, tekst, goed, fout, hint, ext){
    var o = kiesOpties(R, goed, fout, ext && ext.max), s = { tekst:tekst, opties:o.opties, goed:o.goed, hint:hint };
    if (ext) Object.keys(ext).forEach(function(k){ if (k !== 'max') s[k] = ext[k]; });
    return s;
  }
  /* een keuze in vaste volgorde (ja/nee, of een rijtje dat altijd gelijk is) */
  function vast(tekst, opties, goed, hint, waarom){ return { tekst:tekst, opties:opties.slice(), goed:opties.indexOf(goed), hint:hint, waarom:waarom }; }
  function janee(tekst, ja, hint, waarom){ return vast(tekst, ['ja', 'nee'], ja ? 'ja' : 'nee', hint, waarom); }
  /* Zelf vraagt dezelfde keuze als de laatste stap */
  function eindKeuze(op){ var s = op.stappen[op.stappen.length - 1]; op.opties = s.opties.slice(); op.goed = s.goed; return op; }
  /* zelf ook als keuze, maar met een andere stap (index) */
  function zelfKeuze(op, i){ var s = op.stappen[i]; op.opties = s.opties.slice(); op.goed = s.goed; return op; }

  /* ---------- zinnen met woordsoorten: 'De/lw grote/bn:groot hond/zn slaapt/ww:slaap.' ---------- */
  function woorden(s){
    var eind = '.', m = /\s*([.?!])$/.exec(s);
    if (m){ eind = m[1]; s = s.slice(0, m.index); }
    return { eind:eind, w:s.split(' ').map(function(t){
      var a = t.split('/'), tag = a[1] || 'x', l = tag.split('>'), c = l[0].split(':');
      return { t:a[0], s:c[0], x:c[1] || '', bij:l[1] || '' };
    }) };
  }
  function woordZin(z){ return z.w.map(function(w){ return w.t; }).join(' ') + z.eind; }
  /* tekening van een zin per woord; merk: { index: {k, label, weg} } */
  function woordBeeld(R, z, merk){
    var d = z.w.map(function(w, i){ var m = merk[i], t = w.t + (i === z.w.length - 1 ? z.eind : '');
      return m ? { t:t, k:m.k, label:m.label, doorgehaald:m.weg } : t; });
    return R.teken.zin(d);
  }

  /* ---------- zinnen in zinsdelen: 'Mijn broer=ow|speelt=pv:speelde|voetbal=lv' ----------
     rollen: pv, wg (rest van het werkwoordelijk gezegde), ow, lv, mv, bwb, nd, vzv, x (los woord) */
  function delen(s){
    var eind = '.', m = /\s*([.?!])$/.exec(s);
    if (m){ eind = m[1]; s = s.slice(0, m.index); }
    return { eind:eind, d:s.split('|').map(function(t){
      var a = t.split('='), c = (a[1] || 'x').split(':');
      return { t:a[0], r:c[0], x:c.slice(1) };
    }) };
  }
  var ROL = { pv:{ k:1, l:'pv' }, wg:{ k:1, l:'wg' }, ow:{ k:2, l:'ow' }, lv:{ k:3, l:'lv' }, nd:{ k:3, l:'nd' },
    mv:{ k:4, l:'mv' }, vzv:{ k:4, l:'vzv' }, bwb:{ k:5, l:'bwb' } };
  function zinVan(z){ return z.d.map(function(x){ return x.t; }).join(' ') + z.eind; }
  function deel(z, r){ for (var i = 0; i < z.d.length; i++) if (z.d[i].r === r) return z.d[i]; return null; }
  function alle(z, r){ return z.d.filter(function(x){ return x.r === r; }); }
  /* tekening: toon = lijst rollen die al gevonden zijn, of { index: {k,label} } */
  function deelBeeld(R, z, toon){
    var d = z.d.map(function(x, i){
      var t = x.t + (i === z.d.length - 1 ? z.eind : ''), m = null;
      if (Array.isArray(toon)){ if (toon.indexOf(x.r) >= 0 && ROL[x.r]) m = { k:ROL[x.r].k, label:ROL[x.r].l }; }
      else if (toon && toon[i]) m = toon[i];
      return m ? { t:t, k:m.k, label:m.label } : t;
    });
    return R.teken.zin(d);
  }
  /* een tekening met een tweede zin eronder */
  function onder(a, b){ return '<div style="display:grid;gap:10px;justify-items:center;width:100%">' + a + (b ? '<p class="lr-context" style="margin:0">' + b + '</p>' : '') + '</div>'; }
  /* alle losse woorden van een zin (voor keuzes uit de woorden) */
  function losseWoorden(z){ var l = []; z.d.forEach(function(x){ x.t.split(' ').forEach(function(w){ l.push(w.replace(/[,]/g, '')); }); }); return l; }
  /* het gezegde: pv en wg in de volgorde van de zin */
  function gezegde(z){ return z.d.filter(function(x){ return x.r === 'pv' || x.r === 'wg'; }).map(function(x){ return klein(x.t); }).join(' '); }
  /* de zin als ja/nee-vraag: pv, ow, de rest */
  function alsVraag(z, voor){
    var pv = deel(z, 'pv'), ow = deel(z, 'ow'), v = voor || pv;
    var rest = z.d.filter(function(x){ return x !== pv && x !== ow && x !== v; });
    var l = [v === pv ? pv : v, ow].concat(v === pv ? rest : [pv].concat(rest));
    if (v !== pv) l = [v, ow].concat(z.d.filter(function(x){ return x !== v && x !== ow; }));
    return groot(l.map(function(x, i){ return i === 0 ? x.t : klein(x.t); }).join(' ')) + '?';
  }

  /* ================= 1. woordsoorten basis ================= */
  /* zn:het = het lidwoord als er geen de/het/een voor staat; bn:basis; ww:ik-vorm; tw:b/o; vz:zit/loopt (de muis-proef) */
  var WS = [
    'De/lw grote/bn:groot hond/zn slaapt/ww:slaap onder/vz:zit de/lw tafel/zn.',
    'Mijn/bez zus/zn heeft/ww:heb drie/tw:b nieuwe/bn:nieuw boeken/zn.',
    'Het/lw kleine/bn:klein meisje/zn loopt/ww:loop naar/vz:loopt de/lw winkel/zn.',
    'Veel/tw:o kinderen/zn spelen/ww:speel in/vz:zit het/lw park/zn.',
    'Een/lw zwarte/bn:zwart kat/zn zit/ww:zit op/vz:zit het/lw dak/zn.',
    'De/lw leraar/zn schrijft/ww:schrijf twee/tw:b lange/bn:lang zinnen/zn op/vz:zit het/lw bord/zn.',
    'Mijn/bez opa/zn woont/ww:woon in/vz:zit een/lw oud/bn:oud huis/zn.',
    'De/lw rode/bn:rood bal/zn rolt/ww:rol door/vz:loopt de/lw gang/zn.',
    'Weinig/tw:o mensen/zn wonen/ww:woon op/vz:zit het/lw eiland/zn.',
    'De/lw bakker/zn bakt/ww:bak elke/x dag/zn vers/bn:vers brood/zn:het.',
    'Een/lw bange/bn:bang muis/zn kruipt/ww:kruip achter/vz:zit de/lw kast/zn.',
    'Vijf/tw:b vogels/zn vliegen/ww:vlieg over/vz:loopt het/lw huis/zn.',
    'Mijn/bez moeder/zn koopt/ww:koop een/lw groene/bn:groen jas/zn.',
    'Tien/tw:b leerlingen/zn wachten/ww:wacht bij/vz:zit de/lw deur/zn.',
    'Het/lw koude/bn:koud water/zn stroomt/ww:stroom uit/vz:loopt de/lw kraan/zn.',
    'De/lw eerste/tw:b trein/zn vertrekt/ww:vertrek om/x zes/tw:b uur/zn:het.',
    'Enkele/tw:o vissen/zn zwemmen/ww:zwem onder/vz:zit de/lw brug/zn.',
    'De/lw nieuwe/bn:nieuw buurvrouw/zn heeft/ww:heb twee/tw:b honden/zn.',
    'Mijn/bez broer/zn fietst/ww:fiets langs/vz:loopt het/lw kanaal/zn.',
    'De/lw dikke/bn:dik kat/zn springt/ww:spring op/vz:zit de/lw bank/zn.',
    'Het/lw jongetje/zn verstopt/ww:verstop zich/x achter/vz:zit een/lw boom/zn.',
    'Twintig/tw:b fietsers/zn rijden/ww:rijd door/vz:loopt de/lw smalle/bn:smal straat/zn.',
    'De/lw zieke/bn:ziek oma/zn ligt/ww:lig in/vz:zit bed/zn:het.',
    'Een/lw oude/bn:oud man/zn zit/ww:zit op/vz:zit een/lw houten/bn:houten bank/zn.',
    'De/lw kinderen/zn bouwen/ww:bouw een/lw hoge/bn:hoog toren/zn.',
    'Drie/tw:b eenden/zn zwemmen/ww:zwem in/vz:zit de/lw sloot/zn.',
    'Het/lw paard/zn rent/ww:ren over/vz:loopt de/lw brede/bn:breed wei/zn.',
    'De/lw postbode/zn brengt/ww:breng vier/tw:b brieven/zn.',
    'Mijn/bez vader/zn kookt/ww:kook een/lw lekkere/bn:lekker maaltijd/zn.',
    'De/lw muis/zn rent/ww:ren uit/vz:loopt het/lw hok/zn.',
    'Het/lw blije/bn:blij kind/zn danst/ww:dans op/vz:zit het/lw podium/zn.',
    'Een/lw slimme/bn:slim vos/zn sluipt/ww:sluip naar/vz:loopt het/lw kippenhok/zn.',
    'Honderd/tw:b mensen/zn staan/ww:sta voor/vz:zit het/lw stadhuis/zn.',
    'Mijn/bez tante/zn verkoopt/ww:verkoop verse/bn:vers bloemen/zn.',
    'De/lw boze/bn:boos buurman/zn kijkt/ww:kijk over/vz:loopt de/lw schutting/zn.',
    'Veel/tw:o toeristen/zn wandelen/ww:wandel door/vz:loopt de/lw oude/bn:oud stad/zn.',
    'De/lw kleine/bn:klein baby/zn ligt/ww:lig naast/vz:zit haar/bez moeder/zn.',
    'Zes/tw:b koeien/zn staan/ww:sta achter/vz:zit het/lw hek/zn.',
    'Het/lw witte/bn:wit konijn/zn eet/ww:eet een/lw verse/bn:vers wortel/zn.',
    'Weinig/tw:o leerlingen/zn lopen/ww:loop naar/vz:loopt het/lw zwembad/zn.'
  ];
  /* woorden die ook een andere woordsoort kunnen zijn: nooit als fout voorbeeld */
  var DUBBEL = ['bal', 'fiets', 'sloot', 'vissen', 'boeken', 'winkel', 'huis', 'zinnen', 'bank', 'kijkt', 'eet', 'hek', 'stad', 'baby', 'zit', 'ligt', 'staan', 'heeft', 'eerste', 'houten', 'wortel', 'voor', 'bij'];
  var WSNAAM = { zn:'zelfstandig naamwoord', lw:'lidwoord', bn:'bijvoeglijk naamwoord', ww:'werkwoord', tw:'telwoord', vz:'voorzetsel' };
  var WSLAB = { zn:'zelfst. nw', lw:'lidwoord', bn:'bijv. nw', ww:'werkwoord', tw:'telwoord', vz:'voorzetsel' };
  var WSK = { zn:2, lw:4, bn:3, ww:1, tw:5, vz:5 };
  function lidVan(z, i){
    for (var j = i - 1; j >= 0; j--){ var w = z.w[j]; if (w.s === 'lw') return w.t.toLowerCase() === 'een' ? 'een' : w.t.toLowerCase(); if (w.s !== 'bn' && w.s !== 'tw') break; }
    return z.w[i].x || 'de';
  }
  /* de proeven: geven de tekst van de proef met dit woord, en of hij lukt */
  var PROEF = {
    zn:function(z, i, ok){ var w = klein(z.w[i].t);
      return janee('Kun je <i>de</i>, <i>het</i> of <i>een</i> voor ' + q(w) + ' zetten?', ok,
        ok ? 'Zeg: ' + lidVan(z, i) + ' ' + w + '. Dat kan.' : 'Zeg: de ' + w + ', een ' + w + '. Dat is geen Nederlands.', ok ? 'Ja: ' + lidVan(z, i) + ' ' + w + '.' : 'Nee.'); },
    ww:function(z, i, ok){ var w = klein(z.w[i].t), ik = ok ? z.w[i].x : w;
      return janee('Kun je <i>ik</i> voor ' + q(w) + ' zetten? De vorm mag veranderen.', ok,
        ok ? 'Zeg: ik ' + ik + '. Dat kan.' : 'Zeg: ik ' + w + '. Dat kan niet.', ok ? 'Ja: ik ' + ik + '.' : 'Nee: ik ' + w + ' kan niet.'); },
    bn:function(z, i, ok){ var w = klein(z.w[i].t), b = ok ? z.w[i].x : w;
      return janee('Past ' + q(w) + ' in: <i>een … ding</i>?', ok,
        ok ? 'Zeg: een ' + b + ' ding. Dat kan.' : 'Zeg: een ' + w + ' ding. Dat kan niet.', ok ? 'Ja: een ' + b + ' ding.' : 'Nee.'); },
    vz:function(z, i, ok, fr){ var w = klein(z.w[i].t);
      return janee('Past ' + q(w) + ' in: <i>de muis ' + fr + ' … de doos</i>?', ok,
        'Zeg: de muis ' + fr + ' ' + w + ' de doos. ' + (ok ? 'Dat kan.' : 'Dat kan niet.'), ok ? 'Ja: de muis ' + fr + ' ' + w + ' de doos.' : 'Nee.'); },
    tw:function(z, i, ok){ var w = klein(z.w[i].t);
      return janee('Zegt ' + q(w) + ' hoeveel er zijn, of de hoeveelste?', ok,
        ok ? q(w) + ' vertelt een aantal of een plaats in de rij.' : q(w) + ' vertelt geen aantal.', ok ? 'Ja.' : 'Nee.'); }
  };
  /* welke soorten als fout voorbeeld mogen bij een proef (ze mogen de proef nooit per ongeluk halen) */
  var MAG = { zn:['ww', 'vz'], ww:['zn', 'bn', 'vz'], bn:['zn', 'ww', 'vz'], vz:['zn', 'ww', 'bn'], tw:['zn', 'bn', 'ww', 'vz'], lw:['zn', 'ww', 'vz', 'bn'] };
  function zoekZin(R, soort, aantal){
    for (var p = 0; p < 300; p++){
      var z = woorden(R.kies(WS)), kand = [];
      z.w.forEach(function(w, i){ if (w.s === soort) kand.push(i); });
      if (!kand.length) continue;
      var ti = R.kies(kand), gezien = {}, fout = [];
      z.w.forEach(function(w, i){ var lw = w.t.toLowerCase();
        if (MAG[soort].indexOf(w.s) < 0 || DUBBEL.indexOf(lw) >= 0 || gezien[lw]) return;
        if (soort === 'zn' && w.s === 'ww' && /n$/.test(lw)) return;
        if (z.w.some(function(v){ return v.s === soort && v.t.toLowerCase() === lw; })) return;
        gezien[lw] = 1; fout.push(i); });
      if (fout.length >= aantal) return { z:z, ti:ti, fout:R.hussel(fout).slice(0, aantal) };
    }
  }
  /* proef op drie woorden, dan kiezen */
  function wsProef(R, soort){
    var g = zoekZin(R, soort, 2), z = g.z, ti = g.ti, kand = R.hussel([ti].concat(g.fout));
    var fr = soort === 'vz' ? z.w[ti].x : '';
    var st = kand.map(function(i){ return PROEF[soort](z, i, i === ti, fr); });
    if (soort === 'tw'){
      var b = z.w[ti].x === 'b';
      st.push(vast(q(klein(z.w[ti].t)) + ' is het telwoord. Zegt het precies hoeveel (bepaald), of niet precies (onbepaald)?', ['bepaald', 'onbepaald'], b ? 'bepaald' : 'onbepaald',
        b ? q(klein(z.w[ti].t)) + ' is een precies getal of een plaats in de rij.' : 'Hoeveel is ' + q(klein(z.w[ti].t)) + '? Dat weet je niet precies.'));
    }
    st.push(keuze(R, 'Welk woord is het ' + WSNAAM[soort] + '?', z.w[ti].t, g.fout.map(function(i){ return z.w[i].t; }),
      'Het woord waarbij de proef lukte: ' + q(klein(z.w[ti].t)) + '.'));
    var aantalProef = kand.length;
    return eindKeuze({ vraag:woordZin(z), context:'Welk woord is een <b>' + WSNAAM[soort] + '</b>? Doe de proef met de drie woorden.',
      beeld:function(n){ var m = {};
        kand.forEach(function(i, j){ if (j < n) m[i] = i === ti ? { k:WSK[soort], label:WSLAB[soort] } : { k:0, weg:true }; else m[i] = { k:0, label:'?' }; });
        if (n >= st.length) m[ti] = { k:WSK[soort], label:WSLAB[soort] };
        return woordBeeld(R, z, m); },
      stappen:st });
  }

  G.push({ groep:{ id:'ws-basis', niveau:'basis', domein:'grammatica', naam:'Woordsoorten: de basis',
      uit:'Elk woord in een zin hoort bij een woordsoort. Voor de belangrijkste soorten is er een proef: een vaste vraag waarmee je het zeker weet.' },
    doelen:[
      { id:'ws-zn', naam:'Zelfstandig naamwoord', kort:'Kun je er de, het of een voor zetten? Dan is het een zelfstandig naamwoord',
        uit:'<p>Een <b>zelfstandig naamwoord</b> is een mens, dier, ding of idee: hond, fiets, moeder, vakantie.</p><p>De proef: kun je er <b>de</b>, <b>het</b> of <b>een</b> voor zetten? De hond, het huis, een fiets: ja. De slaapt, een onder: nee.</p><p>Meervoud telt ook mee: de honden, de boeken.</p>',
        wanneer:'je twijfelt of een woord een ding of persoon is.',
        maak:function(R){ return wsProef(R, 'zn'); } },
      { id:'ws-lw', naam:'Lidwoord', kort:'De, het en een: ze staan voor een zelfstandig naamwoord',
        uit:'<p>Er zijn maar drie <b>lidwoorden</b>: <b>de</b>, <b>het</b> en <b>een</b>.</p><p>Een lidwoord staat altijd voor een zelfstandig naamwoord, soms met een bijvoeglijk naamwoord ertussen: <b>de</b> grote hond.</p><p>De en het heten bepaald, een heet onbepaald.</p>',
        wanneer:'je in een zin het zelfstandig naamwoord al gevonden hebt.',
        maak:function(R){
          var z, ti, ni, fout;
          for (var p = 0; p < 300; p++){
            z = woorden(R.kies(WS)); var kand = [];
            z.w.forEach(function(w, i){ if (w.s === 'lw') kand.push(i); });
            if (!kand.length) continue;
            ti = R.kies(kand); ni = -1;
            for (var j = ti + 1; j < z.w.length; j++) if (z.w[j].s === 'zn'){ ni = j; break; }
            fout = []; var gz = {};
            z.w.forEach(function(w, i){ var l = w.t.toLowerCase(); if ((w.s === 'ww' || w.s === 'vz' || w.s === 'bn') && !gz[l] && DUBBEL.indexOf(l) < 0){ gz[l] = 1; fout.push(i); } });
            if (ni > 0 && fout.length >= 2) break;
          }
          fout = R.hussel(fout).slice(0, 2);
          var nw = z.w[ni].t, lw = z.w[ti].t;
          var tussen = z.w.slice(ti + 1, ni).map(function(w){ return w.t; });
          var st = [
            keuze(R, 'Een lidwoord staat voor een zelfstandig naamwoord. Welk woord is een zelfstandig naamwoord?', nw, fout.map(function(i){ return z.w[i].t; }),
              'Doe de proef: ' + lidVan(z, ni) + ' ' + nw + '. Dat kan.'),
            keuze(R, 'Welk woord voor ' + q(nw) + ' is <i>de</i>, <i>het</i> of <i>een</i>?', lw, tussen.concat(fout.map(function(i){ return z.w[i].t; })),
              'Kijk vlak voor ' + q(nw) + (tussen.length ? ', voor ' + q(tussen.join(' ')) : '') + '.',
              { waarom:(lw.toLowerCase() === 'een' ? 'Een is het onbepaalde lidwoord.' : groot(lw.toLowerCase()) + ' is een bepaald lidwoord.') })
          ];
          return eindKeuze({ vraag:woordZin(z), context:'Zoek het <b>lidwoord</b> bij een zelfstandig naamwoord.',
            beeld:function(n){ var m = {}; if (n >= 1) m[ni] = { k:2, label:'zelfst. nw' }; if (n >= 2) m[ti] = { k:4, label:'lidwoord' }; return woordBeeld(R, z, m); },
            stappen:st });
        } },
      { id:'ws-bn', naam:'Bijvoeglijk naamwoord', kort:'Het zegt iets over een zelfstandig naamwoord; proef: een … ding',
        uit:'<p>Een <b>bijvoeglijk naamwoord</b> zegt iets over een zelfstandig naamwoord: hoe het is. De <b>grote</b> hond, een <b>rode</b> fiets.</p><p>De proef: past het woord in <b>een … ding</b>? Een groot ding, een rood ding: ja. Een slaapt ding: nee.</p><p>Gebruik in de proef het woord zonder -e: grote wordt groot.</p>',
        wanneer:'je wilt weten of een woord zegt hoe iets is.',
        maak:function(R){ return wsProef(R, 'bn'); } },
      { id:'ws-ww', naam:'Werkwoord', kort:'Wat je doet of wat er gebeurt; proef: zet er ik voor',
        uit:'<p>Een <b>werkwoord</b> zegt wat iemand doet of wat er gebeurt: lopen, slapen, regenen.</p><p>De proef: zet er <b>ik</b> voor. De vorm mag veranderen. Loopt: ik loop. Slaapt: ik slaap. Dat kan, dus het is een werkwoord. Ik tafel kan niet.</p>',
        wanneer:'je wilt weten of een woord iets is wat je kunt doen.',
        maak:function(R){ return wsProef(R, 'ww'); } },
      { id:'ws-tw', naam:'Telwoord', kort:'Het zegt hoeveel: precies (drie) of niet precies (veel)',
        uit:'<p>Een <b>telwoord</b> zegt hoeveel er zijn, of de hoeveelste.</p><p><b>Bepaald</b>: je weet het precies. Drie, tien, honderd, de eerste.</p><p><b>Onbepaald</b>: je weet het niet precies. Veel, weinig, enkele, meer.</p>',
        wanneer:'een woord iets zegt over een aantal.',
        maak:function(R){ return wsProef(R, 'tw'); } },
      { id:'ws-vz', naam:'Voorzetsel', kort:'Waar kan een muis zitten? In, op, onder de doos',
        uit:'<p>Een <b>voorzetsel</b> is een klein woord dat vaak een plaats of richting geeft: in, op, onder, naar, door.</p><p>De proef: past het woord in <b>de muis zit … de doos</b> of <b>de muis loopt … de doos</b>? In de doos, onder de doos, door de doos: ja.</p>',
        wanneer:'je een klein woord ziet voor de, het of een.',
        maak:function(R){ return wsProef(R, 'vz'); } },
      { id:'ws-mix', naam:'Welke woordsoort is het?', kort:'Kies zelf de proef die lukt, en noem de woordsoort',
        uit:'<p>Nu staan de woordsoorten <b>door elkaar</b>. Doe de proeven die je kent:</p><p>de, het of een ervoor: <b>zelfstandig naamwoord</b>. Ik ervoor: <b>werkwoord</b>. Een … ding: <b>bijvoeglijk naamwoord</b>. De muis zit … de doos: <b>voorzetsel</b>. Zegt hoeveel: <b>telwoord</b>. De, het of een zelf: <b>lidwoord</b>.</p>',
        wanneer:'je een woord in een zin moet benoemen.',
        maak:function(R){
          var soorten = ['zn', 'ww', 'bn', 'vz', 'tw', 'lw'], soort = R.kies(soorten), z, ti;
          for (var p = 0; p < 300; p++){
            z = woorden(R.kies(WS)); var kand = [];
            z.w.forEach(function(w, i){ if (w.s === soort && DUBBEL.indexOf(w.t.toLowerCase()) < 0) kand.push(i); });
            if (kand.length){ ti = R.kies(kand); break; }
          }
          var w = z.w[ti], wl = klein(w.t), basis = soort === 'bn' ? w.x : wl;
          var P = {
            zn:(soort === 'zn' ? lidVan(z, ti) : 'de') + ' ' + basis,
            ww:'ik ' + (soort === 'ww' ? w.x : basis),
            bn:'een ' + basis + ' ding',
            vz:'de muis ' + (soort === 'vz' ? w.x : 'zit') + ' ' + basis + ' de doos',
            tw:q(wl) + ' zegt hoeveel',
            lw:q(wl) + ' is de, het of een'
          };
          var andere = soorten.filter(function(s){ return s !== soort && !(soort === 'tw' && s === 'zn') && !(soort === 'lw' && s === 'tw') && !(soort === 'ww' && s === 'zn' && /n$/.test(wl)); }).map(function(s){ return P[s]; });
          var st = [
            keuze(R, 'Welke proef lukt met ' + q(wl) + '?', P[soort], andere, 'Zeg ze allemaal hardop. Alleen ' + q(P[soort]) + ' is goed Nederlands.'),
            keuze(R, 'Welke woordsoort is ' + q(wl) + '?', WSNAAM[soort], soorten.filter(function(s){ return s !== soort; }).map(function(s){ return WSNAAM[s]; }),
              'De proef ' + q(P[soort]) + ' hoort bij het ' + WSNAAM[soort] + '.')
          ];
          return eindKeuze({ vraag:woordZin(z), context:'Welke woordsoort is <b>' + R.schoon(wl) + '</b>?',
            beeld:function(n){ var m = {}; m[ti] = n >= 2 ? { k:WSK[soort], label:WSLAB[soort] } : { k:0, label:'?' }; return woordBeeld(R, z, m); },
            stappen:st });
        } }
    ] });

  /* ================= zinnen in zinsdelen =================
     pv:<t|v>:<andere tijd of ->:<ander getal of ->   ow:<ander getal>   bwb:<waar|wanneer|hoe|waarom>   mv:<aan|voor> */
  var ZD = [
    'Mijn broer=ow:Mijn broers|speelt=pv:t:speelde:spelen|elke zaterdag=bwb:wanneer|voetbal=lv',
    'Sara=ow:Sara en Tom|leest=pv:t:las:lezen|een spannend boek=lv',
    'De kinderen=ow:Het kind|hebben=pv:t:hadden:heeft|de hele dag=bwb:wanneer|buiten=bwb:waar|gespeeld=wg',
    'Gisteren=bwb:wanneer|kocht=pv:v:-:kochten|mijn moeder=ow:mijn ouders|een nieuwe fiets=lv',
    'De leraar=ow:De leraren|geeft=pv:t:gaf:geven|de leerlingen=mv:aan|een compliment=lv',
    'Tom=ow:Tom en Daan|heeft=pv:t:had:hebben|oma=mv:aan|een brief=lv|geschreven=wg',
    'Wij=ow:Ik|gaan=pv:t:-:ga|morgen=bwb:wanneer|naar het strand=bwb:waar',
    'De hond=ow:De honden|slaapt=pv:t:sliep:slapen|in de mand=bwb:waar',
    'Lisa=ow:Lisa en Emma|fietst=pv:t:fietste:fietsen|elke dag=bwb:wanneer|naar school=bwb:waar',
    'Mijn vader=ow:Mijn ouders|heeft=pv:t:had:hebben|de auto=lv|gewassen=wg',
    'De bakker=ow:De bakkers|bakt=pv:t:bakte:bakken|elke nacht=bwb:wanneer|vers brood=lv',
    'Noah=ow:Noah en Sam|stuurt=pv:t:stuurde:sturen|een vriend=mv:aan|een berichtje=lv',
    'In de zomer=bwb:wanneer|zwemmen=pv:t:zwommen:zwemt|de kinderen=ow:het kind|in het meer=bwb:waar',
    'De trein=ow:De treinen|vertrekt=pv:t:vertrok:vertrekken|om acht uur=bwb:wanneer',
    'Emma=ow|heeft=pv:t:had:-|haar moeder=mv:voor|een taart=lv|gebakken=wg',
    'De kat=ow:De katten|ligt=pv:t:lag:liggen|lui=bwb:hoe|in de zon=bwb:waar',
    'Op woensdag=bwb:wanneer|schrijven=pv:t:schreven:schrijft|de leerlingen=ow:de leerling|een verhaal=lv',
    'Ik=ow:Wij|bel=pv:t:belde:bellen|mijn opa=lv|vanavond=bwb:wanneer|op=wg',
    'Het meisje=ow:De meisjes|eet=pv:t:at:eten|een appel=lv',
    'De buurman=ow:De buren|maait=pv:t:maaide:maaien|op zaterdag=bwb:wanneer|het gras=lv',
    'Fatima=ow|heeft=pv:t:had:-|haar vriendin=mv:aan|een cadeau=lv|gegeven=wg',
    'De leerlingen=ow:De leerling|lezen=pv:t:lazen:leest|in stilte=bwb:hoe|een tekst=lv',
    'Door de regen=bwb:waarom|bleven=pv:v:blijven:bleef|wij=ow:ik|binnen=bwb:waar',
    'Mijn zus=ow:Mijn zussen|zingt=pv:t:zong:zingen|heel mooi=bwb:hoe',
    'De voetballer=ow:De voetballers|schopt=pv:t:schopte:schoppen|de bal=lv|hard=bwb:hoe|in het doel=bwb:waar',
    'Opa=ow|vertelt=pv:t:vertelde:-|de kinderen=mv:aan|een verhaal=lv',
    'Daan=ow:Daan en Bram|wacht=pv:t:wachtte:wachten|bij de bushalte=bwb:waar',
    'De juf=ow:De juffen|heeft=pv:t:had:hebben|de toetsen=lv|nagekeken=wg',
    'Vanwege de storm=bwb:waarom|is=pv:t:was:zijn|de wedstrijd=ow:de wedstrijden|afgelast=wg',
    'Mijn oom=ow:Mijn ooms|repareert=pv:t:repareerde:repareren|in de garage=bwb:waar|oude fietsen=lv',
    'De kinderen=ow:Het kind|zullen=pv:t:-:zal|morgen=bwb:wanneer|een toets=lv|maken=wg',
    'Jesse=ow:Jesse en Mo|kan=pv:t:kon:kunnen|heel snel=bwb:hoe|rennen=wg',
    'Na school=bwb:wanneer|maakt=pv:t:maakte:-|Anouk=ow|haar huiswerk=lv',
    'De boer=ow:De boeren|geeft=pv:t:gaf:geven|de koeien=mv:aan|hooi=lv',
    'De vogels=ow:De vogel|fluiten=pv:t:floten:fluit|vrolijk=bwb:hoe|in de tuin=bwb:waar',
    'Ik=ow:Wij|heb=pv:t:had:hebben|de sleutels=lv|verloren=wg',
    'Milan=ow:Milan en Yara|bracht=pv:v:brengt:brachten|de buurvrouw=mv:aan|een bos bloemen=lv',
    'Wegens ziekte=bwb:waarom|blijft=pv:t:bleef:blijven|de leraar=ow:de leraren|thuis=bwb:waar',
    'De politie=ow|heeft=pv:t:had:-|de dief=lv|gisteren=bwb:wanneer|gepakt=wg',
    'Bram=ow|leent=pv:t:leende:-|zijn vriend=mv:aan|een spelletje=lv',
    'Sara=ow|moet=pv:t:moest:-|vandaag=bwb:wanneer|haar kamer=lv|opruimen=wg',
    'De kinderen=ow:Het kind|mogen=pv:t:mochten:mag|vanavond=bwb:wanneer|een film=lv|kijken=wg',
    'Mijn zusje=ow:Mijn zusjes|wil=pv:t:wilde:willen|een hond=lv|hebben=wg',
    'De brief=ow:De brieven|wordt=pv:t:-:worden|morgen=bwb:wanneer|bezorgd=wg',
    'Het huis=ow:De huizen|is=pv:t:was:zijn|in 1900=bwb:wanneer|gebouwd=wg',
    'De oma van Mo=ow|woont=pv:t:woonde:-|sinds kort=bwb:wanneer|in Utrecht=bwb:waar',
    'Uit nieuwsgierigheid=bwb:waarom|opende=pv:v:opent:openden|het meisje=ow:de meisjes|de doos=lv',
    'De moeder=ow|leert=pv:t:leerde:-|haar kind=mv:aan|een liedje=lv',
    /* met een koppelwerkwoord */
    'De soep=ow:De soepen|is=pv:t:was:zijn|te heet=nd',
    'Mijn broer=ow:Mijn broers|wordt=pv:t:-:worden|later=bwb:wanneer|piloot=nd',
    'Het weer=ow|blijft=pv:t:bleef:-|de hele week=bwb:wanneer|mooi=nd',
    'De leraar=ow:De leraren|lijkt=pv:t:leek:lijken|vandaag=bwb:wanneer|moe=nd',
    'Tom=ow|is=pv:t:was:-|een goede keeper=nd',
    'De film=ow:De films|bleek=pv:v:blijkt:bleken|erg spannend=nd',
    'Na de wedstrijd=bwb:wanneer|waren=pv:v:zijn:was|de spelers=ow:de speler|erg moe=nd',
    'Mijn opa=ow|heet=pv:t:heette:-|Kees=nd',
    'In de avond=bwb:wanneer|wordt=pv:t:werd:-|de lucht=ow|donker=nd',
    'Het water=ow|was=pv:v:is:-|erg koud=nd',
    'De kinderen=ow:Het kind|bleven=pv:v:blijven:bleef|heel rustig=nd',
    'Mijn tante=ow|is=pv:t:was:-|verpleegkundige=nd'
  ].map(delen);
  var KLEIN = ['de', 'het', 'een', 'mijn', 'haar', 'zijn', 'in', 'op', 'naar', 'bij', 'elke', 'om', 'na', 'door', 'uit', 'vanwege', 'wegens', 'sinds', 'te', 'aan'];
  function zdMet(R, test){ var l = ZD.filter(test); return l[Math.floor(Math.random() * l.length)]; }
  function heeft(z, r){ return z.d.some(function(x){ return x.r === r; }); }
  function idx(z, r){ for (var i = 0; i < z.d.length; i++) if (z.d[i].r === r) return i; return -1; }
  function vervang(z, plek){ /* plek: { index: nieuwe tekst } */
    return groot(z.d.map(function(x, i){ return plek[i] != null ? plek[i] : x.t; }).join(' ')) + z.eind;
  }
  /* foute woorden bij een keuze uit losse woorden: eerst de andere werkwoorden, dan de rest */
  function andereWoorden(z, niet){
    var ww = [], rest = [];
    z.d.forEach(function(x){ x.t.split(' ').forEach(function(w){ if (w === niet) return; (x.r === 'wg' ? ww : rest).push(w); }); });
    return ww.concat(rest.filter(function(w){ return w.length > 2 && KLEIN.indexOf(w.toLowerCase()) < 0; }));
  }
  function woordKeuze(R, tekst, z, goed, hint, ext){
    var f = andereWoorden(z, goed), ww = f.filter(function(w){ return z.d.some(function(x){ return x.r === 'wg' && x.t === w; }); });
    var rest = R.hussel(f.filter(function(w){ return ww.indexOf(w) < 0; }));
    return keuze(R, tekst, goed, ww.concat(rest).slice(0, 3), hint, ext);
  }
  /* foute zinsdelen bij een keuze uit de zinsdelen (geen werkwoorden) */
  function andereDelen(z, niet){ return z.d.filter(function(x){ return x !== niet && x.r !== 'pv' && x.r !== 'wg'; }).map(function(x){ return klein(x.t); }); }
  function deelKeuze(R, tekst, z, goed, hint, ext){ return keuze(R, tekst, klein(goed.t), andereDelen(z, goed), hint, ext); }
  function tijdHint(z){ var pv = deel(z, 'pv'); return pv.x[1] && pv.x[1] !== '-' ? 'Verander de tijd: ' + q(klein(pv.t)) + ' wordt ' + q(pv.x[1]) + '.' : 'Maak er een vraag van: ' + q(alsVraag(z)) + ' Het woord vooraan is de persoonsvorm.'; }
  function pvStap(R, z, tekst){ var pv = deel(z, 'pv'); return woordKeuze(R, tekst || 'Wat is de persoonsvorm?', z, pv.t, tijdHint(z)); }

  G.push({ groep:{ id:'zd-basis', niveau:'basis', domein:'grammatica', naam:'De zin in stukken',
      uit:'Elke zin heeft een persoonsvorm en een onderwerp. Die vind je met vaste proeven. Met de verplaatsproef knip je de zin in zinsdelen.' },
    doelen:[
      { id:'zd-pv-tijd', naam:'Persoonsvorm: verander de tijd', kort:'Zet de zin in een andere tijd: het woord dat verandert is de persoonsvorm',
        uit:'<p>De <b>persoonsvorm</b> is het werkwoord dat verandert als je de tijd verandert.</p><p>Staat de zin in het nu, zet hem dan in het verleden. Staat hij in het verleden, zet hem dan in het nu. Ik <b>loop</b> naar huis wordt: ik <b>liep</b> naar huis.</p><p>Het woord dat verandert, is de persoonsvorm.</p>',
        wanneer:'de zin één werkwoord heeft en je snel wilt zoeken.',
        maak:function(R){
          var z = zdMet(R, function(z){ var pv = deel(z, 'pv'); return pv.x[1] !== '-' && !heeft(z, 'wg'); });
          var pv = deel(z, 'pv'), nu = pv.x[0] === 't', i = idx(z, 'pv'), p = {}; p[i] = pv.x[1];
          var nieuw = vervang(z, p);
          return eindKeuze({ vraag:zinVan(z), context:'Zoek de <b>persoonsvorm</b>: verander de tijd.',
            beeld:function(n){ var m = {}; if (n >= 2) m[i] = { k:1, label:'pv' }; return onder(deelBeeld(R, z, m), n >= 1 ? (nu ? 'Vroeger: ' : 'Nu: ') + R.schoon(nieuw) : ''); },
            stappen:[
              vast('Gebeurt het nu, of gebeurde het vroeger?', ['nu', 'vroeger'], nu ? 'nu' : 'vroeger', nu ? 'Je kunt er ' + q('nu') + ' bij denken.' : 'Het is al gebeurd: je kunt er ' + q('vroeger') + ' bij denken.'),
              woordKeuze(R, 'Zet de zin in ' + (nu ? 'het verleden' : 'het nu') + ': ' + q(nieuw) + ' Welk woord is veranderd? Dat is de persoonsvorm.', z, pv.t,
                q(klein(pv.t)) + ' werd ' + q(pv.x[1]) + '.')
            ] });
        } },
      { id:'zd-pv-vraag', naam:'Persoonsvorm: maak er een vraag van', kort:'Maak een ja/nee-vraag: het woord dat vooraan komt is de persoonsvorm',
        uit:'<p>Maak van de zin een <b>vraag</b> die je met ja of nee kunt beantwoorden.</p><p>Het werkwoord dat dan <b>vooraan</b> staat, is de persoonsvorm. Mijn broer <b>speelt</b> voetbal wordt: <b>Speelt</b> mijn broer voetbal?</p>',
        wanneer:'de zin meer werkwoorden heeft, of de tijd lastig te veranderen is.',
        maak:function(R){
          var z = zdMet(R, function(){ return true; }), pv = deel(z, 'pv'), i = idx(z, 'pv');
          var fout = z.d.filter(function(x){ return x.r !== 'pv' && x.r !== 'ow'; }).map(function(x){ return alsVraag(z, x); });
          return eindKeuze({ vraag:zinVan(z), context:'Zoek de <b>persoonsvorm</b>: maak er een vraag van.',
            beeld:function(n){ var m = {}; if (n >= 2) m[i] = { k:1, label:'pv' }; return onder(deelBeeld(R, z, m), n >= 1 ? 'Vraag: ' + R.schoon(alsVraag(z)) : ''); },
            stappen:[
              keuze(R, 'Maak er een vraag van die je met ja of nee beantwoordt. Welke vraag is goed?', alsVraag(z), fout, 'Zet een werkwoord vooraan en lees de vraag hardop: ' + q(alsVraag(z)), { max:3 }),
              woordKeuze(R, 'Welk woord staat in de vraag vooraan? Dat is de persoonsvorm.', z, pv.t, 'De vraag begint met ' + q(klein(pv.t)) + '.')
            ] });
        } },
      { id:'zd-pv-getal', naam:'Persoonsvorm: verander het onderwerp', kort:'Maak het onderwerp meervoud of enkelvoud: het werkwoord dat meeverandert is de persoonsvorm',
        uit:'<p>Verander het onderwerp van <b>enkelvoud</b> naar <b>meervoud</b> (of andersom). Er verandert dan één werkwoord mee: de <b>persoonsvorm</b>.</p><p>De hond <b>blaft</b> wordt: de honden <b>blaffen</b>.</p>',
        wanneer:'je het onderwerp al ziet en de tijd lastig te veranderen is.',
        maak:function(R){
          var z = zdMet(R, function(z){ return deel(z, 'pv').x[2] && deel(z, 'pv').x[2] !== '-' && deel(z, 'ow').x[0]; });
          var pv = deel(z, 'pv'), ow = deel(z, 'ow'), i = idx(z, 'pv'), j = idx(z, 'ow'), p = {}, p2 = {};
          p[i] = pv.x[2]; p[j] = ow.x[0]; p2[j] = ow.x[0];
          var goed = vervang(z, p), fout = vervang(z, p2);
          return eindKeuze({ vraag:zinVan(z), context:'Zoek de <b>persoonsvorm</b>: verander het onderwerp.',
            beeld:function(n){ var m = {}; m[j] = { k:2, label:'ow' }; if (n >= 2) m[i] = { k:1, label:'pv' }; return onder(deelBeeld(R, z, m), n >= 1 ? R.schoon(goed) : ''); },
            stappen:[
              keuze(R, 'Het onderwerp ' + q(klein(ow.t)) + ' wordt ' + q(klein(ow.x[0])) + '. Welke zin klopt dan?', goed, [fout], 'Er moet een werkwoord mee veranderen. Lees ze allebei hardop.'),
              woordKeuze(R, 'Welk woord veranderde mee? Dat is de persoonsvorm.', z, pv.t, q(klein(pv.t)) + ' werd ' + q(pv.x[2]) + '.')
            ] });
        } },
      { id:'zd-ow-wiewat', naam:'Onderwerp: wie of wat + gezegde?', kort:'Zoek de persoonsvorm en vraag: wie of wat + de werkwoorden?',
        uit:'<p>Het <b>onderwerp</b> is wie of wat iets doet of is.</p><p>Zoek eerst de persoonsvorm. Vraag dan: <b>wie of wat</b> + de werkwoorden van de zin? Het antwoord is het onderwerp.</p><p>Mijn broer heeft voetbal gespeeld. Wie of wat heeft gespeeld? Mijn broer.</p>',
        wanneer:'je de persoonsvorm al gevonden hebt.',
        maak:function(R){
          var z = zdMet(R, function(z){ return !/^(ik|wij)$/i.test(deel(z, 'ow').t); });
          var ow = deel(z, 'ow'), gez = z.d.filter(function(x){ return x.r === 'pv' || x.r === 'wg' || x.r === 'nd'; }).map(function(x){ return klein(x.t); }).join(' ');
          var vr = 'Wie of wat ' + gez + '?';
          return eindKeuze({ vraag:zinVan(z), context:'Zoek het <b>onderwerp</b>.',
            beeld:function(n){ return deelBeeld(R, z, n >= 2 ? ['pv', 'wg', 'ow'] : n >= 1 ? ['pv'] : []); },
            stappen:[
              pvStap(R, z),
              deelKeuze(R, 'Vraag: ' + q(vr) + ' Welk stuk is het antwoord?', z, ow, 'Wie of wat ' + gez + '? ' + groot(klein(ow.t)) + '.')
            ] });
        } },
      { id:'zd-ow-getal', naam:'Onderwerp: het verandert mee', kort:'Zet de persoonsvorm in het meervoud: het stuk dat mee moet veranderen is het onderwerp',
        uit:'<p>De persoonsvorm en het onderwerp horen bij elkaar. Verander je de persoonsvorm van <b>enkelvoud</b> naar <b>meervoud</b>, dan moet het onderwerp <b>meeveranderen</b>.</p><p>De hond blaft. Blaft wordt blaffen: de <b>honden</b> blaffen. Het onderwerp is dus: de hond.</p>',
        wanneer:'er meer stukken in de zin staan die iets of iemand zijn.',
        maak:function(R){
          var z = zdMet(R, function(z){ return deel(z, 'pv').x[2] && deel(z, 'pv').x[2] !== '-' && deel(z, 'ow').x[0]; });
          var pv = deel(z, 'pv'), ow = deel(z, 'ow'), i = idx(z, 'pv'), j = idx(z, 'ow'), p = {};
          p[i] = pv.x[2]; p[j] = ow.x[0];
          return eindKeuze({ vraag:zinVan(z), context:'Zoek het <b>onderwerp</b>: verander de persoonsvorm.',
            beeld:function(n){ var m = {}; if (n >= 1) m[i] = { k:1, label:'pv' }; if (n >= 2) m[j] = { k:2, label:'ow' }; return deelBeeld(R, z, m); },
            stappen:[
              pvStap(R, z),
              deelKeuze(R, 'Verander ' + q(klein(pv.t)) + ' in ' + q(pv.x[2]) + '. Welk stuk moet dan ook veranderen?', z, ow, 'De zin wordt: ' + q(vervang(z, p)))
            ] });
        } },
      { id:'zd-verplaats', naam:'Zinsdelen: de verplaatsproef', kort:'Wat samen vooraan kan staan, is één zinsdeel',
        uit:'<p>Een zin bestaat uit <b>zinsdelen</b>. Een zinsdeel kan één woord zijn of een groepje woorden.</p><p>De <b>verplaatsproef</b>: zet een stuk vooraan in de zin. Blijft het een goede zin, dan is dat stuk één zinsdeel.</p><p>Mijn broer speelt <b>elke zaterdag</b> voetbal. <b>Elke zaterdag</b> speelt mijn broer voetbal: dat kan. <b>Elke</b> speelt mijn broer zaterdag voetbal: dat kan niet.</p>',
        wanneer:'je wilt weten welke woorden bij elkaar horen.',
        maak:function(R){
          var z, Z;
          for (var p = 0; p < 200; p++){
            z = R.kies(ZD);
            var kand = z.d.filter(function(x, i){ return i > 0 && (x.r === 'lv' || x.r === 'bwb' || x.r === 'nd' || x.r === 'ow') && x.t.split(' ').length >= 2 && KLEIN.indexOf(x.t.split(' ')[0].toLowerCase()) >= 0; });
            if (kand.length){ Z = R.kies(kand); break; }
          }
          var pv = deel(z, 'pv'), ow = deel(z, 'ow');
          function naarVoren(stuk, rest){
            var l = [stuk, pv.t].concat(Z === ow ? [] : [ow.t]);
            z.d.forEach(function(x){ if (x === pv || (x === ow && x !== Z)) return; if (x === Z){ if (rest) l.push(rest); return; } l.push(x.t); });
            return groot(l.map(function(t, i){ return i ? klein(t) : t; }).join(' ')) + z.eind;
          }
          var w = Z.t.split(' '), eerst = w[0], rest = w.slice(1).join(' ');
          var goed = naarVoren(Z.t), fout = naarVoren(eerst, rest);
          var proef = R.hussel([
            janee('Zet ' + q(klein(Z.t)) + ' vooraan: ' + q(goed) + ' Is dat een goede zin?', true, 'Lees de zin hardop. Hij klinkt gewoon goed.'),
            janee('Zet alleen ' + q(klein(eerst)) + ' vooraan: ' + q(fout) + ' Is dat een goede zin?', false, q(klein(eerst)) + ' hoort bij ' + q(rest) + '. Alleen kan het niet vooraan.')
          ]);
          var zi = z.d.indexOf(Z);
          var na = z.d[zi + 1], fo = [];
          if (na && na.r !== 'pv' && na.r !== 'wg') fo.push(klein(Z.t) + ' ' + klein(na.t));
          fo.push(rest, klein(eerst));
          return eindKeuze({ vraag:zinVan(z), context:'Welke woorden vormen samen <b>één zinsdeel</b>?',
            beeld:function(n){ var m = {}; m[zi] = n >= 3 ? { k:5, label:'zinsdeel' } : { k:0, label:'?' }; return deelBeeld(R, z, m); },
            stappen:proef.concat([ keuze(R, 'Welk stuk is één zinsdeel?', klein(Z.t), fo.slice(0, 2), 'Alleen ' + q(klein(Z.t)) + ' kon samen vooraan.') ]) });
        } }
    ] });

  /* ================= 3. het gezegde ================= */
  var HWW = { heeft:'hebben', hebben:'hebben', heb:'hebben', had:'hebben', hadden:'hebben', is:'zijn', zijn:'zijn', ben:'zijn', was:'zijn', waren:'zijn',
    wordt:'worden', worden:'worden', word:'worden', werd:'worden', werden:'worden', zal:'zullen', zullen:'zullen', kan:'kunnen', kunnen:'kunnen', kon:'kunnen',
    moet:'moeten', moeten:'moeten', moest:'moeten', wil:'willen', willen:'willen', wilde:'willen', mag:'mogen', mogen:'mogen', mocht:'mogen' };
  function gezKeuze(R, z, tekst){
    var pv = deel(z, 'pv'), wg = alle(z, 'wg'), goed = gezegde(z), fout = [];
    var ander = z.d.filter(function(x){ return x.r === 'lv' || x.r === 'bwb' || x.r === 'mv'; });
    if (wg.length){ fout.push(klein(pv.t)); fout.push(wg.map(function(x){ return x.t; }).join(' ')); }
    if (ander.length) fout.push(klein(pv.t) + ' ' + klein(R.kies(ander).t));
    if (ander.length > 1) fout.push(goed + ' ' + klein(ander[ander.length - 1].t));
    return keuze(R, tekst || 'Wat is het werkwoordelijk gezegde? Dat zijn alle werkwoorden samen.', goed, fout.filter(function(f){ return f !== goed; }),
      wg.length ? 'De persoonsvorm ' + q(klein(pv.t)) + ' en de andere werkwoorden: ' + q(goed) + '.' : 'Er staat maar één werkwoord in de zin: ' + q(goed) + '.', { max:3 });
  }
  function werkwoorden(z){ return z.d.filter(function(x){ return x.r === 'pv' || x.r === 'wg'; }).map(function(x){ return klein(x.t); }).join(', '); }
  var KOPPEL = [
    ['Mijn broer wordt piloot.', 'wordt', 'Mijn broer is piloot.', 1],
    ['De soep blijft lang warm.', 'blijft', 'De soep is lang warm.', 1],
    ['Die hond lijkt gevaarlijk.', 'lijkt', 'Die hond is gevaarlijk.', 1],
    ['Het examen bleek makkelijk.', 'bleek', 'Het examen was makkelijk.', 1],
    ['Mijn zus heet Lotte.', 'heet', 'Mijn zus is Lotte.', 1],
    ['De nieuwe trainer schijnt erg streng.', 'schijnt', 'De nieuwe trainer is erg streng.', 1],
    ['Ik word om zeven uur wakker.', 'word', 'Ik ben om zeven uur wakker.', 1],
    ['Het water werd ijskoud.', 'werd', 'Het water was ijskoud.', 1],
    ['Daan blijft mijn beste vriend.', 'blijft', 'Daan is mijn beste vriend.', 1],
    ['De lucht wordt grijs.', 'wordt', 'De lucht is grijs.', 1],
    ['Jullie lijken moe.', 'lijken', 'Jullie zijn moe.', 1],
    ['De opdracht bleek te moeilijk.', 'bleek', 'De opdracht was te moeilijk.', 1],
    ['Opa wordt morgen tachtig.', 'wordt', 'Opa is morgen tachtig.', 1],
    ['De bal blijft liggen.', 'blijft', 'De bal is liggen.', 0],
    ['Mijn zus lijkt op mijn moeder.', 'lijkt', 'Mijn zus is op mijn moeder.', 0],
    ['De zon schijnt fel.', 'schijnt', 'De zon is fel.', 0, 'Dat is een goede zin, maar de betekenis is anders: schijnen betekent hier dat de zon licht geeft.'],
    ['Wij blijven lachen.', 'blijven', 'Wij zijn lachen.', 0],
    ['Het licht blijft branden.', 'blijft', 'Het licht is branden.', 0],
    ['De gastheer heet zijn gasten welkom.', 'heet', 'De gastheer is zijn gasten welkom.', 0],
    ['De lamp schijnt in mijn gezicht.', 'schijnt', 'De lamp is in mijn gezicht.', 0, 'De zin klopt misschien, maar de betekenis is helemaal anders.'],
    ['De boom lijkt op een reus.', 'lijkt', 'De boom is op een reus.', 0],
    ['De hond blijft blaffen.', 'blijft', 'De hond is blaffen.', 0]
  ];

  G.push({ groep:{ id:'zd-gezegde', niveau:'1F', domein:'grammatica', naam:'Het gezegde',
      uit:'Het gezegde zijn de werkwoorden van de zin. Soms hoort er ook een stuk bij dat zegt hoe of wat het onderwerp is: dan is het een naamwoordelijk gezegde.' },
    doelen:[
      { id:'zd-wwg', naam:'Het werkwoordelijk gezegde', kort:'Alle werkwoorden in de zin samen',
        uit:'<p>Het <b>werkwoordelijk gezegde</b> bestaat uit alle werkwoorden in de zin: de persoonsvorm en de andere werkwoorden.</p><p>De kinderen <b>hebben</b> buiten <b>gespeeld</b>. Het gezegde is: hebben gespeeld.</p><p>Staat er maar één werkwoord, dan is dat het hele gezegde.</p>',
        wanneer:'je de persoonsvorm al hebt en de zin verder wilt ontleden.',
        maak:function(R){
          var z = zdMet(R, function(z){ return !heeft(z, 'nd') && !z.d.some(function(x){ return x.r === 'wg' && x.t === 'op'; }); });
          var wg = alle(z, 'wg'), rest = wg.map(function(x){ return x.t; }).join(', ');
          var nee = z.d.filter(function(x){ return x.r === 'lv' || x.r === 'bwb'; }).map(function(x){ return x.t.split(' ').pop(); });
          return eindKeuze({ vraag:zinVan(z), context:'Zoek het <b>werkwoordelijk gezegde</b>.',
            beeld:function(n){ return deelBeeld(R, z, n >= 2 ? ['pv', 'wg'] : n >= 1 ? ['pv'] : []); },
            stappen:[ pvStap(R, z),
              keuze(R, 'Welke andere werkwoorden staan er nog in de zin?', wg.length ? rest : 'geen', (wg.length ? ['geen'] : []).concat(nee), wg.length ? 'Zoek woorden waar je ' + q('ik') + ' of ' + q('te') + ' voor kunt zetten, of die eindigen op -d, -t of -en: ' + q(rest) + '.' : 'Behalve de persoonsvorm staat er geen werkwoord in de zin.', { max:3 }),
              gezKeuze(R, z) ] });
        } },
      { id:'zd-hww', naam:'Hulpwerkwoorden herkennen', kort:'Hebben, zijn, worden, zullen, kunnen, moeten, willen en mogen helpen een ander werkwoord',
        uit:'<p>Een <b>hulpwerkwoord</b> helpt het hoofdwerkwoord. Het hoofdwerkwoord zegt wat er gebeurt.</p><p>De hulpwerkwoorden zijn: <b>hebben, zijn, worden, zullen, kunnen, moeten, willen en mogen</b>.</p><p>Sara <b>moet</b> haar kamer opruimen. Opruimen is wat er gebeurt; moet is het hulpwerkwoord.</p>',
        wanneer:'er twee of meer werkwoorden in de zin staan.',
        maak:function(R){
          var z = zdMet(R, function(z){ return !heeft(z, 'nd') && HWW[deel(z, 'pv').t.toLowerCase()] && alle(z, 'wg').length === 1 && deel(z, 'wg').t !== 'op'; });
          var pv = deel(z, 'pv'), wg = deel(z, 'wg'), ww = klein(pv.t) + ', ' + wg.t;
          var lv = z.d.filter(function(x){ return x.r === 'lv' || x.r === 'bwb' || x.r === 'ow'; }).map(function(x){ return x.t.split(' ').pop(); });
          return eindKeuze({ vraag:zinVan(z), context:'Welk werkwoord is het <b>hulpwerkwoord</b>?',
            beeld:function(n){ var m = {}; if (n >= 1){ m[idx(z, 'pv')] = { k:0, label:'ww' }; m[idx(z, 'wg')] = { k:0, label:'ww' }; }
              if (n >= 2) m[idx(z, 'wg')] = { k:1, label:'hoofdww' }; if (n >= 3) m[idx(z, 'pv')] = { k:4, label:'hulpww' }; return deelBeeld(R, z, m); },
            stappen:[
              keuze(R, 'Welke werkwoorden staan er in de zin?', ww, [klein(pv.t), klein(pv.t) + ', ' + R.kies(lv)], 'Er staan er twee: ' + q(ww) + '.', { max:3 }),
              keuze(R, 'Welk werkwoord zegt wat er gebeurt? Dat is het hoofdwerkwoord.', wg.t, [klein(pv.t)], q(wg.t) + ' vertelt wat er gebeurt.'),
              keuze(R, 'Welk werkwoord is dan het hulpwerkwoord?', klein(pv.t), [wg.t, R.kies(lv)], q(klein(pv.t)) + ' is een vorm van ' + q(HWW[pv.t.toLowerCase()]) + ': een hulpwerkwoord.', { max:3 }) ] });
        } },
      { id:'zd-koppel', naam:'Koppelwerkwoord: de zijn-proef', kort:'Kun je het werkwoord vervangen door zijn, met ongeveer dezelfde betekenis? Dan is het een koppelwerkwoord',
        uit:'<p>De <b>koppelwerkwoorden</b> zijn: zijn, worden, blijven, lijken, schijnen, blijken en heten.</p><p>Ze koppelen het onderwerp aan een eigenschap: de soep <b>blijft</b> warm.</p><p>De proef: vervang het werkwoord door een vorm van <b>zijn</b>. Blijft de zin goed, met ongeveer dezelfde betekenis? Dan is het een koppelwerkwoord. De bal blijft liggen: de bal is liggen. Dat kan niet, dus hier is blijven geen koppelwerkwoord.</p>',
        wanneer:'je zijn, worden, blijven, lijken, schijnen, blijken of heten in de zin ziet.',
        maak:function(R){
          var k = R.kies(KOPPEL), ja = !!k[3];
          return eindKeuze({ vraag:k[0], context:'Is <b>' + k[1] + '</b> hier een koppelwerkwoord?',
            beeld:function(n){ return n >= 1 ? '<p class="lr-context">Met zijn: ' + R.schoon(k[2]) + '</p>' : ''; },
            stappen:[
              janee('Vervang ' + q(k[1]) + ' door een vorm van zijn: ' + q(k[2]) + ' Is dat een goede zin, met ongeveer dezelfde betekenis?', ja,
                ja ? 'Lees de zin hardop. Hij klopt en zegt bijna hetzelfde.' : (k[4] || 'Lees de zin hardop. Zo zeg je het niet.')),
              janee('Is ' + q(k[1]) + ' hier een koppelwerkwoord?', ja, ja ? 'De zijn-proef lukte.' : 'De zijn-proef lukte niet.') ] });
        } },
      { id:'zd-ng', naam:'Het naamwoordelijk gezegde', kort:'Koppelwerkwoord plus het stuk dat zegt hoe of wat het onderwerp is',
        uit:'<p>Staat er een koppelwerkwoord, dan is het gezegde een <b>naamwoordelijk gezegde</b>.</p><p>Het bestaat uit het koppelwerkwoord en het <b>naamwoordelijk deel</b>: het stuk dat zegt hoe of wat het onderwerp is.</p><p>De soep <b>is te heet</b>. Te heet zegt hoe de soep is. Het naamwoordelijk gezegde is: is te heet.</p>',
        wanneer:'de zin een koppelwerkwoord heeft.',
        maak:function(R){
          var z = zdMet(R, function(z){ return heeft(z, 'nd'); }), pv = deel(z, 'pv'), nd = deel(z, 'nd'), ow = deel(z, 'ow');
          var ng = klein(pv.t) + ' ' + klein(nd.t), b = z.d.filter(function(x){ return x.r === 'bwb'; });
          var fout = [klein(pv.t), klein(nd.t), klein(ow.t) + ' ' + klein(pv.t)].concat(b.map(function(x){ return klein(pv.t) + ' ' + klein(x.t); }));
          return eindKeuze({ vraag:zinVan(z), context:'Zoek het <b>naamwoordelijk gezegde</b>.',
            beeld:function(n){ return deelBeeld(R, z, n >= 2 ? ['pv', 'nd'] : n >= 1 ? ['pv'] : []); },
            stappen:[ pvStap(R, z, 'Wat is de persoonsvorm? Hier is dat het koppelwerkwoord.'),
              deelKeuze(R, 'Welk stuk zegt hoe of wat ' + q(klein(ow.t)) + ' is?', z, nd, q(klein(ow.t)) + ' is ' + klein(nd.t) + '. Dat is het naamwoordelijk deel.'),
              keuze(R, 'Wat is het naamwoordelijk gezegde?', ng, fout, 'Het koppelwerkwoord en het naamwoordelijk deel samen: ' + q(ng) + '.', { max:3 }) ] });
        } },
      { id:'zd-wofn', naam:'Werkwoordelijk of naamwoordelijk?', kort:'Staat er alleen een koppelwerkwoord? Dan naamwoordelijk. Anders werkwoordelijk',
        uit:'<p>Kijk naar de werkwoorden in de zin.</p><p>Zit er een <b>gewoon werkwoord</b> bij dat zegt wat er gebeurt (spelen, bouwen, vallen)? Dan is het gezegde <b>werkwoordelijk</b>.</p><p>Staat er <b>alleen een koppelwerkwoord</b> (zijn, worden, blijven, lijken, schijnen, blijken, heten)? Dan is het <b>naamwoordelijk</b>.</p><p>Let op: het huis is gebouwd. Hier is is een hulpwerkwoord bij gebouwd. Werkwoordelijk dus.</p>',
        wanneer:'je moet kiezen welk soort gezegde een zin heeft.',
        maak:function(R){
          var z = zdMet(R, function(z){ return !z.d.some(function(x){ return x.r === 'wg' && x.t === 'op'; }) && (R.heel(0, 1) ? heeft(z, 'nd') : !heeft(z, 'nd')); });
          var nd = heeft(z, 'nd'), ww = werkwoorden(z), pv = deel(z, 'pv');
          var nee = z.d.filter(function(x){ return x.r === 'lv' || x.r === 'bwb' || x.r === 'nd'; }).map(function(x){ return x.t.split(' ').pop(); });
          var fout = nee.map(function(w){ return ww + ', ' + w; }); if (heeft(z, 'wg')) fout.push(klein(pv.t));
          return eindKeuze({ vraag:zinVan(z), context:'Is het gezegde <b>werkwoordelijk</b> of <b>naamwoordelijk</b>?',
            beeld:function(n){ return deelBeeld(R, z, n >= 3 ? ['pv', 'wg', 'nd'] : n >= 1 ? ['pv', 'wg'] : []); },
            stappen:[
              keuze(R, 'Welke werkwoorden staan er in de zin?', ww, fout, 'De werkwoorden zijn: ' + q(ww) + '.', { max:3 }),
              vast('Zit er een gewoon werkwoord bij, dat zegt wat er gebeurt? Of alleen een koppelwerkwoord?', ['een gewoon werkwoord', 'alleen een koppelwerkwoord'], nd ? 'alleen een koppelwerkwoord' : 'een gewoon werkwoord',
                nd ? q(klein(pv.t)) + ' is hier een koppelwerkwoord: het koppelt ' + q(klein(deel(z, 'ow').t)) + ' aan ' + q(klein(deel(z, 'nd').t)) + '.' : 'Er gebeurt iets: ' + q(heeft(z, 'wg') ? alle(z, 'wg').map(function(x){ return x.t; }).join(' ') : klein(pv.t)) + '.'),
              vast('Is het gezegde werkwoordelijk of naamwoordelijk?', ['werkwoordelijk', 'naamwoordelijk'], nd ? 'naamwoordelijk' : 'werkwoordelijk', nd ? 'Alleen een koppelwerkwoord: naamwoordelijk.' : 'Er staat een gewoon werkwoord: werkwoordelijk.') ] });
        } }
    ] });

  /* ================= 4. voorwerpen en bepalingen ================= */
  var BVB = [
    'De fiets van mijn zus=ow:@fiets:van mijn zus|staat=pv|in de schuur=bwb',
    'Ik=ow|lees=pv|een boek over draken=lv:@boek:over draken',
    'Het oude huis=ow:@huis:oude|wordt=pv|gesloopt=wg',
    'Wij=ow|wonen=pv|in een groot huis=bwb:@huis:groot',
    'De man met de hoed=ow:@man:met de hoed|zit=pv|op een bankje=bwb',
    'Mijn broer=ow|heeft=pv|een rode auto=lv:@auto:rode|gekocht=wg',
    'Het meisje met het rode haar=ow:@meisje:met het rode haar|zit=pv|naast mij=bwb',
    'De kinderen=ow|spelen=pv|in de tuin van de buren=bwb:@tuin:van de buren',
    'Sara=ow|draagt=pv|een jas met een bontkraag=lv:@jas:met een bontkraag',
    'De hond van de buren=ow:@hond:van de buren|blaft=pv|elke nacht=bwb',
    'Ik=ow|drink=pv|warme chocolademelk=lv:@chocolademelk:warme',
    'De leraar=ow|geeft=pv|een moeilijke toets=lv:@toets:moeilijke',
    'Een man in een blauw pak=ow:@man:in een blauw pak|wacht=pv|bij de deur=bwb',
    'Wij=ow|eten=pv|vanavond=bwb|verse vis=lv:@vis:verse',
    'Mijn moeder=ow|heeft=pv|een taart met aardbeien=lv:@taart:met aardbeien|gebakken=wg',
    'De jongen in de rolstoel=ow:@jongen:in de rolstoel|wint=pv|de race=lv',
    'Lisa=ow|woont=pv|in een klein dorp=bwb:@dorp:klein',
    'De trein naar Utrecht=ow:@trein:naar Utrecht|vertrekt=pv|om negen uur=bwb',
    'Tom=ow|kijkt=pv|een spannende film=lv:@film:spannende',
    'Ik=ow|heb=pv|een kaartje voor het concert=lv:@kaartje:voor het concert|gekocht=wg',
    'De vrouw naast mij=ow:@vrouw:naast mij|leest=pv|de krant=lv',
    'Het water in het zwembad=ow:@water:in het zwembad|is=pv|erg koud=nd',
    'De leerlingen=ow|maken=pv|een lastige opdracht=lv:@opdracht:lastige',
    'De kat van de buren=ow:@kat:van de buren|ligt=pv|op ons dak=bwb'
  ].map(delen);
  var ROLNAAM = { lv:'lijdend voorwerp', mv:'meewerkend voorwerp', bwb:'bijwoordelijke bepaling' };
  function zonderBwb(z, B){ /* vraag met een vraagwoord: pv, ow, de rest zonder B */
    var pv = deel(z, 'pv'), ow = deel(z, 'ow');
    return [pv, ow].concat(z.d.filter(function(x){ return x !== pv && x !== ow && x !== B; })).map(function(x){ return klein(x.t); }).join(' ');
  }

  G.push({ groep:{ id:'zd-rest', niveau:'1F', domein:'grammatica', naam:'Voorwerpen en bepalingen',
      uit:'Na de persoonsvorm, het onderwerp en het gezegde zoek je de rest: het lijdend voorwerp, het meewerkend voorwerp en de bepalingen. Steeds met een vaste vraag.' },
    doelen:[
      { id:'zd-lv', naam:'Het lijdend voorwerp', kort:'Vraag: wie of wat + gezegde + onderwerp?',
        uit:'<p>Het <b>lijdend voorwerp</b> is wie of wat iets ondergaat.</p><p>Zoek eerst het gezegde en het onderwerp. Vraag dan: <b>wie of wat + gezegde + onderwerp?</b></p><p>Mijn vader heeft de auto gewassen. Wie of wat heeft mijn vader gewassen? De auto.</p>',
        wanneer:'je het gezegde en het onderwerp al gevonden hebt.',
        maak:function(R){
          var z = zdMet(R, function(z){ return heeft(z, 'lv'); }), ow = deel(z, 'ow'), lv = deel(z, 'lv'), pv = deel(z, 'pv');
          var wg = alle(z, 'wg').map(function(x){ return ' ' + x.t; }).join('');
          var vr = 'Wie of wat ' + klein(pv.t) + ' ' + klein(ow.t) + wg + '?';
          return eindKeuze({ vraag:zinVan(z), context:'Zoek het <b>lijdend voorwerp</b>.',
            beeld:function(n){ return deelBeeld(R, z, ['pv', 'wg', 'ow', 'lv'].slice(0, n >= 3 ? 4 : n >= 2 ? 3 : n >= 1 ? 2 : 0)); },
            stappen:[ gezKeuze(R, z, 'Wat is het gezegde? Dat zijn alle werkwoorden.'),
              deelKeuze(R, 'Wat is het onderwerp? Vraag: wie of wat ' + gezegde(z) + '?', z, ow, 'Wie of wat ' + gezegde(z) + '? ' + groot(klein(ow.t)) + '.'),
              deelKeuze(R, 'Vraag: ' + q(vr) + ' Welk stuk is het antwoord?', z, lv, vr + ' ' + groot(klein(lv.t)) + '.') ] });
        } },
      { id:'zd-mv-vraag', naam:'Meewerkend voorwerp: aan of voor wie?', kort:'Vraag: aan of voor wie + gezegde + onderwerp + lijdend voorwerp?',
        uit:'<p>Het <b>meewerkend voorwerp</b> is de persoon (of het ding) die iets krijgt of voor wie iets gedaan wordt.</p><p>Zoek eerst het onderwerp en het lijdend voorwerp. Vraag dan: <b>aan wie</b> of <b>voor wie</b>?</p><p>De leraar geeft de leerlingen een compliment. Aan wie geeft de leraar een compliment? De leerlingen.</p>',
        wanneer:'iemand iets krijgt, geeft, stuurt of vertelt.',
        maak:function(R){
          var z = zdMet(R, function(z){ return heeft(z, 'mv'); }), ow = deel(z, 'ow'), lv = deel(z, 'lv'), mv = deel(z, 'mv'), pv = deel(z, 'pv');
          var wg = alle(z, 'wg').map(function(x){ return ' ' + x.t; }).join('');
          var vlv = 'Wie of wat ' + klein(pv.t) + ' ' + klein(ow.t) + wg + '?', vmv = groot(mv.x[0]) + ' wie ' + klein(pv.t) + ' ' + klein(ow.t) + ' ' + lv.t + wg + '?';
          return eindKeuze({ vraag:zinVan(z), context:'Zoek het <b>meewerkend voorwerp</b>.',
            beeld:function(n){ return deelBeeld(R, z, ['pv', 'wg', 'ow', 'lv', 'mv'].slice(0, n >= 3 ? 5 : n >= 2 ? 4 : n >= 1 ? 3 : 0)); },
            stappen:[
              deelKeuze(R, 'Wat is het onderwerp? Vraag: wie of wat ' + gezegde(z) + '?', z, ow, 'Wie of wat ' + gezegde(z) + '? ' + groot(klein(ow.t)) + '.'),
              deelKeuze(R, 'Wat is het lijdend voorwerp? Vraag: ' + q(vlv), z, lv, vlv + ' ' + groot(lv.t) + '.'),
              deelKeuze(R, 'Vraag: ' + q(vmv) + ' Welk stuk is het antwoord?', z, mv, vmv + ' ' + groot(klein(mv.t)) + '.') ] });
        } },
      { id:'zd-mv-proef', naam:'Meewerkend voorwerp: de aan-proef', kort:'Kun je er aan of voor voor zetten? Dan is het een meewerkend voorwerp',
        uit:'<p>De proef voor het <b>meewerkend voorwerp</b>: zet er <b>aan</b> of <b>voor</b> voor, en zet het achter het lijdend voorwerp.</p><p>Ik geef mijn moeder een bos bloemen. Ik geef een bos bloemen <b>aan mijn moeder</b>. Dat kan, dus mijn moeder is het meewerkend voorwerp.</p>',
        wanneer:'je twijfelt tussen het meewerkend voorwerp en een ander zinsdeel.',
        maak:function(R){
          var z = zdMet(R, function(z){ return heeft(z, 'mv'); }), lv = deel(z, 'lv'), mv = deel(z, 'mv'), vz = mv.x[0];
          var nieuw = [];
          z.d.forEach(function(x){ if (x === mv) return; nieuw.push(x.t); if (x === lv) nieuw.push(vz + ' ' + klein(mv.t)); });
          var zin = groot(nieuw.join(' ')) + z.eind;
          var fout = z.d.filter(function(x){ return x !== mv && x !== lv && x.r !== 'pv' && x.r !== 'wg'; }).map(function(x){ return vz + ' ' + klein(x.t); });
          return eindKeuze({ vraag:zinVan(z), context:'Zoek het <b>meewerkend voorwerp</b> met de proef.',
            beeld:function(n){ var m = {}; if (n >= 1) m[idx(z, 'lv')] = { k:3, label:'lv' }; if (n >= 3) m[idx(z, 'mv')] = { k:4, label:'mv' }; return onder(deelBeeld(R, z, m), n >= 2 ? R.schoon(zin) : ''); },
            stappen:[
              deelKeuze(R, 'Wat is het lijdend voorwerp?', z, lv, 'Wie of wat ' + klein(deel(z, 'pv').t) + ' ' + klein(deel(z, 'ow').t) + alle(z, 'wg').map(function(x){ return ' ' + x.t; }).join('') + '? ' + groot(lv.t) + '.'),
              keuze(R, 'Welk stuk kun je achter ' + q(lv.t) + ' zetten, met ' + q(vz) + ' ervoor?', vz + ' ' + klein(mv.t), fout, 'Probeer het: ' + q(zin), { max:3 }),
              deelKeuze(R, 'Welk stuk is dus het meewerkend voorwerp?', z, mv, 'Bij ' + q(klein(mv.t)) + ' lukte de proef.') ] });
        } },
      { id:'zd-bwb', naam:'De bijwoordelijke bepaling', kort:'Vraag: waar, wanneer, hoe of waarom?',
        uit:'<p>Een <b>bijwoordelijke bepaling</b> vertelt meer over wat er gebeurt: <b>waar</b>, <b>wanneer</b>, <b>hoe</b> of <b>waarom</b>.</p><p>Stel de vraag met het gezegde en het onderwerp erin. Wanneer speelt mijn broer voetbal? Elke zaterdag.</p><p>Een zin kan meer bijwoordelijke bepalingen hebben.</p>',
        wanneer:'een zinsdeel geen onderwerp, gezegde of voorwerp is.',
        maak:function(R){
          var z = zdMet(R, function(z){ return heeft(z, 'bwb'); }), B = R.kies(alle(z, 'bwb')), soort = B.x[0];
          var kinds = alle(z, 'bwb').map(function(x){ return x.x[0]; });
          var vr = groot(soort) + ' ' + zonderBwb(z, B) + '?';
          var bi = z.d.indexOf(B);
          return eindKeuze({ vraag:zinVan(z), context:'Zoek een <b>bijwoordelijke bepaling</b>.',
            beeld:function(n){ var m = {}; if (n >= 1) m[idx(z, 'pv')] = { k:1, label:'pv' }; if (n >= 3) m[bi] = { k:5, label:'bwb' }; return deelBeeld(R, z, m); },
            stappen:[ pvStap(R, z),
              keuze(R, 'Welk vraagwoord past bij deze zin?', soort, ['waar', 'wanneer', 'hoe', 'waarom'].filter(function(v){ return kinds.indexOf(v) < 0; }),
                'Vertelt de zin waar, wanneer, hoe of waarom? Kijk naar ' + q(klein(B.t)) + '.'),
              deelKeuze(R, 'Vraag: ' + q(vr) + ' Welk stuk is het antwoord?', z, B, vr + ' ' + groot(klein(B.t)) + '.') ] });
        } },
      { id:'zd-bvb', naam:'De bijvoeglijke bepaling', kort:'Een stuk dat bij een woord hoort en vastzit aan het zinsdeel',
        uit:'<p>Een <b>bijvoeglijke bepaling</b> zegt iets over één woord in een zinsdeel. Ze is geen eigen zinsdeel: ze zit er <b>vast</b> aan.</p><p>De fiets <b>van mijn zus</b> staat buiten. Van mijn zus zegt welke fiets. Je kunt het niet los verplaatsen.</p><p>Zoek eerst het zinsdeel, dan het belangrijkste woord (de kern). Vraag dan: <b>welke</b> of <b>wat voor</b>?</p>',
        wanneer:'een zinsdeel uit meer woorden bestaat.',
        maak:function(R){
          var z = R.kies(BVB), D = z.d.filter(function(x){ return x.x[0] && x.x[0].charAt(0) === '@'; })[0];
          var kern = D.x[0].slice(1), bvb = D.x[1], zonder = D.t.replace(bvb, '').replace(/\s+/g, ' ').trim();
          var di = z.d.indexOf(D), ww = D.t.split(' ').filter(function(w){ return w !== kern && w.length > 2 && KLEIN.indexOf(w.toLowerCase()) < 0 && ['van', 'met', 'over', 'voor', 'naast', 'naar'].indexOf(w) < 0; });
          var andere = z.d.filter(function(x){ return x !== D && x.r !== 'pv' && x.r !== 'wg'; }).map(function(x){ return klein(x.t); });
          return eindKeuze({ vraag:zinVan(z), context:'Zoek de <b>bijvoeglijke bepaling</b>.',
            beeld:function(n){ var m = {}; if (n >= 1) m[di] = { k:n >= 3 ? 3 : 0, label:n >= 3 ? 'bvb: ' + bvb : 'zinsdeel' }; return deelBeeld(R, z, m); },
            stappen:[
              keuze(R, 'Welk stuk is één zinsdeel? Denk aan de verplaatsproef.', klein(D.t), [klein(zonder), bvb], 'Alleen ' + q(klein(D.t)) + ' kan in zijn geheel vooraan staan.', { max:3 }),
              keuze(R, 'Wat is het belangrijkste woord (de kern) van ' + q(klein(D.t)) + '?', kern, ww.length ? ww : [bvb.split(' ').pop()], 'Waar gaat het over? Over ' + q(kern) + '.'),
              keuze(R, 'Welk stuk zegt iets over ' + q(kern) + '? Vraag: welk(e) ' + kern + ', of wat voor ' + kern + '?', bvb, andere.concat([klein(zonder)]), q(bvb) + ' zegt welk(e) of wat voor ' + kern + '.', { max:3 }) ] });
        } },
      { id:'zd-ontleed', naam:'Een hele zin ontleden', kort:'Stap voor stap: persoonsvorm, onderwerp, gezegde en dan de rest',
        uit:'<p>Ontleden doe je altijd in dezelfde volgorde:</p><p>1 de <b>persoonsvorm</b>, 2 het <b>onderwerp</b>, 3 het <b>gezegde</b>, 4 het <b>lijdend voorwerp</b>, 5 het <b>meewerkend voorwerp</b>, 6 de <b>bijwoordelijke bepalingen</b>.</p><p>Wat je gevonden hebt, streep je weg. Zo blijft er steeds minder over.</p>',
        wanneer:'je een zin helemaal moet ontleden.',
        maak:function(R){
          var z = zdMet(R, function(z){ return !heeft(z, 'nd') && z.d.some(function(x){ return ROLNAAM[x.r]; }); });
          var rest = z.d.filter(function(x){ return ROLNAAM[x.r]; });
          var volg = { lv:0, mv:1, bwb:2 }; rest.sort(function(a, b){ return volg[a.r] - volg[b.r]; });
          if (rest.length > 2) rest = rest.slice(0, 2);
          var X = rest[rest.length - 1], ow = deel(z, 'ow');
          var st = [ pvStap(R, z), deelKeuze(R, 'Wat is het onderwerp? Vraag: wie of wat ' + gezegde(z) + '?', z, ow, 'Wie of wat ' + gezegde(z) + '? ' + groot(klein(ow.t)) + '.'), gezKeuze(R, z) ];
          rest.forEach(function(x){
            var vh = x.r === 'lv' ? 'Wie of wat ' + klein(deel(z, 'pv').t) + ' ' + klein(ow.t) + '?' : x.r === 'mv' ? 'Aan of voor wie?' : 'Het zegt ' + x.x[0] + '.';
            st.push(vast('Wat is ' + q(klein(x.t)) + '?', ['lijdend voorwerp', 'meewerkend voorwerp', 'bijwoordelijke bepaling'], ROLNAAM[x.r], vh + ' Het is een ' + ROLNAAM[x.r] + '.'));
          });
          var rollen = ['pv', 'ow', 'wg'];
          return eindKeuze({ vraag:zinVan(z), context:'Ontleed de zin. Wat is <b>' + R.schoon(klein(X.t)) + '</b>?',
            beeld:function(n){ var m = {};
              z.d.forEach(function(x, i){ var s = x.r === 'pv' ? 1 : x.r === 'ow' ? 2 : x.r === 'wg' ? 3 : rest.indexOf(x) >= 0 ? 4 + rest.indexOf(x) : 99;
                if (n >= s) m[i] = { k:ROL[x.r].k, label:ROL[x.r].l }; });
              return deelBeeld(R, z, m); },
            stappen:st });
        } }
    ] });

  /* ================= 5. meer woordsoorten ================= */
  var PERS = [
    ['[Mijn broer] speelt voetbal.', 'm', 1], ['[De buurman] maait het gras.', 'm', 1], ['Morgen komt [opa] op bezoek.', 'm', 1], ['[Tom] heeft honger.', 'm', 1],
    ['Gisteren was [de leraar] ziek.', 'm', 1], ['[Daan] fietst naar school.', 'm', 1],
    ['Ik zie [mijn broer] op het plein.', 'm', 0], ['Wij bellen [opa] vanavond op.', 'm', 0], ['Sara geeft [Tom] een cadeau.', 'm', 0],
    ['Ik ga met [mijn vader] naar de film.', 'm', 0], ['De hond bijt [de postbode].', 'm', 0], ['Ik wacht op [Daan].', 'm', 0],
    ['[Mijn zus] leest een boek.', 'v', 1], ['[De juf] legt de som uit.', 'v', 1], ['Vandaag gaat [oma] naar de markt.', 'v', 1],
    ['[Lisa] heeft een nieuwe fiets.', 'v', 1], ['[Emma] zingt in een koor.', 'v', 1],
    ['Ik help [mijn moeder] in de keuken.', 'v', 0], ['Tom stuurt [Lisa] een berichtje.', 'v', 0], ['Wij zien [de juf] morgen weer.', 'v', 0],
    ['Ik loop met [mijn zus] naar huis.', 'v', 0], ['De kinderen geven [oma] een tekening.', 'v', 0],
    ['[De kinderen] spelen buiten.', 'mv', 1], ['[Mijn ouders] werken in Utrecht.', 'mv', 1], ['Morgen gaan [Sam en Noah] zwemmen.', 'mv', 1], ['[De leerlingen] maken een toets.', 'mv', 1]
  ];
  var HUNHEN = [
    ['[De kinderen] hebben honger.', 'ow'], ['Gisteren hebben [mijn neven] gewonnen.', 'ow'], ['[De buren] gaan verhuizen.', 'ow'], ['[Mijn ouders] komen morgen terug.', 'ow'],
    ['Morgen spelen [de jongens] een wedstrijd.', 'ow'],
    ['Ik ga met [mijn vrienden] naar de stad.', 'vz'], ['Wij wachten op [de andere leerlingen].', 'vz'], ['Dit cadeau is voor [mijn ouders].', 'vz'],
    ['Ik heb een brief aan [mijn opa en oma] geschreven.', 'vz'], ['Fatima logeert bij [haar tantes].', 'vz'], ['Ik denk vaak aan [mijn vrienden].', 'vz'], ['Sara zit naast [de nieuwe leerlingen].', 'vz'],
    ['Ik zie [de buren] in de tuin.', 'lv'], ['De juf roept [de leerlingen] naar binnen.', 'lv'], ['Wij bezoeken [opa en oma] op zondag.', 'lv'], ['Ik ken [die jongens] niet.', 'lv'],
    ['De trainer prijst [de spelers].', 'lv'], ['Ik heb [mijn neven] lang niet gezien.', 'lv'],
    ['Ik geef [mijn vrienden] een cadeau.', 'mv'], ['De juf leest [de kinderen] een verhaal voor.', 'mv'], ['Wij sturen [opa en oma] een kaart.', 'mv'],
    ['De trainer geeft [de spelers] een compliment.', 'mv'], ['Ik vertel [mijn ouders] de waarheid.', 'mv'], ['De leraar heeft [de leerlingen] een tip gegeven.', 'mv']
  ];
  function haak(s){ var m = /\[([^\]]+)\]/.exec(s); return { deel:m[1], voor:s.slice(0, m.index), na:s.slice(m.index + m[0].length) }; }
  function metVnw(h, w){ return (h.voor ? h.voor + w : w.replace(/^\[(.)/, function(a, c){ return '[' + c.toUpperCase(); })) + h.na; }
  function haakBeeld(R, s, label, k){ var h = haak(s), d = [];
    if (h.voor.trim()) d.push(h.voor.trim()); d.push({ t:h.deel, k:k || 2, label:label }); if (h.na.trim()) d.push(h.na.trim()); return R.teken.zin(d); }
  var BEZ = [
    'Mijn/bez fiets/zn staat/ww in/x de/x schuur/zn.', 'Jouw/bez jas/zn hangt/ww aan/x de/x kapstok/zn.', 'Tom/x zoekt/ww zijn/bez sleutels/zn.',
    'Sara/x belt/ww haar/bez vriendin/zn.', 'Wij/x verkopen/ww onze/bez oude/bn auto/zn.', 'De/x kinderen/zn spelen/ww met/x hun/bez nieuwe/bn bal/zn.',
    'Ons/bez huis/zn heeft/ww een/x grote/bn tuin/zn.', 'Uw/bez bestelling/zn wordt/x morgen/x bezorgd/ww.', 'Mijn/bez opa/zn leest/ww elke/x ochtend/zn de/x krant/zn.',
    'Lisa/x verliest/ww haar/bez telefoon/zn.', 'De/x hond/zn eet/ww uit/x zijn/bez bak/zn.', 'Jouw/bez tekening/zn is/x erg/x mooi/bn.',
    'Onze/bez juf/zn geeft/ww veel/x huiswerk/zn.', 'De/x buren/zn maaien/ww hun/bez gras/zn.', 'Emma/x pakt/ww haar/bez tas/zn.',
    'Opa/x poetst/ww zijn/bez schoenen/zn.', 'Daan/x vergeet/ww altijd/x zijn/bez gymspullen/zn.', 'Jullie/bez klas/zn wint/ww de/x quiz/zn.',
    'Mijn/bez zusje/zn tekent/ww een/x paard/zn.', 'Noah/x leent/ww zijn/bez fiets/zn uit/x.'
  ];
  var VAN = { mijn:'mij', jouw:'jou', zijn:'hem', haar:'haar', ons:'ons', onze:'ons', hun:'hen', uw:'u', jullie:'jullie' };
  var AANW = [
    ['… fiets hier is van mij.', 'fiets', 'de', 1], ['… huis daar is heel oud.', 'huis', 'het', 0], ['Pak jij … boek hier even?', 'boek', 'het', 1],
    ['Zie je … vogel daar op het dak?', 'vogel', 'de', 0], ['… schoenen hier zijn te klein.', 'schoenen', 'mv', 1], ['… kinderen daar spelen voetbal.', 'kinderen', 'mv', 0],
    ['Ik wil … ijsje hier.', 'ijsje', 'het', 1], ['… meisje daar is mijn zus.', 'meisje', 'het', 0], ['Hoe duur is … jas hier?', 'jas', 'de', 1],
    ['Woon jij in … straat daar?', 'straat', 'de', 0], ['… potlood hier is stomp.', 'potlood', 'het', 1], ['Wie heeft … raam daar opengezet?', 'raam', 'het', 0],
    ['… appels hier zijn zuur.', 'appels', 'mv', 1], ['Ken jij … jongen daar?', 'jongen', 'de', 0], ['… liedje hier vind ik mooi.', 'liedje', 'het', 1],
    ['Kijk eens naar … paard daar!', 'paard', 'het', 0], ['… boeken daar zijn van de bibliotheek.', 'boeken', 'mv', 0], ['Ik neem … broodje hier.', 'broodje', 'het', 1],
    ['… tas hier is te zwaar.', 'tas', 'de', 1], ['Wat kost … spel daar?', 'spel', 'het', 0]
  ];
  var BETR = [
    ['De jongen … naast mij zit, heet Sam.', 'jongen', 'de'], ['Het boek … ik lees, is spannend.', 'boek', 'het'], ['De fiets … ik kreeg, is rood.', 'fiets', 'de'],
    ['Het huis … daar staat, is te koop.', 'huis', 'het'], ['Alles … je zegt, klopt.', 'alles', 'al'], ['Is er iets … ik kan doen?', 'iets', 'al'],
    ['Er is niets … mij verbaast.', 'niets', 'al'], ['De boeken … op tafel liggen, zijn van mij.', 'boeken', 'mv'], ['Het meisje … daar loopt, is mijn zus.', 'meisje', 'het'],
    ['De film … we gisteren zagen, was saai.', 'film', 'de'], ['Het spel … we spelen, heet schaak.', 'spel', 'het'], ['De kinderen … buiten spelen, hebben het warm.', 'kinderen', 'mv'],
    ['Het paard … het hardst rent, wint.', 'paard', 'het'], ['De les … nu begint, gaat over planten.', 'les', 'de'], ['Het verhaal … opa vertelde, was grappig.', 'verhaal', 'het'],
    ['Ik doe alles … de trainer zegt.', 'alles', 'al'], ['De tas … ik zoek, is blauw.', 'tas', 'de'], ['Het liedje … op de radio is, ken ik.', 'liedje', 'het'],
    ['Hij vertelde niets … ik nog niet wist.', 'niets', 'al'], ['De leraar … ons Engels geeft, is ziek.', 'leraar', 'de'], ['Het water … uit de kraan komt, is koud.', 'water', 'het']
  ];
  var VRAG = [
    ['… heeft mijn pen gepakt?', 'p'], ['… ga je morgen doen?', 'd'], ['… fiets is van jou?', 'de'], ['… boek lees je nu?', 'het'], ['… woont er in dat huis?', 'p'],
    ['… eet jij het liefst?', 'd'], ['… schoenen trek je aan?', 'mv'], ['… liedje vind je het mooist?', 'het'], ['Met … ga je naar het feest?', 'p'],
    ['… zit er in die doos?', 'd'], ['… dag is het vandaag?', 'de'], ['… huis is van jullie?', 'het'], ['… heeft de wedstrijd gewonnen?', 'p'],
    ['… is je lievelingseten?', 'd'], ['… kleur heeft jouw tas?', 'de'], ['… spel wil je spelen?', 'het'], ['Van … is deze jas?', 'p'],
    ['… gebeurde er gisteren?', 'd'], ['… vak vind jij het leukst?', 'het'], ['… trein moet ik nemen?', 'de']
  ];
  var BW = [
    'Mijn/x broer/zn rent/ww hard/bw>rent naar/x huis/zn.', 'Wij/x hebben/x gisteren/bw>gespeeld voetbal/zn gespeeld/ww.', 'Het/x is/x een/x erg/bw>spannende spannende/bn film/zn.',
    'De/x oude/bn man/zn loopt/ww langzaam/bw>loopt.', 'Sara/x zingt/ww prachtig/bw>zingt.', 'Dat/x is/x een/x heel/bw>grote grote/bn hond/zn.',
    'De/x kat/zn slaapt/ww vaak/bw>slaapt op/x de/x bank/zn.', 'Tom/x komt/ww morgen/bw>komt naar/x ons/x feest/zn.', 'Ik/x vind/ww dit/x een/x zeer/bw>moeilijke moeilijke/bn som/zn.',
    'De/x leerlingen/zn werken/ww stil/bw>werken in/x de/x klas/zn.', 'Mijn/x kleine/bn zusje/zn lacht/ww altijd/bw>lacht.', 'Het/x was/x een/x vreselijk/bw>saaie saaie/bn les/zn.',
    'De/x hond/zn blaft/ww luid/bw>blaft.', 'Opa/x fietst/ww nooit/bw>fietst in/x de/x regen/zn.', 'Ik/x heb/x een/x behoorlijk/bw>grote grote/bn kamer/zn.',
    'De/x zon/zn schijnt/ww fel/bw>schijnt.', 'Wij/x eten/ww vandaag/bw>eten pizza/zn.', 'Lisa/x schrijft/ww netjes/bw>schrijft in/x haar/x schrift/zn.',
    'Dit/x is/x een/x enorm/bw>dikke dikke/bn kat/zn.', 'De/x volle/bn bus/zn vertrekt/ww straks/bw>vertrekt.', 'De/x baby/zn huilt/ww zacht/bw>huilt.'
  ];
  var VW = [
    'Ik/x blijf/ww thuis/x omdat/vw ik/x ziek/bn ben/ww.', 'Sara/x leest/ww een/x boek/zn en/vw Tom/x speelt/ww een/x spel/zn.',
    'Het/x regent/ww maar/vw wij/x gaan/ww toch/x naar/x buiten/x.', 'Ik/x neem/ww een/x jas/zn mee/x want/vw het/x is/ww koud/bn.',
    'Als/vw het/x mooi/bn weer/zn is,/x gaan/ww we/x naar/x het/x strand/zn.', 'Ik/x weet/ww dat/vw jij/x gelijk/x hebt/ww.',
    'Wil/ww jij/x thee/zn of/vw koffie/zn?', 'Tom/x was/x moe/bn dus/vw hij/x ging/ww vroeg/x slapen/ww.',
    'Terwijl/vw mama/zn kookt,/x dekken/ww wij/x de/x tafel/zn.', 'Hoewel/vw het/x koud/bn was,/x zwommen/ww de/x kinderen/zn in/x zee/zn.',
    'Ik/x eet/ww een/x appel/zn en/vw een/x peer/zn.', 'We/x gaan/ww pas/x weg/x als/vw iedereen/x klaar/bn is/x.',
    'Daan/x lacht/ww omdat/vw de/x film/zn grappig/bn is/x.', 'Ik/x wilde/x komen/ww maar/vw ik/x had/x geen/x tijd/zn.',
    'Mijn/x broer/zn speelt/ww gitaar/zn en/vw mijn/x zus/zn zingt/ww.', 'Voordat/vw je/x gaat/x eten,/x moet/x je/x je/x handen/zn wassen/ww.',
    'Ze/x bleef/ww binnen/x want/vw het/x onweerde/ww.', 'Ik/x hoop/ww dat/vw je/x snel/x beter/bn wordt/x.'
  ];
  /* proef op drie woorden van een zin met woordsoorten (bez, vw): doel + twee andere */
  function lijstProef(R, lijst, soort, proef, slot, ctx){
    var z = woorden(R.kies(lijst)), ti = -1, fout = [], gz = {};
    z.w.forEach(function(w, i){ if (w.s === soort) ti = i; });
    z.w.forEach(function(w, i){ var l = w.t.toLowerCase(); if ((w.s === 'zn' || w.s === 'ww' || w.s === 'bn') && !gz[l] && l !== z.w[ti].t.toLowerCase()){ gz[l] = 1; fout.push(i); } });
    fout = R.hussel(fout).slice(0, 2);
    var kand = R.hussel([ti].concat(fout)), st = kand.map(function(i){ return proef(z, i, i === ti); });
    st.push(keuze(R, slot, z.w[ti].t, fout.map(function(i){ return z.w[i].t; }), 'De proef lukte bij ' + q(klein(z.w[ti].t)) + '.'));
    return eindKeuze({ vraag:woordZin(z), context:ctx,
      beeld:function(n){ var m = {}; kand.forEach(function(i, j){ m[i] = j < n ? (i === ti ? { k:4, label:WSN2[soort] } : { k:0, weg:true }) : { k:0, label:'?' }; }); return woordBeeld(R, z, m); },
      stappen:st });
  }
  var WSN2 = { bez:'bez. vnw', vw:'voegwoord', bw:'bijwoord' };

  G.push({ groep:{ id:'ws-meer', niveau:'1F', domein:'grammatica', naam:'Meer woordsoorten',
      uit:'Voornaamwoorden staan in plaats van een zelfstandig naamwoord of horen erbij. Bijwoorden en voegwoorden maken zinnen rijker en verbinden ze.' },
    doelen:[
      { id:'ws-pers', naam:'Persoonlijk voornaamwoord', kort:'Hij of hem, zij of haar: kijk of het het onderwerp is',
        uit:'<p>Een <b>persoonlijk voornaamwoord</b> staat in plaats van een persoon: ik, jij, hij, zij, wij, jullie, mij, jou, hem, haar, ons.</p><p>Is het <b>onderwerp</b>? Dan: <b>hij</b> of <b>zij</b>. Mijn broer slaapt: hij slaapt.</p><p>Is het geen onderwerp? Dan: <b>hem</b> of <b>haar</b>. Ik zie mijn broer: ik zie hem.</p>',
        wanneer:'je een naam of persoon wilt vervangen, zodat je hem niet steeds herhaalt.',
        maak:function(R){
          var p = R.kies(PERS), h = haak(p[0]), wie = p[1], ow = !!p[2];
          var ant = wie === 'm' ? (ow ? 'hij' : 'hem') : wie === 'v' ? (ow ? 'zij' : 'haar') : 'zij';
          var WIE = { m:'een jongen of man', v:'een meisje of vrouw', mv:'meer mensen' };
          return eindKeuze({ vraag:p[0].replace(/[\[\]]/g, ''), context:'Vervang <b>' + R.schoon(klein(h.deel)) + '</b> door een persoonlijk voornaamwoord.',
            beeld:function(n){ return n >= 3 ? haakBeeld(R, metVnw(h, '[' + ant + ']'), 'pers. vnw', 4) : haakBeeld(R, p[0], n >= 2 ? (ow ? 'onderwerp' : 'geen onderwerp') : '?', 2); },
            stappen:[
              vast('Wie is ' + q(klein(h.deel)) + '?', [WIE.m, WIE.v, WIE.mv], WIE[wie], q(klein(h.deel)) + ' is ' + WIE[wie] + '.'),
              janee('Is ' + q(klein(h.deel)) + ' het onderwerp van de zin?', ow, ow ? 'Wie of wat doet het? ' + groot(h.deel) + '.' : 'Iemand anders doet iets; ' + q(klein(h.deel)) + ' is het niet.'),
              vast('Welk woord kies je?', ['hij', 'hem', 'zij', 'haar'], ant, ow ? 'Onderwerp: hij of zij.' : 'Geen onderwerp: hem of haar.') ] });
        } },
      { id:'ws-hunhen', naam:'Hun of hen', kort:'Na een voorzetsel en als lijdend voorwerp: hen. Als meewerkend voorwerp: hun',
        uit:'<p>Bij meer personen kies je tussen <b>zij</b>, <b>hun</b> en <b>hen</b>.</p><p>Onderwerp: <b>zij</b> (nooit hun). Na een voorzetsel: <b>hen</b> (met hen, aan hen). Lijdend voorwerp: <b>hen</b> (ik zie hen). Meewerkend voorwerp zonder voorzetsel: <b>hun</b> (ik geef hun een cadeau).</p>',
        wanneer:'je een groep mensen vervangt en twijfelt tussen hun en hen.',
        maak:function(R){
          var p = R.kies(HUNHEN), h = haak(p[0]), r = p[1], ant = r === 'ow' ? 'zij' : r === 'mv' ? 'hun' : 'hen';
          var st = [ janee('Is ' + q(klein(h.deel)) + ' het onderwerp?', r === 'ow', r === 'ow' ? 'Wie of wat doet het? ' + groot(h.deel) + '.' : 'Iemand anders is het onderwerp.') ];
          if (r !== 'ow'){
            var vz = h.voor.trim().split(' ').pop();
            st.push(janee('Staat er een voorzetsel vlak voor ' + q(klein(h.deel)) + '?', r === 'vz', r === 'vz' ? q(vz) + ' is een voorzetsel.' : 'Ervoor staat ' + q(vz) + '. Dat is geen voorzetsel.'));
            if (r !== 'vz') st.push(vast('Is ' + q(klein(h.deel)) + ' het lijdend voorwerp of het meewerkend voorwerp?', ['lijdend voorwerp', 'meewerkend voorwerp'], r === 'lv' ? 'lijdend voorwerp' : 'meewerkend voorwerp',
              r === 'lv' ? 'Wie of wat? ' + groot(h.deel) + ': het lijdend voorwerp.' : 'Aan of voor wie? ' + groot(h.deel) + ': het meewerkend voorwerp.'));
          }
          st.push(vast('Welk woord kies je?', ['zij', 'hun', 'hen'], ant, r === 'ow' ? 'Onderwerp: zij.' : r === 'mv' ? 'Meewerkend voorwerp zonder voorzetsel: hun.' : r === 'vz' ? 'Na een voorzetsel: hen.' : 'Lijdend voorwerp: hen.'));
          return eindKeuze({ vraag:p[0].replace(/[\[\]]/g, ''), context:'Vervang <b>' + R.schoon(klein(h.deel)) + '</b>: zij, hun of hen?',
            beeld:function(n){ return n >= st.length ? haakBeeld(R, metVnw(h, '[' + ant + ']'), ant, 4) : haakBeeld(R, p[0], '?', 2); },
            stappen:st });
        } },
      { id:'ws-bez', naam:'Bezittelijk voornaamwoord', kort:'Mijn, jouw, zijn, haar, ons, hun: het zegt van wie iets is',
        uit:'<p>Een <b>bezittelijk voornaamwoord</b> zegt <b>van wie</b> iets is: mijn, jouw, uw, zijn, haar, ons, onze, jullie, hun.</p><p>De proef: <b>mijn fiets</b> is de fiets van mij. <b>Hun huis</b> is het huis van hen.</p>',
        wanneer:'een woord voor een zelfstandig naamwoord staat en vertelt wie de eigenaar is.',
        maak:function(R){
          return lijstProef(R, BEZ, 'bez', function(z, i, ok){
            var w = klein(z.w[i].t), lw = w.toLowerCase(), na = ''; for (var j = i + 1; j < z.w.length; j++) if (z.w[j].s === 'zn'){ na = z.w[j].t; break; }
            return janee('Zegt ' + q(w) + ' van wie iets is?', ok, ok ? q(lw + ' ' + na) + ' is: de ' + na + ' van ' + VAN[lw] + '.' : q(w) + ' zegt niet van wie iets is.', ok ? 'Ja: ' + lw + ' ' + na + ', van ' + VAN[lw] + '.' : 'Nee.');
          }, 'Welk woord is het bezittelijk voornaamwoord?', 'Zoek het <b>bezittelijk voornaamwoord</b>. Doe de proef met drie woorden.');
        } },
      { id:'ws-aanw', naam:'Aanwijzend voornaamwoord', kort:'Deze en die bij de-woorden, dit en dat bij het-woorden',
        uit:'<p>Met een <b>aanwijzend voornaamwoord</b> wijs je iets aan: deze, die, dit, dat.</p><p>Bij een <b>de-woord</b>: <b>deze</b> (dichtbij) en <b>die</b> (ver weg). Bij een <b>het-woord</b>: <b>dit</b> (dichtbij) en <b>dat</b> (ver weg).</p><p>Meervoud is altijd een de-woord: deze boeken, die boeken.</p>',
        wanneer:'je iets aanwijst en twijfelt tussen deze, die, dit en dat.',
        maak:function(R){
          var a = R.kies(AANW), de = a[2] !== 'het', dicht = !!a[3], ant = de ? (dicht ? 'deze' : 'die') : (dicht ? 'dit' : 'dat');
          return eindKeuze({ vraag:a[0], context:'Welk woord hoort op de puntjes: deze, die, dit of dat?',
            beeld:function(n){ return n >= 3 ? R.teken.zin([{ t:a[0].replace('…', a[0].indexOf('…') === 0 ? groot(ant) : ant), k:4, label:'aanw. vnw: ' + ant }]) : ''; },
            stappen:[
              vast('Is ' + q(a[1]) + ' een de-woord of een het-woord?', ['de-woord', 'het-woord'], de ? 'de-woord' : 'het-woord', a[2] === 'mv' ? q(a[1]) + ' is meervoud. Meervoud is altijd een de-woord.' : 'Zeg: ' + a[2] + ' ' + a[1] + '.'),
              vast('Is het dichtbij (hier) of ver weg (daar)?', ['dichtbij', 'ver weg'], dicht ? 'dichtbij' : 'ver weg', dicht ? 'In de zin staat hier.' : 'In de zin staat daar.'),
              vast('Welk woord hoort op de puntjes?', ['deze', 'die', 'dit', 'dat'], ant, (de ? 'De-woord' : 'Het-woord') + ', ' + (dicht ? 'dichtbij' : 'ver weg') + ': ' + ant + '.') ] });
        } },
      { id:'ws-betr', naam:'Betrekkelijk voornaamwoord: die, dat of wat', kort:'Die bij een de-woord, dat bij een het-woord, wat bij alles, iets en niets',
        uit:'<p>Een <b>betrekkelijk voornaamwoord</b> verwijst terug naar een woord ervoor en begint een bijzin.</p><p>Bij een <b>de-woord</b>: <b>die</b>. De fiets die ik kreeg.</p><p>Bij een <b>het-woord</b>: <b>dat</b>. Het boek dat ik lees.</p><p>Bij <b>alles, iets, niets</b>: <b>wat</b>. Alles wat je zegt.</p>',
        wanneer:'een bijzin iets vertelt over een woord ervoor.',
        maak:function(R){
          var b = R.kies(BETR), soort = b[2], ant = soort === 'al' ? 'wat' : soort === 'het' ? 'dat' : 'die';
          var woorden2 = b[0].replace(/[.,?…]/g, ' ').split(/\s+/).filter(function(w){ return w.length > 3 && w.toLowerCase() !== b[1]; });
          var SRT = { de:'een de-woord', mv:'een de-woord', het:'een het-woord', al:'alles, iets of niets' };
          return eindKeuze({ vraag:b[0], context:'Welk woord hoort op de puntjes: die, dat of wat?',
            beeld:function(n){ return n >= 3 ? R.teken.zin([{ t:b[0].replace('…', ant), k:4, label:'betr. vnw: ' + ant }]) : ''; },
            stappen:[
              keuze(R, 'Naar welk woord verwijst het woord op de puntjes?', b[1], woorden2, 'Kijk naar het woord vlak voor de puntjes: ' + q(b[1]) + '.', { max:3 }),
              vast('Wat voor woord is ' + q(b[1]) + '?', ['een de-woord', 'een het-woord', 'alles, iets of niets'], SRT[soort], soort === 'al' ? q(b[1]) + ' is een van de woorden alles, iets, niets.' : soort === 'mv' ? q(b[1]) + ' is meervoud: altijd een de-woord.' : 'Zeg: ' + soort + ' ' + b[1] + '.'),
              vast('Welk woord hoort op de puntjes?', ['die', 'dat', 'wat'], ant, soort === 'al' ? 'Bij alles, iets en niets: wat.' : soort === 'het' ? 'Bij een het-woord: dat.' : 'Bij een de-woord: die.') ] });
        } },
      { id:'ws-vrag', naam:'Vragend voornaamwoord', kort:'Wie, wat, welke of welk: kijk of er een zelfstandig naamwoord achter staat',
        uit:'<p>Met een <b>vragend voornaamwoord</b> stel je een vraag: wie, wat, welke, welk.</p><p>Staat er een zelfstandig naamwoord achter? Dan <b>welke</b> bij een de-woord of meervoud (welke fiets) en <b>welk</b> bij een het-woord (welk boek).</p><p>Staat er niets achter? Dan <b>wie</b> voor een persoon en <b>wat</b> voor iets anders.</p>',
        wanneer:'je een vraag maakt en twijfelt welk vraagwoord past.',
        maak:function(R){
          var v = R.kies(VRAG), s = v[1], na = v[0].split('… ')[1].split(' ')[0];
          var ant = s === 'p' ? 'wie' : s === 'd' ? 'wat' : s === 'het' ? 'welk' : 'welke', zn = s === 'de' || s === 'het' || s === 'mv';
          var st = [ janee('Staat er direct na de puntjes een zelfstandig naamwoord?', zn, zn ? q(na) + ' is een zelfstandig naamwoord.' : q(na) + ' is geen zelfstandig naamwoord.') ];
          if (zn) st.push(vast('Is ' + q(na) + ' een de-woord (of meervoud) of een het-woord?', ['de-woord of meervoud', 'het-woord'], s === 'het' ? 'het-woord' : 'de-woord of meervoud', s === 'mv' ? q(na) + ' is meervoud.' : 'Zeg: ' + s + ' ' + na + '.'));
          else st.push(vast('Vraag je naar een persoon of naar iets anders?', ['een persoon', 'iets anders'], s === 'p' ? 'een persoon' : 'iets anders', s === 'p' ? 'Het antwoord is een naam of een persoon.' : 'Het antwoord is een ding of iets wat gebeurt.'));
          st.push(vast('Welk woord hoort op de puntjes?', ['wie', 'wat', 'welke', 'welk'], ant, s === 'p' ? 'Persoon: wie.' : s === 'd' ? 'Iets anders: wat.' : s === 'het' ? 'Het-woord: welk.' : 'De-woord of meervoud: welke.'));
          return eindKeuze({ vraag:v[0], context:'Welk vraagwoord hoort op de puntjes?',
            beeld:function(n){ return n >= 3 ? R.teken.zin([{ t:v[0].replace('…', v[0].indexOf('…') === 0 ? groot(ant) : ant), k:4, label:'vragend vnw: ' + ant }]) : ''; },
            stappen:st });
        } },
      { id:'ws-bw', naam:'Bijwoord', kort:'Het zegt iets over een werkwoord of een bijvoeglijk naamwoord: hard, heel, gisteren',
        uit:'<p>Een <b>bijwoord</b> zegt iets over een <b>werkwoord</b> (hij rent <b>hard</b>), over een <b>bijvoeglijk naamwoord</b> (een <b>heel</b> grote hond) of over wanneer iets gebeurt (<b>gisteren</b>).</p><p>Een bijwoord zegt nooit iets over een zelfstandig naamwoord. Dat doet een bijvoeglijk naamwoord.</p><p>Een bijwoord krijgt nooit een -e erachter.</p>',
        wanneer:'een woord vertelt hoe, wanneer, waar of hoe erg.',
        maak:function(R){
          var z = woorden(R.kies(BW)), ti = -1, bi = -1;
          z.w.forEach(function(w, i){ if (w.s === 'bw') ti = i; });
          z.w.forEach(function(w, i){ if (bi < 0 && w.t === z.w[ti].bij && i !== ti) bi = i; });
          var fout = [], gz = {};
          z.w.forEach(function(w, i){ var l = w.t.toLowerCase(); if (i !== ti && (w.s === 'zn' || w.s === 'ww' || w.s === 'bn') && !gz[l]){ gz[l] = 1; fout.push(w.t); } });
          var bw = z.w[ti].t, bij = z.w[bi], soort = bij.s === 'ww' ? 'een werkwoord' : 'een bijvoeglijk naamwoord';
          var zn = z.w.filter(function(w){ return w.s === 'zn'; }).map(function(w){ return w.t; });
          return zelfKeuze({ vraag:woordZin(z), context:'Zoek het <b>bijwoord</b>.',
            beeld:function(n){ var m = {}; if (n >= 1) m[ti] = { k:3, label:'bijwoord' }; if (n >= 2) m[bi] = { k:bij.s === 'ww' ? 1 : 3, label:bij.s === 'ww' ? 'werkwoord' : 'bijv. nw' }; return woordBeeld(R, z, m); },
            stappen:[
              keuze(R, 'Welk woord is het bijwoord? Het zegt hoe, wanneer, waar of hoe erg.', bw, fout, q(bw) + ' vertelt ' + (/gisteren|morgen|vandaag|straks|vaak|altijd|nooit/.test(bw) ? 'wanneer of hoe vaak' : /erg|heel|zeer|vreselijk|behoorlijk|enorm/.test(bw) ? 'hoe erg' : 'hoe') + '.', { max:3 }),
              keuze(R, 'Over welk woord zegt ' + q(bw) + ' iets?', bij.t, zn.concat(fout.filter(function(w){ return w !== bij.t; })), q(bw + ' ' + bij.t) + ' of ' + q(bij.t + ' ' + bw) + ': het hoort bij ' + q(bij.t) + '.', { max:3 }),
              vast('Wat voor woord is ' + q(bij.t) + '?', ['een werkwoord', 'een bijvoeglijk naamwoord', 'een zelfstandig naamwoord'], soort, soort === 'een werkwoord' ? 'Zet er ik voor: dat kan.' : 'Een ' + bij.x + ' ding: het zegt hoe iets is.') ] }, 0);
        } },
      { id:'ws-vw', naam:'Voegwoord', kort:'En, maar, want, omdat, als: het verbindt zinnen of woorden',
        uit:'<p>Een <b>voegwoord</b> verbindt twee zinnen of twee woorden: <b>en, maar, want, of, dus, omdat, als, dat, terwijl, hoewel</b>.</p><p>Ik blijf thuis <b>omdat</b> ik ziek ben. Thee <b>of</b> koffie.</p><p>De proef: verbindt het woord twee stukken die je ook los kunt zeggen?</p>',
        wanneer:'je twee zinnen aan elkaar wilt maken, of een lange zin wilt begrijpen.',
        maak:function(R){
          return lijstProef(R, VW, 'vw', function(z, i, ok){
            var w = klein(z.w[i].t);
            return janee('Verbindt ' + q(w) + ' twee zinnen of twee woorden?', ok, ok ? 'Wat ervoor staat en wat erna staat, wordt door ' + q(w) + ' aan elkaar gemaakt.' : q(w) + ' verbindt niets: het hoort bij één stuk.', ok ? 'Ja.' : 'Nee.');
          }, 'Welk woord is het voegwoord?', 'Zoek het <b>voegwoord</b>. Doe de proef met drie woorden.');
        } }
    ] });

  /* ================= 6. samengestelde zinnen ================= */
  /* [zin, voegwoord, bijzin of '', [persoonsvormen]] */
  var SAM = [
    ['Ik blijf thuis omdat ik ziek ben.', 'omdat', 'omdat ik ziek ben', ['blijf', 'ben']],
    ['Als het regent, blijven we binnen.', 'als', 'Als het regent', ['regent', 'blijven']],
    ['Sara leest een boek en Tom speelt een spel.', 'en', '', ['leest', 'speelt']],
    ['Het regent, maar wij gaan toch naar buiten.', 'maar', '', ['regent', 'gaan']],
    ['Ik neem een jas mee, want het is koud.', 'want', '', ['neem', 'is']],
    ['Ik weet dat jij gelijk hebt.', 'dat', 'dat jij gelijk hebt', ['weet', 'hebt']],
    ['Tom was moe, dus hij ging vroeg slapen.', 'dus', '', ['was', 'ging']],
    ['Terwijl mama kookt, dekken wij de tafel.', 'terwijl', 'Terwijl mama kookt', ['kookt', 'dekken']],
    ['Hoewel het koud was, zwommen de kinderen in zee.', 'hoewel', 'Hoewel het koud was', ['was', 'zwommen']],
    ['We gaan pas weg als iedereen klaar is.', 'als', 'als iedereen klaar is', ['gaan', 'is']],
    ['Daan lacht omdat de film grappig is.', 'omdat', 'omdat de film grappig is', ['lacht', 'is']],
    ['Ik wilde komen, maar ik had geen tijd.', 'maar', '', ['wilde', 'had']],
    ['Mijn broer speelt gitaar en mijn zus zingt.', 'en', '', ['speelt', 'zingt']],
    ['Voordat je eet, moet je je handen wassen.', 'voordat', 'Voordat je eet', ['eet', 'moet']],
    ['Ze bleef binnen, want het onweerde.', 'want', '', ['bleef', 'onweerde']],
    ['Ik hoop dat je snel beter wordt.', 'dat', 'dat je snel beter wordt', ['hoop', 'wordt']],
    ['Toen de bel ging, renden alle kinderen naar buiten.', 'toen', 'Toen de bel ging', ['ging', 'renden']],
    ['Nadat de film afgelopen was, gingen we naar huis.', 'nadat', 'Nadat de film afgelopen was', ['was', 'gingen']],
    ['Ik oefen elke dag zodat ik beter word.', 'zodat', 'zodat ik beter word', ['oefen', 'word']],
    ['Het was laat, dus we namen een taxi.', 'dus', '', ['was', 'namen']],
    ['Lisa wint vaak omdat ze goed traint.', 'omdat', 'omdat ze goed traint', ['wint', 'traint']],
    ['De zon scheen en de vogels floten.', 'en', '', ['scheen', 'floten']],
    ['Als je klaar bent, mag je naar huis.', 'als', 'Als je klaar bent', ['bent', 'mag']],
    ['Wil je thee, of heb je liever koffie?', 'of', '', ['Wil', 'heb']],
    ['Hij rende hard, maar hij miste de bus.', 'maar', '', ['rende', 'miste']],
    ['Omdat het stormde, ging de wedstrijd niet door.', 'omdat', 'Omdat het stormde', ['stormde', 'ging']]
  ];
  var NEVEN = ['en', 'maar', 'want', 'of', 'dus'];
  function samWoorden(s){ return s[0].replace(/[.,?!]/g, '').split(' '); }
  function zonderLeestekens(t){ return t.replace(/[.,?!]/g, ''); }
  var REDE = [
    ['Sara zegt: "Ik ben moe."', 'Sara zegt dat ze moe is.', 'dat', ['ik', 'ze'], ['Sara zegt dat ik moe ben.', 'Sara zegt dat ze is moe.']],
    ['Tom zegt: "Ik heb honger."', 'Tom zegt dat hij honger heeft.', 'dat', ['ik', 'hij'], ['Tom zegt dat ik honger heb.', 'Tom zegt dat hij heeft honger.']],
    ['Lisa vraagt aan Tom: "Kom jij morgen?"', 'Lisa vraagt aan Tom of hij morgen komt.', 'of', ['jij', 'hij'], ['Lisa vraagt aan Tom of jij morgen komt.', 'Lisa vraagt aan Tom of hij komt morgen.']],
    ['De juf zegt: "Ik ga de toetsen nakijken."', 'De juf zegt dat ze de toetsen gaat nakijken.', 'dat', ['ik', 'ze'], ['De juf zegt dat ik de toetsen ga nakijken.', 'De juf zegt dat ze gaat de toetsen nakijken.']],
    ['Daan vraagt: "Waar is mijn jas?"', 'Daan vraagt waar zijn jas is.', 'waar', ['mijn', 'zijn'], ['Daan vraagt waar mijn jas is.', 'Daan vraagt waar is zijn jas.']],
    ['Mijn moeder zegt: "Ik kook vanavond."', 'Mijn moeder zegt dat ze vanavond kookt.', 'dat', ['ik', 'ze'], ['Mijn moeder zegt dat ik vanavond kook.', 'Mijn moeder zegt dat ze kookt vanavond.']],
    ['Opa vraagt aan de kinderen: "Hebben jullie zin in ijs?"', 'Opa vraagt aan de kinderen of ze zin in ijs hebben.', 'of', ['jullie', 'ze'], ['Opa vraagt aan de kinderen of jullie zin in ijs hebben.', 'Opa vraagt aan de kinderen dat ze zin in ijs hebben.']],
    ['Emma zegt: "Ik woon in Utrecht."', 'Emma zegt dat ze in Utrecht woont.', 'dat', ['ik', 'ze'], ['Emma zegt dat ik in Utrecht woon.', 'Emma zegt dat ze woont in Utrecht.']],
    ['Noah vraagt: "Hoe laat is het?"', 'Noah vraagt hoe laat het is.', 'hoe', null, ['Noah vraagt hoe laat is het.', 'Noah vraagt of hoe laat het is.']],
    ['De trainer zegt: "Wij gaan winnen."', 'De trainer zegt dat ze gaan winnen.', 'dat', ['wij', 'ze'], ['De trainer zegt dat wij gaan winnen.', 'De trainer zegt of ze gaan winnen.']],
    ['Fatima vraagt aan Sam: "Heb jij mijn pen?"', 'Fatima vraagt aan Sam of hij haar pen heeft.', 'of', ['jij', 'hij'], ['Fatima vraagt aan Sam of jij mijn pen hebt.', 'Fatima vraagt aan Sam dat hij haar pen heeft.']],
    ['Milan zegt: "Ik heb mijn huiswerk gemaakt."', 'Milan zegt dat hij zijn huiswerk heeft gemaakt.', 'dat', ['ik', 'hij'], ['Milan zegt dat ik mijn huiswerk heb gemaakt.', 'Milan zegt dat hij heeft zijn huiswerk gemaakt.']],
    ['Oma vraagt: "Wie heeft er gebeld?"', 'Oma vraagt wie er heeft gebeld.', 'wie', null, ['Oma vraagt wie heeft er gebeld.', 'Oma vraagt of wie er heeft gebeld.']],
    ['Yara zegt: "Ik vind de film saai."', 'Yara zegt dat ze de film saai vindt.', 'dat', ['ik', 'ze'], ['Yara zegt dat ik de film saai vind.', 'Yara zegt dat ze vindt de film saai.']],
    ['De buurman vraagt: "Wanneer komt de bus?"', 'De buurman vraagt wanneer de bus komt.', 'wanneer', null, ['De buurman vraagt wanneer komt de bus.', 'De buurman vraagt dat de bus komt.']],
    ['Lotte vraagt aan haar vader: "Mag ik naar het feest?"', 'Lotte vraagt aan haar vader of ze naar het feest mag.', 'of', ['ik', 'ze'], ['Lotte vraagt aan haar vader of ik naar het feest mag.', 'Lotte vraagt aan haar vader dat ze naar het feest mag.']],
    ['Bram zegt: "Ik ben jarig."', 'Bram zegt dat hij jarig is.', 'dat', ['ik', 'hij'], ['Bram zegt dat ik jarig ben.', 'Bram zegt dat hij is jarig.']],
    ['Iris vraagt aan Mo: "Waarom ben jij boos?"', 'Iris vraagt aan Mo waarom hij boos is.', 'waarom', ['jij', 'hij'], ['Iris vraagt aan Mo waarom jij boos bent.', 'Iris vraagt aan Mo waarom is hij boos.']],
    ['Mijn zus zegt: "Ik heb een nieuwe telefoon."', 'Mijn zus zegt dat ze een nieuwe telefoon heeft.', 'dat', ['ik', 'ze'], ['Mijn zus zegt dat ik een nieuwe telefoon heb.', 'Mijn zus zegt dat ze heeft een nieuwe telefoon.']],
    ['De leraar vraagt aan de klas: "Zijn jullie klaar?"', 'De leraar vraagt aan de klas of ze klaar zijn.', 'of', ['jullie', 'ze'], ['De leraar vraagt aan de klas of jullie klaar zijn.', 'De leraar vraagt aan de klas dat ze klaar zijn.']]
  ];
  /* [zin, vorm van worden/zijn + voltooid deelwoord, passief, zin met door iemand (of null: staat er al)] */
  var AP = [
    ['De muis wordt door de kat gevangen.', 1, 1, null], ['Het huis wordt verkocht.', 1, 1, 'Het huis wordt door iemand verkocht.'],
    ['De brief is gisteren verstuurd.', 1, 1, 'De brief is gisteren door iemand verstuurd.'], ['De wedstrijd werd door Ajax gewonnen.', 1, 1, null],
    ['Mijn fiets is gestolen.', 1, 1, 'Mijn fiets is door iemand gestolen.'], ['De toetsen worden morgen nagekeken.', 1, 1, 'De toetsen worden morgen door iemand nagekeken.'],
    ['Het raam werd door een bal gebroken.', 1, 1, null], ['Het eten wordt door papa gekookt.', 1, 1, null],
    ['De leerlingen werden door de juf geroepen.', 1, 1, null], ['Deze brug is in 1950 gebouwd.', 1, 1, 'Deze brug is in 1950 door iemand gebouwd.'],
    ['De kat vangt de muis.', 0, 0, 'De kat vangt door iemand de muis.'], ['Mijn opa is gevallen.', 1, 0, 'Mijn opa is door iemand gevallen.'],
    ['Het water wordt koud.', 0, 0, 'Het water wordt door iemand koud.'], ['Ik heb een boek gelezen.', 0, 0, 'Ik heb door iemand een boek gelezen.'],
    ['De trein is vertrokken.', 1, 0, 'De trein is door iemand vertrokken.'], ['Papa kookt het eten.', 0, 0, 'Papa kookt door iemand het eten.'],
    ['De kinderen zijn naar huis gegaan.', 1, 0, 'De kinderen zijn door iemand naar huis gegaan.'], ['Mijn broer wordt later dokter.', 0, 0, 'Mijn broer wordt later door iemand dokter.'],
    ['Ajax won de wedstrijd.', 0, 0, 'Ajax won door iemand de wedstrijd.'], ['De juf heeft de leerlingen geroepen.', 0, 0, 'De juf heeft door iemand de leerlingen geroepen.']
  ];
  /* [actief, lv, vorm van worden, voltooid deelwoord, passief, [fout, fout]] */
  var OMZ = [
    ['De kat vangt de muis.', 'de muis', 'wordt', 'gevangen', 'De muis wordt door de kat gevangen.', ['De kat wordt door de muis gevangen.', 'De muis worden door de kat gevangen.']],
    ['Papa kookt het eten.', 'het eten', 'wordt', 'gekookt', 'Het eten wordt door papa gekookt.', ['Papa wordt door het eten gekookt.', 'Het eten worden door papa gekookt.']],
    ['De juf roept de leerlingen.', 'de leerlingen', 'worden', 'geroepen', 'De leerlingen worden door de juf geroepen.', ['De juf wordt door de leerlingen geroepen.', 'De leerlingen wordt door de juf geroepen.']],
    ['Ajax wint de wedstrijd.', 'de wedstrijd', 'wordt', 'gewonnen', 'De wedstrijd wordt door Ajax gewonnen.', ['Ajax wordt door de wedstrijd gewonnen.', 'De wedstrijd werd door Ajax gewonnen.']],
    ['De buurman maait het gras.', 'het gras', 'wordt', 'gemaaid', 'Het gras wordt door de buurman gemaaid.', ['De buurman wordt door het gras gemaaid.', 'Het gras worden door de buurman gemaaid.']],
    ['De bakker bakt het brood.', 'het brood', 'wordt', 'gebakken', 'Het brood wordt door de bakker gebakken.', ['De bakker wordt door het brood gebakken.', 'Het brood werd door de bakker gebakken.']],
    ['De leraar kijkt de toetsen na.', 'de toetsen', 'worden', 'nagekeken', 'De toetsen worden door de leraar nagekeken.', ['De leraar wordt door de toetsen nagekeken.', 'De toetsen wordt door de leraar nagekeken.']],
    ['De hond bijt de postbode.', 'de postbode', 'wordt', 'gebeten', 'De postbode wordt door de hond gebeten.', ['De hond wordt door de postbode gebeten.', 'De postbode worden door de hond gebeten.']],
    ['Mijn moeder schrijft de brief.', 'de brief', 'wordt', 'geschreven', 'De brief wordt door mijn moeder geschreven.', ['Mijn moeder wordt door de brief geschreven.', 'De brief worden door mijn moeder geschreven.']],
    ['De kinderen versieren de klas.', 'de klas', 'wordt', 'versierd', 'De klas wordt door de kinderen versierd.', ['De kinderen worden door de klas versierd.', 'De klas worden door de kinderen versierd.']],
    ['De politie zoekt de dief.', 'de dief', 'wordt', 'gezocht', 'De dief wordt door de politie gezocht.', ['De politie wordt door de dief gezocht.', 'De dief werd door de politie gezocht.']],
    ['Opa vertelt het verhaal.', 'het verhaal', 'wordt', 'verteld', 'Het verhaal wordt door opa verteld.', ['Opa wordt door het verhaal verteld.', 'Het verhaal worden door opa verteld.']],
    ['Lisa leest de boeken.', 'de boeken', 'worden', 'gelezen', 'De boeken worden door Lisa gelezen.', ['Lisa wordt door de boeken gelezen.', 'De boeken wordt door Lisa gelezen.']],
    ['De boer melkt de koeien.', 'de koeien', 'worden', 'gemolken', 'De koeien worden door de boer gemolken.', ['De boer wordt door de koeien gemolken.', 'De koeien wordt door de boer gemolken.']],
    ['De storm vernielt het dak.', 'het dak', 'wordt', 'vernield', 'Het dak wordt door de storm vernield.', ['De storm wordt door het dak vernield.', 'Het dak worden door de storm vernield.']],
    ['De kat ving de muis.', 'de muis', 'werd', 'gevangen', 'De muis werd door de kat gevangen.', ['De kat werd door de muis gevangen.', 'De muis wordt door de kat gevangen.']],
    ['Ajax won de beker.', 'de beker', 'werd', 'gewonnen', 'De beker werd door Ajax gewonnen.', ['Ajax werd door de beker gewonnen.', 'De beker wordt door Ajax gewonnen.']],
    ['De juf riep de kinderen.', 'de kinderen', 'werden', 'geroepen', 'De kinderen werden door de juf geroepen.', ['De juf werd door de kinderen geroepen.', 'De kinderen werd door de juf geroepen.']],
    ['De leerlingen maakten de opdracht.', 'de opdracht', 'werd', 'gemaakt', 'De opdracht werd door de leerlingen gemaakt.', ['De leerlingen werden door de opdracht gemaakt.', 'De opdracht werden door de leerlingen gemaakt.']],
    ['De vogels eten de zaadjes.', 'de zaadjes', 'worden', 'gegeten', 'De zaadjes worden door de vogels gegeten.', ['De vogels worden door de zaadjes gegeten.', 'De zaadjes wordt door de vogels gegeten.']]
  ];

  G.push({ groep:{ id:'gram-zin', niveau:'2F', domein:'grammatica', naam:'Samengestelde zinnen',
      uit:'Veel zinnen bestaan uit twee of meer zinnen samen. Je leert hoofdzin en bijzin herkennen, de komma zetten, iemands woorden navertellen en een zin omdraaien.' },
    doelen:[
      { id:'gram-hzbz', naam:'Hoofdzin en bijzin', kort:'In de bijzin staat de persoonsvorm achteraan',
        uit:'<p>Een <b>bijzin</b> kan niet alleen staan. Hij begint vaak met een woord als omdat, als, dat, terwijl of hoewel.</p><p>Je herkent de bijzin aan de <b>persoonsvorm</b>: die staat <b>achteraan</b>. Ik blijf thuis omdat ik ziek <b>ben</b>.</p><p>De <b>hoofdzin</b> is het deel dat wel alleen kan staan: Ik blijf thuis.</p>',
        wanneer:'een zin twee persoonsvormen heeft.',
        maak:function(R){
          var s = R.kies(SAM.filter(function(x){ return x[2]; })), bz = s[2], vw = s[1];
          var pvb = s[3].filter(function(p){ return (' ' + bz + ' ').indexOf(' ' + p + ' ') >= 0; })[0];
          var hz = zonderLeestekens(s[0].replace(bz, '')).replace(/\s+/g, ' ').trim();
          var w = samWoorden(s).filter(function(x){ return x.toLowerCase() !== vw && x.length > 3 && s[3].indexOf(x) < 0; });
          return eindKeuze({ vraag:s[0], context:'Welk deel is de <b>bijzin</b>?',
            beeld:function(n){ return n >= 3 ? R.teken.zin(s[0].indexOf(bz) === 0 ? [{ t:bz, k:4, label:'bijzin' }, { t:hz, k:2, label:'hoofdzin' }] : [{ t:hz, k:2, label:'hoofdzin' }, { t:bz, k:4, label:'bijzin' }]) : ''; },
            stappen:[
              keuze(R, 'Welk woord verbindt de twee delen?', groot(vw) === bz.split(' ')[0] ? groot(vw) : vw, w, 'Het is een voegwoord: ' + q(vw) + '.', { max:3 }),
              vast('Waar staat de persoonsvorm in het deel ' + q(bz) + '?', ['vooraan', 'achteraan'], 'achteraan', 'De persoonsvorm is ' + q(pvb) + '. Die staat aan het eind.'),
              keuze(R, 'Welk deel is de bijzin?', bz, [hz], 'De bijzin is het deel waarin de persoonsvorm achteraan staat: ' + q(bz) + '.') ] });
        } },
      { id:'gram-nevon', naam:'Nevenschikking en onderschikking', kort:'En, maar, want, of, dus: twee hoofdzinnen. Omdat, als, dat, terwijl: een bijzin',
        uit:'<p>Bij <b>nevenschikking</b> zet je twee hoofdzinnen naast elkaar. De voegwoorden zijn: <b>en, maar, want, of, dus</b>. Na het voegwoord staat de persoonsvorm gewoon niet achteraan: ..., want het <b>is</b> koud.</p><p>Bij <b>onderschikking</b> maak je een bijzin. Voegwoorden zijn bijvoorbeeld <b>omdat, als, dat, terwijl, hoewel, toen</b>. De persoonsvorm staat achteraan: ..., omdat het koud <b>is</b>.</p>',
        wanneer:'je wilt weten of er een hoofdzin of een bijzin volgt.',
        maak:function(R){
          var s = R.kies(SAM), vw = s[1], neven = NEVEN.indexOf(vw) >= 0;
          var w = samWoorden(s).filter(function(x){ return x.toLowerCase() !== vw && x.length > 3 && s[3].indexOf(x) < 0; });
          var deel = s[2] || zonderLeestekens(s[0].slice(s[0].indexOf(' ' + vw + ' ') + 1));
          var vwT = samWoorden(s).filter(function(x){ return x.toLowerCase() === vw; })[0];
          return eindKeuze({ vraag:s[0], context:'Is het voegwoord <b>nevenschikkend</b> of <b>onderschikkend</b>?',
            beeld:function(n){ return n >= 3 ? R.teken.zin([{ t:vw, k:neven ? 2 : 4, label:neven ? 'nevenschikkend' : 'onderschikkend' }]) : ''; },
            stappen:[
              keuze(R, 'Welk woord is het voegwoord?', vwT, w, 'Het woord dat de twee zinnen verbindt: ' + q(vw) + '.', { max:3 }),
              vast('Waar staat de persoonsvorm in ' + q(deel) + '?', ['niet achteraan', 'achteraan'], neven ? 'niet achteraan' : 'achteraan',
                'Zoek de persoonsvorm in dat deel. ' + (neven ? 'Hij staat niet aan het eind: het is een hoofdzin.' : 'Hij staat aan het eind: het is een bijzin.')),
              vast('Is ' + q(vw) + ' nevenschikkend of onderschikkend?', ['nevenschikkend', 'onderschikkend'], neven ? 'nevenschikkend' : 'onderschikkend',
                neven ? 'Twee hoofdzinnen naast elkaar: nevenschikkend.' : 'Een bijzin: onderschikkend.') ] });
        } },
      { id:'gram-komma', naam:'De komma tussen twee persoonsvormen', kort:'Staan twee zinnen aan elkaar? Zet de komma tussen de twee persoonsvormen, waar de zinnen elkaar raken',
        uit:'<p>Een zin met <b>twee persoonsvormen</b> bestaat uit twee zinnen. Vaak zet je daar een <b>komma</b> tussen.</p><p>Begint de zin met een bijzin? Dan komt de komma tussen de twee persoonsvormen: Als het regent<b>,</b> blijven we binnen.</p><p>Ook voor <b>maar</b>, <b>want</b> en <b>dus</b> komt een komma: Het regent<b>,</b> maar we gaan toch.</p>',
        wanneer:'je een lange zin schrijft met twee werkwoorden die bij verschillende zinnen horen.',
        maak:function(R){
          var s = R.kies(SAM.filter(function(x){ return x[0].indexOf(',') > 0 && x[1] !== 'of'; }));
          var w = s[0].replace(/[.?!]$/, '').split(' '), ki = -1;
          w.forEach(function(x, i){ if (/,$/.test(x)) ki = i; });
          var kaal = w.map(function(x){ return x.replace(',', ''); }), eind = s[0].slice(-1);
          function met(i){ return kaal.map(function(x, j){ return x + (j === i ? ',' : ''); }).join(' ') + eind; }
          var fout = []; [ki - 1, ki + 1, ki + 2].forEach(function(i){ if (i >= 0 && i < kaal.length - 1 && i !== ki) fout.push(met(i)); });
          var pv = s[3][0] + ' en ' + s[3][1], ander = kaal.filter(function(x){ return s[3].indexOf(x) < 0 && x.length > 3 && x.toLowerCase() !== s[1]; });
          return eindKeuze({ vraag:kaal.join(' ') + eind, context:'Waar komt de <b>komma</b>?',
            beeld:function(n){ return n >= 2 ? R.teken.zin([{ t:met(ki), k:2, label:'met komma' }]) : ''; },
            stappen:[
              keuze(R, 'Welke twee persoonsvormen staan er in de zin?', pv, [s[3][0] + ' en ' + R.kies(ander), R.kies(ander) + ' en ' + s[3][1]], 'Verander de tijd of maak er een vraag van. De persoonsvormen zijn ' + q(pv) + '.', { max:3 }),
              keuze(R, 'Waar komt de komma?', met(ki), fout, 'De komma komt waar de eerste zin ophoudt, na ' + q(kaal[ki]) + '.', { max:3 }) ] });
        } },
      { id:'gram-enkel', naam:'Enkelvoudig of samengesteld', kort:'Tel de persoonsvormen: één is enkelvoudig, twee of meer is samengesteld',
        uit:'<p>Een <b>enkelvoudige zin</b> heeft één persoonsvorm. Een <b>samengestelde zin</b> heeft er twee of meer.</p><p>Let op: tel alleen de persoonsvormen, niet alle werkwoorden. De kinderen <b>hebben</b> buiten gespeeld: één persoonsvorm, dus enkelvoudig.</p>',
        wanneer:'je moet zeggen wat voor zin het is.',
        maak:function(R){
          var sam = R.heel(0, 1) === 1, zin, pvs, ander;
          if (sam){ var s = R.kies(SAM); zin = s[0]; pvs = s[3]; ander = samWoorden(s).filter(function(x){ return pvs.indexOf(x) < 0 && x.length > 3; }); }
          else { var z = zdMet(R, function(z){ return heeft(z, 'wg'); }); zin = zinVan(z); pvs = [deel(z, 'pv').t]; ander = alle(z, 'wg').map(function(x){ return x.t; }); }
          var goed = pvs.join(' en '), fout = sam ? [pvs[0], pvs[0] + ' en ' + R.kies(ander)] : [pvs[0] + ' en ' + ander[0], ander[0]];
          return eindKeuze({ vraag:zin, context:'Is de zin <b>enkelvoudig</b> of <b>samengesteld</b>?',
            beeld:function(n){ return n >= 1 ? R.teken.zin(pvs.map(function(p){ return { t:p, k:1, label:'pv' }; })) : ''; },
            stappen:[
              keuze(R, 'Welke woorden zijn persoonsvormen?', goed, fout, sam ? 'Er zijn twee zinnen, elk met een persoonsvorm: ' + q(goed) + '.' : 'Maak er een vraag van: alleen ' + q(pvs[0]) + ' springt naar voren. ' + q(ander[0]) + ' is een ander werkwoord.', { max:3 }),
              { tekst:'Hoeveel persoonsvormen zijn het?', antwoord:String(pvs.length), hint:'Tel: ' + goed + '.' },
              vast('Is de zin enkelvoudig of samengesteld?', ['enkelvoudig', 'samengesteld'], sam ? 'samengesteld' : 'enkelvoudig', sam ? 'Twee persoonsvormen: samengesteld.' : 'Eén persoonsvorm: enkelvoudig.') ] });
        } },
      { id:'gram-rede', naam:'Directe rede wordt indirecte rede', kort:'Vertel na wat iemand zei: met dat, of of een vraagwoord, en verander ik en jij',
        uit:'<p>In de <b>directe rede</b> staan iemands woorden letterlijk tussen aanhalingstekens: Sara zegt: "Ik ben moe."</p><p>In de <b>indirecte rede</b> vertel je het na: Sara zegt <b>dat ze</b> moe <b>is</b>.</p><p>Drie dingen veranderen: je begint met <b>dat</b> (een mededeling), <b>of</b> (een ja/nee-vraag) of het <b>vraagwoord</b>. Ik en jij worden hij of zij. En de persoonsvorm gaat <b>achteraan</b>, want het is nu een bijzin.</p>',
        wanneer:'je in een verslag of verhaal vertelt wat iemand zei.',
        maak:function(R){
          var r = R.kies(REDE), vw = r[2], vraagw = vw !== 'dat' && vw !== 'of';
          var st = [ keuze(R, 'Met welk woord begint het naverteld deel?', vw, ['dat', 'of', 'wat'], vw === 'dat' ? 'Het is een mededeling: dat.' : vw === 'of' ? 'Het is een vraag met ja of nee als antwoord: of.' : 'Het is een vraag met een vraagwoord: dat vraagwoord blijft, ' + q(vw) + '.', { max:3 }) ];
          if (r[3]) st.push(keuze(R, q(r[3][0]) + ' wordt in de indirecte rede:', r[3][1], [r[3][0], r[3][1] === 'hij' ? 'ze' : 'hij', 'wij'].filter(function(x){ return x !== r[3][1]; }), 'Je vertelt het nu over iemand anders: ' + q(r[3][1]) + '.', { max:3 }));
          st.push(keuze(R, 'Welke zin is goed?', r[1], r[4], 'Begin met ' + q(vw) + ', verander ' + (r[3] ? q(r[3][0]) : 'niets aan de personen') + ' en zet de persoonsvorm achteraan.', { max:3 }));
          return eindKeuze({ vraag:r[0], context:'Zet de zin in de <b>indirecte rede</b>.',
            beeld:function(n){ return n >= st.length ? R.teken.zin([{ t:r[1], k:2, label:'indirecte rede' }]) : ''; },
            stappen:st });
        } },
      { id:'gram-actpas', naam:'Actief of passief: de door-proef', kort:'Kun je er door iemand bij zetten, als degene die het doet? Dan is de zin passief',
        uit:'<p>In een <b>actieve</b> zin doet het onderwerp zelf iets: de kat vangt de muis.</p><p>In een <b>passieve</b> zin ondergaat het onderwerp iets: de muis wordt gevangen. Er staat een vorm van <b>worden</b> of <b>zijn</b> met een voltooid deelwoord.</p><p>De proef: kun je er <b>door iemand</b> bij zetten, als degene die het doet? De muis wordt door de kat gevangen: ja, dus passief. Opa is gevallen: opa is door iemand gevallen? Nee, opa viel zelf. Actief dus.</p>',
        wanneer:'je ziet een vorm van worden of zijn met een voltooid deelwoord.',
        maak:function(R){
          var a = R.kies(AP), wz = !!a[1], pas = !!a[2];
          var st = [ janee('Staat er een vorm van worden of zijn met een voltooid deelwoord (zoals gevangen, gestolen)?', wz, wz ? 'Ja, kijk naar de werkwoorden.' : 'Nee: er staat geen worden of zijn met een voltooid deelwoord.') ];
          st.push(a[3] ? janee('Kun je er ' + q('door iemand') + ' bij zetten, als degene die het doet? ' + q(a[3]), pas, pas ? 'Ja: iemand doet het, en dat kun je met door erbij zeggen.' : 'Nee: zo zeg je het niet, of het betekent iets anders.')
                       : janee('Staat er al ' + q('door') + ' met degene die het doet?', true, 'Ja: ' + q('door ' + a[0].match(/door (.*) \S+\.$/)[1]) + '.'));
          st.push(vast('Is de zin actief of passief?', ['actief', 'passief'], pas ? 'passief' : 'actief', pas ? 'De door-proef lukt: passief.' : 'De door-proef lukt niet: actief.'));
          return eindKeuze({ vraag:a[0], context:'Is de zin <b>actief</b> of <b>passief</b>?',
            beeld:function(n){ return n >= 3 ? R.teken.zin([{ t:a[0], k:pas ? 4 : 2, label:pas ? 'passief' : 'actief' }]) : ''; },
            stappen:st });
        } },
      { id:'gram-pas', naam:'Actief omzetten naar passief', kort:'Het lijdend voorwerp wordt het onderwerp, met worden en een voltooid deelwoord',
        uit:'<p>Zo maak je van een actieve zin een <b>passieve</b> zin:</p><p>1 Het <b>lijdend voorwerp</b> wordt het onderwerp. 2 Je gebruikt <b>worden</b> (wordt, worden, werd, werden). 3 Het werkwoord wordt een <b>voltooid deelwoord</b>. 4 Wie het deed, komt erbij met <b>door</b>.</p><p>De kat vangt de muis. De muis <b>wordt door de kat gevangen</b>.</p>',
        wanneer:'je wilt dat de zin over het lijdend voorwerp gaat.',
        maak:function(R){
          var o = R.kies(OMZ), ow = o[4].match(/door (.*) \S+\.$/)[1], verl = /werd/.test(o[2]);
          return eindKeuze({ vraag:o[0], context:'Maak de zin <b>passief</b>.',
            beeld:function(n){ return n >= 4 ? R.teken.zin([{ t:o[4], k:4, label:'passief' }]) : ''; },
            stappen:[
              keuze(R, 'Wat is het lijdend voorwerp? Dat wordt het nieuwe onderwerp.', o[1], [klein(ow)], 'Wie of wat ondergaat het? ' + groot(o[1]) + '.'),
              vast('Welke vorm van worden past bij ' + q(o[1]) + '?', ['wordt', 'worden', 'werd', 'werden'], o[2], (/en$/.test(o[2]) ? 'Meervoud' : 'Enkelvoud') + ', en de zin staat in ' + (verl ? 'het verleden' : 'het nu') + ': ' + o[2] + '.'),
              { tekst:'Wat is het voltooid deelwoord van het werkwoord in de zin?', antwoord:o[3], invoer:'tekst', hint:'Zeg: ze hebben het … Het begint met ' + q(o[3].slice(0, 3)) + '.' },
              keuze(R, 'Welke passieve zin is goed?', o[4], o[5], 'Het nieuwe onderwerp, dan ' + q(o[2]) + ', dan door ' + ow + ', en als laatste ' + q(o[3]) + '.', { max:3 }) ] });
        } }
    ] });

  /* ================= 7. lastige zinsdelen ================= */
  /* [zin, stuk, vraag met waar/wanneer/hoe, werkwoord met voorzetsel, 1 = voorzetselvoorwerp] */
  var VZV = [
    ['Ik wacht op de bus.', 'op de bus', 'Waar wacht ik?', 'wachten op', 1], ['Sara denkt aan haar oma.', 'aan haar oma', 'Waar denkt Sara?', 'denken aan', 1],
    ['Tom houdt van voetbal.', 'van voetbal', 'Waar houdt Tom?', 'houden van', 1], ['De juf zorgt voor de planten.', 'voor de planten', 'Waar zorgt de juf?', 'zorgen voor', 1],
    ['Wij praten over de vakantie.', 'over de vakantie', 'Waar praten wij?', 'praten over', 1], ['Mijn broer lijkt op mijn vader.', 'op mijn vader', 'Waar lijkt mijn broer?', 'lijken op', 1],
    ['Ik geloof in sprookjes.', 'in sprookjes', 'Waar geloof ik?', 'geloven in', 1], ['De hond luistert naar zijn baas.', 'naar zijn baas', 'Waar luistert de hond?', 'luisteren naar', 1],
    ['Fatima twijfelt aan haar antwoord.', 'aan haar antwoord', 'Waar twijfelt Fatima?', 'twijfelen aan', 1], ['Daan begint aan zijn huiswerk.', 'aan zijn huiswerk', 'Waar begint Daan?', 'beginnen aan', 1],
    ['Opa vertelt over de oorlog.', 'over de oorlog', 'Waar vertelt opa?', 'vertellen over', 1], ['Wij hopen op mooi weer.', 'op mooi weer', 'Wanneer hopen wij?', 'hopen op', 1],
    ['Hij zit op de bank.', 'op de bank', 'Waar zit hij?', 'zitten op', 0], ['Ik wacht bij de ingang.', 'bij de ingang', 'Waar wacht ik?', 'wachten bij', 0],
    ['Sara speelt in de tuin.', 'in de tuin', 'Waar speelt Sara?', 'spelen in', 0], ['Wij gaan na de les naar huis.', 'na de les', 'Wanneer gaan wij naar huis?', 'gaan na', 0],
    ['De kat slaapt onder het bed.', 'onder het bed', 'Waar slaapt de kat?', 'slapen onder', 0], ['Tom fietst door het park.', 'door het park', 'Waar fietst Tom?', 'fietsen door', 0],
    ['De juf praat met luide stem.', 'met luide stem', 'Hoe praat de juf?', 'praten met', 0], ['Mijn broer wacht op het station.', 'op het station', 'Waar wacht mijn broer?', 'wachten op', 0],
    ['Lisa leest in bed.', 'in bed', 'Waar leest Lisa?', 'lezen in', 0], ['Ze spelen om drie uur.', 'om drie uur', 'Wanneer spelen ze?', 'spelen om', 0],
    ['De vogel vliegt over het huis.', 'over het huis', 'Waar vliegt de vogel?', 'vliegen over', 0]
  ];
  /* [zin, persoonsvorm, stuk, 1 = koppelwerkwoord, zin met zijn] */
  var LVND = [
    ['Mijn zus wordt een goede arts.', 'wordt', 'een goede arts', 1, 'Mijn zus is een goede arts.'], ['Hij blijft mijn beste vriend.', 'blijft', 'mijn beste vriend', 1, 'Hij is mijn beste vriend.'],
    ['Die man lijkt een aardige buurman.', 'lijkt', 'een aardige buurman', 1, 'Die man is een aardige buurman.'], ['Tom werd kampioen.', 'werd', 'kampioen', 1, 'Tom was kampioen.'],
    ['Het bleek een grap.', 'bleek', 'een grap', 1, 'Het was een grap.'], ['Mijn hond heet Max.', 'heet', 'Max', 1, 'Mijn hond is Max.'],
    ['Lotte wordt later een bekende zangeres.', 'wordt', 'een bekende zangeres', 1, 'Lotte is later een bekende zangeres.'], ['Dat blijft een raadsel.', 'blijft', 'een raadsel', 1, 'Dat is een raadsel.'],
    ['Het werd een spannende wedstrijd.', 'werd', 'een spannende wedstrijd', 1, 'Het was een spannende wedstrijd.'], ['Mijn oom is een goede kok.', 'is', 'een goede kok', 1, ''],
    ['Mijn zus bezoekt een goede arts.', 'bezoekt', 'een goede arts', 0, 'Mijn zus is een goede arts.'], ['Hij helpt mijn beste vriend.', 'helpt', 'mijn beste vriend', 0, 'Hij is mijn beste vriend.'],
    ['Tom versloeg de kampioen.', 'versloeg', 'de kampioen', 0, 'Tom was de kampioen.'], ['Ik vertel een grap.', 'vertel', 'een grap', 0, 'Ik ben een grap.'],
    ['Mijn hond zoekt Max.', 'zoekt', 'Max', 0, 'Mijn hond is Max.'], ['Zij kent de nieuwe juf.', 'kent', 'de nieuwe juf', 0, 'Zij is de nieuwe juf.'],
    ['Lotte hoort een bekende zangeres.', 'hoort', 'een bekende zangeres', 0, 'Lotte is een bekende zangeres.'], ['Wij spelen een spannende wedstrijd.', 'spelen', 'een spannende wedstrijd', 0, 'Wij zijn een spannende wedstrijd.'],
    ['Mijn oom krijgt een nieuwe auto.', 'krijgt', 'een nieuwe auto', 0, 'Mijn oom is een nieuwe auto.'], ['De kok maakt een lekkere soep.', 'maakt', 'een lekkere soep', 0, 'De kok is een lekkere soep.']
  ];
  /* [zin, [goed, fout], onderwerp, ev/mv, uitleg, fout onderwerp] */
  var CONG = [
    ['Iedereen … zijn best gedaan.', ['heeft', 'hebben'], 'iedereen', 'ev', 'Iedereen is enkelvoud, ook al gaat het over veel mensen.', 'zijn best'],
    ['Niemand … het antwoord.', ['weet', 'weten'], 'niemand', 'ev', 'Niemand is enkelvoud.', 'het antwoord'],
    ['Het team … vandaag de finale.', ['speelt', 'spelen'], 'het team', 'ev', 'De kern is team: één team.', 'de finale'],
    ['De klas … naar het museum.', ['gaat', 'gaan'], 'de klas', 'ev', 'Eén klas, ook al zitten er veel leerlingen in.', 'het museum'],
    ['Op het plein … veel kinderen.', ['staan', 'staat'], 'veel kinderen', 'mv', 'Het onderwerp staat hier achter de persoonsvorm: veel kinderen.', 'het plein'],
    ['Er … twee fietsen voor de deur.', ['staan', 'staat'], 'twee fietsen', 'mv', 'Het onderwerp is niet er, maar twee fietsen.', 'de deur'],
    ['Jan en Piet … samen naar school.', ['fietsen', 'fietst'], 'Jan en Piet', 'mv', 'Twee personen met en ertussen: meervoud.', 'school'],
    ['Elke leerling … een eigen laptop.', ['krijgt', 'krijgen'], 'elke leerling', 'ev', 'Elke leerling: steeds één leerling.', 'een eigen laptop'],
    ['Ieder kind … een cadeautje.', ['krijgt', 'krijgen'], 'ieder kind', 'ev', 'Ieder kind: steeds één kind.', 'een cadeautje'],
    ['De meeste leerlingen … de toets gehaald.', ['hebben', 'heeft'], 'de meeste leerlingen', 'mv', 'Leerlingen is meervoud.', 'de toets'],
    ['In de tuin … een oude boom.', ['staat', 'staan'], 'een oude boom', 'ev', 'Het onderwerp staat achter de persoonsvorm: een oude boom.', 'de tuin'],
    ['Mijn vader en moeder … allebei in Utrecht.', ['werken', 'werkt'], 'mijn vader en moeder', 'mv', 'Twee personen met en: meervoud.', 'Utrecht'],
    ['Er … een brief voor je gekomen.', ['is', 'zijn'], 'een brief', 'ev', 'Het onderwerp is een brief: enkelvoud.', 'je'],
    ['Alle kinderen … buiten spelen.', ['mogen', 'mag'], 'alle kinderen', 'mv', 'Kinderen is meervoud.', 'buiten'],
    ['Het publiek … hard voor de winnaar.', ['klapt', 'klappen'], 'het publiek', 'ev', 'De kern is publiek: één publiek.', 'de winnaar'],
    ['De familie … elk jaar op vakantie.', ['gaat', 'gaan'], 'de familie', 'ev', 'Eén familie: enkelvoud.', 'vakantie'],
    ['Geen enkele leerling … het antwoord.', ['wist', 'wisten'], 'geen enkele leerling', 'ev', 'Geen enkele leerling: enkelvoud.', 'het antwoord'],
    ['Volgens de juf … deze sommen te moeilijk.', ['zijn', 'is'], 'deze sommen', 'mv', 'Het onderwerp is deze sommen, niet de juf.', 'de juf'],
    ['Tom of Daan … vanavond de afwas.', ['doet', 'doen'], 'Tom of Daan', 'ev', 'Met of gaat het om één van de twee: enkelvoud.', 'de afwas'],
    ['Mijn broer en ik … vaak samen.', ['gamen', 'gamet'], 'mijn broer en ik', 'mv', 'Twee personen met en: meervoud.', 'samen'],
    ['Achter het huis … twee grote bomen.', ['staan', 'staat'], 'twee grote bomen', 'mv', 'Het onderwerp staat achter de persoonsvorm: twee grote bomen.', 'het huis']
  ];
  var ALSDAN = [
    'Mijn broer is groter … ik.|dan', 'Lisa is even oud … Sara.|als', 'Deze toets was moeilijker … de vorige.|dan', 'Hij rent net zo snel … zijn vader.|als',
    'Ik heb meer boeken … jij.|dan', 'Deze jas is anders … die van mij.|dan', 'Het is hier zo koud … in de winter.|als', 'Tom is minder moe … gisteren.|dan',
    'Mijn fiets is hetzelfde … de jouwe.|als', 'Vandaag is het warmer … gisteren.|dan', 'Zij zingt even mooi … haar zus.|als', 'Een olifant is zwaarder … een paard.|dan',
    'Mijn kamer is net zo groot … die van mijn zus.|als', 'Ajax speelde beter … PSV.|dan', 'Deze film is even spannend … het boek.|als', 'Ik vind pizza lekkerder … patat.|dan',
    'Hij is niet zo slim … hij denkt.|als', 'De trein is sneller … de bus.|dan', 'Mijn tas is zo zwaar … een steen.|als', 'Er waren minder leerlingen … vorig jaar.|dan',
    'Het ging anders … ik had verwacht.|dan'
  ];
  /* [zin, antwoord, 'zin' (nieuwe zin) | 'komma' | 'de' | 'het', woord] */
  var VERW = [
    ['Mijn fiets is gestolen. … vind ik erg vervelend.', 'dat', 'zin'], ['Mijn fiets is gestolen, … ik erg vervelend vind.', 'wat', 'komma'],
    ['Mijn fiets, … ik net had gekocht, is gestolen.', 'die', 'de', 'fiets'], ['Ze won de wedstrijd, … niemand had verwacht.', 'wat', 'komma'],
    ['Ze won de wedstrijd. … had niemand verwacht.', 'dat', 'zin'], ['De wedstrijd … ze won, was spannend.', 'die', 'de', 'wedstrijd'],
    ['Het regende de hele dag, … jammer was.', 'wat', 'komma'], ['Het regende de hele dag. … was jammer.', 'dat', 'zin'],
    ['Het boek, … ik van oma kreeg, is spannend.', 'dat', 'het', 'boek'], ['Tom kwam weer te laat, … de juf niet leuk vond.', 'wat', 'komma'],
    ['Tom kwam weer te laat. … vond de juf niet leuk.', 'dat', 'zin'], ['De bus … te laat kwam, was vol.', 'die', 'de', 'bus'],
    ['We kregen geen huiswerk, … iedereen fijn vond.', 'wat', 'komma'], ['We kregen geen huiswerk. … vond iedereen fijn.', 'dat', 'zin'],
    ['Het huiswerk … we kregen, was makkelijk.', 'dat', 'het', 'huiswerk'], ['Mijn opa werd negentig, … we groot hebben gevierd.', 'wat', 'komma'],
    ['Lisa heeft haar arm gebroken. … is echt pech.', 'dat', 'zin'], ['Lisa heeft haar arm gebroken, … echt pech is.', 'wat', 'komma'],
    ['De arm … Lisa brak, zit in het gips.', 'die', 'de', 'arm'], ['Het feest … we gaven, was een succes.', 'dat', 'het', 'feest']
  ];
  /* [zin, antwoord, 'geen' | 'vz' | 'ant', 'p' persoon | 'd' iets anders | 'de' | 'het', woord] */
  var WIEWAT = [
    ['… dit leest, is slim.', 'wie', 'geen', 'p'], ['… je zegt, klopt niet.', 'wat', 'geen', 'd'], ['… het eerst komt, mag kiezen.', 'wie', 'geen', 'p'],
    ['… je niet weet, kun je opzoeken.', 'wat', 'geen', 'd'], ['… zijn huiswerk af heeft, mag naar huis.', 'wie', 'geen', 'p'], ['… je belooft, moet je doen.', 'wat', 'geen', 'd'],
    ['… goed oplet, leert veel.', 'wie', 'geen', 'p'], ['… hij vertelde, was niet waar.', 'wat', 'geen', 'd'],
    ['De jongen met … ik praatte, is mijn neef.', 'wie', 'vz', 'p'], ['Het meisje naast … ik zit, heet Yara.', 'wie', 'vz', 'p'],
    ['De vriend aan … ik de brief stuurde, woont in Spanje.', 'wie', 'vz', 'p'], ['De juf voor … we een cadeau kochten, is jarig.', 'wie', 'vz', 'p'],
    ['De vrienden met … ik voetbal, zijn er niet.', 'wie', 'vz', 'p'],
    ['De jongen … ik zag, was Tom.', 'die', 'ant', 'de', 'jongen'], ['Het kind … daar speelt, is mijn broertje.', 'dat', 'ant', 'het', 'kind'],
    ['De leraar … wij het aardigst vinden, gaat weg.', 'die', 'ant', 'de', 'leraar'], ['Het meisje … de prijs won, is mijn zus.', 'dat', 'ant', 'het', 'meisje'],
    ['De mensen … hier wonen, zijn aardig.', 'die', 'ant', 'de', 'mensen'], ['Het boek … op tafel ligt, is van mij.', 'dat', 'ant', 'het', 'boek'],
    ['De vrouw … ons hielp, was heel aardig.', 'die', 'ant', 'de', 'vrouw']
  ];
  function puntjes(R, zin, w, label){ return R.teken.zin([{ t:zin.replace('…', zin.indexOf('…') === 0 ? groot(w) : w), k:4, label:label }]); }

  G.push({ groep:{ id:'gram-lastig', niveau:'3F', domein:'grammatica', naam:'Lastige zinsdelen en verwijswoorden',
      uit:'De lastigste stukken van de grammatica: voorzetselvoorwerp of bepaling, een voorwerp of een naamwoordelijk deel, enkelvoud of meervoud, als of dan, en de juiste verwijswoorden.' },
    doelen:[
      { id:'gram-vzv', naam:'Het voorzetselvoorwerp', kort:'Het voorzetsel hoort vast bij het werkwoord: wachten op, denken aan',
        uit:'<p>Sommige werkwoorden hebben een <b>vast voorzetsel</b>: wachten op, denken aan, houden van, zorgen voor, praten over. Het stuk dat met dat voorzetsel begint, is het <b>voorzetselvoorwerp</b>.</p><p>De proef: vraag met <b>waar, wanneer of hoe</b>. Krijg je een goed antwoord, dan is het een bijwoordelijke bepaling. Ik wacht bij de ingang: waar wacht ik? Bij de ingang.</p><p>Ik wacht op de bus: waar wacht ik? Op de bus? Nee, ik sta niet op de bus. Dit is een voorzetselvoorwerp.</p>',
        wanneer:'een zinsdeel met een voorzetsel begint.',
        maak:function(R){
          var v = R.kies(VZV), vzv = !!v[4], vz = v[1].split(' ')[0], ww = v[3].split(' ')[0];
          return eindKeuze({ vraag:v[0], context:'Is <b>' + v[1] + '</b> een voorzetselvoorwerp of een bijwoordelijke bepaling?',
            beeld:function(n){ return n >= 3 ? haakBeeld(R, v[0].replace(v[1], '[' + v[1] + ']'), vzv ? 'vzv' : 'bwb', vzv ? 4 : 5) : ''; },
            stappen:[
              janee('Stel de vraag ' + q(v[2]) + ' Is ' + q(v[1]) + ' daar een goed antwoord op?', !vzv, vzv ? 'Het gaat niet om een plaats of tijd. ' + groot(v[1]) + ' geeft geen antwoord op die vraag.' : 'Ja: ' + groot(v[1]) + '.'),
              janee('Hoort ' + q(vz) + ' hier vast bij ' + q(ww) + ', zoals in ' + q(v[3] + ' iets') + '?', vzv, vzv ? 'Je zegt altijd ' + q(v[3]) + '. Dat voorzetsel hoort erbij.' : 'Je kunt ook een ander voorzetsel kiezen: het gaat om een plaats, tijd of manier.'),
              vast('Wat is ' + q(v[1]) + '?', ['voorzetselvoorwerp', 'bijwoordelijke bepaling'], vzv ? 'voorzetselvoorwerp' : 'bijwoordelijke bepaling', vzv ? 'Vast voorzetsel bij het werkwoord: voorzetselvoorwerp.' : 'Het zegt waar, wanneer of hoe: bijwoordelijke bepaling.') ] });
        } },
      { id:'gram-lvnd', naam:'Lijdend voorwerp of naamwoordelijk deel', kort:'Bij een koppelwerkwoord is er geen lijdend voorwerp, maar een naamwoordelijk deel',
        uit:'<p>Mijn zus <b>bezoekt</b> een goede arts. Mijn zus <b>wordt</b> een goede arts. Het lijkt hetzelfde, maar het is het niet.</p><p>Na een <b>koppelwerkwoord</b> (zijn, worden, blijven, lijken, schijnen, blijken, heten) staat nooit een lijdend voorwerp. Dat stuk zegt wat het onderwerp is: het is het <b>naamwoordelijk deel</b>.</p><p>De proef: vervang de persoonsvorm door een vorm van <b>zijn</b>. Blijft de betekenis ongeveer gelijk? Dan is het een koppelwerkwoord.</p>',
        wanneer:'je na het werkwoord een stuk ziet zonder voorzetsel.',
        maak:function(R){
          var l = R.kies(LVND), kop = !!l[3];
          var st = [ l[4] ? janee('Vervang ' + q(l[1]) + ' door een vorm van zijn: ' + q(l[4]) + ' Blijft de betekenis ongeveer gelijk?', kop, kop ? 'Ja, het zegt bijna hetzelfde.' : 'Nee, dat betekent iets heel anders.')
                          : janee('Is ' + q(l[1]) + ' zelf al een vorm van zijn?', true, q(l[1]) + ' komt van zijn.') ];
          st.push(janee('Is ' + q(l[1]) + ' hier een koppelwerkwoord?', kop, kop ? 'Het koppelt het onderwerp aan wat het is.' : 'Het onderwerp doet iets: ' + q(l[1]) + ' is een gewoon werkwoord.'));
          st.push(vast('Wat is ' + q(l[2]) + '?', ['lijdend voorwerp', 'naamwoordelijk deel'], kop ? 'naamwoordelijk deel' : 'lijdend voorwerp', kop ? 'Na een koppelwerkwoord: naamwoordelijk deel.' : 'Na een gewoon werkwoord: wie of wat ' + l[1] + '? ' + groot(l[2]) + ': lijdend voorwerp.'));
          return eindKeuze({ vraag:l[0], context:'Is <b>' + l[2] + '</b> een lijdend voorwerp of een naamwoordelijk deel?',
            beeld:function(n){ return n >= 3 ? haakBeeld(R, l[0].replace(l[2], '[' + l[2] + ']'), kop ? 'nd' : 'lv', 3) : ''; },
            stappen:st });
        } },
      { id:'gram-cong', naam:'Congruentie: enkelvoud of meervoud', kort:'De persoonsvorm past bij de kern van het onderwerp, waar het onderwerp ook staat',
        uit:'<p>De persoonsvorm en het onderwerp moeten bij elkaar passen: enkelvoud bij enkelvoud, meervoud bij meervoud. Dat heet <b>congruentie</b>.</p><p>Lastig: <b>iedereen, niemand, elke, ieder</b> zijn enkelvoud. Het team, de klas, het publiek: ook enkelvoud. Twee dingen met <b>en</b> zijn meervoud, met <b>of</b> enkelvoud.</p><p>Let op als het onderwerp achter de persoonsvorm staat: Er <b>staan</b> twee fietsen. Bij <b>een aantal</b> leerlingen mag allebei: ging en gingen.</p>',
        wanneer:'je twijfelt tussen een enkelvoudige en een meervoudige persoonsvorm.',
        maak:function(R){
          var c = R.kies(CONG), mv = c[3] === 'mv';
          return eindKeuze({ vraag:c[0], context:'Welke persoonsvorm hoort op de puntjes: <b>' + c[1][0] + '</b> of <b>' + c[1][1] + '</b>?',
            beeld:function(n){ return n >= 3 ? puntjes(R, c[0], c[1][0], mv ? 'meervoud' : 'enkelvoud') : ''; },
            stappen:[
              keuze(R, 'Wat is het onderwerp?', c[2], [c[5]], 'Wie of wat doet het? ' + groot(c[2]) + '.'),
              vast('Is ' + q(c[2]) + ' enkelvoud of meervoud?', ['enkelvoud', 'meervoud'], mv ? 'meervoud' : 'enkelvoud', c[4]),
              keuze(R, 'Welke persoonsvorm hoort erbij?', c[1][0], [c[1][1]], (mv ? 'Meervoud' : 'Enkelvoud') + ': ' + c[1][0] + '.') ] });
        } },
      { id:'gram-alsdan', naam:'Als of dan bij vergelijken', kort:'Gelijk: even groot als. Ongelijk: groter dan, anders dan',
        uit:'<p>Bij een vergelijking kies je tussen <b>als</b> en <b>dan</b>.</p><p>Is het <b>gelijk</b>? Dan <b>als</b>: even groot als, net zo snel als, zo koud als, hetzelfde als.</p><p>Is het <b>ongelijk</b>? Dan <b>dan</b>: groter dan, meer dan, minder dan, anders dan.</p>',
        wanneer:'je twee dingen met elkaar vergelijkt.',
        maak:function(R){
          var a = R.kies(ALSDAN).split('|'), zin = a[0], ant = a[1], gelijk = ant === 'als';
          var sig = gelijk ? (/net zo/.test(zin) ? 'net zo' : / even /.test(zin) ? 'even' : /hetzelfde/.test(zin) ? 'hetzelfde' : 'zo')
            : (/ meer /.test(zin) ? 'meer' : / minder /.test(zin) ? 'minder' : /anders/.test(zin) ? 'anders' : zin.split(' …')[0].split(' ').pop());
          return eindKeuze({ vraag:zin, context:'Welk woord hoort op de puntjes: <b>als</b> of <b>dan</b>?',
            beeld:function(n){ return n >= 2 ? puntjes(R, zin, ant, gelijk ? 'gelijk' : 'ongelijk') : ''; },
            stappen:[
              vast('Is het een vergelijking van gelijk of van ongelijk?', ['gelijk', 'ongelijk'], gelijk ? 'gelijk' : 'ongelijk', 'Kijk naar ' + q(sig) + '. ' + (gelijk ? 'Dat betekent: hetzelfde.' : 'Dat betekent: niet hetzelfde.')),
              vast('Welk woord hoort op de puntjes?', ['als', 'dan'], ant, gelijk ? 'Gelijk: als.' : 'Ongelijk: dan.') ] });
        } },
      { id:'gram-verwijs', naam:'Verwijzen naar een hele zin', kort:'Naar een hele zin verwijs je met dat of wat, nooit met die',
        uit:'<p>Soms verwijs je niet naar één woord, maar naar <b>een hele zin</b>: Mijn fiets is gestolen. <b>Dat</b> vind ik vervelend.</p><p>Begint er een <b>nieuwe zin</b>? Dan <b>dat</b>. Loopt de zin door na een <b>komma</b>? Dan <b>wat</b>: Mijn fiets is gestolen, <b>wat</b> ik vervelend vind.</p><p>Verwijs je naar één woord, dan kies je zoals altijd: <b>die</b> bij een de-woord, <b>dat</b> bij een het-woord.</p>',
        wanneer:'je terugverwijst naar iets wat net gebeurd is.',
        maak:function(R){
          var v = R.kies(VERW), woord = v[2] === 'de' || v[2] === 'het';
          var st = [ vast('Waar verwijst het woord op de puntjes naar?', ['één woord', 'de hele zin ervoor'], woord ? 'één woord' : 'de hele zin ervoor', woord ? 'Het gaat over ' + q(v[3]) + '.' : 'Het gaat over wat er gebeurde, de hele zin.') ];
          if (woord) st.push(vast('Is ' + q(v[3]) + ' een de-woord of een het-woord?', ['de-woord', 'het-woord'], v[2] + '-woord', 'Zeg: ' + v[2] + ' ' + v[3] + '.'));
          else st.push(vast('Begint er een nieuwe zin, of loopt de zin door na een komma?', ['een nieuwe zin', 'na een komma'], v[2] === 'zin' ? 'een nieuwe zin' : 'na een komma', v[2] === 'zin' ? 'Er staat een punt voor de puntjes.' : 'Er staat een komma voor de puntjes.'));
          st.push(vast('Welk woord hoort op de puntjes?', ['die', 'dat', 'wat'], v[1], woord ? (v[2] === 'de' ? 'De-woord: die.' : 'Het-woord: dat.') : v[2] === 'zin' ? 'Nieuwe zin over de hele zin ervoor: dat.' : 'Na een komma over de hele zin: wat.'));
          return eindKeuze({ vraag:v[0], context:'Welk woord hoort op de puntjes: <b>die</b>, <b>dat</b> of <b>wat</b>?',
            beeld:function(n){ return n >= 3 ? R.teken.zin([{ t:v[0].replace('… ', v[0].indexOf('. …') > 0 ? groot(v[1]) + ' ' : v[1] + ' '), k:4, label:v[1] }]) : ''; },
            stappen:st });
        } },
      { id:'gram-wiewat', naam:'Wie en wat als betrekkelijk voornaamwoord', kort:'Zonder woord ervoor: wie (persoon) of wat. Na een voorzetsel bij een persoon: wie',
        uit:'<p><b>Wie</b> en <b>wat</b> gebruik je als er <b>geen woord vóór staat</b> waar ze naar verwijzen: <b>Wie</b> dit leest, is slim. <b>Wat</b> je zegt, klopt niet.</p><p>Na een <b>voorzetsel</b> bij een persoon gebruik je <b>wie</b>: de jongen met <b>wie</b> ik praatte.</p><p>Staat er wel een woord voor, zonder voorzetsel? Dan gewoon <b>die</b> of <b>dat</b>: de jongen <b>die</b> ik zag (niet: wie).</p>',
        wanneer:'je twijfelt tussen die, dat, wie en wat.',
        maak:function(R){
          var w = R.kies(WIEWAT), ant = w[2] !== 'geen', st = [];
          st.push(janee('Staat er vóór de puntjes een woord waar het naar verwijst?', ant, ant ? 'Ja: ' + (w[2] === 'ant' ? q(w[4]) : 'de persoon voor het voorzetsel') + '.' : 'Nee: de zin begint met de puntjes.'));
          if (ant){
            var vz = w[0].split(' …')[0].split(' ').pop();
            st.push(janee('Staat er een voorzetsel vlak voor de puntjes?', w[2] === 'vz', w[2] === 'vz' ? q(vz) + ' is een voorzetsel.' : 'Nee, er staat ' + q(vz) + ' voor.'));
            if (w[2] === 'vz') st.push(vast('Gaat het over een persoon?', ['ja', 'nee'], 'ja', 'Het gaat over een mens.'));
            else st.push(vast('Is ' + q(w[4]) + ' een de-woord of een het-woord?', ['de-woord', 'het-woord'], w[3] + '-woord', 'Zeg: ' + w[3] + ' ' + w[4] + '.'));
          } else st.push(vast('Gaat het over een persoon of over iets anders?', ['een persoon', 'iets anders'], w[3] === 'p' ? 'een persoon' : 'iets anders', w[3] === 'p' ? 'Het gaat over iemand.' : 'Het gaat over iets.'));
          st.push(vast('Welk woord hoort op de puntjes?', ['die', 'dat', 'wie', 'wat'], w[1],
            w[2] === 'geen' ? (w[3] === 'p' ? 'Geen woord ervoor, een persoon: wie.' : 'Geen woord ervoor, iets anders: wat.') : w[2] === 'vz' ? 'Na een voorzetsel bij een persoon: wie.' : (w[3] === 'de' ? 'De-woord: die.' : 'Het-woord: dat.')));
          return eindKeuze({ vraag:w[0], context:'Welk woord hoort op de puntjes: <b>die</b>, <b>dat</b>, <b>wie</b> of <b>wat</b>?',
            beeld:function(n){ return n >= st.length ? puntjes(R, w[0], w[1], 'betr. vnw') : ''; },
            stappen:st });
        } }
    ] });

  LEERROUTE.voeg('nederlands', G);
})();
