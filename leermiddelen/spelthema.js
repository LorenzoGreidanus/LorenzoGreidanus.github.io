/* De wereld van elk klassenspel: kleuren, een patroon, het lettertype, een
   icoon, en de zinnen over wat de klas wordt. Het bord (rollen.js) tekent er
   het deelnamescherm mee, de telefoon (rol.html) de strook bovenin en het
   welkom. Een spel heet op het bord naar zijn pagina (voc.html: voc), in de
   kamer soms anders (vergadering.html opent een kamer 'staten'); daarom de
   tweede namen onderaan.

   SPELTHEMA.voor(id)   het thema met alle velden ingevuld, of null */
window.SPELTHEMA = (function(){
  'use strict';
  /* de twee lettertypen die niet op elke pagina staan: hier zelf aanmelden */
  var HIER = (document.currentScript && document.currentScript.src || '').replace(/spelthema\.js[^\/]*$/, '');
  try {
    var f = document.createElement('style');
    f.textContent = "@font-face{font-family:'IM Fell English';font-style:normal;font-weight:400;font-display:swap;src:url(" + HIER + "../fonts/imfell-400-latin.woff2) format('woff2')}" +
      "@font-face{font-family:'Cabin Sketch';font-style:normal;font-weight:700;font-display:swap;src:url(" + HIER + "../fonts/cabinsketch-700-latin.woff2) format('woff2')}";
    document.head.appendChild(f);
  } catch (e){}
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
  var OOK = { staten:'vergadering', polis:'vergaderklas' };
  function voor(id){
    var t = THEMA[OOK[id] || id];
    if (!t) return null;
    var uit = { id:OOK[id] || id }, k;
    for (k in THEMA_BASIS) uit[k] = THEMA_BASIS[k];
    for (k in t) uit[k] = t[k];
    return uit;
  }
  return { voor:voor };
})();
