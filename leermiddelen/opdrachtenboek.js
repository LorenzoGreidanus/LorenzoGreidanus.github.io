/* Het opdrachtenboek: de leerroute als een echt boek, met thema's, hoofdstukken
   en paragrafen, voor rekenen, Nederlands en wiskunde.

   Een paragraaf bundelt doelen uit de leerroute (leerroute.js met de inhoud in
   leerroute/<vak>-*.js) en voor Nederlands soms een onderdeel uit de
   vragenbank (bank-ned.js, met een zoekwoord als het onderdeel breder is).
   De opgaven maakt de leerroute elke keer nieuw; dit bestand zegt alleen welke
   doelen bij elkaar horen, en maakt er opgaven van voor twee plekken:
     werkblad-boek.js   Werkblad maken: kies paragrafen, print ze als werkblad
     maken-kiezer.js    de toetseditor: Vragen uit de site, tab Opdrachtenboek

   ---------- de indeling ----------
   BOEK[vak] = [ thema, ... ]
     thema:      { naam, hoofdstukken:[ hoofdstuk, ... ] }
     hoofdstuk:  { naam, verdieping (mag weg), paragrafen:[ paragraaf, ... ] }
     paragraaf:  { id, naam, niveau, doelen:[doel-id, ...], bank:[{ t, zoek }] (mag weg), verdieping (mag weg) }
   Het id van een paragraaf staat in de link van een werkblad (deel=...): verander
   het dus niet als je de paragraaf verplaatst of er doelen bij zet. Het niveau
   is dat van de groepen in de leerroute (rekenen en Nederlands basis/1F/2F/3F;
   wiskunde onderbouw, vmbo, havo A/B, vwo A/B).
   Een nieuw doel in de leerroute komt niet vanzelf in het boek: zet het id bij
   een paragraaf. De controle staat in de scratchpad (boek/bouw.js); die meldt
   ook welke doelen nog nergens staan.

   ---------- de motor ----------
     OPDRACHTENBOEK.vakken                        ['rekenen', 'nederlands', 'wiskunde']
     OPDRACHTENBOEK.boek(vak)                     de thema's
     OPDRACHTENBOEK.paragraaf(vak, id)            { p, thema, hoofdstuk, nummer:'2.3', ti, hi }
     OPDRACHTENBOEK.paragrafen(vak)               alles plat, in boekvolgorde
     OPDRACHTENBOEK.laad(vak)                     belofte: de leerroute (en de vragenbank) staat klaar
     OPDRACHTENBOEK.opgaven(vak, id, n)           n verschillende opgaven: { soort:'lr', op, doel } of { soort:'bank', q }
     OPDRACHTENBOEK.uitleg(vak, id)               html: de uitleg van het doel, of de regels van alle doelen
     OPDRACHTENBOEK.beeld(op, n), eind(op), keuzes(op), vraagHtml(op), kaal(html), schoon(tekst)
     OPDRACHTENBOEK.losseSvg(html)                een figuur als losse svg met eigen kleuren (voor een plaatje)
     OPDRACHTENBOEK.STIJL                         de stijl van de figuren op wit papier */
window.OPDRACHTENBOEK = (function(){
  'use strict';

  /* ---------- de indeling: thema, hoofdstuk, paragraaf ---------- */
  var BOEK = {
    rekenen:[
      { naam:"Getallen", hoofdstukken:[
        { naam:"Getalbegrip", paragrafen:[
          { id:"getal-tellen", naam:"Tellen en getallen tot 1000", niveau:"basis", doelen:["getal-tellen", "getal-terugtellen", "getal-hte", "getal-even", "getal-vergelijken", "getal-lijn", "getal-buren"] },
          { id:"splits-vriendjes", naam:"Splitsen en aanvullen", niveau:"basis", doelen:["splits-vriendjes", "splits-tot10", "splits-tiental", "splits-honderd"] },
          { id:"groot-lezen", naam:"Grote getallen", niveau:"1F", doelen:["groot-lezen", "groot-schrijven", "groot-plaats", "groot-ordenen", "groot-krant"] },
          { id:"getal-afronden", naam:"Afronden", niveau:"basis/1F", doelen:["getal-afronden", "groot-afronden"] }
        ] },
        { naam:"Optellen en aftrekken", paragrafen:[
          { id:"plus20-erbij", naam:"Optellen tot 20", niveau:"basis", doelen:["plus20-erbij", "plus20-grootste", "plus20-dubbel", "plus20-bijna", "plus20-brug", "plus20-kies"] },
          { id:"min20-dubbel", naam:"Aftrekken tot 20", niveau:"basis", doelen:["min20-dubbel", "min20-brug", "min20-aanvullen", "min20-kies"] },
          { id:"plus100-rijgen", naam:"Optellen tot 100", niveau:"basis", doelen:["plus100-rijgen", "plus100-splitsen", "plus100-rijgen-tiental", "plus100-verwisselen", "plus100-dubbel", "plus100-compenseren", "plus100-transformeren", "plus100-kies"] },
          { id:"min100-rijgen", naam:"Aftrekken tot 100", niveau:"basis", doelen:["min100-rijgen", "min100-splitsen", "min100-rijgen-tiental", "min100-aanvullen", "min100-compenseren", "min100-transformeren", "min100-kies"] },
          { id:"plus1000-rijgen", naam:"Optellen en aftrekken tot 1000", niveau:"basis", doelen:["plus1000-rijgen", "plus1000-splitsen", "plus1000-rijgen-min", "plus1000-aanvullen", "plus1000-compenseren", "plus1000-kies"] },
          { id:"cijf-kolomplus", naam:"Optellen en aftrekken onder elkaar", niveau:"1F", doelen:["cijf-kolomplus", "cijf-cijferplus", "cijf-kolommin", "cijf-cijfermin", "cijf-nullen", "cijf-aanvul", "cijf-plusmin-kies"] }
        ] },
        { naam:"Vermenigvuldigen en delen", paragrafen:[
          { id:"keer-herhaald", naam:"Wat keer is", niveau:"basis", doelen:["keer-herhaald", "keer-groepjes", "keer-rooster", "keer-wisselen", "keer-lijn"] },
          { id:"tafel-basis", naam:"De tafels", niveau:"basis", doelen:["tafel-basis", "tafel-x2", "tafel-x4", "tafel-x8", "tafel-x5", "tafel-x9", "tafel-x3", "tafel-x6", "tafel-x7", "tafel-buur", "tafel-kwadraat", "tafel-x11-12", "tafel-kies"] },
          { id:"deel-verdelen", naam:"Delen en delen met rest", niveau:"basis", doelen:["deel-verdelen", "deel-opdelen", "deel-omdraaien", "deel-rest", "deel-halveren", "deel-door5", "deel-door10", "deel-controle"] },
          { id:"keer-x10", naam:"Vermenigvuldigen uit het hoofd", niveau:"1F", doelen:["keer-x10", "keer-nullen", "keer-splitsen", "keer-hokjes", "keer-compenseren", "keer-verdubbel-halveer", "keer-x25", "keer-x50", "keer-kies"] },
          { id:"deel-splitsen", naam:"Delen uit het hoofd", niveau:"1F", doelen:["deel-splitsen", "deel-nullen", "deel-hap", "deel-gelijk", "deel-kies"] },
          { id:"cijf-hokjes", naam:"Vermenigvuldigen onder elkaar", niveau:"1F", doelen:["cijf-hokjes", "cijf-kolomkeer", "cijf-cijfer1", "cijf-cijfer2"] },
          { id:"cijf-hap", naam:"Delen onder elkaar: de staartdeling", niveau:"1F", doelen:["cijf-hap", "cijf-staart", "cijf-rest", "cijf-verhaal"] }
        ] },
        { naam:"Kommagetallen", paragrafen:[
          { id:"komma-plaats", naam:"Kommagetallen begrijpen en vergelijken", niveau:"1F", doelen:["komma-plaats", "komma-lijn", "komma-vergelijk"] },
          { id:"komma-plusmin", naam:"Optellen, aftrekken, keer en gedeeld door 10, 100 en 1000", niveau:"1F", doelen:["komma-plusmin", "komma-keer10", "komma-deel10"] },
          { id:"komma-afronden", naam:"Kommagetallen afronden", niveau:"1F/3F", doelen:["komma-afronden", "macht-decimalen", "macht-zinvol"] },
          { id:"komma-keerheel", naam:"Vermenigvuldigen en delen met kommagetallen", niveau:"2F", doelen:["komma-keerheel", "komma-keerkomma", "komma-keerhalf", "komma-deelheel", "komma-deelkomma", "komma-kies"] }
        ] },
        { naam:"Negatieve getallen", paragrafen:[
          { id:"neg-lijn", naam:"Negatieve getallen op de getallenlijn", niveau:"2F", doelen:["neg-lijn", "neg-ordenen"] },
          { id:"neg-plusmin", naam:"Rekenen met negatieve getallen", niveau:"2F/3F", doelen:["neg-plusmin", "neg-minmin", "neg-verschil", "macht-tekens"] }
        ] },
        { naam:"Volgorde, machten en delers", paragrafen:[
          { id:"volg-haakjes", naam:"Volgorde van bewerkingen", niveau:"2F", doelen:["volg-haakjes", "volg-keerplus", "volg-links", "volg-machten", "volg-stappen", "volg-zethaakjes"] },
          { id:"macht-kwadraat", naam:"Kwadraten, machten en wortels", niveau:"2F", doelen:["macht-kwadraat", "macht-tien", "macht-ander", "macht-wortel", "macht-schatwortel"] },
          { id:"macht-delers-paren", naam:"Delers en veelvouden", niveau:"2F", doelen:["macht-delers-paren", "macht-veelvoud", "macht-deelbaar", "macht-ggd", "macht-kgv"] },
          { id:"macht-wetnot", naam:"Grote en kleine getallen (wetenschappelijke notatie)", niveau:"3F", doelen:["macht-wetnot", "macht-wetterug", "macht-voorvoegsel", "macht-wetreken"] }
        ] },
        { naam:"Slim rekenen: schatten, aanpak, rekenmachine", paragrafen:[
          { id:"schat-afronden", naam:"Schatten", niveau:"1F", doelen:["schat-afronden", "schat-controle", "schat-geld"] },
          { id:"aanpak-plan-stappen", naam:"Een rekenprobleem aanpakken", niveau:"1F", doelen:["aanpak-plan-stappen", "aanpak-plan-overbodig", "aanpak-plan-tekening", "aanpak-plan-terugkijk", "aanpak-plan-meerstaps", "aanpak-plan-eenheid"] },
          { id:"aanpak-machine-schat", naam:"De rekenmachine", niveau:"2F", doelen:["aanpak-machine-schat", "aanpak-machine-volgorde", "aanpak-machine-tussen", "aanpak-machine-afronden", "aanpak-machine-tikfout"] }
        ] }
      ] },
      { naam:"Verhoudingen", hoofdstukken:[
        { naam:"Breuken", paragrafen:[
          { id:"breuk-deel", naam:"Breuken begrijpen", niveau:"basis", doelen:["breuk-deel", "breuk-lijn", "breuk-gelijk"] },
          { id:"breuk-van-strook", naam:"Breuk van een hoeveelheid", niveau:"basis", doelen:["breuk-van-strook", "breuk-van-reken"] },
          { id:"breuk-verg-noemer", naam:"Breuken vergelijken", niveau:"basis", doelen:["breuk-verg-noemer", "breuk-verg-teller", "breuk-verg-half", "breuk-verg-kies"] },
          { id:"breuk-vereenvoudig", naam:"Breuken vereenvoudigen en gelijknamig maken", niveau:"2F", doelen:["breuk-vereenvoudig", "breuk-gelijknamig"] },
          { id:"breuk-gemengd", naam:"Helen en gemengde getallen", niveau:"2F", doelen:["breuk-gemengd"] },
          { id:"breuk-plus-gelijk", naam:"Breuken optellen en aftrekken", niveau:"2F", doelen:["breuk-plus-gelijk", "breuk-plus-ongelijk"] },
          { id:"breuk-keer-heel", naam:"Breuken vermenigvuldigen en delen", niveau:"2F", doelen:["breuk-keer-heel", "breuk-keer-breuk", "breuk-deel-van-deel", "breuk-delen", "breuk-reken-kies"] }
        ] },
        { naam:"Breuk, kommagetal en procent", paragrafen:[
          { id:"breuk-om-rijtjes", naam:"Breuk, kommagetal en procent omzetten", niveau:"1F", doelen:["breuk-om-rijtjes", "breuk-om-delen", "breuk-om-noemer", "breuk-om-procent", "breuk-om-vereenvoudig", "breuk-om-kies"] }
        ] },
        { naam:"Procenten", paragrafen:[
          { id:"proc-helft", naam:"Procenten uit het hoofd", niveau:"1F", doelen:["proc-helft", "proc-kwart", "proc-tien", "proc-een", "proc-vijf", "proc-twintig", "proc-75"] },
          { id:"proc-1methode", naam:"Een percentage van een bedrag", niveau:"2F", doelen:["proc-1methode", "proc-10methode", "proc-strook", "proc-tabel", "proc-breuk", "proc-factor", "proc-kies"] },
          { id:"proc-hoeveel", naam:"Hoeveel procent is het?", niveau:"2F", doelen:["proc-hoeveel", "proc-hoeveel-tabel"] },
          { id:"proc-korting", naam:"Korting en btw", niveau:"2F", doelen:["proc-korting", "proc-korting-direct", "proc-btw-stap", "proc-btw-factor"] },
          { id:"proc-verandering", naam:"Procentuele verandering en terugrekenen", niveau:"3F", doelen:["proc-verandering", "proc-terug-btw", "proc-terug-korting", "proc-procentpunt", "proc-na-elkaar"] },
          { id:"proc-groeifactor", naam:"Groeifactor en rente", niveau:"3F", doelen:["proc-groeifactor", "proc-rente", "proc-samengesteld"] }
        ] },
        { naam:"Verhoudingen", paragrafen:[
          { id:"verh-via1", naam:"De verhoudingstabel", niveau:"1F", doelen:["verh-via1", "verh-dubbel", "verh-tien", "verh-optellen", "verh-tussen", "verh-kies"] },
          { id:"verh-recept", naam:"Recepten, verdelen en mengen", niveau:"2F", doelen:["verh-recept", "verh-verdelen", "verh-mengsel"] },
          { id:"verh-koop-stuk", naam:"Prijs per stuk en per kilo: de beste koop", niveau:"2F/3F", doelen:["verh-koop-stuk", "verh-koop-kilo", "verh-koop-100g", "verh-koop-kies", "snel-prijs"] }
        ] }
      ] },
      { naam:"Meten", hoofdstukken:[
        { naam:"Meetinstrumenten aflezen", paragrafen:[
          { id:"instr-schaal", naam:"Liniaal, maatbeker, weegschaal en thermometer", niveau:"basis", doelen:["instr-schaal", "instr-liniaal", "instr-verschoven", "instr-maatbeker", "instr-weegschaal", "instr-thermometer", "instr-controle"] }
        ] },
        { naam:"Lengte, gewicht en inhoud", paragrafen:[
          { id:"maat-schatten", naam:"Maten kennen en schatten", niveau:"1F", doelen:["maat-schatten"] },
          { id:"maat-lengte", naam:"Maten omrekenen", niveau:"1F", doelen:["maat-lengte", "maat-gewicht", "maat-inhoud", "maat-komma"] },
          { id:"maat-vergelijk", naam:"Maten vergelijken en optellen", niveau:"1F", doelen:["maat-vergelijk", "maat-optellen"] }
        ] },
        { naam:"Tijd", paragrafen:[
          { id:"tijd-heel-half", naam:"Klokkijken", niveau:"basis", doelen:["tijd-heel-half", "tijd-kwart", "tijd-rond-half", "tijd-minuten", "tijd-24-uur"] },
          { id:"tijd-duur", naam:"Rekenen met tijd", niveau:"basis", doelen:["tijd-duur", "tijd-erbij", "tijd-omrekenen", "tijd-kalender"] }
        ] },
        { naam:"Geld", paragrafen:[
          { id:"geld-aanvullen", naam:"Rekenen met geld", niveau:"1F", doelen:["geld-aanvullen", "geld-afronden", "geld-schatten", "geld-keer", "geld-een"] }
        ] },
        { naam:"Omtrek en oppervlakte", paragrafen:[
          { id:"opp-omtrek", naam:"Omtrek en oppervlakte van de rechthoek", niveau:"1F", doelen:["opp-omtrek", "opp-hokjes", "opp-rechthoek", "opp-welke"] },
          { id:"opp-driehoek", naam:"Oppervlakte van de driehoek", niveau:"2F", doelen:["opp-driehoek"] },
          { id:"opp-splitsen", naam:"Samengestelde figuren", niveau:"2F", doelen:["opp-splitsen", "opp-groot-min", "opp-kies"] },
          { id:"opp-cirkel-omtrek", naam:"De cirkel", niveau:"2F", doelen:["opp-cirkel-omtrek", "opp-cirkel"] },
          { id:"opp-eenheden", naam:"Oppervlaktematen omrekenen", niveau:"2F", doelen:["opp-eenheden", "opp-are"] }
        ] },
        { naam:"Inhoud", paragrafen:[
          { id:"inh-balk", naam:"Inhoud van de balk", niveau:"2F", doelen:["inh-balk", "inh-context"] },
          { id:"inh-eenheden", naam:"Inhoudsmaten en liters", niveau:"2F", doelen:["inh-eenheden", "inh-liter"] },
          { id:"snel-cilinder", naam:"Cilinder en prisma", niveau:"3F", doelen:["snel-cilinder", "snel-prisma"] }
        ] },
        { naam:"Snelheid en samengestelde grootheden", paragrafen:[
          { id:"snel-tabel", naam:"Snelheid, afstand en tijd", niveau:"2F", doelen:["snel-tabel", "snel-snelheid", "snel-afstand", "snel-tijd", "snel-minuten", "snel-kies"] },
          { id:"snel-ms", naam:"Van km/u naar m/s en terug", niveau:"3F", doelen:["snel-ms", "snel-kmu"] },
          { id:"snel-dichtheid", naam:"Dichtheid en verbruik", niveau:"3F", doelen:["snel-dichtheid", "snel-1op", "snel-per100"] }
        ] }
      ] },
      { naam:"Meetkunde", hoofdstukken:[
        { naam:"Hoeken", paragrafen:[
          { id:"hoek-soorten", naam:"Hoeken en draaien", niveau:"1F", doelen:["hoek-soorten", "hoek-draaien", "hoek-wind", "hoek-schatten", "hoek-klok"] },
          { id:"hoek-meten", naam:"Hoeken meten", niveau:"1F", doelen:["hoek-meten"] },
          { id:"hoek-gestrekt", naam:"Hoeken berekenen", niveau:"2F", doelen:["hoek-gestrekt", "hoek-rond", "hoek-overstaand", "hoek-driehoek", "hoek-gelijkbenig", "hoek-vierhoek", "hoek-fz", "hoek-combi"] }
        ] },
        { naam:"Vlakke figuren en symmetrie", paragrafen:[
          { id:"mk-vierhoek", naam:"Driehoeken en vierhoeken", niveau:"1F", doelen:["mk-vierhoek", "mk-driehoek", "mk-raadsel"] },
          { id:"mk-symas", naam:"Symmetrie", niveau:"1F", doelen:["mk-symas", "mk-spiegel", "mk-draaisym"] }
        ] },
        { naam:"Verschuiven, draaien en vergroten", paragrafen:[
          { id:"mk-verschuif", naam:"Transformaties op een rooster", niveau:"2F", doelen:["mk-verschuif", "mk-draai", "mk-vergroot"] }
        ] },
        { naam:"Ruimtefiguren en aanzichten", paragrafen:[
          { id:"mk-ruimte-naam", naam:"Ruimtefiguren", niveau:"2F", doelen:["mk-ruimte-naam", "mk-ruimte-tel"] },
          { id:"mk-blokjes", naam:"Bouwsels en aanzichten", niveau:"2F", doelen:["mk-blokjes", "mk-aanzicht", "mk-kijklijn"] },
          { id:"mk-uitslag-tegen", naam:"Uitslagen", niveau:"2F", doelen:["mk-uitslag-tegen", "mk-uitslag-welk", "mk-uitslag-balk"] }
        ] },
        { naam:"Kaart, schaal en coördinaten", paragrafen:[
          { id:"schaal-betekenis", naam:"Schaal en afstand", niveau:"2F", doelen:["schaal-betekenis", "schaal-naar-echt", "schaal-naar-kaart", "schaal-zelf", "schaal-lijn", "schaal-tabel"] },
          { id:"schaal-opp-k2", naam:"Schaal, oppervlakte en inhoud", niveau:"3F", doelen:["schaal-opp-k2", "schaal-inhoud-k3", "schaal-plattegrond", "schaal-opp-kaart", "schaal-opp-kies"] },
          { id:"graf-coord", naam:"Coördinaten", niveau:"2F", doelen:["graf-coord"] }
        ] },
        { naam:"De stelling van Pythagoras", verdieping:true, paragrafen:[
          { id:"mk-pyth-kwadraat", naam:"Pythagoras", niveau:"3F", doelen:["mk-pyth-kwadraat", "mk-pyth-schuin", "mk-pyth-tabel", "mk-pyth-rhz", "mk-pyth-check", "mk-pyth-context", "mk-pyth-kies"] }
        ] }
      ] },
      { naam:"Verbanden", hoofdstukken:[
        { naam:"Tabellen en grafieken", paragrafen:[
          { id:"graf-tabel", naam:"Tabellen en diagrammen aflezen", niveau:"1F", doelen:["graf-tabel", "graf-staaf", "graf-lijn", "graf-beeld", "graf-stijgen"] },
          { id:"graf-graden", naam:"Het cirkeldiagram", niveau:"2F", doelen:["graf-graden", "graf-procent"] },
          { id:"graf-tekenen", naam:"Een grafiek tekenen en kiezen", niveau:"2F", doelen:["graf-tekenen", "graf-kiezen"] }
        ] },
        { naam:"Patronen", paragrafen:[
          { id:"patr-rij-plus", naam:"Patronen in rijen", niveau:"basis", doelen:["patr-rij-plus", "patr-rij-min", "patr-rij-keer", "patr-rij-figuur", "patr-rij-verschil", "patr-rij-gat"] },
          { id:"patr-regel-woorden", naam:"Patronen met een regel", niveau:"1F", doelen:["patr-regel-woorden", "patr-regel-ver", "patr-regel-tabel", "patr-regel-kwadraat", "patr-regel-driehoek"] }
        ] },
        { naam:"Formules", paragrafen:[
          { id:"form-woord", naam:"Formules invullen en maken", niveau:"2F", doelen:["form-woord", "form-letters", "form-tabel", "form-vinden", "form-haakjes"] },
          { id:"form-om-terug", naam:"Formules omdraaien", niveau:"3F", doelen:["form-om-terug", "form-om-max"] }
        ] },
        { naam:"Lineaire verbanden", verdieping:true, paragrafen:[
          { id:"lin-tabel", naam:"Startgetal en hellingsgetal", niveau:"2F", doelen:["lin-tabel", "lin-grafiek", "lin-verhaal", "lin-twee", "lin-evenredig", "lin-check", "lin-snijden"] }
        ] },
        { naam:"Vergelijkingen", paragrafen:[
          { id:"verg-los-balans", naam:"Vergelijkingen oplossen", niveau:"2F", doelen:["verg-los-balans", "verg-los-terug", "verg-los-inklem", "verg-los-twee", "verg-los-controle", "verg-los-kies"] },
          { id:"verg-maak-verhaal", naam:"Vergelijkingen opstellen", niveau:"2F", doelen:["verg-maak-verhaal", "verg-maak-kies", "verg-maak-abo", "verg-maak-terug"] }
        ] },
        { naam:"Rekenen met letters", verdieping:true, paragrafen:[
          { id:"alg-samen", naam:"Haakjes en termen", niveau:"3F", doelen:["alg-samen", "alg-haakjes", "alg-min", "alg-invullen", "alg-buiten", "alg-mix"] }
        ] }
      ] },
      { naam:"Data en kans", hoofdstukken:[
        { naam:"Data verzamelen en ordenen", paragrafen:[
          { id:"data-turven", naam:"Turven, frequentietabel en klassen", niveau:"1F", doelen:["data-turven", "data-freq", "data-klassen", "data-staaf", "data-relatief", "data-vergelijk", "data-enquete"] }
        ] },
        { naam:"Gemiddelde, mediaan en modus", paragrafen:[
          { id:"gem-berekenen", naam:"Het gemiddelde", niveau:"2F", doelen:["gem-berekenen", "gem-frequentie", "gem-terug"] },
          { id:"gem-mediaan", naam:"Mediaan, modus en spreiding", niveau:"2F", doelen:["gem-mediaan", "gem-modus", "gem-spreiding"] }
        ] },
        { naam:"Grafieken kritisch bekijken", paragrafen:[
          { id:"data-info", naam:"Misleidende grafieken en conclusies", niveau:"2F", doelen:["data-info", "data-as", "data-schaal", "data-beeld", "data-procent", "data-conclusie", "data-oorzaak", "data-steekproef"] }
        ] },
        { naam:"Kansen", paragrafen:[
          { id:"kans-lijn", naam:"Kansen begrijpen", niveau:"2F", doelen:["kans-lijn", "kans-breuk", "kans-procent", "kans-niet", "kans-vergelijk", "kans-verwacht"] },
          { id:"kans-rooster", naam:"Kansen berekenen", niveau:"3F", doelen:["kans-rooster", "kans-boom", "kans-kruistabel", "kans-en", "kans-of", "kans-complement", "kans-empirisch", "kans-verwachting", "kans-kies"], verdieping:true }
        ] }
      ] }
    ],
    nederlands:[
      { naam:"Spelling", hoofdstukken:[
        { naam:"Klanken en lettergrepen", paragrafen:[
          { id:"spel-klank-grepen", naam:"Lettergrepen", niveau:"basis", doelen:["spel-klank-grepen"] },
          { id:"spel-klank-kortlang", naam:"Korte en lange klanken", niveau:"basis", doelen:["spel-klank-kortlang"] },
          { id:"spel-klank-open", naam:"Open en gesloten lettergrepen", niveau:"basis", doelen:["spel-klank-open"] }
        ] },
        { naam:"Verdubbelen en verenkelen", paragrafen:[
          { id:"spel-dubbel-verdubbel", naam:"Verdubbelen", niveau:"basis", doelen:["spel-dubbel-verdubbel"] },
          { id:"spel-dubbel-verenkel", naam:"Verenkelen", niveau:"basis", doelen:["spel-dubbel-verenkel"] },
          { id:"spel-dubbel-mix", naam:"Verdubbelen of verenkelen", niveau:"basis", doelen:["spel-dubbel-mix"] }
        ] },
        { naam:"Lastige klanken", paragrafen:[
          { id:"spel-klank2-eij", naam:"Ei of ij", niveau:"basis", doelen:["spel-klank2-eij"] },
          { id:"spel-klank2-auou", naam:"Au of ou", niveau:"basis", doelen:["spel-klank2-auou"] },
          { id:"spel-klank2-gch", naam:"G of ch", niveau:"basis", doelen:["spel-klank2-gch"] },
          { id:"spel-klank2-dt", naam:"-d of -t aan het eind", niveau:"basis", doelen:["spel-klank2-dt"] },
          { id:"spel-klank2-fvsz", naam:"F of v, s of z", niveau:"basis", doelen:["spel-klank2-fvsz"] },
          { id:"spel-klank2-chtgt", naam:"-cht of -gt", niveau:"basis", doelen:["spel-klank2-chtgt"] }
        ] },
        { naam:"Uitgangen", paragrafen:[
          { id:"spel-uit-iglijk", naam:"-ig of -lijk", niveau:"1F", doelen:["spel-uit-iglijk"] },
          { id:"spel-uit-heidisch", naam:"-heid en -isch", niveau:"1F", doelen:["spel-uit-heidisch"] },
          { id:"spel-uit-tiesie", naam:"-tie of -sie", niveau:"1F", doelen:["spel-uit-tiesie"] }
        ] },
        { naam:"Meervoud en verkleinwoord", paragrafen:[
          { id:"spel-uit-meervoud", naam:"Meervoud: -en, -s of 's", niveau:"1F", doelen:["spel-uit-meervoud"], bank:[{t:"meervoud"}] },
          { id:"spel-uit-verklein", naam:"Verkleinwoorden", niveau:"1F", doelen:["spel-uit-verklein"] }
        ] },
        { naam:"Samenstellingen", paragrafen:[
          { id:"spel-samen-aaneen", naam:"Aan elkaar", niveau:"1F", doelen:["spel-samen-aaneen"] },
          { id:"spel-samen-tussens", naam:"De tussen-s", niveau:"1F", doelen:["spel-samen-tussens"] },
          { id:"spel-samen-tussenn", naam:"De tussen-n", niveau:"1F", doelen:["spel-samen-tussenn"] },
          { id:"spel-samen-koppel", naam:"Het koppelteken", niveau:"1F", doelen:["spel-samen-koppel"] }
        ] },
        { naam:"Tekens in woorden", paragrafen:[
          { id:"spel-teken-trema", naam:"Het trema", niveau:"2F", doelen:["spel-teken-trema"] },
          { id:"spel-teken-tremamv", naam:"Het trema in het meervoud", niveau:"2F", doelen:["spel-teken-tremamv"] },
          { id:"spel-teken-apos", naam:"De apostrof", niveau:"2F", doelen:["spel-teken-apos"] },
          { id:"spel-teken-afk", naam:"Afkortingen", niveau:"2F", doelen:["spel-teken-afk"] }
        ] },
        { naam:"Leenwoorden", paragrafen:[
          { id:"spel-leen-c", naam:"De c: als k of als s", niveau:"2F", doelen:["spel-leen-c"] },
          { id:"spel-leen-istisch", naam:"-isch en -istisch", niveau:"2F", doelen:["spel-leen-istisch"] },
          { id:"spel-leen-eng", naam:"Engelse woorden in het meervoud", niveau:"2F", doelen:["spel-leen-eng"] },
          { id:"spel-leen-frans", naam:"Franse woorden", niveau:"2F", doelen:["spel-leen-frans"] },
          { id:"spel-leen-y", naam:"Y of ij", niveau:"2F", doelen:["spel-leen-y"] }
        ] },
        { naam:"Lastige gevallen", paragrafen:[
          { id:"spel-moei-eraf", naam:"Eraf of er af", niveau:"3F", doelen:["spel-moei-eraf"] },
          { id:"spel-moei-tenminste", naam:"Tenminste of ten minste", niveau:"3F", doelen:["spel-moei-tenminste"] },
          { id:"spel-moei-verklleen", naam:"Verkleinwoorden van leenwoorden", niveau:"3F", doelen:["spel-moei-verklleen"] },
          { id:"spel-moei-getal", naam:"Getallen in letters", niveau:"3F", doelen:["spel-moei-getal"] },
          { id:"spel-moei-cijfer", naam:"Cijfers en afkortingen in woorden", niveau:"3F", doelen:["spel-moei-cijfer"] }
        ] }
      ] },
      { naam:"Werkwoordspelling", hoofdstukken:[
        { naam:"Het werkwoord zelf", paragrafen:[
          { id:"ww-hele-werkwoord", naam:"Het hele werkwoord", niveau:"basis", doelen:["ww-hele-werkwoord"] },
          { id:"ww-stam", naam:"De stam", niveau:"basis", doelen:["ww-stam", "ww-stam-klinker", "ww-stam-vz"] },
          { id:"ww-pv-tijd", naam:"De persoonsvorm", niveau:"basis", doelen:["ww-pv-tijd", "ww-pv-vraag"] },
          { id:"ww-onderwerp", naam:"Het onderwerp: wie of wat + pv?", niveau:"basis", doelen:["ww-onderwerp"] }
        ] },
        { naam:"De tegenwoordige tijd", paragrafen:[
          { id:"ww-ott-ik", naam:"Ik + stam", niveau:"1F", doelen:["ww-ott-ik"] },
          { id:"ww-ott-t", naam:"Jij, u, hij: stam + t", niveau:"1F", doelen:["ww-ott-t"] },
          { id:"ww-ott-inversie", naam:"Jij achter de pv: geen t", niveau:"1F", doelen:["ww-ott-inversie"] },
          { id:"ww-ott-u-hij", naam:"U en hij achter de pv: wel een t", niveau:"1F", doelen:["ww-ott-u-hij"] },
          { id:"ww-ott-d", naam:"Stam op -d: hij vindt", niveau:"1F", doelen:["ww-ott-d"] },
          { id:"ww-ott-t-stam", naam:"Stam op -t: hij zet", niveau:"1F", doelen:["ww-ott-t-stam"] },
          { id:"ww-ott-mv", naam:"Meervoud: het hele werkwoord", niveau:"1F", doelen:["ww-ott-mv"] },
          { id:"ww-ott-lopen", naam:"Het trucje: vervang door lopen", niveau:"1F", doelen:["ww-ott-lopen"] },
          { id:"ww-ott-kies", naam:"Kies de goede vorm", niveau:"1F", doelen:["ww-ott-kies"] }
        ] },
        { naam:"De verleden tijd", paragrafen:[
          { id:"ww-ovt-zwak", naam:"Zwak: stam + te of de", niveau:"1F", doelen:["ww-ovt-zwak"] },
          { id:"ww-ovt-kofschip", naam:"'t kofschip", niveau:"1F", doelen:["ww-ovt-kofschip"] },
          { id:"ww-ovt-fokschaap", naam:"'t fokschaap", niveau:"1F", doelen:["ww-ovt-fokschaap"] },
          { id:"ww-ovt-vz", naam:"Verven, reizen: kijk naar het hele werkwoord", niveau:"1F", doelen:["ww-ovt-vz"] },
          { id:"ww-ovt-mv", naam:"Meervoud: -ten of -den", niveau:"1F", doelen:["ww-ovt-mv"] },
          { id:"ww-ovt-sterk", naam:"Sterke werkwoorden", niveau:"1F", doelen:["ww-ovt-sterk"] },
          { id:"ww-ovt-dt", naam:"Antwoordde, praatte: dubbele letter", niveau:"3F", doelen:["ww-ovt-dt"] },
          { id:"ww-ovt-kies", naam:"Kies de goede vorm", niveau:"1F", doelen:["ww-ovt-kies"] }
        ] },
        { naam:"Het voltooid deelwoord", paragrafen:[
          { id:"ww-vd-zwak", naam:"Ge + stam + t of d", niveau:"2F", doelen:["ww-vd-zwak"] },
          { id:"ww-vd-sterk", naam:"Sterke werkwoorden: gelopen", niveau:"2F", doelen:["ww-vd-sterk"] },
          { id:"ww-vd-ge", naam:"Zonder ge-: be-, ge-, her-, ont-, ver-", niveau:"2F", doelen:["ww-vd-ge"] },
          { id:"ww-vd-verleng", naam:"Het trucje: maak het langer", niveau:"2F", doelen:["ww-vd-verleng"] },
          { id:"ww-vd-engels", naam:"Engelse werkwoorden: gecrasht, geüpdatet", niveau:"2F", doelen:["ww-vd-engels"] },
          { id:"ww-vd-pv", naam:"Verhuist of verhuisd?", niveau:"2F", doelen:["ww-vd-pv"] },
          { id:"ww-vd-kies", naam:"Kies de goede vorm", niveau:"2F", doelen:["ww-vd-kies"] }
        ] },
        { naam:"Bijzondere vormen", paragrafen:[
          { id:"ww-bijv-vd", naam:"De geplande reis: -de of -te", niveau:"2F", doelen:["ww-bijv-vd"] },
          { id:"ww-gebiedend", naam:"De gebiedende wijs: Word lid!", niveau:"2F", doelen:["ww-gebiedend"] },
          { id:"ww-tijden", naam:"De tijden herkennen", niveau:"2F", doelen:["ww-tijden"] },
          { id:"ww-toekomend", naam:"De toekomende tijd: zal en zullen", niveau:"2F", doelen:["ww-toekomend"] },
          { id:"ww-jouw", naam:"Je zus, jouw broer: geen jij", niveau:"2F", doelen:["ww-jouw"] }
        ] },
        { naam:"Lastige werkwoorden", paragrafen:[
          { id:"ww-eng-tijden", naam:"Engelse werkwoorden in alle tijden", niveau:"3F", doelen:["ww-eng-tijden"] },
          { id:"ww-scheidbaar", naam:"Opbellen: hij belt op, opgebeld", niveau:"3F", doelen:["ww-scheidbaar"] },
          { id:"ww-vast", naam:"Voetballen: hij voetbalt, gevoetbald", niveau:"3F", doelen:["ww-vast"] },
          { id:"ww-hebben", naam:"Hebben, zijn en \"hun hebben\"", niveau:"3F", doelen:["ww-hebben"] },
          { id:"ww-kunnen", naam:"Kunnen, zullen, willen, mogen", niveau:"3F", doelen:["ww-kunnen"] },
          { id:"ww-lastig-onderwerp", naam:"Een lastig onderwerp", niveau:"3F", doelen:["ww-lastig-onderwerp"] }
        ] }
      ] },
      { naam:"Grammatica", hoofdstukken:[
        { naam:"Woordsoorten: de basis", paragrafen:[
          { id:"ws-zn", naam:"Zelfstandig naamwoord", niveau:"basis", doelen:["ws-zn"] },
          { id:"ws-lw", naam:"Lidwoord", niveau:"basis", doelen:["ws-lw"] },
          { id:"ws-bn", naam:"Bijvoeglijk naamwoord", niveau:"basis", doelen:["ws-bn"] },
          { id:"ws-ww", naam:"Werkwoord", niveau:"basis", doelen:["ws-ww"] },
          { id:"ws-tw", naam:"Telwoord", niveau:"basis", doelen:["ws-tw"] },
          { id:"ws-vz", naam:"Voorzetsel", niveau:"basis", doelen:["ws-vz"] },
          { id:"ws-mix", naam:"Welke woordsoort is het?", niveau:"basis", doelen:["ws-mix"], bank:[{t:"woordsoorten"}] }
        ] },
        { naam:"Voornaamwoorden", paragrafen:[
          { id:"ws-pers", naam:"Persoonlijk voornaamwoord", niveau:"1F", doelen:["ws-pers"] },
          { id:"ws-hunhen", naam:"Hun of hen", niveau:"1F", doelen:["ws-hunhen"] },
          { id:"ws-bez", naam:"Bezittelijk voornaamwoord", niveau:"1F", doelen:["ws-bez"] },
          { id:"ws-aanw", naam:"Aanwijzend voornaamwoord", niveau:"1F", doelen:["ws-aanw"] },
          { id:"ws-betr", naam:"Betrekkelijk voornaamwoord: die, dat of wat", niveau:"1F", doelen:["ws-betr"] },
          { id:"ws-vrag", naam:"Vragend voornaamwoord", niveau:"1F", doelen:["ws-vrag"] }
        ] },
        { naam:"Bijwoord en voegwoord", paragrafen:[
          { id:"ws-bw", naam:"Bijwoord", niveau:"1F", doelen:["ws-bw"] },
          { id:"ws-vw", naam:"Voegwoord", niveau:"1F", doelen:["ws-vw"] }
        ] },
        { naam:"Persoonsvorm en onderwerp", paragrafen:[
          { id:"zd-pv-tijd", naam:"Persoonsvorm: verander de tijd", niveau:"basis", doelen:["zd-pv-tijd"], bank:[{t:"zinsontleding",zoek:"persoonsvorm"}] },
          { id:"zd-pv-vraag", naam:"Persoonsvorm: maak er een vraag van", niveau:"basis", doelen:["zd-pv-vraag"] },
          { id:"zd-pv-getal", naam:"Persoonsvorm: verander het onderwerp", niveau:"basis", doelen:["zd-pv-getal"] },
          { id:"zd-ow-wiewat", naam:"Onderwerp: wie of wat + gezegde?", niveau:"basis", doelen:["zd-ow-wiewat"], bank:[{t:"zinsontleding",zoek:"onderwerp in"}] },
          { id:"zd-ow-getal", naam:"Onderwerp: het verandert mee", niveau:"basis", doelen:["zd-ow-getal"] },
          { id:"zd-verplaats", naam:"Zinsdelen: de verplaatsproef", niveau:"basis", doelen:["zd-verplaats"] }
        ] },
        { naam:"Het gezegde", paragrafen:[
          { id:"zd-wwg", naam:"Het werkwoordelijk gezegde", niveau:"1F", doelen:["zd-wwg"], bank:[{t:"zinsontleding",zoek:"werkwoordelijk gezegde|het gezegde"}] },
          { id:"zd-hww", naam:"Hulpwerkwoorden herkennen", niveau:"1F", doelen:["zd-hww"] },
          { id:"zd-koppel", naam:"Koppelwerkwoord: de zijn-proef", niveau:"1F", doelen:["zd-koppel"] },
          { id:"zd-ng", naam:"Het naamwoordelijk gezegde", niveau:"1F", doelen:["zd-ng"], bank:[{t:"zinsontleding",zoek:"naamwoordelijk"}] },
          { id:"zd-wofn", naam:"Werkwoordelijk of naamwoordelijk?", niveau:"1F", doelen:["zd-wofn"] }
        ] },
        { naam:"Voorwerpen en bepalingen", paragrafen:[
          { id:"zd-lv", naam:"Het lijdend voorwerp", niveau:"1F", doelen:["zd-lv"], bank:[{t:"zinsontleding",zoek:"lijdend voorwerp"}] },
          { id:"zd-mv-vraag", naam:"Het meewerkend voorwerp", niveau:"1F", doelen:["zd-mv-vraag", "zd-mv-proef"], bank:[{t:"zinsontleding",zoek:"meewerkend voorwerp"}] },
          { id:"zd-bwb", naam:"De bijwoordelijke bepaling", niveau:"1F", doelen:["zd-bwb"], bank:[{t:"zinsontleding",zoek:"bijwoordelijke bepaling"}] },
          { id:"zd-bvb", naam:"De bijvoeglijke bepaling", niveau:"1F", doelen:["zd-bvb"] },
          { id:"gram-vzv", naam:"Het voorzetselvoorwerp", niveau:"3F", doelen:["gram-vzv"], bank:[{t:"zinsontleding",zoek:"voorzetselvoorwerp"}] },
          { id:"gram-lvnd", naam:"Lijdend voorwerp of naamwoordelijk deel", niveau:"3F", doelen:["gram-lvnd"] },
          { id:"zd-ontleed", naam:"Een hele zin ontleden", niveau:"1F", doelen:["zd-ontleed"] }
        ] },
        { naam:"Samengestelde zinnen", paragrafen:[
          { id:"gram-hzbz", naam:"Hoofdzin en bijzin", niveau:"2F", doelen:["gram-hzbz"] },
          { id:"gram-nevon", naam:"Nevenschikking en onderschikking", niveau:"2F", doelen:["gram-nevon"] },
          { id:"gram-enkel", naam:"Enkelvoudig of samengesteld", niveau:"2F", doelen:["gram-enkel"] }
        ] },
        { naam:"Zinnen omzetten", paragrafen:[
          { id:"gram-actpas", naam:"Actief of passief: de door-proef", niveau:"2F", doelen:["gram-actpas"] },
          { id:"gram-pas", naam:"Actief omzetten naar passief", niveau:"2F", doelen:["gram-pas"] },
          { id:"gram-rede", naam:"Directe rede wordt indirecte rede", niveau:"2F", doelen:["gram-rede"] }
        ] }
      ] },
      { naam:"Leestekens en hoofdletters", hoofdstukken:[
        { naam:"Hoofdletters", paragrafen:[
          { id:"hoofd-begin", naam:"Het begin van een zin", niveau:"1F", doelen:["hoofd-begin"] },
          { id:"hoofd-namen", naam:"Namen van personen en plaatsen", niveau:"1F", doelen:["hoofd-namen"] },
          { id:"hoofd-taal", naam:"Talen en woorden van landen", niveau:"1F", doelen:["hoofd-taal"] },
          { id:"hoofd-tijd", naam:"Dagen, maanden en feesten", niveau:"1F", doelen:["hoofd-tijd"] },
          { id:"hoofd-merk", naam:"Merken en titels", niveau:"1F", doelen:["hoofd-merk"] },
          { id:"hoofd-mix", naam:"Hoofdletter of niet: alles door elkaar", niveau:"1F", doelen:["hoofd-mix"] }
        ] },
        { naam:"Leestekens aan het eind", paragrafen:[
          { id:"teken-eind-soort", naam:"Vier soorten zinnen", niveau:"basis", doelen:["teken-eind-soort"] },
          { id:"teken-eind-punt", naam:"De punt", niveau:"basis", doelen:["teken-eind-punt"] },
          { id:"teken-eind-vraag", naam:"Het vraagteken", niveau:"basis", doelen:["teken-eind-vraag"] },
          { id:"teken-eind-uitroep", naam:"Het uitroepteken", niveau:"basis", doelen:["teken-eind-uitroep"] }
        ] },
        { naam:"De komma", paragrafen:[
          { id:"teken-komma-opsomming", naam:"Bij een opsomming", niveau:"1F", doelen:["teken-komma-opsomming"] },
          { id:"teken-komma-aanspreking", naam:"Bij een aanspreking", niveau:"1F", doelen:["teken-komma-aanspreking"] },
          { id:"teken-komma-maar", naam:"Voor maar en want", niveau:"1F", doelen:["teken-komma-maar"] },
          { id:"teken-komma-pv", naam:"Tussen twee persoonsvormen", niveau:"1F/2F", doelen:["teken-komma-pv", "gram-komma"] },
          { id:"teken-komma-bijzin", naam:"Na een bijzin vooraan", niveau:"1F", doelen:["teken-komma-bijzin"] },
          { id:"teken-komma-bijstelling", naam:"Bij een bijstelling", niveau:"1F", doelen:["teken-komma-bijstelling"] },
          { id:"teken-komma-geen", naam:"Waar de komma niet mag", niveau:"1F", doelen:["teken-komma-geen"], bank:[{t:"leestekens",zoek:"komma"}] }
        ] },
        { naam:"Directe rede", paragrafen:[
          { id:"teken-rede-aanhaling", naam:"Aanhalingstekens", niveau:"1F", doelen:["teken-rede-aanhaling"] },
          { id:"teken-rede-dubbelepunt", naam:"De dubbele punt ervoor", niveau:"1F", doelen:["teken-rede-dubbelepunt"] },
          { id:"teken-rede-hoofdletter", naam:"De hoofdletter in het citaat", niveau:"1F", doelen:["teken-rede-hoofdletter"] },
          { id:"teken-rede-erna", naam:"Het citaat vooraan", niveau:"1F", doelen:["teken-rede-erna"] },
          { id:"teken-rede-indirect", naam:"Van directe naar indirecte rede", niveau:"1F", doelen:["teken-rede-indirect"] }
        ] },
        { naam:"Andere leestekens", paragrafen:[
          { id:"teken-ander-dubbelepunt", naam:"De dubbele punt", niveau:"2F", doelen:["teken-ander-dubbelepunt"] },
          { id:"teken-ander-puntkomma", naam:"De puntkomma", niveau:"2F", doelen:["teken-ander-puntkomma"] },
          { id:"teken-ander-haakjes", naam:"Haakjes", niveau:"2F", doelen:["teken-ander-haakjes"] },
          { id:"teken-ander-weglating", naam:"Het weglatingsteken", niveau:"2F", doelen:["teken-ander-weglating"] },
          { id:"teken-ander-kies", naam:"Kies het goede leesteken", niveau:"2F", doelen:["teken-ander-kies"], bank:[{t:"leestekens",zoek:"^(?!.*komma)"}] }
        ] }
      ] },
      { naam:"Woordenschat en taal", hoofdstukken:[
        { naam:"Woorden begrijpen", paragrafen:[
          { id:"woord-context", naam:"Betekenis uit de zin", niveau:"1F", doelen:["woord-context"], bank:[{t:"betekenis"}] },
          { id:"woord-delen", naam:"Betekenis uit woorddelen", niveau:"1F", doelen:["woord-delen"] },
          { id:"woord-meer", naam:"Woorden met meer betekenissen", niveau:"1F", doelen:["woord-meer"] },
          { id:"woord-kies", naam:"Kies de handigste manier", niveau:"1F", doelen:["woord-kies"] }
        ] },
        { naam:"Synoniemen en tegenstellingen", paragrafen:[
          { id:"woord-synoniem", naam:"Synoniemen", niveau:"1F", doelen:["woord-synoniem"], bank:[{t:"synoniemen"}] },
          { id:"woord-antoniem", naam:"Tegenstellingen", niveau:"1F", doelen:["woord-antoniem"] }
        ] },
        { naam:"Uitdrukkingen en schooltaal", paragrafen:[
          { id:"woord-uitdrukking", naam:"Uitdrukkingen en spreekwoorden", niveau:"2F", doelen:["woord-uitdrukking"], bank:[{t:"uitdrukkingen"}] },
          { id:"woord-schooltaal", naam:"Opdrachtwoorden", niveau:"2F", doelen:["woord-schooltaal"], bank:[{t:"schooltaal"}] }
        ] },
        { naam:"Woorden bouwen", paragrafen:[
          { id:"taal-bouw-kern", naam:"De kern van een samenstelling", niveau:"2F", doelen:["taal-bouw-kern"] },
          { id:"taal-bouw-familie", naam:"Woordfamilies", niveau:"2F", doelen:["taal-bouw-familie"] },
          { id:"taal-bouw-persoon", naam:"Van werkwoord naar persoon", niveau:"2F", doelen:["taal-bouw-persoon"] },
          { id:"taal-bouw-handeling", naam:"Van werkwoord naar ding of geluid", niveau:"2F", doelen:["taal-bouw-handeling"] },
          { id:"taal-bouw-nieuw", naam:"Hoe nieuwe woorden ontstaan", niveau:"2F", doelen:["taal-bouw-nieuw"] }
        ] },
        { naam:"Klank en betekenis", paragrafen:[
          { id:"taal-klank-nabootsing", naam:"Woorden die klinken als het geluid", niveau:"1F", doelen:["taal-klank-nabootsing"] },
          { id:"taal-klank-homofoon", naam:"Hetzelfde klinken, anders schrijven", niveau:"1F", doelen:["taal-klank-homofoon"] },
          { id:"taal-klank-intonatie", naam:"Vraag, mededeling of verbazing", niveau:"1F", doelen:["taal-klank-intonatie"] },
          { id:"taal-klank-nadruk", naam:"Nadruk verandert wat je bedoelt", niveau:"1F", doelen:["taal-klank-nadruk"] },
          { id:"taal-klank-klemtoon", naam:"Klemtoon verandert de betekenis", niveau:"1F", doelen:["taal-klank-klemtoon"] }
        ] },
        { naam:"Taalvariatie", paragrafen:[
          { id:"taal-var-streek", naam:"Standaardtaal en streektaal", niveau:"2F", doelen:["taal-var-streek"] },
          { id:"taal-var-jongeren", naam:"Jongerentaal en straattaal", niveau:"2F", doelen:["taal-var-jongeren"] },
          { id:"taal-var-vaktaal", naam:"Vaktaal en dagelijkse taal", niveau:"2F", doelen:["taal-var-vaktaal"] },
          { id:"taal-var-leen", naam:"Leenwoorden uit andere talen", niveau:"2F", doelen:["taal-var-leen"] },
          { id:"taal-var-verandering", naam:"Taal verandert", niveau:"2F", doelen:["taal-var-verandering"] }
        ] }
      ] },
      { naam:"Lezen", hoofdstukken:[
        { naam:"De tekst als geheel", paragrafen:[
          { id:"lees-onderwerp", naam:"Het onderwerp", niveau:"1F", doelen:["lees-onderwerp"] },
          { id:"lees-hoofdgedachte", naam:"De hoofdgedachte", niveau:"1F", doelen:["lees-hoofdgedachte"] },
          { id:"lees-strategie", naam:"Leesstrategieën", niveau:"1F", doelen:["lees-strategie"] }
        ] },
        { naam:"Tekstdoelen en tekstsoorten", paragrafen:[
          { id:"lees-doel-informeren", naam:"Tekstdoel: informeren", niveau:"1F", doelen:["lees-doel-informeren"] },
          { id:"lees-doel-overtuigen", naam:"Tekstdoel: overtuigen", niveau:"1F", doelen:["lees-doel-overtuigen"] },
          { id:"lees-doel-amuseren", naam:"Tekstdoel: amuseren", niveau:"1F", doelen:["lees-doel-amuseren"] },
          { id:"lees-doel-instrueren", naam:"Tekstdoel: instrueren", niveau:"1F", doelen:["lees-doel-instrueren"] },
          { id:"lees-doel-activeren", naam:"Tekstdoel: activeren", niveau:"1F", doelen:["lees-doel-activeren"] },
          { id:"lees-doel-mix", naam:"Tekstdoelen door elkaar", niveau:"1F", doelen:["lees-doel-mix"] },
          { id:"lees-soort", naam:"Tekstsoorten", niveau:"1F", doelen:["lees-soort"] }
        ] },
        { naam:"Alinea's", paragrafen:[
          { id:"lees-kernzin", naam:"De kernzin van een alinea", niveau:"1F", doelen:["lees-kernzin"] },
          { id:"lees-functie", naam:"De functie van een alinea", niveau:"1F", doelen:["lees-functie"] },
          { id:"lees-hoofdzaak", naam:"Hoofdzaak en bijzaak", niveau:"1F", doelen:["lees-hoofdzaak"] }
        ] },
        { naam:"Signaalwoorden en verbanden", paragrafen:[
          { id:"lees-signaal-opsomming", naam:"Opsomming", niveau:"1F", doelen:["lees-signaal-opsomming"] },
          { id:"lees-signaal-tegenstelling", naam:"Tegenstelling", niveau:"1F", doelen:["lees-signaal-tegenstelling"] },
          { id:"lees-signaal-oorzaak", naam:"Oorzaak en gevolg", niveau:"1F", doelen:["lees-signaal-oorzaak"] },
          { id:"lees-signaal-reden", naam:"Reden", niveau:"1F", doelen:["lees-signaal-reden"] },
          { id:"lees-signaal-doel", naam:"Doel", niveau:"1F", doelen:["lees-signaal-doel"] },
          { id:"lees-signaal-tijd", naam:"Tijd", niveau:"1F", doelen:["lees-signaal-tijd"] },
          { id:"lees-signaal-voorbeeld", naam:"Voorbeeld", niveau:"1F", doelen:["lees-signaal-voorbeeld"] },
          { id:"lees-signaal-voorwaarde", naam:"Voorwaarde", niveau:"2F", doelen:["lees-signaal-voorwaarde"] },
          { id:"lees-signaal-conclusie", naam:"Conclusie", niveau:"2F", doelen:["lees-signaal-conclusie"] },
          { id:"lees-signaal-vergelijking", naam:"Vergelijking", niveau:"2F", doelen:["lees-signaal-vergelijking"] },
          { id:"lees-signaal-welk", naam:"Welk verband?", niveau:"2F", doelen:["lees-signaal-welk"], bank:[{t:"tekstverbanden"}] },
          { id:"lees-signaal-invullen", naam:"Het goede signaalwoord invullen", niveau:"2F", doelen:["lees-signaal-invullen"] }
        ] },
        { naam:"Verwijswoorden", paragrafen:[
          { id:"lees-verwijs-persoon", naam:"Hij, zij, ze en het", niveau:"1F", doelen:["lees-verwijs-persoon"] },
          { id:"lees-verwijs-aanwijs", naam:"Die, dat, deze, dit en daar", niveau:"1F", doelen:["lees-verwijs-aanwijs"] },
          { id:"lees-verwijs-kies", naam:"Het goede verwijswoord kiezen", niveau:"1F", doelen:["lees-verwijs-kies"], bank:[{t:"verwijswoorden"}] }
        ] },
        { naam:"Tekststructuren", paragrafen:[
          { id:"lees-struct-probleem", naam:"Probleem en oplossing", niveau:"2F", doelen:["lees-struct-probleem"] },
          { id:"lees-struct-oorzaak", naam:"Oorzaak en gevolg", niveau:"2F", doelen:["lees-struct-oorzaak"] },
          { id:"lees-struct-voornadeel", naam:"Voor- en nadelen", niveau:"2F", doelen:["lees-struct-voornadeel"] },
          { id:"lees-struct-verschijnsel", naam:"Verschijnsel en verklaring", niveau:"2F", doelen:["lees-struct-verschijnsel"] },
          { id:"lees-struct-betoog", naam:"Het betoog met weerlegging", niveau:"2F", doelen:["lees-struct-betoog"] },
          { id:"lees-struct-welke", naam:"Welke structuur?", niveau:"2F", doelen:["lees-struct-welke"] }
        ] },
        { naam:"Feit, mening en argument", paragrafen:[
          { id:"lees-feit-mening", naam:"Feit of mening", niveau:"2F", doelen:["lees-feit-mening"] },
          { id:"lees-standpunt", naam:"Standpunt en argument", niveau:"2F", doelen:["lees-standpunt"] },
          { id:"lees-arg-signaal", naam:"Signaalwoorden bij argumenten", niveau:"2F", doelen:["lees-arg-signaal"] },
          { id:"lees-conclusie", naam:"Een conclusie trekken", niveau:"2F", doelen:["lees-conclusie"] }
        ] },
        { naam:"Argumentatie", paragrafen:[
          { id:"lees-arg-soort", naam:"Soorten argumenten", niveau:"3F", doelen:["lees-arg-soort"] },
          { id:"lees-arg-sterkte", naam:"De sterkte van een argument", niveau:"3F", doelen:["lees-arg-sterkte"] }
        ] },
        { naam:"Drogredenen", paragrafen:[
          { id:"lees-drog-persoon", naam:"Op de persoon spelen", niveau:"3F", doelen:["lees-drog-persoon"] },
          { id:"lees-drog-vergelijking", naam:"Verkeerde vergelijking", niveau:"3F", doelen:["lees-drog-vergelijking"] },
          { id:"lees-drog-generalisatie", naam:"Overhaaste generalisatie", niveau:"3F", doelen:["lees-drog-generalisatie"] },
          { id:"lees-drog-cirkel", naam:"Cirkelredenering", niveau:"3F", doelen:["lees-drog-cirkel"] },
          { id:"lees-drog-autoriteit", naam:"Verkeerd beroep op autoriteit", niveau:"3F", doelen:["lees-drog-autoriteit"] },
          { id:"lees-drog-meerderheid", naam:"Beroep op de meerderheid", niveau:"3F", doelen:["lees-drog-meerderheid"] },
          { id:"lees-drog-dilemma", naam:"Vals dilemma", niveau:"3F", doelen:["lees-drog-dilemma"] },
          { id:"lees-drog-bewijslast", naam:"Ontduiken van de bewijslast", niveau:"3F", doelen:["lees-drog-bewijslast"] },
          { id:"lees-drog-oorzaak", naam:"Verkeerd oorzakelijk verband", niveau:"3F", doelen:["lees-drog-oorzaak"] },
          { id:"lees-drog-welke", naam:"Welke drogreden?", niveau:"3F", doelen:["lees-drog-welke"] }
        ] },
        { naam:"Samenvatten", paragrafen:[
          { id:"lees-samen-schrap", naam:"Bijzaken schrappen", niveau:"3F", doelen:["lees-samen-schrap"] },
          { id:"lees-samen-alinea", naam:"Per alinea de kern", niveau:"3F", doelen:["lees-samen-alinea"] },
          { id:"lees-samen-kies", naam:"De beste samenvatting kiezen", niveau:"3F", doelen:["lees-samen-kies"] }
        ] },
        { naam:"Zakelijke genres", paragrafen:[
          { id:"taal-genre-kenmerk", naam:"Kenmerken van een genre", niveau:"3F", doelen:["taal-genre-kenmerk"] },
          { id:"taal-genre-taalgebruik", naam:"Taalgebruik van een genre", niveau:"3F", doelen:["taal-genre-taalgebruik"] },
          { id:"taal-genre-gevoel", naam:"Hoe een tekst gevoel oproept", niveau:"3F", doelen:["taal-genre-gevoel"] },
          { id:"taal-genre-context", naam:"De context van een betoog", niveau:"3F", doelen:["taal-genre-context"] },
          { id:"taal-genre-vorm", naam:"Vorm past bij het doel", niveau:"3F", doelen:["taal-genre-vorm"] }
        ] },
        { naam:"Informatie zoeken", paragrafen:[
          { id:"info-zoekwoord", naam:"Goede zoekwoorden kiezen", niveau:"1F", doelen:["info-zoekwoord"] },
          { id:"info-inhoud", naam:"Zoeken in de inhoudsopgave", niveau:"1F", doelen:["info-inhoud"] },
          { id:"info-register", naam:"Zoeken in het register", niveau:"1F", doelen:["info-register"] },
          { id:"info-waar", naam:"Inhoudsopgave of register?", niveau:"1F", doelen:["info-waar"] },
          { id:"info-scan", naam:"Scannen in een dienstregeling", niveau:"1F", doelen:["info-scan"] },
          { id:"info-tabel", naam:"Informatie uit een tabel halen", niveau:"1F", doelen:["info-tabel"] },
          { id:"info-infographic", naam:"Een infographic lezen", niveau:"1F", doelen:["info-infographic"] },
          { id:"info-instructie", naam:"Een instructie lezen", niveau:"1F", doelen:["info-instructie"] },
          { id:"info-formulier", naam:"Een formulier invullen", niveau:"1F", doelen:["info-formulier"] }
        ] },
        { naam:"Bronnen beoordelen", paragrafen:[
          { id:"bron-maker", naam:"Wie is de maker?", niveau:"1F", doelen:["bron-maker"] },
          { id:"bron-datum", naam:"Wanneer is de bron gemaakt?", niveau:"1F", doelen:["bron-datum"] },
          { id:"bron-soort", naam:"Wat voor soort bron?", niveau:"1F", doelen:["bron-soort"] },
          { id:"bron-belang", naam:"Wil de maker iets van je?", niveau:"1F", doelen:["bron-belang"] },
          { id:"bron-check", naam:"Check het in een tweede bron", niveau:"1F", doelen:["bron-check"] },
          { id:"bron-kies", naam:"Welke bron is het betrouwbaarst?", niveau:"1F", doelen:["bron-kies"] },
          { id:"bron-clickbait", naam:"Een kop die te veel belooft", niveau:"2F", doelen:["bron-clickbait"] },
          { id:"bron-foto", naam:"Een foto bij het verkeerde nieuws", niveau:"2F", doelen:["bron-foto"] },
          { id:"bron-nep", naam:"Nepsites en nepaccounts", niveau:"2F", doelen:["bron-nep"] },
          { id:"bron-reclame", naam:"Reclame die op nieuws lijkt", niveau:"2F", doelen:["bron-reclame"] },
          { id:"bron-framing", naam:"Framing: dezelfde feiten, een ander gevoel", niveau:"2F", doelen:["bron-framing"] },
          { id:"bron-vergelijk", naam:"Twee bronnen vergelijken", niveau:"2F", doelen:["bron-vergelijk"] }
        ] }
      ] },
      { naam:"Schrijven en spreken", hoofdstukken:[
        { naam:"Formuleren: verwijzen", paragrafen:[
          { id:"schrijf-zin-jouw", naam:"Jou of jouw", niveau:"1F", doelen:["schrijf-zin-jouw"] },
          { id:"schrijf-zin-dietdat", naam:"Die of dat", niveau:"1F", doelen:["schrijf-zin-dietdat"] },
          { id:"schrijf-zin-hunhen", naam:"Zij, hen of hun", niveau:"1F", doelen:["schrijf-zin-hunhen"] },
          { id:"schrijf-zin-haarzijn", naam:"Zijn, haar of hun", niveau:"1F", doelen:["schrijf-zin-haarzijn"] },
          { id:"gram-verwijs", naam:"Verwijzen naar een hele zin", niveau:"3F", doelen:["gram-verwijs"] },
          { id:"gram-wiewat", naam:"Wie en wat als betrekkelijk voornaamwoord", niveau:"3F", doelen:["gram-wiewat"] }
        ] },
        { naam:"Formuleren: zinsbouw", paragrafen:[
          { id:"schrijf-zin-volgorde", naam:"Woordvolgorde na een voegwoord", niveau:"1F", doelen:["schrijf-zin-volgorde"] },
          { id:"schrijf-zin-voegwoord", naam:"Het juiste voegwoord", niveau:"1F", doelen:["schrijf-zin-voegwoord"] },
          { id:"schrijf-zin-splitsen", naam:"Een te lange zin opsplitsen", niveau:"1F", doelen:["schrijf-zin-splitsen"] },
          { id:"gram-cong", naam:"Congruentie: enkelvoud of meervoud", niveau:"3F", doelen:["gram-cong"] },
          { id:"schrijf-zin-vergelijken", naam:"Groter dan, even groot als", niveau:"1F", doelen:["schrijf-zin-vergelijken"] },
          { id:"gram-alsdan", naam:"Als of dan bij vergelijken", niveau:"3F", doelen:["gram-alsdan"] }
        ] },
        { naam:"Formuleren: woordkeus", paragrafen:[
          { id:"schrijf-zin-ontkenning", naam:"Geen dubbele ontkenning", niveau:"1F", doelen:["schrijf-zin-ontkenning"] },
          { id:"schrijf-zin-contaminatie", naam:"Uitdrukkingen niet door elkaar", niveau:"1F", doelen:["schrijf-zin-contaminatie"] }
        ] },
        { naam:"Een alinea", paragrafen:[
          { id:"schrijf-alinea-delen", naam:"De drie delen van een alinea", niveau:"2F", doelen:["schrijf-alinea-delen"] },
          { id:"schrijf-alinea-kernzin", naam:"De kernzin", niveau:"2F", doelen:["schrijf-alinea-kernzin"] },
          { id:"schrijf-alinea-slot", naam:"De slotzin", niveau:"2F", doelen:["schrijf-alinea-slot"] },
          { id:"schrijf-alinea-volgorde", naam:"De goede volgorde", niveau:"2F", doelen:["schrijf-alinea-volgorde"] },
          { id:"schrijf-alinea-signaal", naam:"Signaalwoorden kiezen", niveau:"2F", doelen:["schrijf-alinea-signaal"] },
          { id:"schrijf-alinea-weg", naam:"Wat hoort er niet in?", niveau:"2F", doelen:["schrijf-alinea-weg"] }
        ] },
        { naam:"E-mail en brief", paragrafen:[
          { id:"schrijf-mail-formeel", naam:"Formeel of informeel", niveau:"2F", doelen:["schrijf-mail-formeel"], bank:[{t:"formeel of informeel"}] },
          { id:"schrijf-mail-aanhef", naam:"De aanhef", niveau:"2F", doelen:["schrijf-mail-aanhef"] },
          { id:"schrijf-mail-afsluiting", naam:"De afsluiting", niveau:"2F", doelen:["schrijf-mail-afsluiting"] },
          { id:"schrijf-mail-onderwerp", naam:"De onderwerpregel", niveau:"2F", doelen:["schrijf-mail-onderwerp"] },
          { id:"schrijf-mail-opbouw", naam:"De opbouw", niveau:"2F", doelen:["schrijf-mail-opbouw"] },
          { id:"schrijf-mail-toon", naam:"Een beleefde toon", niveau:"2F", doelen:["schrijf-mail-toon"] }
        ] },
        { naam:"Register en publiek", paragrafen:[
          { id:"schrijf-register-woorden", naam:"Formele woorden", niveau:"2F", doelen:["schrijf-register-woorden"] },
          { id:"schrijf-register-spreektaal", naam:"Spreektaal herkennen", niveau:"2F", doelen:["schrijf-register-spreektaal"] },
          { id:"schrijf-register-doel", naam:"Doel en lezer", niveau:"2F", doelen:["schrijf-register-doel"] },
          { id:"schrijf-register-plan", naam:"Een schrijfplan", niveau:"2F", doelen:["schrijf-register-plan"] },
          { id:"taal-over-groep", naam:"Groepstaal", niveau:"2F", doelen:["taal-over-groep"] },
          { id:"taal-over-situatie", naam:"Het bericht dat past", niveau:"2F", doelen:["taal-over-situatie"] },
          { id:"taal-over-publiek", naam:"Uitleggen aan wie luistert", niveau:"2F", doelen:["taal-over-publiek"] },
          { id:"taal-over-indruk", naam:"Hoe kom je over?", niveau:"2F", doelen:["taal-over-indruk"] }
        ] },
        { naam:"Teksten schrijven", paragrafen:[
          { id:"tekst-soort-samenvatting", naam:"Een samenvatting schrijven", niveau:"2F", doelen:["tekst-soort-samenvatting"] },
          { id:"tekst-soort-verslag", naam:"Een verslag opbouwen", niveau:"2F", doelen:["tekst-soort-verslag"] },
          { id:"tekst-soort-recensie", naam:"Een recensie schrijven", niveau:"2F", doelen:["tekst-soort-recensie"] },
          { id:"tekst-soort-verhaal", naam:"Een verhaal opbouwen", niveau:"2F", doelen:["tekst-soort-verhaal"] },
          { id:"tekst-soort-instr-volg", naam:"Een instructie: de volgorde", niveau:"2F", doelen:["tekst-soort-instr-volg"] },
          { id:"tekst-soort-instr-gebied", naam:"Een instructie: de gebiedende wijs", niveau:"2F", doelen:["tekst-soort-instr-gebied"] }
        ] },
        { naam:"Een betoog schrijven", paragrafen:[
          { id:"schrijf-betoog-standpunt", naam:"Een standpunt", niveau:"3F", doelen:["schrijf-betoog-standpunt"] },
          { id:"schrijf-betoog-argument", naam:"Argumenten ordenen", niveau:"3F", doelen:["schrijf-betoog-argument"] },
          { id:"schrijf-betoog-tegen", naam:"Een tegenargument weerleggen", niveau:"3F", doelen:["schrijf-betoog-tegen"] },
          { id:"schrijf-betoog-inleiding", naam:"Een goede inleiding", niveau:"3F", doelen:["schrijf-betoog-inleiding"] },
          { id:"schrijf-betoog-slot", naam:"Een sterk slot", niveau:"3F", doelen:["schrijf-betoog-slot"] }
        ] },
        { naam:"Informatie verwerken", paragrafen:[
          { id:"info-citaat", naam:"Citeren", niveau:"2F", doelen:["info-citaat"] },
          { id:"info-parafrase", naam:"Parafraseren", niveau:"2F", doelen:["info-parafrase"] },
          { id:"info-bronvermelding", naam:"Een bronvermelding maken", niveau:"2F", doelen:["info-bronvermelding"] },
          { id:"info-plagiaat", naam:"Plagiaat herkennen", niveau:"2F", doelen:["info-plagiaat"] },
          { id:"info-aantekening", naam:"Aantekeningen maken", niveau:"2F", doelen:["info-aantekening"] },
          { id:"info-schema", naam:"Een schema kiezen", niveau:"2F", doelen:["info-schema"] },
          { id:"info-samenvoegen", naam:"Twee bronnen samenvoegen", niveau:"2F", doelen:["info-samenvoegen"] }
        ] },
        { naam:"Creatief schrijven", paragrafen:[
          { id:"creatief-werkwoord", naam:"Een sterker werkwoord", niveau:"1F", doelen:["creatief-werkwoord"] },
          { id:"creatief-zintuig", naam:"Schrijven met je zintuigen", niveau:"1F", doelen:["creatief-zintuig"] },
          { id:"creatief-vergelijking", naam:"Zelf een vergelijking maken", niveau:"1F", doelen:["creatief-vergelijking"] },
          { id:"creatief-rijm", naam:"Een rijmwoord kiezen", niveau:"1F", doelen:["creatief-rijm"] },
          { id:"creatief-laten-zien", naam:"Laten zien in plaats van vertellen", niveau:"1F", doelen:["creatief-laten-zien"] },
          { id:"creatief-eerste-zin", naam:"Een spannende eerste zin", niveau:"1F", doelen:["creatief-eerste-zin"] }
        ] },
        { naam:"Feedback en reflectie", paragrafen:[
          { id:"reflect-feedback-toptip", naam:"Tops en tips geven", niveau:"1F", doelen:["reflect-feedback-toptip"] },
          { id:"reflect-feedback-ontvang", naam:"Feedback ontvangen", niveau:"1F", doelen:["reflect-feedback-ontvang"] },
          { id:"reflect-feedback-check", naam:"Nakijken met een checklist", niveau:"1F", doelen:["reflect-feedback-check"] },
          { id:"reflect-feedback-aanpak", naam:"Reflecteren op je aanpak", niveau:"1F", doelen:["reflect-feedback-aanpak"] },
          { id:"reflect-feedback-leerdoel", naam:"Een goed leerdoel", niveau:"1F", doelen:["reflect-feedback-leerdoel"] }
        ] },
        { naam:"Spreken en gesprekken", paragrafen:[
          { id:"spreek-gesprek-open", naam:"Open en gesloten vragen", niveau:"1F", doelen:["spreek-gesprek-open"] },
          { id:"spreek-gesprek-doorvragen", naam:"Doorvragen", niveau:"1F", doelen:["spreek-gesprek-doorvragen"] },
          { id:"spreek-gesprek-samenvatten", naam:"Samenvatten wat de ander zei", niveau:"1F", doelen:["spreek-gesprek-samenvatten"] },
          { id:"spreek-gesprek-beurt", naam:"De beurt nemen en geven", niveau:"1F", doelen:["spreek-gesprek-beurt"] },
          { id:"spreek-gesprek-presentatie", naam:"Een presentatie openen en afsluiten", niveau:"1F", doelen:["spreek-gesprek-presentatie"] },
          { id:"spreek-gesprek-mening", naam:"Je mening geven met een argument", niveau:"1F", doelen:["spreek-gesprek-mening"] },
          { id:"spreek-gesprek-luisteren", naam:"Actief luisteren", niveau:"1F", doelen:["spreek-gesprek-luisteren"] },
          { id:"gesprek-situatie-bellen", naam:"Telefoneren", niveau:"2F", doelen:["gesprek-situatie-bellen"] },
          { id:"gesprek-situatie-klacht", naam:"Een klacht netjes brengen", niveau:"2F", doelen:["gesprek-situatie-klacht"] },
          { id:"gesprek-situatie-soll", naam:"Een sollicitatiegesprek", niveau:"2F", doelen:["gesprek-situatie-soll"] },
          { id:"gesprek-situatie-afspraak", naam:"Een afspraak maken of afzeggen", niveau:"2F", doelen:["gesprek-situatie-afspraak"] },
          { id:"gesprek-situatie-nonverbaal", naam:"Non-verbale communicatie", niveau:"2F", doelen:["gesprek-situatie-nonverbaal"] },
          { id:"gesprek-discussie-uitleg", naam:"Om uitleg vragen", niveau:"2F", doelen:["gesprek-discussie-uitleg"] },
          { id:"gesprek-discussie-reageer", naam:"Reageren op een argument", niveau:"2F", doelen:["gesprek-discussie-reageer"] },
          { id:"gesprek-discussie-besluit", naam:"Samen tot een besluit komen", niveau:"2F", doelen:["gesprek-discussie-besluit"] }
        ] }
      ] },
      { naam:"Fictie en literatuur", hoofdstukken:[
        { naam:"Verhalen lezen", paragrafen:[
          { id:"fic-verteller", naam:"De verteller", niveau:"1F", doelen:["fic-verteller"] },
          { id:"fic-perspectief", naam:"Het perspectief", niveau:"1F", doelen:["fic-perspectief"] },
          { id:"fic-personage", naam:"Personages", niveau:"1F", doelen:["fic-personage"] },
          { id:"fic-tijd-plaats", naam:"Tijd en plaats", niveau:"1F", doelen:["fic-tijd-plaats"] }
        ] },
        { naam:"Hoe een verhaal is gebouwd", paragrafen:[
          { id:"fic-flashback", naam:"Flashback en vooruitwijzing", niveau:"2F", doelen:["fic-flashback"] },
          { id:"fic-einde", naam:"Open of gesloten einde", niveau:"2F", doelen:["fic-einde"] },
          { id:"fic-spanning", naam:"Spanning", niveau:"2F", doelen:["fic-spanning"] }
        ] },
        { naam:"Het verhaal ontleden", paragrafen:[
          { id:"lit-verhaal-motor", naam:"De motor van het verhaal", niveau:"2F", doelen:["lit-verhaal-motor"] },
          { id:"lit-verhaal-thema", naam:"Het thema", niveau:"2F", doelen:["lit-verhaal-thema"] },
          { id:"lit-verhaal-motief", naam:"Een motief", niveau:"2F", doelen:["lit-verhaal-motief"] },
          { id:"lit-verhaal-rol", naam:"De rol van een personage", niveau:"2F", doelen:["lit-verhaal-rol"] },
          { id:"lit-verhaal-ontwikkeling", naam:"Hoe een personage verandert", niveau:"2F", doelen:["lit-verhaal-ontwikkeling"] },
          { id:"lit-verhaal-titel", naam:"De titel verklaren", niveau:"2F", doelen:["lit-verhaal-titel"] },
          { id:"lit-verhaal-invloed", naam:"Tijd, plaats en omstandigheden", niveau:"2F", doelen:["lit-verhaal-invloed"] },
          { id:"lit-verhaal-effect", naam:"Het effect van een verteltechniek", niveau:"2F", doelen:["lit-verhaal-effect"] }
        ] },
        { naam:"Beeldspraak en stijlfiguren", paragrafen:[
          { id:"fic-vergelijking", naam:"Vergelijking", niveau:"2F", doelen:["fic-vergelijking"] },
          { id:"fic-metafoor", naam:"Metafoor", niveau:"2F", doelen:["fic-metafoor"] },
          { id:"fic-personificatie", naam:"Personificatie", niveau:"2F", doelen:["fic-personificatie"] },
          { id:"fic-overdrijving", naam:"Overdrijving", niveau:"2F", doelen:["fic-overdrijving"] },
          { id:"fic-herhaling", naam:"Herhaling", niveau:"2F", doelen:["fic-herhaling"] },
          { id:"lit-genre-allit", naam:"Alliteratie", niveau:"1F", doelen:["lit-genre-allit"] },
          { id:"fic-stijl-welk", naam:"Welk stijlmiddel?", niveau:"2F", doelen:["fic-stijl-welk"] }
        ] },
        { naam:"Gedichten", paragrafen:[
          { id:"fic-eindrijm", naam:"Eindrijm", niveau:"2F", doelen:["fic-eindrijm"] },
          { id:"fic-rijmschema", naam:"Rijmschema", niveau:"2F", doelen:["fic-rijmschema"] }
        ] },
        { naam:"Genres", paragrafen:[
          { id:"lit-genre-vorm", naam:"Poëzie, proza of drama", niveau:"1F", doelen:["lit-genre-vorm"] },
          { id:"lit-genre-soort", naam:"Verhaalgenres", niveau:"1F", doelen:["lit-genre-soort"] },
          { id:"lit-genre-effect", naam:"Het effect van een genre", niveau:"1F", doelen:["lit-genre-effect"] },
          { id:"lit-genre-beeld", naam:"Illustraties en vormgeving", niveau:"1F", doelen:["lit-genre-beeld"] }
        ] },
        { naam:"Lezen en vinden", paragrafen:[
          { id:"lit-mening-onderbouw", naam:"Je mening onderbouwen", niveau:"1F", doelen:["lit-mening-onderbouw"] },
          { id:"lit-mening-recensie", naam:"Een recensie lezen", niveau:"1F", doelen:["lit-mening-recensie"] },
          { id:"lit-mening-kiezen", naam:"Een boek kiezen dat bij je past", niveau:"1F", doelen:["lit-mening-kiezen"] },
          { id:"lit-mening-beleving", naam:"Je leeservaring verwoorden", niveau:"1F", doelen:["lit-mening-beleving"] },
          { id:"lit-mening-leren", naam:"Wat leer je van een verhaal?", niveau:"1F", doelen:["lit-mening-leren"] }
        ] },
        { naam:"Literatuur door de tijd", paragrafen:[
          { id:"lit-tijd-middel", naam:"De middeleeuwen", niveau:"3F", doelen:["lit-tijd-middel"] },
          { id:"lit-tijd-goud", naam:"De Gouden Eeuw", niveau:"3F", doelen:["lit-tijd-goud"] },
          { id:"lit-tijd-havelaar", naam:"Max Havelaar", niveau:"3F", doelen:["lit-tijd-havelaar"] },
          { id:"lit-tijd-oorlog", naam:"Oorlogsliteratuur", niveau:"3F", doelen:["lit-tijd-oorlog"] },
          { id:"lit-tijd-herken", naam:"Herken de periode", niveau:"3F", doelen:["lit-tijd-herken"] },
          { id:"lit-tijd-univ", naam:"Wat is nu nog hetzelfde?", niveau:"3F", doelen:["lit-tijd-univ"] }
        ] }
      ] }
    ],
    wiskunde:[
      { naam:"Getallen en algebra", hoofdstukken:[
        { naam:"Negatieve getallen", paragrafen:[
          { id:"wob-a-neg-lijn", naam:"Optellen en aftrekken", niveau:"onderbouw", doelen:["wob-a-neg-lijn", "wob-a-neg-plusneg", "wob-a-neg-minneg", "wob-a-neg-regel", "wob-a-neg-kies"] },
          { id:"wob-a-neg-keer", naam:"Vermenigvuldigen en delen", niveau:"onderbouw", doelen:["wob-a-neg-keer", "wob-a-neg-deel", "wob-a-neg-meer"] }
        ] },
        { naam:"Volgorde van bewerkingen", paragrafen:[
          { id:"wob-a-volg-keer", naam:"Volgorde van bewerkingen", niveau:"onderbouw", doelen:["wob-a-volg-keer", "wob-a-volg-links", "wob-a-volg-haakjes", "wob-a-volg-macht", "wob-a-volg-neg"] }
        ] },
        { naam:"Machten en wortels", paragrafen:[
          { id:"wob-a-mac-uit", naam:"Machten", niveau:"onderbouw", doelen:["wob-a-mac-uit", "wi-neg-macht"] },
          { id:"wob-a-mac-wortel", naam:"Wortels", niveau:"onderbouw", doelen:["wob-a-mac-wortel", "wob-a-mac-schat"] },
          { id:"wi-mac-wortel", naam:"Wortels vereenvoudigen", niveau:"havo", doelen:["wi-mac-wortel"] },
          { id:"wi-mac-regels", naam:"Rekenregels voor machten", niveau:"havo", doelen:["wi-mac-regels"] },
          { id:"wob-a-sci-tien", naam:"Machten van 10 en de wetenschappelijke notatie", niveau:"onderbouw", doelen:["wob-a-sci-tien", "wob-a-sci-groot", "wob-a-sci-klein", "wob-a-sci-terug"] },
          { id:"whb-mac-neg", naam:"Negatieve en gebroken exponenten", niveau:"havo B", doelen:["whb-mac-neg", "whb-mac-gebr"] }
        ] },
        { naam:"Rekenen met letters", paragrafen:[
          { id:"wob-a-let-keer", naam:"Korter schrijven en samennemen", niveau:"onderbouw", doelen:["wob-a-let-keer", "wob-a-let-samen", "wi-herl-keer"] },
          { id:"wob-a-let-invul", naam:"Invullen", niveau:"onderbouw", doelen:["wob-a-let-invul"] },
          { id:"wob-a-let-haak", naam:"Haakjes wegwerken", niveau:"onderbouw", doelen:["wob-a-let-haak", "wob-a-let-minhaak", "wob-a-let-haaksamen", "wi-herl-twee"] },
          { id:"wi-merk-kwadraat", naam:"Merkwaardige producten", niveau:"havo", doelen:["wi-merk-kwadraat", "wi-merk-verschil", "wi-merk-kies"] }
        ] },
        { naam:"Ontbinden in factoren", paragrafen:[
          { id:"wi-ont-buiten", naam:"Ontbinden in factoren", niveau:"havo", doelen:["wi-ont-buiten", "wi-ont-somprod", "wi-ont-verschil", "wi-ont-kies"] }
        ] },
        { naam:"Vergelijkingen en ongelijkheden", paragrafen:[
          { id:"wob-a-vgl-plus", naam:"De omgekeerde bewerking en terugrekenen", niveau:"onderbouw", doelen:["wob-a-vgl-plus", "wob-a-vgl-keer", "wob-a-vgl-ketting", "wob-a-vgl-minx", "wi-vgl-terug"] },
          { id:"wi-vgl-balans", naam:"De balansmethode", niveau:"onderbouw", doelen:["wi-vgl-balans", "wi-vgl-haakjes", "wi-vgl-kies", "wob-a-vgl-controle"] },
          { id:"wi-kw-wortel", naam:"Kwadratische vergelijkingen", niveau:"havo", doelen:["wi-kw-wortel", "wi-kw-ontbind", "wi-kw-abc", "wi-kw-kies"] },
          { id:"wvm-a-inklem-heel", naam:"Inklemmen en de grafiek", niveau:"vmbo", doelen:["wvm-a-inklem-heel", "wvm-a-inklem-dec", "wvm-a-inklem-grafiek", "wvm-a-inklem-kies"] },
          { id:"wi-ong-los", naam:"Ongelijkheden", niveau:"havo", doelen:["wi-ong-los", "wi-ong-omklap"] },
          { id:"whb-mac-vgl", naam:"Machts- en wortelvergelijkingen", niveau:"havo B", doelen:["whb-mac-vgl", "whb-mac-wortel"] }
        ] },
        { naam:"Formules omwerken en combineren", paragrafen:[
          { id:"wi-om-lin", naam:"Een formule omwerken", niveau:"havo", doelen:["wi-om-lin"] },
          { id:"wvm-a-form-kwadraat", naam:"Invullen en terugrekenen bij een kwadraat of wortel", niveau:"vmbo", doelen:["wvm-a-form-kwadraat", "wvm-a-form-wortel", "wvm-a-form-terug-kw", "wvm-a-form-terug-wortel"] },
          { id:"wvm-a-comb-invul", naam:"Formules combineren en eenheden", niveau:"vmbo", doelen:["wvm-a-comb-invul", "wvm-a-comb-formule", "wvm-a-eenh-afstand", "wvm-a-eenh-tijd", "wvm-a-eenh-kosten"] }
        ] },
        { naam:"Logaritmen en exponentiële vergelijkingen", paragrafen:[
          { id:"whb-log-def", naam:"Logaritmen", niveau:"havo B", doelen:["whb-log-def", "whb-log-regels", "whb-log-vgl"] },
          { id:"whb-expv-gelijk", naam:"Exponentiële vergelijkingen", niveau:"havo B", doelen:["whb-expv-gelijk", "whb-expv-log", "whb-expv-kies"] },
          { id:"wva-log-def", naam:"Logaritmen en vergelijkingen", niveau:"vwo A", doelen:["wva-log-def", "wva-log-zelfde", "wva-log-log", "wva-log-kies"] },
          { id:"wvb-log-def", naam:"Logaritmen en het getal e", niveau:"vwo B", doelen:["wvb-log-def", "wvb-log-regels", "wvb-ln-e"] },
          { id:"wvb-vgl-grondtal", naam:"Exponentiële en logaritmische vergelijkingen", niveau:"vwo B", doelen:["wvb-vgl-grondtal", "wvb-vgl-log", "wvb-vgl-kies", "wvb-vgl-logvgl", "wvb-vgl-eln"] }
        ] }
      ] },
      { naam:"Verbanden", hoofdstukken:[
        { naam:"Assenstelsel en grafieken lezen", paragrafen:[
          { id:"wob-v-as-lees", naam:"Het assenstelsel", niveau:"onderbouw", doelen:["wob-v-as-lees", "wob-v-as-neg", "wob-v-as-zet"] },
          { id:"wob-v-gl-y", naam:"Grafieken lezen", niveau:"onderbouw", doelen:["wob-v-gl-y", "wob-v-gl-x", "wob-v-gl-stijg", "wob-v-gl-snelst"] }
        ] },
        { naam:"Formules en tabellen", paragrafen:[
          { id:"wob-v-fo-woord", naam:"Formules en tabellen", niveau:"onderbouw", doelen:["wob-v-fo-woord", "wob-v-fo-invul", "wob-v-fo-verhaal", "wob-v-fo-terug", "wi-lin-tabel"] }
        ] },
        { naam:"Lineaire verbanden", paragrafen:[
          { id:"wob-v-lin-is", naam:"Lineair of niet", niveau:"onderbouw", doelen:["wob-v-lin-is"] },
          { id:"wob-v-lin-tabel", naam:"Startgetal en hellingsgetal", niveau:"onderbouw", doelen:["wob-v-lin-tabel", "wob-v-lin-graf", "wob-v-lin-form"] },
          { id:"wvm-a-lin-helling", naam:"Het hellingsgetal berekenen", niveau:"vmbo", doelen:["wvm-a-lin-helling"] },
          { id:"wob-v-lin-formtab", naam:"De formule opstellen", niveau:"onderbouw", doelen:["wob-v-lin-formtab", "wi-lin-twee"] },
          { id:"wvm-a-lin-tabel", naam:"De formule bij een tabel, grafiek of verhaal", niveau:"vmbo", doelen:["wvm-a-lin-tabel", "wvm-a-lin-grafiek", "wvm-a-lin-verhaal"] },
          { id:"wha-fo-lin", naam:"Lineaire formules opstellen", niveau:"havo A", doelen:["wha-fo-lin"] },
          { id:"wob-v-lin-herken", naam:"De grafiek bij een formule", niveau:"onderbouw", doelen:["wob-v-lin-herken"] },
          { id:"wvm-a-lin-terug", naam:"Terugrekenen", niveau:"vmbo", doelen:["wvm-a-lin-terug"] },
          { id:"wob-v-snij-graf", naam:"Snijpunten", niveau:"onderbouw", doelen:["wob-v-snij-graf", "wob-v-snij-tabel", "wob-v-snij-vgl", "wi-lin-snij"] }
        ] },
        { naam:"Kwadratische verbanden", paragrafen:[
          { id:"wob-v-kw-vorm", naam:"Tabel, vorm en symmetrie", niveau:"onderbouw", doelen:["wob-v-kw-vorm", "wob-v-kw-tabel", "wob-v-kw-sym", "wob-v-kw-top", "wob-v-kw-verschil"] },
          { id:"wvm-a-kw-tabel", naam:"De parabool: tabel, symmetrie en top", niveau:"vmbo", doelen:["wvm-a-kw-tabel", "wvm-a-kw-soort", "wvm-a-kw-symas", "wvm-a-kw-top-tabel"] },
          { id:"wvm-a-kw-nul", naam:"Nulpunten en de top", niveau:"vmbo", doelen:["wvm-a-kw-nul", "wvm-a-kw-top-nul"] },
          { id:"whb-top-vorm", naam:"De top van een parabool", niveau:"havo B", doelen:["whb-top-vorm", "whb-top-abc", "whb-top-sym", "whb-top-kies"] },
          { id:"whb-fun-waarde", naam:"Functiewaarde, domein en bereik", niveau:"havo B", doelen:["whb-fun-waarde", "whb-fun-domein", "whb-fun-bereikw", "whb-fun-bereikp"] }
        ] },
        { naam:"Omgekeerd evenredig", paragrafen:[
          { id:"wob-v-oe-herken", naam:"Omgekeerd evenredig", niveau:"onderbouw", doelen:["wob-v-oe-herken", "wob-v-oe-ontbreek", "wob-v-oe-formule"] }
        ] },
        { naam:"Exponentiële groei en machtsformules", paragrafen:[
          { id:"wi-exp-factor", naam:"Groeifactor en procent", niveau:"vmbo", doelen:["wi-exp-factor", "wi-exp-procent", "wi-exp-formule", "wi-exp-tabel"] },
          { id:"wvm-a-exp-perioden", naam:"Meer perioden en terugrekenen", niveau:"vmbo", doelen:["wvm-a-exp-perioden", "wvm-a-exp-afname", "wvm-a-exp-terug", "wvm-a-exp-grens"] },
          { id:"wha-fo-soort", naam:"Groeifactor, verdubbelen en halveren", niveau:"havo A", doelen:["wha-fo-soort", "wha-fo-exp", "wha-fo-langer", "wha-fo-korter", "wha-fo-verdub"] },
          { id:"wva-exp-eenheid", naam:"Groeifactor per tijdseenheid, halveren en verdubbelen", niveau:"vwo A", doelen:["wva-exp-eenheid", "wva-exp-half", "wva-exp-verdub", "wva-exp-terug"] },
          { id:"wha-fo-macht", naam:"Machtsformules", niveau:"havo A", doelen:["wha-fo-macht", "wha-fo-machtterug"] }
        ] },
        { naam:"Veranderingen", paragrafen:[
          { id:"wvm-a-graf-toename", naam:"Toename en afname in een grafiek", niveau:"vmbo", doelen:["wvm-a-graf-toename", "wvm-a-graf-lezen", "wvm-a-graf-grootste", "wvm-a-graf-gem", "wvm-a-graf-stijgen"] },
          { id:"wha-ver-toename", naam:"Toenamediagrammen en het differentiequotiënt", niveau:"havo A", doelen:["wha-ver-toename", "wha-ver-terug", "wha-ver-soort", "wha-ver-diff", "wha-ver-raak"] },
          { id:"wva-dif-dq", naam:"Het differentiequotiënt", niveau:"vwo A", doelen:["wva-dif-dq"] }
        ] },
        { naam:"Transformaties van grafieken", paragrafen:[
          { id:"whb-tr-punt", naam:"Transformaties van grafieken", niveau:"havo B", doelen:["whb-tr-punt", "whb-tr-schuif", "whb-tr-xas", "whb-tr-yas", "whb-tr-twee"] }
        ] },
        { naam:"Differentiëren", paragrafen:[
          { id:"whb-afg-macht", naam:"De afgeleide", niveau:"havo B", doelen:["whb-afg-macht", "whb-afg-veel", "whb-afg-herleid"] },
          { id:"whb-afgg-helling", naam:"De afgeleide gebruiken", niveau:"havo B", doelen:["whb-afgg-helling", "whb-afgg-raak", "whb-afgg-stijg", "whb-afgg-top"] },
          { id:"wva-dif-macht", naam:"Differentiëren en de helling", niveau:"vwo A", doelen:["wva-dif-macht", "wva-dif-veelterm", "wva-dif-helling", "wva-dif-raaklijn", "wva-dif-top"] },
          { id:"wvb-dif-ex", naam:"Afgeleiden van standaardfuncties", niveau:"vwo B", doelen:["wvb-dif-ex", "wvb-dif-ln", "wvb-dif-gx", "wvb-dif-sin"] },
          { id:"wvb-dif-product", naam:"Product-, quotiënt- en kettingregel", niveau:"vwo B", doelen:["wvb-dif-product", "wvb-dif-quot", "wvb-dif-ketting", "wvb-dif-kies"] },
          { id:"wvb-raaklijn", naam:"Raaklijnen, extremen en buigpunten", niveau:"vwo B", doelen:["wvb-raaklijn", "wvb-extreem", "wvb-extreem-tweede", "wvb-buigpunt"] }
        ] },
        { naam:"Integreren", paragrafen:[
          { id:"wvb-prim-macht", naam:"Integreren", niveau:"vwo B", doelen:["wvb-prim-macht", "wvb-prim-std", "wvb-integraal"] }
        ] },
        { naam:"Periodieke functies", paragrafen:[
          { id:"whb-per-ea", naam:"Periodieke functies", niveau:"havo B", doelen:["whb-per-ea", "whb-per-per", "whb-per-formule", "whb-per-opstel"] },
          { id:"wvb-radialen", naam:"Radialen, exacte waarden en sinusoïden", niveau:"vwo B", doelen:["wvb-radialen", "wvb-exact", "wvb-gvgl", "wvb-gvgl-2x", "wvb-sinusoide"] }
        ] }
      ] },
      { naam:"Meetkunde", hoofdstukken:[
        { naam:"Hoeken", paragrafen:[
          { id:"wob-m-hoek-soort", naam:"Soorten hoeken en de notatie", niveau:"onderbouw", doelen:["wob-m-hoek-soort", "wob-m-hoek-naam"] },
          { id:"wob-m-hoek-neven", naam:"Nevenhoeken en overstaande hoeken", niveau:"onderbouw", doelen:["wob-m-hoek-neven", "wob-m-hoek-overstaand"] },
          { id:"wob-m-ev-f", naam:"Hoeken bij evenwijdige lijnen", niveau:"onderbouw", doelen:["wob-m-ev-f", "wob-m-ev-z", "wob-m-ev-regel"] },
          { id:"wob-m-ev-driehoek", naam:"De hoekensom", niveau:"onderbouw", doelen:["wob-m-ev-driehoek", "wob-m-ev-gelijkbenig", "wi-hoek-veelhoek"] },
          { id:"wi-hoek-x", naam:"Hoeken met een vergelijking", niveau:"onderbouw", doelen:["wi-hoek-x"] }
        ] },
        { naam:"Omtrek en oppervlakte", paragrafen:[
          { id:"wob-m-opp-cm2", naam:"Wat oppervlakte is, en de eenheden", niveau:"onderbouw", doelen:["wob-m-opp-cm2", "wob-m-opp-eenheid", "wob-m-opp-om"] },
          { id:"wob-m-opp-rh", naam:"Rechthoek en vierkant", niveau:"onderbouw", doelen:["wob-m-opp-rh", "wob-m-opp-vierkant", "wob-m-opp-rechthoek"] },
          { id:"wob-m-opp-driehoek", naam:"Driehoek", niveau:"onderbouw", doelen:["wob-m-opp-driehoek", "wob-m-opp-buiten"] },
          { id:"wob-m-opp-para", naam:"Parallellogram en trapezium", niveau:"onderbouw", doelen:["wob-m-opp-para", "wob-m-opp-trapezium"] },
          { id:"wob-m-opp-ruit", naam:"Ruit en vlieger", niveau:"onderbouw", doelen:["wob-m-opp-ruit"] },
          { id:"wob-m-cir-omtrek", naam:"De cirkel", niveau:"onderbouw", doelen:["wob-m-cir-omtrek", "wob-m-cir-opp"] },
          { id:"wvm-m-cirk-deel-opp", naam:"Halve en kwart cirkels", niveau:"vmbo", doelen:["wvm-m-cirk-deel-opp", "wvm-m-cirk-deel-omtrek"] },
          { id:"wob-m-sam-erbij", naam:"Samengestelde figuren", niveau:"onderbouw", doelen:["wob-m-sam-erbij", "wob-m-sam-eraf", "wob-m-sam-kies"] },
          { id:"wvm-m-cirk-erbij", naam:"Samengestelde figuren met cirkeldelen", niveau:"vmbo", doelen:["wvm-m-cirk-erbij", "wvm-m-cirk-eraf", "wvm-m-cirk-omtrek"] }
        ] },
        { naam:"Inhoud van ruimtefiguren", paragrafen:[
          { id:"wob-m-inh-om", naam:"Inhoudsmaten en liters", niveau:"onderbouw", doelen:["wob-m-inh-om", "wob-m-inh-liter"] },
          { id:"wvm-m-liter-cm", naam:"Liters, cm³ en dm³", niveau:"vmbo", doelen:["wvm-m-liter-cm", "wvm-m-liter-dm", "wvm-m-liter-kies"] },
          { id:"wob-m-inh-balk", naam:"Kubus en balk", niveau:"onderbouw", doelen:["wob-m-inh-balk"] },
          { id:"wob-m-inh-prisma", naam:"Prisma en cilinder", niveau:"onderbouw", doelen:["wob-m-inh-prisma", "wob-m-inh-cilinder"] },
          { id:"wi-inh-piramide", naam:"Piramide en kegel", niveau:"vmbo", doelen:["wi-inh-piramide", "wi-inh-kies"] },
          { id:"wvm-m-inh-bol", naam:"Bol, samengestelde figuren en terugrekenen", niveau:"vmbo", doelen:["wvm-m-inh-bol", "wvm-m-inh-samen", "wvm-m-inh-gat", "wvm-m-inh-terug"] }
        ] },
        { naam:"Oppervlakte van ruimtefiguren", paragrafen:[
          { id:"wob-m-uit-balk", naam:"Uitslag en oppervlakte", niveau:"onderbouw", doelen:["wob-m-uit-balk", "wob-m-uit-prisma", "wob-m-uit-cilinder"] },
          { id:"wvm-m-opp-prisma", naam:"Oppervlakte van prisma en cilinder", niveau:"vmbo", doelen:["wvm-m-opp-prisma", "wvm-m-opp-cil"] }
        ] },
        { naam:"Pythagoras", paragrafen:[
          { id:"wob-m-pyt-schuin", naam:"In de vlakke figuur", niveau:"onderbouw", doelen:["wob-m-pyt-schuin", "wob-m-pyt-rhz", "wob-m-pyt-kies", "wob-m-pyt-check", "wob-m-pyt-toepas"] },
          { id:"wi-pyt-assen", naam:"In het assenstelsel en de gelijkbenige driehoek", niveau:"vmbo", doelen:["wi-pyt-assen", "wi-pyt-hoogte"] },
          { id:"wi-pyt-ruimte", naam:"In de ruimte", niveau:"vmbo", doelen:["wi-pyt-ruimte", "wvm-m-rp-midden", "wvm-m-rp-pir-hoogte", "wvm-m-rp-pir-ribbe", "wvm-m-rp-pir-zijvlak"] }
        ] },
        { naam:"Gelijkvormigheid, vergroten en schaal", paragrafen:[
          { id:"wob-m-gel-paren", naam:"Gelijkvormige driehoeken", niveau:"onderbouw", doelen:["wob-m-gel-paren", "wob-m-gel-factor", "wob-m-gel-zijde", "wob-m-gel-tabel", "wob-m-gel-kies"] },
          { id:"wvm-m-gv-snavel", naam:"Snavel, zandloper en schaduw", niveau:"vmbo", doelen:["wvm-m-gv-snavel", "wvm-m-gv-zandloper", "wvm-m-gv-stuk", "wvm-m-gv-schaduw"] },
          { id:"wi-verg-factor", naam:"Vergroten van lengte, oppervlakte en inhoud", niveau:"vmbo", doelen:["wi-verg-factor"] },
          { id:"wvm-m-schaal-werk", naam:"Schaal", niveau:"vmbo", doelen:["wvm-m-schaal-werk", "wvm-m-schaal-teken", "wvm-m-schaal-verg"] },
          { id:"wvm-m-sopp-lengte", naam:"Schaal en oppervlakte", niveau:"vmbo", doelen:["wvm-m-sopp-lengte", "wvm-m-sopp-hokje", "wvm-m-sopp-kies"] }
        ] },
        { naam:"Goniometrie", paragrafen:[
          { id:"wi-gon-kies", naam:"Sinus, cosinus en tangens", niveau:"vmbo", doelen:["wi-gon-kies", "wi-gon-zijde", "wi-gon-hoek"] },
          { id:"wvm-m-hel-proc", naam:"Hellingshoek en hellingspercentage", niveau:"vmbo", doelen:["wvm-m-hel-proc", "wvm-m-hel-hoogte", "wvm-m-hel-hoek", "wvm-m-hel-perc", "wvm-m-hel-weg"] },
          { id:"wvm-m-gon-oog", naam:"Toepassingen", niveau:"vmbo", doelen:["wvm-m-gon-oog", "wvm-m-gon-boot", "wvm-m-gon-drieh", "wvm-m-gon-gelijkbenig"] },
          { id:"whb-sc-szijde", naam:"Sinusregel en cosinusregel", niveau:"havo B", doelen:["whb-sc-szijde", "whb-sc-shoek", "whb-sc-czijde", "whb-sc-choek", "whb-sc-kies"] }
        ] },
        { naam:"Transformaties in het assenstelsel", paragrafen:[
          { id:"wob-m-tr-spiegel", naam:"Spiegelen, verschuiven en draaien", niveau:"onderbouw", doelen:["wob-m-tr-spiegel", "wob-m-tr-verschuif", "wob-m-tr-halve", "wob-m-tr-kwart"] }
        ] },
        { naam:"Cirkels en vectoren", paragrafen:[
          { id:"whb-cir-hoek", naam:"Hoeken en raaklijnen bij cirkels", niveau:"havo B", doelen:["whb-cir-hoek", "whb-cir-raak", "whb-cir-coord"] },
          { id:"wvb-cirkel-op", naam:"De vergelijking van een cirkel", niveau:"vwo B", doelen:["wvb-cirkel-op", "wvb-cirkel-af", "wvb-cirkel-afsplits"] },
          { id:"wvb-vec-som", naam:"Vectoren", niveau:"vwo B", doelen:["wvb-vec-som", "wvb-inproduct", "wvb-vec-hoek", "wvb-vec-lijn", "wvb-vec-vgl", "wvb-afstand"] }
        ] }
      ] },
      { naam:"Statistiek en kans", hoofdstukken:[
        { naam:"Gegevens verwerken", paragrafen:[
          { id:"wst-turven", naam:"Turven, frequentie en klassen", niveau:"onderbouw", doelen:["wst-turven", "wst-relfreq", "wst-klassen"] },
          { id:"wst-cumfreq", naam:"Cumulatieve frequentie", niveau:"vmbo", doelen:["wst-cumfreq"] }
        ] },
        { naam:"Diagrammen aflezen", paragrafen:[
          { id:"wst-staaf", naam:"Staaf-, lijn- en cirkeldiagram", niveau:"onderbouw", doelen:["wst-staaf", "wst-lijn", "wst-cirkel-proc", "wst-cirkel-graden", "wst-cirkel-terug"] },
          { id:"wst-somfreq", naam:"Somfrequentie, steelblad en histogram", niveau:"vmbo", doelen:["wst-somfreq", "wst-steelblad", "wst-histogram"] },
          { id:"wha-st-poly", naam:"Frequentiepolygoon en cumulatief", niveau:"havo A", doelen:["wha-st-poly", "wha-st-cum"] }
        ] },
        { naam:"Centrum- en spreidingsmaten", paragrafen:[
          { id:"wst-gem", naam:"Gemiddelde, mediaan en modus", niveau:"onderbouw", doelen:["wst-gem", "wst-med-oneven", "wst-med-even", "wst-modus", "wst-centrum-kies"] },
          { id:"wst-gem-freq", naam:"Uit een frequentietabel", niveau:"onderbouw", doelen:["wst-gem-freq", "wst-med-freq"] },
          { id:"wi-st-klassen", naam:"Gemiddelde bij klassen", niveau:"vmbo", doelen:["wi-st-klassen"] },
          { id:"wst-spreiding", naam:"Spreiding", niveau:"onderbouw", doelen:["wst-spreiding"] },
          { id:"wi-st-kwartiel", naam:"Kwartielen en de boxplot", niveau:"vmbo", doelen:["wi-st-kwartiel", "wi-st-boxplot"] },
          { id:"wha-st-sd", naam:"De standaardafwijking", niveau:"havo A", doelen:["wha-st-sd"] }
        ] },
        { naam:"Kansen", paragrafen:[
          { id:"wst-kans-breuk", naam:"Kansen", niveau:"onderbouw", doelen:["wst-kans-breuk", "wst-kans-proc", "wst-kans-dobbel", "wst-kans-rooster"] },
          { id:"wst-kruistabel", naam:"Kruistabel, niet en minstens", niveau:"vmbo", doelen:["wst-kruistabel", "wst-niet", "wst-minstens", "wst-verwacht"] },
          { id:"wi-kans-paden", naam:"Kansbomen", niveau:"havo", doelen:["wi-kans-paden", "wi-kans-zonder", "wi-kans-drie"] }
        ] },
        { naam:"Tellen", paragrafen:[
          { id:"wst-tel-wegen", naam:"Wegendiagram en boomdiagram", niveau:"onderbouw", doelen:["wst-tel-wegen", "wst-tel-boom", "wst-tel-regel", "wst-tel-kies"] },
          { id:"wha-tel-keer", naam:"Permutaties en combinaties", niveau:"havo A", doelen:["wha-tel-keer", "wha-tel-fac", "wha-tel-perm", "wha-tel-comb", "wha-tel-rijtjes", "wha-tel-kies"] },
          { id:"wva-tel-verm", naam:"Tellen met permutaties en combinaties", niveau:"vwo A", doelen:["wva-tel-verm", "wva-tel-herh", "wva-tel-fac", "wva-tel-perm", "wva-tel-comb", "wva-tel-rijtje", "wva-tel-rooster", "wva-tel-kies"] }
        ] },
        { naam:"Kansregels en kansverdelingen", paragrafen:[
          { id:"wha-kans-som", naam:"Kansregels en de binomiale verdeling", niveau:"havo A", doelen:["wha-kans-som", "wha-kans-prod", "wha-kans-compl", "wha-kans-metzonder", "wha-kans-vaas", "wha-kans-kies", "wha-bin-formule", "wha-bin-minstens", "wha-verw"] },
          { id:"wva-kans-som", naam:"Kansregels en kansverdelingen", niveau:"vwo A", doelen:["wva-kans-som", "wva-kans-prod", "wva-kans-compl", "wva-kans-kies", "wva-kans-kruis", "wva-verd-ev", "wva-verd-sd", "wva-bin-formule", "wva-bin-hoogstens", "wva-bin-ev"] }
        ] },
        { naam:"Normale verdeling", paragrafen:[
          { id:"wha-st-vuist", naam:"De vuistregels", niveau:"havo A", doelen:["wha-st-vuist", "wha-st-grens"] },
          { id:"wva-norm-z", naam:"Z-waarden en vuistregels", niveau:"vwo A", doelen:["wva-norm-z", "wva-norm-vuist", "wva-norm-grens", "wva-norm-terug"] }
        ] },
        { naam:"Steekproeven en toetsen", paragrafen:[
          { id:"wha-st-aselect", naam:"Steekproeven", niveau:"havo A", doelen:["wha-st-aselect", "wha-st-steekproef"] },
          { id:"wva-toets-hyp", naam:"Hypothesen toetsen", niveau:"vwo A", doelen:["wva-toets-hyp", "wva-toets-besl", "wva-toets-kritiek", "wva-toets-bi"] }
        ] }
      ] }
    ]
  };

  var VAKNAAM = { rekenen:'Rekenen', nederlands:'Nederlands', wiskunde:'Wiskunde' };
  /* het vak van de werkbladen en de toetsen (bank.js VAKKEN) naar het vak van het boek */
  var VAN = { reken:'rekenen', ned:'nederlands', wis:'wiskunde' };

  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  var ENT = { amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ', hellip:'…', minus:'−', times:'×', middot:'·', euro:'€' };
  /* kale tekst uit html: geen tags, de bekende entiteiten als teken */
  function kaal(h){
    return String(h == null ? '' : h).replace(/<br\s*\/?>/gi, ' ').replace(/<\/(p|div|li)>/gi, ' ').replace(/<[^>]*>/g, '')
      .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, function(m, e){
        if (e.charAt(0) === '#') return String.fromCharCode(e.charAt(1).toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
        return ENT[e.toLowerCase()] != null ? ENT[e.toLowerCase()] : m;
      }).replace(/\s+/g, ' ').trim();
  }
  function schud(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- de indeling ---------- */
  var INDEX = {};
  function index(vak){
    if (INDEX[vak]) return INDEX[vak];
    var plat = [], op = {};
    (BOEK[vak] || []).forEach(function(t, ti){
      t.hoofdstukken.forEach(function(h, hi){
        h.paragrafen.forEach(function(p, pi){
          var x = { p:p, thema:t, hoofdstuk:h, ti:ti, hi:hi, pi:pi, nummer:(hi + 1) + '.' + (pi + 1), verdieping:!!(p.verdieping || h.verdieping) };
          plat.push(x); op[p.id] = x;
        });
      });
    });
    return (INDEX[vak] = { plat:plat, op:op });
  }
  function boek(vak){ return BOEK[vak] || []; }
  function paragraaf(vak, id){ return index(vak).op[id] || null; }
  function paragrafen(vak){ return index(vak).plat; }

  /* ---------- laden: de leerroute van het vak, en de vragenbank als een paragraaf die gebruikt ---------- */
  var bezig = {};
  function script(src){ return new Promise(function(klaar, mis){ var s = document.createElement('script'); s.src = src; s.onload = klaar; s.onerror = mis; document.head.appendChild(s); }); }
  var DOEL = {};
  function doel(id){
    if (DOEL[id]) return DOEL[id];
    if (!window.LEERROUTE) return null;
    LEERROUTE._doelen().forEach(function(d){ DOEL[d.id] = d; });
    return DOEL[id] || null;
  }
  /* staat alles van dit vak er al (een ander werkblad laadde het), dan niet nog eens */
  function heeftAl(vak){ return !!window.LEERROUTE && paragrafen(vak).every(function(x){ return x.p.doelen.every(function(id){ return doel(id); }); }); }
  function laad(vak){
    if (bezig[vak]) return bezig[vak];
    var v = window.LR_VERSIE || '3';
    var bank = vak === 'nederlands' && window.BANK && BANK.zorg ? BANK.zorg('ned').catch(function(){}) : Promise.resolve();
    var lr = heeftAl(vak) ? Promise.resolve() : (window.LEERROUTE ? Promise.resolve() : script('leerroute.js?v=' + v)).then(function(){
      return (LEERROUTE.BESTANDEN[vak] || []).reduce(function(p, f){ return p.then(function(){ return script('leerroute/' + f + '.js?v=' + v); }); }, Promise.resolve());
    }).then(function(){ DOEL = {}; if (LEERROUTE._mixen) LEERROUTE._mixen(); });
    bezig[vak] = Promise.all([lr, bank]).then(function(){}, function(e){ bezig[vak] = null; throw e; });
    return bezig[vak];
  }

  /* ---------- een opgave lezen ---------- */
  function antw(x){ return [].concat(x)[0]; }
  function beeld(op, n){ var b = op.beeld; if (!b) return ''; if (typeof b === 'function'){ try { return b(n) || ''; } catch (e){ return ''; } } return String(b); }
  function vraagHtml(op){ return op.vraagHtml || schoon(op.vraag || ''); }
  function stapAntwoord(s){ if (s.info) return ''; if (s.opties) return s.opties[s.goed]; return s.antwoord == null || typeof s.antwoord === 'function' ? '' : String(antw(s.antwoord)); }
  function echteStappen(op){ return (op.stappen || []).filter(function(s){ return !s.info; }); }
  /* de keuzes van de eindvraag: van de opgave zelf, of van de laatste stap als er geen eindantwoord is */
  function keuzes(op){
    if (op.opties) return { opties:op.opties, goed:op.goed, uitStap:false };
    if (op.antwoord != null) return null;
    var l = echteStappen(op), s = l[l.length - 1];
    return s && s.opties ? { opties:s.opties, goed:s.goed, uitStap:true, tekst:s.tekst } : null;
  }
  function eind(op){
    var k = keuzes(op); if (k) return String(k.opties[k.goed]);
    if (op.antwoord != null && typeof op.antwoord !== 'function') return String(antw(op.antwoord));
    var l = echteStappen(op); return l.length ? stapAntwoord(l[l.length - 1]) : '';
  }
  /* alle antwoorden die goed zijn bij een invulvraag */
  function goedeAntwoorden(op){
    var a = op.antwoord != null ? op.antwoord : (function(){ var l = echteStappen(op); return l.length ? l[l.length - 1].antwoord : null; })();
    if (a == null || typeof a === 'function') return [];
    return [].concat(a).map(function(x){ return String(x); });
  }

  /* ---------- opgaven maken voor een paragraaf ---------- */
  /* bij welk niveau van de vragenbank (1 bb, 2 kgt/tl, 3 havo, 4 vwo) een paragraaf hoogstens hoort */
  function bankNivo(p){ return /3F/.test(p.niveau) ? 4 : /2F/.test(p.niveau) ? 3 : 2; }
  function bankPot(p, b){
    var bron = (window.BRONNEN && BRONNEN.ned) || [], nivo = (window.NIVOS && NIVOS.ned) || [], max = bankNivo(p), re = b.zoek ? new RegExp(b.zoek, 'i') : null;
    var ids = bron.map(function(q, i){ return i; }).filter(function(i){
      var q = bron[i]; return q && q.t === b.t && Array.isArray(q.o) && q.o[q.g] != null && (!re || re.test(q.v));
    });
    var passend = ids.filter(function(i){ return !nivo[i] || nivo[i] <= max; });
    return (passend.length >= 4 ? passend : ids).map(function(i){ return bron[i]; });
  }
  function sleutelLr(op){ return String(op.vraag || '') + '|' + kaal(vraagHtml(op)) + '|' + kaal(op.context || '') + '|' + eind(op); }
  /* n verschillende opgaven, om de beurt uit elk doel (en de vragenbank) van de paragraaf */
  function opgaven(vak, id, n){
    var x = paragraaf(vak, id); if (!x) return [];
    var p = x.p, R = window.LEERROUTE ? LEERROUTE.R : null;
    var bronnen = p.doelen.map(doel).filter(Boolean).map(function(d){ return { soort:'lr', doel:d, mis:0 }; });
    (p.bank || []).forEach(function(b){ var pot = schud(bankPot(p, b)); if (pot.length) bronnen.push({ soort:'bank', pot:pot, mis:0 }); });
    var uit = [], gezien = {};
    bronnen = schud(bronnen);
    var ronde = 0;
    while (uit.length < n && bronnen.some(function(b){ return b.mis < 25; }) && ronde < n * 40){
      ronde++;
      for (var i = 0; i < bronnen.length && uit.length < n; i++){
        var b = bronnen[i]; if (b.mis >= 25) continue;
        if (b.soort === 'bank'){
          var q = b.pot.pop(); if (!q){ b.mis = 99; continue; }
          var sq = 'b|' + q.v + '|' + q.o[q.g];
          if (gezien[sq]){ b.mis++; continue; }
          gezien[sq] = true; uit.push({ soort:'bank', q:q }); continue;
        }
        var op = null; try { op = b.doel.maak(R); } catch (e){ op = null; }
        if (!op || !op.stappen){ b.mis++; continue; }
        var sl = sleutelLr(op);
        if (gezien[sl] || !eind(op)){ b.mis++; continue; }
        gezien[sl] = true; uit.push({ soort:'lr', op:op, doel:b.doel });
      }
    }
    return uit;
  }

  /* ---------- de uitleg boven een paragraaf ---------- */
  /* een doel: zijn eigen uitleg; meer doelen: per doel de regel in een zin */
  function uitleg(vak, id){
    var x = paragraaf(vak, id); if (!x) return '';
    var ds = x.p.doelen.map(doel).filter(Boolean);
    if (ds.length === 1) return ds[0].uit || '<p>' + schoon(ds[0].kort || '') + '</p>';
    return '<ul class="ob-regels">' + ds.map(function(d){ return '<li><b>' + schoon(d.naam) + '</b>' + (d.kort ? ': ' + schoon(d.kort.charAt(0).toLowerCase() + d.kort.slice(1)) : '') + '</li>'; }).join('') + '</ul>';
  }

  /* ---------- figuren op wit papier ---------- */
  var KLEUR = { 'lr-1':'#204ECF', 'lr-2':'#C4452A', 'lr-3':'#9a5c0c', 'lr-4':'#1f7a52', 'lr-5':'#7a3fb0', 'lr-zacht':'rgba(32,78,207,.08)',
    ink:'#14224C', kaart:'#fff', kaart2:'#f4efe8', muted:'#5b6480', rand:'rgba(20,34,76,.18)', rand2:'rgba(20,34,76,.28)' };
  /* dezelfde regels als de leerroute, met vaste kleuren; voor een figuur als losse svg zonder voorvoegsel */
  var SVGREGELS = '.lr-svg .as{stroke:#14224C;stroke-width:2;fill:none}.lr-svg .as.dun{stroke-width:1;opacity:.5}' +
    '.lr-svg text{fill:#14224C;font-family:Poppins,Arial,sans-serif}.lr-svg .getal{font-size:15px;font-weight:600;text-anchor:middle}' +
    '.lr-svg .getal.klein{font-size:13px}.lr-svg .getal.groot{font-size:20px;font-weight:700}.lr-svg .sprong{font-size:16px;font-weight:700;text-anchor:middle}' +
    '.lr-svg .boog,.lr-svg .pijl{fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.lr-svg .stip{fill:#C4452A}' +
    '.lr-svg .blok{stroke:#fff;stroke-width:.6}.lr-svg .blok.h{fill:#204ECF}.lr-svg .blok.t{fill:#C4452A}.lr-svg .blok.e{fill:#9a5c0c}' +
    '.lr-svg .vak{fill:#fff;stroke:#14224C;stroke-width:2}.lr-svg .vak.leeg{stroke:#C4452A;stroke-dasharray:5 4}' +
    '.lr-svg .deel{fill:#fff;stroke:#14224C;stroke-width:1.5}.lr-svg .deel.vol{fill:#204ECF;opacity:.75}.lr-svg .rand{fill:none;stroke:#14224C;stroke-width:2.5}' +
    '.lr-svg .wijzerplaat{fill:#fff;stroke:#14224C;stroke-width:3}.lr-svg .wijzer{stroke:#14224C;stroke-width:3.5;stroke-linecap:round}.lr-svg .wijzer.kort{stroke:#C4452A;stroke-width:5.5}';
  function vasteKleuren(s){ return String(s).replace(/var\(--([a-z0-9-]+)\)/gi, function(m, k){ return KLEUR[k] || '#14224C'; }); }
  /* Een figuur van de leerroute als losse svg: met de kleuren erin en de stijl erbij,
     zodat hij ook als plaatje klopt. Een tabel wordt een getekende tabel. */
  function losseSvg(html){
    html = String(html || '').trim();
    if (/^<svg[\s>]/i.test(html)){
      var s = vasteKleuren(html).replace(/\sclass="([^"]*)\bnieuw\b([^"]*)"/g, ' class="$1$2"');
      if (/<image|<foreignObject|<script|href=/i.test(s)) return '';
      var kop = /<svg\b[^>]*>/i.exec(s)[0], nieuw = kop;
      if (!/\sxmlns=/.test(kop)) nieuw = nieuw.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
      if (!/\sclass="[^"]*lr-svg/.test(kop)) nieuw = nieuw.replace(/<svg/i, '<svg class="lr-svg"');
      nieuw = nieuw.replace(/\sstyle="[^"]*"/i, '');
      var vb = /viewBox="([^"]+)"/i.exec(kop);
      if (vb){
        /* op de pagina mag tekst buiten de rand (overflow:visible); een plaatje knipt hem af, dus een rand eromheen */
        var d = vb[1].trim().split(/[\s,]+/).map(Number);
        if (d[2] > 0 && d[3] > 0){
          var m = Math.round(Math.max(d[2], d[3]) * 0.06) + 6;
          d = [d[0] - m, d[1] - m, d[2] + 2 * m, d[3] + 2 * m];
          nieuw = nieuw.replace(/viewBox="[^"]+"/i, 'viewBox="' + d.join(' ') + '"').replace(/\s(width|height)="[^"]*"/gi, '');
          var b = Math.max(360, Math.min(900, d[2] * 1.4));
          nieuw = nieuw.replace(/<svg/i, '<svg width="' + Math.round(b) + '" height="' + Math.round(b * d[3] / d[2]) + '"');
        }
      }
      /* als plaatje in een vraag wordt de figuur klein getoond: de maten erin een derde groter, anders zijn ze niet te lezen */
      var groter = '.lr-svg .getal{font-size:20px}.lr-svg .getal.klein{font-size:18px}.lr-svg .getal.groot{font-size:26px}.lr-svg .sprong{font-size:21px}';
      return s.replace(kop, nieuw + '<style>' + SVGREGELS + groter + '</style><rect x="-10000" y="-10000" width="20000" height="20000" fill="#fff"/>');
    }
    if (/class="lr-tabel"/.test(html) && typeof DOMParser !== 'undefined') return tabelSvg(html);
    /* twee tot vier figuren naast elkaar (twee breuken, twee grafieken): samen een plaatje */
    var los = html.match(/<svg[\s\S]*?<\/svg>/gi) || [];
    if (los.length === 1) return losseSvg(los[0]);
    if (los.length > 1 && los.length <= 4){
      var x = 0, hoog = 0, binnen = '';
      for (var i = 0; i < los.length; i++){
        var e = losseSvg(los[i]); if (!e) return '';
        var w = Number((/\swidth="([\d.]+)"/.exec(e) || [])[1]) || 300, h = Number((/\sheight="([\d.]+)"/.exec(e) || [])[1]) || 200;
        binnen += e.replace(/<svg/i, '<svg x="' + x + '" y="0"');
        x += w + 24; hoog = Math.max(hoog, h);
      }
      return '<svg xmlns="http://www.w3.org/2000/svg" width="' + (x - 24) + '" height="' + hoog + '" viewBox="0 0 ' + (x - 24) + ' ' + hoog + '"><rect width="100%" height="100%" fill="#fff"/>' + binnen + '</svg>';
    }
    return '';
  }
  /* een tabel (lr-tabel) getekend als svg: kopcellen blauw, elke cel even hoog */
  function tabelSvg(html){
    var doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
    var t = doc.querySelector('table'); if (!t) return '';
    var rijen = [].slice.call(t.querySelectorAll('tr')).filter(function(r){ return !r.classList.contains('pijlen'); }).map(function(r){
      return [].slice.call(r.children).map(function(c){ return { t:kaal(c.innerHTML), kop:c.tagName === 'TH', span:Number(c.getAttribute('colspan')) || 1 }; });
    }).filter(function(r){ return r.length; });
    if (!rijen.length) return '';
    var kol = Math.max.apply(null, rijen.map(function(r){ return r.reduce(function(a, c){ return a + c.span; }, 0); }));
    var br = []; for (var k = 0; k < kol; k++) br.push(46);
    rijen.forEach(function(r){ var k = 0; r.forEach(function(c){ if (c.span === 1) br[k] = Math.max(br[k], c.t.length * 8.6 + 22); k += c.span; }); });
    var H = 34, W = br.reduce(function(a, b){ return a + b; }, 0), s = '';
    rijen.forEach(function(r, ri){
      var x = 0, k = 0;
      r.forEach(function(c){
        var w = 0; for (var j = 0; j < c.span; j++) w += br[k + j] || 46;
        s += '<rect x="' + x + '" y="' + (ri * H) + '" width="' + w + '" height="' + H + '" fill="' + (c.kop ? '#eef2fc' : '#fff') + '" stroke="#9aa3bd"/>' +
          '<text x="' + (x + w / 2) + '" y="' + (ri * H + 22) + '" text-anchor="middle" font-size="15" font-family="Poppins,Arial,sans-serif" font-weight="' + (c.kop ? 600 : 400) + '" fill="#14224C">' + schoon(c.t) + '</text>';
        x += w; k += c.span;
      });
    });
    var sch = 2;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + Math.round((W + 8) * sch) + '" height="' + Math.round((rijen.length * H + 8) * sch) + '" viewBox="-4 -4 ' + (W + 8) + ' ' + (rijen.length * H + 8) + '"><rect x="-4" y="-4" width="' + (W + 8) + '" height="' + (rijen.length * H + 8) + '" fill="#fff"/>' + s + '</svg>';
  }

  /* de stijl van de figuren en zinnen op papier (werkblad): vaste kleuren, ook in het donker */
  var STIJL = '.ob-blad{--lr-1:#204ECF;--lr-2:#C4452A;--lr-3:#9a5c0c;--lr-4:#1f7a52;--lr-5:#7a3fb0;--lr-zacht:rgba(32,78,207,.08)}' +
    SVGREGELS.replace(/\.lr-svg/g, '.ob-blad .lr-svg') +
    '.ob-blad .lr-svg{width:100%;max-width:340px;height:auto;max-height:210px;display:block;overflow:visible;margin:6px 0}' +
    '.ob-blad .lr-tabel{border-collapse:collapse;font-variant-numeric:tabular-nums;margin:6px 0}.ob-blad .lr-tabel th,.ob-blad .lr-tabel td{padding:5px 10px;text-align:center;border:1px solid #9aa3bd;min-width:46px;color:#14224C}' +
    '.ob-blad .lr-tabel th{background:#eef2fc;font-weight:600}.ob-blad .lr-tabel td.nadruk,.ob-blad .lr-tabel th.nadruk{box-shadow:inset 0 0 0 2px var(--lr-2);font-weight:700}' +
    '.ob-blad .lr-tabel tr.pijlen td{border:none;padding:0 4px;font-size:.8rem;font-weight:700;color:var(--lr-2);text-align:left}' +
    '.ob-blad .lr-cijfer{border-collapse:collapse;font:600 1.3rem/1.2 ui-monospace,Consolas,monospace;margin:6px 0;color:#14224C}.ob-blad .lr-cijfer td{width:1.1em;text-align:center;padding:1px 0}' +
    '.ob-blad .lr-cijfer tr.onth td{font-size:.8rem;color:var(--lr-2)}.ob-blad .lr-cijfer tr.streep td{border-top:2px solid currentColor}' +
    '.ob-blad .lr-zin{display:flex;flex-wrap:wrap;gap:10px 6px;align-items:flex-start;font-size:1.05rem;line-height:1.3;margin:4px 0;color:#14224C}' +
    '.ob-blad .lr-zin .stuk{display:inline-flex;flex-direction:column;align-items:center;gap:2px}.ob-blad .lr-zin .stuk .t{padding:2px 6px;border-bottom:3px solid currentColor;color:#14224C}' +
    '.ob-blad .lr-zin .stuk small{font-size:.62rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase}' +
    '.ob-blad .lr-zin .k1{color:var(--lr-1)}.ob-blad .lr-zin .k2{color:var(--lr-2)}.ob-blad .lr-zin .k3{color:var(--lr-3)}.ob-blad .lr-zin .k4{color:var(--lr-4)}.ob-blad .lr-zin .k5{color:var(--lr-5)}' +
    '.ob-blad .lr-tekst{border:1px solid #c9d2e6;border-radius:8px;padding:8px 12px;max-width:62ch;line-height:1.55;margin:6px 0;color:#14224C}.ob-blad .lr-tekst p{margin:0 0 6px}.ob-blad .lr-tekst p:last-child{margin:0}' +
    '.ob-blad .lr-tekst mark{background:#eef2fc;color:inherit;border-bottom:2px solid var(--lr-2)}' +
    '.ob-blad .lr-context,.ob-blad .lr-uitdoel{display:block;font-size:.86rem;color:#4a5270;margin-bottom:2px}';

  return { vakken:['rekenen', 'nederlands', 'wiskunde'], VAKNAAM:VAKNAAM, VAN:VAN,
    boek:boek, paragraaf:paragraaf, paragrafen:paragrafen, laad:laad, doel:doel,
    opgaven:opgaven, uitleg:uitleg, beeld:beeld, eind:eind, keuzes:keuzes, goedeAntwoorden:goedeAntwoorden, echteStappen:echteStappen, stapAntwoord:stapAntwoord,
    vraagHtml:vraagHtml, kaal:kaal, schoon:schoon, schud:schud, losseSvg:losseSvg, STIJL:STIJL };
})();
