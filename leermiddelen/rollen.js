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
  function host(o){
    var ws = null, dicht = false, pogingen = 0, lijst = [], n = 0, wachtrij = [];
    function open(){
      if (dicht) return;
      var proto = location.protocol === 'https:' ? 'wss://' : 'ws://';
      var s = new WebSocket(proto + location.host + '/ws/' + o.code + '?rol=host&sleutel=' + encodeURIComponent(o.sleutel));
      ws = s;
      s.onopen = function(){ pogingen = 0; wachtrij.splice(0).forEach(function(m){ stuur(m); }); if (o.onOpen) o.onOpen(); };
      s.onmessage = function(e){
        var m; try { m = JSON.parse(e.data); } catch (x){ return; }
        if (m.t === 'welkom' || m.t === 'spelers'){ lijst = m.spelers || []; if (o.onSpelers) o.onSpelers(lijst); return; }
        if (m.t === 'actie'){ if (o.onActie) o.onActie(m.van, m.d, m.naam); return; }
      };
      s.onclose = function(e){
        if (ws !== s) return;
        ws = null;
        if (dicht) return;
        if (e.code === 1000 && /gesloten|afgelopen/.test(e.reason || '')){ dicht = true; if (o.onDicht) o.onDicht(e.reason); return; }
        pogingen++;
        setTimeout(open, Math.min(8000, 800 * pogingen));
      };
    }
    function stuur(m){
      if (ws && ws.readyState === 1){ try { ws.send(JSON.stringify(m)); } catch (e){} }
      else if (wachtrij.length < 200) wachtrij.push(m);
    }
    open();
    return {
      naar: function(pid, d){ d.n = ++n; stuur({ t:'naar', pid:pid, d:d }); },
      kaarten: function(l){ l.forEach(function(k){ k.d.n = ++n; }); for (var i = 0; i < l.length; i += 40) stuur({ t:'kaarten', lijst:l.slice(i, i + 40) }); },
      alle: function(d){ d.n = ++n; stuur({ t:'alle', d:d }); },
      start: function(){ stuur({ t:'start' }); },
      stop: function(){ stuur({ t:'stop' }); },
      weg: function(pid){ stuur({ t:'weg', sid:pid }); },
      spelers: function(){ return lijst; },
      sluit: function(){ dicht = true; if (ws){ try { ws.close(1000, 'klaar'); } catch (e){} } ws = null; }
    };
  }
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
        return '<span class="rollen-chip' + (s.aan ? '' : ' uit') + '">' + (window.AVATAR ? AVATAR.svg(s.naam, 22, s.av) : '') + schoon(s.naam) + (s.rol ? '<small>' + schoon(s.rol) + '</small>' : '') + '</span>';
      }).join('') + '</div>' + (tekst ? '<p class="rollen-tel">' + schoon(tekst) + '</p>' : '') + '</div></div>';
  }
  /* de stijl van de lobby en de chips, één keer */
  try {
    var st = document.createElement('style');
    st.textContent = '.rollen-lobby{display:grid;grid-template-columns:minmax(0,auto) minmax(0,1fr);gap:18px;align-items:start;margin:14px auto;width:min(760px,100%)}' +
      '.rollen-code{background:#14224C;color:#FBF6F1;border-radius:22px;padding:14px 20px;text-align:center;max-width:100%;min-width:0;overflow-wrap:anywhere}' +
      '.rollen-code small{display:block;opacity:.75;font-size:.82rem;line-height:1.3}' +
      '.rollen-code i{display:block;font-style:normal;font-weight:600;font-size:clamp(1rem,3.4vw,1.4rem);margin:2px 0 8px;overflow-wrap:anywhere}' +
      '.rollen-code b{display:block;font-size:clamp(2.2rem,11vw,3.6rem);letter-spacing:.18em;line-height:1.15;font-weight:700;margin:4px 0 0 .18em}' +
      '.rollen-tel{color:var(--muted);font-size:.9rem;margin:0 0 8px}.rollen-chips{display:flex;flex-wrap:wrap;gap:6px}' +
      '.rollen-chip{display:inline-flex;align-items:center;gap:6px;background:var(--kaart,#fff);border:1px solid rgba(20,34,76,.12);border-radius:999px;padding:5px 11px 5px 6px;font-weight:600;font-size:.88rem}.rollen-chip.uit{opacity:.45}.rollen-chip small{font-weight:500;color:var(--muted);font-size:.76rem}' +
      '.rollen-stem{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:12px 0}.rollen-stem div{background:var(--kaart,#fff);border:1px solid rgba(20,34,76,.12);border-radius:16px;padding:12px 14px}.rollen-stem b{display:block;font-size:1.8rem;line-height:1.1}.rollen-stem span{font-size:.8rem;color:var(--muted)}' +
      '@media(max-width:620px){.rollen-lobby{grid-template-columns:minmax(0,1fr);gap:12px}.rollen-code{padding:12px 14px}}' +
      ':root[data-theme="dark"] .rollen-chip,:root[data-theme="dark"] .rollen-stem div{background:#182652;border-color:rgba(243,239,233,.14)}' +
      '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .rollen-chip,:root:not([data-theme="light"]) .rollen-stem div{background:#182652;border-color:rgba(243,239,233,.14)}}';
    document.head.appendChild(st);
  } catch (e){}
  return { maak:maak, host:host, verdeel:verdeel, delegatie:delegatie, lobby:lobby, startknop:startknop, schoon:schoon };
})();
