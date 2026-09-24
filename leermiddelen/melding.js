/* Een klein knopje onder een vraag: "Klopt deze vraag niet?" Wie erop tikt
   kan in een regel zeggen wat er mis is; dat gaat met de vraag erbij naar de
   beheerder (beheer.html). Geen naam, geen adres. */
window.MELDING = (function(){
  'use strict';
  function knop(doel, gegevens){
    if (!doel || doel.querySelector('.meldvak')) return;
    var wrap = document.createElement('div'); wrap.className = 'meldvak';
    wrap.innerHTML = '<button type="button" class="meldknop">Klopt deze vraag niet?</button>' +
      '<div class="meldform hide"><textarea maxlength="300" rows="2" placeholder="Wat klopt er niet? Bijvoorbeeld: antwoord B is ook goed."></textarea>' +
      '<div class="meldrij"><button type="button" class="meldstuur">Versturen</button><button type="button" class="meldweg">Laat maar</button></div><p class="meldstatus"></p></div>';
    var k = wrap.querySelector('.meldknop'), form = wrap.querySelector('.meldform'), ta = wrap.querySelector('textarea'), st = wrap.querySelector('.meldstatus');
    k.addEventListener('click', function(){ form.classList.toggle('hide'); if (!form.classList.contains('hide')) ta.focus(); });
    wrap.querySelector('.meldweg').addEventListener('click', function(){ form.classList.add('hide'); });
    wrap.querySelector('.meldstuur').addEventListener('click', function(){
      var g = null; try { g = gegevens ? gegevens() : {}; } catch (e){ g = {}; }
      /* geeft het spel de vraag zelf mee (q), dan gaan de opties en het goede antwoord erbij:
         dan ziet de beheerder meteen wat er stond, zonder te zoeken */
      if (g && g.q){
        var q = g.q;
        if (!g.vraag) g.vraag = q.v || '';
        if (Array.isArray(q.o)){ g.opties = q.o.slice(0, 6).map(String); if (typeof q.g === 'number') g.goed = String(q.o[q.g] == null ? '' : q.o[q.g]); }
        if (q.t) g.onderdeel = String(q.t);
        delete g.q;
      }
      var body = Object.assign({ pad: location.pathname }, g || {}, { opmerking: ta.value.trim() });
      if (!body.opmerking && !body.vraag){ st.textContent = 'Typ eerst wat er niet klopt.'; return; }
      st.textContent = 'Versturen…';
      fetch('/api/melding', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify(body) })
        .then(function(r){ return r.json().then(function(j){ return { ok:r.ok, j:j }; }); })
        .then(function(x){
          if (!x.ok){ st.textContent = x.j.fout || 'Versturen lukte niet.'; return; }
          st.textContent = 'Dank je, de melding is binnen.'; ta.value = '';
          setTimeout(function(){ form.classList.add('hide'); st.textContent = ''; }, 2500);
        })
        .catch(function(){ st.textContent = 'Geen verbinding.'; });
    });
    doel.appendChild(wrap);
  }
  /* voor een paneel dat steeds opnieuw getekend wordt: het knopje komt terug zodra er weer antwoorden staan */
  function volg(id, kiesDoel, gegevens){
    var el = document.getElementById(id);
    if (!el || !window.MutationObserver) return;
    var bezig = false;
    var mo = new MutationObserver(function(){
      if (bezig) return;
      var d = kiesDoel(el);
      if (d && !el.querySelector('.meldvak')){ bezig = true; knop(d, gegevens); bezig = false; }
    });
    mo.observe(el, { childList:true, subtree:true });
  }
  return { knop:knop, volg:volg };
})();
