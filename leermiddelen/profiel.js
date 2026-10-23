/* De speelcode: voortgang meenemen naar een ander apparaat, zonder account.
   Alles wat een spel op dit apparaat bewaart (beste scores en sterren per
   spel, de campagne, vrijgespeelde omgevingen, de klascode met bijnaam, de
   eigen avatar) gaat onder een code van acht letters naar de server. Op een
   ander apparaat vul je de code in en alles staat er weer. Geen naam, geen
   e-mail, geen wachtwoord; wie de code heeft, heeft het profiel.

   Gebruik:
     PROFIEL.code()             de code op dit apparaat, of ''
     PROFIEL.avatar()           de eigen avatar als spec ('v3k2o1m0e4'), of ''
     PROFIEL.zetAvatar(spec)    bewaren en meesturen
     PROFIEL.maak()             een code maken (belofte met { code })
     PROFIEL.koppel(code)       een bestaande code op dit apparaat zetten
     PROFIEL.sync()             wat hier staat naar de server, samengevoegd terug
     PROFIEL.wis()              de code van dit apparaat halen (profiel blijft op de server)
     PROFIEL.bewaart()          of dit apparaat uberhaupt iets kan opslaan
   Optioneel, als de site inloggen met Microsoft aan heeft staan:
     PROFIEL.account()          belofte met { mogelijk, ingelogd, naam, code }
     PROFIEL.accountAfstemmen() de speelcode van het account hier zetten (belofte met { nieuw });
                                gebeurt ook vanzelf bij elke pagina waarop je ingelogd bent
     PROFIEL.inlogAdres()       waar de knop Inloggen met Microsoft heen gaat
     PROFIEL.uitloggen()        het koekje weg, en de code, munten en spullen van dit apparaat
     PROFIEL.accountWeg()       het account bij de server weg (de speelcode blijft)

   Eén regel voor wie is ingelogd: je account is je profiel. De browser kiest
   geen speelcode; hij leest en bewaart via /api/profiel/mijn en de server
   zoekt de code bij het account. De eerste keer dat je inlogt, krijgt je
   account de code van dit apparaat (als die van niemand anders is). Wat er
   ook misgaat (geen verbinding, een verlopen sessie), er wordt hier nooit
   iets gewist: alleen uitloggen haalt de munten en spullen van het apparaat.
   Het gezichtje: het laatst gekozene wint (avatarT), op welk apparaat ook. */
window.PROFIEL = (function(){
  'use strict';
  var SLEUTEL = 'lg-profiel', timer = null, luisteraars = [];
  /* Kan dit apparaat iets bewaren? We schrijven een proefsleutel en lezen hem
     terug: in een privevenster of met site-gegevens uitgezet gooit de browser
     hier een fout, en op een volle schijf ook. Het antwoord onthouden we,
     want dit verandert niet halverwege een potje. */
  var bewaarKan = null;
  function bewaart(){
    if (bewaarKan !== null) return bewaarKan;
    try {
      var proef = 'lg-proef-' + Math.random().toString(36).slice(2, 8);
      localStorage.setItem(proef, 'ja');
      bewaarKan = localStorage.getItem(proef) === 'ja';
      localStorage.removeItem(proef);
    } catch (e){ bewaarKan = false; }
    return bewaarKan;
  }
  function lees(){ try { return JSON.parse(localStorage.getItem(SLEUTEL) || '{}') || {}; } catch (e){ return {}; } }
  function zet(p){ try { localStorage.setItem(SLEUTEL, JSON.stringify(p)); } catch (e){} }
  function ls(k){ try { return localStorage.getItem(k); } catch (e){ return null; } }
  function lsZet(k, v){ try { localStorage.setItem(k, v); } catch (e){} }
  function code(){ return String(lees().code || ''); }
  function avatar(){ return String(lees().avatar || ''); }
  function zetAvatar(spec){ var p = lees(); p.avatar = spec || ''; p.avatarT = Date.now(); zet(p); zeg(); sync(); }
  /* Een gezichtje van voor avatarT bestond: heel oud, maar ouder dan niets.
     Zo wint het van een profiel op de server dat ook geen tijd heeft. */
  (function(){ var p = lees(); if (p.avatar && !p.avatarT){ p.avatarT = 1; zet(p); } })();
  /* hoort de code op dit apparaat bij een account (dan bewaart alleen dat account hem) */
  function vanAccount(){ return !!lees().acc; }
  function op(fn){ luisteraars.push(fn); }
  function zeg(){ luisteraars.forEach(function(fn){ try { fn(); } catch (e){} }); }

  /* alles wat op dit apparaat staat en mee mag */
  function verzamel(){
    var beste = {}, uitleg = [], k;
    try {
      for (var i = 0; i < localStorage.length; i++){
        k = localStorage.key(i);
        if (k.indexOf('lg-beste-') === 0){ try { var v = JSON.parse(localStorage.getItem(k)); if (v && typeof v.w === 'number') beste[k.slice(9)] = { w:v.w, t:v.t || 0 }; } catch (e){} }
      }
    } catch (e){}
    var campagne = {}; try { campagne = JSON.parse(ls('lg-toren-campagne') || '{}') || {}; } catch (e){}
    var vrij = {}; ['tonkla', 'aap', 'eiland', 'archipel', 'vulkaan'].forEach(function(x){ if (ls('lg-toren-' + x) === 'ja') vrij[x] = true; });
    var klas = null; try { klas = JSON.parse(ls('lg-klas') || 'null'); } catch (e){}
    var uit = null; try { uit = JSON.parse(ls('lg-uitrusting') || 'null'); } catch (e){}
    var gezien = {}; try { gezien = JSON.parse(ls('lg-gezien') || '{}') || {}; } catch (e){}
    var route = {}; try { route = JSON.parse(ls('lg-route') || '{}') || {}; } catch (e){}
    return { avatar:avatar(), avatarT:lees().avatarT || 0, route:route, beste:beste, campagne:campagne, vrij:vrij, klas:klas && klas.code ? klas : null, niveau:ls('lg-niveau') || '', muntDelta:wachtend(), vrijspeel:vrijWacht(), uitrusting:uit, gezien:gezien,
             /* de klassleutels gaan niet meer mee in het profiel: die horen bij het
                account, zie klassenAfstemmen() */
             docentWeg:docentWegWacht(), fouten:foutenKort() };
  }
  /* ---------- munten: het saldo staat op de server, hier wat er nog onderweg is ---------- */
  function wachtend(){ return parseInt(ls('lg-munten-wacht') || '0', 10) || 0; }
  function munten(){ return parseInt(ls('lg-munten') || '0', 10) || 0; }
  function bezit(){ try { return JSON.parse(ls('lg-bezit') || '{}') || {}; } catch (e){ return {}; } }
  /* de wapens van De stad, en welke je meeneemt */
  function wapens(){ try { return JSON.parse(ls('lg-wapens') || '{}') || {}; } catch (e){ return {}; } }
  function uitrusting(){
    var u = null; try { u = JSON.parse(ls('lg-uitrusting') || 'null'); } catch (e){}
    return window.WAPENS ? WAPENS.schoon(u, wapens()) : (u || { hoofd:'roestig', zij:'vuist' });
  }
  /* Een andere uitrusting kiezen. Hij gaat meteen naar de server mee, want de
     kamer van De stad vraagt het daar na en niet hier. */
  function zetUitrusting(u){
    u = window.WAPENS ? WAPENS.schoon(u, wapens()) : u;
    lsZet('lg-uitrusting', JSON.stringify(u));
    sync();
    return u;
  }
  function ingelogd(){ return !!(accountStand && accountStand.ingelogd); }
  function vrijWacht(){ try { return JSON.parse(ls('lg-vrij-wacht') || '[]') || []; } catch (e){ return []; } }
  /* de klassen van de docent op dit apparaat (code + sleutel), en welke hij hier vergat */
  function docentLijst(){ try { var l = JSON.parse(ls('lg-klas-docent') || '[]'); return Array.isArray(l) ? l.filter(function(k){ return k && k.code && k.sleutel; }) : []; } catch (e){ return []; } }
  function docentWegWacht(){ try { return JSON.parse(ls('lg-klas-docent-weg') || '[]') || []; } catch (e){ return []; } }
  /* Weghalen moet op twee plekken aankomen: in het profiel (docentWeg hierboven, via sync) en in de
     klassen van het account (via klassenAfstemmen). Elk heeft een eigen wachtlijst, anders wist de een
     de lijst voordat de ander hem zag en zet het account de klas weer terug. */
  function lijstVan(k){ try { var l = JSON.parse(ls(k) || '[]'); return Array.isArray(l) ? l : []; } catch (e){ return []; } }
  function accWegWacht(){ return lijstVan('lg-klas-docent-weg-acc'); }
  /* wat dit apparaat vergat, blijft vergeten tot de klas hier zelf weer wordt toegevoegd (een nieuwe
     code, of de link van een collega): zo zet een oud profiel of een ander apparaat hem niet terug */
  function vergeten(){
    var dl = docentLijst();
    return lijstVan('lg-klas-docent-vergeten').filter(function(c){ return !dl.some(function(k){ return k.code === c; }); });
  }
  /* de foutenmap: alleen kenmerk, vak, bak en dag gaan mee; de tekst haalt fouten.html weer uit de bank */
  function foutenKort(){ try { var l = JSON.parse(ls('lg-fouten') || '[]'); return Array.isArray(l) ? l.slice(-120).map(function(x){ return { h:String(x.h || ''), vak:String(x.vak || ''), b:x.b | 0, d:x.d | 0 }; }) : []; } catch (e){ return []; } }
  /* klassen uit een lijst erbij zetten op dit apparaat, behalve wat hier net vergeten is */
  function neemKlassenOver(lijst){
    var dl = docentLijst(), dw = docentWegWacht().concat(accWegWacht(), vergeten()), erbij = false;
    (lijst || []).forEach(function(k){
      if (!k || !k.code || !k.sleutel) return;
      if (dw.indexOf(k.code) >= 0 || dl.some(function(x){ return x.code === k.code; })) return;
      dl.push({ code:k.code, sleutel:k.sleutel, naam:k.naam || 'Klas', gemaakt:k.gemaakt || Date.now() });
      erbij = true;
    });
    if (erbij) lsZet('lg-klas-docent', JSON.stringify(dl));
    return erbij;
  }
  /* De klassen van dit apparaat naar het account, en die van het account hierheen.
     Alleen als je bent ingelogd; zonder account bestaan er ook geen klassen, want
     een klascode maken kan alleen ingelogd. */
  function klassenAfstemmen(){
    if (!ingelogd() || typeof fetch !== 'function') return Promise.resolve(null);
    var mijne = docentLijst(), weg = accWegWacht();
    /* opgeruimd: wat hier weer bij de klassen staat, is niet meer vergeten */
    lsZet('lg-klas-docent-vergeten', JSON.stringify(vergeten()));
    var vraagje = (mijne.length || weg.length)
      ? vraag('/api/account/klassen', 'POST', { klassen:mijne, weg:weg })
      : vraag('/api/account/klassen', 'GET');
    return vraagje.then(function(j){
      /* alleen wat de server echt kreeg van de wachtlijst af; een mislukte vraag komt in de catch */
      if (weg.length && j && j.ok) lsZet('lg-klas-docent-weg-acc', JSON.stringify(accWegWacht().filter(function(x){ return weg.indexOf(x) < 0; })));
      if (j && Array.isArray(j.klassen)) neemKlassenOver(j.klassen);
      return j;
    }).catch(function(){ return null; });
  }
  function docentWeg(code){
    [['lg-klas-docent-weg', docentWegWacht()], ['lg-klas-docent-weg-acc', accWegWacht()], ['lg-klas-docent-vergeten', lijstVan('lg-klas-docent-vergeten')]].forEach(function(p){
      if (p[1].indexOf(code) < 0) p[1].push(code);
      lsZet(p[0], JSON.stringify(p[1].slice(-60)));
    });
    klassenAfstemmen();
    return sync();
  }
  /* een trofee vrijspelen (een baas verslagen): meteen in bezit, en bij de volgende sync naar de server */
  function vrijspeel(id){
    if (!ingelogd() || !id) return false;
    var b = bezit(); if (b[id]) return false;
    b[id] = true; lsZet('lg-bezit', JSON.stringify(b));
    var w = vrijWacht(); if (w.indexOf(id) < 0) w.push(id); lsZet('lg-vrij-wacht', JSON.stringify(w));
    zeg(); sync();
    return true;
  }
  /* Je zat bij de eigenaar van de site in de klas. Anders dan een trofee van
     een baas hoef je hier niet voor ingelogd te zijn: dan blijft het op dit
     apparaat. Ben je het wel, dan gaat het mee naar je account en blijft het
     ook als je later loskoppelt. Geeft terug of er iets nieuws bij kwam. */
  function oudLeerling(){
    if (!window.COSMETICA) return false;
    var ids = COSMETICA.ITEMS.filter(function(it){ return it.oud; }).map(function(it){ return it.id; });
    if (!ids.length) return false;
    var b = bezit(), nieuw = false;
    ids.forEach(function(id){ if (!b[id]){ b[id] = true; nieuw = true; } });
    if (!nieuw) return false;
    lsZet('lg-bezit', JSON.stringify(b));
    if (ingelogd()){
      var w = vrijWacht();
      ids.forEach(function(id){ if (w.indexOf(id) < 0) w.push(id); });
      lsZet('lg-vrij-wacht', JSON.stringify(w));
    }
    zeg(); sync();
    return true;
  }
  /* Een geheim gevonden (paasei.js): net als oudLeerling op dit apparaat, en met een account ook op de server.
     Geeft terug of het nieuw was. */
  function geheimGevonden(id){
    if (!window.COSMETICA) return false;
    var it = COSMETICA.vind ? COSMETICA.vind(id) : null;
    if (!it || !it.geheim) return false;
    var b = bezit(); if (b[id]) return false;
    b[id] = true; lsZet('lg-bezit', JSON.stringify(b));
    if (ingelogd()){ var w = vrijWacht(); if (w.indexOf(id) < 0) w.push(id); lsZet('lg-vrij-wacht', JSON.stringify(w)); }
    zeg(); sync();
    return true;
  }
  function accountMogelijk(){ return !!(accountStand && accountStand.mogelijk); }
  /* munten erbij: meteen zichtbaar, en bij de volgende sync naar de server */
  function muntenErbij(n){
    n = Math.max(0, Math.min(600, Math.round(n))); if (!n || !ingelogd()) return 0;
    lsZet('lg-munten-wacht', String(wachtend() + n)); lsZet('lg-munten', String(munten() + n));
    zeg(); sync();
    return n;
  }
  /* kopen: de server rekent af en zegt wat je nu hebt */
  function koop(id){
    if (!ingelogd()) return Promise.reject(new Error('Log eerst in met Microsoft.'));
    stopWacht();
    var delta = wachtend();
    var pr = verzamel(); pr.koop = [id];
    return stuur({ profiel:pr }).then(function(j){
      lsZet('lg-munten-wacht', String(Math.max(0, wachtend() - delta)));
      pasToe(j.profiel);
      if (!(j.profiel && j.profiel.bezit && j.profiel.bezit[id])) throw new Error('Niet genoeg munten.');
      return j;
    });
  }
  /* Een wapen kopen voor De stad. Net als een hoed: de server rekent af, en
     als het wapen daarna niet in je kast staat was er niet genoeg. */
  function koopWapen(id){
    if (!ingelogd()) return Promise.reject(new Error('Log eerst in met Microsoft.'));
    stopWacht();
    var delta = wachtend();
    var pr = verzamel(); pr.koopWapen = [id];
    return stuur({ profiel:pr }).then(function(j){
      lsZet('lg-munten-wacht', String(Math.max(0, wachtend() - delta)));
      pasToe(j.profiel);
      if (!(j.profiel && j.profiel.wapens && j.profiel.wapens[id])) throw new Error('Niet genoeg munten.');
      return j;
    });
  }
  /* Welke van twee records is de beste? Bij bijna elk spel is hoger beter; bij
     De balans en De vergadering telt juist het laagste aantal, en dat staat als
     l:1 in het record zelf. Zonder die vlag (oude records) geldt hoger is beter. */
  function beterRecord(a, b){
    if (!a || typeof a.w !== 'number') return b;
    if (!b || typeof b.w !== 'number') return a;
    var lager = !!(a.l || b.l);
    if (a.w === b.w) return (a.t || 0) >= (b.t || 0) ? a : b;
    return (lager ? a.w < b.w : a.w > b.w) ? a : b;
  }
  /* wat van de server komt, hier neerzetten; het beste record wint */
  function pasToe(pr){
    if (!pr) return;
    /* wat je al gezien hebt (een tutorial): hier en op de server samen */
    if (pr.gezien && typeof pr.gezien === 'object'){
      var gz = {}; try { gz = JSON.parse(ls('lg-gezien') || '{}') || {}; } catch (e){}
      Object.keys(pr.gezien).forEach(function(k){ if (pr.gezien[k]) gz[k] = true; });
      lsZet('lg-gezien', JSON.stringify(gz));
    }
    /* de leerroute: de hoogste stand per doel wint */
    if (pr.route && typeof pr.route === 'object'){
      var rt = {}; try { rt = JSON.parse(ls('lg-route') || '{}') || {}; } catch (e){}
      var anders = false;
      Object.keys(pr.route).forEach(function(k){ var w = pr.route[k] | 0; if (w > (rt[k] | 0)){ rt[k] = w; anders = true; } });
      if (anders) lsZet('lg-route', JSON.stringify(rt));
    }
    Object.keys(pr.beste || {}).forEach(function(k){
      var mijn = null; try { mijn = JSON.parse(ls('lg-beste-' + k) || 'null'); } catch (e){}
      var best = beterRecord(mijn, pr.beste[k]);
      if (best && best !== mijn) lsZet('lg-beste-' + k, JSON.stringify(best));
    });
    var camp = {}; try { camp = JSON.parse(ls('lg-toren-campagne') || '{}') || {}; } catch (e){}
    Object.keys(pr.campagne || {}).forEach(function(k){ camp[k] = Math.max(camp[k] | 0, pr.campagne[k] | 0); });
    lsZet('lg-toren-campagne', JSON.stringify(camp));
    Object.keys(pr.vrij || {}).forEach(function(k){ lsZet('lg-toren-' + k, 'ja'); });
    if (pr.klas && pr.klas.code && !ls('lg-klas')) lsZet('lg-klas', JSON.stringify(pr.klas));
    /* De klassen van een docent stonden vroeger in het profiel. Nu hangen ze aan
       het account; een oud profiel dat ze nog meestuurt nemen we wel over, zodat
       niemand zijn klassen kwijtraakt bij de overstap. */
    if (Array.isArray(pr.docent) && pr.docent.length) neemKlassenOver(pr.docent);
    if (pr.niveau && !ls('lg-niveau')) lsZet('lg-niveau', pr.niveau);
    /* de wapenkast en de uitrusting komen van de server: die is de baas */
    if (pr.wapens) lsZet('lg-wapens', JSON.stringify(pr.wapens));
    if (pr.uitrusting) lsZet('lg-uitrusting', JSON.stringify(pr.uitrusting));
    /* fouten van het profiel die hier nog niet staan: klaarzetten voor fouten.html, dat ze in de bank terugzoekt */
    if (Array.isArray(pr.fouten) && pr.fouten.length){
      try { var heb = {}; (JSON.parse(ls('lg-fouten') || '[]') || []).forEach(function(x){ heb[x.h] = true; }); var nieuw = pr.fouten.filter(function(x){ return x && x.h && !heb[x.h]; }); if (nieuw.length) lsZet('lg-fouten-kort', JSON.stringify(nieuw)); } catch (e){}
    }
    /* het gezichtje van de server alleen als het minstens zo nieuw is als dat van hier */
    var p = lees(); if (pr.avatar && (!p.avatar || (pr.avatarT || 0) >= (p.avatarT || 0))){ p.avatar = pr.avatar; p.avatarT = pr.avatarT || 0; } zet(p);
    if (typeof pr.munten === 'number') lsZet('lg-munten', String(Math.max(0, Math.round(pr.munten)) + wachtend()));
    if (pr.bezit && typeof pr.bezit === 'object'){ var bz = Object.assign({}, pr.bezit); vrijWacht().forEach(function(x){ bz[x] = true; }); lsZet('lg-bezit', JSON.stringify(bz)); }
    zeg();
  }
  function vraag(url, methode, body){
    return fetch(url, { method:methode, headers:{ 'content-type':'application/json' }, body: body ? JSON.stringify(body) : undefined })
      .then(function(r){ return r.json().then(function(j){ if (!r.ok){ var e = new Error(j && j.fout ? j.fout : 'Het lukte niet.'); e.vast = !!(j && j.vast); e.uit = !!(j && j.uit); throw e; } return j; }); });
  }
  /* Na een geslaagde melding: wat er onderweg was is aangekomen. Een trofee
     gaat pas uit de wachtrij als hij echt in het bezit staat, want de server
     laat er per melding maar een door; de rest komt bij de volgende. */
  function aangekomen(delta, vr, j){
    lsZet('lg-munten-wacht', String(Math.max(0, wachtend() - delta)));
    var bz = (j && j.profiel && j.profiel.bezit) || {};
    var kreeg = vr.filter(function(x){ return bz[x]; });
    lsZet('lg-vrij-wacht', JSON.stringify(vrijWacht().filter(function(x){ return kreeg.indexOf(x) < 0; })));
    return kreeg.length;
  }
  /* Wat bij een account hoort van dit apparaat halen: de code, de munten, de
     spullen en het gezichtje. Bij uitloggen, en als hier iemand anders inlogt
     dan wiens code er stond (een gedeelde laptop). Beste scores en sterren
     blijven staan, die zijn van het apparaat. */
  function vanApparaat(){
    var p = lees(); delete p.code; delete p.acc; delete p.avatar; delete p.avatarT; zet(p);
    ['lg-munten', 'lg-munten-wacht', 'lg-bezit', 'lg-vrij-wacht', 'lg-wapens', 'lg-uitrusting', 'lg-sync-hash'].forEach(function(k){ try { localStorage.removeItem(k); } catch (e){} });
    zeg();
  }
  /* waar het profiel heen gaat: ingelogd naar het account, anders naar de code */
  function stuur(body){
    var url = ingelogd() ? '/api/profiel/mijn' : '/api/profiel/' + code();
    return vraag(url, 'PUT', body).then(function(j){ neemCode(j); return j; }).catch(function(e){
      /* de sessie is verlopen: dan ben je niet meer ingelogd, maar er gaat niets weg */
      if (e && e.uit){ accountStand = { mogelijk:true, ingelogd:false }; zeg(); }
      /* een code die bij een account hoort, bewaart alleen dat account: dan stoppen we, zonder iets te wissen */
      if (e && e.vast){ var p = lees(); p.acc = true; zet(p); zeg(); }
      throw e;
    });
  }
  /* de server zegt welke code bij het account hoort; die tonen we hier */
  function neemCode(j){
    if (!j || !j.code || !ingelogd()) return;
    var p = lees(); if (p.code === j.code && p.acc) return;
    p.code = j.code; p.acc = true; zet(p); zeg();
  }
  function stopWacht(){ clearTimeout(timer); if (wachtKlaar){ wachtKlaar(null); wachtKlaar = null; } }
  /* een speelcode zonder account; ingelogd heb je die al */
  function maak(){
    if (ingelogd()) return sync();
    var delta = wachtend(), vr = vrijWacht();
    return vraag('/api/profiel', 'POST', { profiel:verzamel() }).then(function(j){
      var p = lees(); p.code = j.code; delete p.acc; zet(p); aangekomen(delta, vr, j); pasToe(j.profiel); return j;
    });
  }
  function koppel(c){
    if (ingelogd()) return Promise.reject(new Error('Je bent ingelogd: je speelcode komt van je account.'));
    c = String(c || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (c.length !== 8) return Promise.reject(new Error('Een speelcode heeft acht letters.'));
    return vraag('/api/profiel/' + c, 'GET').then(function(j){
      /* een code die aan een account hangt, neem je alleen mee door met dat account in te loggen */
      if (j.vast) throw new Error('Deze speelcode hoort bij een Microsoft-account. Log in met dat account, dan staat alles er.');
      var p = lees(); p.code = c; delete p.acc; zet(p); pasToe(j.profiel);
      /* en wat hier al stond gaat er meteen bij */
      var delta = wachtend(), vr = vrijWacht();
      return vraag('/api/profiel/' + c, 'PUT', { profiel:verzamel() }).then(function(j2){ aangekomen(delta, vr, j2); pasToe(j2.profiel); return j2; });
    });
  }
  function sync(){
    /* geen code en zeker niet ingelogd: niets te bewaren */
    if (!code() && accountStand && !accountStand.ingelogd) return Promise.resolve(null);
    clearTimeout(timer);
    /* De vorige sync stond nog te wachten en wordt nu ingehaald. Zijn belofte
       moet wel aflopen, anders blijft wie erop wacht eeuwig hangen. */
    if (wachtKlaar){ wachtKlaar(null); wachtKlaar = null; }
    return new Promise(function(res){
      wachtKlaar = res;
      timer = setTimeout(function(){
        wachtKlaar = null;
        /* eerst weten of er iemand is ingelogd: dat bepaalt waar het heen gaat */
        account().then(function(){
          /* een code van een account zonder dat account ingelogd: niets doen */
          if (!ingelogd() && (vanAccount() || !code())){ res(null); return; }
          var delta = wachtend();
          var vr = vrijWacht(), dw = docentWegWacht();
          var pr = verzamel(), hash = JSON.stringify(pr) + (ingelogd() ? '|in' : ''), sinds = Date.now() - (parseInt(ls('lg-sync-t') || '0', 10) || 0);
          /* hetzelfde als de vorige keer, korter dan een half uur geleden, en niets onderweg: dan hoeft de server het niet te horen */
          if (hash === ls('lg-sync-hash') && sinds < 1800000 && !delta && !vr.length && !dw.length){
            /* Wel even lezen als dat vijf minuten geleden is: de server kan iets
               veranderd hebben, zoals munten van de beheerder. Ingelogd gebeurt
               dat al bij elke pagina (accountAfstemmen). */
            var gelezen = Math.max(parseInt(ls('lg-sync-t') || '0', 10) || 0, parseInt(ls('lg-lees-t') || '0', 10) || 0);
            if (ingelogd() || Date.now() - gelezen < 300000){ res(null); return; }
            lsZet('lg-lees-t', String(Date.now()));
            vraag('/api/profiel/' + code(), 'GET').then(function(j){ if (!j.vast) pasToe(j.profiel); res(j); }).catch(function(){ res(null); });
            return;
          }
          stuur({ profiel:pr }).then(function(j){
            var kreeg = aangekomen(delta, vr, j);
            lsZet('lg-klas-docent-weg', JSON.stringify(docentWegWacht().filter(function(x){ return dw.indexOf(x) < 0; })));
            pasToe(j.profiel); lsZet('lg-sync-hash', JSON.stringify(verzamel()) + (ingelogd() ? '|in' : '')); lsZet('lg-sync-t', String(Date.now())); res(j);
            /* nog trofeeën onderweg en er kwam er net een door: meteen de volgende */
            if (kreeg && vrijWacht().length) setTimeout(sync, 1500);
          }).catch(function(){ res(null); });
        });
      }, 600);
    });
  }
  function wis(){ var p = lees(); delete p.code; delete p.acc; zet(p); zeg(); }
  /* de klaskoppeling is losgemaakt: ook uit het profiel op de server halen */
  function klasWeg(){
    if (!code() && !ingelogd()) return Promise.resolve(null);
    stopWacht();
    return stuur({ profiel:verzamel(), klasWeg:true }).then(function(j){ pasToe(j.profiel); return j; }).catch(function(){ return null; });
  }

  /* inloggen met Microsoft: de server weet of het aan staat en wie er ingelogd is.
     Terug van Microsoft staat er ?account=in (of een fout) in het adres; dat
     lezen we hier, voordat de pagina zijn eigen adres herschrijft. */
  var accountStand = null, accountVlag = '', accountBezig = null, winkelVlag = '', wachtKlaar = null;
  try {
    var q0 = new URLSearchParams(location.search); accountVlag = q0.get('account') || ''; winkelVlag = q0.get('winkel') || '';
    if (accountVlag || winkelVlag){ q0.delete('account'); q0.delete('winkel'); history.replaceState(null, '', location.pathname + (q0.toString() ? '?' + q0.toString() : '') + location.hash); }
  } catch (e){}
  function account(vers){
    if (accountStand && !vers) return Promise.resolve(accountStand);
    if (typeof fetch !== 'function') return Promise.resolve({ mogelijk:false, ingelogd:false });
    if (accountBezig && !vers) return accountBezig;
    accountBezig = fetch('/api/account', { cache:'no-store' }).then(function(r){ return r.json(); })
      .then(function(j){ accountStand = j && typeof j === 'object' ? j : { mogelijk:false, ingelogd:false }; accountBezig = null; return accountStand; })
      /* Ging het mis (geen verbinding, een 502 van het schoolnetwerk)? Dan weten
         we niets, en dat is iets anders dan "niet ingelogd". We onthouden het
         antwoord dus niet, zodat een volgende vraag het opnieuw probeert. */
      .catch(function(){ accountBezig = null; return accountStand || { mogelijk:false, ingelogd:false, onbekend:true }; });
    return accountBezig;
  }
  /* de code van dit apparaat gaat mee: een nieuw account neemt hem over */
  function inlogAdres(){
    var c = vanAccount() ? '' : code();
    return '/api/account/inloggen?terug=' + encodeURIComponent(location.pathname) + (c ? '&code=' + c : '');
  }
  /* Ingelogd: de code van het account hier zetten en het profiel ophalen. Stond
     hier de code van een ander account, dan gaat wat daarvan was eerst weg.
     Eén keer per pagina; daarna doet sync het bijhouden. */
  var afstemBezig = null;
  function accountAfstemmen(){
    if (afstemBezig) return afstemBezig;
    afstemBezig = account(true).then(function(a){
      if (!a || !a.ingelogd) return { nieuw:false };
      klassenAfstemmen();
      var p = lees();
      if (p.acc && p.code && a.code && p.code !== a.code) vanApparaat();
      /* ook als de code al klopt: ophalen, want op een ander apparaat kan er iets veranderd zijn */
      return vraag('/api/profiel/mijn', 'GET').then(function(j){
        var wissel = lees().code !== j.code;
        neemCode(j); pasToe(j.profiel);
        /* en wat hier al stond gaat er meteen bij */
        return sync().then(function(){ return { nieuw:wissel }; });
      });
    });
    afstemBezig.catch(function(){ afstemBezig = null; });
    return afstemBezig;
  }
  function uitloggen(){ return vraag('/api/account/uitloggen', 'POST', {}).then(function(){ accountStand = null; afstemBezig = null; vanApparaat(); }); }
  function accountWeg(){
    return fetch('/api/account', { method:'DELETE' }).then(function(r){ return r.json(); }).then(function(j){
      if (j && j.fout) throw new Error(j.fout);
      /* de speelcode blijft, en is nu weer zonder account te gebruiken */
      var p = lees(); delete p.acc; zet(p); accountStand = null; afstemBezig = null; zeg();
    });
  }
  /* bij het laden: wie is ingelogd, dan de code van het account; anders even samenvoegen als er een code is */
  /* En als die eerste vraag mislukt (wifi die even wegvalt), proberen we het
     na vier seconden nog een keer: anders telt een heel potje niet mee. */
  if (typeof fetch === 'function') setTimeout(function(){
    account().then(function(a){
      if (a && a.onbekend) setTimeout(function(){ account(true); }, 4000);
      else if (a && a.ingelogd){ accountAfstemmen().then(function(r){ if (r && r.nieuw) zeg(); }).catch(function(){}); return; }
      if (code()) sync();
    });
  }, 400);
  return { bewaart:bewaart, lees:lees, code:code, avatar:avatar, zetAvatar:zetAvatar, maak:maak, koppel:koppel, sync:sync, wis:wis, verzamel:verzamel, op:op,
    wapens:wapens, uitrusting:uitrusting, zetUitrusting:zetUitrusting, koopWapen:koopWapen,
    klasWeg:klasWeg, account:account, geheimGevonden:geheimGevonden, klassenAfstemmen:klassenAfstemmen, munten:munten, bezit:bezit, ingelogd:ingelogd, accountMogelijk:accountMogelijk, muntenErbij:muntenErbij, koop:koop, vrijspeel:vrijspeel, oudLeerling:oudLeerling, accountVlag:function(){ return accountVlag; }, winkelVlag:function(){ return winkelVlag; }, accountAfstemmen:accountAfstemmen, inlogAdres:inlogAdres, uitloggen:uitloggen, accountWeg:accountWeg, docentWeg:docentWeg, wie:function(){ return accountStand && accountStand.ingelogd ? String(accountStand.naam || '') : ''; } };
})();
