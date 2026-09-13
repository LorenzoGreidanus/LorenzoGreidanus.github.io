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
  function lobby(el, code, spelers, tekst){
    if (!el) return;
    el.innerHTML = '<div class="rollen-lobby"><div class="rollen-code"><small>ga naar <b>' + schoon(location.host.replace(/^www\./, '')) + '/q</b> en vul in</small><b>' + schoon(code) + '</b></div>' +
      '<div><p class="rollen-tel">' + (spelers.length ? spelers.length + (spelers.length === 1 ? ' telefoon' : ' telefoons') + ' aangemeld' : 'Nog niemand. Zodra iemand meedoet staat zijn bijnaam hier.') + '</p>' +
      '<div class="rollen-chips">' + spelers.map(function(s){
        return '<span class="rollen-chip' + (s.aan ? '' : ' uit') + '">' + (window.AVATAR ? AVATAR.svg(s.naam, 22, s.av) : '') + schoon(s.naam) + (s.rol ? '<small>' + schoon(s.rol) + '</small>' : '') + '</span>';
      }).join('') + '</div>' + (tekst ? '<p class="rollen-tel">' + schoon(tekst) + '</p>' : '') + '</div></div>';
  }
  /* de stijl van de lobby en de chips, één keer */
  try {
    var st = document.createElement('style');
    st.textContent = '.rollen-lobby{display:grid;grid-template-columns:auto minmax(0,1fr);gap:18px;align-items:start;margin:14px 0}' +
      '.rollen-code{background:#14224C;color:#FBF6F1;border-radius:22px;padding:14px 24px;text-align:center}.rollen-code small{display:block;opacity:.8;font-size:.86rem}.rollen-code b{display:block;font-size:clamp(2.4rem,6vw,4rem);letter-spacing:.22em;line-height:1.1;font-weight:700;margin-left:.22em}' +
      '.rollen-tel{color:var(--muted);font-size:.9rem;margin:0 0 8px}.rollen-chips{display:flex;flex-wrap:wrap;gap:6px}' +
      '.rollen-chip{display:inline-flex;align-items:center;gap:6px;background:var(--kaart,#fff);border:1px solid rgba(20,34,76,.12);border-radius:999px;padding:5px 11px 5px 6px;font-weight:600;font-size:.88rem}.rollen-chip.uit{opacity:.45}.rollen-chip small{font-weight:500;color:var(--muted);font-size:.76rem}' +
      '.rollen-stem{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:12px 0}.rollen-stem div{background:var(--kaart,#fff);border:1px solid rgba(20,34,76,.12);border-radius:16px;padding:12px 14px}.rollen-stem b{display:block;font-size:1.8rem;line-height:1.1}.rollen-stem span{font-size:.8rem;color:var(--muted)}' +
      '@media(max-width:560px){.rollen-lobby{grid-template-columns:1fr}}' +
      ':root[data-theme="dark"] .rollen-chip,:root[data-theme="dark"] .rollen-stem div{background:#182652;border-color:rgba(243,239,233,.14)}' +
      '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .rollen-chip,:root:not([data-theme="light"]) .rollen-stem div{background:#182652;border-color:rgba(243,239,233,.14)}}';
    document.head.appendChild(st);
  } catch (e){}
  return { maak:maak, host:host, verdeel:verdeel, lobby:lobby, schoon:schoon };
})();
