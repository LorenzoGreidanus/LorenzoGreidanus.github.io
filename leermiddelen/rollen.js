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
     ROLSPEL.lobby(el, code, spelers)   het deelnamescherm van het spel, met de code en de telefoons
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
    /* De kaarten zijn genummerd, en een telefoon negeert een kaart voor iedereen
       die ouder is dan zijn eigen laatste. Na het herladen van het bord begon die
       teller weer bij nul, en kwam bijvoorbeeld de eindkaart nergens meer aan.
       Dus beginnen bij de klok: een nieuw bord telt altijd verder dan het oude. */
    var v = null, lijst = [], n = Date.now(), voorlopig = [], weg = false;
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
  /* ---------- het deelnamescherm ----------
     Elk klassenspel opent in zijn eigen wereld: kleuren, een patroon, het
     lettertype van het spel, een icoon, een zin over wat de klas wordt en wat
     je krijgt. Welk spel het is, zegt de naam van de pagina (voc.html: voc).
     Een spel zonder thema krijgt het gewone donkerblauwe vak met de code. */
  var FELL = "var(--fell,'IM Fell English',Georgia,serif)", SCHETS = "var(--schets,'Cabin Sketch',Poppins,sans-serif)";
  var KRINGEL = '<svg viewBox="0 0 32 32" width="40" height="40" aria-hidden="true"><rect width="32" height="32" rx="10" fill="#FBF6F1"/><circle cx="16" cy="15.5" r="7.4" fill="none" stroke="#0F7C8C" stroke-width="3.4"/><path d="M9.6 19.6L7.4 25.6l6-2.2z" fill="#0F7C8C"/><circle cx="24.6" cy="7.4" r="4.1" fill="#F26749" stroke="#FBF6F1" stroke-width="1.8"/></svg>';
  var THEMA = {
    gerucht: { bg:'#0F7C8C', ink:'#FBF6F1', patroon:'radial-gradient(circle at 14px 14px, transparent 5px, rgba(251,246,241,.09) 5.5px 7.5px, transparent 8px)', maat:'28px 28px',
      logo:KRINGEL, merk:'kringel', sub:'Het gerucht', hand:'#FCDED6', handTekst:'nepnieuws en mediawijsheid', kop:'Kringel gaat open',
      zin:'De klas wordt een sociaal netwerk. Er komen berichten binnen: echt, nep, een grap of een bewerkte foto. Wat deel jij door?', stap3:'Je krijgt een rol en eigen volgers',
      nr:'#FBF6F1', nrInk:'#0A5C68', tegelRand:'#0F7C8C', tegelInk:'#0A5C68', wie:'in Kringel', noot:'#D9522F', nootTekst:'iedereen erbij? dan gaan we open' },
    voc: { bg:'#F7EEDB', ink:'#2B1D0E', patroon:'repeating-conic-gradient(from 0deg at 84% 26%, rgba(43,29,14,.12) 0deg .5deg, transparent .5deg 15deg)',
      merk:'De VOC-beurs', badge:'#9E2B1C', badgeInk:'#F7EEDB', icoon:'M3 17h18l-3 4H6zM12 3v14M12 4c4 2 5 6 0 9M11 5c-4 2-4 6 0 8',
      hand:'#9E2B1C', handTekst:'Amsterdam, 1598 tot 1629', kop:'De beurs gaat open', kopFont:FELL, kopGewicht:'400', kopSpatie:'-.01em',
      zin:'De klas belegt in de handel met Azië. Op de beurs gaan geruchten rond, en een paar mensen weten meer dan de rest.', stap3:'Je wordt koopman, weduwe, predikant, ambachtsman of dienstmeid',
      nr:'#9E2B1C', nrInk:'#F7EEDB', paneel:'#3A2614', paneelInk:'#F7EEDB', zacht:'#D9C49A', tegel:'#F7EEDB', tegelRand:'#C9902E', tegelInk:'#2B1D0E', vak:'#4A3218', vakRand:'rgba(201,144,46,.45)',
      wie:'op de beurs', noot:'#C9902E', nootTekst:'de bel gaat zo' },
    berlijn: { bg:'#1F4D3A', ink:'#F2E9D3', patroon:'repeating-linear-gradient(45deg, rgba(255,255,255,.035) 0 2px, transparent 2px 7px), repeating-linear-gradient(-45deg, rgba(0,0,0,.10) 0 2px, transparent 2px 7px)',
      merk:'De Conferentie van Berlijn', badge:'#CDA75A', badgeInk:'#1F4D3A', icoon:'M12 19l7-7 3 3-7 7zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18zM2 2l7.6 7.6',
      hand:'#CDA75A', handTekst:'Berlijn, november 1884', kop:'De conferentie wordt geopend', kopFont:FELL, kopGewicht:'400', kopSpatie:'-.01em',
      zin:'Vier Europese mogendheden verdelen Afrika op papier. Er zit geen enkele Afrikaan aan tafel.', stap3:'Je komt in een delegatie: Groot-Brittannië, Frankrijk, Duitsland of Leopold II',
      nr:'#CDA75A', nrInk:'#1F4D3A', paneel:'#F2E9D3', paneelInk:'#2A2A2E', zacht:'#6b5a45', tegel:'#FFFBF0', tegelRand:'#CDA75A', tegelInk:'#1F4D3A', vak:'#FFFBF0', vakRand:'rgba(42,42,46,.14)',
      wie:'aan tafel', noot:'#9E2B1C', nootTekst:'alle vier de delegaties er? dan opent de voorzitter' },
    eiland: { bg:'#15557A', ink:'#F8F1E0', patroon:'radial-gradient(circle at 50% 100%, transparent 15px, rgba(248,241,224,.10) 16px 18px, transparent 19px)', maat:'44px 22px',
      merk:'Het eiland', badge:'#C9472A', badgeInk:'#F8F1E0', icoon:'M12 22V11M12 11C10 6 5 5 3 7M12 11c2-5 7-6 9-4M12 11c-4-1-8 1-9 4M12 11c4-1 8 1 9 4M8 22h8',
      hand:'#F4C04E', handTekst:'na de schipbreuk', kop:'Aan land!', kopFont:SCHETS, kopSpatie:'0',
      zin:'Het schip is gestrand. Veertig mensen, vijf groepen, geen regels. De klas maakt de grondwet van het eiland, regel voor regel.', stap3:'Je krijgt een groep en een eigen persoon',
      nr:'#F4C04E', nrInk:'#23262B', paneel:'#F8F1E0', paneelInk:'#23262B', paneelRand:'3px dashed #C9B48A', zacht:'#6b5a45', tegelRand:'#C9472A', tegelInk:'#23262B', vakRand:'#C9B48A',
      wie:'aan land', noot:'#C9472A', nootTekst:'iedereen aan land? dan maken we de eerste regel' },
    standen: { bg:'#6B5A45', ink:'#F4EADD', patroon:'repeating-linear-gradient(90deg, rgba(244,234,221,.08) 0 24px, transparent 24px 72px)',
      merk:'Stem per stand', badge:'#C0442C', badgeInk:'#F4EADD', icoon:'M3 18h18M4 18l-1-10 5 4 4-7 4 7 5-4-1 10',
      hand:'#E6D3B8', handTekst:'Versailles, mei 1789', kop:'De Staten-Generaal komt bijeen',
      zin:'De koning heeft geen geld meer. Drie standen, drie stemmen. De Derde Stand is zevenennegentig procent van Frankrijk en kan altijd worden overstemd.', stap3:'Je komt in een stand: geestelijkheid, adel of Derde Stand',
      nr:'#E6D3B8', nrInk:'#6B5A45', paneel:'#F4EADD', tegelRand:'#8C7150', tegelInk:'#6B5A45', vakRand:'#E6D8C4',
      wie:'in de zaal', noot:'#C0442C', nootTekst:'alle drie de standen er? dan spreekt de koning' },
    fabriek: { bg:'#8C3B22', ink:'#FCEFE4', patroon:'linear-gradient(0deg, rgba(0,0,0,.16) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,.16) 2px, transparent 2px)', maat:'56px 28px',
      merk:'De fabriek', badge:'#F6B65A', badgeInk:'#8C3B22', icoon:'M3 21V11l5 3V11l5 3V7h4l1 14zM15 7V3h3v4M3 21h18',
      hand:'#F6B65A', handTekst:'Enschede, 1850 tot 1878', kop:'De fabriek gaat open',
      zin:'Jullie stad leeft van katoen. Dan komt de stoommachine. Een paar van jullie worden fabrikant, de rest werkt, met een gezin dat elke week moet eten.', stap3:'Je wordt fabrikant, arbeider, arbeidster, kind of handwever',
      nr:'#F6B65A', nrInk:'#5a2414', paneel:'#FCEFE4', tegelRand:'#8C3B22', tegelInk:'#8C3B22', vakRand:'rgba(140,59,34,.2)',
      wie:'in de stad', noot:'#8C3B22', nootTekst:'de fabrieksfluit gaat zo' },
    gemeenteraad: { bg:'#A0455F', ink:'#FFF6F8', patroon:'repeating-radial-gradient(circle at 50% 118%, rgba(255,255,255,.08) 0 3px, transparent 3px 36px)',
      merk:'De gemeenteraad', badge:'#A86F43', badgeInk:'#FFFFFF', icoon:'M14 5l5 5M12 6l6 6-3 3-6-6zM9 11l-6 6 2 2 6-6M13 21h8',
      hand:'#FCDED6', handTekst:'Molenveen, 27.400 inwoners', kop:'De raad vergadert',
      zin:'Jullie zijn de gemeenteraad: 21 raadsleden in vijf fracties. Eerst een coalitie met een meerderheid, dan de voorstellen van het college.', stap3:'Je krijgt een zetel in een fractie',
      nr:'#FCDED6', nrInk:'#7a2f45', paneel:'#FFFDF9', tegelRand:'#A0455F', tegelInk:'#7a2f45', vakRand:'rgba(160,69,95,.2)',
      wie:'in de raadszaal', noot:'#A0455F', nootTekst:'iedereen op zijn plek? dan opent de voorzitter' },
    vergaderklas: { bg:'#EADCC9', ink:'#14224C', patroon:'repeating-linear-gradient(0deg, rgba(20,34,76,.05) 0 2px, transparent 2px 22px)',
      boven:'repeating-linear-gradient(90deg, #C0442C 0 18px, transparent 18px 26px)', bovenH:'14px', onder:'repeating-linear-gradient(90deg, #C0442C 0 18px, transparent 18px 26px)', onderH:'14px',
      merk:'De vergadering van de klas', badge:'#C0442C', badgeInk:'#FFFFFF', icoon:'M4 21h16M6 18h12M7 18V8M12 18V8M17 18V8M4 8h16L12 3z',
      hand:'#B23A22', handTekst:'de klas is de polis', kop:'De volksvergadering',
      zin:'Er komen wetsvoorstellen langs en er wordt gestemd. Wie zijn hand mag opsteken hangt af van de bestuursvorm, en die verandert tijdens het spel.', stap3:'Je wordt oude familie, rijke burger, gewone burger of geen burger',
      nr:'#C0442C', nrInk:'#FFFFFF', paneel:'#14224C', paneelInk:'#F3EFE9', zacht:'#C9CFDD', tegel:'#FDFAF6', tegelRand:'#C0442C', tegelInk:'#14224C', vak:'#22305e', vakRand:'rgba(243,239,233,.14)',
      wie:'op de Pnyx', noot:'#F6B65A', nootTekst:'iedereen op de heuvel? dan stemmen we' },
    vergadering: { bg:'#9A4A1C', ink:'#FFF5E8', patroon:'repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 2px, transparent 2px 98px)',
      merk:'De vergadering', badge:'#F6B65A', badgeInk:'#8A3A12', icoon:'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z',
      hand:'#F6B65A', handTekst:'iedereen moet ja zeggen', kop:'Den Haag, 1672',
      zin:'Frankrijk valt binnen. De zeven gewesten moeten samen een oorlogsbelasting goedkeuren. Een enkel nee blokkeert alles.', stap3:'Je wordt een van de zes gewesten naast Holland',
      nr:'#F6B65A', nrInk:'#5a2a0c', paneel:'#FFF6E8', tegelRand:'#C0442C', tegelInk:'#8A3A12', vakRand:'rgba(138,58,18,.18)',
      wie:'in Den Haag', noot:'#C0442C', nootTekst:'alle gewesten er? dan opent de vergadering' },
    crisis: { bg:'#14224C', ink:'#F3EFE9', patroon:'repeating-radial-gradient(circle at 86% 78%, rgba(255,255,255,.08) 0 2px, transparent 2px 48px)',
      onder:'linear-gradient(90deg, #204ECF 0 50%, #C0442C 50% 100%)', onderH:'12px',
      merk:'De crisis', badge:'#C0442C', badgeInk:'#FFFFFF', icoon:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12l6-6',
      hand:'#F6B65A', handTekst:'Koude Oorlog, oktober 1962', kop:'Dertien dagen in oktober',
      zin:'De wereld staat op de rand van een kernoorlog. Twee teams, elk met eigen geheime doelen. Houd de spanning onder de honderd.', stap3:'Je komt in een team: de VS of de Sovjet-Unie',
      nr:'#F3EFE9', nrInk:'#14224C', tegelRand:'#14224C', tegelInk:'#14224C',
      wie:'in de crisiskamer', noot:'#C0442C', nootTekst:'beide teams compleet? dan begint dag 1' },
    klimaattop: { bg:'#14224C', ink:'#F3EFE9',
      onder:'linear-gradient(90deg, #2f62b8 0 12.5%, #4a7fd0 12.5% 25%, #83A5F2 25% 37.5%, #cfdcf8 37.5% 50%, #FCDED6 50% 62.5%, #F7A08A 62.5% 75%, #F26749 75% 87.5%, #b5502a 87.5% 100%)', onderH:'40px',
      merk:'De klimaattop', badge:'#B5502A', badgeInk:'#FFFFFF', icoon:'M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0zM12 9v8',
      hand:'#83A5F2', handTekst:'van 2030 tot 2080', kop:'De klimaattop opent',
      zin:'Elke telefoon is de delegatie van een land: rijk of arm, olie of eiland. Lukt het jullie om samen onder de 2 graden te blijven?', stap3:'Je vertegenwoordigt een land',
      nr:'#83A5F2', nrInk:'#14224C', tegelRand:'#B5502A', tegelInk:'#B5502A',
      wie:'in de zaal', noot:'#B5502A', nootTekst:'alle landen aanwezig? dan opent de top' },
    uitbraak: { bg:'#B4235A', ink:'#FFF2F6', patroon:'radial-gradient(circle, rgba(255,255,255,.12) 0 5px, transparent 6px)', maat:'46px 46px',
      merk:'De uitbraak', badge:'#FFFFFF', badgeInk:'#B4235A', icoon:'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5L19 19M5 19l3.5-3.5M15.5 8.5L19 5',
      hand:'#FCDED6', handTekst:'in Lindeveen, acht weken lang', kop:'Lindeveen, week 1',
      zin:'In het dorp gaat een nieuw virus rond. Iedereen is een inwoner. Een of twee van jullie zijn al besmet, maar weten het zelf nog niet.', stap3:'Je wordt een inwoner: leerling, verpleegkundige, buschauffeur, opa of oma, of winkelier',
      nr:'#FCDED6', nrInk:'#8A1A44', paneel:'#F3ECE1', tegelRand:'#B4235A', tegelInk:'#8A1A44', vakRand:'rgba(180,35,90,.18)',
      wie:'in Lindeveen', noot:'#B4235A', nootTekst:'iedereen in het dorp? dan begint week 1' },
    ecosysteem: { bg:'#0D7B8A', ink:'#F1FAFA', patroon:'radial-gradient(ellipse at 50% 100%, transparent 60%, rgba(255,255,255,.08) 61% 64%, transparent 65%)', maat:'120px 40px',
      merk:'Het ecosysteem', badge:'#5D8F4E', badgeInk:'#FFFFFF', icoon:'M5 19C5 10 11 4 20 4c0 9-6 15-15 15zM5 19l8-8',
      hand:'#F1E3C6', handTekst:'in de duinen, tien seizoenen lang', kop:'De duinen komen tot leven',
      zin:'Achter de zeereep ligt duizend hectare duin. Elke groep is een soort en kiest per seizoen wat hij doet. Het bord rekent uit wat dat doet met het voedselweb.', stap3:'Je wordt een soort: planten, konijnen, muizen, vossen of roofvogels',
      nr:'#F1E3C6', nrInk:'#0A5F6B', paneel:'#F1E3C6', tegelRand:'#0D7B8A', tegelInk:'#0A5F6B', vakRand:'rgba(13,123,138,.2)',
      wie:'in de duinen', noot:'#0A5F6B', nootTekst:'alle soorten er? dan begint de lente' },
    rivier: { bg:'#2F6F8F', ink:'#EAF1F6', patroon:'repeating-linear-gradient(170deg, rgba(255,255,255,.07) 0 3px, transparent 3px 26px)',
      merk:'Langs de rivier', badge:'#83A5F2', badgeInk:'#14224C', icoon:'M2 8c3-3 5 3 8 0s5 3 8 0 4 0 4 0M2 14c3-3 5 3 8 0s5 3 8 0 4 0 4 0M2 20c3-3 5 3 8 0s5 3 8 0',
      hand:'#F6B65A', handTekst:'van de bergen tot de zee', kop:'Langs de rivier',
      zin:'Vijf gebieden, drie landen, één rivier. Elk jaar kiest elk gebied wat het met het water doet.', stap3:'Je woont in een gebied: bergdorp, boerenstreek, industriestad, natuurgebied of havenstad',
      nr:'#F6B65A', nrInk:'#1F4F66', paneel:'#EAF1F6', tegelRand:'#2F6F8F', tegelInk:'#1F4F66', vakRand:'rgba(47,111,143,.2)',
      wie:'langs de rivier', noot:'#2F6F8F', nootTekst:'iedereen aan de oever? dan begint jaar 1' },
    markt: { bg:'#204ECF', ink:'#FFFFFF', boven:'repeating-linear-gradient(90deg, #A3630F 0 48px, #FFF1E5 48px 96px)', bovenH:'34px', ruimte:'12px',
      merk:'De markt', badge:'#A3630F', badgeInk:'#FFFFFF', icoon:'M3 12V3h9l9 9-9 9zM7.5 7.5h.01',
      hand:'#F6B65A', handTekst:'vraag en aanbod', kop:'De markt gaat open',
      zin:'Wat kost een ventilator? De helft koopt, de helft verkoopt, en iedereen heeft een geheim bedrag op zijn kaart.', stap3:'Je wordt koper of verkoper, met een geheim bedrag',
      nr:'#FFF1E5', nrInk:'#204ECF', paneel:'#FFF1E5', tegelRand:'#A3630F', tegelInk:'#8A520A', vakRand:'rgba(163,99,15,.2)',
      wie:'bij de kraam', noot:'#8A520A', nootTekst:'iedereen bij de kraam? dan gaat de bel' },
    archief: { bg:'#8A6A45', ink:'#FFF8EC', patroon:'repeating-linear-gradient(0deg, rgba(0,0,0,.16) 0 3px, transparent 3px 96px), repeating-linear-gradient(90deg, rgba(0,0,0,.16) 0 3px, transparent 3px 240px)',
      merk:'Het archief', badge:'#F7EEDB', badgeInk:'#8A6A45', icoon:'M3 7V5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 9h18',
      hand:'#F7EEDB', handTekst:'iedereen één bron', kop:'Het archief gaat open',
      zin:'De klas is een team historici. Eén vraag, vier beweringen, acht bronnen, en iedereen krijgt er één. Niemand heeft het hele verhaal.', stap3:'Je krijgt een bron uit de zomer van 1566',
      nr:'#F7EEDB', nrInk:'#5C4429', paneel:'#F7EEDB', paneelInk:'#3D2A14', zacht:'#6b5a45', tegelRand:'#8A6A45', tegelInk:'#5C4429', vakRand:'#E2D2B2',
      wie:'in het archief', noot:'#8A6A45', nootTekst:'alle bronnen uitgedeeld? dan gaan de laden open' },
    tijdbalk: { bg:'#14224C', ink:'#F3EFE9',
      onder:'linear-gradient(90deg, #8a6a45 0 10%, #a0455f 10% 20%, #6b4f8a 20% 30%, #2f6f8f 30% 40%, #2f8a55 40% 50%, #E1A93A 50% 60%, #c0442c 60% 70%, #5b6480 70% 80%, #204ECF 80% 90%, #9A55B8 90% 100%)', onderH:'36px',
      merk:'De tijdbalk van de klas', badge:'#F6B65A', badgeInk:'#14224C', icoon:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
      hand:'#F6B65A', handTekst:'tien tijdvakken, één klas', kop:'Leg het in de tijd',
      zin:'Iedereen krijgt een gebeurtenis en legt die in het goede tijdvak. Op het bord groeit de tijdbalk van de hele klas.', stap3:'Je krijgt een gebeurtenis om te plaatsen',
      nr:'#F6B65A', nrInk:'#14224C', tegelRand:'#14224C', tegelInk:'#14224C',
      wie:'met een kaart', noot:'#C0442C', nootTekst:'iedereen een kaart? dan delen we uit' },
    meetlat: { bg:'#3D4866', ink:'#FFFFFF',
      onder:'repeating-linear-gradient(90deg, rgba(20,34,76,.7) 0 2px, transparent 2px 24px), #C8A482', onderH:'30px',
      merk:'Langs de meetlat', badge:'#C8A482', badgeInk:'#14224C', icoon:'M2 16L16 2l6 6L8 22zM7 11l2 2M10 8l2 2M13 5l2 2M4 14l2 2',
      hand:'#F6B65A', handTekst:'Nederland, 1940 tot 1945', kop:'Van goed tot fout',
      zin:'Zestien mensen maken een keuze tijdens de bezetting. Jij zet ze op de meetlat. Er is geen goed antwoord.', stap3:'Je zet zestien mensen op je eigen meetlat',
      nr:'#C8A482', nrInk:'#14224C', tegelRand:'#3D4866', tegelInk:'#3D4866',
      wie:'aan de meetlat', noot:'#3D4866', nootTekst:'iedereen een meetlat? dan beginnen we' }
  };
  var THEMA_BASIS = { patroon:'none', maat:'auto', boven:'', bovenH:'0px', onder:'', onderH:'0px', ruimte:'0px', kopFont:'inherit', kopGewicht:'700', kopSpatie:'-.03em',
    paneel:'#FBF6F1', paneelInk:'#14224C', paneelRand:'0', zacht:'#5b6480', tegel:'#FFFFFF', vak:'#FFFFFF', vakRand:'rgba(20,34,76,.10)' };
  function themaNu(){
    var m = /([a-z]+)\.html$/.exec(location.pathname) || [];
    var t = THEMA[m[1] || ''];
    if (!t) return null;
    var uit = {}, k;
    for (k in THEMA_BASIS) uit[k] = THEMA_BASIS[k];
    for (k in t) uit[k] = t[k];
    return uit;
  }
  function chipsHtml(spelers){
    return spelers.map(function(s){
      return '<span class="rollen-chip' + (s.aan ? '' : ' uit') + '">' + (window.AVATAR ? AVATAR.svg(s.naam, 22, s.av) : '') + schoon(s.naam) +
        (s.rol ? '<small>' + schoon(s.rol) + '</small>' : '') +
        '<button type="button" class="rollen-weg" title="Haal ' + schoon(s.naam) + ' uit het spel" aria-label="Haal ' + schoon(s.naam) + ' uit het spel" data-naam="' + schoon(s.naam) + '" data-weg="' + schoon(s.sid) + '">×</button></span>';
    }).join('');
  }
  function themaHtml(t, code, spelers, tekst){
    var adres = schoon(location.host.replace(/^www\./, '')) + '/q';
    var letters = String(code || '').toUpperCase().split('');
    var stap = function(nr, html){ return '<li><b style="background:' + t.nr + ';color:' + t.nrInk + '">' + nr + '</b><span>' + html + '</span></li>'; };
    return '<div class="rl" style="--rl-vak:' + t.vak + ';--rl-vakrand:' + t.vakRand + ';--rl-zacht:' + t.zacht + '">' +
      '<div class="rl-links" style="background-color:' + t.bg + ';background-image:' + t.patroon + ';background-size:' + t.maat + ';color:' + t.ink + '">' +
        (t.boven ? '<i class="rl-band" style="top:0;height:' + t.bovenH + ';background:' + t.boven + '"></i>' : '') +
        (t.onder ? '<i class="rl-band" style="bottom:0;height:' + t.onderH + ';background:' + t.onder + '"></i>' : '') +
        '<div class="rl-merk" style="margin-top:' + t.ruimte + '">' +
          (t.logo ? t.logo : '<span class="rl-badge" style="background:' + t.badge + ';color:' + t.badgeInk + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + t.icoon + '"/></svg></span>') +
          '<span' + (t.logo ? ' class="rl-merknaam"' : '') + '>' + schoon(t.merk) + '</span>' + (t.sub ? '<span class="rl-sub">· ' + schoon(t.sub) + '</span>' : '') + '</div>' +
        '<p class="rl-hand" style="color:' + t.hand + '">' + schoon(t.handTekst) + '</p>' +
        '<h2 class="rl-kop" style="font-family:' + t.kopFont + ';font-weight:' + t.kopGewicht + ';letter-spacing:' + t.kopSpatie + '">' + schoon(t.kop) + '</h2>' +
        '<p class="rl-zin">' + schoon(t.zin) + '</p>' +
        '<ol class="rl-stappen">' + stap(1, 'Ga naar <strong>' + adres + '</strong>') + stap(2, 'Vul de code in en kies een bijnaam') + stap(3, schoon(t.stap3)) + '</ol>' +
      '</div>' +
      '<div class="rl-rechts" style="background:' + t.paneel + ';color:' + t.paneelInk + ';border-left:' + t.paneelRand + '">' +
        '<p class="rl-label">doe mee met de code</p>' +
        '<p class="rl-code" aria-label="De code is ' + schoon(letters.join(' ')) + '">' + letters.map(function(l){
          return '<span aria-hidden="true" style="background:' + t.tegel + ';color:' + t.tegelInk + ';box-shadow:inset 0 0 0 3px ' + t.tegelRand + ',0 5px 0 ' + t.tegelRand + '">' + schoon(l) + '</span>';
        }).join('') + '</p>' +
        '<p class="rl-tel"><i></i>' + (spelers.length ? '<span><b>' + spelers.length + '</b> ' + (spelers.length === 1 ? 'apparaat' : 'apparaten') + ' ' + schoon(t.wie) + '</span>' : '<span>Nog niemand. Zodra iemand meedoet, staat zijn bijnaam hier.</span>') + '</p>' +
        (spelers.length ? '<div class="rollen-chips">' + chipsHtml(spelers) + '</div>' : '') +
        (tekst ? '<p class="rl-tip">' + schoon(tekst) + '</p>' : '') +
        '<p class="rl-noot" style="color:' + t.noot + '">' + schoon(t.nootTekst) + '</p>' +
      '</div></div>';
  }
  function lobby(el, code, spelers, tekst){
    if (!el) return;
    /* de houder mag geen raster van het spel zelf zijn, anders past de kaart niet */
    el.style.display = 'block';
    var t = themaNu();
    if (t) el.innerHTML = themaHtml(t, code, spelers, tekst);
    else el.innerHTML = '<div class="rollen-lobby"><div class="rollen-code">' +
        '<small>ga op je telefoon of laptop naar</small><i>' + schoon(location.host.replace(/^www\./, '')) + '/q</i>' +
        '<small>en vul deze code in</small><b>' + schoon(code) + '</b></div>' +
      '<div><p class="rollen-tel">' + (spelers.length ? spelers.length + (spelers.length === 1 ? ' apparaat' : ' apparaten') + ' aangemeld' : 'Nog niemand. Zodra iemand meedoet staat zijn bijnaam hier.') + '</p>' +
      '<div class="rollen-chips">' + chipsHtml(spelers) + '</div>' + (tekst ? '<p class="rollen-tel">' + schoon(tekst) + '</p>' : '') + '</div></div>';
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
  /* de stijl van het deelnamescherm met thema */
  try {
    var stt = document.createElement('style');
    stt.textContent = '.rl{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);width:min(1100px,100%);margin:14px auto;border-radius:24px;overflow:hidden;box-shadow:0 14px 34px rgba(20,34,76,.18);text-align:left;font-family:Poppins,system-ui,sans-serif}' +
      'body.bord .rl,body.groot .rl{width:min(1280px,100%)}' +
      '.rl-links{position:relative;overflow:hidden;padding:34px 40px;display:flex;flex-direction:column;justify-content:center;gap:14px;min-width:0}' +
      '.rl-band{position:absolute;left:0;right:0;display:block}' +
      '.rl-merk{position:relative;display:flex;align-items:center;gap:10px;font-weight:700;font-size:1.05rem;line-height:1.2}' +
      '.rl-merknaam{font-size:1.6rem;letter-spacing:-.04em}.rl-sub{font-weight:500;opacity:.9}' +
      '.rl-badge{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;transform:rotate(-4deg);flex:none}' +
      '.rl-badge svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
      '.rl-hand{position:relative;margin:4px 0 0;font-family:Caveat,cursive;font-weight:700;font-size:1.55rem;line-height:1}' +
      '.rl-kop{position:relative;margin:0;font-size:clamp(2rem,4.2vw,3.2rem);line-height:1.02;color:inherit}' +
      '.rl-zin{position:relative;margin:0;font-size:1.05rem;line-height:1.45;max-width:36em}' +
      '.rl-stappen{position:relative;margin:4px 0 0;padding:0;list-style:none;display:grid;gap:9px;font-size:1rem}' +
      '.rl-stappen li{display:flex;align-items:center;gap:10px}' +
      '.rl-stappen b{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:.85rem;flex:none}' +
      '.rl-rechts{padding:30px 28px;display:flex;flex-direction:column;justify-content:center;gap:14px;min-width:0}' +
      '.rl-label{margin:0;font-size:.78rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--rl-zacht)}' +
      '.rl-code{margin:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}' +
      '.rl-code span{height:84px;border-radius:18px;display:grid;place-items:center;font-size:3.1rem;font-weight:700;line-height:1}' +
      '.rl-tel{margin:0;display:flex;align-items:center;gap:12px;border-radius:16px;padding:10px 14px;font-size:1.05rem;background:var(--rl-vak);border:1.5px solid var(--rl-vakrand)}' +
      '.rl-tel i{width:12px;height:12px;border-radius:50%;background:#F26749;box-shadow:0 0 0 5px rgba(242,103,73,.25);flex:none}' +
      '.rl .rl-rechts .rollen-chip.rollen-chip{background:var(--rl-vak);border-color:var(--rl-vakrand);color:inherit}' +
      '.rl .rl-rechts .rollen-chip small,.rl .rl-rechts .rollen-weg{color:var(--rl-zacht)}' +
      '.rl-tip{margin:0;font-size:.92rem;color:var(--rl-zacht)}' +
      '.rl-noot{margin:0;font-family:Caveat,cursive;font-weight:700;font-size:1.6rem;line-height:1.1}' +
      'body.bord .rl-links,body.groot .rl-links{padding:52px 60px;gap:20px}' +
      'body.bord .rl-rechts,body.groot .rl-rechts{padding:44px 40px;gap:18px}' +
      'body.bord .rl-merk,body.groot .rl-merk{font-size:1.3rem}' +
      'body.bord .rl-hand,body.groot .rl-hand{font-size:2rem}' +
      'body.bord .rl-kop,body.groot .rl-kop{font-size:clamp(3rem,5vw,4.6rem)}' +
      'body.bord .rl-zin,body.groot .rl-zin{font-size:1.4rem}' +
      'body.bord .rl-stappen,body.groot .rl-stappen{font-size:1.3rem;gap:12px}' +
      'body.bord .rl-stappen b,body.groot .rl-stappen b{width:40px;height:40px;font-size:1.1rem}' +
      'body.bord .rl-code span,body.groot .rl-code span{height:108px;font-size:4.4rem}' +
      'body.bord .rl-tel,body.groot .rl-tel{font-size:1.3rem}' +
      'body.bord .rl-noot,body.groot .rl-noot{font-size:2rem}' +
      ':root[data-theme="dark"] .rl{box-shadow:0 0 0 1.5px rgba(243,239,233,.16),0 14px 34px rgba(0,0,0,.35)}' +
      '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .rl{box-shadow:0 0 0 1.5px rgba(243,239,233,.16),0 14px 34px rgba(0,0,0,.35)}}' +
      '@media(max-width:820px){.rl{grid-template-columns:minmax(0,1fr)}.rl-links{padding:24px}.rl-rechts{padding:22px;border-left:0 !important}.rl-code span{height:72px;font-size:2.6rem}.rl-kop{font-size:2.1rem}}';
    document.head.appendChild(stt);
  } catch (e){}
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
