/* ============================================================================
   TEAMBAAS: de gedeelde gegevens en spelregels van de racemanager.
   Werkt in de browser (window.TEAMBAAS) en op de server (import), net als
   cosmetica.js: wat hier staat rekent de server echt af, de pagina toont het.

   - BANEN: de 24 circuits van de kalender van 2026, als lijn (vak van 1000).
     Nagetekend uit f1-circuits van Tomislav Bacinger (MIT-licentie), alleen
     met plaats en land. Sakhir en Jeddah zijn afgelast.
   - De race is elke zondag om 20.00 (Nederlandse tijd), op de baan van die week.
     Een week zonder race (winterstop, zomerstop) rijdt een eerdere baan opnieuw.
   - REGELS: munten, upgrades, tijden, punten. BAND: het bandenmodel.
   ============================================================================ */
(function(g){
  'use strict';
  var BANEN = [
    {"id":"au-1953","plaats":"Melbourne","land":"Australië","datum":"2026-03-08","status":"","lengte":5278,"breed":821,"hoog":1000,"pts":[[324,738],[194,608],[193,599],[205,562],[199,528],[98,422],[54,367],[11,293],[0,263],[8,256],[67,245],[76,238],[76,120],[85,108],[162,54],[243,23],[279,1],[291,0],[322,26],[384,36],[413,48],[449,81],[467,127],[482,212],[477,244],[465,265],[443,301],[423,403],[426,461],[442,510],[469,554],[545,623],[570,633],[626,634],[642,639],[737,718],[755,740],[772,773],[821,951],[692,1000],[676,996],[662,986],[602,884],[592,885],[548,931],[536,935],[516,930]]},
    {"id":"cn-2004","plaats":"Shanghai","land":"China","datum":"2026-03-15","status":"","lengte":5451,"breed":1000,"hoog":870,"pts":[[265,780],[160,800],[122,783],[105,764],[95,741],[95,715],[100,694],[114,678],[149,670],[168,681],[172,696],[163,736],[174,752],[187,757],[209,749],[219,732],[225,681],[68,494],[0,303],[12,294],[27,297],[84,348],[161,479],[197,522],[228,536],[264,539],[297,530],[330,507],[385,408],[422,385],[452,385],[483,403],[524,476],[543,488],[561,483],[600,429],[597,413],[405,96],[389,96],[348,130],[327,119],[309,96],[307,45],[333,11],[376,0],[423,11],[471,58],[996,848],[1000,865],[984,870],[940,843],[800,658]]},
    {"id":"jp-1962","plaats":"Suzuka","land":"Japan","datum":"2026-03-29","status":"","lengte":5807,"breed":1000,"hoog":531,"pts":[[854,283],[995,454],[1000,481],[991,514],[981,526],[967,531],[942,521],[883,437],[844,432],[825,424],[795,355],[778,344],[731,340],[714,330],[704,312],[703,295],[719,247],[718,232],[709,215],[675,196],[641,186],[606,189],[560,216],[500,287],[419,295],[413,286],[401,239],[384,137],[405,76],[395,65],[382,74],[344,135],[321,157],[298,166],[245,169],[175,146],[141,121],[115,84],[88,19],[77,6],[59,0],[26,4],[7,15],[1,23],[0,41],[6,57],[69,111],[155,160],[414,251],[433,254],[470,243],[499,227],[603,139],[627,154],[666,130],[691,130],[728,143],[754,163]]},
    {"id":"bh-2002","plaats":"Sakhir","land":"Bahrein","datum":"2026-04-12","status":"afgelast","lengte":5412,"breed":680,"hoog":1000,"pts":[[22,473],[41,0],[56,1],[111,48],[189,25],[219,24],[670,113],[680,132],[674,153],[586,224],[533,278],[500,344],[480,355],[416,349],[379,358],[259,500],[237,496],[235,463],[272,238],[268,194],[221,148],[206,153],[192,260],[181,459],[171,715],[181,746],[228,755],[251,751],[293,726],[323,688],[357,610],[383,584],[426,567],[472,571],[566,617],[592,639],[605,662],[599,684],[571,708],[56,995],[31,1000],[2,946],[0,927]]},
    {"id":"sa-2021","plaats":"Jeddah","land":"Saoedi-Arabië","datum":"2026-04-19","status":"afgelast","lengte":6175,"breed":215,"hoog":1000,"pts":[[159,770],[108,621],[103,618],[88,621],[81,612],[93,562],[77,460],[75,456],[53,444],[44,425],[45,404],[58,380],[59,362],[55,344],[50,336],[31,321],[29,313],[31,270],[45,257],[63,249],[68,242],[83,185],[86,155],[80,17],[74,6],[61,0],[42,8],[38,16],[35,28],[38,47],[57,77],[66,114],[64,135],[44,181],[42,203],[42,210],[35,219],[17,226],[4,240],[0,279],[2,299],[30,371],[33,438],[42,462],[64,498],[74,529],[76,572],[68,618],[73,629],[87,640],[96,654],[102,683],[99,699],[68,763],[62,787],[63,817],[80,877],[98,912],[114,934],[144,963],[192,996],[201,1000],[207,998],[215,989],[215,983],[190,867]]},
    {"id":"us-2022","plaats":"Miami","land":"Verenigde Staten","datum":"2026-05-03","status":"","lengte":5412,"breed":1000,"hoog":395,"pts":[[493,110],[632,201],[627,215],[589,246],[586,305],[579,320],[553,340],[523,351],[474,356],[452,352],[262,247],[225,252],[188,277],[171,280],[139,271],[110,243],[78,232],[25,248],[4,275],[0,307],[9,324],[20,330],[68,326],[175,348],[355,342],[423,364],[493,387],[577,395],[621,388],[808,320],[935,251],[943,241],[940,234],[906,209],[900,197],[902,168],[921,155],[967,155],[984,141],[1000,113],[984,98],[997,47],[990,36],[132,0],[121,3],[122,22],[176,59],[209,62],[295,29],[355,30]]},
    {"id":"ca-1978","plaats":"Montreal","land":"Canada","datum":"2026-05-24","status":"","lengte":4361,"breed":327,"hoog":1000,"pts":[[274,724],[301,855],[295,957],[321,972],[327,981],[324,993],[311,1000],[267,991],[220,967],[165,918],[160,908],[165,885],[162,875],[122,827],[94,805],[80,781],[73,673],[60,667],[34,668],[18,654],[12,638],[5,609],[0,539],[6,434],[30,336],[38,325],[62,318],[72,305],[97,213],[105,169],[108,96],[92,9],[96,1],[102,0],[110,7],[119,65],[139,106],[192,244],[266,595],[253,609],[251,618]]},
    {"id":"mc-1929","plaats":"Monaco","land":"Monaco","datum":"2026-06-07","status":"","lengte":3337,"breed":760,"hoog":1000,"pts":[[498,193],[511,152],[624,0],[653,7],[661,45],[699,102],[711,88],[677,47],[678,23],[738,1],[760,4],[760,84],[738,199],[681,298],[646,336],[596,366],[470,421],[356,444],[341,468],[309,463],[86,494],[62,538],[49,594],[50,643],[84,682],[105,798],[84,819],[84,837],[111,901],[144,942],[182,960],[188,985],[132,1000],[104,994],[45,877],[15,770],[0,648],[19,481],[47,468],[305,418],[401,377],[507,355],[542,327],[555,282],[538,236]]},
    {"id":"es-1991","plaats":"Barcelona","land":"Spanje","datum":"2026-06-14","status":"","lengte":4655,"breed":820,"hoog":1000,"pts":[[648,447],[335,942],[317,957],[292,956],[256,936],[233,933],[211,941],[149,987],[99,1000],[51,987],[16,951],[0,890],[17,811],[139,612],[171,597],[200,606],[227,640],[231,673],[211,732],[134,852],[131,867],[141,887],[170,893],[291,839],[351,788],[397,716],[402,686],[338,623],[276,476],[274,449],[284,417],[310,389],[680,200],[703,179],[701,161],[682,141],[634,130],[595,142],[541,178],[514,177],[493,163],[482,143],[489,101],[595,12],[644,0],[667,7],[788,84],[816,116],[820,172]]},
    {"id":"at-1969","plaats":"Spielberg","land":"Oostenrijk","datum":"2026-06-28","status":"","lengte":4318,"breed":1000,"hoog":627,"pts":[[668,562],[416,627],[272,418],[149,180],[0,20],[0,12],[20,6],[153,0],[467,50],[617,57],[636,69],[634,97],[608,132],[586,152],[533,174],[469,177],[341,157],[310,164],[287,183],[276,225],[282,250],[344,357],[371,379],[408,382],[427,374],[489,312],[555,288],[906,280],[922,280],[951,295],[969,325],[1000,429],[996,451],[924,491]]},
    {"id":"gb-1948","plaats":"Silverstone","land":"Verenigd Koninkrijk","datum":"2026-07-05","status":"","lengte":5891,"breed":605,"hoog":1000,"pts":[[360,8],[490,0],[515,11],[534,40],[562,160],[570,301],[595,355],[593,378],[574,426],[573,446],[576,460],[605,509],[602,536],[591,549],[531,590],[361,901],[304,985],[283,1000],[247,999],[227,987],[192,922],[94,809],[84,805],[60,824],[42,824],[17,796],[0,746],[13,719],[175,511],[192,497],[215,494],[297,503],[327,497],[424,424],[443,416],[456,427],[475,484],[488,489],[500,479],[517,429],[517,381],[237,126],[207,115],[180,122],[172,137],[164,191],[147,203],[124,202],[106,181],[107,163],[149,79],[199,33],[230,21]]},
    {"id":"be-1925","plaats":"Spa-Francorchamps","land":"België","datum":"2026-07-19","status":"","lengte":7004,"breed":619,"hoog":1000,"pts":[[186,106],[131,10],[133,2],[138,0],[206,32],[269,78],[369,195],[412,226],[423,247],[432,291],[505,409],[517,436],[619,788],[619,803],[597,823],[591,835],[602,888],[594,911],[471,997],[456,1000],[442,993],[435,973],[442,959],[499,923],[509,905],[480,811],[456,681],[440,659],[423,650],[383,647],[350,655],[331,671],[317,694],[263,829],[250,846],[224,854],[189,838],[161,840],[144,859],[96,933],[79,942],[64,938],[14,901],[1,881],[0,853],[14,815],[37,779],[104,714],[199,665],[231,640],[258,599],[290,528],[290,493],[251,390],[239,325],[236,255],[242,251],[262,251],[266,244]]},
    {"id":"hu-1986","plaats":"Boedapest","land":"Hongarije","datum":"2026-07-26","status":"","lengte":4381,"breed":889,"hoog":1000,"pts":[[222,753],[7,583],[0,569],[4,554],[24,545],[76,546],[149,567],[317,693],[336,701],[362,695],[378,678],[382,654],[338,572],[333,550],[338,532],[461,285],[517,203],[481,58],[488,20],[513,1],[534,0],[559,8],[610,45],[698,138],[702,157],[685,177],[723,308],[739,319],[816,334],[834,352],[839,377],[824,507],[889,624],[887,658],[878,674],[674,900],[656,897],[597,831],[546,789],[522,781],[504,786],[491,807],[495,833],[597,919],[605,936],[597,978],[579,993],[554,1000],[517,986]]},
    {"id":"nl-1948","plaats":"Zandvoort","land":"Nederland","datum":"2026-08-23","status":"","lengte":4259,"breed":1000,"hoog":846,"pts":[[120,386],[275,17],[298,0],[325,1],[347,20],[352,48],[292,203],[286,300],[260,324],[176,362],[177,404],[200,418],[219,418],[314,388],[397,378],[557,404],[610,391],[740,326],[932,336],[972,361],[993,393],[1000,434],[992,475],[911,595],[869,684],[825,694],[773,688],[714,663],[683,642],[661,608],[675,578],[692,567],[800,541],[857,513],[866,477],[843,441],[747,426],[581,437],[414,487],[314,536],[304,534],[285,502],[253,493],[236,501],[222,527],[265,778],[262,809],[248,830],[214,845],[125,846],[80,835],[36,807],[8,766],[0,684]]},
    {"id":"it-1922","plaats":"Monza","land":"Italië","datum":"2026-09-06","status":"","lengte":5793,"breed":583,"hoog":1000,"pts":[[19,635],[43,355],[46,349],[60,349],[64,343],[50,283],[55,201],[71,152],[107,111],[147,88],[178,78],[383,61],[395,42],[541,0],[561,9],[571,25],[583,138],[577,154],[416,245],[187,447],[186,489],[179,502],[159,521],[155,534],[108,970],[94,992],[72,1000],[43,992],[19,968],[4,930],[0,810]]},
    {"id":"es-2026","plaats":"Madrid","land":"Spanje","datum":"2026-09-13","status":"","lengte":5474,"breed":626,"hoog":1000,"pts":[[396,945],[293,963],[286,967],[282,994],[246,1000],[208,990],[193,976],[70,783],[49,739],[37,694],[33,658],[38,602],[62,552],[52,539],[59,521],[58,507],[44,465],[28,441],[13,387],[0,358],[23,335],[19,314],[1,274],[2,192],[40,157],[47,145],[44,120],[24,71],[22,54],[23,38],[41,10],[58,2],[95,0],[131,25],[142,44],[144,84],[137,105],[119,134],[63,204],[33,254],[35,264],[87,303],[111,329],[116,414],[132,442],[142,454],[173,467],[248,467],[281,452],[344,553],[368,563],[434,557],[455,565],[476,592],[506,753],[515,754],[536,743],[589,736],[593,741],[625,880],[626,896],[617,906]]},
    {"id":"az-2016","plaats":"Bakoe","land":"Azerbeidzjan","datum":"2026-09-26","status":"","lengte":6003,"breed":1000,"hoog":730,"pts":[[920,186],[993,155],[1000,143],[938,3],[930,0],[774,61],[548,164],[546,174],[583,271],[507,304],[453,337],[445,347],[449,377],[304,488],[298,488],[293,482],[264,399],[216,389],[209,367],[204,360],[197,361],[84,409],[41,434],[31,442],[25,454],[0,539],[7,658],[141,726],[161,730],[210,642],[291,569],[307,496],[313,488],[439,392]]},
    {"id":"sg-2008","plaats":"Singapore","land":"Singapore","datum":"2026-10-11","status":"","lengte":4928,"breed":1000,"hoog":642,"pts":[[978,245],[1000,415],[959,479],[769,462],[755,451],[747,413],[449,398],[408,390],[277,289],[256,299],[244,338],[181,639],[160,642],[137,607],[75,553],[63,525],[68,494],[46,487],[7,458],[0,427],[132,193],[146,181],[160,178],[188,196],[258,266],[327,150],[339,139],[536,251],[566,262],[850,279],[874,266],[882,242],[873,176],[839,79],[842,24],[849,10],[865,0],[894,27],[924,38],[941,37],[954,46]]},
    {"id":"us-2012","plaats":"Austin","land":"Verenigde Staten","datum":"2026-10-25","status":"","lengte":5514,"breed":1000,"hoog":569,"pts":[[201,465],[291,536],[348,569],[354,558],[324,468],[328,437],[344,414],[435,357],[466,304],[505,284],[511,274],[520,234],[538,211],[562,198],[581,196],[651,224],[677,206],[701,178],[719,170],[740,175],[762,198],[865,176],[974,48],[1000,11],[1000,4],[988,0],[814,52],[646,89],[362,126],[359,133],[407,196],[423,221],[423,230],[413,237],[378,236],[370,229],[355,197],[333,176],[302,174],[300,184],[351,273],[352,288],[336,328],[293,349],[260,349],[222,331],[158,243],[145,237],[10,292],[0,304],[7,313]]},
    {"id":"mx-1962","plaats":"Mexico-Stad","land":"Mexico","datum":"2026-11-01","status":"","lengte":4304,"breed":1000,"hoog":717,"pts":[[182,14],[637,71],[970,123],[976,135],[970,184],[1000,206],[990,264],[970,310],[886,453],[778,621],[778,633],[814,658],[813,667],[751,714],[741,717],[726,709],[750,490],[690,441],[677,410],[662,392],[642,381],[539,364],[529,355],[505,299],[401,245],[136,203],[121,85],[107,80],[87,102],[75,104],[6,87],[0,80],[2,64],[26,22],[54,4],[83,0]]},
    {"id":"br-1940","plaats":"São Paulo","land":"Brazilië","datum":"2026-11-08","status":"","lengte":4309,"breed":639,"hoog":1000,"pts":[[62,719],[125,959],[151,998],[182,1000],[238,954],[340,989],[389,984],[425,967],[457,939],[483,892],[639,304],[635,286],[618,269],[533,250],[482,251],[441,270],[399,316],[226,552],[194,572],[130,567],[101,553],[80,525],[59,396],[73,375],[102,378],[133,400],[161,404],[183,390],[194,360],[179,326],[114,255],[96,178],[106,153],[131,154],[217,243],[259,254],[289,251],[334,226],[436,64],[431,43],[408,29],[328,0],[293,1],[226,14],[166,38],[117,66],[74,114],[38,235],[0,431],[5,482]]},
    {"id":"us-2023","plaats":"Las Vegas","land":"Verenigde Staten","datum":"2026-11-21","status":"","lengte":6201,"breed":605,"hoog":1000,"pts":[[554,889],[593,843],[594,835],[585,822],[564,816],[545,820],[499,855],[474,858],[443,842],[424,809],[421,370],[429,360],[548,361],[562,358],[584,337],[601,307],[605,279],[604,271],[581,263],[576,247],[597,203],[595,192],[585,185],[565,183],[421,179],[367,172],[349,163],[330,143],[288,50],[271,33],[237,15],[179,0],[170,4],[54,232],[26,327],[11,420],[0,964],[23,972],[53,996],[72,1000],[385,1000],[455,988],[472,979]]},
    {"id":"qa-2004","plaats":"Lusail","land":"Qatar","datum":"2026-11-29","status":"","lengte":5380,"breed":852,"hoog":1000,"pts":[[148,606],[1,339],[0,311],[14,291],[41,282],[55,284],[160,348],[199,347],[218,323],[218,219],[228,185],[394,5],[419,0],[441,9],[486,51],[493,73],[483,103],[386,210],[381,226],[388,239],[412,243],[602,170],[628,177],[642,197],[644,219],[628,245],[600,272],[578,307],[548,388],[530,399],[433,422],[418,433],[414,466],[471,519],[529,546],[588,554],[764,535],[805,554],[850,631],[852,652],[844,675],[785,765],[752,772],[585,738],[561,742],[544,757],[428,982],[408,999],[381,1000],[359,985]]},
    {"id":"ae-2009","plaats":"Abu Dhabi","land":"Verenigde Arabische Emiraten","datum":"2026-12-06","status":"","lengte":5281,"breed":472,"hoog":1000,"pts":[[231,560],[371,541],[384,533],[388,517],[364,414],[355,396],[276,360],[249,323],[247,300],[267,205],[266,168],[245,13],[229,0],[214,2],[197,41],[0,652],[3,658],[37,656],[41,661],[64,737],[105,795],[261,918],[304,944],[426,1000],[447,998],[463,987],[472,967],[472,949],[462,927],[438,911],[308,898],[239,854],[223,781],[275,770],[287,763],[292,708],[285,697],[253,691],[142,707],[115,702],[106,693],[64,619],[61,595],[66,585]]}
  ];

  var RONDEN = 15;

  /* ---------- tijd: alles in Nederlandse tijd ---------- */
  var DAG = 86400000;
  /* het verschil tussen Nederlandse tijd en UTC op dat moment, in ms (een of twee uur) */
  function verschil(t){
    try {
      var d = new Date(t), f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(d), o = {};
      f.forEach(function(p){ o[p.type] = p.value; });
      return Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour % 24, +o.minute, +o.second) - Math.floor(t / 1000) * 1000;
    } catch (e){ return 3600000; }
  }
  /* datum in Nederland als 'jjjj-mm-dd' */
  function dagVan(t){ return new Date(t + verschil(t)).toISOString().slice(0, 10); }
  /* de week (ma t/m zo) als sleutel 'jjjj-Www', volgens ISO */
  function weekVan(t){
    var d = new Date(t + verschil(t)), dag = (d.getUTCDay() + 6) % 7;
    var don = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dag + 3));
    var jaar = don.getUTCFullYear(), eerste = new Date(Date.UTC(jaar, 0, 4)), nr = 1 + Math.round(((don - eerste) / DAG - 3 + ((eerste.getUTCDay() + 6) % 7)) / 7);
    return jaar + '-W' + (nr < 10 ? '0' : '') + nr;
  }
  /* het moment van de race van de week waarin t valt: zondag 20.00 Nederlandse tijd */
  function raceVanWeek(t){
    var d = new Date(t + verschil(t)), dag = (d.getUTCDay() + 6) % 7;
    var zo = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dag + 6, 20, 0, 0);
    return zo - verschil(zo);
  }
  /* de volgende race na t (de race van deze week, of die van volgende week als hij al geweest is) */
  function volgendeRace(t){ var r = raceVanWeek(t); return r > t ? r : raceVanWeek(t + 7 * DAG); }
  /* de baan van een week: de race die in die week valt, anders een eerdere baan opnieuw */
  function baanVanWeek(t){
    var wk = weekVan(t);
    for (var i = 0; i < BANEN.length; i++){
      var b = BANEN[i];
      if (b.status) continue;
      var rt = Date.parse(b.datum + 'T12:00:00Z');
      if (weekVan(rt) === wk) return { baan: b, nr: i + 1, herhaling: false };
    }
    var nr = parseInt(wk.slice(-2), 10) || 1, b2 = BANEN[(nr * 7) % BANEN.length];
    return { baan: b2, nr: BANEN.indexOf(b2) + 1, herhaling: true };
  }
  function baan(id){ for (var i = 0; i < BANEN.length; i++) if (BANEN[i].id === id) return BANEN[i]; return BANEN[0]; }

  /* ---------- het karakter van een baan ----------
     Uit de lijn: waar zijn de bochten en hoe krap, en dus hoe hard een auto daar kan.
     NP stukjes van gelijke lengte rond de baan, met per stukje:
       v   de snelheid (m/s) die een gemiddelde auto daar haalt: in een bocht beperkt door
           de straal, met optrekken uit en remmen voor de bocht;
       st  hoe recht het daar is (0 bocht, 1 recht stuk op topsnelheid).
     Daarmee telt de motor op de rechte stukken en de aerodynamica in de bochten, en kan
     inhalen alleen op een lang recht stuk. */
  var NP = 240, PROFIEL = {};
  function profiel(b){
    if (PROFIEL[b.id]) return PROFIEL[b.id];
    var P = b.pts, L = [0], i;
    for (i = 0; i < P.length; i++){ var a = P[i], c = P[(i + 1) % P.length]; L.push(L[i] + Math.hypot(c[0] - a[0], c[1] - a[1])); }
    var TOT = L[L.length - 1], m = b.lengte / TOT, ds = b.lengte / NP;
    function op(f){ f = ((f % 1) + 1) % 1; var d = f * TOT, k = 0; while (k < P.length - 1 && L[k + 1] < d) k++; var a = P[k], c = P[(k + 1) % P.length], s = (d - L[k]) / ((L[k + 1] - L[k]) || 1); return [a[0] + (c[0] - a[0]) * s, a[1] + (c[1] - a[1]) * s]; }
    var pt = []; for (i = 0; i < NP; i++) pt.push(op(i / NP));
    var richting = pt.map(function(p, k){ var v = pt[(k + 1) % NP], w = pt[(k - 1 + NP) % NP]; return Math.atan2(v[1] - w[1], v[0] - w[0]); });
    function draai(a){ while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
    var VMAX = 88, ALAT = 38, OPTREK = 9, REM = 32, v = [], krom = [];
    for (i = 0; i < NP; i++){
      /* de bocht over een venster van vijf stukjes: hoeveel draait de baan daar */
      var hoek = Math.abs(draai(richting[(i + 2) % NP] - richting[(i - 2 + NP) % NP])), straal = hoek > 0.001 ? (4 * ds) / hoek : 1e6;
      krom.push(draai(richting[(i + 2) % NP] - richting[(i - 2 + NP) % NP]));
      v.push(Math.min(VMAX, Math.sqrt(ALAT * straal)));
    }
    /* optrekken uit een bocht en remmen ervoor, twee keer rond zodat de start/finish klopt */
    for (var r = 0; r < 2; r++){
      for (i = 0; i < NP; i++){ var j = (i + 1) % NP; v[j] = Math.min(v[j], Math.sqrt(v[i] * v[i] + 2 * OPTREK * ds)); }
      for (i = NP - 1; i >= 0; i--){ var j2 = (i + 1) % NP; v[i] = Math.min(v[i], Math.sqrt(v[j2] * v[j2] + 2 * REM * ds)); }
    }
    var vmin = Math.min.apply(null, v), st = v.map(function(x){ return Math.max(0, Math.min(1, (x - 45) / (VMAX - 45))); });
    var tijd = 0; for (i = 0; i < NP; i++) tijd += ds / v[i];
    var recht = st.filter(function(x){ return x > 0.85; }).length / NP;
    /* het langste stuk achter elkaar op (bijna) topsnelheid, in meters */
    var langst = 0, nu = 0; for (i = 0; i < 2 * NP; i++){ if (st[i % NP] > 0.85){ nu++; langst = Math.max(langst, nu); } else nu = 0; }
    langst = Math.min(NP, langst) * ds;
    /* hoe zwaar motor en aerodynamica hier tellen: het deel van de rondetijd op rechte stukken en in bochten */
    var tRecht = 0; for (i = 0; i < NP; i++) tRecht += (ds / v[i]) * st[i];
    var motor = tRecht / tijd;
    var inhalen = langst > 900 ? 'makkelijk' : langst > 550 ? 'gemiddeld' : 'moeilijk';
    PROFIEL[b.id] = { v: v, st: st, krom: krom, ds: ds, rondetijd: tijd, recht: recht, langst: langst, motor: motor, aero: 1 - motor, inhalen: inhalen,
      inhaalKans: Math.max(0.25, Math.min(1.6, langst / 750)), vmin: vmin,
      soort: motor > 0.64 ? 'snel' : motor < 0.5 ? 'bochtig' : 'gemengd' };
    return PROFIEL[b.id];
  }
  /* in welke sector (1, 2 of 3) een plek op de baan ligt */
  function sector(f){ f = ((f % 1) + 1) % 1; return f < 1 / 3 ? 1 : f < 2 / 3 ? 2 : 3; }

  /* ---------- de spelregels ---------- */
  var REGELS = {
    seizoen: 6,                         /* races per seizoen; daarna promotie en degradatie */
    perDivisie: 10,                     /* teams per divisie (20 auto's) */
    promotie: 2,                        /* zoveel gaan er omhoog en omlaag */
    punten: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    dagMax: 300,                        /* munten per dag uit vragen */
    perGoed: [0, 10, 10, 12, 15],       /* munten per goed antwoord, per niveau (1 bb .. 4 vwo) */
    versnel: 10 * 60000,                /* een goed antwoord haalt er tien minuten af */
    startMunten: 200,
    /* munten per auto na de race, naar de plek (1 tot 20); uitgevallen: 10 */
    raceMunten: function(plek){ return plek ? Math.max(20, 120 - (plek - 1) * 5) : 10; },
    /* het hoofdkwartier: hoe hoog onderdelen en coureurs mogen, en hoeveel werkplaatsen */
    maxNiveau: function(hq){ return Math.min(10, 1 + 2 * hq); },
    werkplaatsen: function(hq){ return hq >= 4 ? 3 : hq >= 2 ? 2 : 1; },
    hqMax: 5,
    /* kosten en duur van een upgrade naar niveau n (van n-1 naar n) */
    onderdeel: function(n){ return { munten: 60 * (n - 1), tijd: (n - 1) * 30 * 60000 }; },
    training: function(n){ return { munten: 80 * Math.max(1, n - 3), tijd: 2 * 3600000 }; },
    hq: function(n){ return { munten: 400 * (n - 1), tijd: (n - 1) * 6 * 3600000 }; },
    /* betrouwbaarheid: het deel goed van je laatste 30 antwoorden; zonder antwoorden 0,8 */
    betrouw: function(geschiedenis){ var l = (geschiedenis || '').slice(-30); if (!l.length) return 0.8; var g = 0; for (var i = 0; i < l.length; i++) if (l[i] === '1') g++; return g / l.length; },
    /* kans per auto om uit te vallen: 2% bij alles goed, 18% bij de helft of minder, minder met een betere betrouwbaarheid van de auto */
    uitval: function(betr, niveau){ var f = Math.max(0, Math.min(1, (1 - betr) / 0.5)); return (0.02 + 0.16 * f) * (1 - 0.05 * ((niveau || 1) - 1)); },
    ingenieur: 3                        /* vanaf dit niveau van het hoofdkwartier geeft de ingenieur advies */
  };
  var ONDERDELEN = [
    { id: 'motor', naam: 'Motor', uit: 'sneller op rechte stukken' },
    { id: 'aero', naam: 'Aerodynamica', uit: 'sneller door de bochten' },
    { id: 'accu', naam: 'Batterij', uit: 'laadt sneller, dus langer extra vermogen en overtake mode' },
    { id: 'betrouw', naam: 'Betrouwbaarheid', uit: 'minder kans op motorpech' }
  ];
  var EIGENSCHAPPEN = [
    { id: 'snel', naam: 'Snelheid' }, { id: 'inhalen', naam: 'Inhalen' }, { id: 'constant', naam: 'Constant' }
  ];

  /* ---------- banden: seconden per ronde ten opzichte van hard, slijtage per ronde, ronde waarna hij inzakt ---------- */
  var BAND = {
    Z: { naam: 'zacht', b: -0.9, d: 0.18, c: 7, kleur: '#F26749', vol: 9 },
    M: { naam: 'medium', b: -0.4, d: 0.10, c: 11, kleur: '#EA9836', vol: 13 },
    H: { naam: 'hard', b: 0, d: 0.06, c: 99, kleur: '#FBF6F1', vol: 18 }
  };
  var PIT = 20, PIT_SC = 10;
  /* hoeveel seconden een band na zoveel ronden langzamer is dan een nieuwe harde */
  function bandTijd(band, oud){ var B = BAND[band] || BAND.M; return B.b + B.d * oud + (oud >= B.c ? 1.2 * (oud - B.c + 1) : 0); }
  /* een strategie netjes maken: start, hoogstens twee stops op oplopende ronden, minstens twee soorten */
  function strategie(s){
    s = s || {};
    var start = BAND[s.start] ? s.start : 'M', stops = [];
    (Array.isArray(s.stops) ? s.stops : []).slice(0, 2).forEach(function(p){
      var r = Math.floor(Number(p && p.ronde)) || 0, b = BAND[p && p.band] ? p.band : 'H';
      if (r >= 1 && r < RONDEN && (!stops.length || r > stops[stops.length - 1].ronde)) stops.push({ ronde: r, band: b });
    });
    var soorten = {}; soorten[start] = 1; stops.forEach(function(p){ soorten[p.band] = 1; });
    if (Object.keys(soorten).length < 2){ if (!stops.length) stops.push({ ronde: 7, band: start === 'H' ? 'M' : 'H' }); else stops[stops.length - 1].band = start === 'H' ? 'M' : 'H'; }
    return { start: start, stops: stops, sc: !!s.sc };
  }
  var STANDAARD = [{ start: 'M', stops: [{ ronde: 8, band: 'H' }], sc: false }, { start: 'M', stops: [{ ronde: 7, band: 'H' }], sc: true }];
  /* de verwachte rondetijden van een strategie (zonder auto en verkeer), voor het strategiescherm */
  function rondetijden(s, b){
    s = strategie(s); var uit = [], band = s.start, oud = 0, k = 0, basis = b ? profiel(b).rondetijd : 90;
    for (var r = 1; r <= RONDEN; r++){
      var t = basis + bandTijd(band, oud), stop = s.stops[k];
      if (stop && stop.ronde === r){ t += PIT; band = stop.band; oud = 0; k++; } else oud++;
      uit.push(t);
    }
    return uit;
  }
  function besteEenStop(){
    var best = null;
    ['Z', 'M', 'H'].forEach(function(a){ ['Z', 'M', 'H'].forEach(function(b){ if (a === b) return; for (var r = 3; r <= 12; r++){ var s = { start: a, stops: [{ ronde: r, band: b }] }, t = rondetijden(s).reduce(function(x, y){ return x + y; }, 0); if (!best || t < best.t) best = { s: s, t: t }; } }); });
    return best;
  }

  /* ---------- kleuren en de helm ---------- */
  var KLEUREN = [['#F26749', 'koraal'], ['#204ECF', 'diepblauw'], ['#EA9836', 'oker'], ['#83A5F2', 'lichtblauw'], ['#FBF6F1', 'wit'], ['#14224C', 'nachtblauw'],
    ['#9B6BF2', 'paars'], ['#F27BB0', 'roze'], ['#F2D649', 'geel'], ['#3CC6E8', 'ijsblauw'], ['#A8683A', 'kastanje'], ['#1A1C24', 'zwart']];
  function kleurOk(k){ for (var i = 0; i < KLEUREN.length; i++) if (KLEUREN[i][0] === k) return true; return false; }
  var PATRONEN = [{ id: 'effen', naam: 'Effen', prijs: 0 }, { id: 'midden', naam: 'Middenstreep', prijs: 0 }, { id: 'zij', naam: 'Zijband', prijs: 100 },
    { id: 'pijl', naam: 'Pijl', prijs: 200 }, { id: 'ruiten', naam: 'Finishvlag', prijs: 0, zege: true }];
  var VIZIEREN = [{ id: 'donker', naam: 'Donker', prijs: 0, kleur: '#22306A' }, { id: 'blauw', naam: 'Blauw', prijs: 150, kleur: '#2D5FD6' }, { id: 'goud', naam: 'Goud', prijs: 300, kleur: '#D9A33A' }];
  function helm(h, basis){
    h = h || {};
    return { basis: kleurOk(h.basis) ? h.basis : (basis || '#F26749'), streep: kleurOk(h.streep) ? h.streep : '#FBF6F1', accent: kleurOk(h.accent) ? h.accent : '#204ECF',
      patroon: PATRONEN.some(function(p){ return p.id === h.patroon; }) ? h.patroon : 'midden', vizier: VIZIEREN.some(function(v){ return v.id === h.vizier; }) ? h.vizier : 'donker' };
  }

  /* verzonnen namen voor coureurs en voor de teams die een divisie vullen */
  var VOORNAMEN = ['Noor', 'Sem', 'Lotte', 'Daan', 'Fenna', 'Milan', 'Yara', 'Luuk', 'Sara', 'Finn', 'Isa', 'Jesse', 'Lina', 'Bram', 'Amira', 'Thijs', 'Zoë', 'Mees', 'Nina', 'Ravi', 'Femke', 'Owen', 'Jada', 'Siem'];
  var ACHTERNAMEN = ['Vermeer', 'de Wit', 'Bakker', 'Jansen', 'van Dijk', 'Visser', 'Smit', 'Mulder', 'de Graaf', 'Bos', 'Koster', 'Hendriks', 'Peters', 'Dekker', 'Brouwer', 'van Leeuwen', 'Kramer', 'Prins', 'Vos', 'Meijer'];
  var BOTTEAMS = ['Team Komeet', 'De Snelle Slakken', 'Raket', 'Paars Gevaar', 'Roze Rijders', 'IJsberg', 'Zonnestraal', 'Kastanje', 'Team Bliksem', 'Polderpijl', 'De Dijkdraaiers', 'Windkracht', 'Oranjewind', 'Noorderlicht', 'Tulpturbo', 'De Grachtgangers', 'Molenwiek', 'Kanaalkoers'];
  function naamVoor(zaad){ var h = 0; zaad = String(zaad); for (var i = 0; i < zaad.length; i++) h = (h * 31 + zaad.charCodeAt(i)) >>> 0; return VOORNAMEN[h % VOORNAMEN.length] + ' ' + ACHTERNAMEN[(h >>> 8) % ACHTERNAMEN.length]; }

  g.TEAMBAAS = { BANEN: BANEN, RONDEN: RONDEN, REGELS: REGELS, ONDERDELEN: ONDERDELEN, EIGENSCHAPPEN: EIGENSCHAPPEN, BAND: BAND, PIT: PIT, PIT_SC: PIT_SC,
    bandTijd: bandTijd, strategie: strategie, STANDAARD: STANDAARD, rondetijden: rondetijden, besteEenStop: besteEenStop,
    KLEUREN: KLEUREN, kleurOk: kleurOk, PATRONEN: PATRONEN, VIZIEREN: VIZIEREN, helm: helm, naamVoor: naamVoor, BOTTEAMS: BOTTEAMS,
    profiel: profiel, sector: sector, NP: NP, dagVan: dagVan, weekVan: weekVan, raceVanWeek: raceVanWeek, volgendeRace: volgendeRace, baanVanWeek: baanVanWeek, baan: baan };
})(typeof globalThis !== 'undefined' ? globalThis : this);
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.TEAMBAAS;
