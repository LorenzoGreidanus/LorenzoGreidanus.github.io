/* Rollenspellen met de klas: het bord (deze pagina, op het digibord) opent een
   kamer, leerlingen doen mee via meneergreidanus.nl/q met de code, de rollen
   worden automatisch over hun telefoons verdeeld, en het bord stuurt elke
   telefoon precies wat die op dat moment moet zien: een rolkaart, een vraag
   met knoppen, een lat, een lijst om uit te kiezen, of "even wachten". De
   telefoon (rol.html) tekent alleen wat er komt en stuurt de keuze terug.

   Heet ROLSPEL, want de spellen zelf hebben vaak al een lijst ROLLEN.

   Gebruik op het bord:
     ROLSPEL.maak('polis').then(function(k){ ... k.code, k.sleutel ... })
     var kamer = ROLSPEL.host({ game:'polis', code:k.code, sleutel:k.sleutel,
       onSpelers:function(lijst){}, onActie:function(pid, d, naam){} });
     kamer.naar(pid, kaart)      een kaart naar een telefoon
     kamer.kaarten([{pid, d}])   veel kaarten ineens
     kamer.alle(kaart)           naar iedereen (het bord)
     kamer.start(); kamer.stop(); kamer.weg(pid); kamer.spelers()
     ROLSPEL.verdeel(spelers, [{ id:'koning', aantal:1 }, { id:'burger' }])   pid -> rol-id
     ROLSPEL.lobby(el, code, spelers)   de code groot met de aangemelde telefoons
     ROLSPEL.delegatie(kamer, [pids], kaart, function(keuze){})   een groepje laten kiezen

   Kaarten (wat een telefoon kan tonen):
     { soort:'rol', rol:'burger', titel, onder, tekst, kleur }        blijft bovenaan staan
     { soort:'vraag', id, titel, tekst, opties:[{ id, tekst, kleur }], meer }   knoppen, één keuze
     { soort:'lat', id, titel, tekst, links, rechts, waarde }        een schuif van 0 tot 100
     { soort:'lijst', id, titel, tekst, items:[{ id, tekst, onder, kleur }] } tik er een aan
     { soort:'wacht', titel, tekst }                                  alleen lezen
     { soort:'uitslag', titel, tekst, regels:[...] }
   Een actie van de telefoon: { vraag:id, keuze:optieId } of { vraag:id, waarde:n }. */
window.ROLSPEL = (function(){
  'use strict';
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function maak(game){
    return fetch('/api/kamer', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify({ spel:'rollen', game:game }) })
      .then(function(r){ return r.json().then(function(j){ if (!r.ok) throw new Error(j && j.fout ? j.fout : 'De kamer kon niet gemaakt worden.'); return j; }); });
  }
  /* De verbinding zelf, met de strook onderaan en de wachtrij, staat in
     verbinding.js; die delen alle klassenspellen. Een pagina die hem nog niet
     laadt, krijgt hem hier alsnog. */
  var HIER = (document.currentScript && document.currentScript.src || '').replace(/rollen\.js[^\/]*$/, '');
  function metVerbinding(f){
    if (window.VERBINDING) return f();
    var s = document.querySelector('script[data-verbinding]');
    if (!s){ s = document.createElement('script'); s.src = HIER + 'verbinding.js'; s.setAttribute('data-verbinding', ''); document.head.appendChild(s); }
    s.addEventListener('load', function(){ if (window.VERBINDING) f(); });
  }
  if (!window.VERBINDING) metVerbinding(function(){});
  function host(o){
    var v = null, lijst = [], n = 0, voorlopig = [], weg = false;
    function stuur(m){ if (v) return v.stuur(m); if (voorlopig.length < 200) voorlopig.push(m); return false; }
    metVerbinding(function(){
      if (weg) return;
      /* Het bord bleef vroeger eindeloos opnieuw verbinden: op het scherm
         stond dan nog gewoon de lobby met de code, terwijl er niets meer
         luisterde. Na acht pogingen (ruim een minuut) geven we het op en
         zeggen we dat, zodat de docent de kamer opnieuw kan openen. */
      v = VERBINDING.maak({ pad:o.code + '?rol=host&sleutel=' + encodeURIComponent(o.sleutel), rol:'host', max:8,
        wegTekst:'Open de kamer opnieuw; je leerlingen krijgen dan een nieuwe code.', wegKnop:'Opnieuw openen',
        onBericht:function(m){
          if (m.t === 'welkom' || m.t === 'spelers'){ lijst = m.spelers || []; if (o.onSpelers) o.onSpelers(lijst); return; }
          if (m.t === 'actie'){ if (o.onActie) o.onActie(m.van, m.d, m.naam); return; }
        },
        onOpen:function(){ if (o.onOpen) o.onOpen(); },
        onWacht:function(p){ if (o.onWacht) o.onWacht(p); },
        onDicht:function(r){ if (o.onDicht) o.onDicht(r); } });
      voorlopig.splice(0).forEach(function(m){ v.stuur(m); });
    });
    /* De lobby krijgt alleen een lijst spelers mee en weet dus niet bij welke
       kamer hij hoort. Hier wordt de laatst geopende onthouden, zodat het
       kruisje achter een naam weet waar hij heen moet. Een pagina heeft er
       nooit meer dan een tegelijk open. */
    var kamer = {
      naar: function(pid, d){ d.n = ++n; stuur({ t:'naar', pid:pid, d:d }); },
      kaarten: function(l){ l.forEach(function(k){ k.d.n = ++n; }); for (var i = 0; i < l.length; i += 40) stuur({ t:'kaarten', lijst:l.slice(i, i + 40) }); },
      alle: function(d){ d.n = ++n; stuur({ t:'alle', d:d }); },
      start: function(){ stuur({ t:'start' }); },
      stop: function(){ stuur({ t:'stop' }); },
      weg: function(pid){ stuur({ t:'weg', sid:pid }); },
      spelers: function(){ return lijst; },
      sluit: function(){ weg = true; voorlopig = []; if (v) v.sluit(); }
    };
    laatsteKamer = kamer;
    return kamer;
  }
  /* de kamer die het laatst geopend is; de lobby heeft hem nodig voor het kruisje */
  var laatsteKamer = null;
  /* Rollen verdelen: eerst de rollen met een vast aantal, in volgorde; wat
     overblijft gaat naar de rol zonder aantal (of naar de laatste). Wie al een
     rol had (in 'vast') houdt die, zodat een laatkomer niet alles omgooit. */
  function verdeel(spelers, rollen, vast){
    var uit = {}, vrij = [];
    vast = vast || {};
    spelers.forEach(function(s){ if (vast[s.sid]) uit[s.sid] = vast[s.sid]; else vrij.push(s.sid); });
    for (var i = vrij.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = vrij[i]; vrij[i] = vrij[j]; vrij[j] = t; }
    var tel = {}; Object.keys(uit).forEach(function(k){ tel[uit[k]] = (tel[uit[k]] || 0) + 1; });
    rollen.forEach(function(r){
      if (r.aantal === undefined || r.aantal === null) return;
      while ((tel[r.id] || 0) < r.aantal && vrij.length){ uit[vrij.shift()] = r.id; tel[r.id] = (tel[r.id] || 0) + 1; }
    });
    var rest = rollen.filter(function(r){ return r.aantal === undefined || r.aantal === null; })[0] || rollen[rollen.length - 1];
    vrij.forEach(function(sid){ uit[sid] = rest.id; });
    return uit;
  }
  /* Een delegatie laten kiezen: dezelfde kaart naar een groepje telefoons,
     de meeste stemmen gelden (bij gelijk: wie het eerst koos), en als niet
     iedereen reageert valt het besluit twaalf seconden na de eerste stem.
     Geeft { actie(pid, d), sluit() } terug; geef acties van de kamer door. */
  function delegatie(kamer, leden, kaart, klaar, o){
    o = o || {};
    var keuzes = {}, volg = [], timer = null, af = false, id = kaart.id;
    kamer.kaarten(leden.map(function(pid){ return { pid:pid, d:JSON.parse(JSON.stringify(kaart)) }; }));
    function besluit(){
      if (af) return; af = true; clearTimeout(timer);
      var tel = {};
      Object.keys(keuzes).forEach(function(p){ var k = keuzes[p]; tel[k] = (tel[k] || 0) + 1; });
      var best = volg.slice().sort(function(a, b){ return tel[b] - tel[a]; })[0];
      klaar(best === undefined ? null : best, tel);
    }
    return {
      actie: function(pid, d){
        if (af || !d || d.vraag !== id || leden.indexOf(pid) < 0) return false;
        var k = d.keuze !== undefined ? String(d.keuze) : String(d.waarde);
        keuzes[pid] = k; if (volg.indexOf(k) < 0) volg.push(k);
        if (o.onStem) o.onStem(Object.keys(keuzes).length, leden.length, keuzes);
        if (Object.keys(keuzes).length >= leden.length) besluit();
        else if (!timer) timer = setTimeout(besluit, o.wacht || 12000);
        return true;
      },
      sluit: besluit,
      af: function(){ return af; }
    };
  }
  /* De startknop zegt zelf waar hij op wacht. Een spel dat pas kan beginnen
     met genoeg telefoons liet dat aan een regeltje naast de lobby over, en
     ondertussen deed de knop niets zonder uitleg. Geef door hoeveel apparaten
     er meedoen, hoeveel er nodig zijn en hoe de knop heet als het wel kan.
     Komt er nog iets anders bij (een niveau dat nog niet gekozen is), dan kan
     dat er met ook en ookTekst bij. Geeft terug hoeveel er tekort zijn en de
     zin die erbij hoort, zodat de lobby dezelfde woorden kan gebruiken. */
  function startknop(el, o){
    o = o || {};
    var aantal = o.aantal || 0, nodig = o.nodig || 0;
    var tekort = Math.max(0, nodig - aantal);
    var tekst = tekort ? 'Nog ' + tekort + (tekort === 1 ? ' apparaat' : ' apparaten') + ' nodig' : '';
    if (el){
      el.disabled = tekort > 0 || !!o.ook;
      el.textContent = tekort ? tekst : (o.ook ? (o.ookTekst || o.klaar) : o.klaar);
      el.title = tekort ? 'Er doen ' + aantal + ' van de ' + nodig + ' apparaten mee.' : '';
    }
    return { tekort:tekort, tekst:tekst };
  }
  function lobby(el, code, spelers, tekst){
    if (!el) return;
    /* de houder mag geen raster van het spel zelf zijn, anders past de kaart niet */
    el.style.display = 'block';
    el.innerHTML = '<div class="rollen-lobby"><div class="rollen-code">' +
        '<small>ga op je telefoon of laptop naar</small><i>' + schoon(location.host.replace(/^www\./, '')) + '/q</i>' +
        '<small>en vul deze code in</small><b>' + schoon(code) + '</b></div>' +
      '<div><p class="rollen-tel">' + (spelers.length ? spelers.length + (spelers.length === 1 ? ' apparaat' : ' apparaten') + ' aangemeld' : 'Nog niemand. Zodra iemand meedoet staat zijn bijnaam hier.') + '</p>' +
      '<div class="rollen-chips">' + spelers.map(function(s){
        return '<span class="rollen-chip' + (s.aan ? '' : ' uit') + '">' + (window.AVATAR ? AVATAR.svg(s.naam, 22, s.av) : '') + schoon(s.naam) +
          (s.rol ? '<small>' + schoon(s.rol) + '</small>' : '') +
          '<button type="button" class="rollen-weg" title="Haal ' + schoon(s.naam) + ' uit het spel" aria-label="Haal ' + schoon(s.naam) + ' uit het spel" data-naam="' + schoon(s.naam) + '" data-weg="' + schoon(s.sid) + '">\u00d7</button></span>';
      }).join('') + '</div>' + (tekst ? '<p class="rollen-tel">' + schoon(tekst) + '</p>' : '') + '</div></div>';
    /* De lobby wordt bij elke verandering opnieuw getekend, dus de luisteraar
       hangt aan de houder en niet aan de knopjes zelf. */
    if (el.__wegHaak) return;
    el.__wegHaak = true;
    el.addEventListener('click', function(e){
      var b = e.target && e.target.closest ? e.target.closest('[data-weg]') : null;
      if (!b || !laatsteKamer) return;
      var wie = b.getAttribute('data-naam') || 'deze leerling';
      if (!confirm(wie + ' uit het spel halen? Hij kan daarna opnieuw meedoen met de code.')) return;
      laatsteKamer.weg(b.getAttribute('data-weg'));
    });
  }
  /* de stijl van de lobby en de chips, één keer */
  try {
    var st = document.createElement('style');
    st.textContent = '.rollen-lobby{display:grid;grid-template-columns:minmax(0,auto) minmax(0,1fr);gap:18px;align-items:start;margin:14px auto;width:min(760px,100%)}' +
      '.rollen-code{background:#14224C;color:#FBF6F1;border-radius:22px;padding:14px 20px;text-align:center;max-width:100%;min-width:0;overflow-wrap:anywhere}' +
      '.rollen-code small{display:block;opacity:.8;font-size:.9rem;line-height:1.3}' +
      /* het adres is net zo belangrijk als de code: zonder adres heb je niets aan de code */
      '.rollen-code i{display:block;font-style:normal;font-weight:700;font-size:clamp(1.35rem,5vw,2.2rem);line-height:1.2;margin:4px 0 10px;overflow-wrap:anywhere}' +
      '.rollen-code b{display:block;font-size:clamp(2.2rem,11vw,3.6rem);letter-spacing:.18em;line-height:1.15;font-weight:700;margin:4px 0 0 .18em}' +
      /* op het digibord (bordstand of Digibord-knop): alles groter en breder */
      'body.bord .rollen-lobby,body.groot .rollen-lobby{width:min(1240px,100%);gap:28px}' +
      'body.bord .rollen-code,body.groot .rollen-code{padding:22px 34px}' +
      'body.bord .rollen-code small,body.groot .rollen-code small{font-size:clamp(1rem,1.3vw,1.4rem)}' +
      'body.bord .rollen-code i,body.groot .rollen-code i{font-size:clamp(2rem,3.2vw,3.6rem)}' +
      'body.bord .rollen-code b,body.groot .rollen-code b{font-size:clamp(3.6rem,7.5vw,7.5rem)}' +
      'body.bord .rollen-tel,body.groot .rollen-tel{font-size:clamp(1rem,1.3vw,1.35rem)}' +
      'body.bord .rollen-chip,body.groot .rollen-chip{font-size:clamp(.95rem,1.2vw,1.25rem);padding:6px 8px}' +
      '.rollen-tel{color:var(--muted);font-size:.9rem;margin:0 0 8px}.rollen-chips{display:flex;flex-wrap:wrap;gap:6px}' +
      '.rollen-chip{display:inline-flex;align-items:center;gap:6px;background:var(--kaart,#fff);border:1px solid rgba(20,34,76,.12);border-radius:999px;padding:5px 6px 5px 6px;font-weight:600;font-size:.88rem}.rollen-chip.uit{opacity:.45}.rollen-chip small{font-weight:500;color:var(--muted);font-size:.76rem}' +
      /* het kruisje om iemand eruit te halen; ruim genoeg om met een vinger te raken */
      '.rollen-weg{border:none;background:none;color:var(--muted);cursor:pointer;font-size:1.05rem;line-height:1;min-width:44px;min-height:44px;margin:-14px -6px -14px 0;padding:0}' +
      '.rollen-weg:hover,.rollen-weg:focus-visible{color:#c0442c}' +
      '.rollen-stem{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:12px 0}.rollen-stem div{background:var(--kaart,#fff);border:1px solid rgba(20,34,76,.12);border-radius:16px;padding:12px 14px}.rollen-stem b{display:block;font-size:1.8rem;line-height:1.1}.rollen-stem span{font-size:.8rem;color:var(--muted)}' +
      '@media(max-width:620px){.rollen-lobby{grid-template-columns:minmax(0,1fr);gap:12px}.rollen-code{padding:12px 14px}}' +
      ':root[data-theme="dark"] .rollen-chip,:root[data-theme="dark"] .rollen-stem div{background:#182652;border-color:rgba(243,239,233,.14)}' +
      '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .rollen-chip,:root:not([data-theme="light"]) .rollen-stem div{background:#182652;border-color:rgba(243,239,233,.14)}}';
    document.head.appendChild(st);
  } catch (e){}
  /* ---------- verder na herladen ----------
     Een rolspel speelt zich af in de pagina van het bord: de stand, de beurt,
     wie welke rol heeft. Herlaadde het digibord per ongeluk, dan was dat weg,
     terwijl de kamer en de telefoons gewoon doorliepen. Nu bewaart elk spel
     aan het begin van elke stap zijn stand in deze browser, en biedt het na
     herladen aan om verder te gaan zolang de kamer nog loopt. De telefoons
     hoeven niets: de kamer bewaart per leerling zijn laatste kaart.

       ROLSPEL.bewaar(spel, kamerInfo of null, stand)
       ROLSPEL.vergeet(spel)                       aan het einde, of bij opnieuw beginnen
       ROLSPEL.hervat(spel, plek, function(b){})   b.stand en b.kamer ({ code, sleutel }) */
  var HOUD = 4 * 3600000;
  function bewaarNaam(spel){ return 'lg-rol-' + spel; }
  function bewaar(spel, kamerInfo, stand){
    try {
      localStorage.setItem(bewaarNaam(spel), JSON.stringify({ t:Date.now(), stand:stand,
        kamer: kamerInfo && kamerInfo.code ? { code:kamerInfo.code, sleutel:kamerInfo.sleutel } : null }));
    } catch (e){}
  }
  function vergeet(spel){ try { localStorage.removeItem(bewaarNaam(spel)); } catch (e){} }
  function hervat(spel, plek, verder){
    var b = null;
    try { b = JSON.parse(localStorage.getItem(bewaarNaam(spel)) || 'null'); } catch (e){}
    if (!b || !b.stand || Date.now() - b.t > HOUD){ vergeet(spel); return; }
    function toon(){
      if (!plek) return;
      var k = document.createElement('div');
      k.className = 'rollen-hervat';
      k.innerHTML = '<b>Er loopt nog een spel' + (b.kamer ? ' in kamer ' + schoon(b.kamer.code) : '') + '</b>' +
        '<span>Het bord is herladen, maar de stand is bewaard' + (b.kamer ? ' en de telefoons zijn er nog' : '') +
        '. Ga verder waar je was: de stap die bezig was, begint opnieuw.</span>' +
        '<div><button type="button" class="ja">Verder met dit spel</button><button type="button" class="nee">Nee, opnieuw beginnen</button></div>';
      plek.insertBefore(k, plek.firstChild);
      k.querySelector('.nee').addEventListener('click', function(){ vergeet(spel); k.remove(); });
      k.querySelector('.ja').addEventListener('click', function(){ k.remove(); verder(b); });
      k.querySelector('.ja').focus({ preventScroll:true });
    }
    if (!b.kamer){ toon(); return; }
    /* loopt die kamer nog? Een afgelopen of opgeruimde kamer bieden we niet aan */
    fetch('/api/kamer/' + b.kamer.code).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){
      if (!j || j.fase === 'einde'){ vergeet(spel); return; }
      toon();
    }).catch(function(){});
  }
  try {
    var st2 = document.createElement('style');
    st2.textContent = '.rollen-hervat{display:grid;gap:6px;background:var(--kaart,#fff);color:var(--ink,#14224C);border:2px solid #EA9836;border-radius:18px;padding:16px 18px;margin:0 0 18px}' +
      '.rollen-hervat b{font-size:1.1rem}.rollen-hervat span{color:var(--muted,#5b6480);font-size:.92rem}' +
      '.rollen-hervat div{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}' +
      '.rollen-hervat button{min-height:44px;border-radius:999px;padding:8px 18px;font:600 .95rem Poppins,system-ui,sans-serif;cursor:pointer;border:1.5px solid rgba(20,34,76,.18);background:var(--kaart,#fff);color:var(--ink,#14224C)}' +
      '.rollen-hervat button.ja{background:#F26749;border-color:#F26749;color:#14224C}';
    document.head.appendChild(st2);
  } catch (e){}
  return { maak:maak, host:host, verdeel:verdeel, delegatie:delegatie, lobby:lobby, startknop:startknop, schoon:schoon,
           bewaar:bewaar, vergeet:vergeet, hervat:hervat };
})();
