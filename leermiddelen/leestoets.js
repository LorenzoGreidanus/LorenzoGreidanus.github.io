/* De leestoets: teksten in een toets of oefening uit Mijn materiaal. Een stuk heeft
   naast de vragen een lijst teksten; een vraag die bij een tekst hoort, wijst ernaar.

     m.teksten  [{ id:'A', titel, bank:'zwembad-golf' } of { id:'B', titel, tekst:'alinea\n\nalinea' }]
     item.tekst 'A'        de vraag hoort bij tekst A (de tekst staat erbij)
     item.doel  'zoekend'  de leesvaardigheid (leesbank.js DOELEN), voor de resultaten per vaardigheid

   Een tekst uit de leesbank (leesbank.js, leesteksten.js) staat er met zijn id in; de tekst zelf
   tekent leesblad.js. Een eigen tekst is platte tekst met een lege regel tussen de alinea's.

     LEESTOETS.laad(m)              belofte: alles staat klaar om de teksten van m te tekenen
     LEESTOETS.html(tk)             de tekst (leesblad.js)
     LEESTOETS.vragen(t, doelen)    de taken van een leesbanktekst als vragen voor maken.html
     LEESTOETS.volgorde(items, l, schud)  een volgorde waarin de vragen bij hun tekst blijven;
                                    schud(lijst) husselt binnen een tekst
     LEESTOETS.DOELNAAM             de namen van de leesvaardigheden
     LEESTOETS.KLAAR, klaar(id)     kant-en-klare leestoetsen; klaar(id) geeft { naam, vak, modus, teksten, items }
                                    (maken.html?leestoets=<id> zet hem in de editor; de leesbank moet geladen zijn) */
window.LEESTOETS = (function(){
  'use strict';
  var DOELNAAM = { strategie:'Leesstrategie kiezen', verkennend:'Verkennend lezen', globaal:'Globaal lezen', zoekend:'Zoekend lezen', nauwkeurig:'Nauwkeurig lezen', kritisch:'Kritisch lezen',
    studerend:'Studerend lezen', onderwerp:'Onderwerp en hoofdgedachte', doel:'Tekstdoel en tekstsoort', alinea:'Kernzinnen en alinea’s', signaal:'Signaalwoorden',
    verwijs:'Verwijswoorden', samenvat:'Samenvatten', tussen:'Tussen de regels lezen', woord:'Woordbetekenis', argument:'Standpunt en argumenten' };
  var laden = {};
  function script(src){
    if (laden[src]) return laden[src];
    laden[src] = new Promise(function(klaar, mis){ var s = document.createElement('script'); s.src = src; s.onload = klaar; s.onerror = function(){ laden[src] = null; mis(new Error('laden lukte niet')); }; document.head.appendChild(s); });
    return laden[src];
  }
  /* bank: ook de teksten van de leesbank (groot), anders alleen de opmaak */
  function laad(m){
    var bank = m === true || !!(m && (m.teksten || []).some(function(t){ return t.bank; }));
    return (window.LEESBANK ? Promise.resolve() : script('leesbank.js?v=1')).then(function(){
      return Promise.all([window.LEESBLAD ? null : script('leesblad.js?v=3'), bank && !LEESBANK.TEKSTEN.length ? script('leesteksten.js?v=1') : null]);
    });
  }
  function eigenTekst(tk){
    return { titel:tk.titel || 'Tekst', vorm:'artikel', alineas:String(tk.tekst || '').split(/\n\s*\n/).map(function(a){ return a.replace(/\s+/g, ' ').trim(); }).filter(Boolean) };
  }
  function html(tk){
    if (!tk || !window.LEESBLAD) return '';
    var t = tk.bank ? window.LEESBANK && LEESBANK.tekst(tk.bank) : eigenTekst(tk);
    return t ? LEESBLAD.tekstHtml(t) : '<p class="tip">Deze tekst staat niet meer in de leesbank.</p>';
  }

  /* ---------- de taken van een tekst als vragen ---------- */
  function plat(s){ return String(s == null ? '' : s).replace(/\*\*([^*]+)\*\*/g, '$1').replace(/__([^_]+)__/g, '$1').replace(/\s+/g, ' ').trim(); }
  function kort(s, n){ s = plat(s); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; }
  function vragen(t, doelen){
    var uit = [], kies = doelen && doelen.length ? doelen : Object.keys(t.taken || {});
    kies.forEach(function(d){
      (t.taken[d] || []).forEach(function(o){
        var u = o.u ? kort(o.u, 300) : '', basis = { doel:d, uitleg:u, punten:1 };
        if (o.t === 'keuze') uit.push(Object.assign({ vorm:'mk', vraag:kort(o.v, 300), goed:kort(o.o[0], 150), fout:o.o.slice(1).map(function(x){ return kort(x, 150); }) }, basis));
        /* een rij van een raster wordt een losse meerkeuzevraag; een opdracht om iets op te schrijven past daar niet bij */
        else if (o.t === 'raster') o.rijen.forEach(function(r){
          uit.push(Object.assign({ vorm:'mk', vraag:kort(plat(o.v).replace(/\s*(Schrijf|Zet) (ook |er )?[^.?]*(alinea|kruisje)[^.?]*\./ig, '') + ' ' + plat(r.z), 300), goed:o.kol[r.g], fout:o.kol.filter(function(k, i){ return i !== r.g; }) }, basis,
            r.al != null ? { uitleg:kort('Kijk in alinea ' + r.al + '. ' + u, 300) } : {}));
        });
        else if (o.t === 'koppel') uit.push(Object.assign({ vorm:'koppel', vraag:kort(o.v, 300), paren:o.links.map(function(l, i){ return { a:kort(l, 100), b:kort(o.rechts[i], 100) }; }).slice(0, 10) }, basis, { punten:2 }));
        else if (o.t === 'volgorde') uit.push(Object.assign({ vorm:'volgorde', vraag:kort(o.v, 300), stappen:o.stappen.map(function(s){ return kort(s, 120); }).slice(0, 10) }, basis, { punten:2 }));
        else if (o.t === 'zoek') o.vragen.forEach(function(q){ uit.push(Object.assign({ vorm:'open', vraag:kort(q.v, 300), antwoorden:q.a.map(function(a){ return kort(a, 100); }).slice(0, 8) }, basis)); });
        /* een open vraag of een schema: de docent kijkt hem zelf na, met het voorbeeld in de uitleg */
        else if (o.t === 'open') uit.push(Object.assign({ vorm:'open', vraag:kort(o.v + (o.max ? ' Gebruik hoogstens ' + o.max + ' woorden.' : ''), 300), antwoorden:[], begin:o.b ? kort(o.b, 80) : '' }, basis,
          { uitleg:kort('Voorbeeld: ' + (o.b ? plat(o.b) + ' ' : '') + plat(o.m), 300), punten:2 }));
        else if (o.t === 'schema') uit.push(Object.assign({ vorm:'open', vraag:kort(o.v + ' ' + o.vakken.join(', '), 300), antwoorden:[] }, basis,
          { uitleg:kort('Voorbeeld: ' + o.vakken.map(function(v, i){ return plat(v) + ': ' + plat(o.m[i]); }).join('; '), 300), punten:2 }));
      });
    });
    return uit;
  }

  /* ---------- de volgorde: een tekst blijft bij zijn vragen ----------
     De groepen staan in de volgorde waarin hun eerste vraag staat; schud husselt binnen een groep. */
  function volgorde(items, l, schud){
    var groep = {}, volg = [];
    l.forEach(function(i){ var k = items[i] && items[i].tekst ? 't' + items[i].tekst : 'v' + i; if (!groep[k]){ groep[k] = []; volg.push(k); } groep[k].push(i); });
    return [].concat.apply([], volg.map(function(k){ return schud && groep[k].length > 1 ? schud(groep[k]) : groep[k]; }));
  }
  /* ---------- kant-en-klare leestoetsen ---------- */
  var KLAAR = { "strategie-signaal-verwijs-2f": { "naam": "Leestoets: leesstrategieën, signaalwoorden en verwijswoorden (2F)", "vak": "ned", "modus": "toets", "delen": [ { "los": [ { "vorm": "mk", "doel": "strategie", "vraag": "Je wilt weten hoe laat de bus morgen vertrekt. Je hebt de dienstregeling voor je. Hoe lees je?", "goed": "zoekend lezen", "fout": [ "globaal lezen", "nauwkeurig lezen", "studerend lezen" ], "uitleg": "Je zoekt één gegeven: een tijd. Dan zoek je met een sleutelwoord en lees je alleen daar.", "punten": 1 }, { "vorm": "mk", "doel": "strategie", "vraag": "Morgen heb je een toets over een hoofdstuk uit je biologieboek. Hoe lees je het hoofdstuk?", "goed": "studerend lezen", "fout": [ "zoekend lezen", "verkennend lezen", "globaal lezen" ], "uitleg": "Je moet de stof leren en onthouden: kernwoorden markeren, een schema maken en jezelf overhoren.", "punten": 1 }, { "vorm": "mk", "doel": "strategie", "vraag": "Je hebt de spelregels van een nieuw bordspel en wilt niets fout doen. Hoe lees je?", "goed": "nauwkeurig lezen", "fout": [ "globaal lezen", "verkennend lezen", "kritisch lezen" ], "uitleg": "Bij regels telt elk woord, zoals alleen, nooit en pas.", "punten": 1 }, { "vorm": "mk", "doel": "strategie", "vraag": "In de bibliotheek liggen vijf boeken over haaien. Je wilt weten welk boek je kunt gebruiken voor je werkstuk. Hoe lees je?", "goed": "verkennend lezen", "fout": [ "studerend lezen", "nauwkeurig lezen", "zoekend lezen" ], "uitleg": "Je bekijkt de titel, de kopjes en de maker, en beslist of je er iets aan hebt.", "punten": 1 }, { "vorm": "mk", "doel": "strategie", "vraag": "Op sociale media zie je een bericht: Dit drankje maakt je slimmer. Hoe lees je zo’n bericht?", "goed": "kritisch lezen", "fout": [ "globaal lezen", "zoekend lezen", "studerend lezen" ], "uitleg": "Je vraagt je af wie het schrijft en waarom, en of het een feit is of een mening.", "punten": 1 }, { "vorm": "mk", "doel": "strategie", "vraag": "Je wilt in twee minuten weten waar een nieuwsbericht over gaat. Hoe lees je?", "goed": "globaal lezen", "fout": [ "nauwkeurig lezen", "studerend lezen", "verkennend lezen" ], "uitleg": "Je leest snel door en let op de eerste zin van elke alinea.", "punten": 1 } ] }, { "bank": "zoekend-klimhal", "doelen": [ "zoekend" ], "kies": [ 0, 1, 2, 3, 4, 5, 6, 7 ] }, { "bank": "nauwkeurig-spaaractie", "doelen": [ "nauwkeurig", "verwijs", "signaal" ], "kies": [ 0, 1, 2, 4, 5, 7, 8, 9, 10, 11, 12 ] }, { "bank": "globaal-spierpijn", "doelen": [ "globaal", "signaal" ] }, { "los": [ { "vorm": "mk", "doel": "signaal", "vraag": "Het regende de hele dag. Daardoor ging de wedstrijd niet door. Welk verband geeft daardoor?", "goed": "oorzaak en gevolg", "fout": [ "tegenstelling", "voorbeeld", "opsomming" ], "uitleg": "De regen is de oorzaak, het afgelaste duel het gevolg.", "punten": 1 }, { "vorm": "mk", "doel": "signaal", "vraag": "Sem traint elke dag. Toch verloor hij de finale. Welk verband geeft toch?", "goed": "tegenstelling", "fout": [ "oorzaak en gevolg", "doel", "tijd" ], "uitleg": "Je verwacht dat hij wint, maar het gaat anders: een tegenstelling.", "punten": 1 }, { "vorm": "mk", "doel": "signaal", "vraag": "Neem een regenjas mee, want het gaat vanmiddag regenen. Welk verband geeft want?", "goed": "reden", "fout": [ "tegenstelling", "voorbeeld", "voorwaarde" ], "uitleg": "Achter want staat waarom je de regenjas meeneemt: de reden.", "punten": 1 }, { "vorm": "mk", "doel": "signaal", "vraag": "Welk signaalwoord past op de plek van de puntjes? Ik spaar mijn zakgeld, … ik in de zomer een nieuwe fiets kan kopen.", "goed": "zodat", "fout": [ "omdat", "maar", "toen" ], "uitleg": "Je spaart met een doel: zodat geeft een doel aan.", "punten": 1 }, { "vorm": "mk", "doel": "verwijs", "vraag": "Lisa leende het boek van Ahmed. Ze bracht het een week later terug. Naar wie verwijst ze?", "goed": "Lisa", "fout": [ "Ahmed", "het boek", "een week" ], "uitleg": "Wie bracht het terug? Lisa, want zij had het geleend.", "punten": 1 }, { "vorm": "mk", "doel": "verwijs", "vraag": "De school kocht nieuwe laptops. Die zijn veel sneller dan de oude. Naar wat verwijst die?", "goed": "de nieuwe laptops", "fout": [ "de school", "de oude laptops", "de leerlingen" ], "uitleg": "Zet het gevonden woord op de plek van die: de nieuwe laptops zijn veel sneller.", "punten": 1 }, { "vorm": "mk", "doel": "verwijs", "vraag": "Mijn opa woont in Zeeland. Daar is het in de zomer altijd druk. Naar wat verwijst daar?", "goed": "Zeeland", "fout": [ "mijn opa", "de zomer", "het strand" ], "uitleg": "Daar verwijst naar een plaats: Zeeland.", "punten": 1 } ] } ] } };
  /* dezelfde toets op 1F, voor vmbo-bb: kortere teksten, drie keuzes per vraag */
  KLAAR['strategie-signaal-verwijs-1f'] = {"naam":"Leestoets: leesstrategieën, signaalwoorden en verwijswoorden (1F, vmbo-bb)","vak":"ned","modus":"toets","delen":[{"los":[{"vorm":"mk","doel":"strategie","vraag":"Je wilt weten hoe laat de bus gaat. Hoe lees je de dienstregeling?","goed":"zoekend lezen","fout":["globaal lezen","studerend lezen"],"uitleg":"Je zoekt één ding: een tijd. Je zoekt het woord en leest alleen daar.","punten":1},{"vorm":"mk","doel":"strategie","vraag":"Je moet een hoofdstuk leren voor een toets. Hoe lees je?","goed":"studerend lezen","fout":["zoekend lezen","verkennend lezen"],"uitleg":"Je wilt het onthouden. Dus markeer je de belangrijke woorden en overhoor je jezelf.","punten":1},{"vorm":"mk","doel":"strategie","vraag":"Je leest de regels van een nieuw spel. Je wilt niets fout doen. Hoe lees je?","goed":"nauwkeurig lezen","fout":["globaal lezen","verkennend lezen"],"uitleg":"Bij regels telt elk woord.","punten":1},{"vorm":"mk","doel":"strategie","vraag":"Je hebt vijf boeken over honden. Welk boek past bij je werkstuk? Hoe kies je?","goed":"verkennend lezen","fout":["studerend lezen","nauwkeurig lezen"],"uitleg":"Je kijkt naar de titel, de kopjes en de plaatjes. Dan kies je.","punten":1},{"vorm":"mk","doel":"strategie","vraag":"Een filmpje online zegt: dit drankje maakt je sterk. Hoe lees je zo’n bericht?","goed":"kritisch lezen","fout":["globaal lezen","zoekend lezen"],"uitleg":"Je vraagt je af wie het zegt en waarom. Wil iemand iets verkopen?","punten":1},{"vorm":"mk","doel":"strategie","vraag":"Je wilt snel weten waar een nieuwsbericht over gaat. Hoe lees je?","goed":"globaal lezen","fout":["nauwkeurig lezen","studerend lezen"],"uitleg":"Je leest snel door en kijkt naar de eerste zin van elke alinea.","punten":1}]},{"bank":"zwembad-golf","doelen":["zoekend"]},{"bank":"nauwkeurig-pannenkoeken","doelen":["nauwkeurig","verwijs"],"kies":[0,2,3,4,6,7,9,10]},{"bank":"globaal-zebra","doelen":["globaal","signaal"],"kies":[0,2,3,4,5]},{"los":[{"vorm":"mk","doel":"signaal","vraag":"Het regende de hele dag. Daardoor ging de wedstrijd niet door. Welk verband geeft daardoor?","goed":"oorzaak en gevolg","fout":["tegenstelling","opsomming"],"uitleg":"De regen is de oorzaak. Dat de wedstrijd niet doorging, is het gevolg.","punten":1},{"vorm":"mk","doel":"signaal","vraag":"Sem traint elke dag. Toch verloor hij de finale. Welk verband geeft toch?","goed":"tegenstelling","fout":["oorzaak en gevolg","tijd"],"uitleg":"Je denkt dat hij wint, maar het gaat anders.","punten":1},{"vorm":"mk","doel":"signaal","vraag":"Neem een jas mee, want het gaat regenen. Welk verband geeft want?","goed":"reden","fout":["tegenstelling","voorbeeld"],"uitleg":"Achter want staat waarom je de jas meeneemt.","punten":1},{"vorm":"mk","doel":"signaal","vraag":"Welk woord past op de puntjes? Ik spaar mijn zakgeld, … ik een fiets kan kopen.","goed":"zodat","fout":["maar","toen"],"uitleg":"Je spaart met een doel. Zodat geeft het doel aan.","punten":1},{"vorm":"mk","doel":"verwijs","vraag":"Lisa leende het boek van Ahmed. Ze bracht het een week later terug. Wie is ze?","goed":"Lisa","fout":["Ahmed","het boek"],"uitleg":"Lisa had het boek geleend, dus zij brengt het terug.","punten":1},{"vorm":"mk","doel":"verwijs","vraag":"De school kocht nieuwe laptops. Die zijn heel snel. Wat is die?","goed":"de nieuwe laptops","fout":["de school","de leerlingen"],"uitleg":"Zet het woord op de plek van die: de nieuwe laptops zijn heel snel.","punten":1},{"vorm":"mk","doel":"verwijs","vraag":"Mijn opa woont in Zeeland. Daar is het in de zomer druk. Waar is daar?","goed":"in Zeeland","fout":["bij mijn opa thuis","in de zomer"],"uitleg":"Daar gaat over een plek: Zeeland.","punten":1}]}]};
  function klaar(id){
    var k = KLAAR[id]; if (!k || !window.LEESBANK) return null;
    var teksten = [], items = [];
    k.delen.forEach(function(d){
      if (d.los){ items = items.concat(JSON.parse(JSON.stringify(d.los))); return; }
      var t = LEESBANK.tekst(d.bank); if (!t) return;
      var tid = 'ABCDEF'.charAt(teksten.length);
      teksten.push({ id: tid, titel: t.titel, bank: t.id });
      var v = vragen(t, d.doelen);
      (d.kies ? d.kies.map(function(i){ return v[i]; }).filter(Boolean) : v).forEach(function(x){ x.tekst = tid; items.push(x); });
    });
    return { naam: k.naam, vak: k.vak, modus: k.modus, teksten: teksten, items: items };
  }
  return { laad:laad, html:html, vragen:vragen, volgorde:volgorde, DOELNAAM:DOELNAAM, plat:plat, KLAAR:KLAAR, klaar:klaar };
})();
