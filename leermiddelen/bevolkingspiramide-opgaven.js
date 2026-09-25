/* Bevolkingspiramides: per land het aandeel van de bevolking per
   leeftijdsgroep van tien jaar, mannen en vrouwen apart, in procenten van de
   hele bevolking. De cijfers zijn afgerond en bij benadering (rond 2022, naar
   de gegevens van de Verenigde Naties), zoals in een schoolatlas: de vorm is
   wat telt. soort: groei (piramide), stabiel (klok) of krimp (urn). */
window.PIRAMIDES = [
  { land:'Niger', soort:'groei', uit:'heel brede basis: veel kinderen, weinig ouderen', levensverwachting:62, geboorte:45, sterfte:9,
    m:[10.0, 7.2, 5.4, 3.9, 2.7, 1.8, 1.0, 0.5, 0.2, 0.1], v:[9.8, 7.0, 5.4, 4.0, 2.8, 1.9, 1.1, 0.6, 0.3, 0.1] },
  { land:'Nigeria', soort:'groei', uit:'brede basis die naar boven snel smaller wordt', levensverwachting:54, geboorte:36, sterfte:12,
    m:[8.4, 6.7, 5.3, 4.1, 3.2, 2.3, 1.5, 0.8, 0.3, 0.1], v:[8.1, 6.4, 5.2, 4.1, 3.2, 2.3, 1.6, 0.9, 0.4, 0.1] },
  { land:'Ethiopië', soort:'groei', uit:'brede basis, elke oudere groep kleiner', levensverwachting:66, geboorte:31, sterfte:6,
    m:[7.3, 6.3, 5.5, 4.4, 3.2, 2.1, 1.4, 0.8, 0.4, 0.1], v:[7.1, 6.1, 5.4, 4.4, 3.3, 2.2, 1.5, 0.9, 0.4, 0.1] },
  { land:'India', soort:'groei', uit:'nog een brede basis, maar de jongste groepen worden al kleiner', levensverwachting:70, geboorte:17, sterfte:7,
    m:[4.4, 4.7, 4.5, 4.0, 3.4, 2.7, 2.0, 1.2, 0.5, 0.1], v:[4.1, 4.3, 4.2, 3.9, 3.4, 2.7, 2.0, 1.3, 0.6, 0.2] },
  { land:'Mexico', soort:'groei', uit:'basis wordt smaller: de groei neemt af', levensverwachting:75, geboorte:15, sterfte:7,
    m:[4.2, 4.3, 4.3, 3.9, 3.4, 2.7, 2.0, 1.2, 0.6, 0.2], v:[4.0, 4.1, 4.2, 3.9, 3.5, 2.9, 2.2, 1.5, 0.8, 0.3] },
  { land:'Brazilië', soort:'stabiel', uit:'de jongste groepen zijn niet meer de grootste: de groei stopt', levensverwachting:76, geboorte:13, sterfte:7,
    m:[3.4, 3.6, 3.9, 4.1, 3.6, 3.0, 2.2, 1.3, 0.6, 0.2], v:[3.3, 3.4, 3.8, 4.1, 3.7, 3.2, 2.5, 1.7, 0.9, 0.4] },
  { land:'Verenigde Staten', soort:'stabiel', uit:'bijna even brede groepen tot 60 jaar: een klokvorm', levensverwachting:77, geboorte:11, sterfte:10,
    m:[3.0, 3.3, 3.4, 3.5, 3.1, 3.0, 3.0, 2.2, 1.2, 0.4], v:[2.9, 3.2, 3.3, 3.4, 3.1, 3.1, 3.2, 2.6, 1.6, 0.8] },
  { land:'Nederland', soort:'stabiel', uit:'de groepen van 50 tot 70 zijn groot: de babyboom wordt ouder', levensverwachting:82, geboorte:10, sterfte:10,
    m:[2.5, 2.9, 3.2, 3.1, 3.0, 3.7, 3.2, 2.6, 1.3, 0.3], v:[2.4, 2.8, 3.1, 3.0, 3.0, 3.6, 3.2, 2.7, 1.8, 0.7] },
  { land:'Duitsland', soort:'krimp', uit:'smalle basis en een brede groep van 50 tot 65: vergrijzing', levensverwachting:81, geboorte:9, sterfte:12,
    m:[2.4, 2.4, 2.9, 3.3, 3.0, 4.0, 3.4, 2.5, 1.3, 0.3], v:[2.3, 2.3, 2.8, 3.1, 2.9, 4.0, 3.5, 2.9, 2.0, 0.8] },
  { land:'Japan', soort:'krimp', uit:'smalle basis, brede top: een urn', levensverwachting:84, geboorte:7, sterfte:12,
    m:[2.0, 2.2, 2.4, 2.9, 3.7, 3.4, 2.9, 3.5, 2.1, 0.6], v:[1.9, 2.1, 2.3, 2.8, 3.6, 3.4, 3.0, 3.9, 3.0, 1.4] },
  { land:'Italië', soort:'krimp', uit:'weinig kinderen, veel vijftigers en zestigers', levensverwachting:83, geboorte:7, sterfte:12,
    m:[1.9, 2.3, 2.5, 2.8, 3.4, 4.0, 3.2, 2.7, 1.7, 0.5], v:[1.8, 2.2, 2.4, 2.8, 3.5, 4.1, 3.4, 3.2, 2.4, 1.1] },
  { land:'Zuid-Korea', soort:'krimp', uit:'heel smalle basis: het geboortecijfer is het laagste ter wereld', levensverwachting:83, geboorte:5, sterfte:7,
    m:[1.8, 2.2, 3.2, 3.5, 4.1, 4.3, 3.4, 2.1, 1.0, 0.2], v:[1.7, 2.1, 3.0, 3.3, 4.0, 4.3, 3.5, 2.4, 1.5, 0.6] }
];
/* de cijfers zijn geschat per groep; hier worden ze per land geschaald zodat mannen en vrouwen samen precies 100 procent zijn */
window.PIRAMIDES.forEach(function(l){ var t = 0; l.m.forEach(function(x){ t += x; }); l.v.forEach(function(x){ t += x; }); l.m = l.m.map(function(x){ return Math.round(x * 1000 / t) / 10; }); l.v = l.v.map(function(x){ return Math.round(x * 1000 / t) / 10; }); });
window.PIRAMIDE_GROEPEN = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90+'];
