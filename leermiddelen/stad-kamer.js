/* De kamer van De stad: een potje, los van waar het draait.

   De motor (stad-motor.js) rekent de wereld. De kamer zit ertussen en de
   spelers: hij neemt hun berichten aan, deelt vragen uit en kijkt ze na,
   laadt en bewaart personages, en maakt voor elke speler zijn pakket.

   Hij draait op drie plekken, met telkens een andere bron voor de vragen en
   een andere opslag:
     - in de spelkamer op de server (server/stad.js): vragen uit
       stad-vragen/<vak>.json, personages in het Durable Object Stadheld;
     - in de browser als je alleen oefent: vragen uit bank.js, personage in
       localStorage;
     - in Node voor de tests.

   Waarom de vragen hier gekozen en nagekeken worden en niet in de browser: de
   kamer beslist over XP, goud en of een kist opengaat. Dan moet hij ook zelf
   weten wat het goede antwoord was. De browser krijgt de vraag en de opties
   zonder het antwoord, stuurt een nummer terug, en hoort daarna pas wat goed
   was.

   Gebruik:
     var K = STADKAMER.maak({ seed, bron, opslag, zend: function(nr, bericht){}, klok });
     K.erbij({ key, naam, av, klasse, vak, delen, rang }) -> Promise { nr } of { fout }
     K.bericht(nr, m)          een bericht van speler nr (al uit JSON)
     K.stap(dt)                een stap van de klok
     K.pakket(nr)              de stand voor speler nr, met de meldingen erbij
     K.weg(nr)                 hij is weg

   bron:   { vragen(vak) -> Promise [ { v, o, g, u, t, n, k, svg?, vlag? } ] }
   opslag: { laad(key) -> Promise { helden, v, wacht },
             bewaar(key, klasse, held, v) -> Promise { ok, v, fout },
             wacht(key, wacht) -> Promise }
   Laadt als gewoon script in de browser (STADKAMER op window) en als module
   op de server; de motor moet er dan al zijn (STADMOTOR op globalThis). */
(function(g){
'use strict';

var VRAAG_LEEFT = 120;          /* seconden: een vraag die zo lang openstaat vervalt */
var BERICHTEN_PER_S = 90;       /* meer dan dit van een speler wordt genegeerd */
var KLASSEN = ['ridder', 'schutter', 'wacht'];

function schoon(t, n){ return String(t == null ? '' : t).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n || 40); }

/* ---------- rekensommen ----------
   De terugval als de vragen van een vak niet te laden zijn, en genoeg om
   mee te oefenen. Het niveau bepaalt hoe groot de getallen zijn. */
function rekenSom(rang){
  function r(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
  var soort = r(0, rang >= 3 ? 3 : 2), a, b, goed, v, t;
  if (soort === 0){ a = r(2, 5 + rang * 2); b = r(2, 9 + rang); goed = a * b; v = 'Hoeveel is ' + a + ' × ' + b + '?'; t = 'tafels'; }
  else if (soort === 1){ a = r(10, 40 * rang); b = r(10, 40 * rang); goed = a + b; v = 'Hoeveel is ' + a + ' + ' + b + '?'; t = 'hoofd'; }
  else if (soort === 2){ a = r(30, 60 * rang); b = r(5, a - 5); goed = a - b; v = 'Hoeveel is ' + a + ' − ' + b + '?'; t = 'hoofd'; }
  else { a = [10, 20, 25, 50][r(0, 3)]; b = r(1, 12) * 20; goed = a * b / 100; v = 'Hoeveel is ' + a + '% van ' + b + '?'; t = 'procent'; }
  var o = [goed], p = 0;
  while (o.length < 4 && p++ < 50){ var f = goed + r(-6, 6) * (soort === 0 ? Math.max(1, Math.round(goed / 12)) : 1); if (f !== goed && f >= 0 && o.indexOf(f) < 0) o.push(f); }
  while (o.length < 4) o.push(goed + o.length * 3);
  return { v: v, o: o.map(String), g: 0, u: 'Het goede antwoord is ' + goed + '.', t: t, n: rang, k: 'rekenen' };
}

function maak(opzet){
  var M = g.STADMOTOR;
  if (!M) throw new Error('stad-kamer: stad-motor.js moet eerder geladen zijn');
  opzet = opzet || {};
  var bron = opzet.bron || { vragen: function(){ return Promise.resolve([]); } };
  var opslag = opzet.opslag || { laad: function(){ return Promise.resolve({ helden: {}, v: 0, wacht: {} }); },
                                 bewaar: function(){ return Promise.resolve({ ok: true, v: 1 }); }, wacht: function(){ return Promise.resolve(); } };
  var zend = opzet.zend || function(){};
  var klok = opzet.klok || function(){ return Date.now(); };
  var log = opzet.log || function(){};

  var sp = [];                  /* per spelernummer: wat de kamer over hem weet */
  var banken = {};              /* vak -> Promise van de lijst */
  var W = M.maak({ seed: opzet.seed || ((Date.now() ^ 0x9e3779b9) >>> 0), klok: klok,
    haak: {
      gered: function(nr){ bewaar(nr); },
      wacht: function(nr){ var s = sp[nr]; if (s && s.key) Promise.resolve(opslag.wacht(s.key, W.wachtVan(nr))).catch(function(){}); }
    } });

  function stuur(nr, m){ try { zend(nr, m); } catch (e){ log('zend', e); } }
  function melding(nr, tekst){ stuur(nr, { t: 'melding', tekst: tekst }); }

  /* ---------- erbij ---------- */
  function erbij(o){
    o = o || {};
    var key = schoon(o.key, 80);
    if (!key) return Promise.resolve({ fout: 'geen sleutel' });
    var klasse = KLASSEN.indexOf(o.klasse) >= 0 ? o.klasse : 'ridder';
    var rang = Math.max(1, Math.min(4, Math.floor(+o.rang) || 2));
    var vak = schoon(o.vak, 8) || 'reken';
    var ids = Array.isArray(o.delen) ? o.delen.slice(0, 40).map(function(d){ return schoon(d && typeof d === 'object' ? d.id : d, 40); }).filter(Boolean) : [];
    var delen = [];
    /* de vragen van dit vak eerst: daar staan ook de namen van de onderdelen in */
    return bank(vak).then(function(lijst){
      var namen = (lijst && lijst.delen) || {};
      delen = ids.map(function(id){ return { id: id, naam: schoon(namen[id] || id, 60) }; });
      return opslag.laad(key);
    }).then(function(r){
      r = r || {};
      var helden = r.helden || {};
      var nr = W.erbij({ naam: schoon(o.naam, 16) || 'Speler', av: schoon(o.av, 40), klasse: klasse, held: helden[klasse] || null, wacht: r.wacht || {}, delen: delen });
      sp[nr] = { key: key, klasse: klasse, v: r.v || 0, vak: vak, rang: rang, delen: delen, vraag: null, pot: null, potSleutel: '',
                 tel: 0, telSec: 0, weg: false };
      return { nr: nr, held: W.held(nr), klasse: klasse };
    }).catch(function(e){ log('laad', e); return { fout: 'je personage kon niet geladen worden' }; });
  }

  /* ---------- vragen ---------- */
  function bank(vak){
    if (!banken[vak]){
      banken[vak] = Promise.resolve().then(function(){ return bron.vragen(vak); }).then(function(l){ return Array.isArray(l) ? l : []; })
        .catch(function(e){ log('bank', vak, e); return []; });
    }
    return banken[vak];
  }
  /* Een vraag kiezen zoals Zwaardvechter dat doet: binnen de gekozen
     onderdelen, rond het gekozen niveau en nooit erboven, tenzij er bijna
     niets is. Een stapel per speler, zodat een vraag niet snel terugkomt. */
  function kiesVraag(s, lijst, alleenT){
    if (!lijst.length) return rekenSom(s.rang);
    var r = s.rang, delen = s.delen.map(function(d){ return d.id; });
    var sleutel = (alleenT || '') + '|' + delen.join(',');
    if (!s.pot || !s.pot.length || s.potSleutel !== sleutel){
      var mag = function(q){ return alleenT ? q.t === alleenT : (!delen.length || delen.indexOf(q.t) >= 0); };
      var alles = [];
      lijst.forEach(function(q, i){ if (mag(q)) alles.push(i); });
      if (!alles.length) lijst.forEach(function(q, i){ alles.push(i); });
      var onder = r >= 4 ? r - 2 : r - 1;
      var ids = alles.filter(function(i){ var n = lijst[i].n || 2; return n <= r && n >= onder; });
      if (ids.length < 14) ids = alles.filter(function(i){ return (lijst[i].n || 2) <= r; });
      if (ids.length < 4) ids = alles.filter(function(i){ return (lijst[i].n || 2) <= r + 1; });
      if (!ids.length) ids = alles;
      for (var k = ids.length - 1; k > 0; k--){ var j = Math.floor(Math.random() * (k + 1)), h = ids[k]; ids[k] = ids[j]; ids[j] = h; }
      s.pot = ids; s.potSleutel = sleutel;
    }
    return lijst[s.pot.pop()] || rekenSom(r);
  }
  function husselen(q){
    var paren = q.o.map(function(t, i){ return { t: t, g: i === q.g }; });
    for (var i = paren.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), h = paren[i]; paren[i] = paren[j]; paren[j] = h; }
    return { o: paren.map(function(p){ return p.t; }), g: paren.findIndex(function(p){ return p.g; }) };
  }
  function nieuwNummer(){ return Math.random().toString(36).slice(2, 10); }

  /* Een vraag openen bij iets in de wereld. Eerst het leesschild; lukt dat
     niet (je bent in gevecht), dan geen vraag. */
  function openVraag(nr, wat, doel){
    var s = sp[nr]; if (!s || s.vraag) return;
    var st = W.schildAan(nr);
    if (!st || !st.ok){
      if (st && st.fout === 'gevecht') melding(nr, 'Je bent in gevecht. Loop eerst weg bij de vijanden, dan kun je een vraag openen.');
      else if (st && st.fout === 'wacht') melding(nr, 'Even op adem komen: over ' + st.s + ' tellen kun je weer een vraag openen.');
      return;
    }
    var nummer = nieuwNummer();
    s.vraag = { id: nummer, wat: wat, doel: doel, klaar: false, sinds: W.tijd, q: null, g: -1 };
    var questT = W.questOnderdeel(nr);
    var alleenT = wat === 'lees' ? (questT || '') : (questT && Math.random() < 0.5 ? questT : '');
    bank(s.vak).then(function(lijst){
      if (!s.vraag || s.vraag.id !== nummer) return;
      var q = kiesVraag(s, lijst, alleenT || null);
      var h = husselen(q);
      s.vraag.q = q; s.vraag.g = h.g; s.vraag.o = h.o;
      var uit = { t: 'vraag', id: nummer, wat: wat, v: q.v, o: h.o, kop: q.k || '', schild: st.schild || 0 };
      if (q.svg) uit.svg = q.svg;
      if (q.vlag) uit.vlag = q.vlag;
      stuur(nr, uit);
    });
  }
  function antwoord(nr, m){
    var s = sp[nr], v = s && s.vraag;
    if (!v || v.klaar || !v.q || m.id !== v.id) return;
    var i = Math.floor(+m.i);
    if (!(i >= 0 && i < v.o.length)) return;
    v.klaar = true;
    var goed = i === v.g, q = v.q, uit = { t: 'uitslag', id: v.id, goed: goed, g: v.g, u: q.u || '' };
    if (goed){
      W.vraagGoed(nr, q.t);
      if (v.wat === 'kist'){ var k = W.kistOpen(nr, v.doel); uit.kist = k; if (!k) uit.mis = 'De kist was al open.'; }
      else if (v.wat === 'steen'){ var b = W.steenGoed(nr, v.doel); uit.steen = b; }
      else if (v.wat === 'uitgang'){
        /* bij een uitgang gaat het schild er meteen af: nu begint het wachten, en dat is het spannende deel */
        W.schildUit(nr);
        uit.extract = W.startExtract(nr, v.doel);
        s.vraag = null;
      }
    } else {
      W.vraagFout(nr, v.wat, v.doel);
      /* voor de foutenmap: de vraag zoals hij in de bank staat */
      uit.q = { v: q.v, o: v.o, g: v.g, u: q.u || '', t: q.t || '' };
    }
    stuur(nr, uit);
  }
  function sluitVraag(nr){
    var s = sp[nr]; if (!s) return;
    s.vraag = null;
    W.schildUit(nr);
  }

  /* ---------- figuren in de stad ---------- */
  function npcPaneel(nr, npc){
    var p = W.spelers[nr]; if (!p) return;
    var d = W.npcStand(nr, npc);
    if (!d) return;
    if (npc === 'trainer'){ d.stats = M.STATS.map(function(k){ return p.stats[k]; }); d.punten = p.punten; d.max = M.STAT_MAX; d.prijs = M.HERVERDEEL; }
    if (npc === 'handelaar'){ d.drank = p.drank; d.max = M.DRANK.max; d.prijs = M.DRANK.prijs; }
    d.goud = p.goud; d.buit = p.buit;
    stuur(nr, { t: 'npc', d: d });
  }

  /* ---------- bewaren ----------
     Na een extractie: het personage naar de opslag. Pas als de opslag ja
     zegt, zegt de kamer tegen de speler dat het bewaard is. */
  function bewaar(nr){
    var s = sp[nr]; if (!s) return;
    var held = W.held(nr), sam = W.samenvatting(nr);
    Promise.resolve(opslag.bewaar(s.key, s.klasse, held, s.v)).then(function(r){
      if (r && r.ok){ s.v = r.v; stuur(nr, { t: 'gered', ok: true, held: held, sam: sam }); }
      else stuur(nr, { t: 'gered', ok: false, fout: (r && r.fout) || 'bewaren lukte niet', held: held, sam: sam });
      if (opslag.wacht) Promise.resolve(opslag.wacht(s.key, W.wachtVan(nr))).catch(function(){});
    }).catch(function(e){
      log('bewaar', e);
      stuur(nr, { t: 'gered', ok: false, fout: 'bewaren lukte niet', held: held, sam: sam });
    });
  }

  /* ---------- berichten ---------- */
  function bericht(nr, m){
    var s = sp[nr], p = W.spelers[nr];
    if (!s || !p || !m || typeof m !== 'object') return;
    /* een rem op wie te veel stuurt: er valt niets mee te winnen, maar het kost de kamer wel */
    var t = m.t;
    /* sluiten en weggaan tellen niet mee: die moeten altijd aankomen, anders blijft iemand lezen */
    if (t === 'sluit'){ sluitVraag(nr); return; }
    if (t === 'weg'){ weg(nr); return; }
    var sec = Math.floor(klok() / 1000);
    if (sec !== s.telSec){ s.telSec = sec; s.tel = 0; }
    if (++s.tel > BERICHTEN_PER_S) return;
    if (t === 'in'){ W.zetInvoer(nr, m.dx, m.dy, !!m.b); return; }
    if (t === 'ontwijk'){ W.ontwijk(nr); return; }
    if (t === 'wapen'){ W.wapen(nr); return; }
    if (t === 'kracht'){ W.kracht(nr); return; }
    if (t === 'drink'){ W.drink(nr); return; }
    if (t === 'antw'){ antwoord(nr, m); return; }
    if (t === 'sluit'){ sluitVraag(nr); return; }
    if (t === 'gebruik'){
      if (s.vraag) return;
      var wat = W.gebruik(nr);
      if (!wat){ melding(nr, 'Hier is niets om te gebruiken.'); return; }
      if (wat.wat === 'npc'){ npcPaneel(nr, wat.npc); return; }
      if (wat.wat === 'lees'){
        if (W.questOnderdeel(nr) === null){ melding(nr, 'De leestafel is voor de quest van De geleerde. Haal eerst een quest bij hem.'); return; }
        openVraag(nr, 'lees', 0); return;
      }
      if (wat.slot){ melding(nr, wat.wat === 'kist' ? 'Deze kist blijft voor jou nog ' + wat.slot + ' tellen dicht.' : 'Deze steen laadt nog op: nog ' + wat.slot + ' tellen.'); return; }
      openVraag(nr, wat.wat, wat.id);
      return;
    }
    if (t === 'npc'){ var n = W.gebruik(nr); if (n && n.wat === 'npc' && n.npc === m.npc) npcPaneel(nr, m.npc); return; }
    if (t === 'quest'){
      if (m.doe === 'neem') W.questNeem(nr, m.gever); else if (m.doe === 'weg') W.questWeg(nr, m.gever);
      npcPaneel(nr, m.gever); return;
    }
    if (t === 'punt'){ W.zetPunt(nr, m.stat); npcPaneel(nr, 'trainer'); return; }
    if (t === 'herverdeel'){ W.herverdeel(nr); npcPaneel(nr, 'trainer'); return; }
    if (t === 'koop'){ W.koop(nr, m.wat); npcPaneel(nr, 'handelaar'); return; }
    if (t === 'verder'){ W.naarStad(nr); return; }
    if (t === 'weg'){ weg(nr); return; }
  }

  /* Terug na een weggevallen verbinding: een vraag die nog openstond is weg
     (de pagina weet er niets meer van), dus ook het schild en het lezen. */
  function terug(nr){
    var s = sp[nr]; if (!s) return;
    s.vraag = null; s.weg = false;
    W.schildUit(nr);
    W.zetInvoer(nr, 0, 0, false);
    W.vergeet(nr);
  }
  function weg(nr){
    var s = sp[nr]; if (!s || s.weg) return;
    s.weg = true; s.vraag = null;
    W.eruit(nr);
  }

  /* ---------- de klok ---------- */
  function stap(dt){
    W.stap(dt);
    /* een vraag die te lang openstaat vervalt, en dan gaat ook het schild eraf */
    for (var nr = 0; nr < sp.length; nr++){
      var s = sp[nr];
      if (s && s.vraag && W.tijd - s.vraag.sinds > VRAAG_LEEFT){ s.vraag = null; W.schildUit(nr); stuur(nr, { t: 'vraagweg' }); }
      var p = W.spelers[nr];
      if (s && s.vraag && p && p.neer){ s.vraag = null; stuur(nr, { t: 'vraagweg' }); }
    }
  }
  function pakket(nr){
    var d = W.pakketVoor(nr);
    if (!d) return null;
    var e = W.meldingen(nr);
    if (e) d.e = e;
    return d;
  }

  return { W: W, erbij: erbij, bericht: bericht, stap: stap, pakket: pakket, weg: weg, terug: terug,
           wereld: function(){ return W.wereldPakket(); }, spelers: function(){ return sp; },
           bewaar: bewaar, bank: bank };
}

g.STADKAMER = { maak: maak, rekenSom: rekenSom, KLASSEN: KLASSEN };
})(typeof globalThis !== 'undefined' ? globalThis : this);
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.STADKAMER;
