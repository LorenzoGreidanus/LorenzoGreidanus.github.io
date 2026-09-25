/* Het naamfilter: houdt racistische en andere haatdragende termen, en
   scheldwoorden en ziektes als scheldwoord, uit bijnamen en uit tekst die
   de klas ziet (de gokken in Tekenslag), ook als ze verstopt zijn met
   cijfers, tekens, spaties, accenten of herhaalde letters.

   Werkwijze: de naam wordt eerst genormaliseerd (kleine letters, accenten
   weg, cijfers en tekens die op letters lijken vertaald, alles wat geen
   letter is weg, drie of meer dezelfde letters achter elkaar ingekort tot
   twee), en daarna vergeleken met een lijst. Lange termen tellen als ze
   ergens in de naam voorkomen, korte termen alleen als de hele naam ze is,
   anders wordt "spice" of "raccoon" ook tegengehouden.

   Dit bestand is de bron; server/maak-filter.js maakt er de browserversie
   leermiddelen/naamfilter.js van. Pas de lijst hier aan en draai dat script. */

/* tekens die als letter gebruikt worden om een filter te omzeilen */
const LEET = { "0": "o", "1": "i", "2": "z", "3": "e", "4": "a", "5": "s", "6": "g", "7": "t", "8": "b", "9": "g",
  "@": "a", "$": "s", "!": "i", "|": "l", "€": "e", "£": "l", "+": "t", "(": "c", "<": "c", "¢": "c", "ß": "ss" };

/* termen die overal in de naam mogen voorkomen (vijf letters of meer) */
const LANG = [
  "nigger", "nigga", "niggr", "neger", "nikker", "negerin", "zwartjoekel", "bosneger", "zandneger",
  "kaffer", "kaffir", "spleetoog", "spleetogen", "poepchinees", "chink", "chinky", "gook", "wetback", "beaner",
  "raghead", "towelhead", "darkie", "darky", "tarbaby", "junglebunny", "porchmonkey", "sandnigger", "roetmop",
  "kutmarokkaan", "kutturk", "kutneger", "kutjood", "kutmoslim", "kutbuitenlander",
  "kankermarokkaan", "kankerturk", "kankerneger", "kankerjood", "kankermoslim", "kankerbuitenlander",
  "vuilejood", "teringjood", "jodenhater", "jodenvreter", "untermensch", "whitepower", "heilhitler", "hitler",
  "nazi", "neonazi", "siegheil", "sigheil", "zieghail", "swastika", "hakenkruis", "nsb", "kutneger",
  "mongool", "mongooltje", "spast", "spastisch", "kanker", "kankerlijer", "teringlijer", "tyfuslijer",
  "hoer", "hoeren", "slet", "kutwijf", "nsbr",
  /* schelden met wie iemand is */
  "homo", "homos", "homofiel", "flikker", "flikkers", "mietje", "faggot", "dyke", "retard", "pedo", "pedofiel",
  /* ziektes als scheldwoord, en de afkortingen ervan */
  "kkr", "kankr", "tyfus", "tering", "kolere", "klerelijer", "pleuris", "pokke",
  /* engels */
  "fuck", "fucker", "bitch", "cunt", "kutkind", "kutjood"
];
/* korte of gevoelige termen: alleen als de hele naam eruit bestaat */
const HEEL = [ "spic", "paki", "coon", "coons", "kkk", "jood", "joden", "jew", "jews", "kike", "nsb", "wog", "gyp", "sieg", "heil", "kut", "hoer", "slet", "fag", "lul", "kk", "gvd", "tyf" ];
/* De klankvorm vangt de truc waar de gewone vorm langs loopt: er een letter
   bij zetten die je toch niet hoort. "Niegggaaa" is geen "nigga" zolang je
   letter voor letter vergelijkt, maar wel zodra je klinkers die achter elkaar
   staan als een klank leest. Daarom gaat elke rij klinkers terug naar de
   eerste ervan, en wordt y een i. Alleen de termen hieronder worden zo
   vergeleken: bij korte woorden levert deze vorm te veel onschuldige treffers
   op ("gook" wordt dan "gok", en dan is een gokker ook fout). */
const HARD = [
  "nigger", "nigga", "niggr", "neger", "negerin", "nikkerin",
  "sandnigger", "zandneger", "bosneger", "kutneger", "kankerneger", "roetmop", "zwartjoekel",
  "spleetoog", "spleetogen", "poepchinees", "junglebunny", "porchmonkey", "towelhead",
  "raghead", "tarbaby", "kaffer", "kaffir",
  "homo", "tifus", "flikker", "kolere", "pleuris"
];
/* korte klankvormen die alleen als de hele naam tellen: "Nieger" is een truc,
   "Nigeria" is een land en blijft dus gewoon toegestaan. */
const HARDHEEL = [ "niger", "nigr", "niga", "nigga", "negr" ];

/* Woorden die door een van de regels hierboven vallen maar niets te maken
   hebben met wat dit filter tegenhoudt. Ze tellen alleen als de hele naam
   eruit bestaat, dus "kutknikker" komt er nog steeds niet door. */
const TOEGESTAAN = [
  "knikker", "knikkers", "knikkeren", "knikkerkoning", "knikkerkampioen",
  "gokker", "gokkers", "gokken", "gokkast", "goochelaar",
  "nigeria", "nigeriaan", "nigeriaans", "nigeriaanse",
  "catering", "katering", "watering", "mastering", "pokemon"
];

/* codes met cijfers, gecontroleerd op de versie waarin cijfers cijfers blijven */
const CODES = [ "1488", "14 88", "88 14" ];

/* letters, met leet-tekens vertaald, zonder de inkorting van herhalingen */
function ruw(naam){
  let s = String(naam || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/./g, c => LEET[c] !== undefined ? LEET[c] : c);
  return s.replace(/[^a-z]/g, "");
}
export function normaliseer(naam){
  return ruw(naam).replace(/(.)\1{2,}/g, "$1$1");
}
/* derde vorm: op klank. Rijen van dezelfde letter worden twee, y wordt i, en
   elke rij klinkers wordt de eerste klinker ervan. "Niegggaaa" en "nigga"
   komen zo allebei op "nigga" uit. */
function klank(naam){
  let s = ruw(naam).replace(/y/g, "i");
  s = s.replace(/(.)\1{2,}/g, "$1$1");
  return s.replace(/[aeiou]{2,}/g, m => m[0]);
}

/* tweede vorm: cijfers blijven staan, voor codes als 1488 */
function metCijfers(naam){
  return String(naam || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

export function verboden(naam){
  const r = ruw(naam), n = normaliseer(naam), c = metCijfers(naam), k = klank(naam);
  if (!n && !c) return false;
  /* een gewoon woord dat toevallig op een regel hieronder past, mag */
  if (TOEGESTAAN.includes(n) || TOEGESTAAN.includes(k)) return false;
  /* op klank: hier zit de truc met een extra letter erin */
  for (const t of HARD){ if (k.includes(klank(t))) return true; }
  for (const t of HARDHEEL){ if (k === t) return true; }
  /* Herhaalde letters weghalen vangt "nigerr" en "negerrr", maar alleen als
     de naam zelf herhalingen heeft: "Nigeria" heeft ze niet en blijft gewoon
     een land. */
  const kaal = n.replace(/(.)\1+/g, "$1"), herhaalt = kaal !== n;
  /* de kale vorm alleen bij langere termen: "kkr" zou als "kr" in elke naam zitten */
  for (const t of LANG){ if (n.includes(t) || (herhaalt && t.length >= 5 && kaal.includes(t.replace(/(.)\1+/g, "$1")))) return true; }
  for (const t of HEEL){ if (n === t || r === t || kaal === t) return true; }
  for (const t of CODES){ if (c.includes(t.replace(/\s/g, ""))) return true; }
  return false;
}

/* Tekst die de klas te zien krijgt, zoals een gok in Tekenslag: fout als de
   hele tekst of een van de woorden erin niet door het filter komt. Per woord
   ook, omdat "jij kut" als geheel langs de termen loopt die alleen als hele
   naam tellen. */
export function vies(tekst){
  const s = String(tekst || "");
  if (verboden(s)) return true;
  return s.split(/[^a-zA-Z0-9\u00c0-\u024f@$!|€£+(<¢ß]+/).some(w => w && verboden(w));
}

/* een nette naam: geschoond, en vervangen als hij niet door het filter komt */
export function nette(naam, anders){
  /* Punthaken en aanhalingstekens gaan eruit. Een bijnaam heeft ze nergens
     voor nodig, en ze stonden bij de anderen in beeld op plekken waar de naam
     als opmaak werd geplakt in plaats van als tekst. De & blijft: die kan in
     zijn eentje geen element beginnen, en Tom & Jerry mag gewoon. */
  const s = String(naam || "").replace(/[\u0000-\u001f\u007f<>"'`]/g, "").replace(/\s+/g, " ").trim().slice(0, 16);
  if (!s) return anders || "Leerling";
  return verboden(s) ? (anders || "Leerling") : s;
}
