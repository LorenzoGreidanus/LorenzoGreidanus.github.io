/* Zelf typen in plaats van kiezen. Wie uit vier antwoorden kiest, herkent;
   wie het antwoord zelf moet opschrijven, haalt het uit zijn geheugen, en dat
   blijft beter hangen. Niet elke vraag kan dat: "Wat betekent democratie?"
   heeft geen antwoord van een paar woorden. Dus alleen bij een kort antwoord
   komt er een typveld; de rest blijft meerkeuze.

     TYPEN.kan(q, vak)              kan deze vraag als typvraag?
     TYPEN.keur(q, invoer, vak)     -> { i, goed, bijna }  i: q.g als het goed is, de
                                    index van een fout antwoord als je precies dat typte
                                    (dan kan WAAROM uitleggen waarom), anders -1
     TYPEN.veld(doel, q, vak, klaar) zet het typveld in doel; klaar(uitslag, invoer)

   Nederlands en Engels kijken streng (de spelling is daar de stof), behalve
   hoofdletters. Bij de andere vakken telt een tikfout in een lang woord als
   goed, met de juiste spelling erbij, en doen de, het en een er niet toe. */
window.TYPEN = (function(){
  'use strict';
  var STRENG = { ned:1, eng:1 };
  function kaal(t){ return String(t == null ? '' : t).replace(/<[^>]*>/g, '').trim(); }
  function kan(q, vak){
    if (!q || !Array.isArray(q.o) || q.svg || q.vlag) return false;
    var g = String(q.o[q.g] || '');
    if (!g || /[<>]/.test(g) || g.length > 24 || g.split(/\s+/).length > 3) return false;
    /* vragen die over de antwoorden zelf gaan, of ja/nee */
    if (/welke van deze|van deze|onderstaande|welk antwoord|welke uitspraak|klopt|is waar|niet waar|welke zin|welk woord hoort niet|wat hoort er niet/i.test(q.v)) return false;
    /* "Welk woord is een voegwoord?" heeft veel goede antwoorden, en "Hoe schrijf je het goed?" zonder woord kun je niet typen */
    if (/^welke? (\w+ ){0,3}(is|zijn) een\b|^welk signaalwoord|^noem een|hoe schrijf je (het|dit) goed\??$/i.test(q.v)) return false;
    if (/^(ja|nee|waar|niet waar|juist|onjuist)$/i.test(g)) return false;
    /* twee antwoorden die alleen in hoofdletters of leestekens verschillen kun je niet typend onderscheiden */
    var n = q.o.map(function(x){ return norm(x, vak); });
    if (n.filter(function(x){ return x === n[q.g]; }).length > 1) return false;
    return true;
  }
  function norm(t, vak){
    var s = kaal(t).toLowerCase().replace(/\s+/g, ' ').replace(/[.!?;:]+$/, '').trim();
    s = s.replace(/^(\d+)\.(\d+)$/, '$1,$2');   /* 2.5 is 2,5 */
    if (!STRENG[vak]){
      s = s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s;
      s = s.replace(/^(de|het|een|the|a|an) /, '').replace(/['’"]/g, '');
    }
    return s;
  }
  function afstand(a, b){
    if (Math.abs(a.length - b.length) > 1) return 2;
    var v = [], i, j;
    for (j = 0; j <= b.length; j++) v[j] = j;
    for (i = 1; i <= a.length; i++){
      var vorig = v[0]; v[0] = i;
      for (j = 1; j <= b.length; j++){ var t = v[j]; v[j] = Math.min(v[j] + 1, v[j - 1] + 1, vorig + (a[i - 1] === b[j - 1] ? 0 : 1)); vorig = t; }
    }
    return v[b.length];
  }
  /* Wat telt als goed: het hele antwoord, elk deel van "ten slotte, eindelijk",
     zonder voorzetsel ervoor ("door het oculair": oculair), en bij een getal met
     een eenheid ook het kale getal ("€ 20": 20). */
  function goedeVormen(t, vak){
    var heel = norm(t, vak), uit = [heel];
    heel.split(/\s*[,\/]\s*|\s+of\s+/).forEach(function(d){ if (d && uit.indexOf(d) < 0) uit.push(d); });
    uit.slice().forEach(function(d){
      var z = d.replace(/^(in|door|op|naar|met|bij|van|aan|uit|onder|boven) (de |het |een )?/, '');
      if (z && z !== d && uit.indexOf(z) < 0) uit.push(z);
      var g = /^(?:€\s*)?(-?\d+(?:,\d+)?)\s*(%|procent|jaar|graden|meter|m|cm|km|euro|kg|gram|g|uur|minuten|seconden|cm2|m2)?$/.exec(d);
      if (g && uit.indexOf(g[1]) < 0) uit.push(g[1]);
    });
    return uit;
  }
  function keur(q, invoer, vak){
    var x = norm(invoer, vak), vormen = goedeVormen(q.o[q.g], vak);
    if (!x) return { i:-1, goed:false, bijna:false };
    /* een euroteken of eenheid die je zelf typt, mag ook */
    var xKaal = x.replace(/^€\s*/, '').replace(/\s*(%|procent|euro)$/, '');
    if (vormen.indexOf(x) >= 0 || vormen.indexOf(xKaal) >= 0) return { i:q.g, goed:true, bijna:false };
    for (var k = 0; k < q.o.length; k++) if (k !== q.g && goedeVormen(q.o[k], vak).indexOf(x) >= 0) return { i:k, goed:false, bijna:false };
    /* een tikfout in een lang woord, buiten de taalvakken */
    if (!STRENG[vak] && vormen.some(function(v){ return v.length >= 6 && !/\d/.test(v) && afstand(x, v) <= 1; })) return { i:q.g, goed:true, bijna:true };
    return { i:-1, goed:false, bijna:false };
  }
  var stijl = false;
  function zetStijl(){
    if (stijl) return; stijl = true;
    var s = document.createElement('style');
    s.textContent = '.typvak{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}' +
      '.typvak input{flex:1 1 220px;min-height:52px;font:600 1.15rem Poppins,system-ui,sans-serif;padding:10px 16px;border-radius:14px;border:2px solid var(--rand2,rgba(20,34,76,.2));background:var(--kaart,#fff);color:var(--ink,#14224C)}' +
      '.typvak input:focus{outline:3px solid var(--focusring,#B4701A);outline-offset:2px}' +
      '.typvak input.juist{border-color:#2f7d52;background:rgba(47,125,82,.12)}.typvak input.mis{border-color:#F26749;background:rgba(242,103,73,.12)}' +
      '.typvak button{min-height:52px;padding:0 22px;border-radius:14px;border:0;background:#204ECF;color:#fff;font:600 1rem Poppins,system-ui,sans-serif;cursor:pointer}' +
      '.typvak button:disabled{opacity:.5;cursor:default}' +
      '.typhint{flex-basis:100%;font-size:.8rem;color:var(--muted,#5b6480)}.typuit{font-size:1.05rem;margin-top:6px}';
    document.head.appendChild(s);
  }
  function veld(doel, q, vak, klaar){
    zetStijl();
    doel.innerHTML = '<div class="typvak"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="Typ je antwoord" placeholder="Typ je antwoord">' +
      '<button type="button">Controleer</button><span class="typhint">' + (STRENG[vak] ? 'Let op de spelling: die telt mee.' : 'Hoofdletters doen er niet toe.') + ' Enter is controleren.</span></div>';
    var inp = doel.querySelector('input'), knop = doel.querySelector('button'), af = false;
    function stuur(){
      if (af || !inp.value.trim()) return;
      af = true; inp.disabled = true; knop.disabled = true;
      var u = keur(q, inp.value, vak);
      inp.classList.add(u.goed ? 'juist' : 'mis');
      klaar(u, inp.value.trim());
    }
    knop.addEventListener('click', stuur);
    inp.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); e.stopPropagation(); stuur(); } });
    setTimeout(function(){ try { inp.focus({ preventScroll:true }); } catch (e){} }, 30);
    return inp;
  }
  return { kan:kan, keur:keur, veld:veld, norm:norm };
})();
