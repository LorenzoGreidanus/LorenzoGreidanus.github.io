/* De categorieën van het klasoverzicht en van Mijn voortgang: per vak een
   handvol domeinen, zoals lezen, schrijven, spelling, grammatica en
   woordenschat bij Nederlands, of getallen, verhoudingen, meten en meetkunde
   en verbanden bij rekenen (de domeinen van het referentiekader). Elk
   onderdeel dat een spel telt (od: { onderdeel: [goed, gesteld] }) valt onder
   precies een categorie, welk spel het ook meldde: de Vragenrace, Poortrace,
   Mijnwerker, het dictee of een vakspel. Het is alleen een manier van kijken:
   de uitslagen zelf veranderen niet, dus ook oude potjes vallen er meteen in.

   Hoe een onderdeel zijn categorie vindt, van precies naar ruim:
     1. DEEL: het onderdeel staat er met naam in
     2. PATROON: de naam begint zoals een vakspel zijn onderdelen noemt
        ("klok: aflezen", "dictee: t-bb-01")
     3. de groep uit de vragenbank (BANK.groepVan) en GROEP hieronder
     4. anders "overig", zodat er niets wegvalt

     CATEGORIE.lijst(vak)          de categorieën van een vak, in volgorde
     CATEGORIE.van(vak, id)        de categorie van een onderdeel ('overig' als hij er niet is)
     CATEGORIE.naam(vak, cat)      de naam van een categorie
     CATEGORIE.orde(vak, cat)      de plek in de volgorde (overig achteraan)
     CATEGORIE.vakVan(id)          het vak bij een onderdeel, voor een uitslag zonder vak
     CATEGORIE.tel(od, vak, doel)  een od optellen per vak en categorie in doel */
window.CATEGORIE = (function(){
  'use strict';
  var LIJST = {
    ned:  [{id:'lezen', naam:'Lezen'}, {id:'schrijven', naam:'Schrijven'}, {id:'spelling', naam:'Spelling'},
           {id:'grammatica', naam:'Grammatica'}, {id:'woordenschat', naam:'Woordenschat'}],
    eng:  [{id:'lezen', naam:'Lezen'}, {id:'woordenschat', naam:'Woordenschat'}, {id:'grammatica', naam:'Grammatica'},
           {id:'luisteren', naam:'Luisteren'}, {id:'schrijven', naam:'Schrijven en vertalen'}],
    reken:[{id:'getallen', naam:'Getallen'}, {id:'verhoudingen', naam:'Verhoudingen'},
           {id:'meten', naam:'Meten en meetkunde'}, {id:'verbanden', naam:'Verbanden'}],
    wis:  [{id:'algebra', naam:'Algebra'}, {id:'verbanden', naam:'Grafieken en verbanden'}, {id:'meetkunde', naam:'Meetkunde'},
           {id:'statistiek', naam:'Statistiek'}, {id:'examen', naam:'Examenstof'}],
    ges:  [{id:'tijdvakken', naam:'Tijdvakken'}, {id:'vaardig', naam:'Vaardigheden'},
           {id:'staat', naam:'Staatsinrichting'}, {id:'nl1900', naam:'Nederland na 1900'}],
    aard: [{id:'topo', naam:'Topografie'}, {id:'kaart', naam:'Kaartvaardigheid'}, {id:'ruimte', naam:'Waarom ligt het daar'}, {id:'klimaat', naam:'Weer en klimaat'},
           {id:'bevolking', naam:'Bevolking'}, {id:'examen', naam:'Examenstof'}],
    bio:  [{id:'lichaam', naam:'Mens en lichaam'}, {id:'cellen', naam:'Cellen en erfelijkheid'},
           {id:'natuur', naam:'Planten en ecologie'}, {id:'examen', naam:'Examenstof'}],
    burg: [{id:'staat', naam:'Democratie en rechtsstaat'}, {id:'samen', naam:'Samenleven en media'},
           {id:'wereld', naam:'Europa en economie'}, {id:'examen', naam:'Examenstof'}],
    eco:  [{id:'geld', naam:'Geld en budget'}, {id:'markt', naam:'Markt en prijs'}, {id:'examen', naam:'Examenstof'}]
  };
  /* 1. per onderdeel. Wat hier niet staat, komt via het patroon of de groep. */
  var DEEL = {
    ned:  { werkwoordspelling:'spelling', spelling:'spelling', meervoud:'spelling', leestekens:'spelling',
            woordsoorten:'grammatica', zinsontleding:'grammatica',
            /* verwijswoorden en signaalwoorden: hoe een tekst in elkaar zit, dus lezen */
            verwijswoorden:'lezen', tekstverbanden:'lezen', schooltaal:'lezen', schrijfdoel:'lezen', kernzin:'lezen',
            betekenis:'woordenschat', synoniemen:'woordenschat', uitdrukkingen:'woordenschat',
            /* formeel of informeel schrijven: register hoort bij schrijven */
            'formeel of informeel':'schrijven' },
    eng:  { 'woordjes NL naar EN':'woordenschat', 'woordjes EN naar NL':'woordenschat', 'valse vrienden':'woordenschat',
            'phrasal verbs':'woordenschat', collocations:'woordenschat',
            'irregular verbs':'grammatica', voorzetselwerkwoorden:'grammatica', grammatica:'grammatica',
            vertalen:'schrijven', 'examen-eng':'lezen' },
    reken:{ tafels:'getallen', hoofd:'getallen', cijferen:'getallen', dhte:'getallen', machten:'getallen', negatief:'getallen', delen:'getallen', keer:'getallen', 'grote keersom':'getallen',
            komma:'getallen', schatten:'getallen',
            breuk:'verhoudingen', procent:'verhoudingen', verhouding:'verhoudingen',
            meten:'meten', tijdgeld:'meten', klok:'meten', metriek:'meten',
            /* gemiddelde en schaal: rekenen met gegevens uit een tabel */
            gemiddelde:'verbanden' },
    wis:  { vergelijking:'algebra', formule:'algebra', grafiek:'verbanden', 'coördinaten':'verbanden',
            oppervlakte:'meetkunde', omtrek:'meetkunde', hoeken:'meetkunde', pythagoras:'meetkunde', vlakken:'meetkunde',
            statistiek:'statistiek', 'examen-wis':'examen' },
    ges:  { jaartallen:'tijdvakken', 'wie ben ik':'tijdvakken', 'oorzaak en gevolg':'vaardig', 'werken met bronnen':'vaardig',
            staat:'staat', nl1900:'nl1900' },
    aard: { vlaggen:'topo', landvormen:'topo', topografie:'topo', kaartlezen:'kaart', klimaten:'klimaat',
            bevolking:'bevolking', 'examen-ak':'examen', waarom:'ruimte' },
    eco:  { geld:'geld', markt:'markt', 'examen-eco':'examen' }
  };
  /* 2. de onderdelen van de vakspellen en de losse spellen, op hoe hun naam begint */
  var PATROON = {
    ned:  [[/^begrijpend: /, 'lezen'], [/^alinea: /, 'schrijven'], [/^dictee: /, 'spelling'], [/^(tegenwoordige tijd|verleden tijd|voltooid deelwoord|de d of t val)$/, 'spelling'],
           [/^register: /, 'schrijven'], [/^samenvatten: /, 'schrijven'],
           [/^signaalwoorden: /, 'lezen'], [/^woordenschat: /, 'woordenschat']],
    eng:  [[/^situaties: /, 'luisteren'], [/^reading: /, 'lezen'], [/^dictation: /, 'luisteren'], [/^translate: /, 'schrijven'],
           [/^phrasal: /, 'woordenschat'], [/^irregular /, 'grammatica']],
    reken:[[/^(schatten|cijferen): /, 'getallen'], [/^DHTE /, 'getallen'], [/^(klok|metriek): /, 'meten'],
           [/^verhoudingstabel: /, 'verhoudingen']],
    wis:  [[/^voordoen: /, 'algebra'], [/^vergelijking: /, 'algebra'], [/^grafieken: /, 'verbanden'], [/^coördinaten: /, 'verbanden'],
           [/^(hoeken|pythagoras|vlak): /, 'meetkunde']],
    ges:  [[/^redeneren: /, 'vaardig'], [/^tv\d+$/, 'tijdvakken'], [/^wie ben ik: /, 'tijdvakken'], [/^(oorzaak en gevolg|kaart door de tijd): /, 'vaardig']],
    aard: [[/^topografie/, 'topo'], [/^kaartvaardigheid: /, 'kaart'], [/^klimaatgrafiek: /, 'klimaat'], [/^bevolkingspiramide: /, 'bevolking']],
    bio:  [[/^onderzoek: /, 'natuur'], [/^kruisen: /, 'cellen'], [/^voedselweb: /, 'natuur']],
    burg: [[/^afwegen: /, 'samen'], [/^(democratie|partijen|verkiezingen): /, 'staat']],
    eco:  [[/^huishoudboekje: /, 'geld'], [/^vraag en aanbod: /, 'markt']]
  };
  /* 3. de groep uit de vragenbank; een groep met dezelfde naam als een categorie hoeft hier niet */
  var GROEP = {
    ned:  { spelling:'spelling', interpunctie:'spelling', woordsoorten:'grammatica', zinsontleding:'grammatica', grammatica:'grammatica', lezen:'lezen' },
    eng:  { woordenschat:'woordenschat', werkwoorden:'grammatica', grammatica:'grammatica', lezen:'lezen' },
    reken:{ getallen:'getallen', verhoudingen:'verhoudingen', meten:'meten' },
    wis:  { algebra:'algebra', meetkunde:'meetkunde', verwerken:'verbanden', examen:'examen' },
    ges:  { tijdvakken:'tijdvakken', vaardig:'vaardig' },
    aard: { landen:'topo', klimaat:'klimaat', kaart:'kaart', examen:'examen' }
  };

  function lijst(vak){ return (LIJST[vak] || []).slice(); }
  function bestaat(vak, c){ return (LIJST[vak] || []).some(function(x){ return x.id === c; }); }
  var cache = {};
  function van(vak, id){
    id = String(id || '');
    if (!LIJST[vak]) return 'overig';
    var sl = vak + '|' + id;
    if (cache[sl]) return cache[sl];
    var c = DEEL[vak] && DEEL[vak][id];
    if (!c) (PATROON[vak] || []).some(function(p){ if (p[0].test(id)){ c = p[1]; return true; } return false; });
    if (!c && window.BANK && BANK.groepVan){
      var g = BANK.groepVan(vak, id);
      if (g) c = (GROEP[vak] && GROEP[vak][g]) || (bestaat(vak, g) ? g : '');
    }
    c = c && bestaat(vak, c) ? c : 'overig';
    /* zonder vragenbank nog niets onthouden: de groep kan zo nog komen */
    if (c !== 'overig' || (window.BANK && BANK.groepVan)) cache[sl] = c;
    return c;
  }
  function naam(vak, c){
    var x = (LIJST[vak] || []).filter(function(y){ return y.id === c; })[0];
    return x ? x.naam : 'Overig';
  }
  function orde(vak, c){
    var i = (LIJST[vak] || []).map(function(y){ return y.id; }).indexOf(c);
    return i < 0 ? 99 : i;
  }
  /* Het vak bij een onderdeel, voor de uitslagen zonder vak: de Dagelijkse
     uitdaging en Oefen je fouten vragen uit alle vakken door elkaar. Eerst de
     lijst van de vragenbank, dan de patronen; staat hij bij meer vakken, dan
     het eerste. */
  var vakCache = null;
  function vakVan(id){
    id = String(id || '');
    if (!vakCache && window.ONDERDELEN){
      vakCache = {};
      Object.keys(ONDERDELEN).forEach(function(v){ (ONDERDELEN[v] || []).forEach(function(o){ if (!vakCache[o.id]) vakCache[o.id] = v; }); });
      if (window.TIJDVAKKEN) TIJDVAKKEN.forEach(function(t){ vakCache[t.id] = 'ges'; });
    }
    if (vakCache && vakCache[id]) return vakCache[id];
    var uit = '';
    Object.keys(DEEL).some(function(v){ if (DEEL[v][id]){ uit = v; return true; } return false; });
    if (!uit) Object.keys(PATROON).some(function(v){ return PATROON[v].some(function(p){ if (p[0].test(id)){ uit = v; return true; } return false; }); });
    return uit;
  }
  /* een od optellen: doel[vak][categorie] = [goed, gesteld]; ook per onderdeel in doel[vak]._d[id] */
  function tel(od, vak, doel){
    doel = doel || {};
    if (!od || typeof od !== 'object') return doel;
    Object.keys(od).forEach(function(id){
      var w = od[id]; if (!w || !(w[1] > 0)) return;
      var v = vak && LIJST[vak] ? vak : (vakVan(id) || vak || '');
      if (!v) return;
      var per = doel[v] = doel[v] || { _d:{} }, c = van(v, id);
      var a = per[c] = per[c] || [0, 0]; a[0] += w[0] | 0; a[1] += w[1] | 0;
      var d = per._d[id] = per._d[id] || [0, 0]; d[0] += w[0] | 0; d[1] += w[1] | 0;
    });
    return doel;
  }
  return { lijst:lijst, van:van, naam:naam, orde:orde, vakVan:vakVan, tel:tel };
})();
