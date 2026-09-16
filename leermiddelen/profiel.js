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
    return { avatar:avatar(), beste:beste, campagne:campagne, vrij:vrij, klas:klas && klas.code ? klas : null, niveau:ls('lg-niveau') || '' };
  }
  /* wat van de server komt, hier neerzetten; het nieuwste record wint */
  function pasToe(pr){
    if (!pr) return;
    Object.keys(pr.beste || {}).forEach(function(k){
      var mijn = null; try { mijn = JSON.parse(ls('lg-beste-' + k) || 'null'); } catch (e){}
      if (!mijn || (pr.beste[k].t || 0) >= (mijn.t || 0)) lsZet('lg-beste-' + k, JSON.stringify(pr.beste[k]));
    });
    var camp = {}; try { camp = JSON.parse(ls('lg-toren-campagne') || '{}') || {}; } catch (e){}
    Object.keys(pr.campagne || {}).forEach(function(k){ camp[k] = Math.max(camp[k] | 0, pr.campagne[k] | 0); });
    lsZet('lg-toren-campagne', JSON.stringify(camp));
    Object.keys(pr.vrij || {}).forEach(function(k){ lsZet('lg-toren-' + k, 'ja'); });
    if (pr.klas && pr.klas.code && !ls('lg-klas')) lsZet('lg-klas', JSON.stringify(pr.klas));
    if (pr.niveau && !ls('lg-niveau')) lsZet('lg-niveau', pr.niveau);
    var p = lees(); if (pr.avatar) p.avatar = pr.avatar; zet(p);
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
    return new Promise(function(res){
      timer = setTimeout(function(){
        vraag('/api/profiel/' + c, 'PUT', { profiel:verzamel() }).then(function(j){ pasToe(j.profiel); res(j); }).catch(function(){ res(null); });
      }, 600);
    });
  }
  function wis(){ var p = lees(); delete p.code; zet(p); zeg(); }

  /* inloggen met Microsoft: de server weet of het aan staat en wie er ingelogd is.
     Terug van Microsoft staat er ?account=in (of een fout) in het adres; dat
     lezen we hier, voordat de pagina zijn eigen adres herschrijft. */
  var accountStand = null, accountVlag = '';
  try {
    var q0 = new URLSearchParams(location.search); accountVlag = q0.get('account') || '';
    if (accountVlag){ q0.delete('account'); history.replaceState(null, '', location.pathname + (q0.toString() ? '?' + q0.toString() : '') + location.hash); }
  } catch (e){}
  function account(vers){
    if (accountStand && !vers) return Promise.resolve(accountStand);
    if (typeof fetch !== 'function') return Promise.resolve({ mogelijk:false, ingelogd:false });
    return fetch('/api/account', { cache:'no-store' }).then(function(r){ return r.json(); })
      .then(function(j){ accountStand = j && typeof j === 'object' ? j : { mogelijk:false, ingelogd:false }; return accountStand; })
      .catch(function(){ accountStand = { mogelijk:false, ingelogd:false }; return accountStand; });
  }
  function inlogAdres(){ return '/api/account/inloggen?terug=' + encodeURIComponent(location.pathname); }
  /* na het inloggen: het account heeft een speelcode, of nog niet */
  function accountAfstemmen(){
    return account(true).then(function(a){
      if (!a.ingelogd) return { nieuw:false };
      var hier = code();
      if (a.code && a.code !== hier){
        /* het account kent een code: die nemen we hier over (wat hier stond gaat erbij) */
        return koppel(a.code).then(function(){ return { nieuw:true }; });
      }
      if (!a.code){
        var klaar = hier ? Promise.resolve() : maak();
        return klaar.then(function(){ return vraag('/api/account/koppel', 'POST', { code:code() }); })
          .then(function(){ accountStand = null; return { nieuw:!hier }; });
      }
      return { nieuw:false };
    });
  }
  function uitloggen(){ return vraag('/api/account/uitloggen', 'POST', {}).then(function(){ accountStand = null; zeg(); }); }
  function accountWeg(){
    return fetch('/api/account', { method:'DELETE' }).then(function(r){ return r.json(); }).then(function(j){ if (j && j.fout) throw new Error(j.fout); accountStand = null; zeg(); });
  }
  /* bij het laden even samenvoegen, als er een code is */
  if (code() && typeof fetch === 'function'){ setTimeout(function(){ sync(); }, 1500); }
  return { lees:lees, code:code, avatar:avatar, zetAvatar:zetAvatar, maak:maak, koppel:koppel, sync:sync, wis:wis, verzamel:verzamel, op:op,
    account:account, accountVlag:function(){ return accountVlag; }, accountAfstemmen:accountAfstemmen, inlogAdres:inlogAdres, uitloggen:uitloggen, accountWeg:accountWeg };
})();
