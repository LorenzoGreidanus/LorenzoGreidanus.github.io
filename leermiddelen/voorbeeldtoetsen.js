/* Drie voorbeeldtoetsen, om te laten zien wat je met eigen materiaal kunt:
   Nederlands, Rekenen en Geschiedenis, elk met meerkeuze, open vragen en de
   sleepvragen (koppelen, volgorde, groepen, gatentekst). Ze staan in de
   browser, niet op de server: je opent ze op oefen.html met hun code, en in
   maken.html zet je er met een klik een kopie van in je eigen materiaal om
   ze aan te passen of als toets te gebruiken.

   De codes eindigen op een 1; de server maakt nooit een code met een 1 erin,
   dus ze botsen niet met echt materiaal. */
var VOORBEELDTOETSEN = {
  VBNED1: {
    code: 'VBNED1', soort: 'oefening', naam: 'Voorbeeld Nederlands: spelling en lezen', vak: 'ned', modus: 'oefenen', voorbeeld: true,
    uitleg: 'Tien vragen over werkwoordspelling, verwijswoorden, signaalwoorden en zinsdelen, zoals in leerjaar 2 en 3 van het vmbo.',
    items: [
      { vorm: 'mk', vraag: 'Welke zin is goed gespeld?', goed: 'Hij wordt morgen zestien.', fout: ['Hij word morgen zestien.', 'Hij wordt morgen zestien', 'Hij wortd morgen zestien.'],
        uitleg: 'Hij is de derde persoon: stam + t. De stam is word, dus hij wordt. Een zin eindigt met een punt.' },
      { vorm: 'mk', vraag: 'Ik heb gisteren de hele middag ... (fietsen)', goed: 'gefietst', fout: ['gefietsd', 'gefietsed', 'gefiets'],
        uitleg: '\'t Kofschip: de stam fiets eindigt op een s, en die zit in \'t kofschip. Dus een t: gefietst.' },
      { vorm: 'koppel', vraag: 'Koppel elk werkwoord aan de goede vorm bij "hij".', paren: [{ a: 'antwoorden', b: 'hij antwoordt' }, { a: 'vinden', b: 'hij vindt' }, { a: 'praten', b: 'hij praat' }, { a: 'rijden', b: 'hij rijdt' }],
        uitleg: 'Bij hij, zij en het: stam + t. Eindigt de stam al op een t (praat), dan komt er niets bij.' },
      { vorm: 'gaten', vraag: 'Sleep het goede signaalwoord in elk gat.', tekst: 'Ik wilde naar buiten, [maar] het regende. [Daarom] bleef ik binnen. Ik las een boek, [want] ik verveelde me. [Toen] het droog werd, ging ik alsnog.', extra: ['omdat', 'hoewel'],
        uitleg: 'Maar geeft een tegenstelling, daarom een gevolg, want een reden, toen een tijd. Omdat past ook bij een reden, maar dan staat het werkwoord achteraan: omdat ik me verveelde.' },
      { vorm: 'groepen', vraag: 'Zet elk woord in de goede woordsoort.', groepen: [{ naam: 'zelfstandig naamwoord', dingen: ['fiets', 'vrijheid', 'Amsterdam'] }, { naam: 'werkwoord', dingen: ['lopen', 'wordt', 'gezien'] }, { naam: 'bijvoeglijk naamwoord', dingen: ['blauwe', 'snel', 'oude'] }],
        uitleg: 'Een zelfstandig naamwoord kun je een lidwoord geven (de fiets, de vrijheid). Een werkwoord kun je vervoegen (ik loop, hij loopt). Een bijvoeglijk naamwoord zegt iets over een zelfstandig naamwoord (de blauwe fiets).' },
      { vorm: 'volgorde', vraag: 'Zet de zinnen in de goede volgorde, zodat het een logisch verhaal wordt.', stappen: ['Sanne wilde graag een huisdier.', 'Ze vroeg het aan haar ouders.', 'Die zeiden dat ze eerst moest sparen.', 'Na een half jaar had ze genoeg geld.', 'Nu heeft ze een konijn dat Bram heet.'],
        uitleg: 'Let op de signaalwoorden en verwijswoorden: "ze vroeg het" verwijst naar het huisdier, "die zeiden" naar haar ouders, "na een half jaar" komt na het sparen.' },
      { vorm: 'open', vraag: 'Wat is het onderwerp in deze zin? "Na school fietsen mijn zus en ik altijd samen naar huis."', antwoorden: ['mijn zus en ik', 'Mijn zus en ik'],
        uitleg: 'Vraag: wie of wat fietsen? Mijn zus en ik. Het onderwerp is het hele deel dat het antwoord geeft, niet alleen "ik".' },
      { vorm: 'mk', vraag: 'Waar verwijst "die" naar in de zin: "De leraar gaf een opdracht die niemand begreep"?', goed: 'de opdracht', fout: ['de leraar', 'niemand', 'de klas'],
        uitleg: 'Een verwijswoord verwijst meestal naar het woord dat er vlak voor staat: die opdracht begreep niemand.' },
      { vorm: 'koppel', vraag: 'Koppel het signaalwoord aan het verband dat het aangeeft.', paren: [{ a: 'omdat', b: 'reden' }, { a: 'daardoor', b: 'gevolg' }, { a: 'bijvoorbeeld', b: 'voorbeeld' }, { a: 'eerst, daarna', b: 'tijd' }, { a: 'maar', b: 'tegenstelling' }],
        uitleg: 'Signaalwoorden zeggen hoe twee stukken tekst bij elkaar horen. Bij een tekstvraag is dat vaak de sleutel tot het antwoord.' },
      { vorm: 'open', vraag: 'Schrijf de zin over met de goede spelling van het werkwoord: "Jij vind dat niet leuk."', antwoorden: ['Jij vindt dat niet leuk.', 'Jij vindt dat niet leuk', 'jij vindt dat niet leuk'],
        uitleg: 'Bij jij vóór het werkwoord: stam + t, net als bij hij. Alleen als jij erachter staat (vind jij?) valt de t weg.' }
    ]
  },
  VBREK1: {
    code: 'VBREK1', soort: 'oefening', naam: 'Voorbeeld Rekenen: breuken, procenten en cijferen', vak: 'reken', modus: 'oefenen', voorbeeld: true,
    uitleg: 'Tien vragen over breuken, procenten, verhoudingen en het DHTE-schema, op het niveau van vmbo-kgt.',
    items: [
      { vorm: 'mk', vraag: 'Welk cijfer staat bij de honderdtallen in 4.728?', goed: '7', fout: ['4', '2', '8'],
        uitleg: 'Van rechts naar links: eenheden (8), tientallen (2), honderdtallen (7), duizendtallen (4).' },
      { vorm: 'open', vraag: 'Reken uit: 486 + 357', antwoorden: ['843'],
        uitleg: 'Van rechts naar links. 6 + 7 = 13: schrijf 3, onthoud 1. 8 + 5 + 1 = 14: schrijf 4, onthoud 1. 4 + 3 + 1 = 8. Samen 843.' },
      { vorm: 'koppel', vraag: 'Koppel elke breuk aan het percentage dat even groot is.', paren: [{ a: '1/2', b: '50%' }, { a: '1/4', b: '25%' }, { a: '3/4', b: '75%' }, { a: '1/5', b: '20%' }, { a: '1/10', b: '10%' }],
        uitleg: 'Procent betekent per honderd. 1/4 van 100 is 25, dus 1/4 = 25%. 1/5 van 100 is 20.' },
      { vorm: 'volgorde', vraag: 'Zet de getallen op volgorde van klein naar groot.', stappen: ['0,25', '1/2', '0,7', '3/4', '1'],
        uitleg: 'Maak er allemaal kommagetallen van: 1/2 = 0,5 en 3/4 = 0,75. Dan zie je de volgorde: 0,25 - 0,5 - 0,7 - 0,75 - 1.' },
      { vorm: 'groepen', vraag: 'Is de breuk kleiner dan 1, precies 1 of groter dan 1?', groepen: [{ naam: 'kleiner dan 1', dingen: ['2/3', '5/8', '9/10'] }, { naam: 'precies 1', dingen: ['4/4', '7/7'] }, { naam: 'groter dan 1', dingen: ['5/4', '9/6', '11/10'] }],
        uitleg: 'Kijk naar teller en noemer. Teller kleiner dan noemer: minder dan een heel. Gelijk: precies een heel. Teller groter: meer dan een heel.' },
      { vorm: 'gaten', vraag: 'Sleep de goede getallen in de berekening.', tekst: 'Een broek kost 60 euro en is 25% goedkoper. 25% van 60 is [15] euro. De broek kost nu [45] euro.', extra: ['25', '35', '20'],
        uitleg: '25% is een kwart. Een kwart van 60 is 60 : 4 = 15. Dat gaat eraf: 60 - 15 = 45.' },
      { vorm: 'mk', vraag: 'Reken uit: 3/8 + 1/4', goed: '5/8', fout: ['4/12', '4/8', '1/2'],
        uitleg: 'Eerst gelijknamig maken: 1/4 = 2/8. Dan de tellers optellen: 3/8 + 2/8 = 5/8. Nooit de noemers optellen.' },
      { vorm: 'open', vraag: 'In een klas van 28 leerlingen is 3/4 op de fiets gekomen. Hoeveel leerlingen zijn dat?', antwoorden: ['21', '21 leerlingen'],
        uitleg: 'Eerst 1/4: 28 : 4 = 7. Dan 3/4: 3 x 7 = 21.' },
      { vorm: 'mk', vraag: 'Een recept voor 4 personen gebruikt 300 gram rijst. Hoeveel rijst is er nodig voor 6 personen?', goed: '450 gram', fout: ['400 gram', '600 gram', '350 gram'],
        uitleg: 'Ga terug naar 1 persoon: 300 : 4 = 75 gram. Dan 6 personen: 6 x 75 = 450 gram. Dit heet een verhoudingstabel.' },
      { vorm: 'open', vraag: 'Reken uit: 703 - 458', antwoorden: ['245'],
        uitleg: 'Van rechts naar links, met lenen. 3 - 8 gaat niet: leen 1 tiental, 13 - 8 = 5. De 0 is nu 9 (er is geleend), en 9 - 5 = 4. Dan 6 - 4 = 2. Samen 245.' }
    ]
  },
  VBGES1: {
    code: 'VBGES1', soort: 'oefening', naam: 'Voorbeeld Geschiedenis: tijdvakken en bronnen', vak: 'ges', modus: 'oefenen', voorbeeld: true,
    uitleg: 'Tien vragen over de tijdvakken, de Franse Revolutie en het werken met bronnen, voor leerjaar 2 en 3.',
    items: [
      { vorm: 'volgorde', vraag: 'Zet de tijdvakken in de goede volgorde, van vroeg naar laat.', stappen: ['jagers en boeren', 'Grieken en Romeinen', 'monniken en ridders', 'steden en staten', 'ontdekkers en hervormers'],
        uitleg: 'De eerste vijf tijdvakken: prehistorie, oudheid, vroege middeleeuwen, late middeleeuwen en de tijd van ontdekkingsreizen en de reformatie (1500-1600).' },
      { vorm: 'koppel', vraag: 'Koppel elk begrip aan de goede uitleg.', paren: [{ a: 'bron', b: 'iets uit het verleden waar je informatie uit haalt' }, { a: 'standplaatsgebondenheid', b: 'je kijk op iets hangt af van wie je bent en waar je leeft' }, { a: 'oorzaak', b: 'waardoor iets gebeurt' }, { a: 'gevolg', b: 'wat er door iets gebeurt' }],
        uitleg: 'Deze begrippen kom je bij elke bronvraag tegen. Standplaatsgebondenheid verklaart waarom twee mensen hetzelfde anders beschrijven.' },
      { vorm: 'groepen', vraag: 'Is het een primaire of een secundaire bron?', groepen: [{ naam: 'primaire bron (uit de tijd zelf)', dingen: ['een dagboek uit 1944', 'een foto van de bevrijding', 'een pamflet uit 1789'] }, { naam: 'secundaire bron (later gemaakt)', dingen: ['een schoolboek', 'een documentaire uit 2020', 'een artikel van een historicus'] }],
        uitleg: 'Een primaire bron is gemaakt in de tijd waar het over gaat. Een secundaire bron is later gemaakt, door iemand die de bronnen bestudeerde.' },
      { vorm: 'gaten', vraag: 'Sleep de goede woorden in de tekst over de Franse Revolutie.', tekst: 'In [1789] bestormden Parijzenaars de [Bastille]. De Franse samenleving was verdeeld in drie [standen]. De derde stand betaalde bijna alle [belasting], maar had weinig te zeggen.', extra: ['1815', 'Versailles', 'adel'],
        uitleg: 'De bestorming van de Bastille op 14 juli 1789 geldt als het begin van de Franse Revolutie. De drie standen waren de geestelijkheid, de adel en de rest: boeren, burgers en arbeiders.' },
      { vorm: 'mk', vraag: 'Welke uitvinding hoort bij het tijdvak van ontdekkers en hervormers?', goed: 'de boekdrukkunst', fout: ['de stoommachine', 'de computer', 'het buskruit in China'],
        uitleg: 'Rond 1450 drukte Gutenberg boeken met losse letters. Zo verspreidden ideeën, ook die van Luther, veel sneller. De stoommachine hoort bij burgers en stoommachines (1800-1900).' },
      { vorm: 'open', vraag: 'In welk jaar begon de Tweede Wereldoorlog in Nederland?', antwoorden: ['1940', 'in 1940', 'mei 1940'],
        uitleg: 'Op 10 mei 1940 viel Duitsland Nederland binnen. De oorlog zelf begon in september 1939 met de inval in Polen.' },
      { vorm: 'volgorde', vraag: 'Zet de gebeurtenissen in de goede volgorde.', stappen: ['de Eerste Wereldoorlog (1914-1918)', 'de beurskrach in New York (1929)', 'Hitler wordt rijkskanselier (1933)', 'de Duitse inval in Polen (1939)', 'de bevrijding van Nederland (1945)'],
        uitleg: 'Let op de jaartallen. De crisis van 1929 hielp Hitler aan de macht; zijn inval in Polen begon de Tweede Wereldoorlog.' },
      { vorm: 'mk', vraag: 'Een historicus wil weten hoe een boer in 1650 leefde. Welke bron is daarvoor het meest bruikbaar?', goed: 'een boedelbeschrijving van een boerderij uit 1652', fout: ['een schilderij van een koning uit 1650', 'een film over de Gouden Eeuw', 'een reisgids van Amsterdam uit 2019'],
        uitleg: 'Bruikbaar is een bron die over precies dat onderwerp gaat en uit die tijd komt. Een boedelbeschrijving somt alle spullen van een boerderij op.' },
      { vorm: 'koppel', vraag: 'Koppel de persoon aan wat hij deed.', paren: [{ a: 'Willem van Oranje', b: 'leidde de opstand tegen Spanje' }, { a: 'Maarten Luther', b: 'begon de reformatie met zijn 95 stellingen' }, { a: 'Napoleon', b: 'werd keizer van Frankrijk' }, { a: 'Columbus', b: 'voer in 1492 naar Amerika' }],
        uitleg: 'Vier namen uit vier tijdvakken: Columbus en Luther (ontdekkers en hervormers), Willem van Oranje (regenten en vorsten), Napoleon (pruiken en revoluties).' },
      { vorm: 'open', vraag: 'Noem een oorzaak van de Franse Revolutie.', antwoorden: [],
        uitleg: 'Goede antwoorden: de derde stand betaalde bijna alle belasting maar had geen macht; het koningshuis gaf te veel geld uit; de oogsten mislukten en brood werd te duur; de ideeën van de verlichting over gelijkheid. Deze vraag kijkt de docent zelf na.' }
    ]
  }
};
if (typeof module !== 'undefined') module.exports = VOORBEELDTOETSEN;
