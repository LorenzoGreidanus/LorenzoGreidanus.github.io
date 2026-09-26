/* De gegevens van Verkiezingen en zetels (verkiezingen.html): de begrippen en
   de situaties bij wie mag stemmen. verkiezingen.html maakt er opgaven van;
   bank-spellen.js maakt er vragen van voor de vragenbank.
   BEGRIPPEN: b = het begrip, u = de uitleg, hv = niet op vmbo-bb.
   KIESRECHT: s = de situatie, mag = mag het, u = de uitleg. Alleen voor de
   vragenbank: n = niveau, v = de vraag als die los moet staan, o = drie
   antwoorden met het goede eerst. */
window.VERKIEZINGEN_DATA = {
  BEGRIPPEN: [
    { b:'kiesrecht', u:'het recht om te stemmen (actief) of gekozen te worden (passief)' },
    { b:'kiesdeler', u:'het aantal stemmen dat nodig is voor een zetel' },
    { b:'coalitie', u:'de partijen die samen de regering vormen' },
    { b:'oppositie', u:'de partijen in het parlement die niet in de regering zitten' },
    { b:'kabinet', u:'de ministers en staatssecretarissen samen' },
    { b:'regeerakkoord', u:'de afspraken die de coalitiepartijen maken voor de komende jaren' },
    { b:'evenredige vertegenwoordiging', u:'partijen krijgen zetels naar verhouding van hun stemmen' },
    { b:'districtenstelsel', u:'per gebied wint een kandidaat, zoals in het Verenigd Koninkrijk', hv:true },
    { b:'opkomst', u:'het percentage kiesgerechtigden dat is gaan stemmen' },
    { b:'Tweede Kamer', u:'de 150 gekozen volksvertegenwoordigers die wetten maken en de regering controleren' },
    { b:'Eerste Kamer', u:'de 75 senatoren die wetten alleen goed- of afkeuren, gekozen door de Provinciale Staten' },
    { b:'formatie', u:'de onderhandelingen na de verkiezingen om een kabinet te vormen', hv:true },
    { b:'restzetel', u:'een zetel die overblijft na het delen door de kiesdeler', hv:true },
    { b:'motie', u:'een uitspraak van de Kamer waarmee ze de regering iets vraagt of afkeurt', hv:true },
    { b:'democratie', u:'een staatsvorm waarin het volk kiest wie het land bestuurt' },
    { b:'parlement', u:'de gekozen volksvertegenwoordiging die wetten goedkeurt en de regering controleert' },
    { b:'gemeenteraad', u:'de gekozen vertegenwoordigers van de inwoners van een gemeente' },
    { b:'politieke partij', u:'een groep mensen met dezelfde ideeën over hoe het land bestuurd moet worden' },
    { b:'verkiezingsprogramma', u:'de plannen die een partij voor de verkiezingen op papier zet' },
    { b:'lijsttrekker', u:'de kandidaat die bovenaan de kandidatenlijst van een partij staat' },
    { b:'zetel', u:'een plek in het parlement of de gemeenteraad' },
    { b:'meerderheid', u:'meer dan de helft van de zetels' },
    { b:'stempas', u:'de kaart die je thuis krijgt en meeneemt om te mogen stemmen' },
    { b:'stembiljet', u:'het papier waarop je in het stemhokje je keuze aankruist' },
    { b:'stembureau', u:'de plek waar je op de verkiezingsdag gaat stemmen' },
    { b:'minister-president', u:'de leider van het kabinet, ook wel de premier' },
    { b:'minister', u:'de baas van een ministerie, bijvoorbeeld van Onderwijs of Financiën' },
    { b:'regering', u:'de koning en de ministers samen' },
    { b:'Staten-Generaal', u:'de Eerste en de Tweede Kamer samen', hv:true },
    { b:'volmacht', u:'iemand anders laten stemmen namens jou', hv:true },
    { b:'kiesdrempel', u:'het minimum aan stemmen dat een partij nodig heeft om mee te doen aan de zetelverdeling', hv:true }
  ],
  KIESRECHT: [
    { s:'Sanne is 17 en wil stemmen voor de Tweede Kamer.', mag:false, u:'Je mag stemmen vanaf 18 jaar. Op de dag van de verkiezing moet je 18 zijn.', n:1, o:['nee, want je moet 18 jaar zijn', 'ja, vanaf 16 jaar mag je stemmen', 'ja, als haar ouders het goedvinden'] },
    { s:'Youssef is 18, Nederlander, en woont in Nederland.', mag:true, u:'Nederlander, 18 jaar of ouder: hij mag stemmen voor de Tweede Kamer.', n:1, v:'Youssef is 18, Nederlander, en woont in Nederland. Mag hij stemmen voor de Tweede Kamer?', o:['ja, dat mag', 'nee, want je moet 21 jaar zijn', 'nee, want hij moet zich eerst aanmelden'] },
    { s:'Maria heeft de Spaanse nationaliteit en woont vijf jaar in Utrecht. Ze wil stemmen voor de gemeenteraad.', mag:true, u:'Inwoners uit een EU-land mogen stemmen voor de gemeenteraad. Voor de Tweede Kamer mag dat niet.', n:2, o:['ja, EU-burgers mogen stemmen voor de gemeenteraad', 'nee, want ze heeft geen Nederlands paspoort', 'nee, want ze moet hier tien jaar wonen'] },
    { s:'Maria (Spaanse nationaliteit) wil stemmen voor de Tweede Kamer.', mag:false, u:'Voor de Tweede Kamer moet je de Nederlandse nationaliteit hebben.', n:2, o:['nee, want daarvoor moet je Nederlander zijn', 'ja, want ze woont al vijf jaar in Nederland', 'ja, want Spanje hoort bij de EU'] },
    { s:'Pieter is Nederlander en woont al tien jaar in Australië. Hij wil stemmen voor de Tweede Kamer.', mag:true, u:'Nederlanders in het buitenland mogen per brief stemmen voor de Tweede Kamer (en het Europees Parlement), als ze zich registreren.', n:2, o:['ja, per brief, als hij zich registreert', 'nee, want hij woont niet in Nederland', 'nee, want hij moet eerst terugverhuizen'] },
    { s:'Ahmed komt uit Marokko, woont acht jaar in Nederland zonder Nederlands paspoort, en wil stemmen voor de gemeenteraad.', mag:true, u:'Wie van buiten de EU komt, mag na vijf jaar legaal in Nederland wonen stemmen voor de gemeenteraad.', n:2, o:['ja, want hij woont hier langer dan vijf jaar', 'nee, want hij heeft geen Nederlands paspoort', 'nee, want hij komt niet uit een EU-land'] },
    { s:'Lisa is 18 en zit in de gevangenis.', mag:true, u:'Gevangenen behouden hun kiesrecht; alleen een rechter kan het in zeldzame gevallen afnemen.', n:2, v:'Lisa is 18, Nederlander, en zit in de gevangenis. Mag ze stemmen voor de Tweede Kamer?', o:['ja, gevangenen houden hun kiesrecht', 'nee, gevangenen mogen nooit stemmen', 'nee, pas als haar straf voorbij is'] },
    { s:'Tom is 16 en wil zich verkiesbaar stellen voor de gemeenteraad.', mag:false, u:'Ook om gekozen te worden (passief kiesrecht) moet je 18 zijn.', n:1, o:['nee, ook om gekozen te worden moet je 18 zijn', 'ja, verkiesbaar zijn mag vanaf 16 jaar', 'ja, als hij lid is van een partij'] },
    { s:'Fatima is 18 en heeft een verstandelijke beperking.', mag:true, u:'Iedereen van 18 jaar of ouder met de Nederlandse nationaliteit mag stemmen; een beperking verandert daar niets aan.', n:2, v:'Fatima is 18, Nederlander, en heeft een verstandelijke beperking. Mag ze stemmen?', o:['ja, een beperking verandert daar niets aan', 'nee, want ze heeft een beperking', 'nee, alleen iemand anders mag voor haar stemmen'] },
    { s:'Daan is 18 en Nederlander, maar heeft zijn stempas niet gekregen.', mag:true, u:'Hij mag stemmen; zonder stempas vraagt hij bij de gemeente een vervangende stempas aan.', n:1, v:'Daan is 18 en Nederlander, maar heeft zijn stempas niet gekregen. Mag hij stemmen?', o:['ja, met een vervangende stempas van de gemeente', 'nee, zonder stempas mag je nooit stemmen', 'nee, hij moet wachten tot de volgende verkiezing'] },
    { s:'Noor wordt precies op de verkiezingsdag 18.', mag:true, u:'Je moet op de dag van de stemming 18 zijn; wie die dag jarig is, mag stemmen.', n:1, v:'Noor is Nederlander en wordt precies op de verkiezingsdag 18. Mag ze stemmen?', o:['ja, op de dag van de stemming is ze 18', 'nee, ze moet een dag eerder 18 zijn', 'nee, ze moet een jaar eerder 18 zijn'] },
    { s:'Bram is 19 en Nederlander, maar heeft zich nergens aangemeld om te stemmen.', mag:true, u:'In Nederland hoef je je niet aan te melden: wie mag stemmen, krijgt automatisch een stempas thuisgestuurd.', n:1, v:'Bram is 19 en Nederlander, maar heeft zich nergens aangemeld om te stemmen. Mag hij stemmen?', o:['ja, zijn stempas komt vanzelf', 'nee, hij moet zich eerst aanmelden', 'nee, hij moet eerst lid worden van een partij'] },
    { s:'Emma (20, Nederlands paspoort) woont in Duitsland en wil stemmen voor de gemeenteraad van Enschede.', mag:false, u:'Voor de gemeenteraad moet je in die gemeente wonen. Nederlanders in het buitenland mogen alleen voor de Tweede Kamer en het Europees Parlement stemmen.', n:2, o:['nee, want ze woont niet in die gemeente', 'ja, want ze heeft een Nederlands paspoort', 'ja, als ze per brief stemt'] },
    { s:'Jayden is 18, heeft de Poolse nationaliteit en wil stemmen voor de Provinciale Staten.', mag:false, u:'Voor de Provinciale Staten moet je Nederlander zijn, net als voor de Tweede Kamer.', n:2, o:['nee, want daarvoor moet je Nederlander zijn', 'ja, want Polen hoort bij de EU', 'ja, als hij vijf jaar in Nederland woont'] },
    { s:'Sofia is 18, heeft een Belgisch paspoort, woont in Maastricht en wil hier stemmen voor het Europees Parlement.', mag:true, u:'EU-burgers die in Nederland wonen mogen hier stemmen voor het Europees Parlement, in plaats van in hun eigen land.', n:2, o:['ja, EU-burgers mogen hier stemmen voor het Europees Parlement', 'nee, ze moet in België stemmen', 'nee, want daarvoor moet je Nederlander zijn'] },
    { s:'Mehmet is 40 en heeft de Nederlandse én de Turkse nationaliteit. Hij wil stemmen voor de Tweede Kamer.', mag:true, u:'Wie de Nederlandse nationaliteit heeft, mag stemmen; een tweede nationaliteit verandert daar niets aan.', n:2, o:['ja, want hij heeft de Nederlandse nationaliteit', 'nee, met twee nationaliteiten mag dat niet', 'nee, hij moet eerst de Turkse nationaliteit opgeven'] },
    { s:'Lotte is 18 en ligt op de verkiezingsdag in het ziekenhuis.', mag:true, u:'Ze mag stemmen; ze kan iemand machtigen om namens haar te stemmen (een volmacht).', n:2, v:'Lotte is 18, Nederlander, en ligt op de verkiezingsdag in het ziekenhuis. Mag ze stemmen?', o:['ja, ze kan iemand machtigen om voor haar te stemmen', 'nee, want ze kan niet naar het stembureau', 'nee, zieke mensen mogen niet stemmen'] },
    { s:'Finn is 17 en wil stemmen voor het waterschap.', mag:false, u:'Ook voor het waterschap geldt: je moet 18 jaar zijn.', n:1, o:['nee, want ook daarvoor moet je 18 zijn', 'ja, voor het waterschap mag het vanaf 16', 'ja, als hij in een polder woont'] },
    { s:'Anna (18, Nederlander) woont in Amsterdam en wil stemmen voor de gemeenteraad van Rotterdam, waar ze studeert.', mag:false, u:'Je stemt voor de gemeenteraad van de gemeente waar je ingeschreven staat, niet waar je studeert of werkt.', n:2, o:['nee, je stemt in de gemeente waar je ingeschreven staat', 'ja, want ze studeert in Rotterdam', 'ja, met een kiezerspas'] },
    { s:'Sara is 18 en heeft de Marokkaanse nationaliteit. Ze woont pas twee jaar in Nederland en wil stemmen voor de gemeenteraad.', mag:false, u:'Wie van buiten de EU komt, moet minstens vijf jaar legaal in Nederland wonen om voor de gemeenteraad te mogen stemmen.', n:2, o:['nee, ze moet hier minstens vijf jaar wonen', 'ja, iedereen die hier woont mag dat', 'ja, want ze is 18 jaar'] },
    { s:'Bas is 18 en is op de dag van de Tweede Kamerverkiezingen voor zijn werk in een andere stad.', mag:true, u:'Met een kiezerspas mag hij bij de Tweede Kamerverkiezingen in elke gemeente stemmen; hij kan ook iemand machtigen.', n:2, v:'Bas is 18 en Nederlander. Op de dag van de Tweede Kamerverkiezingen is hij voor zijn werk in een andere stad. Mag hij stemmen?', o:['ja, met een kiezerspas kan dat in elke gemeente', 'nee, alleen in zijn eigen gemeente', 'nee, want hij is die dag niet thuis'] },
    { s:'Eva is 18 en gaat stemmen met alleen haar stempas, zonder identiteitsbewijs.', mag:false, u:'Bij het stemmen moet je een identiteitsbewijs laten zien; het mag hoogstens vijf jaar verlopen zijn.', n:1, o:['nee, ze moet ook een identiteitsbewijs laten zien', 'ja, de stempas is genoeg', 'ja, als iemand haar kent op het stembureau'] },
    { s:'Omar is 18 en Nederlander. Zijn opa vraagt of Omar ook voor hem wil stemmen met een volmacht.', mag:true, u:'Met een volmacht mag je voor iemand anders stemmen, voor hoogstens twee andere kiezers.', n:2, o:['ja, voor hoogstens twee andere kiezers', 'nee, stemmen voor een ander mag nooit', 'nee, dat mogen alleen zijn ouders'] }
  ]
};
