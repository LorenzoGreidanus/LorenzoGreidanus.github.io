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
     PROFIEL.accountAfstemmen() na het inloggen: de speelcode van het account hier zetten,
                                of de code van hier aan het account hangen (belofte met { nieuw })
     PROFIEL.inlogAdres()       waar de knop Inloggen met Microsoft heen gaat
     PROFIEL.uitloggen()        het koekje weg; de speelcode blijft hier staan
     PROFIEL.accountWeg()       het account bij de server weg (de speelcode blijft) */
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
  function zetAvatar(spec){ var p = lees(); p.avatar = spec || ''; zet(p); zeg(); sync(); }
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
    return { avatar:avatar(), beste:beste, campagne:campagne, vrij:vrij, klas:klas && klas.code ? klas : null, niveau:ls('lg-niveau') || '', muntDelta:wachtend(), vrijspeel:vrijWacht(),
             /* de klassleutels gaan niet meer mee in het profiel: die horen bij het
                account, zie klassenAfstemmen() */
             docentWeg:docentWegWacht(), fouten:foutenKort() };
  }
  /* ---------- munten: het saldo staat op de server, hier wat er nog onderweg is ---------- */
  function wachtend(){ return parseInt(ls('lg-munten-wacht') || '0', 10) || 0; }
  function munten(){ return parseInt(ls('lg-munten') || '0', 10) || 0; }
  function bezit(){ try { return JSON.parse(ls('lg-bezit') || '{}') || {}; } catch (e){ return {}; } }
  function ingelogd(){ return !!(accountStand && accountStand.ingelogd); }
  function vrijWacht(){ try { return JSON.parse(ls('lg-vrij-wacht') || '[]') || []; } catch (e){ return []; } }
  /* de klassen van de docent op dit apparaat (code + sleutel), en welke hij hier vergat */
  function docentLijst(){ try { var l = JSON.parse(ls('lg-klas-docent') || '[]'); return Array.isArray(l) ? l.filter(function(k){ return k && k.code && k.sleutel; }) : []; } catch (e){ return []; } }
  function docentWegWacht(){ try { return JSON.parse(ls('lg-klas-docent-weg') || '[]') || []; } catch (e){ return []; } }
  /* de foutenmap: alleen kenmerk en vak gaan mee; de tekst haalt fouten.html weer uit de bank */
  function foutenKort(){ try { var l = JSON.parse(ls('lg-fouten') || '[]'); return Array.isArray(l) ? l.slice(-80).map(function(x){ return { h:String(x.h || ''), vak:String(x.vak || '') }; }) : []; } catch (e){ return []; } }
  /* klassen uit een lijst erbij zetten op dit apparaat, behalve wat hier net vergeten is */
  function neemKlassenOver(lijst){
    var dl = docentLijst(), dw = docentWegWacht(), erbij = false;
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
    var mijne = docentLijst(), weg = docentWegWacht();
    var vraagje = (mijne.length || weg.length)
      ? vraag('/api/account/klassen', 'POST', { klassen:mijne, weg:weg })
      : vraag('/api/account/klassen', 'GET');
    return vraagje.then(function(j){
      if (weg.length) lsZet('lg-klas-docent-weg', '[]');
      if (j && Array.isArray(j.klassen)) neemKlassenOver(j.klassen);
      return j;
    }).catch(function(){ return null; });
  }
  function docentWeg(code){ var w = docentWegWacht(); if (w.indexOf(code) < 0) w.push(code); lsZet('lg-klas-docent-weg', JSON.stringify(w)); return sync(); }
  /* een trofee vrijspelen (een baas verslagen): meteen in bezit, en bij de volgende sync naar de server */
  function vrijspeel(id){
    if (!ingelogd() || !id) return false;
    var b = bezit(); if (b[id]) return false;
    b[id] = true; lsZet('lg-bezit', JSON.stringify(b));
    var w = vrijWacht(); if (w.indexOf(id) < 0) w.push(id); lsZet('lg-vrij-wacht', JSON.stringify(w));
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
    var c = code(); if (!c || !ingelogd()) return Promise.reject(new Error('Log eerst in met Microsoft.'));
    clearTimeout(timer);
    var delta = wachtend();
    var pr = verzamel(); pr.koop = [id];
    return vraag('/api/profiel/' + c, 'PUT', { profiel:pr }).then(function(j){
      lsZet('lg-munten-wacht', String(Math.max(0, wachtend() - delta)));
      pasToe(j.profiel);
      if (!(j.profiel && j.profiel.bezit && j.profiel.bezit[id])) throw new Error('Niet genoeg munten.');
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
    /* fouten van het profiel die hier nog niet staan: klaarzetten voor fouten.html, dat ze in de bank terugzoekt */
    if (Array.isArray(pr.fouten) && pr.fouten.length){
      try { var heb = {}; (JSON.parse(ls('lg-fouten') || '[]') || []).forEach(function(x){ heb[x.h] = true; }); var nieuw = pr.fouten.filter(function(x){ return x && x.h && !heb[x.h]; }); if (nieuw.length) lsZet('lg-fouten-kort', JSON.stringify(nieuw)); } catch (e){}
    }
    var p = lees(); if (pr.avatar) p.avatar = pr.avatar; zet(p);
    if (typeof pr.munten === 'number') lsZet('lg-munten', String(Math.max(0, Math.round(pr.munten)) + wachtend()));
    if (pr.bezit && typeof pr.bezit === 'object'){ var bz = Object.assign({}, pr.bezit); vrijWacht().forEach(function(x){ bz[x] = true; }); lsZet('lg-bezit', JSON.stringify(bz)); }
    zeg();
  }
  function vraag(url, methode, body){
    return fetch(url, { method:methode, headers:{ 'content-type':'application/json' }, body: body ? JSON.stringify(body) : undefined })
      .then(function(r){ return r.json().then(function(j){ if (!r.ok) throw new Error(j && j.fout ? j.fout : 'Het lukte niet.'); return j; }); });
  }
  function maak(){
    return vraag('/api/profiel', 'POST', { profiel:verzamel() }).then(function(j){
      var p = lees(); p.code = j.code; zet(p); pasToe(j.profiel); return j;
    });
  }
  function koppel(c){
    c = String(c || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (c.length !== 8) return Promise.reject(new Error('Een speelcode heeft acht letters.'));
    return vraag('/api/profiel/' + c, 'GET').then(function(j){
      var p = lees(); p.code = c; zet(p); pasToe(j.profiel);
      /* en wat hier al stond gaat er meteen bij */
      return vraag('/api/profiel/' + c, 'PUT', { profiel:verzamel() }).then(function(j2){ pasToe(j2.profiel); return j2; });
    });
  }
  function sync(){
    var c = code(); if (!c) return Promise.resolve(null);
    clearTimeout(timer);
    /* De vorige sync stond nog te wachten en wordt nu ingehaald. Zijn belofte
       moet wel aflopen, anders blijft wie erop wacht eeuwig hangen. */
    if (wachtKlaar){ wachtKlaar(null); wachtKlaar = null; }
    return new Promise(function(res){
      wachtKlaar = res;
      timer = setTimeout(function(){
        wachtKlaar = null;
        var delta = wachtend();
        var vr = vrijWacht(), dw = docentWegWacht();
        var pr = verzamel(), hash = JSON.stringify(pr), sinds = Date.now() - (parseInt(ls('lg-sync-t') || '0', 10) || 0);
        /* hetzelfde als de vorige keer, korter dan een half uur geleden, en niets onderweg: dan hoeft de server het niet te horen */
        if (hash === ls('lg-sync-hash') && sinds < 1800000 && !delta && !vr.length && !dw.length){ res(null); return; }
        vraag('/api/profiel/' + c, 'PUT', { profiel:pr }).then(function(j){ lsZet('lg-munten-wacht', String(Math.max(0, wachtend() - delta))); lsZet('lg-vrij-wacht', JSON.stringify(vrijWacht().filter(function(x){ return vr.indexOf(x) < 0; }))); lsZet('lg-klas-docent-weg', JSON.stringify(docentWegWacht().filter(function(x){ return dw.indexOf(x) < 0; }))); pasToe(j.profiel); lsZet('lg-sync-hash', JSON.stringify(verzamel())); lsZet('lg-sync-t', String(Date.now())); res(j); }).catch(function(){ res(null); });
      }, 600);
    });
  }
  function wis(){ var p = lees(); delete p.code; zet(p); zeg(); }
  /* de klaskoppeling is losgemaakt: ook uit het profiel op de server halen */
  function klasWeg(){
    var c = code(); if (!c) return Promise.resolve(null);
    clearTimeout(timer);
    return vraag('/api/profiel/' + c, 'PUT', { profiel:verzamel(), klasWeg:true }).then(function(j){ pasToe(j.profiel); return j; }).catch(function(){ return null; });
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
  function inlogAdres(){ return '/api/account/inloggen?terug=' + encodeURIComponent(location.pathname); }
  /* na het inloggen: het account heeft een speelcode, of nog niet */
  function accountAfstemmen(){
    return account(true).then(function(a){
      if (!a.ingelogd) return { nieuw:false };
      klassenAfstemmen();
      var hier = code();
      if (a.code && a.code !== hier){
        /* het account kent een code: die nemen we hier over (wat hier stond gaat erbij) */
        return koppel(a.code).then(function(){ return { nieuw:true }; });
      }
      if (!a.code){
        /* een speelcode die hier al stond kan van een ander zijn (schoollaptop): dat vraagt de lade */
        if (hier) return { nieuw:false, vraag:true, code:hier };
        return maak().then(function(){ return vraag('/api/account/koppel', 'POST', { code:code() }); })
          .then(function(){ accountStand = null; return { nieuw:true }; });
      }
      return { nieuw:false };
    });
  }
  /* het antwoord op die vraag: ja, die code is van mij; of nee, geef me een nieuwe */
  function accountNeemCode(c){
    return vraag('/api/account/koppel', 'POST', { code:c || code() }).then(function(){ accountStand = null; zeg(); });
  }
  function accountNieuweCode(){
    wis();
    return maak().then(function(){ return vraag('/api/account/koppel', 'POST', { code:code() }); }).then(function(){ accountStand = null; zeg(); });
  }
  function uitloggen(){ return vraag('/api/account/uitloggen', 'POST', {}).then(function(){ accountStand = null; zeg(); }); }
  function accountWeg(){
    return fetch('/api/account', { method:'DELETE' }).then(function(r){ return r.json(); }).then(function(j){ if (j && j.fout) throw new Error(j.fout); accountStand = null; zeg(); });
  }
  /* bij het laden even samenvoegen, als er een code is */
  if (code() && typeof fetch === 'function'){ setTimeout(function(){ sync(); }, 1500); }
  /* en even kijken of er iemand is ingelogd, want dan tellen de munten */
  /* En als die eerste vraag mislukt (wifi die even wegvalt), proberen we het
     na vier seconden nog een keer: anders telt een heel potje niet mee. */
  if (typeof fetch === 'function' && !accountStand) setTimeout(function(){
    account().then(function(a){
      if (a && a.onbekend) setTimeout(function(){ account(true); }, 4000);
      else if (a && a.ingelogd) klassenAfstemmen();
    });
  }, 400);
  return { bewaart:bewaart, lees:lees, code:code, avatar:avatar, zetAvatar:zetAvatar, maak:maak, koppel:koppel, sync:sync, wis:wis, verzamel:verzamel, op:op,
    klasWeg:klasWeg, account:account, klassenAfstemmen:klassenAfstemmen, munten:munten, bezit:bezit, ingelogd:ingelogd, accountMogelijk:accountMogelijk, muntenErbij:muntenErbij, koop:koop, vrijspeel:vrijspeel, accountNeemCode:accountNeemCode, accountNieuweCode:accountNieuweCode, accountVlag:function(){ return accountVlag; }, winkelVlag:function(){ return winkelVlag; }, accountAfstemmen:accountAfstemmen, inlogAdres:inlogAdres, uitloggen:uitloggen, accountWeg:accountWeg, docentWeg:docentWeg };
})();
