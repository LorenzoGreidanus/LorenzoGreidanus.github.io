/* Feodalisme, de motor. Drie koningen (bij een kleine klas twee) bouwen een
   kasteel en vechten om het land. Ze geven land in leen aan ridders, die
   trouw zweren en soldaten leveren. Boeren wonen op het land van een heer,
   oogsten in de herfst en staan een deel af. In de winter eet iedereen: wie
   te weinig heeft, verliest soldaten, of de boerenfamilie trekt weg.

   De motor draait op het bord (feodalisme.html) en weet niets van het scherm.
     var M = FEOMOTOR.maak({ zaad, spelers:[{ pid, naam }], jaren, seizoen });
     M.actie(pid, d)        een keuze van een telefoon
     M.tik(dt)              de klok, in seconden
     M.bord()               wat alle telefoons zien (de kaart)
     M.kaart(pid)           wat die ene telefoon ziet (voorraad, aanbiedingen)
     M.stand                alles, om te bewaren; FEOMOTOR.maak({ stand }) gaat verder
   Elke speler heeft een nummer i; over de lijn gaan alleen nummers. */
(function(wereld){
  'use strict';
  var K = wereld.FEOKAART || (typeof require === 'function' ? require('./feodalisme-kaart.js') : null);
  var RIJKEN = [
    { kleur:'#F26749', naam:'Het Rode Rijk' },
    { kleur:'#204ECF', naam:'Het Blauwe Rijk' },
    { kleur:'#EA9836', naam:'Het Gouden Rijk' },
    { kleur:'#2f7d52', naam:'Het Groene Rijk' },
    { kleur:'#6b3fa0', naam:'Het Paarse Rijk' }
  ];
  var SEIZOENEN = ['lente', 'zomer', 'herfst', 'winter'];
  var R = {
    koningVoedsel:30, koningSoldaten:8, ridderVoedsel:8, ridderSoldaten:3, boerVoedsel:6,
    huur:4,                     /* voedsel voor een soldaat erbij */
    eetSoldaat:1, eetHeer:2, eetBoer:3,
    maxBoeren:3,
    afdracht:{ laag:0.25, gewoon:0.4, zwaar:0.6 },
    mars:4,                     /* seconden per stap */
    geplunderd:0.3,             /* zoveel blijft er van de oogst over na een gevecht op het land */
    kasteel:2.5, muren:4, boer:0.5, versterk:0.2,
    kasteelAfstand:3,           /* minstens zoveel stappen tussen twee kastelen */
    kastelenTijd:75,            /* seconden om een plek te kiezen, daarna kiest het bord */
    aanbodTijd:30,
    herendienstMoe:0.85
  };
  function sold(n){ return n + (n === 1 ? ' soldaat' : ' soldaten'); }
  function aantalKoningen(n){ return n >= 9 ? 3 : 2; }

  function maak(o){
    var st = o.stand ? JSON.parse(JSON.stringify(o.stand)) : nieuw(o);
    var KRT = K.maak(st.zaad), H = KRT.hex, N = H.length;
    var rnd = Math.random;
    var haak = o.haak || {};
    function zeg(n){ var f = haak[n]; if (typeof f === 'function'){ try { f.apply(null, Array.prototype.slice.call(arguments, 1)); } catch (e){} } }

    function nieuw(o){
      var zaad = o.zaad >>> 0 || (Math.floor(Math.random() * 4e9) >>> 0);
      var lijst = (o.spelers || []).slice();
      var nk = aantalKoningen(lijst.length), nr = Math.round((lijst.length - nk) * 0.35);
      /* rollen: de volgorde is al geschud door het bord, of hier */
      if (!o.vast){ for (var i = lijst.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = lijst[i]; lijst[i] = lijst[j]; lijst[j] = t; } }
      var sp = lijst.map(function(s, i){
        var rol = i < nk ? 'koning' : i < nk + nr ? 'ridder' : 'boer';
        return nieuweSpeler(s, i, rol, rol === 'koning' ? i : -1);
      });
      var e = []; for (var h = 0; h < 48; h++) e.push(-1);
      return { zaad:zaad, fase:'kastelen', t:0, kt:0, sd:Math.max(10, o.seizoen || 30), jaren:Math.max(1, o.jaren || 8),
               pauze:false, sp:sp, eig:e, vst:e.map(function(){ return 0; }), plu:[], legers:[], nr:0, log:[], seiz:-1,
               rijken:RIJKEN.slice(0, nk).map(function(r, i){ return { kleur:r.kleur, naam:r.naam, koning:i, val:0 }; }), aanbodNr:0 };
    }
    function nieuweSpeler(s, i, rol, rijk){
      return { i:i, pid:s.pid, naam:String(s.naam || 'speler').slice(0, 24), rol:rol, rijk:rijk, heer:-1,
               voedsel:rol === 'koning' ? R.koningVoedsel : rol === 'ridder' ? R.ridderVoedsel : R.boerVoedsel,
               reserve:rol === 'ridder' ? R.ridderSoldaten : 0, honger:0, woont:-1, afdracht:'gewoon', trouw:0, weiger:0,
               winters:0, kasteel:-1, moe:false, aanbod:[], meld:[], herendienst:-1, heervaart:-1, over:-1, verslagen:0, plekken:0 };
    }
    function speler(pid){ for (var i = 0; i < st.sp.length; i++) if (st.sp[i].pid === pid) return st.sp[i]; return null; }
    /* het rijk van een speler: een koning is zijn rijk, een ridder hoort bij het rijk van zijn heer */
    function rijkVan(i){
      var p = st.sp[i], n = 0;
      while (p && n++ < 6){
        if (p.rol === 'koning') return p.rijk;
        if (p.rol === 'ridder') p = p.heer >= 0 ? st.sp[p.heer] : null;
        else p = p.woont >= 0 && st.eig[p.woont] >= 0 ? st.sp[st.eig[p.woont]] : null;
      }
      return -1;
    }
    function rijkHex(h){ return st.eig[h] >= 0 ? rijkVan(st.eig[h]) : -1; }
    function koningVan(r){ var rk = st.rijken[r]; return rk ? rk.koning : -1; }
    function seizoen(){ return Math.floor(st.t / st.sd) % 4; }
    function jaar(){ return Math.floor(st.t / (st.sd * 4)) + 1; }
    function winter(){ return st.fase === 'loopt' && seizoen() === 3; }

    /* ---------- meldingen en het verslag ---------- */
    function meld(i, tekst, soort){
      var p = st.sp[i]; if (!p) return;
      p.meld.unshift({ t:tekst, s:soort || 'info', n:++st.nr });
      if (p.meld.length > 4) p.meld.length = 4;
    }
    function log(tekst, r){
      st.log.unshift({ t:tekst, r:typeof r === 'number' ? r : -1, j:jaar(), z:seizoen(), n:++st.nr });
      if (st.log.length > 40) st.log.length = 40;
      zeg('log', tekst, r);
    }
    function aanbied(i, a){
      var p = st.sp[i]; if (!p) return;
      a.id = 'a' + (++st.aanbodNr); a.tot = st.kt + R.aanbodTijd;
      p.aanbod = p.aanbod.filter(function(x){ return !(x.soort === a.soort && x.van === a.van && x.h === a.h); });
      p.aanbod.push(a);
      if (p.aanbod.length > 4) p.aanbod.shift();
    }

    /* ---------- legers ---------- */
    function legersVan(i, alleenStil){ return st.legers.filter(function(l){ return l.bev === i && (!alleenStil || !l.mars); }); }
    function soldatenVan(i){ var n = 0; st.legers.forEach(function(l){ if (l.eig === i) n += l.n; }); return n + (st.sp[i].reserve || 0); }
    function opHex(h){ return st.legers.filter(function(l){ return !l.mars && l.hex === h; }); }
    function zet(eig, bev, n, h){
      if (n <= 0) return;
      var l = st.legers.filter(function(x){ return !x.mars && x.hex === h && x.eig === eig && x.bev === bev; })[0];
      if (l) l.n += n; else st.legers.push({ id:++st.nr, eig:eig, bev:bev, n:n, hex:h, mars:null });
    }
    function opruimen(){ st.legers = st.legers.filter(function(l){ return l.n > 0; }); }
    /* waar de soldaten van iemand thuis zijn: het kasteel, of het leen met de meeste soldaten */
    function thuis(i){
      var p = st.sp[i];
      if (p.rol === 'koning' && p.kasteel >= 0) return p.kasteel;
      var best = -1, bn = -1;
      for (var h = 0; h < N; h++) if (st.eig[h] === i){ var n = opHex(h).reduce(function(s, l){ return s + (l.eig === i ? l.n : 0); }, 0); if (n > bn){ bn = n; best = h; } }
      return best;
    }
    function land(i){ var n = 0; for (var h = 0; h < N; h++) if (st.eig[h] === i) n++; return n; }
    function boerenOp(h){ return st.sp.filter(function(p){ return p.rol === 'boer' && p.woont === h; }); }
    /* soldaten weg: eerst uit de grootste groep */
    function haalWeg(i, n){
      var weg = 0;
      var r = Math.min(st.sp[i].reserve || 0, n); st.sp[i].reserve -= r; weg += r; n -= r;
      while (n > 0){
        var l = st.legers.filter(function(x){ return x.eig === i && x.n > 0; }).sort(function(a, b){ return b.n - a.n; })[0];
        if (!l) break;
        var m = Math.min(l.n, n); l.n -= m; n -= m; weg += m;
      }
      opruimen();
      return weg;
    }
    /* mag een leger van speler i naar gebied h? Eigen rijk, of aan het rijk grenzend */
    /* Een rivier steek je over via een brug, en die ligt er waar de rivier
       in of tegen je eigen land ligt. Tussen land van anderen, of in leeg
       land, is een rivier een grens. */
    function bruggenNu(){ return K.bruggen(KRT, rijkHex, function(r){ var k = st.rijken[r] ? st.sp[st.rijken[r].koning] : null; return k && k.rol === 'koning' ? k.kasteel : -1; }); }
    function brug(r){
      var br = r >= 0 ? bruggenNu().filter(function(x){ return x.r === r; }) : [];
      return function(a, b){ var sl = a < b ? a + '-' + b : b + '-' + a; return br.some(function(x){ return x.sl === sl; }); };
    }
    function bereikbaar(i, h){
      var r = rijkVan(i); if (r < 0 || KRT.dicht[h]) return false;
      if (rijkHex(h) === r) return true;
      return H[h].buren.some(function(b){ return rijkHex(b) === r && !KRT.dicht[b]; });
    }
    /* een leger loopt van gebied naar gebied, om gebergte en rivieren heen */
    function mars(eig, bev, n, van, naar){
      var pad = KRT.pad(van, naar, brug(rijkVan(bev))); if (!pad) return false;
      st.legers.push({ id:++st.nr, eig:eig, bev:bev, n:n, hex:-1, mars:{ van:van, naar:naar, pad:pad, t0:st.kt, t1:st.kt + Math.max(1, pad.length - 1) * R.mars } });
      return true;
    }

    /* ---------- de acties van de telefoons ---------- */
    function actie(pid, d){
      var p = speler(pid);
      if (!p || !d || typeof d !== 'object' || st.fase === 'einde') return false;
      var a = String(d.a || '');
      var fout = function(t){ meld(p.i, t, 'fout'); return false; };
      if (st.pauze && a !== 'antwoord') return fout('Het spel staat even stil.');
      if (a === 'kasteel'){
        var h = d.h | 0;
        if (p.rol !== 'koning' || p.kasteel >= 0) return false;
        if (st.fase !== 'kastelen') return fout('Je kasteel staat er al.');
        if (!(h >= 0 && h < N)) return false;
        if (KRT.dicht[h]) return fout('Op het gebergte kun je geen kasteel bouwen.');
        if (st.eig[h] >= 0) return fout('Hier is al land van een ander.');
        var te = st.sp.some(function(q){ return q.rol === 'koning' && q.kasteel >= 0 && K.afstand(H[q.kasteel], H[h]) < R.kasteelAfstand; });
        if (te) return fout('Te dicht bij een ander kasteel. Kies een plek verderop.');
        bouwKasteel(p, h);
        if (st.sp.every(function(q){ return q.rol !== 'koning' || q.kasteel >= 0; })) beginKlok();
        return true;
      }
      if (st.fase !== 'loopt'){
        if (a === 'woon' || a === 'afdracht'){ /* dat mag al voor de klok loopt */ }
        else return fout('Wacht tot alle kastelen staan.');
      }
      if (a === 'antwoord') return antwoord(p, String(d.id || ''), String(d.keuze || ''));
      if (a === 'afdracht'){
        if (p.rol === 'boer' || !R.afdracht[d.w]) return false;
        p.afdracht = d.w;
        boerenVan(p.i).forEach(function(b){ meld(b.i, 'Je heer ' + p.naam + ' vraagt nu ' + Math.round(R.afdracht[d.w] * 100) + ' procent van je oogst.', d.w === 'zwaar' ? 'fout' : 'info'); });
        return true;
      }
      if (a === 'woon'){
        var w = d.h | 0;
        if (p.rol !== 'boer' || !(w >= 0 && w < N)) return false;
        if (st.eig[w] < 0) return fout('Op dit land woont geen heer. Zonder heer ben je niet beschermd.');
        if (w === p.woont) return false;
        if (boerenOp(w).length >= R.maxBoeren) return fout('Hier wonen al ' + R.maxBoeren + ' boerenfamilies.');
        if (winter()) return fout('In de winter trek je niet weg.');
        if (p.woont >= 0){
          var verlies = Math.ceil(p.voedsel / 2); p.voedsel -= verlies;
          meld(p.i, 'Je trekt weg naar ' + H[w].naam + '. De helft van je voorraad (' + verlies + ') laat je achter.', 'info');
          meld(st.eig[p.woont], 'Boer ' + p.naam + ' is weggetrokken van ' + H[p.woont].naam + '.', 'fout');
        } else meld(p.i, 'Je woont nu op ' + H[w].naam + ', op het land van ' + st.sp[st.eig[w]].naam + '.', 'goed');
        p.woont = w;
        meld(st.eig[w], 'Boer ' + p.naam + ' komt op ' + H[w].naam + ' wonen.', 'goed');
        return true;
      }
      if (winter() && (a === 'stuur' || a === 'huur')) return fout('In de winter voer je geen oorlog: de wegen zijn modder en er is niets te eten.');
      if (a === 'huur'){
        if (p.rol === 'boer') return false;
        if (p.voedsel < R.huur) return fout('Een soldaat kost ' + R.huur + ' voedsel. Zoveel heb je niet.');
        p.voedsel -= R.huur;
        var th = thuis(p.i);
        if (th >= 0) zet(p.i, p.i, 1, th); else p.reserve++;
        return true;
      }
      if (a === 'stuur'){
        var van = d.van | 0, naar = d.naar | 0, n = Math.max(1, d.n | 0);
        if (p.rol === 'boer' || !(naar >= 0 && naar < N)) return false;
        var bron = st.legers.filter(function(l){ return l.id === van && l.bev === p.i && !l.mars; })[0];
        if (!bron) return fout('Daar heb je geen soldaten staan.');
        if (bron.hex === naar) return false;
        if (KRT.dicht[naar]) return fout('Door het gebergte kan geen leger.');
        if (!bereikbaar(p.i, naar)) return fout('Daar kun je niet komen. Je leger gaat naar je eigen land of naar land dat eraan grenst.');
        n = Math.min(n, bron.n);
        if (!mars(bron.eig, p.i, n, bron.hex, naar)) return fout('Er is geen weg erheen: een rivier zonder brug of gebergte zit ertussen.');
        bron.n -= n;
        opruimen();
        var doel = rijkHex(naar), eigen = doel === rijkVan(p.i);
        if (!eigen) log(titel(p) + ' trekt met ' + sold(n) + ' naar ' + H[naar].naam + '.', rijkVan(p.i));
        if (!eigen && st.eig[naar] >= 0) meld(st.eig[naar], 'Pas op: ' + p.naam + ' komt met ' + sold(n) + ' naar ' + H[naar].naam + '.', 'fout');
        return true;
      }
      if (a === 'leen'){
        var lh = d.h | 0, aan = d.aan | 0, q = st.sp[aan];
        if (p.rol !== 'koning' || !q || q.rol !== 'ridder') return false;
        if (st.eig[lh] !== p.i) return fout('Dat land is niet van jou.');
        if (lh === p.kasteel) return fout('Je kasteel geef je niet weg.');
        if (q.heer >= 0 && q.heer !== p.i) return fout(q.naam + ' heeft al trouw gezworen aan ' + st.sp[q.heer].naam + '.');
        aanbied(aan, { soort:'leen', van:p.i, h:lh });
        meld(p.i, 'Je biedt ' + H[lh].naam + ' aan ' + q.naam + ' aan. Wacht op het antwoord.', 'info');
        return true;
      }
      if (a === 'intrek'){
        var ih = d.h | 0, wie = st.eig[ih];
        if (p.rol !== 'koning' || wie < 0 || st.sp[wie].rol !== 'ridder' || st.sp[wie].heer !== p.i) return false;
        neemTerug(ih, p.i);
        meld(wie, 'Koning ' + p.naam + ' neemt ' + H[ih].naam + ' van je terug.', 'fout');
        log('Koning ' + p.naam + ' neemt ' + H[ih].naam + ' terug van ridder ' + st.sp[wie].naam + '.', p.rijk);
        return true;
      }
      if (a === 'heervaart'){
        if (p.rol !== 'koning') return false;
        if (p.heervaart === jaar()) return fout('Je riep je ridders dit jaar al op.');
        var vaz = st.sp.filter(function(q){ return q.rol === 'ridder' && q.heer === p.i && soldatenVan(q.i) > 0; });
        if (!vaz.length) return fout('Je hebt nog geen ridders met soldaten. Geef eerst land in leen.');
        p.heervaart = jaar();
        vaz.forEach(function(q){ aanbied(q.i, { soort:'heervaart', van:p.i }); });
        log('Koning ' + p.naam + ' roept zijn ridders op voor de heervaart.', p.rijk);
        return true;
      }
      if (a === 'herendienst'){
        if (p.rol === 'boer') return false;
        if (p.herendienst === jaar()) return fout('Je vroeg dit jaar al om herendienst.');
        var bw = boerenVan(p.i);
        if (!bw.length) return fout('Er wonen nog geen boeren op je land.');
        p.herendienst = jaar();
        bw.forEach(function(b){ aanbied(b.i, { soort:'herendienst', van:p.i, h:b.woont }); });
        return true;
      }
      if (a === 'dienst'){
        var k = d.k | 0, kq = st.sp[k];
        if (p.rol !== 'ridder' || p.heer >= 0 || !kq || kq.rol !== 'koning') return false;
        aanbied(k, { soort:'dienst', van:p.i });
        meld(p.i, 'Je biedt koning ' + kq.naam + ' je diensten aan.', 'info');
        return true;
      }
      if (a === 'overloop'){
        var nk = d.k | 0, nq = st.sp[nk];
        if (p.rol !== 'ridder' || p.heer < 0 || !nq || nq.rol !== 'koning' || nk === p.heer) return false;
        if (p.over === jaar()) return fout('Je liep dit jaar al over.');
        var grens = false;
        for (var x = 0; x < N; x++) if (st.eig[x] === p.i && H[x].buren.some(function(b){ return rijkHex(b) === nq.rijk; })) grens = true;
        if (!grens && land(p.i) > 0) return fout('Je land grenst niet aan het rijk van ' + nq.naam + '.');
        aanbied(nk, { soort:'overloop', van:p.i });
        meld(p.i, 'Je vraagt koning ' + nq.naam + ' of je met je land bij hem mag horen.', 'info');
        p.over = jaar();
        return true;
      }
      return false;
    }
    function boerenVan(i){ return st.sp.filter(function(b){ return b.rol === 'boer' && b.woont >= 0 && st.eig[b.woont] === i; }); }
    function titel(p){ return (p.rol === 'koning' ? 'Koning ' : p.rol === 'ridder' ? 'Ridder ' : 'Boer ') + p.naam; }
    function bouwKasteel(p, h){
      p.kasteel = h; st.eig[h] = p.i;
      H[h].buren.forEach(function(b){ if (st.eig[b] < 0 && !KRT.dicht[b]) st.eig[b] = p.i; });
      zet(p.i, p.i, R.koningSoldaten, h);
      log('Koning ' + p.naam + ' bouwt een kasteel op ' + H[h].naam + '.', p.rijk);
      zeg('kasteel', p.i, h);
    }
    function beginKlok(){
      if (st.fase !== 'kastelen') return;
      /* wie nog geen plek koos, krijgt er een */
      st.sp.forEach(function(p){
        if (p.rol !== 'koning' || p.kasteel >= 0) return;
        var kies = [];
        for (var h = 0; h < N; h++){
          if (st.eig[h] >= 0 || KRT.dicht[h]) continue;
          if (st.sp.some(function(q){ return q.rol === 'koning' && q.kasteel >= 0 && K.afstand(H[q.kasteel], H[h]) < R.kasteelAfstand; })) continue;
          kies.push(h);
        }
        if (!kies.length) for (var h2 = 0; h2 < N; h2++) if (st.eig[h2] < 0 && !KRT.dicht[h2]) kies.push(h2);
        bouwKasteel(p, kies[Math.floor(rnd() * kies.length)]);
        meld(p.i, 'Het bord koos een plek voor je kasteel: ' + H[p.kasteel].naam + '.', 'info');
      });
      st.fase = 'loopt'; st.t = 0; st.seiz = -1;
      zeg('fase', 'loopt');
    }
    /* land terug naar de koning; de soldaten van de ridder gaan naar zijn ander land, of naar huis */
    function neemTerug(h, koning){
      var r = st.eig[h];
      st.eig[h] = koning;
      st.legers.forEach(function(l){
        if (l.mars || l.hex !== h || l.eig !== r) return;
        var th = thuis(r);
        if (th >= 0){ l.hex = th; } else { st.sp[r].reserve += l.n; l.n = 0; }
      });
      opruimen();
    }
    function antwoord(p, id, keuze){
      var a = p.aanbod.filter(function(x){ return x.id === id; })[0];
      if (!a) return false;
      p.aanbod = p.aanbod.filter(function(x){ return x !== a; });
      var van = st.sp[a.van];
      if (a.soort === 'leen'){
        if (keuze !== 'ja'){ meld(a.van, 'Ridder ' + p.naam + ' wil ' + H[a.h].naam + ' niet in leen.', 'fout'); return true; }
        if (st.eig[a.h] !== a.van || (p.heer >= 0 && p.heer !== a.van)) { meld(p.i, 'Dat aanbod geldt niet meer.', 'fout'); return true; }
        var eerste = p.heer < 0;
        st.eig[a.h] = p.i; p.heer = a.van; p.trouw++;
        if (p.reserve > 0){ zet(p.i, p.i, p.reserve, a.h); p.reserve = 0; }
        /* soldaten van de koning die daar stonden, gaan naar het kasteel */
        st.legers.forEach(function(l){ if (!l.mars && l.hex === a.h && l.eig === a.van && van.kasteel >= 0) l.hex = van.kasteel; });
        meld(p.i, 'Je zweert trouw aan koning ' + van.naam + ' en krijgt ' + H[a.h].naam + ' in leen. Jij beschermt het land, hij mag op je soldaten rekenen.', 'goed');
        meld(a.van, 'Ridder ' + p.naam + ' zweert trouw en krijgt ' + H[a.h].naam + ' in leen.', 'goed');
        log((eerste ? 'Ridder ' + p.naam + ' zweert trouw aan koning ' + van.naam + ' en krijgt ' : 'Koning ' + van.naam + ' geeft ridder ' + p.naam + ' ook ') + H[a.h].naam + ' in leen.', van.rijk);
        return true;
      }
      if (a.soort === 'heervaart'){
        var mijn = st.legers.filter(function(l){ return l.eig === p.i && l.bev === p.i && !l.mars; });
        var tot = mijn.reduce(function(s, l){ return s + l.n; }, 0);
        if (keuze === 'nee' || !tot || van.kasteel < 0){
          p.weiger++;
          meld(a.van, 'Ridder ' + p.naam + ' komt niet. Hij weigert de heervaart.', 'fout');
          log('Ridder ' + p.naam + ' weigert de heervaart van koning ' + van.naam + '.', van.rijk);
          return true;
        }
        var deel = keuze === 'alles' ? 1 : 0.5, gestuurd = 0;
        mijn.forEach(function(l){
          var n = Math.max(keuze === 'alles' ? l.n : 0, Math.floor(l.n * deel)); if (n <= 0) return;
          if (!mars(p.i, a.van, n, l.hex, van.kasteel)) return;
          l.n -= n; gestuurd += n;
        });
        opruimen();
        if (!gestuurd){ meld(p.i, 'Je hebt te weinig soldaten om de helft te sturen.', 'fout'); return true; }
        p.trouw += keuze === 'alles' ? 2 : 1;
        meld(p.i, 'Je ' + sold(gestuurd) + (gestuurd === 1 ? ' dient' : ' dienen') + ' koning ' + van.naam + ' tot de winter. Dan komen ze terug.', 'goed');
        meld(a.van, 'Ridder ' + p.naam + ' stuurt ' + sold(gestuurd) + ' naar je kasteel.', 'goed');
        log('Ridder ' + p.naam + ' stuurt ' + sold(gestuurd) + ' naar koning ' + van.naam + '.', van.rijk);
        return true;
      }
      if (a.soort === 'herendienst'){
        if (keuze !== 'ja'){ meld(a.van, 'Boer ' + p.naam + ' weigert de herendienst.', 'fout'); return true; }
        if (p.woont >= 0){ st.vst[p.woont] = Math.min(3, (st.vst[p.woont] || 0) + 1); }
        p.moe = true;
        meld(p.i, 'Je helpt mee aan de verdediging van ' + (p.woont >= 0 ? H[p.woont].naam : 'het land') + '. Je oogst wordt wat kleiner.', 'info');
        meld(a.van, 'Boer ' + p.naam + ' versterkt ' + (p.woont >= 0 ? H[p.woont].naam : 'je land') + '.', 'goed');
        return true;
      }
      if (a.soort === 'dienst'){
        if (keuze !== 'ja'){ meld(a.van, 'Koning ' + p.naam + ' wil je diensten niet.', 'fout'); return true; }
        if (van.heer >= 0){ meld(p.i, van.naam + ' diende al een ander.', 'fout'); return true; }
        van.heer = p.i; van.trouw++;
        if (van.reserve > 0 && p.kasteel >= 0){ zet(van.i, p.i, van.reserve, p.kasteel); van.reserve = 0; }
        meld(a.van, 'Je zweert trouw aan koning ' + p.naam + '. Je soldaten wachten in zijn kasteel tot je land krijgt.', 'goed');
        log('Ridder ' + van.naam + ' zweert trouw aan koning ' + p.naam + (land(van.i) ? ', met ' + land(van.i) + ' gebieden' : '') + '.', p.rijk);
        return true;
      }
      if (a.soort === 'overloop'){
        if (keuze !== 'ja'){ meld(a.van, 'Koning ' + p.naam + ' wil je niet hebben.', 'fout'); return true; }
        var oudeHeer = van.heer;
        van.heer = p.i;
        meld(a.van, 'Je hoort nu bij koning ' + p.naam + ', met al je land.', 'goed');
        if (oudeHeer >= 0) meld(oudeHeer, 'Ridder ' + van.naam + ' is overgelopen naar koning ' + p.naam + ', met al zijn land.', 'fout');
        log('Ridder ' + van.naam + ' loopt over naar koning ' + p.naam + ', met al zijn land.', p.rijk);
        return true;
      }
      return false;
    }

    /* ---------- de klok ---------- */
    function tik(dt){
      if (st.fase === 'einde' || st.pauze) return;
      st.kt += dt;
      /* aanbiedingen die te lang bleven liggen */
      st.sp.forEach(function(p){ p.aanbod = p.aanbod.filter(function(a){ return a.tot > st.kt; }); });
      if (st.fase === 'kastelen'){
        if (st.kt >= R.kastelenTijd) beginKlok();
        return;
      }
      st.t += dt;
      var z = seizoen(), j = jaar();
      if (j > st.jaren){ einde(); return; }
      var sl = (j - 1) * 4 + z;
      if (sl !== st.seiz){ st.seiz = sl; nieuwSeizoen(z, j); }
      /* legers die aankomen */
      st.legers.slice().forEach(function(l){ if (l.mars && st.kt >= l.mars.t1) aankomst(l); });
    }
    function nieuwSeizoen(z, j){
      zeg('seizoen', z, j);
      if (z === 0){
        st.plu = [];
        st.sp.forEach(function(p){ p.moe = false; });
        /* nieuwe soldaten uit het land: wie land heeft, kan mannen oproepen */
        st.sp.forEach(function(p){
          if (p.rol === 'boer') return;
          var l = land(p.i); if (!l) return;
          var erbij = p.rol === 'koning' ? Math.max(1, Math.floor(l / 3)) : Math.max(1, Math.floor(l / 2));
          var th = thuis(p.i); if (th >= 0) zet(p.i, p.i, erbij, th);
        });
        log('Jaar ' + j + ' begint. Lente: wie land heeft, roept nieuwe soldaten op.', -1);
      } else if (z === 1) log('Zomer: het seizoen om oorlog te voeren.', -1);
      else if (z === 2) log('Herfst: het graan staat op het veld. Wie nu land plundert, pakt de oogst af.', -1);
      else { oogst(); eten(); terugUitDienst(); }
    }
    function oogst(){
      var perRijk = {};
      for (var h = 0; h < N; h++){
        var heer = st.eig[h]; if (heer < 0) continue;
        var b = boerenOp(h), geplu = st.plu.indexOf(h) >= 0, f = geplu ? R.geplunderd : 1;
        var hp = st.sp[heer];
        if (!b.length){ if (!geplu) hp.voedsel += 1; continue; }
        b.forEach(function(boer){
          var prod = Math.round(K.SOORTEN[H[h].soort].oogst * f * (boer.moe ? R.herendienstMoe : 1));
          var af = Math.round(prod * R.afdracht[hp.afdracht]);
          hp.voedsel += af; boer.voedsel += prod - af;
          var r = rijkHex(h); if (r >= 0) perRijk[r] = (perRijk[r] || 0) + prod;
          meld(boer.i, 'Oogst: ' + prod + ' voedsel' + (geplu ? ' (het land is geplunderd)' : '') + '. ' + af + ' gaat naar je heer ' + hp.naam + ', ' + (prod - af) + ' houd je zelf.', geplu ? 'fout' : 'goed');
        });
      }
      log('Winter. De oogst is binnen' + (Object.keys(perRijk).length ? ': ' + Object.keys(perRijk).map(function(r){ return st.rijken[r].naam + ' ' + perRijk[r]; }).join(', ') : ', maar er woonden nauwelijks boeren op het land') + '. Nu moet iedereen eten.', -1);
    }
    function eten(){
      st.sp.forEach(function(p){
        if (p.rol === 'boer'){
          if (p.voedsel >= R.eetBoer){ p.voedsel -= R.eetBoer; p.honger = 0; p.winters++; return; }
          p.voedsel = 0; p.honger++;
          if (p.honger >= 2 && p.woont >= 0){
            var was = p.woont; p.woont = -1; p.honger = 0;
            meld(p.i, 'Twee winters honger. Je familie trekt weg van ' + H[was].naam + ' om elders te overleven. Zoek een nieuwe heer.', 'fout');
            if (st.eig[was] >= 0) meld(st.eig[was], 'Boer ' + p.naam + ' trekt weg van ' + H[was].naam + ': de familie had honger.', 'fout');
            log('Boer ' + p.naam + ' trekt weg van ' + H[was].naam + ' na twee winters honger.', rijkHex(was));
          } else meld(p.i, 'Honger deze winter: je had te weinig voedsel. Nog een winter zo, en je familie trekt weg.', 'fout');
          return;
        }
        var nodig = R.eetHeer + soldatenVan(p.i) * R.eetSoldaat;
        if (p.voedsel >= nodig){ p.voedsel -= nodig; p.winters++; return; }
        var tekort = nodig - p.voedsel; p.voedsel = 0;
        var weg = haalWeg(p.i, tekort);
        if (weg){
          meld(p.i, 'Te weinig voedsel voor je soldaten: ' + sold(weg) + (weg === 1 ? ' liep' : ' liepen') + ' weg om niet te verhongeren.', 'fout');
          log(titel(p) + ' had te weinig voedsel: ' + sold(weg) + (weg === 1 ? ' loopt' : ' lopen') + ' weg.', rijkVan(p.i));
        }
      });
    }
    /* na de winter gaan de soldaten van de heervaart terug naar hun ridder */
    function terugUitDienst(){
      st.legers.forEach(function(l){
        if (l.eig === l.bev || l.mars) return;
        var th = thuis(l.eig);
        if (th >= 0){ l.bev = l.eig; l.hex = th; }
        else { l.bev = l.eig; }
      });
      // samenvoegen
      var oud = st.legers; st.legers = [];
      oud.forEach(function(l){ if (l.mars) st.legers.push(l); else zet(l.eig, l.bev, l.n, l.hex); });
    }
    function aankomst(l){
      var h = l.mars.naar, van = l.mars.van; l.mars = null;
      var p = st.sp[l.bev], r = rijkVan(l.bev), rh = rijkHex(h);
      st.legers = st.legers.filter(function(x){ return x !== l; });
      if (st.eig[h] < 0 && r >= 0){
        st.eig[h] = l.bev;
        zet(l.eig, l.bev, l.n, h);
        log(titel(p) + ' neemt ' + H[h].naam + ' in bezit.', r);
        zeg('bezit', h, r);
        return;
      }
      if (rh === r){ zet(l.eig, l.bev, l.n, h); return; }
      /* een gevecht */
      var verd = opHex(h).filter(function(x){ return rijkVan(x.bev) === rh; });
      var D = verd.reduce(function(s, x){ return s + x.n; }, 0);
      var isKasteel = st.sp.some(function(q){ return q.rol === 'koning' && q.kasteel === h; });
      var bo = boerenOp(h).length;
      var sterk = (D + bo * R.boer + (isKasteel ? R.muren : 0)) * K.SOORTEN[H[h].soort].verdedig * (isKasteel ? R.kasteel : 1) * (1 + R.versterk * (st.vst[h] || 0));
      var aan = l.n * (0.85 + rnd() * 0.3), ver = sterk * (0.85 + rnd() * 0.3);
      if (st.plu.indexOf(h) < 0) st.plu.push(h);
      var houder = st.eig[h], hp = st.sp[houder];
      if (aan > ver){
        var over = Math.max(1, Math.round(l.n - ver * 0.6));
        verd.forEach(function(x){ x.n = 0; });
        opruimen();
        var wasKasteelVan = isKasteel ? st.sp.filter(function(q){ return q.rol === 'koning' && q.kasteel === h; })[0] : null;
        st.eig[h] = l.bev; st.vst[h] = 0;
        zet(l.eig, l.bev, over, h);
        log(titel(p) + ' verovert ' + H[h].naam + (houder >= 0 ? ' op ' + hp.naam : '') + '. ' + (l.n - over === 0 ? 'Niemand sneuvelt.' : sold(l.n - over) + (l.n - over === 1 ? ' sneuvelt.' : ' sneuvelen.')), r);
        if (houder >= 0) meld(houder, titel(p) + ' heeft ' + H[h].naam + ' veroverd.', 'fout');
        boerenOp(h).forEach(function(b){ meld(b.i, 'Je dorp ' + H[h].naam + ' is veroverd en geplunderd door ' + p.naam + '. Je oogst wordt klein.', 'fout'); });
        meld(l.bev, 'Je hebt ' + H[h].naam + ' veroverd! ' + sold(over) + (over === 1 ? ' houdt' : ' houden') + ' het land.', 'goed');
        zeg('gevecht', h, true, r, rh);
        if (wasKasteelVan) kasteelGevallen(wasKasteelVan, l.bev);
      } else {
        var verlies = Math.min(D, Math.round(aan * 0.5)), rest = verlies;
        verd.sort(function(a, b){ return b.n - a.n; }).forEach(function(x){ var m = Math.min(x.n, rest); x.n -= m; rest -= m; });
        opruimen();
        log((houder >= 0 ? titel(hp) : 'Het land') + ' houdt ' + H[h].naam + ' tegen ' + p.naam + '. Het leger van ' + sold(l.n) + ' is verslagen.', rh);
        meld(l.bev, 'Je aanval op ' + H[h].naam + ' is mislukt. Je ' + sold(l.n) + (l.n === 1 ? ' is' : ' zijn') + ' verslagen.', 'fout');
        if (houder >= 0) meld(houder, 'Je hield ' + H[h].naam + ' tegen ' + p.naam + '!', 'goed');
        zeg('gevecht', h, false, r, rh);
      }
    }
    function kasteelGevallen(k, winnaar){
      var wk = st.sp[winnaar].rol === 'koning' ? winnaar : st.sp[winnaar].heer;
      if (wk < 0) wk = winnaar;
      var oudRijk = k.rijk;
      for (var h = 0; h < N; h++) if (st.eig[h] === k.i) st.eig[h] = wk;
      /* de ridders van de verslagen koning zijn vrij: met hun land kiezen ze zelf een nieuwe heer */
      st.sp.forEach(function(q){ if (q.rol === 'ridder' && q.heer === k.i){ q.heer = -1; meld(q.i, 'Je koning ' + k.naam + ' is verslagen. Je bent vrij, met je land. Bied een koning je diensten aan, anders sta je er alleen voor.', 'fout'); } });
      st.rijken[oudRijk].val = jaar();
      k.rol = 'ridder'; k.heer = wk; k.kasteel = -1; k.verslagen = jaar(); k.rijk = -1;
      st.legers.forEach(function(l){ if (l.bev === k.i) l.bev = k.i; });
      meld(k.i, 'Je kasteel is gevallen. Je bent nu ridder, in dienst van koning ' + st.sp[wk].naam + '. Zo ging het vaak: de verslagen heer werd vazal van de winnaar.', 'fout');
      log('Het kasteel van ' + k.naam + ' is gevallen! Zijn land gaat naar ' + st.sp[wk].naam + '; zijn ridders zijn vrij en zoeken een nieuwe heer.', st.sp[wk].rijk);
      zeg('val', oudRijk, wk);
    }
    function einde(){
      if (st.fase === 'einde') return;
      st.fase = 'einde';
      zeg('einde');
    }

    /* ---------- wat er over de lijn gaat ---------- */
    function bord(){
      var l = [], m = [], b = [], vst = [];
      for (var h = 0; h < N; h++){ b.push(boerenOp(h).length); vst.push(st.vst[h] || 0); }
      st.legers.forEach(function(x){
        if (x.mars) m.push([x.eig, x.bev, x.n, x.mars.van, x.mars.naar, +Math.max(0, x.mars.t1 - st.kt).toFixed(1), +(x.mars.t1 - x.mars.t0).toFixed(1), x.id, x.mars.pad || [x.mars.van, x.mars.naar]]);
        else l.push([x.eig, x.bev, x.n, x.hex, x.id]);
      });
      var rest = st.fase === 'kastelen' ? Math.max(0, R.kastelenTijd - st.kt) : st.sd - (st.t % st.sd);
      return { soort:'rijkbord', z:st.zaad, f:st.fase, j:Math.min(jaar(), st.jaren), jt:st.jaren, s:seizoen(), r:+rest.toFixed(1), sd:st.sd, p:st.pauze ? 1 : 0,
        sp:st.sp.map(function(p){ return [p.naam, p.rol === 'koning' ? 0 : p.rol === 'ridder' ? 1 : 2, rijkVan(p.i), p.heer, p.rol === 'koning' ? p.kasteel : -1]; }),
        e:st.eig.slice(), b:b, v:vst, g:st.plu.slice(), l:l, m:m,
        ri:st.rijken.map(function(r){ return [r.kleur, r.naam, r.koning, r.val]; }) };
    }
    function kaart(pid){
      var p = speler(pid); if (!p) return null;
      var i = p.i;
      var uit = { soort:'rijk', i:i, rol:p.rol, rijk:rijkVan(i), heer:p.heer, v:p.voedsel, so:soldatenVan(i), re:p.reserve, la:land(i),
        hg:p.honger, w:p.woont, af:p.afdracht, tr:p.trouw, kst:p.kasteel,
        hv:p.heervaart === jaar() ? 1 : 0, hd:p.herendienst === jaar() ? 1 : 0, ov:p.over === jaar() ? 1 : 0,
        ab:p.aanbod.map(function(a){ return aanbodKaart(p, a); }),
        ml:p.meld.slice(0, 3) };
      if (p.rol === 'koning') uit.rd = st.sp.filter(function(q){ return q.rol === 'ridder' && (q.heer < 0 || q.heer === i); }).map(function(q){ return q.i; });
      if (p.rol === 'boer' && p.woont >= 0 && st.eig[p.woont] >= 0) uit.haf = st.sp[st.eig[p.woont]].afdracht;
      return uit;
    }
    function aanbodKaart(p, a){
      var v = st.sp[a.van], t = Math.max(0, Math.round(a.tot - st.kt));
      if (a.soort === 'leen') return { id:a.id, kop:'Land in leen', tekst:'Koning ' + v.naam + ' biedt je ' + H[a.h].naam + ' (' + H[a.h].soort + ') in leen. Je zweert trouw: hij beschermt jou, jij levert soldaten als hij je oproept.', h:a.h, t:t,
        o:[['ja', 'Zweer trouw en neem het land'], ['nee', 'Weiger']] };
      if (a.soort === 'heervaart') return { id:a.id, kop:'De heervaart', tekst:'Koning ' + v.naam + ' roept je op. Een vazal moet met zijn soldaten komen als zijn heer dat vraagt. Ze dienen hem tot de winter.', t:t,
        o:[['alles', 'Stuur al mijn soldaten'], ['helft', 'Stuur de helft'], ['nee', 'Weiger']] };
      if (a.soort === 'herendienst') return { id:a.id, kop:'Herendienst', tekst:'Je heer ' + v.naam + ' eist dat je helpt bij de verdediging van ' + (a.h >= 0 ? H[a.h].naam : 'zijn land') + '. Het land wordt sterker, maar je oogst wordt kleiner.', h:a.h, t:t,
        o:[['ja', 'Ik help mee'], ['nee', 'Weiger']] };
      if (a.soort === 'dienst') return { id:a.id, kop:'Een ridder biedt zich aan', tekst:'Ridder ' + v.naam + ' (' + sold(soldatenVan(v.i)) + ') wil trouw aan je zweren. Daarna kun je hem land in leen geven.', t:t,
        o:[['ja', 'Neem hem in dienst'], ['nee', 'Nee']] };
      if (a.soort === 'overloop') return { id:a.id, kop:'Een ridder wil overlopen', tekst:'Ridder ' + v.naam + ' van koning ' + (v.heer >= 0 ? st.sp[v.heer].naam : '?') + ' wil met al zijn land (' + land(v.i) + (land(v.i) === 1 ? ' gebied' : ' gebieden') + ') bij jou horen.', t:t,
        o:[['ja', 'Welkom'], ['nee', 'Nee']] };
      return { id:a.id, kop:'', tekst:'', o:[] };
    }
    function uitslag(){
      var rk = st.rijken.map(function(r, ri){
        var land = 0, sold = 0, boer = 0, rid = 0;
        for (var h = 0; h < N; h++) if (rijkHex(h) === ri) land++;
        st.legers.forEach(function(l){ if (rijkVan(l.eig) === ri) sold += l.n; });
        st.sp.forEach(function(p){ if (p.rol === 'boer' && rijkVan(p.i) === ri) boer++; if (p.rol === 'ridder' && rijkVan(p.i) === ri) rid++; });
        return { r:ri, naam:r.naam, kleur:r.kleur, koning:st.sp[r.koning].naam, land:land, soldaten:sold, boeren:boer, ridders:rid, val:r.val,
                 punten:r.val ? 0 : land * 3 + sold + boer * 2 };
      });
      var ridders = st.sp.filter(function(p){ return p.rol === 'ridder'; }).map(function(p){ return { naam:p.naam, land:land(p.i), trouw:p.trouw, weiger:p.weiger, verslagen:p.verslagen, punten:land(p.i) * 3 + p.trouw * 2 + Math.floor(p.voedsel / 5) }; });
      var boeren = st.sp.filter(function(p){ return p.rol === 'boer'; }).map(function(p){ return { naam:p.naam, winters:p.winters, voedsel:p.voedsel, woont:p.woont >= 0 ? H[p.woont].naam : '', punten:p.winters * 3 + Math.floor(p.voedsel / 3) }; });
      return { rijken:rk, ridders:ridders, boeren:boeren };
    }
    function laatkomer(s){
      if (speler(s.pid)) return;
      var nr = st.sp.filter(function(p){ return p.rol === 'ridder'; }).length, nb = st.sp.filter(function(p){ return p.rol === 'boer'; }).length;
      st.sp.push(nieuweSpeler(s, st.sp.length, nr < nb * 0.55 ? 'ridder' : 'boer', -1));
    }

    return {
      stand:st, kaartdata:kaart, actie:actie, tik:tik, bord:bord, kaart:kaart, uitslag:uitslag, laatkomer:laatkomer,
      begin:beginKlok, einde:einde, bruggen:bruggenNu, speler:speler, rijkVan:rijkVan, rijkHex:rijkHex, soldatenVan:soldatenVan, land:land,
      seizoen:seizoen, jaar:jaar, R:R, kaartVan:function(){ return KRT; },
      pauze:function(aan){ st.pauze = !!aan; }
    };
  }
  var FEOMOTOR = { maak:maak, RIJKEN:RIJKEN, SEIZOENEN:SEIZOENEN, aantalKoningen:aantalKoningen };
  wereld.FEOMOTOR = FEOMOTOR;
  if (typeof module !== 'undefined' && module.exports) module.exports = FEOMOTOR;
})(typeof window !== 'undefined' ? window : globalThis);
