/* ============================================================================
   TIJDLIJN: het model en de opmaak van de Tijdlijnmaker, zonder DOM.
   Werkt in de browser (window.TIJDLIJN) en in node (module.exports), zodat de
   indeling ook zonder browser te testen is.

   Een tijdlijn:
     { v:1, id, titel, naam, klas, gemaakt, bewerkt,
       items: [ { id, soort:'g'|'p', titel, van:{j,m,d}, tot:{j,m,d} (alleen p),
                  cat, wat, waarom, gevolg, foto:{src,bron} } ],
       opdracht: { tekst, kaarten:[id...], klaar:{id:true}, hulp:{id:true} }   (alleen bij een opdracht) }
   Een datum: j = jaar (negatief is voor Christus, er is geen jaar 0), m = maand 1-12,
   d = dag. m en d mogen ontbreken: weet je alleen het jaar, dan staat de stip midden
   in dat jaar.
   ============================================================================ */
(function(g){
  'use strict';

  var SOORTEN = [
    { id: 'oorlog',   naam: 'Oorlog en geweld',        kleur: '#F26749', tekst: '#14224C', zacht: '#FCDED6' },
    { id: 'politiek', naam: 'Politiek en bestuur',     kleur: '#204ECF', tekst: '#FBF6F1', zacht: '#DCE5FB' },
    { id: 'economie', naam: 'Economie en werk',        kleur: '#EA9836', tekst: '#14224C', zacht: '#FBE8D0' },
    { id: 'techniek', naam: 'Techniek en uitvinding',  kleur: '#83A5F2', tekst: '#14224C', zacht: '#E3EBFC' },
    { id: 'mensen',   naam: 'Mensen en samenleving',   kleur: '#14224C', tekst: '#FBF6F1', zacht: '#E4E6EE' },
    { id: 'anders',   naam: 'Iets anders',             kleur: '#B9A99A', tekst: '#14224C', zacht: '#F1ECE6' }
  ];
  var SOORT = {}; SOORTEN.forEach(function(s){ SOORT[s.id] = s; });

  /* de tien tijdvakken, met begin en eind als positie (zie pos) */
  var TIJDVAKKEN = [
    { nr: 1,  naam: 'Tijd van jagers en boeren',          kort: 'Jagers en boeren',          van: -11999, tot: -2999 },
    { nr: 2,  naam: 'Tijd van Grieken en Romeinen',       kort: 'Grieken en Romeinen',       van: -2999,  tot: 500 },
    { nr: 3,  naam: 'Tijd van monniken en ridders',       kort: 'Monniken en ridders',       van: 500,    tot: 1000 },
    { nr: 4,  naam: 'Tijd van steden en staten',          kort: 'Steden en staten',          van: 1000,   tot: 1500 },
    { nr: 5,  naam: 'Tijd van ontdekkers en hervormers',  kort: 'Ontdekkers en hervormers',  van: 1500,   tot: 1600 },
    { nr: 6,  naam: 'Tijd van regenten en vorsten',       kort: 'Regenten en vorsten',       van: 1600,   tot: 1700 },
    { nr: 7,  naam: 'Tijd van pruiken en revoluties',     kort: 'Pruiken en revoluties',     van: 1700,   tot: 1800 },
    { nr: 8,  naam: 'Tijd van burgers en stoommachines',  kort: 'Burgers en stoommachines',  van: 1800,   tot: 1900 },
    { nr: 9,  naam: 'Tijd van wereldoorlogen',            kort: 'Wereldoorlogen',            van: 1900,   tot: 1950 },
    { nr: 10, naam: 'Tijd van televisie en computer',     kort: 'Televisie en computer',     van: 1950,   tot: 2030 }
  ];
  /* hoe tijdvakken heten als je alleen de jaartallen noemt */
  var TIJDVAK_JAREN = ['tot 3000 v.Chr.', '3000 v.Chr. tot 500', '500 tot 1000', '1000 tot 1500', '1500 tot 1600', '1600 tot 1700', '1700 tot 1800', '1800 tot 1900', '1900 tot 1950', '1950 tot nu'];

  var MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  var DAGEN_IN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  function geheel(x){ x = parseInt(x, 10); return isFinite(x) ? x : 0; }
  /* een datum netjes maken: een jaar is verplicht, maand en dag mogen ontbreken */
  function schoneDatum(dt){
    if (!dt) return null;
    var j = geheel(dt.j); if (!j || Math.abs(j) > 20000) return null;
    var m = geheel(dt.m), d = geheel(dt.d), uit = { j: j };
    if (m >= 1 && m <= 12){ uit.m = m; if (d >= 1 && d <= DAGEN_IN[m - 1]) uit.d = d; }
    return uit;
  }
  /* de plek op de tijdlijn in jaren: 1 v.Chr. ligt vlak voor 1 n.Chr., zonder jaar 0 ertussen */
  function pos(dt){
    if (!dt) return 0;
    var j = dt.j < 0 ? dt.j + 1 : dt.j, f;
    if (dt.m){ f = (dt.m - 1) / 12 + (dt.d ? (dt.d - 0.5) / (DAGEN_IN[dt.m - 1] * 12) : 1 / 24); }
    else f = 0.5;
    return j + f;
  }
  /* het eind van een periode: tot en met dat jaar (of die maand) */
  function posEind(dt){
    if (!dt) return 0;
    if (dt.d) return pos(dt);
    var j = dt.j < 0 ? dt.j + 1 : dt.j;
    return dt.m ? j + dt.m / 12 : j + 1;
  }
  function posBegin(dt){
    if (!dt) return 0;
    if (dt.d) return pos(dt);
    var j = dt.j < 0 ? dt.j + 1 : dt.j;
    return dt.m ? j + (dt.m - 1) / 12 : j;
  }
  function jaarTekst(j){ return j < 0 ? (-j) + ' v.Chr.' : String(j); }
  function datumTekst(dt){
    if (!dt) return '';
    return (dt.d ? dt.d + ' ' : '') + (dt.m ? MAANDEN[dt.m - 1] + ' ' : '') + jaarTekst(dt.j);
  }
  /* een plek op de tijdlijn terug naar een jaartal (voor de assen en voor slepen) */
  function jaarVan(p){ var j = Math.floor(p); return j <= 0 ? j - 1 : j; }
  function asTekst(p){ var j = Math.round(p); return j <= 0 ? (1 - j) + ' v.Chr.' : String(j); }

  function eindVan(it){ return it.soort === 'p' ? posEind(it.tot || it.van) : pos(it.van); }
  function beginVan(it){ return it.soort === 'p' ? posBegin(it.van) : pos(it.van); }

  /* welk stuk van de tijd laten we zien: alles wat erop staat, met wat ruimte eromheen */
  function bereik(items, vast){
    if (vast && isFinite(vast.van) && isFinite(vast.tot) && vast.tot > vast.van) return { van: vast.van, tot: vast.tot };
    var lo = Infinity, hi = -Infinity;
    (items || []).forEach(function(it){ if (!it.van) return; lo = Math.min(lo, beginVan(it)); hi = Math.max(hi, eindVan(it)); });
    if (!isFinite(lo)) return { van: 1900, tot: 2000 };
    var span = Math.max(4, hi - lo), rand = Math.max(1, span * 0.06);
    var stap = mooieStap(span / 8);
    return { van: Math.floor((lo - rand) / stap) * stap, tot: Math.ceil((hi + rand) / stap) * stap };
  }
  /* een rond getal als afstand tussen jaartallen op de as */
  function mooieStap(ruw){
    var r = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000];
    for (var i = 0; i < r.length; i++) if (r[i] >= ruw) return r[i];
    return 10000;
  }
  function tijdvakkenIn(van, tot){ return TIJDVAKKEN.filter(function(t){ return t.tot > van && t.van < tot; }); }

  /* tekstbreedte schatten (Poppins 12px), voor wie geen echte meetlat heeft */
  function schatBreed(s, px){ return Math.ceil(String(s || '').length * (px || 12) * 0.56) + 2; }

  /* ---------- de indeling ----------
     o: { pxPerJaar, van, tot, kaartBreed, kaartHoog, meet(tekst, px), boven (max rijen boven de as) }
     Geeft terug: posities in px binnen een vlak van breed x hoog, met de as op asY. */
  function opmaak(model, o){
    o = o || {};
    var items = (model.items || []).filter(function(it){ return it.van && (!o.verberg || !o.verberg[it.id]); });
    var van = o.van, tot = o.tot, ppj = o.pxPerJaar, KB = o.kaartBreed || 150, KH = o.kaartHoog || 54;
    var meet = o.meet || schatBreed, RAND = 24;
    var X = function(p){ return Math.round(RAND + (p - van) * ppj); };
    var breed = Math.round(RAND * 2 + (tot - van) * ppj);
    var gebeurt = items.filter(function(it){ return it.soort !== 'p'; }).map(function(it){ return { it: it, p: pos(it.van) }; })
      .sort(function(a, b){ return a.p - b.p || String(a.it.id).localeCompare(String(b.it.id)); });
    var perioden = items.filter(function(it){ return it.soort === 'p'; }).map(function(it){ return { it: it, a: posBegin(it.van), b: posEind(it.tot || it.van) }; })
      .sort(function(a, b){ return a.a - b.a || b.b - a.b; });

    /* stippen: precies op hun moment; liggen ze te dicht bij elkaar, dan schuiven ze een
       klein stukje opzij (de echte plek blijft als streepje op de as staan) */
    var STIP = 28, GAT = 3;
    gebeurt.forEach(function(e, i){ e.x = X(e.p); e.nr = i + 1; });
    var groepen = [], g = [];
    gebeurt.forEach(function(e){ if (g.length && e.x - g[g.length - 1].x >= STIP + GAT){ groepen.push(g); g = []; } g.push(e); });
    if (g.length) groepen.push(g);
    /* binnen een groep naast elkaar, rond het midden van de groep */
    groepen.forEach(function(gr){
      var midden = (gr[0].x + gr[gr.length - 1].x) / 2, totaal = (gr.length - 1) * (STIP + GAT);
      gr.forEach(function(e, k){ e.sx = Math.round(midden - totaal / 2 + k * (STIP + GAT)); });
    });
    /* groepen die door het uitspreiden toch tegen elkaar komen: nog een keer van links naar rechts */
    var vorige = -Infinity;
    gebeurt.forEach(function(e){ if (e.sx < vorige + STIP + GAT) e.sx = vorige + STIP + GAT; vorige = e.sx; });

    /* kaartjes boven de as, in rijen: de eerste rij waarin het past */
    /* Een rij is vrij als daar geen kaartje in de weg zit, en als de steel naar de stip
       niet door een kaartje in een lagere rij loopt. Het kaartje mag rechts of links van
       zijn stip hangen; rechts heeft de voorkeur. */
    var MAXB = o.boven || 4, boven = [], onder = [];
    function zoek(lijst, e, max){
      var kandidaten = [e.sx - 18, e.sx - KB + 18].map(function(l){ return Math.max(4, Math.min(l, breed - KB - 4)); });
      for (var k = 0; k < kandidaten.length; k++){
        for (var r = 0; r < max; r++){
          var l = kandidaten[k], vrij = lijst.every(function(c){
            if (c.rij === r) return c.r + 10 <= l || l + KB + 10 <= c.l;
            if (c.rij < r) return !(c.l - 6 <= e.sx && e.sx <= c.r + 6);
            return !(l - 6 <= c.sx && c.sx <= l + KB + 6);
          });
          if (vrij) return { rij: r, l: l };
        }
      }
      return null;
    }
    /* van rechts naar links: dan rijzen dichte groepjes als een trap op naar links en loopt geen steel door een kaartje */
    gebeurt.slice().reverse().forEach(function(e){
      var plek = zoek(boven, e, MAXB);
      if (plek){ e.rij = plek.rij; e.links = plek.l; boven.push({ rij: plek.rij, l: plek.l, r: plek.l + KB, sx: e.sx }); return; }
      plek = zoek(onder, e, 30) || { rij: onder.length, l: Math.max(4, Math.min(e.sx - 18, breed - KB - 4)) };
      e.onder = true; e.rij = plek.rij; e.links = plek.l; onder.push({ rij: plek.rij, l: plek.l, r: plek.l + KB, sx: e.sx });
    });
    var rijenBoven = Math.max(1, boven.reduce(function(m, c){ return Math.max(m, c.rij + 1); }, 0)), rijenOnder = onder.reduce(function(m, c){ return Math.max(m, c.rij + 1); }, 0);

    /* perioden onder de as, in rijen; de naam staat erin als hij past, anders ernaast */
    var PH = o.periodeHoog || 24, perEind = [];
    perioden.forEach(function(e){
      e.x1 = X(e.a); e.x2 = Math.max(e.x1 + 6, X(e.b));
      var lb = meet(e.it.titel, 12) + 20;
      e.binnen = e.x2 - e.x1 >= lb;
      /* past de naam er niet in: rechts ernaast, of links als rechts geen ruimte is */
      e.naastLinks = !e.binnen && e.x2 + 8 + lb > breed - 4;
      var bezet1 = e.binnen ? e.x1 : (e.naastLinks ? e.x1 - 8 - lb : e.x1), bezet2 = e.binnen ? e.x2 : (e.naastLinks ? e.x2 : e.x2 + 8 + lb);
      e.lb = lb;
      for (var r = 0; ; r++){ if (perEind[r] === undefined || perEind[r] + 8 <= bezet1){ e.rij = r; perEind[r] = bezet2; return; } }
    });
    var rijenPer = perEind.length;

    /* van boven naar beneden: tijdvakband, kaartrijen, stippen en as, perioden, kaartrijen onder, jaartallen */
    var BAND = o.band === false ? 0 : 30, RIJ = KH + 12;
    var asY = BAND + 8 + rijenBoven * RIJ + 26;
    var perTop = asY + 24, onderTop = perTop + rijenPer * (PH + 8) + (rijenPer ? 10 : 0) + 16;
    var hoog = onderTop + rijenOnder * RIJ + 30;

    gebeurt.forEach(function(e){
      e.top = e.onder ? onderTop + e.rij * RIJ : asY - 26 - (e.rij + 1) * RIJ + 12;
      e.stamTop = e.onder ? asY + STIP / 2 : e.top + KH;
      e.stamBodem = e.onder ? e.top : asY - STIP / 2;
    });
    perioden.forEach(function(e){ e.top = perTop + e.rij * (PH + 8); });

    /* jaartallen: een mooie stap, minstens 80 px uit elkaar */
    var stap = mooieStap(80 / ppj), streepjes = [];
    for (var t = Math.ceil(van / stap) * stap; t <= tot + 1e-9; t += stap){
      /* voor de as is dat afgerond genoeg: de streep bij -100 heet 100 v.Chr. */
      streepjes.push({ x: X(t), tekst: t < 0 ? (-t) + ' v.Chr.' : String(t) });
    }
    var band = BAND ? tijdvakkenIn(van, tot).map(function(t){ return { nr: t.nr, naam: t.naam, kort: t.kort, x1: Math.max(0, X(t.van)), x2: Math.min(breed, X(t.tot)) }; }) : [];

    return { breed: breed, hoog: hoog, asY: asY, X: X, van: van, tot: tot, ppj: ppj, kaartBreed: KB, kaartHoog: KH, periodeHoog: PH,
      gebeurt: gebeurt, perioden: perioden, streepjes: streepjes, band: band, stip: STIP };
  }

  /* de nummers van de gebeurtenissen: op volgorde van tijd, zoals de stippen */
  function nummers(model){
    var uit = {};
    (model.items || []).filter(function(it){ return it.van && it.soort !== 'p'; })
      .map(function(it){ return { id: it.id, p: pos(it.van) }; })
      .sort(function(a, b){ return a.p - b.p || String(a.id).localeCompare(String(b.id)); })
      .forEach(function(e, i){ uit[e.id] = i + 1; });
    return uit;
  }

  /* waar een jaar ligt als je een kaartje op x neerlegt (voor de opdracht met kaartjes) */
  function posBijX(lay, x){ return lay.van + (x - 24) / lay.ppj; }
  /* goed geplaatst? Binnen een halve kaartbreedte of binnen een jaar, wat het ruimste is */
  function dichtBij(lay, it, x){
    var p = pos(it.van), marge = Math.max(0.75, 40 / lay.ppj);
    var gelegd = posBijX(lay, x);
    return { goed: Math.abs(gelegd - p) <= marge, teVroeg: gelegd < p - marge, teLaat: gelegd > p + marge, verschil: gelegd - p };
  }

  /* ---------- het model netjes houden ---------- */
  function nieuwId(){ return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }
  function kort(s, n){ s = String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim(); return s.length > n ? s.slice(0, n) : s; }
  function schoonItem(it){
    if (!it || typeof it !== 'object') return null;
    var uit = { id: kort(it.id, 24) || nieuwId(), soort: it.soort === 'p' ? 'p' : 'g', titel: kort(it.titel, 80), van: schoneDatum(it.van), cat: SOORT[it.cat] ? it.cat : 'anders' };
    if (!uit.van) return null;
    if (uit.soort === 'p'){ uit.tot = schoneDatum(it.tot) || { j: uit.van.j }; if (posEind(uit.tot) < posBegin(uit.van)){ var w = uit.tot; uit.tot = uit.van; uit.van = w; } }
    ['wat', 'waarom', 'gevolg'].forEach(function(k){ if (it[k]) uit[k] = kort(it[k], 1200); });
    if (it.foto && typeof it.foto.src === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(it.foto.src) && it.foto.src.length < 400000)
      uit.foto = { src: it.foto.src, bron: kort(it.foto.bron, 160) };
    if (it.kaart) uit.kaart = true;
    return uit;
  }
  function schoonModel(m){
    m = m && typeof m === 'object' ? m : {};
    var uit = { v: 1, id: kort(m.id, 24) || nieuwId(), titel: kort(m.titel, 80) || 'Mijn tijdlijn', naam: kort(m.naam, 60), klas: kort(m.klas, 20),
      gemaakt: +m.gemaakt || Date.now(), bewerkt: +m.bewerkt || Date.now(), items: [] };
    (Array.isArray(m.items) ? m.items : []).slice(0, 120).forEach(function(it){ var s = schoonItem(it); if (s) uit.items.push(s); });
    if (m.opdracht && typeof m.opdracht === 'object'){
      var ids = {}; uit.items.forEach(function(it){ ids[it.id] = true; });
      uit.opdracht = { tekst: kort(m.opdracht.tekst, 400), klaar: {}, hulp: {}, pogingen: {} };
      ['klaar', 'hulp'].forEach(function(k){ var o2 = m.opdracht[k] || {}; Object.keys(o2).forEach(function(id){ if (ids[id] && o2[id]) uit.opdracht[k][id] = true; }); });
      var pg = m.opdracht.pogingen || {}; Object.keys(pg).forEach(function(id){ if (ids[id]) uit.opdracht.pogingen[id] = Math.min(99, geheel(pg[id])); });
      if (m.opdracht.code) uit.opdracht.code = kort(m.opdracht.code, 20);
    }
    if (m.bereik && isFinite(m.bereik.van) && isFinite(m.bereik.tot) && m.bereik.tot > m.bereik.van) uit.bereik = { van: +m.bereik.van, tot: +m.bereik.tot };
    if (m.tijdvak >= 1 && m.tijdvak <= 10) uit.tijdvak = geheel(m.tijdvak);
    return uit;
  }
  /* wat er nog moet gebeuren, voor "Is je tijdlijn af?" */
  function checklijst(m){
    var g2 = m.items.filter(function(it){ return it.soort !== 'p'; });
    var metUitleg = m.items.filter(function(it){ return (it.wat || it.waarom || it.gevolg || '').trim(); }).length;
    var lijst = [
      { ok: g2.length >= 5, tekst: g2.length >= 5 ? g2.length + ' gebeurtenissen' : 'Minstens 5 gebeurtenissen (nu ' + g2.length + ')' },
      { ok: !!(m.titel && m.titel !== 'Mijn tijdlijn' && m.naam), tekst: 'Een titel en je naam' },
      { ok: m.items.length > 0 && metUitleg === m.items.length, tekst: 'Uitleg bij alles: ' + metUitleg + ' van de ' + m.items.length }
    ];
    if (m.opdracht){ var kaarten = m.items.filter(function(it){ return it.kaart; }); var goed = kaarten.filter(function(it){ return m.opdracht.klaar[it.id]; }).length; lijst.unshift({ ok: goed === kaarten.length, tekst: 'Kaartjes op hun plek: ' + goed + ' van de ' + kaarten.length }); }
    return lijst;
  }

  var API = { SOORTEN: SOORTEN, SOORT: SOORT, TIJDVAKKEN: TIJDVAKKEN, TIJDVAK_JAREN: TIJDVAK_JAREN, MAANDEN: MAANDEN,
    pos: pos, posBegin: posBegin, posEind: posEind, beginVan: beginVan, eindVan: eindVan, jaarVan: jaarVan, asTekst: asTekst,
    jaarTekst: jaarTekst, datumTekst: datumTekst, schoneDatum: schoneDatum, bereik: bereik, mooieStap: mooieStap,
    tijdvakkenIn: tijdvakkenIn, opmaak: opmaak, nummers: nummers, posBijX: posBijX, dichtBij: dichtBij, nieuwId: nieuwId,
    schoonItem: schoonItem, schoonModel: schoonModel, checklijst: checklijst, schatBreed: schatBreed };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else g.TIJDLIJN = API;
})(typeof window !== 'undefined' ? window : this);
